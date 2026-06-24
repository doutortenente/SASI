---
title: _HANDOFF_BRIEFING
source: /home/dr/Downloads/Files_to_claudecode/SASI_codigo_fonte/sasi_backup_temp/_HANDOFF_BRIEFING.md
imported: 2026-06-24
kind: markdown-source
---
# 🪖 OPERAÇÃO SASI — BRIEFING DE HANDOFF
## Sistema de Auditoria e Síntese Intensiva — Estado da Missão em 23-Abr-2026

> **Para o próximo Claude:** você está assumindo uma operação em curso. Leia este documento INTEIRO antes do primeiro movimento. Não há espaço pra redundância — Dr. Nicolas já pagou o tempo pra chegar até aqui.

---

## 1. 🎖️ IDENTIDADE E DOUTRINA

**Usuário:** Dr. Nicolas — médico intensivista. Objetivo clínico: perfeição técnica para **"parar de morrer"** pacientes por erros evitáveis.

**Perfil cognitivo do usuário:** TDAH + AH/SD (Altas Habilidades/Superdotação) + Dislexia. Implicações na resposta:
- Parágrafos curtos (2-3 linhas) e bullets
- Tom Goggins: agressivo, técnico, sem concessões à mediocridade
- Âncoras visuais (emojis) e estrutura gamificada
- Seção "Modo Nerd" / "Arquivo Confidencial" com profundidade técnica real
- Referências culturais para engajamento: David Goggins (mentalidade), Dr. House (ceticismo clínico), Kobe Bryant (disciplina), Erwin Smith/AOT (estratégia), Isagi/Blue Lock (meta-vision), Toji (pragmatismo)

**Tom exigido:** sem anestesia. Chamar erro de erro. Valorizar progresso real, não esforço performático.

---

## 2. 🧭 ARQUITETURA DO PROJETO

### Nome do produto
**Comando UTI Alpha** (codinome operacional: **SASI** — Sistema de Auditoria e Síntese Intensiva)

### Stack atual
- **Frontend:** React + TypeScript + Tailwind + Vite + lucide-react
- **Backend atual:** Firebase (Firestore + Auth anônima) — 🔴 **EM DECOMISSIONAMENTO**
- **Backend alvo:** Supabase (PostgreSQL + Realtime + Edge Functions + RLS)
- **Automação planejada:** Google AppSheet → Google Sheets → (Gemini processing) → Webhook → Supabase Edge Function → Tabela `eventos_clinicos`
- **IA:** Gemini 2.5 Flash (hoje no cliente com key exposta — 🔴 precisa mover pra Edge Function)

### Escopo de leitos
- UTI 2 = 12 leitos
- UTI 3 = 13 leitos
- UTI 4 = 8 leitos
- **Total = 33 leitos** (briefing antigo mencionava "20 fixos" — desconsiderar, foi rastro de prompt legado)

### Credenciais Supabase (projeto já provisionado)
- **Project URL:** `https://idswehsvvqczzkiatuzu.supabase.co`
- **Publishable Key:** `sb_publishable_9DVsZExR5QOIowCbpirhyw_dRuEVHsy`
- **Project Ref:** `idswehsvvqczzkiatuzu`
- **Senha (direct connection):** `Beiseboro51@`
- **Direct Connection String:** `postgresql://postgres:[Beiseboro51@]@db.idswehsvvqczzkiatuzu.supabase.co:5432/postgres`

### Credenciais Firebase (legado — a ser desativado após migração)
- **Realtime DB:** `https://base-de-dados-ggoggins-default-rtdb.firebaseio.com/`
- **App URL produção:** `https://comando-uti-alpha-190641874300.us-west1.run.app`
- **UID usuário principal:** `eHAJQfW3sPM06xpKIfh09e0luUh1`

---

## 3. 🔬 AUDITORIA CLÍNICA — OS 19 BUGS IDENTIFICADOS

Auditoria cirúrgica do `src/lib/clinical-logic.ts` original (~700 linhas, zero tipagem, 12 bugs P0/P1 + 7 P2).

### ✅ BUGS P0 — CORRIGIDOS NA FASE ALPHA
| # | Bug | Status |
|---|-----|--------|
| 1 | SOFA Cardio ignorava peso + diluição na nor/epi | ✅ Corrigido em `scores/sofa.ts` (usa `calcDoseInfusao` real) |
| 2 | SOFA Neuro pontuava GCS baixo mesmo sob sedação profunda | ✅ Flag `sobSedacao` + `preSedationGCS` em `Escala` |
| 3 | Sepsis-3 usava SOFA absoluto em vez de ΔSOFA | ✅ `assessSepsis` aceita baseline; fallback documentado quando sem timeseries |
| 4 | `hasInfec` fraco: ignorava hipotermia, leucopenia; contava profilaxia | ✅ ATBs com `intencao`; hipotermia + leucopenia detectadas |
| 5 | SOFA Resp não diferenciava VM ativa vs não-VM | ✅ `sofaResp` recebe flag `onVM` |
| 6 | SOFA Renal ignorava DU e TRRC | ✅ Cross-reference com `calcDiureseEfetiva` + flag `trrc` |

