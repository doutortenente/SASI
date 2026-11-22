"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Icone } from "./Icone";
import { Seg } from "./controles";

const TELAS = [
  ["/cards", "Cards", "cards"], ["/round", "Round", "round"], ["/tabela", "Tabela", "tabela"],
  ["/passagem", "Passagem", "passagem"], ["/exames", "Exames", "exames"], ["/evolucao", "Evolução", "evolucao"],
] as const;
const COM_LEITO = ["/round", "/exames", "/evolucao"];

const TEMAS = ["Claro", "Escuro"] as const;
const temaAtual = () => (document.documentElement.dataset.theme === "escuro" ? "Escuro" : "Claro");
const assinar = (f: () => void) => { const o = new MutationObserver(f); o.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] }); return () => o.disconnect(); };

/** Escolha Claro | Escuro: a marcada é sempre a do tema aplicado na página; a escolha fica guardada no aparelho. */
function Tema() {
  const atual = useSyncExternalStore(assinar, temaAtual, () => "Claro");
  const escolher = (v: string | null) => {
    if (v !== "Claro" && v !== "Escuro") return;
    document.documentElement.dataset.theme = v === "Escuro" ? "escuro" : "claro";
    try { localStorage.setItem("tema", v === "Escuro" ? "escuro" : "claro"); } catch { /* armazenamento bloqueado: vale só nesta abertura */ }
  };
  return <div className="ds-tema"><Seg setas r="Tema" ops={TEMAS} v={atual} on={escolher} /></div>;
}

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
      <Tema />
    </aside>
  );
}
