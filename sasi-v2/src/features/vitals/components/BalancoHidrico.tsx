// ============================================================================
// SASI v2 — BalancoHidrico (BH acumulado 24/48/72 h + diurese horaria)
// ----------------------------------------------------------------------------
// Le o que a camada de dados ja trouxe:
//   - vw_bh_acumulado  -> bh_24h / bh_48h / bh_72h  (soma de eventos_clinicos.bh_h)
//   - eventos_clinicos -> tipo 'bh_h' (para saber SE a janela tem medida)
//   - eventos_clinicos -> tipo 'diurese_h' (ultima medida + max–min 24 h)
//   - pacientes.peso   -> normalizacao mL/kg/h
// Server Component. Nao le banco, nao soma de novo o que o banco ja somou.
//
// DOUTRINA APLICADA
//  1. SINAL NEGATIVO E REAL — BH negativo significa balanco negativo. O sinal
//     NUNCA e invertido, nunca vira modulo. Positivo recebe "+" explicito para
//     que a leitura seja inequivoca no prontuario.
//  2. ZERO ALUCINACAO — vw_bh_acumulado soma com `else 0`: uma janela SEM
//     nenhum evento bh_h devolve 0, que NAO e medida. Por isso a janela sem
//     evento aparece como "—", jamais como "0 mL".
//  3. SEM PESO NAO HA mL/kg/h — peso ausente (ou <= 0) => "—" + nota "requer
//     peso". Nunca estimamos peso, nunca usamos peso ideal.
//  4. UNIDADE NUNCA E CHUTADA — a normalizacao por peso so acontece se a
//     unidade registrada for mL (BH) ou mL/h (diurese). Unidade estranha =>
//     mostra o valor cru e avisa que nao da para normalizar.
//  5. Diurese tambem em MAXIMO–MINIMO na janela de 24 h (regra de ferro).
//  6. BH nao ganha cor de risco: positivo nao e "ruim" nem negativo e "bom" —
//     depende do paciente. Cor aqui seria opiniao clinica inventada.
//
// O CSS (CSS_BALANCO_HIDRICO) e injetado UMA vez pela pagina da aba.
// ============================================================================
import type {ReactElement} from "react";
import type {BhAcumulado} from "@/lib/data";
import {num} from "@/lib/formatters/br";

const TRAVESSAO = "—";

const FMT_HORA = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** "2026-07-30T04:12:00Z" -> "30/07 04:12" (fuso do plantao). ts invalido => null. */
function quando(ts: string | null | undefined): string | null {
  if (!ts) return null;
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : FMT_HORA.format(d);
}

/** Ponto cru de eventos_clinicos (bh_h ou diurese_h) — so com valor real. */
export interface PontoBh {
  /** eventos_clinicos.ts (ISO). */
  ts: string;
  /** eventos_clinicos.valor_num. */
  valor: number;
}

export interface BalancoHidricoProps {
  /** Linha de vw_bh_acumulado. null = paciente sem NENHUM evento bh_h. */
  bh: BhAcumulado | null;
  /** Eventos tipo 'bh_h' das ultimas 72 h (ordem crescente de ts). */
  eventosBh: PontoBh[];
  /** Eventos tipo 'diurese_h' das ultimas 72 h (ordem crescente de ts). */
  eventosDiurese: PontoBh[];
  /** pacientes.peso em kg. null => sem normalizacao por peso. */
  pesoKg: number | null;
  /** Unidade de bh_h (evento_tipo_ref ou o proprio evento). Esperado "mL". */
  unidadeBh?: string | null;
  /** Unidade de diurese_h. Esperado "mL/h". */
  unidadeDiurese?: string | null;
}

interface Janela {
  n: number;
  max: number | null;
  min: number | null;
}

/** Agrega uma janela de N horas a partir de `agora` (max–min + contagem). */
function janela(pontos: PontoBh[], horas: number, agora: number): Janela {
  const corte = agora - horas * 3_600_000;
  let n = 0;
  let max: number | null = null;
  let min: number | null = null;
  for (const p of pontos) {
    const t = new Date(p.ts).getTime();
    if (Number.isNaN(t) || t < corte) continue;
    if (!Number.isFinite(p.valor)) continue;
    n += 1;
    max = max == null || p.valor > max ? p.valor : max;
    min = min == null || p.valor < min ? p.valor : min;
  }
  return {n, max, min};
}

/** Valor com sinal explicito. Positivo ganha "+"; negativo mantem o "-" real. */
function comSinal(v: number | null, casas = 0): string {
  if (v == null || !Number.isFinite(v)) return TRAVESSAO;
  const s = num(v, casas);
  return v > 0 ? `+${s}` : s;
}

