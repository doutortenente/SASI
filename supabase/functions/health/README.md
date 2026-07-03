# Edge Function `health`

Endpoint de saúde do SASI usando o SDK oficial [`@supabase/server`](https://github.com/supabase/server)
(wrapper do supabase-js que valida a credencial da requisição e entrega um cliente já configurado).

- **Auth**: modo `publishable` — exige a chave publicável (`sb_publishable_...`) no header.
  Por isso o `config.toml` desliga a verificação de JWT da plataforma para esta função
  (`verify_jwt = false`): a chave publicável não é um JWT; quem valida é o próprio SDK.
- **Banco**: 1 leitura `count` em `alert_rules` (tabela de configuração, sem dado de paciente).
- **Deps**: pinadas no `deno.json` (`npm:@supabase/server@1.3.0`).

## Teste local (sem Docker)

```bash
cd supabase/functions/health
SUPABASE_URL=https://idswehsvvqczzkiatuzu.supabase.co \
SUPABASE_PUBLISHABLE_KEY=sb_publishable_9DVsZExR5QOIowCbpirhyw_dRuEVHsy \
SUPABASE_JWKS_URL=https://idswehsvvqczzkiatuzu.supabase.co/auth/v1/.well-known/jwks.json \
deno serve --allow-net --allow-env --port 8787 index.ts

curl -s -H "apikey: sb_publishable_9DVsZExR5QOIowCbpirhyw_dRuEVHsy" http://127.0.0.1:8787/
```

## Deploy

`supabase functions deploy health` (ou MCP `deploy_edge_function`). Na plataforma,
`SUPABASE_URL`/chaves/JWKS são injetadas automaticamente — nada a configurar.
