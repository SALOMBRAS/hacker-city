/**
 * Suíte E2E — Roleta Russa no Corte de Conexão (20% Grátis / 40% EMP / 70% VPS),
 * 1 Única Tentativa por Invasão, Prazo de 2 Minutos para Trocar IP e Limite de 3 IPs/Semana Escalonado.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const IMG_DIR = path.resolve(__dirname, '../../reports/roleta-corte-conexao-2min-e-limite-3-ips-semana/images');

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

    // 1. Setup conta de teste com saldo suficiente e verificar probabilidades/custos da Roleta Russa
    const setupCheck = await page.evaluate(async () => {
      localStorage.clear();
      sessionStorage.clear();
      window.DISABLE_AUTO_TOUR = true;
      localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
      await window.enterInstantOperatorMode('operador_roleta');
      window.spotlightTour?.finishTour?.(true);
      if (window.progressiveUnlockEngine) window.progressiveUnlockEngine.isNewbiePvpShieldActive = () => false;
      window.integrityGuard.runAuthorized(() => {
        window.currentWallet.balance = 100000;
        if (window.onlineEngine) window.onlineEngine.lastDbWalletBalance = 100000;
        window.currentProfile.reputation = 800;
      });
      window.updateHudDisplays();

      const c1 = window.nineSystemsEngine.getEmergencyCutConfig('cut_cable');
      const c2 = window.nineSystemsEngine.getEmergencyCutConfig('emp_pulse');
      const c3 = window.nineSystemsEngine.getEmergencyCutConfig('vps_reroute');

      window.navTo('winConnManager');
      window.connManagerEngine.registerInboundSession({
        id: 'sim_inv_01',
        originIp: '187.99.44.12',
        originAlias: 'vitinladrão',
        isBot: true,
        protocol: 'SSH',
        action: 'Quebrando senha root (52%)',
        progressPct: 52,
        startedAt: '13:45:00'
      });
      return { c1, c2, c3 };
    });

    assert.strictEqual(setupCheck.c1.chance, 0.20, 'Puxar o cabo deve ter 20% de chance');
    assert.strictEqual(setupCheck.c1.cost, 0, 'Puxar o cabo deve ser grátis ($0)');
    assert.strictEqual(setupCheck.c2.chance, 0.40, 'Opção mediana (EMP) deve ter 40% de chance');
    assert(setupCheck.c2.cost > 0, 'Opção mediana (EMP) deve ter custo pago ao tentar');
    assert.strictEqual(setupCheck.c3.chance, 0.70, 'Opção VPS deve ter 70% de chance');
    assert(setupCheck.c3.cost > setupCheck.c2.cost, 'Opção VPS deve custar mais caro que a mediana');

    await new Promise((r) => setTimeout(r, 220));
    await page.screenshot({ path: path.join(IMG_DIR, '01-roleta-corte-20-40-70-popover-e-conexoes.png') });

    // 2. Testar FALHA na Roleta (cobra ao tentar!) + Bloqueio de 2ª tentativa na MESMA invasão
    const failCheck = await page.evaluate(() => {
      const balBefore = window.currentWallet.balance;
      const attempt1 = window.nineSystemsEngine.attemptEmergencyDisconnect('emp_pulse', { sessionId: 'sim_inv_01', forceRoll: 0.85 });
      const balAfterFail = window.currentWallet.balance;
      const retrySameInvasion = window.nineSystemsEngine.attemptEmergencyDisconnect('cut_cable', { sessionId: 'sim_inv_01', forceRoll: 0.01 });
      return {
        attempt1,
        chargedOnAttempt: balBefore - balAfterFail,
        inboundStillAlive: window.connManagerEngine.inboundSessions.some((s) => s.id === 'sim_inv_01'),
        retrySameInvasion
      };
    });

    assert.strictEqual(failCheck.attempt1.rollSucceeded, false, 'Roll 0.85 em 40% deve falhar');
    assert.strictEqual(failCheck.chargedOnAttempt, 1200, 'Deve cobrar $ 1.200 HC mesmo quando a tentativa falha');
    assert.strictEqual(failCheck.inboundStillAlive, true, 'Invasor deve continuar conectado quando a roleta falha');
    assert.strictEqual(failCheck.retrySameInvasion.success, false, 'Não pode tentar cancelar de novo na mesma invasão');
    assert.strictEqual(failCheck.retrySameInvasion.code, 'ALREADY_ATTEMPTED_THIS_INVASION');

    await new Promise((r) => setTimeout(r, 180));
    await page.screenshot({ path: path.join(IMG_DIR, '02-tentativa-unica-gasta-bloqueada-na-mesma-invasao.png') });

    // 3. Testar SUCESSO na Roleta (70% VPS) -> Prazo de 2 min p/ trocar IP + Bloqueio do atacante por 2 min + Re-invasão após 2 min se não trocar IP!
    const successAnd2MinCheck = await page.evaluate(() => {
      window.connManagerEngine.inboundSessions = [];
      window.connManagerEngine.registerInboundSession({
        id: 'sim_inv_02',
        originIp: '179.55.81.33',
        originAlias: 'hackerbr',
        isBot: true,
        protocol: 'SSH',
        action: 'Quebrando senha root (61%)',
        progressPct: 61,
        startedAt: '13:46:10'
      });
      const balBefore = window.currentWallet.balance;
      const cutOk = window.nineSystemsEngine.attemptEmergencyDisconnect('vps_reroute', { sessionId: 'sim_inv_02', forceRoll: 0.45 });
      const chargedVps = balBefore - window.currentWallet.balance;
      const bannerVisible = document.getElementById('hcIpEscapeBanner')?.style.display === 'flex';

      // Validar bloqueio de 2 min do lado do atacante contra um alvo que cortou a conexão
      const dayBots = window.botScheduler.getCurrentDayBots();
      const sampleBot = dayBots.find((b) => window.botScheduler.isBotOnline(b.ip)) || dayBots[0];
      window.connManagerEngine.setReinvadeLock(sampleBot.ip, 120000);
      window.internetEngine.currentIp = sampleBot.ip;
      const blockedBefore2Min = window.internetEngine.startBruteforce({ directBest: true });

      // Após expirar os 2 min sem troca de IP, o bloqueio do atacante libera:
      window.connManagerEngine.reinvadeLocks.set(sampleBot.ip, Date.now() - 1000);
      const lockAfter2Min = window.connManagerEngine.getReinvadeLockStatus(sampleBot.ip);

      return { cutOk, chargedVps, bannerVisible, blockedBefore2Min, unlockedAfter2Min: !lockAfter2Min.locked };
    });

    assert.strictEqual(successAnd2MinCheck.cutOk.rollSucceeded, true, 'Roll 0.45 em 70% VPS deve funcionar');
    assert.strictEqual(successAnd2MinCheck.chargedVps, 3500, 'Desvio VPS deve cobrar $ 3.500 HC na tentativa');
    assert.strictEqual(successAnd2MinCheck.bannerVisible, true, 'Banner regressivo de 2 minutos para trocar IP deve aparecer');
    assert.strictEqual(successAnd2MinCheck.blockedBefore2Min.code, 'DEFENDER_CUT_2MIN_COOLDOWN', 'Atacante deve ficar bloqueado durante os 2 minutos');
    assert.strictEqual(successAnd2MinCheck.unlockedAfter2Min, true, 'Após 2 minutos sem trocar IP, o atacante pode invadir novamente');

    await new Promise((r) => setTimeout(r, 180));
    await page.screenshot({ path: path.join(IMG_DIR, '03-sucesso-roleta-banner-2-minutos-para-trocar-ip.png') });

    // Simular expiração dos 2 min SEM trocar o IP -> Bot volta e defensor NÃO pode cortar de novo no mesmo IP!
    const expiredNoRotate = await page.evaluate(() => {
      window.nineSystemsEngine.state.ipEscapeDeadline.expiresAt = Date.now() - 500;
      const evalRes = window.nineSystemsEngine.evaluateIpEscapeDeadline();
      const returnedSess = window.connManagerEngine.inboundSessions.find((s) => s.originIp === '179.55.81.33');
      const tryCutAgainSameIp = window.nineSystemsEngine.attemptEmergencyDisconnect('vps_reroute', {
        sessionId: returnedSess ? returnedSess.id : 're_1',
        forceRoll: 0.01
      });
      return { evalRes, returned: !!returnedSess, tryCutAgainSameIp };
    });

    assert.strictEqual(expiredNoRotate.evalRes.expired, true, 'Prazo de 2 min deve expirar quando não troca IP');
    assert.strictEqual(expiredNoRotate.returned, true, 'Invasor retorna após 2 min no IP não trocado');
    assert.strictEqual(expiredNoRotate.tryCutAgainSameIp.code, 'IP_NOT_ROTATED_LOCK', 'Não pode cortar novamente no mesmo IP não trocado');

    // 4. Abrir Provedor ISP (71.4.5.1) e validar Limite de 3 IPs Comprados/Semana + Valor Escalonado ($2.500 -> $10.000 -> $35.000) + Reset na Virada da Semana!
    await page.evaluate(() => {
      window.navTo('winInternet');
      window.internetEngine.openIp('71.4.5.1');
    });
    await new Promise((r) => setTimeout(r, 200));
    await page.screenshot({ path: path.join(IMG_DIR, '04-provedor-isp-limite-3-ips-semana-escalonado.png') });

    const ispAudit = await page.evaluate(async () => {
      // Isolar do banco compartilhado na auditoria determinística de virada de semana para não sujar cota real nem disparar teto >$50k do RPC
      window.supabase = null;
      if (window.onlineEngine) window.onlineEngine.scheduleSave = () => {};
      window.integrityGuard.runAuthorized(() => {
        window.currentWallet.balance = 120000;
      });
      const b1 = await window.networkIdentity.resetPublicIp(true);
      const b2 = await window.networkIdentity.resetPublicIp(true);
      const b3 = await window.networkIdentity.resetPublicIp(true);
      const b4Blocked = await window.networkIdentity.resetPublicIp(true);

      // Virar a semana (+8 dias) -> contador volta para 0/3 e preço volta para $ 2.500 HC!
      const nextWeekNow = Date.now() + 8 * 24 * 60 * 60 * 1000;
      const statusNextWeek = window.networkIdentity.getWeeklyResetStatus(nextWeekNow);
      const bNextWeek1 = await window.networkIdentity.resetPublicIp(true, nextWeekNow);

      window.internetEngine.render();
      return {
        costs: [b1.cost, b2.cost, b3.cost],
        b4Blocked,
        statusNextWeekUsed: statusNextWeek.usedThisWeek,
        statusNextWeekCost: statusNextWeek.paidCost,
        bNextWeek1Cost: bNextWeek1.cost,
        strikes: window.integrityGuard ? window.integrityGuard.cheatStrikes : 0
      };
    });

    assert.deepStrictEqual(ispAudit.costs, [2500, 10000, 35000], 'Preços dos 3 IPs da semana devem escalonar ($2.500 -> $10.000 -> $35.000)');
    assert.strictEqual(ispAudit.b4Blocked.success, false, '4ª compra na mesma semana deve ser bloqueada');
    assert.strictEqual(ispAudit.b4Blocked.code, 'WEEKLY_LIMIT_REACHED');
    assert.strictEqual(ispAudit.statusNextWeekUsed, 0, 'Ao virar a semana o contador deve voltar para 0/3');
    assert.strictEqual(ispAudit.statusNextWeekCost, 2500, 'Ao virar a semana o valor deve cair de volta para $ 2.500 HC');
    assert.strictEqual(ispAudit.bNextWeek1Cost, 2500, '1ª compra da nova semana deve custar $ 2.500 HC');
    assert.strictEqual(ispAudit.strikes, 0, 'Zero strikes do IntegrityGuard');

    console.log('✅ SUÍTE ROLETA RUSSA (20%/40%/70%), PRAZO 2 MIN E LIMITE 3 IPS/SEMANA ESCALONADO 100% APROVADA!', JSON.stringify({
      costsThisWeek: ispAudit.costs,
      fourthBlocked: ispAudit.b4Blocked.code,
      nextWeekResetCost: ispAudit.bNextWeek1Cost
    }));
  } finally {
    await browser.close();
  }
})();
