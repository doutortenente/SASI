// ============================================================================
// SASI v2 — Aba do paciente: FICHA DE EVOLUCAO
// ----------------------------------------------------------------------------
// Rota: /patients/[id]/evolucao   (cabecalho e abas vem do layout.tsx)
// Server Component: le o banco no servidor e entrega tudo pronto. O unico
// pedaco client e o NotaPreview (botao "copiar" precisa do navegador).
//
// O QUE ESTA TELA LE DO BANCO (camada de dados @/lib/data):
//   1. getUltimaEvolucao(id)  [src/lib/data/evolucoes.ts -> tabela `evolucoes`]
//        -> a evolucao MAIS RECENTE. Desta linha usa:
//           impressao (text[]) e conduta (text[])           -> o par 1:1
//           problemas_ativos / condutas_sistemas / riscos    -> JSONB estruturado
//           neuro..infecto (7 JSONB)                         -> exame na nota
//           data_evolucao, plantao, sofa_total               -> cabecalho da nota
//   2. getPaciente(id)        [src/lib/data/pacientes.ts -> tabela `pacientes`]
//        -> identificacao do cabecalho da nota: uti, leito, nome, idade, hd e
//           data_adm (para os dias de UTI). O layout le a mesma linha; sao duas
//           leituras de 1 linha por id (indexada) — o App Router nao passa dado
//           de layout para page, e duplicar a consulta e mais barato que um
//           cache global improvisado.
//   3. getTipoRefMap()        [src/lib/data/eventos.ts -> dimensao `evento_tipo_ref`]
//        -> so `unidade_padrao`, para o exame por sistemas dentro da nota sair
//           com a unidade do BANCO. Dimensao vazia => numero sem unidade.
//           Consulta memoizada por requisicao (React cache).
//
// DOUTRINA APLICADA
//  - IMPRESSAO <-> CONDUTA 1:1. O pareamento e por INDICE e roda em UM lugar so
//    (parear(), em ProblemaConduta) — a tela e a nota copiada nunca divergem.
//    Item orfao aparece marcado nas duas.
//  - ZERO ALUCINACAO: nada aqui e resumido, deduzido ou completado.
//  - A nota copiada NAO leva metadado do app; o aviso de conferencia fica na tela.
// ============================================================================
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { getPaciente, getTipoRefMap, getUltimaEvolucao } from "@/lib/data";
import type { ProblemaAtivo } from "@/types/clinical";
import { ProblemaConduta, CSS_PROBLEMA_CONDUTA } from "@/features/evolucao/components/ProblemaConduta";
import { NotaPreview, CSS_NOTA_PREVIEW, type NotaFonte, type NotaSistema } from "@/features/evolucao/components/NotaPreview";
import {
  ORDEM_SISTEMAS,
  ROTULO_PLANTAO,
  ROTULO_SISTEMA,
  TRAVESSAO,
  diasDesde,
  fmtDataBR,
  mapaUnidades,
  sistemasDaEvolucao,
  textoSistema,
  type SistemaId,
} from "@/features/evolucao/components/SystemPanel";

export const dynamic = "force-dynamic";

/** A partir de quantos dias a defasagem da evolucao vira aviso na tela. */
const DIAS_PARA_AVISAR = 1;

const EYEBROW = {
  fontSize: "var(--text-2xs, 10px)",
  fontWeight: 700,
  letterSpacing: "var(--tracking-eyebrow, .08em)",
  textTransform: "uppercase" as const,
  color: "var(--text-muted)",
};

/** Texto util ou null (string vazia nao e dado). */
function txt(v: string | null | undefined): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

export interface EvolucaoPageProps {
  params: Promise<{ id: string }>;
}

