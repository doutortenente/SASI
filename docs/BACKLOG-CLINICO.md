# Backlog clínico do SASI

> Funcionalidades clínicas que o **blueprint original** (`docs/legado/planilha-uti-estrutura.md`,
> era AppSheet, abr/2026) previa e que o SASI atual **ainda não faz**.
> Fonte de verdade do que falta — não é roadmap de banco (esse é `ROADMAP-BANCO.md`)
> nem limiares (`DECISOES-CLINICAS.md`).
>
> Doutrina ZERO ALUCINAÇÃO vale aqui também: nada que dependa de afirmar interação,
> dose ou conduta sem fonte rastreável entra "no escuro".

## Legenda
🔴 não existe · 🟡 parcial · 🟢 feito (sai daqui quando concluir)

---

## 🔴 1. Ordenador de prescrição por sistema
**Fonte:** planilha Fase 2.
**O que é:** prescrição organizada e numerada por aparelho — Cardiovascular/Hemodinâmica · SNC/Psiquiatria · GI/Endócrino · Infeccioso/Respiratório · Sintomáticos/SN · Profilaxias.
**Por que importa:** leitura rápida na passagem; nada de droga perdida no meio de uma lista corrida.
**O que falta:**
- modelo de dado: prescrição com campo `sistema` (enum dos 6 grupos) + dose/via/frequência/horários.
- a skill `sasi-ingest-export` já lê `prescricao` → falta classificar cada item por sistema e agrupar na saída.
- exibição: bloco por sistema na evolução / passagem.

## 🔴 2. Alerta de via — SNE / trituração
**Fonte:** planilha Fase 2 ("ALERTA SNE").
**O que é:** sinalizar fármaco que **não pode ser triturado** pra sonda (comprimido revestido, liberação prolongada/LP, cápsula com microgrânulos).
**Por que importa:** erro de medicação clássico e perigoso — triturar LP vira pico de dose; revestido entérico perde proteção.
**O que falta:**
- lista de fármacos/formas que não trituram (precisa **fonte** — bulário/guia de trituração; não inventar).
- gatilho: na ingestão de prescrição, se via = SNE/SNG e forma = revestido/LP/cápsula → alerta.
- liga no motor de `alert_rules`? Não — é regra de forma farmacêutica, não de limiar numérico. Provável tabela própria `regras_via`.

## 🔴 3. Safety Check do intensivista
**Fonte:** planilha Fase 3 ("SAFETY CHECK").
**O que é:** camada que cruza a prescrição + quadro buscando interação medicamentosa, antagonismo farmacológico, iatrogenia e coerência de manejo de fluidos/DVA.
**Por que importa:** é o "olho do sênior" — o maior valor clínico da planilha.
**O que falta / cuidado:**
- **CRÍTICO:** interação/antagonismo só pode ser afirmado **com fonte** (base de interações, ex. bulário/Micromedex/Lexicomp ou guideline). Sem fonte → não afirmar. É o item mais sujeito a alucinação — tratar com a mesma doutrina dos alertas (coluna `fonte`).
- candidato natural a usar o **RAG de protocolos** (quando ligado) + uma base de interações.
- começo realista: checagens determinísticas de poucas duplas de alto risco com fonte (ex: dupla bloqueio de QT, AINE + IRA, BB + verapamil), não um motor genérico.

---

## 🟡 A completar (já tem base, falta fechar)

| Item | Fonte | Estado | Falta |
|---|---|---|---|
| Patient Summary por aparelho | Fase 3 | tabela `patient_summary` existe, **vazia** | produtor que preencha a síntese sistêmica integrada |
| Laboratório serial ("Folhão") | aba Folhão | tendência existe (`trend_rules`, `vw_eventos_tendencia`) | visão lado a lado dia-a-dia (régua temporal) no frontend |
| Referências normais por exame | Fase 1 | parcial em `alert_rules`/sanity-checks | faixa de normalidade por exame pra flag out-of-range consistente |

---

## Origem
Destilado de `docs/legado/planilha-uti-estrutura.md` em 30-jun-2026. O legado permanece arquivado;
este backlog é a leitura **acionável** do que dele ainda não foi construído.
