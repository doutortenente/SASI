// ============================================================================
// SASI · ThemeToggle — alterna Tático (escuro/vermelho) ⇄ Clínico (claro/azul)
// ============================================================================
import { Moon, Stethoscope } from 'lucide-react';
import { useUI } from '../lib/theme';

const ICONS = {
  tactical: Moon,
  clinical: Stethoscope,
} as const;

const LABELS = {
  tactical: 'Tema tático (clique pra Clínico)',
  clinical: 'Tema clínico (clique pra Tático)',
} as const;

export default function ThemeToggle() {
  const { theme, toggleTheme } = useUI();
  const Icon = ICONS[theme];
  return (
    <button
      onClick={toggleTheme}
      title={LABELS[theme]}
      aria-label={LABELS[theme]}
      className="p-2 rounded-lg border border-app-border bg-app-card text-app-text-muted hover:bg-app-tertiary hover:text-app-text transition"
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
