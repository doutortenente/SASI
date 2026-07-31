// ============================================================================
// SASI v2 — TabelaoLabs (o "folhao" de laboratorio)
// ----------------------------------------------------------------------------
// Tabela serial multi-dia no formato da planilha original do plantao:
//   LINHAS = exames (agrupados por bloco clinico)   COLUNAS = dias
// Coluna mais RECENTE a esquerda (e a que muda conduta agora), historico a direita.
//
// Server Component: recebe a matriz JA lida do banco (Folhao, de serieLabs) e so
// desenha. Zero consulta, zero calculo clinico aqui.
//
// DOUTRINA APLICADA
//  - ZERO ALUCINACAO: dia sem coleta => "—". NUNCA repete o valor do dia anterior
//    para "preencher" a celula, nunca usa 0 como vazio, nunca chuta unidade.
//  - Rotulo e unidade vem SEMPRE de evento_tipo_ref (via Folhao). Aqui so
//    escrevemos os CODIGOS e o titulo dos blocos — nenhum nome de exame na mao.
//  - Valor exibido = ULTIMO do dia. Houve mais de uma coleta? o title diz quantas
//    e traz o par MAXIMO–MINIMO nessa ordem (regra Max-Min da doutrina).
//  - Fora da faixa fisiologica de evento_tipo_ref = flag de IMPLAUSIBILIDADE
//    ("rever a fonte"), nao "fora do normal clinico". Destaque + title explicando.
//  - Cor nunca e o unico sinal: fora de faixa tem "!" e revisao pendente tem "?".
//  - Precisao preservada: 7,35 continua 7,35 (fmtLab le as casas do valor gravado).
//  - Todas as cores por token CSS. Zero hex neste arquivo.
// ============================================================================
import { unidadeSegura } from "@/lib/formatters/br";
import type { ReactElement } from "react";
import type { Folhao, FolhaoCelula, FolhaoLinha } from "@/lib/data";
import {
  CSS_DELTA_BADGE,
  DeltaBadge,
  diaCurto,
  diaLongo,
  distanciaEmDias,
  fmtLab,
} from "./DeltaBadge";

// ---------------------------------------------------------------------------
// Blocos do folhao — ORDEM CLINICA de leitura do plantao.
// So codigos de evento_tipo_ref: o nome que aparece na tela vem do banco.
// ---------------------------------------------------------------------------
export interface GrupoExames {
  id: string;
  /** Titulo do bloco (nao e nome de exame — e a secao da planilha). */
  titulo: string;
  /** Token de cor do sistema correspondente (design system). */
  cor: string;
  /** Codigos de evento_tipo_ref, na ordem em que devem aparecer. */
  tipos: readonly string[];
}

export const GRUPOS_FOLHAO: readonly GrupoExames[] = [
  { id: "hemato", titulo: "Hematologia", cor: "var(--sys-hemato)", tipos: ["hb", "ht", "plaq", "leuco", "inr"] },
  { id: "renal", titulo: "Renal e eletrólitos", cor: "var(--sys-renal)", tipos: ["ur", "cr", "na", "k", "mg", "ca", "p"] },
  { id: "gaso", titulo: "Gasometria", cor: "var(--sys-resp)", tipos: ["ph", "pco2", "po2", "hco3", "be", "lactato", "pf_ratio"] },
  { id: "infecto", titulo: "Infecto e hepático", cor: "var(--sys-infecto)", tipos: ["pcr", "procalcitonina", "bb"] },
] as const;

/** Lista achatada, na ordem do folhao — e o que a pagina manda para serieLabs(). */
export const TIPOS_FOLHAO: readonly string[] = GRUPOS_FOLHAO.flatMap((g: GrupoExames) => [...g.tipos]);

// ---------------------------------------------------------------------------
// Formatadores locais
// ---------------------------------------------------------------------------
const TZ = "America/Sao_Paulo";
const FMT_HORA = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
const FMT_SEMANA = new Intl.DateTimeFormat("pt-BR", { weekday: "short", timeZone: "UTC" });

/** Dia da semana abreviado de "AAAA-MM-DD" (ancorado ao meio-dia UTC: imune a fuso). */
function diaSemana(dia: string): string {
  const [a, m, d] = (dia ?? "").split("-").map((n: string) => Number(n));
  if (!Number.isFinite(a) || !Number.isFinite(m) || !Number.isFinite(d)) return "";
  return FMT_SEMANA.format(new Date(Date.UTC(a, m - 1, d, 12))).replace(".", "");
}

/** Hora da ultima coleta do dia (ts do evento), no fuso do plantao. */
function hora(ts: string | null): string | null {
  if (!ts) return null;
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : FMT_HORA.format(d);
}

