# SASI — Comando UTI

Folha de plantão da UTI 2 (13 leitos) do Dr. Nicolas Nagaita. Ferramenta **pessoal** de plantão, sem login.
Produção: **https://sasi-uti.vercel.app** (cada merge na `main` publica).

## O que cada pasta é

| Pasta | Papel |
|---|---|
| `app/` | **O app**: Next.js 15 + React 19 + TypeScript. Telas Cards, Round, Tabela, Passagem, Exames e Evolução, no design "Comando UTI · Folha de plantão". **É a pasta que a Vercel publica** (Root Directory = `app`) |
| `supabase/` | **O banco**: migrações (mesmo carimbo do banco vivo), retrato do esquema, consultas de plantão e moldes |
| `mcp-server/` | **O garçom de dados**: recebe as extrações clínicas das skills e grava no banco (`sasi_deploy_ingest`, `sasi_sitrep`) |
| `doctrine/` | Template-base clínico (Ramo C), compartilhado pelas skills `admissao-uti` e `sasi-ingest-export` |
| `memory/` | Estado do projeto (`notes/STATUS.md`) e índice para o Claude |

## Rodar

```bash
cd app && cp .env.example .env.local   # preencher a chave pública do Supabase
npm install && npm run dev             # http://localhost:3000
npm run build                          # conferência (Node 20+)
```

## Onde está cada regra

- Regras do design e do banco: `CLAUDE.md` §3 e §4.
- Estado atual e pendências: `memory/notes/STATUS.md`.
- Histórico antigo (app React+Vite e pacotes): tag `pre-faxina-2026-07-31` e branch `archive/frontend-e-packages`.

_Atualizado: 22-nov-2026._
