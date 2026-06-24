---
title: _SASI_TEMPLATE_BASE_v2.md
source: /home/dr/Downloads/Files_to_claudecode/SASI_codigo_fonte/Skills e Docs Claude/_SASI_TEMPLATE_BASE_v2.md.docx
imported: 2026-06-24
kind: docx
---
# 🪖 SASI — TEMPLATE-BASE CLÍNICO CANÔNICO — v2.0 (Ramo C)

STATUS: FONTE DA VERDADE ÚNICA. Este bloco é IDÊNTICO nas duas skills (admissao-uti e sasi-ingest-export). Alterou aqui → replica na outra no mesmo commit. Divergência entre as duas cópias = bug clínico-legal. Versionar sempre: SASI-TEMPLATE-BASE vX.Y. Toda nota gerada carrega a versão no rodapé.

## 🎯 Princípio arquitetural — ORTOGONALIDADE DE EIXOS

A nota de admissão e a nota de evolução compartilham a mesma anatomia. A única diferença operacional:

O conflito histórico (Intercorrências ↔ EF ↔ Impressão) morre aqui. Cada bloco governa UM eixo e só um. Nenhum fato cabe em dois blocos. Redundância vira impossibilidade estrutural, não questão de disciplina.

## Tabela de desconflito — LEI DE FERRO

Teste de auditoria antes de entregar: cada problema da Impressão tem uma linha de Conduta? Cada Conduta nasce de um problema? Se não, há ação órfã ou problema sem plano — corrige.

## 📐 TEMPLATE FIXO (estrutura IMUTÁVEL)

{NOME COMPLETO}, {IDADE}a{, PESO kg se disponível} — {UTI} Leito {LEITO} — DH {N}º DIA — {DATA} {TURNO}

HD / Problemas ativos:

1. {Diagnóstico/problema principal — com qualificador de gravidade/disfunção}

2. {Secundário}

3. {...}

{⚠️ ALERGIA: {agente} ({reação})  |  Alergias: nega.}

Admissão ({DD/MM/AA}): {Síntese de 2-3 linhas do estado de CHEGADA à UTI — achados-chave, conduta inicial, exames de entrada que mudam manejo. NÃO é HPMA. Em D2+, este campo é CONGELADO da admissão original.}

[SÓ MODO ADMISSÃO D1]

HPMA: {Parágrafo único de 6-10 linhas. Cronologia linear: gatilho/início → evolução pré-admissão → trajetória assistencial → estado à chegada na UTI. Sem bullets. Sem subseções.}

[SÓ MODO EVOLUÇÃO D2+]

Intercorrências 24h: {SÓ o que mudou no período. Eventos, picos pressóricos/febris, procedimentos, suspensões/introduções de droga, reações, deltas de débito. Verbos de ação. NUNCA descrever estado estável nem repetir o EF.}

Antecedentes: {linha única vírgula-separada; bullets curtos se >4 itens}

Medicamentos de uso domiciliar: {nome + dose + posologia; anticoagulante/antiagregante em destaque}

ALERGIAS: {NEGA. / agente + reação}

Dispositivos:

IOT - {Não / Sim, tubo nº, profundidade, data}.

CVC - {Não / Sim, sítio, data}.

Cateter arterial - {Não / Sim, sítio, data}.

SVD - {Não / Sim, data}.

SNE/SNG - {Não / Sim, posição, data}.

Outros - {DLE, dreno, traqueostomia, MP, etc. — listar se houver}.

Uso:

Drogas Vasoativas: {Não / Nora X mcg/kg/min (vetor ↑↓), etc}.

Sedação: {Não / agentes + doses contínuas + meta RASS}.

Antibióticos: {Não / nome + dose + intervalo + D[n] + foco}.

NPT: {Não / Sim}.

TNE: {Não / Sim, fórmula + volume}.

Exame físico por sistemas:

Neurológico: {GCS/RASS + pupilas + déficit + sedação se ativa}.

Cardiovascular: PA {PAS_MAX}–{PAS_MIN}/{PAD_MAX}–{PAD_MIN} mmHg (PAM {MAX}–{MIN}), FC {MAX}–{MIN} bpm, {perfusão/pulsos/ausculta}. {DVA se ativa}.

Respiratório: {suporte: aa / CN Xl/min / VNI / VM modo+parâmetros}, FR {MAX}–{MIN} ipm, SpO2 {MAX}–{MIN}%. {ausculta}. {P/F se calculável}.

TGI: {dieta + via}, {abdome + RHA}, {débito SNG/SNE}, {evacuações}.

Renal: Diurese {valor} mL/{h}h ({mL/kg/h se peso}), BH {valor} mL. Cr {série}, Ur {valor}. Na {valor}, K {valor}. {KDIGO/TRRC se aplicável}.

