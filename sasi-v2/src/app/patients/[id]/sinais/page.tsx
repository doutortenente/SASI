// ============================================================================
// SASI v2 — Aba "Sinais 24h" do paciente
// ----------------------------------------------------------------------------
// Rota: /patients/[id]/sinais   (cabecalho e abas vivem no layout.tsx)
// Server Component. Le o banco aqui e entrega dado pronto aos componentes —
// nenhum componente desta aba abre conexao.
//
// O QUE ESTA TELA LE DO BANCO
//   serieVitais24h(id, { horas: 24, tipos })  -> eventos_clinicos agregados por
//        tipo em MAXIMO / MINIMO / ultimo (+ n, fora_faixa, requires_review)
//   listarEventos(id, { tipos, desdeHoras:24 }) -> pontos crus (ts, valor_num)
//        para o sparkline: o agregado nao carrega a serie
//   getTipoRefMap()                           -> evento_tipo_ref: rotulo,
//        unidade_padrao e faixa_min/faixa_max (a faixa que dispara a flag)
//   getBhAcumulado(id)                        -> vw_bh_acumulado (bh_24/48/72h)
//   listarEventos(id, { tipos:['bh_h','diurese_h'], desdeHoras:72 })
//                                             -> lastro do BH e a diurese horaria
//   getPaciente(id)                           -> pacientes.peso (mL/kg/h)
//
// DOUTRINA APLICADA
//  - MAXIMO antes do MINIMO, sempre (a tabela impoe a ordem).
//  - Sem medida => "—". Nunca 0, nunca unidade chutada, nunca valor estimado.
//  - `pam_min` (PA média mínima) so aparece se TIVER medida: e um tipo real do
//    vocabulario e some da tela quando vazio para nao poluir — mas nunca some
//    quando ha dado, senao medida real desapareceria do plantao.
//  - CSS injetado UMA vez aqui (padrao BedGrid/BedCard): hover, scroll e sticky
//    nao cabem em estilo inline.
//
// DOIS AVISOS QUE ESTA ABA PRECISA DAR (conferido no banco vivo em 30-jul-2026)
//  1. evento_tipo_ref so tem policy de SELECT para o papel `authenticated` e o
//     app usa a chave anon => a dimensao volta VAZIA. Nesse estado o rotulo vira
//     o codigo cru, nao ha unidade padrao e — o que importa de verdade — NAO HA
//     faixa fisiologica: nenhum valor e sinalizado como implausivel. Uma flag
//     desligada em silencio e pior que flag nenhuma, entao a tela grita isso.
//     Correcao e a montante (policy de leitura para anon ou login real).
//  2. Hoje NENHUM vital tem lancamento nas ultimas 24 h (os eventos existentes
//     sao mais antigos). A tabela mostra "—" em tudo, e o rodape diz de quando e
//     a medida mais recente — "não registrado" nunca deve ser lido como
//     "não medido no leito".
// ============================================================================
import type {ReactElement} from "react";
import {notFound} from "next/navigation";
import {
  getBhAcumulado,
  getPaciente,
  getTipoRefMap,
  listarEventos,
  serieVitais24h,
  type SerieVital
} from "@/lib/data";
import type {EventoClinico, EventoTipoRef} from "@/types/clinical";
import {
  CSS_VITALS_TABLE,
  type LinhaVital,
  VitalsTable
} from "@/features/vitals/components/VitalsTable";
import {
  BalancoHidrico,
  CSS_BALANCO_HIDRICO,
  type PontoBh
} from "@/features/vitals/components/BalancoHidrico";
import type {PontoSparkline} from "@/features/vitals/components/Sparkline";
import {unidadeSegura} from "@/lib/formatters/br";

export const dynamic = "force-dynamic";

/** Janela clinica da aba. */
const HORAS = 24;
/** Janela do balanco (a view acumula ate 72 h). */
const HORAS_BH = 72;

/**
 * Ordem de leitura dos vitais (codigos de evento_tipo_ref).
 * `pam_min` entra na consulta mas so vira linha se tiver medida — ver filtro abaixo.
 */
