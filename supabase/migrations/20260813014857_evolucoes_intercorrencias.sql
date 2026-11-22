-- APLICADA no banco vivo (mesmo carimbo do banco). Não editar nem reaplicar.
-- Texto recuperado do próprio banco (supabase_migrations.schema_migrations) em 22-nov-2026.

-- Da casa no banco a secao "Intercorrencias 24h" do TEMPLATE-BASE v2 da evolucao.
-- Ate aqui a secao so existia na prosa da skill sasi-ingest-export: campo digitado
-- no Fechamento entrava no texto copiado e se perdia ao fechar o app.
-- Aprovada pelo operador em 12-ago-2026 (desenho das 3 telas, docs/ARQUITETURA.md).
-- text[] segue o modelo de impressao/conduta: um item por intercorrencia, so o
-- delta do periodo, verbo de acao — nunca descricao de estado estavel.
alter table public.evolucoes
    add column if not exists intercorrencias text[] not null default '{}';

comment on column public.evolucoes.intercorrencias is
    'Intercorrencias 24h da nota: so o que MUDOU no periodo, verbos de acao, um item por linha. Secao do TEMPLATE-BASE v2; eixo TEMPO (nao repetir exame fisico nem impressao).';
