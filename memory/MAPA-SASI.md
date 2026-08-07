# MAPA DO SASI — inventário do repositório

> Gerado automaticamente em 07-aug-2026 por `~/projetos/scripts/indices/build_sasi_index.py`.
> Fonte de verdade: `sasi_index.db` (SQLite). Doutrina ZERO ALUCINAÇÃO: só fato lido do disco.
> Regenerar: `python3 ~/projetos/scripts/indices/build_sasi_index.py` (a partir da raiz do repo).

**Total:** 526 arquivos · 94.2 MB · 133,970 linhas · 505,870 tokens (excluídos `.git`, `node_modules`, `sasi_index.db`).

## Por categoria

| Categoria | Arq | Linhas | Tokens | O que é |
|---|---:|---:|---:|---|
| `other` | 369 | 115,085 | 394,961 | Sem categoria (revisar regras) |
| `build_artifact` | 41 | 2,544 | 42,419 | **Ruído gerado** — `dist/` de front e mcp |
| `supabase_config` | 18 | 4,367 | 17,868 | Config Supabase (config.toml, seed) |
| `db_migration` | 24 | 3,214 | 14,456 | Migrations SQL — `supabase/migrations/` |
| `claude_config` | 13 | 1,775 | 10,700 | `.claude/` (rules) |
| `mcp_src` | 11 | 1,813 | 7,920 | Código-fonte MCP — `mcp-server/src/` |
| `mcp_config` | 8 | 3,223 | 6,231 | Config do MCP server |
| `project_memory` | 3 | 594 | 3,993 | Esta pasta `memory/` |
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

- `graphify-out/graph.json` — 32,004 linhas (`other`)
- `graphify-out/2026-07-30/graph.json` — 29,037 linhas (`other`)
- `graphify-out/2026-08-01/graph.json` — 28,949 linhas (`other`)
- `sasi-v2/package-lock.json` — 2,252 linhas (`other`)
- `supabase/types/database.types.ts` — 1,359 linhas (`supabase_config`)
- `sasi-v2/src/types/supabase.ts` — 1,359 linhas (`other`)
- `supabase/migrations/20260626000000_baseline.sql` — 1,290 linhas (`db_migration`)
- `supabase/schema-producao-v3.sql` — 1,086 linhas (`supabase_config`)

### Outros núcleos

- **MCP** → `mcp-server/src/` — ponte skills→MCP→Supabase
- **Backend** → `supabase/migrations/` + `supabase/functions/`
- **Motor clínico v2** → `docs/motor-clinico-v2/`
- **Design system** → `design-system/` (inclui fonts .woff/.woff2 sem contagem de linhas)

## Memória do projeto (`memory/`)

- `memory/MAPA-SASI.md` — 216 linhas
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

