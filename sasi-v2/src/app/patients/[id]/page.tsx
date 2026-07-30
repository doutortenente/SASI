// ============================================================================
// SASI v2 — Aba padrao do paciente: RESUMO (Patient Summary)
// ----------------------------------------------------------------------------
// Rota: /patients/[id]   (o chassi com cabecalho e abas vive no layout.tsx)
// Server Component.
//
// Camada de dados: getPaciente(id)  [src/lib/data/pacientes.ts -> tabela `pacientes`]
// Desta linha usa SO o JSONB `patient_summary` (contrato PatientSummary em
// @/types/clinical). O layout tambem le a mesma linha — sao duas leituras de 1
// linha por id (indexada); nao ha como passar dado de layout para page no App
// Router, e duplicar a consulta e mais barato que inventar um cache global.
//
// ZERO ALUCINACAO: o painel imprime o que esta gravado. Ausente => "—" ou
// secao oculta. Ficha inteira vazia => estado vazio explicito.
// ============================================================================
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { getPaciente } from "@/lib/data";
import { SummaryPanel } from "@/features/patients/components/SummaryPanel";

export const dynamic = "force-dynamic";

export interface ResumoPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResumoPage({ params }: ResumoPageProps): Promise<ReactElement> {
  const { id } = await params;
  const paciente = await getPaciente(id);
  if (!paciente) notFound();

  return <SummaryPanel resumo={paciente.patient_summary} />;
}
