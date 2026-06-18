// ============================================================================
// SASI UI Kit — mock clinical data (fictional patients, fictional values)
// ============================================================================
const PATIENTS = [
  {
    id: 'p1', bed: '07', uti: 'UTI2', name: 'João Silva', age: 62, days: 4,
    gravity: 'stable', sofa: 4, deltaSofa: -1, septic: false,
    hd: 'Sepse de foco pulmonar, em desmame ventilatório',
    dva: 0, sed: 0, vm: true, vni: false, atb: true, pend: 1,
    problems: [
      { text: 'Sepse pulmonar em resolução', vetor: '↓', system: 'infecto' },
      { text: 'Desmame de VM (em TRE)', vetor: '↓', system: 'resp' },
    ],
    vitals: { pam: 78, fc: 88, spo2: 96, tax: '37.2', fr: 18, bh: '-420' },
    devices: ['VM (IOT D2)', 'CVC jugular D'],
    exame: 'RASS 0, desperto, colaborativo. MV+ bilateral, raros roncos em base D. Abdome flácido. Sem edema.',
    eventos: ['TRE 2h bem tolerado (07h)', 'FiO₂ reduzida 40→30%'],
    plano: [
      { sistema: 'resp', acao: 'Progredir desmame, TRE 2h', meta: 'Extubar até amanhã 12h' },
      { sistema: 'infecto', acao: 'D5 de Pip-Tazo', meta: 'Reavaliar descalonamento c/ cultura' },
    ],
  },
  {
    id: 'p2', bed: '08', uti: 'UTI2', name: 'Maria Oliveira', age: 58, days: 2,
    gravity: 'watcher', sofa: 6, deltaSofa: 1, septic: false,
    hd: 'Choque séptico de foco abdominal pós-laparotomia',
    dva: 1, sed: 1, vm: true, vni: false, atb: true, pend: 2,
    problems: [
      { text: 'Choque séptico foco abdominal', vetor: '=', system: 'hemo' },
      { text: 'Íleo paralítico pós-op', vetor: '=', system: 'tgi' },
    ],
    vitals: { pam: 68, fc: 102, spo2: 95, tax: '37.8', fr: 20, bh: '+680' },
    devices: ['VM (IOT D2)', 'CVC subclávia D', 'SVD', 'Dreno abdominal'],
    exame: 'RASS -2 sob sedação leve. Abdome distendido, RHA diminuídos, dreno com débito serossanguinolento 120 mL/24h.',
    eventos: ['Nora reduzida 0,18→0,10 (03h)', 'Lactato 4.1→2.4'],
    plano: [
      { sistema: 'hemo', acao: 'Titular noradrenalina', meta: 'PAM ≥ 65 mmHg' },
      { sistema: 'renal', acao: 'Reduzir aporte hídrico', meta: 'BH ≤ +500 mL em 24h' },
    ],
  },
  {
    id: 'p3', bed: '09', uti: 'UTI3', name: 'Carlos Mendes', age: 71, days: 9,
    gravity: 'critical', sofa: 13, deltaSofa: 3, septic: true,
    hd: 'IRA dialítica + SDRA grave, foco pulmonar',
    dva: 2, sed: 1, vm: true, vni: false, atb: true, pend: 3,
    problems: [
      { text: 'Choque séptico SCAI C, foco pulmonar', vetor: '↑', system: 'hemo' },
      { text: 'IRA KDIGO 3 em hemodiálise', vetor: '=', system: 'renal' },
      { text: 'SDRA moderada-grave', vetor: '↑', system: 'resp' },
    ],
    vitals: { pam: 58, fc: 128, spo2: 89, tax: '38.7', fr: 28, bh: '+1240' },
    devices: ['VM (IOT D7)', 'CVC + cateter de HD', 'PAi radial', 'SVD'],
    exame: 'RASS -4. Mal perfundido, TEC 4s, livedo em joelhos. MV+ com estertores difusos. Anúrico entre sessões de HD.',
    eventos: ['↑Nora + associada vasopressina (01h)', 'Hipoxemia SpO₂ 85% → pronação considerada', 'HD antecipada para hoje 10h'],
    plano: [
      { sistema: 'hemo', acao: 'Nora + Vaso; avaliar dobutamina se SvO₂↓', meta: 'PAM ≥ 65, lactato em queda' },
      { sistema: 'resp', acao: 'VM protetora, prona se P/F < 150', meta: 'SpO₂ 90-94%, driving ≤ 15' },
      { sistema: 'renal', acao: 'HD diária, balanço negativo', meta: 'BH negativo 1000 mL/24h' },
    ],
  },
  {
    id: 'p4', bed: '10', uti: 'UTI3', name: 'Ana Costa', age: 45, days: 1,
    gravity: 'unstable', sofa: 9, deltaSofa: 2, septic: false,
    hd: 'Pós-PCR / choque cardiogênico, ECMO VA',
    dva: 2, sed: 1, vm: true, vni: false, atb: false, pend: 2,
    problems: [
      { text: 'Choque cardiogênico pós-PCR, ECMO VA', vetor: '↑', system: 'hemo' },
      { text: 'Encefalopatia anóxica a esclarecer', vetor: '=', system: 'neuro' },
    ],
    vitals: { pam: 62, fc: 110, spo2: 97, tax: '36.4', fr: 16, bh: '+300' },
    devices: ['ECMO VA', 'VM (IOT D1)', 'IABP', 'PAi femoral'],
    exame: 'RASS -5 (sedação profunda). Pupilas isocóricas fotorreagentes. MMII frios, pulsos pediosos presentes com ECMO.',
    eventos: ['Canulação ECMO VA sem intercorrências (22h)', 'Ecocardiograma: FE 15%'],
    plano: [
      { sistema: 'hemo', acao: 'Flow ECMO 4.2 L/min, weaning lento', meta: 'Lactato < 2, SvO₂ ≥ 65%' },
      { sistema: 'neuro', acao: 'EEG + RM crânio', meta: 'Prognóstico neuro em 72h' },
    ],
  },
  {
    id: 'p5', bed: '03', uti: 'UTI2', name: 'Pedro Almeida', age: 67, days: 6,
    gravity: 'stable', sofa: 3, deltaSofa: 0, septic: false,
    hd: 'DPOC exacerbado, em VNI intermitente',
    dva: 0, sed: 0, vm: false, vni: true, atb: true, pend: 0,
    problems: [{ text: 'DPOC exacerbado em melhora', vetor: '↓', system: 'resp' }],
    vitals: { pam: 84, fc: 78, spo2: 93, tax: '36.9', fr: 19, bh: '-150' },
    devices: ['VNI intermitente', 'AVP'],
    exame: 'Desperto, orientado. Tiragem leve em uso de VNI. Sibilos esparsos bilaterais em desmame.',
    eventos: ['VNI espaçada 4/4h→6/6h', 'Tolerou ar ambiente 30 min'],
    plano: [{ sistema: 'resp', acao: 'Espaçar VNI, fisioterapia', meta: 'SpO₂ ≥ 92% em ar ambiente' }],
  },
  {
    id: 'p6', bed: '05', uti: 'UTI4', name: 'Rosa Lima', age: 79, days: 3,
    gravity: 'watcher', sofa: 5, deltaSofa: -1, septic: false,
    hd: 'AVCi extenso, NIHSS 14, em vigilância neuro',
    dva: 0, sed: 0, vm: false, vni: false, atb: false, pend: 1,
    problems: [{ text: 'AVCi MCD, vigilância de HIC', vetor: '=', system: 'neuro' }],
    vitals: { pam: 96, fc: 72, spo2: 97, tax: '36.6', fr: 17, bh: '+120' },
    devices: ['SNE', 'AVP'],
    exame: 'Sonolenta, abre olhos ao chamado. Hemiparesia E grau 2, disartria. NIHSS 14 mantido.',
    eventos: ['Escala neuro 2/2h sem piora', 'PAS máx 168 — sem necessidade de nicardipina'],
    plano: [{ sistema: 'neuro', acao: 'Controle pressórico, escala neuro 2/2h', meta: 'PAS < 180, sem piora NIHSS' }],
  },
  {
    id: 'p7', bed: '11', uti: 'UTI4', name: 'Antônio Reis', age: 54, days: 12,
    gravity: 'unstable', sofa: 10, deltaSofa: 1, septic: true,
    hd: 'Pancreatite necrosante infectada, SDMO',
    dva: 1, sed: 1, vm: true, vni: false, atb: true, pend: 4,
    problems: [
      { text: 'Pancreatite necrosante infectada', vetor: '↑', system: 'infecto' },
      { text: 'Disfunção de múltiplos órgãos', vetor: '=', system: 'hemo' },
    ],
    vitals: { pam: 64, fc: 116, spo2: 92, tax: '38.9', fr: 24, bh: '+920' },
    devices: ['VM (IOT D9)', 'CVC', 'PAi', 'SVD', 'Dreno percutâneo'],
    exame: 'RASS -3. Abdome tenso, doloroso à palpação difusa. Dreno percutâneo com débito purulento 80 mL.',
    eventos: ['Febre 38.9° persistente', 'Nova coleção drenada por radiologia (14h)'],
    plano: [
      { sistema: 'infecto', acao: 'Meropenem D6 + cobertura fúngica', meta: 'Afebril 48h, PCR em queda' },
      { sistema: 'hemo', acao: 'Ressuscitação guiada por metas', meta: 'PAM ≥ 65, diurese > 0.5 mL/kg/h' },
    ],
  },
  {
    id: 'p8', bed: '02', uti: 'UTI2', name: 'Luiza Faria', age: 33, days: 1,
    gravity: 'stable', sofa: 2, deltaSofa: 0, septic: false,
    hd: 'Pós-operatório de neurocirurgia eletiva, observação',
    dva: 0, sed: 0, vm: false, vni: false, atb: false, pend: 0,
    problems: [{ text: 'PO neurocirúrgico estável', vetor: '=', system: 'neuro' }],
    vitals: { pam: 88, fc: 70, spo2: 99, tax: '36.5', fr: 15, bh: '-80' },
    devices: ['AVP', 'Dreno subgaleal'],
    exame: 'Desperta, Glasgow 15, sem déficits. Ferida operatória limpa, dreno subgaleal com débito mínimo.',
    eventos: ['Sem intercorrências noturnas', 'Dieta liberada e aceita'],
    plano: [{ sistema: 'neuro', acao: 'Vigilância neuro, analgesia', meta: 'Alta para enfermaria em 24h' }],
  },
];

