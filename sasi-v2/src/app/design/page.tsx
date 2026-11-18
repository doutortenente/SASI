// ============================================================================
// SASI v2 — /design: galeria-protótipo do Design System "Comando UTI"
// Reescrita em Next.js (App Router) do packages/design-system aposentado na
// faxina de 31-jul-2026. Cada primitiva aqui é o componente real de
// src/components/ui e src/components/clinical — os mesmos que as telas usam.
// Temas: use o toggle "Tema" da TopBar (Clinical claro ↔ Tactical escuro);
// tokens e componentes são co-iguais nos dois temas.
// ============================================================================
import type {ReactElement} from "react";
import {Badge} from "@/components/ui/Badge";
import {Button} from "@/components/ui/Button";
import {Card} from "@/components/ui/Card";
import {Input} from "@/components/ui/Input";
import {GravityBadge} from "@/components/clinical/GravityBadge";
import {SofaBadge} from "@/components/clinical/SofaBadge";
import {TherapyBadge} from "@/components/clinical/TherapyBadge";
import {VitalStat} from "@/components/clinical/VitalStat";
import {GaleriaInterativa} from "./GaleriaInterativa";

const CSS_GALERIA = `
.ds-gal{display:grid;gap:var(--space-6,32px);max-width:960px}
.ds-gal__intro{display:grid;gap:6px}
.ds-gal__dump{font-size:var(--text-sm);color:var(--text-muted);line-height:var(--leading-snug)}
.ds-gal__secao{display:grid;gap:var(--space-3,12px)}
.ds-gal__suporte{border-top:1px solid var(--border-default);padding-top:var(--space-3,12px)}
.ds-gal__linha{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.ds-gal__grade{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px}
.ds-gal__nota{font-size:var(--text-xs);color:var(--text-faint)}
.ds-gal__campo{display:grid;gap:12px;max-width:360px}

`;

export const metadata = {
  title: "Design System — SASI",
  description: "Galeria do design system Comando UTI (protótipo Next.js do sasi-v2)",
};

