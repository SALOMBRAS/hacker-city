/**
 * Hacker City // Bot Network & Traceback Engine (Full Web Port)
 * Módulos 1A, 1B, 2, 3 e 4:
 * - Catálogo determinístico de 210 Bots Hackers (70 Médio, 70 Alto, 70 Super Alto)
 * - Agendador Semanal (30 bots/dia, 10 de cada tier) e turnos horários
 * - Motor de Traceback Ativo & Bouncing Proxies (+12s/salto, Bypass -50%)
 * - IA Reativa de Bots (Auditoria de logs, retaliação por tier, cancelamento via rmlog)
 * - Central C2 de Botnet & Mineração Passiva Contínua (Fantasma, Overclock, DDoS Swarm)
 */

class PseudoRNG {
  constructor(seed = 0x48433231) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
  range(min, max) {
    return min + this.next() * (max - min);
  }
  rangeInt(min, max) {
    return Math.floor(this.range(min, max + 1));
  }
}

class BotNetworkRegistry {
  constructor(seed = 0x48433231) {
    this.rng = new PseudoRNG(seed);
    this.bots = [];
    this.botsById = new Map();
    this.botsByIp = new Map();
    this.botsByTier = { 1: [], 2: [], 3: [] };

    this.initCatalog();
  }

  initCatalog() {
    const handles = {
      1: ["NullPointer", "GlitchFox", "BitShifter", "SubNetRider", "HexDrifter", "PacketGhost", "ByteRunner", "ScriptKiddo", "EchoPulse", "VoltShadow"],
      2: ["CipherGhost", "DarkVector", "NeuroHacker", "ValkyrieSec", "QuantumWraith", "ZeroDay_X", "IronDaemon", "ShadowPhreak", "CoreBreaker", "NeonPhantom"],
      3: ["ApexOverlord", "ChronosProtocol", "LeviathanSec", "OdinCluster", "GhostInTheKernel", "NeuralDominion", "TitanPayload", "AbsoluteZero", "BlackHoleSec", "SolarisPrime"]
    };

    // 70 Bots Médios (Tier 1), 70 Altos (Tier 2), 70 Super Altos (Tier 3) = 210 Total
    for (let tier = 1; tier <= 3; tier++) {
      for (let i = 1; i <= 70; i++) {
        const tierPrefix = tier === 1 ? "med" : (tier === 2 ? "high" : "super");
        const id = `bot_${tierPrefix}_${String(i).padStart(2, '0')}`;
        const namePrefix = handles[tier][(i - 1) % handles[tier].length];
        const handle = `${namePrefix}_${String(i).padStart(2, '0')}`;
        const subnet = tier === 1 ? "110" : (tier === 2 ? "120" : "130");
        const ip = `10.${subnet}.${tier}.${10 + i}`;

        const hardware = {
          cpuCores: tier === 1 ? 4 : (tier === 2 ? 8 : 24),
          cpuClock: tier === 1 ? 2.8 : (tier === 2 ? 3.8 : 4.5),
          ramGb: tier === 1 ? 8 : (tier === 2 ? 32 : 128),
          storageGb: tier === 1 ? 800 : (tier === 2 ? 3500 : 12000),
          netMbps: tier === 1 ? 40 : (tier === 2 ? 200 : 1000)
        };

        const bankBalance = tier === 1 
          ? this.rng.rangeInt(250, 1500) 
          : (tier === 2 ? this.rng.rangeInt(5000, 25000) : this.rng.rangeInt(50000, 200000));

        const bot = {
          id,
          handle,
          tier,
          tierName: tier === 1 ? "Tier I Médio" : (tier === 2 ? "Tier II Alto" : "Tier III Super Alto"),
          ip,
          hardware,
          bankAccount: {
            accountNum: `HC-${tier === 1 ? 'MED' : (tier === 2 ? 'HIGH' : 'SUP')}-${String(i).padStart(4, '0')}`,
            password: `bot_pass_${this.rng.rangeInt(1000, 9999)}`,
            balance: bankBalance,
            bankIp: "10.40.10.5"
          },
          activeDay: (i - 1) % 7, // 0: Dom a 6: Sáb (exatamente 10 por dia por tier)
          activeShift: (i - 1) % 4, // 0: Madrugada, 1: Manhã, 2: Tarde, 3: Noite
          softwareList: [
            { name: "firewall", version: tier === 1 ? "2.0" : (tier === 2 ? "4.5" : "9.0") },
            { name: "hasher", version: tier === 1 ? "1.5" : (tier === 2 ? "3.2" : "8.0") },
            { name: "cracker", version: tier === 1 ? "1.0" : (tier === 2 ? "3.0" : "7.5") }
          ],
          vfsFiles: {
            "passwords.txt": `Credencial Admin: root / adm_bot#${i * 13}\nBanco: HC-${tier === 1 ? 'MED' : (tier === 2 ? 'HIGH' : 'SUP')}-${String(i).padStart(4, '0')}\n`,
            "notes.txt": `Operações sigilosas do cluster ${handle}. Não divulgar IP ${ip}.\n`,
            "intel.dat": `[CHAVE PRIVADA RSA 4096-BIT]\n${btoa(handle + '_' + ip).substring(0, 32)}\n`
          }
        };

        this.bots.push(bot);
        this.botsById.set(id, bot);
        this.botsByIp.set(ip, bot);
        this.botsByTier[tier].push(bot);
      }
    }
  }

  getBotByIp(ip) {
    return this.botsByIp.get(ip) || null;
  }

