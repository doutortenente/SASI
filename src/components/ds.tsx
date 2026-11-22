// Peças do design system montadas com dado do banco. Marcação e classes iguais às das prévias do design.
import Link from "next/link";
import type { ReactNode } from "react";
import { Icone } from "./Icone";
import type { NomeIcone } from "./icones";
import { Check } from "./Check";
import {
  DISPOSITIVO, GRAVIDADE, GRAVIDADES, INTENCAO, ISOLAMENTO, MATERIAL, QUADROS, alergiaDe, ddmm, diasEntre, hdItens, nf, somaDias,
  type Conduta, type Pendencia,
} from "@/lib/termos";
import { contaGravidade, type Grafico, type Atb, type Cultura, type Dispositivo, type Leito, type Paciente } from "@/lib/uti";

const PLURAL = { critico: ["crítico", "críticos"], instavel: ["instável", "instáveis"], watcher: ["watcher", "watcher"], estavel: ["estável", "estáveis"] } as const;

export function Topo({ titulo, leitos, fixo, children }: { titulo: string; leitos?: Leito[]; fixo?: boolean; children?: ReactNode }) {
  return (
    <header className={"ds-topo" + (fixo ? " ds-topo--fixo" : "")}>
      <h1>{titulo}</h1>
      {leitos ? (
        <div className="ds-topo__resumo">
          {GRAVIDADES.map((g) => { const n = contaGravidade(leitos, g); return <span key={g} className={`ds-cont ds-g-${g}`}><b>{n}</b>{PLURAL[g][n === 1 ? 0 : 1]}</span>; })}
        </div>
      ) : null}
      <div className="ds-topo__acoes">{children}</div>
    </header>
  );
}

/** Faixa de leitos no alto do Round, de Exames e da Evolução: o número do leito com a cor da gravidade. */
export function Faixa({ leitos, atual, base }: { leitos: Leito[]; atual: string; base: string }) {
  return (
    <nav className="ds-faixa" aria-label="Leitos">
      {leitos.map((l) => (
        <Link key={l.n} href={`${base}?leito=${l.n}`} className={l.p ? `ds-g-${l.p.gravidade}` : "ds-vago"} aria-current={l.n === atual ? "true" : undefined}
          title={l.p ? `${l.p.nome} · ${GRAVIDADE[l.p.gravidade]}` : `Leito ${l.n} vago`}>{l.n}</Link>
      ))}
    </nav>
  );
}

export const Selo = ({ g, p }: { g: Paciente["gravidade"]; p?: boolean }) => <span className={`ds-selo${p ? " ds-selo--p" : ""} ds-g-${g}`}>{GRAVIDADE[g]}</span>;
export const Traco = () => <span className="ds-tenue">—</span>;
export const Flags = ({ f, antes }: { f: string[]; antes?: string }) => <>{f.map((t) => <span key={t} className="ds-flag">{antes ? `${antes} ${t}` : t}</span>)}</>;

export function Avisos({ p }: { p: Paciente }) {
  const al = alergiaDe(p.alergias);
  const iso = ISOLAMENTO[p.isolation];
  return (
    <>
      {al ? <span className="ds-aviso ds-aviso--alergia"><Icone n="alergia" />Alergia: {al}</span> : null}
      {iso ? <span className="ds-aviso"><Icone n="isolamento" />Isolamento: {iso}</span> : null}
    </>
  );
}

/** Cabeçalho do paciente. `meta` é a linha cinza (idade, peso, dia de UTI…). */
export function FichaPaciente({ l, meta, rotuloHd, children }: { l: Leito; meta: string; rotuloHd?: boolean; children?: ReactNode }) {
  const p = l.p!;
  return (
    <section className={`ds-ficha ds-g-${p.gravidade}`}>
      <div className="ds-ficha__leito">{l.n}<small>Leito</small></div>
      <div>
        <h2 className="ds-ficha__nome">{p.nome}<Selo g={p.gravidade} /><Avisos p={p} /></h2>
        <p className="ds-ficha__meta">{meta}</p>
        <p className="ds-ficha__hd">
          {rotuloHd ? <span className="ds-ficha__rot">HD</span> : null}
          {hdItens(p.hd).map((t, i) => <span key={i}><b>{i + 1}.</b>{t}</span>)}
        </p>
      </div>
      <div className="ds-ficha__lado">{children}</div>
    </section>
  );
}
export const metaCurta = (l: Leito): string =>
  [l.p?.idade != null ? `${l.p.idade} anos` : "", l.p?.peso != null ? `${nf(Number(l.p.peso))} kg` : "", l.dUti != null ? `D${l.dUti} de UTI` : ""].filter(Boolean).join(" · ");