- `graphify-out/graph.json`
- `graphify-out/.graphify_labels.json`
- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/.graphify_root`
- `graphify-out/graph.html`
- `graphify-out/manifest.json`
- `graphify-out/2026-07-30/graph.json`
- `graphify-out/2026-07-30/.graphify_labels.json`
- `graphify-out/2026-07-30/GRAPH_REPORT.md`
- `graphify-out/2026-07-30/manifest.json`
- `graphify-out/cache/stat-index.json`
- `graphify-out/cache/last_query_stamp`
- `graphify-out/cache/ast/v0.9.25/db7216204ea597aee92165e2465dcc90663afec391b8868fe6bfe64b91c81719.json`
- `graphify-out/cache/ast/v0.9.25/9e4d3c3991a990970aea9de6686830188080516455c06418d3c2f64822d272bd.json`
- `graphify-out/cache/ast/v0.9.25/0d74dd371c348189ab348abbc8c305b63316953d5bbf883000ce656177cf2ccb.json`
- `graphify-out/cache/ast/v0.9.25/af5a9811c740baf7fa7a0e498bf60c3c7a3fcd03c5cda4041d63a1cab03ebd0a.json`
- `graphify-out/cache/ast/v0.9.25/1d5afbaccf36e952e71082591edfc9e4fbd9946eb85b01855a1d0bd810b7623d.json`
- `graphify-out/cache/ast/v0.9.25/7328ef267c21a0ecf7996b505e0424edf844c3fa84b8bd2a17089fe895e2e04d.json`
- `graphify-out/cache/ast/v0.9.25/6e4023a574019d17ec049f8622ba03d3fd3379203fa0d362e11643c15bb7ed7f.json`
- `graphify-out/cache/ast/v0.9.25/79d0a9cc5c907eff34dcb6cf6d7bd38240d1a6338c282c2601879edd181bc8ac.json`
- `graphify-out/cache/ast/v0.9.25/b4681c506d5057a808b9a261f0f822bb92de6834fd6b9c8ad8e2170221c0fa10.json`
- `graphify-out/cache/ast/v0.9.25/ce66237f3c7b434fb2824cb87e5416f02386361125294585b2ae2f1860209a83.json`
- `graphify-out/cache/ast/v0.9.25/609de4b1331ddb2f8c80e97aac0a5de782a373d6f5af858e10a731c20b35c0e2.json`
- `graphify-out/cache/ast/v0.9.25/00e425133f35ab78ac8286265342efc80e36fcef5bae147d16bdc5b480680669.json`
- `graphify-out/cache/ast/v0.9.25/de1fc6e69dc3cff488a1c1033c4fe9fe31e8ecf35b60dddde0d78ae78597c782.json`
- `graphify-out/cache/ast/v0.9.25/a6b2a223ec5c9f60944738f653fe582b8851ae8e7842c3548ca161438bab7f4e.json`
- `graphify-out/cache/ast/v0.9.25/f0adfc59effb4b1a2768f7f6cec89a577083ef40343d98f407eeed86b9a7dde5.json`
- `graphify-out/cache/ast/v0.9.25/ccd11366ec13aaea4601383b97d9eb4153e86b7de6771d79d3b4ba428fb814fc.json`
- `graphify-out/cache/ast/v0.9.25/bda22eb7b59a8a04c1d241b5669855947806814857e2cf73023d6e7afde78417.json`
- `graphify-out/cache/ast/v0.9.25/9af29701cb5d9c15ece6030feec5b45fae68ad57b60df4776bca6985dcfe66b9.json`
- `graphify-out/cache/ast/v0.9.25/7e2db852c6c4dc78e89bb8e482b351101c68173bc2062c6b271ad429221c7fbb.json`
- `graphify-out/cache/ast/v0.9.25/ed6a5c514548e61e23839264c9151926270cdccfd6e8c5d90e8f4654a1443e36.json`
- `graphify-out/cache/ast/v0.9.25/9cf5d515d0d8584aeef36708df34f560078772a568ed599cac5ba20b089e563d.json`
- `graphify-out/cache/ast/v0.9.25/2b7a211bd23ee4874a52c3396bed74047d2fa136941b47e241e6c3febed162b1.json`
- `graphify-out/cache/ast/v0.9.25/3aa6c01a1a5807b1007f52274a2e9f553c0a5f1d5830f39da42774becc42a933.json`
- `graphify-out/cache/ast/v0.9.25/d7d497766c3a69fe9c2c203308eeef3d187b8bb3f12e613e812e800fd1378079.json`
- `graphify-out/cache/ast/v0.9.25/8cb1dbb82571a28740ec0b94978dfc39d48637a3b6687bd73b85b3927cd17afc.json`
- `graphify-out/cache/ast/v0.9.25/7aa8b606e5c19334b6c9fe62a12fc30eb46c0320d1dbb5726cfda0becdd04a5a.json`
- `graphify-out/cache/ast/v0.9.25/b44f4ef20e43d64fd456c9d06ca878492f7fe40edac37d008c22a89b3fcc2412.json`
- `graphify-out/cache/ast/v0.9.25/bea35a8e8ed70fd3bb9d9d0afd69beaac3f684082ded947bd9d2c89b514f30f4.json`
- `graphify-out/cache/ast/v0.9.25/6c38c6a0e57f59624c03c5011cdce0fa1dd8b050330d94680aafaa8753152e0b.json`
- `graphify-out/cache/ast/v0.9.25/59358a52c8f76c9a6eb0d135bb86f8d73cf4a68aab157678f8c91cbdfdf41ebb.json`
- `graphify-out/cache/ast/v0.9.25/a76dfe8dc3b9c8376762961f765c76123f433562c056b111e7baca0b87dcbfb2.json`
- `graphify-out/cache/ast/v0.9.25/7d545ef79ba1827378b8aacfa0c80c193f53128a0a63c80f5cc83bf5870e762e.json`
- `graphify-out/cache/ast/v0.9.25/f5f9de4aa39eb592338abc37a28cf939897fa95cd560cf24b2059d3f0ed25975.json`
- `graphify-out/cache/ast/v0.9.25/d940b3cb1a0e02e353f3d58b52e8d3b09b3f4710725425733e5058d91fed9b82.json`
- `graphify-out/cache/ast/v0.9.25/bd340da741d7a452b8827a6542a4646d53f60b08edac17d0178f4c82e65b639b.json`
- `graphify-out/cache/ast/v0.9.25/34635905b3f82ed349be9b18e8dcfe76f1ebe09506b915fc6b8f5404f83ec86f.json`
- `graphify-out/cache/ast/v0.9.25/6c3cfe7984e69df7736addddc8182e257d465a50a5cfff738576914052ac00e0.json`
- `graphify-out/cache/ast/v0.9.25/c2952cca5b1d9d94a8ff7cb0a52990bf6a77690896c23db8344e4a680495e165.json`
- `graphify-out/cache/ast/v0.9.25/4d109a033167028d2d28d71beab635eb07367ec95208b85f592b28f68611dff1.json`
- `graphify-out/cache/ast/v0.9.25/63ff70e4de08afcefb4c98b5a6841815a13983236320a7cc81a292ca322e460d.json`
- `graphify-out/cache/ast/v0.9.25/003184c9b728dfc9f401189c2312e9e4ce4939cae84a40ce84f208e20d5785db.json`
- `graphify-out/cache/ast/v0.9.25/877edf79246cb3ff18580be8bfb268d4da68d508c0b8912ed1c169b64f92d668.json`
- `graphify-out/cache/ast/v0.9.25/fdd8f46e701a064254b3eb4ce3228bc851f1ab23b6f055ff60fef03c21a301a8.json`
- `graphify-out/cache/ast/v0.9.25/9d45fa575bcc0977cf449256f64162ae9e3efcfa3b39242ff43600e25f831f4d.json`
- `graphify-out/cache/ast/v0.9.25/4607b0b311b067a755a267c35cbacbdd445095b8be0920e0a68525b60183b2dc.json`
- `graphify-out/cache/ast/v0.9.25/030ccba4995e8bc24fd6ca57c087196eea4058ef3224d8ef755da8706c085d37.json`
- `graphify-out/cache/ast/v0.9.25/27f753b864ff808ac9e5d644de37c8caaa20d511bc8655cc487cb66a9c9f07b7.json`
- `graphify-out/cache/ast/v0.9.25/9b0e7b7db8c163d5bc1a010c58b0e6a5deca672cb4ad4cb9431ff375e41e0d54.json`
- `graphify-out/cache/ast/v0.9.25/ebbdd78fd6e15fab885641d6224f542e48d352f47c1c069553790a0f0d3b5173.json`
- `graphify-out/cache/ast/v0.9.25/33febe6007ebe018ff9807e8300dac3d4d003f5838d084fc9fbd36208acc89c3.json`
- `graphify-out/cache/ast/v0.9.25/37ddd02f8659a6ab0a4449f8dc5ff7079b22446c8066279db54becb0e416aa18.json`
- `graphify-out/cache/ast/v0.9.25/75eac28f42e7ae81eff711c78168aa095cf358ad70d9ecce4015ca6f3f9c6260.json`
- `graphify-out/cache/ast/v0.9.25/5855b57fae260999853938e71894257dbb6dec8319e660fdb6e7f56dac98b9ed.json`
- `graphify-out/cache/ast/v0.9.25/3223133338e0b06a9edb756e712f0ef80a742ff873eeb58bf29637fd640dcb27.json`
- `graphify-out/cache/ast/v0.9.25/1cdc8803b6f9e532579c1a6e7035e60cfb8c33969ac0198b2c8027d742afe7af.json`
- `graphify-out/cache/ast/v0.9.25/163fb69585da7f4f69b018bdbc59aed67aa89561154155f773e6f0769b53bfdb.json`
- `graphify-out/cache/ast/v0.9.25/e867fa59c55373b552ef446e8a848a7a3f04d492841e0c7bb00ac72591ea1ead.json`
- `graphify-out/cache/ast/v0.9.25/9e39bf998f97eccd43e9ceec40c148f9b5efe3cb15f7d5bd3d64e016e1751509.json`
- `graphify-out/cache/ast/v0.9.25/06c5275417dd0c85c7b1d58ec270fc9b5b43f80f4eb067685d9fc351ec87c191.json`
- `graphify-out/cache/ast/v0.9.25/e2d6f057a4ca784634de4b6f596357d9429417edafe85d77f5cc6b74401b2757.json`
- `graphify-out/cache/ast/v0.9.25/95d8fdbdcc3326cf4423fd98bb2e8e95a5d52d6cbb601f2ca1aedf6908abeb44.json`
- `graphify-out/cache/ast/v0.9.25/4da731a9a74e63e8392d2224e01685407558ed3d484ef5002bf18b90ca295af6.json`
- `graphify-out/cache/ast/v0.9.25/073e60a0a2aed43edec4fbb8a8ca628f7ac4399f3b2b969721931a1d85fdbb13.json`
- `graphify-out/cache/ast/v0.9.25/bcaba712b75c053f8e29ee266f11bde7fa5632538bd01ee7f71f29c417484a2d.json`
- `graphify-out/cache/ast/v0.9.25/5f5bfbb2df235995adb7ccac64de129a6c563ac0fd163d696759f102d58e838a.json`
- `graphify-out/cache/ast/v0.9.25/d24fd867d790919017cb38e237a7e3bfb655417fd0c055196018c11d0e401cf9.json`
- `graphify-out/cache/ast/v0.9.25/803a3cfc969feef7f34c387c8546b0a8ad182bc8485118ce0ee320985de65161.json`
- `graphify-out/cache/ast/v0.9.25/74df16a229193dc682a0823255fbe5620a89b3bfe193503fc9bc90413c976674.json`
- `graphify-out/cache/ast/v0.9.25/46c7f35933315ab1e8d2853c5930c531d8bf447a8503c5961c4a40b07756c176.json`
- `graphify-out/cache/ast/v0.9.25/c9a2ab4e9cd70a1a1f70e17c44c1450caac07d21dc370e9559298ac93f6c0ccd.json`
- `graphify-out/cache/ast/v0.9.25/9f20d4a8e2ca1dd4b61a695d6f7f766cf6f7a5a6a97b1a4daca5bb76364b2fac.json`
- `graphify-out/cache/ast/v0.9.25/e00b1186ab0bd00252146bc899d179a3e68b16e85666217c1d56f109a4323eb0.json`
- `graphify-out/cache/ast/v0.9.25/c6f7fc2f062904d246b700d446ba3ad03e77f41809b12eccfb5e090a11f4fad2.json`
- `graphify-out/cache/ast/v0.9.25/7c7827f2f29d6e2cb6cc6902558dac08380f60c414b4968f83e1bc4e61b3e268.json`
- `graphify-out/cache/ast/v0.9.25/ab2b1b4e0b5cf484189067dcc9b539db725d208574c597d1f944b75899f34fde.json`
- `graphify-out/cache/ast/v0.9.25/53160bf1ea358dc47db1b0fa795177d51c3c1082461526a584c91bcbfaf3f121.json`
- `graphify-out/cache/ast/v0.9.25/cb5e2f3284265c08c88c08f445b96958b13a9115c0afc0a33206c293d1b1c187.json`
- `graphify-out/cache/ast/v0.9.25/6a430cbcf1d181ff73841efdef9346cc8c10478901910b3eb6965129ee66050f.json`
- `graphify-out/cache/ast/v0.9.25/fe4c5e9534a9e7a46e9bb7df6cf3e33264a8cfd08d2f10e7c340f64386793f57.json`
- `graphify-out/cache/ast/v0.9.25/d474d295a9284f81e659bcab7c8fa50ca99e66ba7605b77848a8d5b475010168.json`
- `graphify-out/2026-08-01/graph.json`
- `graphify-out/2026-08-01/.graphify_labels.json`
- `graphify-out/2026-08-01/GRAPH_REPORT.md`
- `graphify-out/2026-08-01/manifest.json`
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
