// ============================================================================
// SASI UI Kit — Chrome: Sidebar (navy command rail) + TopBar
// ============================================================================
const NAV = [
  { id: 'plantao', icon: 'layout-grid', label: 'Visão Geral' },
  { id: 'pacientes', icon: 'users', label: 'Pacientes' },
  { id: 'handoff', icon: 'clipboard-list', label: 'Passagem de Turno' },
  { id: 'prescricoes', icon: 'pill', label: 'Prescrições' },
  { id: 'exames', icon: 'flask-conical', label: 'Exames' },
  { id: 'interconsultas', icon: 'stethoscope', label: 'Interconsultas' },
  { id: 'alertas', icon: 'bell', label: 'Alertas' },
  { id: 'relatorios', icon: 'file-text', label: 'Relatórios' },
  { id: 'config', icon: 'settings', label: 'Configurações' },
];

function Sidebar({ active, onNav }) {
  return (
    <aside className="sasi-rail">
      <div className="sasi-rail__brand">
        <div className="sasi-rail__mark"><i data-lucide="activity"></i></div>
        <div className="sasi-rail__word">
          <b>SASI</b>
          <small>Sistema de Auditoria<br/>e Síntese Intensiva</small>
        </div>
      </div>
      <nav className="sasi-rail__nav">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={`sasi-rail__item ${active === n.id ? 'is-active' : ''}`}
            onClick={() => onNav && onNav(n.id)}
          >
            <i data-lucide={n.icon}></i>
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
      <div className="sasi-rail__user">
        <div className="sasi-rail__avatar"><i data-lucide="user-round"></i></div>
        <div className="sasi-rail__userinfo">
          <b>Dr. Intensivista</b>
          <small>UTI · Hospital São Lucas</small>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ title, subtitle, criticos, warnings, theme, onTheme, children }) {
  return (
    <header className="sasi-top">
      <div className="sasi-top__title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="sasi-top__actions">
        {criticos > 0 && (
          <span className="sasi-top__alert sasi-top__alert--crit">
            <i data-lucide="bell"></i> {criticos} críticos
          </span>
        )}
        {warnings > 0 && (
          <span className="sasi-top__alert sasi-top__alert--warn">{warnings} warnings</span>
        )}
        {children}
        <button className="sasi-top__icon" title="Alternar tema (clinical / tactical)" onClick={onTheme}>
          <i data-lucide={theme === 'tactical' ? 'sun' : 'moon'}></i>
        </button>
        <span className="sasi-top__date"><i data-lucide="calendar"></i> 12/05 08:42</span>
      </div>
    </header>
  );
}

Object.assign(window, { Sidebar, TopBar });
