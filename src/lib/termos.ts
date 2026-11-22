// Termos do design "Comando UTI · Folha de plantão": nomes, opções e contas.
// Serve ao servidor e ao navegador. Os mesmos termos estão no banco (migração termos_do_design).

export type Dados = Record<string, unknown>;
export type Gravidade = "estavel" | "watcher" | "instavel" | "critico";
export type Turno = "diurna" | "noturna";

export const GRAVIDADES: readonly Gravidade[] = ["critico", "instavel", "watcher", "estavel"];
export const GRAVIDADE: Record<Gravidade, string> = { estavel: "Estável", watcher: "Watcher", instavel: "Instável", critico: "Crítico" };
export const TURNO: Record<Turno, string> = { diurna: "diurno", noturna: "noturno" };
/** Desfechos da internação: código do banco -> texto da tela. */
export const DESFECHO: Record<string, string> = { alta_uti: "Alta da UTI", alta_hospitalar: "Alta hospitalar", obito: "Óbito", transferencia: "Transferência" };
export const ISOLAMENTO: Record<string, string> = { contact: "contato", droplet: "gotícula", aerosol: "aerossol" };
export const INTENCAO: Record<string, string> = { empirica: "empírica", dirigida: "dirigida", profilatica: "profilática" };
export const DISPOSITIVO: Record<string, string> = {
  iot: "IOT", traqueo: "TQT", cvc: "CVC", picc: "PICC", arterial: "PAI", svd: "SVD", sne: "SNE", sng: "SNG",
  dreno: "Dreno", gtt: "GTT", trr: "Shiley", marca_passo: "Marca-passo", outro: "Outro",
};
export const MATERIAL: Record<string, string> = {
  hemocultura: "Hemocultura", urocultura: "Urocultura", aspirado_traqueal: "Aspirado traqueal", lavado_bal: "Lavado broncoalveolar",
  lcr: "Líquor", secrecao_ferida: "Secreção de ferida", liquido_peritoneal: "Líquido peritoneal", liquido_pleural: "Líquido pleural", outro: "Outro",
};

/** Os sete quadros da ficha, na ordem do design. `k` é a coluna de `evolucoes`. */
export const QUADROS = [
  { k: "neuro", nome: "Neuro", curto: "Neuro", ic: "neuro" },
  { k: "resp", nome: "Resp", curto: "Resp", ic: "resp" },
  { k: "hemo", nome: "Cardio-hemodinâmica", curto: "Hemo", ic: "cardio" },
  { k: "tgi", nome: "TGI", curto: "TGI", ic: "tgi" },
  { k: "renal", nome: "Renal", curto: "Renal", ic: "renal" },
  { k: "hemato", nome: "Hemato", curto: "Hemato", ic: "hemato" },
  { k: "infecto", nome: "Infecto", curto: "Infecto", ic: "infecto" },
] as const;
export type Quadro = (typeof QUADROS)[number]["k"];

/** Seções da tela Exames, com os códigos do vocabulário de eventos. */
export const SECOES_EXAMES: readonly (readonly [string, readonly string[]])[] = [
  ["Hematologia", ["hb", "ht", "plaq", "leuco", "inr"]],
  ["Renal e eletrólitos", ["ur", "cr", "na", "k", "mg", "cai"]],
  ["Gasometria", ["ph", "pco2", "hco3", "lactato", "pf_ratio"]],
  ["Infecto e hepático", ["pcr", "procalcitonina", "bb"]],
];

export interface Infusao { droga: string; diluicao?: string | null; vazao_ml_h?: number | string | null; dose?: number | null; unidade?: string | null; x?: boolean }
export interface Pendencia { id: string; paciente_id: string; tarefa: string; prioridade: number; concluida: boolean }
export interface Conduta { sistema: string; texto: string }

// ---- números e datas em pt-BR -------------------------------------------------
export function num(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  let s = v.trim().replace(/−/g, "-").replace(/\s/g, "");
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^[+-]?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  return /^[+-]?\d+(\.\d+)?$/.test(s) ? Number(s) : null;
}
export const nf = (v: number | null | undefined, casas?: number): string =>
  v == null || !Number.isFinite(v)
    ? ""
    : v.toLocaleString("pt-BR", casas == null ? { maximumFractionDigits: 2 } : { minimumFractionDigits: casas, maximumFractionDigits: casas });
