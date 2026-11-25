/**
 * Foto de perfil entre o cadastro e o tutorial (src/js/avatar-picker-engine.js).
 * Bloqueia todo *.supabase.co: a suíte não grava nada no banco. Usa o modo "1 Clique" (perfil local).
 *
 *   NODE_PATH=../pague-on-old/node_modules node tests/verify-avatar-picker-e2e.js
 *
 * HC_BASE_URL troca a URL (padrão igual ao das outras suítes). PUPPETEER_EXECUTABLE_PATH aponta
 * para um Chrome local quando o puppeteer instalado não traz o navegador.
 */
const puppeteer = require('puppeteer');
const assert = require('assert');

const BASE_URL = process.env.HC_BASE_URL || 'http://localhost:8080/hacker-city-web/index.html';
const DESKTOP = { width: 1366, height: 860 };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// Cada cenário num contexto próprio: com uma sessão "1 Clique" salva, o jogo entra sozinho ao carregar
// (index.html, HC_ACTIVE_INSTANT_SESSION), e um cenário herdaria a conta do anterior.
async function abrir(browser, viewport) {
  const ctx = browser.createBrowserContext ? await browser.createBrowserContext() : await browser.createIncognitoBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport(viewport);
  await page.setRequestInterception(true);
  page.on('request', (req) => (/supabase\.co/.test(req.url()) ? req.abort() : req.continue()));
  page.on('dialog', async (d) => { try { await d.accept(); } catch (e) {} });
  const erros = [];
  page.on('pageerror', (e) => erros.push(String(e)));
  await page.goto(BASE_URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof window.enterInstantOperatorMode === 'function' && !!window.avatarPicker);
  return { page, erros, fechar: () => ctx.close() };
}

// Devolve os cartões deformados: foto que não é quadrada ou nome cortado/escondido.
const formatoDosCartoes = (page) => page.evaluate(() => [...document.querySelectorAll('.hcav-card:not([hidden])')]
  .filter((c) => {
    const card = c.getBoundingClientRect();
    const foto = c.querySelector('img').getBoundingClientRect();
    const nome = c.querySelector('.hcav-card-nome').getBoundingClientRect();
    return Math.abs(foto.height - foto.width) > 2 || nome.height < 12 || nome.bottom > card.bottom + 1;
  })
  .map((c) => c.dataset.id));

