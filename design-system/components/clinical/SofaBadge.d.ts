import * as React from 'react';

export interface SofaBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** SOFA total (0–24). null renders an em dash. */
  score?: number | null;
  /** Δ24h change; positive=worse (red), negative=better (emerald). */
  delta?: number | null;
  /** Show the leading activity glyph (requires Lucide on the page). @default true */
  showIcon?: boolean;
}

/** SOFA score chip: threshold-colored value + Δ24h. */
export function SofaBadge(props: SofaBadgeProps): React.ReactElement;
/** Returns the CSS-var color for a SOFA score (low→critical). */
export function sofaColor(score: number | null): string;
