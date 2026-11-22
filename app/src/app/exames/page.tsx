import Link from "next/link";
import { Busca } from "@/components/Busca";
import { Icone } from "@/components/Icone";
import { AtbCulturas, Faixa, FichaPaciente, Mini, Painel, Topo, metaCurta } from "@/components/ds";
import { leitoPedido } from "@/components/Leito";
import { ddmm, nf, plantaoAtual } from "@/lib/termos";
import { carregarDetalhe, montarFolhao, nivelDe, serieDe } from "@/lib/uti";
import { Folhao } from "./Folhao";

export const dynamic = "force-dynamic";
const TENDENCIAS = [["lactato", "Lactato", "mmol/L", "cardio"], ["cr", "Creatinina", "mg/dL", "renal"], ["pf_ratio", "P/F", "", "resp"], ["k", "Potássio", "mEq/L", "renal"]] as const;

export default async function Exames({ searchParams }: { searchParams: Promise<{ leito?: string }> }) {
  const { leito } = await searchParams;
  const { leitos, l } = await leitoPedido("/exames", leito);
  const { hoje } = plantaoAtual();
  const d = l?.p ? await carregarDetalhe(l.p.id) : null;
  return (
    <>
      <Topo titulo="Exames"><Busca /></Topo>
      <main className="ds-conteudo">
        <Faixa leitos={leitos} atual={l?.n ?? ""} base="/exames" />
        {l?.p && d ? (
          <>
            <FichaPaciente l={l} meta={metaCurta(l)}>
              <Link className="ds-btn ds-btn--primario" href={`/evolucao?leito=${l.n}`}><Icone n="evoluir" />Evoluir</Link>
            </FichaPaciente>
            <div className="ds-exames">
              <Folhao pacienteId={l.p.id} f={montarFolhao(d, hoje)} />
              <div className="ds-detalhe">
                <section className="ds-secao">
                  <h3 className="ds-secao__titulo">Tendência</h3>
                  <div className="ds-tendencias" style={{ "--colunas": 2 } as React.CSSProperties}>
                    {TENDENCIAS.map(([k, nome, un, ic]) => {
                      const s = serieDe(d, k);
                      const ult = s.at(-1);
                      return <Mini key={k} ic={ic} titulo={nome} un={un} valor={ult ? nf(ult.v) : null} nivel={ult ? nivelDe(d.regras, k, ult.v) : null}
                        nota={s.length > 1 ? `em ${ddmm(s[0].iso)}: ${nf(s[0].v)}` : undefined} barras={s.map((x) => ({ r: ddmm(x.iso), a: x.v, b: x.v }))} />;
                    })}
                  </div>
                </section>
                <Painel titulo="ATB e culturas"><AtbCulturas atbs={d.atbs} culturas={d.culturas} hoje={hoje} /></Painel>
              </div>
            </div>
          </>
        ) : <p className="ds-tenue">Nenhum leito ocupado.</p>}
      </main>
    </>
  );
}
