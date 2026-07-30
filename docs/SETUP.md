# Setup de máquina nova — SASI

Checklist para deixar um PC pronto para desenvolver o SASI (frontend + MCP + Supabase).

## Essenciais

| App | Para quê |
|---|---|
| **Node.js 24 LTS** | Frontend Vite + MCP server |
| **Git** | Controle de versão |
| **WebStorm** ou **IntelliJ IDEA Ultimate** | IDE — run configs em `~/projetos/.idea/runConfigurations/` |

## Recomendados

| App | Para quê |
|---|---|
| **Claude Code** | Assistente no repo |
| **Supabase CLI** | `npm i -g supabase` |
| **Chrome/Edge** + React DevTools | Debug frontend |

## Primeira configuração

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

git clone https://github.com/doutortenente/SASI.git
cd SASI
cd frontend && npm install
cd ../mcp-server && npm install
```

## Variáveis de ambiente

O cofre canônico é `~/projetos/.env` (symlink `sasi/.env` aponta pra ele). Chaves mínimas:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

Nunca commitar `.env`.

## Conferindo

```bash
cd frontend && npm run dev        # http://localhost:5173
cd frontend && npm run typecheck
```

Ou use as run configs `frontend: dev` e `frontend: typecheck` no WebStorm.

## Workspace ~/projetos/

Na máquina do Dr. Tenente, o SASI vive em `~/projetos/sasi` junto com repos irmãos
(`claude`, `memory`, `scripts`). Skills canônicas: `~/projetos/claude/skills`
(symlink `~/.claude/skills`).
