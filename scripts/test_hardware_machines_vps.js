/**
 * Suíte E2E Visual — Hardware Multi-Máquinas:
 * PC Principal + VPS + Potencial Total de todas as máquinas + Ver Separado (Potência, Consumo W e Gasto $/dia)
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const OUT_DIR = path.join(__dirname, '..', 'evidencias', 'hardware-machines-vps');
fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  console.log('🚀 Iniciando Validação E2E de Hardware Multi-Máquinas (PC Principal + VPS + Potencial Total + Consumo/Gasto)...');
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
        if (window.currentWallet) window.currentWallet.balance = 12000;
      });
    }
    const toast = document.getElementById('toast');
    if (toast) toast.classList.remove('show');
    if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
    window.navTo('winHardware');
  });
  await new Promise((r) => setTimeout(r, 350));

  // 1. Estado inicial: Potencial Total somando PC Principal #1 + VPS #1
  const initialFleet = await page.evaluate(() => {
    const fleet = window.hardwareEngine.getMachinesFleet();
    const sum = window.hardwareEngine.getFleetSummary(fleet);
    return {
      fleetCount: fleet.length,
      names: fleet.map((m) => m.name),
      sum,
      topCpu: document.getElementById('hwMetricCpu')?.textContent || '',
      topWatts: document.getElementById('hwMetricWatts')?.textContent || '',
      topCost: document.getElementById('hwMetricCost')?.textContent || '',
      cardsCount: document.querySelectorAll('.hw-machine-card').length,
      pcIpBlurred: !!document.querySelector('#hwCard_pc_main .my-ip-blur-tail')
    };
  });

  console.log('📊 Frota Inicial & Potencial Total:', initialFleet);
  assert.strictEqual(initialFleet.fleetCount, 2, 'Deve iniciar com PC Principal #1 + VPS #1');
  assert.strictEqual(initialFleet.cardsCount, 2, 'Deve renderizar 2 cards individuais de máquinas');
  assert.ok(initialFleet.pcIpBlurred, 'IP do PC Principal no card de Hardware permanece protegido com blur');
  assert.strictEqual(initialFleet.topWatts, `${initialFleet.sum.watts} W`, 'Consumo Total no topo bate com a soma das máquinas');
  assert.strictEqual(initialFleet.topCost, `$${initialFleet.sum.dailyCost}/dia`, 'Gasto Total no topo bate com a soma das máquinas');

  await page.screenshot({ path: path.join(OUT_DIR, '01_potencial_total_pc_principal_e_vps.png') });

  // 2. Clicar em "Ver Separado" na VPS #1 -> topo e lateral isolam apenas a VPS + hover no Gasto Operacional!
  const vpsId = await page.evaluate(() => {
    const fleet = window.hardwareEngine.getMachinesFleet();
    return fleet.find((m) => !m.isPrimaryPc)?.id;
  });
  await page.click(`#hwScope_${vpsId}`);
  await new Promise((r) => setTimeout(r, 220));

  const costPill = await page.$(`#hwCard_${vpsId} .hw-mc-foot-grid .hw-mc-stat-pill:nth-child(2)`);
  if (costPill) await costPill.hover();
  await new Promise((r) => setTimeout(r, 200));

  const isolatedCheck = await page.evaluate((id) => {
    const m = window.hardwareEngine.getMachinesFleet().find((x) => x.id === id);
    return {
      vpsCpu: m.cpuMhz,
      vpsWatts: m.watts,
      vpsCost: m.dailyCost,
      shownCpu: document.getElementById('hwMetricCpu')?.textContent || '',
      shownWatts: document.getElementById('hwMetricWatts')?.textContent || '',
      shownCost: document.getElementById('hwMetricCost')?.textContent || '',
      tipVisible: document.getElementById('hcHoverMiniTab')?.classList.contains('visible') || false
    };
  }, vpsId);

  console.log('🔍 Visão Isolada da VPS #1:', isolatedCheck);
  assert.strictEqual(isolatedCheck.shownWatts, `${isolatedCheck.vpsWatts} W`, 'Topo mostra exatamente o consumo separado da VPS');
  assert.strictEqual(isolatedCheck.shownCost, `$${isolatedCheck.vpsCost}/dia`, 'Topo mostra exatamente o gasto separado da VPS');
  assert.ok(isolatedCheck.tipVisible, 'Hover na pílula de gasto abre a Mini-Aba detalhando custos');

  await page.screenshot({ path: path.join(OUT_DIR, '02_ver_separado_potencia_consumo_gasto_vps.png') });

  // 3. Abrir aba "Comprar VPS" e contratar uma nova VPS Cloud Starter ($2.500) -> Potencial Total sobe p/ 3 máquinas!
  await page.mouse.move(10, 10);
  await page.click('#hwTabBuyVps');
  await new Promise((r) => setTimeout(r, 220));
  await page.screenshot({ path: path.join(OUT_DIR, '03_aba_comprar_vps_catalogo.png') });

  await page.click('#btnBuyServer_vps_starter');
  await new Promise((r) => setTimeout(r, 280));
  await page.evaluate(() => {
    const toast = document.getElementById('toast');
    if (toast) toast.classList.remove('show');
  });

  const afterBuyVps = await page.evaluate(() => {
    const fleet = window.hardwareEngine.getMachinesFleet();
    const sum = window.hardwareEngine.getFleetSummary(fleet);
    return {
      count: fleet.length,
      sumCpu: sum.cpuMhz,
      sumWatts: sum.watts,
      sumCost: sum.dailyCost,
      cardsCount: document.querySelectorAll('.hw-machine-card').length
    };
  });

  console.log('☁️ Após Contratar Nova VPS:', afterBuyVps);
  assert.strictEqual(afterBuyVps.count, 3, 'Agora deve ter 3 máquinas (1 PC Principal + 2 VPS)');
  assert.strictEqual(afterBuyVps.cardsCount, 3, '3 cards renderizados na grade');
  assert.ok(afterBuyVps.sumCpu > initialFleet.sum.cpuMhz, 'Potencial Total de CPU aumentou após comprar nova VPS');
  assert.ok(afterBuyVps.sumWatts > initialFleet.sum.watts, 'Consumo Total aumentou proporcionalmente');
  assert.ok(afterBuyVps.sumCost > initialFleet.sum.dailyCost, 'Gasto diário total aumentou proporcionalmente');

  await page.screenshot({ path: path.join(OUT_DIR, '04_tres_maquinas_potencial_total_atualizado.png') });

  // 4. Clicar em "Melhorar" no PC Principal #1 e comprar CPU Pentium 4 ($950)
  await page.click('#hwCard_pc_main .btn-upgrade-machine');
  await new Promise((r) => setTimeout(r, 220));
  await page.screenshot({ path: path.join(OUT_DIR, '05_aba_melhorar_maquina_individual.png') });

  const buyCpuBtn = await page.$('#hardwareExplorerMain .soft-icon-act.ic-run:not([disabled])');
  assert(buyCpuBtn, 'Deve haver botão habilitado para comprar upgrade de CPU no PC Principal');
  await buyCpuBtn.click();
  await new Promise((r) => setTimeout(r, 280));

  const afterUpgrade = await page.evaluate(() => {
    const pc = window.hardwareEngine.getMachinesFleet().find((m) => m.isPrimaryPc);
    return { pcCpu: pc.cpuMhz, pcWatts: pc.watts, pcCost: pc.dailyCost };
  });
  assert.strictEqual(afterUpgrade.pcCpu, 2000, 'PC Principal subiu para 2.000 MHz após upgrade');

  // 5. Conferir aba Internet
  await page.click('#hwTabNetwork');
  await new Promise((r) => setTimeout(r, 200));
  const netRows = await page.$$eval('#hardwareExplorerMain tbody tr', (trs) => trs.length);
  assert.strictEqual(netRows, 5, 'Aba Internet lista os 5 planos de velocidade com consumo e gasto');
  await page.screenshot({ path: path.join(OUT_DIR, '06_aba_internet_planos_consumo_gasto.png') });

  assert.strictEqual(pageErrors.length, 0, `Erros JS inesperados: ${pageErrors.join(' | ')}`);
  await browser.close();
  console.log('✅ TODOS OS TESTES DE HARDWARE MULTI-MÁQUINAS (PC + VPS + POTENCIAL TOTAL + CONSUMO/GASTO) PASSARAM COM ZERO ERROS!');
})().catch((err) => {
  console.error('❌ Falha no teste E2E de Hardware Multi-Máquinas:', err);
  process.exit(1);
});
