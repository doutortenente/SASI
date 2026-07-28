-- =====================================================================
-- SASI — MOLDE SQL POR PACIENTE   (Planilha SASI V2.1  ->  Supabase)
-- =====================================================================
-- O QUE É: um "formulário em SQL". Você preenche os campos de UM paciente
--          e roda uma vez. Grava a ficha inteira (cadastro + evolução do
--          plantão + vitais/labs + antibióticos + culturas + pendências) de
--          forma ATÔMICA: ou grava tudo, ou nada (se der erro no meio, o
--          banco desfaz sozinho — nada fica pela metade).
--
-- COMO USAR:
--   1. Copie este bloco inteiro para cada paciente novo (1 bloco = 1 paciente).
--   2. Troque os campos  <<...>>  e os  null  pelos valores reais.
--   3. Cole no "SQL Editor" do Supabase (a telinha de comandos do banco) e rode.
--
-- REGRA DE FERRO (ZERO ALUCINAÇÃO):
--   Campo sem fonte legível fica  null . NUNCA invente um valor "razoável".
--   Deixar em branco é o certo — o molde aceita null em tudo que não é obrigatório.
--
-- OBRIGATÓRIOS (o banco recusa se faltar): nome, leito, uti.
--
-- ONDE CADA ABA DA PLANILHA CAI NO BANCO:
--   Aba 1 Patient Summary  -> tabela pacientes (+ campo patient_summary)
--   Aba 2 Rotina/Vitais    -> evolucoes (sistemas) e eventos_clinicos (série)
--   Aba 3 Aval. Sistemas   -> evolucoes (neuro/resp/hemo/tgi/renal/hemato/infecto)
--   Aba 4 Impressão        -> evolucoes.impressao / problemas_ativos
--   Aba 5 Conduta          -> evolucoes.conduta / condutas_sistemas
--   Aba 6 Safety Check     -> evolucoes.riscos + patient_summary (iatrogenias...)
--   Aba 7 Folhão Lab       -> eventos_clinicos (uma linha por valor)
--   Aba 8 Output Evolução  -> gerada na leitura, não é campo de banco
--
-- ARMADILHAS QUE O BANCO CHECA (se errar, ele recusa e explica):
--   • uti        -> só  'UTI2' , 'UTI3'  ou  'UTI4' .
--   • altura     -> em CENTÍMETROS, não em metros. 1,75 m  =>  175.
--   • idade      -> 0 a 130.   peso -> 1 a 400 (kg).
--   • gravidade  -> 'estavel' | 'moderado' | 'grave' | 'critico' | 'obito'.
--   • leito      -> não pode repetir outro leito ATIVO na mesma UTI.
--   • Sinais vitais entram como par  MÁX / MÍN  (campos _max e _min).
-- =====================================================================

do $$
declare
  v_pac_id  uuid;   -- id do paciente (preenchido automaticamente)
  v_evol_id uuid;   -- id da evolução (preenchido automaticamente)
