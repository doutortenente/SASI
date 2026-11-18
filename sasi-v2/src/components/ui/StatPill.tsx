"use client";
// ============================================================================
// SASI v2 — StatPill (primitiva de número estatístico)
// Número em mono tabular + rótulo + Δ opcional. Com onClick vira alvo de toque
// (≥44px não garantido: uso pontual em cabeçalhos densos). Δ>0 = piora (vermelho),
// Δ<0 = melhora (verde) — mesma leitura de vetor do SOFA.
// ============================================================================
import type {CSSProperties, ReactElement, ReactNode} from "react";

export type TomStat = "default" | "accent" | "success" | "warning" | "danger";

const COR_TOM: Record<TomStat, string | undefined> = {
  default: undefined,
  accent: "var(--accent-text)",
  success: "var(--grav-stable-text)",
  warning: "var(--grav-watcher-text)",
  danger: "var(--grav-critical-text)",
};

export interface StatPillProps {
  /** Valor exibido (já formatado em pt-BR pelo chamador). */
  value: ReactNode;
  label?: string;
  tone?: TomStat;
  icon?: ReactNode;
  /** Delta 24h. >0 = piora (vermelho), <0 = melhora (verde). */
  delta?: number | null;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

export function StatPill({
  value,
  label,
  tone = "default",
  icon = null,
  delta = null,
  active = false,
  onClick,
  className = "",
  style,
}: StatPillProps): ReactElement {
  const clicavel = typeof onClick === "function";
  const Tag = clicavel ? "button" : "span";
  const cor = COR_TOM[tone];
  const corDelta =
    delta != null ? (delta > 0 ? "var(--grav-critical-solid)" : delta < 0 ? "var(--success)" : "var(--text-muted)") : undefined;

  return (
    <Tag
      className={["sasi-stat", clicavel ? "sasi-stat--btn" : "", active ? "sasi-stat--active" : "", className]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      style={cor ? {color: cor, ...style} : style}
    >
      {icon}
      <span className="sasi-stat__num" style={cor ? {color: cor} : undefined}>
        {value}
      </span>
      {label && <span>{label}</span>}
      {delta != null && delta !== 0 && (
        <span className="sasi-stat__delta" style={{color: corDelta}}>
          {delta > 0 ? "↑+" : "↓"}
          {Math.abs(delta)}
        </span>
      )}
    </Tag>
  );
}

export default StatPill;
