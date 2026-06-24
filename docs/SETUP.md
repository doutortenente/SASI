# Setup de máquina nova — SASI

Checklist para deixar um PC pronto para desenvolver o SASI (frontend + MCP + Supabase).

## Essenciais

| App | Para quê |
|---|---|
| **Node.js LTS** (>= 18) | Frontend Vite + MCP server |
| **Git** | Controle de versão |
| **WebStorm** ou **IntelliJ IDEA Ultimate** | IDE — configs em `.idea/` |

Ver [JETBRAINS.md](JETBRAINS.md) para run configurations.

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

Criar `.env` em `frontend/`:

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

## Workspace ~/dev/

Na máquina do Dr. Tenente, o SASI vive em `~/dev/sasi` junto com repos irmãos
(`claude`, `jarvis`, `memory`). Skills canônicas: `~/dev/claude/skills`
(symlink `~/.claude/skills`).