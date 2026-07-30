# Motor Clínico v2 — STAGING (não integrado)

> ⚠️ **Este código NÃO compila como está e NÃO está no caminho de build.**
> É staging deliberado em `docs/` — não em `src/lib/` — pra não quebrar o
> deploy (merge na main = Netlify pessoal via Netlify).

## Origem
Extraído via `pdftotext -layout` de 4 PDFs entregues em 24-jun-2026
(`Files_to_claudecode/MOTOR_SASI_SCRIPTS/`). PDFs originais arquivados no
OneDrive (camada documentos do mapa de 6 camadas), integridade conferida por
hash em 03-jul-2026 (nomes na convenção v2 por feature):
`OneDrive:/Google Drive/Dev-IA/dev_sasi-motor-clinico-v2-{sofa,sepsis,engine,clinical-logic-compat}_2026-06-24.pdf`
**Conferir a extração linha a linha antes de integrar** —
PDF→texto pode ter comido indentação ou quebrado linhas longas.

## Arquivos
| Arquivo | Destino final pretendido | Papel |
|---|---|---|
| `sofa.ts` | `src/lib/scores/sofa.ts` | SOFA Score (Singer 2016), 11 bugs P0 corrigidos |
| `sepsis.ts` | `src/lib/scores/sepsis.ts` | Sepsis-3 + choque séptico (ΔSOFA ≥ 2) |
| `engine.ts` | `src/lib/alerts/engine.ts` | motor de alertas (7 sub-engines) |
| `clinical-logic-compat.ts` | `src/lib/clinical-logic-compat.ts` | camada de compat com a API antiga |

## Bloqueio de integração — dependências ausentes
O motor pressupõe ~9 módulos que **não existem** no repo hoje. Sem eles, não builda:
- `../types`, `../types/clinical`
- `../dictionaries` (`DVA_DICT`)
- `../calculations/parseBR` (`parseFloatBR`)
- `../calculations/infusao` (`calcDoseInfusao`, `isVasopressorHighDose`)
- `../calculations/diurese` (`calcDiureseEfetiva`)
- `../calculations/ratios`
- `../guards/unitCoercion` (`coerceFiO2Input`, `coercePlaquetas`)
- `../constants` (`HEMO`, `RENAL`, `NEURO`)
- `../scores/qsofa` (`getQSOFA`)

## Próximo passo
Localizar/recriar as dependências acima, validar a extração, escrever testes
(Vitest) por componente, e só então mover pra `src/lib/`. Tarefa de FASE DELTA.
