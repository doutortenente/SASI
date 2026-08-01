"use client";
// ============================================================================
// SASI v2 — CopyButton (+ PrintButton) · acoes da passagem de turno
// ----------------------------------------------------------------------------
// Client Component por UM motivo so: mexer na area de transferencia e na
// impressao do navegador (navigator.clipboard / window.print). Nenhuma regra
// clinica e nenhuma leitura de banco moram aqui.
//
// O TEXTO CHEGA PRONTO DO SERVIDOR (prop `texto`). O botao NAO le o DOM nem
// remonta a passagem: o que o medico ve na tela, o que sai na impressao e o que
// vai para o WhatsApp/prontuario saem da MESMA string, montada uma unica vez em
// HandoffCard.textoDaPassagem().
//
// DOUTRINA
//  - Falha nunca e silenciosa: se a copia nao acontecer, a tela DIZ que falhou e
//    aponta a saida (selecionar o texto cru da pagina). Nada de "copiado!" falso.
//  - Contexto inseguro (http em IP da rede do hospital) nao tem Clipboard API:
//    ha um caminho legado (textarea + execCommand) antes de desistir.
//  - Alvo >= 44 px, foco visivel, feedback anunciado por aria-live.
//  - Cor so por token do design system; nenhum hex aqui.
// ============================================================================
import {type ReactElement, useCallback, useEffect, useRef, useState} from "react";

/** Estado da ultima tentativa de copia. */
export type EstadoCopia = "pronto" | "copiado" | "falhou";

export interface CopyButtonProps {
  /** Texto PURO a copiar (ja formatado no servidor). Vazio => botao desabilitado. */
  texto: string;
  /** Rotulo do botao. Padrao: "Copiar passagem". */
  rotulo?: string;
  /** Rotulo enquanto o aviso de sucesso esta na tela. Padrao: "Copiado". */
  rotuloCopiado?: string;
  /** Dica (title/aria) — ex.: "texto puro, pronto para colar no prontuario". */
  titulo?: string;
}

/** Quanto tempo o aviso de sucesso/erro fica na tela. */
const MS_AVISO = 2600;

// ---------------------------------------------------------------------------
// Caminho legado: usado quando navigator.clipboard nao existe (http simples) ou
// quando a Clipboard API recusa (permissao negada, foco perdido).
// ---------------------------------------------------------------------------
function copiaLegado(texto: string): boolean {
  if (typeof document === "undefined") return false;
  const area = document.createElement("textarea");
  area.value = texto;
  area.setAttribute("readonly", "");
  // fora da vista, mas ainda selecionavel (display:none nao seleciona)
  area.style.position = "fixed";
  area.style.top = "0";
  area.style.left = "0";
  area.style.width = "1px";
  area.style.height = "1px";
  area.style.opacity = "0";
  document.body.appendChild(area);

  const selecao = document.getSelection();
  const anterior = selecao && selecao.rangeCount > 0 ? selecao.getRangeAt(0) : null;

  area.select();
  area.setSelectionRange(0, area.value.length);

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }

  document.body.removeChild(area);
  if (selecao && anterior) {
    selecao.removeAllRanges();
    selecao.addRange(anterior);
  }
  return ok;
}

// ---------------------------------------------------------------------------
// Botao de copia
// ---------------------------------------------------------------------------
export function CopyButton({
                             texto,
                             rotulo = "Copiar passagem",
                             rotuloCopiado = "Copiado",
                             titulo = "Copia a passagem inteira como texto puro (sem formatação), pronta para colar no prontuário ou no WhatsApp",
                           }: CopyButtonProps): ReactElement {
  const [estado, setEstado] = useState<EstadoCopia>("pronto");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // limpa o timer se o componente sair da tela antes do aviso expirar
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const avisar = useCallback((novo: EstadoCopia): void => {
    setEstado(novo);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setEstado("pronto"), MS_AVISO);
  }, []);

  const copiar = useCallback(async (): Promise<void> => {
    if (!texto) return;
    // 1. caminho moderno (https ou localhost)
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(texto);
        avisar("copiado");
        return;
      } catch {
        /* cai no caminho legado abaixo */
      }
    }
    // 2. caminho legado (http em rede interna)
    avisar(copiaLegado(texto) ? "copiado" : "falhou");
  }, [texto, avisar]);

  const vazio = texto.length === 0;

  return (
    <span className="exp-acao">
      <button
        type="button"
        className={`sasi-btn exp-btn${estado === "copiado" ? " exp-btn--ok" : ""}${estado === "falhou" ? " exp-btn--erro" : ""}`}
        onClick={() => void copiar()}
        disabled={vazio}
        title={vazio ? "Nada para copiar: nenhum leito ativo na passagem" : titulo}
        aria-label={vazio ? "Nada para copiar" : titulo}
      >
        <span aria-hidden="true" className="exp-btn__glifo">
          {estado === "copiado" ? "✓" : estado === "falhou" ? "!" : "⧉"}
        </span>
        {estado === "copiado" ? rotuloCopiado : rotulo}
      </button>

      {/* Anuncio para leitor de tela + confirmacao visual. Nunca mente: so diz
          "copiado" quando a API confirmou. */}
      <span className="exp-aviso" role="status" aria-live="polite">
        {estado === "copiado" ? "Passagem copiada como texto puro." : null}
        {estado === "falhou"
          ? "Não foi possível copiar automaticamente. Abra “texto que será copiado” abaixo, selecione tudo e copie."
          : null}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Botao de impressao — irmao do CopyButton (mesma barra de acoes, mesmo motivo
// de ser client: chama uma API do navegador). Fica neste arquivo para nao criar
// um segundo modulo de 10 linhas com a mesma responsabilidade.
// ---------------------------------------------------------------------------
export function PrintButton({rotulo = "Imprimir"}: { rotulo?: string }): ReactElement {
  return (
    <button
      type="button"
      className="sasi-btn exp-btn"
      onClick={() => {
        if (typeof window !== "undefined") window.print();
      }}
      title="Abre a impressão do navegador — a página já sai em preto no branco, sem menu lateral"
    >
      <span aria-hidden="true" className="exp-btn__glifo">
        ⎙
      </span>
      {rotulo}
    </button>
  );
}

// ---------------------------------------------------------------------------
// CSS das acoes. Injetado UMA vez pela pagina (mesmo padrao de CSS_BED_CARD).
// So tokens do design system.
// ---------------------------------------------------------------------------
export const CSS_EXPORT_ACOES = `
.exp-acao{display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap}
.exp-btn{font-size:var(--text-xs,11px);letter-spacing:var(--tracking-wide,.04em);text-transform:none}
.exp-btn__glifo{font-family:var(--font-mono,monospace);font-size:var(--text-sm,13px);line-height:1}
.exp-btn:disabled{opacity:.5;cursor:not-allowed}
.exp-btn--ok{border-color:var(--success);color:var(--success);
  background:color-mix(in srgb, var(--success) 12%, transparent)}
.exp-btn--erro{border-color:var(--danger);color:var(--danger);
  background:color-mix(in srgb, var(--danger) 12%, transparent)}
.exp-aviso{font-size:var(--text-xs,11px);color:var(--text-muted);max-width:42ch}
.exp-btn--erro + .exp-aviso,.exp-aviso:empty{color:var(--text-muted)}
@media print{.exp-acao,.exp-btn{display:none !important}}
`;

export default CopyButton;
