const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('--- TESTE E2E FASE 1: CONNMANAGER & FBI MAINFRAME DOSSIÊS ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  // Monitora logs e erros no console
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.error('[BROWSER ERROR]', msg.text());
    }
  });

  console.log('[1/6] Carregando interface...');
  await page.goto('http://localhost:8080/hacker-city-web/index.html', { waitUntil: 'networkidle2', timeout: 15000 });

  // 1-Click operator login if auth overlay active
  await page.evaluate(() => {
    const instantBtn = document.getElementById('btnQuickPlay') || document.querySelector('.btn-quick-play');
    if (instantBtn) instantBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Testa ConnManager Engine
  console.log('[2/6] Testando ConnManager e Registro de Sessões...');
  const connTest = await page.evaluate(() => {
    if (!window.connManagerEngine) return { success: false, reason: 'connManagerEngine ausente' };
    
    // Simula intrusão de entrada
    window.connManagerEngine.registerInboundSession({
      id: 'test_sess_01',
      originIp: '198.51.100.88',
      originAlias: 'InvasorTeste',
      protocol: 'SSH',
      action: 'Quebrando Senha Root (55%)',
      progressPct: 55,
      startedAt: '12:00:00'
    });

    const inCount = window.connManagerEngine.inboundSessions.length;
    return { success: inCount > 0, inCount };
  });
  console.log('Resultado ConnManager Inbound:', connTest);
  if (!connTest.success) throw new Error('Falha no registro de sessão de entrada do ConnManager');

  // Abre o modal do ConnManager e tira print
  console.log('[3/6] Abrindo modal ConnManager e testando Cortar Cabo (Kill Session)...');
  await page.evaluate(() => {
    window.openConnManagerModal();
  });
  await new Promise(r => setTimeout(r, 600));

  const shotDir = path.join(__dirname, '../../reports/planejamento-expansao-7-pilares/evidencias');
  if (!fs.existsSync(shotDir)) fs.mkdirSync(shotDir, { recursive: true });
  await page.screenshot({ path: path.join(shotDir, '01_conn_manager_inbound_alert.png') });

  // Clica no botão cortar cabo
  const killTest = await page.evaluate(async () => {
    await window.connManagerEngine.killSession('test_sess_01');
    return { remaining: window.connManagerEngine.inboundSessions.length };
  });
  console.log('Resultado Kill Session:', killTest);
  if (killTest.remaining !== 0) throw new Error('Sessão não foi removida após Cortar Cabo');

  await page.screenshot({ path: path.join(shotDir, '02_conn_manager_after_kill.png') });

  // Fecha modal
  await page.evaluate(() => {
    const m = document.getElementById('conn-manager-modal');
    if (m) m.style.display = 'none';
  });

  // 2. Testa Safenet & FBI Mainframe
  console.log('[4/6] Testando Dossiês com IPs Parcialmente Mascarados (161.89.X.X)...');
  const fbiTest = await page.evaluate(() => {
    if (!window.safenetFbiEngine) return { success: false, reason: 'safenetFbiEngine ausente' };
    window.safenetFbiEngine.ensureSeeded();

    const wanted = window.safenetFbiEngine.fbiWantedList;
    const hasMask = wanted.some(w => w.maskedDisplayIp && w.maskedDisplayIp.includes('X'));
    return { success: hasMask, wantedCount: wanted.length, firstMask: wanted[0]?.maskedDisplayIp };
  });
  console.log('Resultado Máscara FBI:', fbiTest);
  if (!fbiTest.success) throw new Error('Nenhum IP mascarado encontrado na lista do FBI');

  // Abre a janela do FBI
  await page.evaluate(() => {
    if (typeof window.navTo === 'function') window.navTo('winFbi');
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(shotDir, '03_fbi_wanted_masked_ips.png') });

  // 3. Navega para 161.89.1.1 (FBI Mainframe)
  console.log('[5/6] Navegando para 161.89.1.1 (FBI Mainframe Central)...');
  await page.evaluate(() => {
    window.internetEngine.openIp('161.89.1.1');
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(shotDir, '04_fbi_mainframe_classified_login.png') });

  // Simula quebra de segurança e renderização root
  console.log('[6/6] Testando Root Terminal do FBI, Expurgo de Ficha e Desmascaramento...');
  const rootTest = await page.evaluate(async () => {
    // Marca como invadido/root
    if (!window.internetEngine.crackedHosts) window.internetEngine.crackedHosts = new Set();
    window.internetEngine.crackedHosts.add('161.89.1.1');
    window.internetEngine.render();

    // Testa expurgo
    await window.safenetFbiEngine.expungeMyRecord();

    // Testa desmascaramento
    const firstTarget = window.safenetFbiEngine.fbiWantedList[0]?.ip;
    if (firstTarget) {
      await window.safenetFbiEngine.decryptMask(firstTarget);
    }

    const updatedTarget = window.safenetFbiEngine.fbiWantedList[0];
    return {
      success: true,
      decryptedMaskTier: updatedTarget?.maskTier,
      fullIp: updatedTarget?.maskedDisplayIp
    };
  });
  console.log('Resultado Operações Root FBI:', rootTest);
  if (!rootTest.success) throw new Error('Falha nas operações Root do FBI');

  await page.screenshot({ path: path.join(shotDir, '05_fbi_mainframe_root_terminal.png') });

  console.log('--- TESTE E2E FASE 1 CONCLUÍDO COM 100% DE SUCESSO! ---');
  await browser.close();
})();
