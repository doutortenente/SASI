// ============================================================================
// SASI v2 — ProgramacaoList (programacao do paciente: exames, procedimentos, metas)
// ----------------------------------------------------------------------------
// Fonte: pacientes.patient_summary -> programacao[]
//        { descricao, data, tipo, status }   (contrato Programacao em @/types/clinical)
//
// Server Component: recebe o array ja lido pela pagina. Zero consulta aqui.
//
// DOUTRINA APLICADA
//  - ZERO ALUCINACAO: so o que esta gravado. Sem data => "—"; sem tipo => o chip
//    de tipo nem aparece (nao existe "tipo padrao"); sem status => "sem status".
//  - Registro sem `descricao` legivel NAO vira linha: e descartado, e a tela diz
//    quantos foram.
//  - Agrupado por status, PENDENTE primeiro (e o que muda o plantao de hoje);
//    dentro do grupo, a ordem gravada e preservada.
//  - Cor nunca e o unico sinal: cada status tem cor E rotulo em texto.
//  - Lista vazia => convite, nunca linha fantasma.
//
// Vocabulario de status, agrupamento, chips, estado vazio e o CSS (.esp-*) sao
// os MESMOS de InterconsultaList — importados de la para nao existirem duas
// verdades sobre "pendente" na mesma aba.
// ============================================================================
import type { ReactElement } from "react";
import type { Programacao } from "@/types/clinical";
import { TRAVESSAO, txt } from "@/features/patients/components/PatientHeader";
import {
  AvisoIgnorados,
  ChipStatus,
  EstadoVazio,
  agrupaPorStatus,
  fmtDataEsp,
  statusEsp,
  type StatusEsp,
} from "./InterconsultaList";

/** Titulo de cada grupo (masculino: item de programacao). */
const TITULO_GRUPO: Record<StatusEsp, string> = {
  pendente: "Pendentes",
  outro: "Outros status",
  concluida: "Concluídos",
};

/** Item so existe se tiver descricao legivel (senao seria linha falsa). */
function ehProgramacao(v: unknown): v is Programacao {
  return !!v && typeof v === "object" && txt((v as Programacao).descricao) !== null;
}

export interface ProgramacaoListProps {
  /** patient_summary.programacao[] — pode vir null, undefined ou com lixo dentro. */
  itens: Programacao[] | null | undefined;
}

export function ProgramacaoList({ itens }: ProgramacaoListProps): ReactElement {
  const brutos: unknown[] = Array.isArray(itens) ? (itens as unknown[]) : [];
  const validos: Programacao[] = brutos.filter(ehProgramacao);
  const ignorados = brutos.length - validos.length;
  const grupos = agrupaPorStatus(validos, (p: Programacao) => statusEsp(p.status).chave);
  const pendentes = validos.filter((p: Programacao) => statusEsp(p.status).chave === "pendente").length;

  return (
    <section className="esp" aria-labelledby="esp-prog-titulo">
      <h3 className="esp__titulo" id="esp-prog-titulo">
        Programação
        {validos.length > 0 ? (
          <span className="esp__contagem tabnum" title="pendentes / total registrado">
            {pendentes} pendente{pendentes === 1 ? "" : "s"} de {validos.length}
          </span>
        ) : null}
        <span className="esp__fonte tabnum">patient_summary.programacao[]</span>
      </h3>

      <AvisoIgnorados n={ignorados} onde="programacao[]" />

      {validos.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma programação registrada"
          convite="Exames, procedimentos e metas programadas vêm da ficha de admissão (patient_summary.programacao[]). Registre o primeiro item para acompanhar aqui — vazio significa ausência de registro, não ausência de plano."
        />
      ) : (
        grupos.map((g: { chave: StatusEsp; itens: Programacao[] }) => (
          <section key={g.chave} className="esp-grupo">
            <h4 className="esp-grupo__titulo">
              {TITULO_GRUPO[g.chave]}
              <span className="esp-grupo__n tabnum">{g.itens.length}</span>
            </h4>
            <ul className="esp-lista">
              {g.itens.map((p: Programacao, k: number) => {
                const info = statusEsp(p.status, "m");
                const descricao = txt(p.descricao) ?? TRAVESSAO;
                const tipo = txt(p.tipo);
                const data = fmtDataEsp(p.data);
                return (
                  <li key={`${g.chave}-${k}-${descricao}`} className="esp-item" style={{ borderLeftColor: info.cor }}>
                    <div className="esp-item__topo">
                      <span className="esp-item__nome" title={descricao}>
                        {descricao}
                      </span>
                      {tipo ? (
                        <span className="esp-item__tipo" title="programacao[].tipo">
                          {tipo}
                        </span>
                      ) : null}
                      <ChipStatus info={info} />
                      <span className="esp-item__data tabnum" title="programacao[].data">
                        {data ?? TRAVESSAO}
                      </span>
                    </div>
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

export default ProgramacaoList;
