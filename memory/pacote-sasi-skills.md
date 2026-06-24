---
name: pacote-sasi-skills
description: 3 skills clínicas do SASI versionadas em ~/dev/claude/skills (débito fechado 24-jun-2026); falta commit+push
metadata:
  type: project
---

Pacote `sasi-skills` (extraído do ambiente em 2026-06-21) — as 3 skills agora vivem em `~/dev/claude/skills/` (fonte única; `~/.claude/skills` é symlink).

| Skill | Função | No repo `claude` |
|---|---|---|
| `controles-vitais-janela` | folha de enfermagem → sumário por janela 24h/12h + flags | ✅ versionada (consolidada de 4 versões em 24-jun; references/ mapa-folha + exemplo-resolvido) |
| `admissao-uti` | nota de admissão UTI (template fixo) a partir de input livre | ✅ versionada 24-jun |
| `sasi-ingest-export` | extrai → payload `eventos_clinicos`/`evolucoes` + evolução + passagem de turno | ✅ versionada 24-jun (assets/ + 6 references preservados) |

**Por que importa:** essas skills são as bocas de saída de conduta do SASI. `admissao-uti` e `sasi-ingest-export` montam dose/meta/profilaxia do conhecimento do modelo → alvo natural do [[rag-protocolos]].

**Estado (24-jun-2026):** as 3 instaladas no working tree do repo `claude` (loader já reconhece). PENDENTE: commit+push do repo `claude` (aguarda OK). Versões antigas/redundantes → `~/dev/_quarentena/inbox-24jun-2026/`.

Fora do pacote por design: `intensivao-catp` (não é SASI) e skills do plugin Obsidian "Comando UTI".
