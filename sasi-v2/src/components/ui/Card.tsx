// ============================================================================
// SASI v2 — Card (primitiva de superfície)
// Cabeçalho opcional (eyebrow + título + número + ação). `gravidade` pinta a
// barra de acento à esquerda pela escala de gravidade — cor nunca é o único
// sinal, o rótulo vem junto no conteúdo do card.
// ============================================================================
import type {CSSProperties, ReactElement, ReactNode} from "react";
import type {Gravity} from "@/features/war-room/triage";

/** Cor sólida da escala de gravidade (tokens de tema, válidos nos 2 temas). */
const SOLIDO_GRAVIDADE: Record<Gravity, string> = {
  stable: "var(--grav-stable-solid)",
  watcher: "var(--grav-watcher-solid)",
  unstable: "var(--grav-unstable-solid)",
  critical: "var(--grav-critical-solid)",
  deceased: "var(--grav-deceased-solid)",
};

export interface CardProps {
  children?: ReactNode;
  /** Rótulo pequeno acima do título (padrão eyebrow). */
  eyebrow?: string;
  /** Título do card. */
  titulo?: ReactNode;
  /** Número do fluxo de trabalho (badge numerado à esquerda do título). */
  numero?: number;
  /** Ação no canto direito do cabeçalho (botão, seletor…). */
  acao?: ReactNode;
  /** Barra de gravidade à esquerda. */
  gravidade?: Gravity;
  /** Preenchimento interno padrão. Padrão: true. */
  preenchido?: boolean;
  /** Hover elevado + cursor de ponteiro (cards clicáveis). */
  interativo?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Card({
  children,
  eyebrow,
  titulo,
  numero,
  acao,
  gravidade,
  preenchido = true,
  interativo = false,
  className = "",
  style,
}: CardProps): ReactElement {
  const classes = [
    "sasi-card",
    preenchido ? "sasi-card--pad" : "",
    interativo ? "sasi-card--interactive" : "",
    gravidade ? "sasi-card__grav" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const styleGravidade: CSSProperties = gravidade ? {borderLeftColor: SOLIDO_GRAVIDADE[gravidade]} : {};
  const temCabecalho = Boolean(titulo || eyebrow || acao || numero != null);

  return (
    <div className={classes} style={{...styleGravidade, ...style}}>
      {temCabecalho && (
        <div className="sasi-card__head">
          <div style={{display: "flex", gap: "10px", alignItems: "center", minWidth: 0}}>
            {numero != null && <span className="sasi-card__num-badge">{numero}</span>}
            <div style={{minWidth: 0}}>
              {eyebrow && <div className="sasi-card__eyebrow">{eyebrow}</div>}
              {titulo && <div className="sasi-card__title">{titulo}</div>}
            </div>
          </div>
          {acao && <div style={{flexShrink: 0}}>{acao}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export default Card;
