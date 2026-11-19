/**
 * Suíte E2E Visual — Proteção Automática de Privacidade do IP (Últimos 7 Dígitos Ocultos c/ Blur + Revelação no Hover)
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const OUT_DIR = path.join(__dirname, '..', 'evidencias', 'ip-privacy-blur');
fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  console.log('🚀 Iniciando Validação E2E de Privacidade Automática do IP (Blur nos últimos 7 dígitos + Hover)...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto('http://localhost:8080/hacker-city-web/index.html', { waitUntil: 'networkidle2' });

  // Entrar no jogo como um jogador real e posicionar o mouse em área neutra (10, 10)
  await page.mouse.move(10, 10);
  await page.evaluate(async () => {
    localStorage.clear();
    localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
    window.DISABLE_AUTO_TOUR = true;
    await window.enterInstantOperatorMode();
  });
  await new Promise((r) => setTimeout(r, 400));

  // 1. Verificar matemática de 7 dígitos em vários formatos de IPv4 + estado inicial ao entrar no jogo
  const initialCheck = await page.evaluate(() => {
    const samples = ['144.218.192.124', '131.160.229.75', '60.3.245.244', '11.10.12.14'].map((ip) =>
      window.networkIdentity.splitMyIpLast7Digits(ip)
    );
    const fullIp = window.networkIdentity.getPublicIp();
    const hudTail = document.querySelector('#hudMyIp .my-ip-blur-tail');
    const homeTail = document.querySelector('#homeMyIpCell .my-ip-blur-tail');
    return {
      fullIp,
      hudText: document.getElementById('hudMyIp')?.textContent || '',
      hudHead: document.querySelector('#hudMyIp .my-ip-head')?.textContent || '',
      hudTailText: hudTail?.textContent || '',
      hudTailDigits: (hudTail?.textContent.match(/\d/g) || []).length,
      hudFilter: hudTail ? getComputedStyle(hudTail).filter : '',
      homeTailDigits: (homeTail?.textContent.match(/\d/g) || []).length,
      homeFilter: homeTail ? getComputedStyle(homeTail).filter : '',
      samples
    };
  });

  console.log('🔒 Estado Inicial ao Entrar no Jogo:', initialCheck);
  assert.strictEqual(initialCheck.hudText, initialCheck.fullIp, 'Texto lógico completo do IP preservado sem espaços extras');
  assert.strictEqual(initialCheck.hudTailDigits, 7, 'Exatamente os últimos 7 dígitos devem estar ocultos no topo');
  assert.strictEqual(initialCheck.homeTailDigits, 7, 'Exatamente os últimos 7 dígitos devem estar ocultos no card Seu IP do Início');
  assert.ok(initialCheck.hudFilter.includes('blur(5.5px)'), `Blur ativo no topo ao entrar: ${initialCheck.hudFilter}`);
  assert.ok(initialCheck.homeFilter.includes('blur(5.5px)'), `Blur ativo no Início ao entrar: ${initialCheck.homeFilter}`);
  for (const s of initialCheck.samples) {
    assert.strictEqual(s.blurredDigitsCount, 7, `Amostra ${s.full} deve ocultar 7 dígitos (ocultou ${s.blurredDigitsCount}: ${s.tail})`);
  }

  await page.screenshot({ path: path.join(OUT_DIR, '01_entrada_jogo_ip_oculto_blur_automatico.png') });

  // 2. Passar o mouse sobre o IP do Topo (#hudMyIpChip) -> Blur sai suavemente + Mini-Aba aparece!
  await page.hover('#hudMyIpChip');
  await new Promise((r) => setTimeout(r, 260));

  const hoverHudCheck = await page.evaluate(() => {
    const hudTail = document.querySelector('#hudMyIp .my-ip-blur-tail');
    const homeTail = document.querySelector('#homeMyIpCell .my-ip-blur-tail');
    const tip = document.getElementById('hcHoverMiniTab');
    return {
      hudFilterOnHover: hudTail ? getComputedStyle(hudTail).filter : '',
      homeFilterStillBlurred: homeTail ? getComputedStyle(homeTail).filter : '',
      miniTabVisible: !!(tip && tip.classList.contains('visible')),
      miniTabTitle: tip?.querySelector('.mht-title')?.textContent || ''
    };
  });

  console.log('👁️ Hover no IP do Topo:', hoverHudCheck);
  assert.ok(
    hoverHudCheck.hudFilterOnHover === 'blur(0px)' || hoverHudCheck.hudFilterOnHover === 'none',
    `Blur deve sair ao passar o mouse no topo: ${hoverHudCheck.hudFilterOnHover}`
  );
  assert.ok(
    hoverHudCheck.homeFilterStillBlurred.includes('blur(5.5px)'),
    'Card do Início permanece protegido enquanto o mouse está apenas no topo'
  );
  assert.ok(hoverHudCheck.miniTabVisible, 'Mini-aba explicativa visível no hover');

  await page.screenshot({ path: path.join(OUT_DIR, '02_hover_mouse_ip_revelado_topo.png') });

  // 3. Mover o mouse para o card "Seu IP" no Início (#homeMyIpCell) -> Topo volta a ficar oculto e Card revela!
  await page.hover('#homeMyIpCell');
  await new Promise((r) => setTimeout(r, 260));

  const hoverHomeCheck = await page.evaluate(() => {
    const hudTail = document.querySelector('#hudMyIp .my-ip-blur-tail');
    const homeTail = document.querySelector('#homeMyIpCell .my-ip-blur-tail');
    return {
      hudFilterBackToBlur: hudTail ? getComputedStyle(hudTail).filter : '',
      homeFilterOnHover: homeTail ? getComputedStyle(homeTail).filter : ''
    };
  });

  console.log('👁️ Hover no Card Seu IP (Início):', hoverHomeCheck);
  assert.ok(hoverHomeCheck.hudFilterBackToBlur.includes('blur(5.5px)'), 'Topo volta ao blur automaticamente ao tirar o mouse');
  assert.ok(
    hoverHomeCheck.homeFilterOnHover === 'blur(0px)' || hoverHomeCheck.homeFilterOnHover === 'none',
    `Card Seu IP revela ao passar o mouse: ${hoverHomeCheck.homeFilterOnHover}`
  );

  await page.screenshot({ path: path.join(OUT_DIR, '03_hover_mouse_card_seu_ip_inicio.png') });

  // Tirar o mouse completamente -> ambos voltam ao blur + testar botão Copiar sem vazar IP no Toast
  await page.mouse.move(10, 10);
  await new Promise((r) => setTimeout(r, 260));
  const afterLeaveCheck = await page.evaluate(() => {
    const fullIp = window.networkIdentity.getPublicIp();
    window.networkIdentity.copyMyIp();
    const toastTxt = document.getElementById('toast')?.textContent || '';
    const homeTail = document.querySelector('#homeMyIpCell .my-ip-blur-tail');
    return {
      homeFilterAfterLeave: homeTail ? getComputedStyle(homeTail).filter : '',
      toastTxt,
      leakedInToast: toastTxt.includes(fullIp)
    };
  });
  assert.ok(afterLeaveCheck.homeFilterAfterLeave.includes('blur(5.5px)'), 'Blur retorna imediatamente ao afastar o mouse');
  assert.strictEqual(afterLeaveCheck.leakedInToast, false, 'Toast de cópia não deve vazar o IP cru na tela');

  // 4. Provedor ISP (71.4.5.1) + Barra de Disfarce da Internet com IP protegido por padrão
  await page.evaluate(() => {
    const toast = document.getElementById('toast');
    if (toast) toast.classList.remove('show');
    window.internetEngine.openIp('71.4.5.1');
  });
  await page.mouse.move(10, 10);
  await new Promise((r) => setTimeout(r, 300));

  const ispCheck = await page.evaluate(() => {
    const ispTail = document.querySelector('#ispCurrentMyIpBox .my-ip-blur-tail');
    return {
      ispFilter: ispTail ? getComputedStyle(ispTail).filter : '',
      ispDigits: (ispTail?.textContent.match(/\d/g) || []).length
    };
  });
  console.log('🌐 Provedor ISP (71.4.5.1):', ispCheck);
  assert.ok(ispCheck.ispFilter.includes('blur(5.5px)'), 'IP no painel do Provedor ISP inicia protegido com blur');
  assert.strictEqual(ispCheck.ispDigits, 7, 'Exatamente 7 dígitos ocultos no painel do Provedor ISP');

  await page.screenshot({ path: path.join(OUT_DIR, '04_isp_painel_ip_protegido.png') });

  // 4b. Verificar também barra de rota de invasão (#inetBounceBar) caso renderizada em servidor alvo
  await page.evaluate(() => {
    window.internetEngine.openIp('203.17.88.40', 'invadir');
  });
  await page.mouse.move(10, 10);
  await new Promise((r) => setTimeout(r, 240));
  const bounceCheck = await page.evaluate(() => {
    const bounceTail = document.querySelector('#inetBounceBar .my-ip-blur-tail');
    const hudTail = document.querySelector('#hudMyIp .my-ip-blur-tail');
    return {
      hasBounceBar: !!document.getElementById('inetBounceBar'),
      bounceFilter: bounceTail ? getComputedStyle(bounceTail).filter : '',
      hudFilter: hudTail ? getComputedStyle(hudTail).filter : ''
    };
  });
  if (bounceCheck.hasBounceBar) {
    assert.ok(bounceCheck.bounceFilter.includes('blur(5.5px)'), 'IP na barra de rota inicia protegido com blur');
  }
  assert.ok(bounceCheck.hudFilter.includes('blur(5.5px)'), 'HUD segue com blur durante invasão na Internet');

  // 5. Meus Rastros / Logs locais sem vazar o IP cru no boot nem na barra lateral
  await page.evaluate(() => {
    window.navTo('winLogs');
  });
  await page.mouse.move(10, 10);
  await new Promise((r) => setTimeout(r, 280));

  const logsCheck = await page.evaluate(() => {
    const fullIp = window.networkIdentity.getPublicIp();
    const sideTail = document.querySelector('#logsSideMyIpRow .my-ip-blur-tail');
    const subTail = document.querySelector('#logsPageSubtitle .my-ip-blur-tail');
    const rawLogVal = document.getElementById('localSyslogTextarea')?.value || '';
    return {
      sideFilter: sideTail ? getComputedStyle(sideTail).filter : '',
      subFilter: subTail ? getComputedStyle(subTail).filter : '',
      leakedInBootTextarea: rawLogVal.includes(fullIp)
    };
  });
  console.log('📋 Meus Rastros / Logs:', logsCheck);
  assert.ok(logsCheck.sideFilter.includes('blur(5.5px)'), 'Meu IP na lateral de Logs inicia protegido com blur');
  assert.ok(logsCheck.subFilter.includes('blur(5.5px)'), 'Meu IP no subtítulo de Logs inicia protegido com blur');
  assert.strictEqual(logsCheck.leakedInBootTextarea, false, 'Log inicial de boot não deve estampar o IP público cru no textarea');

  await page.screenshot({ path: path.join(OUT_DIR, '05_meus_rastros_ip_protegido.png') });

  assert.strictEqual(pageErrors.length, 0, `Erros JS inesperados: ${pageErrors.join(' | ')}`);
  await browser.close();
  console.log('✅ TODOS OS TESTES DE PRIVACIDADE DO IP (BLUR 7 DÍGITOS + HOVER) PASSARAM COM ZERO ERROS!');
})().catch((err) => {
  console.error('❌ Falha no teste E2E de privacidade de IP:', err);
  process.exit(1);
});
