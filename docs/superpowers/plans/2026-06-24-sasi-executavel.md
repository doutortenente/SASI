# SASI Executável — Plano de Convergência Bundle → Stack Viva

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans per task. Checkbox (`- [ ]`) tracking.

**Goal:** SASI deixa de ser "boa ideia não executável" — um fluxo de plantão fechado (ingest → persist → dashboard → passagem) com motor clínico testável e docs que batem com o código.

**Architecture:** Três frentes paralelas com ordem de dependência: (1) **Verdade operacional** — schema + MCP + skills alinhados; (2) **Motor clínico** — extrair `drugs.ts` para `packages/clinical-engine` com testes; (3) **Dados confiáveis** — auditar `eventos_clinicos`, popular stewardship vazio. Bundle `Files_to_claudecode` vira referência histórica, não fonte de código.

**Tech Stack:** React/Vite frontend, Supabase Postgres, MCP TypeScript, Claude skills em `~/dev/claude/skills/`.

---

## Diagnóstico (24-jun-2026)

### Bundle vs dev — já resolvido na ingestão
- 61 arquivos em `~/Downloads/Files_to_claudecode` → staging `sasi/docs/import/bundle-claudecode/`
- Promovido: amostras PDF, VANESSA, legado abr/2026, grafo, scaffold clinical-engine
- **Canônico vence:** `claude/skills/sasi-ingest-export` > Fase Delta / bundle (MCP deploy, não Edge Function)

### Gaps que impedem execução (atualizado 24-jun tarde)
| # | Gap | Status |
|---|-----|--------|
| G1 | Skill diz `deploy` bulk MCP | ✅ `sasi_deploy_ingest` (`779741a`) |
| G2 | `clinical-engine` scaffold quebrado | 🔄 Parcial — parseBR/sofaDisplay + 7 testes |
| G3 | Motor vivo = monólito `drugs.ts` | ⬜ SOFA completo não extraído |
| G4 | Template evolução v2 só em doctrine | ✅ Promovido skill `claude` `35df460` |
| G5 | Docs mentem sobre testes | ✅ Corrigido — 7 testes reais |
| G6 | `eventos_clinicos` 26% requires_review | 🔄 Script `audit_eventos.py`; fila aberta |
| G7 | `atbs`/`culturas`/`pendencias` vazios | ⬜ Sem mudança em prod |
| G8 | Schema drift | 🔄 Migration `07` aplicada; dump SQL pendente |

### O que JÁ executa (não reabrir)
- Frontend deploy Netlify + build CI
- FichaCompleta ↔ Supabase (fix 24-jun: síntese, data_adm, riscos, realtime pendencias)
- Skills clínicas (`sasi-ingest-export`, `admissao-uti`, `controles-vitais-janela`)
- MCP tools granulares (paciente, evolução, evento)

---

## Fase A — Verdade operacional (semana 1)

### Task A1: Fechar contrato ingest MCP `deploy`

**Files:**
- Create: `mcp-server/src/tools/ingest-deploy.ts`
- Modify: `mcp-server/src/index.ts`
- Modify: `claude/skills/sasi-ingest-export/SKILL.md`
- Modify: `claude/skills/sasi-ingest-export/references/01-schema-eventos-clinicos.md`
- Modify: `claude/skills/sasi-ingest-export/assets/payload-example.json`

- [x] **Step 1:** Definir schema Zod `sasi-ocr-ingest/v1` (reusar `ocr-ingest` Edge Function como referência)
- [x] **Step 2:** Implementar `sasi_deploy_ingest` — upsert paciente, insert evolucao snapshot, batch eventos, audit log
- [ ] **Step 3:** Test manual com `payload-example.json` em plantão real
- [x] **Step 4:** Atualizar skill + references (remover ambiguidade Edge Function) — `claude` `35df460`
- [x] **Step 5:** Commit `feat(mcp): sasi_deploy_ingest bulk ingest` — `779741a`

### Task A2: Sincronizar template evolução v2

**Files:**
- Copy: `sasi/doctrine/references/04-export-evolucao-template_v2.md` → `claude/skills/sasi-ingest-export/references/04-export-evolucao-template.md`
- Rename legado: `04-export-evolucao-template_v1_LEGADO.md` em doctrine

