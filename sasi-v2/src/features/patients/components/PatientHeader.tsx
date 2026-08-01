// ============================================================================
// SASI v2 — PatientHeader
// ----------------------------------------------------------------------------
// Faixa de identificacao do paciente (Server Component: so leitura, sem estado).
// Fonte: 1 linha da tabela `pacientes` (getPaciente). Nada aqui e calculado por
// regra clinica — SOFA, tendencias e escores vem do banco, nas abas.
//
// DOUTRINA:
//  - ZERO ALUCINACAO: campo ausente vira travessao "—". Nunca 0, nunca chute.
//  - Numeros em .tabnum (mono + tabular-nums).
//  - Cor SEMPRE por token (--grav-*, --text-*, --surface-*). Zero hex.
//  - Alergia e isolamento sao sinal de seguranca: aparecem em destaque.
//
// Exporta tambem os utilitarios que o INDICE (/patients) reusa, para nao
// duplicar a escala de gravidade nem a conta de dias de internacao.
// ============================================================================
import type {CSSProperties, ReactElement, ReactNode} from "react";
import Link from "next/link";
import type {Isolamento, Paciente, StatusLeito} from "@/types/clinical";
import {type Gravity, gravityDe} from "@/features/war-room/triage";

/** Ausencia de dado. Uma unica forma no app inteiro. */
export const TRAVESSAO = "—";

// ---------------------------------------------------------------------------
// Rotulos pt-BR dos vocabularios fechados do banco
// ---------------------------------------------------------------------------
export const ROTULO_GRAVIDADE: Record<Gravity, string> = {
  stable: "Estável",
  watcher: "Vigilância",
  unstable: "Instável",
  critical: "Crítico",
  deceased: "Óbito",
};

export const ROTULO_ISOLAMENTO: Record<Isolamento, string> = {
  none: TRAVESSAO,
  contact: "Contato",
  droplet: "Gotículas",
  aerosol: "Aerossóis",
};

export const ROTULO_STATUS: Record<StatusLeito, string> = {
  ativo: "Ativo",
  alta: "Alta",
  obito: "Óbito",
  transferencia: "Transferência",
};

// ---------------------------------------------------------------------------
// Utilitarios de leitura segura (exportados: o indice usa os mesmos)
// ---------------------------------------------------------------------------

/** Texto util ou null. String vazia/so espaco nao e dado. */
export function txt(v: string | null | undefined): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

/** Numero util ou null. NUNCA converte ausencia em 0 (numeric do PostgREST pode vir string). */
export function numeroOuNull(v: number | string | null | undefined): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

// Vocabulario de NEGACAO de alergia. Comeca com uma dessas palavras E o resto e
// so preenchimento => o campo NEGA alergia (sinal tranquilizador, sem alarme).
const ALERGIA_NEG_INICIO = /^(nkda|nka|nega\w*|nego|nenhum\w*|sem|ausente\w*|nao|nunca|isento\w*|desconhec\w*)$/;
const ALERGIA_NEG_PREENCHIMENTO = new Set([
  "alergia", "alergias", "alergico", "alergica", "alergicos", "alergicas",
  "medicamento", "medicamentos", "medicamentosa", "medicamentosas", "medicamentoso",
  "conhecida", "conhecidas", "conhecido", "conhecidos", "previa", "previas", "previo", "previos",
  "referida", "referidas", "referido", "relatada", "relatadas", "relatado", "relata", "relatar",
  "droga", "drogas", "alimentar", "alimentares", "substancia", "substancias",
  "a", "ao", "aos", "as", "de", "do", "da", "para", "com", "e", "ou", "que", "o", "os",
  "sabe", "refere", "possui", "tem", "ha", "informar", "informa", "informado", "informacao",
  "nada", "consta", "ate", "momento", "presente", "atual", "atuais", "no", "na", "sic",
]);

