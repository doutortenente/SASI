-- APLICADA no banco vivo (mesmo carimbo do banco). Não editar nem reaplicar.
-- Texto recuperado do próprio banco (supabase_migrations.schema_migrations) em 22-nov-2026.

-- ============================================================================
-- Remove as 12 policies de dono DORMENTES das 9 tabelas que têm dev_bypass.
-- ----------------------------------------------------------------------------
-- POR QUE É SEGURO:
--  1. Uso solo, sem login (decisão do operador, CLAUDE.md). auth.uid() é sempre null.
--  2. Todos os 15 pacientes têm user_id null -> estas policies nunca casam com nada.
--  3. Policies permissivas são ADITIVAS (OR). dev_bypass (ALL, true, true) permanece
--     em todas as 9 tabelas, logo o acesso resultante é idêntico ao de antes.
--     Remover uma parcela de um OR cujo outro lado é `true` não muda o resultado.
--  4. Custo medido do que está sendo removido: 180 dos 204 avisos de desempenho
--     (multiple_permissive_policies), porque o Postgres avaliava as duas regras
--     em toda linha de toda consulta.
--
-- NÃO TOCA em memorias (4 policies de dono, SEM dev_bypass -> apagar trancaria a
-- tabela) nem em evento_tipo_ref_read (leitura pública proposital do vocabulário).
--
-- VOLTA COMPLETA: supabase/migrations/rollback/20260808_restaura_policies_de_dono.sql
-- ============================================================================

drop policy if exists alerts_all_own      on public.alerts_log;
drop policy if exists antibiograma_all_own on public.antibiograma;
drop policy if exists atbs_all_own        on public.atbs;
drop policy if exists culturas_all_own    on public.culturas;
drop policy if exists eventos_all_own     on public.eventos_clinicos;
drop policy if exists evolucoes_all_own   on public.evolucoes;
drop policy if exists ingest_audit_own    on public.ingest_audit_log;
drop policy if exists pendencias_all_own  on public.pendencias;

drop policy if exists pacientes_select_own on public.pacientes;
drop policy if exists pacientes_insert_own on public.pacientes;
drop policy if exists pacientes_update_own on public.pacientes;
drop policy if exists pacientes_delete_own on public.pacientes;
