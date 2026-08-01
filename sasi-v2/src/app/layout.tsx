// ============================================================================
// SASI v2 — Layout raiz (chassi)
// html/body + Sidebar (trilho navy) + TopBar (titulo, filtro UTI, tema) + main.
// Tudo em tokens do design system: nenhum hex hardcoded aqui.
// ============================================================================
import "@/styles/globals.css";
import type {Metadata, Viewport} from "next";
import type {ReactNode} from "react";
import {Sidebar} from "@/components/shared/Sidebar";
import {TopBar} from "@/components/shared/TopBar";
import {CHAVE_TEMA} from "@/stores/uiStore";

export const metadata: Metadata = {
  title: "SASI v2 — Comando UTI",
  description: "Sistema de Auditoria e Síntese Intensiva",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // habilita env(safe-area-inset-*) na barra inferior
};

// Aplica o tema ANTES da primeira pintura (evita piscar claro->escuro).
// Mesmo default do uiStore: sem valor salvo => tema clinical (claro).
const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem(${JSON.stringify(CHAVE_TEMA)});document.documentElement.dataset.theme=t==="tactical"?"tactical":"";}catch(e){}})();`;

export default function RootLayout({children}: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
    <body>
    <script dangerouslySetInnerHTML={{__html: SCRIPT_TEMA}}/>
    <style dangerouslySetInnerHTML={{__html: CSS_CHASSI}}/>

    <a className="sasi-skip" href="#conteudo">
      Ir para o conteúdo
    </a>

    <div className="sasi-shell">
      <Sidebar/>
      <div className="sasi-shell__col">
        <TopBar/>
        <main id="conteudo" className="sasi-content">
          {children}
        </main>
      </div>
    </div>
    </body>
    </html>
  );
}

// ---------------------------------------------------------------------------
// CSS do chassi. Fica aqui (e nao em globals.css) porque e estrutural do layout
// e precisa de media queries que estilo inline nao suporta. So tokens.
// ---------------------------------------------------------------------------
const CSS_CHASSI = `
/* ---------- shell ---------- */
.sasi-shell{min-height:100vh;min-height:100dvh;background:var(--surface-app);color:var(--text-body)}
.sasi-shell__col{display:flex;flex-direction:column;min-height:100vh;min-height:100dvh;min-width:0}
.sasi-content{flex:1 1 auto;width:100%;max-width:var(--content-max,1440px);margin:0 auto;padding:var(--space-6,24px)}

.sasi-skip{position:fixed;top:-120px;left:8px;z-index:100;padding:12px 16px;border-radius:var(--radius-md,8px);
  background:var(--surface-card);color:var(--text-heading);border:1px solid var(--border-strong);
  font-size:var(--text-sm,13px);font-weight:600;text-decoration:none}
.sasi-skip:focus{top:8px;box-shadow:var(--shadow-pop)}

/* ---------- trilho de navegacao (chrome navy nos dois temas) ---------- */
.sasi-rail{position:fixed;z-index:40;display:flex;background:var(--chrome-bg);color:var(--chrome-text)}
.sasi-rail__brand{display:flex;align-items:center;gap:10px;padding:14px;border-bottom:1px solid var(--chrome-border)}
.sasi-rail__mark{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;flex:0 0 auto;
  border-radius:var(--radius-md,8px);border:1px solid var(--chrome-border);background:var(--chrome-active);
  color:var(--chrome-text);font-size:var(--text-xs,11px);font-weight:700;letter-spacing:.04em}
.sasi-rail__name{display:flex;flex-direction:column;gap:2px;min-width:0;line-height:1.1}
.sasi-rail__name b{font-size:var(--text-sm,13px);font-weight:700;letter-spacing:.1em;color:var(--chrome-text)}
.sasi-rail__name span{font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;color:var(--chrome-muted)}
.sasi-rail__list{display:flex;list-style:none;margin:0;padding:0}
.sasi-rail__foot{margin-top:auto;padding:12px 14px;border-top:1px solid var(--chrome-border);
  font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);color:var(--chrome-muted)}

/* ---------- item de navegacao ---------- */
.sasi-navlink{position:relative;display:flex;align-items:center;gap:10px;min-height:44px;padding:0 12px 0 14px;
  border-radius:var(--radius-md,8px);color:var(--chrome-muted);text-decoration:none;
  font-size:var(--text-sm,13px);font-weight:600;letter-spacing:.01em;
  transition:background var(--dur-fast,120ms) var(--ease-out,ease),color var(--dur-fast,120ms) var(--ease-out,ease)}
.sasi-navlink:hover{background:var(--chrome-active);color:var(--chrome-text)}
.sasi-navlink:focus-visible{outline:2px solid var(--chrome-active-bar);outline-offset:2px}
.sasi-navlink[aria-current="page"]{background:var(--chrome-active);color:var(--chrome-text)}
.sasi-navlink[aria-current="page"]::before{content:"";position:absolute;left:0;top:8px;bottom:8px;width:3px;
  border-radius:0 3px 3px 0;background:var(--chrome-active-bar)}
