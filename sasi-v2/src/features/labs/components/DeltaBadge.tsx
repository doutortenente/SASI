// ============================================================================
// SASI v2 — DeltaBadge (seta de tendencia entre duas coletas)
// ----------------------------------------------------------------------------
// Micro-componente do Folhao de Laboratorio. Compara o valor de UM dia com o
// valor da coleta ANTERIOR do mesmo exame e imprime SO a direcao: ▲ subiu,
// ▼ desceu, = estavel.
//
// DOUTRINA APLICADA
//  - A seta e DIRECAO, nao juizo clinico. Por isso a cor e SEMPRE neutra
//    (--text-muted): "creatinina subiu" nao e vermelho, "Hb subiu" nao e verde.
//    Quem julga e o medico; a tela so mostra o movimento do numero.
//  - ZERO ALUCINACAO: falta um dos dois valores => NADA e desenhado (null).
//    Nunca assume "igual ao dia anterior" nem trata ausencia como zero.
//  - O title/aria-label diz de QUAL dia veio a comparacao e a que distancia
//    (labs nao sao coletados todo dia) — a seta nunca insinua um intervalo falso.
//  - Cor nunca e o unico sinal: o glifo (▲/▼/=) carrega o significado sozinho.
//
// Este arquivo e a FOLHA da aba de labs: TabelaoLabs importa dele. Por isso os
// utilitarios de formatacao numerica/data compartilhados moram aqui (nao ha
// import de volta, entao nao ha ciclo).
// ============================================================================
import type { ReactElement } from "react";
import { num } from "@/lib/formatters/br";

// ---------------------------------------------------------------------------
// Utilitarios compartilhados com o TabelaoLabs
// ---------------------------------------------------------------------------

/**
 * Casas decimais REAIS do valor gravado — nunca inventa nem corta precisao
 * clinica: pH 7.35 sai "7,35", plaquetas 150 sai "150", creatinina 1.8 sai "1,8".
 * Teto de 3 casas para nao imprimir ruido de ponto flutuante (0.30000000000004).
 */
export function casasDoValor(v: number): number {
  if (!Number.isFinite(v) || Number.isInteger(v)) return 0;
  const s = String(Math.abs(v));
  if (s.includes("e") || s.includes("E")) return 3;
  return Math.min((s.split(".")[1] ?? "").length, 3);
}

/** Numero de exame em pt-BR respeitando a precisao gravada. null => "—". */
export function fmtLab(v: number | null | undefined): string {
  return v == null ? "—" : num(v, casasDoValor(v));
}

/** "AAAA-MM-DD" -> "dd/MM" (corte de string: sem Date, sem risco de fuso). */
export function diaCurto(dia: string): string {
  const [, m, d] = (dia ?? "").split("-");
  return m && d ? `${d}/${m}` : dia ?? "—";
}

/** "AAAA-MM-DD" -> "dd/MM/aaaa". */
export function diaLongo(dia: string): string {
  const [a, m, d] = (dia ?? "").split("-");
  return a && m && d ? `${d}/${m}/${a}` : dia ?? "—";
}

/** Distancia em dias civis entre duas datas "AAAA-MM-DD" (ancorada ao meio-dia UTC). */
export function distanciaEmDias(de: string, ate: string): number | null {
  const t = (s: string): number | null => {
    const [a, m, d] = (s ?? "").split("-").map((n: string) => Number(n));
    if (!Number.isFinite(a) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
    return Date.UTC(a, m - 1, d, 12);
  };
  const x = t(de);
  const y = t(ate);
  if (x == null || y == null) return null;
  return Math.round((y - x) / 86_400_000);
}

// ---------------------------------------------------------------------------
// Contrato
// ---------------------------------------------------------------------------

export type DirecaoDelta = "subiu" | "desceu" | "estavel";

export interface DeltaBadgeProps {
  /** Valor exibido na celula do dia. null => nada e desenhado. */
  atual: number | null;
  /** Valor da coleta anterior do MESMO exame. null => nada e desenhado. */
  anterior: number | null;
  /** Rotulo do exame (vem de evento_tipo_ref) — entra na leitura acessivel. */
  rotulo?: string;
  /** Unidade (vem de evento_tipo_ref / do evento). Vazia = exame adimensional. */
  unidade?: string | null;
  /** Dia da coleta anterior ("AAAA-MM-DD") — dito por extenso no title. */
  diaAnterior?: string | null;
  /** Dia da coleta atual ("AAAA-MM-DD") — usado so para medir a distancia. */
  diaAtual?: string | null;
}

const GLIFO: Record<DirecaoDelta, string> = { subiu: "▲", desceu: "▼", estavel: "=" };
const VERBO: Record<DirecaoDelta, string> = { subiu: "subiu", desceu: "caiu", estavel: "sem variação" };

/** Direcao pura (exportada para teste/reuso). Empate exato => estavel. */
export function direcaoDelta(atual: number, anterior: number): DirecaoDelta {
  if (atual > anterior) return "subiu";
  if (atual < anterior) return "desceu";
  return "estavel";
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

/**
 * Seta de tendencia da celula. Sem par de valores => null (celula fica limpa;
 * a ausencia de seta ja diz "nao ha com o que comparar").
 */
export function DeltaBadge({
  atual,
  anterior,
  rotulo,
  unidade,
  diaAnterior,
  diaAtual,
}: DeltaBadgeProps): ReactElement | null {
  if (atual == null || anterior == null) return null;

  const dir = direcaoDelta(atual, anterior);
  const modulo = Math.abs(atual - anterior);
  const un = unidade?.trim() ? ` ${unidade.trim()}` : "";

  const dist = diaAnterior && diaAtual ? distanciaEmDias(diaAnterior, diaAtual) : null;
  const quando = diaAnterior
    ? `desde ${diaCurto(diaAnterior)}${dist != null && dist > 1 ? ` (${dist} dias antes)` : ""}`
    : "desde a coleta anterior";

  const movimento = dir === "estavel" ? VERBO.estavel : `${VERBO[dir]} ${fmtLab(modulo)}${un}`;
  const leitura =
    `${rotulo ? `${rotulo}: ` : ""}${movimento} ${quando} ` +
    `(${fmtLab(anterior)}${un} → ${fmtLab(atual)}${un}). Direção do número — a interpretação é clínica.`;

  return (
    <span className="dbadge" role="img" aria-label={leitura} title={leitura}>
      {GLIFO[dir]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// CSS do badge. Injetado UMA vez pelo TabelaoLabs (junto do CSS da tabela).
// Cor neutra por token — a seta nunca vira semaforo.
// ---------------------------------------------------------------------------
export const CSS_DELTA_BADGE = `
.dbadge{display:inline-block;margin-left:6px;font-family:var(--font-mono,monospace);
  font-size:var(--text-2xs,10px);font-weight:700;line-height:1;color:var(--text-muted);
  font-variant-numeric:tabular-nums}
`;

export default DeltaBadge;
