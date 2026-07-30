import React from 'react';

const CSS = `
.sasi-grav {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: var(--font-sans); font-weight: 700; line-height: 1;
  text-transform: uppercase; letter-spacing: var(--tracking-wide);
  border-radius: var(--radius-sm); border: 1px solid transparent; white-space: nowrap;
}
.sasi-grav svg { width: 1em; height: 1em; }
.sasi-grav--sm { font-size: 9px; padding: 3px 7px; }
.sasi-grav--md { font-size: var(--text-2xs); padding: 4px 9px; }
.sasi-grav--lg { font-size: var(--text-xs); padding: 5px 11px; }
.sasi-grav__dot { width: 7px; height: 7px; border-radius: 50%; }
`;

if (typeof document !== 'undefined' && !document.getElementById('sasi-grav-css')) {
  const s = document.createElement('style');
  s.id = 'sasi-grav-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

const MAP = {
  stable:   { label: 'Estável',  bg: 'var(--grav-stable-bg)',   text: 'var(--grav-stable-text)',   solid: 'var(--grav-stable-solid)' },
  watcher:  { label: 'Watcher',  bg: 'var(--grav-watcher-bg)',  text: 'var(--grav-watcher-text)',  solid: 'var(--grav-watcher-solid)' },
  unstable: { label: 'Instável', bg: 'var(--grav-unstable-bg)', text: 'var(--grav-unstable-text)', solid: 'var(--grav-unstable-solid)' },
  critical: { label: 'Crítico',  bg: 'var(--grav-critical-bg)', text: 'var(--grav-critical-text)', solid: 'var(--grav-critical-solid)' },
  deceased: { label: 'Óbito',    bg: 'var(--grav-deceased-bg)', text: 'var(--grav-deceased-text)', solid: 'var(--grav-deceased-solid)' },
};

/**
 * Patient-acuity badge. Five levels mirror the gravity color system used on
 * leito cards and the dashboard. Pass `dot` for the minimal dot+label form.
 */
export function GravityBadge({ level = 'stable', size = 'md', label, dot = false, className = '', style = {}, ...props }) {
  const g = MAP[level] || MAP.stable;
  return (
    <span
      className={`sasi-grav sasi-grav--${size} ${className}`}
      style={{ background: dot ? 'transparent' : g.bg, color: g.text, ...style }}
      {...props}
    >
      {dot && <span className="sasi-grav__dot" style={{ background: g.solid }} />}
      {label || g.label}
    </span>
  );
}
