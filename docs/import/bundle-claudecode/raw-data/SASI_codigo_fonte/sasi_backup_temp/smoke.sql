-- ============================================================================
--  SASI — Smoke Test do Schema v1.0
--  Roda em sequência; se tudo passa, o schema está íntegro.
--
--  Uso:
--    psql $DATABASE_URL -f supabase/tests/smoke.sql
--    ou cole no Supabase SQL Editor
--
--  Saída esperada: 10 NOTICEs "✅ PASS" e nenhum "❌ FAIL".
-- ============================================================================

-- Helper: função que dá RAISE NOTICE verde ou vermelho
create or replace function public.fn_assert(p_cond boolean, p_name text)
returns void language plpgsql as $$
begin
  if p_cond then
    raise notice '✅ PASS · %', p_name;
  else
    raise exception '❌ FAIL · %', p_name;
  end if;
end;
$$;

-- ┌──────────────────────────────────────────────────────────────────────┐
-- │  TESTE 1 — Todas as tabelas existem                                  │
-- └──────────────────────────────────────────────────────────────────────┘
do $$
declare
  tbls text[] := array[
    'pacientes', 'evolucoes', 'eventos_clinicos', 'pendencias',
    'atbs', 'culturas', 'antibiograma', 'alerts_log', 'ingest_audit_log'
  ];
  t text;
  count_found int := 0;
begin
  foreach t in array tbls loop
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = t) then
      count_found := count_found + 1;
    else
      raise notice '  -> Tabela ausente: %', t;
    end if;
  end loop;
  perform public.fn_assert(count_found = array_length(tbls, 1), '9 tabelas criadas');
end;
$$;

-- ┌──────────────────────────────────────────────────────────────────────┐
-- │  TESTE 2 — Todas as views existem                                    │
-- └──────────────────────────────────────────────────────────────────────┘
do $$
declare
  vws text[] := array[
    'vw_dashboard_uti', 'vw_sofa_trend_72h', 'vw_bh_acumulado',
    'vw_dias_atb_ativo', 'vw_alertas_abertos'
  ];
  v text;
  count_found int := 0;
begin
  foreach v in array vws loop
    if exists (select 1 from information_schema.views where table_schema = 'public' and table_name = v) then
      count_found := count_found + 1;
    end if;
  end loop;
  perform public.fn_assert(count_found = array_length(vws, 1), '5 views criadas');
end;
$$;

-- ┌──────────────────────────────────────────────────────────────────────┐
-- │  TESTE 3 — RLS habilitada em todas as tabelas                        │
-- └──────────────────────────────────────────────────────────────────────┘
do $$
declare
  count_rls int;
begin
  select count(*) into count_rls
  from pg_tables
  where schemaname = 'public'
    and tablename in ('pacientes', 'evolucoes', 'eventos_clinicos',
                      'pendencias', 'atbs', 'culturas', 'antibiograma',
                      'alerts_log', 'ingest_audit_log')
    and rowsecurity = true;
  perform public.fn_assert(count_rls = 9, 'RLS habilitada em 9 tabelas');
end;
$$;

-- ┌──────────────────────────────────────────────────────────────────────┐
-- │  TESTE 4 — Nenhuma policy usa `using (true)` (LGPD compliance)       │
-- └──────────────────────────────────────────────────────────────────────┘
do $$
declare
  count_aberta int;
begin
  select count(*) into count_aberta
  from pg_policies
  where schemaname = 'public'
    and qual = 'true';   -- expressão literal "true" sem qualquer predicado
  perform public.fn_assert(count_aberta = 0, 'Zero policies abertas (using true)');
end;
$$;

-- ┌──────────────────────────────────────────────────────────────────────┐
-- │  TESTE 5 — CHECK constraints de UTI funcionam                        │
-- └──────────────────────────────────────────────────────────────────────┘
do $$
declare
  errou boolean := false;
begin
  -- Deve falhar: UTI inválida
  begin
    insert into public.pacientes (leito, uti, nome)
    values ('999', 'UTI_INVALIDA', 'TESTE');
  exception
    when check_violation then errou := true;
  end;
  perform public.fn_assert(errou, 'CHECK de uti rejeita valor inválido');
end;
$$;

-- ┌──────────────────────────────────────────────────────────────────────┐
-- │  TESTE 6 — Coluna GENERATED de dias_terapia funciona                 │
-- └──────────────────────────────────────────────────────────────────────┘
do $$
declare
  v_user_id uuid;
  v_pac uuid;
  v_atb uuid;
  v_dias int;
begin
  -- Setup: criar paciente teste
  v_user_id := gen_random_uuid();
  insert into public.pacientes (user_id, leito, uti, nome, data_adm)
  values (v_user_id, '99', 'UTI2', 'SMOKE TEST', current_date - 5)
  returning id into v_pac;

  -- Inserir ATB com data_inicio 3 dias atrás
  insert into public.atbs (paciente_id, droga, data_inicio)
  values (v_pac, 'Smoke ATB', current_date - 2)
  returning id into v_atb;

  -- Verificar que dias_terapia = 3 (hoje - 2 dias atrás + 1)
  select dias_terapia into v_dias from public.atbs where id = v_atb;
  perform public.fn_assert(v_dias = 3, 'dias_terapia GENERATED = 3 dias (atb iniciado há 2 dias)');

  -- Cleanup
  delete from public.pacientes where id = v_pac;
