// ============================================================================
// SASI v2 — SofaBadge (primitiva clínica)
// Chip do score SOFA com cor por faixa e Δ24h opcional. A cor de faixa usa os
// MESMOS cortes da v2 (BedCard, revisão de design de 30-jul): 12/8/4. Δ>0 =
// piora (vermelho), Δ<0 = melhora (verde) — o sinal central do Sepsis-3.
// Sem dado: mostra "—" em vez de inventar número (doutrina zero alucinação).
// ============================================================================
import type {CSSProperties, ReactElement} from "react";

export function corSofa(score: number | null): string {
  if (score == null) return "var(--text-muted)";
  if (score >= 12) return "var(--sofa-critical)";
  if (score >= 8) return "var(--sofa-high)";
  if (score >= 4) return "var(--sofa-medium)";
  return "var(--sofa-low)";
}

export interface SofaBadgeProps {
  /** SOFA total da última evolução (do banco). null => "—". */
  score?: number | null;
  /** Variação do SOFA em 24 h. */
  delta?: number | null;
  className?: string;
  style?: CSSProperties;
}

export function SofaBadge({score = null, delta = null, className = "", style}: SofaBadgeProps): ReactElement {
  const hi = (score ?? 0) >= 8;
  const corDelta =
    delta != null ? (delta > 0 ? "var(--grav-critical-solid)" : delta < 0 ? "var(--success)" : "var(--text-muted)") : undefined;

  return (
    <span
      className={`sasi-sofa ${hi ? "sasi-sofa--hi" : ""} ${className}`.trim()}
      style={style}
      title={`SOFA ${score ?? "—"}${delta != null ? ` · Δ24h ${delta > 0 ? "+" : ""}${delta}` : ""}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
      <span className="sasi-sofa__lbl">SOFA</span>
      <span className="sasi-sofa__val" style={{color: corSofa(score)}}>
        {score ?? "—"}
      </span>
      {delta != null && delta !== 0 && (
        <span className="sasi-sofa__delta" style={{color: corDelta}}>
          {delta > 0 ? "↑+" : "↓"}
          {Math.abs(delta)}
        </span>
      )}
    </span>
  );
}

export default SofaBadge;
