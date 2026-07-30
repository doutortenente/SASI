// ============================================================================
// SASI v2 — HandoffCard · PASSAGEM DE TURNO (3 linhas por leito)
// ----------------------------------------------------------------------------
// Padrao SASI de passagem — EXATAMENTE 3 linhas por leito:
//   1. SINTESE            leito · nome · idade · dias de UTI · gravidade · HD
//   2. O QUE MUDOU        SOFA e Δ 24 h · conduta vigente · suporte em curso · ATB D+n
//   3. PENDENCIAS/RISCOS  pendencias abertas · riscos da evolucao · isolamento · alergias
//
// A MESMA funcao pura monta o que aparece na tela, o que sai na impressao e o
// que vai para a area de transferencia (`linhasDoLeito` / `textoDaPassagem`).
// Tela, papel e WhatsApp nunca divergem — nao ha um segundo formatador.
//
// Este componente NAO le o banco: recebe tudo pronto de /handoff/page.tsx.
//
// DOUTRINA APLICADA
//  - ZERO ALUCINACAO: campo ausente vira "—". Ausencia de REGISTRO e dita com
//    todas as letras ("sem conduta registrada", "alergias não registradas") —
//    nunca vira "sem alergia", nunca vira 0.
//  - Nada de sinal vital aqui: o formato Maximo-Minimo mora na evolucao/vitals.
//    A passagem carrega problema, conduta, suporte, pendencia e risco.
//  - Cor sempre via token (--grav-*, --sofa-*, --text-*). Zero hex.
//  - Numero em fonte mono tabular (.tabnum).
//  - Texto puro de export: pt-BR, sem markdown, sem emoji, 3 linhas por leito.
// ============================================================================
import { unidadeSegura } from "@/lib/formatters/br";
import Link from "next/link";
import type { ReactElement } from "react";
import { ROTULO_GRAVIDADE } from "@/features/beds/components/BedCard";
import type { Gravity } from "@/features/war-room/triage";
import type { VwDiasAtbAtivo } from "@/lib/data";
import { num } from "@/lib/formatters/br";
import type {
  Dispositivos,
  Evolucao,
  Infusao,
  Isolamento,
  Pendencia,
  RiscosFlags,
  VwDashboardUti,
} from "@/types/clinical";

// ---------------------------------------------------------------------------
// Contrato de entrada (montado no Server Component da pagina)
// ---------------------------------------------------------------------------

/** Tudo que a passagem de UM leito precisa. Cada campo vem de uma fonte declarada. */
export interface HandoffLeito {
  /** vw_dashboard_uti + gravidade calculada por features/war-room/triage. */
  leito: VwDashboardUti & { gravity: Gravity };
  /** evolucoes: a mais recente (conduta, suporte, riscos). Sem evolucao => null. */
  evolucao: Evolucao | null;
  /** pendencias: apenas as abertas (concluida = false), ja ordenadas por prioridade. */
  pendencias: Pendencia[];
  /** vw_dias_atb_ativo: antibioticos EM CURSO, com D+n e flag de stewardship. */
  atbs: VwDiasAtbAtivo[];
  /** pacientes.alergias (a view nao traz). null = NAO REGISTRADO, nao "sem alergia". */
  alergias: string | null;
  /** pacientes.riscos_flags (a view nao traz). */
  riscosFlags: RiscosFlags | null;
}

/** As 3 linhas ja montadas, na ordem do padrao SASI. */
export interface LinhasHandoff {
  sintese: string;
  mudou: string;
  riscos: string;
}

// ---------------------------------------------------------------------------
// Vocabulario pt-BR
// ---------------------------------------------------------------------------
const TRAVESSAO = "—";

const ROTULO_ISOLAMENTO: Record<Isolamento, string> = {
  none: "",
  contact: "contato",
  droplet: "gotículas",
  aerosol: "aerossóis",
};

/** Mesmo vocabulario de stewardship da tela de prescricao (AtbStewardship). */
const ROTULO_STEWARDSHIP: Record<string, string> = {
  ok: "em curso",
  warning: "reavaliar",
  critical: "reavaliar já",
};

const ROTULO_RISCO_FLAG: ReadonlyArray<{ chave: keyof RiscosFlags; rotulo: string }> = [
  { chave: "pav", rotulo: "PAV" },
  { chave: "broncoaspiracao", rotulo: "broncoaspiração" },
  { chave: "upp", rotulo: "UPP" },
  { chave: "queda", rotulo: "queda" },
  { chave: "diabetico", rotulo: "diabético" },
];

