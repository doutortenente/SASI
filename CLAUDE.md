# CLAUDE.md — SASI (Sistema de Auditoria e Síntese Intensiva)

> Briefing operacional do projeto. Lido pelo Claude Code ao abrir o repo.
> **Última atualização:** 24-Jun-2026 — contagens de dados via auditoria SQL 23-jun; schema via dump + migrations locais.
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

## 4. Schema do banco (estado VIVO — 24-Jun-2026)

Fonte fiel: `supabase/schema-live-dump.sql` + migrations `01–06`. 9 tabelas clínicas + RAG (`protocolos`, `protocolo_chunks` na migration `06`, **DDL versionado, aplicar manualmente**). RLS habilitado.

|Tabela            |Função                                                             |Linhas (23-jun-2026)|
|------------------|-------------------------------------------------------------------|--------------------:|
|`pacientes`       |Cadastro + status do leito + severidade visual                     |9                    |
|`evolucoes`       |Snapshot por sistema (JSONB) + SOFA + conduta                      |9                    |
|`eventos_clinicos`|**Timeseries** — coração do Meta-Vision (ΔSOFA, BH, tendências 72h)|93                   |
|`atbs`            |Antibiotic stewardship (D-ATB)                                     |0                    |
|`culturas`        |Microbiologia                                                      |0                    |
|`antibiograma`    |S/I/R por cultura                                                  |0                    |
|`pendencias`      |Tarefas por paciente                                               |0                    |
|`alerts_log`      |Alertas com dedupe SHA-256 (anti alarm-fatigue)                    |0                    |
|`ingest_audit_log`|Auditoria de ingest                                                |ver Supabase         |

**Views (5):** `vw_dashboard_uti`, `vw_sofa_trend_72h`, `vw_bh_acumulado`, `vw_dias_atb_ativo`, `vw_alertas_abertos`.
**Funções:** `fn_updated_at`, `fn_invalidate_sofa_cache`, `sync_severidade_visual`, `fn_alert_hash`, `match_protocolos` (RAG, migration 06).
**Edge Functions (sasi):** `ocr-ingest` e `ingest-patient` — **legado**, não usar no fluxo diário.
**Extensões:** `pgcrypto`, `pg_trgm`, `vector` (pgvector 0.8).

> ⚠️ **`eventos_clinicos` populada (93) com débito de qualidade:** ingest manual via Claude; 24/93 `requires_review`, 18/93 `confidence<0.7`; último ingest 21-jun-2026. Validar antes de confiar em tendências.

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
- Verificar wiring do hook de alertas clínicos ao entrypoint (`alerts_log` vazia sugere que pode não estar conectado).

-----

## 7. Doutrina clínica (skills + templates)

Fonte da verdade: **`_SASI_TEMPLATE_BASE_v2.md`** (Ramo C) — anatomia idêntica nas duas skills; alterou em uma, replica na outra no mesmo commit (divergência = bug clínico-legal).

**Skills** (fonte única: `~/dev/claude/skills/` · symlink `~/.claude/skills` · commit `582f117`):

- `sasi-ingest-export` — extrai dados de fotos/PDFs/laudos → payload JSON validado; gera “Exportar Evolução” e “Exportar Turno”.
- `admissao-uti` — nota de admissão (modo D1).
- `controles-vitais-janela` — folha de enfermagem → sumário 24h/12h + flags.

**References:** `01-schema-eventos-clinicos`, `02-extraction-dictionary`, `03-clinical-sanity-checks`, `04-export-evolucao-template_v2` (+ v1 legado), `05-export-passagem-turno`, `06-api-automation-prompts`.

**Espelhos da doutrina:**

- **Notion** → espaço 🪖 SASI → página “📐 Doutrina SASI — SKILLs & Templates” (9 subpáginas, escrito direto via MCP).
- **Obsidian/Drive** → `SASI_OBSIDIAN_doutrina.zip` + Drive “SASI — Arquivo de Operação”.

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