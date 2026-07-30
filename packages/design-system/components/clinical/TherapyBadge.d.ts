import * as React from 'react';

export type TherapyType = 'dva' | 'sed' | 'vm' | 'vni' | 'atb' | 'pend' | 'sepsis';

export interface TherapyBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Which therapy/device. @default 'dva' */
  type?: TherapyType;
  /** Optional count appended to the label (e.g. DVA 2). */
  count?: number | null;
  /** Override the default label. */
  label?: React.ReactNode;
  /** Show the leading Lucide glyph. @default true */
  showIcon?: boolean;
  /** Apply the critical-pulse animation (use for Sepse-3). */
  pulse?: boolean;
}

/** Therapy & device pills — DVA, Sed, VM, VNI, ATB, Pend, Sepse-3. */
export function TherapyBadge(props: TherapyBadgeProps): React.ReactElement;
