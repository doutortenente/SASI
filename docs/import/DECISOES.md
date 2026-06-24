# Decisões — ingestão `Files_to_claudecode`

**Data:** 2026-06-24  
**Origem:** `~/Downloads/Files_to_claudecode` (61 arquivos, intacta no Downloads)

## Leitura do pacote

O ZIP/pasta mistura quatro camadas diferentes:

1. **Skills Claude** (`sasi-ingest-export`, docx em `Skills e Docs Claude/`) — material de ingest/export clínico.
2. **Fase Delta** — mesmas references em docx + `SKILL.pdf`; versão que ainda aponta para Edge Function `ocr-ingest`.
3. **`sasi_backup_temp`** — fotografia de abril/2026: Firebase, handoff operacional, TS de migração.
4. **Fixtures UTI** — PDFs de folha/prescrição Beneficência Portuguesa para teste de transcrição.

Também há: planilhas de status (abr/2026), grafo PNG do motor, scaffold `sasi-clinical-engine`, e 3 arquivos TS de dicionário (seed incompleto).

## Confronto com a stack viva (jun/2026)

| Artefato no bundle | Stack atual | Veredito |
|---|---|---|
| `sasi-ingest-export` references 02–05 | Idênticos em `~/dev/claude/skills/` | Não mexer |
| reference `01-schema` e `06-api` | Canônico já diz MCP **deploy**, não Edge Function | **Canônico vence** — bundle desatualizado |
| `SKILL.md` (128 linhas canônica) | docx convertido ~131 linhas | Canônica mais completa e atualizada |
| `admissao-uti` docx | SKILL canônica 336 linhas | Canônica vence |
| Código `backup_temp` | `sasi/frontend/` + Supabase migrations | Arquivo histórico apenas |
| `dictionaries/*.ts` (3 arquivos) | `frontend/src/lib/drugs.ts` monolítico | Não promover — parcial |
| `sasi-clinical-engine` | Só configs; motor não extraído ainda | Guardar scaffold, popular depois |

## O que entra na stack

| Peça | Repositório / caminho |
|---|---|
| PDFs UTI → md | `claude/skills/controles-vitais-janela/references/amostras/` |
| Caso VANESSA (prova template) | `sasi/doctrine/casos/VANESSA_v2_PROVA.md` |
| Handoff abr/2026 (senhas cortadas) | `sasi/docs/legado/handoff-2026-04.md` |
| README Fase Bravo | `sasi/docs/legado/fase-bravo.md` |
| Status pipeline (xlsx/ods) | `sasi/docs/legado/pipeline-sitrep-2026-04.md` |
| Planilha UTI (estrutura) | `sasi/docs/legado/planilha-uti-estrutura.md` |
| Grafo motor | `sasi/docs/figuras/grafo-motor-clinico.png` |
| Scaffold engine | `sasi/packages/clinical-engine/` |
| Staging integral | `sasi/docs/import/bundle-claudecode/` |

## O que fica só no staging (não promove)

- Toda pasta `Fase Delta/` convertida — redundante com skills, versão velha.
- `sasi_backup_temp` TS/SQL — consulta histórica via `bundle-claudecode/raw-*`.
- Duplicatas md já espelhadas no staging.

## O que não se apaga

- Pasta original em Downloads.
- Skills canônicas em `claude/skills/`.
- Staging `bundle-claudecode/` (auditoria).

## Regenerar staging

```bash
python3 ~/dev/sasi/scripts/ingest_downloads_bundle.py
```