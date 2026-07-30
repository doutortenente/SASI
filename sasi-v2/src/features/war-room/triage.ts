import type { VwDashboardUti } from "@/types/clinical";
// Nivel de gravidade (escala do design system): estavel<watcher<instavel<critico<obito.
// Base = gravidade declarada; escala por FISIOLOGIA (ΔSOFA, fora-de-faixa) — nao so pelo rotulo (CLAUDE.md §8).
export type Gravity = "stable" | "watcher" | "unstable" | "critical" | "deceased";
const ORD: Gravity[] = ["stable","watcher","unstable","critical","deceased"];
const pior = (a: Gravity, b: Gravity): Gravity => (ORD.indexOf(a) >= ORD.indexOf(b) ? a : b);
type L = Pick<VwDashboardUti,"gravidade"|"severidade_visual"|"delta_sofa_24h"|"out_of_range_count"|"pendencias_abertas">;
export function gravityDe(r: L): Gravity {
  if (r.gravidade === "obito") return "deceased";
  let g: Gravity = r.gravidade === "critico" ? "critical" : r.gravidade === "grave" ? "unstable"
                 : r.gravidade === "moderado" ? "watcher" : "stable";
  if ((r.delta_sofa_24h ?? 0) >= 2 || (r.out_of_range_count ?? 0) >= 3) g = pior(g, "unstable");
  if (r.severidade_visual === "red") g = pior(g, "critical");
  return g;
}
export function triagem<T extends L>(rows: T[]): Array<T & { gravity: Gravity }> {
  return rows.map((r) => ({ ...r, gravity: gravityDe(r) }))
             .sort((a, b) => ORD.indexOf(b.gravity) - ORD.indexOf(a.gravity)); // pior primeiro
}
