# `_gated/` — migrations que NÃO rodam sozinhas

O Supabase (e o `supabase db push`) só aplica os `.sql` que estão **direto** em `supabase/migrations/`.
Subpastas como esta (`_gated/`) e `_archive/` são **ignoradas** de propósito.

Aqui ficam os passos que precisam de decisão humana e ordem — não podem entrar no fluxo automático:

| Arquivo | O que faz | Quando rodar |
|---|---|---|
| `10_adocao_enums.sql` | Converte colunas `text` → `enum` nativo | **Numa branch** do Supabase primeiro; rodar as verificações (`select distinct …`) antes de descomentar cada conversão |
| `20_rls_producao.sql` | Cria as policies por comando (dono) e remove o `dev_bypass` | **Só depois do login real** (Supabase Auth). Ordem: 1) login → 2) carimbar donos → 3) policies → 4) remover `dev_bypass`. Rodar antes disso **trava o app** |

Regra de ouro (PLANO §4): remover a `dev_bypass` antes de ter login de verdade = banco invisível pro app.
Copie o conteúdo no SQL Editor do Supabase, na branch, e rode manualmente.
