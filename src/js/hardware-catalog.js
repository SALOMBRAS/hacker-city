/**
 * Hacker City // Catálogo de Hardware & Upgrades de Setup
 * Controla os componentes de máquina e seus bônus de desempenho
 */
const HARDWARE_CATALOG = {
  cpu: [
    { id: 'celeron_800', name: 'Intel Celeron 800MHz (Sucata)', price: 0, cooldown_ms: 4000, desc: 'Processador de lixão. Cooldown de 4.0s por invasão.' },
    { id: 'pentium_4', name: 'Intel Pentium 4 2.8GHz', price: 250, cooldown_ms: 3200, desc: 'Clássico socket 478. Reduz cooldown para 3.2s.' },
    { id: 'core_2_quad', name: 'Intel Core 2 Quad Q6600', price: 650, cooldown_ms: 2400, desc: '4 núcleos reais. Reduz cooldown para 2.4s.' },
    { id: 'xeon_server', name: 'Dual Xeon E5 Clandestino', price: 1800, cooldown_ms: 1600, desc: 'Poder de servidor rack. Cooldown reduzido para 1.6s.' },
    { id: 'quantum_core', name: 'Quantum Core QX-99 Prototype', price: 5500, cooldown_ms: 1000, desc: 'Processador quântico de laboratório. Cooldown mínimo de 1.0s.' }
  ],
  ram: [
    { id: 'ram_256mb', name: '256MB SDRAM PC133', price: 0, desc: 'Memória mínima. Limite de 1 tarefa em segundo plano.' },
    { id: 'ram_1gb', name: '1GB DDR 400MHz', price: 180, desc: 'Permite rodar scripts secundários no terminal.' },
    { id: 'ram_4gb', name: '4GB DDR2 Dual Channel', price: 420, desc: '+15% de velocidade geral em decodificação.' },
    { id: 'ram_16gb', name: '16GB DDR4 Corsair Vengeance', price: 1200, desc: '+25% de rendimento na rede de bots zumbi.' },
    { id: 'ram_64gb', name: '64GB ECC Server Registered', price: 3200, desc: 'Capacidade máxima para minerar em múltiplos nós.' }
  ],
  network: [
    { id: 'net_56k', name: 'Modem Discado 56kbps V.90', price: 0, desc: 'Conexão discada ruidosa. Alta latência.' },
    { id: 'net_fast_100', name: 'Placa de Rede Realtek 100Mbps', price: 140, desc: 'Banda larga inicial cabeada.' },
    { id: 'net_gigabit', name: 'Adaptador Gigabit 1000Mbps', price: 450, desc: '+20% de grana coletada por segundo em ataques.' },
    { id: 'net_fiber_10g', name: 'Fibra Óptica Direta 10Gbps Darknet', price: 2100, desc: '+40% de bônus em transações e invasões corporativas.' }
  ]
};

class HardwareEngine {
  constructor() {
    this.catalog = HARDWARE_CATALOG;
    this.current = this.loadRig();
  }

  loadRig() {
    try {
      const saved = localStorage.getItem('HC_HARDWARE_RIG');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      cpu: 'celeron_800',
      ram: 'ram_256mb',
      network: 'net_56k'
    };
  }

  saveRig(rig) {
    this.current = { ...this.current, ...rig };
    try {
      localStorage.setItem('HC_HARDWARE_RIG', JSON.stringify(this.current));
    } catch (e) {}
  }

  getCpu() {
    return this.catalog.cpu.find(c => c.id === this.current.cpu) || this.catalog.cpu[0];
  }

  getRam() {
    return this.catalog.ram.find(r => r.id === this.current.ram) || this.catalog.ram[0];
  }

  getNetwork() {
    return this.catalog.network.find(n => n.id === this.current.network) || this.catalog.network[0];
  }

  getCooldownMs() {
    return this.getCpu().cooldown_ms || 4000;
  }

  getBannerText() {
    const cpu = this.getCpu();
    const ram = this.getRam();
    const net = this.getNetwork();
    return `🖥️ ${cpu.name.toUpperCase()} // ${ram.name.toUpperCase()} // ${net.name.toUpperCase()}`;
  }

  renderWorkbench(containerId, currentBalance) {
    const el = document.getElementById(containerId);
    if (!el) return;

    let html = `
      <div style="background: rgba(53, 184, 119,0.08); border: 1px solid var(--cyan-neon); border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem;">
        <div style="font-family: var(--hc-font-sans); font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">SETUP ATUAL DO OPERADOR</div>
        <div style="font-family: var(--hc-font-mono); font-size: 0.85rem; color: var(--green-safe); display: flex; flex-direction: column; gap: 0.25rem;">
          <div>⚡ <strong>CPU:</strong> ${this.getCpu().name} (${(this.getCooldownMs() / 1000).toFixed(1)}s cooldown)</div>
          <div>💾 <strong>RAM:</strong> ${this.getRam().name}</div>
          <div>🌐 <strong>REDE:</strong> ${this.getNetwork().name}</div>
        </div>
      </div>
    `;

    ['cpu', 'ram', 'network'].forEach(category => {
      const titles = { cpu: '⚡ PROCESSADORES (CPU)', ram: '💾 MÓDULOS DE MEMÓRIA (RAM)', network: '🌐 INTERFACES DE REDE' };
      html += `<div style="font-family: var(--hc-font-sans); font-size: 0.95rem; color: var(--cyan-neon); margin: 1rem 0 0.5rem 0;">${titles[category]}</div>`;
      html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.75rem;">`;

      this.catalog[category].forEach(item => {
        const isCurrent = this.current[category] === item.id;
        const canBuy = !isCurrent && currentBalance >= item.price;
        html += `
          <div style="background: #111418; border: 1px solid ${isCurrent ? 'var(--green-safe)' : '#262c35'}; border-radius: 6px; padding: 0.85rem; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <span style="font-weight: bold; color: ${isCurrent ? 'var(--green-safe)' : '#fff'}; font-size: 0.9rem;">${item.name}</span>
                <span style="font-family: var(--hc-font-mono); font-size: 0.82rem; color: ${item.price === 0 ? '#aab3c0' : 'var(--amber-warn)'};">
                  ${item.price === 0 ? 'PADRÃO' : '$ ' + item.price + ' HC'}
                </span>
              </div>
              <div style="font-size: 0.78rem; color: #aab3c0; line-height: 1.3; margin-bottom: 0.75rem;">${item.desc}</div>
            </div>
            <div>
              ${isCurrent ? 
                `<button disabled style="width: 100%; background: rgba(53, 184, 119,0.2); border: 1px solid var(--green-safe); color: var(--green-safe); padding: 0.4rem; border-radius: 4px; font-weight: bold; font-size: 0.78rem;">INSTALADO NO RIG</button>` :
                `<button ${!canBuy ? 'disabled' : ''} onclick="buyHardwareUpgrade('${category}', '${item.id}', ${item.price})" class="btn-submit" style="width: 100%; margin: 0; padding: 0.4rem; font-size: 0.78rem; ${!canBuy ? 'opacity: 0.4; cursor: not-allowed;' : ''}">
                  ${currentBalance >= item.price ? 'COMPRAR & INSTALAR' : 'SALDO INSUFICIENTE'}
                </button>`
              }
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