const norm = (u: string | null | undefined): string => (u ?? "").trim().toLowerCase().replace(/\s+/g, "");
/** Unidade de volume aceita para normalizar por peso. */
const ehMl = (u: string | null | undefined): boolean => norm(u) === "ml";
/** Unidade de fluxo aceita para normalizar por peso. */
const ehMlPorHora = (u: string | null | undefined): boolean => norm(u) === "ml/h" || norm(u) === "ml/hora";

/** Cartao de uma janela de BH acumulado. */
function Tile({
                rotulo,
                valor,
                unidade,
                medidas,
                porKg,
                formula,
              }: {
  rotulo: string;
  valor: number | null;
  unidade: string | null;
  medidas: number;
  porKg: string | null;
  formula: string | null;
}): ReactElement {
  const temDado = medidas > 0 && valor != null;
  return (
    <div className="bh-tile">
      <span className="bh-tile__rot">{rotulo}</span>
      <span
        className="bh-tile__val tabnum"
        title={
          temDado
            ? "soma dos eventos bh_h da janela (vw_bh_acumulado) — sinal preservado"
            : "sem evento bh_h nesta janela — a soma da view seria 0, e 0 aqui não é medida"
        }
      >
        {temDado ? comSinal(valor, 0) : TRAVESSAO}
        {temDado && unidade ? <span className="bh-tile__un"> {unidade}</span> : null}
      </span>
      <span className="bh-tile__kg tabnum" title={formula ?? undefined}>
        {porKg ?? TRAVESSAO}
      </span>
      <span className="bh-tile__n tabnum">
        {medidas > 0 ? `${medidas} medida${medidas > 1 ? "s" : ""}` : "não avaliado"}
      </span>
    </div>
  );
}