/** Dispositivos na ordem clinica (via aerea -> acessos -> sondas/drenos). */
const ORDEM_DISPOSITIVOS: ReadonlyArray<{ chave: keyof Dispositivos; rotulo: string }> = [
  { chave: "iot", rotulo: "IOT" },
  { chave: "tqt", rotulo: "TQT" },
  { chave: "cvc", rotulo: "CVC" },
  { chave: "picc", rotulo: "PICC" },
  { chave: "shilley", rotulo: "Shilley" },
  { chave: "pai", rotulo: "PAI" },
  { chave: "mpd", rotulo: "MPD" },
  { chave: "svd", rotulo: "SVD" },
  { chave: "sne", rotulo: "SNE" },
  { chave: "dreno", rotulo: "dreno" },
  { chave: "avp", rotulo: "AVP" },
];

// ---------------------------------------------------------------------------
// Helpers puros (nunca inventam valor; colapsam quebra de linha para nao
// estourar o formato de 3 linhas do texto exportado)
// ---------------------------------------------------------------------------

/** String util em UMA linha, ou null. Aceita `unknown` porque JSONB e frouxo. */
function txt(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.replace(/\s+/g, " ").trim();
  return s.length > 0 ? s : null;
}

/** Delta de SOFA em 24 h: "+2" subiu · "-1" caiu · "0" estavel · "—" sem base. */
function deltaTexto(d: number | null | undefined): string {
  if (d == null) return TRAVESSAO;
  if (d > 0) return `+${num(d, 0)}`;
  if (d < 0) return `-${num(Math.abs(d), 0)}`;
  return "0";
}

/**
 * Rotulo de uma infusao. So imprime o que veio no JSONB: dose + unidade se
 * existirem; senao a vazao no campo que o banco preencheu. NUNCA converte
 * unidade, nunca completa dose ausente.
 */
function rotuloInfusao(i: Infusao): string | null {
  const droga = txt(i.droga);
  if (!droga) return null;
  const dose = txt(i.dose);
  if (dose) {
    const un = unidadeSegura(txt(i.unidade));
    return un ? `${droga} ${dose} ${un}` : `${droga} ${dose}`;
  }
  if (i.vazao_mcg_h != null) return `${droga} ${num(i.vazao_mcg_h, 1)} mcg/h`;
  if (i.vazao_mg_h != null) return `${droga} ${num(i.vazao_mg_h, 1)} mg/h`;
  if (i.vazao_ml_h != null) return `${droga} ${num(i.vazao_ml_h, 1)} ml/h`;
  return droga;
}

function infusoes(lista: Infusao[] | null | undefined): string[] {
  if (!Array.isArray(lista)) return [];
  return lista.map(rotuloInfusao).filter((t: string | null): t is string => t !== null);
}

function dispositivosAtivos(d: Dispositivos | null | undefined): string[] {
  if (!d) return [];
  return ORDEM_DISPOSITIVOS.filter((x) => d[x.chave] === true).map((x) => x.rotulo);
}

/** Condutas da ultima evolucao: prefere `condutas_sistemas` (traz sistema e meta). */
function condutasEmTexto(e: Evolucao | null): string[] {
  if (!e) return [];
  const ricas = Array.isArray(e.condutas_sistemas) ? e.condutas_sistemas : [];
  if (ricas.length > 0) {
    return ricas
      .map((c) => {
        const corpo = txt(c?.texto);
        if (!corpo) return null;
        const sistema = txt(c?.sistema);
        const meta = txt(c?.meta);
        return `${sistema ? `${sistema}: ` : ""}${corpo}${meta ? ` (meta ${meta})` : ""}`;
      })
      .filter((t: string | null): t is string => t !== null);
  }
  const simples = Array.isArray(e.conduta) ? e.conduta : [];
  return simples.map(txt).filter((t: string | null): t is string => t !== null);
}

/** minusculas sem acento — para comparar "PAV (alto)" com o flag "pav". */
const semAcento = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/**
 * Riscos: os da evolucao (texto livre, com nivel) + os flags do cadastro
 * (riscos_flags: checklist fixo de protocolo).
 *
 * Os dois se sobrepoem na pratica — a evolucao escreve "PAV (alto)" e o
 * cadastro marca pav=true. O flag so entra se a evolucao ainda NAO falou dele
 * (comparacao por palavra inteira, sem acento), senao a linha 3 sairia
 * "PAV (alto); PAV" e pareceria defeito do relatorio.
 */
