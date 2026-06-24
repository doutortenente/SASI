# Guia JetBrains (WebStorm / IntelliJ) — SASI

> Montando máquina nova? Comece pelo [SETUP.md](SETUP.md) e volte aqui para o IDE.

Este repositório versiona config JetBrains em `.idea/` (módulo, ESLint, code style,
run configurations). Arquivos por-usuário (`workspace.xml`, `shelf/`) ficam no
`.idea/.gitignore` — não commitar.

## Qual IDE

| IDE | Serve? |
|---|---|
| **WebStorm** | ✅ Recomendado |
| **IntelliJ IDEA Ultimate** | ✅ Sim (plugin JavaScript) |
| IntelliJ IDEA **Community** | ❌ Sem suporte pleno JS/TS |

## Abrindo o projeto

1. `File > Open` → raiz do repo **`SASI/`** (`~/dev/sasi`), não `frontend/` isolado.
2. Instale dependências:

   ```bash
   cd frontend && npm install
   cd ../mcp-server && npm install
   ```

3. Node >= 18 em `Settings > Languages & Frameworks > Node.js`.

## Run configurations

Dropdown superior direito:

- **frontend**: `dev`, `build`, `typecheck`, `preview`
- **mcp-server**: `dev`, `build`, `clean`, `start`

Equivalem a `npm run <script>` em `frontend/` ou `mcp-server/`.

## Tailwind

Suporte nativo no WebStorm/IDEA Ultimate (`frontend/tailwind.config.js`).