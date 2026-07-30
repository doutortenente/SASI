# SASI Frontend

React + Vite + TypeScript + Tailwind. Deploy: **Vercel** (`sasi-uti.vercel.app`).

**Uso pessoal** — operador único (Dr. Nicolas). Sem login/OAuth em produção.

## Setup

```bash
cp .env.example .env.local   # VITE_SUPABASE_* 
npm install
npm run dev                  # http://localhost:5173 — entra direto no Dashboard
```

## Arquitetura

```
┌──────────────────────┐
│ Claude (plantão)     │
│ skill sasi-ingest-   │──► JSON validado
│ export               │
└──────────┬───────────┘
           │ "deploy" / "salvar no Supabase"
           ▼
┌──────────────────────┐         Realtime
│ MCP sasi-mcp-server  │──INSERT──►┌─────────────────┐
│ (local, service role)│           │ Supabase Postgres│
└──────────────────────┘           └────────┬────────┘
                                            │
                                            ▼
                                   ┌─────────────────┐
                                   │ Este frontend   │
                                   │ 5 janelas UTI   │
                                   └─────────────────┘
```

**Não há:** pipeline OCR automático, AppSheet, POST em `/ocr-ingest` no fluxo diário.

## Fluxo operacional

1. **Foto/PDF/texto** → Claude com skill `sasi-ingest-export` → JSON
2. Revisar → **"salvar no Supabase"** → MCP grava
3. Dashboard atualiza sozinho (Realtime)

## Comandos

```bash
npm run dev
npm run build
npm run typecheck
```