"use client";
// ============================================================================
// SASI v2 — CalcPanel (calculadoras de plantao do War Room)
// ----------------------------------------------------------------------------
// Quatro contas simples, TODAS com o dado que o medico digita na hora:
//   (a) dose de droga vasoativa em mcg/kg/min
//   (b) PAM = (PAS + 2 x PAD) / 3
//   (c) relacao PaO2/FiO2
//   (d) diurese em ml/kg/h
//
// DOUTRINA APLICADA
//  - ESCORE CLINICO NAO SE CALCULA AQUI. SOFA vem do banco (vw_sofa_diario /
//    evolucoes.sofa_total). Aqui nao ha classificacao (nada de "SDRA moderada",
//    nada de "oligúria") — so aritmetica com a formula a vista.
//  - VERIFICAVEL: cada card mostra a formula E a memoria de calculo com os
//    numeros substituidos. O medico confere em 2 segundos.
//  - ZERO ALUCINACAO: faltou campo, resultado e "—". Nunca 0 no lugar de vazio,
//    nunca unidade assumida (a FiO2 e pedida em %, explicita).
//  - "Flags gritam, nao consertam": valor implausivel ganha aviso, nao correcao.
//  - Nada aqui grava no banco.
// ============================================================================
import {
  type ChangeEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useId,
  useState
} from "react";

// ---------------------------------------------------------------------------
// 1. Leitura de numero em pt-BR (virgula decimal) — puro e testavel
// ---------------------------------------------------------------------------
export interface Entrada {
  /** Numero lido, ou null se vazio/invalido/ambiguo. */
  valor: number | null;
  /** Motivo + saida, quando o texto nao virou numero confiavel. */
  aviso: string | null;
}

/**
 * Aceita "0,25" e "0.25". Rejeita o que for AMBIGUO em vez de chutar:
 * "1.500" pode ser mil e quinhentos (milhar) ou um e meio — devolve aviso.
 */
export function paraNumero(txt: string): Entrada {
  const bruto = (txt ?? "").trim().replace(/\s+/g, "");
  if (!bruto) return {valor: null, aviso: null};

  // Ainda digitando ("1," ou "0.") — nao e erro, so ainda nao ha numero.
  if (/[.,]$/.test(bruto)) return {valor: null, aviso: null};

  // Separador no inicio (",5") vira "0,5" — leitura unica, sem ambiguidade.
  const t = /^[.,]/.test(bruto) ? `0${bruto}` : bruto;

  const temVirgula = t.includes(",");
  const temPonto = t.includes(".");

  if (temPonto && !temVirgula && /\.\d{3}(?!\d)/.test(t)) {
    return {
      valor: null,
      aviso: "Ambíguo: ponto com 3 casas parece separador de milhar. Escreva 1500 ou 1,5."
    };
  }

  const normal = temVirgula ? t.replace(/\./g, "").replace(",", ".") : t;
  if (!/^\d+(\.\d+)?$/.test(normal)) {
    return {valor: null, aviso: "Use só números positivos (vírgula para decimal)."};
  }

  const v = Number(normal);
  return Number.isFinite(v) ? {valor: v, aviso: null} : {valor: null, aviso: "Número inválido."};
}

// ---------------------------------------------------------------------------
// 2. As quatro contas (puras). Denominador <= 0 => null (nao existe resultado).
//    Numerador 0 e resultado legitimo (bomba parada / anuria), nao "vazio".
// ---------------------------------------------------------------------------

/** mcg/kg/min = (vazão mL/h × concentração mg/mL × 1000) ÷ (peso kg × 60) */
export function doseVasoativa(vazaoMlH: number | null, concMgMl: number | null, pesoKg: number | null): number | null {
  if (vazaoMlH == null || concMgMl == null || pesoKg == null) return null;
  if (vazaoMlH < 0 || concMgMl <= 0 || pesoKg <= 0) return null;
  const v = (vazaoMlH * concMgMl * 1000) / (pesoKg * 60);
  return Number.isFinite(v) ? v : null;
}

/** PAM = (PAS + 2 × PAD) ÷ 3 */
export function pamCalculada(pas: number | null, pad: number | null): number | null {
  if (pas == null || pad == null) return null;
  if (pas <= 0 || pad <= 0) return null;
  const v = (pas + 2 * pad) / 3;
  return Number.isFinite(v) ? v : null;
}

