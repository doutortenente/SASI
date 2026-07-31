// ============================================================================
// SASI v2 — ProblemaConduta (impressao <-> conduta, pareadas 1:1)
// ----------------------------------------------------------------------------
// Recebe `evolucoes.impressao` (text[]) e `evolucoes.conduta` (text[]) e imprime
// o par lado a lado, casado PELO INDICE: problema 1 <-> conduta 1. Recebe tambem
// os JSONB estruturados (problemas_ativos, condutas_sistemas, riscos).
// Nao le banco, nao reordena, nao completa nada. Server Component — mas o modulo
// nao tem diretiva: NotaPreview ('use client') reusa parear() daqui, para que a
// regra 1:1 tenha UMA implementacao so (divergencia = bug clinico-legal).
//
// DOUTRINA APLICADA
//  1. CONDUTA 1:1 COM A IMPRESSAO (CLAUDE.md §2.4). Lista de tamanhos diferentes
//     e ERRO CLINICO-LEGAL, nao detalhe de layout: o item orfao sai marcado
//     "sem par — revisar", em --danger, e a tela abre com um aviso contando
//     quantos sao. O app NAO inventa a conduta que falta nem esconde a sobra.
//  2. O pareamento NUNCA compacta a lista. Item vazio no meio de `impressao`
//     vira "sem par" naquela posicao — filtra-lo deslocaria todas as condutas
//     seguintes e casaria problema com conduta ERRADA.
//  3. ZERO ALUCINACAO. JSONB vazio => a tela diz que esta vazio; nao preenche.
//  4. Conduta estruturada sem `meta` sai marcada: a doutrina exige meta
//     (numerica) em toda conduta. Flag grita, nao conserta.
//  5. Cor so por token. Numero em .tabnum. Zero hex.
//
// O CSS (CSS_PROBLEMA_CONDUTA) e injetado UMA vez pela pagina da aba — padrao
// BedGrid/VitalsTable (hover, scroll e stacking nao cabem em estilo inline).
// ============================================================================
import type { ReactElement } from "react";
import type { CondutaSistema, ProblemaAtivo, Risco } from "@/types/clinical";
import { unidadeSegura } from "@/lib/formatters/br";
import { TRAVESSAO } from "./SystemPanel";

// ---------------------------------------------------------------------------
// A regra 1:1 (fonte unica — a nota de prontuario usa esta mesma funcao)
// ---------------------------------------------------------------------------

/** Uma linha do pareamento problema <-> conduta. */
export interface ParImpressaoConduta {
  /** Posicao 1-based no array do banco (preservada mesmo se a linha for pulada). */
  n: number;
  impressao: string | null;
  conduta: string | null;
  /** Qual lado FALTA nesta posicao. null = par completo. */
  faltando: "impressao" | "conduta" | null;
}

/** text[] do banco -> lista posicional; item vazio vira null SEM sair da posicao. */
function posicional(v: readonly string[] | null | undefined): Array<string | null> {
  if (!Array.isArray(v)) return [];
  return v.map((s: string) => (typeof s === "string" && s.trim().length > 0 ? s.trim() : null));
}

/**
 * Casa impressao e conduta pelo INDICE. O tamanho da tabela e o MAIOR dos dois:
 * sobra de um lado vira orfao explicito, nunca some.
 * Posicao vazia nas DUAS listas nao vira linha (nao ha o que revisar) — mas a
 * numeracao segue a posicao original, entao um salto na numeracao denuncia o buraco.
 */
export function parear(
  impressao: readonly string[] | null | undefined,
  conduta: readonly string[] | null | undefined,
): ParImpressaoConduta[] {
  const imp = posicional(impressao);
  const con = posicional(conduta);
  const total = Math.max(imp.length, con.length);
  const saida: ParImpressaoConduta[] = [];
  for (let i = 0; i < total; i += 1) {
    const a = imp[i] ?? null;
    const b = con[i] ?? null;
    if (a == null && b == null) continue;
    saida.push({ n: i + 1, impressao: a, conduta: b, faltando: a == null ? "impressao" : b == null ? "conduta" : null });
  }
  return saida;
}

