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
| Conferência | `e2e/` | testes automáticos com banco falso (só dados fictícios) |

## Decisões do operador (não reabrir)

- **Sem login.** Uso pessoal e solo; `dev_bypass` fica ativo de propósito (31-jul e 27-set-2026). NÃO propor nem mencionar login, RLS de produção, trava de acesso da Vercel, OCR-no-app ou FHIR.
- **O design manda.** O app copia o design system "Comando UTI · Folha de plantão"; os termos do banco são os do design (22-nov-2026).
- **Um app só**, na raiz do repositório. Não recriar `app/`, `frontend/`, `packages/` nem pasta com "v2" no nome.
- **Produção é `sasi-uti.vercel.app`**, servindo este repositório (22-nov-2026).
- **Tema claro por padrão**, com a escolha Claro | Escuro no pé do menu (pedido do operador, 22-nov-2026; o design system não tem esse botão).

## Débitos

1. 🔴 **SEGREDOS EXPOSTOS (30-jul)** — o cofre `.env` foi colado num chat. **Rotacionar**: token GitHub, `service_role` + senha do banco Supabase, senha-mestra do Vaultwarden, senhas de e-mail. Prioridade máxima.
2. **Cópia da skill de ingest no claude.ai desatualizada** — a skill `sasi-ingest-export` do repositório `claude-workspace` passou a usar os termos do design em 22-nov-2026 (commit `9144948` daquele repositório); a cópia instalada no claude.ai ainda escreve `pa_sys`, `tax_max`, `obs`… O banco converte na entrada (gatilho `trg_00_termos_design`; mapa em `CLAUDE.md` §4).
3. **eventos_clinicos** — fila de revisão (`vw_eventos_pendentes_revisao`).
4. **SOFA bloqueado por dado** — bilirrubina e PaO2 raramente lançadas; a tela mostra "—", nunca inventa.
5. **Janelas de 27-set** — foram contadas com os limiares antigos (FR > 20, PAD < 50, SpO2 < 92 e T > 37,8); o design usa FR > 25, PAD < 45, SpO2 < 88 e T > 38. A tela mostra o limiar gravado em cada linha. A skill `controles-vitais-janela` já conta com os do design.
6. **CSP pendente** — CSP é a regra do navegador que limita quais scripts podem rodar. Há 1 `<script>` em linha (tema) em `src/app/layout.tsx`; CSP estrita exige nonce (código de uso único no script).
7. **`save_ficha` no banco** — função antiga que apaga campos do paciente quando a chave não vem. O app não usa. Corrigir ou remover.
8. **Esquema `arquivo`** — cópias do "antes" da troca de termos (22-nov). Apagar quando não for mais preciso desfazer.
9. **Migrações de 30-jul sem registro correspondente** — os arquivos `20260730120000_enums_e_dimensao_eventos.sql`, `20260730120100_eventos_tipo_fk.sql` e `20260730120200_memorias_dono_e_severidade_insert.sql` não têm registro com esse nome no banco; no lugar deles o banco registra `20260730065335_modelo_dados_v3_formalizacao` e `20260730065515_fix_enums_por_tipo`. O conteúdo não foi comparado.
10. **Skills médicas sobrepostas** — o operador disse em 22-nov-2026 que `controles-vitais-janela` é redundante com as outras. Fica para a próxima; sem plano.
11. **Regras de alerta** — conferido no banco em 22-nov-2026: das 28 regras de `alert_rules`, 27 têm a fonte gravada; 1 regra de sódio (`na`) está sem fonte. O limiar 250 de Dx é operacional (contra excesso de alarme), não de diretriz; isso está escrito na própria regra.
12. **`dispositivos` no MCP** — as ferramentas de admitir e de atualizar paciente (`mcp-server/src/tools/pacientes.ts`) ainda aceitam o campo `dispositivos`, que no banco é derivado e não se escreve à mão.
