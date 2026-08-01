// ============================================================================
// SASI v2 — /handoff · PASSAGEM DE TURNO (todos os leitos, 3 linhas por leito)
// ----------------------------------------------------------------------------
// Server Component: le o banco no servidor e entrega a passagem pronta —
// na tela, no papel e como TEXTO PURO para a area de transferencia.
//
// O QUE ESTA TELA LE DO BANCO (camada de dados @/lib/data):
//   1. listarLeitosAtivos()       -> view vw_dashboard_uti
//        1 linha por leito ativo: leito, nome, idade, HD, dias de internacao,
//        SOFA da ultima evolucao, delta_sofa_24h, dvas, sedativos, dispositivos,
//        isolamento, severidade_visual e contagem de pendencias abertas.
//   2. mapearUltimasEvolucoes(ids) -> tabela evolucoes (TODAS numa consulta so)
//        conduta vigente (condutas_sistemas / conduta), riscos e suporte
//        ventilatorio (resp.suporte) da ultima evolucao.
//   3. mapearPendenciasAbertas()  -> tabela pendencias (1 consulta para todos)
//        so as abertas, ja ordenadas por prioridade (1 alta) e mais antigas antes.
//   4. listarAtbsAtivos()         -> view vw_dias_atb_ativo (1 consulta para todos)
//        antibioticos EM CURSO com D+n e flag de stewardship, contados no banco.
//   5. listarPacientes()          -> tabela pacientes (1 consulta para todos)
//        o que a view NAO tem e a passagem exige: alergias e riscos_flags.
//
// ORDEM: por leito (UTI2 L01 -> UTI4 L08), do jeito que se caminha a unidade —
// a passagem nao pode pular ninguem. A ordenacao por GRAVIDADE e o /rounds.
//
// Nada e calculado aqui: SOFA e D-ATB vem prontos do banco, a gravidade vem de
// features/war-room/triage e o texto vem de HandoffCard.textoDaPassagem().
// Onde falta dado, sai "—"; onde falta REGISTRO, sai a frase ("não registradas").
// ============================================================================
import type {ReactElement} from "react";
import {gravityDe} from "@/features/war-room/triage";
import {CopyButton, CSS_EXPORT_ACOES, PrintButton} from "@/features/exports/components/CopyButton";
import {
  CSS_HANDOFF_CARD,
  HandoffCard,
  type HandoffLeito,
  textoDaPassagem,
} from "@/features/exports/components/HandoffCard";
import {
  mapearUltimasEvolucoes,
  listarAtbsAtivos,
  listarLeitosAtivos,
  listarPacientes,
  mapearPendenciasAbertas,
  type VwDiasAtbAtivo,
} from "@/lib/data";
import type {Evolucao, Paciente, Pendencia, VwDashboardUti} from "@/types/clinical";

export const dynamic = "force-dynamic";

/** Fuso do plantao: o servidor pode estar em UTC, o medico nunca esta. */
const FUSO = "America/Sao_Paulo";
/** Como o fuso aparece para quem le a tela ou o papel (nada de identificador tecnico). */
const FUSO_ROTULO = "horário de Brasília";

/** "30/07/2026 às 07:12" — formatado no SERVIDOR (nao ha data no client). */
function agoraNoPlantao(): string {
  const agora = new Date();
  const data = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: FUSO,
  }).format(agora);
  const hora = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: FUSO,
  }).format(agora);
  return `${data} às ${hora}`;
}