function riscosEmTexto(h: HandoffLeito): string[] {
  const out: string[] = [];
  const e = h.evolucao;
  const daEvolucao = e !== null && Array.isArray(e.riscos) ? e.riscos : [];
  for (const r of daEvolucao) {
    const corpo = txt(r?.texto);
    if (!corpo) continue;
    const nivel = txt(r?.nivel);
    out.push(nivel ? `${corpo} (${nivel})` : corpo);
  }

  const flags = h.riscosFlags;
  if (flags) {
    const ditos = out.map(semAcento);
    for (const f of ROTULO_RISCO_FLAG) {
      if (flags[f.chave] !== true) continue;
      const alvo = semAcento(f.rotulo);
      const jaDito = ditos.some((d: string) => new RegExp(`(^|[^a-z0-9])${alvo}([^a-z0-9]|$)`).test(d));
      if (!jaDito) out.push(f.rotulo);
    }
  }
  return out;
}

/** Antibiotico em curso: "Meropenem D+7 EV (reavaliar)". D-ATB vem da view. */
function rotuloAtb(a: VwDiasAtbAtivo): string {
  const droga = txt(a.droga) ?? TRAVESSAO;
  const dias = typeof a.dias_terapia === "number" && Number.isFinite(a.dias_terapia) ? a.dias_terapia : null;
  const via = txt(a.via);
  const flag = ROTULO_STEWARDSHIP[String(a.stewardship_flag)] ?? null;
  const alerta = a.stewardship_flag === "warning" || a.stewardship_flag === "critical";
  return [
    droga,
    dias == null ? `D${TRAVESSAO}` : `D+${num(dias, 0)}`,
    via ?? "",
    alerta && flag ? `(${flag})` : "",
  ]
    .filter((p: string) => p.length > 0)
    .join(" ");
}

/** Suporte em curso: ventilacao, DVA, sedacao e dispositivos. */
function suporteEmCurso(h: HandoffLeito): string[] {
  const out: string[] = [];
  const e = h.evolucao;

  const ventilacao = txt(e?.resp?.suporte);
  if (ventilacao) out.push(`ventilação ${ventilacao}`);

  for (const d of infusoes(e?.dvas ?? h.leito.dvas)) out.push(`DVA ${d}`);
  for (const s of infusoes(e?.sedativos ?? h.leito.sedativos)) out.push(`sedação ${s}`);

  const disp = dispositivosAtivos(h.leito.dispositivos);
  if (disp.length > 0) out.push(`dispositivos ${disp.join(", ")}`);

  return out;
}

/** Pendencias abertas, prioridade 1 marcada. Ordem ja vem da camada de dados. */
function pendenciasEmTexto(lista: Pendencia[]): string[] {
  return lista
    .map((p: Pendencia) => {
      const tarefa = txt(p.tarefa);
      if (!tarefa) return null;
      const pr = p.prioridade;
      return pr === 1 || pr === 2 || pr === 3 ? `[P${pr}] ${tarefa}` : tarefa;
    })
    .filter((t: string | null): t is string => t !== null);
}

