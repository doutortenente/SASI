"use client";
// ============================================================================
// SASI v2 — RoundList (round clinico: 1 linha por leito ativo)
// ----------------------------------------------------------------------------
// Recebe as linhas JA lidas do banco pelo Server Component (/rounds/page.tsx) e
// JA triadas por features/war-room/triage (pior primeiro). Aqui nao ha leitura
// de banco, nao ha calculo clinico e nao ha conta de data — so ordenacao de
// leitura, filtro e apresentacao.
//
// E client por dois controles que o medico usa com uma mao:
//   - filtro de UTI da TopBar (uiStore.uti)
//   - alternador "só quem precisa de ação"
//
// O QUE ESTA TELA PRIORIZA (nao e cadastro, e acao):
//   risco aberto  >  pendencia de prioridade alta  >  antibiotico em D+7  >
//   evolucao atrasada  >  ΔSOFA subindo
// A ordem primaria continua sendo a GRAVIDADE (mesma escala do War Room); os
// criterios acima so desempatam dentro do mesmo nivel.
//
// DOUTRINA
//  - ZERO ALUCINACAO: leito ausente de vw_alertas_abertos NAO vira "0 alertas"
//    (a view so lista quem TEM alerta aberto) — vira "sem alerta aberto".
//    SOFA null vira "—". D-ATB null vira "D—".
//  - Cor nunca e o unico sinal: todo chip carrega o texto do que significa.
//  - Cor so por token; numero em .tabnum.
// ============================================================================
import Link from "next/link";
import { useMemo, useState, type ReactElement } from "react";
import { ROTULO_GRAVIDADE, type LeitoTriado } from "@/features/beds/components/BedCard";
import type { Gravity } from "@/features/war-room/triage";
import type { VwAlertaAberto, VwDiasAtbAtivo } from "@/lib/data";
import { num } from "@/lib/formatters/br";
import { ROTULO_UTI, passaFiltroUti, useUiStore } from "@/stores/uiStore";
import type { Pendencia } from "@/types/clinical";

// ---------------------------------------------------------------------------
// Contratos
// ---------------------------------------------------------------------------

/** Estado da ultima evolucao, JA formatado no servidor (nao ha conta de data no client). */
export interface EvolucaoResumo {
  /** Ex.: "hoje 06:12", "29/07 19:40" ou "—" quando nao ha evolucao. */
  rotulo: string;
  /** true = sem evolucao nas ultimas 24 h (ou nenhuma evolucao registrada). */
  atrasada: boolean;
}

/** Uma linha do round: o leito + o que exige decisao agora. */
export interface LinhaRound {
  /** vw_dashboard_uti + gravidade de features/war-room/triage. */
  leito: LeitoTriado;
  /** vw_alertas_abertos (contagem por severidade). null = leito sem alerta aberto. */
  alertas: VwAlertaAberto | null;
  /** pendencias abertas, ja ordenadas por prioridade (1 alta) e mais antigas antes. */
  pendencias: Pendencia[];
  /** vw_dias_atb_ativo: antibioticos em curso com D+n e flag de stewardship. */
  atbs: VwDiasAtbAtivo[];
  evolucao: EvolucaoResumo;
}

export interface RoundListProps {
  linhas: LinhaRound[];
  /** Horario da leitura do banco, formatado no servidor. */
  lidoEm?: string;
}

// ---------------------------------------------------------------------------
// Vocabulario e regras de leitura
// ---------------------------------------------------------------------------
const TRAVESSAO = "—";

/** Dia de terapia a partir do qual o stewardship pede reavaliacao (regra da view). */
const DIAS_ATENCAO = 7;

/** Mesmo vocabulario da tela de prescricao (AtbStewardship). */
const ROTULO_STEWARDSHIP: Record<string, string> = {
  ok: "em curso",
  warning: "reavaliar",
  critical: "reavaliar já",
};

/**
 * Peso da gravidade — MESMA ordem de features/war-room/triage (pior primeiro:
 * obito > critico > instavel > vigilancia > estavel). Repetido aqui porque a
 * triagem exporta a ordenacao pronta, nao a escala numerica.
 */
const PESO_GRAVIDADE: Record<Gravity, number> = {
  deceased: 4,
  critical: 3,
  unstable: 2,
  watcher: 1,
  stable: 0,
};

