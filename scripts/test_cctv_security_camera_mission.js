/**
 * Suíte E2E Visual Completa — Missões de Invasão a Câmeras de Segurança:
 * 1) Desativar as Câmeras de uma Empresa para Ajudar um Roubo (Apagão CFTV + Sem Sinal)
 * 2) Apagar Gravações Comprometedoras do DVR de uma Empresa (/var/nvr/recordings + Playback Ao Vivo)
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const OUT_DIR = path.join(__dirname, '..', 'evidencias', 'cctv-security-cameras');
fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  console.log('🚀 Iniciando Validação E2E: (1) Desativar Câmeras p/ Roubo & (2) Apagar Gravações do DVR de Empresas...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto('http://localhost:8080/hacker-city-web/index.html', { waitUntil: 'networkidle2' });

  await page.mouse.move(10, 10);
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
    window.DISABLE_AUTO_TOUR = true;
    await window.enterInstantOperatorMode('GhostHeist_01');
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
    window.navTo('winMissions');
  });
  await new Promise((r) => setTimeout(r, 350));

  // 1. Verificar quadro de Missões Disponíveis com Desativar Câmeras p/ Roubo e Apagar Gravação do DVR
  const poolInfo = await page.evaluate(() => {
    const pool = window.missionsEngine.ensureLoaded().pool;
    const disableMsn = pool.find((m) => m.cctvObjective === 'disable_all');
    const wipeMsn = pool.find((m) => m.cctvObjective === 'wipe_recording');
    return {
      totalPool: pool.length,
      cctvCount: pool.filter((m) => m.type === 'cctv_hack').length,
      disableId: disableMsn?.id,
      disableIp: disableMsn?.targetIp,
      wipeId: wipeMsn?.id,
      wipeIp: wipeMsn?.targetIp,
      wipeFile: wipeMsn?.dvrFileName
    };
  });

  console.log('📋 Contratos CFTV (Roubo & Queima de DVR):', poolInfo);
  assert.ok(poolInfo.cctvCount >= 4, 'Quadro possui pelo menos 4 contratos CFTV variados');
  assert.ok(poolInfo.disableId && poolInfo.wipeId, 'Possui tanto Desativar Câmeras p/ Roubo quanto Apagar Gravação do DVR');
  await page.screenshot({ path: path.join(OUT_DIR, '01_missoes_disponiveis_roubo_e_dvr.png') });

  // =========================================================================
  // FLUXO 1: DESATIVAR AS CÂMERAS DA EMPRESA PARA AJUDAR UM ROUBO (203.17.88.40)
  // =========================================================================
  await page.evaluate((id) => {
    window.handleAcceptMission(id);
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
  }, poolInfo.disableId);
  await new Promise((r) => setTimeout(r, 260));

  const earlyDisableCheck = await page.evaluate(() => {
    const res = window.handleVerifyMission();
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
    return res;
  });
  assert.strictEqual(earlyDisableCheck.success, false, 'Bloqueia entrega enquanto as câmeras da empresa ainda estão ligadas');
  await page.screenshot({ path: path.join(OUT_DIR, '02_missao_desativar_cameras_para_roubo.png') });

  // Invadir 203.17.88.40 -> abre o Mosaico 4x Ao Vivo com os vídeos reais rodando!
  await page.click('#btnOpenMissionTargetIp');
  await new Promise((r) => setTimeout(r, 250));
  await page.evaluate(() => window.internetEngine.openCrackerMiniPc());
  await new Promise((r) => setTimeout(r, 220));
  await page.click('#btnMiniPcUseBest');

  await page.waitForFunction(
    () => window.internetEngine && window.internetEngine.activeSshIp === '203.17.88.40' && window.internetEngine.sshSubTab === 'cctv',
    { timeout: 12000 }
  );
  await page.waitForFunction(
    () => {
      const vids = Array.from(document.querySelectorAll('#cctvCompanyMosaicGrid video'));
      return vids.length === 4 && vids.every((v) => v.readyState >= 2 && v.videoWidth === 640);
    },
    { timeout: 10000 }
  );
  await new Promise((r) => setTimeout(r, 600));
  await page.evaluate(() => {
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
    document.getElementById('cctvLiveConsoleRoot')?.scrollIntoView({ block: 'start' });
  });
  await new Promise((r) => setTimeout(r, 150));
  await page.screenshot({ path: path.join(OUT_DIR, '03_cameras_ao_vivo_antes_do_apagao.png') });

  // Clicar em "Desativar Todas as Câmeras (Ajudar Roubo)"!
  await page.click('#btnDisableAllCompanyCams');
  await new Promise((r) => setTimeout(r, 350));
  await page.evaluate(() => {
    document.getElementById('cctvLiveConsoleRoot')?.scrollIntoView({ block: 'start' });
  });

  const blackoutState = await page.evaluate(() => {
    const disabledOverlays = document.querySelectorAll('#cctvCompanyMosaicGrid .cctv-disabled-overlay').length;
    const allOff = window.cctvEngine.areAllCamerasDisabled('203.17.88.40');
    const verif = window.missionsEngine.verifyActiveMissionStatus();
    const logs = window.internetEngine.getServerLogs('203.17.88.40');
    return {
      disabledOverlays,
      allOff,
      verified: verif.verified,
      loggedBlackout: logs.some((l) => l.includes('FULL_CCTV_BLACKOUT'))
    };
  });
  console.log('⛔ Apagão CFTV p/ Ajudar Roubo:', blackoutState);
  assert.strictEqual(blackoutState.disabledOverlays, 4, 'Todas as 4 telas exibem SEM SINAL / CÂMERA DESATIVADA');
  assert.ok(blackoutState.allOff && blackoutState.verified, 'Missão de desativar câmeras confirmada imediatamente');
  assert.ok(blackoutState.loggedBlackout, 'Syslog registra FULL_CCTV_BLACKOUT');

  await page.screenshot({ path: path.join(OUT_DIR, '04_apagao_total_cameras_desativadas_roubo.png') });

  // Receber recompensa de $1.050 da Missão #1!
  const claimHeist = await page.evaluate(() => {
    window.navTo('winMissions');
    window.missionsEngine.setSubTab('current');
    const b0 = window.currentWallet.balance;
    window.handleVerifyMission();
    return { delta: +(window.currentWallet.balance - b0).toFixed(2), completed: window.missionsEngine.state.completedCount };
  });
  assert.strictEqual(claimHeist.delta, 1050, 'Recebeu $1.050 por desativar as câmeras para o roubo');

  // =========================================================================
  // FLUXO 2: APAGAR GRAVAÇÃO COMPROMETEDORA DO DVR DA EMPRESA (194.88.14.202)
  // =========================================================================
  await page.evaluate((id) => {
    window.missionsEngine.setSubTab('available');
    window.handleAcceptMission(id);
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
  }, poolInfo.wipeId);
  await new Promise((r) => setTimeout(r, 280));

  const earlyWipeCheck = await page.evaluate(() => {
    const res = window.handleVerifyMission();
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
    return res;
  });
  assert.strictEqual(earlyWipeCheck.success, false, 'Bloqueia entrega enquanto a gravação comprometedora ainda está no DVR');
  await page.screenshot({ path: path.join(OUT_DIR, '05_missao_apagar_gravacao_comprometedora_dvr.png') });

  // Invadir Meridian BioLabs S.A. (194.88.14.202) e abrir a aba Gravações DVR!
  await page.click('#btnOpenMissionTargetIp');
  await new Promise((r) => setTimeout(r, 250));
  await page.evaluate(() => window.internetEngine.openCrackerMiniPc());
  await new Promise((r) => setTimeout(r, 220));
  await page.click('#btnMiniPcUseBest');

  await page.waitForFunction(
    () => window.internetEngine && window.internetEngine.activeSshIp === '194.88.14.202' && window.internetEngine.sshSubTab === 'cctv',
    { timeout: 12000 }
  );
  await new Promise((r) => setTimeout(r, 350));

  // Clicar em "Abrir Gravações do DVR ->"
  await page.click('#btnJumpMissionDvr');
  await page.waitForFunction(
    () => {
      const v = document.querySelector('#cctvDvrArchiveView video');
      return v && v.readyState >= 2 && v.videoWidth === 640;
    },
    { timeout: 10000 }
  );
  await new Promise((r) => setTimeout(r, 550));
  await page.evaluate(() => {
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
    document.getElementById('cctvLiveConsoleRoot')?.scrollIntoView({ block: 'start' });
  });
  await new Promise((r) => setTimeout(r, 150));

  await page.screenshot({ path: path.join(OUT_DIR, '06_painel_gravacoes_dvr_com_playback_ao_vivo.png') });

  // Excluir a gravação alvo DVR_CAM01_Invasao_Lab_03h12.mp4 e formatar o DVR!
  await page.click('#btnDeleteDvr_DVR_CAM01_Invasao_Lab_03h12_mp4');
  await new Promise((r) => setTimeout(r, 280));

  const afterSingleDelete = await page.evaluate(() => ({
    deletedTarget: window.cctvEngine.isRecordingDeleted('194.88.14.202', 'DVR_CAM01_Invasao_Lab_03h12.mp4'),
    missionVerified: window.missionsEngine.verifyActiveMissionStatus().verified
  }));
  assert.ok(afterSingleDelete.deletedTarget && afterSingleDelete.missionVerified, 'Excluir a gravação alvo já valida imediatamente a missão');

  // Testar também o botão "Apagar Todas (Formatar DVR)" p/ deixar 0/4 vídeos no disco!
  await page.click('#btnWipeAllDvrRecordings');
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: path.join(OUT_DIR, '07_dvr_formatado_sem_provas.png') });

  // Voltar em Missões e resgatar os $1.180 + BTC!
  const claimWipe = await page.evaluate(() => {
    window.navTo('winMissions');
    window.missionsEngine.setSubTab('current');
    const b0 = window.currentWallet.balance;
    window.handleVerifyMission();
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
    return {
      delta: +(window.currentWallet.balance - b0).toFixed(2),
      completedCount: window.missionsEngine.state.completedCount
    };
  });
  console.log('💰 Pagamento Queima de Arquivo DVR:', claimWipe);
  assert.strictEqual(claimWipe.delta, 1180, 'Recebeu $1.180 por apagar a gravação comprometedora da empresa');
  assert.strictEqual(claimWipe.completedCount, 2, '2 missões CFTV concluídas no histórico');

  await new Promise((r) => setTimeout(r, 220));
  await page.screenshot({ path: path.join(OUT_DIR, '08_historico_duas_missoes_cctv_concluidas.png') });

  assert.strictEqual(pageErrors.length, 0, `Zero erros JS na página (encontrados: ${pageErrors.join('; ')})`);

  await browser.close();
  console.log('🎉 TODOS OS TESTES DE DESATIVAR CÂMERAS P/ ROUBO & APAGAR GRAVAÇÕES DO DVR PASSARAM 100%!');
})();
