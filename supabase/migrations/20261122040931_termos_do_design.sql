-- APLICADA no banco vivo em 22-nov-2026 (mesmo carimbo do banco). Não editar nem reaplicar.
-- ============================================================================
-- Termos do banco iguais aos do design "Comando UTI · Folha de plantão".
-- Ordem do operador em 22-nov-2026: "corrija os termos do banco para serem
-- iguais aos do design".
--
-- O que muda:
--   1. Vocabulário de eventos: códigos, nomes e unidades passam a ser os do design
--      (PAS, PAD, Dx, Cálcio iônico, TRS no lugar de diálise) e ganha a coluna
--      `sigla` (nome curto usado na ficha e nos cards).
--   2. Evoluções: cada campo fica com uma grafia só, a do design
--      (pas_*, pad_*, temp_*, notas, diurese_ml + diurese_h) e o sistema da
--      conduta passa a ser o nome do quadro (Cardio-hemodinâmica…).
--   3. Leucócitos e plaquetas lançados por mm³ passam para ×10³/µL (valor ÷ 1.000),
--      que é a unidade do design e a que o cálculo do SOFA sempre esperou.
--   4. Quem ainda gravar com o termo antigo continua funcionando: um gatilho troca
--      o termo antigo pelo do design na entrada.
--   5. Nada é apagado: o "antes" de cada linha tocada fica no esquema `arquivo`.
--
-- O que NÃO muda: valor clínico nenhum (fora a divisão por 1.000 do item 3),
-- limiar de alerta nenhum, nome de coluna e valor de enum.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0) Cópia do "antes" (esquema fora da API; serve para desfazer)
-- ---------------------------------------------------------------------------
create schema if not exists arquivo;
comment on schema arquivo is 'Cópias do "antes" de migrações de dados. Fora da API. Pode ser apagado quando não for mais preciso desfazer.';

create table arquivo.termos_20261122_evolucoes as
  select id, neuro, resp, hemo, tgi, renal, hemato, infecto, condutas_sistemas from public.evolucoes;
create table arquivo.termos_20261122_eventos as
  select id, tipo, valor_num, unidade from public.eventos_clinicos;
create table arquivo.termos_20261122_janelas as
  select id, tipo from public.janelas_24h;
create table arquivo.termos_20261122_vocabulario as
  select * from public.evento_tipo_ref;
create table arquivo.termos_20261122_regras as
  select id, tipo_evento, mensagem from public.alert_rules;

-- ---------------------------------------------------------------------------
-- 1) Vocabulário de eventos
-- ---------------------------------------------------------------------------
alter table public.evento_tipo_ref add column sigla text;
comment on column public.evento_tipo_ref.sigla is 'Nome curto do design (ficha, cards e Round): PAS, FC, Hb, Cai. Vazio = usar o rótulo.';
comment on column public.evento_tipo_ref.rotulo is 'Nome por extenso, igual ao da tela Exames do design.';

-- 1a) códigos com o nome do design (cria o novo, move os filhos, apaga o antigo)
insert into public.evento_tipo_ref (codigo, categoria, rotulo, unidade_padrao, faixa_min, faixa_max, loinc_code, ativo, ordem)
select v.novo, r.categoria, r.rotulo, r.unidade_padrao, r.faixa_min, r.faixa_max, r.loinc_code, r.ativo, r.ordem
  from public.evento_tipo_ref r
  join (values ('pa_sys', 'pas'), ('pa_dia', 'pad'), ('glicemia', 'dx'), ('uf_dialise', 'uf_trs'), ('ca', 'cai')) as v(velho, novo)
    on v.velho = r.codigo;

update public.eventos_clinicos e set tipo = v.novo
  from (values ('pa_sys', 'pas'), ('pa_dia', 'pad'), ('glicemia', 'dx'), ('uf_dialise', 'uf_trs')) as v(velho, novo)
 where e.tipo = v.velho;
-- "ca" guardava cálcio iônico (todos em mmol/L, de 0,94 a 1,29): vai para "cai"
update public.eventos_clinicos set tipo = 'cai' where tipo = 'ca' and (unidade = 'mmol/L' or valor_num < 3);

