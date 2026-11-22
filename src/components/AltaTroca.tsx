"use client";
// "Alta" e "Trocar de leito": dois botões do design (mesma classe do "Novo leito") junto do cabeçalho do paciente.
// O design mostra o botão, não o formulário: cada painel usa as mesmas peças da admissão (src/components/NovoLeito.tsx).
// As duas gravações são funções do banco (dar_alta_paciente, transferir_leito); a tela só manda os valores digitados.
import { useState } from "react";
import { Area, Linha, M, Seg, Txt } from "@/components/controles";
import { Icone } from "@/components/Icone";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { DESFECHO } from "@/lib/termos";

const NOMES = Object.values(DESFECHO);
const VERBO: Record<string, string> = { alta_uti: "alta", alta_hospitalar: "alta", obito: "óbito", transferencia: "transferência" };
// Navegação completa (não a de dentro da página): salvar a ficha pede ao Next que recarregue a tela e essa recarga atropelaria a troca de página.
const irPara = (rota: string) => window.location.assign(rota);
const brutoOuNulo = (t: string) => t.trim() || null;

/** dia/mês (ou dia/mês/ano) -> AAAA-MM-DD. Sem ano, vale o ano de hoje: nunca adivinha outro. */
function isoDaData(texto: string, hoje: string): string | null {
  const m = texto.trim().match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/);
  if (!m) return null;
  const iso = `${m[3] ?? hoje.slice(0, 4)}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return new Date(iso + "T12:00:00Z").toISOString().slice(0, 10) === iso ? iso : null;
}

export function AltaTroca({ pacienteId, leito, vagos, hoje, antes }: { pacienteId: string; leito: string; vagos: string[]; hoje: string; antes: () => Promise<boolean> }) {
  const [aberto, setAberto] = useState<"alta" | "troca" | null>(null);
  const [desfecho, setDesfecho] = useState<string | null>(null);
  const [data, setData] = useState(""), [setor, setSetor] = useState(""), [esp, setEsp] = useState(""), [obs, setObs] = useState("");
  const [novo, setNovo] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [gravando, setGravando] = useState(false);
  const abre = (q: "alta" | "troca") => { setAberto(aberto === q ? null : q); setMsg(""); };

  async function darAlta() {
    const cod = Object.keys(DESFECHO).find((k) => DESFECHO[k] === desfecho);
    if (!cod) return setMsg("Marque o desfecho.");
    if (!data.trim()) return setMsg("Escreva a data do desfecho (dia/mês).");
    const iso = isoDaData(data, hoje);
    if (!iso) return setMsg("A data deve ser dia/mês, por exemplo 22/11.");
    if (iso > hoje) return setMsg("A data do desfecho não pode ser no futuro.");
    setGravando(true); setMsg("");
    if (!(await antes())) { setGravando(false); return setMsg("A ficha não foi salva, então a alta não foi dada. Veja o aviso no alto da tela."); }
    const { error } = await getSupabaseBrowser().rpc("dar_alta_paciente", {
      p_paciente_id: pacienteId, p_desfecho: cod, p_desfecho_data: iso, p_destino_setor: brutoOuNulo(setor), p_destino_especialidade: brutoOuNulo(esp), p_observacoes: brutoOuNulo(obs),
    });
    setGravando(false);
    if (error) return setMsg(error.message || "Não foi possível dar a alta. Nada foi gravado.");
    irPara("/cards");
  }

  async function trocar() {
    if (!novo) return setMsg("Escolha o leito de destino.");
    setGravando(true); setMsg("");
    if (!(await antes())) { setGravando(false); return setMsg("A ficha não foi salva, então o leito não foi trocado. Veja o aviso no alto da tela."); }
    const { error } = await getSupabaseBrowser().rpc("transferir_leito", { p_paciente_id: pacienteId, p_leito: `UTI2-L${novo}`, p_uti: "UTI2" });
    setGravando(false);
    if (error) return setMsg(error.message || "Não foi possível trocar de leito. Nada foi gravado.");
    irPara(`/evolucao?leito=${novo}`);
  }

  const cod = Object.keys(DESFECHO).find((k) => DESFECHO[k] === desfecho);
  return (
    <>
      <div className="ds-leito-acoes">
        <button className="ds-btn ds-btn--primario" type="button" aria-expanded={aberto === "alta"} onClick={() => abre("alta")}>Alta</button>
        <button className="ds-btn ds-btn--primario" type="button" aria-expanded={aberto === "troca"} onClick={() => abre("troca")}>Trocar de leito</button>
      </div>
      {aberto === "alta" ? (
        <section className="ds-painel ds-novo" aria-label="Alta">
          <div className="ds-painel__cab"><div><h3 className="ds-painel__titulo">Alta</h3><span className="ds-painel__nota">saída do leito {leito}</span></div></div>
          <div className="ds-painel__corpo">
            <Linha r="Desfecho"><Seg r="Desfecho" ops={NOMES} v={desfecho} on={setDesfecho} /></Linha>
            <Linha r="Data"><Txt r="Data do desfecho" v={data} on={setData} larg={120} /><M>dia/mês</M></Linha>
            <Linha r="Destino"><M>Setor</M><Txt r="Setor de destino" v={setor} on={setSetor} /><M>Especialidade</M><Txt r="Especialidade de destino" v={esp} on={setEsp} /></Linha>
            <Linha r="Observações"><Area r="Observações" v={obs} on={setObs} /></Linha>
            <div className="ds-ev__v ds-novo__acoes">
              <button className="ds-btn ds-btn--primario" type="button" disabled={gravando} onClick={darAlta}><Icone n="feito" />Confirmar {cod ? VERBO[cod] : "alta"} do leito {leito}</button>
              <button className="ds-btn" type="button" onClick={() => setAberto(null)}>Cancelar</button>
              {msg ? <span className="ds-ev__msg" role="alert">{msg}</span> : null}
            </div>
          </div>
        </section>
      ) : null}
      {aberto === "troca" ? (
        <section className="ds-painel ds-novo" aria-label="Trocar de leito">
          <div className="ds-painel__cab"><div><h3 className="ds-painel__titulo">Trocar de leito</h3><span className="ds-painel__nota">do leito {leito} para um leito vago da UTI 2</span></div></div>
          <div className="ds-painel__corpo">
            {vagos.length ? (
              <>
                <Linha r="Leito"><Seg r="Leito de destino" ops={vagos} v={novo} on={setNovo} numero /></Linha>
                <div className="ds-ev__v ds-novo__acoes">
                  <button className="ds-btn ds-btn--primario" type="button" disabled={gravando} onClick={trocar}><Icone n="feito" />Confirmar troca para o leito {novo ?? "…"}</button>
                  <button className="ds-btn" type="button" onClick={() => setAberto(null)}>Cancelar</button>
                  {msg ? <span className="ds-ev__msg" role="alert">{msg}</span> : null}
                </div>
              </>
            ) : <p className="ds-tenue">Não há leito vago na UTI 2.</p>}
          </div>
        </section>
      ) : null}
    </>
  );
}
