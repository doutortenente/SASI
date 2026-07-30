import { getSupabaseServer } from "@/lib/supabase/server";
import type { VwDashboardUti } from "@/types/clinical";
// Fonte do War Room: a view vw_dashboard_uti (ja pronta no banco).
export async function listarLeitosAtivos(): Promise<VwDashboardUti[]> {
  const sb = await getSupabaseServer();
  const { data, error } = await sb.from("vw_dashboard_uti").select("*").order("uti").order("leito");
  if (error) throw new Error(error.message);
  return (data ?? []) as VwDashboardUti[];
}
