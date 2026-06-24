# STATUS — SASI (Sistema de Auditoria e Síntese Intensiva)
**Comando UTI Alpha — 33 leitos (UTI 2/3/4)**

**Data desta revisão:** 24/06/2026
**Produção:** https://sasi-uti.netlify.app  
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
| Estilo          | Tailwind 3.4 + CSS vars (3 temas)                | Tokens `bg-app-*`, nunca `bg-slate-*` hardcoded |
| Backend         | Supabase (Postgres + Auth + Realtime + Edge Functions) | Única fonte de dados |
| Deploy          | Netlify `sasi-uti` (CI em `main`)                | `netlify.toml` na raiz: `base = "frontend"` |
| PDF             | jsPDF + jspdf-autotable (lazy)                   | Export de passagem de turno |
| Ícones          | lucide-react                                     | — |
| Ingest clínico  | Skill `sasi-ingest-export` → JSON → MCP (`deploy`) | Claude lê foto/PDF/texto; **sem** pipeline OCR automático |
| Edge Function   | `ocr-ingest` legado (não usar) | Ingest real: Claude → JSON → MCP |
| Índice do repo  | `memory/scripts/build_sasi_index.py` → SQLite 244 arq | Ver `memory/MEMORY.md` |

**Princípio arquitetural:**  
Ingest = **Claude extrai → JSON validado → grava no Supabase** (MCP com `deploy`, ou edição no frontend). Uso **pessoal solo** — um operador, sem OAuth.

**3 Temas:** `dark` (padrão), `clinical` (âmbar alta luminância UTI), `light`.  
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

Último ingest (Claude→JSON): **21-jun-2026**. Queries de plantão: `plantao_queries.sql`.

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

**Dívida:** schema vivo completo ainda depende de `schema-live-dump.sql` + migrations incrementais.

**Tipos TypeScript oficiais:** `src/lib/supabaseClient.ts` (da pasta ativa) — fonte da verdade para o frontend.

---

## 5. Mapa do Repositório (Jun 2026)

**Código ATIVO (repo `doutortenente/SASI`):**
```
frontend/                           ← React+Vite (deploy Netlify)
├── src/
├── netlify.toml
└── package.json

mcp-server/                         ← MCP local (.mcp.json)
supabase/                           ← migrations + Edge Functions
├── functions/ocr-ingest (legado)
└── types/database.types.ts

doctrine/                           ← doutrina clínica
memory/                             ← sasi_index.db + scripts
docs/                               ← SETUP, JETBRAINS, STATUS, AGENTS
design-system/                      ← tokens + UI kit
CLAUDE.md · .mcp.json
```

Workspace irmão: `~/dev/` (Claude, JARVIS, `memory/MAPA-DEV.md`). `comando-uti` **arquivado**.

**Faxina 16/06/2026 (organização):**
- Mapa do workspace: `~/dev/memory/MAPA-DEV.md` (pós-split; `comando-uti` descontinuado).
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
- [ ] Versionar migrations do schema atual (9 tabelas + views) no repositório

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
- [ ] Renomear caminho do projeto para `sasi/` simples (breaking change — avaliar impacto no Netlify)
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
- Toda nota deve ter: **Impressão com vetor (↑ / ↓ / =)** + **Conduta 1:1 com metas numéricas**.
- Ao gerar nota SASI via skill/IA → inserir automaticamente na tabela `evolucoes`.
- Manter Max–Min em todos os sinais vitais (incluindo SpO2).
- **Nunca inventar dados** (zero alucinação).

---

## 9. Histórico de Decisões Importantes

| Data       | Decisão                                      | Commit / Motivo |
|------------|----------------------------------------------|-----------------|
| 27-Abr     | Setup inicial Vite + React + Supabase        | Stack definida |
| 30-Abr     | Deploy CI no Netlify + renomeio para sasi-uti.netlify.app | Fase A faxina |
| 30-Abr     | Implementação do bundle de design (3 temas + 3 views + calculadora) | 6020c0e |
| 06-Mai     | **Acesso solo** (mock + dev_bypass RLS) | fc8cd75 — uso pessoal sem auth |
| 06-09-Mai  | Port de features do protótipo Gemini (FichaCompleta, LeitoCard, labs estruturados) | d8a648c, 760b52d, b3c82eb |
| 11-Jun     | **Faxina final do repo** — scaffold raiz, skills IA, docs duplicados, Supabase unificado | chore/faxina-11jun |
| 11-Jun     | **Redesign 5 Janelas** — severity/Watcher, clinicalExtract, Passagem 3-linhas | feat/5-janelas |

---

## 10. Próximos passos

1. **Rotacionar JWTs** expostos historicamente em `AGENTS.md` (Supabase Dashboard → Settings → API).
2. **Versionar schema real** (9 tabelas + views) — migrations locais ainda parcialmente obsoletas.
3. **Qualidade do ingest** Claude→JSON nos `eventos_clinicos`.

---

**Status resumido (11/06/2026):**  
**Produção estável** com bypass de auth. Frontend com **5 janelas** (`severity.ts`, `clinicalExtract.ts`, `JanelaNav`). Repo: `frontend/` + `supabase/` + `mcp-server/`. Maior risco residual = drift de schema + bypass de autenticação.

---

## Infra (pós-split 24-Jun-2026)

| Item | Status |
|---|---|
| Netlify `sasi-uti` | Repo `doutortenente/SASI`; `netlify.toml` na raiz com `base = "frontend"` |
| VPS Hermes | `/opt/data/projects/jarvis` + `sasi`; `comando-uti` arquivado |
| JARVIS CI | Secret `VPS_SSH_PRIVATE_KEY` configurado |

### Rotacionar keys (se ainda não fez)
JWTs antigos vazaram no histórico do git via `AGENTS.md`. Rotacione no Supabase e atualize `.env` local.

---

*Referências rápidas (atualizado após faxina):*  
- Código ativo: `frontend/`  
- Deploy: Netlify `sasi-uti` — https://sasi-uti.netlify.app
- Supabase: projeto `idswehsvvqczzkiatuzu`  
- Plano de auth: Google Drive (documento "Plano de ação login e autenticação SASI")
