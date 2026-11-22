"use client";
// "Novo leito": admite um paciente num leito vago da UTI 2. O design mostra o botão, mas não o formulário:
// a folha usa as mesmas peças da ficha (Seg, Num, Txt, Area) dentro do painel do design.
// Grava em `pacientes`; o banco abre a internação sozinho (gatilho trg_paciente_internacao_ins).
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Area, G, Linha, M, Num, Seg, Txt, U } from "@/components/controles";
import { Icone } from "@/components/Icone";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { GRAVIDADE, GRAVIDADES, ddmmaaaa, num, type Gravidade } from "@/lib/termos";

const SEXO = ["Masculino", "Feminino"] as const;
const NOME_GRAVIDADE = [...GRAVIDADES].reverse().map((g) => GRAVIDADE[g]); // Estável, Watcher, Instável, Crítico
const dentro = (v: number | null, min: number, max: number) => v == null || (v >= min && v <= max);

/** Painel de admissão. `vagos` são os números dos leitos livres; `leito` é o leito já escolhido (vem do cartão vago). */
export function NovoLeito({ vagos, leito: inicial, hoje }: { vagos: string[]; leito: string | null; hoje: string }) {
  const rota = useRouter();
  const [leito, setLeito] = useState<string | null>(inicial && vagos.includes(inicial) ? inicial : null);
  const [f, setF] = useState({ nome: "", idade: "", sexo: null as string | null, peso: "", altura: "", hd: "", data: ddmmaaaa(hoje), gravidade: null as string | null });
  const [msg, setMsg] = useState("");
  const [gravando, setGravando] = useState(false);
  const set = (k: keyof typeof f) => (v: string | null) => setF((x) => ({ ...x, [k]: v }));

  async function admitir() {
    const idade = f.idade.trim() ? num(f.idade) : null, peso = f.peso.trim() ? num(f.peso) : null, altura = f.altura.trim() ? num(f.altura) : null;
    const dm = f.data.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    const iso = dm ? `${dm[3]}-${dm[2].padStart(2, "0")}-${dm[1].padStart(2, "0")}` : null;
    if (!leito || !f.nome.trim() || !f.gravidade) return setMsg("Escolha o leito, escreva o nome e marque a gravidade.");
    if ((f.idade.trim() && idade == null) || (f.peso.trim() && peso == null) || (f.altura.trim() && altura == null)) return setMsg("Idade, peso e altura têm de ser números.");
    if (!dentro(idade, 0, 130) || !dentro(peso, 1, 400) || !dentro(altura, 30, 250)) return setMsg("Confira idade (0 a 130 anos), peso (1 a 400 kg) e altura (30 a 250 cm).");
    const real = iso && new Date(iso + "T12:00:00Z").toISOString().slice(0, 10) === iso;
    if (!iso || !real) return setMsg("A data de admissão deve ser dia/mês/ano, por exemplo 22/11/2026.");
    if (iso > hoje) return setMsg("A data de admissão não pode ser no futuro.");
    const g = (Object.keys(GRAVIDADE) as Gravidade[]).find((k) => GRAVIDADE[k] === f.gravidade);
    setGravando(true); setMsg("");
    const { error } = await getSupabaseBrowser().from("pacientes").insert({
      uti: "UTI2", leito: `UTI2-L${leito}`, status_leito: "ativo", nome: f.nome.trim(), idade, sexo: f.sexo ? f.sexo.toLowerCase() : null,
      peso, altura, hd: f.hd.trim() || null, data_adm: iso, gravidade: g,
    });
    setGravando(false);
    if (error) return setMsg(error.code === "23505" ? "Esse leito acabou de ser ocupado. Escolha outro. Nada foi gravado." : "Não foi possível admitir. Nada foi gravado; tente de novo.");
    rota.push(`/round?leito=${leito}`); rota.refresh();
  }

  return (
    <section className="ds-painel ds-novo" aria-label="Novo leito">
      <div className="ds-painel__cab"><div><h3 className="ds-painel__titulo">Novo leito</h3><span className="ds-painel__nota">admissão na UTI 2</span></div></div>
      <div className="ds-painel__corpo">
        {vagos.length ? (
          <>
            <Linha r="Leito"><Seg r="Leito" ops={vagos} v={leito} on={setLeito} numero /></Linha>
            <Linha r="Nome"><Txt r="Nome do paciente" v={f.nome} on={set("nome")} /></Linha>
            <Linha r="Idade"><G><Num r="Idade" v={f.idade} on={set("idade")} /><U>anos</U></G><M>Sexo</M><Seg r="Sexo" ops={SEXO} v={f.sexo} on={set("sexo")} /></Linha>
            <Linha r="Peso e altura"><G><Num r="Peso" v={f.peso} on={set("peso")} /><U>kg</U></G><G><Num r="Altura" v={f.altura} on={set("altura")} /><U>cm</U></G></Linha>
            <Linha r="HD"><Area r="Hipótese diagnóstica" v={f.hd} on={set("hd")} /></Linha>
            <Linha r="Admissão"><Txt r="Data de admissão" v={f.data} on={set("data")} larg={120} /></Linha>
            <Linha r="Gravidade"><Seg r="Gravidade" ops={NOME_GRAVIDADE} v={f.gravidade} on={set("gravidade")} /></Linha>
            <div className="ds-ev__v ds-novo__acoes">
              <button className="ds-btn ds-btn--primario" type="button" disabled={gravando} onClick={admitir}><Icone n="feito" />Admitir paciente</button>
              <Link className="ds-btn" href="/cards">Cancelar</Link>
              {msg ? <span className="ds-ev__msg" role="alert">{msg}</span> : null}
            </div>
          </>
        ) : <p className="ds-tenue">Todos os 13 leitos estão ocupados.</p>}
      </div>
    </section>
  );
}
