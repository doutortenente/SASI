// ============================================================================
// SASI v2 — SystemPanel (painel de UM sistema do exame fisico)
// ----------------------------------------------------------------------------
// Le UM dos JSONB por sistema da tabela `evolucoes` (neuro, resp, hemo, tgi,
// renal, hemato, infecto) e imprime. NAO le banco, NAO calcula clinica, NAO
// converte unidade. Server Component (texto puro, sem estado) — mas o modulo
// nao tem diretiva, entao NotaPreview ('use client') pode reusar os helpers.
//
// DOUTRINA APLICADA
//  1. REGRA DE FERRO — MAXIMO ANTES DO MINIMO. Todo par sai como "MAX–MIN"
//     ("103–92 mmHg", "100–92%"). JAMAIS o inverso. Se o banco gravou max < min
//     a tela NAO conserta: mostra como esta e grita "máx < mín — revisar".
//  2. ZERO ALUCINACAO — sistema inteiro sem dado => "nao avaliado". Campo sem
//     dado => travessao. Nunca 0 como vazio, nunca valor plausivel inventado.
//  3. UNIDADE NUNCA E CHUTADA — vem da dimensao `evento_tipo_ref` (mapa
//     `unidades`, montado pela pagina) ou do PROPRIO NOME do campo quando ele ja
//     carrega a unidade (`*_ml` => mL). Sem nenhuma das duas, o numero sai sem
//     unidade. Preferimos numero pelado a numero com unidade inventada.
//  4. DADO GRAVADO NUNCA SOME — chave fora do contrato conhecido (ex.:
//     `renal.diurese_12h_ml_ontem`, que existe no banco vivo) aparece em
//     "outros campos registrados", crua. Esconder dado real e perder dado real.
//  5. Numero em mono tabular (.tabnum). Cor SO por token (--sys-*, --text-*,
//     --danger, --warning). Zero hex.
//
// REGRA DE EXIBICAO (deliberada):
//   - campos-identidade do sistema (suporte, dieta, ATB, descricao) e as
//     METRICAS aparecem SEMPRE, com travessao quando vazios — a ausencia de
//     medida e informacao clinica e precisa ser visivel no instrumento;
//   - anotacoes livres (obs, ritmo) so aparecem quando existem — travessao ali
//     seria ruido, nao informacao.
//
// Este arquivo e tambem o KIT da feature `evolucao` (rotulos, leitura segura do
// JSONB, datas e o texto corrido de cada sistema), reusado pelas duas abas e
// pela NotaPreview. Fonte unica: quem mudar a doutrina de exibicao mexe aqui.
// ============================================================================
import type { CSSProperties, ReactElement } from "react";
import type { Evolucao, EventoTipoRef, Json, Plantao } from "@/types/clinical";
import { num } from "@/lib/formatters/br";

// ---------------------------------------------------------------------------
// Vocabulario
// ---------------------------------------------------------------------------

/** Ausencia de dado. Mesma forma do resto do app. */
export const TRAVESSAO = "—";
/** Ausencia de AVALIACAO (sistema inteiro sem nenhum campo). */
export const NAO_AVALIADO = "não avaliado";

export type SistemaId = "neuro" | "resp" | "hemo" | "tgi" | "renal" | "hemato" | "infecto";

/** Ordem clinica de leitura do exame fisico. Fonte unica das duas abas. */
export const ORDEM_SISTEMAS: readonly SistemaId[] = [
  "neuro",
  "resp",
  "hemo",
  "tgi",
  "renal",
  "hemato",
  "infecto",
] as const;

export const ROTULO_SISTEMA: Readonly<Record<SistemaId, string>> = {
  neuro: "Neurológico",
  resp: "Respiratório",
  hemo: "Hemodinâmico",
  tgi: "TGI",
  renal: "Renal",
  hemato: "Hematológico",
  infecto: "Infeccioso",
};

export const ROTULO_PLANTAO: Readonly<Record<Plantao, string>> = {
  manha: "manhã",
  tarde: "tarde",
  noite: "noite",
  plantao_24h: "plantão 24 h",
};

/** O JSONB de um sistema, como vem do banco (forma nao garantida). */
export type DadosSistema = Record<string, Json | undefined> | null | undefined;