/** Quantos pares estao quebrados (um dos lados ausente). */
export function contarOrfaos(pares: readonly ParImpressaoConduta[]): number {
  return pares.filter((p: ParImpressaoConduta) => p.faltando !== null).length;
}

// ---------------------------------------------------------------------------
// Leitura segura dos JSONB estruturados
// ---------------------------------------------------------------------------
function texto(v: string | null | undefined): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function comoLista<T>(v: readonly T[] | null | undefined): T[] {
  return Array.isArray(v) ? [...v] : [];
}

/** Sistema escrito a mao no JSONB -> token de cor do design system. */
const TOKEN_SISTEMA: Readonly<Record<string, string>> = {
  neuro: "neuro",
  neurologico: "neuro",
  snc: "neuro",
  resp: "resp",
  respiratorio: "resp",
  hemo: "hemo",
  hemodinamico: "hemo",
  cv: "hemo",
  cardiovascular: "hemo",
  hemo_cv: "hemo",
  tgi: "tgi",
  gi: "tgi",
  digestivo: "tgi",
  renal: "renal",
  hemato: "hemato",
  hematologico: "hemato",
  infecto: "infecto",
  infeccioso: "infecto",
};

/** Chip do sistema, colorido pelo token quando reconhecido. Desconhecido = neutro. */
function ChipSistema({ sistema }: { sistema: string | null }): ReactElement | null {
  if (!sistema) return null;
  // hasOwn: sistema e texto livre do JSONB — "constructor"/"toString" cairiam na
  // heranca do Object e devolveriam funcao em vez de undefined (chip quebrado).
  const chave = sistema.toLowerCase();
  const token = Object.hasOwn(TOKEN_SISTEMA, chave) ? TOKEN_SISTEMA[chave] : undefined;
  return (
    <span
      className="pc-chip"
      title={token ? `Sistema: ${sistema}` : `Sistema "${sistema}" fora do vocabulário conhecido — exibido como está`}
      style={{
        background: token ? `var(--sys-${token}-bg)` : "var(--surface-sunken)",
        color: token ? `var(--sys-${token})` : "var(--text-muted)",
        borderColor: token ? `var(--sys-${token}-bar)` : "var(--border-default)",
      }}
    >
      {sistema}
    </span>
  );
}

const TOM_GRAVIDADE: Readonly<Record<string, string>> = {
  leve: "stable",
  moderada: "watcher",
  grave: "unstable",
  critica: "critical",
};

const TOM_NIVEL: Readonly<Record<string, string>> = {
  baixo: "stable",
  medio: "watcher",
  alto: "critical",
};

