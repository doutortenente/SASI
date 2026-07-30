// Numeros pt-BR (virgula decimal). ZERO ALUCINACAO: null -> travessao, nunca 0 inventado.
export const num = (v: number | null | undefined, casas = 1) =>
  v == null ? "—" : v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: casas });
export const naoAvaliado = "não avaliado";