const TIPOS_VITAIS: string[] = ["pa_sys", "pa_dia", "pam", "pam_min", "fc", "fr", "spo2", "temp", "glicemia"];

/** Tipos do bloco de balanco hidrico. */
const TIPOS_BH: string[] = ["bh_h", "diurese_h"];

/**
 * Unidade de um tipo: primeiro a dimensao (evento_tipo_ref.unidade_padrao),
 * senao a unidade REGISTRADA no evento mais recente. Nenhuma das duas => null
 * (e a tela nao inventa "mL").
 */
function unidadeDe(codigo: string, refs: Map<string, EventoTipoRef>, eventos: EventoClinico[]): string | null {
  const padrao = refs.get(codigo)?.unidade_padrao;
  if (padrao) return padrao;
  for (let i = eventos.length - 1; i >= 0; i -= 1) {
    const ev = eventos[i];
    if (ev.tipo === codigo && ev.unidade) return unidadeSegura(ev.unidade);
  }
  return null;
}

const FMT_QUANDO = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** ts ISO -> "30/07/2026 04:12" (fuso do plantao). Invalido => null. */
function quando(ts: string | null | undefined): string | null {
  if (!ts) return null;
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : FMT_QUANDO.format(d);
}

/** Distancia ate agora, em linguagem de plantao. */
function haQuanto(ts: string, agora: number): string | null {
  const t = new Date(ts).getTime();
  if (Number.isNaN(t)) return null;
  const horas = Math.floor((agora - t) / 3_600_000);
  if (horas < 1) return "há menos de 1 h";
  if (horas < 48) return `há ${horas} h`;
  return `há ${Math.floor(horas / 24)} d`;
}

/** Pontos (ts, valor) de UM tipo, em ordem cronologica. Evento sem valor_num nao entra. */
function pontosDe(eventos: EventoClinico[], codigo: string): PontoBh[] {
  const saida: PontoBh[] = [];
  for (const ev of eventos) {
    if (ev.tipo !== codigo || ev.valor_num == null) continue;
    saida.push({ts: ev.ts, valor: ev.valor_num});
  }
  return saida;
}

export interface SinaisPageProps {
  params: Promise<{ id: string }>;
}

