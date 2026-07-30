import * as React from 'react';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
export type BadgeVariant = 'solid' | 'soft' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Semantic color. @default 'neutral' */
  tone?: BadgeTone;
  /** Fill style. @default 'soft' */
  variant?: BadgeVariant;
  /** @default 'md' */
  size?: 'sm' | 'md';
  /** Leading icon node. */
  icon?: React.ReactNode;
}

/** Neutral status badge primitive (GravityBadge / TherapyBadge build on it). */
export function Badge(props: BadgeProps): React.ReactElement;
