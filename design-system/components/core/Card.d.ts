import * as React from 'react';

export type Gravity = 'stable' | 'watcher' | 'unstable' | 'critical' | 'deceased';

/**
 * The workhorse surface — panels, sub-cards, leito tiles.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Panel title (slate heading). */
  title?: React.ReactNode;
  /** Uppercase eyebrow above the title. */
  eyebrow?: React.ReactNode;
  /** Numbered badge for the 1–5 workflow panels. */
  number?: number | string;
  /** Right-aligned header slot (buttons, links). */
  action?: React.ReactNode;
  /** Adds a gravity-colored left accent bar. */
  gravity?: Gravity;
  /** Internal padding. @default true */
  padded?: boolean;
  /** Hover-lift + pointer affordance. @default false */
  interactive?: boolean;
}

export function Card(props: CardProps): React.ReactElement;
