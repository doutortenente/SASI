// ============================================================================
// SASI — camada de dados (ponto unico de importacao)
// ----------------------------------------------------------------------------
//   import { listarLeitosAtivos, serieVitais24h } from "@/lib/data";
//
// Tudo aqui e SERVER-SIDE (usa cookies() via getSupabaseServer): so pode ser
// chamado de Server Component, Route Handler ou Server Action.
// Toda pagina que consome estas funcoes precisa de:  export const dynamic = "force-dynamic";
//
// CONTRATO DE ERRO (uniforme): falha de banco NUNCA vira dado falso.
//   - funcao de lista  -> []      + console.error
//   - funcao de item   -> null    + console.error
//   - ausencia de medida -> null  (NUNCA 0). A tela imprime "—".
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