export default function PaginaDesign(): ReactElement {
  return (
    <div className="ds-gal">
      <style dangerouslySetInnerHTML={{__html: CSS_GALERIA}}/>

      {/* ---------- introdução ---------- */}
      <section className="ds-gal__intro">
        <span className="sasi-eyebrow">Design System · Comando UTI</span>
        <h2 className="sasi-topbar__h1">Fundamentos, primitivas e sinais clínicos</h2>
        <p className="ds-gal__dump">
          Porte do design system antigo (packages/design-system, aposentado na faxina de 31-jul-2026) para o App Router
          do Next.js. Cuidados mantidos da doutrina: cada cor é um sinal (nunca decoração), cor não é o único sinal
          (sempre há rótulo em texto), números em mono tabular e dados ausentes viram “—”, nunca 0. Alterne o tema pela
          TopBar: Clinical (claro) ↔ Tactical (escuro), co-iguais.
        </p>
      </section>

      {/* ---------- botões ---------- */}
      <section className="ds-gal__secao">
        <span className="sasi-eyebrow">Button</span>
        <div className="ds-gal__linha">
          <Button variante="primary">Exportar passagem (PDF)</Button>
          <Button variante="secondary">Novo leito</Button>
          <Button variante="soft">Enviar link mágico</Button>
          <Button variante="ghost" tamanho="sm">Colar paste (ghost · sm)</Button>
          <Button variante="danger" tamanho="sm">Reverter ingest</Button>
          <Button variante="success" tamanho="sm">Marcar como lido</Button>
          <Button variante="primary" tamanho="sm" bloqueia>
            bloco · largura total
          </Button>
        </div>
        <p className="ds-gal__nota">A primária é única por tela: dirige a ação principal (exportar, salvar, enviar).</p>
      </section>

      {/* ---------- badges ---------- */}
      <section className="ds-gal__secao">
        <span className="sasi-eyebrow">Badge (tom × variante)</span>
        <div className="ds-gal__linha">
          <Badge tom="neutral">Neutro</Badge>
          <Badge tom="accent" variante="outline">Contorno accent</Badge>
          <Badge tom="accent" variante="solid">Sólido</Badge>
          <Badge tom="success">ATB 48h sem cultura</Badge>
          <Badge tom="warning">Dado atrasado</Badge>
          <Badge tom="danger" variante="solid">Sepse-3 positivo</Badge>
        </div>
      </section>

      {/* ---------- gravidade + SOFA ---------- */}
      <section className="ds-gal__secao">
        <span className="sasi-eyebrow">Gravidade e SOFA (os sinais cardeais)</span>
        <div className="ds-gal__linha">
          <GravityBadge level="critical"/>
          <GravityBadge level="unstable"/>
          <GravityBadge level="watcher"/>
          <GravityBadge level="stable"/>
          <GravityBadge level="deceased"/>
        </div>
        <div className="ds-gal__linha">
          <GravityBadge level="critical" dot/>
          <GravityBadge level="watcher" dot/>
          <GravityBadge level="stable" dot tamanho="lg"/>
        </div>
        <div className="ds-gal__linha">
          <SofaBadge score={13} delta={3}/>
          <SofaBadge score={9} delta={-2}/>
          <SofaBadge score={4}/>
          <SofaBadge score={null} delta={0}/>
        </div>
        <p className="ds-gal__nota">
          Faixas de SOFA: 12+ crítico · 8–11 alto · 4–7 médio · 0–3 baixo · “—” quando a folha não captura os 6
          componentes (não inventa número). Δ24h: subida é vermelho, queda é verde.
        </p>
      </section>

      {/* ---------- terapias ---------- */}
      <section className="ds-gal__secao">
        <span className="sasi-eyebrow">TherapyBadge (o que muda conduta)</span>
        <div className="ds-gal__linha">
          <TherapyBadge type="dva" count={2}/>
          <TherapyBadge type="sed" label="Sed · propofol 200 mg/h"/>
          <TherapyBadge type="vm"/>
          <TherapyBadge type="vni"/>
          <TherapyBadge type="atb" label="ATB · D4"/>
          <TherapyBadge type="pend" count={3}/>
          <TherapyBadge type="sepsis" pulse/>
        </div>
      </section>

      {/* ---------- cards ---------- */}
      <section className="ds-gal__secao">
        <span className="sasi-eyebrow">Card (com fluxo numerado e gravidade)</span>
        <div className="ds-gal__grade">
          <Card numero={1} eyebrow="Situação atual" titulo="Choque séptico SCAI C" gravidade="critical">
            <div className="ds-gal__linha">
              Foco pulmonar · noradrenalina <span className="tabnum">0,42 mcg/kg/min</span>
              <SofaBadge score={13} delta={3}/>
            </div>
          </Card>
          <Card numero={2} eyebrow="Meta" titulo="Titular noradrenalina → PAM ≥ 65" gravidade="unstable" interativo>
            <p className="ds-gal__nota">Card interativo: hover eleva (translateY + shadow-raised).</p>
          </Card>
          <Card eyebrow="Evolução" titulo="Sem dado de SOFA" gravidade="watcher">
            <p className="ds-gal__nota">
              Card com barra de gravidade à esquerda (border-left --gravity-bar) e rótulo de cor por token.
            </p>
          </Card>
        </div>
      </section>

      {/* ---------- estatísticas + controles (client) ---------- */}
      <section className="ds-gal__secao">
        <span className="sasi-eyebrow">StatPill e SegmentedControl (interativos)</span>
        <GaleriaInterativa/>
        <p className="ds-gal__nota">
          Números em mono tabular. Δ&gt;0 = piora (vermelho) · Δ&lt;0 = melhora (verde).
        </p>
      </section>

      {/* ---------- formulário ---------- */}
      <section className="ds-gal__secao">
        <span className="sasi-eyebrow">Input (formulário)</span>
        <div className="ds-gal__campo">
          <Input
            label="Buscar paciente"
            placeholder="Nome, leito ou prontuário…"
            hint="Busca por nome, leito corrente ou prontuário (sem acento)."
            icone={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <circle cx="11" cy="11" r="7"/>
                <path d="m20 20-3.5-3.5"/>
              </svg>
            }
          />
          <Input label="Meta 24h" defaultValue="BH negativo 1000 mL/24h" hint="Texto livre, alvo numérico explícito."/>
          <Input label="FiO2 (%)" defaultValue="250" invalido hint="Fora da faixa plausível — o sistema sinaliza, o médico decide."/>
        </div>
      </section>

      {/* ---------- vitais ---------- */}
      <section className="ds-gal__secao">
        <span className="sasi-eyebrow">VitalStat (leitura de monitor)</span>
        <div className="ds-gal__linha">
          <VitalStat label="PAM" value={64} unit="mmHg" status="low"/>
          <VitalStat label="SOFA" value={13} status="high"/>
          <VitalStat label="Sat" value={96} unit="%"/>
          <VitalStat label="FR" value={28} unit="irpm" status="pos"/>
          <VitalStat label="Glasgow" value={null}/>
        </div>
        <p className="ds-gal__nota">Dado ausente: “—” explícito (nunca 0). Unidade só aparece quando há valor.</p>
      </section>

      {/* ---------- leitura ---------- */}
      <section className="ds-gal__secao ds-gal__suporte">
        <span className="sasi-eyebrow">Onde mora</span>
        <p className="ds-gal__dump">
          Primitivas core: <code>src/components/ui/</code> · primitivas clínicas: <code>src/components/clinical/</code> ·
          CSS dos componentes: <code>src/styles/ds/components.css</code> · tokens: <code>src/styles/ds/tokens/</code>.
          Nenhum hex em componente: só token CSS (--var) nos dois temas.
        </p>
      </section>
    </div>
  );
}
