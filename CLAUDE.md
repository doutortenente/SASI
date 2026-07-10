# CLAUDE.md — SASI (Sistema de Auditoria e Síntese Intensiva)

## DIRETRIZ MÁXIMA Nº 0 — INTERLOCUTOR É MÉDICO, NÃO PROGRAMADOR
**O Dr. Tenente (Nicolas Nagaita) é MÉDICO INTENSIVISTA, não programador.** É TERMINANTEMENTE PROIBIDO comunicar pressupondo que ele domina linguagem, jargão ou gíria de programação. Esta regra tem PRECEDÊNCIA sobre qualquer outra regra de tom ou formato.
- Todo termo de dev (build, deploy, merge, branch, commit, MCP, RLS, env, porta, cache, endpoint, repo, runtime, log…) leva tradução em 1 linha, em português comum, na 1ª vez que aparece na resposta.
- Explicar como a um colega médico inteligente que nunca programou: analogia clínica ou do cotidiano antes do jargão.
- Proibido: sigla crua sem expandir, jargão solto, "é só rodar X" sem dizer em palavras o que X faz e por quê.

> Briefing operacional do projeto. Lido pelo Claude Code ao abrir o repo.
> **Última atualização:** 10-Jul-2026 — faxina estrutural: docs clínicas → celebro, staging → `_lab`, duplicatas removidas (ver seção 7-A).
> Este arquivo substitui qualquer `_HANDOFF_BRIEFING.md` (datado 23-Abr-2026, **STALE** — não é fonte da verdade).
> **Memória persistente do projeto:** @memory/MEMORY.md

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

- **Frontend:** React + TypeScript + Tailwind + Vite → **Netlify** `sasi-uti.netlify.app`.
- **Backend:** Supabase (PostgreSQL 17, projeto `idswehsvvqczzkiatuzu`, região `sa-east-1`).
- **Ingest clínico:** Claude (skill `sasi-ingest-export`) → JSON → MCP ou frontend.
- **Edge Functions:** `ocr-ingest` legado no repo — **não** é fluxo operacional.
- **Operador:** uso **pessoal e solo** (Dr. Nicolas). Não é produto multi-usuário nem deploy hospitalar.
- **Ferramentas de IA:** Claude Code (refactor), Claude.ai (plantão), MCP local (`mcp-server/`).

### Direção estética do frontend (doutrina de design)

Estado ATUAL implementado (mergeado): **2 temas co-iguais** — **Tactical** (escuro/vermelho, default, `:root`) ⇄ **Clinical** (claro/azul, `[data-theme="clinical"]`), tipografia **IBM Plex Sans/Mono**, tokens `--app-*` + classes semânticas `.tx-*` / `.stat-*` / `.gravidade-*` (jamais hex hardcoded em componente). Cada cor é um sinal, não decoração.

Direção ASPIRACIONAL para telas novas — **“Monitor de UTI Tático / HUD”** (assimilada 19-Jun-2026, ainda não codada). Equipamento clínico de comando, não página web genérica. Aplicar como evolução do tema Tactical, sempre via CSS vars:

- **Paleta** (significado FIXO entre telas): âmbar `#F5A623` = produção/ação/alerta · teal `#2DD4BF` = ok/confirmado · vermelho `#F0506E` = pendência/risco · violeta `#8B80F9` = noturno/secundário. Base OLED `#080B12`; painel `#141E2D→#0E1622`; hairline `rgba(255,255,255,.08)` (nunca cinza chapado); texto `#EAF0F7` / apagado `#8694A8`.
- **Tipografia**: Chakra Petch (display/labels/HUD, UPPERCASE, tracking largo) · **JetBrains Mono `tabular-nums` em TODO número/dado** · Inter (corpo). Proibido número em fonte de corpo; qualquer serif.
- **Assinatura** (gastar a ousadia em UM lugar/tela): leitura grande mono com glow pelo estado (teal positivo / vermelho negativo), faixa de ECG sobre grid milimetrado, colchetes de canto (reticle HUD). Resto quieto e disciplinado.
- **Regras duras**: cantos 10–16px; estados sempre desenhados (hover, foco visível, vazio = convite, erro = causa + saída); `prefers-reduced-motion` respeitado; mobile-first ≥360px, alvos ≥44px; ZERO “AI slop” (proibido Inter+gradiente roxo+card genérico). Copy pt-BR tática; botão = comando (“Adicionar plantão”, não “Submit”), nome estável do início ao fim do fluxo.
- Fonte: `Downloads/Melhorias_Desing_Claude/CLAUDE-tema-monitor-uti.md`.

-----

## 4. Schema do banco (estado VIVO — 26-Jun-2026)

