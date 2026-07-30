"use client";
// ============================================================================
// SASI v2 — TopBar
// Titulo da tela (derivado da rota, com override opcional) + filtro de UTI
// (uiStore) + modo War Room (so no painel de leitos) + ThemeToggle.
// Telas client leem o filtro com useUiStore((s) => s.uti).
// ============================================================================
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { OPCOES_UTI, ROTULO_UTI, useUiStore } from "@/stores/uiStore";

/** Titulo de cada rota do chassi. Sub-rotas herdam pelo prefixo mais longo. */
const TITULOS: ReadonlyArray<{ href: string; titulo: string }> = [
  { href: "/beds", titulo: "War Room" },
  { href: "/patients", titulo: "Pacientes" },
  { href: "/rounds", titulo: "Round" },
  { href: "/handoff", titulo: "Passagem de turno" },
];

function tituloDaRota(pathname: string): string {
  let melhor = "";
  let titulo = "Comando UTI";
  for (const rota of TITULOS) {
    const casa = pathname === rota.href || pathname.startsWith(`${rota.href}/`);
    if (casa && rota.href.length > melhor.length) {
      melhor = rota.href;
      titulo = rota.titulo;
    }
  }
  return titulo;
}

export interface TopBarProps {
  /** Sobrescreve o titulo derivado da rota (opcional). */
  titulo?: string;
}

export function TopBar({ titulo }: TopBarProps = {}): ReactElement {
  const pathname = usePathname() ?? "";
  const uti = useUiStore((s) => s.uti);
  const setUti = useUiStore((s) => s.setUti);
  const warRoom = useUiStore((s) => s.warRoom);
  const alternarWarRoom = useUiStore((s) => s.alternarWarRoom);

  const mostraWarRoom = pathname === "/beds" || pathname.startsWith("/beds/");

  return (
    <header className="sasi-topbar">
      <div className="sasi-topbar__ttl">
        <span className="sasi-topbar__eyebrow">SASI · Comando UTI</span>
        <h1 className="sasi-topbar__h1">{titulo ?? tituloDaRota(pathname)}</h1>
      </div>

      <div className="sasi-topbar__acoes">
        <div className="sasi-seg" role="group" aria-label="Filtrar por UTI">
          {OPCOES_UTI.map((opcao) => (
            <button
              key={opcao}
              type="button"
              className="sasi-seg__b"
              aria-pressed={uti === opcao}
              onClick={() => setUti(opcao)}
            >
              {ROTULO_UTI[opcao]}
            </button>
          ))}
        </div>

        {mostraWarRoom ? (
          <button
            type="button"
            className="sasi-btn"
            aria-pressed={warRoom}
            onClick={alternarWarRoom}
            aria-label="Modo War Room"
            title="Modo War Room: densidade máxima, só o essencial"
          >
            <svg
              className="sasi-ico"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="8.2" />
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1.6v3.2M12 19.2v3.2M1.6 12h3.2M19.2 12h3.2" />
            </svg>
            <span className="sasi-btn__txt">War Room</span>
          </button>
        ) : null}

        <ThemeToggle />
      </div>
    </header>
  );
}

export default TopBar;
