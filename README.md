# SASI — Comando UTI

Dashboard de UTI do Dr. Nicolas Nagaita (33 leitos — UTI 2/3/4, São Caetano do Sul).
Ferramenta **pessoal** de plantão — não é produto hospitalar multi-usuário.
Produção: **https://sasi-uti.vercel.app** (deploy automático a cada merge na `main`).

## O que cada pasta é

| Pasta | Papel |
|---|---|
| `sasi-v2/` | **As telas do app** — Next.js 15 + React 19 + TypeScript + Zustand. War Room · ficha do paciente (abas) · folhão de labs · round · passagem. **É esta a pasta que a Vercel publica** (Root Directory = `sasi-v2`) |
| `mcp-server/` | **O garçom de dados** — recebe as extrações clínicas das skills e grava no banco (`sasi_deploy_ingest`, `sasi_sitrep`) |
| `supabase/` | **O banco** — schema (modelo v3, 30-jul-2026), migrations, edge functions, queries de plantão |
| `doctrine/` | Só o template-base clínico v2 (Ramo C), compartilhado pelas skills `admissao-uti` e `sasi-ingest-export` |
| `docs/` | Guias de operação: `AGENTS.md` (subagentes) e `SETUP.md` (ambiente) |
| `memory/` | Índice do repo pro Claude (`MAPA-SASI.md`; regenerar: `python3 ~/projetos/scripts/indices/build_sasi_index.py`) |

Scripts de infra (auditoria de eventos, wrapper MCP) moram fora do repo: `~/projetos/scripts/sasi/`.

## Rodar

```bash
cd sasi-v2 && npm install && npm run dev   # app local em http://localhost:3000
npm run build                              # verificação (Node 20+)
```

## Onde mora o resto (fonte única por categoria)

- **Doutrina/conhecimento clínico** (decisões, SOFA-ruleset, Vera, backlog): vault `celebro` → `conhecimento/projetos/sasi-*.md`
- **Rascunhos e staging de design** (design-system, motor-clinico-v2): `~/projetos/rascunhos/`
- **App antigo (`frontend/`, React+Vite) e `packages/` (clinical-engine + design-system)**: aposentados na faxina de 31-jul-2026. Continuam recuperáveis pela tag `pre-faxina-2026-07-31` e pela branch `archive/frontend-e-packages`.
- **Histórico antigo** ("fases", protótipos, experimentos pré-Supabase, qualquer menção a Firebase): repo morto `sasi-import` no GitHub — **nada disso faz parte deste app**, que nasceu e vive em Supabase

_Atualizado: 31-jul-2026._
