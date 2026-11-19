/**
 * Suíte E2E Visual — Escala de Tempo do Jogo (1h = 1 Dia · 24h = 1 Mês),
 * Chegada Diária das Contas às 12:00 e Limite de 3 Meses (Dias) com Pausa Automática até Reentrar no Jogo!
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const OUT_DIR = path.join(__dirname, '..', 'evidencias', 'game-time-billing');
fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  console.log('🚀 Iniciando Validação E2E de Tempo do Jogo (1h=1d / 24h=1m), Fechamento às 12:00 e Pausa em 3 Meses...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await puppeteer.Browser ? await browser.newPage() : await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto('http://localhost:8080/hacker-city-web/index.html', { waitUntil: 'networkidle2' });

  await page.mouse.move(10, 10);
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
    window.DISABLE_AUTO_TOUR = true;
    await window.enterInstantOperatorMode('OpTempo12h');
    if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
      window.integrityGuard.runAuthorized(() => {
        if (window.currentWallet) window.currentWallet.balance = 15000;
      });
    }
    const toast = document.getElementById('toast');
    if (toast) toast.classList.remove('show');
    window.updateHudDisplays();
    window.navTo('winQuitinete');
  });
  await new Promise((r) => setTimeout(r, 350));

  // 1. Verificar configuração de escala de tempo e tela inicial de Contas & Relógio do Jogo
  const initialCheck = await page.evaluate(() => {
    const cfg = window.GAME_TIME_CONFIG;
    const summary = window.quitineteEngine.getBillingStatusSummary();
    return {
      cfg,
      summary,
      accumText: document.getElementById('quitAccumulatedMonthsVal')?.textContent?.trim() || '',
      countdownText: document.getElementById('quitNextNoonCountdown')?.textContent?.trim() || '',
      totalDueText: document.getElementById('quitTotalDueVal')?.textContent?.trim() || '',
      rowsCount: document.querySelectorAll('#quitineteExplorerMain tbody tr').length
    };
  });

  console.log('🕛 Estado Inicial de Tempo & Contas:', initialCheck);
  assert.strictEqual(initialCheck.cfg.REAL_MS_PER_GAME_DAY, 3600000, '1 Hora real = 1 Dia no jogo (3.600.000 ms)');
  assert.strictEqual(initialCheck.cfg.REAL_MS_PER_GAME_MONTH, 86400000, '1 Dia real (24h) = 1 Mês no jogo (86.400.000 ms)');
  assert.strictEqual(initialCheck.cfg.BILLING_NOON_HOUR, 12, 'Conta chega todo dia às 12:00');
  assert.strictEqual(initialCheck.cfg.MAX_ACCUMULATED_MONTHS, 3, 'Limite máximo de acúmulo = 3 meses (dias)');
  assert.strictEqual(initialCheck.rowsCount, 4, 'Renderiza as 4 contas mensais (Energia PC, Internet & VPS, Aluguel e Água)');
  assert.strictEqual(initialCheck.accumText, '1 / 3 Meses', 'Inicia com 1/3 mês aberto');

  await page.screenshot({ path: path.join(OUT_DIR, '01_contas_relogio_jogo_12h_inicial.png') });

  // 2. Quitar todas as contas em 1 clique (#btnPayAllBills) -> 0/3 Meses (Tudo em Dia)
  await page.click('#btnPayAllBills');
  await new Promise((r) => setTimeout(r, 300));
  await page.evaluate(() => {
    const toast = document.getElementById('toast');
    if (toast) toast.classList.remove('show');
  });

  const paidCheck = await page.evaluate(() => {
    const summary = window.quitineteEngine.getBillingStatusSummary();
    return {
      maxMonths: summary.maxMonths,
      totalDue: summary.totalDue,
      isPaused: summary.isPaused,
      walletBalance: window.currentWallet.balance,
      accumText: document.getElementById('quitAccumulatedMonthsVal')?.textContent?.trim() || ''
    };
  });

  console.log('✅ Após Quitar Tudo:', paidCheck);
  assert.strictEqual(paidCheck.maxMonths, 0, 'Zero meses pendentes após quitar tudo');
  assert.strictEqual(paidCheck.totalDue, 0, 'Total devido zerado');
  assert.strictEqual(paidCheck.accumText, '0 / 3 Meses', 'UI mostra 0 / 3 Meses');

  await page.screenshot({ path: path.join(OUT_DIR, '02_contas_quitadas_aguardando_12h.png') });

  // 3. Simular passagem de 1 dia real cruzando às 12:00 -> chega +1 fatura mensal!
  const oneNoonCheck = await page.evaluate(() => {
    const now = Date.now();
    const oneHourBeforeLastNoon = window.quitineteEngine.getLastNoonMs(now) - (60 * 60 * 1000);

    window.quitineteEngine.cycle.lastEvalMs = oneHourBeforeLastNoon;
    const evalRes = window.quitineteEngine.evaluateNoonBilling(now, false);
    window.quitineteEngine.renderUI('quitineteAppBody', window.currentWallet.balance);
    const summary = window.quitineteEngine.getBillingStatusSummary(now);
    return { evalRes, maxMonths: summary.maxMonths, isPaused: summary.isPaused, totalDue: summary.totalDue };
  });

  console.log('📅 Virada de 1 dia às 12:00:', oneNoonCheck);
  assert.strictEqual(oneNoonCheck.maxMonths, 1, 'Cruzar 1x às 12:00 gera exatamente 1 mês de conta');
  assert.strictEqual(oneNoonCheck.isPaused, false, 'Com 1/3 mês a conta continua ativa (não pausada)');

  // 4. Simular 10 DIAS fora do jogo -> deve acumular NO MÁXIMO 3 meses (dias) e PAUSAR automaticamente!
  const tenDaysAwayCheck = await page.evaluate(() => {
    const toast = document.getElementById('toast');
    if (toast) toast.classList.remove('show');

    const now = Date.now();
    const tenDaysAgo = now - (10 * 24 * 60 * 60 * 1000);
    window.quitineteEngine.cycle.lastEvalMs = tenDaysAgo;
    window.quitineteEngine.cycle.isPaused = false;

    // Simula que passaram 5 dias offline (bateu 3 e pausou):
    const fiveDaysAgo = now - (5 * 24 * 60 * 60 * 1000);
    window.quitineteEngine.evaluateNoonBilling(fiveDaysAgo, false);

    // Enquanto ainda NÃO entrou no jogo novamente, passam mais 5 dias (deve continuar 100% congelado em 3 meses!):
    const whileStillOffline = window.quitineteEngine.evaluateNoonBilling(now - 60000, false);

    // Agora o jogador ENTRA no jogo novamente:
    const summaryOnLogin = window.quitineteEngine.onPlayerEnteredGame(now);
    window.quitineteEngine.renderUI('quitineteAppBody', window.currentWallet.balance);
    if (window.onlineEngine) window.onlineEngine.saveLocalSnapshotImmediate();

    return {
      whileStillOffline,
      summaryOnLogin,
      bannerVisible: !!document.getElementById('quitPausedCapBanner'),
      bannerText: document.getElementById('quitPausedCapBanner')?.textContent?.trim() || '',
      accumText: document.getElementById('quitAccumulatedMonthsVal')?.textContent?.trim() || ''
    };
  });

  console.log('⏸ Após 10 dias offline (Teto de 3 Meses + Pausa Automática):', tenDaysAwayCheck);
  assert.strictEqual(tenDaysAwayCheck.summaryOnLogin.maxMonths, 3, 'Mesmo após 10 dias offline, trava estritamente em 3 meses');
  assert.strictEqual(tenDaysAwayCheck.summaryOnLogin.isPaused, true, 'Conta entra em estado PAUSADO ao atingir 3 meses');
  assert.strictEqual(tenDaysAwayCheck.whileStillOffline.crossingsApplied, 0, 'Enquanto pausado fora do jogo, zero novos dias são cobrados');
  assert.ok(tenDaysAwayCheck.bannerVisible, 'Banner âmbar de Conta Pausada em 3 Meses aparece na UI');
  assert.strictEqual(tenDaysAwayCheck.accumText, '3 / 3 Meses', 'Indicador exibe 3 / 3 Meses');

  // Hover no card de 3 / 3 Meses p/ evidenciar o tooltip também
  const capTile = await page.$('#quitineteExplorerMain .hw-total-strip .hw-total-tile:nth-child(3)');
  if (capTile) await capTile.hover();
  await new Promise((r) => setTimeout(r, 220));

  await page.screenshot({ path: path.join(OUT_DIR, '03_limite_3_meses_conta_pausada.png') });

  // 5. Verificar aviso na Home, depois regularizar (Quitar Tudo), dar F5 e testar que o ciclo volta a contar no próximo 12:00!
  await page.mouse.move(10, 10);
  const homePausedText = await page.evaluate(() => {
    window.navTo('winHome');
    return document.getElementById('homeBody')?.textContent || '';
  });
  assert.ok(homePausedText.includes('Contas pausadas em 3/3 meses'), 'Tela Inicial (Início) informa claramente que as contas estão pausadas em 3/3 meses');
  await new Promise((r) => setTimeout(r, 220));
  await page.screenshot({ path: path.join(OUT_DIR, '04_inicio_aviso_pausa_3_meses.png') });

  // Voltar p/ Contas, quitar os 3 meses acumulados, recarregar com F5 e validar retomada do ciclo às 12:00
  await page.evaluate(async () => {
    window.navTo('winQuitinete');
    await window.payAllQuitineteBills();
  });
  await new Promise((r) => setTimeout(r, 250));

  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 450));

  const afterReloadAndResume = await page.evaluate(() => {
    const afterF5 = window.quitineteEngine.getBillingStatusSummary();
    // Simula próximo dia às 12:05 após o jogador já ter entrado novamente e regularizado:
    const now = Date.now();
    const beforeLastNoon = window.quitineteEngine.getLastNoonMs(now) - (30 * 60 * 1000);
    window.quitineteEngine.cycle.lastEvalMs = beforeLastNoon;
    const nextCycle = window.quitineteEngine.evaluateNoonBilling(now, false);
    const resumedSummary = window.quitineteEngine.getBillingStatusSummary(now);
    return {
      afterF5MaxMonths: afterF5.maxMonths,
      afterF5Paused: afterF5.isPaused,
      nextCycle,
      resumedMonths: resumedSummary.maxMonths,
      resumedPaused: resumedSummary.isPaused
    };
  });

  console.log('🔄 Persistência F5 + Retomada do Ciclo após entrar no game:', afterReloadAndResume);
  assert.strictEqual(afterReloadAndResume.afterF5MaxMonths, 0, 'F5 preservou as contas quitadas (0/3)');
  assert.strictEqual(afterReloadAndResume.afterF5Paused, false, 'F5 manteve pausa desativada após regularização');
  assert.strictEqual(afterReloadAndResume.resumedMonths, 1, 'Ciclo voltou a contar normalmente na virada seguinte das 12:00 (0 -> 1)');
  assert.strictEqual(afterReloadAndResume.resumedPaused, false, 'Segue ativo com 1/3 mês');

  assert.strictEqual(pageErrors.length, 0, `Sem erros JS na página (encontrados: ${pageErrors.join('; ')})`);

  await browser.close();
  console.log('🎉 TODOS OS TESTES DE ESCALA DE TEMPO (1h=1d / 24h=1m), CONTA ÀS 12:00 E PAUSA EM 3 MESES PASSARAM COM SUCESSO!');
})();
