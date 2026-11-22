-- APLICADA no banco vivo (mesmo carimbo do banco). Não editar nem reaplicar.
-- Texto recuperado do próprio banco (supabase_migrations.schema_migrations) em 22-nov-2026.

-- F0 / Decisão 5 — mover pg_trgm e vector do schema public para extensions.
-- Feito junto com a correção de match_memorias: a versão viva tinha
-- search_path = public, pg_catalog (sem extensions), então o operador <=>
-- deixaria de resolver assim que o tipo vector saísse do public.
-- pgcrypto já estava em extensions (fn_alert_hash chama extensions.digest e funciona).

alter extension pg_trgm set schema extensions;
alter extension vector  set schema extensions;

create or replace function public.match_memorias(
  query_embedding extensions.vector, match_threshold double precision, match_count integer)
  returns table(id bigint, conteudo text, similarity double precision)
  language sql stable set search_path to 'public','extensions','pg_catalog' as $$
  select m.id, m.conteudo, 1 - (m.embedding <=> query_embedding) as similarity
  from memorias m
  where 1 - (m.embedding <=> query_embedding) > match_threshold
  order by m.embedding <=> query_embedding
  limit match_count;
$$;
