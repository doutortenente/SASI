# SASI · Comando UTI — Design System

**SASI (Sistema de Auditoria e Síntese Intensiva)** is a Brazilian ICU
(Unidade de Terapia Intensiva) patient-management web app — internal codename
**"Comando UTI Alpha."** It helps intensivists track critically-ill patients
across three units (UTI 2 / 3 / 4, ~33 beds), score acuity (SOFA / Sepsis-3),
structure assessment by organ system, and generate the shift handoff
("passagem de turno"). The product language is **Brazilian Portuguese (pt-BR)**.

This design system distills that product into reusable foundations,
components, and a full UI-kit recreation so any new SASI surface — a screen,
a slide, a printable handoff — can be built on-brand in minutes.

## Sources (explore for deeper fidelity)
- **GitHub — deployed app:** `doutortenente/SASI`
  (live: `https://sasi-uti.netlify.app`). Código em `frontend/`
  (Vite + React 18 + Tailwind v4 + lucide-react + Supabase).
- Key files read to build this system: `frontend/src/index.css` (theme tokens,
  gravity/SOFA/system/badge classes), `LeitoCard.tsx`, `Dashboard.tsx`,
  `SplitView.tsx`, `TableView.tsx`, `PatientSummary.tsx`, `SasiSynthesis.tsx`,
  `Login.tsx`, `ViewSwitcher.tsx`, `lib/theme.tsx`, `lib/drugs.ts`.
- A **Grok concept mockup** (light "executive dashboard" with the numbered 1–5
  workflow) supplied by the user informed the *clinical* theme's layout
  direction. The user clarified it is **not mandatory** — used as inspiration.

> If you have access to the repo, read those components for exact clinical
> dictionaries (DVA drugs, sedatives, scales) and the Supabase schema.

---

## Two themes, one foundation

The deployed app ships three modes (`dark`, `clinical`, `light`). This system
consolidates them into **two co-equal themes that share every clinical
token** (gravity, SOFA, organ systems, therapy badges). Neither is "primary"
— Clinical loads by default only because something must; always offer the
toggle:

| Theme | When | Canvas | Accent | Set via |
|---|---|---|---|---|
| **Clinical** *(default load)* | Daytime rounds, bright ICU, projection | light gray `#EEF1F6`, white cards | **blue `#2563EB`** | `:root` (no attr) |
| **Tactical** *(co-equal)* | Night command, the deployed war-room identity | slate `#0F172A` | **red `#DC2626`** | `<html data-theme="tactical">` or `<body class="theme-tactical">` |

The command **sidebar is navy in both themes** — it is the constant brand chrome.

---

## CONTENT FUNDAMENTALS