Hematológico: Hb {valor} g/dL, Ht {valor}%, Plaq {valor}×10³/µL, Leuco {valor}×10³/µL{ (desvio se houver)}. {INR/TP/TTPA se relevante}.

Infeccioso: {ATB + D[n] + foco}. {culturas + status}.

{Metabólico/Gaso: pH {v} / pCO2 {v} / HCO3 {v} / SBE {v} / Lactato {v} — quando houver gaso}.

Scores:

SOFA {total} ({Resp R}, {Coag C}, {Hep L}, {Cardio CV}, {Neuro N}, {Renal RN}). ΔSOFA 24h: {Δ}. {qSOFA se aplicável}.

Impressão:

1. {Problema ativo} [{↑ / ↓ / =}] — {leitura clínica de 1 linha}.

2. {...}

3. {...}

Conduta estruturada por Sistemas:

1. {Sistema}: {ação + dose + meta numérica}.

2. {Sistema}: {...}.

3. {...}.

{Profilaxias: TVP / LAMG / cabeceira / higiene oral — sempre revisar}.

—

Assinatura: Dr. Nicolas — Intensivista

Gerado por SASI — Sistema de Auditoria e Síntese Intensiva — TEMPLATE-BASE v2.0



## 🔧 REGRAS DE PREENCHIMENTO (valem para AMBAS as skills)

## Sinais vitais — Max–Min INVIOLÁVEL

TODOS os parâmetros: [MÁXIMO]–[MÍNIMO]. Sem exceção. SpO2 também (SpO2 98–89%, nunca 89–98).

Se a fonte trouxer min > max, inverta e adicione tag (revisar).

Abreviações sempre MAIÚSCULAS: PAS, PAD, PAM, FC, FR, SpO2, TAX, DX, BH, HB, HT, PLAQ, LEUCO, UR, CR, NA, K.

Unidades obrigatórias: mmHg, bpm, ipm, %, °C, mg/dL, mEq/L, mL.

Dado ausente → OMITE a linha inteira. Nunca null, nunca N/A, nunca em branco no meio.

## Flags de absurdo fisiológico (tag (revisar))

PAS <50 ou >260 · PAM <30 ou >200 · FC <20 ou >250 · FR <4 ou >80 · SpO2 >100 ou <50 · TAX <30 ou >43 · DX <20 ou >800 · BH >±10.000 mL/24h · Nora >2 mcg/kg/min (provável erro de diluição). Flag não bloqueia — o dado segue com a tag.

## Cabeçalho — problemas numerados

Cada problema com qualificador de gravidade/disfunção, não diagnóstico nu.

✅ Choque séptico de foco pulmonar com IRpA hipoxêmica, em IOT/VM e DVA

💀 Pneumonia (não identifica a disfunção que justifica a UTI)

## Impressão — vetor obrigatório

Cada problema ativo carrega o vetor de trajetória: ↑ piora, ↓ melhora, = estável. É o Δ comprimido em um símbolo — o entrante lê a direção do paciente sem ler o texto.

## Conduta — mapeamento 1:1

Cada linha de conduta corresponde a um problema da Impressão. Metas SEMPRE numéricas: PAM ≥ 65, SpO2 92-96%, glicemia 140-180, lactato em queda, diurese ≥ 0,5 mL/kg/h. Proibido "ajustar conforme evolução" solto.

## Campos vazios

Sistema inteiro sem dado → não avaliado. Campo isolado sem dado → omite a linha. Nunca inventa. Zero alucinação é cláusula pétrea — campo sem fonte legível volta vazio + nota de operação, jamais um valor "razoável".

## 🧠 Modo Nerd — por que Ramo C ganha

A estrutura por sistemas (não cronológica) é o padrão UTI-BR porque deixa o plantonista entrante varrer o estado de cada órgão em <30s — o tempo que ele tem por leito num round de 33. Cada sistema é uma variável; o estado do paciente é a interação delas — Meta-Vision do Isagi.

O conflito que o Dr. Nicolas detectou (3 blocos contando a mesma coisa) era falha de eixo, não de conteúdo. A correção não é apagar blocos — é dar a cada um um eixo exclusivo: Tempo (o que mudou), Estado (como está), Problema (o que importa), Ação (o que faço). Quatro vetores ortogonais cobrem o paciente inteiro sem sobreposição. SBAR-UTI com geometria.

ΔSOFA obrigatório porque Sepsis-3 (JAMA 2016) exige ΔSOFA ≥ 2 — "SOFA 7" sem baseline é ruído. O vetor na Impressão é o mesmo princípio aplicado a cada problema: direção > valor absoluto.
