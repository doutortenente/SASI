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
const HOJE_BR = HOJE.slice(8, 10) + '/' + HOJE.slice(5, 7) + '/' + HOJE.slice(0, 4);
const HOJE_DDMM = HOJE.slice(8, 10) + '/' + HOJE.slice(5, 7);
async function fluxos(b, erros) {
  let falhas = 0;
  const ok = (cond, nome, extra) => { console.log((cond ? '  ok    ' : '  FALHOU ') + nome + (cond || !extra ? '' : ' -> ' + JSON.stringify(extra))); if (!cond) falhas++; };
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error' && !/status of 400/.test(m.text())) erros.push('fluxos: ' + m.text().slice(0, 160)); });
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
  await p.getByLabel('Data de início de Amicacina').fill(HOJE_DDMM);
  await salvar(); es = await lerEscritas();
  const atbPatch = de(es, 'atbs', 'PATCH'), atbPost = de(es, 'atbs', 'POST'), atbDel = de(es, 'atbs', 'DELETE');
  ok(atbPatch.length === 1 && atbPatch[0].filtro.includes('id=eq.a2') && JSON.stringify(atbPatch[0].corpo) === JSON.stringify({ data_fim: HOJE }), 'suspender manda só o fim (hoje) da vancomicina', atbPatch);
  ok(atbDel.length === 1 && atbDel[0].filtro.includes('id=eq.a1'), 'apagar manda a exclusão do meropeném', atbDel);
  ok(atbPost.length === 1 && JSON.stringify(atbPost[0].corpo) === JSON.stringify({ paciente_id: 'p03', droga: 'Amicacina', dose: '1 g', via: 'EV', frequencia: '24/24 h', duracao_planejada_dias: 5, data_inicio: HOJE }), 'incluir com o início preenchido manda a data do início', atbPost);
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

  // 4b) recusas da ficha: nada é enviado e o motivo aparece na tela
  const topo = () => p.locator('.ds-topo__estado').innerText();
  const tenta = async () => { await p.getByRole('button', { name: 'Salvar evolução' }).click(); await p.waitForFunction(() => /Não salvo/.test(document.querySelector('.ds-topo__estado')?.textContent || ''), null, { timeout: 8000 }); };
  await p.goto('http://localhost:3111/evolucao?leito=03', { waitUntil: 'networkidle' }); await limparEscritas();
  await p.getByRole('button', { name: 'Adicionar cultura' }).click();
  await p.getByLabel('Material da cultura').last().selectOption({ label: 'Urocultura' });
  await tenta();
  ok(/Cultura sem data de coleta/.test(await topo()) && !(await lerEscritas()).length, 'cultura incompleta: recusa com o motivo na tela e não envia nada', await topo());
  await p.goto('http://localhost:3111/evolucao?leito=03', { waitUntil: 'networkidle' }); await limparEscritas();
  await p.getByLabel('Data da coleta de Aspirado traqueal').fill(HOJE_DDMM);
  await tenta();
  ok(/coleta não pode ser depois do laudo/.test(await topo()) && !(await lerEscritas()).length, 'coleta depois do laudo: mostra o aviso e não envia nada', await topo());
  await p.goto('http://localhost:3111/evolucao?leito=03', { waitUntil: 'networkidle' }); await limparEscritas();
  await p.getByRole('button', { name: 'Adicionar antimicrobiano' }).click();
  await p.getByLabel('Dose do antimicrobiano novo').fill('1 g EV');
  await tenta();
  ok(/Antimicrobiano sem nome/.test(await topo()) && !(await lerEscritas()).length, 'antimicrobiano sem nome: recusa e não envia nada', await topo());
  // antimicrobiano novo sem início: é recusado com aviso e nada é enviado
  await p.goto('http://localhost:3111/evolucao?leito=03', { waitUntil: 'networkidle' }); await limparEscritas();
  await p.getByRole('button', { name: 'Adicionar antimicrobiano' }).click();
  await p.getByLabel('Antimicrobiano', { exact: true }).fill('Linezolida');
  await tenta();
  ok(/Antimicrobiano sem data de início/.test(await topo()) && !(await lerEscritas()).length, 'antimicrobiano novo sem início: é recusado com aviso e nada é enviado', await topo());
  // salvar duas vezes seguidas não envia a mesma inclusão duas vezes
  await p.goto('http://localhost:3111/evolucao?leito=03', { waitUntil: 'networkidle' }); await limparEscritas();
  await p.getByRole('button', { name: 'Adicionar antimicrobiano' }).click();
  await p.getByLabel('Antimicrobiano', { exact: true }).fill('Linezolida');
  await p.getByLabel('Data de início de Linezolida').fill(HOJE_DDMM);
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Salvar evolução/.test(x.textContent || '')); b.click(); b.click(); });
  await p.waitForFunction(() => /Salvo às/.test(document.querySelector('.ds-topo__estado')?.textContent || ''), null, { timeout: 8000 }); await p.waitForTimeout(500);
  es = await lerEscritas();
  ok(de(es, 'atbs', 'POST').length === 1 && (de(es, 'evolucoes', 'PATCH').length + de(es, 'evolucoes', 'POST').length) === 1, 'dois cliques seguidos em Salvar enviam a inclusão uma vez só', es.map((x) => x.metodo + ' ' + x.tabela));

  // 4c) inclusão da evolução (leito sem evolução): plantao "noite" se e somente se o turno é noturno
  await p.goto('http://localhost:3111/evolucao?leito=01', { waitUntil: 'networkidle' }); await limparEscritas();
  await p.getByLabel('Notas de Renal').fill('x'); await salvar(); es = await lerEscritas();
  const evoNova = de(es, 'evolucoes', 'POST')[0];
  ok(!!evoNova && (evoNova.corpo.turno === 'noturna') === (evoNova.corpo.plantao === 'noite') && (evoNova.corpo.turno === 'noturna' || !('plantao' in evoNova.corpo)), 'inclusão da evolução leva plantao "noite" se e somente se o turno é noturno', evoNova && { turno: evoNova.corpo.turno, plantao: evoNova.corpo.plantao });

  // 5) Round: Prescrição vigente com os dois blocos do design
  await p.goto('http://localhost:3111/round?leito=03', { waitUntil: 'networkidle' });
  const presc = await p.locator('.ds-presc').innerText();
  ok(/1 · Infusões e terapias/.test(presc) && /2 · Por sistema/.test(presc), 'Prescrição vigente tem os dois blocos do design');
  ok(/Drogas vasoativas[\s\S]*Noradrenalina[\s\S]*Sedação e analgesia[\s\S]*Fentanil[\s\S]*Antimicrobianos[\s\S]*Meropeném 1 g EV/.test(presc), 'infusões e antimicrobianos aparecem na Prescrição');
  ok(/Hidrocortisona 50 mg EV 6\/6 h/.test(presc) && /Pantoprazol/.test(presc) && /Paracetamol/.test(presc), 'itens por sistema vêm da prescrição gravada');
  ok(/Hematológico\s*\n?\s*—/.test(presc), 'item sem fonte no banco aparece como travessão');
  // 8) Novo leito: botão no topo e no cartão vago; o corpo enviado a "pacientes"
  console.log('novo leito:');
  await p.goto('http://localhost:3111/cards', { waitUntil: 'networkidle' });
  ok(await p.locator('.ds-leito--vago .ds-btn--p').count() > 0, 'cartão de leito vago traz o botão "Novo leito" do design');
  await p.getByRole('link', { name: 'Novo leito' }).first().click(); await p.waitForSelector('.ds-novo');
  const vagosTela = await p.getByRole('radiogroup', { name: 'Leito' }).getByRole('radio').allInnerTexts();
  ok(vagosTela.join(',') === '02,04,06,07,08,09,11,12,13', 'só os leitos vagos aparecem para escolher', vagosTela);
  ok(await p.getByRole('radio', { name: '02', checked: true }).count() === 0, 'sem escolha, nenhum leito vem marcado');
  await limparEscritas();
  await p.getByRole('button', { name: 'Admitir paciente' }).click();
  ok(await p.locator('.ds-novo .ds-ev__msg').count() === 1 && !(await lerEscritas()).length, 'sem leito, nome e gravidade: avisa e não grava nada');
  await p.getByRole('radio', { name: '02', exact: true }).click();
  await p.getByLabel('Nome do paciente').fill('Paciente Teste Ficticio');
  await p.getByRole('radio', { name: 'Feminino' }).click();
  await p.getByLabel('Idade', { exact: true }).fill('71'); await p.getByLabel('Peso', { exact: true }).fill('68,5'); await p.getByLabel('Altura', { exact: true }).fill('160');
  await p.getByLabel('Hipótese diagnóstica').fill('Choque séptico de foco urinário');
  await p.getByRole('radio', { name: 'Watcher' }).click();
  await p.getByRole('button', { name: 'Admitir paciente' }).click();
  ok(/data de admissão/.test(await p.locator('.ds-novo .ds-ev__msg').innerText()) && !(await lerEscritas()).length, 'admissão sem data: recusa e não grava nada');
  await p.getByLabel('Data de admissão').fill(HOJE_BR);
  await p.getByRole('button', { name: 'Admitir paciente' }).click(); await p.waitForURL(/\/round|\/cards/, { timeout: 8000 }); await new Promise((r) => setTimeout(r, 500));
  es = await lerEscritas(); const adm = de(es, 'pacientes', 'POST')[0];
  ok(adm && JSON.stringify(adm.corpo) === JSON.stringify({ uti: 'UTI2', leito: 'UTI2-L02', status_leito: 'ativo', nome: 'Paciente Teste Ficticio', idade: 71, sexo: 'feminino', peso: 68.5, altura: 160, hd: 'Choque séptico de foco urinário', data_adm: HOJE, gravidade: 'watcher', alergias: null }), 'a admissão grava o paciente no leito escolhido, com os valores digitados', adm && adm.corpo);
  ok(!es.some((x) => x.tabela === 'internacoes'), 'a internação não é gravada pela tela (o banco abre sozinho)');
  await limparEscritas();
  await p.goto('http://localhost:3111/cards?novo=04', { waitUntil: 'networkidle' });
  ok(await p.getByRole('radio', { name: '04', checked: true }).count() === 1, 'vindo do cartão vago, o leito já vem marcado');
  await p.getByLabel('Nome do paciente').fill('Outro Paciente Ficticio'); await p.getByRole('radio', { name: 'Crítico' }).click();
  await p.getByLabel('Data de admissão').fill(HOJE_BR); await p.getByLabel('Alergias', { exact: true }).fill('dipirona'); await p.getByRole('radio', { name: 'Contato' }).click();
  await p.getByRole('button', { name: 'Admitir paciente' }).click(); await new Promise((r) => setTimeout(r, 800));
  es = await lerEscritas(); const adm2 = de(es, 'pacientes', 'POST')[0];
  ok(adm2 && adm2.corpo.idade === null && adm2.corpo.sexo === null && adm2.corpo.peso === null && adm2.corpo.altura === null && adm2.corpo.hd === null && adm2.corpo.leito === 'UTI2-L04' && adm2.corpo.gravidade === 'critico', 'campo vazio grava null (nada de valor padrão)', adm2 && adm2.corpo);
  ok(adm2 && adm2.corpo.alergias === 'dipirona' && adm2.corpo.isolation === 'contact', 'alergias e isolamento preenchidos vão na admissão (isolation em código do banco)', adm2 && adm2.corpo);
  ok(adm && adm.corpo.alergias === null && !('isolation' in adm.corpo), 'alergias vazias gravam null e isolamento sem marca não envia a coluna', adm && adm.corpo);
  await p.goto('http://localhost:3111/cards?novo=06', { waitUntil: 'networkidle' }); await limparEscritas();
  await p.getByLabel('Nome do paciente').fill('Teste Ficticio'); await p.getByRole('radio', { name: 'Estável' }).click(); await p.getByLabel('Data de admissão').fill(HOJE_BR); await p.getByLabel('Idade', { exact: true }).fill('7,5');
  await p.getByRole('button', { name: 'Admitir paciente' }).click();
  ok(/inteiro/.test(await p.locator('.ds-novo .ds-ev__msg').innerText()) && !(await lerEscritas()).length, 'idade com vírgula: recusa e não grava');
  await p.getByLabel('Idade', { exact: true }).fill('200');
  await p.getByRole('button', { name: 'Admitir paciente' }).click();
  ok((await p.locator('.ds-novo .ds-ev__msg').innerText()).includes('idade') && !(await lerEscritas()).length, 'idade fora da faixa: avisa e não grava');

  // 8b) Alta, troca de leito e sugestões de antimicrobiano
  const msgPainel = async () => (await p.locator('.ds-novo .ds-ev__msg').innerText()).trim();
  const rpcs = (es) => es.filter((x) => x.tabela.startsWith('rpc/'));
  await p.goto('http://localhost:3111/evolucao?leito=03', { waitUntil: 'networkidle' }); await limparEscritas();
  ok(await p.getByRole('button', { name: 'Alta', exact: true }).count() === 1 && await p.getByRole('button', { name: 'Trocar de leito', exact: true }).count() === 1, 'a Evolução tem os botões Alta e Trocar de leito');
  ok(await p.getByRole('button', { name: 'Alta', exact: true }).getAttribute('class') === await p.getByRole('button', { name: 'Trocar de leito', exact: true }).getAttribute('class'), 'os dois botões têm o mesmo estilo');
  await p.getByRole('button', { name: 'Alta', exact: true }).click();
  ok((await p.locator('.ds-novo [role=radio]').allInnerTexts()).join('|') === 'Alta da UTI|Alta hospitalar|Óbito|Transferência', 'desfechos com os rótulos certos');
  ok((await p.getByLabel('Data do desfecho').inputValue()) === '', 'a data do desfecho começa vazia');
  await p.getByRole('button', { name: /^Confirmar alta do leito 03/ }).click();
  ok(/desfecho/.test(await msgPainel()) && !rpcs(await lerEscritas()).length, 'alta sem desfecho: recusa e não envia nada');
  await p.getByRole('radio', { name: 'Transferência' }).click();
  ok(await p.getByRole('button', { name: 'Confirmar transferência do leito 03' }).count() === 1, 'o botão final traz a ação e o leito por extenso');
  await p.getByRole('button', { name: 'Confirmar transferência do leito 03' }).click();
  ok(/data/.test(await msgPainel()) && !rpcs(await lerEscritas()).length, 'alta sem data: recusa e não envia nada');
  const amanha = new Date(HOJE + 'T12:00:00Z'); amanha.setUTCDate(amanha.getUTCDate() + 1); const am = amanha.toISOString().slice(0, 10);
  await p.getByLabel('Data do desfecho').fill(am.slice(8, 10) + '/' + am.slice(5, 7) + '/' + am.slice(0, 4));
  await p.getByRole('button', { name: 'Confirmar transferência do leito 03' }).click();
  ok(/futuro/.test(await msgPainel()) && !rpcs(await lerEscritas()).length, 'data futura: recusa e não envia nada');
  await p.getByLabel('Data do desfecho').fill(HOJE_DDMM); await p.getByLabel('Setor de destino').fill('Enfermaria');
  await p.getByLabel('Notas de Renal').fill('nota antes da alta');
  await p.getByRole('button', { name: 'Confirmar transferência do leito 03' }).click();
  await p.waitForFunction(() => location.pathname === '/cards', null, { timeout: 15000 });
  es = await lerEscritas(); const alta = rpcs(es);
  ok(alta.length === 1 && alta[0].tabela === 'rpc/dar_alta_paciente' && JSON.stringify(alta[0].corpo) === JSON.stringify({ p_paciente_id: 'p03', p_desfecho: 'transferencia', p_desfecho_data: HOJE, p_destino_setor: 'Enfermaria', p_destino_especialidade: null, p_observacoes: null }), 'alta envia os 6 parâmetros certos (vazios como null, data AAAA-MM-DD)', alta);
  ok(es.findIndex((x) => x.tabela === 'evolucoes') >= 0 && es.findIndex((x) => x.tabela === 'evolucoes') < es.findIndex((x) => x.tabela === 'rpc/dar_alta_paciente'), 'com alteração não salva, a ficha é salva antes da alta');
  await p.goto('http://localhost:3111/evolucao?leito=03', { waitUntil: 'networkidle' }); await limparEscritas();
  await p.getByRole('button', { name: 'Alta', exact: true }).click(); await p.getByRole('radio', { name: 'Alta da UTI' }).click();
  await p.getByLabel('Data do desfecho').fill(HOJE_DDMM); await p.getByLabel('Observações', { exact: true }).fill('FALHAR');
  await p.getByRole('button', { name: 'Confirmar alta do leito 03' }).click(); await new Promise((r) => setTimeout(r, 600));
  ok((await msgPainel()) === 'Data do desfecho anterior à entrada na UTI.' && p.url().includes('/evolucao'), 'erro da função aparece com o texto que veio e a tela não sai');
  const cort = await p.evaluate(() => [...document.querySelectorAll('.ds-novo .ds-btn, .ds-novo .ds-seg > span, .ds-leito-acoes .ds-btn')].filter((e) => e.scrollWidth > e.clientWidth + 1).length);
  ok(cort === 0, 'painel de alta sem texto cortado', cort);
  await p.goto('http://localhost:3111/evolucao?leito=03', { waitUntil: 'networkidle' }); await limparEscritas();
  await p.getByRole('button', { name: 'Trocar de leito', exact: true }).click();
  const vagosDaTroca = await p.locator('.ds-novo [role=radio]').allInnerTexts();
  ok(vagosDaTroca.join('|') === '02|04|06|07|08|09|11|12|13', 'a troca só oferece leitos vagos', vagosDaTroca);
  await p.getByRole('button', { name: /^Confirmar troca/ }).click();
  ok(/leito/.test(await msgPainel()) && !rpcs(await lerEscritas()).length, 'troca sem leito escolhido: recusa e não envia nada');
  await p.getByRole('radio', { name: '13' }).click(); await p.getByRole('button', { name: 'Confirmar troca para o leito 13' }).click(); await new Promise((r) => setTimeout(r, 600));
  ok((await msgPainel()) === 'Leito de destino ocupado.' && p.url().includes('leito=03'), 'erro da troca aparece com o texto que veio');
  const navegou = []; p.on('request', (r) => { if (r.isNavigationRequest()) navegou.push(r.url()); });
  await p.getByRole('radio', { name: '07' }).click(); await limparEscritas(); await p.getByRole('button', { name: 'Confirmar troca para o leito 07' }).click();
  await p.waitForFunction(() => true); await new Promise((r) => setTimeout(r, 1500));
  const tr = rpcs(await lerEscritas());
  ok(tr.length === 1 && tr[0].tabela === 'rpc/transferir_leito' && JSON.stringify(tr[0].corpo) === JSON.stringify({ p_paciente_id: 'p03', p_leito: 'UTI2-L07', p_uti: 'UTI2' }), 'troca envia p_leito e p_uti certos', tr);
  ok(navegou.some((u) => u.includes('/evolucao?leito=07')), 'depois da troca a tela vai para o leito novo', navegou);
  await p.goto('http://localhost:3111/evolucao?leito=03', { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: 'Adicionar antimicrobiano' }).click();
  await p.getByLabel('Antimicrobiano', { exact: true }).focus();
  const sug = await p.getByRole('listbox', { name: 'Sugestões de antimicrobianos' }).getByRole('option').allInnerTexts();
  ok(sug.join('|') === 'Ceftriaxona|Meropeném|Piperacilina-tazobactam|Vancomicina', 'sugestões de antimicrobiano vêm do banco, sem repetir, em ordem', sug);
  await p.getByLabel('Antimicrobiano', { exact: true }).fill('van');
  ok((await p.getByRole('listbox', { name: 'Sugestões de antimicrobianos' }).getByRole('option').allInnerTexts()).join('|') === 'Vancomicina', 'a lista filtra pelo que se digita');
  await p.getByRole('option', { name: 'Vancomicina' }).click();
  ok((await p.getByLabel('Antimicrobiano', { exact: true }).inputValue()) === 'Vancomicina', 'escolher a sugestão preenche o nome');
  await p.getByLabel('Antimicrobiano', { exact: true }).fill('Droga nova xyz');
  ok(await p.getByRole('listbox', { name: 'Sugestões de antimicrobianos' }).count() === 0 && (await p.getByLabel('Antimicrobiano', { exact: true }).inputValue()) === 'Droga nova xyz', 'nome novo continua livre');

  // 9) Tema: sem botão no design; segue o aparelho, claro ou escuro, já na primeira pintura
  const cEsc = await b.newContext({ colorScheme: 'dark' }); const pe = await cEsc.newPage(); await pe.goto('http://localhost:3111/cards', { waitUntil: 'domcontentloaded' });
  const cClaro = await b.newContext({ colorScheme: 'light' }); const pc = await cClaro.newPage(); await pc.goto('http://localhost:3111/cards', { waitUntil: 'domcontentloaded' });
  ok((await pe.evaluate(() => document.documentElement.dataset.theme)) === 'escuro' && (await pc.evaluate(() => document.documentElement.dataset.theme)) === 'claro', 'o tema segue o aparelho (escuro e claro)');
  await cEsc.close(); await cClaro.close();

  // 10) Gráficos pequenos do design: faixas nos sinais, linha nos exames
  await p.goto('http://localhost:3111/round?leito=03', { waitUntil: 'networkidle' });
  const g = await p.evaluate(() => { const s = [...document.querySelectorAll('.ds-mini svg:not(.ds-icone)')]; const fc = s.find((x) => /^FC/.test(x.getAttribute('aria-label'))); const lac = s.find((x) => /^Lactato/.test(x.getAttribute('aria-label')));
    return { fc: fc && { vb: fc.getAttribute('viewBox'), barras: fc.querySelectorAll('.ds-g-barra').length, alerta: fc.querySelectorAll('.ds-g-alerta').length, limiar: fc.querySelectorAll('.ds-g-limiar').length, alvos: fc.querySelectorAll('.ds-g-alvo title').length }, lac: lac && { linha: lac.querySelectorAll('polyline.ds-g-linha').length, pontos: lac.querySelectorAll('circle.ds-g-ponto').length, limiares: lac.querySelectorAll('.ds-g-limiar').length } }; });
  ok(g.fc && g.fc.vb === '0 0 240 92' && g.fc.barras >= 3 && g.fc.alerta >= 1 && g.fc.limiar === 1 && g.fc.alvos === g.fc.barras, 'sinal: faixas com a parte fora do limiar, linha do limiar e dica por janela', g.fc);
  ok(g.lac && g.lac.linha === 1 && g.lac.pontos >= 2, 'exame: linha com pontos pelas últimas coletas', g.lac);

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
