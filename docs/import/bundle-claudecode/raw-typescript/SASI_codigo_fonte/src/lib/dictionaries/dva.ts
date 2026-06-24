// ============================================================================
// dictionaries/dva.ts
// ----------------------------------------------------------------------------
// Dicionário de Drogas Vasoativas (DVAs) com diluições padrão brasileiras.
// Factor = concentração em mcg/ml (para tipos mcg/kg/min e mcg/min)
//          ou U/ml (para vasopressina)
//
// SOFA Threshold: Nor/Epi ≥ 0.1 mcg/kg/min = SOFA Cardio 4
// Consulte constants/thresholds.ts DVA.NOR_SOFA4_THRESHOLD
// ============================================================================

export interface DilucaoEntry {
  label: string;
  factor: number;
  type: 'mcg/kg/min' | 'U/min' | 'mcg/min' | 'mcg/kg/h' | 'mg/kg/h';
}

export interface DVAEntry {
  diluicoes: DilucaoEntry[];
  min: number;
  max: number;
  isSofaVasopressor: boolean;  // conta pra SOFA Cardio (nor/epi/dopa/vaso)
  sofaThreshold?: number;       // threshold para SOFA 4 (mcg/kg/min)
  observacao?: string;
}

export const DVA_DICT: Record<string, DVAEntry> = {
  'Noradrenalina': {
    diluicoes: [
      { label: 'Padrão (16mg/250ml — 64 mcg/ml)',     factor: 64,  type: 'mcg/kg/min' },
      { label: 'Simples (8mg/250ml — 32 mcg/ml)',      factor: 32,  type: 'mcg/kg/min' },
      { label: 'Concentrada (32mg/250ml — 128 mcg/ml)', factor: 128, type: 'mcg/kg/min' },
    ],
    min: 0.01, max: 2.0,
    isSofaVasopressor: true,
    sofaThreshold: 0.1,
    observacao: 'Vasopressor de primeira linha no choque séptico (SEPSIS-3). Meta PAM ≥ 65 mmHg.',
  },

  'Adrenalina': {
    diluicoes: [
      { label: 'Padrão (16mg/250ml — 64 mcg/ml)', factor: 64, type: 'mcg/kg/min' },
      { label: 'Simples (8mg/250ml — 32 mcg/ml)', factor: 32, type: 'mcg/kg/min' },
    ],
    min: 0.01, max: 2.0,
    isSofaVasopressor: true,
    sofaThreshold: 0.1,
    observacao: 'Uso em choque refratário, anafilaxia, PCR. Monitorar lactato (estimula glicogenólise).',
  },

  'Dopamina': {
    diluicoes: [
      { label: 'Padrão (400mg/250ml — 1600 mcg/ml)', factor: 1600, type: 'mcg/kg/min' },
    ],
    min: 2.0, max: 20.0,
    isSofaVasopressor: true,
    sofaThreshold: 15.0,
    observacao: 'SOFA Cardio 2 se ≤5 mcg/kg/min, 3 se >5, 4 se >15. Uso controverso vs Nor (De Backer NEJM 2010).',
  },

  'Dobutamina': {
    diluicoes: [
      { label: 'Padrão (250mg/250ml — 1000 mcg/ml)', factor: 1000, type: 'mcg/kg/min' },
    ],
    min: 2.0, max: 20.0,
    isSofaVasopressor: true,  // conta como SOFA 2 (dobutamina isolada = qualquer dose)
    sofaThreshold: undefined,
    observacao: 'Inotrópico. SOFA Cardio 2 em qualquer dose. Combinar com Nor no choque misto.',
  },

  'Vasopressina': {
    diluicoes: [
      { label: 'Padrão (20U/100ml — 0.2 U/ml)', factor: 0.2, type: 'U/min' },
    ],
    min: 0.01, max: 0.04,
    isSofaVasopressor: true,
    observacao: 'Dose fixa 0.03-0.04 U/min. Não titular. Adjuvante ao Nor no choque séptico (VASST trial). Não conta no SOFA Cardio pelas diretrizes originais mas assume-se DVA ativa.',
  },

  'Nipride (Nitroprussiato)': {
    diluicoes: [
      { label: 'Padrão (50mg/250ml — 200 mcg/ml)', factor: 200, type: 'mcg/kg/min' },
    ],
    min: 0.1, max: 10.0,
    isSofaVasopressor: false,
    observacao: 'Vasodilatador. Risco de toxicidade por tiocianato em infusão prolongada ou IR. Proteger da luz.',
  },

  'Tridil (Nitroglicerina)': {
    diluicoes: [
      { label: 'Padrão (50mg/250ml — 200 mcg/ml)', factor: 200, type: 'mcg/min' },
    ],
    min: 5.0, max: 200.0,
    isSofaVasopressor: false,
    observacao: 'Vasodilatador venoarterial. SCA, EPA hipertensivo. Taquifilaxia após 24-48h.',
  },

  'Esmolol': {
    diluicoes: [
      { label: 'Padrão (2500mg/250ml — 10 mg/ml = 10000 mcg/ml)', factor: 10000, type: 'mcg/kg/min' },
    ],
    min: 50.0, max: 300.0,
    isSofaVasopressor: false,
    observacao: 'Beta-1 seletivo, meia-vida 9 min. Controle de FC em FA/flutter. Cuidado em choque — não usar se PA instável.',
  },

  'Milrinona': {
    diluicoes: [
      { label: 'Padrão (20mg/100ml — 200 mcg/ml)', factor: 200, type: 'mcg/kg/min' },
    ],
    min: 0.375, max: 0.75,
    isSofaVasopressor: false,
    observacao: 'Inibidor PDE-3. Inotrópico/vasodilatador. Útil em IC refratária, PH. Eliminação renal — ajustar em IRA.',
  },

  'Fenilefrina': {
    diluicoes: [
      { label: 'Padrão (10mg/100ml — 100 mcg/ml)', factor: 100, type: 'mcg/kg/min' },
    ],
    min: 0.1, max: 3.0,
    isSofaVasopressor: true,
    sofaThreshold: undefined,
    observacao: 'Alfa-1 puro. Reflex bradycardia. Útil em taquicardia + hipotensão sem depressão miocárdica.',
  },
};

export const DVA_NAMES = Object.keys(DVA_DICT);
