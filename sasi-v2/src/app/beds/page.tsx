// ============================================================================
// SASI v2 — /beds · WAR ROOM (painel geral de leitos)
// ----------------------------------------------------------------------------
// Server Component: le o banco no servidor e entrega a grade pronta.
//
// O QUE ESTA TELA LE DO BANCO (camada de dados @/lib/data):
//   1. listarLeitosAtivos()        -> view vw_dashboard_uti (1 linha por leito
//      ativo; ja traz SOFA da ultima evolucao, delta_sofa_24h, dvas, sedativos,
//      dispositivos, isolation, severidade_visual e pendencias_abertas).
//   2. mapearPendenciasAbertas()   -> tabela pendencias, agrupada por paciente
//      numa unica consulta (evita 1 query por card). So para dizer QUAL e a
//      tarefa mais urgente; a CONTAGEM continua vindo da view.
//
// Nada e calculado aqui: a triagem so ordena/rotula (features/war-room/triage)
// e o SOFA vem pronto do banco. Onde falta dado, a tela imprime "—".
// ============================================================================
import type { ReactElement } from "react";
import { listarLeitosAtivos, mapearPendenciasAbertas } from "@/lib/data";
import { triagem } from "@/features/war-room/triage";
import { BedGrid } from "@/features/beds/components/BedGrid";
import type { ResumoPendencia } from "@/features/beds/components/BedCard";
import { SplitPane } from "@/features/war-room/components/SplitPane";
import { CalcPanel } from "@/features/war-room/components/CalcPanel";
import { resumoEvolucao, type EvolucaoResumo } from "@/lib/formatters/tempo";
import type { Pendencia } from "@/types/clinical";

export const dynamic = "force-dynamic";

/** Horario da leitura, no fuso do plantao (o servidor pode estar em UTC). */
function agoraNoPlantao(agora: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(agora);
}

export default async function BedsPage(): Promise<ReactElement> {
  // 1. leitos ativos (view) + triagem: pior primeiro
  const leitos = triagem(await listarLeitosAtivos());

  // 2. pendencias abertas de todos os leitos de uma vez (1 consulta)
  const mapa = await mapearPendenciasAbertas(leitos.map((l) => l.paciente_id));
  const pendencias: Record<string, ResumoPendencia> = {};
  mapa.forEach((lista: Pendencia[], pacienteId: string) => {
    pendencias[pacienteId] = {
      abertas: lista.length,
      altas: lista.filter((p: Pendencia) => p.prioridade === 1).length,
      // a camada de dados ja ordena por prioridade (1 alta) e depois pela mais antiga
      primeira: lista[0]?.tarefa ?? null,
    };
  });

  // 3. idade do dado: quando foi a ultima evolucao de cada leito (fuso do plantao,
  //    calculado no SERVIDOR — nao existe conta de data no client).
  const agora = new Date();
  const evolucoes: Record<string, EvolucaoResumo> = {};
  for (const l of leitos) evolucoes[l.paciente_id] = resumoEvolucao(l.ultima_evolucao ?? null, agora);

  return (
    <SplitPane painel={<CalcPanel />} rotuloPainel="Calculadoras de plantão">
      <BedGrid leitos={leitos} pendencias={pendencias} evolucoes={evolucoes} lidoEm={agoraNoPlantao(agora)} />
    </SplitPane>
  );
}
