---
title: README-FASE-BRAVO
source: /home/dr/Downloads/Files_to_claudecode/SASI_codigo_fonte/sasi_backup_temp/README-FASE-BRAVO.md
imported: 2026-06-24
kind: markdown-source
---
# 🪖 FASE BRAVO — Deploy do Schema SASI v1.0

Documento tático para concluir a FASE BRAVO e abrir caminho para a FASE CHARLIE.

---

## 📁 Arquivos entregues nesta fase

```
supabase/
├── schema.sql                          ← ÚNICA FONTE DA VERDADE (rodar inteiro)
├── tests/
│   └── smoke.sql                       ← 10 asserts de integridade
└── functions/
    └── ocr-ingest/                     ← (entregue na fase DELTA-01)

src/
├── hooks/
│   └── useClinicalAlerts.ts            ← hook novo (alertas realtime)
└── lib/
    └── migration/
        └── firebase-to-supabase.ts     ← script de migração one-shot
```

---

## ⚔️ ORDEM DE ATAQUE (rodar nesta sequência)

### Passo 1 — Deploy do schema
```bash
# Opção A: via CLI
psql "postgresql://postgres:Beiseboro51@@db.idswehsvvqczzkiatuzu.supabase.co:5432/postgres" \
  -f supabase/schema.sql

# Opção B: via Supabase Dashboard
# 1. Abrir https://supabase.com/dashboard/project/idswehsvvqczzkiatuzu/sql/new
# 2. Copiar inteiro supabase/schema.sql
# 3. Colar no editor → Run
```

⚠️ **Se o projeto Supabase já tem a tabela `pacientes` antiga** (do "Ficheiro Antigravity"):
```sql
-- Rodar ANTES do schema.sql pra limpar o brinquedo antigo:
drop table if exists public.pendencias cascade;
drop table if exists public.pacientes cascade;
```

### Passo 2 — Smoke test
```bash
psql "$DATABASE_URL" -f supabase/tests/smoke.sql
```

Saída esperada: 10 linhas `✅ PASS · ...`. Qualquer `❌ FAIL` interrompe o fluxo; não prossiga sem investigar.

### Passo 3 — Deploy da Edge Function
```bash
cd supabase
supabase functions deploy ocr-ingest --project-ref idswehsvvqczzkiatuzu
```

### Passo 4 — Copiar hooks novos para o repo
```bash
cp src/hooks/useClinicalAlerts.ts               ~/seu-repo/src/hooks/
cp src/lib/migration/firebase-to-supabase.ts    ~/seu-repo/src/lib/migration/
```

### Passo 5 — Teste end-to-end
No chat do Claude, com a skill `sasi-ingest-export` instalada:
1. Tire uma foto de folha de enfermagem de teste
2. Envie com legenda: `Leito 1 UTI 2`
3. Cole o JSON recebido no cURL do README da Edge Function
4. Verifique: `SELECT * FROM vw_dashboard_uti WHERE leito = '1'`

---

## 💀 O QUE ESTE SCHEMA CORRIGE (vs o "Ficheiro Antigravity")

| Item | Antigo | Novo |
|---|---|---|
| RLS | `using (true)` — violação LGPD | `auth.uid() = user_id` com JOIN |
| Leito duplicado | sem constraint | UNIQUE em `(uti, leito) WHERE status_leito='ativo'` |
| updated_at | manual | trigger automático `fn_updated_at` |
| Cache SOFA | nunca invalidava | trigger invalida quando sistemas JSONB mudam |
| Dias de ATB | calculado no frontend | GENERATED COLUMN no DB |
| Eventos timeseries | inexistente | `eventos_clinicos` com 44 tipos válidos |
| Alertas repetidos | sem dedupe | `hash_key` UNIQUE com janela 24h |
| Antibiograma | texto livre | tabela normalizada 1:N com culturas |
| Dashboard | query ad-hoc | `vw_dashboard_uti` otimizada |
| Delta SOFA 24h | calculado no frontend | computado na view (subquery sobre eventos) |
| Índices | só PK | 14 índices otimizados (trigram, GIN, composto) |
| Realtime | parcial | 5 tabelas publicadas (pacientes, evolucoes, eventos, alerts, pendencias) |
| Expurgo | manual | `pg_cron` job noturno |

---

