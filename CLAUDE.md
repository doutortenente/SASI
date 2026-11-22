# CLAUDE.md — SASI (Sistema de Auditoria e Síntese Intensiva)

## DIRETRIZ MÁXIMA Nº 0 — INTERLOCUTOR É MÉDICO, NÃO PROGRAMADOR
**O Dr. Tenente (Nicolas Nagaita) é MÉDICO INTENSIVISTA, não programador.** É TERMINANTEMENTE PROIBIDO comunicar pressupondo que ele domina linguagem, jargão ou gíria de programação. Esta regra tem PRECEDÊNCIA sobre qualquer outra regra de tom ou formato.
- Todo termo de dev (build, deploy, merge, branch, commit, MCP, RLS, env, porta, cache, endpoint, repo, runtime, log…) leva tradução em 1 linha, em português comum, na 1ª vez que aparece na resposta.
- Explicar como a um colega médico inteligente que nunca programou: analogia clínica ou do cotidiano antes do jargão.
- Proibido: sigla crua sem expandir, jargão solto, "é só rodar X" sem dizer em palavras o que X faz e por quê.

> Briefing operacional do projeto. Lido pelo Claude Code ao abrir o repo.
> **Última atualização:** 22-nov-2026 — app na raiz do repositório, no padrão do Next.js.
> Este arquivo substitui qualquer `_HANDOFF_BRIEFING.md` (datado 23-Abr-2026, **STALE** — não é fonte da verdade).
> **Memória persistente do projeto:** @docs/MEMORY.md

-----

## 1. Missão

Sistema de gestão clínica para a operação solo de UTI do Dr. Nicolas Nagaita (intensivista, “Tenente”) — **33 leitos** distribuídos em **UTI 2 (L01–L12, 12 leitos)**, **UTI 3 (13 leitos)**, **UTI 4 (L01–L08, 8 leitos)**. Padrão de referência de leito: `UTI#-L##`.

Dupla frente:

1. **Tempo real de plantão** — documentação clínica de alta qualidade e suporte à decisão durante turnos noturnos.
1. **Construção do SASI** — reduzir deterioração evitável via melhor tooling de dados e automação.

Toda documentação clínica é em **Português do Brasil**.

-----

## 2. Doutrina inviolável (regras de ouro)

1. **ZERO ALUCINAÇÃO** — campo sem fonte legível → `null` + warning. Nunca um valor “razoável”. Componentes de SOFA ficam sem calcular quando falta dado, jamais estimados. Inventar dado em prontuário é falsificação documental.
1. **Ortogonalidade de eixos (Ramo C)** — cada bloco governa UM eixo: Tempo (Intercorrências) / Estado (EF) / Problema (Impressão) / Ação (Conduta 1:1). Nenhum fato cabe em dois blocos.
1. **Sinais vitais Max–Min** — `[MÁXIMO]–[MÍNIMO]` em todos os parâmetros, **SpO2 incluso** (`98–89%`, nunca `89–98`).
1. **Conduta 1:1** com a Impressão, metas sempre numéricas.
1. **Flags gritam, não consertam** — o sistema sinaliza o implausível; o médico decide.
1. **Prosa limpa e juridicamente sólida** dentro dos blocos de prontuário. Comentário tático isolado em `// Comando Tático`.
1. **Ingest = Claude → JSON → Supabase** — a skill `sasi-ingest-export` lê foto/PDF/texto, valida e entrega payload JSON. Gravação: **“deploy”** / **“salvar no Supabase”** → MCP tool **`sasi_deploy_ingest`**. Sem pipeline automático, sem AppSheet, sem atalho iOS.

-----

## 3. Stack

- **App:** Next.js 15 (App Router) + React 19 + TypeScript strict, **na raiz do repositório** (`src/`, `public/`) → **Vercel** (Root Directory vazio = raiz), produção em **https://sasi-uti.vercel.app**. É o ÚNICO app do repositório.
- **Banco:** Supabase (PostgreSQL 17, projeto `idswehsvvqczzkiatuzu`, região `sa-east-1`).
- **Ingest clínico:** Claude (skill `sasi-ingest-export`) → JSON → MCP. As telas Exames e Evolução também gravam.
- **Edge Functions:** `ocr-ingest` e `ingest-patient` são funções antigas, publicadas no Supabase, com código em `supabase/functions/` — **não** são fluxo operacional.
- **Operador:** uso **pessoal e solo** (Dr. Nicolas). Não é produto multi-usuário nem deploy hospitalar.

