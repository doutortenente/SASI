/** Converte número BR (vírgula decimal) para float. Retorna NaN se inválido. */
export function parseFloatBR(value: string | number | null | undefined): number {
  if (value == null || value === '') return NaN;
  if (typeof value === 'number') return value;
  const normalized = value.trim().replace(/\./g, '').replace(',', '.');
  return Number.parseFloat(normalized);
}

export function isValidBRNumber(value: string | number | null | undefined): boolean {
  const n = parseFloatBR(value);
  return Number.isFinite(n);
}