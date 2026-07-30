// ============================================================================
// SASI — camada de dados: PACIENTES / LEITOS
// ----------------------------------------------------------------------------
// Toda leitura do banco vive aqui (Server-side). Regras:
//  - ZERO ALUCINACAO: erro do Supabase => lista vazia + console.error. Nunca dado falso.
//  - Nenhuma funcao inventa valor: ausencia continua null e a tela mostra "—".
//  - Colunas conferidas em supabase/schema-producao-v3.sql (schema v3, ja em producao).
// ============================================================================

import { getSupabaseServer } from "@/lib/supabase/server";
import type { Paciente, StatusLeito, Uti, VwDashboardUti } from "@/types/clinical";

/** PostgREST corta a resposta em 1000 linhas (supabase/config.toml: max_rows). */
const LIMITE_MAX = 1000;

type ErroPostgrest = { message?: string | null; code?: string | null; details?: string | null } | null;

function logErro(fn: string, e: ErroPostgrest): void {
  console.error(`[data/pacientes] ${fn}: ${e?.message ?? "erro desconhecido"}${e?.code ? ` (${e.code})` : ""}`);
}

function avisaTruncado(fn: string, n: number, limite: number): void {
  if (n >= limite) console.warn(`[data/pacientes] ${fn}: retorno truncado em ${limite} linhas — refine o filtro.`);
}

const UTIS_VALIDAS: readonly string[] = ["UTI2", "UTI3", "UTI4"];

// ---------------------------------------------------------------------------

export interface ListarPacientesOpts {
  /** Filtro de status do leito. "todos" traz altas/obitos/transferencias tambem. Padrao: "ativo". */
  status?: StatusLeito | "todos";
  /** Teto de linhas (maximo efetivo 1000). Padrao: 1000. */
  limite?: number;
}

/**
 * War Room / grade de leitos: 1 linha por leito OCUPADO (a view ja filtra status_leito='ativo').
 * Traz SOFA da ultima evolucao, delta_sofa_24h, pendencias abertas, dispositivos e severidade.
 * Ordenado por UTI e depois leito (L01..L13 — texto zero-padded ordena certo).
 */
export async function listarLeitosAtivos(uti?: Uti | string | null): Promise<VwDashboardUti[]> {
  const sb = await getSupabaseServer();
  let q = sb.from("vw_dashboard_uti").select("*");
  if (uti) {
    if (!UTIS_VALIDAS.includes(uti)) {
      console.error(`[data/pacientes] listarLeitosAtivos: UTI invalida "${uti}" — esperado UTI2|UTI3|UTI4.`);
      return [];
    }
    q = q.eq("uti", uti);
  }
  const { data, error } = await q.order("uti", { ascending: true }).order("leito", { ascending: true }).limit(LIMITE_MAX);
  if (error) {
    logErro("listarLeitosAtivos", error);
    return [];
  }
  return (data ?? []) as VwDashboardUti[];
}

/**
 * Cadastro bruto de pacientes (tabela pacientes — traz o que a view NAO tem:
 * altura, imc, alergias, riscos_flags, patient_summary, sofa_baseline).
 * ATENCAO: por padrao devolve SO status_leito='ativo'. Use { status: "todos" } para o historico.
 */
export async function listarPacientes(uti?: Uti | string | null, opts?: ListarPacientesOpts): Promise<Paciente[]> {
  const status = opts?.status ?? "ativo";
  const limite = Math.min(opts?.limite ?? LIMITE_MAX, LIMITE_MAX);
  const sb = await getSupabaseServer();

  let q = sb.from("pacientes").select("*");
  if (uti) {
    if (!UTIS_VALIDAS.includes(uti)) {
      console.error(`[data/pacientes] listarPacientes: UTI invalida "${uti}" — esperado UTI2|UTI3|UTI4.`);
      return [];
    }
    q = q.eq("uti", uti);
  }
  if (status !== "todos") q = q.eq("status_leito", status);

  const { data, error } = await q
    .order("uti", { ascending: true })
    .order("leito", { ascending: true })
    .limit(limite);
  if (error) {
    logErro("listarPacientes", error);
    return [];
  }
  const rows = (data ?? []) as Paciente[];
  avisaTruncado("listarPacientes", rows.length, limite);
  return rows;
}

/** 1 paciente pelo id (uuid). Nao encontrado ou erro => null (nunca objeto vazio inventado). */
export async function getPaciente(id: string): Promise<Paciente | null> {
  if (!id) return null;
  const sb = await getSupabaseServer();
  const { data, error } = await sb.from("pacientes").select("*").eq("id", id).maybeSingle();
  if (error) {
    logErro("getPaciente", error);
    return null;
  }
  return (data as Paciente | null) ?? null;
}

/**
 * Paciente ATIVO de um leito (uti + leito). O banco garante 1 ativo por leito
 * (indice unico uq_pacientes_leito_ativo). Leito vazio => null.
 */
export async function getPacientePorLeito(uti: Uti | string, leito: string): Promise<Paciente | null> {
  if (!uti || !leito) return null;
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("pacientes")
    .select("*")
    .eq("uti", uti)
    .eq("leito", leito)
    .eq("status_leito", "ativo")
    .maybeSingle();
  if (error) {
    logErro("getPacientePorLeito", error);
    return null;
  }
  return (data as Paciente | null) ?? null;
}