### Design: "Comando UTI · Folha de plantão" (fonte única)

O app implementa o design system publicado em https://claude.ai/artifact/DfrYNmPhnsB5VS3m4hdR4T. **O design manda; o app copia.**

- **Onde está no app:** `src/app/comando-uti.css` (variáveis e folha de estilos do design, copiadas do artefato: **não editar à mão**), `src/components/icones.ts` (ícones), `public/fonts/` (Atkinson Hyperlegible) e `src/lib/termos.ts` (nomes e opções).
- **Telas (menu, nesta ordem):** Cards · Round · Tabela · Passagem · Exames · Evolução. UTI 2, 13 leitos (no banco existe `UTI2-L13`); computador (1440 px) e tablet (1194 px); tema claro ou escuro pelo tema do aparelho.
- **Regras fixas do médico (nenhuma mudança pode quebrá-las):**
  1. Número nunca muda de cor. Valor fora do limiar aparece só como pílula vermelha com a contagem (`5x < 65`).
  2. O quadro se chama "Cardio-hemodinâmica". O nome não muda.
  3. CAM-ICU tem três opções: Positivo, Negativo, Não aplicável.
  4. Cada quadro de sistema termina na linha Notas.
  5. Sistemas em duas colunas: Neuro, Resp e Cardio-hemodinâmica à esquerda; TGI, Renal, Hemato e Infecto à direita.
  6. Limiares da pílula: PAS < 90 ou > 180; PAD < 45 ou > 120; PAM < 65 ou > 130; FC > 100; FR > 25; SpO2 < 88 %; temperatura > 38 °C; Dx > 180. A contagem vem pronta de `janelas_24h`, com o limiar gravado na linha.
  7. Sinais vitais sempre em máximo–mínimo, SpO2 incluída.
  8. Sem caixa alta. Diálise é TRS. Não coletado é travessão. Campo sem valor fica vazio. Número em pt-BR, com vírgula.
  9. Zero invenção: a ficha não supõe valor nem corrige sozinha; a conta fica em branco quando falta dado.
- **Mudou o design?** Copiar de novo a folha de estilos do artefato para `comando-uti.css` e ajustar as telas. Não criar cor, fonte nem componente fora do design.

-----

## 4. Banco (estado vivo em 22-nov-2026)

Fonte única do esquema: `supabase/migrations/` (37 arquivos, com o mesmo carimbo do banco). Os rascunhos antigos (`_archive`, `_gated`, retrato do esquema) estão no histórico do git, commit `0d3610c`.
**17 tabelas · 10 views · 19 enums · 80 códigos de evento.** RLS ligada com `dev_bypass` (uso solo, decisão do operador).

**Os termos do banco são os do design** (migração `20261122040931_termos_do_design`):

- **Vocabulário de eventos (`evento_tipo_ref`):** `pas`, `pad`, `pam`, `fc`, `fr`, `spo2`, `temp`, `dx`, `cai` (cálcio iônico), `uf_trs`… com `rotulo` (nome da tela Exames) e `sigla` (nome curto da ficha). Tipo novo = nova LINHA, não mexe em código.
- **`evolucoes`:** uma coluna JSON por quadro (`neuro`, `resp`, `hemo` = Cardio-hemodinâmica, `tgi`, `renal`, `hemato`, `infecto`). A chave é o nome do campo no design, em minúsculas (`pas_max`, `temp_max`, `diurese_ml` + `diurese_h`, `notas`…); a escolha guarda o texto do botão ("Não aplicável"). Contrato completo: `src/app/evolucao/Ficha.tsx`.
- **Termo antigo ainda é aceito na ENTRADA** e trocado pelo do design por gatilho (`trg_00_termos_design`): `pa_sys`→`pas`, `pa_dia`→`pad`, `glicemia`→`dx`, `uf_dialise`→`uf_trs`, `ca` em mmol/L→`cai`; nas evoluções, `pa_sys_*`→`pas_*`, `pa_dia_*`→`pad_*`, `tmax`/`tax_*`→`temp_*`, `obs`→`notas`, `diurese_24h_ml`→`diurese_ml` + `diurese_h`; sistema da conduta `hemo`→`Cardio-hemodinâmica`. Leucócitos e plaquetas ficam em ×10³/µL.
- **O "antes" da troca** está no esquema `arquivo` (tabelas `termos_20261122_*`), para desfazer.
- **Códigos internos que NÃO mudaram** (o nome do design está no comentário do tipo ou da coluna): `isolamento_enum` (`contact` = contato…), `dispositivo_tipo_enum` (`arterial` = PAI, `trr` = Shiley, `traqueo` = TQT) e a coluna `hemo`.