update public.janelas_24h j set tipo = v.novo
  from (values ('pa_sys', 'pas'), ('pa_dia', 'pad'), ('glicemia', 'dx'), ('uf_dialise', 'uf_trs')) as v(velho, novo)
 where j.tipo = v.velho;
update public.alert_rules a set tipo_evento = v.novo
  from (values ('pa_sys', 'pas'), ('pa_dia', 'pad'), ('glicemia', 'dx'), ('uf_dialise', 'uf_trs')) as v(velho, novo)
 where a.tipo_evento = v.velho;
update public.trend_rules t set tipo_evento = v.novo
  from (values ('pa_sys', 'pas'), ('pa_dia', 'pad'), ('glicemia', 'dx'), ('uf_dialise', 'uf_trs')) as v(velho, novo)
 where t.tipo_evento = v.velho;

delete from public.evento_tipo_ref where codigo in ('pa_sys', 'pa_dia', 'glicemia', 'uf_dialise');

-- 1b) nomes, siglas e unidades do design
update public.evento_tipo_ref r
   set rotulo = v.rotulo,
       sigla = v.sigla,
       unidade_padrao = coalesce(v.unidade, r.unidade_padrao)
  from (values
    ('pas',      'PAS',                    'PAS',     null),
    ('pad',      'PAD',                    'PAD',     null),
    ('pam',      'PAM',                    'PAM',     null),
    ('pam_min',  'PAM mínima (janela)',    null,      null),
    ('fc',       'FC',                     'FC',      null),
    ('fr',       'FR',                     'FR',      null),
    ('spo2',     'SpO2',                   'SpO2',    null),
    ('dx',       'Dx',                     'Dx',      null),
    ('gcs',      'Glasgow',                'Glasgow', null),
    ('hb',       'Hemoglobina',            'Hb',      null),
    ('ht',       'Hematócrito',            'Ht',      null),
    ('plaq',     'Plaquetas',              'Plaq',    '×10³/µL'),
    ('leuco',    'Leucócitos',             null,      '×10³/µL'),
    ('na',       'Sódio',                  'Na',      null),
    ('k',        'Potássio',               'K',       null),
    ('mg',       'Magnésio',               'Mg',      null),
    ('cai',      'Cálcio iônico',          'Cai',     'mmol/L'),
    ('ca',       'Cálcio total',           null,      null),
    ('ph',       'pH arterial',            'pH',      null),
    ('pco2',     'pCO₂',                   'pCO2',    null),
    ('po2',      'PaO2',                   'PaO2',    null),
    ('hco3',     'Bicarbonato',            'HCO3',    null),
    ('pf_ratio', 'P/F',                    'P/F',     null),
    ('uf_trs',   'UF da TRS (sessão)',     'UF',      null)
  ) as v(codigo, rotulo, sigla, unidade)
 where r.codigo = v.codigo;

-- 1c) unidade dos eventos na grafia do vocabulário (o valor não muda)
update public.eventos_clinicos e
   set unidade = r.unidade_padrao
  from public.evento_tipo_ref r
 where r.codigo = e.tipo
   and e.unidade is distinct from r.unidade_padrao
   and (   lower(e.unidade) = lower(r.unidade_padrao)
        or (e.tipo = 'temp' and e.unidade in ('C', 'ºC'))
        or (e.tipo = 'fr'   and e.unidade = 'rpm')
        or (e.tipo = 'hco3' and e.unidade = 'mmol/L')
        or (e.unidade = 'µg/kg/min' and r.unidade_padrao = 'mcg/kg/min'));

-- 1d) leucócitos e plaquetas lançados por mm³ passam para ×10³/µL (valor ÷ 1.000)
update public.eventos_clinicos
   set valor_num = trim_scale(valor_num / 1000),
       unidade = '×10³/µL'
 where tipo in ('leuco', 'plaq') and unidade = '/mm3' and valor_num is not null;

-- 1e) texto das regras de alerta com o termo do design (limiar e regra não mudam)
update public.alert_rules set mensagem = replace(mensagem, 'Glicemia', 'Dx') where tipo_evento = 'dx';
update public.alert_rules set mensagem = replace(mensagem, ' rpm', ' ipm') where tipo_evento = 'fr';
update public.alert_rules set mensagem = replace(replace(mensagem, 'Tax ', 'Temperatura '), ' C', ' °C') where tipo_evento = 'temp';

