# STATUS — SASI (Comando UTI)

**Revisão:** 22/11/2026 · **Produção:** https://sasi-uti.vercel.app · **Banco:** Supabase `idswehsvvqczzkiatuzu` (Postgres 17)

> Documento de estado atual. Briefing para IA: `CLAUDE.md`. Atualize aqui em mudança de arquitetura, publicação ou banco.

## 1. O que está no ar

| Camada | O que é |
|---|---|
| App | raiz do repositório (`src/`) — Next.js 15 + React 19 + TypeScript. Único app do repositório |
| Design | "Comando UTI · Folha de plantão" (https://claude.ai/artifact/DfrYNmPhnsB5VS3m4hdR4T): folha de estilos, fontes e ícones copiados do design |
| Publicação | Vercel, Root Directory vazio (raiz do repositório); `sasi-coral.vercel.app` redireciona para `sasi-uti.vercel.app` |
| Banco | Supabase; uso pessoal e solo, sem login (decisão do operador) |
| Ingest | Skill `sasi-ingest-export` → JSON → MCP `sasi_deploy_ingest` (grava também intercorrências, prescrição, tipo de nota, gravidade, turno e data do plantão); as telas Exames e Evolução também gravam |

## 2. Telas

Cards · Round · Tabela · Passagem · Exames · Evolução (UTI 2, 13 leitos).

- **Evolução** grava a ficha em `evolucoes` (uma linha por paciente, data do plantão e turno) e as pendências em `pendencias`. Copia a evolução em texto. Trocar de leito ou de tela com alteração não salva grava antes de sair.
- **Alta e Trocar de leito** (dois botões junto do cabeçalho do paciente, na Evolução) chamam as funções do banco `dar_alta_paciente` (desfecho, data digitada, destino e observações; a data nunca é deixada para o banco escolher) e `transferir_leito` (só leitos vagos da UTI 2). Com alteração não salva, a ficha é salva antes; se não salvar, nada é feito. O erro da função aparece na tela com o texto que veio.
- **Exames** lança a coleta de hoje em `eventos_clinicos` (só acrescenta, nunca apaga).
- **Passagem** copia o texto e imprime (PDF pelo navegador). Marcar pendência como feita grava na hora.

## 3. O que ainda não faz (em relação ao design)

- "Novo leito": o design mostra só o botão (no topo dos Cards e no cartão de leito vago), não o formulário. O formulário é escolha nossa, montado com as peças da ficha: leito vago, nome, idade, sexo, peso, altura, HD, alergias, isolamento (contato, gotícula, aerossol), data de admissão e gravidade. Nome, data de admissão e gravidade são obrigatórios; a data começa vazia; o que fica vazio grava null (isolamento sem marca não envia a coluna). Grava em `pacientes` e o banco abre a internação sozinho.
- Na Prescrição vigente do Round, os itens por sistema vêm do campo de prescrição gravado na evolução; "Hematológico" e o preparo das ampolas ("8 amp/250 mL") não têm fonte no banco e aparecem como travessão ou ficam de fora.
- Antimicrobianos e culturas: o antibiograma continua só para leitura na ficha, porque é assim no design. A hora da coleta da cultura não existe no design, então a ficha mostra só o dia. O nome do antimicrobiano oferece como sugestão os nomes já usados no banco (`atbs.droga`) e aceita nome novo. Antimicrobiano novo começa com o início vazio, mas o início é obrigatório: sem data válida o salvar recusa com aviso e nada é enviado.
- Tema: o app abre no claro, com a escolha Claro | Escuro no pé do menu (controle segmentado do design), guardada no aparelho. O design system não tem esse botão; é pedido do operador de 22-nov-2026.

## 4. Banco

Ver `CLAUDE.md` §4. Migrações em `supabase/migrations/` (38 arquivos, iguais aos 38 registros de migração do banco), fonte única do esquema.

- 22/11/2026: termos do banco iguais aos do design (`20261122040931_termos_do_design`) e `pacientes.sexo` (`20261122052449_paciente_sexo_do_design`).
- Gravação testada ao vivo no banco real em 22-nov-2026, com paciente fictício e tudo desfeito no fim: admissão com alergias e isolamento, internação aberta pelo gatilho, recusa de segundo paciente no mesmo leito, evolução (incluir e alterar), conversão dos termos antigos, pendência, antimicrobiano com data, cultura e exame.
- Alta e troca de leito também foram testadas ao vivo no banco real em 22-nov-2026, com paciente fictício e tudo desfeito no fim: troca para leito vago, recusa de troca para leito ocupado, recusa de alta com data futura, alta e nova admissão no leito liberado.
- 22/11/2026: `save_ficha` corrigida (`20261122112751_save_ficha_nao_apaga_campo_ausente`): campo que não vem não é mais apagado. O app continua sem usar.

## 5. Pendências

1. Rotacionar os segredos expostos em 30/07/2026 (ver `docs/MEMORY.md`).
2. A cópia da skill `sasi-ingest-export` no claude.ai ainda escreve os termos antigos (a do repositório `claude-workspace` foi atualizada em 22-nov-2026). O banco aceita e troca na entrada.

## Conferência automática

`npm run test:e2e` roda `e2e/confere.cjs` contra um banco falso (`node e2e/falso.cjs`, só dados fictícios) com o app em `localhost:3111`; `node e2e/fotos.cjs` tira as fotos das telas em `e2e/saida/` (fora do git).