begin

  -- ===================================================================
  -- 1) CADASTRO DO PACIENTE     (aba "Patient Summary" -> tabela pacientes)
  -- ===================================================================
  insert into public.pacientes (
    leito, uti, nome, idade, peso, altura, hd, data_adm, alergias,
    gravidade, status_leito, isolation, dispositivos, riscos_flags, patient_summary
  ) values (
    '<<LEITO ex: L05>>',            -- OBRIGATÓRIO  (padrão do leito: L01..L12)
    'UTI2',                         -- OBRIGATÓRIO  UTI2 | UTI3 | UTI4
    '<<NOME COMPLETO>>',            -- OBRIGATÓRIO
    null,                           -- idade (anos, 0-130) ou null
    null,                           -- peso (kg, 1-400) ou null
    null,                           -- altura EM CENTÍMETROS (30-250) — 1,75 m => 175
    null,                           -- hd = hipóteses/problemas ativos (texto) ou null
    current_date,                   -- data de admissão na UTI  (formato AAAA-MM-DD)
    null,                           -- alergias ou null
    'estavel',                      -- estavel|moderado|grave|critico|obito
    'ativo',                        -- status do leito (deixe 'ativo' na admissão)
    'none',                         -- isolamento: none|contact|droplet|aerosol

    -- DISPOSITIVOS: true/false por dispositivo + um texto livre em "detalhe"
    -- (nº do tubo, sítio e data do cateter...). Marque true no que existe.
    jsonb_build_object(
      'iot',     false,   -- intubação orotraqueal
      'cvc',     false,   -- cateter venoso central
      'pai',     false,   -- pressão arterial invasiva
      'svd',     false,   -- sonda vesical de demora
      'sne',     false,   -- sonda nasoenteral / nasogástrica
      'avp',     false,   -- acesso venoso periférico
      'picc',    false,
      'tqt',     false,   -- traqueostomia
      'dreno',   false,
      'mpd',     false,   -- marca-passo
      'shilley', false,   -- cateter de diálise
      'detalhe', null     -- texto livre (nº tubo/prof, sítios, datas...) ou null
    ),

    -- RISCOS_FLAGS: marcadores binários de risco (true/false).
    jsonb_build_object(
      'pav',             false,  -- pneumonia associada à ventilação
      'broncoaspiracao', false,
      'upp',             false,  -- úlcera por pressão
      'queda',           false,
      'diabetico',       false
    ),

    -- PATIENT SUMMARY: a "ficha congelada" que NÃO tem coluna própria.
    -- IMPORTANTE: as telas do app leem ESTES nomes de campo (contrato do
    -- frontend). Ao lado, a que campo da PLANILHA cada um corresponde.
    jsonb_build_object(
      'data_admissao',            null,        -- = data de admissão (espelha data_adm)
      'motivo_admissao',          null,        -- planilha: "Admissão congelada" / motivo de entrada
      'hpma',                     null,        -- história da moléstia atual
      'antecedentes',             null,        -- planilha: "Antecedentes"
      'medicamentos_domiciliares','[]'::jsonb, -- planilha: "Med. domiciliar" -> ["Losartana 50mg","AAS 100mg"]
      'alergias',                 null,        -- (também vai na coluna alergias)
      'dispositivos',             '[]'::jsonb, -- [{"tipo":"CVC","local":"JID","data_insercao":"2026-07-20"}]
      'suporte_atual', jsonb_build_object(     -- planilha: bloco "USO" (o que está correndo agora)
        'dvas',        '[]'::jsonb,            -- drogas vasoativas
        'ventilacao',  null,                   -- modo/parâmetros de ventilação
        'sedacao',     null,                   -- sedação (meta RASS)
        'antibioticos','[]'::jsonb             -- ATB em curso -> ["Meropenem D3"]
        -- (NPT/TNE da planilha: descreva em plano_terapeutico_atual abaixo)
      ),
      'interconsultas','[]'::jsonb,  -- planilha "Especialidades": [{"especialidade":"Nefrologia","data":"2026-07-24","status":"pendente","notas":"..."}]
      'programacao',   '[]'::jsonb,  -- [{"descricao":"TC de crânio","data":"2026-07-25","tipo":"exame","status":"pendente"}]
      'resumo_sistemas','[]'::jsonb, -- [{"id":"hemo_cv","label":"Hemo/CV","emoji":"🫀","texto":"..."}]  ids: hemo_cv,infecto,renal,gi,resp,snc,pontos_criticos
      'iatrogenias',             null,  -- planilha Safety Check: interações/iatrogenias
      'sutilezas',               null,  -- planilha Safety Check: sutilezas clínicas
      'dva_fluidos',             null,  -- planilha Safety Check: manejo de fluidos / DVA
      'exames_relevantes',       null,  -- planilha "Exames de imagem realizados" (texto)
      'plano_terapeutico_atual', null,  -- plano/metas (+ NPT/TNE se houver)
      'ultima_atualizacao',      now()
    )
  )
  returning id into v_pac_id;

  -- ===================================================================
  -- 2) EVOLUÇÃO DO PLANTÃO   (abas 2 a 6 -> tabela evolucoes)
  --    Um "retrato" do plantão: estado por sistema + impressão + conduta.
  --    Os nomes de campo abaixo são os que os 7 pacientes vivos usam hoje.
  -- ===================================================================
  insert into public.evolucoes (
    paciente_id, data_evolucao, plantao,
    neuro, resp, hemo, tgi, renal, hemato, infecto,
    dvas, sedativos, impressao, conduta,
    problemas_ativos, condutas_sistemas, riscos, prescricao
  ) values (
    v_pac_id, now(),
    'tarde',                        -- turno: manha | tarde | noite | plantao_24h

    -- ---- EIXO ESTADO: achado objetivo por sistema (aba 3) --------------
    jsonb_build_object('descricao', null, 'rass', null),                  -- neuro
    jsonb_build_object('suporte', null,                                   -- resp
        'fr_max', null,  'fr_min', null,
        'spo2_max', null,'spo2_min', null, 'obs', null),
    jsonb_build_object(                                                   -- hemo (cardiovascular)
        'pa_sys_max', null, 'pa_sys_min', null,   -- PAS máx/mín
        'pa_dia_max', null, 'pa_dia_min', null,   -- PAD máx/mín
        'pam_max',    null, 'pam_min',    null,   -- PAM máx/mín
        'fc_max',     null, 'fc_min',     null,   -- FC  máx/mín
        'ritmo', null, 'obs', null),
    jsonb_build_object('dieta', null, 'obs', null),                       -- tgi (glicemia -> use eventos, tipo 'glicemia')
    jsonb_build_object('cr', null, 'ur', null,                           -- renal
        'diurese_6_18h_ml', null, 'bh_6_18h_ml', null,
        'descricao', null, 'obs', null),
    jsonb_build_object('hb', null, 'ht', null, 'plaq', null, 'obs', null),-- hemato
    jsonb_build_object('atb', null, 'tmax', null,                        -- infecto (temperatura = tmax aqui)
        'leuco', null, 'obs', null),

    -- ---- Drogas em infusão contínua (aba "Uso") -----------------------
    -- formato de cada item: {"droga":"...","dose":"...","unidade":"..."}
    '[]'::jsonb,   -- dvas       (ex.: noradrenalina)
    '[]'::jsonb,   -- sedativos  (ex.: fentanil, midazolam)

    -- ---- Impressão (aba 4) e Conduta (aba 5), 1 item por linha --------
    -- Regra da planilha: cada CONDUTA nasce de 1 PROBLEMA (1:1).
    array[]::text[],   -- impressao : {'1. Choque séptico ↓', '2. IRA KDIGO 2 =', ...}
    array[]::text[],   -- conduta   : {'1. Nora p/ PAM>=65', '2. Repor volume 500ml', ...}

    -- ---- Versões ESTRUTURADAS (usadas pelas telas novas do app) -------
    '[]'::jsonb,  -- problemas_ativos : [{"texto":"...","sistema":"hemo","gravidade":"grave"}]  (sistema: neuro|resp|hemo|tgi|renal|hemato|infecto ; gravidade: leve|moderada|grave|critica)
    '[]'::jsonb,  -- condutas_sistemas: [{"sistema":"hemo","texto":"...","meta":"PAM>=65","prazo":"6h"}]
    '[]'::jsonb,  -- riscos (aba 6 Safety): [{"texto":"...","nivel":"alto"}]  (nivel: baixo|medio|alto)

    -- ---- Prescrição atual por categoria (aba 2, lado direito) ---------
    -- cada categoria é uma lista de linhas de prescrição (texto).
    jsonb_build_object(
      'cardiovascular',      '[]'::jsonb,
      'snc',                 '[]'::jsonb,
      'gastro_endocrino',    '[]'::jsonb,
      'infeccioso_resp',     '[]'::jsonb,
      'sintomaticos_sn',     '[]'::jsonb,
      'solucoes_diureticos', '[]'::jsonb,
      'nutricao',            '[]'::jsonb
    )
  )
  returning id into v_evol_id;

  -- ===================================================================
  -- 3) VITAIS / LABORATÓRIO como SÉRIE TEMPORAL  (abas 2 e 7 -> eventos_clinicos)
  --    OPCIONAL, mas é o que alimenta as TENDÊNCIAS e os ALERTAS do sistema.
  --    Uma linha = um valor num instante. Um par Máx/Mín = DUAS linhas
  --    (diferenciadas pelo campo "param" dentro de valor_json).
  --    'tipo' precisa ser um dos códigos aceitos (lista no ANEXO A).
  --    'fonte' = 'manual' (digitado à mão).  confidence 1.0 = alta (não vira revisão).
  --    Cada linha PRECISA de um número em valor_num. Os números abaixo são
  --    EXEMPLO — troque pelos valores reais. Descomente e replique o que usar:
  -- ===================================================================
  /*
  insert into public.eventos_clinicos
      (paciente_id, evolucao_id, ts, tipo, valor_num, unidade, fonte, confidence, valor_json)
  values
    (v_pac_id, v_evol_id, now(), 'fc',       112,  'bpm',    'manual', 1.0, jsonb_build_object('param','fc_max')),
    (v_pac_id, v_evol_id, now(), 'fc',       78,   'bpm',    'manual', 1.0, jsonb_build_object('param','fc_min')),
    (v_pac_id, v_evol_id, now(), 'pa_sys',   135,  'mmHg',   'manual', 1.0, jsonb_build_object('param','pa_sys_max')),
    (v_pac_id, v_evol_id, now(), 'pam_min',  62,   'mmHg',   'manual', 1.0, jsonb_build_object('param','pam_min')),
    (v_pac_id, v_evol_id, now(), 'spo2',     91,   '%',      'manual', 1.0, jsonb_build_object('param','spo2_min')),
    (v_pac_id, v_evol_id, now(), 'fr',       28,   'ipm',    'manual', 1.0, jsonb_build_object('param','fr_max')),
    (v_pac_id, v_evol_id, now(), 'temp',     38.2, 'C',      'manual', 1.0, jsonb_build_object('param','tax_max')),
    (v_pac_id, v_evol_id, now(), 'glicemia', 148,  'mg/dL',  'manual', 1.0, jsonb_build_object('param','dextro')),
    (v_pac_id, v_evol_id, now(), 'lactato',  2.1,  'mmol/L', 'manual', 1.0, jsonb_build_object('param','lactato')),
    (v_pac_id, v_evol_id, now(), 'cr',       1.8,  'mg/dL',  'manual', 1.0, jsonb_build_object('param','cr')),
    (v_pac_id, v_evol_id, now(), 'k',        4.2,  'mEq/L',  'manual', 1.0, jsonb_build_object('param','k'));
  */

  -- ===================================================================
  -- 4) ANTIBIÓTICOS EM CURSO   (aba "Uso" -> tabela atbs)  — OPCIONAL
  --    via: EV|VO|IM|SC|SNE|SNG|IT|Tópico   intencao: empirica|dirigida|profilatica
  -- ===================================================================
  /*
  insert into public.atbs
      (paciente_id, droga, dose, via, frequencia, data_inicio, intencao, foco, agente_alvo)
  values
    (v_pac_id, '<<droga>>', null, 'EV', null, current_date, 'empirica', null, null);
  */

  -- ===================================================================
  -- 5) CULTURAS + ANTIBIOGRAMA   (microbiologia)  — OPCIONAL
  --    material: hemocultura|urocultura|aspirado_traqueal|lavado_bal|lcr|
  --              secrecao_ferida|liquido_peritoneal|liquido_pleural|outro
  --    resultado do antibiograma: 'S' sensível | 'I' intermediário | 'R' resistente
  -- ===================================================================
  /*
  insert into public.culturas
      (paciente_id, material, coleta_ts, crescimento, agente, observacoes)
  values
      (v_pac_id, 'hemocultura', now(), false, null, null);

  insert into public.antibiograma (cultura_id, antibiotico, resultado, cim)
  select id, '<<antibiótico>>', 'S', null
  from public.culturas
  where paciente_id = v_pac_id
  order by created_at desc
  limit 1;
  */

  -- ===================================================================
  -- 6) PENDÊNCIAS DO PACIENTE   (tarefas -> tabela pendencias)  — OPCIONAL
  --    prioridade: 1 (alta) .. 3 (baixa)
  -- ===================================================================
  /*
  insert into public.pendencias (paciente_id, evolucao_id, tarefa, prioridade)
  values
    (v_pac_id, v_evol_id, '<<tarefa>>', 2);
  */

  raise notice 'OK — paciente % criado, evolucao %', v_pac_id, v_evol_id;
