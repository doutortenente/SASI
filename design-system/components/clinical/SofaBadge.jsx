import React from 'react';

const CSS = `
.sasi-sofa {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: var(--font-sans); font-weight: 700; line-height: 1;
  border-radius: var(--radius-sm); padding: 4px 8px; white-space: nowrap;
  background: var(--surface-raised);
}
.sasi-sofa--hi { background: color-mix(in srgb, var(--sofa-high) 14%, var(--surface-card)); }
.sasi-sofa svg { width: 11px; height: 11px; opacity: .8; }
.sasi-sofa__lbl { font-size: 9px; text-transform: uppercase; letter-spacing: .06em; color: var(--text-muted); }
.sasi-sofa__val { font-family: var(--font-mono); font-size: var(--text-sm); font-variant-numeric: tabular-nums; }
.sasi-sofa__delta { font-family: var(--font-mono); font-size: var(--text-2xs); font-weight: 700; }
`;

if (typeof document !== 'undefined' && !document.getElementById('sasi-sofa-css')) {
  const s = document.createElement('style');
  s.id = 'sasi-sofa-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function sofaColor(score) {
  if (score == null) return 'var(--text-muted)';
  if (score >= 11) return 'var(--sofa-critical)';
  if (score >= 7) return 'var(--sofa-high)';
  if (score >= 3) return 'var(--sofa-medium)';
  return 'var(--sofa-low)';
}

/**
 * SOFA score chip with threshold coloring and optional Δ24h. Δ>0 (worsening)
 * is red, Δ<0 (improving) is emerald — the core Sepsis-3 signal.
 */
export function SofaBadge({ score = null, delta = null, showIcon = true, className = '', ...props }) {
  const hi = (score ?? 0) >= 7;
  const deltaColor = delta != null ? (delta > 0 ? 'var(--grav-critical-solid)' : delta < 0 ? 'var(--success)' : 'var(--text-muted)') : undefined;
  return (
    <span className={`sasi-sofa ${hi ? 'sasi-sofa--hi' : ''} ${className}`} title={`SOFA ${score ?? '—'}`} {...props}>
      {showIcon && <i data-lucide="activity"></i>}
      <span className="sasi-sofa__lbl">SOFA</span>
      <span className="sasi-sofa__val" style={{ color: sofaColor(score) }}>{score ?? '—'}</span>
      {delta != null && delta !== 0 && (
        <span className="sasi-sofa__delta" style={{ color: deltaColor }}>
          {delta > 0 ? '↑+' : '↓'}{delta}
        </span>
      )}
    </span>
  );
}