/**
 * Classifica o texto de alergia em: alergia REAL (merece destaque de alerta),
 * NEGADA (paciente nega — sinal tranquilizador, sem cor de alarme) ou ausente (null).
 *
 * MOTIVO CLINICO: antes, qualquer texto pintava a faixa de VERMELHO — inclusive
 * "Nega alergias". Isso inverte o sinal: os leitos SEM alergia ficavam com a cara
 * de perigo, gerando fadiga de alarme. Agora o vermelho fica reservado a alergia
 * de verdade. Na DUVIDA, classificamos como REAL: e mais seguro um alarme a mais
 * do que esconder uma alergia verdadeira.
 */
export function classificaAlergia(v: string | null | undefined): "real" | "negada" | null {
  const t = txt(v);
  if (!t) return null;
  const limpo = t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // tira acento
    .replace(/[.,;:!()/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const toks = limpo.split(" ").filter(Boolean);
  if (toks.length === 0) return null;
  if (!ALERGIA_NEG_INICIO.test(toks[0])) return "real";
  // primeiro token nega; so e negacao pura se TODO o resto for preenchimento.
  return toks.slice(1).every((w) => ALERGIA_NEG_PREENCHIMENTO.has(w)) ? "negada" : "real";
}

/**
 * Quebra a HD (hipoteses diagnosticas) em problemas SEPARADOS — mas so quando o
 * medico marcou a separacao com quebra de linha ou ";". A virgula NAO separa (ela
 * costuma estar DENTRO de um mesmo diagnostico), entao nao inventamos divisao que
 * o autor nao fez. Remove marcadores de lista no inicio de cada item ("1.", "-").
 * Um problema so => devolve [texto] e a tela mostra como prosa (nao vira lista de 1).
 */
export function problemasDeHD(hd: string | null | undefined): string[] {
  const t = txt(hd);
  if (!t) return [];
  const partes = t
    .split(/[\n;]+/)
    .map((s) => s.replace(/^\s*(?:\d{1,2}\s*[.)\-]|[-–•*])\s*/, "").trim())
    .filter((s) => s.length > 0);
  return partes.length > 0 ? partes : [t];
}

/**
 * Rotulo do leito. No banco vivo `leito` ja vem no padrao canonico "UTI2-L01"
 * (CLAUDE.md §1), entao repetir a UTI ao lado seria ruido. Se o leito NAO
 * trouxer o prefixo, mostramos "UTI2 · L01" — sem nunca reescrever o dado.
 */
export function rotuloLeito(uti: string, leito: string | null | undefined): string {
  const l = txt(leito);
  if (!l) return uti;
  return l.toUpperCase().startsWith(uti.toUpperCase()) ? l : `${uti} · ${l}`;
}

/** Numero formatado pt-BR (virgula decimal) ou travessao. */
export function fmtNum(v: number | string | null | undefined, casas = 0): string {
  const n = numeroOuNull(v);
  return n == null ? TRAVESSAO : n.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: casas
  });
}

// Fuso do plantao — mesmo de lib/data/eventos.ts (America/Sao_Paulo).
const TZ_PLANTAO = "America/Sao_Paulo";
const FMT_DIA = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ_PLANTAO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "AAAA-MM-DD" de hoje no fuso do plantao. */
function hojeLocal(): string {
  const partes = FMT_DIA.formatToParts(new Date());
  const parte = (t: string): string => partes.find((x: Intl.DateTimeFormatPart) => x.type === t)?.value ?? "";
  return `${parte("year")}-${parte("month")}-${parte("day")}`;
}

