"use client";
// ============================================================================
// SASI v2 — NavLink
// Item de navegacao do chassi. Marca a rota ativa com barra de acento a
// esquerda (na barra inferior mobile a barra vira acento superior).
// Cores sempre via tokens de chrome (--chrome-*), validos nos DOIS temas.
// ============================================================================
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";

/** Icones disponiveis (SVG inline — sem dependencia externa). */
export type NavIcone = "leitos" | "pacientes" | "round" | "passagem";

export interface NavLinkProps {
  /** Rota destino, ex.: "/beds". */
  href: string;
  /** Rotulo visivel (pt-BR). */
  label: string;
  /** Icone do item. */
  icone: NavIcone;
  /** Descricao curta — vira title/aria-label complementar. */
  descricao?: string;
}

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const ICONES: Record<NavIcone, ReactElement> = {
  // War Room — painel de leitos (grade)
  leitos: (
    <svg {...svgProps}>
      <rect x="3" y="3.5" width="7.5" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7.5" height="7" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7" rx="1.5" />
    </svg>
  ),
  // Pacientes — pessoa
  pacientes: (
    <svg {...svgProps}>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M4.6 19.6c1.6-3.1 4.2-4.7 7.4-4.7s5.8 1.6 7.4 4.7" />
    </svg>
  ),
  // Round — prancheta de evolucao
  round: (
    <svg {...svgProps}>
      <rect x="5" y="4.5" width="14" height="16.5" rx="2" />
      <path d="M9.5 4.5V3.6A1.6 1.6 0 0 1 11.1 2h1.8a1.6 1.6 0 0 1 1.6 1.6v.9" />
      <path d="M9 10h6M9 13.5h6M9 17h3.5" />
    </svg>
  ),
  // Passagem de turno — entrega para o proximo plantao
  passagem: (
    <svg {...svgProps}>
      <path d="M3.5 12h10.5" />
      <path d="M10.8 8.7 14.1 12l-3.3 3.3" />
      <path d="M15.5 4.2h3.3a2 2 0 0 1 2 2v11.6a2 2 0 0 1-2 2h-3.3" />
    </svg>
  ),
};

export function NavLink({ href, label, icone, descricao }: NavLinkProps): ReactElement {
  const pathname = usePathname() ?? "";
  const ativo = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className="sasi-navlink"
      aria-current={ativo ? "page" : undefined}
      title={descricao ?? label}
    >
      <span className="sasi-navlink__ico">{ICONES[icone]}</span>
      <span className="sasi-navlink__txt">{label}</span>
    </Link>
  );
}

export default NavLink;
