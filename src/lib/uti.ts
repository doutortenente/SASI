// Leitura do banco para as telas do Comando UTI. Só roda no servidor.
// Erro de leitura GRITA (falhaBanco): tela vazia nunca pode significar "consulta falhou".
import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";
import { falhaBanco } from "@/lib/erros";
import {
  ABREV_DROGA, DISPOSITIVO, SECOES_EXAMES, SUPORTES, diaSP, diaSemana, ddmm, diasEntre, nf, numLeito, plantaoAtual, somaDias, txt,
  type Conduta, type Dados, type Gravidade, type Infusao, type Pendencia, type Turno,
} from "@/lib/termos";

export const UTI = "UTI2";
export const TOTAL_LEITOS = 13;

export interface Paciente {
  id: string; leito: string; nome: string; idade: number | null; peso: number | null; altura: number | null; sexo: string | null;
  hd: string | null; alergias: string | null; gravidade: Gravidade; isolation: string; data_adm: string;
}
export interface Janela {
  paciente_id: string; tipo: string; janela_fim: string; valor_max: number | null; valor_min: number | null; n_total: number;
  n_fora_alto: number | null; n_fora_baixo: number | null; limiar_alto: number | null; limiar_baixo: number | null;
}
export interface AtbAtivo { paciente_id: string; atb_id: string; droga: string; dias_terapia: number }
export interface Dispositivo { id?: string; paciente_id: string; tipo: string; sitio: string | null; data_inicio: string; data_fim?: string | null }
export interface Evolucao {
  id: string; paciente_id: string; data_plantao: string; turno: Turno; data_evolucao: string; updated_at: string;
  neuro: Dados; resp: Dados; hemo: Dados; tgi: Dados; renal: Dados; hemato: Dados; infecto: Dados;
  dvas: Infusao[] | null; sedativos: Infusao[] | null; intercorrencias: string[] | null; impressao: string[] | null;
  condutas_sistemas: Conduta[] | null; prescricao: unknown;
}
export interface Leito {
  n: string; p: Paciente | null; dUti: number | null; pend: Pendencia[]; janelas: Record<string, Janela>;
  atbs: AtbAtivo[]; disp: Dispositivo[]; evo: Evolucao | null;
}
export interface Atb {
  id: string; droga: string; dose: string | null; via: string | null; frequencia: string | null; data_inicio: string; data_fim: string | null;
  intencao: string | null; foco: string | null; duracao_planejada_dias: number | null;
}
export interface Cultura {
  id: string; material: string; coleta_ts: string; laudo_ts: string | null; crescimento: boolean; agente: string | null;
  ufc_por_ml: number | null; observacoes: string | null; antibiograma: { antibiotico: string; resultado: string }[] | null;
}
export interface Evento { tipo: string; ts: string; valor_num: number | null; unidade: string | null }
export interface Vocab { codigo: string; categoria: string; rotulo: string; sigla: string | null; unidade_padrao: string | null; ordem: number | null }
export interface Regra { tipo_evento: string; comparador: "lt" | "lte" | "gt" | "gte"; limiar: number; severidade: "info" | "warning" | "critical" }

type Resp = { data: unknown; error: { message?: string | null; code?: string | null; details?: string | null } | null };
async function ler<T>(fn: string, q: PromiseLike<Resp>): Promise<T[]> {
  const { data, error } = await q;
  if (error) throw falhaBanco("uti", fn, error);
  return (data ?? []) as T[];
}
const COLS_EVO = "id,paciente_id,data_plantao,turno,data_evolucao,updated_at,neuro,resp,hemo,tgi,renal,hemato,infecto,dvas,sedativos,intercorrencias,impressao,condutas_sistemas,prescricao";
const COLS_JANELA = "paciente_id,tipo,janela_fim,valor_max,valor_min,n_total,n_fora_alto,n_fora_baixo,limiar_alto,limiar_baixo";