const txt = (v: string | null | undefined): string | null => {
  const s = (v ?? "").trim();
  return s.length > 0 ? s : null;
};

const altasDe = (l: LinhaRound): number => l.pendencias.filter((p: Pendencia) => p.prioridade === 1).length;

const atbsEmAtencao = (l: LinhaRound): number =>
  l.atbs.filter((a: VwDiasAtbAtivo) => a.stewardship_flag === "warning" || a.stewardship_flag === "critical").length;

/** Este leito exige decisao AGORA? (criterio unico do alternador e do resumo) */
function precisaAcao(l: LinhaRound): boolean {
  return (
    (l.alertas?.criticos ?? 0) > 0 ||
    altasDe(l) > 0 ||
    atbsEmAtencao(l) > 0 ||
    l.evolucao.atrasada ||
    (l.leito.delta_sofa_24h ?? 0) >= 2 ||
    l.leito.gravity === "critical" ||
    l.leito.gravity === "deceased"
  );
}

/** Gravidade primeiro; risco/pendencia desempatam. Array.sort e estavel: empate total mantem a ordem de leito. */
function porUrgencia(a: LinhaRound, b: LinhaRound): number {
  return (
    PESO_GRAVIDADE[b.leito.gravity] - PESO_GRAVIDADE[a.leito.gravity] ||
    (b.alertas?.criticos ?? 0) - (a.alertas?.criticos ?? 0) ||
    altasDe(b) - altasDe(a) ||
    (b.alertas?.warnings ?? 0) - (a.alertas?.warnings ?? 0) ||
    atbsEmAtencao(b) - atbsEmAtencao(a) ||
    (b.evolucao.atrasada ? 1 : 0) - (a.evolucao.atrasada ? 1 : 0) ||
    (b.leito.delta_sofa_24h ?? 0) - (a.leito.delta_sofa_24h ?? 0)
  );
}

/** Faixa de cor do SOFA (mesma regra do BedCard). Sem SOFA => cinza + "—". */
function corSofa(s: number | null): string {
  if (s == null) return "var(--text-muted)";
  if (s >= 12) return "var(--sofa-critical)";
  if (s >= 8) return "var(--sofa-high)";
  if (s >= 4) return "var(--sofa-medium)";
  return "var(--sofa-low)";
}

function delta24h(d: number | null): { texto: string; glifo: string; cor: string; leitura: string } {
  if (d == null) return { texto: TRAVESSAO, glifo: "", cor: "var(--text-muted)", leitura: "variação do SOFA em 24 horas não disponível" };
  if (d > 0) return { texto: num(d, 0), glifo: "▲", cor: "var(--danger)", leitura: `SOFA subiu ${num(d, 0)} em 24 horas` };
  if (d < 0) return { texto: num(Math.abs(d), 0), glifo: "▼", cor: "var(--success)", leitura: `SOFA caiu ${num(Math.abs(d), 0)} em 24 horas` };
  return { texto: "0", glifo: "=", cor: "var(--text-muted)", leitura: "SOFA estável em 24 horas" };
}

function corAtb(flag: string): string {
  if (flag === "critical") return "var(--danger)";
  if (flag === "warning") return "var(--warning)";
  if (flag === "ok") return "var(--badge-atb-text)";
  return "var(--text-muted)";
}

