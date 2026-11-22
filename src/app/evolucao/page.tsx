import { Faixa, FichaPaciente, Topo } from "@/components/ds";
import { leitoPedido } from "@/components/Leito";
import { DISPOSITIVO, MATERIAL, SUPORTES, TURNO, ddmm, ddmmaaaa, diaSP, diasEntre, esquemaDe, hdItens, horaSP, nf, plantaoAtual, somaDias, type Dados, type Quadro } from "@/lib/termos";
import { carregarDetalhe, pilulas, porDia } from "@/lib/uti";
import { Ficha, type Estado } from "./Ficha";

export const dynamic = "force-dynamic";

const SINAIS: readonly (readonly [Quadro, string])[] = [["hemo", "pas"], ["hemo", "pad"], ["hemo", "pam"], ["hemo", "fc"], ["resp", "fr"], ["resp", "spo2"], ["tgi", "dx"], ["infecto", "temp"]];
const EXAMES = ["ph", "pco2", "hco3", "lactato", "bb", "ur", "cr", "na", "k", "mg", "cai", "hb", "ht", "plaq", "leuco"];
const DE_ONTEM: Partial<Record<Quadro, { chave: string; vale: (v: unknown) => boolean; campos: string[] }>> = {
  resp: { chave: "suporte", vale: (v) => (SUPORTES as readonly string[]).includes(String(v)), campos: ["suporte", "via", "modo", "peep", "fio2", "pinsp", "ps", "vc", "vc_obtido", "fluxo_l_min", "mascara_tipo", "macro_por", "ipap", "epap", "vni_uso"] },
  tgi: { chave: "dieta", vale: (v) => ["Zero", "Oral", "Enteral"].includes(String(v)), campos: ["dieta", "parenteral", "dieta_via", "dieta_vazao_ml_h"] },
  renal: { chave: "trs", vale: (v) => ["Não", "Intermitente", "Contínua"].includes(String(v)), campos: ["trs", "uf_ml_h", "uf_ml", "trs_ultima_sessao"] },
  infecto: { chave: "foco", vale: (v) => typeof v === "string" && v.trim() !== "", campos: ["foco"] },
};
const obj = (v: unknown): Dados => (v && typeof v === "object" && !Array.isArray(v) ? { ...(v as Dados) } : {});

