-- ============================================================================
-- SASI — RETRATO DO BANCO DE PRODUÇÃO (schema public)
-- Gerado em 2026-11-22T02:36:04 UTC por consultas de LEITURA ao catálogo do Postgres.
-- Só estrutura: nenhum dado de paciente. Serve de referência, NÃO é para executar;
-- o histórico executável está em supabase/migrations/.
-- 17 tabelas · 10 views · 24 funções · 19 enums · 34 migrações aplicadas.
-- ============================================================================

-- ---- extensões ----
--   pg_net 0.20.0 @extensions
--   pg_stat_statements 1.11 @extensions
--   pg_trgm 1.6 @extensions
--   pgcrypto 1.3 @extensions
--   pgmq 1.5.1 @pgmq
--   plpgsql 1.0 @pg_catalog
--   supabase_vault 0.3.1 @vault
--   uuid-ossp 1.1 @extensions
--   vector 0.8.0 @extensions
--   wrappers 0.6.0 @extensions

-- ---- enums ----
create type public.antibiograma_resultado_enum as enum ('S', 'I', 'R');
create type public.comparador_enum as enum ('lt', 'lte', 'gt', 'gte');
create type public.desfecho_internacao_enum as enum ('alta_uti', 'alta_hospitalar', 'obito', 'transferencia');
create type public.dispositivo_motivo_fim_enum as enum ('eletivo', 'infeccao', 'troca', 'disfuncao', 'alta', 'obito', 'outro');
create type public.dispositivo_tipo_enum as enum ('iot', 'traqueo', 'cvc', 'picc', 'arterial', 'svd', 'sne', 'sng', 'dreno', 'gtt', 'trr', 'marca_passo', 'outro');
create type public.fonte_evento_enum as enum ('manual', 'gemini_ocr', 'claude_ocr', 'appsheet', 'auto_trigger', 'edge_function', 'api_import');
create type public.gravidade_enum as enum ('estavel', 'watcher', 'instavel', 'critico');
create type public.intencao_atb_enum as enum ('empirica', 'dirigida', 'profilatica');
create type public.isolamento_enum as enum ('none', 'contact', 'droplet', 'aerosol');
create type public.material_cultura_enum as enum ('hemocultura', 'urocultura', 'aspirado_traqueal', 'lavado_bal', 'lcr', 'secrecao_ferida', 'liquido_peritoneal', 'liquido_pleural', 'outro');
create type public.plantao_enum as enum ('manha', 'tarde', 'noite', 'plantao_24h');
create type public.severidade_alerta_enum as enum ('info', 'warning', 'critical');
create type public.severidade_visual_enum as enum ('red', 'yellow', 'green');
create type public.status_leito_enum as enum ('ativo', 'alta', 'obito', 'transferencia');
create type public.tipo_nota_enum as enum ('admissao', 'seriada', 'alta', 'andar');
create type public.trend_modo_enum as enum ('subida_abs', 'subida_rel', 'queda_abs');
create type public.turno_enum as enum ('diurna', 'noturna');
create type public.uti_enum as enum ('UTI2', 'UTI3', 'UTI4');
create type public.via_atb_enum as enum ('EV', 'VO', 'IM', 'SC', 'SNE', 'SNG', 'IT', 'Tópico');

-- ---- alert_rules ----
create table public.alert_rules
(
  id                       uuid default gen_random_uuid() not null,
  ativo                    boolean default true not null,
  tipo_evento              text not null,
  comparador               comparador_enum not null,
  limiar                   numeric not null,
  severidade               severidade_alerta_enum not null,
  rotulo                   text not null,
  mensagem                 text not null,
  fonte                    text,
  ordem                    integer default 100 not null,
  created_at               timestamp with time zone default now() not null,
  constraint alert_rules_tipo_fk FOREIGN KEY (tipo_evento) REFERENCES evento_tipo_ref(codigo) NOT VALID,
  constraint alert_rules_pkey PRIMARY KEY (id),
  constraint alert_rules_rotulo_key UNIQUE (rotulo)
);
alter table public.alert_rules enable row level security;
create policy "alert_rules_auth" on public.alert_rules as permissive for all to authenticated using (true) with check (true);
create policy "dev_bypass" on public.alert_rules as permissive for all to public using (true) with check (true);
-- acesso anon:DELETE,INSERT,SELECT,UPDATE
-- acesso authenticated:DELETE,INSERT,SELECT,UPDATE

