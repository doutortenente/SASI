"use client";
// Tela Evolução: a ficha de plantão por sistema, como no design.
// Regras fixas: número nunca muda de cor (fora do limiar = pílula "Nx < limite"); cada quadro termina em Notas;
// a ficha não supõe valor (conta em branco quando falta dado); nada é corrigido sozinho.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Icone } from "@/components/Icone";
import { Area, G, Linha, M, Num, Seg, Txt, U, tecla } from "@/components/controles";
import type { NomeIcone } from "@/components/icones";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  DILUICOES, DROGAS_SEDACAO, DROGAS_VASOATIVAS, MATERIAL, QUADROS, RESULTADOS_CULTURA, SUPORTES, TURNO, ddmmaaaa, ddmm, diasEntre, doseDe, esquemaEmColunas, horaSP, isoDeDdMm, nf, num, pesoPredito, sinal, txt,
  type Conduta, type Dados, type Infusao, type Quadro, type Turno,
} from "@/lib/termos";

interface Item { t: string; x?: boolean }
interface PendLocal { id?: string; tarefa: string; prioridade: number; concluida: boolean; x?: boolean; mudou?: boolean }
export interface Estado {
  neuro: Dados; resp: Dados; hemo: Dados; tgi: Dados; renal: Dados; hemato: Dados; infecto: Dados;
  dvas: Infusao[]; sedativos: Infusao[]; intercorrencias: Item[]; impressao: Item[]; condutas: (Conduta & { x?: boolean })[]; pend: PendLocal[];
}
interface AtbLocal {
  k: string; id?: string; droga: string; esquema: string; inicio: string; previstos: string; fim: string | null; x?: boolean;
  orig?: { esquema: string; inicio: string; inicioIso: string; previstos: string; fim: string | null };
}
interface CulturaLocal {
  k: string; id?: string; material: string; coleta: string; resultado: string; germe: string; ufc: number | null; s: string; r: string; x?: boolean;
  coletaTs?: string; laudoTs?: string | null; orig?: { material: string; coleta: string; resultado: string; germe: string };
}
const MATERIAIS = Object.values(MATERIAL);
const CODIGO_MATERIAL: Record<string, string> = Object.fromEntries(Object.entries(MATERIAL).map(([c, t]) => [t, c]));
/** Dias previstos: inteiro a partir de 1; vazio fica vazio (null). */
function diasPrevistos(t: string): number | null {
  if (!t.trim()) return null;
  const n = num(t);
  if (n == null || !Number.isInteger(n) || n < 1) throw new Error("dias previstos inválidos");
  return n;
}
interface Props {
  pacienteId: string; leito: string; dataPlantao: string; turno: Turno; evolucaoId: string | null; salvoEm: string | null;
  inicial: Estado; ontem: Partial<Record<Quadro, Dados>>;
  registro: Record<string, { max: number | null; min: number | null; pilulas: string[] }>;
  labs: Record<string, { hoje: string; antes: string[] }>;
  peso: number | null; altura: number | null; sexo: string | null;
  dispositivos: { nome: string; d: number }[]; viaAerea: { via: string; desde: string; d: number } | null; viaEnteral: string | null; svd: boolean;
  hoje: string;
  atbs: { id: string; droga: string; esquema: string; inicio: string; fim: string | null; previstos: number | null }[];
  culturas: { id: string; material: string; coleta: string; coletaTs: string; laudoTs: string | null; resultado: string; germe: string; ufc: number | null; s: string; r: string }[];
  bhAcumulado: number | null; children: ReactNode;
}

// ---- opções, com o texto exato do design ---------------------------------------
const RASS: readonly (readonly [string, string])[] = [["+4", "combativo"], ["+3", "muito agitado"], ["+2", "agitado"], ["+1", "inquieto"], ["0", "alerta e calmo"], ["−1", "sonolento"], ["−2", "sedação leve"], ["−3", "sedação moderada"], ["−4", "sedação profunda"], ["−5", "não desperta"]];
const CAM = ["Positivo", "Negativo", "Não aplicável"];
const PUPILAS = ["Isocóricas e fotorreagentes", "Alteradas"];
const DEFICIT = ["Ausente", "Presente", "Não avaliável"];
const MODOS = ["VCV", "PCV", "PRVC", "PSV"];
const MASCARAS = ["Venturi", "Reservatório", "Macronebulização"];
const AUSCULTA_P = ["MV presente, sem ruídos", "Alterada"];
const ACHADOS_P = ["MV reduzido", "MV abolido", "Crepitações", "Roncos", "Sibilos"];
const LOCAIS_P = ["Base D", "Base E", "À direita", "À esquerda", "Difuso"];
const AUSCULTA_C = ["BNF 2T sem sopros", "Alterada"];
const ACHADOS_C = ["Bulhas hipofonéticas", "Sopro sistólico", "Sopro diastólico", "B3", "Atrito pericárdico"];
const FOCOS = ["Pulmonar", "Urinário", "Abdominal", "Corrente sanguínea", "Pele e partes moles", "SNC", "Indefinido", "Outro"];
const PROF_TVP = ["Sem profilaxia, contraindicada", "Sem profilaxia, não indicada", "Mecânica", "Enoxaparina 40 mg SC 1x/dia", "Heparina 5.000 UI SC 8/8 h"];
const PROF_LAMG = ["Sem profilaxia, não indicada", "Pantoprazol 40 mg EV 1x/dia"];
const NUMERICOS = new Set(["meta_rass", "rass", "escala_valor", "fluxo_l_min", "fio2", "ipap", "epap", "peep", "pinsp", "ps", "vc", "vc_obtido", "pao2", "fr_max", "fr_min", "spo2_max", "spo2_min",
  "pas_max", "pas_min", "pad_max", "pad_min", "pam_max", "pam_min", "fc_max", "fc_min", "tec_s", "dieta_vazao_ml_h", "dx_max", "dx_min", "diurese_ml", "diurese_h", "bh_24h_ml", "uf_ml_h", "uf_ml", "temp_max", "temp_min", "seg", "bast"]);
const rassTxt = (v: unknown): string => { const n = num(v); return n == null ? "" : n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "0"; };
const lista = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

// ---- controles do design -------------------------------------------------------
/** Marcar vários, em blocos soltos. */
function Blocos({ r, ops, v, on }: { r: string; ops: readonly string[]; v: unknown; on: (v: string[]) => void }) {
  const a = lista(v);
  return (
    <span className="ds-blocos" role="group" aria-label={r}>
      {ops.map((o) => { const m = a.includes(o); const troca = () => on(m ? a.filter((x) => x !== o) : [...a, o]);
        return <span key={o} role="checkbox" aria-checked={m} tabIndex={0} className={"ds-bloco" + (m ? " ds-bloco--on" : "")} onClick={troca} onKeyDown={tecla(troca)}>{m ? <Icone n="feito" /> : null}{o}</span>; })}
    </span>
  );
}
function Sel({ r, ops, v, on, numero }: { r: string; ops: readonly (string | readonly [string, string])[]; v: unknown; on: (v: string | null) => void; numero?: boolean }) {
  const atual = txt(v);
  const todas = ops.map((o) => (typeof o === "string" ? ([o, o] as const) : ([o[0], `${o[0]} · ${o[1]}`] as const)));
  return (
    <label className={"ds-f ds-f--sel" + (numero ? " ds-f--n" : "")}>
      <select aria-label={r} value={atual} onChange={(e) => on(e.target.value || null)}>
        <option value=""></option>
        {atual && !todas.some(([k]) => k === atual) ? <option value={atual}>{atual}</option> : null}
        {todas.map(([k, t]) => <option key={k} value={k}>{k === atual ? k : t}</option>)}
      </select>
      <Icone n="abre" />
    </label>
  );
}
const Sub = ({ o, children }: { o?: boolean; children: ReactNode }) => <div className={"ds-ev__sub" + (o ? " ds-de-ontem" : "")}>{children}</div>;
const SubL = ({ children }: { children: ReactNode }) => <div className="ds-ev__v">{children}</div>;
function Sis({ nome, ic, igual, children }: { nome: string; ic: NomeIcone; igual?: () => void; children: ReactNode }) {
  return (
    <section className="ds-ev__sis" data-sis={nome}>
      <div className="ds-ev__cab"><Icone n={ic} /><span>{nome}</span>{igual ? <button className="ds-ev__igual" type="button" onClick={igual}>Igual a ontem</button> : null}</div>
      {children}
    </section>
  );
}
const semEstilo: CSSProperties = { border: 0, outline: 0, padding: 0, margin: 0, background: "none", font: "inherit", color: "inherit", appearance: "none" };

