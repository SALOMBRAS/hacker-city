/**
 * Hacker City // Catálogo de Hardware, Armazenamento (HDD/SSD) & Velocidade de Internet
 * Define especificações físicas reais (CPU MHz, RAM MB, HDD MB, NET Mbit/s) e preços difíceis de progressão MMO
 */
const HARDWARE_CATALOG = {
  cpu: [
    { id: 'celeron_800', name: 'Intel Celeron 800MHz (Sucata)', mhz: 800, price: 0, cooldown_ms: 4000, desc: '800 MHz · Processador básico de sucata. Cooldown 4.0s.' },
    { id: 'pentium_4', name: 'Intel Pentium 4 2.0GHz', mhz: 2000, price: 950, cooldown_ms: 3200, desc: '2.000 MHz · Acelera compilação, quebra e processos locais.' },
    { id: 'core_2_quad', name: 'Intel Core 2 Quad 4.0GHz', mhz: 4000, price: 3400, cooldown_ms: 2400, desc: '4.000 MHz · 4 núcleos reais para operações pesadas.' },
    { id: 'xeon_server', name: 'Dual Xeon E5 Rack 8.0GHz', mhz: 8000, price: 12500, cooldown_ms: 1600, desc: '8.000 MHz · Servidor empresarial de alta densidade.' },
    { id: 'quantum_core', name: 'Quantum Core QX-99 (16.0GHz)', mhz: 16000, price: 42000, cooldown_ms: 1000, desc: '16.000 MHz · Topo absoluto de processamento clandestino.' }
  ],
  ram: [
    { id: 'ram_256mb', name: '256 MB SDRAM PC133', ramMb: 256, price: 0, desc: '256 MB · Memória apertada: softwares v2.0+ ou malwares lotam rápido.' },
    { id: 'ram_1gb', name: '1.024 MB (1 GB) DDR', ramMb: 1024, price: 850, desc: '1.024 MB · Espaço para rodar Cracker, Firewall, AV e Collector juntos.' },
    { id: 'ram_4gb', name: '4.096 MB (4 GB) Dual Channel', ramMb: 4096, price: 3200, desc: '4.096 MB · Suporta utilitários pesquisados até v5.0+.' },
    { id: 'ram_16gb', name: '16.384 MB (16 GB) DDR4', ramMb: 16384, price: 11000, desc: '16.384 MB · Folga ampla para suíte completa de alta potência.' },
    { id: 'ram_64gb', name: '65.536 MB (64 GB) ECC Server', ramMb: 65536, price: 36000, desc: '65.536 MB · Memória registrada de servidor enterprise.' }
  ],
  hdd: [
    { id: 'hdd_350mb', name: 'HD IDE 350 MB (Sucata)', hddMb: 350, price: 0, desc: '350 MB · Disco quase cheio (~288 MB ocupados pelos programas iniciais).' },
    { id: 'hdd_1gb', name: 'HD SATA 1.024 MB (1 GB)', hddMb: 1024, price: 750, desc: '1.024 MB · Permite compilar vírus e softwares de média potência.' },
    { id: 'hdd_4gb', name: 'SSD 4.096 MB (4 GB)', hddMb: 4096, price: 2800, desc: '4.096 MB · Armazena famílias completas de vírus pesados.' },
    { id: 'hdd_16gb', name: 'NVMe M.2 16.384 MB (16 GB)', hddMb: 16384, price: 9800, desc: '16.384 MB · Capacidade industrial para payloads até v8.0.' },
    { id: 'hdd_64gb', name: 'RAID Storage 65.536 MB (64 GB)', hddMb: 65536, price: 32000, desc: '65.536 MB · Cofre massivo para todas as versões máximas v10.0.' }
  ],
  network: [
    { id: 'net_56k', name: 'Link Discado / Rádio 1 Mbit/s', mbps: 1, price: 0, desc: '1 Mbit/s (~0.15 MB/s) · Upload lento de vírus grandes via SSH.' },
    { id: 'net_fast_10', name: 'ADSL Cabo 10 Mbit/s', mbps: 10, price: 650, desc: '10 Mbit/s (~1.25 MB/s) · Reduz bastante o tempo de upload de vírus.' },
    { id: 'net_fast_100', name: 'Fibra Óptica 100 Mbit/s', mbps: 100, price: 2900, desc: '100 Mbit/s (~12.5 MB/s) · Upload ágil de payloads pesados.' },
    { id: 'net_gigabit', name: 'Link Dedicado 500 Mbit/s', mbps: 500, price: 11500, desc: '500 Mbit/s (~62 MB/s) · Transferência corporativa de alta banda.' },
    { id: 'net_fiber_10g', name: 'Backbone Gigabit 1.000 Mbit/s', mbps: 1000, price: 38000, desc: '1.000 Mbit/s (~125 MB/s) · Envio quase instantâneo na sub-rede.' }
  ]
};