| Tabela | Função |
|---|---|
| `pacientes` | Cadastro, leito (`UTI2-L03`), gravidade (`estavel` · `watcher` · `instavel` · `critico`), `sexo`, isolamento. `dispositivos` é DERIVADO: proibido escrever à mão |
| `internacoes` | Episódios de UTI; dia de UTI = hoje − `int_uti_data` |
| `evolucoes` | A ficha: uma linha por paciente + `data_plantao` + `turno` (diurna · noturna) |
| `janelas_24h` | Máximo, mínimo e nº de medidas fora do limiar por sinal (de onde sai a pílula) |
| `eventos_clinicos` | Série de exames e medidas; `evento_tipo_ref` é o vocabulário |
| `dispositivo_episodios` | Um registro por dispositivo por período de uso |
| `atbs` · `culturas` · `antibiograma` | Antimicrobianos e microbiologia |
| `pendencias` | Pendências / riscos (P1 a P3) |
| `alert_rules` · `trend_rules` · `alerts_log` | Regras e registro de alertas (a tela Exames pinta a célula por `alert_rules`) |
| `ingest_audit_log` · `memorias` · `avisos_agentes` | Auditoria de ingest, memória e avisos para agentes |

**Atenção:**
- `save_ficha` (função antiga) apaga HD, idade, peso, altura e alergias quando o campo não vem. O app NÃO usa; não chamar.
- As janelas de 27-set-2026 foram contadas com limiares antigos (FR > 20, SpO2 < 92…): a pílula mostra o limiar gravado na linha.
- SOFA: o cálculo mora no banco (`vw_sofa_diario`); falta dado (bilirrubina e PaO2 raramente lançadas). Nunca estimar.
- Migração: uma única chamada `apply_migration`.

-----

## 5. Auth e acesso (uso pessoal — decisão fechada)

**Operador único:** Dr. Nicolas. Ferramenta pessoal de plantão, **não** app hospitalar multi-usuário.

- O app abre direto, sem login. Policies `dev_bypass` ativas de propósito.
- **Sem plano de login, OAuth, MFA nem multi-tenant.** Decisão do operador: não propor e não mencionar login nem trava de acesso.

-----

## 6. Estado e próximos passos

Estado atual, o que o app ainda não faz e pendências: `docs/STATUS.md`. Débitos e decisões que não se reabrem: `docs/MEMORY.md`.

-----

## 7. Doutrina clínica (skills + templates)

Fonte da verdade: **`docs/_SASI_TEMPLATE_BASE_v2.md`** (Ramo C) — anatomia idêntica nas duas skills; alterou em uma, replica na outra no mesmo commit (divergência = bug clínico-legal).

**Skills** (fonte única: `~/projetos/claude/skills/` · symlink `~/.claude/skills` · commit `582f117`):

- `sasi-ingest-export` — extrai dados de fotos/PDFs/laudos → payload JSON validado; gera “Exportar Evolução” e “Exportar Turno”.
- `admissao-uti` — nota de admissão (modo D1).
- `controles-vitais-janela` — folha de enfermagem → sumário 24h/12h + flags.

**References:** `01-schema-eventos-clinicos`, `02-extraction-dictionary`, `03-clinical-sanity-checks`, `04-export-evolucao-template_v2` (+ v1 legado), `05-export-passagem-turno`.

**Espelhos da doutrina:**

