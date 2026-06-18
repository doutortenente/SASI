import * as React from 'react';

export type VitalStatus = 'ok' | 'high' | 'low' | 'pos' | 'neg';

export interface VitalStatProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Short label, e.g. "PAM", "SpO₂". */
  label: React.ReactNode;
  /** Numeric value (null/empty → em dash). */
  value?: React.ReactNode;
  /** Unit suffix, e.g. "%", "°". */
  unit?: string;
  /** Alert state: high=red, low=blue, pos/neg=balanço, ok=neutral. @default 'ok' */
  status?: VitalStatus;
}

/** A single vital-sign tile for the PAINEL GERAL / situação atual strip. */
export function VitalStat(props: VitalStatProps): React.ReactElement;