export default async function HandoffPage(): Promise<ReactElement> {
  // 1. leitos ativos, na ordem da view (uti, leito). gravityDe rotula SEM reordenar.
  const linhas = await listarLeitosAtivos();
  const ids = linhas.map((l: VwDashboardUti) => l.paciente_id);

  // 2. o resto em paralelo — 4 consultas de CONJUNTO (antes era 1 evolucao POR
  //    leito: 33 leitos = 33 idas ao banco so nesta pagina)
  const [pendencias, atbs, pacientes, evolucoes] = await Promise.all([
    mapearPendenciasAbertas(ids),
    listarAtbsAtivos(),
    listarPacientes(),
    mapearUltimasEvolucoes(ids),
  ]);

  const atbPorPaciente = new Map<string, VwDiasAtbAtivo[]>();
  for (const a of atbs) {
    const atual = atbPorPaciente.get(a.paciente_id);
    if (atual) atual.push(a);
    else atbPorPaciente.set(a.paciente_id, [a]);
  }

  const cadastro = new Map<string, Paciente>(pacientes.map((p: Paciente) => [p.id, p] as const));

  const leitos: HandoffLeito[] = linhas.map((l: VwDashboardUti, i: number): HandoffLeito => {
    const p = cadastro.get(l.paciente_id) ?? null;
    const evolucao: Evolucao | null = evolucoes.get(l.paciente_id) ?? null;
    return {
      leito: {...l, gravity: gravityDe(l)},
      evolucao,
      pendencias: pendencias.get(l.paciente_id) ?? [],
      atbs: atbPorPaciente.get(l.paciente_id) ?? [],
      alergias: p?.alergias ?? null,
      riscosFlags: p?.riscos_flags ?? null,
    };
  });

  // 3. o texto puro: montado UMA vez, no servidor. E o mesmo que a tela mostra.
  const geradoEm = agoraNoPlantao();
  const texto = textoDaPassagem(leitos, {geradoEm, fuso: FUSO_ROTULO});

  const total = leitos.length;
  const utis = Array.from(new Set(leitos.map((h: HandoffLeito) => h.leito.uti)));
  const pendAltas = leitos.reduce(
    (soma: number, h: HandoffLeito) => soma + h.pendencias.filter((p: Pendencia) => p.prioridade === 1).length,
    0,
  );

  return (
    <section className="hoff" aria-labelledby="hoff-ttl">
      <style dangerouslySetInnerHTML={{__html: CSS_HANDOFF + CSS_HANDOFF_CARD + CSS_EXPORT_ACOES}}/>

      <header className="hoff__cab">
        <div className="hoff__ttl-bloco">
          {/* na TELA o <h1> e da TopBar; no PAPEL a TopBar some — por isso este
              rotulo fica: e ele que identifica o documento impresso. */}
          <p className="hoff__eyebrow">Passagem de turno · SASI</p>
          <h2 className="hoff__ttl" id="hoff-ttl">
            <span
              className="tabnum">{total}</span> leito{total === 1 ? "" : "s"} ativo{total === 1 ? "" : "s"}
            {utis.length > 0 ? ` · ${utis.join(" · ")}` : ""}
          </h2>
          <p className="hoff__sub tabnum">
            Gerada em {geradoEm} ({FUSO_ROTULO}) · ordem de leito
            {pendAltas > 0 ? (
              <>
                {" · "}
                <b style={{color: "var(--danger)"}}>
                  {pendAltas} pendência{pendAltas > 1 ? "s" : ""} de prioridade alta
                </b>
              </>
            ) : null}
          </p>
        </div>

        <div className="hoff__acoes">
          <CopyButton texto={texto}/>
          <PrintButton/>
        </div>
      </header>

      <p className="hoff__legenda">
        3 linhas por leito — <b>1.</b> síntese (leito, nome, idade, HD) · <b>2.</b> o que mudou
        (SOFA, conduta
        vigente, suporte, ATB em D+n) · <b>3.</b> pendências e riscos. Campo sem dado no banco
        aparece como
        travessão; ausência de registro é dita por extenso.
      </p>

      {total === 0 ? (
        <div className="hoff__vazio">
          <p className="hoff__vazio-ttl">Nenhum leito ativo</p>
          <p className="hoff__vazio-txt">
            A visão <code className="tabnum">vw_dashboard_uti</code> não devolveu nenhum paciente
            com leito ativo —
            todos receberam alta/óbito/transferência, ou a leitura do banco falhou. Não há passagem
            a gerar.
          </p>
        </div>
      ) : (
        <ol className="hoff__lista">
          {leitos.map((h: HandoffLeito, i: number) => (
            <li key={h.leito.paciente_id} className="hoff__item">
              <HandoffCard h={h} ordem={i + 1}/>
            </li>
          ))}
        </ol>
      )}

      {/* Transparencia: o texto EXATO que o botao copia. Serve de saida manual
          se a area de transferencia falhar (rede http, permissao negada). */}
      <details className="hoff__cru">
        <summary className="hoff__cru-ttl">Texto que será copiado (selecione e copie manualmente, se
          precisar)
        </summary>
        <pre className="hoff__cru-txt">{texto}</pre>
      </details>

      <p className="hoff__rodape tabnum">
        SASI · Comando UTI — {total} leito{total === 1 ? "" : "s"} · {geradoEm} ({FUSO_ROTULO})
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CSS da pagina. So tokens do design system — EXCETO dentro de @media print,
// onde os proprios TOKENS sao redefinidos para papel (preto no branco). Isso e
// deliberado: a alternativa seria hex espalhado por regra, que e o que a
// doutrina proibe. Aqui a troca acontece em UM lugar, na camada de token, e
// vale para os dois temas (clinical e tactical).
// ---------------------------------------------------------------------------
const CSS_HANDOFF = `
.hoff{display:flex;flex-direction:column;gap:14px;min-width:0}

.hoff__cab{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:10px 16px}
.hoff__ttl-bloco{display:flex;flex-direction:column;gap:2px;min-width:0}
.hoff__eyebrow{margin:0;font-size:var(--text-2xs,10px);font-weight:700;
  letter-spacing:var(--tracking-eyebrow,.08em);text-transform:uppercase;color:var(--text-muted)}
.hoff__ttl{margin:0;font-size:var(--text-lg,20px);font-weight:700;line-height:var(--leading-tight,1.15);
  color:var(--text-heading)}
.hoff__sub{margin:0;font-size:var(--text-xs,11px);color:var(--text-muted)}
.hoff__acoes{display:flex;flex-wrap:wrap;align-items:center;gap:8px}

.hoff__legenda{margin:0;padding:8px 12px;background:var(--surface-raised);
  border:1px solid var(--border-subtle);border-radius:var(--radius-md,8px);
  font-size:var(--text-xs,11px);line-height:var(--leading-snug,1.35);color:var(--text-muted)}
.hoff__legenda b{color:var(--text-body)}

.hoff__lista{display:flex;flex-direction:column;gap:8px;margin:0;padding:0;list-style:none}
.hoff__item{min-width:0}

.hoff__vazio{display:flex;flex-direction:column;gap:8px;padding:28px 24px;background:var(--surface-card);
  border:1px dashed var(--border-strong);border-radius:var(--radius-xl,16px)}
.hoff__vazio-ttl{margin:0;font-size:var(--text-lg,20px);font-weight:700;color:var(--text-heading)}
.hoff__vazio-txt{margin:0;max-width:64ch;font-size:var(--text-sm,13px);line-height:var(--leading-normal,1.55);
  color:var(--text-muted)}
.hoff__vazio code{font-family:var(--font-mono,monospace);font-size:var(--text-xs,11px);color:var(--text-body)}

.hoff__cru{padding:8px 12px;background:var(--surface-card);border:1px solid var(--border-default);
  border-radius:var(--radius-md,8px)}
.hoff__cru-ttl{min-height:44px;display:flex;align-items:center;cursor:pointer;
  font-size:var(--text-xs,11px);font-weight:700;color:var(--text-muted)}
.hoff__cru-ttl:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.hoff__cru-txt{margin:0;padding:10px 0 4px;font-family:var(--font-mono,monospace);
  font-size:var(--text-xs,11px);line-height:var(--leading-snug,1.35);color:var(--text-body);
  white-space:pre-wrap;word-break:break-word;user-select:text}

.hoff__rodape{margin:0;font-size:var(--text-2xs,10px);color:var(--text-faint)}

/* ---------------------------------------------------------------------------
   IMPRESSAO — A4, preto no branco, sem chassi. O trilho lateral, a barra
   superior, os botoes e o bloco de texto cru saem do papel; o cartao de cada
   leito nao se parte entre paginas.
   --------------------------------------------------------------------------- */
@page{size:A4 portrait;margin:12mm}

@media print{
  :root,[data-theme="tactical"]{
    --surface-app:#ffffff;--surface-card:#ffffff;--surface-raised:#ffffff;--surface-sunken:#ffffff;
    --text-heading:#000000;--text-body:#000000;--text-muted:#222222;--text-faint:#444444;
    --border-subtle:#bbbbbb;--border-default:#888888;--border-strong:#555555;
    --shadow-card:none;--shadow-raised:none;--shadow-pop:none;
  }
  html,body{background:#ffffff;color:#000000}
  .sasi-rail,.sasi-topbar,.sasi-skip,.hoff__acoes,.hoff__cru{display:none !important}
  .sasi-shell__col{margin-left:0 !important}
  .sasi-content{max-width:none !important;padding:0 !important}
  .hoff{gap:8px}
  .hoff__ttl{font-size:14pt}
  .hoff__sub,.hoff__legenda,.hoff__rodape{font-size:8pt}
  .hoff__legenda{background:none;border:0;padding:0}
  .hoff__lista{gap:5px}
  .hcard{box-shadow:none;border:1px solid var(--border-default);border-radius:0;padding:6px 8px;gap:3px}
  .hcard__ttl{font-size:11pt}
  .hcard__meta,.hcard__hd,.hcard__txt{font-size:9pt}
  .hcard__rot{font-size:7pt}
  .hcard__leito{border-bottom:0}
  .hoff__rodape{margin-top:6px;border-top:1px solid var(--border-subtle);padding-top:4px}
}
`;
