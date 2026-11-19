/**
 * Suíte E2E Visual — Gerenciador de Programas Estilo Limpo, Cards sem IP & Mini-PC (HD/SSD/NVMe)
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const OUT_DIR = path.join(__dirname, '..', 'evidencias', 'software-minipc');
fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  console.log('🚀 Iniciando Validação E2E de Programas, Cards sem IP, Mini-PC (HD/SSD/NVMe) e PC Invadido...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto('http://localhost:8080/hacker-city-web/index.html', { waitUntil: 'networkidle2' });

  // Entrar em sessão instantânea limpa sem auto-abrir tour no início
  await page.evaluate(async () => {
    localStorage.clear();
    localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
    window.DISABLE_AUTO_TOUR = true;
    await window.enterInstantOperatorMode();
    if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
      window.integrityGuard.runAuthorized(() => {
        if (window.currentWallet) window.currentWallet.balance = 1500;
      });
    }
    if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
  });
  await new Promise((r) => setTimeout(r, 450));

  // 1. Abrir Meus Programas (Estilo Limpo 2 Colunas + Donut Uso do Disco + Ações Rodar/Esconder/Mover/Apagar)
  await page.evaluate(() => {
    window.navTo('winSoftware');
    window.softwareEngine.activeTab = 'inventory';
    window.softwareEngine.renderUI();
  });
  await new Promise((r) => setTimeout(r, 350));

  const softCheck = await page.evaluate(() => {
    const root = document.getElementById('softwareExplorerMain');
    const rows = document.querySelectorAll('#softwareExplorerMain .soft-table tbody tr');
    const donut = document.querySelector('#softwareExplorerMain .soft-donut-svg');
    return {
      rowsCount: rows.length,
      hasDonut: !!donut,
      hasEsconder: !!root?.querySelector('.soft-icon-act[data-tip-title*="Esconder"]'),
      hasMover: !!root?.querySelector('.soft-icon-act[data-tip-title*="Mover"]'),
      hasApagar: !!root?.querySelector('.soft-icon-act[data-tip-title*="Excluir"]'),
      hasRodar: !!root?.querySelector('.soft-icon-act[data-tip-title*="Rodar"]'),
      crackerVer: window.softwareEngine.getSoftwareVersion('cracker')
    };
  });
  console.log('Meus Programas:', softCheck);
  assert(softCheck.rowsCount >= 6, 'Deve listar programas iniciais no disco');
  assert(softCheck.hasDonut, 'Deve exibir gráfico circular de Uso do Disco');
  assert(softCheck.hasEsconder && softCheck.hasMover && softCheck.hasApagar && softCheck.hasRodar, 'Deve ter ícones compactos Rodar, Esconder, Mover e Excluir');
  assert.strictEqual(softCheck.crackerVer, 1.0, 'Cracker v1.0 deve estar disponível sob demanda sem precisar ligar na RAM');

  await page.screenshot({ path: path.join(OUT_DIR, '01_meus_programas_estilo_limpo.png') });
  console.log('📸 01_meus_programas_estilo_limpo.png');

  // 2. Validar Cards de "Programas a Encontrar" (ZERO IPs revelados!)
  await page.evaluate(() => {
    window.softwareEngine.activeTab = 'discover';
    window.softwareEngine.renderUI();
  });
  await new Promise((r) => setTimeout(r, 300));

  const cardsCheck = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#discoverCardsGrid .soft-discover-card'));
    const allText = cards.map((c) => c.innerText).join(' | ');
    const ipMatch = allText.match(/\b\d{1,3}(?:\.\d{1,3}){3}\b/);
    return {
      cardsCount: cards.length,
      ipFound: ipMatch ? ipMatch[0] : null
    };
  });
  console.log('Cards A Encontrar:', cardsCheck);
  assert(cardsCheck.cardsCount >= 10, 'Deve renderizar os programas não encontrados em Cards');
  assert.strictEqual(cardsCheck.ipFound, null, `Nenhum IP pode vazar nos cards! Encontrado: ${cardsCheck.ipFound}`);

  await page.screenshot({ path: path.join(OUT_DIR, '02_cards_programas_a_encontrar_sem_ip.png') });
  console.log('📸 02_cards_programas_a_encontrar_sem_ip.png');

  // 3. Testar Esconder/Revelar + Modal de Mover para NVMe
  await page.evaluate(() => {
    window.softwareEngine.activeTab = 'inventory';
    window.softwareEngine.renderUI();
    window.softwareEngine.toggleHideLocalItem('soft', 'portscan'); // Esconde PortScan
    window.softwareEngine.openMoveModal('soft', 'cracker');
  });
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: path.join(OUT_DIR, '03_mover_app_entre_hd_ssd_nvme.png') });
  console.log('📸 03_mover_app_entre_hd_ssd_nvme.png');

  await page.evaluate(() => {
    window.softwareEngine.confirmMoveItem('soft', 'cracker', 'nvme', null);
    window.softwareEngine.toggleHideLocalItem('soft', 'portscan'); // Revela PortScan de volta
  });
  await new Promise((r) => setTimeout(r, 200));

  // 4. Testar clique em "Quebrar senha" abrindo o Mini-PC (HD / SSD / NVMe)
  await page.evaluate(() => {
    window.internetEngine.openIp('203.17.88.40', 'invadir');
  });
  await new Promise((r) => setTimeout(r, 250));
  await page.click('#btnInetBruteforce');
  await new Promise((r) => setTimeout(r, 300));

  const miniPcCheck = await page.evaluate(() => {
    const win = document.getElementById('miniPcCrackerWindow');
    const items = document.querySelectorAll('#miniPcCrackerWindow .minipc-hash-item');
    return {
      isOpen: !!(win && win.offsetWidth > 0),
      itemsCount: items.length,
      text: win ? win.innerText : ''
    };
  });
  console.log('Mini-PC:', { isOpen: miniPcCheck.isOpen, itemsCount: miniPcCheck.itemsCount });
  assert(miniPcCheck.isOpen, 'Clicar em Quebrar senha deve abrir o Mini-PC');
  assert(miniPcCheck.itemsCount >= 2, 'Mini-PC deve listar todos os hashes do computador');
  assert(miniPcCheck.text.includes('NVMe') && miniPcCheck.text.includes('SSD') && miniPcCheck.text.includes('HD'), 'Mini-PC deve exibir HD, SSD e NVMe');

  await page.screenshot({ path: path.join(OUT_DIR, '04_minipc_escolher_hash_hd_ssd_nvme.png') });
  console.log('📸 04_minipc_escolher_hash_hd_ssd_nvme.png');

  // 5. Validar Tutorial no Passo 8 -> Passo 9 (Mini-PC Iluminado) -> Quebrar Senha -> Entrar no PC da Vítima!
  await page.evaluate(() => {
    window.internetEngine.closeCrackerMiniPc();
    window.spotlightTour.start(true);
    window.spotlightTour.goToStepById('crack_password');
  });
  await new Promise((r) => setTimeout(r, 300));
  await page.click('#btnInetBruteforce');
  await new Promise((r) => setTimeout(r, 350));

  const tourStepId = await page.evaluate(() => window.spotlightTour.currentStepId());
  assert.strictEqual(tourStepId, 'choose_minipc_hash', 'Tutorial deve avançar para escolher o hash no Mini-PC');

  await page.screenshot({ path: path.join(OUT_DIR, '05_tutorial_passo9_minipc_aberto.png') });
  console.log('📸 05_tutorial_passo9_minipc_aberto.png');

  // Clicar em "Usar este" no Mini-PC durante o Tutorial e aguardar invadir 198.51.100.42!
  await page.click('#btnMiniPcUseBest');
  await page.waitForFunction(
    () => window.internetEngine && window.internetEngine.activeSshIp === '198.51.100.42',
    { timeout: 9000 }
  );
  await new Promise((r) => setTimeout(r, 450));

  // 6. Fechar máscara do tour só para capturar em tela cheia limpa a lista de Programas & Download do PC Invadido
  await page.evaluate(() => {
    window.spotlightTour.stop('done');
    window.internetEngine.activeTab = 'entrar';
    window.internetEngine.sshSubTab = 'files';
    window.internetEngine.render();
  });
  await new Promise((r) => setTimeout(r, 300));

  const remoteSoftCheck = await page.evaluate(() => {
    const root = document.getElementById('remoteTargetSpecsCard');
    return {
      hasDownloadBtn: !!root?.querySelector('.soft-icon-act[data-tip-title*="Download"]'),
      hasDonut: !!document.querySelector('#remoteTargetSpecsCard .soft-donut-svg')
    };
  });
  assert(remoteSoftCheck.hasDownloadBtn && remoteSoftCheck.hasDonut, 'PC invadido deve exibir tabela de programas com ícone de Download e Donut de disco');

  await page.screenshot({ path: path.join(OUT_DIR, '06_pc_invadido_programas_e_download.png') });
  console.log('📸 06_pc_invadido_programas_e_download.png');

  assert.strictEqual(pageErrors.length, 0, 'Erros JS encontrados: ' + pageErrors.join('; '));
  await browser.close();
  console.log('✅ Suíte E2E de Programas, Cards sem IP e Mini-PC 100% aprovada com 0 erros!');
})();
