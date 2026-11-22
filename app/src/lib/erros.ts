// ============================================================================
// SASI — falha de leitura do banco: ERRO GRITA, nao vira "sem dados"
// ----------------------------------------------------------------------------
// ANTES: toda funcao da camada de dados engolia o erro e devolvia []/null.
// A tela nao distingue "consulta falhou" de "paciente nao tem dado" — e imprimia
// afirmacoes clinicas falsas ("Nenhum sinal vital lançado", "sem alerta") durante
// uma queda de rede ou mudanca de policy. Doutrina: dado ausente e "—";
// LEITURA QUEBRADA e ERRO — e erro aparece como erro (app/error.tsx), nunca
// disfarcado de prontuario vazio.
//
// Este helper loga o detalhe no servidor e lanca um Error com mensagem SEGURA
// (nome da funcao + codigo — sem SQL, sem linha de dado de paciente).
// ============================================================================

type ErroPostgrest = { message?: string | null; code?: string | null; details?: string | null } | null;

/** Loga o detalhe no servidor e devolve o Error para `throw`. */
export function falhaBanco(origem: string, fn: string, e: ErroPostgrest): Error {
  const detalhe = `${e?.message ?? "erro desconhecido"}${e?.code ? ` (${e.code})` : ""}`;
  console.error(`[${origem}] ${fn}: ${detalhe}`);
  return new Error(`Falha ao ler o banco em ${fn}${e?.code ? ` [${e.code}]` : ""}`);
}
