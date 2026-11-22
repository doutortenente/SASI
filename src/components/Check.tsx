"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Icone } from "./Icone";

/** Caixa de feito de uma pendência: marca e desmarca direto no banco. */
export function Check({ id, feita }: { id: string; feita: boolean }) {
  const rota = useRouter();
  const [f, setF] = useState(feita);
  async function alterna() {
    const novo = !f;
    setF(novo);
    const { error } = await getSupabaseBrowser().from("pendencias").update({ concluida: novo, concluida_at: novo ? new Date().toISOString() : null }).eq("id", id);
    if (error) setF(!novo);
    else rota.refresh();
  }
  return (
    <span className={"ds-check" + (f ? " ds-check--feito" : "")} role="checkbox" aria-checked={f} aria-label="Feita" tabIndex={0}
      onClick={alterna} onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); void alterna(); } }}>
      {f ? <Icone n="feito" /> : null}
    </span>
  );
}
