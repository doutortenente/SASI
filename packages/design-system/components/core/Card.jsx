import React from 'react';

const CSS = `
.sasi-card {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  position: relative;
}
.sasi-card--pad { padding: var(--space-5); }
.sasi-card--interactive { cursor: pointer; transition: box-shadow var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out); }
.sasi-card--interactive:hover { box-shadow: var(--shadow-raised); transform: translateY(-1px); }
.sasi-card--interactive:active { transform: translateY(0) scale(0.995); }

.sasi-card__grav {
  border-left-width: var(--gravity-bar);
  border-left-style: solid;
}
.sasi-card__head {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: var(--space-3); margin-bottom: var(--space-3);
}
.sasi-card__title { font-size: var(--text-md); font-weight: var(--weight-semibold); color: var(--text-heading); line-height: var(--leading-tight); }
.sasi-card__eyebrow { font-size: var(--text-2xs); font-weight: 700; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--text-muted); }
.sasi-card__num-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: var(--radius-sm);
  background: var(--accent); color: #fff; font-weight: 700; font-size: var(--text-xs);
  font-family: var(--font-mono); flex-shrink: 0;
}
`;

if (typeof document !== 'undefined' && !document.getElementById('sasi-card-css')) {
  const s = document.createElement('style');
  s.id = 'sasi-card-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

const GRAV_SOLID = {
  stable: 'var(--grav-stable-solid)',
  watcher: 'var(--grav-watcher-solid)',
  unstable: 'var(--grav-unstable-solid)',
  critical: 'var(--grav-critical-solid)',
  deceased: 'var(--grav-deceased-solid)',
};

/**
 * Surface container. Optional numbered eyebrow (the 1–5 workflow panels) and
 * a gravity left-accent. Compose freely; `title`/`eyebrow`/`action` are
 * conveniences for the common panel header.
 */
export function Card({
  children,
  title,
  eyebrow,
  number,
  action,
  gravity,
  padded = true,
  interactive = false,
  className = '',
  style = {},
  ...props
}) {
  const cls = [
    'sasi-card',
    padded ? 'sasi-card--pad' : '',
    interactive ? 'sasi-card--interactive' : '',
    gravity ? 'sasi-card__grav' : '',
    className,
  ].filter(Boolean).join(' ');

  const gravStyle = gravity ? { borderLeftColor: GRAV_SOLID[gravity] } : {};
  const hasHead = title || eyebrow || action || number;

  return (
    <div className={cls} style={{ ...gravStyle, ...style }} {...props}>
      {hasHead && (
        <div className="sasi-card__head">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: 0 }}>
            {number != null && <span className="sasi-card__num-badge">{number}</span>}
            <div style={{ minWidth: 0 }}>
              {eyebrow && <div className="sasi-card__eyebrow">{eyebrow}</div>}
              {title && <div className="sasi-card__title">{title}</div>}
            </div>
          </div>
          {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
