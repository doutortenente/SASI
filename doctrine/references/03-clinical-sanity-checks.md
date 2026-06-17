---
tags: [sasi, sanity-check, validacao, reference]
---

# 🚨 Sanity Checks Clínicos — Zero-Hallucination Validation

Toda extração passa por esta malha. Campo fora da malha → `requires_review: true` + warning.

**Princípio não-negociável:** a malha NÃO corrige o valor. Apenas sinaliza. O médico decide. O sistema não é responsável por "melhorar" o que o OCR leu — é responsável por **gritar** quando o valor é clinicamente implausível.

---

## 🫁 Respiratório

| Parâmetro | Range fisiológico | Flag se | Ação |
|---|---|---|---|
| SpO2 | 0–100% | `> 100` | `physiological_error` — impossível |
| SpO2 | 0–100% | `< 40 e paciente vivo` | `review` — provável erro de leitura |
| FR | 4–80 ipm | `> 60` | `review` — compatível mas extremo |
| PaO2 | 20–600 mmHg | `> 600` sem VM + alta FiO2 | `review` |
| FiO2 | 21–100% | `< 21 ou > 100` | `physiological_error` |
| P/F ratio | 50–500+ | `> 500` | `review` |
| pH | 6,80–7,80 | fora desse intervalo | `physiological_error` — incompatível com a vida |
| pCO2 | 10–150 mmHg | `> 150` | `review` |
| HCO3 | 4–50 mEq/L | fora | `review` |
| Lactato | 0,5–25 mmol/L | `> 20` | `review` — mortalidade >90% |

**Coerência gaso**: se `pH` normal mas `pCO2 > 60` e `HCO3 < 20` → provavelmente OCR trocou dígitos, flagar.

---

## 🫀 Hemodinâmico

| Parâmetro | Range | Flag se | Ação |
|---|---|---|---|
| PA sistólica | 40–280 mmHg | fora | `physiological_error` |
| PA diastólica | 20–160 mmHg | fora | `physiological_error` |
| PAM | 30–180 mmHg | fora | `physiological_error` |
| FC | 20–250 bpm | fora | `physiological_error` |
| FC | 30–220 | sinusal sustentado | ok |
| Temperatura | 32–42°C | `< 32 ou > 42` | `physiological_error` ou hipotermia terapêutica (verificar contexto) |

**Coerência PA**: `pa_dia > pa_sys` → inverter? NÃO. Marcar `flag: data_inversion_suspected` e retornar ambos como estão.
**Coerência PAM**: `PAM ≈ (PAS + 2·PAD) / 3`. Se o valor extraído diverge do calculado em > 15 mmHg, marcar `review`.

---

## 💧 Renal / BH

| Parâmetro | Range | Flag se | Ação |
|---|---|---|---|
| Diurese 24h | 0–10 000 mL | `> 8000` | `review` — provável poliúria ou erro |
| Diurese 24h | 0–10 000 | `= 0` | ok, oligúria severa / anúria |
| mL/kg/h | 0–15 | `< 0,3` | KDIGO 1 (flag automático, não erro) |
| BH 24h | −8000 a +12 000 mL | `\|bh\| > 10 000` | `logical_anomaly` |
| Creatinina | 0,1–20 mg/dL | `> 15` | `review` — checar unidade (µmol/L?) |

---

## 🩸 Hematológico / Metabólico

| Parâmetro | Range | Flag se | Ação |
|---|---|---|---|
| Hb | 2–22 g/dL | `< 4 ou > 20` | `review` |
| Plaquetas | 1–1000 ×10³/µL | `< 5 ou > 1000` | `review` |
| Leucócitos | 0,1–200 ×10³/µL | `> 100` | `review` — reação leucemoide vs leucemia |
| Na | 100–185 mEq/L | fora | `physiological_error` |
| K | 1,5–9 mEq/L | `> 7 ou < 2` | `review` — risco arritmia, checar ECG |
| Glicemia | 20–1500 mg/dL | `> 1000` | `review` — EHH provável |

---

## 💉 Doses de drogas vasoativas

| Droga | Range usual | Flag se | Ação |
|---|---|---|---|
| Noradrenalina | 0,01–2 mcg/kg/min | `> 2` | `dose_absurd` — provável erro de diluição |
| Adrenalina | 0,01–1 mcg/kg/min | `> 1` | `review` |
| Vasopressina | 0,01–0,06 UI/min | `> 0,1` | `review` |
| Dobutamina | 2–20 mcg/kg/min | `> 20` | `review` |

---

## 🔗 Regras de coerência cruzada

- **SOFA sem baseline** → ΔSOFA não calculável → marcar `delta_unavailable`, NÃO assumir baseline 0.
- **Gaso venosa rotulada arterial** → P/F não aplicável, flag.
- **Cultura positiva sem antibiograma** → flag `antibiograma_missing` (laudo provavelmente incompleto/preliminar).
- **PAM calculada vs medida divergente > 15 mmHg** → `review`.

> Lembrete final: a malha **grita**, não conserta. O médico é o decisor. Zero alucinação é cláusula pétrea.
