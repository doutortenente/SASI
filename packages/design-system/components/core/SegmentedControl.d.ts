import * as React from 'react';

export interface SegmentOption {
  value: string;
  label: React.ReactNode;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
  /** Tooltip / aria hint. */
  hint?: string;
}

export interface SegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: SegmentOption[];
  value: string;
  onChange?: (value: string) => void;
}

/** Pill-track segmented switch (view modes, UTI filter, theme). */
export function SegmentedControl(props: SegmentedControlProps): React.ReactElement;
