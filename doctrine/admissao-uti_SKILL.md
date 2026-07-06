---
name: admissao-uti
tags: [sasi, skill, admissao, doutrina]
description: Gera nota de admissão de UTI no formato padrão-ouro do Comando Tático UCI (Dr. Nicolas Nagaita) a partir de input livre — texto, foto de prontuário, transferência de PS/enfermaria, laudos. Use SEMPRE que Dr. Nicolas pedir "admissão UTI", "admitir paciente", "primeiro dia UTI", "fazer admissão", "nota de admissão", "internar leito X", "passar PS para UTI", "redigir admissão", ou enviar dados brutos de paciente recém-admitido. Esta skill NÃO é para evolução diária, passagem de turno, nem extração para Supabase — para isso use sasi-ingest-export. Produz APENAS a nota de admissão inicial em texto pronto para colar no prontuário (e opcionalmente .docx Times New Roman 10).
---

# Admissão UTI — Comando Tático UCI

Skill cirúrgica para redigir a **nota de admissão** (modo D1) no formato exato do Dr. Nicolas. Sem improviso. Sem inventar dado. Sem comentário motivacional dentro da nota — a nota é instrumento clínico-legal, não palco.

> ⚙️ **ARQUITETURA SASI v2:** esta skill e a `sasi-ingest-export` compartilham o **mesmo TEMPLATE-BASE CANÔNICO** (`_SASI_TEMPLATE_BASE_v2.md`). A anatomia da nota é idêntica nas duas — muda só o eixo temporal (HPMA aqui, Intercorrências lá) e o dia (D1 aqui, D[n] lá). **Se você alterar o template-base nesta skill, replique IDÊNTICO na outra no mesmo commit.** Divergência entre as cópias é bug clínico-legal.

## Doutrina de operação

**Regra 1 — Zero alucinação.** Dado que não veio na fonte → campo `[ ]` ou `Não informado`. Nunca preencha sinal vital, dose, antecedente ou achado físico não fornecido. Inventar dado em prontuário é falsificação documental — não acontece nessa trincheira.

**Regra 2 — Preservação literal do template-base.** A estrutura é IMUTÁVEL. Mesma ordem, mesmos rótulos, mesma pontuação, mesmas linhas em branco. A equipe lê essa nota dezenas de vezes por plantão — drift quebra a leitura padrão.

**Regra 3 — Conduta no final, isolada e estruturada por sistemas.** A seção `Conduta estruturada por Sistemas:` fecha a nota, numerada (1., 2., ...), com título de sistema. Mapeamento **1:1** com os problemas ativos da Impressão. Doses e metas numéricas dentro de cada bloco. Sem plano fornecido → esqueleto numerado com cabeçalhos vazios.

**Regra 4 — HPMA condensada.** A HPMA é UM parágrafo de 6-10 linhas, cronologia linear (gatilho → evolução → chegada). Nunca 15+ linhas. Nunca bullets. Síntese é a forma — o leitor extrai o essencial em <30s.

**Regra 5 — Ortogonalidade de eixos.** HPMA = TEMPO. Exame físico = ESTADO. Impressão = PROBLEMA ATIVO. Conduta = AÇÃO. Nenhum fato cabe em dois blocos. (Detalhe na tabela de desconflito do template-base.)

**Regra 6 — Raciocínio nos comentários internos.** Alertas/dúvidas/raciocínio ao Dr. Nicolas vão APÓS o bloco da nota, em `// Comando Tático — Notas de operação:`. Dentro da nota: só dado clínico.

---

## 🪖 TEMPLATE-BASE CLÍNICO CANÔNICO — v2.0 (Ramo C)

> **FONTE DA VERDADE COMPARTILHADA.** Idêntico em `admissao-uti` e `sasi-ingest-export`. Ver `_SASI_TEMPLATE_BASE_v2.md`. Versionar sempre.

### Princípio — ORTOGONALIDADE DE EIXOS

| Bloco | Eixo | Responde | PROIBIDO |
|---|---|---|---|
| HPMA / Intercorrências 24h | **TEMPO (Δ)** | O que mudou: gatilho, eventos, picos, procedimentos, suspensões, reações | Estado estável; repetir EF; emitir impressão |
| Exame físico por sistemas | **ESTADO** | Achado objetivo atual por órgão, vitais Max–Min | Narrar evento; opinar/concluir |
| Impressão | **PROBLEMA ATIVO** | Lista numerada + tendência em palavra (em ascensão/em melhora/estável) | Prosa corrida; repetir dado bruto do EF; seta/vetor decorativo |
| Conduta por sistemas | **AÇÃO** | Plano 1:1 com cada problema, dose + meta | "Ajustar conforme resposta" sem número; ação órfã |