- **Notion** → espaço 🪖 SASI → página “📐 Doutrina SASI — SKILLs & Templates” (9 subpáginas, escrito direto via MCP).
- **Obsidian/Drive** → `SASI_OBSIDIAN_doutrina.zip` + Drive “SASI — Arquivo de Operação”.

### Estrutura do repositório

```
src/            telas e código do app (app/ = rotas, components/, lib/)
public/         fontes (Atkinson Hyperlegible)
docs/           MEMORY.md, STATUS.md, _SASI_TEMPLATE_BASE_v2.md
supabase/       migrations/ (histórico do banco), snippets/ (consultas e molde), functions/ (ocr-ingest, ingest-patient), config.toml
mcp-server/     pacote à parte: skills → Supabase
.github/  .claude/  .mcp.json
package.json  next.config.ts  tsconfig.json  .env.example  THIRD_PARTY_LICENSES.md
```

- Um app só, na raiz. Não recriar `app/` (o Next tomaria como pasta de rotas), `sasi-v2/`, `frontend/`, `packages/`, `memory/` nem `doctrine/`.
- Rascunho e staging ficam fora do repositório.
- Recuperação do passado: tag `pre-faxina-2026-07-31` e ramo `archive/frontend-e-packages`.

-----

## 8. Padrões de output

- **Saída clínica:** duas partes — (1) SITREP de triagem rankeado por acuidade, depois (2) notas de evolução completas, prontas pro prontuário.
- **Planos de manejo:** blocos numerados com título de sistema, mapeamento 1:1 com problemas ativos.
- **Tabela tática de pacientes:** `intel()` deriva tiers de severidade de limiares fisiológicos (não do status declarado) — CRÍTICO / INSTÁVEL / VIGILÂNCIA / ESTÁVEL.
- **Documentos:** `.docx` em Times New Roman 10pt, A4, via lib `docx`, validado com OXML validator, entregue em `/mnt/user-data/outputs/`.
- **Comando “deploy”:** executa INSERT direto no Supabase via MCP sem pedir confirmação adicional.

-----

## 9. Estilo de comunicação

Terso, operacional, com inflexão militar (SITREP tático). **Chain-of-draft** quando pedir explicação/pesquisa/diagnóstico diferencial: passo a passo, ≤5 palavras por etapa ou só a equação. **Conduta final, doses e metas isoladas no fim da resposta.** Execução direta sem perguntas de esclarecimento como padrão; correções aceitas de forma terse e autocorrigidas integralmente.

-----

## 10. Aprendizados de engenharia (anti-armadilha)

- **Migração Supabase:** uma única chamada `apply_migration` lida com DDL interdependente (enums → tabelas → triggers → views) com mais confiabilidade que `execute_sql` sequencial.
- **Views:** `security_invoker = true` previne bypass de RLS.
- **Alertas:** dedupe por hash SHA-256 em `alerts_log` previne alarm fatigue.
- **Arquivos disfarçados:** `.pdf` pode ser container ZIP/Office — identificar por magic bytes `PK\x03\x04` (`xxd`), extrair com `unzip`.
- **Extração XLSX:** copiar para `/tmp/`, `load_workbook(data_only=True)`, iterar sheets, primeiras 25 linhas por sheet pra triagem rápida.
- **Upload a Drive:** base64 grande em `create_file` trunca silenciosamente — usar `textContent` para arquivos de texto.
- **Sandbox reseta entre sessões.** Arquivos de sessões passadas (binários, .docx, código) não persistem. `mkdir -p /mnt/user-data/outputs/SASI_BACKUP/` no início da sessão. Ler o SKILL.md relevante antes de processar.
- **MCP instalado no meio da conversa** só fica disponível na próxima sessão.
- **GitHub MCP indisponível** → pedir `git log --oneline -20 && git status -s && git branch -a && git remote -v` e reconstruir o estado a partir disso.

-----

## 11. Setup de sessão (checklist)

1. Ler o SKILL.md relevante antes de qualquer processamento.
1. `mkdir -p /mnt/user-data/outputs/SASI_BACKUP/`.
1. Fazer backup de arquivos-fonte antes de transformar.
   1. Tratar `_HANDOFF_BRIEFING.md` (23-Abr-2026) como STALE — este `CLAUDE.md` e os artefatos entregues prevalecem em qualquer conflito.
