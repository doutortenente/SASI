import * as React from 'react';

export type Vetor = '↑' | '↓' | '=' | null;

export interface ProblemRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The problem text, e.g. "Choque séptico SCAI C". */
  text: React.ReactNode;
  /** Trend vetor: ↑ worsening (red) / ↓ improving (emerald) / = stable. */
  vetor?: Vetor;
  /** Optional system tag shown faint after the text. */
  system?: React.ReactNode;
  /** Headline form with giant vetor + eyebrow. @default false */
  hero?: boolean;
  /** Eyebrow label for the hero form. @default 'Problema Ativo' */
  eyebrow?: React.ReactNode;
}

/** Active-problem line with directional vetor (the LeitoCard hero + lists). */
export function ProblemRow(props: ProblemRowProps): React.ReactElement;