// ---------------------------------------------------------------------------
// Contrato de campos por sistema (fonte unica: painel + texto corrido)
// ---------------------------------------------------------------------------

/** Par MAXIMO–MINIMO. `id` e a base do par (serve de chave de unidade). */
interface CampoPar {
  tipo: "par";
  id: string;
  rotulo: string;
  /** Abreviacao usada no texto corrido da nota ("PAS", "SpO2"). */
  abrev: string;
  max: string;
  min: string;
  casas: number;
}

/** Medida unica (numero). `id` e a chave no JSONB. */
interface CampoNum {
  tipo: "num";
  id: string;
  rotulo: string;
  abrev: string;
  casas: number;
  /** Mostra "+" no positivo (balanco hidrico: +98 mL e -140 mL sao coisas diferentes). */
  sinal?: boolean;
}

/** Texto livre. `abrev` vazia => no texto corrido sai so o valor. */
interface CampoTexto {
  tipo: "texto";
  id: string;
  rotulo: string;
  abrev: string;
}

interface EspecSistema {
  /** Identidade do sistema: sempre visivel, travessao quando vazio. */
  topo: readonly CampoTexto[];
  /** Instrumento: sempre visivel, travessao quando vazio. */
  metricas: ReadonlyArray<CampoPar | CampoNum>;
  /** Anotacao livre: so aparece quando existe. */
  rodape: readonly CampoTexto[];
}

const OBS: CampoTexto = { tipo: "texto", id: "obs", rotulo: "Observação", abrev: "obs" };

const ESPEC: Readonly<Record<SistemaId, EspecSistema>> = {
  neuro: {
    topo: [{ tipo: "texto", id: "descricao", rotulo: "Descrição", abrev: "" }],
    metricas: [{ tipo: "num", id: "rass", rotulo: "RASS", abrev: "RASS", casas: 0 }],
    rodape: [OBS],
  },
  resp: {
    topo: [{ tipo: "texto", id: "suporte", rotulo: "Suporte", abrev: "" }],
    metricas: [
      { tipo: "par", id: "fr", rotulo: "FR", abrev: "FR", max: "fr_max", min: "fr_min", casas: 0 },
      { tipo: "par", id: "spo2", rotulo: "SpO2", abrev: "SpO2", max: "spo2_max", min: "spo2_min", casas: 0 },
    ],
    rodape: [OBS],
  },
  hemo: {
    topo: [],
    metricas: [
      { tipo: "par", id: "pa_sys", rotulo: "PA sistólica", abrev: "PAS", max: "pa_sys_max", min: "pa_sys_min", casas: 0 },
      { tipo: "par", id: "pa_dia", rotulo: "PA diastólica", abrev: "PAD", max: "pa_dia_max", min: "pa_dia_min", casas: 0 },
      { tipo: "par", id: "pam", rotulo: "PAM", abrev: "PAM", max: "pam_max", min: "pam_min", casas: 0 },
      { tipo: "par", id: "fc", rotulo: "FC", abrev: "FC", max: "fc_max", min: "fc_min", casas: 0 },
    ],
    rodape: [{ tipo: "texto", id: "ritmo", rotulo: "Ritmo", abrev: "" }, OBS],
  },
  tgi: {
    topo: [{ tipo: "texto", id: "dieta", rotulo: "Dieta", abrev: "dieta" }],
    metricas: [],
    rodape: [OBS],
  },
  renal: {
    topo: [],
    metricas: [
      { tipo: "num", id: "cr", rotulo: "Creatinina", abrev: "Cr", casas: 2 },
      { tipo: "num", id: "ur", rotulo: "Ureia", abrev: "U", casas: 1 },
      { tipo: "num", id: "diurese_6_18h_ml", rotulo: "Diurese 6–18 h", abrev: "diurese 6–18 h", casas: 0 },
      { tipo: "num", id: "bh_6_18h_ml", rotulo: "BH 6–18 h", abrev: "BH 6–18 h", casas: 0, sinal: true },
    ],
    rodape: [{ tipo: "texto", id: "descricao", rotulo: "Descrição", abrev: "" }, OBS],
  },
  hemato: {
    topo: [],
    metricas: [
      { tipo: "num", id: "hb", rotulo: "Hb", abrev: "Hb", casas: 1 },
      { tipo: "num", id: "ht", rotulo: "Ht", abrev: "Ht", casas: 1 },
      { tipo: "num", id: "plaq", rotulo: "Plaquetas", abrev: "plaquetas", casas: 0 },
    ],
    rodape: [OBS],
  },
  infecto: {
    topo: [{ tipo: "texto", id: "atb", rotulo: "Antibiótico", abrev: "ATB" }],
    metricas: [
      { tipo: "num", id: "tmax", rotulo: "T máx", abrev: "T máx", casas: 1 },
      { tipo: "num", id: "leuco", rotulo: "Leucócitos", abrev: "leucócitos", casas: 0 },
    ],
    rodape: [OBS],
  },
};

