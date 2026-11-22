const { chromium } = require('playwright');
const path = require('path');
const dir = process.argv[2] || path.join(__dirname, 'saida');
require('fs').mkdirSync(dir, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const erros = [];
  const telas = [['cards', '/cards', 'light', 1440], ['round', '/round?leito=03', 'light', 1440], ['tabela', '/tabela', 'light', 1440], ['passagem', '/passagem', 'light', 1440], ['exames', '/exames?leito=03', 'light', 1440], ['evolucao', '/evolucao?leito=03', 'light', 1440], ['evolucao-escuro', '/evolucao?leito=03', 'dark', 1440], ['evolucao-tablet', '/evolucao?leito=03', 'light', 1194], ['evolucao-ontem', '/evolucao?leito=05', 'light', 1440], ['cards-novo', '/cards?novo=04', 'light', 1440], ['cards-novo-escuro', '/cards?novo=04', 'dark', 1194], ['round-graficos', '/round?leito=03', 'dark', 1440], ['exames-graficos', '/exames?leito=03', 'light', 1194]];
  for (const [nome, rota, tema, w] of telas) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: tema, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    p.on('console', (m) => { if (m.type() === 'error') erros.push(nome + ': ' + m.text().slice(0, 220)); });
    p.on('pageerror', (e) => erros.push(nome + ' ERRO DE PÁGINA: ' + String(e).slice(0, 300)));
    const r = await p.goto('http://localhost:3111' + rota, { waitUntil: 'networkidle' });
    await p.screenshot({ path: `${dir}/${nome}.png`, fullPage: true });
    const med = await p.evaluate(() => {
      const cor = (e) => getComputedStyle(e).color;
      const vermelho = (c) => { const m = c.match(/\d+/g).map(Number); return m[0] > 170 && m[1] < 90 && m[2] < 90; };
      const numeros = [...document.querySelectorAll('.ds-f input, .ds-leito__vitais dd, .ds-mini__ult b, .ds-ev__calc b, .ds-folhao td, .ds-celula input')];
      const cortados = [...document.querySelectorAll('.ds-seg > span, .ds-bloco, .ds-btn, .ds-selo, .ds-flag, .ds-ev__r, .ds-leito__nome, th')].filter((e) => e.scrollWidth > e.clientWidth + 1 && !e.classList.contains('ds-leito__nome')).length;
      return { larguraPagina: document.documentElement.scrollWidth, altura: document.documentElement.scrollHeight, pilulas: document.querySelectorAll('.ds-flag').length, numerosVermelhos: numeros.filter((e) => vermelho(cor(e))).length, cortados, ontem: document.querySelectorAll('.ds-ev__ontem').length, fonte: getComputedStyle(document.body).fontFamily.slice(0, 30), fundo: getComputedStyle(document.body).backgroundColor };
    });
    console.log(nome, r.status(), JSON.stringify(med));
    if (nome === 'evolucao') {
      const est = () => p.locator('.ds-topo__estado').innerText();
      console.log('  estado ao abrir:', JSON.stringify(await est()));
      await p.getByRole('radio', { name: 'Inadequada' }).click();
      await p.getByRole('radio', { name: 'PSV' }).click();
      await p.getByLabel('Notas de Renal').fill('teste de nota');
      console.log('  depois de mexer:', JSON.stringify(await est()));
      await p.getByRole('button', { name: 'Salvar evolução' }).click();
      await p.waitForTimeout(1500);
      console.log('  depois de salvar:', JSON.stringify(await est()));
      const txt = await p.evaluate(async () => { let t = ''; navigator.clipboard.writeText = async (x) => { t = x; }; document.querySelectorAll('.ds-topo__acoes .ds-btn')[0].click(); await new Promise((r) => setTimeout(r, 300)); return t; });
      console.log('  --- texto copiado ---\n' + txt + '\n  ---');
    }
    await ctx.close();
  }

  // partes do plantão: Infecto (antimicrobianos e culturas), diluição das drogas e Prescrição vigente do Round
  for (const [w, tema] of [[1440, 'light'], [1440, 'dark'], [1194, 'light'], [1194, 'dark']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: tema });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => erros.push('partes ' + w + tema + ' ERRO: ' + String(e).slice(0, 200)));
    await p.goto('http://localhost:3111/evolucao?leito=03', { waitUntil: 'networkidle' });
    const sufixo = `${w}-${tema}`;
    await p.locator('[data-sis="Infecto"]').screenshot({ path: `${dir}/infecto-${sufixo}.png` });
    await p.getByRole('button', { name: /Diluição de Noradrenalina/ }).click();
    await p.locator('[data-sis="Cardio-hemodinâmica"]').screenshot({ path: `${dir}/diluicao-${sufixo}.png` });
    await p.getByRole('option', { name: '128 mcg/mL' }).click();
    await p.getByRole('button', { name: 'Suspender Vancomicina' }).click();
    await p.getByRole('button', { name: 'Apagar Meropeném, lançado por engano' }).click();
    await p.getByRole('button', { name: 'Adicionar antimicrobiano' }).click();
    await p.getByRole('button', { name: 'Adicionar cultura' }).click();
    await p.getByLabel('Resultado de Hemocultura').last().selectOption({ label: 'Positiva' });
    await p.locator('[data-sis="Infecto"]').screenshot({ path: `${dir}/infecto-editando-${sufixo}.png` });
    await p.goto('http://localhost:3111/round?leito=03', { waitUntil: 'networkidle' });
    await p.locator('.ds-presc').screenshot({ path: `${dir}/prescricao-${sufixo}.png` });
    const m = await p.evaluate(() => ({ larg: document.documentElement.scrollWidth, cortados: [...document.querySelectorAll('.ds-presc__droga, .ds-presc__dose')].filter((e) => e.scrollWidth > e.clientWidth + 1).length }));
    console.log('partes', sufixo, JSON.stringify(m));
    await ctx.close();
  }
  // painel de admissão (Novo leito), claro e escuro
  for (const tema of ['light', 'dark']) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: tema });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => erros.push('novo leito ERRO: ' + String(e).slice(0, 200)));
    await p.goto('http://localhost:3111/cards?novo=04', { waitUntil: 'networkidle' });
    await p.getByRole('radio', { name: 'Contato' }).click();
    await p.locator('.ds-novo').screenshot({ path: `${dir}/novo-leito-${tema}.png` });
    await ctx.close();
  }
  // alta, troca de leito e sugestões de antimicrobiano
  for (const [w, tema] of [[1440, 'light'], [1440, 'dark'], [1194, 'light'], [1194, 'dark']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: tema });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => erros.push('alta/troca ERRO: ' + String(e).slice(0, 200)));
    const sufixo = `${w}-${tema}`;
    await p.goto('http://localhost:3111/evolucao?leito=03', { waitUntil: 'networkidle' });
    await p.getByRole('button', { name: 'Alta', exact: true }).click(); await p.getByRole('radio', { name: 'Transferência' }).click();
    await p.getByLabel('Setor de destino').fill('Enfermaria'); await p.getByLabel('Observações', { exact: true }).fill('Paciente estável, sem dispositivos.');
    await p.screenshot({ path: `${dir}/alta-pagina-${sufixo}.png` });
    await p.locator('.ds-novo').screenshot({ path: `${dir}/alta-${sufixo}.png` });
    await p.getByRole('button', { name: 'Trocar de leito', exact: true }).click(); await p.getByRole('radio', { name: '07' }).click();
    await p.locator('.ds-novo').screenshot({ path: `${dir}/troca-${sufixo}.png` });
    await p.reload({ waitUntil: 'networkidle' });
    await p.getByRole('button', { name: 'Adicionar antimicrobiano' }).click(); await p.getByLabel('Antimicrobiano', { exact: true }).focus();
    await p.locator('[data-sis="Infecto"]').screenshot({ path: `${dir}/atb-sugestoes-${sufixo}.png` });
    await ctx.close();
  }
  console.log('erros no navegador:', erros.length ? '\n' + erros.join('\n') : 'nenhum');
  await b.close();
})();
