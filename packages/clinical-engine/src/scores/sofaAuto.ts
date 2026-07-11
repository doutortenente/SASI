// ============================================================================
// SOFA automático — deriva rótulo/chips/Δ da view Supabase `vw_sofa_diario`.
// Função PURA: recebe as linhas já buscadas (hoje/ontem), zero I/O aqui.
// Doutrina ZERO ALUCINAÇÃO: componente ausente vira null + chip "faltante",
// nunca 0 implícito; parcial se diz parcial.
// ============================================================================

/** Espelha as colunas da view `vw_sofa_diario` (security_invoker). */
export interface SofaDiarioRow {
  paciente_id: string;
  dia: string; // date (YYYY-MM-DD)
  s_resp: number | null;
  s_coag: number | null;
  s_liver: number | null;
  s_cardio: number | null;
  s_neuro: number | null;
  s_renal: number | null;
  sofa_parcial: number | null;
  componentes_presentes: number;
  componentes_faltantes: string[];
}

export type SofaAutoDeltaTipo = 'valor' | 'nao-comparavel' | 'sem-baseline';

export interface SofaAutoDelta {
  tipo: SofaAutoDeltaTipo;
  valor?: number;
}

export interface SofaAutoChip {
  sistema: string;
  sigla: string;
  valor: number | null;
  faltante?: string;
}

export interface SofaAutoResult {
  rotulo: string;
  valor: number | null;
  completo: boolean;
  chips: SofaAutoChip[];
  delta: SofaAutoDelta;
}

const TOTAL_COMPONENTES = 6;

type ComponenteKey = 's_resp' | 's_coag' | 's_liver' | 's_cardio' | 's_neuro' | 's_renal';

interface ChipDef {
  sistema: string;
  sigla: string;
  key: ComponenteKey;
  faltante: string;
}

// Ordem fixa Resp/Coag/Hep/Cardio/Neuro/Renal (doutrina de UI).
const CHIP_DEFS: ChipDef[] = [
  { sistema: 'Respiratório', sigla: 'Resp', key: 's_resp', faltante: 'sem PaO2' },
  { sistema: 'Coagulação', sigla: 'Coag', key: 's_coag', faltante: 'sem plaquetas' },
  { sistema: 'Hepático', sigla: 'Hep', key: 's_liver', faltante: 'sem bilirrubina' },
  { sistema: 'Cardiovascular', sigla: 'Cardio', key: 's_cardio', faltante: 'sem PAM/vasopressor' },
  { sistema: 'Neurológico', sigla: 'Neuro', key: 's_neuro', faltante: 'sem GCS' },
  { sistema: 'Renal', sigla: 'Renal', key: 's_renal', faltante: 'sem creatinina/diurese' },
];

function buildChips(row: SofaDiarioRow | null): SofaAutoChip[] {
  return CHIP_DEFS.map((def) => {
    const valor = row ? row[def.key] : null;
    if (valor == null) {
      return { sistema: def.sistema, sigla: def.sigla, valor: null, faltante: def.faltante };
    }
    return { sistema: def.sistema, sigla: def.sigla, valor };
  });
}

/** Conjunto (nomes de coluna) dos componentes presentes numa linha. */
function componentesPresentesSet(row: SofaDiarioRow): Set<ComponenteKey> {
  const set = new Set<ComponenteKey>();
  for (const def of CHIP_DEFS) {
    if (row[def.key] != null) set.add(def.key);
  }
  return set;
}

function mesmoConjunto(a: Set<ComponenteKey>, b: Set<ComponenteKey>): boolean {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

/**
 * Δ entre hoje e ontem. Regra (só coberta explicitamente p/ ontem):
 * - falta hoje OU falta ontem (sem dado pra basear a comparação) → 'sem-baseline'.
 * - conjuntos de componentes presentes DIFERENTES entre os dias → 'nao-comparavel'
 *   (comparar sofa_parcial de bases distintas seria alucinar precisão).
 * - conjuntos iguais → 'valor' = hoje.sofa_parcial − ontem.sofa_parcial.
 */
function buildDelta(hoje: SofaDiarioRow | null, ontem: SofaDiarioRow | null): SofaAutoDelta {
  if (!ontem || !hoje || (hoje.componentes_presentes ?? 0) === 0) {
    return { tipo: 'sem-baseline' };
  }
  const setHoje = componentesPresentesSet(hoje);
  const setOntem = componentesPresentesSet(ontem);
  if (!mesmoConjunto(setHoje, setOntem)) {
    return { tipo: 'nao-comparavel' };
  }
  if (hoje.sofa_parcial == null || ontem.sofa_parcial == null) {
    return { tipo: 'nao-comparavel' };
  }
  return { tipo: 'valor', valor: hoje.sofa_parcial - ontem.sofa_parcial };
}

export function buildSofaAuto(
  hoje: SofaDiarioRow | null,
  ontem: SofaDiarioRow | null
): SofaAutoResult {
  const chips = buildChips(hoje);
  const semDados = !hoje || (hoje.componentes_presentes ?? 0) === 0;
  const completo = !semDados && hoje!.componentes_presentes === TOTAL_COMPONENTES;

  let rotulo: string;
  let valor: number | null;

  if (semDados) {
    rotulo = 'SOFA: sem dados do dia';
    valor = null;
  } else if (completo) {
    rotulo = `SOFA (6/6): ${hoje!.sofa_parcial}`;
    valor = hoje!.sofa_parcial;
  } else {
    rotulo = `SOFA parcial (${hoje!.componentes_presentes}/6): ${hoje!.sofa_parcial}`;
    valor = hoje!.sofa_parcial;
  }

  return {
    rotulo,
    valor,
    completo,
    chips,
    delta: buildDelta(hoje, ontem),
  };
}
