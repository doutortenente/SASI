// Numeros pt-BR (virgula decimal). ZERO ALUCINACAO: null -> travessao, nunca 0 inventado.
export const num = (v: number | null | undefined, casas = 1) =>
  v == null ? "—" : v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: casas });
export const naoAvaliado = "não avaliado";

// ─────────────────────────────────────────────────────────────────────────────
// SEGURANCA DE MEDICACAO — unidade de dose
//
// BUG REAL encontrado em 30-jul-2026 (chip de DVA no War Room):
//   o simbolo "µ" (micro, U+00B5) sob `text-transform: uppercase` vira "Μ"
//   (Mu grego, U+039C), visualmente IDENTICO a um "M" latino. Na tela lia-se
//   "NORADRENALINA 0,04 MG/KG/MIN" onde o banco tem 0,04 µg/kg/min.
//   Erro de leitura de MIL VEZES na dose de uma droga vasoativa.
//
// Correcao: exibir "mcg" em vez de "µg". Nao e conversao de valor — µg e mcg
// sao a MESMA unidade, apenas a grafia segura. E a recomendacao do ISMP
// (Institute for Safe Medication Practices), que lista "µg" como abreviacao
// perigosa exatamente por ser confundida com "mg".
//
// O DADO NO BANCO NAO MUDA. Isto e camada de apresentacao.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normaliza a grafia da unidade para leitura segura em qualquer caixa (maiuscula
 * ou minuscula). Cobre o micro latino (µ U+00B5) e o Mu grego (μ U+03BC).
 * Nao converte valor, nao inventa unidade: entrada vazia sai vazia.
 */
export function unidadeSegura(u: string | null | undefined): string {
  if (u == null) return "";
  return String(u)
    .replace(/[µμ]g/g, "mcg") // µg / μg -> mcg
    .replace(/[µμ]/g, "mc"); // micro isolado (raro) -> mc
}

/** Junta valor + unidade com a grafia segura. Valor ausente => travessao, sem unidade solta. */
export function comUnidade(valor: string | number | null | undefined, unidade?: string | null): string {
  if (valor == null || valor === "") return "—";
  const u = unidadeSegura(unidade);
  return u ? `${valor} ${u}` : String(valor);
}
