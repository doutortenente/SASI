// ============================================================================
// SASI v2 — Aba do paciente: ESPECIALIDADES (interconsultas + programacao)
// ----------------------------------------------------------------------------
// Rota: /patients/[id]/especialidades   (cabecalho e abas vem do layout.tsx)
// Server Component: le o banco no servidor e entrega os arrays prontos aos
// componentes — nenhum componente desta aba abre conexao.
//
// O QUE ESTA TELA LE DO BANCO (camada de dados @/lib/data)
//   getPaciente(id)   [src/lib/data/pacientes.ts -> tabela `pacientes`]
//     Desta linha usa SO o JSONB `patient_summary` (contrato PatientSummary em
//     @/types/clinical), e dentro dele apenas dois arrays:
//       - patient_summary.interconsultas[]  { especialidade, data, status, notas }
//       - patient_summary.programacao[]     { descricao, data, tipo, status }
//     Nao ha tabela propria para interconsulta/programacao no schema v3: as duas
//     vivem na ficha de admissao (CLAUDE.md §4). Pendencia de tarefa e outra
//     coisa — mora na tabela `pendencias` e aparece no War Room, nao aqui.
//
// ZERO ALUCINACAO: array ausente/vazio => estado vazio com convite, JAMAIS uma
// linha de exemplo. Item sem o campo obrigatorio (especialidade / descricao) e
// descartado e contado em voz alta pelos componentes.
// ============================================================================
import type {ReactElement} from "react";
import {notFound} from "next/navigation";
import {getPaciente} from "@/lib/data";
import type {Interconsulta, PatientSummary, Programacao} from "@/types/clinical";
import {txt} from "@/features/patients/components/PatientHeader";
import {
  CSS_ESPECIALIDADES,
  fmtDataEsp,
  InterconsultaList
} from "@/features/especialidades/components/InterconsultaList";
import {ProgramacaoList} from "@/features/especialidades/components/ProgramacaoList";

export const dynamic = "force-dynamic";

/** JSONB nao garante forma: o que nao for array vira lista vazia (nunca quebra a tela). */
function comoArray<T>(v: T[] | null | undefined): T[] {
  return Array.isArray(v) ? v : [];
}

export interface EspecialidadesPageProps {
  params: Promise<{ id: string }>;
}

export default async function EspecialidadesPage({params}: EspecialidadesPageProps): Promise<ReactElement> {
  const {id} = await params;
  const paciente = await getPaciente(id);
  if (!paciente) notFound();

  const resumo: PatientSummary | null = paciente.patient_summary ?? null;
  const interconsultas: Interconsulta[] = comoArray(resumo?.interconsultas);
  const programacao: Programacao[] = comoArray(resumo?.programacao);
  const atualizacao = fmtDataEsp(txt(resumo?.ultima_atualizacao));

  return (
    <section className="esps" aria-labelledby="esps-titulo">
      <style dangerouslySetInnerHTML={{__html: CSS_ESPECIALIDADES + CSS_ESPS}}/>

      <header className="esps__topo">
        <div className="esps__ident">
          <h2 className="esps__titulo" id="esps-titulo">
            Especialidades
          </h2>
          <p className="esps__sub">
            Interconsultas e programação da ficha de admissão (<code
            className="tabnum">patient_summary</code>),
            agrupadas por status — <strong>pendente primeiro</strong>.
          </p>
        </div>

        {atualizacao ? (
          <span className="esps__origem tabnum" title="patient_summary.ultima_atualizacao">
            ficha atualizada em {atualizacao}
          </span>
        ) : null}
      </header>

      <InterconsultaList itens={interconsultas}/>

      <hr className="esps__divisor"/>

      <ProgramacaoList itens={programacao}/>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CSS da aba (classes .esps-*). O CSS dos componentes (.esp-*) vem de
// CSS_ESPECIALIDADES. So tokens do design system — zero hex.
// ---------------------------------------------------------------------------
const CSS_ESPS = `
.esps{display:flex;flex-direction:column;gap:14px;min-width:0}

.esps__topo{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:10px}
.esps__ident{min-width:0;flex:1 1 320px}
.esps__titulo{margin:0;font-size:var(--text-lg,20px);font-weight:700;line-height:var(--leading-tight,1.15);
  color:var(--text-heading)}
.esps__sub{margin:4px 0 0;max-width:78ch;font-size:var(--text-xs,11px);
  line-height:var(--leading-snug,1.35);color:var(--text-muted)}
.esps__origem{flex:0 0 auto;padding:4px 10px;border:1px solid var(--border-default);
  border-radius:var(--radius-pill,9999px);background:var(--surface-card);
  font-size:var(--text-xs,11px);color:var(--text-muted)}

.esps__divisor{height:1px;margin:2px 0;border:0;background:var(--border-subtle)}
`;
