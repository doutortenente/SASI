// ============================================================================
// SASI — camada de dados (ponto unico de importacao)
// ----------------------------------------------------------------------------
//   import { listarLeitosAtivos, serieVitais24h } from "@/lib/data";
//
// Tudo aqui e SERVER-SIDE (usa cookies() via getSupabaseServer): so pode ser
// chamado de Server Component, Route Handler ou Server Action.
// Toda pagina que consome estas funcoes precisa de:  export const dynamic = "force-dynamic";
//
// CONTRATO DE ERRO (uniforme, 31-jul-2026): falha de banco NUNCA vira dado falso.
//   - ERRO de leitura      -> throw falhaBanco(...) -> tela de erro (app/error.tsx).
//     "Consulta falhou" NAO pode parecer "paciente sem dado" — isso afirmaria
//     um vazio clinico falso ("nenhum sinal vital", "sem alerta") numa queda de rede.
//   - ausencia de medida   -> null (NUNCA 0). A tela imprime "—".
//   - excecao desenhada: getTipoRef degrada com AVISO NA TELA (rotulo=codigo).
// ============================================================================

export {
  listarLeitosAtivos,
  listarPacientes,
  getPaciente,
  getPacientePorLeito,
  type ListarPacientesOpts,
} from "./pacientes";

export {
  getUltimaEvolucao,
  mapearUltimasEvolucoes,
  listarEvolucoes,
  getEvolucao,
  serieSofaEvolucoes,
  type PontoSofa,
} from "./evolucoes";

export {
  // dimensao / vocabulario
  getTipoRef,
  getTipoRefMap,
  foraDaFaixa,
  CATEGORIAS_LAB,
  CATEGORIAS_VITAL,
  // eventos crus
  listarEventos,
  ultimoEvento,
  type ListarEventosOpts,
  // agregados
  serieVitais24h,
  serieLabs,
  type SerieVital,
  type SerieVitaisOpts,
  type SerieLabsOpts,
  type Folhao,
  type FolhaoLinha,
  type FolhaoCelula,
  // tendencias e scores
  serieTendencia,
  serieSofa72h,
  serieSofaDiario,
  getSofaDiarioAtual,
  getBhAcumulado,
  type PontoTendencia,
  type PontoSofa72h,
  type SofaDiario,
  type BhAcumulado,
  // utilitarios
  toNum,
  diaLocal,
} from "./eventos";

export {
  listarAtbsAtivos,
  listarAtbs,
  listarCulturas,
  listarCulturasPositivas,
  type VwDiasAtbAtivo,
  type StewardshipFlag,
  type ListarAtbsOpts,
  type CulturaComAntibiograma,
} from "./stewardship";

export {
  listarPendencias,
  mapearPendenciasAbertas,
  rotuloPrioridade,
  ROTULO_PRIORIDADE,
} from "./pendencias";

export {
  listarAlertasAbertos,
  mapearAlertasAbertos,
  listarAlertasDetalhados,
  listarEventosPendentesRevisao,
  contarEventosPendentesRevisao,
  type VwAlertaAberto,
  type ListarAlertasOpts,
} from "./alertas";
