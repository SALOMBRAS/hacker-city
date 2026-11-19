/**
 * Suíte E2E Visual — Ação Acontecendo (Estilo Foto 1), Tabela por Ícones Compactos (Estilo Foto 2)
 * e Mini-Aba Flutuante no Hover (#hcHoverMiniTab) em Meu PC e no PC Invadido
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const OUT_DIR = path.join(__dirname, '..', 'evidencias', 'actions-minitab');
fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  console.log('🚀 Iniciando Validação E2E de Fila de Ações ao Vivo, Ícones Compactos e Mini-Aba Hover...');
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
    if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
      window.integrityGuard.runAuthorized(() => {
        if (window.currentWallet) window.currentWallet.balance = 2000;
      });
    }
    if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
  });
  await new Promise((r) => setTimeout(r, 450));

  // 1. Abrir Meus Programas e clicar na engrenagem ⚙️ de Rodar o Cracker.crc -> abre Fila de Ações ao vivo (Foto 1)!
  await page.evaluate(() => {
    window.navTo('winSoftware');
    window.softwareEngine.activeTab = 'inventory';
    window.softwareEngine.renderUI();
  });
  await new Promise((r) => setTimeout(r, 250));

  await page.click('#btnToggleInstall_cracker');
  await new Promise((r) => setTimeout(r, 650));

  const tmLiveCheck = await page.evaluate(() => {
    const row = document.querySelector('#taskManagerMainFrame .tm-process-row');
    const pct = row?.querySelector('.tm-bar-pct')?.textContent || '';
    const eta = row?.querySelector('.tm-bar-eta')?.textContent || '';
    const share = row?.querySelector('.tm-share-col')?.innerText || '';
    const cancel = !!row?.querySelector('.tm-cancel-btn');
    return {
      currentWin: window.winManager?.current,
      hasRow: !!row,
      label: row?.querySelector('.tm-proc-label')?.innerText || '',
      pct,
      eta,
      share,
      cancel
    };
  });
  console.log('Ação acontecendo (Foto 1):', tmLiveCheck);
  assert.strictEqual(tmLiveCheck.currentWin, 'winTaskManager', 'Deve abrir Fila de Ações mostrando a ação acontecendo');
  assert(tmLiveCheck.hasRow && tmLiveCheck.label.includes('Cracker.crc'), 'Deve mostrar barra de progresso de Cracker.crc em localhost');
  assert(/\d+\.\d+%/.test(tmLiveCheck.pct), 'Deve exibir porcentagem decimal ex: 63.4%');
  assert(/0h:0m:\d+s/.test(tmLiveCheck.eta), 'Deve exibir contagem regressiva ex: 0h:0m:1s');
  assert(tmLiveCheck.cancel, 'Deve exibir botão circular vermelho de cancelar');

  await page.screenshot({ path: path.join(OUT_DIR, '01_acao_acontecendo_rodando_programa.png') });
  console.log('📸 01_acao_acontecendo_rodando_programa.png');

  // 2. Aguardar término da ação -> retorna automaticamente para Programas com faixa verde "Sucesso!" e ícones limpos (Foto 2)!
  await page.waitForFunction(
    () => window.winManager?.current === 'winSoftware' && !!document.getElementById('softFeedbackBanner'),
    { timeout: 6000 }
  );
  await new Promise((r) => setTimeout(r, 250));

  const afterRunCheck = await page.evaluate(() => {
    const banner = document.getElementById('softFeedbackBanner')?.innerText || '';
    const crcRunning = !!window.softwareEngine.state.inventory.cracker.installed;
    const iconBtns = document.querySelectorAll('#softwareExplorerMain .soft-table .soft-icon-act').length;
    return { banner, crcRunning, iconBtns };
  });
  console.log('Retorno após ação (Foto 2):', afterRunCheck);
  assert(afterRunCheck.banner.includes('Sucesso!'), 'Deve mostrar banner verde de Sucesso! no topo');
  assert(afterRunCheck.crcRunning, 'Cracker.crc deve ficar marcado como rodando em 2º plano');
  assert(afterRunCheck.iconBtns >= 24, 'Deve renderizar ícones puros de ação para todos os programas');

  await page.screenshot({ path: path.join(OUT_DIR, '02_meus_programas_icones_e_sucesso.png') });
  console.log('📸 02_meus_programas_icones_e_sucesso.png');

  // 3. Passar o mouse sobre o nome/ícone do app (Cracker.crc) -> abre Mini-Aba flutuante (#hcHoverMiniTab) dizendo o nome e o que faz!
  const crcNameTrigger = await page.$('#softwareExplorerMain tbody tr.row-running .soft-name-trigger');
  assert(crcNameTrigger, 'Deve encontrar o gatilho de nome do programa');
  await crcNameTrigger.hover();
  await new Promise((r) => setTimeout(r, 180));

  const appHoverTip = await page.evaluate(() => {
    const tip = document.getElementById('hcHoverMiniTab');
    return {
      visible: !!(tip && tip.classList.contains('visible')),
      title: tip?.querySelector('.mht-title')?.innerText || '',
      desc: tip?.querySelector('.mht-desc')?.innerText || ''
    };
  });
  console.log('Mini-Aba Hover no App:', appHoverTip);
  assert(appHoverTip.visible && appHoverTip.title.includes('Quebrador de Senhas'), 'Hover no app deve abrir Mini-Aba com nome e resumo');

  await page.screenshot({ path: path.join(OUT_DIR, '03_hover_mini_aba_nome_do_app.png') });
  console.log('📸 03_hover_mini_aba_nome_do_app.png');

  // 4. Passar o mouse sobre um ícone de ação (Esconder programa 👁️) -> abre Mini-Aba explicando a ação!
  const hideBtn = await page.$('#softwareExplorerMain .soft-icon-act.ic-hide');
  assert(hideBtn, 'Deve encontrar ícone de Esconder');
  await hideBtn.hover();
  await new Promise((r) => setTimeout(r, 180));

  const actHoverTip = await page.evaluate(() => {
    const tip = document.getElementById('hcHoverMiniTab');
    return {
      visible: !!(tip && tip.classList.contains('visible')),
      title: tip?.querySelector('.mht-title')?.innerText || '',
      desc: tip?.querySelector('.mht-desc')?.innerText || ''
    };
  });
  console.log('Mini-Aba Hover no Ícone de Ação:', actHoverTip);
  assert(actHoverTip.visible && actHoverTip.title.includes('Esconder'), 'Hover no ícone deve abrir Mini-Aba explicando a ação');

  await page.screenshot({ path: path.join(OUT_DIR, '04_hover_mini_aba_icone_acao.png') });
  console.log('📸 04_hover_mini_aba_icone_acao.png');

  // 5. Invadir 198.51.100.42, liberar amostra Spam.vspam e subir vírus p/ o outro PC -> mostra barra estilo Foto 1 ao vivo!
  await page.evaluate(() => {
    window.navTo('winBrowser');
    window.softwareEngine.grantTutorialStarterSample();
    const host = window.internetEngine.resolveHost('198.51.100.42');
    window.internetEngine.onAttackSucceeded(host, 'password', host.rootPassword, 'root');
    window.internetEngine.activeTab = 'entrar';
    window.internetEngine.sshSubTab = 'files';
    window.internetEngine.render();
  });
  await new Promise((r) => setTimeout(r, 250));

  await page.click('#btnUploadVirusStage');
  await new Promise((r) => setTimeout(r, 500));

  const uploadBarCheck = await page.evaluate(() => {
    const inlineRow = document.querySelector('#internetAppBody .tm-process-row');
    return {
      hasInlineRow: !!inlineRow,
      text: inlineRow?.innerText || ''
    };
  });
  console.log('Subindo vírus p/ outro PC:', uploadBarCheck);
  assert(uploadBarCheck.hasInlineRow && uploadBarCheck.text.includes('Subir arquivo'), 'Subir vírus para outro PC deve exibir barra estilo Foto 1');

  await page.screenshot({ path: path.join(OUT_DIR, '05_acao_subindo_virus_outro_pc.png') });
  console.log('📸 05_acao_subindo_virus_outro_pc.png');

  // Aguardar upload concluir -> clicar na engrenagem ⚙️ de Rodar o vírus no PC da vítima -> mostra barra "Executar vírus..." ao vivo!
  await page.waitForFunction(
    () => (window.softwareEngine.getStagedVirusesOnIp('198.51.100.42') || []).length > 0,
    { timeout: 14000 }
  );
  await new Promise((r) => setTimeout(r, 250));

  await page.click('#remoteTargetSpecsCard .soft-icon-act.ic-run');
  await new Promise((r) => setTimeout(r, 450));

  const execVirusBarCheck = await page.evaluate(() => {
    const inlineRow = document.querySelector('#internetAppBody .tm-process-row');
    return {
      hasInlineRow: !!inlineRow,
      text: inlineRow?.innerText || ''
    };
  });
  console.log('Rodando vírus no PC da vítima:', execVirusBarCheck);
  assert(execVirusBarCheck.hasInlineRow && execVirusBarCheck.text.includes('Executar vírus'), 'Rodar vírus deve exibir barra estilo Foto 1');

  await page.screenshot({ path: path.join(OUT_DIR, '06_acao_rodando_virus_outro_pc.png') });
  console.log('📸 06_acao_rodando_virus_outro_pc.png');

  // Aguardar vírus entrar em execução e passar o mouse no ícone ⬇️ de Download de programa da vítima!
  await page.waitForFunction(
    () => (window.softwareEngine.getRemoteVirusesOnIp('198.51.100.42') || []).length > 0,
    { timeout: 6000 }
  );
  await new Promise((r) => setTimeout(r, 250));

  const dlBtn = await page.$('#remoteTargetSpecsCard .soft-icon-act.ic-dl');
  assert(dlBtn, 'Deve ter ícone de Download no PC invadido');
  await dlBtn.hover();
  await new Promise((r) => setTimeout(r, 180));

  const dlHoverCheck = await page.evaluate(() => {
    const tip = document.getElementById('hcHoverMiniTab');
    return {
      visible: !!(tip && tip.classList.contains('visible')),
      title: tip?.querySelector('.mht-title')?.innerText || '',
      desc: tip?.querySelector('.mht-desc')?.innerText || ''
    };
  });
  console.log('Mini-Aba Hover em Download no PC Invadido:', dlHoverCheck);
  assert(dlHoverCheck.visible && dlHoverCheck.title.includes('Download'), 'Hover no ícone de Download no PC invadido deve exibir Mini-Aba');

  await page.screenshot({ path: path.join(OUT_DIR, '07_pc_invadido_icones_e_hover_download.png') });
  console.log('📸 07_pc_invadido_icones_e_hover_download.png');

  assert.strictEqual(pageErrors.length, 0, 'Erros JS encontrados: ' + pageErrors.join('; '));
  await browser.close();
  console.log('✅ Suíte E2E de Ações ao Vivo, Ícones Compactos e Mini-Aba Hover 100% aprovada com 0 erros!');
})();
