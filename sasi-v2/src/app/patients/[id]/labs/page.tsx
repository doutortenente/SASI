// ============================================================================
// SASI v2 — Aba do paciente: FOLHAO LABORATORIO
// ----------------------------------------------------------------------------
// Rota: /patients/[id]/labs          (cabecalho e abas vem do layout.tsx)
// Server Component: le o banco no servidor e entrega a tabela pronta.
//
// O QUE ESTA TELA LE DO BANCO (camada de dados @/lib/data):
//   1. serieLabs(id, dias, { tipos: TIPOS_FOLHAO })
//        -> tabela `eventos_clinicos` (serie temporal), filtrada pelos codigos do
//           folhao e pela janela de dias, agregada por DIA CIVIL de Sao Paulo.
//        -> dimensao `evento_tipo_ref` (via FK de eventos_clinicos.tipo): e dela
//           que vem ROTULO, UNIDADE e FAIXA fisiologica de cada linha. Nenhum nome
//           de exame e escrito no componente.
//        Devolve a matriz `Folhao` { dias[], linhas[{ celulas[] }] } com as
//        colunas do MAIS ANTIGO ao MAIS RECENTE (a tabela inverte para exibir).
//        Passar `tipos` fixa o conjunto E a ordem: exame sem coleta nenhuma
//        aparece como linha inteira de "—" (o folhao e uma planilha fixa).
//   2. getTipoRef()
//        -> a mesma dimensao `evento_tipo_ref`, so para detectar o MODO DEGRADADO
//           (tabela ilegivel com a chave anon => rotulo vira o codigo). A consulta
//           e memoizada por requisicao (React cache), entao nao ha ida extra ao banco.
//
// Nada e calculado aqui: agregacao por dia, maximo/minimo e flag de faixa vem da
// camada de dados; a tela so desenha e explica.
//
// ZERO ALUCINACAO: dia sem coleta imprime "—" e ponto. A tela nunca arrasta o
// valor do dia anterior, nunca usa 0 como vazio e nunca chuta unidade.
// ============================================================================
import type {ReactElement} from "react";
import Link from "next/link";
import {getTipoRef, serieLabs} from "@/lib/data";
import {TabelaoLabs, TIPOS_FOLHAO} from "@/features/labs/components/TabelaoLabs";

export const dynamic = "force-dynamic";

/** Janelas oferecidas na tela. serieLabs() aceita ate 90 dias. */
const DIAS_OPCOES: readonly number[] = [7, 14, 30];
const DIAS_PADRAO = 7;

/** ?dias=14 -> 14. Valor ausente/estranho volta ao padrao (nunca quebra a tela). */
function normalizaDias(bruto: string | string[] | undefined): number {
  const v = Array.isArray(bruto) ? bruto[0] : bruto;
  const n = Number(v);
  return DIAS_OPCOES.includes(n) ? n : DIAS_PADRAO;
}

export interface LabsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LabsPage({
                                         params,
                                         searchParams
                                       }: LabsPageProps): Promise<ReactElement> {
  const [{id}, sp] = await Promise.all([params, searchParams]);
  const dias = normalizaDias(sp?.dias);

  // O layout ja garantiu que o paciente existe (getPaciente + notFound).
  const [folhao, dimensao] = await Promise.all([
    serieLabs(id, dias, {tipos: [...TIPOS_FOLHAO]}),
    getTipoRef(),
  ]);

  return (
    <section className="labs" aria-labelledby="labs-titulo">
      <style dangerouslySetInnerHTML={{__html: CSS_LABS}}/>

      <header className="labs__topo">
        <div className="labs__ident">
          <h2 className="labs__titulo" id="labs-titulo">
            Folhão de laboratório
          </h2>
          <p className="labs__sub">
            Uma linha por exame, uma coluna por dia — <strong>mais recente à esquerda</strong>.
            Rótulo, unidade e
            faixa fisiológica vêm da dimensão <code className="tabnum">evento_tipo_ref</code>.
          </p>
        </div>

        <nav className="labs__janela" aria-label="Janela do folhão em dias">
          <span className="labs__janela-rot">Janela</span>
          {DIAS_OPCOES.map((d: number) => (
            <Link
              key={d}
              href={`/patients/${id}/labs?dias=${d}`}
              className="labs__opcao tabnum"
              aria-current={d === dias ? "page" : undefined}
              title={`Mostrar os últimos ${d} dias`}
            >
              {d} d
            </Link>
          ))}
        </nav>
      </header>

      <TabelaoLabs folhao={folhao} dimensaoIndisponivel={dimensao.length === 0}/>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CSS da aba (classes .labs-*). Mesmo padrao do chassi: CSS estrutural junto da
// rota que o usa. So tokens do design system — zero hex.
// ---------------------------------------------------------------------------
const CSS_LABS = `
.labs{display:flex;flex-direction:column;gap:12px;min-width:0}

.labs__topo{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:10px}
.labs__ident{min-width:0;flex:1 1 320px}
.labs__titulo{margin:0;font-size:var(--text-lg,20px);font-weight:700;line-height:var(--leading-tight,1.15);
  color:var(--text-heading)}
.labs__sub{margin:4px 0 0;max-width:78ch;font-size:var(--text-xs,11px);
  line-height:var(--leading-snug,1.35);color:var(--text-muted)}

.labs__janela{display:flex;align-items:center;gap:4px}
.labs__janela-rot{margin-right:4px;font-size:var(--text-2xs,10px);font-weight:700;
  letter-spacing:var(--tracking-eyebrow,.08em);text-transform:uppercase;color:var(--text-faint)}
.labs__opcao{display:inline-flex;align-items:center;justify-content:center;min-width:52px;min-height:44px;
  padding:0 12px;border:1px solid var(--border-default);border-radius:var(--radius-md,8px);
  background:var(--surface-card);color:var(--text-muted);text-decoration:none;
  font-size:var(--text-xs,11px);font-weight:700;
  transition:background var(--dur-fast,120ms) var(--ease-out,ease),color var(--dur-fast,120ms) var(--ease-out,ease),
             border-color var(--dur-fast,120ms) var(--ease-out,ease)}
.labs__opcao:hover{background:var(--surface-raised);color:var(--text-heading);border-color:var(--border-strong)}
.labs__opcao:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.labs__opcao[aria-current="page"]{background:var(--accent-soft);color:var(--accent-text);border-color:var(--accent)}

@media (prefers-reduced-motion:reduce){.labs__opcao{transition:none}}
`;
