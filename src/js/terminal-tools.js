/**
 * Hacker City // Terminal Tools & Exploitation Engine
 * Comandos avançados para o terminal CLI:
 * - Modo Interativo /use <nome_do_APP>
 * - Scanners de IP de Sites Fictícios (Tier 1 a 3)
 * - Quebradores de VPN por Combinações Numéricas (Tier 1 a 3)
 * - Animações em Tempo Real (Vermelho para Falha / Verde para Sucesso)
 * - Restrições Reais de CPU & RAM integradas ao HardwareEngine
 * - Hashcat CLI Simulator & Nmap Recon & Botnet C2
 */

const CLI_APPS_CATALOG = {
  ip_scanner: {
    id: 'ip_scanner',
    title: 'IP Scanner Lite v1.0',
    category: 'scan_ip',
    tier: 1,
    potency: 1.0,
    cpu_pct: 20,
    ram_gb: 1.0,
    rate_label: '120 rotas/seg',
    desc: 'Scanner básico de sub-rede para achar o IP real de sites Nível 1 (hc://market, hc://imoveis, hc://jobs).'
  },
  deep_scanner: {
    id: 'deep_scanner',
    title: 'DeepTrace IP Scanner Pro v2.5',
    category: 'scan_ip',
    tier: 2,
    potency: 2.5,
    cpu_pct: 40,
    ram_gb: 2.5,
    rate_label: '450 rotas/seg',
    desc: 'Scanner corporativo (Tier 2) capaz de achar o IP real de hc://vps, hc://vpn, hc://repos e máquinas de outros operadores.'
  },
  quantum_scanner: {
    id: 'quantum_scanner',
    title: 'QuantumTrace Core Scanner v4.0',
    category: 'scan_ip',
    tier: 3,
    potency: 4.5,
    cpu_pct: 65,
    ram_gb: 4.5,
    rate_label: '1.800 rotas/seg',
    desc: 'Scanner militar (Tier 3) para achar o IP real de alvos blindados como o Banco (hc://bank) e a Diretoria Federal (hc://federal).'
  },
  vpn_breaker: {
    id: 'vpn_breaker',
    title: 'VPN Breaker Basic v1.0',
    category: 'vpn_break',
    tier: 1,
    potency: 1.0,
    cpu_pct: 25,
    ram_gb: 1.2,
    rate_label: '150 comb/seg',
    desc: 'Testa combinações numéricas simples para quebrar VPNs Nível 1 (hc://market, hc://imoveis, hc://jobs).'
  },
  vpn_hydra: {
    id: 'vpn_hydra',
    title: 'HydraTunnel VPN Breaker v2.5',
    category: 'vpn_break',
    tier: 2,
    potency: 2.5,
    cpu_pct: 45,
    ram_gb: 3.0,
    rate_label: '600 comb/seg',
    desc: 'Quebra túneis VPN Multi-Hop Nível 2 (hc://vps, hc://vpn, hc://repos e PCs de jogadores como shadow_fox).'
  },
  vpn_quantum: {
    id: 'vpn_quantum',
    title: 'QuantumKey VPN Crusher v4.0',
    category: 'vpn_break',
    tier: 3,
    potency: 5.0,
    cpu_pct: 75,
    ram_gb: 5.5,
    rate_label: '2.400 comb/seg',
    desc: 'Quebrador quântico (Tier 3) para descriptografar VPNs Bancárias (hc://bank) e Governamentais (hc://federal).'
  }
};

const CLI_APP_ALIASES = {
  ip_scanner: 'ip_scanner',
  scanner_v1: 'ip_scanner',
  scan_ip: 'ip_scanner',
  ip: 'ip_scanner',
  scanner: 'ip_scanner',
  net_inspector: 'ip_scanner',
  'net-inspector': 'ip_scanner',
  deep_scanner: 'deep_scanner',
  scanner_v2: 'deep_scanner',
  scanner_pro: 'deep_scanner',
  ip_scanner_pro: 'deep_scanner',
  deeptrace: 'deep_scanner',
  deep: 'deep_scanner',
  quantum_scanner: 'quantum_scanner',
  scanner_v3: 'quantum_scanner',
  apex_scanner: 'quantum_scanner',
  quantumtrace: 'quantum_scanner',
  vpn_breaker: 'vpn_breaker',
  vpn: 'vpn_breaker',
  vpn_v1: 'vpn_breaker',
  vpn_cracker: 'vpn_breaker',
  quebrar_vpn: 'vpn_breaker',
  crack_vpn: 'vpn_breaker',
  breaker: 'vpn_breaker',
  vpn_hydra: 'vpn_hydra',
  vpn_v2: 'vpn_hydra',
  hydra: 'vpn_hydra',
  vpn_breaker_pro: 'vpn_hydra',
  hydratunnel: 'vpn_hydra',
  vpn_quantum: 'vpn_quantum',
  vpn_v3: 'vpn_quantum',
  quantum: 'vpn_quantum',
  quantum_breaker: 'vpn_quantum',
  quantumkey: 'vpn_quantum'
};

