// ============================================================================
// SASI v2 — INDICE DE PACIENTES (/patients)
// ----------------------------------------------------------------------------
// Server Component. Lista e busca os pacientes, agrupados por UTI e ordenados
// por leito (indice: serve para ACHAR alguem; a triagem por gravidade e o War
// Room, em /beds).
//
// Camada de dados (src/lib/data):
//   listarPacientes(uti, { status })  -> tabela `pacientes`
//        cadastro completo: alergias, isolamento, IMC, patient_summary, data_adm.
//        Traz tambem altas/obitos quando o filtro pede status "todos".
//   listarLeitosAtivos(uti)           -> view `vw_dashboard_uti`
//        enriquece SO os leitos ativos com SOFA, ΔSOFA 24 h e pendencias abertas.
//   As duas sao casadas por paciente_id. Paciente sem linha na view (alta, obito)
//   fica com SOFA/pendencias = null e a tela imprime "—". NUNCA 0 como "vazio".
//
// Busca e filtros vivem na URL (?q=&uti=&status=) — sao Server Components, entao
// funcionam sem JavaScript, sao linkaveis e compartilhaveis. Nada de estado client.
// ============================================================================
import type { ReactElement } from "react";
import Link from "next/link";
import { listarLeitosAtivos, listarPacientes } from "@/lib/data";
import type { Paciente, StatusLeito, Uti, VwDashboardUti } from "@/types/clinical";
import type { Gravity } from "@/features/war-room/triage";
import {
  Chip,
  GravityBadge,
  ROTULO_ISOLAMENTO,
  ROTULO_STATUS,
  TRAVESSAO,
  diasInternacao,
  fmtNum,
  gravityDoPaciente,
  rotuloLeito,
  txt,
} from "@/features/patients/components/PatientHeader";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Parametros de busca (URL)
// ---------------------------------------------------------------------------
type ParamsBusca = { [chave: string]: string | string[] | undefined };

const primeiro = (v: string | string[] | undefined): string => (Array.isArray(v) ? (v[0] ?? "") : (v ?? "")).trim();

const ehUti = (v: string): v is Uti => v === "UTI2" || v === "UTI3" || v === "UTI4";

const OPCOES_UTI: readonly string[] = ["todas", "UTI2", "UTI3", "UTI4"];

/** Minusculas sem acento — busca que aceita "jose" achando "José". */
const semAcento = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

interface LinhaIndice {
  p: Paciente;
  gravity: Gravity;
  /** Hoje − data_adm (fuso do plantao). Sem data => null. */
  dias: number | null;
  /** vw_dashboard_uti — so existe para leito ativo. */
  sofa: number | null;
  pendencias: number | null;
  /** Texto normalizado onde a busca procura. */
  alvo: string;
}

export interface PatientsPageProps {
  searchParams: Promise<ParamsBusca>;
}

