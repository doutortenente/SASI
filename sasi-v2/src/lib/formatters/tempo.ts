// ============================================================================
// SASI v2 — formatadores de TEMPO (fuso do plantao, calculados no SERVIDOR)
// ----------------------------------------------------------------------------
// DOUTRINA: nao existe conta de data no client. O servidor pode estar em UTC, o
// medico nunca esta — entao "ha quanto tempo foi a ultima evolucao" e sempre
// calculado aqui, no fuso America/Sao_Paulo, e entregue pronto (texto) a tela.
// Fonte unica: /beds e /rounds usam este mesmo resumo (nao duplicar a conta).
// ============================================================================

/** Fuso do plantao. */
const FUSO = "America/Sao_Paulo";

/** Sem evolucao ha este tanto de horas => "atrasada" (o dado ja pode nao valer). */
export const HORAS_EVOLUCAO_ATRASADA = 24;

const TRAVESSAO = "—";

const fmtHora = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: FUSO
});
const fmtDiaMes = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: FUSO
});
const fmtDiaCheio = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: FUSO,
});

/** Estado da ultima evolucao, JA formatado no servidor. */
export interface EvolucaoResumo {
  /** Ex.: "hoje 06:12", "29/07 19:40" ou "—" quando nao ha evolucao. */
  rotulo: string;
  /** true = sem evolucao nas ultimas 24 h (ou nenhuma evolucao registrada). */
  atrasada: boolean;
}

/**
 * Quando foi a ultima evolucao, em texto curto ("hoje 06:12" / "29/07 19:40").
 * Sem evolucao (ou data ilegivel) => "—" e conta como ATRASADA — que e
 * exatamente o que exige acao (dado velho nao deve ser confundido com dado novo).
 */
export function resumoEvolucao(iso: string | null | undefined, agora: Date): EvolucaoResumo {
  if (!iso) return {rotulo: TRAVESSAO, atrasada: true};
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return {rotulo: TRAVESSAO, atrasada: true};

  const horas = (agora.getTime() - t.getTime()) / 3_600_000;
  const rotulo =
    fmtDiaCheio.format(t) === fmtDiaCheio.format(agora)
      ? `hoje ${fmtHora.format(t)}`
      : `${fmtDiaMes.format(t)} ${fmtHora.format(t)}`;
  return {rotulo, atrasada: horas >= HORAS_EVOLUCAO_ATRASADA};
}
