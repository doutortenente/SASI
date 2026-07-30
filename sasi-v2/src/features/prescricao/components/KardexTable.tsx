// ============================================================================
// SASI v2 — KardexTable (prescricao do plantao, por categoria)
// ----------------------------------------------------------------------------
// Desenha o que a evolucao gravou:
//   evolucoes.prescricao (jsonb)  -> uma secao por CATEGORIA clinica
//   evolucoes.dvas / .sedativos   -> bloco de INFUSOES CONTINUAS (o que corre agora)
//
// Server Component: recebe o dado ja lido pela pagina. Zero consulta aqui,
// zero calculo clinico, zero conversao de dose.
//
// DOUTRINA APLICADA
//  - ZERO ALUCINACAO: imprime EXATAMENTE o texto gravado. Nao normaliza nome de
//    droga, nao completa posologia, nao converte unidade (µg/kg/min continua
//    µg/kg/min), nao arrasta item de outra evolucao.
//  - Categoria SEM item nao vira secao vazia: ela some. Prescricao inteira vazia
//    => estado vazio explicito, que diz que "vazio" e AUSENCIA DE REGISTRO — e
//    nunca "paciente sem prescricao".
//  - Dose ausente aparece como travessao "—" ao lado da droga; a droga continua
//    visivel (correr uma infusao sem dose registrada e informacao clinica).
//  - Unidade so aparece quando veio no banco. Sem unidade => so o numero, cru.
//  - Numero em .tabnum (mono + tabular-nums).
//  - Cor SEMPRE por token (--sys-*, --badge-*, --text-*). Zero hex.
//
// O CSS (CSS_KARDEX) e injetado UMA vez pela pagina da aba.
// ============================================================================
import type { ReactElement } from "react";
import type { Infusao, Prescricao } from "@/types/clinical";
import { TRAVESSAO, txt } from "@/features/patients/components/PatientHeader";
import { num } from "@/lib/formatters/br";

// ---------------------------------------------------------------------------
// 1. Categorias do kardex — ORDEM DE LEITURA do plantao
// ---------------------------------------------------------------------------
// As chaves sao as do contrato `Prescricao` (@/types/clinical); o rotulo em
// pt-BR e a cor sao apresentacao. "Sintomaticos S/N" fecha a lista porque e o
// bloco condicional (se necessario), nao terapia em curso.
export interface CategoriaRx {
  /** Chave do JSONB evolucoes.prescricao. */
  chave: keyof Prescricao;
  /** Titulo visivel (pt-BR). */
  titulo: string;
  /** Token de cor do titulo. */
  cor: string;
  /** Token da barra lateral da secao. */
  barra: string;
  /** Explicacao curta — vira title da secao. */
  nota: string;
}

export const CATEGORIAS_RX: readonly CategoriaRx[] = [
  {
    chave: "cardiovascular",
    titulo: "Cardiovascular",
    cor: "var(--sys-hemo)",
    barra: "var(--sys-hemo-bar)",
    nota: "prescricao.cardiovascular",
  },
  {
    chave: "snc",
    titulo: "SNC — sedação e analgesia",
    cor: "var(--sys-neuro)",
    barra: "var(--sys-neuro-bar)",
    nota: "prescricao.snc",
  },
  {
    chave: "infeccioso_resp",
    titulo: "Infeccioso e respiratório",
    cor: "var(--sys-infecto)",
    barra: "var(--sys-infecto-bar)",
    nota: "prescricao.infeccioso_resp",
  },
  {
    chave: "gastro_endocrino",
    titulo: "Gastro e endócrino",
    cor: "var(--sys-tgi)",
    barra: "var(--sys-tgi-bar)",
    nota: "prescricao.gastro_endocrino",
  },
  {
    chave: "solucoes_diureticos",
    titulo: "Soluções e diuréticos",
    cor: "var(--sys-renal)",
    barra: "var(--sys-renal-bar)",
    nota: "prescricao.solucoes_diureticos",
  },
  {
    chave: "nutricao",
    titulo: "Nutrição",
    cor: "var(--success)",
    barra: "var(--success)",
    nota: "prescricao.nutricao",
  },
  {
    chave: "sintomaticos_sn",
    titulo: "Sintomáticos S/N",
    cor: "var(--text-muted)",
    barra: "var(--border-strong)",
    nota: "prescricao.sintomaticos_sn — uso condicional (se necessário)",
  },
] as const;

// ---------------------------------------------------------------------------
// 2. Leitura segura do JSONB (o banco nao garante forma)
// ---------------------------------------------------------------------------

