"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icone } from "@/components/Icone";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { nf, num } from "@/lib/termos";
import type { Folhao as Dados } from "@/lib/uti";

/** Folhão de laboratório: a coluna de hoje fica aberta para lançar; "Salvar coleta de hoje" grava só o que mudou. */
export function Folhao({ pacienteId, f }: { pacienteId: string; f: Dados }) {
  const rota = useRouter();
  const [novo, setNovo] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<"" | "salvando" | "erro">("");
  const mudou = Object.entries(novo).filter(([, v]) => v.trim() !== "");
  async function salvar() {
    const linhas = mudou.map(([tipo, v]) => ({ tipo, valor: num(v) })).filter((x) => x.valor != null);
    if (!linhas.length) return;
    setEstado("salvando");
    const unidade = new Map(f.secoes.flatMap((s) => s.linhas.map((l) => [l.codigo, l.unidade] as const)));
    const { error } = await getSupabaseBrowser().from("eventos_clinicos").insert(
      linhas.map((x) => ({ paciente_id: pacienteId, tipo: x.tipo, valor_num: x.valor, unidade: unidade.get(x.tipo) || null, ts: new Date().toISOString(), fonte: "manual", confidence: 1 })),
    );
    if (error) { setEstado("erro"); return; }
    setNovo({}); setEstado(""); rota.refresh();
  }
  return (
    <section className="ds-painel">
      <div className="ds-painel__cab">
        <div><h3 className="ds-painel__titulo">Laboratório</h3><span className="ds-painel__nota">{estado === "erro" ? "Não salvo. Tente de novo." : "mais recente à esquerda"}</span></div>
        <button className="ds-btn ds-btn--primario ds-btn--p" type="button" disabled={!mudou.length || estado === "salvando"} onClick={salvar}><Icone n="feito" />Salvar coleta de hoje</button>
      </div>
      <div className="ds-painel__corpo">
        <div style={{ margin: "0 -16px" }}>
          <div className="ds-tabela-wrap" style={{ border: 0, borderRadius: 0 }}>
            <table className="ds-folhao">
              <thead><tr><th className="ds-folhao__exame">Exame</th>{f.datas.map((d, i) => <th key={d.iso} className={i === 0 ? "ds-folhao__hoje" : undefined}>{d.rotulo}<span>{d.sub}</span></th>)}</tr></thead>
              <tbody>
                {f.secoes.map((s) => [
                  <tr key={s.titulo}><td className="ds-folhao__secao" colSpan={f.datas.length + 1}>{s.titulo}</td></tr>,
                  ...s.linhas.map((l) => (
                    <tr key={l.codigo}>
                      <td className="ds-folhao__exame"><b>{l.rotulo}</b>{l.unidade ? <span>{l.unidade}</span> : null}</td>
                      {l.cel.map((c, i) => i === 0 ? (
                        <td key={i} className="ds-folhao__hoje">
                          <label className="ds-celula">
                            <input inputMode="decimal" aria-label={`${l.rotulo} de hoje`} placeholder={c.v != null ? nf(c.v) : "—"} value={novo[l.codigo] ?? ""}
                              onChange={(e) => setNovo((n) => ({ ...n, [l.codigo]: e.target.value }))} />
                          </label>
                        </td>
                      ) : c.v == null ? <td key={i} className="ds-folhao__vazio">—</td> : (
                        <td key={i}>{c.nivel ? <span className={c.nivel === "c" ? "ds-vc" : "ds-va"}>{nf(c.v)}</span> : nf(c.v)}</td>
                      ))}
                    </tr>
                  )),
                ])}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{ marginTop: 12 }}><div className="ds-legenda"><span>— não coletado</span><span>o valor de hoje já lançado aparece em cinza na caixa; digitar por cima grava uma coleta nova</span></div></div>
      </div>
    </section>
  );
}
