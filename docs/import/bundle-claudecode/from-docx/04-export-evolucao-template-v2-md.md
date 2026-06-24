---
title: 04-export-evolucao-template_v2.md
origin: /home/dr/Downloads/Files_to_claudecode/SASI_codigo_fonte/Skills e Docs Claude/04-export-evolucao-template_v2.md.docx
ingested: 2026-06-24
kind: docx
---
# 🖋️ Exportar Evolução — Template de Nota de Prontuário (modo D2+)

Produz texto copiável e colável direto na evolução oficial. Estilo SOAP adaptado à realidade UTI-BR, ancorado no TEMPLATE-BASE CANÔNICO SASI v2 (Ramo C).

⚙️ ARQUITETURA SASI v2: este template é a mesma anatomia da skill admissao-uti. A nota de evolução é o template-base no modo D2+: o eixo TEMPO é Intercorrências 24h (não HPMA), o DH é o dia real, o campo Admissão (DD/MM/AA): é congelado da admissão original, e os sinais vitais são a faixa Max–Min das 24h. O bloco TEMPLATE-BASE abaixo é IDÊNTICO ao da admissao-uti. Alterou aqui → replica lá no mesmo commit. Divergência = bug clínico-legal.

Entrada esperada: snapshot da evolução (JSONB) + cadastrais do paciente + histórico 72h (se disponível). Saída: Markdown estruturado, pronto para o prontuário eletrônico.

## 🪖 TEMPLATE-BASE CLÍNICO CANÔNICO — v2.0 (Ramo C)

FONTE DA VERDADE COMPARTILHADA. Idêntico em admissao-uti e sasi-ingest-export. Versionar sempre.

## Princípio — ORTOGONALIDADE DE EIXOS

O conflito histórico (Intercorrências ↔ EF ↔ Impressão contando a mesma coisa) morre aqui. Cada bloco governa UM eixo e só um. Nenhum fato cabe em dois blocos. Redundância vira impossibilidade estrutural, não questão de disciplina.

Teste de auditoria: cada problema da Impressão tem conduta 1:1? Cada conduta nasce de um problema? Se não → ação órfã ou problema sem plano. Corrige.

## Estrutura fixa (IMUTÁVEL) — modo EVOLUÇÃO D2+

{NOME COMPLETO}, {IDADE}a{, PESO kg} — {UTI} Leito {LEITO} — DH {N}º DIA — {DATA} {TURNO}

HD / Problemas ativos:

1. {Diagnóstico/problema principal — com qualificador de gravidade/disfunção}

2. {Secundário}

3. {...}

{⚠️ ALERGIA: {agente} ({reação})  |  Alergias: nega.}

Admissão ({DD/MM/AA}): {CONGELADO da admissão original — estado de chegada, não atualiza}

Intercorrências 24h: {SÓ o que mudou no período. Eventos, picos pressóricos/febris, procedimentos, suspensões/introduções de droga, reações, deltas de débito. Verbos de ação. NUNCA descrever estado estável nem repetir o EF.}

Antecedentes: {linha única vírgula-separada; bullets se >4}

Medicamentos de uso domiciliar: {se relevante; anticoagulante em destaque}

ALERGIAS: {NEGA. / agente + reação}

Dispositivos:

IOT - {...}. CVC - {...}. Cateter arterial - {...}. SVD - {...}. SNE/SNG - {...}. Outros - {...}.

Uso:

Drogas Vasoativas: {Não / Nora X mcg/kg/min (↑↓)}.

Sedação: {Não / agentes + doses + meta RASS}.

Antibióticos: {Não / nome + dose + intervalo + D[n] + foco}.

NPT: {...}. TNE: {...}.

Exame físico por sistemas:

Neurológico: {GCS/RASS + pupilas + déficit + sedação}.

