/* @ds-bundle: {"format":3,"namespace":"SASIComandoUTIDesignSystem_157e25","components":[{"name":"GravityBadge","sourcePath":"components/clinical/GravityBadge.jsx"},{"name":"LeitoCard","sourcePath":"components/clinical/LeitoCard.jsx"},{"name":"ProblemRow","sourcePath":"components/clinical/ProblemRow.jsx"},{"name":"SofaBadge","sourcePath":"components/clinical/SofaBadge.jsx"},{"name":"SystemPanel","sourcePath":"components/clinical/SystemPanel.jsx"},{"name":"TherapyBadge","sourcePath":"components/clinical/TherapyBadge.jsx"},{"name":"VitalStat","sourcePath":"components/clinical/VitalStat.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"SegmentedControl","sourcePath":"components/core/SegmentedControl.jsx"},{"name":"StatPill","sourcePath":"components/core/StatPill.jsx"}],"sourceHashes":{"components/clinical/GravityBadge.jsx":"48864a329c4d","components/clinical/LeitoCard.jsx":"a2e36f89914a","components/clinical/ProblemRow.jsx":"79337eb6954c","components/clinical/SofaBadge.jsx":"487fce507271","components/clinical/SystemPanel.jsx":"79fe732c1fdc","components/clinical/TherapyBadge.jsx":"c32f038c8445","components/clinical/VitalStat.jsx":"88e81a9995b4","components/core/Badge.jsx":"8fed47fddf1d","components/core/Button.jsx":"0501ecf1a362","components/core/Card.jsx":"fd4cc913b5a4","components/core/Input.jsx":"8857e4ab0608","components/core/SegmentedControl.jsx":"3053a17e376b","components/core/StatPill.jsx":"93563f17f212","ui_kits/comando-uti/App.jsx":"89143cee3235","ui_kits/comando-uti/Chrome.jsx":"4816b1ce4c86","ui_kits/comando-uti/Handoff.jsx":"085466ea71fe","ui_kits/comando-uti/Login.jsx":"0866045b09e6","ui_kits/comando-uti/PatientDetail.jsx":"b7a7b89052af","ui_kits/comando-uti/Views.jsx":"3c46286d9349","ui_kits/comando-uti/data.jsx":"9cfe2dd08157"},"inlinedExternals":[],"unexposedExports":[{"name":"sofaColor","sourcePath":"components/clinical/SofaBadge.jsx"}]} */

(() => {

const __ds_ns = (window.SASIComandoUTIDesignSystem_157e25 = window.SASIComandoUTIDesignSystem_157e25 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/clinical/GravityBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  stable: {
    label: 'Estável',
    bg: 'var(--grav-stable-bg)',
    text: 'var(--grav-stable-text)',
    solid: 'var(--grav-stable-solid)'
  },
  watcher: {
    label: 'Watcher',
    bg: 'var(--grav-watcher-bg)',
    text: 'var(--grav-watcher-text)',
    solid: 'var(--grav-watcher-solid)'
  },
  unstable: {
    label: 'Instável',
    bg: 'var(--grav-unstable-bg)',
    text: 'var(--grav-unstable-text)',
    solid: 'var(--grav-unstable-solid)'
  },
  critical: {
    label: 'Crítico',
    bg: 'var(--grav-critical-bg)',
    text: 'var(--grav-critical-text)',
    solid: 'var(--grav-critical-solid)'
  },
  deceased: {
    label: 'Óbito',
    bg: 'var(--grav-deceased-bg)',
    text: 'var(--grav-deceased-text)',
    solid: 'var(--grav-deceased-solid)'
  }
};

/**
 * Patient-acuity badge. Five levels mirror the gravity color system used on
 * leito cards and the dashboard. Pass `dot` for the minimal dot+label form.
 */
function GravityBadge({
  level = 'stable',
  size = 'md',
  label,
  dot = false,
  className = '',
  style = {},
  ...props
}) {
  const g = MAP[level] || MAP.stable;
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `sasi-grav sasi-grav--${size} ${className}`,
    style: {
      background: dot ? 'transparent' : g.bg,
      color: g.text,
      ...style
    }
  }, props), dot && /*#__PURE__*/React.createElement("span", {
    className: "sasi-grav__dot",
    style: {
      background: g.solid
    }
  }), label || g.label);
}
Object.assign(__ds_scope, { GravityBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/clinical/GravityBadge.jsx", error: String((e && e.message) || e) }); }

// components/clinical/ProblemRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  '↑': 'var(--grav-critical-solid)',
  // piora
  '↓': 'var(--success)',
  // melhora
  '=': 'var(--text-muted)' // estável
};

/**
 * Active-problem line with a directional vetor (↑ worsening / ↓ improving /
 * = stable). `hero` renders the headline problem with a giant vetor; the
 * default `row` form is for the secondary list.
 */
function ProblemRow({
  text,
  vetor = null,
  system,
  hero = false,
  eyebrow,
  className = '',
  ...props
}) {
  const color = vetor ? VEC_COLOR[vetor] : 'var(--text-faint)';
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `sasi-prob ${hero ? 'sasi-prob--hero' : 'sasi-prob--row'} ${className}`
  }, props), /*#__PURE__*/React.createElement("span", {
    className: "sasi-prob__vec",
    style: {
      color
    }
  }, vetor || '·'), /*#__PURE__*/React.createElement("div", {
    className: "sasi-prob__body"
  }, hero && /*#__PURE__*/React.createElement("div", {
    className: "sasi-prob__eyebrow"
  }, eyebrow || 'Problema Ativo'), /*#__PURE__*/React.createElement("div", {
    className: "sasi-prob__txt"
  }, text, system && /*#__PURE__*/React.createElement("span", {
    className: "sasi-prob__meta"
  }, system))));
}
Object.assign(__ds_scope, { ProblemRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/clinical/ProblemRow.jsx", error: String((e && e.message) || e) }); }

// components/clinical/SofaBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function sofaColor(score) {
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
function SofaBadge({
  score = null,
  delta = null,
  showIcon = true,
  className = '',
  ...props
}) {
  const hi = (score ?? 0) >= 7;
  const deltaColor = delta != null ? delta > 0 ? 'var(--grav-critical-solid)' : delta < 0 ? 'var(--success)' : 'var(--text-muted)' : undefined;
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `sasi-sofa ${hi ? 'sasi-sofa--hi' : ''} ${className}`,
    title: `SOFA ${score ?? '—'}`
  }, props), showIcon && /*#__PURE__*/React.createElement("i", {
    "data-lucide": "activity"
  }), /*#__PURE__*/React.createElement("span", {
    className: "sasi-sofa__lbl"
  }, "SOFA"), /*#__PURE__*/React.createElement("span", {
    className: "sasi-sofa__val",
    style: {
      color: sofaColor(score)
    }
  }, score ?? '—'), delta != null && delta !== 0 && /*#__PURE__*/React.createElement("span", {
    className: "sasi-sofa__delta",
    style: {
      color: deltaColor
    }
  }, delta > 0 ? '↑+' : '↓', delta));
}
Object.assign(__ds_scope, { sofaColor, SofaBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/clinical/SofaBadge.jsx", error: String((e && e.message) || e) }); }

// components/clinical/SystemPanel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  neuro: {
    name: 'Neuro',
    icon: 'brain'
  },
  resp: {
    name: 'Resp',
    icon: 'wind'
  },
  hemo: {
    name: 'Hemo',
    icon: 'zap'
  },
  tgi: {
    name: 'TGI',
    icon: 'thermometer'
  },
  renal: {
    name: 'Renal',
    icon: 'flask-conical'
  },
  hemato: {
    name: 'Hemato',
    icon: 'test-tubes'
  },
  infecto: {
    name: 'Infecto',
    icon: 'bug'
  }
};

/**
 * Organ-system summary panel — colored left-border + system glyph + a few
 * key/value rows. The building block of the Round preview and Avaliação por
 * Sistemas. Pass `rows` as [{ k, v }] or `data` as a flat object.
 */
