// ============================================================================
// SASI v2 — /beds · Visão Geral (v1.0): alertas críticos + Cards / Round / Tabela
// (src/v1/components/Shell → Overview), com o painel de calculadoras do plantão.
// ============================================================================
import type {ReactElement} from "react";
import {Overview} from "@/v1/components/Shell";
import {SplitPane} from "@/features/war-room/components/SplitPane";
import {CalcPanel} from "@/features/war-room/components/CalcPanel";

export default function BedsPage(): ReactElement {
  return (
    <SplitPane painel={<CalcPanel/>} rotuloPainel="Calculadoras de plantão">
      <Overview/>
    </SplitPane>
  );
}
