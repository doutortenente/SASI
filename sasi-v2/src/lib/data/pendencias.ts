// ============================================================================
// SASI — camada de dados: PENDENCIAS (tarefas/follow-up por paciente)
// ----------------------------------------------------------------------------
// prioridade: 1 = alta, 2 = media, 3 = baixa (constraint do banco: 1..3).
// ZERO ALUCINACAO: erro => lista vazia + console.error.
// Colunas conferidas em supabase/schema-producao-v3.sql.
// ============================================================================

import { getSupabaseServer } from "@/lib/supabase/server";
import { falhaBanco } from "@/lib/data/erros";
import type { Pendencia } from "@/types/clinical";

const LIMITE_MAX = 1000;


const COLS = "id,paciente_id,evolucao_id,user_id,tarefa,prioridade,concluida,concluida_at,created_at";

/** Rotulo da prioridade (1..3). Valor fora da faixa nao inventa rotulo: devolve travessao. */
export const ROTULO_PRIORIDADE: Record<number, string> = { 1: "Alta", 2: "Media", 3: "Baixa" };
export const rotuloPrioridade = (p: number | null | undefined): string =>
  p != null && ROTULO_PRIORIDADE[p] ? ROTULO_PRIORIDADE[p] : "—";

/**
 * Pendencias. Sem pacienteId => todos os leitos (lista de tarefas do plantao).
 * Ordem: abertas primeiro, depois prioridade (1 alta -> 3 baixa) e mais antigas primeiro.
 */
export async function listarPendencias(
  pacienteId?: string | null,
  apenasAbertas = true,
  limite = LIMITE_MAX,
): Promise<Pendencia[]> {
  const sb = await getSupabaseServer();
  let q = sb.from("pendencias").select(COLS);
  if (pacienteId) q = q.eq("paciente_id", pacienteId);
  if (apenasAbertas) q = q.eq("concluida", false);

  const { data, error } = await q
    .order("concluida", { ascending: true })
    .order("prioridade", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(Math.min(limite, LIMITE_MAX));
  if (error) {
    throw falhaBanco("data/pendencias", "listarPendencias", error);
  }
  return (data ?? []) as Pendencia[];
}

/**
 * Pendencias abertas de VARIOS pacientes de uma vez, agrupadas por paciente_id
 * (evita 1 query por card no War Room). Paciente sem pendencia nao entra no mapa.
 */
export async function mapearPendenciasAbertas(pacienteIds: string[]): Promise<Map<string, Pendencia[]>> {
  const mapa = new Map<string, Pendencia[]>();
  const ids = pacienteIds.filter((id: string) => !!id);
  if (ids.length === 0) return mapa;

  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("pendencias")
    .select(COLS)
    .in("paciente_id", ids)
    .eq("concluida", false)
    .order("prioridade", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(LIMITE_MAX);
  if (error) {
    throw falhaBanco("data/pendencias", "mapearPendenciasAbertas", error);
  }
  for (const p of (data ?? []) as Pendencia[]) {
    const atual = mapa.get(p.paciente_id);
    if (atual) atual.push(p);
    else mapa.set(p.paciente_id, [p]);
  }
  return mapa;
}