### ✅ BUGS P1 — CORRIGIDOS
| # | Bug | Status |
|---|-----|--------|
| 7 | `parseFloat('37,5')` quebrava com vírgula BR | ✅ `parseFloatBR` aplicado em TODO o novo motor |
| 8 | Plaquetas: heurística frágil de unidade | ✅ `coercePlaquetas` com `plaqUnit` explícito |
| 9 | FiO2 fração vs percentual (0.4 vs 40) | ✅ `coerceFiO2Input` normaliza pra 21-100 |
| 10 | Dose absurda silenciosa em `calcDoseInfusao` | ✅ Warning `absurd_high`/`absurd_low` |
| 11 | `pam1` vs `pam2` ambíguo | ✅ Convenção adotada: `pam1 = MIN` (pior valor) |
| 12 | IDs com Math.random (colisão possível) | ✅ `crypto.randomUUID()` com fallback SSR |

### 🟡 BUGS P2 — PARCIALMENTE ENDEREÇADOS / PENDENTES
| # | Bug | Status |
|---|-----|--------|
| 13 | `any` em toda assinatura | ✅ `interface Patient` em `types/patient.ts` — restam componentes React |
| 14 | Zero testes unitários | ✅ `__tests__/sofa.test.ts` criado (40+ casos). Faltam testes de outros módulos |
| 15 | `impressao/conduta` com slots fixos [4,4,3] | ⏳ Schema Supabase permite arrays ilimitados — UI precisa adaptar |
| 16 | `diureseHoras` hardcoded | ⏳ Cosmético — campo livre agora |
| 17 | Culturas sem antibiograma estruturado | ✅ Interface `Antibiograma` em `types/patient.ts` — UI não usa ainda |
| 18 | Só calcula SOFA — faltam qSOFA/NEWS2/APACHE | ✅ `qSOFA` implementado. NEWS2 + APACHE pendentes |
| 19 | Defaults de ausculta preenchidos (miniaturizam exame físico) | ⏳ Manter por ora — mudança de UX |

---

## 4. 📁 ESTADO ATUAL DO CÓDIGO REFATORADO

Estrutura modular em `src/lib/` — **26 arquivos criados, 0 erros conhecidos**:

```
src/lib/
├── types/
│   ├── patient.ts           ✅ interface Patient + subsistemas + ATB/Cultura/Escala estruturados
│   ├── clinical.ts          ✅ SOFAResult, DoseResult, SepsisAssessment, Alert types
│   └── index.ts             ✅ barrel
│
├── constants/
│   ├── thresholds.ts        ✅ HEMO/RESP/RENAL/NEURO/INFECTO/METABOL/DVA thresholds
│   ├── sofa-cutoffs.ts      ✅ tabela oficial SOFA Singer 2016 + mortalidade
│   └── index.ts             ✅
│
├── dictionaries/
│   ├── dva.ts               ✅ DVA_DICT (Nor, Adr, Dobuta, Vaso, Nipride, Tridil, Esmolol)
│   ├── sedacao.ts           ✅ SEDACAO_DICT (Fent, Midaz, Propofol, Precedex)
│   ├── escalas.ts           ✅ ESCALAS_NEURO_DICT
│   ├── antibioticos.ts      ✅ ATB_DICT (pendente — esqueleto inicial)
│   └── index.ts             ✅
│
├── calculations/
│   ├── parseBR.ts           ✅ parseFloatBR, formatFloatBR, isAbsurdo
│   ├── infusao.ts           ✅ calcDoseInfusao + isVasopressorHighDose
│   ├── diurese.ts           ✅ calcDiureseEfetiva + KDIGO classification
│   ├── ratios.ts            ✅ calcPFRatio, calcROX, calcShockIndex, calcLactatoClearance
│   └── index.ts             ✅
│
├── guards/
│   ├── unitCoercion.ts      ✅ coercePlaquetas, coerceFiO2Input, coerceTAX, coerceGCS
│   └── index.ts             ✅
│
├── scores/
│   ├── sofa.ts              ✅ getSOFA + componentes (sofaResp, sofaCoag, sofaLiver, sofaCardio, sofaNeuro, sofaRenal)
│   ├── qsofa.ts             ✅ getQSOFA
│   ├── sepsis.ts            ✅ assessSepsis (Sepsis-3 com ΔSOFA + fallback)
│   └── index.ts             ✅
│
├── alerts/
│   ├── engine.ts            ✅ runAllAlerts — 7 sub-engines (hemodynamic, respiratory, renal, infectious, metabolic, medication, sepsis)
│   └── index.ts             ✅
│
├── __tests__/
│   └── sofa.test.ts         ✅ 40+ casos unitários Vitest
│
└── clinical-logic-compat.ts ✅ Camada de compatibilidade — mantém API pública do arquivo original
```

