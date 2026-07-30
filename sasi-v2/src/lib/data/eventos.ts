// ============================================================================
// SASI — camada de dados: EVENTOS CLINICOS (serie temporal) + dimensao de tipos
// ----------------------------------------------------------------------------
// DOUTRINA APLICADA AQUI:
//  - ZERO ALUCINACAO: sem medida => null (NUNCA 0). Erro => vazio + console.error.
//  - MAX-MIN: os agregados devolvem { max, min } — a TELA imprime nessa ordem
//    (ex.: "SpO2 98-89%"), nunca min primeiro.
//  - "Flags gritam, nao consertam": evento marcado requires_review ENTRA no agregado
//    e vem sinalizado (requires_review), o medico decide. Nada e descartado em silencio.
//  - Unidade e rotulo vem SEMPRE de evento_tipo_ref (nunca chutados no componente).
// Colunas conferidas em supabase/schema-producao-v3.sql.
// ============================================================================

import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { EventoClinico, EventoTipoRef } from "@/types/clinical";

/** PostgREST corta a resposta em 1000 linhas (supabase/config.toml: max_rows). */
const LIMITE_MAX = 1000;

/** Fuso do plantao — usado para fatiar o "folhao" por DIA civil brasileiro. */
const TZ = "America/Sao_Paulo";

/** Categorias de evento_tipo_ref que entram no folhao de exames (labs/gaso). */
export const CATEGORIAS_LAB: readonly string[] = ["gaso", "lab", "renal", "hemato", "infecto"];

/** Categorias consideradas "sinal vital" na serie de 24h. */
export const CATEGORIAS_VITAL: readonly string[] = ["vital"];

// --- MODO DEGRADADO -------------------------------------------------------
// Se evento_tipo_ref vier VAZIA (hoje a tabela tem 56 linhas mas so libera SELECT
// para o papel `authenticated` — com a chave anon o app le 0), as listas abaixo
// dizem apenas QUAIS series buscar. Nunca inventam rotulo, unidade nem faixa:
// nesse modo o rotulo vira o proprio codigo e a unidade vem do evento gravado.
// Sem isso, medidas REAIS sumiriam da tela como se nao tivessem sido coletadas.
// Espelho de supabase/schema-producao-v3.sql (seed de evento_tipo_ref).
const FALLBACK_VITAIS: readonly string[] = ["pa_sys", "pa_dia", "pam", "pam_min", "fc", "fr", "spo2", "temp", "glicemia"];
const FALLBACK_LABS: readonly string[] = [
  "pf_ratio", "lactato", "ph", "pco2", "po2", "hco3", "be",
  "diurese_h", "bh_h", "bh_acumulado", "cr", "ur", "na", "k", "mg", "ca", "p",
  "hb", "ht", "plaq", "leuco", "inr", "bb", "pcr", "procalcitonina",
];

type ErroPostgrest = { message?: string | null; code?: string | null; details?: string | null } | null;

function logErro(fn: string, e: ErroPostgrest): void {
  console.error(`[data/eventos] ${fn}: ${e?.message ?? "erro desconhecido"}${e?.code ? ` (${e.code})` : ""}`);
}

function avisaTruncado(fn: string, n: number, limite: number): void {
  if (n >= limite) console.warn(`[data/eventos] ${fn}: retorno truncado em ${limite} linhas — refine a janela.`);
}

