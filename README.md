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

## Onde está cada coisa

- Leitura do banco: só em `src/lib/uti.ts`, no servidor. Erro de leitura vira tela de erro, nunca tela vazia.
- Gravação: `src/app/evolucao/Ficha.tsx` (evolução e pendências), `src/app/exames/Folhao.tsx` (coleta de hoje, só acrescenta) e `src/components/Check.tsx` (pendência feita).
- Regras do design e do banco: `CLAUDE.md` §3 e §4.
- Estado atual e pendências: `docs/STATUS.md`.
- Histórico antigo (app React+Vite e pacotes): tag `pre-faxina-2026-07-31` e ramo `archive/frontend-e-packages`.