// ---------------------------------------------------------------------------
// Unidades — da DIMENSAO, nunca da cabeca do programador
// ---------------------------------------------------------------------------

/**
 * Campo do exame -> codigo em `evento_tipo_ref`. E de la que sai a unidade
 * (`unidade_padrao`), verbatim: se o banco diz "ipm" ou "C", e isso que aparece.
 * A tela nao reescreve conteudo do banco. Campo fora deste mapa sai sem unidade.
 *
 * ⛔ `leuco` e `plaq` estao FORA de proposito, e a razao importa:
 *    `evento_tipo_ref` declara os dois em "x10^3/uL", mas os JSONB de `evolucoes`
 *    gravam a CONTAGEM ABSOLUTA (leuco 13000, plaq 351000 — conferido no banco
 *    vivo). Sao escalas diferentes: carimbar a unidade da dimensao aqui exibiria
 *    "13.000 x10^3/uL" — erro de 1000x em prontuario. A unidade da dimensao vale
 *    para os valores de `eventos_clinicos` daquele codigo, NAO para este JSONB,
 *    que nao declara unidade nenhuma. Numero pelado > numero com unidade errada.
 */
export const CODIGO_EVENTO_POR_CAMPO: Readonly<Record<string, string>> = {
  fr: "fr",
  spo2: "spo2",
  pa_sys: "pa_sys",
  pa_dia: "pa_dia",
  pam: "pam",
  fc: "fc",
  cr: "cr",
  ur: "ur",
  hb: "hb",
  ht: "ht",
  tmax: "temp",
  rass: "rass",
};

/** Mapa `campo -> unidade` a partir da dimensao. Dimensao vazia => tudo null. */
export function mapaUnidades(refs: Map<string, EventoTipoRef> | null | undefined): Record<string, string | null> {
  const saida: Record<string, string | null> = {};
  for (const campo of Object.keys(CODIGO_EVENTO_POR_CAMPO)) {
    saida[campo] = refs?.get(CODIGO_EVENTO_POR_CAMPO[campo])?.unidade_padrao ?? null;
  }
  return saida;
}

/**
 * Unidade de um campo: dimensao primeiro; senao a unidade que o PROPRIO NOME do
 * campo carrega (`bh_6_18h_ml` => mL). Nenhuma das duas => null (sem unidade).
 */
function unidadeDoCampo(id: string, unidades?: Readonly<Record<string, string | null>> | null): string | null {
  const daDimensao = unidades?.[id];
  if (daDimensao) return daDimensao;
  if (id.endsWith("_ml")) return "mL";
  return null;
}

/** "%" cola no numero; o resto leva espaco ("36,8 °C", "98%"). */
function juntaUnidade(valor: string, unidade: string | null): string {
  if (!unidade) return valor;
  return unidade === "%" ? `${valor}%` : `${valor} ${unidade}`;
}

// ---------------------------------------------------------------------------
// Leitura segura do JSONB
// ---------------------------------------------------------------------------

/**
 * Um valor lido do JSONB. Numero SO quando o banco gravou numero — string
 * NUNCA e convertida (em "13.000" o ponto e milhar; parsear seria falsificar).
 */
interface Valor {
  n: number | null;
  s: string | null;
}

const VAZIO: Valor = { n: null, s: null };