/** P/F = PaO₂ ÷ (FiO₂% ÷ 100) */
export function relacaoPF(pao2: number | null, fio2Pct: number | null): number | null {
  if (pao2 == null || fio2Pct == null) return null;
  if (pao2 <= 0 || fio2Pct <= 0) return null;
  const v = pao2 / (fio2Pct / 100);
  return Number.isFinite(v) ? v : null;
}

/** diurese mL/kg/h = volume mL ÷ (peso kg × horas) */
export function diureseMlKgH(volumeMl: number | null, pesoKg: number | null, horas: number | null): number | null {
  if (volumeMl == null || pesoKg == null || horas == null) return null;
  if (volumeMl < 0 || pesoKg <= 0 || horas <= 0) return null;
  const v = volumeMl / (pesoKg * horas);
  return Number.isFinite(v) ? v : null;
}

// ---------------------------------------------------------------------------
// 3. Formatacao (pt-BR, casas fixas). null => travessao, sempre.
// ---------------------------------------------------------------------------
function fixo(v: number | null, casas: number): string {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", {minimumFractionDigits: casas, maximumFractionDigits: casas});
}

/** Numero como o medico digitou, so normalizado (para a memoria de calculo). */
function cru(v: number | null): string {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", {maximumFractionDigits: 3});
}

// ---------------------------------------------------------------------------
// 4. Pecas de interface
// ---------------------------------------------------------------------------
interface CampoProps {
  id: string;
  rotulo: string;
  unidade: string;
  valor: string;
  onChange: (v: string) => void;
  aviso?: string | null;
  exemplo?: string;
}

function Campo({id, rotulo, unidade, valor, onChange, aviso, exemplo}: CampoProps): ReactElement {
  return (
    <div className="calc__campo">
      <label className="calc__lbl" htmlFor={id}>
        {rotulo} <span className="calc__un">{unidade}</span>
      </label>
      <input
        id={id}
        className="calc__input tabnum"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        placeholder={exemplo ?? ""}
        value={valor}
        aria-invalid={aviso ? true : undefined}
        aria-describedby={aviso ? `${id}-aviso` : undefined}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
      {aviso ? (
        <p className="calc__aviso" id={`${id}-aviso`} role="status">
          {aviso}
        </p>
      ) : null}
    </div>
  );
}

interface CalcProps {
  titulo: string;
  formula: string;
  children: ReactNode;
  resultado: string;
  unidade: string;
  /** Conta com os numeros substituidos. Ausente quando falta dado. */
  memoria?: string | null;
  /** Aviso clinico (nao bloqueia o calculo — so sinaliza). */
  bandeira?: string | null;
}

function Calc({
                titulo,
                formula,
                children,
                resultado,
                unidade,
                memoria,
                bandeira
              }: CalcProps): ReactElement {
  const vazio = resultado === "—";
  return (
    <section className="calc">
      <h3 className="calc__ttl">{titulo}</h3>
      <p className="calc__formula tabnum">{formula}</p>
      <div className="calc__campos">{children}</div>
      <p className="calc__res">
        <span className="calc__res-num tabnum"
              style={{color: vazio ? "var(--text-muted)" : "var(--text-heading)"}}>
          {resultado}
        </span>
        <span className="calc__res-un">{unidade}</span>
      </p>
      {memoria ? <p className="calc__memoria tabnum">{memoria}</p> :
        <p className="calc__memoria">preencha os campos acima</p>}
      {bandeira ? <p className="calc__bandeira">{bandeira}</p> : null}
    </section>
  );
}

