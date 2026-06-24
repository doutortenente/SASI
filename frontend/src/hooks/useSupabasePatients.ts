// ============================================================================
// src/hooks/useSupabasePatients.ts
// Hook principal de pacientes (Supabase Realtime)
// Gerencia: CRUD de pacientes, evolucoes, realtime, dashboard view
// ============================================================================
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, type Paciente, type Evolucao, type DashboardRow, type PatientSummary } from '../lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ============================================================================
// Estado local do hook
// ============================================================================
export interface UseSupabasePatientsReturn {
  // Dados
  patients: Paciente[];
  dashboard: DashboardRow[];
  loading: boolean;
  error: string | null;

  // CRUD Pacientes
  addPatient: (data: Omit<Paciente, 'id' | 'created_at' | 'updated_at'>) => Promise<Paciente | null>;
  updatePatient: (id: string, data: Partial<Paciente>) => Promise<void>;
  removePatient: (id: string) => Promise<void>;

  // CRUD Evoluções
  saveEvolucao: (
    pacienteId: string,
    evolucao: Omit<Evolucao, 'id' | 'paciente_id' | 'created_at' | 'updated_at'>
  ) => Promise<Evolucao | null>;
  getEvolucoes: (pacienteId: string, limit?: number) => Promise<Evolucao[]>;
  getLastEvolucao: (pacienteId: string) => Promise<Evolucao | null>;

  // SOFA Trend (timeseries 72h)
  getSofaTrend: (pacienteId: string) => Promise<{ ts: string; sofa_total: number }[]>;

  // Patient Summary (persistente por admissão)
  getPatientSummary: (pacienteId: string) => Promise<PatientSummary | null>;
  savePatientSummary: (pacienteId: string, summary: Partial<PatientSummary>) => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================
export function useSupabasePatients(): UseSupabasePatientsReturn {
  const [patients, setPatients] = useState<Paciente[]>([]);
  const [dashboard, setDashboard] = useState<DashboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);

  // ============================================================
  // CARREGAR DASHBOARD (view materializada do Supabase)
  // ============================================================
  const loadDashboard = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('vw_dashboard_uti')
      .select('*')
      .order('leito');

