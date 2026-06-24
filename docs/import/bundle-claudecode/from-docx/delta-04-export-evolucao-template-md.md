---
title: Delta - 04-export-evolucao-template.md
origin: /home/dr/Downloads/Files_to_claudecode/SASI_codigo_fonte/Fase Delta/Delta - 04-export-evolucao-template.md.docx
ingested: 2026-06-24
kind: docx
---
# 🖋️ Exportar Evolução — Template de Nota de Prontuário

Produz texto copiável e colável direto na evolução oficial do prontuário eletrônico.

Entrada esperada: snapshot da evolução (JSONB completo) + dados cadastrais do paciente + histórico de 72h (se disponível).

Saída: Markdown estruturado, estilo SOAP adaptado à realidade UTI brasileira.

## 📐 Estrutura padrão

# Evolução — {DATA} — {PLANTAO} — Leito {LETIO} {UTI}

**{NOME}**, {IDADE}a, {PESO}kg — DH {DIAS_INTERNACAO}º DIA — HD: {HD}

{ALERGIAS_SE_HOUVER}

## Anamnese dirigida / Intercorrências 24h

{RESUMO_INTERCORRENCIAS}

## Exame físico por sistemas

**Neurológico:** {ESCALA_GCS/RASS} — {DETALHES_NEURO}

**Cardiovascular:** PA {PAS_MIN}–{PAS_MAX}/{PAD_MIN}–{PAD_MAX} mmHg (PAM {PAM_MIN}–{PAM_MAX}), FC {FC_MIN}–{FC_MAX} bpm, {PERFUSAO}. {DVAS_FORMATADOS}

**Respiratório:** {SUPORTE}, FiO2 {FIO2}%, FR {FR} ipm, SpO2 {SPO2}%. {AUSCULTA}. {PF_RATIO_SE_CALCULADO}

**TGI:** {DIETA}, {ABDOME}, {DEBITO_SNG_SNE}

**Renal:** Diurese {DIURESE} mL/{HORAS}h ({ML_KG_H} mL/kg/h), BH {BH} mL, Cr {CR}, Ur {UR}. {KDIGO_STATUS}

**Hematológico:** Hb {HB}, Plaq {PLAQ}×10³, Leuco {LEUCO}×10³, INR {INR}

**Infeccioso:** {ATBs_EM_CURSO}, {CULTURAS_POSITIVAS}

## Scores

SOFA {SOFA_TOTAL} (Resp {R}, Coag {C}, Hep {L}, Cardio {CV}, Neuro {N}, Renal {RN}). ΔSOFA 24h: {DELTA_SOFA}.

{QSOFA_SE_APLICAVEL}

## Impressão

{BULLETS_IMPRESSAO}

## Conduta

{BULLETS_CONDUTA}

---

*Assinatura: Dr. Nicolas — CRM {CRM} — Intensivista*

*Gerado por SASI — Sistema de Auditoria e Síntese Intensiva — v1.0*



## 🔧 Regras de preenchimento

## Campos vazios

Se um campo está null no snapshot, NÃO escreva null ou N/A. Omita a linha inteira OU escreva não avaliado se for um sistema inteiro.

Exemplo: se resp.pao2 = null, não calcule P/F e não escreva a linha. Escreva P/F: gaso pendente.

## DVAs formatados

Padrão: {Droga} {dose formatada}. Lista múltiplas vírgula-separada.

Nor 0.28 mcg/kg/min, Vaso 0.04 UI/min



Se em desmame: Nor 0.15 mcg/kg/min (desmame). Se recém-iniciado: Nor 0.20 mcg/kg/min (iniciado 06h hoje).

## Ventilação mecânica

IOT + VMC modo PSV: PEEP 8, PS 12, FiO2 35%, Vt 460 mL (6.8 mL/kg), FR 16, SpO2 96%. P/F 291 (lesão pulmonar leve).

## Culturas positivas

Hemocultura 22/04: E. coli ESBL (S a meropenem, polimixina; R a ceftriaxona, cefepime) → em meropenem 1g 8/8h desde D-3.

## Impressão (bullets concisos, 3-5 linhas)

- Choque séptico foco abdominal em desmame de DVA (Nor em redução).

- IRA KDIGO 2 por débito (oligúria persistente apesar de PAM 70), sem acidose severa.

- Sob VM em modo PSV, P/F 291 — próxima etapa SBT se tolerar.

## Conduta (verbos no imperativo, priorizados)

1. Manter desmame de Nor — meta PAM > 65 sem expansão.

2. SBT hoje 09h se tolerar PS 8/PEEP 5 por 30 min (RSBI < 105).

3. Ajustar dose de meropenem pra Cl Cr estimado 35 — 1g 12/12h.

4. Gaso controle 14h. Cr + Na controle AM.

5. Iniciar anticoag profilática HNF 5000 UI 8/8h (plaq > 50, INR 1.4).



## 🧠 Modo Nerd — Por que esse formato

