/**
 * E2E Test Suite: Laboratório de Vírus (60 Blocos / 88.320 Junções / 54 Conjuntos / Nv.1..10),
 * Polimento do Tour Interativo & Sincronização Cloud/F5.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/hacker-city-web/index.html';
const OUT_DIR = path.resolve(__dirname, '../evidencias/virus-lab');

function assert(cond, msg) {
  if (!cond) {
    throw new Error('ASSERTION FAILED: ' + msg);
  }
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  console.log('1) Abrindo Hacker City Web e entrando no modo 1-Clique...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await page.mouse.move(10, 10);
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
    window.DISABLE_AUTO_TOUR = true;
    await window.enterInstantOperatorMode('VirusArchitect_01');
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
  });
  await new Promise((r) => setTimeout(r, 350));

  // 2) Validar matriz combinatória (60 blocos, 88.320 junções, 54 conjuntos)
  const combStats = await page.evaluate(() => window.virusLabEngine.getCombinatoricsStats());
  console.log('   Matriz Combinatória:', combStats);
  assert(combStats.totalBlocks >= 60, `Esperado >= 60 blocos, obteve ${combStats.totalBlocks}`);
  assert(combStats.totalCombinations === 88320, `Esperado 88.320 junções, obteve ${combStats.totalCombinations}`);
  assert(combStats.totalSynergySets >= 54, `Esperado >= 54 conjuntos, obteve ${combStats.totalSynergySets}`);

  // 3) Abrir menu Meu Computador -> Laboratório de Vírus
  console.log('2) Testando ritual 3 Rounds (3->1, 3->2, 3->1) no Laboratório de Vírus...');
  await page.evaluate(() => {
    const det = document.getElementById('navTopic_pc');
    if (det) det.open = true;
  });
  await page.waitForSelector('#navBtnVirusLab', { visible: true });
  await page.click('#navBtnVirusLab');
  await page.waitForSelector('#winVirusLab', { visible: true });
  await new Promise((r) => setTimeout(r, 300));

  // ROUND 1: 3 opções -> escolher apenas 1
  const r1StateBefore = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#winVirusLab .vlab-block-card'));
    const nextBtn = document.getElementById('btnVlabNextRound');
    return {
      cardCount: cards.length,
      nextDisabled: nextBtn ? nextBtn.disabled : null,
      counter: document.getElementById('vlabPickCounter')?.textContent?.trim()
    };
  });
  assert(r1StateBefore.cardCount === 3, `Round 1 deve mostrar 3 opções, mostrou ${r1StateBefore.cardCount}`);
  assert(r1StateBefore.nextDisabled === true, 'Botão avançar do Round 1 deve iniciar desabilitado');

  // Clica na 1ª opção e depois na 2ª opção p/ provar que no Round 1 só fica 1 selecionado
  await page.evaluate(() => {
    const cards = document.querySelectorAll('#winVirusLab .vlab-block-card');
    cards[0].click();
    cards[1].click();
  });
  const r1AfterPick = await page.evaluate(() => {
    const pressed = document.querySelectorAll('#winVirusLab .vlab-block-card[aria-pressed="true"]');
    const nextBtn = document.getElementById('btnVlabNextRound');
    return { pressedCount: pressed.length, nextDisabled: nextBtn.disabled };
  });
  assert(r1AfterPick.pressedCount === 1, `Round 1 deve manter apenas 1 selecionado, tem ${r1AfterPick.pressedCount}`);
  assert(r1AfterPick.nextDisabled === false, 'Botão avançar do Round 1 deve habilitar ao escolher 1');
  await page.screenshot({ path: path.join(OUT_DIR, '01-round1-3opcoes-escolher-1.png') });

  // Avança para o ROUND 2: 3 novas opções -> escolher exatamente 2
  await page.click('#btnVlabNextRound');
  await new Promise((r) => setTimeout(r, 200));

  const r2AfterOnePick = await page.evaluate(() => {
    const cards = document.querySelectorAll('#winVirusLab .vlab-block-card');
    cards[0].click(); // apenas 1 escolhido
    const nextBtn = document.getElementById('btnVlabNextRound');
    return {
      cardCount: cards.length,
      pressedAfter1: document.querySelectorAll('#winVirusLab .vlab-block-card[aria-pressed="true"]').length,
      nextDisabledAfter1: nextBtn.disabled
    };
  });
  assert(r2AfterOnePick.cardCount === 3, 'Round 2 deve mostrar 3 opções');
  assert(r2AfterOnePick.pressedAfter1 === 1 && r2AfterOnePick.nextDisabledAfter1 === true, 'No Round 2 escolher só 1 não pode liberar o avanço');

  await page.evaluate(() => {
    const cards = document.querySelectorAll('#winVirusLab .vlab-block-card');
    cards[2].click(); // 2º escolhido!
  });
  const r2AfterTwoPicks = await page.evaluate(() => {
    const nextBtn = document.getElementById('btnVlabNextRound');
    return {
      pressedCount: document.querySelectorAll('#winVirusLab .vlab-block-card[aria-pressed="true"]').length,
      nextDisabled: nextBtn.disabled
    };
  });
  assert(r2AfterTwoPicks.pressedCount === 2 && r2AfterTwoPicks.nextDisabled === false, 'No Round 2 escolher 2 blocos deve liberar avanço');
  await page.screenshot({ path: path.join(OUT_DIR, '02-round2-3opcoes-escolher-2.png') });

  // Avança para o ROUND 3: 3 novas opções -> escolher apenas 1 novamente
  await page.click('#btnVlabNextRound');
  await new Promise((r) => setTimeout(r, 200));

  const r3Ready = await page.evaluate(() => {
    const cards = document.querySelectorAll('#winVirusLab .vlab-block-card');
    const compBtnBefore = document.getElementById('btnVlabCompile').disabled;
    cards[0].click();
    const inp = document.getElementById('vlabStrainNameInput');
    if (inp) inp.value = 'Proto-Alpha';
    return {
      cardCount: cards.length,
      compBtnBefore,
      compBtnAfter: document.getElementById('btnVlabCompile').disabled
    };
  });
  assert(r3Ready.cardCount === 3, 'Round 3 deve mostrar 3 opções');
  assert(r3Ready.compBtnBefore === true && r3Ready.compBtnAfter === false, 'Round 3 deve exigir 1 escolha para compilar');
  await page.screenshot({ path: path.join(OUT_DIR, '03-round3-3opcoes-escolher-1.png') });

  // Compila o 1º vírus no Nível 1!
  await page.click('#btnVlabCompile');
  await page.waitForSelector('#vlabCompileResultCard', { visible: true });
  const firstCompile = await page.evaluate(() => {
    const rep = window.virusLabEngine.lastCompileReport;
    const inv = window.softwareEngine.state.inventory[rep.dominantFamily];
    return {
      strainName: rep.strainName,
      family: rep.dominantFamily,
      fitScore: rep.fitScore,
      fitGrade: rep.fitGrade,
      versionInt: rep.versionInt,
      xpAfter: window.virusLabEngine.state.xp,
      ownedInDisk: !!(inv && inv.owned && inv.licensed)
    };
  });
  console.log('   1ª Compilação (Nv.1):', firstCompile);
  assert(firstCompile.xpAfter >= 40, 'Compilar deve conceder XP de Laboratório');
  assert(firstCompile.ownedInDisk === true, 'Vírus compilado deve entrar licenciado em Programas & Proteção');

  // 4) Validar matematicamente Encaixe Fraco vs Encaixe Forte e evolução até o Nível Máximo (Nv. 10)
  console.log('3) Validando diferença entre escolha mal encaixada vs bem encaixada + Nível Máximo (Nv.10)...');
  const fitComparison = await page.evaluate(() => {
    const weak = window.virusLabEngine.evaluateAssembly('R1_01', ['R2_09', 'R2_23'], 'R3_13');
    const strong = window.virusLabEngine.evaluateAssembly('R1_09', ['R2_09', 'R2_21'], 'R3_07');
    return {
      weakScore: weak.fitScore,
      weakGrade: weak.fitGrade,
      weakVer: weak.versionInt,
      strongScore: strong.fitScore,
      strongGrade: strong.fitGrade,
      strongVer: strong.versionInt,
      strongSet: strong.matchedSet ? strong.matchedSet.id : null
    };
  });
  console.log('   Comparativo de Encaixe:', fitComparison);
  assert(fitComparison.strongScore > fitComparison.weakScore + 35, 'Escolha bem encaixada deve ter score muito superior à mal encaixada');
  assert(fitComparison.strongVer > fitComparison.weakVer, 'Escolha bem encaixada deve gerar vírus mais forte que escolha conflitante');
  assert(!!fitComparison.strongSet, 'Escolha bem encaixada deve destravar um Conjunto do catálogo');

  // Evoluir Laboratório até o Nível Máximo (Nv.10) e compilar conjunto lendário Camada V!
  const maxLvlCompile = await page.evaluate(() => {
    if (window.hardwareEngine && window.hardwareEngine.current) {
      window.hardwareEngine.current.hdd = 3; // Disco compatível com operador Nível 10
      window.hardwareEngine.saveRig(window.hardwareEngine.current);
    }
    window.virusLabEngine.state.xp = 3150;
    window.virusLabEngine.state.level = 10;
    // Desbloqueia alguns conjuntos anteriores p/ vitrine do Códice e monta rascunho Camada V
    window.virusLabEngine.state.discoveredSets = ['SET_01', 'SET_12', 'SET_23', 'SET_34', 'SET_45', 'SET_51', 'SET_52'];
    window.virusLabEngine.state.activeDraft = {
      startedAt: Date.now(),
      round: 3,
      optionsByRound: {
        1: ['R1_12', 'R1_16', 'R1_20'],
        2: ['R2_12', 'R2_24', 'R2_20'],
        3: ['R3_16', 'R3_09', 'R3_15']
      },
      picks: {
        r1: 'R1_12',
        r2: ['R2_12', 'R2_24'],
        r3: 'R3_16'
      },
      customName: 'Omega-Satoshi-Zero'
    };
    const res = window.virusLabEngine.compileCurrentDraft('Omega-Satoshi-Zero');
    return {
      levelMeta: window.virusLabEngine.getLevelMeta(),
      fitScore: res.report.fitScore,
      fitGrade: res.report.fitGrade,
      versionLabel: res.report.versionLabel,
      versionInt: res.report.versionInt,
      setId: res.report.matchedSet?.id,
      setName: res.report.matchedSet?.name
    };
  });
  console.log('   Compilação Nível Máximo (Nv.10):', maxLvlCompile);
  assert(maxLvlCompile.levelMeta.level === 10 && maxLvlCompile.levelMeta.isMaxLevel === true, 'Deve atingir Nível 10 (Nível Máximo)');
  assert(maxLvlCompile.versionInt >= 95, `No Nível Máximo com encaixe S+ deve atingir v9.5..v10.0, obteve ${maxLvlCompile.versionLabel}`);
  assert(maxLvlCompile.setId === 'SET_54', `Esperado SET_54 lendário, obteve ${maxLvlCompile.setId}`);
  await new Promise((r) => setTimeout(r, 250));
  await page.screenshot({ path: path.join(OUT_DIR, '04-resultado-compilacao-nivel-maximo.png') });

  // Capturar aba Códice de 54 Conjuntos
  await page.click('#vlabTabCodex');
  await new Promise((r) => setTimeout(r, 250));
  await page.screenshot({ path: path.join(OUT_DIR, '05-codice-54-conjuntos.png') });

  // Capturar Programas & Proteção mostrando o vírus autoral v10.0 salvo no disco
  await page.evaluate(() => window.navTo('winSoftware'));
  await new Promise((r) => setTimeout(r, 300));
  const minerDiskVer = await page.evaluate(() => window.softwareEngine.state.inventory.vminer.versionInt);
  assert(minerDiskVer >= 95, `Miner.vminer no disco deveria estar >= v9.5, está ${minerDiskVer}`);
  await page.screenshot({ path: path.join(OUT_DIR, '06-virus-criado-programas-disco.png') });

  // 5) Frente 3: Validar Tour Guiado Interativo + Recompensa Autorizada sem erro Anti-Cheat
  console.log('4) Validando Tour Guiado Interativo (Frente 3) + Blur IP...');
  await page.evaluate(() => window.spotlightTour.start(true));
  await new Promise((r) => setTimeout(r, 350));
  const tourStep1 = await page.evaluate(() => ({
    isActive: window.spotlightTour.isActive,
    title: document.getElementById('hcTourCardTitle')?.innerText || '',
    desc: document.getElementById('hcTourCardDesc')?.innerText || ''
  }));
  assert(tourStep1.isActive === true && tourStep1.desc.includes('7 dígitos'), 'Passo 1 do Tour deve explicar o blur dos últimos 7 dígitos do IP');
  await page.screenshot({ path: path.join(OUT_DIR, '07-tour-guiado-blur-ip-e-lab.png') });

  const tourRewardCheck = await page.evaluate(() => {
    const balBefore = Number(window.currentWallet.balance);
    window.spotlightTour.finishWithReward();
    const balAfter = Number(window.currentWallet.balance);
    return { delta: +(balAfter - balBefore).toFixed(2) };
  });
  assert(tourRewardCheck.delta === 500, `Tour deve conceder +$500 HC autorizado pelo anti-cheat, concedeu ${tourRewardCheck.delta}`);

  // 6) Frente 4: Persistência F5 (Master Snapshot + virusLabState)
  console.log('5) Validando persistência F5 (Master Snapshot + virusLabState)...');
  await page.evaluate(() => {
    if (window.onlineEngine) window.onlineEngine.saveLocalSnapshotImmediate();
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 900));

  const afterReload = await page.evaluate(() => ({
    labLevel: window.virusLabEngine.state.level,
    discoveredCount: window.virusLabEngine.state.discoveredSets.length,
    creationsCount: window.virusLabEngine.state.creations.length,
    minerVerInt: window.softwareEngine.state.inventory.vminer.versionInt
  }));
  console.log('   Estado após F5:', afterReload);
  assert(afterReload.labLevel === 10, 'Nível 10 do Laboratório deve persistir após F5');
  assert(afterReload.discoveredCount >= 8, 'Conjuntos descobertos devem persistir após F5');
  assert(afterReload.creationsCount >= 2, 'Histórico de criações deve persistir após F5');
  assert(afterReload.minerVerInt >= 95, 'Versão do vírus compilado no disco deve persistir após F5');
  assert(pageErrors.length === 0, 'Erros JS na página: ' + pageErrors.join('; '));

  console.log('✅ TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
  await browser.close();
})().catch((err) => {
  console.error('❌ FALHA NO TESTE E2E:', err);
  process.exit(1);
});
