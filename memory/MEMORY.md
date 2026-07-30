# MEMÓRIA — SASI (`memory/`)

Índice do projeto. Só fato verificável (ZERO ALUCINAÇÃO).

```
memory/
├── MEMORY.md          ← este arquivo (hub)
├── MAPA-SASI.md       ← inventário auto-gerado (não editar)
├── sasi_index.db      ← SQLite local (gitignored)
└── notes/
    └── STATUS.md      ← estado autoritativo do projeto
```

## Comandos

```bash
cd ~/projetos/sasi
python3 ~/projetos/scripts/indices/build_sasi_index.py
python3 ~/projetos/scripts/indices/query_sasi_index.py categorias
python3 ~/projetos/scripts/indices/query_sasi_index.py find FichaCompleta
python3 ~/projetos/scripts/indices/push_repo_index_to_postgres.py   # SUPABASE_DB_URL no .env
python3 ~/projetos/scripts/sasi/audit_eventos.py                   # fila eventos_clinicos
```

## Mapa

- [**MAPA-SASI.md**](MAPA-SASI.md) — inventário por categoria (regenera com build).
- [**notes/STATUS.md**](notes/STATUS.md) — deploy, schema, backlog, histórico.

| Área | Caminho | Papel |
|---|---|---|
| App | `frontend/src/` | UI plantão |
| MCP | `mcp-server/src/` | skills → Supabase |
| Edge | `supabase/functions/` | ocr-ingest legado (não usar) |
| Ingest | skill + MCP | Claude → JSON → deploy |
| Motor | `~/projetos/rascunhos/sasi-motor-clinico-v2/` (staging, fora do repo) | SOFA/sepsis |
| Doutrina | `doctrine/` | template-base Ramo C |
| Queries plantão | `supabase/queries/plantao_queries.sql` | SQL ad-hoc no DataGrip |

## Débitos

1. **rag-protocolos** — migration `06` versionada; falta aplicar no Supabase + Edge `protocolo-ingest`
2. **eventos_clinicos** — ~27 na fila `vw_eventos_pendentes_revisao` (revisar)
3. **SOFA bloqueado por dado** — 0/16 evoluções têm os 6 componentes (bilirrubina/PaO2 nunca capturados); fix = skill `sasi-ingest-export` capturar a montante
4. **evolucoes JSONB 2 schemas** — ingest usa `pa_sys_max`/`cr1`, ficha grava `pas1`
5. **regras eng-default** (glicemia/K/Na/temp) em `alert_rules` sem evidência — pendente Vera; oligúria precisa de tipo `diurese`
6. ~~alerts_log vazia~~ **resolvido 26-jun**: produtor criado (`fn_eval_alert`/`fn_eval_trend`, config `alert_rules`/`trend_rules`)

## Schema (26-jun-2026)

Baseline em `supabase/migrations/20260626000000_baseline.sql` (01–07 em `_archive/`). Tabelas de config: `alert_rules` (25), `trend_rules` (3). Alertas vivos via trigger. Limiares clínicos: `~/vaults/celebro/conhecimento/projetos/sasi-decisoes-clinicas.md`.
