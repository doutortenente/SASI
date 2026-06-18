import React from 'react';

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
export function Input({
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
  const inputCls = [
    'sasi-input',
    icon ? 'has-lead' : '',
    invalid ? 'sasi-input--invalid' : '',
    className,
  ].filter(Boolean).join(' ');

  const control = multiline ? (
    <textarea id={fieldId} className={inputCls} {...props} />
  ) : (
    <input id={fieldId} className={inputCls} {...props} />
  );

  return (
    <div className="sasi-field">
      {label && <label className="sasi-field__label" htmlFor={fieldId}>{label}</label>}
      {icon ? (
        <div className="sasi-input-wrap">
          {React.cloneElement(icon, { className: 'lead' })}
          {control}
        </div>
      ) : control}
      {hint && <span className="sasi-field__hint">{hint}</span>}
    </div>
  );
}
