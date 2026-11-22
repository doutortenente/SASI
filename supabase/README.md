# supabase — o banco do SASI

| Item | Papel |
|---|---|
| `migrations/` | Histórico do banco vivo e fonte única do esquema. São 37 arquivos; o banco registra 36 migrações. 34 arquivos batem com o banco em carimbo e nome; 3, de 30-jul, não têm registro com esse nome (ver `docs/MEMORY.md`). Já aplicadas: não editar nem reaplicar |
| `snippets/` | `plantao.sql` (consultas de plantão para o DataGrip) e `molde_paciente.sql` (paciente fictício para teste) |
| `functions/` | Edge functions `ocr-ingest` e `ingest-patient` (antigas, publicadas no projeto): não usar no dia a dia. `functions/.env.example` lista as variáveis para rodá-las localmente |
| `config.toml` | Configuração do Supabase CLI |

Os termos do banco são os do design (ver `CLAUDE.md` §4). Rascunhos antigos (`_archive`, `_gated`, retrato do esquema) estão no
histórico do git, commit `0d3610c`. Tipos TypeScript gerados não ficam no repositório, porque nada os usa; para gerar:
`supabase gen types typescript --project-id idswehsvvqczzkiatuzu`.
