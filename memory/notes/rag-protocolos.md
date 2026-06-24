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

**Plano travado (aguardava APROVAR):**
1. Migration: `protocolos` + `protocolo_chunks` (embedding vector(384), índice HNSW, RLS ON, 4 policies).
2. Embedding: `gte-small` nativo do Edge (384d, custo zero, sem nova assinatura). NÃO puxa OpenAI/Gemini.
3. RPC `match_protocolos(query_embedding, threshold, k)` → trecho + fonte; sem match → `null` + `[SEM_FONTE]`.
4. Edge `protocolo-ingest`: PDF → camada de texto (OCR só fallback) → chunk por seção (~350 tok, overlap 50) → embed → insert com audit.
5. Plugar a consulta na seção Conduta das skills.

**Fonte dos protocolos (decidido pelo operador):** PDFs / documentos.
