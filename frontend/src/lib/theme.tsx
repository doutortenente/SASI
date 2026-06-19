// ============================================================================
// SASI · theme.tsx
// Estado global: 2 temas (Tactical default ⇄ Clinical) + 5 janelas de navegação.
// Persiste em localStorage. Aplica `body.theme-{tema}` pra CSS vars.
// Novo design (Jun 2026): consolidação dos antigos 3 modos em 2 co-iguais.
// ============================================================================
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/** Tactical = war-room escuro/vermelho (padrão) · Clinical = claro/azul (rounds). */
export type Theme = 'tactical' | 'clinical';

/** 3 view modes do Plantão Board (Cards / Round / Tabela) */
export type ViewMode = 'plantao' | 'round' | 'editor';

/** 5 janelas do redesign SASI (Jun 2026) */
export type Janela = 'leitos' | 'tempo' | 'estado' | 'problema' | 'passagem';

export const JANELAS: readonly { id: Janela; label: string; shortcut: string }[] = [
  { id: 'leitos', label: 'Leitos', shortcut: '1' },
  { id: 'tempo', label: 'Eixo Tempo', shortcut: '2' },
  { id: 'estado', label: 'Planilhão', shortcut: '3' },
  { id: 'problema', label: 'Ficha Evolução', shortcut: '4' },
  { id: 'passagem', label: 'Passagem', shortcut: '5' },
] as const;

const THEME_KEY = 'sasi.theme';
const JANELA_KEY = 'sasi.janela';
const VIEW_KEY = 'sasi.viewMode';

interface UIState {
  theme: Theme;
  viewMode: ViewMode;
  janela: Janela;
  /** Alterna Tactical ⇄ Clinical (com 2 temas, ciclar = alternar). */
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  setViewMode: (v: ViewMode) => void;
  setJanela: (j: Janela) => void;
}

const UIContext = createContext<UIState | null>(null);

function readStored<T extends string>(key: string, fallback: T, allowed: readonly T[]): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}

const VIEW_MODES: readonly ViewMode[] = ['plantao', 'round', 'editor'];
const JANELA_IDS: readonly Janela[] = ['leitos', 'tempo', 'estado', 'problema', 'passagem'];

/** Migra valores legados (3 modos) pro novo modelo de 2 temas. */
function readTheme(): Theme {
  if (typeof window === 'undefined') return 'tactical';
  try {
    const v = window.localStorage.getItem(THEME_KEY);
    if (v === 'clinical') return 'clinical';
    if (v === 'tactical') return 'tactical';
    // legado: 'dark' → tactical · 'light' → clinical
    if (v === 'light') return 'clinical';
    return 'tactical';
  } catch {
    return 'tactical';
  }
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readTheme);
  const [viewMode, setViewModeState] = useState<ViewMode>(() =>
    readStored<ViewMode>(VIEW_KEY, 'plantao', VIEW_MODES)
  );
  const [janela, setJanelaState] = useState<Janela>(() =>
    readStored<Janela>(JANELA_KEY, 'leitos', JANELA_IDS)
  );

  useEffect(() => {
    const body = document.body;
    body.classList.remove('theme-dark', 'theme-clinical', 'theme-light', 'theme-tactical');
    body.classList.add(`theme-${theme}`);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'clinical' ? '#eef1f6' : '#0f172a');
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch { /* no-op */ }
  }, [theme]);

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_KEY, viewMode);
    } catch { /* no-op */ }
  }, [viewMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem(JANELA_KEY, janela);
    } catch { /* no-op */ }
  }, [janela]);

  const value = useMemo<UIState>(
    () => ({
      theme,
      viewMode,
      janela,
      setTheme: setThemeState,
      setViewMode: setViewModeState,
      setJanela: setJanelaState,
      toggleTheme: () => {
        setThemeState(theme === 'clinical' ? 'tactical' : 'clinical');
      },
    }),
    [theme, viewMode, janela]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIState {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}