/** Itens de uma categoria. Nao-array, item vazio ou nao-texto => descartado. */
function itensDe(prescricao: Prescricao | null | undefined, chave: keyof Prescricao): string[] {
  const bruto: unknown = prescricao ? prescricao[chave] : undefined;
  if (!Array.isArray(bruto)) return [];
  const saida: string[] = [];
  for (const item of bruto as unknown[]) {
    const t = typeof item === "string" ? txt(item) : null;
    if (t) saida.push(t);
  }
  return saida;
}

/** Lista de infusoes com droga legivel. Sem droga nao existe linha. */
function infusoesDe(lista: Infusao[] | null | undefined): Infusao[] {
  if (!Array.isArray(lista)) return [];
  return lista.filter((i: Infusao): boolean => !!i && txt(i.droga) !== null);
}

// ---------------------------------------------------------------------------
// 3. Dose de infusao — so o que veio gravado
// ---------------------------------------------------------------------------
interface DoseExib {
  /** Numero/texto da dose, ja em pt-BR quando veio numerico. */
  valor: string;
  /** Unidade REGISTRADA. null => nao imprime unidade nenhuma. */
  unidade: string | null;
}

/**
 * Ordem de preferencia: dose declarada -> vazao ml/h -> vazao µg/h -> vazao mg/h.
 * Nada disso gravado => null (a linha mostra "—" no lugar da dose).
 * O contrato tipa `dose` como string, mas o banco vivo grava numero
 * (ex.: {"dose": 0.04, "droga": "noradrenalina", "unidade": "µg/kg/min"}):
 * tratamos os dois sem converter nem arredondar para menos casas do que veio.
 */
function doseDe(i: Infusao): DoseExib | null {
  const bruto: unknown = i.dose;
  if (typeof bruto === "number" && Number.isFinite(bruto)) {
    return { valor: num(bruto, 3), unidade: txt(i.unidade) };
  }
  if (typeof bruto === "string") {
    const t = txt(bruto);
    if (t) return { valor: t, unidade: txt(i.unidade) };
  }
  if (i.vazao_ml_h != null) return { valor: num(i.vazao_ml_h, 2), unidade: "mL/h" };
  if (i.vazao_mcg_h != null) return { valor: num(i.vazao_mcg_h, 2), unidade: "µg/h" };
  if (i.vazao_mg_h != null) return { valor: num(i.vazao_mg_h, 2), unidade: "mg/h" };
  return null;
}

/** "20 mg / 100 mL" — so se a diluicao foi gravada. Nunca deduzida da dose. */
function diluicaoDe(i: Infusao): string | null {
  const massa =
    i.diluicao_mg != null ? `${num(i.diluicao_mg, 2)} mg` : i.diluicao_UI != null ? `${num(i.diluicao_UI, 2)} UI` : null;
  const volume = i.diluicao_ml != null ? `${num(i.diluicao_ml, 0)} mL` : null;
  if (massa && volume) return `${massa} / ${volume}`;
  return massa ?? volume;
}

const FMT_INICIO = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** started_at -> "30/07 04:12" (fuso do plantao). Formato ilegivel => null. */
function inicioDe(i: Infusao): string | null {
  const t = txt(i.started_at);
  if (!t) return null;
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : FMT_INICIO.format(d);
}

// ---------------------------------------------------------------------------
// 4. Pecas
// ---------------------------------------------------------------------------

/** Cartao de UMA infusao continua (dva ou sedativo). */
function CartaoInfusao({ infusao, tom }: { infusao: Infusao; tom: "dva" | "sed" }): ReactElement {
  const droga = txt(infusao.droga) ?? TRAVESSAO;
  const dose = doseDe(infusao);
  const diluicao = diluicaoDe(infusao);
  const inicio = inicioDe(infusao);
  const fundo = tom === "dva" ? "var(--badge-dva-bg)" : "var(--badge-sed-bg)";
  const cor = tom === "dva" ? "var(--badge-dva-text)" : "var(--badge-sed-text)";

  return (
    <li className="rx-inf" style={{ background: fundo, borderColor: `color-mix(in srgb, ${cor} 30%, transparent)` }}>
      <span className="rx-inf__droga" style={{ color: cor }} title={droga}>
        {droga}
      </span>
      <span
        className="rx-inf__dose tabnum"
        title={dose ? "Dose registrada na evolução" : "Dose não registrada nesta evolução"}
      >
        {dose ? (
          <>
            {dose.valor}
            {dose.unidade ? <span className="rx-inf__un"> {dose.unidade}</span> : null}
          </>
        ) : (
          TRAVESSAO
        )}
      </span>
      {diluicao || inicio ? (
        <span className="rx-inf__extra tabnum">
          {diluicao ? <span title="Diluição registrada">{diluicao}</span> : null}
          {diluicao && inicio ? " · " : ""}
          {inicio ? <span title="Início da infusão (started_at)">início {inicio}</span> : null}
        </span>
      ) : null}
    </li>
  );
}

