'use client';
import { createBrowserClient } from "@supabase/ssr";

// A integracao Vercel<->Supabase injeta o nome NOVO (PUBLISHABLE_KEY);
// o .env local historico usa o nome ANTIGO (ANON_KEY). E a MESMA chave
// publica — aceitamos os dois pra funcionar nos dois ambientes.
export const getSupabaseBrowser = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
  );