class HardwareEngine {
  constructor() {
    this.catalog = HARDWARE_CATALOG;
    this.userId = null;
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
    return Math.max(0.5, +(this.getNetwork().mbps * this.getHealthMultiplier()).toFixed(1));
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
    const dmg = Math.max(8, Math.min(65, Math.round(Number(damagePct || 35))));
    const next = Math.max(20, prev - dmg);
    this.saveRig({ healthPct: next, lastDdosBy: attackerLabel });

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
    if (typeof window.addLocalLog === 'function') {
      window.addLocalLog('HARDWARE-REPAIR', `Peças danificadas por DDoS consertadas (100% integridade): -$ ${cost} HC`, 'success');
    }
    if (window.hackerAudio && typeof window.hackerAudio.playCashChime === 'function') {
      window.hackerAudio.playCashChime();
    }
    if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
    if (typeof window.updateHardwareDisplay === 'function') window.updateHardwareDisplay();
    if (window.onlineEngine) window.onlineEngine.scheduleSave(true);
    return { success: true, cost, healthPct: 100, message: `🔧 Peças consertadas! Integridade restaurada para 100% (-$ ${cost} HC).` };
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
    const cpu = this.getCpu();
    const ram = this.getRam();
    const hdd = this.getHdd();
    const net = this.getNetwork();
    const health = this.getHealthPct();
    return `${this.getEffectiveCpuMhz()}MHz CPU${health < 100 ? ` (${health}% SAÚDE!)` : ''} // ${ram.ramMb}MB RAM // ${hdd.hddMb}MB HDD // NET ${this.getEffectiveNetMbps()}Mbps`;
  }

