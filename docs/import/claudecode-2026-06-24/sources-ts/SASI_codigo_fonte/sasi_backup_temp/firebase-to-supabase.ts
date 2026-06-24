// ============================================================================
// src/lib/migration/firebase-to-supabase.ts
// ----------------------------------------------------------------------------
// Script de migração one-shot: puxa TODOS os pacientes do Firebase Realtime DB,
// transforma no novo schema SASI e insere no Supabase via `importFromFirebase`.
//
// Estratégia: DUAL-WRITE por 7 dias, depois DECOMMISSION.
//
//   D+0:  roda este script (migração inicial — ESCREVE em ambos)
//   D+1-7: cada triggerUpdatePatient escreve em Firebase E Supabase
//   D+7:  read migration — App.tsx lê do Supabase Realtime apenas
//   D+14: decommission Firebase se 0 discrepâncias
//
// Uso:
//   1. Import no App.tsx: import { runMigration } from './lib/migration/firebase-to-supabase';
//   2. Adicionar botão no Dashboard: <button onClick={runMigration}>Migrar Firebase</button>
//   3. Ou rodar no console: `await runMigration()`
// ============================================================================

import { ref, get, DataSnapshot } from 'firebase/database';
import { database as firebaseDB } from '../../firebase';
import { supabase } from '../supabaseClient';
import { useSupabasePatients } from '../../hooks/useSupabasePatients';

// ============================================================================
// TIPOS
// ============================================================================
interface FirebasePatient {
  leito?: string;
  uti?: string;
  nome?: string;
  idade?: number | string;
  peso?: string;
  altura?: string;
  hd?: string;
  adm?: string;
  alergias?: string;
  neuro?: Record<string, unknown>;
  resp?: Record<string, unknown>;
  hemo?: Record<string, unknown>;
  tgi?: Record<string, unknown>;
  renal?: Record<string, unknown>;
  hemato?: Record<string, unknown>;
  infecto?: Record<string, unknown>;
  dvas?: unknown[];
  sedativos?: unknown[];
  impressao?: string[];
  conduta?: string[];
  pendencias?: unknown[];
}

interface MigrationReport {
  total_firebase: number;
  migrados_ok: number;
  falhas: number;
  duplicados_pulados: number;
  detalhes_falhas: Array<{ leito: string; motivo: string }>;
  inicio: string;
  fim: string;
  duracao_ms: number;
}

// ============================================================================
// NORMALIZAÇÃO DE UTI (Firebase tinha "UTI-1", novo schema exige "UTI2/3/4")
// ============================================================================
function normalizeUTI(raw: string | undefined): 'UTI2' | 'UTI3' | 'UTI4' | null {
  if (!raw) return null;
  const clean = raw.toUpperCase().replace(/[\s\-_]/g, '');
  if (clean === 'UTI2' || clean === 'UTI02') return 'UTI2';
  if (clean === 'UTI3' || clean === 'UTI03') return 'UTI3';
  if (clean === 'UTI4' || clean === 'UTI04') return 'UTI4';
  // Fallback: se o campo nao existe ou eh legado, distribuir por leito
  // (heurística: leito <= 12 → UTI2; 13-25 → UTI3; 26-33 → UTI4)
  return null;
}

function inferUTIFromLeito(leito: string | undefined): 'UTI2' | 'UTI3' | 'UTI4' {
  const n = parseInt((leito ?? '').replace(/[^0-9]/g, ''), 10);
  if (isNaN(n)) return 'UTI2';
  if (n <= 12) return 'UTI2';
  if (n <= 25) return 'UTI3';
  return 'UTI4';
}

