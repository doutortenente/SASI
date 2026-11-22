# app — Comando UTI

O app de plantão (Next.js 15). Segue o design system "Comando UTI · Folha de plantão"
(https://claude.ai/artifact/DfrYNmPhnsB5VS3m4hdR4T): o design manda, o app copia.

```
src/
  app/          telas: cards, round, tabela, passagem, exames, evolucao (+ moldura e tela de erro)
  components/   peças do design (ds.tsx), menu, ícones, busca, caixa de feito
  lib/          termos.ts (nomes, opções e contas do design) · uti.ts (leitura do banco) · supabase/ · erros.ts
  styles/       comando-uti.css (copiado do design: não editar à mão) · app.css (o que o app acrescenta)
public/fonts/   Atkinson Hyperlegible (licenças em licencas/)
```

- **Leitura do banco:** só em `lib/uti.ts`, no servidor. Erro de leitura vira tela de erro, nunca tela vazia.
- **Gravação:** `app/evolucao/Ficha.tsx` (evolução e pendências), `app/exames/Folhao.tsx` (coleta de hoje, só acrescenta) e `components/Check.tsx` (pendência feita).
- **Regras fixas do design:** `CLAUDE.md` §3, na raiz.
- **Conferir uma mudança:** `npx tsc --noEmit` e `npm run build`.
