"use client";
// ============================================================================
// SASI v2 — tela de ERRO de leitura (error boundary do App Router)
// ----------------------------------------------------------------------------
// Aparece quando uma consulta ao banco FALHA (throw falhaBanco na camada de
// dados). Doutrina: leitura quebrada e ERRO e se apresenta como erro — nunca
// como prontuario vazio ("nenhum sinal vital", "sem alerta"), que seria uma
// afirmacao clinica falsa. Cor por token; sem hex.
// ============================================================================
import type { ReactElement } from "react";

export default function ErroLeitura({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): ReactElement {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 12,
        margin: "24px auto",
        maxWidth: 560,
        padding: "22px 24px",
        background: "var(--surface-card)",
        border: "1px solid var(--grav-critical-solid)",
        borderLeft: "6px solid var(--grav-critical-solid)",
        borderRadius: "var(--radius-xl, 16px)",
      }}
    >
      <strong style={{ fontSize: "var(--text-lg, 20px)", color: "var(--text-heading)" }}>
        Falha ao ler o banco de dados
      </strong>
      <p style={{ margin: 0, fontSize: "var(--text-sm, 13px)", lineHeight: 1.55, color: "var(--text-body)" }}>
        A consulta não completou — <b>isto NÃO significa que o paciente está sem dados</b>. Pode ser
        rede, o banco fora do ar ou uma regra de acesso alterada. Nada foi perdido: os dados continuam
        gravados.
      </p>
      {error?.digest ? (
        <p className="tabnum" style={{ margin: 0, fontSize: "var(--text-2xs, 10px)", color: "var(--text-faint)" }}>
          código do incidente: {error.digest}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        style={{
          minHeight: 44,
          padding: "0 18px",
          border: "1px solid var(--accent)",
          borderRadius: "var(--radius-md, 8px)",
          background: "var(--accent-soft)",
          color: "var(--accent-text)",
          fontFamily: "inherit",
          fontSize: "var(--text-sm, 13px)",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Tentar de novo
      </button>
    </div>
  );
}
