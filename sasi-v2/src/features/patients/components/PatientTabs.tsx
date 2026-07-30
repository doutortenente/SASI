"use client";
// ============================================================================
// SASI v2 — PatientTabs
// ----------------------------------------------------------------------------
// Abas da tela de paciente. E o UNICO pedaco client desta area (precisa de
// usePathname para marcar a aba ativa); cabecalho, resumo e demais abas
// continuam Server Components.
//
// Sao LINKS de navegacao, nao "tabs" ARIA: cada aba e uma rota de verdade
// (/patients/[id]/<aba>). Por isso <nav> + aria-current="page" — e nao
// role="tablist", que mentiria sobre o comportamento (nao ha painel trocando
// no cliente).
//
// As classes .pt-tabs / .pt-tab sao definidas no <style> de
// src/app/patients/[id]/layout.tsx (mesmo padrao de Sidebar/NavLink ↔ app/layout.tsx).
// ============================================================================
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";

export interface AbaPaciente {
  /** Segmento da rota. "" = aba padrao (Resumo), que mora em /patients/[id]. */
  slug: string;
  /** Rotulo visivel (pt-BR). */
  label: string;
  /** Descricao curta — vira title. */
  titulo: string;
}

/**
 * Ordem das abas na tela do paciente. Fonte unica: quem criar uma aba nova
 * adiciona aqui e cria a rota correspondente.
 */
export const ABAS_PACIENTE: readonly AbaPaciente[] = [
  { slug: "", label: "Resumo", titulo: "Ficha de admissão (patient_summary)" },
  { slug: "sinais", label: "Sinais 24h", titulo: "Sinais vitais das últimas 24 h (máximo–mínimo)" },
  { slug: "labs", label: "Folhão Labs", titulo: "Folhão de laboratório — série por dia" },
  { slug: "exame", label: "Exame físico", titulo: "Exame físico por sistema" },
  { slug: "evolucao", label: "Evolução", titulo: "Ficha de evolução do plantão" },
  { slug: "prescricao", label: "Prescrição", titulo: "Prescrição por categoria" },
  { slug: "especialidades", label: "Especialidades", titulo: "Interconsultas e programação" },
] as const;

export interface PatientTabsProps {
  /** uuid do paciente (pacientes.id). */
  pacienteId: string;
}

export function PatientTabs({ pacienteId }: PatientTabsProps): ReactElement {
  const pathname = usePathname() ?? "";
  const base = `/patients/${pacienteId}`;

  return (
    <nav className="pt-tabs" aria-label="Seções do paciente">
      <ul className="pt-tabs__list">
        {ABAS_PACIENTE.map((aba: AbaPaciente) => {
          const href = aba.slug ? `${base}/${aba.slug}` : base;
          const ativo =
            aba.slug === ""
              ? pathname === base || pathname === `${base}/`
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={aba.slug || "resumo"}>
              <Link href={href} className="pt-tab" aria-current={ativo ? "page" : undefined} title={aba.titulo}>
                {aba.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default PatientTabs;
