// ============================================================================
// SASI v2 — Sidebar (chassi de navegacao)
// Server Component: so estrutura. O estado de rota ativa vive no NavLink.
// Desktop  (>= 900px): trilho fixo a esquerda, chrome navy nos DOIS temas.
// Mobile   (<  900px): vira barra inferior (alvos >= 44px, safe-area iOS).
// ============================================================================
import type {ReactElement} from "react";
import {NavLink, type NavLinkProps} from "./NavLink";

/** Rotas do app. Fonte unica da navegacao — outras telas podem reusar. */
export const NAV_ITENS: readonly NavLinkProps[] = [
  {href: "/beds", label: "War Room", icone: "leitos", descricao: "Painel geral de leitos"},
  {
    href: "/patients",
    label: "Pacientes",
    icone: "pacientes",
    descricao: "Ficha e historico do paciente"
  },
  {href: "/rounds", label: "Round", icone: "round", descricao: "Round clinico do plantao"},
  {href: "/handoff", label: "Passagem", icone: "passagem", descricao: "Passagem de turno"},
] as const;

export function Sidebar(): ReactElement {
  return (
    <nav className="sasi-rail" aria-label="Navegação principal">
      <div className="sasi-rail__brand">
        <span className="sasi-rail__mark tabnum" aria-hidden="true">
          S2
        </span>
        <span className="sasi-rail__name">
          <b>SASI</b>
          <span>Comando UTI</span>
        </span>
      </div>

      <ul className="sasi-rail__list">
        {NAV_ITENS.map((item) => (
          <li key={item.href} className="sasi-rail__item">
            <NavLink {...item} />
          </li>
        ))}
      </ul>

      <div className="sasi-rail__foot">UTI2 · UTI3 · UTI4</div>
    </nav>
  );
}

export default Sidebar;