export default async function PatientsPage({ searchParams }: PatientsPageProps): Promise<ReactElement> {
  const sp = await searchParams;
  const q = primeiro(sp.q);
  const utiParam = primeiro(sp.uti);
  const uti: Uti | null = ehUti(utiParam) ? utiParam : null;
  const status: StatusLeito | "todos" = primeiro(sp.status) === "todos" ? "todos" : "ativo";

  const [pacientes, leitos] = await Promise.all([listarPacientes(uti, { status }), listarLeitosAtivos(uti)]);

  const porPaciente = new Map<string, VwDashboardUti>();
  for (const l of leitos) porPaciente.set(l.paciente_id, l);

  const linhas: LinhaIndice[] = pacientes.map((p: Paciente): LinhaIndice => {
    const v = porPaciente.get(p.id);
    return {
      p,
      gravity: gravityDoPaciente(p, {
        delta_sofa_24h: v?.delta_sofa_24h ?? null,
        pendencias_abertas: v?.pendencias_abertas ?? null,
      }),
      dias: diasInternacao(p.data_adm),
      sofa: v?.sofa_total ?? null,
      pendencias: v?.pendencias_abertas ?? null,
      alvo: semAcento(`${p.nome} ${p.uti} ${p.leito} ${p.hd ?? ""}`),
    };
  });

  const termos = semAcento(q)
    .split(/\s+/)
    .filter((t: string) => t.length > 0);
  const achadas =
    termos.length === 0 ? linhas : linhas.filter((l: LinhaIndice) => termos.every((t: string) => l.alvo.includes(t)));

  // Agrupa por UTI mantendo a ordem do banco (uti, leito).
  const grupos: Array<{ uti: string; itens: LinhaIndice[] }> = [];
  for (const l of achadas) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.uti === l.p.uti) ultimo.itens.push(l);
    else grupos.push({ uti: l.p.uti, itens: [l] });
  }

  /** Link de filtro preservando o resto da URL. */
  const rota = (patch: { uti?: string; status?: string }): string => {
    const busca = new URLSearchParams();
    const utiAlvo = patch.uti ?? uti ?? "todas";
    const statusAlvo = patch.status ?? status;
    if (q) busca.set("q", q);
    if (utiAlvo !== "todas") busca.set("uti", utiAlvo);
    if (statusAlvo !== "ativo") busca.set("status", statusAlvo);
    const s = busca.toString();
    return s ? `/patients?${s}` : "/patients";
  };

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: CSS_INDICE }} />

      {/* ---- busca + filtros ---- */}
      <div className="pac-topo">
        <form className="pac-busca" method="get" action="/patients" role="search">
          <input
            className="pac-input"
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Nome, leito ou hipótese diagnóstica"
            aria-label="Buscar paciente por nome, leito ou hipótese diagnóstica"
          />
          {uti ? <input type="hidden" name="uti" value={uti} /> : null}
          {status !== "ativo" ? <input type="hidden" name="status" value={status} /> : null}
          <button className="pac-btn" type="submit">
            Buscar
          </button>
        </form>

        <div className="pac-filtros" role="group" aria-label="Filtrar por UTI">
          {OPCOES_UTI.map((opcao: string) => {
            const ativo = opcao === (uti ?? "todas");
            return (
              <Link
                key={opcao}
                href={rota({ uti: opcao })}
                className="pac-filtro"
                aria-current={ativo ? "page" : undefined}
              >
                {opcao === "todas" ? "Todas" : opcao}
              </Link>
            );
          })}
        </div>

        <Link
          href={rota({ status: status === "todos" ? "ativo" : "todos" })}
          className="pac-filtro"
          aria-current={status === "todos" ? "page" : undefined}
          title="Inclui altas, óbitos e transferências (pacientes.status_leito)"
        >
          {status === "todos" ? "Todos os status" : "Só leitos ativos"}
        </Link>
      </div>

      <p className="pac-contagem">
        {termos.length > 0 ? (
          <>
            <span className="tabnum">{achadas.length}</span> de <span className="tabnum">{linhas.length}</span>{" "}
            {linhas.length === 1 ? "paciente" : "pacientes"} para <strong>“{q}”</strong>
          </>
        ) : (
          <>
            <span className="tabnum">{linhas.length}</span> {linhas.length === 1 ? "paciente" : "pacientes"}
            {status === "ativo" ? " em leito ativo" : " (todos os status)"}
            {uti ? ` · ${uti}` : ""}
          </>
        )}
      </p>

      {/* ---- lista ---- */}
      {achadas.length === 0 ? (
        <div className="pac-vazio">
          <strong>{linhas.length === 0 ? "Nenhum paciente nesse filtro" : "Nenhum paciente para essa busca"}</strong>
          <span>
            {linhas.length === 0
              ? "Troque a UTI ou inclua os outros status do leito."
              : "Tente parte do nome, o leito (ex.: L07) ou uma palavra da hipótese diagnóstica."}
          </span>
          {q ? (
            <Link className="pac-filtro" href={rota({})}>
              Limpar busca
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="pac-grupos">
          {grupos.map((g: { uti: string; itens: LinhaIndice[] }) => (
            <section key={g.uti}>
              <h2 className="pac-grupo">
                <span className="tabnum">{g.uti}</span>
                <span>
                  {g.itens.length} {g.itens.length === 1 ? "paciente" : "pacientes"}
                </span>
              </h2>

              <div className="pac-grade">
                {g.itens.map((l: LinhaIndice) => (
                  <CardPaciente key={l.p.id} linha={l} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card do indice — clicavel, leva para /patients/[id] (aba Resumo).
// ---------------------------------------------------------------------------
function CardPaciente({ linha }: { linha: LinhaIndice }): ReactElement {
  const { p, gravity, dias, sofa, pendencias } = linha;
  const alergias = txt(p.alergias) ?? txt(p.patient_summary?.alergias);
  const isolamento = p.isolation !== "none" ? ROTULO_ISOLAMENTO[p.isolation] : null;
  const hd = txt(p.hd);

  return (
    <Link
      href={`/patients/${p.id}`}
      className="pac-card"
      style={{
        borderLeftColor: `var(--grav-${gravity}-solid)`,
        background: `color-mix(in srgb, var(--grav-${gravity}-solid) 5%, var(--surface-card))`,
      }}
    >
      <div className="pac-card__topo">
        <span className="tabnum pac-leito">{rotuloLeito(p.uti, p.leito)}</span>
        <GravityBadge gravity={gravity} />
      </div>

      <strong className="pac-nome">{txt(p.nome) ?? TRAVESSAO}</strong>
      <span className="pac-hd" title="Hipóteses diagnósticas / problemas ativos">
        {hd ?? TRAVESSAO}
      </span>

      <div className="pac-metricas tabnum">
        {/* Sem idade gravada sai so o travessao: "— a" sugeriria unidade de um dado que nao existe. */}
        <span title="Idade">{p.idade == null ? TRAVESSAO : `${fmtNum(p.idade, 0)} a`}</span>
        <span title="Dias de internação">int. {dias == null ? TRAVESSAO : `${dias} d`}</span>
        <span title="SOFA da última evolução (vw_dashboard_uti)">SOFA {fmtNum(sofa, 0)}</span>
        {pendencias != null && pendencias > 0 ? <span title="Pendências abertas">pend. {pendencias}</span> : null}
      </div>

      {alergias || isolamento || p.status_leito !== "ativo" ? (
        <div className="pac-chips">
          {alergias ? (
            <Chip tom="alerta" titulo={alergias}>
              Alergia
            </Chip>
          ) : null}
          {isolamento ? <Chip tom="atencao">Isol. {isolamento}</Chip> : null}
          {p.status_leito !== "ativo" ? <Chip>{ROTULO_STATUS[p.status_leito]}</Chip> : null}
        </div>
      ) : null}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// CSS do indice (classes .pac-*). So tokens do design system — zero hex.
// ---------------------------------------------------------------------------
const CSS_INDICE = `
.pac-topo{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:10px}
.pac-busca{display:flex;align-items:center;gap:8px;flex:1 1 280px;min-width:0}
.pac-input{flex:1 1 auto;min-width:0;min-height:44px;padding:0 12px;
  border:1px solid var(--border-default);border-radius:var(--radius-md,8px);
  background:var(--surface-card);color:var(--text-body);
  font-family:inherit;font-size:var(--text-sm,13px)}
.pac-input::placeholder{color:var(--text-faint)}
.pac-input:focus-visible{outline:2px solid var(--accent);outline-offset:1px;border-color:var(--accent)}

.pac-btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 14px;
  border:1px solid var(--border-default);border-radius:var(--radius-md,8px);
  background:var(--surface-card);color:var(--text-body);cursor:pointer;
  font-family:inherit;font-size:var(--text-2xs,10px);font-weight:700;
  letter-spacing:var(--tracking-eyebrow,.08em);text-transform:uppercase;
  transition:background var(--dur-fast,120ms) var(--ease-out,ease),color var(--dur-fast,120ms) var(--ease-out,ease)}
.pac-btn:hover{background:var(--surface-raised);color:var(--text-heading)}
.pac-btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

.pac-filtros{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.pac-filtro{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 12px;
  border:1px solid var(--border-default);border-radius:var(--radius-pill,9999px);
  background:var(--surface-card);color:var(--text-muted);text-decoration:none;
  font-family:var(--font-mono,monospace);font-size:var(--text-xs,11px);font-weight:600;
  letter-spacing:var(--tracking-wide,.04em);font-variant-numeric:tabular-nums;
  transition:background var(--dur-fast,120ms) var(--ease-out,ease),color var(--dur-fast,120ms) var(--ease-out,ease)}
.pac-filtro:hover{background:var(--surface-raised);color:var(--text-heading)}
.pac-filtro:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.pac-filtro[aria-current="page"]{background:var(--accent-soft);border-color:var(--accent);color:var(--accent-text)}

.pac-contagem{margin:0 0 16px;font-size:var(--text-xs,11px);color:var(--text-muted)}

.pac-grupos{display:flex;flex-direction:column;gap:20px}
.pac-grupo{display:flex;align-items:center;gap:10px;margin:0 0 8px;
  font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;color:var(--text-muted)}
.pac-grupo::after{content:"";flex:1 1 auto;height:1px;background:var(--border-default)}
.pac-grupo>span:last-child{order:3;white-space:nowrap}

.pac-grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}

.pac-card{display:flex;flex-direction:column;gap:7px;min-width:0;padding:12px 14px;
  border:1px solid var(--border-default);border-left:6px solid var(--border-strong);
  border-radius:var(--radius-xl,16px);box-shadow:var(--shadow-card);
  color:var(--text-body);text-decoration:none;
  transition:box-shadow var(--dur-fast,120ms) var(--ease-out,ease),transform var(--dur-fast,120ms) var(--ease-out,ease)}
.pac-card:hover{box-shadow:var(--shadow-raised);transform:translateY(-1px)}
.pac-card:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.pac-card__topo{display:flex;align-items:center;justify-content:space-between;gap:8px}
.pac-leito{font-size:var(--text-sm,13px);font-weight:700;letter-spacing:var(--tracking-wide,.04em);
  color:var(--text-heading)}
.pac-nome{font-size:var(--text-md,17px);font-weight:700;line-height:var(--leading-tight,1.15);
  color:var(--text-heading);overflow-wrap:anywhere}
.pac-hd{font-size:var(--text-sm,13px);line-height:var(--leading-snug,1.35);color:var(--text-muted);
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pac-metricas{display:flex;flex-wrap:wrap;gap:3px 10px;font-size:var(--text-xs,11px);color:var(--text-muted)}
.pac-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:1px}

.pac-vazio{display:flex;flex-direction:column;align-items:center;gap:8px;padding:32px 16px;text-align:center;
  background:var(--surface-card);border:1px dashed var(--border-strong);border-radius:var(--radius-lg,12px)}
.pac-vazio strong{font-size:var(--text-md,17px);color:var(--text-heading)}
.pac-vazio span{font-size:var(--text-sm,13px);color:var(--text-muted)}

@media (prefers-reduced-motion:reduce){
  .pac-card,.pac-filtro,.pac-btn{transition:none}
  .pac-card:hover{transform:none}
}
`;
