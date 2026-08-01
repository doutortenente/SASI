// ============================================================================
// SASI v2 — BedCard (cartao de leito do War Room)
// ----------------------------------------------------------------------------
// Le UMA linha de vw_dashboard_uti (ja triada por features/war-room/triage) e
// mostra o essencial de comando: leito, quem e, SOFA + delta 24h, terapias e
// pendencias abertas.
//
// DOUTRINA APLICADA
//  - ZERO ALUCINACAO: todo campo ausente vira travessao "—". Nunca 0 no lugar de
//    vazio, nunca unidade chutada (dose so aparece com a unidade que veio do banco).
//  - Cor NUNCA e o unico sinal: a gravidade tem barra colorida E rotulo em texto.
//  - Cor so por token (--grav-*, --sofa-*, --badge-*, --text-*). Zero hex aqui.
//  - Numero em mono tabular (.tabnum).
//
// HIERARQUIA (revisao de design 30-jul):
//  - O LEITO e a ancora do cartao (e por ele que se acha o paciente na unidade):
//    vem grande, no topo. O nome vem logo abaixo, secundario mas legivel.
//  - SOFA e um SELO: quando ha numero, ganha cor de faixa; quando NAO ha, explica
//    o porque em vez de um "—" mudo (recupera o espaco nobre).
//  - Terapias que MUDAM conduta (DVA, sedacao, via aerea, isolamento) ficam num
//    nivel acima dos dispositivos (linhas/sondas), num segundo grupo mais discreto.
//  - "Idade do dado": a hora da ultima evolucao aparece no cartao; atrasada = aviso.
// ============================================================================
import Link from "next/link";
import type {ReactElement} from "react";
import type {Leito} from "../types";
import type {Gravity} from "@/features/war-room/triage";
import type {Dispositivos, Infusao, Isolamento} from "@/types/clinical";
import type {EvolucaoResumo} from "@/lib/formatters/tempo";
import {num, unidadeSegura} from "@/lib/formatters/br";

// ---------------------------------------------------------------------------
// Contratos
// ---------------------------------------------------------------------------

/** Linha da view + o nivel de gravidade calculado por triagem(). */
export type LeitoTriado = Leito & { gravity: Gravity };

/** Resumo das pendencias abertas do leito (tabela pendencias, ja agrupada na pagina). */
export interface ResumoPendencia {
  /** Quantas tarefas abertas. */
  abertas: number;
  /** Quantas sao prioridade 1 (alta). */
  altas: number;
  /** Texto da mais urgente (prioridade 1 primeiro, depois a mais antiga). */
  primeira: string | null;
}

export interface BedCardProps {
  leito: LeitoTriado;
  /** Detalhe das pendencias. Ausente => o card usa so a contagem da view. */
  pendencia?: ResumoPendencia | null;
  /** Quando foi a ultima evolucao (JA formatado no servidor, fuso do plantao). */
  evolucao?: EvolucaoResumo | null;
  /** Visao compacta (modo War Room da TopBar): menos linhas, mesma informacao critica. */
  compacto?: boolean;
  /** Destino do clique. Padrao: ficha do paciente. */
  href?: string;
}

// ---------------------------------------------------------------------------
// Vocabulario pt-BR (exportado: a grade reusa nos contadores do cabecalho)
// ---------------------------------------------------------------------------

/** Rotulo da escala de gravidade em pt-BR (singular / plural). */
export const ROTULO_GRAVIDADE: Record<Gravity, { s: string; p: string }> = {
  critical: {s: "crítico", p: "críticos"},
  unstable: {s: "instável", p: "instáveis"},
  watcher: {s: "em vigilância", p: "em vigilância"},
  stable: {s: "estável", p: "estáveis"},
  deceased: {s: "óbito", p: "óbitos"},
};

/** Ordem de leitura do painel: pior primeiro (mesma ordem da triagem). */
export const ORDEM_GRAVIDADE: readonly Gravity[] = ["critical", "unstable", "watcher", "stable", "deceased"];

const ROTULO_ISOLAMENTO: Record<Isolamento, string> = {
  none: "",
  contact: "contato",
  droplet: "gotículas",
  aerosol: "aerossóis",
};