export default async function Evolucao({ searchParams }: { searchParams: Promise<{ leito?: string }> }) {
  const { leito } = await searchParams;
  const { leitos, l } = await leitoPedido("/evolucao", leito);
  if (!l?.p) {
    return (<><Topo titulo="Evolução" fixo /><main className="ds-conteudo"><Faixa leitos={leitos} atual="" base="/evolucao" /><p className="ds-tenue">Nenhum leito ocupado.</p></main></>);
  }
  const p = l.p;
  const pl = plantaoAtual();
  const d = await carregarDetalhe(p.id);
  const evo = d.evoPlantao;
  const ant = d.evoAnterior && diasEntre(d.evoAnterior.data_plantao, pl.data) <= 1 ? d.evoAnterior : null;

  // sinais do registro de 24 h (a janela mais recente de cada sinal)
  const registro: Record<string, { max: number | null; min: number | null; pilulas: string[] }> = {};
  for (const [, k] of SINAIS) {
    const j = l.janelas[k];
    if (j) registro[k] = { max: j.valor_max != null ? Number(j.valor_max) : null, min: j.valor_min != null ? Number(j.valor_min) : null, pilulas: pilulas(j) };
  }
  const inicial: Estado = {
    neuro: obj(evo?.neuro), resp: obj(evo?.resp), hemo: obj(evo?.hemo), tgi: obj(evo?.tgi), renal: obj(evo?.renal), hemato: obj(evo?.hemato), infecto: obj(evo?.infecto),
    dvas: (evo?.dvas ?? ant?.dvas ?? []).filter((x) => x?.droga),
    sedativos: (evo?.sedativos ?? ant?.sedativos ?? []).filter((x) => x?.droga),
    intercorrencias: (evo?.intercorrencias ?? []).map((t) => ({ t })),
    impressao: (evo ? evo.impressao ?? [] : hdItens(p.hd)).map((t) => ({ t })), // sem evolução aberta, começa pelos diagnósticos do HD
    condutas: (evo?.condutas_sistemas ?? []).map((c) => ({ sistema: c.sistema, texto: c.texto })),
    pend: d.pend.map((x) => ({ id: x.id, tarefa: x.tarefa, prioridade: x.prioridade, concluida: x.concluida })),
  };
  for (const [q, k] of SINAIS) {
    const r = registro[k];
    if (!r) continue;
    if (inicial[q][`${k}_max`] == null && r.max != null) inicial[q][`${k}_max`] = r.max;
    if (inicial[q][`${k}_min`] == null && r.min != null) inicial[q][`${k}_min`] = r.min;
  }
  const mapa = porDia(d.eventos);
  const diureseHoje = mapa.get("diurese_24h")?.get(pl.hoje);
  if (inicial.renal.diurese_ml == null && diureseHoje != null) { inicial.renal.diurese_ml = diureseHoje; inicial.renal.diurese_h = 24; }

  const ontem: Partial<Record<Quadro, Dados>> = {};
  if (!evo && ant) {
    for (const [q, regra] of Object.entries(DE_ONTEM) as [Quadro, NonNullable<(typeof DE_ONTEM)[Quadro]>][]) {
      const de = obj(ant[q]);
      if (!regra.vale(de[regra.chave])) continue;
      ontem[q] = Object.fromEntries(regra.campos.filter((c) => de[c] != null).map((c) => [c, de[c]]));
    }
  }
  const labs: Record<string, { hoje: string; antes: string[] }> = {};
  for (const c of EXAMES) {
    const m = mapa.get(c);
    const v = (iso: string) => { const x = m?.get(iso); return x != null ? nf(x) : "—"; };
    labs[c] = { hoje: v(pl.hoje), antes: [v(somaDias(pl.hoje, -2)), v(somaDias(pl.hoje, -1))] };
  }
  const ativos = d.disp.filter((x) => !x.data_fim);
  const via = ativos.find((x) => x.tipo === "iot" || x.tipo === "traqueo");
  const enteral = ativos.find((x) => ["sne", "sng", "gtt"].includes(x.tipo));
  const meta = [
    p.idade != null ? `${p.idade} anos` : "", p.sexo ?? "", p.peso != null ? `${nf(Number(p.peso))} kg` : "",
    p.altura != null ? `${nf(Number(p.altura) / 100, 2)} m` : "", `admissão ${ddmmaaaa(p.data_adm)}`, l.dUti != null ? `D${l.dUti} de UTI` : "",
    `evolução de ${ddmmaaaa(pl.data)}, ${TURNO[pl.turno]}`,
  ].filter(Boolean).join(" · ");

  return (
    <Ficha
      key={`${p.id}:${pl.data}:${pl.turno}`}
      pacienteId={p.id} leito={l.n} dataPlantao={pl.data} turno={pl.turno} evolucaoId={evo?.id ?? null} salvoEm={evo ? horaSP(evo.updated_at) : null}
      inicial={inicial} ontem={ontem} registro={registro} labs={labs}
      peso={p.peso != null ? Number(p.peso) : null} altura={p.altura != null ? Number(p.altura) : null} sexo={p.sexo}
      dispositivos={ativos.filter((x) => ["cvc", "picc", "arterial", "svd", "dreno", "trr", "marca_passo", "outro"].includes(x.tipo))
        .map((x) => ({ nome: [DISPOSITIVO[x.tipo] ?? x.tipo, x.sitio].filter(Boolean).join(" "), d: diasEntre(x.data_inicio, pl.hoje) }))}
      viaAerea={via ? { via: via.tipo === "iot" ? "IOT" : "TQT", desde: ddmm(via.data_inicio), d: diasEntre(via.data_inicio, pl.hoje) } : null}
      viaEnteral={enteral ? DISPOSITIVO[enteral.tipo] : null} svd={ativos.some((x) => x.tipo === "svd")}
      hoje={pl.hoje}
      atbs={d.atbs.filter((a) => !a.data_fim || a.data_fim === pl.hoje).map((a) => ({ id: a.id, droga: a.droga, esquema: esquemaDe(a.dose, a.via, a.frequencia), inicio: a.data_inicio, fim: a.data_fim, previstos: a.duracao_planejada_dias }))}
      culturas={d.culturas.map((c) => ({
        id: c.id, material: MATERIAL[c.material] ?? c.material, coleta: ddmm(diaSP(c.coleta_ts)), coletaTs: c.coleta_ts, laudoTs: c.laudo_ts,
        resultado: c.crescimento ? "Positiva" : c.laudo_ts ? "Negativa" : "Em andamento",
        germe: c.crescimento ? c.agente ?? "" : "", ufc: c.ufc_por_ml != null ? Number(c.ufc_por_ml) : null,
        s: (c.antibiograma ?? []).filter((x) => x.resultado === "S").map((x) => x.antibiotico).join(", "),
        r: (c.antibiograma ?? []).filter((x) => x.resultado === "R").map((x) => x.antibiotico).join(", "),
      }))}
      bhAcumulado={[...(mapa.get("bh_acumulado")?.entries() ?? [])].sort((a, b) => a[0].localeCompare(b[0])).at(-1)?.[1] ?? null}
    >
      <Faixa leitos={leitos} atual={l.n} base="/evolucao" />
      <FichaPaciente l={l} meta={meta} rotuloHd />
    </Ficha>
  );
}
