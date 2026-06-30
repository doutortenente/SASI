-- ============================================================================
-- SASI — SCHEMA SUPABASE (DUMP DO ESTADO VIVO)
-- Projeto: idswehsvvqczzkiatuzu (sa-east-1) · PostgreSQL 17
-- Extraído do catálogo do Postgres em 10-Jun-2026 (pg_get_* + information_schema)
-- ----------------------------------------------------------------------------
-- FIEL AO BANCO ATUAL. Definições de views/triggers/funções são EXATAS
-- (emitidas por pg_get_viewdef / pg_get_triggerdef / pg_get_functiondef).
-- Tabelas reconstruídas a partir de information_schema + pg_constraint.
--
-- ⚠️  ALERTA LGPD: cada tabela carrega policy `dev_bypass` PERMISSIVE para role
--     `public` com USING(true)/CHECK(true). Policies permissivas combinam por OR
--     — isso ANULA as policies `_own`. PHI exposto via anon key. Ver SEÇÃO 6.
-- ============================================================================

create extension if not exists pgcrypto;   -- gen_random_uuid(), digest() sha256
create extension if not exists pg_trgm;     -- gin_trgm_ops (busca por nome)

-- ============================ SEÇÃO 1 — TABELAS =============================

create table if not exists public.pacientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, leito text not null, uti text not null, nome text not null,
  idade integer, peso numeric(5,2), altura numeric(5,2), hd text,
  data_adm date not null default current_date, alergias text,
  gravidade text not null default 'estavel', status_leito text not null default 'ativo',
  sofa_baseline integer, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), dispositivos jsonb not null default '{}'::jsonb,
  isolation text not null default 'none', out_of_range_count integer not null default 0,
  severidade_visual text not null default 'green', patient_summary jsonb,
  constraint pacientes_uti_check check (uti = any (array['UTI2','UTI3','UTI4'])),
  constraint pacientes_idade_check check (idade >= 0 and idade <= 130),
  constraint pacientes_peso_check check (peso >= 1 and peso <= 400),
  constraint pacientes_altura_check check (altura >= 30 and altura <= 250),
  constraint pacientes_nome_check check (char_length(nome) between 1 and 200),
  constraint pacientes_gravidade_check check (gravidade = any (array['estavel','moderado','grave','critico','obito'])),
  constraint pacientes_status_leito_check check (status_leito = any (array['ativo','alta','obito','transferencia'])),
  constraint pacientes_isolation_check check (isolation = any (array['none','contact','droplet','aerosol'])),
  constraint pacientes_severidade_visual_check check (severidade_visual = any (array['red','yellow','green'])),
  constraint pacientes_sofa_baseline_check check (sofa_baseline >= 0 and sofa_baseline <= 24),
  constraint pacientes_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null
);
create unique index if not exists uq_pacientes_leito_ativo on public.pacientes (uti, leito) where (status_leito = 'ativo');
create index if not exists idx_pacientes_severidade on public.pacientes (severidade_visual);
create index if not exists idx_pacientes_isolation on public.pacientes (isolation) where (isolation <> 'none');
create index if not exists idx_pacientes_status on public.pacientes (status_leito, updated_at desc);
create index if not exists idx_pacientes_user on public.pacientes (user_id);
create index if not exists idx_pacientes_nome_trgm on public.pacientes using gin (nome gin_trgm_ops);

create table if not exists public.evolucoes (
  id uuid primary key default gen_random_uuid(), paciente_id uuid not null, user_id uuid,
  data_evolucao timestamptz not null default now(), plantao text not null default 'manha',
  neuro jsonb not null default '{}'::jsonb, resp jsonb not null default '{}'::jsonb,
  hemo jsonb not null default '{}'::jsonb, tgi jsonb not null default '{}'::jsonb,
  renal jsonb not null default '{}'::jsonb, hemato jsonb not null default '{}'::jsonb,
  infecto jsonb not null default '{}'::jsonb, dvas jsonb not null default '[]'::jsonb,
  sedativos jsonb not null default '[]'::jsonb, impressao text[] not null default '{}'::text[],
  conduta text[] not null default '{}'::text[], sofa_snapshot jsonb, sofa_total integer,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  prescricao jsonb default '{}'::jsonb,
  constraint evolucoes_plantao_check check (plantao = any (array['manha','tarde','noite','plantao_24h'])),
  constraint evolucoes_sofa_total_check check (sofa_total >= 0 and sofa_total <= 24),
  constraint evolucoes_paciente_id_fkey foreign key (paciente_id) references public.pacientes(id) on delete cascade,
  constraint evolucoes_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null
);
create index if not exists idx_evolucoes_paciente_data on public.evolucoes (paciente_id, data_evolucao desc);
create index if not exists idx_evolucoes_user on public.evolucoes (user_id);
create index if not exists idx_evolucoes_dvas_gin on public.evolucoes using gin (dvas);
create index if not exists idx_evolucoes_infecto_gin on public.evolucoes using gin (infecto);

