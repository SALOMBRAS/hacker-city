/**
 * Hacker City // Catálogo de Hardware, VPS Multi-Máquinas, Potencial Total, Consumo (W) & Gasto ($/dia)
 * Suporta PC Principal + Múltiplas VPS/Servidores com visão consolidada (Potencial Total) e individual por máquina.
 */
const HARDWARE_CATALOG = {
  cpu: [
    { id: 'celeron_800', name: 'Intel Celeron 800MHz (Sucata)', mhz: 800, watts: 55, dailyCost: 7, price: 0, cooldown_ms: 4000, desc: '800 MHz · Consumo 55W · Processador básico inicial.' },
    { id: 'pentium_4', name: 'Intel Pentium 4 2.0GHz', mhz: 2000, watts: 85, dailyCost: 11, price: 950, cooldown_ms: 3200, desc: '2.000 MHz · Consumo 85W · Acelera compilação, quebra e processos.' },
    { id: 'core_2_quad', name: 'Intel Core 2 Quad 4.0GHz', mhz: 4000, watts: 125, dailyCost: 16, price: 3400, cooldown_ms: 2400, desc: '4.000 MHz · Consumo 125W · 4 núcleos reais para operações pesadas.' },
    { id: 'xeon_server', name: 'Dual Xeon E5 Rack 8.0GHz', mhz: 8000, watts: 210, dailyCost: 27, price: 12500, cooldown_ms: 1600, desc: '8.000 MHz · Consumo 210W · Servidor empresarial de alta densidade.' },
    { id: 'quantum_core', name: 'Quantum Core QX-99 (16.0GHz)', mhz: 16000, watts: 340, dailyCost: 44, price: 42000, cooldown_ms: 1000, desc: '16.000 MHz · Consumo 340W · Topo absoluto de processamento.' }
  ],
  ram: [
    { id: 'ram_256mb', name: '256 MB SDRAM PC133', ramMb: 256, watts: 6, dailyCost: 1, price: 0, desc: '256 MB · Consumo 6W · Memória inicial para programas básicos.' },
    { id: 'ram_1gb', name: '1.024 MB (1 GB) DDR', ramMb: 1024, watts: 10, dailyCost: 2, price: 850, desc: '1.024 MB · Consumo 10W · Espaço para rodar Cracker, Firewall e AV juntos.' },
    { id: 'ram_4gb', name: '4.096 MB (4 GB) Dual Channel', ramMb: 4096, watts: 16, dailyCost: 3, price: 3200, desc: '4.096 MB · Consumo 16W · Suporta utilitários pesquisados até v5.0+.' },
    { id: 'ram_16gb', name: '16.384 MB (16 GB) DDR4', ramMb: 16384, watts: 26, dailyCost: 5, price: 11000, desc: '16.384 MB · Consumo 26W · Folga ampla para suíte completa de alta potência.' },
    { id: 'ram_64gb', name: '65.536 MB (64 GB) ECC Server', ramMb: 65536, watts: 42, dailyCost: 9, price: 36000, desc: '65.536 MB · Consumo 42W · Memória registrada de servidor enterprise.' }
  ],
  hdd: [
    { id: 'hdd_350mb', name: 'HD IDE 350 MB (Sucata)', hddMb: 350, watts: 9, dailyCost: 2, price: 0, desc: '350 MB · Consumo 9W · Disco mecânico inicial.' },
    { id: 'hdd_1gb', name: 'HD SATA 1.024 MB (1 GB)', hddMb: 1024, watts: 12, dailyCost: 3, price: 750, desc: '1.024 MB · Consumo 12W · Permite guardar softwares e hashes de média potência.' },
    { id: 'hdd_4gb', name: 'SSD 4.096 MB (4 GB)', hddMb: 4096, watts: 8, dailyCost: 4, price: 2800, desc: '4.096 MB · Consumo 8W (SSD econômico) · Leitura veloz de hashes.' },
    { id: 'hdd_16gb', name: 'NVMe M.2 16.384 MB (16 GB)', hddMb: 16384, watts: 14, dailyCost: 7, price: 9800, desc: '16.384 MB · Consumo 14W · Capacidade industrial NVMe.' },
    { id: 'hdd_64gb', name: 'RAID Storage 65.536 MB (64 GB)', hddMb: 65536, watts: 38, dailyCost: 14, price: 32000, desc: '65.536 MB · Consumo 38W · Cofre massivo para versões máximas v10.0.' }
  ],
  network: [
    { id: 'net_56k', code: 'NET1', provider: 'HC Rádio Comunitária', name: 'NET1 · HC Rádio Comunitária', mbps: 1, watts: 5, price: 0, monthlyFee: 35, dailyCost: 1, desc: '1 Mbit (~0.12 MB/s) · Instalação Grátis · Mensalidade $35/mês (HC Rádio Comunitária).' },
    { id: 'net_2m', code: 'NET2', provider: 'VeloxNet Discada+', name: 'NET2 · VeloxNet Discada+', mbps: 2, watts: 6, price: 50, monthlyFee: 55, dailyCost: 2, desc: '2 Mbit (~0.25 MB/s) · Instalação $50 · Mensalidade $55/mês (VeloxNet Discada+).' },
    { id: 'net_4m', code: 'NET4', provider: 'CaboSul Residencial', name: 'NET4 · CaboSul Residencial', mbps: 4, watts: 7, price: 99, monthlyFee: 85, dailyCost: 3, desc: '4 Mbit (~0.5 MB/s) · Instalação $99 · Mensalidade $85/mês (CaboSul Residencial).' },
    { id: 'net_fast_10', code: 'MEGA10', provider: 'BrCabo Banda Larga', name: 'MEGA10 · BrCabo Banda Larga', mbps: 10, watts: 8, price: 250, monthlyFee: 140, dailyCost: 5, desc: '10 Mbit (~1.25 MB/s) · Instalação $250 · Mensalidade $140/mês (BrCabo Banda Larga).' },
    { id: 'net_25m', code: 'MEGA25', provider: 'Vortex Telecom VDSL', name: 'MEGA25 · Vortex Telecom VDSL', mbps: 25, watts: 10, price: 1000, monthlyFee: 260, dailyCost: 9, desc: '25 Mbit (~3.1 MB/s) · Instalação $1.000 · Mensalidade $260/mês (Vortex Telecom VDSL).' },
    { id: 'net_50m', code: 'MEGA50', provider: 'HyperLink Fibra Casa', name: 'MEGA50 · HyperLink Fibra Casa', mbps: 50, watts: 11, price: 2500, monthlyFee: 450, dailyCost: 15, desc: '50 Mbit (~6.2 MB/s) · Instalação $2.500 · Mensalidade $450/mês (HyperLink Fibra Casa).' },
    { id: 'net_fast_100', code: 'BROAD100', provider: 'NovaFibra Óptica Pro', name: 'BROAD100 · NovaFibra Óptica Pro', mbps: 100, watts: 12, price: 10000, monthlyFee: 890, dailyCost: 30, desc: '100 Mbit (~12.5 MB/s) · Instalação $10.000 · Mensalidade $890/mês (NovaFibra Óptica Pro).' },
    { id: 'net_250m', code: 'BROAD250', provider: 'PrimeNet Empresarial', name: 'BROAD250 · PrimeNet Empresarial', mbps: 250, watts: 15, price: 25000, monthlyFee: 1750, dailyCost: 58, desc: '250 Mbit (~31 MB/s) · Instalação $25.000 · Mensalidade $1.750/mês (PrimeNet Empresarial).' },
    { id: 'net_gigabit', code: 'ULTRA500', provider: 'CoreBackbone Dedicado', name: 'ULTRA500 · CoreBackbone Dedicado', mbps: 500, watts: 18, price: 50000, monthlyFee: 3400, dailyCost: 113, desc: '500 Mbit (~62 MB/s) · Instalação $50.000 · Mensalidade $3.400/mês (CoreBackbone Dedicado).' },
    { id: 'net_fiber_10g', code: 'ULTRA1000', provider: 'QuantumIX Tier-1 Gigabit', name: 'ULTRA1000 · QuantumIX Tier-1 Gigabit', mbps: 1000, watts: 25, price: 100000, monthlyFee: 6800, dailyCost: 227, desc: '1.000 Mbit (~125 MB/s) · Instalação $100.000 · Mensalidade $6.800/mês (QuantumIX Tier-1 Gigabit).' }
  ]
};

class HardwareEngine {
  constructor() {
    this.catalog = HARDWARE_CATALOG;
    this.userId = null;
    this.activeTab = 'overview';       // 'overview' | 'upgrade' | 'buy_vps' | 'network' | 'xhd'
    this.selectedScope = 'all';        // 'all' (Potencial Total) | 'pc_main' | 'srv_...'
    this.upgradeTargetId = 'pc_main';  // Máquina selecionada na aba Melhorar Máquina / Internet
    this.upgradePartCat = 'cpu';       // 'cpu' | 'hdd' | 'ram'
    this.current = this.loadRig();
  }

  storageKey(uidOverride = null) {
    const uid = uidOverride || (window.currentProfile && window.currentProfile.id) || null;
    return uid ? `HC_HARDWARE_RIG_${uid}` : 'HC_HARDWARE_RIG';
  }