export function Painel({ titulo, nota, acao, children }: { titulo: string; nota?: string; acao?: ReactNode; children: ReactNode }) {
  return (
    <section className="ds-painel">
      <div className="ds-painel__cab"><div><h3 className="ds-painel__titulo">{titulo}</h3>{nota ? <span className="ds-painel__nota">{nota}</span> : null}</div>{acao}</div>
      <div className="ds-painel__corpo">{children}</div>
    </section>
  );
}

export function ListaPendencias({ pend }: { pend: Pendencia[] }) {
  if (!pend.length) return <Traco />;
  return (
    <ul className="ds-itens">
      {pend.map((x) => (
        <li key={x.id}><Check id={x.id} feita={x.concluida} /><span className={"ds-itens__t" + (x.concluida ? " ds-feito" : "")}>{x.tarefa}</span><span className={`ds-prio ds-prio--${x.prioridade}`}>P{x.prioridade}</span></li>
      ))}
    </ul>
  );
}
export function ListaCondutas({ c }: { c: Conduta[] }) {
  if (!c.length) return <Traco />;
  const curto = (s: string) => QUADROS.find((q) => q.nome === s || q.k === s)?.curto ?? s;
  return <ul className="ds-itens">{c.map((x, i) => <li key={i}><span className="ds-itens__sis">{curto(x.sistema)}</span><span className="ds-itens__t">{x.texto}</span></li>)}</ul>;
}

