// ============================================================================
// SASI v2 — uiStore (chassi da interface)
// Estado de INTERFACE apenas: tema visual, filtro de UTI e modo War Room.
// Nao guarda dado clinico (isso vem do banco, via Server Components).
//
// Uso em componentes client:
//   const uti = useUiStore((s) => s.uti);
//   const setUti = useUiStore((s) => s.setUti);
// ============================================================================
import {create} from "zustand";
import type {Uti} from "@/types/clinical";

/** Tema visual: "clinical" = claro (:root) · "tactical" = escuro (html[data-theme="tactical"]). */
export type Tema = "clinical" | "tactical";

/** Filtro de UTI da barra superior. "todas" = sem filtro. */
export type FiltroUti = "todas" | Uti;

/** Chave de persistencia do tema (localStorage). */
export const CHAVE_TEMA = "sasi.theme";

/** Opcoes do filtro de UTI, na ordem em que aparecem na TopBar. */
export const OPCOES_UTI: readonly FiltroUti[] = ["todas", "UTI2", "UTI3", "UTI4"] as const;

/** Rotulo pt-BR de cada opcao de filtro. */
export const ROTULO_UTI: Record<FiltroUti, string> = {
  todas: "Todas",
  UTI2: "UTI2",
  UTI3: "UTI3",
  UTI4: "UTI4",
};

// ---------------------------------------------------------------------------
// Efeitos de DOM / persistencia (no-op no servidor)
// ---------------------------------------------------------------------------
function aplicarNoDom(tema: Tema): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = tema === "tactical" ? "tactical" : "";
}

function persistir(tema: Tema): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE_TEMA, tema);
  } catch {
    /* modo privado / storage bloqueado: tema segue valido na sessao */
  }
}

function lerPersistido(): Tema {
  if (typeof window === "undefined") return "clinical";
  try {
    return window.localStorage.getItem(CHAVE_TEMA) === "tactical" ? "tactical" : "clinical";
  } catch {
    return "clinical";
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export interface UiState {
  /** Tema aplicado. Padrao "clinical" (mesmo default do script inline no layout). */
  tema: Tema;
  /** Filtro global de UTI (TopBar). Telas client leem daqui para filtrar listas. */
  uti: FiltroUti;
  /** Modo War Room: densidade maxima, so o essencial de cada leito. */
  warRoom: boolean;

  setTema: (tema: Tema) => void;
  alternarTema: () => void;
  /** Le o localStorage e reaplica no <html>. Chamar uma vez apos a montagem. */
  sincronizarTema: () => void;

  setUti: (uti: FiltroUti) => void;
  setWarRoom: (warRoom: boolean) => void;
  alternarWarRoom: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  tema: "clinical",
  uti: "todas",
  warRoom: false,

  setTema: (tema) => {
    aplicarNoDom(tema);
    persistir(tema);
    set({tema});
  },
  alternarTema: () => get().setTema(get().tema === "tactical" ? "clinical" : "tactical"),
  sincronizarTema: () => {
    const tema = lerPersistido();
    aplicarNoDom(tema);
    if (tema !== get().tema) set({tema});
  },

  setUti: (uti) => set({uti}),
  setWarRoom: (warRoom) => set({warRoom}),
  alternarWarRoom: () => set((s) => ({warRoom: !s.warRoom})),
}));

// ---------------------------------------------------------------------------
// Seletores prontos (evitam reimplementar o mesmo seletor em cada tela)
// ---------------------------------------------------------------------------
export const useTema = (): Tema => useUiStore((s) => s.tema);
export const useFiltroUti = (): FiltroUti => useUiStore((s) => s.uti);
export const useWarRoom = (): boolean => useUiStore((s) => s.warRoom);

/**
 * Predicado puro para aplicar o filtro de UTI em qualquer linha que tenha `uti`.
 * Ex.: leitos.filter((l) => passaFiltroUti(filtro, l.uti))
 */
export const passaFiltroUti = (filtro: FiltroUti, uti: string | null | undefined): boolean =>
  filtro === "todas" || uti === filtro;
