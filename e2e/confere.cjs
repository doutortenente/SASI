const { chromium } = require('playwright');
const path = require('path');
const SAIDA = process.argv[2] || path.join(__dirname, 'saida');
require('fs').mkdirSync(SAIDA, { recursive: true });

// ---- gravações: antimicrobianos, culturas, diluição e prescrição (confere o corpo que a tela mandou) ----
const BANCO = 'http://localhost:54321';
const lerEscritas = async () => (await fetch(BANCO + '/_escritas')).json();
const limparEscritas = () => fetch(BANCO + '/_escritas', { method: 'DELETE' });
const partes = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
const HOJE = partes.find((x) => x.type === 'year').value + '-' + partes.find((x) => x.type === 'month').value + '-' + partes.find((x) => x.type === 'day').value;
const HOJE_DDMM = HOJE.slice(8, 10) + '/' + HOJE.slice(5, 7);
async function fluxos(b, erros) {
  let falhas = 0;
  const ok = (cond, nome, extra) => { console.log((cond ? '  ok    ' : '  FALHOU ') + nome + (cond || !extra ? '' : ' -> ' + JSON.stringify(extra))); if (!cond) falhas++; };
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') erros.push('fluxos: ' + m.text().slice(0, 160)); });
  p.on('pageerror', (e) => erros.push('fluxos ERRO: ' + String(e).slice(0, 200)));
  const salvar = async () => { await p.getByRole('button', { name: 'Salvar evolução' }).click(); await p.waitForFunction(() => /Salvo às/.test(document.querySelector('.ds-topo__estado')?.textContent || ''), null, { timeout: 8000 }); await p.waitForTimeout(300); };
  const de = (es, tabela, metodo) => es.filter((x) => x.tabela === tabela && x.metodo === metodo);

  console.log('gravações:');
  await p.goto('http://localhost:3111/evolucao?leito=03', { waitUntil: 'networkidle' });
  // 1) sem mexer em nada: a evolução grava, mas atbs e culturas ficam quietos
  await limparEscritas(); await p.getByLabel('Notas de Renal').fill('x'); await salvar();
  let es = await lerEscritas();
  ok(es.some((x) => x.tabela === 'evolucoes'), 'salvar grava a evolução');
  ok(!es.some((x) => x.tabela === 'atbs' || x.tabela === 'culturas'), 'sem mudança em atb/cultura, nada é mandado para atbs e culturas', es.map((x) => x.tabela));

  // 2) diluição: lista com as opções do design
  await p.getByRole('button', { name: /Diluição de Noradrenalina/ }).click();
  const ops = await p.getByRole('listbox', { name: 'Diluições de Noradrenalina' }).getByRole('option').allInnerTexts();
  ok(ops.join('|') === '50 mcg/mL|128 mcg/mL|1 mg/mL|10 mg/mL|4 mg/mL|0,4 UI/mL', 'a lista de diluições abre com as opções do design', ops);
  await p.getByRole('option', { name: '50 mcg/mL' }).click();
  ok((await p.getByRole('button', { name: /Diluição de Noradrenalina/ }).innerText()).includes('50 mcg/mL'), 'a diluição escolhida aparece na linha');
  await limparEscritas(); await salvar(); es = await lerEscritas();
  const evo = de(es, 'evolucoes', 'PATCH')[0];
  ok(evo && evo.corpo.dvas.find((d) => d.droga === 'Noradrenalina').diluicao === '50 mcg/mL', 'a diluição escolhida vai na evolução', evo && evo.corpo.dvas);

  // 3) antimicrobianos: suspender, apagar, incluir
  await limparEscritas();
  await p.getByRole('button', { name: 'Suspender Vancomicina' }).click();
  ok((await p.locator('.ds-ev__susp').innerText()).includes('Suspensos: Vancomicina'), 'suspender leva a droga para a linha "Suspensos"');
  await p.getByRole('button', { name: 'Apagar Meropeném, lançado por engano' }).click();
  ok(await p.locator('.ds-removido').count() > 0, 'apagar deixa a linha riscada até salvar');
  await p.getByRole('button', { name: 'Adicionar antimicrobiano' }).click();
  await p.getByLabel('Antimicrobiano', { exact: true }).fill('Amicacina');
  await p.getByLabel('Dose do antimicrobiano novo').fill('1 g EV 24/24 h');
  await p.getByLabel('Dias previstos de Amicacina').fill('5');
  await salvar(); es = await lerEscritas();
  const atbPatch = de(es, 'atbs', 'PATCH'), atbPost = de(es, 'atbs', 'POST'), atbDel = de(es, 'atbs', 'DELETE');
  ok(atbPatch.length === 1 && atbPatch[0].filtro.includes('id=eq.a2') && JSON.stringify(atbPatch[0].corpo) === JSON.stringify({ data_fim: HOJE }), 'suspender manda só o fim (hoje) da vancomicina', atbPatch);
  ok(atbDel.length === 1 && atbDel[0].filtro.includes('id=eq.a1'), 'apagar manda a exclusão do meropeném', atbDel);
  ok(atbPost.length === 1 && JSON.stringify(atbPost[0].corpo) === JSON.stringify({ paciente_id: 'p03', droga: 'Amicacina', dose: '1 g', via: 'EV', frequencia: '24/24 h', duracao_planejada_dias: 5, data_inicio: HOJE }), 'incluir manda droga, dose, via, frequência, dias previstos e início', atbPost);
  ok(!es.some((x) => x.tabela === 'pacientes'), 'nada é escrito em pacientes (dispositivos é derivado)');

  // 4) culturas: mudar resultado, incluir, apagar
  await limparEscritas();
  await p.getByLabel('Resultado de Hemocultura').last().selectOption({ label: 'Positiva' });
  await p.getByLabel('Germe de Hemocultura').last().fill('E. coli');
  await p.getByRole('button', { name: 'Adicionar cultura' }).click();
  await p.getByLabel('Material da cultura').last().selectOption({ label: 'Urocultura' });
  await p.getByLabel('Data da coleta de Urocultura').last().fill(HOJE_DDMM);
  await p.getByLabel('Resultado de Urocultura').last().selectOption({ label: 'Negativa' });
  await p.getByRole('button', { name: /^Tirar Urocultura de/ }).first().click();
  await salvar(); es = await lerEscritas();
  const cPatch = de(es, 'culturas', 'PATCH'), cPost = de(es, 'culturas', 'POST'), cDel = de(es, 'culturas', 'DELETE');
  ok(cPatch.length === 1 && cPatch[0].filtro.includes('id=eq.c4') && cPatch[0].corpo.crescimento === true && cPatch[0].corpo.agente === 'E. coli' && Object.keys(cPatch[0].corpo).length === 2, 'mudar para Positiva manda só crescimento e germe', cPatch);
  ok(cDel.length === 1 && cDel[0].filtro.includes('id=eq.c3'), 'apagar a urocultura manda a exclusão', cDel);
  ok(cPost.length === 1 && cPost[0].corpo.material === 'urocultura' && cPost[0].corpo.crescimento === false && cPost[0].corpo.agente === null && !!cPost[0].corpo.laudo_ts && cPost[0].corpo.paciente_id === 'p03', 'incluir manda material, coleta e resultado', cPost);
  ok(!es.some((x) => x.tabela === 'antibiograma'), 'o antibiograma não é tocado pela ficha (só leitura)');

  // 5) Round: Prescrição vigente com os dois blocos do design
  await p.goto('http://localhost:3111/round?leito=03', { waitUntil: 'networkidle' });
  const presc = await p.locator('.ds-presc').innerText();
  ok(/1 · Infusões e terapias/.test(presc) && /2 · Por sistema/.test(presc), 'Prescrição vigente tem os dois blocos do design');
  ok(/Drogas vasoativas[\s\S]*Noradrenalina[\s\S]*Sedação e analgesia[\s\S]*Fentanil[\s\S]*Antimicrobianos[\s\S]*Meropeném 1 g EV/.test(presc), 'infusões e antimicrobianos aparecem na Prescrição');
  ok(/Hidrocortisona 50 mg EV 6\/6 h/.test(presc) && /Pantoprazol/.test(presc) && /Paracetamol/.test(presc), 'itens por sistema vêm da prescrição gravada');
  ok(/Hematológico\s*\n?\s*—/.test(presc), 'item sem fonte no banco aparece como travessão');
  await ctx.close();
  return falhas;
}
(async () => {
  const b = await chromium.launch(); const erros = []; let ruim = 0;
  for (const [rota, w] of [['/cards', 1440], ['/round?leito=03', 1440], ['/tabela', 1440], ['/passagem', 1440], ['/exames?leito=03', 1440], ['/evolucao?leito=03', 1440], ['/evolucao?leito=03', 1194], ['/evolucao?leito=05', 1440]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } }); const p = await ctx.newPage();
    p.on('console', (m) => { if (m.type() === 'error') erros.push(rota + ': ' + m.text().slice(0, 160)); });
    p.on('pageerror', (e) => erros.push(rota + ' ERRO: ' + String(e).slice(0, 200)));
    const r = await p.goto('http://localhost:3111' + rota, { waitUntil: 'networkidle' });
    const m = await p.evaluate(() => {
      const vermelho = (e) => { const c = getComputedStyle(e).color.match(/\d+/g).map(Number); return c[0] > 170 && c[1] < 90 && c[2] < 90; };
      return {
        fonte: getComputedStyle(document.body).fontFamily.startsWith('"Atkinson'), larg: document.documentElement.scrollWidth,
        areas: document.querySelectorAll('.ds-f textarea').length, areasCortadas: [...document.querySelectorAll('.ds-f textarea')].filter((e) => e.scrollHeight > e.clientHeight + 2).length,
        caixasCortadas: [...document.querySelectorAll('.ds-f input')].filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.getAttribute('aria-label')),
        rotulosCortados: [...document.querySelectorAll('.ds-seg > span, .ds-bloco, .ds-btn, .ds-selo, .ds-flag, .ds-ev__r, th, .ds-lt__datas span')].filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.className + ':' + e.textContent.slice(0, 14) + ':' + e.scrollWidth + '>' + e.clientWidth),
        numerosVermelhos: [...document.querySelectorAll('.ds-f input, .ds-leito__vitais dd, .ds-mini__ult b, .ds-ev__calc b, .ds-folhao td')].filter(vermelho).length,
        pilulas: document.querySelectorAll('.ds-flag').length, rass: document.querySelector('select[aria-label="RASS"]')?.selectedOptions[0]?.textContent ?? null,
        quadros: [...document.querySelectorAll('.ds-ev__sis')].map((e) => e.dataset.sis + (e.lastElementChild.querySelector('.ds-ev__r')?.textContent === 'Notas' ? '' : ' SEM NOTAS NO FIM')).join(', '),
      };
    });
    if (r.status() !== 200 || !m.fonte || m.larg > w || m.areasCortadas || m.caixasCortadas.length || m.rotulosCortados.length || m.numerosVermelhos) ruim++;
    console.log(rota, w, r.status(), JSON.stringify(m));
    if (rota === '/evolucao?leito=03' && w === 1440) await p.screenshot({ path: path.join(SAIDA, 'evolucao.png'), fullPage: true });
    await ctx.close();
  }
  ruim += await fluxos(b, erros);
  console.log('erros no navegador:', erros.length ? '\n' + erros.join('\n') : 'nenhum');
  await b.close(); process.exit(ruim || erros.length ? 1 : 0);
})();