end;
$$;

-- ┌──────────────────────────────────────────────────────────────────────┐
-- │  TESTE 7 — Trigger updated_at funciona                               │
-- └──────────────────────────────────────────────────────────────────────┘
do $$
declare
  v_user_id uuid := gen_random_uuid();
  v_pac uuid;
  v_ts_inicial timestamptz;
  v_ts_final timestamptz;
begin
  insert into public.pacientes (user_id, leito, uti, nome)
  values (v_user_id, '98', 'UTI2', 'TRIGGER TEST')
  returning id, updated_at into v_pac, v_ts_inicial;

  perform pg_sleep(0.1);

  update public.pacientes set hd = 'Teste trigger' where id = v_pac;
  select updated_at into v_ts_final from public.pacientes where id = v_pac;

  perform public.fn_assert(v_ts_final > v_ts_inicial, 'Trigger updated_at incrementa no UPDATE');

  delete from public.pacientes where id = v_pac;
end;
$$;

-- ┌──────────────────────────────────────────────────────────────────────┐
-- │  TESTE 8 — Trigger de invalidação SOFA zera cache                    │
-- └──────────────────────────────────────────────────────────────────────┘
do $$
declare
  v_user_id uuid := gen_random_uuid();
  v_pac uuid;
  v_evo uuid;
  v_sofa_depois int;
  v_snapshot_depois jsonb;
begin
  insert into public.pacientes (user_id, leito, uti, nome)
  values (v_user_id, '97', 'UTI2', 'SOFA CACHE TEST')
  returning id into v_pac;

  insert into public.evolucoes (paciente_id, sofa_total, sofa_snapshot, hemo)
  values (v_pac, 8, '{"total": 8}'::jsonb, '{"pam1": "70"}'::jsonb)
  returning id into v_evo;

  -- Update em hemo deve invalidar cache
  update public.evolucoes set hemo = '{"pam1": "55"}'::jsonb where id = v_evo;

  select sofa_total, sofa_snapshot into v_sofa_depois, v_snapshot_depois
  from public.evolucoes where id = v_evo;

  perform public.fn_assert(
    v_sofa_depois is null and v_snapshot_depois is null,
    'Trigger invalida sofa_snapshot quando hemo muda'
  );

  delete from public.pacientes where id = v_pac;
end;
$$;

-- ┌──────────────────────────────────────────────────────────────────────┐
-- │  TESTE 9 — unique constraint de leito ATIVO funciona                 │
-- └──────────────────────────────────────────────────────────────────────┘
do $$
declare
  v_user_id uuid := gen_random_uuid();
  v_pac1 uuid;
  errou boolean := false;
begin
  -- Primeiro paciente no leito 96
  insert into public.pacientes (user_id, leito, uti, nome)
  values (v_user_id, '96', 'UTI2', 'PRIMEIRO')
  returning id into v_pac1;

  -- Segundo paciente ATIVO no mesmo leito deve falhar
  begin
    insert into public.pacientes (user_id, leito, uti, nome)
    values (v_user_id, '96', 'UTI2', 'SEGUNDO');
  exception
    when unique_violation then errou := true;
  end;
  perform public.fn_assert(errou, 'Unique constraint bloqueia 2 pacientes ativos no mesmo leito');

  -- Mas se primeiro recebeu alta, segundo deve conseguir entrar
  update public.pacientes set status_leito = 'alta' where id = v_pac1;
  insert into public.pacientes (user_id, leito, uti, nome)
  values (v_user_id, '96', 'UTI2', 'SEGUNDO-APOS-ALTA');
  perform public.fn_assert(true, 'Após alta, novo paciente pode ocupar o leito');

  -- Cleanup
  delete from public.pacientes where leito = '96' and uti = 'UTI2';
end;
$$;

-- ┌──────────────────────────────────────────────────────────────────────┐
-- │  TESTE 10 — vw_dashboard_uti retorna estrutura esperada              │
-- └──────────────────────────────────────────────────────────────────────┘
do $$
declare
  v_cols text[];
  v_required text[] := array[
    'paciente_id', 'user_id', 'leito', 'uti', 'nome', 'idade', 'peso',
    'hd', 'gravidade', 'status_leito', 'data_adm', 'dias_internacao',
    'evolucao_id', 'ultima_evolucao', 'sofa_total', 'sofa_snapshot',
    'dvas', 'sedativos', 'delta_sofa_24h', 'pendencias_abertas'
  ];
  col text;
  faltantes text[] := '{}';
begin
  select array_agg(column_name::text) into v_cols
  from information_schema.columns
  where table_schema = 'public' and table_name = 'vw_dashboard_uti';

  foreach col in array v_required loop
    if not (col = any(v_cols)) then
      faltantes := array_append(faltantes, col);
    end if;
  end loop;

  perform public.fn_assert(
    array_length(faltantes, 1) is null,
    'vw_dashboard_uti tem 20 colunas exigidas pelo hook'
  );
end;
$$;

-- Cleanup helper
drop function if exists public.fn_assert(boolean, text);

-- ============================================================================
--  Resumo: se chegou até aqui sem exceção, o schema está íntegro.
--  Próximo passo: deploy da Edge Function + teste end-to-end.
-- ============================================================================
