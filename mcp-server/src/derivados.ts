// Campos que o banco calcula sozinho. O servidor nunca os grava.
// Hoje só existe um: pacientes.dispositivos (função fn_refresh_dispositivos).

export const CAMPOS_DERIVADOS = ["dispositivos"] as const;

export const AVISO_DISPOSITIVOS =
  "O campo 'dispositivos' foi ignorado: o banco calcula esse dado sozinho, a partir de dispositivo_episodios, atbs e da última evolução.";

/**
 * Devolve uma cópia do objeto sem os campos derivados, e a lista dos que foram tirados.
 * Não altera o objeto de entrada.
 */
export function retirarDerivados<T extends Record<string, unknown>>(
  entrada: T,
): { limpo: Record<string, unknown>; retirados: string[] } {
  const limpo: Record<string, unknown> = { ...entrada };
  const retirados: string[] = [];
  for (const campo of CAMPOS_DERIVADOS) {
    if (Object.prototype.hasOwnProperty.call(limpo, campo)) {
      delete limpo[campo];
      retirados.push(campo);
    }
  }
  return { limpo, retirados };
}
