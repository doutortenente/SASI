"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Icone } from "./Icone";

const TELAS = [
  ["/cards", "Cards", "cards"], ["/round", "Round", "round"], ["/tabela", "Tabela", "tabela"],
  ["/passagem", "Passagem", "passagem"], ["/exames", "Exames", "exames"], ["/evolucao", "Evolução", "evolucao"],
] as const;
const COM_LEITO = ["/round", "/exames", "/evolucao"];

/** Menu lateral do design: as seis telas, na ordem. O leito aberto acompanha a troca de tela. */
export function Menu() {
  const caminho = usePathname();
  const leito = useSearchParams().get("leito");
  return (
    <aside className="ds-menu">
      <div className="ds-marca"><b>Comando UTI</b><small>UTI 2 · 13 leitos</small></div>
      <nav className="ds-nav" aria-label="Telas">
        {TELAS.map(([href, nome, ic]) => (
          <Link key={href} href={leito && COM_LEITO.includes(href) ? `${href}?leito=${leito}` : href} aria-current={caminho.startsWith(href) ? "page" : undefined}>
            <Icone n={ic} /><span>{nome}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
