// ============================================================================
// SASI v2 — VitalsTable (sinais vitais das ultimas 24 h, em MAXIMO–MINIMO)
// ----------------------------------------------------------------------------
// Recebe as linhas JA agregadas pela camada de dados (serieVitais24h ->
// eventos_clinicos) e imprime. Nao le banco, nao calcula clinica, nao converte
// unidade. Server Component (texto puro, sem estado).
//
// DOUTRINA APLICADA
//  1. REGRA DE FERRO — MAXIMO ANTES DO MINIMO. As colunas "Máximo" e "Mínimo"
//     sao adjacentes e o par se le como um numero so: "135–88 mmHg", "98–89%".
//     JAMAIS "88–135". A ordem e clinica, nao estetica.
//  2. ZERO ALUCINACAO — sem medida na janela a linha inteira mostra "—"
//     (nao avaliado). Nunca 0 como vazio, nunca unidade chutada: rotulo e
//     unidade vem de evento_tipo_ref (ou do proprio evento, em modo degradado).
//  3. UMA medida so => mostra o valor UMA vez (nao existe par "135–135").
//     A celula de minimo diz "única" — o medico ve que o par nao existe.
//  4. FLAGS GRITAM, NAO CONSERTAM — valor fora de faixa_min/faixa_max de
//     evento_tipo_ref sai em --danger com title explicando; medida marcada
//     requires_review sai com selo "revisar" em --warning. O valor NAO e
//     alterado nem escondido: quem decide e o medico.
//  5. Numero em mono tabular (.tabnum) e cor so por token CSS. Zero hex.
//
// O CSS (CSS_VITALS_TABLE) e injetado UMA vez pela pagina que monta a aba —
// mesmo padrao de BedGrid/BedCard.
// ============================================================================
import type { ReactElement } from "react";
import type { SerieVital } from "@/lib/data";
import { num } from "@/lib/formatters/br";
import { Sparkline, type PontoSparkline } from "./Sparkline";
import { unidadeSegura } from "@/lib/formatters/br";

const TRAVESSAO = "—";

/** Casas decimais dos vitais: 1 basta (36,8 °C mantem a decima; 135 mmHg fica inteiro). */
const CASAS = 1;

/** Fuso do plantao — o horario da ultima medida e lido em hora local do leito. */
const FMT_HORA = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  hour: "2-digit",
  minute: "2-digit",
});

/** "2026-07-30T04:12:00Z" -> "04:12" (America/Sao_Paulo). ts invalido => null. */
function hhmm(ts: string | null): string | null {
  if (!ts) return null;
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : FMT_HORA.format(d);
}

/**
 * Uma linha da tabela: o agregado de serieVitais24h + a faixa fisiologica da
 * dimensao (evento_tipo_ref) + os pontos crus para o mini-grafico.
 */
export interface LinhaVital extends SerieVital {
  /** evento_tipo_ref.faixa_min — limite fisiologico PLAUSIVEL (nao "normal"). */
  faixa_min: number | null;
  /** evento_tipo_ref.faixa_max. */
  faixa_max: number | null;
  /** Pontos (ts, valor_num) da janela para o sparkline. < 2 => nao desenha. */
  pontos: PontoSparkline[];
}

export interface VitalsTableProps {
  /** Linhas na ORDEM clinica definida pela pagina (PAS, PAD, PAM, FC, FR, SpO2, Temp, Dx). */
  linhas: LinhaVital[];
  /** Tamanho da janela em horas (so rotulo). Padrao 24. */
  horas?: number;
  /** true = evento_tipo_ref veio vazia: rotulo = codigo, sem unidade padrao e SEM faixa. */
  semDimensao?: boolean;
}

/** Fora da faixa fisiologica plausivel. Sem valor ou sem faixa => false. */
function fora(v: number | null, min: number | null, max: number | null): boolean {
  if (v == null || !Number.isFinite(v)) return false;
  if (min != null && v < min) return true;
  if (max != null && v > max) return true;
  return false;
}