  getBotById(id) {
    return this.botsById.get(id) || null;
  }

  getAllBots() {
    return this.bots;
  }

  getBotsByTier(tier) {
    return this.botsByTier[tier] || [];
  }

  searchBots(query) {
    const q = query.toLowerCase().trim();
    return this.bots.filter(b => b.handle.toLowerCase().includes(q) || b.ip.includes(q));
  }
}

class BotScheduler {
  constructor(registry) {
    this.registry = registry;
  }

  getActiveBotsForDay(dayOfWeek) {
    return this.registry.bots.filter(b => b.activeDay === dayOfWeek);
  }

  getCurrentDayBots() {
    const day = new Date().getDay();
    return this.getActiveBotsForDay(day);
  }

  isBotOnline(botIp) {
    const bot = this.registry.getBotByIp(botIp);
    if (!bot) return false;
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const currentShift = Math.floor(hour / 6); // 0: 0-5, 1: 6-11, 2: 12-17, 3: 18-23

    return bot.activeDay === day && bot.activeShift === currentShift;
  }
}

class TracebackEngine {
  constructor() {
    this.active = false;
    this.targetBot = null;
    this.baseDuration = 75.0;
    this.totalDuration = 75.0;
    this.elapsedTime = 0.0;
    this.crackProgress = 0.0;
    this.crackDuration = 30.0;
    this.timer = null;

    // Rota de Saltos Proxies Intermediários (+12s por nó)
    this.availableProxies = ["10.40.1.12", "10.50.2.88", "10.60.3.45", "10.70.4.99"];
    this.activeProxies = ["10.40.1.12", "10.50.2.88"];

    this.onProgress = null;
    this.onCompromised = null;
    this.onSuccess = null;
    this.onTraced = null;
  }

  setTarget(bot) {
    this.targetBot = bot;
    const tier = bot ? bot.tier : 1;
    if (tier === 1) {
      this.baseDuration = 75.0;
      this.crackDuration = 26.0;
    } else if (tier === 2) {
      this.baseDuration = 42.0;
      this.crackDuration = 36.0;
    } else {
      this.baseDuration = 20.0; // Letal
      this.crackDuration = 45.0;
    }
    this.recalculateDuration();
  }

  setBouncingProxies(proxyList) {
    this.activeProxies = [...proxyList];
    this.recalculateDuration();
  }

  recalculateDuration() {
    this.totalDuration = this.baseDuration + (this.activeProxies.length * 12.0);
  }

  startAttack(onProgress, onCompromised, onSuccess, onTraced) {
    this.stop();
    this.active = true;
    this.elapsedTime = 0.0;
    this.crackProgress = 0.0;

    this.onProgress = onProgress;
    this.onCompromised = onCompromised;
    this.onSuccess = onSuccess;
    this.onTraced = onTraced;

    const step = 0.1;
    this.timer = setInterval(() => {
      if (!this.active) return;
      this.elapsedTime += step;
      this.crackProgress += (100.0 / this.crackDuration) * step;

      const tracePct = Math.min(100, (this.elapsedTime / this.totalDuration) * 100);
      const timeLeft = Math.max(0, this.totalDuration - this.elapsedTime);

      // Verificar nós proxies comprometidos
      const compromisedProxies = [];
      this.activeProxies.forEach((ip, idx) => {
        const threshold = ((idx + 1) / (this.activeProxies.length + 1)) * this.totalDuration;
        if (this.elapsedTime >= threshold) {
          compromisedProxies.push(ip);
        }
      });

      if (this.onProgress) {
        this.onProgress({
          tracePercent: tracePct,
          timeLeft: timeLeft,
          crackProgress: Math.min(100, this.crackProgress),
          compromisedProxies: compromisedProxies
        });
      }

      // Vitória do Cracker
      if (this.crackProgress >= 100) {
        this.stop();
        if (this.onSuccess) this.onSuccess(this.targetBot);
        return;
      }

      // Alvo rastreou o jogador (Trace 100%)
      if (this.elapsedTime >= this.totalDuration) {
        this.stop();
        if (this.onTraced) this.onTraced(this.targetBot);
        return;
      }
    }, 100);
  }

  executeBypass() {
    if (!this.active) return;
    const remainingCrack = 100.0 - this.crackProgress;
    this.crackProgress = Math.min(100.0, this.crackProgress + (remainingCrack * 0.5));
    // Alívio de 6 segundos no rastro
    this.elapsedTime = Math.max(0.0, this.elapsedTime - 6.0);
  }