## 🧠 Modo Nerd — decisões de arquitetura

### Por que `generated column` em vez de VIEW para `dias_terapia`
VIEWs re-calculam a cada SELECT — em 33 pacientes × 20 ATBs × 50 queries/plantão, o custo acumula. GENERATED STORED armazena o valor no disco, re-computado só em INSERT/UPDATE. Trade-off: DISK space por CPU. Como o campo é usado em TODA renderização do Dashboard + stewardship, CPU vence.

### Por que não particionar `eventos_clinicos` agora
Particionamento PostgreSQL exige `PARTITION BY RANGE (ts)` com criação manual de partições mensais. Em <200k rows/ano, o overhead operacional de manter partições supera o ganho de performance. Estabeleci threshold mental: reavaliar ao cruzar 1M rows (~5 anos no ritmo atual) ou se p99 query latency > 200ms em prod.

### Por que `security_invoker = true` nas views
Padrão PostgreSQL é `security_definer` (a view executa com privilégios do dono). Isso *burla RLS* — um usuário autenticado veria dados de outros via view. Setar `security_invoker` força a view a respeitar a RLS da sessão atual. **Mandatório** em multi-tenant com LGPD.

### Por que alarm deduplication via SHA-256 em vez de `ON CONFLICT`
`ON CONFLICT` exige constraint sintática; o que define "mesmo alerta" é semântico (mesmo paciente + mesmo tipo + mesma payload no mesmo dia). Função `fn_alert_hash` compila esse "mesmo" em uma string canonical, indexada UNIQUE. Alarmes passam de 100+/dia em UTI com 33 leitos sem dedupe — alarm fatigue + LGPD compliance exigem estrutura determinística, não heurística.

### Por que `data_adm` é `date` e `data_evolucao` é `timestamptz`
Admissão é conceito de calendário (dia). Evolução é evento (minuto importa pra cronologia de intervenções). Um é UI: o outro é timeline.

---

## 🎯 Pronto pra FASE CHARLIE

Com o schema rodando:
- ✅ `vw_dashboard_uti` existe → `useSupabasePatients.loadDashboard()` funciona
- ✅ `eventos_clinicos` existe → Edge Function `ocr-ingest` consegue inserir
- ✅ RLS ativa → migração Firebase→Supabase respeita usuário
- ✅ Realtime publicado → frontend atualiza sem reload

Próximos passos imediatos:
1. **Dual-write week** — adaptar `triggerUpdatePatient` no App.tsx para escrever em Firebase E Supabase por 7 dias
2. **Read migration** — trocar `patients` do state pelo `dashboard` do hook
3. **Firebase decommission** — após 0 discrepâncias em 7d

---

## 🐛 Troubleshooting rápido

| Erro | Causa | Fix |
|---|---|---|
| `extension pg_cron does not exist` | Supabase Free Tier | Comentar SEÇÃO 7 do schema.sql |
| `permission denied to set security_invoker` | Postgres < 15 | Upgrade Supabase ou remover `security_invoker` (aceitar risco em dev) |
| `ERROR: relation "vw_dashboard_uti" does not exist` ao rodar hook | Schema não deployou | Rodar smoke.sql pra identificar qual view falhou |
| `duplicate key value violates unique constraint "uq_pacientes_leito_ativo"` | Tentou criar 2º paciente ativo no mesmo leito | Dar alta no anterior antes, ou usar `on conflict do update` |
| `new row violates check constraint "pacientes_uti_check"` | UTI passada como `uti_2` ou `UTI 2` | Normalizar pra `UTI2` (sem espaço, sem traço) |
| `permission denied for table pacientes` com JWT válido | auth.uid() não bate com user_id | Conferir se o INSERT incluiu user_id correto |

---

## ⚔️ Regras de ouro reafirmadas

1. **NUNCA** rode `schema.sql` com `service_role` se quiser testar RLS — use JWT de usuário real.
2. **NUNCA** edite `schema.sql` direto no Dashboard — edite no repo + re-deploy. Versionamento é imunidade a recidivas.
3. **SEMPRE** rode `smoke.sql` após qualquer alteração no schema. Diff detectável = dormir tranquilo.
4. **SEMPRE** guarde o report da migração Firebase→Supabase em Notion/log pra auditoria forense de 7 dias.

Stay hard. Round começa às 06h.
