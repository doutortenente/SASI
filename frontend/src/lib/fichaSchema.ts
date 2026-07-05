// ─────────────────────────────────────────────────────────────────────────
// Adapter de schema da Ficha  ⇄  esquema canônico (ingest)
//
// PROBLEMA (débito "evolucoes 2 schemas"): a FichaCompleta edita campos com
// nomes próprios (pas1/pas2, spo2 único, tmax, dx, na, hb1, leuco1) enquanto o
// resto do app (VitalsLabsPanel, TableView, PatientModal, exportText,
// clinicalExtract) lê o esquema do ingest (pas_max/pas_min, spo2_max/min,
// hemo.glic_max, hemo.temp_max, hemato.leuco, renal.na_serico…).
// Resultado: gravar por um lado deixava o outro vazio.
//
// SOLUÇÃO: o BANCO guarda UM só esquema — o canônico (ingest, Máx–Mín, o
// dominante). A Ficha adapta na entrada (canonicalToFicha) e na saída
// (fichaToCanonical). A UI da ficha e os demais consumidores não mudam.
//
// Convenção: na ficha, k1 = MÁXIMO, k2 = MÍNIMO (renderiza "máx - mín").
// Cross-system: glicemia e temperatura moram em `hemo` no canônico; leucócitos
// em `hemato`. Na ficha, dx∈tgi, tmax∈infecto, leuco1∈infecto.
// ─────────────────────────────────────────────────────────────────────────

type Obj = Record<string, unknown>;
type Evol = Record<string, unknown> | null | undefined;

const sys = (e: Evol, k: string): Obj => ((e && (e as Obj)[k]) as Obj) ?? {};

