-- ============================================================================
-- SASI — SISTEMA DE AUDITORIA E SÍNTESE INTENSIVA
-- Schema template (DDL) — schema "public"
-- ----------------------------------------------------------------------------
-- Projeto Supabase : idswehsvvqczzkiatuzu (sa-east-1)
-- Engine           : PostgreSQL 17.6
-- Extraído de      : pg_catalog (fonte de verdade, estado REAL do banco)
-- Data extração    : 2026-06-21
-- Tabelas          : 10 (pacientes, evolucoes, eventos_clinicos, pendencias,
--                        atbs, culturas, antibiograma, alerts_log,
--                        ingest_audit_log, memorias)
-- ----------------------------------------------------------------------------
-- AVISOS TÁTICOS (LER ANTES DE EXECUTAR EM BANCO VANILLA):
--   1. FKs referenciam auth.users(id) — schema NATIVO do Supabase. Em Postgres
--      puro, ou você cria o schema/tabela auth.users, ou comenta essas FKs
--      (bloco marcado [FK->auth.users]).
--   2. Requer extensões: vector (pgvector) e pg_trgm. Bloco no topo.
--   3. RLS está HABILITADO em todas as 10 tabelas no banco real. As POLICIES
--      não estão neste template (é template de ESTRUTURA). Pedir à parte se
--      precisar do dump de policies.
--   4. Tabela `memorias` (pgvector, embedding 768d): origem ainda NÃO
--      confirmada no histórico do projeto. Mantida fiel ao estado atual.
-- ============================================================================


-- ============================================================================
-- 0. EXTENSÕES NECESSÁRIAS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS vector;     -- memorias.embedding + índice HNSW
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- idx_pacientes_nome_trgm (busca fuzzy)


-- ============================================================================
-- 1. TABELAS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- pacientes — registro mestre do leito/paciente
-- ----------------------------------------------------------------------------
CREATE TABLE public.pacientes (
    id                  uuid            NOT NULL DEFAULT gen_random_uuid(),
    user_id             uuid,
    leito               text            NOT NULL,
    uti                 text            NOT NULL,
    nome                text            NOT NULL,
    idade               integer,
    peso                numeric(5,2),
    altura              numeric(5,2),
    hd                  text,
    data_adm            date            NOT NULL DEFAULT CURRENT_DATE,
    alergias            text,
    gravidade           text            NOT NULL DEFAULT 'estavel'::text,
    status_leito        text            NOT NULL DEFAULT 'ativo'::text,
    sofa_baseline       integer,
    created_at          timestamptz     NOT NULL DEFAULT now(),
    updated_at          timestamptz     NOT NULL DEFAULT now(),
    dispositivos        jsonb           NOT NULL DEFAULT '{}'::jsonb,
    isolation           text            NOT NULL DEFAULT 'none'::text,
    out_of_range_count  integer         NOT NULL DEFAULT 0,
    severidade_visual   text            NOT NULL DEFAULT 'green'::text,
    patient_summary     jsonb,
    CONSTRAINT pacientes_pkey PRIMARY KEY (id),
    CONSTRAINT pacientes_uti_check               CHECK (uti = ANY (ARRAY['UTI2'::text, 'UTI3'::text, 'UTI4'::text])),
    CONSTRAINT pacientes_nome_check              CHECK (char_length(nome) >= 1 AND char_length(nome) <= 200),
    CONSTRAINT pacientes_idade_check             CHECK (idade >= 0 AND idade <= 130),
    CONSTRAINT pacientes_peso_check              CHECK (peso >= 1::numeric AND peso <= 400::numeric),
    CONSTRAINT pacientes_altura_check            CHECK (altura >= 30::numeric AND altura <= 250::numeric),
    CONSTRAINT pacientes_gravidade_check         CHECK (gravidade = ANY (ARRAY['estavel'::text, 'moderado'::text, 'grave'::text, 'critico'::text, 'obito'::text])),
    CONSTRAINT pacientes_status_leito_check      CHECK (status_leito = ANY (ARRAY['ativo'::text, 'alta'::text, 'obito'::text, 'transferencia'::text])),
    CONSTRAINT pacientes_sofa_baseline_check     CHECK (sofa_baseline >= 0 AND sofa_baseline <= 24),
    CONSTRAINT pacientes_isolation_check         CHECK (isolation = ANY (ARRAY['none'::text, 'contact'::text, 'droplet'::text, 'aerosol'::text])),
    CONSTRAINT pacientes_severidade_visual_check CHECK (severidade_visual = ANY (ARRAY['red'::text, 'yellow'::text, 'green'::text]))
);

