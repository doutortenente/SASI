# Backlog clínico do SASI

> Funcionalidades clínicas que o **blueprint original** (`docs/legado/planilha-uti-estrutura.md`,
> era AppSheet, abr/2026) previa e que o SASI atual **ainda não faz**.
> Fonte de verdade do que falta — não é roadmap de banco (esse é `ROADMAP-BANCO.md`)
> nem limiares (`DECISOES-CLINICAS.md`).
>
> Doutrina ZERO ALUCINAÇÃO vale aqui também: nada que dependa de afirmar interação,
> dose ou conduta sem fonte rastreável entra "no escuro".

## Legenda
🔴 não existe · 🟡 parcial / em andamento · 🟢 feito (sai daqui quando concluir)

---

## 🟡 1. Ordenador de prescrição por sistema — EM ANDAMENTO (30-jun)
**Fonte:** planilha Fase 2 + "Comando 2 — Ordenador de Prescrições" (prompt do operador, 30-jun).
**O que é:** prescrição organizada e numerada por aparelho, com normalização de droga/dose/via/frequência e leitura de anotações à mão (suspender/modificar).
**Feito:** spec incorporada na skill `sasi-ingest-export` como modo de saída **D. Exportar Prescrição Ordenada** (`references/07-export-prescricao-ordenada.md`); 7 blocos canônicos por sistema.
**Falta:** persistir prescrição estruturada no banco (campo `sistema`); exibir o bloco por sistema no frontend.

## 🟡 2. Safety Check do intensivista — BASE CRIADA (30-jun)
**Fonte:** planilha Fase 3 + Comando 2 (seção "Análise do Intensivista Sênior").
**O que é:** varredura da prescrição × diagnóstico buscando interação, antagonismo, iatrogenia.
**Feito:** embutido no modo D da skill, em modo **CONSERVADOR** — só aponta contraindicação clássica e rastreável; sem achado → "nenhum risco imediato detectado". NUNCA inventa interação.
**Falta / cuidado:** base de interações com fonte (bulário/guideline) ou via RAG de protocolos. Hoje cobre só duplas clássicas de alto risco (ex: β-bloqueador em choque cardiogênico, laxante em obstrução, dupla de QT longo). É o item mais sujeito a alucinação — manter a trava da fonte.

---

## 🟡 A completar (já tem base, falta fechar)

| Item | Fonte | Estado | Falta |
|---|---|---|---|
| Patient Summary por aparelho | Fase 3 | tabela `patient_summary` existe, **vazia** | produtor que preencha a síntese sistêmica integrada |
| Laboratório serial ("Folhão") | aba Folhão | tendência existe (`trend_rules`, `vw_eventos_tendencia`) | visão lado a lado dia-a-dia (régua temporal) no frontend |
| Referências normais por exame | Fase 1 | parcial em `alert_rules`/sanity-checks | faixa de normalidade por exame pra flag out-of-range consistente |

---

## 🟡 3. SOFA automático — motor v1 (FASE B)
**Spec congelada:** `docs/SOFA-RULESET.md` (`SOFA1_v1.0_2026-06-30`) — cutoffs SOFA-1 + imputação determinística rastreável (GCS/diurese) + audit trail + versionamento.
**Feito (v0):** view `vw_sofa_diario` provisória (pior valor/dia, faltante=`null`, sem suporte vent. no resp, cardio só PAM+nor, sem audit trail).
**Falta (v1):** imputação (LOCF/carry-forward) + audit trail por componente + tabela materializada `sofa_janela` (view não persiste).
**Pré-requisitos de captura (skill, à montante):** (1) suporte ventilatório; (2) vasopressores por droga+dose; (3) RASS + GCS pré-sedação; (4) diurese mL/24h. Sem os 4, o v1 não roda fielmente — por isso atrás da captura.

---

## 🟢 Já estava pronto (não era gema)
- **Alerta de via SNE / trituração** — já implementado na skill como sanity-check
  (`references/03-clinical-sanity-checks.md`, "Droga VO com SNE": flag `clinical_incompatibility`
  + lista do que pode/não pode triturar). Removido do backlog em 30-jun (não era débito).

---

## Origem
Destilado de `docs/legado/planilha-uti-estrutura.md` em 30-jun-2026. O legado permanece arquivado;
este backlog é a leitura **acionável** do que dele ainda não foi construído.
