# Supabase — SASI

## Arquivos canônicos

| Arquivo | Função |
|---|---|
| `schema-live-dump.sql` | DDL do schema **real** em produção (2026-06-21, 10 tabelas incl. `memorias`) |
| `migrations/01`–`06` | Histórico incremental versionado |
| `types/database.types.ts` | Tipos TS gerados do schema (web + mobile) |
| `functions/ocr-ingest` | **Legado** — ingest real é Claude→JSON→MCP |
| `functions/grok-synthesis` | Síntese xAI Grok |
| `functions/_legacy/ingest-patient` | **Legado** — app mobile antigo; não deployar |

## Regenerar tipos

```bash
supabase gen types typescript --project-id idswehsvvqczzkiatuzu > supabase/types/database.types.ts
```

## Snapshot histórico

O snapshot `05_schema_real_snapshot.sql` (2026-06-14, 9 tabelas) vivia no antigo repo
`comando-uti`. Foi substituído por `schema-live-dump.sql`, que reflete o banco atual.