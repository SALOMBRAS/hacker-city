/**
 * Hacker City // Ecossistema Interligado (Pilares II a VI — 54 Mecânicas Cruzadas)
 *
 * Regra Central de Design:
 * Nenhuma mecânica aqui opera isolada! Cada ação alimenta outros sistemas do jogo:
 * - Invadir/Sabotar Empresas ou Câmeras CFTV -> Derruba ações na Bolsa CyberStock (lucro em Short!) + gera Manchete em Notícias.
 * - Contratos .cct em Servidores Invadidos + 6 Minigames -> Geram Catalisadores pro Laboratório de Vírus, Dossiês OSINT, CVEs 24h e Influência no Mapa-Múndi.
 * - Forja False-Flag em /var/log/syslog -> Limpa seu IP e aciona investigação da Safenet/FBI contra o rival incriminado.
 * - Mapa-Múndi (50 Cidades) -> Aplica bônus numéricos reais em Cracker, Mineração BTC, Coletor e Faturas.
 * - Servidores VPS Comprados -> Rodam CronDaemons legítimos (Auto-Harvest, Auto-Pagamento às 12:00, Vigia de Rastros e Reinvestimento).
 * - Seguro de Hardware + Auditoria Pentest -> Protege o PC contra dano físico de DDoS.
 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function runAuth(fn) {
    if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
      return window.integrityGuard.runAuthorized(fn);
    }
    return fn();
  }

  // 8 Megacorporações Reais presentes no navegador Internet e CFTV
  const STOCK_CORPS = [
    { symbol: 'FARO', name: 'Farofa Systems B2B', ip: '203.17.88.40', sector: 'Cloud & CFTV', basePrice: 42.00, divYield: 0.022 },
    { symbol: 'MRDN', name: 'Meridian BioLabs', ip: '194.88.14.202', sector: 'BioTech P&D', basePrice: 68.50, divYield: 0.018 },
    { symbol: 'AEGS', name: 'Aegis Security Corp', ip: '172.66.40.18', sector: 'Vigilância NVR', basePrice: 54.00, divYield: 0.025 },
    { symbol: 'CRVO', name: 'Corvo Cinza Logística', ip: '58.40.12.9', sector: 'Frota & Docas', basePrice: 37.20, divYield: 0.028 },
    { symbol: 'KRNO', name: 'KronoTech Sistemas', ip: '189.40.7.12', sector: 'Data Centers', basePrice: 92.00, divYield: 0.020 },
    { symbol: 'OMNI', name: 'OmniDyne Defense', ip: '192.99.44.80', sector: 'Defesa Orbital', basePrice: 148.00, divYield: 0.016 },
    { symbol: 'HEBC', name: 'HEBC Clearing Bank', ip: '77.3.10.44', sector: 'Clearing Financeiro', basePrice: 116.00, divYield: 0.030 },
    { symbol: 'EVIL', name: 'EvilCorp Conglomerate', ip: '209.141.55.10', sector: 'MegaCorp Global', basePrice: 215.00, divYield: 0.015 }
  ];

  const FACTIONS_DEF = [
    {
      id: 'omnicorp',
      name: 'Consórcio White-Hat',
      badge: 'success',
      focus: 'Auditoria, Defesa Blue-Team & Valorização na Bolsa',
      perkDesc: 'Cada 100 pts reduz -5% no custo de Peças de Hardware e aumenta dividendos às 12:00.'
    },
    {
      id: 'syndicate',
      name: 'The Dark Syndicate',
      badge: 'danger',
      focus: 'Sabotagem CFTV, Short Selling & Saques Corporativos',
      perkDesc: 'Cada 100 pts aumenta +8% o pagamento de golpes de equipe e saques remotos.'
    },
    {
      id: 'cicada',
      name: 'Ordem Cicada 3301',
      badge: 'info',
      focus: 'Contratos Criptográficos .CCT, Zero-Days & Laboratório',
      perkDesc: 'Cada 100 pts concede +3 pts extras de Encaixe no Laboratório de Vírus e +15% em .cct.'
    },
    {
      id: 'safenet_div',
      name: 'Divisão Terceirizada Safenet',
      badge: 'warning',
      focus: 'Caça a Procurados, Forense & Forja Tática',
      perkDesc: 'Cada 100 pts reduz a chance de rastreio policial e aumenta recompensas do FBI.'
    }
  ];

  const CREW_HEISTS = [
    {
      id: 'heist_meridian',
      title: 'Operação Câmara Fria Meridian',
      targetIp: '194.88.14.202',
      corpSymbol: 'MRDN',
      minCracker: 1.0,
      minHops: 2,
      needsCctvOrOsint: false,
      cooldownMs: 3 * 60 * 1000,
      cashReward: 1650,
      repReward: 65,
      factionId: 'syndicate',
      catalystGrant: 1,
      desc: 'Coordena 4 papéis (Infiltrador + CFTV + Rota de Saltos + Extrator) para drenar patentes da Meridian BioLabs e abalar MRDN no pregão.'
    },
    {
      id: 'heist_aegis_blind',
      title: 'Apagão Sincronizado Aegis 6x',
      targetIp: '172.66.40.18',
      corpSymbol: 'AEGS',
      minCracker: 1.0,
      minHops: 2,
      needsCctvOrOsint: true,
      cooldownMs: 4 * 60 * 1000,
      cashReward: 2450,
      repReward: 95,
      factionId: 'syndicate',
      catalystGrant: 1,
      desc: 'Desativa a central NVR da Aegis Security enquanto a equipe desvia fundos blindados e colhe 1 Catalisador de Bancada.'
    },
    {
      id: 'heist_hebc_clearing',
      title: 'Desvio Interbancário HEBC',
      targetIp: '77.3.10.44',
      corpSymbol: 'HEBC',
      minCracker: 2.0,
      minHops: 3,
      needsCctvOrOsint: true,
      cooldownMs: 5 * 60 * 1000,
      cashReward: 4200,
      repReward: 140,
      factionId: 'cicada',
      catalystGrant: 1,
      desc: 'Intercepta malotes SWIFT na compensação do HEBC usando rota internacional de 3+ saltos no Mapa-Múndi.'
    },
    {
      id: 'heist_omnidyne_sat',
      title: 'Sequestro de Telemetria OmniDyne',
      targetIp: '192.99.44.80',
      corpSymbol: 'OMNI',
      minCracker: 3.0,
      minHops: 4,
      needsCctvOrOsint: true,
      cooldownMs: 6 * 60 * 1000,
      cashReward: 6800,
      repReward: 210,
      factionId: 'cicada',
      catalystGrant: 2,
      desc: 'Operação de elite em 4 frentes contra o complexo aeroespacial OmniDyne, rendendo alto caixa + 2 Catalisadores.'
    }
  ];

  const CRON_DAEMONS = [
    {
      id: 'auto_harvest',
      name: 'CronDaemon // Auto-Coletor Viral',
      reqVps: 1,
      desc: 'Usa sua VPS para executar Collector.vcol automaticamente a cada 45s quando houver lucro pendente nos vírus.'
    },
    {
      id: 'auto_bills',
      name: 'CronDaemon // Tesoureiro das 12:00',
      reqVps: 1,
      desc: 'Quita automaticamente faturas de Energia, Internet, Aluguel e Água às 12:00 se houver saldo suficiente.'
    },
    {
      id: 'trace_watchdog',
      name: 'CronDaemon // Sentinela de Syslog',
      reqVps: 1,
      desc: 'Monitora rastros esquecidos na rede; se você tiver Purga Relâmpago (SP), limpa automaticamente 1 rastro exposto por ciclo.'
    },
    {
      id: 'dividend_compound',
      name: 'CronDaemon // Reinvestidor TIX',
      reqVps: 2,
      desc: 'Amplia em +20% os dividendos recebidos na Bolsa CyberStock às 12:00 reinvestindo frações automaticamente.'
    },
    {
      id: 'emergency_btc_liq',
      name: 'CronDaemon // Liquidez BTC Anti-Apagão',
      reqVps: 2,
      desc: 'Se faltar dólar na carteira na virada das 12:00, converte apenas a fração necessária de BTC para impedir corte de luz.'
    }
  ];

  const GLOBAL_EVENTS = [
    {
      id: 'ev_earnings',
      title: 'Pregão Volátil & Balanços TIX',
      badge: 'info',
      effectText: '+20% impacto nas ações da CyberStock ao sabotar ou restaurar empresas',
      stockImpactMult: 1.20,
      cctBonusMult: 1.0,
      collectorEventMult: 1.0
    },
    {
      id: 'ev_crypto_boom',
      title: 'Alta Demanda de Enxames & Cripto',
      badge: 'success',
      effectText: '+20% rendimento na coleta de vírus (.vminer / .vwarez / .vspam)',
      stockImpactMult: 1.0,
      cctBonusMult: 1.0,
      collectorEventMult: 1.20
    },
    {
      id: 'ev_cicada_drop',
      title: 'Vazamento Criptográfico Cicada',
      badge: 'warning',
      effectText: '+25% pagamento em contratos .CCT e desafios na Arena de Minigames',
      stockImpactMult: 1.0,
      cctBonusMult: 1.25,
      collectorEventMult: 1.0
    },
    {
      id: 'ev_patch_wave',
      title: 'Mutirão Corporativo Blue-Team',
      badge: 'success',
      effectText: '+30% recompensa em Contratos White-Hat e Limpeza de Incidentes',
      stockImpactMult: 1.10,
      cctBonusMult: 1.10,
      collectorEventMult: 1.05
    }
  ];

  const ECOSYSTEM_MILESTONES = [
    { id: 'ms_first_stock', title: 'Investidor de CyberStreet', desc: 'Abrir sua primeira posição Comprada (Long) ou Vendida (Short) na CyberStock.', rep: 30, sp: 0 },
    { id: 'ms_short_sabotage', title: 'Mão Invisível do Caos', desc: 'Lucrar em uma operação Short após sabotar pessoalmente o servidor ou CFTV da empresa.', rep: 75, sp: 1 },
    { id: 'ms_whitehat_pump', title: 'Consultor de Crise', desc: 'Restaurar a integridade de uma corporação via Contrato White-Hat.', rep: 45, sp: 0 },
    { id: 'ms_hex_daemon', title: 'Quebra-Gelo Multi-Daemon', desc: 'Concluir uma Matriz Hexadecimal 5x5 ativando ao menos 1 Daemon.', rep: 40, sp: 0 },
    { id: 'ms_hex_triple', title: 'Sobrecarga Tripla 5x5', desc: 'Ativar 2 ou mais Daemons na mesma invasão da Matriz Hexadecimal.', rep: 80, sp: 1 },
    { id: 'ms_packet_pro', title: 'Analista de Tráfego Profundo', desc: 'Capturar pacotes críticos no Packet Sniffer sem disparar armadilhas.', rep: 40, sp: 0 },
    { id: 'ms_logic_gate', title: 'Engenheiro de Relés', desc: 'Resolver um circuito de portas lógicas AND/OR/XOR.', rep: 40, sp: 0 },
    { id: 'ms_rf_sat', title: 'Uplink Orbital', desc: 'Sintonizar um satélite RF para expandir influência no Mapa-Múndi.', rep: 50, sp: 0 },
    { id: 'ms_cipher_cve', title: 'Criptógrafo Zero-Day', desc: 'Quebrar uma cifra criptográfica e extrair um CVE Zero-Day válido por 24h.', rep: 65, sp: 1 },
    { id: 'ms_canary_clean', title: 'Mãos Firme no Gatilho', desc: 'Desarmar um Canário Dead-Man e ganhar Cupom do Laboratório.', rep: 50, sp: 0 },
    { id: 'ms_cct_hunter', title: 'Caçador de Contratos .CCT', desc: 'Resolver um arquivo criptografado .cct dentro de um servidor invadido.', rep: 70, sp: 1 },
    { id: 'ms_false_flag', title: 'Fantasma Incriminador', desc: 'Plantar um IP Falso (False-Flag) no /var/log/syslog de um alvo remoto.', rep: 60, sp: 1 },
    { id: 'ms_osint_breach', title: 'Engenharia Social Pura', desc: 'Descobrir a senha root de um servidor usando um Dossiê OSINT.', rep: 45, sp: 0 },
    { id: 'ms_zeroday_root', title: 'Entrada Sem Bater', desc: 'Obter acesso root instantâneo usando um Exploit CVE Zero-Day.', rep: 70, sp: 0 },
    { id: 'ms_lan_pivot', title: 'Pivoteamento Interno 10.x', desc: 'Invadir a sub-rede interna 10.x.0.99 de uma corporação.', rep: 60, sp: 0 },
    { id: 'ms_rig_insured', title: 'Patrimônio Segurado', desc: 'Contratar uma apólice de Seguro Físico para o seu PC.', rep: 30, sp: 0 },
    { id: 'ms_self_pentest', title: 'Autocrítica Forense', desc: 'Executar uma Auditoria Pentest Pessoal no seu próprio computador.', rep: 30, sp: 0 },
    { id: 'ms_catalyst_lab', title: ' Bio-Engenheiro Turbinado', desc: 'Armar um Catalisador de Bancada para o Laboratório de Vírus.', rep: 55, sp: 0 },
    { id: 'ms_crew_heist', title: 'Mestre do Golpe Coordenado', desc: 'Concluir uma Operação de Equipe de 4 Papéis (Heist).', rep: 90, sp: 1 },
    { id: 'ms_blueteam', title: 'Bombeiro Cibernético', desc: 'Concluir uma Resposta a Incidente Blue-Team reduzindo seu Heat.', rep: 45, sp: 0 },
    { id: 'ms_cron_active', title: 'Arquiteto de Automação VPS', desc: 'Ativar um CronDaemon automatizado em um servidor VPS próprio.', rep: 55, sp: 1 },
    { id: 'ms_faction_ally', title: 'Respeitado nas Facções', desc: 'Atingir 100+ de reputação com qualquer uma das 4 Facções.', rep: 65, sp: 0 },
    { id: 'ms_world_hops4', title: 'Rota Transcontinental', desc: 'Encadear 4 ou mais cidades na sua rota do Mapa-Múndi.', rep: 40, sp: 0 },
    { id: 'ms_networth_25k', title: 'Magnata Underground', desc: 'Ultrapassar $ 25.000 de Patrimônio Líquido Consolidado.', rep: 100, sp: 1 }
  ];

  const HEX_BYTES = ['1C', '55', 'BD', 'E9', '7A', 'FF'];

  class EcosystemInterconnectedHub {
    constructor() {
      this.userId = null;
      this.state = null;
      this.activeTab = 'stocks';
      this.selectedMinigameKind = 'hex_breach';
      this.activeGameSession = null;
      this.lastAuditReport = null;
      this._tickerTimer = null;
      this.startBackgroundLoop();
    }

    storageKey(uidOverride = null) {
      const uid = uidOverride || (window.currentProfile && window.currentProfile.id) || 'guest';
      return `HC_ECOSYSTEM_HUB_${uid}`;
    }

    buildDefaultStocks() {
      const map = {};
      STOCK_CORPS.forEach((c) => {
        map[c.symbol] = {
          symbol: c.symbol,
          price: c.basePrice,
          prevClose: c.basePrice,
          integrity: 100,
          momentum: 0,
          history: [c.basePrice, +(c.basePrice * 0.99).toFixed(2), +(c.basePrice * 1.01).toFixed(2), c.basePrice],
          lastSabotagedAt: 0
        };
      });
      return map;
    }

    normalizeState(raw) {
      const s = raw && typeof raw === 'object' ? { ...raw } : {};
      const defStocks = this.buildDefaultStocks();
      if (!s.stocks || typeof s.stocks !== 'object') {
        s.stocks = defStocks;
      } else {
        STOCK_CORPS.forEach((c) => {
          if (!s.stocks[c.symbol]) {
            s.stocks[c.symbol] = defStocks[c.symbol];
          } else {
            const st = s.stocks[c.symbol];
            st.price = Math.max(4, +(Number(st.price || c.basePrice)).toFixed(2));
            st.prevClose = Math.max(4, +(Number(st.prevClose || c.basePrice)).toFixed(2));
            st.integrity = Math.max(15, Math.min(130, Number(st.integrity == null ? 100 : st.integrity)));
            if (!Array.isArray(st.history) || st.history.length === 0) st.history = [st.price];
          }
        });
      }

      if (!s.longPositions || typeof s.longPositions !== 'object') s.longPositions = {};
      if (!s.shortPositions || typeof s.shortPositions !== 'object') s.shortPositions = {};
      if (!s.factions || typeof s.factions !== 'object') {
        s.factions = { omnicorp: 20, syndicate: 20, cicada: 20, safenet_div: 20 };
      }
      if (typeof s.osintDossiers !== 'number') s.osintDossiers = 1;
      if (typeof s.labCatalysts !== 'number') s.labCatalysts = 0;
      if (typeof s.labCatalystArmed !== 'boolean') s.labCatalystArmed = false;
      if (typeof s.labDiscountCoupons !== 'number') s.labDiscountCoupons = 0;
      if (typeof s.labCouponArmed !== 'boolean') s.labCouponArmed = false;
      if (typeof s.energyDiscountPct !== 'number') s.energyDiscountPct = 0;
      if (!Array.isArray(s.zeroDays)) s.zeroDays = [];
      if (!s.fwDebuffsByIp || typeof s.fwDebuffsByIp !== 'object') s.fwDebuffsByIp = {};
      if (!s.pivotedCorpIps || typeof s.pivotedCorpIps !== 'object') s.pivotedCorpIps = {};
      if (!s.cctSolvedByIp || typeof s.cctSolvedByIp !== 'object') s.cctSolvedByIp = {};
      if (!s.cctAttemptsByIp || typeof s.cctAttemptsByIp !== 'object') s.cctAttemptsByIp = {};
      if (!s.insurance || typeof s.insurance !== 'object') {
        s.insurance = { plan: null, coveragePct: 0, claimsLeft: 0 };
      }
      if (!s.heistCooldowns || typeof s.heistCooldowns !== 'object') s.heistCooldowns = {};
      if (!s.cronActive || typeof s.cronActive !== 'object') s.cronActive = {};
      if (!s.unlockedMilestones || typeof s.unlockedMilestones !== 'object') s.unlockedMilestones = {};
      if (typeof s.dailyStreak !== 'number') s.dailyStreak = 0;
      if (typeof s.lastDailySolvedDay !== 'string') s.lastDailySolvedDay = '';
      if (typeof s.totalDividendsEarned !== 'number') s.totalDividendsEarned = 0;
      if (typeof s.totalTradingProfit !== 'number') s.totalTradingProfit = 0;
      if (typeof s.activeEventIdx !== 'number') s.activeEventIdx = 0;
      if (!s.flashBounty || typeof s.flashBounty !== 'object') {
        s.flashBounty = this.generateFlashBounty();
      }
      return s;
    }

    ensureLoaded() {
      const uid = (window.currentProfile && window.currentProfile.id) || 'guest';
      if (this.userId === uid && this.state) return this.state;
      this.userId = uid;
      let parsed = null;
      try {
        const raw = localStorage.getItem(this.storageKey(uid));
        if (raw) parsed = JSON.parse(raw);
      } catch (e) {}
      this.state = this.normalizeState(parsed);
      this.save(true);
      return this.state;
    }

    save(silentCloud = false) {
      if (!this.state) return;
      try {
        localStorage.setItem(this.storageKey(this.userId), JSON.stringify(this.state));
      } catch (e) {}
      if (!silentCloud && window.onlineEngine && typeof window.onlineEngine.scheduleSave === 'function') {
        window.onlineEngine.scheduleSave(false);
      }
    }

    getSnapshotState() {
      this.ensureLoaded();
      return JSON.parse(JSON.stringify(this.state));
    }

    applySnapshotState(snap) {
      if (!snap || typeof snap !== 'object') return;
      this.userId = (window.currentProfile && window.currentProfile.id) || 'guest';
      this.state = this.normalizeState(snap);
      this.save(true);
    }

    getCurrentGlobalEvent() {
      this.ensureLoaded();
      const idx = Math.abs(Number(this.state.activeEventIdx || 0)) % GLOBAL_EVENTS.length;
      return GLOBAL_EVENTS[idx];
    }

    generateFlashBounty() {
      const corp = STOCK_CORPS[Math.floor(Math.random() * 5)];
      return {
        id: 'fb_' + Date.now(),
        targetIp: corp.ip,
        targetName: corp.name,
        corpSymbol: corp.symbol,
        expiresAt: Date.now() + 15 * 60 * 1000,
        rewardCash: 950,
        rewardRep: 40,
        completed: false
      };
    }

    unlockMilestone(msId) {
      this.ensureLoaded();
      if (this.state.unlockedMilestones[msId]) return false;
      const def = ECOSYSTEM_MILESTONES.find((m) => m.id === msId);
      if (!def) return false;
      this.state.unlockedMilestones[msId] = Date.now();
      runAuth(() => {
        if (window.currentProfile) {
          window.currentProfile.reputation = Number(window.currentProfile.reputation || 100) + (def.rep || 25);
        }
      });
      this.save();
      if (typeof window.showToast === 'function') {
        window.showToast(`🏅 Marco Desbloqueado: "${def.title}" (+${def.rep} REP${def.sp ? ` · +${def.sp} SP!` : ''})`);
      }
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      return true;
    }

    getBonusSkillPoints() {
      this.ensureLoaded();
      let sp = 0;
      ECOSYSTEM_MILESTONES.forEach((m) => {
        if (m.sp && this.state.unlockedMilestones[m.id]) sp += m.sp;
      });
      return sp;
    }

    addFactionRep(factionId, pts) {
      this.ensureLoaded();
      if (this.state.factions[factionId] == null) this.state.factions[factionId] = 0;
      this.state.factions[factionId] = Math.max(0, Number(this.state.factions[factionId] || 0) + pts);
      if (this.state.factions[factionId] >= 100) {
        this.unlockMilestone('ms_faction_ally');
      }
      this.save();
    }

    // =========================================================================
    // BÔNUS REAIS DOS 50 POPS DO MAPA-MÚNDI + RESSONÂNCIA
    // =========================================================================
    getWorldMapActiveMultipliers() {
      const route = (window.worldMapEngine && Array.isArray(window.worldMapEngine.bounceRoute))
        ? window.worldMapEngine.bounceRoute
        : ['sao_paulo'];
      const pops = (window.worldMapEngine && Array.isArray(window.worldMapEngine.pops))
        ? window.worldMapEngine.pops
        : [];
      const resBonus = (window.skillTreeEngine && typeof window.skillTreeEngine.getActiveResonanceBonus === 'function')
        ? window.skillTreeEngine.getActiveResonanceBonus()
        : { worldMapBoostMult: 1.0 };

      if (route.length >= 4) {
        this.ensureLoaded();
        if (!this.state.unlockedMilestones.ms_world_hops4) this.unlockMilestone('ms_world_hops4');
      }

      let crackerSpeedPct = 0;
      let btcYieldPct = 0;
      let stealthBankPct = 0;
      let collectorBoostPct = 0;
      const activePopNames = [];

      route.forEach((id) => {
        const p = pops.find((x) => x.id === id);
        if (!p) return;
        activePopNames.push(p.name);
        const b = String(p.bonus || '').toLowerCase();
        if (b.includes('senha') || b.includes('hash') || b.includes('cpu') || b.includes('exploit')) {
          crackerSpeedPct += 6;
        } else if (b.includes('bitcoin') || b.includes('mineração') || b.includes('cripto') || b.includes('botnet')) {
          btcYieldPct += 6;
          collectorBoostPct += 5;
        } else {
          stealthBankPct += 6;
          collectorBoostPct += 3;
        }
      });

      // Bônus de soberania continental (regiões sob domínio player_clan)
      let alliedRegions = 0;
      if (window.worldMapEngine && window.worldMapEngine.territoryControl) {
        Object.values(window.worldMapEngine.territoryControl).forEach((tc) => {
          if (tc && tc.faction === 'player_clan') alliedRegions += 1;
        });
      }
      const mult = Number(resBonus.worldMapBoostMult || 1);
      return {
        hops: route.length,
        alliedRegions,
        activePopNames,
        crackerSpeedPct: Math.min(45, Math.round(crackerSpeedPct * mult)),
        btcYieldPct: Math.min(45, Math.round((btcYieldPct + alliedRegions * 2) * mult)),
        stealthBankPct: Math.min(50, Math.round(stealthBankPct * mult)),
        collectorMult: +(1 + Math.min(0.40, ((collectorBoostPct + alliedRegions * 2.5) * mult) / 100)).toFixed(3),
        billDiscountPct: Math.min(18, alliedRegions * 2)
      };
    }

    // =========================================================================
    // PILAR III — BOLSA DE VALORES CORPORATIVA CYBERSTOCK (TIX)
    // =========================================================================
    getStockCorpMeta(symbolOrIp) {
      return STOCK_CORPS.find((c) => c.symbol === symbolOrIp || c.ip === symbolOrIp) || null;
    }

    has4SForecast() {
      const anaVer = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('analyzer') : 0;
      const hasCert = !!(window.universityEngine && (
        (typeof window.universityEngine.hasCert === 'function' && window.universityEngine.hasCert(2)) ||
        (typeof window.universityEngine.hasCertificate === 'function' && window.universityEngine.hasCertificate('CERT-201'))
      ));
      return anaVer >= 2.0 || hasCert;
    }

    tickStockMarket() {
      this.ensureLoaded();
      STOCK_CORPS.forEach((c) => {
        const st = this.state.stocks[c.symbol];
        if (!st) return;
        // Recuperação gradual orgânica da integridade rumo a 100 + micro-oscilação
        if (st.integrity < 100) st.integrity = Math.min(100, +(st.integrity + 0.8).toFixed(1));
        if (st.integrity > 100) st.integrity = Math.max(100, +(st.integrity - 0.5).toFixed(1));
        const targetFairPrice = c.basePrice * (st.integrity / 100);
        const pull = (targetFairPrice - st.price) * 0.14;
        const jitter = (Math.random() - 0.49) * (c.basePrice * 0.012);
        const nextPrice = Math.max(4, +(st.price + pull + jitter).toFixed(2));
        st.momentum = +(nextPrice - st.price).toFixed(2);
        st.price = nextPrice;
        st.history.push(nextPrice);
        if (st.history.length > 14) st.history.shift();
      });
      this.save(true);
    }

    buyLongPosition(symbol, usdRaw) {
      this.ensureLoaded();
      const corp = this.getStockCorpMeta(symbol);
      if (!corp) return { success: false, message: 'Ação inválida.' };
      const st = this.state.stocks[corp.symbol];
      const amountUsd = Math.max(0, +(Number(usdRaw || 0)).toFixed(2));
      if (amountUsd < 50) return { success: false, message: 'Ordem mínima de compra: $ 50 HC.' };
      if (window.progressionLocksEngine) {
        const prevUsd = (this.state.longPositions[corp.symbol] && this.state.longPositions[corp.symbol].investedUsd) || 0;
        const capCheck = window.progressionLocksEngine.validateCyberStockCap(prevUsd + amountUsd);
        if (!capCheck.ok) return { success: false, code: capCheck.code, message: capCheck.message };
      }

      const resBonus = window.skillTreeEngine ? window.skillTreeEngine.getActiveResonanceBonus() : { stockFeeDiscount: 0 };
      const feeRate = 0.01 * (1 - Number(resBonus.stockFeeDiscount || 0));
      const totalCost = +(amountUsd * (1 + feeRate)).toFixed(2);
      const curBal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
      if (curBal < totalCost) {
        if (window.nineSystemsEngine && window.nineSystemsEngine.getDirtyBalance() > 0) {
          window.nineSystemsEngine.openDirtyMoneyBridgeModal(`Ordem Long CyberStock (${corp.symbol})`, totalCost);
        }
        const msg = `Saldo Limpo insuficiente! Ordem + corretagem exige $ ${totalCost.toFixed(2)} Limpos.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'CLEAN_MONEY_REQUIRED', message: msg };
      }

      const shares = +(amountUsd / st.price).toFixed(4);
      runAuth(() => {
        window.currentWallet.balance = Math.max(0, +(curBal - totalCost).toFixed(2));
      });

      const prev = this.state.longPositions[corp.symbol] || { shares: 0, avgPrice: st.price, investedUsd: 0 };
      const newShares = +(prev.shares + shares).toFixed(4);
      const newInvested = +(prev.investedUsd + amountUsd).toFixed(2);
      this.state.longPositions[corp.symbol] = {
        shares: newShares,
        avgPrice: +(newInvested / Math.max(0.0001, newShares)).toFixed(2),
        investedUsd: newInvested
      };

      this.unlockMilestone('ms_first_stock');
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = `📈 Posição COMPRADA aberta: +${shares} cotas de ${corp.symbol} a $ ${st.price.toFixed(2)}!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      this.renderUI();
      return { success: true, shares, price: st.price, message: msg };
    }

    sellLongPosition(symbol) {
      this.ensureLoaded();
      const pos = this.state.longPositions[symbol];
      const st = this.state.stocks[symbol];
      if (!pos || pos.shares <= 0 || !st) {
        return { success: false, message: 'Você não possui posição comprada neste ativo.' };
      }
      const resBonus = window.skillTreeEngine ? window.skillTreeEngine.getActiveResonanceBonus() : { stockProfitMult: 1 };
      const grossValue = +(pos.shares * st.price).toFixed(2);
      const rawPnl = +(grossValue - pos.investedUsd).toFixed(2);
      const boostedPnl = rawPnl > 0 ? +(rawPnl * Number(resBonus.stockProfitMult || 1)).toFixed(2) : rawPnl;
      const finalPayout = Math.max(0, +(pos.investedUsd + boostedPnl).toFixed(2));

      runAuth(() => {
        if (window.currentWallet) {
          window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + finalPayout).toFixed(2);
        }
      });

      this.state.totalTradingProfit = +(Number(this.state.totalTradingProfit || 0) + boostedPnl).toFixed(2);
      delete this.state.longPositions[symbol];
      this.save();
      this.checkNetWorthMilestone();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = `💰 Posição Long em ${symbol} encerrada: recebeu $ ${finalPayout.toFixed(2)} (${boostedPnl >= 0 ? '+' : ''}$ ${boostedPnl.toFixed(2)})!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      this.renderUI();
      return { success: true, payout: finalPayout, profit: boostedPnl, message: msg };
    }

    openShortPosition(symbol, collateralRaw) {
      this.ensureLoaded();
      const corp = this.getStockCorpMeta(symbol);
      if (!corp) return { success: false, message: 'Ação inválida.' };
      const st = this.state.stocks[corp.symbol];
      const collateral = Math.max(0, +(Number(collateralRaw || 0)).toFixed(2));
      if (collateral < 50) return { success: false, message: 'Margem mínima para Short: $ 50 HC.' };
      if (window.progressionLocksEngine) {
        const prevCol = (this.state.shortPositions[corp.symbol] && this.state.shortPositions[corp.symbol].collateralUsd) || 0;
        const capCheck = window.progressionLocksEngine.validateCyberStockCap(prevCol + collateral);
        if (!capCheck.ok) return { success: false, code: capCheck.code, message: capCheck.message };
      }

      const curBal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
      if (curBal < collateral) {
        if (window.nineSystemsEngine && window.nineSystemsEngine.getDirtyBalance() > 0) {
          window.nineSystemsEngine.openDirtyMoneyBridgeModal(`Margem Short CyberStock (${corp.symbol})`, collateral);
        }
        const msg = `Saldo Limpo insuficiente para margem Short ($ ${collateral.toFixed(2)} Limpos).`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'CLEAN_MONEY_REQUIRED', message: msg };
      }

      runAuth(() => {
        window.currentWallet.balance = Math.max(0, +(curBal - collateral).toFixed(2));
      });

      const existing = this.state.shortPositions[corp.symbol];
      const shares = +(collateral / st.price).toFixed(4);
      if (existing && existing.shares > 0) {
        const totCol = +(existing.collateralUsd + collateral).toFixed(2);
        const totSh = +(existing.shares + shares).toFixed(4);
        this.state.shortPositions[corp.symbol] = {
          shares: totSh,
          entryPrice: +(totCol / totSh).toFixed(2),
          collateralUsd: totCol,
          sabotagedWhileOpen: !!existing.sabotagedWhileOpen
        };
      } else {
        this.state.shortPositions[corp.symbol] = {
          shares,
          entryPrice: st.price,
          collateralUsd: collateral,
          sabotagedWhileOpen: false
        };
      }

      this.unlockMilestone('ms_first_stock');
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = `📉 SHORT aberto em ${corp.symbol} @ $ ${st.price.toFixed(2)}! Dica: invada ${corp.ip} ou sabote o CFTV dela para derrubar a ação!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      this.renderUI();
      return { success: true, entryPrice: st.price, shares, message: msg };
    }

    closeShortPosition(symbol) {
      this.ensureLoaded();
      const pos = this.state.shortPositions[symbol];
      const corp = this.getStockCorpMeta(symbol);
      const st = this.state.stocks[symbol];
      if (!pos || !corp || !st) return { success: false, message: 'Nenhuma posição Short ativa neste ticker.' };

      const resBonus = window.skillTreeEngine ? window.skillTreeEngine.getActiveResonanceBonus() : { stockProfitMult: 1 };
      const priceDropPerShare = pos.entryPrice - st.price;
      let rawProfit = +(priceDropPerShare * pos.shares).toFixed(2);
      if (rawProfit > 0) {
        rawProfit = +(rawProfit * Number(resBonus.stockProfitMult || 1)).toFixed(2);
      }

      // Auditoria Safenet: se o jogador sabotou a empresa E esqueceu seu próprio IP no syslog dela, multa parcial!
      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '';
      const corpLogs = (window.internetEngine && typeof window.internetEngine.getServerLogs === 'function')
        ? window.internetEngine.getServerLogs(corp.ip)
        : [];
      const leftMyIpOnCorp = myIp && corpLogs.some((l) => String(l).includes(myIp));
      let insiderWarning = '';
      if (rawProfit > 0 && pos.sabotagedWhileOpen && leftMyIpOnCorp) {
        rawProfit = +(rawProfit * 0.65).toFixed(2);
        insiderWarning = ' (⚠️ -35% retido pela Safenet pois seu IP ficou exposto no syslog da empresa!)';
        if (window.safenetFbiEngine && typeof window.safenetFbiEngine.evaluatePlayerCrime === 'function') {
          window.safenetFbiEngine.evaluatePlayerCrime(`Manipulação Insider em ${symbol}`, Math.round(rawProfit), corp.ip);
        }
      } else if (rawProfit > 0 && pos.sabotagedWhileOpen) {
        this.unlockMilestone('ms_short_sabotage');
        this.addFactionRep('syndicate', 25);
      }

      const finalReturn = Math.max(0, +(pos.collateralUsd + rawProfit).toFixed(2));
      runAuth(() => {
        if (window.currentWallet) {
          window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + finalReturn).toFixed(2);
        }
      });

      this.state.totalTradingProfit = +(Number(this.state.totalTradingProfit || 0) + rawProfit).toFixed(2);
      delete this.state.shortPositions[symbol];
      this.save();
      this.checkNetWorthMilestone();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = `💵 Short em ${symbol} liquidado @ $ ${st.price.toFixed(2)}: retorno $ ${finalReturn.toFixed(2)} (Lucro: ${rawProfit >= 0 ? '+' : ''}$ ${rawProfit.toFixed(2)})${insiderWarning}`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      this.renderUI();
      return { success: true, returnUsd: finalReturn, profit: rawProfit, message: msg };
    }

    // GANCHO REAL CHAMADO QUANDO O JOGADOR SABOTA UMA EMPRESA (Drena cofre, apaga arquivo, planta vírus, desliga CFTV, etc.)
    onCorporateHostSabotaged(ip, actionKind = 'intrusion') {
      this.ensureLoaded();
      const corp = this.getStockCorpMeta(ip);
      if (!corp) return null;
      const st = this.state.stocks[corp.symbol];
      if (!st) return null;
      if (window.progressionLocksEngine && typeof window.progressionLocksEngine.canTriggerSabotageStockDrop === 'function') {
        const cdCheck = window.progressionLocksEngine.canTriggerSabotageStockDrop(corp.symbol);
        if (!cdCheck.ok) {
          return { symbol: corp.symbol, oldPrice: st.price, newPrice: st.price, dropPct: 0, cooldownBlocked: true };
        }
      }

      const ev = this.getCurrentGlobalEvent();
      const subId = window.skillTreeEngine ? window.skillTreeEngine.selectedSubclass : null;
      const cctvExtra = (subId === 'sub_cctv_saboteur' && String(actionKind).includes('cctv')) ? 1.40 : 1.0;

      let baseDropPct = 0.09;
      if (actionKind === 'cctv_disable' || actionKind === 'cctv_wipe') baseDropPct = 0.14;
      else if (actionKind === 'bank_drain') baseDropPct = 0.12;
      else if (actionKind === 'virus_exec' || actionKind === 'deface') baseDropPct = 0.11;
      else if (actionKind === 'ddos') baseDropPct = 0.16;

      const finalDropPct = Math.min(0.28, baseDropPct * Number(ev.stockImpactMult || 1) * cctvExtra);
      const oldPrice = st.price;
      st.integrity = Math.max(22, +(st.integrity - finalDropPct * 100).toFixed(1));
      st.price = Math.max(4, +(st.price * (1 - finalDropPct)).toFixed(2));
      st.momentum = +(st.price - oldPrice).toFixed(2);
      st.lastSabotagedAt = Date.now();
      st.history.push(st.price);
      if (st.history.length > 14) st.history.shift();

      if (this.state.shortPositions[corp.symbol]) {
        this.state.shortPositions[corp.symbol].sabotagedWhileOpen = true;
      }
      if (window.topTenMechanics && typeof window.topTenMechanics.evaluateSponsoredCorpIntegrity === 'function') {
        window.topTenMechanics.evaluateSponsoredCorpIntegrity();
      }

      // Verifica se concluiu Flash Bounty ativo!
      if (this.state.flashBounty && !this.state.flashBounty.completed && this.state.flashBounty.targetIp === ip && this.state.flashBounty.expiresAt > Date.now()) {
        this.state.flashBounty.completed = true;
        const fbCash = this.state.flashBounty.rewardCash || 950;
        const fbRep = this.state.flashBounty.rewardRep || 40;
        runAuth(() => {
          if (window.currentWallet) window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + fbCash).toFixed(2);
          if (window.currentProfile) window.currentProfile.reputation = Number(window.currentProfile.reputation || 100) + fbRep;
        });
        if (typeof window.showToast === 'function') {
          window.showToast(`⚡ Flash Bounty Cumprido em ${corp.name}: +$ ${fbCash} HC & +${fbRep} REP!`);
        }
      }

      // Publica manchete automática em Notícias da Rede!
      if (window.darknetSocialEngine && Array.isArray(window.darknetSocialEngine.newsFeed)) {
        window.darknetSocialEngine.newsFeed.unshift({
          id: 'news_stock_' + Date.now(),
          category: 'CyberStock TIX',
          badge: 'danger',
          time: 'Agora mesmo',
          headline: `URGENTE: Ações da ${corp.name} (${corp.symbol}) caem -${Math.round(finalDropPct * 100)}% após ataque cibernético em ${corp.ip}!`,
          summary: `Investidores reagiram imediatamente à brecha de segurança (${actionKind}), derrubando a cotação de $${oldPrice.toFixed(2)} para $${st.price.toFixed(2)}.`
        });
        if (window.darknetSocialEngine.newsFeed.length > 25) window.darknetSocialEngine.newsFeed.length = 25;
      }

      this.save();
      return { symbol: corp.symbol, oldPrice, newPrice: st.price, dropPct: +(finalDropPct * 100).toFixed(1) };
    }

    executeWhiteHatRestore(symbol) {
      this.ensureLoaded();
      const corp = this.getStockCorpMeta(symbol);
      if (!corp) return { success: false, message: 'Corporação inválida.' };
      const st = this.state.stocks[corp.symbol];
      const avVer = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('antivirus') : 0;
      if (avVer <= 0) {
        const msg = 'Baixe primeiro o Antivirus.av (ex: no Download Center 33.8.2.71) para prestar consultoria White-Hat!';
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, message: msg };
      }

      const ev = this.getCurrentGlobalEvent();
      const boostPct = 0.11 * Number(ev.stockImpactMult || 1);
      const oldPrice = st.price;
      st.integrity = Math.min(125, +(st.integrity + 14).toFixed(1));
      st.price = +(st.price * (1 + boostPct)).toFixed(2);
      st.momentum = +(st.price - oldPrice).toFixed(2);
      st.history.push(st.price);
      if (st.history.length > 14) st.history.shift();

      const resBonus = window.skillTreeEngine ? window.skillTreeEngine.getActiveResonanceBonus() : { contractCashMult: 1 };
      const feeEarned = Math.round(320 * Number(resBonus.contractCashMult || 1));
      runAuth(() => {
        if (window.currentWallet) window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + feeEarned).toFixed(2);
        if (window.currentProfile) window.currentProfile.heat_level = Math.max(1, Number(window.currentProfile.heat_level || 1) - 1);
      });

      this.addFactionRep('omnicorp', 25);
      this.unlockMilestone('ms_whitehat_pump');
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = `🛡️ Auditoria White-Hat em ${corp.name}: +$ ${feeEarned} HC, Alerta Policial reduzido e ${corp.symbol} subiu para $ ${st.price.toFixed(2)}!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      this.renderUI();
      return { success: true, newPrice: st.price, feeEarned, message: msg };
    }

    // Dividendos pagos todo dia às 12:00 junto ao fechamento de contas da Quitinete!
    payNoonDividends(crossingsCount = 1) {
      this.ensureLoaded();
      const resBonus = window.skillTreeEngine ? window.skillTreeEngine.getActiveResonanceBonus() : { dividendMult: 1 };
      const cronBoost = this.isCronActive('dividend_compound') ? 1.20 : 1.0;
      const omniBoost = 1 + Math.min(0.25, Math.floor((this.state.factions.omnicorp || 0) / 100) * 0.05);

      let totalDiv = 0;
      Object.entries(this.state.longPositions).forEach(([sym, pos]) => {
        const corp = this.getStockCorpMeta(sym);
        const st = this.state.stocks[sym];
        if (!corp || !st || !pos || pos.shares <= 0) return;
        const mktVal = pos.shares * st.price;
        totalDiv += mktVal * corp.divYield * Math.min(3, crossingsCount);
      });

      totalDiv = +(totalDiv * Number(resBonus.dividendMult || 1) * cronBoost * omniBoost).toFixed(2);
      if (totalDiv >= 0.5) {
        runAuth(() => {
          if (window.currentWallet) {
            window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + totalDiv).toFixed(2);
          }
        });
        this.state.totalDividendsEarned = +(Number(this.state.totalDividendsEarned || 0) + totalDiv).toFixed(2);
        this.save();
      }

      // CronDaemons de virada das 12:00 (Liquidez BTC emergencial + Auto-Pagamento de Faturas!)
      if (this.isCronActive('emergency_btc_liq') && window.quitineteEngine && window.bitcoinEngine) {
        const due = Object.values(window.quitineteEngine.bills || {}).reduce((acc, b) => acc + (b.paid ? 0 : Number(b.price || 0)), 0);
        const bal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
        if (due > bal && window.bitcoinEngine.state && window.bitcoinEngine.state.satoshis > 5000) {
          const deficit = due - bal + 25;
          const btcPrice = Number(window.bitcoinEngine.priceUsd || 64250);
          const neededBtc = Math.min(window.bitcoinEngine.state.satoshis / 1e8, +(deficit / btcPrice).toFixed(6));
          if (neededBtc > 0.00005 && typeof window.bitcoinEngine.sellBtcForUsd === 'function') {
            window.bitcoinEngine.sellBtcForUsd(neededBtc);
          }
        }
      }

      if (this.isCronActive('auto_bills') && window.quitineteEngine && typeof window.payQuitineteBill === 'function') {
        ['power', 'internet', 'water', 'rent'].forEach((billKey) => {
          const b = window.quitineteEngine.bills && window.quitineteEngine.bills[billKey];
          const bal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
          if (b && !b.paid && bal >= Number(b.price || 0)) {
            window.payQuitineteBill(billKey);
          }
        });
      }

      return totalDiv;
    }

    computeNetWorthAnalytics() {
      this.ensureLoaded();
      const cash = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
      const btcUsd = (window.bitcoinEngine && window.bitcoinEngine.state)
        ? ((Number(window.bitcoinEngine.state.satoshis || 0) / 1e8) * Number(window.bitcoinEngine.priceUsd || 64250))
        : 0;
      let bankVaults = 0;
      if (window.multiBankEngine && window.multiBankEngine.state && window.multiBankEngine.state.accounts) {
        Object.values(window.multiBankEngine.state.accounts).forEach((acc) => {
          bankVaults += Number(acc.balance || 0);
        });
      }
      let stockEquity = 0;
      Object.entries(this.state.longPositions).forEach(([sym, pos]) => {
        const st = this.state.stocks[sym];
        if (st && pos) stockEquity += pos.shares * st.price;
      });
      Object.entries(this.state.shortPositions).forEach(([sym, pos]) => {
        const st = this.state.stocks[sym];
        if (st && pos) stockEquity += Math.max(0, pos.collateralUsd + (pos.entryPrice - st.price) * pos.shares);
      });
      const vpsVal = this.getOwnedVpsCount() * 950;
      const totalNetWorth = +(cash + btcUsd + bankVaults + stockEquity + vpsVal).toFixed(2);
      const monthlyBills = window.quitineteEngine && window.quitineteEngine.bills
        ? Object.values(window.quitineteEngine.bills).reduce((a, b) => a + Number(b.monthlyBase || 0), 0)
        : 1292;
      return {
        cash: +cash.toFixed(2),
        btcUsd: +btcUsd.toFixed(2),
        bankVaults: +bankVaults.toFixed(2),
        stockEquity: +stockEquity.toFixed(2),
        vpsVal,
        totalNetWorth,
        monthlyBills
      };
    }

    checkNetWorthMilestone() {
      const nw = this.computeNetWorthAnalytics();
      if (nw.totalNetWorth >= 25000) {
        this.unlockMilestone('ms_networth_25k');
      }
    }

    // =========================================================================
    // PILAR II — 6 MINIGAMES TÁTICOS & CONTRATOS CRIPTOGRAFADOS (.CCT)
    // =========================================================================
    getHostCctContract(ip) {
      this.ensureLoaded();
      if (!ip) return null;
      const hash = String(ip).split('').reduce((a, ch) => a + ch.charCodeAt(0), 0);
      const kinds = ['hex_breach', 'packet_sniffer', 'logic_gates', 'rf_waveform', 'cipher_cracker', 'canary_defuse'];
      const kind = kinds[hash % kinds.length];
      const names = {
        hex_breach: `breach_daemon_${hash % 99}.cct`,
        packet_sniffer: `pcap_swift_dump_${hash % 99}.cct`,
        logic_gates: `plc_relay_gate_${hash % 99}.cct`,
        rf_waveform: `sat_uplink_${hash % 99}.cct`,
        cipher_cracker: `rsa_zero_day_${hash % 99}.cct`,
        canary_defuse: `deadman_vault_${hash % 99}.cct`
      };
      const solved = !!this.state.cctSolvedByIp[ip];
      const attemptsUsed = Number(this.state.cctAttemptsByIp[ip] || 0);
      return {
        ip,
        filename: names[kind],
        kind,
        solved,
        attemptsLeft: Math.max(0, 3 - attemptsUsed)
      };
    }

    openHostCctContract(ip) {
      const cct = this.getHostCctContract(ip);
      if (!cct) return;
      if (cct.solved) {
        if (typeof window.showToast === 'function') window.showToast('Este contrato .cct já foi decodificado e resgatado!');
        return;
      }
      if (cct.attemptsLeft <= 0) {
        if (typeof window.showToast === 'function') window.showToast('Tentativas esgotadas neste arquivo .cct!');
        return;
      }
      this.activeTab = 'minigames';
      this.startMinigame(cct.kind, { source: 'cct', hostIp: ip, filename: cct.filename });
      if (typeof window.navTo === 'function') window.navTo('winOpsHub');
    }

    startTaskOverclockWithHex() {
      this.activeTab = 'minigames';
      this.startMinigame('hex_breach', { source: 'task_overclock' });
      if (typeof window.navTo === 'function') window.navTo('winOpsHub');
    }

    startMinigame(kind, contextMeta = null) {
      this.ensureLoaded();
      this.selectedMinigameKind = kind || 'hex_breach';
      const ctx = contextMeta || { source: 'arena' };

      if (kind === 'hex_breach') {
        const grid = [];
        for (let r = 0; r < 5; r++) {
          const row = [];
          for (let c = 0; c < 5; c++) {
            row.push(HEX_BYTES[(r * 3 + c * 2 + Math.floor(Math.random() * 6)) % HEX_BYTES.length]);
          }
          grid.push(row);
        }
        // Garante caminho determinístico de 3 bytes na grade (linha 0 -> col c1 -> linha r2) para sempre ser solucionável com habilidade!
        const b1 = grid[0][1];
        const b2 = grid[2][1];
        const b3 = grid[2][4];
        this.activeGameSession = {
          kind: 'hex_breach',
          ctx,
          grid,
          used: {},
          mode: 'row',
          activeIndex: 0,
          buffer: [],
          maxBuffer: 6,
          completed: false,
          daemons: [
            { id: 'icepick', name: 'ICEPICK_V2', seq: [b1, b2], rewardText: 'Reduz Firewall do Alvo (-0.6) + $280 HC', matched: false },
            { id: 'datamine', name: 'DATAMINE_CORE', seq: [b2, b3], rewardText: '+$450 HC + Reputação Cicada', matched: false },
            { id: 'catalyst', name: 'LAB_CATALYST_ABI', seq: [b1, b2, b3], rewardText: '+1 Catalisador do Laboratório de Vírus!', matched: false }
          ]
        };
      } else if (kind === 'packet_sniffer') {
        const templates = [
          { tag: 'SWIFT_AUTH_TOKEN', port: 443, safe: true, payload: 'Bearer 0x9F2A..HEBC' },
          { tag: 'HONEYPOT_CANARY', port: 23, safe: false, payload: 'SAFENET_TRAP_PING' },
          { tag: 'SSH_ROOT_HANDSHAKE', port: 22, safe: true, payload: 'ed25519_key_leak' },
          { tag: 'OSINT_CORP_LDAP', port: 389, safe: true, payload: 'cn=director,dc=hc' },
          { tag: 'IDS_BAIT_BEACON', port: 8080, safe: false, payload: 'FBI_TRACE_SOCKET' },
          { tag: 'BTC_STRATUM_SHARE', port: 3333, safe: true, payload: 'nonce=0x77c104' }
        ];
        this.activeGameSession = {
          kind: 'packet_sniffer',
          ctx,
          packets: templates.map((t, idx) => ({ ...t, idx, state: 'pending' })),
          score: 0,
          mistakes: 0,
          completed: false
        };
      } else if (kind === 'logic_gates') {
        // Circuito real: G1 = A XOR B; G2 = B AND C; OUT = G1 AND G2 -> exige A=0, B=1, C=1!
        this.activeGameSession = {
          kind: 'logic_gates',
          ctx,
          inputs: [1, 0, 0], // começa desligado (OUT = 0)
          completed: false
        };
      } else if (kind === 'rf_waveform') {
        const targetFreq = 4;
        const targetPhase = 3;
        this.activeGameSession = {
          kind: 'rf_waveform',
          ctx,
          targetFreq,
          targetPhase,
          freq: 2,
          phase: 1,
          region: 'América do Norte',
          completed: false
        };
      } else if (kind === 'cipher_cracker') {
        const words = ['KERNEL', 'CIPHER', 'ZERO', 'MATRIX', 'SHADOW', 'VORTEX'];
        const plain = words[Math.floor(Math.random() * words.length)];
        const shift = 3;
        const encoded = plain
          .split('')
          .map((ch) => String.fromCharCode(((ch.charCodeAt(0) - 65 + shift) % 26) + 65))
          .join('');
        this.activeGameSession = {
          kind: 'cipher_cracker',
          ctx,
          plain,
          shift,
          encoded,
          completed: false
        };
      } else if (kind === 'canary_defuse') {
        const seq = ['A7', 'C3', 'F9', 'B2'];
        this.activeGameSession = {
          kind: 'canary_defuse',
          ctx,
          triggerSeq: seq,
          expectedReverse: seq.slice().reverse(),
          typed: [],
          options: ['B2', 'F9', 'C3', 'A7', 'E1', 'D4'],
          completed: false
        };
      }

      this.renderUI();
      return this.activeGameSession;
    }

    sequenceAppearsInBuffer(buf, seq) {
      if (buf.length < seq.length) return false;
      for (let i = 0; i <= buf.length - seq.length; i++) {
        let ok = true;
        for (let j = 0; j < seq.length; j++) {
          if (buf[i + j] !== seq[j]) { ok = false; break; }
        }
        if (ok) return true;
      }
      return false;
    }

    clickHexCell(r, c) {
      const g = this.activeGameSession;
      if (!g || g.kind !== 'hex_breach' || g.completed) return;
      const key = `${r},${c}`;
      if (g.used[key]) return;
      if (g.mode === 'row' && r !== g.activeIndex) return;
      if (g.mode === 'col' && c !== g.activeIndex) return;

      g.used[key] = true;
      g.buffer.push(g.grid[r][c]);
      g.mode = g.mode === 'row' ? 'col' : 'row';
      g.activeIndex = g.mode === 'col' ? c : r;

      g.daemons.forEach((d) => {
        if (this.sequenceAppearsInBuffer(g.buffer, d.seq)) d.matched = true;
      });

      const allMatched = g.daemons.every((d) => d.matched);
      if (allMatched || g.buffer.length >= g.maxBuffer) {
        this.finishHexBreach();
        return;
      }
      this.renderUI();
    }

    finishHexBreach() {
      const g = this.activeGameSession;
      if (!g || g.kind !== 'hex_breach' || g.completed) return;
      g.completed = true;
      const matched = g.daemons.filter((d) => d.matched);
      if (matched.length === 0) {
        this.recordCctFailureIfApplicable(g.ctx);
        if (typeof window.showToast === 'function') window.showToast('Nenhum Daemon ativado na Matriz Hex. Tente alinhar a sequência!');
        this.renderUI();
        return { success: false, matchedCount: 0 };
      }

      let cashEarned = 0;
      const targetIp = (g.ctx && g.ctx.hostIp) || (window.internetEngine && window.internetEngine.currentIp) || '203.17.88.40';
      matched.forEach((d) => {
        if (d.id === 'icepick') {
          cashEarned += 280;
          this.state.fwDebuffsByIp[targetIp] = { reduction: 0.6, expiresAt: Date.now() + 30 * 60 * 1000 };
        } else if (d.id === 'datamine') {
          cashEarned += 450;
          this.addFactionRep('cicada', 20);
        } else if (d.id === 'catalyst') {
          this.state.labCatalysts = Number(this.state.labCatalysts || 0) + 1;
        }
      });

      this.unlockMilestone('ms_hex_daemon');
      if (matched.length >= 2) this.unlockMilestone('ms_hex_triple');

      if (g.ctx && g.ctx.source === 'task_overclock' && window.taskManager) {
        const procs = window.taskManager.getRunningAll ? window.taskManager.getRunningAll() : [];
        procs.forEach((p) => {
          p.workDone = Math.min(p.workTotal, Number(p.workDone || 0) + Number(p.workTotal || 1) * 0.55);
        });
        if (typeof window.taskManager.tick === 'function') window.taskManager.tick();
      }

      this.finalizeMinigameRewards(cashEarned, 35 * matched.length, g.ctx, `Matriz Hex concluída (${matched.length} Daemon[s] ativos)!`);
      return { success: true, matchedCount: matched.length, cashEarned };
    }

    actOnPacket(idx, action) {
      const g = this.activeGameSession;
      if (!g || g.kind !== 'packet_sniffer' || g.completed) return;
      const pkt = g.packets[idx];
      if (!pkt || pkt.state !== 'pending') return;

      if (action === 'capture') {
        if (pkt.safe) {
          pkt.state = 'captured';
          g.score += 1;
        } else {
          pkt.state = 'tripped';
          g.mistakes += 1;
        }
      } else {
        pkt.state = pkt.safe ? 'skipped' : 'dropped_trap';
        if (!pkt.safe) g.score += 1;
      }

      if (g.packets.every((p) => p.state !== 'pending')) {
        g.completed = true;
        if (g.mistakes <= 1 && g.score >= 4) {
          this.state.osintDossiers = Number(this.state.osintDossiers || 0) + 1;
          this.unlockMilestone('ms_packet_pro');
          this.finalizeMinigameRewards(420, 45, g.ctx, 'Sniffer concluído: +1 Dossiê OSINT extraído!');
        } else {
          this.recordCctFailureIfApplicable(g.ctx);
          if (typeof window.showToast === 'function') window.showToast('Muitos canários disparados! Filtre os pacotes HONEYPOT/FBI.');
          this.renderUI();
        }
        return;
      }
      this.renderUI();
    }

    toggleLogicInput(idx) {
      const g = this.activeGameSession;
      if (!g || g.kind !== 'logic_gates' || g.completed) return;
      g.inputs[idx] = g.inputs[idx] ? 0 : 1;
      this.renderUI();
    }

    evaluateLogicCircuit(inputs) {
      const [a, b, c] = inputs;
      const g1Xor = (a ^ b) === 1 ? 1 : 0;
      const g2And = (b && c) ? 1 : 0;
      const out = (g1Xor && g2And) ? 1 : 0;
      return { a, b, c, g1Xor, g2And, out };
    }

    verifyLogicCircuit() {
      const g = this.activeGameSession;
      if (!g || g.kind !== 'logic_gates' || g.completed) return { success: false };
      const ev = this.evaluateLogicCircuit(g.inputs);
      if (ev.out !== 1) {
        if (typeof window.showToast === 'function') window.showToast('Saída OUT ainda está em 0! Ajuste as chaves A, B e C para energizar G1 e G2.');
        return { success: false };
      }
      g.completed = true;
      this.state.energyDiscountPct = Math.min(25, Number(this.state.energyDiscountPct || 0) + 12);
      this.unlockMilestone('ms_logic_gate');
      this.finalizeMinigameRewards(390, 40, g.ctx, 'Relé Lógico destravado! Desconto energético de -12% aplicado na Quitinete!');
      return { success: true };
    }

    adjustWaveform(freqVal, phaseVal, regionVal) {
      const g = this.activeGameSession;
      if (!g || g.kind !== 'rf_waveform' || g.completed) return;
      if (freqVal != null) g.freq = Number(freqVal);
      if (phaseVal != null) g.phase = Number(phaseVal);
      if (regionVal) g.region = String(regionVal);
      this.renderUI();
    }

    lockSatelliteSignal() {
      const g = this.activeGameSession;
      if (!g || g.kind !== 'rf_waveform' || g.completed) return { success: false };
      if (g.freq !== g.targetFreq || g.phase !== g.targetPhase) {
        if (typeof window.showToast === 'function') window.showToast(`Sinal desalinhado! Dica de portadora: Freq ${g.targetFreq} GHz · Fase ${g.targetPhase}.`);
        return { success: false };
      }
      g.completed = true;
      if (window.worldMapEngine && window.worldMapEngine.territoryControl) {
        const reg = g.region || 'América do Norte';
        const cur = window.worldMapEngine.territoryControl[reg] || { faction: 'player_clan', influence: 40 };
        cur.faction = 'player_clan';
        cur.influence = Math.min(100, Number(cur.influence || 40) + 15);
        window.worldMapEngine.territoryControl[reg] = cur;
        window.worldMapEngine.saveState();
      }
      this.unlockMilestone('ms_rf_sat');
      this.finalizeMinigameRewards(460, 50, g.ctx, `Satélite sincronizado! +15% de domínio para seu clã em ${g.region}!`);
      return { success: true };
    }

    submitCipherSolution(answerRaw) {
      const g = this.activeGameSession;
      if (!g || g.kind !== 'cipher_cracker' || g.completed) return { success: false };
      const ans = String(answerRaw || '').trim().toUpperCase();
      if (ans !== g.plain) {
        this.recordCctFailureIfApplicable(g.ctx);
        if (typeof window.showToast === 'function') window.showToast('Texto decifrado incorreto! Subtraia 3 letras no alfabeto (Cifra César +3).');
        return { success: false };
      }
      g.completed = true;
      const cveCode = `CVE-2026-${1000 + Math.floor(Math.random() * 8999)}`;
      this.state.zeroDays.unshift({
        id: 'zd_' + Date.now(),
        code: cveCode,
        maxTier: 3,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        used: false
      });
      if (this.state.zeroDays.length > 8) this.state.zeroDays.length = 8;
      this.unlockMilestone('ms_cipher_cve');
      this.finalizeMinigameRewards(510, 55, g.ctx, `Cifra quebrada! Exploit ${cveCode} (válido por 24h) adicionado ao Arsenal!`);
      return { success: true, cveCode };
    }

    pressCanaryNode(code) {
      const g = this.activeGameSession;
      if (!g || g.kind !== 'canary_defuse' || g.completed) return { success: false };
      const stepIdx = g.typed.length;
      if (g.expectedReverse[stepIdx] !== code) {
        g.typed = [];
        if (typeof window.showToast === 'function') window.showToast('Ordem incorreta! Digite os 4 pulsos na ORDEM INVERSA.');
        this.renderUI();
        return { success: false };
      }
      g.typed.push(code);
      if (g.typed.length >= g.expectedReverse.length) {
        g.completed = true;
        this.state.labDiscountCoupons = Number(this.state.labDiscountCoupons || 0) + 1;
        runAuth(() => {
          if (window.currentProfile) {
            window.currentProfile.heat_level = Math.max(1, Number(window.currentProfile.heat_level || 1) - 1);
          }
        });
        this.unlockMilestone('ms_canary_clean');
        this.finalizeMinigameRewards(430, 45, g.ctx, 'Canário desarmado! Ganhou +1 Cupom (-$250 no Lab de Vírus) e reduziu seu Heat!');
        return { success: true };
      }
      this.renderUI();
      return { success: true, partial: true };
    }

    recordCctFailureIfApplicable(ctx) {
      if (ctx && ctx.source === 'cct' && ctx.hostIp) {
        this.state.cctAttemptsByIp[ctx.hostIp] = Number(this.state.cctAttemptsByIp[ctx.hostIp] || 0) + 1;
        this.save();
      }
    }

    finalizeMinigameRewards(baseCash, baseRep, ctx, customMsg) {
      this.ensureLoaded();
      const ev = this.getCurrentGlobalEvent();
      const resBonus = window.skillTreeEngine ? window.skillTreeEngine.getActiveResonanceBonus() : { contractCashMult: 1 };
      const cicadaMult = 1 + Math.min(0.45, Math.floor((this.state.factions.cicada || 0) / 100) * 0.15);

      let finalCash = Math.round(baseCash * Number(ev.cctBonusMult || 1) * Number(resBonus.contractCashMult || 1) * cicadaMult);
      let finalRep = baseRep;

      if (ctx && ctx.source === 'cct' && ctx.hostIp) {
        this.state.cctSolvedByIp[ctx.hostIp] = true;
        this.state.labCatalysts = Number(this.state.labCatalysts || 0) + 1;
        finalCash += 350;
        finalRep += 30;
        if (window.bitcoinEngine && window.bitcoinEngine.state) {
          window.bitcoinEngine.state.satoshis = Number(window.bitcoinEngine.state.satoshis || 0) + 18000;
          window.bitcoinEngine.save();
        }
        this.addFactionRep('cicada', 35);
        this.unlockMilestone('ms_cct_hunter');
      }

      // Desafio Diário (1x por dia real -> concede +35 XP no Laboratório de Vírus + Streak!)
      const todayKey = new Date().toISOString().slice(0, 10);
      let dailyNote = '';
      if (this.state.lastDailySolvedDay !== todayKey) {
        this.state.lastDailySolvedDay = todayKey;
        this.state.dailyStreak = Number(this.state.dailyStreak || 0) + 1;
        this.state.labDiscountCoupons = Number(this.state.labDiscountCoupons || 0) + 1;
        if (window.virusLabEngine && window.virusLabEngine.state) {
          window.virusLabEngine.ensureLoaded();
          window.virusLabEngine.state.xp = Number(window.virusLabEngine.state.xp || 0) + 35;
          const up = window.virusLabEngine.computeLevelFromXp(window.virusLabEngine.state.xp, window.virusLabEngine.state.level);
          window.virusLabEngine.state.level = up.level;
          window.virusLabEngine.save();
        }
        dailyNote = ` · 🔥 Streak Diário #${this.state.dailyStreak} (+35 XP Lab & +1 Cupom -$250)!`;
      }

      runAuth(() => {
        if (window.currentWallet) window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + finalCash).toFixed(2);
        if (window.currentProfile) window.currentProfile.reputation = Number(window.currentProfile.reputation || 100) + finalRep;
      });

      this.save();
      this.checkNetWorthMilestone();
      if (window.hackerAudio && typeof window.hackerAudio.playCashChime === 'function') window.hackerAudio.playCashChime();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (typeof window.showToast === 'function') {
        window.showToast(`✅ ${customMsg} (+$ ${finalCash} HC · +${finalRep} REP)${dailyNote}`);
      }
      this.renderUI();
    }

    // =========================================================================
    // PILAR IV — OSINT, FORJA FALSE-FLAG, ZERO-DAYS 24H, SEGURO & AUDITORIA
    // =========================================================================
    getEffectiveFirewallReduction(ip) {
      this.ensureLoaded();
      const deb = this.state.fwDebuffsByIp[ip];
      if (!deb || deb.expiresAt <= Date.now()) return 0;
      return Number(deb.reduction || 0);
    }

    grantInsiderIntelAndOsint() {
      this.ensureLoaded();
      this.state.osintDossiers = Number(this.state.osintDossiers || 0) + 1;
      const cheapest = STOCK_CORPS
        .map((c) => ({ corp: c, st: this.state.stocks[c.symbol] }))
        .sort((a, b) => (a.st.integrity || 100) - (b.st.integrity || 100))[0];
      this.save();
      const sym = cheapest ? cheapest.corp.symbol : 'MRDN';
      return {
        success: true,
        message: `+1 Dossiê OSINT obtido! Alerta TIX: ${sym} está com integridade em ${cheapest ? cheapest.st.integrity : 90}%.`
      };
    }

    plantFalseFlagOnHost(hostIp, framedTargetIpRaw) {
      this.ensureLoaded();
      if (!hostIp || !window.internetEngine) return { success: false, message: 'Nenhum servidor remoto selecionado.' };
      const framedIp = String(framedTargetIpRaw || '').trim() || '149.56.28.11';
      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '';
      if (framedIp === myIp) {
        return { success: false, message: 'Escolha o IP de outro operador/bot para incriminar, não o seu próprio!' };
      }

      const curLogs = window.internetEngine.getServerLogs(hostIp)
        .filter((l) => !myIp || !String(l).includes(myIp));
      const stamp = new Date().toLocaleTimeString('pt-BR');
      const forgedLines = [
        `[${stamp}] sshd[4091]: Accepted root override from ${framedIp} port 49210 ssh2`,
        `[${stamp}] kernel: [WARN] unauthorized vault_siphon triggered by ${framedIp}`,
        ...curLogs.slice(0, 12)
      ];

      if (window.botAI) {
        window.botAI.wipeLogs(hostIp);
        if (window.botAI.syslogRegistry) {
          window.botAI.syslogRegistry.set(hostIp, forgedLines);
        }
      }

      if (window.safenetFbiEngine && typeof window.safenetFbiEngine.reportBotCrime === 'function') {
        window.safenetFbiEngine.reportBotCrime(framedIp, `Invasão forjada detectada em ${hostIp}`, 1200);
      }

      this.addFactionRep('safenet_div', 20);
      this.unlockMilestone('ms_false_flag');
      this.save();
      if (window.internetEngine.currentIp === hostIp) window.internetEngine.render();
      const msg = `🎭 False-Flag plantado em ${hostIp}! Seu IP foi removido e ${framedIp} foi incriminado na Safenet!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, hostIp, framedIp, message: msg };
    }

    useOsintDossierOnIp(targetIpRaw) {
      this.ensureLoaded();
      const ip = String(targetIpRaw || '').trim();
      if (!ip || !window.internetEngine) return { success: false, message: 'Informe um endereço IP válido.' };
      if ((this.state.osintDossiers || 0) <= 0) {
        const msg = 'Você não possui Dossiês OSINT. Obtenha no Packet Sniffer ou na Sonda OSINT!';
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, message: msg };
      }
      const host = window.internetEngine.resolveHost(ip);
      if (!host || host.notFound) {
        return { success: false, message: 'Endereço IP não encontrado na rede.' };
      }
      if ((host.tier || 1) > 3) {
        const msg = 'Alvos Tier 4+ possuem credenciais isoladas de hardware (use Cracker ou Zero-Day).';
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, message: msg };
      }

      this.state.osintDossiers -= 1;
      if (window.hackedDb) {
        window.hackedDb.upsertHost({
          ip: host.ip,
          hostname: host.hostname,
          kind: host.kind,
          password: host.rootPassword,
          accessMethod: 'password'
        });
      }
      this.unlockMilestone('ms_osint_breach');
      this.save();
      const msg = `🕵️ Engenharia Social OSINT revelou a senha root de ${host.hostname} (${host.ip}): ${host.rootPassword} (salva em Senhas Descobertas)!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      this.renderUI();
      return { success: true, password: host.rootPassword, ip: host.ip, message: msg };
    }

    useZeroDayOnHost(zdId, targetIpRaw) {
      this.ensureLoaded();
      const now = Date.now();
      const zd = this.state.zeroDays.find((z) => z.id === zdId && !z.used && z.expiresAt > now);
      if (!zd) return { success: false, message: 'Exploit Zero-Day expirado ou já utilizado.' };
      const ip = String(targetIpRaw || '').trim() || '189.40.7.12';
      if (!window.internetEngine) return { success: false };
      const host = window.internetEngine.resolveHost(ip);
      if (!host || host.notFound) return { success: false, message: 'IP alvo inválido.' };
      if ((host.tier || 1) > (zd.maxTier || 3) + 1) {
        return { success: false, message: `${zd.code} suporta no máximo servidores até Tier ${(zd.maxTier || 3) + 1}.` };
      }

      zd.used = true;
      if (window.hackedDb) {
        window.hackedDb.upsertHost({
          ip: host.ip,
          hostname: host.hostname,
          kind: host.kind,
          password: host.rootPassword,
          accessMethod: 'password'
        });
      }
      window.internetEngine.currentIp = host.ip;
      window.internetEngine.activeTab = 'entrar';
      window.internetEngine.activeSshIp = host.ip;
      window.internetEngine.activeSshRole = 'root';
      window.internetEngine.sshSubTab = 'files';

      this.unlockMilestone('ms_zeroday_root');
      this.save();
      if (typeof window.navTo === 'function') window.navTo('winBrowser');
      window.internetEngine.render();
      const msg = `💥 Zero-Day ${zd.code} furou o Firewall de ${host.hostname} (${host.ip}) com ROOT imediato!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, hostIp: host.ip, message: msg };
    }

    scanInternalCorporateLan(hostIp) {
      this.ensureLoaded();
      if (!hostIp) return { success: false, message: 'Conecte-se primeiro ao servidor corporativo.' };
      if (this.state.pivotedCorpIps[hostIp]) {
        const msg = 'Sub-rede interna 10.x deste servidor já foi vasculhada nesta sessão.';
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, message: msg };
      }
      const host = window.internetEngine ? window.internetEngine.resolveHost(hostIp) : null;
      const tier = (host && host.tier) || 1;
      const bonusCash = 260 + tier * 240;
      this.state.pivotedCorpIps[hostIp] = Date.now();
      this.state.osintDossiers = Number(this.state.osintDossiers || 0) + 1;
      if (tier >= 2) {
        this.state.labCatalysts = Number(this.state.labCatalysts || 0) + 1;
      }

      runAuth(() => {
        if (window.currentWallet) window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + bonusCash).toFixed(2);
      });

      this.onCorporateHostSabotaged(hostIp, 'lan_pivot');
      this.unlockMilestone('ms_lan_pivot');
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = `🖧 Sub-rede interna 10.${tier}.0.99 invadida! Extraído +$ ${bonusCash} HC + 1 Dossiê OSINT${tier >= 2 ? ' + 1 Catalisador do Lab' : ''}!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      if (window.internetEngine && window.internetEngine.currentIp === hostIp) window.internetEngine.render();
      return { success: true, bonusCash, message: msg };
    }

    buyHardwareInsurance(planId) {
      this.ensureLoaded();
      const plans = {
        bronze: { name: 'Seguro Rig Bronze', cost: 350, coveragePct: 50, claims: 3 },
        gold: { name: 'Seguro Rig Ouro', cost: 750, coveragePct: 75, claims: 4 },
        quantum: { name: 'Seguro Rig Quantum', cost: 1400, coveragePct: 90, claims: 5 }
      };
      const p = plans[planId];
      if (!p) return { success: false, message: 'Plano inválido.' };
      const bal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
      if (bal < p.cost) {
        const msg = `Saldo insuficiente! ${p.name} custa $ ${p.cost} HC.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, message: msg };
      }

      runAuth(() => {
        window.currentWallet.balance = Math.max(0, +(bal - p.cost).toFixed(2));
      });

      this.state.insurance = { plan: planId, name: p.name, coveragePct: p.coveragePct, claimsLeft: p.claims };
      this.unlockMilestone('ms_rig_insured');
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = `🛡️ ${p.name} ativado! Cobre ${p.coveragePct}% do reparo físico contra DDoS (${p.claims} acionamentos).`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      this.renderUI();
      return { success: true, insurance: this.state.insurance, message: msg };
    }

    claimInsuranceReimbursement(repairCostPaid) {
      this.ensureLoaded();
      const ins = this.state.insurance;
      if (!ins || !ins.plan || ins.claimsLeft <= 0 || repairCostPaid <= 0) return 0;
      const refund = Math.round(repairCostPaid * (ins.coveragePct / 100));
      ins.claimsLeft -= 1;
      if (ins.claimsLeft <= 0) ins.plan = null;
      runAuth(() => {
        if (window.currentWallet) window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + refund).toFixed(2);
      });
      this.save();
      if (typeof window.showToast === 'function') {
        window.showToast(`🛡️ Seguro de Hardware reembolsou +$ ${refund} HC (${ins.coveragePct}%) do conserto!`);
      }
      return refund;
    }

    triggerPhoenixProtocol() {
      this.ensureLoaded();
      const fee = 900;
      const bal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
      if (bal < fee) {
        const msg = `Protocolo Fênix exige $ ${fee} HC para queimar rastros e renovar identidade emergencial.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, message: msg };
      }

      runAuth(() => {
        window.currentWallet.balance = Math.max(0, +(bal - fee).toFixed(2));
        if (window.currentProfile) window.currentProfile.heat_level = 1;
      });

      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '';
      if (myIp && window.botAI && window.botAI.syslogRegistry) {
        for (const [ip, lines] of window.botAI.syslogRegistry.entries()) {
          if (Array.isArray(lines) && lines.some((l) => String(l).includes(myIp))) {
            window.botAI.wipeLogs(ip);
          }
        }
      }
      if (window.networkIdentity && typeof window.networkIdentity.generateFreshPublicIp === 'function') {
        const nextIp = window.networkIdentity.generateFreshPublicIp();
        window.networkIdentity.state.publicIp = nextIp;
        window.networkIdentity.save();
        if (window.currentProfile) window.currentProfile.public_ip = nextIp;
      }

      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = '🔥 Protocolo Fênix executado! Identidade de rede rotacionada, rastros apagados e Heat zerado (1/5) mantendo Diplomas, Clã e Cofres!';
      if (typeof window.showToast === 'function') window.showToast(msg);
      this.renderUI();
      return { success: true, message: msg };
    }

    runSelfSecurityAudit() {
      this.ensureLoaded();
      const fwVer = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('firewall') : 1.0;
      const hashVer = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('hasher') : 1.0;
      const avVer = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('antivirus') : 0;
      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '';
      let exposedTraces = 0;
      if (myIp && window.botAI && window.botAI.syslogRegistry) {
        window.botAI.syslogRegistry.forEach((lines, ip) => {
          if (ip !== myIp && Array.isArray(lines) && lines.some((l) => String(l).includes(myIp))) exposedTraces += 1;
        });
      }
      const hops = window.worldMapEngine ? window.worldMapEngine.bounceRoute.length : 1;
      const insured = !!(this.state.insurance && this.state.insurance.plan);

      let score = 20;
      score += Math.min(20, Math.round(fwVer * 6));
      score += Math.min(15, Math.round(hashVer * 5));
      score += avVer > 0 ? 15 : 0;
      score += exposedTraces === 0 ? 15 : Math.max(0, 15 - exposedTraces * 7);
      score += Math.min(10, (hops - 1) * 4);
      score += insured ? 5 : 0;
      score = Math.min(100, score);

      this.lastAuditReport = {
        score,
        fwVer,
        hashVer,
        avVer,
        exposedTraces,
        hops,
        insured
      };
      this.unlockMilestone('ms_self_pentest');
      this.renderUI();
      return this.lastAuditReport;
    }

    // Integração limpa com Laboratório de Vírus (mantém $ 1.000 base e trava de 24h!)
    toggleArmLabCatalyst() {
      this.ensureLoaded();
      if (!this.state.labCatalystArmed && (this.state.labCatalysts || 0) <= 0) {
        if (typeof window.showToast === 'function') window.showToast('Sem Catalisadores no estoque! Obtenha em contratos .CCT, Matriz Hex ou Heists.');
        return { success: false };
      }
      this.state.labCatalystArmed = !this.state.labCatalystArmed;
      if (this.state.labCatalystArmed) this.unlockMilestone('ms_catalyst_lab');
      this.save();
      if (window.virusLabEngine) window.virusLabEngine.renderUI();
      this.renderUI();
      return { success: true, armed: this.state.labCatalystArmed };
    }

    toggleArmLabCoupon() {
      this.ensureLoaded();
      if (!this.state.labCouponArmed && (this.state.labDiscountCoupons || 0) <= 0) {
        if (typeof window.showToast === 'function') window.showToast('Sem Cupons Diários! Complete o Desafio Diário ou Desarmador de Canário.');
        return { success: false };
      }
      this.state.labCouponArmed = !this.state.labCouponArmed;
      this.save();
      if (window.virusLabEngine) window.virusLabEngine.renderUI();
      this.renderUI();
      return { success: true, armed: this.state.labCouponArmed };
    }

    peekLabFeeDiscount() {
      this.ensureLoaded();
      return (this.state.labCouponArmed && this.state.labDiscountCoupons > 0) ? 250 : 0;
    }

    consumeLabFeeCouponIfArmed() {
      this.ensureLoaded();
      if (this.state.labCouponArmed && this.state.labDiscountCoupons > 0) {
        this.state.labDiscountCoupons -= 1;
        this.state.labCouponArmed = false;
        this.save();
        return 250;
      }
      return 0;
    }

    consumeLabCompileBoosts() {
      this.ensureLoaded();
      const resBonus = window.skillTreeEngine ? window.skillTreeEngine.getActiveResonanceBonus() : { labFitBonus: 0, labXpMult: 1 };
      const cicadaFit = Math.min(9, Math.floor((this.state.factions.cicada || 0) / 100) * 3);
      let fitBonus = Number(resBonus.labFitBonus || 0) + cicadaFit;
      let extraXp = 0;
      let usedCatalyst = false;
      if (this.state.labCatalystArmed && this.state.labCatalysts > 0) {
        this.state.labCatalysts -= 1;
        this.state.labCatalystArmed = false;
        fitBonus += 12;
        extraXp += 35;
        usedCatalyst = true;
      }
      this.save();
      return { fitBonus, extraXp, xpMult: Number(resBonus.labXpMult || 1), usedCatalyst };
    }

    // =========================================================================
    // PILAR V — GOLPES DE EQUIPE (4 PAPÉIS) & RESPOSTA BLUE-TEAM
    // =========================================================================
    getCrewReadiness(heist) {
      const myCrc = window.internetEngine ? window.internetEngine.getPlayerCrackerVer() : 1.0;
      const hops = window.worldMapEngine ? window.worldMapEngine.bounceRoute.length : 1;
      const hasCctvDone = !!(window.cctvEngine && window.cctvEngine.state && (
        Object.keys(window.cctvEngine.state.disabledCameras || {}).length > 0 ||
        Object.keys(window.cctvEngine.state.loopedCameras || {}).length > 0
      ));
      const hasIntel = hasCctvDone || (this.state.osintDossiers || 0) > 0;
      const hasClanOrVps = this.getOwnedVpsCount() > 0 || !!(window.clanEngine && window.clanEngine.state && window.clanEngine.state.myClanId);

      const roles = [
        { role: 'Infiltrador (Cracker)', ok: myCrc >= heist.minCracker, detail: `v${myCrc.toFixed(1)} / mín v${heist.minCracker.toFixed(1)}` },
        { role: 'Fantasma (Mapa-Múndi)', ok: hops >= heist.minHops, detail: `${hops} / mín ${heist.minHops} saltos` },
        { role: 'Sabotador (CFTV / OSINT)', ok: !heist.needsCctvOrOsint || hasIntel, detail: hasIntel ? 'Pronto' : 'Tenha 1 OSINT ou CFTV sabotada' },
        { role: 'Suporte (Clã ou VPS)', ok: true, detail: hasClanOrVps ? 'Bônus +20% ativo' : 'Operando com mercenário IA' }
      ];
      return {
        ready: roles.every((r) => r.ok),
        hasClanOrVps,
        roles
      };
    }

    executeCrewHeist(heistId) {
      this.ensureLoaded();
      const heist = CREW_HEISTS.find((h) => h.id === heistId);
      if (!heist) return { success: false, message: 'Golpe inválido.' };

      const cdEnd = Number(this.state.heistCooldowns[heist.id] || 0);
      if (cdEnd > Date.now()) {
        const remS = Math.ceil((cdEnd - Date.now()) / 1000);
        const msg = `Equipe reorganizando rota: aguarde ${remS}s para repetir "${heist.title}".`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, message: msg };
      }

      const check = this.getCrewReadiness(heist);
      if (!check.ready) {
        const missing = check.roles.filter((r) => !r.ok).map((r) => `${r.role} (${r.detail})`).join(', ');
        const msg = `Pré-requisitos pendentes p/ o golpe: ${missing}`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, message: msg };
      }

      const syndBoost = 1 + Math.min(0.40, Math.floor((this.state.factions.syndicate || 0) / 100) * 0.08);
      const crewBoost = check.hasClanOrVps ? 1.20 : 1.0;
      const payout = Math.round(heist.cashReward * syndBoost * crewBoost);

      this.state.heistCooldowns[heist.id] = Date.now() + heist.cooldownMs;
      this.state.labCatalysts = Number(this.state.labCatalysts || 0) + (heist.catalystGrant || 1);
      this.addFactionRep(heist.factionId, 40);
      this.onCorporateHostSabotaged(heist.targetIp, 'crew_heist');
      this.unlockMilestone('ms_crew_heist');

      if (window.nineSystemsEngine && typeof window.nineSystemsEngine.addDirtyMoney === 'function') {
        window.nineSystemsEngine.addDirtyMoney(payout, `Golpe Coordenado 4x (${heist.title})`);
      } else {
        runAuth(() => {
          if (window.currentWallet) window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + payout).toFixed(2);
        });
      }
      runAuth(() => {
        if (window.currentProfile) window.currentProfile.reputation = Number(window.currentProfile.reputation || 100) + heist.repReward;
      });

      this.save();
      this.checkNetWorthMilestone();
      if (window.hackerAudio && typeof window.hackerAudio.playCashChime === 'function') window.hackerAudio.playCashChime();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = `🎭 Golpe "${heist.title}" concluído! +$ ${payout} em 🩸 Dinheiro Sujo, +${heist.repReward} REP, +${heist.catalystGrant} Catalisador(es) e queda em ${heist.corpSymbol}!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      this.renderUI();
      return { success: true, payout, message: msg };
    }

    executeBlueTeamIncident() {
      this.ensureLoaded();
      const avVer = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('antivirus') : 0;
      if (avVer <= 0) {
        const msg = 'Instale/baixe o Antivirus.av (Download Center 33.8.2.71) para atuar em Resposta a Incidentes Blue-Team!';
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, message: msg };
      }
      const ev = this.getCurrentGlobalEvent();
      const reward = Math.round((280 + avVer * 95) * (ev.id === 'ev_patch_wave' ? 1.30 : 1.0));
      runAuth(() => {
        if (window.currentWallet) window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + reward).toFixed(2);
        if (window.currentProfile) {
          window.currentProfile.heat_level = Math.max(1, Number(window.currentProfile.heat_level || 1) - 1);
          window.currentProfile.reputation = Number(window.currentProfile.reputation || 100) + 25;
        }
      });
      this.addFactionRep('omnicorp', 30);
      this.addFactionRep('safenet_div', 15);
      this.unlockMilestone('ms_blueteam');
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = `🧯 Incidente Blue-Team contido com Antivirus v${avVer.toFixed(1)}: +$ ${reward} HC limpos e Heat Policial reduzido!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      this.renderUI();
      return { success: true, reward, message: msg };
    }

    // =========================================================================
    // PILAR VI — AUTOMAÇÃO LEGÍTIMA POR VPS (CRONDAEMONS) & LOOP DE FUNDO
    // =========================================================================
    getOwnedVpsCount() {
      let count = 0;
      if (window.hardwareEngine && typeof window.hardwareEngine.getMachinesFleet === 'function') {
        const fleet = window.hardwareEngine.getMachinesFleet();
        count += fleet.filter((m) => !m.isPrimaryPc).length;
      }
      if (window.lanServersEngine && Array.isArray(window.lanServersEngine.servers)) {
        const extraLan = Math.max(0, window.lanServersEngine.servers.length - 1);
        count = Math.max(count, extraLan);
      }
      return count;
    }

    isCronActive(daemonId) {
      this.ensureLoaded();
      const def = CRON_DAEMONS.find((d) => d.id === daemonId);
      if (!def) return false;
      return !!this.state.cronActive[daemonId] && this.getOwnedVpsCount() >= def.reqVps;
    }

    toggleCronDaemon(daemonId) {
      this.ensureLoaded();
      const def = CRON_DAEMONS.find((d) => d.id === daemonId);
      if (!def) return { success: false };
      const vpsCount = this.getOwnedVpsCount();
      if (vpsCount < def.reqVps) {
        const msg = `Exige ${def.reqVps} servidor(es) VPS ativo(s) (você tem ${vpsCount}). Contrate uma VPS em Peças do PC ou Servidores & LAN!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'NEEDS_VPS', message: msg };
      }
      this.state.cronActive[daemonId] = !this.state.cronActive[daemonId];
      if (this.state.cronActive[daemonId]) {
        this.unlockMilestone('ms_cron_active');
      }
      this.save();
      this.renderUI();
      const msg = this.state.cronActive[daemonId]
        ? `🤖 ${def.name} ATIVADO na sua frota VPS!`
        : `⏸️ ${def.name} pausado.`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, active: this.state.cronActive[daemonId], message: msg };
    }

    rotateGlobalEvent() {
      this.ensureLoaded();
      this.state.activeEventIdx = (Number(this.state.activeEventIdx || 0) + 1) % GLOBAL_EVENTS.length;
      if (!this.state.flashBounty || this.state.flashBounty.expiresAt <= Date.now() || this.state.flashBounty.completed) {
        this.state.flashBounty = this.generateFlashBounty();
      }
      this.save(true);
      this.renderUI();
    }

    startBackgroundLoop() {
      if (typeof window === 'undefined') return;
      if (this._tickerTimer) clearInterval(this._tickerTimer);
      let ticks = 0;
      this._tickerTimer = setInterval(() => {
        if (!window.currentProfile) return;
        ticks += 1;
        this.tickStockMarket();

        // A cada ~45s roda os CronDaemons ativos na VPS
        if (ticks % 3 === 0) {
          if (this.isCronActive('auto_harvest') && window.softwareEngine && typeof window.softwareEngine.collectAllViruses === 'function') {
            const infs = (window.softwareEngine.state && window.softwareEngine.state.remoteInfections) || [];
            if (infs.length > 0) {
              window.softwareEngine.collectAllViruses();
            }
          }
          if (this.isCronActive('trace_watchdog') && window.skillTreeEngine && window.skillTreeEngine.getRank('quick_wipe') > 0) {
            const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '';
            if (myIp && window.botAI && window.botAI.syslogRegistry) {
              for (const [ip, lines] of window.botAI.syslogRegistry.entries()) {
                if (ip !== myIp && Array.isArray(lines) && lines.some((l) => String(l).includes(myIp))) {
                  window.botAI.wipeLogs(ip);
                  break;
                }
              }
            }
          }
        }

        if (ticks % 12 === 0) {
          this.rotateGlobalEvent();
        } else if (window.winManager && window.winManager.current === 'winOpsHub') {
          this.renderUI();
        }
      }, 15000);
    }

    // =========================================================================
    // WIDGET COMPACTO PARA O PAINEL INÍCIO (winHome)
    // =========================================================================
    renderHomeStripHtml() {
      this.ensureLoaded();
      const ev = this.getCurrentGlobalEvent();
      const nw = this.computeNetWorthAnalytics();
      const wm = this.getWorldMapActiveMultipliers();
      const chips = STOCK_CORPS.slice(0, 5).map((c) => {
        const st = this.state.stocks[c.symbol];
        const diff = st.price - c.basePrice;
        const cls = diff >= 0 ? 'up' : 'down';
        return `<span class="eco-ticker-chip" onclick="window.ecosystemHub.activeTab='stocks'; navTo('winOpsHub');"><strong>${c.symbol}</strong> $${st.price.toFixed(2)} <span class="${cls}">${diff >= 0 ? '▲' : '▼'}</span></span>`;
      }).join('');

      return `
        <div class="eco-top-ticker" style="margin-bottom:14px;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span class="hc-badge ${ev.badge}">🌐 ${esc(ev.title)}</span>
            <span style="font-size:12px;color:var(--hc-text-2);">${esc(ev.effectText)}</span>
          </div>
          <div class="eco-ticker-strip">
            ${chips}
            <span class="hc-badge success" style="cursor:pointer;" onclick="navTo('winOpsHub')">Patrimônio: $${nw.totalNetWorth.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} · Rota +${wm.crackerSpeedPct}% CRC</span>
          </div>
        </div>
      `;
    }

    // =========================================================================
    // RENDERIZAÇÃO PRINCIPAL DA JANELA #winOpsHub
    // =========================================================================
    switchTab(tab) {
      this.activeTab = tab;
      this.renderUI();
    }

    renderSparkline(history) {
      const arr = Array.isArray(history) && history.length > 0 ? history : [50];
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      const span = Math.max(0.5, max - min);
      const bars = arr.slice(-8).map((v, idx, a) => {
        const h = Math.round(5 + ((v - min) / span) * 16);
        const col = v >= a[0] ? '#35b877' : '#e5534b';
        return `<span style="height:${h}px;background:${col};"></span>`;
      }).join('');
      return `<span class="stock-spark-bar">${bars}</span>`;
    }

    renderStocksTab() {
      const nw = this.computeNetWorthAnalytics();
      const has4s = this.has4SForecast();
      const rows = STOCK_CORPS.map((c) => {
        const st = this.state.stocks[c.symbol];
        const pct = (((st.price - c.basePrice) / c.basePrice) * 100).toFixed(1);
        const isUp = Number(pct) >= 0;
        const longPos = this.state.longPositions[c.symbol];
        const shortPos = this.state.shortPositions[c.symbol];
        const forecast = st.integrity < 92 ? 'VAI SUBIR ↑' : (st.integrity > 105 ? 'PODE CAIR ↓' : 'ESTÁVEL ↔');
        return `
          <tr>
            <td>
              <strong class="mono" style="color:var(--hc-text);">${c.symbol}</strong>
              <div style="font-size:11.5px;color:var(--hc-text-2);">${esc(c.name)}</div>
            </td>
            <td class="mono" style="font-size:12px;">
              <a href="javascript:void(0)" onclick="window.internetEngine.openIp('${c.ip}', 'invadir')" style="color:var(--hc-accent-text);text-decoration:none;">${c.ip} ↗</a>
            </td>
            <td class="mono"><strong>$ ${st.price.toFixed(2)}</strong> <span style="font-size:11px;color:${isUp ? '#35b877' : '#e5534b'};">(${isUp ? '+' : ''}${pct}%)</span></td>
            <td>${this.renderSparkline(st.history)}</td>
            <td>
              <span class="hc-badge ${st.integrity < 80 ? 'danger' : 'success'}">${st.integrity}%</span>
              ${has4s ? `<div style="font-size:10.5px;color:var(--hc-accent-text);margin-top:2px;">Dica: ${forecast}</div>` : ''}
            </td>
            <td style="font-size:11.5px;">
              ${longPos ? `<span class="hc-badge success">COMPRADO (${longPos.shares.toFixed(2)})</span>` : ''}
              ${shortPos ? `<span class="hc-badge warn">NA QUEDA @$${shortPos.entryPrice.toFixed(2)}</span>` : ''}
              ${!longPos && !shortPos ? `<span style="color:var(--hc-text-3);">—</span>` : ''}
            </td>
            <td style="text-align:right;">
              <div style="display:flex;gap:5px;justify-content:flex-end;flex-wrap:wrap;">
                <button type="button" id="btnBuyLong_${c.symbol}" class="hc-btn primary sm" onclick="window.ecosystemHub.buyLongPosition('${c.symbol}', Number(document.getElementById('stockOrderUsdInput')?.value || 200))">Comprar (Sobe)</button>
                ${longPos ? `<button type="button" id="btnSellLong_${c.symbol}" class="hc-btn ghost sm" onclick="window.ecosystemHub.sellLongPosition('${c.symbol}')">Vender</button>` : ''}
                <button type="button" id="btnOpenShort_${c.symbol}" class="hc-btn sm" style="border-color:var(--hc-warning);color:var(--hc-warning);" onclick="window.ecosystemHub.openShortPosition('${c.symbol}', Number(document.getElementById('stockOrderUsdInput')?.value || 200))">Apostar Queda 📉</button>
                ${shortPos ? `<button type="button" id="btnCloseShort_${c.symbol}" class="hc-btn primary sm" onclick="window.ecosystemHub.closeShortPosition('${c.symbol}')">Pegar Lucro Queda</button>` : ''}
                <button type="button" class="hc-btn ghost sm" title="Ajuda a empresa a subir e paga Dinheiro Limpo + baixa sua Procura" onclick="window.ecosystemHub.executeWhiteHatRestore('${c.symbol}')">🛡️ Defender</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      return `
        <div class="hc-stat-strip">
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Seu Patrimônio Total</div>
            <div class="hc-stat-value" style="color:var(--hc-accent-text);">$ ${nw.totalNetWorth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div class="hc-stat-sub">Conta $${nw.cash.toFixed(0)} · Bolsa $${nw.stockEquity.toFixed(0)} · BTC $${nw.btcUsd.toFixed(0)}</div>
          </div>
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Lucro na Bolsa (Limpo)</div>
            <div class="hc-stat-value">${this.state.totalTradingProfit >= 0 ? '+' : ''}$ ${this.state.totalTradingProfit.toFixed(2)}</div>
            <div class="hc-stat-sub">Compras e quedas encerradas</div>
          </div>
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Rendimento às 12h</div>
            <div class="hc-stat-value" style="color:#35b877;">+$ ${this.state.totalDividendsEarned.toFixed(2)}</div>
            <div class="hc-stat-sub">Ajuda a pagar Luz e Aluguel ($${nw.monthlyBills}/mês)</div>
          </div>
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Previsão de Preço</div>
            <div class="hc-stat-value">${has4s ? 'LIBERADA' : 'BLOQUEADA'}</div>
            <div class="hc-stat-sub">${has4s ? 'Mostrando tendência das ações' : 'Ter Analyzer v2.0+ ou CERT-201'}</div>
          </div>
        </div>

        <div class="eco-card accent">
          <div class="eco-card-head">
            <div>
              <div class="eco-card-title">📈 Bolsa de Empresas (Seus Ataques Mudam os Preços de Verdade!)</div>
              <div class="eco-card-sub">Quer lucrar <strong>Dinheiro Limpo</strong>? Clique em <strong>Apostar Queda 📉</strong> numa empresa, invada o IP dela (apague as câmeras ou roube o cofre), limpe seu IP dos rastros e clique em <strong>Pegar Lucro Queda</strong>! Ou compre a ação e clique em <strong>🛡️ Defender</strong> para ela subir!</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <label style="font-size:12px;color:var(--hc-text-2);">Valor p/ Investir ($ Limpo):</label>
              <input type="number" id="stockOrderUsdInput" class="hc-input mono" style="width:120px;height:34px;" min="50" step="50" value="200">
            </div>
          </div>
          <div style="overflow-x:auto;">
            <table class="hc-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>IP p/ Invadir</th>
                  <th>Preço Atual</th>
                  <th>Histórico</th>
                  <th>Saúde</th>
                  <th>Sua Aposta</th>
                  <th style="text-align:right;">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      `;
    }

    renderMinigamesTab() {
      if (!this.activeGameSession || this.activeGameSession.kind !== this.selectedMinigameKind) {
        this.startMinigame(this.selectedMinigameKind);
      }
      const g = this.activeGameSession;
      const selectorBtns = [
        { id: 'hex_breach', label: '1. Matriz Hex 5x5 (Daemons)' },
        { id: 'packet_sniffer', label: '2. Packet Sniffer (OSINT)' },
        { id: 'logic_gates', label: '3. Portas Lógicas (Luz -12%)' },
        { id: 'rf_waveform', label: '4. Satélite RF (Mapa-Múndi)' },
        { id: 'cipher_cracker', label: '5. Cifra Zero-Day (CVE 24h)' },
        { id: 'canary_defuse', label: '6. Canário Reverso (Cupom Lab)' }
      ].map((b) => `
        <button type="button" id="btnPickMg_${b.id}" class="hc-btn ${this.selectedMinigameKind === b.id ? 'primary' : 'ghost'} sm" onclick="window.ecosystemHub.startMinigame('${b.id}')">${b.label}</button>
      `).join('');

      let stageHtml = '';
      if (g.kind === 'hex_breach') {
        const cells = [];
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 5; c++) {
            const used = !!g.used[`${r},${c}`];
            const selectable = !g.completed && !used && ((g.mode === 'row' && r === g.activeIndex) || (g.mode === 'col' && c === g.activeIndex));
            cells.push(`<button type="button" class="hex-cell ${used ? 'used' : ''} ${selectable ? 'selectable' : ''}" onclick="window.ecosystemHub.clickHexCell(${r},${c})">${g.grid[r][c]}</button>`);
          }
        }
        const bufSlots = Array.from({ length: g.maxBuffer }, (_, i) => `<span class="hex-buf-slot">${g.buffer[i] || '·'}</span>`).join('');
        const daemonList = g.daemons.map((d) => `
          <div class="daemon-row ${d.matched ? 'matched' : ''}">
            <div>
              <strong class="mono" style="font-size:12.5px;color:${d.matched ? '#5fd39a' : '#eceff3'};">${d.matched ? '✓ ' : ''}${d.name}</strong>
              <div style="font-size:11.5px;color:var(--hc-text-2);">${d.rewardText}</div>
            </div>
            <span class="mono hc-badge ${d.matched ? 'success' : 'info'}">${d.seq.join(' → ')}</span>
          </div>
        `).join('');

        stageHtml = `
          <div class="hex-breach-wrap">
            <div>
              <div style="font-size:12px;color:var(--hc-accent-text);margin-bottom:6px;font-weight:600;">
                Seleção atual: ${g.mode === 'row' ? `LINHA ${g.activeIndex + 1}` : `COLUNA ${g.activeIndex + 1}`}
              </div>
              <div class="hex-matrix-grid">${cells.join('')}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;">
              <div>
                <div style="font-size:11.5px;color:var(--hc-text-2);margin-bottom:4px;">BUFFER DE INJEÇÃO (${g.buffer.length}/${g.maxBuffer}):</div>
                <div class="hex-buffer-row">${bufSlots}</div>
              </div>
              <div style="display:flex;flex-direction:column;gap:7px;">${daemonList}</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button type="button" id="btnFinishHexBreach" class="hc-btn primary sm" onclick="window.ecosystemHub.finishHexBreach()">Executar Daemons Capturados</button>
                <button type="button" class="hc-btn ghost sm" onclick="window.ecosystemHub.startMinigame('hex_breach')">Nova Matriz 5x5</button>
              </div>
            </div>
          </div>
        `;
      } else if (g.kind === 'packet_sniffer') {
        stageHtml = `
          <div class="eco-card-sub">Capture os pacotes legítimos (<code>SWIFT_AUTH</code>, <code>SSH</code>, <code>OSINT</code>, <code>BTC</code>) e descarte os pacotes de armadilha (<code>HONEYPOT</code> / <code>FBI</code>) para gerar <strong>+1 Dossiê OSINT</strong>!</div>
          <div class="pkt-stream-grid">
            ${g.packets.map((p) => `
              <div class="pkt-card ${p.state === 'captured' || p.state === 'dropped_trap' ? 'captured' : (p.state === 'tripped' ? 'tripped' : '')}">
                <div style="display:flex;justify-content:space-between;"><strong>:${p.port}</strong><span>${esc(p.tag)}</span></div>
                <div style="color:var(--hc-text-3);">${esc(p.payload)}</div>
                ${p.state === 'pending' ? `
                  <div style="display:flex;gap:5px;margin-top:4px;">
                    <button type="button" class="hc-btn primary sm" onclick="window.ecosystemHub.actOnPacket(${p.idx}, 'capture')">Capturar</button>
                    <button type="button" class="hc-btn ghost sm" onclick="window.ecosystemHub.actOnPacket(${p.idx}, 'drop')">Descartar</button>
                  </div>
                ` : `<span class="hc-badge ${p.state === 'tripped' ? 'danger' : 'success'}">${p.state.toUpperCase()}</span>`}
              </div>
            `).join('')}
          </div>
        `;
      } else if (g.kind === 'logic_gates') {
        const ev = this.evaluateLogicCircuit(g.inputs);
        stageHtml = `
          <div class="eco-card-sub">Energize a saída <strong>OUT = 1</strong> do CLP industrial: <code>G1 = (A XOR B)</code> · <code>G2 = (B AND C)</code> · <code>OUT = (G1 AND G2)</code>. Recompensa: <strong>-12% na Fatura de Energia da Quitinete</strong>!</div>
          <div class="logic-switch-row">
            ${['A', 'B', 'C'].map((lbl, idx) => `
              <button type="button" id="btnLogicBit_${idx}" class="logic-bit-btn ${g.inputs[idx] ? 'on' : ''}" onclick="window.ecosystemHub.toggleLogicInput(${idx})">
                CHAVE ${lbl} = ${g.inputs[idx]}
              </button>
            `).join('')}
            <span class="mono hc-badge ${ev.g1Xor ? 'success' : ''}">G1 (A XOR B) = ${ev.g1Xor}</span>
            <span class="mono hc-badge ${ev.g2And ? 'success' : ''}">G2 (B AND C) = ${ev.g2And}</span>
            <span class="mono hc-badge ${ev.out ? 'success' : 'danger'}">SAÍDA OUT = ${ev.out}</span>
            <button type="button" id="btnVerifyLogicGate" class="hc-btn primary sm" onclick="window.ecosystemHub.verifyLogicCircuit()">Validar Bypass</button>
          </div>
        `;
      } else if (g.kind === 'rf_waveform') {
        stageHtml = `
          <div class="eco-card-sub">Alinhe a Frequência e a Fase da antena com a portadora do satélite (<strong>Alvo: ${g.targetFreq} GHz · Fase ${g.targetPhase}</strong>) para injetar <strong>+15% de Influência Regional no Mapa-Múndi</strong>!</div>
          <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;">
            <label style="font-size:12px;">Frequência: <strong>${g.freq} GHz</strong>
              <input type="range" id="rfFreqRange" min="1" max="6" value="${g.freq}" oninput="window.ecosystemHub.adjustWaveform(this.value, null, null)">
            </label>
            <label style="font-size:12px;">Fase: <strong>${g.phase}</strong>
              <input type="range" id="rfPhaseRange" min="1" max="5" value="${g.phase}" oninput="window.ecosystemHub.adjustWaveform(null, this.value, null)">
            </label>
            <select class="hc-input" style="width:190px;height:34px;" onchange="window.ecosystemHub.adjustWaveform(null, null, this.value)">
              ${['América do Norte', 'América do Sul', 'Europa', 'Ásia-Pacífico', 'Oriente Médio', 'Oceania', 'África'].map((r) => `<option value="${r}" ${g.region === r ? 'selected' : ''}>${r}</option>`).join('')}
            </select>
            <button type="button" id="btnLockRfSignal" class="hc-btn primary sm" onclick="window.ecosystemHub.lockSatelliteSignal()">Sincronizar Satélite</button>
          </div>
        `;
      } else if (g.kind === 'cipher_cracker') {
        stageHtml = `
          <div class="eco-card-sub">Interceptamos o payload cifrado em César (+3 posições no alfabeto): <strong class="mono" style="color:var(--hc-accent-text);font-size:15px;">${esc(g.encoded)}</strong>. Decifre a palavra original para compilar um <strong>Exploit CVE Zero-Day (válido por 24h)</strong>!</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            <input type="text" id="cipherAnswerInput" class="hc-input mono" style="width:220px;height:36px;" placeholder="Palavra decifrada...">
            <button type="button" id="btnSubmitCipher" class="hc-btn primary sm" onclick="window.ecosystemHub.submitCipherSolution(document.getElementById('cipherAnswerInput')?.value)">Decodificar &amp; Gerar CVE</button>
          </div>
        `;
      } else if (g.kind === 'canary_defuse') {
        stageHtml = `
          <div class="eco-card-sub">Pulso do Canário Dead-Man detectado: <strong class="mono" style="color:var(--hc-warning);">${g.triggerSeq.join(' - ')}</strong>. Clique nos códigos na <strong>ORDEM INVERSA</strong> para ganhar <strong>+1 Cupom (-$250 no Lab de Vírus)</strong> e reduzir seu Alerta!</div>
          <div style="font-size:12px;margin-bottom:6px;" class="mono">Entrada atual: <strong>${g.typed.join(' → ') || '(aguardando)'}</strong></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${g.options.map((code) => `<button type="button" class="hc-btn sm mono" onclick="window.ecosystemHub.pressCanaryNode('${code}')">${code}</button>`).join('')}
          </div>
        `;
      }

      return `
        <div class="hc-stat-strip">
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Streak Diário Cripto</div>
            <div class="hc-stat-value" style="color:var(--hc-accent-text);">${this.state.dailyStreak} dia(s)</div>
            <div class="hc-stat-sub">+35 XP no Lab de Vírus no 1º puzzle do dia</div>
          </div>
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Catalisadores do Lab</div>
            <div class="hc-stat-value">${this.state.labCatalysts} un.</div>
            <div class="hc-stat-sub">${this.state.labCatalystArmed ? '🔥 ARMADO (+12 Fit / +35 XP)' : 'Use na bancada do Lab'}</div>
          </div>
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Cupons Bancada (-$250)</div>
            <div class="hc-stat-value">${this.state.labDiscountCoupons} un.</div>
            <div class="hc-stat-sub">${this.state.labCouponArmed ? '🎟️ ARMADO ($1.000 → $750)' : 'Desconto s/ quebrar trava 24h'}</div>
          </div>
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Contratos .CCT Resolvidos</div>
            <div class="hc-stat-value">${Object.keys(this.state.cctSolvedByIp).length}</div>
            <div class="hc-stat-sub">Extraídos de servidores invadidos</div>
          </div>
        </div>

        <div class="eco-card accent">
          <div class="eco-card-head">
            <div>
              <div class="eco-card-title">🧩 Arena Tática de 6 Minigames &amp; Decodificador de Contratos (.CCT)</div>
              <div class="eco-card-sub">${g.ctx && g.ctx.source === 'cct' ? `🔓 Decodificando contrato <strong>${esc(g.ctx.filename)}</strong> extraído de <code>${esc(g.ctx.hostIp)}</code>!` : 'Cada minigame alimenta outro módulo do jogo (Firewall de alvos, OSINT, Fatura de Luz, Mapa-Múndi, Zero-Days e Laboratório de Vírus).'}</div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button type="button" id="btnToggleArmCatalyst" class="hc-btn ${this.state.labCatalystArmed ? 'primary' : 'ghost'} sm" onclick="window.ecosystemHub.toggleArmLabCatalyst()">🧪 ${this.state.labCatalystArmed ? 'Catalisador Armado ✓' : `Armar Catalisador (${this.state.labCatalysts})`}</button>
              <button type="button" id="btnToggleArmCoupon" class="hc-btn ${this.state.labCouponArmed ? 'primary' : 'ghost'} sm" onclick="window.ecosystemHub.toggleArmLabCoupon()">🎟️ ${this.state.labCouponArmed ? 'Cupom -$250 Armado ✓' : `Armar Cupom (${this.state.labDiscountCoupons})`}</button>
            </div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;padding-bottom:8px;border-bottom:1px solid var(--hc-border);">${selectorBtns}</div>
          ${stageHtml}
        </div>
      `;
    }

    renderIntelTab() {
      const wm = this.getWorldMapActiveMultipliers();
      const activeZds = this.state.zeroDays.filter((z) => !z.used && z.expiresAt > Date.now());
      const ins = this.state.insurance;
      const aud = this.lastAuditReport;

      return `
        <div class="eco-grid-2">
          <!-- OSINT & Zero-Days -->
          <div class="eco-card accent">
            <div class="eco-card-title">🕵️ Central OSINT &amp; Exploits CVE Zero-Day (24h)</div>
            <div class="eco-card-sub">Dossiês OSINT disponíveis: <strong>${this.state.osintDossiers}</strong>. Use em qualquer servidor Tier 1–3 para descobrir a senha <code>root</code> sem força-bruta!</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <input type="text" id="osintTargetIpInput" class="hc-input mono" style="flex:1;min-width:170px;height:34px;" value="203.17.88.40" placeholder="IP do alvo (ex: 203.17.88.40)">
              <button type="button" id="btnUseOsintDossier" class="hc-btn primary sm" onclick="window.ecosystemHub.useOsintDossierOnIp(document.getElementById('osintTargetIpInput')?.value)">Investigar c/ OSINT</button>
            </div>
            <div style="border-top:1px solid var(--hc-border);padding-top:8px;margin-top:4px;">
              <div style="font-size:12px;font-weight:600;margin-bottom:6px;">Arsenal CVE Zero-Day Ativo (${activeZds.length}):</div>
              ${activeZds.length === 0
                ? `<div style="font-size:12px;color:var(--hc-text-3);">Nenhum CVE ativo. Quebre uma Cifra na aba Minigames para gerar um Zero-Day de 24h!</div>`
                : activeZds.map((z) => `
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #1b2430;">
                    <span class="mono" style="font-size:12px;color:#5fd39a;">${esc(z.code)} (até Tier ${z.maxTier + 1})</span>
                    <button type="button" class="hc-btn primary sm" onclick="window.ecosystemHub.useZeroDayOnHost('${z.id}', document.getElementById('osintTargetIpInput')?.value)">Furar Firewall Agora →</button>
                  </div>
                `).join('')}
            </div>
          </div>

          <!-- Seguro de Hardware & Protocolo Fênix -->
          <div class="eco-card warn">
            <div class="eco-card-title">🛡️ Seguro Físico de Hardware &amp; Protocolo Fênix</div>
            <div class="eco-card-sub">
              Status da Apólice: <strong>${ins && ins.plan ? `${ins.name} (${ins.coveragePct}% cobertura · ${ins.claimsLeft} sinistros restantes)` : 'Desprotegido contra sobrecarga DDoS'}</strong>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button type="button" id="btnBuyInsBronze" class="hc-btn sm" onclick="window.ecosystemHub.buyHardwareInsurance('bronze')">Bronze 50% ($350)</button>
              <button type="button" id="btnBuyInsGold" class="hc-btn primary sm" onclick="window.ecosystemHub.buyHardwareInsurance('gold')">Ouro 75% ($750)</button>
              <button type="button" id="btnBuyInsQuantum" class="hc-btn sm" onclick="window.ecosystemHub.buyHardwareInsurance('quantum')">Quantum 90% ($1.400)</button>
            </div>
            <div style="border-top:1px solid var(--hc-border);padding-top:8px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
              <div style="font-size:11.5px;color:var(--hc-text-2);">Cercado pelo FBI? Queime rastros e gire IP mantendo Diplomas, Clã e Offshore:</div>
              <button type="button" id="btnPhoenixProtocol" class="hc-btn ghost sm" style="border-color:var(--hc-danger);color:var(--hc-danger-text);" onclick="window.ecosystemHub.triggerPhoenixProtocol()">🔥 Protocolo Fênix ($900)</button>
            </div>
          </div>

          <!-- Bônus Reais do Mapa-Múndi -->
          <div class="eco-card">
            <div class="eco-card-title">🌍 Bônus Ativos da Sua Rota no Mapa-Múndi (${wm.hops} salto[s])</div>
            <div class="eco-card-sub">Cidades encadeadas: <strong>${esc(wm.activePopNames.join(' → '))}</strong></div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <span class="hc-badge success">+${wm.crackerSpeedPct}% Velocidade Cracker</span>
              <span class="hc-badge info">+${wm.btcYieldPct}% Mineração BTC</span>
              <span class="hc-badge success">+${Math.round((wm.collectorMult - 1) * 100)}% Coletor Viral</span>
              <span class="hc-badge warn">-${wm.billDiscountPct}% Desconto Continental</span>
            </div>
            <div>
              <button type="button" class="hc-btn ghost sm" onclick="navTo('winWorldMap')">Editar Rota no Mapa-Múndi →</button>
            </div>
          </div>

          <!-- Auditoria Pentest Pessoal -->
          <div class="eco-card">
            <div class="eco-card-head">
              <div class="eco-card-title">🔬 Pentest Pessoal da Sua Máquina</div>
              <button type="button" id="btnRunSelfAudit" class="hc-btn primary sm" onclick="window.ecosystemHub.runSelfSecurityAudit()">Rodar Pentest Local</button>
            </div>
            ${!aud
              ? `<div class="eco-card-sub">Simule uma invasão contra o seu próprio PC para descobrir falhas em Firewall, Hasher, Antivírus e Rastros Esquecidos.</div>`
              : `<div style="font-size:12.5px;display:flex;flex-direction:column;gap:4px;">
                   <div>Nota de Blindagem: <strong style="color:${aud.score >= 70 ? '#35b877' : '#f0a83a'};">${aud.score}/100</strong></div>
                   <div>Firewall v${aud.fwVer.toFixed(1)} · Hasher v${aud.hashVer.toFixed(1)} · Antivírus ${aud.avVer > 0 ? 'v' + aud.avVer.toFixed(1) : 'AUSENTE ⚠️'}</div>
                   <div>Rastros remotos com seu IP: <strong style="color:${aud.exposedTraces > 0 ? '#e5534b' : '#35b877'};">${aud.exposedTraces}</strong> · Saltos: ${aud.hops} · Seguro: ${aud.insured ? 'Ativo ✓' : 'Inativo'}</div>
                 </div>`}
          </div>
        </div>
      `;
    }

    renderFactionsTab() {
      const fb = this.state.flashBounty;
      const fbActive = fb && !fb.completed && fb.expiresAt > Date.now();

      const facCards = FACTIONS_DEF.map((f) => {
        const pts = Number(this.state.factions[f.id] || 0);
        const tier = Math.floor(pts / 100) + 1;
        return `
          <div class="eco-card">
            <div class="eco-card-head">
              <strong style="font-size:13.5px;">${esc(f.name)}</strong>
              <span class="hc-badge ${f.badge}">Grau ${tier} · ${pts} REP</span>
            </div>
            <div class="eco-card-sub">${esc(f.focus)}</div>
            <div style="font-size:11.5px;color:var(--hc-accent-text);">${esc(f.perkDesc)}</div>
          </div>
        `;
      }).join('');

      const heistCards = CREW_HEISTS.map((h) => {
        const chk = this.getCrewReadiness(h);
        const cdRem = Math.max(0, Math.ceil((Number(this.state.heistCooldowns[h.id] || 0) - Date.now()) / 1000));
        return `
          <div class="eco-card ${chk.ready ? 'accent' : ''}">
            <div class="eco-card-head">
              <div>
                <div class="eco-card-title">🎭 ${esc(h.title)}</div>
                <div style="font-size:11.5px;color:var(--hc-text-3);">Alvo: <code>${h.targetIp}</code> (${h.corpSymbol}) · Recompensa base: <strong>$ ${h.cashReward} HC + ${h.catalystGrant} Catalisador</strong></div>
              </div>
              <button type="button" id="btnExecHeist_${h.id}" class="hc-btn ${chk.ready && cdRem === 0 ? 'primary' : 'ghost'} sm" ${cdRem > 0 ? 'disabled' : ''} onclick="window.ecosystemHub.executeCrewHeist('${h.id}')">
                ${cdRem > 0 ? `Aguarde ${cdRem}s` : 'Executar Golpe 4x'}
              </button>
            </div>
            <div class="eco-card-sub">${esc(h.desc)}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${chk.roles.map((r) => `<span class="hc-badge ${r.ok ? 'success' : 'warn'}">${esc(r.role)}: ${esc(r.detail)}</span>`).join('')}
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="eco-card warn">
          <div class="eco-card-head">
            <div>
              <div class="eco-card-title">⚡ Flash Bounty Corporativo &amp; Plantão Blue-Team</div>
              <div class="eco-card-sub">
                ${fbActive
                  ? `Alvo Relâmpago Ativo: sabote <strong>${esc(fb.targetName)} (${fb.targetIp})</strong> em até ${Math.ceil((fb.expiresAt - Date.now()) / 60000)} min para ganhar bônus automático de <strong>+$ ${fb.rewardCash} HC</strong>!`
                  : 'Alvo relâmpago concluído neste ciclo! Você também pode atender chamados defensivos Blue-Team abaixo para ganhar dinheiro limpo e reduzir seu Heat:'}
              </div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${fbActive ? `<button type="button" class="hc-btn sm" onclick="window.internetEngine.openIp('${fb.targetIp}', 'invadir')">Ir Invadir ${fb.targetIp} →</button>` : ''}
              <button type="button" id="btnBlueTeamIncident" class="hc-btn primary sm" onclick="window.ecosystemHub.executeBlueTeamIncident()">🧯 Atender Incidente Blue-Team (-Heat)</button>
            </div>
          </div>
        </div>

        <div class="eco-grid-2">${facCards}</div>
        <div class="eco-grid-2">${heistCards}</div>
      `;
    }

    renderAutomationTab() {
      const vpsCount = this.getOwnedVpsCount();
      const unlockedCount = Object.keys(this.state.unlockedMilestones).length;

      const cronCards = CRON_DAEMONS.map((d) => {
        const active = this.isCronActive(d.id);
        const meetsVps = vpsCount >= d.reqVps;
        return `
          <div class="eco-card ${active ? 'accent' : ''}">
            <div class="eco-card-head">
              <div>
                <div class="eco-card-title">🤖 ${esc(d.name)}</div>
                <div style="font-size:11.5px;color:var(--hc-text-3);">Requisito de Infraestrutura: ${d.reqVps} VPS (${meetsVps ? 'Disponível ✓' : `Você tem ${vpsCount}`})</div>
              </div>
              <button type="button" id="btnToggleCron_${d.id}" class="hc-btn ${active ? 'primary' : 'ghost'} sm" onclick="window.ecosystemHub.toggleCronDaemon('${d.id}')">
                ${active ? 'Ativo na VPS ✓' : 'Ativar Daemon'}
              </button>
            </div>
            <div class="eco-card-sub">${esc(d.desc)}</div>
          </div>
        `;
      }).join('');

      const msCards = ECOSYSTEM_MILESTONES.map((m) => {
        const done = !!this.state.unlockedMilestones[m.id];
        return `
          <div style="padding:9px 12px;border-radius:8px;background:#0d1219;border:1px solid ${done ? 'rgba(53,184,119,0.5)' : '#1e2734'};display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <div>
              <strong style="font-size:12.5px;color:${done ? '#5fd39a' : '#eceff3'};">${done ? '🏅 ' : '○ '}${esc(m.title)}</strong>
              <div style="font-size:11.5px;color:var(--hc-text-2);">${esc(m.desc)}</div>
            </div>
            <span class="hc-badge ${done ? 'success' : ''}">+${m.rep} REP${m.sp ? ` · +${m.sp} SP` : ''}</span>
          </div>
        `;
      }).join('');

      return `
        <div class="eco-card accent">
          <div class="eco-card-head">
            <div>
              <div class="eco-card-title">🖥️ Frota de Automação VPS (CronDaemons Legítimos)</div>
              <div class="eco-card-sub">Servidores VPS detectados na sua conta: <strong>${vpsCount} VPS</strong>. Cada VPS comprada em <em>Peças do PC</em> ou <em>Servidores &amp; LAN</em> permite automatizar tarefas repetitivas de forma legítima!</div>
            </div>
            <button type="button" class="hc-btn ghost sm" onclick="navTo('winHardware')">Comprar / Ver VPS →</button>
          </div>
        </div>

        <div class="eco-grid-2">${cronCards}</div>

        <div class="eco-card">
          <div class="eco-card-title">🏆 24 Marcos Sinérgicos do Ecossistema (${unlockedCount}/${ECOSYSTEM_MILESTONES.length} concluídos · +${this.getBonusSkillPoints()} SP Bônus)</div>
          <div class="eco-grid-2">${msCards}</div>
        </div>
      `;
    }

    renderUI(containerId = 'opsHubAppBody') {
      this.ensureLoaded();
      const el = typeof document !== 'undefined' ? document.getElementById(containerId) : null;
      if (!el) return;

      const ev = this.getCurrentGlobalEvent();
      let bodyHtml = '';
      if (this.activeTab === 'stocks') bodyHtml = this.renderStocksTab();
      else if (this.activeTab === 'minigames') bodyHtml = this.renderMinigamesTab();
      else if (this.activeTab === 'intel') bodyHtml = this.renderIntelTab();
      else if (this.activeTab === 'factions') bodyHtml = this.renderFactionsTab();
      else if (this.activeTab === 'elite' && window.topTenMechanics && typeof window.topTenMechanics.renderEliteAuctionAndOverviewTabHtml === 'function') {
        bodyHtml = window.topTenMechanics.renderEliteAuctionAndOverviewTabHtml();
      } else bodyHtml = this.renderAutomationTab();

      el.innerHTML = `
        <div class="eco-shell">
          <div class="eco-top-ticker">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span class="hc-badge ${ev.badge}">CLIMA DA REDE: ${esc(ev.title)}</span>
              <span style="font-size:12px;color:var(--hc-text-2);">${esc(ev.effectText)}</span>
            </div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <span class="hc-badge info">OSINT: ${this.state.osintDossiers}</span>
              <span class="hc-badge success">Catalisadores Lab: ${this.state.labCatalysts}</span>
              <span class="hc-badge warn">Cupons Lab: ${this.state.labDiscountCoupons}</span>
            </div>
          </div>

          <div class="eco-nav-tabs">
            <button type="button" id="ecoTab_stocks" class="eco-nav-btn ${this.activeTab === 'stocks' ? 'active' : ''}" onclick="window.ecosystemHub.switchTab('stocks')">📈 Bolsa de Empresas</button>
            <button type="button" id="ecoTab_minigames" class="eco-nav-btn ${this.activeTab === 'minigames' ? 'active' : ''}" onclick="window.ecosystemHub.switchTab('minigames')">🧩 6 Desafios Rápidos</button>
            <button type="button" id="ecoTab_intel" class="eco-nav-btn ${this.activeTab === 'intel' ? 'active' : ''}" onclick="window.ecosystemHub.switchTab('intel')">🕵️ Descobrir Senhas &amp; Seguro</button>
            <button type="button" id="ecoTab_factions" class="eco-nav-btn ${this.activeTab === 'factions' ? 'active' : ''}" onclick="window.ecosystemHub.switchTab('factions')">🎭 Facções &amp; Roubos 4x</button>
            <button type="button" id="ecoTab_automation" class="eco-nav-btn ${this.activeTab === 'automation' ? 'active' : ''}" onclick="window.ecosystemHub.switchTab('automation')">🤖 Tarefas Automáticas VPS</button>
            <button type="button" id="ecoTab_elite" class="eco-nav-btn ${this.activeTab === 'elite' ? 'active' : ''}" onclick="window.ecosystemHub.switchTab('elite')">🏆 Leilão 2h &amp; Atalhos</button>
          </div>

          ${bodyHtml}
        </div>
      `;
    }
  }

  window.ecosystemHub = new EcosystemInterconnectedHub();
})();
