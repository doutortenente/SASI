import {type CookieMethodsServer, createServerClient} from "@supabase/ssr";
import {cookies} from "next/headers";

/**
 * Cliente Supabase para Server Components — a chave fica no servidor, nao vaza no navegador.
 * Em Server Component o cookie e somente-leitura: o set() e ignorado no try/catch
 * (padrao oficial @supabase/ssr; quem renova a sessao e o middleware/route handler).
 */
export async function getSupabaseServer() {
  const store = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll: () => store.getAll(),
    setAll: (cookiesToSet) => {
      try {
        cookiesToSet.forEach(({name, value, options}) => store.set(name, value, options));
      } catch {
        // Server Component nao escreve cookie — ok ignorar.
      }
    },
  };

  // Integracao Vercel<->Supabase injeta PUBLISHABLE_KEY (nome novo);
  // .env local historico usa ANON_KEY (nome antigo). Mesma chave publica.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {cookies: cookieMethods},
  );
}
