# MEMÓRIA — SASI (`memory/`)

Índice do projeto. Só fato verificável (ZERO ALUCINAÇÃO).

```
memory/
├── MEMORY.md          ← este arquivo (hub)
├── MAPA-SASI.md       ← inventário auto-gerado (não editar)
├── sasi_index.db      ← SQLite local (gitignored)
├── scripts/           ← pipeline do índice
│   ├── build_sasi_index.py
│   ├── query_sasi_index.py
│   └── push_repo_index_to_postgres.py
└── notes/             ← débitos e decisões
    ├── rag-protocolos.md
    ├── pacote-sasi-skills.md
    └── debito-plantao-board-fantasma.md
```

## Comandos

```bash
cd ~/dev/sasi
python3 memory/scripts/build_sasi_index.py
python3 memory/scripts/query_sasi_index.py categorias
python3 memory/scripts/query_sasi_index.py find FichaCompleta
python3 memory/scripts/push_repo_index_to_postgres.py   # SUPABASE_DB_URL no .env
```

## Mapa

- [**MAPA-SASI.md**](MAPA-SASI.md) — inventário por categoria (regenera com build).

| Área | Caminho | Papel |
|---|---|---|
| App | `frontend/src/` | UI plantão |
| MCP | `mcp-server/src/` | skills → Supabase |
| Edge | `supabase/functions/` | ocr-ingest legado (não usar) |
| Ingest | skill + MCP | Claude → JSON → deploy |
| Motor | `~/dev/_lab/sasi-motor-clinico-v2/` (fora do repo, staging, movido 10-jul-2026) | SOFA/sepsis |
| Doutrina | `doctrine/` | regras clínicas |

## Notas

| Arquivo | Conteúdo |
|---|---|
| [notes/rag-protocolos.md](notes/rag-protocolos.md) | RAG pgvector — protocolos com fonte |
| [notes/pacote-sasi-skills.md](notes/pacote-sasi-skills.md) | 3 skills em `~/dev/claude/skills/` |
| [notes/debito-plantao-board-fantasma.md](notes/debito-plantao-board-fantasma.md) | LOG falso no `comando.md` |

## Débitos

1. **plantao-board** — migração fantasma no `comando.md`
2. **rag-protocolos** — migration `06` versionada; falta aplicar no Supabase + Edge `protocolo-ingest`
3. **eventos_clinicos** — 130 linhas; ~27 na fila `vw_eventos_pendentes_revisao` (revisar)
4. **SOFA bloqueado por dado** — 0/16 evoluções têm os 6 componentes (bilirrubina/PaO2 nunca capturados); fix = skill `sasi-ingest-export` capturar a montante
5. **evolucoes JSONB 2 schemas** — ingest usa `pa_sys_max`/`cr1`, ficha grava `pas1`
6. **regras eng-default** (glicemia/K/Na/temp) em `alert_rules` sem evidência — pendente Vera; oligúria precisa de tipo `diurese`
7. ~~alerts_log vazia~~ **resolvido 26-jun**: produtor criado (`fn_eval_alert`/`fn_eval_trend`, config `alert_rules`/`trend_rules`)

## Schema (26-jun-2026)
Baseline em `supabase/migrations/20260626000000_baseline.sql` (01–07 em `_archive/`). Tabelas de config: `alert_rules` (25), `trend_rules` (3). Alertas vivos via trigger. Roadmap do banco: `docs/ROADMAP-BANCO.md` — **movido/inexistente** (nunca existiu no repo, achado na faxina de 10-jul-2026); limiares clínicos: movidos pro celebro em `~/vaults/celebro/conhecimento/projetos/sasi-decisoes-clinicas.md` (faxina 10-jul-2026, ver também `sasi-sofa-ruleset.md`/`sasi-vera-ingest-spec.md`/`sasi-backlog-clinico.md`).