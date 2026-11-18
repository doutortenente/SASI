// ============================================================================
// SASI v2 — GravityBadge (primitiva clínica)
// Selo dos 5 níveis de gravidade do design system, os mesmos da triagem do
// War Room (features/war-room/triage). `dot` = forma mínima ponto + rótulo.
// Cor nunca é o único sinal: todo estado tem rótulo em texto.
// ============================================================================
import type {CSSProperties, ReactElement} from "react";
import type {Gravity} from "@/features/war-room/triage";

export type TamanhoGravidade = "sm" | "md" | "lg";

const MAP: Record<Gravity, {label: string; bg: string; text: string; solid: string}> = {
  stable: {label: "Estável", bg: "var(--grav-stable-bg)", text: "var(--grav-stable-text)", solid: "var(--grav-stable-solid)"},
  watcher: {label: "Em vigilância", bg: "var(--grav-watcher-bg)", text: "var(--grav-watcher-text)", solid: "var(--grav-watcher-solid)"},
  unstable: {label: "Instável", bg: "var(--grav-unstable-bg)", text: "var(--grav-unstable-text)", solid: "var(--grav-unstable-solid)"},
  critical: {label: "Crítico", bg: "var(--grav-critical-bg)", text: "var(--grav-critical-text)", solid: "var(--grav-critical-solid)"},
  deceased: {label: "Óbito", bg: "var(--grav-deceased-bg)", text: "var(--grav-deceased-text)", solid: "var(--grav-deceased-solid)"},
};

export interface GravityBadgeProps {
  /** Nível de gravidade da triagem. Padrão: "stable". */
  level: Gravity;
  tamanho?: TamanhoGravidade;
  /** Sobrescreve o rótulo padrão pt-BR (ex.: plural no painel). */
  label?: string;
  /** Forma mínima: ponto colorido + rótulo, sem fundo. */
  dot?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function GravityBadge({
  level,
  tamanho = "md",
  label,
  dot = false,
  className = "",
  style,
}: GravityBadgeProps): ReactElement {
  const g = MAP[level];

  return (
    <span
      className={`sasi-grav sasi-grav--${tamanho} ${className}`.trim()}
      style={{background: dot ? "transparent" : g.bg, color: g.text, ...style}}
    >
      {dot && <span className="sasi-grav__dot" style={{background: g.solid}}/>}
      {label ?? g.label}
    </span>
  );
}

export default GravityBadge;
