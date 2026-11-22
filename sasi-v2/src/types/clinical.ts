// ============================================================================
// SASI v3 — Tipos TypeScript do modelo de dados  (Anexo C)
// ----------------------------------------------------------------------------
// Escrito à mão para refletir o schema de produção (Anexo A / 10_schema_producao_v3.sql).
// Serve de contrato para o app Next.js. Inclui os CONTRATOS JSONB como interfaces
// (é onde mora a riqueza clínica — e o que evita o débito "2 schemas").
//
// Depois de aplicar o schema no Supabase, regenere a versão "oficial" com:
//   supabase gen types typescript --project-id idswehsvvqczzkiatuzu > database.types.ts
// Mantenha ESTE arquivo como fonte dos tipos JSONB (o gerador trata JSONB como `Json`).
// ============================================================================

export type Json =
  | string | number | boolean | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------------------------------------------------------------------------
// 1. ENUMS (vocabulários fechados — espelham os enums nativos do Postgres)
// ---------------------------------------------------------------------------
export type Uti = 'UTI2' | 'UTI3' | 'UTI4';
// Em 10-ago-2026 o enum do banco mudou: moderado→watcher, grave→instavel; 'obito' saiu
// (o desfecho mora em status_leito e em internacoes.desfecho).
export type Gravidade = 'estavel' | 'watcher' | 'instavel' | 'critico';
export type StatusLeito = 'ativo' | 'alta' | 'obito' | 'transferencia';
export type Isolamento = 'none' | 'contact' | 'droplet' | 'aerosol';
export type SeveridadeVisual = 'red' | 'yellow' | 'green';
export type Plantao = 'manha' | 'tarde' | 'noite' | 'plantao_24h';
export type ViaAtb = 'EV' | 'VO' | 'IM' | 'SC' | 'SNE' | 'SNG' | 'IT' | 'Tópico';
export type IntencaoAtb = 'empirica' | 'dirigida' | 'profilatica';
export type MaterialCultura =
  | 'hemocultura' | 'urocultura' | 'aspirado_traqueal' | 'lavado_bal' | 'lcr'
  | 'secrecao_ferida' | 'liquido_peritoneal' | 'liquido_pleural' | 'outro';
export type AntibiogramaResultado = 'S' | 'I' | 'R';
export type SeveridadeAlerta = 'info' | 'warning' | 'critical';
export type FonteEvento =
  | 'manual' | 'gemini_ocr' | 'claude_ocr' | 'appsheet'
  | 'auto_trigger' | 'edge_function' | 'api_import';
export type Comparador = 'lt' | 'lte' | 'gt' | 'gte';
export type TrendModo = 'subida_abs' | 'subida_rel' | 'queda_abs';
// Enums criados em 10-ago-2026 (internações, dispositivos por episódio, relógios da evolução)
export type Turno = 'diurna' | 'noturna';
export type TipoNota = 'admissao' | 'seriada' | 'alta' | 'andar';
export type DesfechoInternacao = 'alta_uti' | 'alta_hospitalar' | 'obito' | 'transferencia';
export type DispositivoTipo =
  | 'iot' | 'traqueo' | 'cvc' | 'picc' | 'arterial' | 'svd' | 'sne' | 'sng'
  | 'dreno' | 'gtt' | 'trr' | 'marca_passo' | 'outro';
export type DispositivoMotivoFim = 'eletivo' | 'infeccao' | 'troca' | 'disfuncao' | 'alta' | 'obito' | 'outro';

// Códigos de tipo de evento (dimensão evento_tipo_ref). Extensível como DADO.
export type EventoTipo =
  | 'pa_sys'
  | 'pa_dia'
  | 'pam'
  | 'pam_min'
  | 'fc'
  | 'fr'
  | 'spo2'
  | 'temp'
  | 'glicemia'
  | 'pf_ratio'
  | 'lactato'
  | 'ph'
  | 'pco2'
  | 'po2'
  | 'hco3'
  | 'be'
  | 'diurese_h'
  | 'bh_h'
  | 'bh_acumulado'
  | 'cr'
  | 'ur'
  | 'na'
  | 'k'
  | 'mg'
  | 'ca'
  | 'p'
  | 'hb'
  | 'ht'
  | 'plaq'
  | 'leuco'
  | 'inr'
  | 'bb'
  | 'pcr'
  | 'procalcitonina'
  | 'nor_dose'
  | 'adr_dose'
  | 'vaso_dose'
  | 'dobuta_dose'
  | 'dopa_dose'
  | 'fent_dose'
  | 'midaz_dose'
  | 'propofol_dose'
  | 'precedex_dose'
  | 'gcs'
  | 'rass'
  | 'cam_icu'
  | 'bps'
  | 'cpot'
  | 'sofa_total'
  | 'sofa_resp'
  | 'sofa_coag'
  | 'sofa_liver'
  | 'sofa_cardio'
  | 'sofa_neuro'
  | 'sofa_renal'
  // acrescentados em 10-ago-2026 (56 → 79 códigos)
  | 'pas_min' | 'troponina' | 'probnp' | 'tp' | 'ttpa' | 'd_dimero' | 'tgo' | 'tgp' | 'ggt' | 'fa'
  | 'bd' | 'bi' | 'amilase' | 'lipase' | 'dhl' | 'vhs' | 'tsh' | 't4l'
  | 'pvc' | 'diurese_24h' | 'diurese_parcial' | 'uf_dialise' | 'debito_dreno'
  | 'custom';

