-- ============================================================================
-- SASI v3 — evento_tipo_ref: acentos nos rotulos + unidades seguras/corretas
-- ----------------------------------------------------------------------------
-- Correcao de VOCABULARIO (revisao de design 30-jul). A dimensao evento_tipo_ref
-- governa como cada evento aparece na tela (folhao de labs, tabela de sinais).
-- Dois ajustes, ambos de APRESENTACAO — nenhum valor clinico muda:
--
--  1. ACENTOS pt-BR nos rotulos ("Sodio" -> "Sódio", "Frequencia cardiaca" ->
--     "Frequência cardíaca"). O texto vinha sem acento; agora fica correto.
--
--  2. UNIDADES:
--     - leuco/plaq: "x10^3/uL" -> "×10³/mm³". Forma correta (× e superscript) e,
--       sobretudo, SEGURA: mm³ = µL exatamente (1 mm³ = 1 µL), entao o VALOR nao
--       muda, e evita-se o simbolo "µ" — que sob uppercase vira "M" e ja causou
--       leitura de dose 1000× errada no War Room (ver lib/formatters/br.ts).
--     - temp: "C" -> "°C" (a unidade estava sem o grau).
--
-- Junta-se por FK (codigo); o rotulo/unidade e display-only — nenhuma consulta
-- casa por este texto, entao a troca e segura.
-- ============================================================================
begin;

-- 1. rotulos com acento (por codigo; so as linhas que mudam) -----------------
update evento_tipo_ref
set rotulo = 'pCO₂'
where codigo = 'pco2';
update evento_tipo_ref
set rotulo = 'Relação PaO₂/FiO₂'
where codigo = 'pf_ratio';
update evento_tipo_ref
set rotulo = 'pO₂'
where codigo = 'po2';
update evento_tipo_ref
set rotulo = 'Hematócrito'
where codigo = 'ht';
update evento_tipo_ref
set rotulo = 'Leucócitos'
where codigo = 'leuco';
update evento_tipo_ref
set rotulo = 'Proteína C reativa'
where codigo = 'pcr';
update evento_tipo_ref
set rotulo = 'Balanço hídrico acumulado'
where codigo = 'bh_acumulado';
update evento_tipo_ref
set rotulo = 'Balanço hídrico horário'
where codigo = 'bh_h';
update evento_tipo_ref
set rotulo = 'Cálcio'
where codigo = 'ca';
update evento_tipo_ref
set rotulo = 'Diurese horária'
where codigo = 'diurese_h';
update evento_tipo_ref
set rotulo = 'Potássio'
where codigo = 'k';
update evento_tipo_ref
set rotulo = 'Magnésio'
where codigo = 'mg';
update evento_tipo_ref
set rotulo = 'Sódio'
where codigo = 'na';
update evento_tipo_ref
set rotulo = 'Fósforo'
where codigo = 'p';
update evento_tipo_ref
set rotulo = 'SOFA coagulação'
where codigo = 'sofa_coag';
update evento_tipo_ref
set rotulo = 'SOFA hepático'
where codigo = 'sofa_liver';
update evento_tipo_ref
set rotulo = 'SOFA neurológico'
where codigo = 'sofa_neuro';
update evento_tipo_ref
set rotulo = 'SOFA respiratório'
where codigo = 'sofa_resp';
update evento_tipo_ref
set rotulo = 'Frequência cardíaca'
where codigo = 'fc';
update evento_tipo_ref
set rotulo = 'Frequência respiratória'
where codigo = 'fr';
update evento_tipo_ref
set rotulo = 'PA diastólica'
where codigo = 'pa_dia';
update evento_tipo_ref
set rotulo = 'PA sistólica'
where codigo = 'pa_sys';
update evento_tipo_ref
set rotulo = 'PA média'
where codigo = 'pam';
update evento_tipo_ref
set rotulo = 'PA média (mínima)'
where codigo = 'pam_min';
update evento_tipo_ref
set rotulo = 'Saturação O₂'
where codigo = 'spo2';

-- 2. unidades corretas/seguras -----------------------------------------------
update evento_tipo_ref
set unidade_padrao = '×10³/mm³'
where codigo in ('leuco', 'plaq');
update evento_tipo_ref
set unidade_padrao = '°C'
where codigo = 'temp';

commit;
