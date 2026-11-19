/**
 * Suíte E2E Visual Completa — As 3 Melhorias:
 * 1) Foto 1: Missões estilo E-mail/Mensagem com Mini-História, Caixa Lateral e Verificação Real (Roubar/Deletar Arquivo & Instalar Vírus)
 * 2) Foto 2: Hub Inicial da Internet em 2 Colunas (Links Essenciais + Busca IP Avulso + Histórico c/ Tempo + Favoritos)
 * 3) Foto 3: Internet (Instalação + Mensalidade + Provedor + Potência) & Peças de PC (Consumo W + Custo de Energia baseado no PC)
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const OUT_DIR = path.join(__dirname, '..', 'evidencias', 'missions-hub-net-energy');
fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  console.log('🚀 Iniciando Validação E2E das 3 Frentes (Missões por E-mail + Hub Internet + Planos Internet & Energia do PC)...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto('http://localhost:8080/hacker-city-web/index.html', { waitUntil: 'networkidle2' });

  await page.mouse.move(10, 10);
  await page.evaluate(async () => {
    localStorage.clear();
    localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
    window.DISABLE_AUTO_TOUR = true;
    await window.enterInstantOperatorMode();
    if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
      window.integrityGuard.runAuthorized(() => {
        if (window.currentWallet) window.currentWallet.balance = 5000;
      });
    }
    // Garantir Cracker v1.0 e Spam v1.0 no disco e Cracker ativo p/ testar invasão real + missão de vírus
    if (window.softwareEngine) {
      window.softwareEngine.ensureLoaded();
      window.softwareEngine.state.inventory.cracker = { owned: true, installed: true, versionInt: 10, hiddenWithVer: 0 };
      window.softwareEngine.state.inventory.vspam = { owned: true, installed: false, versionInt: 10, hiddenWithVer: 0 };
      window.softwareEngine.save();
    }
    const toast = document.getElementById('toast');
    if (toast) toast.classList.remove('show');
    if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
  });
  await new Promise((r) => setTimeout(r, 350));

  const hideToast = () => page.evaluate(() => {
    const t = document.getElementById('toast');
    if (t) t.classList.remove('show');
  });

  // =========================================================================
  // 1. MISSÕES POR E-MAIL COM MINI-HISTÓRIA E VERIFICAÇÃO REAL (FOTO 1)
  // =========================================================================
  await page.evaluate(() => window.navTo('winMissions'));
  await new Promise((r) => setTimeout(r, 250));
  await hideToast();
  await page.screenshot({ path: path.join(OUT_DIR, '01_missoes_disponiveis_propostas.png') });

  // Aceitar missão de Roubar Arquivo (Users.dat em 203.17.88.40)
  await page.click('.btn-accept-msn-steal_data');
  await new Promise((r) => setTimeout(r, 250));
  await hideToast();

  // Tentar verificar ANTES de cumprir -> deve recusar com explicação clara!
  await page.click('#btnVerifyAndClaimMission');
  await new Promise((r) => setTimeout(r, 220));
  await hideToast();

  const beforeStealCheck = await page.evaluate(() => {
    const m = window.missionsEngine.state.activeMission;
    const latestMail = window.mailEngine?.state?.inbox?.[0];
    return {
      subTab: window.missionsEngine.subTab,
      fileName: m?.fileName,
      targetIp: m?.targetIp,
      verifiedNow: window.missionsEngine.verifyActiveMissionStatus().verified,
      feedbackShown: !!window.missionsEngine.lastVerifyFeedback && !window.missionsEngine.lastVerifyFeedback.ok,
      emailDelivered: !!(latestMail && latestMail.subject.includes(m.id))
    };
  });
  console.log('📩 Missão Atual (Antes de Roubar o Arquivo):', beforeStealCheck);
  assert.strictEqual(beforeStealCheck.subTab, 'current');
  assert.strictEqual(beforeStealCheck.fileName, 'Users.dat');
  assert.strictEqual(beforeStealCheck.verifiedNow, false, 'Não pode aprovar sem ter baixado Users.dat de verdade');
  assert.ok(beforeStealCheck.feedbackShown, 'Deve exibir aviso explicando que o arquivo ainda não foi baixado');
  assert.ok(beforeStealCheck.emailDelivered, 'Contratante deve enviar e-mail real na Caixa de Entrada');

  await page.screenshot({ path: path.join(OUT_DIR, '02_missao_atual_mensagem_historia_pendente.png') });

  // Invadir 203.17.88.40 de verdade e baixar Users.dat (28 MB)
  await page.evaluate(() => {
    const host = window.internetEngine.resolveHost('203.17.88.40');
    window.internetEngine.onAttackSucceeded(host, 'bruteforce', host.rootPassword, 'root');
    window.internetEngine.openIp('203.17.88.40', 'entrar');
    window.internetEngine.connectSsh('203.17.88.40', host.rootPassword, false);
    window.internetEngine.sshSubTab = 'files';
    window.internetEngine.render();
  });
  await new Promise((r) => setTimeout(r, 250));
  await hideToast();
  await page.screenshot({ path: path.join(OUT_DIR, '03_vitima_arquivo_users_dat_para_roubar.png') });

  await page.click('#btnReadFile_Users_dat');
  await new Promise((r) => setTimeout(r, 250));

  // Voltar para Missão Atual -> agora aparece ✓ Confirmado!
  await page.evaluate(() => {
    window.navTo('winMissions');
    window.missionsEngine.setSubTab('current');
  });
  await new Promise((r) => setTimeout(r, 220));
  await hideToast();

  const afterStealCheck = await page.evaluate(() => ({
    verifiedNow: window.missionsEngine.verifyActiveMissionStatus().verified,
    balBeforeClaim: window.currentWallet.balance
  }));
  assert.strictEqual(afterStealCheck.verifiedNow, true, 'Após baixar Users.dat, a verificação real deve confirmar!');
  await page.screenshot({ path: path.join(OUT_DIR, '04_missao_verificada_pronta_receber.png') });

  await page.click('#btnVerifyAndClaimMission');
  await new Promise((r) => setTimeout(r, 250));
  await hideToast();

  const claimedCheck = await page.evaluate(() => ({
    balAfter: window.currentWallet.balance,
    completedCount: window.missionsEngine.state.completedCount,
    subTab: window.missionsEngine.subTab
  }));
  assert.strictEqual(claimedCheck.balAfter, afterStealCheck.balBeforeClaim + 650, 'Recompensa de $650 creditada após verificação');
  assert.strictEqual(claimedCheck.completedCount, 1);

  // Testar também verificação real de Instalar Vírus (Spam.vspam)
  await page.evaluate(() => {
    window.missionsEngine.setSubTab('available');
  });
  await new Promise((r) => setTimeout(r, 150));
  await page.click('.btn-accept-msn-install_virus');
  await new Promise((r) => setTimeout(r, 200));

  const virusVerifCheck = await page.evaluate(() => {
    const beforeRun = window.missionsEngine.verifyActiveMissionStatus().verified;
    const host = window.internetEngine.resolveHost('203.17.88.40');
    if (!window.softwareEngine.state.stagedRemoteViruses) window.softwareEngine.state.stagedRemoteViruses = {};
    window.softwareEngine.state.stagedRemoteViruses['203.17.88.40'] = [{
      id: 901,
      targetIp: '203.17.88.40',
      virusKey: 'vspam',
      filename: 'Spam.vspam',
      versionInt: 10,
      sizeMb: 16,
      ramMb: 12
    }];
    const onlyStaged = window.missionsEngine.verifyActiveMissionStatus();
    window.softwareEngine.executeStagedVirusOnRemote(host, 'vspam');
    const afterRun = window.missionsEngine.verifyActiveMissionStatus();
    return { beforeRun, onlyStagedVerified: onlyStaged.verified, afterRunVerified: afterRun.verified };
  });
  console.log('🦠 Verificação Real de Missão de Vírus:', virusVerifCheck);
  assert.strictEqual(virusVerifCheck.beforeRun, false);
  assert.strictEqual(virusVerifCheck.onlyStagedVerified, false, 'Só subir sem rodar não passa na verificação');
  assert.strictEqual(virusVerifCheck.afterRunVerified, true, 'Quando o vírus está rodando na vítima, passa na verificação');

  // =========================================================================
  // 2. HUB INICIAL DA INTERNET (FOTO 2: 2 COLUNAS + BUSCA AVULSA + HISTÓRICO + FAVORITOS)
  // =========================================================================
  await page.evaluate(() => {
    window.navTo('winBrowser');
    window.internetEngine.navigate('109.64.200.10');
    window.internetEngine.navigate('161.89.1.1');
    window.internetEngine.toggleFavoriteIp('203.17.88.40');
    window.internetEngine.goHome();
  });
  await hideToast();
  await new Promise((r) => setTimeout(r, 250));

  const hubCheck = await page.evaluate(() => ({
    hasTwoCols: !!document.getElementById('inetHubTwoCols'),
    hubLines: document.querySelectorAll('#inetHubTwoCols .hub-site-line').length,
    hasHistoryCard: !!document.getElementById('inetRecentHistoryCard'),
    historyCount: document.querySelectorAll('#inetRecentHistoryCard .inet-side-row').length,
    hasFavCard: !!document.getElementById('inetFavoritesCard'),
    favCount: document.querySelectorAll('#inetFavoritesCard .inet-side-row').length,
    hasSearchInput: !!document.getElementById('inetAddressInput')
  }));
  console.log('🌐 Hub Inicial da Internet:', hubCheck);
  assert.ok(hubCheck.hasTwoCols && hubCheck.hubLines >= 12, 'Hub inicial deve mostrar as 2 colunas de links essenciais');
  assert.ok(hubCheck.hasHistoryCard && hubCheck.historyCount >= 3, 'Card lateral de Histórico de IPs acessados ativo');
  assert.ok(hubCheck.hasFavCard && hubCheck.favCount >= 4, 'Card lateral de Favoritos ativo');

  await page.screenshot({ path: path.join(OUT_DIR, '05_hub_internet_2_colunas_historico_favoritos.png') });

  // =========================================================================
  // 3. INTERNET (INSTALAÇÃO + MENSALIDADE + PROVEDOR) & ENERGIA BASEADA NO PC (FOTO 3)
  // =========================================================================
  await page.evaluate(() => {
    window.navTo('winHardware');
    window.hardwareEngine.setTab('network');
  });
  await hideToast();
  await new Promise((r) => setTimeout(r, 240));

  const netPlansCheck = await page.evaluate(() => {
    const headers = Array.from(document.querySelectorAll('#hardwareExplorerMain thead th')).map((th) => th.textContent.trim());
    const rows = document.querySelectorAll('#hardwareExplorerMain tbody tr').length;
    const firstProviderText = document.querySelector('#hardwareExplorerMain tbody tr td:nth-child(2)')?.innerText || '';
    return { headers, rows, firstProviderText };
  });
  console.log('📡 Planos de Internet (2 valores + Provedor):', netPlansCheck);
  assert.strictEqual(netPlansCheck.rows, 10, 'Deve listar os 10 planos de NET1 a ULTRA1000');
  assert.ok(netPlansCheck.headers.includes('Instalação') && netPlansCheck.headers.includes('Custo Mensal'), 'Colunas Instalação e Custo Mensal presentes');
  assert.ok(netPlansCheck.firstProviderText.includes('Rádio'), 'Nome do provedor exibido junto do plano');

  await page.screenshot({ path: path.join(OUT_DIR, '06_internet_instalacao_mensalidade_provedor.png') });

  // Abrir aba Melhorar Máquina (Peças do PC -> Consumo W + Custo de Energia baseado no PC!)
  await page.evaluate(() => {
    window.hardwareEngine.setTab('upgrade');
    window.hardwareEngine.setUpgradeTarget('pc_main');
    window.hardwareEngine.setUpgradePartCat('cpu');
  });
  await new Promise((r) => setTimeout(r, 240));

  const pcPartsEnergyCheck = await page.evaluate(() => {
    const headers = Array.from(document.querySelectorAll('#hardwareExplorerMain thead th')).map((th) => th.textContent.trim());
    const sampleEnergyCell = document.querySelector('#hardwareExplorerMain tbody tr:nth-child(2) td:nth-child(5)')?.innerText || '';
    return { headers, sampleEnergyCell };
  });
  console.log('⚡ Peças do PC (Consumo W + Custo de Energia no PC):', pcPartsEnergyCheck);
  assert.ok(pcPartsEnergyCheck.headers.includes('Consumo') && pcPartsEnergyCheck.headers.includes('Custo de Energia'), 'Colunas Consumo e Custo de Energia presentes');
  assert.ok(pcPartsEnergyCheck.sampleEnergyCell.includes('/mês luz'), 'Custo de energia calculado com base no PC');

  await page.screenshot({ path: path.join(OUT_DIR, '07_pecas_pc_consumo_watts_custo_energia.png') });

  assert.strictEqual(pageErrors.length, 0, `Erros JS inesperados: ${pageErrors.join(' | ')}`);
  await browser.close();
  console.log('✅ TODAS AS 3 FRENTES VALIDADAS 100% COM ZERO ERROS!');
})().catch((err) => {
  console.error('❌ Falha no teste E2E:', err);
  process.exit(1);
});
