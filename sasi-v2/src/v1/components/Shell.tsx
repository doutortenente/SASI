'use client';
// ============================================================================
// SASI · Shell — moldura do Dashboard v1.0 (Sidebar + TopBar + rodapé) em volta
// das rotas do Next.js. Lógica e marcação vêm do Dashboard.tsx da v1.0.
// Visão Geral (/beds): FiltersBar + CriticalAlerts + Cards / Round / Tabela.
// Demais rotas (/patients, /handoff, ficha do paciente): conteúdo da rota.
// ============================================================================
import {
  createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BedDouble } from 'lucide-react';
import { useSupabasePatients } from '../hooks/useSupabasePatients';
import { useClinicalAlerts } from '../hooks/useClinicalAlerts';
import { UIProvider, useUI } from '../lib/theme';
import { ToastProvider, useToasts } from '../lib/useToasts';
import { useKeyboardShortcuts } from '../lib/useKeyboardShortcuts';
import {
  SMART_FILTERS, rowHasDVA, rowHasVM, rowSemEvolucao,
  type SmartFilter, type UtiFilter,
} from '../lib/dashboardFilters';
import type { DashboardRow } from '../lib/supabaseClient';
import { gerarTextoPlantao } from '../lib/drugs';
import LeitoCard from './LeitoCard';
import CriticalAlerts from './CriticalAlerts';
import SplitView from './SplitView';
import TableView from './TableView';
import Sidebar, { type SasiView } from './Sidebar';
import TopBar from './TopBar';
import FiltersBar from './FiltersBar';
import NovoLeitoModal from './NovoLeitoModal';
import { LeitoCardSkeleton, SplitSkeleton, EmptyState } from './Skeletons';

const lazyExportPDF = () => import('../lib/exportPDF');

const SESSION_EMAIL = 'dev@sasi-uti.local';

interface OverviewState {
  dashboard: DashboardRow[];
  visible: DashboardRow[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (v: string) => void;
  utiFilter: UtiFilter;
  setUtiFilter: (v: UtiFilter) => void;
  smartFilter: SmartFilter;
  setSmartFilter: (v: SmartFilter) => void;
  smartCounts: Record<SmartFilter, number>;
  stats: { total: number; criticos: number; graves: number; piorando: number };
  openPaciente: (id: string) => void;
  alertsRef: React.RefObject<HTMLDivElement | null>;
}

const OverviewContext = createContext<OverviewState | null>(null);

function useOverview(): OverviewState {
  const ctx = useContext(OverviewContext);
  if (!ctx) throw new Error('useOverview must be used within Shell');
  return ctx;
}

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <UIProvider>
      <ToastProvider>
        <ShellInner>{children}</ShellInner>
      </ToastProvider>
    </UIProvider>
  );
}

function ShellInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const { dashboard, loading, error } = useSupabasePatients();
  const { totalCriticos, totalWarnings } = useClinicalAlerts();
  const { addToast } = useToasts();
  const { setViewMode, cycleTheme } = useUI();
  const [utiFilter, setUtiFilter] = useState<UtiFilter>('TODAS');
  const [smartFilter, setSmartFilter] = useState<SmartFilter>('todos');
  const [search, setSearch] = useState('');
  const [showNovoLeito, setShowNovoLeito] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const alertsRef = useRef<HTMLDivElement>(null);

  const isOverview = pathname === '/' || pathname === '/beds' || pathname.startsWith('/beds/');
  const activeView: SasiView = pathname.startsWith('/patients') ? 'pacientes'
    : pathname.startsWith('/handoff') ? 'passagem' : 'overview';

  const openPaciente = useCallback((id: string) => {
    router.push(`/patients/${id}`);
  }, [router]);

  const noModal = !showNovoLeito;
  const shortcuts = useCallback(() => ({
    'j': () => {},
    'k': () => {},
    't': cycleTheme,
    'n': () => setShowNovoLeito(true),
    '?': () => setShowShortcuts(v => !v),
    'Escape': () => { setShowShortcuts(false); setSearch(''); },
    'g p': () => { setViewMode('plantao'); router.push('/beds'); },
    'g r': () => { setViewMode('round'); router.push('/beds'); },
    'g e': () => { setViewMode('editor'); router.push('/beds'); },
  }), [cycleTheme, setViewMode, router]);
  useKeyboardShortcuts(shortcuts(), noModal);

  // Base: filtrado por UTI — base para contar os smart filter pills
  const base = useMemo(
    () => utiFilter === 'TODAS' ? dashboard : dashboard.filter(r => r.uti === utiFilter),
    [dashboard, utiFilter]
  );

  // Contagens dos smart filters (sempre da base UTI, independente de smart/search)
  const smartCounts = useMemo(() => ({
    todos: base.length,
    critico: base.filter(r => r.gravidade === 'critico').length,
    sofa_up: base.filter(r => (r.delta_sofa_24h ?? 0) > 0).length,
    dva: base.filter(rowHasDVA).length,
    vm: base.filter(rowHasVM).length,
    sem_evolucao: base.filter(rowSemEvolucao).length,
  }), [base]);

  // Visible: base + smart filter + busca
  const visible = useMemo(() => {
    let result = base;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(r =>
        r.nome.toLowerCase().includes(q) || r.leito.toLowerCase().includes(q)
      );
    }

    switch (smartFilter) {
      case 'critico':      return result.filter(r => r.gravidade === 'critico');
      case 'sofa_up':      return result.filter(r => (r.delta_sofa_24h ?? 0) > 0);
      case 'dva':          return result.filter(rowHasDVA);
      case 'vm':           return result.filter(rowHasVM);
      case 'sem_evolucao': return result.filter(rowSemEvolucao);
      default:             return result;
    }
  }, [base, smartFilter, search]);

  const stats = useMemo(() => ({
    total: base.length,
    criticos: base.filter(r => r.gravidade === 'critico').length,
    graves: base.filter(r => r.gravidade === 'grave').length,
    piorando: base.filter(r => (r.delta_sofa_24h ?? 0) > 0).length,
  }), [base]);

  const handleCopiar = useCallback(async () => {
    const texto = gerarTextoPlantao(visible, utiFilter);
    await navigator.clipboard.writeText(texto);
    addToast('success', `Plantão copiado (${visible.length} pacientes)`);
  }, [visible, utiFilter, addToast]);

  const handleExportPDF = useCallback(async () => {
    const { exportPassagemTurno } = await lazyExportPDF();
    exportPassagemTurno(visible, SESSION_EMAIL);
  }, [visible]);

  // Alertas vivem na Visão Geral: navega pra ela antes de rolar ao banner.
  const scrollToAlertas = useCallback(() => {
    if (!isOverview) router.push('/beds');
    requestAnimationFrame(() => {
      alertsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [isOverview, router]);

  const handleNavigate = useCallback((view: SasiView) => {
    router.push(view === 'pacientes' ? '/patients' : view === 'passagem' ? '/handoff' : '/beds');
  }, [router]);

  const overview: OverviewState = {
    dashboard, visible, loading, error, search, setSearch, utiFilter, setUtiFilter,
    smartFilter, setSmartFilter, smartCounts, stats, openPaciente, alertsRef,
  };

  return (
    <OverviewContext.Provider value={overview}>
      <div className="flex h-screen overflow-hidden bg-app text-app-text">
        <Sidebar
          activeView={activeView}
          onNavigate={handleNavigate}
          onPassagemClick={() => router.push('/handoff')}
          onAlertasClick={scrollToAlertas}
          alertasCriticos={totalCriticos}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
            sessionEmail={SESSION_EMAIL}
            totalCriticos={totalCriticos}
            totalWarnings={totalWarnings}
            hasPatients={dashboard.length > 0}
            onNovoLeito={() => setShowNovoLeito(true)}
            onCopiar={handleCopiar}
            onExportPDF={handleExportPDF}
          />

          <div className="flex-1 overflow-y-auto">
            {isOverview && (
              <FiltersBar
                search={search}
                setSearch={setSearch}
                utiFilter={utiFilter}
                setUtiFilter={setUtiFilter}
                smartFilter={smartFilter}
                setSmartFilter={setSmartFilter}
                smartCounts={smartCounts}
                stats={stats}
              />
            )}

            <main className="px-5 py-4">{children}</main>

            <footer className="px-5 py-6 text-[11px] text-app-text-muted text-center flex items-center justify-center gap-3">
              <span suppressHydrationWarning>SASI v1.0 · Supabase realtime · LGPD-RLS · {new Date().toLocaleString('pt-BR')}</span>
              <button
                onClick={() => setShowShortcuts(true)}
                className="px-1.5 py-0.5 rounded border border-app-border bg-app-tertiary hover:text-app-text-2 transition text-[10px] font-mono"
              >
                ? atalhos
              </button>
            </footer>
          </div>
        </div>

        {showNovoLeito && (
          <NovoLeitoModal
            userId="00000000-0000-0000-0000-000000000000"
            onClose={() => setShowNovoLeito(false)}
            onSuccess={() => {}}
          />
        )}

        {showShortcuts && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowShortcuts(false)}
          >
            <div
              className="bg-app-card border border-app-border rounded-2xl shadow-2xl p-6 w-full max-w-sm sasi-fade-in"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-base font-bold text-app-text mb-4">Atalhos de teclado</h3>
              <div className="space-y-1.5 text-xs">
                {[
                  ['?', 'Abrir/fechar este painel'],
                  ['t', 'Ciclar tema (dark → clinical → light)'],
                  ['n', 'Novo leito'],
                  ['Esc', 'Fechar modal / limpar busca'],
                  ['g p', 'Modo Plantão (Cards)'],
                  ['g r', 'Modo Round (Split)'],
                  ['g e', 'Modo Editor (Tabela)'],
                ].map(([key, desc]) => (
                  <div key={key} className="flex items-center gap-3">
                    <kbd className="shrink-0 min-w-[40px] text-center px-1.5 py-0.5 rounded border border-app-border bg-app-tertiary font-mono text-[11px] text-app-text-2">
                      {key}
                    </kbd>
                    <span className="text-app-text-muted">{desc}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="mt-5 w-full py-2 text-sm font-medium rounded-lg bg-app-tertiary hover:bg-app-tertiary/70 text-app-text-2 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </OverviewContext.Provider>
  );
}

/** Conteúdo da Visão Geral (v1.0): alertas críticos + Cards / Round / Tabela. */
export function Overview() {
  const {
    visible, loading, error, search, utiFilter, smartFilter, openPaciente, alertsRef,
  } = useOverview();
  const { viewMode } = useUI();

  const emptyTitle = (() => {
    if (smartFilter !== 'todos') {
      const label = SMART_FILTERS.find(f => f.id === smartFilter)?.label ?? smartFilter;
      return `Nenhum paciente com filtro "${label}"`;
    }
    if (search) return `Nenhum resultado para "${search}"`;
    if (utiFilter !== 'TODAS') return `Nenhum leito ativo em ${utiFilter}`;
    return 'Nenhum leito ativo';
  })();

  const emptyDesc = smartFilter !== 'todos' || search
    ? 'Tente remover o filtro ou a busca para ver todos.'
    : 'Admita um paciente usando a skill sasi-ingest-export ou o botão Novo Leito.';

  return (
    <>
      <div ref={alertsRef} className="scroll-mt-2">
        <CriticalAlerts patients={visible} onSelect={openPaciente} />
      </div>

      {loading && viewMode === 'plantao' && (
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <LeitoCardSkeleton key={i} />)}
        </div>
      )}
      {loading && viewMode === 'round' && <SplitSkeleton />}
      {loading && viewMode === 'editor' && (
        <div className="text-center text-app-text-muted py-12 text-sm animate-pulse">
          Carregando trincheira…
        </div>
      )}

      {error && (
        <div className="bg-red-950 border border-red-900 rounded-lg p-4 text-red-300 text-sm">
          Erro: {error}
        </div>
      )}

      {!loading && visible.length === 0 && (
        <EmptyState icon={BedDouble} title={emptyTitle} description={emptyDesc} />
      )}

      {!loading && visible.length > 0 && (
        <>
          {viewMode === 'plantao' && (
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {visible.map(row => (
                <LeitoCard key={row.paciente_id} row={row} onSelect={openPaciente} />
              ))}
            </div>
          )}
          {viewMode === 'round' && (
            <SplitView patients={visible} onOpenFull={openPaciente} />
          )}
          {viewMode === 'editor' && <TableView patients={visible} onSelect={openPaciente} />}
        </>
      )}
    </>
  );
}
