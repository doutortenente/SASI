// ============================================================================
// SASI v2 — Sparkline (mini-grafico de tendencia, SVG inline PURO)
// ----------------------------------------------------------------------------
// Desenha a sequencia de `valor_num` no tempo (eventos_clinicos) num tracado de
// ~1 cm de altura, para leitura periferica dentro da tabela de sinais.
// Sem biblioteca de grafico: so <svg> + <polyline>. Server Component (sem estado).
//
// DOUTRINA APLICADA
//  - ZERO ALUCINACAO: so entra ponto com valor REAL. Medida ausente nao vira 0 e
//    nao vira interpolacao: ela simplesmente nao existe no tracado.
//  - Menos de 2 pontos => NAO DESENHA (retorna null). Um ponto solto nao e
//    tendencia; a tabela mostra "—" no lugar.
//  - "Flags gritam, nao consertam": ponto fora da faixa fisiologica de
//    evento_tipo_ref ganha marcador em --danger. O tracado nao e corrigido.
//  - Cor so por token CSS. Zero hex.
//  - Sem animacao (o tracado e dado, nao decoracao).
//
// EIXOS: x = tempo real (ts), nao a posicao na lista — intervalo irregular de
// coleta aparece como espacamento irregular, que e a verdade da folha de UTI.
// ============================================================================
import type { ReactElement } from "react";
import { num } from "@/lib/formatters/br";

/** Um ponto da serie: ts do evento + valor_num (ja validado como numero). */
export interface PontoSparkline {
  /** eventos_clinicos.ts (ISO). */
  ts: string;
  /** eventos_clinicos.valor_num. Nunca null aqui — quem monta a lista filtra. */
  valor: number;
}

export interface SparklineProps {
  /** Pontos da janela. Ordem livre (o componente ordena por ts). */
  pontos: PontoSparkline[];
  /** Largura em px. Padrao 96. */
  largura?: number;
  /** Altura em px. Padrao 26. */
  altura?: number;
  /** Cor do tracado (token CSS). Padrao var(--accent). */
  cor?: string;
  /** Nome do parametro — entra na leitura por voz. Ex.: "PA sistólica". */
  rotulo?: string;
  /** Unidade vinda de evento_tipo_ref (nunca chutada aqui). */
  unidade?: string | null;
  /** Faixa fisiologica plausivel (evento_tipo_ref). Fora dela = marcador --danger. */
  faixaMin?: number | null;
  faixaMax?: number | null;
  /** Casas decimais na leitura por voz. Padrao 1. */
  casas?: number;
}

interface PontoPlano {
  x: number;
  y: number;
  valor: number;
  fora: boolean;
}

/** Fora da faixa fisiologica plausivel. Sem faixa cadastrada => false (zero alarme falso). */
function foraFaixa(v: number, min: number | null | undefined, max: number | null | undefined): boolean {
  if (min != null && v < min) return true;
  if (max != null && v > max) return true;
  return false;
}

/** Arredonda coordenada para 2 casas (SVG limpo, sem float gigante). */
const r2 = (n: number): number => Math.round(n * 100) / 100;

export function Sparkline({
  pontos,
  largura = 96,
  altura = 26,
  cor = "var(--accent)",
  rotulo = "",
  unidade = null,
  faixaMin = null,
  faixaMax = null,
  casas = 1,
}: SparklineProps): ReactElement | null {
  // 1. Higiene: so ponto com valor finito e ts valido; ordem cronologica.
  const limpos = pontos
    .filter((p: PontoSparkline) => Number.isFinite(p.valor) && !Number.isNaN(new Date(p.ts).getTime()))
    .map((p: PontoSparkline) => ({ t: new Date(p.ts).getTime(), valor: p.valor }))
    .sort((a: { t: number }, b: { t: number }) => a.t - b.t);

  // 2. Menos de 2 pontos nao e tendencia — nao desenha.
  if (limpos.length < 2) return null;

  const pad = 3;
  const larguraUtil = Math.max(1, largura - pad * 2);
  const alturaUtil = Math.max(1, altura - pad * 2);

  const t0 = limpos[0].t;
  const t1 = limpos[limpos.length - 1].t;
  const spanT = t1 - t0;

  const valores = limpos.map((p: { valor: number }) => p.valor);
  const vMax = Math.max(...valores);
  const vMin = Math.min(...valores);
  const spanV = vMax - vMin;

  const planos: PontoPlano[] = limpos.map((p: { t: number; valor: number }, i: number): PontoPlano => {
    // Todos os pontos no mesmo instante (colisao de ts): distribui por indice.
    const fx = spanT > 0 ? (p.t - t0) / spanT : i / (limpos.length - 1);
    // Serie constante: linha no meio (nao ha amplitude para escalar).
    const fy = spanV > 0 ? (vMax - p.valor) / spanV : 0.5;
    return {
      x: r2(pad + fx * larguraUtil),
      y: r2(pad + fy * alturaUtil),
      valor: p.valor,
      fora: foraFaixa(p.valor, faixaMin, faixaMax),
    };
  });

  const traco = planos.map((p: PontoPlano) => `${p.x},${p.y}`).join(" ");
  const ultimo = planos[planos.length - 1];
  const marcados = planos.filter((p: PontoPlano) => p.fora);

  const un = unidade ? ` ${unidade}` : "";
  const leitura =
    `Tendência${rotulo ? ` de ${rotulo}` : ""}: ${limpos.length} medidas, ` +
    `de ${num(valores[0], casas)} a ${num(valores[valores.length - 1], casas)}${un}` +
    (marcados.length > 0 ? ` — ${marcados.length} fora da faixa fisiológica` : "");

  return (
    <svg
      width={largura}
      height={altura}
      viewBox={`0 0 ${largura} ${altura}`}
      role="img"
      aria-label={leitura}
      focusable="false"
      shapeRendering="geometricPrecision"
      style={{ display: "block", overflow: "visible" }}
    >
      <title>{leitura}</title>

      {/* tracado da serie */}
      <polyline
        points={traco}
        fill="none"
        stroke={cor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* medidas implausiveis: o sistema SINALIZA, nao corrige o tracado */}
      {marcados.map((p: PontoPlano, i: number) => (
        <circle key={`fora-${i}-${p.x}`} cx={p.x} cy={p.y} r={2} fill="var(--danger)" />
      ))}

      {/* ultima medida da janela (onde o paciente esta agora) */}
      <circle cx={ultimo.x} cy={ultimo.y} r={2.2} fill={ultimo.fora ? "var(--danger)" : cor} />
    </svg>
  );
}

export default Sparkline;