create table if not exists public.eventos_clinicos (
  id uuid primary key default gen_random_uuid(), paciente_id uuid not null, evolucao_id uuid,
  user_id uuid, ts timestamptz not null, tipo text not null, valor_num numeric, valor_json jsonb,
  unidade text, fonte text not null, confidence numeric(3,2), source_text text,
  requires_review boolean not null default false, created_at timestamptz not null default now(),
  constraint chk_eventos_valor_not_empty check (valor_num is not null or valor_json is not null),
  constraint eventos_clinicos_confidence_check check (confidence >= 0 and confidence <= 1),
  constraint eventos_clinicos_fonte_check check (fonte = any (array['manual','gemini_ocr','claude_ocr','appsheet','auto_trigger','edge_function','api_import'])),
  constraint eventos_clinicos_tipo_check check (tipo = any (array[
    'sofa_total','sofa_resp','sofa_coag','sofa_liver','sofa_cardio','sofa_neuro','sofa_renal',
    'pam','pam_min','pa_sys','pa_dia','pf_ratio','spo2','fr','fc','temp','lactato',
    'ph','pco2','po2','hco3','be','diurese_h','bh_h','bh_acumulado',
    'hb','ht','plaq','leuco','cr','ur','na','k','mg','ca','p','bb','inr','pcr','procalcitonina',
    'nor_dose','adr_dose','vaso_dose','dobuta_dose','dopa_dose',
    'fent_dose','midaz_dose','propofol_dose','precedex_dose',
    'gcs','rass','cam_icu','bps','cpot','glicemia','custom'])),
  constraint eventos_clinicos_paciente_id_fkey foreign key (paciente_id) references public.pacientes(id) on delete cascade,
  constraint eventos_clinicos_evolucao_id_fkey foreign key (evolucao_id) references public.evolucoes(id) on delete set null,
  constraint eventos_clinicos_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null
);
create index if not exists idx_eventos_pac_ts on public.eventos_clinicos (paciente_id, ts desc);
create index if not exists idx_eventos_pac_tipo_ts on public.eventos_clinicos (paciente_id, tipo, ts desc);
create index if not exists idx_eventos_tipo_ts on public.eventos_clinicos (tipo, ts desc);
create index if not exists idx_eventos_evolucao on public.eventos_clinicos (evolucao_id) where (evolucao_id is not null);
create index if not exists idx_eventos_review on public.eventos_clinicos (requires_review, created_at desc) where (requires_review = true);

create table if not exists public.atbs (
  id uuid primary key default gen_random_uuid(), paciente_id uuid not null, user_id uuid,
  droga text not null, dose text, via text, frequencia text,
  data_inicio date not null default current_date, data_fim date, intencao text, foco text,
  agente_alvo text, motivo_suspensao text, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint atbs_intencao_check check (intencao = any (array['empirica','dirigida','profilatica'])),
  constraint atbs_via_check check (via = any (array['EV','VO','IM','SC','SNE','SNG','IT','Tópico'])),
  constraint chk_atb_datas_coerentes check (data_fim is null or data_fim >= data_inicio),
  constraint atbs_paciente_id_fkey foreign key (paciente_id) references public.pacientes(id) on delete cascade,
  constraint atbs_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null
);
create index if not exists idx_atbs_pac_ativo on public.atbs (paciente_id, data_inicio desc) where (data_fim is null);
create index if not exists idx_atbs_droga on public.atbs (droga);

create table if not exists public.culturas (
  id uuid primary key default gen_random_uuid(), paciente_id uuid not null, user_id uuid,
  material text not null, coleta_ts timestamptz not null, laudo_ts timestamptz,
  crescimento boolean not null default false, agente text, ufc_por_ml numeric, observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint culturas_material_check check (material = any (array['hemocultura','urocultura','aspirado_traqueal','lavado_bal','lcr','secrecao_ferida','liquido_peritoneal','liquido_pleural','outro'])),
  constraint chk_cultura_laudo_apos_coleta check (laudo_ts is null or laudo_ts >= coleta_ts),
  constraint culturas_paciente_id_fkey foreign key (paciente_id) references public.pacientes(id) on delete cascade,
  constraint culturas_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null
);
create index if not exists idx_culturas_pac_coleta on public.culturas (paciente_id, coleta_ts desc);
create index if not exists idx_culturas_agente on public.culturas (agente) where (agente is not null);

