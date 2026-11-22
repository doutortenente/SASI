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
| Ingest | Skill `sasi-ingest-export` → JSON → MCP `sasi_deploy_ingest` (grava também intercorrências, prescrição, tipo de nota, gravidade, turno e data do plantão); as telas Exames e Evolução também gravam Sem essa ferramenta (claude.ai só com o conector do Supabase), a gravação é por SQL, seguindo o manual que está no banco (`avisos_agentes`, linha "MANUAL DO BANCO"). |

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

Ver `CLAUDE.md` §4. Migrações em `supabase/migrations/` (42 arquivos, iguais aos 42 registros de migração do banco), fonte única do esquema.

- 22/11/2026: termos do banco iguais aos do design (`20261122040931_termos_do_design`) e `pacientes.sexo` (`20261122052449_paciente_sexo_do_design`).
- Gravação testada ao vivo no banco real em 22-nov-2026, com paciente fictício e tudo desfeito no fim: admissão com alergias e isolamento, internação aberta pelo gatilho, recusa de segundo paciente no mesmo leito, evolução (incluir e alterar), conversão dos termos antigos, pendência, antimicrobiano com data, cultura e exame.
- Alta e troca de leito também foram testadas ao vivo no banco real em 22-nov-2026, com paciente fictício e tudo desfeito no fim: troca para leito vago, recusa de troca para leito ocupado, recusa de alta com data futura, alta e nova admissão no leito liberado.
- 22/11/2026: `save_ficha` corrigida (`20261122112751_save_ficha_nao_apaga_campo_ausente`): campo que não vem não é mais apagado. O app continua sem usar.
- 22/11/2026: limpeza pedida pelo operador (`20261122115156_limpeza_janelas_set_exames_marcados_copia_seguranca`): apagadas as 48 janelas de 27-set, os 27 exames antigos marcados para revisão e a cópia de segurança da troca de termos (esquema `arquivo`).
- 22/11/2026: manual de gravação dentro do banco e três travas (`20261122135919_manual_do_banco_e_travas_de_gravacao`): leito fora do padrão ou ocupado, campo ou opção de evolução fora da ficha (só para quem grava por fora do app) e limiar de sinal vital diferente do design. Testado ao vivo no banco real, com paciente fictício e tudo desfeito no fim: os exemplos do manual gravam; `L06`, `7`, `pam1`/`pam2`, suporte "IOT + VM", infusão com `diluicao_mg` e FR com limiar 20 são recusados com a instrução do que corrigir; o app (papel `anon`) grava evolução, troca de leito e alta como antes.
- 22/11/2026: apagados, por ordem do operador, todos os pacientes antigos, com internações, evoluções, exames, antimicrobianos, culturas, dispositivos, pendências e alertas deles: os 7 que ocupavam leito (`20261122140945_apaga_pacientes_antigos_ativos`) e os 14 com alta, mais os 17 registros antigos de auditoria de ingest (`20261122142152_apaga_pacientes_antigos_restantes`). O banco ficou sem nenhum paciente.

## 5. Pendências

Ver débitos em `docs/MEMORY.md`.

## Conferência automática

`npm run test:e2e` roda `e2e/confere.cjs` contra um banco falso (`node e2e/falso.cjs`, só dados fictícios) com o app em `localhost:3111`; `node e2e/fotos.cjs` tira as fotos das telas em `e2e/saida/` (fora do git).