  renderWorkbench(containerId, currentBalance) {
    const el = document.getElementById(containerId);
    if (!el) return;
    this.ensureForProfile();

    const cpu = this.getCpu();
    const ram = this.getRam();
    const hdd = this.getHdd();
    const net = this.getNetwork();
    const healthPct = this.getHealthPct();
    const effCpu = this.getEffectiveCpuMhz();
    const effNet = this.getEffectiveNetMbps();
    const repairCost = this.getRepairCost();
    const canRepair = healthPct < 100 && currentBalance >= repairCost;
    const usedHdd = window.softwareEngine ? window.softwareEngine.getUsedHddMb() : 0;
    const usedRam = window.softwareEngine ? window.softwareEngine.getUsedRamMb() : 0;

    const healthColor = healthPct >= 85 ? 'var(--hc-accent)' : (healthPct >= 55 ? 'var(--hc-warning)' : 'var(--hc-danger)');

    let html = `
      <div id="hardwareHealthCard" class="hc-card" style="padding: 1.05rem 1.15rem; margin-bottom: 1rem; border-color: ${healthPct < 100 ? 'var(--hc-danger)' : 'rgba(53, 184, 119, 0.38)'}; background: ${healthPct < 100 ? 'rgba(208, 68, 58, 0.08)' : 'transparent'};">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:8px;">
          <div>
            <div class="hc-eyebrow">Integridade Física das Peças (Proteção contra Sobrecarga DDoS)</div>
            <div style="font-size:0.9rem;margin-top:2px;">
              Saúde atual do PC: <strong id="hwHealthPctLabel" style="color:${healthPct < 100 ? 'var(--hc-danger-text)' : 'var(--hc-accent-text)'};font-family:var(--hc-font-mono);">${healthPct}%</strong>
              ${healthPct < 100
                ? `<span style="color:var(--hc-warning);font-size:0.8rem;margin-left:8px;">⚠️ Danificado por DDoS${this.current.lastDdosBy ? ` (${this.current.lastDdosBy})` : ''}! Sua CPU e Internet estão operando em marcha reduzida!</span>`
                : `<span style="color:var(--hc-text-2);font-size:0.8rem;margin-left:8px;">✓ Todas as peças operando a 100% da velocidade nominal.</span>`}
            </div>
          </div>
          <div>
            ${healthPct < 100
              ? `<button type="button" id="btnRepairHardware" ${!canRepair ? 'disabled' : ''} onclick="window.handleRepairHardware()" class="hc-btn ${canRepair ? 'primary' : 'ghost'} sm" style="${canRepair ? 'background:var(--hc-warning);border-color:var(--hc-warning);color:#101418;font-weight:700;' : ''}">
                   🔧 Consertar Peças Danificadas ($ ${repairCost.toLocaleString('pt-BR')} HC)
                 </button>`
              : `<span class="hc-badge success">✓ Peças Intactas (100%)</span>`}
          </div>
        </div>
        <div style="height:9px;background:var(--hc-inset);border-radius:999px;overflow:hidden;border:1px solid var(--hc-border);">
          <div style="height:100%;width:${healthPct}%;background:${healthColor};transition:width 0.25s ease;"></div>
        </div>
      </div>

      <div class="hc-card" style="padding: 1.15rem; margin-bottom: 1.25rem; border-color: rgba(53, 184, 119, 0.35);">
        <div class="hc-eyebrow" style="margin-bottom: 0.45rem;">Ficha Física Atual do Seu PC</div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-family: var(--hc-font-mono); font-size: 0.82rem;">
          <div><span style="color:var(--hc-text-3);">CPU EFETIVA:</span> <strong style="color:${healthPct < 100 ? 'var(--hc-warning)' : 'var(--hc-text)'};">${effCpu.toLocaleString('pt-BR')} MHz</strong>${healthPct < 100 ? ` <span style="color:var(--hc-text-3);font-size:0.73rem;">(de ${cpu.mhz} MHz)</span>` : ''}</div>
          <div><span style="color:var(--hc-text-3);">RAM:</span> <strong>${usedRam} / ${ram.ramMb} MB</strong></div>
          <div><span style="color:var(--hc-text-3);">DISCO (HDD):</span> <strong>${usedHdd} / ${hdd.hddMb} MB</strong></div>
          <div><span style="color:var(--hc-text-3);">INTERNET EFETIVA:</span> <strong style="color:${healthPct < 100 ? 'var(--hc-warning)' : 'var(--hc-text)'};">${effNet} Mbit/s</strong> (~${(effNet / 8).toFixed(2)} MB/s)</div>
        </div>
      </div>
    `;

    const titles = {
      cpu: '1. PROCESSADORES (CPU — Acelera o TEMPO de Quebra/Logs/Scan; potência depende da versão do Software!)',
      ram: '2. MEMÓRIA RAM (Limite de Softwares Ativos Simultâneos)',
      hdd: '3. ARMAZENAMENTO HDD / SSD (Espaço p/ Vírus & Binários Fortes)',
      network: '4. VELOCIDADE DE INTERNET (Tempo de Download & Upload SSH/FTP)'
    };

    ['cpu', 'ram', 'hdd', 'network'].forEach((category) => {
      const list = this.catalog[category];
      const curIdx = list.findIndex((i) => i.id === this.current[category]);

      html += `<div class="hc-eyebrow" style="margin: 1.1rem 0 0.5rem;">${titles[category]}</div>`;
      html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(265px, 1fr)); gap: 0.75rem;">`;

      list.forEach((item, idx) => {
        const isCurrent = idx === curIdx;
        const isLower = idx < curIdx;
        const canBuy = !isCurrent && !isLower && currentBalance >= item.price;

        html += `
          <div class="hc-card" style="padding: 0.9rem 1rem; border-color: ${isCurrent ? 'var(--hc-accent)' : 'var(--hc-border)'}; opacity: ${isLower ? '0.5' : '1'}; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 0.35rem;">
                <strong style="color: ${isCurrent ? 'var(--hc-accent-text)' : 'var(--hc-text)'}; font-size: 0.88rem;">${item.name}</strong>
                <span style="font-family: var(--hc-font-mono); font-size: 0.8rem; color: ${item.price === 0 ? 'var(--hc-text-3)' : 'var(--hc-warning)'};">
                  ${item.price === 0 ? 'INICIAL' : '$ ' + item.price.toLocaleString('pt-BR') + ' HC'}
                </span>
              </div>
              <div style="font-size: 0.78rem; color: var(--hc-text-2); line-height: 1.35; margin-bottom: 0.75rem;">${item.desc}</div>
            </div>
            <div>
              ${isCurrent
                ? `<button type="button" disabled class="hc-btn sm" style="width:100%; border-color:var(--hc-accent); color:var(--hc-accent-text);">INSTALADO NO SEU PC</button>`
                : (isLower
                    ? `<button type="button" disabled class="hc-btn ghost sm" style="width:100%;">SUPERADO</button>`
                    : `<button type="button" ${!canBuy ? 'disabled' : ''} onclick="buyHardwareUpgrade('${category}', '${item.id}', ${item.price})" class="hc-btn ${canBuy ? 'primary' : 'ghost'} sm" style="width:100%;">
                         ${canBuy ? `Comprar ($ ${item.price.toLocaleString('pt-BR')})` : `Faltam $ ${Math.ceil(item.price - currentBalance).toLocaleString('pt-BR')}`}
                       </button>`)}
            </div>
          </div>
        `;
      });
      html += `</div>`;
    });

    el.innerHTML = html;
  }
}

window.HARDWARE_CATALOG = HARDWARE_CATALOG;
window.hardwareEngine = new HardwareEngine();

window.handleRepairHardware = function () {
  if (!window.hardwareEngine) return null;
  const res = window.hardwareEngine.repairHardware();
  if (!res.success) {
    if (window.hackerAudio && typeof window.hackerAudio.playErrorBuzz === 'function') window.hackerAudio.playErrorBuzz();
    if (typeof window.showToast === 'function') window.showToast('⚠️ ' + res.message);
    return res;
  }
  if (typeof window.showToast === 'function') window.showToast(res.message);
  return res;
};