// ---------------------------------------------------------------------------
// AS 3 LINHAS — fonte unica da tela, da impressao e do texto copiado
// ---------------------------------------------------------------------------
export function linhasDoLeito(h: HandoffLeito): LinhasHandoff {
  const l = h.leito;

  // ---- linha 1: sintese ----------------------------------------------------
  const sintese = [
    `${txt(l.uti) ?? TRAVESSAO} ${txt(l.leito) ?? TRAVESSAO}`,
    txt(l.nome) ?? TRAVESSAO,
    l.idade == null ? `idade ${TRAVESSAO}` : `${num(l.idade, 0)} anos`,
    l.dias_internacao == null ? `internação ${TRAVESSAO}` : `${num(l.dias_internacao, 0)} d de UTI`,
    ROTULO_GRAVIDADE[l.gravity].s,
    `HD: ${txt(l.hd) ?? TRAVESSAO}`,
  ].join(" · ");

  // ---- linha 2: o que mudou / conduta vigente ------------------------------
  const condutas = condutasEmTexto(h.evolucao);
  const suporte = suporteEmCurso(h);
  const atbs = h.atbs.map(rotuloAtb);
  const mudou = [
    `SOFA ${l.sofa_total == null ? TRAVESSAO : num(l.sofa_total, 0)} (Δ 24 h ${deltaTexto(l.delta_sofa_24h)})`,
    `Conduta: ${condutas.length > 0 ? condutas.join("; ") : "sem conduta registrada na última evolução"}`,
    `Suporte: ${suporte.length > 0 ? suporte.join("; ") : "sem suporte contínuo registrado"}`,
    `ATB: ${atbs.length > 0 ? atbs.join("; ") : "nenhum em curso registrado"}`,
  ].join(" · ");

  // ---- linha 3: pendencias e riscos ----------------------------------------
  const pend = pendenciasEmTexto(h.pendencias);
  const altas = h.pendencias.filter((p: Pendencia) => p.prioridade === 1).length;
  const listaRiscos = riscosEmTexto(h);
  const isolado = !!l.isolation && l.isolation !== "none";
  const partesRisco = [
    pend.length > 0
      ? `Pendências (${num(pend.length, 0)}${altas > 0 ? `, ${num(altas, 0)} alta${altas > 1 ? "s" : ""}` : ""}): ${pend.join("; ")}`
      : "Pendências: nenhuma aberta",
    `Riscos: ${listaRiscos.length > 0 ? listaRiscos.join("; ") : "sem risco registrado"}`,
  ];
  if (isolado) {
    partesRisco.push(`Isolamento: ${ROTULO_ISOLAMENTO[l.isolation] || String(l.isolation)}`);
  }
  // alergia null = NAO REGISTRADA (nunca "sem alergia" — isso seria inventar)
  partesRisco.push(`Alergias: ${txt(h.alergias) ?? "não registradas"}`);

  return { sintese, mudou, riscos: partesRisco.join(" · ") };
}

// ---------------------------------------------------------------------------
// TEXTO PURO DA PASSAGEM INTEIRA (o que o CopyButton joga na area de transferencia)
// pt-BR · sem markdown · sem emoji · 3 linhas por leito · rodape com data/hora e contagem
// ---------------------------------------------------------------------------
export interface MetaPassagem {
  /** Data/hora da geracao, JA formatada no servidor (fuso do plantao). */
  geradoEm: string;
  /**
   * Rotulo HUMANO do fuso, para o rodape ser auditavel por quem le o papel.
   * Padrao: "horário de Brasília" — nao o identificador tecnico "America/Sao_Paulo",
   * que alem de jargao carrega "_" (o WhatsApp trata "_" como marcacao de italico).
   */
  fuso?: string;
}

