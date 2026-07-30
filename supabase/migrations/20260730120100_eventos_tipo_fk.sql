-- SASI v3 · formalizacao (2/3) — eventos_clinicos.tipo vira FK p/ evento_tipo_ref
-- Nao-destrutivo: adiciona FK (not valid), valida os dados existentes, e SO ENTAO
-- remove o CHECK antigo de 56 valores. Idempotente.

do $$ begin
  if not exists (select 1 from pg_constraint where conname='eventos_tipo_fk'
                 and conrelid='public.eventos_clinicos'::regclass) then
    alter table public.eventos_clinicos
      add constraint eventos_tipo_fk foreign key (tipo)
      references public.evento_tipo_ref(codigo) not valid;
  end if;
end $$;
alter table public.eventos_clinicos validate constraint eventos_tipo_fk;
-- destrutivo (substituido pela FK acima):
alter table public.eventos_clinicos drop constraint if exists eventos_clinicos_tipo_check;

do $$ begin
  if not exists (select 1 from pg_constraint where conname='alert_rules_tipo_fk'
                 and conrelid='public.alert_rules'::regclass) then
    alter table public.alert_rules add constraint alert_rules_tipo_fk
      foreign key (tipo_evento) references public.evento_tipo_ref(codigo) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname='trend_rules_tipo_fk'
                 and conrelid='public.trend_rules'::regclass) then
    alter table public.trend_rules add constraint trend_rules_tipo_fk
      foreign key (tipo_evento) references public.evento_tipo_ref(codigo) not valid;
  end if;
end $$;
