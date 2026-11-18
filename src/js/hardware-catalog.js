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
    this.current = this.loadRig();
  }

  loadRig() {
    const defaults = {
      cpu: 'celeron_800',
      ram: 'ram_256mb',
      hdd: 'hdd_350mb',
      network: 'net_56k'
    };
    try {
      const saved = localStorage.getItem('HC_HARDWARE_RIG');
      if (saved) return { ...defaults, ...JSON.parse(saved) };
    } catch (e) {}
    return defaults;
  }

  saveRig(rig) {
    this.current = { ...this.current, ...rig };
    try {
      localStorage.setItem('HC_HARDWARE_RIG', JSON.stringify(this.current));
    } catch (e) {}
  }

  getCpu() {
    return this.catalog.cpu.find((c) => c.id === this.current.cpu) || this.catalog.cpu[0];
  }

  getRam() {
    return this.catalog.ram.find((r) => r.id === this.current.ram) || this.catalog.ram[0];
  }

  getHdd() {
    return this.catalog.hdd.find((h) => h.id === this.current.hdd) || this.catalog.hdd[0];
  }

  getNetwork() {
    return this.catalog.network.find((n) => n.id === this.current.network) || this.catalog.network[0];
  }

  getCooldownMs() {
    return this.getCpu().cooldown_ms || 4000;
  }

  getBannerText() {
    const cpu = this.getCpu();
    const ram = this.getRam();
    const hdd = this.getHdd();
    const net = this.getNetwork();
    return `${cpu.mhz}MHz CPU // ${ram.ramMb}MB RAM // ${hdd.hddMb}MB HDD // NET ${net.mbps}Mbps`;
  }

  renderWorkbench(containerId, currentBalance) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const cpu = this.getCpu();
    const ram = this.getRam();
    const hdd = this.getHdd();
    const net = this.getNetwork();
    const usedHdd = window.softwareEngine ? window.softwareEngine.getUsedHddMb() : 0;
    const usedRam = window.softwareEngine ? window.softwareEngine.getUsedRamMb() : 0;

    let html = `
      <div class="hc-card" style="padding: 1.15rem; margin-bottom: 1.25rem; border-color: rgba(53, 184, 119, 0.35);">
        <div class="hc-eyebrow" style="margin-bottom: 0.45rem;">Ficha Física Atual do Seu PC</div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-family: var(--hc-font-mono); font-size: 0.82rem;">
          <div><span style="color:var(--hc-text-3);">CPU:</span> <strong>${cpu.mhz.toLocaleString('pt-BR')} MHz</strong></div>
          <div><span style="color:var(--hc-text-3);">RAM:</span> <strong>${usedRam} / ${ram.ramMb} MB</strong></div>
          <div><span style="color:var(--hc-text-3);">DISCO (HDD):</span> <strong>${usedHdd} / ${hdd.hddMb} MB</strong></div>
          <div><span style="color:var(--hc-text-3);">INTERNET:</span> <strong>${net.mbps} Mbit/s</strong> (~${(net.mbps / 8).toFixed(2)} MB/s)</div>
        </div>
      </div>
    `;

    const titles = {
      cpu: '1. PROCESSADORES (CPU — Acelera Processos & Ataque)',
      ram: '2. MEMÓRIA RAM (Limite de Softwares Ativos Simultâneos)',
      hdd: '3. ARMAZENAMENTO HDD / SSD (Espaço p/ Vírus Fortes)',
      network: '4. VELOCIDADE DE INTERNET (Tempo de Upload SSH de Vírus)'
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
