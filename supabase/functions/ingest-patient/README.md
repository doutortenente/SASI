# ingest-patient (função antiga)

Função antiga, **ainda publicada** no Supabase e **fora do fluxo de plantão** (o ingest de hoje é Claude → JSON → MCP). O código fica no caminho padrão da CLI do Supabase (a ferramenta de linha de comando do Supabase): `supabase/functions/ingest-patient/`. Registra em `ingest_audit_log`. Foi escrita para o app mobile `uti-tracker` (caminho antigo). Não remover a função publicada sem confirmar que o app mobile antigo não chama mais este endpoint.
