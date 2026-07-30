# STATUS — SASI (Sistema de Auditoria e Síntese Intensiva)
**Comando UTI Alpha — 33 leitos (UTI 2/3/4)**

**Data desta revisão:** 30/07/2026
**Produção:** https://sasi-uti.vercel.app  
**Operador:** Dr. Nicolas Tenente (dr.tenente@nagaitaltda.com)  
**Supabase:** idswehsvvqczzkiatuzu (Postgres 17.6)

> **Este é o documento autoritativo de estado atual.**  
> Substitui os antigos `MEMORY.md` (removidos em 11/06/2026).  
> Briefing operacional para IA: [CLAUDE.md](CLAUDE.md).  
> Sempre atualize este arquivo em mudanças importantes de arquitetura, deploy, auth ou schema.

---

## 1. Stack e Arquitetura Atual

| Camada          | Tecnologia                                      | Observações |
|-----------------|--------------------------------------------------|-------------|
| Frontend        | React 18.3 + TypeScript + Vite 5                 | Código ativo em subpasta (ver seção 5) |
| Estilo          | Tailwind 3.4 + CSS vars — **BAYES.OPS 2 temas** | Tactical (escuro OLED) ⇄ Clinical (claro); toggle `lib/theme.tsx`; tokens `--app-*`; nunca hex hardcoded |
| Backend         | Supabase (Postgres + Auth + Realtime + Edge Functions) | Única fonte de dados |
| Deploy          | Vercel `sasi-uti` (CI em `main`)                 | `frontend/vercel.json`; root directory = `frontend` |
| PDF             | jsPDF + jspdf-autotable (lazy)                   | Export de passagem de turno |
| Ícones          | lucide-react                                     | — |
| Ingest clínico  | Skill `sasi-ingest-export` → JSON → MCP `sasi_deploy_ingest` | Claude lê foto/PDF/texto; **sem** pipeline OCR automático |
| Edge Function   | `ocr-ingest` legado (não usar) | Ingest real: Claude → JSON → MCP |
| Índice do repo  | `~/projetos/scripts/indices/build_sasi_index.py` → SQLite | Ver `memory/MEMORY.md` |

**Princípio arquitetural:**  
Ingest = **Claude extrai → JSON validado → grava no Supabase** (MCP com `deploy`, ou edição no frontend). Uso **pessoal solo** — um operador, sem OAuth.

**2 Temas BAYES.OPS (27/06/2026):** `tactical` (OLED `#000`, glow teal, camadas blueprint/scanlines/vinheta, reticle HUD em crítico/séptico — padrão) ⇄ `clinical` (claro `#F4F6F9`, sem camadas, legível 12h). Toggle em `lib/theme.tsx`, persistido em `localStorage sasi.theme`. Tri-tipografia: Chakra Petch (display) · Lexend (corpo) · JetBrains Mono (dados). Lei: zero animação `infinite` decorativa.  
**5 Janelas (redesign 11/06/2026):**

| # | Janela | Atalho | Conteúdo |
|---|--------|--------|----------|
| 1 | Leitos | `1` | Cards por gravidade (Estável/Watcher/Instável/Crítico) + filtros smart |
| 2 | Eixo Tempo | `2` | HPMA, tabelão labs seriais, interconsultas, programação/pendências |
| 3 | Eixo Estado | `3` | Terapias vigentes, vitais+BH, labs do dia, exame físico |
| 4 | Problema→Ação | `4` | Pares 1:1 problema/conduta com meta numérica |
| 5 | Passagem | `5` | Lista 3-linhas por paciente + copiar/PDF |

Navegação: `JanelaNav` no header · `j`/`k` troca paciente · seleção persistida em `localStorage`.

---

## 1b. Estado dos dados em produção (auditoria 23-jun-2026)

| Tabela | Linhas | Nota |
|--------|-------:|------|
| `pacientes` | 9 | Cadastro ativo |
| `evolucoes` | 9 | 1 snapshot por paciente |
| `eventos_clinicos` | 93 | 100% fonte `claude_ocr`; 24/93 `requires_review`; 18/93 `confidence<0.7` |
| `atbs` / `culturas` / `pendencias` | 0 | Stewardship e tarefas ainda vazios |

Último ingest (Claude→JSON): **21-jun-2026**. Queries de plantão: `supabase/queries/plantao_queries.sql`.

---