**Diferença admissão (D1) vs evolução (D2+):** no D1 o eixo TEMPO é a **HPMA** (cronologia de chegada) e `DH = 1º DIA`. Tudo o mais é idêntico ao template da evolução.

### Estrutura fixa (IMUTÁVEL) — modo ADMISSÃO D1

```
{NOME COMPLETO}, {IDADE}a{, PESO kg} — {UTI} Leito {LEITO} — DH 1º DIA — {DATA} {TURNO}
HD / Problemas ativos:
1. {Diagnóstico/problema principal — com qualificador de gravidade/disfunção}
2. {Secundário}
3. {...}
{⚠️ ALERGIA: {agente} ({reação})  |  Alergias: nega.}

Admissão ({DD/MM/AA}): {Síntese de 2-3 linhas do estado de CHEGADA à UTI — achados-chave, conduta inicial, exames de entrada que mudam manejo. NÃO é HPMA.}

HPMA: {Parágrafo único de 6-10 linhas. Cronologia linear: gatilho/início → evolução pré-admissão → trajetória assistencial → estado à chegada na UTI. Sem bullets. Sem subseções.}

Antecedentes: {linha única vírgula-separada; bullets curtos se >4 itens}

Medicamentos de uso domiciliar: {nome + dose + posologia; anticoagulante/antiagregante em destaque}

ALERGIAS: {NEGA. / agente + reação}

Dispositivos:
IOT - {Não / Sim, tubo nº, profundidade, data}.
CVC - {Não / Sim, sítio, data}.
Cateter arterial - {Não / Sim, sítio, data}.
SVD - {Não / Sim, data}.
SNE/SNG - {Não / Sim, posição, data}.
Outros - {DLE, dreno, traqueo, MP — se houver}.

Uso:
Drogas Vasoativas: {Não / Nora X mcg/kg/min, etc}.
Sedação: {Não / agentes + doses + meta RASS}.
Antibióticos: {Não / nome + dose + intervalo + D[n] + foco}.
NPT: {Não / Sim}.
TNE: {Não / Sim, fórmula + volume}.

Exame físico por sistemas:
Neurológico: {GCS/RASS + pupilas + déficit + sedação se ativa}.
Cardiovascular: PA {PAS_MAX}–{PAS_MIN}/{PAD_MAX}–{PAD_MIN} mmHg (PAM {MAX}–{MIN}), FC {MAX}–{MIN} bpm, {perfusão/pulsos/ausculta}. {DVA}.
Respiratório: {suporte}, FR {MAX}–{MIN} ipm, SpO2 {MAX}–{MIN}%. {ausculta}. {P/F}.
TGI: {dieta + via}, {abdome + RHA}, {débito SNG/SNE}, {evacuações}.
Renal: Diurese {valor} mL/{h}h ({mL/kg/h}), BH {valor} mL. Cr {série}, Ur {valor}. Na {valor}, K {valor}. {KDIGO/TRRC}.
Hematológico: Hb {valor} g/dL, Ht {valor}%, Plaq {valor}×10³/µL, Leuco {valor}×10³/µL. {INR/TP/TTPA}.
Infeccioso: {ATB + D[n] + foco}. {culturas + status}.
{Metabólico/Gaso: pH / pCO2 / HCO3 / SBE / Lactato — quando houver}.

Scores:
SOFA {total} ({Resp R}, {Coag C}, {Hep L}, {Cardio CV}, {Neuro N}, {Renal RN}). ΔSOFA 24h: {Δ}. {qSOFA se aplicável}.

Impressão:
1. {Problema ativo}, {tendência em palavra: em ascensão/em melhora/estável} — {leitura clínica de 1 linha}.
2. {...}

Conduta estruturada por Sistemas:
1. {Sistema}: {ação + dose + meta numérica}.
2. {Sistema}: {...}.
{Profilaxias: TVP / LAMG / cabeceira / higiene oral — sempre revisar}.

—
Assinatura: Dr. Nicolas — Intensivista
Gerado por SASI — Sistema de Auditoria e Síntese Intensiva — TEMPLATE-BASE v2.0
```

### Regras de preenchimento (valem para AMBAS as skills)