/** Texto do title de um valor implausivel — diz a faixa e o que fazer. */
function tituloFora(min: number | null, max: number | null, unidade: string | null): string {
  const un = unidade ? ` ${unidade}` : "";
  const faixa =
    min != null && max != null
      ? ` (faixa ${num(min, CASAS)}–${num(max, CASAS)}${un})`
      : min != null
        ? ` (mínimo plausível ${num(min, CASAS)}${un})`
        : max != null
          ? ` (máximo plausível ${num(max, CASAS)}${un})`
          : "";
  return `fora da faixa fisiológica — revisar${faixa}`;
}

/** Resumo da linha em uma frase (vira title da celula do parametro). */
function resumoLinha(l: LinhaVital, horas: number): string {
  if (l.n === 0) return `${l.rotulo}: não avaliado nas últimas ${horas} h`;
  const un = l.unidade ? ` ${unidadeSegura(l.unidade)}` : "";
  const par = l.n === 1 ? `${num(l.max, CASAS)}${un} (medida única)` : `${num(l.max, CASAS)}–${num(l.min, CASAS)}${un}`;
  const hora = hhmm(l.ts);
  const ultimo = l.ultimo != null ? ` · último ${num(l.ultimo, CASAS)}${un}${hora ? ` às ${hora}` : ""}` : "";
  return `${l.rotulo}: ${par} em ${horas} h · ${l.n} medida${l.n > 1 ? "s" : ""}${ultimo}`;
}

/** Valor numerico com sinalizacao de implausivel (cor + title). Ausente => "—". */
function Valor({
  v,
  linha,
  classe,
}: {
  v: number | null;
  linha: LinhaVital;
  classe?: string;
}): ReactElement {
  if (v == null) return <span className="vt__vazio">{TRAVESSAO}</span>;
  const alerta = fora(v, linha.faixa_min, linha.faixa_max);
  return (
    <span
      className={classe}
      style={alerta ? { color: "var(--danger)", fontWeight: 700 } : undefined}
      title={alerta ? tituloFora(linha.faixa_min, linha.faixa_max, linha.unidade) : undefined}
    >
      {num(v, CASAS)}
    </span>
  );
}

