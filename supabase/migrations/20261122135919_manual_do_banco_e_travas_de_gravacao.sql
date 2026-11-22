-- Manual de gravacao dentro do banco + travas para quem grava sem conhecer as regras (22-nov-2026).
-- Motivo: outros Claudes (claude.ai com o conector Supabase, servidor MCP antigo) gravavam com nomes e formatos antigos.
-- Nada aqui apaga dado. O app (papel anon) continua gravando como antes.

-- 1. Paciente ativo: leito so no padrao UTI#-L## e so em leito vago (antes "L06" ou "7" entravam sem aviso)
create function public.fn_trg_valida_leito() returns trigger
language plpgsql security definer set search_path to 'public', 'pg_catalog' as $fn$
declare v_checa boolean;
begin
  if new.status_leito = 'ativo' then
    if tg_op = 'INSERT' then
      v_checa := true;
    else
      v_checa := new.leito is distinct from old.leito or new.uti is distinct from old.uti or old.status_leito is distinct from new.status_leito;
    end if;
    if v_checa then
      begin
        perform public.fn_valida_leito(new.leito, new.uti);
      exception when others then
        raise exception '%. Escreva o leito como UTI#-L## (ex.: UTI2-L05). Antes de gravar, leia o manual: select corpo from public.avisos_agentes where titulo like ''MANUAL DO BANCO%%'';', sqlerrm using errcode = '22023';
      end;
      if exists (select 1 from public.pacientes p where p.uti = new.uti and p.leito = new.leito and p.status_leito = 'ativo' and p.id <> new.id) then
        raise exception 'Leito % já tem paciente ativo. Não admita por cima e não reaproveite a linha dele: primeiro a alta do paciente anterior (função dar_alta_paciente), com o desfecho e a data ditos pelo operador. Manual: select corpo from public.avisos_agentes where titulo like ''MANUAL DO BANCO%%'';', new.leito using errcode = '23505';
      end if;
    end if;
  end if;
  return new;
end $fn$;
create trigger trg_05_valida_leito before insert or update on public.pacientes
  for each row execute function public.fn_trg_valida_leito();

-- 2. Evolucao gravada por fora do app: so campos e opcoes que a ficha conhece (o resto ficava invisivel na tela)
create function public.fn_ficha_contrato(p_quadro text, p jsonb) returns void
language plpgsql set search_path to 'public', 'pg_catalog' as $fn$
declare
  -- contrato da ficha do app (src/app/evolucao/Ficha.tsx, conferido em 22-nov-2026): campo -> opcoes aceitas (null = valor livre)
  c constant jsonb := '{
