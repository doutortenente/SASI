// ============================================================================
// SASI v2 — Aba do paciente: PRESCRICAO
// ----------------------------------------------------------------------------
// Rota: /patients/[id]/prescricao   (cabecalho e abas vem do layout.tsx)
// Server Component: le o banco no servidor e entrega dado pronto aos
// componentes — nenhum componente desta aba abre conexao.
//
// O QUE ESTA TELA LE DO BANCO (camada de dados @/lib/data)
//   1. getUltimaEvolucao(id)   [src/lib/data/evolucoes.ts -> tabela `evolucoes`]
//        -> prescricao (jsonb por categoria: cardiovascular, snc, gastro_endocrino,
//           infeccioso_resp, sintomaticos_sn, solucoes_diureticos, nutricao)
//        -> dvas / sedativos (jsonb array de Infusao: droga, dose, unidade,
//           diluicao, vazao) = as infusoes CONTINUAS em curso
//        -> data_evolucao + plantao: de QUANDO e esta prescricao (o rodape diz).
//        A prescricao e um retrato do plantao: esta tela mostra a ULTIMA gravada,
//        nunca a soma de varias evolucoes.
//   2. listarAtbsAtivos(id)    [src/lib/data/stewardship.ts -> view `vw_dias_atb_ativo`]
//        -> antibioticos SEM data_fim, com dias_terapia (D-ATB, contado no banco)
//           e stewardship_flag (ok / warning >= 7 d / critical >= 14 d).
//
// Nada e calculado aqui: D-ATB e flag vem da view; dose e texto de item vem do
// JSONB como foram gravados.
//
// ZERO ALUCINACAO: sem evolucao => diz que nao ha evolucao (nao mostra kardex
// vazio como se fosse "sem medicacao"). Categoria sem item some; prescricao
// inteira vazia vira estado vazio explicito.
// ============================================================================
import type { ReactElement } from "react";
import { getUltimaEvolucao, listarAtbsAtivos, type VwDiasAtbAtivo } from "@/lib/data";
import type { Evolucao, Plantao } from "@/types/clinical";
import { fmtData } from "@/features/patients/components/PatientHeader";
import { KardexTable, CSS_KARDEX } from "@/features/prescricao/components/KardexTable";
import { AtbStewardship, CSS_ATB_STEWARDSHIP } from "@/features/prescricao/components/AtbStewardship";

export const dynamic = "force-dynamic";

/** Rotulo pt-BR do enum `plantao_enum`. */
const ROTULO_PLANTAO: Record<Plantao, string> = {
  manha: "manhã",
  tarde: "tarde",
  noite: "noite",
  plantao_24h: "plantão 24 h",
};

/** Plantao fora do vocabulario => imprime o valor cru (nunca "—" por engano). */
function rotuloPlantao(p: Plantao | string | null | undefined): string | null {
  if (typeof p !== "string" || p.trim() === "") return null;
  return ROTULO_PLANTAO[p as Plantao] ?? p;
}

export interface PrescricaoPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrescricaoPage({ params }: PrescricaoPageProps): Promise<ReactElement> {
  const { id } = await params;

  // O layout ja garantiu que o paciente existe (getPaciente + notFound).
  const [evolucao, atbs]: [Evolucao | null, VwDiasAtbAtivo[]] = await Promise.all([
    getUltimaEvolucao(id),
    listarAtbsAtivos(id),
  ]);

  // data_evolucao vem como timestamp: mostramos a DATA gravada (prefixo AAAA-MM-DD),
  // sem converter fuso — e a data clinica do plantao, nao um instante.
  const quando = evolucao ? fmtData(evolucao.data_evolucao) : null;
  const plantao = evolucao ? rotuloPlantao(evolucao.plantao) : null;

  return (
    <section className="presc" aria-labelledby="presc-titulo">
      <style dangerouslySetInnerHTML={{ __html: CSS_PRESCRICAO + CSS_KARDEX + CSS_ATB_STEWARDSHIP }} />

      <header className="presc__topo">
        <div className="presc__ident">
          <h2 className="presc__titulo" id="presc-titulo">
            Prescrição
          </h2>
          <p className="presc__sub">
            Kardex da <strong>última evolução gravada</strong> — uma seção por categoria, mais as infusões contínuas em
            curso. Texto e dose aparecem exatamente como foram registrados.
          </p>
        </div>

        {evolucao ? (
          <span className="presc__origem tabnum" title="evolucoes.data_evolucao · evolucoes.plantao">
            evolução de {quando}
            {plantao ? ` · ${plantao}` : ""}
          </span>
        ) : null}
      </header>

      {evolucao ? (
        <KardexTable prescricao={evolucao.prescricao} dvas={evolucao.dvas} sedativos={evolucao.sedativos} />
      ) : (
        <div className="presc__vazio" aria-live="polite">
          <strong className="presc__vazio-titulo">Nenhuma evolução registrada</strong>
          <span className="presc__vazio-txt">
            A prescrição mora em <code className="tabnum">evolucoes.prescricao</code>: sem evolução gravada não há
            kardex a mostrar. Isso <strong>não</strong> significa paciente sem prescrição.
          </span>
        </div>
      )}

      <hr className="presc__divisor" />

      <AtbStewardship atbs={atbs} />
    </section>
  );
}

// ---------------------------------------------------------------------------
// CSS da aba (classes .presc-*). Mesmo padrao do chassi: CSS estrutural junto da
// rota que o usa. So tokens do design system — zero hex.
// ---------------------------------------------------------------------------
const CSS_PRESCRICAO = `
.presc{display:flex;flex-direction:column;gap:14px;min-width:0}

.presc__topo{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:10px}
.presc__ident{min-width:0;flex:1 1 320px}
.presc__titulo{margin:0;font-size:var(--text-lg,20px);font-weight:700;line-height:var(--leading-tight,1.15);
  color:var(--text-heading)}
.presc__sub{margin:4px 0 0;max-width:78ch;font-size:var(--text-xs,11px);
  line-height:var(--leading-snug,1.35);color:var(--text-muted)}
.presc__origem{flex:0 0 auto;padding:4px 10px;border:1px solid var(--border-default);
  border-radius:var(--radius-pill,9999px);background:var(--surface-card);
  font-size:var(--text-xs,11px);color:var(--text-muted)}

.presc__divisor{height:1px;margin:2px 0;border:0;background:var(--border-subtle)}

.presc__vazio{display:flex;flex-direction:column;gap:6px;padding:24px 16px;text-align:center;
  background:var(--surface-card);border:1px dashed var(--border-strong);border-radius:var(--radius-lg,12px)}
.presc__vazio-titulo{font-size:var(--text-md,17px);color:var(--text-heading)}
.presc__vazio-txt{max-width:62ch;margin:0 auto;font-size:var(--text-sm,13px);
  line-height:var(--leading-snug,1.35);color:var(--text-muted)}
`;