export function VitalsTable({ linhas, horas = 24, semDimensao = false }: VitalsTableProps): ReactElement {
  // Estado vazio estrutural: nem a lista de parametros existe (dimensao fora do ar
  // E sem fallback). Nao inventamos linhas — dizemos o que aconteceu.
  if (linhas.length === 0) {
    return (
      <section className="vt-vazio">
        <strong className="vt-vazio__ttl">Nenhum parâmetro vital configurado</strong>
        <span className="vt-vazio__txt">
          A dimensão <code className="tabnum">evento_tipo_ref</code> não devolveu nenhum tipo de sinal
          vital. Sem vocabulário não há linha para exibir — e o app não inventa parâmetro.
        </span>
      </section>
    );
  }

  const comDado = linhas.filter((l: LinhaVital) => l.n > 0).length;

  return (
    <section className="vt-bloco" aria-labelledby="vt-titulo">
      <div className="vt-cab">
        <h2 className="vt-cab__ttl" id="vt-titulo">
          Sinais vitais · últimas {horas} h
        </h2>
        <span className="vt-cab__sub tabnum">
          {comDado} de {linhas.length} parâmetros com medida
        </span>
      </div>

      <div className="vt-wrap">
        <table className="vt">
          <caption className="vt__cap">
            Máximo–mínimo por parâmetro nas últimas {horas} h — fonte <code className="tabnum">eventos_clinicos</code>
          </caption>
          <thead>
            <tr>
              <th scope="col" className="vt__th vt__th--param">
                Parâmetro
              </th>
              <th scope="col" className="vt__th vt__th--max">
                Máximo
              </th>
              <th scope="col" className="vt__th vt__th--min">
                Mínimo
              </th>
              <th scope="col" className="vt__th vt__th--dir">
                Último
              </th>
              <th scope="col" className="vt__th">
                Unidade
              </th>
              <th scope="col" className="vt__th vt__th--trend">
                Tendência {horas} h
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l: LinhaVital) => {
              const semDado = l.n === 0;
              const unica = l.n === 1;
              const hora = hhmm(l.ts);

              return (
                <tr key={l.tipo} className={semDado ? "vt__tr vt__tr--vazio" : "vt__tr"}>
                  {/* parametro + quantas medidas sustentam o par + selo de revisao */}
                  <th scope="row" className="vt__param" title={resumoLinha(l, horas)}>
                    <span className="vt__nome">{l.rotulo}</span>
                    {semDado ? (
                      <span className="vt__n">não avaliado</span>
                    ) : (
                      <span className="vt__n tabnum">
                        {l.n} med{l.n > 1 ? "s" : ""}.
                      </span>
                    )}
                    {l.requires_review ? (
                      <span
                        className="vt__rev"
                        title="há medida marcada para revisão (requires_review / baixa confiança na extração) — o sistema sinaliza, não corrige"
                      >
                        revisar
                      </span>
                    ) : null}
                  </th>

                  {/* MAXIMO — sempre a esquerda do minimo (regra de ferro) */}
                  <td className="vt__max tabnum">
                    <Valor v={l.max} linha={l} />
                  </td>

                  {/* MINIMO — colado ao maximo: o par se le "135–88" */}
                  <td className="vt__min tabnum">
                    {semDado ? (
                      <span className="vt__vazio">{TRAVESSAO}</span>
                    ) : unica ? (
                      <span className="vt__unica" title="medida única na janela — não há par máximo–mínimo">
                        única
                      </span>
                    ) : (
                      <>
                        <span className="vt__sep" aria-hidden="true">
                          –
                        </span>
                        <Valor v={l.min} linha={l} />
                      </>
                    )}
                  </td>

                  {/* ULTIMO — onde o paciente esta agora, com a hora da medida */}
                  <td className="vt__ult tabnum">
                    <Valor v={l.ultimo} linha={l} />
                    {hora ? (
                      <span className="vt__hora tabnum" title="horário da última medida (America/Sao_Paulo)">
                        {hora}
                      </span>
                    ) : null}
                  </td>

                  {/* UNIDADE — de evento_tipo_ref (ou do evento gravado). Nunca chutada. */}
                  <td className="vt__un">{l.unidade ? unidadeSegura(l.unidade) : <span className="vt__vazio">{TRAVESSAO}</span>}</td>

                  {/* TENDENCIA — SVG puro; menos de 2 pontos nao desenha */}
                  <td className="vt__trend">
                    {l.pontos.length >= 2 ? (
                      <Sparkline
                        pontos={l.pontos}
                        rotulo={l.rotulo}
                        unidade={unidadeSegura(l.unidade)}
                        faixaMin={l.faixa_min}
                        faixaMax={l.faixa_max}
                        casas={CASAS}
                        cor={l.fora_faixa ? "var(--danger)" : "var(--accent)"}
                      />
                    ) : (
                      <span className="vt__vazio" title={`menos de 2 medidas em ${horas} h — sem tendência`}>
                        {TRAVESSAO}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="vt-legenda">
        <li>
          Leitura sempre <strong>máximo–mínimo</strong> (ex.: <span className="tabnum">135–88 mmHg</span>,{" "}
          <span className="tabnum">98–89%</span>). Nunca o inverso.
        </li>
        <li>
          <span className="vt-legenda__danger">Valor em vermelho</span> = fora da faixa fisiológica de{" "}
          <code className="tabnum">evento_tipo_ref</code> — o sistema sinaliza, não corrige.
        </li>
        <li>
          <span className="vt__rev">revisar</span> = a janela tem medida marcada{" "}
          <code className="tabnum">requires_review</code> (baixa confiança na extração).
        </li>
        <li>
          <span className="vt__vazio">{TRAVESSAO}</span> = não avaliado no período. Ausência de medida nunca vira 0.
        </li>
        {semDimensao ? (
          <li className="vt-legenda__alerta">
            <code className="tabnum">evento_tipo_ref</code> indisponível para esta sessão: rótulo = código do evento,
            sem unidade padrão e <strong>sem faixa fisiológica</strong> — nenhum valor é sinalizado como implausível.
          </li>
        ) : null}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CSS da tabela. Injetado UMA vez pela pagina da aba (padrao BedGrid/BedCard):
// hover, sticky e scroll horizontal nao cabem em estilo inline.
// So tokens do design system — zero hex.
// ---------------------------------------------------------------------------
export const CSS_VITALS_TABLE = `
.vt-bloco{display:flex;flex-direction:column;gap:10px;min-width:0}

.vt-cab{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap}
.vt-cab__ttl{margin:0;font-size:var(--text-lg,20px);font-weight:700;color:var(--text-heading)}
.vt-cab__sub{font-size:var(--text-xs,11px);color:var(--text-muted)}

.vt-wrap{overflow-x:auto;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;
  background:var(--surface-card);border:1px solid var(--border-default);
  border-radius:var(--radius-xl,16px);box-shadow:var(--shadow-card)}
.vt{width:100%;min-width:560px;border-collapse:collapse}

.vt__cap{caption-side:top;text-align:left;padding:12px 14px 8px;
  font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;color:var(--text-muted)}

.vt__th{padding:8px 10px;text-align:left;white-space:nowrap;
  background:var(--surface-sunken);border-bottom:1px solid var(--border-default);
  font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;color:var(--text-muted)}
.vt__th--max{text-align:right;padding-right:3px}
.vt__th--min{text-align:left;padding-left:3px}
.vt__th--dir{text-align:right}
.vt__th--trend{text-align:center}

.vt__tr{height:44px;border-bottom:1px solid var(--border-subtle)}
.vt__tr:last-child{border-bottom:0}

.vt__param{position:sticky;left:0;z-index:1;padding:6px 10px;text-align:left;
  background:var(--surface-card);border-right:1px solid var(--border-subtle);
  font-size:var(--text-sm,13px);font-weight:700;color:var(--text-heading);white-space:nowrap}
.vt__nome{display:inline-block;vertical-align:middle}
.vt__n{display:inline-block;vertical-align:middle;margin-left:6px;
  font-size:var(--text-2xs,10px);font-weight:600;color:var(--text-faint)}
.vt__rev{display:inline-block;vertical-align:middle;margin-left:6px;padding:1px 7px;
  border-radius:var(--radius-pill,9999px);
  background:color-mix(in srgb, var(--warning) 16%, transparent);color:var(--warning);
  border:1px solid color-mix(in srgb, var(--warning) 34%, transparent);
  font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-wide,.04em);text-transform:uppercase}

.vt__max{padding:6px 3px 6px 10px;text-align:right;white-space:nowrap;
  font-size:var(--text-md,17px);font-weight:700;color:var(--text-heading)}
.vt__min{padding:6px 10px 6px 3px;text-align:left;white-space:nowrap;
  font-size:var(--text-md,17px);font-weight:700;color:var(--text-heading)}
.vt__sep{padding:0 1px;color:var(--text-faint);font-weight:400}
.vt__unica{font-family:var(--font-sans,inherit);font-size:var(--text-2xs,10px);font-weight:600;
  color:var(--text-faint);text-transform:uppercase;letter-spacing:var(--tracking-wide,.04em)}

.vt__ult{padding:6px 10px;text-align:right;white-space:nowrap;
  font-size:var(--text-sm,13px);font-weight:600;color:var(--text-body)}
.vt__hora{display:block;font-size:var(--text-2xs,10px);font-weight:400;color:var(--text-faint)}

.vt__un{padding:6px 10px;white-space:nowrap;font-size:var(--text-xs,11px);color:var(--text-muted)}
.vt__trend{padding:6px 10px;text-align:center}
.vt__trend svg{margin:0 auto}

.vt__vazio{color:var(--text-faint);font-weight:400}
.vt__tr--vazio .vt__param{color:var(--text-muted);font-weight:600}

.vt-legenda{display:flex;flex-direction:column;gap:4px;margin:0;padding:0 2px;list-style:none;
  font-size:var(--text-xs,11px);line-height:var(--leading-snug,1.35);color:var(--text-muted)}
.vt-legenda__danger{color:var(--danger);font-weight:700}
.vt-legenda__alerta{color:var(--warning)}

.vt-vazio{display:flex;flex-direction:column;gap:6px;padding:24px 16px;text-align:center;
  background:var(--surface-card);border:1px dashed var(--border-strong);border-radius:var(--radius-lg,12px)}
.vt-vazio__ttl{font-size:var(--text-md,17px);color:var(--text-heading)}
.vt-vazio__txt{font-size:var(--text-sm,13px);color:var(--text-muted)}
`;

export default VitalsTable;