const GAME_SITES_DATABASE = {
  market: {
    site_url: 'hc://market',
    host: 'srv-pay.market.hc',
    ip: '10.40.18.22',
    proxy_ip: '172.67.18.100',
    security_tier: 1,
    vpn_shield: 'VPN Comercial 64-bit',
    pay_mode: 'card',
    name: 'HC Market',
    admin_pass: 'adm_root#Mkt2026!',
    ports: '22/ssh, 80/hc-web, 3306/mysql-db, 8080/adm-panel'
  },
  imoveis: {
    site_url: 'hc://imoveis',
    host: 'reg.imoveis.hc',
    ip: '10.40.22.90',
    proxy_ip: '172.67.22.104',
    security_tier: 1,
    vpn_shield: 'VPN Comercial 64-bit',
    pay_mode: 'card',
    name: 'HC Imóveis',
    admin_pass: 'realty_adm#9021!',
    ports: '22/ssh, 80/hc-web, 3306/realty-db, 8080/adm-panel'
  },
  jobs: {
    site_url: 'hc://jobs',
    host: 'portal.jobs.hc',
    ip: '10.40.12.33',
    proxy_ip: '172.67.12.10',
    security_tier: 1,
    vpn_shield: 'VPN Comercial 64-bit',
    pay_mode: 'none',
    name: 'HC Empregos',
    admin_pass: 'jobs_adm#1233!',
    ports: '22/ssh, 80/hc-web, 3306/jobs-db'
  },
  vps: {
    site_url: 'hc://vps',
    host: 'node-ctrl.vps.hc',
    ip: '10.40.30.14',
    proxy_ip: '172.67.30.50',
    security_tier: 2,
    vpn_shield: 'VPN Multi-Hop Corporativa 128-bit',
    pay_mode: 'btc',
    name: 'HC Hosting VPS',
    admin_pass: 'kvm_hyper#3014!',
    ports: '22/ssh, 80/hc-web, 6443/kvm-adm'
  },
  vpn: {
    site_url: 'hc://vpn',
    host: 'relay-master.vpn.hc',
    ip: '10.40.45.88',
    proxy_ip: '172.67.45.88',
    security_tier: 2,
    vpn_shield: 'VPN Multi-Hop WireGuard 128-bit',
    pay_mode: 'btc',
    name: 'HC VPN',
    admin_pass: 'wg_relay#4588!',
    ports: '22/ssh, 51820/wireguard, 8080/adm-panel'
  },
  repos: {
    site_url: 'hc://repos',
    host: 'git-node.repos.hc',
    ip: '10.40.50.77',
    proxy_ip: '172.67.50.77',
    security_tier: 2,
    vpn_shield: 'VPN Multi-Hop Corporativa 128-bit',
    pay_mode: 'btc',
    name: 'HC Repos',
    admin_pass: 'git_adm#5077!',
    ports: '22/ssh, 80/hc-git, 3306/repos-db'
  },
  player_shadow: {
    site_url: 'hc://remote?host=rig-shadowfox.player.hc',
    host: 'rig-shadowfox.player.hc',
    ip: '10.24.88.14',
    proxy_ip: '185.220.101.14',
    security_tier: 2,
    vpn_shield: 'VPN Pessoal Stealth 128-bit (shadow_fox)',
    pay_mode: 'none',
    name: 'PC Operador shadow_fox',
    admin_pass: 'fox_rig#7712!',
    ports: '22/ssh, 8080/vfs-share'
  },
  player_neon: {
    site_url: 'hc://remote?host=wk-neonghost.player.hc',
    host: 'wk-neonghost.player.hc',
    ip: '10.24.91.203',
    proxy_ip: '185.220.101.203',
    security_tier: 2,
    vpn_shield: 'VPN Pessoal Stealth 128-bit (neon_ghost)',
    pay_mode: 'none',
    name: 'PC Operador neon_ghost',
    admin_pass: 'neon_wk#4419!',
    ports: '22/ssh, 3306/local-db'
  },
  player_zero: {
    site_url: 'hc://remote?host=node-zerocool.player.hc',
    host: 'node-zerocool.player.hc',
    ip: '10.24.55.40',
    proxy_ip: '185.220.101.40',
    security_tier: 2,
    vpn_shield: 'VPN Pessoal Stealth 128-bit (zero_cool)',
    pay_mode: 'none',
    name: 'PC Operador zero_cool',
    admin_pass: 'zero_node#1995!',
    ports: '22/ssh, 80/payload-srv'
  },
  bank: {
    site_url: 'hc://bank',
    host: 'core-auth.bank.hc',
    ip: '10.40.10.5',
    proxy_ip: '198.51.100.10',
    security_tier: 3,
    vpn_shield: 'VPN Blindada Bancária 256-bit (QuantumGuard)',
    pay_mode: 'bank',
    name: 'HC Bank',
    admin_pass: 'vault_core#8840!',
    ports: '22/ssh, 443/hc-tls, 5432/bank-db, 8443/adm-panel'
  },
  federal: {
    site_url: 'hc://federal',
    host: 'intranet.dfc.hc',
    ip: '10.40.99.1',
    proxy_ip: '198.51.100.99',
    security_tier: 3,
    vpn_shield: 'VPN Militar Governamental 256-bit (DFC-Shield)',
    pay_mode: 'none',
    name: 'Diretoria Federal',
    admin_pass: 'dfc_sec#9901!',
    ports: '22/ssh, 443/gov-tls, 5432/trace-db'
  }
};

