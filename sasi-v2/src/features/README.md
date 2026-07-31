# features/ = dominios de TELA (UI)
beds/ (war room) · patients/ · devices/ · rounds/ · exports/ · war-room/ (triagem+split)

**Calculo clinico NAO mora aqui** — mora em:
- o **banco** (views `vw_sofa_diario`, `vw_eventos_tendencia`) — o cálculo clínico não mora na tela
- e nas **views SQL** (`vw_sofa_diario`, `vw_dias_atb_ativo`, `vw_bh_acumulado`...), ja vivas.
O app consome esses resultados; a tela nao recalcula.