export const sinal = (v: number | null | undefined): string =>
  v == null || !Number.isFinite(v) ? "" : (v > 0 ? "+" : v < 0 ? "−" : "") + nf(Math.abs(v));
export const txt = (v: unknown): string => (typeof v === "string" ? v : typeof v === "number" ? nf(v) : "");
export const ddmm = (iso: string | null | undefined): string => (iso && iso.length >= 10 ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : "");
export const ddmmaaaa = (iso: string | null | undefined): string => (iso && iso.length >= 10 ? `${ddmm(iso)}/${iso.slice(0, 4)}` : "");

const FUSO = "America/Sao_Paulo";
function partesSP(d: Date): { dia: string; hora: number; minuto: string } {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return { dia: `${g("year")}-${g("month")}-${g("day")}`, hora: Number(g("hour")) % 24, minuto: g("minute") };
}
/** Dia (AAAA-MM-DD) de um instante, no fuso de São Paulo. */
export const diaSP = (ts: string | Date): string => partesSP(typeof ts === "string" ? new Date(ts) : ts).dia;
export const horaSP = (ts: string | Date): string => { const p = partesSP(typeof ts === "string" ? new Date(ts) : ts); return `${String(p.hora).padStart(2, "0")}:${p.minuto}`; };
export function somaDias(iso: string, n: number): string {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export const diasEntre = (a: string, b: string): number => Math.round((Date.parse(b.slice(0, 10) + "T12:00:00Z") - Date.parse(a.slice(0, 10) + "T12:00:00Z")) / 86400000);
/** Plantão em curso: diurno das 7 às 19 h; a madrugada pertence ao plantão noturno do dia anterior. */
export function plantaoAtual(agora: Date = new Date()): { hoje: string; data: string; turno: Turno } {
  const { dia, hora } = partesSP(agora);
  const turno: Turno = hora >= 7 && hora < 19 ? "diurna" : "noturna";
  return { hoje: dia, turno, data: turno === "noturna" && hora < 7 ? somaDias(dia, -1) : dia };
}
const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
export const diaSemana = (iso: string): string => SEMANA[new Date(iso + "T12:00:00Z").getUTCDay()];

// ---- texto do paciente ---------------------------------------------------------
/** HD em itens: aceita uma linha por diagnóstico, ponto e vírgula ou lista numerada. */
export function hdItens(hd: string | null | undefined): string[] {
  if (!hd) return [];
  let p = hd.split(/\r?\n|;/).map((s) => s.trim()).filter(Boolean);
  if (p.length === 1 && /^1[.)]\s/.test(p[0])) p = p[0].split(/\s+(?=\d{1,2}[.)]\s)/);
  return p.map((s) => s.replace(/^\d{1,2}[.)]\s*/, "").replace(/^[-•]\s*/, "").trim()).filter(Boolean);
}
/** Alergia para o aviso vermelho: "nega", "nenhuma" e vazio não geram aviso. */
export function alergiaDe(a: string | null | undefined): string | null {
  const s = (a ?? "").trim();
  return !s || /^(neg|nenhum|n[aã]o|sem|nd|nr|desconhec)/i.test(s) ? null : s;
}
export const numLeito = (leito: string): string => (leito.match(/(\d+)\s*$/)?.[1] ?? leito).padStart(2, "0");

