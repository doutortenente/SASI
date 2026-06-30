# Secretária — handoff sessão 24-jun-2026

> Consolidado por agente `secretaria` a pedido do operador.  
> Fonte: `git log`, arquivos no disco, transcript da sessão Grok/Claude Code.  
> **Repos sincronizados:** `sasi` @ `779741a` = `origin/main`; `claude` @ `35df460` = `origin/main`.

---

## Resumo executivo

| Área | Resultado |
|------|-----------|
| Ficha ↔ Supabase | 6 fixes mergeados em `main` + migration `07` aplicada no Postgres remoto |
| Plano SASI executável | Fase A parcial (MCP deploy + template v2); Fase B parcial (7 testes); Fase C script auditoria |
| Bundle `Files_to_claudecode` | Staging + promoções; decisões em `docs/import/DECISOES.md` |
| Push/merge | Tudo em `main` remoto; branch `fix/ficha-supabase-sync` removida localmente |
| Pendente | CI ampliado (scope `workflow`), schema dump, smoke plantão, 24 eventos review |

---

## Agentes e subagentes — o que fizeram

### Sessão principal (orquestrador + subagent-driven development)

| Agente / papel | Repo | Entrega | Evidência |
|----------------|------|---------|-----------|
| Implementer Ficha↔Supabase | `sasi` | `handleSave` deps síntese; `data_adm`; `riscos` → `evolucoes`; sync props; realtime `pendencias` | `19586a8`…`5ff7e93` |
| Implementer schema | `sasi` | Migration `07` + `database.types.ts` (colunas JSONB síntese) | `dc45f4f`, arquivo `07_evolucoes_synthesis_columns.sql` |
| Planner | `sasi` | Plano `docs/superpowers/plans/2026-06-24-sasi-executavel.md` | `8e09cf4` |
| Implementer MCP | `sasi` | Tool `sasi_deploy_ingest` (`ingest-deploy.ts`) | `779741a`, `mcp-server/src/tools/ingest-deploy.ts` |
| Implementer clinical-engine | `sasi` | `parseBR`, `sofaDisplay`, compat layer, **7 testes Vitest** | `packages/clinical-engine/`, `779741a` |
| Implementer auditoria | `sasi` | `scripts/audit_eventos.py`, query `11b` em `plantao_queries.sql` | `779741a` |
| Ingest bundle | `sasi` | `scripts/ingest_downloads_bundle.py`, staging `docs/import/bundle-claudecode/` | `c0904e2`, commits anteriores |
| Template evolução v2 | `claude` | D2+ v2 na skill; v1 SOAP → legado | `35df460` |
| Amostras UTI PDF→md | `claude` | `controles-vitais-janela/references/amostras/` | `5c5b70e` |
| UI Grok restore | `sasi` | Restaurou síntese xAI após remoção acidental | `b7b8201`, `87e0409` |

### Subagentes globais (`~/dev/claude/agents/`) — uso nesta sessão

| Agente | Papel nesta sessão |
|--------|-------------------|
| `secretaria` | Este documento + `comando.md` + sync `STATUS`/`DECISOES`/plano |
| `deploy-sentinel` | Gate implícito: typecheck/build antes de merge (CI frontend verde) |
| `clinical-data-auditor` | Doutrina zero alucinação nos fixes de persistência clínica |
| `code-explainer` | Não invocado explicitamente |
| `pubmed-evidence-checker` | Não invocado |

### Tentativas não concluídas

| Item | Motivo |
|------|--------|
| CI jobs `mcp-server` + `clinical-engine` | Push de `.github/workflows/ci.yml` rejeitado — token OAuth sem scope `workflow`; arquivo local permanece só `build-frontend` |
| Delete remoto `fix/ficha-supabase-sync` | Auth GitHub falhou neste ambiente; branch local e worktree **removidos** |
| `schema-live-dump.sql` pós-07 | Não regenerado |
| Smoke E2E plantão | Checklist em `STATUS.md` ainda aberto |

---

## Commits-chave (24-jun-2026)

### `sasi` (`doutortenente/SASI`)

```
779741a feat(sasi-executavel): MCP deploy, clinical-engine tests, auditoria
8e09cf4 docs(plan): SASI executável — convergência bundle vs stack viva
dc45f4f feat(db): add evolucoes synthesis JSONB columns
5ff7e93 fix(dashboard): realtime refresh on pendencias changes
419425d fix(synthesis): sync local state when parent props change
739a463 fix(ficha): persist synthesis riscos to evolucoes
932e094 fix(ficha): persist data_adm on save
19586a8 fix(ficha): include synthesis drafts in handleSave deps
35df460 (claude) feat(sasi-ingest): template D2+ v2 + sasi_deploy_ingest
```

