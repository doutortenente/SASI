// ============================================================================
// SASI — camada de dados: STEWARDSHIP (atbs + culturas + antibiograma)
// ----------------------------------------------------------------------------
// D-ATB (dias de terapia) e o flag de stewardship vem PRONTOS da view
// vw_dias_atb_ativo — nao recalcule na tela.
// ZERO ALUCINACAO: erro => lista vazia + console.error.
// Colunas conferidas em supabase/schema-producao-v3.sql.
// ============================================================================

import { getSupabaseServer } from "@/lib/supabase/server";
import type { Antibiograma, Atb, Cultura, IntencaoAtb, ViaAtb } from "@/types/clinical";

const LIMITE_MAX = 1000;

type ErroPostgrest = { message?: string | null; code?: string | null; details?: string | null } | null;

function logErro(fn: string, e: ErroPostgrest): void {
  console.error(`[data/stewardship] ${fn}: ${e?.message ?? "erro desconhecido"}${e?.code ? ` (${e.code})` : ""}`);
}

// ---------------------------------------------------------------------------
// 1. ANTIBIOTICOS
// ---------------------------------------------------------------------------

/** ok = D-ATB 1..6 · warning = >= 7 dias · critical = >= 14 dias (regra da view). */
export type StewardshipFlag = "ok" | "warning" | "critical";

/** Linha de vw_dias_atb_ativo (so ATBs em curso: data_fim is null). */
export interface VwDiasAtbAtivo {
  paciente_id: string;
  atb_id: string;
  droga: string;
  via: ViaAtb | null;
  frequencia: string | null;
  data_inicio: string; // date "AAAA-MM-DD"
  intencao: IntencaoAtb | null;
  foco: string | null;
  agente_alvo: string | null;
  /** Dia de terapia contando o D1 (= hoje - data_inicio + 1). */
  dias_terapia: number | null;
  stewardship_flag: StewardshipFlag;
}

const COLS_VW_ATB =
  "paciente_id,atb_id,droga,via,frequencia,data_inicio,intencao,foco,agente_alvo,dias_terapia,stewardship_flag";

/**
 * Antibioticos EM CURSO com D-ATB e flag de stewardship.
 * Sem pacienteId => todos os leitos (painel de stewardship da UTI).
 * Ordenado pelos mais antigos primeiro (maior D-ATB no topo = quem precisa de decisao).
 * OBS: a view nao traz `dose` nem `duracao_planejada_dias` — para isso use listarAtbs().
 */
export async function listarAtbsAtivos(pacienteId?: string | null): Promise<VwDiasAtbAtivo[]> {
  const sb = await getSupabaseServer();
  let q = sb.from("vw_dias_atb_ativo").select(COLS_VW_ATB);
  if (pacienteId) q = q.eq("paciente_id", pacienteId);
  const { data, error } = await q.order("data_inicio", { ascending: true }).limit(LIMITE_MAX);
  if (error) {
    logErro("listarAtbsAtivos", error);
    return [];
  }
  return (data ?? []) as VwDiasAtbAtivo[];
}

export interface ListarAtbsOpts {
  /** true = so os em curso (data_fim is null). Padrao: false (traz o historico). */
  apenasAtivos?: boolean;
  limite?: number;
}

/**
 * Tabela `atbs` crua — traz o que a view NAO tem: dose, data_fim,
 * duracao_planejada_dias e motivo_suspensao. Ordem: inicio mais recente primeiro.
 */
export async function listarAtbs(pacienteId: string, opts?: ListarAtbsOpts): Promise<Atb[]> {
  if (!pacienteId) return [];
  const sb = await getSupabaseServer();
  let q = sb
    .from("atbs")
    .select(
      "id,paciente_id,user_id,droga,dose,via,frequencia,data_inicio,data_fim,intencao,foco,agente_alvo,motivo_suspensao,duracao_planejada_dias,created_at,updated_at",
    )
    .eq("paciente_id", pacienteId);
  if (opts?.apenasAtivos) q = q.is("data_fim", null);
  const { data, error } = await q
    .order("data_inicio", { ascending: false })
    .limit(Math.min(opts?.limite ?? LIMITE_MAX, LIMITE_MAX));
  if (error) {
    logErro("listarAtbs", error);
    return [];
  }
  return (data ?? []) as Atb[];
}

// ---------------------------------------------------------------------------
// 2. MICROBIOLOGIA
// ---------------------------------------------------------------------------

/** Cultura com o antibiograma aninhado (1 cultura -> N antibioticos S/I/R). */
export interface CulturaComAntibiograma extends Cultura {
  /** Vazio = sem antibiograma liberado (NAO significa sensivel a nada). */
  antibiograma: Antibiograma[];
}

/**
 * Culturas do paciente, da coleta mais recente para a mais antiga,
 * com antibiograma aninhado (ordenado por nome do antibiotico).
 * crescimento=false + agente=null => "sem crescimento ate o momento"; nunca invente agente.
 */
export async function listarCulturas(pacienteId: string, limite = 50): Promise<CulturaComAntibiograma[]> {
  if (!pacienteId) return [];
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("culturas")
    // UMA string literal: o tipador do supabase-js so parseia literais (concatenacao vira `string`).
    .select(
      "id,paciente_id,user_id,material,coleta_ts,laudo_ts,crescimento,agente,ufc_por_ml,observacoes,created_at,updated_at,antibiograma(id,cultura_id,antibiotico,resultado,cim,created_at)",
    )
    .eq("paciente_id", pacienteId)
    .order("coleta_ts", { ascending: false })
    .limit(Math.min(limite, LIMITE_MAX));
  if (error) {
    logErro("listarCulturas", error);
    return [];
  }
  type Linha = Omit<CulturaComAntibiograma, "antibiograma"> & { antibiograma: Antibiograma[] | null };
  return ((data ?? []) as Linha[]).map((c: Linha): CulturaComAntibiograma => ({
    ...c,
    antibiograma: [...(c.antibiograma ?? [])].sort((a: Antibiograma, b: Antibiograma) =>
      a.antibiotico.localeCompare(b.antibiotico, "pt-BR"),
    ),
  }));
}

/** Culturas com crescimento positivo — atalho para o painel de foco infeccioso. */
export async function listarCulturasPositivas(pacienteId: string): Promise<CulturaComAntibiograma[]> {
  const todas = await listarCulturas(pacienteId);
  return todas.filter((c: CulturaComAntibiograma) => c.crescimento === true);
}
