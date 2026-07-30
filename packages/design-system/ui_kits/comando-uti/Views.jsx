// ============================================================================
// SASI UI Kit — view modes: Cards (Plantão), Round (Split), Tabela (Editor)
// ============================================================================
const NS = window.SASIComandoUTIDesignSystem_157e25;
const { LeitoCard, GravityBadge, SofaBadge, TherapyBadge, VitalStat, SystemPanel, Card } = NS;

// ---------- Cards / Plantão ----------
function DashboardCards({ patients, onSelect }) {
  return (
    <div className="sasi-grid">
      {patients.map((p) => (
        <LeitoCard
          key={p.id}
          bed={p.bed} uti={p.uti} name={p.name} age={p.age}
          gravity={p.gravity} sofa={p.sofa} deltaSofa={p.deltaSofa} septic={p.septic}
          problems={p.problems} dva={p.dva} sed={p.sed} vm={p.vm} vni={p.vni} atb={p.atb} pend={p.pend}
          onClick={() => onSelect(p.id)}
        />
      ))}
    </div>
  );
}

// ---------- Round / Split ----------
function RoundView({ patients, onSelect }) {
  const [sel, setSel] = React.useState(patients[0]?.id);
  const p = patients.find((x) => x.id === sel) || patients[0];
  const v = p.vitals;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 'calc(100vh - 240px)', overflowY: 'auto', paddingRight: 4 }}>
        {patients.map((x) => (
          <div key={x.id} style={{ borderRadius: 'var(--radius-xl)', outline: x.id === sel ? '2px solid var(--accent)' : 'none', opacity: x.id === sel ? 1 : 0.85 }}>
            <LeitoCard
              compact bed={x.bed} uti={x.uti} name={x.name} age={x.age}
              gravity={x.gravity} sofa={x.sofa} deltaSofa={x.deltaSofa}
              problems={x.problems} dva={x.dva} sed={x.sed} vm={x.vm} vni={x.vni} atb={x.atb} pend={x.pend}
              onClick={() => setSel(x.id)}
            />
          </div>
        ))}
      </div>
      <Card padded style={{ borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
          <span className="sasi-mono" style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-heading)' }}>{p.bed}</span>
          <span className="sasi-mono sasi-muted" style={{ fontSize: 11 }}>{p.uti}</span>
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: 'var(--text-md)', color: 'var(--text-heading)' }}>{p.name}, {p.age}</h2>
        <div className="sasi-wrap" style={{ marginBottom: 12 }}>
          <GravityBadge level={p.gravity} />
          <SofaBadge score={p.sofa} delta={p.deltaSofa} />
          <span className="sasi-muted" style={{ fontSize: 'var(--text-xs)' }}>D{p.days} · {p.age}a</span>
        </div>
        <div style={{ background: 'var(--surface-raised)', borderRadius: 'var(--radius-lg)', padding: '9px 12px', fontSize: 'var(--text-xs)', color: 'var(--text-body)', marginBottom: 12 }}>
          <b className="sasi-muted">HD:</b> {p.hd}
        </div>
        <div className="sasi-wrap" style={{ marginBottom: 14 }}>
          <VitalStat label="PAM" value={v.pam} status={v.pam < 65 ? 'low' : 'ok'} />
          <VitalStat label="FC" value={v.fc} status={v.fc > 110 ? 'high' : 'ok'} />
          <VitalStat label="SpO₂" value={v.spo2} unit="%" status={v.spo2 < 92 ? 'low' : 'ok'} />
          <VitalStat label="TAX" value={v.tax} unit="°" status={parseFloat(v.tax) > 38 ? 'high' : 'ok'} />
          <VitalStat label="FR" value={v.fr} status={v.fr > 24 ? 'high' : 'ok'} />
          <VitalStat label="BH" value={v.bh} status={String(v.bh).startsWith('+') ? 'pos' : 'neg'} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {p.problems.slice(0, 4).map((pr, i) => (
            <SystemPanel key={i} system={pr.system || 'hemo'}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-body)', fontWeight: 600 }}>{pr.vetor} {pr.text}</div>
            </SystemPanel>
          ))}
        </div>
        <button className="sasi-pill is-active" style={{ marginTop: 14 }} onClick={() => onSelect(p.id)}>
          <i data-lucide="maximize-2"></i> Abrir ficha completa
        </button>
      </Card>
    </div>
  );
}

// ---------- Tabela / Editor ----------
function TableView({ patients, onSelect }) {
  const cell = (val, status) => {
    const color = status === 'high' ? 'var(--grav-critical-solid)' : status === 'low' ? 'var(--sys-resp)' : 'var(--text-body)';
    return <td className="sasi-mono" style={{ color, fontWeight: status !== 'ok' ? 700 : 500 }}>{val ?? '—'}</td>;
  };
  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-default)', background: 'var(--surface-card)', boxShadow: 'var(--shadow-card)' }}>
      <table className="sasi-table">
        <thead>
          <tr>
            {['UTI', 'Leito', 'Paciente', 'Grav', 'SOFA', 'D', 'PAM', 'FC', 'SpO₂', 'TAX', 'FR', 'BH', 'DVA', 'Pend', 'Diagnóstico'].map((h) => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => {
            const v = p.vitals;
            return (
              <tr key={p.id} onClick={() => onSelect(p.id)}>
                <td className="sasi-mono sasi-muted" style={{ fontSize: 10 }}>{p.uti}</td>
                <td className="sasi-mono" style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{p.bed}</td>
                <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{p.name}</td>
                <td><GravityBadge level={p.gravity} size="sm" /></td>
                <td><SofaBadge score={p.sofa} delta={p.deltaSofa} showIcon={false} /></td>
                <td className="sasi-mono sasi-muted">D{p.days}</td>
                {cell(v.pam, v.pam < 65 ? 'low' : 'ok')}
                {cell(v.fc, v.fc > 110 ? 'high' : 'ok')}
                {cell(v.spo2 + '%', v.spo2 < 92 ? 'low' : 'ok')}
                {cell(v.tax + '°', parseFloat(v.tax) > 38 ? 'high' : 'ok')}
                {cell(v.fr, v.fr > 24 ? 'high' : 'ok')}
                {cell(v.bh, String(v.bh).startsWith('+') ? 'high' : 'low')}
                <td className="sasi-mono" style={{ fontWeight: 700, color: p.dva ? 'var(--grav-critical-solid)' : 'var(--text-faint)' }}>{p.dva || '—'}</td>
                <td className="sasi-mono" style={{ fontWeight: 700, color: p.pend ? 'var(--grav-watcher-text)' : 'var(--text-faint)' }}>{p.pend || '—'}</td>
                <td className="sasi-muted" style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 'var(--text-xs)' }}>{p.hd}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

Object.assign(window, { DashboardCards, RoundView, TableView });
