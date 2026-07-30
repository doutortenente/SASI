# Design — Modelo de dados SASI v3 (F0)
**Data:** 2026-07-30 · **Branch:** `feat/modelo-dados-v3`

## Problema
O SASI está em produção, mas o alicerce do banco não está formalizado: enums criados mas não usados (colunas `text`+CHECK), vocabulário de eventos "chumbado" numa regra de 56 valores, `dev_bypass` (RLS aberta) em todas as tabelas, `memorias` com RLS sem policy, extensões no `public`. Isso trava a migração para o app de verdade (Next.js 15 + login).

## Decisão (escopo desta iteração = F0)
Formalizar o modelo de dados como **migrations aditivas e seguras**, sem tocar `main` do comportamento do app nem o banco vivo:
1. **Enums nativos** para vocabulário fechado (14 tipos).
2. **`evento_tipo_ref`** — dimensão que governa `eventos_clinicos.tipo` (unidade, faixa fisiológica de `03-clinical-sanity-checks`, slot LOINC). `tipo` vira FK.
3. **`memorias`** ganha `user_id` + policies de dono; **semáforo** passa a valer no INSERT (achado).
4. **RLS de produção** e **adoção de enums** ficam **gated** (`_gated/`), manuais, pós-login/branch-first.

Fora de escopo (próximas fases): construir as Views (F1–F2), OCR (F4), camada FHIR (F5).

## Arquitetura / arquivos
- `supabase/migrations/2026073012000{0,1,2}_*.sql` — 3 migrations ativas.
- `supabase/migrations/_gated/{10_adocao_enums,20_rls_producao}.sql` — passos manuais.
- `supabase/schema-producao-v3.sql` — schema do zero (referência).
- `supabase/types/sasi.types.ts` — tipos + contratos JSONB.
- `docs/PLANO-SASI-v3.{md,html}`, `docs/RUNBOOK-migracao-v3.md`.

## Isolamento e contratos
- A dimensão `evento_tipo_ref` isola o vocabulário: adicionar tipo = inserir linha (dado), não editar código.
- `custom` + `valor_json {dominio,subtipo,unidade}` é a válvula de extensão (eco/hemodinâmica) — sem inflar o vocabulário.
- O contrato de escrita continua sendo o RPC `save_ficha` (atômico) e o envelope de ingestão `sasi-ocr-ingest/v1`.

## Validação (feita)
- Schema do zero: carrega limpo em PostgreSQL 16 (13 tabelas, 7 views, 14 enums, 41 policies, 9 gatilhos) + testes de constraint/RLS/trigger/`save_ficha`.
- Cadeia de migrations ativas: aplica em ordem sobre um banco "cópia do vivo", é idempotente, e passa os asserts (seed 56, FK barra tipo inválido, `memorias.user_id`, semáforo no insert).
- Tipos: compilam em `tsc --strict`.

## Doutrina respeitada
ZERO ALUCINAÇÃO: LOINC só nos 5 vitais verificados; faixas das fontes do próprio projeto. `.claude/rules/supabase.md`: 4 policies por comando, nada de `USING(true)` em produção, migration idempotente, comentar destrutivo.