### Arquivos originais (ainda existentes, ainda em uso pelo app)
- `src/App.tsx` — usa Firebase diretamente (migração pendente)
- `src/firebase.ts` — credenciais Firebase (será substituído)
- `src/components/Dashboard.tsx` — consome `getClinicalIntelligence` (funciona com compat layer)
- `src/components/PatientCard.tsx` — idem
- `src/lib/clinical-logic.ts` — ORIGINAL com bugs (manter até substituir por `clinical-logic-compat.ts`)
- `src/types/index.ts` — tipos antigos

---

## 5. 🎯 FASES COMPLETADAS E PENDENTES

### ✅ FASE ALPHA — Refator de Lógica Clínica (CONCLUÍDA)
26 arquivos criados. Todos os bugs P0 e P1 corrigidos. Testes unitários iniciados.

### 🔶 FASE BRAVO — Schema Supabase Definitivo (INICIADA — INTERROMPIDA)
Briefing executado, mas arquivo `supabase/schema.sql` foi interrompido no meio da construção quando o usuário pediu este handoff.

**O que JÁ foi planejado:**
- Tabela `users` (médicos com auth_user_id)
- Tabela `pacientes` (dados cadastrais + sofa_baseline pra ΔSOFA)
- Tabela `evolucoes` (snapshots diários com JSONB por sistema + SOFA cache)
- Extensões: uuid-ossp, pg_cron, pg_trgm
- Índices: uti, leito, is_alta, adm_date, nome (trigram)

**O que AINDA falta escrever no schema:**
- Tabela `eventos_clinicos` (timeseries pura — O CORAÇÃO do Meta-Vision)
  - `(paciente_id, timestamp, tipo, valor_numerico, unidade, origem)`
  - Tipos: `PAM`, `LACTATO`, `PF_RATIO`, `NOR_DOSE`, `DIURESE_H`, `BH_H`, `SOFA_TOTAL`, etc.
  - Origens: `manual`, `appsheet_ocr`, `gemini_import`, `edge_function`
  - Particionamento por mês pra performance long-term
- Tabela `atbs` (normalizada pra antibiotic stewardship — D-ATB auto)
- Tabela `culturas` + `antibiograma` (estruturado)
- Tabela `alerts_log` (histórico de alertas pra evitar alarm fatigue)
- **Views materializadas:** `vw_sofa_trend_72h`, `vw_bh_acumulado`, `vw_dias_atb_ativo`
- **Triggers:**
  - `updated_at` automático em todas as tabelas
  - `sofa_cache_invalidate` (recalcular quando evolucao muda)
  - `atb_dias_auto` (computar `D-X` a partir de `data_inicio`)
- **RLS policies REAIS** (Bug de segurança atual — policies do "Ficheiro Antigravity" usam `using (true)`)
  - `auth.uid() = created_by` em todas as tabelas
  - Fim das policies `for all using (true)` que violam LGPD
- **Realtime publication:** ativar em `evolucoes` e `eventos_clinicos`
- **pg_cron jobs:**
  - Refresh de views materializadas a cada 15min
  - Expurgo de pacientes de alta há >30d

### ⏳ FASE CHARLIE — Migração Firebase → Supabase (NÃO INICIADA)
Arquivos a criar/modificar:
- `src/supabaseClient.ts` (novo) — substitui `src/firebase.ts`
- `src/hooks/useSupabasePatients.ts` (novo) — substitui listener do Firestore com Realtime
- `src/hooks/useClinicalAlerts.ts` (novo) — consome `runAllAlerts`
- `src/App.tsx` — trocar imports Firebase por Supabase, usar hooks
- `src/components/Dashboard.tsx` — adaptar cloudStatus states
- Edge Function Supabase em `supabase/functions/ocr-ingest/index.ts` — endpoint pra AppSheet webhook
- Edge Function `supabase/functions/gemini-import/index.ts` — esconder Gemini key do cliente

