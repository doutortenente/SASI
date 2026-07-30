// ============================================================================
// SASI v2 — Aba do paciente: EXAME FISICO
// ----------------------------------------------------------------------------
// Rota: /patients/[id]/exame     (cabecalho e abas vem do layout.tsx)
// Server Component: le o banco no servidor e entrega os paineis prontos.
//
// O QUE ESTA TELA LE DO BANCO (camada de dados @/lib/data):
//   1. getUltimaEvolucao(id)   [src/lib/data/evolucoes.ts -> tabela `evolucoes`]
//        -> a evolucao MAIS RECENTE do paciente (data_evolucao desc, limite 1).
//           Desta linha usa so os 7 JSONB por sistema: neuro, resp, hemo, tgi,
//           renal, hemato, infecto (+ data_evolucao e plantao, para datar a tela).
//   2. getTipoRefMap()         [src/lib/data/eventos.ts -> dimensao `evento_tipo_ref`]
//        -> SO para pegar `unidade_padrao` de cada parametro (mg/dL, mmHg, %...).
//           A unidade vem do BANCO, nunca do componente. Dimensao indisponivel
//           => os numeros saem sem unidade, e a tela avisa. Consulta memoizada
//           por requisicao (React cache): nao ha ida extra ao banco.
//
// Nada e calculado aqui. A tela nao converte unidade, nao ordena max/min, nao
// deriva escore: imprime o JSONB como esta.
//
// ZERO ALUCINACAO: sistema sem nenhum campo => "nao avaliado". Campo conhecido
// sem valor => travessao. Vitais SEMPRE em MAXIMO–MINIMO (regra de ferro).
//
// AVISO QUE ESTA ABA PRECISA DAR: a evolucao mais recente pode ser ANTIGA (no
// banco vivo, de 18-jul). Exame fisico velho apresentado sem data e leitura
// errada de paciente — entao a tela datilografa a data e grita a defasagem.
// ============================================================================
import type { ReactElement } from "react";
import { getTipoRefMap, getUltimaEvolucao } from "@/lib/data";
import {
  SystemPanel,
  ORDEM_SISTEMAS,
  ROTULO_PLANTAO,
  diasDesde,
  fmtDataBR,
  mapaUnidades,
  sistemasDaEvolucao,
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

const AVISO = {
  margin: 0,
  padding: "10px 12px",
  borderRadius: "var(--radius-lg, 12px)",
  fontSize: "var(--text-sm, 13px)",
  lineHeight: "var(--leading-snug, 1.35)",
  color: "var(--text-body)",
};

export interface ExamePageProps {
  params: Promise<{ id: string }>;
}

export default async function ExamePage({ params }: ExamePageProps): Promise<ReactElement> {
  const { id } = await params;

  // O layout ja garantiu que o paciente existe (getPaciente + notFound).
  const [evolucao, refs] = await Promise.all([getUltimaEvolucao(id), getTipoRefMap()]);

  // -------------------------------------------------------------------------
  // Sem evolucao nao ha exame fisico. A tela diz isso — nao desenha 7 paineis
  // vazios que pareceriam "paciente examinado e tudo normal".
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
          O exame físico é lido da última evolução (tabela <code className="tabnum">evolucoes</code>). Este paciente
          ainda não tem nenhuma — e o app não preenche o vazio.
        </span>
      </section>
    );
  }

  const dados = sistemasDaEvolucao(evolucao);
  const unidades = mapaUnidades(refs);
  const semDimensao = refs.size === 0;

  const rotuloPlantao: Record<string, string> = ROTULO_PLANTAO;
  const plantao = rotuloPlantao[evolucao.plantao] ?? String(evolucao.plantao);
  const data = fmtDataBR(evolucao.data_evolucao);
  const dias = diasDesde(evolucao.data_evolucao);

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }} aria-labelledby="ex-titulo">
      {/* ---- cabecalho da aba ---- */}
      <header style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <h2
            id="ex-titulo"
            style={{ margin: 0, fontSize: "var(--text-lg, 20px)", fontWeight: 700, color: "var(--text-heading)" }}
          >
            Exame físico
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
            Um painel por sistema, lido dos JSONB da <strong>última evolução</strong>. Pares de sinais vitais sempre em{" "}
            <strong>máximo–mínimo</strong>. Sistema sem nenhum campo aparece como <strong>não avaliado</strong>.
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
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
      </header>

      {/* ---- defasagem: exame antigo apresentado como se fosse de hoje e erro ---- */}
      {dias != null && dias >= DIAS_PARA_AVISAR ? (
        <p
          style={{
            ...AVISO,
            background: "color-mix(in srgb, var(--warning) 10%, var(--surface-card))",
            border: "1px solid color-mix(in srgb, var(--warning) 34%, transparent)",
            borderLeft: "4px solid var(--warning)",
          }}
        >
          <strong style={{ color: "var(--text-heading)" }}>
            Este exame não é de hoje: a última evolução é de {data} (há <span className="tabnum">{dias}</span>{" "}
            {dias === 1 ? "dia" : "dias"}).
          </strong>{" "}
          Os achados abaixo valem para aquele plantão. Nada nesta tela foi atualizado desde então — o app mostra a
          última evolução gravada, não o estado atual do leito.
        </p>
      ) : null}

      {/* ---- dimensao fora do ar: os numeros perdem a unidade ---- */}
      {semDimensao ? (
        <p
          style={{
            ...AVISO,
            background: "color-mix(in srgb, var(--warning) 8%, var(--surface-card))",
            border: "1px solid color-mix(in srgb, var(--warning) 26%, transparent)",
            borderLeft: "4px solid var(--warning)",
            fontSize: "var(--text-xs, 11px)",
          }}
        >
          <strong style={{ color: "var(--text-heading)" }}>Unidades não exibidas nesta sessão.</strong> A dimensão{" "}
          <code className="tabnum">evento_tipo_ref</code> voltou vazia (a única policy de leitura é para o papel{" "}
          <code className="tabnum">authenticated</code> e o app usa a chave anônima), e é dela que sai a{" "}
          <code className="tabnum">unidade_padrao</code> de cada parâmetro. Os números saem <strong>pelados</strong> —
          preferimos isso a exibir unidade chutada. Exceção: campos cujo próprio nome traz a unidade (
          <code className="tabnum">*_ml</code>).
        </p>
      ) : null}

      {/* ---- os 7 sistemas, na ordem clinica ---- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
        {ORDEM_SISTEMAS.map((s: SistemaId) => (
          <SystemPanel key={s} sistema={s} dados={dados[s]} unidades={unidades} />
        ))}
      </div>

      <p style={{ margin: 0, fontSize: "var(--text-xs, 11px)", lineHeight: "var(--leading-snug, 1.35)", color: "var(--text-faint)" }}>
        Fonte: <code className="tabnum">evolucoes</code> (um JSONB por sistema). Rótulos e unidades vêm do banco;
        campo gravado fora do contrato conhecido aparece em <strong>outros campos registrados</strong>, cru — dado
        gravado nunca é escondido.
      </p>
    </section>
  );
}
