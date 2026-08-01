"use client";
// ============================================================================
// SASI v2 — SplitPane (modo tela dividida do War Room)
// ----------------------------------------------------------------------------
// Um botao, um estado: "War Room" divide a tela em duas colunas — leitos a
// esquerda, painel de apoio (CalcPanel) a direita, grudado no topo enquanto a
// grade rola. Em tela estreita o painel vira um bloco de largura inteira e sobe
// para a frente (quem abriu a calculadora quer ver a calculadora).
//
// Nao le banco, nao calcula nada: e so chassi de layout.
// O painel fica MONTADO quando fechado (display:none) para nao perder o que o
// medico ja digitou ao alternar a visao.
// ============================================================================
import {
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

export interface SplitPaneProps {
  /** Coluna da esquerda — o conteudo principal da tela (a grade de leitos). */
  children: ReactNode;
  /** Coluna da direita. Ausente => o botao nao aparece (nada a dividir). */
  painel?: ReactNode;
  /** Titulo do painel da direita. */
  rotuloPainel?: string;
  /** Abre ja dividido (padrao: fechado). */
  inicialmenteAberto?: boolean;
}

export function SplitPane({
                            children,
                            painel,
                            rotuloPainel = "Painel de apoio",
                            inicialmenteAberto = false,
                          }: SplitPaneProps): ReactElement {
  const [aberto, setAberto] = useState<boolean>(inicialmenteAberto && !!painel);
  const refPainel = useRef<HTMLElement | null>(null);
  const refBotao = useRef<HTMLButtonElement | null>(null);

  // Ao abrir, o foco vai para o painel (leitor de tela anuncia o que abriu).
  useEffect(() => {
    if (aberto) refPainel.current?.focus();
  }, [aberto]);

  const fechar = useCallback(() => {
    setAberto(false);
    refBotao.current?.focus();
  }, []);

  const aoTeclar = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        fechar();
      }
    },
    [fechar],
  );

  return (
    <div className="sasi-split" data-aberto={aberto ? "true" : "false"}>
      <style dangerouslySetInnerHTML={{__html: CSS_SPLIT}}/>

      {painel ? (
        <div className="sasi-split__barra">
          <button
            ref={refBotao}
            type="button"
            className="sasi-split__btn"
            aria-pressed={aberto}
            aria-expanded={aberto}
            aria-controls="sasi-split-painel"
            title={aberto ? "Voltar para tela inteira" : `Divide a tela: leitos à esquerda, ${rotuloPainel.toLowerCase()} à direita`}
            onClick={() => setAberto((v: boolean) => !v)}
          >
            <svg
              className="sasi-split__ico"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4.5" width="18" height="15" rx="2"/>
              <path d="M13.5 4.5v15"/>
              <path d="M16 10h3M16 13.5h3"/>
            </svg>
            <span className="sasi-split__lbl">War Room</span>
            <span
              className="sasi-split__sub">{aberto ? "fechar tela dividida" : "tela dividida"}</span>
          </button>
        </div>
      ) : null}

      <div className="sasi-split__esq">{children}</div>

      {painel ? (
        <aside
          id="sasi-split-painel"
          ref={refPainel}
          className="sasi-split__dir"
          hidden={!aberto}
          tabIndex={-1}
          aria-label={rotuloPainel}
          onKeyDown={aoTeclar}
        >
          <div className="sasi-split__cab">
            <h2 className="sasi-split__ttl">{rotuloPainel}</h2>
            <button type="button" className="sasi-split__fechar" onClick={fechar}
                    aria-label="Fechar painel (Esc)" title="Fechar painel (Esc)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}
                   strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18"/>
              </svg>
            </button>
          </div>
          <div className="sasi-split__corpo">{painel}</div>
        </aside>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CSS do split (so tokens). Grid de 1 coluna; vira 2 colunas quando aberto em
// tela >= 1000px. Abaixo disso o painel ocupa a largura toda e vem primeiro.
// ---------------------------------------------------------------------------
const CSS_SPLIT = `
.sasi-split{display:grid;grid-template-columns:minmax(0,1fr);align-items:start;gap:14px;min-width:0}
.sasi-split__barra{grid-column:1/-1;display:flex;justify-content:flex-end}
.sasi-split__esq{min-width:0}

.sasi-split__btn{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 14px;
  border:1px solid var(--border-default);border-radius:var(--radius-md,8px);background:var(--surface-card);
  color:var(--text-body);font-family:inherit;font-size:var(--text-2xs,10px);font-weight:700;
  letter-spacing:var(--tracking-eyebrow,.08em);text-transform:uppercase;cursor:pointer;
  transition:background var(--dur-fast,120ms) var(--ease-out,ease),color var(--dur-fast,120ms) var(--ease-out,ease)}
.sasi-split__btn:hover{background:var(--surface-raised);color:var(--text-heading)}
.sasi-split__btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.sasi-split__btn[aria-pressed="true"]{background:var(--accent-soft);border-color:var(--accent);color:var(--accent-text)}
.sasi-split__ico{display:block;width:18px;height:18px;flex:0 0 auto}
.sasi-split__sub{font-weight:600;letter-spacing:var(--tracking-wide,.04em);text-transform:none;color:var(--text-faint)}

.sasi-split__dir{min-width:0;background:var(--surface-card);border:1px solid var(--border-default);
  border-radius:var(--radius-xl,16px);box-shadow:var(--shadow-card)}
.sasi-split__dir[hidden]{display:none}
.sasi-split__dir:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.sasi-split__cab{display:flex;align-items:center;justify-content:space-between;gap:8px;
  padding:10px 10px 10px 14px;border-bottom:1px solid var(--border-subtle)}
.sasi-split__ttl{margin:0;font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;color:var(--text-muted)}
.sasi-split__fechar{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;
  border:0;border-radius:var(--radius-md,8px);background:transparent;color:var(--text-muted);cursor:pointer}
.sasi-split__fechar svg{width:18px;height:18px}
.sasi-split__fechar:hover{background:var(--surface-sunken);color:var(--text-heading)}
.sasi-split__fechar:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.sasi-split__corpo{padding:12px}

@media (max-width:999.98px){
  .sasi-split[data-aberto="true"] .sasi-split__barra{order:-2}
  .sasi-split[data-aberto="true"] .sasi-split__dir{order:-1}
}
@media (min-width:1000px){
  .sasi-split[data-aberto="true"]{grid-template-columns:minmax(0,1fr) minmax(320px,400px)}
  .sasi-split[data-aberto="true"] .sasi-split__dir{position:sticky;top:calc(var(--header-height,60px) + 12px);
    max-height:calc(100dvh - var(--header-height,60px) - 40px);overflow:auto}
}
@media (prefers-reduced-motion:reduce){.sasi-split__btn{transition:none}}
`;

export default SplitPane;
