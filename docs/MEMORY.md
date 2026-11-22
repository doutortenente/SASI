# MEMÓRIA — SASI (`docs/`)

Índice do projeto. Só fato verificável (ZERO ALUCINAÇÃO).

```
docs/
├── MEMORY.md                    ← este arquivo (hub)
├── STATUS.md                    ← estado autoritativo do projeto
└── _SASI_TEMPLATE_BASE_v2.md    ← template-base clínico (Ramo C)
```

## Mapa

| Área | Caminho | Papel |
|---|---|---|
| App | `src/` | Telas do plantão (Next.js 15), no design "Comando UTI" — **único app do repo**, na raiz |
| Design | `src/app/comando-uti.css`, `src/lib/termos.ts` | Folha de estilos e termos copiados do design system |
| Banco | `supabase/migrations/` | Histórico do banco vivo (fonte única do esquema) |
| MCP | `mcp-server/src/` | skills → Supabase |
| Ingest | skill + MCP | Claude → JSON → deploy |
| Motor | banco (views `vw_sofa_diario`, `vw_eventos_tendencia`) | SOFA/tendências — **não** há pacote local |
| Doutrina | `docs/_SASI_TEMPLATE_BASE_v2.md` | template-base Ramo C |
| Consultas plantão | `supabase/snippets/plantao.sql` | SQL ad-hoc no DataGrip |

## Decisões do operador (não reabrir)

- **Sem login.** Uso pessoal e solo; `dev_bypass` fica ativo de propósito (31-jul e 27-set-2026). NÃO propor nem mencionar login, RLS de produção, trava de acesso da Vercel, OCR-no-app ou FHIR.
- **O design manda.** O app copia o design system "Comando UTI · Folha de plantão"; os termos do banco são os do design (22-nov-2026).
- **Um app só**, na raiz do repositório. Não recriar `app/`, `frontend/`, `packages/` nem pasta com "v2" no nome.
- **Produção é `sasi-uti.vercel.app`**, servindo este repositório (22-nov-2026).

## Débitos

1. 🔴 **SEGREDOS EXPOSTOS (30-jul)** — o cofre `.env` foi colado num chat. **Rotacionar**: token GitHub, `service_role` + senha do banco Supabase, senha-mestra do Vaultwarden, senhas de e-mail. Prioridade máxima.
2. **Skill de ingest com os termos antigos** — `sasi-ingest-export` (repo `claude-workspace` + cópia no claude.ai) ainda escreve `pa_sys`, `tax_max`, `obs`… O banco troca na entrada (gatilho `trg_00_termos_design`), mas a skill precisa passar a LER pelos nomes novos. Mapa em `CLAUDE.md` §4.
3. **Ficha: antimicrobianos e culturas só para leitura** — incluir, suspender e apagar ainda é pelo ingest. "Novo leito" não existe na tela.
4. **eventos_clinicos** — fila de revisão (`vw_eventos_pendentes_revisao`).
5. **SOFA bloqueado por dado** — bilirrubina e PaO2 raramente lançadas; a tela mostra "—", nunca inventa.
6. **Limiares das janelas antigas** — as janelas de 27-set foram contadas com FR > 20, PAD < 50, SpO2 < 92 e T > 37,8. O design usa FR > 25, PAD < 45, SpO2 < 88 e T > 38: a skill `controles-vitais-janela` precisa contar com os limiares do design. A tela mostra o limiar gravado em cada linha.
7. **regras eng-default** em `alert_rules` (Dx/K/Na/temperatura) sem evidência — pendente Vera.
8. **extensões em `public`** — mover `pg_trgm`/`vector` para o schema `extensions`.
9. **CSP pendente** — há 1 `<script>` em linha (tema) em `src/app/layout.tsx`; CSP estrita exige nonce.
10. **`save_ficha` no banco** — função antiga que apaga campos do paciente quando a chave não vem. O app não usa. Corrigir ou remover.
11. **Esquema `arquivo`** — cópias do "antes" da troca de termos (22-nov). Apagar quando não for mais preciso desfazer.