const telaAberta = (page) => page.evaluate(() => {
  const r = document.getElementById('hcAvatarPicker');
  return !!r && !r.hidden;
});

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,860']
  });

  try {
    // 0. Catálogo e arquivos andam juntos: toda entrada tem a ficha e a miniatura.
    {
      const { page, fechar } = await abrir(browser, DESKTOP);
      const cat = await page.evaluate(async () => {
        const urls = window.HC_AVATARS.flatMap((a) => [`assets/avatars/${a.id}.webp`, `assets/avatars/mini/${a.id}.webp`]);
        const falhas = await Promise.all(urls.map((u) => fetch(u, { cache: 'no-store' }).then((r) => (r.ok ? null : u)).catch(() => u)));
        return {
          total: window.HC_AVATARS.length,
          unicos: new Set(window.HC_AVATARS.map((a) => a.id)).size,
          generos: window.HC_AVATARS.every((a) => a.genero === 'm' || a.genero === 'f'),
          faltando: falhas.filter(Boolean)
        };
      });
      assert.ok(cat.total > 0, 'Catálogo de retratos vazio');
      assert.strictEqual(cat.unicos, cat.total, 'IDs repetidos no catálogo');
      assert.ok(cat.generos, 'Todo retrato precisa de genero m ou f');
      assert.deepStrictEqual(cat.faltando, [], 'Retrato do catálogo sem arquivo');
      await fechar();
    }

    // 1. Jogador novo: escolhe a foto antes do tutorial; confirmar abre o tutorial e põe a foto no HUD.
    {
      const { page, erros, fechar } = await abrir(browser, DESKTOP);
      await page.evaluate(() => window.enterInstantOperatorMode('Foto_Novato'));
      await page.waitForSelector('#hcAvatarPicker:not([hidden])', { timeout: 5000 });
      assert.strictEqual(await page.evaluate(() => window.spotlightTour.isActive), false, 'O tutorial não pode começar antes da foto');
      await espera(600);
      assert.deepStrictEqual(await formatoDosCartoes(page), [], 'Cartão com foto quadrada e nome visível');
      assert.strictEqual(await page.evaluate(() => document.querySelector('.hcav-confirmar').disabled), true, 'Confirmar começa desabilitado');

      const [primeiro, segundo] = await page.evaluate(() => window.HC_AVATARS.slice(0, 2).map((a) => a.id));
      await page.click(`.hcav-card[data-id="${primeiro}"]`);
      await page.keyboard.press('ArrowRight');
      const marcado = await page.evaluate(() => document.querySelector('.hcav-card[aria-checked="true"]').dataset.id);
      assert.strictEqual(marcado, segundo, 'Seta para a direita marca o próximo retrato');

      await page.click('.hcav-confirmar');
      await espera(700);
      const depois = await page.evaluate(() => ({
        aberta: !document.getElementById('hcAvatarPicker').hidden,
        tutorial: window.spotlightTour.isActive,
        hud: (document.querySelector('#hudAvatar.tem-foto img') || {}).getAttribute?.('src') || null,
        salvo: localStorage.getItem('HC_AVATAR_' + window.currentProfile.id)
      }));
      assert.strictEqual(depois.aberta, false, 'Confirmar fecha a tela');
      assert.strictEqual(depois.tutorial, true, 'O tutorial começa depois da foto');
      assert.strictEqual(depois.hud, `assets/avatars/mini/${segundo}.webp`, 'A foto escolhida aparece no HUD');
      assert.strictEqual(depois.salvo, segundo, 'No 1 Clique a escolha fica salva no aparelho');

      // 2. Troca pelo Perfil: abre com a foto atual marcada; Esc fecha.
      await page.evaluate(() => window.spotlightTour.finishTour(true));
      await page.evaluate(() => window.openWindow(document.getElementById('profAvatarCircle').closest('[id^="win"]').id));
      await espera(300);
      await page.click('#profAvatarCircle');
      await page.waitForSelector('#hcAvatarPicker:not([hidden])');
      const troca = await page.evaluate(() => ({
        modo: document.getElementById('hcAvatarPicker').dataset.mode,
        marcado: (document.querySelector('.hcav-card[aria-checked="true"]') || {}).dataset?.id
      }));
      assert.deepStrictEqual(troca, { modo: 'change', marcado: segundo }, 'O Perfil abre a troca com a foto atual marcada');
      await page.keyboard.press('Escape');
      assert.strictEqual(await telaAberta(page), false, 'Esc fecha a troca');

      assert.strictEqual(await page.evaluate(() => window.integrityGuard.cheatStrikes), 0, 'IntegrityGuard deve registrar 0 strikes');
      assert.deepStrictEqual(erros, [], 'Sem erro de JS no fluxo');
      await fechar();
    }

    // 3. "Decidir depois": segue para o tutorial e não pergunta de novo.
    {
      const { page, fechar } = await abrir(browser, DESKTOP);
      await page.evaluate(() => window.enterInstantOperatorMode('Foto_Depois'));
      await page.waitForSelector('#hcAvatarPicker:not([hidden])');
      await page.click('.hcav-depois');
      await espera(600);
      const r = await page.evaluate(() => ({ tutorial: window.spotlightTour.isActive, pergunta: window.avatarPicker.needsChoice() }));
      assert.deepStrictEqual(r, { tutorial: true, pergunta: false }, '"Decidir depois" segue para o tutorial e não pergunta de novo');
      await fechar();
    }

    // 4. Padrão das outras suítes (entrar e encerrar o tutorial na hora): a tela não abre.
    {
      const { page, fechar } = await abrir(browser, DESKTOP);
      await page.evaluate(async () => {
        await window.enterInstantOperatorMode('Foto_Compat');
        window.spotlightTour.finishTour(true);
      });
      await espera(1000);
      assert.strictEqual(await telaAberta(page), false, 'A tela de foto não abre quando o tutorial já foi encerrado');
      await fechar();
    }

    // 5. Logout com a tela aberta: fecha e não começa o tutorial.
    {
      const { page, fechar } = await abrir(browser, DESKTOP);
      await page.evaluate(() => window.enterInstantOperatorMode('Foto_Logout'));
      await page.waitForSelector('#hcAvatarPicker:not([hidden])');
      await page.evaluate(() => window.logoutCurrentSession());
      await espera(800);
      const r = await page.evaluate(() => ({ aberta: !document.getElementById('hcAvatarPicker').hidden, tutorial: window.spotlightTour.isActive }));
      assert.deepStrictEqual(r, { aberta: false, tutorial: false }, 'Logout fecha a tela sem começar o tutorial');
      await fechar();
    }

    // 6. Celular 390x844: confirmar visível e sem estouro horizontal.
    {
      const { page, fechar } = await abrir(browser, { width: 390, height: 844, isMobile: true, hasTouch: true });
      await page.evaluate(() => window.enterInstantOperatorMode('Foto_Celular'));
      await page.waitForSelector('#hcAvatarPicker:not([hidden])');
      await espera(600);
      assert.deepStrictEqual(await formatoDosCartoes(page), [], 'Celular: cartão com foto quadrada e nome visível');
      const id = await page.evaluate(() => window.HC_AVATARS[0].id);
      await page.tap(`.hcav-card[data-id="${id}"]`);
      const r = await page.evaluate(() => {
        const b = document.querySelector('.hcav-confirmar').getBoundingClientRect();
        return {
          visivel: b.top >= 0 && b.bottom <= window.innerHeight,
          habilitado: !document.querySelector('.hcav-confirmar').disabled,
          semEstouro: document.documentElement.scrollWidth <= window.innerWidth
        };
      });
      assert.deepStrictEqual(r, { visivel: true, habilitado: true, semEstouro: true }, 'Celular: confirmar visível e sem estouro horizontal');
      await fechar();
    }

    console.log('✅ SUÍTE FOTO DE PERFIL APROVADA (Catálogo × Arquivos + Escolha antes do Tutorial + Troca no Perfil + Decidir Depois + Compatível com as Suítes + Logout + Celular + 0 Strikes)!');
  } finally {
    await browser.close();
  }
})();
