---
tags: [sasi, template, evolucao, reference, legado-v1]
nota: "Versão legada (v1). O canônico atual é 04-export-evolucao-template_v2.md. Mantido por histórico."
---

# 🖋️ Exportar Evolução — Template de Nota de Prontuário (v1 — LEGADO)

> ⚠️ Versão antiga. O template canônico em uso é o **v2** (`04-export-evolucao-template_v2.md`), ancorado no TEMPLATE-BASE Ramo C. Este arquivo é mantido só por histórico de evolução do projeto.

Produz texto **copiável e colável** direto na evolução oficial do prontuário eletrônico.

**Entrada esperada:** snapshot da evolução (JSONB completo) + dados cadastrais do paciente + histórico de 72h (se disponível).
**Saída:** Markdown estruturado, estilo SOAP adaptado à realidade UTI brasileira.

---

## 📐 Estrutura padrão (v1)

```markdown
# Evolução — {DATA} — {PLANTAO} — Leito {LEITO} {UTI}

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
```

---

## 🔧 Regras de preenchimento (v1)

### Campos vazios
Se um campo está `null` no snapshot, **NÃO escreva** `null` ou `N/A`. Omita a linha inteira OU escreva `não avaliado` se for um sistema inteiro. Ex: se `resp.pao2 = null`, não calcule P/F. Escreva `P/F: gaso pendente`.

### DVAs formatados
Padrão: `{Droga} {dose formatada}`. Lista múltiplas vírgula-separada.
```
Nor 0.28 mcg/kg/min, Vaso 0.04 UI/min
```
Se em desmame: `Nor 0.15 mcg/kg/min (desmame)`. Se recém-iniciado: `Nor 0.20 mcg/kg/min (iniciado 06h hoje)`.

### Ventilação mecânica
```
IOT + VMC modo PSV: PEEP 8, PS 12, FiO2 35%, Vt 460 mL (6.8 mL/kg), FR 16, SpO2 96%. P/F 291 (lesão pulmonar leve).
```

### Culturas positivas
```
Hemocultura 22/04: E. coli ESBL (S a meropenem, polimixina; R a ceftriaxona, cefepime) → em meropenem 1g 8/8h desde D-3.
```

### Impressão (bullets concisos, 3-5 linhas)
```
- Choque séptico foco abdominal em desmame de DVA (Nor em redução).
- IRA KDIGO 2 por débito (oligúria persistente apesar de PAM 70), sem acidose severa.
- Sob VM em modo PSV, P/F 291 — próxima etapa SBT se tolerar.
```

### Conduta (verbos no imperativo, priorizados)
```
1. Manter desmame de Nor — meta PAM > 65 sem expansão.
2. SBT hoje 09h se tolerar PS 8/PEEP 5 por 30 min (RSBI < 105).
3. Ajustar dose de meropenem pra Cl Cr estimado 35 — 1g 12/12h.
4. Gaso controle 14h. Cr + Na controle AM.
```
