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

  setTab(tabKey) {
    this.activeTab = tabKey || 'overview';
    const bal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
    this.renderWorkbench('hardwareWorkbenchBody', bal);
  }

  renderWorkbench(containerId, currentBalance) {
    const el = document.getElementById(containerId);
    if (!el) return;
    this.ensureForProfile();
    if (!this.activeTab) this.activeTab = 'overview';

    const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const ic = (n) => (window.HC && window.HC.icon ? window.HC.icon(n) : '');

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

    // Donut SVG de Integridade Física das Peças
    const r = 46;
    const c = +(2 * Math.PI * r).toFixed(2);
    const offset = +(c - (healthPct / 100) * c).toFixed(2);
    const strokeColor = healthPct >= 85 ? '#35b877' : (healthPct >= 55 ? '#f0a03a' : '#e5534b');

    const catMeta = {
      cpu:     { label: 'Processador (CPU)', tabLabel: 'Comprar CPU', icon: 'cpu', glyph: 'attack', cur: cpu, specFn: (i) => `${i.mhz.toLocaleString('pt-BR')} MHz`, curVal: `${effCpu.toLocaleString('pt-BR')} MHz` },
      ram:     { label: 'Memória RAM',       tabLabel: 'Comprar RAM', icon: 'layers', glyph: 'defense', cur: ram, specFn: (i) => i.ramMb >= 1024 ? `${+(i.ramMb / 1024).toFixed(0)} GB (${i.ramMb.toLocaleString('pt-BR')} MB)` : `${i.ramMb} MB`, curVal: `${usedRam}/${ram.ramMb} MB` },
      hdd:     { label: 'Armazenamento',     tabLabel: 'Comprar Disco', icon: 'hard-drive', glyph: 'stealth', cur: hdd, specFn: (i) => i.hddMb >= 1024 ? `${+(i.hddMb / 1024).toFixed(1)} GB` : `${i.hddMb} MB`, curVal: `${usedHdd}/${hdd.hddMb} MB` },
      network: { label: 'Link de Internet',  tabLabel: 'Upgrade Rede', icon: 'wifi', glyph: 'defense', cur: net, specFn: (i) => `${i.mbps} Mbit/s`, curVal: `${effNet} Mbit/s` }
    };

    let mainColHtml = '';

    if (this.activeTab === 'overview') {
      const overviewRows = ['cpu', 'ram', 'hdd', 'network'].map((cat) => {
        const m = catMeta[cat];
        const list = this.catalog[cat];
        const curIdx = list.findIndex((x) => x.id === this.current[cat]);
        const nextItem = curIdx >= 0 && curIdx < list.length - 1 ? list[curIdx + 1] : null;
        const canBuyNext = nextItem && currentBalance >= nextItem.price;

        return `
          <tr class="row-running">
            <td class="soft-col-icon">
              <span class="soft-mini-glyph kind-${m.glyph}" data-tip-title="${esc(m.label)}" data-tip-meta="${esc(m.curVal)}" data-tip-desc="${esc(m.cur.desc)}">
                ${ic(m.icon)}
              </span>
            </td>
            <td>
              <span class="soft-name-trigger" tabindex="0" data-tip-title="${esc(m.cur.name)}" data-tip-meta="${esc(m.label)}" data-tip-desc="${esc(m.cur.desc)}">
                <span class="soft-run-dot"></span>
                <span>${esc(m.cur.name)}</span>
              </span>
            </td>
            <td class="soft-col-size" style="width:130px;">${esc(m.specFn(m.cur))}</td>
            <td class="soft-col-size" style="width:165px;color:var(--hc-text-2);">
              ${nextItem ? `<span class="mono">${esc(m.specFn(nextItem))} · <strong style="color:var(--hc-warning-text);">$${nextItem.price.toLocaleString('pt-BR')}</strong></span>` : `<span class="hc-badge success">Topo Máximo</span>`}
            </td>
            <td class="soft-col-acts">
              <div class="soft-icon-actions">
                <button type="button" class="soft-icon-act ic-info" aria-label="Ver catálogo de ${esc(m.label)}"
                  data-tip-title="Ver opções de ${esc(m.label)}" data-tip-meta="${list.length} modelos"
                  data-tip-desc="Abrir lista completa de peças e preços para ${esc(m.label)}."
                  onclick="window.hardwareEngine.setTab('${cat}')">${ic('info')}</button>
                ${nextItem ? `
                  <button type="button" class="soft-icon-act ${canBuyNext ? 'ic-run' : 'ic-move'}" aria-label=" Evoluir ${esc(m.label)}"
                    data-tip-title="${canBuyNext ? `Comprar ${esc(nextItem.name)}` : `Ver upgrade ($${nextItem.price.toLocaleString('pt-BR')})`}"
                    data-tip-meta="$${nextItem.price.toLocaleString('pt-BR')}"
                    data-tip-desc="${esc(nextItem.desc)}"
                    onclick="${canBuyNext ? `buyHardwareUpgrade('${cat}', '${nextItem.id}', ${nextItem.price})` : `window.hardwareEngine.setTab('${cat}')`}">
                    ${ic(canBuyNext ? 'shopping-cart' : 'arrow-up')}
                  </button>
                ` : ''}
              </div>
            </td>
          </tr>
        `;
      }).join('');

      mainColHtml = `
        <div class="soft-table-wrap" role="region" aria-label="Componentes instalados no seu servidor">
          <table class="soft-table clean-hw-table">
            <thead>
              <tr>
                <th class="soft-col-icon"></th>
                <th>Peça Instalada no Meu Servidor</th>
                <th class="soft-col-size" style="width:130px;">Capacidade</th>
                <th class="soft-col-size" style="width:165px;">Próximo Nível</th>
                <th class="soft-col-acts">Ações</th>
              </tr>
            </thead>
            <tbody>${overviewRows}</tbody>
          </table>
        </div>
      `;
    } else {
      const cat = catMeta[this.activeTab] ? this.activeTab : 'cpu';
      const m = catMeta[cat];
      const list = this.catalog[cat];
      const curIdx = list.findIndex((x) => x.id === this.current[cat]);

      const rows = list.map((item, idx) => {
        const isCurrent = idx === curIdx;
        const isLower = idx < curIdx;
        const canBuy = !isCurrent && !isLower && currentBalance >= item.price;
        const priceStr = item.price === 0 ? 'Inicial' : `$ ${item.price.toLocaleString('pt-BR')}`;

        return `
          <tr class="${isCurrent ? 'row-running' : ''} ${isLower ? 'row-hidden' : ''}">
            <td class="soft-col-icon">
              <span class="soft-mini-glyph kind-${m.glyph}" data-tip-title="${esc(item.name)}" data-tip-meta="${esc(priceStr)}" data-tip-desc="${esc(item.desc)}">
                ${ic(m.icon)}
              </span>
            </td>
            <td>
              <span class="soft-name-trigger" tabindex="0" data-tip-title="${esc(item.name)}" data-tip-meta="${esc(m.specFn(item))}" data-tip-desc="${esc(item.desc)}">
                ${isCurrent ? '<span class="soft-run-dot"></span>' : ''}
                <span>${esc(item.name)}</span>
              </span>
            </td>
            <td class="soft-col-size" style="width:135px;">${esc(m.specFn(item))}</td>
            <td class="soft-col-size" style="width:120px;color:${item.price === 0 ? 'var(--hc-text-3)' : 'var(--hc-warning-text)'};white-space:nowrap;">${esc(priceStr)}</td>
            <td class="soft-col-acts">
              ${isCurrent
                ? `<span class="hc-badge success">Instalado</span>`
                : (isLower
                    ? `<span style="font-size:11.5px;color:var(--hc-text-3);">Superado</span>`
                    : `<div class="soft-icon-actions">
                         <button type="button" class="soft-icon-act ic-info" aria-label="Detalhes de ${esc(item.name)}"
                           data-tip-title="${esc(item.name)}" data-tip-meta="${esc(m.specFn(item))}" data-tip-desc="${esc(item.desc)}">
                           ${ic('info')}
                         </button>
                         <button type="button" class="soft-icon-act ic-run" ${!canBuy ? 'disabled' : ''} aria-label="Comprar ${esc(item.name)}"
                           data-tip-title="${canBuy ? 'Comprar e instalar agora' : `Saldo insuficiente (faltam $ ${Math.ceil(item.price - currentBalance).toLocaleString('pt-BR')})`}"
                           data-tip-meta="${esc(priceStr)}" data-tip-desc="${esc(item.desc)}"
                           onclick="buyHardwareUpgrade('${cat}', '${item.id}', ${item.price})">
                           ${ic('shopping-cart')}
                         </button>
                       </div>`)}
            </td>
          </tr>
        `;
      }).join('');

      mainColHtml = `
        <div class="soft-table-wrap" role="region" aria-label="Catálogo de ${esc(m.label)}">
          <table class="soft-table clean-hw-table">
            <thead>
              <tr>
                <th class="soft-col-icon"></th>
                <th>Modelo · ${esc(m.label)}</th>
                <th class="soft-col-size" style="width:135px;">Capacidade</th>
                <th class="soft-col-size" style="width:120px;">Preço</th>
                <th class="soft-col-acts">Ações</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    el.innerHTML = `
      <div class="soft-frame" id="hardwareExplorerMain">
        <div class="soft-tabs-bar">
          <div class="soft-tabs-left" role="tablist" aria-label="Categorias de Hardware">
            <button type="button" class="soft-tab-btn ${this.activeTab === 'overview' ? 'active' : ''}" onclick="window.hardwareEngine.setTab('overview')">
              ${ic('server')} <span>Meu Servidor</span>
            </button>
            <button type="button" class="soft-tab-btn ${this.activeTab === 'cpu' ? 'active' : ''}" onclick="window.hardwareEngine.setTab('cpu')">
              ${ic('cpu')} <span>Comprar CPU</span>
            </button>
            <button type="button" class="soft-tab-btn ${this.activeTab === 'ram' ? 'active' : ''}" onclick="window.hardwareEngine.setTab('ram')">
              ${ic('layers')} <span>Comprar RAM</span>
            </button>
            <button type="button" class="soft-tab-btn ${this.activeTab === 'hdd' ? 'active' : ''}" onclick="window.hardwareEngine.setTab('hdd')">
              ${ic('hard-drive')} <span>Comprar Disco</span>
            </button>
            <button type="button" class="soft-tab-btn ${this.activeTab === 'network' ? 'active' : ''}" onclick="window.hardwareEngine.setTab('network')">
              ${ic('wifi')} <span>Upgrade Rede</span>
            </button>
          </div>
          <span class="mono" style="font-size:12px;color:var(--hc-accent-text);">Saldo: $ ${Number(currentBalance || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
        </div>

        <div class="soft-explorer-shell">
          <div class="soft-main-col">
            ${healthPct < 100 ? `
              <div class="soft-feedback-banner" style="background:rgba(208,68,58,0.16);border-color:rgba(229,83,75,0.45);color:#ff9b95;">
                <span>⚠️ Peças danificadas por ataque DDoS (${healthPct}% de integridade). Velocidade reduzida até o reparo!</span>
                <button type="button" id="btnRepairHardwareBanner" class="hc-btn sm" style="background:var(--hc-warning);border-color:var(--hc-warning);color:#101418;font-weight:700;opacity:1;" ${!canRepair ? 'disabled' : ''} onclick="window.handleRepairHardware()">
                  Consertar ($ ${repairCost.toLocaleString('pt-BR')})
                </button>
              </div>
            ` : ''}
            ${mainColHtml}
          </div>

          <aside class="soft-side-bar" id="hardwareHealthCard">
            <div class="soft-donut-wrap">
              <svg class="soft-donut-svg" viewBox="0 0 116 116" aria-label="Saúde do Hardware ${healthPct}%">
                <circle cx="58" cy="58" r="${r}" fill="none" stroke="#222832" stroke-width="8"></circle>
                <circle cx="58" cy="58" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="8"
                  stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}" transform="rotate(-90 58 58)"></circle>
                <text id="hwHealthPctLabel" x="58" y="63" text-anchor="middle" fill="#ebeff4" font-family="var(--hc-font-mono)" font-size="18" font-weight="700">${healthPct}%</text>
              </svg>
              <div class="soft-donut-title">Saúde das Peças</div>
              <div class="soft-donut-numbers">
                <span class="${healthPct < 100 ? 'total' : 'used'}">${healthPct < 100 ? 'Danificado DDoS' : '100% Nominal'}</span>
              </div>
            </div>

            <div class="soft-bays-box">
              <div class="soft-bay-row"><span>CPU</span><span style="color:var(--hc-accent-text);">${effCpu.toLocaleString('pt-BR')} MHz</span></div>
              <div class="soft-bay-row"><span>Uso RAM</span><span>${usedRam}/${ram.ramMb} MB</span></div>
              <div class="soft-bay-row"><span>Uso Disco</span><span>${usedHdd}/${hdd.hddMb} MB</span></div>
              <div class="soft-bay-row"><span>Internet</span><span style="color:var(--hc-info-text);">${effNet} Mbit/s</span></div>
            </div>

            <div class="soft-tool-tiles">
              <button type="button" class="soft-tool-tile" onclick="navTo('winSoftware');if(window.softwareEngine){window.softwareEngine.activeTab='xhd';window.softwareEngine.renderUI();}">
                ${ic('hard-drive')}
                <span>HD Externo</span>
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