Fonte fiel: **migration baseline** `20260626000000_baseline.sql` (substitui `schema-live-dump.sql`; migrations `01–07` arquivadas em `migrations/_archive/`). 10 tabelas clínicas + 2 de config de alerta (`alert_rules`, `trend_rules`). RAG (`protocolos`/`protocolo_chunks`, migration `06`) **congelado, não aplicado**. RLS habilitado (`dev_bypass`, débito aceito solo).

|Tabela            |Função                                                             |Linhas (23-jun-2026)|
|------------------|-------------------------------------------------------------------|--------------------:|
|`pacientes`       |Cadastro + status do leito + severidade visual + `riscos_flags`    |16                   |
|`evolucoes`       |Snapshot por sistema (JSONB) + SOFA + conduta                      |16                   |
|`eventos_clinicos`|**Timeseries** — núcleo de tendências/alertas                      |130                  |
|`atbs`            |Antibiotic stewardship (D-ATB + `duracao_planejada_dias`)          |12                   |
|`culturas`        |Microbiologia                                                      |3                    |
|`antibiograma`    |S/I/R por cultura                                                  |2                    |
|`pendencias`      |Tarefas por paciente                                               |7                    |
|`alerts_log`      |Alertas (produtor VIVO: trigger + dedupe SHA-256)                  |0 (dispara no ingest)|
|`ingest_audit_log`|Auditoria de ingest                                                |0                    |
|`alert_rules`     |Config alertas por valor (25 regras; `fonte`=DOI Vera)             |25                   |
|`trend_rules`     |Config alertas de tendência/Δ (AKI creatinina, GCS)                |3                    |

**Views (7):** `vw_dashboard_uti`, `vw_sofa_trend_72h`, `vw_bh_acumulado`, `vw_dias_atb_ativo`, `vw_alertas_abertos`, `vw_eventos_pendentes_revisao`, `vw_eventos_tendencia`.
**Funções:** `fn_updated_at`, `fn_invalidate_sofa_cache`, `sync_severidade_visual`, `fn_alert_hash`, `fn_eval_alert` (produtor de alerta), `fn_eval_trend` (tendência/Δ), `fn_autoflag_lowconf`, `save_ficha` (RPC escrita atômica ficha). `match_protocolos` só na migration 06 (não aplicada).
**Edge Functions (sasi):** `ocr-ingest` e `ingest-patient` — **legado**, não usar no fluxo diário.
**Extensões:** `pgcrypto`, `pg_trgm`, `vector` (pgvector 0.8).

> ⚠️ **`eventos_clinicos` (130) com débito de qualidade:** ingest manual via Claude; ~27 na fila `vw_eventos_pendentes_revisao`. O trigger `trg_autoflag_lowconf` força `requires_review` em `confidence<0.7`.
>
> ⛔ **SOFA bloqueado por DADO:** 0/16 evoluções têm os 6 componentes (bilirrubina e PaO2/FiO2 **nunca** capturadas). Calcular SOFA hoje = null pra todos. Fix é a montante (skill capturar os componentes).

> 📌 **Onde vivem Interconsultas / Programação / Pendências (View 2):** `interconsultas[]` e `programacao[]` no JSONB **`pacientes.patient_summary`**. **Pendências** na tabela **`pendencias`**.

-----

## 5. Auth e acesso (uso pessoal — decisão fechada)

**Operador único:** Dr. Nicolas. Ferramenta pessoal de plantão, **não** app hospitalar multi-usuário.

**Configuração atual (intencional):**
- Frontend entra direto no Dashboard (`MOCK_SESSION`, sem login).
- Policies `dev_bypass` ativas — simplifica acesso solo com anon key.
- **Sem plano de OAuth, magic link, MFA ou multi-tenant.** `Login.tsx` existe mas não é usado.

Reativar auth só se o escopo mudar (outros usuários). Hoje: **não é backlog.**

-----

## 6. Status das fases

- **FASE ALPHA** — 🔄 Parcial. Frontend modular em `frontend/src/lib/`; testes Vitest em `packages/clinical-engine` (parseBR, SOFA display); extração completa do motor pendente.
- **FASE BRAVO** — ✅ Entregue e deployada. Schema Supabase, `smoke.sql`, `useClinicalAlerts.ts`, views vivas.
- **FASE CHARLIE** — 🔄 Em andamento. Timeseries (`eventos_clinicos` 93 linhas, ingest Claude→JSON) + stewardship (`atbs`/`culturas` vazios).
- **FASE DELTA** — ⬜ Backlog. Automação clínica no app.

### Backlog FASE DELTA (prioridades)

1. Cálculo automático de day-of-therapy (D-ATB).
1. Balanço hídrico cumulativo.
1. Handoff PDF em um clique.

### Frontend (Planos Alpha/Bravo)