/** Os 13 leitos da UTI, em ordem, com o que os cards, a tabela, a passagem e a faixa de leitos mostram. */
export const carregarLeitos = cache(async (): Promise<Leito[]> => {
  const sb = await getSupabaseServer();
  const { hoje } = plantaoAtual();
  const corte = new Date(Date.now() - 36 * 3600e3).toISOString();
  const [pacs, pend, jan, atbs, disp, evos, ints] = await Promise.all([
    ler<Paciente>("pacientes", sb.from("pacientes").select("id,leito,nome,idade,peso,altura,sexo,hd,alergias,gravidade,isolation,data_adm").eq("status_leito", "ativo").eq("uti", UTI)),
    ler<Pendencia>("pendencias", sb.from("pendencias").select("id,paciente_id,tarefa,prioridade,concluida").eq("concluida", false).order("prioridade").order("created_at")),
    ler<Janela>("janelas_24h", sb.from("janelas_24h").select(COLS_JANELA).gte("janela_fim", corte).order("janela_fim", { ascending: false })),
    ler<AtbAtivo>("vw_dias_atb_ativo", sb.from("vw_dias_atb_ativo").select("paciente_id,atb_id,droga,dias_terapia").order("data_inicio")),
    ler<Dispositivo>("vw_dispositivos_ativos", sb.from("vw_dispositivos_ativos").select("paciente_id,tipo,sitio,data_inicio").order("data_inicio")),
    ler<Evolucao>("evolucoes", sb.from("evolucoes").select(COLS_EVO).gte("data_plantao", somaDias(hoje, -1)).order("data_plantao", { ascending: false }).order("data_evolucao", { ascending: false })),
    ler<{ paciente_id: string; int_uti_data: string }>("internacoes", sb.from("internacoes").select("paciente_id,int_uti_data").is("desfecho", null)),
  ]);
  const porLeito = new Map(pacs.map((p) => [numLeito(p.leito), p]));
  return Array.from({ length: TOTAL_LEITOS }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    const p = porLeito.get(n) ?? null;
    if (!p) return { n, p: null, dUti: null, pend: [], janelas: {}, atbs: [], disp: [], evo: null };
    const janelas: Record<string, Janela> = {};
    for (const j of jan) if (j.paciente_id === p.id && !janelas[j.tipo]) janelas[j.tipo] = j; // a mais recente de cada sinal
    const inicio = ints.find((x) => x.paciente_id === p.id)?.int_uti_data ?? p.data_adm;
    return {
      n, p, janelas, dUti: inicio ? diasEntre(inicio, hoje) : null,
      pend: pend.filter((x) => x.paciente_id === p.id),
      atbs: atbs.filter((x) => x.paciente_id === p.id),
      disp: disp.filter((x) => x.paciente_id === p.id),
      evo: evos.find((x) => x.paciente_id === p.id) ?? null,
    };
  });
});

export const contaGravidade = (ls: Leito[], g: Gravidade): number => ls.filter((l) => l.p?.gravidade === g).length;
export function filtra(ls: Leito[], q?: string): Leito[] {
  const s = (q ?? "").trim().toLowerCase();
  if (!s) return ls;
  const d = s.replace(/\D/g, "");
  return ls.filter((l) => (d && l.n === d.padStart(2, "0")) || (l.p?.nome.toLowerCase().includes(s) ?? false));
}
export const maxMin = (j?: Janela): string | null => (j && j.valor_max != null && j.valor_min != null ? `${nf(j.valor_max)}–${nf(j.valor_min)}` : null);
/** Pílulas "5x < 65": quantas medidas da janela passaram do limiar gravado com ela. A de cima vem primeiro. */
export function pilulas(j?: Janela): string[] {
  if (!j) return [];
  const o: string[] = [];
  if ((j.n_fora_alto ?? 0) > 0 && j.limiar_alto != null) o.push(`${j.n_fora_alto}x > ${nf(j.limiar_alto)}`);
  if ((j.n_fora_baixo ?? 0) > 0 && j.limiar_baixo != null) o.push(`${j.n_fora_baixo}x < ${nf(j.limiar_baixo)}`);
  return o;
}
/** Suporte, vasoativos e sedação da evolução mais recente (de ontem para cá). */
export function suporteDe(l: Leito): { suporte: string[]; dva: string[] } {
  const e = l.evo;
  if (!e) return { suporte: [], dva: [] };
  const suporte: string[] = [];
  const s = txt(e.resp?.suporte);
  if (s && s !== "Ar ambiente" && (SUPORTES as readonly string[]).includes(s)) suporte.push(s);
  const trs = txt(e.renal?.trs);
  if (trs === "Intermitente" || trs === "Contínua") suporte.push("TRS");
  if ((e.sedativos ?? []).some((d) => d?.droga)) suporte.push("sedação");
  const dva = (e.dvas ?? []).filter((d) => d?.droga).map((d) => `${ABREV_DROGA[d.droga] ?? d.droga}${d.dose != null ? " " + nf(d.dose) : ""}`);
  return { suporte, dva };
}
export const dispositivosCurtos = (l: Leito): string[] => l.disp.filter((d) => d.tipo !== "iot" && d.tipo !== "traqueo").map((d) => DISPOSITIVO[d.tipo] ?? d.tipo);