class TerminalToolsEngine {
  constructor() {
    this.dictionary = [
      { plain: 'admin123', md5: '0192023a7bbd73250516f069df18b500' },
      { plain: 'shadow2040', md5: '3c9909afec25354d551dae21590bb26e' },
      { plain: 'p@ssword', md5: '5f4dcc3b5aa765d61d8327deb882cf99' },
      { plain: 'matrix404', md5: '827ccb0eea8a706c4c34a16891f84e7b' },
      { plain: 'root_toor', md5: 'b10a8db164e0754105b7a99be72e3fe5' },
      { plain: 'secret77', md5: '7d793037a0760186574b0282f2f435e7' },
      { plain: 'hacktheplanet', md5: '5d41402abc4b2a76b9719d911017c592' }
    ];

    this.botnetNodes = 42;
    this.activeCliAppId = null;
    this.discoveredIps = {};
    this.brokenVpnTargets = {};
    this.isAnimationRunning = false;
  }

  // Resolução de sites ou IPs da rede fictícia do jogo
  resolveSiteOrIp(rawQuery) {
    if (!rawQuery) return null;
    let q = rawQuery.trim().toLowerCase().replace(/^https?:\/\//, '');

    if (q === 'shadow_fox' || q === 'shadowfox') q = 'player_shadow';
    else if (q === 'neon_ghost' || q === 'neonghost') q = 'player_neon';
    else if (q === 'zero_cool' || q === 'zerocool') q = 'player_zero';
    else if (q === 'banco' || q === 'apexbank') q = 'bank';
    else if (q === 'governo' || q === 'gov' || q === 'dfc') q = 'federal';
    else if (q === 'mercado' || q === 'loja') q = 'market';

    if (q.startsWith('hc://')) {
      let clean = q.replace(/^hc:\/\//, '').split('/')[0].split('?')[0];
      if (clean === 'realty') clean = 'imoveis';
      if (clean === 'gov') clean = 'federal';
      if (GAME_SITES_DATABASE[clean]) {
        return { ...GAME_SITES_DATABASE[clean], site_key: clean };
      }
    }

    for (const [k, meta] of Object.entries(GAME_SITES_DATABASE)) {
      if (
        q === k ||
        q === meta.ip.toLowerCase() ||
        q === meta.proxy_ip.toLowerCase() ||
        q === meta.host.toLowerCase() ||
        meta.host.toLowerCase().startsWith(q)
      ) {
        return { ...meta, site_key: k };
      }
      const ipPrefix = meta.ip.substring(0, meta.ip.lastIndexOf('.') + 1);
      if (ipPrefix && q.startsWith(ipPrefix)) {
        return { ...meta, site_key: k };
      }
    }

    // Alvo genérico ou desconhecido
    return {
      site_url: 'hc://custom',
      host: 'node-ext.' + q + '.hc',
      ip: q.includes('.') ? q : '10.40.80.12',
      proxy_ip: '172.67.80.100',
      security_tier: q.includes('bank') || q.includes('federal') ? 3 : 1,
      vpn_shield: 'VPN Comercial 64-bit',
      ports: '22/ssh, 80/http, 8080/adm',
      name: 'Nó Externo ' + q,
      site_key: 'custom'
    };
  }

  // Multiplicador de Potência de CPU baseado no HardwareEngine
  getCpuMultiplier() {
    if (!window.hardwareEngine) return 1.0;
    const cpu = window.hardwareEngine.getCpu();
    switch (cpu.id) {
      case 'celeron_800': return 1.0;
      case 'pentium_4': return 1.25;
      case 'core_2_quad': return 1.75;
      case 'xeon_server': return 2.5;
      case 'quantum_core': return 4.0;
      default: return 1.0;
    }
  }

  // Verifica se o terminal está com aplicativo /use ativo no momento
  isAppPanelActive() {
    return this.activeCliAppId !== null;
  }

  // Fecha o painel de aplicativo /use e restaura o prompt padrão
  exitAppPanel(appendCli, hackerTag = 'user') {
    const closed = this.activeCliAppId;
    this.activeCliAppId = null;
    const promptTag = document.getElementById('cliPromptTag');
    if (promptTag) {
      promptTag.innerText = `${hackerTag.toLowerCase()}@hackercity:~$`;
      promptTag.style.color = '#5fd39a';
    }
    if (window.hackerAudio) window.hackerAudio.playKeyClick();
    appendCli(`[PAINEL ENCERRADO] Aplicativo '${closed}' fechado. Recursos de CPU e RAM liberados.`, '#35b877');
  }

  // Exibe o painel interativo ou lista o catálogo do comando /use
  executeUseApp(appQuery, directTarget, appendCli, profile, wallet) {
    const q = (appQuery || '').trim().toLowerCase().replace(/^\//, '');
    const hackerTag = profile ? profile.hacker_tag : 'user';

    if (!q || q === 'list' || q === 'help' || q === '--help' || q === '-h' || q === 'ls') {
      const cpuMult = this.getCpuMultiplier();
      const cpuName = window.hardwareEngine ? window.hardwareEngine.getCpu().name : 'Celeron 800MHz';
      const ramName = window.hardwareEngine ? window.hardwareEngine.getRam().name : '256MB RAM';

      appendCli('╔══════════════════════════════════════════════════════════════════════════════╗', '#35b877');
      appendCli('║  CATÁLOGO DE APLICATIVOS DE TERMINAL (/use <nome_do_APP>)                 ║', '#35b877');
      appendCli('╠══════════════════════════════════════════════════════════════════════════════╣', '#35b877');
      appendCli(`  Seu Setup: CPU ${cpuName} [${cpuMult.toFixed(1)}x] | RAM ${ramName}`, '#f0a03a');
      appendCli('');
      appendCli('  ▸ APPS DE SCAN DE IP DE SITES (Descobrem o IP Real da VPS do site):', '#35b877');
      appendCli('    1. /use ip_scanner      [Tier 1 | Potência 1.0x | +20% CPU | +1.0GB RAM] -> Sites Básicos (market, imoveis, jobs)', '#35b877');
      appendCli('    2. /use deep_scanner    [Tier 2 | Potência 2.5x | +40% CPU | +2.5GB RAM] -> Sites Corp & Operadores (vps, vpn, shadow_fox)', '#f0a03a');
      appendCli('    3. /use quantum_scanner [Tier 3 | Potência 4.5x | +65% CPU | +4.5GB RAM] -> Alta Segurança (hc://bank, hc://federal)', '#b3a9f5');
      appendCli('');
      appendCli('  ▸ APPS DE QUEBRA DE VPN (Testam combinações numéricas no túnel):', '#35b877');
      appendCli('    4. /use vpn_breaker     [Tier 1 | Potência 1.0x | +25% CPU | +1.2GB RAM] -> Quebra VPN Comercial 64-bit (Tier 1)', '#35b877');
      appendCli('    5. /use vpn_hydra       [Tier 2 | Potência 2.5x | +45% CPU | +3.0GB RAM] -> Quebra VPN Multi-Hop 128-bit (Tier 2 & PCs)', '#f0a03a');
      appendCli('    6. /use vpn_quantum     [Tier 3 | Potência 5.0x | +75% CPU | +5.5GB RAM] -> Quebra VPN Bancária/Militar 256-bit (Tier 3)', '#b3a9f5');
      appendCli('╚══════════════════════════════════════════════════════════════════════════════╝', '#35b877');
      appendCli("→ Digite '/use <nome_do_APP>' para entrar no painel e informar o alvo!", '#aab3c0');
      return;
    }

    const resolvedId = CLI_APP_ALIASES[q];
    if (!resolvedId || !CLI_APPS_CATALOG[resolvedId]) {
      if (window.hackerAudio) window.hackerAudio.playErrorBuzz();
      appendCli(`[ERRO /use] Aplicativo '${appQuery}' não encontrado. Digite '/use' para listar todos.`, '#d0443a');
      return;
    }

    const appInfo = CLI_APPS_CATALOG[resolvedId];
    this.activeCliAppId = resolvedId;

    // Atualiza o prompt do terminal para modo interativo
    const promptTag = document.getElementById('cliPromptTag');
    if (promptTag) {
      promptTag.innerText = `[APP: ${resolvedId}] ALVO >>`;
      promptTag.style.color = '#f0a03a';
    }

    if (window.hackerAudio) window.hackerAudio.playEnterBeep();

    const catLabel = appInfo.category === 'scan_ip' ? 'RASTREAMENTO & SCAN DE IP DE SITE' : 'QUEBRA DE VPN POR COMBINAÇÕES NUMÉRICAS';
    const cpuMult = this.getCpuMultiplier();

    appendCli('╔══════════════════════════════════════════════════════════════════════════════╗', '#35b877');
    appendCli(`║ PAINEL DO APLICATIVO ATIVO: ${appInfo.title.toUpperCase().padEnd(45)} ║`, '#35b877');
    appendCli('╠══════════════════════════════════════════════════════════════════════════════╣', '#35b877');
    appendCli(`  • Módulo Operacional: ${catLabel}`, '#eceff3');
    appendCli(`  • Potência do App:    Tier ${appInfo.tier} (${appInfo.potency.toFixed(1)}x — ${appInfo.rate_label})`, '#f0a03a');
    appendCli(`  • Custo em Execução:  +${appInfo.cpu_pct}% CPU  |  +${appInfo.ram_gb.toFixed(1)} GB RAM`, '#d0443a');
    appendCli(`  • Seu Processador:    Multiplicador de Hardware ${cpuMult.toFixed(1)}x`, '#35b877');
    appendCli(`  • Descrição:          ${appInfo.desc}`, '#aab3c0');
    appendCli('╚══════════════════════════════════════════════════════════════════════════════╝', '#35b877');
    appendCli(">>> [AGUARDANDO ALVO] Digite o site ou IP alvo (ex: hc://market, hc://bank, shadow_fox, 10.40.18.22) ou 'sair':", '#f0a03a');

    if (directTarget && directTarget.trim()) {
      this.runInteractiveTargetTest(directTarget.trim(), appendCli, profile);
    }
  }

  // Executa o teste de combinações em tempo real com animação linha a linha
  runInteractiveTargetTest(targetStr, appendCli, profile) {
    if (this.isAnimationRunning) return;
    const appInfo = CLI_APPS_CATALOG[this.activeCliAppId] || CLI_APPS_CATALOG.ip_scanner;
    const meta = this.resolveSiteOrIp(targetStr);

    const siteUrl = meta.site_url;
    const realHost = meta.host;
    const realIp = meta.ip;
    const proxyIp = meta.proxy_ip;
    const portsStr = meta.ports;
    const secTier = meta.security_tier;
    const vpnShield = meta.vpn_shield;
    const category = appInfo.category;

    const cpuMult = this.getCpuMultiplier();
    const effectivePower = appInfo.potency * cpuMult;
    const requiredPower = secTier === 1 ? 1.0 : (secTier === 2 ? 2.0 : 4.0);
    const canSucceed = (appInfo.tier >= secTier) || (effectivePower >= requiredPower);

    const ipParts = realIp.split('.');
    const ipPrefix = `${ipParts[0] || '10'}.${ipParts[1] || '40'}.${ipParts[2] || '18'}`;
    const lastOct = ipParts[3] || '22';

    appendCli(`[${appInfo.title.toUpperCase()} // INICIANDO TESTE EM TEMPO REAL]`, '#35b877');
    appendCli(`  Alvo Informado: ${targetStr}  |  Segurança do Alvo: Nível ${secTier} (${vpnShield})`, '#aab3c0');
    appendCli(`  Recursos Alocados: +${appInfo.cpu_pct}% CPU | +${appInfo.ram_gb.toFixed(1)} GB RAM | Potência Total: ${effectivePower.toFixed(1)}x`, '#f0a03a');

    if (!canSucceed) {
      appendCli(`  [ALERTA DE HARDWARE] Potência atual (${effectivePower.toFixed(1)}x) abaixo do exigido (${requiredPower.toFixed(1)}x) para alvos Nível ${secTier}!`, '#d0443a');
    }

    this.isAnimationRunning = true;

    let steps = [];
    if (!canSucceed) {
      if (category === 'scan_ip') {
        steps = [
          { text: `  [TESTE #01/06] [##--------] Sondando Proxy ${proxyIp} :: Combinação Rota #4810-92 -> NEGATIVO (Bloqueado pelo Firewall)`, color: '#d0443a', isPositive: false },
          { text: `  [TESTE #02/06] [####------] Sondando Sub-rede ${ipPrefix}.04 :: Combinação Rota #7391-11 -> NEGATIVO (Pacote Descartado / Timeout)`, color: '#d0443a', isPositive: false },
          { text: `  [TESTE #03/06] [#####-----] Sondando Sub-rede ${ipPrefix}.19 :: Combinação Rota #9920-44 -> NEGATIVO (Criptografia ${vpnShield} Rejeitou)`, color: '#d0443a', isPositive: false },
          { text: `  [TESTE #04/06] [#######---] Sondando Gateway ${ipPrefix}.88  :: Combinação Rota #1048-77 -> NEGATIVO (Potência ${effectivePower.toFixed(1)}x Insuficiente)`, color: '#d0443a', isPositive: false },
          { text: `  [TESTE #05/06] [########--] Sondando Túnel ${ipPrefix}.142  :: Combinação Rota #5532-09 -> NEGATIVO (Rota Ocultada por Anti-DDoS)`, color: '#d0443a', isPositive: false },
          { text: `  [TESTE #06/06] [##########] Limite Atingido :: 0/6 rotas abertas -> NEGATIVO [OPERAÇÃO ABORTADA]`, color: '#d0443a', isPositive: false }
        ];
      } else {
        steps = [
          { text: `  [COMBINAÇÃO #01/06] [##--------] Testando Chave VPN [4819 - 2094 - 8812 - 04] -> NEGATIVO (Recusado pela ${vpnShield})`, color: '#d0443a', isPositive: false },
          { text: `  [COMBINAÇÃO #02/06] [####------] Testando Chave VPN [9032 - 1184 - 7740 - 19] -> NEGATIVO (Hash Criptográfico Inválido)`, color: '#d0443a', isPositive: false },
          { text: `  [COMBINAÇÃO #03/06] [#####-----] Testando Chave VPN [3310 - 6659 - 1029 - 88] -> NEGATIVO (Potência Insuficiente)`, color: '#d0443a', isPositive: false },
          { text: `  [COMBINAÇÃO #04/06] [#######---] Testando Chave VPN [7741 - 0092 - 4418 - 53] -> NEGATIVO (Firewall Nível ${secTier} Bloqueou Força Bruta)`, color: '#d0443a', isPositive: false },
          { text: `  [COMBINAÇÃO #05/06] [########--] Testando Chave VPN [6190 - 8832 - 5501 - 27] -> NEGATIVO (Timeout: Setup Básico)`, color: '#d0443a', isPositive: false },
          { text: `  [COMBINAÇÃO #06/06] [##########] Testando Chave VPN [1904 - 4421 - 9980 - 00] -> NEGATIVO [FALHA DE QUEBRA DE VPN]`, color: '#d0443a', isPositive: false }
        ];
      }
    } else {
      if (category === 'scan_ip') {
        steps = [
          { text: `  [TESTE #01/06] [##--------] Sondando Proxy Público ${proxyIp} :: Combinação #4091-A -> NEGATIVO (Proxy Reverso)`, color: '#d0443a', isPositive: false },
          { text: `  [TESTE #02/06] [###-------] Sondando Nó ${ipPrefix}.08:8080     :: Combinação #7712-B -> NEGATIVO (Honeypot Descartado)`, color: '#d0443a', isPositive: false },
          { text: `  ✓ [TESTE #03/06] [#####-----] Sub-rede ${ipPrefix}.0/24           :: Combinação #8840-OK -> POSITIVO (Sub-rede Localizada!)`, color: '#35b877', isPositive: true },
          { text: `  [TESTE #04/06] [#######---] Sondando Nó ${ipPrefix}.14:22       :: Combinação #3190-C -> NEGATIVO (Porta Filtrada)`, color: '#d0443a', isPositive: false },
          { text: `  ✓ [TESTE #05/06] [########--] Host ${realHost} (${ipPrefix}.x) :: Combinação #9921-OK -> POSITIVO (Resposta SSH 9ms!)`, color: '#35b877', isPositive: true },
          { text: `  ✓ [TESTE #06/06] [##########] Octeto Final .${lastOct} Confirmado  :: IP REAL DESCOBERTO: ${realIp} -> POSITIVO!`, color: '#35b877', isPositive: true }
        ];
      } else {
        steps = [
          { text: `  [COMBINAÇÃO #01/06] [##--------] Testando Chave Numérica [4829 - 1044 - 9921 - 17] -> NEGATIVO (Handshake Recusado)`, color: '#d0443a', isPositive: false },
          { text: `  ✓ [COMBINAÇÃO #02/06] [###-------] Bloco #1 Descoberto     [8840 - **** - **** - **] -> POSITIVO (1º Segmento Aceito!)`, color: '#35b877', isPositive: true },
          { text: `  [COMBINAÇÃO #03/06] [#####-----] Testando Chave Numérica [8840 - 7391 - 1104 - 62] -> NEGATIVO (Colisão de Nonce)`, color: '#d0443a', isPositive: false },
          { text: `  ✓ [COMBINAÇÃO #04/06] [#######---] Bloco #2 Descoberto     [8840 - 3319 - **** - **] -> POSITIVO (2º Segmento Aceito!)`, color: '#35b877', isPositive: true },
          { text: `  [COMBINAÇÃO #05/06] [########--] Testando Chave Numérica [8840 - 3319 - 5502 - 89] -> NEGATIVO (Porta Rejeitada)`, color: '#d0443a', isPositive: false },
          { text: `  ✓ [COMBINAÇÃO #06/06] [##########] Combinação Mestra       [8840 - 3319 - 9042 - ${lastOct}] -> POSITIVO! (VPN QUEBRADA!)`, color: '#35b877', isPositive: true }
        ];
      }
    }

    let i = 0;
    const intervalTime = Math.max(120, Math.floor(280 / (cpuMult * (appInfo.potency * 0.45))));

    const stepTimer = setInterval(() => {
      if (i < steps.length) {
        const item = steps[i];
        appendCli(item.text, item.color);
        if (window.hackerAudio) {
          if (item.isPositive) window.hackerAudio.playKeyClick();
          else window.hackerAudio.playKeyClick();
        }
        i++;
      } else {
        clearInterval(stepTimer);
        this.isAnimationRunning = false;

        if (!canSucceed) {
          if (window.hackerAudio) window.hackerAudio.playErrorBuzz();
          const recApp = category === 'scan_ip' ? (secTier === 2 ? '/use deep_scanner' : '/use quantum_scanner') : (secTier === 2 ? '/use vpn_hydra' : '/use vpn_quantum');
          appendCli('╔══════════════════════════════════════════════════════════════════════════════╗', '#d0443a');
          appendCli(`║ [RESULTADO NEGATIVO] POTÊNCIA INSUFICIENTE PARA O ALVO (NÍVEL ${secTier})         ║`, '#d0443a');
          appendCli('╠══════════════════════════════════════════════════════════════════════════════╣', '#d0443a');
          appendCli(`  • Um setup básico com ${appInfo.title} não quebra ${targetStr} em tempo hábil!`, '#f79a91');
          appendCli(`  • Potência Atual: ${effectivePower.toFixed(1)}x  |  Potência Exigida: ${requiredPower.toFixed(1)}x`, '#f0a03a');
          appendCli(`  • Solução: Use um app superior digitando ${recApp} ou compre uma CPU na Oficina de Hardware!`, '#5fd39a');
          appendCli('╚══════════════════════════════════════════════════════════════════════════════╝', '#d0443a');
          appendCli(`>>> [PAINEL ${this.activeCliAppId}] Digite outro ALVO ou 'sair':`, '#f0a03a');
        } else {
          if (window.hackerAudio) window.hackerAudio.playCashChime();
          this.discoveredIps[meta.site_key] = realIp;

          if (category === 'scan_ip') {
            const nextVpn = secTier === 1 ? 'vpn_breaker' : (secTier === 2 ? 'vpn_hydra' : 'vpn_quantum');
            appendCli('╔══════════════════════════════════════════════════════════════════════════════╗', '#35b877');
            appendCli('║ ✓ [RESULTADO POSITIVO] IP REAL DO ALVO DESCOBERTO COM SUCESSO!               ║', '#35b877');
            appendCli('╠══════════════════════════════════════════════════════════════════════════════╣', '#35b877');
            appendCli(`  • Alvo Rastreado:     ${siteUrl} -> Host VPS: ${realHost}`, '#eceff3');
            appendCli(`  • IP Real Encontrado: ${realIp} (Portas: ${portsStr})`, '#35b877');
            appendCli(`  • Proteção de Rede:   ${vpnShield}`, '#f0a03a');
            appendCli(`  • Próximo Passo:      Quebre a VPN usando /use ${nextVpn} e informe o alvo ${realIp}!`, '#5fd39a');
            appendCli('╚══════════════════════════════════════════════════════════════════════════════╝', '#35b877');
            appendCli(`>>> [PAINEL ${this.activeCliAppId}] Digite outro ALVO, '/use ${nextVpn}' para quebrar a VPN, ou 'sair':`, '#f0a03a');
          } else {
            this.brokenVpnTargets[realIp] = true;
            appendCli('╔══════════════════════════════════════════════════════════════════════════════╗', '#35b877');
            appendCli('║ ✓ [RESULTADO POSITIVO] TÚNEL VPN QUEBRADO & ACESSO DIRETO LIBERADO!          ║', '#35b877');
            appendCli('╠══════════════════════════════════════════════════════════════════════════════╣', '#35b877');
            appendCli(`  • Alvo Desbloqueado:  ${realHost} (${realIp})`, '#eceff3');
            appendCli(`  • Chave VPN Quebrada: [8840 - 3319 - 9042 - ${lastOct}] (${vpnShield} Bypassed)`, '#f0a03a');
            appendCli(`  • Credencial Admin:   root / ${meta.admin_pass}`, '#35b877');
            appendCli(`  • Próximo Passo:      Execute 'hack ${realIp}' ou 'nmap ${realIp}' no terminal!`, '#5fd39a');
            appendCli('╚══════════════════════════════════════════════════════════════════════════════╝', '#35b877');
            appendCli(`>>> [PAINEL ${this.activeCliAppId}] Digite outro ALVO, 'hack ${realIp}' ou 'sair':`, '#f0a03a');
          }
        }
      }
    }, intervalTime);
  }

  // Quebrador de Hash (Hashcat CLI Simulator)
  crackHash(hashStr, onProgress, onDone) {
    let step = 0;
    const cpuFactor = window.hardwareEngine ? (4000 / window.hardwareEngine.getCooldownMs()) : 1;
    const speedBase = Math.floor(180 * cpuFactor);

    const interval = setInterval(() => {
      step += Math.floor(15 * cpuFactor);
      if (step > 100) step = 100;

      const currentSpeed = speedBase + Math.floor(Math.random() * 30);
      onProgress(step, currentSpeed);

      if (step >= 100) {
        clearInterval(interval);
        const match = this.dictionary.find(d => d.md5.toLowerCase() === hashStr.toLowerCase());
        const result = match ? match.plain : 'KEY_' + Math.random().toString(36).substring(2, 8).toUpperCase();
        onDone(result);
      }
    }, 120);
  }

  // Varredor de Portas (Nmap Reconnaissance)
  scanPorts(ip, onDone) {
    const knownHosts = {
      '192.168.0.14': [
        { port: '21/tcp', state: 'open', service: 'ftp', banner: 'vsftpd 2.3.4 (Backdoor Exploitável)' },
        { port: '80/tcp', state: 'open', service: 'http', banner: 'Boa HTTPd 0.94.14 (Admin Web)' }
      ],
      '10.0.1.88': [
        { port: '80/tcp', state: 'open', service: 'http', banner: 'Apache 2.4.41 (SQLi em /api/v1/auth)' },
        { port: '3306/tcp', state: 'filtered', service: 'mysql', banner: 'MySQL Enterprise 8.0' }
      ],
      '172.16.4.12': [
        { port: '23/tcp', state: 'open', service: 'telnet', banner: 'BusyBox telnetd (Credenciais Default)' },
        { port: '554/tcp', state: 'open', service: 'rtsp', banner: 'RTSP Stream Video H.264' }
      ],
      '192.168.0.99': [
        { port: '445/tcp', state: 'open', service: 'microsoft-ds', banner: 'SMBv1 Vulnerável a EternalBlue (MS17-010)' },
        { port: '139/tcp', state: 'open', service: 'netbios-ssn', banner: 'NetBIOS Windows NT' }
      ],
      '10.40.18.22': [
        { port: '22/tcp', state: 'open', service: 'ssh', banner: 'OpenSSH 9.2p1 (HC Market VPS)' },
        { port: '80/tcp', state: 'open', service: 'http', banner: 'Node.js Express E-Commerce API' },
        { port: '3306/tcp', state: 'open', service: 'mysql', banner: 'cards_vault.db' }
      ],
      '10.40.10.5': [
        { port: '22/tcp', state: 'open', service: 'ssh', banner: 'OpenSSH 9.6 Security Hardened (HC Bank Core)' },
        { port: '443/tcp', state: 'open', service: 'https', banner: 'TLS 1.3 Bank Vault Gateway' },
        { port: '5432/tcp', state: 'open', service: 'postgresql', banner: 'PostgreSQL 17.12 Master Ledger' }
      ],
      '10.40.99.1': [
        { port: '22/tcp', state: 'open', service: 'ssh', banner: 'DFC Military Gate (Diretoria Federal)' },
        { port: '443/tcp', state: 'open', service: 'https', banner: 'Intranet Federal DFC Portal' },
        { port: '5432/tcp', state: 'open', service: 'postgresql', banner: 'Federal Dossier Database' }
      ]
    };

    setTimeout(() => {
      const results = knownHosts[ip] || [
        { port: '80/tcp', state: 'open', service: 'http', banner: 'Nginx 1.18.0 (API Gateway)' },
        { port: '8080/tcp', state: 'open', service: 'http-proxy', banner: 'Node.js Express REST Backend' }
      ];
      onDone(results);
    }, 600);
  }

  // Status da Rede Botnet C2
  getBotnetMetrics(specialty = '') {
    const isBotmaster = (specialty.toLowerCase() === 'botmaster');
    const nodes = isBotmaster ? Math.floor(this.botnetNodes * 1.5) : this.botnetNodes;
    const hashRate = (nodes * 12.4).toFixed(1);
    const hourlyIncome = (nodes * 4.2 * (isBotmaster ? 1.3 : 1.0)).toFixed(2);

    return {
      nodes,
      hashRate: `${hashRate} MH/s`,
      hourlyIncome: `$ ${hourlyIncome} HC/hora`,
      isBotmaster
    };
  }
}

window.terminalTools = new TerminalToolsEngine();