// ---------------------------------------------------------------------------
// 2. CONTRATOS JSONB (a "caixa flexível" — documentada e tipada)
// ---------------------------------------------------------------------------

/** pacientes.dispositivos */
export interface Dispositivos {
  iot?: boolean;
  cvc?: boolean;
  pai?: boolean;
  svd?: boolean;
  sne?: boolean;
  avp?: boolean;
  picc?: boolean;
  tqt?: boolean;
  dreno?: boolean;
  mpd?: boolean;
  shilley?: boolean;
  detalhe?: string | null;
}

/** pacientes.riscos_flags */
export interface RiscosFlags {
  pav?: boolean;
  broncoaspiracao?: boolean;
  upp?: boolean;
  queda?: boolean;
  diabetico?: boolean;
}

/** Item de infusão contínua (evolucoes.dvas / sedativos). Forma canônica da ingestão. */
export interface Infusao {
  id?: string;
  droga: string;
  dose?: string | number | null; // banco vivo grava NUMERO ({"dose": 0.04}); molde legado gravava string
  unidade?: string;
  diluicao_mg?: number;     // forma rica (skill de ingestão)
  diluicao_ml?: number;
  diluicao_UI?: number;
  vazao_ml_h?: number;
  vazao_mcg_h?: number;
  vazao_mg_h?: number;
  started_at?: string;
}

/** patient_summary.interconsultas[] */
export interface Interconsulta {
  especialidade: string;
  data?: string;
  status?: 'pendente' | 'concluida' | string;
  notas?: string;
}

/** patient_summary.programacao[] */
export interface Programacao {
  descricao: string;
  data?: string;
  tipo?: string;
  status?: string;
}

/** patient_summary.resumo_sistemas[] — ids: hemo_cv,infecto,renal,gi,resp,snc,pontos_criticos */
export interface ResumoSistema {
  id: string;
  label: string;
  emoji?: string;
  texto: string;
}

/** patient_summary.dispositivos[] (lista estruturada) */
export interface DispositivoDetalhe {
  tipo: string;
  local?: string;
  data_insercao?: string;
}

/** pacientes.patient_summary — a "ficha congelada" da admissão (contrato do frontend) */
export interface PatientSummary {
  data_admissao?: string | null;
  motivo_admissao?: string | null;
  hpma?: string | null;
  antecedentes?: string | null;
  medicamentos_domiciliares?: string[];
  alergias?: string | null;
  dispositivos?: DispositivoDetalhe[];
  suporte_atual?: {
    dvas?: string[];
    ventilacao?: string | null;
    sedacao?: string | null;
    antibioticos?: string[];
  };
  interconsultas?: Interconsulta[];
  programacao?: Programacao[];
  resumo_sistemas?: ResumoSistema[];
  iatrogenias?: string | null;
  sutilezas?: string | null;
  dva_fluidos?: string | null;
  exames_relevantes?: string | null;
  plano_terapeutico_atual?: string | null;
  ultima_atualizacao?: string;
}

// evolucoes: sistemas (esquema CANÔNICO Máx–Mín — fonte única da verdade)
// Atenção (medido no banco em 22-nov-2026): convivem DUAS grafias nas linhas guardadas.
// Até jul-2026: pa_sys_*, pa_dia_*, tmax. Desde ago-2026 a ingestão grava pas_*, pad_*, tax_*.
// Quem lê precisa aceitar as duas. Chaves sem tipo certo medido ficam como Json.
export interface SistemaNeuro {
  descricao?: string | null;
  rass?: string | number | null;
  exame?: Json;
  terapia?: Json;

  [k: string]: Json | undefined;
}

