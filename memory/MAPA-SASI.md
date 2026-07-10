# MAPA DO SASI — inventário do repositório

> Gerado automaticamente em 10-jul-2026 por `memory/scripts/build_sasi_index.py`.
> Fonte de verdade: `sasi_index.db` (SQLite). Doutrina ZERO ALUCINAÇÃO: só fato lido do disco.
> Regenerar: `python3 memory/scripts/build_sasi_index.py` (a partir da raiz do repo).

**Total:** 374 arquivos · 8.2 MB · 162,665 linhas · 505,713 tokens (excluídos `.git`, `node_modules`, `sasi_index.db`).

## Por categoria

| Categoria | Arq | Linhas | Tokens | O que é |
|---|---:|---:|---:|---|
| `other` | 134 | 127,525 | 345,521 | Sem categoria (revisar regras) |
| `frontend_src` | 67 | 13,467 | 51,233 | App React+Vite+TS — `frontend/src/` |
| `build_artifact` | 41 | 2,539 | 42,259 | **Ruído gerado** — `dist/` de front e mcp |
| `claude_config` | 13 | 1,588 | 10,680 | `.claude/` (rules) |
| `db_migration` | 16 | 2,376 | 10,528 | Migrations SQL — `supabase/migrations/` |
| `frontend_config` | 19 | 5,289 | 10,116 | Configs do front (package-lock, vite, tsconfig) |
| `mcp_src` | 11 | 1,813 | 7,998 | Código-fonte MCP — `mcp-server/src/` |
| `supabase_config` | 14 | 2,027 | 7,361 | Config Supabase (config.toml, seed) |
| `mcp_config` | 8 | 3,223 | 6,227 | Config do MCP server |
| `project_memory` | 9 | 1,121 | 5,644 | Esta pasta `memory/` |
| `root_config` | 10 | 682 | 3,562 | CLAUDE.md, README, .env.example, .mcp.json |
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
| `frontend/src/components` | 31 | 7,728 |
| `frontend/src/lib` | 14 | 3,293 |
| `frontend/src` | 4 | 682 |
| `frontend/src/hooks` | 4 | 633 |
| `frontend/src/components/clinical` | 8 | 575 |
| `frontend/src/components/janelas` | 6 | 556 |

### Maiores arquivos de código/texto

- `graphify-out/2026-07-06/graph.json` — 30,557 linhas (`other`)
- `graphify-out/2026-07-10/graph.json` — 30,557 linhas (`other`)
- `graphify-out/2026-07-03/graph.json` — 30,143 linhas (`other`)
- `graphify-out/graph.json` — 25,719 linhas (`other`)
- `packages/clinical-engine/package-lock.json` — 2,465 linhas (`other`)
- `frontend/src/components/FichaCompleta.tsx` — 1,693 linhas (`frontend_src`)
- `graphify-out/2026-07-06/manifest.json` — 1,302 linhas (`other`)
- `graphify-out/2026-07-10/manifest.json` — 1,302 linhas (`other`)

### Outros núcleos

- **MCP** → `mcp-server/src/` — ponte skills→MCP→Supabase
- **Backend** → `supabase/migrations/` + `supabase/functions/`
- **Motor clínico v2** → `docs/motor-clinico-v2/`
- **Design system** → `design-system/` (inclui fonts .woff/.woff2 sem contagem de linhas)

## Memória do projeto (`memory/`)

- `memory/MAPA-SASI.md` — 224 linhas
- `memory/MEMORY.md` — 62 linhas
- `memory/notes/STATUS.md` — 285 linhas
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