/** Chip da escala (gravidade / nivel). Valor fora do vocabulario sai NEUTRO e cru. */
function ChipEscala({ rotulo, tom }: { rotulo: string; tom: string | undefined }): ReactElement {
  if (!tom) {
    return (
      <span className="pc-chip" title={`"${rotulo}" fora do vocabulário conhecido — exibido como está, sem cor de escala`}>
        {rotulo}
      </span>
    );
  }
  return (
    <span
      className="pc-chip"
      style={{ background: `var(--grav-${tom}-bg)`, color: `var(--grav-${tom}-text)`, borderColor: `var(--grav-${tom}-solid)` }}
    >
      {rotulo}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export interface ProblemaCondutaProps {
  /** evolucoes.impressao (text[]) — 1 problema por item. */
  impressao: readonly string[] | null | undefined;
  /** evolucoes.conduta (text[]) — 1 acao por item, na MESMA ordem. */
  conduta: readonly string[] | null | undefined;
  /** evolucoes.problemas_ativos (jsonb). */
  problemasAtivos?: readonly ProblemaAtivo[] | null;
  /** evolucoes.condutas_sistemas (jsonb) — com meta e prazo. */
  condutasSistemas?: readonly CondutaSistema[] | null;
  /** evolucoes.riscos (jsonb). */
  riscos?: readonly Risco[] | null;
}

export function ProblemaConduta({
  impressao,
  conduta,
  problemasAtivos,
  condutasSistemas,
  riscos,
}: ProblemaCondutaProps): ReactElement {
  const pares = parear(impressao, conduta);
  const orfaos = contarOrfaos(pares);

  const problemas = comoLista(problemasAtivos).filter((p: ProblemaAtivo) => texto(p?.texto) !== null);
  const condutas = comoLista(condutasSistemas).filter((c: CondutaSistema) => texto(c?.texto) !== null);
  const listaRiscos = comoLista(riscos).filter((r: Risco) => texto(r?.texto) !== null);

  const vazios: string[] = [];
  if (problemas.length === 0) vazios.push("problemas_ativos");
  if (condutas.length === 0) vazios.push("condutas_sistemas");
  if (listaRiscos.length === 0) vazios.push("riscos");

  return (
    <div className="pc">
      {/* ---------------------------------------------------------------- */}
      {/* 1. o par 1:1 — o coracao da ficha                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="pc-bloco" aria-labelledby="pc-titulo">
        <div className="pc-cab">
          <h2 className="pc-cab__ttl" id="pc-titulo">
            Impressão e conduta
          </h2>
          <span className="pc-cab__sub tabnum">
            {pares.length === 0 ? "nenhum par" : `${pares.length} par${pares.length > 1 ? "es" : ""}`}
            {orfaos > 0 ? ` · ${orfaos} sem par` : ""}
          </span>
        </div>

        {orfaos > 0 ? (
          <p className="pc-alerta" role="note">
            <strong>
              {orfaos} item{orfaos > 1 ? "s" : ""} sem par nesta evolução.
            </strong>{" "}
            A doutrina exige <strong>uma conduta para cada problema</strong> (1:1, com meta numérica). Problema sem
            conduta ou conduta sem problema é falha clínico-legal do registro — o app sinaliza e{" "}
            <strong>não completa</strong> a lista. Correção é na evolução, em{" "}
            <code className="tabnum">evolucoes.impressao</code> / <code className="tabnum">evolucoes.conduta</code>.
          </p>
        ) : null}

        {pares.length === 0 ? (
          <p className="pc-vazio">
            Nenhuma impressão ou conduta registrada nesta evolução (<code className="tabnum">impressao</code> e{" "}
            <code className="tabnum">conduta</code> vazias).
          </p>
        ) : (
          <div className="pc-wrap" role="region" aria-label="Problema → Conduta — rolagem horizontal" tabIndex={0}>
            <table className="pc-tab">
              <caption className="pc-tab__cap">
                Cada linha é um problema e a sua conduta — casados pela posição na lista
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="pc-th pc-th--n">
                    #
                  </th>
                  <th scope="col" className="pc-th">
                    Impressão (problema)
                  </th>
                  <th scope="col" className="pc-th">
                    Conduta (ação)
                  </th>
                </tr>
              </thead>
              <tbody>
                {pares.map((p: ParImpressaoConduta) => (
                  <tr key={p.n} className={p.faltando ? "pc-tr pc-tr--quebrado" : "pc-tr"}>
                    <th scope="row" className="pc-n tabnum">
                      {p.n}
                    </th>
                    <td className="pc-td">
                      {p.impressao ?? (
                        <span
                          className="pc-orfao"
                          title="há conduta nesta posição, mas nenhum problema correspondente — registrar o problema ou remover a conduta"
                        >
                          sem par {TRAVESSAO} revisar
                        </span>
                      )}
                    </td>
                    <td className="pc-td">
                      {p.conduta ?? (
                        <span
                          className="pc-orfao"
                          title="há problema nesta posição, mas nenhuma conduta correspondente — problema ativo sem ação é falha do registro"
                        >
                          sem par {TRAVESSAO} revisar
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 2. problemas ativos (JSONB estruturado)                           */}
      {/* ---------------------------------------------------------------- */}
      {problemas.length > 0 ? (
        <section className="pc-bloco" aria-labelledby="pc-pa">
          <div className="pc-cab">
            <h3 className="pc-cab__ttl2" id="pc-pa">
              Problemas ativos
            </h3>
            <span className="pc-cab__sub tabnum">{problemas.length}</span>
          </div>
          <ul className="pc-lista">
            {problemas.map((p: ProblemaAtivo, i: number) => (
              <li key={`${i}-${p.texto}`} className="pc-item">
                <span className="pc-item__txt">{texto(p.texto)}</span>
                <span className="pc-item__chips">
                  <ChipSistema sistema={texto(p.sistema)} />
                  {texto(p.gravidade) ? (
                    <ChipEscala rotulo={String(p.gravidade)} tom={TOM_GRAVIDADE[String(p.gravidade).toLowerCase()]} />
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* 3. condutas por sistema (com meta e prazo)                        */}
      {/* ---------------------------------------------------------------- */}
      {condutas.length > 0 ? (
        <section className="pc-bloco" aria-labelledby="pc-cs">
          <div className="pc-cab">
            <h3 className="pc-cab__ttl2" id="pc-cs">
              Condutas por sistema
            </h3>
            <span className="pc-cab__sub tabnum">{condutas.length}</span>
          </div>
          <ul className="pc-lista">
            {condutas.map((c: CondutaSistema, i: number) => {
              // unidadeSegura: a meta e texto livre com DOSE ("nora < 0,05 µg/kg/min")
              // e o chip usa caixa alta — µ viraria "M" (o bug original da dose 1000x).
              const meta = unidadeSegura(texto(c.meta) ?? "") || null;
              const prazo = unidadeSegura(texto(c.prazo) ?? "") || null;
              return (
                <li key={`${i}-${c.texto}`} className="pc-item">
                  <span className="pc-item__txt">{texto(c.texto)}</span>
                  <span className="pc-item__chips">
                    <ChipSistema sistema={texto(c.sistema)} />
                    {meta ? (
                      <span className="pc-chip pc-chip--meta" title="Meta desta conduta (condutas_sistemas.meta)">
                        meta {meta}
                      </span>
                    ) : (
                      <span
                        className="pc-chip pc-chip--faltando"
                        title="conduta gravada sem meta — a doutrina exige meta numérica em toda conduta"
                      >
                        sem meta {TRAVESSAO} revisar
                      </span>
                    )}
                    {prazo ? (
                      <span className="pc-chip pc-chip--prazo" title="Prazo desta conduta (condutas_sistemas.prazo)">
                        prazo {prazo}
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* 4. riscos                                                         */}
      {/* ---------------------------------------------------------------- */}
      {listaRiscos.length > 0 ? (
        <section className="pc-bloco" aria-labelledby="pc-ri">
          <div className="pc-cab">
            <h3 className="pc-cab__ttl2" id="pc-ri">
              Riscos
            </h3>
            <span className="pc-cab__sub tabnum">{listaRiscos.length}</span>
          </div>
          <ul className="pc-lista">
            {listaRiscos.map((r: Risco, i: number) => (
              <li key={`${i}-${r.texto}`} className="pc-item">
                <span className="pc-item__txt">{texto(r.texto)}</span>
                <span className="pc-item__chips">
                  {texto(r.nivel) ? (
                    <ChipEscala rotulo={String(r.nivel)} tom={TOM_NIVEL[String(r.nivel).toLowerCase()]} />
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* 5. o que NAO foi preenchido — dito, nunca preenchido pelo app     */}
      {/* ---------------------------------------------------------------- */}
      {vazios.length > 0 ? (
        <p className="pc-nota">
          Sem registro estruturado em{" "}
          {vazios.map((v: string, i: number) => (
            <span key={v}>
              <code className="tabnum">{v}</code>
              {i < vazios.length - 1 ? (i === vazios.length - 2 ? " e " : ", ") : ""}
            </span>
          ))}{" "}
          nesta evolução. {vazios.length === 3 ? "O par impressão ⇄ conduta acima é a única fonte." : null} O app não
          deriva esses campos a partir do texto.
        </p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CSS do bloco. Injetado UMA vez pela pagina da aba (padrao VitalsTable).
// So tokens do design system — zero hex.
// ---------------------------------------------------------------------------
export const CSS_PROBLEMA_CONDUTA = `
.pc{display:flex;flex-direction:column;gap:18px;min-width:0}
.pc-bloco{display:flex;flex-direction:column;gap:8px;min-width:0}

.pc-cab{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap}
.pc-cab__ttl{margin:0;font-size:var(--text-lg,20px);font-weight:700;color:var(--text-heading)}
.pc-cab__ttl2{margin:0;font-size:var(--text-md,17px);font-weight:700;color:var(--text-heading)}
.pc-cab__sub{font-size:var(--text-xs,11px);color:var(--text-muted)}

.pc-alerta{margin:0;padding:10px 12px;
  background:color-mix(in srgb, var(--danger) 8%, var(--surface-card));
  border:1px solid color-mix(in srgb, var(--danger) 34%, transparent);
  border-left:4px solid var(--danger);border-radius:var(--radius-lg,12px);
  font-size:var(--text-sm,13px);line-height:var(--leading-snug,1.35);color:var(--text-body)}
.pc-alerta strong{color:var(--text-heading)}

.pc-vazio{margin:0;padding:20px 16px;text-align:center;
  background:var(--surface-card);border:1px dashed var(--border-strong);border-radius:var(--radius-lg,12px);
  font-size:var(--text-sm,13px);color:var(--text-muted)}

.pc-wrap:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.pc-wrap{overflow-x:auto;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;
  background:var(--surface-card);border:1px solid var(--border-default);
  border-radius:var(--radius-xl,16px);box-shadow:var(--shadow-card)}
.pc-tab{width:100%;min-width:560px;border-collapse:collapse}
.pc-tab__cap{caption-side:top;text-align:left;padding:12px 14px 8px;
  font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;color:var(--text-muted)}

.pc-th{padding:8px 12px;text-align:left;white-space:nowrap;
  background:var(--surface-sunken);border-bottom:1px solid var(--border-default);
  font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;color:var(--text-muted)}
.pc-th--n{width:44px;text-align:right}

.pc-tr{border-bottom:1px solid var(--border-subtle)}
.pc-tr:last-child{border-bottom:0}
.pc-tr--quebrado{background:color-mix(in srgb, var(--danger) 6%, transparent)}

.pc-n{min-height:44px;padding:10px 12px;text-align:right;vertical-align:top;
  font-size:var(--text-sm,13px);font-weight:700;color:var(--text-faint)}
.pc-td{padding:10px 12px;vertical-align:top;width:50%;
  font-size:var(--text-sm,13px);line-height:var(--leading-normal,1.55);color:var(--text-body)}
.pc-orfao{display:inline-block;font-weight:700;color:var(--danger);text-transform:uppercase;
  letter-spacing:var(--tracking-wide,.04em);font-size:var(--text-xs,11px)}

.pc-lista{display:flex;flex-direction:column;gap:1px;margin:0;padding:0;list-style:none;
  background:var(--border-subtle);border:1px solid var(--border-default);
  border-radius:var(--radius-lg,12px);overflow:hidden}
.pc-item{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;min-height:44px;
  padding:10px 12px;background:var(--surface-card)}
.pc-item__txt{flex:1 1 260px;min-width:0;font-size:var(--text-sm,13px);
  line-height:var(--leading-normal,1.55);color:var(--text-body)}
.pc-item__chips{display:flex;flex-wrap:wrap;gap:4px}

.pc-chip{display:inline-flex;align-items:center;padding:2px 8px;
  border:1px solid var(--border-default);border-radius:var(--radius-pill,9999px);
  background:var(--surface-sunken);color:var(--text-muted);
  font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-wide,.04em);
  text-transform:uppercase;white-space:nowrap}
.pc-chip--meta{background:var(--accent-soft);color:var(--accent-text);border-color:var(--accent)}
.pc-chip--prazo{background:var(--badge-pend-bg);color:var(--badge-pend-text);border-color:transparent}
.pc-chip--faltando{background:color-mix(in srgb, var(--warning) 14%, transparent);color:var(--warning);
  border-color:color-mix(in srgb, var(--warning) 34%, transparent)}

.pc-nota{margin:0;font-size:var(--text-xs,11px);line-height:var(--leading-snug,1.35);color:var(--text-faint)}
`;

export default ProblemaConduta;