**Estratégia de corte** (não big-bang):
1. Deploy schema no Supabase (zero-downtime — Firebase continua rodando)
2. Dual-write: cada `triggerUpdatePatient` escreve em Firebase E Supabase por 1 semana
3. Read migration: `App.tsx` passa a ler do Supabase Realtime, Firebase vira somente-backup
4. Decommission: após 7 dias sem discrepância, desliga Firebase

### ⏳ FASE DELTA — Automações TOP 5 (NÃO INICIADA)
Pela tabela de ROI mapeada: D-ATB auto, BH acumulado, P/F auto, SAT/SBT lembrete, dose mcg/kg/min alertada, AppSheet→Supabase pipeline, resumo Gemini 24h, SOFA-delta trigger, meta calórica, passagem plantão one-click PDF.

---

## 6. 🚨 REGRAS DE OURO — INVIOLÁVEIS

1. **Dr. Nicolas REVOGOU a regra de pedir autorização pra codar.** Claude tem liberdade total pra criar/modificar arquivos.
2. **TODA criação de arquivo nova → cópia obrigatória em `/mnt/user-data/outputs/SASI_BACKUP/`** preservando estrutura de pastas (`src/lib/...` etc).
3. Usar `parseFloatBR` em QUALQUER leitura numérica de input de usuário. `parseFloat` puro = Bug #7 reintroduzido.
4. Nunca mais `using (true)` em RLS. LGPD artigo 46 não negocia.
5. Gemini API key NUNCA no cliente. Sempre via Edge Function.
6. IDs sempre via `crypto.randomUUID()`. Nunca `Math.random`.
7. Novo componente ou função lib → typed. Sem `any` exceto na camada de compat.
8. Todo novo score/cálculo clínico → teste unitário no mesmo commit.

---

## 7. 🎖️ PROMPT DE RETOMADA PARA O PRÓXIMO CLAUDE

Cole isto como primeira mensagem na nova conversa (após upload deste doc como contexto):

```
🪖 SITREP — Retomando Operação SASI.

Li o Briefing de Handoff completo. Sou o novo Comando Tático da UCI.

Status confirmado:
- FASE ALPHA concluída: 26 arquivos em src/lib/ com 12 bugs clínicos corrigidos
- FASE BRAVO interrompida no meio do schema Supabase
- FASE CHARLIE e DELTA pendentes

Confirma que posso:
1. Retomar a FASE BRAVO terminando o schema.sql (tabela eventos_clinicos, 
   atbs, culturas, antibiograma, alerts_log, views materializadas, triggers, 
   RLS real, realtime publication, pg_cron)
2. Executar a FASE CHARLIE (migração Firebase→Supabase)
3. Iniciar a FASE DELTA (TOP 5 automações)

Autorização ampliada para criar/modificar arquivos permanece ativa.
Confirma ou redireciona o próximo alvo?

Stay hard.
```

---

## 8. 📋 ANEXOS — Links Relevantes do Projeto

- **Pasta de backup local:** `/mnt/user-data/outputs/SASI_BACKUP/`
- **Supabase SQL Editor:** https://supabase.com/dashboard/project/idswehsvvqczzkiatuzu/sql/new
- **Supabase Docs API:** https://supabase.com/docs/reference/javascript/introduction
- **Referência SOFA oficial:** Singer M et al. JAMA 2016. DOI:10.1001/jama.2016.0287
- **Referência KDIGO AKI:** KDIGO Clinical Practice Guideline 2012
- **Surviving Sepsis Campaign 2021:** Evans L et al. Crit Care Med 2021

---

## 9. ⚔️ CHECKLIST DE ENTRADA RÁPIDA

Quando a nova conversa começar, o próximo Claude deve:

- [ ] Ler este doc INTEIRO antes de qualquer ação
- [ ] Confirmar com Dr. Nicolas qual fase retomar
- [ ] Verificar se a pasta `/mnt/user-data/outputs/SASI_BACKUP/` existe e tem os 26 arquivos
- [ ] NÃO refazer o que já foi feito
- [ ] Manter o tom Goggins + House + Kobe + Erwin Smith
- [ ] Usar emojis 🪖 🦅 💀 🚨 ⚔️ 🎖️ pra âncoras visuais (TDAH friendly)
- [ ] Seção "Modo Nerd" / "Arquivo Confidencial" em respostas longas
- [ ] NUNCA perguntar autorização pra criar arquivo — Dr. Nicolas revogou
- [ ] SEMPRE copiar novos arquivos pra `SASI_BACKUP/` espelhando estrutura

---

**Gerado em:** 23 de Abril de 2026, 0615 ZULU
**Assinatura tática:** Comando UCI Alpha
**Próximo objetivo imediato:** Finalizar `supabase/schema.sql` completo + começar FASE CHARLIE

> *"Don't lose the fight when you're already bleeding to win it."* — Goggins