/** Unidade para colar depois do numero. Exame adimensional (pH, INR, P/F) => "". */
function sufixo(unidade: string | null): string {
  return unidade?.trim() ? ` ${unidade.trim()}` : "";
}

// ---------------------------------------------------------------------------
// Preparo das celulas
// ---------------------------------------------------------------------------
interface CelulaExib {
  celula: FolhaoCelula;
  /** Valor da coleta anterior mais proxima (pode ser de 2-3 dias antes). */
  anterior: number | null;
  /** Dia dessa coleta anterior — o DeltaBadge diz isso em voz alta. */
  diaAnterior: string | null;
}

/**
 * Percorre a linha em ordem cronologica guardando a ultima coleta COM valor e
 * devolve as celulas ja invertidas (mais recente primeiro) para a exibicao.
 * Comparar com a ultima coleta real (e nao com a coluna vizinha) e o que faz a
 * seta existir: lab nao e colhido todo dia. A distancia vai no title.
 */
function prepararCelulas(linha: FolhaoLinha): CelulaExib[] {
  const saida: CelulaExib[] = [];
  let ultimoValor: number | null = null;
  let ultimoDia: string | null = null;
  for (const celula of linha.celulas) {
    saida.push({ celula, anterior: ultimoValor, diaAnterior: ultimoDia });
    if (celula.ultimo != null) {
      ultimoValor = celula.ultimo;
      ultimoDia = celula.dia;
    }
  }
  return saida.reverse();
}

