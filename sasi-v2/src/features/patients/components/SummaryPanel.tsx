// ============================================================================
// SASI v2 — SummaryPanel (aba "Resumo")
// ----------------------------------------------------------------------------
// Renderiza a FICHA CONGELADA da admissao: pacientes.patient_summary (JSONB).
// Contrato do objeto: interface PatientSummary em @/types/clinical.
// Server Component — texto puro, sem estado.
//
// DOUTRINA (inviolavel):
//  - ZERO ALUCINACAO. Este painel NAO resume, NAO deduz e NAO completa nada:
//    imprime exatamente o que foi gravado. Campo vazio => travessao "—" ou
//    secao oculta. Jamais um texto plausivel.
//  - Regra de exibicao: os 3 blocos-espinha (motivo, HPMA, antecedentes)
//    aparecem SEMPRE com "—" quando vazios (a ausencia deles e informacao
//    clinica). Os blocos acessorios somem quando vazios, para nao poluir.
//  - patient_summary inteiro vazio => estado vazio explicito, sem inventar.
//  - Cor sempre por token (--sys-*, --badge-*, --text-*). Zero hex.
//
// Interconsultas e programacao TAMBEM moram no patient_summary, mas pertencem
// a aba "Especialidades" — nao sao duplicadas aqui.
// ============================================================================
import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { DispositivoDetalhe, PatientSummary, ResumoSistema } from "@/types/clinical";
import { TRAVESSAO, fmtData, txt } from "./PatientHeader";

// ---------------------------------------------------------------------------
// Leitura segura do JSONB (o banco nao garante forma: filtramos lixo)
// ---------------------------------------------------------------------------

/** JSONB nao garante forma: o que nao for array vira lista vazia (nunca quebra a tela). */
function comoArray<T>(v: T[] | null | undefined): T[] {
  return Array.isArray(v) ? v : [];
}

/** Lista de textos uteis. Item vazio/nao-texto e descartado. */
function listaTexto(v: readonly unknown[] | null | undefined): string[] {
  if (!Array.isArray(v)) return [];
  const saida: string[] = [];
  for (const item of v) {
    const t = typeof item === "string" ? txt(item) : null;
    if (t) saida.push(t);
  }
  return saida;
}

function ehDispositivo(d: unknown): d is DispositivoDetalhe {
  return !!d && typeof d === "object" && txt((d as DispositivoDetalhe).tipo) !== null;
}

function ehSistema(s: unknown): s is ResumoSistema {
  if (!s || typeof s !== "object") return false;
  const r = s as ResumoSistema;
  return txt(r.texto) !== null || txt(r.label) !== null;
}

/** "2026-07-30T18:20:00" -> "30/07/2026 18:20". Formato desconhecido => devolve cru. */
function fmtQuando(v: string | null | undefined): string | null {
  const t = txt(v);
  if (!t) return null;
  const data = fmtData(t);
  if (data === TRAVESSAO) return t;
  const hora = /T(\d{2}):(\d{2})/.exec(t);
  return hora ? `${data} ${hora[1]}:${hora[2]}` : data;
}

// ---------------------------------------------------------------------------
// Estilos base (tokens do design system)
// ---------------------------------------------------------------------------
const EYEBROW: CSSProperties = {
  margin: 0,
  fontSize: "var(--text-2xs, 10px)",
  fontWeight: 700,
  letterSpacing: "var(--tracking-eyebrow, .08em)",
  textTransform: "uppercase",
  color: "var(--text-muted)",
};

const GRADE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 12,
};

// ---------------------------------------------------------------------------
// Pecas
// ---------------------------------------------------------------------------
function Card({
  titulo,
  barra,
  corTitulo,
  fundo,
  children,
}: {
  titulo: string;
  barra?: string;
  corTitulo?: string;
  fundo?: string;
  children: ReactNode;
}): ReactElement {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "12px 14px",
        background: fundo ?? "var(--surface-card)",
        border: "1px solid var(--border-default)",
        borderLeft: barra ? `4px solid ${barra}` : undefined,
        borderRadius: "var(--radius-lg, 12px)",
        minWidth: 0,
      }}
    >
      <h3 style={{ ...EYEBROW, color: corTitulo ?? "var(--text-muted)" }}>{titulo}</h3>
      {children}
    </section>
  );
}

