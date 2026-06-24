---
title: SASI_Pipeline_Status
source: /home/dr/Downloads/Files_to_claudecode/SASI_codigo_fonte/SASI_Pipeline_Status.xlsx
imported: 2026-06-24
kind: xlsx
---
## Sheet: 1_SITREP

| 🪖 OPERAÇÃO SASI — SITREP EXECUTIVO |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
| Data do briefing: 23-Abril-2026 · Assinatura: Comando UCI Alpha |  |  |  |  |  |
| Fase | Nome | Status | Progresso | Bloqueio atual | Próxima ação |
| ALPHA | Refator da Lógica Clínica | CONCLUÍDA | 100% | Nenhum | Testes faltantes dos outros módulos (P2) |
| BRAVO | Schema Supabase Definitivo | EM CURSO | 55% | Interrompida no meio do schema.sql | Finalizar eventos_clinicos + atbs + culturas + RLS + cron |
| CHARLIE | Migração Firebase → Supabase | PENDENTE | 10% | Depende de BRAVO + arquivos supabaseClient.ts e useSupabasePatients.ts já esboçados | Dual-write 1 semana → read migration → decommission |
| DELTA | Automações TOP 5 (D-ATB, BH, P/F, SAT/SBT, dose) | BACKLOG | 0% | Aguarda CHARLIE operacional | Edge Function gemini-import + ocr-ingest |
| 📊 MÉTRICAS DE COMBATE |  |  |  |  |  |
| Métrica | Valor | Observação tática |  |  |  |
| Arquivos lib criados | 26.0 | src/lib/ (types, constants, dictionaries, calculations, guards, scores, alerts) |  |  |  |
| Bugs P0 corrigidos | 6 de 6 | 100% — SOFA Cardio/Neuro/Resp/Renal + Sepsis-3 ΔSOFA + hasInfec |  |  |  |
| Bugs P1 corrigidos | 6 de 6 | 100% — parseFloatBR, coercePlaquetas, coerceFiO2, dose absurda, pam1/pam2, crypto.randomUUID |  |  |  |
| Bugs P2 pendentes | 4 de 7 | 57% de débito técnico remanescente (slots fixos, diureseHoras, NEWS2, defaults de ausculta) |  |  |  |
| Testes unitários | 40+ casos | Apenas em sofa.test.ts — falta cobertura dos outros módulos |  |  |  |
| Leitos totais operacionais | 33 | UTI2=12 + UTI3=13 + UTI4=8 |  |  |  |
| Backend atual | Firebase Firestore | EM DECOMISSIONAMENTO — key anônima exposta |  |  |  |
| Backend alvo | Supabase Postgres + Realtime | Projeto provisionado, schema incompleto |  |  |  |
| Risco LGPD atual | ALTO | RLS usando using(true) na doc antiga — violação direta do Art. 46 |  |  |  |
| Gemini API Key | EXPOSTA NO CLIENTE | Mover pra Edge Function na FASE DELTA |  |  |  |

## Sheet: 2_Pipeline_Dados

