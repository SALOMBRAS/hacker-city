/**
 * Hacker City // Pilar 1: Servidores & Rede Local (Datacenter, LAN SVG & Honeypot)
 * Página nativa limpa e diagrama vetorial sem sobreposição de nós.
 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtUsd(n) {
    return '$' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  const SERVER_TYPES_CATALOG = {
    vps_starter: {
      type: 'vps_starter',
      name: 'VPS Cloud Starter',
      desc: 'Máquina virtual enxuta na nuvem para aumentar seu poder total e testar automações.',
      cost: 2500,
      dailyCost: 20,
      watts: 78,
      specs: { cpuMhz: 1600, netMbps: 100, hddMb: 1024, ramMb: 512 },
      defaultFwl: 1.5
    },
    vps: {
      type: 'vps',
      name: 'VPS Cloud Descartável',
      desc: 'Instância ágil com IP rotativo para disparar operações sem expor sua máquina principal.',
      cost: 15000,
      dailyCost: 58,
      watts: 175,
      specs: { cpuMhz: 4800, netMbps: 500, hddMb: 4096, ramMb: 2048 },
      defaultFwl: 2.5
    },
    dedicated: {
      type: 'dedicated',
      name: 'Servidor Dedicado em Rack',
      desc: 'Hardware corporativo dedicado de alto desempenho para processamento pesado e mineração.',
      cost: 75000,
      dailyCost: 190,
      watts: 430,
      specs: { cpuMhz: 12000, netMbps: 2000, hddMb: 16384, ramMb: 8192 },
      defaultFwl: 5.0
    },
    mainframe: {
      type: 'mainframe',
      name: 'Mainframe Vault Isolado',
      desc: 'Unidade blindada atrás do switch interno para guardar arquivos sensíveis e backups.',
      cost: 250000,
      dailyCost: 520,
      watts: 820,
      specs: { cpuMhz: 24000, netMbps: 10000, hddMb: 65536, ramMb: 32768 },
      defaultFwl: 8.5
    }
  };

  class LanServersEngine {
    constructor() {
      this.servers = [];
      this.topology = { nodes: [], edges: [] };
      this.isModalOpen = false;
      this.loadedUid = null;
      this.init();
    }

    init() {
      this.ensureSyncedWithProfile();
    }

    ensureSyncedWithProfile() {
      const uid = (window.currentProfile && window.currentProfile.id) || 'guest';
      if (this.loadedUid !== uid) {
        this.loadedUid = uid;
        this.servers = [];
        this.loadFromStorage();
        if (this.servers.length === 0) {
          this.seedInitialServers();
        }
      }
      // Sincroniza o nó primário (PC Principal) com as peças reais do HardwareEngine e IP atual
      const primary = this.servers.find((s) => s.id === 'srv_gateway_01');
      if (primary) {
        if (window.networkIdentity && primary.isGateway) {
          primary.ip = window.networkIdentity.getPublicIp();
        }
        if (window.hardwareEngine) {
          primary.specs = {
            cpuMhz: window.hardwareEngine.getEffectiveCpuMhz(),
            netMbps: window.hardwareEngine.getEffectiveNetMbps(),
            hddMb: window.hardwareEngine.getHdd().hddMb,
            ramMb: window.hardwareEngine.getRam().ramMb
          };
        }
      }
      this.rebuildTopology();
      return this.servers;
    }

    storageKey() {
      const uid = (window.currentProfile && window.currentProfile.id) || 'guest';
      return `HC_LAN_SERVERS_${uid}`;
    }

    loadFromStorage() {
      try {
        const raw = localStorage.getItem(this.storageKey());
        if (raw) {
          const data = JSON.parse(raw);
          this.servers = data.servers || [];
          this.topology = data.topology || { nodes: [], edges: [] };
        }
      } catch (e) {}
    }

    saveToStorage() {
      try {
        localStorage.setItem(this.storageKey(), JSON.stringify({
          servers: this.servers,
          topology: this.topology
        }));
      } catch (e) {}
    }

    seedInitialServers() {
      const myPublicIp = (window.networkIdentity && window.networkIdentity.getPublicIp()) || '187.45.12.90';

      this.servers = [
        {
          id: 'srv_gateway_01',
          label: 'Gateway Principal',
          type: 'desktop',
          ip: myPublicIp,
          internalIp: '10.0.0.1',
          isGateway: true,
          isHoneypot: false,
          specs: { cpuMhz: 2400, netMbps: 100, hddMb: 1024, ramMb: 512 },
          firewallVer: 2.0,
          services: ['ssh', 'routing']
        },
        {
          id: 'srv_honeypot_02',
          label: 'Servidor Isca',
          type: 'vps',
          ip: '185.220.11.10',
          internalIp: '10.0.0.2',
          isGateway: false,
          isHoneypot: true,
          specs: { cpuMhz: 1800, netMbps: 50, hddMb: 512, ramMb: 256 },
          firewallVer: 1.0,
          services: ['trap_logger', 'fake_fs']
        }
      ];

      this.rebuildTopology();
      this.saveToStorage();
    }

    // Posiciona os nós em colunas horizontais bem espaçadas sem NUNCA sobrepor!
    rebuildTopology() {
      const gwServer = this.getGatewayServer();
      const internalServers = this.servers.filter((s) => s !== gwServer);
      const rowStep = 86;
      const totalInternal = Math.max(1, internalServers.length);
      const canvasHeight = Math.max(220, totalInternal * rowStep + 48);
      const centerY = Math.round(canvasHeight / 2);

      const nodes = [];

      if (gwServer) {
        nodes.push({
          id: gwServer.id,
          label: gwServer.label,
          ip: gwServer.ip,
          internalIp: gwServer.internalIp,
          type: gwServer.type,
          isGateway: true,
          isHoneypot: !!gwServer.isHoneypot,
          firewallVer: gwServer.firewallVer,
          x: 340,
          y: centerY
        });
      }

      internalServers.forEach((s, i) => {
        const col = Math.floor(i / 4);
        const rowInCol = i % 4;
        const countInCol = Math.min(4, internalServers.length - col * 4);
        const blockHeight = (countInCol - 1) * rowStep;
        const startY = centerY - Math.round(blockHeight / 2);

        nodes.push({
          id: s.id,
          label: s.label,
          ip: s.ip,
          internalIp: s.internalIp,
          type: s.type,
          isGateway: false,
          isHoneypot: !!s.isHoneypot,
          firewallVer: s.firewallVer,
          x: 640 + col * 220,
          y: startY + rowInCol * rowStep
        });
      });

      const edges = [];
      if (gwServer) {
        internalServers.forEach((s) => {
          edges.push({ from: gwServer.id, to: s.id });
        });
      }

      this.topology = { nodes, edges, canvasHeight, centerY };
    }

    getGatewayServer() {
      return this.servers.find((s) => s.isGateway) || this.servers[0];
    }

    getHoneypotServer() {
      return this.servers.find((s) => s.isHoneypot) || null;
    }

    setGateway(serverId) {
      this.servers.forEach((s) => {
        s.isGateway = s.id === serverId;
      });

      const newGw = this.getGatewayServer();
      if (newGw && window.networkIdentity) {
        window.networkIdentity.publicIp = newGw.ip;
        localStorage.setItem('hc_public_ip', newGw.ip);
      }

      this.rebuildTopology();
      this.saveToStorage();

      if (window.showToast) {
        window.showToast(`Gateway alterado para ${newGw.label} (${newGw.ip}).`, 'success');
      }
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
    }

    toggleHoneypot(serverId) {
      const s = this.servers.find((x) => x.id === serverId);
      if (!s) return;

      if (s.isGateway) {
        if (window.showToast) window.showToast('O servidor Gateway público não pode atuar como isca interna.', 'warning');
        return;
      }

      s.isHoneypot = !s.isHoneypot;
      this.rebuildTopology();
      this.saveToStorage();

      if (window.showToast) {
        window.showToast(`${s.label}: modo Honeypot ${s.isHoneypot ? 'ativado' : 'desativado'}.`, 'info');
      }
      this.renderUI();
    }

    purchaseServer(typeKey) {
      this.ensureSyncedWithProfile();
      const tpl = SERVER_TYPES_CATALOG[typeKey];
      if (!tpl) return { success: false, message: 'Modelo de servidor inválido.' };

      const curBal = window.currentWallet ? parseFloat(window.currentWallet.balance || 0) : 0;
      if (curBal < tpl.cost) {
        if (window.showToast) window.showToast(`Saldo insuficiente. ${tpl.name} custa ${fmtUsd(tpl.cost)}.`, 'danger');
        return { success: false, message: `Saldo insuficiente (${fmtUsd(tpl.cost)}).` };
      }

      if (window.currentWallet) {
        const deductFn = () => {
          window.currentWallet.balance = Math.max(0, +(curBal - tpl.cost).toFixed(2));
        };
        if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
          window.integrityGuard.runAuthorized(deductFn);
        } else {
          deductFn();
        }
      }

      const vpsNumber = this.servers.filter((s) => s.id !== 'srv_gateway_01').length + 1;
      const octet = 10 + this.servers.length;
      const newSrv = {
        id: `srv_${typeKey}_${Date.now()}`,
        label: `${tpl.name} #${vpsNumber}`,
        type: tpl.type === 'vps_starter' ? 'vps' : tpl.type,
        catalogKey: tpl.type,
        ip: `185.220.${octet}.${20 + this.servers.length}`,
        internalIp: `10.0.0.${octet}`,
        isGateway: false,
        isHoneypot: false,
        specs: { ...tpl.specs },
        parts: {},
        firewallVer: tpl.defaultFwl,
        services: ['ssh', typeKey === 'dedicated' ? 'heavy_mining' : 'vault_storage']
      };

      this.servers.push(newSrv);
      this.rebuildTopology();
      this.saveToStorage();

      if (window.hackerAudio && typeof window.hackerAudio.playCashChime === 'function') {
        window.hackerAudio.playCashChime();
      } else if (window.audioEngine && typeof window.audioEngine.playCashChime === 'function') {
        window.audioEngine.playCashChime();
      }
      if (window.showToast) {
        window.showToast(`Nova máquina ativa: ${newSrv.label} adicionada ao seu Hardware!`, 'success');
      }

      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (typeof window.updateHardwareDisplay === 'function') window.updateHardwareDisplay();
      this.renderUI();
      return { success: true, server: newSrv };
    }

    upgradeServerSpec(serverId, category, specVal, partId) {
      this.ensureSyncedWithProfile();
      const srv = this.servers.find((s) => s.id === serverId);
      if (!srv) return false;
      if (!srv.specs) srv.specs = { cpuMhz: 1600, netMbps: 100, hddMb: 1024, ramMb: 512 };
      if (!srv.parts) srv.parts = {};
      srv.parts[category] = partId;
      if (category === 'cpu') srv.specs.cpuMhz = specVal;
      else if (category === 'ram') srv.specs.ramMb = specVal;
      else if (category === 'hdd') srv.specs.hddMb = specVal;
      else if (category === 'network') srv.specs.netMbps = specVal;
      this.rebuildTopology();
      this.saveToStorage();
      this.renderUI();
      return true;
    }

    openModal() {
      this.isModalOpen = true;
      if (typeof window.navTo === 'function') {
        window.navTo('winLan');
      }
      this.renderUI();
    }

    renderHtml() {
      this.rebuildTopology();
      const gw = this.getGatewayServer();
      const honeypotCount = this.servers.filter((s) => s.isHoneypot).length;
      const totalCpuGhz = (this.servers.reduce((acc, s) => acc + (s.specs.cpuMhz || 0), 0) / 1000).toFixed(1);
      const svgH = this.topology.canvasHeight || 240;
      const cy = this.topology.centerY || 120;
      const maxX = Math.max(820, ...this.topology.nodes.map((n) => n.x + 130));

      // Curvas Bezier suaves do nó WAN para o Gateway e do Gateway para cada nó interno
      const wanToGwEdge = gw
        ? `<path d="M 165 ${cy} L 250 ${cy}" stroke="#35b877" stroke-width="1.8" stroke-dasharray="4 3" fill="none" />`
        : '';

      const edgesSvg = this.topology.edges.map((e) => {
        const fromN = this.topology.nodes.find((n) => n.id === e.from);
        const toN = this.topology.nodes.find((n) => n.id === e.to);
        if (!fromN || !toN) return '';
        const x1 = fromN.x + 90;
        const y1 = fromN.y;
        const x2 = toN.x - 90;
        const y2 = toN.y;
        const midX = Math.round((x1 + x2) / 2);
        const stroke = toN.isHoneypot ? '#8f6b29' : '#323c4a';
        return `<path d="M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}" stroke="${stroke}" stroke-width="1.6" fill="none" />`;
      }).join('');

      const wanNodeSvg = `
        <g transform="translate(95, ${cy})">
          <rect x="-70" y="-28" width="140" height="56" rx="8" fill="#15191f" stroke="#2c3542" stroke-width="1.4" />
          <text x="0" y="-4" text-anchor="middle" fill="#eceff3" font-size="11.5" font-weight="600">Internet (WAN)</text>
          <text x="0" y="13" text-anchor="middle" fill="#838d9b" font-size="10.5" font-family="JetBrains Mono, monospace">${esc(gw ? gw.ip : '0.0.0.0')}</text>
        </g>
      `;

      const nodesSvg = this.topology.nodes.map((n) => {
        const stroke = n.isGateway ? '#35b877' : (n.isHoneypot ? '#d89634' : '#323c4a');
        const fill = n.isGateway ? '#11251b' : (n.isHoneypot ? '#231c11' : '#15191f');
        const badgeColor = n.isGateway ? '#6bd6a0' : (n.isHoneypot ? '#f5bd6b' : '#aab3c0');
        const badgeText = n.isGateway ? 'GATEWAY' : (n.isHoneypot ? 'ISCA HONEYPOT' : 'NÓ INTERNO');
        const shortName = n.label.length > 21 ? n.label.slice(0, 20) + '…' : n.label;

        return `
          <g transform="translate(${n.x}, ${n.y})">
            <rect x="-90" y="-32" width="180" height="64" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />
            <text x="0" y="-9" text-anchor="middle" fill="#eceff3" font-size="11.5" font-weight="600">${esc(shortName)}</text>
            <text x="0" y="7" text-anchor="middle" fill="#838d9b" font-size="10.5" font-family="JetBrains Mono, monospace">${esc(n.internalIp)} · Fwl v${n.firewallVer}</text>
            <text x="0" y="22" text-anchor="middle" fill="${badgeColor}" font-size="9.5" font-family="JetBrains Mono, monospace" font-weight="600">${badgeText}</text>
          </g>
        `;
      }).join('');

      const rowsHtml = this.servers.map((s) => `
        <tr>
          <td>
            <strong style="color: var(--hc-text);">${esc(s.label)}</strong>
            <div style="margin-top: 3px; display: flex; gap: 6px; flex-wrap: wrap;">
              ${s.isGateway ? '<span class="hc-badge success">Gateway público</span>' : '<span class="hc-badge">Rede interna</span>'}
              ${s.isHoneypot ? '<span class="hc-badge warning">Isca Honeypot</span>' : ''}
            </div>
          </td>
          <td class="mono" style="font-size: 12.5px;">
            <div style="color: var(--hc-accent-text);">${esc(s.ip)}</div>
            <div style="color: var(--hc-text-3); font-size: 11.5px;">LAN ${esc(s.internalIp)}</div>
          </td>
          <td class="mono" style="font-size: 12px; color: var(--hc-text-2);">
            ${(s.specs.cpuMhz / 1000).toFixed(1)} GHz · ${s.specs.netMbps} Mbps · ${Math.round(s.specs.ramMb / 1024 * 10) / 10} GB RAM
          </td>
          <td class="mono" style="font-size: 12.5px;">v${s.firewallVer.toFixed(1)}</td>
          <td style="text-align: right; white-space: nowrap;">
            ${!s.isGateway ? `<button type="button" class="hc-btn primary sm" onclick="window.lanServersEngine.setGateway('${esc(s.id)}')">Tornar Gateway</button>` : '<span style="font-size:12px;color:var(--hc-text-3);">Entrada ativa</span>'}
            ${!s.isGateway ? `<button type="button" class="hc-btn ghost sm" style="margin-left:6px;" onclick="window.lanServersEngine.toggleHoneypot('${esc(s.id)}')">${s.isHoneypot ? 'Desativar isca' : 'Armar Honeypot'}</button>` : ''}
          </td>
        </tr>
      `).join('');

      return `
        <div class="hc-stat-strip" style="margin-bottom: 20px;">
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Gateway público</div>
            <div class="hc-stat-value" style="color: var(--hc-accent-text);">${esc(gw ? gw.ip : '0.0.0.0')}</div>
            <div class="hc-stat-sub">${esc(gw ? gw.label : '—')}</div>
          </div>
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Servidores ativos</div>
            <div class="hc-stat-value">${this.servers.length}</div>
            <div class="hc-stat-sub">Conectados ao switch local</div>
          </div>
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Nós Honeypot</div>
            <div class="hc-stat-value">${honeypotCount}</div>
            <div class="hc-stat-sub ${honeypotCount > 0 ? 'ok' : ''}">${honeypotCount > 0 ? 'Armadilha pronta contra intrusos' : 'Nenhuma isca armada'}</div>
          </div>
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Poder computacional</div>
            <div class="hc-stat-value">${totalCpuGhz} GHz</div>
            <div class="hc-stat-sub">Capacidade somada do cluster</div>
          </div>
        </div>

        <!-- Topologia Visual Limpa -->
        <div class="hc-card" style="margin-bottom: 18px; padding: 16px 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <strong style="font-size: 14px;">Topologia da rede local</strong>
            <span style="font-size: 12px; color: var(--hc-text-3);">Tráfego externo entra pelo Gateway antes de alcançar os nós internos</span>
          </div>
          <div style="background: var(--hc-inset); border: 1px solid var(--hc-border-subtle); border-radius: 8px; padding: 10px; overflow-x: auto;">
            <svg width="${maxX}" height="${svgH}" viewBox="0 0 ${maxX} ${svgH}" style="display: block; margin: 0 auto; min-width: 720px;">
              ${wanToGwEdge}
              ${edgesSvg}
              ${wanNodeSvg}
              ${nodesSvg}
            </svg>
          </div>
        </div>

        <!-- Tabela de Servidores -->
        <div class="hc-card" style="padding: 0; overflow: hidden; margin-bottom: 20px;">
          <div style="padding: 14px 18px; border-bottom: 1px solid var(--hc-border); display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 14px;">Máquinas no seu datacenter (${this.servers.length})</strong>
          </div>
          <table class="hc-table">
            <thead>
              <tr>
                <th>Servidor</th>
                <th>Endereços IP</th>
                <th>Hardware</th>
                <th>Firewall</th>
                <th style="text-align: right;">Operações</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>

        <!-- Catálogo de Expansão -->
        <div class="hc-eyebrow" style="margin-bottom: 10px;">Contratar novos servidores</div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 14px;">
          ${Object.values(SERVER_TYPES_CATALOG).map((tpl) => `
            <div class="hc-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 14px;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
                  <strong style="font-size: 14.5px; color: var(--hc-text);">${esc(tpl.name)}</strong>
                  <span class="mono" style="font-size: 13.5px; font-weight: 600; color: var(--hc-accent-text);">${fmtUsd(tpl.cost)}</span>
                </div>
                <p style="font-size: 12.5px; color: var(--hc-text-2); margin: 6px 0 10px; line-height: 1.45;">${esc(tpl.desc)}</p>
                <div class="mono" style="font-size: 11.5px; color: var(--hc-text-3);">
                  ${(tpl.specs.cpuMhz / 1000).toFixed(1)} GHz · ${tpl.specs.netMbps} Mbps · Firewall v${tpl.defaultFwl.toFixed(1)}
                </div>
              </div>
              <button type="button" class="hc-btn block" onclick="window.lanServersEngine.purchaseServer('${esc(tpl.type)}')">
                Adicionar ao datacenter
              </button>
            </div>
          `).join('')}
        </div>
      `;
    }

    renderUI() {
      const container = document.getElementById('lanAppBody') || document.getElementById('lan-modal-body');
      if (container) {
        container.innerHTML = this.renderHtml();
      }
    }
  }

  window.SERVER_TYPES_CATALOG = SERVER_TYPES_CATALOG;
  window.lanServersEngine = new LanServersEngine();
  window.openLanModal = () => window.lanServersEngine.openModal();
})();