/** "AAAA-MM-DD..." -> [ano, mes, dia] ou null (nao tenta adivinhar formato). */
function partesData(iso: string | null | undefined): [number, number, number] | null {
  const m = typeof iso === "string" ? /^(\d{4})-(\d{2})-(\d{2})/.exec(iso) : null;
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

/**
 * Dias de internacao = hoje (fuso do plantao) − data_adm.
 * Data ausente/ilegivel => null (a tela mostra "—"). Data futura => null.
 */
export function diasInternacao(dataAdm: string | null | undefined): number | null {
  const adm = partesData(dataAdm);
  const hoje = partesData(hojeLocal());
  if (!adm || !hoje) return null;
  const dias = Math.round(
    (Date.UTC(hoje[0], hoje[1] - 1, hoje[2]) - Date.UTC(adm[0], adm[1] - 1, adm[2])) / 86_400_000,
  );
  return dias >= 0 ? dias : null;
}

/** "AAAA-MM-DD" -> "dd/mm/aaaa". Sem data => travessao. */
export function fmtData(iso: string | null | undefined): string {
  const d = partesData(iso);
  return d ? `${String(d[2]).padStart(2, "0")}/${String(d[1]).padStart(2, "0")}/${d[0]}` : TRAVESSAO;
}

/**
 * Gravidade na escala do design system, a partir da linha crua de `pacientes`.
 * Reusa gravityDe (features/war-room/triage) — fonte unica da escala.
 * delta_sofa_24h/pendencias so existem na vw_dashboard_uti: quem tiver, passa em `extra`.
 */
export function gravityDoPaciente(
  p: Pick<Paciente, "gravidade" | "severidade_visual" | "out_of_range_count">,
  extra?: { delta_sofa_24h?: number | null; pendencias_abertas?: number | null },
): Gravity {
  return gravityDe({
    gravidade: p.gravidade,
    severidade_visual: p.severidade_visual,
    out_of_range_count: p.out_of_range_count,
    delta_sofa_24h: extra?.delta_sofa_24h ?? null,
    pendencias_abertas: extra?.pendencias_abertas ?? 0,
  });
}

// ---------------------------------------------------------------------------
// Pecas visuais reusadas pelo indice
// ---------------------------------------------------------------------------
const ESTILO_EYEBROW: CSSProperties = {
  fontSize: "var(--text-2xs, 10px)",
  fontWeight: 700,
  letterSpacing: "var(--tracking-eyebrow, .08em)",
  textTransform: "uppercase",
  color: "var(--text-muted)",
};

/** Badge de gravidade (escala estavel → obito). Cor 100% token. */
export function GravityBadge({gravity, titulo}: {
  gravity: Gravity;
  titulo?: string
}): ReactElement {
  return (
    <span
      title={titulo}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: "var(--radius-pill, 9999px)",
        background: `var(--grav-${gravity}-bg)`,
        color: `var(--grav-${gravity}-text)`,
        border: `1px solid var(--grav-${gravity}-solid)`,
        fontSize: "var(--text-2xs, 10px)",
        fontWeight: 700,
        letterSpacing: "var(--tracking-eyebrow, .08em)",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: `var(--grav-${gravity}-solid)`,
          flex: "0 0 auto"
        }}
      />
      {ROTULO_GRAVIDADE[gravity]}
    </span>
  );
}