function ler(dados: DadosSistema, chave: string): Valor {
  const v = dados ? dados[chave] : undefined;
  if (typeof v === "number") return Number.isFinite(v) ? { n: v, s: null } : VAZIO;
  if (typeof v === "string") {
    const t = v.trim();
    return t.length > 0 ? { n: null, s: t } : VAZIO;
  }
  if (typeof v === "boolean") return { n: null, s: v ? "sim" : "não" };
  return VAZIO;
}

function temValor(v: Valor): boolean {
  return v.n != null || v.s != null;
}

/** Numero formatado pt-BR (ou o texto cru). Ausente => null. */
function comoTexto(v: Valor, casas: number, sinal = false): string | null {
  if (v.n != null) {
    const base = num(v.n, casas);
    return sinal && v.n > 0 ? `+${base}` : base;
  }
  return v.s;
}

/** Resultado da leitura de um par MAX–MIN. */
interface Par {
  texto: string | null;
  /** So um lado do par existe — qual. */
  sozinho: "max" | "min" | null;
  /** max < min no banco: erro de origem. A tela sinaliza, nao corrige. */
  invertido: boolean;
}

function lerPar(dados: DadosSistema, campo: CampoPar): Par {
  const a = ler(dados, campo.max);
  const b = ler(dados, campo.min);
  const ta = comoTexto(a, campo.casas);
  const tb = comoTexto(b, campo.casas);
  if (ta != null && tb != null) {
    return { texto: `${ta}–${tb}`, sozinho: null, invertido: a.n != null && b.n != null && a.n < b.n };
  }
  if (ta != null) return { texto: ta, sozinho: "max", invertido: false };
  if (tb != null) return { texto: tb, sozinho: "min", invertido: false };
  return { texto: null, sozinho: null, invertido: false };
}

// ---------------------------------------------------------------------------
// Campos fora do contrato — dado gravado que o app nao conhece
// ---------------------------------------------------------------------------
function chavesConhecidas(sistema: SistemaId): Set<string> {
  const e = ESPEC[sistema];
  const set = new Set<string>();
  for (const c of e.topo) set.add(c.id);
  for (const c of e.rodape) set.add(c.id);
  for (const c of e.metricas) {
    if (c.tipo === "par") {
      set.add(c.max);
      set.add(c.min);
    } else {
      set.add(c.id);
    }
  }
  return set;
}

/** Valor cru de uma chave desconhecida, em texto. Objeto/array vira JSON. */
function extraComoTexto(v: Json | undefined): string | null {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? num(v, 2) : null;
  if (typeof v === "boolean") return v ? "sim" : "não";
  if (typeof v === "string") {
    const t = v.trim();
    return t.length > 0 ? t : null;
  }
  try {
    return JSON.stringify(v);
  } catch {
    return null;
  }
}

/** Pares [chave, valor] gravados no JSONB e ausentes do contrato conhecido. */
function extras(sistema: SistemaId, dados: DadosSistema): Array<[string, string]> {
  if (!dados) return [];
  const conhecidas = chavesConhecidas(sistema);
  const saida: Array<[string, string]> = [];
  for (const chave of Object.keys(dados)) {
    if (conhecidas.has(chave)) continue;
    const t = extraComoTexto(dados[chave]);
    if (t != null) saida.push([chave, t]);
  }
  return saida;
}

/** true = o JSONB do sistema nao tem NENHUM campo util (nem conhecido, nem extra). */
export function sistemaVazio(sistema: SistemaId, dados: DadosSistema): boolean {
  if (!dados) return true;
  const e = ESPEC[sistema];
  for (const c of e.topo) if (temValor(ler(dados, c.id))) return false;
  for (const c of e.rodape) if (temValor(ler(dados, c.id))) return false;
  for (const c of e.metricas) {
    if (c.tipo === "par") {
      if (temValor(ler(dados, c.max)) || temValor(ler(dados, c.min))) return false;
    } else if (temValor(ler(dados, c.id))) {
      return false;
    }
  }
  return extras(sistema, dados).length === 0;
}

// ---------------------------------------------------------------------------
// Texto corrido de UM sistema (consumido pela nota de prontuario)
// ---------------------------------------------------------------------------