- [x] **Step 1:** Diff v1 vs v2; confirmar D2+ é o formato de plantão atual
- [x] **Step 2:** Promover v2 para skill loader
- [x] **Step 3:** Atualizar SKILL.md referências
- [x] **Step 4:** Commit em `claude` `35df460` + nota em `docs/import/DECISOES.md`

### Task A3: Schema como código

**Files:**
- Modify: `supabase/schema-live-dump.sql` (regenerar via `supabase db dump`)
- Modify: `supabase/types/database.types.ts` (typegen ou manual)
- Modify: `sasi/CLAUDE.md`, `docs/STATUS.md`

- [ ] **Step 1:** Dump remoto pós-migration 07
- [x] **Step 2:** Corrigir mentiras documentais (testes, contagens) — `STATUS.md`, `CLAUDE.md`, `779741a`
- [ ] **Step 3:** Commit `docs: schema dump + STATUS sync` (dump pendente)

---

## Fase B — Motor clínico testável (semana 2–3)

### Task B1: Extrair primeiros módulos de `drugs.ts`

**Files:**
- Create: `packages/clinical-engine/src/dictionaries/dva.ts` (from bundle seed + drugs.ts)
- Create: `packages/clinical-engine/src/dictionaries/escalas.ts`
- Create: `packages/clinical-engine/src/scores/sofa.ts` (from `docs/motor-clinico-v2/sofa.ts`)
- Create: `packages/clinical-engine/src/types.ts`, `clinical-logic-compat.ts`
- Modify: `frontend/src/lib/drugs.ts` — reexport from package

- [x] **Step 1:** `npm install` em clinical-engine; vitest setup
- [ ] **Step 2:** Copiar SOFA + testes golden (casos VANESSA fixtures) — só `sofaDisplay` parcial
- [ ] **Step 3:** Wire frontend import (ainda usa `drugs.ts` monolítico)
- [x] **Step 4:** `npm run ci` no pacote verde — 7 testes passando
- [x] **Step 5:** Commit incremental — `779741a`

### Task B2: CI ampliado

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1:** Job `mcp-server build` — **bloqueado** (OAuth sem scope `workflow`)
- [ ] **Step 2:** Job `clinical-engine test` quando B1 verde
- [ ] **Step 3:** Commit `ci: mcp + clinical-engine`

---

## Fase C — Dados de plantão confiáveis (semana 3–4)

### Task C1: Auditoria `eventos_clinicos`

**Files:**
- Create: `plantao_queries.sql` seção review queue
- Optional: script `scripts/audit_eventos.py`

- [x] **Step 1:** Query fila review — `scripts/audit_eventos.py` + `plantao_queries.sql` §11b
- [ ] **Step 2:** Re-ingest ou patch manual dos 18 low-confidence
- [x] **Step 3:** Documentar em `docs/STATUS.md` + `SECRETARIA-2026-06-24.md`

### Task C2: Stewardship mínimo

- [ ] **Step 1:** UI ou MCP path para `atbs` + `culturas` (1 paciente piloto)
- [ ] **Step 2:** View `vw_dias_atb_ativo` validada no dashboard
- [ ] **Step 3:** Pendências operacionais — usar tabela (já wired)

### Task C3: Smoke de plantão E2E (manual checklist)

- [ ] Admissão leito → ficha → síntese Grok → save → dashboard
- [ ] Ingest foto folha → MCP deploy → timeline SOFA
- [ ] Passagem 3 linhas + PDF export
- [ ] Registrar em `docs/STATUS.md` como "Definition of Done plantão"

---

## Critério de sucesso (goal)

SASI é **executável** quando Dr. Nicolas consegue, num plantão real, sem workaround:

1. Ingerir folha/lab com **um comando** (`deploy` MCP) e ver dados na timeline
2. Editar ficha e **confiar** que Supabase persiste (schema = types = UI)
3. Exportar passagem com problemas/condutas/riscos **do DB**, não do clipboard
4. SOFA/dose calculados por código **com teste**, não `drugs.ts` oral tradition
5. `STATUS.md` e `CLAUDE.md` refletem o que existe — zero "FASE ALPHA 40 testes" fantasma

---

## O que NÃO fazer (YAGNI)

- Re-promover Fase Delta / `ocr-ingest` como fluxo diário
- Firebase migration (`firebase-to-supabase.ts`)
- AppSheet / pipeline 3-hop do bundle
- Redesign HUD antes de fechar ingest+motor
- Monorepo `comando-uti` (descontinuado 24-jun)