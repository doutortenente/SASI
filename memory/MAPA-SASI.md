# MAPA DO SASI — inventário do repositório

> Gerado automaticamente em 07-aug-2026 por `~/projetos/scripts/indices/build_sasi_index.py`.
> Fonte de verdade: `sasi_index.db` (SQLite). Doutrina ZERO ALUCINAÇÃO: só fato lido do disco.
> Regenerar: `python3 ~/projetos/scripts/indices/build_sasi_index.py` (a partir da raiz do repo).

**Total:** 430 arquivos · 90.0 MB · 40,292 linhas · 236,026 tokens (excluídos `.git`, `node_modules`, `sasi_index.db`).

## Por categoria

| Categoria | Arq | Linhas | Tokens | O que é |
|---|---:|---:|---:|---|
| `other` | 273 | 21,175 | 124,785 | Sem categoria (revisar regras) |
| `build_artifact` | 41 | 2,544 | 42,419 | **Ruído gerado** — `dist/` de front e mcp |
| `supabase_config` | 18 | 4,367 | 17,868 | Config Supabase (config.toml, seed) |
| `db_migration` | 24 | 3,214 | 14,456 | Migrations SQL — `supabase/migrations/` |
| `claude_config` | 13 | 1,775 | 10,700 | `.claude/` (rules) |
| `mcp_src` | 11 | 1,813 | 7,920 | Código-fonte MCP — `mcp-server/src/` |
| `mcp_config` | 8 | 3,223 | 6,231 | Config do MCP server |
| `project_memory` | 3 | 826 | 4,325 | Esta pasta `memory/` |
| `root_config` | 7 | 389 | 3,168 | CLAUDE.md, README, .env.example, .mcp.json |
| `edge_function` | 7 | 404 | 1,739 | Edge Functions Deno — `supabase/functions/` |
| `doctrine` | 1 | 163 | 1,279 | Doutrina clínica/arquitetura — `doctrine/` |
| `ide_config` | 19 | 298 | 689 | `.idea/` (WebStorm) |
| `ci` | 2 | 92 | 427 | GitHub Actions — `.github/workflows/` |
| `frontend_config` | 3 | 9 | 20 | Configs do front (package-lock, vite, tsconfig) |

## Núcleo (sem build_artifact nem lock files)

### `frontend/src/` — por diretório

| Diretório | Arq | Linhas |
|---|---:|---:|

### Maiores arquivos de código/texto

- `sasi-v2/package-lock.json` — 2,252 linhas (`other`)
- `supabase/types/database.types.ts` — 1,359 linhas (`supabase_config`)
- `sasi-v2/src/types/supabase.ts` — 1,359 linhas (`other`)
- `supabase/migrations/20260626000000_baseline.sql` — 1,290 linhas (`db_migration`)
- `supabase/schema-producao-v3.sql` — 1,086 linhas (`supabase_config`)
- `sasi-v2/src/features/evolucao/components/SystemPanel.tsx` — 806 linhas (`other`)
- `.claude/skills/graphify/SKILL.md` — 773 linhas (`claude_config`)
- `sasi-v2/src/lib/data/eventos.ts` — 695 linhas (`other`)

### Outros núcleos

- **MCP** → `mcp-server/src/` — ponte skills→MCP→Supabase
- **Backend** → `supabase/migrations/` + `supabase/functions/`
- **Motor clínico v2** → `docs/motor-clinico-v2/`
- **Design system** → `design-system/` (inclui fonts .woff/.woff2 sem contagem de linhas)

## Memória do projeto (`memory/`)

- `memory/MAPA-SASI.md` — 448 linhas
- `memory/MEMORY.md` — 68 linhas
- `memory/notes/STATUS.md` — 310 linhas

## Consultas úteis

```bash
# Resumo por categoria
python3 ~/projetos/scripts/indices/query_sasi_index.py categorias

# Top arquivos por linhas
python3 ~/projetos/scripts/indices/query_sasi_index.py top --n 15

# Buscar path
python3 ~/projetos/scripts/indices/query_sasi_index.py find FichaCompleta

# Busca full-text (FTS5, token a token indexado)
python3 ~/projetos/scripts/indices/query_sasi_index.py search eventos_clinicos
```

