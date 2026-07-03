import { withSupabase } from "@supabase/server";

// Endpoint de saúde do SASI: prova que a Edge Function sobe, valida a chave
// publicável e alcança o banco (leitura em tabela de configuração, sem PHI).
export default {
  fetch: withSupabase({ auth: "publishable" }, async (_req, ctx) => {
    const { count, error } = await ctx.supabase
      .from("alert_rules")
      .select("*", { count: "exact", head: true });

    if (error) {
      return Response.json(
        { ok: false, db: "erro", detail: error.message },
        { status: 500 },
      );
    }

    return Response.json({
      ok: true,
      authMode: ctx.authMode,
      db: "ok",
      alert_rules: count,
      ts: new Date().toISOString(),
    });
  }),
};