create table if not exists public.antibiograma (
  id uuid primary key default gen_random_uuid(), cultura_id uuid not null, antibiotico text not null,
  resultado text not null, cim numeric, created_at timestamptz not null default now(),
  constraint antibiograma_resultado_check check (resultado = any (array['S','I','R'])),
  constraint antibiograma_cultura_id_fkey foreign key (cultura_id) references public.culturas(id) on delete cascade
);
create unique index if not exists uq_antibiograma_cultura_atb on public.antibiograma (cultura_id, antibiotico);
create index if not exists idx_antibiograma_cultura on public.antibiograma (cultura_id);

create table if not exists public.pendencias (
  id uuid primary key default gen_random_uuid(), paciente_id uuid not null, evolucao_id uuid,
  user_id uuid, tarefa text not null, prioridade smallint not null default 2,
  concluida boolean not null default false, concluida_at timestamptz,
  created_at timestamptz not null default now(),
  constraint pendencias_prioridade_check check (prioridade >= 1 and prioridade <= 3),
  constraint pendencias_tarefa_check check (char_length(tarefa) between 1 and 500),
  constraint pendencias_paciente_id_fkey foreign key (paciente_id) references public.pacientes(id) on delete cascade,
  constraint pendencias_evolucao_id_fkey foreign key (evolucao_id) references public.evolucoes(id) on delete set null,
  constraint pendencias_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null
);
create index if not exists idx_pendencias_prioridade on public.pendencias (prioridade, created_at) where (concluida = false);
create index if not exists idx_pendencias_pac_aberta on public.pendencias (paciente_id) where (concluida = false);

create table if not exists public.alerts_log (
  id uuid primary key default gen_random_uuid(), paciente_id uuid not null, evento_id uuid,
  user_id uuid, tipo text not null, severidade text not null default 'warning', mensagem text not null,
  payload jsonb, hash_key text not null, acked boolean not null default false,
  acked_at timestamptz, acked_by uuid, created_at timestamptz not null default now(),
  constraint alerts_log_severidade_check check (severidade = any (array['info','warning','critical'])),
  constraint alerts_log_paciente_id_fkey foreign key (paciente_id) references public.pacientes(id) on delete cascade,
  constraint alerts_log_evento_id_fkey foreign key (evento_id) references public.eventos_clinicos(id) on delete set null,
  constraint alerts_log_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null,
  constraint alerts_log_acked_by_fkey foreign key (acked_by) references auth.users(id)
);
create unique index if not exists uq_alerts_hash on public.alerts_log (hash_key);
create index if not exists idx_alerts_severidade on public.alerts_log (severidade, created_at desc) where (acked = false);
create index if not exists idx_alerts_pac_ack on public.alerts_log (paciente_id, acked, created_at desc);

create table if not exists public.ingest_audit_log (
  id uuid primary key default gen_random_uuid(), user_id uuid, paciente_id uuid,
  source_type text, fonte text, payload_raw jsonb, response jsonb, eventos_ids uuid[],
  warnings text[], ok boolean not null, error_msg text, created_at timestamptz not null default now(),
  constraint ingest_audit_log_paciente_id_fkey foreign key (paciente_id) references public.pacientes(id) on delete set null,
  constraint ingest_audit_log_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null
);
create index if not exists idx_ingest_audit_pac on public.ingest_audit_log (paciente_id, created_at desc);
create index if not exists idx_ingest_audit_falhas on public.ingest_audit_log (created_at desc) where (ok = false);

-- ===================== SEÇÃO 2 — FUNÇÕES (do projeto) ======================

create or replace function public.fn_updated_at() returns trigger language plpgsql
 set search_path to 'public','pg_catalog' as $function$
begin new.updated_at = now(); return new; end; $function$;

create or replace function public.fn_invalidate_sofa_cache() returns trigger language plpgsql
 set search_path to 'public','pg_catalog' as $function$
begin
  if (old.resp is distinct from new.resp) or (old.hemo is distinct from new.hemo) or
     (old.renal is distinct from new.renal) or (old.hemato is distinct from new.hemato) or
     (old.tgi is distinct from new.tgi) or (old.neuro is distinct from new.neuro) or
     (old.dvas is distinct from new.dvas) or (old.sedativos is distinct from new.sedativos) then
    new.sofa_snapshot = null; new.sofa_total = null;
  end if; return new; end; $function$;

