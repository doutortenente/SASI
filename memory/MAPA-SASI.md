# MAPA DO SASI — inventário do repositório

> Gerado automaticamente em 24-jun-2026 por `memory/scripts/build_sasi_index.py`.
> Fonte de verdade: `sasi_index.db` (SQLite). Doutrina ZERO ALUCINAÇÃO: só fato lido do disco.
> Regenerar: `python3 memory/scripts/build_sasi_index.py` (a partir da raiz do repo).

**Total:** 294 arquivos · 3.6 MB · 39,400 linhas · 148,428 tokens (excluídos `.git`, `node_modules`, `sasi_index.db`).

## Por categoria

| Categoria | Arq | Linhas | Tokens | O que é |
|---|---:|---:|---:|---|
| `frontend_src` | 66 | 13,001 | 48,984 | App React+Vite+TS — `frontend/src/` |
| `design_system` | 77 | 7,376 | 32,845 | Tokens, componentes, guidelines — `design-system/` |
| `frontend_config` | 18 | 5,408 | 10,812 | Configs do front (package-lock, vite, tsconfig) |
| `doctrine` | 11 | 1,271 | 9,378 | Doutrina clínica/arquitetura — `doctrine/` |
| `docs` | 21 | 2,191 | 9,224 | Documentação — `docs/` |
| `mcp_src` | 10 | 1,536 | 7,103 | Código-fonte MCP — `mcp-server/src/` |
| `build_artifact` | 30 | 1,408 | 6,595 | **Ruído gerado** — `dist/` de front e mcp |
| `mcp_config` | 8 | 3,221 | 6,214 | Config do MCP server |
| `supabase_config` | 5 | 1,370 | 5,866 | Config Supabase (config.toml, seed) |
| `project_memory` | 8 | 688 | 3,065 | Esta pasta `memory/` |
| `root_config` | 8 | 609 | 3,003 | CLAUDE.md, README, .env.example, .mcp.json |
| `edge_function` | 5 | 557 | 2,381 | Edge Functions Deno — `supabase/functions/` |
| `db_migration` | 6 | 378 | 1,750 | Migrations SQL — `supabase/migrations/` |
| `ide_config` | 16 | 248 | 568 | `.idea/` (WebStorm) |
| `ci` | 2 | 86 | 410 | GitHub Actions — `.github/workflows/` |
| `claude_config` | 2 | 51 | 227 | `.claude/` (rules) |
| `frontend_public` | 1 | 1 | 3 | `frontend/public/` |

## Núcleo (sem build_artifact nem lock files)

### `frontend/src/` — por diretório

| Diretório | Arq | Linhas |
|---|---:|---:|
| `frontend/src/components` | 31 | 7,752 |
| `frontend/src/lib` | 13 | 2,972 |
| `frontend/src/hooks` | 4 | 630 |
| `frontend/src/components/clinical` | 8 | 575 |
| `frontend/src/components/janelas` | 6 | 569 |
| `frontend/src` | 4 | 503 |

### Maiores arquivos de código/texto

- `design-system/_ds_bundle.js` — 2,916 linhas (`design_system`)
- `frontend/src/components/FichaCompleta.tsx` — 1,707 linhas (`frontend_src`)
- `frontend/src/components/PatientModal.tsx` — 829 linhas (`frontend_src`)
- `frontend/src/components/PacientePage.tsx` — 815 linhas (`frontend_src`)
- `frontend/src/lib/drugs.ts` — 686 linhas (`frontend_src`)
- `supabase/types/database.types.ts` — 552 linhas (`supabase_config`)
- `docs/motor-clinico-v2/engine.ts` — 549 linhas (`docs`)
- `frontend/src/lib/clinicalExtract.ts` — 531 linhas (`frontend_src`)

### Outros núcleos

- **MCP** → `mcp-server/src/` — ponte skills→MCP→Supabase
- **Backend** → `supabase/migrations/` + `supabase/functions/`
- **Motor clínico v2** → `docs/motor-clinico-v2/`
- **Design system** → `design-system/` (inclui fonts .woff/.woff2 sem contagem de linhas)

## Memória do projeto (`memory/`)

- `memory/MAPA-SASI.md` — 86 linhas
- `memory/MEMORY.md` — 54 linhas
- `memory/notes/debito-plantao-board-fantasma.md` — 12 linhas
- `memory/notes/pacote-sasi-skills.md` — 20 linhas
- `memory/notes/rag-protocolos.md` — 23 linhas

## Consultas úteis

```bash
# Resumo por categoria
python3 memory/scripts/query_sasi_index.py categorias

# Top arquivos por linhas
python3 memory/scripts/query_sasi_index.py top --n 15

# Buscar path
python3 memory/scripts/query_sasi_index.py find FichaCompleta

# Busca full-text (FTS5, token a token indexado)
python3 memory/scripts/query_sasi_index.py search eventos_clinicos
```

Tabelas SQLite: `files` (sha256, tokens), `dirs`, `files_fts` (FTS5), view `categorias`.
Sync remoto (opcional): `python3 memory/scripts/push_repo_index_to_postgres.py` → schema `repo_index` no Supabase.