A estrutura por sistemas (não cronológica) é o padrão UTI brasileiro porque permite ao plantonista entrante varrer em < 30 segundos o estado de cada órgão — exatamente o tempo que ele tem entre um paciente e outro no round de 33 leitos. É a visão do Isagi: cada sistema é uma variável; o estado total do paciente é a interação delas.

Por que SOFA + ΔSOFA obrigatórios: Sepsis-3 (JAMA 2016) exige ΔSOFA ≥ 2 pro diagnóstico. Sem a comparação com baseline, "SOFA 7" não te diz nada — pode ser paciente cirúrgico pós-op ou sepse. O ΔSOFA é o Meta-Vision que separa ruído de sinal.

Por que conduta numerada e não em prosa: cérebro em plantão é cérebro em débito de sono. Lista > parágrafo, sempre. TDAH-friendly, sono-friendly, emergência-friendly.

## Exemplo completo (preenchido)

# Evolução — 24/04/2026 — Manhã — Leito 7 UTI 3

**João Silva**, 68a, 72kg — DH 9º DIA — HD: Choque séptico foco abdominal (perfuração colônica pós-colectomia)

Alergias: nega.

## Anamnese dirigida / Intercorrências 24h

Paciente em 9º dia pós-laparotomia. Noite estável, sem intercorrências agudas. Desmame de Nor em andamento (de 0.35 pra 0.20 mcg/kg/min). Mantém febre baixa (37.8 °C axilar max). Débito urinário limítrofe.

## Exame físico por sistemas

**Neurológico:** GCS 10 (O3V3M4) pré-sedação. Sedação com Fentanil 50 mcg/h + Midaz 4 mg/h — RASS -2. Pupilas isocóricas fotorreagentes 3mm.

**Cardiovascular:** PA 88–135/52–82 mmHg (PAM 62–95), FC 78–112 bpm, perfusão periférica fria mas pulsos cheios. Nor 0.20 mcg/kg/min (desmame), Vaso 0.04 UI/min.

**Respiratório:** IOT + VMC modo PSV. PEEP 8, PS 12, FiO2 35%, Vt 460 mL (6.4 mL/kg), FR 18. SpO2 96%. MV+ bilateral com crepitantes em bases. Secreção moderada amarelada (TBA pendente). P/F 291.

**TGI:** NE a 45 mL/h por SNE, tolerando. Abdome globoso, doloroso à palpação profunda em FIE, RHA+. Débito de SNE 150 mL/24h (claro). Evacuação 1x/dia líquida.

**Renal:** Diurese 1100 mL/24h (0.64 mL/kg/h), BH −450 mL. Cr 1.8 (baseline 1.0 — KDIGO 2 por Cr), Ur 82. Na 138, K 4.2. Sem TRRC.

**Hematológico:** Hb 9.2 g/dL, Ht 28%, Plaq 180×10³/µL, Leuco 14.5×10³/µL (bastões 8%, desvio à esquerda), INR 1.4.

**Infeccioso:** Meropenem 1g 8/8h D-3 (hemocult + E. coli ESBL, S a meropenem). Suspenso vancomicina ontem (cultura negativa pra Gram+). Cateter central D-8 — sinais flogísticos ausentes.

## Scores

SOFA 10 (Resp 1 por P/F 291+VM, Coag 1 por plaq 180, Hep 0, Cardio 3 por Nor 0.20, Neuro suprimido por sedação, Renal 2 por Cr 1.8 + DU oligúrico KDIGO 2 → 3). ΔSOFA 24h: −1 (melhora). qSOFA 2 (FR > 22, GCS alterado).

## Impressão

- Choque séptico em desmame com boa resposta hemodinâmica (ΔSOFA −1).

- IRA KDIGO 2 persistente — cruzar Cr + débito, provável componente isquêmico prolongado.

- Sob VM PSV, P/F 291, próximo a critério de SBT.

- Anemia multifatorial (inflamatória + sangramento pós-op compensado).

## Conduta

1. Manter desmame de Nor — reduzir pra 0.15 mcg/kg/min em 2h se PAM > 65 estável.

2. SBT hoje 10h (PS 8/PEEP 5 por 30 min, avaliar RSBI).

3. Ajustar meropenem pra 1g 12/12h (Cl Cr estimada 35).

4. Reduzir sedação: Midaz 4→2 mg/h. Avaliar RASS 0 pra SBT.

5. Furosemida 40 mg EV agora se PAM mantida, pra reforçar diurese.

6. Gaso + lactato 14h. Cr + Na + K controle AM.

7. Anticoag profilática com HNF 5000 UI 8/8h.

8. Pendências: TC abdome de controle (6º dia pós-op), passar sonda de alívio se distensão progredir.

---

*Assinatura: Dr. Nicolas — CRM XXXXX — Intensivista*

*Gerado por SASI — Sistema de Auditoria e Síntese Intensiva — v1.0*