| 🦅 PIPELINE DE DADOS — DA CAPTURA AO SOFA |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
| Fluxo alvo: AppSheet (OCR prontuário / formulário médico) → Google Sheets → Gemini 2.5 Flash (normalização) → Webhook → Edge Function Supabase → eventos_clinicos → Realtime → Frontend SASI |  |  |  |  |  |
| # | Etapa | Tecnologia | Input | Output | Status |
| 1.0 | Captura no leito | AppSheet app mobile · Google Form | Foto do prontuário · Campos preenchidos manualmente (PAM, lactato, DU, FiO2, doses DVA) | Linha em Google Sheets (timestamp, paciente_id, campo, valor bruto) | PENDENTE |
| 2.0 | Normalização por IA | Gemini 2.5 Flash (via API server-side) | Linha de Sheets bruta (texto OCR / valores inconsistentes em BR-locale) | JSON estruturado {paciente_id, tipo, valor_num, unidade, ts} | PENDENTE |
| 3.0 | Ingestão | Supabase Edge Function (Deno/TypeScript) | Webhook POST de Gemini/AppSheet com JSON validado | INSERT em eventos_clinicos + trigger de recálculo SOFA | PENDENTE — precisa supabase/functions/ocr-ingest/ |
| 4.0 | Persistência | PostgreSQL 15 (Supabase) | INSERT eventos_clinicos(tipo, valor_num, unidade, ts, fonte) | Linha na tabela + trigger sofa_cache_invalidate | SCHEMA INCOMPLETO — tabela eventos_clinicos pendente |
| 5.0 | Recálculo SOFA | Função lib src/lib/scores/sofa.ts (getSOFA) | Patient atualizado (ou leitura da evolucao corrente) | SOFAResult {total, components, detail, warnings, suppressed} | CONCLUÍDO (FASE ALPHA) |
| 6.0 | Propagação Realtime | Supabase Realtime (Postgres CDC + WebSocket) | postgres_changes em evolucoes + eventos_clinicos | Push para clientes conectados — hook useSupabasePatients | HOOK ESBOÇADO (useSupabasePatients.ts existe mas depende do schema) |
| 7.0 | Renderização clínica | React + Tailwind (Dashboard.tsx + PatientCard.tsx) | DashboardRow[] da view vw_dashboard_uti | Card do leito com SOFA delta, alertas cor-codificados, gráfico 72h | USANDO FIREBASE — migração pendente (CHARLIE) |
| 8.0 | Alertas clínicos | src/lib/alerts/engine.ts (runAllAlerts) | Patient + SOFAResult | Alert[] 7 sub-engines (hemo, resp, renal, infecto, metabólico, medicação, sepse) | CONCLUÍDO — falta persistir em alerts_log (FASE BRAVO) |
| 9.0 | Stewardship ATB | View materializada vw_dias_atb_ativo + trigger atb_dias_auto | tabela atbs(data_inicio, data_fim_prevista, intencao) | D-ATB automático por paciente + alerta de suspensão/desescalonamento | PENDENTE — depende de atbs + trigger (FASE BRAVO) |
| 10.0 | Passagem de plantão | Edge Function handoff-pdf.ts + jsPDF | pacientes ativos + últimas evoluções + alertas ativos | PDF one-click pra handoff (TOP 5 automações) | BACKLOG (FASE DELTA) |
| 🎯 DIAGRAMA DA ARQUITETURA ALVO |  |  |  |  |  |
|  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────────────┐ │  AppSheet/Form   │──▶  │  Google Sheets   │──▶  │  Gemini 2.5 Flash        │ │  (médico/leito)  │     │  (tabular bruto) │     │  (normaliza + estrutura) │ └──────────────────┘     └──────────────────┘     └───────────┬──────────────┘                                                               │ JSON                                                               ▼ ┌──────────────────────────────────────────────────────────────────────────┐ │       SUPABASE EDGE FUNCTION   supabase/functions/ocr-ingest/index.ts    │ │       - valida schema JSON                                               │ │       - parseFloatBR em todos os numéricos                               │ │       - auth: verifica service-role JWT                                  │ │       - INSERT em eventos_clinicos                                       │ └───────────────────────────────────┬──────────────────────────────────────┘                                     │                                     ▼ ┌──────────────────────────────────────────────────────────────────────────┐ │       POSTGRESQL (Supabase)                                              │ │       ┌────────────┐  ┌────────────┐  ┌──────────────────┐               │ │       │ pacientes  │  │ evolucoes  │  │ eventos_clinicos │               │ │       └─────┬──────┘  └─────┬──────┘  └─────────┬────────┘               │ │             │               │                   │                        │ │             │    trigger: sofa_cache_invalidate │                        │ │             ▼               ▼                   ▼                        │ │       ┌──────────────────────────────────────────────┐                   │ │       │ views materializadas:                        │                   │ │       │  vw_sofa_trend_72h · vw_bh_acumulado        │                   │ │       │  vw_dias_atb_ativo · vw_dashboard_uti       │                   │ │       └──────────────────────────────────────────────┘                   │ └───────────────────────────────────┬──────────────────────────────────────┘                                     │ Realtime (postgres_changes)                                     ▼ ┌──────────────────────────────────────────────────────────────────────────┐ │       FRONTEND — React + Vite + Tailwind                                 │ │       - src/hooks/useSupabasePatients.ts (Realtime WebSocket)            │ │       - src/hooks/useClinicalAlerts.ts (roda runAllAlerts em cada push)  │ │       - Dashboard.tsx / PatientCard.tsx (cards por leito)                │ └──────────────────────────────────────────────────────────────────────────┘  |  |  |  |  |  |

