---
tags: [sasi, schema, eventos-clinicos, payload, reference]
---

# 📊 Schema `eventos_clinicos` + Payload `ocr-ingest`

Cada valor numérico importante vira UMA linha em `eventos_clinicos`. É daqui que saem as tendências de 72h, o ΔSOFA, o BH acumulado.

```sql
create table eventos_clinicos (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid not null references pacientes(id) on delete cascade,
  evolucao_id  uuid references evolucoes(id) on delete set null,
  user_id      uuid references auth.users(id),
  ts           timestamptz not null,           -- quando o valor foi medido (não quando digitado)
  tipo         text not null check (tipo in (
                  'sofa_total','sofa_resp','sofa_coag','sofa_liver',
                  'sofa_cardio','sofa_neuro','sofa_renal',
                  'pam','pam_min','pf_ratio','lactato','diurese_h',
                  'bh_h','temp','fc','fr','spo2','hb','plaq',
                  'cr','ur','leuco','na','k','bb','inr',
                  'nor_dose','adr_dose','vaso_dose','dobuta_dose',
                  'gcs','rass','cam_icu','custom'
                )),
  valor_num    numeric,
  valor_json   jsonb,                          -- pra eventos compostos (gaso completa, cultura)
  unidade      text,
  fonte        text not null check (fonte in (
                  'manual','gemini_ocr','claude_ocr','appsheet',
                  'auto_trigger','edge_function','api_import'
                )),
  confidence   numeric(3,2),                   -- 0.00 a 1.00
  source_text  text,                           -- trecho original do OCR
  requires_review boolean default false,
  created_at   timestamptz default now()
);

create index idx_eventos_pac_ts on eventos_clinicos (paciente_id, ts desc);
create index idx_eventos_tipo_ts on eventos_clinicos (tipo, ts desc);
```

> ⚠️ **Nota de fidelidade:** o estado VIVO em produção tem mais campos (`unidade`, `confidence numeric(3,2)`, `requires_review`, mais tipos de evento como `pa_sys`, `pa_dia`, `pcr`, `procalcitonina`, `mg`, `ca`, `p`, `glicemia`, `bps`, `cpot`, doses `fent/midaz/propofol/precedex`). Ver `SASI_schema_LIVE` para o DDL fiel do catálogo Postgres.

---

## 📦 PAYLOAD padrão do Edge Function `ocr-ingest`

Shape exato que Claude deve produzir ao final da extração:

```json
{
  "$schema": "sasi-ocr-ingest/v1",
  "extracted_at": "2026-04-24T14:32:00-03:00",
  "source": {
    "type": "folha_enfermagem | lab_bioquimica | lab_hemograma | lab_gasometria | lab_coag | lab_cultura | laudo_imagem | prescricao | texto_livre",
    "fonte": "claude_ocr",
    "confidence_overall": 0.92,
    "warnings": [
      "plaquetas sem unidade explícita — assumido ×10³/µL",
      "timestamp inferido de now() — folha não tinha hora"
    ]
  },
  "target": {
    "uti": "UTI3",
    "leito": "7",
    "paciente_id": null
  },
  "paciente_upsert": null,
  "evolucao_snapshot": {
    "data_evolucao": "2026-04-24T06:00:00-03:00",
    "plantao": "manha",
    "neuro": { "...": "..." },
    "resp": { "...": "..." },
    "hemo": { "...": "..." },
    "renal": { "...": "..." },
    "hemato": { "...": "..." },
    "infecto": { "...": "..." },
    "dvas": [],
    "sedativos": []
  },
  "eventos_clinicos": [
    {
      "ts": "2026-04-24T06:00:00-03:00",
      "tipo": "pam_min",
      "valor_num": 62,
      "unidade": "mmHg",
      "confidence": 0.95,
      "source_text": "PAM 62",
      "requires_review": false
    },
    {
      "ts": "2026-04-24T06:00:00-03:00",
      "tipo": "lactato",
      "valor_num": 3.4,
      "unidade": "mmol/L",
      "confidence": 0.88,
      "source_text": "Lac 3,4",
      "requires_review": false
    }
  ]
}
```

### Regras de preenchimento do payload

1. **`target.paciente_id` é null** → Edge Function procura por `(uti, leito, status_leito=ativo)`; se achar, usa; se não, exige `paciente_upsert` preenchido.
2. **`evolucao_snapshot` é null** quando a foto é só de lab/imagem (eventos isolados). Nesse caso, os valores vão SÓ em `eventos_clinicos` e linkam à evolução ativa do dia.
3. **`eventos_clinicos` é SEMPRE array** (pode ter 1, 10, 50 itens).
4. **Toda gasometria gera**: `ph`, `pco2`, `po2`, `hco3`, `be`, `lactato`, `pf_ratio` (se FiO2 disponível) — eventos separados (mais fácil de plotar).
5. **Toda dose de DVA vira**: `nor_dose`, `adr_dose`, `vaso_dose`, `dobuta_dose` com `valor_num` em mcg/kg/min.