-- ----------------------------------------------------------------------------
-- evolucoes — evolução clínica por plantão (sistemas em JSONB)
-- ----------------------------------------------------------------------------
CREATE TABLE public.evolucoes (
    id              uuid          NOT NULL DEFAULT gen_random_uuid(),
    paciente_id     uuid          NOT NULL,
    user_id         uuid,
    data_evolucao   timestamptz   NOT NULL DEFAULT now(),
    plantao         text          NOT NULL DEFAULT 'manha'::text,
    neuro           jsonb         NOT NULL DEFAULT '{}'::jsonb,
    resp            jsonb         NOT NULL DEFAULT '{}'::jsonb,
    hemo            jsonb         NOT NULL DEFAULT '{}'::jsonb,
    tgi             jsonb         NOT NULL DEFAULT '{}'::jsonb,
    renal           jsonb         NOT NULL DEFAULT '{}'::jsonb,
    hemato          jsonb         NOT NULL DEFAULT '{}'::jsonb,
    infecto         jsonb         NOT NULL DEFAULT '{}'::jsonb,
    dvas            jsonb         NOT NULL DEFAULT '[]'::jsonb,
    sedativos       jsonb         NOT NULL DEFAULT '[]'::jsonb,
    impressao       text[]        NOT NULL DEFAULT '{}'::text[],
    conduta         text[]        NOT NULL DEFAULT '{}'::text[],
    sofa_snapshot   jsonb,
    sofa_total      integer,
    created_at      timestamptz   NOT NULL DEFAULT now(),
    updated_at      timestamptz   NOT NULL DEFAULT now(),
    prescricao      jsonb                  DEFAULT '{}'::jsonb,
    CONSTRAINT evolucoes_pkey PRIMARY KEY (id),
    CONSTRAINT evolucoes_plantao_check    CHECK (plantao = ANY (ARRAY['manha'::text, 'tarde'::text, 'noite'::text, 'plantao_24h'::text])),
    CONSTRAINT evolucoes_sofa_total_check CHECK (sofa_total >= 0 AND sofa_total <= 24)
);

-- ----------------------------------------------------------------------------
-- eventos_clinicos — séries temporais (1 linha = 1 medição). Núcleo do ΔSOFA/timeline
-- ----------------------------------------------------------------------------
CREATE TABLE public.eventos_clinicos (
    id                uuid          NOT NULL DEFAULT gen_random_uuid(),
    paciente_id       uuid          NOT NULL,
    evolucao_id       uuid,
    user_id           uuid,
    ts                timestamptz   NOT NULL,
    tipo              text          NOT NULL,
    valor_num         numeric,
    valor_json        jsonb,
    unidade           text,
    fonte             text          NOT NULL,
    confidence        numeric(3,2),
    source_text       text,
    requires_review   boolean       NOT NULL DEFAULT false,
    created_at        timestamptz   NOT NULL DEFAULT now(),
    CONSTRAINT eventos_clinicos_pkey PRIMARY KEY (id),
    CONSTRAINT chk_eventos_valor_not_empty       CHECK (valor_num IS NOT NULL OR valor_json IS NOT NULL),
    CONSTRAINT eventos_clinicos_confidence_check CHECK (confidence >= 0::numeric AND confidence <= 1::numeric),
    CONSTRAINT eventos_clinicos_fonte_check      CHECK (fonte = ANY (ARRAY['manual'::text, 'gemini_ocr'::text, 'claude_ocr'::text, 'appsheet'::text, 'auto_trigger'::text, 'edge_function'::text, 'api_import'::text])),
    CONSTRAINT eventos_clinicos_tipo_check       CHECK (tipo = ANY (ARRAY[
        'sofa_total','sofa_resp','sofa_coag','sofa_liver','sofa_cardio','sofa_neuro','sofa_renal',
        'pam','pam_min','pa_sys','pa_dia','pf_ratio','spo2','fr','fc','temp',
        'lactato','ph','pco2','po2','hco3','be','diurese_h','bh_h','bh_acumulado',
        'hb','ht','plaq','leuco','cr','ur','na','k','mg','ca','p','bb','inr',
        'pcr','procalcitonina',
        'nor_dose','adr_dose','vaso_dose','dobuta_dose','dopa_dose',
        'fent_dose','midaz_dose','propofol_dose','precedex_dose',
        'gcs','rass','cam_icu','bps','cpot','glicemia','custom'
    ]::text[]))
);

