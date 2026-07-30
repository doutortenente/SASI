import * as React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Command button for the SASI dashboard.
 */
export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  /** Visual style. `primary` = the one decisive action per surface. */
  variant?: ButtonVariant;
  /** Control height / padding. @default 'md' */
  size?: ButtonSize;
  /** Leading icon node (e.g. a Lucide <i> or <svg>). */
  icon?: React.ReactNode;
  /** Trailing icon node. */
  iconRight?: React.ReactNode;
  /** Stretch to full container width. */
  block?: boolean;
  /** Render as a different element, e.g. 'a'. @default 'button' */
  as?: 'button' | 'a';
  disabled?: boolean;
}

export function Button(props: ButtonProps): React.ReactElement;
