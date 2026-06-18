import React from 'react';

const CSS = `
.sasi-vital {
  display: inline-flex; flex-direction: column; align-items: center; gap: 1px;
  padding: 6px 11px; border-radius: var(--radius-md); min-width: 52px;
  background: var(--surface-raised);
}
.sasi-vital__lbl { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; opacity: .75; }
.sasi-vital__val { font-family: var(--font-mono); font-weight: 700; font-size: var(--text-md); font-variant-numeric: tabular-nums; line-height: 1.1; }
.sasi-vital__unit { font-size: 0.6em; font-weight: 500; opacity: .7; }
.sasi-vital--high { background: color-mix(in srgb, var(--danger) 12%, var(--surface-card)); color: var(--grav-critical-solid); }
.sasi-vital--low  { background: color-mix(in srgb, var(--sys-resp-bar) 12%, var(--surface-card)); color: var(--sys-resp); }
.sasi-vital--ok   { color: var(--text-body); }
.sasi-vital--pos  { background: color-mix(in srgb, var(--warning) 12%, var(--surface-card)); color: var(--grav-watcher-text); }
.sasi-vital--neg  { background: color-mix(in srgb, var(--sys-resp-bar) 12%, var(--surface-card)); color: var(--sys-resp); }
`;

if (typeof document !== 'undefined' && !document.getElementById('sasi-vital-css')) {
  const s = document.createElement('style');
  s.id = 'sasi-vital-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Vital-sign readout tile (PAM, FC, SpO₂, TAX, FR, BH). `status` drives the
 * alert color: high=red, low=blue, pos/neg for balanço hídrico, ok=neutral.
 */
export function VitalStat({ label, value, unit = '', status = 'ok', className = '', ...props }) {
  const display = value == null || value === '' ? '—' : value;
  return (
    <div className={`sasi-vital sasi-vital--${status} ${className}`} {...props}>
      <span className="sasi-vital__lbl">{label}</span>
      <span className="sasi-vital__val">
        {display}{display !== '—' && unit && <span className="sasi-vital__unit">{unit}</span>}
      </span>
    </div>
  );
}
