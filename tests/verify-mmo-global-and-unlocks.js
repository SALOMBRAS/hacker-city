/**
 * Suíte Automatizada E2E — Validação Completa dos 2 Pilares:
 *   1. Desbloqueio Progressivo em 4 Degraus (Fim do Choque das 27 Telas nos Primeiros 10 Minutos)
 *   2. Mercado Global MMO Real Entre Jogadores Simultâneos (Operador_Alpha + Operador_Bravo + Operador_Charlie)
 *
 * Execução:
 *   NODE_PATH=/home/littlecoffee/Documentos/DEV/pague-on-old/node_modules node tests/verify-mmo-global-and-unlocks.js
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

function assert(cond, msg) {
  if (!cond) {
    throw new Error('ASSERTION FAILED: ' + msg);
  }
}

const IMG_DIR = path.resolve(__dirname, '../../reports/mmo-global-e-desbloqueio-implementados/images');

(async () => {
  fs.mkdirSync(IMG_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,860']
  });

  try {
    // =========================================================================
    // PARTE 1 — RECRUTA NOVATO (DEGRAU 1 -> 1º SUJO -> EVER_UNLOCKED -> MODO VETERANO)
    // =========================================================================
    const pageRecruit = await browser.newPage();
    await pageRecruit.setViewport({ width: 1366, height: 860 });
    pageRecruit.on('dialog', async (d) => { try { await d.accept(); } catch (e) {} });

    await pageRecruit.goto('http://localhost:8080/hacker-city-web/index.html', { waitUntil: 'networkidle2' });
    const recruitStep1 = await pageRecruit.evaluate(async () => {
      localStorage.clear();
      sessionStorage.clear();
      window.DISABLE_AUTO_TOUR = true;
      localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
      await window.enterInstantOperatorMode('Recruta_Zero');
      if (window.spotlightTour && typeof window.spotlightTour.finishTour === 'function') {
        window.spotlightTour.finishTour(true);
      }
      window.progressiveUnlockEngine.syncSidebarDom();
      window.navTo('winHome');

      const visibleNavButtons = Array.from(document.querySelectorAll('.nav-item[data-win]'))
        .filter((b) => b.style.display !== 'none')
        .map((b) => b.getAttribute('data-win'));
      const nextUnlockPills = document.querySelectorAll('.hc-next-unlock-pill').length;

      // Testa Escudo Iniciante (< 200 REP) contra ataque surpresa externo na porta 22
      const shieldRes = window.connManagerEngine.registerInboundSession({
        id: 'ext_pvp_01',
        originIp: '45.90.12.8',
        originAlias: 'Shadow_Ganker',
        protocol: 'SSH',
        action: 'Tentando quebrar root',
        progressPct: 20,
        startedAt: 'agora'
      });

      return {
        stepNum: window.progressiveUnlockEngine.getCurrentStepNumber(),
        visibleNavCount: visibleNavButtons.length,
        launderingLocked: !window.progressiveUnlockEngine.isUnlocked('winLaundering'),
        opsHubLocked: !window.progressiveUnlockEngine.isUnlocked('winOpsHub'),
        labLocked: !window.progressiveUnlockEngine.isUnlocked('winVirusLab'),
        nextUnlockPills,
        shieldBlockedAttack: !!(shieldRes && shieldRes.blockedByNewbieShield),
        inboundCount: window.connManagerEngine.inboundSessions.length
      };
    });

    assert(recruitStep1.stepNum === 1, 'Recruit must start at Step 1');
    assert(recruitStep1.launderingLocked && recruitStep1.opsHubLocked && recruitStep1.labLocked, 'Advanced screens must start hidden for Recruit');
    assert(recruitStep1.visibleNavCount <= 14 && recruitStep1.nextUnlockPills >= 1, 'Sidebar must show compact Recruit menu + Next Unlock preview pills');
    assert(recruitStep1.shieldBlockedAttack && recruitStep1.inboundCount === 0, 'Newbie PvP Shield (< 200 REP) must block external port-22 gank');

    await new Promise((r) => setTimeout(r, 250));
    await pageRecruit.screenshot({ path: path.join(IMG_DIR, '01-recruta-menu-enxuto-e-guia-3-passos.png') });

    // Ganha o 1º Dinheiro Sujo -> destrava winLaundering no mesmo milissegundo com selo NOVO!
    const recruitStep2 = await pageRecruit.evaluate(() => {
      window.nineSystemsEngine.addDirtyMoney(850, '1º Saque Invasão');
      window.progressiveUnlockEngine.syncSidebarDom();
      document.querySelectorAll('details.nav-topic').forEach((d) => {
        d.open = d.textContent.includes('Dinheiro');
      });
      const launderBtn = document.querySelector('.nav-item[data-win="winLaundering"]');
      const hasNewBadge = !!(launderBtn && launderBtn.querySelector('.hc-nav-new-pill'));
      return {
        launderingUnlockedNow: window.progressiveUnlockEngine.isUnlocked('winLaundering'),
        launderBtnVisible: !!(launderBtn && launderBtn.style.display !== 'none'),
        hasNewBadge
      };
    });
    assert(recruitStep2.launderingUnlockedNow && recruitStep2.launderBtnVisible && recruitStep2.hasNewBadge, '1st Dirty Money must unlock winLaundering immediately with NOVO badge');

    await new Promise((r) => setTimeout(r, 250));
    await pageRecruit.screenshot({ path: path.join(IMG_DIR, '02-desbloqueio-imediato-lavagem-selo-novo.png') });

    // Testa Trava Monotônica everUnlocked (sobe p/ 260 REP, destrava Bolsa, perde REP p/ 80 -> NUNCA tranca de volta!) + Modo Veterano
    const recruitEverAndVeteran = await pageRecruit.evaluate(() => {
      window.integrityGuard.runAuthorized(() => {
        window.currentProfile.reputation = 260;
      });
      window.progressiveUnlockEngine.evaluateUnlocks(false);
      const unlockedAt260 = window.progressiveUnlockEngine.isUnlocked('winOpsHub');

      // Simula queda severa de REP p/ 80 (-35 REP calote etc.)
      window.integrityGuard.runAuthorized(() => {
        window.currentProfile.reputation = 80;
      });
      const stillUnlockedAt80 = window.progressiveUnlockEngine.isUnlocked('winOpsHub');

      // Abre Minha Conta e liga "Mostrar Todo o Menu (Modo Veterano)"
      window.navTo('winProfile');
      window.progressiveUnlockEngine.toggleVeteranShowAll(true);
      const labVisibleInVeteran = window.progressiveUnlockEngine.isUnlocked('winVirusLab');
      const allVisibleCount = Array.from(document.querySelectorAll('.nav-item[data-win]'))
        .filter((b) => b.style.display !== 'none').length;

      return { unlockedAt260, stillUnlockedAt80, labVisibleInVeteran, allVisibleCount };
    });
    assert(recruitEverAndVeteran.unlockedAt260 && recruitEverAndVeteran.stillUnlockedAt80, 'everUnlocked must NEVER relock screens if REP drops later');
    assert(recruitEverAndVeteran.labVisibleInVeteran && recruitEverAndVeteran.allVisibleCount >= 26, 'Veteran Mode must display all sidebar screens');

    await new Promise((r) => setTimeout(r, 250));
    await pageRecruit.screenshot({ path: path.join(IMG_DIR, '03-perfil-modo-veterano-mostrar-tudo.png') });
    await pageRecruit.close();

    // =========================================================================
    // PARTE 2 — MERCADO GLOBAL MMO REAL (2 ABAS SIMULTÂNEAS: ALPHA & BRAVO)
    // =========================================================================
    const pageA = await browser.newPage();
    const pageB = await browser.newPage();
    await pageA.setViewport({ width: 1366, height: 860 });
    await pageB.setViewport({ width: 1366, height: 860 });
    pageA.on('dialog', async (d) => { try { await d.accept(); } catch (e) {} });
    pageB.on('dialog', async (d) => { try { await d.accept(); } catch (e) {} });

    await pageA.goto('http://localhost:8080/hacker-city-web/index.html', { waitUntil: 'networkidle2' });
    await pageA.evaluate(async () => {
      localStorage.removeItem('HC_GLOBAL_SHARED_MARKET_V1');
      sessionStorage.clear();
      window.DISABLE_AUTO_TOUR = true;
      localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
      await window.enterInstantOperatorMode('Operador_Alpha');
      if (window.spotlightTour && typeof window.spotlightTour.finishTour === 'function') window.spotlightTour.finishTour(true);
      window.integrityGuard.runAuthorized(() => {
        window.currentWallet.balance = 500000;
        window.currentProfile.reputation = 650;
      });
      window.progressiveUnlockEngine.evaluateUnlocks(true);
      window.progressiveUnlockEngine.syncSidebarDom();
    });

    await pageB.goto('http://localhost:8080/hacker-city-web/index.html', { waitUntil: 'networkidle2' });
    await pageB.evaluate(async () => {
      sessionStorage.clear();
      window.DISABLE_AUTO_TOUR = true;
      localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
      await window.enterInstantOperatorMode('Operador_Bravo');
      if (window.spotlightTour && typeof window.spotlightTour.finishTour === 'function') window.spotlightTour.finishTour(true);
      window.integrityGuard.runAuthorized(() => {
        window.currentWallet.balance = 120000;
        window.currentProfile.reputation = 620;
      });
      window.nineSystemsEngine.addDirtyMoney(40000, 'Saques Bravo');
      window.progressiveUnlockEngine.evaluateUnlocks(true);
      window.progressiveUnlockEngine.syncSidebarDom();
    });

    // --- VITRINE #1: LAVAGEM GLOBAL 5/1H + COMISSÃO VIA INBOX + TRAVA 3x/DIA POR DUPLA ---
    const launderAlphaSetup = await pageA.evaluate(() => {
      window.nineSystemsEngine.buyOrUpgradeOwnCompany(1, 'Alpha Global Clearing S.A.');
      window.nineSystemsEngine.buyOrUpgradeOwnCompany(2, 'Alpha Global Clearing S.A.');
      window.nineSystemsEngine.buyOrUpgradeOwnCompany(3, 'Alpha Global Clearing S.A.');
      const ad = window.nineSystemsEngine.purchaseCompanyAdSlot(18);
      return {
        adOk: ad.success,
        alphaCoId: window.nineSystemsEngine.state.myCompany.id,
        alphaCleanBefore: window.currentWallet.balance
      };
    });
    assert(launderAlphaSetup.adOk, 'Alpha must publish company to global 5/1h showcase');

    const launderBravoWash = await pageB.evaluate((alphaCoId) => {
      window.nineSystemsEngine.activeLaunderingTab = 'vitrine';
      window.navTo('winLaundering');
      window.nineSystemsEngine.renderLaunderingHub();
      const five = window.nineSystemsEngine.getCurrentHourFiveCompanies();
      const seesAlphaCo = five.some((c) => c.id === alphaCoId && c.ownerTag === 'Operador_Alpha' && !c.isBot);

      // Lava 1º lote de $ 5.000 (taxa 18% = $ 900 p/ Alpha via walletInbox!)
      const w1 = window.nineSystemsEngine.startLaunderingBatch(alphaCoId, 5000);
      // Conclui o lote 1 p/ liberar a fila individual e testar 2º, 3º e bloqueio no 4º lote no mesmo dia!
      window.nineSystemsEngine.state.washingJobs.forEach((j) => { j.completesAt = Date.now() - 1000; });
      window.nineSystemsEngine.processCompletedWashingJobs();

      const w2 = window.nineSystemsEngine.startLaunderingBatch(alphaCoId, 2000);
      window.nineSystemsEngine.state.washingJobs.forEach((j) => { j.completesAt = Date.now() - 1000; });
      window.nineSystemsEngine.processCompletedWashingJobs();

      const w3 = window.nineSystemsEngine.startLaunderingBatch(alphaCoId, 2000);
      window.nineSystemsEngine.state.washingJobs.forEach((j) => { j.completesAt = Date.now() - 1000; });
      window.nineSystemsEngine.processCompletedWashingJobs();

      // 4ª tentativa no mesmo dia entre Bravo e Alpha -> DEVE BLOQUEAR!
      const w4Blocked = window.nineSystemsEngine.startLaunderingBatch(alphaCoId, 2000);
      window.nineSystemsEngine.renderLaunderingHub();

      return {
        seesAlphaCo,
        w1Ok: w1.success,
        w2Ok: w2.success,
        w3Ok: w3.success,
        w4BlockedCode: w4Blocked.code
      };
    }, launderAlphaSetup.alphaCoId);

    assert(launderBravoWash.seesAlphaCo, 'Bravo must see Operador_Alpha company in the 5/1h showcase');
    assert(launderBravoWash.w1Ok && launderBravoWash.w2Ok && launderBravoWash.w3Ok, 'First 3 washes between pair must succeed');
    assert(launderBravoWash.w4BlockedCode === 'MAX_3_PAIR_WASHES_PER_DAY', '4th wash on same day between same pair must be blocked');

    await new Promise((r) => setTimeout(r, 300));
    await pageB.screenshot({ path: path.join(IMG_DIR, '04-vitrine-global-bravo-ve-empresa-alpha.png') });

    // Verifica na aba de Alpha se a comissão ($ 900 + $ 360 + $ 360 = $ 1.620 Limpos) caiu via walletInbox sem corromper o save!
    const alphaInboxClaim = await pageA.evaluate((cleanBefore) => {
      window.mmoGlobalMarket.claimMyInboxPayouts();
      const delta = +(window.currentWallet.balance - cleanBefore).toFixed(2);
      return { delta };
    }, launderAlphaSetup.alphaCleanBefore);
    assert(alphaInboxClaim.delta === 1620, `Alpha must receive exact $1,620 Clean commission via walletInbox (got ${alphaInboxClaim.delta})`);

    // --- VITRINE #2: BOLSA CYBERSTOCK UNIFICADA + CIRCUIT BREAKER DE 10 MIN ---
    await pageB.evaluate(() => {
      window.navTo('winOpsHub');
      window.ecosystemHub.switchTab('stocks');
      window.ecosystemHub.openShortPosition('FARO', 1500);
    });

    const stockAttacks = await pageA.evaluate(() => {
      // 1º ataque em FARO -> queda total
      const hit1 = window.mmoGlobalMarket.applyGlobalStockImpact('FARO', -0.16, 'ddos_1');
      // 2º ataque em FARO dentro de 10m -> amortecido em 50% (damped50 === true)!
      const hit2 = window.mmoGlobalMarket.applyGlobalStockImpact('FARO', -0.16, 'ddos_2');
      // 3º ataque em FARO dentro de 10m -> DISPARA CIRCUIT BREAKER DE 10 MIN!
      const hit3 = window.mmoGlobalMarket.applyGlobalStockImpact('FARO', -0.16, 'ddos_3');
      return {
        hit1Ok: hit1.ok,
        hit2Damped: hit2.ok && hit2.damped50 === true,
        hit3BreakerCode: hit3.code,
        faroPriceAlpha: window.mmoGlobalMarket.getGlobalStocks().FARO.price
      };
    });
    assert(stockAttacks.hit1Ok && stockAttacks.hit2Damped, '2nd stock attack in 10m must be damped by 50%');
    assert(stockAttacks.hit3BreakerCode === 'CIRCUIT_BREAKER_TRIGGERED', '3rd stock attack in 10m must trigger 10m Circuit Breaker');
    await new Promise((r) => setTimeout(r, 80));

    const bravoStockSync = await pageB.evaluate(() => {
      window.ecosystemHub.syncStocksFromGlobalMarket(true);
      window.ecosystemHub.renderUI();
      const faro = window.ecosystemHub.state.stocks.FARO;
      const closeRes = window.ecosystemHub.closeShortPosition('FARO');
      return {
        faroPriceBravo: faro.price,
        breakerActiveOnBravo: faro.circuitBreakerUntil > Date.now(),
        shortProfit: closeRes.profit
      };
    });
    assert(bravoStockSync.faroPriceBravo === stockAttacks.faroPriceAlpha, `Bravo (${bravoStockSync.faroPriceBravo}) and Alpha (${stockAttacks.faroPriceAlpha}) must see the exact same FARO stock price`);
    assert(bravoStockSync.breakerActiveOnBravo && bravoStockSync.shortProfit > 0, 'Bravo must see Circuit Breaker badge and profit cleanly on Short');

    await new Promise((r) => setTimeout(r, 250));
    await pageB.screenshot({ path: path.join(IMG_DIR, '05-bolsa-global-circuit-breaker-10m.png') });

    // --- VITRINE #3: LEILÃO GLOBAL 2H (ESTORNO AUTOMÁTICO + ANTI-SNIPING +30S) ---
    const auctionAlpha = await pageA.evaluate(() => {
      const lot0 = window.topTenMechanics.getCurrentAuctionLot();
      // Simula faltando 20 segundos (< 30s) para testar Anti-Sniping!
      window.mmoGlobalMarket.setAuctionExpiresAtForCurrentBucket(lot0.bucket, Date.now() + 20000);
      const balBefore = window.currentWallet.balance;
      const bidRes = window.topTenMechanics.placeCompetitiveGlobalBid(lot0.currentMinBid);
      const selfRebid = window.topTenMechanics.placeCompetitiveGlobalBid(lot0.currentMinBid + 3000);
      return {
        balBefore,
        alphaBidAmt: bidRes.bid,
        bidOk: bidRes.success,
        snipe1: bidRes.snipeExtended,
        selfBlockedCode: selfRebid.code
      };
    });
    assert(auctionAlpha.bidOk && auctionAlpha.snipe1, 'Alpha bid in last 20s must succeed and trigger +30s Anti-Sniping');
    assert(auctionAlpha.selfBlockedCode === 'SELF_OUTBID_BLOCKED', 'Self-outbidding must be blocked');
    await new Promise((r) => setTimeout(r, 80));

    const auctionBravo = await pageB.evaluate(() => {
      const lot = window.topTenMechanics.getCurrentAuctionLot();
      // Ajusta p/ 18s restantes para testar 2ª prorrogação Anti-Sniping quando Bravo cobrir Alpha!
      window.mmoGlobalMarket.setAuctionExpiresAtForCurrentBucket(lot.bucket, Date.now() + 18000);
      const outbid = window.topTenMechanics.placeCompetitiveGlobalBid(lot.currentMinBid);
      window.navTo('winOpsHub');
      window.ecosystemHub.switchTab('elite');
      return {
        sawAlphaLeader: lot.leaderTag === 'Operador_Alpha',
        outbidOk: outbid.success,
        refundedTag: outbid.refundedPrevTag,
        refundedAmt: outbid.refundedAmount,
        snipe2: outbid.snipeExtended
      };
    });
    assert(auctionBravo.sawAlphaLeader && auctionBravo.outbidOk, 'Bravo must see Alpha leading and outbid him');
    assert(auctionBravo.refundedTag === 'Operador_Alpha' && auctionBravo.refundedAmt === auctionAlpha.alphaBidAmt && auctionBravo.snipe2, 'Outbidding Alpha must trigger instant full refund + Anti-Sniping');
    await new Promise((r) => setTimeout(r, 80));

    const alphaAfterRefund = await pageA.evaluate((balBefore) => {
      window.mmoGlobalMarket.claimMyInboxPayouts();
      return window.currentWallet.balance === balBefore;
    }, auctionAlpha.balBefore);
    assert(alphaAfterRefund, 'Alpha wallet balance must be 100% restored via walletInbox after being outbid');

    await new Promise((r) => setTimeout(r, 250));
    await pageB.screenshot({ path: path.join(IMG_DIR, '06-leilao-global-anti-sniping-e-estorno.png') });

    // --- VITRINE #4: ALUGUEL ATÔMICO DE VÍRUS P2P (TRAVA ALREADY_SOLD SEM COBRAR 2º CLIQUE) ---
    const p2pListed = await pageA.evaluate(() => {
      window.virusLabEngine.ensureLoaded();
      window.virusLabEngine.state.creations.unshift({
        id: 'strain_mmo_alpha_01',
        strainName: 'Alpha-ZeroDay-X',
        family: 'vwarez',
        versionInt: 78,
        fitGrade: 'S+'
      });
      window.virusLabEngine.save();
      const balBefore = window.currentWallet.balance;
      const res = window.nineSystemsEngine.listMyStrainOnP2p('strain_mmo_alpha_01', 48, 2400);
      return { ok: res.success, offerId: res.offer.offerId, netExpected: res.netSeller, balBefore };
    });
    assert(p2pListed.ok, 'Alpha must list virus license on global P2P showcase');
    await new Promise((r) => setTimeout(r, 80));

    const p2pBravoBuy = await pageB.evaluate((offerId) => {
      const buy1 = window.nineSystemsEngine.buyP2pLicense(offerId);
      // Simula um 3º jogador (Operador_Charlie) clicando 1ms depois no mesmo anúncio -> DEVE RETORNAR ALREADY_SOLD SEM COBRAR!
      const raceAttempt = window.mmoGlobalMarket.buyGlobalP2pLicenseAtomic({
        offerId,
        buyerId: 'charlie_uid_99',
        buyerTag: 'Operador_Charlie',
        buyerCleanBalance: 50000
      });
      return { buy1Ok: buy1.success, raceCode: raceAttempt.code };
    }, p2pListed.offerId);
    assert(p2pBravoBuy.buy1Ok && p2pBravoBuy.raceCode === 'ALREADY_SOLD', 'P2P rental must lock atomically and return ALREADY_SOLD to 2nd buyer');
    await new Promise((r) => setTimeout(r, 80));

    const alphaGotP2pSale = await pageA.evaluate(({ balBefore, netExpected }) => {
      window.mmoGlobalMarket.claimMyInboxPayouts();
      return Math.round(window.currentWallet.balance - balBefore) === netExpected;
    }, p2pListed);
    assert(alphaGotP2pSale, 'Alpha must receive P2P virus rental payout via walletInbox');

    // --- VITRINE #5: FÓRUM ESCROW GLOBAL (CANCELAR ABERTO PERDE 15% + RESERVA EXCLUSIVA 30M) ---
    const forumAlpha = await pageA.evaluate(() => {
      const balStart = window.currentWallet.balance;
      // Contrato #1 ($ 3.000 + $ 450 taxa = $ 3.450) -> cancelar enquanto aberto devolve $ 3.000 (queima $ 450)!
      const c1 = window.topTenMechanics.createMercenaryEscrowContract('58.40.12.9', 'crack_root', 3000);
      const cancel1 = window.topTenMechanics.cancelMercenaryEscrowContract(c1.contract.id);
      const netLossAfterCancel = Math.round(balStart - window.currentWallet.balance);

      // Contrato #2 ($ 4.000) p/ Bravo reservar por 30 min!
      const c2 = window.topTenMechanics.createMercenaryEscrowContract('203.17.88.40', 'disable_cctv', 4000);
      return {
        cancelOk: cancel1.success,
        netLossAfterCancel, // deve ser exatos $ 450 (15% queimados)
        c2Id: c2.contract.id
      };
    });
    assert(forumAlpha.cancelOk && forumAlpha.netLossAfterCancel === 450, 'Cancelling open contract must refund reward and burn the 15% fee ($450)');
    await new Promise((r) => setTimeout(r, 80));

    const forumBravoReserve = await pageB.evaluate((c2Id) => {
      const acc = window.topTenMechanics.acceptMercenaryContract(c2Id);
      // 3º jogador tenta roubar a reserva durante os 30m -> RESERVED_BY_OTHER!
      const charlieSteal = window.mmoGlobalMarket.reserveGlobalEscrow30m({
        contractId: c2Id,
        hunterId: 'charlie_uid_99',
        hunterTag: 'Operador_Charlie'
      });
      window.navTo('winForum');
      window.darknetSocialEngine.renderForumUI();
      return { accOk: acc.success, charlieCode: charlieSteal.code };
    }, forumAlpha.c2Id);
    assert(forumBravoReserve.accOk && forumBravoReserve.charlieCode === 'RESERVED_BY_OTHER', '30m Forum reservation must block 3rd party sniping');
    await new Promise((r) => setTimeout(r, 80));

    const alphaCancelWhileReserved = await pageA.evaluate((c2Id) => {
      const res = window.topTenMechanics.cancelMercenaryEscrowContract(c2Id);
      return res.code;
    }, forumAlpha.c2Id);
    assert(alphaCancelWhileReserved === 'LOCKED_IN_EXECUTION', 'Creator cannot cancel contract while reserved in 30m execution');

    await new Promise((r) => setTimeout(r, 250));
    await pageB.screenshot({ path: path.join(IMG_DIR, '07-forum-global-reserva-30m-e-cancelar.png') });

    // --- INTEGRITY GUARD ZERO STRIKES ---
    const strikesA = await pageA.evaluate(() => (window.integrityGuard ? Number(window.integrityGuard.cheatStrikes || 0) : 0));
    const strikesB = await pageB.evaluate(() => (window.integrityGuard ? Number(window.integrityGuard.cheatStrikes || 0) : 0));
    assert(strikesA === 0 && strikesB === 0, `IntegrityGuard must have 0 strikes (A=${strikesA}, B=${strikesB})`);

    console.log('ALL_MMO_GLOBAL_AND_PROGRESSIVE_UNLOCK_E2E_PASSED', JSON.stringify({
      recruitStep1,
      recruitStep2,
      recruitEverAndVeteran,
      launderBravoWash,
      alphaInboxCommissionUsd: alphaInboxClaim.delta,
      stockAttacks,
      bravoStockSync,
      auctionBravo,
      p2pBravoBuy,
      forumAlpha,
      forumBravoReserve,
      strikesA,
      strikesB
    }, null, 2));
  } finally {
    await browser.close();
  }
})();