export interface SistemaResp {
  suporte?: string | null;
  fr_max?: string | number | null;
  fr_min?: string | number | null;
  spo2_max?: string | number | null;
  spo2_min?: string | number | null;
  via?: Json;
  ausculta?: Json;
  obs?: string | null;

  [k: string]: Json | undefined;
}

export interface SistemaHemo {
  pa_sys_max?: string | number | null;
  pa_sys_min?: string | number | null;
  pa_dia_max?: string | number | null;
  pa_dia_min?: string | number | null;
  pam_max?: string | number | null;
  pam_min?: string | number | null;
  fc_max?: string | number | null;
  fc_min?: string | number | null;
  pas_max?: string | number | null; // desde ago-2026 (no lugar de pa_sys_max)
  pas_min?: string | number | null;
  pad_max?: string | number | null; // desde ago-2026 (no lugar de pa_dia_max)
  pad_min?: string | number | null;
  exame?: Json;
  terapia?: Json;
  ritmo?: string | null;
  obs?: string | null;

  [k: string]: Json | undefined;
}

export interface SistemaTgi {
  dieta?: string | null;
  abdome?: Json;
  evacuacao?: Json;
  evacuacoes_24h?: Json;
  ingesta_hidrica_ml?: string | number | null;
  obs?: string | null;

  [k: string]: Json | undefined;
}

export interface SistemaRenal {
  cr?: string | number | null;
  ur?: string | number | null;
  diurese_6_18h_ml?: string | number | null;
  bh_6_18h_ml?: string | number | null;
  diurese_24h_ml?: string | number | null; // desde ago-2026
  bh_24h_ml?: string | number | null;      // desde ago-2026
  terapia?: Json;
  descricao?: string | null;
  obs?: string | null;

  [k: string]: Json | undefined;
}

export interface SistemaHemato {
  hb?: string | number | null;
  ht?: string | number | null;
  plaq?: string | number | null;
  leuco?: string | number | null;
  seg?: string | number | null;
  bast?: string | number | null;
  obs?: string | null;

  [k: string]: Json | undefined;
}

export interface SistemaInfecto {
  atb?: string | null;
  tmax?: string | number | null;
  leuco?: string | number | null;
  tax_max?: string | number | null; // desde ago-2026 (no lugar de tmax)
  tax_min?: string | number | null;
  foco?: Json;
  obs?: string | null;

  [k: string]: Json | undefined;
}

export interface ProblemaAtivo {
  texto: string;
  sistema?: string;
  gravidade?: 'leve' | 'moderada' | 'grave' | 'critica';
}

export interface CondutaSistema {
  sistema: string;
  texto: string;
  meta?: string;
  prazo?: string;
}

export interface Risco {
  texto: string;
  nivel?: 'baixo' | 'medio' | 'alto';
}

export interface Prescricao {
  cardiovascular?: string[];
  snc?: string[];
  gastro_endocrino?: string[];
  infeccioso_resp?: string[];
  sintomaticos_sn?: string[];
  solucoes_diureticos?: string[];
  nutricao?: string[];
}

// ---------------------------------------------------------------------------
// 3. LINHAS DAS TABELAS (Row = como vem do banco)
// ---------------------------------------------------------------------------
export interface EventoTipoRef {
  codigo: EventoTipo | string;
  categoria: string;
  rotulo: string;
  unidade_padrao: string | null;
  faixa_min: number | null;
  faixa_max: number | null;
  loinc_code: string | null;   // FHIR Observation.code (http://loinc.org)
  ativo: boolean;
  ordem: number;
}

export interface Paciente {
  id: string;
  user_id: string | null;
  leito: string;
  uti: Uti;
  nome: string;
  idade: number | null;
  peso: number | null;
  altura: number | null;         // cm
  hd: string | null;
  data_adm: string;
  alergias: string | null;
  gravidade: Gravidade;
  status_leito: StatusLeito;
  sofa_baseline: number | null;
  isolation: Isolamento;
  out_of_range_count: number;
  severidade_visual: SeveridadeVisual;
  dispositivos: Dispositivos;
  riscos_flags: RiscosFlags;
  patient_summary: PatientSummary | null;
  imc: number | null;            // gerado (stored)
  created_at: string;
  updated_at: string;
}

