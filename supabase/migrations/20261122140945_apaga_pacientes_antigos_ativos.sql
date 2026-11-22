-- Apaga os 7 pacientes antigos que ocupavam leito na UTI 2 (admitidos de junho a setembro de 2026), por ordem do operador em 22-nov-2026.
-- DESTRUTIVO: junto saem as internacoes, evolucoes, exames, antimicrobianos, culturas, dispositivos, pendencias e alertas deles.
-- Os 14 pacientes com alta ficam.
delete from public.pacientes where status_leito = 'ativo' and data_adm < date '2026-10-01';
