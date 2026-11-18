"use client";
// ============================================================================
// SASI v2 — SegmentedControl (primitiva de controle)
// Grupo de opções exclusivas (abas, filtros). Role="tablist" com aria-selected
// por botão. Usa a variante `.sasi-seg--box` para não colidir com o filtro
// pill da TopBar (que usa `.sasi-seg` direto).
// ============================================================================
import type {ReactElement, ReactNode} from "react";

export interface OpcaoSegmento {
  value: string;
  label: string;
  icon?: ReactNode;
  /** Dica estendida (vira title). */
  hint?: string;
}

export interface SegmentedControlProps {
  options: readonly OpcaoSegmento[];
  value: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function SegmentedControl({options, value, onChange, className = ""}: SegmentedControlProps): ReactElement {
  return (
    <div className={`sasi-seg sasi-seg--box ${className}`.trim()} role="tablist">
      {options.map((opcao) => {
        const ativo = opcao.value === value;
        return (
          <button
            key={opcao.value}
            type="button"
            role="tab"
            aria-selected={ativo}
            className={`sasi-seg__btn ${ativo ? "is-active" : ""}`.trim()}
            onClick={() => onChange?.(opcao.value)}
            title={opcao.hint ?? opcao.label}
          >
            {opcao.icon}
            {opcao.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
