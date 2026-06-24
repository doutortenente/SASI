---
title: Delta - 03-clinical-sanity-checks.md
origin: /home/dr/Downloads/Files_to_claudecode/SASI_codigo_fonte/Fase Delta/Delta - 03-clinical-sanity-checks.md.docx
ingested: 2026-06-24
kind: docx
---
# 🚨 Sanity Checks Clínicos — Zero-Hallucination Validation

Toda extração passa por esta malha. Campo fora da malha → requires_review: true + warning.

Princípio não-negociável: a malha NÃO corrige o valor. Apenas sinaliza. O médico decide. O sistema não é responsável por "melhorar" o que o OCR leu — é responsável por gritar quando o valor é clinicamente implausível.

## 🫁 Respiratório

Coerência gaso: se pH normal mas pCO2 > 60 e HCO3 < 20 → provavelmente OCR trocou dígitos, flagar.

## 🫀 Hemodinâmico

Coerência PA: pa_dia > pa_sys → inverter? NÃO. Marcar flag: data_inversion_suspected e retornar ambos como estão. Coerência PAM: PAM ≈ (PAS + 2·PAD) / 3. Se o valor extraído diverge do calculado em > 15 mmHg, marcar review.

## 💧 Renal / BH

## 🩸 Hematologia

## 💊 DVAs e dose máxima razoável

Não são limites absolutos — são red flags que sugerem erro de OCR/diluição.

Dose absurda baixa (Nor < 0,001): provável erro de vírgula; flagar dose_absurd_low.

Use calcDoseInfusao de src/lib/calculations/infusao.ts para o cálculo real a partir de vazão + diluição + peso.

## 🔗 Incompatibilidades clínicas que disparam alerta

## Droga VO com SNE

Se prescrição tem via: Oral E paciente tem SNE documentada → flag clinical_incompatibility.

Exceções (podem ser trituradas e dadas por SNE):

Paracetamol, dipirona, omeprazol (cápsulas NÃO, comprimidos sim), metformina, captopril.

Nunca pode SNE (sublingual/liberação prolongada):

Nifedipina retard, morfina MST, diazepam SL, nitroglicerina SL, qualquer XR/SR/LP.

## Glicemia em jejum absurda

Jejum declarado + glicemia > 200 mg/dL → flag review (DM não-controlado ou hiperglicemia de estresse)

Jejum declarado + glicemia < 40 → flag critical_alert (hipoglicemia severa)

## pH + HCO3 incongruente

pH > 7,5 + HCO3 < 20 → matematicamente impossível sem pCO2 muito baixo → flag coerência gaso

## SOFA cardio sem peso

Dose de Nor em mcg/kg/min exige peso. Se peso = null → SOFA cardio retorna null com missing: ['peso']. NÃO assuma 70kg.

## 📅 Sanity de datas/timestamps

Data da folha no futuro → flag date_future

Data da folha > 7 dias antes de hoje → flag date_stale

Horário com AM/PM em formato BR → BR usa 24h, se aparecer AM/PM suspeitar erro de OCR.

## 🧠 Conduta com flags

Fluxo:

Extrair o valor.

Rodar a malha de ranges.

Se flag: adicionar ao warning array + setar requires_review: true do evento.

NÃO bloquear o payload — ele segue pro Supabase.

O frontend renderiza com cor amarela (review) ou vermelha (physiological_error) pra chamar atenção.

A inteligência fica no frontend e no intensivista. O OCR é dumb-and-honest: leu assim, reporta assim, com flag se está estranho.

## Modo Nerd — Por que não corrigir automaticamente

Corrigir "silenciosamente" um SpO2 de 145% pra 95% é iatrogenia computacional. Cria confiança falsa no pipeline. O princípio zero-hallucination do docx CAME-VKG está correto nisto: dado errado deve propagar errado com flag, não virar dado "melhorado" por suposição.

O custo de sinalizar um valor estranho é 1 segundo de review do médico. O custo de mascarar um erro é um paciente morrendo por decisão baseada em dado inventado. A assimetria é gritante.
