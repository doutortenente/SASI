import Link from "next/link";
import { AcoesPassagem } from "@/components/Acoes";
import { ListaPendencias, Selo, Topo, Traco } from "@/components/ds";
import { GRAVIDADE, hdItens } from "@/lib/termos";
import { carregarLeitos } from "@/lib/uti";

export const dynamic = "force-dynamic";
const LARGURAS = [72, 290, 120, null, 330];

export default async function Passagem() {
  const leitos = await carregarLeitos();
  const texto = leitos.filter((l) => l.p).map((l) => {
    const muda = l.evo?.intercorrencias ?? [];
    return [
      `Leito ${l.n} · ${l.p!.nome} · ${GRAVIDADE[l.p!.gravidade]}${l.dUti != null ? ` · D${l.dUti}` : ""}`,
      hdItens(l.p!.hd).join("; "),
      muda.length ? "Muda-conduta:\n" + muda.map((m) => `- ${m}`).join("\n") : "",
      l.pend.length ? "Pendências / riscos:\n" + l.pend.map((x) => `- ${x.tarefa} (P${x.prioridade})`).join("\n") : "",
    ].filter(Boolean).join("\n");
  }).join("\n\n");
  return (
    <>
      <Topo titulo="Passagem" leitos={leitos}><AcoesPassagem texto={texto} /></Topo>
      <main className="ds-conteudo">
        <div className="ds-tabela-wrap">
          <table className="ds-tabela ds-tabela--leitos ds-tabela--passagem">
            <colgroup>{LARGURAS.map((w, i) => <col key={i} style={w ? { width: w } : undefined} />)}</colgroup>
            <thead><tr><th>Leito</th><th>Paciente</th><th>Gravidade</th><th>Muda-conduta</th><th>Pendências / Riscos</th></tr></thead>
            <tbody>
              {leitos.map((l) => {
                if (!l.p) return <tr key={l.n} className="ds-vago"><td>{l.n}</td><td colSpan={4}>Leito vago</td></tr>;
                const muda = l.evo?.intercorrencias ?? [];
                return (
                  <tr key={l.n} className={`ds-g-${l.p.gravidade}`}>
                    <td><Link href={`/evolucao?leito=${l.n}`}>{l.n}</Link></td>
                    <td><b>{l.p.nome}</b><small>{[l.p.idade != null ? `${l.p.idade} anos` : "", l.dUti != null ? `D${l.dUti}` : ""].filter(Boolean).join(" · ")}</small>
                      <small style={{ marginTop: 4, color: "var(--texto-2)" }}>{hdItens(l.p.hd).slice(0, 2).join("; ")}</small></td>
                    <td><Selo g={l.p.gravidade} /></td>
                    <td>{muda.length ? <ul className="ds-itens">{muda.map((m, i) => <li key={i}><span className="ds-itens__t">{m}</span></li>)}</ul> : <Traco />}</td>
                    <td><ListaPendencias pend={l.pend} /></td>
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