## 2. Acesso (uso pessoal — sem auth)

**Operador único:** Dr. Nicolas. Ferramenta pessoal de plantão, não produto hospitalar.

**Configuração atual (intencional, desde `fc8cd75`):**
- App carrega direto no Dashboard (`MOCK_SESSION`, `dev@sasi-uti.local`).
- Header: **"Modo dev — sem auth"**.
- `Login.tsx` existe mas **não é renderizado**.
- `dev_bypass` RLS ativo (migration `03_dev_bypass_rls.sql`) — acesso solo simplificado.

**Sem OAuth, MFA, magic link nem multi-usuário.** Não é dívida técnica para o escopo atual.

---

## 3. Funcionalidades Implementadas (Produção)

| # | Funcionalidade                              | Commit     | Status     | Observação |
|---|---------------------------------------------|------------|------------|----------|
| 1 | 3 temas (dark/clinical/light) + tokens UI   | 6020c0e    | ✅ Ativo   | `lib/theme.tsx` |
| 2 | 5 janelas de navegação (Leitos/Tempo/Estado/Problema/Passagem) | redesign-11jun | ✅ Ativo | Substitui plantão/round/editor |
| 3 | Calculadora de infusão (DVA + Sedação)      | 6020c0e    | ✅ Ativo   | `lib/drugs.ts` + `InfusionEditor.tsx` |
| 4 | Error Boundary global                       | 327f318    | ✅ Ativo   | — |
| 5 | Skeletons + Empty States                    | 0cb1a2a    | ✅ Ativo   | — |
| 6 | Novo Leito (admissão manual)                | 0cb1a2a    | ✅ Ativo   | `NovoLeitoModal.tsx` |
| 7 | Toasts + feedback Realtime                  | 0cb1a2a    | ✅ Ativo   | — |
| 8 | Atalhos de teclado globais                  | 0cb1a2a    | ✅ Ativo   | — |
| 9 | Timeline Drawer (SOFA + eventos)            | 0cb1a2a    | ✅ Ativo   | `TimelineDrawer.tsx` |
|10 | Export PDF Passagem de Turno (lazy)         | 0cb1a2a    | ✅ Ativo   | `exportPDF.ts` |
|11 | tsconfig strict                             | ffb6523    | ✅ Ativo   | `noUnusedLocals/Params` |
|12 | Trigger `updated_at` no Postgres            | ffb6523    | ✅ Ativo   | — |
|13 | Acesso solo (mock + dev_bypass RLS)         | fc8cd75    | ✅ Ativo   | Uso pessoal — sem auth |
|14 | Redesign Gemini-style + FichaCompleta       | d8a648c + 760b52d | ✅ Ativo | Replica exata do protótipo Gemini (edição inline 7 sistemas) |
|15 | Sinais vitais + labs estruturados           | b3c82eb    | ✅ Ativo   | Import de planilhas Excel |
|16 | LeitoCard com border-l por gravidade        | c780f71    | ✅ Ativo   | — |
|17 | Plantão Board: shell Sidebar/TopBar/FiltersBar | e526bad | ✅ Ativo   | PR #12 |
|18 | View Pacientes (índice + página-prontuário) | 12/06/2026 | ✅ Ativo   | `PacientesIndex` + `PacientePage` (reusa FichaCompleta/TimelineDrawer); botão "Prontuário" no modal |
|19 | Ficha ↔ Supabase síntese (problemas/condutas/riscos) | 24/06/2026 | ✅ Ativo   | Migration `07` + fixes `FichaCompleta`/`SasiSynthesis` |
|20 | MCP `sasi_deploy_ingest` (bulk payload v1) | 24/06/2026 | ✅ Ativo   | `mcp-server/src/tools/ingest-deploy.ts` |
|21 | Realtime dashboard em `pendencias` | 24/06/2026 | ✅ Ativo   | `useSupabasePatients.ts` |
|22 | `clinical-engine` — 7 testes Vitest (parseBR, SOFA display) | 24/06/2026 | ✅ Ativo   | `packages/clinical-engine/` |
|23 | Auditoria `eventos_clinicos` (script + query plantão) | 24/06/2026 | ✅ Ativo   | `~/projetos/scripts/sasi/audit_eventos.py`, `supabase/queries/plantao_queries.sql` §11b |
|24 | Design BAYES.OPS — 2 temas Tactical/Clinical        | 27/06/2026 | ✅ Ativo   | `src/index.css` + `tailwind.config.js` + LeitoCard/TopBar/Dashboard; commits `acce2c7`+`f185ab8` |