function SystemPanel({
  system = 'neuro',
  rows = null,
  data = null,
  title,
  className = '',
  style = {},
  children,
  ...props
}) {
  const s = SYS[system] || SYS.neuro;
  const entries = rows ? rows : data ? Object.entries(data).filter(([, v]) => v != null && v !== '').map(([k, v]) => ({
    k: k.replace(/_/g, ' '),
    v
  })) : [];
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `sasi-sys ${className}`,
    style: {
      borderLeftColor: `var(--sys-${system}-bar)`,
      background: `var(--sys-${system}-bg)`,
      ...style
    }
  }, props), /*#__PURE__*/React.createElement("div", {
    className: "sasi-sys__head",
    style: {
      color: `var(--sys-${system})`
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": s.icon
  }), title || s.name), entries.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "sasi-sys__rows"
  }, entries.map(({
    k,
    v
  }, i) => /*#__PURE__*/React.createElement("div", {
    className: "sasi-sys__row",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "sasi-sys__k"
  }, k), /*#__PURE__*/React.createElement("span", {
    className: "sasi-sys__v"
  }, v)))), children);
}
Object.assign(__ds_scope, { SystemPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/clinical/SystemPanel.jsx", error: String((e && e.message) || e) }); }

// components/clinical/TherapyBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.sasi-tx {
  display: inline-flex; align-items: center; gap: 4px;
  font-family: var(--font-sans); font-weight: 700; font-size: var(--text-2xs);
  line-height: 1; padding: 4px 8px; border-radius: var(--radius-sm); white-space: nowrap;
}
.sasi-tx svg { width: 12px; height: 12px; }
`;
if (typeof document !== 'undefined' && !document.getElementById('sasi-tx-css')) {
  const s = document.createElement('style');
  s.id = 'sasi-tx-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
const MAP = {
  dva: {
    label: 'DVA',
    icon: 'heart',
    bg: 'var(--badge-dva-bg)',
    text: 'var(--badge-dva-text)'
  },
  sed: {
    label: 'Sed',
    icon: 'droplets',
    bg: 'var(--badge-sed-bg)',
    text: 'var(--badge-sed-text)'
  },
  vm: {
    label: 'VM',
    icon: 'wind',
    bg: 'var(--badge-vm-bg)',
    text: 'var(--badge-vm-text)'
  },
  vni: {
    label: 'VNI',
    icon: 'wind',
    bg: 'var(--badge-vni-bg)',
    text: 'var(--badge-vni-text)'
  },
  atb: {
    label: 'ATB',
    icon: 'pill',
    bg: 'var(--badge-atb-bg)',
    text: 'var(--badge-atb-text)'
  },
  pend: {
    label: 'Pend',
    icon: 'alert-triangle',
    bg: 'var(--badge-pend-bg)',
    text: 'var(--badge-pend-text)'
  },
  sepsis: {
    label: 'Sepse-3',
    icon: 'flame',
    bg: 'var(--badge-sepsis-bg)',
    text: 'var(--badge-sepsis-text)'
  }
};

/**
 * Therapy / device pill — drogas vasoativas, sedação, ventilação, ATB,
 * pendências, Sepse-3 alert. Optional count appends to the label (DVA 2).
 */
function TherapyBadge({
  type = 'dva',
  count = null,
  label,
  showIcon = true,
  pulse = false,
  className = '',
  style = {},
  ...props
}) {
  const t = MAP[type] || MAP.dva;
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `sasi-tx ${pulse ? 'sasi-critical-pulse' : ''} ${className}`,
    style: {
      background: t.bg,
      color: t.text,
      ...style
    },
    title: t.label
  }, props), showIcon && /*#__PURE__*/React.createElement("i", {
    "data-lucide": t.icon
  }), label || t.label, count != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontVariantNumeric: 'tabular-nums'
    }
  }, count));
}
Object.assign(__ds_scope, { TherapyBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/clinical/TherapyBadge.jsx", error: String((e && e.message) || e) }); }

// components/clinical/LeitoCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  stable: 'var(--grav-stable-solid)',
  watcher: 'var(--grav-watcher-solid)',
  unstable: 'var(--grav-unstable-solid)',
  critical: 'var(--grav-critical-solid)',
  deceased: 'var(--grav-deceased-solid)'
};

/**
 * Leito (bed) card — the dashboard's atomic unit. Composes GravityBadge,
 * SofaBadge, the hero ProblemRow, and TherapyBadge pills. Critical / septic
 * patients get the attention pulse.
 */
function LeitoCard({
  bed,
  uti,
  name,
  age,
  gravity = 'stable',
  sofa = null,
  deltaSofa = null,
  problems = [],
  septic = false,
  dva = 0,
  sed = 0,
  vm = false,
  vni = false,
  atb = false,
  pend = 0,
  compact = false,
  onClick,
  className = '',
  style = {},
  ...props
}) {
  const main = problems[0];
  const others = problems.slice(1, compact ? 2 : 3);
  const pulse = septic || gravity === 'critical';
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    className: `sasi-leito sasi-fade-in ${compact ? 'sasi-leito--compact' : ''} ${pulse ? 'sasi-critical-pulse' : ''} ${className}`,
    style: {
      borderLeftColor: GRAV_SOLID[gravity],
      background: `color-mix(in srgb, ${GRAV_SOLID[gravity]} 5%, var(--surface-card))`,
      ...style
    }
  }, props), /*#__PURE__*/React.createElement("div", {
    className: "sasi-leito__top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sasi-leito__bed"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Leito"), /*#__PURE__*/React.createElement("span", {
    className: "num"
  }, bed), uti && /*#__PURE__*/React.createElement("span", {
    className: "uti"
  }, uti)), /*#__PURE__*/React.createElement(__ds_scope.SofaBadge, {
    score: sofa,
    delta: deltaSofa
  })), /*#__PURE__*/React.createElement("div", {
    className: "sasi-leito__name"
  }, name || 'Não identificado', age != null && /*#__PURE__*/React.createElement("small", null, ", ", age)), main && /*#__PURE__*/React.createElement("div", {
    className: "sasi-leito__hero"
  }, /*#__PURE__*/React.createElement(__ds_scope.ProblemRow, {
    hero: true,
    text: main.text,
    vetor: main.vetor
  })), others.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '3px'
    }
  }, others.map((p, i) => /*#__PURE__*/React.createElement(__ds_scope.ProblemRow, {
    key: i,
    text: p.text,
    vetor: p.vetor
  }))), septic && !compact && /*#__PURE__*/React.createElement("div", {
    className: "sasi-leito__sepsis"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "flame"
  }), " Alerta Sepse-3"), /*#__PURE__*/React.createElement("div", {
    className: "sasi-leito__strip"
  }, /*#__PURE__*/React.createElement(__ds_scope.GravityBadge, {
    level: gravity,
    size: "sm"
  }), dva > 0 && /*#__PURE__*/React.createElement(__ds_scope.TherapyBadge, {
    type: "dva",
    count: dva
  }), sed > 0 && /*#__PURE__*/React.createElement(__ds_scope.TherapyBadge, {
    type: "sed",
    count: sed
  }), vm && /*#__PURE__*/React.createElement(__ds_scope.TherapyBadge, {
    type: "vm"
  }), vni && /*#__PURE__*/React.createElement(__ds_scope.TherapyBadge, {
    type: "vni"
  }), atb && /*#__PURE__*/React.createElement(__ds_scope.TherapyBadge, {
    type: "atb"
  }), pend > 0 && /*#__PURE__*/React.createElement(__ds_scope.TherapyBadge, {
    type: "pend",
    count: pend,
    className: "sasi-leito__strip--push"
  })));
}
Object.assign(__ds_scope, { LeitoCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/clinical/LeitoCard.jsx", error: String((e && e.message) || e) }); }

// components/clinical/VitalStat.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function VitalStat({
  label,
  value,
  unit = '',
  status = 'ok',
  className = '',
  ...props
}) {
  const display = value == null || value === '' ? '—' : value;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `sasi-vital sasi-vital--${status} ${className}`
  }, props), /*#__PURE__*/React.createElement("span", {
    className: "sasi-vital__lbl"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "sasi-vital__val"
  }, display, display !== '—' && unit && /*#__PURE__*/React.createElement("span", {
    className: "sasi-vital__unit"
  }, unit)));
}
Object.assign(__ds_scope, { VitalStat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/clinical/VitalStat.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  neutral: {
    solid: 'var(--text-muted)',
    soft: 'var(--surface-raised)',
    text: 'var(--text-muted)',
    border: 'var(--border-default)'
  },
  accent: {
    solid: 'var(--accent)',
    soft: 'var(--accent-soft)',
    text: 'var(--accent-text)',
    border: 'var(--accent)'
  },
  success: {
    solid: 'var(--success)',
    soft: 'var(--grav-stable-bg)',
    text: 'var(--grav-stable-text)',
    border: 'var(--success)'
  },
  warning: {
    solid: 'var(--warning)',
    soft: 'var(--grav-watcher-bg)',
    text: 'var(--grav-watcher-text)',
    border: 'var(--warning)'
  },
  danger: {
    solid: 'var(--danger)',
    soft: 'var(--grav-critical-bg)',
    text: 'var(--grav-critical-text)',
    border: 'var(--danger)'
  }
};

/**
 * Generic status badge. For clinical acuity use <GravityBadge>; for therapy
 * pills use <TherapyBadge> — this is the neutral primitive behind them.
 */
function Badge({
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
  if (variant === 'solid') css = {
    background: t.solid,
    color: '#fff'
  };else if (variant === 'outline') css = {
    borderColor: t.border,
    color: t.text
  };else css = {
    background: t.soft,
    color: t.text
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `sasi-badge sasi-badge--${size} sasi-badge--${variant} ${className}`,
    style: {
      ...css,
      ...style
    }
  }, props), icon, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.sasi-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  font-family: var(--font-sans); font-weight: var(--weight-semibold);
  border: 1px solid transparent; border-radius: var(--radius-md);
  cursor: pointer; white-space: nowrap; text-decoration: none;
  transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out),
              color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out),
              box-shadow var(--dur-fast) var(--ease-out);
}
.sasi-btn:active { transform: translateY(0.5px) scale(0.99); }
.sasi-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
.sasi-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.sasi-btn svg { width: 1em; height: 1em; }

.sasi-btn--sm { font-size: var(--text-2xs); padding: 6px 11px; }
.sasi-btn--md { font-size: var(--text-sm); padding: 8px 15px; }
.sasi-btn--lg { font-size: var(--text-base); padding: 11px 20px; }

.sasi-btn--primary { background: var(--accent); color: var(--text-on-accent); }
.sasi-btn--primary:hover:not(:disabled) { background: var(--accent-hover); }

.sasi-btn--secondary { background: var(--surface-raised); color: var(--text-body); border-color: var(--border-default); }
.sasi-btn--secondary:hover:not(:disabled) { background: var(--surface-sunken); color: var(--text-heading); }

.sasi-btn--ghost { background: transparent; color: var(--text-muted); }
.sasi-btn--ghost:hover:not(:disabled) { background: var(--surface-raised); color: var(--text-heading); }

.sasi-btn--soft { background: var(--accent-soft); color: var(--accent-text); }
.sasi-btn--soft:hover:not(:disabled) { background: color-mix(in srgb, var(--accent) 18%, transparent); }

.sasi-btn--danger { background: var(--danger); color: #fff; }
.sasi-btn--danger:hover:not(:disabled) { filter: brightness(0.92); }

.sasi-btn--success { background: var(--success); color: #fff; }
.sasi-btn--success:hover:not(:disabled) { filter: brightness(0.94); }

.sasi-btn--block { width: 100%; }
`;
if (typeof document !== 'undefined' && !document.getElementById('sasi-button-css')) {
  const s = document.createElement('style');
  s.id = 'sasi-button-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * SASI command button. Primary (filled accent) drives the main action per
 * surface — "Exportar PDF", "Novo Leito", "Enviar link mágico".
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  iconRight = null,
  block = false,
  as = 'button',
  className = '',
  ...props
}) {
  const Tag = as;
  const cls = ['sasi-btn', `sasi-btn--${variant}`, `sasi-btn--${size}`, block ? 'sasi-btn--block' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls
  }, props), icon, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  deceased: 'var(--grav-deceased-solid)'
};

