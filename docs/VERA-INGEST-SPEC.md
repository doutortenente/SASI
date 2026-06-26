# Spec para a Vera Health → motor de alertas SASI

> Formato que a Vera deve gerar para eu (Claude Code) ingerir **direto** na tabela
> `alert_rules`. Uma regra = um objeto. **Formato preferido: JSON array.** (CSV ou
> tabela markdown com as mesmas colunas também serve.)
>
> A Vera cuida do **clínico** (qual parâmetro, comparador, limiar, severidade,
> mensagem, evidência). A **engenharia/segurança** é minha — a Vera NÃO precisa se
> preocupar com: filtro de dado revisado/confiança, dedupe, RLS, inserção.

## Campos (por regra)

| campo | obrigatório | valores | descrição |
|---|---|---|---|
| `tipo_evento` | sim | **só da lista controlada abaixo** | o parâmetro medido |
| `comparador` | sim | `lt` `lte` `gt` `gte` | <, ≤, >, ≥ |
| `limiar` | sim | número | na **unidade** do tipo (não converter) |
| `severidade` | sim | `critical` `warning` `info` | **Crítico→`critical`, Alerta→`warning`** |
| `rotulo` | sim | snake_case curto | id do alerta, ex `hipercalemia` |
| `mensagem` | sim | texto com `{v}` | `{v}` é substituído pelo valor medido. Ex: `"K {v} > 6 mEq/L"` |
| `fonte` | desejável | texto/PMID/guideline | evidência do limiar (doutrina ZERO ALUCINAÇÃO) |
| `ordem` | opcional | int | desempate quando o mesmo tipo tem várias regras |

## Vocabulário CONTROLADO de `tipo_evento` (use SÓ estes)

| tipo_evento | unidade | obs |
|---|---|---|
| `pam_min` | mmHg | PAM mínima |
| `pas_min` | mmHg | PAS mínima — *dormente* (ingest ainda não produz) |
| `fc` | bpm | |
| `fr` | rpm | *dormente* |
| `spo2` | % | |
| `temp` | °C | |
| `glicemia` | mg/dL | |
| `lactato` | mmol/L | |
| `k` | mEq/L | |
| `na` | mEq/L | |
| `ca` | mmol/L | cálcio iônico |
| `mg` | mg/dL | |
| `cr` | mg/dL | absoluto só; AKI por Δ = não suportado ainda |
| `ur` | mg/dL | ureia |
| `hb` | g/dL | |
| `ht` | % | redundante com hb |
| `plaq` | x10³/µL | |
| `leuco` | /µL | ⚠️ unidade inconsistente no ingest — confirmar |
| `gcs` | — | Glasgow |
| `rass` | — | sedação |
| `bh_h` | mL | balanço horário |

> Qualquer `tipo_evento` fora desta lista = **regra morta** (nunca dispara).

## Exemplo (JSON)

```json
[
  {
    "tipo_evento": "k",
    "comparador": "gt",
    "limiar": 6.0,
    "severidade": "critical",
    "rotulo": "hipercalemia",
    "mensagem": "K {v} > 6 mEq/L",
    "fonte": "KDIGO; risco de arritmia"
  },
  {
    "tipo_evento": "lactato",
    "comparador": "gt",
    "limiar": 2.0,
    "severidade": "warning",
    "rotulo": "lactato_alto",
    "mensagem": "Lactato {v} > 2 mmol/L",
    "fonte": "Surviving Sepsis Campaign 2021"
  }
]
```

## Regras
- Um parâmetro pode ter **várias regras** (ex: `glicemia` >250 **e** <70) → objetos separados.
- Regras de **tendência/Δ** (ex: AKI = subida de creatinina ≥0,3 em 48h) **não são suportadas**
  por este motor (só valor único). A Vera pode listá-las à parte como "precisa de motor de tendência".
- Não converter unidades — usar a unidade da tabela.
- Pode mandar `fonte` por regra; eu guardo como evidência (bom pro pubmed-evidence-checker).
