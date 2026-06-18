import React from 'react';

const CSS = `
.sasi-prob { display: flex; align-items: flex-start; gap: 9px; }
.sasi-prob__vec {
  flex-shrink: 0; font-family: var(--font-mono); font-weight: 800; line-height: 1;
  text-align: center; min-width: 16px;
}
.sasi-prob--hero .sasi-prob__vec { font-size: var(--text-2xl); }
.sasi-prob--row .sasi-prob__vec { font-size: var(--text-base); padding-top: 1px; }
.sasi-prob__body { min-width: 0; flex: 1; }
.sasi-prob__eyebrow { font-size: var(--text-2xs); font-weight: 700; text-transform: uppercase; letter-spacing: var(--tracking-eyebrow); color: var(--text-muted); margin-bottom: 1px; }
.sasi-prob__txt { color: var(--text-heading); font-weight: 600; line-height: var(--leading-snug); }
.sasi-prob--hero .sasi-prob__txt { font-size: var(--text-sm); }
.sasi-prob--row .sasi-prob__txt { font-size: var(--text-xs); font-weight: 500; color: var(--text-body); }
.sasi-prob__meta { font-size: 9px; color: var(--text-faint); margin-left: 6px; font-weight: 500; }
`;

if (typeof document !== 'undefined' && !document.getElementById('sasi-prob-css')) {
  const s = document.createElement('style');
  s.id = 'sasi-prob-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

const VEC_COLOR = {
  '↑': 'var(--grav-critical-solid)',   // piora
  '↓': 'var(--success)',               // melhora
  '=': 'var(--text-muted)',            // estável
};

/**
 * Active-problem line with a directional vetor (↑ worsening / ↓ improving /
 * = stable). `hero` renders the headline problem with a giant vetor; the
 * default `row` form is for the secondary list.
 */
export function ProblemRow({ text, vetor = null, system, hero = false, eyebrow, className = '', ...props }) {
  const color = vetor ? VEC_COLOR[vetor] : 'var(--text-faint)';
  return (
    <div className={`sasi-prob ${hero ? 'sasi-prob--hero' : 'sasi-prob--row'} ${className}`} {...props}>
      <span className="sasi-prob__vec" style={{ color }}>{vetor || '·'}</span>
      <div className="sasi-prob__body">
        {hero && <div className="sasi-prob__eyebrow">{eyebrow || 'Problema Ativo'}</div>}
        <div className="sasi-prob__txt">
          {text}
          {system && <span className="sasi-prob__meta">{system}</span>}
        </div>
      </div>
    </div>
  );
}