/**
 * Surface container. Optional numbered eyebrow (the 1–5 workflow panels) and
 * a gravity left-accent. Compose freely; `title`/`eyebrow`/`action` are
 * conveniences for the common panel header.
 */
function Card({
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
  const cls = ['sasi-card', padded ? 'sasi-card--pad' : '', interactive ? 'sasi-card--interactive' : '', gravity ? 'sasi-card__grav' : '', className].filter(Boolean).join(' ');
  const gravStyle = gravity ? {
    borderLeftColor: GRAV_SOLID[gravity]
  } : {};
  const hasHead = title || eyebrow || action || number;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    style: {
      ...gravStyle,
      ...style
    }
  }, props), hasHead && /*#__PURE__*/React.createElement("div", {
    className: "sasi-card__head"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      minWidth: 0
    }
  }, number != null && /*#__PURE__*/React.createElement("span", {
    className: "sasi-card__num-badge"
  }, number), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    className: "sasi-card__eyebrow"
  }, eyebrow), title && /*#__PURE__*/React.createElement("div", {
    className: "sasi-card__title"
  }, title))), action && /*#__PURE__*/React.createElement("div", {
    style: {
      flexShrink: 0
    }
  }, action)), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.sasi-field { display: flex; flex-direction: column; gap: 5px; }
