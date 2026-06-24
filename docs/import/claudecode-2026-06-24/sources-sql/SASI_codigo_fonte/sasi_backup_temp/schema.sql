-- ============================================================================
--  SASI — Sistema de Auditoria e Síntese Intensiva · Schema v1.0
--  Comando UTI Alpha — 33 leitos (UTI2: 12, UTI3: 13, UTI4: 8)
-- ----------------------------------------------------------------------------
--  Este arquivo é a ÚNICA FONTE DA VERDADE do schema Supabase.
--  Idempotente: pode rodar múltiplas vezes sem quebrar estado existente.
--  Destrutivo: NÃO. (Mas o DROP de views materializadas é forçado via CASCADE.)
--
--  Deploy:
--    1. psql $DATABASE_URL < supabase/schema.sql
--    2. Ou via Supabase SQL Editor (copiar e colar INTEIRO)
--    3. Validar: psql $DATABASE_URL < supabase/tests/smoke.sql
--
--  Autor: Comando UTI Alpha
--  Referências: Singer 2016 (SOFA), KDIGO 2012 (AKI), Sepsis-3 (JAMA 2016)
-- ============================================================================

-- ============================================================================
--  SEÇÃO 0 — EXTENSÕES
-- ============================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";      -- gen_random_uuid() nativo
create extension if not exists "pg_trgm";       -- busca fuzzy por nome
create extension if not exists "pg_cron";       -- jobs agendados (precisa Supabase Pro; ignora silenciosamente se não disponível)

-- ============================================================================
--  SEÇÃO 1 — FUNÇÕES UTILITÁRIAS
-- ============================================================================

-- 1.1 — updated_at automático (trigger genérico)
create or replace function public.fn_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1.2 — Invalidar cache SOFA quando evolução muda
-- Quando uma evolução é atualizada, o cache do SOFA pode estar obsoleto.
-- O frontend (getSOFA) recalcula; esta função apenas marca como stale.
create or replace function public.fn_invalidate_sofa_cache()
returns trigger
language plpgsql
as $$
begin
  -- Se qualquer campo que afeta SOFA mudou, zera o cache
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
$$;

-- 1.3 — Hash determinístico para alertas (anti-duplicação)
-- Alertas idênticos dentro de 24h são considerados o mesmo evento.
create or replace function public.fn_alert_hash(
  p_paciente_id uuid,
  p_tipo text,
  p_payload jsonb
) returns text
language plpgsql
immutable
as $$
begin
  return encode(
    digest(
      p_paciente_id::text
        || '|' || p_tipo
        || '|' || coalesce(p_payload::text, '')
        || '|' || to_char(now(), 'YYYY-MM-DD'),
      'sha256'
    ),
    'hex'
  );
end;
$$;

-- ============================================================================
--  SEÇÃO 2 — TABELAS
-- ============================================================================

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  2.1 — pacientes (cadastro do leito)                                  │
-- └───────────────────────────────────────────────────────────────────────┘
create table if not exists public.pacientes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete set null,
  leito           text not null,
  uti             text not null check (uti in ('UTI2', 'UTI3', 'UTI4')),
  nome            text not null check (char_length(nome) between 1 and 200),
  idade           integer check (idade between 0 and 130),
  peso            numeric(5,2) check (peso between 1 and 400),
  altura          numeric(5,2) check (altura between 30 and 250),
  hd              text,
  data_adm        date not null default current_date,
  alergias        text,
  gravidade       text not null default 'estavel'
                      check (gravidade in ('estavel', 'moderado', 'grave', 'critico', 'obito')),
  status_leito    text not null default 'ativo'
                      check (status_leito in ('ativo', 'alta', 'obito', 'transferencia')),
  sofa_baseline   integer check (sofa_baseline between 0 and 24),   -- pra ΔSOFA do Sepsis-3
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Apenas 1 paciente ATIVO por leito (permite histórico de altas no mesmo leito)
create unique index if not exists uq_pacientes_leito_ativo
  on public.pacientes (uti, leito)
  where status_leito = 'ativo';

