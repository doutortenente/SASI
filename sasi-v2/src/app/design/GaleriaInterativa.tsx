"use client";
// ============================================================================
// SASI v2 — Galeria interativa da /design (isla client)
// Os demos que precisam de estado (SegmentedControl, StatPill clicável) vivem
// aqui; o resto da galeria é Server Component.
// ============================================================================
import {useState} from "react";
import type {ReactElement} from "react";
import {SegmentedControl} from "@/components/ui/SegmentedControl";
import {StatPill} from "@/components/ui/StatPill";

export function GaleriaInterativa(): ReactElement {
  const [uti, setUti] = useState("todas");
  const [ativo, setAtivo] = useState<"todos" | "pendentes">("todos");

  return (
    <>
      <div className="ds-gal__linha">
        <SegmentedControl
          options={[
            {value: "todas", label: "Todas"},
            {value: "UTI2", label: "UTI2"},
            {value: "UTI3", label: "UTI3"},
            {value: "UTI4", label: "UTI4"},
          ]}
          value={uti}
          onChange={setUti}
        />
        <span className="ds-gal__nota">filtro selecionado: {uti}</span>
      </div>

      <div className="ds-gal__linha">
        <StatPill value="33" label="leitos"/>
        <StatPill value="7" label="críticos" tone="danger"/>
        <StatPill value="1240" label="mL/24h" tone="accent" delta={-320}/>
        <StatPill
          value={ativo === "todos" ? "8" : "3"}
          label={ativo === "todos" ? "pacientes" : "pendências"}
          tone="accent"
          active={ativo === "pendentes"}
          onClick={() => setAtivo(ativo === "todos" ? "pendentes" : "todos")}
        />
      </div>
    </>
  );
}

export default GaleriaInterativa;