-- ---------------------------------------------------------------------------
-- 2) Evoluções: uma grafia só para cada campo, a do design
-- ---------------------------------------------------------------------------
create or replace function public.fn_termos_design(p_sistema text, p jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public, pg_catalog
as $$
declare
  par record;
  r jsonb := p;
begin
  if r is null or jsonb_typeof(r) <> 'object' then
    return p;
  end if;
  for par in
    select t.velho, t.novo
      from (values
        ('hemo',    'pa_sys_max',        'pas_max'),
        ('hemo',    'pa_sys_min',        'pas_min'),
        ('hemo',    'pa_dia_max',        'pad_max'),
        ('hemo',    'pa_dia_min',        'pad_min'),
        ('infecto', 'tmax',              'temp_max'),
        ('infecto', 'tax_max',           'temp_max'),
        ('infecto', 'tax_min',           'temp_min'),
        ('renal',   'diurese_periodo_h', 'diurese_h'),
        ('*',       'obs',               'notas')
      ) as t(sistema, velho, novo)
     where t.sistema in (p_sistema, '*')
  loop
    -- só troca o nome da chave; se a chave nova já existir, nada é sobrescrito
    if (r ? par.velho) and not (r ? par.novo) then
      r := (r - par.velho) || jsonb_build_object(par.novo, r -> par.velho);
    end if;
  end loop;
  -- a diurese deixou de ter "24 h" cravado: volume e horas ficam em campos separados
  if p_sistema = 'renal' and (r ? 'diurese_24h_ml') and not (r ? 'diurese_ml') and not (r ? 'diurese_h') then
    r := (r - 'diurese_24h_ml') || jsonb_build_object('diurese_ml', r -> 'diurese_24h_ml', 'diurese_h', 24);
  end if;
  return r;
end
$$;
comment on function public.fn_termos_design(text, jsonb) is 'Troca as grafias antigas dos campos de um quadro da evolução pelas do design, sem mexer em valor. Usada pelo gatilho trg_00_termos_design.';

create or replace function public.fn_termos_design_condutas(p jsonb)
returns jsonb
language sql
immutable
set search_path = public, pg_catalog
as $$
  select case
    when p is null or jsonb_typeof(p) <> 'array' then p
    else coalesce((
      select jsonb_agg(
               case
                 when jsonb_typeof(t.el) = 'object' and jsonb_typeof(t.el -> 'sistema') = 'string' then
                   jsonb_set(t.el, '{sistema}', to_jsonb((
                     case lower(t.el ->> 'sistema')
                       when 'neuro'   then 'Neuro'
                       when 'resp'    then 'Resp'
                       when 'hemo'    then 'Cardio-hemodinâmica'
                       when 'cardio'  then 'Cardio-hemodinâmica'
                       when 'tgi'     then 'TGI'
                       when 'renal'   then 'Renal'
                       when 'hemato'  then 'Hemato'
                       when 'infecto' then 'Infecto'
                       else t.el ->> 'sistema'
                     end)::text))
                 else t.el
               end
               order by t.ord)
        from jsonb_array_elements(p) with ordinality as t(el, ord)
    ), '[]'::jsonb)
  end
$$;
comment on function public.fn_termos_design_condutas(jsonb) is 'No plano de conduta, o sistema passa a ser o nome do quadro no design (hemo vira Cardio-hemodinâmica). Não mexe no texto.';

-- 2a) linhas que já existem (sem disparar os gatilhos: não muda data, SOFA guardado nem dispositivos)
do $$
begin
  if exists (select 1 from pg_trigger where tgrelid = 'public.evolucoes'::regclass and not tgisinternal and tgenabled <> 'O') then
    raise exception 'há gatilho desligado em evolucoes; conferir antes de aplicar';
  end if;
end
$$;