Cardiovascular: PA {PAS_MAX}–{PAS_MIN}/{PAD_MAX}–{PAD_MIN} mmHg (PAM {MAX}–{MIN}), FC {MAX}–{MIN} bpm, {perfusão/pulsos/ausculta}. {DVA}.

Respiratório: {suporte}, FR {MAX}–{MIN} ipm, SpO2 {MAX}–{MIN}%. {ausculta}. {P/F}.

TGI: {dieta + via}, {abdome + RHA}, {débito SNG/SNE}, {evacuações}.

Renal: Diurese {valor} mL/{h}h ({mL/kg/h}), BH {valor} mL. Cr {série}, Ur {valor}. Na {valor}, K {valor}. {KDIGO/TRRC}.

Hematológico: Hb {valor} g/dL, Ht {valor}%, Plaq {valor}×10³/µL, Leuco {valor}×10³/µL. {INR/TP/TTPA}.

Infeccioso: {ATB + D[n] + foco}. {culturas + status}.

{Metabólico/Gaso: pH / pCO2 / HCO3 / SBE / Lactato — quando houver}.

Exames de imagem relevantes:

- {modalidade + data: laudo resumido — só o que muda conduta}

Scores:

SOFA {total} ({Resp}, {Coag}, {Hep}, {Cardio}, {Neuro}, {Renal}). ΔSOFA 24h: {Δ}. {qSOFA se aplicável}.

Impressão:

1. {Problema ativo} [{↑/↓/=}] — {leitura clínica de 1 linha}.

2. {...}

Conduta estruturada por Sistemas:

1. {Sistema}: {ação + dose + meta numérica}.

2. {Sistema}: {...}.

{Profilaxias: TVP / LAMG / cabeceira / higiene oral — sempre revisar}.

{Seguimento de especialidades + pendências/contingência}.

—

Assinatura: Dr. Nicolas — Intensivista

Gerado por SASI — Sistema de Auditoria e Síntese Intensiva — TEMPLATE-BASE v2.0

## Regras de preenchimento (valem para AMBAS as skills)

Sinais vitais Max–Min INVIOLÁVEL: [MÁXIMO]–[MÍNIMO] em TODOS os parâmetros, SpO2 incluso (SpO2 98–89%, nunca 89–98). Min>max na fonte → inverte + tag (revisar).

Abreviações MAIÚSCULAS: PAS, PAD, PAM, FC, FR, SpO2, TAX, DX, BH, HB, HT, PLAQ, LEUCO, UR, CR, NA, K. Unidades obrigatórias.

Flags de absurdo (revisar): PAS<50/>260 · PAM<30/>200 · FC<20/>250 · FR<4/>80 · SpO2>100/<50 · TAX<30/>43 · DX<20/>800 · BH>±10.000 · Nora>2. Flag não bloqueia.

Cabeçalho: problemas numerados com qualificador de disfunção, nunca diagnóstico nu.

Impressão: vetor ↑/↓/= obrigatório em cada problema (Δ comprimido em um símbolo).

Conduta: mapeamento 1:1 com Impressão, metas numéricas sempre.

Campo vazio: sistema inteiro → não avaliado; campo isolado → omite a linha. Nunca inventa, nunca escreve null/N/A.

## 🔧 Regras específicas de EVOLUÇÃO (modo D2+)

## Intercorrências 24h — só o Δ

É o eixo TEMPO. Escreve só o que mudou: picos febris/pressóricos, eventos, procedimentos do dia, drogas suspensas/introduzidas, reações adversas, viradas de débito. Não descreve estado estável ("mantém-se consciente") — isso é EF. Não conclui ("provável sepse") — isso é Impressão. Se o turno foi sem eventos: Sem intercorrências agudas no período. e ponto.

## Admissão (DD/MM/AA) — congelada

Em D2+, este campo reproduz a síntese de chegada da admissão original, sem atualizar. É a âncora histórica — o entrante vê de onde o paciente partiu sem reler a admissão inteira.

## DVAs formatados