export interface Evolucao {
  id: string;
  paciente_id: string;
  user_id: string | null;
  data_evolucao: string;
  plantao: Plantao;
  neuro: SistemaNeuro;
  resp: SistemaResp;
  hemo: SistemaHemo;
  tgi: SistemaTgi;
  renal: SistemaRenal;
  hemato: SistemaHemato;
  infecto: SistemaInfecto;
  dvas: Infusao[];
  sedativos: Infusao[];
  impressao: string[];
  conduta: string[];
  problemas_ativos: ProblemaAtivo[];
  condutas_sistemas: CondutaSistema[];
  riscos: Risco[];
  prescricao: Prescricao | null;
  sofa_snapshot: Json | null;
  sofa_total: number | null;
  created_at: string;
  updated_at: string;
  // colunas de 10 e 13-ago-2026 (plantao acima virou legado: a referência é data_plantao + turno)
  internacao_id: string | null;       // carimbado por gatilho
  tipo_nota: TipoNota;
  data_plantao: string;               // dia do plantão; noturna antes das 07h cai no dia anterior
  turno: Turno;
  autor_crm: string | null;
  autor_nome: string | null;
  illness_severity: Gravidade | null; // gravidade no momento da nota
  finalizada_em: string | null;
  intercorrencias: string[];
}

export interface EventoClinico {
  id: string;
  paciente_id: string;
  evolucao_id: string | null;
  user_id: string | null;
  internacao_id: string | null;
  ts: string;
  tipo: EventoTipo | string;   // FK -> evento_tipo_ref
  valor_num: number | null;
  valor_json: Json | null;     // custom: {dominio,subtipo,unidade,...}; pf_ratio: {suporte_vent}
  unidade: string | null;
  fonte: FonteEvento;
  confidence: number | null;   // 0..1
  source_text: string | null;
  requires_review: boolean;
  created_at: string;
}

export interface Atb {
  id: string;
  paciente_id: string;
  user_id: string | null;
  internacao_id: string | null;
  droga: string;
  dose: string | null;
  via: ViaAtb | null;
  frequencia: string | null;
  data_inicio: string;
  data_fim: string | null;
  intencao: IntencaoAtb | null;
  foco: string | null;
  agente_alvo: string | null;
  motivo_suspensao: string | null;
  duracao_planejada_dias: number | null;
  created_at: string;
  updated_at: string;
}