// Labs for the "tabelão" serial table (last 6 days)
const LAB_DAYS = ['06/05', '07/05', '08/05', '09/05', '10/05', '11/05'];
const LABS = [
  { k: 'Leucócitos', unit: '×10³', vals: [14.2, 16.0, 18.7, 15.4, 12.6, 11.8], flag: (v) => (v > 12 ? 'high' : v < 4 ? 'low' : 'ok') },
  { k: 'PCR', unit: 'mg/dL', vals: [18.0, 16.7, 14.2, 11.4, 9.1, 7.6], flag: (v) => (v > 5 ? 'high' : 'ok') },
  { k: 'Lactato', unit: 'mmol/L', vals: [3.8, 4.1, 3.2, 2.4, 1.9, 1.6], flag: (v) => (v > 2 ? 'high' : 'ok') },
  { k: 'Creatinina', unit: 'mg/dL', vals: [2.1, 2.6, 3.1, 2.8, 2.2, 1.9], flag: (v) => (v > 1.3 ? 'high' : 'ok') },
  { k: 'Plaquetas', unit: '×10³', vals: [180, 142, 98, 110, 134, 156], flag: (v) => (v < 100 ? 'low' : 'ok') },
  { k: 'pH', unit: '', vals: ['7.28', '7.31', '7.35', '7.38', '7.40', '7.41'], flag: (v) => (parseFloat(v) < 7.35 ? 'high' : 'ok') },
];

window.SASI_DATA = { PATIENTS, LAB_DAYS, LABS };