{Droga} {dose} {vetor}. Múltiplas vírgula-separadas. Desmame: Nora 0,15 mcg/kg/min (desmame). Recém-iniciada: Nora 0,20 mcg/kg/min (iniciada 06h).

## Ventilação mecânica

IOT + VMC modo PSV: PEEP 8, PS 12, FiO2 35%, Vt 460 mL (6,8 mL/kg), FR 16, SpO2 96%. P/F 291 (lesão pulmonar leve).

## Culturas positivas

Hemocultura 22/04: E. coli ESBL (S a meropenem, polimixina; R a ceftriaxona, cefepime) → meropenem 1g 8/8h D-3.

## Impressão — bullets concisos + vetor

1. Choque séptico foco abdominal [↓] — desmame de DVA, ΔSOFA -1.

2. IRA KDIGO 2 [=] — oligúria persistente apesar de PAM 70, sem acidose severa.

3. VM modo PSV [↓] — P/F 291, próximo de critério de SBT.

## Conduta — 1:1 com a Impressão, imperativa

1. Hemodinâmica: manter desmame de Nora — meta PAM ≥ 65 sem expansão.

2. Renal: furosemida 40mg EV se PAM mantida; meta diurese ≥ 0,5 mL/kg/h.

3. Ventilatório: SBT 09h se tolerar PS 8/PEEP 5 por 30 min (RSBI < 105).

4. Infecto: ajustar meropenem para ClCr 35 → 1g 12/12h.

5. Profilaxias: HNF 5000 UI 8/8h (Plaq >50, INR 1,4); LAMG; cabeceira 30-45°.

6. Pendências/contingência: gaso 14h; Cr+Na AM; se PAM <60 → bolus SF 500 + retomar Nora 0,25.



## 🧠 Modo Nerd — Por que esse formato

A estrutura por sistemas (não cronológica) é o padrão UTI-BR porque deixa o entrante varrer o estado de cada órgão em <30s — o tempo por leito num round de 33. Cada sistema é uma variável; o estado total é a interação delas. Meta-Vision do Isagi.

O conflito que o Dr. Nicolas detectou (3 blocos contando a mesma coisa) era falha de eixo. A correção do Ramo C não apaga blocos — dá a cada um um eixo exclusivo: Tempo / Estado / Problema / Ação. Quatro vetores ortogonais cobrem o paciente sem sobreposição.

ΔSOFA + vetor obrigatórios: Sepsis-3 (JAMA 2016) exige ΔSOFA ≥ 2; "SOFA 7" sem baseline é ruído. O vetor ↑/↓/= na Impressão é o mesmo princípio aplicado a cada problema — direção > valor absoluto.

Conduta numerada e mapeada 1:1: cérebro em plantão é cérebro em débito de sono. Lista > parágrafo. E cada ação ancorada a um problema impede tanto o esquecimento (problema sem plano) quanto o ruído (ação órfã).

## Exemplo completo (preenchido — modo D2+)

João Silva, 68a, 72kg — UTI 3 Leito 7 — DH 9º DIA — 24/04/2026 Manhã

HD / Problemas ativos:

1. Choque séptico de foco abdominal (perfuração colônica pós-colectomia), em desmame de DVA.

2. IRA KDIGO 2 por débito.

3. IRpA em VM modo PSV.

Alergias: nega.

Admissão (16/04/26): Admitido do CC pós-laparotomia por perfuração colônica, em choque séptico, NORA 0,35 mcg/kg/min e VM. Lactato 5,1 e Cr 1,6 na entrada. Iniciado meropenem após culturas.

Intercorrências 24h: Noite sem intercorrências agudas. Desmame de NORA de 0,35 para 0,20 mcg/kg/min. Pico febril 37,8°C axilar. Suspensa vancomicina (cultura negativa para Gram+). Débito urinário limítrofe no período.

Antecedentes: HAS, DM2, ex-tabagista.

ALERGIAS: NEGA.

Dispositivos:

