import React from 'react';

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
  dva:    { label: 'DVA',  icon: 'heart',          bg: 'var(--badge-dva-bg)',    text: 'var(--badge-dva-text)' },
  sed:    { label: 'Sed',  icon: 'droplets',       bg: 'var(--badge-sed-bg)',    text: 'var(--badge-sed-text)' },
  vm:     { label: 'VM',   icon: 'wind',           bg: 'var(--badge-vm-bg)',     text: 'var(--badge-vm-text)' },
  vni:    { label: 'VNI',  icon: 'wind',           bg: 'var(--badge-vni-bg)',    text: 'var(--badge-vni-text)' },
  atb:    { label: 'ATB',  icon: 'pill',           bg: 'var(--badge-atb-bg)',    text: 'var(--badge-atb-text)' },
  pend:   { label: 'Pend', icon: 'alert-triangle', bg: 'var(--badge-pend-bg)',   text: 'var(--badge-pend-text)' },
  sepsis: { label: 'Sepse-3', icon: 'flame',       bg: 'var(--badge-sepsis-bg)', text: 'var(--badge-sepsis-text)' },
};

/**
 * Therapy / device pill — drogas vasoativas, sedação, ventilação, ATB,
 * pendências, Sepse-3 alert. Optional count appends to the label (DVA 2).
 */
export function TherapyBadge({ type = 'dva', count = null, label, showIcon = true, pulse = false, className = '', style = {}, ...props }) {
  const t = MAP[type] || MAP.dva;
  return (
    <span
      className={`sasi-tx ${pulse ? 'sasi-critical-pulse' : ''} ${className}`}
      style={{ background: t.bg, color: t.text, ...style }}
      title={t.label}
      {...props}
    >
      {showIcon && <i data-lucide={t.icon}></i>}
      {label || t.label}
      {count != null && <span style={{ fontVariantNumeric: 'tabular-nums' }}>{count}</span>}
    </span>
  );
}
