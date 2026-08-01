"use client";
import type {ReactElement} from "react";
// ============================================================================
// SASI v2 — NotaPreview (nota de evolucao em texto corrido, pronta para colar)
// ----------------------------------------------------------------------------
// Monta a nota do plantao a partir do que JA foi lido do banco pela pagina e
// oferece o botao "copiar". E o UNICO pedaco client desta aba (precisa da area
// de transferencia do navegador); tudo o mais continua Server Component.
//
// ORDEM DO TEMPLATE (Ramo C — `_SASI_TEMPLATE_BASE_v2.md`):
//   cabecalho -> HD / problemas -> exame por sistemas -> impressao -> conduta
//
// DOUTRINA APLICADA
//  1. A nota REPRODUZ o que esta gravado. Nao resume, nao deduz, nao completa.
//     Cabecalho sem dado sai com travessao; sistema sem dado sai "nao avaliado".
//  2. IMPRESSAO E CONDUTA saem numeradas pelo MESMO pareamento da tela
//     (parear(), importado de ProblemaConduta — uma implementacao so da regra
//     1:1). Item orfao vira "[SEM PAR — REVISAR]" DENTRO do texto copiado: o
//     erro tem de viajar junto com a nota, nao ficar so na tela.
//  3. O texto copiado nao leva assinatura do app nem carimbo de "gerado por" —
//     prontuario nao e lugar de metadado de ferramenta. O aviso de conferencia
//     fica na interface.
//  4. Datas chegam JA formatadas do servidor (props). Formatar no cliente daria
//     divergencia de fuso entre a marcacao do servidor e a do navegador.
//  5. Alvo de toque >= 44px, foco visivel, sem animacao infinita.
// ============================================================================
import {useCallback, useEffect, useRef, useState} from "react";
import {parear, type ParImpressaoConduta} from "./ProblemaConduta";

const TRAVESSAO = "—";
/** Marca do item orfao. Vai no texto copiado de proposito. */
const SEM_PAR = "[SEM PAR — REVISAR]";

// ---------------------------------------------------------------------------
// Contrato de entrada (tudo ja resolvido no servidor — props serializaveis)
// ---------------------------------------------------------------------------
export interface NotaCabecalho {
  uti: string;
  leito: string | null;
  nome: string | null;
  idade: number | null;
  /** Ja formatada em dd/mm/aaaa pelo servidor. */
  dataEvolucao: string | null;
  /** Ja rotulado em pt-BR ("tarde", "plantão 24 h"). */
  plantao: string | null;
  diasInternacao: number | null;
  sofaTotal: number | null;
}

/** Um sistema ja resumido em texto corrido (textoSistema(), no servidor). */
export interface NotaSistema {
  rotulo: string;
  texto: string;
}

export interface NotaFonte {
  cabecalho: NotaCabecalho;
  /** pacientes.hd (hipoteses diagnosticas). */
  hd: string | null;
  /** Textos de evolucoes.problemas_ativos (pode vir vazio). */
  problemas: readonly string[];
  sistemas: readonly NotaSistema[];
  impressao: readonly string[];
  conduta: readonly string[];
}

// ---------------------------------------------------------------------------
// Montagem do texto (pura — testavel e reusavel fora do componente)
// ---------------------------------------------------------------------------

/** "UTI2-L01" ja traz a UTI; senao "UTI2 · L01". O dado nunca e reescrito. */
function rotuloLeito(uti: string, leito: string | null): string {
  const l = leito?.trim();
  if (!l) return uti;
  return l.toUpperCase().startsWith(uti.toUpperCase()) ? l : `${uti} · ${l}`;
}