Tabelas SQLite: `files` (sha256, tokens), `dirs`, `files_fts` (FTS5), view `categorias`.
Sync remoto (opcional): `python3 scripts/push_repo_index_to_postgres.py` → schema `repo_index` no Supabase.

## ⚠️ Categoria `other` (revisar regras)

- `packages/clinical-engine/dist/clinical-logic-compat.d.ts`
- `packages/clinical-engine/dist/types.d.ts`
- `packages/clinical-engine/dist/index.js.map`
- `packages/clinical-engine/dist/types.d.ts.map`
- `packages/clinical-engine/dist/types.js.map`
- `packages/clinical-engine/dist/clinical-logic-compat.d.ts.map`
- `packages/clinical-engine/dist/index.d.ts`
- `packages/clinical-engine/dist/types.js`
- `packages/clinical-engine/dist/clinical-logic-compat.js.map`
- `packages/clinical-engine/dist/index.js`
- `packages/clinical-engine/dist/clinical-logic-compat.js`
- `packages/clinical-engine/dist/index.d.ts.map`
- `packages/clinical-engine/dist/scores/index.js.map`
- `packages/clinical-engine/dist/scores/index.d.ts`
- `packages/clinical-engine/dist/scores/sofaDisplay.d.ts.map`
- `packages/clinical-engine/dist/scores/sofaDisplay.js.map`
- `packages/clinical-engine/dist/scores/sofaAuto.d.ts`
- `packages/clinical-engine/dist/scores/sofaDisplay.js`
- `packages/clinical-engine/dist/scores/sofaAuto.js.map`
- `packages/clinical-engine/dist/scores/index.js`
- `packages/clinical-engine/dist/scores/sofaAuto.js`
- `packages/clinical-engine/dist/scores/index.d.ts.map`
- `packages/clinical-engine/dist/scores/sofaAuto.d.ts.map`
- `packages/clinical-engine/dist/scores/sofaDisplay.d.ts`
- `packages/clinical-engine/dist/calculations/parseBR.d.ts.map`
- `packages/clinical-engine/dist/calculations/index.js.map`
- `packages/clinical-engine/dist/calculations/parseBR.d.ts`
- `packages/clinical-engine/dist/calculations/index.d.ts`
- `packages/clinical-engine/dist/calculations/index.js`
- `packages/clinical-engine/dist/calculations/index.d.ts.map`
- `packages/clinical-engine/dist/calculations/parseBR.js`
- `packages/clinical-engine/dist/calculations/parseBR.js.map`
- `sasi-v2/.env.example`
- `sasi-v2/.gitignore`
- `sasi-v2/next-env.d.ts`
- `sasi-v2/next.config.ts`
- `sasi-v2/postcss.config.js`
- `sasi-v2/tsconfig.tsbuildinfo`
- `sasi-v2/tsconfig.json`
- `sasi-v2/README.md`
- `sasi-v2/package-lock.json`
- `sasi-v2/package.json`
- `sasi-v2/tailwind.config.ts`
- `sasi-v2/.next/next-minimal-server.js.nft.json`
- `sasi-v2/.next/app-build-manifest.json`
- `sasi-v2/.next/routes-manifest.json`
- `sasi-v2/.next/react-loadable-manifest.json`
- `sasi-v2/.next/app-path-routes-manifest.json`
- `sasi-v2/.next/build-manifest.json`
- `sasi-v2/.next/next-server.js.nft.json`
- `sasi-v2/.next/export-marker.json`
- `sasi-v2/.next/prerender-manifest.json`
- `sasi-v2/.next/package.json`
- `sasi-v2/.next/images-manifest.json`
- `sasi-v2/.next/trace`
- `sasi-v2/.next/BUILD_ID`
- `sasi-v2/.next/required-server-files.json`
- `sasi-v2/.next/diagnostics/framework.json`
- `sasi-v2/.next/diagnostics/build-diagnostics.json`
- `sasi-v2/.next/static/chunks/webpack-c447cebf6b7088e4.js`
- `sasi-v2/.next/static/chunks/255-3d881dfa8c72bc56.js`
- `sasi-v2/.next/static/chunks/719-554b4230200eeb8e.js`
- `sasi-v2/.next/static/chunks/4bd1b696-c023c6e3521b1417.js`
- `sasi-v2/.next/static/chunks/framework-085cf39580498177.js`
- `sasi-v2/.next/static/chunks/main-app-cd9463d6781be923.js`
- `sasi-v2/.next/static/chunks/main-db81a7175e08a0a4.js`
- `sasi-v2/.next/static/chunks/619-ba102abea3e3d0e4.js`
- `sasi-v2/.next/static/chunks/polyfills-42372ed130431b0a.js`
- `sasi-v2/.next/static/chunks/pages/_error-cb2a52f75f2162e2.js`
- `sasi-v2/.next/static/chunks/pages/_app-7d307437aca18ad4.js`
- `sasi-v2/.next/static/chunks/app/layout-bf6e204eac680229.js`
- `sasi-v2/.next/static/chunks/app/page-ca3689a02f5692b2.js`
- `sasi-v2/.next/static/chunks/app/error-4b12a7c900021d61.js`
- `sasi-v2/.next/static/chunks/app/handoff/page-c35632293e17e3d5.js`
- `sasi-v2/.next/static/chunks/app/patients/page-2b9d3706d2ae6b26.js`
- `sasi-v2/.next/static/chunks/app/patients/[id]/page-a2de95d7e12a7353.js`
- `sasi-v2/.next/static/chunks/app/patients/[id]/layout-6b5ad8a0ccb5381b.js`
- `sasi-v2/.next/static/chunks/app/patients/[id]/evolucao/page-ede8594ed46ce594.js`
- `sasi-v2/.next/static/chunks/app/patients/[id]/prescricao/page-a2de95d7e12a7353.js`
- `sasi-v2/.next/static/chunks/app/patients/[id]/sinais/page-ca3689a02f5692b2.js`
- `sasi-v2/.next/static/chunks/app/patients/[id]/especialidades/page-a2de95d7e12a7353.js`
- `sasi-v2/.next/static/chunks/app/patients/[id]/exame/page-ca3689a02f5692b2.js`
- `sasi-v2/.next/static/chunks/app/patients/[id]/labs/page-a2de95d7e12a7353.js`
- `sasi-v2/.next/static/chunks/app/_not-found/page-4ecb13d08450e55b.js`
- `sasi-v2/.next/static/chunks/app/rounds/page-811d5a5a45d626f3.js`
- `sasi-v2/.next/static/chunks/app/beds/page-cf247504bec587b9.js`
- `sasi-v2/.next/static/css/a0f7524fd2d9c5b6.css`
- `sasi-v2/.next/static/-ulZlJDgtwifa1-0L1Jlo/_buildManifest.js`
- `sasi-v2/.next/static/-ulZlJDgtwifa1-0L1Jlo/_ssgManifest.js`
- `sasi-v2/.next/server/app-paths-manifest.json`
- `sasi-v2/.next/server/pages-manifest.json`
- `sasi-v2/.next/server/server-reference-manifest.json`
- `sasi-v2/.next/server/interception-route-rewrite-manifest.js`
- `sasi-v2/.next/server/next-font-manifest.js`
- `sasi-v2/.next/server/next-font-manifest.json`
- `sasi-v2/.next/server/webpack-runtime.js`
- `sasi-v2/.next/server/middleware-react-loadable-manifest.js`
- `sasi-v2/.next/server/server-reference-manifest.js`
- `sasi-v2/.next/server/middleware-build-manifest.js`
- `sasi-v2/.next/server/middleware-manifest.json`
- `sasi-v2/.next/server/functions-config-manifest.json`
- `sasi-v2/.next/server/chunks/643.js`
- `sasi-v2/.next/server/chunks/611.js`
- `sasi-v2/.next/server/chunks/669.js`
- `sasi-v2/.next/server/chunks/769.js`
- `sasi-v2/.next/server/chunks/91.js`
- `sasi-v2/.next/server/chunks/938.js`
- `sasi-v2/.next/server/chunks/83.js`
- `sasi-v2/.next/server/chunks/989.js`
- `sasi-v2/.next/server/chunks/942.js`
- `sasi-v2/.next/server/pages/_document.js.nft.json`
- `sasi-v2/.next/server/pages/404.html`
- `sasi-v2/.next/server/pages/_app.js.nft.json`
- `sasi-v2/.next/server/pages/500.html`
- `sasi-v2/.next/server/pages/_error.js`
- `sasi-v2/.next/server/pages/_app.js`
- `sasi-v2/.next/server/pages/_error.js.nft.json`
- `sasi-v2/.next/server/pages/_document.js`
- `sasi-v2/.next/server/app/_not-found.rsc`
- `sasi-v2/.next/server/app/index.html`
- `sasi-v2/.next/server/app/page_client-reference-manifest.js`
- `sasi-v2/.next/server/app/_not-found.html`
- `sasi-v2/.next/server/app/index.meta`
- `sasi-v2/.next/server/app/_not-found.meta`
- `sasi-v2/.next/server/app/index.rsc`
- `sasi-v2/.next/server/app/page.js`
- `sasi-v2/.next/server/app/page.js.nft.json`
- `sasi-v2/.next/server/app/handoff/page_client-reference-manifest.js`
- `sasi-v2/.next/server/app/handoff/page.js`
- `sasi-v2/.next/server/app/handoff/page.js.nft.json`
- `sasi-v2/.next/server/app/patients/page_client-reference-manifest.js`
- `sasi-v2/.next/server/app/patients/page.js`
- `sasi-v2/.next/server/app/patients/page.js.nft.json`
- `sasi-v2/.next/server/app/patients/[id]/page_client-reference-manifest.js`
- `sasi-v2/.next/server/app/patients/[id]/page.js`
- `sasi-v2/.next/server/app/patients/[id]/page.js.nft.json`
- `sasi-v2/.next/server/app/patients/[id]/evolucao/page_client-reference-manifest.js`
- `sasi-v2/.next/server/app/patients/[id]/evolucao/page.js`
- `sasi-v2/.next/server/app/patients/[id]/evolucao/page.js.nft.json`
- `sasi-v2/.next/server/app/patients/[id]/prescricao/page_client-reference-manifest.js`
- `sasi-v2/.next/server/app/patients/[id]/prescricao/page.js`
- `sasi-v2/.next/server/app/patients/[id]/prescricao/page.js.nft.json`
- `sasi-v2/.next/server/app/patients/[id]/sinais/page_client-reference-manifest.js`
- `sasi-v2/.next/server/app/patients/[id]/sinais/page.js`
- `sasi-v2/.next/server/app/patients/[id]/sinais/page.js.nft.json`
- `sasi-v2/.next/server/app/patients/[id]/especialidades/page_client-reference-manifest.js`
- `sasi-v2/.next/server/app/patients/[id]/especialidades/page.js`
- `sasi-v2/.next/server/app/patients/[id]/especialidades/page.js.nft.json`
- `sasi-v2/.next/server/app/patients/[id]/exame/page_client-reference-manifest.js`
- `sasi-v2/.next/server/app/patients/[id]/exame/page.js`
- `sasi-v2/.next/server/app/patients/[id]/exame/page.js.nft.json`
- `sasi-v2/.next/server/app/patients/[id]/labs/page_client-reference-manifest.js`
- `sasi-v2/.next/server/app/patients/[id]/labs/page.js`
- `sasi-v2/.next/server/app/patients/[id]/labs/page.js.nft.json`
- `sasi-v2/.next/server/app/_not-found/page_client-reference-manifest.js`
- `sasi-v2/.next/server/app/_not-found/page.js`
- `sasi-v2/.next/server/app/_not-found/page.js.nft.json`
- `sasi-v2/.next/server/app/rounds/page_client-reference-manifest.js`
- `sasi-v2/.next/server/app/rounds/page.js`
- `sasi-v2/.next/server/app/rounds/page.js.nft.json`
- `sasi-v2/.next/server/app/beds/page_client-reference-manifest.js`
- `sasi-v2/.next/server/app/beds/page.js`
- `sasi-v2/.next/server/app/beds/page.js.nft.json`
- `sasi-v2/.next/types/validator.ts`
- `sasi-v2/.next/types/cache-life.d.ts`
- `sasi-v2/.next/types/package.json`
- `sasi-v2/.next/types/routes.d.ts`
- `sasi-v2/.next/types/app/page.ts`
- `sasi-v2/.next/types/app/handoff/page.ts`
- `sasi-v2/.next/types/app/patients/page.ts`
- `sasi-v2/.next/types/app/patients/[id]/page.ts`
- `sasi-v2/.next/types/app/patients/[id]/evolucao/page.ts`
- `sasi-v2/.next/types/app/patients/[id]/prescricao/page.ts`
- `sasi-v2/.next/types/app/patients/[id]/sinais/page.ts`
- `sasi-v2/.next/types/app/patients/[id]/especialidades/page.ts`
- `sasi-v2/.next/types/app/patients/[id]/exame/page.ts`
- `sasi-v2/.next/types/app/patients/[id]/labs/page.ts`
- `sasi-v2/.next/types/app/rounds/page.ts`
- `sasi-v2/.next/types/app/beds/page.ts`
- `sasi-v2/.next/cache/.tsbuildinfo`
- `sasi-v2/.next/cache/.rscinfo`
- `sasi-v2/.next/cache/config.json`
- `sasi-v2/.next/cache/.previewinfo`
- `sasi-v2/.next/cache/webpack/server-production/index.pack`
- `sasi-v2/.next/cache/webpack/server-production/0.pack`
- `sasi-v2/.next/cache/webpack/client-production/index.pack`
- `sasi-v2/.next/cache/webpack/client-production/0.pack`
- `sasi-v2/.next/cache/webpack/edge-server-production/index.pack`
- `sasi-v2/.next/cache/webpack/edge-server-production/0.pack`
- `sasi-v2/supabase/functions/generate-sofa/README.md`
- `sasi-v2/supabase/functions/sepsis-bundle-check/README.md`
- `sasi-v2/supabase/functions/export-round/README.md`
- `sasi-v2/supabase/functions/ocr-nursing-note/README.md`
- `sasi-v2/supabase/migrations/README.md`
- `sasi-v2/tests/.gitkeep`
- `sasi-v2/src/components/shared/TopBar.tsx`
- `sasi-v2/src/components/shared/NavLink.tsx`
- `sasi-v2/src/components/shared/ThemeToggle.tsx`
- `sasi-v2/src/components/shared/.gitkeep`
- `sasi-v2/src/components/shared/Sidebar.tsx`
- `sasi-v2/src/components/ui/.gitkeep`
- `sasi-v2/src/features/README.md`
- `sasi-v2/src/features/evolucao/components/NotaPreview.tsx`
- `sasi-v2/src/features/evolucao/components/SystemPanel.tsx`
- `sasi-v2/src/features/evolucao/components/ProblemaConduta.tsx`
- `sasi-v2/src/features/devices/types.ts`
- `sasi-v2/src/features/patients/types.ts`
- `sasi-v2/src/features/patients/components/PatientTabs.tsx`
- `sasi-v2/src/features/patients/components/PatientHeader.tsx`
- `sasi-v2/src/features/patients/components/SummaryPanel.tsx`
- `sasi-v2/src/features/prescricao/components/KardexTable.tsx`
- `sasi-v2/src/features/prescricao/components/AtbStewardship.tsx`
- `sasi-v2/src/features/exports/types.ts`
- `sasi-v2/src/features/exports/components/HandoffCard.tsx`
- `sasi-v2/src/features/exports/components/CopyButton.tsx`
- `sasi-v2/src/features/rounds/types.ts`
- `sasi-v2/src/features/rounds/components/RoundList.tsx`
- `sasi-v2/src/features/war-room/types.ts`
- `sasi-v2/src/features/war-room/triage.ts`
- `sasi-v2/src/features/war-room/components/SplitPane.tsx`
- `sasi-v2/src/features/war-room/components/CalcPanel.tsx`
- `sasi-v2/src/features/especialidades/components/ProgramacaoList.tsx`
- `sasi-v2/src/features/especialidades/components/InterconsultaList.tsx`
- `sasi-v2/src/features/beds/types.ts`
- `sasi-v2/src/features/beds/components/BedCard.tsx`
- `sasi-v2/src/features/beds/components/BedGrid.tsx`
- `sasi-v2/src/features/vitals/components/Sparkline.tsx`
- `sasi-v2/src/features/vitals/components/VitalsTable.tsx`
- `sasi-v2/src/features/vitals/components/BalancoHidrico.tsx`
- `sasi-v2/src/features/labs/components/TabelaoLabs.tsx`
- `sasi-v2/src/features/labs/components/DeltaBadge.tsx`
- `sasi-v2/src/app/layout.tsx`
- `sasi-v2/src/app/page.tsx`
- `sasi-v2/src/app/error.tsx`
- `sasi-v2/src/app/handoff/page.tsx`
- `sasi-v2/src/app/patients/page.tsx`
- `sasi-v2/src/app/patients/[id]/layout.tsx`
- `sasi-v2/src/app/patients/[id]/page.tsx`
- `sasi-v2/src/app/patients/[id]/evolucao/page.tsx`
- `sasi-v2/src/app/patients/[id]/prescricao/page.tsx`
- `sasi-v2/src/app/patients/[id]/sinais/page.tsx`
- `sasi-v2/src/app/patients/[id]/especialidades/page.tsx`
- `sasi-v2/src/app/patients/[id]/exame/page.tsx`
- `sasi-v2/src/app/patients/[id]/labs/page.tsx`
- `sasi-v2/src/app/rounds/page.tsx`
- `sasi-v2/src/app/api/.gitkeep`
- `sasi-v2/src/app/beds/page.tsx`
- `sasi-v2/src/types/clinical.ts`
- `sasi-v2/src/types/supabase.ts`
- `sasi-v2/src/types/index.ts`
- `sasi-v2/src/lib/formatters/br.ts`
- `sasi-v2/src/lib/formatters/tempo.ts`
- `sasi-v2/src/lib/supabase/server.ts`
- `sasi-v2/src/lib/supabase/realtime.ts`
- `sasi-v2/src/lib/supabase/client.ts`
- `sasi-v2/src/lib/constants/leitos.ts`
- `sasi-v2/src/lib/data/erros.ts`
- `sasi-v2/src/lib/data/pendencias.ts`
- `sasi-v2/src/lib/data/alertas.ts`
- `sasi-v2/src/lib/data/evolucoes.ts`
- `sasi-v2/src/lib/data/stewardship.ts`
- `sasi-v2/src/lib/data/pacientes.ts`
- `sasi-v2/src/lib/data/index.ts`
- `sasi-v2/src/lib/data/eventos.ts`
- `sasi-v2/src/lib/utils/index.ts`
- `sasi-v2/src/styles/globals.css`
- `sasi-v2/src/styles/ds/tokens/themes.css`
- `sasi-v2/src/styles/ds/tokens/typography.css`
- `sasi-v2/src/styles/ds/tokens/fonts.css`
- `sasi-v2/src/styles/ds/tokens/animations.css`
- `sasi-v2/src/styles/ds/tokens/spacing.css`
- `sasi-v2/src/styles/ds/tokens/colors.css`
- `sasi-v2/src/stores/uiStore.ts`
