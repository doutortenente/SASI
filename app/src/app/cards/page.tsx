import Link from "next/link";
import { Busca } from "@/components/Busca";
import { Avisos, Flags, Selo, Topo, Traco } from "@/components/ds";
import { hdItens } from "@/lib/termos";
import { carregarLeitos, filtra, maxMin, pilulas, suporteDe, type Leito } from "@/lib/uti";

export const dynamic = "force-dynamic";

function Cartao({ l }: { l: Leito }) {
  const p = l.p!;
  const { suporte, dva } = suporteDe(l);
  const linhaSuporte = [...suporte.filter((s) => s !== "sedação"), ...dva, ...suporte.filter((s) => s === "sedação")];
  const sinais = [["PAM", "pam"], ["FC", "fc"], ["SpO2", "spo2"]] as const;
  const flags = sinais.flatMap(([r, k]) => pilulas(l.janelas[k]).map((f) => `${r} ${f}`));
  return (
    <Link href={`/round?leito=${l.n}`} className={`ds-leito ds-g-${p.gravidade}`}>
      <header className="ds-leito__topo"><span className="ds-leito__n">{l.n}</span><Selo g={p.gravidade} /></header>
      <h3 className="ds-leito__nome">{p.nome}</h3>
      <p className="ds-leito__meta">
        <span>{[p.idade != null ? `${p.idade} anos` : "", l.dUti != null ? `D${l.dUti}` : ""].filter(Boolean).join(" · ")}</span>
        {l.pend.length ? <b>{l.pend.length} pend.</b> : null}
      </p>
      <p className="ds-leito__hd">{hdItens(p.hd).slice(0, 2).join("; ")}</p>
      <dl className="ds-leito__vitais">
        {sinais.map(([r, k]) => <div key={k}><dt>{r}</dt><dd>{maxMin(l.janelas[k]) ?? <Traco />}</dd></div>)}
        {flags.length ? <div className="ds-leito__flags"><Flags f={flags} /></div> : null}
      </dl>
      <dl className="ds-leito__linhas">
        <div><dt>Suporte</dt><dd>{linhaSuporte.length ? linhaSuporte.join(" · ") : <Traco />}</dd></div>
        <div><dt>ATB</dt><dd>{l.atbs.length ? l.atbs.map((a, i) => <span key={a.atb_id}>{i ? <br /> : null}{a.droga} D{a.dias_terapia}</span>) : <Traco />}</dd></div>
      </dl>
      <footer className="ds-leito__pe"><Avisos p={p} /></footer>
    </Link>
  );
}

export default async function Cards({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const leitos = await carregarLeitos();
  return (
    <>
      <Topo titulo="Cards" leitos={leitos}><Busca /></Topo>
      <main className="ds-conteudo">
        <div className="ds-grade">
          {filtra(leitos, q).map((l) => l.p ? <Cartao key={l.n} l={l} /> : (
            <article key={l.n} className="ds-leito ds-leito--vago"><div><span className="ds-leito__n">{l.n}</span><p>Leito vago</p></div></article>
          ))}
        </div>
      </main>
    </>
  );
}