CVC - Sim, jugular D - D-8.

Cateter arterial - Sim, radial E - D-8.

SVD - Sim - D-9.

SNE/SNG - Sim, gástrica - D-7.

Uso:

Drogas Vasoativas: NORA 0,20 mcg/kg/min (desmame), Vasopressina 0,04 UI/min.

Sedação: Fentanil 50 mcg/h + Midazolam 4 mg/h, meta RASS -2.

Antibióticos: Meropenem 1g 8/8h - D-3 (foco abdominal, E. coli ESBL).

TNE: NE 45 mL/h por SNE.

Exame físico por sistemas:

Neurológico: GCS 10 (O3V3M4) pré-sedação. Sedado, RASS -2. Pupilas isocóricas fotorreagentes 3mm.

Cardiovascular: PA 135–88/82–52 mmHg (PAM 95–62), FC 112–78 bpm, perfusão fria com pulsos cheios. NORA 0,20 (desmame), Vaso 0,04.

Respiratório: IOT + VMC modo PSV: PEEP 8, PS 12, FiO2 35%, Vt 460 mL (6,4 mL/kg), FR 18, SpO2 96%. MV+ bilateral, crepitantes em bases. Secreção amarelada moderada. P/F 291.

TGI: NE 45 mL/h por SNE, tolerando. Abdome globoso, doloroso à palpação profunda em FIE, RHA+. Débito SNE 150 mL/24h. Evacuação 1x líquida.

Renal: Diurese 1100 mL/24h (0,64 mL/kg/h), BH -450 mL. Cr 1,8 (basal 1,0 — KDIGO 2), Ur 82. Na 138, K 4,2. Sem TRRC.

Hematológico: Hb 9,2 g/dL, Ht 28%, Plaq 180×10³/µL, Leuco 14,5×10³/µL (bastões 8%, desvio à esquerda). INR 1,4.

Infeccioso: Meropenem D-3 (hemocultura E. coli ESBL, S a meropenem). Vancomicina suspensa. CVC D-8 sem flogose.

Scores:

SOFA 10 (Resp 1, Coag 1, Hep 0, Cardio 3, Neuro suprimido por sedação, Renal 2→3 por Cr+oligúria). ΔSOFA 24h: -1 (melhora). qSOFA 2.

Impressão:

1. Choque séptico foco abdominal [↓] — desmame de DVA com boa resposta (ΔSOFA -1).

2. IRA KDIGO 2 [=] — Cr 1,8 + oligúria persistente apesar de PAM 70, provável componente isquêmico.

3. IRpA em VM PSV [↓] — P/F 291, próximo de critério de SBT.

4. Anemia multifatorial [=] — inflamatória + sangramento pós-op compensado.

Conduta estruturada por Sistemas:

1. Hemodinâmica: manter desmame de NORA → reduzir para 0,15 mcg/kg/min em 2h se PAM ≥ 65 estável.

2. Ventilatório: SBT 10h (PS 8/PEEP 5 por 30 min, avaliar RSBI < 105).

3. Sedação: reduzir Midazolam 4→2 mg/h, meta RASS 0 para SBT.

4. Infecto: ajustar meropenem para ClCr estimado 35 → 1g 12/12h.

5. Renal: furosemida 40mg EV se PAM mantida; meta diurese ≥ 0,5 mL/kg/h.

6. Hematológico: anticoag profilática HNF 5000 UI 8/8h (Plaq 180, INR 1,4).

7. Profilaxias: LAMG; cabeceira 30-45°; higiene oral clorexidina 12/12h.

8. Seguimento/pendências: TC abdome de controle (6º DPO); gaso + lactato 14h; Cr+Na+K AM. Se PAM <60 → bolus SF 500 + retomar NORA 0,25.

—

Assinatura: Dr. Nicolas — Intensivista

Gerado por SASI — Sistema de Auditoria e Síntese Intensiva — TEMPLATE-BASE v2.0