/** Dispositivos na ordem em que importam no leito (via aerea -> acessos -> sondas). */
const ORDEM_DISPOSITIVOS: ReadonlyArray<{
  chave: keyof Dispositivos;
  rotulo: string;
  viaAerea?: boolean
}> = [
  {chave: "iot", rotulo: "IOT", viaAerea: true},
  {chave: "tqt", rotulo: "TQT", viaAerea: true},
  {chave: "cvc", rotulo: "CVC"},
  {chave: "picc", rotulo: "PICC"},
  {chave: "shilley", rotulo: "Shilley"},
  {chave: "pai", rotulo: "PAI"},
  {chave: "mpd", rotulo: "MPD"},
  {chave: "svd", rotulo: "SVD"},
  {chave: "sne", rotulo: "SNE"},
  {chave: "dreno", rotulo: "Dreno"},
  {chave: "avp", rotulo: "AVP"},
];

// ---------------------------------------------------------------------------
// Helpers de apresentacao (puros — sem inventar dado)
// ---------------------------------------------------------------------------

/** Faixa de cor do SOFA. Sem SOFA => cinza (o selo explica o porque). */
function corSofa(s: number | null): string {
  if (s == null) return "var(--text-muted)";
  if (s >= 12) return "var(--sofa-critical)";
  if (s >= 8) return "var(--sofa-high)";
  if (s >= 4) return "var(--sofa-medium)";
  return "var(--sofa-low)";
}

/**
 * Selo do SOFA. Com numero: cor de faixa + fundo suave. SEM numero: NAO um "—"
 * mudo — um selo neutro que diz "s/ dado" e, no tooltip, explica que a folha
 * ainda nao captura os 6 componentes (faltam bilirrubina e PaO2/FiO2). Recupera
 * o espaco nobre do cartao sem inventar um numero.
 */
function seloSofa(s: number | null): {
  texto: string;
  cor: string;
  fundo: string;
  borda: string;
  titulo: string
} {
  if (s == null) {
    return {
      texto: "SOFA s/ dado",
      cor: "var(--text-muted)",
      fundo: "var(--surface-sunken)",
      borda: "var(--border-default)",
      titulo:
        "SOFA não calculado: a folha ainda não captura todos os 6 componentes (faltam bilirrubina e a relação PaO₂/FiO₂). Fica em branco em vez de mostrar um número inventado.",
    };
  }
  const cor = corSofa(s);
  return {
    texto: `SOFA ${num(s, 0)}`,
    cor,
    fundo: `color-mix(in srgb, ${cor} 14%, transparent)`,
    borda: `color-mix(in srgb, ${cor} 34%, transparent)`,
    titulo: "SOFA da última evolução (calculado no banco).",
  };
}

/** Delta de SOFA em 24 h: subiu = pior (danger), caiu = melhor (success), null = "—". */
function delta24h(d: number | null): {
  texto: string;
  glifo: string;
  cor: string;
  leitura: string
} {
  if (d == null) return {
    texto: "—",
    glifo: "",
    cor: "var(--text-muted)",
    leitura: "variação do SOFA em 24 horas não disponível"
  };
  if (d > 0) return {
    texto: num(d, 0),
    glifo: "▲",
    cor: "var(--danger)",
    leitura: `SOFA subiu ${num(d, 0)} em 24 horas`
  };
  if (d < 0) return {
    texto: num(Math.abs(d), 0),
    glifo: "▼",
    cor: "var(--success)",
    leitura: `SOFA caiu ${num(Math.abs(d), 0)} em 24 horas`
  };
  return {texto: "0", glifo: "=", cor: "var(--text-muted)", leitura: "SOFA estável em 24 horas"};
}

/**
 * Rotulo de uma infusao (dva / sedativo). So imprime o que veio no JSONB:
 * dose+unidade se existirem; senao a vazao em ml/h; senao so a droga.
 * NUNCA converte unidade nem completa dose que o banco nao tem.
 */
function rotuloInfusao(i: Infusao): string | null {
  const droga = (i.droga ?? "").trim();
  if (!droga) return null;
  // Numero vira pt-BR (0,04 — nunca "0.04"); string legada passa como veio.
  const dose = typeof i.dose === "number" ? num(i.dose, 3) : i.dose != null ? String(i.dose).trim() : "";
  if (dose) return `${droga} ${dose}${i.unidade ? ` ${unidadeSegura(i.unidade)}` : ""}`.trim();
  if (i.vazao_ml_h != null) return `${droga} ${num(i.vazao_ml_h, 1)} ml/h`;
  return droga;
}

