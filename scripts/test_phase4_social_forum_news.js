/**
 * Hacker City // Teste E2E Automatizado - Fase 4 (Darknet Fórum, Cyber Chronicle & Perfil Público Clicável)
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Iniciando Teste E2E - Fase 4: Fórum Darknet, Cyber Chronicle & Perfil Público...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const evidenceDir = path.resolve(__dirname, '../evidencias');
  if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });

  try {
    await page.goto('http://localhost:8080/hacker-city-web/index.html', { waitUntil: 'networkidle2', timeout: 15000 });

    // 1. Entrar em modo operador instantâneo
    console.log('1. Entrando em Modo Operador Instantâneo...');
    await page.evaluate(async () => {
      await window.enterInstantOperatorMode();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // 2. Testar Fórum Darknet
    console.log('2. Testando Fórum Darknet...');
    const forumResult = await page.evaluate(() => {
      if (!window.darknetSocialEngine) return { error: 'darknetSocialEngine não encontrado' };

      const initialCount = window.darknetSocialEngine.threads.length;

      // Cria novo tópico
      window.darknetSocialEngine.createThread(
        'exploits',
        'Descoberta de Zero-Day no Switch Central',
        'Encontrei buffer overflow no roteamento de pacotes que permite evasão completa do trace rate.'
      );

      const createdTh = window.darknetSocialEngine.threads[0];

      // Responde ao tópico
      window.darknetSocialEngine.replyThread(
        createdTh.id,
        'Confirmado por nossa equipe! O dump de pacotes retornou os parâmetros do gateway com sucesso.'
      );

      // Upvote
      window.darknetSocialEngine.upvoteThread(createdTh.id);

      // Abre modal
      window.openDarknetForumModal();

      return {
        initialCount,
        newCount: window.darknetSocialEngine.threads.length,
        createdTitle: createdTh.title,
        replyCount: createdTh.posts.length,
        upvotes: createdTh.upvotes
      };
    });

    console.log('Resultado Fórum:', forumResult);
    if (forumResult.newCount <= forumResult.initialCount) throw new Error('Falha ao criar tópico no Fórum');
    if (forumResult.replyCount < 2) throw new Error('Falha ao responder ao tópico');

    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(evidenceDir, '10_darknet_forum_threads.png') });
    console.log('📸 Evidência 10 capturada: 10_darknet_forum_threads.png');

    // Fechar modal do Fórum
    await page.evaluate(() => {
      const modal = document.getElementById('darknet-forum-modal');
      if (modal) modal.style.display = 'none';
    });

    // 3. Testar Jornal The Cyber Chronicle
    console.log('3. Testando Jornal The Cyber Chronicle...');
    const newsResult = await page.evaluate(() => {
      window.openCyberChronicleModal();
      return {
        newsCount: window.darknetSocialEngine.news.length
      };
    });

    console.log('Resultado Jornal:', newsResult);
    if (newsResult.newsCount === 0) throw new Error('Jornal não possui notícias');

    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(evidenceDir, '11_cyber_chronicle_newspaper.png') });
    console.log('📸 Evidência 11 capturada: 11_cyber_chronicle_newspaper.png');

    // Fechar modal do Jornal
    await page.evaluate(() => {
      const modal = document.getElementById('cyber-chronicle-modal');
      if (modal) modal.style.display = 'none';
    });

    // 4. Testar Perfil Público Clicável
    console.log('4. Testando Perfil Público Clicável...');
    const profileResult = await page.evaluate(() => {
      window.openPublicProfileModal('AcidBurn');
      const body = document.getElementById('player-profile-body');
      return {
        hasBody: !!body,
        bodyText: body ? body.innerText : ''
      };
    });

    console.log('Resultado Perfil:', profileResult.hasBody ? 'Perfil Renderizado' : 'Falha');
    if (!profileResult.bodyText.includes('AcidBurn')) throw new Error('Perfil não exibiu o codinome correto');

    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(evidenceDir, '12_public_player_profile_modal.png') });
    console.log('📸 Evidência 12 capturada: 12_public_player_profile_modal.png');

    console.log('🎉 SUCESSO TOTAL: Fase 4 100% validada ponta a ponta!');
  } catch (err) {
    console.error('❌ ERRO no teste Fase 4:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
