const puppeteer = require('puppeteer');
const assert = require('assert');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=390,844']
  });
  const page = await browser.newPage();
  page.on('dialog', async (d) => { try { await d.accept(); } catch (e) {} });

  const BASE_URL = process.env.HC_BASE_URL || 'http://localhost:8080/hacker-city-web/index.html';

  // 1. Auth Portal em 360x800 (Android compacto): Login, Cadastro, OTP e 1-Clique roláveis sem corte
  await page.setViewport({ width: 360, height: 800, isMobile: true, hasTouch: true });
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 250));

  for (const tab of ['login', 'register', 'verify']) {
    const authRes = await page.evaluate((t) => {
      if (t === 'verify') {
        document.querySelectorAll('.auth-form').forEach((f) => f.classList.remove('active'));
        document.getElementById('formVerify')?.classList.add('active');
      } else if (typeof window.switchAuthTab === 'function') {
        window.switchAuthTab(t);
      }
      const overlay = document.getElementById('authOverlay');
      const card = document.querySelector('.auth-card');
      const oSt = window.getComputedStyle(overlay);
      const r = card.getBoundingClientRect();
      return {
        overflowY: oSt.overflowY,
        top: Math.round(r.top),
        right: Math.round(r.right),
        vw: window.innerWidth
      };
    }, tab);
    assert.ok(authRes.overflowY === 'auto' || authRes.overflowY === 'scroll', `Auth ${tab} deve permitir rolagem vertical`);
    assert.ok(authRes.top >= 0 && authRes.right <= authRes.vw + 1, `Auth ${tab} não pode cortar topo/direita em 360x800`);
  }

  // Entrar no jogo e preparar estado completo (incluindo pior caso HC_SIDEBAR_COLLAPSED=1)
  await page.evaluate(async () => {
    window.DISABLE_AUTO_TOUR = true;
    localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
    localStorage.setItem('HC_SIDEBAR_COLLAPSED', '1');
    await window.enterInstantOperatorMode();
    if (window.spotlightTour?.finishTour) window.spotlightTour.finishTour(true);
    window.integrityGuard.runAuthorized(() => {
      window.currentWallet.balance = 250000;
      window.currentProfile.reputation = 1600;
    });
    window.progressiveUnlockEngine?.toggleVeteranShowAll(true);
    window.nineSystemsEngine.addDirtyMoney(8500, 'MobileE2E');
    if (!window.clanEngine.getMyClan()) window.clanEngine.createClan('MobileOps', 'MOB', 'Mobile Suite');
    const host = window.internetEngine.resolveHost('203.17.88.40');
    window.hackedDb.upsertHost({ ip: '203.17.88.40', hostname: 'Farofa Systems B2B', kind: 'empresa', sshUser: 'root', password: host.rootPassword, accessMethod: 'password' });
  });
  await new Promise((r) => setTimeout(r, 350));

  // 2. Topbar, Gaveta c/ Backdrop, Busca Rápida de IP e Revelação de IP por Toque em 390x844
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  const shellRes = await page.evaluate(() => {
    const topbar = document.querySelector('.topbar');
    const btcVis = !!document.getElementById('hudBtcChip')?.offsetParent;
    const repVis = !!document.getElementById('hudReputation')?.closest('.topbar-metric')?.offsetParent;

    // Gaveta mobile abre, mantém rótulos visíveis e fecha pelo backdrop
    document.getElementById('btnMobileNavToggle').click();
    const sb = document.querySelector('.sidebar');
    const opened = sb.classList.contains('mobile-open');
    const labelVis = window.getComputedStyle(document.querySelector('#navBtnHome .nav-direct-label')).display !== 'none';
    document.getElementById('hcMobileDrawerBackdrop').click();
    const closedByBackdrop = !sb.classList.contains('mobile-open');

    // Barra rápida de IP no celular
    document.getElementById('btnMobileIpQuick').click();
    const ipBarOpen = document.getElementById('hcMobileIpDrawerBar').classList.contains('open');
    window.toggleMobileIpBar(false);

    // 1º toque revela IP; 2º toque abre ISP 71.4.5.1
    const ipChip = document.getElementById('hudMyIpChip');
    ipChip.classList.remove('ip-revealed');
    ipChip.click();
    const firstTapRevealed = ipChip.classList.contains('ip-revealed');
    ipChip.click();
    const secondTapOpenedIsp = window.winManager.current === 'winBrowser' && window.internetEngine.currentIp === '71.4.5.1';

    const moneyRect = document.getElementById('hudWalletMoney')?.getBoundingClientRect() || { left: -1, right: 9999 };
    const moneyVisibleFirstView = moneyRect.left >= 0 && moneyRect.right <= window.innerWidth + 2;

    return {
      topbarOverflow: topbar.scrollWidth > topbar.clientWidth + 1,
      moneyVisibleFirstView,
      btcVis, repVis, opened, labelVis, closedByBackdrop, ipBarOpen, firstTapRevealed, secondTapOpenedIsp
    };
  });
  assert.strictEqual(shellRes.topbarOverflow, false, 'Topbar não pode estourar horizontalmente no celular');
  assert.strictEqual(shellRes.moneyVisibleFirstView, true, 'Saldo de Dinheiro deve caber visível na barra superior em 390x844 sem cortar');
  assert.ok(shellRes.btcVis && shellRes.repVis, 'Chips de Bitcoin e Reputação devem ficar acessíveis na faixa mobile');
  assert.ok(shellRes.opened && shellRes.labelVis && shellRes.closedByBackdrop, 'Gaveta mobile deve abrir c/ rótulos e fechar pelo backdrop');
  assert.ok(shellRes.ipBarOpen, 'Botão rápido de IP no celular deve abrir barra de endereço');
  assert.ok(shellRes.firstTapRevealed && shellRes.secondTapOpenedIsp, '1º toque deve revelar IP e 2º toque abrir Provedor ISP');

  // 3. Varredura de todas as 27 telas + abas + modais em 390x844, 360x800 e 768x1024
  const screens = [
    ['winHome', () => window.navTo('winHome')],
    ['winBrowser:dir', () => { window.navTo('winBrowser'); window.internetEngine.goHome?.(); }],
    ['winBrowser:invadir', () => window.internetEngine.openIp('203.17.88.40', 'invadir')],
    ['winBrowser:minipc', () => { window.internetEngine.openIp('203.17.88.40', 'invadir'); window.internetEngine.openCrackerMiniPc('all'); }],
    ['winBrowser:ssh', () => { window.internetEngine.closeCrackerMiniPc(); window.internetEngine.openIp('203.17.88.40', 'entrar'); }],
    ['winBrowser:cctv', () => window.internetEngine.openCompanyCctv('203.17.88.40')],
    ['winSoftware', () => window.navTo('winSoftware')],
    ['winHardware:overview', () => { window.navTo('winHardware'); window.hardwareEngine.setTab('overview'); }],
    ['winHardware:upgrade', () => { window.navTo('winHardware'); window.hardwareEngine.setTab('upgrade'); }],
    ['winHardware:xhd', () => { window.navTo('winHardware'); window.hardwareEngine.setTab('xhd'); }],
    ['winTaskManager', () => window.navTo('winTaskManager')],
    ['winLogs', () => window.navTo('winLogs')],
    ['winHackedDb', () => window.navTo('winHackedDb')],
    ['winUniversity', () => window.navTo('winUniversity')],
    ['winBank', () => window.navTo('winBank')],
    ['winBitcoin', () => window.navTo('winBitcoin')],
    ['winQuitinete', () => window.navTo('winQuitinete')],
    ['winLaundering:vitrine', () => { window.navTo('winLaundering'); window.nineSystemsEngine.activeLaunderingTab = 'vitrine'; window.nineSystemsEngine.renderLaunderingHub(); }],
    ['winLaundering:company', () => { window.navTo('winLaundering'); window.nineSystemsEngine.activeLaunderingTab = 'company'; window.nineSystemsEngine.renderLaunderingHub(); }],
    ['winOpsHub:stocks', () => { window.navTo('winOpsHub'); window.ecosystemHub.switchTab('stocks'); }],
    ['winOpsHub:minigames', () => { window.navTo('winOpsHub'); window.ecosystemHub.switchTab('minigames'); }],
    ['winOpsHub:elite', () => { window.navTo('winOpsHub'); window.ecosystemHub.switchTab('elite'); }],
    ['winSkillTree', () => window.navTo('winSkillTree')],
    ['winVirusLab', () => window.navTo('winVirusLab')],
    ['winWorldMap', () => window.navTo('winWorldMap')],
    ['winLan', () => window.navTo('winLan')],
    ['winConnManager', () => window.navTo('winConnManager')],
    ['winOnline', () => window.navTo('winOnline')],
    ['winMissions', () => window.navTo('winMissions')],
    ['winFbi', () => window.navTo('winFbi')],
    ['winClan', () => window.navTo('winClan')],
    ['winForum', () => window.navTo('winForum')],
    ['winNews', () => window.navTo('winNews')],
    ['winRanking', () => window.navTo('winRanking')],
    ['winMail', () => window.navTo('winMail')],
    ['winIrc', () => window.navTo('winIrc')],
    ['winTerminal', () => window.navTo('winTerminal')],
    ['winArcade', () => window.navTo('winArcade')],
    ['winPanic', () => window.navTo('winPanic')],
    ['winProfile', () => window.navTo('winProfile')],
    ['modal:dirtyBridge', () => window.nineSystemsEngine.openDirtyMoneyBridgeModal('Intel Pentium 4', 950)],
    ['modal:bufferOverflow', () => { window.nineSystemsEngine.closeDirtyMoneyBridgeModal(); window.topTenMechanics.openBufferOverflowModal('58.40.12.9'); }],
    ['modal:activeDefense', () => { document.getElementById('hcBufferOverflowModal')?.remove(); window.nineSystemsEngine.triggerActiveDefensePopover({ originIp: '91.134.72.19', originAlias: 'nyx_0day' }); }],
    ['modal:unlockPreview', () => { window.nineSystemsEngine.activeDefenseAlert = null; window.nineSystemsEngine.renderDefensePopoverDom(); window.progressiveUnlockEngine.showUnlockHintModal('winOpsHub'); }]
  ];

  const layoutIssues = [];
  const resolutionMatrix = [
    { width: 320, height: 568 },
    { width: 360, height: 800 },
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 412, height: 915 },
    { width: 430, height: 932 },
    { width: 844, height: 390 },
    { width: 768, height: 1024 }
  ];
  for (const vp of resolutionMatrix) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.width < 768 || vp.height < 500, hasTouch: true });
    await page.evaluate(() => {
      window.nineSystemsEngine.closeDirtyMoneyBridgeModal();
      document.getElementById('hcBufferOverflowModal')?.remove();
      window.nineSystemsEngine.activeDefenseAlert = null;
      window.nineSystemsEngine.renderDefensePopoverDom();
      document.getElementById('hcUnlockPreviewModal')?.remove();
    });
    for (const [label, fn] of screens) {
      await page.evaluate(fn);
      await new Promise((r) => setTimeout(r, 65));
      const errs = await page.evaluate((tag) => {
        const out = [];
        const vw = window.innerWidth;
        if (document.documentElement.scrollWidth > vw + 2) out.push(`${tag}:docOverflow(${document.documentElement.scrollWidth}>${vw})`);
        const activeWin = Array.from(document.querySelectorAll('.window-frame')).find((w) => w.offsetParent !== null);
        const wb = activeWin?.querySelector('.window-body');
        if (wb && wb.scrollWidth > wb.clientWidth + 4) out.push(`${tag}:winBodyOverflow(${wb.scrollWidth}>${wb.clientWidth})`);
        if (wb && vw <= 680) {
          wb.querySelectorAll('.soft-table-wrap, .soft-tabs-left').forEach((sub, idx) => {
            if (sub.offsetParent !== null && sub.scrollWidth > sub.clientWidth + 6) {
              out.push(`${tag}:innerClip[${sub.className}#${idx}](${sub.scrollWidth}>${sub.clientWidth})`);
            }
          });
        }
        return out;
      }, `${vp.width}x${vp.height}:${label}`);
      layoutIssues.push(...errs);
    }
  }
  assert.deepStrictEqual(layoutIssues, [], `Encontrados estouros mobile/tablet: ${layoutIssues.join(', ')}`);

  // 4. Todos os passos do Spotlight Tour em 390x844, 320x568 e Paisagem 844x390 (0 sobreposição)
  for (const tvp of [{ width: 390, height: 844 }, { width: 320, height: 568 }, { width: 844, height: 390 }]) {
    await page.setViewport({ width: tvp.width, height: tvp.height, isMobile: true, hasTouch: true });
    const totalSteps = await page.evaluate(() => {
      document.getElementById('hcUnlockPreviewModal')?.remove();
      window.DISABLE_AUTO_TOUR = false;
      localStorage.removeItem('HC_DISABLE_AUTO_TOUR');
      window.progressiveUnlockEngine.toggleVeteranShowAll(false);
      window.integrityGuard.runAuthorized(() => { window.currentProfile.reputation = 0; });
      window.spotlightTour.start(true);
      return window.spotlightTour.steps.length;
    });
    await new Promise((r) => setTimeout(r, 200));

    for (let i = 0; i < totalSteps; i++) {
      const stepState = await page.evaluate((idx) => {
        window.spotlightTour.goToStep(idx);
        return new Promise((resolve) => setTimeout(() => {
          const cr = document.getElementById('hcTourCard').getBoundingClientRect();
          const rr = document.getElementById('hcTourRing').getBoundingClientRect();
          const overlap = !(cr.right < rr.left || cr.left > rr.right || cr.bottom < rr.top || cr.top > rr.bottom);
          const out = cr.left < -2 || cr.right > window.innerWidth + 2 || cr.top < -2 || cr.bottom > window.innerHeight + 2;
          resolve({ step: idx + 1, overlap, out });
        }, 210));
      }, i);
      assert.strictEqual(stepState.overlap, false, `Tour Passo ${stepState.step} sobrepôs alvo em ${tvp.width}x${tvp.height}`);
      assert.strictEqual(stepState.out, false, `Tour Passo ${stepState.step} saiu da tela em ${tvp.width}x${tvp.height}`);
    }
  }

  const strikes = await page.evaluate(() => window.integrityGuard ? window.integrityGuard.cheatStrikes : 0);
  assert.strictEqual(strikes, 0, 'IntegrityGuard deve registrar 0 strikes durante toda a suíte mobile');

  // 5. Menu Lateral Exclusivo no Desktop (PR #124: abrir novo submenu fecha o anterior sem empilhar)
  const deskPage = await browser.newPage();
  await deskPage.evaluateOnNewDocument(() => {
    window.DISABLE_AUTO_TOUR = true;
    localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
  });
  await deskPage.setViewport({ width: 1366, height: 860, isMobile: false });
  await deskPage.goto('http://localhost:8080/hacker-city-web/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
  await deskPage.evaluate(async () => {
    await window.enterInstantOperatorMode('FlyoutCheck');
  });
  await new Promise((r) => setTimeout(r, 250));

  for (const sumId of ['navSummary_pc', 'navSummary_net', 'navSummary_money', 'navSummary_social', 'navSummary_career']) {
    await deskPage.click('#' + sumId);
    await new Promise((r) => setTimeout(r, 90));
    const flyState = await deskPage.evaluate(() => {
      const openTopics = Array.from(document.querySelectorAll('details.nav-topic[open]')).map((d) => d.id);
      const visibleSubs = Array.from(document.querySelectorAll('.nav-sublist')).filter((s) => getComputedStyle(s).display !== 'none');
      return { openTopics, visibleCount: visibleSubs.length };
    });
    assert.strictEqual(flyState.openTopics.length, 1, `Mais de 1 menu aberto após clicar em ${sumId}: ${flyState.openTopics.join(',')}`);
    assert.strictEqual(flyState.visibleCount, 1, `Mais de 1 .nav-sublist visível após clicar em ${sumId}`);
  }

  await deskPage.click('.topbar');
  await new Promise((r) => setTimeout(r, 80));
  const afterOutside = await deskPage.evaluate(() => ({
    openCount: document.querySelectorAll('details.nav-topic[open]').length,
    visibleCount: Array.from(document.querySelectorAll('.nav-sublist')).filter((s) => getComputedStyle(s).display !== 'none').length
  }));
  assert.strictEqual(afterOutside.openCount, 0, 'Clicar fora deveria fechar todos os submenus');
  assert.strictEqual(afterOutside.visibleCount, 0, 'Nenhum .nav-sublist deve continuar visível após clicar fora');

  // 6. Validar Máscara Translúcida Legível (sem blur) + Auto-Avanço ao clicar no alvo (sem clicar em Próximo no card!)
  const maskAndClickCheck = await deskPage.evaluate(() => {
    window.DISABLE_AUTO_TOUR = false;
    localStorage.removeItem('HC_DISABLE_AUTO_TOUR');
    window.spotlightTour.start(true);
    const maskEl = document.getElementById('hcTourMaskBottom');
    const cs = getComputedStyle(maskEl);
    const alphaMatch = cs.backgroundColor.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([0-9.]+)\)/);
    const alpha = alphaMatch ? parseFloat(alphaMatch[1]) : 1;
    return {
      stepBefore: window.spotlightTour.stepIndex,
      backdropFilter: cs.backdropFilter || cs.webkitBackdropFilter || 'none',
      alpha
    };
  });
  assert.strictEqual(maskAndClickCheck.stepBefore, 0, 'Tour deve iniciar no passo 0');
  assert.strictEqual(maskAndClickCheck.backdropFilter, 'none', 'Máscara do Tour não deve borrar o layout (backdrop-filter: none)');
  assert(maskAndClickCheck.alpha > 0.2 && maskAndClickCheck.alpha < 0.5, `Máscara deve ser escura porém visível (alpha=${maskAndClickCheck.alpha})`);

  await deskPage.click('#hudMyIpChip');
  await new Promise((r) => setTimeout(r, 120));
  const stepAfterClick1 = await deskPage.evaluate(() => window.spotlightTour.stepIndex);
  assert.strictEqual(stepAfterClick1, 1, 'Clicar diretamente em #hudMyIpChip deve avançar para o passo 2 mesmo no meio do áudio');

  const step2Sel = await deskPage.evaluate(() => {
    const el = window.spotlightTour.resolveTargetElement(window.spotlightTour.steps[1]);
    return el && el.id ? '#' + el.id : window.spotlightTour.steps[1].selector;
  });
  await deskPage.click(step2Sel);
  await new Promise((r) => setTimeout(r, 140));
  const stepAfterClick2 = await deskPage.evaluate(() => window.spotlightTour.stepIndex);
  assert.strictEqual(stepAfterClick2, 2, 'Clicar no alvo iluminado do passo 2 deve avançar automaticamente para o passo 3');

  await deskPage.close();

  console.log('✅ SUÍTE MOBILE, FLYOUT EXCLUSIVO, MÁSCARA VISÍVEL & AUTO-AVANÇO POR CLIQUE APROVADOS (0 Strikes)!');
  await browser.close();
})();
