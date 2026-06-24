---
name: rag-protocolos
description: Trilho de RAG no Supabase p/ ancorar a conduta clínica do SASI em protocolo institucional com fonte rastreável
metadata:
  type: project
---

Objetivo: "colocar os protocolos pra jogo" = RAG que devolve trecho de protocolo **com âncora de fonte** (arquivo·página·seção), nunca texto gerado. Casa com ZERO ALUCINAÇÃO: o modelo cita, não inventa.

**Por que importa:** as skills [[pacote-sasi-skills]] (`admissao-uti`, `sasi-ingest-export`) geram a seção Conduta (dose/meta/profilaxia) do conhecimento do modelo — ponto mais exposto da doutrina. O RAG vira a fonte de verdade que ancora essa conduta.

**Estado verificado (2026-06-24, via Supabase MCP, projeto idswehsvvqczzkiatuzu):**
- `vector` (pgvector 0.8.0) JÁ instalado, schema public. Motor pronto.
- `pg_net` instalado; `pg_cron`/`http` disponíveis, não instalados.
- Tabela de protocolos NÃO existe. `memorias` existe mas vazia (0 linhas) — fica fora.

**Estado (24-jun-2026):**
1. ✅ Migration versionada: `supabase/migrations/06_protocolos_rag.sql` (`protocolos`, `protocolo_chunks`, HNSW, RLS, `match_protocolos`).
2. ⬜ **Aplicar** migration no Supabase (SQL Editor ou `supabase db push`).
3. ⬜ Edge `protocolo-ingest`: PDF → texto → chunk (~350 tok, overlap 50) → embed `gte-small` (384d).
4. ⬜ Plugar RPC na seção Conduta das skills (`admissao-uti`, `sasi-ingest-export`).

**Fonte dos protocolos (decidido pelo operador):** PDFs / documentos.
