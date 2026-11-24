const puppeteer = require('puppeteer');
const assert = require('assert');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,860']
  });

  const BASE_URL = process.env.HC_BASE_URL || 'http://localhost:8080/hacker-city-web/index.html';

  try {
    const pageA = await browser.newPage(); // Veterano (Operador_Alpha)
    const pageB = await browser.newPage(); // Novato (Novato_Bravo)
    pageA.on('dialog', async (d) => { try { await d.accept(); } catch (e) {} });
    pageB.on('dialog', async (d) => { try { await d.accept(); } catch (e) {} });

    await pageA.setViewport({ width: 1366, height: 860 });
    await pageB.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    await pageA.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await pageB.goto(BASE_URL, { waitUntil: 'networkidle2' });

    // 1. Iniciar Veterano Alpha (1.600 REP -> Escudo graduado) e Novato Bravo (100 -> 350 REP -> Escudo 24h Ativo!)
    const alphaInfo = await pageA.evaluate(async () => {
      localStorage.clear();
      sessionStorage.clear();
      window.DISABLE_AUTO_TOUR = true;
      localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
      await window.enterInstantOperatorMode('Veterano_Alpha');
      window.spotlightTour?.finishTour?.(true);
      window.integrityGuard.runAuthorized(() => {
        window.currentProfile.reputation = 1600;
        window.currentWallet.balance = 50000;
      });
      window.onlineEngine.trackRealtimePresence();
      return {
        ip: window.networkIdentity.getPublicIp(),
        shieldActive: window.progressiveUnlockEngine.isNewbiePvpShieldActive()
      };
    });
    assert.strictEqual(alphaInfo.shieldActive, false, 'Veterano >= 1000 REP não deve manter escudo de novato');

    const bravoInit = await pageB.evaluate(async () => {
      sessionStorage.clear();
      window.DISABLE_AUTO_TOUR = true;
      localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
      await window.enterInstantOperatorMode('Novato_Bravo');
      window.spotlightTour?.finishTour?.(true);
      // Simula que o novato já subiu para 350 REP fazendo cursos/missões nas primeiras horas: ainda protegido pelas 24h!
      window.integrityGuard.runAuthorized(() => {
        window.currentProfile.reputation = 350;
        window.currentWallet.balance = 2500;
      });
      window.progressiveUnlockEngine.syncSidebarDom();
      window.onlineEngine.trackRealtimePresence();
      const st = window.progressiveUnlockEngine.getNewbieShieldStatus();
      const badge = document.getElementById('hudNewbieShieldBadge');
      return {
        ip: window.networkIdentity.getPublicIp(),
        active: st.active,
        remHours: Math.floor(st.remainingMs / 3600000),
        hudBadgeVis: !!(badge && badge.offsetParent !== null)
      };
    });
    assert.strictEqual(bravoInit.active, true, 'Novato deve manter Escudo de 24h ativo mesmo com 350 REP');
    assert.ok(bravoInit.remHours >= 23, 'Escudo recém-criado deve ter ~24h restantes');
    assert.strictEqual(bravoInit.hudBadgeVis, true, 'Selo 🛡️ 24h deve estar visível na Topbar mobile (390x844)');

    await new Promise((r) => setTimeout(r, 350));

    // 2. Veterano Alpha tenta atacar Novato Bravo (Força-Bruta, Exploit e DDoS) -> TUDO BLOQUEADO!
    const alphaBlocked = await pageA.evaluate((bravoIp) => {
      window.navTo('winOnline');
      window.onlineEngine.renderOnlineHubUI();
      const onlineHtml = document.getElementById('onlineAppBody')?.innerText || '';
      window.internetEngine.openIp(bravoIp, 'invadir');
      const bf = window.internetEngine.startBruteforce();
      const ex = window.internetEngine.startExploitAttack();
      const ddos = window.ddosOverloadEngine.launchDdosOverloadOnHost(bravoIp);
      return {
        sawShieldInOnline: onlineHtml.includes('Escudo 24h'),
        bfCode: bf.code,
        exCode: ex.code,
        ddosCode: ddos.code
      };
    }, bravoInit.ip);
    assert.strictEqual(alphaBlocked.sawShieldInOnline, true, 'Alpha deve ver o selo Escudo 24h em Jogadores Online');
    assert.strictEqual(alphaBlocked.bfCode, 'NEWBIE_PROTECTED', 'Força-Bruta contra novato sob escudo 24h deve ser bloqueada');
    assert.strictEqual(alphaBlocked.exCode, 'NEWBIE_PROTECTED', 'Exploit contra novato sob escudo 24h deve ser bloqueado');
    assert.strictEqual(alphaBlocked.ddosCode, 'NEWBIE_PROTECTED', 'DDoS contra novato sob escudo 24h deve ser bloqueado');

    // 2b. Kernel de Bravo também descarta pacotes PvP forjados diretamente + bloqueia bots em background
    const bravoKernel = await pageB.evaluate(() => {
      const balBefore = window.currentWallet.balance;
      window.onlineEngine.handleIncomingPacket({
        pktId: 'forged_drain_01',
        kind: 'PVP_DRAIN_WALLET',
        senderId: 'hacker_x',
        senderTag: 'Ganker',
        visibleIp: '45.12.90.3',
        targetIp: window.networkIdentity.getPublicIp(),
        d: { amt: 400 }
      });
      const botHunt = window.livingBotsEngine.attemptBotHuntOnPlayer(false);
      return {
        balUnchanged: window.currentWallet.balance === balBefore,
        botBlocked: !botHunt.triggered && botHunt.reason === 'NEWBIE_SANDBOX_PROTECTED'
      };
    });
    assert.ok(bravoKernel.balUnchanged && bravoKernel.botBlocked, 'Kernel local e caçadas automáticas devem respeitar o Escudo de 24h');

    // 3. Novato Bravo invade NPC (Treino e Empresa) -> NÃO perde o escudo!
    const afterNpc = await pageB.evaluate(() => {
      const npcHost = window.internetEngine.resolveHost('203.17.88.40');
      window.internetEngine.onAttackSucceeded(npcHost, 'password', npcHost.rootPassword, 'root');
      return window.progressiveUnlockEngine.isNewbiePvpShieldActive();
    });
    assert.strictEqual(afterNpc, true, 'Invadir empresas/NPCs não pode quebrar o Escudo de 24h');

    // 4. Novato Bravo tenta atacar Veterano Alpha -> pede confirmação; ao confirmar, QUEBRA o escudo na hora!
    const breakFlow = await pageB.evaluate((alphaIp) => {
      window.internetEngine.openIp(alphaIp, 'invadir');
      const attempt1 = window.internetEngine.startBruteforce();
      const modalOpen = !!document.getElementById('hcNewbieShieldModal');
      // Primeiro clica em "Manter Meu Escudo" -> continua protegido!
      document.getElementById('btnKeepNewbieShield')?.click();
      const keptAfterCancel = window.progressiveUnlockEngine.isNewbiePvpShieldActive();

      // Agora tenta de novo e confirma "Quebrar Escudo e Atacar Jogador"
      window.internetEngine.startBruteforce();
      document.getElementById('btnConfirmBreakShieldPvp')?.click();
      const stAfterConfirm = window.progressiveUnlockEngine.getNewbieShieldStatus();
      return {
        firstCode: attempt1.code,
        modalOpen,
        keptAfterCancel,
        activeAfterConfirm: stAfterConfirm.active,
        brokenByPvp: stAfterConfirm.brokenByPvp
      };
    }, alphaInfo.ip);
    assert.strictEqual(breakFlow.firstCode, 'CONFIRM_BREAK_SHIELD', 'Atacar jogador real deve exigir confirmação de quebra de escudo');
    assert.ok(breakFlow.modalOpen && breakFlow.keptAfterCancel, 'Cancelar o modal deve manter o Escudo de 24h intacto');
    assert.ok(!breakFlow.activeAfterConfirm && breakFlow.brokenByPvp, 'Confirmar ataque PvP deve encerrar o Escudo de 24h imediatamente');

    await new Promise((r) => setTimeout(r, 300));

    // Agora Veterano Alpha já pode contra-atacar Bravo!
    const alphaCanCounter = await pageA.evaluate((bravoIp) => {
      const host = window.internetEngine.resolveHost(bravoIp);
      return { newbieProtectedNow: host.newbieProtected };
    }, bravoInit.ip);
    assert.strictEqual(alphaCanCounter.newbieProtectedNow, false, 'Após quebrar o escudo atacando PvP, Bravo deve ficar vulnerável na rede');

    // 5. Teste de expiração natural após 24h + 1s e 0 strikes no Anti-Cheat
    const expiryAndStrikes = await pageB.evaluate(() => {
      window.progressiveUnlockEngine.state.shieldBrokenByPvp = false;
      window.progressiveUnlockEngine.state.shieldStartedAt = Date.now() - (24 * 60 * 60 * 1000 + 2000);
      const expired = !window.progressiveUnlockEngine.isNewbiePvpShieldActive();
      return { expired, strikes: window.integrityGuard.cheatStrikes };
    });
    const strikesA = await pageA.evaluate(() => window.integrityGuard.cheatStrikes);
    assert.strictEqual(expiryAndStrikes.expired, true, 'Escudo deve expirar naturalmente após 24 horas');
    assert.strictEqual(expiryAndStrikes.strikes + strikesA, 0, 'IntegrityGuard deve registrar 0 strikes');

    console.log('✅ SUÍTE ESCUDO DE NOVATO 24H APROVADA (Proteção 24h + NPC Seguro + Quebra Anti-Abuso PvP + Expiração + 0 Strikes)!');
  } finally {
    await browser.close();
  }
})();
