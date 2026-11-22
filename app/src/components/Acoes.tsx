"use client";
import { useState } from "react";
import { Icone } from "./Icone";

/** Botões da Passagem: copiar o texto pronto e abrir a impressão (salvar em PDF). */
export function AcoesPassagem({ texto }: { texto: string }) {
  const [ok, setOk] = useState(false);
  return (
    <>
      <button className="ds-btn" type="button" onClick={async () => { await navigator.clipboard.writeText(texto); setOk(true); setTimeout(() => setOk(false), 2000); }}>
        <Icone n={ok ? "feito" : "copiar"} />{ok ? "Copiado" : "Copiar passagem"}
      </button>
      <button className="ds-btn" type="button" onClick={() => window.print()}><Icone n="pdf" />PDF</button>
    </>
  );
}