**Funcionalidades em destaque recentes (maio/2026):**  
- `FichaCompleta.tsx` — edição completa de todos os sistemas (neuro, resp, hemo, tgi, renal, hemato, infecto) + DVA/sedativos + impressão/conduta/pendências.  
- Export de passagem de turno com dados estruturados.

---

## 4. Schema Real em Produção vs Migrations Locais

**Schema em produção (Supabase):**
- 9 tabelas principais com RLS (`auth.uid() = user_id`):
  - `pacientes`, `evolucoes` (JSONB por sistema + `sofa_snapshot`), `eventos_clinicos`, `pendencias`, `atbs`, `culturas`, `antibiograma`, `alerts_log`, `ingest_audit_log`.
- 5 views `security_invoker`: `vw_dashboard_uti`, `vw_sofa_trend_72h`, `vw_bh_acumulado`, `vw_dias_atb_ativo`, `vw_alertas_abertos`.
- Constraint forte: `pacientes.uti IN ('UTI2','UTI3','UTI4')`.

**Migrations locais no repo (`supabase/migrations/`):**
- `01` — schema legado (4 tabelas antigas, referência histórica).
- `02–05` — triggers, dev_bypass, hardening, `patient_summary`.
- `06_protocolos_rag.sql` — RAG pgvector (`protocolos`, `protocolo_chunks`, `match_protocolos`). **Versionado 24-jun; aplicar manualmente no Supabase.**
- `07_evolucoes_synthesis_columns.sql` — `problemas_ativos`, `condutas_sistemas`, `riscos` (JSONB). **Aplicada no Postgres remoto 24-jun** (`dc45f4f`).

**Dívida:** `schema-live-dump.sql` ainda **não** reflete migration `07` — regenerar via dump remoto.

**Tipos TypeScript oficiais:** `src/lib/supabaseClient.ts` (da pasta ativa) — fonte da verdade para o frontend.

---

## 5. Mapa do Repositório (Jun 2026)

**Código ATIVO (repo `doutortenente/SASI`):**
```
frontend/                           ← React+Vite (deploy Vercel)
├── src/
├── vercel.json
└── package.json

mcp-server/                         ← MCP local (.mcp.json)
supabase/                           ← migrations + Edge Functions + queries/
├── functions/ocr-ingest (legado)
├── queries/plantao_queries.sql
└── types/database.types.ts

doctrine/                           ← template-base clínico
memory/                             ← sasi_index.db + STATUS
docs/                               ← SETUP, AGENTS
CLAUDE.md · .mcp.json
```

Workspace irmão: `~/projetos/` (Claude, memory, scripts). `comando-uti` **arquivado**.

**Faxina 16/06/2026 (organização):**
- Mapa do workspace: `~/projetos/memory/MAPA-DEV.md` (pós-split; `comando-uti` descontinuado).
- Fundido `CONFIGURAÇÕES_CLAUDE_JB.idea/` → `.idea/` canônico; removida run config `raiz: lint` (sem package.json raiz).
- Removido `node_modules/` órfão na raiz (423 MB, sem `package.json`).
- `.sasi-session-backup/` movido para gitignore (scratch de sessão IA).

**Faxina 11/06/2026 (conclusão):**
- Removido scaffold Vite morto na raiz (`package.json`, `index.html`, configs Tailwind v4).
- Removido VSIX Tailwind + pasta extraída.
- Removidos `MEMORY.md`, `sasi/MEMORY.md`, `sasi/CLAUDE_CODE_GUIDE.md` (consolidados em `STATUS.md` + `CLAUDE.md`).
- Removidas skills IA duplicadas (`.agents/`, `.claude/skills/` — 78 arquivos).
- Removido `skills-lock.json` (legado irrelevante).
- Unificado Supabase: `sasi/supabase/` fundido em `supabase/` na raiz (`ocr-ingest` + migration `05_add_patient_summary.sql`).
- Sanitizado `AGENTS.md`: JWTs substituídos por env vars (`SASI_SERVICE_ROLE_KEY`, `SASI_SUPABASE_ANON_KEY`).

**Governança:**
- `.github/PULL_REQUEST_TEMPLATE.md` — exige update de `STATUS.md`, typecheck, build, RLS safety.