.sasi-field__label {
  font-size: var(--text-2xs); font-weight: 700; letter-spacing: var(--tracking-wide);
  text-transform: uppercase; color: var(--text-muted);
}
.sasi-field__hint { font-size: var(--text-xs); color: var(--text-faint); }
.sasi-input-wrap { position: relative; display: flex; align-items: center; }
.sasi-input-wrap > svg.lead { position: absolute; left: 10px; width: 15px; height: 15px; color: var(--text-faint); pointer-events: none; }
.sasi-input {
  width: 100%; box-sizing: border-box;
  font-family: var(--font-sans); font-size: var(--text-sm); color: var(--text-heading);
  background: var(--surface-card); border: 1px solid var(--border-default);
  border-radius: var(--radius-md); padding: 9px 12px;
  transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
}
.sasi-input.has-lead { padding-left: 32px; }
.sasi-input::placeholder { color: var(--text-faint); }
.sasi-input:hover { border-color: var(--border-strong); }
.sasi-input:focus { outline: none; border-color: var(--accent); box-shadow: var(--shadow-focus); }
.sasi-input:disabled { background: var(--surface-raised); color: var(--text-faint); cursor: not-allowed; }
textarea.sasi-input { resize: vertical; min-height: 64px; line-height: var(--leading-snug); }
.sasi-input--invalid { border-color: var(--danger); }
.sasi-input--invalid:focus { box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 30%, transparent); }
`;
if (typeof document !== 'undefined' && !document.getElementById('sasi-input-css')) {
  const s = document.createElement('style');
  s.id = 'sasi-input-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Text field / textarea with optional uppercase label, leading icon, and
 * invalid state. Used across login, ficha, synthesis editors.
 */
function Input({
  label,
  hint,
  icon = null,
  multiline = false,
  invalid = false,
  id,
  className = '',
  ...props
}) {
  const fieldId = id || (label ? `f-${String(label).toLowerCase().replace(/\W+/g, '-')}` : undefined);
  const inputCls = ['sasi-input', icon ? 'has-lead' : '', invalid ? 'sasi-input--invalid' : '', className].filter(Boolean).join(' ');
  const control = multiline ? /*#__PURE__*/React.createElement("textarea", _extends({
    id: fieldId,
    className: inputCls
  }, props)) : /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    className: inputCls
  }, props));
  return /*#__PURE__*/React.createElement("div", {
    className: "sasi-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "sasi-field__label",
    htmlFor: fieldId
  }, label), icon ? /*#__PURE__*/React.createElement("div", {
    className: "sasi-input-wrap"
  }, React.cloneElement(icon, {
    className: 'lead'
  }), control) : control, hint && /*#__PURE__*/React.createElement("span", {
    className: "sasi-field__hint"
  }, hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/SegmentedControl.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function SegmentedControl({
  options = [],
  value,
  onChange,
  className = '',
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `sasi-seg ${className}`,
    role: "tablist"
  }, props), options.map(opt => {
    const active = opt.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: opt.value,
      type: "button",
      role: "tab",
      "aria-selected": active,
      className: `sasi-seg__btn ${active ? 'is-active' : ''}`,
      onClick: () => onChange && onChange(opt.value),
      title: opt.hint || opt.label
    }, opt.icon, opt.label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/core/StatPill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  accent: 'var(--accent-text)'
};

/**
 * Inline header stat — a number with a trailing label and optional Δ.
 * Clickable variant doubles as a smart-filter toggle ("4 críticos").
 */
function StatPill({
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
  const deltaColor = delta != null ? delta > 0 ? 'var(--grav-critical-solid)' : delta < 0 ? 'var(--success)' : 'var(--text-muted)' : undefined;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: ['sasi-stat', isBtn ? 'sasi-stat--btn' : '', active ? 'sasi-stat--active' : '', className].filter(Boolean).join(' '),
    onClick: onClick,
    style: tone !== 'default' ? {
      color
    } : undefined
  }, props), icon, /*#__PURE__*/React.createElement("span", {
    className: "sasi-stat__num",
    style: tone !== 'default' ? {
      color
    } : undefined
  }, value), label && /*#__PURE__*/React.createElement("span", null, label), delta != null && delta !== 0 && /*#__PURE__*/React.createElement("span", {
    className: "sasi-stat__delta",
    style: {
      color: deltaColor
    }
  }, delta > 0 ? '↑+' : '↓', delta));
}
Object.assign(__ds_scope, { StatPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatPill.jsx", error: String((e && e.message) || e) }); }

// ui_kits/comando-uti/App.jsx
try { (() => {
// ============================================================================
// SASI UI Kit — App orchestrator
// ============================================================================
function App() {
  const NS = window.SASIComandoUTIDesignSystem_157e25;
  const {
    SegmentedControl,
    StatPill,
    Button
  } = NS;
  const {
    PATIENTS
  } = window.SASI_DATA;
  const [authed, setAuthed] = React.useState(false);
  const [theme, setThemeRaw] = React.useState(() => {
    try {
      return localStorage.getItem('sasi-theme') || 'clinical';
    } catch (e) {
      return 'clinical';
    }
  });
  const setTheme = t => {
    setThemeRaw(t);
    try {
      localStorage.setItem('sasi-theme', t);
    } catch (e) {}
  };
  const [view, setView] = React.useState('plantao'); // plantao | round | editor
  const [nav, setNav] = React.useState('plantao');
  const [uti, setUti] = React.useState('TODAS');
  const [smart, setSmart] = React.useState('todos');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'tactical' ? 'tactical' : '');
  }, [theme]);
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  const base = uti === 'TODAS' ? PATIENTS : PATIENTS.filter(p => p.uti === uti);
  const counts = {
    todos: base.length,
    critico: base.filter(p => p.gravity === 'critical').length,
    sofa_up: base.filter(p => (p.deltaSofa || 0) > 0).length,
    dva: base.filter(p => p.dva > 0).length,
    vm: base.filter(p => p.vm).length
  };
  let visible = base;
  if (search.trim()) {
    const q = search.toLowerCase();
    visible = visible.filter(p => p.name.toLowerCase().includes(q) || p.bed.includes(q));
  }
  if (smart === 'critico') visible = visible.filter(p => p.gravity === 'critical');else if (smart === 'sofa_up') visible = visible.filter(p => (p.deltaSofa || 0) > 0);else if (smart === 'dva') visible = visible.filter(p => p.dva > 0);else if (smart === 'vm') visible = visible.filter(p => p.vm);
  const criticos = PATIENTS.filter(p => p.gravity === 'critical').length;
  const graves = PATIENTS.filter(p => p.gravity === 'unstable').length;
  const selPatient = PATIENTS.find(p => p.id === selected);
  if (!authed) return /*#__PURE__*/React.createElement(window.Login, {
    onEnter: () => setAuthed(true)
  });
  const isHandoff = nav === 'handoff';
  const SMART = [{
    id: 'todos',
    label: 'Todos'
  }, {
    id: 'critico',
    label: 'Críticos'
  }, {
    id: 'sofa_up',
    label: 'Piora SOFA 24h'
  }, {
    id: 'dva',
    label: 'Em DVA'
  }, {
    id: 'vm',
    label: 'VM'
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "sasi-app"
  }, /*#__PURE__*/React.createElement(window.Sidebar, {
    active: nav,
    onNav: id => {
      setNav(id);
      if (id !== 'handoff') setView(id === 'plantao' ? 'plantao' : view);
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "sasi-main"
  }, /*#__PURE__*/React.createElement(window.TopBar, {
    title: isHandoff ? 'Passagem de Turno' : 'Gestão de Pacientes da UTI',
    subtitle: isHandoff ? 'Síntese · Eixo Passagem' : 'Visão integrada · Síntese · Decisão',
    criticos: criticos,
    warnings: 3,
    theme: theme,
    onTheme: () => setTheme(theme === 'tactical' ? 'clinical' : 'tactical')
  }, !isHandoff && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "success",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "plus"
    })
  }, "Novo Leito"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "clipboard-copy"
    })
  }, "Copiar"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "file-down"
    }),
    onClick: () => setNav('handoff')
  }, "PDF"), /*#__PURE__*/React.createElement(SegmentedControl, {
    value: view,
    onChange: setView,
    options: [{
      value: 'plantao',
      label: 'Cards',
      icon: /*#__PURE__*/React.createElement("i", {
        "data-lucide": "layout-grid"
      })
    }, {
      value: 'round',
      label: 'Round',
      icon: /*#__PURE__*/React.createElement("i", {
        "data-lucide": "list"
      })
    }, {
      value: 'editor',
      label: 'Tabela',
      icon: /*#__PURE__*/React.createElement("i", {
        "data-lucide": "table"
      })
    }]
  }))), /*#__PURE__*/React.createElement("div", {
    className: "sasi-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sasi-content__inner"
  }, isHandoff ? /*#__PURE__*/React.createElement(window.Handoff, {
    patients: PATIENTS,
    onBack: () => setNav('plantao')
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sasi-filters"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sasi-filters__stats"
  }, /*#__PURE__*/React.createElement(StatPill, {
    value: base.length,
    label: "ativos",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "users"
    })
  }), criticos > 0 && /*#__PURE__*/React.createElement(StatPill, {
    value: criticos,
    label: "cr\xEDticos",
    tone: "critical",
    active: smart === 'critico',
    onClick: () => setSmart(smart === 'critico' ? 'todos' : 'critico')
  }), graves > 0 && /*#__PURE__*/React.createElement(StatPill, {
    value: graves,
    label: "inst\xE1veis",
    tone: "unstable"
  }), /*#__PURE__*/React.createElement(StatPill, {
    value: counts.sofa_up,
    label: "\u2191SOFA",
    tone: "critical",
    active: smart === 'sofa_up',
    onClick: () => setSmart(smart === 'sofa_up' ? 'todos' : 'sofa_up')
  })), /*#__PURE__*/React.createElement("div", {
    className: "sasi-search"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "search"
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Nome ou leito\u2026",
    value: search,
    onChange: e => setSearch(e.target.value)
  })), /*#__PURE__*/React.createElement(SegmentedControl, {
    value: uti,
    onChange: setUti,
    options: [{
      value: 'TODAS',
      label: 'Todas'
    }, {
      value: 'UTI2',
      label: 'UTI2'
    }, {
      value: 'UTI3',
      label: 'UTI3'
    }, {
      value: 'UTI4',
      label: 'UTI4'
    }]
  })), /*#__PURE__*/React.createElement("div", {
    className: "sasi-pills"
  }, SMART.map(f => /*#__PURE__*/React.createElement("button", {
    key: f.id,
    className: `sasi-pill ${smart === f.id ? 'is-active' : ''}`,
    onClick: () => setSmart(f.id)
  }, f.label, f.id !== 'todos' && /*#__PURE__*/React.createElement("span", {
    className: "sasi-pill__count"
  }, counts[f.id] ?? 0)))), visible.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '60px 0',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "bed-double",
    style: {
      width: 32,
      height: 32
    }
  }), /*#__PURE__*/React.createElement("p", null, "Nenhum leito com esse filtro.")) : view === 'plantao' ? /*#__PURE__*/React.createElement(window.DashboardCards, {
    patients: visible,
    onSelect: setSelected
  }) : view === 'round' ? /*#__PURE__*/React.createElement(window.RoundView, {
    patients: visible,
    onSelect: setSelected
  }) : /*#__PURE__*/React.createElement(window.TableView, {
    patients: visible,
    onSelect: setSelected
  })))), !isHandoff && /*#__PURE__*/React.createElement("button", {
    className: "sasi-fab",
    title: "Admitir paciente"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "plus"
  }))), selPatient && /*#__PURE__*/React.createElement(window.PatientDetail, {
    patient: selPatient,
    onClose: () => setSelected(null),
    onHandoff: () => {
      setSelected(null);
      setNav('handoff');
    }
  }));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
setTimeout(() => window.lucide && window.lucide.createIcons(), 80);
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/comando-uti/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/comando-uti/Chrome.jsx
try { (() => {
// ============================================================================
// SASI UI Kit — Chrome: Sidebar (navy command rail) + TopBar
// ============================================================================
const NAV = [{
  id: 'plantao',
  icon: 'layout-grid',
  label: 'Visão Geral'
}, {
  id: 'pacientes',
  icon: 'users',
  label: 'Pacientes'
}, {
  id: 'handoff',
  icon: 'clipboard-list',
  label: 'Passagem de Turno'
}, {
  id: 'prescricoes',
  icon: 'pill',
  label: 'Prescrições'
}, {
  id: 'exames',
  icon: 'flask-conical',
  label: 'Exames'
}, {
  id: 'interconsultas',
  icon: 'stethoscope',
  label: 'Interconsultas'
}, {
  id: 'alertas',
  icon: 'bell',
  label: 'Alertas'
}, {
  id: 'relatorios',
  icon: 'file-text',
  label: 'Relatórios'
}, {
  id: 'config',
  icon: 'settings',
  label: 'Configurações'
}];
function Sidebar({
  active,
  onNav
}) {
  return /*#__PURE__*/React.createElement("aside", {
    className: "sasi-rail"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sasi-rail__brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sasi-rail__mark"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "activity"
  })), /*#__PURE__*/React.createElement("div", {
    className: "sasi-rail__word"
  }, /*#__PURE__*/React.createElement("b", null, "SASI"), /*#__PURE__*/React.createElement("small", null, "Sistema de Auditoria", /*#__PURE__*/React.createElement("br", null), "e S\xEDntese Intensiva"))), /*#__PURE__*/React.createElement("nav", {
    className: "sasi-rail__nav"
  }, NAV.map(n => /*#__PURE__*/React.createElement("button", {
    key: n.id,
    className: `sasi-rail__item ${active === n.id ? 'is-active' : ''}`,
    onClick: () => onNav && onNav(n.id)
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": n.icon
  }), /*#__PURE__*/React.createElement("span", null, n.label)))), /*#__PURE__*/React.createElement("div", {
    className: "sasi-rail__user"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sasi-rail__avatar"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "user-round"
  })), /*#__PURE__*/React.createElement("div", {
    className: "sasi-rail__userinfo"
  }, /*#__PURE__*/React.createElement("b", null, "Dr. Intensivista"), /*#__PURE__*/React.createElement("small", null, "UTI \xB7 Hospital S\xE3o Lucas"))));
}
function TopBar({
  title,
  subtitle,
  criticos,
  warnings,
  theme,
  onTheme,
  children
}) {
  return /*#__PURE__*/React.createElement("header", {
    className: "sasi-top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sasi-top__title"
  }, /*#__PURE__*/React.createElement("h1", null, title), subtitle && /*#__PURE__*/React.createElement("p", null, subtitle)), /*#__PURE__*/React.createElement("div", {
    className: "sasi-top__actions"
  }, criticos > 0 && /*#__PURE__*/React.createElement("span", {
    className: "sasi-top__alert sasi-top__alert--crit"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "bell"
  }), " ", criticos, " cr\xEDticos"), warnings > 0 && /*#__PURE__*/React.createElement("span", {
    className: "sasi-top__alert sasi-top__alert--warn"
  }, warnings, " warnings"), children, /*#__PURE__*/React.createElement("button", {
    className: "sasi-top__icon",
    title: "Alternar tema (clinical / tactical)",
    onClick: onTheme
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": theme === 'tactical' ? 'sun' : 'moon'
  })), /*#__PURE__*/React.createElement("span", {
    className: "sasi-top__date"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar"
  }), " 12/05 08:42")));
}
Object.assign(window, {
  Sidebar,
  TopBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/comando-uti/Chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/comando-uti/Handoff.jsx
try { (() => {
// ============================================================================
// SASI UI Kit — Handoff / Passagem de Turno (the "Export PDF" synthesis)
//   Per leito: 1 síntese · 1 mudanças que impactam conduta · 1 pendências/riscos
// ============================================================================
function Handoff({
  patients,
  onBack
}) {
  const {
    Button,
    GravityBadge,
    SofaBadge
  } = window.SASIComandoUTIDesignSystem_157e25;
  const CHANGES = {
    p1: ['TRE 2h bem tolerado, reduzido FiO₂ para 30%'],
    p2: ['Lactato em queda (4.1→2.4), nora reduzida para 0,10'],
    p3: ['↑SOFA +3, iniciada 2ª DVA; SDRA com P/F 130'],
    p4: ['Flow ECMO mantido 4.2; lactato 3.8, sem clareamento'],
    p5: ['VNI espaçada para 6/6h, tolerando ar ambiente 30 min'],
    p6: ['PA controlada, NIHSS estável em 14'],
    p7: ['Nova coleção drenada; febre 38.9 persistente'],
    p8: ['Acordado, sem déficit; programada alta enfermaria']
  };
  const RISKS = {
    p1: ['Aguardar gasometria pós-extubação'],
    p2: ['Vigiar débito do dreno · risco de re-laparotomia'],
    p3: ['Cultura de hemato pendente 48h · risco de PCR'],
    p4: ['Decisão de weaning ECMO em discussão · cuidados de fim de vida?'],
    p5: ['Vigiar fadiga respiratória'],
    p6: ['TC de controle amanhã · risco de transformação hemorrágica'],
    p7: ['Antibiograma pendente · prová­vel ajuste de ATB'],
    p8: ['Sem pendências']
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sasi-wrap"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "arrow-left"
    }),
    onClick: onBack
  }, "Voltar"), /*#__PURE__*/React.createElement("span", {
    className: "sasi-muted",
    style: {
      fontSize: 'var(--text-sm)'
    }
  }, patients.length, " leitos ativos \xB7 UTI 2/3/4")), /*#__PURE__*/React.createElement("div", {
    className: "sasi-wrap"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "clipboard-copy"
    })
  }, "Copiar texto"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "file-down"
    })
  }, "Exportar PDF"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden'
    }
  }, patients.map((p, idx) => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      padding: '14px 18px',
      borderTop: idx ? '1px solid var(--border-subtle)' : 'none',
      display: 'grid',
      gridTemplateColumns: '180px 1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 7,
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "sasi-mono",
    style: {
      fontSize: 'var(--text-md)',
      fontWeight: 700,
      color: 'var(--text-heading)'
    }
  }, p.bed), /*#__PURE__*/React.createElement("span", {
    className: "sasi-mono sasi-muted",
    style: {
      fontSize: 10
    }
  }, p.uti)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 'var(--text-sm)',
      color: 'var(--text-heading)'
    }
  }, p.name, ", ", p.age), /*#__PURE__*/React.createElement("div", {
    className: "sasi-wrap",
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(GravityBadge, {
    level: p.gravity,
    size: "sm"
  }), /*#__PURE__*/React.createElement(SofaBadge, {
    score: p.sofa,
    delta: p.deltaSofa,
    showIcon: false
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement(HandoffLine, {
    n: "1",
    tone: "accent",
    label: "S\xEDntese",
    items: [`${p.hd}`]
  }), /*#__PURE__*/React.createElement(HandoffLine, {
    n: "2",
    tone: "warning",
    label: "Muda conduta",
    items: CHANGES[p.id] || []
  }), /*#__PURE__*/React.createElement(HandoffLine, {
    n: "3",
    tone: "danger",
    label: "Pend\xEAncias / Riscos",
    items: RISKS[p.id] || []
  }))))));
}
function HandoffLine({
  n,
  tone,
  label,
  items
}) {
  const c = {
    accent: 'var(--accent)',
    warning: 'var(--warning)',
    danger: 'var(--danger)'
  }[tone];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 9,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      width: 18,
      height: 18,
      borderRadius: 'var(--radius-sm)',
      background: c,
      color: '#fff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 10,
      fontWeight: 700,
      fontFamily: 'var(--font-mono)'
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '.06em',
      color: c,
      marginRight: 8
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-body)'
    }
  }, items.join(' · ') || '—')));
}
Object.assign(window, {
  Handoff
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/comando-uti/Handoff.jsx", error: String((e && e.message) || e) }); }

// ui_kits/comando-uti/Login.jsx
try { (() => {
// ============================================================================
// SASI UI Kit — Login (magic-link)
// ============================================================================
function Login({
  onEnter
}) {
  const {
    Button,
    Input,
    Badge
  } = window.SASIComandoUTIDesignSystem_157e25;
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    className: "sasi-login"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sasi-login__card sasi-fade-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sasi-login__brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sasi-login__mark"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "activity"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, "SASI"), /*#__PURE__*/React.createElement("small", null, "Comando UTI \xB7 33 leitos"))), sent ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '18px 0'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "mail-check",
    style: {
      width: 40,
      height: 40,
      color: 'var(--success)'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-body)',
      fontWeight: 600,
      margin: '10px 0 4px'
    }
  }, "Link enviado para ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-heading)'
    }
  }, email || 'seu e-mail')), /*#__PURE__*/React.createElement("p", {
    className: "sasi-muted",
    style: {
      fontSize: 'var(--text-sm)',
      margin: 0
    }
  }, "Abra o e-mail e clique no link m\xE1gico para entrar."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    block: true,
    style: {
      marginTop: 18
    },
    onClick: onEnter
  }, "Entrar no painel (demo)")) : /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "E-mail institucional",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "mail"
    }),
    type: "email",
    placeholder: "dr.nicolas@hospital.com",
    value: email,
    onChange: e => setEmail(e.target.value)
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    block: true,
    type: "submit",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "send"
    })
  }, "Enviar link m\xE1gico"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onEnter,
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--text-muted)',
      fontSize: 'var(--text-xs)',
      cursor: 'pointer',
      textDecoration: 'underline'
    }
  }, "Pular para a demo \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "sasi-login__foot"
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "accent",
    variant: "outline",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "shield-check"
    })
  }, "Sess\xE3o criptografada \xB7 LGPD \xB7 RLS por auth.uid()"))));
}
Object.assign(window, {
  Login
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/comando-uti/Login.jsx", error: String((e && e.message) || e) }); }

// ui_kits/comando-uti/PatientDetail.jsx
try { (() => {
// ============================================================================
// SASI UI Kit — PatientDetail: a ficha estruturada
//   Ordem de leitura clínica (decisão primeiro, referência depois):
//   3 Situação Atual (eixo estado) + Avaliação por sistemas (eixo problema)
//   → Problemas Ativos ⇄ Condutas 12-24h (1:1, dose + meta — eixo ação)
//   → 2 Paciente Sumário / HPMA + tabelão (eixo tempo, referência)
// ============================================================================
const _D = window.SASIComandoUTIDesignSystem_157e25;
function PatientDetail({
  patient,
  onClose,
  onHandoff
}) {
  const p = patient;
  const v = p.vitals;
  const {
    Card,
    GravityBadge,
    SofaBadge,
    TherapyBadge,
    VitalStat,
    SystemPanel,
    ProblemRow,
    Button
  } = _D;
  const {
    LAB_DAYS,
    LABS
  } = window.SASI_DATA;
  const SYS_LABEL = {
    neuro: 'Neuro',
    resp: 'Resp',
    hemo: 'Hemo',
    tgi: 'TGI',
    renal: 'Renal',
    hemato: 'Hemato',
    infecto: 'Infecto',
    geral: 'Geral'
  };

  // Pareamento 1:1 — cada problema ativo recebe sua conduta (por sistema, senão por índice)
  const usados = new Set();
  const pares = p.problems.map((pr, i) => {
    let c = p.plano.find((x, j) => x.sistema === pr.system && !usados.has(j) && (usados.add(j) || true));
    if (!c && p.plano[i] && !usados.has(i)) {
      c = p.plano[i];
      usados.add(i);
    }
    return {
      problema: pr,
      conduta: c || null
    };
  });

  // Laboratório do dia = última coluna do tabelão
  const labsDia = LABS.map(row => {
    const val = row.vals[row.vals.length - 1];
    return {
      k: row.k,
      v: val,
      f: row.flag(val)
    };
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "sasi-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "sasi-modal sasi-fade-in",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "sasi-modal__head"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "sasi-mono",
    style: {
      fontSize: 'var(--text-xl)',
      fontWeight: 700,
      color: 'var(--text-heading)',
      whiteSpace: 'nowrap'
    }
  }, "Leito ", p.bed), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: 'var(--text-heading)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, p.name, ", ", p.age), /*#__PURE__*/React.createElement("div", {
    className: "sasi-muted",
    style: {
      fontSize: 'var(--text-xs)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, p.uti, " \xB7 Dia UTI ", p.days, " \xB7 ", p.hd))), /*#__PURE__*/React.createElement("div", {
    className: "sasi-wrap",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(GravityBadge, {
    level: p.gravity
  }), /*#__PURE__*/React.createElement(SofaBadge, {
    score: p.sofa,
    delta: p.deltaSofa
  }), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "clipboard-list"
    }),
    onClick: onHandoff
  }, "Passagem"), /*#__PURE__*/React.createElement("button", {
    className: "sasi-modal__close",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "sasi-modal__body"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, {
    number: "3",
    eyebrow: "Eixo Estado",
    title: "Situa\xE7\xE3o Atual"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sasi-section-title"
  }, "Sinais vitais & balan\xE7o 24h"), /*#__PURE__*/React.createElement("div", {
    className: "sasi-wrap",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(VitalStat, {
    label: "PAM",
    value: v.pam,
    status: v.pam < 65 ? 'low' : 'ok'
  }), /*#__PURE__*/React.createElement(VitalStat, {
    label: "FC",
    value: v.fc,
    status: v.fc > 110 ? 'high' : 'ok'
  }), /*#__PURE__*/React.createElement(VitalStat, {
    label: "SpO\u2082",
    value: v.spo2,
    unit: "%",
    status: v.spo2 < 92 ? 'low' : 'ok'
  }), /*#__PURE__*/React.createElement(VitalStat, {
    label: "TAX",
    value: v.tax,
    unit: "\xB0",
    status: parseFloat(v.tax) > 38 ? 'high' : 'ok'
  }), /*#__PURE__*/React.createElement(VitalStat, {
    label: "FR",
    value: v.fr,
    status: v.fr > 24 ? 'high' : 'ok'
  }), /*#__PURE__*/React.createElement(VitalStat, {
    label: "BH",
    value: v.bh,
    status: String(v.bh).startsWith('+') ? 'pos' : 'neg'
  })), /*#__PURE__*/React.createElement("div", {
    className: "sasi-section-title"
  }, "Laborat\xF3rio do dia"), /*#__PURE__*/React.createElement("div", {
    className: "sasi-wrap",
    style: {
      marginBottom: 14
    }
  }, labsDia.map(l => /*#__PURE__*/React.createElement("span", {
    key: l.k,
    style: {
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: 5,
      background: 'var(--surface-raised)',
      borderRadius: 'var(--radius-sm)',
      padding: '4px 9px',
      fontSize: 'var(--text-xs)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "sasi-muted"
  }, l.k), /*#__PURE__*/React.createElement("b", {
    className: "sasi-mono",
    style: {
      color: l.f === 'high' ? 'var(--grav-critical-solid)' : l.f === 'low' ? 'var(--sys-resp)' : 'var(--text-heading)'
    }
  }, l.v)))), /*#__PURE__*/React.createElement("div", {
    className: "sasi-section-title"
  }, "Terapias vigentes & dispositivos"), /*#__PURE__*/React.createElement("div", {
    className: "sasi-wrap",
    style: {
      marginBottom: 8
    }
  }, p.dva > 0 && /*#__PURE__*/React.createElement(TherapyBadge, {
    type: "dva",
    count: p.dva
  }), p.sed > 0 && /*#__PURE__*/React.createElement(TherapyBadge, {
    type: "sed",
    count: p.sed
  }), p.vm && /*#__PURE__*/React.createElement(TherapyBadge, {
    type: "vm"
  }), p.vni && /*#__PURE__*/React.createElement(TherapyBadge, {
    type: "vni"
  }), p.atb && /*#__PURE__*/React.createElement(TherapyBadge, {
    type: "atb"
  })), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: '0 0 14px',
      paddingLeft: 16,
      fontSize: 'var(--text-xs)',
      color: 'var(--text-body)',
      lineHeight: 1.7
    }
  }, p.devices.map((d, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, d))), /*#__PURE__*/React.createElement("div", {
    className: "sasi-section-title"
  }, "Exame f\xEDsico"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 14px',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-body)',
      lineHeight: 1.6
    }
  }, p.exame), /*#__PURE__*/React.createElement("div", {
    className: "sasi-section-title"
  }, "Eventos 24h"), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      paddingLeft: 16,
      fontSize: 'var(--text-xs)',
      color: 'var(--text-body)',
      lineHeight: 1.7
    }
  }, (p.eventos || []).map((e, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, e)))), /*#__PURE__*/React.createElement(Card, {
    number: "4",
    eyebrow: "Eixo Problema",
    title: "Avalia\xE7\xE3o por sistemas"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, p.problems.map((pr, i) => /*#__PURE__*/React.createElement(SystemPanel, {
    key: i,
    system: pr.system || 'hemo',
    title: SYS_LABEL[pr.system] || 'Hemo'
  }, /*#__PURE__*/React.createElement(ProblemRow, {
    text: pr.text,
    vetor: pr.vetor
  })))), /*#__PURE__*/React.createElement("div", {
    className: "sasi-section-title",
    style: {
      marginTop: 14
    }
  }, "Impress\xE3o cl\xEDnica"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xs)',
      color: 'var(--text-body)',
      lineHeight: 1.6
    }
  }, p.hd, ". ", p.deltaSofa > 0 ? `Em piora — SOFA subiu ${p.deltaSofa} em 24h.` : p.deltaSofa < 0 ? `Em melhora — SOFA caiu ${Math.abs(p.deltaSofa)} em 24h.` : 'Estável em relação às últimas 24h.')), /*#__PURE__*/React.createElement(Card, {
    eyebrow: "Eixo A\xE7\xE3o",
    title: "Problemas Ativos \u21C4 Condutas 12\u201324h",
    style: {
      gridColumn: '1 / -1'
    },
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "primary",
      icon: /*#__PURE__*/React.createElement("i", {
        "data-lucide": "file-down"
      }),
      onClick: onHandoff
    }, "Exportar PDF")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 24px 1.2fr',
      gap: 10,
      padding: '0 2px 7px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "sasi-section-title",
    style: {
      margin: 0
    }
  }, "Problema ativo"), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", {
    className: "sasi-section-title",
    style: {
      margin: 0
    }
  }, "Conduta \xB7 dose + meta num\xE9rica")), pares.map(({
    problema,
    conduta
  }, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 24px 1.2fr',
      gap: 10,
      alignItems: 'center',
      padding: '10px 2px',
      borderTop: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement(ProblemRow, {
    text: problema.text,
    vetor: problema.vetor,
    system: SYS_LABEL[problema.system]
  }), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "arrow-right",
    style: {
      width: 15,
      height: 15,
      color: 'var(--text-faint)'
    }
  }), conduta ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-raised)',
      border: '1px solid var(--border-subtle)',
      borderLeft: '3px solid var(--sys-' + (conduta.sistema || 'hemo') + '-bar)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 11px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--text-heading)',
      marginBottom: 3
    }
  }, conduta.acao), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 'var(--text-2xs)',
      color: 'var(--success)',
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "target",
    style: {
      width: 11,
      height: 11
    }
  }), " META: ", conduta.meta)) : /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'none',
      border: '1px dashed var(--border-strong)',
      borderRadius: 'var(--radius-md)',
      padding: '10px',
      color: 'var(--text-faint)',
      fontSize: 'var(--text-xs)',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)'
    }
  }, "+ Definir conduta para este problema"))))), /*#__PURE__*/React.createElement(Card, {
    number: "2",
    eyebrow: "Eixo Tempo \xB7 HPMA & Tabel\xE3o",
    title: "Paciente Sum\xE1rio",
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-body)',
      margin: '0 0 12px',
      lineHeight: 'var(--leading-snug)'
    }
  }, p.name, ", ", p.age, " anos, admitido h\xE1 ", p.days, " dias por ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-heading)'
    }
  }, p.hd.toLowerCase()), ". Acompanhamento serial do laborat\xF3rio abaixo."), /*#__PURE__*/React.createElement("table", {
    className: "sasi-labs"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Exame"), LAB_DAYS.map(d => /*#__PURE__*/React.createElement("th", {
    key: d
  }, d)))), /*#__PURE__*/React.createElement("tbody", null, LABS.map(row => /*#__PURE__*/React.createElement("tr", {
    key: row.k
  }, /*#__PURE__*/React.createElement("td", null, row.k), row.vals.map((val, i) => {
    const f = row.flag(val);
    return /*#__PURE__*/React.createElement("td", {
      key: i,
      className: f === 'high' ? 'lab-high' : f === 'low' ? 'lab-low' : ''
    }, val);
  }))))))))));
}
Object.assign(window, {
  PatientDetail
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/comando-uti/PatientDetail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/comando-uti/Views.jsx
try { (() => {
// ============================================================================
// SASI UI Kit — view modes: Cards (Plantão), Round (Split), Tabela (Editor)
// ============================================================================
const NS = window.SASIComandoUTIDesignSystem_157e25;
const {
  LeitoCard,
  GravityBadge,
  SofaBadge,
  TherapyBadge,
  VitalStat,
  SystemPanel,
  Card
} = NS;

// ---------- Cards / Plantão ----------
function DashboardCards({
  patients,
  onSelect
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "sasi-grid"
  }, patients.map(p => /*#__PURE__*/React.createElement(LeitoCard, {
    key: p.id,
    bed: p.bed,
    uti: p.uti,
    name: p.name,
    age: p.age,
    gravity: p.gravity,
    sofa: p.sofa,
    deltaSofa: p.deltaSofa,
    septic: p.septic,
    problems: p.problems,
    dva: p.dva,
    sed: p.sed,
    vm: p.vm,
    vni: p.vni,
    atb: p.atb,
    pend: p.pend,
    onClick: () => onSelect(p.id)
  })));
}

// ---------- Round / Split ----------
function RoundView({
  patients,
  onSelect
}) {
  const [sel, setSel] = React.useState(patients[0]?.id);
  const p = patients.find(x => x.id === sel) || patients[0];
  const v = p.vitals;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: 14,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      maxHeight: 'calc(100vh - 240px)',
      overflowY: 'auto',
      paddingRight: 4
    }
  }, patients.map(x => /*#__PURE__*/React.createElement("div", {
    key: x.id,
    style: {
      borderRadius: 'var(--radius-xl)',
      outline: x.id === sel ? '2px solid var(--accent)' : 'none',
      opacity: x.id === sel ? 1 : 0.85
    }
  }, /*#__PURE__*/React.createElement(LeitoCard, {
    compact: true,
    bed: x.bed,
    uti: x.uti,
    name: x.name,
    age: x.age,
    gravity: x.gravity,
    sofa: x.sofa,
    deltaSofa: x.deltaSofa,
    problems: x.problems,
    dva: x.dva,
    sed: x.sed,
    vm: x.vm,
    vni: x.vni,
    atb: x.atb,
    pend: x.pend,
    onClick: () => setSel(x.id)
  })))), /*#__PURE__*/React.createElement(Card, {
    padded: true,
    style: {
      borderRadius: 'var(--radius-xl)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "sasi-mono",
    style: {
      fontSize: 'var(--text-xl)',
      fontWeight: 700,
      color: 'var(--text-heading)'
    }
  }, p.bed), /*#__PURE__*/React.createElement("span", {
    className: "sasi-mono sasi-muted",
    style: {
      fontSize: 11
    }
  }, p.uti)), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 8px',
      fontSize: 'var(--text-md)',
      color: 'var(--text-heading)'
    }
  }, p.name, ", ", p.age), /*#__PURE__*/React.createElement("div", {
    className: "sasi-wrap",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(GravityBadge, {
    level: p.gravity
  }), /*#__PURE__*/React.createElement(SofaBadge, {
    score: p.sofa,
    delta: p.deltaSofa
  }), /*#__PURE__*/React.createElement("span", {
    className: "sasi-muted",
    style: {
      fontSize: 'var(--text-xs)'
    }
  }, "D", p.days, " \xB7 ", p.age, "a")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-raised)',
      borderRadius: 'var(--radius-lg)',
      padding: '9px 12px',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-body)',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("b", {
    className: "sasi-muted"
  }, "HD:"), " ", p.hd), /*#__PURE__*/React.createElement("div", {
    className: "sasi-wrap",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(VitalStat, {
    label: "PAM",
    value: v.pam,
    status: v.pam < 65 ? 'low' : 'ok'
  }), /*#__PURE__*/React.createElement(VitalStat, {
    label: "FC",
    value: v.fc,
    status: v.fc > 110 ? 'high' : 'ok'
  }), /*#__PURE__*/React.createElement(VitalStat, {
    label: "SpO\u2082",
    value: v.spo2,
    unit: "%",
    status: v.spo2 < 92 ? 'low' : 'ok'
  }), /*#__PURE__*/React.createElement(VitalStat, {
    label: "TAX",
    value: v.tax,
    unit: "\xB0",
    status: parseFloat(v.tax) > 38 ? 'high' : 'ok'
  }), /*#__PURE__*/React.createElement(VitalStat, {
    label: "FR",
    value: v.fr,
    status: v.fr > 24 ? 'high' : 'ok'
  }), /*#__PURE__*/React.createElement(VitalStat, {
    label: "BH",
    value: v.bh,
    status: String(v.bh).startsWith('+') ? 'pos' : 'neg'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8
    }
  }, p.problems.slice(0, 4).map((pr, i) => /*#__PURE__*/React.createElement(SystemPanel, {
    key: i,
    system: pr.system || 'hemo'
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-body)',
      fontWeight: 600
    }
  }, pr.vetor, " ", pr.text)))), /*#__PURE__*/React.createElement("button", {
    className: "sasi-pill is-active",
    style: {
      marginTop: 14
    },
    onClick: () => onSelect(p.id)
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "maximize-2"
  }), " Abrir ficha completa")));
}

// ---------- Tabela / Editor ----------
function TableView({
  patients,
  onSelect
}) {
  const cell = (val, status) => {
    const color = status === 'high' ? 'var(--grav-critical-solid)' : status === 'low' ? 'var(--sys-resp)' : 'var(--text-body)';
    return /*#__PURE__*/React.createElement("td", {
      className: "sasi-mono",
      style: {
        color,
        fontWeight: status !== 'ok' ? 700 : 500
      }
    }, val ?? '—');
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-default)',
      background: 'var(--surface-card)',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "sasi-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, ['UTI', 'Leito', 'Paciente', 'Grav', 'SOFA', 'D', 'PAM', 'FC', 'SpO₂', 'TAX', 'FR', 'BH', 'DVA', 'Pend', 'Diagnóstico'].map(h => /*#__PURE__*/React.createElement("th", {
    key: h
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, patients.map(p => {
    const v = p.vitals;
    return /*#__PURE__*/React.createElement("tr", {
      key: p.id,
      onClick: () => onSelect(p.id)
    }, /*#__PURE__*/React.createElement("td", {
      className: "sasi-mono sasi-muted",
      style: {
        fontSize: 10
      }
    }, p.uti), /*#__PURE__*/React.createElement("td", {
      className: "sasi-mono",
      style: {
        fontWeight: 700,
        color: 'var(--text-heading)'
      }
    }, p.bed), /*#__PURE__*/React.createElement("td", {
      style: {
        fontWeight: 600,
        color: 'var(--text-heading)'
      }
    }, p.name), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(GravityBadge, {
      level: p.gravity,
      size: "sm"
    })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(SofaBadge, {
      score: p.sofa,
      delta: p.deltaSofa,
      showIcon: false
    })), /*#__PURE__*/React.createElement("td", {
      className: "sasi-mono sasi-muted"
    }, "D", p.days), cell(v.pam, v.pam < 65 ? 'low' : 'ok'), cell(v.fc, v.fc > 110 ? 'high' : 'ok'), cell(v.spo2 + '%', v.spo2 < 92 ? 'low' : 'ok'), cell(v.tax + '°', parseFloat(v.tax) > 38 ? 'high' : 'ok'), cell(v.fr, v.fr > 24 ? 'high' : 'ok'), cell(v.bh, String(v.bh).startsWith('+') ? 'high' : 'low'), /*#__PURE__*/React.createElement("td", {
      className: "sasi-mono",
      style: {
        fontWeight: 700,
        color: p.dva ? 'var(--grav-critical-solid)' : 'var(--text-faint)'
      }
    }, p.dva || '—'), /*#__PURE__*/React.createElement("td", {
      className: "sasi-mono",
      style: {
        fontWeight: 700,
        color: p.pend ? 'var(--grav-watcher-text)' : 'var(--text-faint)'
      }
    }, p.pend || '—'), /*#__PURE__*/React.createElement("td", {
      className: "sasi-muted",
      style: {
        maxWidth: 240,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: 'var(--text-xs)'
      }
    }, p.hd));
  }))));
}
Object.assign(window, {
  DashboardCards,
  RoundView,
  TableView
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/comando-uti/Views.jsx", error: String((e && e.message) || e) }); }

// ui_kits/comando-uti/data.jsx
try { (() => {
// ============================================================================
// SASI UI Kit — mock clinical data (fictional patients, fictional values)
// ============================================================================
const PATIENTS = [{
  id: 'p1',
  bed: '07',
  uti: 'UTI2',
  name: 'João Silva',
  age: 62,
  days: 4,
  gravity: 'stable',
  sofa: 4,
  deltaSofa: -1,
  septic: false,
  hd: 'Sepse de foco pulmonar, em desmame ventilatório',
  dva: 0,
  sed: 0,
  vm: true,
  vni: false,
  atb: true,
  pend: 1,
  problems: [{
    text: 'Sepse pulmonar em resolução',
    vetor: '↓',
    system: 'infecto'
  }, {
    text: 'Desmame de VM (em TRE)',
    vetor: '↓',
    system: 'resp'
  }],
  vitals: {
    pam: 78,
    fc: 88,
    spo2: 96,
    tax: '37.2',
    fr: 18,
    bh: '-420'
  },
  devices: ['VM (IOT D2)', 'CVC jugular D'],
  exame: 'RASS 0, desperto, colaborativo. MV+ bilateral, raros roncos em base D. Abdome flácido. Sem edema.',
  eventos: ['TRE 2h bem tolerado (07h)', 'FiO₂ reduzida 40→30%'],
  plano: [{
    sistema: 'resp',
    acao: 'Progredir desmame, TRE 2h',
    meta: 'Extubar até amanhã 12h'
  }, {
    sistema: 'infecto',
    acao: 'D5 de Pip-Tazo',
    meta: 'Reavaliar descalonamento c/ cultura'
  }]
}, {
  id: 'p2',
  bed: '08',
  uti: 'UTI2',
  name: 'Maria Oliveira',
  age: 58,
  days: 2,
  gravity: 'watcher',
  sofa: 6,
  deltaSofa: 1,
  septic: false,
  hd: 'Choque séptico de foco abdominal pós-laparotomia',
  dva: 1,
  sed: 1,
  vm: true,
  vni: false,
  atb: true,
  pend: 2,
  problems: [{
    text: 'Choque séptico foco abdominal',
    vetor: '=',
    system: 'hemo'
  }, {
    text: 'Íleo paralítico pós-op',
    vetor: '=',
    system: 'tgi'
  }],
  vitals: {
    pam: 68,
    fc: 102,
    spo2: 95,
    tax: '37.8',
    fr: 20,
    bh: '+680'
  },
  devices: ['VM (IOT D2)', 'CVC subclávia D', 'SVD', 'Dreno abdominal'],
  exame: 'RASS -2 sob sedação leve. Abdome distendido, RHA diminuídos, dreno com débito serossanguinolento 120 mL/24h.',
  eventos: ['Nora reduzida 0,18→0,10 (03h)', 'Lactato 4.1→2.4'],
  plano: [{
    sistema: 'hemo',
    acao: 'Titular noradrenalina',
    meta: 'PAM ≥ 65 mmHg'
  }, {
    sistema: 'renal',
    acao: 'Reduzir aporte hídrico',
    meta: 'BH ≤ +500 mL em 24h'
  }]
}, {
  id: 'p3',
  bed: '09',
  uti: 'UTI3',
  name: 'Carlos Mendes',
  age: 71,
  days: 9,
  gravity: 'critical',
  sofa: 13,
  deltaSofa: 3,
  septic: true,
  hd: 'IRA dialítica + SDRA grave, foco pulmonar',
  dva: 2,
  sed: 1,
  vm: true,
  vni: false,
  atb: true,
  pend: 3,
  problems: [{
    text: 'Choque séptico SCAI C, foco pulmonar',
    vetor: '↑',
    system: 'hemo'
  }, {
    text: 'IRA KDIGO 3 em hemodiálise',
    vetor: '=',
    system: 'renal'
  }, {
    text: 'SDRA moderada-grave',
    vetor: '↑',
    system: 'resp'
  }],
  vitals: {
    pam: 58,
    fc: 128,
    spo2: 89,
    tax: '38.7',
    fr: 28,
    bh: '+1240'
  },
  devices: ['VM (IOT D7)', 'CVC + cateter de HD', 'PAi radial', 'SVD'],
  exame: 'RASS -4. Mal perfundido, TEC 4s, livedo em joelhos. MV+ com estertores difusos. Anúrico entre sessões de HD.',
  eventos: ['↑Nora + associada vasopressina (01h)', 'Hipoxemia SpO₂ 85% → pronação considerada', 'HD antecipada para hoje 10h'],
  plano: [{
    sistema: 'hemo',
    acao: 'Nora + Vaso; avaliar dobutamina se SvO₂↓',
    meta: 'PAM ≥ 65, lactato em queda'
  }, {
    sistema: 'resp',
    acao: 'VM protetora, prona se P/F < 150',
    meta: 'SpO₂ 90-94%, driving ≤ 15'
  }, {
    sistema: 'renal',
    acao: 'HD diária, balanço negativo',
    meta: 'BH negativo 1000 mL/24h'
  }]
}, {
  id: 'p4',
  bed: '10',
  uti: 'UTI3',
  name: 'Ana Costa',
  age: 45,
  days: 1,
  gravity: 'unstable',
  sofa: 9,
  deltaSofa: 2,
  septic: false,
  hd: 'Pós-PCR / choque cardiogênico, ECMO VA',
  dva: 2,
  sed: 1,
  vm: true,
  vni: false,
  atb: false,
  pend: 2,
  problems: [{
    text: 'Choque cardiogênico pós-PCR, ECMO VA',
    vetor: '↑',
    system: 'hemo'
  }, {
    text: 'Encefalopatia anóxica a esclarecer',
    vetor: '=',
    system: 'neuro'
  }],
  vitals: {
    pam: 62,
    fc: 110,
    spo2: 97,
    tax: '36.4',
    fr: 16,
    bh: '+300'
  },
  devices: ['ECMO VA', 'VM (IOT D1)', 'IABP', 'PAi femoral'],
  exame: 'RASS -5 (sedação profunda). Pupilas isocóricas fotorreagentes. MMII frios, pulsos pediosos presentes com ECMO.',
  eventos: ['Canulação ECMO VA sem intercorrências (22h)', 'Ecocardiograma: FE 15%'],
  plano: [{
    sistema: 'hemo',
    acao: 'Flow ECMO 4.2 L/min, weaning lento',
    meta: 'Lactato < 2, SvO₂ ≥ 65%'
  }, {
    sistema: 'neuro',
    acao: 'EEG + RM crânio',
    meta: 'Prognóstico neuro em 72h'
  }]
}, {
  id: 'p5',
  bed: '03',
  uti: 'UTI2',
  name: 'Pedro Almeida',
  age: 67,
  days: 6,
  gravity: 'stable',
  sofa: 3,
  deltaSofa: 0,
  septic: false,
  hd: 'DPOC exacerbado, em VNI intermitente',
  dva: 0,
  sed: 0,
  vm: false,
  vni: true,
  atb: true,
  pend: 0,
  problems: [{
    text: 'DPOC exacerbado em melhora',
    vetor: '↓',
    system: 'resp'
  }],
  vitals: {
    pam: 84,
    fc: 78,
    spo2: 93,
    tax: '36.9',
    fr: 19,
    bh: '-150'
  },
  devices: ['VNI intermitente', 'AVP'],
  exame: 'Desperto, orientado. Tiragem leve em uso de VNI. Sibilos esparsos bilaterais em desmame.',
  eventos: ['VNI espaçada 4/4h→6/6h', 'Tolerou ar ambiente 30 min'],
  plano: [{
    sistema: 'resp',
    acao: 'Espaçar VNI, fisioterapia',
    meta: 'SpO₂ ≥ 92% em ar ambiente'
  }]
}, {
  id: 'p6',
  bed: '05',
  uti: 'UTI4',
  name: 'Rosa Lima',
  age: 79,
  days: 3,
  gravity: 'watcher',
  sofa: 5,
  deltaSofa: -1,
  septic: false,
  hd: 'AVCi extenso, NIHSS 14, em vigilância neuro',
  dva: 0,
  sed: 0,
  vm: false,
  vni: false,
  atb: false,
  pend: 1,
  problems: [{
    text: 'AVCi MCD, vigilância de HIC',
    vetor: '=',
    system: 'neuro'
  }],
  vitals: {
    pam: 96,
    fc: 72,
    spo2: 97,
    tax: '36.6',
    fr: 17,
    bh: '+120'
  },
  devices: ['SNE', 'AVP'],
  exame: 'Sonolenta, abre olhos ao chamado. Hemiparesia E grau 2, disartria. NIHSS 14 mantido.',
  eventos: ['Escala neuro 2/2h sem piora', 'PAS máx 168 — sem necessidade de nicardipina'],
  plano: [{
    sistema: 'neuro',
    acao: 'Controle pressórico, escala neuro 2/2h',
    meta: 'PAS < 180, sem piora NIHSS'
  }]
}, {
  id: 'p7',
  bed: '11',
  uti: 'UTI4',
  name: 'Antônio Reis',
  age: 54,
  days: 12,
  gravity: 'unstable',
  sofa: 10,
  deltaSofa: 1,
  septic: true,
  hd: 'Pancreatite necrosante infectada, SDMO',
  dva: 1,
  sed: 1,
  vm: true,
  vni: false,
  atb: true,
  pend: 4,
  problems: [{
    text: 'Pancreatite necrosante infectada',
    vetor: '↑',
    system: 'infecto'
  }, {
    text: 'Disfunção de múltiplos órgãos',
    vetor: '=',
    system: 'hemo'
  }],
  vitals: {
    pam: 64,
    fc: 116,
    spo2: 92,
    tax: '38.9',
    fr: 24,
    bh: '+920'
  },
  devices: ['VM (IOT D9)', 'CVC', 'PAi', 'SVD', 'Dreno percutâneo'],
  exame: 'RASS -3. Abdome tenso, doloroso à palpação difusa. Dreno percutâneo com débito purulento 80 mL.',
  eventos: ['Febre 38.9° persistente', 'Nova coleção drenada por radiologia (14h)'],
  plano: [{
    sistema: 'infecto',
    acao: 'Meropenem D6 + cobertura fúngica',
    meta: 'Afebril 48h, PCR em queda'
  }, {
    sistema: 'hemo',
    acao: 'Ressuscitação guiada por metas',
    meta: 'PAM ≥ 65, diurese > 0.5 mL/kg/h'
  }]
}, {
  id: 'p8',
  bed: '02',
  uti: 'UTI2',
  name: 'Luiza Faria',
  age: 33,
  days: 1,
  gravity: 'stable',
  sofa: 2,
  deltaSofa: 0,
  septic: false,
  hd: 'Pós-operatório de neurocirurgia eletiva, observação',
  dva: 0,
  sed: 0,
  vm: false,
  vni: false,
  atb: false,
  pend: 0,
  problems: [{
    text: 'PO neurocirúrgico estável',
    vetor: '=',
    system: 'neuro'
  }],
  vitals: {
    pam: 88,
    fc: 70,
    spo2: 99,
    tax: '36.5',
    fr: 15,
    bh: '-80'
  },
  devices: ['AVP', 'Dreno subgaleal'],
  exame: 'Desperta, Glasgow 15, sem déficits. Ferida operatória limpa, dreno subgaleal com débito mínimo.',
  eventos: ['Sem intercorrências noturnas', 'Dieta liberada e aceita'],
  plano: [{
    sistema: 'neuro',
    acao: 'Vigilância neuro, analgesia',
    meta: 'Alta para enfermaria em 24h'
  }]
}];

// Labs for the "tabelão" serial table (last 6 days)
const LAB_DAYS = ['06/05', '07/05', '08/05', '09/05', '10/05', '11/05'];
const LABS = [{
  k: 'Leucócitos',
  unit: '×10³',
  vals: [14.2, 16.0, 18.7, 15.4, 12.6, 11.8],
  flag: v => v > 12 ? 'high' : v < 4 ? 'low' : 'ok'
}, {
  k: 'PCR',
  unit: 'mg/dL',
  vals: [18.0, 16.7, 14.2, 11.4, 9.1, 7.6],
  flag: v => v > 5 ? 'high' : 'ok'
}, {
  k: 'Lactato',
  unit: 'mmol/L',
  vals: [3.8, 4.1, 3.2, 2.4, 1.9, 1.6],
  flag: v => v > 2 ? 'high' : 'ok'
}, {
  k: 'Creatinina',
  unit: 'mg/dL',
  vals: [2.1, 2.6, 3.1, 2.8, 2.2, 1.9],
  flag: v => v > 1.3 ? 'high' : 'ok'
}, {
  k: 'Plaquetas',
  unit: '×10³',
  vals: [180, 142, 98, 110, 134, 156],
  flag: v => v < 100 ? 'low' : 'ok'
}, {
  k: 'pH',
  unit: '',
  vals: ['7.28', '7.31', '7.35', '7.38', '7.40', '7.41'],
  flag: v => parseFloat(v) < 7.35 ? 'high' : 'ok'
}];
window.SASI_DATA = {
  PATIENTS,
  LAB_DAYS,
  LABS
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/comando-uti/data.jsx", error: String((e && e.message) || e) }); }

__ds_ns.GravityBadge = __ds_scope.GravityBadge;

__ds_ns.LeitoCard = __ds_scope.LeitoCard;

__ds_ns.ProblemRow = __ds_scope.ProblemRow;

__ds_ns.SofaBadge = __ds_scope.SofaBadge;

__ds_ns.SystemPanel = __ds_scope.SystemPanel;

__ds_ns.TherapyBadge = __ds_scope.TherapyBadge;

__ds_ns.VitalStat = __ds_scope.VitalStat;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.StatPill = __ds_scope.StatPill;

})();
