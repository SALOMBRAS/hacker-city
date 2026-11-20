/**
 * E2E Suite:
 * 1) Laboratório de Vírus ($ 1.000 por uso + Limite estrito de 1 vez por Mês/Dia = 24h)
 * 2) Anti-Cheat Multi-Camadas (Bloqueio F12 + Assinatura Criptográfica hcsig5 contra adulteração de Software/Diplomas/Cooldown)
 * 3) Universidade Refinada (Exame Prático Obrigatório + Certificado Oficial MIT-HC + Tutorial Autorizado)
 * 4) Fórum da Rede (Criar Tópico, Responder, Voto Único Toggle, Busca, Perfil Público Sem Vazar IP + Bounty Real)
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/hacker-city-web/index.html';
const OUT_DIR = path.resolve(__dirname, '../evidencias/audit-full');

function assert(cond, msg) {
  if (!cond) throw new Error('ASSERTION FAILED: ' + msg);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  console.log('1) Iniciando sessão limpa no Hacker City Web...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await page.mouse.move(10, 10);
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
    window.DISABLE_AUTO_TOUR = true;
    await window.enterInstantOperatorMode('AuditSentinel_01');
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
  });
  await new Promise((r) => setTimeout(r, 350));

  // =========================================================================
  // TESTE 1: LABORATÓRIO DE VÍRUS ($ 1.000 + LIMITE 1 VEZ POR MÊS/DIA = 24H)
  // =========================================================================
  console.log('2) Testando taxa de $ 1.000 e trava de 1 vez por Mês (Dia = 24h) no Laboratório...');
  await page.evaluate(() => window.navTo('winVirusLab'));
  await new Promise((r) => setTimeout(r, 250));

  // Com $500 iniciais, não deve permitir abrir a bancada de $1.000!
  const blockedNoMoney = await page.evaluate(() => {
    const btn = document.getElementById('btnVlabPayAndStart');
    const tryRes = window.virusLabEngine.unlockPaidLabSession();
    return {
      gateVisible: !!document.getElementById('vlabPayGateCard'),
      btnDisabled: btn ? btn.disabled : null,
      code: tryRes.code
    };
  });
  assert(blockedNoMoney.gateVisible && blockedNoMoney.btnDisabled === true && blockedNoMoney.code === 'INSUFFICIENT_FUNDS',
    'Com $ 500 iniciais não pode permitir abrir bancada que custa $ 1.000');

  // Concede $ 2.500 autorizados para testar pagamento exato de $ 1.000
  await page.evaluate(() => {
    window.integrityGuard.runAuthorized(() => {
      window.currentWallet.balance = 2500;
    });
    window.updateHudDisplays();
    window.virusLabEngine.renderUI();
  });
  await new Promise((r) => setTimeout(r, 200));
  await page.screenshot({ path: path.join(OUT_DIR, '01-laboratorio-portao-taxa-1000-1x-dia.png') });

  // Paga $ 1.000 e abre os 3 rounds
  await page.click('#btnVlabPayAndStart');
  await new Promise((r) => setTimeout(r, 200));
  const afterPay = await page.evaluate(() => ({
    bal: Number(window.currentWallet.balance),
    round: window.virusLabEngine.state.activeDraft?.round,
    cardsCount: document.querySelectorAll('#winVirusLab .vlab-block-card').length
  }));
  console.log('   Após pagar $ 1.000:', afterPay);
  assert(afterPay.bal === 1500, `Saldo deveria cair de $ 2.500 para $ 1.500 (-$ 1.000), ficou ${afterPay.bal}`);
  assert(afterPay.round === 1 && afterPay.cardsCount === 3, 'Deve abrir o Round 1 com 3 blocos');

  // Completa os 3 rounds (1 -> 2 -> 1) e compila
  await page.evaluate(() => document.querySelectorAll('#winVirusLab .vlab-block-card')[0].click());
  await page.click('#btnVlabNextRound');
  await new Promise((r) => setTimeout(r, 150));
  await page.evaluate(() => {
    const cards = document.querySelectorAll('#winVirusLab .vlab-block-card');
    cards[0].click();
    cards[1].click();
  });
  await page.click('#btnVlabNextRound');
  await new Promise((r) => setTimeout(r, 150));
  await page.evaluate(() => {
    document.querySelectorAll('#winVirusLab .vlab-block-card')[0].click();
    document.getElementById('vlabStrainNameInput').value = 'Daily-Prime';
  });
  await page.click('#btnVlabCompile');
  await page.waitForSelector('#vlabCompileResultCard', { visible: true });

  // Fecha o relatório e verifica o Painel de Resfriamento de 24h (1x por Mês/Dia)!
  await page.click('#btnVlabCloseReport');
  await new Promise((r) => setTimeout(r, 250));
  const cooldownCheck = await page.evaluate(() => {
    const tryAgain = window.virusLabEngine.unlockPaidLabSession();
    return {
      cooldownCardVisible: !!document.getElementById('vlabCooldownGateCard'),
      timerText: document.getElementById('vlabLiveCooldownTimer')?.innerText || '',
      code: tryAgain.code,
      remMs: tryAgain.remainingMs,
      balUnchanged: Number(window.currentWallet.balance)
    };
  });
  console.log('   Trava de 1x por Mês (24h):', cooldownCheck);
  assert(cooldownCheck.cooldownCardVisible === true, 'Painel de espera de 24h deve aparecer');
  assert(cooldownCheck.code === 'COOLDOWN_ACTIVE' && cooldownCheck.remMs > 23 * 3600 * 1000, 'Não pode permitir usar 2x no mesmo dia/mês');
  assert(cooldownCheck.balUnchanged === 1500, 'Tentativa bloqueada não pode descontar dinheiro');
  await page.screenshot({ path: path.join(OUT_DIR, '02-laboratorio-bloqueio-24h-ativo.png') });

  // =========================================================================
  // TESTE 2: AUDITORIA DE SEGURANÇA & ANTI-CHEAT (F12 + ASSINATURA DE SNAPSHOT)
  // =========================================================================
  console.log('3) Validando blindagem Anti-Cheat (Console F12 + Adulteração de Snapshot LocalStorage)...');
  const secAudit = await page.evaluate(() => {
    // 1) Tenta disparo absurdo de velocidade (> 250.000 de uma vez sem autorização)
    const beforeBal = Number(window.currentWallet.balance);
    window.currentWallet.balance = 99999999;
    const afterTamperBal = Number(window.currentWallet.balance);

    // 2) Tenta adulterar o snapshot salvo (zerar lastCompiledAtMs p/ burlar 24h ou forjar v10.0)
    const legitSnap = window.onlineEngine.saveLocalSnapshotImmediate();
    const forgedCooldown = JSON.parse(JSON.stringify(legitSnap));
    forgedCooldown.virusLabState.lastCompiledAtMs = 0; // tenta burlar 1x/dia!

    const forgedSoft = JSON.parse(JSON.stringify(legitSnap));
    forgedSoft.soft.inventory.vminer = { owned: true, versionInt: 100 }; // tenta forjar v10.0!

    const forgedDiplomas = JSON.parse(JSON.stringify(legitSnap));
    forgedDiplomas.uni = { completed: [1, 2, 3, 4, 5] }; // tenta forjar diplomas!

    return {
      beforeBal,
      afterTamperBal,
      strikes: window.integrityGuard.cheatStrikes,
      legitValid: window.integrityGuard.verifySnapshot(legitSnap).valid,
      forgedCooldownValid: window.integrityGuard.verifySnapshot(forgedCooldown).valid,
      forgedSoftValid: window.integrityGuard.verifySnapshot(forgedSoft).valid,
      forgedDiplomasValid: window.integrityGuard.verifySnapshot(forgedDiplomas).valid,
      hasWriteSecret: window.onlineEngine.getOrCreateWriteSecret(window.currentProfile.id).startsWith('wcs_')
    };
  });
  console.log('   Auditoria Anti-Cheat:', secAudit);
  assert(secAudit.afterTamperBal === secAudit.beforeBal && secAudit.strikes >= 1, 'Adulteração de milhões deve ser bloqueada');
  assert(secAudit.legitValid === true, 'Snapshot legítimo deve ser aceito');
  assert(secAudit.forgedCooldownValid === false, 'Burlar cooldown de 24h no LocalStorage deve invalidar assinatura');
  assert(secAudit.forgedSoftValid === false, 'Forjar vírus v10.0 no LocalStorage deve invalidar assinatura');
  assert(secAudit.forgedDiplomasValid === false, 'Forjar diplomas no LocalStorage deve invalidar assinatura');
  assert(secAudit.hasWriteSecret === true, 'Segredo criptográfico de posse da conta deve existir');

  // =========================================================================
  // TESTE 3: UNIVERSIDADE REFINADA (EXAME PRÁTICO + DIPLOMA OFICIAL MIT-HC)
  // =========================================================================
  console.log('4) Validando Cursos & Certificados Refinados na Universidade...');
  await page.evaluate(() => {
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
    window.navTo('winUniversity');
    window.universityEngine.openCourseReader(1);
  });
  await new Promise((r) => setTimeout(r, 200));
  await page.click('#btnNextLesson');
  await new Promise((r) => setTimeout(r, 200));

  const examBefore = await page.evaluate(() => ({
    hasExamBox: !!document.getElementById('uniExamBox'),
    finishDisabledBefore: document.getElementById('btnFinishCert_1')?.disabled
  }));
  assert(examBefore.hasExamBox && examBefore.finishDisabledBefore === true, 'Certificado deve exigir aprovação no Exame Prático');

  // Escolhe a alternativa correta (índice 1 no CERT-101)
  await page.evaluate(() => window.universityEngine.selectExamAnswer(1));
  await new Promise((r) => setTimeout(r, 200));
  await page.screenshot({ path: path.join(OUT_DIR, '03-universidade-exame-pratico-aprovado.png') });

  const strikesBeforeCert = await page.evaluate(() => window.integrityGuard.cheatStrikes);
  await page.click('#btnFinishCert_1');
  await new Promise((r) => setTimeout(r, 250));

  const diplomaCheck = await page.evaluate(() => ({
    diplomaVisible: !!document.getElementById('universityDiplomaCard'),
    hasCert1: window.universityEngine.hasCert(1),
    tutStep: window.tutorialEngine.ensureLoaded().step,
    strikesAfterCert: window.integrityGuard.cheatStrikes
  }));
  console.log('   Diploma & Tutorial:', diplomaCheck);
  assert(diplomaCheck.diplomaVisible && diplomaCheck.hasCert1 && diplomaCheck.tutStep === 2, 'Diploma MIT-HC deve abrir e avançar Tutorial p/ Etapa 2');
  assert(diplomaCheck.strikesAfterCert === strikesBeforeCert, 'Concluir curso e tutorial não pode disparar falso positivo no Anti-Cheat');
  await page.screenshot({ path: path.join(OUT_DIR, '04-certificado-oficial-mit-hc-emitido.png') });

  // =========================================================================
  // TESTE 4: FÓRUM DA REDE & PERFIL PÚBLICO SEM VAZAMENTO DE IP
  // =========================================================================
  console.log('5) Validando Fórum da Rede (Novo Tópico, Resposta, Voto Único, Perfil s/ IP e Bounty)...');
  await page.evaluate(() => {
    const toast = document.getElementById('globalToast');
    if (toast) toast.style.display = 'none';
    window.navTo('winForum');
  });
  await new Promise((r) => setTimeout(r, 250));

  await page.click('#btnForumNewTopic');
  await new Promise((r) => setTimeout(r, 150));
  await page.evaluate(() => {
    document.getElementById('new-thread-title').value = 'Análise de Sinergia: Camada III no Laboratório';
    document.getElementById('new-thread-category').value = 'exploits';
    document.getElementById('new-thread-content').value = 'Combinando lockfree_spsc_push com o núcleo nativo conseguimos nota S limpa!';
  });
  await page.click('#btnForumSubmitThread');
  await new Promise((r) => setTimeout(r, 250));

  // Publicar resposta e testar que voto é ÚNICO (toggle: 1 -> 0 -> 1, nunca infinito!)
  await page.evaluate(() => {
    document.getElementById('forum-reply-input').value = 'Confirmado! Subi meu vírus hoje e rendeu certinho.';
  });
  await page.click('#btnForumPublishReply');
  await new Promise((r) => setTimeout(r, 250));

  const voteDedupeCheck = await page.evaluate(() => {
    const thId = window.darknetSocialEngine.activeThreadId;
    const th = window.darknetSocialEngine.threads.find((t) => t.id === thId);
    const initialVotes = th.upvotes; // 1 (autor já apoia ao criar)
    window.darknetSocialEngine.upvoteThread(thId); // retira voto -> 0
    const afterToggleOff = th.upvotes;
    window.darknetSocialEngine.upvoteThread(thId); // apoia de novo -> 1
    const afterToggleOn = th.upvotes;
    return { initialVotes, afterToggleOff, afterToggleOn, postsCount: th.posts.length };
  });
  assert(voteDedupeCheck.initialVotes === 1 && voteDedupeCheck.afterToggleOff === 0 && voteDedupeCheck.afterToggleOn === 1,
    'Voto no fórum deve ser único por operador (toggle sem spam infinito)');
  assert(voteDedupeCheck.postsCount === 2, 'Tópico deve conter o post original + resposta');
  await page.screenshot({ path: path.join(OUT_DIR, '05-forum-topico-resposta-voto-unico.png') });

  // Testar clique em @ZeroCool -> Perfil Público NÃO pode vazar IP!
  await page.evaluate(() => window.darknetSocialEngine.openProfileModal('ZeroCool'));
  await new Promise((r) => setTimeout(r, 250));
  const profilePrivacy = await page.evaluate(() => {
    const ipBadge = document.getElementById('profileIpProtectedBadge')?.innerText || '';
    const fullBody = document.getElementById('player-profile-body')?.innerText || '';
    const leaksIpDigits = /\d+\.\d+/.test(ipBadge);
    return { ipBadge, leaksIpDigits, hasBountyBtn: !!document.getElementById('btnProfilePlaceBounty') };
  });
  console.log('   Privacidade do Perfil no Fórum:', profilePrivacy);
  assert(profilePrivacy.ipBadge.includes('Oculto') && profilePrivacy.leaksIpDigits === false, 'Perfil público no Fórum NUNCA pode vazar IP do jogador!');
  assert(profilePrivacy.hasBountyBtn === true, 'Perfil de outro jogador deve ter botão Cabeça a Prêmio funcional');
  await page.screenshot({ path: path.join(OUT_DIR, '06-forum-perfil-publico-ip-oculto.png') });

  assert(pageErrors.length === 0, 'Erros JS na página: ' + pageErrors.join('; '));
  console.log('✅ AUDITORIA COMPLETA E TODOS OS TESTES E2E PASSARAM 100%!');
  await browser.close();
})().catch((err) => {
  console.error('❌ FALHA NA AUDITORIA E2E:', err);
  process.exit(1);
});
