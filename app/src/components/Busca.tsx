"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icone } from "./Icone";

/** Busca do topo: filtra os leitos por nome ou número. */
export function Busca() {
  const rota = useRouter();
  const caminho = usePathname();
  const [q, setQ] = useState(useSearchParams().get("q") ?? "");
  return (
    <label className="ds-busca">
      <Icone n="busca" />
      <input value={q} placeholder="Nome ou leito" aria-label="Nome ou leito"
        onChange={(e) => { setQ(e.target.value); rota.replace(e.target.value ? `${caminho}?q=${encodeURIComponent(e.target.value)}` : caminho); }} />
    </label>
  );
}