/**
 * O sistema em uma frase: "ar ambiente; FR 20–16 irpm; SpO2 100–92%".
 * Diferenca deliberada em relacao ao painel: aqui campo AUSENTE e OMITIDO
 * (prosa clinica nao lista travessao). A ausencia continua explicita na aba
 * "Exame físico", que e o instrumento de conferencia. Sistema sem nada
 * nenhum => "nao avaliado" (nunca frase vazia, nunca frase inventada).
 */
export function textoSistema(
  sistema: SistemaId,
  dados: DadosSistema,
  unidades?: Readonly<Record<string, string | null>> | null,
): string {
  const e = ESPEC[sistema];
  const partes: string[] = [];

  for (const c of e.topo) {
    const t = comoTexto(ler(dados, c.id), 0);
    if (t) partes.push(c.abrev ? `${c.abrev} ${t}` : t);
  }

  for (const c of e.metricas) {
    const un = unidadeDoCampo(c.id, unidades);
    if (c.tipo === "par") {
      const p = lerPar(dados, c);
      if (!p.texto) continue;
      const marca = p.sozinho === "max" ? " (só máx)" : p.sozinho === "min" ? " (só mín)" : p.invertido ? " (máx < mín — REVISAR)" : "";
      partes.push(`${c.abrev} ${juntaUnidade(p.texto, un)}${marca}`);
    } else {
      const t = comoTexto(ler(dados, c.id), c.casas, c.sinal === true);
      if (t) partes.push(`${c.abrev} ${juntaUnidade(t, un)}`);
    }
  }

  for (const c of e.rodape) {
    const t = comoTexto(ler(dados, c.id), 0);
    if (t) partes.push(c.abrev ? `${c.abrev} ${t}` : t);
  }

  // Dado gravado fora do contrato entra tambem: some da nota = some do prontuario.
  for (const [chave, valor] of extras(sistema, dados)) partes.push(`${chave} ${valor}`);

  return partes.length > 0 ? partes.join("; ") : NAO_AVALIADO;
}

// ---------------------------------------------------------------------------
// Utilitarios da feature (datas e desmembramento da evolucao)
// ---------------------------------------------------------------------------

/** Os 7 JSONB da evolucao, indexados pelo id do sistema. */
export function sistemasDaEvolucao(
  e: Pick<Evolucao, "neuro" | "resp" | "hemo" | "tgi" | "renal" | "hemato" | "infecto">,
): Readonly<Record<SistemaId, DadosSistema>> {
  return {
    neuro: e.neuro,
    resp: e.resp,
    hemo: e.hemo,
    tgi: e.tgi,
    renal: e.renal,
    hemato: e.hemato,
    infecto: e.infecto,
  };
}

