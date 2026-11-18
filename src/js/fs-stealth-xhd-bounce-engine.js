/**
 * Hacker City // Fase 2 — Bloco 6:
 * 1. BounceProxyEngine     — Cadeia de Saltos (Proxy Bounce) usando servidores do Hacked Database (oculta seu IP real nos logs do alvo!)
 * 2. StealthAndXhdEngine   — Hider.hdr (esconder vírus/arquivos), Seeker.skr (revelar arquivos ocultos),
 *                            HD Externo (XHD) para backup seguro e Download/Roubo de Softwares Superiores dos Alvos!
 */
(function () {
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // =========================================================================
  // 1. BOUNCE PROXY ENGINE (SALTOS POR MÁQUINAS JÁ INVADIDAS — HELIX STYLE)
  // =========================================================================
  class BounceProxyEngine {
    constructor() {
      this.userId = null;
      this.state = null;
      this.showBuilderModal = false;
    }

    storageKey(uid) {
      return `HC_BOUNCE_CHAIN_${uid || 'guest'}`;
    }

    ensureLoaded() {
      const uid = (window.currentProfile && window.currentProfile.id) || 'guest';
      if (this.userId === uid && this.state) return this.state;
      this.userId = uid;
      let saved = null;
      try {
        const raw = localStorage.getItem(this.storageKey(uid));
        if (raw) saved = JSON.parse(raw);
      } catch (e) {}
      this.state = saved && Array.isArray(saved.hops) ? saved : {
        chainName: 'Rota Fantasma #1',
        enabled: false,
        hops: [] // array de IPs presentes no Hacked Database
      };
      return this.state;
    }

    save() {
      if (!this.state) return;
      try {
        localStorage.setItem(this.storageKey(this.userId), JSON.stringify(this.state));
      } catch (e) {}
    }

    // Filtra apenas saltos que realmente constam no Hacked Database do jogador e não são o próprio destino!
    getValidHopsForTarget(targetIp = '') {
      this.ensureLoaded();
      if (!window.hackedDb) return [];
      window.hackedDb.ensureLoaded();
      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '';
      return this.state.hops.filter((ip) => {
        if (!ip || ip === targetIp || ip === myIp) return false;
        return !!window.hackedDb.getEntry(ip);
      });
    }

    toggleEnabled() {
      this.ensureLoaded();
      if (!this.state.enabled && this.getValidHopsForTarget('').length === 0) {
        // Se o jogador já tem máquinas no Hacked Database, auto-seleciona até 2 saltos p/ facilitar!
        if (window.hackedDb) {
          window.hackedDb.ensureLoaded();
          const autoHops = (window.hackedDb.entries || []).slice(0, 2).map((e) => e.ip);
          if (autoHops.length > 0) {
            this.state.hops = autoHops;
          } else {
            alert('Invada ao menos 1 servidor primeiro! Só é possível usar como Proxy Bounce máquinas que já estão no seu Hacked Database.');
            return false;
          }
        }
      }
      this.state.enabled = !this.state.enabled;
      this.save();
      if (window.internetEngine) window.internetEngine.render();
      return this.state.enabled;
    }

    addHop(ip) {
      this.ensureLoaded();
      if (!window.hackedDb || !window.hackedDb.getEntry(ip)) {
        return { success: false, message: 'Você precisa ter invadido este servidor para usá-lo como salto de Bounce!' };
      }
      if (this.state.hops.includes(ip)) return { success: false, message: 'Este IP já está na sua cadeia de Bounce.' };
      if (this.state.hops.length >= 4) return { success: false, message: 'Máximo de 4 saltos por cadeia de Bounce.' };
      this.state.hops.push(ip);
      this.state.enabled = true;
      this.save();
      this.renderBuilderModal();
      if (window.internetEngine) window.internetEngine.render();
      return { success: true };
    }

    removeHop(ip) {
      this.ensureLoaded();
      this.state.hops = this.state.hops.filter((h) => h !== ip);
      if (this.state.hops.length === 0) this.state.enabled = false;
      this.save();
      this.renderBuilderModal();
      if (window.internetEngine) window.internetEngine.render();
    }

    // Registra o rastro intermediário em cada nó do Bounce e devolve o IP que o destino enxerga!
    routeConnectionAndGetVisibleIp(targetIp) {
      this.ensureLoaded();
      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      if (!this.state.enabled) return { visibleIp: myIp, bounced: false, hopsUsed: [] };

      const validHops = this.getValidHopsForTarget(targetIp);
      if (validHops.length === 0) return { visibleIp: myIp, bounced: false, hopsUsed: [] };

      const chain = [myIp, ...validHops, targetIp];
      if (window.internetEngine) {
        for (let i = 1; i < chain.length - 1; i++) {
          window.internetEngine.appendServerLog(
            chain[i],
            `Connection bounced from ${chain[i - 1]} to ${chain[i + 1]} [SSH_TUNNEL]`
          );
        }
      }
      return {
        visibleIp: validHops[validHops.length - 1],
        bounced: true,
        hopsUsed: validHops
      };
    }

    renderInternetBounceBarHtml(targetIp) {
      this.ensureLoaded();
      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      const validHops = this.state.enabled ? this.getValidHopsForTarget(targetIp) : [];
      const isProtected = this.state.enabled && validHops.length > 0;

      const routeText = isProtected
        ? `${esc(myIp)} → ${validHops.map((h) => `<strong style="color:var(--hc-accent-text);">${esc(h)}</strong>`).join(' → ')} → ${esc(targetIp)}`
        : `${esc(myIp)} → ${esc(targetIp)} <span style="color:var(--hc-warning);">(Conexão Direta · Seu IP real ficará nos logs!)</span>`;

      return `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 12px;margin-bottom:10px;background:var(--hc-inset);border:1px solid ${isProtected ? 'rgba(53,184,119,0.4)' : 'var(--hc-border)'};border-radius:8px;font-size:0.78rem;">
          <div style="font-family:var(--hc-font-mono);overflow:hidden;text-overflow:ellipsis;">
            <span class="hc-badge ${isProtected ? 'success' : 'warn'}" style="margin-right:6px;">
              ${isProtected ? `BOUNCE ATIVO (${validHops.length} SALTO${validHops.length > 1 ? 'S' : ''})` : 'SEM PROXY BOUNCE'}
            </span>
            ${routeText}
          </div>
          <div style="display:flex;gap:6px;">
            <button type="button" id="btnToggleBounce" class="hc-btn ${isProtected ? 'primary' : 'ghost'} sm" onclick="window.bounceEngine.toggleEnabled()">
              ${this.state.enabled ? 'Desligar Bounce' : 'Ativar Bounce'}
            </button>
            <button type="button" id="btnOpenBounceBuilder" class="hc-btn ghost sm" onclick="window.bounceEngine.openBuilderModal()">
              Configurar Saltos (${this.state.hops.length})
            </button>
          </div>
        </div>
      `;
    }

    openBuilderModal() {
      this.showBuilderModal = true;
      this.renderBuilderModal();
    }

    closeBuilderModal() {
      this.showBuilderModal = false;
      const el = document.getElementById('bounceBuilderOverlay');
      if (el) el.style.display = 'none';
    }

    renderBuilderModal() {
      this.ensureLoaded();
      let modal = document.getElementById('bounceBuilderOverlay');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'bounceBuilderOverlay';
        modal.style.cssText = 'position:fixed;inset:0;z-index:1150;background:rgba(7,9,12,0.8);display:none;align-items:center;justify-content:center;padding:20px;';
        document.body.appendChild(modal);
      }
      if (!this.showBuilderModal) {
        modal.style.display = 'none';
        return;
      }
      modal.style.display = 'flex';

      if (window.hackedDb) window.hackedDb.ensureLoaded();
      const knownHosts = (window.hackedDb ? window.hackedDb.entries : []).filter((e) => !this.state.hops.includes(e.ip));

      modal.innerHTML = `
        <div class="hc-card" style="width:100%;max-width:740px;padding:1.4rem;background:var(--hc-surface);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <div>
              <div class="hc-eyebrow">Bounce Manager · Cadeia de Proxies</div>
              <h3 style="font-size:1.05rem;margin:2px 0 0;">Monte sua Rota de Saltos com Máquinas Invadidas</h3>
            </div>
            <button type="button" class="hc-btn ghost sm" onclick="window.bounceEngine.closeBuilderModal()">Fechar ✕</button>
          </div>

          <p style="font-size:0.8rem;color:var(--hc-text-2);margin:0 0 12px;">
            Com o Bounce ligado, o servidor alvo enxerga apenas o IP do <strong>último salto</strong> da cadeia, mantendo seu IP público verdadeiro oculto!
          </p>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div style="background:var(--hc-inset);border:1px solid var(--hc-border);border-radius:8px;padding:10px;">
              <div class="hc-eyebrow" style="margin-bottom:8px;">Servidores Disponíveis (Hacked DB)</div>
              ${knownHosts.length === 0
                ? `<div style="font-size:0.78rem;color:var(--hc-text-3);padding:12px 0;">Invada mais servidores para adicioná-los como saltos!</div>`
                : knownHosts.slice(0, 8).map((h) => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--hc-border);font-size:0.79rem;">
                      <div>
                        <code style="color:var(--hc-accent-text);">${esc(h.ip)}</code>
                        <div style="font-size:0.72rem;color:var(--hc-text-3);">${esc(h.hostname)}</div>
                      </div>
                      <button type="button" class="hc-btn primary sm" onclick="window.bounceEngine.addHop('${esc(h.ip)}')">+ Salto</button>
                    </div>
                  `).join('')}
            </div>

            <div style="background:var(--hc-inset);border:1px solid var(--hc-border);border-radius:8px;padding:10px;">
              <div class="hc-eyebrow" style="margin-bottom:8px;">Cadeia Ordenada (${this.state.hops.length}/4 Saltos)</div>
              ${this.state.hops.length === 0
                ? `<div style="font-size:0.78rem;color:var(--hc-text-3);padding:12px 0;">Nenhum salto selecionado.</div>`
                : this.state.hops.map((ip, idx) => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--hc-border);font-size:0.8rem;">
                      <span><strong style="color:var(--hc-text-3);">#${idx + 1}</strong> <code style="color:var(--hc-accent-text);margin-left:6px;">${esc(ip)}</code></span>
                      <button type="button" class="hc-btn ghost sm" style="color:var(--hc-danger-text);" onclick="window.bounceEngine.removeHop('${esc(ip)}')">Remover</button>
                    </div>
                  `).join('')}
            </div>
          </div>
        </div>
      `;
    }
  }

  // =========================================================================
  // 2. STEALTH (HIDER/SEEKER), HD EXTERNO (XHD) & ROUBO DE SOFTWARES REMOTOS
  // =========================================================================
  const XHD_TIERS = [
    { id: 'xhd_none', name: 'Sem HD Externo', capMb: 0, price: 0 },
    { id: 'xhd_256', name: 'XHD Criptografado USB 256 MB', capMb: 256, price: 450 },
    { id: 'xhd_1024', name: 'XHD Blindado 1.024 MB (1 GB)', capMb: 1024, price: 1600 },
    { id: 'xhd_4096', name: 'XHD Cofre Militar 4.096 MB (4 GB)', capMb: 4096, price: 5200 }
  ];

  const SOFT_DISPLAY_NAMES = {
    cracker: 'Cracker.crc',
    exploit_ftp: 'FTP_Exploit.exp',
    exploit_ssh: 'SSH_Exploit.exp',
    portscan: 'PortScan.scan',
    hasher: 'Hasher.hash',
    firewall: 'Firewall.fwl',
    antivirus: 'Antivirus.av',
    collector: 'Collector.vcol',
    torrent: 'Torrent.torrent',
    ddos_breaker: 'DDoS_Breaker.vbrk',
    nmap: 'Nmap.nmap',
    analyzer: 'Analyzer.ana',
    webserver: 'WebServer.exe',
    hider: 'Hider.hdr',
    seeker: 'Seeker.skr',
    vspam: 'Spam.vspam',
    vwarez: 'Warez.vwarez',
    vminer: 'Miner.vminer',
    vbank: 'BankTrojan.vbank',
    vddos: 'DDoS_Node.vddos'
  };

  class StealthAndXhdEngine {
    constructor() {
      this.userId = null;
      this.state = null;
      this.revealedHosts = new Set(); // IPs onde Seeker.skr já revelou ocultos
      this.claimedHiddenLoot = new Set();
    }

    storageKey(uid) {
      return `HC_XHD_STEALTH_${uid || 'guest'}`;
    }

    ensureLoaded() {
      const uid = (window.currentProfile && window.currentProfile.id) || 'guest';
      if (this.userId === uid && this.state) return this.state;
      this.userId = uid;
      let saved = null;
      try {
        const raw = localStorage.getItem(this.storageKey(uid));
        if (raw) saved = JSON.parse(raw);
      } catch (e) {}

      this.state = saved && saved.xhdId ? saved : {
        xhdId: 'xhd_none',
        hiderVerInt: 10, // v1.0
        seekerVerInt: 10, // v1.0
        backups: {} // softKey -> { versionInt, sizeMb, savedAt }
      };
      return this.state;
    }

    save() {
      if (!this.state) return;
      try {
        localStorage.setItem(this.storageKey(this.userId), JSON.stringify(this.state));
      } catch (e) {}
    }

    getXhdInfo() {
      this.ensureLoaded();
      const tier = XHD_TIERS.find((t) => t.id === this.state.xhdId) || XHD_TIERS[0];
      const usedMb = Object.values(this.state.backups || {}).reduce((s, b) => s + (b.sizeMb || 20), 0);
      return {
        ...tier,
        usedMb,
        freeMb: Math.max(0, tier.capMb - usedMb),
        nextTier: XHD_TIERS[XHD_TIERS.indexOf(tier) + 1] || null
      };
    }

    getHiderVer() {
      this.ensureLoaded();
      return (this.state.hiderVerInt || 10) / 10;
    }

    getSeekerVer() {
      this.ensureLoaded();
      return (this.state.seekerVerInt || 10) / 10;
    }

    upgradeStealthTool(toolKey) {
      this.ensureLoaded();
      const isHider = toolKey === 'hider';
      const curInt = isHider ? this.state.hiderVerInt : this.state.seekerVerInt;
      if (curInt >= 100) return { success: false, message: 'Já está na potência máxima v10.0!' };

      const cost = Math.round(190 * Math.pow(curInt / 10, 2.1));
      if (!window.currentWallet || parseFloat(window.currentWallet.balance) < cost) {
        return { success: false, message: `Saldo insuficiente! Evoluir ${isHider ? 'Hider.hdr' : 'Seeker.skr'} custa $ ${cost.toLocaleString('pt-BR')} HC.` };
      }

      window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) - cost).toFixed(2);
      if (isHider) this.state.hiderVerInt += 5;
      else this.state.seekerVerInt += 5;
      this.save();

      if (window.currentProfile) window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 30;
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.softwareEngine) window.softwareEngine.renderUI();
      return {
        success: true,
        newVer: ((isHider ? this.state.hiderVerInt : this.state.seekerVerInt) / 10).toFixed(1),
        message: `${isHider ? 'Hider.hdr' : 'Seeker.skr'} evoluído para v${((isHider ? this.state.hiderVerInt : this.state.seekerVerInt) / 10).toFixed(1)}!`
      };
    }

    buyNextXhdTier() {
      this.ensureLoaded();
      const info = this.getXhdInfo();
      if (!info.nextTier) return { success: false, message: 'Você já possui o maior HD Externo disponível!' };
      const cost = info.nextTier.price;
      if (!window.currentWallet || parseFloat(window.currentWallet.balance) < cost) {
        return { success: false, message: `Saldo insuficiente! ${info.nextTier.name} custa $ ${cost.toLocaleString('pt-BR')} HC.` };
      }

      window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) - cost).toFixed(2);
      this.state.xhdId = info.nextTier.id;
      this.save();

      if (window.currentProfile) window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 60;
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('XHD-BUY', `HD Externo adquirido: ${info.nextTier.name} (${info.nextTier.capMb} MB)`, 'success');
      }
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.softwareEngine) window.softwareEngine.renderUI();
      return { success: true, message: `${info.nextTier.name} conectado com sucesso!` };
    }

    backupSoftwareToXhd(softKey) {
      this.ensureLoaded();
      if (!window.softwareEngine) return { success: false };
      window.softwareEngine.ensureLoaded();

      const xhd = this.getXhdInfo();
      if (xhd.capMb <= 0) {
        return { success: false, code: 'NO_XHD', message: 'Compre primeiro um HD Externo (XHD) para fazer backup dos seus softwares!' };
      }

      const cur = window.softwareEngine.state.inventory[softKey];
      if (!cur) return { success: false, message: 'Software não encontrado.' };

      const sizeMb = window.softwareEngine.getItemSizeMb(softKey, cur.versionInt);
      const prevSize = this.state.backups[softKey]?.sizeMb || 0;
      if (sizeMb - prevSize > xhd.freeMb) {
        return { success: false, code: 'XHD_FULL', message: `Espaço insuficiente no HD Externo! Necessário ${sizeMb} MB, livre: ${xhd.freeMb + prevSize} MB.` };
      }

      this.state.backups[softKey] = {
        softKey,
        filename: SOFT_DISPLAY_NAMES[softKey] || softKey,
        versionInt: cur.versionInt,
        sizeMb,
        savedAt: new Date().toLocaleTimeString()
      };
      this.save();
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('XHD-BACKUP', `Backup salvo no HD Externo: ${SOFT_DISPLAY_NAMES[softKey]} (v${(cur.versionInt / 10).toFixed(1)}, ${sizeMb} MB)`, 'info');
      }
      if (window.softwareEngine) window.softwareEngine.renderUI();
      return { success: true, message: `Backup de ${SOFT_DISPLAY_NAMES[softKey]} v${(cur.versionInt / 10).toFixed(1)} salvo no HD Externo!` };
    }

    restoreSoftwareFromXhd(softKey) {
      this.ensureLoaded();
      if (!window.softwareEngine) return { success: false };
      window.softwareEngine.ensureLoaded();

      const bak = this.state.backups[softKey];
      if (!bak) return { success: false, message: 'Nenhum backup deste software no XHD.' };

      const cur = window.softwareEngine.state.inventory[softKey];
      if (!cur) return { success: false };

      const extraMb = bak.sizeMb - window.softwareEngine.getItemSizeMb(softKey, cur.versionInt);
      if (window.softwareEngine.getUsedHddMb() + extraMb > window.softwareEngine.getMaxHddMb()) {
        return { success: false, message: 'Seu HD principal está sem espaço livre para restaurar este backup!' };
      }

      cur.versionInt = Math.max(cur.versionInt, bak.versionInt);
      cur.licensed = true;
      window.softwareEngine.save();
      window.softwareEngine.renderUI();
      return { success: true, message: `${bak.filename} restaurado para v${(bak.versionInt / 10).toFixed(1)} a partir do HD Externo!` };
    }

    // Esconder um vírus remoto com Hider.hdr (aumenta camuflagem contra o Antivirus.av do alvo e oculta no PvP até Seeker.skr!)
    hideRemoteVirusWithHider(infectionId) {
      this.ensureLoaded();
      if (!window.softwareEngine) return { success: false };
      window.softwareEngine.ensureLoaded();
      const v = (window.softwareEngine.state.remoteInfections || []).find((x) => x.id === Number(infectionId));
      if (!v) return { success: false, message: 'Vírus não localizado.' };

      const hiderVer = this.getHiderVer();
      v.hiddenWithVer = hiderVer;
      if (this.state.hiderVerInt > v.versionInt) {
        v.effectiveStealthInt = this.state.hiderVerInt;
      }
      window.softwareEngine.save();

      // Se o alvo for jogador humano real, envia pacote PVP_VIRUS_HIDE para camuflar o malware no PC dele!
      const host = window.internetEngine ? window.internetEngine.resolveHost(v.targetIp) : null;
      if (host && host.isRealHuman && window.onlineEngine) {
        const visibleIp = window.bounceEngine
          ? window.bounceEngine.routeConnectionAndGetVisibleIp(host.ip).visibleIp
          : (window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0');
        window.onlineEngine.sendPvpPacket({
          kind: 'PVP_VIRUS_HIDE',
          visibleIp,
          targetUserId: host.humanUserId,
          targetTag: host.humanTag,
          targetIp: host.ip,
          d: { fn: v.filename, hiddenWithVer: hiderVer }
        });
      }

      window.softwareEngine.renderUI();
      return { success: true, message: `${v.filename} camuflado em ${v.targetIp} com Hider.hdr v${hiderVer.toFixed(1)}!` };
    }

    // Softwares presentes no HD do servidor invadido que o jogador pode ROUBAR / BAIXAR de graça!
    getStealableSoftwaresOnHost(host) {
      if (!host || host.notFound || host.kind === 'self') return [];

      // 1) Se for servidor da Trilha de Enigmas e o enigma daquele nó já foi resolvido -> dá o software prêmio (licenciado)!
      if (window.puzzleTrailEngine) {
        const pNode = window.puzzleTrailEngine.getNodeByIp(host.ip);
        if (pNode) {
          const solved = window.puzzleTrailEngine.isSolved(pNode.index);
          if (!solved) return [];
          return [{
            softKey: pNode.rewardSoftKey,
            filename: SOFT_DISPLAY_NAMES[pNode.rewardSoftKey],
            versionInt: pNode.rewardSoftVer,
            sourceBadge: `Recompensa Enigma #${pNode.index}`
          }];
        }
      }

      // 2) Softwares reais instalados em Empresas, Bancos, Bots e VPCs!
      const list = [];
      if (host.ip === '203.17.88.40') {
        list.push({ softKey: 'firewall', filename: 'Firewall.fwl', versionInt: 15, sourceBadge: 'Binário Corporativo' });
        list.push({ softKey: 'analyzer', filename: 'Analyzer.ana', versionInt: 20, sourceBadge: 'Diagnóstico TI' });
      } else if (host.ip === '185.220.101.9') {
        list.push({ softKey: 'exploit_ssh', filename: 'SSH_Exploit.exp', versionInt: 20, sourceBadge: 'Arsenal Darknet' });
        list.push({ softKey: 'exploit_ftp', filename: 'FTP_Exploit.exp', versionInt: 20, sourceBadge: 'Arsenal Darknet' });
        list.push({ softKey: 'vwarez', filename: 'Warez.vwarez', versionInt: 20, sourceBadge: 'Arsenal Darknet' });
      } else if (host.kind === 'banco') {
        const bankVer = Math.round((host.hasherVer || 2.0) * 10);
        list.push({ softKey: 'hasher', filename: 'Hasher.hash', versionInt: bankVer, sourceBadge: 'Módulo Bancário' });
        list.push({ softKey: 'antivirus', filename: 'Antivirus.av', versionInt: Math.min(40, bankVer), sourceBadge: 'Defesa Bancária' });
        list.push({ softKey: 'vbank', filename: 'BankTrojan.vbank', versionInt: Math.min(35, bankVer), sourceBadge: 'Protótipo Interno' });
      } else if (host.kind === 'bot') {
        if (host.tier === 2) {
          list.push({ softKey: 'cracker', filename: 'Cracker.crc', versionInt: 20, sourceBadge: 'Kit do Bot Tier II' });
          list.push({ softKey: 'nmap', filename: 'Nmap.nmap', versionInt: 20, sourceBadge: 'Kit do Bot Tier II' });
          list.push({ softKey: 'vspam', filename: 'Spam.vspam', versionInt: 20, sourceBadge: 'Kit do Bot Tier II' });
        } else if (host.tier === 3) {
          list.push({ softKey: 'cracker', filename: 'Cracker.crc', versionInt: 30, sourceBadge: 'Arsenal APT Tier III' });
          list.push({ softKey: 'antivirus', filename: 'Antivirus.av', versionInt: 30, sourceBadge: 'Arsenal APT Tier III' });
          list.push({ softKey: 'ddos_breaker', filename: 'DDoS_Breaker.vbrk', versionInt: 25, sourceBadge: 'Arsenal APT Tier III' });
          list.push({ softKey: 'vddos', filename: 'DDoS_Node.vddos', versionInt: 25, sourceBadge: 'Arsenal APT Tier III' });
        }
      }
      return list;
    }

    // Inicia ou conclui o Download de um software superior da vítima para o seu PC!
    downloadRemoteSoftware(host, softKey, remoteVersionInt, instant = false) {
      this.ensureLoaded();
      if (!window.softwareEngine) return { success: false };
      window.softwareEngine.ensureLoaded();

      // Checar permissão de Download caso esteja em sessão limitada SSH-Only Exploit!
      if (window.internetEngine && typeof window.internetEngine.hasRemotePermission === 'function') {
        if (!window.internetEngine.hasRemotePermission('download')) {
          return {
            success: false,
            code: 'NO_FTP_PERMISSION',
            message: 'PERMISSÃO NEGADA (Sessão SSH-Only)! O Exploit SSH não permite Download/Upload de arquivos — use FTP_Exploit.exp junto (ou Força-Bruta root)!'
          };
        }
      }

      const isStealthTool = softKey === 'hider' || softKey === 'seeker';
      const cur = isStealthTool
        ? { versionInt: softKey === 'hider' ? this.state.hiderVerInt : this.state.seekerVerInt }
        : window.softwareEngine.state.inventory[softKey];
      if (!cur) return { success: false, message: 'Tipo de software incompatível com seu kernel.' };
      if (cur.versionInt >= remoteVersionInt) {
        return {
          success: false,
          code: 'ALREADY_HAVE_BETTER',
          message: `Você já possui ${SOFT_DISPLAY_NAMES[softKey]} em potência igual ou maior (v${(cur.versionInt / 10).toFixed(1)})!`
        };
      }

      const newSizeMb = isStealthTool ? Math.round(18 * (remoteVersionInt / 10)) : window.softwareEngine.getItemSizeMb(softKey, remoteVersionInt);
      const oldSizeMb = isStealthTool ? Math.round(18 * (cur.versionInt / 10)) : window.softwareEngine.getItemSizeMb(softKey, cur.versionInt);
      const extraHdd = isStealthTool ? 0 : (newSizeMb - oldSizeMb);
      const freeHdd = window.softwareEngine.getMaxHddMb() - window.softwareEngine.getUsedHddMb();

      if (extraHdd > freeHdd) {
        return {
          success: false,
          code: 'LOCAL_HDD_FULL',
          message: `Seu HD está sem espaço para baixar ${SOFT_DISPLAY_NAMES[softKey]} v${(remoteVersionInt / 10).toFixed(1)}! Precisa de +${extraHdd} MB livres, mas seu disco só tem ${freeHdd} MB livres.`
        };
      }

      const finalizeCopy = () => {
        if (softKey === 'hider') {
          this.state.hiderVerInt = remoteVersionInt;
          this.save();
        } else if (softKey === 'seeker') {
          this.state.seekerVerInt = remoteVersionInt;
          this.save();
        } else {
          cur.versionInt = remoteVersionInt;
          // Regra Oficial HE (softwares.txt): binário baixado de outro servidor pode ser usado, mas NÃO vem licenciado p/ pesquisa (exceto recompensa Enigma)!
          cur.licensed = host.kind === 'puzzle';
          window.softwareEngine.save();
        }

        const route = window.bounceEngine
          ? window.bounceEngine.routeConnectionAndGetVisibleIp(host.ip)
          : { visibleIp: window.networkIdentity.getPublicIp() };

        if (window.internetEngine) {
          window.internetEngine.appendServerLog(
            host.ip,
            `${route.visibleIp} downloaded binary ${SOFT_DISPLAY_NAMES[softKey]} (v${(remoteVersionInt / 10).toFixed(1)}, ${newSizeMb}MB)`
          );
        }
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog(
            'DOWNLOAD-OK',
            `Software baixado de ${host.ip}: ${SOFT_DISPLAY_NAMES[softKey]} atualizado grátis para v${(remoteVersionInt / 10).toFixed(1)}!`,
            'success'
          );
        }
        if (window.currentProfile) {
          window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 30;
          if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
        }
        if (window.hackerAudio) window.hackerAudio.playCashChime();
        if (typeof window.showToast === 'function') {
          window.showToast(`Download concluído: ${SOFT_DISPLAY_NAMES[softKey]} agora é v${(remoteVersionInt / 10).toFixed(1)}!`);
        }
        if (window.internetEngine) window.internetEngine.render();
      };

      if (instant || !window.taskManager) {
        finalizeCopy();
        return { success: true, downloadedNow: true, newVersion: (remoteVersionInt / 10).toFixed(1) };
      }

      const myMbps = window.softwareEngine.getPlayerNetMbps();
      const idealSec = Math.max(2.0, Math.min(14.0, +(newSizeMb / Math.max(0.8, myMbps * 0.45)).toFixed(1)));

      const enq = window.taskManager.enqueue({
        dedupeKey: `dl_${host.ip}_${softKey}_${remoteVersionInt}`,
        title: `Download ${SOFT_DISPLAY_NAMES[softKey]} (v${(remoteVersionInt / 10).toFixed(1)})`,
        subtitle: `Rede · ${newSizeMb} MB de ${host.ip}`,
        targetIp: host.ip,
        queueKind: 'net',
        category: 'Rede',
        idealSeconds: idealSec,
        onComplete: finalizeCopy
      });

      if (!enq.started) return { success: false, message: enq.message };
      if (typeof window.showToast === 'function') {
        window.showToast(`Download iniciado no Task Manager (${newSizeMb} MB)!`);
      }
      return { success: true, queued: true, pid: enq.process.pid, message: 'Download adicionado ao Task Manager!' };
    }

    // Executar Seeker.skr no servidor invadido para revelar arquivos ocultos com Hider!
    runRemoteSeeker(host) {
      this.ensureLoaded();
      const reqSeeker = host.tier === 3 ? 2.0 : (host.tier === 2 ? 1.5 : 1.0);
      const mySeeker = this.getSeekerVer();
      if (mySeeker < reqSeeker) {
        return {
          success: false,
          code: 'SEEKER_TOO_WEAK',
          message: `Arquivos ocultos criptografados com Hider v${reqSeeker.toFixed(1)}! Seu Seeker.skr (v${mySeeker.toFixed(1)}) precisa ser evoluído para >= v${reqSeeker.toFixed(1)}.`
        };
      }
      this.revealedHosts.add(host.ip);
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('SEEKER-OK', `Seeker.skr (v${mySeeker.toFixed(1)}) revelou arquivos ocultos em ${host.ip}:/root!`, 'success');
      }
      if (window.internetEngine) window.internetEngine.render();
      return { success: true, message: `Seeker.skr revelou arquivo oculto secreto em ${host.ip}!` };
    }

    claimHiddenSecretFile(host) {
      if (this.claimedHiddenLoot.has(host.ip)) {
        return { success: false, message: 'Este cofre oculto já foi extraído.' };
      }
      this.claimedHiddenLoot.add(host.ip);
      const bonusCash = (host.tier || 1) * 140;
      const bonusSats = (host.tier || 1) * 28000;
      if (window.currentWallet) {
        window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) + bonusCash).toFixed(2);
      }
      if (window.bitcoinEngine) {
        window.bitcoinEngine.creditSats(bonusSats, 'SEEKER-LOOT', `Chave oculta revelada por Seeker.skr em ${host.ip}`);
      }
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.internetEngine) window.internetEngine.render();
      if (typeof window.showToast === 'function') {
        window.showToast(`Arquivo oculto extraído: +$ ${bonusCash} HC e +${(bonusSats / 100000000).toFixed(5)} BTC!`);
      }
      return { success: true, bonusCash, bonusSats };
    }

    renderXhdAndStealthPanelHtml() {
      this.ensureLoaded();
      const xhd = this.getXhdInfo();
      const inv = (window.softwareEngine && window.softwareEngine.ensureLoaded().inventory) || {};

      const backupRows = Object.entries(inv).map(([k, st]) => {
        const bak = this.state.backups[k];
        const sizeMb = window.softwareEngine ? window.softwareEngine.getItemSizeMb(k, st.versionInt) : 20;
        return `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--hc-border);font-size:0.79rem;gap:8px;flex-wrap:wrap;">
            <div>
              <strong style="font-family:var(--hc-font-mono);">${esc(SOFT_DISPLAY_NAMES[k] || k)}</strong>
              <span class="hc-badge info" style="margin-left:6px;">Local v${(st.versionInt / 10).toFixed(1)} (${sizeMb}MB)</span>
              ${bak ? `<span class="hc-badge success" style="margin-left:4px;">Backup XHD v${(bak.versionInt / 10).toFixed(1)}</span>` : ''}
            </div>
            <div style="display:flex;gap:6px;">
              <button type="button" id="btnXhdBackup_${esc(k)}" class="hc-btn ghost sm" ${xhd.capMb <= 0 ? 'disabled' : ''} onclick="window.handleXhdBackup('${esc(k)}')">Salvar no XHD</button>
              ${bak ? `<button type="button" id="btnXhdRestore_${esc(k)}" class="hc-btn primary sm" onclick="window.handleXhdRestore('${esc(k)}')">Restaurar</button>` : ''}
            </div>
          </div>
        `;
      }).join('');

      return `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px;margin-top:8px;">
          <!-- Ferramentas de Camuflagem Hider.hdr & Seeker.skr -->
          <div class="hc-card" style="padding:1.1rem;">
            <div class="hc-eyebrow" style="margin-bottom:8px;">Camuflagem Forense: Hider.hdr & Seeker.skr</div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--hc-border);">
              <div>
                <strong style="font-family:var(--hc-font-mono);">Hider.hdr</strong>
                <span class="hc-badge success" style="margin-left:6px;">v${this.getHiderVer().toFixed(1)}</span>
                <div style="font-size:0.75rem;color:var(--hc-text-2);">Esconde seus vírus contra Antivírus/Seekers mais fracos.</div>
              </div>
              <button type="button" id="btnUpgradeHider" class="hc-btn primary sm" onclick="window.handleUpgradeStealth('hider')">Evoluir Hider</button>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;">
              <div>
                <strong style="font-family:var(--hc-font-mono);">Seeker.skr</strong>
                <span class="hc-badge info" style="margin-left:6px;">v${this.getSeekerVer().toFixed(1)}</span>
                <div style="font-size:0.75rem;color:var(--hc-text-2);">Revela cofres e arquivos ocultos em servidores invadidos.</div>
              </div>
              <button type="button" id="btnUpgradeSeeker" class="hc-btn primary sm" onclick="window.handleUpgradeStealth('seeker')">Evoluir Seeker</button>
            </div>
          </div>

          <!-- Cofre HD Externo (XHD) -->
          <div class="hc-card" style="padding:1.1rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
              <div>
                <div class="hc-eyebrow">Cofre de Backup · HD Externo (XHD)</div>
                <strong style="font-size:0.9rem;">${esc(xhd.name)} (${xhd.usedMb} / ${xhd.capMb} MB)</strong>
              </div>
              ${xhd.nextTier
                ? `<button type="button" id="btnBuyXhd" class="hc-btn primary sm" onclick="window.handleBuyXhd()">Comprar ${esc(xhd.nextTier.name)} ($ ${xhd.nextTier.price.toLocaleString('pt-BR')})</button>`
                : `<span class="hc-badge success">Capacidade Máxima</span>`}
            </div>
            <div style="max-height:195px;overflow-y:auto;padding-right:4px;">
              ${backupRows}
            </div>
          </div>
        </div>
      `;
    }
  }

  window.bounceEngine = new BounceProxyEngine();
  window.stealthXhdEngine = new StealthAndXhdEngine();

  window.handleUpgradeStealth = function (toolKey) {
    const res = window.stealthXhdEngine.upgradeStealthTool(toolKey);
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };

  window.handleBuyXhd = function () {
    const res = window.stealthXhdEngine.buyNextXhdTier();
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };

  window.handleXhdBackup = function (softKey) {
    const res = window.stealthXhdEngine.backupSoftwareToXhd(softKey);
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };

  window.handleXhdRestore = function (softKey) {
    const res = window.stealthXhdEngine.restoreSoftwareFromXhd(softKey);
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };
})();