/** numeric do Postgres -> number | null. String vazia/invalida vira null, NUNCA 0. */
export function toNum(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const t = v.trim().replace(",", ".");
    if (t === "") return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

const COLS_EVENTO =
  "id,paciente_id,evolucao_id,user_id,ts,tipo,valor_num,valor_json,unidade,fonte,confidence,source_text,requires_review,created_at";

// ---------------------------------------------------------------------------
// 1. DIMENSAO — evento_tipo_ref
// ---------------------------------------------------------------------------

/**
 * Vocabulario de eventos (rotulo, unidade_padrao, faixa_min/faixa_max, categoria, ordem).
 * Memoizada por requisicao (React cache) — varias telas podem chamar sem repetir a query.
 * So tipos ativos, na ordem clinica (coluna `ordem`).
 */
export const getTipoRef = cache(async (): Promise<EventoTipoRef[]> => {
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("evento_tipo_ref")
    .select("codigo,categoria,rotulo,unidade_padrao,faixa_min,faixa_max,loinc_code,ativo,ordem")
    .eq("ativo", true)
    .order("ordem", { ascending: true });
  if (error) {
    logErro("getTipoRef", error);
    return [];
  }
  type Linha = Omit<EventoTipoRef, "faixa_min" | "faixa_max"> & { faixa_min: unknown; faixa_max: unknown };
  const refs = ((data ?? []) as Linha[]).map(
    (r: Linha): EventoTipoRef => ({ ...r, faixa_min: toNum(r.faixa_min), faixa_max: toNum(r.faixa_max) }),
  );
  if (refs.length === 0) {
    console.error(
      "[data/eventos] getTipoRef: dimensao evento_tipo_ref voltou VAZIA (a tabela tem 56 codigos). " +
        "Causa provavel: a unica policy de SELECT e para o papel `authenticated` e o app usa a chave anon. " +
        "Efeito: rotulo/unidade/faixa indisponiveis — as series entram em MODO DEGRADADO (rotulo = codigo). " +
        "Correcao a montante: policy de leitura para anon OU login real.",
    );
  }
  return refs;
});

/** Mesma dimensao indexada por codigo — para resolver rotulo/unidade em O(1) na renderizacao. */
export const getTipoRefMap = cache(async (): Promise<Map<string, EventoTipoRef>> => {
  const refs = await getTipoRef();
  return new Map(refs.map((r: EventoTipoRef) => [r.codigo, r] as const));
});

/**
 * Valor fora da faixa FISIOLOGICA PLAUSIVEL do tipo (flag de absurdo da doutrina).
 * Nao e "fora do normal clinico" — e "impossivel/rever a fonte".
 * Sem valor ou sem faixa cadastrada => false (ausencia nao vira alarme).
 */
export function foraDaFaixa(
  valor: number | null | undefined,
  ref: Pick<EventoTipoRef, "faixa_min" | "faixa_max"> | null | undefined,
): boolean {
  if (valor == null || !Number.isFinite(valor) || !ref) return false;
  if (ref.faixa_min != null && valor < ref.faixa_min) return true;
  if (ref.faixa_max != null && valor > ref.faixa_max) return true;
  return false;
}

// ---------------------------------------------------------------------------
// 2. LEITURA CRUA DE EVENTOS
// ---------------------------------------------------------------------------

export interface ListarEventosOpts {
  /** Filtra por codigos de evento_tipo_ref (ex.: ["fc","pam","lactato"]). */
  tipos?: string[];
  /** Janela para tras a partir de agora, em horas (ex.: 24). Sem valor = sem corte. */
  desdeHoras?: number;
  /** Teto de linhas (maximo efetivo 1000). Padrao: 1000. */
  limite?: number;
  /** Ordem por ts. Padrao: false (mais recente primeiro). */
  crescente?: boolean;
}

/** Eventos brutos do paciente, do mais recente para o mais antigo (salvo `crescente`). */
export async function listarEventos(pacienteId: string, opts?: ListarEventosOpts): Promise<EventoClinico[]> {
  if (!pacienteId) return [];
  const limite = Math.min(opts?.limite ?? LIMITE_MAX, LIMITE_MAX);
  const sb = await getSupabaseServer();

  let q = sb.from("eventos_clinicos").select(COLS_EVENTO).eq("paciente_id", pacienteId);
  if (opts?.tipos && opts.tipos.length > 0) q = q.in("tipo", opts.tipos);
  if (opts?.desdeHoras != null && opts.desdeHoras > 0) {
    q = q.gte("ts", new Date(Date.now() - opts.desdeHoras * 3_600_000).toISOString());
  }

  const { data, error } = await q.order("ts", { ascending: opts?.crescente ?? false }).limit(limite);
  if (error) {
    logErro("listarEventos", error);
    return [];
  }
  type Linha = Omit<EventoClinico, "valor_num" | "confidence"> & { valor_num: unknown; confidence: unknown };
  const rows = ((data ?? []) as Linha[]).map(
    (r: Linha): EventoClinico => ({ ...r, valor_num: toNum(r.valor_num), confidence: toNum(r.confidence) }),
  );
  avisaTruncado("listarEventos", rows.length, limite);
  return rows;
}

/** Ultima medida de UM tipo. Nunca mediu => null (a tela imprime "—"). */
export async function ultimoEvento(pacienteId: string, tipo: string): Promise<EventoClinico | null> {
  if (!pacienteId || !tipo) return null;
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("eventos_clinicos")
    .select(COLS_EVENTO)
    .eq("paciente_id", pacienteId)
    .eq("tipo", tipo)
    .order("ts", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    logErro("ultimoEvento", error);
    return null;
  }
  if (!data) return null;
  const r = data as EventoClinico & { valor_num: unknown; confidence: unknown };
  return { ...r, valor_num: toNum(r.valor_num), confidence: toNum(r.confidence) };
}

// ---------------------------------------------------------------------------
// 3. AGREGADO 24h (MAX-MIN) — o bloco de sinais vitais
// ---------------------------------------------------------------------------

export interface SerieVital {
  tipo: string;
  rotulo: string;
  unidade: string | null;
  /** MAIOR valor da janela. Sem medida => null (nunca 0). */
  max: number | null;
  /** MENOR valor da janela. Sem medida => null (nunca 0). */
  min: number | null;
  /** Valor mais recente da janela. */
  ultimo: number | null;
  /** ts (ISO) do `ultimo`. Sem medida => null. */
  ts: string | null;
  /** Quantas medidas entraram no agregado (0 = nao avaliado). */
  n: number;
  /** max ou min fora da faixa fisiologica de evento_tipo_ref. */
  fora_faixa: boolean;
  /** Alguma medida da janela esta marcada para revisao (baixa confianca / flag). */
  requires_review: boolean;
}

export interface SerieVitaisOpts {
  /** Tamanho da janela em horas. Padrao: 24. */
  horas?: number;
  /** Fixa o conjunto e a ORDEM das linhas (codigos de evento_tipo_ref). */
  tipos?: string[];
  /** Categorias de evento_tipo_ref usadas quando `tipos` nao vem. Padrao: ["vital"]. */
  categorias?: readonly string[];
  /** true = omite linhas sem nenhuma medida. Padrao: false (linha vazia => tela mostra "—"). */
  somenteComDados?: boolean;
}

interface Agg {
  max: number | null;
  min: number | null;
  ultimo: number | null;
  ts: string | null;
  n: number;
  review: boolean;
  /** Unidade REGISTRADA no evento (usada quando a dimensao esta indisponivel). */
  unidadeEvento: string | null;
}

/** Especificacao de UMA linha de serie: de onde saem rotulo, unidade e faixa. */
interface EspecLinha {
  codigo: string;
  rotulo: string;
  categoria: string;
  unidade: string | null;
  faixa_min: number | null;
  faixa_max: number | null;
}

const especDe = (r: EventoTipoRef): EspecLinha => ({
  codigo: r.codigo,
  rotulo: r.rotulo,
  categoria: r.categoria,
  unidade: r.unidade_padrao,
  faixa_min: r.faixa_min,
  faixa_max: r.faixa_max,
});

/** Modo degradado: sem dimensao, o rotulo e o proprio codigo e nao ha faixa (zero alarme falso). */
const especCrua = (codigo: string): EspecLinha => ({
  codigo,
  rotulo: codigo,
  categoria: "",
  unidade: null,
  faixa_min: null,
  faixa_max: null,
});

/**
 * Resolve QUAIS series montar e de onde vem rotulo/unidade/faixa.
 * Com a dimensao: filtra por `tipos` (ordem do chamador) ou por categoria.
 * Sem a dimensao: cai na lista de fallback e marca as linhas como cruas.
 */
async function resolverLinhas(
  tipos: string[] | undefined,
  categorias: readonly string[],
  fallback: readonly string[],
): Promise<EspecLinha[]> {
  const refs = await getTipoRef();
  const porCodigo = new Map<string, EventoTipoRef>(refs.map((r: EventoTipoRef) => [r.codigo, r] as const));

  if (tipos && tipos.length > 0) {
    return tipos.map((t: string) => {
      const ref = porCodigo.get(t);
      return ref ? especDe(ref) : especCrua(t);
    });
  }
  if (refs.length > 0) {
    return refs.filter((r: EventoTipoRef) => categorias.includes(r.categoria)).map(especDe);
  }
  return fallback.map(especCrua);
}

const aggVazio = (): Agg => ({ max: null, min: null, ultimo: null, ts: null, n: 0, review: false, unidadeEvento: null });

function acumula(a: Agg, ev: EventoClinico): void {
  if (ev.requires_review) a.review = true;
  if (ev.unidade) a.unidadeEvento = ev.unidade;
  const valor = ev.valor_num;
  if (valor == null) return;
  a.n += 1;
  a.max = a.max == null || valor > a.max ? valor : a.max;
  a.min = a.min == null || valor < a.min ? valor : a.min;
  // linhas chegam em ordem crescente de ts: o ultimo a passar e o mais recente
  a.ultimo = valor;
  a.ts = ev.ts;
}

/**
 * Sinais vitais das ultimas 24h agregados por tipo: MAX, MIN, ultimo e ts.
 * Sem medida no periodo => max/min/ultimo/ts = null e n = 0 (NUNCA 0 como "vazio").
 * Por padrao devolve TODOS os tipos vitais ativos (linha vazia aparece como "—" na tela).
 * Uso na tela: `${max}-${min}` — sempre MAXIMO primeiro (ex.: "SpO2 98-89%").
 */
export async function serieVitais24h(pacienteId: string, opts?: SerieVitaisOpts): Promise<SerieVital[]> {
  if (!pacienteId) return [];
  const horas = opts?.horas ?? 24;

  const linhas = await resolverLinhas(opts?.tipos, opts?.categorias ?? CATEGORIAS_VITAL, FALLBACK_VITAIS);
  if (linhas.length === 0) return [];

  const eventos = await listarEventos(pacienteId, {
    tipos: linhas.map((l: EspecLinha) => l.codigo),
    desdeHoras: horas,
    crescente: true,
  });

  const acc = new Map<string, Agg>();
  for (const ev of eventos) {
    let a = acc.get(ev.tipo);
    if (!a) {
      a = aggVazio();
      acc.set(ev.tipo, a);
    }
    acumula(a, ev);
  }

  const saida = linhas.map((esp: EspecLinha): SerieVital => {
    const a = acc.get(esp.codigo) ?? aggVazio();
    return {
      tipo: esp.codigo,
      rotulo: esp.rotulo,
      unidade: esp.unidade ?? a.unidadeEvento,
      max: a.max,
      min: a.min,
      ultimo: a.ultimo,
      ts: a.ts,
      n: a.n,
      fora_faixa: foraDaFaixa(a.max, esp) || foraDaFaixa(a.min, esp),
      requires_review: a.review,
    };
  });

  return opts?.somenteComDados ? saida.filter((s: SerieVital) => s.n > 0) : saida;
}

// ---------------------------------------------------------------------------
// 4. FOLHAO DE EXAMES — matriz exame (linha) x dia (coluna)
// ---------------------------------------------------------------------------

const FMT_DIA = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });

