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
| Motor | `docs/motor-clinico-v2/` | SOFA/sepsis (staging) |
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
3. **eventos_clinicos** — 93 linhas com 24 requires_review / 18 low confidence (revisar)