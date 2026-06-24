---
title: README
origin: /home/dr/Downloads/Files_to_claudecode/SASI_codigo_fonte/sasi-clinical-engine/README.md
ingested: 2026-06-24
kind: source-text
---
# SASI Clinical Engine

Pacote **standalone** do motor clínico do SASI — roda isolado do front-end.
TypeScript puro, **zero dependências de runtime**. Testável, type-checkável e
buildável sozinho, sem tocar no app React principal.

Contém: SOFA, qSOFA, Sepsis-3 (ΔSOFA), motor de alertas (7 sub-motores),
cálculos de infusão/diurese/ratios/antropometria, guards de coerção de unidade,
dicionários de DVA/sedação/escalas/ATB.

---

## Por que este ZIP NÃO traz os 27 arquivos do motor dentro

A versão **viva e mais nova** do motor está no seu PC — o `anthropometric.ts`
foi criado hoje. Empacotar uma cópia da minha sessão arriscaria te dar código
**desatualizado** e sobrescrever o trabalho atual. Então este pacote traz a
**infraestrutura** (configs + scripts) e você popula `src/` com a sua versão de
verdade em 1 comando (abaixo).

---

## Instalação — 1 bloco

Na **raiz do seu projeto SASI atual** (onde existe `src/lib/`):

```bash
# 1. Extraia este pacote ao lado do seu projeto (cria a pasta sasi-clinical-engine/)
unzip sasi-clinical-engine.zip

# 2. Funda o motor atual (com anthropometric de hoje) dentro do pacote
cp -r src/lib/* sasi-clinical-engine/src/

# 3. Remova o placeholder de instruções
rm -f sasi-clinical-engine/src/INSTRUCOES.md

# 4. Entre, instale e valide
cd sasi-clinical-engine
npm install
npm run ci          # typecheck + testes de uma vez
```

`npm run ci` verde = motor isolado, completo e funcional.

---

## Scripts

| Comando | O que faz |
|---|---|
| `npm test` | Roda a suíte Vitest uma vez |
| `npm run test:watch` | Vitest em modo watch (durante desenvolvimento) |
| `npm run test:ui` | UI visual do Vitest no browser |
| `npm run test:cov` | Testes + relatório de cobertura (`coverage/`) |
| `npm run typecheck` | `tsc --noEmit` — valida tipos sem emitir |
| `npm run build` | Emite `dist/` (JS + `.d.ts`) via `tsconfig.build.json` |
| `npm run ci` | `typecheck` + `test` — porta de qualidade |
| `npm run clean` | Apaga `dist/` |

---

## Arquivos de config incluídos

- `package.json` — pleno: scripts de test/build/typecheck/coverage, devDeps, `exports` com subcaminhos (`./scores`, `./alerts`, `./calculations`).
- `tsconfig.json` — strict (target ES2022, moduleResolution bundler, alias `@/* → src/*`).
- `tsconfig.build.json` — herda do principal, emite `dist/` excluindo testes.
- `vitest.config.ts` — alias espelhado, `environment: 'node'`, cobertura v8.
- `.gitignore` — node_modules, dist, coverage.
- `src/index.ts` — fachada pública (re-exporta `clinical-logic-compat` + tipos).

---

## Notas técnicas

- **Zero deps de runtime** é proposital — o motor não importa `react`,
  `lucide-react` nem UI. Para confirmar no código: `grep -rn "from '[^.]" src/`
  deve voltar vazio (fora imports de tipo de libs, se houver).
- **`environment: 'node'`** no Vitest porque o motor é puro. Para testar
  componentes React depois, troque para `jsdom` e instale `jsdom` +
  `@testing-library/react` como devDeps.
- **Versões em `package.json` são baseline estável.** `npm install` resolve.
  Para majors mais novos (ex.: Vitest 3.x): `npm install vitest@latest @vitest/ui@latest @vitest/coverage-v8@latest -D`.
- **Node ≥20** exigido — o motor usa `crypto.randomUUID()` (Web Crypto global),
  garantido a partir do Node 20.
- O alias `@/*` é conveniência; o motor em si usa imports **relativos**
  (`../calculations/parseBR`), então funciona com ou sem o alias.