/** ts (ISO/Date) -> "AAAA-MM-DD" no fuso do plantao (America/Sao_Paulo). */
export function diaLocal(ts: string | Date): string {
  const d = typeof ts === "string" ? new Date(ts) : ts;
  if (Number.isNaN(d.getTime())) return "";
  const p = FMT_DIA.formatToParts(d);
  const parte = (t: string): string => p.find((x: Intl.DateTimeFormatPart) => x.type === t)?.value ?? "";
  return `${parte("year")}-${parte("month")}-${parte("day")}`;
}

/** Dia civil anterior a "AAAA-MM-DD" (ancorado ao meio-dia UTC: imune a fuso/horario de verao). */
function diaAnterior(dia: string): string {
  const [y, m, d] = dia.split("-").map((n: string) => Number(n));
  return diaLocal(new Date(Date.UTC(y, m - 1, d, 12) - 86_400_000));
}

export interface FolhaoCelula {
  /** "AAAA-MM-DD" (fuso do plantao). */
  dia: string;
  /** MAIOR valor do dia. Sem medida => null. */
  max: number | null;
  /** MENOR valor do dia. Sem medida => null. */
  min: number | null;
  /** Valor mais recente do dia. */
  ultimo: number | null;
  /** ts (ISO) do `ultimo`. */
  ts: string | null;
  /** Quantas medidas no dia. 0 = nao coletado (tela mostra "—"). */
  n: number;
  fora_faixa: boolean;
  requires_review: boolean;
}

