import { describe, expect, it } from 'vitest';
import { buildSofaAuto, type SofaDiarioRow } from './scores/sofaAuto.js';

function row(partial: Partial<SofaDiarioRow>): SofaDiarioRow {
  return {
    paciente_id: 'p1',
    dia: '2026-07-11',
    s_resp: null,
    s_coag: null,
    s_liver: null,
    s_cardio: null,
    s_neuro: null,
    s_renal: null,
    sofa_parcial: 0,
    componentes_presentes: 0,
    componentes_faltantes: [],
    ...partial,
  };
}

describe('buildSofaAuto', () => {
  it('6/6 completo: rótulo cheio, sem faltantes, valor = sofa_parcial', () => {
    const hoje = row({
      s_resp: 2, s_coag: 1, s_liver: 0, s_cardio: 3, s_neuro: 1, s_renal: 2,
      sofa_parcial: 9, componentes_presentes: 6,
    });
    const r = buildSofaAuto(hoje, null);
    expect(r.rotulo).toBe('SOFA (6/6): 9');
    expect(r.valor).toBe(9);
    expect(r.completo).toBe(true);
    expect(r.chips.every((c) => c.faltante === undefined)).toBe(true);
  });

  it('parcial 2/6: rótulo parcial + faltantes certos nos 4 ausentes', () => {
    const hoje = row({
      s_resp: 2, s_cardio: 1,
      sofa_parcial: 3, componentes_presentes: 2,
    });
    const r = buildSofaAuto(hoje, null);
    expect(r.rotulo).toBe('SOFA parcial (2/6): 3');
    expect(r.valor).toBe(3);
    expect(r.completo).toBe(false);
    const bySigla = Object.fromEntries(r.chips.map((c) => [c.sigla, c]));
    expect(bySigla.Resp.faltante).toBeUndefined();
    expect(bySigla.Cardio.faltante).toBeUndefined();
    expect(bySigla.Coag.faltante).toBe('sem plaquetas');
    expect(bySigla.Hep.faltante).toBe('sem bilirrubina');
    expect(bySigla.Neuro.faltante).toBe('sem GCS');
    expect(bySigla.Renal.faltante).toBe('sem creatinina/diurese');
  });

  it('sem dados do dia: hoje null → rótulo genérico, valor null, chips todos faltantes', () => {
    const r = buildSofaAuto(null, null);
    expect(r.rotulo).toBe('SOFA: sem dados do dia');
    expect(r.valor).toBeNull();
    expect(r.completo).toBe(false);
    expect(r.chips.every((c) => c.faltante !== undefined)).toBe(true);
  });

  it('sem dados do dia: componentes_presentes=0 (linha existe mas vazia)', () => {
    const hoje = row({ componentes_presentes: 0, sofa_parcial: 0 });
    const r = buildSofaAuto(hoje, null);
    expect(r.rotulo).toBe('SOFA: sem dados do dia');
    expect(r.valor).toBeNull();
  });

  it('Δ com baseline igual: mesmos componentes presentes → valor = hoje - ontem', () => {
    const hoje = row({
      s_resp: 2, s_coag: 1, s_liver: 0, s_cardio: 3, s_neuro: 1, s_renal: 2,
      sofa_parcial: 9, componentes_presentes: 6,
    });
    const ontem = row({
      s_resp: 1, s_coag: 1, s_liver: 0, s_cardio: 2, s_neuro: 1, s_renal: 2,
      sofa_parcial: 7, componentes_presentes: 6,
      dia: '2026-07-10',
    });
    const r = buildSofaAuto(hoje, ontem);
    expect(r.delta).toEqual({ tipo: 'valor', valor: 2 });
  });

  it('Δ não comparável: conjuntos de componentes presentes diferem entre os dias', () => {
    const hoje = row({
      s_resp: 2, s_coag: 1, s_liver: 0, s_cardio: 3,
      sofa_parcial: 6, componentes_presentes: 4,
    });
    const ontem = row({
      s_resp: 1, s_coag: 1, s_liver: 0, s_cardio: 2, s_neuro: 1,
      sofa_parcial: 5, componentes_presentes: 5,
      dia: '2026-07-10',
    });
    const r = buildSofaAuto(hoje, ontem);
    expect(r.delta).toEqual({ tipo: 'nao-comparavel' });
  });

  it('Δ sem baseline: ontem null', () => {
    const hoje = row({
      s_resp: 2, s_coag: 1, s_liver: 0, s_cardio: 3, s_neuro: 1, s_renal: 2,
      sofa_parcial: 9, componentes_presentes: 6,
    });
    const r = buildSofaAuto(hoje, null);
    expect(r.delta).toEqual({ tipo: 'sem-baseline' });
  });

  it('Δ sem baseline: ontem é linha REAL mas com 0 componentes (não é "nao-comparavel")', () => {
    const hoje = row({
      s_resp: 2, s_cardio: 1,
      sofa_parcial: 3, componentes_presentes: 2,
    });
    const ontem = row({ componentes_presentes: 0, sofa_parcial: 0, dia: '2026-07-10' });
    const r = buildSofaAuto(hoje, ontem);
    expect(r.delta).toEqual({ tipo: 'sem-baseline' });
  });

  it('Δ sem baseline: hoje 6/6 e ontem linha-vazia (furo do fiscal — não pode virar "nao-comparavel")', () => {
    const hoje = row({
      s_resp: 2, s_coag: 1, s_liver: 0, s_cardio: 3, s_neuro: 1, s_renal: 2,
      sofa_parcial: 9, componentes_presentes: 6,
    });
    const ontem = row({ componentes_presentes: 0, sofa_parcial: 0, dia: '2026-07-10' });
    const r = buildSofaAuto(hoje, ontem);
    expect(r.delta.tipo).toBe('sem-baseline');
    expect(r.delta.tipo).not.toBe('nao-comparavel');
  });

  it('chips seguem sempre a ordem fixa Resp/Coag/Hep/Cardio/Neuro/Renal', () => {
    const r = buildSofaAuto(null, null);
    expect(r.chips.map((c) => c.sigla)).toEqual(['Resp', 'Coag', 'Hep', 'Cardio', 'Neuro', 'Renal']);
  });
});