---

## 6. Dívida Técnica e Backlog Priorizado

### Prioridade CRÍTICA
- [x] MCP `sasi_deploy_ingest` — bulk ingest payload v1 (24-jun-2026)
- [x] Colunas síntese `evolucoes` (problemas_ativos, condutas_sistemas, riscos) — migration `07`
- [ ] Versionar migrations do schema atual (9 tabelas + views) no repositório

### Definition of Done — plantão (smoke manual)
- [ ] Ingest folha → `sasi_deploy_ingest` → eventos na timeline
- [ ] Ficha → síntese → save → reload mostra JSONB
- [ ] Passagem 3 linhas + PDF com dados do DB
- [ ] `python3 ~/projetos/scripts/sasi/audit_eventos.py` — fila review < 10 itens críticos

### Prioridade MÉDIA
- [x] Consolidar cópias duplicadas (faxina 11/06/2026)
- [x] Atualizar contagens reais em `STATUS.md` + `CLAUDE.md` (24-jun-2026)
- [x] Versionar migration RAG protocolos (`06_protocolos_rag.sql`)
- [ ] Aplicar migration 06 no Supabase + Edge `protocolo-ingest`
- [ ] Revisar qualidade dos 93 `eventos_clinicos` (requires_review / confidence)
- [ ] Modal "Novo Leito" completo no frontend (atualmente depende de skill/edge)
- [ ] Drawer detalhado com timeline SOFA + eventos (já existe esqueleto)
- [ ] Error tracking (Sentry ou similar)
- [ ] 1 teste E2E (Playwright)

### Prioridade BAIXA
- [ ] Renomear caminho do projeto para `sasi/` simples (breaking change — avaliar impacto na Vercel)
- [ ] Code splitting + lazy loading mais agressivo (FichaCompleta + exportPDF já são lazy)
- [ ] Logger estruturado (substituir console.log)

---

## 7. Comandos para Desenvolvimento (Pasta Ativa)

```bash
# Local canônico após faxina (09/05/2026)
cd sasi

npm install
npm run typecheck     # deve sair limpo (0 erros)
npm run build         # deve gerar dist/ com sucesso
npm run dev           # http://localhost:5173 (abre direto no Dashboard com mock)
```

**Smoke test no Supabase (SQL Editor):**
```sql
SELECT count(*) FROM information_schema.tables WHERE table_schema='public';  -- deve ser 9+
SELECT count(*) FROM pg_views WHERE schemaname='public' AND viewname LIKE 'vw_%'; -- 5
```

---

## 8. Regras Clínicas SASI (Obrigatórias)

Ver arquivo completo: [AGENTS.md](AGENTS.md)

- Usar sempre o template SASI v2.0 (Ramo C) com ortogonalidade de eixos.
- Toda nota deve ter: **Impressão (problemas ativos)** + **Conduta 1:1 com metas numéricas**.
- Ao gerar nota SASI via skill/IA → inserir automaticamente na tabela `evolucoes`.
- Manter Max–Min em todos os sinais vitais (incluindo SpO2).
- **Nunca inventar dados** (zero alucinação).

---

## 9. Histórico de Decisões Importantes

| Data       | Decisão                                      | Commit / Motivo |
|------------|----------------------------------------------|-----------------|
| 27-Abr     | Setup inicial Vite + React + Supabase        | Stack definida |
| 30-Abr     | Deploy CI no Netlify + renomeio para sasi-uti.netlify.app | Fase A faxina (migrado p/ Vercel jul/2026) |
| 30-Abr     | Implementação do bundle de design (3 temas + 3 views + calculadora) | 6020c0e |
| 06-Mai     | **Acesso solo** (mock + dev_bypass RLS) | fc8cd75 — uso pessoal sem auth |
| 06-09-Mai  | Port de features do protótipo Gemini (FichaCompleta, LeitoCard, labs estruturados) | d8a648c, 760b52d, b3c82eb |
| 11-Jun     | **Faxina final do repo** — scaffold raiz, skills IA, docs duplicados, Supabase unificado | chore/faxina-11jun |
| 11-Jun     | **Redesign 5 Janelas** — severity/Watcher, clinicalExtract, Passagem 3-linhas | feat/5-janelas |
| 24-Jun     | **SASI executável (sessão agentes)** — Ficha↔Supabase, MCP deploy, clinical-engine, bundle ingest | `779741a`…`19586a8`; handoff `docs/SECRETARIA-2026-06-24.md` |
| 24-Jun     | **Skill template evolução D2+ v2** promovido no repo `claude` | `35df460` |
| 27-Jun     | **Design BAYES.OPS deployado** — 2 temas Tactical/Clinical; reticle HUD; bugs de token corrigidos; 2 animações `infinite` removidas | `f185ab8` |
| 30-Jul     | **Deploy canônico → Vercel** (`sasi-uti.vercel.app`); `netlify.toml` removido; paths `~/dev/` → `~/projetos/` | Faxina docs |