export interface FolhaoLinha {
  tipo: string;
  rotulo: string;
  categoria: string;
  unidade: string | null;
  faixa_min: number | null;
  faixa_max: number | null;
  /** MESMO comprimento e MESMA ordem de Folhao.dias — alinhe por indice. */
  celulas: FolhaoCelula[];
}

export interface Folhao {
  /** Colunas: dias "AAAA-MM-DD", do MAIS ANTIGO ao MAIS RECENTE (hoje por ultimo). */
  dias: string[];
  /** Linhas: 1 exame por linha, na ordem clinica de evento_tipo_ref.ordem. */
  linhas: FolhaoLinha[];
}

export interface SerieLabsOpts {
  /** Fixa o conjunto e a ORDEM das linhas (codigos de evento_tipo_ref). */
  tipos?: string[];
  /** Categorias usadas quando `tipos` nao vem. Padrao: CATEGORIAS_LAB. */
  categorias?: readonly string[];
  /** true = mantem linhas sem nenhuma medida no periodo. Padrao: false. */
  incluirVazios?: boolean;
}

/**
 * "Folhao": matriz exame x dia dos ultimos `dias` dias (colunas terminam em HOJE).
 * Celula sem coleta tem n=0 e valores null — a tela imprime "—", nunca 0.
 * Quando `tipos` e informado, TODAS as linhas pedidas aparecem (mesmo vazias).
 */
