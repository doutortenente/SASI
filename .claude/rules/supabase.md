---
paths:
  - "supabase/**"
  - "src/**/*.sql"
  - "**/migrations/**"
---
# Regras Supabase (SASI / projetos com Postgres)
<!-- Path-scoped: so carrega quando o Claude toca arquivo Supabase/SQL. -->
<!-- NAO sobrevive ao /compact — regra critica tambem no CLAUDE.md raiz. -->

## RLS (obrigatório)
- SEMPRE habilitar RLS em toda tabela. Sem exceção.
- 4 policies SEPARADAS, nunca `FOR ALL`:
  - SELECT → só `USING`
  - INSERT → só `WITH CHECK`
  - UPDATE → `USING` + `WITH CHECK`
  - DELETE → só `USING`
- Claims em `app_metadata` (NUNCA `user_metadata` — editável pelo usuário).
- Ownership padrão: `auth.uid() = created_by`.
- ⚠️ Proibido `USING(true)` / `CHECK(true)` em produção (é o bug `dev_bypass`).

## Migrations
- Nome: `YYYYMMDDHHmmss_descricao.sql`. SQL em lowercase.
- Comentar todo comando destrutivo (drop/alter/delete).
- Uma migration por mudança lógica. Idempotência quando possível.

## Edge Functions
- Deno + Web APIs. Código compartilhado em `supabase/functions/_shared`.
- Segredos via env/Vault, NUNCA no client (caso da Gemini key).

## Tipos & MCP
- Regenerar tipos TS após qualquer mudança de schema.
- MCP Supabase em produção: `read_only=false`. Escrita só via migration revisada.
