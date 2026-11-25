/**
 * ============================================================================
 * SUÍTE E2E — CROSS-SAVE REAL PC ↔ CELULAR & PWA NATIVO (PRs #114 a #122)
 * Valida:
 * 1. Sincronia PC -> Celular em contextos isolados (Dinheiro Limpo, Sujo,
 *    Estágio 2, Escudo Quebrado, Check-in Diário 2.0 e Metas).
 * 2. Trava Anti-Duplicação mesmo quando o relógio do Celular tem savedAt maior
 *    (impede resgatar Dia 1 no PC e resgatar de novo no Celular).
 * 3. PWA Nativo: /sw.js ativo, manifest.json com PNGs 192x192 e 512x512,
 *    alertas operacionais e padrões de vibração tátil (intrusion/launder/task).
 * ============================================================================
 */
const puppeteer = require('puppeteer');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/hacker-city-web/index.html';

function assert(cond, msg) {
  if (!cond) throw new Error('FALHA E2E CROSS-SAVE/PWA: ' + msg);
}

(async () => {
  console.log('🚀 Iniciando Suíte E2E Cross-Save PC ↔ Celular & PWA Nativo...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

  try {
    // 1. CONTEXTO A — PC DESKTOP (1366x860)
    const ctxPc = await browser.createBrowserContext();
    const pcPage = await ctxPc.newPage();
    await pcPage.evaluateOnNewDocument(() => {
      window.DISABLE_AUTO_TOUR = true;
      try { localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1'); } catch (e) {}
    });
    await pcPage.setViewport({ width: 1366, height: 860, isMobile: false });
    await pcPage.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    const pcRes = await pcPage.evaluate(async () => {
      await window.enterInstantOperatorMode('CrossSaveHero');
      // Resgata Dia 1 no PC (+$350 -> $850), ganha $600 sujos (Estágio 2) e quebra escudo PvP
      const claim1 = window.dailyCheckinV2.claimTodaySupplyV2();
      window.nineSystemsEngine.addDirtyMoney(600, 'Invasão PC');
      if (window.progressiveUnlockEngine && window.progressiveUnlockEngine.state) {
        window.progressiveUnlockEngine.state.shieldBrokenByPvp = true;
        window.progressiveUnlockEngine.save(true);
      }
      const st = window.dailyCheckinV2.getState();
      const firstGoal = window.dailyCheckinV2.getActiveDailyGoals(st)[0];
      if (firstGoal) {
        window.operatorRetentionEngine.recordDailyGoalProgress(firstGoal.id);
        window.operatorRetentionEngine.claimDailyGoal(firstGoal.id);
      }
      const cloudSnap = window.onlineEngine.collectMasterSnapshot();
      return {
        claimOk: !!(claim1 && claim1.success),
        pcBalance: window.currentWallet.balance,
        pcDirty: window.nineSystemsEngine.getDirtyBalance(),
        pcStage: window.progressiveUnlockEngine.getCurrentStepNumber(),
        firstGoalId: firstGoal ? firstGoal.id : null,
        cloudSnap
      };
    });

    assert(pcRes.claimOk && pcRes.pcDirty === 600 && pcRes.pcStage >= 2, 'Progresso inicial no PC falhou');
    console.log(`✅ [1/4] PC Desktop gerou progresso (Saldo $${pcRes.pcBalance} · Sujo $${pcRes.pcDirty} · Estágio ${pcRes.pcStage})`);

    // 2. CONTEXTO B — CELULAR ISOLADO (375x667, localStorage limpo!)
    const ctxMobile = await browser.createBrowserContext();
    const mobPage = await ctxMobile.newPage();
    await mobPage.evaluateOnNewDocument(() => {
      window.DISABLE_AUTO_TOUR = true;
      try { localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1'); } catch (e) {}
    });
    await mobPage.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await mobPage.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    const mobSync = await mobPage.evaluate(async (pcData) => {
      await window.enterInstantOperatorMode('CrossSaveHero');

      // Simula até o caso extremo onde o celular tem um savedAt local 5s mais novo,
      // mas AINDA NÃO tinha o resgate do Dia 1 feito no PC!
      const staleMobileLocal = window.onlineEngine.collectMasterSnapshot();
      staleMobileLocal.savedAt = pcData.cloudSnap.savedAt + 5000;

      const merged = window.crossSaveEngine.mergeSnapshotsAntiDupe(pcData.cloudSnap, staleMobileLocal);
      // Também testa com o snapshot da nuvem mais recente (fluxo padrão ao abrir celular)
      const standardMerged = window.crossSaveEngine.mergeSnapshotsAntiDupe(staleMobileLocal, {
        ...pcData.cloudSnap,
        savedAt: staleMobileLocal.savedAt + 1000
      });

      window.onlineEngine.applyMasterSnapshot(standardMerged, pcData.pcBalance);

      // Tenta resgatar o Dia 1 e a mesma Meta Diária UMA SEGUNDA VEZ no celular (deve bloquear!)
      const secondSupplyTry = window.dailyCheckinV2.claimTodaySupplyV2();
      const secondGoalTry = pcData.firstGoalId
        ? window.operatorRetentionEngine.claimDailyGoal(pcData.firstGoalId)
        : { success: false };

      // Verifica também que mesmo no caso de corrida (merged com savedAt local maior), o resgate do PC não sumiu!
      const raceProtectedClaim = merged.operatorRetentionState && merged.operatorRetentionState.lastSupplyClaimDay;
      const raceProtectedShield = merged.progressiveUnlockState && merged.progressiveUnlockState.shieldBrokenByPvp;

      window.navTo('winProfile');
      window.crossSaveEngine.renderProfileCrossSaveCard();
      const syncBtn = document.getElementById('btnManualCrossSaveSync');

      return {
        mobileBalance: window.currentWallet.balance,
        mobileDirty: window.nineSystemsEngine.getDirtyBalance(),
        mobileStage: window.progressiveUnlockEngine.getCurrentStepNumber(),
        shieldStaysBroken: !window.progressiveUnlockEngine.isNewbiePvpShieldActive(),
        secondSupplyBlocked: secondSupplyTry && secondSupplyTry.success === false && secondSupplyTry.code === 'ALREADY_CLAIMED_TODAY',
        secondGoalBlocked: secondGoalTry && secondGoalTry.success === false,
        raceProtectedClaim: !!raceProtectedClaim,
        raceProtectedShield: !!raceProtectedShield,
        hasSyncBtn: !!syncBtn,
        noOverflow375: document.documentElement.scrollWidth <= 376,
        cheatStrikes: window.integrityGuard ? window.integrityGuard.cheatStrikes : 0
      };
    }, pcRes);

    assert(mobSync.mobileBalance === pcRes.pcBalance, 'Saldo Limpo divergiu no Celular');
    assert(mobSync.mobileDirty === 600 && mobSync.mobileStage >= 2, 'Dinheiro Sujo ou Estágio não chegaram no Celular');
    assert(mobSync.shieldStaysBroken && mobSync.raceProtectedShield, 'Escudo quebrado no PC reativou indevidamente no Celular');
    assert(mobSync.secondSupplyBlocked && mobSync.secondGoalBlocked && mobSync.raceProtectedClaim, 'Trava anti-duplicação PC <-> Celular falhou');
    assert(mobSync.hasSyncBtn && mobSync.noOverflow375 && mobSync.cheatStrikes === 0, 'Card Cross-Save ou overflow/strikes falharam');
    console.log('✅ [2/4] Celular recebeu 100% do progresso do PC e BLOQUEOU duplo resgate de Check-in/Meta (0 strikes)!');

    // 3. VALIDAR SERVICE WORKER /sw.js + MANIFEST PNG WebAPK
    const pwaAudit = await mobPage.evaluate(async () => {
      const mfRes = await fetch('manifest.json');
      const mf = await mfRes.json();
      const png192 = (mf.icons || []).some((i) => i.sizes === '192x192' && i.type === 'image/png');
      const png512 = (mf.icons || []).some((i) => i.sizes === '512x512' && i.type === 'image/png');
      const iconFetch = await fetch('src/assets/icon-512.png');

      let swActive = false;
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        swActive = !!(reg && reg.active && reg.active.state === 'activated');
      }
      return { png192, png512, iconOk: iconFetch.ok, swActive };
    });

    assert(pwaAudit.png192 && pwaAudit.png512 && pwaAudit.iconOk, 'Ícones PNG 192/512 do WebAPK ausentes');
    assert(pwaAudit.swActive, 'Service Worker /sw.js não ativou');
    console.log('✅ [3/4] PWA Nativo validado (/sw.js ativado + ícones PNG 192x192 e 512x512 HTTP 200)!');

    // 4. VALIDAR ALERTAS OPERACIONAIS & PADRÕES DE VIBRAÇÃO TÁTIL
    const alertsAudit = await mobPage.evaluate(() => {
      const a = window.pwaAlertsEngine;
      const r1 = a.triggerAlert('intrusion', { title: 'Intrusão', body: 'Teste', cooldownMs: 0 });
      const p1 = a.lastVibrationPattern && a.lastVibrationPattern.pattern;
      const r2 = a.triggerAlert('launderDone', { title: 'Lavagem', body: 'Teste', cooldownMs: 0 });
      const p2 = a.lastVibrationPattern && a.lastVibrationPattern.pattern;
      const r3 = a.sendTestAlert();
      const hasNotifBtn = !!document.getElementById('btnTogglePwaNotifications');
      const hasHapBtn = !!document.getElementById('btnTogglePwaHaptics');
      return {
        sentAll: !!(r1.sent && r2.sent && r3.sent),
        intrusionLen: Array.isArray(p1) ? p1.length : 0,
        launderLen: Array.isArray(p2) ? p2.length : 0,
        uiReady: hasNotifBtn && hasHapBtn,
        cheatStrikes: window.integrityGuard ? window.integrityGuard.cheatStrikes : 0
      };
    });

    assert(alertsAudit.sentAll && alertsAudit.intrusionLen === 5 && alertsAudit.launderLen === 3 && alertsAudit.uiReady, 'Motor de Alertas/Vibração falhou');
    assert(alertsAudit.cheatStrikes === 0, 'IntegrityGuard acusou violação');
    console.log('✅ [4/4] Central de Alertas Nativos & Vibração Tátil Mobile validada em Minha Conta (0 strikes)!');

    await ctxPc.close();
    await ctxMobile.close();
    console.log('🏆 CROSS-SAVE PC ↔ CELULAR & PWA NATIVO 100% APROVADOS!');
  } finally {
    await browser.close();
  }
})();
