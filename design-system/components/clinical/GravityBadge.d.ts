import * as React from 'react';

export type GravityLevel = 'stable' | 'watcher' | 'unstable' | 'critical' | 'deceased';

/**
 * Patient acuity badge — Estável · Watcher · Instável · Crítico · Óbito.
 */
export interface GravityBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Acuity level. @default 'stable' */
  level?: GravityLevel;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Override the default Portuguese label. */
  label?: React.ReactNode;
  /** Minimal dot + label form (transparent background). */
  dot?: boolean;
}

export function GravityBadge(props: GravityBadgeProps): React.ReactElement;