export async function serieLabs(pacienteId: string, dias = 7, opts?: SerieLabsOpts): Promise<Folhao> {
  const nDias = Math.max(1, Math.min(Math.trunc(dias), 90));

  // colunas: hoje e os (nDias-1) dias anteriores, do mais antigo ao mais recente
  const colunas: string[] = [diaLocal(new Date())];
  for (let i = 1; i < nDias; i += 1) colunas.unshift(diaAnterior(colunas[0]));

  const vazio: Folhao = { dias: colunas, linhas: [] };
  if (!pacienteId) return vazio;

  const fixou = opts?.tipos != null && opts.tipos.length > 0;
  const candidatas = await resolverLinhas(opts?.tipos, opts?.categorias ?? CATEGORIAS_LAB, FALLBACK_LABS);
  if (candidatas.length === 0) return vazio;

  // +24h de folga: garante pegar o inicio do dia mais antigo em qualquer fuso.
  const eventos = await listarEventos(pacienteId, {
    tipos: candidatas.map((l: EspecLinha) => l.codigo),
    desdeHoras: (nDias + 1) * 24,
    crescente: true,
  });

  const indiceDia = new Map<string, number>(colunas.map((d: string, i: number) => [d, i] as const));
  const grade = new Map<string, Agg[]>();
  for (const ev of eventos) {
    const col = indiceDia.get(diaLocal(ev.ts));
    if (col == null) continue; // evento da folga (fora das colunas) — descarta
    let linha = grade.get(ev.tipo);
    if (!linha) {
      linha = colunas.map(() => aggVazio());
      grade.set(ev.tipo, linha);
    }
    acumula(linha[col], ev);
  }

  const linhas: FolhaoLinha[] = [];
  for (const esp of candidatas) {
    const agg = grade.get(esp.codigo);
    const temDado = agg != null && agg.some((a: Agg) => a.n > 0);
    if (!temDado && !fixou && !opts?.incluirVazios) continue;
    const unidade = esp.unidade ?? agg?.reduce<string | null>((u: string | null, a: Agg) => a.unidadeEvento ?? u, null) ?? null;
    linhas.push({
      tipo: esp.codigo,
      rotulo: esp.rotulo,
      categoria: esp.categoria,
      unidade,
      faixa_min: esp.faixa_min,
      faixa_max: esp.faixa_max,
      celulas: colunas.map((dia: string, i: number): FolhaoCelula => {
        const a = agg?.[i] ?? aggVazio();
        return {
          dia,
          max: a.max,
          min: a.min,
          ultimo: a.ultimo,
          ts: a.ts,
          n: a.n,
          fora_faixa: foraDaFaixa(a.max, esp) || foraDaFaixa(a.min, esp),
          requires_review: a.review,
        };
      }),
    });
  }

  return { dias: colunas, linhas };
}

