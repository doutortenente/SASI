import React from 'react';
import { GravityBadge } from './GravityBadge.jsx';
import { SofaBadge } from './SofaBadge.jsx';
import { TherapyBadge } from './TherapyBadge.jsx';
import { ProblemRow } from './ProblemRow.jsx';

const CSS = `
.sasi-leito {
  position: relative; text-align: left; width: 100%; cursor: pointer;
  background: var(--surface-card); border: 1px solid var(--border-default);
  border-left-width: var(--gravity-bar); border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card); padding: 14px;
  display: flex; flex-direction: column; gap: 9px;
  transition: box-shadow var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out);
  font-family: var(--font-sans);
}
.sasi-leito:hover { box-shadow: var(--shadow-raised); transform: translateY(-1px); }
.sasi-leito:active { transform: translateY(0) scale(0.992); }
.sasi-leito--compact { padding: 11px; gap: 7px; }
.sasi-leito__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.sasi-leito__bed { display: flex; align-items: baseline; gap: 7px; }
.sasi-leito__bed .lbl { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--text-faint); }
.sasi-leito__bed .num { font-family: var(--font-mono); font-weight: 700; font-size: var(--text-xl); color: var(--text-heading); font-variant-numeric: tabular-nums; line-height: 1; }
.sasi-leito__bed .uti { font-family: var(--font-mono); font-size: 9px; color: var(--text-faint); }
.sasi-leito__name { font-size: var(--text-sm); font-weight: 700; color: var(--text-heading); line-height: var(--leading-tight); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sasi-leito__name small { font-weight: 500; color: var(--text-muted); }
.sasi-leito__hero { background: var(--surface-raised); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 8px 10px; }
.sasi-leito__sepsis {
  display: flex; align-items: center; justify-content: center; gap: 5px;
  background: var(--badge-sepsis-bg); color: #fff; font-size: 9px; font-weight: 800;
  text-transform: uppercase; letter-spacing: .06em; padding: 5px; border-radius: var(--radius-sm);
}
.sasi-leito__sepsis svg { width: 12px; height: 12px; }
.sasi-leito__strip { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding-top: 8px; border-top: 1px solid var(--border-subtle); }
.sasi-leito__strip--push { margin-left: auto; }
`;

if (typeof document !== 'undefined' && !document.getElementById('sasi-leito-css')) {
  const s = document.createElement('style');
  s.id = 'sasi-leito-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

const GRAV_SOLID = {
  stable: 'var(--grav-stable-solid)', watcher: 'var(--grav-watcher-solid)',
  unstable: 'var(--grav-unstable-solid)', critical: 'var(--grav-critical-solid)',
  deceased: 'var(--grav-deceased-solid)',
};

/**
 * Leito (bed) card — the dashboard's atomic unit. Composes GravityBadge,
 * SofaBadge, the hero ProblemRow, and TherapyBadge pills. Critical / septic
 * patients get the attention pulse.
 */
export function LeitoCard({
  bed, uti, name, age,
  gravity = 'stable', sofa = null, deltaSofa = null,
  problems = [], septic = false,
  dva = 0, sed = 0, vm = false, vni = false, atb = false, pend = 0,
  compact = false, onClick, className = '', style = {}, ...props
}) {
  const main = problems[0];
  const others = problems.slice(1, compact ? 2 : 3);
  const pulse = septic || gravity === 'critical';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`sasi-leito sasi-fade-in ${compact ? 'sasi-leito--compact' : ''} ${pulse ? 'sasi-critical-pulse' : ''} ${className}`}
      style={{ borderLeftColor: GRAV_SOLID[gravity], background: `color-mix(in srgb, ${GRAV_SOLID[gravity]} 5%, var(--surface-card))`, ...style }}
      {...props}
    >
      <div className="sasi-leito__top">
        <div className="sasi-leito__bed">
          <span className="lbl">Leito</span>
          <span className="num">{bed}</span>
          {uti && <span className="uti">{uti}</span>}
        </div>
        <SofaBadge score={sofa} delta={deltaSofa} />
      </div>

      <div className="sasi-leito__name">{name || 'Não identificado'}{age != null && <small>, {age}</small>}</div>

      {main && (
        <div className="sasi-leito__hero">
          <ProblemRow hero text={main.text} vetor={main.vetor} />
        </div>
      )}

      {others.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {others.map((p, i) => <ProblemRow key={i} text={p.text} vetor={p.vetor} />)}
        </div>
      )}

      {septic && !compact && (
        <div className="sasi-leito__sepsis"><i data-lucide="flame"></i> Alerta Sepse-3</div>
      )}

      <div className="sasi-leito__strip">
        <GravityBadge level={gravity} size="sm" />
        {dva > 0 && <TherapyBadge type="dva" count={dva} />}
        {sed > 0 && <TherapyBadge type="sed" count={sed} />}
        {vm && <TherapyBadge type="vm" />}
        {vni && <TherapyBadge type="vni" />}
        {atb && <TherapyBadge type="atb" />}
        {pend > 0 && <TherapyBadge type="pend" count={pend} className="sasi-leito__strip--push" />}
      </div>
    </button>
  );
}
