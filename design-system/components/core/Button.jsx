import React from 'react';

const CSS = `
.sasi-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  font-family: var(--font-sans); font-weight: var(--weight-semibold);
  border: 1px solid transparent; border-radius: var(--radius-md);
  cursor: pointer; white-space: nowrap; text-decoration: none;
  transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out),
              color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out),
              box-shadow var(--dur-fast) var(--ease-out);
}
.sasi-btn:active { transform: translateY(0.5px) scale(0.99); }
.sasi-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
.sasi-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.sasi-btn svg { width: 1em; height: 1em; }

.sasi-btn--sm { font-size: var(--text-2xs); padding: 6px 11px; }
.sasi-btn--md { font-size: var(--text-sm); padding: 8px 15px; }
.sasi-btn--lg { font-size: var(--text-base); padding: 11px 20px; }

.sasi-btn--primary { background: var(--accent); color: var(--text-on-accent); }
.sasi-btn--primary:hover:not(:disabled) { background: var(--accent-hover); }

.sasi-btn--secondary { background: var(--surface-raised); color: var(--text-body); border-color: var(--border-default); }
.sasi-btn--secondary:hover:not(:disabled) { background: var(--surface-sunken); color: var(--text-heading); }

.sasi-btn--ghost { background: transparent; color: var(--text-muted); }
.sasi-btn--ghost:hover:not(:disabled) { background: var(--surface-raised); color: var(--text-heading); }

.sasi-btn--soft { background: var(--accent-soft); color: var(--accent-text); }
.sasi-btn--soft:hover:not(:disabled) { background: color-mix(in srgb, var(--accent) 18%, transparent); }

.sasi-btn--danger { background: var(--danger); color: #fff; }
.sasi-btn--danger:hover:not(:disabled) { filter: brightness(0.92); }

.sasi-btn--success { background: var(--success); color: #fff; }
.sasi-btn--success:hover:not(:disabled) { filter: brightness(0.94); }

.sasi-btn--block { width: 100%; }
`;

if (typeof document !== 'undefined' && !document.getElementById('sasi-button-css')) {
  const s = document.createElement('style');
  s.id = 'sasi-button-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * SASI command button. Primary (filled accent) drives the main action per
 * surface — "Exportar PDF", "Novo Leito", "Enviar link mágico".
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  iconRight = null,
  block = false,
  as = 'button',
  className = '',
  ...props
}) {
  const Tag = as;
  const cls = [
    'sasi-btn',
    `sasi-btn--${variant}`,
    `sasi-btn--${size}`,
    block ? 'sasi-btn--block' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag className={cls} {...props}>
      {icon}
      {children}
      {iconRight}
    </Tag>
  );
}