// ---- um paciente: Round, Exames e Evolução ------------------------------------
export interface Detalhe {
  atbs: Atb[]; culturas: Cultura[]; disp: Dispositivo[]; eventos: Evento[]; janelas: Janela[]; pend: Pendencia[];
  evoPlantao: Evolucao | null; evoAnterior: Evolucao | null; vocab: Vocab[]; regras: Regra[];
}
/** Nomes de antimicrobianos já usados no banco (só a coluna droga), sem repetir, em ordem. Sugestões da ficha. */
export const carregarNomesAtb = cache(async (): Promise<string[]> => {
  const sb = await getSupabaseServer();
  const r = await ler<{ droga: string | null }>("atbs_nomes", sb.from("atbs").select("droga").order("droga"));
  return [...new Set(r.map((x) => (x.droga ?? "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
});
export const carregarVocab = cache(async (): Promise<Vocab[]> => {
  const sb = await getSupabaseServer();
  return ler<Vocab>("evento_tipo_ref", sb.from("evento_tipo_ref").select("codigo,categoria,rotulo,sigla,unidade_padrao,ordem"));
});
export const carregarDetalhe = cache(async (pacienteId: string): Promise<Detalhe> => {
  const sb = await getSupabaseServer();
  const pl = plantaoAtual();
  const desde = somaDias(pl.hoje, -7);
  const [atbs, culturas, disp, eventos, janelas, pend, evos, vocab, regras] = await Promise.all([
    ler<Atb>("atbs", sb.from("atbs").select("id,droga,dose,via,frequencia,data_inicio,data_fim,intencao,foco,duracao_planejada_dias").eq("paciente_id", pacienteId).order("data_inicio")),
    ler<Cultura>("culturas", sb.from("culturas").select("id,material,coleta_ts,laudo_ts,crescimento,agente,ufc_por_ml,observacoes,antibiograma(antibiotico,resultado)").eq("paciente_id", pacienteId).order("coleta_ts")),
    ler<Dispositivo>("dispositivo_episodios", sb.from("dispositivo_episodios").select("id,paciente_id,tipo,sitio,data_inicio,data_fim").eq("paciente_id", pacienteId).or(`data_fim.is.null,data_fim.gte.${somaDias(pl.hoje, -5)}`).order("data_inicio")),
    ler<Evento>("eventos_clinicos", sb.from("eventos_clinicos").select("tipo,ts,valor_num,unidade").eq("paciente_id", pacienteId).gte("ts", desde + "T00:00:00-03:00").not("valor_num", "is", null).order("ts").limit(3000)),
    ler<Janela>("janelas_24h", sb.from("janelas_24h").select(COLS_JANELA).eq("paciente_id", pacienteId).gte("janela_fim", desde + "T00:00:00-03:00").order("janela_fim")),
    ler<Pendencia>("pendencias", sb.from("pendencias").select("id,paciente_id,tarefa,prioridade,concluida,concluida_at").eq("paciente_id", pacienteId).or(`concluida.eq.false,concluida_at.gte.${new Date(Date.now() - 36 * 3600e3).toISOString()}`).order("concluida").order("prioridade").order("created_at")),
    ler<Evolucao>("evolucoes", sb.from("evolucoes").select(COLS_EVO).eq("paciente_id", pacienteId).order("data_plantao", { ascending: false }).order("data_evolucao", { ascending: false }).limit(4)),
    carregarVocab(),
    ler<Regra>("alert_rules", sb.from("alert_rules").select("tipo_evento,comparador,limiar,severidade").eq("ativo", true)),
  ]);
  const doPlantao = (e: Evolucao) => e.data_plantao === pl.data && e.turno === pl.turno;
  return {
    atbs, culturas, disp, eventos, janelas, pend, vocab, regras,
    evoPlantao: evos.find(doPlantao) ?? null,
    evoAnterior: evos.find((e) => !doPlantao(e)) ?? null,
  };
});

/** "a" (alerta) ou "c" (crítico) quando o valor passa de uma regra de alert_rules. Só pinta a célula; o número não muda de cor. */
export function nivelDe(regras: Regra[], tipo: string, v: number | null): "a" | "c" | null {
  if (v == null) return null;
  let n: "a" | "c" | null = null;
  for (const r of regras) {
    if (r.tipo_evento !== tipo) continue;
    const bate = r.comparador === "lt" ? v < r.limiar : r.comparador === "lte" ? v <= r.limiar : r.comparador === "gt" ? v > r.limiar : v >= r.limiar;
    if (bate) n = r.severidade === "critical" ? "c" : n ?? "a";
  }
  return n;
}
/** Último valor de cada exame em cada dia (fuso de São Paulo). */
export function porDia(eventos: Evento[]): Map<string, Map<string, number>> {
  const m = new Map<string, Map<string, number>>();
  for (const e of eventos) {
    if (e.valor_num == null) continue;
    const d = diaSP(e.ts);
    if (!m.has(e.tipo)) m.set(e.tipo, new Map());
    m.get(e.tipo)!.set(d, Number(e.valor_num)); // os eventos vêm em ordem de hora: o último do dia fica
  }
  return m;
}
export interface LinhaFolhao { codigo: string; rotulo: string; unidade: string; cel: { v: number | null; nivel: "a" | "c" | null }[] }
export interface Folhao { datas: { iso: string; rotulo: string; sub: string }[]; secoes: { titulo: string; linhas: LinhaFolhao[] }[] }
/** Folhão de laboratório: hoje à esquerda e os seis dias anteriores. */
export function montarFolhao(d: Detalhe, hoje: string): Folhao {
  const dias = Array.from({ length: 7 }, (_, i) => somaDias(hoje, -i));
  const mapa = porDia(d.eventos);
  const voc = new Map(d.vocab.map((v) => [v.codigo, v]));
  return {
    datas: dias.map((iso, i) => ({ iso, rotulo: ddmm(iso), sub: i === 0 ? "hoje" : i === 1 ? "ontem" : diaSemana(iso) })),
    secoes: SECOES_EXAMES.map(([titulo, cods]) => ({
      titulo,
      linhas: cods.map((c) => ({
        codigo: c, rotulo: voc.get(c)?.rotulo ?? c, unidade: voc.get(c)?.unidade_padrao ?? "",
        cel: dias.map((iso) => { const v = mapa.get(c)?.get(iso) ?? null; return { v, nivel: nivelDe(d.regras, c, v) }; }),
      })),
    })),
  };
}
/** Série de um exame para o gráfico pequeno: um ponto por dia com coleta. */
export function serieDe(d: Detalhe, codigo: string): { iso: string; v: number }[] {
  return [...(porDia(d.eventos).get(codigo)?.entries() ?? [])].map(([iso, v]) => ({ iso, v })).sort((a, b) => a.iso.localeCompare(b.iso));
}

/** Gráfico pequeno do design: faixas do mínimo ao máximo por janela (sinais) ou linha pelas últimas coletas (exames). */
export type Grafico =
  | { tipo: "faixas"; pontos: { r: string; a: number; b: number }[]; alto: number | null; baixo: number | null }
  | { tipo: "linha"; pontos: { r: string; v: number; nivel: "a" | "c" | null }[]; limites: number[] };

/** Linha de um exame: os pontos das últimas coletas e as linhas de limiar das regras de alerta. */
export function linhaDe(d: Detalhe, codigo: string): Grafico {
  const limites = [...new Set(d.regras.filter((r) => r.tipo_evento === codigo).map((r) => r.limiar))].sort((a, b) => a - b);
  return { tipo: "linha", limites, pontos: serieDe(d, codigo).slice(-5).map((x) => ({ r: ddmm(x.iso), v: x.v, nivel: nivelDe(d.regras, codigo, x.v) })) };
}
