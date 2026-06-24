# SASI — Sistema de Auditoria e Síntese Intensiva

Ferramenta **pessoal** de gestão clínica para o Dr. Nicolas Nagaita
(33 leitos — UTI 2/3/4). Uso solo em plantão — não é produto hospitalar multi-usuário.
Documentação clínica + suporte à decisão; ingest via **Claude → JSON → Supabase**.

> Toda documentação clínica é em **Português do Brasil**. Doutrina inviolável
> (zero alucinação, ortogonalidade de eixos, sinais vitais Max–Min, conduta 1:1):
> ver [`CLAUDE.md`](CLAUDE.md) e [`docs/AGENTS.md`](docs/AGENTS.md).

## Estrutura (monorepo)

```text
SASI/
├── frontend/      React + Vite + TypeScript + Tailwind  → deploy Netlify
├── mcp-server/    MCP server (Node + TS) — ferramentas IA p/ Supabase
├── supabase/      Backend — migrations (ocr-ingest legado, não usar)
├── doctrine/      Doutrina clínica (Ramo C): templates + skills
├── docs/          STATUS.md · AGENTS.md · SETUP.md
├── CLAUDE.md      Briefing operacional para IA
└── .mcp.json      Servidores MCP (Supabase + sasi)
```

## Stack

- **Frontend:** React + TypeScript + Tailwind + Vite — deploy **Netlify** (base `frontend/`).
- **Backend:** Supabase (PostgreSQL 17, projeto `idswehsvvqczzkiatuzu`, `sa-east-1`).
- **Ingest:** skill `sasi-ingest-export` → JSON → MCP (`deploy`).
- **Edge Functions:** `ocr-ingest` legado — não usar no fluxo diário.

## Comandos

```bash
# Frontend
cd frontend && npm install && npm run dev      # dev server (Vite, :5173)
cd frontend && npm run build                   # build de produção → dist/

# MCP server
cd mcp-server && npm install && npm run build

# Supabase (Edge Functions locais)
supabase functions serve
```

## Setup

Copie `.env.example` → `frontend/.env` e `mcp-server/.env`, preencha as chaves
(nunca commitar). Ver [`docs/SETUP.md`](docs/SETUP.md).

---

Parte da família de repos em `~/dev/`. Índice do workspace: `~/dev/CLAUDE.md` e `memory/MAPA-DEV.md`.
