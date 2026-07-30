-- SASI v3 · formalizacao (1/3) — enums + dimensao evento_tipo_ref
-- Aditivo e seguro (nao altera dado existente). gravidade_enum/status_leito_enum ja existem
-- no vivo; o do-block ignora "ja existe". Extraido do schema-producao-v3.sql (validado).

-- enums: um do-block por tipo (duplicado de um nao derruba os outros)
do $$ begin create type public.uti_enum                   as enum ('UTI2','UTI3','UTI4'); exception when duplicate_object then null; end $$;
do $$ begin create type public.gravidade_enum             as enum ('estavel','moderado','grave','critico','obito'); exception when duplicate_object then null; end $$;
do $$ begin create type public.status_leito_enum          as enum ('ativo','alta','obito','transferencia'); exception when duplicate_object then null; end $$;
do $$ begin create type public.isolamento_enum            as enum ('none','contact','droplet','aerosol'); exception when duplicate_object then null; end $$;
do $$ begin create type public.severidade_visual_enum     as enum ('red','yellow','green'); exception when duplicate_object then null; end $$;
do $$ begin create type public.plantao_enum               as enum ('manha','tarde','noite','plantao_24h'); exception when duplicate_object then null; end $$;
do $$ begin create type public.via_atb_enum               as enum ('EV','VO','IM','SC','SNE','SNG','IT','Tópico'); exception when duplicate_object then null; end $$;
do $$ begin create type public.intencao_atb_enum          as enum ('empirica','dirigida','profilatica'); exception when duplicate_object then null; end $$;
do $$ begin create type public.material_cultura_enum      as enum ('hemocultura','urocultura','aspirado_traqueal','lavado_bal','lcr','secrecao_ferida','liquido_peritoneal','liquido_pleural','outro'); exception when duplicate_object then null; end $$;
do $$ begin create type public.antibiograma_resultado_enum as enum ('S','I','R'); exception when duplicate_object then null; end $$;
do $$ begin create type public.severidade_alerta_enum     as enum ('info','warning','critical'); exception when duplicate_object then null; end $$;
do $$ begin create type public.fonte_evento_enum          as enum ('manual','gemini_ocr','claude_ocr','appsheet','auto_trigger','edge_function','api_import'); exception when duplicate_object then null; end $$;
do $$ begin create type public.comparador_enum            as enum ('lt','lte','gt','gte'); exception when duplicate_object then null; end $$;
do $$ begin create type public.trend_modo_enum            as enum ('subida_abs','subida_rel','queda_abs'); exception when duplicate_object then null; end $$;

