# Migrations arquivadas (pré-baseline)

Em 2026-06-26 o schema de produção foi **squashado** num único baseline
(`../20260626000000_baseline.sql`), gerado por `supabase db dump --schema public`
do estado vivo real.

Motivo: o schema de produção nasceu fora do repo (drift). As migrations `01–07`
abaixo cobriam só fragmentos e divergiam do remoto (o histórico remoto tinha ~20
versões timestamped sem arquivo local). Mantidas aqui como referência histórica.
NÃO estão no caminho de execução do `supabase db push`.