export interface Cultura {
  id: string;
  paciente_id: string;
  user_id: string | null;
  internacao_id: string | null;
  material: MaterialCultura;
  coleta_ts: string;
  laudo_ts: string | null;
  crescimento: boolean;
  agente: string | null;
  ufc_por_ml: number | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Antibiograma {
  id: string;
  cultura_id: string;
  antibiotico: string;
  resultado: AntibiogramaResultado;
  cim: number | null;
  created_at: string;
}

export interface Pendencia {
  id: string;
  paciente_id: string;
  evolucao_id: string | null;
  user_id: string | null;
  internacao_id: string | null;
  tarefa: string;
  prioridade: 1 | 2 | 3;
  concluida: boolean;
  concluida_at: string | null;
  created_at: string;
}

export interface AlertLog {
  id: string;
  paciente_id: string;
  evento_id: string | null;
  user_id: string | null;
  tipo: string;
  severidade: SeveridadeAlerta;
  mensagem: string;
  payload: Json | null;
  hash_key: string;
  acked: boolean;
  acked_at: string | null;
  acked_by: string | null;
  created_at: string;
}

export interface AlertRule {
  id: string;
  ativo: boolean;
  tipo_evento: EventoTipo | string;
  comparador: Comparador;
  limiar: number;
  severidade: SeveridadeAlerta;
  rotulo: string;
  mensagem: string;
  fonte: string | null;
  ordem: number;
  created_at: string;
}

export interface TrendRule {
  id: string;
  ativo: boolean;
  tipo_evento: EventoTipo | string;
  modo: TrendModo;
  limiar: number;
  janela_max_horas: number | null;
  severidade: SeveridadeAlerta;
  rotulo: string;
  mensagem: string;
  fonte: string | null;
  ordem: number;
  created_at: string;
}

export interface IngestAuditLog {
  id: string;
  user_id: string | null;
  paciente_id: string | null;
  source_type: string | null;
  fonte: string | null;
  payload_raw: Json | null;
  response: Json | null;
  eventos_ids: string[] | null;
  warnings: string[] | null;
  ok: boolean;
  error_msg: string | null;
  created_at: string;
}

export interface Memoria {
  id: number;
  user_id: string | null;
  conteudo: string;
  metadata: Json | null;
  embedding: number[] | null;
  created_at: string | null;
}

// ---------------------------------------------------------------------------
// 4. VIEWS (contratos de leitura — o que o Dashboard/telas consomem)
// ---------------------------------------------------------------------------
export interface VwDashboardUti {
  paciente_id: string;
  user_id: string | null;
  leito: string;
  uti: Uti;
  nome: string;
  idade: number | null;
  peso: number | null;
  hd: string | null;
  gravidade: Gravidade;
  status_leito: StatusLeito;
  data_adm: string;
  dias_internacao: number | null;
  evolucao_id: string | null;
  ultima_evolucao: string | null;
  sofa_total: number | null;
  sofa_snapshot: Json | null;
  dvas: Infusao[] | null;
  sedativos: Infusao[] | null;
  delta_sofa_24h: number | null;
  pendencias_abertas: number;
  dispositivos: Dispositivos;
  isolation: Isolamento;
  out_of_range_count: number;
  severidade_visual: SeveridadeVisual;
}

// ---------------------------------------------------------------------------
// 5. Payload de ingestão (contrato sasi-ocr-ingest/v1 — F4/OCR)
// ---------------------------------------------------------------------------
export interface OcrIngestPayloadV1 {
  $schema: 'sasi-ocr-ingest/v1';
  extracted_at: string;
  source: { type?: string; fonte: FonteEvento; confidence_overall?: number; warnings?: string[] };
  target: { uti: Uti; leito: string; paciente_id?: string | null };
  paciente_upsert?: Partial<Paciente> | null;
  evolucao_snapshot?: Partial<Evolucao> | null;
  eventos_clinicos?: Array<{
    ts: string;
    tipo: EventoTipo | string;
    valor_num?: number | null;
    valor_json?: Json;
    unidade?: string | null;
    confidence?: number | null;
    source_text?: string | null;
    requires_review?: boolean;
  }>;
  pendencias?: Array<{ tarefa: string; prioridade?: 1 | 2 | 3 }>;
}

// ---------------------------------------------------------------------------
// 5-B. Tabelas criadas em 10-ago-2026
// ---------------------------------------------------------------------------
/** internacoes — um episódio de UTI por linha; a reinternação aponta para a anterior. */
export interface Internacao {
  id: string;
  paciente_id: string;
  user_id: string | null;
  int_origem_data: string | null;
  int_uti_data: string;
  uti: Uti | null;
  reinternacao: boolean;
  internacao_prev_id: string | null;
  desfecho: DesfechoInternacao | null;
  desfecho_data: string | null;
  destino_setor: string | null;
  destino_especialidade: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

/** dispositivo_episodios — cada dispositivo com início e fim. pacientes.dispositivos é DERIVADO daqui: não escrever à mão. */
export interface DispositivoEpisodio {
  id: string;
  paciente_id: string;
  internacao_id: string | null;
  user_id: string | null;
  tipo: DispositivoTipo;
  sitio: string | null;
  data_inicio: string;
  data_fim: string | null;
  motivo_fim: DispositivoMotivoFim | null;
  observacoes: string | null;
  source_text: string | null;
  created_at: string;
  updated_at: string;
}

/** janelas_24h — máximo, mínimo e nº de medidas fora do limiar de um sinal numa janela (de onde sai "5x < 65"). */
export interface Janela24h {
  id: string;
  paciente_id: string;
  internacao_id: string | null;
  evolucao_id: string | null;
  user_id: string | null;
  tipo: EventoTipo | string;
  janela_inicio: string;
  janela_fim: string;
  valor_max: number | null;
  valor_min: number | null;
  n_total: number;
  n_fora_alto: number | null;
  n_fora_baixo: number | null;
  limiar_alto: number | null;
  limiar_baixo: number | null;
  fonte: FonteEvento;
  confidence: number | null;
  source_text: string | null;
  requires_review: boolean;
  created_at: string;
}

/** avisos_agentes — recados entre sessões de trabalho sobre o estado do banco. */
export interface AvisoAgente {
  id: number;
  criado_em: string;
  titulo: string;
  corpo: string;
  resolvido: boolean;
}

// ---------------------------------------------------------------------------
// 6. Conveniência (mapa nome-da-tabela -> tipo Row), útil no cliente Supabase
// ---------------------------------------------------------------------------
export interface SasiTables {
  pacientes: Paciente;
  evolucoes: Evolucao;
  eventos_clinicos: EventoClinico;
  evento_tipo_ref: EventoTipoRef;
  atbs: Atb;
  culturas: Cultura;
  antibiograma: Antibiograma;
  pendencias: Pendencia;
  alerts_log: AlertLog;
  alert_rules: AlertRule;
  trend_rules: TrendRule;
  ingest_audit_log: IngestAuditLog;
  memorias: Memoria;
  internacoes: Internacao;
  dispositivo_episodios: DispositivoEpisodio;
  janelas_24h: Janela24h;
  avisos_agentes: AvisoAgente;
}