/** Secao de UMA categoria da prescricao. So e chamada quando ha itens. */
function SecaoCategoria({ categoria, itens }: { categoria: CategoriaRx; itens: string[] }): ReactElement {
  return (
    <section className="rx-cat" style={{ borderLeftColor: categoria.barra }} title={categoria.nota}>
      <h4 className="rx-cat__titulo" style={{ color: categoria.cor }}>
        {categoria.titulo}
        <span className="rx-cat__n tabnum" aria-label={`${itens.length} itens`}>
          {itens.length}
        </span>
      </h4>
      <ol className="rx-cat__lista">
        {itens.map((item: string, i: number) => (
          <li key={`${i}-${item}`} className="rx-item">
            <span className="rx-item__n tabnum" aria-hidden="true">
              {i + 1}
            </span>
            <span className="rx-item__txt">{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 5. Componente
// ---------------------------------------------------------------------------
export interface KardexTableProps {
  /** evolucoes.prescricao (jsonb). null/{} = nada registrado. */
  prescricao: Prescricao | null | undefined;
  /** evolucoes.dvas (jsonb array de Infusao). */
  dvas: Infusao[] | null | undefined;
  /** evolucoes.sedativos (jsonb array de Infusao). */
  sedativos: Infusao[] | null | undefined;
}

export function KardexTable({ prescricao, dvas, sedativos }: KardexTableProps): ReactElement {
  const secoes = CATEGORIAS_RX.map((c: CategoriaRx) => ({ categoria: c, itens: itensDe(prescricao, c.chave) })).filter(
    (s: { itens: string[] }) => s.itens.length > 0,
  );
  const listaDvas = infusoesDe(dvas);
  const listaSeds = infusoesDe(sedativos);
  const totalItens = secoes.reduce((soma: number, s: { itens: string[] }) => soma + s.itens.length, 0);

  const temInfusao = listaDvas.length > 0 || listaSeds.length > 0;
  const temAlgo = secoes.length > 0 || temInfusao;

  // -------------------------------------------------------------------------
  // Estado vazio — o app NUNCA preenche prescricao.
  // -------------------------------------------------------------------------
  if (!temAlgo) {
    return (
      <section className="rx-vazio" aria-live="polite">
        <strong className="rx-vazio__titulo">Prescrição não registrada nesta evolução</strong>
        <span className="rx-vazio__txt">
          Nenhum item em <code className="tabnum">evolucoes.prescricao</code> e nenhuma infusão contínua em{" "}
          <code className="tabnum">dvas</code> / <code className="tabnum">sedativos</code>. Vazio aqui significa{" "}
          <strong>ausência de registro</strong> — não significa paciente sem prescrição.
        </span>
      </section>
    );
  }

  return (
    <div className="rx">
      {/* ---- 1. o que corre agora: infusoes continuas ---- */}
      {temInfusao ? (
        <section className="rx-bloco">
          <h3 className="rx-bloco__titulo">
            Infusões contínuas
            <span className="rx-bloco__fonte tabnum">evolucoes.dvas · evolucoes.sedativos</span>
          </h3>

          {listaDvas.length > 0 ? (
            <>
              <h4 className="rx-sub" style={{ color: "var(--badge-dva-text)" }}>
                Drogas vasoativas
              </h4>
              <ul className="rx-inf__lista">
                {listaDvas.map((i: Infusao, k: number) => (
                  <CartaoInfusao key={`dva-${k}-${i.droga}`} infusao={i} tom="dva" />
                ))}
              </ul>
            </>
          ) : null}

          {listaSeds.length > 0 ? (
            <>
              <h4 className="rx-sub" style={{ color: "var(--badge-sed-text)" }}>
                Sedação e analgesia
              </h4>
              <ul className="rx-inf__lista">
                {listaSeds.map((i: Infusao, k: number) => (
                  <CartaoInfusao key={`sed-${k}-${i.droga}`} infusao={i} tom="sed" />
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}

      {/* ---- 2. kardex por categoria ---- */}
      {secoes.length > 0 ? (
        <section className="rx-bloco">
          <h3 className="rx-bloco__titulo">
            Kardex por categoria
            <span className="rx-bloco__fonte tabnum">
              {totalItens} {totalItens === 1 ? "item" : "itens"} · evolucoes.prescricao
            </span>
          </h3>
          <div className="rx-grade">
            {secoes.map((s: { categoria: CategoriaRx; itens: string[] }) => (
              <SecaoCategoria key={s.categoria.chave} categoria={s.categoria} itens={s.itens} />
            ))}
          </div>
        </section>
      ) : (
        <p className="rx-nota">
          Infusões contínuas registradas, mas nenhuma categoria de{" "}
          <code className="tabnum">evolucoes.prescricao</code> preenchida nesta evolução.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CSS do kardex (classes .rx-*). Injetado UMA vez pela pagina da aba.
// So tokens do design system — zero hex.
// ---------------------------------------------------------------------------
export const CSS_KARDEX = `
.rx{display:flex;flex-direction:column;gap:16px;min-width:0}

.rx-bloco{display:flex;flex-direction:column;gap:8px;min-width:0}
.rx-bloco__titulo{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;margin:0;
  font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;color:var(--text-muted)}
.rx-bloco__fonte{margin-left:auto;font-size:var(--text-2xs,10px);font-weight:400;
  letter-spacing:0;text-transform:none;color:var(--text-faint)}
.rx-sub{margin:4px 0 0;font-size:var(--text-2xs,10px);font-weight:700;
  letter-spacing:var(--tracking-eyebrow,.08em);text-transform:uppercase}

/* ---------- infusoes continuas ---------- */
.rx-inf__lista{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px;
  list-style:none;margin:0;padding:0}
.rx-inf{display:flex;flex-direction:column;gap:2px;min-height:44px;padding:8px 12px;
  border:1px solid var(--border-default);border-radius:var(--radius-lg,12px);min-width:0}
.rx-inf__droga{font-size:var(--text-sm,13px);font-weight:700;line-height:var(--leading-tight,1.15);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rx-inf__dose{font-size:var(--text-md,17px);font-weight:700;color:var(--text-heading);
  line-height:var(--leading-tight,1.15)}
.rx-inf__un{font-size:var(--text-xs,11px);font-weight:600;color:var(--text-muted)}
.rx-inf__extra{font-size:var(--text-2xs,10px);color:var(--text-muted)}

/* ---------- kardex por categoria ---------- */
.rx-grade{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}
.rx-cat{display:flex;flex-direction:column;gap:6px;padding:10px 12px;min-width:0;
  background:var(--surface-card);border:1px solid var(--border-default);
  border-left:4px solid var(--border-strong);border-radius:var(--radius-lg,12px);
  box-shadow:var(--shadow-card)}
.rx-cat__titulo{display:flex;align-items:baseline;gap:6px;margin:0;
  font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase}
.rx-cat__n{margin-left:auto;padding:1px 6px;border-radius:var(--radius-pill,9999px);
  background:var(--surface-sunken);color:var(--text-muted);font-size:var(--text-2xs,10px);font-weight:700}
.rx-cat__lista{display:flex;flex-direction:column;gap:4px;list-style:none;margin:0;padding:0}
.rx-item{display:flex;gap:8px;align-items:baseline;font-size:var(--text-sm,13px);
  line-height:var(--leading-snug,1.35);color:var(--text-body)}
.rx-item__n{flex:0 0 auto;min-width:14px;text-align:right;font-size:var(--text-2xs,10px);color:var(--text-faint)}
.rx-item__txt{min-width:0;white-space:pre-wrap;overflow-wrap:anywhere}

/* ---------- notas e vazio ---------- */
.rx-nota{margin:0;font-size:var(--text-xs,11px);line-height:var(--leading-snug,1.35);color:var(--text-muted)}
.rx-vazio{display:flex;flex-direction:column;gap:6px;padding:24px 16px;text-align:center;
  background:var(--surface-card);border:1px dashed var(--border-strong);border-radius:var(--radius-lg,12px)}
.rx-vazio__titulo{font-size:var(--text-md,17px);color:var(--text-heading)}
.rx-vazio__txt{max-width:62ch;margin:0 auto;font-size:var(--text-sm,13px);
  line-height:var(--leading-snug,1.35);color:var(--text-muted)}
`;

export default KardexTable;