-- ---- alerts_log ----
create table public.alerts_log
(
  id                       uuid default gen_random_uuid() not null,
  paciente_id              uuid not null,
  evento_id                uuid,
  user_id                  uuid,
  tipo                     text not null,
  severidade               severidade_alerta_enum default 'warning'::severidade_alerta_enum not null,
  mensagem                 text not null,
  payload                  jsonb,
  hash_key                 text not null,
  acked                    boolean default false not null,
  acked_at                 timestamp with time zone,
  acked_by                 uuid,
  created_at               timestamp with time zone default now() not null,
  constraint alerts_log_acked_by_fkey FOREIGN KEY (acked_by) REFERENCES auth.users(id),
  constraint alerts_log_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES eventos_clinicos(id) ON DELETE SET NULL,
  constraint alerts_log_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  constraint alerts_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  constraint alerts_log_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_alerts_log_acked_by ON public.alerts_log USING btree (acked_by);
CREATE INDEX idx_alerts_log_evento_id ON public.alerts_log USING btree (evento_id);
CREATE INDEX idx_alerts_log_user_id ON public.alerts_log USING btree (user_id);
CREATE INDEX idx_alerts_pac_ack ON public.alerts_log USING btree (paciente_id, acked, created_at DESC);
CREATE INDEX idx_alerts_severidade ON public.alerts_log USING btree (severidade, created_at DESC) WHERE (acked = false);
CREATE UNIQUE INDEX uq_alerts_hash ON public.alerts_log USING btree (hash_key);
alter table public.alerts_log enable row level security;
create policy "alerts_log_owner" on public.alerts_log as permissive for all to authenticated using ((user_id = ( SELECT auth.uid() AS uid))) with check ((user_id = ( SELECT auth.uid() AS uid)));
create policy "dev_bypass" on public.alerts_log as permissive for all to public using (true) with check (true);
-- acesso anon:DELETE,INSERT,SELECT,UPDATE
-- acesso authenticated:DELETE,INSERT,SELECT,UPDATE

-- ---- antibiograma ----
create table public.antibiograma
(
  id                       uuid default gen_random_uuid() not null,
  cultura_id               uuid not null,
  antibiotico              text not null,
  resultado                antibiograma_resultado_enum not null,
  cim                      numeric,
  created_at               timestamp with time zone default now() not null,
  constraint antibiograma_cultura_id_fkey FOREIGN KEY (cultura_id) REFERENCES culturas(id) ON DELETE CASCADE,
  constraint antibiograma_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_antibiograma_cultura ON public.antibiograma USING btree (cultura_id);
CREATE UNIQUE INDEX uq_antibiograma_cultura_atb ON public.antibiograma USING btree (cultura_id, antibiotico);
alter table public.antibiograma enable row level security;
create policy "antibiograma_auth" on public.antibiograma as permissive for all to authenticated using (true) with check (true);
create policy "dev_bypass" on public.antibiograma as permissive for all to public using (true) with check (true);
-- acesso anon:DELETE,INSERT,SELECT,UPDATE
-- acesso authenticated:DELETE,INSERT,SELECT,UPDATE

-- ---- atbs ----
create table public.atbs
(
  id                       uuid default gen_random_uuid() not null,
  paciente_id              uuid not null,
  user_id                  uuid,
  droga                    text not null,
  dose                     text,
  via                      via_atb_enum,
  frequencia               text,
  data_inicio              date default CURRENT_DATE not null,
  data_fim                 date,
  intencao                 intencao_atb_enum,
  foco                     text,
  agente_alvo              text,
  motivo_suspensao         text,
  created_at               timestamp with time zone default now() not null,
  updated_at               timestamp with time zone default now() not null,
  duracao_planejada_dias   integer, -- Meta de duracao do curso ATB (ex: 7d). null = nao definida. D-day = current_date - data_inicio (ver vw_dias_atb_ativo).
  internacao_id            uuid,
  constraint chk_atb_datas_coerentes CHECK (((data_fim IS NULL) OR (data_fim >= data_inicio))),
  constraint atbs_internacao_id_fkey FOREIGN KEY (internacao_id) REFERENCES internacoes(id) ON DELETE SET NULL,
  constraint atbs_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  constraint atbs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  constraint atbs_pkey PRIMARY KEY (id)
);
CREATE INDEX atbs_internacao_idx ON public.atbs USING btree (internacao_id);
CREATE INDEX idx_atbs_droga ON public.atbs USING btree (droga);
CREATE INDEX idx_atbs_pac_ativo ON public.atbs USING btree (paciente_id, data_inicio DESC) WHERE (data_fim IS NULL);
CREATE INDEX idx_atbs_user_id ON public.atbs USING btree (user_id);
alter table public.atbs enable row level security;
create policy "atbs_owner" on public.atbs as permissive for all to authenticated using ((user_id = ( SELECT auth.uid() AS uid))) with check ((user_id = ( SELECT auth.uid() AS uid)));
create policy "dev_bypass" on public.atbs as permissive for all to public using (true) with check (true);
CREATE TRIGGER trg_refresh_dispositivos_atb AFTER INSERT OR DELETE OR UPDATE ON public.atbs FOR EACH ROW EXECUTE FUNCTION fn_trg_refresh_dispositivos();
CREATE TRIGGER trg_stamp_internacao BEFORE INSERT ON public.atbs FOR EACH ROW EXECUTE FUNCTION fn_stamp_internacao();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.atbs FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
-- acesso anon:DELETE,INSERT,SELECT,UPDATE
-- acesso authenticated:DELETE,INSERT,SELECT,UPDATE

-- ---- avisos_agentes ----
-- LEIA ANTES DE QUALQUER TAREFA NO REPO SASI-V3. Avisos operacionais deixados por sessões com acesso ao banco mas sem escrita no GitHub. Marcar resolvido=true ao cumprir.
create table public.avisos_agentes
(
  id                       integer default nextval('avisos_agentes_id_seq'::regclass) not null,
  criado_em                timestamp with time zone default now() not null,
  titulo                   text not null,
  corpo                    text not null,
  resolvido                boolean default false not null,
  constraint avisos_agentes_pkey PRIMARY KEY (id)
);
alter table public.avisos_agentes enable row level security;
create policy "avisos_agentes_auth" on public.avisos_agentes as permissive for all to authenticated using (true) with check (true);
create policy "dev_bypass" on public.avisos_agentes as permissive for all to public using (true) with check (true);
-- acesso anon:DELETE,INSERT,SELECT,UPDATE
-- acesso authenticated:DELETE,INSERT,SELECT,UPDATE

-- ---- culturas ----
create table public.culturas
(
  id                       uuid default gen_random_uuid() not null,
  paciente_id              uuid not null,
  user_id                  uuid,
  material                 material_cultura_enum not null,
  coleta_ts                timestamp with time zone not null,
  laudo_ts                 timestamp with time zone,
  crescimento              boolean default false not null,
  agente                   text,
  ufc_por_ml               numeric,
  observacoes              text,
  created_at               timestamp with time zone default now() not null,
  updated_at               timestamp with time zone default now() not null,
  internacao_id            uuid,
  constraint chk_cultura_laudo_apos_coleta CHECK (((laudo_ts IS NULL) OR (laudo_ts >= coleta_ts))),
  constraint culturas_internacao_id_fkey FOREIGN KEY (internacao_id) REFERENCES internacoes(id) ON DELETE SET NULL,
  constraint culturas_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  constraint culturas_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  constraint culturas_pkey PRIMARY KEY (id)
);
CREATE INDEX culturas_internacao_idx ON public.culturas USING btree (internacao_id);
CREATE INDEX idx_culturas_agente ON public.culturas USING btree (agente) WHERE (agente IS NOT NULL);
CREATE INDEX idx_culturas_pac_coleta ON public.culturas USING btree (paciente_id, coleta_ts DESC);
CREATE INDEX idx_culturas_user_id ON public.culturas USING btree (user_id);
alter table public.culturas enable row level security;
create policy "culturas_owner" on public.culturas as permissive for all to authenticated using ((user_id = ( SELECT auth.uid() AS uid))) with check ((user_id = ( SELECT auth.uid() AS uid)));
create policy "dev_bypass" on public.culturas as permissive for all to public using (true) with check (true);
CREATE TRIGGER trg_stamp_internacao BEFORE INSERT ON public.culturas FOR EACH ROW EXECUTE FUNCTION fn_stamp_internacao();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.culturas FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
-- acesso anon:DELETE,INSERT,SELECT,UPDATE
-- acesso authenticated:DELETE,INSERT,SELECT,UPDATE

-- ---- dispositivo_episodios ----
-- Um registro por dispositivo por janela de uso. Render: aberto = "sim (dd/mm)", fechado = "não (dd/mm a dd/mm)". Dias de uso = hoje − data_inicio (nunca digitado).
create table public.dispositivo_episodios
(
  id                       uuid default gen_random_uuid() not null,
  paciente_id              uuid not null,
  internacao_id            uuid,
  user_id                  uuid,
  tipo                     dispositivo_tipo_enum not null,
  sitio                    text,
  data_inicio              date not null,
  data_fim                 date,
  motivo_fim               dispositivo_motivo_fim_enum,
  observacoes              text,
  source_text              text,
  created_at               timestamp with time zone default now() not null,
  updated_at               timestamp with time zone default now() not null,
  constraint dispositivo_janela_chk CHECK (((data_fim IS NULL) OR (data_fim >= data_inicio))),
  constraint dispositivo_motivo_chk CHECK (((motivo_fim IS NULL) OR (data_fim IS NOT NULL))),
  constraint dispositivo_episodios_internacao_id_fkey FOREIGN KEY (internacao_id) REFERENCES internacoes(id) ON DELETE SET NULL,
  constraint dispositivo_episodios_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  constraint dispositivo_episodios_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  constraint dispositivo_episodios_pkey PRIMARY KEY (id)
);
CREATE INDEX dispositivo_epis_abertos_idx ON public.dispositivo_episodios USING btree (paciente_id) WHERE (data_fim IS NULL);
CREATE INDEX dispositivo_epis_paciente_idx ON public.dispositivo_episodios USING btree (paciente_id, tipo);
alter table public.dispositivo_episodios enable row level security;
create policy "dev_bypass" on public.dispositivo_episodios as permissive for all to public using (true) with check (true);
create policy "dispositivo_episodios_owner" on public.dispositivo_episodios as permissive for all to authenticated using ((user_id = ( SELECT auth.uid() AS uid))) with check ((user_id = ( SELECT auth.uid() AS uid)));
CREATE TRIGGER trg_refresh_dispositivos AFTER INSERT OR DELETE OR UPDATE ON public.dispositivo_episodios FOR EACH ROW EXECUTE FUNCTION fn_trg_refresh_dispositivos();
CREATE TRIGGER trg_stamp_internacao BEFORE INSERT ON public.dispositivo_episodios FOR EACH ROW EXECUTE FUNCTION fn_stamp_internacao();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.dispositivo_episodios FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
-- acesso anon:DELETE,INSERT,SELECT,UPDATE
-- acesso authenticated:DELETE,INSERT,SELECT,UPDATE

-- ---- evento_tipo_ref ----
-- Dimensao que governa eventos_clinicos.tipo. faixa_min/max = flags de absurdo fisiologico (doutrina/sanity-checks). loinc_code = mapeamento FHIR (so 5 vitais verificados; resto fase 2 — ZERO ALUCINACAO).
create table public.evento_tipo_ref
(
  codigo                   text not null,
  categoria                text not null,
  rotulo                   text not null,
  unidade_padrao           text,
  faixa_min                numeric,
  faixa_max                numeric,
  loinc_code               text,
  ativo                    boolean default true not null,
  ordem                    integer default 100 not null,
  constraint evento_tipo_ref_pkey PRIMARY KEY (codigo)
);
alter table public.evento_tipo_ref enable row level security;
create policy "dev_bypass" on public.evento_tipo_ref as permissive for all to public using (true) with check (true);
create policy "evento_tipo_ref_read" on public.evento_tipo_ref as permissive for select to anon, authenticated using (true);
-- acesso anon:DELETE,INSERT,SELECT,UPDATE
-- acesso authenticated:DELETE,INSERT,SELECT,UPDATE

-- ---- eventos_clinicos ----
create table public.eventos_clinicos
(
  id                       uuid default gen_random_uuid() not null,
  paciente_id              uuid not null,
  evolucao_id              uuid,
  user_id                  uuid,
  ts                       timestamp with time zone not null,
  tipo                     text not null,
  valor_num                numeric,
  valor_json               jsonb,
  unidade                  text,
  fonte                    fonte_evento_enum not null,
  confidence               numeric(3,2),
  source_text              text,
  requires_review          boolean default false not null,
  created_at               timestamp with time zone default now() not null,
  internacao_id            uuid,
  constraint chk_eventos_valor_not_empty CHECK (((valor_num IS NOT NULL) OR (valor_json IS NOT NULL))),
  constraint eventos_clinicos_confidence_check CHECK (((confidence >= (0)::numeric) AND (confidence <= (1)::numeric))),
  constraint eventos_confidence_check CHECK (((confidence >= (0)::numeric) AND (confidence <= (1)::numeric))),
  constraint eventos_clinicos_evolucao_id_fkey FOREIGN KEY (evolucao_id) REFERENCES evolucoes(id) ON DELETE SET NULL,
  constraint eventos_clinicos_internacao_id_fkey FOREIGN KEY (internacao_id) REFERENCES internacoes(id) ON DELETE SET NULL,
  constraint eventos_clinicos_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  constraint eventos_clinicos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  constraint eventos_tipo_fk FOREIGN KEY (tipo) REFERENCES evento_tipo_ref(codigo),
  constraint eventos_clinicos_pkey PRIMARY KEY (id)
);
CREATE INDEX eventos_clinicos_internacao_idx ON public.eventos_clinicos USING btree (internacao_id);
CREATE INDEX idx_eventos_clinicos_user_id ON public.eventos_clinicos USING btree (user_id);
CREATE INDEX idx_eventos_evolucao ON public.eventos_clinicos USING btree (evolucao_id) WHERE (evolucao_id IS NOT NULL);
CREATE INDEX idx_eventos_pac_tipo_ts ON public.eventos_clinicos USING btree (paciente_id, tipo, ts DESC);
CREATE INDEX idx_eventos_pac_ts ON public.eventos_clinicos USING btree (paciente_id, ts DESC);
CREATE INDEX idx_eventos_review ON public.eventos_clinicos USING btree (requires_review, created_at DESC) WHERE (requires_review = true);
CREATE INDEX idx_eventos_tipo_ts ON public.eventos_clinicos USING btree (tipo, ts DESC);
alter table public.eventos_clinicos enable row level security;
create policy "dev_bypass" on public.eventos_clinicos as permissive for all to public using (true) with check (true);
create policy "eventos_clinicos_owner" on public.eventos_clinicos as permissive for all to authenticated using ((user_id = ( SELECT auth.uid() AS uid))) with check ((user_id = ( SELECT auth.uid() AS uid)));
CREATE TRIGGER trg_autoflag_lowconf BEFORE INSERT ON public.eventos_clinicos FOR EACH ROW EXECUTE FUNCTION fn_autoflag_lowconf();
CREATE TRIGGER trg_eval_alert AFTER INSERT ON public.eventos_clinicos FOR EACH ROW EXECUTE FUNCTION fn_eval_alert();
CREATE TRIGGER trg_eval_trend AFTER INSERT ON public.eventos_clinicos FOR EACH ROW EXECUTE FUNCTION fn_eval_trend();
CREATE TRIGGER trg_stamp_internacao BEFORE INSERT ON public.eventos_clinicos FOR EACH ROW EXECUTE FUNCTION fn_stamp_internacao();
-- acesso anon:DELETE,INSERT,SELECT,UPDATE
-- acesso authenticated:DELETE,INSERT,SELECT,UPDATE

-- ---- evolucoes ----
create table public.evolucoes
(
  id                       uuid default gen_random_uuid() not null,
  paciente_id              uuid not null,
  user_id                  uuid,
  data_evolucao            timestamp with time zone default now() not null,
  plantao                  plantao_enum default 'manha'::plantao_enum not null, -- LEGADO: manha/tarde/noite/plantao_24h. Fonte da verdade agora é turno + data_plantao.
  neuro                    jsonb default '{}'::jsonb not null,
  resp                     jsonb default '{}'::jsonb not null,
  hemo                     jsonb default '{}'::jsonb not null,
  tgi                      jsonb default '{}'::jsonb not null,
  renal                    jsonb default '{}'::jsonb not null,
  hemato                   jsonb default '{}'::jsonb not null,
  infecto                  jsonb default '{}'::jsonb not null,
  dvas                     jsonb default '[]'::jsonb not null,
  sedativos                jsonb default '[]'::jsonb not null,
  impressao                text[] default '{}'::text[] not null,
  conduta                  text[] default '{}'::text[] not null,
  sofa_snapshot            jsonb,
  sofa_total               integer,
  created_at               timestamp with time zone default now() not null,
  updated_at               timestamp with time zone default now() not null,
  prescricao               jsonb default '{}'::jsonb, -- Kardex/prescricao vigente estruturada por categoria (cardiovascular, snc, gastro_endocrino, infeccioso_resp, sintomaticos_sn, solucoes_diureticos, nutricao). Cada categoria e um array de strings com a prescricao.
  problemas_ativos         jsonb default '[]'::jsonb not null, -- SASI v2.0 — problemas ativos estruturados [{texto, sistema?, gravidade?}]
  condutas_sistemas        jsonb default '[]'::jsonb not null, -- SASI v2.0 — condutas por sistema [{sistema, texto, meta?, prazo?}]
  riscos                   jsonb default '[]'::jsonb not null, -- SASI v2.0 — riscos clínicos [{texto, nivel?}]
  internacao_id            uuid,
  tipo_nota                tipo_nota_enum default 'seriada'::tipo_nota_enum not null,
  data_plantao             date not null, -- Data do PLANTÃO (título da nota), não do registro. Noturna iniciada de madrugada pertence ao dia anterior.
  turno                    turno_enum not null, -- Turno real de 12h: diurna (07-19h) | noturna (19-07h). Substitui plantao (manha/tarde/noite/24h), mantido como legado.
  autor_crm                text,
  autor_nome               text,
  illness_severity         gravidade_enum, -- Illness severity DESTA nota (a de pacientes.gravidade é o estado corrente do leito).
  finalizada_em            timestamp with time zone, -- Fechamento da nota (corpus: rascunho fica aberto de minutos a 24h). data_evolucao/created_at = abertura.
  intercorrencias          text[] default '{}'::text[] not null, -- Intercorrencias 24h da nota: so o que MUDOU no periodo, verbos de acao, um item por linha. Secao do TEMPLATE-BASE v2; eixo TEMPO (nao repetir exame fisico nem impressao).
  constraint evolucoes_sofa_total_check CHECK (((sofa_total >= 0) AND (sofa_total <= 24))),
  constraint evolucoes_internacao_id_fkey FOREIGN KEY (internacao_id) REFERENCES internacoes(id) ON DELETE SET NULL,
  constraint evolucoes_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  constraint evolucoes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  constraint evolucoes_pkey PRIMARY KEY (id)
);
CREATE INDEX evolucoes_internacao_idx ON public.evolucoes USING btree (internacao_id);
CREATE INDEX evolucoes_plantao_idx ON public.evolucoes USING btree (paciente_id, data_plantao DESC, turno);
CREATE INDEX idx_evolucoes_dvas_gin ON public.evolucoes USING gin (dvas);
CREATE INDEX idx_evolucoes_infecto_gin ON public.evolucoes USING gin (infecto);
CREATE INDEX idx_evolucoes_paciente_data ON public.evolucoes USING btree (paciente_id, data_evolucao DESC);
CREATE INDEX idx_evolucoes_user ON public.evolucoes USING btree (user_id);
alter table public.evolucoes enable row level security;
create policy "dev_bypass" on public.evolucoes as permissive for all to public using (true) with check (true);
create policy "evolucoes_owner" on public.evolucoes as permissive for all to authenticated using ((user_id = ( SELECT auth.uid() AS uid))) with check ((user_id = ( SELECT auth.uid() AS uid)));
CREATE TRIGGER trg_evolucao_relogios BEFORE INSERT ON public.evolucoes FOR EACH ROW EXECUTE FUNCTION fn_evolucao_relogios();
CREATE TRIGGER trg_refresh_dispositivos_evol AFTER INSERT OR UPDATE ON public.evolucoes FOR EACH ROW EXECUTE FUNCTION fn_trg_refresh_dispositivos();
CREATE TRIGGER trg_sofa_cache_invalidate BEFORE UPDATE ON public.evolucoes FOR EACH ROW EXECUTE FUNCTION fn_invalidate_sofa_cache();
CREATE TRIGGER trg_stamp_internacao BEFORE INSERT ON public.evolucoes FOR EACH ROW EXECUTE FUNCTION fn_stamp_internacao();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.evolucoes FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
-- acesso anon:DELETE,INSERT,SELECT,UPDATE
-- acesso authenticated:DELETE,INSERT,SELECT,UPDATE

-- ---- ingest_audit_log ----
create table public.ingest_audit_log
(
  id                       uuid default gen_random_uuid() not null,
  user_id                  uuid,
  paciente_id              uuid,
  source_type              text,
  fonte                    text,
  payload_raw              jsonb,
  response                 jsonb,
  eventos_ids              uuid[],
  warnings                 text[],
  ok                       boolean not null,
  error_msg                text,
  created_at               timestamp with time zone default now() not null,
  constraint ingest_audit_log_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE SET NULL,
  constraint ingest_audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  constraint ingest_audit_log_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_ingest_audit_falhas ON public.ingest_audit_log USING btree (created_at DESC) WHERE (ok = false);
CREATE INDEX idx_ingest_audit_log_user_id ON public.ingest_audit_log USING btree (user_id);
CREATE INDEX idx_ingest_audit_pac ON public.ingest_audit_log USING btree (paciente_id, created_at DESC);
alter table public.ingest_audit_log enable row level security;
create policy "dev_bypass" on public.ingest_audit_log as permissive for all to public using (true) with check (true);
create policy "ingest_audit_log_owner" on public.ingest_audit_log as permissive for all to authenticated using ((user_id = ( SELECT auth.uid() AS uid))) with check ((user_id = ( SELECT auth.uid() AS uid)));
-- acesso anon:DELETE,INSERT,SELECT,UPDATE
-- acesso authenticated:DELETE,INSERT,SELECT,UPDATE

-- ---- internacoes ----
-- Episódio de internação (hospital + UTI). NULL em desfecho = em curso. Reinternações encadeiam via internacao_prev_id. Substitui o modelo de episódio único de pacientes.data_adm (mantida como legado).
create table public.internacoes
(
  id                       uuid default gen_random_uuid() not null,
  paciente_id              uuid not null,
  user_id                  uuid,
  int_origem_data          date,
  int_uti_data             date not null,
  uti                      uti_enum,
  reinternacao             boolean default false not null,
  internacao_prev_id       uuid,
  desfecho                 desfecho_internacao_enum,
  desfecho_data            date,
  destino_setor            text,
  destino_especialidade    text,
  observacoes              text,
  created_at               timestamp with time zone default now() not null,
  updated_at               timestamp with time zone default now() not null,
  constraint internacoes_datas_chk CHECK (((int_origem_data IS NULL) OR (int_origem_data <= int_uti_data))),
  constraint internacoes_desfecho_data_chk CHECK (((desfecho_data IS NULL) OR (desfecho_data >= int_uti_data))),
  constraint internacoes_internacao_prev_id_fkey FOREIGN KEY (internacao_prev_id) REFERENCES internacoes(id),
  constraint internacoes_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  constraint internacoes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  constraint internacoes_pkey PRIMARY KEY (id)
);
CREATE INDEX internacoes_paciente_idx ON public.internacoes USING btree (paciente_id, int_uti_data DESC);
CREATE UNIQUE INDEX internacoes_uma_aberta_por_paciente ON public.internacoes USING btree (paciente_id) WHERE (desfecho IS NULL);
alter table public.internacoes enable row level security;
create policy "dev_bypass" on public.internacoes as permissive for all to public using (true) with check (true);
create policy "internacoes_owner" on public.internacoes as permissive for all to authenticated using ((user_id = ( SELECT auth.uid() AS uid))) with check ((user_id = ( SELECT auth.uid() AS uid)));
CREATE TRIGGER trg_internacao_reinternacao BEFORE INSERT ON public.internacoes FOR EACH ROW EXECUTE FUNCTION fn_internacao_reinternacao();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.internacoes FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
-- acesso anon:DELETE,INSERT,SELECT,UPDATE
-- acesso authenticated:DELETE,INSERT,SELECT,UPDATE

-- ---- janelas_24h ----
-- Agregado de janela de sinais vitais/glicemia: max-min + contagem de excursões. É a forma nativa da nota ("PAM 90-56 (4/12 <65)"). Decisão 10/08/26: só o agregado é ingerido, sem aferições brutas.
create table public.janelas_24h
(
  id                       uuid default gen_random_uuid() not null,
  paciente_id              uuid not null,
  internacao_id            uuid,
  evolucao_id              uuid,
  user_id                  uuid,
  tipo                     text not null,
  janela_inicio            timestamp with time zone not null,
  janela_fim               timestamp with time zone not null,
  valor_max                numeric,
  valor_min                numeric,
  n_total                  smallint default 12 not null,
  n_fora_alto              smallint,
  n_fora_baixo             smallint,
  limiar_alto              numeric,
  limiar_baixo             numeric,
  fonte                    fonte_evento_enum default 'manual'::fonte_evento_enum not null,
  confidence               numeric,
  source_text              text,
  requires_review          boolean default false not null,
  created_at               timestamp with time zone default now() not null,
  constraint janela_limiar_chk CHECK ((((n_fora_alto IS NULL) OR (n_fora_alto = 0) OR (limiar_alto IS NOT NULL)) AND ((n_fora_baixo IS NULL) OR (n_fora_baixo = 0) OR (limiar_baixo IS NOT NULL)))),
  constraint janela_minmax_chk CHECK (((valor_max IS NULL) OR (valor_min IS NULL) OR (valor_max >= valor_min))),
  constraint janela_n_chk CHECK ((((n_fora_alto IS NULL) OR (n_fora_alto <= n_total)) AND ((n_fora_baixo IS NULL) OR (n_fora_baixo <= n_total)))),
  constraint janela_ordem_chk CHECK ((janela_fim > janela_inicio)),
  constraint janelas_24h_confidence_check CHECK (((confidence >= (0)::numeric) AND (confidence <= (1)::numeric))),
  constraint janelas_24h_evolucao_id_fkey FOREIGN KEY (evolucao_id) REFERENCES evolucoes(id) ON DELETE SET NULL,
  constraint janelas_24h_internacao_id_fkey FOREIGN KEY (internacao_id) REFERENCES internacoes(id) ON DELETE SET NULL,
  constraint janelas_24h_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  constraint janelas_24h_tipo_fkey FOREIGN KEY (tipo) REFERENCES evento_tipo_ref(codigo),
  constraint janelas_24h_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  constraint janelas_24h_pkey PRIMARY KEY (id),
  constraint janela_unica UNIQUE (paciente_id, tipo, janela_fim)
);
CREATE INDEX janelas_evolucao_idx ON public.janelas_24h USING btree (evolucao_id);
CREATE INDEX janelas_paciente_idx ON public.janelas_24h USING btree (paciente_id, tipo, janela_fim DESC);
alter table public.janelas_24h enable row level security;
create policy "dev_bypass" on public.janelas_24h as permissive for all to public using (true) with check (true);
create policy "janelas_24h_owner" on public.janelas_24h as permissive for all to authenticated using ((user_id = ( SELECT auth.uid() AS uid))) with check ((user_id = ( SELECT auth.uid() AS uid)));
CREATE TRIGGER trg_stamp_internacao BEFORE INSERT ON public.janelas_24h FOR EACH ROW EXECUTE FUNCTION fn_stamp_internacao();
-- acesso anon:DELETE,INSERT,SELECT,UPDATE
-- acesso authenticated:DELETE,INSERT,SELECT,UPDATE

-- ---- memorias ----
create table public.memorias
(
  id                       bigint not null,
  conteudo                 text not null,
  metadata                 jsonb,
  embedding                vector(768),
  created_at               timestamp with time zone default now(),
  user_id                  uuid,
  constraint memorias_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  constraint memorias_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_memorias_user ON public.memorias USING btree (user_id);
CREATE INDEX memorias_embedding_hnsw_idx ON public.memorias USING hnsw (embedding vector_cosine_ops);
alter table public.memorias enable row level security;
create policy "dev_bypass" on public.memorias as permissive for all to public using (true) with check (true);
create policy "memorias_delete" on public.memorias as permissive for delete to authenticated using ((( SELECT auth.uid() AS uid) = user_id));
create policy "memorias_insert" on public.memorias as permissive for insert to authenticated with check ((( SELECT auth.uid() AS uid) = user_id));
create policy "memorias_select" on public.memorias as permissive for select to authenticated using ((( SELECT auth.uid() AS uid) = user_id));
create policy "memorias_update" on public.memorias as permissive for update to authenticated using ((( SELECT auth.uid() AS uid) = user_id)) with check ((( SELECT auth.uid() AS uid) = user_id));
-- acesso anon:DELETE,INSERT,SELECT,UPDATE
-- acesso authenticated:DELETE,INSERT,SELECT,UPDATE

-- ---- pacientes ----
create table public.pacientes
(
  id                       uuid default gen_random_uuid() not null,
  user_id                  uuid,
  leito                    text not null,
  uti                      uti_enum not null,
  nome                     text not null,
  idade                    integer,
  peso                     numeric(5,2),
  altura                   numeric(5,2),
  hd                       text,
  data_adm                 date default CURRENT_DATE not null, -- LEGADO: data de admissão do episódio único. Fonte da verdade agora é internacoes (int_origem_data / int_uti_data). Mantida para compatibilidade do app.
  alergias                 text,
  gravidade                gravidade_enum default 'estavel'::gravidade_enum not null, -- Illness severity da prática: estavel | watcher | instavel | critico. Desfecho (obito/alta/transf) vive em status_leito e internacoes.desfecho. Migrado em 10/08/26 (moderado→watcher, grave→instavel).
  status_leito             status_leito_enum default 'ativo'::status_leito_enum not null,
  sofa_baseline            integer,
  created_at               timestamp with time zone default now() not null,
  updated_at               timestamp with time zone default now() not null,
  dispositivos             jsonb default '{}'::jsonb not null, -- DERIVADO (não editar à mão — decisão 10/08/26): recalculado por fn_refresh_dispositivos a partir de dispositivo_episodios + atbs ativos + dvas/sedativos da última evolução. Chaves legadas {mv,dva,sed,atb,cvc,trr} + novas {picc,arterial,svd,sne_sng,dreno,gtt}.
  isolation                isolamento_enum default 'none'::isolamento_enum not null, -- Precaução de isolamento: none | contact | droplet | aerosol
  out_of_range_count       integer default 0 not null, -- Nº de parâmetros fora do range clínico
  severidade_visual        severidade_visual_enum default 'green'::severidade_visual_enum not null, -- Semáforo clínico: red | yellow | green
  patient_summary          jsonb default '{}'::jsonb, -- Patient Summary (SASI) — resumo persistente da admissão com dispositivos, HPMA, plano terapêutico/metas. Atualizado a cada evolução pontual.
  imc                      numeric generated always as (round((peso / ((altura / (100)::numeric) * (altura / (100)::numeric))), 1)) stored, -- IMC calculado: peso / altura^2. Coluna gerada (STORED), atualiza sozinha.
  riscos_flags             jsonb default '{}'::jsonb not null, -- Flags de risco binarias: {pav,broncoaspiracao,upp,queda,diabetico}. CONTATO/isolamento vive em pacientes.isolation (uma fonte da verdade).
  constraint pacientes_altura_check CHECK (((altura >= (30)::numeric) AND (altura <= (250)::numeric))),
  constraint pacientes_idade_check CHECK (((idade >= 0) AND (idade <= 130))),
  constraint pacientes_nome_check CHECK (((char_length(nome) >= 1) AND (char_length(nome) <= 200))),
  constraint pacientes_peso_check CHECK (((peso >= (1)::numeric) AND (peso <= (400)::numeric))),
  constraint pacientes_sofa_baseline_check CHECK (((sofa_baseline >= 0) AND (sofa_baseline <= 24))),
  constraint pacientes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  constraint pacientes_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_pacientes_isolation ON public.pacientes USING btree (isolation) WHERE (isolation <> 'none'::isolamento_enum);
CREATE INDEX idx_pacientes_nome_trgm ON public.pacientes USING gin (nome gin_trgm_ops);
CREATE INDEX idx_pacientes_severidade ON public.pacientes USING btree (severidade_visual);
CREATE INDEX idx_pacientes_status ON public.pacientes USING btree (status_leito, updated_at DESC);
CREATE INDEX idx_pacientes_user ON public.pacientes USING btree (user_id);
CREATE UNIQUE INDEX uq_pacientes_leito_ativo ON public.pacientes USING btree (uti, leito) WHERE (status_leito = 'ativo'::status_leito_enum);
alter table public.pacientes enable row level security;
create policy "dev_bypass" on public.pacientes as permissive for all to public using (true) with check (true);
create policy "pacientes_owner" on public.pacientes as permissive for all to authenticated using ((user_id = ( SELECT auth.uid() AS uid))) with check ((user_id = ( SELECT auth.uid() AS uid)));
CREATE TRIGGER trg_paciente_internacao_ins AFTER INSERT ON public.pacientes FOR EACH ROW EXECUTE FUNCTION fn_paciente_internacao_sync();
CREATE TRIGGER trg_paciente_internacao_upd AFTER UPDATE ON public.pacientes FOR EACH ROW WHEN ((old.status_leito IS DISTINCT FROM new.status_leito)) EXECUTE FUNCTION fn_paciente_internacao_sync();
CREATE TRIGGER trg_severidade_on_insert BEFORE INSERT ON public.pacientes FOR EACH ROW EXECUTE FUNCTION fn_set_severidade_on_insert();
CREATE TRIGGER trg_sync_severidade_visual BEFORE UPDATE ON public.pacientes FOR EACH ROW EXECUTE FUNCTION sync_severidade_visual();
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.pacientes FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
-- acesso anon:DELETE,INSERT,SELECT,UPDATE
-- acesso authenticated:DELETE,INSERT,SELECT,UPDATE

-- ---- pendencias ----
create table public.pendencias
(
  id                       uuid default gen_random_uuid() not null,
  paciente_id              uuid not null,
  evolucao_id              uuid,
  user_id                  uuid,
  tarefa                   text not null,
  prioridade               smallint default 2 not null,
  concluida                boolean default false not null,
  concluida_at             timestamp with time zone,
  created_at               timestamp with time zone default now() not null,
  internacao_id            uuid,
  constraint pendencias_prioridade_check CHECK (((prioridade >= 1) AND (prioridade <= 3))),
  constraint pendencias_tarefa_check CHECK (((char_length(tarefa) >= 1) AND (char_length(tarefa) <= 500))),
  constraint pendencias_evolucao_id_fkey FOREIGN KEY (evolucao_id) REFERENCES evolucoes(id) ON DELETE SET NULL,
  constraint pendencias_internacao_id_fkey FOREIGN KEY (internacao_id) REFERENCES internacoes(id) ON DELETE SET NULL,
  constraint pendencias_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  constraint pendencias_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  constraint pendencias_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_pendencias_evolucao_id ON public.pendencias USING btree (evolucao_id);
CREATE INDEX idx_pendencias_pac_aberta ON public.pendencias USING btree (paciente_id) WHERE (concluida = false);
CREATE INDEX idx_pendencias_prioridade ON public.pendencias USING btree (prioridade, created_at) WHERE (concluida = false);
CREATE INDEX idx_pendencias_user_id ON public.pendencias USING btree (user_id);
CREATE INDEX pendencias_internacao_idx ON public.pendencias USING btree (internacao_id);
alter table public.pendencias enable row level security;
create policy "dev_bypass" on public.pendencias as permissive for all to public using (true) with check (true);
create policy "pendencias_owner" on public.pendencias as permissive for all to authenticated using ((user_id = ( SELECT auth.uid() AS uid))) with check ((user_id = ( SELECT auth.uid() AS uid)));
CREATE TRIGGER trg_stamp_internacao BEFORE INSERT ON public.pendencias FOR EACH ROW EXECUTE FUNCTION fn_stamp_internacao();
-- acesso anon:DELETE,INSERT,SELECT,UPDATE
-- acesso authenticated:DELETE,INSERT,SELECT,UPDATE

-- ---- trend_rules ----
create table public.trend_rules
(
  id                       uuid default gen_random_uuid() not null,
  ativo                    boolean default true not null,
  tipo_evento              text not null,
  modo                     trend_modo_enum not null,
  limiar                   numeric not null,
  janela_max_horas         integer,
  severidade               severidade_alerta_enum not null,
  rotulo                   text not null,
  mensagem                 text not null,
  fonte                    text,
  ordem                    integer default 100 not null,
  created_at               timestamp with time zone default now() not null,
  constraint trend_rules_tipo_fk FOREIGN KEY (tipo_evento) REFERENCES evento_tipo_ref(codigo) NOT VALID,
  constraint trend_rules_pkey PRIMARY KEY (id),
  constraint trend_rules_rotulo_key UNIQUE (rotulo)
);
alter table public.trend_rules enable row level security;
create policy "dev_bypass" on public.trend_rules as permissive for all to public using (true) with check (true);
create policy "trend_rules_auth" on public.trend_rules as permissive for all to authenticated using (true) with check (true);
-- acesso anon:DELETE,INSERT,SELECT,UPDATE
-- acesso authenticated:DELETE,INSERT,SELECT,UPDATE

-- ============================================================================
-- VIEWS
-- ============================================================================

create or replace view public.vw_alertas_abertos with (security_invoker=true) as
 SELECT al.paciente_id,
    p.uti,
    p.leito,
    p.nome,
    count(*) FILTER (WHERE al.severidade = 'critical'::severidade_alerta_enum) AS criticos,
    count(*) FILTER (WHERE al.severidade = 'warning'::severidade_alerta_enum) AS warnings,
    count(*) FILTER (WHERE al.severidade = 'info'::severidade_alerta_enum) AS infos,
    count(*) AS total
   FROM alerts_log al
     JOIN pacientes p ON p.id = al.paciente_id
  WHERE al.acked = false
  GROUP BY al.paciente_id, p.uti, p.leito, p.nome;

create or replace view public.vw_bh_acumulado with (security_invoker=true) as
 SELECT paciente_id,
    sum(
        CASE
            WHEN ts >= (now() - '24:00:00'::interval) THEN valor_num
            ELSE 0::numeric
        END) AS bh_24h,
    sum(
        CASE
            WHEN ts >= (now() - '48:00:00'::interval) THEN valor_num
            ELSE 0::numeric
        END) AS bh_48h,
    sum(
        CASE
            WHEN ts >= (now() - '72:00:00'::interval) THEN valor_num
            ELSE 0::numeric
        END) AS bh_72h,
    count(*) FILTER (WHERE ts >= (now() - '24:00:00'::interval)) AS eventos_24h
   FROM eventos_clinicos ec
  WHERE tipo = 'bh_h'::text
  GROUP BY paciente_id;

create or replace view public.vw_dashboard_uti with (security_invoker=true) as
 WITH ultima_evol AS (
         SELECT DISTINCT ON (e.paciente_id) e.paciente_id,
            e.id AS evolucao_id,
            e.data_evolucao AS ultima_evolucao,
            e.sofa_total,
            e.sofa_snapshot,
            e.dvas,
            e.sedativos
           FROM evolucoes e
          ORDER BY e.paciente_id, e.data_evolucao DESC
        ), sofa_24h_atras AS (
         SELECT DISTINCT ON (ec.paciente_id) ec.paciente_id,
            ec.valor_num AS sofa_total_24h
           FROM eventos_clinicos ec
          WHERE ec.tipo = 'sofa_total'::text AND ec.ts <= (now() - '24:00:00'::interval)
          ORDER BY ec.paciente_id, ec.ts DESC
        ), pend_abertas AS (
         SELECT pendencias.paciente_id,
            count(*)::integer AS pendencias_abertas
           FROM pendencias
          WHERE pendencias.concluida = false
          GROUP BY pendencias.paciente_id
        )
 SELECT p.id AS paciente_id,
    p.user_id,
    p.leito,
    p.uti,
    p.nome,
    p.idade,
    p.peso,
    p.hd,
    p.gravidade,
    p.status_leito,
    p.data_adm,
    CURRENT_DATE - p.data_adm AS dias_internacao,
    u.evolucao_id,
    u.ultima_evolucao,
    u.sofa_total,
    u.sofa_snapshot,
    u.dvas,
    u.sedativos,
    (u.sofa_total::numeric - s24.sofa_total_24h)::integer AS delta_sofa_24h,
    COALESCE(pa.pendencias_abertas, 0) AS pendencias_abertas,
    p.dispositivos,
    p.isolation,
    p.out_of_range_count,
    p.severidade_visual
   FROM pacientes p
     LEFT JOIN ultima_evol u ON u.paciente_id = p.id
     LEFT JOIN sofa_24h_atras s24 ON s24.paciente_id = p.id
     LEFT JOIN pend_abertas pa ON pa.paciente_id = p.id
  WHERE p.status_leito = 'ativo'::status_leito_enum;

create or replace view public.vw_dias_atb_ativo with (security_invoker=true) as
 SELECT paciente_id,
    id AS atb_id,
    droga,
    via,
    frequencia,
    data_inicio,
    intencao,
    foco,
    agente_alvo,
    CURRENT_DATE - data_inicio + 1 AS dias_terapia,
        CASE
            WHEN (CURRENT_DATE - data_inicio + 1) >= 14 THEN 'critical'::text
            WHEN (CURRENT_DATE - data_inicio + 1) >= 7 THEN 'warning'::text
            ELSE 'ok'::text
        END AS stewardship_flag
   FROM atbs a
  WHERE data_fim IS NULL;

create or replace view public.vw_dispositivos_ativos with (security_invoker=true) as
 SELECT paciente_id,
    internacao_id,
    id AS episodio_id,
    tipo,
    sitio,
    data_inicio,
    CURRENT_DATE - data_inicio + 1 AS dias_em_uso
   FROM dispositivo_episodios de
  WHERE data_fim IS NULL;

create or replace view public.vw_eventos_pendentes_revisao with (security_invoker=true) as
 SELECT id,
    paciente_id,
    evolucao_id,
    user_id,
    ts,
    tipo,
    valor_num,
    valor_json,
    unidade,
    fonte,
    confidence,
    source_text,
    requires_review,
    created_at
   FROM eventos_clinicos
  WHERE requires_review OR COALESCE(confidence, 1::numeric) < 0.7;

create or replace view public.vw_eventos_tendencia with (security_invoker=true) as
 SELECT paciente_id,
    tipo,
    ts,
    valor_num,
    unidade,
    lag(valor_num) OVER w AS valor_anterior,
    valor_num - lag(valor_num) OVER w AS delta,
    round(EXTRACT(epoch FROM ts - lag(ts) OVER w) / 3600.0, 1) AS gap_horas
   FROM eventos_clinicos e
  WHERE valor_num IS NOT NULL AND NOT requires_review AND COALESCE(confidence, 1::numeric) >= 0.7
  WINDOW w AS (PARTITION BY paciente_id, tipo ORDER BY ts);

create or replace view public.vw_janelas_24h_render with (security_invoker=true) as
 SELECT j.id,
    j.paciente_id,
    j.internacao_id,
    j.evolucao_id,
    j.user_id,
    j.tipo,
    j.janela_inicio,
    j.janela_fim,
    j.valor_max,
    j.valor_min,
    j.n_total,
    j.n_fora_alto,
    j.n_fora_baixo,
    j.limiar_alto,
    j.limiar_baixo,
    j.fonte,
    j.confidence,
    j.source_text,
    j.requires_review,
    j.created_at,
    r.rotulo,
    r.unidade_padrao,
    (fmt_num(j.valor_max) || '-'::text) || fmt_num(j.valor_min) AS faixa_txt,
    NULLIF(('('::text || concat_ws('; '::text,
        CASE
            WHEN COALESCE(j.n_fora_baixo::integer, 0) > 0 THEN (((j.n_fora_baixo || '/'::text) || j.n_total) || ' <'::text) || fmt_num(j.limiar_baixo)
            ELSE NULL::text
        END,
        CASE
            WHEN COALESCE(j.n_fora_alto::integer, 0) > 0 THEN (((j.n_fora_alto || '/'::text) || j.n_total) || ' >'::text) || fmt_num(j.limiar_alto)
            ELSE NULL::text
        END)) || ')'::text, '()'::text) AS excursoes_txt,
    concat_ws(' '::text, r.rotulo, (fmt_num(j.valor_max) || '-'::text) || fmt_num(j.valor_min), NULLIF(('('::text || concat_ws('; '::text,
        CASE
            WHEN COALESCE(j.n_fora_baixo::integer, 0) > 0 THEN (((j.n_fora_baixo || '/'::text) || j.n_total) || ' <'::text) || fmt_num(j.limiar_baixo)
            ELSE NULL::text
        END,
        CASE
            WHEN COALESCE(j.n_fora_alto::integer, 0) > 0 THEN (((j.n_fora_alto || '/'::text) || j.n_total) || ' >'::text) || fmt_num(j.limiar_alto)
            ELSE NULL::text
        END)) || ')'::text, '()'::text)) AS render
   FROM janelas_24h j
     JOIN evento_tipo_ref r ON r.codigo = j.tipo;

create or replace view public.vw_sofa_diario with (security_invoker=true) as
 WITH pf_worst AS (
         SELECT DISTINCT ON (eventos_clinicos.paciente_id, (eventos_clinicos.ts::date)) eventos_clinicos.paciente_id,
            eventos_clinicos.ts::date AS dia,
            eventos_clinicos.valor_num AS pf,
            NULLIF(eventos_clinicos.valor_json ->> 'suporte_vent'::text, ''::text) AS suporte_vent
           FROM eventos_clinicos
          WHERE eventos_clinicos.tipo = 'pf_ratio'::text AND eventos_clinicos.valor_num IS NOT NULL
          ORDER BY eventos_clinicos.paciente_id, (eventos_clinicos.ts::date), eventos_clinicos.valor_num
        ), comp AS (
         SELECT eventos_clinicos.paciente_id,
            eventos_clinicos.ts::date AS dia,
            min(eventos_clinicos.valor_num) FILTER (WHERE eventos_clinicos.tipo = 'plaq'::text) AS plaq,
            max(eventos_clinicos.valor_num) FILTER (WHERE eventos_clinicos.tipo = 'bb'::text) AS bb,
            min(eventos_clinicos.valor_num) FILTER (WHERE eventos_clinicos.tipo = 'pam'::text) AS pam,
            max(eventos_clinicos.valor_num) FILTER (WHERE eventos_clinicos.tipo = 'nor_dose'::text) AS nor,
            max(eventos_clinicos.valor_num) FILTER (WHERE eventos_clinicos.tipo = 'adr_dose'::text) AS adr,
            max(eventos_clinicos.valor_num) FILTER (WHERE eventos_clinicos.tipo = 'dopa_dose'::text) AS dopa,
            max(eventos_clinicos.valor_num) FILTER (WHERE eventos_clinicos.tipo = 'dobuta_dose'::text) AS dobuta,
            min(eventos_clinicos.valor_num) FILTER (WHERE eventos_clinicos.tipo = 'gcs'::text) AS gcs,
            max(eventos_clinicos.valor_num) FILTER (WHERE eventos_clinicos.tipo = 'cr'::text) AS cr,
            min(eventos_clinicos.valor_num) FILTER (WHERE eventos_clinicos.tipo = 'diurese_h'::text) AS diurese_h
           FROM eventos_clinicos
          GROUP BY eventos_clinicos.paciente_id, (eventos_clinicos.ts::date)
        ), j AS (
         SELECT c.paciente_id,
            c.dia,
            c.plaq,
            c.bb,
            c.pam,
            c.nor,
            c.adr,
            c.dopa,
            c.dobuta,
            c.gcs,
            c.cr,
            c.diurese_h,
            p.pf,
            p.suporte_vent IS NOT NULL AND p.suporte_vent <> 'none'::text AS tem_suporte
           FROM comp c
             LEFT JOIN pf_worst p USING (paciente_id, dia)
        ), score AS (
         SELECT j.paciente_id,
            j.dia,
            j.plaq,
            j.bb,
            j.pam,
            j.nor,
            j.adr,
            j.dopa,
            j.dobuta,
            j.gcs,
            j.cr,
            j.diurese_h,
            j.pf,
            j.tem_suporte,
                CASE
                    WHEN j.pf IS NULL THEN NULL::integer
                    WHEN j.pf > 400::numeric THEN 0
                    WHEN j.pf > 300::numeric THEN 1
                    WHEN j.pf > 200::numeric THEN 2
                    WHEN j.pf > 100::numeric THEN
                    CASE
                        WHEN j.tem_suporte THEN 3
                        ELSE 2
                    END
                    ELSE
                    CASE
                        WHEN j.tem_suporte THEN 4
                        ELSE 2
                    END
                END AS s_resp,
                CASE
                    WHEN j.plaq IS NULL THEN NULL::integer
                    WHEN j.plaq >= 150::numeric THEN 0
                    WHEN j.plaq >= 100::numeric THEN 1
                    WHEN j.plaq >= 50::numeric THEN 2
                    WHEN j.plaq >= 20::numeric THEN 3
                    ELSE 4
                END AS s_coag,
                CASE
                    WHEN j.bb IS NULL THEN NULL::integer
                    WHEN j.bb < 1.2 THEN 0
                    WHEN j.bb < 2.0 THEN 1
                    WHEN j.bb < 6.0 THEN 2
                    WHEN j.bb < 12.0 THEN 3
                    ELSE 4
                END AS s_liver,
                CASE
                    WHEN j.pam IS NULL AND j.nor IS NULL AND j.adr IS NULL AND j.dopa IS NULL AND j.dobuta IS NULL THEN NULL::integer
                    WHEN j.dopa > 15::numeric OR j.adr > 0.1 OR j.nor > 0.1 THEN 4
                    WHEN j.dopa > 5::numeric OR j.adr > 0::numeric OR j.nor > 0::numeric THEN 3
                    WHEN j.dopa > 0::numeric OR j.dobuta > 0::numeric THEN 2
                    WHEN j.pam IS NOT NULL AND j.pam < 70::numeric THEN 1
                    WHEN j.pam IS NOT NULL THEN 0
                    ELSE NULL::integer
                END AS s_cardio,
                CASE
                    WHEN j.gcs IS NULL THEN NULL::integer
                    WHEN j.gcs >= 15::numeric THEN 0
                    WHEN j.gcs >= 13::numeric THEN 1
                    WHEN j.gcs >= 10::numeric THEN 2
                    WHEN j.gcs >= 6::numeric THEN 3
                    ELSE 4
                END AS s_neuro,
                CASE
                    WHEN j.cr IS NULL AND j.diurese_h IS NULL THEN NULL::integer
                    WHEN j.cr IS NOT NULL AND j.cr >= 5.0 OR j.diurese_h IS NOT NULL AND j.diurese_h < 8.3 THEN 4
                    WHEN j.cr IS NOT NULL AND j.cr >= 3.5 OR j.diurese_h IS NOT NULL AND j.diurese_h < 20.8 THEN 3
                    WHEN j.cr IS NOT NULL AND j.cr >= 2.0 THEN 2
                    WHEN j.cr IS NOT NULL AND j.cr >= 1.2 THEN 1
                    WHEN j.cr IS NOT NULL THEN 0
                    ELSE NULL::integer
                END AS s_renal
           FROM j
        )
 SELECT paciente_id,
    dia,
    s_resp,
    s_coag,
    s_liver,
    s_cardio,
    s_neuro,
    s_renal,
    COALESCE(s_resp, 0) + COALESCE(s_coag, 0) + COALESCE(s_liver, 0) + COALESCE(s_cardio, 0) + COALESCE(s_neuro, 0) + COALESCE(s_renal, 0) AS sofa_parcial,
    (s_resp IS NOT NULL)::integer + (s_coag IS NOT NULL)::integer + (s_liver IS NOT NULL)::integer + (s_cardio IS NOT NULL)::integer + (s_neuro IS NOT NULL)::integer + (s_renal IS NOT NULL)::integer AS componentes_presentes,
    array_remove(ARRAY[
        CASE
            WHEN s_resp IS NULL THEN 'resp'::text
            ELSE NULL::text
        END,
        CASE
            WHEN s_coag IS NULL THEN 'coag'::text
            ELSE NULL::text
        END,
        CASE
            WHEN s_liver IS NULL THEN 'hepatico'::text
            ELSE NULL::text
        END,
        CASE
            WHEN s_cardio IS NULL THEN 'cardio'::text
            ELSE NULL::text
        END,
        CASE
            WHEN s_neuro IS NULL THEN 'neuro'::text
            ELSE NULL::text
        END,
        CASE
            WHEN s_renal IS NULL THEN 'renal'::text
            ELSE NULL::text
        END], NULL::text) AS componentes_faltantes
   FROM score;

create or replace view public.vw_sofa_trend_72h with (security_invoker=true) as
 SELECT paciente_id,
    ts,
    valor_num AS sofa_total
   FROM eventos_clinicos ec
  WHERE tipo = 'sofa_total'::text AND ts >= (now() - '72:00:00'::interval)
  ORDER BY paciente_id, ts;

-- ============================================================================
-- FUNÇÕES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admitir_paciente(p_nome text, p_leito text, p_uti uti_enum, p_int_uti_data date DEFAULT fn_hoje_local(), p_idade integer DEFAULT NULL::integer, p_hd text DEFAULT NULL::text, p_gravidade gravidade_enum DEFAULT 'estavel'::gravidade_enum, p_isolation isolamento_enum DEFAULT 'none'::isolamento_enum, p_peso numeric DEFAULT NULL::numeric, p_altura numeric DEFAULT NULL::numeric, p_alergias text DEFAULT NULL::text, p_int_origem_data date DEFAULT NULL::date, p_observacoes text DEFAULT NULL::text, p_paciente_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions', 'pg_catalog'
AS $function$
declare
    v_id       uuid;
    v_ocupante text;
begin
    if p_nome is null or btrim(p_nome) = '' then
        raise exception 'Nome do paciente é obrigatório' using errcode = '22023';
    end if;

    perform public.fn_valida_leito(p_leito, p_uti);

    if p_int_uti_data > public.fn_hoje_local() then
        raise exception 'Data de entrada na UTI está no futuro: %', p_int_uti_data
            using errcode = '22023';
    end if;

    if p_int_origem_data is not null and p_int_origem_data > p_int_uti_data then
        raise exception 'Entrada no hospital (%) é posterior à entrada na UTI (%)',
            p_int_origem_data, p_int_uti_data
            using errcode = '22023';
    end if;

    if p_idade is not null and (p_idade < 0 or p_idade > 130) then
        raise exception 'Idade fora da faixa possível: %', p_idade using errcode = '22023';
    end if;

    -- Mensagem com o NOME do ocupante, não só "leito ocupado": no plantão, saber
    -- quem está lá é o que resolve — ou é o leito errado, ou falta dar alta.
    select nome into v_ocupante
      from public.pacientes
     where leito = p_leito
       and status_leito = 'ativo'
       and (p_paciente_id is null or id <> p_paciente_id);

    if v_ocupante is not null then
        raise exception 'Leito % já está ocupado por %. Dê alta antes de admitir.', p_leito, v_ocupante
            using errcode = '23505';
    end if;

    if p_paciente_id is null then
        -- O AFTER INSERT abre o episódio de internação. Não inserir aqui.
        insert into public.pacientes
            (nome, leito, uti, idade, hd, gravidade, isolation, peso, altura, alergias,
             data_adm, status_leito)
        values
            (btrim(p_nome), p_leito, p_uti, p_idade, nullif(btrim(coalesce(p_hd, '')), ''),
             p_gravidade, p_isolation, p_peso, p_altura,
             nullif(btrim(coalesce(p_alergias, '')), ''),
             p_int_uti_data, 'ativo')
        returning id into v_id;
    else
        if exists (select 1 from public.internacoes
                    where paciente_id = p_paciente_id and desfecho is null) then
            raise exception 'Paciente % já tem internação em curso — use transferir_leito', p_paciente_id
                using errcode = '23505';
        end if;

        -- Reinternação: o cadastro volta a ficar ativo, no leito novo. Sair de
        -- não-ativo para 'ativo' faz o AFTER UPDATE abrir o episódio novo.
        update public.pacientes
           set nome         = btrim(p_nome),
               leito        = p_leito,
               uti          = p_uti,
               idade        = coalesce(p_idade, idade),
               hd           = coalesce(nullif(btrim(coalesce(p_hd, '')), ''), hd),
               gravidade    = p_gravidade,
               isolation    = p_isolation,
               peso         = coalesce(p_peso, peso),
               altura       = coalesce(p_altura, altura),
               alergias     = coalesce(nullif(btrim(coalesce(p_alergias, '')), ''), alergias),
               data_adm     = p_int_uti_data,
               status_leito = 'ativo'
         where id = p_paciente_id
        returning id into v_id;

        if v_id is null then
            raise exception 'Paciente % não existe', p_paciente_id using errcode = '22023';
        end if;

        -- Rede de segurança: o AFTER UPDATE só dispara quando `status_leito`
        -- MUDA. Uma linha já 'ativo' e sem episódio aberto (dado inconsistente
        -- de antes do P0) passaria batido e ficaria sem internação.
        if not exists (select 1 from public.internacoes
                        where paciente_id = v_id and desfecho is null) then
            insert into public.internacoes (paciente_id, int_uti_data, uti)
            values (v_id, p_int_uti_data, p_uti);
        end if;
    end if;

    -- O que o trigger não sabe: origem hospitalar, observação e — na
    -- reinternação — a data real, que ele carimba como `current_date`.
    update public.internacoes
       set int_uti_data    = p_int_uti_data,
           int_origem_data = p_int_origem_data,
           observacoes     = coalesce(nullif(btrim(coalesce(p_observacoes, '')), ''), observacoes)
     where paciente_id = v_id
       and desfecho is null;

    return v_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.dar_alta_paciente(p_paciente_id uuid, p_desfecho desfecho_internacao_enum, p_desfecho_data date DEFAULT fn_hoje_local(), p_destino_setor text DEFAULT NULL::text, p_destino_especialidade text DEFAULT NULL::text, p_observacoes text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions', 'pg_catalog'
AS $function$
declare
    v_internacao uuid;
    v_status     public.status_leito_enum;
    v_entrada    date;
begin
    if p_paciente_id is null then
        raise exception 'Paciente é obrigatório' using errcode = '22023';
    end if;

    if p_desfecho is null then
        raise exception 'Desfecho é obrigatório' using errcode = '22023';
    end if;

    if p_desfecho_data > public.fn_hoje_local() then
        raise exception 'Data do desfecho está no futuro: %', p_desfecho_data
            using errcode = '22023';
    end if;

    -- Óbito e transferência têm status próprio: o painel some com o leito nos
    -- três casos, mas o registro precisa dizer QUAL foi o desfecho.
    v_status := case p_desfecho
                    when 'obito'         then 'obito'
                    when 'transferencia' then 'transferencia'
                    else 'alta'
                end::public.status_leito_enum;

    select id, int_uti_data into v_internacao, v_entrada
      from public.internacoes
     where paciente_id = p_paciente_id
       and desfecho is null
     order by int_uti_data desc, created_at desc
     limit 1;

    if v_internacao is null then
        raise exception 'Paciente % não tem internação em curso', p_paciente_id
            using errcode = '22023';
    end if;

    if p_desfecho_data < v_entrada then
        raise exception 'Desfecho (%) é anterior à entrada na UTI (%)', p_desfecho_data, v_entrada
            using errcode = '22023';
    end if;

    update public.pacientes
       set status_leito = v_status
     where id = p_paciente_id;

    update public.internacoes
       set desfecho              = p_desfecho,
           desfecho_data         = p_desfecho_data,
           destino_setor         = nullif(btrim(coalesce(p_destino_setor, '')), ''),
           destino_especialidade = nullif(btrim(coalesce(p_destino_especialidade, '')), ''),
           observacoes           = coalesce(nullif(btrim(coalesce(p_observacoes, '')), ''), observacoes)
     where id = v_internacao;

    return v_internacao;
end;
$function$;

CREATE OR REPLACE FUNCTION public.fmt_num(n numeric)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT CASE WHEN n IS NULL THEN NULL
         ELSE regexp_replace(regexp_replace(n::text, '(\.[0-9]*[1-9])0+$', '\1'), '\.0*$', '')
         END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_alert_hash(p_paciente_id uuid, p_tipo text, p_payload jsonb)
 RETURNS text
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public', 'extensions', 'pg_catalog'
AS $function$
begin
  return encode(
    extensions.digest(
      p_paciente_id::text
        || '|' || p_tipo
        || '|' || coalesce(p_payload::text, '')
        || '|' || to_char(now(), 'YYYY-MM-DD'),
      'sha256'
    ),
    'hex'
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.fn_autoflag_lowconf()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
begin
  if new.confidence is null or new.confidence < 0.7 then
    new.requires_review := true;
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.fn_eval_alert()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions', 'pg_catalog'
AS $function$
declare
  r          record;
  best_rank  int := 0;
  v_rank     int;
  b_rotulo   text;
  b_sev      public.severidade_alerta_enum;
  b_msg      text;
  b_fonte    text;
  b_id       uuid;
  b_ordem    int;
  v_hash     text;
begin
  -- TRAVA 1: nunca alarmar dado nao revisado ou de baixa confianca (ZERO ALUCINACAO)
  if new.requires_review is true or coalesce(new.confidence, 1) < 0.7 then
    return new;
  end if;
  if new.valor_num is null then
    return new;
  end if;

  for r in select * from alert_rules where ativo and tipo_evento = new.tipo loop
    if (case r.comparador
          when 'lt'  then new.valor_num <  r.limiar
          when 'lte' then new.valor_num <= r.limiar
          when 'gt'  then new.valor_num >  r.limiar
          when 'gte' then new.valor_num >= r.limiar
          else false
        end) then
      v_rank := case r.severidade when 'critical' then 3 when 'warning' then 2 else 1 end;
      if v_rank > best_rank or (v_rank = best_rank and (b_ordem is null or r.ordem < b_ordem)) then
        best_rank := v_rank;
        b_rotulo := r.rotulo; b_sev := r.severidade; b_msg := r.mensagem;
        b_fonte := r.fonte; b_id := r.id; b_ordem := r.ordem;
      end if;
    end if;
  end loop;

  if best_rank = 0 then
    return new;  -- nenhuma regra bateu
  end if;

  -- TRAVA 2: dedupe diario (fn_alert_hash inclui a data) + unique(hash_key)
  v_hash := fn_alert_hash(
    new.paciente_id, b_rotulo,
    jsonb_build_object('valor', new.valor_num, 'tipo_evento', new.tipo)
  );

  insert into alerts_log (paciente_id, evento_id, user_id, tipo, severidade, mensagem, payload, hash_key, acked)
  values (
    new.paciente_id, new.id, new.user_id, b_rotulo, b_sev,
    replace(b_msg, '{v}', new.valor_num::text),
    jsonb_build_object('valor', new.valor_num, 'tipo_evento', new.tipo, 'unidade', new.unidade, 'regra', b_id, 'fonte', b_fonte),
    v_hash, false
  )
  on conflict (hash_key) do nothing;

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.fn_eval_trend()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions', 'pg_catalog'
AS $function$
declare
  prev_valor numeric;
  prev_ts    timestamptz;
  r          record;
  v_delta    numeric;
  v_ratio    numeric;
  v_gap_h    numeric;
  v_hit      boolean;
  best_rank  int := 0;
  v_rank     int;
  b_rotulo   text; b_sev public.severidade_alerta_enum; b_msg text; b_fonte text; b_id uuid; b_ordem int;
  v_hash     text;
begin
  if new.requires_review is true or coalesce(new.confidence, 1) < 0.7 or new.valor_num is null then
    return new;
  end if;

  -- valor anterior CONFIAVEL do mesmo paciente+tipo
  select valor_num, ts into prev_valor, prev_ts
  from eventos_clinicos
  where paciente_id = new.paciente_id and tipo = new.tipo and id <> new.id
    and valor_num is not null and not requires_review and coalesce(confidence, 1) >= 0.7
    and ts < new.ts
  order by ts desc
  limit 1;

  if prev_valor is null then
    return new;  -- sem historico, sem tendencia
  end if;

  v_delta := new.valor_num - prev_valor;
  v_ratio := case when prev_valor <> 0 then new.valor_num / prev_valor else null end;
  v_gap_h := extract(epoch from (new.ts - prev_ts)) / 3600.0;

  for r in select * from trend_rules where ativo and tipo_evento = new.tipo loop
    v_hit := case r.modo
      when 'subida_abs' then v_delta >= r.limiar
      when 'subida_rel' then v_ratio is not null and v_ratio >= r.limiar
      when 'queda_abs'  then (-v_delta) >= r.limiar
      else false
    end;
    if v_hit and (r.janela_max_horas is null or v_gap_h <= r.janela_max_horas) then
      v_rank := case r.severidade when 'critical' then 3 when 'warning' then 2 else 1 end;
      if v_rank > best_rank or (v_rank = best_rank and (b_ordem is null or r.ordem < b_ordem)) then
        best_rank := v_rank; b_rotulo := r.rotulo; b_sev := r.severidade; b_msg := r.mensagem;
        b_fonte := r.fonte; b_id := r.id; b_ordem := r.ordem;
      end if;
    end if;
  end loop;

  if best_rank = 0 then
    return new;
  end if;

  v_hash := fn_alert_hash(new.paciente_id, b_rotulo,
    jsonb_build_object('valor', new.valor_num, 'prev', prev_valor, 'tipo_evento', new.tipo));
  insert into alerts_log (paciente_id, evento_id, user_id, tipo, severidade, mensagem, payload, hash_key, acked)
  values (
    new.paciente_id, new.id, new.user_id, b_rotulo, b_sev,
    replace(replace(replace(b_msg, '{v}', new.valor_num::text), '{prev}', prev_valor::text), '{d}', round(v_delta, 2)::text),
    jsonb_build_object('valor', new.valor_num, 'anterior', prev_valor, 'delta', v_delta,
                       'gap_horas', round(v_gap_h, 1), 'tipo_evento', new.tipo, 'regra', b_id, 'fonte', b_fonte),
    v_hash, false
  )
  on conflict (hash_key) do nothing;

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.fn_evolucao_relogios()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
declare
  v_local timestamp;
  v_hora  int;
begin
  v_local := coalesce(new.data_evolucao, now()) AT TIME ZONE 'America/Sao_Paulo';
  v_hora  := extract(hour from v_local);

  if new.turno is null then
    if new.plantao = 'noite' then
      new.turno := 'noturna';
    elsif new.plantao in ('manha','tarde','plantao_24h') then
      new.turno := 'diurna';
    else
      new.turno := case when v_hora >= 7 and v_hora < 19 then 'diurna' else 'noturna' end;
    end if;
  end if;

  if new.data_plantao is null then
    new.data_plantao := case
      when new.turno = 'noturna' and v_hora < 7 then v_local::date - 1
      else v_local::date
    end;
  end if;

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.fn_hoje_local()
 RETURNS date
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'extensions', 'pg_catalog'
AS $function$
    select (now() at time zone 'America/Sao_Paulo')::date;
$function$;

CREATE OR REPLACE FUNCTION public.fn_internacao_atual(p_paciente uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_catalog'
AS $function$
  select i.id from public.internacoes i
   where i.paciente_id = p_paciente and i.desfecho is null
   order by i.int_uti_data desc, i.created_at desc
   limit 1;
$function$;

CREATE OR REPLACE FUNCTION public.fn_internacao_reinternacao()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
declare
  v_prev uuid;
begin
  if new.internacao_prev_id is null then
    select i.id into v_prev
      from public.internacoes i
     where i.paciente_id = new.paciente_id
       and i.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
     order by i.int_uti_data desc, i.created_at desc
     limit 1;
    if v_prev is not null then
      new.internacao_prev_id := v_prev;
      new.reinternacao := true;
    end if;
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.fn_invalidate_sofa_cache()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
begin
  if (old.resp     is distinct from new.resp)     or
     (old.hemo     is distinct from new.hemo)     or
     (old.renal    is distinct from new.renal)    or
     (old.hemato   is distinct from new.hemato)   or
     (old.tgi      is distinct from new.tgi)      or
     (old.neuro    is distinct from new.neuro)    or
     (old.dvas     is distinct from new.dvas)     or
     (old.sedativos is distinct from new.sedativos) then
    new.sofa_snapshot = null;
    new.sofa_total = null;
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.fn_paciente_internacao_sync()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
begin
  if tg_op = 'INSERT' then
    insert into public.internacoes (paciente_id, user_id, int_uti_data, uti, desfecho)
    values (new.id, new.user_id, coalesce(new.data_adm, current_date), new.uti,
            case new.status_leito
              when 'ativo'         then null
              when 'alta'          then 'alta_uti'::public.desfecho_internacao_enum
              when 'obito'         then 'obito'::public.desfecho_internacao_enum
              when 'transferencia' then 'transferencia'::public.desfecho_internacao_enum
            end);
  elsif tg_op = 'UPDATE' then
    if old.status_leito = 'ativo' and new.status_leito <> 'ativo' then
      update public.internacoes
         set desfecho = case new.status_leito
                          when 'alta'          then 'alta_uti'::public.desfecho_internacao_enum
                          when 'obito'         then 'obito'::public.desfecho_internacao_enum
                          when 'transferencia' then 'transferencia'::public.desfecho_internacao_enum
                        end,
             desfecho_data = current_date
       where paciente_id = new.id and desfecho is null;
    elsif old.status_leito <> 'ativo' and new.status_leito = 'ativo'
          and public.fn_internacao_atual(new.id) is null then
      insert into public.internacoes (paciente_id, user_id, int_uti_data, uti)
      values (new.id, new.user_id, current_date, new.uti);
    end if;
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.fn_refresh_dispositivos(p_paciente uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
declare
  v_dva boolean;
  v_sed boolean;
begin
  select coalesce(jsonb_array_length(e.dvas), 0) > 0,
         coalesce(jsonb_array_length(e.sedativos), 0) > 0
    into v_dva, v_sed
    from public.evolucoes e
   where e.paciente_id = p_paciente
   order by e.data_evolucao desc
   limit 1;

  update public.pacientes p
     set dispositivos = jsonb_build_object(
           'mv',  exists (select 1 from public.dispositivo_episodios d
                           where d.paciente_id = p_paciente and d.data_fim is null
                             and d.tipo in ('iot','traqueo')),
           'cvc', exists (select 1 from public.dispositivo_episodios d
                           where d.paciente_id = p_paciente and d.data_fim is null
                             and d.tipo in ('cvc','picc')),
           'trr', exists (select 1 from public.dispositivo_episodios d
                           where d.paciente_id = p_paciente and d.data_fim is null
                             and d.tipo = 'trr'),
           'atb', exists (select 1 from public.atbs a
                           where a.paciente_id = p_paciente and a.data_fim is null),
           'dva', coalesce(v_dva, false),
           'sed', coalesce(v_sed, false),
           'picc',     exists (select 1 from public.dispositivo_episodios d
                                where d.paciente_id = p_paciente and d.data_fim is null and d.tipo = 'picc'),
           'arterial', exists (select 1 from public.dispositivo_episodios d
                                where d.paciente_id = p_paciente and d.data_fim is null and d.tipo = 'arterial'),
           'svd',      exists (select 1 from public.dispositivo_episodios d
                                where d.paciente_id = p_paciente and d.data_fim is null and d.tipo = 'svd'),
           'sne_sng',  exists (select 1 from public.dispositivo_episodios d
                                where d.paciente_id = p_paciente and d.data_fim is null and d.tipo in ('sne','sng')),
           'dreno',    exists (select 1 from public.dispositivo_episodios d
                                where d.paciente_id = p_paciente and d.data_fim is null and d.tipo = 'dreno'),
           'gtt',      exists (select 1 from public.dispositivo_episodios d
                                where d.paciente_id = p_paciente and d.data_fim is null and d.tipo = 'gtt')
         ),
         updated_at = now()
   where p.id = p_paciente;
end;
$function$;

CREATE OR REPLACE FUNCTION public.fn_set_severidade_on_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
begin
  new.severidade_visual := case new.gravidade
    when 'critico'  then 'red'
    when 'instavel' then 'red'
    when 'watcher'  then 'yellow'
    else                 'green' end;
  return new;
end; $function$;

CREATE OR REPLACE FUNCTION public.fn_stamp_internacao()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
begin
  if new.internacao_id is null and new.paciente_id is not null then
    new.internacao_id := public.fn_internacao_atual(new.paciente_id);
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.fn_trg_refresh_dispositivos()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
begin
  perform public.fn_refresh_dispositivos(coalesce(new.paciente_id, old.paciente_id));
  if tg_op = 'UPDATE' and new.paciente_id is distinct from old.paciente_id then
    perform public.fn_refresh_dispositivos(old.paciente_id);
  end if;
  return coalesce(new, old);
end;
$function$;

CREATE OR REPLACE FUNCTION public.fn_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.fn_valida_leito(p_leito text, p_uti uti_enum)
 RETURNS void
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public', 'extensions', 'pg_catalog'
AS $function$
declare
    v_num int;
    v_max int;
begin
    if p_leito is null or p_leito !~ '^UTI[234]-L[0-9]{2}$' then
        raise exception 'Leito fora do padrão UTI#-L##: %', coalesce(p_leito, '(vazio)')
            using errcode = '22023';
    end if;

    if split_part(p_leito, '-', 1) <> p_uti::text then
        raise exception 'Leito % não pertence à %', p_leito, p_uti
            using errcode = '22023';
    end if;

    v_num := substring(p_leito from 'L([0-9]{2})$')::int;
    v_max := case p_uti when 'UTI2' then 13 when 'UTI3' then 13 when 'UTI4' then 8 end;

    if v_num < 1 or v_num > v_max then
        raise exception '% só tem % leitos — % não existe', p_uti, v_max, p_leito
            using errcode = '22023';
    end if;
end;
$function$;

CREATE OR REPLACE FUNCTION public.match_memorias(query_embedding vector, match_threshold double precision, match_count integer)
 RETURNS TABLE(id bigint, conteudo text, similarity double precision)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'extensions', 'pg_catalog'
AS $function$
  select m.id, m.conteudo, 1 - (m.embedding <=> query_embedding) as similarity
  from memorias m
  where 1 - (m.embedding <=> query_embedding) > match_threshold
  order by m.embedding <=> query_embedding
  limit match_count;
$function$;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.save_ficha(p_paciente_id uuid, p_pac jsonb, p_evol jsonb, p_evolucao_id uuid, p_plantao text, p_pendencias jsonb DEFAULT '[]'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
declare v_evol_id uuid; v_uid uuid := auth.uid(); pend jsonb;
begin
  update pacientes set
    nome = coalesce(p_pac->>'nome', nome), leito = coalesce(p_pac->>'leito', leito),
    hd = p_pac->>'hd', idade = nullif(p_pac->>'idade','')::int,
    peso = nullif(p_pac->>'peso','')::numeric, altura = nullif(p_pac->>'altura','')::numeric,
    alergias = p_pac->>'alergias',
    gravidade = coalesce(nullif(p_pac->>'gravidade','')::public.gravidade_enum, gravidade),
    data_adm = coalesce(nullif(p_pac->>'data_adm','')::date, data_adm)
  where id = p_paciente_id and (user_id is null or user_id = v_uid);
  if not found then raise exception 'paciente % nao encontrado ou sem permissao', p_paciente_id; end if;

  if p_evolucao_id is not null then
    update evolucoes set
      neuro=coalesce(p_evol->'neuro','{}'::jsonb), resp=coalesce(p_evol->'resp','{}'::jsonb),
      hemo=coalesce(p_evol->'hemo','{}'::jsonb), tgi=coalesce(p_evol->'tgi','{}'::jsonb),
      renal=coalesce(p_evol->'renal','{}'::jsonb), hemato=coalesce(p_evol->'hemato','{}'::jsonb),
      infecto=coalesce(p_evol->'infecto','{}'::jsonb), dvas=coalesce(p_evol->'dvas','[]'::jsonb),
      sedativos=coalesce(p_evol->'sedativos','[]'::jsonb),
      impressao=coalesce(array(select jsonb_array_elements_text(p_evol->'impressao')),'{}'),
      conduta=coalesce(array(select jsonb_array_elements_text(p_evol->'conduta')),'{}'),
      problemas_ativos=coalesce(p_evol->'problemas_ativos','[]'::jsonb),
      condutas_sistemas=coalesce(p_evol->'condutas_sistemas','[]'::jsonb),
      riscos=coalesce(p_evol->'riscos','[]'::jsonb)
    where id = p_evolucao_id returning id into v_evol_id;
    if v_evol_id is null then raise exception 'evolucao % nao encontrada', p_evolucao_id; end if;
  else
    insert into evolucoes (paciente_id, user_id, data_evolucao, plantao, neuro, resp, hemo, tgi, renal, hemato, infecto,
      dvas, sedativos, impressao, conduta, problemas_ativos, condutas_sistemas, riscos, sofa_snapshot)
    values (p_paciente_id, v_uid, now(), p_plantao::public.plantao_enum,
      coalesce(p_evol->'neuro','{}'::jsonb), coalesce(p_evol->'resp','{}'::jsonb), coalesce(p_evol->'hemo','{}'::jsonb),
      coalesce(p_evol->'tgi','{}'::jsonb), coalesce(p_evol->'renal','{}'::jsonb), coalesce(p_evol->'hemato','{}'::jsonb),
      coalesce(p_evol->'infecto','{}'::jsonb), coalesce(p_evol->'dvas','[]'::jsonb), coalesce(p_evol->'sedativos','[]'::jsonb),
      coalesce(array(select jsonb_array_elements_text(p_evol->'impressao')),'{}'),
      coalesce(array(select jsonb_array_elements_text(p_evol->'conduta')),'{}'),
      coalesce(p_evol->'problemas_ativos','[]'::jsonb), coalesce(p_evol->'condutas_sistemas','[]'::jsonb),
      coalesce(p_evol->'riscos','[]'::jsonb), '{}'::jsonb)
    returning id into v_evol_id;
  end if;

  for pend in select * from jsonb_array_elements(coalesce(p_pendencias,'[]'::jsonb)) loop
    if coalesce(pend->>'id','') <> '' then
      update pendencias set tarefa=pend->>'tarefa', concluida=coalesce((pend->>'concluida')::boolean,false),
        concluida_at=case when (pend->>'concluida')::boolean then now() else null end
      where id = (pend->>'id')::uuid;
    elsif coalesce(pend->>'tarefa','') <> '' then
      insert into pendencias (paciente_id, user_id, tarefa, prioridade, concluida)
      values (p_paciente_id, v_uid, pend->>'tarefa', 2, coalesce((pend->>'concluida')::boolean,false));
    end if;
  end loop;
  return v_evol_id;
end; $function$;

CREATE OR REPLACE FUNCTION public.sync_severidade_visual()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
begin
  if (new.gravidade is distinct from old.gravidade) and
     (new.severidade_visual is not distinct from old.severidade_visual) then
    new.severidade_visual := case new.gravidade
      when 'critico'  then 'red'::text
      when 'instavel' then 'red'::text
      when 'watcher'  then 'yellow'::text
      else                 'green'::text
    end;
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.transferir_leito(p_paciente_id uuid, p_leito text, p_uti uti_enum)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions', 'pg_catalog'
AS $function$
declare
    v_ocupante text;
    v_atual    text;
begin
    if p_paciente_id is null then
        raise exception 'Paciente é obrigatório' using errcode = '22023';
    end if;

    perform public.fn_valida_leito(p_leito, p_uti);

    select leito into v_atual
      from public.pacientes
     where id = p_paciente_id and status_leito = 'ativo';

    if v_atual is null then
        raise exception 'Paciente % não está ativo em nenhum leito', p_paciente_id
            using errcode = '22023';
    end if;

    -- Transferir para a cama onde já está não é erro, é nada.
    if v_atual = p_leito then
        return p_paciente_id;
    end if;

    select nome into v_ocupante
      from public.pacientes
     where leito = p_leito and status_leito = 'ativo';

    if v_ocupante is not null then
        raise exception 'Leito % já está ocupado por %', p_leito, v_ocupante
            using errcode = '23505';
    end if;

    -- `status_leito` não muda: o trigger de episódio não dispara, de propósito.
    update public.pacientes
       set leito = p_leito, uti = p_uti
     where id = p_paciente_id;

    -- O episódio aberto acompanha a unidade, senão a passagem diria a UTI antiga.
    update public.internacoes
       set uti = p_uti
     where paciente_id = p_paciente_id and desfecho is null;

    return p_paciente_id;
end;
$function$;

-- ============================================================================
-- VOCABULÁRIO DE EVENTOS (evento_tipo_ref): 79 códigos
-- ============================================================================
-- colunas: codigo, categoria, rotulo, unidade_padrao, faixa_min, faixa_max, loinc_code, ativo, ordem
--   glicemia | vital | Glicemia capilar (Dx) | mg/dL | 20 | 800 |  | True | 18
--   lactato | gaso | Lactato | mmol/L | 0.5 | 25 |  | True | 21
--   ph | gaso | pH arterial |  | 6.8 | 7.8 |  | True | 22
--   hco3 | gaso | Bicarbonato | mEq/L | 4 | 50 |  | True | 25
--   be | gaso | Base excess | mEq/L |  |  |  | True | 26
--   cr | renal | Creatinina | mg/dL | 0.1 | 20 |  | True | 33
--   ur | renal | Ureia | mg/dL | 5 | 400 |  | True | 34
--   hb | hemato | Hemoglobina | g/dL | 2 | 22 |  | True | 40
--   inr | hemato | INR |  | 0.8 | 10 |  | True | 44
--   bb | infecto | Bilirrubina total | mg/dL |  |  |  | True | 45
--   procalcitonina | infecto | Procalcitonina | ng/mL |  |  |  | True | 47
--   nor_dose | droga | Noradrenalina (dose) | mcg/kg/min | 0.001 | 2 |  | True | 50
--   adr_dose | droga | Adrenalina (dose) | mcg/kg/min | 0.001 | 2 |  | True | 51
--   vaso_dose | droga | Vasopressina (dose) | U/min | 0.01 | 0.1 |  | True | 52
--   dobuta_dose | droga | Dobutamina (dose) | mcg/kg/min | 0 | 30 |  | True | 53
--   dopa_dose | droga | Dopamina (dose) | mcg/kg/min | 0 | 30 |  | True | 54
--   fent_dose | droga | Fentanil (dose) | mcg/h |  |  |  | True | 55
--   midaz_dose | droga | Midazolam (dose) | mg/h |  |  |  | True | 56
--   propofol_dose | droga | Propofol (dose) | mcg/kg/min |  |  |  | True | 57
--   precedex_dose | droga | Dexmedetomidina (dose) | mcg/kg/h |  |  |  | True | 58
--   gcs | neuro | Escala de coma de Glasgow |  | 3 | 15 |  | True | 60
--   rass | neuro | RASS |  | -5 | 4 |  | True | 61
--   cam_icu | neuro | CAM-ICU |  |  |  |  | True | 62
--   bps | neuro | Behavioral Pain Scale |  |  |  |  | True | 63
--   cpot | neuro | CPOT |  |  |  |  | True | 64
--   sofa_total | score | SOFA total |  | 0 | 24 |  | True | 70
--   sofa_cardio | score | SOFA cardiovascular |  | 0 | 4 |  | True | 74
--   sofa_renal | score | SOFA renal |  | 0 | 4 |  | True | 76
--   custom | outro | Livre — eco/hemodinamica/imagem/cultura via valor_json {dominio,subtipo,unidade} |  |  |  |  | True | 99
--   pco2 | gaso | pCO₂ | mmHg | 10 | 150 |  | True | 23
--   pf_ratio | gaso | Relação PaO₂/FiO₂ |  | 50 | 600 |  | True | 20
--   po2 | gaso | pO₂ | mmHg | 20 | 600 |  | True | 24
--   ht | hemato | Hematócrito | % |  |  |  | True | 41
--   pcr | infecto | Proteína C reativa | mg/L |  |  |  | True | 46
--   bh_acumulado | renal | Balanço hídrico acumulado | mL |  |  |  | True | 32
--   bh_h | renal | Balanço hídrico horário | mL |  |  |  | True | 31
--   ca | renal | Cálcio | mg/dL |  |  |  | True | 38
--   diurese_h | renal | Diurese horária | mL/h |  |  |  | True | 30
--   k | renal | Potássio | mEq/L | 1.5 | 9.5 |  | True | 36
--   mg | renal | Magnésio | mg/dL |  |  |  | True | 37
--   na | renal | Sódio | mEq/L | 110 | 180 |  | True | 35
--   p | renal | Fósforo | mg/dL |  |  |  | True | 39
--   sofa_coag | score | SOFA coagulação |  | 0 | 4 |  | True | 72
--   sofa_liver | score | SOFA hepático |  | 0 | 4 |  | True | 73
--   sofa_neuro | score | SOFA neurológico |  | 0 | 4 |  | True | 75
--   sofa_resp | score | SOFA respiratório |  | 0 | 4 |  | True | 71
--   fc | vital | Frequência cardíaca | bpm | 20 | 250 | 8867-4 | True | 14
--   fr | vital | Frequência respiratória | ipm | 4 | 80 |  | True | 15
--   pa_dia | vital | PA diastólica | mmHg | 20 | 160 | 8462-4 | True | 11
--   pa_sys | vital | PA sistólica | mmHg | 40 | 280 | 8480-6 | True | 10
--   pam | vital | PA média | mmHg | 30 | 180 |  | True | 12
--   pam_min | vital | PA média (mínima) | mmHg | 30 | 180 |  | True | 13
--   spo2 | vital | Saturação O₂ | % | 0 | 100 | 2708-6 | True | 16
--   plaq | hemato | Plaquetas | ×10³/mm³ | 1 | 2000 |  | True | 42
--   leuco | hemato | Leucócitos | ×10³/mm³ | 0.1 | 100 |  | True | 43
--   temp | vital | Temperatura | °C | 32 | 42 | 8310-5 | True | 17
--   pas_min | vital | PAS mínima (janela) | mmHg | 30 | 300 |  | True | 15
--   troponina | cardio | Troponina | ng/mL | 0 | 1000 |  | True | 10
--   probnp | cardio | NT-proBNP | pg/mL | 0 | 200000 |  | True | 20
--   tp | coag | Tempo de protrombina | s | 5 | 300 |  | True | 10
--   ttpa | coag | TTPA | s | 10 | 400 |  | True | 20
--   d_dimero | coag | D-dímero | ng/mL | 0 | 200000 |  | True | 30
--   tgo | hepato | TGO / AST | U/L | 0 | 30000 |  | True | 10
--   tgp | hepato | TGP / ALT | U/L | 0 | 30000 |  | True | 20
--   ggt | hepato | GGT | U/L | 0 | 15000 |  | True | 30
--   fa | hepato | Fosfatase alcalina | U/L | 0 | 15000 |  | True | 40
--   bd | hepato | Bilirrubina direta | mg/dL | 0 | 60 |  | True | 50
--   bi | hepato | Bilirrubina indireta | mg/dL | 0 | 60 |  | True | 60
--   amilase | hepato | Amilase | U/L | 0 | 10000 |  | True | 70
--   lipase | hepato | Lipase | U/L | 0 | 30000 |  | True | 80
--   dhl | hepato | DHL / LDH | U/L | 0 | 30000 |  | True | 90
--   vhs | infecto | VHS | mm/h | 0 | 200 |  | True | 40
--   tsh | endocrino | TSH | µUI/mL | 0 | 500 |  | True | 10
--   t4l | endocrino | T4 livre | ng/dL | 0 | 30 |  | True | 20
--   pvc | vital | PVC | mmHg | -5 | 50 |  | True | 60
--   diurese_24h | renal | Diurese total (janela 24h) | mL | 0 | 15000 |  | True | 12
--   diurese_parcial | renal | Diurese em janela parcial (ver json) | mL | 0 | 15000 |  | True | 13
--   uf_dialise | renal | Ultrafiltração em diálise (sessão) | mL | 0 | 10000 |  | True | 14
--   debito_dreno | renal | Débito de dreno (24h) | mL | 0 | 5000 |  | True | 15
