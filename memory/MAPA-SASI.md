# MAPA DO SASI — inventário do repositório

> Gerado por varredura real de `~/dev/sasi` em 24-jun-2026. Fonte de verdade: `sasi_index.db` (SQLite ao lado deste arquivo). Doutrina ZERO ALUCINAÇÃO: só fato lido do disco.
> Regenerar: `python3 memory/build_sasi_index.py` (a partir da raiz do repo).

**Total:** 358 arquivos · ~4,4 MB · 38.444 linhas (excluídos `.git` e `node_modules`).

## Por categoria (o que existe e onde)

| Categoria | Arq | Linhas | O que é |
|---|---:|---:|---|
| `frontend_src` | 66 | 13.001 | App React+Vite+TS — `frontend/src/` (componentes, libs clínicas) |
| `design_system` | 82 | 7.377 | Tokens, componentes, guidelines, ui_kits — `design-system/` |
| `frontend_config` | 19 | 5.409 | Configs do front (package-lock, vite, tsconfig, eslint) |
| `mcp_config` | 8 | 3.220 | Config do MCP server (package-lock incluso) |
| `build_artifact` | 116 | 2.156 | **Ruído gerado** — `dist/` de front e mcp (bundles, .map, fonts) |
| `docs` | 10 | 2.047 | Documentação — `docs/` (inclui motor-clinico-v2) |
| `mcp_src` | 10 | 1.536 | Código-fonte do MCP server — `mcp-server/src/` |
| `doctrine` | 11 | 1.271 | Doutrina de arquitetura/clínica — `doctrine/` |
| `supabase_config` | 3 | 800 | Config Supabase (config.toml, seed) |
| `root_config` | 8 | 589 | CLAUDE.md, README, .env.example, .mcp.json etc |
| `edge_function` | 3 | 418 | Edge Functions Deno — `supabase/functions/` |
| `db_migration` | 5 | 271 | Migrations SQL — `supabase/migrations/` |
| `ide_config` | 8 | 145 | `.idea/` (WebStorm) |
| `ci` | 2 | 86 | GitHub Actions — `.github/workflows/` |
| `project_memory` | 4 | 66 | Esta pasta `memory/` |
| `claude_config` | 2 | 51 | `.claude/` (rules) |
| `frontend_public` | 1 | 1 | `frontend/public/` |

## Núcleo real (ignorando build_artifact e lock files)

- **App clínico** → `frontend/src/` — 66 arquivos, 13k linhas. Maiores: `FichaCompleta.tsx` (1707), `PatientModal.tsx` (829), `PacientePage.tsx` (815), `lib/drugs.ts` (686), `lib/clinicalExtract.ts` (531).
- **MCP server** → `mcp-server/src/` — 10 arquivos, ponte de escrita clínica (skills→MCP→Supabase).
- **Backend dados** → `supabase/migrations/` (5 SQL, 19 migrations no remoto) + `supabase/functions/` (3 edge).
- **Motor clínico v2** → `docs/motor-clinico-v2/engine.ts` (549 linhas) — lógica de score.
- **Design system** → `design-system/` — 82 arquivos; pesado mas em parte bundles/fonts (.woff/.woff2 = 78 arquivos sem linhas).

## Como consultar a base

```bash
# sem sqlite3 CLI instalado — usar Python stdlib:
python3 -c "import sqlite3;c=sqlite3.connect('memory/sasi_index.db');[print(r) for r in c.execute('select * from categorias')]"
```

Tabelas: `files` (path, dir, name, ext, size_bytes, lines, is_text, mtime, category), `dirs` (agregado), view `categorias`.
