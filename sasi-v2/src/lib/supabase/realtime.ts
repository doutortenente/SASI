'use client';
import { getSupabaseBrowser } from "./client";
// Assina mudancas de uma tabela (ex.: pacientes/pendencias) e chama onChange. Base do War Room ao vivo.
export function subscribeTable(table: string, onChange: () => void) {
  const sb = getSupabaseBrowser();
  const ch = sb.channel(`rt:${table}`).on("postgres_changes", { event: "*", schema: "public", table }, onChange).subscribe();
  return () => { sb.removeChannel(ch); };
}