export function BalancoHidrico({
                                 bh,
                                 eventosBh,
                                 eventosDiurese,
                                 pesoKg,
                                 unidadeBh = null,
                                 unidadeDiurese = null,
                               }: BalancoHidricoProps): ReactElement {
  const agora = Date.now();

  // Peso zero/negativo nao e peso — vira ausencia (nunca dividimos por lixo).
  const peso = pesoKg != null && Number.isFinite(pesoKg) && pesoKg > 0 ? pesoKg : null;

  const j24 = janela(eventosBh, 24, agora);
  const j48 = janela(eventosBh, 48, agora);
  const j72 = janela(eventosBh, 72, agora);

  // A contagem de 24 h da view usa o now() do BANCO — prefira-a quando existir.
  const n24 = bh?.eventos_24h ?? j24.n;

  const volumeNormalizavel = peso != null && ehMl(unidadeBh);

  /** BH acumulado -> mL/kg/h (volume ÷ peso ÷ horas da janela). */
  const porKg = (v: number | null, horas: number, medidas: number): string | null => {
    if (!volumeNormalizavel || peso == null || v == null || medidas === 0) return null;
    return `${comSinal(v / peso / horas, 2)} mL/kg/h`;
  };
  const formula = (v: number | null, horas: number, medidas: number): string | null => {
    if (!volumeNormalizavel || peso == null || v == null || medidas === 0) return null;
    return `${num(v, 0)} mL ÷ ${num(peso, 1)} kg ÷ ${horas} h`;
  };

  // ---- diurese --------------------------------------------------------------
  const jd24 = janela(eventosDiurese, 24, agora);
  const ultimaDiurese = eventosDiurese.length > 0 ? eventosDiurese[eventosDiurese.length - 1] : null;
  const tsUltima = ultimaDiurese ? new Date(ultimaDiurese.ts).getTime() : NaN;
  const diureseVelha = Number.isFinite(tsUltima) && tsUltima < agora - 24 * 3_600_000;
  const fluxoNormalizavel = peso != null && ehMlPorHora(unidadeDiurese);
  const diuresePorKg =
    fluxoNormalizavel && peso != null && ultimaDiurese ? `${num(ultimaDiurese.valor / peso, 2)} mL/kg/h` : null;

  const semNada = bh == null && eventosBh.length === 0 && eventosDiurese.length === 0;

  return (
    <section className="bh-bloco" aria-labelledby="bh-titulo">
      <div className="bh-cab">
        <h2 className="bh-cab__ttl" id="bh-titulo">
          Balanço hídrico e diurese
        </h2>
        <span className="bh-cab__sub tabnum">
          {peso != null ? `peso ${num(peso, 1)} kg` : "peso não registrado"}
        </span>
      </div>

      {semNada ? (
        <div className="bh-vazio">
          <strong className="bh-vazio__ttl">Sem registro de balanço hídrico nas últimas 72
            h</strong>
          <span className="bh-vazio__txt">
            Nenhum evento <code className="tabnum">bh_h</code> ou <code
            className="tabnum">diurese_h</code> foi lançado
            para este paciente no período. Ausência de lançamento não é balanço zero.
          </span>
        </div>
      ) : (
        <>
          {/* ---- acumulado por janela (vw_bh_acumulado) ---- */}
          <div className="bh-grade">
            <Tile
              rotulo="BH 24 h"
              valor={bh?.bh_24h ?? null}
              unidade={unidadeBh}
              medidas={n24}
              porKg={porKg(bh?.bh_24h ?? null, 24, n24)}
              formula={formula(bh?.bh_24h ?? null, 24, n24)}
            />
            <Tile
              rotulo="BH 48 h"
              valor={bh?.bh_48h ?? null}
              unidade={unidadeBh}
              medidas={j48.n}
              porKg={porKg(bh?.bh_48h ?? null, 48, j48.n)}
              formula={formula(bh?.bh_48h ?? null, 48, j48.n)}
            />
            <Tile
              rotulo="BH 72 h"
              valor={bh?.bh_72h ?? null}
              unidade={unidadeBh}
              medidas={j72.n}
              porKg={porKg(bh?.bh_72h ?? null, 72, j72.n)}
              formula={formula(bh?.bh_72h ?? null, 72, j72.n)}
            />
          </div>

          {/* ---- diurese horaria ---- */}
          <div className="bh-diurese">
            <span className="bh-diurese__rot">Diurese horária</span>

            <div className="bh-diurese__linha">
              <span className="bh-diurese__cap">última</span>
              <span className="bh-diurese__val tabnum">
                {ultimaDiurese ? num(ultimaDiurese.valor, 1) : TRAVESSAO}
                {ultimaDiurese && unidadeDiurese ?
                  <span className="bh-tile__un"> {unidadeDiurese}</span> : null}
              </span>
              {ultimaDiurese ? (
                <span className="bh-diurese__quando tabnum"
                      title="horário da medida (America/Sao_Paulo)">
                  {quando(ultimaDiurese.ts) ?? TRAVESSAO}
                </span>
              ) : null}
              <span
                className="bh-diurese__kg tabnum"
                title={
                  diuresePorKg && ultimaDiurese && peso != null
                    ? `${num(ultimaDiurese.valor, 1)} mL/h ÷ ${num(peso, 1)} kg`
                    : undefined
                }
              >
                {diuresePorKg ?? TRAVESSAO}
              </span>
            </div>

            <div className="bh-diurese__linha">
              <span className="bh-diurese__cap">máx–mín 24 h</span>
              <span className="bh-diurese__val tabnum">
                {jd24.n === 0 ? (
                  TRAVESSAO
                ) : jd24.n === 1 ? (
                  <>
                    {num(jd24.max, 1)}
                    <span className="bh-diurese__unica"> medida única</span>
                  </>
                ) : (
                  `${num(jd24.max, 1)}–${num(jd24.min, 1)}`
                )}
                {jd24.n > 0 && unidadeDiurese ?
                  <span className="bh-tile__un"> {unidadeDiurese}</span> : null}
              </span>
              <span className="bh-diurese__n tabnum">
                {jd24.n > 0 ? `${jd24.n} medida${jd24.n > 1 ? "s" : ""}` : "não avaliado"}
              </span>
            </div>
          </div>
        </>
      )}

      {/* ---- notas: o que falta para o numero existir ---- */}
      <ul className="bh-notas">
        {peso == null ? (
          <li className="bh-notas__alerta">
            <strong>Requer peso.</strong> mL/kg/h fica em {TRAVESSAO} enquanto{" "}
            <code className="tabnum">pacientes.peso</code> estiver vazio — o app não estima peso.
          </li>
        ) : null}
        {peso != null && eventosBh.length > 0 && !ehMl(unidadeBh) ? (
          <li className="bh-notas__alerta">
            Unidade de <code className="tabnum">bh_h</code> não é mL
            {unidadeBh ? ` (registrada: ${unidadeBh})` : " (não registrada)"} — normalização por
            peso indisponível.
          </li>
        ) : null}
        {peso != null && eventosDiurese.length > 0 && !ehMlPorHora(unidadeDiurese) ? (
          <li className="bh-notas__alerta">
            Unidade de <code className="tabnum">diurese_h</code> não é mL/h
            {unidadeDiurese ? ` (registrada: ${unidadeDiurese})` : " (não registrada)"} —
            normalização por peso
            indisponível.
          </li>
        ) : null}
        {diureseVelha ? (
          <li className="bh-notas__alerta">
            A última diurese registrada tem mais de 24 h ({quando(ultimaDiurese?.ts) ?? TRAVESSAO}).
          </li>
        ) : null}
        {bh == null && eventosBh.length > 0 ? (
          <li className="bh-notas__alerta">
            Há {eventosBh.length} evento(s) <code className="tabnum">bh_h</code> em 72 h, mas{" "}
            <code className="tabnum">vw_bh_acumulado</code> não devolveu linha — acumulado
            indisponível.
          </li>
        ) : null}
        <li>
          Sinal preservado: <span className="tabnum">+</span> retenção, <span
          className="tabnum">-</span> balanço
          negativo. Janela sem lançamento aparece como {TRAVESSAO}, nunca como <span
          className="tabnum">0</span>.
        </li>
        <li>
          Fonte: <code className="tabnum">vw_bh_acumulado</code> (soma de <code
          className="tabnum">bh_h</code>) e{" "}
          <code className="tabnum">eventos_clinicos</code> (<code
          className="tabnum">diurese_h</code>).
        </li>
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CSS do bloco. Injetado UMA vez pela pagina da aba. So tokens — zero hex.
// ---------------------------------------------------------------------------
export const CSS_BALANCO_HIDRICO = `
.bh-bloco{display:flex;flex-direction:column;gap:10px;min-width:0}

.bh-cab{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap}
.bh-cab__ttl{margin:0;font-size:var(--text-lg,20px);font-weight:700;color:var(--text-heading)}
.bh-cab__sub{font-size:var(--text-xs,11px);color:var(--text-muted)}

.bh-grade{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.bh-tile{display:flex;flex-direction:column;gap:2px;min-height:44px;padding:10px 12px;
  background:var(--surface-card);border:1px solid var(--border-default);
  border-radius:var(--radius-lg,12px);box-shadow:var(--shadow-card)}
.bh-tile__rot{font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;color:var(--text-muted)}
.bh-tile__val{font-size:var(--text-lg,20px);font-weight:700;color:var(--text-heading);white-space:nowrap}
.bh-tile__un{font-size:var(--text-xs,11px);font-weight:600;color:var(--text-muted)}
.bh-tile__kg{font-size:var(--text-sm,13px);font-weight:600;color:var(--text-body);white-space:nowrap}
.bh-tile__n{font-size:var(--text-2xs,10px);color:var(--text-faint)}

.bh-diurese{display:flex;flex-direction:column;gap:6px;padding:10px 12px;
  background:var(--surface-card);border:1px solid var(--border-default);
  border-left:4px solid var(--sys-renal-bar);border-radius:var(--radius-lg,12px)}
.bh-diurese__rot{font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;color:var(--sys-renal)}
.bh-diurese__linha{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;min-height:28px}
.bh-diurese__cap{flex:0 0 96px;font-size:var(--text-2xs,10px);font-weight:700;
  letter-spacing:var(--tracking-eyebrow,.08em);text-transform:uppercase;color:var(--text-faint)}
.bh-diurese__val{font-size:var(--text-md,17px);font-weight:700;color:var(--text-heading);white-space:nowrap}
.bh-diurese__quando{font-size:var(--text-xs,11px);color:var(--text-muted)}
.bh-diurese__kg{margin-left:auto;font-size:var(--text-sm,13px);font-weight:600;color:var(--text-body)}
.bh-diurese__n{margin-left:auto;font-size:var(--text-2xs,10px);color:var(--text-faint)}
.bh-diurese__unica{font-size:var(--text-2xs,10px);font-weight:600;color:var(--text-faint);text-transform:uppercase}

.bh-notas{display:flex;flex-direction:column;gap:4px;margin:0;padding:0 2px;list-style:none;
  font-size:var(--text-xs,11px);line-height:var(--leading-snug,1.35);color:var(--text-muted)}
.bh-notas__alerta{color:var(--warning)}

.bh-vazio{display:flex;flex-direction:column;gap:6px;padding:20px 16px;text-align:center;
  background:var(--surface-card);border:1px dashed var(--border-strong);border-radius:var(--radius-lg,12px)}
.bh-vazio__ttl{font-size:var(--text-md,17px);color:var(--text-heading)}
.bh-vazio__txt{font-size:var(--text-sm,13px);color:var(--text-muted)}
`;

export default BalancoHidrico;
