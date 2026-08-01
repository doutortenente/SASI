// ============================================================================
// SASI v2 — /rounds · ROUND DO PLANTAO (1 linha por leito ativo)
// ----------------------------------------------------------------------------
// Server Component: le o banco no servidor e entrega a lista pronta.
// Esta e a tela do "o que precisa de acao AGORA" — nao e cadastro: manda risco
// aberto, pendencia de prioridade alta, antibiotico vencendo e evolucao atrasada.
//
// O QUE ESTA TELA LE DO BANCO (camada de dados @/lib/data):
//   1. listarLeitosAtivos()       -> view vw_dashboard_uti
//        1 linha por leito ativo: leito, nome, idade, HD, dias de internacao,
//        SOFA da ultima evolucao, delta_sofa_24h, ultima_evolucao, dispositivos
//        e contagem de pendencias abertas.
//   2. mapearAlertasAbertos()     -> view vw_alertas_abertos (1 consulta)
//        contagem de alertas NAO reconhecidos por leito (criticos/avisos/infos).
//        Leito que nao aparece na view = sem alerta aberto (nunca "0 confirmado").
//   3. mapearPendenciasAbertas()  -> tabela pendencias (1 consulta para todos)
//        so as abertas, ja ordenadas por prioridade (1 alta) e mais antigas antes.
//   4. listarAtbsAtivos()         -> view vw_dias_atb_ativo (1 consulta)
//        antibioticos EM CURSO com D+n (dia de terapia) e flag de stewardship,
//        ambos calculados NO BANCO.
//
// Nada e calculado aqui: SOFA e D-ATB vem prontos do banco, a escala de
// gravidade vem de features/war-room/triage e a unica conta desta pagina e
// "ha quantas horas foi a ultima evolucao" — feita no SERVIDOR, no fuso do
// plantao, para nao existir data no client.
// ============================================================================
import type {ReactElement} from "react";
import {type LinhaRound, RoundList} from "@/features/rounds/components/RoundList";
import {triagem} from "@/features/war-room/triage";
import {
  listarAtbsAtivos,
  listarLeitosAtivos,
  mapearAlertasAbertos,
  mapearPendenciasAbertas,
  type VwDiasAtbAtivo,
} from "@/lib/data";
import {resumoEvolucao} from "@/lib/formatters/tempo";

export const dynamic = "force-dynamic";

/** Fuso do plantao: o servidor pode estar em UTC, o medico nunca esta. */
const FUSO = "America/Sao_Paulo";

const fmtHora = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: FUSO
});

export default async function RoundsPage(): Promise<ReactElement> {
  // 1. leitos ativos (view) + triagem: pior primeiro
  const leitos = triagem(await listarLeitosAtivos());

  // 2. risco e tarefa de todos os leitos em 3 consultas (nao 3 por leito)
  const [alertas, pendencias, atbs] = await Promise.all([
    mapearAlertasAbertos(),
    mapearPendenciasAbertas(leitos.map((l) => l.paciente_id)),
    listarAtbsAtivos(),
  ]);

  const atbPorPaciente = new Map<string, VwDiasAtbAtivo[]>();
  for (const a of atbs) {
    const atual = atbPorPaciente.get(a.paciente_id);
    if (atual) atual.push(a);
    else atbPorPaciente.set(a.paciente_id, [a]);
  }

  const agora = new Date();
  const linhas: LinhaRound[] = leitos.map(
    (l): LinhaRound => ({
      leito: l,
      alertas: alertas.get(l.paciente_id) ?? null,
      pendencias: pendencias.get(l.paciente_id) ?? [],
      atbs: atbPorPaciente.get(l.paciente_id) ?? [],
      evolucao: resumoEvolucao(l.ultima_evolucao ?? null, agora),
    }),
  );

  return <RoundList linhas={linhas} lidoEm={fmtHora.format(agora)}/>;
}
