// ============================================================================
// SASI — camada de dados: ALERTAS + FILA DE REVISAO
// ----------------------------------------------------------------------------
// "Flags gritam, nao consertam": aqui so LEMOS o que o motor do banco disparou
// (fn_eval_alert / fn_eval_trend, dedupe por hash). Nenhuma regra clinica roda na tela.
// ZERO ALUCINACAO: erro => lista vazia + console.error.
// Colunas conferidas em supabase/schema-producao-v3.sql.
// ============================================================================

import { getSupabaseServer } from "@/lib/supabase/server";
import { falhaBanco } from "@/lib/data/erros";
import type { AlertLog, EventoClinico, SeveridadeAlerta, Uti } from "@/types/clinical";

const LIMITE_MAX = 1000;


// ---------------------------------------------------------------------------
// 1. ALERTAS ABERTOS (nao reconhecidos)
// ---------------------------------------------------------------------------

/** Linha de vw_alertas_abertos: CONTAGEM por leito (nao traz a mensagem). */
export interface VwAlertaAberto {
  paciente_id: string;
  uti: Uti;
  leito: string;
  nome: string;
  criticos: number;
  warnings: number;
  infos: number;
  total: number;
}

/**
 * Contagem de alertas NAO reconhecidos por leito (vw_alertas_abertos).
 * Leito sem alerta NAO aparece na view — no War Room isso e ausencia de alerta,
 * nao "zero alertas confirmado". Ordem: mais criticos primeiro.
 * Para ver a MENSAGEM de cada alerta use listarAlertasDetalhados().
 */
export async function listarAlertasAbertos(): Promise<VwAlertaAberto[]> {
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("vw_alertas_abertos")
    .select("paciente_id,uti,leito,nome,criticos,warnings,infos,total")
    .order("criticos", { ascending: false })
    .order("warnings", { ascending: false })
    .order("total", { ascending: false })
    .limit(LIMITE_MAX);
  if (error) {
    throw falhaBanco("data/alertas", "listarAlertasAbertos", error);
  }
  return (data ?? []) as VwAlertaAberto[];
}

/** Mapa paciente_id -> contagem, para casar com as linhas de vw_dashboard_uti sem N queries. */
export async function mapearAlertasAbertos(): Promise<Map<string, VwAlertaAberto>> {
  const linhas = await listarAlertasAbertos();
  return new Map(linhas.map((l: VwAlertaAberto) => [l.paciente_id, l] as const));
}

export interface ListarAlertasOpts {
  /** true = so os nao reconhecidos (acked = false). Padrao: true. */
  apenasAbertos?: boolean;
  severidade?: SeveridadeAlerta;
  limite?: number;
}

/**
 * Alertas com MENSAGEM e payload (tabela alerts_log).
 * Ordem: severidade decrescente (critical > warning > info, ordem do enum) e mais recentes primeiro.
 */
export async function listarAlertasDetalhados(
  pacienteId?: string | null,
  opts?: ListarAlertasOpts,
): Promise<AlertLog[]> {
  const sb = await getSupabaseServer();
  let q = sb
    .from("alerts_log")
    .select(
      "id,paciente_id,evento_id,user_id,tipo,severidade,mensagem,payload,hash_key,acked,acked_at,acked_by,created_at",
    );
  if (pacienteId) q = q.eq("paciente_id", pacienteId);
  if (opts?.apenasAbertos !== false) q = q.eq("acked", false);
  if (opts?.severidade) q = q.eq("severidade", opts.severidade);

  const { data, error } = await q
    .order("severidade", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(Math.min(opts?.limite ?? 200, LIMITE_MAX));
  if (error) {
    throw falhaBanco("data/alertas", "listarAlertasDetalhados", error);
  }
  return (data ?? []) as AlertLog[];
}

// ---------------------------------------------------------------------------
// 2. FILA DE REVISAO DE EVENTOS
// ---------------------------------------------------------------------------

/**
 * Fila de auditoria do ingest: eventos com requires_review OU confidence < 0.7
 * (vw_eventos_pendentes_revisao — mesmas colunas de eventos_clinicos).
 * Mais recentes primeiro. Sem pacienteId => fila da UTI inteira.
 */
export async function listarEventosPendentesRevisao(
  pacienteId?: string | null,
  limite = 200,
): Promise<EventoClinico[]> {
  const sb = await getSupabaseServer();
  let q = sb
    .from("vw_eventos_pendentes_revisao")
    .select(
      "id,paciente_id,evolucao_id,user_id,ts,tipo,valor_num,valor_json,unidade,fonte,confidence,source_text,requires_review,created_at",
    );
  if (pacienteId) q = q.eq("paciente_id", pacienteId);

  const { data, error } = await q.order("ts", { ascending: false }).limit(Math.min(limite, LIMITE_MAX));
  if (error) {
    throw falhaBanco("data/alertas", "listarEventosPendentesRevisao", error);
  }
  return (data ?? []) as EventoClinico[];
}

/** Quantos eventos aguardam revisao (badge do painel de auditoria). Erro => 0 com log. */
export async function contarEventosPendentesRevisao(pacienteId?: string | null): Promise<number> {
  const sb = await getSupabaseServer();
  let q = sb.from("vw_eventos_pendentes_revisao").select("id", { count: "exact", head: true });
  if (pacienteId) q = q.eq("paciente_id", pacienteId);
  const { count, error } = await q;
  if (error) {
    throw falhaBanco("data/alertas", "contarEventosPendentesRevisao", error);
  }
  return count ?? 0;
}
