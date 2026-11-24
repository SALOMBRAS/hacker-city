/**
 * ============================================================================
 * SUÍTE E2E — 5 NOVAS IDEIAS (PWA, RESUMO OFFLINE, SUPRIMENTO 7 DIAS + METAS,
 * PALETA DE COMANDO RÁPIDO ⚡ & UNIFICAÇÃO PVP SOMBRA MAGNÉTICA + RAID-1/0)
 * ============================================================================
 */
const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:8080/hacker-city-web/index.html';

function assert(cond, msg) {
  if (!cond) throw new Error(`FALHA E2E: ${msg}`);
}

(async () => {
  console.log('🚀 Iniciando Suíte E2E das 5 Novas Mecânicas (PRs #92 a #97)...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    await page.evaluateOnNewDocument(() => {
      window.DISABLE_AUTO_TOUR = true;
      try { localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1'); } catch (e) {}
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluate(async () => {
      await window.enterInstantOperatorMode('OperadorIdeas_' + Math.floor(1000 + Math.random() * 9000));
    });
    await new Promise((r) => setTimeout(r, 400));

    // 1. Validar PWA Manifest, Ícones SVG e Modal Mobile
    const pwaRes = await page.evaluate(async () => {
      const mResp = await fetch('manifest.json');
      const mJson = await mResp.json();
      const ic192 = await fetch('src/assets/icon-192.svg');
      const ic512 = await fetch('src/assets/icon-512.svg');
      window.navTo('winProfile');
      await new Promise((r) => setTimeout(r, 120));
      const cardExists = !!document.querySelector('#profilePwaCardMount #btnProfileInstallPwa');
      const promptRes = await window.pwaHelper.promptInstallApp();
      window.pwaHelper.openInstallGuideModal();
      const modalEl = document.getElementById('hcPwaInstallGuideModal');
      const modalVisible = modalEl && getComputedStyle(modalEl).display !== 'none';
      const horizOverflow = document.documentElement.scrollWidth > window.innerWidth + 1;
      window.pwaHelper.closeInstallGuideModal();
      return {
        manifestOk: mResp.status === 200 && mJson.display === 'standalone',
        iconsOk: ic192.status === 200 && ic512.status === 200,
        cardExists,
        promptOutcome: promptRes && promptRes.outcome,
        modalVisible,
        horizOverflow
      };
    });
    assert(pwaRes.manifestOk && pwaRes.iconsOk, 'Manifest PWA ou ícones 192/512 inválidos');
    assert(pwaRes.cardExists && pwaRes.modalVisible && !pwaRes.horizOverflow, 'Card/Modal PWA falhou ou estourou tela mobile');
    console.log('✅ [1/5] PWA Instalável + Ícones 192/512 + Guia Mobile/iOS validados (0 overflow)');

    // 2. Validar Relatório "Enquanto Você Esteve Offline" + Coleta em 1 Clique
    const offlineRes = await page.evaluate(() => {
      const ret = window.operatorRetentionEngine;
      ret.ensureLoaded();
      ret.state.lastSeenAt = Date.now() - (45 * 60 * 1000);
      ret.state.blockedAttacksSinceLastLogin = 2;
      ret.save();

      window.softwareEngine.ensureLoaded();
      window.softwareEngine.state.inventory.collector = { owned: true, installed: true, versionInt: 10, runningVerInt: 10 };
      window.softwareEngine.state.remoteInfections = [{
        id: 'inf_test_1',
        ip: '198.51.100.42',
        kind: 'vspam',
        versionInt: 10,
        accumulatedCash: 120,
        accumulatedSats: 0,
        installedAt: Date.now() - 600000
      }];

      ret.onSessionEntered();
      ret.openOfflineBriefingModal();
      const data = ret.getOfflineBriefingData();
      const modalText = document.getElementById('hcOfflineBriefingModal')?.innerText || '';
      const beforeDirty = Number(window.nineSystemsEngine.getDirtyBalance() || 0);
      ret.collectVirusesFromBriefing();
      const afterDirty = Number(window.nineSystemsEngine.getDirtyBalance() || 0);
      ret.closeOfflineBriefingModal();
      return {
        awayLabel: data.awayLabel,
        blockedCount: data.blockedCount,
        shieldRemText: data.shieldRemText || '',
        hasCollectText: modalText.includes('Enquanto Você Esteve Offline'),
        gainedDirty: +(afterDirty - beforeDirty).toFixed(2)
      };
    });
    assert(offlineRes.awayLabel.includes('45 min') && offlineRes.blockedCount === 2, 'Cálculo do Resumo Offline incorreto');
    assert(offlineRes.shieldRemText.includes('h') && offlineRes.hasCollectText && offlineRes.gainedDirty > 0, 'Coleta ou Escudo 24h no Resumo Offline falhou');
    console.log(`✅ [2/5] Resumo Offline ("${offlineRes.awayLabel}", ${offlineRes.blockedCount} bloqueios, +$${offlineRes.gainedDirty} sujos coletados) validado`);

    // 3. Validar Suprimento de 7 Dias + 3 Metas Diárias + Layout Ultra-Compacto 320x568
    await page.setViewport({ width: 320, height: 568, isMobile: true, hasTouch: true });
    const routineRes = await page.evaluate(() => {
      window.navTo('winHome');
      const ret = window.operatorRetentionEngine;
      const startBal = Number(window.currentWallet.balance || 0);
      const startRep = Number(window.currentProfile.reputation || 0);

      const sup1 = ret.claimDailySupply();
      const supDup = ret.claimDailySupply();

      ret.recordDailyGoalProgress('ghost_wipe');
      ret.recordDailyGoalProgress('clean_finance');
      ret.recordDailyGoalProgress('sharp_mind');

      const g1 = ret.claimDailyGoal('ghost_wipe');
      const g2 = ret.claimDailyGoal('clean_finance');
      const g3 = ret.claimDailyGoal('sharp_mind');
      const gDup = ret.claimDailyGoal('ghost_wipe');

      window.renderHome();
      const card = document.getElementById('hcHomeRoutineCard');
      const rect = card ? card.getBoundingClientRect() : { right: 999 };
      return {
        supOk: sup1.success && sup1.claimedDay === 1,
        supDupBlocked: !supDup.success && supDup.code === 'ALREADY_CLAIMED_TODAY',
        allGoalsOk: g1.success && g2.success && g3.success && !gDup.success,
        expectedBal: Number(sup1.reward.cleanCash || 0) + Number(g1.cashOut || 0) + Number(g2.cashOut || 0) + Number(g3.cashOut || 0),
        expectedRep: Number(g1.repOut || 0) + Number(g2.repOut || 0) + Number(g3.repOut || 0),
        deltaBal: +(Number(window.currentWallet.balance || 0) - startBal).toFixed(2),
        deltaRep: Number(window.currentProfile.reputation || 0) - startRep,
        fits320: rect.right <= 321 && document.documentElement.scrollWidth <= 321,
        strikes: window.integrityGuard ? window.integrityGuard.cheatStrikes : 0
      };
    });
    assert(routineRes.supOk && routineRes.supDupBlocked, 'Suprimento de 7 Dias ou trava anti-duplicata falhou');
    assert(routineRes.allGoalsOk && routineRes.deltaBal === routineRes.expectedBal && routineRes.deltaRep === routineRes.expectedRep, `Soma de recompensas incorreta: $${routineRes.deltaBal} / ${routineRes.deltaRep} REP`);
    assert(routineRes.fits320 && routineRes.strikes === 0, 'Card de Rotina estourou 320px ou acionou IntegrityGuard');
    console.log(`✅ [3/5] Check-in Escalável (+$${routineRes.deltaBal} Limpos +${routineRes.deltaRep} REP) + 320x568 sem overflow validados`);

    // 4. Validar Paleta de Comando Rápido (⚡ / Alt+K / IP Direto / Trava Progressiva)
    await page.setViewport({ width: 1366, height: 860, isMobile: false, hasTouch: false });
    const paletteRes = await page.evaluate(() => {
      document.getElementById('btnQuickCommandPalette').click();
      const isOpen = window.quickCommandPalette.isOpen;
      const lockedItems = window.quickCommandPalette.buildItems('laboratório');
      const labLocked = lockedItems.some((i) => i.id === 'win_winVirusLab' && i.locked === true);

      const inp = document.getElementById('hcQuickPaletteInput');
      inp.value = '71.4.5.1';
      inp.dispatchEvent(new Event('input'));
      const hasDirectIp = window.quickCommandPalette.currentItems[0]?.id === 'open_ip';
      window.quickCommandPalette.executeIndex(0);
      return {
        isOpen,
        labLocked,
        hasDirectIp,
        openedIp: window.internetEngine ? window.internetEngine.currentIp : ''
      };
    });
    assert(paletteRes.isOpen && paletteRes.labLocked && paletteRes.hasDirectIp && paletteRes.openedIp === '71.4.5.1', 'Paleta de Comando Rápido falhou');
    console.log('✅ [4/5] Paleta de Comando Rápido (⚡ / IP Direto 71.4.5.1 + respeito ao bloqueio progressivo) validada');

    // 5. Validar Unificação PvP: Sombra Magnética 7-Passos + RAID-1 (-40%) vs RAID-0 (+25%)
    const pvpRes = await page.evaluate(() => {
      // Desativa escudo de novato para simular duelo PvP real entre veteranos
      window.progressiveUnlockEngine.breakNewbieShield('Duelo PvP entre veteranos');
      const myIp = window.networkIdentity.getPublicIp();
      window.addLocalLog('PVP-INTRUSION', 'Conexão recebida de 203.98.41.77', 'danger');

      // Invasor humano apaga o próprio IP SEM Shred 7-Passos
      window.onlineEngine.handleIncomingPacket({
        pktId: 'pkt_shadow_test_' + Date.now(),
        kind: 'PVP_EDIT_LOG',
        senderId: 'att-human-99',
        senderTag: 'PhantomPvP',
        visibleIp: '203.98.41.77',
        targetIp: myIp,
        d: { wipedOwnIp: true, fullClear: false, customLines: ['Passei por aqui!'], crcVer: 5.0, expVer: 5.0 }
      }, true);

      const shadowCount = window.nineSystemsEngine.getActiveShadowCount('localhost');
      window.navTo('winLogs');
      const bannerVisible = !!document.getElementById('forensicShadowAlertBanner');

      // Habilita Analyzer v2.0 para ler setor magnético
      window.softwareEngine.state.inventory.analyzer = { owned: true, installed: true, versionInt: 22, runningVerInt: 22 };
      const scan = window.nineSystemsEngine.scanMagneticShadowsOnHost('localhost');
      const recoveredSubnet = scan.shadows && scan.shadows[0] ? scan.shadows[0].subnetPrefix : '';

      // Executa Shred 7-Passos local e verifica zeramento
      window.nineSystemsEngine.executeSevenPassShred('localhost');
      const afterShredCount = window.nineSystemsEngine.getActiveShadowCount('localhost');

      // Testa mitigação DDoS RAID-1 (-40%) vs vulnerabilidade RAID-0 (+25%)
      window.hardwareEngine.saveRig({ healthPct: 100 });
      window.topTenMechanics.ensureLoaded();
      window.topTenMechanics.state.raidMode = 'raid1';
      const hitRaid1 = window.hardwareEngine.applyDdosDamage(40, 'BotnetRaidTest');

      window.hardwareEngine.saveRig({ healthPct: 100 });
      window.topTenMechanics.state.raidMode = 'raid0';
      const hitRaid0 = window.hardwareEngine.applyDdosDamage(40, 'BotnetRaidTest');

      return {
        shadowCount,
        bannerVisible,
        recoveredSubnet,
        afterShredCount,
        dmgRaid1: hitRaid1.effectiveDmg,
        dmgRaid0: hitRaid0.effectiveDmg,
        strikes: window.integrityGuard ? window.integrityGuard.cheatStrikes : 0
      };
    });
    assert(pvpRes.shadowCount === 1 && pvpRes.bannerVisible && pvpRes.recoveredSubnet === '203.98.***.**', 'Sombra Magnética PvP falhou');
    assert(pvpRes.afterShredCount === 0, 'Shred 7-Passos não limpou sombra ativa');
    assert(pvpRes.dmgRaid1 === 24 && pvpRes.dmgRaid0 === 50 && pvpRes.strikes === 0, `Mitigação RAID incorreta: R1=${pvpRes.dmgRaid1}, R0=${pvpRes.dmgRaid0}`);
    console.log(`✅ [5/5] Unificação PvP (Sombra Magnética ${pvpRes.recoveredSubnet}, Shred 7-Passos, RAID-1=${pvpRes.dmgRaid1}% vs RAID-0=${pvpRes.dmgRaid0}% dano, 0 strikes) validada!`);

    console.log('🏆 TODAS AS 5 NOVAS MECÂNICAS PASSARAM 100% NOS TESTES E2E!');
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