// ---- contas da ficha (em branco quando falta dado: a ficha não supõe valor) ----
/** Peso predito (kg) pela altura em cm e pelo sexo. */
export function pesoPredito(alturaCm: number | null, sexo: string | null): number | null {
  if (!alturaCm || (sexo !== "masculino" && sexo !== "feminino")) return null;
  return (sexo === "masculino" ? 50 : 45.5) + 0.91 * (alturaCm - 152.4);
}
/** Dose pela vazão (mL/h) e pela diluição escrita ("128 mcg/mL"), na unidade da droga. */
export function doseDe(diluicao: unknown, vazao: unknown, unidade: unknown, peso: number | null): number | null {
  const m = typeof diluicao === "string" ? diluicao.match(/^\s*([\d.,]+)\s*(mcg|mg|UI)\s*\/\s*mL\s*$/i) : null;
  const v = num(vazao);
  if (!m || v == null || typeof unidade !== "string") return null;
  const conc = num(m[1]);
  if (conc == null) return null;
  const de = m[2].toLowerCase();
  const [para, ...por] = unidade.toLowerCase().split("/");
  let q = conc * v; // por hora, na unidade da diluição
  if (de === "mg" && para === "mcg") q *= 1000;
  else if (de === "mcg" && para === "mg") q /= 1000;
  else if (de !== para) return null;
  if (por.includes("kg")) { if (!peso) return null; q /= peso; }
  if (por.includes("min")) q /= 60;
  else if (!por.includes("h")) return null;
  return q;
}
export const DROGAS_SEDACAO: readonly (readonly [string, string, string])[] = [
  ["Fentanil", "50 mcg/mL", "mcg/h"], ["Midazolam", "1 mg/mL", "mg/h"], ["Propofol", "10 mg/mL", "mg/h"],
  ["Dexmedetomidina", "", "mcg/kg/h"], ["Cetamina", "", ""],
];
export const DROGAS_VASOATIVAS: readonly (readonly [string, string, string])[] = [
  ["Noradrenalina", "128 mcg/mL", "mcg/kg/min"], ["Vasopressina", "0,4 UI/mL", "UI/min"], ["Adrenalina", "", "mcg/kg/min"],
  ["Dobutamina", "4 mg/mL", "mcg/kg/min"], ["Nitroprussiato", "", ""], ["Nitroglicerina", "", ""], ["Esmolol", "", ""],
];
/** Lista de diluições do design (a mesma para qualquer droga em infusão). */
export const DILUICOES = ["50 mcg/mL", "128 mcg/mL", "1 mg/mL", "10 mg/mL", "4 mg/mL", "0,4 UI/mL"] as const;

// ---- antimicrobianos e culturas ------------------------------------------------
/** Vias aceitas pelo banco (enum via_atb_enum). */
export const VIAS_ATB = ["EV", "VO", "IM", "SC", "SNE", "SNG", "IT", "Tópico"] as const;
/** O design tem uma caixa só para dose, via e frequência ("1 g EV 8/8 h"). Junta as três colunas do banco. */
export const esquemaDe = (dose: string | null, via: string | null, frequencia: string | null): string => [dose, via, frequencia].filter(Boolean).join(" ");
/** Desfaz o texto da caixa nas três colunas: a via é a palavra da lista de vias; o que vem antes é a dose e o que vem depois é a frequência. */
export function esquemaEmColunas(texto: string): { dose: string | null; via: string | null; frequencia: string | null } {
  const t = texto.trim();
  if (!t) return { dose: null, via: null, frequencia: null };
  const p = t.split(/\s+/);
  const i = p.findIndex((x) => (VIAS_ATB as readonly string[]).includes(x));
  if (i < 0) return { dose: t, via: null, frequencia: null };
  return { dose: p.slice(0, i).join(" ") || null, via: p[i], frequencia: p.slice(i + 1).join(" ") || null };
}
export const RESULTADOS_CULTURA = ["Em andamento", "Positiva", "Negativa"] as const;
/** "dd/mm" digitado vira a data completa: o ano é o de hoje (ou o anterior, se a data cairia no futuro). Inválida: null. */
export function isoDeDdMm(texto: string, hoje: string): string | null {
  const m = texto.trim().match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!m) return null;
  const d = Number(m[1]), mes = Number(m[2]);
  const f = (a: number) => `${a}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  let iso = f(Number(hoje.slice(0, 4)));
  if (iso > hoje) iso = f(Number(hoje.slice(0, 4)) - 1);
  const dt = new Date(iso + "T12:00:00Z");
  return Number.isNaN(dt.getTime()) || dt.getUTCDate() !== d || dt.getUTCMonth() + 1 !== mes ? null : iso;
}
export const ABREV_DROGA: Record<string, string> = { Noradrenalina: "Nor", Vasopressina: "Vaso", Dobutamina: "Dobuta", Adrenalina: "Adr" };
export const SUPORTES = ["Ar ambiente", "Cateter O2", "Máscara", "CNAF", "VNI", "VM"] as const;
