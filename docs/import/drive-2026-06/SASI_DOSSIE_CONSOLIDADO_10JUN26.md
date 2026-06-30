# 🪖 SASI — DOSSIÊ CONSOLIDADO DE OPERAÇÃO
## Resumo de todas as conversas do projeto + inventário do que foi produzido
**Compilado em:** 10-Jun-2026 · **Janela coberta:** 23-Abr-2026 → 10-Jun-2026 · **18 conversas mapeadas**

> Documento de síntese gerado a partir da varredura do histórico de conversas do projeto. Índice mestre da operação.

---

## 🎯 SÍNTESE EM UMA TELA

O projeto tem **dois eixos** que rodam em paralelo:

1. **Eixo TÉCNICO (SASI app)** — refator da lógica clínica → schema Supabase → migração Firebase→Supabase → automações. Fases ALPHA → BRAVO → CHARLIE → DELTA.
2. **Eixo CLÍNICO (uso real)** — documentação de plantão em produção: admissões, evoluções, casos, ingest, passagens de turno.

**Estado verificado no banco (10-Jun-2026):** 9 tabelas vivas, 5 views, 13 pacientes + 13 evoluções reais. ALPHA e BRAVO no ar. CHARLIE parcial. DELTA não iniciada. **Buraco crítico de LGPD ativo** (dev_bypass using(true) role public — PHI exposto via anon key).

---

## 🗓️ LINHA DO TEMPO — TODAS AS CONVERSAS

### 🔧 EIXO TÉCNICO
- **23-Abr — Integração Supabase e MCP:** Auditoria dos 19 bugs. Refator src/lib/ (26 arquivos). Início schema BRAVO. A conversa-mãe.
- **23-Abr — Continuação de tópico anterior:** FASE CHARLIE. Deploy do schema via apply_migration. 3 arquivos TS + .env.example.
- **24-Abr — Otimizando fluxo de trabalho:** Matriz de status por fase. Mapa de dívida técnica.
- **16-Mai — Análise comparativa de aplicativos:** App entrega ~40% da doutrina. SITREP-AUDITORIA + PLANO-ALPHA-BRIEFING.
- **01-Jun — Documentação de memória:** SASI_HANDOFF_GROK.md. Correção: _HANDOFF_BRIEFING STALE. Bloqueio GitHub MCP.

### 🩺 EIXO CLÍNICO
- **10-Mai — Hiperglicemia refratária:** Protocolo BIC, alvo 140–180, checklist técnico.
- **16-Mai — 💬 Adicione no sasi:** Caso L1 Sidnei hiponatremia 137→136→130. SIADH/CSW/hipovolêmico, Adrogué-Madias, DDAVP. Ingest UTI4 (5 pac).
- **17-Mai — Admissão pós-laparotomia:** Sepse abdominal + IRA. Aula NTA/NIC/NIA.
- **17-Mai — Admissão intoxicação + psiquiatria:** 6 admissões. SKILL.md admissao-uti v2.
- **18-Mai — Contenção farmacológica da agitação:** .docx 323 parágrafos.
- **19-Mai — Admissão IRPA + IRA KDIGO II:** Admissão Célia + análise crítica PS (8 erros). .docx 208 parágrafos.
- **23-Mai — Refinamento de skills:** Arquitetura Ramo C. _SASI_TEMPLATE_BASE_v2.md.
- **23-Mai — Admissão Arthur e evolução:** Ciclo UTI2 20–21/05. 3 discussões c/ evidência. Patch de bug.
- **25-Mai — Documentos de admissão:** Evoluções .docx (L02,03,04,09,12,13).
- **06-Jun — Evolução do novo plantão:** SITREP + 11 evoluções. 5 flags de segurança.
- **06-Jun — Labs para evolução noturna:** Módulos lab por leito. Flag lactato L10.
- **07-Jun — Casos pós-procedimento:** 9 evoluções markdown.
- **10-Jun — Transcrição de parâmetros:** Sinais vitais 24h de 8 leitos.

---

## 📦 INVENTÁRIO MESTRE

**A. Código src/lib/ (ALPHA, 26 arquivos):** types, constants, dictionaries, calculations, guards, scores, alerts, __tests__, compat. 19 bugs corrigidos. Pendentes: news2.ts, apache2.ts, sepsis.test.ts, alerts.test.ts.

**B. Backend Supabase:** schema.sql, smoke.sql, ocr-ingest. Tabelas: pacientes, evolucoes, eventos_clinicos, pendencias, atbs, culturas, antibiograma, alerts_log, ingest_audit_log. Views: vw_dashboard_uti, vw_sofa_trend_72h, vw_bh_acumulado, vw_dias_atb_ativo, vw_alertas_abertos.

**C. Frontend:** supabaseClient.ts, useSupabasePatients.ts, useClinicalAlerts.ts, FirebaseMigrationPanel.tsx, firebase-to-supabase.ts. Mapa Tático V3. PLANO-ALPHA-BRIEFING.md.

**D. Doutrina:** _SASI_TEMPLATE_BASE_v2.md, admissao-uti/SKILL.md v2, sasi-ingest-export/SKILL.md, templates de evolução/turno.

**E. Docs clínicos:** Contenção Farmacológica (323 par.), Admissão Célia (208 par.), dezenas de evoluções/admissões .docx.

**F. Handoff/meta:** _HANDOFF_BRIEFING.md (STALE), SASI_HANDOFF_GROK.md, README-FASE-BRAVO.md.

---

## 🚨 ALERTAS RECORRENTES
1. 🔴 LGPD ATIVO — dev_bypass using(true) role public anula _all_own. PHI exposto. P0.
2. 🔴 Meta-Vision cega — eventos_clinicos = 0 rows.
3. 🟡 Circuito de ingest aberto — atbs/culturas/alerts_log/ingest_audit_log vazias.
4. 🟡 useClinicalAlerts desconectado do entry point.

---

## ⚡ CONDUTA FINAL
1. P0 — Matar dev_bypass (confirmar auth do front antes).
2. P0 — Dual-write → popular eventos_clinicos.
3. P1 — Fechar pipeline ocr-ingest.
4. P1 — Wirar useClinicalAlerts.
5. P2 — Completar ALPHA (news2, apache2, testes).
6. DELTA — D-ATB auto, BH acumulado, P/F auto, passagem 1-click PDF, AppSheet.

---
*Dossiê gerado por SASI — Sistema de Auditoria e Síntese Intensiva · Comando Tático UCI*
