// ============================================================================
// SASI UI Kit — App orchestrator
// ============================================================================
function App() {
  const NS = window.SASIComandoUTIDesignSystem_157e25;
  const { SegmentedControl, StatPill, Button } = NS;
  const { PATIENTS } = window.SASI_DATA;

  const [authed, setAuthed] = React.useState(false);
  const [theme, setThemeRaw] = React.useState(() => {
    try { return localStorage.getItem('sasi-theme') || 'clinical'; } catch (e) { return 'clinical'; }
  });
  const setTheme = (t) => { setThemeRaw(t); try { localStorage.setItem('sasi-theme', t); } catch (e) {} };
  const [view, setView] = React.useState('plantao');     // plantao | round | editor
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

  const base = uti === 'TODAS' ? PATIENTS : PATIENTS.filter((p) => p.uti === uti);
  const counts = {
    todos: base.length,
    critico: base.filter((p) => p.gravity === 'critical').length,
    sofa_up: base.filter((p) => (p.deltaSofa || 0) > 0).length,
    dva: base.filter((p) => p.dva > 0).length,
    vm: base.filter((p) => p.vm).length,
  };
  let visible = base;
  if (search.trim()) {
    const q = search.toLowerCase();
    visible = visible.filter((p) => p.name.toLowerCase().includes(q) || p.bed.includes(q));
  }
  if (smart === 'critico') visible = visible.filter((p) => p.gravity === 'critical');
  else if (smart === 'sofa_up') visible = visible.filter((p) => (p.deltaSofa || 0) > 0);
  else if (smart === 'dva') visible = visible.filter((p) => p.dva > 0);
  else if (smart === 'vm') visible = visible.filter((p) => p.vm);

  const criticos = PATIENTS.filter((p) => p.gravity === 'critical').length;
  const graves = PATIENTS.filter((p) => p.gravity === 'unstable').length;
  const selPatient = PATIENTS.find((p) => p.id === selected);

  if (!authed) return <window.Login onEnter={() => setAuthed(true)} />;

  const isHandoff = nav === 'handoff';

  const SMART = [
    { id: 'todos', label: 'Todos' },
    { id: 'critico', label: 'Críticos' },
    { id: 'sofa_up', label: 'Piora SOFA 24h' },
    { id: 'dva', label: 'Em DVA' },
    { id: 'vm', label: 'VM' },
  ];

  return (
    <div className="sasi-app">
      <window.Sidebar active={nav} onNav={(id) => { setNav(id); if (id !== 'handoff') setView(id === 'plantao' ? 'plantao' : view); }} />
      <div className="sasi-main">
        <window.TopBar
          title={isHandoff ? 'Passagem de Turno' : 'Gestão de Pacientes da UTI'}
          subtitle={isHandoff ? 'Síntese · Eixo Passagem' : 'Visão integrada · Síntese · Decisão'}
          criticos={criticos} warnings={3} theme={theme} onTheme={() => setTheme(theme === 'tactical' ? 'clinical' : 'tactical')}
        >
          {!isHandoff && (
            <>
              <Button size="sm" variant="success" icon={<i data-lucide="plus"></i>}>Novo Leito</Button>
              <Button size="sm" variant="secondary" icon={<i data-lucide="clipboard-copy"></i>}>Copiar</Button>
              <Button size="sm" variant="secondary" icon={<i data-lucide="file-down"></i>} onClick={() => setNav('handoff')}>PDF</Button>
              <SegmentedControl
                value={view} onChange={setView}
                options={[
                  { value: 'plantao', label: 'Cards', icon: <i data-lucide="layout-grid"></i> },
                  { value: 'round', label: 'Round', icon: <i data-lucide="list"></i> },
                  { value: 'editor', label: 'Tabela', icon: <i data-lucide="table"></i> },
                ]} />
            </>
          )}
        </window.TopBar>

        <div className="sasi-content">
          <div className="sasi-content__inner">
            {isHandoff ? (
              <window.Handoff patients={PATIENTS} onBack={() => setNav('plantao')} />
            ) : (
              <>
                {/* filter bar */}
                <div className="sasi-filters">
                  <div className="sasi-filters__stats">
                    <StatPill value={base.length} label="ativos" icon={<i data-lucide="users"></i>} />
                    {criticos > 0 && <StatPill value={criticos} label="críticos" tone="critical" active={smart === 'critico'} onClick={() => setSmart(smart === 'critico' ? 'todos' : 'critico')} />}
                    {graves > 0 && <StatPill value={graves} label="instáveis" tone="unstable" />}
                    <StatPill value={counts.sofa_up} label="↑SOFA" tone="critical" active={smart === 'sofa_up'} onClick={() => setSmart(smart === 'sofa_up' ? 'todos' : 'sofa_up')} />
                  </div>
                  <div className="sasi-search">
                    <i data-lucide="search"></i>
                    <input placeholder="Nome ou leito…" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <SegmentedControl
                    value={uti} onChange={setUti}
                    options={[{ value: 'TODAS', label: 'Todas' }, { value: 'UTI2', label: 'UTI2' }, { value: 'UTI3', label: 'UTI3' }, { value: 'UTI4', label: 'UTI4' }]} />
                </div>

                {/* smart pills */}
                <div className="sasi-pills">
                  {SMART.map((f) => (
                    <button key={f.id} className={`sasi-pill ${smart === f.id ? 'is-active' : ''}`} onClick={() => setSmart(f.id)}>
                      {f.label}
                      {f.id !== 'todos' && <span className="sasi-pill__count">{counts[f.id] ?? 0}</span>}
                    </button>
                  ))}
                </div>

                {visible.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                    <i data-lucide="bed-double" style={{ width: 32, height: 32 }}></i>
                    <p>Nenhum leito com esse filtro.</p>
                  </div>
                ) : view === 'plantao' ? (
                  <window.DashboardCards patients={visible} onSelect={setSelected} />
                ) : view === 'round' ? (
                  <window.RoundView patients={visible} onSelect={setSelected} />
                ) : (
                  <window.TableView patients={visible} onSelect={setSelected} />
                )}
              </>
            )}
          </div>
        </div>

        {!isHandoff && <button className="sasi-fab" title="Admitir paciente"><i data-lucide="plus"></i></button>}
      </div>

      {selPatient && (
        <window.PatientDetail patient={selPatient} onClose={() => setSelected(null)} onHandoff={() => { setSelected(null); setNav('handoff'); }} />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
setTimeout(() => window.lucide && window.lucide.createIcons(), 80);
