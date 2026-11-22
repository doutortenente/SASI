# supabase — o banco do SASI

| Item | Papel |
|---|---|
| `migrations/` | Histórico do banco vivo: cada arquivo tem o mesmo carimbo de `supabase_migrations.schema_migrations`. Já aplicadas: não editar nem reaplicar. `_gated/` guarda passos que NÃO rodam sozinhos |
| `schema-live-dump.sql` | Retrato do esquema lido do banco (referência; não é migração). O cabeçalho diz a data e o que falta somar |
| `queries/` | Consultas de plantão para o DataGrip |
| `templates/` | Molde de paciente fictício para teste |
| `functions/` | Edge functions legadas (`ocr-ingest`): não usar |
| `config.toml` | Configuração do Supabase CLI |

Os termos do banco são os do design (ver `CLAUDE.md` §4). Tipos TypeScript gerados não ficam no repositório, porque
nada os usa; para gerar: `supabase gen types typescript --project-id idswehsvvqczzkiatuzu`.
