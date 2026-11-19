/**
 * Hacker City // Teste E2E Automatizado - Fase 3 (LAN, Datacenter, Honeypot & Mapa-Múndi Tático)
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Iniciando Teste E2E - Fase 3: LAN, Datacenter & Mapa-Múndi...');
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

    // 2. Testar LanServersEngine
    console.log('2. Testando Datacenter & Topologia LAN...');
    const lanResult = await page.evaluate(() => {
      if (!window.lanServersEngine) return { error: 'lanServersEngine não encontrado' };

      // Configura carteira com fundos via integridade autorizada
      if (window.integrityGuard) {
        window.integrityGuard.runAuthorized(() => {
          if (window.currentWallet) window.currentWallet.balance = 100000;
        });
      } else if (window.currentWallet) {
        window.currentWallet.balance = 100000;
      }

      const initialCount = window.lanServersEngine.servers.length;
      const initialHp = window.lanServersEngine.servers[1].isHoneypot;
      
      // Inverte honeypot no server 2
      window.lanServersEngine.toggleHoneypot(window.lanServersEngine.servers[1].id);
      const hpAfterToggle = window.lanServersEngine.servers[1].isHoneypot;

      // Inverte de volta para ficar armado
      if (!hpAfterToggle) {
        window.lanServersEngine.toggleHoneypot(window.lanServersEngine.servers[1].id);
      }
      const finalHp = window.lanServersEngine.servers[1].isHoneypot;

      // Comprar novo VPS
      window.lanServersEngine.purchaseServer('vps');
      const newCount = window.lanServersEngine.servers.length;

      // Trocar Gateway para o VPS comprado
      const vps = window.lanServersEngine.servers.find(s => s.type === 'vps');
      if (vps) {
        window.lanServersEngine.setGateway(vps.id);
      }
      const activeGw = window.lanServersEngine.getGatewayServer();

      // Abre modal
      window.openLanModal();

      return {
        initialCount,
        newCount,
        initialHp,
        finalHp,
        activeGwIp: activeGw ? activeGw.ip : null,
        activeGwId: activeGw ? activeGw.id : null,
        nodesCount: window.lanServersEngine.topology.nodes.length
      };
    });

    console.log('Resultado LAN:', lanResult);
    if (lanResult.newCount <= lanResult.initialCount) throw new Error('Falha ao comprar VPS na LAN');
    if (!lanResult.finalHp) throw new Error('Honeypot não permaneceu armado');

    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(evidenceDir, '08_lan_datacenter_topology.png') });
    console.log('📸 Evidência 08 capturada: 08_lan_datacenter_topology.png');

    // Fechar modal LAN
    await page.evaluate(() => {
      const modal = document.getElementById('lan-manager-modal');
      if (modal) modal.style.display = 'none';
    });

    // 3. Testar WorldMapEngine
    console.log('3. Testando Mapa-Múndi Tático & Disputa Territorial...');
    const mapResult = await page.evaluate(() => {
      if (!window.worldMapEngine) return { error: 'worldMapEngine não encontrado' };

      // Garante fundos
      if (window.integrityGuard) {
        window.integrityGuard.runAuthorized(() => {
          if (window.currentWallet) window.currentWallet.balance = 100000;
        });
      }

      // Adiciona saltos de bounce
      window.worldMapEngine.toggleBounceHop('london');
      window.worldMapEngine.toggleBounceHop('tokyo');
      const statsAfterBounce = window.worldMapEngine.getBounceStats();

      // Executa infiltração regional na Europa
      window.worldMapEngine.infiltrateRegion('Europa');
      const euroControl = window.worldMapEngine.territoryControl['Europa'];

      // Abre modal do mapa
      window.openWorldMapModal();

      return {
        hops: statsAfterBounce.hops,
        traceReduction: statsAfterBounce.traceReduction,
        avgPing: statsAfterBounce.avgPing,
        euroControl,
        popsTotal: window.worldMapEngine.pops.length
      };
    });

    console.log('Resultado Mapa-Múndi:', mapResult);
    if (mapResult.hops < 3) throw new Error('Falha ao encadear saltos de bounce');
    if (mapResult.traceReduction <= 0) throw new Error('Falha no cálculo de redução de trace');
    if (mapResult.popsTotal < 50) throw new Error('POPs insuficientes no mapa-múndi');

    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(evidenceDir, '09_world_map_bounce_territories.png') });
    console.log('📸 Evidência 09 capturada: 09_world_map_bounce_territories.png');

    console.log('🎉 SUCESSO TOTAL: Fase 3 100% validada ponta a ponta!');
  } catch (err) {
    console.error('❌ ERRO no teste Fase 3:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