## Sheet: 3_Arquivos

| 📁 ARQUIVOS — INVENTÁRIO DE CÓDIGO |  |  |  |  |
| --- | --- | --- | --- | --- |
| Pasta | Arquivo | Status | Fase | Função tática |
| src/lib/types/ | patient.ts | OK | ALPHA | Interface Patient + ATB/Cultura/Escala tipados |
| src/lib/types/ | clinical.ts | OK | ALPHA | SOFAResult, DoseResult, SepsisAssessment, Alert |
| src/lib/types/ | index.ts | OK | ALPHA | Barrel export |
| src/lib/constants/ | thresholds.ts | OK | ALPHA | HEMO/RESP/RENAL/NEURO/INFECTO thresholds |
| src/lib/constants/ | sofa-cutoffs.ts | OK | ALPHA | Tabela oficial Singer 2016 + mortalidade |
| src/lib/constants/ | index.ts | OK | ALPHA | Barrel |
| src/lib/dictionaries/ | dva.ts | OK | ALPHA | DVA_DICT (Nor, Adr, Dobuta, Vaso, Nipride) |
| src/lib/dictionaries/ | sedacao.ts | OK | ALPHA | SEDACAO_DICT (Fent, Midaz, Propofol, Precedex) |
| src/lib/dictionaries/ | escalas.ts | OK | ALPHA | ESCALAS_NEURO_DICT |
| src/lib/dictionaries/ | antibioticos.ts | PARCIAL | ALPHA | Esqueleto inicial — falta popular |
| src/lib/dictionaries/ | index.ts | OK | ALPHA | Barrel |
| src/lib/calculations/ | parseBR.ts | OK | ALPHA | parseFloatBR, formatFloatBR, isAbsurdo |
| src/lib/calculations/ | infusao.ts | OK | ALPHA | calcDoseInfusao + isVasopressorHighDose |
| src/lib/calculations/ | diurese.ts | OK | ALPHA | calcDiureseEfetiva + KDIGO staging |
| src/lib/calculations/ | ratios.ts | OK | ALPHA | P/F, ROX, Shock Index, Clearance Lactato |
| src/lib/calculations/ | index.ts | OK | ALPHA | Barrel |
| src/lib/guards/ | unitCoercion.ts | OK | ALPHA | coercePlaquetas, coerceFiO2, coerceTAX, coerceGCS |
| src/lib/guards/ | index.ts | OK | ALPHA | Barrel |
| src/lib/scores/ | sofa.ts | OK | ALPHA | getSOFA + 6 componentes + warnings |
| src/lib/scores/ | qsofa.ts | OK | ALPHA | getQSOFA |
| src/lib/scores/ | sepsis.ts | OK | ALPHA | assessSepsis (Sepsis-3 com ΔSOFA) |
| src/lib/scores/ | news2.ts | FALTA | ALPHA | Bug P2 #18 — implementar NEWS2 |
| src/lib/scores/ | apache2.ts | FALTA | ALPHA | Bug P2 #18 — implementar APACHE II |
| src/lib/scores/ | index.ts | OK | ALPHA | Barrel |
| src/lib/alerts/ | engine.ts | OK | ALPHA | 7 sub-engines (hemo/resp/renal/infecto/metabol/med/sepse) |
| src/lib/alerts/ | index.ts | OK | ALPHA | Barrel |
| src/lib/__tests__/ | sofa.test.ts | OK | ALPHA | 40+ casos Vitest |
| src/lib/__tests__/ | sepsis.test.ts | FALTA | ALPHA | Bug P2 #14 — cobrir ΔSOFA + fallback |
| src/lib/__tests__/ | alerts.test.ts | FALTA | ALPHA | Bug P2 #14 — cobrir 7 sub-engines |
| src/lib/ | clinical-logic-compat.ts | OK | ALPHA | Camada de compatibilidade com API original |
| supabase/ | schema.sql | PARCIAL | BRAVO | users, pacientes, evolucoes criados; falta eventos_clinicos, atbs, culturas, antibiograma, alerts_log, views, triggers, RLS, cron |
| supabase/migrations/ | 001_initial.sql | FALTA | BRAVO | Migration versionada pra deploy reprodutível |
| src/lib/ | supabaseClient.ts | ESBOÇADO | CHARLIE | Client singleton + types Paciente/Evolucao/EventoClinico/Pendencia/DashboardRow |
| src/hooks/ | useSupabasePatients.ts | ESBOÇADO | CHARLIE | CRUD + Realtime + importFromFirebase |
| src/hooks/ | useClinicalAlerts.ts | FALTA | CHARLIE | Hook que consome runAllAlerts a cada update Realtime |
| src/ | App.tsx | USANDO FIREBASE | CHARLIE | MIGRAR — trocar firebase.ts por supabaseClient.ts |
| src/ | firebase.ts | DECOMISSIONAR | CHARLIE | Deletar após 7 dias de dual-write estável |
| src/components/ | Dashboard.tsx | ADAPTAR | CHARLIE | Trocar cloudStatus de firebase pra supabase |
| src/components/ | PatientCard.tsx | ADAPTAR | CHARLIE | Já usa compat layer — trocar só a fonte de dados |
| supabase/functions/ | ocr-ingest/index.ts | FALTA | DELTA | Webhook AppSheet → valida → INSERT eventos_clinicos |
| supabase/functions/ | gemini-import/index.ts | FALTA | DELTA | Esconder Gemini API key + normalizar prontuário |
| supabase/functions/ | handoff-pdf/index.ts | FALTA | DELTA | Passagem plantão one-click PDF (TOP 5) |
| supabase/functions/ | daily-summary/index.ts | FALTA | DELTA | Resumo Gemini 24h por paciente |
| supabase/functions/ | sofa-delta-trigger/ | FALTA | DELTA | Detecta ΔSOFA ≥ 2 em 24h e registra evento |
| TOTAL | 44 | 25 OK / 11 FALTA |  |  |

