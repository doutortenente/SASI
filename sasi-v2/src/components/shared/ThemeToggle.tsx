"use client";
import type {ReactElement} from "react";
// ============================================================================
// SASI v2 — ThemeToggle
// Alterna tema claro (clinical, :root) <-> escuro (tactical).
// Efeito: document.documentElement.dataset.theme = "tactical" | ""
// Persistencia: localStorage["sasi.theme"] (ver uiStore).
// O icone certo aparece por CSS (html[data-theme]) — nao pisca na hidratacao;
// o script inline do layout ja aplicou o tema antes da primeira pintura.
// ============================================================================
import {useEffect} from "react";
import {useUiStore} from "@/stores/uiStore";

export function ThemeToggle(): ReactElement {
  const tema = useUiStore((s) => s.tema);
  const alternarTema = useUiStore((s) => s.alternarTema);
  const sincronizarTema = useUiStore((s) => s.sincronizarTema);

  // Reaplica o tema persistido apos a montagem (mantem store e DOM em sincronia).
  useEffect(() => {
    sincronizarTema();
  }, [sincronizarTema]);

  return (
    <button
      type="button"
      className="sasi-btn"
      onClick={alternarTema}
      aria-pressed={tema === "tactical"}
      aria-label="Alternar tema: claro ou tactical"
      title="Alternar tema (claro / tactical)"
    >
      {/* sol — visivel no tema claro */}
      <svg
        className="sasi-ico sasi-ico--clinical"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4"/>
        <path
          d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7"/>
      </svg>
      {/* lua — visivel no tema tactical */}
      <svg
        className="sasi-ico sasi-ico--tactical"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.5 14.4A8.6 8.6 0 0 1 9.6 3.5a8.6 8.6 0 1 0 10.9 10.9Z"/>
      </svg>
      <span className="sasi-btn__txt">Tema</span>
    </button>
  );
}

export default ThemeToggle;