// ---------------------------------------------------------------------------
// 5. TENDENCIA (views prontas do banco)
// ---------------------------------------------------------------------------

/** Linha de vw_eventos_tendencia (delta e intervalo entre medidas consecutivas). */
export interface PontoTendencia {
  paciente_id: string;
  tipo: string;
  ts: string;
  valor_num: number | null;
  unidade: string | null;
  valor_anterior: number | null;
  delta: number | null;
  gap_horas: number | null;
}

/**
 * Serie com delta entre medidas (vw_eventos_tendencia — a view ja exclui
 * eventos requires_review e confidence < 0.7). Ordem: mais antiga -> mais nova.
 */
export async function serieTendencia(pacienteId: string, tipo: string, limite = 100): Promise<PontoTendencia[]> {
  if (!pacienteId || !tipo) return [];
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("vw_eventos_tendencia")
    .select("paciente_id,tipo,ts,valor_num,unidade,valor_anterior,delta,gap_horas")
    .eq("paciente_id", pacienteId)
    .eq("tipo", tipo)
    .order("ts", { ascending: true })
    .limit(Math.min(limite, LIMITE_MAX));
  if (error) {
    logErro("serieTendencia", error);
    return [];
  }
  type Linha = Record<string, unknown>;
  return ((data ?? []) as Linha[]).map(
    (r: Linha): PontoTendencia => ({
      paciente_id: String(r.paciente_id ?? ""),
      tipo: String(r.tipo ?? ""),
      ts: String(r.ts ?? ""),
      valor_num: toNum(r.valor_num),
      unidade: (r.unidade as string | null) ?? null,
      valor_anterior: toNum(r.valor_anterior),
      delta: toNum(r.delta),
      gap_horas: toNum(r.gap_horas),
    }),
  );
}

export interface PontoSofa72h {
  ts: string;
  sofa_total: number | null;
}

/** SOFA das ultimas 72h (vw_sofa_trend_72h). Sem evento sofa_total => lista vazia (tela: "—"). */
export async function serieSofa72h(pacienteId: string): Promise<PontoSofa72h[]> {
  if (!pacienteId) return [];
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("vw_sofa_trend_72h")
    .select("ts,sofa_total")
    .eq("paciente_id", pacienteId)
    .order("ts", { ascending: true })
    .limit(LIMITE_MAX);
  if (error) {
    logErro("serieSofa72h", error);
    return [];
  }
  type Linha = { ts: string | null; sofa_total: unknown };
  return ((data ?? []) as Linha[]).map((r: Linha): PontoSofa72h => ({ ts: String(r.ts ?? ""), sofa_total: toNum(r.sofa_total) }));
}

// ---------------------------------------------------------------------------
// 5b. SOFA/dia calculado sobre eventos (vw_sofa_diario v0.2)
// ---------------------------------------------------------------------------

export interface SofaDiario {
  paciente_id: string;
  /** Dia da view. ATENCAO: e `ts::date` no fuso do BANCO (UTC), nao America/Sao_Paulo. */
  dia: string;
  s_resp: number | null;
  s_coag: number | null;
  s_liver: number | null;
  s_cardio: number | null;
  s_neuro: number | null;
  s_renal: number | null;
  /**
   * ARMADILHA CLINICA: soma da view tratando componente FALTANTE como 0.
   * NAO exiba isso como "SOFA" — use `sofa_total`. Se mostrar, mostre junto de
   * `componentes_presentes`/6 e deixe explicito que e parcial.
   */
  sofa_parcial: number | null;
  /** Quantos dos 6 componentes tinham dado no dia (0..6). */
  componentes_presentes: number;
  /** Nomes dos componentes sem dado: resp | coag | hepatico | cardio | neuro | renal. */
  componentes_faltantes: string[];
  /**
   * SOFA DE VERDADE: so existe com os 6 componentes; caso contrario null (tela mostra "—").
   * ZERO ALUCINACAO — hoje a base tem 0/16 evolucoes completas (bb e PaO2/FiO2 nunca capturadas).
   */
  sofa_total: number | null;
}