## Sheet: 4_Kill_Board_Bugs

| 💀 KILL BOARD — 19 BUGS DA AUDITORIA |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
| # | Prioridade | Bug | Subsistema | Status | Correção |
| 1.0 | P0 | SOFA Cardio ignorava peso + diluição em nor/epi | scores/sofa | CORRIGIDO | usa calcDoseInfusao real |
| 2.0 | P0 | SOFA Neuro pontuava GCS baixo sob sedação profunda | scores/sofa | CORRIGIDO | flags sobSedacao + preSedationGCS |
| 3.0 | P0 | Sepsis-3 usava SOFA absoluto em vez de ΔSOFA | scores/sepsis | CORRIGIDO | assessSepsis aceita baseline |
| 4.0 | P0 | hasInfec fraco: ignorava hipotermia/leucopenia; contava profilaxia | scores/sepsis | CORRIGIDO | ATBs com intencao; hipotermia + leucopenia detectadas |
| 5.0 | P0 | SOFA Resp não diferenciava VM ativa vs não-VM | scores/sofa | CORRIGIDO | sofaResp recebe flag onVM |
| 6.0 | P0 | SOFA Renal ignorava DU e TRRC | scores/sofa | CORRIGIDO | cross-ref com calcDiureseEfetiva + flag trrc |
| 7.0 | P1 | parseFloat('37,5') quebrava com vírgula BR | calculations | CORRIGIDO | parseFloatBR aplicado em TODO motor |
| 8.0 | P1 | Plaquetas: heurística frágil de unidade | guards | CORRIGIDO | coercePlaquetas com plaqUnit explícito |
| 9.0 | P1 | FiO2 fração vs percentual (0.4 vs 40) | guards | CORRIGIDO | coerceFiO2Input normaliza 21-100 |
| 10.0 | P1 | Dose absurda silenciosa em calcDoseInfusao | calculations | CORRIGIDO | warnings absurd_high/absurd_low |
| 11.0 | P1 | pam1 vs pam2 ambíguo | types | CORRIGIDO | pam1 = MIN (valor pior) |
| 12.0 | P1 | IDs com Math.random (colisão possível) | utils | CORRIGIDO | crypto.randomUUID + fallback SSR |
| 13.0 | P2 | any em toda assinatura | types | PARCIAL | interface Patient criada — restam componentes React |
| 14.0 | P2 | Zero testes unitários | testing | PARCIAL | 40+ casos em sofa.test.ts — faltam outros módulos |
| 15.0 | P2 | impressao/conduta com slots fixos [4,4,3] | schema | PENDENTE | Schema Supabase permite arrays ilimitados — UI adaptar |
| 16.0 | P2 | diureseHoras hardcoded | UI | PENDENTE | Cosmético — campo livre agora |
| 17.0 | P2 | Culturas sem antibiograma estruturado | types | PARCIAL | Interface Antibiograma existe — UI ainda não usa |
| 18.0 | P2 | Só calcula SOFA — faltam qSOFA/NEWS2/APACHE | scores | PARCIAL | qSOFA implementado — NEWS2 + APACHE pendentes |
| 19.0 | P2 | Defaults de ausculta preenchidos (miniaturizam exame) | UI | PENDENTE | Mudança de UX — manter por ora |
| KPI | P0 corrigidos: | 6/6 | P1 corrigidos: | 6/6 | 3 de 7 P2 pendentes |

