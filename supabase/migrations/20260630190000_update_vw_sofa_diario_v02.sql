-- vw_sofa_diario v0.2 — alinha ao ruleset SOFA1_v1.0 no que é determinístico-sem-imputação:
--   • respiratório passa a checar SUPORTE VENTILATÓRIO (valor_json.suporte_vent do pior pf_ratio):
--     ≤200/≤100 só pontuam 3/4 com suporte; sem suporte o resp não passa de 2.
--   • cardiovascular multi-droga: nor/adr/dopa/dobuta com cutoffs do ruleset (não só PAM+nor).
-- NÃO incluído aqui (= motor v1, FASE B): imputação determinística (GCS/diurese), LOCF/carry-forward,
--   audit trail por componente, filtro vasopressor ≥60min. faltante segue = null (não imputado).
-- segurança: security_invoker = true → respeita rls de eventos_clinicos.
create or replace view public.vw_sofa_diario
with (security_invoker = true) as
with pf_worst as (
  select distinct on (paciente_id, ts::date)
    paciente_id, ts::date as dia,
    valor_num as pf,
    nullif(valor_json->>'suporte_vent', '') as suporte_vent
  from public.eventos_clinicos
  where tipo = 'pf_ratio' and valor_num is not null
  order by paciente_id, ts::date, valor_num asc
),
comp as (
  select
    paciente_id, ts::date as dia,
    min(valor_num) filter (where tipo = 'plaq')        as plaq,
    max(valor_num) filter (where tipo = 'bb')          as bb,
    min(valor_num) filter (where tipo = 'pam')         as pam,
    max(valor_num) filter (where tipo = 'nor_dose')    as nor,
    max(valor_num) filter (where tipo = 'adr_dose')    as adr,
    max(valor_num) filter (where tipo = 'dopa_dose')   as dopa,
    max(valor_num) filter (where tipo = 'dobuta_dose') as dobuta,
    min(valor_num) filter (where tipo = 'gcs')         as gcs,
    max(valor_num) filter (where tipo = 'cr')          as cr,
    min(valor_num) filter (where tipo = 'diurese_h')   as diurese_h
  from public.eventos_clinicos
  group by paciente_id, ts::date
),
j as (
  select c.*, p.pf,
    (p.suporte_vent is not null and p.suporte_vent <> 'none') as tem_suporte
  from comp c
  left join pf_worst p using (paciente_id, dia)
),
score as (
  select j.*,
    case when pf is null then null
         when pf > 400 then 0
         when pf > 300 then 1
         when pf > 200 then 2
         when pf > 100 then (case when tem_suporte then 3 else 2 end)
         else (case when tem_suporte then 4 else 2 end) end as s_resp,
    case when plaq is null then null
         when plaq >= 150 then 0 when plaq >= 100 then 1
         when plaq >= 50 then 2 when plaq >= 20 then 3 else 4 end as s_coag,
    case when bb is null then null
         when bb < 1.2 then 0 when bb < 2.0 then 1
         when bb < 6.0 then 2 when bb < 12.0 then 3 else 4 end as s_liver,
    case when pam is null and nor is null and adr is null and dopa is null and dobuta is null then null
         when (dopa > 15) or (adr > 0.1) or (nor > 0.1) then 4
         when (dopa > 5) or (adr > 0) or (nor > 0) then 3
         when (dopa > 0) or (dobuta > 0) then 2
         when pam is not null and pam < 70 then 1
         when pam is not null then 0
         else null end as s_cardio,
    case when gcs is null then null
         when gcs >= 15 then 0 when gcs >= 13 then 1
         when gcs >= 10 then 2 when gcs >= 6 then 3 else 4 end as s_neuro,
    case when cr is null and diurese_h is null then null
         when (cr is not null and cr >= 5.0) or (diurese_h is not null and diurese_h < 8.3) then 4
         when (cr is not null and cr >= 3.5) or (diurese_h is not null and diurese_h < 20.8) then 3
         when cr is not null and cr >= 2.0 then 2
         when cr is not null and cr >= 1.2 then 1
         when cr is not null then 0 else null end as s_renal
  from j
)
select
  paciente_id, dia,
  s_resp, s_coag, s_liver, s_cardio, s_neuro, s_renal,
  coalesce(s_resp,0)+coalesce(s_coag,0)+coalesce(s_liver,0)
   +coalesce(s_cardio,0)+coalesce(s_neuro,0)+coalesce(s_renal,0) as sofa_parcial,
  (s_resp is not null)::int + (s_coag is not null)::int + (s_liver is not null)::int
   +(s_cardio is not null)::int + (s_neuro is not null)::int + (s_renal is not null)::int as componentes_presentes,
  array_remove(array[
    case when s_resp   is null then 'resp'     end,
    case when s_coag   is null then 'coag'     end,
    case when s_liver  is null then 'hepatico' end,
    case when s_cardio is null then 'cardio'   end,
    case when s_neuro  is null then 'neuro'    end,
    case when s_renal  is null then 'renal'    end
  ], null) as componentes_faltantes
from score;

comment on view public.vw_sofa_diario is
  'SOFA/dia v0.2 (cutoffs SOFA1_v1.0). resp checa suporte_vent (valor_json do pior pf_ratio); cardio multi-droga (nor/adr/dopa/dobuta). faltante=null. Imputacao/LOCF/audit trail + vaso>=60min = motor v1 (FASE B). Ver docs/SOFA-RULESET.md.';