.sasi-navlink__ico{display:inline-flex;flex:0 0 auto;width:20px;height:20px}
.sasi-navlink__ico svg{display:block;width:20px;height:20px}
.sasi-navlink__txt{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* ---------- desktop: trilho lateral ---------- */
@media (min-width:900px){
  .sasi-shell__col{margin-left:var(--sidebar-width,232px)}
  .sasi-rail{top:0;left:0;bottom:0;width:var(--sidebar-width,232px);flex-direction:column;
    border-right:1px solid var(--chrome-border)}
  .sasi-rail__list{flex-direction:column;gap:2px;padding:10px 8px}
}

/* ---------- mobile: barra inferior ---------- */
@media (max-width:899.98px){
  .sasi-rail{left:0;right:0;bottom:0;flex-direction:column;border-top:1px solid var(--chrome-border);
    padding-bottom:env(safe-area-inset-bottom,0px)}
  .sasi-rail__brand,.sasi-rail__foot{display:none}
  .sasi-rail__list{flex-direction:row;width:100%;padding:4px}
  .sasi-rail__item{flex:1 1 0;min-width:0}
  .sasi-navlink{flex-direction:column;justify-content:center;gap:3px;min-height:56px;padding:6px 2px;
    text-align:center;font-size:var(--text-2xs,10px);letter-spacing:.02em}
  .sasi-navlink[aria-current="page"]::before{left:14px;right:14px;top:0;bottom:auto;width:auto;height:3px;
    border-radius:0 0 3px 3px}
  .sasi-content{padding:16px 12px calc(84px + env(safe-area-inset-bottom,0px))}
}

/* ---------- barra superior ---------- */
.sasi-topbar{position:sticky;top:0;z-index:30;display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;
  min-height:var(--header-height,60px);padding:6px 16px;background:var(--surface-card);
  border-bottom:1px solid var(--border-default)}
.sasi-topbar__ttl{display:flex;flex-direction:column;gap:1px;flex:1 1 180px;min-width:0}
.sasi-topbar__eyebrow{font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;color:var(--text-muted)}
.sasi-topbar__h1{margin:0;font-size:var(--text-lg,20px);font-weight:700;line-height:1.15;color:var(--text-heading);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sasi-topbar__acoes{display:flex;align-items:center;gap:8px;margin-left:auto;flex-wrap:wrap}

/* ---------- filtro de UTI (segmentado) ---------- */
.sasi-seg{display:flex;align-items:center;gap:2px;padding:2px;background:var(--surface-sunken);
  border:1px solid var(--border-default);border-radius:var(--radius-pill,9999px)}
.sasi-seg__b{min-height:44px;min-width:44px;padding:0 12px;border:0;border-radius:var(--radius-pill,9999px);
  background:transparent;color:var(--text-muted);font-family:var(--font-mono,monospace);
  font-size:var(--text-xs,11px);font-weight:600;letter-spacing:var(--tracking-wide,.04em);
  font-variant-numeric:tabular-nums;cursor:pointer;
  transition:background var(--dur-fast,120ms) var(--ease-out,ease),color var(--dur-fast,120ms) var(--ease-out,ease)}
.sasi-seg__b:hover{color:var(--text-heading)}
.sasi-seg__b:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.sasi-seg__b[aria-pressed="true"]{background:var(--surface-card);color:var(--text-heading);box-shadow:var(--shadow-card)}

/* ---------- botoes de chassi (tema, war room) ---------- */
.sasi-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;min-width:44px;
  padding:0 12px;border:1px solid var(--border-default);border-radius:var(--radius-md,8px);
  background:var(--surface-card);color:var(--text-body);font-family:inherit;font-size:var(--text-2xs,10px);
  font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);text-transform:uppercase;cursor:pointer;
  transition:background var(--dur-fast,120ms) var(--ease-out,ease),color var(--dur-fast,120ms) var(--ease-out,ease)}
.sasi-btn:hover{background:var(--surface-raised);color:var(--text-heading)}
.sasi-btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.sasi-btn[aria-pressed="true"]{background:var(--accent-soft);border-color:var(--accent);color:var(--accent-text)}
.sasi-btn__txt{display:none}
@media (min-width:1120px){.sasi-btn__txt{display:inline}}

/* ---------- icones que trocam com o tema ---------- */
.sasi-ico{display:block;flex:0 0 auto;width:18px;height:18px}
.sasi-ico--tactical{display:none}
:root[data-theme="tactical"] .sasi-ico--clinical{display:none}
:root[data-theme="tactical"] .sasi-ico--tactical{display:block}

@media (prefers-reduced-motion:reduce){
  .sasi-navlink,.sasi-seg__b,.sasi-btn{transition:none}
}
`;