    if (err) {
      console.error('[SASI] Erro ao carregar dashboard:', err);
      setError(err.message);
      return;
    }
    setDashboard(data ?? []);
  }, []);

  // ============================================================
  // CARREGAR LISTA SIMPLES DE PACIENTES ATIVOS
  // ============================================================
  const loadPatients = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('pacientes')
      .select('*')
      .eq('status_leito', 'ativo')
      .order('leito');

    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }
    setPatients(data ?? []);
  }, []);

  // ============================================================
  // REALTIME: pacientes, evolucoes e pendencias → dashboard atualiza
  // ============================================================
  const setupRealtime = useCallback(() => {
    // Limpa canal anterior
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Nome único por inscrição: supabase.channel() reaproveita o canal por
    // tópico. Sob StrictMode (efeito roda 2x), reusar o mesmo nome devolve o
    // canal JÁ inscrito, e encadear .on() depois do subscribe() lança
    // "cannot add postgres_changes callbacks ... after subscribe()".
    const channel = supabase
      .channel(`sasi-uti-realtime-${crypto.randomUUID()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pacientes' }, () => {
        loadPatients();
        loadDashboard();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'evolucoes' }, () => {
        loadDashboard();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pendencias' }, () => {
        loadDashboard();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[SASI] Realtime conectado — escutando UTI');
        }
      });

    channelRef.current = channel;
  }, [loadPatients, loadDashboard]);

  // ============================================================
  // INICIALIZAÇÃO
  // ============================================================
  useEffect(() => {
    loadPatients();
    loadDashboard();
    setupRealtime();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [loadPatients, loadDashboard, setupRealtime]);

  // ============================================================
  // CRUD — PACIENTES
  // ============================================================
  const addPatient = useCallback(
    async (data: Omit<Paciente, 'id' | 'created_at' | 'updated_at'>): Promise<Paciente | null> => {
      const { data: inserted, error: err } = await supabase
        .from('pacientes')
        .insert(data)
        .select()
        .single();

      if (err) {
        console.error('[SASI] Erro ao inserir paciente:', err);
        setError(err.message);
        return null;
      }
      return inserted;
    },
    []
  );

  const updatePatient = useCallback(async (id: string, data: Partial<Paciente>): Promise<void> => {
    const { error: err } = await supabase
      .from('pacientes')
      .update(data)
      .eq('id', id);

    if (err) {
      console.error('[SASI] Erro ao atualizar paciente:', err);
      setError(err.message);
    }
  }, []);

  const removePatient = useCallback(async (id: string): Promise<void> => {
    // Soft delete — muda status, não destrói histórico
    const { error: err } = await supabase
      .from('pacientes')
      .update({ status_leito: 'alta' })
      .eq('id', id);

    if (err) {
      console.error('[SASI] Erro ao dar alta ao paciente:', err);
      setError(err.message);
    }
  }, []);

  // ============================================================
  // CRUD — EVOLUÇÕES
  // ============================================================
  const saveEvolucao = useCallback(
    async (
      pacienteId: string,
      evolucao: Omit<Evolucao, 'id' | 'paciente_id' | 'created_at' | 'updated_at'>
    ): Promise<Evolucao | null> => {
      const { data, error: err } = await supabase
        .from('evolucoes')
        .insert({ paciente_id: pacienteId, ...evolucao })
        .select()
        .single();

      if (err) {
        console.error('[SASI] Erro ao salvar evolução:', err);
        setError(err.message);
        return null;
      }

      // Atualiza updated_at do paciente (para ordenação no dashboard)
      await supabase
        .from('pacientes')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', pacienteId);

      return data;
    },
    []
  );

  const getEvolucoes = useCallback(
    async (pacienteId: string, limit = 10): Promise<Evolucao[]> => {
      const { data, error: err } = await supabase
        .from('evolucoes')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('data_evolucao', { ascending: false })
        .limit(limit);

      if (err) return [];
      return data ?? [];
    },
    []
  );

  const getLastEvolucao = useCallback(
    async (pacienteId: string): Promise<Evolucao | null> => {
      const { data, error: err } = await supabase
        .from('evolucoes')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('data_evolucao', { ascending: false })
        .limit(1)
        .single();

      if (err) return null;
      return data;
    },
    []
  );

  // ============================================================
  // SOFA TREND — timeseries 72h (para gráfico de tendência)
  // ============================================================
  const getSofaTrend = useCallback(
    async (pacienteId: string): Promise<{ ts: string; sofa_total: number }[]> => {
      const { data, error: err } = await supabase
        .from('eventos_clinicos')
        .select('ts, valor_num')
        .eq('paciente_id', pacienteId)
        .eq('tipo', 'sofa')
        .gte('ts', new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString())
        .order('ts', { ascending: true });

      if (err) return [];
      return (data ?? []).map((e) => ({
        ts: e.ts,
        sofa_total: e.valor_num ?? 0,
      }));
    },
    []
  );

  // ============================================================
  // PATIENT SUMMARY (armazenado em pacientes.patient_summary JSONB)
  // Requer uma única migration: ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS patient_summary jsonb;
  // O código é defensivo: se a coluna não existir, retorna null e loga instrução clara.
  // ============================================================
  const getPatientSummary = useCallback(async (pacienteId: string): Promise<PatientSummary | null> => {
    const { data, error: err } = await supabase
      .from('pacientes')
      .select('patient_summary')
      .eq('id', pacienteId)
      .single();

    if (err) {
      console.warn('[SASI] getPatientSummary:', err.message);
      return null;
    }
    return (data?.patient_summary as PatientSummary) ?? null;
  }, []);

  const savePatientSummary = useCallback(async (pacienteId: string, summary: Partial<PatientSummary>): Promise<void> => {
    const payload = {
      ...summary,
      ultima_atualizacao: new Date().toISOString(),
    };

    const { error: err } = await supabase
      .from('pacientes')
      .update({
        patient_summary: payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pacienteId);

    if (err) {
      // Mensagem amigável se coluna ainda não foi criada
      if (err.message.includes('patient_summary') || err.code === '42703') {
        console.error(
          '[SASI] Coluna patient_summary ainda não existe no Postgres.\n' +
            ' Rode UMA VEZ no Supabase SQL Editor:\n' +
            "  ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS patient_summary jsonb;\n" +
            'Depois recarregue a página.'
        );
      }
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    patients,
    dashboard,
    loading,
    error,
    addPatient,
    updatePatient,
    removePatient,
    saveEvolucao,
    getEvolucoes,
    getLastEvolucao,
    getSofaTrend,
    getPatientSummary,
    savePatientSummary,
  };
}
