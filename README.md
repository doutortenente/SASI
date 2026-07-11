# SASI — Comando UTI

Dashboard de UTI do Dr. Nicolas Nagaita (33 leitos — UTI 2/3/4, São Caetano do Sul).
Ferramenta **pessoal** de plantão — não é produto hospitalar multi-usuário.
Produção: **https://sasi-uti.netlify.app** (deploy automático a cada merge na `main`).

## O que cada pasta é

| Pasta | Papel |
|---|---|
| `frontend/` | **As telas do app** — React + Vite + TypeScript. 5 janelas: Leitos · EixoTempo/HPMA · EixoEstado/Terapias · Problema→Ação · Passagem de Turno |
| `mcp-server/` | **O garçom de dados** — recebe as extrações clínicas das skills e grava no banco (`sasi_deploy_ingest`, `sasi_sitrep`) |
| `packages/` | **O motor clínico** — `clinical-engine`: SOFA, parse de números pt-BR; testes Vitest |
| `supabase/` | **O banco** — schema (baseline 26-jun-2026), migrations, edge functions |
| `doctrine/` | Só o template-base clínico v2 (Ramo C), compartilhado pelas skills `admissao-uti` e `sasi-ingest-export` |
| `docs/` | Guias de operação: `AGENTS.md` (subagentes) e `SETUP.md` (ambiente) |
| `memory/` | Índice do repo pro Claude (`MAPA-SASI.md`; regenerar: `python3 memory/scripts/build_sasi_index.py`) |
| `scripts/` | `audit_eventos.py` — auditoria da fila de revisão de eventos clínicos |

## Rodar

```bash
cd frontend && npm run dev        # app local em http://localhost:5173
npm run build | typecheck | lint  # verificações (Node 24 — ver netlify.toml)
```

## Consultar o repo sem abrir arquivo por arquivo

```bash
graphify query "<pergunta>"       # grafo de conhecimento em graphify-out/ (auto-atualiza a cada commit)
```

## Onde mora o resto (fonte única por categoria)

- **Doutrina/conhecimento clínico** (decisões, SOFA-ruleset, Vera, backlog): vault `celebro` → `conhecimento/projetos/sasi-*.md`
- **Rascunhos e staging de design** (design-system, motor-clinico-v2): `~/dev/_lab/`
- **Histórico antigo** ("fases", protótipos, experimentos pré-Supabase, qualquer menção a Firebase): repo morto `sasi-import` no GitHub — **nada disso faz parte deste app**, que nasceu e vive em Supabase

_Atualizado: 11-jul-2026._
