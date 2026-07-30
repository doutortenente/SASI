// ============================================================================
// SASI v2 — AtbStewardship (antibioticos em curso + D-ATB)
// ----------------------------------------------------------------------------
// Le UMA fonte: a view `vw_dias_atb_ativo` (so ATBs sem data_fim), ja com
//   dias_terapia    = (hoje - data_inicio) + 1        <- contado NO BANCO
//   stewardship_flag= 'ok' | 'warning' (>= 7 d) | 'critical' (>= 14 d)
// Server Component: recebe as linhas prontas da pagina. NAO recalcula D-ATB,
// nao reinterpreta o limiar, nao ordena por regra propria.
//
// DOUTRINA APLICADA
//  - ZERO ALUCINACAO: dias_terapia null => "D—". Foco, intencao e via ausentes
//    viram travessao; nenhum deles e deduzido do nome da droga.
//  - Lista vazia NAO e "paciente sem antibiotico": e ausencia de registro na
//    tabela `atbs`. O estado vazio diz isso com todas as letras.
//  - Cor nunca e o unico sinal: cada flag tem cor E rotulo em texto
//    ("reavaliar" a partir de 7 dias, "reavaliar já" a partir de 14).
//  - Numeros em .tabnum. Cor sempre por token. Zero hex.
//
// O CSS (CSS_ATB_STEWARDSHIP) e injetado UMA vez pela pagina da aba.
// ============================================================================
import type { ReactElement } from "react";
import type { StewardshipFlag, VwDiasAtbAtivo } from "@/lib/data";
import type { IntencaoAtb } from "@/types/clinical";
import { TRAVESSAO, fmtData, txt } from "@/features/patients/components/PatientHeader";
import { num } from "@/lib/formatters/br";

// ---------------------------------------------------------------------------
// Vocabulario e limiares (os mesmos da view — aqui so viram texto/cor)
// ---------------------------------------------------------------------------

/** Dia de terapia a partir do qual o stewardship pede reavaliacao. */
const DIAS_ATENCAO = 7;
/** Dia de terapia a partir do qual a duracao e critica. */
const DIAS_CRITICO = 14;

interface EstiloFlag {
  rotulo: string;
  cor: string;
  fundo: string;
  leitura: string;
}

const FLAGS: Record<StewardshipFlag, EstiloFlag> = {
  ok: {
    rotulo: "em curso",
    cor: "var(--success)",
    fundo: "color-mix(in srgb, var(--success) 14%, transparent)",
    leitura: `menos de ${DIAS_ATENCAO} dias de terapia`,
  },
  warning: {
    rotulo: "reavaliar",
    cor: "var(--warning)",
    fundo: "color-mix(in srgb, var(--warning) 16%, transparent)",
    leitura: `${DIAS_ATENCAO} dias ou mais — reavaliar indicação, descalonamento e duração planejada`,
  },
  critical: {
    rotulo: "reavaliar já",
    cor: "var(--danger)",
    fundo: "color-mix(in srgb, var(--danger) 16%, transparent)",
    leitura: `${DIAS_CRITICO} dias ou mais — duração prolongada, justificar ou suspender`,
  },
};

/** Flag fora do vocabulario da view => mostra o valor cru, em tom neutro (nunca "ok" por engano). */
function estiloDe(flag: StewardshipFlag | string | null | undefined): EstiloFlag {
  const conhecida = flag === "ok" || flag === "warning" || flag === "critical";
  if (conhecida) return FLAGS[flag as StewardshipFlag];
  return {
    rotulo: txt(typeof flag === "string" ? flag : null) ?? TRAVESSAO,
    cor: "var(--text-muted)",
    fundo: "var(--surface-sunken)",
    leitura: "valor de stewardship_flag fora do vocabulário da view",
  };
}

const ROTULO_INTENCAO: Record<IntencaoAtb, string> = {
  empirica: "empírica",
  dirigida: "dirigida",
  profilatica: "profilática",
};

/** Intencao fora do vocabulario => imprime o valor cru. Ausente => null (some da linha). */
function rotuloIntencao(v: IntencaoAtb | string | null | undefined): string | null {
  const t = txt(typeof v === "string" ? v : null);
  if (!t) return null;
  return ROTULO_INTENCAO[t as IntencaoAtb] ?? t;
}

