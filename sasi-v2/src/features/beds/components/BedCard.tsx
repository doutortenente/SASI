import type { Leito } from "../types";
import type { Gravity } from "@/features/war-room/triage";
import { num } from "@/lib/formatters/br";
const corSofa = (s: number | null) => s == null ? "var(--text-muted)"
  : s >= 12 ? "var(--sofa-critical)" : s >= 8 ? "var(--sofa-high)" : s >= 4 ? "var(--sofa-medium)" : "var(--sofa-low)";
export function BedCard({ leito }: { leito: Leito & { gravity: Gravity } }) {
  const g = leito.gravity;
  return (
    <button type="button" className="sasi-fade-in" style={{
      textAlign:"left", width:"100%", cursor:"pointer",
      background:`color-mix(in srgb, var(--grav-${g}-solid) 5%, var(--surface-card))`,
      border:"1px solid var(--border-default)", borderLeft:`6px solid var(--grav-${g}-solid)`,
      borderRadius:"var(--radius-xl, 16px)", padding:14, display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
        <span className="tabnum" style={{ color:"var(--text-faint)", fontSize:11 }}>{leito.uti} · {leito.leito}</span>
        <span className="tabnum" style={{ color:corSofa(leito.sofa_total), fontWeight:700 }}>SOFA {num(leito.sofa_total,0)}</span>
      </div>
      <div style={{ fontWeight:700, color:"var(--text-heading)" }}>{leito.nome}</div>
      <div style={{ color:"var(--text-muted)", fontSize:13 }}>{leito.hd}</div>
      <div className="tabnum" style={{ fontSize:12, color:"var(--text-muted)" }}>
        ΔSOFA {num(leito.delta_sofa_24h,0)} · pendências {leito.pendencias_abertas}
      </div>
    </button>
  );
}
