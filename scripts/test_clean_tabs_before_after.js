/**
 * Suíte E2E Visual — Validação e Captura "DEPOIS" das 7 Abas Padronizadas no Visual Limpo & Intuitivo
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const OUT = path.join(__dirname, '..', 'evidencias', 'tabs-before-after');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  console.log('🚀 Iniciando Validação E2E das Abas Padronizadas (DEPOIS)...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto('http://localhost:8080/hacker-city-web/index.html', { waitUntil: 'networkidle2' });

  await page.evaluate(async () => {
    localStorage.clear();
    localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
    window.DISABLE_AUTO_TOUR = true;
    await window.enterInstantOperatorMode();
    if (window.hackedDb) {
      window.hackedDb.upsertHost({ ip: '198.51.100.42', hostname: 'Servidor Treinamento Numataka', kind: 'tutorial', tier: 1, accessMethod: 'password', sshUser: 'root', password: 'nmtk4288', cpuSpec: '1000 MHz' });
      window.hackedDb.upsertHost({ ip: '203.17.88.40', hostname: 'Farofa Systems S.A.', kind: 'empresa', tier: 1, accessMethod: 'password', sshUser: 'root', password: 'frfa9012', cpuSpec: '1600 MHz', analyzedHw: '1600 MHz CPU · 512 MB RAM' });
    }
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
  });
  await new Promise((r) => setTimeout(r, 450));

  const hideToast = () => page.evaluate(() => {
    const t = document.getElementById('globalToast');
    if (t) t.style.display = 'none';
    const tip = document.getElementById('hcHoverMiniTab');
    if (tip) tip.classList.remove('visible');
  });

  // 1. Hardware (Meu Servidor + Comprar CPU com hover Mini-Aba)
  await page.evaluate(() => window.navTo('winHardware'));
  await new Promise((r) => setTimeout(r, 300));
  await hideToast();
  const hwCheck = await page.evaluate(() => ({
    hasFrame: !!document.getElementById('hardwareExplorerMain'),
    hasDonut: !!document.querySelector('#hardwareExplorerMain .soft-donut-svg'),
    rows: document.querySelectorAll('#hardwareExplorerMain .soft-table tbody tr').length
  }));
  assert(hwCheck.hasFrame && hwCheck.hasDonut && hwCheck.rows === 4, 'Hardware deve exibir Meu Servidor em tabela limpa + Donut');
  await page.screenshot({ path: path.join(OUT, '02_hardware_depois.png') });
  console.log('📸 02_hardware_depois.png');

  await page.evaluate(() => window.hardwareEngine.setTab('cpu'));
  await new Promise((r) => setTimeout(r, 200));
  const cpuTrigger = await page.$('#hardwareExplorerMain tbody tr:nth-child(2) .soft-name-trigger');
  if (cpuTrigger) await cpuTrigger.hover();
  await new Promise((r) => setTimeout(r, 150));
  await page.screenshot({ path: path.join(OUT, '02b_hardware_cpu_hover_depois.png') });
  console.log('📸 02b_hardware_cpu_hover_depois.png');

  // 2. Meus Rastros & Avisos (Log File)
  await hideToast();
  await page.evaluate(() => window.navTo('winLogs'));
  await new Promise((r) => setTimeout(r, 300));
  const logsCheck = await page.evaluate(() => ({
    hasFrame: !!document.getElementById('logsExplorerMain'),
    hasDonut: !!document.querySelector('#logsExplorerMain .soft-donut-svg'),
    hasEditor: !!document.getElementById('localSyslogTextarea')
  }));
  assert(logsCheck.hasFrame && logsCheck.hasDonut && logsCheck.hasEditor, 'Logs deve exibir frame limpo + Donut Status de Exposição');
  await page.screenshot({ path: path.join(OUT, '03_logs_depois.png') });
  console.log('📸 03_logs_depois.png');

  // 3. Senhas Descobertas (Hacked Database)
  await page.evaluate(() => window.navTo('winHackedDb'));
  await new Promise((r) => setTimeout(r, 300));
  const hdbIcon = await page.$('#hackedDbExplorerMain .soft-icon-act.ic-run');
  if (hdbIcon) await hdbIcon.hover();
  await new Promise((r) => setTimeout(r, 160));
  const hdbCheck = await page.evaluate(() => ({
    hasFrame: !!document.getElementById('hackedDbExplorerMain'),
    hasDonut: !!document.querySelector('#hackedDbExplorerMain .soft-donut-svg'),
    tipVisible: !!document.getElementById('hcHoverMiniTab')?.classList.contains('visible')
  }));
  assert(hdbCheck.hasFrame && hdbCheck.hasDonut && hdbCheck.tipVisible, 'Hacked DB deve exibir ícones compactos com Mini-Aba Hover');
  await page.screenshot({ path: path.join(OUT, '04_hacked_db_depois.png') });
  console.log('📸 04_hacked_db_depois.png');

  // 4. Finanças & Bancos
  await hideToast();
  await page.evaluate(() => window.navTo('winBank'));
  await new Promise((r) => setTimeout(r, 300));
  const bankCheck = await page.evaluate(() => ({
    hasFrame: !!document.getElementById('bankExplorerMain'),
    hasDonut: !!document.querySelector('#bankExplorerMain .soft-donut-svg'),
    noPostgresDebug: !(document.getElementById('bankExplorerMain')?.innerText || '').includes('POSTGRESQL')
  }));
  assert(bankCheck.hasFrame && bankCheck.hasDonut && bankCheck.noPostgresDebug, 'Banco deve exibir tabela limpa dos 5 bancos + Donut sem debug POSTGRESQL');
  await page.screenshot({ path: path.join(OUT, '05_bank_depois.png') });
  console.log('📸 05_bank_depois.png');

  // 5. Missões & Contratos (com hover Mini-Aba no briefing)
  await hideToast();
  await page.evaluate(() => window.navTo('winMissions'));
  await new Promise((r) => setTimeout(r, 300));
  const missionTrigger = await page.$('#missionsExplorerMain tbody tr:first-child .soft-name-trigger');
  if (missionTrigger) await missionTrigger.hover();
  await new Promise((r) => setTimeout(r, 160));
  await page.screenshot({ path: path.join(OUT, '06_missions_depois.png') });
  console.log('📸 06_missions_depois.png');

  // 6. Universidade (com Donut Progresso Acadêmico e sem strings debug)
  await hideToast();
  await page.evaluate(() => window.navTo('winUniversity'));
  await new Promise((r) => setTimeout(r, 300));
  const uniTrigger = await page.$('#universityExplorerMain tbody tr:nth-child(2) .soft-name-trigger');
  if (uniTrigger) await uniTrigger.hover();
  await new Promise((r) => setTimeout(r, 160));
  const uniCheck = await page.evaluate(() => ({
    hasFrame: !!document.getElementById('universityExplorerMain'),
    noLockDebug: !(document.getElementById('universityExplorerMain')?.innerText || '').includes('DDoS:LOCK')
  }));
  assert(uniCheck.hasFrame && uniCheck.noLockDebug, 'Universidade deve exibir tabela limpa sem DDoS:LOCK debug');
  await page.screenshot({ path: path.join(OUT, '07_university_depois.png') });
  console.log('📸 07_university_depois.png');

  // 7. Ranking & Medalhas
  await hideToast();
  await page.evaluate(() => window.navTo('winRanking'));
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: path.join(OUT, '08_ranking_depois.png') });
  console.log('📸 08_ranking_depois.png');

  assert.strictEqual(pageErrors.length, 0, 'Erros JS encontrados: ' + pageErrors.join('; '));
  await browser.close();
  console.log('✅ Todas as 7 abas padronizadas e capturadas com 0 erros JS!');
})();