/** Gráfico pequeno do design: faixas do mínimo ao máximo de cada janela (sinais) ou linha pelas últimas coletas (exames). */
function Desenho({ titulo, un, g }: { titulo: string; un?: string; g: Grafico }) {
  const u = un ? ` ${un}` : "";
  const id = "c" + titulo.replace(/\W/g, "");
  if (g.tipo === "faixas") {
    const pts = g.pontos.slice(-4);
    if (!pts.length) return null;
    const lo = Math.min(...pts.map((x) => Math.min(x.a, x.b))), hi = Math.max(...pts.map((x) => Math.max(x.a, x.b)));
    const y = (v: number) => (hi === lo ? 41 : 67.6 - ((v - lo) / (hi - lo)) * 53.2);
    const dentro = (v: number | null): v is number => v != null && v > lo && v < hi;
    return (
      <svg viewBox="0 0 240 92" role="img" aria-label={`${titulo} nas últimas janelas de 24 h`}>
        <line className="ds-g-base" x1={2} x2={210} y1={74} y2={74} />
        {pts.map((x, i) => {
          const slot = 4 - pts.length + i, x0 = 2 + 52 * slot, bx = x0 + 17;
          const mx = Math.max(x.a, x.b), mn = Math.min(x.a, x.b);
          const topo = y(mx), fundo = hi === lo ? topo + 3 : y(mn);
          return (
            <g key={x.r + i}>
              <clipPath id={`${id}${i}`}><rect x={bx} y={topo} width={18} height={Math.max(fundo - topo, 3)} rx={4} /></clipPath>
              <g clipPath={`url(#${id}${i})`}>
                <rect className="ds-g-barra" x={bx} y={topo} width={18} height={Math.max(fundo - topo, 3)} />
                {g.alto != null && mx > g.alto ? <rect className="ds-g-alerta" x={bx} y={topo - 4} width={18} height={Math.max(Math.min(y(g.alto), fundo) - topo + 4, 0)} /> : null}
                {g.baixo != null && mn < g.baixo ? <rect className="ds-g-alerta" x={bx} y={Math.max(y(g.baixo), topo)} width={18} height={Math.max(fundo + 4 - Math.max(y(g.baixo), topo), 0)} /> : null}
              </g>
              <text className={"ds-g-rot" + (i === pts.length - 1 ? " ds-g-rot--hoje" : "")} x={bx + 9} y={89} textAnchor="middle">{x.r}</text>
              <rect className="ds-g-alvo" x={x0} y={8} width={52} height={66}><title>{`${x.r}: ${nf(mx)}–${nf(mn)}${u}`}</title></rect>
            </g>
          );
        })}
        {[g.alto, g.baixo].filter(dentro).map((v) => (
          <g key={v}><line className="ds-g-limiar" x1={2} x2={213} y1={y(v)} y2={y(v)} /><text className="ds-g-rot ds-g-rot--lim" x={216} y={y(v) + 3.5}>{nf(v)}</text></g>
        ))}
      </svg>
    );
  }
  const pts = g.pontos;
  if (!pts.length) return null;
  const lo = Math.min(...pts.map((x) => x.v)), hi = Math.max(...pts.map((x) => x.v));
  const y = (v: number) => (hi === lo ? 42 : 67 - ((v - lo) / (hi - lo)) * 50);
  const px = (i: number) => (pts.length === 1 ? 110 : 16 + (188 * i) / (pts.length - 1));
  return (
    <svg viewBox="0 0 240 92" role="img" aria-label={`${titulo} nas últimas coletas`}>
      <line className="ds-g-base" x1={16} x2={204} y1={74} y2={74} />
      {g.limites.filter((v) => v > lo && v < hi).map((v) => (
        <g key={v}><line className="ds-g-limiar" x1={16} x2={207} y1={y(v)} y2={y(v)} /><text className="ds-g-rot ds-g-rot--lim" x={210} y={y(v) + 3.5}>{nf(v)}</text></g>
      ))}
      {pts.length > 1 ? <polyline className="ds-g-linha" points={pts.map((x, i) => `${px(i).toFixed(1)},${y(x.v).toFixed(1)}`).join(" ")} /> : null}
      {pts.map((x, i) => (
        <g key={x.r + i}>
          <text className={"ds-g-rot" + (i === pts.length - 1 ? " ds-g-rot--hoje" : "")} x={px(i)} y={89} textAnchor="middle">{x.r}</text>
          <circle className={"ds-g-ponto " + (x.nivel === "c" ? "ds-g-critico" : x.nivel === "a" ? "ds-g-alerta" : "ds-g-barra")} cx={px(i)} cy={y(x.v)} r={i === pts.length - 1 ? 5 : 4.5}><title>{`${x.r}: ${nf(x.v)}${u}`}</title></circle>
        </g>
      ))}
    </svg>
  );
}

export function Mini({ ic, titulo, un, valor, flags, nota, grafico, nivel }: {
  ic: NomeIcone; titulo: string; un?: string; valor: string | null; flags?: string[]; nota?: string; grafico?: Grafico; nivel?: "a" | "c" | null;
}) {
  return (
    <div className="ds-mini">
      <div className="ds-mini__cab"><Icone n={ic} />{titulo}{un ? <small>{un}</small> : null}</div>
      <div className="ds-mini__ult"><b className={nivel === "c" ? "ds-vc" : nivel === "a" ? "ds-va" : undefined}>{valor ?? "—"}</b><Flags f={flags ?? []} />{nota ? <span>{nota}</span> : null}</div>
      {grafico ? <Desenho titulo={titulo} un={un} g={grafico} /> : null}
    </div>
  );
}