create or replace function public.sync_severidade_visual() returns trigger language plpgsql as $function$
begin
  if (NEW.gravidade is distinct from OLD.gravidade) and
     (NEW.severidade_visual is not distinct from OLD.severidade_visual) then
    NEW.severidade_visual := case NEW.gravidade
      when 'critico' then 'red'::text when 'grave' then 'red'::text
      when 'moderado' then 'yellow'::text else 'green'::text end;
  end if; return NEW; end; $function$;

create or replace function public.fn_alert_hash(p_paciente_id uuid, p_tipo text, p_payload jsonb)
 returns text language plpgsql immutable set search_path to 'public','pg_catalog' as $function$
begin
  return encode(digest(p_paciente_id::text || '|' || p_tipo || '|' ||
    coalesce(p_payload::text,'') || '|' || to_char(now(),'YYYY-MM-DD'),'sha256'),'hex');
end; $function$;

-- ============================ SEÇÃO 3 — TRIGGERS ===========================
drop trigger if exists trg_updated_at on public.atbs;
create trigger trg_updated_at before update on public.atbs for each row execute function fn_updated_at();
drop trigger if exists trg_updated_at on public.culturas;
create trigger trg_updated_at before update on public.culturas for each row execute function fn_updated_at();
drop trigger if exists trg_updated_at on public.evolucoes;
create trigger trg_updated_at before update on public.evolucoes for each row execute function fn_updated_at();
drop trigger if exists trg_sofa_cache_invalidate on public.evolucoes;
create trigger trg_sofa_cache_invalidate before update on public.evolucoes for each row execute function fn_invalidate_sofa_cache();
drop trigger if exists trg_updated_at on public.pacientes;
create trigger trg_updated_at before update on public.pacientes for each row execute function fn_updated_at();
drop trigger if exists trg_sync_severidade_visual on public.pacientes;
create trigger trg_sync_severidade_visual before update on public.pacientes for each row execute function sync_severidade_visual();

-- ============================ SEÇÃO 4 — VIEWS ==============================

create or replace view public.vw_dashboard_uti as
 with ultima_evol as (
   select distinct on (e.paciente_id) e.paciente_id, e.id as evolucao_id,
          e.data_evolucao as ultima_evolucao, e.sofa_total, e.sofa_snapshot, e.dvas, e.sedativos
     from evolucoes e order by e.paciente_id, e.data_evolucao desc
 ), sofa_24h_atras as (
   select distinct on (ec.paciente_id) ec.paciente_id, ec.valor_num as sofa_total_24h
     from eventos_clinicos ec
    where ec.tipo = 'sofa_total' and ec.ts <= (now() - interval '24:00:00')
    order by ec.paciente_id, ec.ts desc
 ), pend_abertas as (
   select pendencias.paciente_id, count(*)::integer as pendencias_abertas
     from pendencias where pendencias.concluida = false group by pendencias.paciente_id
 )
 select p.id as paciente_id, p.user_id, p.leito, p.uti, p.nome, p.idade, p.peso, p.hd,
        p.gravidade, p.status_leito, p.data_adm, current_date - p.data_adm as dias_internacao,
        u.evolucao_id, u.ultima_evolucao, u.sofa_total, u.sofa_snapshot, u.dvas, u.sedativos,
        (u.sofa_total::numeric - s24.sofa_total_24h)::integer as delta_sofa_24h,
        coalesce(pa.pendencias_abertas, 0) as pendencias_abertas,
        p.dispositivos, p.isolation, p.out_of_range_count, p.severidade_visual
   from pacientes p
   left join ultima_evol u on u.paciente_id = p.id
   left join sofa_24h_atras s24 on s24.paciente_id = p.id
   left join pend_abertas pa on pa.paciente_id = p.id
  where p.status_leito = 'ativo';

create or replace view public.vw_sofa_trend_72h as
 select paciente_id, ts, valor_num as sofa_total from eventos_clinicos ec
  where tipo = 'sofa_total' and ts >= (now() - interval '72:00:00') order by paciente_id, ts;

create or replace view public.vw_bh_acumulado as
 select paciente_id,
        sum(case when ts >= (now() - interval '24:00:00') then valor_num else 0 end) as bh_24h,
        sum(case when ts >= (now() - interval '48:00:00') then valor_num else 0 end) as bh_48h,
        sum(case when ts >= (now() - interval '72:00:00') then valor_num else 0 end) as bh_72h,
        count(*) filter (where ts >= (now() - interval '24:00:00')) as eventos_24h
   from eventos_clinicos ec where tipo = 'bh_h' group by paciente_id;

