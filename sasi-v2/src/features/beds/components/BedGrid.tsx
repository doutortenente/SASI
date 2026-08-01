"use client";
// ============================================================================
// SASI v2 — BedGrid (grade de leitos do War Room)
// ----------------------------------------------------------------------------
// Recebe as linhas JA lidas do banco pelo Server Component (vw_dashboard_uti) e
// JA triadas por features/war-room/triage (pior primeiro). Aqui nao ha leitura
// de banco nem calculo clinico: e client so por causa de dois controles do
// chassi que o medico usa com uma mao —
//   - filtro de UTI da TopBar   (uiStore.uti)
//   - visao compacta "War Room" (uiStore.warRoom)
//
// DOUTRINA: cabecalho conta por gravidade em TEXTO (cor nunca sozinha) e o
// estado vazio e um convite explicito, nunca uma grade muda.
// ============================================================================
import {type ReactElement, useMemo} from "react";
import {
  BedCard,
  CSS_BED_CARD,
  type LeitoTriado,
  ORDEM_GRAVIDADE,
  type ResumoPendencia,
  ROTULO_GRAVIDADE
} from "./BedCard";
import type {Gravity} from "@/features/war-room/triage";
import type {EvolucaoResumo} from "@/lib/formatters/tempo";
import {passaFiltroUti, ROTULO_UTI, useUiStore} from "@/stores/uiStore";

export interface BedGridProps {
  /** Linhas de vw_dashboard_uti ja passadas por triagem(). */
  leitos: LeitoTriado[];
  /** paciente_id -> resumo das pendencias abertas (tabela pendencias). */
  pendencias?: Record<string, ResumoPendencia>;
  /** paciente_id -> hora da ultima evolucao (JA formatada no servidor). */
  evolucoes?: Record<string, EvolucaoResumo>;
  /** Horario da leitura do banco, formatado no servidor (evita divergencia de fuso). */
  lidoEm?: string;
}

type Contagem = Record<Gravity, number>;

const ZERO: Contagem = {critical: 0, unstable: 0, watcher: 0, stable: 0, deceased: 0};

