// ============================================================================
// SASI v2 — Input / Field (primitiva de formulário)
// Label uppercase + controle + hint. Estados: foco (accent + ring), inválido
// (borda danger), desabilitado. `icone` vira SVG líder posicionado no campo.
// ============================================================================
import {useId, cloneElement, isValidElement} from "react";
import type {InputHTMLAttributes, ReactElement, SVGProps, TextareaHTMLAttributes} from "react";

type ElementoIcone = ReactElement<SVGProps<SVGSVGElement>>;

type PropsComuns = {
  /** Rótulo do campo (uppercase via CSS). */
  label?: string;
  /** Texto de ajuda abaixo do campo. */
  hint?: string;
  /** SVG posicionado à esquerda dentro do campo. */
  icone?: ElementoIcone;
  /** Estado de erro (borda + ring em vermelho). */
  invalido?: boolean;
  className?: string;
};

export type InputProps = PropsComuns &
  (
    | (InputHTMLAttributes<HTMLInputElement> & {multiline?: false})
    | (TextareaHTMLAttributes<HTMLTextAreaElement> & {multiline: true})
  );

export function Input({label, hint, icone, invalido = false, className = "", ...props}: InputProps): ReactElement {
  const idGerado = useId();
  const multiline = "multiline" in props && props.multiline === true;

  const classes = ["sasi-input", icone ? "has-lead" : "", invalido ? "sasi-input--invalid" : "", className]
    .filter(Boolean)
    .join(" ");

  const controle: ReactElement = multiline ? (
    <textarea id={idGerado} className={classes} {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}/>
  ) : (
    <input id={idGerado} className={classes} {...(props as InputHTMLAttributes<HTMLInputElement>)}/>
  );

  const iconeLider = icone && isValidElement(icone) ? cloneElement(icone, {className: "lead"}) : null;

  return (
    <div className="sasi-field">
      {label && (
        <label className="sasi-field__label" htmlFor={idGerado}>
          {label}
        </label>
      )}
      {icone ? (
        <div className="sasi-input-wrap">
          {iconeLider}
          {controle}
        </div>
      ) : (
        controle
      )}
      {hint && <span className="sasi-field__hint">{hint}</span>}
    </div>
  );
}

export default Input;