/** "AAAA-MM-DD..." -> [ano, mes, dia]. Formato desconhecido => null (nao adivinha). */
function partesData(iso: string | null | undefined): [number, number, number] | null {
  const m = typeof iso === "string" ? /^(\d{4})-(\d{2})-(\d{2})/.exec(iso) : null;
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

/**
 * "2026-07-18 00:00:00+00" -> "18/07/2026".
 * Le o DIA COMO GRAVADO (prefixo ISO), sem converter fuso: a evolucao e gravada
 * com a data do PLANTAO a meia-noite UTC; converter para America/Sao_Paulo
 * jogaria a nota para o dia anterior. Formato irreconhecivel => travessao.
 */
export function fmtDataBR(iso: string | null | undefined): string {
  const d = partesData(iso);
  return d ? `${String(d[2]).padStart(2, "0")}/${String(d[1]).padStart(2, "0")}/${d[0]}` : TRAVESSAO;
}

const FMT_DIA_LOCAL = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Dias inteiros entre a data gravada e hoje (fuso do plantao). Futuro/ilegivel => null. */
export function diasDesde(iso: string | null | undefined): number | null {
  const alvo = partesData(iso);
  if (!alvo) return null;
  const partes = FMT_DIA_LOCAL.formatToParts(new Date());
  const parte = (t: string): string => partes.find((x: Intl.DateTimeFormatPart) => x.type === t)?.value ?? "";
  const hoje = partesData(`${parte("year")}-${parte("month")}-${parte("day")}`);
  if (!hoje) return null;
  const dias = Math.round(
    (Date.UTC(hoje[0], hoje[1] - 1, hoje[2]) - Date.UTC(alvo[0], alvo[1] - 1, alvo[2])) / 86_400_000,
  );
  return dias >= 0 ? dias : null;
}

// ---------------------------------------------------------------------------
// Pecas visuais (estilo inline: painel e leitura pura, sem hover/foco)
// ---------------------------------------------------------------------------
const EYEBROW: CSSProperties = {
  fontSize: "var(--text-2xs, 10px)",
  fontWeight: 700,
  letterSpacing: "var(--tracking-eyebrow, .08em)",
  textTransform: "uppercase",
  color: "var(--text-muted)",
};

const SELO_BASE: CSSProperties = {
  display: "inline-block",
  marginLeft: 6,
  padding: "1px 6px",
  borderRadius: "var(--radius-pill, 9999px)",
  fontSize: "var(--text-2xs, 10px)",
  fontWeight: 700,
  letterSpacing: "var(--tracking-wide, .04em)",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

function Selo({ tom, children, titulo }: { tom: "aviso" | "erro"; children: string; titulo: string }): ReactElement {
  const cor = tom === "erro" ? "var(--danger)" : "var(--warning)";
  return (
    <span
      title={titulo}
      style={{
        ...SELO_BASE,
        color: cor,
        background: `color-mix(in srgb, ${cor} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${cor} 34%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

/** Celula do instrumento: rotulo em cima, numero mono embaixo. Vazio => travessao. */
function Celula({
  rotulo,
  valor,
  unidade,
  titulo,
  selo,
}: {
  rotulo: string;
  valor: string | null;
  unidade: string | null;
  titulo: string;
  selo?: ReactElement | null;
}): ReactElement {
  const vazio = valor == null;
  return (
    <div title={titulo} style={{ background: "var(--surface-card)", padding: "8px 10px", minWidth: 0 }}>
      <div style={EYEBROW}>{rotulo}</div>
      <div
        className="tabnum"
        style={{
          marginTop: 2,
          fontSize: "var(--text-md, 17px)",
          fontWeight: 700,
          lineHeight: "var(--leading-tight, 1.15)",
          color: vazio ? "var(--text-faint)" : "var(--text-heading)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {valor ?? TRAVESSAO}
        {!vazio && unidade ? (
          <span style={{ fontSize: "var(--text-xs, 11px)", fontWeight: 600, color: "var(--text-muted)" }}>
            {unidade === "%" ? "" : " "}
            {unidade}
          </span>
        ) : null}
      </div>
      {selo ?? null}
    </div>
  );
}

/** Bloco de texto clinico (preserva as quebras escritas pelo medico). */
function Bloco({ rotulo, valor, titulo }: { rotulo: string; valor: string | null; titulo: string }): ReactElement {
  return (
    <div title={titulo} style={{ minWidth: 0 }}>
      <span style={EYEBROW}>{rotulo}</span>
      <p
        style={{
          margin: "2px 0 0",
          whiteSpace: "pre-wrap",
          fontSize: "var(--text-sm, 13px)",
          lineHeight: "var(--leading-snug, 1.35)",
          color: valor ? "var(--text-body)" : "var(--text-faint)",
        }}
      >
        {valor ?? TRAVESSAO}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export interface SystemPanelProps {
  sistema: SistemaId;
  /** O JSONB cru daquele sistema (evolucoes.<sistema>). */
  dados: DadosSistema;
  /** Mapa campo -> unidade, montado pela pagina a partir de evento_tipo_ref. */
  unidades?: Readonly<Record<string, string | null>> | null;
}

export function SystemPanel({ sistema, dados, unidades }: SystemPanelProps): ReactElement {
  const e = ESPEC[sistema];
  const idTitulo = `sys-${sistema}`;
  const vazio = sistemaVazio(sistema, dados);
  const listaExtras = extras(sistema, dados);
  const temPar = e.metricas.some((c: CampoPar | CampoNum) => c.tipo === "par");

  return (
    <section
      aria-labelledby={idTitulo}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "12px 14px",
        minWidth: 0,
        background: `var(--sys-${sistema}-bg)`,
        border: "1px solid var(--border-default)",
        borderLeft: `4px solid var(--sys-${sistema}-bar)`,
        borderRadius: "var(--radius-lg, 12px)",
      }}
    >
      <h3
        id={idTitulo}
        style={{
          margin: 0,
          fontSize: "var(--text-sm, 13px)",
          fontWeight: 700,
          letterSpacing: "var(--tracking-eyebrow, .08em)",
          textTransform: "uppercase",
          color: `var(--sys-${sistema})`,
        }}
      >
        {ROTULO_SISTEMA[sistema]}
      </h3>

      {vazio ? (
        <p
          title={`evolucoes.${sistema} veio sem nenhum campo nesta evolução — o app não preenche o vazio`}
          style={{ margin: 0, fontSize: "var(--text-sm, 13px)", fontWeight: 600, color: "var(--text-faint)" }}
        >
          {NAO_AVALIADO}
        </p>
      ) : (
        <>
          {/* identidade do sistema — sempre visivel (ausencia e informacao) */}
          {e.topo.map((c: CampoTexto) => (
            <Bloco
              key={c.id}
              rotulo={c.rotulo}
              valor={comoTexto(ler(dados, c.id), 0)}
              titulo={`evolucoes.${sistema}.${c.id}`}
            />
          ))}

          {/* instrumento — pares em MAXIMO–MINIMO, sempre visiveis */}
          {e.metricas.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(108px, 1fr))",
                gap: 1,
                background: "var(--border-subtle)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md, 8px)",
                overflow: "hidden",
              }}
            >
              {e.metricas.map((c: CampoPar | CampoNum) => {
                const un = unidadeDoCampo(c.id, unidades);
                if (c.tipo === "par") {
                  const p = lerPar(dados, c);
                  const selo = p.invertido ? (
                    <Selo tom="erro" titulo={`${c.rotulo}: o banco gravou máximo menor que mínimo — o app não corrige o dado`}>
                      máx &lt; mín
                    </Selo>
                  ) : p.sozinho === "max" ? (
                    <Selo tom="aviso" titulo={`${c.rotulo}: só o máximo foi registrado — não há par`}>só máx</Selo>
                  ) : p.sozinho === "min" ? (
                    <Selo tom="aviso" titulo={`${c.rotulo}: só o mínimo foi registrado — não há par`}>só mín</Selo>
                  ) : null;
                  return (
                    <Celula
                      key={c.id}
                      rotulo={c.rotulo}
                      valor={p.texto}
                      unidade={un}
                      selo={selo}
                      titulo={`evolucoes.${sistema}.${c.max} – .${c.min} (máximo–mínimo)`}
                    />
                  );
                }
                return (
                  <Celula
                    key={c.id}
                    rotulo={c.rotulo}
                    valor={comoTexto(ler(dados, c.id), c.casas, c.sinal === true)}
                    unidade={un}
                    titulo={`evolucoes.${sistema}.${c.id}`}
                  />
                );
              })}
            </div>
          ) : null}

          {temPar ? (
            <span style={{ ...EYEBROW, color: "var(--text-faint)" }}>pares em máximo–mínimo</span>
          ) : null}

          {/* anotacao livre — so quando existe */}
          {e.rodape.map((c: CampoTexto) => {
            const v = comoTexto(ler(dados, c.id), 0);
            return v ? <Bloco key={c.id} rotulo={c.rotulo} valor={v} titulo={`evolucoes.${sistema}.${c.id}`} /> : null;
          })}

          {/* dado gravado fora do contrato — aparece cru, nunca some */}
          {listaExtras.length > 0 ? (
            <div>
              <span style={{ ...EYEBROW, color: "var(--warning)" }}>outros campos registrados</span>
              <ul style={{ margin: "2px 0 0", padding: 0, listStyle: "none" }}>
                {listaExtras.map(([chave, valor]: [string, string]) => (
                  <li
                    key={chave}
                    title={`evolucoes.${sistema}.${chave} — campo fora do contrato conhecido, exibido como está`}
                    style={{ fontSize: "var(--text-xs, 11px)", lineHeight: "var(--leading-snug, 1.35)", color: "var(--text-body)" }}
                  >
                    <code className="tabnum" style={{ color: "var(--text-muted)" }}>
                      {chave}
                    </code>{" "}
                    <span className="tabnum" style={{ fontWeight: 600 }}>
                      {valor}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

export default SystemPanel;
