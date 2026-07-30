// ============================================================================
// SASI UI Kit — PatientDetail: a ficha estruturada
//   Ordem de leitura clínica (decisão primeiro, referência depois):
//   3 Situação Atual (eixo estado) + Avaliação por sistemas (eixo problema)
//   → Problemas Ativos ⇄ Condutas 12-24h (1:1, dose + meta — eixo ação)
//   → 2 Paciente Sumário / HPMA + tabelão (eixo tempo, referência)
// ============================================================================
const _D = window.SASIComandoUTIDesignSystem_157e25;

function PatientDetail({ patient, onClose, onHandoff }) {
  const p = patient;
  const v = p.vitals;
  const { Card, GravityBadge, SofaBadge, TherapyBadge, VitalStat, SystemPanel, ProblemRow, Button } = _D;
  const { LAB_DAYS, LABS } = window.SASI_DATA;

  const SYS_LABEL = { neuro: 'Neuro', resp: 'Resp', hemo: 'Hemo', tgi: 'TGI', renal: 'Renal', hemato: 'Hemato', infecto: 'Infecto', geral: 'Geral' };

  // Pareamento 1:1 — cada problema ativo recebe sua conduta (por sistema, senão por índice)
  const usados = new Set();
  const pares = p.problems.map((pr, i) => {
    let c = p.plano.find((x, j) => x.sistema === pr.system && !usados.has(j) && (usados.add(j) || true));
    if (!c && p.plano[i] && !usados.has(i)) { c = p.plano[i]; usados.add(i); }
    return { problema: pr, conduta: c || null };
  });

  // Laboratório do dia = última coluna do tabelão
  const labsDia = LABS.map((row) => {
    const val = row.vals[row.vals.length - 1];
    return { k: row.k, v: val, f: row.flag(val) };
  });

  return (
    <div className="sasi-overlay" onClick={onClose}>
      <div className="sasi-modal sasi-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="sasi-modal__head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <span className="sasi-mono" style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>Leito {p.bed}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}, {p.age}</div>
              <div className="sasi-muted" style={{ fontSize: 'var(--text-xs)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.uti} · Dia UTI {p.days} · {p.hd}</div>
            </div>
          </div>
          <div className="sasi-wrap" style={{ flexShrink: 0 }}>
            <GravityBadge level={p.gravity} />
            <SofaBadge score={p.sofa} delta={p.deltaSofa} />
            <Button size="sm" variant="secondary" icon={<i data-lucide="clipboard-list"></i>} onClick={onHandoff}>Passagem</Button>
            <button className="sasi-modal__close" onClick={onClose}><i data-lucide="x"></i></button>
          </div>
        </div>

        <div className="sasi-modal__body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* 3 — SITUAÇÃO ATUAL (eixo estado) */}
            <Card number="3" eyebrow="Eixo Estado" title="Situação Atual">
              <div className="sasi-section-title">Sinais vitais & balanço 24h</div>
              <div className="sasi-wrap" style={{ marginBottom: 14 }}>
                <VitalStat label="PAM" value={v.pam} status={v.pam < 65 ? 'low' : 'ok'} />
                <VitalStat label="FC" value={v.fc} status={v.fc > 110 ? 'high' : 'ok'} />
                <VitalStat label="SpO₂" value={v.spo2} unit="%" status={v.spo2 < 92 ? 'low' : 'ok'} />
                <VitalStat label="TAX" value={v.tax} unit="°" status={parseFloat(v.tax) > 38 ? 'high' : 'ok'} />
                <VitalStat label="FR" value={v.fr} status={v.fr > 24 ? 'high' : 'ok'} />
                <VitalStat label="BH" value={v.bh} status={String(v.bh).startsWith('+') ? 'pos' : 'neg'} />
              </div>

              <div className="sasi-section-title">Laboratório do dia</div>
              <div className="sasi-wrap" style={{ marginBottom: 14 }}>
                {labsDia.map((l) => (
                  <span key={l.k} style={{ display: 'inline-flex', alignItems: 'baseline', gap: 5, background: 'var(--surface-raised)', borderRadius: 'var(--radius-sm)', padding: '4px 9px', fontSize: 'var(--text-xs)' }}>
                    <span className="sasi-muted">{l.k}</span>
                    <b className="sasi-mono" style={{ color: l.f === 'high' ? 'var(--grav-critical-solid)' : l.f === 'low' ? 'var(--sys-resp)' : 'var(--text-heading)' }}>{l.v}</b>
                  </span>
                ))}
              </div>

              <div className="sasi-section-title">Terapias vigentes & dispositivos</div>
              <div className="sasi-wrap" style={{ marginBottom: 8 }}>
                {p.dva > 0 && <TherapyBadge type="dva" count={p.dva} />}
                {p.sed > 0 && <TherapyBadge type="sed" count={p.sed} />}
                {p.vm && <TherapyBadge type="vm" />}
                {p.vni && <TherapyBadge type="vni" />}
                {p.atb && <TherapyBadge type="atb" />}
              </div>
              <ul style={{ margin: '0 0 14px', paddingLeft: 16, fontSize: 'var(--text-xs)', color: 'var(--text-body)', lineHeight: 1.7 }}>
                {p.devices.map((d, i) => <li key={i}>{d}</li>)}
              </ul>

              <div className="sasi-section-title">Exame físico</div>
              <p style={{ margin: '0 0 14px', fontSize: 'var(--text-xs)', color: 'var(--text-body)', lineHeight: 1.6 }}>{p.exame}</p>

              <div className="sasi-section-title">Eventos 24h</div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 'var(--text-xs)', color: 'var(--text-body)', lineHeight: 1.7 }}>
                {(p.eventos || []).map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </Card>

            {/* 4 — AVALIAÇÃO POR SISTEMAS (eixo problema) */}
            <Card number="4" eyebrow="Eixo Problema" title="Avaliação por sistemas">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {p.problems.map((pr, i) => (
                  <SystemPanel key={i} system={pr.system || 'hemo'} title={SYS_LABEL[pr.system] || 'Hemo'}>
                    <ProblemRow text={pr.text} vetor={pr.vetor} />
                  </SystemPanel>
                ))}
              </div>
              <div className="sasi-section-title" style={{ marginTop: 14 }}>Impressão clínica</div>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-body)', lineHeight: 1.6 }}>
                {p.hd}. {p.deltaSofa > 0 ? `Em piora — SOFA subiu ${p.deltaSofa} em 24h.` : p.deltaSofa < 0 ? `Em melhora — SOFA caiu ${Math.abs(p.deltaSofa)} em 24h.` : 'Estável em relação às últimas 24h.'}
              </p>
            </Card>

            {/* PROBLEMAS ⇄ CONDUTAS 1:1 (eixo ação) */}
            <Card eyebrow="Eixo Ação" title="Problemas Ativos ⇄ Condutas 12–24h" style={{ gridColumn: '1 / -1' }}
                  action={<Button size="sm" variant="primary" icon={<i data-lucide="file-down"></i>} onClick={onHandoff}>Exportar PDF</Button>}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 24px 1.2fr', gap: 10, padding: '0 2px 7px' }}>
                  <span className="sasi-section-title" style={{ margin: 0 }}>Problema ativo</span>
                  <span></span>
                  <span className="sasi-section-title" style={{ margin: 0 }}>Conduta · dose + meta numérica</span>
                </div>
                {pares.map(({ problema, conduta }, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 24px 1.2fr', gap: 10, alignItems: 'center', padding: '10px 2px', borderTop: '1px solid var(--border-subtle)' }}>
                    <ProblemRow text={problema.text} vetor={problema.vetor} system={SYS_LABEL[problema.system]} />
                    <i data-lucide="arrow-right" style={{ width: 15, height: 15, color: 'var(--text-faint)' }}></i>
                    {conduta ? (
                      <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', borderLeft: '3px solid var(--sys-' + (conduta.sistema || 'hemo') + '-bar)', borderRadius: 'var(--radius-md)', padding: '8px 11px' }}>
                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 3 }}>{conduta.acao}</div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 'var(--text-2xs)', color: 'var(--success)', fontWeight: 700 }}>
                          <i data-lucide="target" style={{ width: 11, height: 11 }}></i> META: {conduta.meta}
                        </div>
                      </div>
                    ) : (
                      <button style={{ background: 'none', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '10px', color: 'var(--text-faint)', fontSize: 'var(--text-xs)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                        + Definir conduta para este problema
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* 2 — PACIENTE SUMÁRIO (eixo tempo — referência) */}
            <Card number="2" eyebrow="Eixo Tempo · HPMA & Tabelão" title="Paciente Sumário" style={{ gridColumn: '1 / -1' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-body)', margin: '0 0 12px', lineHeight: 'var(--leading-snug)' }}>
                {p.name}, {p.age} anos, admitido há {p.days} dias por <b style={{ color: 'var(--text-heading)' }}>{p.hd.toLowerCase()}</b>. Acompanhamento serial do laboratório abaixo.
              </p>
              <table className="sasi-labs">
                <thead>
                  <tr><th>Exame</th>{LAB_DAYS.map((d) => <th key={d}>{d}</th>)}</tr>
                </thead>
                <tbody>
                  {LABS.map((row) => (
                    <tr key={row.k}>
                      <td>{row.k}</td>
                      {row.vals.map((val, i) => {
                        const f = row.flag(val);
                        return <td key={i} className={f === 'high' ? 'lab-high' : f === 'low' ? 'lab-low' : ''}>{val}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PatientDetail });
