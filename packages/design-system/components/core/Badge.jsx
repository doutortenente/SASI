import React from 'react';

const CSS = `
.sasi-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: var(--font-sans); font-weight: var(--weight-bold);
  text-transform: uppercase; letter-spacing: var(--tracking-wide);
  border-radius: var(--radius-sm); white-space: nowrap; line-height: 1;
  border: 1px solid transparent;
}
.sasi-badge svg { width: 1em; height: 1em; }
.sasi-badge--sm { font-size: 9px; padding: 3px 7px; }
.sasi-badge--md { font-size: var(--text-2xs); padding: 4px 9px; }

.sasi-badge--solid { color: #fff; }
.sasi-badge--outline { background: transparent; }
.sasi-badge--soft { }
`;

if (typeof document !== 'undefined' && !document.getElementById('sasi-badge-css')) {
  const s = document.createElement('style');
  s.id = 'sasi-badge-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

const TONE_VARS = {
  neutral:  { solid: 'var(--text-muted)', soft: 'var(--surface-raised)', text: 'var(--text-muted)', border: 'var(--border-default)' },
  accent:   { solid: 'var(--accent)', soft: 'var(--accent-soft)', text: 'var(--accent-text)', border: 'var(--accent)' },
  success:  { solid: 'var(--success)', soft: 'var(--grav-stable-bg)', text: 'var(--grav-stable-text)', border: 'var(--success)' },
  warning:  { solid: 'var(--warning)', soft: 'var(--grav-watcher-bg)', text: 'var(--grav-watcher-text)', border: 'var(--warning)' },
  danger:   { solid: 'var(--danger)', soft: 'var(--grav-critical-bg)', text: 'var(--grav-critical-text)', border: 'var(--danger)' },
};

/**
 * Generic status badge. For clinical acuity use <GravityBadge>; for therapy
 * pills use <TherapyBadge> — this is the neutral primitive behind them.
 */
export function Badge({
  children,
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  icon = null,
  className = '',
  style = {},
  ...props
}) {
  const t = TONE_VARS[tone] || TONE_VARS.neutral;
  let css = {};
  if (variant === 'solid') css = { background: t.solid, color: '#fff' };
  else if (variant === 'outline') css = { borderColor: t.border, color: t.text };
  else css = { background: t.soft, color: t.text };

  return (
    <span
      className={`sasi-badge sasi-badge--${size} sasi-badge--${variant} ${className}`}
      style={{ ...css, ...style }}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}