// ---------------------------------------------------------------------------
// Regua de dias (0 -> 14). Sem biblioteca: divs + tokens.
// ---------------------------------------------------------------------------
function Regua({ dias, cor }: { dias: number; cor: string }): ReactElement {
  const pct = Math.max(0, Math.min(1, dias / DIAS_CRITICO)) * 100;
  return (
    <span className="atb-regua" aria-hidden="true">
      <span className="atb-regua__fill" style={{ width: `${pct}%`, background: cor }} />
      <span className="atb-regua__marca" style={{ left: `${(DIAS_ATENCAO / DIAS_CRITICO) * 100}%` }} />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Linha de um antibiotico
// ---------------------------------------------------------------------------
function LinhaAtb({ atb }: { atb: VwDiasAtbAtivo }): ReactElement {
  const estilo = estiloDe(atb.stewardship_flag);
  const dias = typeof atb.dias_terapia === "number" && Number.isFinite(atb.dias_terapia) ? atb.dias_terapia : null;
  const droga = txt(atb.droga) ?? TRAVESSAO;
  const via = txt(atb.via);
  const foco = txt(atb.foco);
  const alvo = txt(atb.agente_alvo);
  const intencao = rotuloIntencao(atb.intencao);
  const inicio = fmtData(atb.data_inicio);

  return (
    <li className="atb-linha" style={{ borderLeftColor: estilo.cor }}>
      {/* topo — droga, via e o dia de terapia */}
      <div className="atb-linha__topo">
        <span className="atb-linha__droga" title={droga}>
          {droga}
        </span>
        {via ? (
          <span className="atb-via tabnum" title="Via de administração registrada">
            {via}
          </span>
        ) : null}
        <span
          className="atb-dia tabnum"
          style={{ color: estilo.cor }}
          title={`Dia de terapia (D1 = data de início). ${estilo.leitura}.`}
        >
          {dias == null ? `D${TRAVESSAO}` : `D+${num(dias, 0)}`}
        </span>
        <span
          className="atb-flag"
          style={{ background: estilo.fundo, color: estilo.cor, borderColor: `color-mix(in srgb, ${estilo.cor} 32%, transparent)` }}
          title={estilo.leitura}
        >
          {estilo.rotulo}
        </span>
      </div>

      {/* duracao — a regua so existe com dia contado, mas a DATA DE INICIO
          aparece sempre que estiver legivel (e dado real, nao pode sumir). */}
      {dias == null && inicio === TRAVESSAO ? null : (
        <div
          className="atb-linha__regua"
          title={
            dias == null
              ? "Data de início registrada; dia de terapia não calculado pela view"
              : `${num(dias, 0)} dia(s) de terapia — marca em ${DIAS_ATENCAO} d, escala até ${DIAS_CRITICO} d`
          }
        >
          {dias == null ? null : <Regua dias={dias} cor={estilo.cor} />}
          <span className="atb-linha__inicio tabnum">início {inicio}</span>
        </div>
      )}

      {/* base — para que serve este antibiotico */}
      <div className="atb-linha__base">
        <span className="atb-campo">
          <span className="atb-campo__rot">Foco</span>
          <span className={foco ? "atb-campo__val" : "atb-campo__val atb-campo__val--vazio"}>{foco ?? TRAVESSAO}</span>
        </span>
        <span className="atb-campo">
          <span className="atb-campo__rot">Intenção</span>
          <span className={intencao ? "atb-campo__val" : "atb-campo__val atb-campo__val--vazio"}>
            {intencao ?? TRAVESSAO}
          </span>
        </span>
        {alvo ? (
          <span className="atb-campo">
            <span className="atb-campo__rot">Agente-alvo</span>
            <span className="atb-campo__val">{alvo}</span>
          </span>
        ) : null}
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export interface AtbStewardshipProps {
  /** Linhas de vw_dias_atb_ativo do paciente (listarAtbsAtivos). */
  atbs: VwDiasAtbAtivo[];
}

export function AtbStewardship({ atbs }: AtbStewardshipProps): ReactElement {
  const lista = Array.isArray(atbs) ? atbs : [];
  const emAtencao = lista.filter((a: VwDiasAtbAtivo) => a.stewardship_flag === "warning").length;
  const criticos = lista.filter((a: VwDiasAtbAtivo) => a.stewardship_flag === "critical").length;

  return (
    <section className="atb" aria-labelledby="atb-titulo">
      <h3 className="atb__titulo" id="atb-titulo">
        Antibióticos em curso
        <span className="atb__fonte tabnum">vw_dias_atb_ativo</span>
      </h3>

      {lista.length === 0 ? (
        <div className="atb-vazio" aria-live="polite">
          <strong className="atb-vazio__titulo">Nenhum antibiótico em curso registrado</strong>
          <span className="atb-vazio__txt">
            A lista vem da tabela <code className="tabnum">atbs</code> (apenas os sem data de fim). Vazio aqui significa{" "}
            <strong>nada registrado</strong> — não significa paciente sem antibiótico. Registre início, via, foco e
            intenção para o D-ATB começar a contar.
          </span>
        </div>
      ) : (
        <>
          {emAtencao + criticos > 0 ? (
            <p className="atb-resumo" role="status">
              {criticos > 0 ? (
                <span style={{ color: "var(--danger)", fontWeight: 700 }}>
                  {num(criticos, 0)} com {DIAS_CRITICO} dias ou mais
                </span>
              ) : null}
              {criticos > 0 && emAtencao > 0 ? " · " : ""}
              {emAtencao > 0 ? (
                <span style={{ color: "var(--warning)", fontWeight: 700 }}>
                  {num(emAtencao, 0)} com {DIAS_ATENCAO} dias ou mais
                </span>
              ) : null}
              <span className="atb-resumo__acao"> — reavaliar indicação, descalonamento e duração.</span>
            </p>
          ) : null}

          <ul className="atb-lista">
            {lista.map((a: VwDiasAtbAtivo) => (
              <LinhaAtb key={a.atb_id} atb={a} />
            ))}
          </ul>

          <p className="atb-rodape">
            <span className="tabnum">D+n</span> = dia de terapia contando o D1 (data de início), calculado no banco.
            Dose, duração planejada e motivo de suspensão vivem na tabela <code className="tabnum">atbs</code> e não
            aparecem nesta view.
          </p>
        </>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// CSS do stewardship (classes .atb-*). Injetado UMA vez pela pagina da aba.
// So tokens do design system — zero hex.
// ---------------------------------------------------------------------------
export const CSS_ATB_STEWARDSHIP = `
.atb{display:flex;flex-direction:column;gap:8px;min-width:0}
.atb__titulo{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;margin:0;
  font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;color:var(--text-muted)}
.atb__fonte{margin-left:auto;font-size:var(--text-2xs,10px);font-weight:400;letter-spacing:0;
  text-transform:none;color:var(--text-faint)}

.atb-resumo{margin:0;font-size:var(--text-xs,11px);color:var(--text-body)}
.atb-resumo__acao{color:var(--text-muted)}

.atb-lista{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:10px;
  list-style:none;margin:0;padding:0}
.atb-linha{display:flex;flex-direction:column;gap:6px;min-width:0;padding:10px 12px;
  background:var(--surface-card);border:1px solid var(--border-default);
  border-left:4px solid var(--border-strong);border-radius:var(--radius-lg,12px);box-shadow:var(--shadow-card)}

.atb-linha__topo{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;min-width:0}
.atb-linha__droga{flex:1 1 120px;min-width:0;font-size:var(--text-md,17px);font-weight:700;
  line-height:var(--leading-tight,1.15);color:var(--text-heading);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.atb-via{padding:2px 7px;border-radius:var(--radius-pill,9999px);background:var(--badge-atb-bg);
  color:var(--badge-atb-text);font-size:var(--text-2xs,10px);font-weight:700;
  letter-spacing:var(--tracking-wide,.04em)}
.atb-dia{font-size:var(--text-md,17px);font-weight:700;line-height:var(--leading-tight,1.15)}
.atb-flag{padding:2px 8px;border:1px solid transparent;border-radius:var(--radius-pill,9999px);
  font-family:var(--font-mono,monospace);font-size:var(--text-2xs,10px);font-weight:700;
  letter-spacing:var(--tracking-wide,.04em);text-transform:uppercase;white-space:nowrap}

.atb-linha__regua{display:flex;align-items:center;gap:8px}
.atb-regua{position:relative;flex:1 1 auto;height:6px;border-radius:var(--radius-pill,9999px);
  background:var(--surface-sunken);overflow:hidden}
.atb-regua__fill{position:absolute;inset-block:0;left:0;border-radius:var(--radius-pill,9999px)}
.atb-regua__marca{position:absolute;inset-block:0;width:1px;background:var(--border-strong)}
.atb-linha__inicio{flex:0 0 auto;font-size:var(--text-2xs,10px);color:var(--text-faint)}

.atb-linha__base{display:flex;flex-wrap:wrap;gap:10px 16px}
.atb-campo{display:flex;flex-direction:column;gap:1px;min-width:0}
.atb-campo__rot{font-size:var(--text-2xs,10px);font-weight:700;letter-spacing:var(--tracking-eyebrow,.08em);
  text-transform:uppercase;color:var(--text-faint)}
.atb-campo__val{font-size:var(--text-sm,13px);color:var(--text-body);overflow-wrap:anywhere}
.atb-campo__val--vazio{color:var(--text-faint)}

.atb-rodape{margin:0;font-size:var(--text-2xs,10px);line-height:var(--leading-snug,1.35);color:var(--text-faint)}

.atb-vazio{display:flex;flex-direction:column;gap:6px;padding:20px 16px;text-align:center;
  background:var(--surface-card);border:1px dashed var(--border-strong);border-radius:var(--radius-lg,12px)}
.atb-vazio__titulo{font-size:var(--text-md,17px);color:var(--text-heading)}
.atb-vazio__txt{max-width:62ch;margin:0 auto;font-size:var(--text-sm,13px);
  line-height:var(--leading-snug,1.35);color:var(--text-muted)}
`;

export default AtbStewardship;