  stop() {
    this.active = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

class BotAIService {
  constructor() {
    this.pendingAttacks = new Map(); // botIp -> AttackData
    this.syslogRegistry = new Map();  // botIp -> Array[Logs]
    this.isUnderDDoS = false;
    this.ddosTimeLeft = 0;
    this.ddosTimer = null;
  }

  registerIntrusion(botIp, playerIp = null) {
    const activeIp = playerIp || (window.networkIdentity ? window.networkIdentity.getPublicIp() : "142.87.13.9");
    const reg = window.botRegistry;
    const bot = reg ? reg.getBotByIp(botIp) : null;
    const tier = bot ? bot.tier : 1;

    // Gravar nos logs internos do bot
    if (!this.syslogRegistry.has(botIp)) {
      this.syslogRegistry.set(botIp, []);
    }
    this.syslogRegistry.get(botIp).push(`[${new Date().toLocaleTimeString()}] INTRUSION src=${activeIp} dest=${botIp} exploit=OK`);

    if (typeof window.addLocalLog === 'function') {
      window.addLocalLog('SSH/EXPLOIT', `Acesso root em ${bot ? bot.handle : 'Host'} [${botIp}] — seu IP (${activeIp}) ficou em /var/log/syslog`, 'warning');
    }

    let delaySec = 15;
    let attackType = "light_theft";

    if (tier === 1) {
      delaySec = 20; // Médio: 20s para demonstração interativa web (ou 3h simuladas)
      attackType = "light_theft";
    } else if (tier === 2) {
      delaySec = 10; // Alto: 10s (ou 15m)
      attackType = "bank_drain_and_vminer";
    } else {
      delaySec = 0; // Super Alto: imediato
      attackType = "ddos_and_ransomware";
    }

    const attackData = {
      botIp,
      botHandle: bot ? bot.handle : "Remoto",
      tier,
      attackType,
      delaySec,
      timeLeft: delaySec,
      loggedPlayerIp: activeIp
    };

    this.pendingAttacks.set(botIp, attackData);

    if (delaySec === 0) {
      this.executeCounterAttack(botIp);
    } else {
      this.startCountdown(botIp);
    }

    if (typeof window.renderLogsPage === 'function') window.renderLogsPage();
    return attackData;
  }

  startCountdown(botIp) {
    const att = this.pendingAttacks.get(botIp);
    if (!att) return;

    const interval = setInterval(() => {
      if (!this.pendingAttacks.has(botIp)) {
        clearInterval(interval);
        return;
      }
      att.timeLeft -= 1;
      if (typeof window.renderLogsPage === 'function' && window.winManager && window.winManager.current === 'winLogs') {
        window.renderLogsPage();
      }
      if (att.timeLeft <= 0) {
        clearInterval(interval);
        this.executeCounterAttack(botIp);
      }
    }, 1000);
  }

  wipeLogs(botIp) {
    let hadTrace = false;
    if (this.syslogRegistry.has(botIp) && this.syslogRegistry.get(botIp).length > 0) {
      this.syslogRegistry.set(botIp, []);
      hadTrace = true;
    }
    const hadPending = this.pendingAttacks.has(botIp);
    if (hadPending) {
      this.pendingAttacks.delete(botIp);
    }
    if ((hadTrace || hadPending) && typeof window.addLocalLog === 'function') {
      window.addLocalLog('RMLOG', `Rastro apagado em ${botIp}:/var/log/syslog${hadPending ? ' (contra-ataque abortado)' : ''}`, 'success');
    }
    if (typeof window.renderLogsPage === 'function') window.renderLogsPage();
    return hadPending;
  }

  executeCounterAttack(botIp) {
    const att = this.pendingAttacks.get(botIp);
    this.pendingAttacks.delete(botIp);

    const handle = att ? att.botHandle : "Bot Defensor";
    const currentIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : null;
    const syslogLines = this.syslogRegistry.get(botIp) || [];

    // Se o jogador trocou de IP no Provedor ISP (ou apagou/editou o IP do syslog), o contra-ataque perde a rota!
    if (att && att.loggedPlayerIp) {
      const stillInLog = syslogLines.some((l) => l.includes(att.loggedPlayerIp));
      if (!stillInLog) {
        if (typeof window.renderLogsPage === 'function') window.renderLogsPage();
        return;
      }
      if (currentIp && att.loggedPlayerIp !== currentIp) {
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('ISP-SHIELD', `${handle} [${botIp}] tentou retaliar seu IP antigo (${att.loggedPlayerIp}), mas seu novo IP (${currentIp}) escapou ileso!`, 'success');
        }
        if (typeof window.showToast === 'function') {
          window.showToast(`Contra-ataque de ${handle} despistado! Ele mirou no seu IP antigo (${att.loggedPlayerIp}).`);
        }
        if (typeof window.renderLogsPage === 'function') window.renderLogsPage();
        return;
      }
    }

    if (window.hackerAudio) window.hackerAudio.playInvasionAlert();

    const type = att ? att.attackType : "light_theft";

    if (type === "light_theft") {
      const stolen = 50;
      if (window.currentWallet) {
        window.currentWallet.balance = Math.max(0, parseFloat(window.currentWallet.balance) - stolen);
        if (typeof updateHudDisplays === 'function') updateHudDisplays();
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('INTRUSION-IN', `${handle} [${botIp}] rastreou seu IP pelos logs e drenou $ ${stolen}.00 HC`, 'danger');
      }
      alert(`[ALERTA DE INVASÃO]\nO bot defensor ${handle} [${botIp}] rastreou seus logs em /var/log/syslog e debitou $ ${stolen}.00 HC da sua conta!`);
    } else if (type === "bank_drain_and_vminer") {
      const stolen = 250;
      if (window.currentWallet) {
        window.currentWallet.balance = Math.max(0, parseFloat(window.currentWallet.balance) - stolen);
        if (typeof updateHudDisplays === 'function') updateHudDisplays();
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('INTRUSION-IN', `${handle} [${botIp}] drenou $ ${stolen}.00 HC e instalou trojan 'vminer'`, 'danger');
      }
      if (window.hackerAudio) window.hackerAudio.playMalwareInstalled();
      alert(`[INVASÃO CRÍTICA]\n${handle} [${botIp}] invadiu seu sistema, drenou $ ${stolen}.00 HC e instalou o trojan 'vminer' na sua CPU!`);
    } else {
      // DDoS Swarm
      this.startDDoS(12);
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('DDOS-ALERT', `${handle} [${botIp}] disparou ataque DDoS de 12s contra ${currentIp || 'seu gateway'}`, 'danger');
      }
      if (window.hackerAudio) window.hackerAudio.playDDoSAlert();
      alert(`[ATAQUE DEVASTADOR DDOS]\n${handle} [${botIp}] disparou um ataque maciço DDoS! Sua conexão de rede cairá por 12 segundos.`);
    }
    if (typeof window.renderLogsPage === 'function') window.renderLogsPage();
  }

