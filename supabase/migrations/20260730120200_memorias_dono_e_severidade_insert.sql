-- SASI v3 · formalizacao (3/3) — memorias ganha dono + semaforo no cadastro
-- Aditivo. memorias hoje tem RLS ligada e NENHUMA policy (inacessivel exceto service_role);
-- aqui ela ganha user_id + 4 policies de dono. E o semaforo passa a valer no INSERT (achado A6).

alter table public.memorias add column if not exists user_id uuid references auth.users(id) on delete cascade;
create index if not exists idx_memorias_user on public.memorias (user_id);
do $$ begin
  create policy memorias_select on public.memorias for select to authenticated using ((select auth.uid()) = user_id);
  create policy memorias_insert on public.memorias for insert to authenticated with check ((select auth.uid()) = user_id);
  create policy memorias_update on public.memorias for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
  create policy memorias_delete on public.memorias for delete to authenticated using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

create or replace function public.fn_set_severidade_on_insert() returns trigger
  language plpgsql set search_path to 'public','pg_catalog' as $fn$
begin
  new.severidade_visual := case new.gravidade
    when 'critico' then 'red' when 'grave' then 'red'
    when 'moderado' then 'yellow' else 'green' end;
  return new;
end; $fn$;
drop trigger if exists trg_severidade_on_insert on public.pacientes;
create trigger trg_severidade_on_insert before insert on public.pacientes
  for each row execute function public.fn_set_severidade_on_insert();
