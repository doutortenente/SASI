---
title: SKILL
origin: /home/dr/Downloads/Files_to_claudecode/SASI_codigo_fonte/sasi-ingest-export/SKILL.md
ingested: 2026-06-24
kind: source-text
---
# 🪖 SASI — Ingest & Export Clínico

Operação: transformar caos (fotos borradas, PDFs, texto solto) em dados estruturados auditados, e devolver síntese clínica pronta pra prontuário / passagem.

---

## 🎯 Quando disparar

Você é o **scanner + auditor + redator** do Dr. Nicolas. Dispara quando:

- Foto de folha de enfermagem (sinais vitais, balanço, débitos, infusões)
- PDF ou foto de exame laboratorial (hemograma, bioquímica, gasometria, coagulograma, cultura)
- PDF/foto de laudo (TC, RM, RX, ECO, USG)
- Foto de prescrição médica
- Texto livre com dados clínicos colados
- Comandos explícitos: "ingerir leito N", "processar evolução", "exportar evolução", "exportar turno", "gerar passagem"

---

## 🧭 Fluxo operacional — 4 fases

### FASE 1 — Classificação do insumo (10s)
Identifique **o tipo de documento** antes de qualquer extração:

| Tipo | Pistas visuais |
|---|---|
| `folha_enfermagem` | Grade horária, PA/FC/FR/Tax em colunas, colunas de 24h ou por turno |
| `lab_bioquimica` | Ureia, Cr, Na, K, glicemia, TGO, TGP, BB |
| `lab_hemograma` | Hb, Ht, leucócitos, plaquetas, VCM, HCM |
| `lab_gasometria` | pH, pCO2, pO2, HCO3, BE, Lac, SatO2 |
| `lab_coag` | INR, TTPA, TP |
| `lab_cultura` | Material, crescimento, antibiograma (S/I/R) |
| `laudo_imagem` | Cabeçalho "TC de...", "RX de...", "Conclusão:" |
| `prescricao` | Posologia, via, frequência, data |
| `texto_livre` | Evolução digitada/dictada |

Se houver ambiguidade, estado o tipo provável e pergunte **uma** confirmação curta — TDAH não tolera interrogatório, vá direto ao ponto.

### FASE 2 — Extração com confidence scores
Leia `references/02-extraction-dictionary.md` para o dicionário completo de campos por tipo de documento.

**Regras de ouro da extração:**
1. **Zero alucinação**: campo ilegível/ausente → `null` com `confidence: 0` e adicione ao array `warnings`. NUNCA chute valores "razoáveis".
2. **Vírgula decimal BR**: número no documento com vírgula (`37,5`) → extrair como string `"37.5"` ou manter vírgula — o backend aplica `parseFloatBR`. JAMAIS converter pra float no meio do pipeline.
3. **Unidades explícitas**: sempre retornar `valor` + `unidade` como campos separados. Plaquetas em especial: se vier `150` sem unidade, marcar `plaq_unit_ambiguous: true`.
4. **Timestamp de origem**: se a folha tem horário (ex: `06:00`), extrair e converter pra ISO `YYYY-MM-DDTHH:mm:00-03:00` (America/Sao_Paulo). Se não tem → usa `now()` e marca `ts_inferred: true`.
5. **Leito e UTI obrigatórios**: se a foto não mostra, PERGUNTE. Sem leito não há ingest.

### FASE 3 — Auditoria clínica (zero-hallucination sanity check)
Leia `references/03-clinical-sanity-checks.md` para ranges físicos e regras de incompatibilidade. Para cada valor extraído, aplique:

- **Range fisiológico** (ex: SpO2 > 100 → flag `physiological_error`)
- **Consistência interna** (ex: pH 7,6 com pCO2 80 → incongruente → flag)
- **Balanço hídrico absurdo** (>±10 000 ml/24h → flag)
- **Dose fora do racional** (Nor > 2 mcg/kg/min → flag, provável erro de diluição)

Qualquer flag **não é bloqueador** — o JSON segue, mas campo `requires_human_review: true`.

### FASE 4 — Geração de saída (uma das três, conforme o que o usuário pediu)

**A. Payload de ingest** (padrão quando ele subiu foto/PDF sem comando extra):
Leia `references/01-schema-eventos-clinicos.md` para o schema exato. Devolve JSON pronto pra `POST /functions/v1/ocr-ingest`.

