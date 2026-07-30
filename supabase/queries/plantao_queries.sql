-- =====================================================================
-- SASI — Queries de plantão (Supabase Postgres)
-- Projeto: idswehsvvqczzkiatuzu (sa-east-1, Postgres 17)
-- Cursor dentro do statement + Execute (Ctrl+Enter).
-- Validadas via EXPLAIN em 24-jun-2026.
-- =====================================================================


-- 1. PAINEL DA UTI — visão geral dos leitos ativos (o "raio-X" do plantão)
select uti, leito, nome, idade, gravidade, severidade_visual,
       dias_internacao, sofa_total, delta_sofa_24h, pendencias_abertas
from vw_dashboard_uti
order by uti, leito;


-- 2. PACIENTES ATIVOS — cadastro + antropometria + dispositivos
select uti, leito, nome, idade, peso, altura, imc, hd,
       gravidade, isolation, dispositivos
from pacientes
where status_leito = 'ativo'
order by uti, leito;


-- 3. PENDÊNCIAS ABERTAS — tarefas por prioridade (1 = mais urgente)
select p.uti, p.leito, p.nome, pe.prioridade, pe.tarefa, pe.created_at
from pendencias pe
join pacientes p on p.id = pe.paciente_id
where pe.concluida = false
order by pe.prioridade, p.uti, p.leito;


-- 4. ANTIBIÓTICO — stewardship (dias de terapia + flag de revisão)
--    stewardship_flag: 'critical' >=14d · 'warning' >=7d · 'ok' <7d
select p.uti, p.leito, p.nome, v.droga, v.foco,
       v.dias_terapia, v.stewardship_flag
from vw_dias_atb_ativo v
join pacientes p on p.id = v.paciente_id
order by v.dias_terapia desc;


-- 5. MICROBIOLOGIA — culturas + antibiograma (S/I/R)
select p.leito, p.nome, c.material, c.coleta_ts, c.crescimento, c.agente,
       a.antibiotico, a.resultado, a.cim
from culturas c
join pacientes p on p.id = c.paciente_id
left join antibiograma a on a.cultura_id = c.id
order by c.coleta_ts desc;


-- ---------------------------------------------------------------------
-- NOTA DE GRANULARIDADE (revisado 24-jun-2026)
-- Plantão ~1x/semana → o dado vem em rajada e fica dias parado.
-- Janela de "24/48/72h" ancorada em now() sempre parece "stale" e é
-- inútil. A unidade de tempo correta aqui é o PLANTÃO (ts::date), não a
-- hora. Hoje há 1 plantão de dado (2026-06-20); quando houver vários, as
-- queries por-plantão abaixo viram comparação automaticamente.
-- ---------------------------------------------------------------------


-- 6. SNAPSHOT DO ÚLTIMO PLANTÃO — todos os parâmetros por leito
--    (substitui a SOFA-trend morta: tipo 'sofa_total' NUNCA foi ingerido
--     e evolucoes.sofa_total está 100% vazia — sem fonte, sem query)
select p.leito, p.nome, e.tipo, e.valor_num, e.unidade, e.ts
from eventos_clinicos e
join pacientes p on p.id = e.paciente_id
where e.ts::date = (select max(ts)::date from eventos_clinicos)
order by p.leito, e.tipo;


-- 7. BALANÇO HÍDRICO por plantão — soma do dia (não janela de horas)
--    (a view vw_bh_acumulado usa now()-72h e zera com dado de 4 dias)
select p.leito, p.nome, e.ts::date as plantao,
       round(sum(e.valor_num), 0) as bh_ml, count(*) as medidas
from eventos_clinicos e
join pacientes p on p.id = e.paciente_id
where e.tipo = 'bh_h'
group by p.leito, p.nome, e.ts::date
order by plantao desc, p.leito;


-- 8. ALERTAS ABERTOS — ⚠️ vazia até o hook useClinicalAlerts gravar em
--    alerts_log (0 linhas hoje). SQL correto, falta o pipeline gravar.
select * from vw_alertas_abertos
order by criticos desc, warnings desc;


-- 9. ÚLTIMO VALOR de cada vital por paciente
--    (tipos corrigidos: 'pam' -> 'pam_min'; 'fr'/'spo2' nunca ingeridos)
select distinct on (e.paciente_id, e.tipo)
       p.leito, p.nome, e.tipo, e.valor_num, e.unidade, e.ts
from eventos_clinicos e
join pacientes p on p.id = e.paciente_id
where e.tipo in ('pam_min','fc','temp','lactato','gcs','glicemia')
order by e.paciente_id, e.tipo, e.ts desc;


-- 10. QUALIDADE DO DADO — eventos a revisar ou de baixa confiança
--     (source_text = o texto-fonte do OCR, p/ conferir o valor extraído)
select p.leito, p.nome, e.tipo, e.valor_num, e.unidade,
       e.confidence, e.requires_review, e.source_text, e.ts
from eventos_clinicos e
join pacientes p on p.id = e.paciente_id
where e.requires_review = true or e.confidence < 0.7
order by e.confidence nulls last, e.ts desc;


-- 11b. SÍNTESE SASI v2 — colunas JSONB na evolução mais recente
select p.uti, p.leito, p.nome,
       jsonb_array_length(coalesce(e.problemas_ativos, '[]'::jsonb)) as n_problemas,
       jsonb_array_length(coalesce(e.condutas_sistemas, '[]'::jsonb)) as n_condutas,
       jsonb_array_length(coalesce(e.riscos, '[]'::jsonb)) as n_riscos,
       e.updated_at
from evolucoes e
join pacientes p on p.id = e.paciente_id
where p.status_leito = 'ativo'
order by e.updated_at desc;


-- 11. FRESCOR — quando foi o último plantão e quanto dado trouxe
--     (responde "meus dados são de quando?" — fonte é 100% claude_ocr)
select e.ts::date as plantao,
       count(*) as eventos,
       count(distinct e.paciente_id) as pacientes,
       (current_date - e.ts::date) as dias_atras
from eventos_clinicos e
group by e.ts::date
order by plantao desc;
