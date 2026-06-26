-- SASI v2.0 — síntese estruturada na evolução (problemas, condutas, riscos)
-- Rode via supabase db push ou SQL Editor / DataGrip

ALTER TABLE public.evolucoes
  ADD COLUMN IF NOT EXISTS problemas_ativos jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS condutas_sistemas jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS riscos jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.evolucoes.problemas_ativos IS
  'SASI v2.0 — problemas ativos estruturados [{texto, sistema?, gravidade?}]';
COMMENT ON COLUMN public.evolucoes.condutas_sistemas IS
  'SASI v2.0 — condutas por sistema [{sistema, texto, meta?, prazo?}]';
COMMENT ON COLUMN public.evolucoes.riscos IS
  'SASI v2.0 — riscos clínicos [{texto, nivel?}]';