/**
 * Suíte E2E — Validação do Novo Treinamento Unificado:
 *   1. Grade Sincronizada da Universidade (CERT-101 a CERT-401)
 *   2. Tour Guiado Spotlight de 14 Passos (Escudo < 200 REP + Passo 14 Dinheiro Sujo vs. Limpo)
 *   3. Trilha Prática de 6 Etapas + Bônus Único de 8s na 1ª Lavagem (2º lote = 15m exatos!)
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

function assert(cond, msg) {
  if (!cond) throw new Error('ASSERTION FAILED: ' + msg);
}

const IMG_DIR = path.resolve(__dirname, '../../reports/novo-treinamento-unificado/images');

(async () => {
  fs.mkdirSync(IMG_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,860']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 860 });
    page.on('dialog', async (d) => { try { await d.accept(); } catch (e) {} });

    await page.goto('http://localhost:8080/hacker-city-web/index.html', { waitUntil: 'networkidle2' });

    // 1. Validar Grade Sincronizada da Universidade & Aulas Atualizadas
    const uniCheck = await page.evaluate(async () => {
      localStorage.clear();
      sessionStorage.clear();
      window.DISABLE_AUTO_TOUR = true;
      localStorage.setItem('HC_DISABLE_AUTO_TOUR', '1');
      await window.enterInstantOperatorMode('Cadete_Novo');
      if (window.spotlightTour) window.spotlightTour.finishTour(true);
      window.navTo('winUniversity');
      window.universityEngine.renderUI();
      const tableText = document.getElementById('universityAppBody')?.innerText || '';
      window.universityEngine.openCourseReader(1);
      window.universityEngine.nextLessonPage();
      window.universityEngine.nextLessonPage();
      const lesson3Text = document.getElementById('universityAppBody')?.innerText || '';
      window.universityEngine.readingCourseId = null;
      window.universityEngine.renderUI();
      return {
        hasRealPrices: tableText.includes('$ 1.500 Limpos') && tableText.includes('$ 6.000 Limpos') && tableText.includes('$ 18.000 Limpos'),
        hasRealTimes: tableText.includes('10 min') && tableText.includes('45 min') && tableText.includes('2 horas') && tableText.includes('6 horas'),
        teachesDirtyMoney: lesson3Text.includes('Dinheiro Sujo') && lesson3Text.includes('Vitrine Global de Lavagem')
      };
    });
    assert(uniCheck.hasRealPrices && uniCheck.hasRealTimes && uniCheck.teachesDirtyMoney, 'University catalog & lessons must match new game rules');
    await new Promise((r) => setTimeout(r, 250));
    await page.screenshot({ path: path.join(IMG_DIR, '01-universidade-grade-sincronizada-e-aulas.png') });

    // 2. Validar Tour Guiado Direto p/ 1ª Invasão (10 Passos Conversacionais: Passo 1 Escudo 24h -> Passo 2 Invasão Direta 198.51.100.42 -> Passo 10 Sujo vs Limpo)
    const tourStep1 = await page.evaluate(() => {
      window.spotlightTour.start(true);
      const step0Title = document.getElementById('hcTourCardTitle')?.innerText || '';
      const step2Obj = window.spotlightTour.steps[1];
      return {
        totalSteps: window.spotlightTour.steps.length,
        step0Title,
        goesDirectToInvasion: step2Obj && step2Obj.id === 'start_first_invasion' && step2Obj.desc.includes('198.51.100.42')
      };
    });
    assert(tourStep1.totalSteps === 10 && tourStep1.step0Title.includes('Escudo Iniciante') && tourStep1.goesDirectToInvasion, 'Spotlight Tour must have 10 streamlined steps going straight to 1st invasion');
    await new Promise((r) => setTimeout(r, 250));
    await page.screenshot({ path: path.join(IMG_DIR, '02-tour-passo1-escudo-iniciante.png') });

    const tourStep14 = await page.evaluate(() => {
      window.spotlightTour.goToStepById('dirty_vs_clean_economy');
      const title14 = document.getElementById('hcTourCardTitle')?.innerText || '';
      const dirtyNow = window.nineSystemsEngine.getDirtyBalance();
      const launderUnlocked = window.progressiveUnlockEngine.isUnlocked('winLaundering');
      return { title14, dirtyNow, launderUnlocked };
    });
    assert(tourStep14.title14.includes('Dinheiro Sujo vs. Dinheiro Limpo') && tourStep14.dirtyNow === 600 && tourStep14.launderUnlocked, 'Step 14 must grant $600 Dirty Money and unlock Laundering');
    await new Promise((r) => setTimeout(r, 250));
    await page.screenshot({ path: path.join(IMG_DIR, '03-tour-passo14-dinheiro-sujo-vs-limpo.png') });

    // 3. Validar Trilha Prática Unificada de 6 Etapas + Bônus Único de 8s na 1ª Lavagem
    const trackSteps1to4 = await page.evaluate(async () => {
      window.spotlightTour.finishTour(true);
      // Reinicia estado limpo do tutorial p/ testar os 6 degraus sequenciais do zero
      localStorage.removeItem('HC_TUTORIAL_' + window.currentProfile.id);
      window.tutorialEngine.userId = null;
      const s1 = window.tutorialEngine.getCurrentStepInfo().step;
      await window.universityEngine.completeCourse(1, { skipExam: true, tuitionAlreadyPaid: true });
      const s2 = window.tutorialEngine.getCurrentStepInfo().step;
      window.tutorialEngine.onHostHackedOrLoggedRoot('198.51.100.42');
      const s3 = window.tutorialEngine.getCurrentStepInfo().step;
      window.tutorialEngine.onFileReadOrVirusPlanted('198.51.100.42');
      const s4 = window.tutorialEngine.getCurrentStepInfo().step;
      window.tutorialEngine.notifyLogsSaved('198.51.100.42', ['[OK] system clean']);
      const s5 = window.tutorialEngine.getCurrentStepInfo().step;
      return { s1, s2, s3, s4, s5, readyExpress: window.tutorialEngine.isReadyForTutorialWash() };
    });
    assert(
      trackSteps1to4.s1 === 1 && trackSteps1to4.s2 === 2 && trackSteps1to4.s3 === 3 &&
      trackSteps1to4.s4 === 4 && trackSteps1to4.s5 === 5 && trackSteps1to4.readyExpress,
      'Tutorial must advance cleanly across Steps 1 -> 2 -> 3 -> 4 -> 5'
    );

    const washAndGraduate = await page.evaluate(() => {
      window.navTo('winLaundering');
      const five = window.nineSystemsEngine.getCurrentHourFiveCompanies();
      // 1ª Lavagem de Treino ($ 600 Sujos na Etapa 5) -> DEVE levar 8.000ms!
      const w1 = window.nineSystemsEngine.startLaunderingBatch(five[0].id, 600);
      const wait1Ms = w1.job.completesAt - w1.job.startedAt;
      const stepAfterWash = window.tutorialEngine.getCurrentStepInfo().step;

      // Adiciona mais $ 1.000 Sujos e testa 2ª lavagem em outra empresa -> DEVE voltar p/ 900.000ms (15 min)!
      window.nineSystemsEngine.addDirtyMoney(1000, '2º Saque Normal');
      const w2 = window.nineSystemsEngine.startLaunderingBatch(five[1].id, 800);
      const wait2Ms = w2.job.completesAt - w2.job.startedAt;
      return { wait1Ms, wait2Ms, stepAfterWash };
    });
    assert(washAndGraduate.wait1Ms === 8000, `1st Tutorial Wash must be 8000ms express (got ${washAndGraduate.wait1Ms})`);
    assert(washAndGraduate.wait2Ms === 900000, `2nd Wash must return strictly to 900000ms / 15m (got ${washAndGraduate.wait2Ms})`);
    assert(washAndGraduate.stepAfterWash === 6, 'Starting 1st wash must advance Tutorial to Step 6 (Graduation)');

    await new Promise((r) => setTimeout(r, 250));
    await page.screenshot({ path: path.join(IMG_DIR, '04-etapa5-primeira-lavagem-expressa-8s.png') });

    const finalGrad = await page.evaluate(() => {
      const balBefore = window.currentWallet.balance;
      const claim = window.tutorialEngine.claimFinalReward();
      window.navTo('winHome');
      return {
        claimOk: claim.success,
        completed: window.tutorialEngine.isCompleted(),
        cleanGain: Math.round(window.currentWallet.balance - balBefore),
        strikes: window.integrityGuard ? Number(window.integrityGuard.cheatStrikes || 0) : 0
      };
    });
    assert(finalGrad.claimOk && finalGrad.completed && finalGrad.cleanGain === 500 && finalGrad.strikes === 0, 'Step 6 Graduation must grant $500 Clean with 0 strikes');

    await new Promise((r) => setTimeout(r, 250));
    await page.screenshot({ path: path.join(IMG_DIR, '05-home-formatura-6-etapas-concluida.png') });

    console.log('ALL_NEW_ONBOARDING_TRAINING_E2E_PASSED', JSON.stringify({
      uniCheck,
      tourStep1,
      tourStep14,
      trackSteps1to4,
      washAndGraduate,
      finalGrad
    }, null, 2));
  } finally {
    await browser.close();
  }
})();
