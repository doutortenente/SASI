-- [GATED — NAO roda automatico] RLS de PRODUCAO. ⛔ SO depois do LOGIN real.
-- Ordem (PLANO §4): 1) app novo autentica  2) carimbar donos (abaixo)  3) criar policies
-- 4) remover dev_bypass. Rodar antes trava o app (auth.uid() = ninguem).

-- ==== 1) CARIMBO DE DONO (troque <SEU-UUID> pelo seu id em auth.users) ====
-- select id, email from auth.users;
/*
update public.pacientes        set user_id = '<SEU-UUID>' where user_id is null;
update public.evolucoes        set user_id = '<SEU-UUID>' where user_id is null;
update public.eventos_clinicos set user_id = '<SEU-UUID>' where user_id is null;
update public.pendencias       set user_id = '<SEU-UUID>' where user_id is null;
update public.atbs             set user_id = '<SEU-UUID>' where user_id is null;
update public.culturas         set user_id = '<SEU-UUID>' where user_id is null;
update public.alerts_log       set user_id = '<SEU-UUID>' where user_id is null;
update public.ingest_audit_log set user_id = '<SEU-UUID>' where user_id is null;
update public.memorias         set user_id = '<SEU-UUID>' where user_id is null;
*/

-- ==== 2) HELPER + POLICIES POR COMANDO (do schema-producao-v3.sql, secao 6) ====
-- 6. RLS — SEGURANÇA POR LINHA  (produção: 4 policies por comando, escopo dono)
--    Sem dev_bypass, sem USING(true). Conforme .claude/rules/supabase.md.
--    Helper de posse evita repetir o JOIN em cada tabela-filha.
-- ============================================================================
create or replace function public.fn_owns_paciente(p_id uuid) returns boolean
  language sql
  stable security definer set search_path to 'public','pg_catalog' as
$$
select exists (select 1 from pacientes p where p.id = p_id and p.user_id = (select auth.uid()));
$$;

alter table public.pacientes
  enable row level security;
alter table public.evolucoes
  enable row level security;
alter table public.eventos_clinicos
  enable row level security;
alter table public.pendencias
  enable row level security;
alter table public.atbs
  enable row level security;
alter table public.culturas
  enable row level security;
alter table public.antibiograma
  enable row level security;
alter table public.alerts_log
  enable row level security;
alter table public.ingest_audit_log
  enable row level security;
alter table public.memorias
  enable row level security;
alter table public.alert_rules
  enable row level security;
alter table public.trend_rules
  enable row level security;

-- pacientes (dono direto)
create policy pacientes_select on public.pacientes for select to authenticated using ((select auth.uid()) = user_id);
create policy pacientes_insert on public.pacientes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy pacientes_update on public.pacientes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy pacientes_delete on public.pacientes for delete to authenticated using ((select auth.uid()) = user_id);

-- tabelas-filhas por paciente (posse via helper)
create policy evolucoes_select on public.evolucoes for select to authenticated using (public.fn_owns_paciente(paciente_id));
create policy evolucoes_insert on public.evolucoes for insert to authenticated with check (public.fn_owns_paciente(paciente_id));
create policy evolucoes_update on public.evolucoes for update to authenticated using (public.fn_owns_paciente(paciente_id)) with check (public.fn_owns_paciente(paciente_id));
create policy evolucoes_delete on public.evolucoes for delete to authenticated using (public.fn_owns_paciente(paciente_id));

create policy eventos_select on public.eventos_clinicos for select to authenticated using (public.fn_owns_paciente(paciente_id));
create policy eventos_insert on public.eventos_clinicos for insert to authenticated with check (public.fn_owns_paciente(paciente_id));
create policy eventos_update on public.eventos_clinicos for update to authenticated using (public.fn_owns_paciente(paciente_id)) with check (public.fn_owns_paciente(paciente_id));
create policy eventos_delete on public.eventos_clinicos for delete to authenticated using (public.fn_owns_paciente(paciente_id));

create policy pendencias_select on public.pendencias for select to authenticated using (public.fn_owns_paciente(paciente_id));
create policy pendencias_insert on public.pendencias for insert to authenticated with check (public.fn_owns_paciente(paciente_id));
create policy pendencias_update on public.pendencias for update to authenticated using (public.fn_owns_paciente(paciente_id)) with check (public.fn_owns_paciente(paciente_id));
create policy pendencias_delete on public.pendencias for delete to authenticated using (public.fn_owns_paciente(paciente_id));