-- ----------------------------------------------------------------------------
-- pendencias — tarefas/follow-up por paciente
-- ----------------------------------------------------------------------------
CREATE TABLE public.pendencias (
    id            uuid          NOT NULL DEFAULT gen_random_uuid(),
    paciente_id   uuid          NOT NULL,
    evolucao_id   uuid,
    user_id       uuid,
    tarefa        text          NOT NULL,
    prioridade    smallint      NOT NULL DEFAULT 2,
    concluida     boolean       NOT NULL DEFAULT false,
    concluida_at  timestamptz,
    created_at    timestamptz   NOT NULL DEFAULT now(),
    CONSTRAINT pendencias_pkey PRIMARY KEY (id),
    CONSTRAINT pendencias_tarefa_check     CHECK (char_length(tarefa) >= 1 AND char_length(tarefa) <= 500),
    CONSTRAINT pendencias_prioridade_check CHECK (prioridade >= 1 AND prioridade <= 3)
);

-- ----------------------------------------------------------------------------
-- atbs — antimicrobianos em uso
-- ----------------------------------------------------------------------------
CREATE TABLE public.atbs (
    id                uuid          NOT NULL DEFAULT gen_random_uuid(),
    paciente_id       uuid          NOT NULL,
    user_id           uuid,
    droga             text          NOT NULL,
    dose              text,
    via               text,
    frequencia        text,
    data_inicio       date          NOT NULL DEFAULT CURRENT_DATE,
    data_fim          date,
    intencao          text,
    foco              text,
    agente_alvo       text,
    motivo_suspensao  text,
    created_at        timestamptz   NOT NULL DEFAULT now(),
    updated_at        timestamptz   NOT NULL DEFAULT now(),
    CONSTRAINT atbs_pkey PRIMARY KEY (id),
    CONSTRAINT atbs_via_check            CHECK (via = ANY (ARRAY['EV'::text, 'VO'::text, 'IM'::text, 'SC'::text, 'SNE'::text, 'SNG'::text, 'IT'::text, 'Tópico'::text])),
    CONSTRAINT atbs_intencao_check       CHECK (intencao = ANY (ARRAY['empirica'::text, 'dirigida'::text, 'profilatica'::text])),
    CONSTRAINT chk_atb_datas_coerentes   CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);

-- ----------------------------------------------------------------------------
-- culturas — coletas microbiológicas
-- ----------------------------------------------------------------------------
CREATE TABLE public.culturas (
    id            uuid          NOT NULL DEFAULT gen_random_uuid(),
    paciente_id   uuid          NOT NULL,
    user_id       uuid,
    material      text          NOT NULL,
    coleta_ts     timestamptz   NOT NULL,
    laudo_ts      timestamptz,
    crescimento   boolean       NOT NULL DEFAULT false,
    agente        text,
    ufc_por_ml    numeric,
    observacoes   text,
    created_at    timestamptz   NOT NULL DEFAULT now(),
    updated_at    timestamptz   NOT NULL DEFAULT now(),
    CONSTRAINT culturas_pkey PRIMARY KEY (id),
    CONSTRAINT culturas_material_check          CHECK (material = ANY (ARRAY['hemocultura'::text, 'urocultura'::text, 'aspirado_traqueal'::text, 'lavado_bal'::text, 'lcr'::text, 'secrecao_ferida'::text, 'liquido_peritoneal'::text, 'liquido_pleural'::text, 'outro'::text])),
    CONSTRAINT chk_cultura_laudo_apos_coleta    CHECK (laudo_ts IS NULL OR laudo_ts >= coleta_ts)
);