/** Antimicrobianos e culturas do paciente: a mesma lista no Round e em Exames. */
export function AtbCulturas({ atbs, culturas, hoje }: { atbs: Atb[]; culturas: Cultura[]; hoje: string }) {
  return (
    <>
      <table className="ds-tabela">
        <thead><tr><th>Antimicrobiano</th><th>Intenção</th><th className="ds-num">Dia</th></tr></thead>
        <tbody>
          {atbs.length === 0 ? <tr><td colSpan={3}><Traco /></td></tr> : null}
          {atbs.map((a) => {
            const esquema = [a.dose, a.via, a.frequencia].filter(Boolean).join(" ");
            const sub = [esquema, a.foco ? `foco ${a.foco.toLowerCase()}` : ""].filter(Boolean).join(" · ");
            return a.data_fim ? (
              <tr key={a.id} className="ds-encerrada"><td><b>{a.droga}</b>{sub ? <small>{sub}</small> : null}</td><td>suspensa</td><td className="ds-num">{ddmm(a.data_inicio)} a {ddmm(a.data_fim)}</td></tr>
            ) : (
              <tr key={a.id}><td><b>{a.droga}</b>{sub ? <small>{sub}</small> : null}</td><td>{a.intencao ? INTENCAO[a.intencao] ?? a.intencao : <Traco />}</td>
                <td className="ds-num"><b>D{diasEntre(a.data_inicio, hoje) + 1}</b>{a.duracao_planejada_dias ? <small>de {a.duracao_planejada_dias}</small> : null}</td></tr>
            );
          })}
        </tbody>
      </table>
      <table className="ds-tabela" style={{ marginTop: 14 }}>
        <thead><tr><th>Cultura</th><th>Coleta</th><th>Resultado</th></tr></thead>
        <tbody>
          {culturas.length === 0 ? <tr><td colSpan={3}><Traco /></td></tr> : null}
          {culturas.map((c) => (
            <tr key={c.id}>
              <td><b>{MATERIAL[c.material] ?? c.material}</b>{c.observacoes ? <small>{c.observacoes}</small> : null}</td>
              <td className="ds-mono">{ddmm(c.coleta_ts)}</td>
              {c.crescimento ? (
                <td><b>{c.agente ?? "positiva"}</b>{c.ufc_por_ml != null ? <small>{nf(Number(c.ufc_por_ml))} UFC/mL</small> : null}
                  {c.antibiograma?.length ? (
                    <div className="ds-antibiograma" style={{ marginTop: 8 }}>
                      {c.antibiograma.map((s) => <span key={s.antibiotico}><span className={`ds-sir ds-sir--${s.resultado.toLowerCase()}`}>{s.resultado}</span>{s.antibiotico}</span>)}
                    </div>
                  ) : null}
                </td>
              ) : c.laudo_ts ? <td>sem crescimento</td> : <td className="ds-tenue">em andamento</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

/** Linha do tempo dos dispositivos: do dia da inserção até hoje, nos últimos seis dias. */
export function LinhaDoTempo({ disp, hoje }: { disp: Dispositivo[]; hoje: string }) {
  const N = 6;
  const dias = Array.from({ length: N }, (_, i) => somaDias(hoje, i - (N - 1)));
  if (!disp.length) return <Traco />;
  return (
    <div className="ds-lt">
      <span className="ds-lt__cab">Dispositivo</span>
      <div className="ds-lt__datas" style={{ "--dias": N } as React.CSSProperties}>{dias.map((d) => <span key={d}>{ddmm(d)}</span>)}</div>
      <span className="ds-lt__cab" style={{ textAlign: "right" }}>Dias</span>
      {disp.map((d, i) => {
        const ini = Math.max(diasEntre(dias[0], d.data_inicio), 0);
        const fim = d.data_fim ? Math.min(diasEntre(dias[0], d.data_fim), N - 1) : N - 1;
        const via = d.tipo === "iot" || d.tipo === "traqueo";
        return (
          <div key={d.id ?? i} style={{ display: "contents" }}>
            <div className="ds-lt__disp"><span className="ds-chip">{DISPOSITIVO[d.tipo] ?? d.tipo}</span>{d.sitio ? <small>{d.sitio}</small> : null}</div>
            <div className="ds-lt__trilho" style={{ "--dias": N } as React.CSSProperties}>
              <span className={"ds-lt__barra" + (d.data_fim ? " ds-lt__barra--retirado" : via ? " ds-lt__barra--via" : "")}
                style={{ left: `${(ini / N) * 100}%`, width: `${((fim - ini + 1) / N) * 100}%` }}>{d.data_fim ? `até ${ddmm(d.data_fim)}` : `desde ${ddmm(d.data_inicio)}`}</span>
            </div>
            {d.data_fim ? <div className="ds-lt__dias ds-lt__dias--retirado">retirado</div> : <div className="ds-lt__dias">D{diasEntre(d.data_inicio, hoje)}<small>em uso</small></div>}
          </div>
        );
      })}
    </div>
  );
}
