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

- Na ficha, antimicrobianos e culturas aparecem só para leitura (incluir, suspender e apagar ainda é pelo ingest).
- "Novo leito" (admissão pela tela) não existe.
- A diluição da droga é digitada (no design é uma lista).
- A Prescrição vigente do Round mostra só as infusões da evolução (não há prescrição estruturada no banco).
- O tema claro ou escuro segue o do aparelho (não há botão).
- Os gráficos pequenos do Round e de Exames são barras simples, não o desenho exato do design.

## 4. Banco

Ver `CLAUDE.md` §4. Migrações em `supabase/migrations/` (36), fonte única do esquema.

- 22/11/2026: termos do banco iguais aos do design (`20261122040931_termos_do_design`) e `pacientes.sexo` (`20261122052449_paciente_sexo_do_design`).
- Os dados clínicos estão parados desde 27/09/2026 (último ingest).

## 5. Pendências

1. Rotacionar os segredos expostos em 30/07/2026 (ver `docs/MEMORY.md`).
2. A skill `sasi-ingest-export` (repo `claude-workspace` e a cópia do claude.ai) ainda escreve os termos antigos. O banco aceita e troca na entrada, mas o texto da skill precisa ser atualizado para LER pelos nomes novos.
3. O projeto Vercel antigo (`sasi`, ligado a `doutortenente/SASI-V3`) deixou de responder por `sasi-uti.vercel.app` em 22/11/2026, por ordem do operador.
4. `save_ficha` no banco: não usar (apaga campos do paciente quando a chave não vem).