export function montarNota(f: NotaFonte): string {
  const c = f.cabecalho;
  const linhas: string[] = [];

  // ---- cabecalho ----------------------------------------------------------
  const topo = [`EVOLUÇÃO — ${rotuloLeito(c.uti, c.leito)}`, c.dataEvolucao ?? TRAVESSAO];
  if (c.plantao) topo.push(`plantão ${c.plantao}`);
  linhas.push(topo.join(" · "));

  const ident: string[] = [c.nome?.trim() ? c.nome.trim() : TRAVESSAO];
  ident.push(c.idade == null ? `idade ${TRAVESSAO}` : `${c.idade} anos`);
  // "12 d de UTI" (dias corridos desde a admissao). Nao usamos "D12": a
  // convencao D1 = dia da admissao nao esta gravada no banco, e inventa-la
  // mudaria o significado do numero.
  if (c.diasInternacao != null) ident.push(`${c.diasInternacao} d de UTI`);
  ident.push(`SOFA ${c.sofaTotal == null ? TRAVESSAO : String(c.sofaTotal)}`);
  linhas.push(ident.join(" · "));

  // ---- HD / problemas -----------------------------------------------------
  linhas.push("", "PROBLEMAS", `HD: ${f.hd?.trim() ? f.hd.trim() : TRAVESSAO}`);
  f.problemas.forEach((p: string, i: number) => {
    const t = p.trim();
    if (t) linhas.push(`${i + 1}. ${t}`);
  });

  // ---- exame fisico por sistemas -----------------------------------------
  linhas.push("", "EXAME FÍSICO");
  if (f.sistemas.length === 0) linhas.push(TRAVESSAO);
  for (const s of f.sistemas) linhas.push(`${s.rotulo}: ${s.texto}.`);

  // ---- impressao <-> conduta (mesmo pareamento da tela) -------------------
  const pares: ParImpressaoConduta[] = parear(f.impressao, f.conduta);

  linhas.push("", "IMPRESSÃO");
  if (pares.length === 0) linhas.push(TRAVESSAO);
  for (const p of pares) linhas.push(`${p.n}. ${p.impressao ?? SEM_PAR}`);

  linhas.push("", "CONDUTA");
  if (pares.length === 0) linhas.push(TRAVESSAO);
  for (const p of pares) linhas.push(`${p.n}. ${p.conduta ?? SEM_PAR}`);

  return linhas.join("\n");
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export interface NotaPreviewProps {
  fonte: NotaFonte;
}

type EstadoCopia = "parado" | "copiado" | "selecionado";

export function NotaPreview({fonte}: NotaPreviewProps): ReactElement {
  const nota = montarNota(fonte);
  const [estado, setEstado] = useState<EstadoCopia>("parado");
  const refNota = useRef<HTMLPreElement | null>(null);

  // O aviso de "copiado" some sozinho — sem animacao, so troca de texto.
  useEffect(() => {
    if (estado === "parado") return;
    const t = window.setTimeout(() => setEstado("parado"), 4000);
    return () => window.clearTimeout(t);
  }, [estado]);

  const copiar = useCallback(async (): Promise<void> => {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) throw new Error("sem área de transferência");
      await navigator.clipboard.writeText(nota);
      setEstado("copiado");
    } catch {
      // Fallback honesto: seleciona a nota inteira para o medico copiar pelo
      // teclado. Nunca dizemos "copiado" sem ter copiado.
      const el = refNota.current;
      if (el && typeof window !== "undefined") {
        const selecao = window.getSelection();
        const faixa = document.createRange();
        faixa.selectNodeContents(el);
        selecao?.removeAllRanges();
        selecao?.addRange(faixa);
      }
      setEstado("selecionado");
    }
  }, [nota]);

  const orfaos = parear(fonte.impressao, fonte.conduta).filter((p: ParImpressaoConduta) => p.faltando !== null).length;

  return (
    <section className="np" aria-labelledby="np-titulo">
      <div className="np__cab">
        <div className="np__ident">
          <h2 className="np__ttl" id="np-titulo">
            Nota para o prontuário
          </h2>
          <p className="np__sub">
            Texto corrido montado a partir desta evolução, na ordem do template: cabeçalho,
            problemas, exame por
            sistemas, impressão e conduta. <strong>Confira antes de colar</strong> — a nota reproduz
            o que está gravado,
            e o que falta aparece como {TRAVESSAO} ou {" "}
            <span className="np__marca">{SEM_PAR}</span>.
          </p>
        </div>

        <div className="np__acoes">
          <button type="button" className="np__btn" onClick={copiar}
                  title="Copiar a nota inteira para a área de transferência">
            Copiar nota
          </button>
          <span className="np__aviso" role="status" aria-live="polite">
            {estado === "copiado"
              ? "copiado"
              : estado === "selecionado"
                ? "nota selecionada — copie com Ctrl+C"
                : `${nota.length} caracteres`}
          </span>
        </div>
      </div>

      {orfaos > 0 ? (
        <p className="np__alerta">
          A nota abaixo sai com <strong>{orfaos}</strong> marca{orfaos > 1 ? "s" : ""} de{" "}
          <span className="np__marca">{SEM_PAR}</span>. A marca é intencional: o par impressão ⇄
          conduta está quebrado
          nesta evolução e o erro precisa viajar junto com o texto, não ficar só na tela.
        </p>
      ) : null}

      <pre className="np__nota tabnum" ref={refNota} tabIndex={0}
           aria-label="Nota de evolução em texto corrido">
        {nota}
      </pre>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CSS do bloco. Injetado UMA vez pela pagina da aba (padrao VitalsTable).
// So tokens do design system — zero hex.
// ---------------------------------------------------------------------------
export const CSS_NOTA_PREVIEW = `
.np{display:flex;flex-direction:column;gap:10px;min-width:0}

.np__cab{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:10px}
.np__ident{flex:1 1 320px;min-width:0}
.np__ttl{margin:0;font-size:var(--text-lg,20px);font-weight:700;color:var(--text-heading)}
.np__sub{margin:4px 0 0;max-width:80ch;font-size:var(--text-xs,11px);
  line-height:var(--leading-snug,1.35);color:var(--text-muted)}
.np__sub strong{color:var(--text-heading)}
.np__marca{font-family:var(--font-mono,monospace);font-weight:700;color:var(--danger)}

.np__acoes{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.np__btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 16px;
  border:1px solid var(--accent);border-radius:var(--radius-md,8px);
  background:var(--accent);color:var(--text-on-accent);cursor:pointer;
  font-family:inherit;font-size:var(--text-sm,13px);font-weight:700;
  letter-spacing:var(--tracking-wide,.04em);
  transition:background var(--dur-fast,120ms) var(--ease-out,ease)}
.np__btn:hover{background:var(--accent-hover);border-color:var(--accent-hover)}
.np__btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.np__aviso{min-width:88px;font-size:var(--text-xs,11px);font-weight:600;color:var(--text-muted)}

.np__alerta{margin:0;padding:10px 12px;
  background:color-mix(in srgb, var(--danger) 8%, var(--surface-card));
  border:1px solid color-mix(in srgb, var(--danger) 34%, transparent);
  border-left:4px solid var(--danger);border-radius:var(--radius-lg,12px);
  font-size:var(--text-sm,13px);line-height:var(--leading-snug,1.35);color:var(--text-body)}

.np__nota{margin:0;padding:14px;max-height:60vh;overflow:auto;overscroll-behavior:contain;
  background:var(--surface-sunken);border:1px solid var(--border-default);
  border-radius:var(--radius-xl,16px);
  white-space:pre-wrap;overflow-wrap:anywhere;user-select:text;
  font-size:var(--text-sm,13px);line-height:var(--leading-normal,1.55);color:var(--text-body)}
.np__nota:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

@media (prefers-reduced-motion:reduce){.np__btn{transition:none}}
`;

export default NotaPreview;