export function Ficha(props: Props) {
  const { pacienteId, leito, dataPlantao, turno, registro, labs, peso, altura, sexo, dispositivos, viaAerea, viaEnteral, svd, hoje, bhAcumulado } = props;
  const rota = useRouter();
  const [st, setSt] = useState<Estado>(props.inicial);
  const [ont, setOnt] = useState(props.ontem);
  const [id, setId] = useState(props.evolucaoId);
  const [sujo, setSujo] = useState(false);
  const [estado, setEstado] = useState<"" | "salvando" | "erro" | "copiado">("");
  const [hora, setHora] = useState(props.salvoEm);
  const [glasgowAberto, setGlasgowAberto] = useState(false);
  const [popAberto, setPopAberto] = useState<"dvas" | "sedativos" | null>(null);
  const [diluAberta, setDiluAberta] = useState<string | null>(null);
  const [atbL, setAtbL] = useState<AtbLocal[]>(() => props.atbs.map((a) => {
    const o = { esquema: a.esquema, inicio: ddmm(a.inicio), inicioIso: a.inicio, previstos: a.previstos != null ? String(a.previstos) : "", fim: a.fim ? ddmm(a.fim) : null };
    return { k: a.id, id: a.id, droga: a.droga, esquema: o.esquema, inicio: o.inicio, previstos: o.previstos, fim: o.fim, orig: o };
  }));
  const [inicioAberto, setInicioAberto] = useState<string | null>(null);
  const [fimAberto, setFimAberto] = useState<string | null>(null);
  const [cultL, setCultL] = useState<CulturaLocal[]>(() => props.culturas.map((c) => ({
    k: c.id, id: c.id, material: c.material, coleta: c.coleta, resultado: c.resultado, germe: c.germe, ufc: c.ufc, s: c.s, r: c.r, coletaTs: c.coletaTs, laudoTs: c.laudoTs,
    orig: { material: c.material, coleta: c.coleta, resultado: c.resultado, germe: c.germe },
  })));
  const proximaChave = useRef(0);
  const novaChave = () => `novo${++proximaChave.current}`;

  // o que veio de ontem aparece em cinza até ser confirmado; mexer num campo do quadro confirma o quadro
  const v = (q: Quadro): Dados => ({ ...(ont[q] ?? {}), ...st[q] });
  const confirma = (q: Quadro) => { if (!ont[q]) return; setSt((s) => ({ ...s, [q]: { ...ont[q], ...s[q] } })); setOnt((o) => { const n = { ...o }; delete n[q]; return n; }); setSujo(true); };
  const set = (q: Quadro, k: string, valor: unknown) => {
    const antes = ont[q];
    setSt((s) => ({ ...s, [q]: { ...(antes ?? {}), ...s[q], [k]: valor } }));
    if (antes) setOnt((o) => { const n = { ...o }; delete n[q]; return n; });
    setSujo(true);
  };
  const neuro = v("neuro"), resp = v("resp"), hemo = v("hemo"), tgi = v("tgi"), renal = v("renal"), hemato = v("hemato"), infecto = v("infecto");

  // ---- o que a ficha calcula (em branco quando falta dado) ----------------------
  const sedando = st.sedativos.some((d) => !d.x);
  const rass = num(neuro.rass);
  const sobSedacao = rass != null && rass <= -4 && sedando;
  const cam = neuro.cam_icu ?? (sobSedacao ? "Não aplicável" : null);
  const semFio2 = resp.suporte === "Cateter O2" || (resp.suporte === "Máscara" && resp.mascara_tipo === "Reservatório");
  const fio2 = resp.suporte === "Ar ambiente" ? 21 : semFio2 ? null : num(resp.fio2);
  const pao2 = num(resp.pao2);
  const pf = pao2 != null && fio2 ? pao2 / (fio2 / 100) : null;
  const predito = pesoPredito(altura, sexo);
  const porKg = (vol: unknown): string => { const n = num(vol); return n != null && predito ? nf(n / predito, 1) : ""; };
  const dMl = num(renal.diurese_ml), dH = num(renal.diurese_h);
  const debito = dMl != null && dH && peso ? nf(dMl / peso / dH, 2) : "";
  const achadosP = (resp.ausculta_achados && typeof resp.ausculta_achados === "object" && !Array.isArray(resp.ausculta_achados) ? resp.ausculta_achados : {}) as Record<string, string[]>;
  const haDias = ((): string => {
    const m = typeof tgi.evacuacao_ultima === "string" ? tgi.evacuacao_ultima.match(/^(\d{1,2})\/(\d{1,2})$/) : null;
    if (!m) return "";
    const n = diasEntre(`${dataPlantao.slice(0, 4)}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`, dataPlantao);
    return n === 0 ? "hoje" : n === 1 ? "há 1 dia" : n > 1 ? `há ${n} dias` : "";
  })();

  // ---- o que entra na evolução: só o que está aberto na hora de salvar ----------
  function linhaDoBanco() {
    const limpa = (d: Dados, fora: string[]): Dados => {
      const o: Dados = {};
      for (const [k, x] of Object.entries(d)) {
        if (fora.includes(k) || x == null || x === "" || (Array.isArray(x) && !x.length)) continue;
        if (typeof x === "object" && !Array.isArray(x) && !Object.keys(x as object).length) continue;
        o[k] = NUMERICOS.has(k) ? num(x) ?? x : x;
      }
      return o;
    };
    const s = st;
    const abertoResp = new Set<string>(
      s.resp.suporte === "VM" ? ["via", "modo", "peep", "fio2", ...(s.resp.modo === "PCV" ? ["pinsp", "vc_obtido"] : s.resp.modo === "PSV" ? ["ps", "vc_obtido"] : s.resp.modo ? ["vc"] : [])]
        : s.resp.suporte === "Cateter O2" ? ["fluxo_l_min"]
        : s.resp.suporte === "Máscara" ? ["mascara_tipo", s.resp.mascara_tipo === "Reservatório" ? "fluxo_l_min" : "fio2", ...(s.resp.mascara_tipo === "Macronebulização" ? ["macro_por"] : [])]
        : s.resp.suporte === "CNAF" ? ["fluxo_l_min", "fio2"]
        : s.resp.suporte === "VNI" ? ["ipap", "epap", "fio2", "vni_uso"] : []);
    const foraResp = ["via", "modo", "peep", "fio2", "pinsp", "ps", "vc", "vc_obtido", "fluxo_l_min", "mascara_tipo", "macro_por", "ipap", "epap", "vni_uso"].filter((k) => !abertoResp.has(k));
    if (s.resp.ausculta !== "Alterada") foraResp.push("ausculta_achados");
    const respD = { ...s.resp };
    if (s.resp.suporte === "VM" && respD.via == null && viaAerea) respD.via = viaAerea.via;
    const tgiD = { ...s.tgi };
    if (s.tgi.dieta === "Enteral" && tgiD.dieta_via == null && viaEnteral) tgiD.dieta_via = viaEnteral;
    const renalD = { ...s.renal };
    if (renalD.diurese_via == null && svd && (renalD.diurese_ml != null && renalD.diurese_ml !== "")) renalD.diurese_via = "SVD";
    const neuroD = { ...s.neuro };
    if (neuroD.cam_icu == null && sobSedacao) neuroD.cam_icu = "Não aplicável";
    const infusoes = (l: Infusao[]): Infusao[] => l.filter((d) => !d.x).map((d) => {
      const dose = doseDe(d.diluicao, d.vazao_ml_h, d.unidade, peso);
      return { droga: d.droga, diluicao: d.diluicao || null, vazao_ml_h: num(d.vazao_ml_h), dose: dose != null ? Math.round(dose * 1000) / 1000 : d.dose ?? null, unidade: d.unidade || null };
    });
    return {
      neuro: limpa(neuroD, [...(s.neuro.pupilas === "Alteradas" ? [] : ["pupilas_anisocoria", "pupilas_achados"]), ...(s.neuro.deficit_focal === "Presente" ? [] : ["deficit_focal_qual"]), ...(s.neuro.escala ? [] : ["escala_valor"])]),
      resp: limpa(respD, foraResp),
      hemo: limpa(s.hemo, [...(s.hemo.ritmo === "Outro" ? [] : ["ritmo_qual"]), ...(s.hemo.ausculta === "Alterada" ? [] : ["ausculta_achados"]), ...(s.hemo.edema && s.hemo.edema !== "0" ? [] : ["edema_onde"])]),
      tgi: limpa(tgiD, [...(s.tgi.dieta === "Enteral" ? [] : ["dieta_via", "dieta_vazao_ml_h"]), ...(s.tgi.evacuacoes === "Não" ? [] : ["evacuacao_ultima"]), ...(s.tgi.abdome === "Alterado" ? [] : ["abdome_achados", "rha"])]),
      renal: limpa(renalD, [...(s.renal.trs === "Contínua" ? [] : ["uf_ml_h"]), ...(s.renal.trs === "Intermitente" ? [] : ["uf_ml", "trs_ultima_sessao"])]),
      hemato: limpa(s.hemato, []), infecto: limpa(s.infecto, []),
      dvas: infusoes(s.dvas), sedativos: infusoes(s.sedativos),
      intercorrencias: s.intercorrencias.filter((i) => !i.x && i.t.trim()).map((i) => i.t.trim()),
      impressao: s.impressao.filter((i) => !i.x && i.t.trim()).map((i) => i.t.trim()),
      condutas_sistemas: s.condutas.filter((c) => !c.x && c.texto.trim()).map((c) => ({ sistema: c.sistema, texto: c.texto.trim() })),
    };
  }

  // ---- antimicrobianos e culturas: só grava o que mudou; linha em branco não vai ao banco ----------
  const inicioIso = (a: AtbLocal): string | null => (a.orig && a.inicio === a.orig.inicio ? a.orig.inicioIso : isoDeDdMm(a.inicio, hoje));
  const diaDoAtb = (a: AtbLocal): number | null => {
    const ini = inicioIso(a);
    const ate = a.fim != null ? isoDeDdMm(a.fim, hoje) : hoje;
    return ini && ate ? diasEntre(ini, ate) + 1 : null;
  };
  type Sb = ReturnType<typeof getSupabaseBrowser>;
  async function gravaAtbs(sb: Sb) {
    let agora = atbL;
    const troca = (k: string, m: Partial<AtbLocal>) => { agora = agora.map((x) => (x.k === k ? { ...x, ...m } : x)); };
    try {
      for (const a of atbL) {
        if (a.x) {
          if (a.id) { const { error } = await sb.from("atbs").delete().eq("id", a.id); if (error) throw error; }
          agora = agora.filter((x) => x.k !== a.k);
          continue;
        }
        const snap = { esquema: a.esquema, inicio: a.inicio, previstos: a.previstos, fim: a.fim };
        if (!a.id) {
          if (!a.droga.trim()) { agora = agora.filter((x) => x.k !== a.k); continue; }
          const ini = a.inicio.trim() ? isoDeDdMm(a.inicio, hoje) : null;
          if (a.inicio.trim() && !ini) throw new Error("início inválido");
          const campos: Record<string, unknown> = { paciente_id: pacienteId, droga: a.droga.trim(), ...esquemaEmColunas(a.esquema), duracao_planejada_dias: diasPrevistos(a.previstos) };
          if (ini) campos.data_inicio = ini;
          const { data, error } = await sb.from("atbs").insert(campos).select("id").single();
          if (error) throw error;
          troca(a.k, { id: (data as { id: string }).id, orig: { ...snap, inicioIso: ini ?? hoje } });
          continue;
        }
        const o = a.orig;
        if (!o) continue;
        const campos: Record<string, unknown> = {};
        if (a.esquema !== o.esquema) Object.assign(campos, esquemaEmColunas(a.esquema));
        if (a.inicio !== o.inicio) { const iso = isoDeDdMm(a.inicio, hoje); if (!iso) throw new Error("início inválido"); campos.data_inicio = iso; }
        if (a.previstos !== o.previstos) campos.duracao_planejada_dias = diasPrevistos(a.previstos);
        if (a.fim !== o.fim) { const iso = a.fim == null ? null : isoDeDdMm(a.fim, hoje); if (a.fim != null && !iso) throw new Error("fim inválido"); campos.data_fim = iso; }
        if (!Object.keys(campos).length) continue;
        const { error } = await sb.from("atbs").update(campos).eq("id", a.id); if (error) throw error;
        troca(a.k, { orig: { ...snap, inicioIso: (campos.data_inicio as string | undefined) ?? o.inicioIso } });
      }
    } finally { setAtbL(agora); }
  }
  async function gravaCulturas(sb: Sb) {
    let agora = cultL;
    const troca = (k: string, m: Partial<CulturaLocal>) => { agora = agora.map((x) => (x.k === k ? { ...x, ...m } : x)); };
    const laudoAgora = (coletaTs: string) => { const n = new Date().toISOString(); return Date.parse(n) >= Date.parse(coletaTs) ? n : coletaTs; };
    try {
      for (const c of cultL) {
        if (c.x) {
          if (c.id) { const { error } = await sb.from("culturas").delete().eq("id", c.id); if (error) throw error; } // o antibiograma sai junto (cascata do banco)
          agora = agora.filter((x) => x.k !== c.k);
          continue;
        }
        const snap = { material: c.material, coleta: c.coleta, resultado: c.resultado, germe: c.germe };
        const agente = c.resultado === "Positiva" && c.germe.trim() ? c.germe.trim() : null;
        if (!c.id) {
          if (!c.material && !c.coleta.trim() && !c.resultado) { agora = agora.filter((x) => x.k !== c.k); continue; }
          const iso = isoDeDdMm(c.coleta, hoje);
          if (!c.material || !CODIGO_MATERIAL[c.material] || !iso) continue; // incompleta: fica na tela, sem gravar
          const coletaTs = iso === hoje ? new Date().toISOString() : `${iso}T12:00:00-03:00`;
          const laudoTs = c.resultado === "Negativa" ? laudoAgora(coletaTs) : null;
          const { data, error } = await sb.from("culturas").insert({ paciente_id: pacienteId, material: CODIGO_MATERIAL[c.material], coleta_ts: coletaTs, laudo_ts: laudoTs, crescimento: c.resultado === "Positiva", agente }).select("id").single();
          if (error) throw error;
          troca(c.k, { id: (data as { id: string }).id, coletaTs, laudoTs, orig: snap });
          continue;
        }
        const o = c.orig;
        if (!o || !c.coletaTs) continue;
        const campos: Record<string, unknown> = {};
        let laudoTs = c.laudoTs ?? null, coletaTs = c.coletaTs;
        if (c.material !== o.material) { if (!CODIGO_MATERIAL[c.material]) throw new Error("material inválido"); campos.material = CODIGO_MATERIAL[c.material]; }
        if (c.coleta !== o.coleta) { const iso = isoDeDdMm(c.coleta, hoje); if (!iso) throw new Error("coleta inválida"); coletaTs = `${iso}T${horaSP(c.coletaTs)}:00-03:00`; campos.coleta_ts = coletaTs; }
        if (c.resultado !== o.resultado) {
          campos.crescimento = c.resultado === "Positiva";
          if (c.resultado === "Em andamento") { laudoTs = null; campos.laudo_ts = null; }
          else if (c.resultado === "Negativa") { laudoTs = laudoTs ?? laudoAgora(coletaTs); campos.laudo_ts = laudoTs; }
        }
        if (c.resultado === "Positiva" && c.germe !== o.germe) campos.agente = agente;
        if (!Object.keys(campos).length) continue;
        const { error } = await sb.from("culturas").update(campos).eq("id", c.id); if (error) throw error;
        troca(c.k, { coletaTs, laudoTs, orig: snap });
      }
    } finally { setCultL(agora); }
  }

  async function salvar(): Promise<boolean> {
    setEstado("salvando");
    try {
      const sb = getSupabaseBrowser();
      const linha = linhaDoBanco();
      let evoId = id;
      if (evoId) { const { error } = await sb.from("evolucoes").update(linha).eq("id", evoId); if (error) throw error; }
      else {
        const { data, error } = await sb.from("evolucoes").insert({ paciente_id: pacienteId, data_plantao: dataPlantao, turno, tipo_nota: "seriada", ...linha }).select("id").single();
        if (error) throw error;
        evoId = (data as { id: string }).id; setId(evoId);
      }
      const pend: PendLocal[] = [];
      for (const p of st.pend) {
        if (p.x) { if (p.id) { const { error } = await sb.from("pendencias").delete().eq("id", p.id); if (error) throw error; } continue; }
        if (!p.tarefa.trim()) continue;
        const campos = { tarefa: p.tarefa.trim(), prioridade: p.prioridade, concluida: p.concluida, concluida_at: p.concluida ? new Date().toISOString() : null };
        if (p.id) { if (p.mudou) { const { error } = await sb.from("pendencias").update(campos).eq("id", p.id); if (error) throw error; } pend.push({ ...p, mudou: false }); }
        else {
          const { data, error } = await sb.from("pendencias").insert({ paciente_id: pacienteId, evolucao_id: evoId, ...campos }).select("id").single();
          if (error) throw error;
          pend.push({ ...p, id: (data as { id: string }).id, mudou: false });
        }
      }
      await gravaAtbs(sb);
      await gravaCulturas(sb);
      setSt((s) => ({
        ...s, pend, dvas: s.dvas.filter((d) => !d.x), sedativos: s.sedativos.filter((d) => !d.x),
        intercorrencias: s.intercorrencias.filter((i) => !i.x && i.t.trim()), impressao: s.impressao.filter((i) => !i.x && i.t.trim()), condutas: s.condutas.filter((c) => !c.x && c.texto.trim()),
      }));
      setSujo(false); setEstado("");
      setHora(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }));
      rota.refresh();
      return true;
    } catch { setEstado("erro"); return false; }
  }

  // ---- texto da evolução, para copiar --------------------------------------------
  function textoDaEvolucao(): string {
    const b = linhaDoBanco();
    const emUso = atbL.filter((a) => !a.x && a.fim == null && a.droga.trim());
    const cultVal = cultL.filter((x) => !x.x && x.material && x.coleta.trim());
    const mm = (d: Dados, k: string, r: string, un: string) => (d[`${k}_max`] != null || d[`${k}_min`] != null ? `${r} ${txt(d[`${k}_max`])}–${txt(d[`${k}_min`])} ${un}${registro[k]?.pilulas.length ? ` (${registro[k].pilulas.join("; ")})` : ""}` : "");
    const c = (r: string, x: unknown, un = "") => (x == null || x === "" ? "" : `${r} ${Array.isArray(x) ? x.join(", ") : txt(x)}${un ? " " + un : ""}`);
    const ex = (cod: string, r: string, un = "") => (labs[cod] && labs[cod].hoje !== "—" ? `${r} ${labs[cod].hoje}${un ? " " + un : ""}` : "");
    const drogas = (l: Infusao[]) => l.map((d) => `${d.droga}${d.dose != null ? ` ${nf(d.dose)} ${d.unidade ?? ""}` : d.vazao_ml_h != null ? ` ${txt(d.vazao_ml_h)} mL/h` : ""}`.trim()).join(", ");
    const achP = Object.entries((b.resp.ausculta_achados ?? {}) as Record<string, string[]>).map(([a, onde]) => `${a}${onde.length ? ` em ${onde.join(" e ")}` : ""}`).join("; ");
    const q: Record<Quadro, string[]> = {
      neuro: [b.sedativos.length ? `Sedação e analgesia: ${drogas(b.sedativos)}` : "", c("meta RASS", rassTxt(b.neuro.meta_rass)), c("RASS", rassTxt(b.neuro.rass)), c("Glasgow", b.neuro.glasgow), b.neuro.escala ? c(String(b.neuro.escala), b.neuro.escala_valor) : "",
        c("analgesia", b.neuro.analgesia), c("CAM-ICU", b.neuro.cam_icu), c("pupilas", b.neuro.pupilas === "Alteradas" ? ["alteradas", b.neuro.pupilas_anisocoria ? `anisocoria ${txt(b.neuro.pupilas_anisocoria)}` : "", ...lista(b.neuro.pupilas_achados)].filter(Boolean).join(", ") : b.neuro.pupilas),
        c("déficit focal", b.neuro.deficit_focal === "Presente" && b.neuro.deficit_focal_qual ? b.neuro.deficit_focal_qual : b.neuro.deficit_focal)],
      resp: [c("suporte", b.resp.suporte), c("via", b.resp.via), c("modo", b.resp.modo), c("máscara", b.resp.mascara_tipo), c("por", b.resp.macro_por), c("fluxo", b.resp.fluxo_l_min, "L/min"), c("IPAP", b.resp.ipap), c("EPAP", b.resp.epap, "cmH2O"), c("uso", b.resp.vni_uso),
        c("PEEP", b.resp.peep, "cmH2O"), c("FiO2", b.resp.fio2, "%"), c("Pinsp", b.resp.pinsp, "cmH2O"), c("PS", b.resp.ps, "cmH2O"), c("VC", b.resp.vc, "mL"), c("VC obtido", b.resp.vc_obtido, "mL"),
        ex("ph", "pH"), ex("pco2", "pCO2"), c("PaO2", b.resp.pao2, "mmHg"), ex("hco3", "HCO3"), pf != null ? `P/F ${nf(pf, 0)}` : "", mm(b.resp, "fr", "FR", "ipm"), mm(b.resp, "spo2", "SpO2", "%"),
        c("ausculta", b.resp.ausculta === "Alterada" ? achP || "alterada" : b.resp.ausculta)],
      hemo: [b.dvas.length ? `Vasoativos: ${drogas(b.dvas)}` : "", mm(b.hemo, "pas", "PAS", "mmHg"), mm(b.hemo, "pad", "PAD", "mmHg"), mm(b.hemo, "pam", "PAM", "mmHg"), mm(b.hemo, "fc", "FC", "bpm"),
        c("ritmo", b.hemo.ritmo === "Outro" && b.hemo.ritmo_qual ? b.hemo.ritmo_qual : b.hemo.ritmo), ex("lactato", "lactato", "mmol/L"), c("TEC", b.hemo.tec_s, "s"), c("extremidades", b.hemo.extremidades), c("pulsos", b.hemo.pulsos),
        c("ausculta", b.hemo.ausculta === "Alterada" ? lista(b.hemo.ausculta_achados).join(", ") || "alterada" : b.hemo.ausculta), c("edema", b.hemo.edema ? `${txt(b.hemo.edema)}${lista(b.hemo.edema_onde).length ? ` em ${lista(b.hemo.edema_onde).join(" e ")}` : ""}` : "")],
      tgi: [c("dieta", [b.tgi.dieta, b.tgi.parenteral ? "parenteral" : ""].filter(Boolean).join(" + ")), c("via", b.tgi.dieta_via), c("vazão", b.tgi.dieta_vazao_ml_h, "mL/h"), mm(b.tgi, "dx", "Dx", "mg/dL"), ex("bb", "bilirrubina total", "mg/dL"),
        c("evacuações", b.tgi.evacuacoes === "Não" && b.tgi.evacuacao_ultima ? `não, última em ${txt(b.tgi.evacuacao_ultima)}` : b.tgi.evacuacoes), c("abdome", b.tgi.abdome === "Alterado" ? [...lista(b.tgi.abdome_achados), b.tgi.rha ? `RHA ${txt(b.tgi.rha).toLowerCase()}` : ""].filter(Boolean).join(", ") || "alterado" : b.tgi.abdome)],
      renal: [c("diurese", b.renal.diurese_ml != null ? `${txt(b.renal.diurese_ml)} mL${b.renal.diurese_h != null ? ` em ${txt(b.renal.diurese_h)} h` : ""}${debito ? ` (${debito} mL/kg/h)` : ""}${b.renal.diurese_via ? `, ${txt(b.renal.diurese_via)}` : ""}` : b.renal.diurese_via),
        c("BH", b.renal.bh_24h_ml != null ? sinal(num(b.renal.bh_24h_ml)) : "", "mL"), bhAcumulado != null ? `acumulado ${sinal(bhAcumulado)} mL` : "", ex("ur", "ureia", "mg/dL"), ex("cr", "creatinina", "mg/dL"), ex("na", "Na"), ex("k", "K"), ex("mg", "Mg"), ex("cai", "Cai"),
        c("TRS", b.renal.trs), c("UF líquida", b.renal.uf_ml_h, "mL/h"), c("UF", b.renal.uf_ml, "mL"), c("última sessão", b.renal.trs_ultima_sessao)],
      hemato: [ex("hb", "Hb", "g/dL"), ex("ht", "Ht", "%"), ex("plaq", "Plaq", "×10³/µL"), c("profilaxia de TVP:", b.hemato.profilaxia_tvp), c("profilaxia de LAMG:", b.hemato.profilaxia_lamg)],
      infecto: [mm(b.infecto, "temp", "temperatura", "°C"), ex("leuco", "leucócitos", "×10³/µL"), c("Seg", b.infecto.seg, "%"), c("Bast", b.infecto.bast, "%"), c("foco", b.infecto.foco),
        dispositivos.length ? `dispositivos: ${dispositivos.map((d) => `${d.nome} D${d.d}`).join(", ")}` : "", emUso.length ? `antimicrobianos: ${emUso.map((a) => `${a.droga} ${a.esquema} D${diaDoAtb(a) ?? "—"}${a.previstos ? ` de ${a.previstos}` : ""}`.replace(/\s+/g, " ")).join("; ")}` : "",
        cultVal.length ? `culturas: ${cultVal.map((x) => `${x.material} ${x.coleta} ${x.resultado.toLowerCase()}${x.resultado === "Positiva" && x.germe ? ` (${x.germe})` : ""}`).join("; ")}` : ""],
    };
    const blocos: string[] = [`Evolução de ${ddmmaaaa(dataPlantao)}, ${TURNO[turno]} · leito ${leito}`];
    if (b.intercorrencias.length) blocos.push("Intercorrências 24 h\n" + b.intercorrencias.map((t) => `- ${t}`).join("\n"));
    const sis = QUADROS.map((x) => { const partes = [...q[x.k].filter(Boolean), ...(b[x.k].notas ? [txt(b[x.k].notas)] : [])]; return partes.length ? `${x.nome}: ${partes.join("; ")}` : ""; }).filter(Boolean);
    if (sis.length) blocos.push(sis.join("\n"));
    if (b.impressao.length) blocos.push("Impressão clínica / problemas\n" + b.impressao.map((t, i) => `${i + 1}. ${t}`).join("\n"));
    if (b.condutas_sistemas.length) blocos.push("Plano de conduta 24 h\n" + b.condutas_sistemas.map((x) => `- ${x.sistema}: ${x.texto}`).join("\n"));
    const pend = st.pend.filter((p) => !p.x && p.tarefa.trim());
    if (pend.length) blocos.push("Pendências / riscos\n" + pend.map((p) => `- ${p.tarefa.trim()} (P${p.prioridade})${p.concluida ? " — feita" : ""}`).join("\n"));
    return blocos.join("\n\n");
  }

  // Ctrl+S salva; trocar de leito ou de tela com alteração não salva grava antes de sair, sem perguntar.
  const sujoRef = useRef(sujo); sujoRef.current = sujo;
  const salvarRef = useRef(salvar); salvarRef.current = salvar;
  useEffect(() => {
    const clique = (e: MouseEvent) => {
      if (!sujoRef.current || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      const href = a?.getAttribute("href");
      if (!a || !href || !href.startsWith("/") || a.target === "_blank") return;
      e.preventDefault(); e.stopPropagation();
      void salvarRef.current().then((ok) => { if (ok) rota.push(href); });
    };
    const atalho = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); void salvarRef.current(); } };
    const sair = (e: BeforeUnloadEvent) => { if (sujoRef.current) e.preventDefault(); };
    document.addEventListener("click", clique, true); document.addEventListener("keydown", atalho); window.addEventListener("beforeunload", sair);
    return () => { document.removeEventListener("click", clique, true); document.removeEventListener("keydown", atalho); window.removeEventListener("beforeunload", sair); };
  }, [rota]);

  // ---- peças que se repetem nos quadros -------------------------------------------
  const numG = (q: Quadro, m: string, r: string, k: string, un?: string, larg?: number) => <G><M>{m}</M><Num r={r} v={v(q)[k]} on={(x) => set(q, k, x)} larg={larg} />{un ? <U>{un}</U> : null}</G>;
  const notas = (q: Quadro, nome: string) => <Linha r="Notas"><Area r={`Notas de ${nome}`} v={v(q).notas} on={(x) => set(q, "notas", x)} /></Linha>;
  const exame = (c: string, m?: string, un?: string) => (
    <span className="ds-ev__calc ds-ev__ex">{m ? <M>{m}</M> : null}<Link href={`/exames?leito=${leito}`} title="Corrigir na tela Exames"><b>{labs[c]?.hoje ?? "—"}</b></Link>{un ? <U>{un}</U> : null}</span>
  );
  const serie = (c: string, un: string) => (
    <G cls="ds-ev__serie">{(labs[c]?.antes ?? []).map((a, i) => <Fragment key={i}><span className="ds-ev__ant">{a}</span><Icone n="seta" className="ds-ev__seta" /></Fragment>)}{exame(c)}<U>{un}</U></G>
  );
  const maxMin = (q: Quadro, r: string, k: string, un: string) => {
    const d = v(q), reg = registro[k];
    const corrigido = !!reg && ((reg.max != null && txt(d[`${k}_max`]) !== "" && num(d[`${k}_max`]) !== reg.max) || (reg.min != null && txt(d[`${k}_min`]) !== "" && num(d[`${k}_min`]) !== reg.min));
    return (
      <Linha r={r}>
        <G cls="ds-ev__mm"><Num r={`${r} máxima`} v={d[`${k}_max`]} on={(x) => set(q, `${k}_max`, x)} /><span className="ds-ev__tr">–</span><Num r={`${r} mínima`} v={d[`${k}_min`]} on={(x) => set(q, `${k}_min`, x)} /><U fixa>{un}</U></G>
        {corrigido ? <span className="ds-ev__corr">corrigido</span> : null}
        {reg?.pilulas.map((p) => <span key={p} className="ds-flag">{p}</span>)}
      </Linha>
    );
  };
  const drogas = (titulo: string, campo: "dvas" | "sedativos", catalogo: readonly (readonly [string, string, string])[], aoLado?: ReactNode) => {
    const l = st[campo];
    const muda = (i: number, m: Partial<Infusao>) => { setSt((s) => ({ ...s, [campo]: s[campo].map((d, j) => (j === i ? { ...d, ...m } : d)) })); setSujo(true); };
    const fora = catalogo.filter(([nome]) => !l.some((d) => d.droga === nome));
    return (
      <div className="ds-ev__bloco">
        {aoLado ? <div className="ds-ev__rl"><span className="ds-ev__r">{titulo}</span>{aoLado}</div> : <span className="ds-ev__r">{titulo}</span>}
        <div className="ds-ev__drogas">
          {l.map((d, i) => {
            const dose = doseDe(d.diluicao, d.vazao_ml_h, d.unidade, peso);
            const chave = `${campo}:${d.droga}`;
            const opcoes: string[] = [...(d.diluicao && !(DILUICOES as readonly string[]).includes(d.diluicao) ? [d.diluicao] : []), ...DILUICOES];
            return (
              <Fragment key={d.droga}>
                <div className={"ds-ev__droga" + (d.x ? " ds-removido" : "")} onClick={d.x ? () => muda(i, { x: false }) : undefined}>
                  <span className="ds-ev__dn"><b>{d.droga}</b>
                    <button className="ds-ev__dil" type="button" aria-label={`Diluição de ${d.droga}: ${d.diluicao || "não definida"}. Trocar`} aria-expanded={diluAberta === chave}
                      onClick={(e) => { e.stopPropagation(); if (!d.x) setDiluAberta(diluAberta === chave ? null : chave); }}>{d.diluicao || "diluição"}<Icone n="abre" /></button>
                  </span>
                  <G><Num r={`Vazão de ${d.droga}`} v={d.vazao_ml_h} on={(x) => muda(i, { vazao_ml_h: x })} /><U>mL/h</U></G>
                  <span className="ds-ev__dose"><b>{dose != null ? nf(dose) : ""}</b> {d.unidade ?? ""}</span>
                  <button className="ds-lista__x" type="button" aria-label={d.x ? `Trazer ${d.droga} de volta` : `Tirar ${d.droga}`} onClick={(e) => { e.stopPropagation(); muda(i, { x: !d.x }); }}><Icone n={d.x ? "desfazer" : "x"} /></button>
                </div>
                {diluAberta === chave && !d.x ? (
                  <span className="ds-pop" role="listbox" aria-label={`Diluições de ${d.droga}`} style={{ gridColumn: "1 / -1", justifySelf: "start" }}>
                    {opcoes.map((o) => { const escolhe = () => { muda(i, { diluicao: o }); setDiluAberta(null); };
                      return <span key={o} role="option" aria-selected={o === d.diluicao} tabIndex={0} className={o === d.diluicao ? "ds-pop--on" : undefined} style={{ cursor: "pointer" }} onClick={escolhe} onKeyDown={tecla(escolhe)}>{o}</span>; })}
                  </span>
                ) : null}
              </Fragment>
            );
          })}
          {popAberto === campo ? (
            <span className="ds-pop" role="listbox" aria-label={`${titulo} fora de uso`} style={{ gridColumn: "1 / -1", justifySelf: "start" }}>
              {fora.map(([nome, dil, un]) => { const poe = () => { setSt((s) => ({ ...s, [campo]: [...s[campo], { droga: nome, diluicao: dil, vazao_ml_h: "", unidade: un }] })); setPopAberto(null); setSujo(true); };
                return <span key={nome} role="option" aria-selected={false} tabIndex={0} style={{ cursor: "pointer" }} onClick={poe} onKeyDown={tecla(poe)}>{nome}</span>; })}
            </span>
          ) : fora.length ? <button className="ds-link" type="button" onClick={() => setPopAberto(campo)}><Icone n="mais" />Adicionar droga</button> : null}
        </div>
      </div>
    );
  };
  const listaTexto = (titulo: string, campo: "intercorrencias" | "impressao", nome: string, nota: string, numerada: boolean) => {
    const muda = (i: number, m: Partial<Item>) => { setSt((s) => ({ ...s, [campo]: s[campo].map((it, j) => (j === i ? { ...it, ...m } : it)) })); setSujo(true); };
    return (
      <section className="ds-painel">
        <div className="ds-painel__cab"><div><h3 className="ds-painel__titulo">{titulo}</h3><span className="ds-painel__nota">{nota}</span></div></div>
        <div className="ds-painel__corpo"><div className="ds-lista">
          {st[campo].map((it, i) => (
            <div key={i} className={"ds-lista__item" + (it.x ? " ds-riscado" : "")}>
              {numerada ? <span className="ds-lista__n">{i + 1}</span> : null}
              <Area r={numerada ? `${nome} ${i + 1}` : nome} v={it.t} on={(x) => muda(i, { t: x })} />
              <button className="ds-lista__x" type="button" aria-label={it.x ? "Trazer de volta" : `Remover ${nome.toLowerCase()}`} onClick={() => muda(i, { x: !it.x })}><Icone n={it.x ? "desfazer" : "x"} /></button>
            </div>
          ))}
          <button className="ds-link" type="button" onClick={() => { setSt((s) => ({ ...s, [campo]: [...s[campo], { t: "" }] })); setSujo(true); }}><Icone n="mais" />Adicionar {nome.toLowerCase()}</button>
        </div></div>
      </section>
    );
  };
  const mudaConduta = (i: number, m: Partial<Conduta & { x?: boolean }>) => { setSt((s) => ({ ...s, condutas: s.condutas.map((c, j) => (j === i ? { ...c, ...m } : c)) })); setSujo(true); };
  const mudaPend = (i: number, m: Partial<PendLocal>) => { setSt((s) => ({ ...s, pend: s.pend.map((p, j) => (j === i ? { ...p, ...m, mudou: true } : p)) })); setSujo(true); };

  return (
    <>
      <header className="ds-topo ds-topo--fixo">
        <h1>Evolução</h1>
        <div className="ds-topo__acoes">
          <span className="ds-topo__estado" role="status">
            {estado === "erro" ? <>Não salvo, sem conexão<button className="ds-link" type="button" onClick={() => void salvar()}>Tentar de novo</button></>
              : estado === "salvando" ? "Salvando" : sujo ? "Alterações não salvas" : hora ? `Salvo às ${hora}` : ""}
          </span>
          <button className="ds-btn" type="button" onClick={async () => { await navigator.clipboard.writeText(textoDaEvolucao()); setEstado("copiado"); setTimeout(() => setEstado((e) => (e === "copiado" ? "" : e)), 2000); }}>
            <Icone n={estado === "copiado" ? "feito" : "copiar"} />{estado === "copiado" ? "Copiada" : "Copiar evolução"}
          </button>
          <button className="ds-btn ds-btn--primario" type="button" disabled={estado === "salvando"} onClick={() => void salvar()}><Icone n="feito" />Salvar evolução</button>
        </div>
      </header>
      <main className="ds-conteudo">
        {props.children}
        {listaTexto("Intercorrências 24 h", "intercorrencias", "Intercorrência", "a mesma lista do muda-conduta da Passagem", false)}
        <section className="ds-painel">
          <div className="ds-painel__cab"><div><h3 className="ds-painel__titulo">Sistemas</h3></div></div>
          <div className="ds-painel__corpo">
            <div className="ds-ev">
              <div className="ds-ev__col">
                <Sis nome="Neuro" ic="neuro">
                  {drogas("Sedação e analgesia", "sedativos", DROGAS_SEDACAO, <G><M>meta RASS</M><Sel r="Meta de RASS" numero ops={RASS} v={rassTxt(neuro.meta_rass)} on={(x) => set("neuro", "meta_rass", x)} /></G>)}
                  <Linha r="RASS">
                    <Sel r="RASS" numero ops={RASS} v={rassTxt(neuro.rass)} on={(x) => set("neuro", "rass", x)} />
                    {sobSedacao && !glasgowAberto && !txt(neuro.glasgow)
                      ? <G><M>Glasgow</M><button className="ds-ev__sob" type="button" aria-label="Glasgow: sob sedação. Tocar para anotar mesmo assim" onClick={() => setGlasgowAberto(true)}>sob sedação</button></G>
                      : <G><M>Glasgow</M><Num r="Glasgow" v={neuro.glasgow} on={(x) => set("neuro", "glasgow", x)} /></G>}
                    {neuro.escala
                      ? <G><Seg r="Escala" ops={["FOUR", "NIHSS"]} v={neuro.escala} on={(x) => set("neuro", "escala", x)} /><Num r={String(neuro.escala)} v={neuro.escala_valor} on={(x) => set("neuro", "escala_valor", x)} /></G>
                      : <button className="ds-link" type="button" onClick={() => set("neuro", "escala", "FOUR")}><Icone n="mais" />FOUR ou NIHSS</button>}
                  </Linha>
                  <Linha r="Analgesia"><Seg r="Analgesia" ops={["Adequada", "Inadequada"]} v={neuro.analgesia} on={(x) => set("neuro", "analgesia", x)} /></Linha>
                  <Linha r="CAM-ICU"><Seg r="CAM-ICU" ops={CAM} v={cam} on={(x) => set("neuro", "cam_icu", x)} /></Linha>
                  <Linha r="Pupilas"><Seg r="Pupilas" ops={PUPILAS} v={neuro.pupilas} on={(x) => set("neuro", "pupilas", x)} /></Linha>
                  {neuro.pupilas === "Alteradas" ? (
                    <Sub><SubL>
                      <G><M>Anisocoria</M><Seg r="Anisocoria: pupila maior" ops={["D > E", "E > D"]} v={neuro.pupilas_anisocoria} on={(x) => set("neuro", "pupilas_anisocoria", x)} /></G>
                      <Blocos r="Outros achados das pupilas" ops={["Não fotorreagentes", "Mióticas", "Midriáticas"]} v={neuro.pupilas_achados} on={(x) => set("neuro", "pupilas_achados", x)} />
                    </SubL></Sub>
                  ) : null}
                  <Linha r="Déficit focal">
                    <Seg r="Déficit focal" ops={DEFICIT} v={neuro.deficit_focal} on={(x) => set("neuro", "deficit_focal", x)} />
                    {neuro.deficit_focal === "Presente" ? <Txt r="Qual déficit" v={neuro.deficit_focal_qual} on={(x) => set("neuro", "deficit_focal_qual", x)} /> : null}
                  </Linha>
                  {notas("neuro", "Neuro")}
                </Sis>
                <Sis nome="Resp" ic="resp" igual={ont.resp ? () => confirma("resp") : undefined}>
                  <Linha r="Suporte" o={!!ont.resp}><Seg r="Suporte" cls="ds-ev__sup" ops={SUPORTES} v={resp.suporte} on={(x) => set("resp", "suporte", x)} /></Linha>
                  {resp.suporte === "Cateter O2" ? <Sub o={!!ont.resp}><SubL>{numG("resp", "Fluxo", "Fluxo de oxigênio", "fluxo_l_min", "L/min")}</SubL></Sub> : null}
                  {resp.suporte === "Máscara" ? (
                    <Sub o={!!ont.resp}>
                      <SubL>
                        <G><M>Tipo</M><Seg r="Tipo de máscara" ops={MASCARAS} v={resp.mascara_tipo} on={(x) => set("resp", "mascara_tipo", x)} /></G>
                        {resp.mascara_tipo === "Reservatório" ? numG("resp", "Fluxo", "Fluxo de oxigênio", "fluxo_l_min", "L/min") : resp.mascara_tipo ? numG("resp", "FiO2", "FiO2", "fio2", "%") : null}
                      </SubL>
                      {resp.mascara_tipo === "Macronebulização" ? <SubL><G><M>por</M><Seg r="Macronebulização por" ops={["Face", "TQT"]} v={resp.macro_por} on={(x) => set("resp", "macro_por", x)} /></G></SubL> : null}
                    </Sub>
                  ) : null}
                  {resp.suporte === "CNAF" ? <Sub o={!!ont.resp}><SubL>{numG("resp", "Fluxo", "Fluxo da CNAF", "fluxo_l_min", "L/min")}{numG("resp", "FiO2", "FiO2", "fio2", "%")}</SubL></Sub> : null}
                  {resp.suporte === "VNI" ? (
                    <Sub o={!!ont.resp}>
                      <SubL>{numG("resp", "IPAP", "IPAP", "ipap")}{numG("resp", "EPAP", "EPAP", "epap", "cmH2O")}{numG("resp", "FiO2", "FiO2", "fio2", "%")}</SubL>
                      <SubL><G><M>Uso</M><Seg r="Uso da VNI" ops={["Intermitente", "Contínuo"]} v={resp.vni_uso} on={(x) => set("resp", "vni_uso", x)} /></G></SubL>
                    </Sub>
                  ) : null}
                  {resp.suporte === "VM" ? (
                    <Sub o={!!ont.resp}>
                      <SubL>
                        <G><M>Via</M><Seg r="Via da ventilação" ops={["IOT", "TQT"]} v={resp.via ?? viaAerea?.via ?? null} on={(x) => set("resp", "via", x)} /></G>
                        {viaAerea ? <G><M>desde</M><span className="ds-ev__ro"><b>{viaAerea.desde}</b></span><span className="ds-ev__c">D{viaAerea.d}</span></G> : null}
                      </SubL>
                      <SubL><G><M>Modo</M><Seg r="Modo ventilatório" ops={MODOS} v={resp.modo} on={(x) => set("resp", "modo", x)} /></G>{numG("resp", "PEEP", "PEEP", "peep", "cmH2O")}{numG("resp", "FiO2", "FiO2", "fio2", "%")}</SubL>
                      {resp.modo ? (
                        <SubL>
                          {resp.modo === "PCV" ? numG("resp", "Pinsp", "Pinsp", "pinsp", "cmH2O") : resp.modo === "PSV" ? numG("resp", "PS", "PS", "ps", "cmH2O") : null}
                          {(() => { const k = resp.modo === "PCV" || resp.modo === "PSV" ? "vc_obtido" : "vc"; const r = k === "vc" ? "VC" : "VC obtido";
                            return <G><M>{r}</M><Num r={r} v={resp[k]} on={(x) => set("resp", k, x)} /><U>mL</U><span className="ds-ev__calc" title="mL por kg de peso predito (altura e sexo)"><b>{porKg(resp[k])}</b><U>mL/kg</U></span></G>; })()}
                        </SubL>
                      ) : null}
                    </Sub>
                  ) : null}
                  <Linha r="Gasometria">
                    {exame("ph", "pH")}{exame("pco2", "pCO2")}{numG("resp", "PaO2", "PaO2", "pao2", "mmHg")}{exame("hco3", "HCO3")}
                    {semFio2 ? <G><M>P/F</M><span className="ds-ev__c">sem FiO2</span></G> : <span className="ds-ev__calc"><M>P/F</M><b>{pf != null ? nf(pf, 0) : ""}</b></span>}
                  </Linha>
                  {maxMin("resp", "FR", "fr", "ipm")}
                  {maxMin("resp", "SpO2", "spo2", "%")}
                  <Linha r="Ausculta"><Seg r="Ausculta pulmonar" ops={AUSCULTA_P} v={resp.ausculta} on={(x) => set("resp", "ausculta", x)} /></Linha>
                  {resp.ausculta === "Alterada" ? (
                    <Sub>
                      <SubL><Blocos r="Achados da ausculta" ops={ACHADOS_P} v={Object.keys(achadosP)} on={(l) => set("resp", "ausculta_achados", Object.fromEntries(l.map((a) => [a, achadosP[a] ?? []])))} /></SubL>
                      {ACHADOS_P.filter((a) => a in achadosP).map((a) => <SubL key={a}><M>{a} em</M><Blocos r={`Onde: ${a}`} ops={LOCAIS_P} v={achadosP[a]} on={(l) => set("resp", "ausculta_achados", { ...achadosP, [a]: l })} /></SubL>)}
                    </Sub>
                  ) : null}
                  {notas("resp", "Resp")}
                </Sis>
                <Sis nome="Cardio-hemodinâmica" ic="cardio">
                  {drogas("Vasoativos", "dvas", DROGAS_VASOATIVAS)}
                  {maxMin("hemo", "PAS", "pas", "mmHg")}
                  {maxMin("hemo", "PAD", "pad", "mmHg")}
                  {maxMin("hemo", "PAM", "pam", "mmHg")}
                  {maxMin("hemo", "FC", "fc", "bpm")}
                  <Linha r="Ritmo">
                    <Seg r="Ritmo" ops={["Sinusal", "FA", "Outro"]} v={hemo.ritmo} on={(x) => set("hemo", "ritmo", x)} />
                    {hemo.ritmo === "Outro" ? <Txt r="Qual ritmo" larg={200} v={hemo.ritmo_qual} on={(x) => set("hemo", "ritmo_qual", x)} /> : null}
                  </Linha>
                  <Linha r="Lactato">{serie("lactato", "mmol/L")}</Linha>
                  <Linha r="Perfusão">{numG("hemo", "TEC", "Tempo de enchimento capilar", "tec_s", "s")}<G><M>Extremidades</M><Seg r="Extremidades" ops={["Quentes", "Frias"]} v={hemo.extremidades} on={(x) => set("hemo", "extremidades", x)} /></G></Linha>
                  <Linha r="Pulsos"><Seg r="Pulsos" ops={["Cheios", "Finos", "Ausentes"]} v={hemo.pulsos} on={(x) => set("hemo", "pulsos", x)} /></Linha>
                  <Linha r="Ausculta"><Seg r="Ausculta cardíaca" ops={AUSCULTA_C} v={hemo.ausculta} on={(x) => set("hemo", "ausculta", x)} /></Linha>
                  {hemo.ausculta === "Alterada" ? <Sub><SubL><Blocos r="Achados da ausculta cardíaca" ops={ACHADOS_C} v={hemo.ausculta_achados} on={(x) => set("hemo", "ausculta_achados", x)} /></SubL></Sub> : null}
                  <Linha r="Edema">
                    <Seg r="Edema" numero ops={["0", "1+", "2+", "3+", "4+"]} v={hemo.edema} on={(x) => set("hemo", "edema", x)} />
                    {hemo.edema && hemo.edema !== "0" ? <Blocos r="Onde está o edema" ops={["MMII", "MMSS", "Generalizado"]} v={hemo.edema_onde} on={(x) => set("hemo", "edema_onde", x)} /> : null}
                  </Linha>
                  {notas("hemo", "Cardio-hemodinâmica")}
                </Sis>
              </div>
              <div className="ds-ev__col">
                <Sis nome="TGI" ic="tgi" igual={ont.tgi ? () => confirma("tgi") : undefined}>
                  <Linha r="Dieta" o={!!ont.tgi}>
                    <Seg r="Dieta" ops={["Zero", "Oral", "Enteral"]} v={tgi.dieta} on={(x) => set("tgi", "dieta", x)} />
                    <Blocos r="Dieta parenteral" ops={["Parenteral"]} v={tgi.parenteral ? ["Parenteral"] : []} on={(l) => set("tgi", "parenteral", l.length > 0)} />
                  </Linha>
                  {tgi.dieta === "Enteral" ? (
                    <Sub o={!!ont.tgi}><SubL>
                      <G><M>Via</M><Seg r="Via da dieta enteral" ops={["SNE", "SNG", "GTT"]} v={tgi.dieta_via ?? viaEnteral} on={(x) => set("tgi", "dieta_via", x)} /></G>
                      {numG("tgi", "Vazão", "Vazão da dieta enteral", "dieta_vazao_ml_h", "mL/h")}
                    </SubL></Sub>
                  ) : null}
                  {maxMin("tgi", "Dx", "dx", "mg/dL")}
                  <Linha r="Bilirrubina total">{exame("bb", undefined, "mg/dL")}</Linha>
                  <Linha r="Evacuações">
                    <Seg r="Evacuações" ops={["Sim", "Não"]} v={tgi.evacuacoes} on={(x) => set("tgi", "evacuacoes", x)} />
                    {tgi.evacuacoes === "Não" ? <G><M>última</M><Num r="Data da última evacuação" larg={64} v={tgi.evacuacao_ultima} on={(x) => set("tgi", "evacuacao_ultima", x)} />{haDias ? <span className="ds-ev__c">{haDias}</span> : null}</G> : null}
                  </Linha>
                  <Linha r="Abdome"><Seg r="Abdome" ops={["Flácido, RHA +", "Alterado"]} v={tgi.abdome} on={(x) => set("tgi", "abdome", x)} /></Linha>
                  {tgi.abdome === "Alterado" ? (
                    <Sub>
                      <SubL><Blocos r="Achados do abdome" ops={["Distendido", "Tenso", "Doloroso", "Sinais de peritonite"]} v={tgi.abdome_achados} on={(x) => set("tgi", "abdome_achados", x)} /></SubL>
                      <SubL><G><M>RHA</M><Seg r="Ruídos hidroaéreos" ops={["Diminuídos", "Ausentes", "Aumentados"]} v={tgi.rha} on={(x) => set("tgi", "rha", x)} /></G></SubL>
                    </Sub>
                  ) : null}
                  {notas("tgi", "TGI")}
                </Sis>
                <Sis nome="Renal" ic="renal" igual={ont.renal ? () => confirma("renal") : undefined}>
                  <Linha r="Diurese">
                    <Seg r="Diurese: por onde sai" ops={["Espontânea", "SVD"]} v={renal.diurese_via ?? (svd ? "SVD" : null)} on={(x) => set("renal", "diurese_via", x)} />
                    <G><Num r="Volume de diurese" v={renal.diurese_ml} on={(x) => set("renal", "diurese_ml", x)} /><U>mL em</U><Num r="Horas do volume de diurese" larg={36} v={renal.diurese_h} on={(x) => set("renal", "diurese_h", x)} /><U>h</U></G>
                    <span className="ds-ev__calc"><b>{debito}</b><U>mL/kg/h</U></span>
                  </Linha>
                  <Linha r="BH">
                    <G><Num r="Balanço hídrico de 24 h" larg={64} v={typeof renal.bh_24h_ml === "number" ? sinal(renal.bh_24h_ml) : renal.bh_24h_ml} on={(x) => set("renal", "bh_24h_ml", x)} /><U>mL</U></G>
                    <span className="ds-ev__calc"><M>acumulado</M><b>{bhAcumulado != null ? sinal(bhAcumulado) : ""}</b><U>mL</U></span>
                  </Linha>
                  <Linha r="Ureia">{serie("ur", "mg/dL")}</Linha>
                  <Linha r="Creatinina">{serie("cr", "mg/dL")}</Linha>
                  <Linha r="Eletrólitos">{exame("na", "Na")}{exame("k", "K")}{exame("mg", "Mg")}{exame("cai", "Cai")}</Linha>
                  <Linha r="TRS" o={!!ont.renal}><Seg r="TRS" ops={["Não", "Intermitente", "Contínua"]} v={renal.trs} on={(x) => set("renal", "trs", x)} /></Linha>
                  {renal.trs === "Contínua" ? <Sub o={!!ont.renal}><SubL>{numG("renal", "UF líquida", "UF líquida", "uf_ml_h", "mL/h")}</SubL></Sub> : null}
                  {renal.trs === "Intermitente" ? <Sub o={!!ont.renal}><SubL>{numG("renal", "UF", "UF da sessão", "uf_ml", "mL")}{numG("renal", "Última sessão", "Data da última sessão, dia e mês", "trs_ultima_sessao", "dd/mm", 64)}</SubL></Sub> : null}
                  {notas("renal", "Renal")}
                </Sis>
                <Sis nome="Hemato" ic="hemato">
                  <Linha r="Hemograma">{exame("hb", "Hb", "g/dL")}{exame("ht", "Ht", "%")}{exame("plaq", "Plaq", "×10³/µL")}</Linha>
                  <Linha r="Profilaxias">
                    <span className="ds-ev__prof">
                      <M>TVP</M><Sel r="Profilaxia de TVP" ops={PROF_TVP} v={hemato.profilaxia_tvp} on={(x) => set("hemato", "profilaxia_tvp", x)} />
                      <M>LAMG</M><Sel r="Profilaxia de LAMG" ops={PROF_LAMG} v={hemato.profilaxia_lamg} on={(x) => set("hemato", "profilaxia_lamg", x)} />
                    </span>
                  </Linha>
                  {notas("hemato", "Hemato")}
                </Sis>
                <Sis nome="Infecto" ic="infecto" igual={ont.infecto ? () => confirma("infecto") : undefined}>
                  {maxMin("infecto", "Temperatura", "temp", "°C")}
                  <Linha r="Leucócitos">{serie("leuco", "×10³/µL")}<G cls="ds-ev__dif">{numG("infecto", "Seg", "Segmentados", "seg", "%", 36)}{numG("infecto", "Bast", "Bastões", "bast", "%", 36)}</G></Linha>
                  <Linha r="Foco" o={!!ont.infecto}><Sel r="Foco" ops={FOCOS} v={infecto.foco} on={(x) => set("infecto", "foco", x)} /></Linha>
                  <Linha r="Dispositivos">{dispositivos.map((d) => <span key={d.nome} className="ds-ev__ro ds-ev__disp">{d.nome} · <b>D{d.d}</b></span>)}</Linha>
                  <div className="ds-ev__bloco">
                    <span className="ds-ev__r">Antimicrobianos</span>
                    <div className="ds-ev__lista ds-ev__lista--atb">
                      {atbL.filter((a) => a.fim == null).map((a) => {
                        const novo = !a.id;
                        const nome = a.droga || "antimicrobiano novo";
                        const n = diaDoAtb(a);
                        const muda = (m: Partial<AtbLocal>) => { setAtbL((l) => l.map((x) => (x.k === a.k ? { ...x, ...m } : x))); setSujo(true); };
                        const linha = (
                          <>
                            {novo ? <Txt r="Antimicrobiano" v={a.droga} on={(x) => muda({ droga: x })} larg={100} /> : <span className="ds-ev__nome">{a.droga}</span>}
                            <Txt r={novo ? "Dose do antimicrobiano novo" : `Dose de ${a.droga}`} v={a.esquema} on={(x) => muda({ esquema: x })} />
                            <span className="ds-ev__dia">
                              {novo ? <><M>início</M><Num r={`Data de início de ${nome}`} v={a.inicio} on={(x) => muda({ inicio: x })} larg={58} /></> : null}
                              <button className="ds-ev__dbtn" type="button" aria-label={`Dia ${n ?? "sem data"} de ${nome}. Tocar para ver e corrigir a data de início`} onClick={(e) => { e.stopPropagation(); setInicioAberto(inicioAberto === a.k ? null : a.k); }}><b>D{n ?? "—"}</b></button>
                              de<Num r={`Dias previstos de ${nome}`} v={a.previstos} on={(x) => muda({ previstos: x })} larg={36} />
                            </span>
                            {novo ? <span /> : <button className="ds-link ds-link--p" type="button" aria-label={`Suspender ${a.droga}`} onClick={(e) => { e.stopPropagation(); muda({ fim: ddmm(hoje) }); }}>Suspender</button>}
                            <button className="ds-lista__x" type="button" aria-label={a.x ? `Trazer ${a.droga} de volta` : novo ? "Apagar o antimicrobiano novo" : `Apagar ${a.droga}, lançado por engano`}
                              onClick={(e) => { e.stopPropagation(); if (novo) { setAtbL((l) => l.filter((x) => x.k !== a.k)); setSujo(true); } else muda({ x: !a.x }); }}><Icone n={a.x ? "desfazer" : "x"} /></button>
                          </>
                        );
                        return (
                          <Fragment key={a.k}>
                            {a.x ? <span className="ds-removido" role="button" tabIndex={0} aria-label="Removido. Tocar para trazer de volta" onClick={() => muda({ x: false })} onKeyDown={tecla(() => muda({ x: false }))}>{linha}</span> : linha}
                            {inicioAberto === a.k && !novo && !a.x ? (
                              <div className="ds-ev__sub"><div className="ds-ev__v"><G><M>Início</M><Num r={`Data de início de ${a.droga}`} v={a.inicio} on={(x) => muda({ inicio: x })} larg={58} /></G><span className="ds-ev__c">D1 é o dia do início</span></div></div>
                            ) : null}
                          </Fragment>
                        );
                      })}
                      {atbL.filter((a) => a.fim != null).map((a) => {
                        const muda = (m: Partial<AtbLocal>) => { setAtbL((l) => l.map((x) => (x.k === a.k ? { ...x, ...m } : x))); setSujo(true); };
                        const quando = a.fim === ddmm(hoje) ? "hoje" : a.fim;
                        return (
                          <span key={a.k} className="ds-ev__ro ds-ev__susp">Suspensos: {a.droga} (D{diaDoAtb(a) ?? "—"}),
                            {fimAberto === a.k
                              ? <Num r={`Data do fim de ${a.droga}, dia e mês`} v={a.fim} on={(x) => muda({ fim: x.trim() ? x : null })} larg={58} />
                              : <button className="ds-link ds-link--p" type="button" aria-label={`Fim: ${quando}. Corrigir a data de fim`} onClick={() => setFimAberto(a.k)}>{quando}</button>}
                          </span>
                        );
                      })}
                      <button className="ds-link" type="button" onClick={() => { setAtbL((l) => [...l, { k: novaChave(), droga: "", esquema: "", inicio: ddmm(hoje), previstos: "", fim: null }]); setSujo(true); }}><Icone n="mais" />Adicionar antimicrobiano</button>
                    </div>
                  </div>
                  <div className="ds-ev__bloco">
                    <span className="ds-ev__r">Culturas</span>
                    <div className="ds-ev__lista ds-ev__lista--cult">
                      {cultL.map((c) => {
                        const nome = c.material || "cultura nova";
                        const muda = (m: Partial<CulturaLocal>) => { setCultL((l) => l.map((x) => (x.k === c.k ? { ...x, ...m } : x))); setSujo(true); };
                        const linha = (
                          <>
                            <Sel r="Material da cultura" ops={MATERIAIS} v={c.material} on={(x) => muda({ material: x ?? "" })} />
                            <Num r={`Data da coleta de ${nome}`} v={c.coleta} on={(x) => muda({ coleta: x })} larg={58} />
                            <Sel r={`Resultado de ${nome}`} ops={RESULTADOS_CULTURA} v={c.resultado} on={(x) => muda({ resultado: x ?? "" })} />
                            <button className="ds-lista__x" type="button" aria-label={c.x ? `Trazer ${nome} de ${c.coleta} de volta` : `Tirar ${nome} de ${c.coleta}`}
                              onClick={(e) => { e.stopPropagation(); if (!c.id) { setCultL((l) => l.filter((x) => x.k !== c.k)); setSujo(true); } else muda({ x: !c.x }); }}><Icone n={c.x ? "desfazer" : "x"} /></button>
                          </>
                        );
                        return (
                          <Fragment key={c.k}>
                            {c.x ? <span className="ds-removido" role="button" tabIndex={0} aria-label="Removido. Tocar para trazer de volta" onClick={() => muda({ x: false })} onKeyDown={tecla(() => muda({ x: false }))}>{linha}</span> : linha}
                            {c.resultado === "Positiva" && !c.x ? (
                              <div className="ds-ev__sub">
                                <div className="ds-ev__v"><M>Germe</M><Txt r={`Germe de ${nome}`} v={c.germe} on={(x) => muda({ germe: x })} />{c.ufc != null ? <span className="ds-ev__c">{nf(c.ufc)} UFC/mL</span> : null}</div>
                                {c.s || c.r ? <div className="ds-ev__v"><span className="ds-ev__ro">{c.s ? <><b>S:</b> {c.s}</> : null}{c.s && c.r ? " · " : null}{c.r ? <><b>R:</b> {c.r}</> : null}</span></div> : null}
                              </div>
                            ) : null}
                          </Fragment>
                        );
                      })}
                      <button className="ds-link" type="button" onClick={() => { setCultL((l) => [...l, { k: novaChave(), material: "", coleta: "", resultado: "", germe: "", ufc: null, s: "", r: "" }]); setSujo(true); }}><Icone n="mais" />Adicionar cultura</button>
                    </div>
                  </div>
                  {notas("infecto", "Infecto")}
                </Sis>
              </div>
            </div>
          </div>
        </section>
        <div className="ds-col3">
          {listaTexto("Impressão clínica / problemas", "impressao", "Problema", "abre com os diagnósticos do HD", true)}
          <section className="ds-painel">
            <div className="ds-painel__cab"><div><h3 className="ds-painel__titulo">Plano de conduta 24 h</h3></div></div>
            <div className="ds-painel__corpo"><div className="ds-lista">
              {st.condutas.map((c, i) => (
                <div key={i} className={"ds-lista__item ds-lista__item--sis" + (c.x ? " ds-riscado" : "")}>
                  <label className="ds-lista__sisr">
                    <select style={{ ...semEstilo, fontWeight: 700, cursor: "pointer" }} aria-label="Sistema da conduta" value={c.sistema} onChange={(e) => mudaConduta(i, { sistema: e.target.value })}>
                      {!QUADROS.some((q) => q.nome === c.sistema) ? <option value={c.sistema}>{c.sistema}</option> : null}
                      {QUADROS.map((q) => <option key={q.k} value={q.nome}>{q.nome}</option>)}
                    </select><Icone n="abre" />
                  </label>
                  <Area r={`Conduta de ${c.sistema}`} v={c.texto} on={(x) => mudaConduta(i, { texto: x })} />
                  <button className="ds-lista__x" type="button" aria-label={c.x ? "Trazer de volta" : "Remover conduta"} onClick={() => mudaConduta(i, { x: !c.x })}><Icone n={c.x ? "desfazer" : "x"} /></button>
                </div>
              ))}
              <button className="ds-link" type="button" onClick={() => { setSt((s) => ({ ...s, condutas: [...s.condutas, { sistema: "Cardio-hemodinâmica", texto: "" }] })); setSujo(true); }}><Icone n="mais" />Adicionar conduta</button>
            </div></div>
          </section>
          <section className="ds-painel">
            <div className="ds-painel__cab"><div><h3 className="ds-painel__titulo">Pendências / riscos</h3></div></div>
            <div className="ds-painel__corpo"><div className="ds-lista">
              {st.pend.map((p, i) => (
                <div key={p.id ?? `n${i}`} className={"ds-lista__item" + (p.x ? " ds-riscado" : "")}>
                  <span className={"ds-check" + (p.concluida ? " ds-check--feito" : "")} role="checkbox" aria-checked={p.concluida} aria-label="Feita" tabIndex={0} onClick={() => mudaPend(i, { concluida: !p.concluida })} onKeyDown={tecla(() => mudaPend(i, { concluida: !p.concluida }))}>{p.concluida ? <Icone n="feito" /> : null}</span>
                  <Area r="Pendência" v={p.tarefa} on={(x) => mudaPend(i, { tarefa: x })} />
                  <span className={`ds-prio ds-prio--${p.prioridade}`} role="button" tabIndex={0} aria-label={`Prioridade ${p.prioridade}. Tocar para trocar`} onClick={() => mudaPend(i, { prioridade: (p.prioridade % 3) + 1 })} onKeyDown={tecla(() => mudaPend(i, { prioridade: (p.prioridade % 3) + 1 }))}>P{p.prioridade}</span>
                  <button className="ds-lista__x" type="button" aria-label={p.x ? "Trazer de volta" : "Remover pendência"} onClick={() => mudaPend(i, { x: !p.x })}><Icone n={p.x ? "desfazer" : "x"} /></button>
                </div>
              ))}
              <button className="ds-link" type="button" onClick={() => { setSt((s) => ({ ...s, pend: [...s.pend, { tarefa: "", prioridade: 2, concluida: false }] })); setSujo(true); }}><Icone n="mais" />Adicionar pendência</button>
            </div></div>
          </section>
        </div>
      </main>
    </>
  );
}
