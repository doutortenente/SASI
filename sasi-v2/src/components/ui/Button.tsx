// ============================================================================
// SASI v2 — Button (primitiva do design system, reescrita do DS antigo)
// Primária (accent cheio) dirige a ação principal da tela. Navegação usa o
// próprio <Link> com className="sasi-btn ...". Cores só por token.
// ============================================================================
import type {ButtonHTMLAttributes, ReactElement, ReactNode} from "react";

export type VarianteButton = "primary" | "secondary" | "ghost" | "soft" | "danger" | "success";
export type TamanhoButton = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Papel do botão na tela. Padrão: "primary" (ações principais). */
  variante?: VarianteButton;
  /** sm = ações de card/chip. lg = telas full. Padrão: "md". */
  tamanho?: TamanhoButton;
  /** Ícone SVG à esquerda (inline, herdando currentColor). */
  icone?: ReactNode;
  /** Ícone à direita (ex.: seta/chevron). */
  iconeDireita?: ReactNode;
  /** Largura total do contêiner. */
  bloqueia?: boolean;
}

export function Button({
  variante = "primary",
  tamanho = "md",
  icone = null,
  iconeDireita = null,
  bloqueia = false,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps): ReactElement {
  const classes = [
    "sasi-btn",
    `sasi-btn--${variante}`,
    `sasi-btn--${tamanho}`,
    bloqueia ? "sasi-btn--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {icone}
      {children}
      {iconeDireita}
    </button>
  );
}

export default Button;
