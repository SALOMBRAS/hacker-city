/**
 * Suíte E2E — Fim do Vazamento de IPs, 30 Bots BR/Meme + 5 Policiais + Delegado (10m),
 * Novo Painel Jogadores Online (Recompensa no Topo, Filtros, Ver Publicações) e Reset Real.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const IMG_DIR = path.resolve(__dirname, '../../reports/anti-ip-leak-mundo-vivo-dashboard-online/images');

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

    // 1. Validar 30 Bots BR/Meme + 5 Policiais + 1 Delegado, IPs não sequenciais, 0 Despesas iniciais e Zero IP vazado na Home/Notícias
    const worldAudit = await page.evaluate(async () => {
      localStorage.clear();
      sessionStorage.clear();
      window.DISABLE_AUTO_TOUR = true;
      localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
      await window.enterInstantOperatorMode('salombras_audit');
      window.spotlightTour?.finishTour?.(true);

      // Rodar múltiplos eventos vivos para encher Notícias, Safenet e FBI
      for (let i = 0; i < 6; i++) {
        window.livingBotsEngine.simulateWorldStep(true);
      }
      window.navTo('winHome');
      window.renderHome();

      const dayBots = window.botScheduler.getCurrentDayBots();
      const lawUnits = window.botScheduler.getCurrentDayLawEnforcement();
      const policeCount = lawUnits.filter((u) => u.role === 'policial').length;
      const delegateCount = lawUnits.filter((u) => u.role === 'delegado').length;
      const handles = dayBots.map((b) => b.handle);

      const hasLegacyTenSubnet = dayBots.some((b) => b.ip.startsWith('10.'));

      // Medir variação orgânica ao longo de 8 janelas de 10 minutos
      const baseNow = Date.now();
      const countsAcross10m = [];
      for (let w = 0; w < 8; w++) {
        const t = baseNow + w * 10 * 60 * 1000;
        const onHackers = dayBots.filter((b) => window.botScheduler.isBotOnline(b.ip, t)).length;
        const onLaw = lawUnits.filter((l) => window.botScheduler.isBotOnline(l.ip, t)).length;
        countsAcross10m.push(onHackers + onLaw);
      }
      const uniqueCounts = new Set(countsAcross10m).size;

      // Auditar textos de O MUNDO na Home (Notícias, Procurados do FBI, Mira da Safenet) p/ garantir ZERO IP vazado!
      const newsTexts = (window.safenetFbiEngine.worldNews || []).map((n) => n.headline);
      const ipv4Regex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
      const leakedNews = newsTexts.filter((h) => ipv4Regex.test(h));

      const homeText = document.getElementById('homeBody')?.innerText || '';
      const botIpsSet = new Set([...dayBots.map((b) => b.ip), ...lawUnits.map((l) => l.ip)]);
      const leakedBotIpOnHome = Array.from(botIpsSet).filter((ip) => homeText.includes(ip));

      return {
        dayBotsCount: dayBots.length,
        policeCount,
        delegateCount,
        hasMemeNames: ['josenacimento', 'hackerbr', 'vitinladrão', 'lulaladrão'].every((n) => handles.includes(n)),
        hasLegacyTenSubnet,
        countsAcross10m,
        uniqueCounts,
        leakedNews,
        leakedBotIpOnHome,
        initialPendingBills: window.quitineteEngine.getPendingCount()
      };
    });

    assert.strictEqual(worldAudit.dayBotsCount, 30, 'Deve haver exatamente 30 bots hackers diários');
    assert.strictEqual(worldAudit.policeCount, 5, 'Deve haver exatamente 5 policiais cibernéticos');
    assert.strictEqual(worldAudit.delegateCount, 1, 'Deve haver 1 delegado chefe fora os 5 policiais');
    assert.strictEqual(worldAudit.hasMemeNames, true, 'Deve incluir nomes BR/meme (josenacimento, hackerbr, vitinladrão, lulaladrão)');
    assert.strictEqual(worldAudit.hasLegacyTenSubnet, false, 'Nenhum bot deve usar a faixa antiga sequencial 10.x.x.x');
    assert(worldAudit.uniqueCounts >= 2 && worldAudit.countsAcross10m.every((c) => c < 36), `Contagem online deve variar a cada 10m sem travar em 35/36: ${worldAudit.countsAcross10m.join(',')}`);
    assert.deepStrictEqual(worldAudit.leakedNews, [], `Vazamento de IP em Notícias: ${worldAudit.leakedNews.join(' | ')}`);
    assert.deepStrictEqual(worldAudit.leakedBotIpOnHome, [], `Vazamento de IP de máquina na Home: ${worldAudit.leakedBotIpOnHome.join(',')}`);
    assert.strictEqual(worldAudit.initialPendingBills, 0, ' Despesas iniciais do jogador real devem estar zeradas (0 pendentes)');

    await new Promise((r) => setTimeout(r, 250));
    await page.screenshot({ path: path.join(IMG_DIR, '01-home-noticias-fbi-safenet-zero-ip-vazado.png') });

    // 2. Clicar no botão "• X online" do rodapé lateral -> Abrir Dashboard Online s/ IP, s/ Offline, s/ Invadir PC
    await page.click('#hudCloudSyncBadge');
    await new Promise((r) => setTimeout(r, 250));

    const onlineAudit = await page.evaluate(() => {
      const winNow = window.winManager.current;
      const liveCard = document.getElementById('onlinePlayersLiveCard');
      const liveText = liveCard ? liveCard.innerText : '';
      const liveHtml = liveCard ? liveCard.innerHTML : '';
      const hasOfflineDir = !!document.getElementById('onlinePlayersDirectoryCard');
      const hasInvadirBtn = liveText.includes('Invadir PC') || liveText.includes('Abrir PC');
      const hasVerPubBtn = liveText.includes('Ver Publicações') && liveText.includes('Enviar Mensagem');
      const ipv4Regex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
      const leakedIpInRows = ipv4Regex.test(liveText) || ipv4Regex.test(liveHtml);

      // Checar se o 1º item na ordenação padrão ('bounty') tem Recompensa por Cabeça quando há procurados online!
      const rows = Array.from(document.querySelectorAll('#onlinePlayersLiveCard .online-player-row')).map((r) => r.innerText);
      const anyRowWanted = rows.some((t) => t.includes('Recompensa:'));
      const firstRowWanted = rows.length > 0 ? rows[0].includes('Recompensa:') : false;

      return {
        winNow,
        hasOfflineDir,
        hasInvadirBtn,
        hasVerPubBtn,
        leakedIpInRows,
        rowCount: rows.length,
        anyRowWanted,
        firstRowWanted
      };
    });

    assert.strictEqual(onlineAudit.winNow, 'winOnline', 'Clicar em #hudCloudSyncBadge deve abrir Jogadores Online');
    assert.strictEqual(onlineAudit.hasOfflineDir, false, 'Não deve existir lista de jogadores offline');
    assert.strictEqual(onlineAudit.hasInvadirBtn, false, 'Não deve existir botão Invadir PC nem Abrir PC');
    assert.strictEqual(onlineAudit.hasVerPubBtn, true, 'Deve exibir botões Ver Publicações e Enviar Mensagem');
    assert.strictEqual(onlineAudit.leakedIpInRows, false, 'Nenhum IP de jogador deve vazar nas linhas ou HTML de Jogadores Online');
    if (onlineAudit.anyRowWanted) {
      assert.strictEqual(onlineAudit.firstRowWanted, true, 'Quem tem Recompensa por Cabeça deve subir para o topo por padrão');
    }

    await page.screenshot({ path: path.join(IMG_DIR, '02-dashboard-online-sem-ip-recompensa-no-topo.png') });

    // 3. Testar filtros por Nível de Reputação e Ordem Alfabética
    await page.click('#btnOnlineSortRep');
    await new Promise((r) => setTimeout(r, 150));
    const repSortedOk = await page.evaluate(() => {
      const reps = Array.from(document.querySelectorAll('#onlinePlayersLiveCard .online-player-row')).map((r) => {
        const m = r.innerText.match(/([\d.]+)\s*REP/);
        return m ? Number(m[1].replace(/\./g, '')) : 0;
      });
      return reps.every((v, i) => i === 0 || reps[i - 1] >= v);
    });
    assert.strictEqual(repSortedOk, true, 'Filtro Nível de Reputação deve ordenar do maior para o menor REP');

    await page.click('#btnOnlineSortAlpha');
    await new Promise((r) => setTimeout(r, 150));
    const alphaSortedOk = await page.evaluate(() => {
      const nicks = Array.from(document.querySelectorAll('#onlinePlayersLiveCard .online-player-row strong'))
        .map((el) => el.innerText.trim())
        .filter((t) => t.startsWith('@'))
        .map((t) => t.slice(1));
      return nicks.every((v, i) => i === 0 || nicks[i - 1].localeCompare(v, 'pt-BR', { sensitivity: 'base' }) <= 0);
    });
    assert.strictEqual(alphaSortedOk, true, 'Filtro Ordem Alfabética deve ordenar os nicks de A a Z');
    await page.screenshot({ path: path.join(IMG_DIR, '03-dashboard-online-filtro-ordem-alfabetica.png') });

    // 4. Clicar em "Ver Publicações" -> Deve abrir Fórum da Rede filtrado pelas publicações do operador!
    const pubClick = await page.evaluate(() => {
      const firstRow = document.querySelector('#onlinePlayersLiveCard .online-player-row');
      const nick = firstRow.querySelector('strong').innerText.replace(/^@/, '').trim();
      const pubBtn = Array.from(firstRow.querySelectorAll('button')).find((b) => b.innerText.includes('Ver Publicações'));
      pubBtn.click();
      return {
        nick,
        winNow: window.winManager.current,
        bannerText: document.getElementById('forumAuthorFilterBanner')?.innerText || '',
        forumText: document.getElementById('forumAppBody')?.innerText || ''
      };
    });
    assert.strictEqual(pubClick.winNow, 'winForum', 'Clicar em Ver Publicações deve levar para winForum');
    assert(pubClick.bannerText.includes('@' + pubClick.nick), 'Banner do Fórum deve mostrar @nick filtrado');
    await new Promise((r) => setTimeout(r, 200));
    await page.screenshot({ path: path.join(IMG_DIR, '04-forum-ver-publicacoes-do-operador.png') });

    // 5. Validar Reset Automático de Conta Antiga (IP antigo + 4 despesas + tutorial concluído -> novo IP + 0 despesas + tutorial do zero!)
    const resetAudit = await page.evaluate(async () => {
      const legacyUid = 'legacy-real-user-99';
      localStorage.removeItem('HC_GLOBAL_RESET_APPLIED_20261125_v2_' + legacyUid);
      localStorage.setItem('HC_SPOTLIGHT_TOUR_DONE_' + legacyUid, 'completed');
      const oldSnapRaw = {
        v: 4,
        userId: legacyUid,
        savedAt: Date.now() - 60000,
        walletBalance: 4200,
        reputation: 520,
        heatLevel: 1,
        netId: { publicIp: '144.21.99.88', rootPassword: 'oldpw', pwdEpoch: 1 },
        tour: { done: 'completed', rewarded: '1' },
        tut: { step: 6, completed: true },
        billsPaid: { power: false, internet: false, rent: false, water: false },
        quitineteBilling: {
          cycle: { lastEvalMs: Date.now() - 86400000, isPaused: false },
          months: { power: 2, internet: 2, rent: 2, water: 2 }
        },
        hdb: [{ ip: '10.110.1.18', hostname: 'OldBot' }, { ip: '203.17.88.40', hostname: 'Farofa' }]
      };
      window.integrityGuard.runAuthorized(() => {
        window.currentProfile = { id: legacyUid, hacker_tag: 'veterano_real', specialty: 'carder', reputation: 520, heat_level: 1 };
        window.currentWallet = { id: 'w_leg', balance: 4200 };
      });
      const signed = window.integrityGuard.signSnapshot(oldSnapRaw);
      localStorage.setItem('HC_MASTER_SAVE_V2_' + legacyUid, JSON.stringify(signed));
      await window.onlineEngine.hydrateSessionAndConnect(legacyUid, 4200);

      return {
        newIp: window.networkIdentity.getPublicIp(),
        preservedCash: window.currentWallet.balance,
        pendingBillsAfter: window.quitineteEngine.getPendingCount(),
        tourCompletedAfter: window.spotlightTour.hasCompletedOrSkipped(),
        tutStepAfter: window.tutorialEngine.getCurrentStepInfo().step,
        hdbIps: window.hackedDb.getAll().map((x) => x.ip),
        strikes: window.integrityGuard ? window.integrityGuard.cheatStrikes : 0
      };
    });

    assert.notStrictEqual(resetAudit.newIp, '144.21.99.88', 'IP antigo do jogador real deve ser resetado');
    assert.strictEqual(resetAudit.preservedCash, 4200, 'Saldo legítimo do jogador real deve ser preservado');
    assert.strictEqual(resetAudit.pendingBillsAfter, 0, 'Todas as despesas pendentes do jogador real devem ser zeradas');
    assert.strictEqual(resetAudit.tourCompletedAfter, false, 'Jogador real antigo deve voltar a ver o tutorial do zero');
    assert.strictEqual(resetAudit.tutStepAfter, 1, 'Etapa do tutorial deve voltar para 1');
    assert(!resetAudit.hdbIps.includes('10.110.1.18') && resetAudit.hdbIps.includes('203.17.88.40'), 'IPs antigos de bots devem ser limpos do Hacked DB');
    assert.strictEqual(resetAudit.strikes, 0, 'Zero strikes do IntegrityGuard');

    // 6. Validar Pílula "👆 Clique aqui" ABAIXO do alvo, Passo 4 c/ menu fechado e sem reset de scroll, e Lavagem sem "(Bot)"
    const UX_DIR = path.resolve(__dirname, '../../reports/correcoes-pilula-scroll-menu-e-lavagem-sem-bot/images');
    fs.mkdirSync(UX_DIR, { recursive: true });

    const step3PillCheck = await page.evaluate(() => {
      window.DISABLE_AUTO_TOUR = false;
      localStorage.removeItem('HC_DISABLE_AUTO_TOUR');
      window.spotlightTour.start(true);
      const openSoftIdx = window.spotlightTour.steps.findIndex((s) => s.id === 'open_software');
      window.spotlightTour.goToStep(openSoftIdx >= 0 ? openSoftIdx : 1);
      window.spotlightTour.repositionCurrentStep(true);
      const rr = document.getElementById('hcTourRing').getBoundingClientRect();
      const pr = document.getElementById('hcTourPointerPill').getBoundingClientRect();
      const pillText = document.getElementById('hcTourPointerPill').innerText;
      return {
        pillBelowTarget: pr.top >= rr.bottom - 4,
        pointsUp: pillText.includes('👆')
      };
    });
    assert.strictEqual(step3PillCheck.pillBelowTarget, true, 'Pílula Clique aqui deve ficar ABAIXO do alvo iluminado');
    assert.strictEqual(step3PillCheck.pointsUp, true, 'Pílula abaixo do alvo deve ter mão apontando para cima (👆)');
    await new Promise((r) => setTimeout(r, 180));
    await page.screenshot({ path: path.join(UX_DIR, '01-pilula-clique-aqui-abaixo-apontando-pra-cima.png') });

    const step4Check = await page.evaluate(async () => {
      const ramIdx = window.spotlightTour.steps.findIndex((s) => s.id === 'running_ram_cooldown');
      window.spotlightTour.goToStep(ramIdx >= 0 ? ramIdx : 2);
      await new Promise((r) => setTimeout(r, 200));
      const openMenusOnStep4 = document.querySelectorAll('details.nav-topic[open]').length;
      const card = document.getElementById('hcTourCard');
      const nextBtn = document.getElementById('btnTourNext');
      const cr = card.getBoundingClientRect();
      const br = nextBtn.getBoundingClientRect();
      const nextVisibleWithoutScroll = br.bottom <= cr.bottom + 2 && br.top >= cr.top - 2;

      // Simular caixa com scroll e esperar 360ms (2+ ciclos de trackTimer) para garantir que scrollTop NÃO volta p/ 0!
      card.style.maxHeight = '130px';
      card.scrollTop = 45;
      await new Promise((r) => setTimeout(r, 360));
      const scrollPreserved = card.scrollTop > 20;
      card.style.maxHeight = '';
      window.spotlightTour.repositionCurrentStep(true);
      return { openMenusOnStep4, nextVisibleWithoutScroll, scrollPreserved };
    });
    assert.strictEqual(step4Check.openMenusOnStep4, 0, 'Submenu lateral deve fechar sozinho ao entrar no Passo 4');
    assert.strictEqual(step4Check.nextVisibleWithoutScroll, true, 'Botão Avançar no Passo 4 deve aparecer inteiro sem precisar scrollar no Desktop');
    assert.strictEqual(step4Check.scrollPreserved, true, 'Scroll do card do tutorial NÃO pode voltar pro início sozinho');
    await page.screenshot({ path: path.join(UX_DIR, '02-passo4-menu-fechado-e-card-inteiro-sem-bug-scroll.png') });

    const launderCheck = await page.evaluate(async () => {
      window.spotlightTour.finishTour(true);
      await window.enterInstantOperatorMode('operador_vitrine');
      window.spotlightTour.finishTour(true);
      window.nineSystemsEngine.addDirtyMoney(1200, 'Teste Vitrine');
      window.navTo('winLaundering');
      window.nineSystemsEngine.renderLaunderingHub('launderingAppBody');
      const txt = document.getElementById('launderingAppBody')?.innerText || '';
      return {
        hasDonoLabel: txt.includes('Dono:'),
        hasBotWord: /\(\s*Bot\s*\)/i.test(txt) || /Bots completando/i.test(txt)
      };
    });
    assert.strictEqual(launderCheck.hasDonoLabel, true, 'Vitrine de Lavagem deve exibir Dono: <nome>');
    assert.strictEqual(launderCheck.hasBotWord, false, 'Vitrine de Lavagem NÃO deve mencionar (Bot) nem Bots');
    await new Promise((r) => setTimeout(r, 180));
    await page.screenshot({ path: path.join(UX_DIR, '03-vitrine-lavagem-apenas-nome-do-dono-sem-bot.png') });

    console.log('✅ SUÍTE ANTI-IP-LEAK, BOTS BR 10M, DASHBOARD ONLINE & CORREÇÕES UX 100% APROVADA!', JSON.stringify({
      dayBotsCount: worldAudit.dayBotsCount,
      policeCount: worldAudit.policeCount,
      delegateCount: worldAudit.delegateCount,
      countsAcross10m: worldAudit.countsAcross10m,
      resetNewIp: resetAudit.newIp,
      pendingBillsAfter: resetAudit.pendingBillsAfter
    }));
  } finally {
    await browser.close();
  }
})();
