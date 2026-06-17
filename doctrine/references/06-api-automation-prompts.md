---
tags: [sasi, automacao, api, ios-shortcut, reference]
---

# ⚙️ Prompts de Automação — iOS Shortcut / n8n (Gemini + Claude API diretos)

Cascata de 2 LLMs para ingest 24/7 sem abrir o chat. Gemini Vision faz o OCR (olhos no papel), Claude faz a auditoria clínica + payload (cérebro no dado).

> 🔐 **SEGURANÇA:** chaves NUNCA em texto plano no Atalho. Use **Data Jar** (App Store) ou **iCloud Keychain** pra puxar em runtime. Nomes das chaves: `SASI_GEMINI_KEY`, `SASI_CLAUDE_KEY`, `SASI_SUPABASE_KEY`. (Valores reais NUNCA aqui — só os nomes das variáveis.)

---

## 🧠 PROMPT 1 — Gemini Vision (OCR bruto)

```
Você é um OCR clínico de precisão. Transcreva TUDO que está legível nesta imagem de documento médico (folha de enfermagem, exame laboratorial, laudo ou prescrição).

REGRAS:
1. NÃO interprete, NÃO conclua, NÃO infira. Apenas transcreva o que está escrito.
2. Se um campo está ilegível, registre em "campos_ilegiveis", NÃO invente.
3. Preserve vírgula decimal brasileira (37,5 não vira 37.5).
4. Se há tabela, reproduza com pipes markdown.
5. Para cada valor, registre o contexto espacial (qual coluna/linha/horário).
6. Preserve unidades originais (mmHg, bpm, mL, mcg/kg/min, etc).

OUTPUT: JSON com três campos:
{
  "tipo_documento": "folha_enfermagem | lab_bioquimica | lab_hemograma | lab_gasometria | lab_coag | lab_cultura | laudo_imagem | prescricao | desconhecido",
  "texto_extraido": "<transcrição completa em markdown preservando layout>",
  "campos_ilegiveis": ["PAM das 14h", "nome da droga linha 3", ...]
}

Apenas o JSON. Sem preâmbulo, sem markdown blocks.
```

**Endpoint:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_KEY}
```

**Body:**
```json
{
  "contents": [{
    "parts": [
      { "text": "<PROMPT ACIMA>" },
      { "inline_data": { "mime_type": "image/jpeg", "data": "<BASE64_DA_FOTO>" } }
    ]
  }],
  "generationConfig": {
    "temperature": 0,
    "responseMimeType": "application/json"
  }
}
```

---

## 🧠 PROMPT 2 — Claude API (auditoria clínica + payload final)

### System Prompt
```
Você é o motor de auditoria clínica do SASI (Sistema de Auditoria e Síntese Intensiva — UTI 33 leitos). Recebe a saída bruta do estágio Gemini Vision e converte em payload JSON validado para a tabela Supabase `eventos_clinicos` + snapshot de `evolucoes`.

REGRAS DE OURO:
1. ZERO ALUCINAÇÃO: campo ausente ou ilegível → null + warning. Nunca invente.
2. Vírgula BR: mantenha "37,5" como string; o backend tem parseFloatBR.
3. Plaquetas: se valor 1000-10000 sem unidade → flag plaq_unit_ambiguous.
4. Ranges fisiológicos: SpO2>100, pH<6.8 ou >7.8, PAM<30 ou >180 → physiological_error.
5. DVA dose absurda (Nor>2mcg/kg/min) → flag dose_absurd.
6. Timestamp: preserve se na imagem, senão use now() + ts_inferred:true.
7. Leito/UTI: se ausente no input, retorne "requires_leito: true" e pare.

SCHEMA DE OUTPUT (obrigatório):
{
  "$schema": "sasi-ocr-ingest/v1",
  "extracted_at": "ISO8601",
  "source": { "type": "...", "fonte": "claude_ocr", "confidence_overall": 0.0-1.0, "warnings": [...] },
  "target": { "uti": "UTI2|UTI3|UTI4", "leito": "N", "paciente_id": null },
  "paciente_upsert": null ou objeto,
  "evolucao_snapshot": null ou objeto completo,
  "eventos_clinicos": [ { ts, tipo, valor_num, unidade, confidence, source_text, requires_review } ]
}

Tipos válidos de evento: sofa_total, sofa_resp, sofa_coag, sofa_liver, sofa_cardio, sofa_neuro, sofa_renal, pam, pam_min, pf_ratio, lactato, diurese_h, bh_h, temp, fc, fr, spo2, hb, plaq, cr, ur, leuco, na, k, bb, inr, nor_dose, adr_dose, vaso_dose, dobuta_dose, gcs, rass, cam_icu, custom.

Retorne APENAS o JSON. Sem markdown code blocks, sem preâmbulo.
```

### User Message (preenchido pelo Atalho)
```
UTI: {UTI_SELECIONADA}
Leito: {LEITO_SELECIONADO}
Peso registrado (se disponível): {PESO_SELECIONADO}
Plantão: {PLANTAO_ATUAL}

Saída do Gemini Vision:
{JSON_RETORNADO_PELO_GEMINI}

Gere o payload SASI.
```

---

## 🧠 Modo Nerd — Por que 2 LLMs em cascata

**Gemini Vision** tem janela de contexto maior e é superior em **OCR de tabelas complexas e handwriting**. É o estágio "eyes-on-the-paper".

**Claude Sonnet** é superior em **seguir instruções negativas** ("NÃO invente"), **coerência clínica** (raciocínio fisiológico) e **respeitar schemas JSON complexos**. É o estágio "brain-on-the-data".

Rodar Claude diretamente na imagem também funciona (Claude 4.x é multimodal forte), mas o custo é maior e a especialização em OCR tabular é menor. A cascata Gemini→Claude entrega Pareto ótimo: visão do Gemini + raciocínio do Claude.

**Alternativa mais barata** (se orçamento aperta): rodar **Claude Haiku** direto na imagem, pulando o Gemini. Perde ~15% de acurácia em folhas manuscritas, ganha ~3x em custo. Válido pra fluxos não-críticos.

---

## ⚡ Prompt bônus — Export turno via API (sem chat)

Para disparar "exportar turno" via URL (ex: Siri "SASI passagem"), body da chamada Claude:

```
POST https://api.anthropic.com/v1/messages
Body: {
  "model": "claude-sonnet-4-6",
  "max_tokens": 8000,
  "system": "Você é o SASI. Gere passagem de plantão no formato do reference 05-export-passagem-turno.md. Input é JSON com dashboard dos 33 leitos vindo do Supabase (view vw_dashboard_uti). Output é Markdown do painel 33-leitos, 1 página A4.",
  "messages": [{
    "role": "user",
    "content": "Dashboard atual:\n<JSON_DASHBOARD_SUPABASE>\n\nTurno: {MANHA|TARDE|NOITE}\nGere a passagem."
  }]
}
```

Response vem Markdown. Atalho manda pro **Pages** ou **Notes** e gera PDF automaticamente.
