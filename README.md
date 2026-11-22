# SASI — Comando UTI

Folha de plantão da UTI 2 (13 leitos) do Dr. Nicolas Nagaita. Ferramenta **pessoal** de plantão, sem login.
Produção: **https://sasi-uti.vercel.app** (cada merge na `main` publica).

O app (Next.js 15 + React 19 + TypeScript) segue o design "Comando UTI · Folha de plantão"
(https://claude.ai/artifact/DfrYNmPhnsB5VS3m4hdR4T): o design manda, o app copia.
Telas: Cards, Round, Tabela, Passagem, Exames e Evolução.

## Pastas

```
src/
  app/          telas (cards, round, tabela, passagem, exames, evolucao), moldura, tela de erro,
                comando-uti.css (copiado do design: não editar à mão) e globals.css (o que o app acrescenta)
  components/   peças do design, menu, ícones, busca, caixa de feito
  lib/          termos.ts (nomes e contas do design) · uti.ts (leitura do banco) · supabase/ · erros.ts
e2e/            conferência automática com banco de mentira (falso.cjs, confere.cjs, fotos.cjs); fotos saem em e2e/saida/ (fora do git)
public/fonts/   Atkinson Hyperlegible
docs/           MEMORY.md (decisões e débitos), STATUS.md (estado atual), template clínico
supabase/       migrations/ (histórico do banco), snippets/ (consultas e molde), functions/, config.toml
mcp-server/     pacote à parte: recebe as extrações das skills e grava no banco
THIRD_PARTY_LICENSES.md   licenças da fonte e dos ícones
```

## Rodar

```bash
npm install
cp .env.example .env.local   # preencher a chave pública do Supabase
npm run dev                  # http://localhost:3000
npm run typecheck && npm run build   # conferência (Node 20+)
```

Conferência das telas (só dados fictícios, nunca toca o banco real; precisa do Playwright, que já vem no ambiente de nuvem do Claude):

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=chave-de-teste npm run build
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=chave-de-teste npx next start -p 3111 &
node e2e/falso.cjs &       # banco de mentira na porta 54321
npm run test:e2e           # sai com 0 se tudo conferiu
node e2e/fotos.cjs         # opcional: fotos das telas em e2e/saida/
```

## Onde está cada coisa

- Leitura do banco: só em `src/lib/uti.ts`, no servidor. Erro de leitura vira tela de erro, nunca tela vazia.
- Gravação: `src/app/evolucao/Ficha.tsx` (evolução e pendências), `src/app/exames/Folhao.tsx` (coleta de hoje, só acrescenta) e `src/components/Check.tsx` (pendência feita).
- Regras do design e do banco: `CLAUDE.md` §3 e §4.
- Estado atual e pendências: `docs/STATUS.md`.
- Histórico antigo (app React+Vite e pacotes): tag `pre-faxina-2026-07-31` e ramo `archive/frontend-e-packages`.
