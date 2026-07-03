# MAPA DO SASI — inventário do repositório

> Gerado automaticamente em 03-jul-2026 por `memory/scripts/build_sasi_index.py`.
> Fonte de verdade: `sasi_index.db` (SQLite). Doutrina ZERO ALUCINAÇÃO: só fato lido do disco.
> Regenerar: `python3 memory/scripts/build_sasi_index.py` (a partir da raiz do repo).

**Total:** 357 arquivos · 5.5 MB · 47,909 linhas · 213,540 tokens (excluídos `.git`, `node_modules`, `sasi_index.db`).

## Por categoria

| Categoria | Arq | Linhas | Tokens | O que é |
|---|---:|---:|---:|---|
| `frontend_src` | 66 | 13,286 | 50,072 | App React+Vite+TS — `frontend/src/` |
| `build_artifact` | 41 | 2,539 | 42,226 | **Ruído gerado** — `dist/` de front e mcp |
| `design_system` | 77 | 7,376 | 32,843 | Tokens, componentes, guidelines — `design-system/` |
| `docs` | 30 | 3,355 | 19,960 | Documentação — `docs/` |
| `doctrine` | 12 | 1,597 | 10,773 | Doutrina clínica/arquitetura — `doctrine/` |
| `frontend_config` | 19 | 5,289 | 10,116 | Configs do front (package-lock, vite, tsconfig) |
| `db_migration` | 15 | 2,168 | 9,783 | Migrations SQL — `supabase/migrations/` |
| `mcp_src` | 11 | 1,813 | 7,998 | Código-fonte MCP — `mcp-server/src/` |
| `supabase_config` | 14 | 2,022 | 7,334 | Config Supabase (config.toml, seed) |
| `other` | 20 | 3,111 | 6,874 | Sem categoria (revisar regras) |
| `mcp_config` | 8 | 3,223 | 6,227 | Config do MCP server |
| `project_memory` | 8 | 723 | 3,289 | Esta pasta `memory/` |
| `root_config` | 9 | 641 | 3,201 | CLAUDE.md, README, .env.example, .mcp.json |
| `edge_function` | 3 | 325 | 1,510 | Edge Functions Deno — `supabase/functions/` |
| `ide_config` | 19 | 298 | 689 | `.idea/` (WebStorm) |
| `ci` | 2 | 86 | 410 | GitHub Actions — `.github/workflows/` |
| `claude_config` | 2 | 56 | 232 | `.claude/` (rules) |
| `frontend_public` | 1 | 1 | 3 | `frontend/public/` |

## Núcleo (sem build_artifact nem lock files)

### `frontend/src/` — por diretório

| Diretório | Arq | Linhas |
|---|---:|---:|
| `frontend/src/components` | 31 | 7,722 |
| `frontend/src/lib` | 13 | 3,118 |
| `frontend/src` | 4 | 682 |
| `frontend/src/hooks` | 4 | 633 |
| `frontend/src/components/clinical` | 8 | 575 |
| `frontend/src/components/janelas` | 6 | 556 |

### Maiores arquivos de código/texto

- `design-system/_ds_bundle.js` — 2,916 linhas (`design_system`)
- `packages/clinical-engine/package-lock.json` — 2,465 linhas (`other`)
- `frontend/src/components/FichaCompleta.tsx` — 1,687 linhas (`frontend_src`)
- `supabase/migrations/20260626000000_baseline.sql` — 1,200 linhas (`db_migration`)
- `supabase/types/database.types.ts` — 1,199 linhas (`supabase_config`)
- `frontend/src/components/PatientModal.tsx` — 829 linhas (`frontend_src`)
- `frontend/src/components/PacientePage.tsx` — 800 linhas (`frontend_src`)
- `frontend/src/lib/drugs.ts` — 686 linhas (`frontend_src`)

### Outros núcleos

- **MCP** → `mcp-server/src/` — ponte skills→MCP→Supabase
- **Backend** → `supabase/migrations/` + `supabase/functions/`
- **Motor clínico v2** → `docs/motor-clinico-v2/`
- **Design system** → `design-system/` (inclui fonts .woff/.woff2 sem contagem de linhas)

## Memória do projeto (`memory/`)

- `memory/MAPA-SASI.md` — 111 linhas
- `memory/MEMORY.md` — 62 linhas
- `memory/notes/debito-plantao-board-fantasma.md` — 12 linhas
- `memory/notes/pacote-sasi-skills.md` — 22 linhas
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

## ⚠️ Categoria `other` (revisar regras)

- `packages/clinical-engine/.gitignore`
- `packages/clinical-engine/vitest.config.ts`
- `packages/clinical-engine/tsconfig.build.json`
- `packages/clinical-engine/tsconfig.json`
- `packages/clinical-engine/LEIA-ME-POPULAR.md`
- `packages/clinical-engine/README.md`
- `packages/clinical-engine/package-lock.json`
- `packages/clinical-engine/package.json`
- `packages/clinical-engine/src/INSTRUCOES.md`
- `packages/clinical-engine/src/sofaDisplay.test.ts`
- `packages/clinical-engine/src/types.ts`
- `packages/clinical-engine/src/clinical-logic-compat.ts`
- `packages/clinical-engine/src/parseBR.test.ts`
- `packages/clinical-engine/src/index.ts`
- `packages/clinical-engine/src/scores/sofaDisplay.ts`
- `packages/clinical-engine/src/scores/index.ts`
- `packages/clinical-engine/src/calculations/parseBR.ts`
- `packages/clinical-engine/src/calculations/index.ts`
- `scripts/audit_eventos.py`
- `scripts/ingest_downloads_bundle.py`