export function textoDaPassagem(leitos: HandoffLeito[], meta: MetaPassagem): string {
  const fuso = meta.fuso ?? "horário de Brasília";
  const total = leitos.length;

  if (total === 0) {
    return [
      "PASSAGEM DE PLANTÃO — SASI",
      "Nenhum leito ativo no momento da geração.",
      "",
      `Gerado em ${meta.geradoEm} (${fuso}) · 0 leito.`,
    ].join("\n");
  }

  const utis = Array.from(new Set(leitos.map((h: HandoffLeito) => txt(h.leito.uti) ?? TRAVESSAO)));

  const blocos = leitos.map((h: HandoffLeito, i: number) => {
    const { sintese, mudou, riscos } = linhasDoLeito(h);
    return [`${i + 1}) ${sintese}`, `   ${mudou}`, `   ${riscos}`].join("\n");
  });

  return [
    `PASSAGEM DE PLANTÃO — SASI · Comando UTI`,
    `${utis.join(" · ")} · ${total} leito${total > 1 ? "s" : ""} ativo${total > 1 ? "s" : ""} · ordem de leito`,
    "",
    blocos.join("\n\n"),
    "",
    `Gerado em ${meta.geradoEm} (${fuso}) · ${total} leito${total > 1 ? "s" : ""}.`,
    // Sem nome de tabela aqui: o "_" vira italico no WhatsApp e o destino deste
    // texto e prontuario/mensagem, nao console de banco.
    "Fonte: SASI, leitura do banco no momento da geração. Campo sem dado aparece como travessão.",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// COMPONENTE — o mesmo conteudo do texto, com hierarquia visual
// ---------------------------------------------------------------------------
export interface HandoffCardProps {
  h: HandoffLeito;
  /** Posicao na lista (mesma numeracao do texto copiado). */
  ordem: number;
}

export function HandoffCard({ h, ordem }: HandoffCardProps): ReactElement {
  const l = h.leito;
  const linhas = linhasDoLeito(h);
  const g = l.gravity;
  const altas = h.pendencias.filter((p: Pendencia) => p.prioridade === 1).length;

  return (
    <article
      className="hcard"
      style={{ borderLeft: `var(--gravity-bar, 6px) solid var(--grav-${g}-solid)` }}
      aria-label={`Leito ${l.uti} ${l.leito} — ${l.nome}`}
    >
      {/* linha 1 — sintese */}
      <header className="hcard__l1">
        <span className="hcard__ordem tabnum" aria-hidden="true">
          {ordem}
        </span>
        <h3 className="hcard__ttl">
          <Link className="hcard__leito tabnum" href={`/patients/${l.paciente_id}`}>
            {l.uti} {l.leito}
          </Link>
          <span className="hcard__nome">{txt(l.nome) ?? TRAVESSAO}</span>
        </h3>
        <span className="hcard__meta tabnum">
          {l.idade == null ? `idade ${TRAVESSAO}` : `${num(l.idade, 0)} anos`} ·{" "}
          {l.dias_internacao == null ? `internação ${TRAVESSAO}` : `${num(l.dias_internacao, 0)} d de UTI`} ·{" "}
          <b style={{ color: `var(--grav-${g}-text)` }}>{ROTULO_GRAVIDADE[g].s}</b>
          {altas > 0 ? (
            <>
              {" · "}
              <b style={{ color: "var(--danger)" }}>
                {num(altas, 0)} pendência{altas > 1 ? "s" : ""} alta{altas > 1 ? "s" : ""}
              </b>
            </>
          ) : null}
        </span>
        <p className="hcard__hd">HD: {txt(l.hd) ?? TRAVESSAO}</p>
      </header>

      {/* linha 2 — o que mudou / conduta vigente */}
      <p className="hcard__linha">
        <span className="hcard__rot">Mudou / conduta</span>
        <span className="hcard__txt">{linhas.mudou}</span>
      </p>

      {/* linha 3 — pendencias e riscos */}
      <p className="hcard__linha">
        <span className="hcard__rot">Pendências / riscos</span>
        <span className="hcard__txt">{linhas.riscos}</span>
      </p>
    </article>
  );
}

// ---------------------------------------------------------------------------
// CSS do cartao. Injetado UMA vez pela pagina (padrao CSS_BED_CARD). So tokens.
// ---------------------------------------------------------------------------
export const CSS_HANDOFF_CARD = `
.hcard{display:flex;flex-direction:column;gap:6px;padding:12px 14px;background:var(--surface-card);
  border:1px solid var(--border-default);border-radius:var(--radius-lg,12px);box-shadow:var(--shadow-card);
  break-inside:avoid;page-break-inside:avoid}

.hcard__l1{display:grid;grid-template-columns:auto 1fr;gap:2px 10px;align-items:baseline}
.hcard__ordem{grid-row:1 / span 3;align-self:start;min-width:22px;padding-top:2px;
  font-size:var(--text-sm,13px);font-weight:700;color:var(--text-faint)}
.hcard__ttl{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;margin:0;
  font-size:var(--text-md,17px);font-weight:700;color:var(--text-heading);line-height:var(--leading-tight,1.15)}
.hcard__leito{font-size:var(--text-xs,11px);font-weight:700;letter-spacing:var(--tracking-wide,.04em);
  color:var(--text-muted);text-decoration:none;border-bottom:1px dotted var(--border-strong)}
.hcard__leito:hover{color:var(--accent-text)}
.hcard__leito:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.hcard__nome{min-width:0}
.hcard__meta{grid-column:2;font-size:var(--text-xs,11px);color:var(--text-muted)}
.hcard__hd{grid-column:2;margin:2px 0 0;font-size:var(--text-sm,13px);color:var(--text-body)}

.hcard__linha{display:flex;flex-direction:column;gap:2px;margin:0;padding-top:6px;
  border-top:1px solid var(--border-subtle)}
.hcard__rot{font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;color:var(--text-faint)}
.hcard__txt{font-size:var(--text-sm,13px);line-height:var(--leading-snug,1.35);color:var(--text-body)}

@media (max-width:520px){
  .hcard__l1{grid-template-columns:1fr}
  .hcard__ordem{grid-row:auto;padding-top:0}
  .hcard__meta,.hcard__hd{grid-column:1}
}
`;

export default HandoffCard;