### Branches

- `fix/ficha-supabase-sync` — mergeado em `main`; worktree `.worktrees/fix-ficha-supabase-sync` removido; branch local deletada.
- Remoto `origin/fix/ficha-supabase-sync` — pode ser apagado manualmente no GitHub se ainda existir.

---

## Arquivos tocados (mapa rápido)

| Caminho | Mudança |
|---------|---------|
| `frontend/src/components/FichaCompleta.tsx` | Save síntese + `data_adm` |
| `frontend/src/components/SasiSynthesis.tsx` | Riscos na UI |
| `frontend/src/hooks/useSupabasePatients.ts` | Realtime `pendencias` |
| `mcp-server/src/tools/ingest-deploy.ts` | Bulk ingest v1 |
| `supabase/migrations/07_evolucoes_synthesis_columns.sql` | JSONB síntese |
| `packages/clinical-engine/src/*` | parseBR, sofaDisplay, tests |
| `scripts/audit_eventos.py` | Fila review |
| `plantao_queries.sql` | Query 11b síntese |
| `docs/import/DECISOES.md` | Bundle vs stack |
| `claude/skills/sasi-ingest-export/` | Template v2 + refs MCP deploy |

---

## Pendências (próxima sessão)

1. Push CI ampliado — renovar token GitHub com scope `workflow` ou editar workflow no GitHub UI.
2. Regenerar `schema-live-dump.sql` após migration `07`.
3. Rodar `python3 scripts/audit_eventos.py` e tratar 24 itens `requires_review` / low confidence.
4. Smoke manual Definition of Done plantão (`STATUS.md` §6).
5. Stewardship: popular `atbs`/`culturas`/`pendencias` (0 linhas em prod).
6. Extrair SOFA completo de `docs/motor-clinico-v2/sofa.ts` → `clinical-engine`.

---

## Sessão Grok — Google Drive (24-jun-2026, tarde)

> Operador pediu acesso ao Drive. Sessão Grok falhou em UX; handoff para Claude/operador.

### O que ficou no disco (estado real)

| Item | Caminho | Status |
|------|---------|--------|
| rclone binário | `~/.local/bin/rclone` v1.74.3 | Instalado (sem apt/sudo) |
| Token OAuth rclone | `~/.config/rclone/rclone.conf` remote `gdrive` | **Autenticado** (OAuth built-in rclone, 24-jun ~10:22) |
| Credenciais MCP (custom) | `~/.config/google-drive-mcp/gcp-oauth.keys.json` | Criado; **sem** `tokens.json` |
| MCP config | `~/dev/.mcp.json` → `google-drive` | Restaurado (`@piotr-agier/google-drive-mcp`) |
| Script mount | `~/dev/scripts/mount-google-drive.sh` | **Restaurado** |
| Ponto de montagem | `~/GoogleDrive` | Pasta existe; **não montado** no fim da sessão |

### Comandos úteis

```bash
# Montar Drive como pasta local (FUSE — não é sync completo, mas aparece no filesystem)
~/dev/scripts/mount-google-drive.sh

# Listar na nuvem sem montar
~/.local/bin/rclone lsd gdrive:

# Desmontar
fusermount3 -u ~/GoogleDrive
```

### Erros do agente Grok (não repetir)

1. Usou OAuth **custom** (`GOOGLE_OAUTH_CLIENT_*` do `.env`) sem redirects cadastrados no GCP → `redirect_uri_mismatch` no MCP.
2. Abriu **dois** fluxos OAuth em paralelo (MCP + rclone) → porta `53682` em conflito.
3. Removeu `mount-google-drive.sh` após operador dizer “não baixar Drive” — interpretação errada (operador queria sem sync/espelhamento, não apagar infra).
4. MCP `google-drive` nunca autenticou; só rclone com OAuth **nativo** funcionou.

### Pendência Drive (próximo agente)

1. **MCP:** rodar `npx -y @piotr-agier/google-drive-mcp auth` **ou** cadastrar no GCP redirects `http://localhost:3000/oauth2callback` + `http://127.0.0.1:53682/` no client Web existente **ou** criar OAuth Desktop app.
2. **Alternativa já usada no passado:** conector `claude.ai Google Drive` (consta em `~/.claude.json` `claudeAiMcpEverConnected`) — funciona no Claude.ai, não no Grok IDE.
3. Confirmar com operador se quer **mount FUSE** (`~/GoogleDrive`) ou só **API sob demanda** (`rclone ls/cat`).

---

*Gerado 24-jun-2026. Atualizado 24-jun-2026 (tarde) — sessão Grok Drive. Atualizar `STATUS.md` e `~/.claude/memory/comando.md` em mudanças futuras — este arquivo é snapshot de sessão.*