end $$;

-- =====================================================================
-- ANEXO A — CÓDIGOS ACEITOS EM eventos_clinicos.tipo
-- (use exatamente estes; o banco recusa qualquer outro)
--   Vitais:   pa_sys  pa_dia  pam  pam_min  fc  fr  spo2  temp  pf_ratio
--   Metabol.: glicemia  lactato  ph  pco2  po2  hco3  be
--   Renais:   cr  ur  na  k  mg  ca  p  diurese_h  bh_h  bh_acumulado
--   Hemato:   hb  ht  plaq  leuco  inr
--   Infecto:  pcr  procalcitonina
--   Fígado:   bb
--   Drogas:   nor_dose  adr_dose  vaso_dose  dobuta_dose  dopa_dose
--             fent_dose  midaz_dose  propofol_dose  precedex_dose
--   Neuro:    gcs  rass  cam_icu  bps  cpot
--   SOFA:     sofa_total  sofa_resp  sofa_coag  sofa_liver  sofa_cardio
--             sofa_neuro  sofa_renal
--   Livre:    custom   (descreva em source_text / valor_json)
--
-- ANEXO B — EXEMPLO PREENCHIDO (dado FICTÍCIO, só para ilustrar o formato)
--   dispositivos (coluna):
--     jsonb_build_object('iot',true,'cvc',true,'sne',true,'detalhe','TOT 8.0 21cm; CVC JID 3/dez')
--   patient_summary.medicamentos_domiciliares:
--     '["Losartana 50mg","Metformina 850mg","AAS 100mg"]'::jsonb
--   patient_summary.dispositivos (lista estruturada):
--     '[{"tipo":"CVC","local":"jugular D","data_insercao":"2026-07-20"}]'::jsonb
--   patient_summary.interconsultas:
--     '[{"especialidade":"Nefrologia","data":"2026-07-24","status":"pendente","notas":"avaliar TRRC"}]'::jsonb
--   patient_summary.resumo_sistemas:
--     '[{"id":"hemo_cv","label":"Hemo/CV","emoji":"🫀","texto":"Choque em regressão, Nora 0,1"}]'::jsonb
--   evolucoes.dvas:
--     '[{"droga":"Noradrenalina","dose":"0.25","unidade":"mcg/kg/min"}]'::jsonb
--   evolucoes.sedativos:
--     '[{"droga":"Fentanil","dose":"50","unidade":"mcg/h"},{"droga":"Midazolam","dose":"5","unidade":"mg/h"}]'::jsonb
--   evolucoes.impressao:
--     array['1. Choque septico foco pulmonar (down)','2. IRA KDIGO 2 (igual)']
--   evolucoes.conduta:
--     array['1. Noradrenalina titulada p/ PAM>=65','2. Balanco hidrico neutro, reavaliar 6/6h']
--   evolucoes.problemas_ativos:
--     '[{"texto":"Choque septico","sistema":"hemo","gravidade":"grave"}]'::jsonb
--   evolucoes.condutas_sistemas:
--     '[{"sistema":"hemo","texto":"Nora titulada","meta":"PAM>=65","prazo":"continuo"}]'::jsonb
-- =====================================================================