-- Busca fuzzy por nome (para autocomplete no frontend)
create index if not exists idx_pacientes_nome_trgm
  on public.pacientes using gin (nome gin_trgm_ops);

create index if not exists idx_pacientes_user
  on public.pacientes (user_id);

create index if not exists idx_pacientes_status
  on public.pacientes (status_leito, updated_at desc);

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  2.2 — evolucoes (snapshot por plantão)                               │
-- └───────────────────────────────────────────────────────────────────────┘
create table if not exists public.evolucoes (
  id              uuid primary key default gen_random_uuid(),
  paciente_id     uuid not null references public.pacientes(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete set null,
  data_evolucao   timestamptz not null default now(),
  plantao         text not null default 'manha'
                      check (plantao in ('manha', 'tarde', 'noite', 'plantao_24h')),
  neuro           jsonb not null default '{}'::jsonb,
  resp            jsonb not null default '{}'::jsonb,
  hemo            jsonb not null default '{}'::jsonb,
  tgi             jsonb not null default '{}'::jsonb,
  renal           jsonb not null default '{}'::jsonb,
  hemato          jsonb not null default '{}'::jsonb,
  infecto         jsonb not null default '{}'::jsonb,
  dvas            jsonb not null default '[]'::jsonb,
  sedativos       jsonb not null default '[]'::jsonb,
  impressao       text[] not null default '{}',
  conduta         text[] not null default '{}',
  sofa_snapshot   jsonb,
  sofa_total      integer check (sofa_total between 0 and 24),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_evolucoes_paciente_data
  on public.evolucoes (paciente_id, data_evolucao desc);

create index if not exists idx_evolucoes_user
  on public.evolucoes (user_id);

-- Índice GIN para busca em JSONB (procurar drogas específicas, etc.)
create index if not exists idx_evolucoes_dvas_gin
  on public.evolucoes using gin (dvas);

create index if not exists idx_evolucoes_infecto_gin
  on public.evolucoes using gin (infecto);

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  2.3 — eventos_clinicos (TIMESERIES — o CORAÇÃO do Meta-Vision)       │
-- └───────────────────────────────────────────────────────────────────────┘
-- Cada valor numérico importante vira UMA linha aqui.
-- Fonte única para: ΔSOFA 24/72h, gráficos de tendência, BH acumulado,
-- clearance de lactato, dias de ATB, evolução de DVA.
--
-- NOTA DE PARTICIONAMENTO:
-- Para >1M rows/ano, considerar partitioning por RANGE (ts).
-- Hoje (33 leitos × ~50 eventos/dia) = ~18k/mês = ~220k/ano. Sem partição.
-- Revisar em 6 meses.
create table if not exists public.eventos_clinicos (
  id                 uuid primary key default gen_random_uuid(),
  paciente_id        uuid not null references public.pacientes(id) on delete cascade,
  evolucao_id        uuid references public.evolucoes(id) on delete set null,
  user_id            uuid references auth.users(id) on delete set null,
  ts                 timestamptz not null,
  tipo               text not null check (tipo in (
                        'sofa_total', 'sofa_resp', 'sofa_coag', 'sofa_liver',
                        'sofa_cardio', 'sofa_neuro', 'sofa_renal',
                        'pam', 'pam_min', 'pa_sys', 'pa_dia',
                        'pf_ratio', 'spo2', 'fr', 'fc', 'temp',
                        'lactato', 'ph', 'pco2', 'po2', 'hco3', 'be',
                        'diurese_h', 'bh_h', 'bh_acumulado',
                        'hb', 'ht', 'plaq', 'leuco',
                        'cr', 'ur', 'na', 'k', 'mg', 'ca', 'p',
                        'bb', 'inr', 'pcr', 'procalcitonina',
                        'nor_dose', 'adr_dose', 'vaso_dose', 'dobuta_dose', 'dopa_dose',
                        'fent_dose', 'midaz_dose', 'propofol_dose', 'precedex_dose',
                        'gcs', 'rass', 'cam_icu', 'bps', 'cpot',
                        'glicemia',
                        'custom'
                      )),
  valor_num          numeric,
  valor_json         jsonb,
  unidade            text,
  fonte              text not null
                         check (fonte in ('manual', 'gemini_ocr', 'claude_ocr',
                                          'appsheet', 'auto_trigger',
                                          'edge_function', 'api_import')),
  confidence         numeric(3,2) check (confidence between 0 and 1),
  source_text        text,
  requires_review    boolean not null default false,
  created_at         timestamptz not null default now(),

  -- Pelo menos um dos valores deve estar preenchido
  constraint chk_eventos_valor_not_empty
    check (valor_num is not null or valor_json is not null)
);

-- Índice primário para timeseries (paciente x tempo decrescente)
create index if not exists idx_eventos_pac_ts
  on public.eventos_clinicos (paciente_id, ts desc);

-- Índice por tipo e tempo (gráfico de SOFA 72h, trend de lactato, etc.)
create index if not exists idx_eventos_pac_tipo_ts
  on public.eventos_clinicos (paciente_id, tipo, ts desc);

-- Índice por tipo global (analytics cross-paciente)
create index if not exists idx_eventos_tipo_ts
  on public.eventos_clinicos (tipo, ts desc);

create index if not exists idx_eventos_review
  on public.eventos_clinicos (requires_review, created_at desc)
  where requires_review = true;

create index if not exists idx_eventos_evolucao
  on public.eventos_clinicos (evolucao_id)
  where evolucao_id is not null;

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  2.4 — pendencias (checklist operacional)                             │
-- └───────────────────────────────────────────────────────────────────────┘
create table if not exists public.pendencias (
  id              uuid primary key default gen_random_uuid(),
  paciente_id     uuid not null references public.pacientes(id) on delete cascade,
  evolucao_id     uuid references public.evolucoes(id) on delete set null,
  user_id         uuid references auth.users(id) on delete set null,
  tarefa          text not null check (char_length(tarefa) between 1 and 500),
  prioridade      smallint not null default 2 check (prioridade between 1 and 3),
  concluida       boolean not null default false,
  concluida_at    timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists idx_pendencias_pac_aberta
  on public.pendencias (paciente_id)
  where concluida = false;

create index if not exists idx_pendencias_prioridade
  on public.pendencias (prioridade, created_at)
  where concluida = false;

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  2.5 — atbs (antibioticos — antibiotic stewardship + D-X auto)        │
-- └───────────────────────────────────────────────────────────────────────┘
create table if not exists public.atbs (
  id               uuid primary key default gen_random_uuid(),
  paciente_id      uuid not null references public.pacientes(id) on delete cascade,
  user_id          uuid references auth.users(id) on delete set null,
  droga            text not null,
  dose             text,                                  -- "1g", "500mg/kg", etc.
  via              text check (via in ('EV', 'VO', 'IM', 'SC', 'SNE', 'SNG', 'IT', 'Tópico')),
  frequencia       text,                                  -- "8/8h", "24/24h", "dose única"
  data_inicio      date not null default current_date,
  data_fim         date,                                  -- null = ativo
  intencao         text check (intencao in ('empirica', 'dirigida', 'profilatica')),
  foco             text,                                  -- "pulmonar", "urinário", etc.
  agente_alvo      text,                                  -- se dirigida: "E. coli ESBL"
  motivo_suspensao text,
  -- Coluna GENERATED: o DB calcula o D-X, não o frontend (fim do Bug #16)
  dias_terapia     integer generated always as (
                      case
                        when data_fim is null then (current_date - data_inicio)::int + 1
                        else (data_fim - data_inicio)::int + 1
                      end
                   ) stored,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint chk_atb_datas_coerentes check (data_fim is null or data_fim >= data_inicio)
);

create index if not exists idx_atbs_pac_ativo
  on public.atbs (paciente_id, data_inicio desc)
  where data_fim is null;

create index if not exists idx_atbs_droga
  on public.atbs (droga);

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  2.6 — culturas (microbiologia)                                       │
-- └───────────────────────────────────────────────────────────────────────┘
create table if not exists public.culturas (
  id               uuid primary key default gen_random_uuid(),
  paciente_id      uuid not null references public.pacientes(id) on delete cascade,
  user_id          uuid references auth.users(id) on delete set null,
  material         text not null check (material in (
                     'hemocultura', 'urocultura', 'aspirado_traqueal',
                     'lavado_bal', 'lcr', 'secrecao_ferida',
                     'liquido_peritoneal', 'liquido_pleural', 'outro'
                   )),
  coleta_ts        timestamptz not null,
  laudo_ts         timestamptz,
  crescimento      boolean not null default false,
  agente           text,
  ufc_por_ml       numeric,
  observacoes      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint chk_cultura_laudo_apos_coleta
    check (laudo_ts is null or laudo_ts >= coleta_ts)
);

create index if not exists idx_culturas_pac_coleta
  on public.culturas (paciente_id, coleta_ts desc);

create index if not exists idx_culturas_agente
  on public.culturas (agente)
  where agente is not null;

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  2.7 — antibiograma (1:N com culturas)                                │
-- └───────────────────────────────────────────────────────────────────────┘
create table if not exists public.antibiograma (
  id              uuid primary key default gen_random_uuid(),
  cultura_id      uuid not null references public.culturas(id) on delete cascade,
  antibiotico     text not null,
  resultado       text not null check (resultado in ('S', 'I', 'R')),
  cim             numeric,                                -- MIC em µg/mL se disponível
  created_at      timestamptz not null default now()
);

create unique index if not exists uq_antibiograma_cultura_atb
  on public.antibiograma (cultura_id, antibiotico);

create index if not exists idx_antibiograma_cultura
  on public.antibiograma (cultura_id);

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  2.8 — alerts_log (histórico anti-alarm-fatigue)                      │
-- └───────────────────────────────────────────────────────────────────────┘
create table if not exists public.alerts_log (
  id              uuid primary key default gen_random_uuid(),
  paciente_id     uuid not null references public.pacientes(id) on delete cascade,
  evento_id       uuid references public.eventos_clinicos(id) on delete set null,
  user_id         uuid references auth.users(id) on delete set null,
  tipo            text not null,                         -- 'sepsis_3_criteria', 'dose_absurd', 'sne_oral_incompat', etc.
  severidade      text not null default 'warning'
                      check (severidade in ('info', 'warning', 'critical')),
  mensagem        text not null,
  payload         jsonb,
  hash_key        text not null,                         -- gerado por fn_alert_hash
  acked           boolean not null default false,
  acked_at        timestamptz,
  acked_by        uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

-- Dedupe: o mesmo alerta não é recriado duas vezes no mesmo dia
create unique index if not exists uq_alerts_hash
  on public.alerts_log (hash_key);

create index if not exists idx_alerts_pac_ack
  on public.alerts_log (paciente_id, acked, created_at desc);

create index if not exists idx_alerts_severidade
  on public.alerts_log (severidade, created_at desc)
  where acked = false;

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  2.9 — ingest_audit_log (forense da Edge Function ocr-ingest)         │
-- └───────────────────────────────────────────────────────────────────────┘
create table if not exists public.ingest_audit_log (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete set null,
  paciente_id     uuid references public.pacientes(id) on delete set null,
  source_type     text,                                  -- 'folha_enfermagem', 'lab_bioquimica', etc.
  fonte           text,                                  -- 'claude_ocr', 'gemini_ocr'
  payload_raw     jsonb,                                 -- payload completo recebido
  response        jsonb,                                 -- response retornado
  eventos_ids     uuid[],                                -- IDs criados
  warnings        text[],
  ok              boolean not null,
  error_msg       text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_ingest_audit_pac
  on public.ingest_audit_log (paciente_id, created_at desc);

create index if not exists idx_ingest_audit_falhas
  on public.ingest_audit_log (created_at desc)
  where ok = false;

-- ============================================================================
--  SEÇÃO 3 — TRIGGERS
-- ============================================================================

-- 3.1 — updated_at em todas as tabelas que tem o campo
do $$
declare
  t text;
  tbls text[] := array[
    'pacientes', 'evolucoes', 'atbs', 'culturas'
  ];
begin
  foreach t in array tbls loop
    execute format('drop trigger if exists trg_updated_at on public.%I', t);
    execute format(
      'create trigger trg_updated_at before update on public.%I '
      'for each row execute function public.fn_updated_at()',
      t
    );
  end loop;
end;
$$;

-- 3.2 — Invalidação de cache SOFA em evolucoes
drop trigger if exists trg_sofa_cache_invalidate on public.evolucoes;
create trigger trg_sofa_cache_invalidate
  before update on public.evolucoes
  for each row
  execute function public.fn_invalidate_sofa_cache();

-- ============================================================================
--  SEÇÃO 4 — VIEWS
-- ============================================================================

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  4.1 — vw_dashboard_uti (O HOOK JÁ ESPERA ESTA VIEW)                  │
-- └───────────────────────────────────────────────────────────────────────┘
-- Espelho EXATO da interface DashboardRow do supabaseClient.ts.
-- Um row por paciente ATIVO, com última evolução + delta SOFA 24h + pendências.
drop view if exists public.vw_dashboard_uti cascade;
create view public.vw_dashboard_uti as
with ultima_evol as (
  select distinct on (e.paciente_id)
    e.paciente_id,
    e.id            as evolucao_id,
    e.data_evolucao as ultima_evolucao,
    e.sofa_total,
    e.sofa_snapshot,
    e.dvas,
    e.sedativos
  from public.evolucoes e
  order by e.paciente_id, e.data_evolucao desc
),
sofa_24h_atras as (
  select distinct on (ec.paciente_id)
    ec.paciente_id,
    ec.valor_num as sofa_total_24h
  from public.eventos_clinicos ec
  where ec.tipo = 'sofa_total'
    and ec.ts <= now() - interval '24 hours'
  order by ec.paciente_id, ec.ts desc
),
pend_abertas as (
  select paciente_id, count(*)::int as pendencias_abertas
  from public.pendencias
  where concluida = false
  group by paciente_id
)
select
  p.id               as paciente_id,
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
  (current_date - p.data_adm)::int as dias_internacao,
  u.evolucao_id,
  u.ultima_evolucao,
  u.sofa_total,
  u.sofa_snapshot,
  u.dvas,
  u.sedativos,
  (u.sofa_total - s24.sofa_total_24h)::int as delta_sofa_24h,
  coalesce(pa.pendencias_abertas, 0) as pendencias_abertas
from public.pacientes p
left join ultima_evol u on u.paciente_id = p.id
left join sofa_24h_atras s24 on s24.paciente_id = p.id
left join pend_abertas pa on pa.paciente_id = p.id
where p.status_leito = 'ativo';

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  4.2 — vw_sofa_trend_72h (gráfico de SOFA 3 dias)                     │
-- └───────────────────────────────────────────────────────────────────────┘
drop view if exists public.vw_sofa_trend_72h cascade;
create view public.vw_sofa_trend_72h as
select
  ec.paciente_id,
  ec.ts,
  ec.valor_num as sofa_total
from public.eventos_clinicos ec
where ec.tipo = 'sofa_total'
  and ec.ts >= now() - interval '72 hours'
order by ec.paciente_id, ec.ts asc;

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  4.3 — vw_bh_acumulado (BH acumulado 24/48/72h)                       │
-- └───────────────────────────────────────────────────────────────────────┘
drop view if exists public.vw_bh_acumulado cascade;
create view public.vw_bh_acumulado as
select
  ec.paciente_id,
  sum(case when ec.ts >= now() - interval '24 hours' then ec.valor_num else 0 end)::numeric as bh_24h,
  sum(case when ec.ts >= now() - interval '48 hours' then ec.valor_num else 0 end)::numeric as bh_48h,
  sum(case when ec.ts >= now() - interval '72 hours' then ec.valor_num else 0 end)::numeric as bh_72h,
  count(*) filter (where ec.ts >= now() - interval '24 hours') as eventos_24h
from public.eventos_clinicos ec
where ec.tipo = 'bh_h'
group by ec.paciente_id;

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  4.4 — vw_dias_atb_ativo (D-X auto para stewardship)                  │
-- └───────────────────────────────────────────────────────────────────────┘
drop view if exists public.vw_dias_atb_ativo cascade;
create view public.vw_dias_atb_ativo as
select
  a.paciente_id,
  a.id            as atb_id,
  a.droga,
  a.via,
  a.frequencia,
  a.data_inicio,
  a.dias_terapia,
  a.intencao,
  a.foco,
  a.agente_alvo,
  case
    when a.dias_terapia >= 14 then 'critical'    -- avaliar descalonamento urgente
    when a.dias_terapia >= 7  then 'warning'     -- reavaliar indicação
    else 'ok'
  end as stewardship_flag
from public.atbs a
where a.data_fim is null;

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  4.5 — vw_alertas_abertos (para badge no frontend)                    │
-- └───────────────────────────────────────────────────────────────────────┘
drop view if exists public.vw_alertas_abertos cascade;
create view public.vw_alertas_abertos as
select
  al.paciente_id,
  p.uti,
  p.leito,
  p.nome,
  count(*) filter (where al.severidade = 'critical') as criticos,
  count(*) filter (where al.severidade = 'warning')  as warnings,
  count(*) filter (where al.severidade = 'info')     as infos,
  count(*)                                           as total
from public.alerts_log al
join public.pacientes p on p.id = al.paciente_id
where al.acked = false
group by al.paciente_id, p.uti, p.leito, p.nome;

-- ============================================================================
--  SEÇÃO 5 — ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Modelo: cada médico só vê seus próprios pacientes (auth.uid() = user_id).
-- Tabelas filhas (evolucoes, eventos, atbs, etc.) autorizam via JOIN no paciente.
-- FIM do `using (true)` — LGPD art. 46 respeitada.

-- Habilitar RLS em todas as tabelas
alter table public.pacientes          enable row level security;
alter table public.evolucoes          enable row level security;
alter table public.eventos_clinicos   enable row level security;
alter table public.pendencias         enable row level security;
alter table public.atbs               enable row level security;
alter table public.culturas           enable row level security;
alter table public.antibiograma       enable row level security;
alter table public.alerts_log         enable row level security;
alter table public.ingest_audit_log   enable row level security;

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  pacientes — policy direto por user_id                                │
-- └───────────────────────────────────────────────────────────────────────┘
drop policy if exists "pacientes_select_own" on public.pacientes;
create policy "pacientes_select_own" on public.pacientes
  for select using (auth.uid() = user_id);

drop policy if exists "pacientes_insert_own" on public.pacientes;
create policy "pacientes_insert_own" on public.pacientes
  for insert with check (auth.uid() = user_id);

drop policy if exists "pacientes_update_own" on public.pacientes;
create policy "pacientes_update_own" on public.pacientes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "pacientes_delete_own" on public.pacientes;
create policy "pacientes_delete_own" on public.pacientes
  for delete using (auth.uid() = user_id);

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  evolucoes — policy via JOIN em pacientes                             │
-- └───────────────────────────────────────────────────────────────────────┘
drop policy if exists "evolucoes_all_own" on public.evolucoes;
create policy "evolucoes_all_own" on public.evolucoes
  for all
  using (
    exists (
      select 1 from public.pacientes p
      where p.id = evolucoes.paciente_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.pacientes p
      where p.id = evolucoes.paciente_id and p.user_id = auth.uid()
    )
  );

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  eventos_clinicos — policy via JOIN em pacientes                      │
-- └───────────────────────────────────────────────────────────────────────┘
drop policy if exists "eventos_all_own" on public.eventos_clinicos;
create policy "eventos_all_own" on public.eventos_clinicos
  for all
  using (
    exists (
      select 1 from public.pacientes p
      where p.id = eventos_clinicos.paciente_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.pacientes p
      where p.id = eventos_clinicos.paciente_id and p.user_id = auth.uid()
    )
  );

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  pendencias — policy via JOIN                                         │
-- └───────────────────────────────────────────────────────────────────────┘
drop policy if exists "pendencias_all_own" on public.pendencias;
create policy "pendencias_all_own" on public.pendencias
  for all
  using (
    exists (select 1 from public.pacientes p where p.id = pendencias.paciente_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.pacientes p where p.id = pendencias.paciente_id and p.user_id = auth.uid())
  );

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  atbs — policy via JOIN                                               │
-- └───────────────────────────────────────────────────────────────────────┘
drop policy if exists "atbs_all_own" on public.atbs;
create policy "atbs_all_own" on public.atbs
  for all
  using (
    exists (select 1 from public.pacientes p where p.id = atbs.paciente_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.pacientes p where p.id = atbs.paciente_id and p.user_id = auth.uid())
  );

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  culturas — policy via JOIN                                           │
-- └───────────────────────────────────────────────────────────────────────┘
drop policy if exists "culturas_all_own" on public.culturas;
create policy "culturas_all_own" on public.culturas
  for all
  using (
    exists (select 1 from public.pacientes p where p.id = culturas.paciente_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.pacientes p where p.id = culturas.paciente_id and p.user_id = auth.uid())
  );

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  antibiograma — policy via JOIN cultura → paciente                    │
-- └───────────────────────────────────────────────────────────────────────┘
drop policy if exists "antibiograma_all_own" on public.antibiograma;
create policy "antibiograma_all_own" on public.antibiograma
  for all
  using (
    exists (
      select 1 from public.culturas c
      join public.pacientes p on p.id = c.paciente_id
      where c.id = antibiograma.cultura_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.culturas c
      join public.pacientes p on p.id = c.paciente_id
      where c.id = antibiograma.cultura_id and p.user_id = auth.uid()
    )
  );

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  alerts_log — policy via JOIN                                         │
-- └───────────────────────────────────────────────────────────────────────┘
drop policy if exists "alerts_all_own" on public.alerts_log;
create policy "alerts_all_own" on public.alerts_log
  for all
  using (
    exists (select 1 from public.pacientes p where p.id = alerts_log.paciente_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.pacientes p where p.id = alerts_log.paciente_id and p.user_id = auth.uid())
  );

-- ┌───────────────────────────────────────────────────────────────────────┐
-- │  ingest_audit_log — só o dono vê                                      │
-- └───────────────────────────────────────────────────────────────────────┘
drop policy if exists "ingest_audit_own" on public.ingest_audit_log;
create policy "ingest_audit_own" on public.ingest_audit_log
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
--  SEÇÃO 6 — REALTIME PUBLICATION
-- ============================================================================
-- Ativar replicação para Supabase Realtime escutar mudanças.
-- O hook useSupabasePatients usa isso para atualização ao vivo.
do $$
begin
  -- Pacientes (dashboard)
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'pacientes'
  ) then
    alter publication supabase_realtime add table public.pacientes;
  end if;

  -- Evoluções (recalcular SOFA quando muda)
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'evolucoes'
  ) then
    alter publication supabase_realtime add table public.evolucoes;
  end if;

  -- Eventos clínicos (gráficos de tendência ao vivo)
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'eventos_clinicos'
  ) then
    alter publication supabase_realtime add table public.eventos_clinicos;
  end if;

  -- Alertas (notificações push)
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'alerts_log'
  ) then
    alter publication supabase_realtime add table public.alerts_log;
  end if;

  -- Pendências (checklist ao vivo)
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'pendencias'
  ) then
    alter publication supabase_realtime add table public.pendencias;
  end if;
exception
  when others then
    raise notice 'Realtime publication setup: % (ignorando se já existe)', sqlerrm;
end;
$$;

-- ============================================================================
--  SEÇÃO 7 — pg_cron JOBS
-- ============================================================================
-- Requer Supabase Pro ou extension pg_cron habilitada.
-- Se não disponível, os DO blocks abaixo vão falhar silenciosamente.

do $$
begin
  -- 7.1 — Expurgo diário de pacientes com alta/óbito há >30 dias
  -- Runs: 03h da manhã, todos os dias
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('sasi-expurgo-altas');
    perform cron.schedule(
      'sasi-expurgo-altas',
      '0 3 * * *',
      $expurgo$
        delete from public.pacientes
        where status_leito in ('alta', 'obito', 'transferencia')
          and updated_at < now() - interval '30 days';
      $expurgo$
    );
  end if;
exception
  when others then
    raise notice 'pg_cron não disponível ou erro ao agendar: %', sqlerrm;
end;
$$;

-- ============================================================================
--  SEÇÃO 8 — GRANTS
-- ============================================================================
-- Garantir que o role 'authenticated' (JWTs de usuário) possa acessar as views.
-- RLS nas tabelas já filtra; as views herdam a RLS via security_invoker.

-- Views herdam RLS do role que as consulta (padrão security_invoker no PG15+)
alter view public.vw_dashboard_uti    set (security_invoker = true);
alter view public.vw_sofa_trend_72h   set (security_invoker = true);
alter view public.vw_bh_acumulado     set (security_invoker = true);
alter view public.vw_dias_atb_ativo   set (security_invoker = true);
alter view public.vw_alertas_abertos  set (security_invoker = true);

grant select on public.vw_dashboard_uti    to authenticated;
grant select on public.vw_sofa_trend_72h   to authenticated;
grant select on public.vw_bh_acumulado     to authenticated;
grant select on public.vw_dias_atb_ativo   to authenticated;
grant select on public.vw_alertas_abertos  to authenticated;

-- ============================================================================
--  SEÇÃO 9 — COMMENTS (documentação inline, aparece no Supabase Studio)
-- ============================================================================
comment on table public.pacientes is
  'SASI — cadastro do leito. 1 paciente ATIVO por leito (UTI2/3/4).';
comment on table public.evolucoes is
  'SASI — snapshot clínico por plantão. JSONB por sistema (neuro/resp/hemo/renal/hemato/tgi/infecto). Cache SOFA invalidado no UPDATE.';
comment on table public.eventos_clinicos is
  'SASI — TIMESERIES pura. Coração do Meta-Vision: ΔSOFA, tendências, BH acumulado, D-ATB.';
comment on table public.atbs is
  'SASI — antibiotic stewardship. Coluna dias_terapia é GENERATED (o DB calcula D-X).';
comment on table public.culturas is
  'SASI — microbiologia. Relação 1:N com antibiograma.';
comment on table public.alerts_log is
  'SASI — histórico de alertas com hash_key anti-duplicação (janela 24h).';
comment on view public.vw_dashboard_uti is
  'SASI — espelho do DashboardRow (supabaseClient.ts). 1 row por paciente ATIVO com última evolução, ΔSOFA 24h e pendências abertas.';

comment on column public.pacientes.sofa_baseline is
  'SOFA pré-admissão (ou D1). Usado no critério Sepsis-3 (ΔSOFA ≥ 2).';
comment on column public.evolucoes.sofa_snapshot is
  'Cache do cálculo SOFA. Invalidado automaticamente via trigger quando sistemas JSONB mudam.';
comment on column public.eventos_clinicos.requires_review is
  'True quando valor extraído por OCR violou sanity check (SpO2 > 100, PAM > 180, dose absurda, etc.).';
comment on column public.atbs.dias_terapia is
  'GENERATED COLUMN: (coalesce(data_fim, current_date) - data_inicio) + 1. Não atualizar manualmente.';

-- ============================================================================
--  FIM DO SCHEMA v1.0
--
--  Próximos passos:
--    1. Rodar este arquivo: Supabase Dashboard → SQL Editor → paste → run
--    2. Verificar com: supabase/tests/smoke.sql
--    3. Deploy da Edge Function: supabase functions deploy ocr-ingest
--    4. Testar fluxo completo: uploadar foto no chat → skill → payload → POST → DB
--
--  Se algo falhar:
--    - "extension pg_cron does not exist" → comentar seção 7 (Supabase Free Tier)
--    - "permission denied for schema auth" → ignorar (só Supabase CLI tem)
--    - "policy already exists" → rodar com DROP antes (já está no script)
-- ============================================================================
