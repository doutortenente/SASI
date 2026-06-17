---
tags: [sasi, moc, indice, doutrina]
criado: 2026-06-11
---

# 🪖 SASI — Doutrina (MOC)

Índice da doutrina clínica do SASI (Sistema de Auditoria e Síntese Intensiva). Templates e SKILLs que governam toda a geração de nota clínica do Comando UTI Alpha (33 leitos — UTI 2/3/4).

## Fonte da verdade

- [[_SASI_TEMPLATE_BASE_v2]] — **TEMPLATE-BASE CANÔNICO v2.0 (Ramo C)**. Fonte única. Idêntico nas duas SKILLs. Ortogonalidade de eixos: Tempo / Estado / Problema / Ação.

## SKILLs

- [[admissao-uti_SKILL]] — nota de admissão (modo D1, eixo TEMPO = HPMA).
- [[sasi-ingest-export_SKILL]] — ingest de fotos/PDFs → JSON auditado + export de evolução e passagem de turno.

## References (módulos de apoio)

- [[01-schema-eventos-clinicos]] — DDL `eventos_clinicos` + payload `ocr-ingest`.
- [[02-extraction-dictionary]] — o que extrair de cada tipo de documento.
- [[03-clinical-sanity-checks]] — ranges fisiológicos + flags de absurdo (zero-hallucination).
- [[04-export-evolucao-template_v2]] — template de evolução D2+ (CANÔNICO).
- [[04-export-evolucao-template_v1_LEGADO]] — versão antiga (histórico).
- [[05-export-passagem-turno]] — passagem de plantão 1 página (individual + painel 33 leitos).
- [[06-api-automation-prompts]] — prompts iOS Shortcut (Gemini Vision + Claude API).

## Princípios invioláveis (resumo)

1. **Zero alucinação** — campo sem fonte → `null` + warning. Nunca um valor "razoável".
2. **Ortogonalidade de eixos** — nenhum fato cabe em dois blocos.
3. **Max–Min inviolável** — todos os vitais, SpO2 incluso.
4. **Conduta 1:1** com Impressão, metas numéricas sempre.
5. **Flags gritam, não consertam** — o médico decide.

---

> Backend e schema vivo do banco: ver `SASI_schema_LIVE` (dump fiel do Postgres). Esta pasta cobre só a **doutrina clínica** (templates + skills).
