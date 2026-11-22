import { redirect } from "next/navigation";
import { carregarLeitos, type Leito } from "@/lib/uti";

/** Resolve o leito pedido em ?leito=NN. Sem leito, ou com leito vago, abre o primeiro leito ocupado. */
export async function leitoPedido(base: string, pedido?: string): Promise<{ leitos: Leito[]; l: Leito | null }> {
  const leitos = await carregarLeitos();
  const n = (pedido ?? "").replace(/\D/g, "").padStart(2, "0");
  const l = leitos.find((x) => x.n === n && x.p) ?? null;
  if (!l) {
    const primeiro = leitos.find((x) => x.p);
    if (primeiro && pedido !== primeiro.n) redirect(`${base}?leito=${primeiro.n}`);
    return { leitos, l: primeiro ?? null };
  }
  return { leitos, l };
}
