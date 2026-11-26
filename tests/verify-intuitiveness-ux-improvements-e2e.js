/**
 * Suíte E2E — Melhorias de Intuição:
 * 1) Alerta Inteligente "⚠️ IP Exposto" SEM revelar onde foi esquecido (HUD + Logs + Home GPS)
 * 2) Checklist SSH + Limpar IP em 1 Clique + Aviso ao Sair + Leitor Visual de .txt
 * 3) Botão "Onde conseguir versão mais forte?" -> Manda para o LABORATÓRIO quando não há enigma mais forte!
 * 4) Etiquetas claras em Programas & Proteção (RAM vs Ataque Automático vs Vírus)
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const IMG_DIR = path.resolve(__dirname, '../../reports/melhorias-intuitivas-alerta-cego-e-laboratorio/images');

(async () => {
  fs.mkdirSync(IMG_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,860']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 860 });
    page.on('dialog', async (d) => { try { await d.accept(); } catch (e) {} });

    await page.goto('http://localhost:8080/hacker-city-web/index.html', { waitUntil: 'networkidle2' });

    // 1. Validar Alerta Inteligente de IP Exposto SEM REVELAR O LOCAL (203.17.88.40 / Farofa jamais citados!)
    const blindAlertAudit = await page.evaluate(async () => {
      localStorage.clear();
      sessionStorage.clear();
      window.DISABLE_AUTO_TOUR = true;
      localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
      await window.enterInstantOperatorMode('operador_intuitivo');
      window.spotlightTour?.finishTour?.(true);
      window.supabase = null;
      if (window.onlineEngine) window.onlineEngine.scheduleSave = () => {};
      window.integrityGuard.runAuthorized(() => {
        window.currentWallet.balance = 25000;
        window.currentProfile.reputation = 200;
      });
      if (window.tutorialEngine && window.tutorialEngine.state) {
        window.tutorialEngine.state.completed = true;
        window.tutorialEngine.save();
      }

      const myIp = window.networkIdentity.getPublicIp();
      window.internetEngine.appendServerLog('203.17.88.40', `SSH LOGIN OK user=root src=${myIp}`);
      window.updateHudDisplays();
      window.renderHome();

      const badge = document.getElementById('hudExposedTraceBadge');
      const badgeVisible = badge && badge.style.display !== 'none';
      const badgeText = badge ? badge.innerText : '';
      const homeStepText = document.querySelector('#homeBody .hc-split-main')?.innerText || '';

      window.openBlindExposedIpNotice();
      const logsText = document.getElementById('logsPageBody')?.innerText || '';
      const leakedSecretHost = [badgeText, homeStepText, logsText].some(
        (txt) => txt.includes('203.17.88.40') || txt.toLowerCase().includes('farofa')
      );

      return { badgeVisible, badgeText, homeStepText, logsText, leakedSecretHost };
    });

    assert.strictEqual(blindAlertAudit.badgeVisible, true, 'Selo ⚠️ IP Exposto deve aparecer no topo quando o IP consta em log externa');
    assert.strictEqual(blindAlertAudit.leakedSecretHost, false, 'PROIBIDO vazar em qual máquina/IP o rastro foi esquecido!');
    assert(blindAlertAudit.logsText.includes('não revela em qual máquina'), 'Tela de alerta deve explicar que não revela o local');

    await new Promise((r) => setTimeout(r, 180));
    await page.screenshot({ path: path.join(IMG_DIR, '01-alerta-ip-exposto-sem-revelar-local.png') });

    // Limpar o rastro anterior para testar Checklist SSH + Modal de Saída + Leitor .txt
    await page.evaluate(() => { window.botAI.wipeLogs('203.17.88.40'); window.updateHudDisplays(); });

    // 2. Validar Checklist SSH Passo a Passo, Leitor Visual de .txt, Aviso ao Sair e Limpeza em 1 Clique
    const sshUxAudit = await page.evaluate(() => {
      const host = window.internetEngine.resolveHost('198.51.100.42');
      window.internetEngine.onAttackSucceeded(host, 'password', host.rootPassword, 'root');
      window.stealthXhdEngine.downloadRemoteSoftware(host, 'vspam', 10, true);
      window.internetEngine.sshSubTab = 'files';
      window.internetEngine.render();

      const checklistText = document.getElementById('sshStepChecklistBar')?.innerText || '';
      const hasQuickWipeTop = !!document.getElementById('btnQuickWipeMyIpTop');
      const oneClickVirusLabel = document.getElementById('btnDeployRemoteVirus')?.innerText || '';

      // Abrir leitor visual de .txt
      const firstFile = (host.files && host.files[0]) ? host.files[0].name : null;
      if (firstFile) window.openRemoteTxtReaderModal('198.51.100.42', firstFile);
      const txtModalOpen = !!document.getElementById('hcTxtReaderModal');

      return { checklistText, hasQuickWipeTop, oneClickVirusLabel, txtModalOpen };
    });

    assert.strictEqual(sshUxAudit.hasQuickWipeTop, true, 'Deve exibir botão de 1 clique para limpar o IP no topo do SSH');
    assert(sshUxAudit.oneClickVirusLabel.includes('1 Clique'), 'Botão principal de vírus deve destacar 1 Clique');
    assert.strictEqual(sshUxAudit.txtModalOpen, true, 'Clicar em arquivo .txt deve abrir o modal Leitor de Texto');

    await new Promise((r) => setTimeout(r, 180));
    await page.screenshot({ path: path.join(IMG_DIR, '02-checklist-ssh-1-clique-e-leitor-txt.png') });

    const exitSafeAudit = await page.evaluate(() => {
      document.getElementById('hcTxtReaderModal')?.remove();
      const blockedDisconnect = window.internetEngine.disconnectSsh();
      const dirtyModalShown = !!document.getElementById('hcDirtyExitModal');
      window.internetEngine.quickWipeMyIpOnCurrentSsh(true);
      return {
        blockedDisconnect,
        dirtyModalShown,
        stillConnected: !!window.internetEngine.activeSshIp,
        badgeHiddenNow: document.getElementById('hudExposedTraceBadge')?.style.display === 'none'
      };
    });

    assert.strictEqual(exitSafeAudit.blockedDisconnect, false, 'Desconectar com IP na log deve pedir confirmação amigável');
    assert.strictEqual(exitSafeAudit.dirtyModalShown, true, 'Modal de saída com log suja deve aparecer');
    assert.strictEqual(exitSafeAudit.stillConnected, false, 'Limpar e sair seguro deve encerrar o SSH');
    assert.strictEqual(exitSafeAudit.badgeHiddenNow, true, 'Selo ⚠️ IP Exposto deve sumir assim que o rastro é limpo');

    // 3. Validar Botão "Onde conseguir versão mais forte?":
    //    3a) Se houver Enigma acessível com versão maior -> aponta para o Enigma;
    //    3b) CASO NÃO TENHA ENIGMA MAIS FORTE -> manda direto para o LABORATÓRIO!
    const enigmaCaseCheck = await page.evaluate(() => {
      window.navTo('winInternet');
      window.internetEngine.openIp('77.3.9.21', 'invadir'); // Banco Firewall v2.5
      const routeWhenEnigmaAvailable = window.internetEngine.findUpgradeRouteForBlockedTool('cracker', 2.5);
      // Agora simular que todos os enigmas de Cracker já foram concluídos (não há enigma mais forte!)
      if (window.puzzleTrailEngine) {
        window.puzzleTrailEngine.ensureLoaded();
        const allIds = (window.puzzleTrailEngine.getAllNodes() || []).map((n) => n.index);
        window.puzzleTrailEngine.state.solved = allIds;
        window.puzzleTrailEngine.save();
      }
      window.internetEngine.render();
      return routeWhenEnigmaAvailable;
    });
    assert.strictEqual(enigmaCaseCheck.mode, 'enigma', 'Enquanto houver Enigma mais forte acessível, deve sugerir o Enigma');

    await new Promise((r) => setTimeout(r, 180));
    await page.screenshot({ path: path.join(IMG_DIR, '03-alvo-bloqueado-botao-ir-pro-laboratorio.png') });

    const labRouteAudit = await page.evaluate(async () => {
      const btn = document.getElementById('btnWhereToUpgradeCracker');
      const btnLabel = btn ? btn.innerText : '';
      btn.click();
      const winAfterClick = window.winManager.current;
      const activeLabTab = window.virusLabEngine.activeTab;
      const hasRecommendedBadge = (document.getElementById('vlabResearchCard_cracker')?.innerText || '').includes('Recomendado');

      const verBefore = window.softwareEngine.state.inventory.cracker.versionInt;
      await window.softwareEngine.researchUpgrade('cracker');
      window.virusLabEngine.renderUI();
      const verAfter = window.softwareEngine.state.inventory.cracker.versionInt;

      return { btnLabel, winAfterClick, activeLabTab, hasRecommendedBadge, verBefore, verAfter };
    });

    assert(labRouteAudit.btnLabel.includes('Laboratório'), 'Sem enigma mais forte disponível, o botão deve apontar para o Laboratório');
    assert.strictEqual(labRouteAudit.winAfterClick, 'winVirusLab', 'Clicar no botão deve abrir direto o Laboratório (winVirusLab)');
    assert.strictEqual(labRouteAudit.activeLabTab, 'research', 'Deve abrir direto na aba de Evoluir Programas (P&D) do Laboratório');
    assert.strictEqual(labRouteAudit.hasRecommendedBadge, true, 'Deve destacar o programa recomendado para o alvo bloqueado');
    assert.strictEqual(labRouteAudit.verAfter, labRouteAudit.verBefore + 5, 'Deve evoluir +v0.5 direto na bancada do Laboratório');

    await new Promise((r) => setTimeout(r, 180));
    await page.screenshot({ path: path.join(IMG_DIR, '04-laboratorio-aba-evoluir-programas-recomendado.png') });

    // 4. Validar Etiquetas Claras em Programas & Proteção
    const labelsAudit = await page.evaluate(() => {
      window.softwareEngine.ensureLoaded();
      window.softwareEngine.state.inventory.vspam = { owned: true, installed: false, versionInt: 10, licensed: true, drive: 'hd' };
      window.navTo('winSoftware');
      window.softwareEngine.renderUI();
      const txt = document.getElementById('softwareAppBody')?.innerText || '';
      return {
        hasRamBadge: txt.includes('Fica Ligado na RAM'),
        hasAutoAttackBadge: txt.includes('Automático ao Invadir/Usar'),
        hasVirusBadge: txt.includes('Enviar p/ Vítimas'),
        strikes: window.integrityGuard ? window.integrityGuard.cheatStrikes : 0
      };
    });

    assert.strictEqual(labelsAudit.hasRamBadge, true, 'Deve exibir etiqueta Fica Ligado na RAM');
    assert.strictEqual(labelsAudit.hasAutoAttackBadge, true, 'Deve exibir etiqueta Automático ao Invadir/Usar');
    assert.strictEqual(labelsAudit.hasVirusBadge, true, 'Deve exibir etiqueta Enviar p/ Vítimas');
    assert.strictEqual(labelsAudit.strikes, 0, 'Zero strikes do IntegrityGuard');

    await new Promise((r) => setTimeout(r, 180));
    await page.screenshot({ path: path.join(IMG_DIR, '05-programas-etiquetas-claras-ram-ataque-virus.png') });

    // 5. Validar Despoluição Visual (Zero mural duplicado de 13 cards, Laboratório limpo em 1 coluna, Lavagem enxuta e Home limpa)
    const CLEAN_DIR = path.resolve(__dirname, '../../reports/interface-limpa-despoluida-e-intuitiva/images');
    fs.mkdirSync(CLEAN_DIR, { recursive: true });

    const declutterAudit = await page.evaluate(() => {
      const hasDuplicateDiscoverWall = !!document.getElementById('softwareDiscoverCardsSection');
      const tempChipHiddenWhenCool = document.getElementById('hudTempBadge')?.style.display === 'none';
      const crackerHasUselessRunBtn = !!document.getElementById('btnToggleInstall_cracker');
      return { hasDuplicateDiscoverWall, tempChipHiddenWhenCool, crackerHasUselessRunBtn };
    });
    assert.strictEqual(declutterAudit.hasDuplicateDiscoverWall, false, 'Mural duplicado de 13 cards embaixo de Programas deve ser removido');
    assert.strictEqual(declutterAudit.tempChipHiddenWhenCool, true, 'Temperatura fria (<55°C) não deve poluir a barra do topo');
    assert.strictEqual(declutterAudit.crackerHasUselessRunBtn, false, 'Cracker automático não deve ter botão inútil de engrenagem');
    await page.screenshot({ path: path.join(CLEAN_DIR, '01-programas-agrupado-limpo-sem-mural-duplicado.png') });

    await page.evaluate(() => { window.navTo('winHome'); window.renderHome(); });
    await new Promise((r) => setTimeout(r, 150));
    await page.screenshot({ path: path.join(CLEAN_DIR, '02-home-inicio-limpo-focado-no-proximo-passo.png') });

    await page.evaluate(() => { window.navTo('winInternet'); window.internetEngine.openIp('77.3.9.21', 'invadir'); });
    await new Promise((r) => setTimeout(r, 150));
    await page.screenshot({ path: path.join(CLEAN_DIR, '03-internet-aba-invadir-limpa-2-botoes-claros.png') });

    await page.evaluate(() => { window.virusLabEngine.openForSoftwareUpgrade('cracker'); });
    await new Promise((r) => setTimeout(r, 150));
    await page.screenshot({ path: path.join(CLEAN_DIR, '04-laboratorio-evoluir-programas-1-coluna-limpa.png') });

    await page.evaluate(() => {
      window.nineSystemsEngine.addDirtyMoney(1200, 'Vitrine Limpa');
      window.navTo('winLaundering');
      window.nineSystemsEngine.activeLaunderingTab = 'vitrine';
      window.nineSystemsEngine.renderLaunderingHub();
    });
    await new Promise((r) => setTimeout(r, 150));
    await page.screenshot({ path: path.join(CLEAN_DIR, '05-lavagem-de-dinheiro-direta-sem-textao.png') });

    console.log('✅ SUÍTE MELHORIAS INTUITIVAS (ALERTA CEGO S/ LOCAL + ROTA PRO LABORATÓRIO + SSH 1 CLIQUE + ETIQUETAS) 100% APROVADA!', JSON.stringify({
      leakedSecretHost: blindAlertAudit.leakedSecretHost,
      routedToLab: labRouteAudit.winAfterClick,
      upgradedCrackerVer: labRouteAudit.verAfter / 10
    }));
  } finally {
    await browser.close();
  }
})();
