// ============================================================================
// SASI v2 — TherapyBadge (primitiva clínica)
// Pill de terapia/dispositivo: DVA, sedação, ventilação, ATB, pendências e
// alerta de sepse-3. Cores pelos tokens --badge-*. `pulse` pisca só em alerta
// crítico (sepse-3). `count` anexa a contagem em mono tabular (DVA 2).
// ============================================================================
import type {CSSProperties, ReactElement} from "react";

export type TipoTerapia = "dva" | "sed" | "vm" | "vni" | "atb" | "pend" | "sepsis";

const MAP: Record<TipoTerapia, {label: string; bg: string; text: string}> = {
  dva: {label: "DVA", bg: "var(--badge-dva-bg)", text: "var(--badge-dva-text)"},
  sed: {label: "Sed", bg: "var(--badge-sed-bg)", text: "var(--badge-sed-text)"},
  vm: {label: "VM", bg: "var(--badge-vm-bg)", text: "var(--badge-vm-text)"},
  vni: {label: "VNI", bg: "var(--badge-vni-bg)", text: "var(--badge-vni-text)"},
  atb: {label: "ATB", bg: "var(--badge-atb-bg)", text: "var(--badge-atb-text)"},
  pend: {label: "Pend", bg: "var(--badge-pend-bg)", text: "var(--badge-pend-text)"},
  sepsis: {label: "Sepse-3", bg: "var(--badge-sepsis-bg)", text: "var(--badge-sepsis-text)"},
};

/** Ícones inline (sem dependência externa), na mesma gramática do chassi. */
const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const ICONES: Record<TipoTerapia, ReactElement> = {
  dva: (
    <svg {...svgProps}>
      <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2C10.5 3.5 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>
    </svg>
  ),
  sed: (
    <svg {...svgProps}>
      <path d="M7 16.3c2.2 0 4-1.8 4-4C11 6.9 8.5 3 7 3S3 6.9 3 12.3c0 2.2 1.8 4 4 4Z"/>
      <path d="M17 16.3c2.2 0 4-1.8 4-4C21 6.9 18.5 3 17 3s-4 3.9-4 9.3c0 2.2 1.8 4 4 4Z"/>
      <path d="M7 20h10"/>
    </svg>
  ),
  vm: (
    <svg {...svgProps}>
      <path d="M12.5 2 8 10h8l-4.5 12"/>
    </svg>
  ),
  vni: (
    <svg {...svgProps}>
      <path d="M3 8v9"/>
      <path d="M12 6v12"/>
      <path d="M21 3v18"/>
    </svg>
  ),
  atb: (
    <svg {...svgProps}>
      <path d="M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7Z"/>
      <path d="m7 8 9 9"/>
    </svg>
  ),
  pend: (
    <svg {...svgProps}>
      <path d="m21.7 18.3-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-2.7Z"/>
      <path d="M12 9v4M12 17h.01"/>
    </svg>
  ),
  sepsis: (
    <svg {...svgProps}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3 2.5.5 5 2.2 5 5a4 4 0 0 1-8 0c0-1.2.5-2.2 1.5-3.5"/>
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-3-6.5c-.5.5-3.5 3-5.5 6S5 12 5 15a7 7 0 0 0 7 7Z"/>
    </svg>
  ),
};

export interface TherapyBadgeProps {
  /** Tipo da terapia. Padrão: "dva". */
  type: TipoTerapia;
  /** Sobrescreve o rótulo padrão (ex.: nome da droga). */
  label?: string;
  /** Contagem anexada em tabular (DVA 2). */
  count?: number | null;
  /** Oculta o ícone. */
  showIcon?: boolean;
  /** Pulso crítico (só para sepse-3 / alerta). */
  pulse?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function TherapyBadge({
  type,
  label,
  count = null,
  showIcon = true,
  pulse = false,
  className = "",
  style,
}: TherapyBadgeProps): ReactElement {
  const t = MAP[type];

  return (
    <span
      className={`sasi-tx ${pulse ? "sasi-critical-pulse" : ""} ${className}`.trim()}
      style={{background: t.bg, color: t.text, ...style}}
      title={t.label}
    >
      {showIcon && ICONES[type]}
      {label ?? t.label}
      {count != null && <span style={{fontVariantNumeric: "tabular-nums"}}>{count}</span>}
    </span>
  );
}

export default TherapyBadge;
