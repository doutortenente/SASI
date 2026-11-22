// ============================================================================
// SASI v2 — Badge (primitiva neutra de status)
// Para gravidade clínica use <GravityBadge>; para terapias, <TherapyBadge> —
// este é o selo genérico por trás deles. Variante "solid" é uso raro: só
// quando o estado precisa gritar (ex.: alerta de sepse-3).
// ============================================================================
import type {CSSProperties, ReactElement, ReactNode} from "react";

export type TomBadge = "neutral" | "accent" | "success" | "warning" | "danger";
export type VarianteBadge = "soft" | "solid" | "outline";
export type TamanhoBadge = "sm" | "md";

/** Tokens de cor por tom — nenhum hex aqui, só var(--*). */
const TOM: Record<TomBadge, {solid: string; soft: string; text: string; border: string}> = {
  neutral: {solid: "var(--text-muted)", soft: "var(--surface-raised)", text: "var(--text-muted)", border: "var(--border-default)"},
  accent: {solid: "var(--accent)", soft: "var(--accent-soft)", text: "var(--accent-text)", border: "var(--accent)"},
  success: {solid: "var(--success)", soft: "var(--grav-stable-bg)", text: "var(--grav-stable-text)", border: "var(--success)"},
  warning: {solid: "var(--warning)", soft: "var(--grav-watcher-bg)", text: "var(--grav-watcher-text)", border: "var(--warning)"},
  danger: {solid: "var(--danger)", soft: "var(--grav-critical-bg)", text: "var(--grav-critical-text)", border: "var(--danger)"},
};

export interface BadgeProps {
  children: ReactNode;
  tom?: TomBadge;
  variante?: VarianteBadge;
  tamanho?: TamanhoBadge;
  icone?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Badge({
  children,
  tom = "neutral",
  variante = "soft",
  tamanho = "md",
  icone = null,
  className = "",
  style,
}: BadgeProps): ReactElement {
  const t = TOM[tom];
  let css: CSSProperties;
  if (variante === "solid") css = {background: t.solid, color: "#fff"};
  else if (variante === "outline") css = {borderColor: t.border, color: t.text};
  else css = {background: t.soft, color: t.text};

  return (
    <span
      className={`sasi-badge sasi-badge--${tamanho} sasi-badge--${variante} ${className}`.trim()}
      style={{...css, ...style}}
    >
      {icone}
      {children}
    </span>
  );
}

export default Badge;