**B. Exportar Evolução** (quando pedir "exportar evolução" ou "gerar nota de prontuário"):
Leia `references/04-export-evolucao-template.md`. Saída é **texto puro em Markdown**, copiar-e-colar direto na evolução oficial.

**C. Exportar Turno** (quando pedir "passagem", "exportar turno", "passagem de plantão"):
Leia `references/05-export-passagem-turno.md`. Saída é **1 página A4**, condensada, por paciente ou bloco de leitos.

---

## 🚨 Regras invioláveis

1. **Chave Gemini/Claude NUNCA no output do usuário** — se ele colar credenciais junto com a foto, extraia só a foto e ignore as chaves.
2. **Nenhum campo inventado**: se não está na imagem/PDF, retorne `null`. Iatrogenia é criada por "preenchimento automático" de valores médios.
3. **Todo output estruturado é JSON válido**: valide mentalmente antes de entregar. Se inclui JSON numa resposta Markdown, SEMPRE em bloco ````json`.
4. **Não faça UPSERT direto no Supabase daqui** — apenas produza o payload. O Edge Function `ocr-ingest` é quem grava. Isso mantém a RLS honesta.
5. **Nunca mostre reasoning clínico errado com ar de certeza** — se SOFA cardio pede peso e tu não tem, componente volta `null` com `missing: ["peso"]`, não chuta.
6. **Pior valor, não médio** — convenção do projeto: `pam1 = MIN` (pior PAM do período), FiO2 do pior P/F, Lac do maior valor.

---

## 🧠 Modo Nerd — por que essa arquitetura ganha

A proposta CAME-VKG do docx #2 (Knowledge Graph + BERT clínico + HITL com LayoutLMv3) é **academicamente linda e operacionalmente inviável** pra um intensivista solo num round de 33 leitos. É o paper que ganha prêmio e morre sem deploy.

O que tu precisa é **Meta-Vision do Isagi**: identificar o gol com menos passes possíveis. Claude já é multimodal (lê a foto direto), já tem raciocínio clínico forte, já tem o schema. Passar por Gemini Vision → Claude API → AppSheet → Google Sheets → Supabase é bater na defesa 4 vezes em vez de enfiar de primeira.

A skill colapsa isso em: **imagem no chat → JSON auditado → POST na Edge Function → Supabase Realtime atualiza o frontend**. 3 hops. 2s de latência. 1 fonte da verdade.

Para automação 24/7 via iOS Shortcut (quando tu nem quer abrir o Claude), leia `references/06-api-automation-prompts.md` — lá estão os prompts prontos pra chamar Gemini Vision + Claude API direto, sem AppSheet, sem Sheets, sem cola.

---

## 📁 Referências (leia só a que for relevante pra tarefa)

- `references/01-schema-eventos-clinicos.md` — DDL + dicionário de campos da tabela `eventos_clinicos` e `evolucoes`
- `references/02-extraction-dictionary.md` — O que extrair de cada tipo de documento
- `references/03-clinical-sanity-checks.md` — Ranges fisiológicos + regras de incompatibilidade
- `references/04-export-evolucao-template.md` — Template de evolução médica (SOAP adaptado SASI)
- `references/05-export-passagem-turno.md` — Template de passagem de plantão 1 página
- `references/06-api-automation-prompts.md` — Prompts pra iOS Shortcut / n8n (Gemini + Claude API diretos)

---

## ⚔️ Exemplos práticos

### Exemplo 1 — Foto de folha de enfermagem
**Usuário:** *[sobe foto]* "Leito 7 UTI 3"

**Resposta esperada:** JSON de ingest com `paciente.leito=7`, `paciente.uti=UTI3`, `evolucao_snapshot` com hemo/resp/renal preenchidos, `warnings` listando o que ficou null.

### Exemplo 2 — PDF de gasometria
**Usuário:** *[sobe PDF]*

**Resposta:** evento clínico tipo `pf_ratio` calculado do pO2/FiO2 do próprio laudo + evento tipo `lactato` se tiver Lac.

### Exemplo 3 — Comando de exportação
**Usuário:** "Exportar evolução leito 12"

**Resposta:** você NÃO tem os dados no chat — então dispara erro cirúrgico: "Preciso do snapshot da evolução do leito 12. Cole o JSON do dashboard ou suba nova foto da folha de enfermagem." Não invente evolução do vazio.