/** Texto clinico. Preserva as quebras de linha escritas pelo medico. */
function Prosa({ valor }: { valor: string | null }): ReactElement {
  return (
    <p
      style={{
        margin: 0,
        whiteSpace: "pre-wrap",
        fontSize: "var(--text-sm, 13px)",
        lineHeight: "var(--leading-normal, 1.55)",
        color: valor ? "var(--text-body)" : "var(--text-faint)",
      }}
    >
      {valor ?? TRAVESSAO}
    </p>
  );
}

function Chips({ itens, fundo, cor }: { itens: string[]; fundo: string; cor: string }): ReactElement {
  return (
    <ul style={{ display: "flex", flexWrap: "wrap", gap: 6, listStyle: "none", margin: 0, padding: 0 }}>
      {itens.map((item: string, i: number) => (
        <li
          key={`${i}-${item}`}
          style={{
            padding: "3px 9px",
            borderRadius: "var(--radius-pill, 9999px)",
            background: fundo,
            color: cor,
            fontSize: "var(--text-xs, 11px)",
            fontWeight: 600,
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Par rotulo/valor do bloco "Suporte atual". Vazio vira travessao (nunca some). */
function Linha({ rotulo, valor }: { rotulo: string; valor: ReactNode }): ReactElement {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
      <span style={{ ...EYEBROW, flex: "0 0 84px" }}>{rotulo}</span>
      <div style={{ flex: "1 1 140px", minWidth: 0, fontSize: "var(--text-sm, 13px)", color: "var(--text-body)" }}>
        {valor}
      </div>
    </div>
  );
}

// Sistema -> token de cor do design system (--sys-*). Id desconhecido = neutro.
const SISTEMA_TOKEN: Record<string, string> = {
  snc: "neuro",
  neuro: "neuro",
  neurologico: "neuro",
  resp: "resp",
  respiratorio: "resp",
  hemo_cv: "hemo",
  hemo: "hemo",
  cv: "hemo",
  cardiovascular: "hemo",
  gi: "tgi",
  tgi: "tgi",
  digestivo: "tgi",
  renal: "renal",
  hemato: "hemato",
  infecto: "infecto",
  infeccioso: "infecto",
};

function CardSistema({ sistema }: { sistema: ResumoSistema }): ReactElement {
  const id = txt(sistema.id)?.toLowerCase() ?? "";
  // hasOwn: id vem de JSONB livre — "constructor"/"toString" pegariam funcao herdada
  const token = Object.hasOwn(SISTEMA_TOKEN, id) ? SISTEMA_TOKEN[id] : undefined;
  const critico = id === "pontos_criticos";

  const barra = token ? `var(--sys-${token}-bar)` : critico ? "var(--grav-critical-solid)" : "var(--border-strong)";
  const corTitulo = token ? `var(--sys-${token})` : critico ? "var(--grav-critical-text)" : "var(--text-heading)";
  const fundo = token ? `var(--sys-${token}-bg)` : critico ? "var(--grav-critical-bg)" : "var(--surface-card)";
  const emoji = txt(sistema.emoji);

  return (
    <Card
      titulo={`${emoji ? `${emoji} ` : ""}${txt(sistema.label) ?? txt(sistema.id) ?? TRAVESSAO}`}
      barra={barra}
      corTitulo={corTitulo}
      fundo={fundo}
    >
      <Prosa valor={txt(sistema.texto)} />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export interface SummaryPanelProps {
  /** pacientes.patient_summary. Pode vir null ou {} — os dois sao "vazio". */
  resumo: PatientSummary | null | undefined;
}

export function SummaryPanel({ resumo }: SummaryPanelProps): ReactElement {
  const r = resumo ?? null;

  const motivo = txt(r?.motivo_admissao);
  const hpma = txt(r?.hpma);
  const antecedentes = txt(r?.antecedentes);
  const plano = txt(r?.plano_terapeutico_atual);
  const exames = txt(r?.exames_relevantes);
  const iatrogenias = txt(r?.iatrogenias);
  const sutilezas = txt(r?.sutilezas);
  const dvaFluidos = txt(r?.dva_fluidos);

  const medicamentos = listaTexto(r?.medicamentos_domiciliares);
  const dispositivos = comoArray(r?.dispositivos).filter(ehDispositivo);
  const sistemas = comoArray(r?.resumo_sistemas).filter(ehSistema);

  const suporte = r?.suporte_atual ?? null;
  const dvas = listaTexto(suporte?.dvas);
  const atbs = listaTexto(suporte?.antibioticos);
  const ventilacao = txt(suporte?.ventilacao);
  const sedacao = txt(suporte?.sedacao);
  const temSuporte = !!suporte && (dvas.length > 0 || atbs.length > 0 || !!ventilacao || !!sedacao);

  const dataAdmissao = fmtQuando(r?.data_admissao);
  const atualizacao = fmtQuando(r?.ultima_atualizacao);

  const temAlgo =
    !!motivo ||
    !!hpma ||
    !!antecedentes ||
    !!plano ||
    !!exames ||
    !!iatrogenias ||
    !!sutilezas ||
    !!dvaFluidos ||
    medicamentos.length > 0 ||
    dispositivos.length > 0 ||
    sistemas.length > 0 ||
    temSuporte;

  // -------------------------------------------------------------------------
  // Estado vazio — a ficha nunca e "preenchida" pelo app.
  // -------------------------------------------------------------------------
  if (!temAlgo) {
    return (
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: "24px 16px",
          background: "var(--surface-card)",
          border: "1px dashed var(--border-strong)",
          borderRadius: "var(--radius-lg, 12px)",
          textAlign: "center",
        }}
      >
        <strong style={{ fontSize: "var(--text-md, 17px)", color: "var(--text-heading)" }}>
          Ficha de admissão não preenchida
        </strong>
        <span
          title="pacientes.patient_summary (JSONB) vazio"
          style={{ fontSize: "var(--text-sm, 13px)", color: "var(--text-muted)", maxWidth: "52ch" }}
        >
          Ainda não há dados de admissão registrados para este paciente. A ficha é preenchida na ingestão da
          folha — o app nunca a completa sozinho.
        </span>
      </section>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ---- cabecalho do painel ---- */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: "var(--text-lg, 20px)", fontWeight: 700, color: "var(--text-heading)" }}>
          Ficha de admissão
        </h2>
        {dataAdmissao ? (
          <span className="tabnum" style={{ fontSize: "var(--text-xs, 11px)", color: "var(--text-muted)" }}>
            admissão {dataAdmissao}
          </span>
        ) : null}
        {atualizacao ? (
          <span
            className="tabnum"
            title="patient_summary.ultima_atualizacao"
            style={{ fontSize: "var(--text-xs, 11px)", color: "var(--text-faint)", marginLeft: "auto" }}
          >
            atualizada em {atualizacao}
          </span>
        ) : null}
      </div>

      {/* ---- 1. espinha do caso (sempre visivel; vazio = travessao) ---- */}
      <div style={GRADE}>
        <Card titulo="Motivo da admissão">
          <Prosa valor={motivo} />
        </Card>
        <Card titulo="HPMA">
          <Prosa valor={hpma} />
        </Card>
        <Card titulo="Antecedentes">
          <Prosa valor={antecedentes} />
        </Card>
      </div>

      {/* ---- 2. o que esta rodando agora ---- */}
      {temSuporte || dispositivos.length > 0 || medicamentos.length > 0 ? (
        <div style={GRADE}>
          {temSuporte ? (
            <Card titulo="Suporte atual">
              <Linha
                rotulo="DVAs"
                valor={
                  dvas.length > 0 ? (
                    <Chips itens={dvas} fundo="var(--badge-dva-bg)" cor="var(--badge-dva-text)" />
                  ) : (
                    <span style={{ color: "var(--text-faint)" }}>{TRAVESSAO}</span>
                  )
                }
              />
              <Linha
                rotulo="Ventilação"
                valor={ventilacao ?? <span style={{ color: "var(--text-faint)" }}>{TRAVESSAO}</span>}
              />
              <Linha rotulo="Sedação" valor={sedacao ?? <span style={{ color: "var(--text-faint)" }}>{TRAVESSAO}</span>} />
              <Linha
                rotulo="Antibióticos"
                valor={
                  atbs.length > 0 ? (
                    <Chips itens={atbs} fundo="var(--badge-atb-bg)" cor="var(--badge-atb-text)" />
                  ) : (
                    <span style={{ color: "var(--text-faint)" }}>{TRAVESSAO}</span>
                  )
                }
              />
            </Card>
          ) : null}

          {dispositivos.length > 0 ? (
            <Card titulo="Dispositivos">
              <ul style={{ display: "flex", flexDirection: "column", gap: 6, listStyle: "none", margin: 0, padding: 0 }}>
                {dispositivos.map((d: DispositivoDetalhe, i: number) => {
                  const local = txt(d.local);
                  const desde = fmtQuando(d.data_insercao);
                  return (
                    <li
                      key={`${i}-${d.tipo}`}
                      style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap", fontSize: "var(--text-sm, 13px)" }}
                    >
                      <strong style={{ color: "var(--text-heading)" }}>{txt(d.tipo)}</strong>
                      {local ? <span style={{ color: "var(--text-muted)" }}>{local}</span> : null}
                      {desde ? (
                        <span className="tabnum" style={{ fontSize: "var(--text-xs, 11px)", color: "var(--text-faint)" }}>
                          desde {desde}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </Card>
          ) : null}

          {medicamentos.length > 0 ? (
            <Card titulo="Medicamentos domiciliares">
              <Chips itens={medicamentos} fundo="var(--surface-sunken)" cor="var(--text-body)" />
            </Card>
          ) : null}
        </div>
      ) : null}

      {/* ---- 3. resumo por sistemas ---- */}
      {sistemas.length > 0 ? (
        <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h3 style={EYEBROW}>Resumo por sistemas</h3>
          <div style={GRADE}>
            {sistemas.map((s: ResumoSistema, i: number) => (
              <CardSistema key={`${i}-${s.id ?? s.label}`} sistema={s} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ---- 4. plano terapeutico (largura total: e o que orienta a conduta) ---- */}
      {plano ? (
        <Card titulo="Plano terapêutico atual" barra="var(--accent)" corTitulo="var(--accent-text)">
          <Prosa valor={plano} />
        </Card>
      ) : null}

      {/* ---- 5. acessorios ---- */}
      {exames || dvaFluidos || iatrogenias || sutilezas ? (
        <div style={GRADE}>
          {exames ? (
            <Card titulo="Exames relevantes">
              <Prosa valor={exames} />
            </Card>
          ) : null}
          {dvaFluidos ? (
            <Card titulo="DVA e fluidos" barra="var(--sys-hemo-bar)" corTitulo="var(--sys-hemo)">
              <Prosa valor={dvaFluidos} />
            </Card>
          ) : null}
          {iatrogenias ? (
            <Card titulo="Iatrogenias" barra="var(--warning)" corTitulo="var(--warning)">
              <Prosa valor={iatrogenias} />
            </Card>
          ) : null}
          {sutilezas ? (
            <Card titulo="Sutilezas" barra="var(--border-strong)">
              <Prosa valor={sutilezas} />
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default SummaryPanel;
