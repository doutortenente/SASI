---
title: INSTRUCOES
source: /home/dr/Downloads/Files_to_claudecode/SASI_codigo_fonte/sasi-clinical-engine/src/INSTRUCOES.md
imported: 2026-06-24
kind: markdown-source
---
# COLE OS 27 ARQUIVOS DO MOTOR AQUI

Copie o **conteúdo** do seu `src/lib/` (o motor atual, com o `anthropometric.ts`
de hoje) para **dentro desta pasta `src/`**, preservando as subpastas.

Depois apague este `INSTRUCOES.md`.

## Estrutura esperada (27 arquivos)

```
src/
├── index.ts                       ← já incluído no pacote (fachada pública)
├── clinical-logic-compat.ts       [1]  fachada — API pública
│
├── types/
│   ├── patient.ts                 [2]  interface Patient + subsistemas
│   ├── clinical.ts                [3]  SOFAResult, DoseResult, Alert types
│   └── index.ts                   [4]  barrel
│
├── constants/
│   ├── thresholds.ts              [5]  HEMO/RESP/RENAL/NEURO/INFECTO/METABOL/DVA
│   ├── sofa-cutoffs.ts            [6]  tabela SOFA Singer 2016
│   └── index.ts                   [7]
│
├── dictionaries/
│   ├── dva.ts                     [8]  DVA_DICT
│   ├── sedacao.ts                 [9]  SEDACAO_DICT
│   ├── escalas.ts                 [10] ESCALAS_NEURO_DICT
│   ├── antibioticos.ts            [11] ATB_DICT
│   └── index.ts                   [12]
│
├── calculations/
│   ├── parseBR.ts                 [13] parseFloatBR, formatFloatBR, isAbsurdo
│   ├── infusao.ts                 [14] calcDoseInfusao, isVasopressorHighDose
│   ├── diurese.ts                 [15] calcDiureseEfetiva + KDIGO
│   ├── ratios.ts                  [16] calcPFRatio, calcROX, calcShockIndex...
│   ├── anthropometric.ts          [17] ← NOVO (criado hoje no PC)
│   └── index.ts                   [18] barrel (exporta os 5 acima)
│
├── guards/
│   ├── unitCoercion.ts            [19] coercePlaquetas, coerceFiO2Input...
│   └── index.ts                   [20]
│
├── scores/
│   ├── sofa.ts                    [21] getSOFA + componentes
│   ├── qsofa.ts                   [22] getQSOFA
│   ├── sepsis.ts                  [23] assessSepsis (Sepsis-3 ΔSOFA)
│   └── index.ts                   [24]
│
├── alerts/
│   ├── engine.ts                  [25] runAllAlerts — 7 sub-motores
│   └── index.ts                   [26]
│
└── __tests__/
    └── sofa.test.ts               [27] 40+ casos Vitest
```

## Conferência rápida

Depois de copiar, rode na raiz do pacote:

```bash
find src -name '*.ts' | wc -l    # deve dar 28 (27 do motor + este index.ts)
```

Se o `calculations/index.ts` ainda não exporta `anthropometric`, adicione:

```ts
export * from './anthropometric';
```
