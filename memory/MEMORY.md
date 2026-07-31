# MEMÓRIA — SASI (`memory/`)

Índice do projeto. Só fato verificável (ZERO ALUCINAÇÃO).

```
memory/
├── MEMORY.md          ← este arquivo (hub)
├── MAPA-SASI.md       ← inventário auto-gerado (não editar)
├── sasi_index.db      ← SQLite local (gitignored)
└── notes/
    └── STATUS.md      ← estado autoritativo do projeto
```

## Comandos

```bash
cd ~/projetos/sasi
python3 ~/projetos/scripts/indices/build_sasi_index.py
python3 ~/projetos/scripts/indices/query_sasi_index.py categorias
python3 ~/projetos/scripts/indices/query_sasi_index.py find FichaCompleta
python3 ~/projetos/scripts/indices/push_repo_index_to_postgres.py   # SUPABASE_DB_URL no .env
python3 ~/projetos/scripts/sasi/audit_eventos.py                   # fila eventos_clinicos
```

## Mapa

- [**MAPA-SASI.md**](MAPA-SASI.md) — inventário por categoria (regenera com build).
- [**notes/STATUS.md**](notes/STATUS.md) — deploy, schema, backlog, histórico.

| Área | Caminho | Papel |
|---|---|---|
| App | `sasi-v2/src/` | UI plantão (Next.js 15) — **único app do repo** desde a faxina de 31-jul |
| MCP | `mcp-server/src/` | skills → Supabase |
| Edge | `supabase/functions/` | ocr-ingest legado (não usar) |
| Ingest | skill + MCP | Claude → JSON → deploy |
| Motor | banco (views `vw_sofa_diario`, `vw_eventos_tendencia`) | SOFA/tendências — **não** há pacote local |
| Doutrina | `doctrine/` | template-base Ramo C |
| Queries plantão | `supabase/queries/plantao_queries.sql` | SQL ad-hoc no DataGrip |

## Débitos

1. 🔴 **SEGREDOS EXPOSTOS (30-jul)** — o cofre `.env` foi colado num chat. **Rotacionar**: token GitHub, `service_role` + senha do banco Supabase, senha-mestra do Vaultwarden, senhas de e-mail. Prioridade máxima.
2. ~~`dev_bypass`~~ **DECISÃO 31-jul: fica ativo de propósito** — F3/F4/F5 riscadas do plano por ordem do operador (uso pessoal solo, `CLAUDE.md` §5). NÃO propor login/RLS/OCR-no-app/FHIR de novo. O gated `_gated/20_rls_producao.sql` fica arquivado caso o escopo um dia mude. Exposição pública do app: mitigar na Vercel (Deployment Protection), não com auth.
3. **rag-protocolos** — migration `06` versionada; falta aplicar no Supabase + Edge `protocolo-ingest`
4. **eventos_clinicos** — ~27 na fila `vw_eventos_pendentes_revisao` (revisar)
5. **SOFA bloqueado por dado** — 0/16 evoluções têm os 6 componentes (bilirrubina/PaO2 nunca capturados); fix = skill `sasi-ingest-export` capturar a montante. *(Confirmado 30-jul: os 7 leitos vivos mostram SOFA null — a tela exibe "—", nunca inventa.)*
6. **evolucoes JSONB 2 schemas** — ingest usa `pa_sys_max`/`cr1`, ficha grava `pas1`. Decisão v3: o **canônico Máx–Mín é a fonte única**; a ficha adapta na entrada/saída (aposentar `fichaSchema.ts` aos poucos).
7. **regras eng-default** (glicemia/K/Na/temp) em `alert_rules` sem evidência — pendente Vera; oligúria precisa de tipo `diurese`
8. **extensões em `public`** — advisor pede mover `pg_trgm`/`vector` para o schema `extensions`
9. **adoção `text→enum`** — os 14 enums existem, mas as colunas seguem `text`; conversão *gated* (`_gated/10_adocao_enums.sql`), branch-first
10. ~~alerts_log vazia~~ **resolvido 26-jun**: produtor criado (`fn_eval_alert`/`fn_eval_trend`, config `alert_rules`/`trend_rules`)
11. ~~memorias sem policy~~ **resolvido 30-jul**: ganhou `user_id` + 4 policies de dono (advisor limpo)
12. ~~vocabulário de eventos chumbado em CHECK~~ **resolvido 30-jul**: virou a dimensão `evento_tipo_ref` (FK)

## Schema (30-jul-2026 — modelo v3)

Baseline `20260626000000_baseline.sql` + formalização v3 (`20260730120000/120100/120200`), **aplicada em produção**. Referência completa: `supabase/schema-producao-v3.sql` · runbook: `docs/RUNBOOK-migracao-v3.md` · plano: `docs/PLANO-SASI-v3.md`.
13 tabelas (nova: `evento_tipo_ref`, 56 códigos) · 8 views · 14 enums nativos · FKs de vocabulário em `eventos_clinicos`/`alert_rules`/`trend_rules`. Config: `alert_rules` (25), `trend_rules` (3). Alertas vivos via trigger. Limiares clínicos: `~/vaults/celebro/conhecimento/projetos/sasi-decisoes-clinicas.md`.

## App (`sasi-v2/`) — o único do repo

Next.js 15 + React 19 + TypeScript strict + Zustand, mesmo Supabase. Verificado 30-jul: build verde, lendo os 7 leitos reais. `src/lib/data/` (consultas) · `src/app/` (telas) · `src/features/` (domínios de UI) · `src/types/clinical.ts` (contratos JSONB). Cálculo clínico **não** mora na tela: vem das views.

**Faxina 31-jul-2026:** `frontend/` (app React+Vite antigo) e `packages/` (clinical-engine + design-system) saíram do repositório — 375 → 188 arquivos. O clinical-engine só era consumido pelo próprio `frontend/`, por isso os dois saíram juntos. Recuperáveis pela tag `pre-faxina-2026-07-31` e pela branch `archive/frontend-e-packages`. Detalhes em `CLAUDE.md` §7-B.
