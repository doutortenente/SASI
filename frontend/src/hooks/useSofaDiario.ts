// ============================================================================
// src/hooks/useSofaDiario.ts
// ----------------------------------------------------------------------------
// Hook complementar (molde: useClinicalAlerts.ts) — busca as linhas de
// `vw_sofa_diario` (hoje/ontem) de UM paciente e devolve o SOFA automático já
// pronto pra tela (via buildSofaAuto, motor puro em packages/clinical-engine).
//
// Realtime: `vw_sofa_diario` é VIEW (sem postgres_changes direto) — escuta a
// tabela-fonte `eventos_clinicos` e refaz a busca quando ela muda.
//
// Doutrina ZERO ALUCINAÇÃO: sem dado do dia → resultado "sem dados", nunca
// SOFA 0 implícito (ver buildSofaAuto).
// ============================================================================
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { buildSofaAuto, type SofaAutoResult, type SofaDiarioRow } from '../../../packages/clinical-engine/src/scores/sofaAuto';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type { SofaDiarioRow };

export interface UseSofaDiarioReturn {
  resultado: SofaAutoResult;
  loading: boolean;
  error: string | null;
}

/** Data local (AAAA-MM-DD) SEM shift de fuso (mesma lição do fmtDateBR). */
function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const SEM_DADOS: SofaAutoResult = buildSofaAuto(null, null);

export function useSofaDiario(pacienteId: string | null | undefined): UseSofaDiarioReturn {
  const [resultado, setResultado] = useState<SofaAutoResult>(SEM_DADOS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // ─── Load ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!pacienteId) {
      setResultado(SEM_DADOS);
      setLoading(false);
      return;
    }
    setLoading(true);
    const hojeStr = localDateStr(new Date());
    const ontemDate = new Date();
    ontemDate.setDate(ontemDate.getDate() - 1);
    const ontemStr = localDateStr(ontemDate);

    const { data, error: err } = await supabase
      .from('vw_sofa_diario')
      .select('*')
      .eq('paciente_id', pacienteId)
      .in('dia', [hojeStr, ontemStr]);

    setLoading(false);
    if (err) {
      console.error('[SASI sofa-auto] load:', err);
      setError(err.message);
      return;
    }
    const rows = (data ?? []) as SofaDiarioRow[];
    const hoje = rows.find((r) => r.dia?.startsWith(hojeStr)) ?? null;
    const ontem = rows.find((r) => r.dia?.startsWith(ontemStr)) ?? null;
    setResultado(buildSofaAuto(hoje, ontem));
  }, [pacienteId]);

  // ─── Realtime ────────────────────────────────────────────────────────────
  const setupRealtime = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    // Nome único por inscrição (ver useSupabasePatients/useClinicalAlerts):
    // evita reusar canal já inscrito sob StrictMode.
    const channel = supabase
      .channel(`sasi-sofa-auto-realtime-${crypto.randomUUID()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eventos_clinicos' }, () => {
        void load();
      })
      .subscribe();
    channelRef.current = channel;
  }, [load]);

  useEffect(() => {
    void load();
    setupRealtime();
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [load, setupRealtime]);

  return { resultado, loading, error };
}
