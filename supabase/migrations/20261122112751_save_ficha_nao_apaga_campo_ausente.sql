-- save_ficha (funcao antiga, sem uso pelo app): campo que nao vem no JSON nao e mais apagado.
-- Antes: hd, idade, peso, altura e alergias viravam nulo quando a chave nao vinha; ao atualizar
-- uma evolucao, quadro ausente virava vazio; pendencia sem "concluida" voltava a aberta.
-- Agora: chave ausente = valor mantido. Chave presente = comportamento de antes.
create or replace function public.save_ficha(p_paciente_id uuid, p_pac jsonb, p_evol jsonb, p_evolucao_id uuid, p_plantao text, p_pendencias jsonb default '[]'::jsonb)
 returns uuid
 language plpgsql
 security definer
 set search_path to 'public', 'pg_catalog'
as $function$
declare v_evol_id uuid; v_uid uuid := auth.uid(); pend jsonb;
begin
  update pacientes set
    nome = coalesce(p_pac->>'nome', nome), leito = coalesce(p_pac->>'leito', leito),
    hd = case when p_pac ? 'hd' then p_pac->>'hd' else hd end,
    idade = case when p_pac ? 'idade' then nullif(p_pac->>'idade','')::int else idade end,
    peso = case when p_pac ? 'peso' then nullif(p_pac->>'peso','')::numeric else peso end,
    altura = case when p_pac ? 'altura' then nullif(p_pac->>'altura','')::numeric else altura end,
    alergias = case when p_pac ? 'alergias' then p_pac->>'alergias' else alergias end,
    gravidade = coalesce(nullif(p_pac->>'gravidade','')::public.gravidade_enum, gravidade),
    data_adm = coalesce(nullif(p_pac->>'data_adm','')::date, data_adm)
  where id = p_paciente_id and (user_id is null or user_id = v_uid);
  if not found then raise exception 'paciente % nao encontrado ou sem permissao', p_paciente_id; end if;

  if p_evolucao_id is not null then
    update evolucoes set
      neuro = case when p_evol ? 'neuro' then coalesce(p_evol->'neuro','{}'::jsonb) else neuro end,
      resp = case when p_evol ? 'resp' then coalesce(p_evol->'resp','{}'::jsonb) else resp end,
      hemo = case when p_evol ? 'hemo' then coalesce(p_evol->'hemo','{}'::jsonb) else hemo end,
      tgi = case when p_evol ? 'tgi' then coalesce(p_evol->'tgi','{}'::jsonb) else tgi end,
      renal = case when p_evol ? 'renal' then coalesce(p_evol->'renal','{}'::jsonb) else renal end,
      hemato = case when p_evol ? 'hemato' then coalesce(p_evol->'hemato','{}'::jsonb) else hemato end,
      infecto = case when p_evol ? 'infecto' then coalesce(p_evol->'infecto','{}'::jsonb) else infecto end,
      dvas = case when p_evol ? 'dvas' then coalesce(p_evol->'dvas','[]'::jsonb) else dvas end,
      sedativos = case when p_evol ? 'sedativos' then coalesce(p_evol->'sedativos','[]'::jsonb) else sedativos end,
      impressao = case when p_evol ? 'impressao' then coalesce(array(select jsonb_array_elements_text(p_evol->'impressao')),'{}') else impressao end,
      conduta = case when p_evol ? 'conduta' then coalesce(array(select jsonb_array_elements_text(p_evol->'conduta')),'{}') else conduta end,
      problemas_ativos = case when p_evol ? 'problemas_ativos' then coalesce(p_evol->'problemas_ativos','[]'::jsonb) else problemas_ativos end,
      condutas_sistemas = case when p_evol ? 'condutas_sistemas' then coalesce(p_evol->'condutas_sistemas','[]'::jsonb) else condutas_sistemas end,
      riscos = case when p_evol ? 'riscos' then coalesce(p_evol->'riscos','[]'::jsonb) else riscos end
    where id = p_evolucao_id returning id into v_evol_id;
    if v_evol_id is null then raise exception 'evolucao % nao encontrada', p_evolucao_id; end if;
  else
    insert into evolucoes (paciente_id, user_id, data_evolucao, plantao, neuro, resp, hemo, tgi, renal, hemato, infecto,
      dvas, sedativos, impressao, conduta, problemas_ativos, condutas_sistemas, riscos, sofa_snapshot)
    values (p_paciente_id, v_uid, now(), p_plantao::public.plantao_enum,
      coalesce(p_evol->'neuro','{}'::jsonb), coalesce(p_evol->'resp','{}'::jsonb), coalesce(p_evol->'hemo','{}'::jsonb),
      coalesce(p_evol->'tgi','{}'::jsonb), coalesce(p_evol->'renal','{}'::jsonb), coalesce(p_evol->'hemato','{}'::jsonb),
      coalesce(p_evol->'infecto','{}'::jsonb), coalesce(p_evol->'dvas','[]'::jsonb), coalesce(p_evol->'sedativos','[]'::jsonb),
      coalesce(array(select jsonb_array_elements_text(p_evol->'impressao')),'{}'),
      coalesce(array(select jsonb_array_elements_text(p_evol->'conduta')),'{}'),
      coalesce(p_evol->'problemas_ativos','[]'::jsonb), coalesce(p_evol->'condutas_sistemas','[]'::jsonb),
      coalesce(p_evol->'riscos','[]'::jsonb), '{}'::jsonb)
    returning id into v_evol_id;
  end if;

  for pend in select * from jsonb_array_elements(coalesce(p_pendencias,'[]'::jsonb)) loop
    if coalesce(pend->>'id','') <> '' then
      update pendencias set
        tarefa = coalesce(pend->>'tarefa', tarefa),
        concluida = case when pend ? 'concluida' then coalesce((pend->>'concluida')::boolean,false) else concluida end,
        concluida_at = case when pend ? 'concluida' then (case when (pend->>'concluida')::boolean then now() else null end) else concluida_at end
      where id = (pend->>'id')::uuid;
    elsif coalesce(pend->>'tarefa','') <> '' then
      insert into pendencias (paciente_id, user_id, tarefa, prioridade, concluida)
      values (p_paciente_id, v_uid, pend->>'tarefa', 2, coalesce((pend->>'concluida')::boolean,false));
    end if;
  end loop;
  return v_evol_id;
end;
$function$;
