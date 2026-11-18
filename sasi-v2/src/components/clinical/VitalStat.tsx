// ============================================================================
// SASI v2 — VitalStat (primitiva clínica)
// Número vital isolado: rótulo uppercase + valor mono tabular + unidade.
// status alto/baixa/... só por token de fundo+cor, sempre acompanhado do
// rótulo (cor nunca é o único sinal). Valor ausente vira travessão "—".
// ============================================================================
import type {CSSProperties, ReactElement} from "react";

export type StatusVital = "ok" | "high" | "low" | "pos" | "neg";

export interface VitalStatProps {
  label: string;
  /** Valor já formatado (pt-BR, mono tabular). null/"" => "—". */
  value: string | number | null;
  /** Unidade que acompanha o valor (só aparece com valor). */
  unit?: string;
  status?: StatusVital;
  className?: string;
  style?: CSSProperties;
}

export function VitalStat({label, value, unit = "", status = "ok", className = "", style}: VitalStatProps): ReactElement {
  const display = value == null || value === "" ? "—" : value;

  return (
    <div className={`sasi-vital sasi-vital--${status} ${className}`.trim()} style={style}>
      <span className="sasi-vital__lbl">{label}</span>
      <span className="sasi-vital__val">
        {display}
        {display !== "—" && unit && <span className="sasi-vital__unit">{unit}</span>}
      </span>
    </div>
  );
}

export default VitalStat;
