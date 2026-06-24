// SasiSynthesis — Síntese SASI v2.0: prompt Claude + edição manual

import { useState } from 'react';
import { SasiProblemaAtivo, SasiCondutaSistema, SystemKey } from '../lib/supabaseClient';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import {
  getReadyToPastePrompt,
  parseSynthesisJson,
  simulateSASISynthesis,
  type SASISynthesisRequest,
  type SASISynthesisOutput,
} from '../lib/sasiAI';

const SISTEMAS: SystemKey[] = ['neuro', 'resp', 'hemo', 'tgi', 'renal', 'hemato', 'infecto'];

interface Props {
  problemasAtivos: SasiProblemaAtivo[];
  condutasSistemas: SasiCondutaSistema[];
  onChange: (problemas: SasiProblemaAtivo[], condutas: SasiCondutaSistema[]) => void;
  patientContext?: string;
}

export default function SasiSynthesis({ problemasAtivos, condutasSistemas, onChange, patientContext }: Props) {
  const [problemas, setProblemas] = useState<SasiProblemaAtivo[]>(problemasAtivos);
  const [condutas, setCondutas] = useState<SasiCondutaSistema[]>(condutasSistemas);
  const [rawText, setRawText] = useState('');
  const [jsonPaste, setJsonPaste] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const updateProblemas = (newProblemas: SasiProblemaAtivo[]) => {
    setProblemas(newProblemas);
    onChange(newProblemas, condutas);
  };

  const updateCondutas = (newCondutas: SasiCondutaSistema[]) => {
    setCondutas(newCondutas);
    onChange(problemas, newCondutas);
  };

  const buildRequest = (): SASISynthesisRequest => ({
    patientContext: patientContext?.trim() || 'Paciente em evolução pontual — contexto clínico limitado.',
    rawData: {
      previousEvolution: rawText,
      ocrNursingNotes: rawText,
    },
  });

  const applySynthesisResult = (result: SASISynthesisOutput) => {
    const newProblemas: SasiProblemaAtivo[] = result.problemasAtivos.map(p => ({
      texto: p.texto,
      sistema: p.sistema as SystemKey | undefined,
    }));

    const newCondutas: SasiCondutaSistema[] = result.condutasSistemas.map(c => ({
      sistema: c.sistema as SystemKey | 'geral',
      texto: c.texto,
      meta: c.meta,
      prazo: c.prazo,
    }));

    updateProblemas(newProblemas);
    updateCondutas(newCondutas);
  };

  const copyPromptForClaude = () => {
    if (!rawText.trim()) {
      alert('Cole o texto bruto (evolução + folha + prescrição) no campo acima.');
      return;
    }
    const prompt = getReadyToPastePrompt(buildRequest());
    navigator.clipboard.writeText(prompt);
    alert('Prompt SASI v2.0 copiado. Cole no Claude, pegue o JSON da resposta e use "Aplicar JSON".');
  };

  const handleApplyJson = () => {
    if (!jsonPaste.trim()) {
      alert('Cole o JSON que o Claude devolveu.');
      return;
    }
    try {
      applySynthesisResult(parseSynthesisJson(jsonPaste));
      alert('JSON aplicado. Revise problemas e condutas.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'JSON inválido';
      alert(`Erro ao ler JSON: ${msg}`);
    }
  };

  const handleGenerateLocal = () => {
    if (!rawText.trim()) {
      alert('Cole o texto bruto no campo acima.');
      return;
    }
    setIsGenerating(true);
    try {
      applySynthesisResult(simulateSASISynthesis(buildRequest()));
      alert('Síntese local gerada. Revise antes de salvar.');
    } finally {
      setIsGenerating(false);
    }
  };

  const metaSuggestions = [
    'PAM ≥ 65 mmHg',
    'Diurese > 0.5 ml/kg/h',
    'BH negativo nas próximas 24h',
    'Lactato em queda',
    'SvO2 venosa ≥ 65%',
    'SpO2 ≥ 94%',
  ];

  const addProblema = () => updateProblemas([...problemas, { texto: '' }]);

  const updateProblema = (index: number, field: keyof SasiProblemaAtivo, value: SasiProblemaAtivo[keyof SasiProblemaAtivo]) => {
    const copy = [...problemas];
    copy[index] = { ...copy[index], [field]: value };
    updateProblemas(copy);
  };

  const removeProblema = (index: number) => updateProblemas(problemas.filter((_, i) => i !== index));

  const addConduta = () => updateCondutas([...condutas, { sistema: 'geral', texto: '', meta: '' }]);

  const updateConduta = (index: number, field: keyof SasiCondutaSistema, value: SasiCondutaSistema[keyof SasiCondutaSistema]) => {
    const copy = [...condutas];
    copy[index] = { ...copy[index], [field]: value };
    updateCondutas(copy);
  };

  const removeConduta = (index: number) => updateCondutas(condutas.filter((_, i) => i !== index));

  return (
    <div className="space-y-8">
      <div className="border border-app-border bg-app-tertiary/30 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 tx-neuro" />
          <span className="font-bold text-sm">Síntese com Claude</span>
        </div>

        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Cole aqui: evolução anterior + folha de enfermagem + prescrição + exames..."
          className="w-full h-24 bg-app-card border border-app-border rounded-xl p-3 text-sm resize-y"
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={copyPromptForClaude}
            disabled={!rawText.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-app-accent hover:opacity-90 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition"
          >
            Copiar Prompt p/ Claude
          </button>
          <button
            onClick={handleGenerateLocal}
            disabled={isGenerating || !rawText.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-app-card border border-app-border hover:bg-app-tertiary disabled:opacity-50 text-sm font-medium rounded-xl transition"
          >
            {isGenerating ? 'Gerando...' : 'Simulação local'}
          </button>
        </div>

        <textarea
          value={jsonPaste}
          onChange={(e) => setJsonPaste(e.target.value)}
          placeholder='Cole aqui o JSON que o Claude devolveu (bloco ```json ou puro)'
          className="w-full h-20 bg-app-card border border-app-border rounded-xl p-3 text-xs font-mono resize-y"
        />
        <button
          onClick={handleApplyJson}
          disabled={!jsonPaste.trim()}
          className="px-4 py-2 border border-app-border hover:bg-app-card disabled:opacity-50 text-sm font-medium rounded-xl transition"
        >
          Aplicar JSON do Claude
        </button>

        <p className="text-[10px] text-app-text-muted">
          Fluxo: copiar prompt → Claude no chat → colar JSON acima → aplicar. Sem Grok, sem Edge Function.
        </p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold tx-danger text-sm tracking-widest">PROBLEMAS ATIVOS</h4>
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
              <input
                type="text"
                value={p.texto}
                onChange={(e) => updateProblema(i, 'texto', e.target.value)}
                placeholder="Ex: Choque cardiogênico SCAI C"
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
                  placeholder="Ação principal"
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