const COLS_SOFA_DIARIO =
  "paciente_id,dia,s_resp,s_coag,s_liver,s_cardio,s_neuro,s_renal,sofa_parcial,componentes_presentes,componentes_faltantes";

function mapSofaDiario(r: Record<string, unknown>): SofaDiario {
  const presentes = toNum(r.componentes_presentes) ?? 0;
  const parcial = toNum(r.sofa_parcial);
  return {
    paciente_id: String(r.paciente_id ?? ""),
    dia: String(r.dia ?? ""),
    s_resp: toNum(r.s_resp),
    s_coag: toNum(r.s_coag),
    s_liver: toNum(r.s_liver),
    s_cardio: toNum(r.s_cardio),
    s_neuro: toNum(r.s_neuro),
    s_renal: toNum(r.s_renal),
    sofa_parcial: parcial,
    componentes_presentes: presentes,
    componentes_faltantes: Array.isArray(r.componentes_faltantes) ? (r.componentes_faltantes as string[]) : [],
    sofa_total: presentes === 6 ? parcial : null,
  };
}

/** SOFA/dia dos ultimos `dias` dias (vw_sofa_diario). Ordem: mais antigo -> mais recente. */
export async function serieSofaDiario(pacienteId: string, dias = 7): Promise<SofaDiario[]> {
  if (!pacienteId) return [];
  const nDias = Math.max(1, Math.min(Math.trunc(dias), 90));
  const corte = new Date(Date.now() - nDias * 86_400_000).toISOString().slice(0, 10);
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("vw_sofa_diario")
    .select(COLS_SOFA_DIARIO)
    .eq("paciente_id", pacienteId)
    .gte("dia", corte)
    .order("dia", { ascending: true })
    .limit(LIMITE_MAX);
  if (error) {
    logErro("serieSofaDiario", error);
    return [];
  }
  return ((data ?? []) as Record<string, unknown>[]).map(mapSofaDiario);
}

/** Ultimo SOFA/dia disponivel do paciente. Sem nenhum componente medido => null. */
export async function getSofaDiarioAtual(pacienteId: string): Promise<SofaDiario | null> {
  if (!pacienteId) return null;
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("vw_sofa_diario")
    .select(COLS_SOFA_DIARIO)
    .eq("paciente_id", pacienteId)
    .order("dia", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    logErro("getSofaDiarioAtual", error);
    return null;
  }
  return data ? mapSofaDiario(data as Record<string, unknown>) : null;
}

export interface BhAcumulado {
  paciente_id: string;
  bh_24h: number | null;
  bh_48h: number | null;
  bh_72h: number | null;
  eventos_24h: number;
}

/**
 * Balanco hidrico acumulado (vw_bh_acumulado). Paciente sem NENHUM evento bh_h
 * nao aparece na view => devolve null (a tela mostra "—", nao "0 mL").
 */
export async function getBhAcumulado(pacienteId: string): Promise<BhAcumulado | null> {
  if (!pacienteId) return null;
  const sb = await getSupabaseServer();
  const { data, error } = await sb
    .from("vw_bh_acumulado")
    .select("paciente_id,bh_24h,bh_48h,bh_72h,eventos_24h")
    .eq("paciente_id", pacienteId)
    .maybeSingle();
  if (error) {
    logErro("getBhAcumulado", error);
    return null;
  }
  if (!data) return null;
  const r = data as Record<string, unknown>;
  return {
    paciente_id: String(r.paciente_id ?? pacienteId),
    bh_24h: toNum(r.bh_24h),
    bh_48h: toNum(r.bh_48h),
    bh_72h: toNum(r.bh_72h),
    eventos_24h: toNum(r.eventos_24h) ?? 0,
  };
}
