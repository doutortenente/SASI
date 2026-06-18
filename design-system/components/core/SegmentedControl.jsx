import React from 'react';

const CSS = `
.sasi-seg {
  display: inline-flex; gap: 2px; padding: 3px;
  background: var(--surface-sunken); border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
}
.sasi-seg__btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-sans); font-size: var(--text-xs); font-weight: var(--weight-semibold);
  color: var(--text-muted); background: transparent; border: none; cursor: pointer;
  padding: 6px 12px; border-radius: var(--radius-sm);
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.sasi-seg__btn svg { width: 14px; height: 14px; }
.sasi-seg__btn:hover:not(.is-active) { color: var(--text-heading); background: color-mix(in srgb, var(--surface-card) 60%, transparent); }
.sasi-seg__btn.is-active { background: var(--accent); color: var(--text-on-accent); box-shadow: var(--shadow-card); }
`;

if (typeof document !== 'undefined' && !document.getElementById('sasi-seg-css')) {
  const s = document.createElement('style');
  s.id = 'sasi-seg-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Segmented control — the view switcher (Cards / Round / Tabela), UTI filter,
 * theme toggle. Each option: { value, label, icon? }.
 */
export function SegmentedControl({ options = [], value, onChange, className = '', ...props }) {
  return (
    <div className={`sasi-seg ${className}`} role="tablist" {...props}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={`sasi-seg__btn ${active ? 'is-active' : ''}`}
            onClick={() => onChange && onChange(opt.value)}
            title={opt.hint || opt.label}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
