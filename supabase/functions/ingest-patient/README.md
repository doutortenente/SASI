# ingest-patient (função antiga)

Função antiga, **ainda publicada** no Supabase e **fora do fluxo de plantão** (o ingest de hoje é Claude → JSON → MCP). O código fica neste caminho padrão da CLI do Supabase: `supabase/functions/ingest-patient/`.

Edge function do app mobile **uti-tracker** (caminho antigo). Mantida aqui como referência de auditoria (`ingest_audit_log`) e para diff histórico. Não remover sem confirmar que o mobile não chama mais este endpoint.