create policy atbs_select on public.atbs for select to authenticated using (public.fn_owns_paciente(paciente_id));
create policy atbs_insert on public.atbs for insert to authenticated with check (public.fn_owns_paciente(paciente_id));
create policy atbs_update on public.atbs for update to authenticated using (public.fn_owns_paciente(paciente_id)) with check (public.fn_owns_paciente(paciente_id));
create policy atbs_delete on public.atbs for delete to authenticated using (public.fn_owns_paciente(paciente_id));

create policy culturas_select on public.culturas for select to authenticated using (public.fn_owns_paciente(paciente_id));
create policy culturas_insert on public.culturas for insert to authenticated with check (public.fn_owns_paciente(paciente_id));
create policy culturas_update on public.culturas for update to authenticated using (public.fn_owns_paciente(paciente_id)) with check (public.fn_owns_paciente(paciente_id));
create policy culturas_delete on public.culturas for delete to authenticated using (public.fn_owns_paciente(paciente_id));

-- antibiograma: posse via cultura -> paciente
create policy antibiograma_select on public.antibiograma for select to authenticated
  using (exists (select 1
                 from culturas c
                 where c.id = cultura_id
                   and public.fn_owns_paciente(c.paciente_id)));
create policy antibiograma_insert on public.antibiograma for insert to authenticated
  with check (exists (select 1
                      from culturas c
                      where c.id = cultura_id
                        and public.fn_owns_paciente(c.paciente_id)));
create policy antibiograma_update on public.antibiograma for update to authenticated
  using (exists (select 1
                 from culturas c
                 where c.id = cultura_id
                   and public.fn_owns_paciente(c.paciente_id)))
  with check (exists (select 1
                      from culturas c
                      where c.id = cultura_id
                        and public.fn_owns_paciente(c.paciente_id)));
create policy antibiograma_delete on public.antibiograma for delete to authenticated
  using (exists (select 1
                 from culturas c
                 where c.id = cultura_id
                   and public.fn_owns_paciente(c.paciente_id)));

create policy alerts_select on public.alerts_log for select to authenticated using (public.fn_owns_paciente(paciente_id));
create policy alerts_insert on public.alerts_log for insert to authenticated with check (public.fn_owns_paciente(paciente_id));
create policy alerts_update on public.alerts_log for update to authenticated using (public.fn_owns_paciente(paciente_id)) with check (public.fn_owns_paciente(paciente_id));
create policy alerts_delete on public.alerts_log for delete to authenticated using (public.fn_owns_paciente(paciente_id));

-- ingest_audit_log: dono direto (user_id)
create policy ingest_select on public.ingest_audit_log for select to authenticated using ((select auth.uid()) = user_id);
create policy ingest_insert on public.ingest_audit_log for insert to authenticated with check ((select auth.uid()) = user_id);

-- memorias: dono direto
create policy memorias_select on public.memorias for select to authenticated using ((select auth.uid()) = user_id);
create policy memorias_insert on public.memorias for insert to authenticated with check ((select auth.uid()) = user_id);
create policy memorias_update on public.memorias for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy memorias_delete on public.memorias for delete to authenticated using ((select auth.uid()) = user_id);

-- Config e dimensão: leitura p/ autenticados (não é PHI); escrita só service_role.
create policy alert_rules_read on public.alert_rules for select to authenticated using (true);
create policy trend_rules_read on public.trend_rules for select to authenticated using (true);


-- ==== 3) REMOVER A PORTA ESCANCARADA (dev_bypass) — so apos 1 e 2 confirmados ====
/*
drop policy if exists dev_bypass on public.pacientes;
drop policy if exists dev_bypass on public.evolucoes;
drop policy if exists dev_bypass on public.eventos_clinicos;
drop policy if exists dev_bypass on public.pendencias;
drop policy if exists dev_bypass on public.atbs;
drop policy if exists dev_bypass on public.culturas;
drop policy if exists dev_bypass on public.antibiograma;
drop policy if exists dev_bypass on public.alerts_log;
drop policy if exists dev_bypass on public.ingest_audit_log;
drop policy if exists dev_bypass on public.alert_rules;
drop policy if exists dev_bypass on public.trend_rules;
*/
