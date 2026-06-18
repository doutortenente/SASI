import React from 'react';

const CSS = `
.sasi-sys {
  border-radius: var(--radius-md); border-left: 3px solid; padding: 9px 11px;
}
.sasi-sys__head {
  display: flex; align-items: center; gap: 6px; margin-bottom: 6px;
  font-size: var(--text-2xs); font-weight: 700; text-transform: uppercase; letter-spacing: var(--tracking-wide);
}
.sasi-sys__head svg { width: 13px; height: 13px; }
.sasi-sys__rows { display: flex; flex-direction: column; gap: 3px; }
.sasi-sys__row { display: flex; justify-content: space-between; gap: 10px; font-size: var(--text-xs); }
.sasi-sys__k { color: var(--text-muted); text-transform: capitalize; }
.sasi-sys__v { color: var(--text-body); font-weight: 600; font-variant-numeric: tabular-nums; text-align: right; }
`;

if (typeof document !== 'undefined' && !document.getElementById('sasi-sys-css')) {
  const s = document.createElement('style');
  s.id = 'sasi-sys-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

const SYS = {
  neuro:   { name: 'Neuro',   icon: 'brain' },
  resp:    { name: 'Resp',    icon: 'wind' },
  hemo:    { name: 'Hemo',    icon: 'zap' },
  tgi:     { name: 'TGI',     icon: 'thermometer' },
  renal:   { name: 'Renal',   icon: 'flask-conical' },
  hemato:  { name: 'Hemato',  icon: 'test-tubes' },
  infecto: { name: 'Infecto', icon: 'bug' },
};

/**
 * Organ-system summary panel — colored left-border + system glyph + a few
 * key/value rows. The building block of the Round preview and Avaliação por
 * Sistemas. Pass `rows` as [{ k, v }] or `data` as a flat object.
 */
export function SystemPanel({ system = 'neuro', rows = null, data = null, title, className = '', style = {}, children, ...props }) {
  const s = SYS[system] || SYS.neuro;
  const entries = rows
    ? rows
    : data
    ? Object.entries(data).filter(([, v]) => v != null && v !== '').map(([k, v]) => ({ k: k.replace(/_/g, ' '), v }))
    : [];

  return (
    <div
      className={`sasi-sys ${className}`}
      style={{ borderLeftColor: `var(--sys-${system}-bar)`, background: `var(--sys-${system}-bg)`, ...style }}
      {...props}
    >
      <div className="sasi-sys__head" style={{ color: `var(--sys-${system})` }}>
        <i data-lucide={s.icon}></i>
        {title || s.name}
      </div>
      {entries.length > 0 && (
        <div className="sasi-sys__rows">
          {entries.map(({ k, v }, i) => (
            <div className="sasi-sys__row" key={i}>
              <span className="sasi-sys__k">{k}</span>
              <span className="sasi-sys__v">{v}</span>
            </div>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}
