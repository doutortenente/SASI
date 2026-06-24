# Import `Files_to_claudecode` (24-Jun-2026)

Bundle analisado e convertido para `.md`. **Fonte original intacta** em `~/Downloads/Files_to_claudecode/`.

## Staging completo

`claudecode-2026-06-24/` — 60 artefatos (docx/pdf/xlsx/ods → md + espelho de .md/.ts/.json/.sql).

Regenerar:

```bash
python3 sasi/scripts/import_claudecode_bundle.py
```

## Onde cada coisa foi parar

| Conteúdo | Destino | Decisão |
|---|---|---|
| Skills `sasi-ingest-export` + references | `~/dev/claude/skills/sasi-ingest-export/` | **Mantido canônico** — versão do bundle é mais antiga (ainda cita `ocr-ingest` Edge Function) |
| Skill `admissao-uti` | `~/dev/claude/skills/admissao-uti/` | **Mantido canônico** — docx convertido menor (247 vs 336 linhas) |
| Fixtures folha/prescrição (PDF→md) | `claude/skills/controles-vitais-janela/references/fixtures/` | **Adicionado** — texto parcial (scan manuscrito) |
| Caso prova VANESSA | `sasi/doctrine/examples/VANESSA_refatorada_v2_PROVA.md` | **Adicionado** — PHI ensino local |
| Handoff Abr/2026 | `sasi/docs/archive/handoff-2026-04-23.md` | **Arquivado** — credenciais redigidas |
| README Fase Bravo | `sasi/docs/archive/README-FASE-BRAVO.md` | **Arquivado** |
| Pipeline / Planilha UTI (xlsx/ods) | `sasi/docs/import/SASI_Pipeline_Status*.md`, `SASI_Planilha_UTI.md` | **Adicionado** |
| Grafo motor clínico | `sasi/docs/diagrams/grafo_dependencias_motor_clinico_sasi.png` | **Adicionado** |
| Pacote `sasi-clinical-engine` (scaffold) | `sasi/packages/sasi-clinical-engine/` | **Adicionado** — falta popular `src/` com motor do `frontend/src/lib/` |
| Fase Delta docx + SKILL.pdf | só em `staging/converted-*` | **Não promovido** — duplicata/legado vs canônico |
| `sasi_backup_temp/` código TS | só em `staging/sources-ts/` | **Não promovido** — snapshot antigo; app vivo está em `sasi/frontend/` |
| `src/lib/dictionaries/` (3 arquivos) | só em staging | **Não promovido** — seed parcial; vivo em `drugs.ts` monolítico |

## Não apagado (de propósito)

- Pasta `~/Downloads/Files_to_claudecode/` — fonte do usuário
- Staging `claudecode-2026-06-24/` — auditoria e diff futuro
- Canônicos em `claude/skills/` que já refletem MCP deploy e pós-migração Supabase