**Language.** Brazilian Portuguese, clinical register. Tone is **terse,
imperative, instrument-like** — built for 3–5-second decisions at the bedside.
The deployed app carries a deliberate **military/tactical metaphor** ("Comando
UTI", "sala de guerra", "trincheira", "Stay hard 🦅"); keep that energy in
product chrome, but **never** in clinical content — patient-facing data stays
precise and sober.

- **Casing.** Eyebrow/section labels are UPPERCASE with wide tracking
  (`PROBLEMA ATIVO`, `SITUAÇÃO ATUAL`, `META`). Titles are sentence case.
  Acronyms stay capitalized (SOFA, DVA, VM, VNI, ATB, BH, PAM, IRA, SDRA, HD).
- **Voice.** Third-person/impersonal clinical statements, not "you/I".
  Plans are written as actions with a **numeric target**:
  *"Titular noradrenalina → PAM ≥ 65 mmHg"*, *"BH negativo 1000 mL/24h"*.
- **Vetor convention.** Active problems carry a trend arrow:
  **↑ piora (worsening, red) · ↓ melhora (improving, emerald) · = estável**.
- **Numbers.** Always tabular mono. Units follow the value
  (`0,16 mcg/kg/min`, `38,7°`, `+1240 mL`). Decimal comma is acceptable in
  copy (pt-BR) though component demos use periods.
- **Emoji.** Used *sparingly* in internal/dev chrome only (🪖🦅 in the repo
  README). **Do not** use emoji in clinical UI — iconography is Lucide.
- **Sample voice:** *"Choque séptico SCAI C, foco pulmonar"* · *"Sepse
  pulmonar em resolução"* · *"Aguardar cultura de hemato — 48h"* ·
  *"Passagem de turno copiada (8 pacientes)"*.

---

## VISUAL FOUNDATIONS

**Color.** A slate neutral spine carries the UI; **acuity color does the
talking.** The gravity scale is the single most important visual system:
**Stable (emerald) → Watcher (amber) → Unstable (orange) → Critical (red) →
Deceased (slate)** — Portuguese labels Estável/Watcher/Instável/Crítico/Óbito.
It appears as a card left-accent bar, a badge, and a tinted card wash. SOFA
score has its own four-step threshold ramp (emerald→amber→orange→red). Seven
organ systems each own a hue (neuro purple, resp sky, hemo rose, tgi amber,
renal lime, hemato pink, infecto teal) used as left borders + titles. Therapy
pills (DVA, Sed, VM, VNI, ATB, Pend, Sepse-3) are soft tinted on light,
translucent on dark. Avoid inventing colors outside these ramps.

**Type.** `IBM Plex Sans` for UI; `IBM Plex Mono` for every instrument readout
(bed number, SOFA, vitals, labs, BH) — tabular numerals are non-negotiable on
data. *(Substitution note: the deployed app uses the system-ui sans stack; we
adopt IBM Plex for a precise clinical character. Fonts load from Google Fonts
CDN — see "Caveats." Swap for self-hosted/system in production if desired.)*

**Spacing & shape.** 4px base grid. Primary cards use `--radius-xl` (16px) with
a 6px gravity left-accent; panels 12px; controls 8px; badges 6px; pills full.
Density is high but breathable — dashboards pack many cards, the ficha packs
many panels.

**Backgrounds.** Flat, calm surfaces — **no decorative gradients, no imagery,
no textures** in content. The only gradients are the navy sidebar chrome and
the small blue logo mark. The canvas is a single cool gray; cards are white
(clinical) / slate-800 (tactical).

**Elevation.** Light theme uses layered *soft* shadows (`--shadow-card` →
`--shadow-raised` → `--shadow-pop`); tactical uses deeper black shadows. Cards
sit on subtle 1px borders, not heavy shadows.

**Motion.** Restrained and instrument-like. Cards fade-in on mount
(`sasi-fade-in`, 360ms ease-out, 8px rise). Drawers slide. **One** deliberate
attention loop exists: `sasi-critical-pulse` — a 2s red halo applied **only**
to critical / Sepsis-3 patients. Everything honors
`prefers-reduced-motion: reduce`.

**Hover / press.** Interactive cards lift `translateY(-1px)` + deepen shadow on
hover, settle to `scale(0.992)` on press. Buttons darken the accent on hover,
nudge down `0.5px` + `scale(0.99)` on active. Nav items get a translucent wash
+ a left accent bar when active. Focus shows a 3px accent ring.

**Borders & dividers.** Hairline `--border-subtle` inside cards;
`--border-default` on card/control edges; `--border-strong` for emphasis.

---

## ICONOGRAPHY

The app uses **`lucide-react`** exclusively — clean, 2px-stroke, rounded-cap
line icons. This system mirrors that with **Lucide via CDN**
(`unpkg.com/lucide@0.460.0`); render `<i data-lucide="name"></i>` then call
`lucide.createIcons()`. No icon font, no sprite, no PNG icons in the source,
and **no hand-rolled SVG** — always use Lucide names.

Canonical glyphs in use: `activity` (brand mark / SOFA), `heart` (DVA),
`droplets` (sedation), `wind` (ventilation), `pill` (ATB / prescrições),
`flame` (Sepse-3), `alert-triangle` (pendências), `shield-check` (auth/LGPD),
`bed-double`, `users`, `layout-grid`/`list`/`table` (view modes),
`clipboard-list`/`clipboard-copy`, `file-down` (export PDF), `brain`, `zap`,
`thermometer`, `flask-conical`, `test-tubes`, `bug` (organ systems),
`target` (metas). The **logo** is a blue rounded-square holding the Lucide
`activity` glyph + an "SASI" wordmark (no standalone logo file ships in the
repo — this lockup is defined in `guidelines/brand-logo.card.html`).

---

## INDEX / MANIFEST

**Root**
- `styles.css` — the single entry point consumers link (imports all tokens + fonts).
- `tokens/` — `colors.css`, `themes.css`, `typography.css`, `spacing.css`,
  `animations.css`, `fonts.css`.
- `readme.md` — this guide. · `SKILL.md` — Agent-Skill wrapper.

**Components** (`window.SASIComandoUTIDesignSystem_157e25.*`)
- `components/core/` — `Button`, `Badge`, `Card`, `Input`,
  `SegmentedControl`, `StatPill`.
- `components/clinical/` — `GravityBadge`, `SofaBadge`, `TherapyBadge`,
  `VitalStat`, `SystemPanel`, `ProblemRow`, `LeitoCard`.

**UI kit**
- `ui_kits/comando-uti/` — full interactive dashboard: Login → Cards / Round /
  Tabela view modes, the structured patient **ficha** (Situação Atual →
  Avaliação por sistemas → **Problemas ⇄ Condutas 1:1** com dose + meta
  numérica → HPMA + tabelão), and **Passagem de Turno**. Theme toggle
  (clinical ⇄ tactical, persisted). Entry: `index.html`.

**Templates** (copyable starting points for consuming projects)
- `templates/comando-uti-dashboard/` — Plantão Board: sidebar + top bar + gravity-coded LeitoCard grid.
- `templates/comando-uti-ficha/` — Ficha do Paciente: Situação Atual, sistemas, Problemas ⇄ Condutas 1:1, HPMA + tabelão.
- `templates/comando-uti-passagem/` — Passagem de Turno: 3 linhas por leito (síntese · muda conduta · pendências/riscos), print-ready.

**Foundation cards** (Design System tab) — `guidelines/*.card.html`
(Colors ×6, Type ×2, Spacing ×2, Brand ×2) + per-directory component cards.

---

## Caveats
- **Fonts** load from the Google Fonts CDN (IBM Plex Sans/Mono), substituting
  the app's system-ui stack — needs network; self-host for production/offline.
- **Component & UI-kit cards** render against the generated `_ds_bundle.js`,
  which compiles after the turn — they appear blank only until then.
- Clinical data in the UI kit is **fictional** demo content.
