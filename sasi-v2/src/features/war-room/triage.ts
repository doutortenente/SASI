import type { VwDashboardUti } from "@/types/clinical";
// Nivel de gravidade (escala do design system): estavel<watcher<instavel<critico<obito.
// Base = gravidade declarada; escala por FISIOLOGIA (ΔSOFA, fora-de-faixa) — nao so pelo rotulo (CLAUDE.md §8).
export type Gravity = "stable" | "watcher" | "unstable" | "critical" | "deceased";
// Escala CLINICA (para escalar gravidade): estavel < vigilancia < instavel < critico < obito.
const ORD: Gravity[] = ["stable","watcher","unstable","critical","deceased"];
// Ordem de LEITURA do painel (pior-que-ainda-se-trata primeiro): obito vai pro FIM.
// Um falecido nao disputa prioridade com um choque septico — ranquear obito acima
// de critico invertia a triagem exatamente na hora que ela importa.
const PESO_PAINEL: Record<Gravity, number> = { critical: 4, unstable: 3, watcher: 2, stable: 1, deceased: 0 };
const pior = (a: Gravity, b: Gravity): Gravity => (ORD.indexOf(a) >= ORD.indexOf(b) ? a : b);
type L = Pick<VwDashboardUti,"gravidade"|"severidade_visual"|"delta_sofa_24h"|"out_of_range_count"|"pendencias_abertas">;

// VOCABULARIO VIVO do banco (gravidade_enum, conferido em producao em 14-nov-2026):
//   estavel < watcher < instavel < critico   (illness severity do I-PASS)
// O vocabulario antigo (moderado, grave, obito) segue aceito: ha linha historica e
// codigo legado que ainda o usam. Antes desta correcao "instavel" e "watcher" nao
// eram reconhecidos: watcher caia em ESTAVEL e instavel virava CRITICO.
const DECLARADA: Readonly<Record<string, Gravity>> = {
  critico: "critical",
  instavel: "unstable",
  grave: "unstable",
  watcher: "watcher",
  moderado: "watcher",
  estavel: "stable",
  obito: "deceased",
};

/** Gravidade DECLARADA (coluna pacientes.gravidade) na escala do app. Fora do vocabulario => estavel. */
export function gravityDeclarada(gravidade: string | null | undefined): Gravity {
  const g = DECLARADA[String(gravidade ?? "").toLowerCase()];
  return g ?? "stable";
}

export function gravityDe(r: L): Gravity {
  let g: Gravity = gravityDeclarada(r.gravidade);
  if (g === "deceased") return g;
  if ((r.delta_sofa_24h ?? 0) >= 2 || (r.out_of_range_count ?? 0) >= 3) g = pior(g, "unstable");
  // severidade_visual e o SEMAFORO que o banco deriva da gravidade (sync_severidade_visual):
  // red = critico OU instavel · yellow = watcher. O vermelho, sozinho, nao separa
  // instavel de critico — entao ele garante "instavel ou pior", nunca promove a critico.
  if (r.severidade_visual === "red") g = pior(g, "unstable");
  if (r.severidade_visual === "yellow") g = pior(g, "watcher");
  return g;
}
export function triagem<T extends L>(rows: T[]): Array<T & { gravity: Gravity }> {
  return rows.map((r) => ({ ...r, gravity: gravityDe(r) }))
             .sort((a, b) => PESO_PAINEL[b.gravity] - PESO_PAINEL[a.gravity]); // pior tratavel primeiro; obito por ultimo
}
