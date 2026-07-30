import * as React from 'react';

export type SystemKey = 'neuro' | 'resp' | 'hemo' | 'tgi' | 'renal' | 'hemato' | 'infecto';

/**
 * Organ-system summary panel with colored left accent.
 */
export interface SystemPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Which organ system (sets color + glyph + default title). @default 'neuro' */
  system?: SystemKey;
  /** Explicit key/value rows. */
  rows?: Array<{ k: React.ReactNode; v: React.ReactNode }>;
  /** Or a flat data object (keys underscored → spaced). */
  data?: Record<string, unknown>;
  /** Override the system name in the header. */
  title?: React.ReactNode;
}

export function SystemPanel(props: SystemPanelProps): React.ReactElement;
