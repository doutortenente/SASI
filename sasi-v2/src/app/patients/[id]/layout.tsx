// ============================================================================
// SASI v2 — Chassi da tela de PACIENTE (cabecalho + abas)
// ----------------------------------------------------------------------------
// Server Component. Le UMA vez a linha do paciente e pendura:
//   PatientHeader (identificacao/gravidade)  +  PatientTabs (navegacao)  +  {children}
// Cada aba (children) e uma rota propria e busca os SEUS dados — este layout
// nao repassa dado clinico por prop, so o chassi.
//
// Camada de dados: getPaciente(id)  [src/lib/data/pacientes.ts -> tabela `pacientes`]
// Paciente inexistente (ou id invalido) => notFound(), nunca tela com dado vazio
// que pareca real.
//
// O <style> abaixo segue o padrao do chassi raiz (app/layout.tsx): CSS estrutural
// junto da rota que o usa, porque hover/foco/scroll de aba nao cabem em estilo
// inline. So tokens do design system — zero hex.
// ============================================================================
import type { ReactElement, ReactNode } from "react";
import { notFound } from "next/navigation";
import { getPaciente } from "@/lib/data";
import { PatientHeader } from "@/features/patients/components/PatientHeader";
import { PatientTabs } from "@/features/patients/components/PatientTabs";

export const dynamic = "force-dynamic";

export interface PatientLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function PatientLayout({ children, params }: PatientLayoutProps): Promise<ReactElement> {
  const { id } = await params;
  const paciente = await getPaciente(id);
  if (!paciente) notFound();

  return (
    <div className="pt-shell">
      <style dangerouslySetInnerHTML={{ __html: CSS_PACIENTE }} />

      <PatientHeader paciente={paciente} />
      <PatientTabs pacienteId={paciente.id} />

      <div className="pt-conteudo">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CSS do chassi do paciente (classes .pt-*). Consumido tambem por PatientTabs.
// ---------------------------------------------------------------------------
const CSS_PACIENTE = `
.pt-shell{display:flex;flex-direction:column;gap:14px;min-width:0}

/* ---------- cabecalho ---------- */
.pt-header{display:flex;flex-direction:column;gap:12px;padding:14px;
  background:var(--surface-card);border:1px solid var(--border-default);
  border-radius:var(--radius-xl,16px);box-shadow:var(--shadow-card)}
.pt-header__topo{display:flex;align-items:center;gap:10px;flex-wrap:wrap}

.pt-voltar{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 10px;margin-left:-10px;
  border-radius:var(--radius-md,8px);color:var(--text-muted);text-decoration:none;
  font-size:var(--text-xs,11px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;
  transition:background var(--dur-fast,120ms) var(--ease-out,ease),color var(--dur-fast,120ms) var(--ease-out,ease)}
.pt-voltar:hover{background:var(--surface-raised);color:var(--text-heading)}
.pt-voltar:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

/* ---------- abas ---------- */
.pt-tabs{overflow-x:auto;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;
  scrollbar-width:thin;border-bottom:1px solid var(--border-default)}
.pt-tabs__list{display:flex;gap:2px;min-width:max-content;list-style:none;margin:0;padding:0}
.pt-tab{display:inline-flex;align-items:center;min-height:44px;padding:0 14px;white-space:nowrap;
  border-bottom:2px solid transparent;border-radius:var(--radius-sm,6px) var(--radius-sm,6px) 0 0;
  color:var(--text-muted);text-decoration:none;
  font-size:var(--text-sm,13px);font-weight:600;letter-spacing:.01em;
  transition:background var(--dur-fast,120ms) var(--ease-out,ease),color var(--dur-fast,120ms) var(--ease-out,ease),
             border-color var(--dur-fast,120ms) var(--ease-out,ease)}
.pt-tab:hover{background:var(--surface-raised);color:var(--text-heading)}
.pt-tab:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.pt-tab[aria-current="page"]{color:var(--accent-text);border-bottom-color:var(--accent);font-weight:700}

/* ---------- area da aba ---------- */
.pt-conteudo{min-width:0}

@media (prefers-reduced-motion:reduce){
  .pt-voltar,.pt-tab{transition:none}
}
`;