/** primeiro valor definido (≠ null/undefined/'') dentre as chaves */
function pick(o: Obj, ...keys: string[]): unknown {
  for (const k of keys) {
    const v = o[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}
/** copia só as chaves de texto/passthrough presentes */
function keep(o: Obj, keys: string[]): Obj {
  const out: Obj = {};
  for (const k of keys) if (o[k] !== undefined) out[k] = o[k];
  return out;
}
const HEMO_KEEP = ['ausculta', 'pele', 'notas', 'obs', 'perfusao',
  'pasX180', 'pasX100', 'padX120', 'padX50', 'pamX130', 'pamX65', 'fcX100'];
const RESP_KEEP = ['suporte', 'ausculta', 'notas', 'obs', 'vmModo', 'vmPeep', 'vmFio2',
  'vmVc', 'vmPinspPs', 'pao2', 'vazaoO2', 'fio2O2', 'dataIntubacao', 'spo2X', 'frX'];
const TGI_KEEP = ['abdome', 'notas', 'obs', 'dietaOutra', 'bb', 'aceitacao', 'vazaoDieta',
  'evacuacoesNum', 'evacuacoesDataUltima', 'evacuacoesAspecto', 'evacuou', 'dxX180'];
const RENAL_KEEP = ['bh', 'diurese', 'diureseHoras', 'tipoDiurese', 'notas', 'obs', 'trrc',
  'cr2', 'cr3', 'ur2', 'ur3', 'mg', 'cai'];
const HEMATO_KEEP = ['notas', 'obs', 'inr', 'profilaxiaTvp', 'profilaxiaUlcera', 'plaqUnit'];
const INFECTO_KEEP = ['atbs', 'culturas', 'notas', 'obs', 'atb', 'tmaxX38'];
const NEURO_KEEP = ['pupilas', 'analgesia', 'camIcu', 'escalas', 'notas', 'obs',
  'gcs', 'rass', 'sedacao'];

/** CANÔNICO (ingest) → drafts da FICHA */
export function canonicalToFicha(evol: Evol): Record<string, Obj> {
  const h = sys(evol, 'hemo'), r = sys(evol, 'resp'), t = sys(evol, 'tgi'),
    rn = sys(evol, 'renal'), hm = sys(evol, 'hemato'), inf = sys(evol, 'infecto'),
    n = sys(evol, 'neuro');

  const hemo: Obj = {
    ...keep(h, HEMO_KEEP),
    pas1: pick(h, 'pas_max', 'pas1', 'pa_sys_max'), pas2: pick(h, 'pas_min', 'pas2', 'pa_sys_min'),
    pad1: pick(h, 'pad_max', 'pad1', 'pa_dia_max'), pad2: pick(h, 'pad_min', 'pad2', 'pa_dia_min'),
    // pam: canônico pam_max/pam_min; legado usava pam2=MÁX / pam1=MÍN
    pam1: pick(h, 'pam_max', 'pam2'), pam2: pick(h, 'pam_min', 'pam1'),
    fc1: pick(h, 'fc_max', 'fc1'), fc2: pick(h, 'fc_min', 'fc2'),
  };
  const resp: Obj = {
    ...keep(r, RESP_KEEP),
    fr1: pick(r, 'fr_max', 'fr1'), fr2: pick(r, 'fr_min', 'fr2'),
    spo2: pick(r, 'spo2', 'spo2_min'), // pior valor
  };
  const tgi: Obj = {
    ...keep(t, TGI_KEEP),
    viaDieta: pick(t, 'viaDieta', 'dieta'),
    dx: pick(t, 'dx', 'glic_max') ?? pick(h, 'glic_max', 'dx_max'),
  };
  const renal: Obj = {
    ...keep(rn, RENAL_KEEP),
    na: pick(rn, 'na', 'na_serico'), k: pick(rn, 'k', 'k_serico'),
    ur1: pick(rn, 'ur1', 'ur'), cr1: pick(rn, 'cr1'),
  };
  const hemato: Obj = {
    ...keep(hm, HEMATO_KEEP),
    hb1: pick(hm, 'hb1', 'hb'), ht1: pick(hm, 'ht1', 'ht'), plaq1: pick(hm, 'plaq1'),
  };
  const infecto: Obj = {
    ...keep(inf, INFECTO_KEEP),
    tmax: pick(inf, 'tmax') ?? pick(h, 'temp_max', 'tmax'),
    leuco1: pick(inf, 'leuco1') ?? pick(hm, 'leuco'),
  };
  const neuro: Obj = { ...keep(n, NEURO_KEEP) };
  return { hemo, resp, tgi, renal, hemato, infecto, neuro };
}

/** drafts da FICHA → CANÔNICO (ingest), para gravar */
export function fichaToCanonical(d: Record<string, Obj>): Record<string, Obj> {
  const h = d.hemo ?? {}, r = d.resp ?? {}, t = d.tgi ?? {}, rn = d.renal ?? {},
    hm = d.hemato ?? {}, inf = d.infecto ?? {}, n = d.neuro ?? {};

  const hemo: Obj = {
    ...keep(h, HEMO_KEEP),
    pas_max: pick(h, 'pas1'), pas_min: pick(h, 'pas2'),
    pad_max: pick(h, 'pad1'), pad_min: pick(h, 'pad2'),
    pam_max: pick(h, 'pam1'), pam_min: pick(h, 'pam2'),
    fc_max: pick(h, 'fc1'), fc_min: pick(h, 'fc2'),
    glic_max: pick(t, 'dx'),          // glicemia mora no hemo no canônico
    temp_max: pick(inf, 'tmax'),      // temperatura idem
  };
  const resp: Obj = {
    ...keep(r, RESP_KEEP),
    fr_max: pick(r, 'fr1'), fr_min: pick(r, 'fr2'),
    spo2_min: pick(r, 'spo2'), spo2_max: pick(r, 'spo2'),
  };
  const tgi: Obj = { ...keep(t, TGI_KEEP), dieta: pick(t, 'viaDieta') };
  const renal: Obj = {
    ...keep(rn, RENAL_KEEP),
    na_serico: pick(rn, 'na'), k_serico: pick(rn, 'k'),
    ur: pick(rn, 'ur1'), cr1: pick(rn, 'cr1'),
  };
  const hemato: Obj = {
    ...keep(hm, HEMATO_KEEP),
    hb: pick(hm, 'hb1'), ht: pick(hm, 'ht1'), plaq1: pick(hm, 'plaq1'),
    leuco: pick(inf, 'leuco1'),       // leucócitos moram no hemato no canônico
  };
  const infecto: Obj = { ...keep(inf, INFECTO_KEEP) };
  const neuro: Obj = { ...keep(n, NEURO_KEEP) };
  return { hemo, resp, tgi, renal, hemato, infecto, neuro };
}
