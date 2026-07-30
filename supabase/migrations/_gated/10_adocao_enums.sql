-- [GATED — NAO roda automatico; subpasta _gated/ e ignorada pelo Supabase]
-- Adocao texto->enum. RODAR EM BRANCH do Supabase; conferir as verificacoes antes.

-- SEÇÃO B — ADOÇÃO DE ENUMS  (texto -> enum). RODAR EM BRANCH; VERIFICAR ANTES.
-- ----------------------------------------------------------------------------
-- Converter só funciona se TODO valor atual couber no enum. Rode as verificações;
-- se qualquer uma voltar linha, corrija o dado antes de converter aquela coluna.
-- ============================================================================

-- B0. VERIFICAÇÕES (devem voltar ZERO linhas cada):
--   select distinct uti          from pacientes where uti          not in ('UTI2','UTI3','UTI4');
--   select distinct isolation    from pacientes where isolation    not in ('none','contact','droplet','aerosol');
--   select distinct severidade_visual from pacientes where severidade_visual not in ('red','yellow','green');
--   select distinct status_leito from pacientes where status_leito not in ('ativo','alta','obito','transferencia');
--   select distinct gravidade    from pacientes where gravidade    not in ('estavel','moderado','grave','critico','obito');
--   select distinct plantao      from evolucoes where plantao      not in ('manha','tarde','noite','plantao_24h');
--   select distinct via          from atbs where via is not null and via not in ('EV','VO','IM','SC','SNE','SNG','IT','Tópico');
--   select distinct material     from culturas where material not in ('hemocultura','urocultura','aspirado_traqueal','lavado_bal','lcr','secrecao_ferida','liquido_peritoneal','liquido_pleural','outro');

-- B1. Conversões (cada ALTER remove o CHECK textual e adota o enum). Descomente após verificar.
/*
alter table public.pacientes  drop constraint if exists pacientes_uti_check;
alter table public.pacientes  alter column uti type public.uti_enum using uti::public.uti_enum;

alter table public.pacientes  drop constraint if exists pacientes_isolation_check;
alter table public.pacientes  alter column isolation drop default,
  alter column isolation type public.isolamento_enum using isolation::public.isolamento_enum,
  alter column isolation set default 'none';

alter table public.pacientes  drop constraint if exists pacientes_severidade_visual_check;
alter table public.pacientes  alter column severidade_visual drop default,
  alter column severidade_visual type public.severidade_visual_enum using severidade_visual::public.severidade_visual_enum,
  alter column severidade_visual set default 'green';

alter table public.pacientes  drop constraint if exists pacientes_gravidade_check;
alter table public.pacientes  alter column gravidade drop default,
  alter column gravidade type public.gravidade_enum using gravidade::public.gravidade_enum,
  alter column gravidade set default 'estavel';

alter table public.pacientes  drop constraint if exists pacientes_status_leito_check;
alter table public.pacientes  alter column status_leito drop default,
  alter column status_leito type public.status_leito_enum using status_leito::public.status_leito_enum,
  alter column status_leito set default 'ativo';

alter table public.evolucoes  drop constraint if exists evolucoes_plantao_check;
alter table public.evolucoes  alter column plantao drop default,
  alter column plantao type public.plantao_enum using plantao::public.plantao_enum,
  alter column plantao set default 'manha';

alter table public.atbs       drop constraint if exists atbs_via_check;
alter table public.atbs       alter column via type public.via_atb_enum using via::public.via_atb_enum;
alter table public.atbs       drop constraint if exists atbs_intencao_check;
alter table public.atbs       alter column intencao type public.intencao_atb_enum using intencao::public.intencao_atb_enum;

alter table public.culturas   drop constraint if exists culturas_material_check;
alter table public.culturas   alter column material type public.material_cultura_enum using material::public.material_cultura_enum;

alter table public.antibiograma drop constraint if exists antibiograma_resultado_check;
alter table public.antibiograma alter column resultado type public.antibiograma_resultado_enum using resultado::public.antibiograma_resultado_enum;

alter table public.alerts_log drop constraint if exists alerts_log_severidade_check;
alter table public.alerts_log alter column severidade drop default,
  alter column severidade type public.severidade_alerta_enum using severidade::public.severidade_alerta_enum,
  alter column severidade set default 'warning';

alter table public.eventos_clinicos drop constraint if exists eventos_clinicos_fonte_check;
alter table public.eventos_clinicos alter column fonte type public.fonte_evento_enum using fonte::public.fonte_evento_enum;

alter table public.alert_rules drop constraint if exists alert_rules_comparador_check;
alter table public.alert_rules alter column comparador type public.comparador_enum using comparador::public.comparador_enum;
alter table public.alert_rules drop constraint if exists alert_rules_severidade_check;
alter table public.alert_rules alter column severidade type public.severidade_alerta_enum using severidade::public.severidade_alerta_enum;

alter table public.trend_rules drop constraint if exists trend_rules_modo_check;
alter table public.trend_rules alter column modo type public.trend_modo_enum using modo::public.trend_modo_enum;
alter table public.trend_rules drop constraint if exists trend_rules_severidade_check;
alter table public.trend_rules alter column severidade type public.severidade_alerta_enum using severidade::public.severidade_alerta_enum;
*/


-- ============================================================================
