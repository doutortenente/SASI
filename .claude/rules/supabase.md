---
paths:
  - "supabase/**"
  - "**/migrations/**"
---

# Regras Supabase (SASI)

<!-- Carrega só quando o Claude toca arquivo de supabase/. Não sobrevive ao /compact: regra crítica também no CLAUDE.md. -->

## RLS

- RLS (regras de acesso por linha) ligada em toda tabela.
- A policy `dev_bypass` (libera tudo) é decisão do operador, por ser uso solo: não trocar nem remover (ver `docs/MEMORY.md`).
- Views `vw_*` com `security_invoker = true`.

## Migrações

- Nome: `YYYYMMDDHHmmss_descricao.sql`.
- Comentar todo comando destrutivo (drop/alter/delete).
- Uma migração por mudança lógica. Aplicar com uma única chamada `apply_migration`.

## Edge Functions

- Segredos só em variável de ambiente, nunca no código do app.