War Room · toggle de visão compacta · SmartPaste · abas por UTI · chips de dispositivo · UI serial completa de labs · UI de prescrição por sistema · senior safety check.

### Outras frentes

- Integração Figma: auditoria UX com screenshots anotados, design tokens SASI → Tailwind, master components com variantes.
- ✅ (resolvido 26-jun) Alertas: hook estava OK, faltava **produtor** — criados `fn_eval_alert` (valor) + `fn_eval_trend` (tendência/Δ), config em `alert_rules`/`trend_rules` (mesa do médico em `~/vaults/celebro/conhecimento/projetos/sasi-decisoes-clinicas.md`, movida do repo em 10-jul-2026).

-----

## 7. Doutrina clínica (skills + templates)

Fonte da verdade: **`_SASI_TEMPLATE_BASE_v2.md`** (Ramo C) — anatomia idêntica nas duas skills; alterou em uma, replica na outra no mesmo commit (divergência = bug clínico-legal).

**Skills** (fonte única: `~/dev/claude/skills/` · symlink `~/.claude/skills` · commit `582f117`):

- `sasi-ingest-export` — extrai dados de fotos/PDFs/laudos → payload JSON validado; gera “Exportar Evolução” e “Exportar Turno”.
- `admissao-uti` — nota de admissão (modo D1).
- `controles-vitais-janela` — folha de enfermagem → sumário 24h/12h + flags.

**References:** `01-schema-eventos-clinicos`, `02-extraction-dictionary`, `03-clinical-sanity-checks`, `04-export-evolucao-template_v2` (+ v1 legado), `05-export-passagem-turno`.

**Espelhos da doutrina:**

- **Notion** → espaço 🪖 SASI → página “📐 Doutrina SASI — SKILLs & Templates” (9 subpáginas, escrito direto via MCP).
- **Obsidian/Drive** → `SASI_OBSIDIAN_doutrina.zip` + Drive “SASI — Arquivo de Operação”.

### 7-A. Faxina estrutural (10-jul-2026)

Docs clínicas de `docs/` viraram conhecimento do cérebro do Claude — movidas pra
`~/vaults/celebro/conhecimento/projetos/` com prefixo `sasi-`: `sasi-decisoes-clinicas.md`,
`sasi-sofa-ruleset.md`, `sasi-vera-ingest-spec.md`, `sasi-backlog-clinico.md`,
`sasi-moc-doutrina.md`. `docs/STATUS.md` → `memory/notes/STATUS.md`. `docs/motor-clinico-v2/`
(staging) → `~/dev/_lab/sasi-motor-clinico-v2/`. `docs/legado/` → `~/vaults/celebro/_arquivo/sasi-legado/`.
`docs/JETBRAINS.md` + `docs/idea-runConfigurations/` deletados (duplicata das run configs vivas em
`~/dev/.idea/runConfigurations/`). `doctrine/references/06-api-automation-prompts.md` deletado
(idêntico ao canônico em `claude/skills/sasi-ingest-export/`). `doctrine/casos/VANESSA_v2_PROVA.md`
(PHI) → `~/vaults/celebro/90-PHI-LOCAL/casos-sasi/`. `design-system/` (staging, 75 arquivos nunca
consumidos pelo app) → `~/dev/_lab/sasi-design-system/`. `docs/AGENTS.md` e `docs/SETUP.md`
permanecem no repo — não se encaixam com evidência em conhecimento-clínico/staging/duplicata.
**Atenção:** o restante de `doctrine/` (as 2 SKILLs + 5 references) DIVERGE do espelho canônico em
`claude/skills/` (não é cópia idêntica) — mantido por precaução, não mesclado; ver relatório da
faxina para o detalhe da divergência.

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

## graphify

Este repo tem um grafo de conhecimento em `graphify-out/` (nós centrais, comunidades, relações entre arquivos). Instalado 03-jul-2026; regenerável (`graphify update .`), fora do git. Exclusões de ruído em `.graphifyignore`.

Regras:
- Pergunta sobre o código? Rode primeiro `graphify query "<pergunta>"` (existindo `graphify-out/graph.json`). Relações entre dois pontos: `graphify path "<A>" "<B>"`. Conceito focado: `graphify explain "<conceito>"`. Devolvem um subgrafo pequeno — muito mais barato que GRAPH_REPORT.md ou grep cru.
- Ler `graphify-out/GRAPH_REPORT.md` só pra revisão ampla de arquitetura ou quando query/path/explain não bastarem.
- Depois de modificar código, rode `graphify update .` pra manter o grafo atual (só AST, custo zero de API).
- Automático desde 03-jul-2026: existe um hook local `.git/hooks/post-commit` (não versionado — recriar se o repo for clonado do zero) que roda `graphify update .` em segundo plano após cada commit. O mesmo hook existe no vault celebro.
