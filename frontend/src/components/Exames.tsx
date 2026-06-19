// ============================================================================
// SASI · Exames — board de laboratório cross-paciente (Eixo Estado)
// Uma linha por leito, colunas dos labs-chave com o valor mais recente colorido
// por threshold (checkLabAlert). ZERO ALUCINAÇÃO: sem fonte legível → "—".
// Reaproveita extractTabelaoLabs + TABELAO_LABS + LAB_REFERENCES.
// ============================================================================
import { useState, useEffect, useCallback } from 'react';
import { FlaskConical, AlertTriangle, ArrowUpDown } from 'lucide-react';
import type { DashboardRow, Evolucao } from '../lib/supabaseClient';
import { supabase } from '../lib/supabaseClient';
import { extractTabelaoLabs } from '../lib/clinicalExtract';
import { TABELAO_LABS } from '../lib/sasiSchema';
import { checkLabAlert } from '../lib/drugs';
import { getSeverity } from '../lib/severity';

interface Props {
  patients: DashboardRow[];
  onSelect: (id: string) => void;
}

// Colunas curadas (legibilidade > exaustão) — chaves batem com LAB_REFERENCES.
const COLS = ['hb', 'leuco', 'plaq', 'ur', 'cr', 'na', 'k', 'lactato', 'pcr', 'ph', 'hco3'] as const;
const COL_DEF = COLS.map(key => TABELAO_LABS.find(d => d.key === key)!).filter(Boolean);

function parseNum(v: string): number | null {
  if (!v) return null;
  const n = parseFloat(v.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
  return Number.isNaN(n) ? null : n;
}

function cellClass(status: 'normal' | 'low' | 'high'): string {
  if (status === 'high') return 'tx-danger font-bold';
  if (status === 'low') return 'tx-info font-bold';
  return 'text-app-text-2';
}

export default function Exames({ patients, onSelect }: Props) {
  const [labsByPatient, setLabsByPatient] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (patients.length === 0) { setLabsByPatient({}); return; }
    setLoading(true);
    const ids = patients.map(p => p.paciente_id);
    const { data } = await supabase
      .from('evolucoes')
      .select('*')
      .in('paciente_id', ids)
      .order('data_evolucao', { ascending: false });

    const byPatient: Record<string, Evolucao[]> = {};
    for (const e of (data ?? []) as Evolucao[]) {
      (byPatient[e.paciente_id] ??= []).push(e);
    }

    const out: Record<string, Record<string, string>> = {};
    for (const id of ids) {
      const evols = byPatient[id] ?? [];
      const rows = extractTabelaoLabs(evols); // TABELAO_LABS order
      const map: Record<string, string> = {};
      TABELAO_LABS.forEach((def, i) => { map[def.key] = rows[i]?.val1 ?? ''; });
      out[id] = map;
    }
    setLabsByPatient(out);
    setLoading(false);
  }, [patients]);

  useEffect(() => { void load(); }, [load]);

  // pacientes com ≥1 lab alterado primeiro (acuidade laboratorial)
  const flaggedCount = (id: string) => {
    const map = labsByPatient[id];
    if (!map) return 0;
    return COL_DEF.reduce((acc, def) => {
      const n = parseNum(map[def.key] ?? '');
      return acc + (n != null && checkLabAlert(def.key, n) !== 'normal' ? 1 : 0);
    }, 0);
  };

  const sorted = [...patients].sort((a, b) => flaggedCount(b.paciente_id) - flaggedCount(a.paciente_id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold text-app-text">
          <FlaskConical className="w-4 h-4 tx-renal" />
          Exames — Laboratório de {patients.length} leitos
        </h2>
        <span className="flex items-center gap-1.5 text-[11px] text-app-text-muted">
          <ArrowUpDown className="w-3 h-3" /> ordenado por nº de alterações
        </span>
      </div>

      {loading && (
        <div className="text-center text-app-text-muted py-12 text-sm animate-pulse">
          Buscando exames das últimas evoluções…
        </div>
      )}

      {!loading && patients.length === 0 && (
        <div className="bg-app-card border border-app-border rounded-xl p-8 text-center text-app-text-muted text-sm">
          Nenhum paciente ativo.
        </div>
      )}

      {!loading && patients.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-app-border shadow-sm">
          <table className="w-full text-[11px] border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-app-tertiary text-app-text-2 sticky top-0 z-10">
                <th className="px-2 py-2 text-left font-bold border-r border-app-border w-12">UTI</th>
                <th className="px-2 py-2 text-center font-bold border-r border-app-border w-10">Lt</th>
                <th className="px-2 py-2 text-left font-bold border-r border-app-border w-36">Nome</th>
                {COL_DEF.map(def => (
                  <th key={def.key} className="px-2 py-2 text-center font-bold border-r border-app-border/40 whitespace-nowrap" title={`${def.exame} · ref ${def.ref}`}>
                    {def.exame}
                  </th>
                ))}
                <th className="px-2 py-2 text-center font-bold w-12" title="nº de exames alterados">
                  <AlertTriangle className="w-3 h-3 inline" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(row => {
                const sev = getSeverity(row.gravidade);
                const map = labsByPatient[row.paciente_id] ?? {};
                const flags = flaggedCount(row.paciente_id);
                return (
                  <tr
                    key={row.paciente_id}
                    onClick={() => onSelect(row.paciente_id)}
                    className={`border-b border-app-border/60 hover:bg-app-tertiary/30 cursor-pointer ${sev.cardClass}`}
                  >
                    <td className="px-2 py-2 font-mono text-app-text-muted border-r border-app-border/30">{row.uti}</td>
                    <td className="px-2 py-2 text-center font-black text-base tabular-nums border-r border-app-border/30">{row.leito}</td>
                    <td className="px-2 py-2 font-semibold text-app-text border-r border-app-border/30 truncate max-w-[140px]" title={row.nome}>
                      {row.nome}
                    </td>
                    {COL_DEF.map(def => {
                      const raw = map[def.key] ?? '';
                      const n = parseNum(raw);
                      const status = n != null ? checkLabAlert(def.key, n) : 'normal';
                      return (
                        <td
                          key={def.key}
                          title={raw || undefined}
                          className={`px-2 py-2 text-center tabular-nums border-r border-app-border/20 font-mono whitespace-nowrap ${raw ? cellClass(status) : 'text-app-text-muted/40'}`}
                        >
                          {raw ? (raw.length > 12 ? `${raw.slice(0, 11)}…` : raw) : '—'}
                        </td>
                      );
                    })}
                    <td className="px-2 py-2 text-center">
                      {flags > 0 ? (
                        <span className="inline-flex items-center gap-0.5 tx-danger font-bold tabular-nums">
                          <AlertTriangle className="w-3 h-3" />{flags}
                        </span>
                      ) : (
                        <span className="tx-ok font-bold">ok</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[10px] text-app-text-muted text-center">
        Valor mais recente por leito · <span className="tx-danger font-bold">acima</span> /{' '}
        <span className="tx-info font-bold">abaixo</span> da faixa · clique numa linha para abrir a ficha · sem fonte → —
      </p>
    </div>
  );
}
