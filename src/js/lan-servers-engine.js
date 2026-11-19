/**
 * Hacker City // Pilar 1: Múltiplos Servidores, Topologia LAN, Honeypot Isca & Troca de Gateway
 * Permite compra de servidores (VPS, Dedicado, Mainframe, Honeypot), montagem de rede local
 * com defesa em profundidade (LAN Pivoting) e alternância do IP público de entrada (Gateway).
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
    return '$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' HC';
  }

  const SERVER_TYPES_CATALOG = {
    vps: {
      type: 'vps',
      name: 'VPS Cloud Descartável',
      desc: 'Instância em nuvem com IP rotativo. Ideal para disparar ataques sem expor seu IP doméstico.',
      cost: 15000,
      specs: { cpuMhz: 4800, netMbps: 500, hddMb: 4096, ramMb: 2048 },
      defaultFwl: 2.5
    },
    dedicated: {
      type: 'dedicated',
      name: 'Servidor Dedicado em Rack',
      desc: 'Hardware físico corporativo com refrigeração líquida. Rendimento de mineração +80%.',
      cost: 75000,
      specs: { cpuMhz: 12000, netMbps: 2000, hddMb: 16384, ramMb: 8192 },
      defaultFwl: 5.0
    },
    mainframe: {
      type: 'mainframe',
      name: 'Mainframe Cofre (Vault)',
      desc: 'Cofre bancário isolado atrás de switch local. Imune a ataques diretos sem pivotamento LAN.',
      cost: 250000,
      specs: { cpuMhz: 24000, netMbps: 10000, hddMb: 65536, ramMb: 32768 },
      defaultFwl: 8.5
    }
  };

  class LanServersEngine {
    constructor() {
      this.servers = [];
      this.topology = { nodes: [], edges: [] };
      this.isModalOpen = false;
      this.init();
    }

    init() {
      this.loadFromStorage();
      if (this.servers.length === 0) {
        this.seedInitialServers();
      }
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
          label: 'Edge Gateway Doméstico',
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
          label: 'Servidor Isca (Honeypot)',
          type: 'vps',
          ip: '10.0.0.2',
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

    rebuildTopology() {
      const nodes = this.servers.map((s, idx) => ({
        id: s.id,
        label: s.label,
        ip: s.ip,
        internalIp: s.internalIp,
        type: s.type,
        isGateway: s.isGateway,
        isHoneypot: s.isHoneypot,
        firewallVer: s.firewallVer,
        x: s.isGateway ? 120 : (s.isHoneypot ? 280 : 440 + (idx - 2) * 140),
        y: s.isGateway ? 140 : (s.isHoneypot ? 70 : 210)
      }));

      const edges = [];
      const gw = nodes.find((n) => n.isGateway);
      if (gw) {
        nodes.forEach((n) => {
          if (!n.isGateway) {
            edges.push({ from: gw.id, to: n.id });
          }
        });
      }

      this.topology = { nodes, edges };
    }

    getGatewayServer() {
      return this.servers.find((s) => s.isGateway) || this.servers[0];
    }

    getHoneypotServer() {
      return this.servers.find((s) => s.isHoneypot) || null;
    }

    // Define qual servidor é o Gateway de Entrada (face pública da internet)
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
        window.showToast(`🔄 Gateway alterado para ${newGw.label} (${newGw.ip})! IP público atualizado.`, 'success');
      }
      if (window.audioEngine && typeof window.audioEngine.playKeyClick === 'function') {
        window.audioEngine.playKeyClick();
      }

      this.renderUI();
    }

    // Ativa/Desativa modo Honeypot em um nó
    toggleHoneypot(serverId) {
      const s = this.servers.find((x) => x.id === serverId);
      if (!s) return;

      if (s.isGateway) {
        if (window.showToast) window.showToast('O servidor Gateway não pode ser a própria isca! Configure um nó interno.', 'danger');
        return;
      }

      s.isHoneypot = !s.isHoneypot;
      this.rebuildTopology();
      this.saveToStorage();

      if (window.showToast) {
        window.showToast(`🛡️ ${s.label}: Modo Honeypot Isca ${s.isHoneypot ? 'ATIVADO' : 'DESATIVADO'}.`, 'info');
      }
      this.renderUI();
    }

    // Compra novo servidor para o Datacenter
    purchaseServer(typeKey) {
      const tpl = SERVER_TYPES_CATALOG[typeKey];
      if (!tpl) return;

      const curBal = window.currentWallet ? parseFloat(window.currentWallet.balance || 0) : 0;
      if (curBal < tpl.cost) {
        if (window.showToast) window.showToast(`Saldo insuficiente! ${tpl.name} custa ${fmtUsd(tpl.cost)}.`, 'danger');
        return;
      }

      // Debita saldo
      if (window.currentWallet) {
        window.currentWallet.balance = Math.max(0, +(curBal - tpl.cost).toFixed(2));
      }
      if (window.currentProfile) {
        window.currentProfile.wallet_balance = Math.max(0, (window.currentProfile.wallet_balance || 0) - tpl.cost);
      }

      const octet = 10 + this.servers.length;
      const newSrv = {
        id: `srv_${typeKey}_${Date.now()}`,
        label: `${tpl.name} #${this.servers.length + 1}`,
        type: tpl.type,
        ip: typeKey === 'vps' ? `185.220.${octet}.44` : `10.0.0.${octet}`,
        internalIp: `10.0.0.${octet}`,
        isGateway: false,
        isHoneypot: false,
        specs: { ...tpl.specs },
        firewallVer: tpl.defaultFwl,
        services: ['ssh', typeKey === 'dedicated' ? 'heavy_mining' : 'vault_storage']
      };

      this.servers.push(newSrv);
      this.rebuildTopology();
      this.saveToStorage();

      if (window.audioEngine && typeof window.audioEngine.playCashChime === 'function') {
        window.audioEngine.playCashChime();
      }

      if (window.showToast) {
        window.showToast(`🖥️ Servidor adicionado ao Datacenter! ${newSrv.label} operacional.`, 'success');
      }

      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
    }

    openModal() {
      this.isModalOpen = true;
      let modal = document.getElementById('lan-manager-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'lan-manager-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(5, 8, 14, 0.78)';
        modal.style.backdropFilter = 'blur(6px)';
        modal.style.zIndex = '9999';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.innerHTML = `
          <div style="background:#111622;border:1px solid #2e3e56;border-radius:12px;width:860px;max-width:95vw;box-shadow:0 16px 40px rgba(0,0,0,0.6);overflow:hidden;font-family:sans-serif;color:#e2e8f0;">
            <div style="background:#182130;padding:12px 18px;border-bottom:1px solid #2e3e56;display:flex;justify-content:space-between;align-items:center;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:1.15rem;">🖥️</span>
                <strong style="font-size:0.98rem;letter-spacing:0.02em;color:#38bdf8;">DATACENTER &amp; TOPOLOGIA LAN // DEFESA EM PROFUNDIDADE</strong>
              </div>
              <button id="close-lan-modal-btn" style="background:transparent;border:none;color:#8e9db4;font-size:1.2rem;cursor:pointer;padding:0 6px;">✕</button>
            </div>
            <div id="lan-modal-body" style="padding:18px;max-height:80vh;overflow-y:auto;"></div>
          </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('close-lan-modal-btn').onclick = () => {
          modal.style.display = 'none';
          this.isModalOpen = false;
        };
      } else {
        modal.style.display = 'flex';
      }

      this.renderUI();
    }

    renderHtml() {
      const gw = this.getGatewayServer();

      // Grafo visual em SVG
      const nodesSvg = this.topology.nodes.map((n) => {
        let stroke = n.isGateway ? '#35b877' : (n.isHoneypot ? '#f59e0b' : '#38bdf8');
        let fill = n.isGateway ? 'rgba(53,184,119,0.2)' : (n.isHoneypot ? 'rgba(245,158,11,0.2)' : 'rgba(56,189,248,0.15)');
        let badgeText = n.isGateway ? 'GATEWAY' : (n.isHoneypot ? 'HONEYPOT' : 'NÓ LAN');

        return `
          <g transform="translate(${n.x}, ${n.y})">
            <rect x="-65" y="-35" width="130" height="70" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="2" />
            <text x="0" y="-12" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">${esc(n.label.slice(0, 16))}</text>
            <text x="0" y="4" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="monospace">${esc(n.internalIp)}</text>
            <rect x="-45" y="14" width="90" height="15" rx="3" fill="#0b1017" />
            <text x="0" y="25" text-anchor="middle" fill="${stroke}" font-size="9" font-weight="bold">${badgeText}</text>
          </g>
        `;
      }).join('');

      const edgesSvg = this.topology.edges.map((e) => {
        const fromN = this.topology.nodes.find((n) => n.id === e.from);
        const toN = this.topology.nodes.find((n) => n.id === e.to);
        if (!fromN || !toN) return '';
        return `
          <line x1="${fromN.x}" y1="${fromN.y}" x2="${toN.x}" y2="${toN.y}" stroke="#2e3e56" stroke-width="2" stroke-dasharray="4" />
        `;
      }).join('');

      const serverCards = this.servers.map((s) => `
        <div style="background:#151c27;border:1px solid ${s.isGateway ? '#35b877' : (s.isHoneypot ? '#f59e0b' : '#28374d')};border-radius:8px;padding:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <div>
            <div style="display:flex;align-items:center;gap:6px;">
              <strong style="color:#fff;font-size:0.92rem;">${esc(s.label)}</strong>
              ${s.isGateway ? '<span style="font-size:0.7rem;background:rgba(53,184,119,0.2);color:#35b877;padding:2px 6px;border-radius:4px;font-weight:bold;">GATEWAY ATIVO</span>' : ''}
              ${s.isHoneypot ? '<span style="font-size:0.7rem;background:rgba(245,158,11,0.2);color:#f59e0b;padding:2px 6px;border-radius:4px;font-weight:bold;">ISCA HONEYPOT</span>' : ''}
            </div>
            <div style="font-family:monospace;font-size:0.8rem;color:#94a3b8;margin-top:2px;">
              IP Público: <strong style="color:#e2e8f0;">${esc(s.ip)}</strong> · IP Local: <code>${esc(s.internalIp)}</code> · Firewall: v${s.firewallVer}
            </div>
            <div style="font-size:0.75rem;color:#64748b;margin-top:2px;">
              Specs: ${s.specs.cpuMhz} MHz · ${s.specs.netMbps} Mbps · HD ${s.specs.hddMb} MB · RAM ${s.specs.ramMb} MB
            </div>
          </div>

          <div style="display:flex;gap:6px;">
            ${!s.isGateway ? `<button type="button" class="hc-btn primary sm" onclick="window.lanServersEngine.setGateway('${esc(s.id)}')">Tornar Gateway</button>` : ''}
            ${!s.isGateway ? `<button type="button" class="hc-btn ghost sm" style="color:${s.isHoneypot ? '#f59e0b' : '#cbd5e1'};" onclick="window.lanServersEngine.toggleHoneypot('${esc(s.id)}')">${s.isHoneypot ? 'Desativar Isca' : 'Armar Honeypot'}</button>` : ''}
          </div>
        </div>
      `).join('');

      return `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <!-- Topologia Visual SVG -->
          <div style="background:#090d14;border:1px solid #233044;border-radius:8px;padding:12px;overflow-x:auto;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.82rem;font-family:monospace;color:#38bdf8;">
              <span>TOPOLOGIA DA REDE LOCAL // PIVOTING &amp; FIREWALL</span>
              <span>Gateway Face WAN: <strong>${esc(gw.ip)}</strong></span>
            </div>
            <svg width="680" height="260" viewBox="0 0 680 260" style="display:block;margin:0 auto;background:#06090e;border-radius:6px;">
              ${edgesSvg}
              ${nodesSvg}
            </svg>
          </div>

          <!-- Lista de Servidores no Datacenter -->
          <div>
            <h4 style="margin:0 0 8px 0;font-size:0.9rem;color:#e2e8f0;">SERVIDORES ATIVOS NO SEU DATACENTER (${this.servers.length})</h4>
            <div style="display:flex;flex-direction:column;gap:8px;">${serverCards}</div>
          </div>

          <!-- Loja de Servidores Extras -->
          <div style="background:#0d121a;border:1px solid #1f2a3a;border-radius:8px;padding:14px;">
            <div class="hc-eyebrow" style="margin-bottom:8px;">Expansão de Infraestrutura · Comprar Novos Nós</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">
              ${Object.values(SERVER_TYPES_CATALOG).map((tpl) => `
                <div style="background:#151c27;border:1px solid #28374d;border-radius:6px;padding:10px;display:flex;flex-direction:column;justify-content:space-between;">
                  <div>
                    <strong style="color:#fff;font-size:0.88rem;">${esc(tpl.name)}</strong>
                    <div style="font-size:0.76rem;color:#94a3b8;margin:3px 0 6px 0;">${esc(tpl.desc)}</div>
                    <div style="font-family:monospace;font-size:0.88rem;color:#35b877;font-weight:bold;">${fmtUsd(tpl.cost)}</div>
                  </div>
                  <button type="button" class="hc-btn ghost sm" style="margin-top:8px;" onclick="window.lanServersEngine.purchaseServer('${esc(tpl.type)}')">
                    Comprar Nó
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    renderUI() {
      const container = document.getElementById('lan-modal-body');
      if (container) {
        container.innerHTML = this.renderHtml();
      }
    }
  }

  window.lanServersEngine = new LanServersEngine();
  window.openLanModal = () => window.lanServersEngine.openModal();
})();
