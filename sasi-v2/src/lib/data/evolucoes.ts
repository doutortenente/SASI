// ============================================================================
// SASI — camada de dados: EVOLUCOES (retrato por plantao, sistemas em JSONB)
// ----------------------------------------------------------------------------
// ZERO ALUCINACAO: erro => vazio/null + console.error. sofa_total null continua null
// (hoje 0/16 evolucoes tem os 6 componentes — a tela mostra "—").
// Colunas conferidas em supabase/schema-producao-v3.sql.
// ============================================================================

import { getSupabaseServer } from "@/lib/supabase/server";
import { falhaBanco } from "@/lib/data/erros";
import type { Evolucao, Plantao } from "@/types/clinical";

const LIMITE_MAX = 1000;


/**
 * Colunas da evolucao (explicitas: se o schema mudar, o erro aparece aqui e nao na tela).
 * Manter como UMA string literal — o tipador do supabase-js so parseia literais.
 */
const COLS =
  "id,paciente_id,user_id,data_evolucao,plantao,neuro,resp,hemo,tgi,renal,hemato,infecto,dvas,sedativos,impressao,conduta,problemas_ativos,condutas_sistemas,riscos,prescricao,sofa_snapshot,sofa_total,created_at,updated_at";

// ---------------------------------------------------------------------------

/** Evolucao mais recente do paciente (data_evolucao desc). Sem evolucao => null. */
export async function getUltimaEvolucao(pacienteId: string): Promise<Evolucao | null> {
  if (!pacienteId) return null;
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("evolucoes")
    .select(COLS)
    .eq("paciente_id", pacienteId)
    .order("data_evolucao", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    throw falhaBanco("data/evolucoes", "getUltimaEvolucao", error);
  }
  return (data as Evolucao | null) ?? null;
}

/**
 * Ultima evolucao de VARIOS pacientes numa consulta so (a passagem de plantao
 * fazia 1 consulta POR LEITO — 33 leitos = 33 idas ao banco; agora e 1).
 * Busca as evolucoes dos ids ordenadas por data desc e guarda a PRIMEIRA vista
 * de cada paciente. Paciente sem evolucao simplesmente nao aparece no Map.
 */
export async function mapearUltimasEvolucoes(pacienteIds: string[]): Promise<Map<string, Evolucao>> {
  const ids = pacienteIds.filter(Boolean);
  const mapa = new Map<string, Evolucao>();
  if (ids.length === 0) return mapa;
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("evolucoes")
    .select(COLS)
    .in("paciente_id", ids)
    .order("data_evolucao", { ascending: false })
    .limit(LIMITE_MAX);
  if (error) {
    throw falhaBanco("data/evolucoes", "mapearUltimasEvolucoes", error);
  }
  for (const row of (data ?? []) as Evolucao[]) {
    if (!mapa.has(row.paciente_id)) mapa.set(row.paciente_id, row); // desc: a 1ª e a mais nova
  }
  return mapa;
}

/** Historico de evolucoes, da mais nova para a mais antiga. */
export async function listarEvolucoes(pacienteId: string, limite = 10): Promise<Evolucao[]> {
  if (!pacienteId) return [];
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("evolucoes")
    .select(COLS)
    .eq("paciente_id", pacienteId)
    .order("data_evolucao", { ascending: false })
    .limit(Math.min(limite, LIMITE_MAX));
  if (error) {
    throw falhaBanco("data/evolucoes", "listarEvolucoes", error);
  }
  return (data ?? []) as Evolucao[];
}

/** 1 evolucao pelo id (uuid) — usada pelo link "ver evolucao" do War Room. */
export async function getEvolucao(evolucaoId: string): Promise<Evolucao | null> {
  if (!evolucaoId) return null;
  const sb = await getSupabaseServer();
  const { data, error } = await sb.from("evolucoes").select(COLS).eq("id", evolucaoId).maybeSingle();
  if (error) {
    throw falhaBanco("data/evolucoes", "getEvolucao", error);
  }
  return (data as Evolucao | null) ?? null;
}

/**
 * Serie de SOFA das ultimas N evolucoes, da mais ANTIGA para a mais nova
 * (ordem de leitura de sparkline). Mantem null onde o SOFA nao foi calculavel.
 */
export interface PontoSofa {
  evolucao_id: string;
  data_evolucao: string;
  plantao: Plantao;
  sofa_total: number | null;
}

export async function serieSofaEvolucoes(pacienteId: string, limite = 10): Promise<PontoSofa[]> {
  if (!pacienteId) return [];
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("evolucoes")
    .select("id,data_evolucao,plantao,sofa_total")
    .eq("paciente_id", pacienteId)
    .order("data_evolucao", { ascending: false })
    .limit(Math.min(limite, LIMITE_MAX));
  if (error) {
    throw falhaBanco("data/evolucoes", "serieSofaEvolucoes", error);
  }
  type Linha = { id: string; data_evolucao: string; plantao: Plantao; sofa_total: number | null };
  const rows = (data ?? []) as Linha[];
  return rows
    .map((r: Linha): PontoSofa => ({
      evolucao_id: r.id,
      data_evolucao: r.data_evolucao,
      plantao: r.plantao,
      sofa_total: r.sofa_total ?? null,
    }))
    .reverse();
}
