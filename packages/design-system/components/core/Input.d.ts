import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement> {
  /** Uppercase field label. */
  label?: React.ReactNode;
  /** Helper text below the control. */
  hint?: React.ReactNode;
  /** Leading icon node (positioned inside the field). */
  icon?: React.ReactElement;
  /** Render a <textarea>. @default false */
  multiline?: boolean;
  /** Error styling. @default false */
  invalid?: boolean;
}

/** Text input / textarea with label, leading icon, and validation state. */
export function Input(props: InputProps): React.ReactElement;
