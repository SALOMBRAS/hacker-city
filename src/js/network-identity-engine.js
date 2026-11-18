/**
 * Hacker City // Bloco 1 MMO:
 * 1. NetworkIdentityEngine — IP Público Aleatório Único por Jogador + Troca Grátis 1x/Semana (7 dias)
 * 2. HackedDatabaseEngine  — Caderno Persistente de IPs, Senhas, Exploits e Notas
 * 3. InternetBrowserEngine — Navegação Real por IP (Página / Entrar SSH Root / Invadir / Logs Editáveis)
 */
(function () {
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias exatos (168h)
  const RESERVED_FIRST_OCTETS = new Set([0, 10, 33, 71, 77, 100, 109, 127, 133, 155, 169, 172, 185, 192, 198, 203, 224, 240, 255]);

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function hashStr(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function deterministicPassword(seedStr) {
    const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let h = hashStr('PWD::' + seedStr);
    let out = '';
    for (let i = 0; i < 8; i++) {
      h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
      out += chars[h % chars.length];
    }
    return out;
  }

  function randomRootPassword() {
    const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 8; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }

  function isValidIpv4(ip) {
    const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec((ip || '').trim());
    if (!m) return false;
    return [m[1], m[2], m[3], m[4]].every((n) => {
      const v = Number(n);
      return Number.isInteger(v) && v >= 0 && v <= 255;
    });
  }

  // =========================================================================
  // 1. MOTOR DE IDENTIDADE DE REDE & TROCA SEMANAL DE IP (ISP DHCP)
  // =========================================================================
  class NetworkIdentityEngine {
    constructor() {
      this.userId = null;
      this.state = null;
    }

    storageKey(uid) {
      return `HC_NET_IDENTITY_${uid || 'guest'}`;
    }

    generateRandomPublicIp(excludeSet = new Set()) {
      for (let attempt = 0; attempt < 300; attempt++) {
        const o1 = 11 + Math.floor(Math.random() * 212); // 11..222
        if (RESERVED_FIRST_OCTETS.has(o1)) continue;
        const o2 = 1 + Math.floor(Math.random() * 253);
        const o3 = 1 + Math.floor(Math.random() * 253);
        const o4 = 2 + Math.floor(Math.random() * 252);
        const candidate = `${o1}.${o2}.${o3}.${o4}`;
        if (!excludeSet.has(candidate)) return candidate;
      }
      return `142.${10 + Math.floor(Math.random() * 200)}.${10 + Math.floor(Math.random() * 200)}.${2 + Math.floor(Math.random() * 240)}`;
    }

    ensureForProfile(profile) {
      const uid = (profile && profile.id) || 'guest';
      if (this.userId === uid && this.state) {
        if (profile && profile.public_ip && profile.public_ip !== this.state.publicIp) {
          this.state.publicIp = profile.public_ip;
          this.save();
        }
        return this.state;
      }

      this.userId = uid;
      let loaded = null;
      try {
        const raw = localStorage.getItem(this.storageKey(uid));
        if (raw) loaded = JSON.parse(raw);
      } catch (e) {}

      if (loaded && loaded.publicIp && isValidIpv4(loaded.publicIp)) {
        this.state = loaded;
      } else {
        this.state = {
          publicIp: (profile && profile.public_ip) || this.generateRandomPublicIp(),
          rootPassword: (profile && profile.root_password) || randomRootPassword(),
          resetsCount: (profile && profile.ip_resets_count) || 0,
          lastFreeResetAt: (profile && profile.last_free_ip_reset_at) ? new Date(profile.last_free_ip_reset_at).getTime() : null,
          history: []
        };
        this.save();
      }

      if (profile) {
        profile.public_ip = this.state.publicIp;
        profile.root_password = this.state.rootPassword;
      }
      return this.state;
    }

    save() {
      if (!this.state) return;
      try {
        localStorage.setItem(this.storageKey(this.userId), JSON.stringify(this.state));
      } catch (e) {}
    }

    getPublicIp() {
      this.ensureForProfile(window.currentProfile);
      return this.state.publicIp;
    }

    getRootPassword() {
      this.ensureForProfile(window.currentProfile);
      return this.state.rootPassword;
    }

    getWeeklyResetStatus() {
      this.ensureForProfile(window.currentProfile);
      const now = Date.now();
      const last = this.state.lastFreeResetAt;
      const canResetFree = !last || (now >= last + WEEK_MS);
      const msRemaining = canResetFree ? 0 : Math.max(0, (last + WEEK_MS) - now);
      // Taxa emergencial pesada: $ 50.000 HC na 1ª emergência após gastar a semanal grátis, +$ 25.000 por reincidência (teto $ 250.000 HC)
      const paidCost = Math.min(250000, 50000 + (25000 * Math.max(0, (this.state.resetsCount || 1) - 1)));
      const paidCostFmt = paidCost.toLocaleString('pt-BR');

      return {
        canResetFree,
        msRemaining,
        formattedRemaining: this.formatDuration(msRemaining),
        nextFreeDateStr: last ? new Date(last + WEEK_MS).toLocaleString('pt-BR') : 'Disponível agora',
        paidCost,
        paidCostFmt,
        resetsCount: this.state.resetsCount || 0,
        lastFreeResetAt: last,
        history: this.state.history || []
      };
    }

    formatDuration(ms) {
      if (ms <= 0) return 'Disponível agora';
      const totalMinutes = Math.ceil(ms / 60000);
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const mins = totalMinutes % 60;
      if (days > 0) return `${days}d ${hours}h ${mins}m`;
      if (hours > 0) return `${hours}h ${mins}m`;
      return `${mins}m`;
    }

    async resetPublicIp(allowPaid = false) {
      this.ensureForProfile(window.currentProfile);
      const status = this.getWeeklyResetStatus();
      const oldIp = this.state.publicIp;

      if (!status.canResetFree && !allowPaid) {
        return {
          success: false,
          code: 'COOLDOWN_ACTIVE',
          requiredCost: status.paidCost,
          formattedRemaining: status.formattedRemaining,
          message: `Sua troca gratuita semanal já foi usada! Próxima grátis em ${status.formattedRemaining} (ou pague $ ${status.paidCostFmt} HC para troca emergencial imediata).`
        };
      }

      if (!status.canResetFree && allowPaid) {
        if (!window.currentWallet || parseFloat(window.currentWallet.balance) < status.paidCost) {
          return {
            success: false,
            code: 'INSUFFICIENT_FUNDS',
            message: `Saldo insuficiente! A troca emergencial antes de 7 dias custa $ ${status.paidCostFmt} HC.`
          };
        }
      }

      let newIp = null;
      let wasFree = status.canResetFree;
      let costPaid = wasFree ? 0 : status.paidCost;

      // 1. Tentar RPC oficial no PostgreSQL primeiro (se migration aplicada na nuvem)
      if (window.supabase && typeof window.supabase.rpc === 'function' && window.currentProfile) {
        try {
          const { data, error } = await window.supabase.rpc('reset_player_ip', { p_force_paid: !!allowPaid });
          if (!error && data && data.success) {
            newIp = data.new_ip;
            wasFree = !!data.was_free;
            costPaid = Number(data.cost || 0);
            if (data.new_balance != null && window.currentWallet) {
              window.currentWallet.balance = Number(data.new_balance);
            }
            if (data.next_free_at) {
              this.state.lastFreeResetAt = new Date(data.next_free_at).getTime() - WEEK_MS;
            }
          } else if (!wasFree && allowPaid) {
            // Cobrança real via RPC existente buy_black_market_item caso reset_player_ip ainda não tenha sido colado no SQL Editor
            const { data: bData } = await window.supabase.rpc('buy_black_market_item', {
              p_item_type: 'isp_emergency_ip_reset',
              p_cost: costPaid
            });
            if (bData && bData.new_balance !== undefined && window.currentWallet) {
              window.currentWallet.balance = Number(bData.new_balance);
            } else if (window.currentWallet) {
              window.currentWallet.balance = Math.max(0, parseFloat(window.currentWallet.balance) - costPaid);
            }
          }
        } catch (e) {
          if (!wasFree && allowPaid && window.currentWallet) {
            window.currentWallet.balance = Math.max(0, parseFloat(window.currentWallet.balance) - costPaid);
          }
        }
      } else if (!wasFree && allowPaid && window.currentWallet) {
        window.currentWallet.balance = Math.max(0, parseFloat(window.currentWallet.balance) - costPaid);
      }

      if (!newIp) {
        const exclude = new Set([oldIp]);
        (this.state.history || []).forEach((h) => { exclude.add(h.from); exclude.add(h.to); });
        newIp = this.generateRandomPublicIp(exclude);
        if (wasFree) {
          this.state.lastFreeResetAt = Date.now();
        }
      }

      this.state.publicIp = newIp;
      this.state.resetsCount = (this.state.resetsCount || 0) + 1;
      this.state.history = [
        {
          from: oldIp,
          to: newIp,
          at: new Date().toLocaleString('pt-BR'),
          mode: wasFree ? 'Cota Gratuita Semanal (7d)' : `Emergencial ($ ${costPaid} HC)`
        },
        ...(this.state.history || []).slice(0, 9)
      ];
      this.save();

      if (window.currentProfile) {
        window.currentProfile.public_ip = newIp;
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 50;
      }

      // Efeitos reais de gameplay (inspirado em HE Process::RESET_IP):
      // 1. Derrubar sessões SSH abertas que usavam o gateway antigo
      if (window.internetEngine && window.internetEngine.activeSshIp) {
        window.internetEngine.disconnectSsh(true);
      }
      // 2. Registrar no /var/log/auth.log local
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog(
          'ISP-DHCP',
          `IP público alterado de ${oldIp} para ${newIp} (${wasFree ? 'Grátis 1x/semana' : '-$ ' + costPaid + ' HC'}) [+50 REP]`,
          'success'
        );
      }
      if (window.safenetFbiEngine) {
        window.safenetFbiEngine.onPlayerIpChanged(oldIp, newIp);
      }
      if (window.hackerAudio) window.hackerAudio.playCashChime();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.internetEngine && window.winManager && window.winManager.current === 'winBrowser') {
        window.internetEngine.render();
      }

      return {
        success: true,
        wasFree,
        cost: costPaid,
        oldIp,
        newIp,
        message: `Novo IP público atribuído pelo provedor: ${newIp} (${wasFree ? 'Troca semanal gratuita utilizada' : 'Taxa $ ' + costPaid + ' HC'})!`
      };
    }

    resetRootPassword() {
      this.ensureForProfile(window.currentProfile);
      const oldPwd = this.state.rootPassword;
      let nextPwd = randomRootPassword();
      while (nextPwd === oldPwd) nextPwd = randomRootPassword();
      this.state.rootPassword = nextPwd;
      this.save();
      if (window.currentProfile) window.currentProfile.root_password = nextPwd;
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('PASSWD', `Senha root local rotacionada com sucesso (acessos invasores antigos revogados)`, 'info');
      }
      if (window.hackerAudio) window.hackerAudio.playKeyClick();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.internetEngine && window.winManager && window.winManager.current === 'winBrowser') {
        window.internetEngine.render();
      }
      return nextPwd;
    }

    copyMyIp(ev) {
      if (ev) ev.stopPropagation();
      const ip = this.getPublicIp();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ip).catch(() => {});
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`Seu IP público (${ip}) foi copiado!`);
      }
    }

    renderProfileIpCard(containerId = 'profileIpCardMount') {
      const el = document.getElementById(containerId);
      if (!el) return;
      const ip = this.getPublicIp();
      const pwd = this.getRootPassword();
      const st = this.getWeeklyResetStatus();

      el.innerHTML = `
        <div class="hc-card" style="padding: 1rem; margin-top: 1rem; border-color: var(--hc-border-strong);">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.65rem;">
            <div>
              <div class="hc-eyebrow">Identidade de Rede & Provedor (HC Telecom ISP)</div>
              <div style="display: flex; align-items: center; gap: 0.6rem; margin-top: 0.25rem; flex-wrap: wrap;">
                <span style="font-family: var(--hc-font-mono); font-size: 1.15rem; font-weight: 700; color: var(--hc-accent-text);">${esc(ip)}</span>
                ${st.canResetFree
                  ? '<span class="hc-badge success">1 troca grátis disponível (1x/semana)</span>'
                  : `<span class="hc-badge warn">Próxima grátis em ${esc(st.formattedRemaining)}</span>`}
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${st.canResetFree
                ? `<button type="button" class="hc-btn primary sm" onclick="window.handleIpResetAction(false, this)">Trocar IP Agora (Grátis)</button>`
                : `<button type="button" class="hc-btn sm" style="border-color: var(--hc-warning); color: var(--hc-warning);" onclick="window.handleIpResetAction(true, this)">Troca Emergencial ($ ${st.paidCostFmt} HC)</button>`}
              <button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('71.4.5.1')">Abrir Provedor ISP</button>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; font-size: 0.8rem; color: var(--hc-text-2); border-top: 1px solid var(--hc-border); padding-top: 0.6rem;">
            <span>Senha Root do seu PC: <code style="font-family: var(--hc-font-mono); color: var(--hc-text);">${esc(pwd)}</code></span>
            <button type="button" class="hc-btn ghost sm" onclick="window.handleRootPwdReset()">Gerar nova senha root</button>
          </div>
        </div>
      `;
    }
  }

  // =========================================================================
  // 2. HACKED DATABASE ENGINE (CADERNO DE SERVIDORES INVADIDOS)
  // =========================================================================
  class HackedDatabaseEngine {
    constructor() {
      this.userId = null;
      this.entries = [];
      this.activeSection = 'servers'; // 'servers' | 'banks'
      this.filterKind = 'all';
      this.searchQuery = '';
    }

    storageKey(uid) {
      return `HC_HACKED_DB_${uid || 'guest'}`;
    }

    ensureLoaded() {
      const uid = (window.currentProfile && window.currentProfile.id) || 'guest';
      if (this.userId === uid && Array.isArray(this.entries)) return;
      this.userId = uid;
      try {
        const raw = localStorage.getItem(this.storageKey(uid));
        this.entries = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(this.entries)) this.entries = [];
      } catch (e) {
        this.entries = [];
      }
    }

    save() {
      try {
        localStorage.setItem(this.storageKey(this.userId || 'guest'), JSON.stringify(this.entries));
      } catch (e) {}
    }

    getEntry(ip) {
      this.ensureLoaded();
      return this.entries.find((e) => e.ip === ip) || null;
    }

    getAll() {
      this.ensureLoaded();
      return this.entries;
    }

    upsertHost(meta) {
      this.ensureLoaded();
      if (!meta || !meta.ip) return null;
      const existing = this.entries.find((e) => e.ip === meta.ip);
      if (existing) {
        existing.hostname = meta.hostname || existing.hostname;
        existing.kind = meta.kind || existing.kind;
        existing.tier = meta.tier || existing.tier;
        existing.accessMethod = meta.accessMethod || existing.accessMethod;
        if (meta.password) existing.password = meta.password;
        if (meta.cpuSpec) existing.cpuSpec = meta.cpuSpec;
        existing.updatedAt = new Date().toLocaleString('pt-BR');
      } else {
        this.entries.unshift({
          ip: meta.ip,
          hostname: meta.hostname || meta.ip,
          kind: meta.kind || 'bot',
          tier: meta.tier || 1,
          accessMethod: meta.accessMethod || 'password',
          password: meta.password || 'EXPLOITED',
          cpuSpec: meta.cpuSpec || '2c @ 2.4GHz',
          notes: meta.notes || '',
          favorite: !!meta.favorite,
          hackedAt: new Date().toLocaleString('pt-BR')
        });
      }
      this.save();
      this.renderUI();
      return this.getEntry(meta.ip);
    }

    toggleFavorite(ip) {
      this.ensureLoaded();
      const item = this.entries.find((e) => e.ip === ip);
      if (item) {
        item.favorite = !item.favorite;
        this.save();
        return item.favorite;
      }
      return false;
    }

    saveNote(ip, noteText) {
      this.ensureLoaded();
      const item = this.entries.find((e) => e.ip === ip);
      if (item) {
        item.notes = String(noteText || '').slice(0, 180);
        this.save();
        if (typeof window.showToast === 'function') window.showToast(`Nota salva para ${ip}.`);
      }
    }

    removeHost(ip) {
      this.ensureLoaded();
      this.entries = this.entries.filter((e) => e.ip !== ip);
      this.save();
      this.renderUI();
    }

    setFilter(kind) {
      this.filterKind = kind;
      this.renderUI();
    }

    setSearch(q) {
      this.searchQuery = q || '';
      this.renderUI();
    }

    renderUI(containerId = 'hackedDbBody') {
      const container = document.getElementById(containerId);
      if (!container) return;
      this.ensureLoaded();

      const q = this.searchQuery.trim().toLowerCase();
      const filtered = this.entries.filter((e) => {
        if (this.filterKind !== 'all') {
          if (this.filterKind === 'npc' && !['empresa', 'banco', 'isp', 'whois', 'download', 'darknet', 'federal', 'underground'].includes(e.kind)) return false;
          if (this.filterKind === 'bot' && e.kind !== 'bot') return false;
          if (this.filterKind === 'player' && e.kind !== 'player') return false;
        }
        if (!q) return true;
        return e.ip.toLowerCase().includes(q) || (e.hostname || '').toLowerCase().includes(q) || (e.notes || '').toLowerCase().includes(q);
      });

      const filters = [
        ['all', `Todos (${this.entries.length})`],
        ['bot', 'Bots'],
        ['npc', 'Empresas & NPCs'],
        ['player', 'Jogadores']
      ];

      const rowsHtml = filtered.length === 0
        ? `<div class="hc-card" style="padding: 2rem; text-align: center; color: var(--hc-text-2);">
             <div style="font-weight: 600; color: var(--hc-text); margin-bottom: 0.35rem;">Nenhum servidor salvo neste filtro</div>
             <div style="font-size: 0.85rem; margin-bottom: 1rem;">Invada servidores pela aba <strong>Internet</strong> ou pelo <strong>Cracker</strong> para armazenar automaticamente IPs e senhas root aqui.</div>
             <button type="button" class="hc-btn primary" onclick="window.internetEngine.openIp('203.17.88.40', 'invadir')">Invadir Farofa Systems (203.17.88.40)</button>
           </div>`
        : filtered.map((e) => {
            const kindLabel = e.kind === 'bot' ? `Bot Tier ${e.tier || 1}` : (e.kind === 'player' ? 'Jogador VPC' : e.kind.toUpperCase());
            return `
              <div class="hdb-row">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <button type="button" class="hc-btn ghost sm" style="padding: 0; border: 0; font-family: var(--hc-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--hc-accent-text);" onclick="window.internetEngine.openIp('${esc(e.ip)}')">${esc(e.ip)}</button>
                    <span class="hc-badge info">${esc(kindLabel)}</span>
                  </div>
                  <div style="font-size: 0.82rem; color: var(--hc-text-2); margin-top: 2px;">${esc(e.hostname)} · <span style="color: var(--hc-text-3);">${esc(e.cpuSpec || '')}</span></div>
                </div>

                <div>
                  <div style="font-size: 0.7rem; color: var(--hc-text-3); text-transform: uppercase; margin-bottom: 3px;">Credencial Root</div>
                  <span class="hdb-pwd-chip">root : <strong style="color: var(--hc-accent-text);">${esc(e.password)}</strong></span>
                </div>

                <div style="display: flex; gap: 6px; align-items: center;">
                  <input type="text" class="form-input" style="padding: 0.35rem 0.6rem; font-size: 0.78rem;" placeholder="Anotação (ex: tem $850, bom p/ minerar)..." value="${esc(e.notes || '')}" onchange="window.hackedDb.saveNote('${esc(e.ip)}', this.value)">
                </div>

                <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end;">
                  <button type="button" class="hc-btn primary sm" onclick="window.internetEngine.quickSshConnect('${esc(e.ip)}')">Conectar SSH</button>
                  <button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('${esc(e.ip)}')">Abrir</button>
                  <button type="button" class="hc-btn ghost sm" style="color: var(--hc-danger-text);" onclick="window.hackedDb.removeHost('${esc(e.ip)}')">Remover</button>
                </div>
              </div>
            `;
          }).join('');

      const bankAccCount = window.multiBankEngine
        ? (window.multiBankEngine.ensureLoaded().hackedAccounts || []).length
        : 0;

      const sectionTabsHtml = `
        <div style="display:flex;gap:8px;border-bottom:1px solid var(--hc-border);padding-bottom:10px;margin-bottom:12px;flex-wrap:wrap;">
          <button type="button" id="tabHdbServers" class="hc-btn sm ${this.activeSection !== 'banks' ? 'primary' : 'ghost'}" onclick="window.hackedDb.activeSection='servers';window.hackedDb.renderUI();">
            Servidores Invadidos (${this.entries.length})
          </button>
          <button type="button" id="tabHdbBanks" class="hc-btn sm ${this.activeSection === 'banks' ? 'primary' : 'ghost'}" onclick="window.hackedDb.activeSection='banks';window.hackedDb.renderUI();">
            Contas Bancárias Hackeadas (${bankAccCount})
          </button>
        </div>
      `;

      if (this.activeSection === 'banks' && window.multiBankEngine) {
        container.innerHTML = sectionTabsHtml + window.multiBankEngine.renderHackedBankAccountsHtml();
        return;
      }

      container.innerHTML = `
        ${sectionTabsHtml}
        <div class="hdb-toolbar">
          <div class="hdb-filters">
            ${filters.map(([k, lbl]) => `
              <button type="button" class="hc-btn sm ${this.filterKind === k ? 'primary' : 'ghost'}" onclick="window.hackedDb.setFilter('${k}')">${lbl}</button>
            `).join('')}
          </div>
          <div style="min-width: 240px;">
            <input type="text" class="form-input" style="padding: 0.4rem 0.75rem; font-size: 0.82rem;" placeholder="Filtrar por IP, hostname ou nota..." value="${esc(this.searchQuery)}" oninput="window.hackedDb.setSearch(this.value)">
          </div>
        </div>
        <div class="hdb-list">${rowsHtml}</div>
      `;
    }
  }

  // =========================================================================
  // 3. INTERNET BROWSER ENGINE (NAVEGAÇÃO REAL POR IP + SSH ROOT + LOG EDIT)
  // =========================================================================
  const WORLD_NPC_HOSTS = {
    '71.4.20.1': {
      ip: '71.4.20.1',
      domain: 'whois.hc',
      hostname: 'First Whois Directory',
      kind: 'whois',
      badge: 'Diretório Oficial',
      tier: 1,
      securityLevel: 2,
      cpuMhz: 3400,
      netMbps: 500,
      hddTotalMb: 1024,
      hddOsBaseMb: 600,
      ramTotalMb: 512,
      ramOsBaseMb: 280,
      hasherVer: 1.5,
      firewallVer: 1.5,
      antivirusVer: 2.0,
      cpuSpec: '3.400 MHz · 500 Mbps · AV v2.0',
      bankBalance: 0,
      files: [
        { name: 'backbone_routes.txt', size: '12 MB', sizeMb: 12, content: 'Rotas troncais: ISP 71.4.5.1 | Download 33.8.2.71 | Banco 77.3.9.21 | Safenet 109.64.211.37' }
      ]
    },
    '71.4.5.1': {
      ip: '71.4.5.1',
      domain: 'isp.hc',
      hostname: 'HC Telecom — Provedor Central ISP',
      kind: 'isp',
      badge: 'Provedor ISP',
      tier: 2,
      securityLevel: 3,
      cpuMhz: 8000,
      netMbps: 1000,
      hddTotalMb: 4096,
      hddOsBaseMb: 2100,
      ramTotalMb: 2048,
      ramOsBaseMb: 900,
      hasherVer: 3.0,
      firewallVer: 3.0,
      antivirusVer: 3.0,
      cpuSpec: '8.000 MHz · 1.000 Mbps · AV v3.0',
      bankBalance: 480,
      files: [
        { name: 'dhcp_leases.conf', size: '36 MB', sizeMb: 36, content: 'Política DHCP: 1 renovação gratuita de IPv4 a cada 7 dias (Emergencial: $ 50.000 HC).' }
      ]
    },
    '33.8.2.71': {
      ip: '33.8.2.71',
      domain: 'download.hc',
      hostname: 'Download Center OpenRepo',
      kind: 'download',
      badge: 'Repositório Público',
      tier: 1,
      securityLevel: 1,
      cpuMhz: 2400,
      netMbps: 250,
      hddTotalMb: 1024,
      hddOsBaseMb: 520,
      ramTotalMb: 512,
      ramOsBaseMb: 240,
      hasherVer: 1.0,
      firewallVer: 1.0,
      antivirusVer: 1.5,
      cpuSpec: '2.400 MHz · 250 Mbps · AV v1.5',
      bankBalance: 90,
      files: [
        { name: 'Cracker.crc (v1.0)', size: '26 MB', sizeMb: 26, content: 'Utilitário padrão de força-bruta SSH v1.0.' },
        { name: 'PortScan.scan (v1.0)', size: '14 MB', sizeMb: 14, content: 'Scanner rápido de portas TCP/UDP.' },
        { name: 'LogCleaner.sh (v1.0)', size: '8 MB', sizeMb: 8, content: 'Script auxiliar de truncamento de /var/log/syslog.' }
      ]
    },
    '203.17.88.40': {
      ip: '203.17.88.40',
      domain: 'farofa.hc',
      hostname: 'Farofa Systems S.A.',
      kind: 'empresa',
      badge: 'Empresa',
      tier: 1,
      securityLevel: 1,
      cpuMhz: 2200,
      netMbps: 100,
      hddTotalMb: 380,
      hddOsBaseMb: 210,
      ramTotalMb: 256,
      ramOsBaseMb: 120,
      hasherVer: 1.0,
      firewallVer: 1.0,
      antivirusVer: 1.5,
      cpuSpec: '2.200 MHz · 100 Mbps · HDD 380MB · AV v1.5',
      bankBalance: 185,
      files: [
        { name: 'clientes_b2b.csv', size: '42 MB', sizeMb: 42, content: 'Parceiros ativos: Rádio Pirata (133.70.13.37) e Gateway Safenet (109.64.211.37).' },
        { name: 'caixa_interno.dat', size: '28 MB', sizeMb: 28, content: 'Reserva operacional disponível para wire transfer.' }
      ]
    },
    '133.70.13.37': {
      ip: '133.70.13.37',
      domain: 'radio1337.hc',
      hostname: 'Rádio Pirata 1337 FM',
      kind: 'underground',
      badge: 'Underground',
      tier: 1,
      securityLevel: 1,
      cpuMhz: 1200,
      netMbps: 25,
      hddTotalMb: 190,
      hddOsBaseMb: 115,
      ramTotalMb: 128,
      ramOsBaseMb: 74,
      hasherVer: 1.0,
      firewallVer: 1.0,
      antivirusVer: 1.0,
      cpuSpec: '1.200 MHz · 25 Mbps · HDD 190MB (Apertado!) · AV v1.0',
      bankBalance: 110,
      files: [
        { name: 'acervo_mp3_pirata.tar', size: '40 MB', sizeMb: 40, content: 'Arquivo pesado ocupando quase todo o HD da rádio! Apague p/ liberar espaço p/ vírus.' }
      ]
    },
    '77.3.9.21': {
      ip: '77.3.9.21',
      domain: 'bank.hc',
      hostname: 'Banco Colchão & Clearing HC',
      kind: 'banco',
      badge: 'Instituição Bancária',
      tier: 3,
      securityLevel: 3,
      cpuMhz: 12000,
      netMbps: 1000,
      hddTotalMb: 8192,
      hddOsBaseMb: 3200,
      ramTotalMb: 4096,
      ramOsBaseMb: 1600,
      hasherVer: 2.5,
      firewallVer: 2.5,
      antivirusVer: 3.0,
      cpuSpec: '12.000 MHz · 1.000 Mbps · HDD 8GB · AV v3.0',
      bankBalance: 1150,
      files: [
        { name: 'swift_ledger.enc', size: '120 MB', sizeMb: 120, content: 'Ledger interbancário protegido por criptografia bancária.' }
      ]
    },
    '185.220.101.9': {
      ip: '185.220.101.9',
      domain: 'blackmarket.onion',
      hostname: 'Blackmarket Onion // Loja Clandestina',
      kind: 'darknet',
      badge: 'Darknet Market',
      tier: 2,
      securityLevel: 2,
      cpuMhz: 4800,
      netMbps: 250,
      hddTotalMb: 2048,
      hddOsBaseMb: 980,
      ramTotalMb: 1024,
      ramOsBaseMb: 460,
      hasherVer: 1.5,
      firewallVer: 1.5,
      antivirusVer: 2.0,
      cpuSpec: '4.800 MHz · 250 Mbps · HDD 2GB · AV v2.0',
      bankBalance: 420,
      files: [
        { name: 'catalogo_0day.gpg', size: '32 MB', sizeMb: 32, content: 'Exploits v2 e limpadores de ficha policial.' }
      ]
    },
    '109.64.211.37': {
      ip: '109.64.211.37',
      domain: 'safenet.hc',
      hostname: 'Safenet Cyber Tracking Authority',
      kind: 'federal',
      badge: 'Autoridade Safenet',
      tier: 3,
      securityLevel: 3,
      cpuMhz: 16000,
      netMbps: 1000,
      hddTotalMb: 16384,
      hddOsBaseMb: 6000,
      ramTotalMb: 8192,
      ramOsBaseMb: 3000,
      hasherVer: 3.5,
      firewallVer: 3.5,
      antivirusVer: 4.0,
      cpuSpec: '16.000 MHz · 1.000 Mbps · AV v4.0',
      bankBalance: 890,
      files: [
        { name: 'fwd_to_fbi.log', size: '64 MB', sizeMb: 64, content: 'Monitoramento forense ativo sobre transferências ilícitas e ataques sem bounce.' }
      ]
    },
    '198.51.100.42': {
      ip: '198.51.100.42',
      domain: 'numataka-training.hc',
      hostname: 'Servidor Treinamento Numataka',
      kind: 'empresa',
      badge: 'Alvo Tutorial',
      tier: 1,
      securityLevel: 1,
      cpuMhz: 1000,
      netMbps: 20,
      hddTotalMb: 250,
      hddOsBaseMb: 130,
      ramTotalMb: 128,
      ramOsBaseMb: 64,
      hasherVer: 1.0,
      firewallVer: 1.0,
      antivirusVer: 0,
      cpuSpec: '1.000 MHz · 20 Mbps · HDD 250MB · Sem Antivírus',
      bankBalance: 65,
      files: [
        { name: 'readme_operador.txt', size: '8 MB', sizeMb: 8, content: 'Bem-vindo à prova prática de Ensei Tankado. Extraia o dossiê e limpe seu IP na aba Logs!' }
      ]
    }
  };

  // Operadores VPC presentes na sub-rede pública (além dos jogadores reais carregados do Supabase)
  const SEEDED_PLAYER_VPCS = {
    '149.56.28.11': {
      ip: '149.56.28.11',
      hostname: 'VPC Operador m4riposa',
      hacker_tag: 'm4riposa',
      reputation: 8240,
      specialty: 'exploiter',
      tier: 2,
      securityLevel: 2,
      cpuMhz: 4000,
      netMbps: 150,
      hddTotalMb: 1024,
      hddOsBaseMb: 540,
      ramTotalMb: 512,
      ramOsBaseMb: 240,
      hasherVer: 1.5,
      firewallVer: 1.5,
      antivirusVer: 2.0,
      cpuSpec: '4.000 MHz · 150 Mbps · AV v2.0',
      bankBalance: 340
    },
    '91.134.72.19': {
      ip: '91.134.72.19',
      hostname: 'VPC Operador nyx_0day',
      hacker_tag: 'nyx_0day',
      reputation: 1450,
      specialty: 'botmaster',
      tier: 2,
      securityLevel: 2,
      cpuMhz: 2800,
      netMbps: 80,
      hddTotalMb: 640,
      hddOsBaseMb: 360,
      ramTotalMb: 384,
      ramOsBaseMb: 190,
      hasherVer: 1.5,
      firewallVer: 1.5,
      antivirusVer: 1.5,
      cpuSpec: '2.800 MHz · 80 Mbps · AV v1.5',
      bankBalance: 210
    },
    '177.84.19.62': {
      ip: '177.84.19.62',
      hostname: 'VPC Operador rookie_br',
      hacker_tag: 'rookie_br',
      reputation: 65, // < 100 REP -> Proteção de Iniciante!
      specialty: 'sentinel',
      tier: 1,
      securityLevel: 1,
      cpuMhz: 800,
      netMbps: 1,
      hddTotalMb: 350,
      hddOsBaseMb: 260,
      ramTotalMb: 256,
      ramOsBaseMb: 140,
      hasherVer: 1.0,
      firewallVer: 1.0,
      antivirusVer: 1.0,
      cpuSpec: '800 MHz · 1 Mbps · Protegido (<100 REP)',
      bankBalance: 95
    }
  };

  const IMPORTANT_BOOKMARKS = [
    { ip: '198.51.100.42', label: 'Alvo Tutorial Numataka' },
    { ip: '109.64.200.10', label: 'First Puzzle (Trilha de Enigmas)' },
    { ip: '71.4.5.1', label: 'HC Telecom ISP (Trocar IP)' },
    { ip: '71.4.20.1', label: 'First Whois' },
    { ip: '203.17.88.40', label: 'Farofa Systems' },
    { ip: '33.8.2.71', label: 'Download Center' },
    { ip: '77.3.9.21', label: 'First Bank / Colchão HC' },
    { ip: '77.3.10.44', label: 'HEBC Clearing Bank' },
    { ip: '77.3.12.15', label: 'Swiss Offshore Vault' },
    { ip: '185.220.101.9', label: 'Blackmarket Onion' },
    { ip: '133.70.13.37', label: 'Rádio Pirata 1337 FM' },
    { ip: '109.64.211.37', label: 'Safenet Authority' }
  ];

  class InternetBrowserEngine {
    constructor() {
      this.currentIp = '203.17.88.40';
      this.activeTab = 'pagina'; // 'pagina' | 'entrar' | 'invadir'
      this.sshSubTab = 'logs';   // 'logs' | 'files' | 'hw'
      this.history = ['203.17.88.40'];
      this.historyIdx = 0;
      this.recentIps = ['203.17.88.40', '71.4.5.1', '71.4.20.1', '33.8.2.71'];
      this.favorites = new Set(['71.4.5.1', '203.17.88.40']);
      this.portScannedIps = new Set();
      this.drainedNpcIps = new Set();
      this.deletedHostFiles = new Map(); // ip -> Set(fileName)
      this.deletedHostFileMb = new Map(); // ip -> number (compatibilidade extra)
      this.activeSshIp = null;
      this.isCracking = false;
      this.crackPct = 0;
      this.cloudPlayersByIp = {};
      this.whoisQueryResult = null;
    }

    async syncCloudPlayers() {
      if (!window.supabase) return;
      try {
        const { data } = await window.supabase
          .from('profiles')
          .select('id, hacker_tag, specialty, reputation, public_ip')
          .not('public_ip', 'is', null)
          .limit(50);
        if (Array.isArray(data)) {
          data.forEach((p) => {
            if (p.public_ip) this.cloudPlayersByIp[p.public_ip] = p;
          });
        }
      } catch (e) {}
    }

    openIp(ipOrDomain, tab = null) {
      if (typeof window.navTo === 'function') window.navTo('winBrowser');
      this.navigate(ipOrDomain, tab);
    }

    quickSshConnect(ip) {
      if (typeof window.navTo === 'function') window.navTo('winBrowser');
      const saved = window.hackedDb ? window.hackedDb.getEntry(ip) : null;
      this.navigate(ip, 'entrar');
      if (saved) {
        this.connectSsh(ip, saved.password, saved.accessMethod === 'exploit');
      }
    }

    normalizeQueryToIp(raw) {
      const q = String(raw || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^darknet:\/\//, '').replace(/^hc:\/\//, '');
      if (!q) return this.currentIp;

      // Checar domínios NPC
      for (const npc of Object.values(WORLD_NPC_HOSTS)) {
        if (q === npc.domain || q === npc.ip) return npc.ip;
      }
      if (q === 'isp' || q === 'telecom' || q === 'meuip') return '71.4.5.1';
      if (q === 'whois') return '71.4.20.1';
      if (q === 'download' || q === 'dc') return '33.8.2.71';
      if (q === 'bank' || q === 'banco') return '77.3.9.21';
      if (q === 'hebc' || q === 'hebc.hc') return '77.3.10.44';
      if (q === 'amex' || q === 'amex.hc') return '77.3.11.88';
      if (q === 'swiss' || q === 'swiss.hc') return '77.3.12.15';
      if (q === 'quantum' || q === 'quantum-bank.hc') return '77.3.13.99';
      if (q === 'puzzle' || q === 'firstpuzzle') return '109.64.200.10';
      if (q === 'market' || q === 'blackmarket' || q === 'blackmarket.onion') return '185.220.101.9';
      if (q === 'safenet') return '109.64.211.37';
      if (q === 'farofa') return '203.17.88.40';

      // Checar terminalTools se existir
      if (window.terminalTools) {
        const resolved = window.terminalTools.resolveSiteOrIp(q);
        if (resolved && resolved.site_key !== 'custom' && resolved.ip) return resolved.ip;
      }
      return q;
    }

    resolveHost(ipRaw) {
      const ip = this.normalizeQueryToIp(ipRaw);
      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '';

      // 1. É o próprio IP do jogador logado?
      if (ip === myIp) {
        return {
          ip: myIp,
          hostname: `${(window.currentProfile && window.currentProfile.hacker_tag) || 'MeuGateway'} (Seu PC)`,
          kind: 'self',
          badge: 'Seu Gateway Local',
          online: true,
          tier: 1,
          securityLevel: 1,
          rootPassword: window.networkIdentity.getRootPassword(),
          cpuSpec: window.hardwareEngine ? window.hardwareEngine.getCpu().name : 'Celeron 800MHz',
          bankBalance: 0,
          files: []
        };
      }

      const deletedSet = this.deletedHostFiles.get(ip) || new Set();

      // 2. Servidor NPC Oficial do Mundo?
      if (WORLD_NPC_HOSTS[ip]) {
        const npc = WORLD_NPC_HOSTS[ip];
        return {
          ...npc,
          online: true,
          rootPassword: deterministicPassword(npc.ip),
          bankBalance: this.drainedNpcIps.has(npc.ip) ? 0 : npc.bankBalance,
          files: (npc.files || []).filter((f) => !deletedSet.has(f.name))
        };
      }

      // 2b. Os 5 Bancos NPC Internacionais (MultiBankEngine)?
      if (window.multiBankEngine) {
        const bMeta = window.multiBankEngine.getBankByIp(ip);
        if (bMeta) {
          return {
            ip: bMeta.ip,
            domain: bMeta.domain,
            hostname: bMeta.name,
            kind: 'banco',
            badge: 'Instituição Bancária',
            online: true,
            tier: bMeta.tier,
            securityLevel: bMeta.tier + 1,
            cpuMhz: bMeta.cpuMhz,
            netMbps: bMeta.netMbps,
            hddTotalMb: bMeta.hddTotalMb,
            hddOsBaseMb: Math.round(bMeta.hddTotalMb * 0.42),
            ramTotalMb: bMeta.ramTotalMb,
            ramOsBaseMb: Math.round(bMeta.ramTotalMb * 0.42),
            hasherVer: bMeta.serverHasherVer,
            firewallVer: bMeta.firewallVer,
            antivirusVer: bMeta.antivirusVer,
            rootPassword: deterministicPassword('BANK_ROOT::' + bMeta.ip),
            cpuSpec: `${bMeta.cpuMhz.toLocaleString('pt-BR')} MHz · ${bMeta.netMbps} Mbps · AV v${bMeta.antivirusVer.toFixed(1)}`,
            bankBalance: this.drainedNpcIps.has(bMeta.ip) ? 0 : bMeta.tier * 650,
            files: [
              { name: 'interbank_swift.enc', size: '90 MB', sizeMb: 90, content: `Clearing criptografado de ${bMeta.shortName}.` }
            ].filter((f) => !deletedSet.has(f.name))
          };
        }
      }

      // 2c. Servidor da Trilha Oficial de Enigmas ("First Puzzle" 109.64.200.10 -> .77)?
      if (window.puzzleTrailEngine) {
        const pNode = window.puzzleTrailEngine.getNodeByIp(ip);
        if (pNode) {
          return {
            ip: pNode.ip,
            hostname: pNode.hostname,
            kind: 'puzzle',
            badge: `Enigma #${pNode.index}`,
            puzzleNode: pNode,
            online: true,
            tier: 1,
            securityLevel: 1,
            cpuMhz: 2600,
            netMbps: 200,
            hddTotalMb: 640,
            hddOsBaseMb: 280,
            ramTotalMb: 512,
            ramOsBaseMb: 200,
            hasherVer: 1.0,
            firewallVer: 1.0,
            antivirusVer: 1.0,
            rootPassword: deterministicPassword('PUZZLE::' + pNode.ip),
            cpuSpec: '2.600 MHz · 200 Mbps · Servidor de Enigma',
            bankBalance: 0,
            files: [
              { name: `enigma_${pNode.index}_hint.txt`, size: '12 MB', sizeMb: 12, content: `Resolva o desafio na aba Página para destravar o software de recompensa no HD deste host!` }
            ].filter((f) => !deletedSet.has(f.name))
          };
        }
      }

      // 2d. Servidor Dedicado de Clã (155.90.X.X)?
      if (window.clanEngine) {
        const clan = window.clanEngine.getClanByServerIp(ip);
        if (clan) {
          return {
            ip: clan.serverIp,
            hostname: `Mainframe do Clã [${clan.tag}] ${clan.name}`,
            kind: 'clan',
            badge: `Clã [${clan.tag}]`,
            clanRef: clan,
            online: true,
            tier: 2,
            securityLevel: 2,
            cpuMhz: 6400,
            netMbps: 500,
            hddTotalMb: 2048,
            hddOsBaseMb: 900,
            ramTotalMb: 1024,
            ramOsBaseMb: 480,
            hasherVer: 2.0,
            firewallVer: 2.0,
            antivirusVer: 2.5,
            rootPassword: deterministicPassword('CLAN::' + clan.serverIp),
            cpuSpec: '6.400 MHz · 500 Mbps · Servidor de Clã',
            bankBalance: this.drainedNpcIps.has(clan.serverIp) ? 0 : 320,
            files: [
              { name: 'clan_manifest.txt', size: '16 MB', sizeMb: 16, content: `Líder: ${clan.leader} | Membros: ${clan.members} | Poder: ${clan.powerScore}` }
            ].filter((f) => !deletedSet.has(f.name))
          };
        }
      }

      // 3. É um dos 210 Bots Determinísticos?
      if (window.botRegistry) {
        const bot = window.botRegistry.getBotByIp(ip);
        if (bot) {
          const online = window.botScheduler ? window.botScheduler.isBotOnline(ip) : true;
          const cpuMhz = Math.round((bot.hardware.cpuCores || 1) * (bot.hardware.cpuClock || 1.2) * 550);
          const netMbps = bot.tier === 3 ? 250 : (bot.tier === 2 ? 35 : 3);
          const hddTotalMb = bot.tier === 3 ? 2048 : (bot.tier === 2 ? 520 : 180);
          const ramTotalMb = bot.tier === 3 ? 1024 : (bot.tier === 2 ? 384 : 128);
          const avVer = bot.tier === 3 ? 2.5 : (bot.tier === 2 ? 1.5 : 1.0);
          const defVer = bot.tier === 3 ? 2.5 : (bot.tier === 2 ? 1.5 : 1.0);
          const rawBal = bot.bankAccount ? bot.bankAccount.balance : 0;
          const scaledBal = rawBal > 0 ? Math.max(35, Math.round(rawBal * 0.22)) : 0;

          return {
            ip: bot.ip,
            hostname: `${bot.handle} (${bot.tierName})`,
            kind: 'bot',
            badge: `Bot ${bot.tierName}`,
            online,
            tier: bot.tier,
            securityLevel: bot.tier,
            cpuMhz,
            netMbps,
            hddTotalMb,
            hddOsBaseMb: Math.round(hddTotalMb * 0.58),
            ramTotalMb,
            ramOsBaseMb: Math.round(ramTotalMb * 0.55),
            hasherVer: defVer,
            firewallVer: defVer,
            antivirusVer: avVer,
            rootPassword: deterministicPassword(bot.ip + '::' + bot.handle),
            cpuSpec: `${cpuMhz} MHz · ${netMbps} Mbps · HDD ${hddTotalMb}MB · AV v${avVer.toFixed(1)}`,
            bankBalance: scaledBal,
            botRef: bot,
            files: (bot.vfs || [])
              .filter((f) => !deletedSet.has(f.name))
              .map((f) => ({ name: f.name, size: '18 MB', sizeMb: 18, content: f.desc || 'Arquivo de sistema do operador bot.' }))
          };
        }
      }

      // 4. É um jogador real no Supabase ou VPC povoado?
      const cloudPlayer = this.cloudPlayersByIp[ip];
      if (cloudPlayer) {
        const rep = cloudPlayer.reputation || 100;
        const isMid = rep >= 500;
        return {
          ip,
          hostname: `VPC de ${cloudPlayer.hacker_tag}`,
          kind: 'player',
          badge: 'Jogador Online',
          online: true,
          reputation: rep,
          newbieProtected: rep < 100,
          tier: isMid ? 2 : 1,
          securityLevel: isMid ? 2 : 1,
          cpuMhz: isMid ? 2800 : 1000,
          netMbps: isMid ? 50 : 10,
          hddTotalMb: isMid ? 768 : 350,
          hddOsBaseMb: isMid ? 420 : 210,
          ramTotalMb: isMid ? 512 : 256,
          ramOsBaseMb: isMid ? 260 : 140,
          hasherVer: isMid ? 1.5 : 1.0,
          firewallVer: isMid ? 1.5 : 1.0,
          antivirusVer: isMid ? 1.5 : 1.0,
          rootPassword: deterministicPassword(ip + '::' + cloudPlayer.id),
          cpuSpec: `${isMid ? '2.800 MHz · 50 Mbps' : '1.000 MHz · 10 Mbps'} · AV v${isMid ? '1.5' : '1.0'}`,
          bankBalance: this.drainedNpcIps.has(ip) ? 0 : 145,
          files: [{ name: 'wallet_hint.txt', size: '12 MB', sizeMb: 12, content: `Host operado por ${cloudPlayer.hacker_tag}` }].filter((f) => !deletedSet.has(f.name))
        };
      }

      if (SEEDED_PLAYER_VPCS[ip]) {
        const vp = SEEDED_PLAYER_VPCS[ip];
        return {
          ...vp,
          kind: 'player',
          badge: vp.reputation < 100 ? 'Jogador (Iniciante Protegido)' : 'Jogador VPC',
          online: true,
          newbieProtected: vp.reputation < 100,
          rootPassword: deterministicPassword(vp.ip + '::' + vp.hacker_tag),
          bankBalance: this.drainedNpcIps.has(vp.ip) ? 0 : vp.bankBalance,
          files: [
            { name: 'operador_notes.txt', size: '14 MB', sizeMb: 14, content: `Terminal pessoal de ${vp.hacker_tag} (${vp.reputation} REP).` }
          ].filter((f) => !deletedSet.has(f.name))
        };
      }

      // 5. IPv4 inválido ou host inexistente (404 de Rede)
      if (!isValidIpv4(ip)) {
        return { ip, notFound: true, reason: 'Formato de endereço IPv4 ou domínio inválido.' };
      }
      return { ip, notFound: true, reason: 'Nenhum servidor respondeu ao pacote ICMP neste IP (Host inativo/404).' };
    }

    getServerLogs(ip) {
      if (!window.botAI) return [];
      if (!window.botAI.syslogRegistry.has(ip)) {
        const initLines = [
          `[00:00:01] systemd[1]: sshd.service initialized on ${ip}:22`
        ];
        if (window.multiBankEngine) {
          const bankWireLeak = window.multiBankEngine.getForensicBankLogForHost(ip);
          if (bankWireLeak) initLines.unshift(bankWireLeak);
        }
        window.botAI.syslogRegistry.set(ip, initLines);
      }
      return window.botAI.syslogRegistry.get(ip);
    }

    appendServerLog(ip, line) {
      const arr = this.getServerLogs(ip);
      arr.unshift(`[${new Date().toLocaleTimeString()}] ${line}`);
      if (arr.length > 50) arr.length = 50;
    }

    navigate(rawQuery, forceTab = null, pushHistory = true) {
      const targetIp = this.normalizeQueryToIp(rawQuery);
      if (this.activeSshIp && this.activeSshIp !== targetIp) {
        this.activeSshIp = null;
      }
      this.currentIp = targetIp;
      this.activeTab = forceTab || 'pagina';

      if (pushHistory && this.history[this.historyIdx] !== targetIp) {
        this.history = this.history.slice(0, this.historyIdx + 1);
        this.history.push(targetIp);
        this.historyIdx = this.history.length - 1;
      }

      if (isValidIpv4(targetIp)) {
        this.recentIps = [targetIp, ...this.recentIps.filter((x) => x !== targetIp)].slice(0, 6);
      }
      this.render();
    }

    goBack() {
      if (this.historyIdx > 0) {
        this.historyIdx--;
        this.navigate(this.history[this.historyIdx], 'pagina', false);
      }
    }

    goForward() {
      if (this.historyIdx < this.history.length - 1) {
        this.historyIdx++;
        this.navigate(this.history[this.historyIdx], 'pagina', false);
      }
    }

    switchTab(tab) {
      this.activeTab = tab;
      this.render();
    }

    toggleFavoriteCurrent() {
      if (this.favorites.has(this.currentIp)) {
        this.favorites.delete(this.currentIp);
      } else {
        this.favorites.add(this.currentIp);
      }
      if (window.hackedDb) window.hackedDb.toggleFavorite(this.currentIp);
      this.render();
    }

    runPortScan() {
      const host = this.resolveHost(this.currentIp);
      if (host.notFound || host.kind === 'self') return;
      this.portScannedIps.add(host.ip);
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('PORTSCAN', `Varredura TCP concluída contra ${host.ip} (${host.hostname})`, 'info');
      }
      if (window.hackerAudio) window.hackerAudio.playKeyClick();
      if (typeof window.showToast === 'function') {
        window.showToast(`Port scan concluído em ${host.ip}: portas 22/ssh e 21/ftp mapeadas.`);
      }
      this.render();
    }

    getPlayerAttackPower() {
      const cpuMult = window.terminalTools ? window.terminalTools.getCpuMultiplier() : 1.0;
      const crcVer = window.softwareEngine ? Math.max(0.5, window.softwareEngine.getSoftwareVersion('cracker')) : 1.0;
      const certMult = (window.universityEngine && window.universityEngine.hasCert(2)) ? 1.15 : 1.0;
      const overclockRank = (window.skillTreeEngine && typeof window.skillTreeEngine.getRank === 'function')
        ? window.skillTreeEngine.getRank('cpu_overclock')
        : 0;
      return +(cpuMult * crcVer * certMult + overclockRank * 0.25).toFixed(2);
    }

    getPlayerExploitPower() {
      const cpuMult = window.terminalTools ? window.terminalTools.getCpuMultiplier() : 1.0;
      const expVer = window.softwareEngine
        ? Math.max(0.5, window.softwareEngine.getSoftwareVersion('exploit_ssh'), window.softwareEngine.getSoftwareVersion('cracker'))
        : 1.0;
      const certBonus = (window.universityEngine && window.universityEngine.hasCert(3)) ? 0.4 : 0;
      const overclockRank = (window.skillTreeEngine && typeof window.skillTreeEngine.getRank === 'function')
        ? window.skillTreeEngine.getRank('cpu_overclock')
        : 0;
      return +(cpuMult * expVer + certBonus + overclockRank * 0.25).toFixed(2);
    }

    startBruteforce() {
      if (this.isCracking) return;
      const host = this.resolveHost(this.currentIp);
      if (host.notFound) return;
      if (host.kind === 'self') {
        alert('Operação bloqueada: você não pode executar força-bruta contra o seu próprio IP público!');
        return;
      }
      if (host.newbieProtected) {
        alert(`Proteção de Iniciante (ISP Sandbox): ${host.hostname} tem menos de 100 REP e ainda não pode sofrer invasão PvP!`);
        return;
      }
      if (!host.online) {
        alert('Este host está OFFLINE no turno atual. Aguarde a próxima janela ou escolha um IP online.');
        return;
      }

      const crcVer = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('cracker') : 1.0;
      const reqHasher = host.hasherVer || 1.0;
      if (crcVer <= 0) {
        alert('Seu Cracker.crc está DESATIVADO na RAM! Ative-o na aba Software & Vírus.');
        return;
      }
      if (crcVer < reqHasher) {
        alert(`Hasher v${reqHasher.toFixed(1)} do alvo bloqueou sua força-bruta! Seu Cracker.crc atual é v${crcVer.toFixed(1)} — pesquise Cracker.crc >= v${reqHasher.toFixed(1)} na aba Software & Vírus!`);
        return;
      }

      this.isCracking = true;
      this.crackPct = 0;
      const power = this.getPlayerAttackPower();
      const idealSec = Math.max(1.3, Math.min(8.0, +(1.8 * reqHasher / Math.max(0.8, power * 0.9)).toFixed(1)));
      this.activeCrackPid = null;

      if (window.taskManager) {
        const enq = window.taskManager.enqueue({
          dedupeKey: `bf_ssh_${host.ip}`,
          title: `Quebrar senha root (${host.hostname})`,
          subtitle: `Cracker.crc v${crcVer.toFixed(1)} · ${power}x`,
          targetIp: host.ip,
          queueKind: 'cpu',
          category: 'Ataque',
          idealSeconds: idealSec,
          onComplete: () => {
            this.isCracking = false;
            this.activeCrackPid = null;
            this.crackPct = 100;
            this.onAttackSucceeded(host, 'password', host.rootPassword);
          },
          onCancel: () => {
            this.isCracking = false;
            this.activeCrackPid = null;
            this.crackPct = 0;
            this.render();
          }
        });

        if (enq.started) {
          this.activeCrackPid = enq.process.pid;
          const uiSync = setInterval(() => {
            const p = window.taskManager.processes.find((x) => x.pid === enq.process.pid);
            if (!p || p.status !== 'running') {
              clearInterval(uiSync);
              return;
            }
            this.crackPct = Math.min(99, Math.round((p.workDone / p.workTotal) * 100));
            const bar = document.getElementById('inetCrackBarFill');
            const lbl = document.getElementById('inetCrackPctLabel');
            if (bar) bar.style.width = this.crackPct + '%';
            if (lbl) lbl.textContent = this.crackPct + '%';
          }, 140);
          this.render();
          return;
        }
      }

      const stepInc = Math.max(8, Math.round((26 * power) / Math.max(1, reqHasher)));
      this.render();

      const timer = setInterval(() => {
        this.crackPct = Math.min(100, this.crackPct + stepInc);
        const bar = document.getElementById('inetCrackBarFill');
        const lbl = document.getElementById('inetCrackPctLabel');
        if (bar) bar.style.width = this.crackPct + '%';
        if (lbl) lbl.textContent = this.crackPct + '%';

        if (this.crackPct >= 100) {
          clearInterval(timer);
          this.isCracking = false;
          this.onAttackSucceeded(host, 'password', host.rootPassword);
        }
      }, 130);
    }

    startExploitAttack() {
      const host = this.resolveHost(this.currentIp);
      if (host.notFound || host.kind === 'self') return;
      if (host.newbieProtected) {
        alert(`Proteção de Iniciante (ISP Sandbox): ${host.hostname} possui menos de 100 REP!`);
        return;
      }
      if (!this.portScannedIps.has(host.ip)) {
        if (typeof window.showToast === 'function') {
          window.showToast('Execute primeiro o Port Scan abaixo para localizar a porta vulnerável!');
        }
        return;
      }
      const power = this.getPlayerExploitPower();
      const reqPower = host.firewallVer || (host.securityLevel === 1 ? 1.0 : (host.securityLevel === 2 ? 1.5 : 2.5));
      if (power < reqPower) {
        alert(`Firewall v${reqPower.toFixed(1)} bloqueou o exploit! Sua potência atual (${power}x) exige >= ${reqPower.toFixed(1)}x — melhore seu SSH_Exploit.exp / Curso #3 ou use Força-Bruta.`);
        return;
      }
      this.onAttackSucceeded(host, 'exploit', 'EXPLOITED');
    }

    onAttackSucceeded(host, method, pwdOrToken) {
      const route = window.bounceEngine
        ? window.bounceEngine.routeConnectionAndGetVisibleIp(host.ip)
        : { visibleIp: window.networkIdentity.getPublicIp(), bounced: false };
      const visibleIp = route.visibleIp;

      // Salvar no Hacked Database
      if (window.hackedDb) {
        window.hackedDb.upsertHost({
          ip: host.ip,
          hostname: host.hostname,
          kind: host.kind,
          tier: host.tier,
          accessMethod: method,
          password: pwdOrToken,
          cpuSpec: host.cpuSpec
        });
      }

      // Se for bot, registrar intrusão na IA com o IP visível (se Bounce ativo, registra apenas o último salto!)
      if (host.kind === 'bot' && window.botAI) {
        window.botAI.registerIntrusion(host.ip, visibleIp);
      } else {
        this.appendServerLog(host.ip, `INTRUSION src=${visibleIp} dest=${host.ip} method=${method.toUpperCase()} root=GRANTED`);
      }

      if (window.currentProfile) {
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + (15 * host.securityLevel);
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('HACK-OK', `Acesso quebrado em ${host.ip} (${host.hostname}) via ${method} — salvo no Hacked Database`, 'warning');
      }
      if (window.hackerAudio) window.hackerAudio.playCashChime();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (typeof window.showToast === 'function') {
        window.showToast(`Senha quebrada em ${host.ip}! Credencial salva no Hacked Database.`);
      }

      // Conectar automaticamente na aba Entrar (SSH Root)
      this.activeSshIp = host.ip;
      this.activeTab = 'entrar';
      this.sshSubTab = 'logs';
      if (window.tutorialEngine) {
        window.tutorialEngine.onHostHackedOrLoggedRoot(host.ip);
      }
      this.render();
    }

    connectSsh(ip, typedPwd, allowExploitBypass = false) {
      const host = this.resolveHost(ip);
      if (host.notFound || host.kind === 'self') return false;
      const saved = window.hackedDb ? window.hackedDb.getEntry(ip) : null;
      const validByExploit = allowExploitBypass || (saved && saved.accessMethod === 'exploit');
      const pwdClean = String(typedPwd || '').trim();

      if (!validByExploit && pwdClean !== host.rootPassword) {
        if (window.hackerAudio) window.hackerAudio.playErrorBuzz();
        alert('Acesso negado: senha root incorreta! Use a aba "Invadir" para quebrar a senha.');
        return false;
      }

      const route = window.bounceEngine
        ? window.bounceEngine.routeConnectionAndGetVisibleIp(host.ip)
        : { visibleIp: window.networkIdentity.getPublicIp(), bounced: false };
      this.activeSshIp = host.ip;
      this.activeTab = 'entrar';

      // Logs bilaterais (exatamente como HE Legacy Internet::doLogin & Helix writeTraceLogs!)
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('SSH-OUT', `localhost logged in to ${host.ip} as root`, 'info');
      }
      this.appendServerLog(host.ip, `${route.visibleIp} logged in as root`);

      if (window.tutorialEngine) {
        window.tutorialEngine.onHostHackedOrLoggedRoot(host.ip);
      }
      if (window.hackerAudio) window.hackerAudio.playEnterBeep();
      this.render();
      return true;
    }

    disconnectSsh(silent = false) {
      this.activeSshIp = null;
      if (!silent) {
        if (typeof window.showToast === 'function') window.showToast('Sessão SSH remota encerrada.');
        this.render();
      }
    }

    saveEditedRemoteLogs() {
      if (!this.activeSshIp) return;
      const ta = document.getElementById('remoteSyslogTextarea');
      if (!ta) return;

      const newLines = ta.value
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (window.botAI && window.botAI.syslogRegistry) {
        window.botAI.syslogRegistry.set(this.activeSshIp, newLines);

        // Se o IP público atual do jogador (ou o IP gravado no ataque) não consta mais no syslog, cancela a retaliação!
        const pending = window.botAI.pendingAttacks ? window.botAI.pendingAttacks.get(this.activeSshIp) : null;
        if (pending) {
          const trackedIp = pending.loggedPlayerIp || window.networkIdentity.getPublicIp();
          const stillExposed = newLines.some((l) => l.includes(trackedIp));
          if (!stillExposed) {
            window.botAI.pendingAttacks.delete(this.activeSshIp);
          }
        }
      }

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('E_LOG', `Arquivo ${this.activeSshIp}:/var/log/syslog reescrito (${newLines.length} linhas restantes)`, 'success');
      }
      if (window.currentProfile) {
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 5;
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      }
      if (window.tutorialEngine) {
        window.tutorialEngine.notifyLogsSaved(this.activeSshIp, newLines);
      }
      if (window.hackerAudio) window.hackerAudio.playKeyClick();
      if (typeof window.showToast === 'function') {
        window.showToast(`Syslog remoto de ${this.activeSshIp} atualizado! Rastros removidos.`);
      }
      this.render();
    }

    drainRemoteHostFunds() {
      if (!this.activeSshIp) return;
      const host = this.resolveHost(this.activeSshIp);
      if (!host || host.bankBalance <= 0) {
        if (typeof window.showToast === 'function') window.showToast('Nenhum saldo líquido disponível neste servidor.');
        return;
      }

      if (host.kind === 'bot' && typeof window.drainBotBank === 'function') {
        window.drainBotBank(host.ip);
        if (window.missionsEngine) window.missionsEngine.notifyHostDrained(host.ip);
        this.render();
        return;
      }

      const loot = host.bankBalance;
      this.drainedNpcIps.add(host.ip);
      if (window.currentWallet) {
        window.currentWallet.balance = parseFloat(window.currentWallet.balance) + loot;
      }
      const route = window.bounceEngine
        ? window.bounceEngine.routeConnectionAndGetVisibleIp(host.ip)
        : { visibleIp: window.networkIdentity.getPublicIp(), bounced: false };
      this.appendServerLog(host.ip, `${route.visibleIp} transferred $ ${loot}.00 HC from local_vault`);
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('WIRE-LOOT', `Transferência remota de ${host.hostname} [${host.ip}]: +$ ${loot}.00 HC`, 'success');
      }
      if (window.missionsEngine) {
        window.missionsEngine.notifyHostDrained(host.ip);
      }
      if (!route.bounced && loot >= 800 && window.safenetFbiEngine) {
        window.safenetFbiEngine.evaluatePlayerCrime(`Transferência ilícita de $ ${loot} HC`, loot, host.ip);
      }
      if (window.hackerAudio) window.hackerAudio.playMoneyCollect();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (typeof window.showToast === 'function') {
        window.showToast(`+$ ${loot}.00 HC drenados de ${host.hostname}! Lembre-se de limpar o syslog!`);
      }
      this.render();
    }

    deploySelectedVirusToCurrentHost() {
      if (!this.activeSshIp || !window.softwareEngine) return Promise.resolve(null);
      const host = this.resolveHost(this.activeSshIp);
      const sel = document.getElementById('remoteVirusSelect');
      const virusKey = sel ? sel.value : 'vspam';

      return new Promise((resolve) => {
        const up = window.softwareEngine.uploadVirusWithBandwidth(host, virusKey, (res) => {
          if (res && res.success) {
            if (window.tutorialEngine) {
              window.tutorialEngine.onFileReadOrVirusPlanted(host.ip);
            }
            if (typeof window.showToast === 'function') window.showToast(res.message);
          } else if (res) {
            alert(res.message);
          }
          this.render();
          resolve(res);
        });

        if (!up.started) {
          alert(up.message);
          resolve({ success: false, code: up.code, message: up.message });
        }
      });
    }

    deleteStaticRemoteFile(ip, fileName) {
      if (!this.deletedHostFiles.has(ip)) {
        this.deletedHostFiles.set(ip, new Set());
      }
      this.deletedHostFiles.get(ip).add(fileName);
      const visibleIp = window.bounceEngine
        ? window.bounceEngine.routeConnectionAndGetVisibleIp(ip).visibleIp
        : (window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0');
      this.appendServerLog(ip, `${visibleIp} deleted file /root/${fileName} (disk space freed)`);
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('RM-REMOTE', `Arquivo ${fileName} removido de ${ip}:/root (espaço em disco liberado no alvo)`, 'info');
      }
      this.render();
    }

    drainCurrentHostBtcWallet() {
      if (!this.activeSshIp || !window.bitcoinEngine) return;
      const host = this.resolveHost(this.activeSshIp);
      const res = window.bitcoinEngine.drainRemoteHostBtc(host);
      if (!res.success) {
        alert(res.message);
        return;
      }
      if (window.missionsEngine) {
        window.missionsEngine.notifyHostDrained(host.ip);
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`+${res.btcStr} BTC roubados de ${host.ip}:/root/wallet.dat! Limpe o syslog!`);
      }
      this.render();
    }

    runWhoisLookup() {
      const inp = document.getElementById('whoisQueryInput');
      if (!inp) return;
      const q = inp.value.trim();
      if (!q) return;
      this.whoisQueryResult = this.resolveHost(q);
      this.render();
    }

    renderPublicPageTab(host) {
      // 1. Página do Próprio Jogador
      if (host.kind === 'self') {
        const st = window.networkIdentity.getWeeklyResetStatus();
        return `
          <div class="hc-card" style="padding: 1.25rem;">
            <span class="hc-badge success">Gateway Local</span>
            <h3 style="margin: 0.5rem 0 0.35rem; font-size: 1.05rem;">Este é o seu próprio endereço IP público (${esc(host.ip)})</h3>
            <p style="color: var(--hc-text-2); font-size: 0.86rem; margin-bottom: 1rem;">
              Qualquer invasão que você fizer sem proxy deixará este IP gravado no <code>/var/log/syslog</code> do alvo. Se esquecer seu IP exposto, bots e outros operadores podem contra-atacar você!
            </p>
            <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
              <button type="button" class="hc-btn primary" onclick="window.internetEngine.navigate('71.4.5.1')">Ir ao Provedor ISP (${st.canResetFree ? '1 Troca Grátis Disponível' : 'Gerenciar IP'})</button>
              <button type="button" class="hc-btn ghost" onclick="navTo('winLogs')">Ver Meus Logs Locais</button>
            </div>
          </div>
        `;
      }

      // 2. Provedor HC Telecom ISP (71.4.5.1) — Central Oficial de Troca Semanal de IP!
      if (host.kind === 'isp') {
        const myIp = window.networkIdentity.getPublicIp();
        const myPwd = window.networkIdentity.getRootPassword();
        const st = window.networkIdentity.getWeeklyResetStatus();
        const histRows = st.history.length === 0
          ? `<div style="font-size: 0.8rem; color: var(--hc-text-3);">Nenhuma troca de IP realizada nesta conta ainda.</div>`
          : st.history.map((h) => `
              <div style="display: flex; justify-content: space-between; font-family: var(--hc-font-mono); font-size: 0.78rem; padding: 0.35rem 0; border-bottom: 1px solid var(--hc-border); gap: 8px; flex-wrap: wrap;">
                <span><span style="color: var(--hc-text-3);">${esc(h.from)}</span> → <strong style="color: var(--hc-accent-text);">${esc(h.to)}</strong></span>
                <span style="color: var(--hc-text-2);">${esc(h.mode)} · ${esc(h.at)}</span>
              </div>
            `).join('');

        return `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div class="hc-card" style="padding: 1.25rem; border-color: rgba(53, 184, 119, 0.35);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
                <div>
                  <div class="hc-eyebrow">Painel do Assinante · Renovação de IPv4 Dinâmico</div>
                  <div style="margin-top: 0.35rem; font-size: 0.85rem; color: var(--hc-text-2);">Seu IP Público Atual:</div>
                  <div style="font-family: var(--hc-font-mono); font-size: 1.5rem; font-weight: 700; color: var(--hc-accent-text); margin: 0.15rem 0 0.5rem;">${esc(myIp)}</div>
                  <div style="font-size: 0.82rem; color: var(--hc-text-2);">
                    Política Oficial: <strong>1 troca de IP 100% gratuita a cada 7 dias</strong>. Ao renovar seu IP, rastros antigos deixados em servidores alheios perdem a rota até você e você some do Hacked Database de inimigos!
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px; min-width: 240px;">
                  ${st.canResetFree
                    ? `<span class="hc-badge success" style="align-self: flex-start;">Cota Semanal Grátis Liberada</span>
                       <button type="button" id="btnIspFreeReset" class="hc-btn primary" onclick="window.handleIpResetAction(false, this)">Trocar Meu IP Agora (GRÁTIS)</button>`
                    : `<span class="hc-badge warn" style="align-self: flex-start;">Próxima grátis em ${esc(st.formattedRemaining)}</span>
                       <button type="button" id="btnIspPaidReset" class="hc-btn" style="border-color: var(--hc-warning); color: var(--hc-warning);" onclick="window.handleIpResetAction(true, this)">Troca Emergencial Imediata ($ ${st.paidCostFmt} HC)</button>`}
                  <button type="button" class="hc-btn ghost sm" onclick="window.handleRootPwdReset()">Rotacionar Senha Root (${esc(myPwd)})</button>
                </div>
              </div>
            </div>

            <div class="hc-card" style="padding: 1rem;">
              <div class="hc-eyebrow" style="margin-bottom: 0.5rem;">Histórico de Concessões DHCP da sua Linha (${st.resetsCount} renovações)</div>
              ${histRows}
            </div>
          </div>
        `;
      }

      // 3. First Whois (71.4.20.1)
      if (host.kind === 'whois') {
        const w = this.whoisQueryResult;
        return `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div class="hc-card" style="padding: 1.15rem;">
              <div class="hc-eyebrow" style="margin-bottom: 0.4rem;">Consulta Pública WHOIS & Roteamento ASN</div>
              <p style="font-size: 0.84rem; color: var(--hc-text-2); margin-bottom: 0.75rem;">Inspecione qualquer endereço IPv4 para identificar titular, categoria, status online e blindagem antes de atacar.</p>
              <div style="display: flex; gap: 8px;">
                <input type="text" id="whoisQueryInput" class="form-input" style="font-family: var(--hc-font-mono);" placeholder="Ex: 203.17.88.40, 149.56.28.11, 10.110.1.14..." value="${w ? esc(w.ip) : ''}" onkeydown="if(event.key==='Enter') window.internetEngine.runWhoisLookup()">
                <button type="button" class="hc-btn primary" onclick="window.internetEngine.runWhoisLookup()">Consultar IP</button>
              </div>
              ${w ? (w.notFound
                ? `<div style="margin-top: 0.85rem; padding: 0.75rem; background: var(--hc-inset); border: 1px solid var(--hc-danger); border-radius: 8px; color: var(--hc-danger-text); font-size: 0.82rem;">${esc(w.ip)}: ${esc(w.reason)}</div>`
                : `<div style="margin-top: 0.85rem; padding: 0.85rem; background: var(--hc-inset); border: 1px solid var(--hc-border-strong); border-radius: 8px; font-family: var(--hc-font-mono); font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
                     <div>
                       <div>IP: <strong style="color: var(--hc-accent-text);">${esc(w.ip)}</strong> · Status: <strong>${w.online ? 'ONLINE' : 'OFFLINE'}</strong></div>
                       <div>Entidade: ${esc(w.hostname)} [${esc(w.badge)}] · Segurança Nível ${w.securityLevel}</div>
                     </div>
                     <button type="button" class="hc-btn primary sm" onclick="window.internetEngine.navigate('${esc(w.ip)}')">Visitar IP →</button>
                   </div>`)
                : ''}
            </div>

            <div class="hc-card" style="padding: 1rem;">
              <div class="hc-eyebrow" style="margin-bottom: 0.5rem;">Diretório de Servidores & Operadores Detectados</div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 8px;">
                ${[...IMPORTANT_BOOKMARKS, { ip: '149.56.28.11', label: 'Operador m4riposa (VPC)' }, { ip: '177.84.19.62', label: 'Operador rookie_br (<100 REP)' }].map((b) => `
                  <button type="button" class="inet-bm-item" style="background: var(--hc-inset); border-color: var(--hc-border);" onclick="window.internetEngine.navigate('${b.ip}')">
                    <div>
                      <span class="inet-bm-ip">${b.ip}</span>
                      <span class="inet-bm-label">${esc(b.label)}</span>
                    </div>
                    <span style="color: var(--hc-text-3);">→</span>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      }

      // 4. Download Center (33.8.2.71)
      if (host.kind === 'download') {
        return `
          <div class="hc-card" style="padding: 1.15rem;">
            <div class="hc-eyebrow" style="margin-bottom: 0.4rem;">Espelho Público de Ferramentas v1.0 (Freeware)</div>
            <p style="font-size: 0.84rem; color: var(--hc-text-2); margin-bottom: 0.9rem;">Pacotes básicos abertos para novos operadores. Versões avançadas exigirão Pesquisa/Universidade (Bloco 2 e 3).</p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${host.files.map((f) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.85rem; background: var(--hc-inset); border: 1px solid var(--hc-border); border-radius: 8px;">
                  <div>
                    <strong style="font-family: var(--hc-font-mono); font-size: 0.86rem;">${esc(f.name)}</strong>
                    <div style="font-size: 0.76rem; color: var(--hc-text-2);">${esc(f.content)} · ${esc(f.size)}</div>
                  </div>
                  <button type="button" class="hc-btn primary sm" onclick="showToast('Pacote ${esc(f.name)} verificado e pronto no seu sistema!')">Baixar</button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      // 5. Blackmarket Onion (185.220.101.9) — Preserva compras PostgreSQL!
      if (host.kind === 'darknet') {
        return `
          <div class="hc-card" style="padding: 1.15rem;">
            <div class="hc-eyebrow" style="margin-bottom: 0.4rem;">Mercado Clandestino Sincronizado (PostgreSQL RPC)</div>
            <p style="font-size: 0.84rem; color: var(--hc-text-2); margin-bottom: 0.9rem;">Suprimentos táticos imediatos liquidados pela sua conta bancária:</p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="background: var(--hc-inset); border: 1px solid var(--hc-border-strong); padding: 0.85rem 1rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
                <div>
                  <strong style="color: var(--hc-text);">Kit de Zero-Day Exploits v2</strong>
                  <div style="font-size: 0.78rem; color: var(--hc-text-2);">Aumenta seu respeito no submundo em +50 REP imediatamente</div>
                </div>
                <button type="button" class="hc-btn primary sm" onclick="buyItemFromMarket('exploit_v2', 300)">Comprar ($ 300 HC)</button>
              </div>
              <div style="background: var(--hc-inset); border: 1px solid var(--hc-border-strong); padding: 0.85rem 1rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
                <div>
                  <strong style="color: var(--hc-text);">Limpador de Registros Policiais (Bribe Pass)</strong>
                  <div style="font-size: 0.78rem; color: var(--hc-text-2);">Reduz o Heat policial em 2 níveis imediatamente no banco</div>
                </div>
                <button type="button" class="hc-btn primary sm" onclick="buyItemFromMarket('cleaner', 450)">Comprar ($ 450 HC)</button>
              </div>
            </div>
          </div>
        `;
      }

      // 6. Os 5 Bancos NPC (MultiBankEngine: 77.3.9.21, 77.3.10.44, 77.3.11.88, 77.3.12.15, 77.3.13.99)
      if (host.kind === 'banco') {
        if (window.multiBankEngine) {
          return window.multiBankEngine.renderBankPortalHtml(host);
        }
        return `
          <div class="hc-card" style="padding: 1.15rem;">
            <div class="hc-eyebrow" style="margin-bottom: 0.4rem;">Internet Banking & Clearing Interbancário</div>
            <p style="font-size: 0.85rem; color: var(--hc-text-2); margin-bottom: 1rem;">Acesse sua conta oficial para transferências P2P em tempo real ou tente invadir o cofre administrativo na aba <strong>Invadir</strong>.</p>
            <button type="button" class="hc-btn primary" onclick="navTo('winBank')">Abrir Minha Conta no Banco →</button>
          </div>
        `;
      }

      // 6a. Servidor da Trilha de Enigmas ("First Puzzle" 109.64.200.10 -> .77)
      if (host.kind === 'puzzle' && window.puzzleTrailEngine && host.puzzleNode) {
        return window.puzzleTrailEngine.renderPuzzlePublicPage(host.puzzleNode);
      }

      // 6c. Servidor Dedicado de Clã (155.90.X.X)
      if (host.kind === 'clan' && host.clanRef) {
        const c = host.clanRef;
        return `
          <div class="hc-card" style="padding:1.2rem;border-color:rgba(53,184,119,0.35);">
            <div class="hc-eyebrow" style="margin-bottom:0.35rem;">Mainframe Oficial de Clã · ${esc(c.serverIp)}</div>
            <h3 style="font-size:1.08rem;margin-bottom:0.35rem;">[${esc(c.tag)}] ${esc(c.name)}</h3>
            <p style="font-size:0.84rem;color:var(--hc-text-2);margin-bottom:0.9rem;">
              ${esc(c.desc)} · Líder: <strong>${esc(c.leader)}</strong> · Poder: <strong>${c.powerScore} pts</strong> · Guerras vencidas: <strong>${c.warsWon}</strong>.
            </p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button type="button" class="hc-btn primary" onclick="navTo('winClan')">Abrir Painel de Clãs & Guerra →</button>
              <button type="button" class="hc-btn ghost" onclick="window.internetEngine.switchTab('invadir')">Tentar Invadir Servidor do Clã</button>
            </div>
          </div>
        `;
      }

      // 6b. Autoridade Safenet & FBI (109.64.211.37)
      if (host.kind === 'federal' && window.safenetFbiEngine) {
        window.safenetFbiEngine.ensureSeeded();
        const wantedCount = window.safenetFbiEngine.fbiWantedList.length;
        const safeCount = window.safenetFbiEngine.safenetList.length;
        return `
          <div class="hc-card" style="padding: 1.2rem; border-color: rgba(208, 68, 58, 0.35);">
            <div class="hc-eyebrow" style="margin-bottom: 0.4rem;">Portal Federal · Safenet & Lista de Procurados do FBI</div>
            <h3 style="font-size: 1.05rem; margin-bottom: 0.4rem;">${wantedCount} procurado(s) com recompensa ativa · ${safeCount} IP(s) na Mira da Safenet</h3>
            <p style="font-size: 0.85rem; color: var(--hc-text-2); margin-bottom: 1rem;">
              Derrube qualquer servidor da Lista de Procurados do FBI via ataque DDoS para receber 100% da recompensa federal em dólares e Bitcoin.
            </p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="hc-btn primary" onclick="navTo('winFbi')">Abrir Painel Polícia, FBI & Bots Vivos →</button>
              <button type="button" class="hc-btn ghost" onclick="window.internetEngine.switchTab('invadir')">Tentar Invadir Mainframe Safenet</button>
            </div>
          </div>
        `;
      }

      // 7. Empresas, Bots e Jogadores VPC
      return `
        <div class="hc-card" style="padding: 1.2rem;">
          <div class="hc-eyebrow" style="margin-bottom: 0.35rem;">Resposta HTTP Porta 80 · ${esc(host.badge)}</div>
          <h3 style="font-size: 1.05rem; margin-bottom: 0.4rem;">${esc(host.hostname)}</h3>
          <p style="font-size: 0.85rem; color: var(--hc-text-2); margin-bottom: 1rem;">
            Servidor operando em <code>${esc(host.ip)}</code> (${esc(host.cpuSpec)}). Blindagem ativa de Nível ${host.securityLevel}.
            ${host.newbieProtected ? '<br><strong style="color: var(--hc-warning);">Este operador está sob Proteção de Iniciante (&lt; 100 REP).</strong>' : ''}
          </p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button type="button" class="hc-btn primary" onclick="window.internetEngine.switchTab('invadir')">Ir para Aba Invadir →</button>
            <button type="button" class="hc-btn ghost" onclick="window.internetEngine.switchTab('entrar')">Login SSH Root</button>
          </div>
        </div>
      `;
    }

    renderLoginOrRootTab(host) {
      if (host.kind === 'self') {
        return this.renderPublicPageTab(host);
      }

      const saved = window.hackedDb ? window.hackedDb.getEntry(host.ip) : null;

      // Se AINDA NÃO está conectado via SSH neste IP -> mostra tela de Login Root
      if (this.activeSshIp !== host.ip) {
        const prefillPwd = (saved && saved.accessMethod === 'password') ? saved.password : '';
        return `
          <div class="hc-card" style="max-width: 460px; margin: 0 auto; padding: 1.35rem;">
            <div class="hc-eyebrow" style="margin-bottom: 0.35rem;">Terminal de Autenticação Remota (Porta 22/SSH)</div>
            <h3 style="font-size: 1rem; margin-bottom: 0.75rem;">Entrar como <code>root@${esc(host.ip)}</code></h3>
            ${saved
              ? `<div style="margin-bottom: 0.85rem; font-size: 0.8rem; color: var(--hc-accent-text);">Credencial localizada no seu Hacked Database (${saved.accessMethod === 'exploit' ? 'Acesso via Exploit' : 'Senha preenchida automaticamente'}).</div>`
              : `<div style="margin-bottom: 0.85rem; font-size: 0.8rem; color: var(--hc-text-2);">Não possui a senha? Quebre o acesso na aba <strong>Invadir</strong> primeiro.</div>`}
            <div style="display: flex; flex-direction: column; gap: 0.65rem;">
              <div>
                <label style="font-size: 0.75rem; color: var(--hc-text-2); display: block; margin-bottom: 3px;">USUÁRIO</label>
                <input type="text" class="form-input" value="root" readonly style="font-family: var(--hc-font-mono); opacity: 0.75;">
              </div>
              <div>
                <label style="font-size: 0.75rem; color: var(--hc-text-2); display: block; margin-bottom: 3px;">SENHA ROOT</label>
                <input type="text" id="inetSshPwdInput" class="form-input" style="font-family: var(--hc-font-mono);" placeholder="Digite a senha de 8 caracteres..." value="${esc(prefillPwd)}" onkeydown="if(event.key==='Enter') window.internetEngine.connectSsh('${esc(host.ip)}', this.value)">
              </div>
              <div style="display: flex; gap: 8px; margin-top: 0.35rem;">
                <button type="button" class="hc-btn primary" style="flex: 1;" onclick="window.internetEngine.connectSsh('${esc(host.ip)}', document.getElementById('inetSshPwdInput').value)">Conectar via SSH</button>
                ${saved && saved.accessMethod === 'exploit'
                  ? `<button type="button" class="hc-btn" onclick="window.internetEngine.connectSsh('${esc(host.ip)}', '', true)">Entrar c/ Exploit</button>`
                  : ''}
              </div>
            </div>
          </div>
        `;
      }

      // CONECTADO COMO ROOT NO SERVIDOR REMOTO!
      const logs = this.getServerLogs(host.ip);
      const myIp = window.networkIdentity.getPublicIp();
      const myIpExposed = logs.some((l) => l.includes(myIp));

      let subContent = '';
      if (this.sshSubTab === 'logs') {
        subContent = `
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
              <div>
                <strong style="font-size: 0.88rem;">Editor Remoto: <code>${esc(host.ip)}:/var/log/syslog</code></strong>
                <div style="font-size: 0.78rem; color: ${myIpExposed ? 'var(--hc-danger-text)' : 'var(--hc-text-2)'};">
                  ${myIpExposed
                    ? `ALERTA: Seu IP real (${esc(myIp)}) consta no log deste servidor! Apague ou troque o IP abaixo e clique em Salvar.`
                    : `Seguro: seu IP atual (${esc(myIp)}) não aparece neste arquivo de log.`}
                </div>
              </div>
              <div style="display: flex; gap: 6px;">
                <button type="button" class="hc-btn ghost sm" onclick="document.getElementById('remoteSyslogTextarea').value=''; window.internetEngine.saveEditedRemoteLogs();">Limpar Tudo</button>
                <button type="button" id="btnSaveRemoteSyslog" class="hc-btn primary sm" onclick="window.internetEngine.saveEditedRemoteLogs()">Salvar / Reescrever Syslog</button>
              </div>
            </div>
            <textarea id="remoteSyslogTextarea" class="ssh-syslog-editor" spellcheck="false">${esc(logs.join('\n'))}</textarea>
          </div>
        `;
      } else if (this.sshSubTab === 'files') {
        const specs = window.softwareEngine
          ? window.softwareEngine.inspectRemoteHostResources(host)
          : { cpuMhz: 1000, netMbps: 10, antivirusVer: 1.0, hddTotalMb: 250, hddUsedMb: 120, hddFreeMb: 130, ramTotalMb: 128, ramUsedMb: 64, ramFreeMb: 64 };
        const dynamicFiles = window.missionsEngine ? window.missionsEngine.getMissionFilesForHost(host.ip) : [];
        const allFiles = [...dynamicFiles, ...(host.files || [])];

        const filesHtml = allFiles.map((f) => {
          const safeId = esc(f.name.replace(/[^a-zA-Z0-9]/g, '_'));
          const isStaticDeletable = !f.missionId && !f.isTutorial && (f.sizeMb || 0) > 0;
          return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.85rem; background: var(--hc-inset); border: 1px solid ${f.missionId || f.isTutorial ? 'rgba(53,184,119,0.45)' : 'var(--hc-border)'}; border-radius: 7px; gap: 8px; flex-wrap: wrap;">
              <div>
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                  <strong style="font-family: var(--hc-font-mono); font-size: 0.84rem;">${esc(f.name)}</strong>
                  ${f.missionId ? `<span class="hc-badge warn">ALVO DE MISSÃO</span>` : (f.isTutorial ? `<span class="hc-badge success">ALVO TUTORIAL</span>` : `<span class="hc-badge info">${esc(f.size)}</span>`)}
                </div>
                <div style="font-size: 0.76rem; color: var(--hc-text-2);">${esc(f.content)}</div>
              </div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                <button type="button" id="btnReadFile_${safeId}" class="hc-btn ${f.isTutorial || f.canSteal ? 'primary' : 'ghost'} sm" onclick="window.handleRemoteFileAction('${esc(host.ip)}', '${esc(f.name)}', 'read')">Ler / Extrair</button>
                ${f.canDelete
                  ? `<button type="button" id="btnDeleteFile_${safeId}" class="hc-btn primary sm" style="background:var(--hc-danger);border-color:var(--hc-danger);" onclick="window.handleRemoteFileAction('${esc(host.ip)}', '${esc(f.name)}', 'delete')">Apagar Arquivo</button>`
                  : ''}
                ${isStaticDeletable
                  ? `<button type="button" id="btnFreeSpace_${safeId}" class="hc-btn ghost sm" style="color:var(--hc-danger-text);" onclick="window.internetEngine.deleteStaticRemoteFile('${esc(host.ip)}', '${esc(f.name)}')">Apagar (Liberar ${f.sizeMb} MB)</button>`
                  : ''}
              </div>
            </div>
          `;
        }).join('');

        const remoteBtcSats = window.bitcoinEngine ? window.bitcoinEngine.getRemoteHostWalletSats(host) : 0;
        const remoteBtcStr = (remoteBtcSats / 100000000).toFixed(8);
        const virusOpts = window.softwareEngine ? window.softwareEngine.getVirusCatalogOptions(host) : [];
        const installedOnTarget = window.softwareEngine ? window.softwareEngine.getRemoteVirusesOnIp(host.ip) : [];
        const upJob = window.softwareEngine && window.softwareEngine.activeUploadJob && window.softwareEngine.activeUploadJob.targetIp === host.ip
          ? window.softwareEngine.activeUploadJob
          : null;

        subContent = `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Painel Físico da Máquina Invadida: CPU, Internet, Armazenamento Livre, RAM Livre & Antivírus -->
            <div class="hc-card" style="padding: 0.85rem 1rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(175px, 1fr)); gap: 10px; font-family: var(--hc-font-mono); font-size: 0.77rem;">
              <div>
                <div style="color:var(--hc-text-3);font-size:0.68rem;">CPU & INTERNET DO ALVO</div>
                <strong>${specs.cpuMhz.toLocaleString('pt-BR')} MHz · ${specs.netMbps} Mbps</strong>
              </div>
              <div>
                <div style="color:var(--hc-text-3);font-size:0.68rem;">HD LIVRE NO ALVO (CABE VÍRUS?)</div>
                <strong style="color:${specs.hddFreeMb < 45 ? 'var(--hc-warning)' : 'var(--hc-accent-text)'};">${specs.hddFreeMb} MB livres</strong>
                <span style="color:var(--hc-text-3);">(${specs.hddUsedMb}/${specs.hddTotalMb}MB)</span>
              </div>
              <div>
                <div style="color:var(--hc-text-3);font-size:0.68rem;">RAM LIVRE NO ALVO</div>
                <strong style="color:${specs.ramFreeMb < 30 ? 'var(--hc-warning)' : 'var(--hc-accent-text)'};">${specs.ramFreeMb} MB livres</strong>
                <span style="color:var(--hc-text-3);">(${specs.ramUsedMb}/${specs.ramTotalMb}MB)</span>
              </div>
              <div>
                <div style="color:var(--hc-text-3);font-size:0.68rem;">ANTIVÍRUS DO ALVO</div>
                <strong style="color:${specs.antivirusVer > 0 ? 'var(--hc-danger-text)' : 'var(--hc-accent-text)'};">
                  ${specs.antivirusVer > 0 ? `Antivirus.av v${specs.antivirusVer.toFixed(1)}` : 'Sem Antivírus'}
                </strong>
              </div>
            </div>

            <!-- Upload SSH de Vírus Governado pela Internet & Espaço em Disco do Alvo -->
            <div class="hc-card" style="padding: 0.95rem 1.1rem; border-color: rgba(53, 184, 119, 0.35);">
              <div class="hc-eyebrow" style="margin-bottom: 6px;">Enviar & Instalar Vírus neste PC (Sua Internet: ${window.softwareEngine ? window.softwareEngine.getPlayerNetMbps() : 1} Mbps)</div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                <select id="remoteVirusSelect" class="form-input" style="flex: 1; min-width: 260px; font-family: var(--hc-font-mono); font-size: 0.79rem;">
                  ${virusOpts.map((vo) => `<option value="${vo.key}">${esc(vo.filename)} (${vo.versionStr}) — ${esc(vo.extraLabel)}</option>`).join('')}
                </select>
                <button type="button" id="btnDeployRemoteVirus" class="hc-btn primary sm" ${upJob ? 'disabled' : ''} onclick="window.internetEngine.deploySelectedVirusToCurrentHost()">
                  ${upJob ? 'Enviando Pacote...' : 'Upload & Executar Vírus'}
                </button>
              </div>
              ${upJob ? `
                <div style="margin-top:8px;">
                  <div style="display:flex;justify-content:space-between;font-family:var(--hc-font-mono);font-size:0.75rem;margin-bottom:4px;">
                    <span>Transmitindo ${esc(upJob.filename)} pela Internet...</span>
                    <strong id="sshVirusUploadPctLbl" style="color:var(--hc-accent-text);">${upJob.pct}% (${upJob.sizeMb} MB)</strong>
                  </div>
                  <div style="height:8px;background:var(--hc-inset);border-radius:999px;overflow:hidden;">
                    <div id="sshVirusUploadBarFill" style="height:100%;width:${upJob.pct}%;background:var(--hc-accent);transition:width 0.18s linear;"></div>
                  </div>
                </div>
              ` : ''}
              ${installedOnTarget.length > 0
                ? `<div style="margin-top: 8px; font-size: 0.77rem; color: var(--hc-accent-text); font-family: var(--hc-font-mono);">
                     Rodando neste alvo: ${installedOnTarget.map((iv) => `${esc(iv.filename)} (${window.softwareEngine.fmtVer(iv.versionInt)}, ${iv.sizeMb || 20}MB)`).join(' · ')}
                   </div>`
                : `<div style="margin-top: 6px; font-size: 0.74rem; color: var(--hc-text-3);">Dica: Vírus de versão &lt;= Antivirus.av do alvo podem ser expurgados nas varreduras automáticas!</div>`}
            </div>

            <!-- Saque de Reserva $ HC & Carteira Bitcoin wallet.dat -->
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button type="button" id="btnDrainRemoteVault" class="hc-btn primary sm" ${host.bankBalance <= 0 ? 'disabled style="opacity:0.45;"' : ''} onclick="window.internetEngine.drainRemoteHostFunds()">
                Drenar Reserva Local ($ ${host.bankBalance} HC)
              </button>
              <button type="button" id="btnDrainRemoteBtc" class="hc-btn sm" style="border-color: var(--hc-warning); color: var(--hc-warning); ${remoteBtcSats <= 0 ? 'opacity:0.4;pointer-events:none;' : ''}" onclick="window.internetEngine.drainCurrentHostBtcWallet()">
                ${remoteBtcSats > 0 ? `Roubar wallet.dat (+${remoteBtcStr} BTC)` : 'wallet.dat vazia (0 BTC)'}
              </button>
              ${host.kind === 'bot'
                ? `<button type="button" class="hc-btn sm" onclick="enslaveBotToC2('${esc(host.ip)}')">Anexar Bot na Central Botnet C2</button>`
                : ''}
            </div>

            <!-- Softwares no HD do Alvo (Roubo / Download Grátis p/ Seu PC!) & Varredura Seeker.skr -->
            ${window.stealthXhdEngine ? (() => {
              const stealables = window.stealthXhdEngine.getStealableSoftwaresOnHost(host);
              const seekerRevealed = window.stealthXhdEngine.revealedHosts.has(host.ip);
              const seekerClaimed = window.stealthXhdEngine.claimedHiddenLoot.has(host.ip);
              return `
                <div class="hc-card" style="padding:0.9rem 1.05rem;display:flex;flex-direction:column;gap:8px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
                    <div class="hc-eyebrow">Softwares Binários & Arquivos Ocultos no Alvo</div>
                    ${!seekerRevealed
                      ? `<button type="button" id="btnRunRemoteSeeker" class="hc-btn ghost sm" onclick="window.handleRunRemoteSeeker('${esc(host.ip)}')">🔍 Rodar Seeker.skr (v${window.stealthXhdEngine.getSeekerVer().toFixed(1)})</button>`
                      : (!seekerClaimed
                          ? `<button type="button" id="btnClaimHiddenVault" class="hc-btn primary sm" onclick="window.handleClaimHiddenVault('${esc(host.ip)}')">💎 Extrair Cofre Oculto (.secret_vault.enc)</button>`
                          : `<span class="hc-badge success">Cofre Oculto Extraído</span>`)}
                  </div>
                  ${stealables.length === 0
                    ? `<div style="font-size:0.77rem;color:var(--hc-text-3);">Nenhum binário superior destravado para download neste host (visite servidores da Trilha de Enigmas, Empresas, Bancos ou Bots Tier II/III!).</div>`
                    : stealables.map((st) => `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:var(--hc-inset);border:1px solid var(--hc-border);border-radius:7px;gap:8px;flex-wrap:wrap;font-size:0.8rem;">
                          <div>
                            <strong style="font-family:var(--hc-font-mono);color:var(--hc-accent-text);">${esc(st.filename)}</strong>
                            <span class="hc-badge success" style="margin-left:6px;">v${(st.versionInt / 10).toFixed(1)}</span>
                            <span class="hc-badge info" style="margin-left:4px;">${esc(st.sourceBadge)}</span>
                          </div>
                          <button type="button" id="btnStealSoft_${esc(st.softKey)}" class="hc-btn primary sm" onclick="window.handleDownloadRemoteSoft('${esc(host.ip)}', '${esc(st.softKey)}', ${st.versionInt})">
                            ⬇ Baixar p/ Meu PC (Grátis)
                          </button>
                        </div>
                      `).join('')}
                </div>
              `;
            })() : ''}

            <div class="hc-eyebrow">Arquivos em /root (${allFiles.length})</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">${filesHtml || '<div style="color:var(--hc-text-3);font-size:0.82rem;">Diretório vazio.</div>'}</div>
          </div>
        `;
      } else {
        const specs = window.softwareEngine ? window.softwareEngine.inspectRemoteHostResources(host) : null;
        subContent = `
          <div class="hc-card" style="padding: 1.1rem; font-family: var(--hc-font-mono); font-size: 0.82rem; display: flex; flex-direction: column; gap: 7px;">
            <div>HOST: <strong>${esc(host.hostname)}</strong> [${esc(host.ip)}]</div>
            <div>PROCESSADOR (CPU): <strong>${specs ? specs.cpuMhz.toLocaleString('pt-BR') + ' MHz' : esc(host.cpuSpec)}</strong></div>
            <div>INTERNET DO ALVO: <strong>${specs ? specs.netMbps + ' Mbit/s' : '10 Mbit/s'}</strong></div>
            <div>ARMAZENAMENTO (HDD): <strong>${specs ? `${specs.hddUsedMb} / ${specs.hddTotalMb} MB (${specs.hddFreeMb} MB livres)` : 'N/A'}</strong></div>
            <div>MEMÓRIA RAM: <strong>${specs ? `${specs.ramUsedMb} / ${specs.ramTotalMb} MB (${specs.ramFreeMb} MB livres)` : 'N/A'}</strong></div>
            <div>DEFESAS ATIVAS: Hasher v${(host.hasherVer || 1.0).toFixed(1)} · Firewall v${(host.firewallVer || 1.0).toFixed(1)} · Antivirus.av ${specs && specs.antivirusVer > 0 ? 'v' + specs.antivirusVer.toFixed(1) : 'Ausente'}</div>
            <div>SENHA ROOT ATUAL: <strong style="color: var(--hc-accent-text);">${esc(host.rootPassword)}</strong></div>
          </div>
        `;
      }

      return `
        <div>
          <div class="ssh-root-bar">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="hc-badge success">ROOT SHELL ATIVO</span>
              <span style="font-family: var(--hc-font-mono); font-size: 0.84rem;">root@${esc(host.ip)}:~#</span>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button type="button" class="hc-btn sm ${this.sshSubTab === 'logs' ? 'primary' : 'ghost'}" onclick="window.internetEngine.sshSubTab='logs'; window.internetEngine.render();">Logs (/var/log/syslog)</button>
              <button type="button" id="btnSshSubTabFiles" class="hc-btn sm ${this.sshSubTab === 'files' ? 'primary' : 'ghost'}" onclick="window.internetEngine.sshSubTab='files'; window.internetEngine.render();">Vírus, Carteira & Arquivos</button>
              <button type="button" class="hc-btn sm ${this.sshSubTab === 'hw' ? 'primary' : 'ghost'}" onclick="window.internetEngine.sshSubTab='hw'; window.internetEngine.render();">Hardware</button>
              <button type="button" class="hc-btn ghost sm" style="color: var(--hc-danger-text);" onclick="window.internetEngine.disconnectSsh()">Desconectar</button>
            </div>
          </div>
          ${subContent}
        </div>
      `;
    }

    renderInvadirTab(host) {
      if (host.kind === 'self') {
        return `<div class="hc-card" style="padding: 1.2rem; color: var(--hc-warning);">Você não pode invadir o seu próprio IP público (${esc(host.ip)}).</div>`;
      }

      const power = this.getPlayerAttackPower();
      const crcVer = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('cracker') : 1.0;
      const expPower = this.getPlayerExploitPower();
      const reqHasher = host.hasherVer || 1.0;
      const reqFwl = host.firewallVer || 1.0;
      const scanned = this.portScannedIps.has(host.ip);
      const saved = window.hackedDb ? window.hackedDb.getEntry(host.ip) : null;

      return `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <span style="font-size: 0.86rem; color: var(--hc-text-2);">Alvo: <strong>${esc(host.hostname)}</strong> · <span style="font-family:var(--hc-font-mono);font-size:0.78rem;">${esc(host.cpuSpec)}</span></span>
            ${saved ? `<span class="hc-badge success">Já consta no seu Hacked Database (${esc(saved.password)})</span>` : ''}
          </div>

          ${this.isCracking ? `
            <div class="hc-card" style="padding: 1rem; margin-bottom: 14px; border-color: var(--hc-accent);">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; font-family: var(--hc-font-mono); font-size: 0.82rem; margin-bottom: 6px;">
                <span>QUEBRANDO HASH ROOT (Cracker.crc v${crcVer.toFixed(1)} · ${power}x)...</span>
                <div style="display:flex;align-items:center;gap:8px;">
                  <strong id="inetCrackPctLabel" style="color: var(--hc-accent-text);">${this.crackPct}%</strong>
                  ${this.activeCrackPid && window.attackMinigame
                    ? `<button type="button" id="btnOpenVaultFromCrack" class="hc-btn primary sm" onclick="window.attackMinigame.openForProcess(${this.activeCrackPid})">⚡ Cortar Tempo (Cofre)</button>`
                    : ''}
                </div>
              </div>
              <div style="height: 10px; background: var(--hc-inset); border-radius: 999px; overflow: hidden; border: 1px solid var(--hc-border);">
                <div id="inetCrackBarFill" style="height: 100%; width: ${this.crackPct}%; background: var(--hc-accent); transition: width 0.12s linear;"></div>
              </div>
            </div>
          ` : ''}

          <div class="inet-attack-grid">
            <div class="inet-attack-card">
              <div class="inet-attack-icon">${HC.icon('key-round')}</div>
              <strong style="font-size: 0.95rem;">Ataque força-bruta</strong>
              <div style="font-size: 0.78rem; color: var(--hc-text-2);">
                Seu <code>Cracker.crc v${crcVer.toFixed(1)}</code> vs <code>Hasher v${reqHasher.toFixed(1)}</code> do alvo.
                <span style="color:${crcVer >= reqHasher ? 'var(--hc-accent-text)' : 'var(--hc-danger-text)'};display:block;margin-top:2px;">
                  ${crcVer >= reqHasher ? '● Potência suficiente para quebrar' : `● Exige Cracker.crc >= v${reqHasher.toFixed(1)}`}
                </span>
              </div>
              <button type="button" id="btnInetBruteforce" class="hc-btn primary" style="margin-top: 6px; width: 100%; justify-content: center;" onclick="window.internetEngine.startBruteforce()">
                Iniciar Força-Bruta
              </button>
            </div>

            <div class="inet-attack-card">
              <div class="inet-attack-icon">${HC.icon('zap')}</div>
              <strong style="font-size: 0.95rem;">Ataque exploit</strong>
              <div style="font-size: 0.78rem; color: var(--hc-text-2);">
                Sua potência Exploit <code>${expPower}x</code> vs <code>Firewall v${reqFwl.toFixed(1)}</code> (requer Port Scan).
                <span style="color:${expPower >= reqFwl ? 'var(--hc-accent-text)' : 'var(--hc-danger-text)'};display:block;margin-top:2px;">
                  ${expPower >= reqFwl ? '● Capaz de furar o Firewall' : `● Exige Exploit >= ${reqFwl.toFixed(1)}x`}
                </span>
              </div>
              <button type="button" id="btnInetExploit" class="hc-btn" style="margin-top: 6px; width: 100%; justify-content: center;" onclick="window.internetEngine.startExploitAttack()">
                Disparar Exploit SSH
              </button>
            </div>
          </div>

          <div class="inet-portscan-bar">
            <div>
              <strong style="font-size: 0.86rem;">Port Scan TCP (${scanned ? 'Concluído' : 'Pendente'})</strong>
              <div style="font-size: 0.78rem; color: var(--hc-text-2); font-family: var(--hc-font-mono); margin-top: 2px;">
                ${scanned
                  ? `22/ssh [ABERTA] · 21/ftp [ABERTA] · Firewall v${reqFwl.toFixed(1)} · Antivirus.av ${host.antivirusVer > 0 ? 'v' + host.antivirusVer.toFixed(1) : 'Ausente'}`
                  : 'Sonde as portas abertas do alvo para habilitar ataques de exploit.'}
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button type="button" id="btnInetPortScan" class="hc-btn sm" onclick="window.internetEngine.runPortScan()">Rodar port scan</button>
              ${host.kind === 'bot'
                ? `<button type="button" class="hc-btn ghost sm" onclick="openWindow('winCracker'); window.renderCrackerUI('crackerAppBody', '${esc(host.ip)}');">Abrir no HC Cracker Pro</button>`
                : ''}
            </div>
          </div>
        </div>
      `;
    }

    render(containerId = 'internetAppBody') {
      const container = document.getElementById(containerId);
      if (!container) return;

      const host = this.resolveHost(this.currentIp);
      const isFav = this.favorites.has(this.currentIp);

      let bodyHtml = '';
      if (host.notFound) {
        bodyHtml = `
          <div class="inet-viewport">
            <div class="hc-card" style="padding: 2rem; text-align: center;">
              <span class="hc-badge danger">ERR_HOST_UNREACHABLE (404)</span>
              <h3 style="margin: 0.65rem 0 0.35rem;">Não foi possível conectar a <code>${esc(host.ip)}</code></h3>
              <p style="color: var(--hc-text-2); font-size: 0.86rem; margin-bottom: 1rem;">${esc(host.reason)}</p>
              <button type="button" class="hc-btn primary" onclick="window.internetEngine.navigate('71.4.20.1')">Abrir Diretório First Whois (71.4.20.1)</button>
            </div>
          </div>
        `;
      } else {
        const tabBody = this.activeTab === 'pagina'
          ? this.renderPublicPageTab(host)
          : (this.activeTab === 'entrar' ? this.renderLoginOrRootTab(host) : this.renderInvadirTab(host));

        const bounceBar = (window.bounceEngine && host.kind !== 'self')
          ? window.bounceEngine.renderInternetBounceBarHtml(host.ip)
          : '';

        bodyHtml = `
          ${bounceBar}
          <div class="inet-host-banner">
            <div class="inet-host-id">
              <div class="inet-host-icon">${HC.icon(host.kind === 'isp' ? 'wifi' : (host.kind === 'banco' ? 'landmark' : 'server'))}</div>
              <div>
                <div class="inet-ip-row">
                  <span class="inet-ip-code">${esc(host.ip)}</span>
                  <button type="button" class="inet-fav-btn ${isFav ? 'active' : ''}" onclick="window.internetEngine.toggleFavoriteCurrent()" title="Favoritar IP">${isFav ? '★' : '☆'}</button>
                  <span class="hc-badge info">${esc(host.badge)}</span>
                </div>
                <div class="inet-host-name">${esc(host.hostname)}</div>
              </div>
            </div>
            <div>
              <span class="hc-badge ${host.online ? 'success' : 'danger'}">${host.online ? '● Online' : '○ Offline'}</span>
            </div>
          </div>

          <div class="inet-tabs">
            <button type="button" class="inet-tab ${this.activeTab === 'pagina' ? 'active' : ''}" onclick="window.internetEngine.switchTab('pagina')">${HC.icon('globe')} <span>Página</span></button>
            <button type="button" class="inet-tab ${this.activeTab === 'entrar' ? 'active' : ''}" onclick="window.internetEngine.switchTab('entrar')">${HC.icon('terminal')} <span>Entrar${this.activeSshIp === host.ip ? ' (Root)' : ''}</span></button>
            <button type="button" class="inet-tab ${this.activeTab === 'invadir' ? 'active' : ''}" onclick="window.internetEngine.switchTab('invadir')">${HC.icon('zap')} <span>Invadir</span></button>
          </div>

          <div class="inet-viewport">${tabBody}</div>
        `;
      }

      const favList = Array.from(this.favorites);

      container.innerHTML = `
        <div class="inet-shell">
          <div class="inet-main-panel">
            <div class="inet-navbar">
              <button type="button" class="inet-nav-btn" ${this.historyIdx <= 0 ? 'disabled' : ''} onclick="window.internetEngine.goBack()" title="Voltar">${HC.icon('arrow-left')}</button>
              <button type="button" class="inet-nav-btn" ${this.historyIdx >= this.history.length - 1 ? 'disabled' : ''} onclick="window.internetEngine.goForward()" title="Avançar">${HC.icon('arrow-right')}</button>
              <button type="button" class="inet-nav-btn" onclick="window.internetEngine.render()" title="Recarregar">${HC.icon('refresh-cw')}</button>
              <div class="inet-addr-wrap">
                ${HC.icon('globe')}
                <input type="text" id="inetAddressInput" class="inet-addr-input" value="${esc(this.currentIp)}" placeholder="Digite qualquer IP ou domínio (ex: 71.4.5.1, 203.17.88.40)..." onkeydown="if(event.key==='Enter') window.internetEngine.navigate(this.value)">
              </div>
              <button type="button" id="btnInetGo" class="inet-go-btn" onclick="window.internetEngine.navigate(document.getElementById('inetAddressInput').value)">Ir</button>
            </div>
            ${bodyHtml}
          </div>

          <aside class="inet-side">
            <div>
              <div class="inet-side-group-title">★ Favoritos</div>
              ${favList.length === 0
                ? `<div style="font-size: 0.76rem; color: var(--hc-text-3); padding: 4px 6px;">Clique na estrela ao lado de um IP.</div>`
                : favList.map((fIp) => {
                    const fh = this.resolveHost(fIp);
                    return `
                      <button type="button" class="inet-bm-item ${fIp === this.currentIp ? 'current' : ''}" onclick="window.internetEngine.navigate('${esc(fIp)}')">
                        <div>
                          <span class="inet-bm-ip">${esc(fIp)}</span>
                          <span class="inet-bm-label">${esc(fh.hostname || fIp)}</span>
                        </div>
                        <span style="color: var(--hc-warning);">★</span>
                      </button>`;
                  }).join('')}
            </div>

            <div>
              <div class="inet-side-group-title">IPs Importantes</div>
              ${IMPORTANT_BOOKMARKS.map((b) => `
                <button type="button" class="inet-bm-item ${b.ip === this.currentIp ? 'current' : ''}" onclick="window.internetEngine.navigate('${b.ip}')">
                  <div>
                    <span class="inet-bm-ip">${b.ip}</span>
                    <span class="inet-bm-label">${esc(b.label)}</span>
                  </div>
                </button>
              `).join('')}
            </div>

            <div>
              <div class="inet-side-group-title">Visitados Recentemente</div>
              ${this.recentIps.map((rIp) => `
                <button type="button" class="inet-bm-item ${rIp === this.currentIp ? 'current' : ''}" onclick="window.internetEngine.navigate('${esc(rIp)}')">
                  <span class="inet-bm-ip">${esc(rIp)}</span>
                </button>
              `).join('')}
            </div>
          </aside>
        </div>
      `;
    }
  }

  window.networkIdentity = new NetworkIdentityEngine();
  window.hackedDb = new HackedDatabaseEngine();
  window.internetEngine = new InternetBrowserEngine();

  window.handleIpResetAction = async function (allowPaid, btnEl) {
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.textContent = 'Renovando IP...';
    }
    const res = await window.networkIdentity.resetPublicIp(!!allowPaid);
    if (!res.success) {
      if (window.internetEngine) window.internetEngine.render();
      window.networkIdentity.renderProfileIpCard('profileIpCardMount');
      alert(res.message);
      return res;
    }
    if (typeof window.showToast === 'function') {
      window.showToast(res.message);
    }
    return res;
  };

  window.handleRootPwdReset = function () {
    const newPwd = window.networkIdentity.resetRootPassword();
    if (typeof window.showToast === 'function') {
      window.showToast(`Nova senha root gerada: ${newPwd}`);
    }
  };

  window.handleRemoteFileAction = function (ip, fileName, actionKind) {
    if (window.missionsEngine) {
      window.missionsEngine.notifyRemoteFileAction(ip, fileName, actionKind);
    }
    if (typeof window.showToast === 'function') {
      window.showToast(
        actionKind === 'delete'
          ? `Arquivo ${fileName} deletado de ${ip}! Lembre-se de limpar o syslog!`
          : `Arquivo ${fileName} extraído de ${ip}! Lembre-se de limpar o syslog!`
      );
    }
    if (window.internetEngine) {
      window.internetEngine.render();
    }
  };

  window.handleDownloadRemoteSoft = function (ip, softKey, remoteVersionInt) {
    if (!window.stealthXhdEngine || !window.internetEngine) return null;
    const host = window.internetEngine.resolveHost(ip);
    const res = window.stealthXhdEngine.downloadRemoteSoftware(host, softKey, remoteVersionInt, false);
    if (!res.success) alert(res.message);
    return res;
  };

  window.handleRunRemoteSeeker = function (ip) {
    if (!window.stealthXhdEngine || !window.internetEngine) return null;
    const host = window.internetEngine.resolveHost(ip);
    const res = window.stealthXhdEngine.runRemoteSeeker(host);
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };

  window.handleClaimHiddenVault = function (ip) {
    if (!window.stealthXhdEngine || !window.internetEngine) return null;
    const host = window.internetEngine.resolveHost(ip);
    const res = window.stealthXhdEngine.claimHiddenSecretFile(host);
    if (!res.success) alert(res.message);
    return res;
  };

  // Atalho global Ctrl+K / Cmd+K para focar a busca rápida de IP na Topbar
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      const inp = document.getElementById('topbarIpInput');
      if (inp && inp.offsetParent !== null) {
        e.preventDefault();
        inp.focus();
        inp.select();
      }
    }
  });
})();