- **Sinais vitais Max–Min INVIOLÁVEL:** `[MÁXIMO]–[MÍNIMO]` em TODOS os parâmetros, **SpO2 incluso** (`SpO2 98–89%`, nunca `89–98`). Min>max na fonte → inverte + tag `(revisar)`.
- **Abreviações MAIÚSCULAS:** PAS, PAD, PAM, FC, FR, SpO2, TAX, DX, BH, HB, HT, PLAQ, LEUCO, UR, CR, NA, K. Unidades obrigatórias.
- **Flags de absurdo `(revisar)`:** PAS<50/>260 · PAM<30/>200 · FC<20/>250 · FR<4/>80 · SpO2>100/<50 · TAX<30/>43 · DX<20/>800 · BH>±10.000 · Nora>2. Flag não bloqueia.
- **Cabeçalho:** problemas numerados com qualificador de disfunção, nunca diagnóstico nu.
- **Impressão:** tendência dita em palavra (em ascensão/em melhora/estável) em cada problema — proibido `↑/↓/=` ou qualquer seta/vetor decorativo.
- **Conduta:** mapeamento 1:1 com Impressão, metas numéricas sempre.
- **Campo vazio:** sistema inteiro → `não avaliado`; campo isolado → omite a linha. Nunca inventa.

---

## Como preencher cada bloco (específico de ADMISSÃO)

### Cabeçalho
- Admissão NOVA → sempre `DH 1º DIA`.
- Reinternação/readmissão → "1º dia" reinicia, mas registre `Reinternação em UTI por...` no problema 1.
- Idade da fonte; sem idade → `[ ]a`.

### Admissão (DD/MM/AA)
Mini-síntese de 2-3 linhas do **estado de chegada** à UTI: achados-chave + conduta inicial relevante + exames de entrada que mudam manejo. É o "como o paciente chegou", não a história. Em D1, preenche agora; nas evoluções seguintes (outra skill), este campo será congelado deste valor.

### HPMA
Parágrafo único, 6-10 linhas. Gatilho → evolução pré-admissão → trajetória (PS, enfermaria, centro cirúrgico) → estado à chegada. Sem bullets, sem subseções.

### Antecedentes / Medicamentos / Alergias / Dispositivos / Uso
- Antecedentes em ordem de relevância para o quadro atual, não cronológica.
- Anticoagulante/antiagregante em destaque.
- Dispositivos: cada linha é uma linha, com sítio + data (relevante para CAUTI/CLABSI).
- DVA em mcg/kg/min; sedação com meta RASS; ATB com D[n] + foco.

### Sinais vitais (no EF) — da ADMISSÃO
São os vitais **da admissão na UTI**, não do PS e não os atuais. Com cateter arterial, registre PAM. SpO2 sempre com o suporte (`aa`, `O2 nasal 2l/min`, `VM FiO2 X% PEEP X`).

### Exame físico por sistemas
- Frases-padrão de normalidade SÓ se a fonte descreveu normal. NÃO assuma normalidade por omissão.
- Sob sedação: RASS + pupilas (ECG não faz sentido em sedado).
- VM: parâmetros (modo, VC, FR, FiO2, PEEP, P-platô) no respiratório.
- Abdome cirúrgico: descreva Blumberg/Murphy/Giordano/DB — esses sinais matam diagnóstico se omitidos.

### Impressão
Lista de problemas ativos numerada, cada um com tendência dita em palavra (em ascensão/em melhora/estável) e leitura de 1 linha — nunca seta/vetor decorativo. Na admissão, a tendência costuma ser "estável" (sem baseline 24h) ou a trajetória recente do PS.

### Conduta estruturada por Sistemas
1:1 com a Impressão. Metas numéricas (PAM ≥ 65, SpO2 92-96%, glicemia 140-180, lactato em queda, diurese ≥ 0,5 mL/kg/h). Profilaxias sempre revisadas (TVP, LAMG, cabeceira 30-45°, higiene oral com clorexidina se IOT). Sem plano fornecido → esqueleto numerado vazio.

---

## Workflow de execução

1. **Ler a fonte** (texto, foto, PDF, transferência) — extrair todo dado verificável.
2. **Mapear cada dado para o eixo correto** (Tempo→HPMA, Estado→EF, Problema→Impressão, Ação→Conduta). Dado ambíguo → vai para Notas de operação como pergunta, NÃO entra na nota.
3. **Preencher o template-base literalmente.**
4. **Auto-checagem (Ramo C):**
   - Algum dado inventado? (remove)
   - Vitais em Max–Min, SpO2 incluso? (corrige)
   - HPMA é parágrafo único 6-10 linhas?
   - Cada problema da Impressão tem conduta 1:1?
   - Conduta com metas numéricas?
5. **Entregar a nota** + bloco `// Comando Tático — Notas de operação:` separado.
6. Se pedir `.docx`: Times New Roman 10, A4.
