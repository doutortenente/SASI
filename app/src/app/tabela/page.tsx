import Link from "next/link";
import { Busca } from "@/components/Busca";
import { Selo, Topo, Traco } from "@/components/ds";
import { hdItens } from "@/lib/termos";
import { carregarLeitos, dispositivosCurtos, filtra, suporteDe } from "@/lib/uti";

export const dynamic = "force-dynamic";
const LARGURAS = [64, 200, 116, null, 124, 110, 152, 176, 64];
const linhas = (t: string[]) => (t.length ? t.map((x, i) => <span key={i}>{i ? <br /> : null}{x}</span>) : <Traco />);

export default async function Tabela({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const leitos = await carregarLeitos();
  return (
    <>
      <Topo titulo="Tabela" leitos={leitos}><Busca /></Topo>
      <main className="ds-conteudo">
        <div className="ds-tabela-wrap">
          <table className="ds-tabela ds-tabela--leitos">
            <colgroup>{LARGURAS.map((w, i) => <col key={i} style={w ? { width: w } : undefined} />)}</colgroup>
            <thead><tr><th>Leito</th><th>Paciente</th><th>Gravidade</th><th>HD</th><th>Suporte</th><th>DVA</th><th>ATB</th><th>Dispositivos</th><th className="ds-centro">Pend.</th></tr></thead>
            <tbody>
              {filtra(leitos, q).map((l) => {
                if (!l.p) return <tr key={l.n} className="ds-vago"><td>{l.n}</td><td colSpan={8}>Leito vago</td></tr>;
                const { suporte, dva } = suporteDe(l);
                const disp = dispositivosCurtos(l);
                return (
                  <tr key={l.n} className={`ds-g-${l.p.gravidade}`}>
                    <td><Link href={`/round?leito=${l.n}`}>{l.n}</Link></td>
                    <td><b>{l.p.nome}</b><small>{[l.p.idade != null ? `${l.p.idade} anos` : "", l.dUti != null ? `D${l.dUti}` : ""].filter(Boolean).join(" · ")}</small></td>
                    <td><Selo g={l.p.gravidade} /></td>
                    <td>{hdItens(l.p.hd).slice(0, 2).join("; ")}</td>
                    <td>{suporte.length ? suporte.join(" · ") : <Traco />}</td>
                    <td>{linhas(dva)}</td>
                    <td>{linhas(l.atbs.map((a) => `${a.droga} D${a.dias_terapia}`))}</td>
                    <td>{disp.length ? disp.join(" · ") : <Traco />}</td>
                    <td className="ds-centro">{l.pend.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
