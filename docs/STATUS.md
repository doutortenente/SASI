# STATUS — SASI (Comando UTI)

**Revisão:** 22/11/2026 · **Produção:** https://sasi-uti.vercel.app · **Banco:** Supabase `idswehsvvqczzkiatuzu` (Postgres 17)

> Documento de estado atual. Briefing para IA: `CLAUDE.md`. Atualize aqui em mudança de arquitetura, publicação ou banco.

## 1. O que está no ar

| Camada | O que é |
|---|---|
| App | raiz do repositório (`src/`) — Next.js 15 + React 19 + TypeScript. Único app do repositório |
| Design | "Comando UTI · Folha de plantão" (https://claude.ai/artifact/DfrYNmPhnsB5VS3m4hdR4T): folha de estilos, fontes e ícones copiados do design |
| Publicação | Vercel, projeto ligado a `doutortenente/SASI`, Root Directory vazio (raiz); cada merge na `main` publica |
| Banco | Supabase; uso pessoal e solo, sem login (decisão do operador) |
| Ingest | Skill `sasi-ingest-export` → JSON → MCP `sasi_deploy_ingest`; as telas Exames e Evolução também gravam |

## 2. Telas

Cards · Round · Tabela · Passagem · Exames · Evolução (UTI 2, 13 leitos).

- **Evolução** grava a ficha em `evolucoes` (uma linha por paciente, data do plantão e turno) e as pendências em `pendencias`. Copia a evolução em texto. Trocar de leito ou de tela com alteração não salva grava antes de sair.
- **Exames** lança a coleta de hoje em `eventos_clinicos` (só acrescenta, nunca apaga).
- **Passagem** copia o texto e imprime (PDF pelo navegador). Marcar pendência como feita grava na hora.

## 3. O que ainda não faz (em relação ao design)

- "Novo leito": o design mostra só o botão (no topo dos Cards e no cartão de leito vago), não o formulário. O formulário é escolha nossa, montado com as peças da ficha: leito vago, nome, idade, sexo, peso, altura, HD, alergias, isolamento (contato, gotícula, aerossol), data de admissão e gravidade. Nome, data de admissão e gravidade são obrigatórios; a data começa vazia; o que fica vazio grava null (isolamento sem marca não envia a coluna). Grava em `pacientes` e o banco abre a internação sozinho.
- Na Prescrição vigente do Round, os itens por sistema vêm do campo de prescrição gravado na evolução; "Hematológico" e o preparo das ampolas ("8 amp/250 mL") não têm fonte no banco e aparecem como travessão ou ficam de fora.
- Antimicrobianos e culturas: o antibiograma continua só para leitura na ficha. Antimicrobiano novo começa com o início vazio (grava null e o dia fica com travessão).
- Tema claro ou escuro: o design não tem botão; o app segue o aparelho (decisão fechada, nada a fazer).

## 4. Banco

Ver `CLAUDE.md` §4. Migrações em `supabase/migrations/` (36), fonte única do esquema.

- 22/11/2026: termos do banco iguais aos do design (`20261122040931_termos_do_design`) e `pacientes.sexo` (`20261122052449_paciente_sexo_do_design`).
- Os dados clínicos estão parados desde 27/09/2026 (último ingest).
- Gravação conferida em 22-nov-2026 por leitura do banco real (colunas, tipos, opções, permissões e o gatilho que abre a internação batem com o que o app envia); a gravação ao vivo ainda não foi exercitada.

## 5. Pendências

1. Rotacionar os segredos expostos em 30/07/2026 (ver `docs/MEMORY.md`).
2. A skill `sasi-ingest-export` (repo `claude-workspace` e a cópia do claude.ai) ainda escreve os termos antigos. O banco aceita e troca na entrada, mas o texto da skill precisa ser atualizado para LER pelos nomes novos.
3. O projeto Vercel antigo (`sasi`, ligado a `doutortenente/SASI-V3`) deixou de responder por `sasi-uti.vercel.app` em 22/11/2026, por ordem do operador.
4. `save_ficha` no banco: não usar (apaga campos do paciente quando a chave não vem).

## Conferência automática

`npm run test:e2e` roda `e2e/confere.cjs` contra um banco falso (`node e2e/falso.cjs`, só dados fictícios) com o app em `localhost:3111`; `node e2e/fotos.cjs` tira as fotos das telas em `e2e/saida/` (fora do git).
