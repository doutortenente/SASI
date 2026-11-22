-- APLICADA no banco vivo (mesmo carimbo do banco). Não editar nem reaplicar.
-- Texto recuperado do próprio banco (supabase_migrations.schema_migrations) em 22-nov-2026.

-- Backup pre-correcao de seguranca P0 (30-ago-2026).
-- Copia integral das tabelas clinicas num schema isolado, sem acesso para anon/authenticated.
create schema if not exists backup_20260830_p0;

revoke all on schema backup_20260830_p0 from anon, authenticated, public;

do $$
declare t text;
begin
  foreach t in array array[
    'pacientes','evolucoes','eventos_clinicos','pendencias','internacoes',
    'atbs','culturas','antibiograma','alerts_log','alert_rules','trend_rules',
    'ingest_audit_log','janelas_24h','dispositivo_episodios','avisos_agentes',
    'memorias','evento_tipo_ref'
  ]
  loop
    execute format(
      'create table if not exists backup_20260830_p0.%I as select * from public.%I', t, t
    );
    execute format('revoke all on backup_20260830_p0.%I from anon, authenticated, public', t);
  end loop;
end $$;

comment on schema backup_20260830_p0 is
  'Snapshot pre-correcao P0 de RLS (30-ago-2026). Somente postgres/service_role. Descartar apos validacao do frontend.';
