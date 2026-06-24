// SasiSynthesis — Problemas ativos + condutas por sistema (edição manual SASI v2.0)

import { useState } from 'react';
import { SasiProblemaAtivo, SasiCondutaSistema, Vetor, SystemKey } from '../lib/supabaseClient';
import { Plus, Trash2 } from 'lucide-react';

const SISTEMAS: SystemKey[] = ['neuro', 'resp', 'hemo', 'tgi', 'renal', 'hemato', 'infecto'];
const VETORES: Vetor[] = ['↑', '↓', '='];

interface Props {
  problemasAtivos: SasiProblemaAtivo[];
  condutasSistemas: SasiCondutaSistema[];
  onChange: (problemas: SasiProblemaAtivo[], condutas: SasiCondutaSistema[]) => void;
}

export default function SasiSynthesis({ problemasAtivos, condutasSistemas, onChange }: Props) {
  const [problemas, setProblemas] = useState<SasiProblemaAtivo[]>(problemasAtivos);
  const [condutas, setCondutas] = useState<SasiCondutaSistema[]>(condutasSistemas);

  const updateProblemas = (newProblemas: SasiProblemaAtivo[]) => {
    setProblemas(newProblemas);
    onChange(newProblemas, condutas);
  };

  const updateCondutas = (newCondutas: SasiCondutaSistema[]) => {
    setCondutas(newCondutas);
    onChange(problemas, newCondutas);
  };

  const metaSuggestions = [
    'PAM ≥ 65 mmHg',
    'Diurese > 0.5 ml/kg/h',
    'BH negativo nas próximas 24h',
    'Lactato em queda',
    'SvO2 venosa ≥ 65%',
    'SpO2 ≥ 94%',
  ];

  const addProblema = () => {
    updateProblemas([...problemas, { texto: '', vetor: null }]);
  };

  const updateProblema = (index: number, field: keyof SasiProblemaAtivo, value: SasiProblemaAtivo[keyof SasiProblemaAtivo]) => {
    const copy = [...problemas];
    copy[index] = { ...copy[index], [field]: value };
    updateProblemas(copy);
  };

  const removeProblema = (index: number) => {
    updateProblemas(problemas.filter((_, i) => i !== index));
  };

  const suggestVetor = (texto: string): Vetor | null => {
    const t = texto.toLowerCase();
    if (t.includes('piora') || t.includes('descompens') || t.includes('choque') || t.includes('crítica')) return '↑';
    if (t.includes('melhora') || t.includes('estável') || t.includes('resolução')) return '↓';
    return '=';
  };

  const addConduta = () => {
    updateCondutas([...condutas, { sistema: 'geral', texto: '', meta: '' }]);
  };

  const updateConduta = (index: number, field: keyof SasiCondutaSistema, value: SasiCondutaSistema[keyof SasiCondutaSistema]) => {
    const copy = [...condutas];
    copy[index] = { ...copy[index], [field]: value };
    updateCondutas(copy);
  };

  const removeConduta = (index: number) => {
    updateCondutas(condutas.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      <p className="text-xs text-app-text-muted">
        Síntese estruturada — edite manualmente ou traga do Claude (skill sasi-ingest-export) e cole nos campos.
      </p>

      <div>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h4 className="font-bold tx-danger text-sm tracking-widest">PROBLEMAS ATIVOS</h4>
            <p className="text-[10px] text-app-text-muted">Com vetor (↑ piora / ↓ melhora / = estável)</p>
          </div>
          <button
            onClick={addProblema}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-red-500/10 hover:bg-red-500/20 tx-danger rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Problema
          </button>
        </div>

        <div className="space-y-2">
          {problemas.map((p, i) => (
            <div key={i} className="flex gap-2 items-center bg-app-card border border-app-border hover:border-red-500/30 rounded-xl p-2 transition">
              <select
                value={p.vetor ?? ''}
                onChange={(e) => updateProblema(i, 'vetor', (e.target.value as Vetor) || null)}
                className="w-11 h-9 text-center text-xl font-black bg-app-tertiary border border-app-border rounded-lg focus:outline-none"
              >
                <option value="">·</option>
                {VETORES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>

              <input
                type="text"
                value={p.texto}
                onChange={(e) => {
                  const newText = e.target.value;
                  updateProblema(i, 'texto', newText);
                  if (!p.vetor && newText.length > 8) {
                    const suggested = suggestVetor(newText);
                    if (suggested) updateProblema(i, 'vetor', suggested);
                  }
                }}
                placeholder="Ex: Choque cardiogênico SCAI C em piora"
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />

              <select
                value={p.sistema ?? ''}
                onChange={(e) => updateProblema(i, 'sistema', e.target.value || undefined)}
                className="text-[10px] bg-app-tertiary border border-app-border rounded px-2 py-1"
              >
                <option value="">Sistema</option>
                {SISTEMAS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <button onClick={() => removeProblema(i)} className="text-red-400/70 hover:text-red-500 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        {problemas.length === 0 && <div className="text-xs text-app-text-muted italic pl-1">Nenhum problema ativo ainda.</div>}
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h4 className="font-bold tx-ok text-sm tracking-widest">CONDUTA POR SISTEMAS</h4>
            <p className="text-[10px] text-app-text-muted">Com meta numérica clara + prazo</p>
          </div>
          <button
            onClick={addConduta}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 tx-ok rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" /> Nova Conduta
          </button>
        </div>

        <div className="space-y-3">
          {condutas.map((c, i) => (
            <div key={i} className="bg-app-card border border-app-border rounded-xl p-3 space-y-2.5">
              <div className="flex gap-2 items-center">
                <select
                  value={c.sistema}
                  onChange={(e) => updateConduta(i, 'sistema', e.target.value)}
                  className="text-xs font-medium bg-app-tertiary border border-app-border rounded-lg px-2.5 py-1 min-w-[92px]"
                >
                  <option value="geral">GERAL</option>
                  {SISTEMAS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>

                <input
                  type="text"
                  value={c.texto}
                  onChange={(e) => updateConduta(i, 'texto', e.target.value)}
                  placeholder="Ação principal (ex: Titular noradrenalina para PAM alvo)"
                  className="flex-1 bg-transparent text-sm focus:outline-none border-b border-app-border pb-0.5"
                />

                <button onClick={() => removeConduta(i)} className="text-red-400/70 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] text-app-text-muted mb-0.5">META</div>
                  <input
                    type="text"
                    list={`meta-suggestions-${i}`}
                    value={c.meta || ''}
                    onChange={(e) => updateConduta(i, 'meta', e.target.value)}
                    placeholder="Ex: PAM ≥ 65 mmHg ou Diurese > 0.5 ml/kg/h"
                    className="w-full text-sm bg-app-tertiary/60 border border-app-border rounded-lg px-3 py-1.5"
                  />
                  <datalist id={`meta-suggestions-${i}`}>
                    {metaSuggestions.map((m, idx) => <option key={idx} value={m} />)}
                  </datalist>
                </div>
                <div>
                  <div className="text-[10px] text-app-text-muted mb-0.5">PRAZO</div>
                  <input
                    type="text"
                    value={c.prazo || ''}
                    onChange={(e) => updateConduta(i, 'prazo', e.target.value)}
                    placeholder="Ex: próximas 6h / até amanhã 08h"
                    className="w-full text-sm bg-app-tertiary/60 border border-app-border rounded-lg px-3 py-1.5"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {condutas.length === 0 && <div className="text-xs text-app-text-muted italic pl-1">Nenhuma conduta estruturada ainda.</div>}
      </div>
    </div>
  );
}