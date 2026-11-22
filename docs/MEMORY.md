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
| Manual dos agentes | banco: `avisos_agentes`, linha "MANUAL DO BANCO" | Como qualquer Claude grava no banco; as travas `trg_05_*` recusam o que foge dele |
| MCP | `mcp-server/src/` | skills → Supabase |
| Ingest | skill + MCP | Claude → JSON → deploy |
| Motor | banco (view `vw_eventos_tendencia`; `vw_sofa_diario` ficou parada) | tendências — **não** há pacote local |
| Doutrina | `docs/_SASI_TEMPLATE_BASE_v2.md` | template-base Ramo C |
| Consultas plantão | `supabase/snippets/plantao.sql` | SQL ad-hoc no DataGrip |
| Conferência | `e2e/` | testes automáticos com banco falso (só dados fictícios) |

## Decisões do operador (não reabrir)

- **Sem login.** Uso pessoal e solo; `dev_bypass` fica ativo de propósito (31-jul e 27-set-2026). NÃO propor nem mencionar login, RLS de produção, trava de acesso da Vercel, OCR-no-app ou FHIR.
- **O design manda.** O app copia o design system "Comando UTI · Folha de plantão"; os termos do banco são os do design (22-nov-2026).
- **Um app só**, na raiz do repositório. Não recriar `app/`, `frontend/`, `packages/` nem pasta com "v2" no nome.
- **Produção é `sasi-uti.vercel.app`**, servindo este repositório (22-nov-2026).
- **Tema claro por padrão**, com a escolha Claro | Escuro no pé do menu (pedido do operador, 22-nov-2026; o design system não tem esse botão).
- **Cores da versão 14 do design** nos dois temas (pedido do operador, 22-nov-2026, com duas fotos de referência): claro em cinza frio com botão preto; escuro em preto. Fonte e disposição continuam as da Folha de plantão.
- **SOFA fora do projeto** (ordem do operador, 22-nov-2026). Talvez reimplementar no futuro; as peças do banco e as menções no servidor MCP ficaram como estavam.
- **Senhas não serão trocadas** (decisão do operador, 22-nov-2026). Proibido propor ou mencionar a troca de novo.
- **Nada de tarefa para o operador.** O que depende dele não entra em lista de pendência nem é cobrado (falas dele em 22-nov-2026: "faça você", "proibido de me mandar fazer isso de novo").

## Débitos

1. **CSP pendente** — CSP é a regra do navegador que limita quais scripts podem rodar. Há 1 `<script>` em linha (tema) em `src/app/layout.tsx`; CSP estrita exige nonce (código de uso único no script).
2. **Skills médicas sobrepostas** — o operador disse em 22-nov-2026 que `controles-vitais-janela` é redundante com as outras. Fica para a próxima; sem plano. Fato conferido em 22-nov-2026: a cópia de `admissao-uti` instalada no claude.ai é uma versão diferente da do repositório (gera a nota em Word e não grava no banco).
