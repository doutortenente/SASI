# Popular o motor clínico

Este pacote veio do bundle `Files_to_claudecode` — **só infraestrutura** (package.json, vitest, tsconfig).

O motor vivo hoje está monolítico em `sasi/frontend/src/lib/drugs.ts` (+ helpers). Para isolar:

```bash
cd ~/dev/sasi
# quando existir extração modular em frontend/src/lib/{calculations,scores,alerts,...}:
cp -r frontend/src/lib/* packages/sasi-clinical-engine/src/
rm -f packages/sasi-clinical-engine/src/INSTRUCOES.md
cd packages/sasi-clinical-engine
npm install
npm run ci
```

Até lá, use `drugs.ts` no frontend como fonte operacional.