## Sheet: 5_Roadmap

| ⚔️ ROADMAP TÁTICO — PRÓXIMAS 8 SEMANAS |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Sprint | Semana | Fase | Entregáveis | Ambiente | Risco | Bloqueadores | Gate de saída |
| S1 | 24-30 Abr | BRAVO parte 2 | schema.sql COMPLETO (eventos_clinicos particionado, atbs, culturas, antibiograma, alerts_log, 4 views materializadas, 3 triggers, RLS com auth.uid, publication Realtime, 2 jobs pg_cron) | Claude.ai (SQL) | Baixo — artefato isolado | Credenciais Supabase já OK | Schema aplicado no SQL Editor SEM erro + types TS gerados |
| S2 | 01-07 Mai | CHARLIE parte 1 | Finalizar supabaseClient.ts + useSupabasePatients.ts + useClinicalAlerts.ts + .env.example | Claude Code | Médio | Precisa GitHub MCP + Supabase CLI local | npm run type-check OK + hooks exportam API igual ao Firebase |
| S3 | 08-14 Mai | CHARLIE parte 2 (dual-write) | App.tsx escreve em Firebase E Supabase simultâneo — observabilidade de discrepância | Claude Code | ALTO — produção | Feature flag DUAL_WRITE + logging estruturado | 7 dias sem discrepância > 0 pacientes |
| S4 | 15-21 Mai | CHARLIE parte 3 (read migration) | App.tsx lê de Supabase Realtime, Firebase vira backup | Claude Code | ALTO | Verificar que Realtime WebSocket não cai sob carga de plantão | Usuários de plantão confirmam latência < 2s |
| S5 | 22-28 Mai | CHARLIE parte 4 (decommission) | Deletar firebase.ts, revogar keys Firebase, remover dependência do package.json | Claude Code | Baixo | Nenhum | bundle size reduzido + deploy sem Firebase SDK |
| S6 | 29 Mai-04 Jun | DELTA parte 1 | Edge Function gemini-import (esconde API key) + ocr-ingest (webhook AppSheet) | Claude Code + Supabase CLI | Médio | Precisa AppSheet configurado + Gemini API key no vault Supabase | Teste E2E: foto prontuário → aparece em eventos_clinicos |
| S7 | 05-11 Jun | DELTA parte 2 | TOP 5 automações: D-ATB auto, BH acumulado, P/F auto, SAT/SBT lembrete, dose mcg/kg/min alertada | Claude Code | Médio | Depende de schema BRAVO estar sólido | Cada automação tem teste unitário + alerta dispara em caso real |
| S8 | 12-18 Jun | DELTA parte 3 | Passagem plantão one-click PDF + resumo Gemini 24h + SOFA-delta trigger | Claude Code + pdf skill | Baixo | Nenhum | Plantonista gera PDF em < 5s sem editar manualmente |

