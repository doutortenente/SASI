# SOFA automático — ruleset oficial

> **Versão:** `SOFA1_v1.0_2026-06-30` · **Status:** spec congelada (lei). Motor completo = FASE B.
> Define o cálculo do SOFA-1 (Sepsis-3) para automação de alerta em UTI: cutoffs, janela,
> pior valor, e **imputação determinística e auditável** para dados ausentes (GCS/diurese).
>
> **Fonte dos cutoffs:** SOFA original — Vincent JL et al, *Intensive Care Med* 1996;22:707-10;
> adotado pelo Sepsis-3 — Singer M et al, *JAMA* 2016;315(8):801-10. ⚠️ Ainda **não ancorado no
> acervo Vera/DOI** do projeto — validar e anexar PMID antes de uso clínico irrestrito.

---

## 1. Motor de cálculo
- **Janela:** 24h (rolling 24h **ou** D0/D1 por calendário institucional — escolher e versionar).
- **Pior valor:** por componente, pegar o pior valor na janela → subscore 0–4.
- **Total:** soma dos 6 subscores (0–24).
- **Desempate:** valor em mais de uma faixa → usa o **maior** subscore.
- **Sempre registrar:** `window_start/end`, `worst_value_timestamp` por componente,
  `ingest_source`, `confidence_index` (filtro ≥0,7 já vigente).

## 2. Cutoffs SOFA-1
Unidades: P/F em mmHg · plaquetas ×10³/µL · bilirrubina e creatinina mg/dL · vasopressores µg/kg/min.

| Sistema | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| **Respiratório** (P/F) | >400 | ≤400 | ≤300 | ≤200 **c/ suporte vent.** | ≤100 **c/ suporte vent.** |
| **Coagulação** (plaq) | >150 | ≤150 | ≤100 | ≤50 | ≤20 |
| **Fígado** (BT) | <1,2 | 1,2–1,9 | 2,0–5,9 | 6,0–11,9 | >12,0 |
| **Cardiovascular** | PAM ≥70 sem droga | PAM <70 sem droga | dopa ≤5 ou dobuta (qualquer) | dopa >5 ou adr ≤0,1 ou nor ≤0,1 | dopa >15 ou adr >0,1 ou nor >0,1 |
| **SNC** (GCS) | 15 | 13–14 | 10–12 | 6–9 | <6 |
| **Renal** (Cr / diurese) | Cr <1,2 | 1,2–1,9 | 2,0–3,4 | 3,5–4,9 ou diurese <500 mL/d | >5,0 ou diurese <200 mL/d |

**Definições operacionais (configuráveis e versionadas):**
- "suporte ventilatório": VM invasiva conta sempre. NIV/HFNC → decidir em config (varia por instituição).
- vasopressor só conta se mantido ≥60 min na janela (reduz ruído).
- renal: `renal_score = max(creat_score, uo_score)` quando ambos existem.

## 3. Imputação para ausência (determinística, rastreável)
**Princípios:** nunca transformar "missing" em disfunção; toda imputação carrega `imputed=true` + `imputation_method`; alerta explicável (qual dado faltou, o que foi feito, impacto no SOFA).

**GCS ausente (SNC), em ordem:**
1. GCS pré-sedação/pré-intubação + carry-forward enquanto sedado/intubado.
2. Proxy neurológico: melhor resposta motora; AVPU→GCS (se registrado).
3. Sem dado neuro confiável → imputar normal (GCS=15, SNC=0) + flag `CNS_IMPUTED_NORMAL_NO_DATA`.
- **Trava de alerta:** se ΔSOFA ≥2 depender de CNS imputado, exigir ≥1 ponto do delta vindo de componente **observado**, ou reduzir `alert_confidence`.

**Diurese ausente (renal):**
- diurese ausente + creatinina presente → usa creatinina, **não** imputa diurese.
- creatinina ausente + diurese presente → usa diurese.
- ambas ausentes → `renal=0` + flag `RENAL_IMPUTED_NORMAL_ALL_MISSING` e **bloquear alerta renal** dessa janela até surgir dado observado.

**Política temporal:**
- 1ª janela (D0/D1): missing → normal (0).
- janelas seguintes: missing → LOCF por **apenas 1** janela; depois `NO_DATA` (sem imputação indefinida).

## 4. Audit trail obrigatório (por paciente × janela)
**Por componente:** `raw_values[]{value,unit,timestamp,source,confidence}`, `worst_value_used`+ts,
`component_score`, `observed`(bool), `imputed`(bool), `imputation_method`
(ENUM: `PRESEDATION_CARRY_FORWARD`/`MOTOR_ONLY`/`AVPU_TO_GCS`/`LOCF`/`NORMAL_VALUE`/`NO_DATA`),
`imputation_inputs`, `consecutive_imputed_windows`.
**Por total:** `sofa_total_observed_only`, `sofa_total_with_imputation`, `delta_sofa`,
`delta_components[]`, `alert_confidence` (com penalidade se delta depende de imputação).

## 5. Versionamento
`sofa_ruleset_version` (ex. `SOFA1_v1.0_2026-06-30`). Mudança em: definição de suporte
ventilatório · tempo mínimo de vasopressor · regras de imputação · conversão AVPU→GCS
→ **incrementa versão + changelog** (auditoria clínica e validação retrospectiva).

---

## 6. Status de implementação

**`v0.2` (atual, view `vw_sofa_diario`, migration `20260630190000`):** janela por dia · pior valor ·
soma · **resp checa suporte ventilatório** (valor_json) · **cardio multi-droga** (nor/adr/dopa/dobuta) ·
faltante=`null` (sem imputar) · sem audit trail. Determinística, sem imputação.

**Captura dos pré-requisitos — FEITA (30-jun, skill `sasi-ingest-export`)**, modelada via `valor_json`
sem novo tipo no banco:
1. Suporte ventilatório → `pf_ratio.valor_json.suporte_vent`.
2. Vasopressores por droga+dose → `nor_dose`/`adr_dose`/`dopa_dose`/`dobuta_dose` + `valor_json.duracao_min`.
3. RASS + GCS pré-sedação → evento `rass` + `gcs.valor_json.{pre_sedacao,confounded_by_sedation}`.
4. Diurese → `diurese_h` (mL/h; `from_24h_total` se vier do total).

**Motor `v1` (FASE B, ainda falta):**
- imputação determinística + LOCF/carry-forward + audit trail por componente → tabela materializada
  `sofa_janela` (view não persiste).
- filtro vasopressor ≥60 min; `sofa_total_observed_only` vs `_with_imputation`; `alert_confidence`.
- gatilho de alerta sobre ΔSOFA ≥2.

Fica fase B porque depende de **volume de dados** (a captura só começou hoje) e de
**persistência/auditoria** — não de cutoff.
