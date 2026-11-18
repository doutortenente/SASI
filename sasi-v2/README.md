# sasi-v2 — app de plantao (Next.js 15)

Reescrita do SASI seguindo o **template original** (War Room · dominios clinicos por feature). Mesmo banco Supabase de
sempre (nao muda de casa). Estrutura:

```
src/
  app/           # rotas (App Router): war room, leitos, pacientes, rounds, api
  features/      # dominios clinicos isolados (1 pasta = 1 assunto)
    beds/ patients/ hemodynamics/ sepsis/ devices/ sofa/ war-room/ rounds/ exports/
  components/    # ui (shadcn) + shared
  lib/           # supabase/{client,server,realtime}, utils, formatters, constants
  hooks/  stores/ (Zustand)  types/ (clinical, supabase, index)  styles/
supabase/functions/  # generate-sofa, sepsis-bundle-check, export-round, ocr-nursing-note
```

Rodar: `cp .env.example .env.local` -> preencher -> `npm install` -> `npm run dev`. As migrations do banco vivem em
`../supabase/migrations/` (raiz do repo). Regenerar tipos: `npm run gen:types`. Design: 2 temas (Tactical/Clinical) via
CSS vars em `src/styles/globals.css` — cada cor e um sinal.

## Design System (protótipo)

Galeria em `/design` (rota estática): primitivas core em `src/components/ui/` (Button, Badge, Card, Input,
SegmentedControl, StatPill) e clínicas em `src/components/clinical/` (GravityBadge, SofaBadge, TherapyBadge, VitalStat).
CSS dos componentes em `src/styles/ds/components.css` — porte do antigo `packages/design-system` (aposentado na faxina
de 31-jul-2026, commit `5cf8d17`) do `<style>` injetado por JS para uma folha única SSR-safe. Cores só por token, nos 2
temas.