  startDDoS(durationSec = 12) {
    this.isUnderDDoS = true;
    this.ddosTimeLeft = durationSec;

    const banner = document.getElementById('ddosGlobalBanner');
    if (banner) banner.style.display = 'block';

    if (this.ddosTimer) clearInterval(this.ddosTimer);
    this.ddosTimer = setInterval(() => {
      this.ddosTimeLeft -= 1;
      if (this.ddosTimeLeft <= 0) {
        clearInterval(this.ddosTimer);
        this.isUnderDDoS = false;
        if (banner) banner.style.display = 'none';
      }
    }, 1000);
  }
}

class BotnetC2Engine {
  constructor() {
    this.profile = "ghost"; // "ghost" (1.0x), "overclock" (3.5x), "ddos" (0.0x)
    this.multiplier = 1.0;
    this.accumulatedProfits = 0.0;
    this.slaves = [
      { ip: "10.110.1.18", handle: "NullPointer_08", tier: 1, baseRate: 0.35 },
      { ip: "10.120.2.24", handle: "CipherGhost_14", tier: 2, baseRate: 1.20 },
      { ip: "10.130.3.36", handle: "ValkyrieSec_26", tier: 3, baseRate: 3.50 }
    ];

    this.initTicker();
  }

  setProfile(mode) {
    if (mode === "ghost") {
      this.profile = "ghost";
      this.multiplier = 1.0;
    } else if (mode === "overclock") {
      this.profile = "overclock";
      this.multiplier = 3.5;
    } else if (mode === "ddos") {
      this.profile = "ddos";
      this.multiplier = 0.0;
    }
  }

  getBonusMultiplier() {
    let bonus = 1.0;
    if (window.currentProfile && window.currentProfile.specialty === 'botmaster') {
      bonus *= 1.30;
    }
    if (window.skillTreeEngine) {
      const rank = typeof window.skillTreeEngine.getRank === 'function' ? window.skillTreeEngine.getRank('botnet_boost') : 0;
      if (rank > 0) bonus *= (1 + rank * 0.15);
      if (window.skillTreeEngine.selectedSubclass === 'sub_botmaster') bonus *= 1.20;
    }
    return bonus;
  }

  getIncomeRate() {
    if (this.profile === "ddos") return 0.0;
    const baseTotal = this.slaves.reduce((acc, s) => acc + s.baseRate, 0);
    return baseTotal * this.multiplier * this.getBonusMultiplier();
  }

  addSlave(bot) {
    if (!bot) return;
    const exists = this.slaves.find(s => s.ip === bot.ip);
    if (!exists) {
      const rate = bot.tier === 1 ? 0.35 : (bot.tier === 2 ? 1.20 : 3.50);
      this.slaves.push({
        ip: bot.ip,
        handle: bot.handle,
        tier: bot.tier,
        baseRate: rate
      });
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('BOTNET-C2', `Zumbi ${bot.handle} [${bot.ip}] anexado ao enxame (+$ ${rate.toFixed(2)}/s base)`, 'info');
      }
      if (window.hackerAudio) window.hackerAudio.playMalwareInstalled();
    }
  }

  removeSlave(botIp) {
    this.slaves = this.slaves.filter(s => s.ip !== botIp);
  }

  collectProfits() {
    const amount = this.accumulatedProfits;
    if (amount <= 0) return 0;
    this.accumulatedProfits = 0.0;

    if (window.currentWallet) {
      window.currentWallet.balance = parseFloat(window.currentWallet.balance) + amount;
      if (typeof updateHudDisplays === 'function') updateHudDisplays();
    }
    if (typeof window.addLocalLog === 'function') {
      window.addLocalLog('BOTNET-PAYOUT', `Rendimentos de mineração coletados: +$ ${amount.toFixed(2)} HC`, 'success');
    }

    if (window.hackerAudio) window.hackerAudio.playMoneyCollect();
    return amount;
  }

  initTicker() {
    setInterval(() => {
      const rate = this.getIncomeRate();
      this.accumulatedProfits += rate * 0.5;

      const earnedEl = document.getElementById('c2EarnedLive');
      if (earnedEl) {
        earnedEl.innerText = `$ ${this.accumulatedProfits.toFixed(2)} HC`;
      }
    }, 500);
  }
}

// =========================================================================
// RENDERERS DE INTERFACE GRÁFICA DO DESKTOP (CRACKER & BOTNET C2)
// =========================================================================

