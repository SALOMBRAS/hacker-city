/**
 * Hacker City // Suíte Visual E2E - Redesign "Arroz com Feijão Bem Feito"
 * Valida Menu Lateral + Mini-Menu Flyout, Topbar limpa, Home em 2 colunas,
 * páginas nativas sem modais improvisados, LAN sem encavalar e Mapa-Múndi com continentes reais.
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Iniciando Validação Visual E2E do Redesign Limpo...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const outDir = path.resolve(__dirname, '../evidencias/clean-ui');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  try {
    await page.goto('http://localhost:8080/hacker-city-web/index.html', {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    // Entra com auto-tour pausado inicialmente para inspecionar o visual limpo
    await page.evaluate(async () => {
      window.DISABLE_AUTO_TOUR = true;
      localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
      await window.enterInstantOperatorMode();
      if (window.integrityGuard) {
        window.integrityGuard.runAuthorized(() => {
          if (window.currentWallet) window.currentWallet.balance = 48730;
          if (window.currentProfile) window.currentProfile.reputation = 8240;
        });
      }
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (typeof window.renderHome === 'function') window.renderHome();
    });
    await new Promise((r) => setTimeout(r, 700));

    // 1. Home Limpa (Menu Recolhido nos Tópicos + Topbar Tabular + Widget Processos)
    await page.screenshot({ path: path.join(outDir, '01_home_limpa.png') });
    console.log('📸 01_home_limpa.png');

    // 2. Clicar no Tópico "Explorar & Invadir" para abrir o Mini-Menu Flutuante (Flyout)
    await page.click('#navSummary_net');
    await new Promise((r) => setTimeout(r, 350));
    const flyoutCheck = await page.evaluate(() => {
      const sub = document.querySelector('#navTopic_net .nav-sublist');
      const r = sub ? sub.getBoundingClientRect() : null;
      return { open: document.getElementById('navTopic_net').open, rect: r };
    });
    if (!flyoutCheck.open || !flyoutCheck.rect || flyoutCheck.rect.width < 200) {
      throw new Error('Mini-menu flyout não abriu corretamente');
    }
    await page.screenshot({ path: path.join(outDir, '02_menu_flyout_aberto.png') });
    console.log('📸 02_menu_flyout_aberto.png');

    // 3. Clicar em "Mapa-Múndi & Rotas" dentro do Mini-Menu -> Página nativa com continentes!
    await page.click('#navBtnWorldMap');
    await new Promise((r) => setTimeout(r, 450));
    await page.evaluate(() => {
      window.worldMapEngine.bounceRoute = ['sao_paulo', 'london', 'tokyo'];
      window.worldMapEngine.renderUI();
    });
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({ path: path.join(outDir, '03_mapa_mundi_continentes.png') });
    console.log('📸 03_mapa_mundi_continentes.png');

    // 4. Servidores & Rede Local (LAN sem encavalar!)
    await page.evaluate(() => {
      window.lanServersEngine.purchaseServer('vps');
      window.navTo('winLan');
    });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, '04_servidores_lan_limpo.png') });
    console.log('📸 04_servidores_lan_limpo.png');

    // 5. Conexões ao Vivo (Página nativa com intruso simulado)
    await page.evaluate(() => {
      window.connManagerEngine.registerInboundSession({
        id: 'test_sess_01',
        originIp: '198.51.100.77',
        originAlias: 'Kuro_Phantom',
        protocol: 'SSH',
        action: 'Quebrando senha root (62%)',
        progressPct: 62,
        startedAt: '10:42:18'
      });
      window.navTo('winConnManager');
    });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, '05_conexoes_ao_vivo.png') });
    console.log('📸 05_conexoes_ao_vivo.png');

    // 6. Fórum da Rede (Página nativa limpa)
    await page.evaluate(() => {
      window.darknetSocialEngine.activeThreadId = null;
      window.navTo('winForum');
    });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, '06_forum_da_rede.png') });
    console.log('📸 06_forum_da_rede.png');

    // 7. Notícias da Rede + Card de Perfil Público
    await page.evaluate(() => {
      window.navTo('winNews');
    });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, '07_noticias_da_rede.png') });
    console.log('📸 07_noticias_da_rede.png');

    await page.evaluate(() => {
      window.openPublicProfileModal('AcidBurn');
    });
    await new Promise((r) => setTimeout(r, 350));
    await page.screenshot({ path: path.join(outDir, '08_perfil_publico_card.png') });
    console.log('📸 08_perfil_publico_card.png');

    // 8. Validar Tour Guiado apontando para o sub-item dentro do Mini-Menu Flyout!
    await page.evaluate(() => {
      const m = document.getElementById('player-profile-modal');
      if (m) m.style.display = 'none';
      localStorage.removeItem('HC_DISABLE_AUTO_TOUR');
      window.DISABLE_AUTO_TOUR = false;
      window.spotlightTour.start(true);
      window.spotlightTour.goToStep(2); // Passo 3: clicar em Programas & Proteção dentro do flyout
    });
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outDir, '09_tour_guiado_com_flyout.png') });
    console.log('📸 09_tour_guiado_com_flyout.png');

    if (pageErrors.length > 0) {
      throw new Error('Erros JS detectados na página: ' + pageErrors.join(' | '));
    }

    console.log('✅ Todas as 9 telas validadas sem erros JS!');
  } catch (err) {
    console.error('❌ Falha na suíte visual:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
