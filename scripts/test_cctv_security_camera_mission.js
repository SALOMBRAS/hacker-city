/**
 * Suíte E2E Visual — Missão de Invasão a Câmera de Segurança (CFTV) &
 * Console NVR Ao Vivo com 6 Modelos Distintos de Vídeos Reais (.webm / .mp4)!
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const OUT_DIR = path.join(__dirname, '..', 'evidencias', 'cctv-security-cameras');
fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  console.log('🚀 Iniciando Validação E2E de Missão de Invasão a Câmeras de Segurança + 6 Modelos de Vídeo Ao Vivo...');
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
    await window.enterInstantOperatorMode('GhostCam_01');
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
    window.navTo('winMissions');
  });
  await new Promise((r) => setTimeout(r, 350));

  // 1. Aba Missões Disponíveis exibindo contratos de Invasão a Câmera CFTV
  const poolCheck = await page.evaluate(() => {
    const pool = window.missionsEngine.ensureLoaded().pool;
    const cctvMissions = pool.filter((m) => m.type === 'cctv_hack');
    return {
      totalPool: pool.length,
      cctvCount: cctvMissions.length,
      firstCctvId: cctvMissions[0]?.id,
      firstTargetIp: cctvMissions[0]?.targetIp,
      firstCamCode: cctvMissions[0]?.camCode
    };
  });

  console.log('📋 Contratos CFTV no Quadro:', poolCheck);
  assert.ok(poolCheck.cctvCount >= 3, 'Deve conter pelo menos 3 contratos distintos de invasão a câmeras CFTV');
  await page.screenshot({ path: path.join(OUT_DIR, '01_missoes_disponiveis_cctv.png') });

  // 2. Aceitar a Missão CFTV #1 (Farofa Systems S.A. -> CAM-03 Sala da Diretoria) e testar bloqueio antes de gravar
  await page.evaluate((id) => {
    window.handleAcceptMission(id);
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
  }, poolCheck.firstCctvId);
  await new Promise((r) => setTimeout(r, 280));

  const prematureVerify = await page.evaluate(() => {
    const res = window.handleVerifyMission();
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
    return res;
  });
  assert.strictEqual(prematureVerify.success, false, 'Não pode aprovar a missão antes de invadir e gravar a câmera alvo');

  await page.screenshot({ path: path.join(OUT_DIR, '02_missao_atual_email_historia_cctv.png') });

  // 3. Clicar em "Abrir CFTV (203.17.88.40)" -> Quebrar senha no Mini-PC -> Abre automaticamente o Mosaico 4x Ao Vivo!
  await page.click('#btnOpenMissionTargetIp');
  await new Promise((r) => setTimeout(r, 300));

  // Abrir Mini-PC de Quebra de Senha e iniciar força-bruta
  await page.evaluate(() => {
    window.internetEngine.openCrackerMiniPc();
  });
  await new Promise((r) => setTimeout(r, 250));
  await page.click('#btnMiniPcUseBest');

  // Aguardar conclusão da quebra de senha (~2.8s) e carregamento dos vídeos reais (.webm/.mp4)
  await page.waitForFunction(
    () => window.internetEngine && window.internetEngine.activeSshIp === '203.17.88.40' && window.internetEngine.sshSubTab === 'cctv',
    { timeout: 12000 }
  );
  await page.waitForFunction(
    () => {
      const vids = Array.from(document.querySelectorAll('#cctvCompanyMosaicGrid video'));
      return vids.length === 4 && vids.every((v) => v.readyState >= 2 && v.videoWidth === 640 && v.videoHeight === 360);
    },
    { timeout: 10000 }
  );
  await new Promise((r) => setTimeout(r, 650));
  await page.evaluate(() => {
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
  });

  const mosaicVideoStats = await page.evaluate(() => {
    const vids = Array.from(document.querySelectorAll('#cctvCompanyMosaicGrid video'));
    return vids.map((v) => ({
      w: v.videoWidth,
      h: v.videoHeight,
      readyState: v.readyState,
      time: +v.currentTime.toFixed(2),
      src: v.currentSrc.split('/').pop()
    }));
  });
  console.log('📹 Mosaico 4x da Farofa Systems S.A. (Vídeos Reais Rodando):', mosaicVideoStats);
  assert.strictEqual(mosaicVideoStats.length, 4, 'Deve exibir 4 câmeras simultâneas da empresa invadida');
  assert.ok(mosaicVideoStats.every((v) => v.w === 640 && v.h === 360), 'Todos os 4 vídeos têm resolução nativa 640x360');

  await page.screenshot({ path: path.join(OUT_DIR, '03_mosaico_4_cameras_ao_vivo_empresa.png') });

  // 4. Focar na CAM-03 (Sala da Diretoria Executiva), aplicar Zoom PTZ, Gravar Prova (.mp4) e Injetar Loop Falso!
  await page.click('#btnJumpMissionCam');
  await new Promise((r) => setTimeout(r, 450));

  await page.evaluate(() => {
    window.cctvEngine.adjustPtz(0, 0, 0.4); // Zoom 1.4x
  });
  await page.click('#btnCaptureCctvEvidence');
  await new Promise((r) => setTimeout(r, 250));
  await page.click('#btnInjectCctvLoop');
  await new Promise((r) => setTimeout(r, 350));

  const singleCamCheck = await page.evaluate(() => {
    const vid = document.getElementById('cctvPrimaryVideo');
    const verif = window.missionsEngine.verifyActiveMissionStatus();
    const logs = window.internetEngine.getServerLogs('203.17.88.40');
    return {
      videoReady: vid ? vid.readyState : 0,
      videoSrc: vid ? vid.currentSrc.split('/').pop() : '',
      zoomText: document.getElementById('cctvZoomLabel')?.textContent || '',
      looped: window.cctvEngine.isCameraLooped('203.17.88.40', 'CAM-03'),
      captured: window.cctvEngine.hasCapturedCamera('203.17.88.40', 'CAM-03'),
      missionVerified: verif.verified,
      rtspLoggedInSyslog: logs.some((l) => l.includes('RTSP/554'))
    };
  });
  console.log('🎯 Câmera Individual CAM-03 + Gravação & Loop:', singleCamCheck);
  assert.ok(singleCamCheck.captured, 'Prova em vídeo (.mp4) de CAM-03 capturada com sucesso');
  assert.ok(singleCamCheck.looped, 'Loop falso injetado com sucesso em CAM-03');
  assert.ok(singleCamCheck.missionVerified, 'Missão CFTV verificada automaticamente após capturar a câmera certa');
  assert.ok(singleCamCheck.rtspLoggedInSyslog, 'Acesso RTSP/554 registrado no /var/log/syslog do servidor invadido');

  await page.screenshot({ path: path.join(OUT_DIR, '04_camera_individual_hd_ptz_gravacao_e_loop.png') });

  // 5. Testar Lente Visão Noturna IR + Galeria Completa dos 6 Modelos Distintos de Vídeo CFTV!
  await page.click('#btnCctvModeAll6');
  await page.waitForFunction(
    () => {
      const vids = Array.from(document.querySelectorAll('#cctvAllModelsGrid video'));
      return vids.length === 6 && vids.every((v) => v.readyState >= 2 && v.videoWidth === 640);
    },
    { timeout: 10000 }
  );
  await new Promise((r) => setTimeout(r, 550));
  await page.evaluate(() => {
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
  });

  const all6Check = await page.evaluate(() => {
    const vids = Array.from(document.querySelectorAll('#cctvAllModelsGrid video'));
    return vids.map((v) => v.currentSrc.split('/').pop());
  });
  console.log('🎬 Todos os 6 Modelos Distintos de Vídeos CFTV Ativos:', all6Check);
  assert.strictEqual(new Set(all6Check).size, 6, 'Os 6 modelos de vídeo são arquivos distintos e carregados');

  await page.screenshot({ path: path.join(OUT_DIR, '05_galeria_6_modelos_videos_cftv_corporativos.png') });

  // Capturar também o Modo Visão Noturna IR no Mosaico
  await page.click('#btnCctvFilterIr');
  await page.click('#btnCctvModeMosaic');
  await new Promise((r) => setTimeout(r, 450));
  await page.screenshot({ path: path.join(OUT_DIR, '06_modo_visao_noturna_ir_cftv.png') });

  // 6. Voltar em Missões -> Entregar e Receber $920!
  await page.evaluate(() => {
    window.navTo('winMissions');
    window.missionsEngine.setSubTab('current');
  });
  await new Promise((r) => setTimeout(r, 250));
  const claimCheck = await page.evaluate(() => {
    const balBefore = window.currentWallet.balance;
    window.handleVerifyMission();
    return {
      balBefore,
      newBalance: window.currentWallet.balance,
      delta: +(window.currentWallet.balance - balBefore).toFixed(2),
      completedCount: window.missionsEngine.state.completedCount,
      lastStatus: window.missionsEngine.state.history[0]?.status
    };
  });
  await new Promise((r) => setTimeout(r, 200));
  console.log('💰 Pagamento da Missão de Invasão a Câmera:', claimCheck);
  assert.strictEqual(claimCheck.delta, 920, 'Recompensa exata de $920 creditada na carteira com sucesso');
  assert.strictEqual(claimCheck.completedCount, 1, 'Contador de missões concluídas incrementado');
  assert.strictEqual(claimCheck.lastStatus, 'CONCLUÍDA', 'Histórico registra missão CFTV concluída');

  await page.screenshot({ path: path.join(OUT_DIR, '07_missao_cctv_concluida_e_paga.png') });

  assert.strictEqual(pageErrors.length, 0, `Zero erros JS na página (encontrados: ${pageErrors.join('; ')})`);

  await browser.close();
  console.log('🎉 TODOS OS TESTES DE INVASÃO A CÂMERAS DE SEGURANÇA AO VIVO + 6 MODELOS DE VÍDEO PASSARAM 100%!');
})();
