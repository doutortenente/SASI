# features/ = dominios de TELA (UI)
beds/ (war room) · patients/ · devices/ · rounds/ · exports/ · war-room/ (triagem+split)

**Calculo clinico NAO mora aqui** — mora em:
- `packages/clinical-engine/` (motor SOFA/sepse; v2 em scores-v2-staging, fase futura)
- e nas **views SQL** (`vw_sofa_diario`, `vw_dias_atb_ativo`, `vw_bh_acumulado`...), ja vivas.
O app consome esses resultados; a tela nao recalcula.