-- ----------------------------------------------------------------------------
-- antibiograma — sensibilidade por cultura (S/I/R)
-- ----------------------------------------------------------------------------
CREATE TABLE public.antibiograma (
    id            uuid          NOT NULL DEFAULT gen_random_uuid(),
    cultura_id    uuid          NOT NULL,
    antibiotico   text          NOT NULL,
    resultado     text          NOT NULL,
    cim           numeric,
    created_at    timestamptz   NOT NULL DEFAULT now(),
    CONSTRAINT antibiograma_pkey PRIMARY KEY (id),
    CONSTRAINT antibiograma_resultado_check CHECK (resultado = ANY (ARRAY['S'::text, 'I'::text, 'R'::text]))
);

-- ----------------------------------------------------------------------------
-- alerts_log — log de alertas clínicos disparados (dedup por hash_key)
-- ----------------------------------------------------------------------------
CREATE TABLE public.alerts_log (
    id            uuid          NOT NULL DEFAULT gen_random_uuid(),
    paciente_id   uuid          NOT NULL,
    evento_id     uuid,
    user_id       uuid,
    tipo          text          NOT NULL,
    severidade    text          NOT NULL DEFAULT 'warning'::text,
    mensagem      text          NOT NULL,
    payload       jsonb,
    hash_key      text          NOT NULL,
    acked         boolean       NOT NULL DEFAULT false,
    acked_at      timestamptz,
    acked_by      uuid,
    created_at    timestamptz   NOT NULL DEFAULT now(),
    CONSTRAINT alerts_log_pkey PRIMARY KEY (id),
    CONSTRAINT alerts_log_severidade_check CHECK (severidade = ANY (ARRAY['info'::text, 'warning'::text, 'critical'::text]))
);