/** Texto do title da celula: tudo que o numero sozinho nao conta. */
function tituloCelula(linha: FolhaoLinha, c: FolhaoCelula): string {
  const un = sufixo(unidadeSegura(linha.unidade));
  const cabeca = `${linha.rotulo} — ${diaLongo(c.dia)}`;

  if (c.n === 0) {
    const base = `${cabeca}: sem coleta registrada (não é zero — é ausência de dado).`;
    return c.requires_review ? `${base} Há registro sem valor numérico marcado para revisão.` : base;
  }

  const h = hora(c.ts);
  const partes: string[] = [`${cabeca}: ${fmtLab(c.ultimo)}${un}`];
  partes.push(
    c.n > 1
      ? `último de ${c.n} coletas${h ? ` (${h})` : ""} · máximo–mínimo do dia: ${fmtLab(c.max)}–${fmtLab(c.min)}${un}`
      : `coleta única${h ? ` às ${h}` : ""}`,
  );
  if (c.fora_faixa) {
    const lim: string[] = [];
    if (linha.faixa_min != null) lim.push(`mínimo ${fmtLab(linha.faixa_min)}`);
    if (linha.faixa_max != null) lim.push(`máximo ${fmtLab(linha.faixa_max)}`);
    partes.push(
      `FORA DA FAIXA FISIOLÓGICA PLAUSÍVEL${lim.length ? ` (${lim.join(", ")}${un})` : ""} — ` +
        `flag de implausibilidade: conferir a fonte. Não significa "fora do normal clínico".`,
    );
  }
  if (c.requires_review) partes.push("Há medida marcada para revisão neste dia (baixa confiança na extração).");
  return partes.join(" · ");
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export interface TabelaoLabsProps {
  /** Matriz exame x dia (colunas do MAIS ANTIGO ao MAIS RECENTE) — de serieLabs(). */
  folhao: Folhao;
  /**
   * true quando evento_tipo_ref voltou vazia (modo degradado da camada de dados):
   * o rotulo passa a ser o proprio codigo e nao ha faixa. A tela AVISA em vez de
   * fingir que esta tudo normal.
   */
  dimensaoIndisponivel?: boolean;
}

export function TabelaoLabs({ folhao, dimensaoIndisponivel = false }: TabelaoLabsProps): ReactElement {
  const nDias = folhao.dias.length;
  const hoje = folhao.dias[nDias - 1] ?? null;

  // COLAPSA DIAS VAZIOS: um dia em que NENHUM exame foi colhido (a coluna inteira
  // e "—") e so ruido. Some da tabela — assim a coluna nobre (a esquerda) passa a
  // ser a ÚLTIMA COLETA de verdade, e nao um dia em branco. Nao e esconder dado: e
  // nao desenhar um dia que nunca teve medida (a data no cabecalho denuncia se
  // "hoje" ficou de fora). O delta continua calculado sobre a serie INTEIRA.
  const diasComColeta = new Set<string>();
  for (const l of folhao.linhas) for (const c of l.celulas) if (c.n > 0) diasComColeta.add(c.dia);
  // colunas na ordem de EXIBICAO: mais recente a esquerda, so dias com coleta
  const colunas = [...folhao.dias].reverse().filter((d: string) => diasComColeta.has(d));
  const diasOcultos = nDias - colunas.length;

  // agrupamento: linhas na ordem dos blocos; o que sobrar vai para "Outros"
  const porTipo = new Map<string, FolhaoLinha>(folhao.linhas.map((l: FolhaoLinha) => [l.tipo, l] as const));
  const usados = new Set<string>();
  const blocos = GRUPOS_FOLHAO.map((g: GrupoExames) => {
    const linhas = g.tipos
      .map((t: string) => {
        const l = porTipo.get(t);
        if (l) usados.add(t);
        return l;
      })
      .filter((l: FolhaoLinha | undefined): l is FolhaoLinha => l != null);
    return { grupo: g, linhas };
  }).filter((b) => b.linhas.length > 0);

  const sobras = folhao.linhas.filter((l: FolhaoLinha) => !usados.has(l.tipo));
  if (sobras.length > 0) {
    blocos.push({
      grupo: { id: "outros", titulo: "Outros exames", cor: "var(--text-muted)", tipos: sobras.map((l) => l.tipo) },
      linhas: sobras,
    });
  }

  const totalCelulas = folhao.linhas.reduce(
    (acc: number, l: FolhaoLinha) => acc + l.celulas.filter((c: FolhaoCelula) => c.n > 0).length,
    0,
  );

  // ---- estado vazio: nenhuma coleta na janela inteira ----------------------
  if (totalCelulas === 0) {
    return (
      <section className="tlab" aria-labelledby="tlab-vazio">
        <style dangerouslySetInnerHTML={{ __html: CSS_TABELAO_LABS + CSS_DELTA_BADGE }} />
        <div className="tlab__vazio">
          <p className="tlab__vazio-ttl" id="tlab-vazio">
            Nenhum exame nos últimos <span className="tabnum">{nDias}</span> dias
          </p>
          <p className="tlab__vazio-txt">
            A série <code className="tabnum">eventos_clinicos</code> não tem nenhuma coleta deste paciente na
            janela — nem hematologia, nem função renal, nem gasometria, nem marcadores de infecção.
          </p>
          <p className="tlab__vazio-txt">
            Ausência de dado não é resultado normal: o folhão fica vazio de propósito. Ingira o laudo pela
            skill de extração (ou amplie a janela de dias) e recarregue.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="tlab">
      <style dangerouslySetInnerHTML={{ __html: CSS_TABELAO_LABS + CSS_DELTA_BADGE }} />

      {dimensaoIndisponivel ? (
        <p className="tlab__aviso" role="status">
          <span aria-hidden="true">!</span> Dimensão <code className="tabnum">evento_tipo_ref</code> indisponível
          para esta sessão: os rótulos abaixo mostram o <strong>código</strong> do exame e não há faixa
          fisiológica para sinalizar. Os valores são reais — o vocabulário é que não pôde ser lido.
        </p>
      ) : null}

      <div className="tlab__scroll" role="region" aria-label="Folhão de laboratório — rolagem horizontal" tabIndex={0}>
        <table className="tlab__tabela">
          <caption className="tlab__sr">
            Folhão de laboratório: uma linha por exame, uma coluna por dia, do mais recente para o mais antigo.
            Dias sem nenhuma coleta são omitidos; um exame sem coleta num dia mostrado aparece como travessão.
          </caption>

          <thead>
            <tr>
              <th scope="col" className="tlab__th tlab__th-exame">
                Exame
              </th>
              {colunas.map((dia: string, i: number) => {
                const dist = hoje ? distanciaEmDias(dia, hoje) : null;
                const tag = dist === 0 ? "hoje" : dist === 1 ? "ontem" : diaSemana(dia);
                return (
                  <th
                    scope="col"
                    key={dia}
                    className={`tlab__th tlab__th-dia${i === 0 ? " tlab__th-dia--recente" : ""}`}
                    title={`${diaSemana(dia)}, ${diaLongo(dia)}`}
                  >
                    <span className="tlab__dia tabnum">{diaCurto(dia)}</span>
                    <span className="tlab__dia-tag">{tag}</span>
                  </th>
                );
              })}
            </tr>
          </thead>

          {blocos.map((bloco) => (
            <tbody key={bloco.grupo.id}>
              <tr className="tlab__grupo">
                <th scope="colgroup" colSpan={1 + colunas.length}>
                  <span className="tlab__grupo-rotulo" style={{ color: bloco.grupo.cor }}>
                    {bloco.grupo.titulo}
                  </span>
                </th>
              </tr>

              {bloco.linhas.map((linha: FolhaoLinha) => {
                const un = unidadeSegura(linha.unidade).trim();
                return (
                  <tr key={linha.tipo}>
                    <th scope="row" className="tlab__exame">
                      <span className="tlab__exame-rotulo" title={linha.rotulo}>
                        {linha.rotulo}
                      </span>
                      {un ? <span className="tlab__exame-unid tabnum">{un}</span> : null}
                    </th>

                    {prepararCelulas(linha)
                      .filter(({ celula }: CelulaExib) => diasComColeta.has(celula.dia))
                      .map(({ celula, anterior, diaAnterior }: CelulaExib, i: number) => {
                      const vazia = celula.n === 0 || celula.ultimo == null;
                      const classes =
                        "tlab__td" +
                        (i === 0 ? " tlab__td--recente" : "") +
                        (celula.fora_faixa ? " tlab__td--fora" : "");
                      return (
                        <td key={celula.dia} className={classes} title={tituloCelula(linha, celula)}>
                          <span className={`tlab__valor tabnum${vazia ? " tlab__valor--vazio" : ""}`}>
                            {fmtLab(celula.ultimo)}
                          </span>
                          {celula.n > 1 ? (
                            <sup className="tlab__n tabnum" aria-hidden="true">
                              {celula.n}
                            </sup>
                          ) : null}
                          {celula.fora_faixa ? (
                            <sup className="tlab__flag" aria-hidden="true">
                              !
                            </sup>
                          ) : null}
                          {celula.requires_review ? (
                            <sup className="tlab__rev" aria-hidden="true">
                              ?
                            </sup>
                          ) : null}
                          <DeltaBadge
                            atual={celula.ultimo}
                            anterior={anterior}
                            rotulo={linha.rotulo}
                            unidade={linha.unidade}
                            diaAnterior={diaAnterior}
                            diaAtual={celula.dia}
                          />
                          {/* MAX-MIN do dia VISIVEL (doutrina): no celular nao ha
                              hover — o par nao pode viver so no tooltip */}
                          {celula.n > 1 ? (
                            <span className="tlab__mm tabnum" aria-label="máximo–mínimo do dia">
                              {fmtLab(celula.max)}–{fmtLab(celula.min)}
                            </span>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>

      <ul className="tlab__legenda">
        {diasOcultos > 0 ? (
          <li>
            <span className="tabnum">{diasOcultos}</span> dia{diasOcultos > 1 ? "s" : ""} sem nenhuma coleta{" "}
            {diasOcultos > 1 ? "omitidos" : "omitido"} — a data no topo de cada coluna mostra os saltos
          </li>
        ) : null}
        <li>
          <span className="tlab__valor tabnum">—</span> não coletado (o valor do dia anterior nunca é repetido
          para preencher)
        </li>
        <li>valor exibido = último do dia; com mais de uma coleta o máx–mín aparece embaixo (hora e detalhe no tooltip)</li>
        <li>
          <span className="tlab__n tabnum" aria-hidden="true">
            ²
          </span>{" "}
          nº de coletas no dia
        </li>
        <li>
          <span className="dbadge" aria-hidden="true">
            ▲▼=
          </span>{" "}
          direção em relação à coleta anterior — é o movimento do número, não juízo clínico
        </li>
        <li>
          <span className="tlab__flag" aria-hidden="true">
            !
          </span>{" "}
          fora da faixa fisiológica plausível (<code className="tabnum">evento_tipo_ref</code>) — conferir a fonte
        </li>
        <li>
          <span className="tlab__rev" aria-hidden="true">
            ?
          </span>{" "}
          há medida marcada para revisão no dia
        </li>
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CSS do folhao. Vive junto do markup (hover/sticky/scroll nao cabem em estilo
// inline) e e injetado UMA vez por este componente, junto do CSS do DeltaBadge.
// So tokens do design system — zero hex.
// ---------------------------------------------------------------------------
export const CSS_TABELAO_LABS = `
.tlab{display:flex;flex-direction:column;gap:10px;min-width:0}
.tlab__sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;
  clip-path:inset(50%);white-space:nowrap;border:0}

.tlab__aviso{display:flex;gap:8px;padding:8px 12px;border-radius:var(--radius-md,8px);
  background:color-mix(in srgb,var(--warning) 12%,transparent);
  border:1px solid color-mix(in srgb,var(--warning) 34%,transparent);
  color:var(--text-body);font-size:var(--text-xs,11px);line-height:var(--leading-snug,1.35)}
.tlab__aviso>span{font-weight:700;color:var(--warning)}

/* ---------- moldura rolavel ---------- */
.tlab__scroll{overflow-x:auto;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;
  scroll-behavior:smooth;scrollbar-width:thin;
  background:var(--surface-card);border:1px solid var(--border-default);
  border-radius:var(--radius-xl,16px);box-shadow:var(--shadow-card)}
.tlab__scroll:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

.tlab__tabela{border-collapse:separate;border-spacing:0;width:max-content;min-width:100%;
  color:var(--text-body);font-size:var(--text-xs,11px)}

/* ---------- cabecalho ---------- */
.tlab__th{padding:8px 10px;text-align:right;vertical-align:bottom;white-space:nowrap;
  background:var(--surface-sunken);border-bottom:1px solid var(--border-default);
  font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-wide,.04em);color:var(--text-muted)}
.tlab__th-exame{position:sticky;left:0;z-index:3;text-align:left;min-width:136px;
  text-transform:uppercase;letter-spacing:var(--tracking-eyebrow,.08em);
  box-shadow:1px 0 0 var(--border-default)}
.tlab__th-dia--recente{background:var(--surface-raised)}
.tlab__dia{display:block;font-size:var(--text-sm,13px);font-weight:700;color:var(--text-heading)}
.tlab__dia-tag{display:block;margin-top:1px;font-size:var(--text-2xs,10px);font-weight:600;
  letter-spacing:var(--tracking-wide,.04em);color:var(--text-faint)}

/* ---------- bloco de exames ---------- */
/* sem border-top: a troca de fundo ja separa o bloco (evita linha dupla com a linha de cima) */
.tlab__grupo th{padding:7px 10px;text-align:left;background:var(--surface-raised);
  border-bottom:1px solid var(--border-subtle)}
.tlab__grupo-rotulo{position:sticky;left:0;display:inline-block;
  font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);text-transform:uppercase}

/* ---------- linha de exame ---------- */
.tlab__exame{position:sticky;left:0;z-index:2;min-width:136px;max-width:200px;padding:6px 10px;
  text-align:left;vertical-align:middle;background:var(--surface-card);
  border-bottom:1px solid var(--border-subtle);box-shadow:1px 0 0 var(--border-default)}
.tlab__exame-rotulo{display:block;max-width:180px;font-size:var(--text-xs,11px);font-weight:600;
  line-height:var(--leading-snug,1.35);color:var(--text-heading);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tlab__exame-unid{display:block;font-size:var(--text-2xs,10px);font-weight:400;color:var(--text-faint)}

.tlab__td{min-width:84px;padding:6px 10px;text-align:right;white-space:nowrap;vertical-align:middle;
  border-bottom:1px solid var(--border-subtle)}
.tlab__td--recente{background:var(--surface-raised)}
.tlab__td--fora{background:color-mix(in srgb,var(--warning) 14%,transparent)}

.tlab__valor{font-size:var(--text-sm,13px);font-weight:600;color:var(--text-heading)}
.tlab__valor--vazio{font-weight:400;color:var(--text-faint)}
.tlab__td--fora .tlab__valor{color:var(--warning)}
.tlab__n{margin-left:2px;font-size:var(--text-2xs,10px);font-weight:400;color:var(--text-muted)}
.tlab__mm{display:block;margin-top:1px;font-size:var(--text-2xs,10px);font-weight:400;color:var(--text-muted)}
.tlab__flag{margin-left:2px;font-size:var(--text-2xs,10px);font-weight:700;color:var(--warning)}
.tlab__rev{margin-left:2px;font-size:var(--text-2xs,10px);font-weight:700;color:var(--text-muted)}

/* ---------- legenda ---------- */
.tlab__legenda{display:flex;flex-wrap:wrap;gap:6px 16px;margin:0;padding:0;list-style:none;
  font-size:var(--text-2xs,10px);line-height:var(--leading-snug,1.35);color:var(--text-muted)}
.tlab__legenda .tlab__valor{font-size:var(--text-2xs,10px)}

/* ---------- estado vazio ---------- */
.tlab__vazio{display:flex;flex-direction:column;gap:6px;padding:22px 18px;
  background:var(--surface-card);border:1px dashed var(--border-strong);border-radius:var(--radius-xl,16px)}
.tlab__vazio-ttl{margin:0;font-size:var(--text-md,17px);font-weight:700;color:var(--text-heading)}
.tlab__vazio-txt{margin:0;max-width:64ch;font-size:var(--text-sm,13px);line-height:var(--leading-normal,1.55);
  color:var(--text-muted)}

@media (prefers-reduced-motion:reduce){.tlab__scroll{scroll-behavior:auto}}
`;

export default TabelaoLabs;
