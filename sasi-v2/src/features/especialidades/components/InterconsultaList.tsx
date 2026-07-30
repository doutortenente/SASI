// ============================================================================
// SASI v2 — InterconsultaList (interconsultas do paciente)
// ----------------------------------------------------------------------------
// Fonte: pacientes.patient_summary -> interconsultas[]
//        { especialidade, data, status, notas }   (contrato Interconsulta em @/types/clinical)
//
// Server Component: recebe o array ja lido pela pagina. Zero consulta aqui.
//
// DOUTRINA APLICADA
//  - ZERO ALUCINACAO: imprime o que esta gravado. Campo ausente vira travessao
//    "—" ou some; NUNCA existe linha inventada, nunca se deduz status pela data.
//  - Registro sem `especialidade` legivel NAO vira linha (seria uma linha falsa):
//    e descartado e a tela AVISA quantos foram, em vez de esconder.
//  - Status fora do vocabulario ('pendente' | 'concluida') aparece com o texto
//    CRU que veio do banco, em tom neutro — nunca reinterpretado como pendente.
//  - Ordem dentro do grupo = a ordem GRAVADA (o app nao reordena o que o medico
//    escreveu). O agrupamento por status e o unico rearranjo, e ele e explicito.
//  - Cor nunca e o unico sinal: cada status tem cor E rotulo em texto.
//  - Lista vazia => convite, nunca linha fantasma.
//
// Este arquivo tambem e a casa dos utilitarios e do CSS que a aba
// "Especialidades" inteira usa (ProgramacaoList importa daqui) — mesmo padrao de
// SummaryPanel <- PatientHeader.
// ============================================================================
import type { ReactElement } from "react";
import type { Interconsulta } from "@/types/clinical";
import { TRAVESSAO, fmtData, txt } from "@/features/patients/components/PatientHeader";

// ---------------------------------------------------------------------------
// 1. Status — vocabulario fechado do contrato, com escape para o desconhecido
// ---------------------------------------------------------------------------
export type StatusEsp = "pendente" | "concluida" | "outro";

export interface StatusInfo {
  chave: StatusEsp;
  /** Texto do chip. Para "outro", e o valor CRU gravado (ou "sem status"). */
  rotulo: string;
  /** Token de cor do texto. */
  cor: string;
  /** Token de cor do fundo do chip. */
  fundo: string;
  /** Explicacao — vira title. */
  leitura: string;
}

/** Ordem de leitura dos grupos: pendente primeiro, concluido por ultimo. */
export const ORDEM_STATUS: readonly StatusEsp[] = ["pendente", "outro", "concluida"];

