/**
 * Hacker City // Suíte E2E Visual - Nova Internet & Menu Inicial de IPs Públicos (Whois I–IV)
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Iniciando Validação E2E da Nova Internet & Menu Inicial Whois...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const outDir = path.resolve(__dirname, '../evidencias/internet-clean');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  try {
    await page.goto('http://localhost:8080/hacker-city-web/index.html', {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

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
      window.navTo('winBrowser');
      window.internetEngine.render();
      const toast = document.getElementById('globalToast');
      if (toast) toast.style.display = 'none';
    });
    await new Promise((r) => setTimeout(r, 450));

    // Verifica que abriu direto no First Whois (71.4.20.1)
    const homeCheck = await page.evaluate(() => ({
      currentIp: window.internetEngine.currentIp,
      rowsCount: document.querySelectorAll('.whois-row').length
    }));
    console.log('Menu Inicial Whois:', homeCheck);
    if (homeCheck.currentIp !== '71.4.20.1' || homeCheck.rowsCount < 6) {
      throw new Error('Menu Inicial First Whois não carregou como esperado');
    }

    // 1. Menu Inicial de IPs Públicos (Visão Geral: Acessar & Usar + Invadir)
    await page.screenshot({ path: path.join(outDir, '01_internet_menu_inicial_whois.png') });
    console.log('📸 01_internet_menu_inicial_whois.png');

    // 2. Aba "Para Acessar & Usar"
    await page.evaluate(() => {
      window.internetEngine.setWhoisCategory('services');
    });
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({ path: path.join(outDir, '02_internet_aba_servicos_acessar.png') });
    console.log('📸 02_internet_aba_servicos_acessar.png');

    // 3. Aba "Empresas & Alvos"
    await page.evaluate(() => {
      window.internetEngine.setWhoisCategory('targets');
    });
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({ path: path.join(outDir, '03_internet_aba_empresas_invadir.png') });
    console.log('📸 03_internet_aba_empresas_invadir.png');

    // 4. Aba "Invadir" Limpa (Farofa Systems 203.17.88.40)
    await page.evaluate(() => {
      window.internetEngine.navigate('203.17.88.40', 'invadir');
    });
    await new Promise((r) => setTimeout(r, 350));
    await page.screenshot({ path: path.join(outDir, '04_internet_aba_invadir_limpa.png') });
    console.log('📸 04_internet_aba_invadir_limpa.png');

    // 5. Acessar serviço público Bitcoin Market (144.202.44.8) + testar botão Home (🏠)
    await page.evaluate(async () => {
      window.internetEngine.navigate('144.202.44.8', 'pagina');
      await window.handleInetBtcTrade('buy');
      const toast = document.getElementById('globalToast');
      if (toast) toast.style.display = 'none';
    });
    await new Promise((r) => setTimeout(r, 350));
    await page.screenshot({ path: path.join(outDir, '05_internet_bitcoin_market.png') });
    console.log('📸 05_internet_bitcoin_market.png');

    // Clica no botão Home da barra do navegador e confirma retorno ao First Whois
    await page.click('#btnInetHomeWhois');
    await new Promise((r) => setTimeout(r, 250));
    const backHomeIp = await page.evaluate(() => window.internetEngine.currentIp);
    if (backHomeIp !== '71.4.20.1') {
      throw new Error('Botão Home do navegador não retornou ao First Whois');
    }

    if (pageErrors.length > 0) {
      throw new Error('Erros JS: ' + pageErrors.join(' | '));
    }

    console.log('✅ Suíte E2E da Nova Internet 100% aprovada!');
  } catch (err) {
    console.error('❌ Erro no teste:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