// ---------------------------------------------------------------------------
// 5. Painel
// ---------------------------------------------------------------------------
export function CalcPanel(): ReactElement {
  const uid = useId();

  // Peso e o unico campo compartilhado (dose e diurese usam o mesmo paciente).
  const [peso, setPeso] = useState<string>("");
  const [vazao, setVazao] = useState<string>("");
  const [conc, setConc] = useState<string>("");
  const [pas, setPas] = useState<string>("");
  const [pad, setPad] = useState<string>("");
  const [pao2, setPao2] = useState<string>("");
  const [fio2, setFio2] = useState<string>("");
  const [volume, setVolume] = useState<string>("");
  const [horas, setHoras] = useState<string>("");

  const limpar = useCallback(() => {
    setPeso("");
    setVazao("");
    setConc("");
    setPas("");
    setPad("");
    setPao2("");
    setFio2("");
    setVolume("");
    setHoras("");
  }, []);

  const ePeso = paraNumero(peso);
  const eVazao = paraNumero(vazao);
  const eConc = paraNumero(conc);
  const ePas = paraNumero(pas);
  const ePad = paraNumero(pad);
  const ePao2 = paraNumero(pao2);
  const eFio2 = paraNumero(fio2);
  const eVolume = paraNumero(volume);
  const eHoras = paraNumero(horas);

  const dose = doseVasoativa(eVazao.valor, eConc.valor, ePeso.valor);
  const pam = pamCalculada(ePas.valor, ePad.valor);
  const pf = relacaoPF(ePao2.valor, eFio2.valor);
  const diurese = diureseMlKgH(eVolume.valor, ePeso.valor, eHoras.valor);

  // Bandeiras (sinalizam, nao corrigem)
  const bandeiraPam =
    ePas.valor != null && ePad.valor != null && ePad.valor >= ePas.valor
      ? "PAD maior ou igual à PAS — confira os valores (a conta foi feita mesmo assim)."
      : null;
  const bandeiraFio2 =
    eFio2.valor != null && (eFio2.valor < 21 || eFio2.valor > 100)
      ? "FiO₂ fora de 21–100% — confira (a conta foi feita mesmo assim)."
      : null;

  return (
    <div className="calcpanel">
      <style dangerouslySetInnerHTML={{__html: CSS_CALC}}/>

      <div className="calcpanel__topo">
        <p className="calcpanel__nota">
          Só com o que você digita. Nada é lido nem gravado no prontuário.
        </p>
        <button type="button" className="calcpanel__limpar" onClick={limpar}>
          Limpar
        </button>
      </div>

      {/* (a) dose de droga vasoativa ------------------------------------- */}
      <Calc
        titulo="Dose de droga vasoativa"
        formula="mcg/kg/min = (vazão mL/h × concentração mg/mL × 1000) ÷ (peso kg × 60)"
        resultado={fixo(dose, 2)}
        unidade="mcg/kg/min"
        memoria={
          dose == null
            ? null
            : `(${cru(eVazao.valor)} × ${cru(eConc.valor)} × 1000) ÷ (${cru(ePeso.valor)} × 60) = ${fixo(dose, 2)}`
        }
      >
        <Campo id={`${uid}-vazao`} rotulo="Vazão da bomba" unidade="mL/h" exemplo="12" valor={vazao}
               onChange={setVazao} aviso={eVazao.aviso}/>
        <Campo
          id={`${uid}-conc`}
          rotulo="Concentração da diluição"
          unidade="mg/mL"
          exemplo="0,25"
          valor={conc}
          onChange={setConc}
          aviso={eConc.aviso}
        />
        <Campo id={`${uid}-peso-a`} rotulo="Peso (compartilhado)" unidade="kg" exemplo="70"
               valor={peso} onChange={setPeso} aviso={ePeso.aviso}/>
      </Calc>

      {/* (b) PAM --------------------------------------------------------- */}
      <Calc
        titulo="Pressão arterial média (PAM)"
        formula="PAM = (PAS + 2 × PAD) ÷ 3"
        resultado={fixo(pam, 0)}
        unidade="mmHg"
        memoria={pam == null ? null : `(${cru(ePas.valor)} + 2 × ${cru(ePad.valor)}) ÷ 3 = ${fixo(pam, 0)}`}
        bandeira={bandeiraPam}
      >
        <Campo id={`${uid}-pas`} rotulo="PAS" unidade="mmHg" exemplo="120" valor={pas}
               onChange={setPas} aviso={ePas.aviso}/>
        <Campo id={`${uid}-pad`} rotulo="PAD" unidade="mmHg" exemplo="70" valor={pad}
               onChange={setPad} aviso={ePad.aviso}/>
      </Calc>

      {/* (c) relacao PaO2/FiO2 ------------------------------------------- */}
      <Calc
        titulo="Relação PaO₂/FiO₂"
        formula="P/F = PaO₂ mmHg ÷ (FiO₂ % ÷ 100)"
        resultado={fixo(pf, 0)}
        unidade="mmHg"
        memoria={pf == null ? null : `${cru(ePao2.valor)} ÷ (${cru(eFio2.valor)} ÷ 100) = ${fixo(pf, 0)}`}
        bandeira={bandeiraFio2}
      >
        <Campo id={`${uid}-pao2`} rotulo="PaO₂ (gasometria arterial)" unidade="mmHg" exemplo="80"
               valor={pao2} onChange={setPao2} aviso={ePao2.aviso}/>
        <Campo id={`${uid}-fio2`} rotulo="FiO₂" unidade="%" exemplo="40" valor={fio2}
               onChange={setFio2} aviso={eFio2.aviso}/>
      </Calc>

      {/* (d) diurese ----------------------------------------------------- */}
      <Calc
        titulo="Diurese"
        formula="mL/kg/h = volume mL ÷ (peso kg × horas)"
        resultado={fixo(diurese, 2)}
        unidade="mL/kg/h"
        memoria={
          diurese == null ? null : `${cru(eVolume.valor)} ÷ (${cru(ePeso.valor)} × ${cru(eHoras.valor)}) = ${fixo(diurese, 2)}`
        }
      >
        <Campo id={`${uid}-vol`} rotulo="Volume urinário" unidade="mL" exemplo="600" valor={volume}
               onChange={setVolume} aviso={eVolume.aviso}/>
        <Campo id={`${uid}-horas`} rotulo="Período" unidade="h" exemplo="12" valor={horas}
               onChange={setHoras} aviso={eHoras.aviso}/>
        <Campo id={`${uid}-peso-d`} rotulo="Peso (compartilhado)" unidade="kg" exemplo="70"
               valor={peso} onChange={setPeso} aviso={ePeso.aviso}/>
      </Calc>

      <p className="calcpanel__rodape">
        Escores clínicos (SOFA) não são calculados aqui — vêm do banco, da evolução.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CSS do painel (so tokens do design system).
// ---------------------------------------------------------------------------
const CSS_CALC = `
.calcpanel{display:flex;flex-direction:column;gap:12px;min-width:0}
.calcpanel__topo{display:flex;align-items:center;gap:8px}
.calcpanel__nota{margin:0;flex:1 1 auto;font-size:var(--text-2xs,10px);line-height:var(--leading-snug,1.35);color:var(--text-faint)}
.calcpanel__limpar{min-height:44px;padding:0 14px;border:1px solid var(--border-default);border-radius:var(--radius-md,8px);
  background:var(--surface-card);color:var(--text-muted);font-family:inherit;font-size:var(--text-2xs,10px);
  font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);text-transform:uppercase;cursor:pointer}
.calcpanel__limpar:hover{background:var(--surface-raised);color:var(--text-heading)}
.calcpanel__limpar:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.calcpanel__rodape{margin:0;font-size:var(--text-2xs,10px);line-height:var(--leading-snug,1.35);color:var(--text-faint)}

.calc{display:flex;flex-direction:column;gap:8px;padding:12px;background:var(--surface-raised);
  border:1px solid var(--border-subtle);border-radius:var(--radius-lg,12px)}
.calc__ttl{margin:0;font-size:var(--text-sm,13px);font-weight:700;color:var(--text-heading)}
.calc__formula{margin:0;padding:6px 8px;background:var(--surface-sunken);border-radius:var(--radius-sm,6px);
  font-size:var(--text-2xs,10px);line-height:var(--leading-snug,1.35);color:var(--text-muted)}

.calc__campos{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px}
.calc__campo{display:flex;flex-direction:column;gap:3px;min-width:0}
.calc__lbl{font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-wide,.04em);color:var(--text-muted)}
.calc__un{font-weight:600;color:var(--text-faint)}
.calc__input{width:100%;min-height:44px;padding:0 10px;border:1px solid var(--border-default);
  border-radius:var(--radius-md,8px);background:var(--surface-card);color:var(--text-heading);
  font-size:var(--text-base,15px);font-weight:600}
.calc__input::placeholder{color:var(--text-faint);font-weight:400}
.calc__input:focus-visible{outline:2px solid var(--accent);outline-offset:1px;border-color:var(--accent)}
.calc__input[aria-invalid="true"]{border-color:var(--danger)}
.calc__aviso{margin:0;font-size:var(--text-2xs,10px);line-height:var(--leading-snug,1.35);color:var(--danger)}

.calc__res{display:flex;align-items:baseline;gap:6px;margin:0}
.calc__res-num{font-size:var(--text-xl,24px);font-weight:700;line-height:var(--leading-tight,1.15)}
.calc__res-un{font-size:var(--text-xs,11px);color:var(--text-muted)}
.calc__memoria{margin:0;font-size:var(--text-2xs,10px);line-height:var(--leading-snug,1.35);color:var(--text-faint);
  overflow-wrap:anywhere}
.calc__bandeira{margin:0;padding:6px 8px;border-radius:var(--radius-sm,6px);
  background:color-mix(in srgb, var(--warning) 14%, transparent);color:var(--warning);
  font-size:var(--text-2xs,10px);line-height:var(--leading-snug,1.35)}
`;

export default CalcPanel;
