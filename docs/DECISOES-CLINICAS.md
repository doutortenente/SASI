# DECISÕES CLÍNICAS — SASI

> **Divisão de trabalho:** a *engenharia* (Claude) constrói a versão mínima usável e
> trava as regras de segurança. A *medicina* (Dr. Nicolas) define os **números**.
> Você edita os valores na coluna **VOCÊ DEFINE**; eu sincronizo pro banco. Mudar um
> limiar = `UPDATE` numa linha — **nenhum código muda**.
>
> Legenda status: 🟢 construído (usável) · 🟡 parcial · ⚪ a construir.
> `DEFAULT (eng.)` = sugestão minha (espelha `frontend/src/lib/drugs.ts`), **não é decisão clínica** — confirme ou troque.

---

## 1. Alertas clínicos 🟢
Trigger em `eventos_clinicos` → grava em `alerts_log`. Config na tabela `alert_rules`.

### Regras ATIVAS em produção (25 — tabela `alert_rules`)
> Aplicado 26-jun-2026 + validado E2E (`pam_min=58` → alerta critical). Editar = me diga o número novo → vira `UPDATE`.

**A) Evidence-based (Vera Health — com DOI na coluna `fonte`):**

| tipo_evento | regra | severidade | fonte |
|---|---|---|---|
| `pam_min` | < 60 / < 65 | 🔴 / 🟡 | ACC Cardiogenic Shock 2025 |
| `pas_min` ⚠️ | < 90 | 🔴 | ACC 2025 |
| `fc` | > 100 / < 40 | 🟡 / 🔴 | ACC 2025 · JMIR |
| `fr` ⚠️ | > 30 / < 8 | 🟡 / 🔴 | JMIR |
| `spo2` | < 85 / < 90 | 🔴 / 🟡 | Crit Care 2021 · JAMA 2026 |
| `lactato` | > 2 / ≥ 4 | 🟡 / 🔴 | ACC 2025 · SSC 2017 |
| `gcs` | < 9 / < 12 | 🔴 / 🟡 | ERC/ESICM 2025 · JBDS 2022 |
| `ht` | ≥ 44 / < 24 / < 21 | 🟡 / 🟡 / 🔴 | ACG Pancreatite 2024 |
| `ur` | ≥ 70 / ≥ 100 | 🟡 / 🔴 | ACG 2024 · Crit Care 2021 |

**B) Defaults de engenharia (Vera ainda não cobriu — `fonte` vazio, PENDENTE evidência):**

| tipo_evento | regra | severidade | **VOCÊ DEFINE / Vera valida** |
|---|---|---|---|
| `glicemia` | > 250 / < 70 | 🟡 / 🔴 | ____ |
| `k` | > 6 / < 3 | 🔴 / 🟡 | ____ |
| `na` | > 150 / < 130 | 🟡 / 🟡 | ____ |
| `temp` | ≥ 38,3 | 🟡 | ____ |

**Decisões já tomadas:**
- ⚠️ **Dormentes** (`pas_min`, `fr`): o tipo ainda não chega no ingest; a regra dispara sozinha quando chegar.
- ⏸️ **Oligúria SEGURADA**: a regra `bh_h<30` da Vera mapeia balanço hídrico como diurese — **errado** (`bh_h` pode ser negativo). Precisa de um tipo `diurese` no ingest. Não aplicada.
- ❌ **`hb<7` dropado** (Vera cobre anemia por `ht<24/<21`); **`cr` dropado** do valor absoluto (Vera move pro módulo de tendência/AKI por Δ).

**Próximos candidatos** (me diga se entram): plaq baixa, leuco alto/baixo, GAP/SBE gaso, RASS, e os de **tendência/Δ** da Vera (AKI, oligúria por duração, GCS em queda, UR/HT seriados — exigem engine de tendência).

### Regras de segurança (ENGENHARIA — fixas, não precisa decidir)
- ⛔ Só alarma dado **revisado e confiável** (`requires_review=false` E `confidence ≥ 0,7`). OCR incerto não dispara.
- ⛔ **Dedupe diário**: o mesmo alerta no mesmo paciente/dia entra uma vez só (`fn_alert_hash` + `unique`).
- ⛔ Dispara em **qualquer** caminho de ingest (`AFTER INSERT`, no banco).
- ⛔ Só `valor_num` numérico (evento textual não alarma).

---

## 2. SOFA / ΔSOFA ⚪
Hoje `sofa_total` vem do JSON do Claude no ingest; nenhum código calcula. O trigger
`fn_invalidate_sofa_cache` **zera** o SOFA quando um sistema da evolução muda.

### Variáveis que VOCÊ define
| Variável | DEFAULT (eng.) | **VOCÊ DEFINE** |
|---|---|---|
| ΔSOFA que dispara alerta de sepse | **≥ 2 em 24h** (Sepsis-3) | ____ |
| Origem do `sofa_baseline` | 1º SOFA da internação | ____ |
| Se faltar 1 dos 6 componentes | `sofa_total = null` (não soma parcial) | confirmar |

### Segurança (fixa)
- ⛔ SOFA só é calculado se os 6 componentes têm fonte legível; senão `null` (nunca inventa).

---

## 3. Vitais Max–Min (convenção de ingest) 🟡
A ficha já grava Max–Min (`pas1/pas2`…). No `eventos_clinicos`, o ingest usa sufixo de tipo.

| Variável | DEFAULT (eng.) | **VOCÊ DEFINE** |
|---|---|---|
| Convenção de tipo | `pam_min`/`pam_max` (par) | confirmar ou trocar p/ `valor_json {min,max}` |
| Limites de plausibilidade (sanidade do dado) | da `SASI Planilha UTI` Fase 1: PAS 50–260, PAM 30–200, FC 20–250, FR 4–80, SpO2 50–100, TAX 30–43 | confirmar |

> ⚠️ Plausibilidade (marca `revisar`) **≠** limiar de alerta (item 1). São camadas diferentes.

---

## 4. ATB stewardship 🟡
`vw_dias_atb_ativo` já calcula `dias_terapia` e flag.

| Variável | DEFAULT (eng.) | **VOCÊ DEFINE** |
|---|---|---|
| Flag amarela (revisar duração) | **≥ 7** dias | ____ |
| Flag vermelha (crítico) | **≥ 14** dias | ____ |
| `duracao_planejada_dias` por foco (pneumonia, ITU, abdome…) | — | ____ (opcional) |

---

## 5. Flags de risco (cabeçalho do leito) ⚪
Nova coluna `pacientes.riscos_flags`.

| Variável | DEFAULT (eng.) | **VOCÊ DEFINE** |
|---|---|---|
| Quais flags rastrear | PAV, broncoaspiração, UPP, queda, diabético | ____ (adicionar/remover) |
| (CONTATO/isolamento fica em `isolation`, não aqui) | — | confirmar |

---

## 6. Dispositivos (estado + data) ⚪
Padronizar `pacientes.dispositivos`.

| Variável | DEFAULT (eng.) | **VOCÊ DEFINE** |
|---|---|---|
| Quais dispositivos | IOT, CVC, PA invasiva, SVD, SNE, traqueo | ____ |
| Alerta de dias-de-dispositivo (PAV/ITU)? | adiar (granularidade plantão) | ____ sim/não |

---

## Como atualizar
Edite a coluna **VOCÊ DEFINE** (ou só me diga os números no chat). Eu transformo em
`UPDATE`/`INSERT` em `alert_rules` (ou na migration correspondente) e aplico. Este arquivo
é a **fonte da verdade clínica**; o banco é sincronizado a partir dele.
