/**
 * E2E Test Suite: Laboratório de Vírus (60 Blocos c/ Leve Explicação / 88.320 Junções /
 * 54 Conjuntos / Fusão de Mesmo Vírus Repetido / Escala Regressiva v10.0 = 3.00x),
 * Tour Interativo & Sincronização Cloud/F5.
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
    await window.enterInstantOperatorMode('VirusArchitect_02');
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
  });
  await new Promise((r) => setTimeout(r, 350));

  // 2) Validar matriz combinatória + explicações leves nos 60 blocos + escala regressiva 3.00x em v10.0!
  const coreChecks = await page.evaluate(() => {
    const stats = window.virusLabEngine.getCombinatoricsStats();
    const c = window.VIRUS_LAB_CONSTANTS;
    const allBlocks = [...c.ROUND_1_BLOCKS, ...c.ROUND_2_BLOCKS, ...c.ROUND_3_BLOCKS];
    const allHaveHints = allBlocks.every((b) => typeof b.hint === 'string' && b.hint.trim().length >= 25);

    const m100 = window.softwareEngine.getVirusYieldMultiplier(100); // v10.0 -> 3.00x
    const m70  = window.softwareEngine.getVirusYieldMultiplier(70);  // v7.0  -> 2.33x
    const m55  = window.softwareEngine.getVirusYieldMultiplier(55);  // v5.5  -> 2.00x
    const m30  = window.softwareEngine.getVirusYieldMultiplier(30);  // v3.0  -> 1.44x
    const m10  = window.softwareEngine.getVirusYieldMultiplier(10);  // v1.0  -> 1.00x
    const m06  = window.softwareEngine.getVirusYieldMultiplier(6);   // v0.6  -> 0.68x

    // Testa ganho real de mineração Bitcoin e dinheiro Spam em v10.0 vs v1.0 numa mesma CPU
    const fakeHostIp = '198.51.100.77';
    const spamV10 = window.softwareEngine.computeInfectionPerSec({ virusKey: 'vspam', targetIp: fakeHostIp, targetCpuMhz: 2000, versionInt: 10 });
    const spamV100 = window.softwareEngine.computeInfectionPerSec({ virusKey: 'vspam', targetIp: fakeHostIp, targetCpuMhz: 2000, versionInt: 100 });
    const minerV10 = window.softwareEngine.computeInfectionPerSec({ virusKey: 'vminer', targetIp: fakeHostIp, targetCpuMhz: 2000, versionInt: 10 });
    const minerV100 = window.softwareEngine.computeInfectionPerSec({ virusKey: 'vminer', targetIp: fakeHostIp, targetCpuMhz: 2000, versionInt: 100 });

    return {
      stats,
      allHaveHints,
      scale: { m100, m70, m55, m30, m10, m06 },
      spamRatio: +(spamV100.cashPerSec / spamV10.cashPerSec).toFixed(2),
      minerRatio: +(minerV100.satsPerSec / minerV10.satsPerSec).toFixed(2)
    };
  });
  console.log('   Matriz, Explicações & Regressão 3x:', coreChecks);
  assert(coreChecks.stats.totalBlocks === 60, 'Esperado 60 blocos');
  assert(coreChecks.stats.totalCombinations === 88320, 'Esperado 88.320 junções');
  assert(coreChecks.stats.totalSynergySets === 54, 'Esperado 54 conjuntos');
  assert(coreChecks.allHaveHints === true, 'Todos os 60 blocos devem ter explicação leve (hint)');
  assert(coreChecks.scale.m100 === 3.00, `v10.0 deve ter multiplicador exato 3.00x, obteve ${coreChecks.scale.m100}`);
  assert(
    coreChecks.scale.m100 > coreChecks.scale.m70 &&
    coreChecks.scale.m70 > coreChecks.scale.m55 &&
    coreChecks.scale.m55 > coreChecks.scale.m30 &&
    coreChecks.scale.m30 > coreChecks.scale.m10 &&
    coreChecks.scale.m10 > coreChecks.scale.m06,
    'Multiplicador deve regredir continuamente de v10.0 (3.00x) até v0.6 (0.68x)'
  );
  assert(coreChecks.spamRatio === 3.00, `Spam v10.0 deve render 3.00x o Spam v1.0, rendeu ${coreChecks.spamRatio}x`);
  assert(coreChecks.minerRatio === 3.00, `Miner v10.0 deve minerar 3.00x o Miner v1.0, minerou ${coreChecks.minerRatio}x`);

  // 3) Abrir menu Meu Computador -> Laboratório de Vírus e validar os 3 Rounds com Leve Explicação!
  console.log('2) Testando ritual 3 Rounds (3->1, 3->2, 3->1) + Leve Explicação nos Cartões e Combo...');
  await page.evaluate(() => {
    const det = document.getElementById('navTopic_pc');
    if (det) det.open = true;
  });
  await page.waitForSelector('#navBtnVirusLab', { visible: true });
  await page.click('#navBtnVirusLab');
  await page.waitForSelector('#winVirusLab', { visible: true });
  await new Promise((r) => setTimeout(r, 300));

  const r1Check = await page.evaluate(() => {
    const hints = Array.from(document.querySelectorAll('#winVirusLab .vlab-block-hint')).map((el) => el.textContent.trim());
    const cards = document.querySelectorAll('#winVirusLab .vlab-block-card');
    cards[0].click();
    const notionText = document.getElementById('vlabComboNotionBox')?.innerText || '';
    return { hintCount: hints.length, firstHint: hints[0], notionText };
  });
  assert(r1Check.hintCount === 3 && r1Check.firstHint.length > 20, 'Round 1 deve exibir leve explicação nos 3 cartões');
  assert(r1Check.notionText.includes('Entrada:'), 'Caixa de noção do combo deve atualizar ao escolher no Round 1');
  await page.screenshot({ path: path.join(OUT_DIR, '01-round1-3opcoes-com-explicacao.png') });

  // ROUND 2: 3 opções -> escolher 2
  await page.click('#btnVlabNextRound');
  await new Promise((r) => setTimeout(r, 200));
  const r2Check = await page.evaluate(() => {
    const cards = document.querySelectorAll('#winVirusLab .vlab-block-card');
    cards[0].click();
    cards[1].click();
    return {
      pressed: document.querySelectorAll('#winVirusLab .vlab-block-card[aria-pressed="true"]').length,
      notionText: document.getElementById('vlabComboNotionBox')?.innerText || ''
    };
  });
  assert(r2Check.pressed === 2 && r2Check.notionText.includes('Núcleo Duplo:'), 'Round 2 deve escolher 2 blocos e atualizar noção do combo');
  await page.screenshot({ path: path.join(OUT_DIR, '02-round2-3opcoes-escolher-2.png') });

  // ROUND 3: 3 opções -> escolher 1
  await page.click('#btnVlabNextRound');
  await new Promise((r) => setTimeout(r, 200));
  await page.evaluate(() => {
    const cards = document.querySelectorAll('#winVirusLab .vlab-block-card');
    cards[0].click();
    const inp = document.getElementById('vlabStrainNameInput');
    if (inp) inp.value = 'Proto-Alpha';
  });
  await page.screenshot({ path: path.join(OUT_DIR, '03-round3-3opcoes-escolher-1.png') });
  await page.click('#btnVlabCompile');
  await page.waitForSelector('#vlabCompileResultCard', { visible: true });

  // 4) Testar quando sai o MESMO VÍRUS que o jogador já possui (Fusão & Refino sem perder a versão forte!)
  console.log('3) Validando caso de MESMO VÍRUS repetido (preserva o mais forte + lapida +v0.1/+v0.2 + XP bônus)...');
  const duplicateTest = await page.evaluate(() => {
    // Jogador está no Nível 4 (teto v4.5) e já tem Miner.vminer v3.0 (1.44x)
    window.virusLabEngine.state.xp = 420;
    window.virusLabEngine.state.level = 4;
    window.softwareEngine.state.inventory.vminer.owned = true;
    window.softwareEngine.state.inventory.vminer.licensed = true;
    window.softwareEngine.state.inventory.vminer.versionInt = 30; // v3.0 (1.44x)

    // Agora compila uma combinação que dá o MESMO Miner.vminer porém mais fraca (ex: Camada I -> ~v1.2..v2.4)
    window.virusLabEngine.state.activeDraft = {
      startedAt: Date.now(),
      round: 3,
      optionsByRound: { 1: ['R1_09', 'R1_01', 'R1_05'], 2: ['R2_09', 'R2_01', 'R2_23'], 3: ['R3_07', 'R3_01', 'R3_04'] },
      picks: { r1: 'R1_09', r2: ['R2_09', 'R2_01'], r3: 'R3_07' },
      customName: 'Miner-Repetido-Cepa'
    };
    const res = window.virusLabEngine.compileCurrentDraft('Miner-Repetido-Cepa');
    return {
      compiledVerInt: res.report.versionInt,
      outcomeMode: res.report.diskDelivery.outcomeMode,
      prevVer: res.report.diskDelivery.prevVersion,
      activeVerInt: window.softwareEngine.state.inventory.vminer.versionInt,
      activeVerLabel: res.report.diskDelivery.activeVersion,
      activeMult: res.report.diskDelivery.activeMultiplier,
      duplicateRecycleXp: res.report.duplicateRecycleXp,
      hasNoticeInDom: !!document.getElementById('vlabDuplicateNotice')
    };
  });
  console.log('   Resultado de Mesmo Vírus Repetido:', duplicateTest);
  assert(duplicateTest.outcomeMode === 'duplicate_refined', `Esperado duplicate_refined, obteve ${duplicateTest.outcomeMode}`);
  assert(duplicateTest.activeVerInt > 30, 'Mesmo vírus repetido não pode rebaixar v3.0 e deve lapidar +v0.1/+v0.2');
  assert(duplicateTest.duplicateRecycleXp > 0 && duplicateTest.hasNoticeInDom, 'Deve conceder XP bônus de reciclagem e mostrar aviso de fusão');
  await new Promise((r) => setTimeout(r, 250));
  await page.screenshot({ path: path.join(OUT_DIR, '04-mesmo-virus-fusao-sem-perder-forca.png') });

  // 5) Evoluir ao Nível Máximo (Nv. 10) e compilar v10.0 = 3.00x MÁXIMO!
  console.log('4) Validando Nível Máximo (Nv.10) gerando v10.0 com 3.00x de multiplicador...');
  const maxLvlCompile = await page.evaluate(() => {
    if (window.hardwareEngine && window.hardwareEngine.current) {
      window.hardwareEngine.current.hdd = 3;
      window.hardwareEngine.saveRig(window.hardwareEngine.current);
    }
    window.virusLabEngine.state.xp = 3150;
    window.virusLabEngine.state.level = 10;
    window.virusLabEngine.state.discoveredSets = ['SET_01', 'SET_12', 'SET_23', 'SET_34', 'SET_45', 'SET_51', 'SET_52'];
    window.virusLabEngine.state.activeDraft = {
      startedAt: Date.now(),
      round: 3,
      optionsByRound: {
        1: ['R1_12', 'R1_16', 'R1_20'],
        2: ['R2_12', 'R2_24', 'R2_20'],
        3: ['R3_16', 'R3_09', 'R3_15']
      },
      picks: { r1: 'R1_12', r2: ['R2_12', 'R2_24'], r3: 'R3_16' },
      customName: 'Omega-Satoshi-Zero'
    };
    const res = window.virusLabEngine.compileCurrentDraft('Omega-Satoshi-Zero');
    return {
      versionLabel: res.report.versionLabel,
      versionInt: res.report.versionInt,
      yieldMultiplier: res.report.yieldMultiplier,
      setId: res.report.matchedSet?.id
    };
  });
  console.log('   Compilação Nível Máximo (v10.0 = 3.00x):', maxLvlCompile);
  assert(maxLvlCompile.versionInt === 100 && maxLvlCompile.yieldMultiplier === 3.00, 'No Nível 10 com S+ deve gerar v10.0 com 3.00x exato');
  await new Promise((r) => setTimeout(r, 250));
  await page.screenshot({ path: path.join(OUT_DIR, '05-resultado-v10-multiplicador-3x-maximo.png') });

  // Capturar Programas & Proteção mostrando a tag [3.00x BTC] e [LAB] sem cópias inúteis repetidas
  await page.evaluate(() => {
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
    window.navTo('winSoftware');
  });
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: path.join(OUT_DIR, '06-programas-com-multiplicador-regressivo.png') });

  // 6) Persistência F5
  console.log('5) Validando persistência F5...');
  await page.evaluate(() => {
    if (window.onlineEngine) window.onlineEngine.saveLocalSnapshotImmediate();
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 900));

  const afterReload = await page.evaluate(() => ({
    labLevel: window.virusLabEngine.state.level,
    minerVerInt: window.softwareEngine.state.inventory.vminer.versionInt,
    minerMult: window.softwareEngine.getVirusYieldMultiplier(window.softwareEngine.state.inventory.vminer.versionInt)
  }));
  assert(afterReload.labLevel === 10 && afterReload.minerVerInt === 100 && afterReload.minerMult === 3.00, 'v10.0 (3.00x) deve persistir após F5');
  assert(pageErrors.length === 0, 'Erros JS na página: ' + pageErrors.join('; '));

  console.log('✅ TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
  await browser.close();
})().catch((err) => {
  console.error('❌ FALHA NO TESTE E2E:', err);
  process.exit(1);
});