create or replace view public.vw_dias_atb_ativo as
 select paciente_id, id as atb_id, droga, via, frequencia, data_inicio, intencao, foco, agente_alvo,
        current_date - data_inicio + 1 as dias_terapia,
        case when (current_date - data_inicio + 1) >= 14 then 'critical'
             when (current_date - data_inicio + 1) >= 7 then 'warning'
             else 'ok' end as stewardship_flag
   from atbs a where data_fim is null;

create or replace view public.vw_alertas_abertos as
 select al.paciente_id, p.uti, p.leito, p.nome,
        count(*) filter (where al.severidade = 'critical') as criticos,
        count(*) filter (where al.severidade = 'warning') as warnings,
        count(*) filter (where al.severidade = 'info') as infos, count(*) as total
   from alerts_log al join pacientes p on p.id = al.paciente_id
  where al.acked = false group by al.paciente_id, p.uti, p.leito, p.nome;

-- ============================ SEÇÃO 5 — RLS ================================
alter table public.pacientes enable row level security;
alter table public.evolucoes enable row level security;
alter table public.eventos_clinicos enable row level security;
alter table public.atbs enable row level security;
alter table public.culturas enable row level security;
alter table public.antibiograma enable row level security;
alter table public.pendencias enable row level security;
alter table public.alerts_log enable row level security;
alter table public.ingest_audit_log enable row level security;

create policy pacientes_select_own on public.pacientes for select using (auth.uid() = user_id);
create policy pacientes_insert_own on public.pacientes for insert with check (auth.uid() = user_id);
create policy pacientes_update_own on public.pacientes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy pacientes_delete_own on public.pacientes for delete using (auth.uid() = user_id);
create policy evolucoes_all_own on public.evolucoes for all
  using (exists (select 1 from pacientes p where p.id = evolucoes.paciente_id and p.user_id = auth.uid()))
  with check (exists (select 1 from pacientes p where p.id = evolucoes.paciente_id and p.user_id = auth.uid()));
create policy eventos_all_own on public.eventos_clinicos for all
  using (exists (select 1 from pacientes p where p.id = eventos_clinicos.paciente_id and p.user_id = auth.uid()))
  with check (exists (select 1 from pacientes p where p.id = eventos_clinicos.paciente_id and p.user_id = auth.uid()));
create policy atbs_all_own on public.atbs for all
  using (exists (select 1 from pacientes p where p.id = atbs.paciente_id and p.user_id = auth.uid()))
  with check (exists (select 1 from pacientes p where p.id = atbs.paciente_id and p.user_id = auth.uid()));
create policy culturas_all_own on public.culturas for all
  using (exists (select 1 from pacientes p where p.id = culturas.paciente_id and p.user_id = auth.uid()))
  with check (exists (select 1 from pacientes p where p.id = culturas.paciente_id and p.user_id = auth.uid()));
create policy antibiograma_all_own on public.antibiograma for all
  using (exists (select 1 from culturas c join pacientes p on p.id = c.paciente_id where c.id = antibiograma.cultura_id and p.user_id = auth.uid()))
  with check (exists (select 1 from culturas c join pacientes p on p.id = c.paciente_id where c.id = antibiograma.cultura_id and p.user_id = auth.uid()));
create policy pendencias_all_own on public.pendencias for all
  using (exists (select 1 from pacientes p where p.id = pendencias.paciente_id and p.user_id = auth.uid()))
  with check (exists (select 1 from pacientes p where p.id = pendencias.paciente_id and p.user_id = auth.uid()));
create policy alerts_all_own on public.alerts_log for all
  using (exists (select 1 from pacientes p where p.id = alerts_log.paciente_id and p.user_id = auth.uid()))
  with check (exists (select 1 from pacientes p where p.id = alerts_log.paciente_id and p.user_id = auth.uid()));
create policy ingest_audit_own on public.ingest_audit_log for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ================= SEÇÃO 6 — ⚠️ dev_bypass (BURACO LGPD ATIVO) =============
-- Existem no banco HOJE e anulam a SEÇÃO 5. NÃO criar em produção.
-- create policy dev_bypass on public.pacientes for all to public using (true) with check (true);
-- (idem nas 9 tabelas)
-- FECHAR (quando o front autenticar via Supabase Auth):
-- drop policy if exists dev_bypass on public.pacientes;   -- (repetir nas 9 tabelas)

-- FIM — dump fiel ao estado vivo em 10-Jun-2026.