  ensureForProfile(uidOverride = null) {
    const uid = uidOverride || (window.currentProfile && window.currentProfile.id) || 'guest';
    if (this.userId === uid && this.current) return this.current;
    this.userId = uid;
    this.current = this.loadRig(uid);
    return this.current;
  }

  loadRig(uidOverride = null) {
    const defaults = {
      cpu: 'celeron_800',
      ram: 'ram_256mb',
      hdd: 'hdd_350mb',
      network: 'net_56k',
      healthPct: 100,
      lastDdosBy: null
    };
    try {
      const key = this.storageKey(uidOverride);
      const saved = localStorage.getItem(key) || (!uidOverride ? localStorage.getItem('HC_HARDWARE_RIG') : null);
      if (saved) {
        const parsed = { ...defaults, ...JSON.parse(saved) };
        parsed.healthPct = Math.max(15, Math.min(100, Math.round(Number(parsed.healthPct ?? 100))));
        return parsed;
      }
    } catch (e) {}
    return defaults;
  }

  saveRig(rig) {
    this.ensureForProfile();
    this.current = { ...this.current, ...rig };
    this.current.healthPct = Math.max(15, Math.min(100, Math.round(Number(this.current.healthPct ?? 100))));
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(this.current));
    } catch (e) {}
    if (window.lanServersEngine && typeof window.lanServersEngine.ensureSyncedWithProfile === 'function') {
      window.lanServersEngine.ensureSyncedWithProfile();
    }
  }

  getHealthPct() {
    this.ensureForProfile();
    return Math.max(15, Math.min(100, Math.round(Number(this.current.healthPct ?? 100))));
  }

  getHealthMultiplier() {
    return +(Math.max(0.25, this.getHealthPct() / 100)).toFixed(2);
  }

  getEffectiveCpuMhz() {
    return Math.max(200, Math.round(this.getCpu().mhz * this.getHealthMultiplier()));
  }

  getEffectiveNetMbps() {
    const safehouseMult = (window.topTenMechanics && typeof window.topTenMechanics.getSafehouseNetMultiplier === 'function')
      ? window.topTenMechanics.getSafehouseNetMultiplier()
      : 1.0;
    return Math.max(0.5, +(this.getNetwork().mbps * this.getHealthMultiplier() * safehouseMult).toFixed(1));
  }

  getRepairCost() {
    const health = this.getHealthPct();
    if (health >= 100) return 0;
    const missing = 100 - health;
    const hwValue = (this.getCpu().price || 0) + (this.getRam().price || 0) + (this.getHdd().price || 0) + (this.getNetwork().price || 0);
    const tierFactor = 1 + hwValue / 12000;
    return Math.max(60, Math.round(missing * 4.5 * tierFactor));
  }

  applyDdosDamage(damagePct = 35, attackerLabel = 'Enxame DDoS') {
    this.ensureForProfile();
    const prev = this.getHealthPct();
    const armorPct = (window.skillTreeEngine && typeof window.skillTreeEngine.getActiveResonanceBonus === 'function')
      ? Number(window.skillTreeEngine.getActiveResonanceBonus().ddosArmorPct || 0)
      : 0;
    const rawDmg = Math.max(8, Math.min(65, Math.round(Number(damagePct || 35))));
    const dmg = Math.max(5, Math.round(rawDmg * (1 - Math.min(0.65, armorPct / 100))));
    const next = Math.max(20, prev - dmg);
    this.saveRig({ healthPct: next, lastDdosBy: attackerLabel });
    let raidCorrupted = null;
    if (window.topTenMechanics && typeof window.topTenMechanics.onPlayerPcHitByDdos === 'function') {
      raidCorrupted = window.topTenMechanics.onPlayerPcHitByDdos(next);
    }

    if (typeof window.addLocalLog === 'function') {
      window.addLocalLog(
        'DDOS-HARDWARE',
        `SOBRECARGA DDoS (${attackerLabel}) queimou circuitos do seu PC! Integridade caiu de ${prev}% para ${next}% (CPU e Internet reduzidas até consertar!).`,
        'danger'
      );
    }
    if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
    if (typeof window.updateHardwareDisplay === 'function') window.updateHardwareDisplay();
    if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
    return { prevHealth: prev, healthPct: next, repairCost: this.getRepairCost() };
  }

  repairHardware() {
    this.ensureForProfile();
    const health = this.getHealthPct();
    if (health >= 100) {
      return { success: false, message: 'Suas peças já estão com 100% de integridade!' };
    }
    const cost = this.getRepairCost();
    if (!window.currentWallet || parseFloat(window.currentWallet.balance) < cost) {
      return { success: false, message: `Saldo insuficiente! O conserto das peças custa $ ${cost.toLocaleString('pt-BR')} HC.` };
    }

    const deductFn = () => {
      window.currentWallet.balance = Math.max(0, +(parseFloat(window.currentWallet.balance) - cost).toFixed(2));
    };
    if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
      window.integrityGuard.runAuthorized(deductFn);
    } else {
      deductFn();
    }

    this.saveRig({ healthPct: 100, lastDdosBy: null });
    let insRefund = 0;
    if (window.ecosystemHub && typeof window.ecosystemHub.claimInsuranceReimbursement === 'function') {
      insRefund = window.ecosystemHub.claimInsuranceReimbursement(cost);
    }
    if (typeof window.addLocalLog === 'function') {
      window.addLocalLog('HARDWARE-REPAIR', `Peças danificadas por DDoS consertadas (100% integridade): -$ ${cost} HC${insRefund > 0 ? ` (Seguro reembolsou +$ ${insRefund} HC)` : ''}`, 'success');
    }
    if (window.hackerAudio && typeof window.hackerAudio.playCashChime === 'function') {
      window.hackerAudio.playCashChime();
    }
    if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
    if (typeof window.updateHardwareDisplay === 'function') window.updateHardwareDisplay();
    if (window.onlineEngine) window.onlineEngine.scheduleSave(true);
    return { success: true, cost, insRefund, healthPct: 100, message: `🔧 Peças consertadas! Integridade restaurada para 100% (-$ ${cost} HC${insRefund > 0 ? ` · Reembolso Seguro +$ ${insRefund}` : ''}).` };
  }

  getCpu() {
    this.ensureForProfile();
    return this.catalog.cpu.find((c) => c.id === this.current.cpu) || this.catalog.cpu[0];
  }

  getRam() {
    this.ensureForProfile();
    return this.catalog.ram.find((r) => r.id === this.current.ram) || this.catalog.ram[0];
  }

  getHdd() {
    this.ensureForProfile();
    return this.catalog.hdd.find((h) => h.id === this.current.hdd) || this.catalog.hdd[0];
  }

  getNetwork() {
    this.ensureForProfile();
    return this.catalog.network.find((n) => n.id === this.current.network) || this.catalog.network[0];
  }

  getCooldownMs() {
    const base = this.getCpu().cooldown_ms || 4000;
    return Math.round(base / this.getHealthMultiplier());
  }

  getBannerText() {
    const ram = this.getRam();
    const hdd = this.getHdd();
    const health = this.getHealthPct();
    return `${this.getEffectiveCpuMhz()}MHz CPU${health < 100 ? ` (${health}% SAÚDE!)` : ''} // ${ram.ramMb}MB RAM // ${hdd.hddMb}MB HDD // NET ${this.getEffectiveNetMbps()}Mbps`;
  }

  formatStorage(mb) {
    const n = Number(mb || 0);
    if (n >= 1024) {
      const gb = n / 1024;
      return `${Number.isInteger(gb) ? gb : gb.toFixed(1)} GB`;
    }
    return `${Math.round(n)} MB`;
  }

  formatCpu(mhz) {
    const n = Number(mhz || 0);
    if (n >= 10000) {
      return `${(n / 1000).toFixed(1).replace('.0', '')} GHz`;
    }
    return `${Math.round(n).toLocaleString('pt-BR')} MHz`;
  }

  // Calcula a tarifa de energia ($ por Watt/mês) com base na carga total do PC do jogador (faixa residencial vs alta demanda)
  getEnergyRatePerWattMonth(totalPcWatts) {
    const w = Math.max(60, Number(totalPcWatts || 100));
    return +(2.65 + Math.min(1.65, (w / 520) * 1.35)).toFixed(2);
  }

  getPrimaryPcElectricityMonthlyCost() {
    const fleet = this.getMachinesFleet();
    const pc = fleet.find((m) => m.isPrimaryPc);
    return pc ? pc.energyMonthlyCost : 300;
  }

  // Retorna toda a frota de máquinas do jogador (PC Principal #1 + todas as VPS / Servidores secundários)
  // com Potência, Consumo (Watts + uso) e Gasto (Energia baseada no PC + Mensalidade do Provedor) calculados individualmente!
  getMachinesFleet() {
    this.ensureForProfile();
    if (window.lanServersEngine && typeof window.lanServersEngine.ensureSyncedWithProfile === 'function') {
      window.lanServersEngine.ensureSyncedWithProfile();
    }

    const cpu = this.getCpu();
    const ram = this.getRam();
    const hdd = this.getHdd();
    const net = this.getNetwork();
    const healthPct = this.getHealthPct();
    const effCpu = this.getEffectiveCpuMhz();
    const effNet = this.getEffectiveNetMbps();
    const usedHdd = window.softwareEngine ? window.softwareEngine.getUsedHddMb() : 0;
    const usedRam = window.softwareEngine ? window.softwareEngine.getUsedRamMb() : 0;

    // Consumo elétrico do PC Principal: placa-mãe/fonte (28W) + peças + carga dinâmica da RAM + Air Cooler (Watercooler 360mm = +0W!)
    const activeLoadW = ram.ramMb > 0 ? Math.round((usedRam / ram.ramMb) * 18) : 0;
    const coolerExtraW = (window.nineSystemsEngine && typeof window.nineSystemsEngine.getLiveThermalTelemetry === 'function')
      ? Number(window.nineSystemsEngine.getLiveThermalTelemetry().extraWatts || 0)
      : 0;
    const pcWatts = 28 + (cpu.watts || 55) + (ram.watts || 6) + (hdd.watts || 9) + (net.watts || 5) + activeLoadW + coolerExtraW;
    const pcEnergyRate = this.getEnergyRatePerWattMonth(pcWatts);
    const pcEnergyMonthly = Math.round(pcWatts * pcEnergyRate);
    const pcNetMonthly = net.monthlyFee || 35;
    // Escala de Tempo do Jogo: 1 Dia Real (24h) = 1 Mês no Jogo | 1 Hora Real (1h) = 1 Dia no Jogo!
    const pcMonthlyCost = pcEnergyMonthly + pcNetMonthly;
    const pcDailyCost = Math.max(1, Math.round(pcMonthlyCost / 24));
    const pcLoadPct = Math.min(100, Math.max(8, Math.round(((usedRam / Math.max(1, ram.ramMb)) * 60) + ((usedHdd / Math.max(1, hdd.hddMb)) * 40))));
    const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';

    const fleet = [
      {
        id: 'pc_main',
        isPrimaryPc: true,
        kind: 'pc',
        name: 'PC Principal #1',
        roleTag: 'Seu PC Local',
        ip: myIp,
        healthPct,
        cpuMhz: effCpu,
        hddMb: hdd.hddMb,
        ramMb: ram.ramMb,
        netMbps: effNet,
        netPlanCode: net.code || 'NET1',
        netProvider: net.provider || 'HC Rádio Comunitária',
        netMonthlyFee: pcNetMonthly,
        energyMonthlyCost: pcEnergyMonthly,
        usedHddMb: usedHdd,
        usedRamMb: usedRam,
        loadPct: pcLoadPct,
        watts: pcWatts,
        dailyCost: pcDailyCost,
        monthlyCost: pcMonthlyCost,
        costBreakdown: `Luz do PC (${pcWatts}W → $${pcEnergyMonthly}/mês) + Internet ${net.code || 'NET1'} · ${net.provider || 'ISP'} ($${pcNetMonthly}/mês) · Chega todo dia às 12h (máx. 3 meses)`
      }
    ];

    const extraServers = (window.lanServersEngine && Array.isArray(window.lanServersEngine.servers))
      ? window.lanServersEngine.servers.filter((s) => s.id !== 'srv_gateway_01')
      : [];

    extraServers.forEach((s, idx) => {
      const sp = s.specs || { cpuMhz: 1800, netMbps: 50, hddMb: 512, ramMb: 256 };
      const cpuM = Number(sp.cpuMhz || 1600);
      const ramM = Number(sp.ramMb || 256);
      const hddM = Number(sp.hddMb || 512);
      const netM = Number(sp.netMbps || 50);

      const matchedNet = this.catalog.network.slice().reverse().find((n) => netM >= n.mbps) || this.catalog.network[0];
      const vpsWatts = Math.max(45, Math.round(24 + (cpuM / 1000) * 28 + (ramM / 1024) * 8 + (hddM / 1024) * 3 + netM * 0.02));
      const vpsEnergyMonthly = Math.round(vpsWatts * this.getEnergyRatePerWattMonth(vpsWatts));
      const baseCloudMonthly = s.type === 'mainframe' ? 6800 : (s.type === 'dedicated' ? 2400 : 290);
      const vpsMonthlyCost = baseCloudMonthly + vpsEnergyMonthly;
      const vpsDailyCost = Math.max(1, Math.round(vpsMonthlyCost / 24));
      const simUsedRam = Math.min(ramM, Math.round(ramM * (s.isHoneypot ? 0.34 : 0.22)));
      const simUsedHdd = Math.min(hddM, Math.round(hddM * (s.isHoneypot ? 0.28 : 0.18)));
      const vpsLoadPct = Math.round(((simUsedRam / Math.max(1, ramM)) * 60) + ((simUsedHdd / Math.max(1, hddM)) * 40));

      const cleanLabel = s.label && s.label.toLowerCase().includes('vps')
        ? s.label
        : `VPS #${idx + 1} · ${s.label || 'Cloud'}`;

      fleet.push({
        id: s.id,
        isPrimaryPc: false,
        kind: s.type || 'vps',
        name: cleanLabel,
        roleTag: s.isHoneypot ? 'VPS · Honeypot' : (s.isGateway ? 'VPS · Gateway' : (s.type === 'dedicated' ? 'Dedicado Rack' : 'VPS Cloud')),
        ip: s.ip || '185.220.11.10',
        healthPct: 100,
        cpuMhz: cpuM,
        hddMb: hddM,
        ramMb: ramM,
        netMbps: netM,
        netPlanCode: matchedNet.code || 'CLOUD',
        netProvider: 'Datacenter Backbone IX',
        netMonthlyFee: baseCloudMonthly,
        energyMonthlyCost: vpsEnergyMonthly,
        usedHddMb: simUsedHdd,
        usedRamMb: simUsedRam,
        loadPct: vpsLoadPct,
        watts: vpsWatts,
        dailyCost: vpsDailyCost,
        monthlyCost: vpsMonthlyCost,
        rawServer: s,
        costBreakdown: `Energia da máquina (${vpsWatts}W → $${vpsEnergyMonthly}/mês) + Hospedagem Cloud ($${baseCloudMonthly}/mês)`
      });
    });

    return fleet;
  }

  getFleetSummary(fleet = null) {
    const list = fleet || this.getMachinesFleet();
    return list.reduce(
      (acc, m) => {
        acc.count += 1;
        if (!m.isPrimaryPc) acc.vpsCount += 1;
        acc.cpuMhz += m.cpuMhz;
        acc.hddMb += m.hddMb;
        acc.ramMb += m.ramMb;
        acc.netMbps = +(acc.netMbps + m.netMbps).toFixed(1);
        acc.usedHddMb += m.usedHddMb;
        acc.usedRamMb += m.usedRamMb;
        acc.watts += m.watts;
        acc.dailyCost += m.dailyCost;
        acc.monthlyCost += m.monthlyCost;
        return acc;
      },
      { count: 0, vpsCount: 0, cpuMhz: 0, hddMb: 0, ramMb: 0, netMbps: 0, usedHddMb: 0, usedRamMb: 0, watts: 0, dailyCost: 0, monthlyCost: 0 }
    );
  }

  selectScope(scopeId) {
    this.selectedScope = scopeId || 'all';
    if (scopeId && scopeId !== 'all') {
      this.upgradeTargetId = scopeId;
    }
    this.rerender();
  }

  openUpgradeForMachine(machineId, partCat = 'cpu') {
    this.upgradeTargetId = machineId || 'pc_main';
    this.selectedScope = machineId || 'all';
    if (partCat === 'network') {
      this.activeTab = 'network';
    } else {
      this.activeTab = 'upgrade';
      this.upgradePartCat = partCat || 'cpu';
    }
    this.rerender();
  }

  setUpgradeTarget(machineId) {
    this.upgradeTargetId = machineId || 'pc_main';
    this.rerender();
  }

  setUpgradePartCat(partCat) {
    this.upgradePartCat = partCat || 'cpu';
    this.rerender();
  }

  setTab(tabKey) {
    // Compatibilidade com chamadas diretas setTab('cpu' | 'ram' | 'hdd')
    if (tabKey === 'cpu' || tabKey === 'ram' || tabKey === 'hdd') {
      this.activeTab = 'upgrade';
      this.upgradePartCat = tabKey;
    } else {
      this.activeTab = tabKey || 'overview';
    }
    this.rerender();
  }

  rerender() {
    const bal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
    this.renderWorkbench('hardwareWorkbenchBody', bal);
  }

  getMachineCurrentSpecVal(machine, category) {
    if (!machine) return 0;
    if (category === 'cpu') return machine.cpuMhz;
    if (category === 'ram') return machine.ramMb;
    if (category === 'hdd') return machine.hddMb;
    if (category === 'network') return machine.netMbps;
    return 0;
  }

  getItemSpecVal(category, item) {
    if (category === 'cpu') return item.mhz;
    if (category === 'ram') return item.ramMb;
    if (category === 'hdd') return item.hddMb;
    if (category === 'network') return item.mbps;
    return 0;
  }

  // Calcula o consumo de energia da peça E o custo de energia elétrica gerado com base no PC atual do jogador!
  computePartEnergyImpact(targetMachine, cat, item) {
    const curPartWatts = (() => {
      if (targetMachine.isPrimaryPc) {
        if (cat === 'cpu') return this.getCpu().watts || 55;
        if (cat === 'ram') return this.getRam().watts || 6;
        if (cat === 'hdd') return this.getHdd().watts || 9;
      }
      if (cat === 'cpu') return Math.round((targetMachine.cpuMhz / 1000) * 28);
      if (cat === 'ram') return Math.max(6, Math.round((targetMachine.ramMb / 1024) * 8));
      return Math.max(8, Math.round((targetMachine.hddMb / 1024) * 3));
    })();

    const itemWatts = item.watts || 10;
    const simulatedPcWatts = Math.max(60, targetMachine.watts - curPartWatts + itemWatts);
    const rateOnThisPc = this.getEnergyRatePerWattMonth(simulatedPcWatts);
    const partMonthlyEnergy = Math.round(itemWatts * rateOnThisPc);
    const totalPcMonthlyEnergy = Math.round(simulatedPcWatts * rateOnThisPc);
    return {
      itemWatts,
      simulatedPcWatts,
      rateOnThisPc,
      partMonthlyEnergy,
      totalPcMonthlyEnergy
    };
  }

  renderNetworkPlansTableHtml(targetMachine, currentBalance, esc, ic) {
    const list = this.catalog.network || [];
    const curVal = targetMachine.isPrimaryPc ? this.getNetwork().mbps : targetMachine.netMbps;
    const curPlan = list.find((x) => (targetMachine.isPrimaryPc ? this.current.network === x.id : x.mbps === curVal)) || list[0];

    const rows = list.map((item) => {
      const isCurrent = targetMachine.isPrimaryPc ? this.current.network === item.id : item.mbps === curVal;
      const isLower = !isCurrent && item.mbps <= curVal;
      const canBuy = !isCurrent && !isLower && currentBalance >= item.price;
      const installStr = item.price === 0 ? 'Grátis' : `$${item.price.toLocaleString('pt-BR')}`;
      const monthlyStr = `$${(item.monthlyFee || 35).toLocaleString('pt-BR')}/mês`;
      const mbPerSec = +(item.mbps / 8).toFixed(2);

      return `
        <tr class="${isCurrent ? 'row-running' : ''} ${isLower ? 'row-hidden' : ''}">
          <td class="soft-col-icon">
            <span class="soft-mini-glyph kind-defense"
              data-tip-title="${esc(item.code)} · ${esc(item.provider)}"
              data-tip-meta="${item.mbps} Mbit"
              data-tip-desc="Provedor: ${esc(item.provider)} · Velocidade real ~${mbPerSec} MB/s · Taxa de instalação ${installStr} + Mensalidade ${monthlyStr}.">
              ${ic('wifi')}
            </span>
          </td>
          <td>
            <span class="soft-name-trigger" tabindex="0"
              data-tip-title="${esc(item.code)} — ${esc(item.provider)}"
              data-tip-meta="${item.mbps} Mbit/s"
              data-tip-desc="Provedor: ${esc(item.provider)} · Instalação única: ${installStr} · Assinatura mensal: ${monthlyStr}.">
              ${isCurrent ? '<span class="soft-run-dot"></span>' : ''}
              <strong>${esc(item.code)}</strong>
              <span style="font-family:var(--hc-font-sans);color:var(--hc-text-2);margin-left:6px;">${esc(item.provider)}</span>
            </span>
          </td>
          <td class="soft-col-size" style="width:115px;color:var(--hc-info-text);font-weight:700;">${item.mbps} Mbit</td>
          <td class="soft-col-size" style="width:125px;color:${item.price === 0 ? 'var(--hc-text-3)' : 'var(--hc-accent-text)'};font-weight:700;">${esc(installStr)}</td>
          <td class="soft-col-size" style="width:125px;color:#ff8e88;">${esc(monthlyStr)}</td>
          <td class="soft-col-acts">
            ${isCurrent
              ? `<span class="hc-badge success">Plano Ativo</span>`
              : (isLower
                  ? `<span style="font-size:11.5px;color:var(--hc-text-3);">Inferior</span>`
                  : `<div class="soft-icon-actions">
                       <button type="button" class="soft-icon-act ic-info" aria-label="Detalhes do plano ${esc(item.code)}"
                         data-tip-title="${esc(item.provider)}" data-tip-meta="${item.mbps} Mbit (~${mbPerSec} MB/s)"
                         data-tip-desc="Taxa de instalação: ${installStr} · Custo mensal fixo do plano: ${monthlyStr}.">
                         ${ic('info')}
                       </button>
                       <button type="button" class="soft-icon-act ic-run" ${!canBuy ? 'disabled' : ''} aria-label="Contratar plano ${esc(item.code)}"
                         data-tip-title="${canBuy ? `Contratar ${esc(item.code)} (${esc(item.provider)})` : `Saldo insuficiente p/ instalação (${installStr})`}"
                         data-tip-meta="Instalação ${installStr}"
                         data-tip-desc="Paga agora a instalação (${installStr}) e atualiza a assinatura mensal para ${monthlyStr}."
                         onclick="buyHardwareUpgrade('network', '${item.id}', ${item.price}, '${esc(targetMachine.id)}')">
                         ${ic('shopping-cart')}
                       </button>
                     </div>`)}
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div style="background:var(--hc-inset);border:1px solid var(--hc-border);border-radius:8px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:12.5px;">
          <div>
            Provedor atual em <strong>${esc(targetMachine.name)}</strong>:
            <strong style="color:var(--hc-accent-text);margin-left:4px;">${esc(curPlan.code)} · ${esc(curPlan.provider)}</strong>
            <span class="mono" style="color:var(--hc-text-2);margin-left:6px;">(${curVal} Mbit/s)</span>
          </div>
          <span class="mono" style="color:#ff8e88;">Mensalidade do Plano: <strong>$${(curPlan.monthlyFee || 35).toLocaleString('pt-BR')}/mês</strong></span>
        </div>

        <div class="soft-table-wrap" role="region" aria-label="Planos de Internet e Provedores">
          <table class="soft-table clean-hw-table">
            <thead>
              <tr>
                <th class="soft-col-icon"></th>
                <th>Plano &amp; Nome do Provedor</th>
                <th class="soft-col-size" style="width:115px;">Potência</th>
                <th class="soft-col-size" style="width:125px;">Instalação</th>
                <th class="soft-col-size" style="width:125px;">Custo Mensal</th>
                <th class="soft-col-acts">Ação</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  getDiscountedPartPrice(rawPrice) {
    const base = Number(rawPrice || 0);
    if (base <= 0) return 0;
    const cnpjMult = (window.nineSystemsEngine && typeof window.nineSystemsEngine.getCompanyCnpjPerks === 'function')
      ? Number(window.nineSystemsEngine.getCompanyCnpjPerks().hwDiscountMult || 1.0)
      : 1.0;
    return Math.round(base * cnpjMult);
  }

  renderCatalogTableHtml(cat, targetMachine, currentBalance, esc, ic) {
    if (cat === 'network') {
      return this.renderNetworkPlansTableHtml(targetMachine, currentBalance, esc, ic);
    }

    const cnpjPerks = (window.nineSystemsEngine && typeof window.nineSystemsEngine.getCompanyCnpjPerks === 'function')
      ? window.nineSystemsEngine.getCompanyCnpjPerks()
      : { tier: 0, hwDiscountMult: 1.0 };
    const hasCnpjDiscount = cnpjPerks.hwDiscountMult < 1.0;

    const catMeta = {
      cpu: { label: 'Processador (CPU)', icon: 'cpu', glyph: 'attack', specFn: (i) => `${i.mhz.toLocaleString('pt-BR')} MHz` },
      hdd: { label: 'Armazenamento (Disco)', icon: 'hard-drive', glyph: 'stealth', specFn: (i) => this.formatStorage(i.hddMb) },
      ram: { label: 'Memória RAM', icon: 'layers', glyph: 'defense', specFn: (i) => this.formatStorage(i.ramMb) }
    };
    const m = catMeta[cat] || catMeta.cpu;
    const list = this.catalog[cat] || [];
    const curVal = targetMachine.isPrimaryPc && cat === 'cpu'
      ? this.getCpu().mhz
      : this.getMachineCurrentSpecVal(targetMachine, cat);

    const rows = list.map((item) => {
      const itemVal = this.getItemSpecVal(cat, item);
      const isCurrent = targetMachine.isPrimaryPc
        ? this.current[cat] === item.id
        : itemVal === curVal;
      const isLower = !isCurrent && itemVal <= curVal;
      const effPrice = this.getDiscountedPartPrice(item.price);
      const canBuy = !isCurrent && !isLower && currentBalance >= effPrice;
      const priceStr = effPrice === 0 ? 'Inicial' : `$${effPrice.toLocaleString('pt-BR')}${hasCnpjDiscount ? ' (-10%)' : ''}`;
      const pwr = this.computePartEnergyImpact(targetMachine, cat, item);

      return `
        <tr class="${isCurrent ? 'row-running' : ''} ${isLower ? 'row-hidden' : ''}">
          <td class="soft-col-icon">
            <span class="soft-mini-glyph kind-${m.glyph}"
              data-tip-title="${esc(item.name)}"
              data-tip-meta="${pwr.itemWatts}W · +$${pwr.partMonthlyEnergy}/mês luz"
              data-tip-desc="No seu ${esc(targetMachine.name)}, esta peça consome ${pwr.itemWatts}W e gera $${pwr.partMonthlyEnergy}/mês de energia (PC total: ${pwr.simulatedPcWatts}W → $${pwr.totalPcMonthlyEnergy}/mês de luz).">
              ${ic(m.icon)}
            </span>
          </td>
          <td>
            <span class="soft-name-trigger" tabindex="0"
              data-tip-title="${esc(item.name)}"
              data-tip-meta="${esc(m.specFn(item))}"
              data-tip-desc="Consumo da peça: ${pwr.itemWatts}W · Custo de energia gerado com base no seu PC: $${pwr.partMonthlyEnergy}/mês (Conta de luz total da máquina: $${pwr.totalPcMonthlyEnergy}/mês).">
              ${isCurrent ? '<span class="soft-run-dot"></span>' : ''}
              <span>${esc(item.name)}</span>
            </span>
          </td>
          <td class="soft-col-size" style="width:115px;">${esc(m.specFn(item))}</td>
          <td class="soft-col-size" style="width:105px;color:#f5ba66;font-weight:600;">⚡ ${pwr.itemWatts} W</td>
          <td class="soft-col-size" style="width:145px;color:#ff8e88;"
            data-tip-title="Custo de Energia no seu PC"
            data-tip-meta="Tarifa $${pwr.rateOnThisPc}/W"
            data-tip-desc="Calculado com base no conjunto de peças de ${esc(targetMachine.name)}: esta peça gera $${pwr.partMonthlyEnergy}/mês de luz (deixando o PC com ${pwr.simulatedPcWatts}W = $${pwr.totalPcMonthlyEnergy}/mês).">
            +$${pwr.partMonthlyEnergy}/mês luz
          </td>
          <td class="soft-col-size" style="width:105px;color:${item.price === 0 ? 'var(--hc-text-3)' : 'var(--hc-accent-text)'};font-weight:700;white-space:nowrap;">${esc(priceStr)}</td>
          <td class="soft-col-acts">
            ${isCurrent
              ? `<span class="hc-badge success">Instalado</span>`
              : (isLower
                  ? `<span style="font-size:11.5px;color:var(--hc-text-3);">Superado</span>`
                  : `<div class="soft-icon-actions">
                       <button type="button" class="soft-icon-act ic-info" aria-label="Impacto elétrico de ${esc(item.name)}"
                         data-tip-title="Energia em ${esc(targetMachine.name)}" data-tip-meta="${pwr.itemWatts}W → $${pwr.partMonthlyEnergy}/mês"
                         data-tip-desc="Com esta peça instalada, ${esc(targetMachine.name)} passa a consumir ${pwr.simulatedPcWatts}W totais ($${pwr.totalPcMonthlyEnergy}/mês na conta de energia).">
                         ${ic('info')}
                       </button>
                       <button type="button" class="soft-icon-act ic-run" aria-label="Comprar ${esc(item.name)}"
                         data-tip-title="${canBuy ? `Comprar e instalar em ${esc(targetMachine.name)}` : `Exige $${effPrice.toLocaleString('pt-BR')} Limpos (clique se quiser ver ponte de Lavagem)`}"
                         data-tip-meta="${esc(priceStr)}"
                         data-tip-desc="Potência: ${esc(m.specFn(item))} · Consumo: ${pwr.itemWatts}W · Custo de energia no seu PC: +$${pwr.partMonthlyEnergy}/mês."
                         onclick="buyHardwareUpgrade('${cat}', '${item.id}', ${effPrice}, '${esc(targetMachine.id)}')">
                         ${ic('shopping-cart')}
                       </button>
                     </div>`)}
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div style="background:var(--hc-inset);border:1px solid var(--hc-border);border-radius:8px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:12.5px;">
          <span>Energia atual de <strong>${esc(targetMachine.name)}</strong>: <strong style="color:#f5ba66;">${targetMachine.watts} W</strong></span>
          <span class="mono" style="color:#ff8e88;">Custo de Energia desta máquina: <strong>$${targetMachine.energyMonthlyCost.toLocaleString('pt-BR')}/mês</strong></span>
        </div>

        <div class="soft-table-wrap" role="region" aria-label="Catálogo de ${esc(m.label)} para ${esc(targetMachine.name)}">
          <table class="soft-table clean-hw-table">
            <thead>
              <tr>
                <th class="soft-col-icon"></th>
                <th>Peça · ${esc(m.label)} (${esc(targetMachine.name)})</th>
                <th class="soft-col-size" style="width:115px;">Potência</th>
                <th class="soft-col-size" style="width:105px;">Consumo</th>
                <th class="soft-col-size" style="width:145px;">Custo de Energia</th>
                <th class="soft-col-size" style="width:105px;">Preço Peça</th>
                <th class="soft-col-acts">Ações</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderWorkbench(containerId, currentBalance) {
    const el = document.getElementById(containerId);
    if (!el) return;
    this.ensureForProfile();
    if (!this.activeTab) this.activeTab = 'overview';

    const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const ic = (n) => (window.HC && window.HC.icon ? window.HC.icon(n) : '');

    const fleet = this.getMachinesFleet();
    const totals = this.getFleetSummary(fleet);

    // Garante que o escopo e o alvo de upgrade existam na frota atual
    if (this.selectedScope !== 'all' && !fleet.some((m) => m.id === this.selectedScope)) {
      this.selectedScope = 'all';
    }
    const targetMachine = fleet.find((m) => m.id === this.upgradeTargetId) || fleet[0];
    const scopedMachine = this.selectedScope === 'all' ? null : fleet.find((m) => m.id === this.selectedScope);
    const activeMetrics = scopedMachine || totals;

    const healthPct = this.getHealthPct();
    const repairCost = this.getRepairCost();
    const canRepair = healthPct < 100 && currentBalance >= repairCost;

    let mainColHtml = '';

    // 1. ABA MINHAS MÁQUINAS (Estilo limpo da Foto 1: Potencial Total + Seletor por Máquina + Cards Individuais)
    if (this.activeTab === 'overview') {
      const scopePillsHtml = [
        `<button type="button" id="hwScopeAll" class="hw-scope-pill ${this.selectedScope === 'all' ? 'active' : ''}"
           data-tip-title="Potencial Total Somado" data-tip-meta="${fleet.length} máquinas"
           data-tip-desc="Soma a potência, o consumo elétrico (Watts) e o gasto diário do seu PC Principal + todas as suas VPS."
           onclick="window.hardwareEngine.selectScope('all')">
           ${ic('layers')} <span>Potencial Total (${fleet.length})</span>
         </button>`,
        ...fleet.map((m) => `
          <button type="button" id="hwScope_${esc(m.id)}" class="hw-scope-pill ${this.selectedScope === m.id ? 'active' : ''}"
            data-tip-title="Ver separado: ${esc(m.name)}" data-tip-meta="${m.watts}W · $${m.dailyCost}/dia"
            data-tip-desc="Isolar nos indicadores acima e na coluna lateral apenas a potência, o consumo e o gasto desta máquina."
            onclick="window.hardwareEngine.selectScope('${esc(m.id)}')">
            ${ic(m.isPrimaryPc ? 'monitor' : 'server')} <span>${esc(m.name)}</span>
          </button>
        `)
      ].join('');

      const scopeBannerLabel = scopedMachine
        ? `Vendo separado: <strong>${esc(scopedMachine.name)}</strong> (${esc(scopedMachine.roleTag)})`
        : `Potencial Total Combinado: <strong>1 PC Principal + ${totals.vpsCount} VPS</strong> (${totals.count} máquinas ativas)`;

      const machineCardsHtml = fleet.map((m) => {
        const isSel = this.selectedScope === m.id;
        const ipHtml = m.isPrimaryPc && window.networkIdentity && window.networkIdentity.renderBlurredMyIpHtml
          ? window.networkIdentity.renderBlurredMyIpHtml(m.ip, true)
          : esc(m.ip);

        return `
          <article class="hw-machine-card ${isSel ? 'is-selected' : ''}" id="hwCard_${esc(m.id)}">
            <div class="hw-mc-head">
              <div class="hw-mc-head-left">
                ${ic(m.isPrimaryPc ? 'monitor' : 'server')}
                <span>${esc(m.name)}</span>
                <span class="hc-badge ${m.isPrimaryPc ? 'success' : 'info'}" style="font-size:10px;padding:1px 6px;">${esc(m.roleTag)}</span>
              </div>
              <div class="hw-mc-actions">
                <button type="button" class="hw-mc-btn btn-inspect-machine"
                  data-tip-title="${isSel ? 'Voltar ao Potencial Total' : `Ver ${esc(m.name)} separado`}"
                  data-tip-meta="${m.watts}W · $${m.dailyCost}/dia"
                  data-tip-desc="Mostra nos medidores do topo e no resumo lateral somente a potência, consumo e gasto desta máquina."
                  onclick="window.hardwareEngine.selectScope('${isSel ? 'all' : esc(m.id)}')">
                  ${isSel ? 'Total Geral' : 'Ver Separado'}
                </button>
                <button type="button" class="hw-mc-btn primary btn-upgrade-machine"
                  data-tip-title="Melhorar ${esc(m.name)}" data-tip-meta="Upgrade"
                  data-tip-desc="Abrir catálogo de peças (CPU, Disco e Memória RAM) para evoluir esta máquina."
                  onclick="window.hardwareEngine.openUpgradeForMachine('${esc(m.id)}', 'cpu')">
                  Melhorar
                </button>
              </div>
            </div>

            <div class="hw-mc-body">
              <div class="hw-mc-rig-glyph ${m.isPrimaryPc ? '' : 'is-vps'}"
                data-tip-title="${esc(m.name)}" data-tip-meta="${esc(m.roleTag)}" data-tip-desc="${esc(m.costBreakdown)}">
                ${ic(m.isPrimaryPc ? 'cpu' : 'cloud')}
              </div>

              <div class="hw-mc-details">
                <div class="hw-mc-title-row">
                  <span class="hw-mc-title">${esc(m.name)}</span>
                  <span class="hw-mc-ip">${ipHtml}</span>
                </div>

                <div class="hw-mc-specs-row" aria-label="Potência de ${esc(m.name)}">
                  <span class="hw-mc-spec-item" data-tip-title="Potência de CPU" data-tip-meta="${m.cpuMhz.toLocaleString('pt-BR')} MHz" data-tip-desc="Velocidade de processamento desta máquina.">
                    ${ic('cpu')} <strong>${m.cpuMhz.toLocaleString('pt-BR')} MHz</strong>
                  </span>
                  <span class="hw-mc-spec-item" data-tip-title="Espaço em Disco" data-tip-meta="${m.usedHddMb}/${m.hddMb} MB" data-tip-desc="Capacidade de armazenamento desta máquina.">
                    ${ic('hard-drive')} ${esc(this.formatStorage(m.hddMb))}
                  </span>
                  <span class="hw-mc-spec-item" data-tip-title="Memória RAM" data-tip-meta="${m.usedRamMb}/${m.ramMb} MB" data-tip-desc="Memória disponível para processos simultâneos.">
                    ${ic('layers')} ${esc(this.formatStorage(m.ramMb))}
                  </span>
                  <span class="hw-mc-spec-item" data-tip-title="Provedor: ${esc(m.netProvider)}" data-tip-meta="${m.netMbps} Mbit/s" data-tip-desc="Plano ${esc(m.netPlanCode)} (${esc(m.netProvider)}) · Mensalidade $${m.netMonthlyFee}/mês.">
                    ${ic('wifi')} ${m.netMbps} Mbit · <span style="font-family:var(--hc-font-sans);color:var(--hc-text-3);">${esc(m.netProvider)}</span>
                  </span>
                </div>

                <div class="hw-mc-foot-grid">
                  <div class="hw-mc-stat-pill" tabindex="0"
                    data-tip-title="Energia gerada no PC" data-tip-meta="${m.watts} Watts"
                    data-tip-desc="Consumo das peças desta máquina: ${m.watts}W → Gera $${m.energyMonthlyCost}/mês de energia elétrica (${m.loadPct}% uso atual).">
                    <span class="lbl">Consumo &amp; Luz Gerada</span>
                    <span class="val power">${ic('zap')} ${m.watts} W → $${m.energyMonthlyCost}/mês luz</span>
                  </div>
                  <div class="hw-mc-stat-pill" tabindex="0"
                    data-tip-title="Gasto Total de ${esc(m.name)}" data-tip-meta="$${m.monthlyCost.toLocaleString('pt-BR')}/mês"
                    data-tip-desc="${esc(m.costBreakdown)}.">
                    <span class="lbl">${m.isPrimaryPc ? 'Luz + Plano Internet' : 'Luz + Cloud VPS'}</span>
                    <span class="val cost">${ic('coins')} $${m.monthlyCost.toLocaleString('pt-BR')}/mês ($${m.dailyCost}/dia)</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        `;
      }).join('');

      mainColHtml = `
        <div class="hw-overview-stack">
          <div class="hw-scope-bar">
            <div class="hw-scope-pills" role="tablist" aria-label="Filtrar visão total ou por máquina">
              ${scopePillsHtml}
            </div>
            <span style="font-size:11.5px;color:var(--hc-text-3);">${scopeBannerLabel}</span>
          </div>

          <!-- 6 Caixas Superiores (Potencial Total de Todas as Máquinas OU Máquina Selecionada) -->
          <div class="hw-total-strip" id="hwTopMetricsStrip">
            <div class="hw-total-tile" tabindex="0"
              data-tip-title="${scopedMachine ? `CPU de ${esc(scopedMachine.name)}` : 'Potencial Total de CPU'}"
              data-tip-meta="${activeMetrics.cpuMhz.toLocaleString('pt-BR')} MHz"
              data-tip-desc="${scopedMachine ? 'Poder de processamento individual desta máquina.' : `Soma do seu PC Principal + ${totals.vpsCount} VPS ativas.`}">
              <div class="hw-tile-ico">${ic('cpu')}</div>
              <div class="hw-tile-meta">
                <span class="hw-tile-val" id="hwMetricCpu">${esc(this.formatCpu(activeMetrics.cpuMhz))}</span>
                <span class="hw-tile-unit">${scopedMachine ? 'CPU Máquina' : 'CPU Total'}</span>
              </div>
            </div>

            <div class="hw-total-tile" tabindex="0"
              data-tip-title="${scopedMachine ? `Disco de ${esc(scopedMachine.name)}` : 'Armazenamento Total'}"
              data-tip-meta="${activeMetrics.usedHddMb}/${activeMetrics.hddMb} MB"
              data-tip-desc="Espaço somado de HD, SSD e NVMe disponível.">
              <div class="hw-tile-ico is-disk">${ic('hard-drive')}</div>
              <div class="hw-tile-meta">
                <span class="hw-tile-val" id="hwMetricHdd">${esc(this.formatStorage(activeMetrics.hddMb))}</span>
                <span class="hw-tile-unit">${scopedMachine ? 'Disco Máquina' : 'Disco Total'}</span>
              </div>
            </div>

            <div class="hw-total-tile" tabindex="0"
              data-tip-title="${scopedMachine ? `RAM de ${esc(scopedMachine.name)}` : 'Memória RAM Total'}"
              data-tip-meta="${activeMetrics.usedRamMb}/${activeMetrics.ramMb} MB"
              data-tip-desc="Memória volátil total para rodar programas e serviços em segundo plano.">
              <div class="hw-tile-ico is-ram">${ic('layers')}</div>
              <div class="hw-tile-meta">
                <span class="hw-tile-val" id="hwMetricRam">${esc(this.formatStorage(activeMetrics.ramMb))}</span>
                <span class="hw-tile-unit">${scopedMachine ? 'RAM Máquina' : 'RAM Total'}</span>
              </div>
            </div>

            <div class="hw-total-tile" tabindex="0"
              data-tip-title="${scopedMachine ? `Link de ${esc(scopedMachine.name)}` : 'Banda Combinada'}"
              data-tip-meta="${activeMetrics.netMbps} Mbit/s"
              data-tip-desc="Capacidade de transferência somada das interfaces de rede.">
              <div class="hw-tile-ico is-net">${ic('wifi')}</div>
              <div class="hw-tile-meta">
                <span class="hw-tile-val" id="hwMetricNet">${activeMetrics.netMbps} Mbit</span>
                <span class="hw-tile-unit">${scopedMachine ? 'Link Máquina' : 'Rede Total'}</span>
              </div>
            </div>

            <div class="hw-total-tile" tabindex="0"
              data-tip-title="${scopedMachine ? `Consumo de ${esc(scopedMachine.name)}` : 'Consumo Elétrico Total'}"
              data-tip-meta="${activeMetrics.watts} Watts"
              data-tip-desc="Potência elétrica demandada pelas peças e instâncias ligadas.">
              <div class="hw-tile-ico is-power">${ic('zap')}</div>
              <div class="hw-tile-meta">
                <span class="hw-tile-val" id="hwMetricWatts">${activeMetrics.watts} W</span>
                <span class="hw-tile-unit">${scopedMachine ? 'Consumo Máquina' : 'Consumo Total'}</span>
              </div>
            </div>

            <div class="hw-total-tile" tabindex="0"
              data-tip-title="${scopedMachine ? `Gasto de ${esc(scopedMachine.name)}` : 'Gasto no Tempo do Jogo'}"
              data-tip-meta="Fecha às 12:00 (máx. 3 meses)"
              data-tip-desc="No jogo: 1 Hora Real = 1 Dia ($${activeMetrics.dailyCost}/dia) e 1 Dia Real (24h) = 1 Mês ($${activeMetrics.monthlyCost.toLocaleString('pt-BR')}/mês). A fatura chega todo dia às 12h e acumula no máx. 3 meses (depois pausa até você entrar no jogo novamente).">
              <div class="hw-tile-ico is-cost">${ic('dollar-sign')}</div>
              <div class="hw-tile-meta">
                <span class="hw-tile-val" id="hwMetricCost">$${activeMetrics.dailyCost}/dia</span>
                <span class="hw-tile-unit">$${activeMetrics.monthlyCost.toLocaleString('pt-BR')}/mês · 12h</span>
              </div>
            </div>
          </div>

          <!-- Grade de Máquinas Separadas (PC Principal + Cada VPS + Botão Contratar Nova VPS) -->
          <div class="hw-machines-grid" id="hwMachinesGrid">
            ${machineCardsHtml}
            <button type="button" class="hw-add-vps-card" id="btnCardOpenBuyVps" onclick="window.hardwareEngine.setTab('buy_vps')"
              data-tip-title="Contratar Nova VPS ou Servidor" data-tip-meta="A partir de $2.500"
              data-tip-desc="Adicione mais máquinas virtuais (VPS) ou servidores dedicados para multiplicar seu potencial total.">
              ${ic('plus-circle')}
              <strong style="font-size:13px;color:var(--hc-text);">+ Contratar Nova VPS / Servidor</strong>
              <span style="font-size:11.5px;">Expanda seu potencial total de CPU, RAM, Disco e Rede</span>
            </button>
          </div>
        </div>
      `;
    }
    // 2. ABA MELHORAR MÁQUINA (Upgrade individual do PC Principal OU de qualquer VPS!)
    else if (this.activeTab === 'upgrade') {
      const targetPills = fleet.map((m) => `
        <button type="button" class="hw-scope-pill ${targetMachine.id === m.id ? 'active' : ''}"
          onclick="window.hardwareEngine.setUpgradeTarget('${esc(m.id)}')">
          ${ic(m.isPrimaryPc ? 'monitor' : 'server')} <span>${esc(m.name)}</span>
        </button>
      `).join('');

      const partPills = [
        { key: 'cpu', label: 'CPU', icon: 'cpu' },
        { key: 'hdd', label: 'Disco (HD/SSD/NVMe)', icon: 'hard-drive' },
        { key: 'ram', label: 'Memória RAM', icon: 'layers' }
      ].map((p) => `
        <button type="button" class="hw-scope-pill ${this.upgradePartCat === p.key ? 'active' : ''}"
          onclick="window.hardwareEngine.setUpgradePartCat('${p.key}')">
          ${ic(p.icon)} <span>${p.label}</span>
        </button>
      `).join('');

      mainColHtml = `
        <div class="hw-overview-stack">
          <div class="hw-scope-bar">
            <div class="hw-scope-pills" aria-label="Escolher máquina para melhorar">${targetPills}</div>
            <div class="hw-scope-pills" aria-label="Escolher tipo de peça">${partPills}</div>
          </div>
          ${this.renderCatalogTableHtml(this.upgradePartCat || 'cpu', targetMachine, currentBalance, esc, ic)}
        </div>
      `;
    }
    // 3. ABA COMPRAR NOVA VPS / SERVIDOR (Buy new server)
    else if (this.activeTab === 'buy_vps') {
      const catalogObj = window.SERVER_TYPES_CATALOG || {};
      const vpsRows = Object.values(catalogObj).map((tpl) => {
        const canAfford = currentBalance >= tpl.cost;
        const watts = tpl.watts || Math.round(24 + (tpl.specs.cpuMhz / 1000) * 28);
        const daily = tpl.dailyCost || Math.round(14 + watts * 0.16);
        return `
          <tr>
            <td class="soft-col-icon">
              <span class="soft-mini-glyph kind-defense" data-tip-title="${esc(tpl.name)}" data-tip-meta="$ ${tpl.cost.toLocaleString('pt-BR')}" data-tip-desc="${esc(tpl.desc)}">
                ${ic('cloud')}
              </span>
            </td>
            <td>
              <span class="soft-name-trigger" tabindex="0" data-tip-title="${esc(tpl.name)}" data-tip-meta="Firewall v${tpl.defaultFwl.toFixed(1)}" data-tip-desc="${esc(tpl.desc)}">
                <strong>${esc(tpl.name)}</strong>
              </span>
              <div class="mono" style="font-size:11px;color:var(--hc-text-3);margin-top:2px;">
                ${tpl.specs.cpuMhz.toLocaleString('pt-BR')} MHz · ${esc(this.formatStorage(tpl.specs.hddMb))} Disco · ${esc(this.formatStorage(tpl.specs.ramMb))} RAM · ${tpl.specs.netMbps} Mbit
              </div>
            </td>
            <td class="soft-col-size" style="width:92px;color:#f5ba66;">${watts} W</td>
            <td class="soft-col-size" style="width:96px;color:#ff8e88;">$${daily}/dia</td>
            <td class="soft-col-size" style="width:115px;color:var(--hc-accent-text);font-weight:700;">$ ${tpl.cost.toLocaleString('pt-BR')}</td>
            <td class="soft-col-acts">
              <div class="soft-icon-actions">
                <button type="button" class="soft-icon-act ic-info" aria-label="Info ${esc(tpl.name)}"
                  data-tip-title="${esc(tpl.name)}" data-tip-meta="${watts}W · $${daily}/dia" data-tip-desc="${esc(tpl.desc)}">
                  ${ic('info')}
                </button>
                <button type="button" id="btnBuyServer_${esc(tpl.type)}" class="soft-icon-act ic-run" ${!canAfford ? 'disabled' : ''}
                  aria-label="Contratar ${esc(tpl.name)}"
                  data-tip-title="${canAfford ? `Contratar ${esc(tpl.name)} agora` : `Saldo insuficiente ($ ${tpl.cost.toLocaleString('pt-BR')})`}"
                  data-tip-meta="+$${daily}/dia"
                  data-tip-desc="Adiciona imediatamente esta máquina na sua aba Minhas Máquinas e soma no Potencial Total."
                  onclick="window.handlePurchaseVpsFromHardware('${esc(tpl.type)}')">
                  ${ic('shopping-cart')}
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      mainColHtml = `
        <div class="hw-overview-stack">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="font-size:12.5px;color:var(--hc-text-2);">Contrate novas instâncias <strong>VPS</strong> ou <strong>Servidores Dedicados</strong> para somar ao seu Potencial Total e distribuir operações.</span>
            <button type="button" class="hc-btn ghost sm" onclick="navTo('winLan')">${ic('share-2')} Ver Topologia de Rede (LAN)</button>
          </div>
          <div class="soft-table-wrap" role="region" aria-label="Catálogo de VPS e Servidores">
            <table class="soft-table clean-hw-table">
              <thead>
                <tr>
                  <th class="soft-col-icon"></th>
                  <th>Modelo de VPS / Servidor &amp; Potência</th>
                  <th class="soft-col-size" style="width:92px;">Consumo</th>
                  <th class="soft-col-size" style="width:96px;">Gasto</th>
                  <th class="soft-col-size" style="width:115px;">Ativação</th>
                  <th class="soft-col-acts">Ações</th>
                </tr>
              </thead>
              <tbody>${vpsRows}</tbody>
            </table>
          </div>
        </div>
      `;
    }
    // 4. ABA INTERNET (Upgrade de Link Mbit/s por Máquina)
    else if (this.activeTab === 'network') {
      const targetPills = fleet.map((m) => `
        <button type="button" class="hw-scope-pill ${targetMachine.id === m.id ? 'active' : ''}"
          onclick="window.hardwareEngine.setUpgradeTarget('${esc(m.id)}')">
          ${ic(m.isPrimaryPc ? 'monitor' : 'server')} <span>${esc(m.name)} (${m.netMbps} Mbit)</span>
        </button>
      `).join('');

      mainColHtml = `
        <div class="hw-overview-stack">
          <div class="hw-scope-bar">
            <div class="hw-scope-pills" aria-label="Escolher máquina para upgrade de internet">${targetPills}</div>
          </div>
          ${this.renderCatalogTableHtml('network', targetMachine, currentBalance, esc, ic)}
        </div>
      `;
    }
    // 5. ABA HD EXTERNO (Cofre seguro XHD integrado em Hardware)
    else if (this.activeTab === 'xhd') {
      mainColHtml = window.stealthXhdEngine && typeof window.stealthXhdEngine.renderXhdAndStealthPanelHtml === 'function'
        ? window.stealthXhdEngine.renderXhdAndStealthPanelHtml()
        : `<div style="padding:24px;color:var(--hc-text-3);">Módulo de HD Externo indisponível.</div>`;
    }
    // 6. ABA DEDICADA & LIMPA: FONTE PSU, TERMODINÂMICA °C & CONTROLADORA RAID (Zero Poluição Visual!)
    else if (this.activeTab === 'power_raid') {
      mainColHtml = `
        <div class="hw-overview-stack">
          <div style="padding:10px 14px;border-radius:8px;background:#09121c;border:1px solid rgba(56,189,248,0.35);display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:12px;color:var(--hc-text-2);">
            <span>🔗 <strong>Pontes de Engenharia Física:</strong> Evoluir p/ <strong>Studio (-5°C) / Bunker (-12°C)</strong> resfria sua CPU; ter <strong>Empresa Porte 1+</strong> dá <strong>-10%</strong> em Fontes; e usar <strong>HD Externo (XHD)</strong> protege suas cepas se usar <strong>RAID-0</strong>!</span>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button type="button" class="hc-btn ghost sm" onclick="navTo('winQuitinete')">🏢 Ver Base (-5°C/-12°C) →</button>
              <button type="button" class="hc-btn ghost sm" onclick="window.hardwareEngine.setTab('xhd')">💾 Backup XHD →</button>
            </div>
          </div>
          ${window.progressionLocksEngine && typeof window.progressionLocksEngine.renderHardwarePsuAndBottleneckHtml === 'function' ? window.progressionLocksEngine.renderHardwarePsuAndBottleneckHtml() : ''}
          ${window.topTenMechanics && typeof window.topTenMechanics.renderHardwareRaidSectionHtml === 'function' ? window.topTenMechanics.renderHardwareRaidSectionHtml() : ''}
          ${window.nineSystemsEngine && typeof window.nineSystemsEngine.renderHardwareThermalSectionHtml === 'function' ? window.nineSystemsEngine.renderHardwareThermalSectionHtml() : ''}
        </div>
      `;
    }

    const psuNow = window.progressionLocksEngine ? window.progressionLocksEngine.getCurrentPsu() : { name: '180W', maxWatts: 180 };
    const thermNow = window.nineSystemsEngine ? window.nineSystemsEngine.getLiveThermalTelemetry() : { tempC: 38 };
    const raidNow = window.topTenMechanics ? window.topTenMechanics.state.raidMode.toUpperCase() : 'NORMAL';
    const cnpjPerksTop = window.nineSystemsEngine && typeof window.nineSystemsEngine.getCompanyCnpjPerks === 'function'
      ? window.nineSystemsEngine.getCompanyCnpjPerks()
      : { tier: 0 };

    // Donut Lateral: adapta ao escopo (Potencial Total vs Máquina Selecionada)
    const donutPct = scopedMachine ? scopedMachine.healthPct : healthPct;
    const r = 46;
    const c = +(2 * Math.PI * r).toFixed(2);
    const offset = +(c - (donutPct / 100) * c).toFixed(2);
    const strokeColor = donutPct >= 85 ? '#35b877' : (donutPct >= 55 ? '#f0a03a' : '#e5534b');

    el.innerHTML = `
      <div class="soft-frame" id="hardwareExplorerMain">
        <div class="soft-tabs-bar">
          <div class="soft-tabs-left" role="tablist" aria-label="Seções de Hardware e VPS">
            <button type="button" id="hwTabOverview" class="soft-tab-btn ${this.activeTab === 'overview' ? 'active' : ''}" onclick="window.hardwareEngine.setTab('overview')">
              ${ic('server')} <span>Minhas Máquinas (${fleet.length})</span>
            </button>
            <button type="button" id="hwTabUpgrade" class="soft-tab-btn ${this.activeTab === 'upgrade' ? 'active' : ''}" onclick="window.hardwareEngine.setTab('upgrade')">
              ${ic('cpu')} <span>Melhorar Máquina</span>
            </button>
            <button type="button" id="hwTabPowerRaid" class="soft-tab-btn ${this.activeTab === 'power_raid' ? 'active' : ''}" onclick="window.hardwareEngine.setTab('power_raid')">
              ${ic('zap')} <span>Fonte, Térmica &amp; RAID</span>
            </button>
            <button type="button" id="hwTabBuyVps" class="soft-tab-btn ${this.activeTab === 'buy_vps' ? 'active' : ''}" onclick="window.hardwareEngine.setTab('buy_vps')">
              ${ic('cloud')} <span>Comprar VPS</span>
            </button>
            <button type="button" id="hwTabNetwork" class="soft-tab-btn ${this.activeTab === 'network' ? 'active' : ''}" onclick="window.hardwareEngine.setTab('network')">
              ${ic('wifi')} <span>Internet</span>
            </button>
            <button type="button" id="hwTabXhd" class="soft-tab-btn ${this.activeTab === 'xhd' ? 'active' : ''}" onclick="window.hardwareEngine.setTab('xhd')">
              ${ic('hard-drive')} <span>HD Externo</span>
            </button>
          </div>
          <span class="mono" style="font-size:12px;color:var(--hc-accent-text);">
            ${cnpjPerksTop.tier >= 1 ? '<span class="hc-badge success" style="margin-right:6px;">🏷️ -10% CNPJ Ativo</span>' : ''}
            Limpo: $ ${Number(currentBalance || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </span>
        </div>

        <div class="soft-explorer-shell">
          <div class="soft-main-col">
            ${healthPct < 100 ? `
              <div class="soft-feedback-banner" style="background:rgba(208,68,58,0.16);border-color:rgba(229,83,75,0.45);color:#ff9b95;">
                <span>⚠️ PC Principal danificado por ataque DDoS (${healthPct}% de integridade). Velocidade reduzida até o reparo!</span>
                <button type="button" id="btnRepairHardwareBanner" class="hc-btn sm" style="background:var(--hc-warning);border-color:var(--hc-warning);color:#101418;font-weight:700;opacity:1;" ${!canRepair ? 'disabled' : ''} onclick="window.handleRepairHardware()">
                  Consertar ($ ${repairCost.toLocaleString('pt-BR')})
                </button>
              </div>
            ` : ''}
            ${mainColHtml}
            ${this.activeTab === 'overview' ? `
              <div class="hc-card" style="margin-top:10px;padding:10px 14px;background:#0a1018;border-color:#1f2c3d;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:12px;">
                <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                  <span class="hc-badge info">⚡ Fonte: ${esc(psuNow.name)} (${activeMetrics.watts}W / ${psuNow.maxWatts}W)</span>
                  <span class="hc-badge ${thermNow.tempC >= 80 ? 'danger' : 'success'}">🌡️ CPU: ${thermNow.tempC}°C</span>
                  <span class="hc-badge">💿 Matriz: ${esc(raidNow)}</span>
                </div>
                <button type="button" class="hc-btn primary sm" onclick="window.hardwareEngine.setTab('power_raid')">
                  Abrir Fonte, Térmica &amp; RAID →
                </button>
              </div>
            ` : ''}
          </div>

          <aside class="soft-side-bar" id="hardwareHealthCard">
            <div class="soft-donut-wrap">
              <svg class="soft-donut-svg" viewBox="0 0 116 116" aria-label="Integridade ${donutPct}%">
                <circle cx="58" cy="58" r="${r}" fill="none" stroke="#222832" stroke-width="8"></circle>
                <circle cx="58" cy="58" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="8"
                  stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}" transform="rotate(-90 58 58)"></circle>
                <text id="hwHealthPctLabel" x="58" y="63" text-anchor="middle" fill="#ebeff4" font-family="var(--hc-font-mono)" font-size="18" font-weight="700">${donutPct}%</text>
              </svg>
              <div class="soft-donut-title">${scopedMachine ? esc(scopedMachine.name) : 'Saúde das Máquinas'}</div>
              <div class="soft-donut-numbers">
                <span class="${donutPct < 100 ? 'total' : 'used'}">${scopedMachine ? 'Visão Individual' : `1 PC + ${totals.vpsCount} VPS`}</span>
              </div>
            </div>

            <div class="soft-bays-box" id="hwSidebarSummaryBox">
              <div class="soft-bay-row"><span>Escopo</span><span style="color:var(--hc-accent-text);">${scopedMachine ? '1 Máquina' : `Total (${totals.count})`}</span></div>
              <div class="soft-bay-row"><span>Potência CPU</span><span>${activeMetrics.cpuMhz.toLocaleString('pt-BR')} MHz</span></div>
              <div class="soft-bay-row"><span>Consumo</span><span style="color:#f5ba66;">⚡ ${activeMetrics.watts} W</span></div>
              <div class="soft-bay-row"><span>Gasto / Dia</span><span style="color:#ff8e88;">$${activeMetrics.dailyCost}/dia</span></div>
              <div class="soft-bay-row"><span>Gasto / Mês</span><span style="color:#ff8e88;">$${activeMetrics.monthlyCost.toLocaleString('pt-BR')}</span></div>
            </div>

            <div class="soft-tool-tiles">
              <button type="button" class="soft-tool-tile" onclick="window.hardwareEngine.setTab('buy_vps')">
                ${ic('cloud')}
                <span>+ Nova VPS</span>
              </button>
              <button type="button" id="btnRepairHardware" class="soft-tool-tile ${healthPct < 100 ? 'danger' : ''}" ${!canRepair ? 'disabled style="opacity:0.45;cursor:not-allowed;"' : ''} onclick="window.handleRepairHardware()">
                ${ic('wrench')}
                <span>${healthPct < 100 ? `Consertar ($${repairCost})` : 'Peças Intactas'}</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    `;
  }
}

window.HARDWARE_CATALOG = HARDWARE_CATALOG;
window.hardwareEngine = new HardwareEngine();

window.handlePurchaseVpsFromHardware = function (typeKey) {
  if (!window.lanServersEngine) return null;
  const res = window.lanServersEngine.purchaseServer(typeKey);
  if (res && res.success && window.hardwareEngine) {
    window.hardwareEngine.activeTab = 'overview';
    window.hardwareEngine.selectedScope = 'all';
    window.hardwareEngine.rerender();
  }
  return res;
};

window.handleRepairHardware = function () {
  if (!window.hardwareEngine) return null;
  const res = window.hardwareEngine.repairHardware();
  if (!res.success) {
    alert(res.message);
  } else if (typeof window.showToast === 'function') {
    window.showToast(res.message);
  }
  return res;
};
