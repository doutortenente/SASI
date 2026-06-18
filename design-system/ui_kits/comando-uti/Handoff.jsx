// ============================================================================
// SASI UI Kit — Handoff / Passagem de Turno (the "Export PDF" synthesis)
//   Per leito: 1 síntese · 1 mudanças que impactam conduta · 1 pendências/riscos
// ============================================================================
function Handoff({ patients, onBack }) {
  const { Button, GravityBadge, SofaBadge } = window.SASIComandoUTIDesignSystem_157e25;
  const CHANGES = {
    p1: ['TRE 2h bem tolerado, reduzido FiO₂ para 30%'],
    p2: ['Lactato em queda (4.1→2.4), nora reduzida para 0,10'],
    p3: ['↑SOFA +3, iniciada 2ª DVA; SDRA com P/F 130'],
    p4: ['Flow ECMO mantido 4.2; lactato 3.8, sem clareamento'],
    p5: ['VNI espaçada para 6/6h, tolerando ar ambiente 30 min'],
    p6: ['PA controlada, NIHSS estável em 14'],
    p7: ['Nova coleção drenada; febre 38.9 persistente'],
    p8: ['Acordado, sem déficit; programada alta enfermaria'],
  };
  const RISKS = {
    p1: ['Aguardar gasometria pós-extubação'],
    p2: ['Vigiar débito do dreno · risco de re-laparotomia'],
    p3: ['Cultura de hemato pendente 48h · risco de PCR'],
    p4: ['Decisão de weaning ECMO em discussão · cuidados de fim de vida?'],
    p5: ['Vigiar fadiga respiratória'],
    p6: ['TC de controle amanhã · risco de transformação hemorrágica'],
    p7: ['Antibiograma pendente · prová­vel ajuste de ATB'],
    p8: ['Sem pendências'],
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div className="sasi-wrap">
          <Button variant="ghost" size="sm" icon={<i data-lucide="arrow-left"></i>} onClick={onBack}>Voltar</Button>
          <span className="sasi-muted" style={{ fontSize: 'var(--text-sm)' }}>{patients.length} leitos ativos · UTI 2/3/4</span>
        </div>
        <div className="sasi-wrap">
          <Button variant="secondary" size="sm" icon={<i data-lucide="clipboard-copy"></i>}>Copiar texto</Button>
          <Button variant="primary" size="sm" icon={<i data-lucide="file-down"></i>}>Exportar PDF</Button>
        </div>
      </div>

      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        {patients.map((p, idx) => (
          <div key={p.id} style={{ padding: '14px 18px', borderTop: idx ? '1px solid var(--border-subtle)' : 'none', display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 5 }}>
                <span className="sasi-mono" style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)' }}>{p.bed}</span>
                <span className="sasi-mono sasi-muted" style={{ fontSize: 10 }}>{p.uti}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-heading)' }}>{p.name}, {p.age}</div>
              <div className="sasi-wrap" style={{ marginTop: 6 }}>
                <GravityBadge level={p.gravity} size="sm" />
                <SofaBadge score={p.sofa} delta={p.deltaSofa} showIcon={false} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <HandoffLine n="1" tone="accent" label="Síntese" items={[`${p.hd}`]} />
              <HandoffLine n="2" tone="warning" label="Muda conduta" items={CHANGES[p.id] || []} />
              <HandoffLine n="3" tone="danger" label="Pendências / Riscos" items={RISKS[p.id] || []} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HandoffLine({ n, tone, label, items }) {
  const c = { accent: 'var(--accent)', warning: 'var(--warning)', danger: 'var(--danger)' }[tone];
  return (
    <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
      <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: 'var(--radius-sm)', background: c, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{n}</span>
      <div style={{ minWidth: 0 }}>
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: c, marginRight: 8 }}>{label}</span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{items.join(' · ') || '—'}</span>
      </div>
    </div>
  );
}

Object.assign(window, { Handoff });