"neuro":{"meta_rass":null,"rass":null,"glasgow":null,"escala":["FOUR","NIHSS"],"escala_valor":null,"analgesia":["Adequada","Inadequada"],"cam_icu":["Positivo","Negativo","Não aplicável"],"pupilas":["Isocóricas e fotorreagentes","Alteradas"],"pupilas_anisocoria":["D > E","E > D"],"pupilas_achados":null,"deficit_focal":["Ausente","Presente","Não avaliável"],"deficit_focal_qual":null,"notas":null},
"resp":{"suporte":["Ar ambiente","Cateter O2","Máscara","CNAF","VNI","VM"],"via":["IOT","TQT"],"modo":["VCV","PCV","PRVC","PSV"],"peep":null,"fio2":null,"pinsp":null,"ps":null,"vc":null,"vc_obtido":null,"fluxo_l_min":null,"mascara_tipo":["Venturi","Reservatório","Macronebulização"],"macro_por":["Face","TQT"],"ipap":null,"epap":null,"vni_uso":["Intermitente","Contínuo"],"pao2":null,"fr_max":null,"fr_min":null,"spo2_max":null,"spo2_min":null,"ausculta":["MV presente, sem ruídos","Alterada"],"ausculta_achados":null,"notas":null},
"hemo":{"pas_max":null,"pas_min":null,"pad_max":null,"pad_min":null,"pam_max":null,"pam_min":null,"fc_max":null,"fc_min":null,"ritmo":["Sinusal","FA","Outro"],"ritmo_qual":null,"tec_s":null,"extremidades":["Quentes","Frias"],"pulsos":["Cheios","Finos","Ausentes"],"ausculta":["BNF 2T sem sopros","Alterada"],"ausculta_achados":null,"edema":["0","1+","2+","3+","4+"],"edema_onde":null,"notas":null},
"tgi":{"dieta":["Zero","Oral","Enteral"],"parenteral":null,"dieta_via":["SNE","SNG","GTT"],"dieta_vazao_ml_h":null,"dx_max":null,"dx_min":null,"evacuacoes":["Sim","Não"],"evacuacao_ultima":null,"abdome":["Flácido, RHA +","Alterado"],"abdome_achados":null,"rha":["Diminuídos","Ausentes","Aumentados"],"notas":null},
"renal":{"diurese_via":["Espontânea","SVD"],"diurese_ml":null,"diurese_h":null,"bh_24h_ml":null,"trs":["Não","Intermitente","Contínua"],"uf_ml_h":null,"uf_ml":null,"trs_ultima_sessao":null,"notas":null},
"hemato":{"profilaxia_tvp":["Sem profilaxia, contraindicada","Sem profilaxia, não indicada","Mecânica","Enoxaparina 40 mg SC 1x/dia","Heparina 5.000 UI SC 8/8 h"],"profilaxia_lamg":["Sem profilaxia, não indicada","Pantoprazol 40 mg EV 1x/dia"],"notas":null},
"infecto":{"temp_max":null,"temp_min":null,"seg":null,"bast":null,"foco":["Pulmonar","Urinário","Abdominal","Corrente sanguínea","Pele e partes moles","SNC","Indefinido","Outro"],"notas":null}
}'::jsonb;
  q jsonb := c -> p_quadro;
  v_manual constant text := 'Manual: select corpo from public.avisos_agentes where titulo like ''MANUAL DO BANCO%'';';
  v_fora text;
  r record;
