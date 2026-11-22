// Banco de mentira para conferir as telas: só dados fictícios (o paciente do leito 03 das prévias do design).
const http = require('http');
const partes = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false }).formatToParts(new Date());
const g = (t) => partes.find((x) => x.type === t).value;
const HOJE = `${g('year')}-${g('month')}-${g('day')}`; const HORA = Number(g('hour')) % 24;
const dia = (n) => { const d = new Date(HOJE + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const TURNO = HORA >= 7 && HORA < 19 ? 'diurna' : 'noturna'; const PLANTAO = TURNO === 'noturna' && HORA < 7 ? dia(-1) : HOJE;
const ddmm = (iso) => iso.slice(8, 10) + '/' + iso.slice(5, 7);
const pac = (id, n, nome, idade, sexo, peso, alt, grav, hd, extra = {}) => ({ id, leito: 'UTI2-L' + n, uti: 'UTI2', status_leito: 'ativo', nome, idade, sexo, peso, altura: alt, gravidade: grav, hd, alergias: null, isolation: 'none', data_adm: dia(-4), ...extra });
const J = (pid, tipo, i, max, min, na, la, nb, lb) => ({ paciente_id: pid, tipo, janela_fim: dia(-i) + 'T07:00:00-03:00', valor_max: max, valor_min: min, n_total: 12, n_fora_alto: na, n_fora_baixo: nb, limiar_alto: la, limiar_baixo: lb });
const janelas = [];
const base = { pas: [118, 84, 0, 180, 2, 90], pad: [58, 41, 0, 120, 3, 45], pam: [78, 56, 0, 130, 5, 65], fc: [124, 96, 9, 100, 0, null], fr: [28, 18, 3, 25, 0, null], spo2: [96, 89, 0, null, 0, 88], temp: [38.6, 37.2, 4, 38, 0, null], dx: [212, 148, 2, 180, 0, null] };
for (const [t, [mx, mn, na, la, nb, lb]] of Object.entries(base)) for (let i = 0; i < 5; i++) janelas.push(J('p03', t, i, i ? +(mx * (1 - i * 0.03)).toFixed(1) : mx, i ? +(mn * (1 + i * 0.04)).toFixed(1) : mn, i ? 0 : na, la, i ? 0 : nb, lb));
janelas.push(J('p01', 'pam', 0, 82, 61, 0, 130, 2, 65), J('p01', 'fc', 0, 118, 92, 6, 100, 0, null), J('p01', 'spo2', 0, 97, 92, 0, null, 0, 88));
const ev = (tipo, i, v, un) => ({ paciente_id: 'p03', tipo, ts: dia(-i) + 'T06:00:00-03:00', valor_num: v, unidade: un });
const labs = { hb: [7.6, 7.8, 8.4], ht: [23, 23, 25], plaq: [91, 98, 142], leuco: [19.4, 18.9, 16.8], ur: [81, 76, 58], cr: [2.6, 2.4, 1.6], na: [133, 134, 136], k: [5.7, 5.4, 5.1], mg: [1.7, 1.8, 1.8], cai: [1.10, null, 1.14], ph: [7.25, 7.27, 7.29], pco2: [47, 46, 44], hco3: [16, 17, 18], lactato: [null, 4.1, 2.8], pf_ratio: [138, 142, 186], bb: [2.1, null, 1.4], inr: [1.6, 1.6, 1.4], pcr: [236, 248, 210] };
const eventos = [ev('bh_acumulado', 0, 4500, 'mL')];
for (const [t, vs] of Object.entries(labs)) vs.forEach((v, i) => { if (v != null) eventos.push(ev(t, i, v, null)); });
eventos.sort((a, b) => a.ts.localeCompare(b.ts));
const V = (codigo, categoria, rotulo, sigla, un) => ({ codigo, categoria, rotulo, sigla, unidade_padrao: un, ordem: 1 });
const T = {
  pacientes: [
    pac('p01', '01', 'Maria Aparecida Lima', 54, 'feminino', 66, 160, 'instavel', 'Pancreatite aguda grave\nHipertensão intra-abdominal', { data_adm: dia(-2) }),
    pac('p03', '03', 'José Ribeiro Matos', 67, 'masculino', 78, 172, 'critico', 'Choque séptico de foco pulmonar\nSDRA moderada\nLRA KDIGO 2\nBacteremia por K. pneumoniae', { alergias: 'dipirona', isolation: 'contact' }),
    pac('p05', '05', 'Francisca Souza Neves', 61, 'feminino', 70, 158, 'watcher', 'LRA KDIGO 3 em TRS; Hipervolemia', { data_adm: dia(-6) }),
    pac('p10', '10', 'Paulo Henrique Dias', 45, 'masculino', 82, 178, 'estavel', '1. PO de colectomia por neoplasia de cólon', { data_adm: dia(-5), alergias: 'nega' }),
  ],
  internacoes: ['p01', 'p03', 'p05', 'p10'].map((id, i) => ({ paciente_id: id, int_uti_data: dia([-2, -4, -6, -5][i]), desfecho: null })),
  pendencias: [
    { id: 'pe1', paciente_id: 'p03', tarefa: 'Ecocardiograma à beira-leito', prioridade: 1, concluida: false, created_at: '1' },
    { id: 'pe2', paciente_id: 'p03', tarefa: 'Lactato e gasometria às 9h', prioridade: 1, concluida: false, created_at: '2' },
    { id: 'pe3', paciente_id: 'p03', tarefa: 'Discutir TRS com a nefrologia', prioridade: 2, concluida: false, created_at: '3' },
    { id: 'pe4', paciente_id: 'p01', tarefa: 'TC de abdome com contraste', prioridade: 1, concluida: false, created_at: '4' },
  ],
  janelas_24h: janelas,
  vw_dias_atb_ativo: [{ paciente_id: 'p03', atb_id: 'a1', droga: 'Meropeném', dias_terapia: 3, data_inicio: dia(-2) }, { paciente_id: 'p03', atb_id: 'a2', droga: 'Vancomicina', dias_terapia: 3, data_inicio: dia(-2) }],
  vw_dispositivos_ativos: [['iot', 'tubo 8,0', -4], ['cvc', 'jugular interna D', -4], ['arterial', 'radial E', -3], ['svd', null, -4], ['sne', 'pós-pilórica', -3]].map(([tipo, sitio, n]) => ({ paciente_id: 'p03', tipo, sitio, data_inicio: dia(n) })),
  dispositivo_episodios: [['iot', 'tubo 8,0', -4], ['cvc', 'jugular interna D', -4], ['arterial', 'radial E', -3], ['svd', null, -4], ['sne', 'pós-pilórica', -3]].map(([tipo, sitio, n], i) => ({ id: 'd' + i, paciente_id: 'p03', tipo, sitio, data_inicio: dia(n), data_fim: null })),
  atbs: [
    { id: 'a9', paciente_id: 'p01', droga: 'Piperacilina-tazobactam', dose: '4,5 g', via: 'EV', frequencia: '6/6 h', data_inicio: dia(-1), data_fim: null, intencao: 'empirica', foco: null, duracao_planejada_dias: null },
    { id: 'a8', paciente_id: 'p01', droga: 'Meropeném', dose: '1 g', via: 'EV', frequencia: '8/8 h', data_inicio: dia(-9), data_fim: dia(-5), intencao: 'empirica', foco: null, duracao_planejada_dias: null },
    { id: 'a0', paciente_id: 'p03', droga: 'Ceftriaxona', dose: '2 g', via: 'EV', frequencia: '1x/dia', data_inicio: dia(-4), data_fim: dia(-3), intencao: 'empirica', foco: null, duracao_planejada_dias: null },
    { id: 'a1', paciente_id: 'p03', droga: 'Meropeném', dose: '1 g', via: 'EV', frequencia: '8/8 h', data_inicio: dia(-2), data_fim: null, intencao: 'dirigida', foco: 'Pulmonar', duracao_planejada_dias: 7 },
    { id: 'a2', paciente_id: 'p03', droga: 'Vancomicina', dose: '1,5 g', via: 'EV', frequencia: '12/12 h', data_inicio: dia(-2), data_fim: null, intencao: 'empirica', foco: 'Pulmonar', duracao_planejada_dias: null },
  ],
  culturas: [
    { id: 'c1', paciente_id: 'p03', material: 'hemocultura', coleta_ts: dia(-3) + 'T10:00:00-03:00', laudo_ts: dia(-1) + 'T10:00:00-03:00', crescimento: true, agente: 'K. pneumoniae', ufc_por_ml: null, observacoes: '2 amostras', antibiograma: [['Meropeném', 'S'], ['Amicacina', 'S'], ['Polimixina B', 'S'], ['Pip-tazo', 'R'], ['Ceftriaxona', 'R'], ['Ciprofloxacino', 'R']].map(([antibiotico, resultado]) => ({ antibiotico, resultado })) },
    { id: 'c2', paciente_id: 'p03', material: 'aspirado_traqueal', coleta_ts: dia(-3) + 'T10:00:00-03:00', laudo_ts: dia(-1) + 'T10:00:00-03:00', crescimento: true, agente: 'K. pneumoniae', ufc_por_ml: 1000000, observacoes: null, antibiograma: [] },
    { id: 'c3', paciente_id: 'p03', material: 'urocultura', coleta_ts: dia(-3) + 'T10:00:00-03:00', laudo_ts: dia(-1) + 'T10:00:00-03:00', crescimento: false, agente: null, ufc_por_ml: null, observacoes: null, antibiograma: [] },
    { id: 'c4', paciente_id: 'p03', material: 'hemocultura', coleta_ts: HOJE + 'T05:00:00-03:00', laudo_ts: null, crescimento: false, agente: null, ufc_por_ml: null, observacoes: 'controle', antibiograma: [] },
  ],
  eventos_clinicos: eventos,
  evolucoes: [
    { id: 'e3', paciente_id: 'p03', data_plantao: PLANTAO, turno: TURNO, data_evolucao: new Date().toISOString(), updated_at: new Date().toISOString(),
      neuro: { meta_rass: -4, rass: -4, analgesia: 'Adequada', pupilas: 'Isocóricas e fotorreagentes', deficit_focal: 'Não avaliável' },
      resp: { suporte: 'VM', via: 'IOT', modo: 'PCV', peep: 12, fio2: 60, pinsp: 18, vc_obtido: 420, pao2: 83, ausculta: 'Alterada', ausculta_achados: { 'Crepitações': ['Base D', 'Base E'] }, exame: 'texto antigo do registro' },
      hemo: { ritmo: 'Sinusal', tec_s: 4, extremidades: 'Frias', pulsos: 'Finos', ausculta: 'BNF 2T sem sopros', edema: '1+', edema_onde: ['MMII'] },
      tgi: { dieta: 'Enteral', dieta_via: 'SNE', dieta_vazao_ml_h: 20, evacuacoes: 'Não', evacuacao_ultima: ddmm(dia(-2)), abdome: 'Flácido, RHA +' },
      renal: { diurese_via: 'SVD', diurese_ml: 540, diurese_h: 24, bh_24h_ml: 1240, trs: 'Não' },
      hemato: { profilaxia_tvp: 'Enoxaparina 40 mg SC 1x/dia', profilaxia_lamg: 'Pantoprazol 40 mg EV 1x/dia' }, infecto: { seg: 82, bast: 9, foco: 'Pulmonar' },
      dvas: [{ droga: 'Noradrenalina', diluicao: '128 mcg/mL', vazao_ml_h: 11.7, dose: 0.32, unidade: 'mcg/kg/min' }, { droga: 'Vasopressina', diluicao: '0,4 UI/mL', vazao_ml_h: 4.5, dose: 0.03, unidade: 'UI/min' }],
      sedativos: [{ droga: 'Fentanil', diluicao: '50 mcg/mL', vazao_ml_h: 2, dose: 100, unidade: 'mcg/h' }, { droga: 'Midazolam', diluicao: '1 mg/mL', vazao_ml_h: 5, dose: 5, unidade: 'mg/h' }],
      intercorrencias: ['Noradrenalina aumentada de 0,18 para 0,32 mcg/kg/min', 'Associada vasopressina 0,03 UI/min às 21h', 'PEEP elevada para 12 por queda da P/F', 'Colhida hemocultura de controle'],
      impressao: ['Choque séptico de foco pulmonar; noradrenalina em escalada', 'SDRA moderada; P/F em queda', 'LRA KDIGO 2, oligúrica; creatinina em ascensão', 'Bacteremia por K. pneumoniae; meropeném dirigido pelo antibiograma', 'Anemia; hemoglobina em queda'],
      condutas_sistemas: [['Cardio-hemodinâmica', 'Manter PAM acima de 65; noradrenalina em titulação'], ['Resp', 'PEEP 12; prona se P/F abaixo de 150'], ['Renal', 'Discutir TRS se K acima de 6 ou diurese abaixo de 0,3 mL/kg/h'], ['Infecto', 'Meropeném até D7; suspender vancomicina hoje'], ['Hemato', 'Enoxaparina 40 mg SC 1x/dia']].map(([sistema, texto]) => ({ sistema, texto })), prescricao: { cardiovascular: ['Hidrocortisona 50 mg EV 6/6 h'], gastro_endocrino: ['Pantoprazol 40 mg EV 1x/dia'], sintomaticos_sn: ['Paracetamol 750 mg SNE até 6/6 h'] } },
    { id: 'e5', paciente_id: 'p05', data_plantao: dia(TURNO === 'noturna' && HORA < 7 ? -2 : -1), turno: 'diurna', data_evolucao: dia(-1) + 'T12:00:00Z', updated_at: dia(-1) + 'T12:00:00Z',
      neuro: {}, resp: { suporte: 'CNAF', fluxo_l_min: 40, fio2: 50 }, hemo: {}, tgi: { dieta: 'Oral' }, renal: { trs: 'Intermitente', uf_ml: 2000 }, hemato: {}, infecto: { foco: 'Urinário' }, dvas: [], sedativos: [], intercorrencias: ['TRS com UF de 2.000 mL, sem intercorrências'], impressao: [], condutas_sistemas: [], prescricao: {} },
  ],
  evento_tipo_ref: [V('hb', 'hemato', 'Hemoglobina', 'Hb', 'g/dL'), V('ht', 'hemato', 'Hematócrito', 'Ht', '%'), V('plaq', 'hemato', 'Plaquetas', 'Plaq', '×10³/µL'), V('leuco', 'hemato', 'Leucócitos', null, '×10³/µL'), V('inr', 'hemato', 'INR', null, ''), V('ur', 'renal', 'Ureia', null, 'mg/dL'), V('cr', 'renal', 'Creatinina', null, 'mg/dL'), V('na', 'renal', 'Sódio', 'Na', 'mEq/L'), V('k', 'renal', 'Potássio', 'K', 'mEq/L'), V('mg', 'renal', 'Magnésio', 'Mg', 'mg/dL'), V('cai', 'renal', 'Cálcio iônico', 'Cai', 'mmol/L'), V('ph', 'gaso', 'pH arterial', 'pH', ''), V('pco2', 'gaso', 'pCO₂', 'pCO2', 'mmHg'), V('hco3', 'gaso', 'Bicarbonato', 'HCO3', 'mEq/L'), V('lactato', 'gaso', 'Lactato', null, 'mmol/L'), V('pf_ratio', 'gaso', 'P/F', 'P/F', ''), V('pcr', 'infecto', 'Proteína C reativa', null, 'mg/L'), V('procalcitonina', 'infecto', 'Procalcitonina', null, 'ng/mL'), V('bb', 'infecto', 'Bilirrubina total', null, 'mg/dL')],
  alert_rules: [['k', 'gt', 5.5, 'warning'], ['k', 'gt', 6, 'critical'], ['lactato', 'gt', 2, 'warning'], ['lactato', 'gte', 4, 'critical'], ['ur', 'gte', 70, 'warning'], ['ht', 'lt', 24, 'warning'], ['pf_ratio', 'lte', 200, 'warning'], ['pf_ratio', 'lte', 100, 'critical']].map(([tipo_evento, comparador, limiar, severidade]) => ({ tipo_evento, comparador, limiar, severidade, ativo: true })),
};
const escritas = []; // tudo que a tela mandou gravar, para a conferência ler
http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const h = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*', 'content-type': 'application/json' };
  if (req.method === 'OPTIONS') { res.writeHead(204, h); return res.end(); }
  if (u.pathname === '/_escritas') { if (req.method === 'DELETE') escritas.length = 0; res.writeHead(200, h); return res.end(JSON.stringify(escritas)); }
  if (u.pathname.startsWith('/rest/v1/rpc/') && req.method === 'POST') {
    const fn = u.pathname.replace('/rest/v1/rpc/', ''); let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => {
      let corpo = null; try { corpo = b ? JSON.parse(b) : null; } catch (e) { corpo = b; }
      escritas.push({ metodo: 'RPC', tabela: 'rpc/' + fn, filtro: '', corpo }); console.log('RPC', fn, b.slice(0, 600));
      if (fn === 'dar_alta_paciente') { if (corpo && corpo.p_observacoes === 'FALHAR') { res.writeHead(400, h); return res.end(JSON.stringify({ code: 'P0001', message: 'Data do desfecho anterior à entrada na UTI.' })); } res.writeHead(200, h); return res.end(JSON.stringify('internacao-1')); }
      if (fn === 'transferir_leito') { if (corpo && corpo.p_leito === 'UTI2-L13') { res.writeHead(400, h); return res.end(JSON.stringify({ code: 'P0001', message: 'Leito de destino ocupado.' })); } res.writeHead(200, h); return res.end('null'); }
      res.writeHead(404, h); res.end(JSON.stringify({ message: 'sem função ' + fn, code: '404' }));
    });
    return;
  }
  const t = u.pathname.replace('/rest/v1/', '');
  let rows = T[t];
  if (!rows) { console.log('SEM TABELA', t); res.writeHead(404, h); return res.end(JSON.stringify({ message: 'sem tabela ' + t, code: '404' })); }
  if (req.method !== 'GET') { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => { console.log('ESCRITA', req.method, t, decodeURIComponent(u.search).slice(0, 60), b.slice(0, 2500)); let corpo = null; try { corpo = b ? JSON.parse(b) : null; } catch (e) { corpo = b; } escritas.push({ metodo: req.method, tabela: t, filtro: decodeURIComponent(u.search), corpo }); const um = (req.headers.accept || '').includes('vnd.pgrst.object'); const r = { id: 'novo' + Date.now() }; res.writeHead(req.method === 'POST' ? 201 : 200, h); res.end(JSON.stringify(um ? r : [r])); }); return; }
  for (const [k, v] of u.searchParams) { if (['select', 'order', 'limit', 'or', 'offset'].includes(k)) continue; const m = v.match(/^eq\.(.*)$/); if (m) rows = rows.filter((r) => String(r[k]) === m[1]); else if (v === 'is.null') rows = rows.filter((r) => r[k] == null); }
  const o = (u.searchParams.get('order') || '').split(',')[0].split('.');
  if (o[0]) rows = [...rows].sort((a, b) => String(a[o[0]] ?? '').localeCompare(String(b[o[0]] ?? '')) * (o[1] === 'desc' ? -1 : 1));
  res.writeHead(200, h); res.end(JSON.stringify(rows));
}).listen(54321, () => console.log('banco de mentira no ar', HOJE, TURNO, PLANTAO));
