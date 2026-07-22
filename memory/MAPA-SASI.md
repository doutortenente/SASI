# MAPA DO SASI — inventário do repositório

> Gerado automaticamente em 22-jul-2026 por `~/dev/scripts/indices/build_sasi_index.py`.
> Fonte de verdade: `sasi_index.db` (SQLite). Doutrina ZERO ALUCINAÇÃO: só fato lido do disco.
> Regenerar: `python3 ~/dev/scripts/indices/build_sasi_index.py` (a partir da raiz do repo).

**Total:** 363 arquivos · 9.7 MB · 218,924 linhas · 600,596 tokens (excluídos `.git`, `node_modules`, `sasi_index.db`).

## Por categoria

| Categoria | Arq | Linhas | Tokens | O que é |
|---|---:|---:|---:|---|
| `other` | 124 | 184,107 | 441,202 | Sem categoria (revisar regras) |
| `frontend_src` | 68 | 13,611 | 51,775 | App React+Vite+TS — `frontend/src/` |
| `build_artifact` | 41 | 2,544 | 42,419 | **Ruído gerado** — `dist/` de front e mcp |
| `claude_config` | 13 | 1,588 | 10,680 | `.claude/` (rules) |
| `db_migration` | 16 | 2,376 | 10,528 | Migrations SQL — `supabase/migrations/` |
| `frontend_config` | 20 | 5,292 | 10,125 | Configs do front (package-lock, vite, tsconfig) |
| `mcp_src` | 11 | 1,813 | 7,998 | Código-fonte MCP — `mcp-server/src/` |
| `supabase_config` | 14 | 2,027 | 7,361 | Config Supabase (config.toml, seed) |
| `mcp_config` | 8 | 3,223 | 6,227 | Config do MCP server |
| `root_config` | 10 | 709 | 3,904 | CLAUDE.md, README, .env.example, .mcp.json |
| `project_memory` | 6 | 619 | 3,793 | Esta pasta `memory/` |
| `edge_function` | 7 | 392 | 1,829 | Edge Functions Deno — `supabase/functions/` |
| `doctrine` | 1 | 147 | 1,273 | Doutrina clínica/arquitetura — `doctrine/` |
| `ide_config` | 19 | 298 | 689 | `.idea/` (WebStorm) |
| `ci` | 2 | 86 | 410 | GitHub Actions — `.github/workflows/` |
| `docs` | 2 | 91 | 380 | Documentação — `docs/` |
| `frontend_public` | 1 | 1 | 3 | `frontend/public/` |

## Núcleo (sem build_artifact nem lock files)

### `frontend/src/` — por diretório

| Diretório | Arq | Linhas |
|---|---:|---:|
| `frontend/src/components` | 31 | 7,773 |
| `frontend/src/lib` | 14 | 3,293 |
| `frontend/src/hooks` | 5 | 732 |
| `frontend/src` | 4 | 682 |
| `frontend/src/components/clinical` | 8 | 575 |
| `frontend/src/components/janelas` | 6 | 556 |

### Maiores arquivos de código/texto

- `graphify-out/2026-07-06/graph.json` — 30,557 linhas (`other`)
- `graphify-out/2026-07-10/graph.json` — 30,557 linhas (`other`)
- `graphify-out/2026-07-03/graph.json` — 30,143 linhas (`other`)
- `graphify-out/graph.json` — 29,701 linhas (`other`)
- `graphify-out/2026-07-22/graph.json` — 24,856 linhas (`other`)
- `graphify-out/2026-07-11/graph.json` — 24,826 linhas (`other`)
- `packages/clinical-engine/package-lock.json` — 2,465 linhas (`other`)
- `frontend/src/components/FichaCompleta.tsx` — 1,738 linhas (`frontend_src`)

### Outros núcleos

- **MCP** → `mcp-server/src/` — ponte skills→MCP→Supabase
- **Backend** → `supabase/migrations/` + `supabase/functions/`
- **Motor clínico v2** → `docs/motor-clinico-v2/`
- **Design system** → `design-system/` (inclui fonts .woff/.woff2 sem contagem de linhas)

## Memória do projeto (`memory/`)

- `memory/MAPA-SASI.md` — 215 linhas
- `memory/MEMORY.md` — 62 linhas
- `memory/notes/STATUS.md` — 285 linhas
- `memory/notes/debito-plantao-board-fantasma.md` — 12 linhas
- `memory/notes/pacote-sasi-skills.md` — 22 linhas
- `memory/notes/rag-protocolos.md` — 23 linhas

## Consultas úteis

```bash
# Resumo por categoria
python3 ~/dev/scripts/indices/query_sasi_index.py categorias

# Top arquivos por linhas
python3 ~/dev/scripts/indices/query_sasi_index.py top --n 15

# Buscar path
python3 ~/dev/scripts/indices/query_sasi_index.py find FichaCompleta

# Busca full-text (FTS5, token a token indexado)
python3 ~/dev/scripts/indices/query_sasi_index.py search eventos_clinicos
```

Tabelas SQLite: `files` (sha256, tokens), `dirs`, `files_fts` (FTS5), view `categorias`.
Sync remoto (opcional): `python3 scripts/push_repo_index_to_postgres.py` → schema `repo_index` no Supabase.