- `graphify-out/graph.json`
- `graphify-out/.graphify_labels.json`
- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/.graphify_root`
- `graphify-out/graph.html`
- `graphify-out/manifest.json`
- `graphify-out/2026-07-06/graph.json`
- `graphify-out/2026-07-06/.graphify_labels.json`
- `graphify-out/2026-07-06/GRAPH_REPORT.md`
- `graphify-out/2026-07-06/manifest.json`
- `graphify-out/2026-07-10/graph.json`
- `graphify-out/2026-07-10/.graphify_labels.json`
- `graphify-out/2026-07-10/GRAPH_REPORT.md`
- `graphify-out/2026-07-10/manifest.json`
- `graphify-out/cache/stat-index.json`
- `graphify-out/cache/ast/v0.9.5/9e4d3c3991a990970aea9de6686830188080516455c06418d3c2f64822d272bd.json`
- `graphify-out/cache/ast/v0.9.5/18c0deaa1bbb38c6a255685be169a95b710d5b1290430839ffd0d54ac97c78e2.json`
- `graphify-out/cache/ast/v0.9.5/e02a17f2f316f3ee13076ae8bda7d0db3c6113022bb9611cc726d7e0f93ac077.json`
- `graphify-out/cache/ast/v0.9.5/1d5afbaccf36e952e71082591edfc9e4fbd9946eb85b01855a1d0bd810b7623d.json`
- `graphify-out/cache/ast/v0.9.5/cd0c5233a50e06048e203216e487b13bee929636974266020924ea8780425353.json`
- `graphify-out/cache/ast/v0.9.5/7328ef267c21a0ecf7996b505e0424edf844c3fa84b8bd2a17089fe895e2e04d.json`
- `graphify-out/cache/ast/v0.9.5/79d0a9cc5c907eff34dcb6cf6d7bd38240d1a6338c282c2601879edd181bc8ac.json`
- `graphify-out/cache/ast/v0.9.5/d634e64e872e38b279bf62008dbe5f286ae7a56a8d6eadcaaadaae69a91ed4a3.json`
- `graphify-out/cache/ast/v0.9.5/ce66237f3c7b434fb2824cb87e5416f02386361125294585b2ae2f1860209a83.json`
- `graphify-out/cache/ast/v0.9.5/ee83d66f3586bb9cf40edc6b1fd9b649dd512ff88ca84f75cd3765b058a9784d.json`
- `graphify-out/cache/ast/v0.9.5/770696e7ec3cb52efd5d4b0a2c25037d8f2d8f795f8f50f4c1e9a3972d358c40.json`
- `graphify-out/cache/ast/v0.9.5/04bc54bcd2229e460b111b54299392ba795d2b404341db2d2ed9afbf5613e0b3.json`
- `graphify-out/cache/ast/v0.9.5/10b853efc53213d1f171ecdc2ace8fa8388a1b810401871f31500f9416a4bf0f.json`
- `graphify-out/cache/ast/v0.9.5/609de4b1331ddb2f8c80e97aac0a5de782a373d6f5af858e10a731c20b35c0e2.json`
- `graphify-out/cache/ast/v0.9.5/d55e73fa677145af37cf698373ccfad82b06e86c76c5599988d7b8bcd14ddf5b.json`
- `graphify-out/cache/ast/v0.9.5/f0adfc59effb4b1a2768f7f6cec89a577083ef40343d98f407eeed86b9a7dde5.json`
- `graphify-out/cache/ast/v0.9.5/cc312a3fa2fe33f9c0e03d2a770387e3795b32a3b57fc4bd48506391450a5de6.json`
- `graphify-out/cache/ast/v0.9.5/dee820396c34c0516479cd69ae2bf9cf7fd5cac3b16b3ab7523a32040d61ab31.json`
- `graphify-out/cache/ast/v0.9.5/85a1ac97b2160dcfea29eedfb4d1fde0265bb46340a6ef3d78529ab557efb168.json`
- `graphify-out/cache/ast/v0.9.5/efd5f0e0ddcfb50d1da4249ce6d814795081f0d5bf344e65c4b3d8f3a5ba2b43.json`
- `graphify-out/cache/ast/v0.9.5/7e2db852c6c4dc78e89bb8e482b351101c68173bc2062c6b271ad429221c7fbb.json`
- `graphify-out/cache/ast/v0.9.5/60814859c496d1bf2069f0d5cd1fc833d59df06c590f377114d7ea62ecc4419a.json`
- `graphify-out/cache/ast/v0.9.5/15281be32da564f27626c76db3857d51b093754883029dcd9dc36fde35627897.json`
- `graphify-out/cache/ast/v0.9.5/aeaa124950235f9129de226268b386f6e9598e3540122798488cd38d9764c7c2.json`
- `graphify-out/cache/ast/v0.9.5/ed6a5c514548e61e23839264c9151926270cdccfd6e8c5d90e8f4654a1443e36.json`
- `graphify-out/cache/ast/v0.9.5/9cf5d515d0d8584aeef36708df34f560078772a568ed599cac5ba20b089e563d.json`
- `graphify-out/cache/ast/v0.9.5/e03887840576c82ce7c8bf6f809b09643d84993a8bb57366e5f23954028ad13d.json`
- `graphify-out/cache/ast/v0.9.5/8cb1dbb82571a28740ec0b94978dfc39d48637a3b6687bd73b85b3927cd17afc.json`
- `graphify-out/cache/ast/v0.9.5/401dca2c94f6238f539c97294f0ca328de2c12332cf8358bbee9b0ddf3cb0c96.json`
- `graphify-out/cache/ast/v0.9.5/7aa8b606e5c19334b6c9fe62a12fc30eb46c0320d1dbb5726cfda0becdd04a5a.json`
- `graphify-out/cache/ast/v0.9.5/a1d7f19421c73d6aa33dd7ac4d0aff7054aa45cc7a4c7996a1666c2c165eceba.json`
- `graphify-out/cache/ast/v0.9.5/ccd7c9daf80c91fca159c2aa70f235b451e2fd72470611a0dedf8d50be05765a.json`
- `graphify-out/cache/ast/v0.9.5/011a2e82364ef3192ec962af3a2cbaaa95cb956365f1812e350a4fcd3f5ce53d.json`
- `graphify-out/cache/ast/v0.9.5/ce504410f54216a0b1af6a4bdf3cbdc95ba26e4ced7b407cf5bca03bf99927da.json`
- `graphify-out/cache/ast/v0.9.5/f4162db913c5a853eb8f65e696dab15f2b8492105938fb1b1a1e382bd1f87380.json`
- `graphify-out/cache/ast/v0.9.5/6e5acab40e3c51e540d71e31d6a789148d0e66e2ec2fe477f30cfd1424d94179.json`
- `graphify-out/cache/ast/v0.9.5/7d545ef79ba1827378b8aacfa0c80c193f53128a0a63c80f5cc83bf5870e762e.json`
- `graphify-out/cache/ast/v0.9.5/f5f9de4aa39eb592338abc37a28cf939897fa95cd560cf24b2059d3f0ed25975.json`
- `graphify-out/cache/ast/v0.9.5/bd340da741d7a452b8827a6542a4646d53f60b08edac17d0178f4c82e65b639b.json`
- `graphify-out/cache/ast/v0.9.5/8239ecfb3b1732028e87ff3e02c6bfb4da741687782c3c7910a4cbbbff613f00.json`
- `graphify-out/cache/ast/v0.9.5/a8f1eb08cf69e633f8dabd814aabc0654b5860b2eb876d220e47c9aac91a04a3.json`
- `graphify-out/cache/ast/v0.9.5/402ce63d030659b2bdf71fa5cb7e27b919e558ab182a8ac3d1b1cbb060b17ca6.json`
- `graphify-out/cache/ast/v0.9.5/13f5714d4ac4b01451e94de9f7acf47ddc4a88af706a5d257dd14ac98db450a7.json`
- `graphify-out/cache/ast/v0.9.5/4d109a033167028d2d28d71beab635eb07367ec95208b85f592b28f68611dff1.json`
- `graphify-out/cache/ast/v0.9.5/1544726ea407ef0f4a6e67769fb71ecf66197195bf88faefa63106d8717065cf.json`
- `graphify-out/cache/ast/v0.9.5/63ff70e4de08afcefb4c98b5a6841815a13983236320a7cc81a292ca322e460d.json`
- `graphify-out/cache/ast/v0.9.5/a814de19e46afebc7b6756cd490fc966758350504a415bf4b198a9c95d7cbc18.json`
- `graphify-out/cache/ast/v0.9.5/003184c9b728dfc9f401189c2312e9e4ce4939cae84a40ce84f208e20d5785db.json`
- `graphify-out/cache/ast/v0.9.5/04928da8520943643413d8ffbf0a931912ad0ac58ecb9e8fa434a3b0618257af.json`
- `graphify-out/cache/ast/v0.9.5/4b8d32e74e5207b2ef94739c7fc6b734403e00d14b24b253affa4d4d8599552b.json`
- `graphify-out/cache/ast/v0.9.5/721011ae450afe2432dde4c0fcca50662e360ef061b0825c06c3cf4d0dfcd991.json`
- `graphify-out/cache/ast/v0.9.5/d75b3801756fddf75d68489df77d80e6776659f064a30bbaf90556bbee8d96f5.json`
- `graphify-out/cache/ast/v0.9.5/4607b0b311b067a755a267c35cbacbdd445095b8be0920e0a68525b60183b2dc.json`
- `graphify-out/cache/ast/v0.9.5/97c2dffb6e3628760ff1ba6bb9985aea717a08d276b23401132cc8659b486314.json`
- `graphify-out/cache/ast/v0.9.5/27f753b864ff808ac9e5d644de37c8caaa20d511bc8655cc487cb66a9c9f07b7.json`
- `graphify-out/cache/ast/v0.9.5/23819769cd35f38b7e8701eff0037625721e774bf4f37d1195b2e45b7f819a43.json`
- `graphify-out/cache/ast/v0.9.5/37ddd02f8659a6ab0a4449f8dc5ff7079b22446c8066279db54becb0e416aa18.json`
- `graphify-out/cache/ast/v0.9.5/f7713e6e84f6098d65de632e54191032c9be8f50064dfc520a8254723ac7f2cc.json`
- `graphify-out/cache/ast/v0.9.5/ef5e043f50e9a7cc408d5e92a259042a8afe9d2ef266873c04c4d1c19e46066c.json`
- `graphify-out/cache/ast/v0.9.5/8d9bda1198816f74fea96906b161e0b833af0e223bfb1e9e048096a771574de7.json`
- `graphify-out/cache/ast/v0.9.5/3223133338e0b06a9edb756e712f0ef80a742ff873eeb58bf29637fd640dcb27.json`
- `graphify-out/cache/ast/v0.9.5/1cdc8803b6f9e532579c1a6e7035e60cfb8c33969ac0198b2c8027d742afe7af.json`
- `graphify-out/cache/ast/v0.9.5/e2d6f057a4ca784634de4b6f596357d9429417edafe85d77f5cc6b74401b2757.json`
- `graphify-out/cache/ast/v0.9.5/7894b10dd4315f3355843abe4a955db93ff7d32afaf8db8bbb9c6a6220c4b754.json`
- `graphify-out/cache/ast/v0.9.5/95d8fdbdcc3326cf4423fd98bb2e8e95a5d52d6cbb601f2ca1aedf6908abeb44.json`
- `graphify-out/cache/ast/v0.9.5/79f9c88529499aafc1eecc03a4a38708aa78d5ffe052375090d2c6dda6d160e4.json`
- `graphify-out/cache/ast/v0.9.5/717eb6b5d54a8c3350f0577ff003f54e3efee496765192f27c3e1382e12b0fd1.json`
- `graphify-out/cache/ast/v0.9.5/4da731a9a74e63e8392d2224e01685407558ed3d484ef5002bf18b90ca295af6.json`
- `graphify-out/cache/ast/v0.9.5/e9159820f8d3397bf7017ea30e8175d78e6b0224e5f71af9cd0389c6c3c94b02.json`
- `graphify-out/cache/ast/v0.9.5/a1447b28bdc230457c7212edcd43a58b977365b1a01d50e1189f413a0dda0af6.json`
- `graphify-out/cache/ast/v0.9.5/67ec9b90db5cf063704fdd7de25f42491a3d18dc40bd6b2bdb01dd50be0d5667.json`
- `graphify-out/cache/ast/v0.9.5/4e354d6aa85d4333adce5eede5859e9238252b74aed10dde7092662cc5a85129.json`
- `graphify-out/cache/ast/v0.9.5/803a3cfc969feef7f34c387c8546b0a8ad182bc8485118ce0ee320985de65161.json`
- `graphify-out/cache/ast/v0.9.5/04107aa082a910e19c031106770a85369c9685561015f8c63130ca22236675d3.json`
- `graphify-out/cache/ast/v0.9.5/072a81a21567ce114e7b747ddee937aeb7bf954b4e28bb5ac808cb28b8b6eea6.json`
- `graphify-out/cache/ast/v0.9.5/8ebc5789359c71080556e8276a9027a6e2cfd377d1a6c317617f429ee9b486b5.json`
- `graphify-out/cache/ast/v0.9.5/46c7f35933315ab1e8d2853c5930c531d8bf447a8503c5961c4a40b07756c176.json`
- `graphify-out/cache/ast/v0.9.5/ff1f67fadda181953975eac66d285bd980dddfadfe4ddb8f1997335ea907fdbc.json`
- `graphify-out/cache/ast/v0.9.5/9f20d4a8e2ca1dd4b61a695d6f7f766cf6f7a5a6a97b1a4daca5bb76364b2fac.json`
- `graphify-out/cache/ast/v0.9.5/c0561b6414acf14a6e9422280f573ff0ad35e00983af4041e4b8381557e7aa6c.json`
- `graphify-out/cache/ast/v0.9.5/e00b1186ab0bd00252146bc899d179a3e68b16e85666217c1d56f109a4323eb0.json`
- `graphify-out/cache/ast/v0.9.5/44e013a4e3a7acf8e5ef83309aeb63b5764a9346182fbc5389f0474cfd95a71e.json`
- `graphify-out/cache/ast/v0.9.5/2dac013826a8e9a5b80e254d22f6b7c655dec66c52f8f903aa6fff94c082ddc8.json`
- `graphify-out/cache/ast/v0.9.5/7ed5b532fd39bd4dc6f1c95bff2f398e6f91c197525c2b35d0d4d903df4855b8.json`
- `graphify-out/cache/ast/v0.9.5/c6f7fc2f062904d246b700d446ba3ad03e77f41809b12eccfb5e090a11f4fad2.json`
- `graphify-out/cache/ast/v0.9.5/7c7827f2f29d6e2cb6cc6902558dac08380f60c414b4968f83e1bc4e61b3e268.json`
- `graphify-out/cache/ast/v0.9.5/881162d3211c92173a6cd3ea27b67483fe755a206f9726b8abb10618db36831c.json`
- `graphify-out/cache/ast/v0.9.5/896071c40d0b02de04e53db81b77a6dbc064c1a884762594d2a81db495017742.json`
- `graphify-out/cache/ast/v0.9.5/eee7b7e094921fcb72ca4ca282eea13a2f8c3c38484fb68ff19acbe1175ea572.json`
- `graphify-out/cache/ast/v0.9.5/b19591c4db16769219ec281e3d126c4b5c2532beb0ff6653ac5a590bf583634d.json`
- `graphify-out/cache/ast/v0.9.5/792597c87ab4a9179c5047a42e6b8668b8301e9ba704e85fdf57dce6c89fe960.json`
- `graphify-out/cache/ast/v0.9.5/0aea6ca2f224abba6d8c0aab4647700a8e04ecaf0b5cbcb7485a044343df8118.json`
- `graphify-out/cache/ast/v0.9.5/cb5e2f3284265c08c88c08f445b96958b13a9115c0afc0a33206c293d1b1c187.json`
- `graphify-out/cache/ast/v0.9.5/fe4c5e9534a9e7a46e9bb7df6cf3e33264a8cfd08d2f10e7c340f64386793f57.json`
- `graphify-out/cache/ast/v0.9.5/65e2b656c1478051be880ec46282624ba5c5f317939d5bf3f9857343955a272e.json`
- `graphify-out/cache/ast/v0.9.5/4316f9a851157c8e0d824dcf30683e23ff512de552f037878b7c6039eab86caf.json`
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