/** Lista de infusoes ativas em texto (array vazio/null => []). */
function infusoes(lista: Infusao[] | null | undefined): string[] {
  if (!Array.isArray(lista)) return [];
  return lista.map(rotuloInfusao).filter((t: string | null): t is string => !!t);
}

/** Dispositivos marcados como true no JSONB pacientes.dispositivos. */
function dispositivosAtivos(d: Dispositivos | null | undefined): Array<{
  rotulo: string;
  viaAerea: boolean
}> {
  if (!d) return [];
  return ORDEM_DISPOSITIVOS.filter((item) => d[item.chave] === true).map((item) => ({
    rotulo: item.rotulo,
    viaAerea: item.viaAerea === true,
  }));
}

// ---------------------------------------------------------------------------
// Chip de terapia / dispositivo
// ---------------------------------------------------------------------------
type TomChip = "dva" | "sed" | "via" | "disp" | "iso" | "pend";

const TOM_CHIP: Record<TomChip, { bg: string; fg: string }> = {
  dva: {bg: "var(--badge-dva-bg)", fg: "var(--badge-dva-text)"},
  sed: {bg: "var(--badge-sed-bg)", fg: "var(--badge-sed-text)"},
  via: {bg: "var(--badge-vm-bg)", fg: "var(--badge-vm-text)"},
  disp: {bg: "var(--surface-sunken)", fg: "var(--text-muted)"},
  iso: {bg: "color-mix(in srgb, var(--warning) 16%, transparent)", fg: "var(--warning)"},
  pend: {bg: "var(--badge-pend-bg)", fg: "var(--badge-pend-text)"},
};

