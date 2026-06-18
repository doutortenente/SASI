---
name: sasi-comando-uti-design
description: Use this skill to generate well-branded interfaces and assets for SASI (Sistema de Auditoria e Síntese Intensiva) / "Comando UTI" — a Brazilian ICU patient-management app — for production or throwaway prototypes/mocks. Contains design guidelines, colors, type, fonts, the gravity/SOFA/organ-system clinical token language, Lucide iconography, reusable React components, and a full UI kit.
user-invocable: true
---

Read the `readme.md` file in this skill, then explore the other files.

**What this brand is:** a Portuguese (pt-BR) ICU command tool. Terse, clinical,
instrument-like. Two themes share one clinical foundation — **Clinical**
(light, blue accent, default) and **Tactical** (dark, red accent,
`data-theme="tactical"`); the navy sidebar is constant chrome. Acuity color is
the core visual language: gravity scale (Stable→Watcher→Unstable→Critical→
Deceased), SOFA thresholds, 7 organ-system hues, therapy badges. Type is IBM
Plex Sans + IBM Plex Mono (tabular numerals on all data). Icons are Lucide.

**To build:**
- Link `styles.css` for tokens + fonts. Add `data-theme="tactical"` on `<html>`
  for the dark theme.
- Load components from `_ds_bundle.js`:
  `const { LeitoCard, GravityBadge, SofaBadge, SystemPanel, Button, Card } = window.SASIComandoUTIDesignSystem_157e25`.
- Compose, don't reinvent — reuse `LeitoCard`, `SystemPanel`, etc.
- Icons: `<i data-lucide="activity"></i>` then `lucide.createIcons()`.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets
out and produce static HTML for the user to view. For production code, copy
assets and follow the rules here to design as an expert in this brand.

If invoked without guidance, ask what the user wants to build, ask a few
clarifying questions, then act as an expert designer who outputs HTML artifacts
or production code as the need dictates.
