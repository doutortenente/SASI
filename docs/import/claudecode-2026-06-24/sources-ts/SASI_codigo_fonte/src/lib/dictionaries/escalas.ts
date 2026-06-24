// ============================================================================
// dictionaries/escalas.ts — Escalas neurológicas e de sedação
// ============================================================================

export interface EscalaInfo {
  desc: string;
  min: number;
  max: number;
  ranges?: Array<{ label: string; min: number; max: number; color?: string }>;
}

export const ESCALAS_NEURO_DICT: Record<string, EscalaInfo> = {
  'ECG (Glasgow)': {
    desc: 'Ocular(1-4), Verbal(1-5), Motora(1-6). Score: 3 a 15.',
    min: 3, max: 15,
    ranges: [
      { label: 'Normal',   min: 15, max: 15, color: 'green'  },
      { label: 'Leve',     min: 13, max: 14, color: 'yellow' },
      { label: 'Moderado', min: 9,  max: 12, color: 'orange' },
      { label: 'Grave',    min: 3,  max: 8,  color: 'red'    },
    ],
  },
  'RASS': {
    desc: 'Agitação (+4 a +1) | Acordado (0) | Sedação (-1 a -5).',
    min: -5, max: 4,
    ranges: [
      { label: 'Combativo',      min: 4,  max: 4,  color: 'red'    },
      { label: 'Muito agitado',  min: 3,  max: 3,  color: 'red'    },
      { label: 'Agitado',        min: 2,  max: 2,  color: 'orange' },
      { label: 'Inquieto',       min: 1,  max: 1,  color: 'yellow' },
      { label: 'Alerta/calmo',   min: 0,  max: 0,  color: 'green'  },
      { label: 'Sonolento',      min: -1, max: -1, color: 'blue'   },
      { label: 'Leve sedação',   min: -2, max: -2, color: 'blue'   },
      { label: 'Sed. moderada',  min: -3, max: -3, color: 'purple' },
      { label: 'Sed. profunda',  min: -4, max: -4, color: 'purple' },
      { label: 'Não-responsivo', min: -5, max: -5, color: 'gray'   },
    ],
  },
  'FOUR': {
    desc: 'Olhos(0-4), Motor(0-4), Tronco(0-4), Resp(0-4). Score: 0 a 16.',
    min: 0, max: 16,
  },
  'NIHSS': {
    desc: 'Déficit neurológico/AVC. Score: 0 a 42. ≥16 = grave.',
    min: 0, max: 42,
    ranges: [
      { label: 'Mínimo', min: 1,  max: 4,  color: 'green'  },
      { label: 'Leve',   min: 5,  max: 15, color: 'yellow' },
      { label: 'Grave',  min: 16, max: 20, color: 'orange' },
      { label: 'M.Grave',min: 21, max: 42, color: 'red'    },
    ],
  },
  'Ramsay': {
    desc: 'Sedação clínica. 1=ansioso, 2=cooperante, 3=responde a comandos, 4=resp voz alta, 5=resp estímulo, 6=irresponsivo.',
    min: 1, max: 6,
  },
  'CAM-ICU': {
    desc: 'Delirium em UTI. Positivo = delirium presente.',
    min: 0, max: 1,
  },
};

export const ESCALAS_NAMES = Object.keys(ESCALAS_NEURO_DICT);