function renderCrackerUI(containerId = 'crackerAppBody', initialTargetIp = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const dayBots = window.botScheduler.getCurrentDayBots();
  const selectedIp = initialTargetIp || (dayBots.length > 0 ? dayBots[0].ip : "10.110.1.11");
  const selectedBot = window.botRegistry.getBotByIp(selectedIp) || dayBots[0];
  window.traceEngine.setTarget(selectedBot);

  let optionsHtml = '';
  dayBots.forEach(b => {
    const isSel = b.ip === selectedIp ? 'selected' : '';
    optionsHtml += `<option value="${b.ip}" ${isSel}>${b.handle} [${b.ip}] — ${b.tierName}</option>`;
  });

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <!-- Seletor de Alvo e Rota de Saltos -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label style="font-size: 0.76rem; color: #aab3c0; font-weight: bold; display: block; margin-bottom: 4px;">BOT HACKER ALVO (210 DETERMINÍSTICOS):</label>
          <select id="crackerTargetSelect" class="form-input" style="padding: 0.4rem; font-size: 0.8rem;" onchange="onCrackerTargetChanged(this.value)">
            ${optionsHtml}
          </select>
        </div>
        <div>
          <label style="font-size: 0.76rem; color: #aab3c0; font-weight: bold; display: block; margin-bottom: 4px;">NÓS DE SALTO (BOUNCING PROXIES +12s CADA):</label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
            <label style="font-size: 0.75rem; color: #eceff3; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;">
              <input type="checkbox" id="chkProxy1" checked onchange="updateCrackerProxies()"> Salto 1 (+12s)
            </label>
            <label style="font-size: 0.75rem; color: #eceff3; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;">
              <input type="checkbox" id="chkProxy2" checked onchange="updateCrackerProxies()"> Salto 2 (+12s)
            </label>
            <label style="font-size: 0.75rem; color: #eceff3; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;">
              <input type="checkbox" id="chkProxy3" onchange="updateCrackerProxies()"> Salto 3 (+12s)
            </label>
            <label style="font-size: 0.75rem; color: #eceff3; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;">
              <input type="checkbox" id="chkProxy4" onchange="updateCrackerProxies()"> Salto 4 (+12s)
            </label>
          </div>
        </div>
      </div>

      <!-- Traceback HUD Bar -->
      <div id="crackerTraceHud" class="trace-hud-container">
        <div class="trace-hud-header">
          <span id="crackerTraceTitle" style="color: var(--cyan-neon); font-weight: bold;">CONTRA-RASTREAMENTO DEFENSIVO: <span id="crackerTracePct">0.0%</span></span>
          <span id="crackerTimeLeft" style="color: var(--cyan-neon); font-family: monospace;">TEMPO: ${window.traceEngine.totalDuration.toFixed(1)}s</span>
        </div>
        <div class="trace-meter-bg">
          <div id="crackerTraceMeterFill" class="trace-meter-fill"></div>
        </div>

        <!-- Visual Route Strip -->
        <div class="proxy-nodes-strip" id="crackerProxyStrip">
          <!-- Injetado dinamicamente -->
        </div>
      </div>

      <!-- Cracker Progress Bar -->
      <div style="background: #1b2027; border: 1px solid #262c35; border-radius: 8px; padding: 1rem;">
        <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.4rem; font-family: var(--hc-font-mono);">
          <span style="color: #fff; font-weight: bold;">DESCRIPTOGRAFIA DO ALVO:</span>
          <span id="crackerProgressPct" style="color: var(--green-safe); font-weight: bold;">0%</span>
        </div>
        <div style="height: 12px; background: #111418; border-radius: 9999px; overflow: hidden; border: 1px solid #262c35;">
          <div id="crackerProgressFill" style="height: 100%; width: 0%; background: linear-gradient(90deg, #35b877, #34d399); transition: width 0.1s linear;"></div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button id="btnCrackerStart" class="btn-submit" style="flex: 1; margin: 0; padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="startCrackerAttack()">
          ▶ INICIAR ATAQUE COM TRACEBACK
        </button>
        <button id="btnCrackerBypass" class="btn-submit btn-bypass-challenge" style="flex: 1; margin: 0; padding: 0.5rem 1rem; font-size: 0.85rem; opacity: 0.4; cursor: not-allowed;" disabled onclick="executeCrackerBypass()">
          BYPASS DE PACOTE (-50%)
        </button>
        <button class="btn-submit" style="width: auto; background: #353c47; border-color: #353c47; margin: 0; padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="abortCrackerAttack()">
          ⏹ PARAR
        </button>
      </div>

      <!-- Resultado / Alerta -->
      <div id="crackerResultBox" style="display: none; padding: 1rem; border-radius: 6px; font-size: 0.82rem; line-height: 1.4;">
      </div>
    </div>
  `;

  renderCrackerProxyStrip();
}

function renderCrackerProxyStrip() {
  const container = document.getElementById('crackerProxyStrip');
  if (!container) return;
  container.innerHTML = '';

  const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '142.87.13.9';
  const originPill = document.createElement('div');
  originPill.className = 'proxy-node-pill active';
  originPill.innerHTML = `<span>Você [${myIp}]</span>`;
  container.appendChild(originPill);

  window.traceEngine.activeProxies.forEach((ip, idx) => {
    const pill = document.createElement('div');
    pill.id = `proxy_pill_${idx}`;
    pill.className = 'proxy-node-pill active';
    pill.innerHTML = `<span>Salto ${idx + 1}: ${ip}</span>`;
    container.appendChild(pill);
  });

  const target = window.traceEngine.targetBot;
  const targetPill = document.createElement('div');
  targetPill.className = 'proxy-node-pill';
  targetPill.innerHTML = `<span>${target ? target.handle : 'Alvo'} [${target ? target.ip : '0.0.0.0'}]</span>`;
  container.appendChild(targetPill);
}

function onCrackerTargetChanged(ip) {
  const bot = window.botRegistry.getBotByIp(ip);
  if (bot) {
    window.traceEngine.setTarget(bot);
    document.getElementById('crackerTimeLeft').innerText = `TEMPO: ${window.traceEngine.totalDuration.toFixed(1)}s`;
    renderCrackerProxyStrip();
  }
}

function updateCrackerProxies() {
  const selected = [];
  const pIps = window.traceEngine.availableProxies;
  if (document.getElementById('chkProxy1')?.checked) selected.push(pIps[0]);
  if (document.getElementById('chkProxy2')?.checked) selected.push(pIps[1]);
  if (document.getElementById('chkProxy3')?.checked) selected.push(pIps[2]);
  if (document.getElementById('chkProxy4')?.checked) selected.push(pIps[3]);

  window.traceEngine.setBouncingProxies(selected);
  const timeEl = document.getElementById('crackerTimeLeft');
  if (timeEl) timeEl.innerText = `TEMPO: ${window.traceEngine.totalDuration.toFixed(1)}s`;
  renderCrackerProxyStrip();
}

function startCrackerAttack() {
  const btnStart = document.getElementById('btnCrackerStart');
  const btnBypass = document.getElementById('btnCrackerBypass');
  const resultBox = document.getElementById('crackerResultBox');
  if (resultBox) resultBox.style.display = 'none';

  btnStart.disabled = true;
  btnStart.style.opacity = '0.5';
  btnBypass.disabled = false;
  btnBypass.style.opacity = '1';
  btnBypass.style.cursor = 'pointer';

  const traceHud = document.getElementById('crackerTraceHud');
  const traceMeter = document.getElementById('crackerTraceMeterFill');
  const tracePctEl = document.getElementById('crackerTracePct');
  const timeLeftEl = document.getElementById('crackerTimeLeft');
  const crackPctEl = document.getElementById('crackerProgressPct');
  const crackFill = document.getElementById('crackerProgressFill');

  window.traceEngine.startAttack(
    // Progresso
    (data) => {
      if (window.hackerAudio) window.hackerAudio.playKeyClick();
      traceMeter.style.width = data.tracePercent + '%';
      tracePctEl.innerText = data.tracePercent.toFixed(1) + '%';
      timeLeftEl.innerText = `TEMPO: ${data.timeLeft.toFixed(1)}s`;

      crackPctEl.innerText = Math.floor(data.crackProgress) + '%';
      crackFill.style.width = data.crackProgress + '%';

      // Alerta de cor no Traceback HUD
      if (data.tracePercent >= 75) {
        traceHud.className = 'trace-hud-container danger-alert';
        traceMeter.style.backgroundColor = '#d0443a';
        if (window.hackerAudio && Math.random() < 0.25) window.hackerAudio.playInvasionAlert();
      } else if (data.tracePercent >= 50) {
        traceHud.className = 'trace-hud-container';
        traceMeter.style.backgroundColor = '#f0a03a';
      } else {
        traceHud.className = 'trace-hud-container';
        traceMeter.style.backgroundColor = '#22d3ee';
      }

      // Atualizar nós comprometidos na strip
      window.traceEngine.activeProxies.forEach((ip, idx) => {
        const pill = document.getElementById(`proxy_pill_${idx}`);
        if (pill) {
          if (data.compromisedProxies.includes(ip)) {
            pill.className = 'proxy-node-pill compromised';
            pill.innerHTML = `<span>Salto ${idx + 1}: ${ip}</span>`;
          } else {
            pill.className = 'proxy-node-pill active';
            pill.innerHTML = `<span>Salto ${idx + 1}: ${ip}</span>`;
          }
        }
      });
    },
    // Compromissado
    () => {},
    // Vitória (Sucesso)
    (bot) => {
      btnStart.disabled = false;
      btnStart.style.opacity = '1';
      btnBypass.disabled = true;
      btnBypass.style.opacity = '0.4';
      if (window.hackerAudio) window.hackerAudio.playMoneyCollect();

      // Gravar invasão na IA do bot (para auditoria) + salvar no Hacked Database
      window.botAI.registerIntrusion(bot.ip);
      if (window.hackedDb && window.internetEngine) {
        const hostMeta = window.internetEngine.resolveHost(bot.ip);
        window.hackedDb.upsertHost({
          ip: bot.ip,
          hostname: hostMeta.hostname || bot.handle,
          kind: 'bot',
          tier: bot.tier,
          accessMethod: 'password',
          password: hostMeta.rootPassword || 'root1337',
          cpuSpec: `${bot.hardware.cpuCores}c @ ${bot.hardware.cpuClock}GHz`
        });
      }

      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.style.background = '#064e3b';
        resultBox.style.border = '1px solid #35b877';
        resultBox.style.color = '#d1fae5';
        resultBox.innerHTML = `
          <div style="font-weight: bold; font-size: 0.95rem; margin-bottom: 0.35rem;">SUCESSO: FIREWALL E HASHES DECIFRADOS!</div>
          <div>Acesso root obtido na máquina de <strong>${bot.handle}</strong> [${bot.ip}] e salvo no <strong>Hacked Database</strong>!</div>
          <div style="color: #f5bd6b; font-size: 0.75rem; margin: 0.5rem 0;">ATENÇÃO: Seu IP público foi registrado em /var/log/syslog! Apague os logs ou troque seu IP no Provedor ISP antes que a IA retalie!</div>
          <div style="display: flex; gap: 8px; margin-top: 0.5rem; flex-wrap: wrap;">
            <button class="btn-submit" style="width: auto; margin: 0; padding: 0.35rem 0.75rem; font-size: 0.75rem;" onclick="enslaveBotToC2('${bot.ip}')">Escravizar na Botnet C2</button>
            <button class="btn-submit" style="width: auto; margin: 0; padding: 0.35rem 0.75rem; font-size: 0.75rem; background: #12814f;" onclick="drainBotBank('${bot.ip}')">Drenar Saldo ($ ${bot.bankAccount.balance} HC)</button>
            <button class="btn-submit" style="width: auto; margin: 0; padding: 0.35rem 0.75rem; font-size: 0.75rem; background: #d0443a;" onclick="wipeBotLogsViaBtn('${bot.ip}')">Apagar Logs Agora</button>
            <button class="btn-submit" style="width: auto; margin: 0; padding: 0.35rem 0.75rem; font-size: 0.75rem; background: #262c35; border-color: #3a4350;" onclick="window.internetEngine.quickSshConnect('${bot.ip}')">Abrir SSH na Internet</button>
          </div>
        `;
      }
    },
    // Derrota (Rastreado a 100%)
    (bot) => {
      btnStart.disabled = false;
      btnStart.style.opacity = '1';
      btnBypass.disabled = true;
      btnBypass.style.opacity = '0.4';
      if (window.hackerAudio) window.hackerAudio.playInvasionAlert();

      // Disparar retaliação da IA
      window.botAI.executeCounterAttack(bot.ip);

      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.style.background = '#450a0a';
        resultBox.style.border = '1px solid #d0443a';
        resultBox.style.color = '#f79a91';
        resultBox.innerHTML = `
          <div style="font-weight: bold; font-size: 0.95rem; margin-bottom: 0.35rem;">ALERTA: CONTRA-RASTREAMENTO ATINGIU 100%!</div>
          <div>O bot defensor <strong>${bot.handle}</strong> rastreou seu IP e iniciou protocolo de contra-ataque cibernético. A sessão foi abortada por segurança.</div>
        `;
      }
    }
  );
}

function executeCrackerBypass() {
  window.traceEngine.executeBypass();
  if (window.hackerAudio) window.hackerAudio.playKeyClick();
}

function abortCrackerAttack() {
  window.traceEngine.stop();
  const btnStart = document.getElementById('btnCrackerStart');
  const btnBypass = document.getElementById('btnCrackerBypass');
  if (btnStart) { btnStart.disabled = false; btnStart.style.opacity = '1'; }
  if (btnBypass) { btnBypass.disabled = true; btnBypass.style.opacity = '0.4'; }
}

function enslaveBotToC2(ip) {
  const bot = window.botRegistry.getBotByIp(ip);
  if (bot) {
    window.botnetC2.addSlave(bot);
    alert(`Nó ${bot.handle} [${ip}] escravizado com sucesso na Botnet C2!`);
    renderC2UI();
  }
}

function drainBotBank(ip) {
  const bot = window.botRegistry.getBotByIp(ip);
  if (bot && bot.bankAccount) {
    const loot = bot.bankAccount.balance;
    bot.bankAccount.balance = 0;
    if (window.currentWallet) {
      window.currentWallet.balance = parseFloat(window.currentWallet.balance) + loot;
      if (typeof updateHudDisplays === 'function') updateHudDisplays();
    }
    if (typeof window.addLocalLog === 'function') {
      window.addLocalLog('BANK-WIRE', `Saldo drenado de ${bot.handle} [${ip}]: +$ ${loot}.00 HC`, 'success');
    }
    if (window.hackerAudio) window.hackerAudio.playMoneyCollect();
    alert(`Transação wire concluída! Drenado $ ${loot}.00 HC da conta de ${bot.handle}.`);
  }
}

function wipeBotLogsViaBtn(ip) {
  const ok = window.botAI.wipeLogs(ip);
  alert(`Logs em ${ip} expurgados com sucesso! Qualquer contra-ataque pendente foi abortado.`);
}

// =========================================================================
// RENDERER DA CENTRAL C2 (BOTNET MATRIX)
// =========================================================================

function renderC2UI(containerId = 'botnetC2Body') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const c2 = window.botnetC2;
  const rate = c2.getIncomeRate();
  const prof = c2.profile;
  const bonusMult = c2.getBonusMultiplier();

  let slavesRows = '';
  if (c2.slaves.length === 0) {
    slavesRows = `<div style="padding: 1rem; color: #838d9b; font-size: 0.8rem; text-align: center;">Nenhum nó escravizado. Use o Cracker para infectar alvos.</div>`;
  } else {
    c2.slaves.forEach((s, idx) => {
      const tierBadge = s.tier === 1 
        ? '<span style="background: rgba(34, 211, 238, 0.15); color: #22d3ee; padding: 2px 6px; border-radius: 4px; font-size: 0.72rem;">Tier I</span>'
        : (s.tier === 2 
          ? '<span style="background: rgba(240, 160, 58, 0.15); color: #f0a03a; padding: 2px 6px; border-radius: 4px; font-size: 0.72rem;">Tier II</span>'
          : '<span style="background: rgba(208, 68, 58, 0.15); color: #d0443a; padding: 2px 6px; border-radius: 4px; font-size: 0.72rem;">Tier III</span>');

      const liveRate = (s.baseRate * c2.multiplier * bonusMult).toFixed(2);

      slavesRows += `
        <div class="c2-slave-item">
          <div>
            <strong>${s.handle}</strong> [${s.ip}] ${tierBadge}
          </div>
          <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
            <span style="color: var(--green-safe); white-space: nowrap; font-family: var(--hc-font-mono); font-size: 0.8rem;">+$ ${liveRate} HC/s</span>
            <button class="btn-submit" style="width: auto; margin: 0; padding: 0.25rem 0.65rem; font-size: 0.72rem; background: #d0443a; border-color: #d0443a;" onclick="releaseC2Slave('${s.ip}')">Liberar</button>
          </div>
        </div>
      `;
    });
  }

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <!-- Stats Cards Topo -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px;">
        <div style="background: #1b2027; border: 1px solid #262c35; border-radius: 6px; padding: 0.75rem;">
          <div style="font-size: 0.72rem; color: #aab3c0;">ZUMBIS ATIVOS</div>
          <div style="font-size: 1.25rem; font-weight: bold; color: var(--cyan-neon);">${c2.slaves.length} Nós</div>
        </div>
        <div style="background: #1b2027; border: 1px solid #262c35; border-radius: 6px; padding: 0.75rem;">
          <div style="font-size: 0.72rem; color: #aab3c0;">TAXA DE MINERAÇÃO</div>
          <div style="font-size: 1.25rem; font-weight: bold; color: var(--green-safe);">$ ${rate.toFixed(2)} HC/s</div>
        </div>
        <div style="background: #1b2027; border: 1px solid #262c35; border-radius: 6px; padding: 0.75rem;">
          <div style="font-size: 0.72rem; color: #aab3c0;">LUCRO ACUMULADO</div>
          <div id="c2EarnedLive" style="font-size: 1.25rem; font-weight: bold; color: var(--amber-warn);">$ ${c2.accumulatedProfits.toFixed(2)} HC</div>
        </div>
      </div>

      <!-- Perfis de Operação Global -->
      <div>
        <label style="font-size: 0.76rem; color: #aab3c0; font-weight: bold; display: block; margin-bottom: 6px;">PERFIL DE OPERAÇÃO GLOBAL DO ENXAME:</label>
        <div class="c2-profile-grid">
          <div class="c2-profile-card ${prof === 'ghost' ? 'active-ghost' : ''}" onclick="selectC2Profile('ghost')">
            <div style="font-weight: bold; color: var(--cyan-neon); font-size: 0.85rem; margin-bottom: 2px;">Modo Fantasma</div>
            <div style="font-size: 0.72rem; color: #aab3c0;">15% CPU. Mineração contínua e oculta (1.0x). Risco quase zero.</div>
          </div>
          <div class="c2-profile-card ${prof === 'overclock' ? 'active-overclock' : ''}" onclick="selectC2Profile('overclock')">
            <div style="font-weight: bold; color: var(--amber-warn); font-size: 0.85rem; margin-bottom: 2px;">Modo Overclock</div>
            <div style="font-size: 0.72rem; color: #aab3c0;">85% CPU. Renda máxima (3.5x). Risco elevado de alarme no alvo.</div>
          </div>
          <div class="c2-profile-card ${prof === 'ddos' ? 'active-ddos' : ''}" onclick="selectC2Profile('ddos')">
            <div style="font-weight: bold; color: #d0443a; font-size: 0.85rem; margin-bottom: 2px;">Modo DDoS Swarm</div>
            <div style="font-size: 0.72rem; color: #aab3c0;">100% da banda. Mineração pausada p/ concentrar bombardeio.</div>
          </div>
        </div>
      </div>

      <!-- Tabela de Escravos -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 0.76rem; color: #aab3c0; font-weight: bold;">MÁQUINAS ZUMBIS INFECTADAS:</span>
          <button class="btn-submit" style="width: auto; margin: 0; padding: 0.3rem 0.8rem; font-size: 0.75rem;" onclick="infectNewRandomSlave()">Infectar nó de amostra</button>
        </div>
        <div class="c2-slave-list">
          ${slavesRows}
        </div>
      </div>

      <!-- Botão de Coleta -->
      <button class="btn-submit" style="margin: 0; padding: 0.6rem; font-size: 0.9rem; background: #059669; border-color: #35b877;" onclick="collectC2Profits()">
        COLETAR RENDIMENTOS DA MINERAÇÃO
      </button>
    </div>
  `;
}

function selectC2Profile(mode) {
  window.botnetC2.setProfile(mode);
  renderC2UI();
}

function releaseC2Slave(ip) {
  window.botnetC2.removeSlave(ip);
  renderC2UI();
}

function infectNewRandomSlave() {
  const bots = window.botRegistry.getAllBots();
  const randomBot = bots[Math.floor(Math.random() * bots.length)];
  window.botnetC2.addSlave(randomBot);
  renderC2UI();
}

function collectC2Profits() {
  const amount = window.botnetC2.collectProfits();
  if (amount > 0) {
    alert(`Coleta realizada! Creditado $ ${amount.toFixed(2)} HC na sua carteira.`);
    renderC2UI();
  } else {
    alert('Nenhum rendimento pendente para resgatar no momento.');
  }
}

// Inicialização Global
window.botRegistry = new BotNetworkRegistry();
window.botScheduler = new BotScheduler(window.botRegistry);
window.traceEngine = new TracebackEngine();
window.botAI = new BotAIService();
window.botnetC2 = new BotnetC2Engine();

window.renderCrackerUI = renderCrackerUI;
window.renderC2UI = renderC2UI;

