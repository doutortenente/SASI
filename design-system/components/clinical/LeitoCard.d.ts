import * as React from 'react';

export type Gravity = 'stable' | 'watcher' | 'unstable' | 'critical' | 'deceased';

export interface LeitoProblem {
  text: React.ReactNode;
  vetor?: '↑' | '↓' | '=' | null;
}

/**
 * Patient bed card — flagship dashboard tile.
 */
export interface LeitoCardProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Bed number, e.g. "07". */
  bed: React.ReactNode;
  /** Unit tag, e.g. "UTI2". */
  uti?: React.ReactNode;
  /** Patient name. */
  name?: React.ReactNode;
  /** Age (years). */
  age?: number;
  /** Acuity level → left accent + badge + pulse if critical. @default 'stable' */
  gravity?: Gravity;
  /** SOFA total. */
  sofa?: number | null;
  /** Δ24h SOFA. */
  deltaSofa?: number | null;
  /** Active problems; [0] becomes the hero line. */
  problems?: LeitoProblem[];
  /** Sepsis-3 alert → red banner + pulse. */
  septic?: boolean;
  /** Counts / flags for therapy pills. */
  dva?: number; sed?: number; vm?: boolean; vni?: boolean; atb?: boolean; pend?: number;
  /** Dense form for the Round side-list. */
  compact?: boolean;
  onClick?: () => void;
}

export function LeitoCard(props: LeitoCardProps): React.ReactElement;
