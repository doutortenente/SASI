"use client";
// Falha de leitura do banco aparece como falha, nunca como tela vazia.
export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <>
      <header className="ds-topo"><h1>Não consegui ler o banco</h1></header>
      <main className="ds-conteudo">
        <section className="ds-painel">
          <div className="ds-painel__corpo">
            <p style={{ color: "var(--texto)" }}>A tela não foi montada porque a leitura falhou. Nada do que aparecia antes foi apagado.</p>
            <p className="ds-painel__nota" style={{ margin: "6px 0 12px" }}>{error.message}{error.digest ? ` · código ${error.digest}` : ""}</p>
            <button className="ds-btn ds-btn--primario" type="button" onClick={reset}>Tentar de novo</button>
          </div>
        </section>
      </main>
    </>
  );
}
