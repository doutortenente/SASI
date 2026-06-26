-- 06_protocolos_rag.sql
-- RAG de protocolos institucionais (pgvector 384d — gte-small no Edge)
-- Projeto: idswehsvvqczzkiatuzu · 24-jun-2026
-- Aplicar via Supabase SQL Editor ou `supabase db push` (não roda sozinho no deploy).

create extension if not exists vector;

-- ── Tabelas ──────────────────────────────────────────────────────────────────

create table if not exists public.protocolos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  fonte_arquivo text not null,
  fonte_pagina int,
  fonte_secao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.protocolo_chunks (
  id uuid primary key default gen_random_uuid(),
  protocolo_id uuid not null references public.protocolos (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  chunk_index int not null,
  conteudo text not null,
  embedding vector (384),
  fonte_anchor text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_protocolo_chunks_protocolo
  on public.protocolo_chunks (protocolo_id);

create index if not exists idx_protocolo_chunks_embedding
  on public.protocolo_chunks
  using hnsw (embedding vector_cosine_ops);

-- ── RLS ──────────────────────────────────────────────────────────────────────

alter table public.protocolos enable row level security;
alter table public.protocolo_chunks enable row level security;

create policy protocolos_select_own on public.protocolos
  for select using (auth.uid () = user_id);

create policy protocolos_insert_own on public.protocolos
  for insert with check (auth.uid () = user_id);

create policy protocolos_update_own on public.protocolos
  for update using (auth.uid () = user_id);

create policy protocolos_delete_own on public.protocolos
  for delete using (auth.uid () = user_id);

create policy protocolo_chunks_select_own on public.protocolo_chunks
  for select using (auth.uid () = user_id);

create policy protocolo_chunks_insert_own on public.protocolo_chunks
  for insert with check (auth.uid () = user_id);

create policy protocolo_chunks_update_own on public.protocolo_chunks
  for update using (auth.uid () = user_id);

create policy protocolo_chunks_delete_own on public.protocolo_chunks
  for delete using (auth.uid () = user_id);

-- dev_bypass (modo hospital sem auth — ver 03_dev_bypass_rls.sql)
create policy dev_bypass on public.protocolos
  for all using (true) with check (true);

create policy dev_bypass on public.protocolo_chunks
  for all using (true) with check (true);

-- ── RPC match ────────────────────────────────────────────────────────────────

create or replace function public.match_protocolos (
  query_embedding vector (384),
  match_threshold float default 0.75,
  match_count int default 5
)
returns table (
  id uuid,
  protocolo_id uuid,
  conteudo text,
  fonte_anchor text,
  similarity float
)
language sql
stable
set search_path to 'public', 'extensions', 'pg_catalog'
as $$
  select
    pc.id,
    pc.protocolo_id,
    pc.conteudo,
    pc.fonte_anchor,
    1 - (pc.embedding <=> query_embedding) as similarity
  from public.protocolo_chunks pc
  where pc.embedding is not null
    and 1 - (pc.embedding <=> query_embedding) > match_threshold
  order by pc.embedding <=> query_embedding
  limit match_count;
$$;

comment on function public.match_protocolos is
  'RAG protocolos SASI — retorna trecho + âncora de fonte; sem match = array vazio (skill marca [SEM_FONTE]).';