// ============================================================================
// CHECK: paciente já existe no Supabase? (idempotência)
// ============================================================================
async function pacienteJaMigrado(uti: string, leito: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('pacientes')
    .select('id')
    .eq('uti', uti)
    .eq('leito', leito)
    .eq('status_leito', 'ativo')
    .maybeSingle();
  if (error) {
    console.warn('[MIGRAÇÃO] Erro checando duplicata:', error.message);
    return false;
  }
  return !!data;
}

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================
export async function runMigration(options?: {
  dryRun?: boolean;          // true = só imprime o que faria
  userIdOverride?: string;   // força user_id específico (default: auth.uid() atual)
}): Promise<MigrationReport> {
  const dryRun = options?.dryRun ?? false;
  const inicio = new Date().toISOString();
  const t0 = performance.now();

  console.log(
    `%c🪖 [SASI MIGRATION] Iniciando${dryRun ? ' (DRY RUN)' : ''}...`,
    'color: #F59E0B; font-weight: bold; font-size: 14px'
  );

  // ─── 1. Autenticação ────────────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser();
  const user_id = options?.userIdOverride ?? user?.id;

  if (!user_id) {
    throw new Error('❌ Sem usuário autenticado no Supabase. Faça login antes de migrar.');
  }
  console.log(`[MIGRAÇÃO] user_id alvo: ${user_id}`);

  // ─── 2. Puxar do Firebase ──────────────────────────────────────────────
  // Estrutura esperada: /artifacts/comando-uti-alpha/users/{uid}/patients/{patientId}
  const firebasePath = `/artifacts/comando-uti-alpha/users/${user_id}/patients`;
  let snapshot: DataSnapshot;
  try {
    snapshot = await get(ref(firebaseDB, firebasePath));
  } catch (err) {
    throw new Error(`❌ Falha ao ler Firebase em ${firebasePath}: ${(err as Error).message}`);
  }

  if (!snapshot.exists()) {
    console.warn('[MIGRAÇÃO] Nenhum paciente encontrado no Firebase.');
    return {
      total_firebase: 0,
      migrados_ok: 0,
      falhas: 0,
      duplicados_pulados: 0,
      detalhes_falhas: [],
      inicio,
      fim: new Date().toISOString(),
      duracao_ms: performance.now() - t0,
    };
  }

  const firebaseData = snapshot.val() as Record<string, FirebasePatient>;
  const pacientes = Object.entries(firebaseData);
  console.log(`[MIGRAÇÃO] ${pacientes.length} pacientes encontrados no Firebase.`);

  // ─── 3. Processar cada um ───────────────────────────────────────────────
  const report: MigrationReport = {
    total_firebase: pacientes.length,
    migrados_ok: 0,
    falhas: 0,
    duplicados_pulados: 0,
    detalhes_falhas: [],
    inicio,
    fim: '',
    duracao_ms: 0,
  };

  for (const [firebaseId, fp] of pacientes) {
    const leito = fp.leito ?? firebaseId;
    const uti = normalizeUTI(fp.uti) ?? inferUTIFromLeito(leito);

    try {
      // Idempotência: pula se já existe
      if (!dryRun && (await pacienteJaMigrado(uti, leito))) {
        console.log(`[MIGRAÇÃO] ⏭️  ${leito} (${uti}) já migrado — pulando.`);
        report.duplicados_pulados++;
        continue;
      }

      if (dryRun) {
        console.log(
          `[DRY RUN] Migraria: ${fp.nome ?? '(sem nome)'} @ ${uti} leito ${leito}`
        );
        report.migrados_ok++;
        continue;
      }

      // ─── 3a. Criar paciente ─────────────────────────────────────────────
      const pacData = {
        user_id,
        uti,
        leito,
        nome: fp.nome ?? 'Paciente Migrado',
        idade: fp.idade ? Number(fp.idade) : null,
        peso: fp.peso ? parseFloat(fp.peso.replace(',', '.')) : null,
        altura: fp.altura ? parseFloat(fp.altura.replace(',', '.')) : null,
        hd: fp.hd ?? null,
        alergias: fp.alergias ?? null,
        data_adm: fp.adm
          ? new Date(fp.adm).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        gravidade: 'grave' as const,   // conservador; usuário reajusta
        status_leito: 'ativo' as const,
      };

      const { data: novoPac, error: errPac } = await supabase
        .from('pacientes')
        .insert(pacData)
        .select('id')
        .single();

      if (errPac || !novoPac) {
        throw new Error(`paciente insert: ${errPac?.message}`);
      }

      // ─── 3b. Criar evolução inicial ─────────────────────────────────────
      const { error: errEvo } = await supabase.from('evolucoes').insert({
        paciente_id: novoPac.id,
        user_id,
        plantao: 'manha',
        neuro: fp.neuro ?? {},
        resp: fp.resp ?? {},
        hemo: fp.hemo ?? {},
        tgi: fp.tgi ?? {},
        renal: fp.renal ?? {},
        hemato: fp.hemato ?? {},
        infecto: fp.infecto ?? {},
        dvas: fp.dvas ?? [],
        sedativos: fp.sedativos ?? [],
        impressao: fp.impressao ?? [],
        conduta: fp.conduta ?? [],
      });

      if (errEvo) {
        console.warn(
          `[MIGRAÇÃO] ⚠️  ${leito}: paciente criado mas evolução falhou: ${errEvo.message}`
        );
      }

      // ─── 3c. Migrar pendências ──────────────────────────────────────────
      const pendencias = fp.pendencias ?? [];
      for (const p of pendencias) {
        const pd = p as Record<string, unknown>;
        await supabase.from('pendencias').insert({
          paciente_id: novoPac.id,
          user_id,
          tarefa:
            (pd.tarefa as string) ??
            (pd.text as string) ??
            'Pendência migrada sem texto',
          prioridade: 2,
          concluida: Boolean(pd.concluida ?? pd.done ?? false),
        });
      }

      report.migrados_ok++;
      console.log(
        `[MIGRAÇÃO] ✅ ${fp.nome ?? '(sem nome)'} @ ${uti} leito ${leito} — ${pendencias.length} pendências`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      report.falhas++;
      report.detalhes_falhas.push({ leito: `${uti}:${leito}`, motivo: msg });
      console.error(`[MIGRAÇÃO] ❌ ${uti} leito ${leito}: ${msg}`);
    }
  }

  report.fim = new Date().toISOString();
  report.duracao_ms = performance.now() - t0;

  // ─── 4. Sumário final ───────────────────────────────────────────────────
  console.log(
    `%c🎖️ [SASI MIGRATION] Concluída em ${(report.duracao_ms / 1000).toFixed(1)}s`,
    'color: #10B981; font-weight: bold; font-size: 14px'
  );
  console.table({
    'Total Firebase': report.total_firebase,
    'Migrados OK': report.migrados_ok,
    'Duplicados (pulados)': report.duplicados_pulados,
    'Falhas': report.falhas,
  });
  if (report.falhas > 0) {
    console.warn('[MIGRAÇÃO] Detalhes das falhas:', report.detalhes_falhas);
  }

  return report;
}

// ============================================================================
// Export auxiliar pra chamar de um botão React
// ============================================================================
export async function runDryRun() {
  return runMigration({ dryRun: true });
}