export default async function EvolucaoPage({ params }: EvolucaoPageProps): Promise<ReactElement> {
  const { id } = await params;

  const [paciente, evolucao, refs] = await Promise.all([getPaciente(id), getUltimaEvolucao(id), getTipoRefMap()]);
  if (!paciente) notFound();

  // -------------------------------------------------------------------------
  // Sem evolucao nao ha ficha. Dizemos isso — nao montamos uma nota vazia que
  // pareceria um registro real.
  // -------------------------------------------------------------------------
  if (!evolucao) {
    return (
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: "24px 16px",
          textAlign: "center",
          background: "var(--surface-card)",
          border: "1px dashed var(--border-strong)",
          borderRadius: "var(--radius-lg, 12px)",
        }}
      >
        <strong style={{ fontSize: "var(--text-md, 17px)", color: "var(--text-heading)" }}>
          Nenhuma evolução registrada
        </strong>
        <span style={{ fontSize: "var(--text-sm, 13px)", color: "var(--text-muted)" }}>
          A ficha é lida da tabela <code className="tabnum">evolucoes</code>. Este paciente ainda não tem nenhuma
          evolução — não há impressão, conduta nem nota para o prontuário.
        </span>
      </section>
    );
  }

  const rotuloPlantao: Record<string, string> = ROTULO_PLANTAO;
  const plantao = rotuloPlantao[evolucao.plantao] ?? String(evolucao.plantao);
  const data = fmtDataBR(evolucao.data_evolucao);
  const dias = diasDesde(evolucao.data_evolucao);

  // ---- fonte da nota: tudo resolvido no servidor (props serializaveis) ------
  const unidades = mapaUnidades(refs);
  const dadosSistemas = sistemasDaEvolucao(evolucao);

  const sistemas: NotaSistema[] = ORDEM_SISTEMAS.map(
    (s: SistemaId): NotaSistema => ({
      rotulo: ROTULO_SISTEMA[s],
      texto: textoSistema(s, dadosSistemas[s], unidades),
    }),
  );

  const problemas: string[] = (Array.isArray(evolucao.problemas_ativos) ? evolucao.problemas_ativos : [])
    .map((p: ProblemaAtivo) => txt(p?.texto))
    .filter((t: string | null): t is string => t !== null);

  const fonte: NotaFonte = {
    cabecalho: {
      uti: paciente.uti,
      leito: paciente.leito,
      nome: txt(paciente.nome),
      idade: paciente.idade,
      dataEvolucao: data === TRAVESSAO ? null : data,
      plantao,
      diasInternacao: diasDesde(paciente.data_adm),
      sofaTotal: evolucao.sofa_total,
    },
    hd: txt(paciente.hd),
    problemas,
    sistemas,
    impressao: Array.isArray(evolucao.impressao) ? evolucao.impressao : [],
    conduta: Array.isArray(evolucao.conduta) ? evolucao.conduta : [],
  };

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }} aria-labelledby="ev-titulo">
      <style dangerouslySetInnerHTML={{ __html: CSS_PROBLEMA_CONDUTA + CSS_NOTA_PREVIEW }} />

      {/* ---- cabecalho da aba ---- */}
      <header style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <h2
            id="ev-titulo"
            style={{ margin: 0, fontSize: "var(--text-lg, 20px)", fontWeight: 700, color: "var(--text-heading)" }}
          >
            Ficha de evolução
          </h2>
          <p
            style={{
              margin: "4px 0 0",
              maxWidth: "80ch",
              fontSize: "var(--text-xs, 11px)",
              lineHeight: "var(--leading-snug, 1.35)",
              color: "var(--text-muted)",
            }}
          >
            Cada problema com a sua conduta, casados pela posição na lista (<strong>1:1</strong>). Abaixo, a nota em
            texto corrido pronta para o prontuário.
          </p>
        </div>

        <div style={{ display: "flex", gap: 18, textAlign: "right" }}>
          <div>
            <div style={EYEBROW}>Evolução</div>
            <div
              className="tabnum"
              title="evolucoes.data_evolucao · evolucoes.plantao"
              style={{ fontSize: "var(--text-md, 17px)", fontWeight: 700, color: "var(--text-heading)" }}
            >
              {data}
            </div>
            <div style={{ fontSize: "var(--text-xs, 11px)", color: "var(--text-muted)" }}>plantão {plantao}</div>
          </div>
          <div>
            <div style={EYEBROW}>SOFA</div>
            <div
              className="tabnum"
              title="evolucoes.sofa_total — calculado no banco; sem os 6 componentes fica null e a tela mostra travessão"
              style={{
                fontSize: "var(--text-md, 17px)",
                fontWeight: 700,
                color: evolucao.sofa_total == null ? "var(--text-faint)" : "var(--text-heading)",
              }}
            >
              {evolucao.sofa_total == null ? TRAVESSAO : String(evolucao.sofa_total)}
            </div>
          </div>
        </div>
      </header>

      {/* ---- defasagem: ficha antiga lida como se fosse de hoje e erro ---- */}
      {dias != null && dias >= DIAS_PARA_AVISAR ? (
        <p
          style={{
            margin: 0,
            padding: "10px 12px",
            background: "color-mix(in srgb, var(--warning) 10%, var(--surface-card))",
            border: "1px solid color-mix(in srgb, var(--warning) 34%, transparent)",
            borderLeft: "4px solid var(--warning)",
            borderRadius: "var(--radius-lg, 12px)",
            fontSize: "var(--text-sm, 13px)",
            lineHeight: "var(--leading-snug, 1.35)",
            color: "var(--text-body)",
          }}
        >
          <strong style={{ color: "var(--text-heading)" }}>
            Esta ficha é de {data} (há <span className="tabnum">{dias}</span> {dias === 1 ? "dia" : "dias"}).
          </strong>{" "}
          Impressão, conduta e nota abaixo são daquele plantão. Copiar sem revisar é assinar um plano que pode não
          valer mais.
        </p>
      ) : null}

      {/* ---- o par 1:1 + os JSONB estruturados ---- */}
      <ProblemaConduta
        impressao={evolucao.impressao}
        conduta={evolucao.conduta}
        problemasAtivos={evolucao.problemas_ativos}
        condutasSistemas={evolucao.condutas_sistemas}
        riscos={evolucao.riscos}
      />

      {/* ---- nota em texto corrido, com botao copiar ---- */}
      <NotaPreview fonte={fonte} />
    </section>
  );
}
