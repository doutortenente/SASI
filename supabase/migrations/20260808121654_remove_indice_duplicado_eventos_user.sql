-- APLICADA no banco vivo (mesmo carimbo do banco). Não editar nem reaplicar.
-- Texto recuperado do próprio banco (supabase_migrations.schema_migrations) em 22-nov-2026.

-- Índice idêntico a idx_eventos_clinicos_user_id (mesma tabela, mesma coluna, mesmo btree).
-- Dois índices iguais custam disco e tornam toda gravação mais lenta, sem ganho de leitura.
-- Mantido o nome que segue a convenção do resto do schema (idx_<tabela>_<coluna>).
-- Volta: create index idx_eventos_user on public.eventos_clinicos using btree (user_id);
drop index if exists public.idx_eventos_user;