function Chip({tom, children, title}: {
  tom: TomChip;
  children: string;
  title?: string
}): ReactElement {
  const c = TOM_CHIP[tom];
  return (
    <span
      className="bed-chip"
      title={title ?? children}
      style={{
        background: c.bg,
        color: c.fg,
        border: `1px solid color-mix(in srgb, ${c.fg} 26%, transparent)`
      }}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export function BedCard({
                          leito,
                          pendencia,
                          evolucao,
                          compacto = false,
                          href
                        }: BedCardProps): ReactElement {
  const g = leito.gravity;
  const rotuloGrav = ROTULO_GRAVIDADE[g].s;
  const d = delta24h(leito.delta_sofa_24h ?? null);
  const sofa = seloSofa(leito.sofa_total);
  // O leito ja vem no padrao canonico "UTI2-L01" — repetir a UTI ("UTI2 · UTI2-L01")
  // seria ruido. So prefixamos a UTI quando o leito NAO a traz. Nunca reescreve o dado.
  const leitoRotulo =
    leito.leito && leito.leito.toUpperCase().startsWith(leito.uti.toUpperCase())
      ? leito.leito
      : `${leito.uti} · ${leito.leito}`;

  const dvas = infusoes(leito.dvas);
  const seds = infusoes(leito.sedativos);
  const disp = dispositivosAtivos(leito.dispositivos);
  // isolation ainda e coluna text no banco (enums nao adotados): se vier valor
  // fora do vocabulario, mostramos o valor cru em vez de "undefined".
  const isolado = !!leito.isolation && leito.isolation !== "none";
  const rotuloIso = isolado ? ROTULO_ISOLAMENTO[leito.isolation] || String(leito.isolation) : "";

  // Em modo compacto o card corta o que NAO muda conduta imediata (dispositivos
  // secundarios), nunca o que muda: DVA, sedacao, via aerea, isolamento.
  const dispVisiveis = compacto ? disp.filter((x) => x.viaAerea) : disp;
  const ocultos = disp.length - dispVisiveis.length;
  // Dois niveis: via aerea sobe para as terapias; o resto (linhas/sondas) fica
  // num grupo secundario, mais discreto.
  const viaAerea = dispVisiveis.filter((x) => x.viaAerea);
  const outrosDisp = dispVisiveis.filter((x) => !x.viaAerea);
  const semTerapias = dvas.length + seds.length + disp.length === 0 && !isolado;

  const abertas = leito.pendencias_abertas ?? 0;
  const altas = pendencia?.altas ?? 0;

  return (
    <Link
      href={href ?? `/patients/${leito.paciente_id}`}
      className={`bed-card sasi-fade-in${compacto ? " bed-card--compacto" : ""}`}
      aria-label={`Leito ${leito.uti} ${leito.leito} — ${leito.nome}, ${rotuloGrav}`}
      style={{
        background: `color-mix(in srgb, var(--grav-${g}-solid) ${g === "critical" ? 9 : 5}%, var(--surface-card))`,
        borderLeft: `var(--gravity-bar, 6px) solid var(--grav-${g}-solid)`,
      }}
    >
      {/* linha 1 — LEITO (ancora do cartao) + selo SOFA */}
      <div className="bed-card__topo">
        <span className="bed-card__leito tabnum">{leitoRotulo}</span>
        <span
          className="bed-card__sofa tabnum"
          style={{color: sofa.cor, background: sofa.fundo, borderColor: sofa.borda}}
          title={sofa.titulo}
        >
          {sofa.texto}
        </span>
      </div>

      {/* linha 2 — quem e */}
      <div>
        <div className="bed-card__nome" title={leito.nome}>
          {leito.nome}
        </div>
        <div className="bed-card__meta tabnum">
          {leito.idade == null ? "idade —" : `${num(leito.idade, 0)} anos`} ·{" "}
          {leito.dias_internacao == null ? "internação —" : `${num(leito.dias_internacao, 0)} d de UTI`} ·{" "}
          <span style={{color: `var(--grav-${g}-text)`, fontWeight: 700}}>{rotuloGrav}</span>
        </div>
      </div>

      {/* linha 3 — idade do dado: quando foi a ultima evolucao */}
      {evolucao ? (
        <div className="bed-card__idade tabnum"
             title="Hora da última evolução registrada (fuso do plantão). Atrasada = mais de 24 h sem evoluir.">
          <span className="bed-card__idade-rot">Evolução</span>{" "}
          <span style={{
            color: evolucao.atrasada ? "var(--warning)" : "var(--text-muted)",
            fontWeight: evolucao.atrasada ? 700 : 600
          }}>
            {evolucao.rotulo}
            {evolucao.atrasada ? " · atrasada" : ""}
          </span>
        </div>
      ) : null}

      {/* linha 4 — hipotese diagnostica */}
      {!compacto ? <div className="bed-card__hd">{leito.hd?.trim() ? leito.hd : "—"}</div> : null}

      {/* linha 5 — delta de SOFA em 24 h */}
      <div className="bed-card__delta tabnum" title={d.leitura}>
        <span className="bed-card__rotulo">Δ SOFA 24 h</span>
        <span style={{color: d.cor, fontWeight: 700}}>
          <span aria-hidden="true">{d.glifo}</span> {d.texto}
        </span>
      </div>

      {/* linha 6 — terapias e barreiras que MUDAM conduta (nivel 1) */}
      <div className="bed-card__chips">
        {isolado ?
          <Chip tom="iso" title={`Isolamento — ${rotuloIso}`}>{`iso ${rotuloIso}`}</Chip> : null}
        {dvas.map((t: string, i: number) => (
          <Chip key={`dva-${i}-${t}`} tom="dva" title={`Droga vasoativa: ${t}`}>
            {t}
          </Chip>
        ))}
        {seds.map((t: string, i: number) => (
          <Chip key={`sed-${i}-${t}`} tom="sed" title={`Sedação/analgesia: ${t}`}>
            {t}
          </Chip>
        ))}
        {viaAerea.map((x) => (
          <Chip key={`via-${x.rotulo}`} tom="via" title={`Via aérea: ${x.rotulo}`}>
            {x.rotulo}
          </Chip>
        ))}
        {semTerapias ?
          <span className="bed-card__vazio">sem terapia contínua registrada</span> : null}
      </div>

      {/* linha 7 — dispositivos (linhas/sondas): nivel 2, mais discreto */}
      {outrosDisp.length > 0 || ocultos > 0 ? (
        <div className="bed-card__chips bed-card__chips--disp">
          {outrosDisp.map((x) => (
            <Chip key={`disp-${x.rotulo}`} tom="disp" title={`Dispositivo: ${x.rotulo}`}>
              {x.rotulo}
            </Chip>
          ))}
          {ocultos > 0 ? (
            <Chip tom="disp"
                  title={disp.filter((x) => !x.viaAerea).map((x) => x.rotulo).join(" · ")}>
              {`+${ocultos}`}
            </Chip>
          ) : null}
        </div>
      ) : null}

      {/* linha 8 — pendencias abertas */}
      <div className="bed-card__pend">
        {abertas > 0 ? (
          <>
            <Chip tom="pend" title="Pendências abertas (tabela pendencias)">
              {`${abertas} pendência${abertas > 1 ? "s" : ""}${altas > 0 ? ` · ${altas} alta` : ""}`}
            </Chip>
            {!compacto && pendencia?.primeira ? (
              <span className="bed-card__tarefa" title={pendencia.primeira}>
                {pendencia.primeira}
              </span>
            ) : null}
          </>
        ) : (
          <span className="bed-card__vazio">sem pendência aberta</span>
        )}
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// CSS do card. Vive aqui (perto do markup) e e injetado UMA vez pela BedGrid —
// estilo inline nao suporta hover/foco/line-clamp.
//
// LEGIBILIDADE (revisao 30-jul): texto de dado passou de 10px para 11px; os
// rotulos-etiqueta (eyebrow) seguem em 10px por serem apoio, nunca o dado.
// ---------------------------------------------------------------------------
export const CSS_BED_CARD = `
.bed-card{display:flex;flex-direction:column;gap:8px;min-height:44px;padding:12px 14px;
  border:1px solid var(--border-default);border-radius:var(--radius-xl,16px);box-shadow:var(--shadow-card);
  color:var(--text-body);text-decoration:none;
  transition:box-shadow var(--dur-fast,120ms) var(--ease-out,ease),border-color var(--dur-fast,120ms) var(--ease-out,ease)}
.bed-card:hover{box-shadow:var(--shadow-raised);border-color:var(--border-strong)}
.bed-card:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.bed-card--compacto{gap:6px;padding:10px 12px}

.bed-card__topo{display:flex;align-items:center;justify-content:space-between;gap:8px}
.bed-card__leito{font-size:var(--text-lg,20px);font-weight:700;line-height:var(--leading-tight,1.15);
  letter-spacing:var(--tracking-wide,.04em);color:var(--text-heading)}
.bed-card--compacto .bed-card__leito{font-size:var(--text-md,17px)}
.bed-card__sofa{flex:0 0 auto;padding:2px 9px;border-radius:var(--radius-pill,9999px);border:1px solid transparent;
  font-size:var(--text-sm,13px);font-weight:700;white-space:nowrap}

.bed-card__nome{font-size:var(--text-base,15px);font-weight:700;line-height:var(--leading-tight,1.15);
  color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bed-card--compacto .bed-card__nome{font-size:var(--text-sm,13px)}
.bed-card__meta{margin-top:3px;font-size:var(--text-xs,11px);color:var(--text-muted)}

.bed-card__idade{font-size:var(--text-xs,11px);color:var(--text-muted)}
.bed-card__idade-rot{font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;color:var(--text-faint)}

.bed-card__hd{font-size:var(--text-sm,13px);line-height:var(--leading-snug,1.35);color:var(--text-body);
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

.bed-card__delta{display:flex;align-items:baseline;justify-content:space-between;gap:8px;font-size:var(--text-xs,11px)}
.bed-card__rotulo{font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;color:var(--text-muted)}

.bed-card__chips{display:flex;flex-wrap:wrap;gap:4px}
.bed-card__chips--disp{margin-top:-2px;opacity:.9}
.bed-chip{display:inline-flex;align-items:center;max-width:100%;padding:3px 8px;border-radius:var(--radius-pill,9999px);
  font-family:var(--font-mono,monospace);font-size:var(--text-xs,11px);font-weight:700;
  letter-spacing:var(--tracking-wide,.04em);text-transform:uppercase;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.bed-card__pend{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:auto;padding-top:2px}
.bed-card__tarefa{flex:1 1 120px;min-width:0;font-size:var(--text-xs,11px);color:var(--text-muted);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bed-card__vazio{font-size:var(--text-xs,11px);color:var(--text-faint)}

@media (prefers-reduced-motion:reduce){.bed-card{transition:none}}
`;

export default BedCard;
