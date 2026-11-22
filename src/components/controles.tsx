"use client";
// Controles de folha do design (caixa de número, texto, escolha única, rótulo e unidade), usados na ficha e na admissão.
import { useEffect, useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { txt } from "@/lib/termos";

export const tecla = (fn: () => void) => (e: KeyboardEvent) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); fn(); } };

/** Escolha única em botões emendados. Tocar de novo no marcado desmarca. */
export function Seg({ r, ops, v, on, numero, cls }: { r: string; ops: readonly string[]; v: unknown; on: (v: string | null) => void; numero?: boolean; cls?: string }) {
  return (
    <span className={"ds-seg" + (numero ? " ds-seg--num" : "") + (cls ? " " + cls : "")} role="radiogroup" aria-label={r}>
      {ops.map((o) => <span key={o} role="radio" aria-checked={v === o} tabIndex={0} className={v === o ? "ds-seg--on" : undefined} onClick={() => on(v === o ? null : o)} onKeyDown={tecla(() => on(v === o ? null : o))}>{o}</span>)}
    </span>
  );
}

export function Num({ r, v, on, larg }: { r: string; v: unknown; on: (v: string) => void; larg?: number }) {
  const t = txt(v);
  return <label className="ds-f" style={{ "--larg": `${Math.max(larg ?? 58, Math.round(t.length * 9.8) + 18)}px` } as CSSProperties}><input aria-label={r} inputMode="decimal" value={t} onChange={(e) => on(e.target.value)} /></label>;
}

export function Txt({ r, v, on, larg, onFoco, onSai }: { r: string; v: unknown; on: (v: string) => void; larg?: number; onFoco?: () => void; onSai?: () => void }) {
  return <label className="ds-f ds-f--t" style={larg ? { flex: `0 1 ${larg}px` } : undefined}><input aria-label={r} value={txt(v)} onChange={(e) => on(e.target.value)} onFocus={onFoco} onBlur={onSai} /></label>;
}

export const M = ({ children }: { children: ReactNode }) => <span className="ds-ev__m">{children}</span>;

export const U = ({ children, fixa }: { children: ReactNode; fixa?: boolean }) => <span className={"ds-ev__u" + (fixa ? " ds-ev__u--fixa" : "")}>{children}</span>;

export const G = ({ children, cls }: { children: ReactNode; cls?: string }) => <span className={"ds-ev__g" + (cls ? " " + cls : "")}>{children}</span>;

export const Linha = ({ r, o, children }: { r: string; o?: boolean; children: ReactNode }) => (
  <div className={"ds-ev__l" + (o ? " ds-de-ontem" : "")}><span className="ds-ev__r">{r}</span><div className="ds-ev__v">{children}{o ? <span className="ds-ev__ontem">ontem</span> : null}</div></div>
);

/** Caixa de texto que cresce: o texto longo quebra a linha, nada fica escondido. */
export function Area({ r, v, on }: { r: string; v: unknown; on: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const t = txt(v);
  useEffect(() => { const e = ref.current; if (e) { e.style.height = "auto"; e.style.height = `${e.scrollHeight}px`; } }, [t]);
  return <label className="ds-f ds-f--t"><textarea ref={ref} rows={1} aria-label={r} value={t} onChange={(e) => on(e.target.value)} /></label>;
}