/** "Concluída" -> "concluida" (sem acento, minusculo) para comparar sem falhar por acento. */
function normaliza(v: string): string {
  return v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Classifica o status gravado.
 * @param genero concordancia do rotulo canonico ("f" = concluída, "m" = concluído).
 */
export function statusEsp(bruto: string | null | undefined, genero: "f" | "m" = "f"): StatusInfo {
  const cru = txt(bruto);
  const n = cru ? normaliza(cru) : "";

  if (n === "pendente") {
    return {
      chave: "pendente",
      rotulo: "pendente",
      cor: "var(--badge-pend-text)",
      fundo: "var(--badge-pend-bg)",
      leitura: "status registrado: pendente",
    };
  }
  if (n === "concluida" || n === "concluido") {
    return {
      chave: "concluida",
      rotulo: genero === "m" ? "concluído" : "concluída",
      cor: "var(--success)",
      fundo: "color-mix(in srgb, var(--success) 14%, transparent)",
      leitura: "status registrado: concluída",
    };
  }
  return {
    chave: "outro",
    rotulo: cru ?? "sem status",
    cor: "var(--text-muted)",
    fundo: "var(--surface-sunken)",
    leitura: cru
      ? `status fora do vocabulário ('pendente' | 'concluida'): "${cru}"`
      : "nenhum status registrado neste item",
  };
}

/** "2026-07-30" -> "30/07/2026". Formato desconhecido => devolve o texto CRU. Vazio => null. */
export function fmtDataEsp(v: string | null | undefined): string | null {
  const t = txt(v);
  if (!t) return null;
  const d = fmtData(t);
  return d === TRAVESSAO ? t : d;
}

/** Agrupa preservando a ordem gravada dentro de cada grupo. Grupo vazio nao entra. */
export function agrupaPorStatus<T>(itens: T[], statusDe: (item: T) => StatusEsp): Array<{ chave: StatusEsp; itens: T[] }> {
  return ORDEM_STATUS.map((chave: StatusEsp) => ({
    chave,
    itens: itens.filter((item: T) => statusDe(item) === chave),
  })).filter((g: { itens: T[] }) => g.itens.length > 0);
}

// ---------------------------------------------------------------------------
// 2. Pecas compartilhadas pela aba
// ---------------------------------------------------------------------------
export function ChipStatus({ info }: { info: StatusInfo }): ReactElement {
  return (
    <span
      className="esp-chip"
      style={{ background: info.fundo, color: info.cor, borderColor: `color-mix(in srgb, ${info.cor} 30%, transparent)` }}
      title={info.leitura}
    >
      {info.rotulo}
    </span>
  );
}

export function EstadoVazio({ titulo, convite }: { titulo: string; convite: string }): ReactElement {
  return (
    <div className="esp-vazio" aria-live="polite">
      <strong className="esp-vazio__titulo">{titulo}</strong>
      <span className="esp-vazio__txt">{convite}</span>
    </div>
  );
}

/** Aviso de registro descartado — a tela nunca esconde lixo, ela declara. */
export function AvisoIgnorados({ n, onde }: { n: number; onde: string }): ReactElement | null {
  if (n <= 0) return null;
  return (
    <p className="esp-nota" role="status">
      {n} {n === 1 ? "registro ignorado" : "registros ignorados"} em <code className="tabnum">{onde}</code> — sem texto
      legível no campo obrigatório. Nada foi preenchido no lugar.
    </p>
  );
}

// ---------------------------------------------------------------------------
// 3. Componente
// ---------------------------------------------------------------------------

/** Titulo de cada grupo (feminino: interconsulta). */
const TITULO_GRUPO: Record<StatusEsp, string> = {
  pendente: "Pendentes",
  outro: "Outros status",
  concluida: "Concluídas",
};

/** Item so existe se tiver especialidade legivel (senao seria linha falsa). */
function ehInterconsulta(v: unknown): v is Interconsulta {
  return !!v && typeof v === "object" && txt((v as Interconsulta).especialidade) !== null;
}

export interface InterconsultaListProps {
  /** patient_summary.interconsultas[] — pode vir null, undefined ou com lixo dentro. */
  itens: Interconsulta[] | null | undefined;
}

export function InterconsultaList({ itens }: InterconsultaListProps): ReactElement {
  const brutos: unknown[] = Array.isArray(itens) ? (itens as unknown[]) : [];
  const validos: Interconsulta[] = brutos.filter(ehInterconsulta);
  const ignorados = brutos.length - validos.length;
  const grupos = agrupaPorStatus(validos, (i: Interconsulta) => statusEsp(i.status).chave);
  const pendentes = validos.filter((i: Interconsulta) => statusEsp(i.status).chave === "pendente").length;

  return (
    <section className="esp" aria-labelledby="esp-inter-titulo">
      <h3 className="esp__titulo" id="esp-inter-titulo">
        Interconsultas
        {validos.length > 0 ? (
          <span className="esp__contagem tabnum" title="pendentes / total registrado">
            {pendentes} pendente{pendentes === 1 ? "" : "s"} de {validos.length}
          </span>
        ) : null}
        <span className="esp__fonte tabnum">patient_summary.interconsultas[]</span>
      </h3>

      <AvisoIgnorados n={ignorados} onde="interconsultas[]" />

      {validos.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma interconsulta registrada"
          convite="Especialidade, data, status e notas vêm da ficha de admissão (patient_summary.interconsultas[]). Registre a primeira interconsulta para que ela apareça aqui — vazio significa ausência de registro, não ausência de parecer."
        />
      ) : (
        grupos.map((g: { chave: StatusEsp; itens: Interconsulta[] }) => (
          <section key={g.chave} className="esp-grupo">
            <h4 className="esp-grupo__titulo">
              {TITULO_GRUPO[g.chave]}
              <span className="esp-grupo__n tabnum">{g.itens.length}</span>
            </h4>
            <ul className="esp-lista">
              {g.itens.map((i: Interconsulta, k: number) => {
                const info = statusEsp(i.status);
                const especialidade = txt(i.especialidade) ?? TRAVESSAO;
                const data = fmtDataEsp(i.data);
                const notas = txt(i.notas);
                return (
                  <li key={`${g.chave}-${k}-${especialidade}`} className="esp-item" style={{ borderLeftColor: info.cor }}>
                    <div className="esp-item__topo">
                      <span className="esp-item__nome" title={especialidade}>
                        {especialidade}
                      </span>
                      <ChipStatus info={info} />
                      <span className="esp-item__data tabnum" title="interconsultas[].data">
                        {data ?? TRAVESSAO}
                      </span>
                    </div>
                    {notas ? <p className="esp-item__notas">{notas}</p> : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// CSS da aba Especialidades (classes .esp-*) — usado por InterconsultaList E
// ProgramacaoList. Injetado UMA vez pela pagina da aba.
// So tokens do design system — zero hex.
// ---------------------------------------------------------------------------
export const CSS_ESPECIALIDADES = `
.esp{display:flex;flex-direction:column;gap:8px;min-width:0}
.esp__titulo{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;margin:0;
  font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;color:var(--text-muted)}
.esp__contagem{padding:1px 8px;border-radius:var(--radius-pill,9999px);background:var(--surface-sunken);
  color:var(--text-body);font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:0;text-transform:none}
.esp__fonte{margin-left:auto;font-size:var(--text-2xs,10px);font-weight:400;letter-spacing:0;
  text-transform:none;color:var(--text-faint)}

.esp-grupo{display:flex;flex-direction:column;gap:6px;margin-top:4px;min-width:0}
.esp-grupo__titulo{display:flex;align-items:baseline;gap:6px;margin:0;
  font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;color:var(--text-faint)}
.esp-grupo__n{padding:0 6px;border-radius:var(--radius-pill,9999px);background:var(--surface-sunken);
  color:var(--text-muted)}

.esp-lista{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:8px;
  list-style:none;margin:0;padding:0}
.esp-item{display:flex;flex-direction:column;gap:4px;min-width:0;padding:10px 12px;
  background:var(--surface-card);border:1px solid var(--border-default);
  border-left:4px solid var(--border-strong);border-radius:var(--radius-lg,12px);box-shadow:var(--shadow-card)}
.esp-item__topo{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;min-width:0}
.esp-item__nome{flex:1 1 140px;min-width:0;font-size:var(--text-sm,13px);font-weight:700;
  line-height:var(--leading-snug,1.35);color:var(--text-heading);overflow-wrap:anywhere}
.esp-item__data{flex:0 0 auto;font-size:var(--text-xs,11px);color:var(--text-muted)}
.esp-item__tipo{padding:2px 7px;border-radius:var(--radius-pill,9999px);background:var(--surface-sunken);
  color:var(--text-muted);font-family:var(--font-mono,monospace);font-size:var(--text-2xs,10px);
  font-weight:700;letter-spacing:var(--tracking-wide,.04em);text-transform:uppercase;white-space:nowrap}
.esp-item__notas{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;font-size:var(--text-sm,13px);
  line-height:var(--leading-normal,1.55);color:var(--text-body)}

.esp-chip{padding:2px 8px;border:1px solid transparent;border-radius:var(--radius-pill,9999px);
  font-family:var(--font-mono,monospace);font-size:var(--text-2xs,10px);font-weight:700;
  letter-spacing:var(--tracking-wide,.04em);text-transform:uppercase;white-space:nowrap}

.esp-nota{margin:0;font-size:var(--text-xs,11px);line-height:var(--leading-snug,1.35);color:var(--warning)}

.esp-vazio{display:flex;flex-direction:column;gap:6px;padding:24px 16px;text-align:center;
  background:var(--surface-card);border:1px dashed var(--border-strong);border-radius:var(--radius-lg,12px)}
.esp-vazio__titulo{font-size:var(--text-md,17px);color:var(--text-heading)}
.esp-vazio__txt{max-width:62ch;margin:0 auto;font-size:var(--text-sm,13px);
  line-height:var(--leading-snug,1.35);color:var(--text-muted)}
`;

export default InterconsultaList;