export function BedGrid({leitos, pendencias, evolucoes, lidoEm}: BedGridProps): ReactElement {
  const filtro = useUiStore((s) => s.uti);
  const setUti = useUiStore((s) => s.setUti);
  const compacto = useUiStore((s) => s.warRoom);

  const visiveis = useMemo(
    () => leitos.filter((l: LeitoTriado) => passaFiltroUti(filtro, l.uti)),
    [leitos, filtro],
  );

  const contagem = useMemo(() => {
    const c: Contagem = {...ZERO};
    for (const l of visiveis) c[l.gravity] += 1;
    return c;
  }, [visiveis]);

  // ---- estado vazio 1: nao ha leito ativo em banco nenhum -------------------
  if (leitos.length === 0) {
    return (
      <section className="bedgrid" aria-labelledby="bedgrid-vazio">
        <style dangerouslySetInnerHTML={{__html: CSS_BED_GRID + CSS_BED_CARD}}/>
        <div className="bedgrid__vazio">
          <p className="bedgrid__vazio-ttl" id="bedgrid-vazio">
            Nenhum leito ativo
          </p>
          <p className="bedgrid__vazio-txt">
            A visão <code className="tabnum">vw_dashboard_uti</code> não devolveu nenhum paciente
            com
            leito ativo. Isso acontece quando todos receberam alta/óbito/transferência — ou quando a
            leitura do banco falhou.
          </p>
          <p className="bedgrid__vazio-txt">
            Cadastre a admissão (ingestão da folha pela skill) e recarregue esta tela.
          </p>
        </div>
      </section>
    );
  }

  // ---- estado vazio 2: o filtro de UTI escondeu tudo ------------------------
  if (visiveis.length === 0) {
    return (
      <section className="bedgrid" aria-labelledby="bedgrid-filtro">
        <style dangerouslySetInnerHTML={{__html: CSS_BED_GRID + CSS_BED_CARD}}/>
        <div className="bedgrid__vazio">
          <p className="bedgrid__vazio-ttl" id="bedgrid-filtro">
            Nenhum leito ativo em {ROTULO_UTI[filtro]}
          </p>
          <p className="bedgrid__vazio-txt">
            Há {leitos.length} leito{leitos.length > 1 ? "s" : ""} ativo{leitos.length > 1 ? "s" : ""} nas
            outras UTIs. O filtro da barra superior está limitando esta grade.
          </p>
          <button type="button" className="bedgrid__acao" onClick={() => setUti("todas")}>
            Ver todas as UTIs
          </button>
        </div>
      </section>
    );
  }

  // ---- painel ---------------------------------------------------------------
  return (
    <section className="bedgrid" aria-labelledby="bedgrid-ttl">
      <style dangerouslySetInnerHTML={{__html: CSS_BED_GRID + CSS_BED_CARD}}/>

      <header className="bedgrid__cab">
        <h2 className="bedgrid__ttl" id="bedgrid-ttl">
          <span
            className="tabnum">{visiveis.length}</span> leito{visiveis.length > 1 ? "s" : ""} ativo
          {visiveis.length > 1 ? "s" : ""}
          {filtro === "todas" ? "" : ` · ${ROTULO_UTI[filtro]}`}
        </h2>

        <ul className="bedgrid__contagem" aria-label="Contagem por gravidade">
          {ORDEM_GRAVIDADE.filter((g: Gravity) => contagem[g] > 0).map((g: Gravity) => (
            <li
              key={g}
              className="bedgrid__pill"
              style={{background: `var(--grav-${g}-bg)`, color: `var(--grav-${g}-text)`}}
            >
              <span className="bedgrid__ponto" style={{background: `var(--grav-${g}-solid)`}}
                    aria-hidden="true"/>
              <span className="tabnum">{contagem[g]}</span>{" "}
              {contagem[g] > 1 ? ROTULO_GRAVIDADE[g].p : ROTULO_GRAVIDADE[g].s}
            </li>
          ))}
        </ul>

        {lidoEm ? (
          <p className="bedgrid__lido tabnum" title="Momento em que esta página leu o banco">
            leitura {lidoEm}
          </p>
        ) : null}
      </header>

      <div className={`bedgrid__grade${compacto ? " bedgrid__grade--compacta" : ""}`}>
        {visiveis.map((l: LeitoTriado) => (
          <BedCard
            key={l.paciente_id}
            leito={l}
            pendencia={pendencias?.[l.paciente_id] ?? null}
            evolucao={evolucoes?.[l.paciente_id] ?? null}
            compacto={compacto}
          />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CSS da grade (tokens do design system; nenhum hex).
// ---------------------------------------------------------------------------
const CSS_BED_GRID = `
.bedgrid{display:flex;flex-direction:column;gap:14px;min-width:0}
.bedgrid__cab{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px}
.bedgrid__ttl{margin:0;font-size:var(--text-base,15px);font-weight:700;color:var(--text-heading)}
.bedgrid__contagem{display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0;list-style:none}
.bedgrid__pill{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:var(--radius-pill,9999px);
  font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-wide,.04em);text-transform:uppercase}
.bedgrid__ponto{display:inline-block;width:7px;height:7px;border-radius:var(--radius-pill,9999px)}
.bedgrid__lido{margin:0 0 0 auto;font-size:var(--text-2xs,10px);color:var(--text-faint)}

.bedgrid__grade{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(268px,1fr))}
.bedgrid__grade--compacta{gap:8px;grid-template-columns:repeat(auto-fill,minmax(208px,1fr))}
@media (max-width:520px){.bedgrid__grade,.bedgrid__grade--compacta{grid-template-columns:1fr}}

.bedgrid__vazio{display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding:28px 24px;
  background:var(--surface-card);border:1px dashed var(--border-strong);border-radius:var(--radius-xl,16px)}
.bedgrid__vazio-ttl{margin:0;font-size:var(--text-lg,20px);font-weight:700;color:var(--text-heading)}
.bedgrid__vazio-txt{margin:0;max-width:64ch;font-size:var(--text-sm,13px);line-height:var(--leading-normal,1.55);color:var(--text-muted)}
.bedgrid__vazio code{font-family:var(--font-mono,monospace);font-size:var(--text-xs,11px);color:var(--text-body)}
.bedgrid__acao{min-height:44px;padding:0 16px;border:1px solid var(--accent);border-radius:var(--radius-md,8px);
  background:var(--accent-soft);color:var(--accent-text);font-family:inherit;font-size:var(--text-sm,13px);
  font-weight:700;cursor:pointer}
.bedgrid__acao:hover{background:var(--surface-raised)}
.bedgrid__acao:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
`;

export default BedGrid;