alter table public.evolucoes disable trigger user;
update public.evolucoes
   set neuro   = public.fn_termos_design('neuro',   neuro),
       resp    = public.fn_termos_design('resp',    resp),
       hemo    = public.fn_termos_design('hemo',    hemo),
       tgi     = public.fn_termos_design('tgi',     tgi),
       renal   = public.fn_termos_design('renal',   renal),
       hemato  = public.fn_termos_design('hemato',  hemato),
       infecto = public.fn_termos_design('infecto', infecto),
       condutas_sistemas = public.fn_termos_design_condutas(condutas_sistemas);
alter table public.evolucoes enable trigger user;

-- ---------------------------------------------------------------------------
-- 3) Quem gravar com o termo antigo continua funcionando: o gatilho troca na entrada
-- ---------------------------------------------------------------------------
create or replace function public.fn_trg_termos_evolucao()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  new.neuro   := public.fn_termos_design('neuro',   new.neuro);
  new.resp    := public.fn_termos_design('resp',    new.resp);
  new.hemo    := public.fn_termos_design('hemo',    new.hemo);
  new.tgi     := public.fn_termos_design('tgi',     new.tgi);
  new.renal   := public.fn_termos_design('renal',   new.renal);
  new.hemato  := public.fn_termos_design('hemato',  new.hemato);
  new.infecto := public.fn_termos_design('infecto', new.infecto);
  new.condutas_sistemas := public.fn_termos_design_condutas(new.condutas_sistemas);
  return new;
end
$$;

create or replace function public.fn_trg_termos_evento()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  new.tipo := case new.tipo
                when 'pa_sys'     then 'pas'
                when 'pa_dia'     then 'pad'
                when 'glicemia'   then 'dx'
                when 'uf_dialise' then 'uf_trs'
                else new.tipo
              end;
  -- "ca" em mmol/L é cálcio iônico; em mg/dL continua sendo cálcio total
  if new.tipo = 'ca' and (new.unidade = 'mmol/L' or (new.unidade is null and new.valor_num < 3)) then
    new.tipo := 'cai';
  end if;
  if new.tipo in ('leuco', 'plaq') and new.unidade = '/mm3' and new.valor_num is not null then
    new.valor_num := trim_scale(new.valor_num / 1000);
    new.unidade := '×10³/µL';
  end if;
  return new;
end
$$;

create or replace function public.fn_trg_termos_tipo()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  new.tipo := case new.tipo
                when 'pa_sys'     then 'pas'
                when 'pa_dia'     then 'pad'
                when 'glicemia'   then 'dx'
                when 'uf_dialise' then 'uf_trs'
                else new.tipo
              end;
  return new;
end
$$;

-- o nome começa com 00 para rodar antes dos outros gatilhos da tabela
create trigger trg_00_termos_design before insert or update on public.evolucoes
  for each row execute function public.fn_trg_termos_evolucao();
create trigger trg_00_termos_design before insert or update on public.eventos_clinicos
  for each row execute function public.fn_trg_termos_evento();
create trigger trg_00_termos_design before insert or update on public.janelas_24h
  for each row execute function public.fn_trg_termos_tipo();