export default async function SinaisPage({params}: SinaisPageProps): Promise<ReactElement> {
  const {id} = await params;

  const [paciente, series, eventosVitais, refs, bh, eventosBhDiurese, ultimoVital] = await Promise.all([
    getPaciente(id),
    serieVitais24h(id, {horas: HORAS, tipos: TIPOS_VITAIS}),
    listarEventos(id, {tipos: TIPOS_VITAIS, desdeHoras: HORAS, crescente: true}),
    getTipoRefMap(),
    getBhAcumulado(id),
    listarEventos(id, {tipos: TIPOS_BH, desdeHoras: HORAS_BH, crescente: true}),
    // SEM corte de janela: so para dizer de QUANDO e a medida mais recente
    // quando as 24 h estao vazias. Nunca entra na tabela.
    listarEventos(id, {tipos: TIPOS_VITAIS, limite: 1}),
  ]);

  if (!paciente) notFound();

  // ---- pontos do sparkline, agrupados por tipo (o agregado nao traz a serie) --
  const pontosPorTipo = new Map<string, PontoSparkline[]>();
  for (const ev of eventosVitais) {
    if (ev.valor_num == null) continue; // ausencia NUNCA vira ponto no grafico
    const lista = pontosPorTipo.get(ev.tipo);
    if (lista) lista.push({ts: ev.ts, valor: ev.valor_num});
    else pontosPorTipo.set(ev.tipo, [{ts: ev.ts, valor: ev.valor_num}]);
  }

  // ---- linhas da tabela: agregado + faixa da dimensao + pontos ---------------
  const linhas: LinhaVital[] = series
    .filter((s: SerieVital) => s.tipo !== "pam_min" || s.n > 0)
    .map((s: SerieVital): LinhaVital => {
      const ref = refs.get(s.tipo);
      return {
        ...s,
        faixa_min: ref?.faixa_min ?? null,
        faixa_max: ref?.faixa_max ?? null,
        pontos: pontosPorTipo.get(s.tipo) ?? [],
      };
    });

  // ---- balanco hidrico -------------------------------------------------------
  const eventosBh = pontosDe(eventosBhDiurese, "bh_h");
  const eventosDiurese = pontosDe(eventosBhDiurese, "diurese_h");

  // ---- avisos honestos sobre o que a tela NAO conseguiu medir -----------------
  const semDimensao = refs.size === 0;
  const semMedida24h = linhas.every((l: LinhaVital) => l.n === 0);
  const foraDaJanela = semMedida24h && ultimoVital.length > 0 ? ultimoVital[0] : null;
  const agora = Date.now();

  return (
    <div className="sinais">
      <style
        dangerouslySetInnerHTML={{__html: CSS_SINAIS + CSS_VITALS_TABLE + CSS_BALANCO_HIDRICO}}/>

      {/* Flag desligada precisa GRITAR: sem a dimensao nao ha faixa fisiologica,
          logo nenhum valor implausivel sera marcado nesta tela. */}
      {semDimensao ? (
        <p className="sinais__aviso sinais__aviso--grave">
          <strong>Sinalização de valor implausível DESLIGADA nesta sessão.</strong> A dimensão{" "}
          <code className="tabnum">evento_tipo_ref</code> voltou vazia (a única policy de leitura é
          para o papel{" "}
          <code className="tabnum">authenticated</code> e o app usa a chave anônima). Sem ela não há
          rótulo clínico,
          unidade padrão nem <code className="tabnum">faixa_min</code>/<code
          className="tabnum">faixa_max</code> — os
          valores abaixo aparecem como vieram, e <strong>nenhum</strong> é marcado como fora de
          faixa. Correção é a
          montante: policy de leitura para anônimo ou login real.
        </p>
      ) : null}

      <VitalsTable linhas={linhas} horas={HORAS} semDimensao={semDimensao}/>

      {semMedida24h ? (
        <p className="sinais__aviso">
          {foraDaJanela ? (
            <>
              <strong>Nenhum sinal vital lançado nas últimas {HORAS} h.</strong> A medida mais
              recente deste paciente é
              de <span className="tabnum">{quando(foraDaJanela.ts) ?? "—"}</span>
              {haQuanto(foraDaJanela.ts, agora) ? ` (${haQuanto(foraDaJanela.ts, agora)})` : ""} —
              fora desta janela,
              por isso a tabela mostra {"—"} em todas as linhas. Sem registro não significa sem
              medida no leito:
              significa que não chegou ao <code className="tabnum">eventos_clinicos</code>.
            </>
          ) : (
            <>
              <strong>Este paciente não tem nenhum sinal vital em <code
                className="tabnum">eventos_clinicos</code>.</strong>{" "}
              Nada foi lançado até agora — a tabela mostra {"—"} em todas as linhas e o app não
              preenche o vazio.
            </>
          )}
        </p>
      ) : null}

      <BalancoHidrico
        bh={bh}
        eventosBh={eventosBh}
        eventosDiurese={eventosDiurese}
        pesoKg={paciente.peso}
        unidadeBh={unidadeDe("bh_h", refs, eventosBhDiurese)}
        unidadeDiurese={unidadeDe("diurese_h", refs, eventosBhDiurese)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// CSS do empilhamento da aba (os blocos trazem o proprio CSS).
// ---------------------------------------------------------------------------
const CSS_SINAIS = `
.sinais{display:flex;flex-direction:column;gap:20px;min-width:0}

.sinais__aviso{margin:0;padding:10px 12px;
  background:color-mix(in srgb, var(--warning) 10%, var(--surface-card));
  border:1px solid color-mix(in srgb, var(--warning) 34%, transparent);
  border-left:4px solid var(--warning);border-radius:var(--radius-lg,12px);
  font-size:var(--text-sm,13px);line-height:var(--leading-snug,1.35);color:var(--text-body)}
.sinais__aviso strong{color:var(--text-heading)}
.sinais__aviso--grave{background:color-mix(in srgb, var(--danger) 8%, var(--surface-card));
  border-color:color-mix(in srgb, var(--danger) 34%, transparent);border-left-color:var(--danger)}
`;
