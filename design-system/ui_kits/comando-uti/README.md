# UI Kit — Comando UTI

Full interactive recreation of the SASI ICU command dashboard.

**Entry:** `index.html`

## Flow
1. **Login** — magic-link screen (skip to demo).
2. **Dashboard** with three view modes via the segmented switcher:
   - **Cards / Plantão** — gravity-coded `LeitoCard` grid.
   - **Round / Split** — patient list + dense clinical preview.
   - **Tabela / Editor** — spreadsheet-style PAINEL GERAL with vitals.
3. **Smart filters** — stats + pills (Críticos, Piora SOFA 24h, DVA, VM),
   UTI 2/3/4 filter, name/bed search.
4. **Ficha** (click any leito) — ordered for bedside decision-making:
   `3` Situação Atual (vitais, lab do dia, terapias/dispositivos, exame
   físico, eventos 24h) · `4` Avaliação por sistemas + impressão clínica ·
   **Problemas Ativos ⇄ Condutas 12–24h** (pareamento 1:1, dose + meta
   numérica) · `2` Paciente Sumário (HPMA + lab tabelão, referência).
5. **Passagem de Turno** — one-line synthesis per leito (síntese · muda
   conduta · pendências/riscos), the "Export PDF" handoff.
6. **Theme toggle** — clinical (light) ⇄ tactical (dark) in the top bar.

## Files
- `index.html` — shell: loads React UMD, Babel, Lucide, `_ds_bundle.js`, kit CSS + scripts.
- `kit.css` — layout + chrome (sidebar, top bar, grids, modal, table) on DS tokens.
- `data.jsx` — fictional patient + lab demo data (`window.SASI_DATA`).
- `Chrome.jsx` — `Sidebar` + `TopBar`.
- `Views.jsx` — `DashboardCards`, `RoundView`, `TableView`.
- `PatientDetail.jsx` — the numbered ficha modal.
- `Handoff.jsx` — passagem de turno.
- `Login.jsx` — magic-link login.
- `App.jsx` — orchestrator (auth, theme, view, filters, selection).

All clinical content is fictional demo data. Components come from the design
system bundle — the kit only composes them.
