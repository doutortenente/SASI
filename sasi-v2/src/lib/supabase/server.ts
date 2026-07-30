import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export async function getSupabaseServer() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => store.getAll(), setAll: (l) => l.forEach(({name,value,options}) => store.set(name,value,options)) },
  });
}