/** Chip neutro (isolamento, status do leito, contagens). */
export function Chip({
                       children,
                       tom = "neutro",
                       titulo,
                     }: {
  children: ReactNode;
  tom?: "neutro" | "alerta" | "atencao";
  titulo?: string;
}): ReactElement {
  const cor =
    tom === "alerta"
      ? {
        bg: "var(--grav-critical-bg)",
        fg: "var(--grav-critical-text)",
        bd: "var(--grav-critical-solid)"
      }
      : tom === "atencao"
        ? {bg: "var(--badge-pend-bg)", fg: "var(--badge-pend-text)", bd: "transparent"}
        : {bg: "var(--surface-sunken)", fg: "var(--text-muted)", bd: "var(--border-default)"};
  return (
    <span
      title={titulo}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: "var(--radius-pill, 9999px)",
        background: cor.bg,
        color: cor.fg,
        border: `1px solid ${cor.bd}`,
        fontSize: "var(--text-2xs, 10px)",
        fontWeight: 700,
        letterSpacing: "var(--tracking-wide, .04em)",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Celula da regua de dados (instrumento: rotulo em cima, numero mono embaixo)
// ---------------------------------------------------------------------------
function Metrica({
                   rotulo,
                   valor,
                   unidade,
                   titulo,
                 }: {
  rotulo: string;
  valor: string;
  unidade?: string;
  titulo?: string;
}): ReactElement {
  const vazio = valor === TRAVESSAO;
  return (
    <div title={titulo}
         style={{background: "var(--surface-card)", padding: "9px 12px", minWidth: 0}}>
      <div style={ESTILO_EYEBROW}>{rotulo}</div>
      <div
        className="tabnum"
        style={{
          marginTop: 2,
          fontSize: "var(--text-md, 17px)",
          fontWeight: 700,
          lineHeight: "var(--leading-tight, 1.15)",
          color: vazio ? "var(--text-faint)" : "var(--text-heading)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {valor}
        {!vazio && unidade ? (
          <span style={{
            fontSize: "var(--text-xs, 11px)",
            fontWeight: 600,
            color: "var(--text-muted)"
          }}> {unidade}</span>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export interface PatientHeaderProps {
  paciente: Paciente;
}

export function PatientHeader({paciente}: PatientHeaderProps): ReactElement {
  const p = paciente;
  const gravity = gravityDoPaciente(p);
  const dias = diasInternacao(p.data_adm);

  // Alergia e informacao de SEGURANCA: se a coluna estiver vazia mas a ficha de
  // admissao tiver o dado, mostramos o da ficha (dado gravado, nao inventado).
  const alergias = txt(p.alergias) ?? txt(p.patient_summary?.alergias);
  const alergiaClasse = classificaAlergia(alergias);
  const isolamento = p.isolation !== "none" ? ROTULO_ISOLAMENTO[p.isolation] : null;
  const hd = txt(p.hd);
  const problemas = problemasDeHD(hd);

  return (
    <header className="pt-header">
      {/* linha 1 — volta, leito, gravidade, status */}
      <div className="pt-header__topo">
        <Link href="/patients" className="pt-voltar" title="Voltar para a lista de pacientes">
          <span aria-hidden="true">←</span>
          <span>Pacientes</span>
        </Link>

        <span
          className="tabnum"
          style={{
            padding: "4px 10px",
            borderRadius: "var(--radius-sm, 6px)",
            background: "var(--surface-sunken)",
            border: "1px solid var(--border-default)",
            color: "var(--text-heading)",
            fontSize: "var(--text-sm, 13px)",
            fontWeight: 700,
            letterSpacing: "var(--tracking-wide, .04em)",
          }}
        >
          {rotuloLeito(p.uti, p.leito)}
        </span>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginLeft: "auto",
          flexWrap: "wrap"
        }}>
          {p.status_leito !== "ativo" ? (
            <Chip tom="atencao" titulo="Status do leito (pacientes.status_leito)">
              {ROTULO_STATUS[p.status_leito]}
            </Chip>
          ) : null}
          {isolamento ? (
            <Chip tom="atencao" titulo="Precaução de isolamento (pacientes.isolation)">
              Isolamento · {isolamento}
            </Chip>
          ) : null}
          <GravityBadge gravity={gravity} titulo="Gravidade (escala do War Room)"/>
        </div>
      </div>

      {/* linha 2 — nome + hipoteses diagnosticas */}
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: "var(--text-xl, 24px)",
            fontWeight: 700,
            lineHeight: "var(--leading-tight, 1.15)",
            color: "var(--text-heading)",
          }}
        >
          {txt(p.nome) ?? TRAVESSAO}
        </h2>
        {problemas.length > 1 ? (
          <div title="Hipóteses diagnósticas / problemas ativos (pacientes.hd)"
               style={{margin: "4px 0 0"}}>
            <span style={ESTILO_EYEBROW}>HD</span>
            <ol
              style={{
                margin: "3px 0 0",
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {problemas.map((prob: string, i: number) => (
                <li
                  key={`${i}-${prob}`}
                  style={{
                    display: "flex",
                    gap: 8,
                    fontSize: "var(--text-sm, 13px)",
                    lineHeight: "var(--leading-snug, 1.35)",
                    color: "var(--text-body)",
                  }}
                >
                  <span className="tabnum"
                        style={{flex: "0 0 auto", fontWeight: 700, color: "var(--text-faint)"}}>
                    {i + 1}.
                  </span>
                  <span style={{minWidth: 0}}>{prob}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <p
            title="Hipóteses diagnósticas / problemas ativos (pacientes.hd)"
            style={{
              margin: "4px 0 0",
              fontSize: "var(--text-sm, 13px)",
              lineHeight: "var(--leading-snug, 1.35)",
              color: hd ? "var(--text-body)" : "var(--text-faint)",
            }}
          >
            <span style={ESTILO_EYEBROW}>HD </span>
            {hd ?? TRAVESSAO}
          </p>
        )}
      </div>

      {/* linha 3 — alergias (sinal de seguranca) */}
      {/* VERMELHO so para alergia REAL. "Nega" fica neutro (sem fadiga de alarme). */}
      {alergiaClasse === "real" ? (
        <div
          role="note"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "8px 12px",
            borderRadius: "var(--radius-md, 8px)",
            background: "var(--grav-critical-bg)",
            border: "1px solid var(--grav-critical-solid)",
            color: "var(--grav-critical-text)",
          }}
        >
          <strong style={{
            ...ESTILO_EYEBROW,
            color: "var(--grav-critical-text)",
            paddingTop: 2,
            flex: "0 0 auto"
          }}>
            <span aria-hidden="true">⚠ </span>Alergias
          </strong>
          <span style={{
            fontSize: "var(--text-sm, 13px)",
            fontWeight: 600,
            lineHeight: "var(--leading-snug, 1.35)"
          }}>
            {alergias}
          </span>
        </div>
      ) : alergiaClasse === "negada" ? (
        <div
          role="note"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            padding: "6px 12px",
            borderRadius: "var(--radius-md, 8px)",
            background: "var(--surface-sunken)",
            border: "1px solid var(--border-default)",
          }}
        >
          <strong style={{
            ...ESTILO_EYEBROW,
            color: "var(--text-muted)",
            flex: "0 0 auto"
          }}>Alergias</strong>
          <span
            style={{
              fontSize: "var(--text-sm, 13px)",
              fontWeight: 600,
              lineHeight: "var(--leading-snug, 1.35)",
              color: "var(--text-body)",
            }}
          >
            {alergias}
          </span>
        </div>
      ) : (
        <div style={{...ESTILO_EYEBROW, color: "var(--text-faint)"}}>
          Alergias {TRAVESSAO} <span style={{textTransform: "none", letterSpacing: 0}}>(não informadas)</span>
        </div>
      )}

      {/* linha 4 — regua de dados */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(104px, 1fr))",
          gap: 1,
          background: "var(--border-subtle)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg, 12px)",
          overflow: "hidden",
        }}
      >
        <Metrica rotulo="Idade" valor={fmtNum(p.idade, 0)} unidade="a" titulo="pacientes.idade"/>
        <Metrica rotulo="Peso" valor={fmtNum(p.peso, 1)} unidade="kg" titulo="pacientes.peso"/>
        <Metrica rotulo="Altura" valor={fmtNum(p.altura, 0)} unidade="cm"
                 titulo="pacientes.altura (cm)"/>
        <Metrica rotulo="IMC" valor={fmtNum(p.imc, 1)}
                 titulo="Coluna gerada no banco: peso / altura²"/>
        <Metrica rotulo="Admissão" valor={fmtData(p.data_adm)} titulo="pacientes.data_adm"/>
        <Metrica
          rotulo="Internação"
          valor={dias == null ? TRAVESSAO : String(dias)}
          unidade={dias == null ? undefined : dias === 1 ? "dia" : "dias"}
          titulo="Hoje − data de admissão (fuso America/Sao_Paulo)"
        />
        <Metrica
          rotulo="SOFA basal"
          valor={fmtNum(p.sofa_baseline, 0)}
          titulo="pacientes.sofa_baseline — referência da admissão, não é o SOFA atual"
        />
      </div>
    </header>
  );
}

export default PatientHeader;