---

## 10. Próximos passos

1. **Regenerar `schema-live-dump.sql`** pós-migration `07`.
2. **CI ampliado** — jobs mcp-server + clinical-engine (bloqueado: scope `workflow` no token GitHub).
3. **Smoke plantão** — checklist Definition of Done (§6).
4. **Qualidade ingest** — 24 `eventos_clinicos` em fila review (`~/projetos/scripts/sasi/audit_eventos.py`).
5. **Rotacionar JWTs** se ainda não fez (histórico `AGENTS.md`).

---

**Status resumido (11/06/2026):**  
**Produção estável** com bypass de auth. Frontend com **5 janelas** (`severity.ts`, `clinicalExtract.ts`, `JanelaNav`). Repo: `frontend/` + `supabase/` + `mcp-server/`. Maior risco residual = drift de schema + bypass de autenticação.

---

## Infra (pós-split 24-Jun-2026)

| Item | Status |
|---|---|
| Vercel `sasi-uti` | Repo `doutortenente/SASI`; root directory = `frontend`; `frontend/vercel.json` |
| VPS Hermes | `/opt/data/projects/jarvis` + `sasi`; `comando-uti` arquivado |
| JARVIS CI | Secret `VPS_SSH_PRIVATE_KEY` configurado |

### Rotacionar keys (se ainda não fez)
JWTs antigos vazaram no histórico do git via `AGENTS.md`. Rotacione no Supabase e atualize `.env` local.

---

*Referências rápidas (atualizado após faxina):*  
- Código ativo: `frontend/`  
- Deploy: Vercel `sasi-uti` — https://sasi-uti.vercel.app
- Supabase: projeto `idswehsvvqczzkiatuzu`  
- Plano de auth: Google Drive (documento "Plano de ação login e autenticação SASI")

---

## 30-jul-2026 — F0 modelo de dados v3 APLICADO no banco vivo (branch `feat/modelo-dados-v3`)

Sessão Cowork. Formalização do modelo de dados **aplicada em produção** via `apply_migration`
(migrations `modelo_dados_v3_formalizacao` + `fix_enums_por_tipo`):
- **14 enums nativos** (12 novos + os 2 que já existiam), dimensão **`evento_tipo_ref`** (56 tipos,
  com faixa fisiológica de `03-clinical-sanity-checks` + LOINC dos 5 vitais verificados).
- **`eventos_clinicos.tipo` → FK** para `evento_tipo_ref` (CHECK de 56 valores removido). Idem `alert_rules`/`trend_rules`.
- **`memorias`** ganhou `user_id` + 4 policies de dono (antes: RLS sem policy — advisor resolvido).
- **Semáforo** passa a valer no INSERT de `pacientes` (`trg_severidade_on_insert`).
- 76 eventos intactos; nenhuma perda de dado. Bug de enum (do-block único) corrigido → per-tipo.

**GATED (não aplicado; `supabase/migrations/_gated/`):** adoção texto→enum (branch-first) e RLS de
produção + remover `dev_bypass` (só pós-login real — senão trava o app).

**Novos no repo:** `supabase/schema-producao-v3.sql`, `supabase/types/sasi.types.ts`,
`docs/{PLANO-SASI-v3.md,PLANO-SASI-v3.html,RUNBOOK-migracao-v3.md}`,
`sasi-v2/` (esqueleto Next.js 15 com o design system real integrado),
`packages/design-system/` (tokens+componentes), `packages/clinical-engine/scores-v2-staging/` (motor v2 — fase futura, não compila).

**Dívida:** `dev_bypass` segue ativo (gated, pós-auth). ⚠️ **Rotacionar segredos** — o cofre `.env`
foi colado no chat em 30-jul (Supabase service_role, PATs GitHub, Vaultwarden master, e-mails).