-- ---------------------------------------------------------------------------
-- 4) O nome do design ao lado de cada código que o banco guarda
-- ---------------------------------------------------------------------------
comment on column public.evolucoes.neuro   is 'Quadro Neuro do design. Chave = nome do campo no design, em minúsculas e sem acento (rass, cam_icu, pupilas, deficit_focal, analgesia, notas). Escolha guarda o texto do botão, igual ao da tela (ex.: "Não aplicável").';
comment on column public.evolucoes.resp    is 'Quadro Resp do design (suporte, via, modo, peep, fio2, pao2, fr_max, fr_min, spo2_max, spo2_min, ausculta, notas). Escolha guarda o texto do botão.';
comment on column public.evolucoes.hemo    is 'Quadro Cardio-hemodinâmica do design (pas_*, pad_*, pam_*, fc_*, ritmo, tec_s, extremidades, pulsos, ausculta, edema, notas). Escolha guarda o texto do botão.';
comment on column public.evolucoes.tgi     is 'Quadro TGI do design (dieta, dx_max, dx_min, evacuacoes, abdome, notas). Escolha guarda o texto do botão.';
comment on column public.evolucoes.renal   is 'Quadro Renal do design (diurese_via, diurese_ml, diurese_h, bh_24h_ml, trs, notas). Escolha guarda o texto do botão.';
comment on column public.evolucoes.hemato  is 'Quadro Hemato do design (profilaxia_tvp, profilaxia_lamg, notas).';
comment on column public.evolucoes.infecto is 'Quadro Infecto do design (temp_max, temp_min, seg, bast, foco, notas). Antimicrobianos e culturas ficam nas tabelas atbs e culturas.';
comment on column public.evolucoes.dvas      is 'Vasoativos em uso (quadro Cardio-hemodinâmica): [{droga, diluicao, vazao_ml_h, dose, unidade}].';
comment on column public.evolucoes.sedativos is 'Sedação e analgesia em uso (quadro Neuro): [{droga, diluicao, vazao_ml_h, dose, unidade}].';
comment on column public.evolucoes.impressao is 'Impressão clínica / problemas: um problema por linha, na ordem.';
comment on column public.evolucoes.condutas_sistemas is 'Plano de conduta 24 h: [{sistema, texto}]. sistema é o nome do quadro: Neuro, Resp, Cardio-hemodinâmica, TGI, Renal, Hemato ou Infecto.';

comment on type public.gravidade_enum        is 'Nome no design: estavel = Estável · watcher = Watcher · instavel = Instável · critico = Crítico.';
comment on type public.isolamento_enum       is 'Nome no design: none = sem isolamento · contact = contato · droplet = gotícula · aerosol = aerossol.';
comment on type public.turno_enum            is 'Nome no design: diurna = diurno · noturna = noturno.';
comment on type public.dispositivo_tipo_enum is 'Nome no design: iot = IOT · traqueo = TQT · cvc = CVC · picc = PICC · arterial = PAI · svd = SVD · sne = SNE · sng = SNG · dreno = Dreno · gtt = GTT · trr = Shiley (cateter de TRS) · marca_passo = Marca-passo · outro = Outro.';
comment on type public.material_cultura_enum is 'Nome no design: hemocultura = Hemocultura · urocultura = Urocultura · aspirado_traqueal = Aspirado traqueal · lavado_bal = Lavado broncoalveolar · lcr = Líquor · secrecao_ferida = Secreção de ferida · liquido_peritoneal = Líquido peritoneal · liquido_pleural = Líquido pleural · outro = Outro.';

-- ---------------------------------------------------------------------------
-- 5) Conferência: se qualquer coisa não bater, a migração inteira é desfeita
-- ---------------------------------------------------------------------------
do $$
declare
  n int;
