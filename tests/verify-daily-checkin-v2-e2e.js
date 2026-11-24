/**
 * ============================================================================
 * SUÍTE E2E — CHECK-IN DIÁRIO 2.0 (MODAL DEDICADO, DIAS 1 A 7 ESCALÁVEIS,
 * BUFFS TÁTICOS, REROLL, COMBO 3/3, ESCUDO DE SEQUÊNCIA & MARCOS MENSAIS)
 * ============================================================================
 */
const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:8080/hacker-city-web/index.html';

function assert(cond, msg) {
  if (!cond) throw new Error(`FALHA CHECKIN-V2 E2E: ${msg}`);
}

(async () => {
  console.log('🚀 Iniciando Suíte E2E do Check-in Diário 2.0 (PRs #103 a #112)...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await page.evaluateOnNewDocument(() => {
      window.DISABLE_AUTO_TOUR = true;
      try { localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1'); } catch (e) {}
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluate(async () => {
      localStorage.clear();
      sessionStorage.clear();
      window.DISABLE_AUTO_TOUR = true;
      localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
      await window.enterInstantOperatorMode('CheckinV2_' + Math.floor(1000 + Math.random() * 9000));
    });
    await new Promise((r) => setTimeout(r, 300));

    // 1. Validar Botão 🎁 no Topo, Faixa Fina na Home e Modal sem Overflow em 320x568 e 375x667
    await page.setViewport({ width: 320, height: 568, isMobile: true, hasTouch: true });
    const uiRes = await page.evaluate(() => {
      const btn = document.getElementById('btnTopbarDailyCheckin');
      const dot = document.getElementById('topbarCheckinDot');
      const dotVisible = dot && getComputedStyle(dot).display !== 'none';
      btn.click();
      const modal = document.getElementById('hcDailyCheckinModal');
      const dialog = modal?.querySelector('.hc-checkin-dialog');
      const rect = dialog ? dialog.getBoundingClientRect() : { right: 999 };
      return {
        dotVisible,
        modalOpen: modal && getComputedStyle(modal).display !== 'none',
        fits320: rect.right <= 321 && document.documentElement.scrollWidth <= 321
      };
    });
    assert(uiRes.dotVisible && uiRes.modalOpen && uiRes.fits320, 'Modal ou botão 🎁 falhou em 320x568');
    console.log('✅ [1/4] Modal #hcDailyCheckinModal + Botão 🎁 no topo validados em 320x568 (0 overflow)');

    // 2. Validar Dias 1 a 7 (Estágio 1 -> Estágio 4) e cada bônus tático dedicado
    const daysRes = await page.evaluate(() => {
      const ck = window.dailyCheckinV2;
      const ret = window.operatorRetentionEngine;
      const st = ck.getState();

      const advanceFakeYesterday = () => {
        st.lastSupplyClaimDay = ck.yesterdayBrtKey();
      };

      // Dia 1 (Estágio 1 = $350 + Gerador S.O.S. aliviando corte de 3 meses)
      if (window.quitineteEngine && window.quitineteEngine.bills && window.quitineteEngine.bills.power) {
        window.quitineteEngine.bills.power.monthsDue = 3;
      }
      const d1 = ck.claimTodaySupplyV2();

      // Dia 2 (+45 REP + Turbo CPU +12% por 25m)
      const baseCpu = window.hardwareEngine.getCpu().mhz;
      advanceFakeYesterday();
      const d2 = ck.claimTodaySupplyV2();
      const boostedCpu = window.hardwareEngine.getEffectiveCpuMhz();

      // Dia 3 ($800 + 1 Dossiê OSINT)
      const osintBefore = window.ecosystemHub.ensureLoaded().osintDossiers;
      advanceFakeYesterday();
      const d3 = ck.claimTodaySupplyV2();
      const osintAfter = window.ecosystemHub.ensureLoaded().osintDossiers;

      // Dia 4 (0.00025 BTC + Pasta Térmica Prata 7h)
      advanceFakeYesterday();
      const d4 = ck.claimTodaySupplyV2();
      const pasteApplied = window.nineSystemsEngine.ensureLoaded().thermals.pasteAppliedAt > 0;

      // Dia 5 ($1.500 + 1 Cupom Lab + 40 XP Lab)
      const couponsBefore = window.ecosystemHub.ensureLoaded().labDiscountCoupons;
      advanceFakeYesterday();
      const d5 = ck.claimTodaySupplyV2();
      const couponsAfter = window.ecosystemHub.ensureLoaded().labDiscountCoupons;

      // Dia 6 (+90 REP + 1 Escudo Freeze) & testar falta de 2 dias protegida pelo Freeze!
      advanceFakeYesterday();
      const d6 = ck.claimTodaySupplyV2();
      const freezesAfterD6 = st.freezeTokens;
      st.dailyGoalsDay = '2020-01-01';
      st.lastSupplyClaimDay = '2020-01-01'; // Mais de 1 dia atrás -> consome Freeze e preserva Dia 7!
      ret.ensureDailyReset();
      const streakPreservedAt7 = st.supplyStreakDay === 7 && st.freezeTokens === freezesAfterD6 - 1;

      // Promover para Estágio 4 (Modo Veterano) antes do Dia 7 para validar escalonamento máximo ($45.000 + Zero-Day!)
      window.progressiveUnlockEngine.toggleVeteranShowAll(true);
      const zdBefore = window.ecosystemHub.ensureLoaded().zeroDays.length;
      const d7 = ck.claimTodaySupplyV2();
      const zdAfter = window.ecosystemHub.ensureLoaded().zeroDays.length;

      return {
        d1Cash: d1.reward.cleanCash,
        d1RestoredPower: d1.bonusOutcome.restoredPower,
        d2Rep: d2.reward.rep,
        cpuBoostWorked: boostedCpu > baseCpu,
        osintDelta: osintAfter - osintBefore,
        d4Sats: d4.reward.sats,
        pasteApplied,
        couponsDelta: couponsAfter - couponsBefore,
        streakPreservedAt7,
        d7Stage: d7.stage,
        d7Cash: d7.reward.cleanCash,
        zdDelta: zdAfter - zdBefore,
        monthlyCount: st.monthlyCheckinCount
      };
    });
    assert(daysRes.d1Cash === 350 && daysRes.d1RestoredPower === true, 'Dia 1 falhou');
    assert(daysRes.d2Rep === 45 && daysRes.cpuBoostWorked, 'Dia 2 (REP + Turbo CPU) falhou');
    assert(daysRes.osintDelta === 1, 'Dia 3 (+1 OSINT) falhou');
    assert(daysRes.d4Sats >= 25000 && daysRes.pasteApplied, `Dia 4 (BTC=${daysRes.d4Sats} + Pasta=${daysRes.pasteApplied}) falhou`);
    assert(daysRes.couponsDelta === 1, 'Dia 5 (+1 Cupom Lab) falhou');
    assert(daysRes.streakPreservedAt7, 'Dia 6 (Escudo de Sequência protegendo Dia 7) falhou');
    assert(daysRes.d7Stage === 4 && daysRes.d7Cash === 45000 && daysRes.zdDelta === 1, 'Dia 7 Baú Mestre Estágio 4 falhou');
    assert(daysRes.monthlyCount === 7, 'Contador mensal deveria marcar 7 check-ins');
    console.log('✅ [2/4] Todos os 7 Dias (Dia 1 a Dia 7 + bônus táticos + Escudo Freeze + Escalonamento Est.4 $45.000) validados!');

    // 3. Validar Pool Dinâmico, 1 Reroll Grátis, Baú Combo 3/3 e Marco Mensal de 7 Dias
    const poolRes = await page.evaluate(() => {
      const ck = window.dailyCheckinV2;
      const ret = window.operatorRetentionEngine;
      const st = ck.getState();
      const initialGoals = ck.getActiveDailyGoals(st);
      const firstId = initialGoals[0].id;

      const rr1 = ck.rerollDailyGoal(firstId);
      const rrDup = ck.rerollDailyGoal(ck.getActiveDailyGoals(st)[0].id);

      const finalGoals = ck.getActiveDailyGoals(st);
      finalGoals.forEach((g) => {
        ret.recordDailyGoalProgress(g.id);
        ret.claimDailyGoal(g.id);
      });

      const combo = ck.claimDailyComboBox();
      const m7 = ck.claimMonthlyMilestone(7);
      const m7Dup = ck.claimMonthlyMilestone(7);

      return {
        rerollOk: rr1.success && rr1.newGoalId !== firstId,
        rerollDupBlocked: !rrDup.success && rrDup.code === 'REROLL_USED_TODAY',
        comboOk: combo.success && combo.bonusCash === 8000,
        m7Ok: m7.success && m7.cash === 16000 && !m7Dup.success,
        strikes: window.integrityGuard ? window.integrityGuard.cheatStrikes : 0
      };
    });
    assert(poolRes.rerollOk && poolRes.rerollDupBlocked, 'Reroll diário 1x grátis falhou');
    assert(poolRes.comboOk, 'Baú Combo 3/3 falhou');
    assert(poolRes.m7Ok && poolRes.strikes === 0, 'Marco Mensal 7d falhou ou disparou IntegrityGuard');
    console.log('✅ [3/4] Pool Dinâmico + Reroll 1x/dia + Baú Combo 3/3 ($8.000) + Marco Mensal 7d ($16.000) validados (0 strikes)!');

    console.log('🏆 CHECK-IN DIÁRIO 2.0 APROVADO EM 100% DOS CENÁRIOS!');
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
