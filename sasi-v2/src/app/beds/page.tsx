// War Room — painel geral (Server Component lendo vw_dashboard_uti).
import { listarLeitosAtivos } from "@/features/beds/services/bedService";
import { BedCard } from "@/features/beds/components/BedCard";
import { triagem } from "@/features/war-room/triage";
export const dynamic = "force-dynamic";
export default async function BedsPage() {
  const leitos = triagem(await listarLeitosAtivos());
  return (
    <main style={{ padding: 24 }}>
      <h1 className="tabnum" style={{ fontFamily:"IBM Plex Mono, monospace" }}>COMANDO UTI — {leitos.length} leitos ativos</h1>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12, marginTop:16 }}>
        {leitos.map((l)=>(<BedCard key={l.paciente_id} leito={l} />))}
      </div>
    </main>
  );
}