begin
  if (select count(*) from public.eventos_clinicos) <> (select count(*) from arquivo.termos_20261122_eventos) then
    raise exception 'a contagem de eventos mudou';
  end if;
  if (select count(*) from public.evolucoes) <> (select count(*) from arquivo.termos_20261122_evolucoes) then
    raise exception 'a contagem de evoluções mudou';
  end if;
  if exists (select 1 from public.eventos_clinicos where tipo in ('pa_sys', 'pa_dia', 'glicemia', 'uf_dialise')) then
    raise exception 'sobrou código antigo em eventos_clinicos';
  end if;
  if exists (select 1 from public.janelas_24h where tipo in ('pa_sys', 'pa_dia', 'glicemia', 'uf_dialise')) then
    raise exception 'sobrou código antigo em janelas_24h';
  end if;
  -- cada tipo novo tem exatamente as linhas do tipo antigo
  select count(*) into n
    from (select a.id from arquivo.termos_20261122_eventos a join public.eventos_clinicos e using (id)
           where (a.tipo, e.tipo) not in (('pa_sys', 'pas'), ('pa_dia', 'pad'), ('glicemia', 'dx'), ('uf_dialise', 'uf_trs'), ('ca', 'cai'))
             and a.tipo <> e.tipo) x;
  if n > 0 then raise exception 'evento mudou para um tipo inesperado (%)', n; end if;
  -- valor só muda em leucócitos e plaquetas, e exatamente por 1.000
  select count(*) into n
    from arquivo.termos_20261122_eventos a join public.eventos_clinicos e using (id)
   where a.valor_num is distinct from e.valor_num
     and not (e.tipo in ('leuco', 'plaq') and a.unidade = '/mm3' and a.valor_num = e.valor_num * 1000);
  if n > 0 then raise exception 'valor de evento mudou fora do previsto (%)', n; end if;
  if exists (select 1 from public.eventos_clinicos where (tipo = 'leuco' and valor_num >= 1000) or (tipo = 'plaq' and valor_num >= 5000)) then
    raise exception 'leucócitos ou plaquetas ainda fora da unidade do design';
  end if;
  -- nenhuma grafia antiga sobrou nas evoluções
  if exists (select 1 from public.evolucoes
              where hemo ?| array['pa_sys_max', 'pa_sys_min', 'pa_dia_max', 'pa_dia_min', 'obs']
                 or infecto ?| array['tmax', 'tax_max', 'tax_min', 'obs']
                 or renal ?| array['obs', 'diurese_periodo_h']
                 or resp ? 'obs' or tgi ? 'obs' or hemato ? 'obs' or neuro ? 'obs') then
    raise exception 'sobrou grafia antiga em evolucoes';
  end if;
  -- nenhum valor se perdeu na troca de nome
  select count(*) into n
    from arquivo.termos_20261122_evolucoes a join public.evolucoes e using (id)
   where (a.hemo ? 'pa_sys_max' and a.hemo -> 'pa_sys_max' is distinct from e.hemo -> 'pas_max')
      or (a.hemo ? 'pa_sys_min' and a.hemo -> 'pa_sys_min' is distinct from e.hemo -> 'pas_min')
      or (a.hemo ? 'pa_dia_max' and a.hemo -> 'pa_dia_max' is distinct from e.hemo -> 'pad_max')
      or (a.hemo ? 'pa_dia_min' and a.hemo -> 'pa_dia_min' is distinct from e.hemo -> 'pad_min')
      or (a.hemo ? 'pas_max'    and a.hemo -> 'pas_max'    is distinct from e.hemo -> 'pas_max')
      or (a.infecto ? 'tmax'    and a.infecto -> 'tmax'    is distinct from e.infecto -> 'temp_max')
      or (a.infecto ? 'tax_max' and a.infecto -> 'tax_max' is distinct from e.infecto -> 'temp_max')
      or (a.infecto ? 'tax_min' and a.infecto -> 'tax_min' is distinct from e.infecto -> 'temp_min')
      or (a.hemo ? 'obs'    and a.hemo -> 'obs'    is distinct from e.hemo -> 'notas')
      or (a.resp ? 'obs'    and a.resp -> 'obs'    is distinct from e.resp -> 'notas')
      or (a.tgi ? 'obs'     and a.tgi -> 'obs'     is distinct from e.tgi -> 'notas')
      or (a.renal ? 'obs'   and a.renal -> 'obs'   is distinct from e.renal -> 'notas')
      or (a.hemato ? 'obs'  and a.hemato -> 'obs'  is distinct from e.hemato -> 'notas')
      or (a.infecto ? 'obs' and a.infecto -> 'obs' is distinct from e.infecto -> 'notas')
      or (a.renal ? 'diurese_24h_ml' and not (a.renal ? 'diurese_ml') and not (a.renal ? 'diurese_periodo_h')
          and (a.renal -> 'diurese_24h_ml' is distinct from e.renal -> 'diurese_ml' or (e.renal ->> 'diurese_h') is distinct from '24'))
      or jsonb_array_length(case when jsonb_typeof(a.condutas_sistemas) = 'array' then a.condutas_sistemas else '[]'::jsonb end)
         <> jsonb_array_length(case when jsonb_typeof(e.condutas_sistemas) = 'array' then e.condutas_sistemas else '[]'::jsonb end);
  if n > 0 then raise exception 'valor de evolução não bateu depois da troca de nome (%)', n; end if;
  if (select count(*) from public.evento_tipo_ref) <> (select count(*) + 1 from arquivo.termos_20261122_vocabulario) then
    raise exception 'o vocabulário não ficou com o tamanho esperado';
  end if;
end
$$;