## ⚠️ Categoria `other` (revisar regras)

- `graphify-out/graph.json`
- `graphify-out/.graphify_labels.json`
- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/.graphify_root`
- `graphify-out/graph.html`
- `graphify-out/manifest.json`
- `graphify-out/2026-07-22/graph.json`
- `graphify-out/2026-07-22/.graphify_labels.json`
- `graphify-out/2026-07-22/GRAPH_REPORT.md`
- `graphify-out/2026-07-22/manifest.json`
- `graphify-out/2026-07-06/graph.json`
- `graphify-out/2026-07-06/.graphify_labels.json`
- `graphify-out/2026-07-06/GRAPH_REPORT.md`
- `graphify-out/2026-07-06/manifest.json`
- `graphify-out/2026-07-11/graph.json`
- `graphify-out/2026-07-11/.graphify_labels.json`
- `graphify-out/2026-07-11/GRAPH_REPORT.md`
- `graphify-out/2026-07-11/manifest.json`
- `graphify-out/2026-07-10/graph.json`
- `graphify-out/2026-07-10/.graphify_labels.json`
- `graphify-out/2026-07-10/GRAPH_REPORT.md`
- `graphify-out/2026-07-10/manifest.json`
- `graphify-out/cache/stat-index.json`
- `graphify-out/cache/last_query_stamp`
- `graphify-out/cache/ast/v0.9.24/9e4d3c3991a990970aea9de6686830188080516455c06418d3c2f64822d272bd.json`
- `graphify-out/cache/ast/v0.9.24/1d5afbaccf36e952e71082591edfc9e4fbd9946eb85b01855a1d0bd810b7623d.json`
- `graphify-out/cache/ast/v0.9.24/7328ef267c21a0ecf7996b505e0424edf844c3fa84b8bd2a17089fe895e2e04d.json`
- `graphify-out/cache/ast/v0.9.24/79d0a9cc5c907eff34dcb6cf6d7bd38240d1a6338c282c2601879edd181bc8ac.json`
- `graphify-out/cache/ast/v0.9.24/7da9482a29df84be5343944c99140dd31bcacb3a765466e3e2d27114dc7b6aac.json`
- `graphify-out/cache/ast/v0.9.24/ce66237f3c7b434fb2824cb87e5416f02386361125294585b2ae2f1860209a83.json`
- `graphify-out/cache/ast/v0.9.24/609de4b1331ddb2f8c80e97aac0a5de782a373d6f5af858e10a731c20b35c0e2.json`
- `graphify-out/cache/ast/v0.9.24/00e425133f35ab78ac8286265342efc80e36fcef5bae147d16bdc5b480680669.json`
- `graphify-out/cache/ast/v0.9.24/a6b2a223ec5c9f60944738f653fe582b8851ae8e7842c3548ca161438bab7f4e.json`
- `graphify-out/cache/ast/v0.9.24/f0adfc59effb4b1a2768f7f6cec89a577083ef40343d98f407eeed86b9a7dde5.json`
- `graphify-out/cache/ast/v0.9.24/7e2db852c6c4dc78e89bb8e482b351101c68173bc2062c6b271ad429221c7fbb.json`
- `graphify-out/cache/ast/v0.9.24/ed6a5c514548e61e23839264c9151926270cdccfd6e8c5d90e8f4654a1443e36.json`
- `graphify-out/cache/ast/v0.9.24/9cf5d515d0d8584aeef36708df34f560078772a568ed599cac5ba20b089e563d.json`
- `graphify-out/cache/ast/v0.9.24/8cb1dbb82571a28740ec0b94978dfc39d48637a3b6687bd73b85b3927cd17afc.json`
- `graphify-out/cache/ast/v0.9.24/7aa8b606e5c19334b6c9fe62a12fc30eb46c0320d1dbb5726cfda0becdd04a5a.json`
- `graphify-out/cache/ast/v0.9.24/50308737bd8a8156f10d2665c2419244988c857c6125147d65eb6ff8232a3faf.json`
- `graphify-out/cache/ast/v0.9.24/ce504410f54216a0b1af6a4bdf3cbdc95ba26e4ced7b407cf5bca03bf99927da.json`
- `graphify-out/cache/ast/v0.9.24/7d545ef79ba1827378b8aacfa0c80c193f53128a0a63c80f5cc83bf5870e762e.json`
- `graphify-out/cache/ast/v0.9.24/f5f9de4aa39eb592338abc37a28cf939897fa95cd560cf24b2059d3f0ed25975.json`
- `graphify-out/cache/ast/v0.9.24/bd340da741d7a452b8827a6542a4646d53f60b08edac17d0178f4c82e65b639b.json`
- `graphify-out/cache/ast/v0.9.24/4d109a033167028d2d28d71beab635eb07367ec95208b85f592b28f68611dff1.json`
- `graphify-out/cache/ast/v0.9.24/63ff70e4de08afcefb4c98b5a6841815a13983236320a7cc81a292ca322e460d.json`
- `graphify-out/cache/ast/v0.9.24/003184c9b728dfc9f401189c2312e9e4ce4939cae84a40ce84f208e20d5785db.json`
- `graphify-out/cache/ast/v0.9.24/4607b0b311b067a755a267c35cbacbdd445095b8be0920e0a68525b60183b2dc.json`
- `graphify-out/cache/ast/v0.9.24/27f753b864ff808ac9e5d644de37c8caaa20d511bc8655cc487cb66a9c9f07b7.json`
- `graphify-out/cache/ast/v0.9.24/9b0e7b7db8c163d5bc1a010c58b0e6a5deca672cb4ad4cb9431ff375e41e0d54.json`
- `graphify-out/cache/ast/v0.9.24/37ddd02f8659a6ab0a4449f8dc5ff7079b22446c8066279db54becb0e416aa18.json`
- `graphify-out/cache/ast/v0.9.24/3223133338e0b06a9edb756e712f0ef80a742ff873eeb58bf29637fd640dcb27.json`
- `graphify-out/cache/ast/v0.9.24/1cdc8803b6f9e532579c1a6e7035e60cfb8c33969ac0198b2c8027d742afe7af.json`
- `graphify-out/cache/ast/v0.9.24/e2d6f057a4ca784634de4b6f596357d9429417edafe85d77f5cc6b74401b2757.json`
- `graphify-out/cache/ast/v0.9.24/95d8fdbdcc3326cf4423fd98bb2e8e95a5d52d6cbb601f2ca1aedf6908abeb44.json`
- `graphify-out/cache/ast/v0.9.24/8e9e66277bcfb100ad288a6484853ff295abdaaf8263cad8586339c6e2e9f134.json`
- `graphify-out/cache/ast/v0.9.24/4da731a9a74e63e8392d2224e01685407558ed3d484ef5002bf18b90ca295af6.json`
- `graphify-out/cache/ast/v0.9.24/84c5e671a18f1e26925632cc17834963ede9ce9810031d48e54fcfd81bf3acbd.json`
- `graphify-out/cache/ast/v0.9.24/803a3cfc969feef7f34c387c8546b0a8ad182bc8485118ce0ee320985de65161.json`
- `graphify-out/cache/ast/v0.9.24/73dbb9f3615695dcb82fbe50b8b6d1627d28cc00de9b8c42bcff9b4c9ae672cf.json`
- `graphify-out/cache/ast/v0.9.24/993d763ea223d382cb3f0031ec9ae64b7799b407022feb4030b9c10e3f594209.json`
- `graphify-out/cache/ast/v0.9.24/46c7f35933315ab1e8d2853c5930c531d8bf447a8503c5961c4a40b07756c176.json`
- `graphify-out/cache/ast/v0.9.24/9f20d4a8e2ca1dd4b61a695d6f7f766cf6f7a5a6a97b1a4daca5bb76364b2fac.json`
- `graphify-out/cache/ast/v0.9.24/e00b1186ab0bd00252146bc899d179a3e68b16e85666217c1d56f109a4323eb0.json`
- `graphify-out/cache/ast/v0.9.24/c6f7fc2f062904d246b700d446ba3ad03e77f41809b12eccfb5e090a11f4fad2.json`
- `graphify-out/cache/ast/v0.9.24/7c7827f2f29d6e2cb6cc6902558dac08380f60c414b4968f83e1bc4e61b3e268.json`
- `graphify-out/cache/ast/v0.9.24/cb5e2f3284265c08c88c08f445b96958b13a9115c0afc0a33206c293d1b1c187.json`
- `graphify-out/cache/ast/v0.9.24/fe4c5e9534a9e7a46e9bb7df6cf3e33264a8cfd08d2f10e7c340f64386793f57.json`
- `graphify-out/2026-07-03/graph.json`
- `graphify-out/2026-07-03/.graphify_labels.json`
- `graphify-out/2026-07-03/GRAPH_REPORT.md`
- `graphify-out/2026-07-03/manifest.json`
- `packages/clinical-engine/.gitignore`
- `packages/clinical-engine/vitest.config.ts`
- `packages/clinical-engine/tsconfig.build.json`
- `packages/clinical-engine/tsconfig.json`
- `packages/clinical-engine/LEIA-ME-POPULAR.md`
- `packages/clinical-engine/README.md`
- `packages/clinical-engine/package-lock.json`
- `packages/clinical-engine/package.json`
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
- `packages/clinical-engine/src/sofaAuto.test.ts`
- `packages/clinical-engine/src/INSTRUCOES.md`
- `packages/clinical-engine/src/sofaDisplay.test.ts`
- `packages/clinical-engine/src/types.ts`
- `packages/clinical-engine/src/clinical-logic-compat.ts`
- `packages/clinical-engine/src/parseBR.test.ts`
- `packages/clinical-engine/src/index.ts`
- `packages/clinical-engine/src/scores/sofaDisplay.ts`
- `packages/clinical-engine/src/scores/sofaAuto.ts`
- `packages/clinical-engine/src/scores/index.ts`
- `packages/clinical-engine/src/calculations/parseBR.ts`
- `packages/clinical-engine/src/calculations/index.ts`
