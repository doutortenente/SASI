import React from 'react';

const CSS = `
.sasi-stat {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--font-sans); font-size: var(--text-xs); color: var(--text-muted);
}
.sasi-stat--btn { background: none; border: none; cursor: pointer; padding: 2px 4px; border-radius: var(--radius-sm); transition: background var(--dur-fast) var(--ease-out); }
.sasi-stat--btn:hover { background: var(--surface-raised); }
.sasi-stat--active { color: var(--accent-text); text-decoration: underline; text-underline-offset: 2px; }
.sasi-stat__num { font-family: var(--font-mono); font-weight: 700; font-variant-numeric: tabular-nums; color: var(--text-heading); }
.sasi-stat__num--tone { color: inherit; }
.sasi-stat svg { width: 14px; height: 14px; }
.sasi-stat__delta { font-family: var(--font-mono); font-weight: 700; font-size: var(--text-2xs); }
`;

if (typeof document !== 'undefined' && !document.getElementById('sasi-stat-css')) {
  const s = document.createElement('style');
  s.id = 'sasi-stat-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

const TONE = {
  default: 'var(--text-muted)',
  critical: 'var(--grav-critical-solid)',
  unstable: 'var(--grav-unstable-solid)',
  watcher: 'var(--grav-watcher-solid)',
  stable: 'var(--success)',
  accent: 'var(--accent-text)',
};

/**
 * Inline header stat — a number with a trailing label and optional Δ.
 * Clickable variant doubles as a smart-filter toggle ("4 críticos").
 */
export function StatPill({
  value,
  label,
  tone = 'default',
  icon = null,
  delta = null,
  active = false,
  onClick,
  className = '',
  ...props
}) {
  const isBtn = typeof onClick === 'function';
  const Tag = isBtn ? 'button' : 'span';
  const color = TONE[tone] || TONE.default;
  const deltaColor = delta != null ? (delta > 0 ? 'var(--grav-critical-solid)' : delta < 0 ? 'var(--success)' : 'var(--text-muted)') : undefined;

  return (
    <Tag
      className={[
        'sasi-stat',
        isBtn ? 'sasi-stat--btn' : '',
        active ? 'sasi-stat--active' : '',
        className,
      ].filter(Boolean).join(' ')}
      onClick={onClick}
      style={tone !== 'default' ? { color } : undefined}
      {...props}
    >
      {icon}
      <span className="sasi-stat__num" style={tone !== 'default' ? { color } : undefined}>{value}</span>
      {label && <span>{label}</span>}
      {delta != null && delta !== 0 && (
        <span className="sasi-stat__delta" style={{ color: deltaColor }}>
          {delta > 0 ? '↑+' : '↓'}{delta}
        </span>
      )}
    </Tag>
  );
}