begin
  if q is null or p is null or p = '{}'::jsonb then
    return;
  end if;
  if jsonb_typeof(p) <> 'object' then
    raise exception 'Evolução, quadro "%": o valor tem que ser um objeto JSON. %', p_quadro, v_manual using errcode = '22023';
  end if;
  select string_agg(k, ', ' order by k) into v_fora from jsonb_object_keys(p) k where not (q ? k);
  if v_fora is not null then
    raise exception 'Evolução, quadro "%": campo que não existe na ficha do app: %. Campos aceitos: %. Achado sem campo próprio vai como texto em "notas". %',
      p_quadro, v_fora, (select string_agg(k, ', ') from jsonb_object_keys(q) k), v_manual using errcode = '22023';
  end if;
  for r in select key, value from jsonb_each(p) loop
    if jsonb_typeof(q -> r.key) = 'array' and jsonb_typeof(r.value) <> 'null'
       and (jsonb_typeof(r.value) <> 'string' or not ((q -> r.key) ? (r.value #>> '{}'))) then
      raise exception 'Evolução, quadro "%", campo "%": valor % não é opção da ficha. Opções aceitas (texto exato): %. Outro achado vai em "notas". %',
        p_quadro, r.key, r.value::text, (select string_agg(o, ' | ') from jsonb_array_elements_text(q -> r.key) o), v_manual using errcode = '22023';
    end if;
  end loop;
end $fn$;

create function public.fn_trg_ficha_contrato() returns trigger
language plpgsql set search_path to 'public', 'pg_catalog' as $fn$
declare
  v_manual constant text := 'Manual: select corpo from public.avisos_agentes where titulo like ''MANUAL DO BANCO%'';';
  v_listas boolean;
  v_txt text;
begin
  -- o app (papel anon) tem o contrato no proprio codigo, conferido pelo teste automatico: nao passa por aqui
  if current_user = 'anon' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    perform public.fn_ficha_contrato('neuro', new.neuro);
    perform public.fn_ficha_contrato('resp', new.resp);
    perform public.fn_ficha_contrato('hemo', new.hemo);
    perform public.fn_ficha_contrato('tgi', new.tgi);
    perform public.fn_ficha_contrato('renal', new.renal);
    perform public.fn_ficha_contrato('hemato', new.hemato);
    perform public.fn_ficha_contrato('infecto', new.infecto);
    v_listas := true;
  else
    if new.neuro is distinct from old.neuro then perform public.fn_ficha_contrato('neuro', new.neuro); end if;
    if new.resp is distinct from old.resp then perform public.fn_ficha_contrato('resp', new.resp); end if;
    if new.hemo is distinct from old.hemo then perform public.fn_ficha_contrato('hemo', new.hemo); end if;
    if new.tgi is distinct from old.tgi then perform public.fn_ficha_contrato('tgi', new.tgi); end if;
    if new.renal is distinct from old.renal then perform public.fn_ficha_contrato('renal', new.renal); end if;
    if new.hemato is distinct from old.hemato then perform public.fn_ficha_contrato('hemato', new.hemato); end if;
    if new.infecto is distinct from old.infecto then perform public.fn_ficha_contrato('infecto', new.infecto); end if;
    v_listas := new.dvas is distinct from old.dvas or new.sedativos is distinct from old.sedativos or new.condutas_sistemas is distinct from old.condutas_sistemas;
  end if;
  if v_listas then
    select string_agg(distinct k, ', ') into v_txt
      from jsonb_array_elements(
             case when jsonb_typeof(new.dvas) = 'array' then new.dvas else '[]'::jsonb end
             || case when jsonb_typeof(new.sedativos) = 'array' then new.sedativos else '[]'::jsonb end) e,
           lateral jsonb_object_keys(case when jsonb_typeof(e) = 'object' then e else '{}'::jsonb end) k
     where k not in ('droga', 'diluicao', 'vazao_ml_h', 'dose', 'unidade');
    if v_txt is not null then
      raise exception 'Evolução, dvas/sedativos: campo que não existe na ficha do app: %. Cada infusão aceita só: droga, diluicao (texto, ex.: "128 mcg/mL"), vazao_ml_h, dose, unidade. %', v_txt, v_manual using errcode = '22023';
    end if;
    select string_agg(distinct coalesce(e ->> 'sistema', '(sem sistema)'), ', ') into v_txt
      from jsonb_array_elements(case when jsonb_typeof(new.condutas_sistemas) = 'array' then new.condutas_sistemas else '[]'::jsonb end) e
     where coalesce(e ->> 'sistema', '') not in ('Neuro', 'Resp', 'Cardio-hemodinâmica', 'TGI', 'Renal', 'Hemato', 'Infecto');
    if v_txt is not null then
      raise exception 'Evolução, condutas_sistemas: sistema que não existe na ficha do app: %. Aceitos: Neuro, Resp, Cardio-hemodinâmica, TGI, Renal, Hemato, Infecto. %', v_txt, v_manual using errcode = '22023';
    end if;
  end if;
  return new;
end $fn$;
create trigger trg_05_ficha_contrato before insert or update on public.evolucoes
  for each row execute function public.fn_trg_ficha_contrato();

-- 3. Janela de sinais vitais: so os limiares do design (a pilula do app sai daqui)
create function public.fn_trg_janela_limiares() returns trigger
language plpgsql set search_path to 'public', 'pg_catalog' as $fn$
declare
  v_baixo numeric;
  v_alto numeric;
  v_regra constant text := 'Limiares fixos do design: PAS < 90 ou > 180; PAD < 45 ou > 120; PAM < 65 ou > 130; FC > 100; FR > 25; SpO2 < 88; temperatura > 38; Dx > 180. Reconte as medidas da folha com esses limiares (nenhuma fora = 0). Manual: select corpo from public.avisos_agentes where titulo like ''MANUAL DO BANCO%'';';
begin
  select t.baixo, t.alto into v_baixo, v_alto
    from (values ('pas', 90, 180), ('pad', 45, 120), ('pam', 65, 130), ('fc', null, 100),
                 ('fr', null, 25), ('spo2', 88, null), ('temp', null, 38), ('dx', null, 180)) as t(tipo, baixo, alto)
   where t.tipo = new.tipo;
  if not found then
    return new;
  end if;
  if v_baixo is not null and (new.limiar_baixo is distinct from v_baixo or new.n_fora_baixo is null) then
    raise exception 'Janela de "%": limiar_baixo tem que ser % e n_fora_baixo tem que vir preenchido (veio limiar %, contagem %). %',
      new.tipo, v_baixo, coalesce(new.limiar_baixo::text, 'vazio'), coalesce(new.n_fora_baixo::text, 'vazia'), v_regra using errcode = '22023';
  end if;
  if v_alto is not null and (new.limiar_alto is distinct from v_alto or new.n_fora_alto is null) then
    raise exception 'Janela de "%": limiar_alto tem que ser % e n_fora_alto tem que vir preenchido (veio limiar %, contagem %). %',
      new.tipo, v_alto, coalesce(new.limiar_alto::text, 'vazio'), coalesce(new.n_fora_alto::text, 'vazia'), v_regra using errcode = '22023';
  end if;
  return new;
end $fn$;
create trigger trg_05_janela_limiares before insert or update on public.janelas_24h
  for each row execute function public.fn_trg_janela_limiares();

-- 4. O manual, na tabela que os agentes ja leem antes de trabalhar
insert into public.avisos_agentes (titulo, corpo, resolvido)
select 'MANUAL DO BANCO: leia antes de gravar', $manual$Manual de gravação do banco SASI (UTI do Dr. Nicolas). Vale para qualquer Claude ou ferramenta, com ou sem skill. Atualizado em 22-nov-2026.
Se a sua skill ou instrução disser outra coisa (nomes antigos, limiares antigos, ferramenta sasi_deploy_ingest indisponível), vale este manual.
O app do plantão (https://sasi-uti.vercel.app) lê direto destas tabelas: o que for gravado fora do formato não aparece na tela.

REGRAS
1. Pacientes reais. Zero invenção: sem fonte legível (documento ou fala do operador), o campo fica de fora. Nunca valor "razoável".
2. Só grave quando o operador mandar ("deploy", "salvar no Supabase", "admite"). Antes disso, só leitura.
3. Não apague linha e não mude estrutura (tabela, coluna, função, gatilho, política) sem ordem expressa dele.
4. Não preencha internacao_id, user_id, pacientes.dispositivos, pacientes.severidade_visual nem pacientes.out_of_range_count: o banco calcula.
5. Horário é o da medida ou da coleta, com fuso de Brasília (ex.: 2026-11-22T06:00:00-03:00). Nunca now() no lugar de horário que a fonte não traz.
6. Erro do banco com texto em português é instrução: corrija o dado e grave de novo. Não contorne a trava.
7. No fim, leia de volta o que gravou (select) e diga ao operador o que entrou.

PACIENTE
- Leito sempre como UTI#-L## (UTI2-L05). UTI2 tem 13 leitos, UTI3 tem 13, UTI4 tem 8. Um paciente ativo por leito.
- Achar: select id, leito, status_leito from public.pacientes where leito = 'UTI2-L05' and status_leito = 'ativo';
- Admitir em leito vago: select public.admitir_paciente(p_nome => 'Nome', p_leito => 'UTI2-L05', p_uti => 'UTI2', p_int_uti_data => '2026-11-22', p_idade => 67, p_hd => 'texto', p_gravidade => 'instavel', p_isolation => 'none', p_peso => 80, p_altura => 170, p_alergias => 'texto');
  Devolve o id do paciente e abre a internação. Só p_nome, p_leito e p_uti são obrigatórios; o que a fonte não traz fica de fora. p_int_uti_data é o dia da entrada na UTI.
  Sexo vai depois: update public.pacientes set sexo = 'masculino' where id = '<id>';   (masculino | feminino)
  gravidade: estavel | watcher | instavel | critico.   isolation: none | contact (contato) | droplet (gotícula) | aerosol (aerossol).
- Leito ocupado: o banco recusa. Não admita por cima nem reaproveite a linha do paciente anterior. A alta dele vem antes, com desfecho e data ditos pelo operador.
- Alta: select public.dar_alta_paciente(p_paciente_id => '<id>', p_desfecho => 'alta_uti', p_desfecho_data => '2026-11-22', p_destino_setor => 'texto', p_observacoes => 'texto');
  desfecho: alta_uti | alta_hospitalar | obito | transferencia. A data é a real; nunca deixe o banco escolher.
- Troca de leito: select public.transferir_leito(p_paciente_id => '<id>', p_leito => 'UTI2-L07', p_uti => 'UTI2');
- Outros dados do cadastro (hd, alergias, peso, altura, idade, gravidade, isolation): update em public.pacientes.

EVOLUÇÃO (public.evolucoes): é a ficha do app
- Uma linha por paciente + data_plantao + turno. Antes de incluir, procure: select id from public.evolucoes where paciente_id = '<id>' and data_plantao = '2026-11-22' and turno = 'noturna';   Achou: update nessa linha. Não achou: insert.
- data_plantao é o dia em que o plantão começou (o noturno que entra pela madrugada continua no dia anterior). turno: diurna | noturna. No turno noturno mande também plantao = 'noite'. tipo_nota: admissao | seriada | alta | andar.
- Um JSON por quadro, nas colunas neuro, resp, hemo (quadro Cardio-hemodinâmica), tgi, renal, hemato, infecto. Só os campos abaixo. Campo sem valor fica de fora (nada de "" nem null). Escolha é o texto exato da opção. Achado sem campo ou sem opção exata vai como texto em "notas" do quadro. Sinal vital em máximo e mínimo.
  neuro: meta_rass, rass (de -5 a +4), glasgow (texto), escala (FOUR | NIHSS) com escala_valor, analgesia (Adequada | Inadequada), cam_icu (Positivo | Negativo | Não aplicável), pupilas (Isocóricas e fotorreagentes | Alteradas), pupilas_anisocoria (D > E | E > D), pupilas_achados (lista: Não fotorreagentes, Mióticas, Midriáticas), deficit_focal (Ausente | Presente | Não avaliável), deficit_focal_qual, notas
  resp: suporte (Ar ambiente | Cateter O2 | Máscara | CNAF | VNI | VM), via (IOT | TQT), modo (VCV | PCV | PRVC | PSV), peep, fio2 (em %: 35, e não 0,35), pinsp, ps, vc, vc_obtido, fluxo_l_min, mascara_tipo (Venturi | Reservatório | Macronebulização), macro_por (Face | TQT), ipap, epap, vni_uso (Intermitente | Contínuo), pao2, fr_max, fr_min, spo2_max, spo2_min, ausculta (MV presente, sem ruídos | Alterada), ausculta_achados (objeto {"achado": ["local"]}; achados: MV reduzido, MV abolido, Crepitações, Roncos, Sibilos; locais: Base D, Base E, À direita, À esquerda, Difuso), notas
  hemo: pas_max, pas_min, pad_max, pad_min, pam_max, pam_min, fc_max, fc_min, ritmo (Sinusal | FA | Outro), ritmo_qual, tec_s, extremidades (Quentes | Frias), pulsos (Cheios | Finos | Ausentes), ausculta (BNF 2T sem sopros | Alterada), ausculta_achados (lista: Bulhas hipofonéticas, Sopro sistólico, Sopro diastólico, B3, Atrito pericárdico), edema (0 | 1+ | 2+ | 3+ | 4+, como texto), edema_onde (lista: MMII, MMSS, Generalizado), notas
  tgi: dieta (Zero | Oral | Enteral), parenteral (true), dieta_via (SNE | SNG | GTT), dieta_vazao_ml_h, dx_max, dx_min, evacuacoes (Sim | Não), evacuacao_ultima (dd/mm), abdome (Flácido, RHA + | Alterado), abdome_achados (lista: Distendido, Tenso, Doloroso, Sinais de peritonite), rha (Diminuídos | Ausentes | Aumentados), notas
  renal: diurese_via (Espontânea | SVD), diurese_ml, diurese_h, bh_24h_ml, trs (Não | Intermitente | Contínua), uf_ml_h, uf_ml, trs_ultima_sessao (dd/mm), notas
  hemato: profilaxia_tvp (Sem profilaxia, contraindicada | Sem profilaxia, não indicada | Mecânica | Enoxaparina 40 mg SC 1x/dia | Heparina 5.000 UI SC 8/8 h), profilaxia_lamg (Sem profilaxia, não indicada | Pantoprazol 40 mg EV 1x/dia), notas
  infecto: temp_max, temp_min, seg, bast, foco (Pulmonar | Urinário | Abdominal | Corrente sanguínea | Pele e partes moles | SNC | Indefinido | Outro), notas
- Exame de laboratório (Hb, Ht, leucócitos, plaquetas, ureia, creatinina, eletrólitos, gasometria) não entra nos quadros: vai em eventos_clinicos. Antimicrobiano e cultura também não: vão em atbs e culturas.
- dvas e sedativos: listas JSON de {"droga", "diluicao" (texto, ex.: "128 mcg/mL"), "vazao_ml_h", "dose", "unidade"}. Sem diluição na fonte: só droga, dose e unidade.
- impressao, conduta e intercorrencias: listas de texto (array['texto 1', 'texto 2']). condutas_sistemas: JSON [{"sistema": "Cardio-hemodinâmica", "texto": "texto"}], com sistema = Neuro | Resp | Cardio-hemodinâmica | TGI | Renal | Hemato | Infecto.
- Exemplo: insert into public.evolucoes (paciente_id, data_plantao, turno, plantao, tipo_nota, hemo, tgi, impressao) values ('<id>', '2026-11-22', 'noturna', 'noite', 'seriada', '{"pas_max": 135, "pas_min": 88, "ritmo": "Sinusal", "notas": "texto"}', '{"dx_max": 190, "dx_min": 110}', array['problema 1']) returning id;

EXAMES E MEDIDAS (public.eventos_clinicos): só acrescenta, nunca apaga
- insert into public.eventos_clinicos (paciente_id, ts, tipo, valor_num, unidade, fonte, confidence, source_text) values ('<id>', '2026-11-22T06:00:00-03:00', 'hb', 9.2, 'g/dL', 'claude_ocr', 0.95, 'Hb 9,2');
- tipo é um código de public.evento_tipo_ref: select codigo, rotulo, unidade_padrao from public.evento_tipo_ref where ativo order by ordem;   Valor sem código lá: não grave, avise o operador.
- fonte: claude_ocr (lido de foto ou PDF) | manual (ditado pelo operador). confidence de 0 a 1. Leitura duvidosa: requires_review = true.
- Leucócitos e plaquetas em ×10³/µL (12,5, e não 12500).

SINAIS VITAIS DA FOLHA (public.janelas_24h): de onde sai a pílula vermelha do app
- Uma linha por sinal por janela. tipo: pas | pad | pam | fc | fr | spo2 | temp | dx.
- insert into public.janelas_24h (paciente_id, tipo, janela_inicio, janela_fim, valor_max, valor_min, n_total, n_fora_baixo, limiar_baixo, n_fora_alto, limiar_alto, fonte, confidence, source_text) values ('<id>', 'pam', '2026-11-21T19:00:00-03:00', '2026-11-22T07:00:00-03:00', 95, 58, 12, 3, 65, 0, 130, 'claude_ocr', 0.9, 'texto da folha');
- n_total é o número de medidas que estão na folha (não chute). Conte medida por medida quantas passaram de cada limiar; nenhuma = 0.
- Limiares fixos do design (o banco recusa outro): PAS < 90 ou > 180; PAD < 45 ou > 120; PAM < 65 ou > 130; FC > 100; FR > 25; SpO2 < 88; temperatura > 38; Dx > 180.
- Mesma janela de novo (mesmo paciente, tipo e janela_fim): update na linha que já existe.

ANTIMICROBIANOS (public.atbs): uma linha por curso
- insert into public.atbs (paciente_id, droga, dose, via, frequencia, data_inicio, duracao_planejada_dias, intencao, foco) values ('<id>', 'Meropenem', '1 g', 'EV', '8/8 h', '2026-11-20', 7, 'empirica', 'Pulmonar');
- via: EV | VO | IM | SC | SNE | SNG | IT | Tópico. intencao: empirica | dirigida | profilatica. O app exige data_inicio. Suspenso ou trocado: update com data_fim e motivo_suspensao; o novo é outra linha. Dia de antimicrobiano não se grava: o banco conta.

CULTURAS (public.culturas e public.antibiograma)
- insert into public.culturas (paciente_id, material, coleta_ts) values ('<id>', 'hemocultura', '2026-11-20T10:00:00-03:00') returning id;   Com laudo: laudo_ts, crescimento (true | false), agente.
- material: hemocultura | urocultura | aspirado_traqueal | lavado_bal | lcr | secrecao_ferida | liquido_peritoneal | liquido_pleural | outro.
- Antibiograma, uma linha por antibiótico: insert into public.antibiograma (cultura_id, antibiotico, resultado) values ('<id da cultura>', 'Meropenem', 'S');   (S | I | R)

DISPOSITIVOS (public.dispositivo_episodios): uma linha por período de uso
- insert into public.dispositivo_episodios (paciente_id, tipo, sitio, data_inicio) values ('<id>', 'cvc', 'jugular D', '2026-11-20');
- tipo: iot | traqueo | cvc | picc | arterial (PAI) | svd | sne | sng | dreno | gtt | trr (cateter de diálise) | marca_passo | outro. Retirada: update com data_fim e motivo_fim (eletivo | infeccao | troca | disfuncao | alta | obito | outro).

PENDÊNCIAS (public.pendencias)
- insert into public.pendencias (paciente_id, tarefa, prioridade) values ('<id>', 'texto', 2);   (1 = urgente, 2 = rotina do dia, 3 = pode esperar)
- Feita: update public.pendencias set concluida = true, concluida_at = now() where id = '<id>';

NOMES ANTIGOS
O banco troca sozinho na entrada: pa_sys por pas, pa_dia por pad, glicemia por dx, uf_dialise por uf_trs (em eventos e janelas); na evolução, pa_sys_max/min por pas_max/min, pa_dia_max/min por pad_max/min, tmax e tax_max por temp_max, tax_min por temp_min, obs por notas.
Qualquer outro nome antigo (pam1, pam2, fio2O2, vmFio2, diureseHoras, trrc, plaq1, sedacao) é recusado: use os campos acima.$manual$, false
where not exists (select 1 from public.avisos_agentes where titulo like 'MANUAL DO BANCO%');

comment on table public.avisos_agentes is 'LEIA ANTES DE GRAVAR OU MUDAR QUALQUER COISA NESTE BANCO: select id, titulo, corpo from public.avisos_agentes where resolvido is not true order by id desc. A linha "MANUAL DO BANCO" é o manual de gravação (nunca marcar como resolvida). As demais são avisos operacionais deixados por sessões com acesso ao banco; marcar resolvido = true ao cumprir. Repositório: doutortenente/SASI.';

-- 5. Ponteiro para o manual no comentario das tabelas em que os agentes gravam (aparece em qualquer listagem de tabelas)
do $$
declare t text; v_atual text;
begin
  foreach t in array array['pacientes', 'internacoes', 'evolucoes', 'eventos_clinicos', 'janelas_24h', 'atbs', 'culturas', 'antibiograma', 'dispositivo_episodios', 'pendencias'] loop
    v_atual := coalesce(obj_description(('public.' || t)::regclass), '');
    if v_atual not like 'ANTES DE GRAVAR%' then
      execute format('comment on table public.%I is %L', t,
        rtrim('ANTES DE GRAVAR, LEIA O MANUAL: select corpo from public.avisos_agentes where titulo like ''MANUAL DO BANCO%''; ' || v_atual));
    end if;
  end loop;
end $$;
