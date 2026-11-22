-- Limpeza pedida pelo operador em 22-nov-2026.
-- DESTRUTIVO 1: apaga as 48 janelas de sinais vitais de 27-set-2026 (contadas com limiares antigos).
delete from public.janelas_24h where janela_fim::date between date '2026-09-01' and date '2026-09-30';
-- DESTRUTIVO 2: apaga os 27 exames antigos (jul a set de 2026) marcados para revisao, que nao serao revisados.
delete from public.eventos_clinicos where (requires_review or coalesce(confidence, 1) < 0.7) and ts < timestamptz '2026-10-01';
-- DESTRUTIVO 3: apaga a copia de seguranca da troca de termos de 22-nov-2026 (esquema arquivo). A troca nao se desfaz mais.
drop schema arquivo cascade;