// ---------------------------------------------------------------------------
// Chip (cor + texto: a cor nunca carrega o significado sozinha)
// ---------------------------------------------------------------------------
function Chip({ cor, children, titulo }: { cor: string; children: string; titulo?: string }): ReactElement {
  return (
    <span
      className="round-chip"
      title={titulo ?? children}
      style={{
        color: cor,
        background: `color-mix(in srgb, ${cor} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${cor} 30%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Linha do round
// ---------------------------------------------------------------------------
function Linha({ l }: { l: LinhaRound }): ReactElement {
  const b = l.leito;
  const g = b.gravity;
  const d = delta24h(b.delta_sofa_24h ?? null);
  const altas = altasDe(l);
  const abertas = l.pendencias.length;
  const criticos = l.alertas?.criticos ?? 0;
  const warnings = l.alertas?.warnings ?? 0;
  const acao = precisaAcao(l);

  return (
    <Link
      href={`/patients/${b.paciente_id}`}
      className={`round-row${acao ? " round-row--acao" : ""}`}
      style={{ borderLeft: `var(--gravity-bar, 6px) solid var(--grav-${g}-solid)` }}
      aria-label={`Leito ${b.uti} ${b.leito} — ${b.nome}, ${ROTULO_GRAVIDADE[g].s}`}
    >
      {/* 1. leito + gravidade */}
      <span className="round-row__c round-row__c--leito">
        <span className="round-row__leito tabnum">
          {b.uti} · {b.leito}
        </span>
        <span className="round-row__grav" style={{ color: `var(--grav-${g}-text)` }}>
          {ROTULO_GRAVIDADE[g].s}
        </span>
      </span>

      {/* 2. quem e + HD */}
      <span className="round-row__c round-row__c--quem">
        <span className="round-row__nome">{txt(b.nome) ?? TRAVESSAO}</span>
        <span className="round-row__meta tabnum">
          {b.idade == null ? `idade ${TRAVESSAO}` : `${num(b.idade, 0)} anos`} ·{" "}
          {b.dias_internacao == null ? `internação ${TRAVESSAO}` : `${num(b.dias_internacao, 0)} d de UTI`} · evolução{" "}
          <span style={{ color: l.evolucao.atrasada ? "var(--warning)" : "inherit", fontWeight: l.evolucao.atrasada ? 700 : 400 }}>
            {l.evolucao.rotulo}
          </span>
        </span>
        <span className="round-row__hd">{txt(b.hd) ?? TRAVESSAO}</span>
      </span>

      {/* 3. SOFA + delta 24 h */}
      <span className="round-row__c round-row__c--sofa">
        <span className="round-row__rot">SOFA</span>
        <span className="round-row__sofa tabnum" style={{ color: corSofa(b.sofa_total) }} title="SOFA da última evolução (calculado no banco)">
          {num(b.sofa_total, 0)}
        </span>
        <span className="round-row__delta tabnum" style={{ color: d.cor }} title={d.leitura}>
          <span aria-hidden="true">{d.glifo}</span> {d.texto}
          <span className="round-row__delta-un"> /24 h</span>
        </span>
      </span>

      {/* 4. risco aberto: alertas + antibioticos em D+n */}
      <span className="round-row__c round-row__c--risco">
        <span className="round-row__rot">Alertas e ATB</span>
        <span className="round-row__chips">
          {criticos > 0 ? (
            <Chip cor="var(--danger)" titulo="Alertas críticos não reconhecidos (vw_alertas_abertos)">
              {`${num(criticos, 0)} crítico${criticos > 1 ? "s" : ""}`}
            </Chip>
          ) : null}
          {warnings > 0 ? (
            <Chip cor="var(--warning)" titulo="Alertas de aviso não reconhecidos (vw_alertas_abertos)">
              {`${num(warnings, 0)} aviso${warnings > 1 ? "s" : ""}`}
            </Chip>
          ) : null}
          {criticos === 0 && warnings === 0 ? <span className="round-row__vazio">sem alerta aberto</span> : null}

          {l.atbs.map((a: VwDiasAtbAtivo) => {
            const dias = typeof a.dias_terapia === "number" && Number.isFinite(a.dias_terapia) ? a.dias_terapia : null;
            const flag = String(a.stewardship_flag);
            const rotuloFlag = ROTULO_STEWARDSHIP[flag] ?? flag;
            return (
              <Chip
                key={a.atb_id}
                cor={corAtb(flag)}
                titulo={`${txt(a.droga) ?? TRAVESSAO} — dia de terapia ${dias == null ? "não calculado" : num(dias, 0)}${
                  txt(a.foco) ? ` · foco ${txt(a.foco)}` : ""
                } · ${rotuloFlag}`}
              >
                {`${txt(a.droga) ?? TRAVESSAO} D${dias == null ? TRAVESSAO : `+${num(dias, 0)}`}`}
              </Chip>
            );
          })}
          {l.atbs.length === 0 ? <span className="round-row__vazio">sem ATB em curso</span> : null}
        </span>
      </span>

      {/* 5. pendencias abertas (prioridade 1 em destaque) */}
      <span className="round-row__c round-row__c--pend">
        <span className="round-row__rot">Pendências</span>
        {abertas > 0 ? (
          <>
            <span className="round-row__chips">
              {altas > 0 ? (
                <Chip cor="var(--danger)" titulo="Pendências de prioridade 1 (alta)">
                  {`${num(altas, 0)} alta${altas > 1 ? "s" : ""}`}
                </Chip>
              ) : null}
              <Chip cor="var(--badge-pend-text)" titulo="Pendências abertas (tabela pendencias)">
                {`${num(abertas, 0)} aberta${abertas > 1 ? "s" : ""}`}
              </Chip>
            </span>
            <span className="round-row__tarefa" title={txt(l.pendencias[0]?.tarefa) ?? undefined}>
              {txt(l.pendencias[0]?.tarefa) ?? TRAVESSAO}
            </span>
          </>
        ) : (
          <span className="round-row__vazio">nenhuma aberta</span>
        )}
      </span>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Painel
// ---------------------------------------------------------------------------
export function RoundList({ linhas, lidoEm }: RoundListProps): ReactElement {
  const filtro = useUiStore((s) => s.uti);
  const setUti = useUiStore((s) => s.setUti);
  const [soAcao, setSoAcao] = useState(false);

  const naUti = useMemo(
    () => linhas.filter((l: LinhaRound) => passaFiltroUti(filtro, l.leito.uti)).slice().sort(porUrgencia),
    [linhas, filtro],
  );

  const resumo = useMemo(() => {
    const comAcao = naUti.filter(precisaAcao).length;
    const comCritico = naUti.filter((l: LinhaRound) => (l.alertas?.criticos ?? 0) > 0).length;
    const tarefasAltas = naUti.reduce((s: number, l: LinhaRound) => s + altasDe(l), 0);
    const atbRever = naUti.reduce((s: number, l: LinhaRound) => s + atbsEmAtencao(l), 0);
    const semEvolucao = naUti.filter((l: LinhaRound) => l.evolucao.atrasada).length;
    return { comAcao, comCritico, tarefasAltas, atbRever, semEvolucao };
  }, [naUti]);

  const visiveis = useMemo(() => (soAcao ? naUti.filter(precisaAcao) : naUti), [naUti, soAcao]);

  // ---- estado vazio 1: nao ha leito ativo em banco nenhum -------------------
  if (linhas.length === 0) {
    return (
      <section className="round" aria-labelledby="round-vazio">
        <style dangerouslySetInnerHTML={{ __html: CSS_ROUND }} />
        <div className="round__vazio">
          <p className="round__vazio-ttl" id="round-vazio">
            Nenhum leito ativo
          </p>
          <p className="round__vazio-txt">
            A visão <code className="tabnum">vw_dashboard_uti</code> não devolveu nenhum paciente com leito ativo.
            Não há round a fazer — cadastre a admissão (ingestão da folha pela skill) e recarregue.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="round" aria-labelledby="round-ttl">
      <style dangerouslySetInnerHTML={{ __html: CSS_ROUND }} />

      <header className="round__cab">
        <div className="round__ttl-bloco">
          {/* o <h1> da rota e da TopBar; aqui comeca no h2 */}
          <h2 className="round__ttl" id="round-ttl">
            <span className="tabnum">{naUti.length}</span> leito{naUti.length === 1 ? "" : "s"}
            {filtro === "todas" ? "" : ` · ${ROTULO_UTI[filtro]}`} ·{" "}
            <span className="tabnum">{resumo.comAcao}</span> pedindo ação
          </h2>
          <p className="round__eyebrow">
            ordem: gravidade → alerta crítico → pendência alta → ATB em reavaliação → evolução atrasada
          </p>
        </div>

        <button
          type="button"
          className="round__toggle"
          aria-pressed={soAcao}
          onClick={() => setSoAcao((v: boolean) => !v)}
          title="Mostra só os leitos com alerta crítico, pendência de prioridade alta, ATB em reavaliação, evolução atrasada, ΔSOFA ≥ 2, crítico ou óbito"
        >
          {soAcao ? "Mostrando só quem precisa de ação" : "Só quem precisa de ação"}
        </button>
      </header>

      <ul className="round__resumo" aria-label="Resumo de ação">
        <li className="round__pill" style={{ color: "var(--danger)" }}>
          <span className="tabnum">{resumo.comCritico}</span> com alerta crítico
        </li>
        <li className="round__pill" style={{ color: "var(--danger)" }}>
          <span className="tabnum">{resumo.tarefasAltas}</span> pendência{resumo.tarefasAltas === 1 ? "" : "s"} de prioridade alta
        </li>
        <li className="round__pill" style={{ color: "var(--warning)" }}>
          <span className="tabnum">{resumo.atbRever}</span> ATB em D+{DIAS_ATENCAO} ou mais
        </li>
        <li className="round__pill" style={{ color: "var(--warning)" }}>
          <span className="tabnum">{resumo.semEvolucao}</span> sem evolução em 24 h
        </li>
        {lidoEm ? (
          <li className="round__lido tabnum" title="Momento em que esta página leu o banco">
            leitura {lidoEm}
          </li>
        ) : null}
      </ul>

      {/* cabecalho de colunas (so no desktop; no celular cada chip se explica) */}
      <div className="round__colunas" aria-hidden="true">
        <span>Leito</span>
        <span>Paciente</span>
        <span>SOFA</span>
        <span>Alertas e ATB</span>
        <span>Pendências</span>
      </div>

      {visiveis.length === 0 ? (
        <div className="round__vazio">
          <p className="round__vazio-ttl">
            {soAcao ? "Nenhum leito pedindo ação agora" : `Nenhum leito ativo em ${ROTULO_UTI[filtro]}`}
          </p>
          <p className="round__vazio-txt">
            {soAcao
              ? "Sem alerta crítico, pendência de prioridade alta, antibiótico em reavaliação ou evolução atrasada nos leitos deste filtro. Isso não substitui a visita: veja a lista completa."
              : `Há ${linhas.length} leito${linhas.length > 1 ? "s" : ""} ativo${linhas.length > 1 ? "s" : ""} nas outras UTIs — o filtro da barra superior está limitando esta lista.`}
          </p>
          <button
            type="button"
            className="round__acao"
            onClick={() => (soAcao ? setSoAcao(false) : setUti("todas"))}
          >
            {soAcao ? "Ver todos os leitos" : "Ver todas as UTIs"}
          </button>
        </div>
      ) : (
        <ul className="round__lista">
          {visiveis.map((l: LinhaRound) => (
            <li key={l.leito.paciente_id}>
              <Linha l={l} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// CSS do round (tokens do design system; nenhum hex).
// Desktop: 5 colunas alinhadas. Celular: a linha empilha e cada celula leva o
// proprio rotulo (por isso .round-row__rot some acima de 1000 px).
// ---------------------------------------------------------------------------
const CSS_ROUND = `
.round{display:flex;flex-direction:column;gap:12px;min-width:0}

.round__cab{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:10px 16px}
.round__ttl-bloco{display:flex;flex-direction:column;gap:2px;min-width:0}
.round__eyebrow{margin:0;font-size:var(--text-2xs,10px);font-weight:700;
  letter-spacing:var(--tracking-eyebrow,.08em);text-transform:uppercase;color:var(--text-muted)}
.round__ttl{margin:0;font-size:var(--text-lg,20px);font-weight:700;line-height:var(--leading-tight,1.15);
  color:var(--text-heading)}

.round__toggle{min-height:44px;padding:0 14px;border:1px solid var(--border-default);
  border-radius:var(--radius-pill,9999px);background:var(--surface-card);color:var(--text-body);
  font-family:inherit;font-size:var(--text-xs,11px);font-weight:700;cursor:pointer;
  transition:background var(--dur-fast,120ms) var(--ease-out,ease)}
.round__toggle:hover{background:var(--surface-raised);color:var(--text-heading)}
.round__toggle:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.round__toggle[aria-pressed="true"]{background:var(--accent-soft);border-color:var(--accent);color:var(--accent-text)}

.round__resumo{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;margin:0;padding:0;list-style:none}
.round__pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;
  border:1px solid var(--border-default);border-radius:var(--radius-pill,9999px);background:var(--surface-card);
  font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-wide,.04em);text-transform:uppercase}
.round__lido{margin-left:auto;font-size:var(--text-2xs,10px);color:var(--text-faint)}

.round__colunas{display:none}

.round__lista{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}

.round-row{display:grid;gap:6px 12px;padding:10px 12px;background:var(--surface-card);
  border:1px solid var(--border-default);border-radius:var(--radius-lg,12px);
  color:var(--text-body);text-decoration:none;box-shadow:var(--shadow-card);
  transition:box-shadow var(--dur-fast,120ms) var(--ease-out,ease),border-color var(--dur-fast,120ms) var(--ease-out,ease)}
.round-row:hover{box-shadow:var(--shadow-raised);border-color:var(--border-strong)}
.round-row:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.round-row--acao{background:color-mix(in srgb, var(--warning) 5%, var(--surface-card))}

.round-row__c{display:flex;flex-direction:column;gap:3px;min-width:0}
.round-row__rot{font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;color:var(--text-faint)}
.round-row__leito{font-size:var(--text-xs,11px);font-weight:700;letter-spacing:var(--tracking-wide,.04em);
  color:var(--text-muted)}
.round-row__grav{font-size:var(--text-2xs,10px);font-weight:700;text-transform:uppercase;
  letter-spacing:var(--tracking-wide,.04em)}
.round-row__nome{font-size:var(--text-md,17px);font-weight:700;line-height:var(--leading-tight,1.15);
  color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.round-row__meta{font-size:var(--text-xs,11px);color:var(--text-muted)}
.round-row__hd{font-size:var(--text-sm,13px);line-height:var(--leading-snug,1.35);color:var(--text-body);
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.round-row__sofa{font-size:var(--text-xl,24px);font-weight:700;line-height:1}
.round-row__delta{font-size:var(--text-xs,11px);font-weight:700}
.round-row__delta-un{color:var(--text-faint);font-weight:400}
.round-row__chips{display:flex;flex-wrap:wrap;align-items:center;gap:4px}
.round-chip{display:inline-flex;align-items:center;max-width:100%;padding:3px 8px;
  border-radius:var(--radius-pill,9999px);font-family:var(--font-mono,monospace);font-size:var(--text-2xs,10px);
  font-weight:700;letter-spacing:var(--tracking-wide,.04em);text-transform:uppercase;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.round-row__tarefa{font-size:var(--text-xs,11px);color:var(--text-muted);
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.round-row__vazio{font-size:var(--text-xs,11px);color:var(--text-faint)}

.round__vazio{display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding:28px 24px;
  background:var(--surface-card);border:1px dashed var(--border-strong);border-radius:var(--radius-xl,16px)}
.round__vazio-ttl{margin:0;font-size:var(--text-lg,20px);font-weight:700;color:var(--text-heading)}
.round__vazio-txt{margin:0;max-width:64ch;font-size:var(--text-sm,13px);line-height:var(--leading-normal,1.55);
  color:var(--text-muted)}
.round__vazio code{font-family:var(--font-mono,monospace);font-size:var(--text-xs,11px);color:var(--text-body)}
.round__acao{min-height:44px;padding:0 16px;border:1px solid var(--accent);border-radius:var(--radius-md,8px);
  background:var(--accent-soft);color:var(--accent-text);font-family:inherit;font-size:var(--text-sm,13px);
  font-weight:700;cursor:pointer}
.round__acao:hover{background:var(--surface-raised)}
.round__acao:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

@media (min-width:1000px){
  .round__colunas,.round-row{grid-template-columns:106px minmax(200px,2.2fr) 92px minmax(170px,1.5fr) minmax(170px,1.4fr)}
  .round__colunas{display:grid;gap:12px;padding:0 12px 0 18px;
    font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
    text-transform:uppercase;color:var(--text-faint)}
  .round-row{align-items:start}
  /* o rotulo da celula sai da VISTA (a coluna ja o mostra), mas continua no
     leitor de tela — senao o numero do SOFA seria lido sozinho, sem contexto */
  .round-row__rot{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;
    clip-path:inset(50%);white-space:nowrap;border:0}
}

@media (prefers-reduced-motion:reduce){.round-row,.round__toggle{transition:none}}
`;

export default RoundList;