create table if not exists public.evento_tipo_ref (
  codigo        text        primary key,                 -- ex.: 'fc', 'lactato', 'sofa_total'
  categoria     text        not null,                     -- vital | gaso | lab | renal | hemato | infecto | droga | neuro | score | bh | outro
  rotulo        text        not null,                     -- nome legível
  unidade_padrao text,                                     -- ex.: 'bpm', 'mmHg', 'mg/dL'
  faixa_min     numeric,                                   -- < faixa_min => flag (revisar). null = sem flag
  faixa_max     numeric,                                   -- > faixa_max => flag (revisar). null = sem flag
  loinc_code    text,                                      -- FHIR Observation.code (http://loinc.org). null = a preencher (fase 2)
  ativo         boolean     not null default true,
  ordem         integer     not null default 100
);
comment on table public.evento_tipo_ref is
  'Dimensão que governa eventos_clinicos.tipo. faixa_min/max vêm da doutrina SASI (flags de absurdo fisiológico). loinc_code = mapeamento FHIR (só os 5 vitais verificados vêm preenchidos; o resto é fase 2, via servidores de terminologia — ZERO ALUCINAÇÃO).';

-- SEED do vocabulário (57 códigos do banco vivo).
-- LOINC preenchido SOMENTE nos 5 vitais verificados pela skill fhir-developer.
-- Faixas fisiológicas dos vitais vêm da doutrina _SASI_TEMPLATE_BASE_v2.md.
-- faixa_min/faixa_max = limite fisiológico "impossível" (hard flag), de
-- sasi-ingest-export/references/03-clinical-sanity-checks.md (fonte operacional).
-- A camada mais fina ("review") vive na skill de extração — o banco só marca o impossível.
-- LOINC preenchido só nos 5 vitais verificados pela skill fhir-developer (resto = fase 2).
insert into public.evento_tipo_ref (codigo, categoria, rotulo, unidade_padrao, faixa_min, faixa_max, loinc_code, ordem) values
  ('pa_sys','vital','PA sistólica','mmHg',40,280,'8480-6',10),
  ('pa_dia','vital','PA diastólica','mmHg',20,160,'8462-4',11),
  ('pam','vital','PA média','mmHg',30,180,null,12),
  ('pam_min','vital','PA média (mínima)','mmHg',30,180,null,13),
  ('fc','vital','Frequência cardíaca','bpm',20,250,'8867-4',14),
  ('fr','vital','Frequência respiratória','ipm',4,80,null,15),
  ('spo2','vital','Saturação O2','%',0,100,'2708-6',16),
  ('temp','vital','Temperatura','°C',32,42,'8310-5',17),
  ('glicemia','vital','Glicemia capilar (Dx)','mg/dL',20,800,null,18),
  ('pf_ratio','gaso','Relação PaO2/FiO2','',50,600,null,20),
  ('lactato','gaso','Lactato','mmol/L',0.5,25,null,21),
  ('ph','gaso','pH arterial','',6.80,7.80,null,22),
  ('pco2','gaso','pCO2','mmHg',10,150,null,23),
  ('po2','gaso','pO2','mmHg',20,600,null,24),
  ('hco3','gaso','Bicarbonato','mEq/L',4,50,null,25),
  ('be','gaso','Base excess','mEq/L',null,null,null,26),
  ('diurese_h','renal','Diurese horária','mL/h',null,null,null,30),
  ('bh_h','renal','Balanço hídrico horário','mL',null,null,null,31),
  ('bh_acumulado','renal','Balanço hídrico acumulado','mL',null,null,null,32),
  ('cr','renal','Creatinina','mg/dL',0.1,20,null,33),
  ('ur','renal','Ureia','mg/dL',5,400,null,34),
  ('na','renal','Sódio','mEq/L',110,180,null,35),
  ('k','renal','Potássio','mEq/L',1.5,9.5,null,36),
  ('mg','renal','Magnésio','mg/dL',null,null,null,37),
  ('ca','renal','Cálcio','mg/dL',null,null,null,38),
  ('p','renal','Fósforo','mg/dL',null,null,null,39),
  ('hb','hemato','Hemoglobina','g/dL',2,22,null,40),
  ('ht','hemato','Hematócrito','%',null,null,null,41),
  ('plaq','hemato','Plaquetas','×10³/µL',1,2000,null,42),
  ('leuco','hemato','Leucócitos','×10³/µL',0.1,100,null,43),
  ('inr','hemato','INR','',0.8,10,null,44),
  ('bb','infecto','Bilirrubina total','mg/dL',null,null,null,45),
  ('pcr','infecto','Proteína C reativa','mg/L',null,null,null,46),
  ('procalcitonina','infecto','Procalcitonina','ng/mL',null,null,null,47),
  -- doses de DVA: faixa = "dose absurda" (red flag de diluição errada)
  ('nor_dose','droga','Noradrenalina (dose)','mcg/kg/min',0.001,2.0,null,50),
  ('adr_dose','droga','Adrenalina (dose)','mcg/kg/min',0.001,2.0,null,51),
  ('vaso_dose','droga','Vasopressina (dose)','U/min',0.01,0.1,null,52),
  ('dobuta_dose','droga','Dobutamina (dose)','mcg/kg/min',0,30,null,53),
  ('dopa_dose','droga','Dopamina (dose)','mcg/kg/min',0,30,null,54),
  ('fent_dose','droga','Fentanil (dose)','mcg/h',null,null,null,55),
  ('midaz_dose','droga','Midazolam (dose)','mg/h',null,null,null,56),
  ('propofol_dose','droga','Propofol (dose)','mcg/kg/min',null,null,null,57),
  ('precedex_dose','droga','Dexmedetomidina (dose)','mcg/kg/h',null,null,null,58),
  ('gcs','neuro','Escala de coma de Glasgow','',3,15,null,60),
  ('rass','neuro','RASS','',-5,4,null,61),
  ('cam_icu','neuro','CAM-ICU','',null,null,null,62),
  ('bps','neuro','Behavioral Pain Scale','',null,null,null,63),
  ('cpot','neuro','CPOT','',null,null,null,64),
  ('sofa_total','score','SOFA total','',0,24,null,70),
  ('sofa_resp','score','SOFA respiratório','',0,4,null,71),
  ('sofa_coag','score','SOFA coagulação','',0,4,null,72),
  ('sofa_liver','score','SOFA hepático','',0,4,null,73),
  ('sofa_cardio','score','SOFA cardiovascular','',0,4,null,74),
  ('sofa_neuro','score','SOFA neurológico','',0,4,null,75),
  ('sofa_renal','score','SOFA renal','',0,4,null,76),
  -- 'custom' é a válvula de extensão: eco/hemodinâmica/imagem/cultura entram aqui
  ('custom','outro','Livre — eco/hemodinâmica/imagem/cultura via valor_json {dominio,subtipo,unidade}','',null,null,null,99)
on conflict (codigo) do nothing;

-- rede de seguranca: garante que todo tipo ja usado no vivo exista na dimensao
insert into public.evento_tipo_ref (codigo, categoria, rotulo)
select distinct tipo, 'outro', tipo from public.eventos_clinicos
on conflict (codigo) do nothing;

-- evento_tipo_ref e vocabulario clinico (nao e PHI): leitura liberada p/ autenticados
alter table public.evento_tipo_ref enable row level security;
do $$ begin
  create policy evento_tipo_ref_read on public.evento_tipo_ref for select to authenticated using (true);
exception when duplicate_object then null; end $$;
