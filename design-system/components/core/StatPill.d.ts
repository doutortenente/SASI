import * as React from 'react';

export type StatTone = 'default' | 'critical' | 'unstable' | 'watcher' | 'stable' | 'accent';

export interface StatPillProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  /** The number / value (rendered in mono tabular). */
  value: React.ReactNode;
  /** Trailing label, e.g. "ativos". */
  label?: React.ReactNode;
  /** Color emphasis. @default 'default' */
  tone?: StatTone;
  /** Leading icon node. */
  icon?: React.ReactNode;
  /** Signed delta (e.g. ΔSOFA); colored up=bad / down=good. */
  delta?: number | null;
  /** Active (filter engaged) styling. */
  active?: boolean;
  /** When provided, renders as a clickable filter toggle. */
  onClick?: () => void;
}

/** Inline dashboard stat / smart-filter toggle. */
export function StatPill(props: StatPillProps): React.ReactElement;