## Sheet: 6_MCPs_Ferramentas

| 🛠️ ARSENAL RECOMENDADO — MCPs, SKILLS & FERRAMENTAS |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
| Prioridade | Ferramenta | Tipo | Status atual | ROI pro SASI | Ação recomendada |
| P0 🔥 | Supabase MCP | MCP connector | INSTALADO | ALTO — acelera 40% da FASE BRAVO | Manter — usar ativamente na próxima sessão |
| P0 🔥 | GitHub MCP | MCP connector | NÃO instalado | CRÍTICO — FASE CHARLIE sem PR = suicídio | Settings → Connectors → Add GitHub |
| P0 🔥 | Obsidian + plugin MCP | Knowledge base | NÃO instalado | ALTO — segundo cérebro pro TDAH+AH/SD | Baixar Obsidian + criar vault "SASI-Doctrine" |
| P0 🔥 | Claude Code (terminal) | Ambiente | NÃO instalado | CRÍTICO pra FASES CHARLIE e DELTA | npm install -g @anthropic-ai/claude-code |
| P0 🔥 | Skill custom sasi-doctrine | Claude Skill | NÃO criada | ALTO — economiza 2-3k tokens por sessão | Settings → Capabilities → Skills → Create |
| P1 🟡 | Supabase CLI local | CLI | NÃO instalado | ALTO pra Edge Functions | npm install -g supabase |
| P1 🟡 | Sentry MCP | MCP connector | NÃO instalado | ALTO — error tracking pós-deploy | Settings → Connectors → Sentry |
| P1 🟡 | Playwright MCP | MCP connector | NÃO instalado | MÉDIO — testes E2E do dashboard | Ativar quando entrar FASE DELTA |
| P1 🟡 | Linear MCP | MCP connector | NÃO instalado | MÉDIO — roadmap rastreável | Alternativa ao Notion pra issues |
| P2 🔵 | Webhook.site | Browser tool | NÃO necessita MCP | MÉDIO — debug de Edge Function | Abrir no browser quando precisar — sem integração |
| P2 🔵 | Figma MCP | MCP connector | NÃO instalado | BAIXO — UI atual já funcional | Só se redesenhar Dashboard do zero |
| P3 ⏸️ | n8n | Automation | NÃO instalado | BAIXO — Edge Function + pg_cron resolvem | HOLD — só se orquestração virar multi-destino |
| P3 ⏸️ | Miro MCP | Whiteboard | INSTALADO | BAIXO — Mermaid/Obsidian Canvas resolvem | Manter mas NÃO priorizar |
| N/A | Gmail MCP | Email | INSTALADO | Útil pra notificações de sistema | Manter ativo |
| N/A | Google Drive MCP | Arquivos | INSTALADO | Útil pra backup dos schemas | Manter ativo |
| N/A | Notion MCP | Docs | INSTALADO | Útil pra documentação clínica | Manter — pode virar backup do Obsidian |
