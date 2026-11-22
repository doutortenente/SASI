import Link from "next/link";
import { Icone } from "@/components/Icone";
import { AtbCulturas, FichaPaciente, LinhaDoTempo, ListaCondutas, ListaPendencias, Mini, Painel, Topo, Traco, metaCurta } from "@/components/ds";
import { leitoPedido } from "@/components/Leito";
import { GRAVIDADE, ddmm, nf, num, plantaoAtual, sinal, txt } from "@/lib/termos";
import { carregarDetalhe, maxMin, nivelDe, pilulas, serieDe, type Detalhe, type Janela } from "@/lib/uti";

export const dynamic = "force-dynamic";

const SINAIS = [["pam", "PAM", "mmHg", "cardio"], ["fc", "FC", "bpm", "cardio"], ["spo2", "SpO2", "%", "resp"], ["temp", "Temperatura", "°C", "infecto"], ["fr", "FR", "ipm", "resp"], ["dx", "Glicemia", "mg/dL", "tgi"]] as const;
const EXAMES = [["lactato", "Lactato", "mmol/L", "cardio"], ["cr", "Creatinina", "mg/dL", "renal"], ["pf_ratio", "P/F", "", "resp"], ["k", "Potássio", "mEq/L", "renal"]] as const;

function janelasDe(d: Detalhe, tipo: string): Janela[] {
  return d.janelas.filter((j) => j.tipo === tipo && j.valor_max != null && j.valor_min != null).slice(-6);
}

export default async function Round({ searchParams }: { searchParams: Promise<{ leito?: string }> }) {
  const { leito } = await searchParams;
  const { leitos, l } = await leitoPedido("/round", leito);
  const { hoje } = plantaoAtual();
  const d = l?.p ? await carregarDetalhe(l.p.id) : null;
  const evo = d?.evoPlantao ?? l?.evo ?? null;
  const diurese = num(evo?.renal?.diurese_ml), horas = num(evo?.renal?.diurese_h), peso = l?.p?.peso != null ? Number(l.p.peso) : null;
  const debito = diurese != null && horas && peso ? diurese / peso / horas : null;
  const bh = num(evo?.renal?.bh_24h_ml);
  const acum = d ? serieDe(d, "bh_acumulado").at(-1)?.v ?? null : null;
  return (
    <>
      <Topo titulo="Round" leitos={leitos} />
      <main className="ds-conteudo">
        <div className="ds-round">
          <nav className="ds-leitos" aria-label="Leitos">
            {leitos.map((x) => x.p ? (
              <Link key={x.n} href={`/round?leito=${x.n}`} className={`ds-g-${x.p.gravidade}`} aria-current={x.n === l?.n ? "true" : undefined}>
                <span className="ds-leitos__n">{x.n}</span>
                <span className="ds-leitos__nome">{x.p.nome}<small>{GRAVIDADE[x.p.gravidade]}{x.dUti != null ? ` · D${x.dUti}` : ""}</small></span>
              </Link>
            ) : (
              <a key={x.n} className="ds-vago"><span className="ds-leitos__n">{x.n}</span><span className="ds-leitos__nome">Vago</span></a>
            ))}
          </nav>
          {l?.p && d ? (
            <div className="ds-detalhe">
              <FichaPaciente l={l} meta={metaCurta(l)}>
                <Link className="ds-btn" href={`/exames?leito=${l.n}`}><Icone n="exames" />Exames</Link>
                <Link className="ds-btn ds-btn--primario" href={`/evolucao?leito=${l.n}`}><Icone n="evoluir" />Evoluir</Link>
              </FichaPaciente>
              <div className="ds-col3">
                <Painel titulo="Problemas ativos">
                  {evo?.impressao?.length ? <ol className="ds-itens">{evo.impressao.map((t, i) => <li key={i}><span className="ds-itens__n">{i + 1}</span><span className="ds-itens__t">{t}</span></li>)}</ol> : <Traco />}
                </Painel>
                <Painel titulo="Condutas por sistema"><ListaCondutas c={evo?.condutas_sistemas ?? []} /></Painel>
                <Painel titulo="Pendências"><ListaPendencias pend={d.pend} /></Painel>
              </div>
              <section className="ds-secao">
                <h3 className="ds-secao__titulo">Sinais vitais<small>máximo e mínimo de cada janela de 24 h</small></h3>
                <div className="ds-tendencias" style={{ "--colunas": 4 } as React.CSSProperties}>
                  {SINAIS.map(([k, nome, un, ic]) => {
                    const js = janelasDe(d, k);
                    return <Mini key={k} ic={ic} titulo={nome} un={un} valor={maxMin(l.janelas[k])} flags={pilulas(l.janelas[k])}
                      barras={js.map((j) => ({ r: ddmm(j.janela_fim), a: Number(j.valor_max), b: Number(j.valor_min) }))} />;
                  })}
                  <Mini ic="renal" titulo="Diurese" un="mL/kg/h" valor={debito != null ? nf(debito, 2) : null} nota={diurese != null ? `${nf(diurese)} mL${horas ? ` em ${nf(horas)} h` : ""}` : undefined} />
                  <Mini ic="renal" titulo="Balanço" un="mL" valor={bh != null ? sinal(bh) : null} nota={acum != null ? `acumulado ${sinal(acum)}` : undefined} />
                </div>
              </section>
              <section className="ds-secao">
                <h3 className="ds-secao__titulo">Exames<small>últimas coletas</small></h3>
                <div className="ds-tendencias" style={{ "--colunas": 4 } as React.CSSProperties}>
                  {EXAMES.map(([k, nome, un, ic]) => {
                    const s = serieDe(d, k);
                    const ult = s.at(-1);
                    return <Mini key={k} ic={ic} titulo={nome} un={un} valor={ult ? nf(ult.v) : null} nivel={ult ? nivelDe(d.regras, k, ult.v) : null}
                      nota={s.length > 1 ? `em ${ddmm(s[0].iso)}: ${nf(s[0].v)}` : undefined} barras={s.map((x) => ({ r: ddmm(x.iso), a: x.v, b: x.v }))} />;
                  })}
                </div>
              </section>
              <div className="ds-col2">
                <Painel titulo="Dispositivos" nota="do dia da inserção até hoje"><LinhaDoTempo disp={d.disp} hoje={hoje} /></Painel>
                <Painel titulo="ATB e culturas"><AtbCulturas atbs={d.atbs} culturas={d.culturas} hoje={hoje} /></Painel>
              </div>
              <Painel titulo="Prescrição vigente" nota="sem horário de administração">
                {(() => {
                  const inf = [...(evo?.dvas ?? []), ...(evo?.sedativos ?? [])].filter((x) => x?.droga);
                  if (!inf.length) return <Traco />;
                  return (
                    <div className="ds-presc" style={{ "--colunas": 2 } as React.CSSProperties}>
                      <div className="ds-presc__bloco">
                        <div className="ds-presc__titulo">Infusões em uso</div>
                        {inf.map((x, i) => (
                          <div key={i} className="ds-presc__item">
                            <div className="ds-presc__droga">{x.droga}{x.diluicao ? <small>{x.diluicao}</small> : null}</div>
                            <div className="ds-presc__dose">{x.dose != null ? `${nf(x.dose)} ${x.unidade ?? ""}` : ""}{txt(x.vazao_ml_h) ? <small>{txt(x.vazao_ml_h)} mL/h</small> : null}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </Painel>
            </div>
          ) : <p className="ds-tenue">Nenhum leito ocupado.</p>}
        </div>
      </main>
    </>
  );
}