-- ----------------------------------------------------------------------------
-- ingest_audit_log — auditoria de ingestão (OCR / API / batch)
-- ----------------------------------------------------------------------------
CREATE TABLE public.ingest_audit_log (
    id            uuid          NOT NULL DEFAULT gen_random_uuid(),
    user_id       uuid,
    paciente_id   uuid,
    source_type   text,
    fonte         text,
    payload_raw   jsonb,
    response      jsonb,
    eventos_ids   uuid[],
    warnings      text[],
    ok            boolean       NOT NULL,
    error_msg     text,
    created_at    timestamptz   NOT NULL DEFAULT now(),
    CONSTRAINT ingest_audit_log_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- memorias — store vetorial (pgvector, embedding 768d). [ORIGEM NÃO CONFIRMADA]
-- ----------------------------------------------------------------------------
CREATE TABLE public.memorias (
    id          bigint        GENERATED ALWAYS AS IDENTITY,
    conteudo    text          NOT NULL,
    metadata    jsonb,
    embedding   vector(768),
    created_at  timestamptz            DEFAULT now(),
    CONSTRAINT memorias_pkey PRIMARY KEY (id)
);


-- ============================================================================
-- 2. FOREIGN KEYS
--    [FK->auth.users] = depende do schema nativo Supabase. Comentar em vanilla.
-- ============================================================================

-- pacientes
ALTER TABLE public.pacientes        ADD CONSTRAINT pacientes_user_id_fkey            FOREIGN KEY (user_id)     REFERENCES auth.users(id) ON DELETE SET NULL;             -- [FK->auth.users]

-- evolucoes
ALTER TABLE public.evolucoes        ADD CONSTRAINT evolucoes_paciente_id_fkey        FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;
ALTER TABLE public.evolucoes        ADD CONSTRAINT evolucoes_user_id_fkey            FOREIGN KEY (user_id)     REFERENCES auth.users(id) ON DELETE SET NULL;             -- [FK->auth.users]

-- eventos_clinicos
ALTER TABLE public.eventos_clinicos ADD CONSTRAINT eventos_clinicos_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;
ALTER TABLE public.eventos_clinicos ADD CONSTRAINT eventos_clinicos_evolucao_id_fkey FOREIGN KEY (evolucao_id) REFERENCES public.evolucoes(id) ON DELETE SET NULL;
ALTER TABLE public.eventos_clinicos ADD CONSTRAINT eventos_clinicos_user_id_fkey     FOREIGN KEY (user_id)     REFERENCES auth.users(id) ON DELETE SET NULL;             -- [FK->auth.users]

-- pendencias
ALTER TABLE public.pendencias       ADD CONSTRAINT pendencias_paciente_id_fkey       FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;
ALTER TABLE public.pendencias       ADD CONSTRAINT pendencias_evolucao_id_fkey       FOREIGN KEY (evolucao_id) REFERENCES public.evolucoes(id) ON DELETE SET NULL;
ALTER TABLE public.pendencias       ADD CONSTRAINT pendencias_user_id_fkey           FOREIGN KEY (user_id)     REFERENCES auth.users(id) ON DELETE SET NULL;             -- [FK->auth.users]

-- atbs
ALTER TABLE public.atbs             ADD CONSTRAINT atbs_paciente_id_fkey             FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;
ALTER TABLE public.atbs             ADD CONSTRAINT atbs_user_id_fkey                 FOREIGN KEY (user_id)     REFERENCES auth.users(id) ON DELETE SET NULL;             -- [FK->auth.users]

-- culturas
ALTER TABLE public.culturas         ADD CONSTRAINT culturas_paciente_id_fkey         FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;
ALTER TABLE public.culturas         ADD CONSTRAINT culturas_user_id_fkey             FOREIGN KEY (user_id)     REFERENCES auth.users(id) ON DELETE SET NULL;             -- [FK->auth.users]

-- antibiograma
ALTER TABLE public.antibiograma     ADD CONSTRAINT antibiograma_cultura_id_fkey      FOREIGN KEY (cultura_id)  REFERENCES public.culturas(id) ON DELETE CASCADE;

-- alerts_log
ALTER TABLE public.alerts_log       ADD CONSTRAINT alerts_log_paciente_id_fkey       FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;
ALTER TABLE public.alerts_log       ADD CONSTRAINT alerts_log_evento_id_fkey         FOREIGN KEY (evento_id)   REFERENCES public.eventos_clinicos(id) ON DELETE SET NULL;
ALTER TABLE public.alerts_log       ADD CONSTRAINT alerts_log_user_id_fkey           FOREIGN KEY (user_id)     REFERENCES auth.users(id) ON DELETE SET NULL;             -- [FK->auth.users]
ALTER TABLE public.alerts_log       ADD CONSTRAINT alerts_log_acked_by_fkey          FOREIGN KEY (acked_by)    REFERENCES auth.users(id);                                -- [FK->auth.users]

-- ingest_audit_log
ALTER TABLE public.ingest_audit_log ADD CONSTRAINT ingest_audit_log_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE SET NULL;
ALTER TABLE public.ingest_audit_log ADD CONSTRAINT ingest_audit_log_user_id_fkey     FOREIGN KEY (user_id)     REFERENCES auth.users(id) ON DELETE SET NULL;             -- [FK->auth.users]


-- ============================================================================
-- 3. ÍNDICES (não-PK). Inclui UNIQUE parciais, GIN (trgm/jsonb) e HNSW (vetor).
-- ============================================================================

-- pacientes
CREATE UNIQUE INDEX uq_pacientes_leito_ativo ON public.pacientes USING btree (uti, leito) WHERE (status_leito = 'ativo'::text);
CREATE INDEX idx_pacientes_status      ON public.pacientes USING btree (status_leito, updated_at DESC);
CREATE INDEX idx_pacientes_severidade  ON public.pacientes USING btree (severidade_visual);
CREATE INDEX idx_pacientes_isolation   ON public.pacientes USING btree (isolation) WHERE (isolation <> 'none'::text);
CREATE INDEX idx_pacientes_user        ON public.pacientes USING btree (user_id);
CREATE INDEX idx_pacientes_nome_trgm   ON public.pacientes USING gin (nome gin_trgm_ops);

-- evolucoes
CREATE INDEX idx_evolucoes_paciente_data ON public.evolucoes USING btree (paciente_id, data_evolucao DESC);
CREATE INDEX idx_evolucoes_user          ON public.evolucoes USING btree (user_id);
CREATE INDEX idx_evolucoes_dvas_gin      ON public.evolucoes USING gin (dvas);
CREATE INDEX idx_evolucoes_infecto_gin   ON public.evolucoes USING gin (infecto);

-- eventos_clinicos
CREATE INDEX idx_eventos_pac_ts       ON public.eventos_clinicos USING btree (paciente_id, ts DESC);
CREATE INDEX idx_eventos_pac_tipo_ts  ON public.eventos_clinicos USING btree (paciente_id, tipo, ts DESC);
CREATE INDEX idx_eventos_tipo_ts      ON public.eventos_clinicos USING btree (tipo, ts DESC);
CREATE INDEX idx_eventos_evolucao     ON public.eventos_clinicos USING btree (evolucao_id) WHERE (evolucao_id IS NOT NULL);
CREATE INDEX idx_eventos_review       ON public.eventos_clinicos USING btree (requires_review, created_at DESC) WHERE (requires_review = true);

-- pendencias
CREATE INDEX idx_pendencias_pac_aberta  ON public.pendencias USING btree (paciente_id) WHERE (concluida = false);
CREATE INDEX idx_pendencias_prioridade  ON public.pendencias USING btree (prioridade, created_at) WHERE (concluida = false);

-- atbs
CREATE INDEX idx_atbs_droga      ON public.atbs USING btree (droga);
CREATE INDEX idx_atbs_pac_ativo  ON public.atbs USING btree (paciente_id, data_inicio DESC) WHERE (data_fim IS NULL);

-- culturas
CREATE INDEX idx_culturas_pac_coleta  ON public.culturas USING btree (paciente_id, coleta_ts DESC);
CREATE INDEX idx_culturas_agente      ON public.culturas USING btree (agente) WHERE (agente IS NOT NULL);

-- antibiograma
CREATE INDEX        idx_antibiograma_cultura     ON public.antibiograma USING btree (cultura_id);
CREATE UNIQUE INDEX uq_antibiograma_cultura_atb  ON public.antibiograma USING btree (cultura_id, antibiotico);

-- alerts_log
CREATE UNIQUE INDEX uq_alerts_hash       ON public.alerts_log USING btree (hash_key);
CREATE INDEX idx_alerts_pac_ack          ON public.alerts_log USING btree (paciente_id, acked, created_at DESC);
CREATE INDEX idx_alerts_severidade       ON public.alerts_log USING btree (severidade, created_at DESC) WHERE (acked = false);

-- ingest_audit_log
CREATE INDEX idx_ingest_audit_pac     ON public.ingest_audit_log USING btree (paciente_id, created_at DESC);
CREATE INDEX idx_ingest_audit_falhas  ON public.ingest_audit_log USING btree (created_at DESC) WHERE (ok = false);

-- memorias
CREATE INDEX memorias_embedding_hnsw_idx ON public.memorias USING hnsw (embedding vector_cosine_ops);


-- ============================================================================
-- 4. COMENTÁRIOS DE COLUNA (documentação)
-- ============================================================================
COMMENT ON COLUMN public.pacientes.dispositivos       IS 'Dispositivos em uso: {mv, dva, sed, atb, cvc, trr} — booleans';
COMMENT ON COLUMN public.pacientes.isolation          IS 'Precaução de isolamento: none | contact | droplet | aerosol';
COMMENT ON COLUMN public.pacientes.out_of_range_count IS 'Nº de parâmetros fora do range clínico';
COMMENT ON COLUMN public.pacientes.severidade_visual  IS 'Semáforo clínico: red | yellow | green';
COMMENT ON COLUMN public.pacientes.patient_summary    IS 'Patient Summary (SASI) — resumo persistente da admissão com dispositivos, HPMA, plano terapêutico/metas. Atualizado a cada evolução pontual.';
COMMENT ON COLUMN public.evolucoes.prescricao         IS 'Kardex/prescricao vigente estruturada por categoria (cardiovascular, snc, gastro_endocrino, infeccioso_resp, sintomaticos_sn, solucoes_diureticos, nutricao). Cada categoria e um array de strings com a prescricao.';

-- ============================================================================
-- FIM DO TEMPLATE
-- ============================================================================
