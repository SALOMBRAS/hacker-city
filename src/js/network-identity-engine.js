/**
 * Hacker City // Bloco 1 MMO:
 * 1. NetworkIdentityEngine — IP Público Aleatório Único por Jogador + Troca Grátis 1x/Semana (7 dias)
 * 2. HackedDatabaseEngine  — Caderno Persistente de IPs, Senhas, Exploits e Notas
 * 3. InternetBrowserEngine — Navegação Real por IP (Página / Entrar SSH Root / Invadir / Logs Editáveis)
 */
(function () {
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias exatos (168h)
  const RESERVED_FIRST_OCTETS = new Set([0, 10, 33, 71, 77, 100, 109, 127, 133, 155, 169, 172, 185, 192, 194, 198, 203, 224, 240, 255]);

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
      this._revealTimer = null;
      this.bindTouchPrivacyReveal();
    }

    isTouchOrCompactViewport() {
      if (typeof window === 'undefined') return false;
      if (window.innerWidth <= 860) return true;
      return !!(window.matchMedia && window.matchMedia('(hover: none)').matches);
    }

    bindTouchPrivacyReveal() {
      if (typeof document === 'undefined') return;
      document.addEventListener('click', (ev) => {
        if (!this.isTouchOrCompactViewport()) return;
        const priv = ev.target && ev.target.closest ? ev.target.closest('.my-ip-privacy') : null;
        if (!priv || priv.closest('#hudMyIpChip')) return;
        ev.stopPropagation();
        const next = !priv.classList.contains('ip-revealed');
        priv.classList.toggle('ip-revealed', next);
        if (next) {
          setTimeout(() => priv.classList.remove('ip-revealed'), 6000);
        }
      });
    }

    handleHudIpChipClick(ev) {
      if (ev && ev.target && ev.target.closest && ev.target.closest('.ip-copy-btn')) return;
      const chip = typeof document !== 'undefined' ? document.getElementById('hudMyIpChip') : null;
      if (this.isTouchOrCompactViewport() && chip && !chip.classList.contains('ip-revealed')) {
        chip.classList.add('ip-revealed');
        if (this._revealTimer) clearTimeout(this._revealTimer);
        this._revealTimer = setTimeout(() => chip.classList.remove('ip-revealed'), 6000);
        if (typeof window.showToast === 'function') {
          window.showToast('👁️ Seu IP foi revelado por 6s! Toque de novo para abrir o Provedor ISP.');
        }
        return;
      }
      if (chip) chip.classList.remove('ip-revealed');
      if (window.internetEngine && typeof window.internetEngine.openIp === 'function') {
        window.internetEngine.openIp('71.4.5.1');
      }
    }

    storageKey(uid) {
      return `HC_NET_IDENTITY_${uid || 'guest'}`;
    }

    generateRandomPublicIp(excludeSet = new Set()) {
      for (let attempt = 0; attempt < 300; attempt++) {
        const o1 = 11 + Math.floor(Math.random() * 212); // 11..222
        if (RESERVED_FIRST_OCTETS.has(o1)) continue;
        const o2 = 10 + Math.floor(Math.random() * 244); // 10..253
        const o3 = 10 + Math.floor(Math.random() * 244); // 10..253
        const o4 = 10 + Math.floor(Math.random() * 244); // 10..253
        const candidate = `${o1}.${o2}.${o3}.${o4}`;
        if (!excludeSet.has(candidate)) return candidate;
      }
      return `142.${10 + Math.floor(Math.random() * 200)}.${10 + Math.floor(Math.random() * 200)}.${10 + Math.floor(Math.random() * 240)}`;
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

    // Divide o IP separando exatamente os últimos 7 dígitos numéricos para o blur anti-curiosos
    splitMyIpLast7Digits(ip = null) {
      const str = String(ip || this.getPublicIp() || '0.0.0.0').trim();
      let digitsSeen = 0;
      let splitIdx = -1;
      for (let i = str.length - 1; i >= 0; i--) {
        if (/\d/.test(str[i])) {
          digitsSeen++;
          if (digitsSeen === 7) {
            splitIdx = i;
            break;
          }
        }
      }
      // Caso legado com menos de 8 dígitos totais: mantém o 1º octeto visível e oculta o restante
      if (splitIdx <= 0) {
        const firstDot = str.indexOf('.');
        splitIdx = firstDot >= 0 ? firstDot + 1 : Math.min(1, str.length);
      }
      return {
        full: str,
        head: str.slice(0, splitIdx),
        tail: str.slice(splitIdx),
        blurredDigitsCount: (str.slice(splitIdx).match(/\d/g) || []).length
      };
    }

    renderBlurredMyIpHtml(ip = null, withTooltip = false) {
      const parts = this.splitMyIpLast7Digits(ip);
      const tipAttrs = withTooltip
        ? ' data-tip-title="Seu IP protegido" data-tip-meta="Privacidade" data-tip-desc="Os últimos 7 dígitos ficam ocultos automaticamente. Passe o mouse por cima para revelar."'
        : '';
      return `<span class="my-ip-privacy" tabindex="0"${tipAttrs}><span class="my-ip-head">${esc(parts.head)}</span><span class="my-ip-blur-tail">${esc(parts.tail)}</span></span>`;
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
      if (window.onlineEngine) {
        window.onlineEngine.trackRealtimePresence();
        window.onlineEngine.publishDirectoryBeacon();
        window.onlineEngine.scheduleSave(true);
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
        message: `Novo IP público atribuído pelo provedor! Passe o mouse sobre Seu IP para visualizar (${wasFree ? 'Troca semanal gratuita utilizada' : 'Taxa $ ' + costPaid + ' HC'}).`
      };
    }

    resetRootPassword() {
      this.ensureForProfile(window.currentProfile);
      const oldPwd = this.state.rootPassword;
      let nextPwd = randomRootPassword();
      while (nextPwd === oldPwd) nextPwd = randomRootPassword();
      this.state.rootPassword = nextPwd;
      this.state.pwdEpoch = (this.state.pwdEpoch || 1) + 1;
      this.save();
      if (window.currentProfile) window.currentProfile.root_password = nextPwd;
      if (window.onlineEngine) {
        window.onlineEngine.trackRealtimePresence();
        window.onlineEngine.publishDirectoryBeacon();
        window.onlineEngine.scheduleSave(true);
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('PASSWD', `Senha root local rotacionada com sucesso (credenciais antigas em Hacked Databases rivais revogadas!)`, 'info');
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
        window.showToast('Seu IP público foi copiado para a área de transferência!');
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
                <span style="font-family: var(--hc-font-mono); font-size: 1.15rem; font-weight: 700; color: var(--hc-accent-text);">${this.renderBlurredMyIpHtml(ip, true)}</span>
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
        existing.sshUser = meta.sshUser || existing.sshUser || 'root';
        if (meta.password) existing.password = meta.password;
        if (meta.cpuSpec) existing.cpuSpec = meta.cpuSpec;
        if (meta.analyzedHw) existing.analyzedHw = meta.analyzedHw;
        existing.updatedAt = new Date().toLocaleString('pt-BR');
      } else {
        this.entries.unshift({
          ip: meta.ip,
          hostname: meta.hostname || meta.ip,
          kind: meta.kind || 'bot',
          tier: meta.tier || 1,
          accessMethod: meta.accessMethod || 'password',
          sshUser: meta.sshUser || 'root',
          password: meta.password || 'EXPLOITED',
          cpuSpec: meta.cpuSpec || 'Hardware não escaneado (use Analyzer.ana)',
          analyzedHw: meta.analyzedHw || null,
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

    promptNote(ip) {
      this.ensureLoaded();
      const entry = this.getEntry(ip);
      const cur = entry ? (entry.notes || '') : '';
      const next = window.prompt(`Anotação rápida para ${ip}:`, cur);
      if (next !== null) {
        this.saveNote(ip, next);
        this.renderUI();
      }
    }

    copyPassword(pwd) {
      if (navigator.clipboard && pwd) {
        navigator.clipboard.writeText(pwd).catch(() => {});
      }
      if (typeof window.showToast === 'function') {
        window.showToast('Senha copiada para a área de transferência!');
      }
    }

    renderUI(containerId = 'hackedDbBody') {
      const container = document.getElementById(containerId);
      if (!container) return;
      this.ensureLoaded();

      const ic = (n) => (window.HC && window.HC.icon ? window.HC.icon(n) : '');
      const q = this.searchQuery.trim().toLowerCase();
      const filtered = this.entries.filter((e) => {
        if (this.filterKind !== 'all') {
          const isPlayerKind = e.kind === 'player' || e.kind === 'bot';
          if (this.filterKind === 'player' && !isPlayerKind) return false;
          if (this.filterKind === 'npc' && isPlayerKind) return false;
        }
        if (!q) return true;
        return e.ip.toLowerCase().includes(q) || (e.hostname || '').toLowerCase().includes(q) || (e.notes || '').toLowerCase().includes(q);
      });

      const bankAccCount = window.multiBankEngine
        ? (window.multiBankEngine.ensureLoaded().hackedAccounts || []).length
        : 0;
      const harvest = window.softwareEngine ? window.softwareEngine.getPendingHarvestSummary() : { virusCount: 0, totalGbps: 0 };

      const rootCount = this.entries.filter((e) => (e.sshUser || 'root') === 'root').length;
      const rootPct = this.entries.length === 0 ? 0 : Math.round((rootCount / this.entries.length) * 100);
      const r = 46;
      const c = +(2 * Math.PI * r).toFixed(2);
      const offset = +(c - (rootPct / 100) * c).toFixed(2);

      let mainContentHtml = '';
      if (this.activeSection === 'banks' && window.multiBankEngine) {
        mainContentHtml = `<div style="padding:14px;">${window.multiBankEngine.renderHackedBankAccountsHtml()}</div>`;
      } else {
        const rowsHtml = filtered.length === 0
          ? `<tr>
               <td colspan="5" style="text-align:center;padding:36px 16px;color:var(--hc-text-3);">
                 Nenhum servidor salvo neste filtro. Invada máquinas na aba <strong>Internet</strong> para registrar automaticamente IPs e senhas aqui.
               </td>
             </tr>`
          : filtered.map((e) => {
              const isPlayerKind = e.kind === 'bot' || e.kind === 'player';
              const kindLabel = isPlayerKind ? 'Jogador' : String(e.kind || 'Host').toUpperCase();
              const iconName = isPlayerKind ? 'user' : (e.kind === 'banco' ? 'landmark' : 'server');
              const glyphCls = isPlayerKind ? 'attack' : (e.kind === 'banco' ? 'stealth' : 'defense');
              const tipDesc = [
                `${e.hostname} (${kindLabel})`,
                e.analyzedHw ? `Hardware: ${e.analyzedHw}` : (e.cpuSpec || ''),
                e.notes ? `Nota: "${e.notes}"` : 'Clique no ícone de lápis para adicionar uma nota.'
              ].filter(Boolean).join(' · ');

              return `
                <tr>
                  <td class="soft-col-icon">
                    <span class="soft-mini-glyph kind-${glyphCls}" data-tip-title="${esc(e.hostname)}" data-tip-meta="${esc(kindLabel)}" data-tip-desc="${esc(tipDesc)}">
                      ${ic(iconName)}
                    </span>
                  </td>
                  <td>
                    <span class="soft-name-trigger" style="cursor:pointer;" tabindex="0" onclick="window.internetEngine.openIp('${esc(e.ip)}')"
                      data-tip-title="${esc(e.hostname)}" data-tip-meta="${esc(e.ip)}" data-tip-desc="${esc(tipDesc)}">
                      <strong style="color:var(--hc-accent-text);">${esc(e.ip)}</strong>
                      <span style="color:var(--hc-text-3);font-family:var(--hc-font-sans);font-size:12px;">${esc(e.hostname)}</span>
                      ${e.notes ? `<span class="hc-badge info">Nota</span>` : ''}
                    </span>
                  </td>
                  <td class="soft-col-ver"><span class="soft-ver-badge v-tier2">${esc(e.sshUser || 'root')}</span></td>
                  <td class="soft-col-size" style="width:120px;color:var(--hc-text);">${esc(e.password)}</td>
                  <td class="soft-col-acts">
                    <div class="soft-icon-actions">
                      <button type="button" class="soft-icon-act ic-run" aria-label="Conectar SSH em ${esc(e.ip)}"
                        data-tip-title="Conectar direto via SSH" data-tip-meta="${esc(e.sshUser || 'root')}"
                        data-tip-desc="Entrar direto no terminal remoto de ${esc(e.ip)} usando a senha salva."
                        onclick="window.internetEngine.quickSshConnect('${esc(e.ip)}')">${ic('terminal')}</button>
                      <button type="button" class="soft-icon-act ic-info" aria-label="Abrir ${esc(e.ip)} na Internet"
                        data-tip-title="Abrir na Internet" data-tip-meta="${esc(e.ip)}"
                        data-tip-desc="Visitar a página pública de ${esc(e.hostname)} no navegador."
                        onclick="window.internetEngine.openIp('${esc(e.ip)}')">${ic('globe')}</button>
                      <button type="button" class="soft-icon-act ic-hide" aria-label="Copiar senha de ${esc(e.ip)}"
                        data-tip-title="Copiar senha" data-tip-meta="${esc(e.password)}"
                        data-tip-desc="Copiar a credencial salva para a área de transferência."
                        onclick="window.hackedDb.copyPassword('${esc(e.password)}')">${ic('copy')}</button>
                      <button type="button" class="soft-icon-act ic-move" aria-label="Editar nota de ${esc(e.ip)}"
                        data-tip-title="Anotação rápida" data-tip-meta="${e.notes ? 'Com nota' : 'Vazia'}"
                        data-tip-desc="${esc(e.notes || 'Registrar lembrete sobre saldo, vírus ou hardware deste IP.')}"
                        onclick="window.hackedDb.promptNote('${esc(e.ip)}')">${ic('pencil')}</button>
                      <button type="button" class="soft-icon-act ic-del" aria-label="Remover ${esc(e.ip)} da lista"
                        data-tip-title="Remover da lista"
                        data-tip-desc="Excluir ${esc(e.ip)} do seu Hacked Database."
                        onclick="window.hackedDb.removeHost('${esc(e.ip)}')">${ic('trash-2')}</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('');

        mainContentHtml = `
          <div class="soft-explorer-shell">
            <div class="soft-main-col">
              <div style="display:flex;gap:8px;align-items:center;">
                <input type="text" class="hc-input" style="height:34px;font-size:12.5px;" placeholder="Pesquisar por IP, nome do servidor ou anotação..." value="${esc(this.searchQuery)}" oninput="window.hackedDb.setSearch(this.value)">
              </div>
              <div class="soft-table-wrap" role="region" aria-label="Servidores e senhas descobertas">
                <table class="soft-table clean-hw-table">
                  <thead>
                    <tr>
                      <th class="soft-col-icon"></th>
                      <th>IP &amp; Servidor Invadido</th>
                      <th class="soft-col-ver">Acesso</th>
                      <th class="soft-col-size" style="width:120px;">Senha</th>
                      <th class="soft-col-acts">Ações</th>
                    </tr>
                  </thead>
                  <tbody>${rowsHtml}</tbody>
                </table>
              </div>
            </div>

            <aside class="soft-side-bar">
              <div class="soft-donut-wrap">
                <svg class="soft-donut-svg" viewBox="0 0 116 116" aria-label="Acesso Root ${rootPct}%">
                  <circle cx="58" cy="58" r="${r}" fill="none" stroke="#222832" stroke-width="8"></circle>
                  <circle cx="58" cy="58" r="${r}" fill="none" stroke="#35b877" stroke-width="8"
                    stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}" transform="rotate(-90 58 58)"></circle>
                  <text x="58" y="63" text-anchor="middle" fill="#ebeff4" font-family="var(--hc-font-mono)" font-size="18" font-weight="700">${this.entries.length}</text>
                </svg>
                <div class="soft-donut-title">IPs Catalogados</div>
                <div class="soft-donut-numbers">
                  <span class="used">${rootCount} Root</span> · <span>${bankAccCount} Contas</span>
                </div>
              </div>

              <div class="soft-bays-box">
                <div class="soft-bay-row"><span>Servidores</span><span style="color:var(--hc-accent-text);">${this.entries.length}</span></div>
                <div class="soft-bay-row"><span>Contas Banco</span><span>${bankAccCount}</span></div>
                <div class="soft-bay-row"><span>Vírus Ativos</span><span style="color:var(--hc-accent-text);">${harvest.virusCount}</span></div>
                <div class="soft-bay-row"><span>Poder DDoS</span><span>${harvest.totalGbps} Gbps</span></div>
              </div>

              <div class="soft-tool-tiles">
                <button type="button" class="soft-tool-tile" onclick="navTo('winSoftware');if(window.softwareEngine){window.softwareEngine.activeTab='viruses';window.softwareEngine.renderUI();}">
                  ${ic('bug')}
                  <span>Rede de Vírus</span>
                </button>
                <button type="button" class="soft-tool-tile" onclick="if(window.bounceEngine) window.bounceEngine.openBuilderModal();">
                  ${ic('shield')}
                  <span>Rota Proxy</span>
                </button>
              </div>
            </aside>
          </div>
        `;
      }

      container.innerHTML = `
        <div class="soft-frame" id="hackedDbExplorerMain">
          <div class="soft-tabs-bar">
            <div class="soft-tabs-left" role="tablist" aria-label="Categorias do Hacked Database">
              <button type="button" id="tabHdbServers" class="soft-tab-btn ${this.activeSection !== 'banks' ? 'active' : ''}" onclick="window.hackedDb.activeSection='servers';window.hackedDb.renderUI();">
                ${ic('database')} <span>IPs &amp; Senhas (${this.entries.length})</span>
              </button>
              <button type="button" id="tabHdbBanks" class="soft-tab-btn ${this.activeSection === 'banks' ? 'active' : ''}" onclick="window.hackedDb.activeSection='banks';window.hackedDb.renderUI();">
                ${ic('landmark')} <span>Contas Bancárias (${bankAccCount})</span>
              </button>
            </div>

            ${this.activeSection !== 'banks' ? `
              <div class="soft-drive-pills" role="group" aria-label="Filtrar tipo de host">
                <button type="button" class="soft-drive-pill ${this.filterKind === 'all' ? 'active' : ''}" onclick="window.hackedDb.setFilter('all')">Todos</button>
                <button type="button" class="soft-drive-pill ${this.filterKind === 'player' ? 'active' : ''}" onclick="window.hackedDb.setFilter('player')">Jogadores</button>
                <button type="button" class="soft-drive-pill ${this.filterKind === 'npc' ? 'active' : ''}" onclick="window.hackedDb.setFilter('npc')">Empresas</button>
              </div>
            ` : ''}
          </div>
          ${mainContentHtml}
        </div>
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
      badge: 'Empresa · CFTV Ativo',
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
      cpuSpec: '2.200 MHz · 100 Mbps · NVR 4 Câmeras · AV v1.5',
      bankBalance: 185,
      files: [
        { name: 'clientes_b2b.csv', size: '42 MB', sizeMb: 42, content: 'Parceiros ativos: Rádio Pirata (133.70.13.37) e Gateway Safenet (109.64.211.37).' },
        { name: 'caixa_interno.dat', size: '28 MB', sizeMb: 28, content: 'Reserva operacional disponível para wire transfer.' }
      ]
    },
    '194.88.14.202': {
      ip: '194.88.14.202',
      domain: 'meridian.hc',
      hostname: 'Meridian BioLabs S.A.',
      kind: 'empresa',
      badge: 'BioTech · CFTV Ao Vivo',
      tier: 1,
      securityLevel: 1,
      cpuMhz: 3200,
      netMbps: 200,
      hddTotalMb: 640,
      hddOsBaseMb: 300,
      ramTotalMb: 512,
      ramOsBaseMb: 220,
      hasherVer: 1.0,
      firewallVer: 1.0,
      antivirusVer: 1.5,
      cpuSpec: '3.200 MHz · 200 Mbps · NVR 4 Câmeras P&D · AV v1.5',
      bankBalance: 290,
      files: [
        { name: 'protocolo_sala_limpa.txt', size: '18 MB', sizeMb: 18, content: 'Acesso visual às câmeras P&D via painel NVR CFTV na porta RTSP 554.' }
      ]
    },
    '172.66.40.18': {
      ip: '172.66.40.18',
      domain: 'aegis-cctv.hc',
      hostname: 'Aegis Security & Vaults S.A.',
      kind: 'empresa',
      badge: 'Central 6 Câmeras CFTV',
      tier: 1,
      securityLevel: 1,
      cpuMhz: 4200,
      netMbps: 300,
      hddTotalMb: 1024,
      hddOsBaseMb: 440,
      ramTotalMb: 512,
      ramOsBaseMb: 240,
      hasherVer: 1.0,
      firewallVer: 1.0,
      antivirusVer: 1.5,
      cpuSpec: '4.200 MHz · 300 Mbps · Matriz 6 Câmeras CFTV · AV v1.5',
      bankBalance: 310,
      files: [
        { name: 'matriz_nvr_6ch.conf', size: '22 MB', sizeMb: 22, content: 'Central de monitoramento corporativo operando 6 modelos de câmeras ao vivo.' }
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
    '185.220.101.77': {
      ip: '185.220.101.77',
      domain: 'vazamentos',
      hostname: 'ZeroBin // Portal hc://vazamentos',
      kind: 'zerobin',
      badge: 'Underground Pastebin',
      tier: 2,
      securityLevel: 2,
      cpuMhz: 6400,
      netMbps: 500,
      hddTotalMb: 4096,
      hddOsBaseMb: 1200,
      ramTotalMb: 2048,
      ramOsBaseMb: 640,
      hasherVer: 2.0,
      firewallVer: 2.0,
      antivirusVer: 2.5,
      cpuSpec: '6.400 MHz · 500 Mbps · HDD 4GB · AV v2.5',
      bankBalance: 650,
      files: [
        { name: 'pgp_relay_index.asc', size: '14 MB', sizeMb: 14, content: 'Índice horário de vazamentos criptografados e alertas de Honey-Paste da Safenet.' }
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
    '161.89.1.1': {
      ip: '161.89.1.1',
      domain: 'fbi.gov.internal',
      hostname: 'Federal Cybercrime Division — Mainframe Central',
      kind: 'fbi_mainframe',
      badge: 'Mainframe Governamental Ultra-Secreto',
      tier: 5,
      securityLevel: 5,
      cpuMhz: 24000,
      netMbps: 10000,
      hddTotalMb: 65536,
      hddOsBaseMb: 32768,
      ramTotalMb: 16384,
      ramOsBaseMb: 8192,
      hasherVer: 8.5,
      firewallVer: 9.0,
      antivirusVer: 8.0,
      cpuSpec: '24.000 MHz · 10.000 Mbps · FW v9.0 · AV v8.0',
      bankBalance: 0,
      files: [
        { name: 'criminal_dossiers.db', size: '1.2 GB', sizeMb: 1200, content: 'CLASSIFICADO: Banco de dados federal de procurados, mandados e IPs mascarados.' },
        { name: 'counter_trace_policy.sys', size: '14 MB', sizeMb: 14, content: 'POLÍTICA DE RETALIAÇÃO: Disparo de batida policial se a invasão durar mais de 60 segundos.' }
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
    },
    '71.4.20.2': {
      ip: '71.4.20.2',
      domain: 'whois2.hc',
      hostname: 'Second Whois — Diretório Regional II',
      kind: 'whois',
      whoisTier: 2,
      badge: 'Diretório II',
      tier: 2,
      securityLevel: 2,
      cpuMhz: 4800,
      netMbps: 500,
      hddTotalMb: 2048,
      hddOsBaseMb: 900,
      ramTotalMb: 1024,
      ramOsBaseMb: 440,
      hasherVer: 2.5,
      firewallVer: 2.5,
      antivirusVer: 2.5,
      cpuSpec: '4.800 MHz · 500 Mbps · AV v2.5',
      bankBalance: 0,
      files: [
        { name: 'tier2_registry.txt', size: '18 MB', sizeMb: 18, content: 'Índice regional II: HEBC Bank 77.3.10.44 | KronoTech 189.40.7.12 | Puzzle #5 109.64.200.22' }
      ]
    },
    '71.4.20.3': {
      ip: '71.4.20.3',
      domain: 'whois3.hc',
      hostname: 'Third Whois — Diretório Internacional III',
      kind: 'whois',
      whoisTier: 3,
      badge: 'Diretório III',
      tier: 3,
      securityLevel: 3,
      cpuMhz: 8400,
      netMbps: 1000,
      hddTotalMb: 4096,
      hddOsBaseMb: 1800,
      ramTotalMb: 2048,
      ramOsBaseMb: 900,
      hasherVer: 4.5,
      firewallVer: 4.5,
      antivirusVer: 4.5,
      cpuSpec: '8.400 MHz · 1.000 Mbps · AV v4.5',
      bankBalance: 0,
      files: [
        { name: 'tier3_registry.txt', size: '24 MB', sizeMb: 24, content: 'Índice III: Bitcoin Market 144.202.44.8 | OmniDyne 192.99.44.80 | Safenet 109.64.211.37' }
      ]
    },
    '71.4.20.4': {
      ip: '71.4.20.4',
      domain: 'whois4.hc',
      hostname: 'Fourth Whois — Backbone Restrito IV',
      kind: 'whois',
      whoisTier: 4,
      badge: 'Diretório IV',
      tier: 4,
      securityLevel: 4,
      cpuMhz: 16000,
      netMbps: 2500,
      hddTotalMb: 8192,
      hddOsBaseMb: 3600,
      ramTotalMb: 4096,
      ramOsBaseMb: 1800,
      hasherVer: 6.5,
      firewallVer: 6.5,
      antivirusVer: 6.5,
      cpuSpec: '16.000 MHz · 2.500 Mbps · AV v6.5',
      bankBalance: 0,
      files: [
        { name: 'tier4_backbone.txt', size: '32 MB', sizeMb: 32, content: 'Índice IV: Swiss Offshore 77.3.12.15 | EvilCorp 209.141.55.10 | FBI 161.89.1.1 | NSA 161.89.2.1' }
      ]
    },
    '144.202.44.8': {
      ip: '144.202.44.8',
      domain: 'btc.hc',
      hostname: 'Bitcoin Market Exchange',
      kind: 'btc_market',
      badge: 'Câmbio Cripto',
      tier: 3,
      securityLevel: 3,
      cpuMhz: 9600,
      netMbps: 1000,
      hddTotalMb: 4096,
      hddOsBaseMb: 1900,
      ramTotalMb: 2048,
      ramOsBaseMb: 920,
      hasherVer: 3.5,
      firewallVer: 3.5,
      antivirusVer: 4.0,
      cpuSpec: '9.600 MHz · 1.000 Mbps · AV v4.0',
      bankBalance: 1650,
      files: [
        { name: 'cold_reserve_audit.log', size: '54 MB', sizeMb: 54, content: 'Livro público de liquidez BTC/HC e ordens instantâneas.' }
      ]
    },
    '58.40.12.9': {
      ip: '58.40.12.9',
      domain: 'corvocinza.hc',
      hostname: 'Corvo Cinza Logística',
      kind: 'empresa',
      badge: 'Empresa',
      tier: 1,
      securityLevel: 1,
      cpuMhz: 2800,
      netMbps: 120,
      hddTotalMb: 640,
      hddOsBaseMb: 310,
      ramTotalMb: 512,
      ramOsBaseMb: 210,
      hasherVer: 1.5,
      firewallVer: 1.5,
      antivirusVer: 1.5,
      cpuSpec: '2.800 MHz · 120 Mbps · HDD 640MB · AV v1.5',
      bankBalance: 340,
      files: [
        { name: 'rotas_carga_sul.csv', size: '28 MB', sizeMb: 28, content: 'Manifesto de frotas e contratos corporativos de transporte.' }
      ]
    },
    '187.22.5.60': {
      ip: '187.22.5.60',
      domain: 'boteco.hc',
      hostname: 'Boteco h4x0r',
      kind: 'underground',
      badge: 'Comunidade',
      tier: 1,
      securityLevel: 1,
      cpuMhz: 2400,
      netMbps: 100,
      hddTotalMb: 512,
      hddOsBaseMb: 240,
      ramTotalMb: 384,
      ramOsBaseMb: 180,
      hasherVer: 1.5,
      firewallVer: 1.5,
      antivirusVer: 1.0,
      cpuSpec: '2.400 MHz · 100 Mbps · HDD 512MB · AV v1.0',
      bankBalance: 260,
      files: [
        { name: 'receitas_underground.txt', size: '14 MB', sizeMb: 14, content: 'Anotações da galera: o Second Whois fica em 71.4.20.2 e a corretora BTC em 144.202.44.8!' }
      ]
    },
    '189.40.7.12': {
      ip: '189.40.7.12',
      domain: 'kronotech.hc',
      hostname: 'KronoTech Sistemas',
      kind: 'empresa',
      badge: 'Corporação',
      tier: 2,
      securityLevel: 2,
      cpuMhz: 6400,
      netMbps: 400,
      hddTotalMb: 2048,
      hddOsBaseMb: 920,
      ramTotalMb: 1024,
      ramOsBaseMb: 460,
      hasherVer: 2.5,
      firewallVer: 2.5,
      antivirusVer: 2.5,
      cpuSpec: '6.400 MHz · 400 Mbps · HDD 2GB · AV v2.5',
      bankBalance: 680,
      files: [
        { name: 'folha_executiva.xls', size: '48 MB', sizeMb: 48, content: 'Pagamentos processados via HEBC Clearing Bank (77.3.10.44).' }
      ]
    },
    '192.99.44.80': {
      ip: '192.99.44.80',
      domain: 'omnidyne.hc',
      hostname: 'OmniDyne Defense Systems',
      kind: 'empresa',
      badge: 'Defesa Militar',
      tier: 3,
      securityLevel: 3,
      cpuMhz: 12000,
      netMbps: 1000,
      hddTotalMb: 8192,
      hddOsBaseMb: 3600,
      ramTotalMb: 4096,
      ramOsBaseMb: 1800,
      hasherVer: 4.5,
      firewallVer: 4.5,
      antivirusVer: 4.5,
      cpuSpec: '12.000 MHz · 1.000 Mbps · HDD 8GB · AV v4.5',
      bankBalance: 1450,
      files: [
        { name: 'telemetry_sat.bin', size: '96 MB', sizeMb: 96, content: 'Dados criptografados de defesa orbital e contratos governamentais.' }
      ]
    },
    '209.141.55.10': {
      ip: '209.141.55.10',
      domain: 'evilcorp.hc',
      hostname: 'EvilCorp Conglomerate',
      kind: 'empresa',
      badge: 'MegaCorp',
      tier: 4,
      securityLevel: 4,
      cpuMhz: 20000,
      netMbps: 5000,
      hddTotalMb: 32768,
      hddOsBaseMb: 14000,
      ramTotalMb: 8192,
      ramOsBaseMb: 3800,
      hasherVer: 7.0,
      firewallVer: 7.0,
      antivirusVer: 7.0,
      cpuSpec: '20.000 MHz · 5.000 Mbps · HDD 32GB · AV v7.0',
      bankBalance: 4200,
      files: [
        { name: 'offshore_accounts.vault', size: '240 MB', sizeMb: 240, content: 'Reservas globais depositadas no Swiss Offshore Vault (77.3.12.15).' }
      ]
    },
    '161.89.2.1': {
      ip: '161.89.2.1',
      domain: 'nsa.gov.internal',
      hostname: 'NSA — National Security Agency',
      kind: 'federal',
      badge: 'Agência Sigilosa',
      tier: 5,
      securityLevel: 5,
      cpuMhz: 32000,
      netMbps: 10000,
      hddTotalMb: 65536,
      hddOsBaseMb: 30000,
      ramTotalMb: 32768,
      ramOsBaseMb: 14000,
      hasherVer: 9.5,
      firewallVer: 9.5,
      antivirusVer: 9.5,
      cpuSpec: '32.000 MHz · 10.000 Mbps · FW v9.5 · AV v9.5',
      bankBalance: 0,
      files: [
        { name: 'prism_backbone_tap.dat', size: '640 MB', sizeMb: 640, content: 'Monitoramento global de cabos submarinos e interceptação óptica.' }
      ]
    }
  };

  // Operadores VPC presentes na sub-rede pública (além dos jogadores reais carregados do Supabase — IPs rotacionados!)
  const SEEDED_PLAYER_VPCS = {
    '186.214.73.49': {
      ip: '186.214.73.49',
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
    '179.108.52.91': {
      ip: '179.108.52.91',
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
    '201.49.118.34': {
      ip: '201.49.118.34',
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
    { ip: '71.4.20.1', label: 'First Whois (Diretório)' },
    { ip: '33.8.2.71', label: 'Download Center' },
    { ip: '109.64.200.10', label: 'First Puzzle' },
    { ip: '71.4.5.1', label: 'HC Telecom ISP' },
    { ip: '77.3.9.21', label: 'Banco Colchão' },
    { ip: '144.202.44.8', label: 'Bitcoin Market' },
    { ip: '203.17.88.40', label: 'Farofa Systems' },
    { ip: '187.22.5.60', label: 'Boteco h4x0r' },
    { ip: '109.64.211.37', label: 'Safenet Authority' },
    { ip: '185.220.101.77', label: 'hc://vazamentos' },
    { ip: '161.89.1.1', label: 'FBI Mainframe' }
  ];

  class InternetBrowserEngine {
    constructor() {
      this.currentIp = '71.4.20.1';
      this.activeTab = 'pagina'; // 'pagina' | 'entrar' | 'invadir'
      this.sshSubTab = 'logs';   // 'logs' | 'files' | 'hw'
      this.history = ['71.4.20.1'];
      this.historyIdx = 0;
      const nowTs = Date.now();
      this.recentIps = ['71.4.20.1'];
      this.recentVisits = [{ ip: '71.4.20.1', ts: nowTs }];
      this.favorites = new Set(['71.4.20.1', '33.8.2.71', '109.64.200.10', '77.3.9.21', '161.89.1.1']);
      this.loadBrowserPrefs();
      this.portScannedIps = new Set();
      this.drainedNpcIps = new Set();
      this.deletedHostFiles = new Map();
      this.deletedHostFileMb = new Map();
      this.defacedPages = new Map();
      this.activeSshIp = null;
      this.activeSshMethod = 'password';
      this.activeSshRole = 'root';
      this.isCracking = false;
      this.crackPct = 0;
      this.cloudPlayersByIp = {};
      this.whoisQueryResult = null;
      this.whoisCategory = 'overview'; // 'overview' | 'services' | 'targets' | 'puzzles' | 'players'
      this.whoisSearch = '';
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
      if (tab === 'cctv') {
        this.openCompanyCctv(ipOrDomain);
        return;
      }
      this.navigate(ipOrDomain, tab);
    }

    openCompanyCctv(ipOrDomain, focusCamCode = null) {
      if (typeof window.navTo === 'function') window.navTo('winBrowser');
      const targetIp = this.normalizeQueryToIp(ipOrDomain);
      const saved = window.hackedDb ? window.hackedDb.getEntry(targetIp) : null;

      if (saved || this.activeSshIp === targetIp) {
        this.navigate(targetIp, 'entrar');
        if (this.activeSshIp !== targetIp && saved) {
          this.connectSsh(targetIp, saved.password, saved.accessMethod === 'exploit');
        }
        this.sshSubTab = 'cctv';
        if (window.cctvEngine) {
          if (focusCamCode) {
            const host = this.resolveHost(targetIp);
            const prof = window.cctvEngine.getCompanyNvrProfile(targetIp, host ? host.hostname : targetIp);
            const idx = prof.cameras.findIndex((c) => c.code === focusCamCode);
            if (idx >= 0) {
              window.cctvEngine.selectedCamIdx = idx;
              window.cctvEngine.viewMode = 'single';
            } else {
              window.cctvEngine.viewMode = 'mosaic';
            }
          } else {
            window.cctvEngine.viewMode = 'mosaic';
          }
        }
        this.render();
      } else {
        this.navigate(targetIp, 'invadir');
        if (typeof window.showToast === 'function') {
          window.showToast(`Quebre a senha de ${targetIp} para destravar as Câmeras de Segurança Ao Vivo!`);
        }
      }
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
      if (q === 'whois' || q === 'home' || q === 'about:home' || q === '1.2.3.4') return '71.4.20.1';
      if (q === 'whois2') return '71.4.20.2';
      if (q === 'whois3') return '71.4.20.3';
      if (q === 'whois4') return '71.4.20.4';
      if (q === 'btc' || q === 'bitcoin') return '144.202.44.8';
      if (q === 'download' || q === 'dc') return '33.8.2.71';
      if (q === 'bank' || q === 'banco') return '77.3.9.21';
      if (q === 'hebc' || q === 'hebc.hc') return '77.3.10.44';
      if (q === 'amex' || q === 'amex.hc') return '77.3.11.88';
      if (q === 'swiss' || q === 'swiss.hc') return '77.3.12.15';
      if (q === 'quantum' || q === 'quantum-bank.hc') return '77.3.13.99';
      if (q === 'puzzle' || q === 'firstpuzzle') return '109.64.200.10';
      if (q === 'market' || q === 'blackmarket' || q === 'blackmarket.onion') return '185.220.101.9';
      if (q === 'vazamentos' || q === 'leaks' || q === 'zerobin') return '185.220.101.77';
      if (q === 'safenet') return '109.64.211.37';
      if (q === 'fbi' || q === 'mainframe' || q === 'fbi.gov.internal' || q === 'fbi.gov') return '161.89.1.1';
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
        const dynMods = (window.topTenMechanics && typeof window.topTenMechanics.getHostDynamicDefenseModifiers === 'function')
          ? window.topTenMechanics.getHostDynamicDefenseModifiers(npc.ip)
          : { extraFw: 0, extraHasher: 0, cashMult: 1.0 };
        return {
          ...npc,
          online: true,
          firewallVer: +(Number(npc.firewallVer || 1.0) + dynMods.extraFw).toFixed(1),
          hasherVer: +(Number(npc.hasherVer || 1.0) + dynMods.extraHasher).toFixed(1),
          rootPassword: deterministicPassword(npc.ip),
          bankBalance: this.drainedNpcIps.has(npc.ip) ? 0 : Math.round((npc.bankBalance || 0) * dynMods.cashMult),
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
          const shiftOnline = window.botScheduler ? window.botScheduler.isBotOnline(ip) : true;
          const ddosHealth = window.ddosOverloadEngine ? window.ddosOverloadEngine.getTargetHealthPct(ip) : 100;
          const ddosFwPen = window.ddosOverloadEngine ? window.ddosOverloadEngine.getTargetFirewallPenalty(ip) : 0;
          const hMult = Math.max(0.25, ddosHealth / 100);
          const isLawBot = bot.role === 'policial' || bot.role === 'delegado';
          const intelMult = isLawBot ? 1.0 : 0.90; // -10% de inteligência nos bots hackers
          const cpuMhz = Math.max(200, Math.round((bot.hardware.cpuCores || 1) * (bot.hardware.cpuClock || 1.2) * 550 * hMult * intelMult));
          const netMbps = Math.max(1, +( (bot.tier === 3 ? 250 : (bot.tier === 2 ? 35 : 3)) * hMult ).toFixed(1));
          const hddTotalMb = bot.tier === 3 ? 2048 : (bot.tier === 2 ? 520 : 180);
          const ramTotalMb = bot.tier === 3 ? 1024 : (bot.tier === 2 ? 384 : 128);
          const rawDefVer = isLawBot ? (bot.defVer || 4.0) : (bot.tier === 3 ? 2.5 : (bot.tier === 2 ? 1.5 : 1.0));
          const avVer = isLawBot ? +rawDefVer.toFixed(1) : (Math.floor(rawDefVer * 9) / 10);
          const baseDefVer = avVer;
          const dynBotMods = (window.topTenMechanics && typeof window.topTenMechanics.getHostDynamicDefenseModifiers === 'function')
            ? window.topTenMechanics.getHostDynamicDefenseModifiers(bot.ip)
            : { extraFw: 0, extraHasher: 0, cashMult: 1.0 };
          const effFwVer = Math.max(0.9, +(baseDefVer - ddosFwPen + dynBotMods.extraFw).toFixed(1));
          const effHasherVer = +(baseDefVer + dynBotMods.extraHasher).toFixed(1);
          const rawBal = bot.bankAccount ? bot.bankAccount.balance : 0;
          const scaledBal = rawBal > 0 ? Math.max(35, Math.round(rawBal * 0.22 * dynBotMods.cashMult)) : 0;

          return {
            ip: bot.ip,
            hostname: `PC de ${bot.handle}${dynBotMods.isNemesis ? ' [⚔️ NÊMESIS]' : ''}`,
            kind: 'bot',
            isOperatorPlayer: true,
            badge: shiftOnline ? '🟢 Jogador Online' : '○ Jogador Offline (PC Ligado)',
            online: true,
            tier: bot.tier,
            securityLevel: bot.tier,
            cpuMhz,
            netMbps,
            hardwareHealthPct: ddosHealth,
            hddTotalMb,
            hddOsBaseMb: Math.round(hddTotalMb * 0.58),
            ramTotalMb,
            ramOsBaseMb: Math.round(ramTotalMb * 0.55),
            hasherVer: effHasherVer,
            firewallVer: effFwVer,
            antivirusVer: avVer,
            rootPassword: deterministicPassword(bot.ip + '::' + bot.handle),
            cpuSpec: `${cpuMhz} MHz · ${netMbps} Mbps · Saúde ${ddosHealth}% · AV v${avVer.toFixed(1)}`,
            bankBalance: scaledBal,
            botRef: bot,
            files: (bot.vfs || [])
              .filter((f) => !deletedSet.has(f.name))
              .map((f) => ({ name: f.name, size: '18 MB', sizeMb: 18, content: f.desc || 'Arquivo de sistema do operador bot.' }))
          };
        }
      }

      // 4. É um jogador humano real descoberto na malha Online / Supabase Realtime / Diretório Offline?
      const liveHuman = window.onlineEngine ? window.onlineEngine.getHumanPlayerByIp(ip) : null;
      if (liveHuman) {
        const rep = Number(liveHuman.reputation || 100);
        const ddosHealth = window.ddosOverloadEngine
          ? window.ddosOverloadEngine.getTargetHealthPct(ip)
          : Number(liveHuman.hardwareHealthPct ?? 100);
        const hMult = Math.max(0.25, ddosHealth / 100);
        const hs = Number(liveHuman.hasherVer || 1.0);
        const fw = Number(liveHuman.firewallVer || 1.0);
        const av = Number(liveHuman.antivirusVer || 1.0);
        const cpuMhz = Math.max(200, Math.round(Number(liveHuman.cpuMhz || 1200) * hMult));
        const netMbps = Math.max(1, +(Number(liveHuman.netMbps || 10) * hMult).toFixed(1));
        const hddMb = Number(liveHuman.hddTotalMb || (rep >= 1000 ? 2048 : 640));
        const ramMb = Number(liveHuman.ramTotalMb || (rep >= 1000 ? 1024 : 384));
        const pwdEpoch = Number(liveHuman.pwdEpoch || 1);
        const shieldUntilMs = Number(liveHuman.newbieShieldUntilMs || 0);
        const isShielded24h = (shieldUntilMs > Date.now()) || (!!liveHuman.newbieProtected && shieldUntilMs === 0);
        const shieldRemStr = (isShielded24h && shieldUntilMs > Date.now() && window.progressiveUnlockEngine && typeof window.progressiveUnlockEngine.formatShieldRemaining === 'function')
          ? window.progressiveUnlockEngine.formatShieldRemaining(shieldUntilMs - Date.now())
          : (liveHuman.newbieShieldLabel || '24h');

        return {
          ip,
          hostname: `PC de ${liveHuman.hackerTag}${liveHuman.clanTag ? ' [' + liveHuman.clanTag + ']' : ''}`,
          kind: 'player',
          isRealHuman: true,
          isOperatorPlayer: true,
          humanUserId: liveHuman.userId,
          humanTag: liveHuman.hackerTag,
          customWebPage: liveHuman.customWebPage || null,
          badge: isShielded24h ? `🛡️ Escudo Novato (${shieldRemStr})` : (liveHuman.onlineNow ? '🟢 Jogador Online' : '○ Jogador Offline (PC Ligado)'),
          online: true,
          reputation: rep,
          newbieProtected: isShielded24h,
          newbieShieldRemaining: isShielded24h ? shieldRemStr : '',
          tier: rep >= 1000 ? 2 : 1,
          securityLevel: rep >= 1000 ? 2 : 1,
          cpuMhz,
          netMbps,
          hardwareHealthPct: ddosHealth,
          hddTotalMb: hddMb,
          hddOsBaseMb: Math.round(hddMb * 0.52),
          ramTotalMb: ramMb,
          ramOsBaseMb: Math.round(ramMb * 0.50),
          hasherVer: hs,
          firewallVer: fw,
          antivirusVer: av,
          rootPassword: deterministicPassword(ip + '::' + liveHuman.userId + (pwdEpoch > 1 ? '::ep' + pwdEpoch : '')),
          cpuSpec: `${cpuMhz.toLocaleString('pt-BR')} MHz · ${netMbps} Mbps · Saúde ${ddosHealth}% · FW v${fw.toFixed(1)} · HASH v${hs.toFixed(1)}`,
          bankBalance: this.drainedNpcIps.has(ip) ? 0 : Math.min(450, Math.max(85, Math.round(rep * 0.22))),
          files: [
            { name: 'operador_profile.dat', size: '14 MB', sizeMb: 14, content: `Operador real ${liveHuman.hackerTag} (${rep} REP · Classe ${(liveHuman.specialty || 'exploiter').toUpperCase()})` }
          ].filter((f) => !deletedSet.has(f.name))
        };
      }

      // 4b. Fallback: cloudPlayersByIp legado
      const cloudPlayer = this.cloudPlayersByIp[ip];
      if (cloudPlayer) {
        const rep = cloudPlayer.reputation || 100;
        const isMid = rep >= 500;
        const createdMs = cloudPlayer.created_at ? Date.parse(cloudPlayer.created_at) : 0;
        const cloudShielded = (createdMs > 0 && (Date.now() - createdMs) < 86400000 && rep < 1000) || rep < 100;
        return {
          ip,
          hostname: `VPC de ${cloudPlayer.hacker_tag}`,
          kind: 'player',
          badge: cloudShielded ? '🛡️ Escudo Novato (24h)' : 'Jogador Online',
          online: true,
          reputation: rep,
          newbieProtected: cloudShielded,
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
          hostname: `PC de ${vp.hacker_tag}`,
          kind: 'player',
          isOperatorPlayer: true,
          badge: vp.reputation < 100 ? '🟢 Jogador Online (Iniciante)' : '🟢 Jogador Online',
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
      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '';
      const strLine = String(line || '');
      const hadMyIpBefore = myIp ? arr.some((l) => String(l).includes(myIp)) : false;
      arr.unshift(`[${new Date().toLocaleTimeString()}] ${strLine}`);
      if (arr.length > 50) arr.length = 50;
      if (myIp && !hadMyIpBefore && strLine.includes(myIp) && window.livingBotsEngine && typeof window.livingBotsEngine.markFreshTrace === 'function') {
        window.livingBotsEngine.markFreshTrace(ip, myIp);
      }
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
    }

    loadBrowserPrefs() {
      try {
        const raw = localStorage.getItem('HC_INET_BROWSER_PREFS');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.favorites) && parsed.favorites.length > 0) {
          this.favorites = new Set(parsed.favorites);
        }
        if (Array.isArray(parsed.recentVisits) && parsed.recentVisits.length > 0) {
          this.recentVisits = parsed.recentVisits;
          this.recentIps = parsed.recentVisits.map((v) => v.ip);
        }
      } catch (e) {}
    }

    saveBrowserPrefs() {
      try {
        localStorage.setItem('HC_INET_BROWSER_PREFS', JSON.stringify({
          favorites: Array.from(this.favorites),
          recentVisits: (this.recentVisits || []).slice(0, 8)
        }));
      } catch (e) {}
    }

    formatVisitRelativeTime(ts) {
      const diffSec = Math.max(0, Math.round((Date.now() - Number(ts || Date.now())) / 1000));
      if (diffSec < 5) return 'agora';
      if (diffSec < 60) return `${diffSec}s`;
      const mins = Math.floor(diffSec / 60);
      if (mins < 60) return `${mins} min`;
      return `${Math.floor(mins / 60)}h`;
    }

    clearRecentHistory() {
      this.recentVisits = [{ ip: this.currentIp, ts: Date.now() }];
      this.recentIps = [this.currentIp];
      this.saveBrowserPrefs();
      this.render();
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
        this.recentIps = [targetIp, ...this.recentIps.filter((x) => x !== targetIp)].slice(0, 8);
        this.recentVisits = [
          { ip: targetIp, ts: Date.now() },
          ...(this.recentVisits || []).filter((v) => v.ip !== targetIp)
        ].slice(0, 8);
        this.saveBrowserPrefs();
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

    goHome() {
      this.navigate('71.4.20.1', 'pagina');
    }

    switchTab(tab) {
      this.activeTab = tab;
      this.render();
    }

    toggleFavoriteCurrent() {
      this.toggleFavoriteIp(this.currentIp);
    }

    toggleFavoriteIp(ip, ev) {
      if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();
      if (!ip) return;
      if (this.favorites.has(ip)) {
        this.favorites.delete(ip);
      } else {
        this.favorites.add(ip);
      }
      this.saveBrowserPrefs();
      if (window.hackedDb) window.hackedDb.toggleFavorite(ip);
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
      this.render();
    }

    setWhoisCategory(cat) {
      this.whoisCategory = cat || 'overview';
      this.render();
    }

    setWhoisSearch(val) {
      this.whoisSearch = String(val || '');
      this.render();
      const inp = document.getElementById('whoisQueryInput');
      if (inp) {
        inp.focus();
        const len = inp.value.length;
        try { inp.setSelectionRange(len, len); } catch (e) {}
      }
    }

    getHostIconName(host) {
      if (!host) return 'server';
      switch (host.kind) {
        case 'whois': return 'search';
        case 'isp': return 'wifi';
        case 'download': return 'download';
        case 'banco': return 'landmark';
        case 'btc_market': return 'bitcoin';
        case 'darknet': return 'package';
        case 'puzzle': return 'lock';
        case 'federal':
        case 'fbi_mainframe': return 'shield-alert';
        case 'empresa': return 'building-2';
        case 'underground': return 'zap';
        case 'clan': return 'users';
        case 'player':
        case 'bot': return 'user';
        case 'self': return 'cpu';
        default: return 'server';
      }
    }

    runPortScan() {
      const host = this.resolveHost(this.currentIp);
      if (host.notFound || host.kind === 'self') return { success: false };

      // Regra Oficial HE (Internet.class.php linha 333): exige PortScan.scan instalado na RAM!
      if (window.softwareEngine && !window.softwareEngine.isPortScanActive()) {
        const msg = 'Seu PortScan.scan está DESATIVADO na sua RAM! Instale-o na aba Software & Vírus antes de escanear portas TCP.';
        alert(msg);
        return { success: false, code: 'NO_PORTSCAN_SOFT', message: msg };
      }

      this.portScannedIps.add(host.ip);
      const reqFwl = host.firewallVer || 1.0;
      const ftpVer = this.getPlayerFtpExploitVer();
      const sshVer = this.getPlayerSshExploitVer();
      const ftpVuln = ftpVer > 0 && ftpVer >= reqFwl;
      const sshVuln = sshVer > 0 && sshVer >= reqFwl;

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog(
          'PORTSCAN',
          `PortScan.scan concluído em ${host.ip} (Firewall v${reqFwl.toFixed(1)}): 21/ftp [${ftpVuln ? 'VULNERÁVEL' : 'BLINDADA'}] · 22/ssh [${sshVuln ? 'VULNERÁVEL' : 'BLINDADA'}]`,
          'info'
        );
      }
      if (window.hackerAudio) window.hackerAudio.playKeyClick();
      if (typeof window.showToast === 'function') {
        window.showToast(
          `PortScan em ${host.ip} (Firewall v${reqFwl.toFixed(1)}): 21/ftp ${ftpVuln ? 'VULNERÁVEL' : 'PROTEGIDA'} · 22/ssh ${sshVuln ? 'VULNERÁVEL' : 'PROTEGIDA'}`
        );
      }
      this.render();
      return { success: true, ftpVuln, sshVuln, firewallVer: reqFwl };
    }

    // REGRA FUNDAMENTAL: A CPU (MHz) e Certificações NUNCA inflam a versão do software!
    // CPU acelera SOMENTE o TEMPO dos processos; comparações de invasão usam a versão ESTRITA do software ativo na RAM!
    getCpuSpeedFactor() {
      const cpuMult = window.terminalTools ? window.terminalTools.getCpuMultiplier() : 1.0;
      const certSpeed = (window.universityEngine && window.universityEngine.hasCert(2)) ? 1.2 : 1.0;
      const overclockRank = (window.skillTreeEngine && typeof window.skillTreeEngine.getRank === 'function')
        ? window.skillTreeEngine.getRank('cpu_overclock')
        : 0;
      const thermalMult = (window.nineSystemsEngine && typeof window.nineSystemsEngine.getLiveThermalTelemetry === 'function')
        ? Number(window.nineSystemsEngine.getLiveThermalTelemetry().cpuSpeedMult || 1.0)
        : 1.0;
      const brownoutMult = (window.progressionLocksEngine && window.progressionLocksEngine.state && window.progressionLocksEngine.state.brownoutActive)
        ? 0.50
        : 1.0;
      const delinqMult = (window.progressionLocksEngine && typeof window.progressionLocksEngine.getNoonDelinquencyEffects === 'function')
        ? Number(window.progressionLocksEngine.getNoonDelinquencyEffects().cpuMult || 1.0)
        : 1.0;
      const raidMult = (window.topTenMechanics && typeof window.topTenMechanics.getRaidSpeedMultiplier === 'function')
        ? Number(window.topTenMechanics.getRaidSpeedMultiplier() || 1.0)
        : 1.0;
      return +(cpuMult * certSpeed * (1 + overclockRank * 0.15) * thermalMult * brownoutMult * delinqMult * raidMult).toFixed(2);
    }

    getPlayerCrackerVer() {
      return window.softwareEngine ? window.softwareEngine.getSoftwareVersion('cracker') : 1.0;
    }

    getPlayerFtpExploitVer() {
      return window.softwareEngine ? window.softwareEngine.getSoftwareVersion('exploit_ftp') : 1.0;
    }

    getPlayerSshExploitVer() {
      return window.softwareEngine ? window.softwareEngine.getSoftwareVersion('exploit_ssh') : 1.0;
    }

    // Mantido p/ exibição de velocidade de processamento (nunca usado p/ furar Firewall/Hasher!)
    getPlayerAttackPower() {
      return this.getPlayerCrackerVer();
    }

    getPlayerExploitPower() {
      return Math.max(this.getPlayerSshExploitVer(), this.getPlayerFtpExploitVer());
    }

    // Verifica continuamente se o atacante mantém softwares ativos na RAM suficientes p/ furar Firewall & Hasher atuais da vítima!
    validateRemoteSessionDefenses(host, method) {
      if (!host || host.notFound) return { ok: false, reason: 'Host inacessível.' };
      // Download Center público permite download livre; demais servidores exigem software compatível com a defesa!
      const reqFwl = host.firewallVer || 1.0;
      const reqHasher = host.hasherVer || 1.0;

      if (method === 'exploit') {
        const ftpVer = this.getPlayerFtpExploitVer();
        const sshVer = this.getPlayerSshExploitVer();
        if (ftpVer <= 0 && sshVer <= 0) {
          return {
            ok: false,
            code: 'NO_EXPLOIT_RUNNING',
            reason: 'Conexão Exploit encerrada: seus exploits (FTP_Exploit.exp / SSH_Exploit.exp) estão desativados na sua RAM!'
          };
        }
        const canFtp = ftpVer >= reqFwl;
        const canSsh = sshVer >= reqFwl;
        if (!canFtp && !canSsh) {
          return {
            ok: false,
            code: 'BLOCKED_BY_FIREWALL',
            reason: `BLOQUEADO PELO FIREWALL! O Firewall.fwl (v${reqFwl.toFixed(1)}) de ${host.hostname} é mais forte que seus exploits ativos (FTP v${ftpVer.toFixed(1)} / SSH v${sshVer.toFixed(1)}).`
          };
        }
        const role = (canFtp && canSsh) ? 'root' : (canFtp ? 'ftp' : 'ssh');
        return { ok: true, role };
      }

      // Método 'password' (Força-Bruta / Login SSH Root): exige Cracker.crc no disco (HD/SSD/NVMe) >= Firewall.fwl E >= Hasher.hash!
      const crcVer = this.getPlayerCrackerVer();
      if (crcVer <= 0) {
        return {
          ok: false,
          code: 'NO_CRACKER_OWNED',
          reason: 'Acesso SSH negado: você não possui nenhum Quebrador de Senha (Cracker.crc) visível nas unidades HD/SSD/NVMe do seu computador!'
        };
      }
      if (crcVer < reqFwl) {
        return {
          ok: false,
          code: 'BLOCKED_BY_FIREWALL',
          reason: `BLOQUEADO PELO FIREWALL! O Firewall.fwl (v${reqFwl.toFixed(1)}) de ${host.hostname} bloqueou seu hash de descriptografia (seu Cracker.crc é v${crcVer.toFixed(1)}). Evolua para >= v${reqFwl.toFixed(1)}!`
        };
      }
      if (crcVer < reqHasher) {
        return {
          ok: false,
          code: 'BLOCKED_BY_HASHER',
          reason: `BLOQUEADO PELO HASHER! O Hasher.hash (v${reqHasher.toFixed(1)}) de ${host.hostname} supera seu Cracker.crc (v${crcVer.toFixed(1)}). Evolua para >= v${reqHasher.toFixed(1)}!`
        };
      }
      return { ok: true, role: 'root' };
    }

    // Permissões reais conforme softwares.txt & Internet.class.php:
    // root -> tudo | ftp -> logs + download + upload | ssh -> logs + install/delete/seek/drain/analyze
    hasRemotePermission(perm) {
      if (!this.activeSshIp) return false;
      const role = this.activeSshRole || 'root';
      if (role === 'root' || perm === 'logs') return true;
      if (role === 'ftp') {
        return perm === 'download' || perm === 'upload';
      }
      if (role === 'ssh') {
        return ['install', 'delete', 'seek', 'drain', 'analyze', 'deface'].includes(perm);
      }
      return false;
    }

    ensureMiniPcRoot() {
      let el = document.getElementById('miniPcCrackerBackdrop');
      if (!el) {
        el = document.createElement('div');
        el.id = 'miniPcCrackerBackdrop';
        el.className = 'minipc-backdrop';
        el.addEventListener('click', (ev) => {
          if (ev.target === el) this.closeCrackerMiniPc();
        });
        document.body.appendChild(el);
      }
      return el;
    }

    closeCrackerMiniPc() {
      this.miniPcOpen = false;
      const el = document.getElementById('miniPcCrackerBackdrop');
      if (el) el.classList.remove('open');
    }

    // Abre o Mini-PC mostrando todos os quebradores/hashes disponíveis nas unidades HD, SSD e NVMe do computador do jogador!
    openCrackerMiniPc(driveFilter = null) {
      const host = this.resolveHost(this.currentIp);
      if (!host || host.notFound || host.kind === 'self') return { opened: false };
      if (driveFilter) this.miniPcDriveFilter = driveFilter;
      if (!this.miniPcDriveFilter) this.miniPcDriveFilter = 'all';

      const reqFwl = host.firewallVer || 1.0;
      const reqHasher = host.hasherVer || 1.0;
      const reqMin = Math.max(reqFwl, reqHasher);
      const cpuFactor = this.getCpuSpeedFactor();

      const allHashes = window.softwareEngine
        ? window.softwareEngine.getCrackerHashesOnMyPc(false)
        : [{ id: 'main_cracker', filename: 'Cracker.crc', title: 'Quebrador de Senhas', version: 1.0, sizeMb: 20, drive: 'hd', driveName: 'HD', driveSpeedMult: 1.0 }];
      const bays = window.softwareEngine
        ? window.softwareEngine.getDriveBaysSummary()
        : {
            hd: { label: 'HD', speedLabel: '1.00x', usedMb: 58, capMb: 217 },
            ssd: { label: 'SSD', speedLabel: '1.12x', usedMb: 26, capMb: 91 },
            nvme: { label: 'NVMe', speedLabel: '1.25x', usedMb: 12, capMb: 42 }
          };

      const filteredHashes = this.miniPcDriveFilter === 'all'
        ? allHashes
        : allHashes.filter((h) => h.drive === this.miniPcDriveFilter);

      let markedBest = false;
      const listHtml = filteredHashes.length === 0
        ? `<div class="hc-empty-box" style="padding:24px 14px;">
             <strong>Nenhum hash/cracker nesta unidade (${this.miniPcDriveFilter.toUpperCase()})</strong>
             <p>Alterne para "Todas" ou mova seu Cracker.crc para cá na aba Programas &amp; Proteção.</p>
           </div>`
        : filteredHashes.map((h) => {
            const ok = h.version >= reqFwl && h.version >= reqHasher;
            const totalSpeed = +(cpuFactor * (h.driveSpeedMult || 1.0)).toFixed(2);
            const verAdv = 1 + Math.max(0, h.version - reqMin) * 0.45;
            const estSec = Math.max(1.2, Math.min(9.5, +((2.4 * reqMin) / Math.max(0.6, totalSpeed * verAdv)).toFixed(1)));
            const isBestBtn = ok && !markedBest;
            if (isBestBtn) markedBest = true;

            return `
              <div class="minipc-hash-item ${ok ? 'compatible' : ''}">
                <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">
                  <div class="soft-app-icon kind-attack">${HC.icon('key-round')}</div>
                  <div style="min-width:0;">
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                      <strong style="font-size:13.5px;">${esc(h.title)}</strong>
                      <span class="mono" style="font-size:11.5px;color:var(--hc-text-3);">${esc(h.filename)}</span>
                      <span class="hc-badge ${ok ? 'success' : ''}">v${h.version.toFixed(1)}</span>
                      <span class="soft-drive-tag drv-${h.drive}">${h.driveName} · ${(h.driveSpeedMult || 1.0).toFixed(2)}x</span>
                    </div>
                    <div style="font-size:11.5px;color:var(--hc-text-3);margin-top:2px;">
                      ${h.sizeMb} MB · ${ok ? `<span style="color:var(--hc-accent-text);">Alcança defesa do alvo · Tempo estimado ~${estSec}s</span>` : `<span style="color:var(--hc-danger-text);">Alvo exige no mínimo v${reqMin.toFixed(1)}</span>`}
                    </div>
                  </div>
                </div>
                <button type="button" ${isBestBtn ? 'id="btnMiniPcUseBest"' : ''} class="hc-btn ${ok ? 'primary' : ''} sm" ${!ok ? 'disabled' : ''}
                  onclick="window.internetEngine.confirmBruteforceWithHash('${esc(h.id)}')">
                  ${ok ? 'Usar este' : 'Fraco'}
                </button>
              </div>
            `;
          }).join('');

      const modal = this.ensureMiniPcRoot();
      modal.innerHTML = `
        <div class="minipc-window" id="miniPcCrackerWindow" role="dialog" aria-modal="true" aria-label="Mini-PC Escolher Quebrador de Senha">
          <div class="minipc-titlebar">
            <div class="minipc-title-left">
              <div class="minipc-title-icon">${HC.icon('hard-drive')}</div>
              <div>
                <strong style="font-size:14.5px;">Mini-PC · Escolher Hash de Quebrar Senha</strong>
                <div style="font-size:11.5px;color:var(--hc-text-3);">
                  Alvo <span class="mono" style="color:var(--hc-accent-text);">${esc(host.ip)}</span> (${esc(host.hostname)}) · Exige &gt;= <span class="mono">v${reqMin.toFixed(1)}</span> · Roda em 2º plano
                </div>
              </div>
            </div>
            <button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.closeCrackerMiniPc()">Fechar ✕</button>
          </div>

          <div class="minipc-body">
            <div class="minipc-drives-bar" role="tablist" aria-label="Unidades do seu computador">
              <button type="button" class="minipc-drive-tab ${this.miniPcDriveFilter === 'all' ? 'active' : ''}" onclick="window.internetEngine.openCrackerMiniPc('all')">
                <span class="minipc-drive-name">Todas (${allHashes.length})</span>
                <span class="minipc-drive-sub">HD + SSD + NVMe</span>
              </button>
              <button type="button" class="minipc-drive-tab ${this.miniPcDriveFilter === 'hd' ? 'active' : ''}" onclick="window.internetEngine.openCrackerMiniPc('hd')">
                <span class="minipc-drive-name">HD · ${bays.hd.speedLabel}</span>
                <span class="minipc-drive-sub">${bays.hd.usedMb}/${bays.hd.capMb} MB</span>
              </button>
              <button type="button" class="minipc-drive-tab ${this.miniPcDriveFilter === 'ssd' ? 'active' : ''}" onclick="window.internetEngine.openCrackerMiniPc('ssd')">
                <span class="minipc-drive-name">SSD · ${bays.ssd.speedLabel}</span>
                <span class="minipc-drive-sub">${bays.ssd.usedMb}/${bays.ssd.capMb} MB</span>
              </button>
              <button type="button" class="minipc-drive-tab ${this.miniPcDriveFilter === 'nvme' ? 'active' : ''}" onclick="window.internetEngine.openCrackerMiniPc('nvme')">
                <span class="minipc-drive-name">NVMe · ${bays.nvme.speedLabel}</span>
                <span class="minipc-drive-sub">${bays.nvme.usedMb}/${bays.nvme.capMb} MB</span>
              </button>
            </div>

            <div class="minipc-hash-list">
              ${listHtml}
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-size:11.5px;color:var(--hc-text-3);padding-top:4px;border-top:1px solid var(--hc-border);">
              <span>Dica: mova seu Cracker para o SSD ou NVMe em <strong>Programas &amp; Proteção</strong> para quebrar senhas mais rápido.</span>
              <button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.closeCrackerMiniPc();window.navTo('winSoftware');">Abrir Meu PC</button>
            </div>
          </div>
        </div>
      `;
      this.miniPcOpen = true;
      modal.classList.add('open');
      return { opened: true, hashesCount: allHashes.length };
    }

    confirmBruteforceWithHash(hashId) {
      this.closeCrackerMiniPc();
      if (window.softwareEngine && window.softwareEngine.state && window.softwareEngine.state.inventory?.cracker) {
        const crc = window.softwareEngine.state.inventory.cracker;
        if (crc.owned) {
          crc.installed = true;
          crc.runningVerInt = crc.versionInt || 10;
          window.softwareEngine.save();
        }
      }
      return this.startBruteforce({ hashId });
    }

    startBruteforce(opts = {}) {
      if (this.isCracking) return { started: false };
      const host = this.resolveHost(this.currentIp);
      if (host.notFound) return { started: false };
      if (host.kind === 'self') {
        alert('Operação bloqueada: você não pode executar força-bruta contra o seu próprio IP público!');
        return { started: false, code: 'SELF_TARGET' };
      }
      if (host.newbieProtected) {
        const msg = `🛡️ Escudo de Novato (24h): ${host.hostname} está protegido contra ataques PvP${host.newbieShieldRemaining ? ' (restam ' + host.newbieShieldRemaining + ')' : ''}!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        else alert(msg);
        return { started: false, code: 'NEWBIE_PROTECTED', message: msg };
      }
      if (host.kind === 'player' && window.progressiveUnlockEngine && typeof window.progressiveUnlockEngine.isNewbiePvpShieldActive === 'function' && window.progressiveUnlockEngine.isNewbiePvpShieldActive() && !(opts && opts.confirmedBreakShield)) {
        window.progressiveUnlockEngine.openBreakShieldConfirmModal(host.hostname, () => {
          this.startBruteforce({ ...(opts || {}), confirmedBreakShield: true });
        });
        return { started: false, code: 'CONFIRM_BREAK_SHIELD' };
      }
      if (!host.online) {
        alert('Este host está OFFLINE no turno atual. Aguarde a próxima janela ou escolha um IP online.');
        return { started: false, code: 'HOST_OFFLINE' };
      }
      if (window.progressionLocksEngine && typeof window.progressionLocksEngine.validateTargetBounceGate === 'function') {
        const bg = window.progressionLocksEngine.validateTargetBounceGate(host);
        if (!bg.ok) {
          if (window.hackerAudio) window.hackerAudio.playErrorBuzz();
          return { started: false, code: bg.code, message: bg.message };
        }
      }

      // Quando o jogador clica em "Quebrar senha", abre o Mini-PC (HD / SSD / NVMe) p/ escolher qual hash usar!
      if (!opts || (!opts.hashId && !opts.directBest)) {
        return this.openCrackerMiniPc();
      }

      const hashes = window.softwareEngine
        ? window.softwareEngine.getCrackerHashesOnMyPc(false)
        : [{ id: 'main_cracker', filename: 'Cracker.crc', version: this.getPlayerCrackerVer(), driveName: 'HD', driveSpeedMult: 1.0 }];

      const chosen = opts.hashId
        ? (hashes.find((x) => x.id === opts.hashId) || hashes[0])
        : hashes[0];

      const crcVer = chosen ? chosen.version : 0;
      const driveMult = chosen ? (chosen.driveSpeedMult || 1.0) : 1.0;
      const driveName = chosen ? (chosen.driveName || 'HD') : 'HD';
      const icepickDebuff = (window.ecosystemHub && typeof window.ecosystemHub.getEffectiveFirewallReduction === 'function')
        ? window.ecosystemHub.getEffectiveFirewallReduction(host.ip)
        : 0;
      const reqFwl = Math.max(0.5, +((host.firewallVer || 1.0) - icepickDebuff).toFixed(1));
      const reqHasher = host.hasherVer || 1.0;

      if (crcVer <= 0) {
        const msg = 'Você não possui nenhum Cracker.crc visível no seu disco (HD/SSD/NVMe)! Baixe grátis no Download Center.';
        alert(msg);
        return { started: false, code: 'CRACKER_OFF', message: msg };
      }

      // 1) Portão Estrito do Firewall.fwl do Alvo contra Descriptografia de Rede / Força-Bruta!
      if (crcVer < reqFwl) {
        const msg = `FIREWALL DO ALVO MAIS FORTE! O Firewall.fwl (v${reqFwl.toFixed(1)}) de ${host.hostname} bloqueou seu hash! Seu ${chosen?.filename || 'Cracker.crc'} (v${crcVer.toFixed(1)}) precisa ser >= v${reqFwl.toFixed(1)} (ou use Matriz Hex ICEPICK / Zero-Day!).`;
        if (window.hackerAudio) window.hackerAudio.playErrorBuzz();
        alert(msg);
        return { started: false, code: 'BLOCKED_BY_FIREWALL', message: msg };
      }

      // 2) Portão Estrito do Hasher.hash do Alvo contra Quebra de Senha!
      if (crcVer < reqHasher) {
        const msg = `HASHER DO ALVO MAIS FORTE! O Hasher.hash (v${reqHasher.toFixed(1)}) de ${host.hostname} bloqueou sua força-bruta! Seu ${chosen?.filename || 'Cracker.crc'} (v${crcVer.toFixed(1)}) precisa ser >= v${reqHasher.toFixed(1)}.`;
        if (window.hackerAudio) window.hackerAudio.playErrorBuzz();
        alert(msg);
        return { started: false, code: 'BLOCKED_BY_HASHER', message: msg };
      }

      this.isCracking = true;
      this.crackPct = 0;
      this.activeCrackDriveName = driveName;
      this.activeCrackVer = crcVer;
      const wmBoost = (window.ecosystemHub && typeof window.ecosystemHub.getWorldMapActiveMultipliers === 'function')
        ? (1 + Number(window.ecosystemHub.getWorldMapActiveMultipliers().crackerSpeedPct || 0) / 100)
        : 1.0;
      const speedFactor = +(this.getCpuSpeedFactor() * driveMult * wmBoost).toFixed(2);
      const verAdvantage = 1 + Math.max(0, crcVer - Math.max(reqHasher, reqFwl)) * 0.45;
      const idealSec = Math.max(1.2, Math.min(9.5, +((2.4 * Math.max(reqHasher, reqFwl)) / Math.max(0.6, speedFactor * verAdvantage)).toFixed(1)));
      this.activeCrackPid = null;

      if (window.taskManager) {
        const crcFn = chosen?.filename || 'Cracker.crc';
        const enq = window.taskManager.enqueue({
          dedupeKey: `bf_ssh_${host.ip}`,
          title: `Quebrar senha root (${host.hostname})`,
          labelHtml: `Quebrar senha com <strong>${esc(crcFn)}</strong> (${crcVer.toFixed(1)}) em ${esc(host.ip)}`,
          subtitle: `${crcFn} v${crcVer.toFixed(1)} [${driveName}] vs FW v${reqFwl.toFixed(1)} / HASH v${reqHasher.toFixed(1)} · ${speedFactor}x`,
          targetIp: host.ip,
          queueKind: 'cpu',
          category: 'Ataque',
          idealSeconds: idealSec,
          onComplete: () => {
            this.isCracking = false;
            this.activeCrackPid = null;
            this.crackPct = 100;
            this.onAttackSucceeded(host, 'password', host.rootPassword, 'root');
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
          this.render();
          return { started: true, idealSec, pid: enq.process.pid };
        }
      }

      const stepInc = Math.max(8, Math.round((24 * speedFactor) / Math.max(1, reqHasher)));
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
          this.onAttackSucceeded(host, 'password', host.rootPassword, 'root');
        }
      }, 130);
      return { started: true, idealSec };
    }

    createRemoteNoteOnHost(ip) {
      if (!this.remoteCustomNotes) this.remoteCustomNotes = new Map();
      const title = window.prompt('Nome do arquivo .txt para criar no PC invadido:', 'aviso_hacker');
      if (!title) return;
      const body = window.prompt('Conteúdo da nota .txt:', 'Servidor auditado.');
      if (body === null) return;
      const cleanName = title.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'nota';
      const arr = this.remoteCustomNotes.get(ip) || [];
      arr.unshift({ name: `${cleanName}.txt`, content: body, size: '1 KB', sizeMb: 1, isCustomNote: true });
      this.remoteCustomNotes.set(ip, arr);
      const visibleIp = window.bounceEngine
        ? window.bounceEngine.routeConnectionAndGetVisibleIp(ip).visibleIp
        : (window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0');
      this.appendServerLog(ip, `${visibleIp} created file /root/${cleanName}.txt`);
      if (typeof window.showToast === 'function') window.showToast(`Arquivo ${cleanName}.txt criado em ${ip}!`);
      this.render();
    }

    createRemoteFolderOnHost(ip) {
      if (!this.remoteCustomFolders) this.remoteCustomFolders = new Map();
      const name = window.prompt('Nome da pasta para criar neste servidor:', 'temp_cache');
      if (!name) return;
      const clean = name.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'pasta';
      const arr = this.remoteCustomFolders.get(ip) || [];
      arr.push({ id: 'rf_' + Date.now(), name: clean });
      this.remoteCustomFolders.set(ip, arr);
      const visibleIp = window.bounceEngine
        ? window.bounceEngine.routeConnectionAndGetVisibleIp(ip).visibleIp
        : (window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0');
      this.appendServerLog(ip, `${visibleIp} created folder /root/${clean}/`);
      if (typeof window.showToast === 'function') window.showToast(`Pasta /${clean} criada em ${ip}!`);
      this.render();
    }

    deleteRemoteStagedVirus(ip, virusKey) {
      if (!window.softwareEngine || !window.softwareEngine.state || !window.softwareEngine.state.stagedRemoteViruses) return;
      window.softwareEngine.state.stagedRemoteViruses[ip] = (window.softwareEngine.state.stagedRemoteViruses[ip] || []).filter((x) => x.virusKey !== virusKey);
      window.softwareEngine.save();
      if (typeof window.showToast === 'function') window.showToast('Arquivo enviado removido do disco remoto.');
      this.render();
    }

    startExploitAttack(opts = {}) {
      const host = this.resolveHost(this.currentIp);
      if (host.notFound || host.kind === 'self') return { success: false };
      if (host.newbieProtected) {
        const msg = `🛡️ Escudo de Novato (24h): ${host.hostname} está protegido contra ataques PvP${host.newbieShieldRemaining ? ' (restam ' + host.newbieShieldRemaining + ')' : ''}!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        else alert(msg);
        return { success: false, code: 'NEWBIE_PROTECTED', message: msg };
      }
      if (host.kind === 'player' && window.progressiveUnlockEngine && typeof window.progressiveUnlockEngine.isNewbiePvpShieldActive === 'function' && window.progressiveUnlockEngine.isNewbiePvpShieldActive() && !(opts && opts.confirmedBreakShield)) {
        window.progressiveUnlockEngine.openBreakShieldConfirmModal(host.hostname, () => {
          this.startExploitAttack({ ...(opts || {}), confirmedBreakShield: true });
        });
        return { success: false, code: 'CONFIRM_BREAK_SHIELD' };
      }
      if (window.progressionLocksEngine && typeof window.progressionLocksEngine.validateTargetBounceGate === 'function') {
        const bg = window.progressionLocksEngine.validateTargetBounceGate(host);
        if (!bg.ok) {
          if (window.hackerAudio) window.hackerAudio.playErrorBuzz();
          return { success: false, code: bg.code, message: bg.message };
        }
      }
      if (window.topTenMechanics && typeof window.topTenMechanics.areExploitPortsLocked === 'function') {
        const pl = window.topTenMechanics.areExploitPortsLocked(host.ip);
        if (pl.locked) {
          const msg = `🔒 [PORTS 21/22 LOCKED] Um Segfault de Buffer Overflow trancou as portas FTP/SSH de ${host.ip} por mais ${pl.remMin} min! Use Força-Bruta com Cracker.`;
          if (window.hackerAudio) window.hackerAudio.playErrorBuzz();
          if (typeof window.showToast === 'function') window.showToast(msg);
          return { success: false, code: 'SEGFAULT_PORTS_LOCKED', message: msg };
        }
      }
      if (window.softwareEngine && !window.softwareEngine.isPortScanActive()) {
        const msg = 'Instale/Ative seu PortScan.scan na RAM (aba Software & Vírus) para usar ataques Exploit!';
        alert(msg);
        return { success: false, code: 'NO_PORTSCAN_SOFT', message: msg };
      }
      if (!this.portScannedIps.has(host.ip)) {
        const msg = 'Execute primeiro o Port Scan TCP abaixo para mapear as portas 21/FTP e 22/SSH!';
        if (typeof window.showToast === 'function') window.showToast(msg);
        else alert(msg);
        return { success: false, code: 'PORTSCAN_REQUIRED', message: msg };
      }

      const ftpVer = this.getPlayerFtpExploitVer();
      const sshVer = this.getPlayerSshExploitVer();
      if (ftpVer <= 0 && sshVer <= 0) {
        const msg = 'Nenhum exploit ativo na RAM! Ative FTP_Exploit.exp e/ou SSH_Exploit.exp na aba Software & Vírus.';
        alert(msg);
        return { success: false, code: 'NO_EXPLOIT_ACTIVE', message: msg };
      }

      // REGRA ESTRITA DO JOGO DE REFERÊNCIA: versão pura do Exploit >= Firewall.fwl do alvo!
      const reqFwl = host.firewallVer || (host.securityLevel === 1 ? 1.0 : (host.securityLevel === 2 ? 1.5 : 2.5));
      const canFtp = ftpVer >= reqFwl;
      const canSsh = sshVer >= reqFwl;

      if (!canFtp && !canSsh) {
        const msg = `FIREWALL DO ALVO BLOQUEOU O EXPLOIT! O Firewall.fwl (v${reqFwl.toFixed(1)}) de ${host.hostname} superou seus exploits ativos (FTP v${ftpVer.toFixed(1)} · SSH v${sshVer.toFixed(1)}). Evolua seus Exploits para >= v${reqFwl.toFixed(1)}!`;
        if (window.hackerAudio) window.hackerAudio.playErrorBuzz();
        alert(msg);
        return { success: false, code: 'BLOCKED_BY_FIREWALL', message: msg };
      }

      // FTP + SSH juntos -> root completo; só FTP -> ftp (download/upload); só SSH -> ssh (execução/delete)
      const grantedRole = (canFtp && canSsh) ? 'root' : (canFtp ? 'ftp' : 'ssh');
      this.onAttackSucceeded(host, 'exploit', 'EXPLOITED', grantedRole);
      return { success: true, grantedRole };
    }

    onAttackSucceeded(host, method, pwdOrToken, sshRole = 'root') {
      if (host && host.kind === 'player' && window.progressiveUnlockEngine && typeof window.progressiveUnlockEngine.isNewbiePvpShieldActive === 'function' && window.progressiveUnlockEngine.isNewbiePvpShieldActive()) {
        window.progressiveUnlockEngine.breakNewbieShield(`Invadiu ${host.hostname}`);
      }
      const route = window.bounceEngine
        ? window.bounceEngine.routeConnectionAndGetVisibleIp(host.ip)
        : { visibleIp: window.networkIdentity.getPublicIp(), bounced: false };
      const visibleIp = route.visibleIp;

      // Salvar no Hacked Database com usuário obtido (root, ftp ou ssh)
      if (window.hackedDb) {
        window.hackedDb.upsertHost({
          ip: host.ip,
          hostname: host.hostname,
          kind: host.kind,
          tier: host.tier,
          accessMethod: method,
          sshUser: sshRole,
          password: pwdOrToken,
          cpuSpec: host.cpuSpec
        });
      }

      if (window.dynamicContractsEngine) {
        window.dynamicContractsEngine.onGameAction('break_pass', host.ip);
      }
      if (window.operatorRetentionEngine && typeof window.operatorRetentionEngine.recordDailyGoalProgress === 'function') {
        window.operatorRetentionEngine.recordDailyGoalProgress('break_pass');
      }
      if (window.topTenMechanics && typeof window.topTenMechanics.registerHostIntrusionForNemesisAndDefcon === 'function') {
        window.topTenMechanics.registerHostIntrusionForNemesisAndDefcon(host, method);
      }

      if (host.kind === 'bot' && window.botAI) {
        window.botAI.registerIntrusion(host.ip, visibleIp);
      } else {
        this.appendServerLog(host.ip, `INTRUSION src=${visibleIp} dest=${host.ip} method=${method.toUpperCase()} user=${sshRole.toUpperCase()}`);
      }
      if (host.isRealHuman && window.onlineEngine) {
        this.lastPvpVisibleIpByTarget = this.lastPvpVisibleIpByTarget || {};
        this.lastPvpVisibleIpByTarget[host.ip] = visibleIp;
        window.onlineEngine.sendPvpPacket({
          kind: 'PVP_INTRUSION',
          visibleIp,
          targetUserId: host.humanUserId,
          targetTag: host.humanTag,
          targetIp: host.ip,
          d: {
            method,
            role: sshRole,
            crcVer: this.getPlayerCrackerVer(),
            expVer: Math.max(this.getPlayerSshExploitVer(), this.getPlayerFtpExploitVer())
          }
        });
      }

      if (window.currentProfile) {
        const grantRep = () => {
          window.currentProfile.reputation = (window.currentProfile.reputation || 0) + (15 * host.securityLevel);
        };
        if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
          window.integrityGuard.runAuthorized(grantRep);
        } else {
          grantRep();
        }
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('HACK-OK', `Invasão concluída em ${host.ip} (${host.hostname}) via ${method} [permissão: ${sshRole.toUpperCase()}]`, 'warning');
      }

      // Verificar se este alvo tinha a cabeça a prêmio no Quadro de Vingança por Nick!
      let bountyMsg = '';
      if (window.playerBountyEngine) {
        const bRes = window.playerBountyEngine.checkAndClaimBountyForHost(host, 'Invasão Root');
        if (bRes && bRes.claimed) {
          bountyMsg = ` 💀 RECOMPENSA CAPTURADA: +$ ${bRes.rewardCash.toLocaleString('pt-BR')} HC!`;
        }
      }

      if (window.hackerAudio) window.hackerAudio.playCashChime();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (typeof window.showToast === 'function') {
        window.showToast(`Invasão bem-sucedida em ${host.ip}! Permissão obtida: ${sshRole.toUpperCase()}.${bountyMsg}`);
      }

      this.currentIp = host.ip;
      this.activeSshIp = host.ip;
      this.activeSshMethod = method;
      this.activeSshRole = sshRole;
      this.activeTab = 'entrar';
      const activeMsn = (window.missionsEngine && window.missionsEngine.ensureLoaded().activeMission) || null;
      const autoOpenCctv = activeMsn && activeMsn.type === 'cctv_hack' && activeMsn.targetIp === host.ip && host.ip !== '198.51.100.42';
      this.sshSubTab = autoOpenCctv ? 'cctv' : 'logs';
      if (autoOpenCctv && window.cctvEngine) {
        window.cctvEngine.viewMode = 'mosaic';
      }
      if (window.tutorialEngine) {
        window.tutorialEngine.onHostHackedOrLoggedRoot(host.ip);
      }
      this.render();
    }

    connectSsh(ip, typedPwd, allowExploitBypass = false) {
      const host = this.resolveHost(ip);
      if (host.notFound || host.kind === 'self') return false;
      if (host.newbieProtected) {
        const msg = `🛡️ Escudo de Novato (24h): ${host.hostname} está protegido contra conexões hostis PvP!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        else alert(msg);
        return false;
      }

      const saved = window.hackedDb ? window.hackedDb.getEntry(ip) : null;
      const validByExploit = allowExploitBypass || (saved && saved.accessMethod === 'exploit' && !String(typedPwd || '').trim());
      const pwdClean = String(typedPwd || '').trim();

      if (!validByExploit && pwdClean !== host.rootPassword) {
        if (window.hackerAudio) window.hackerAudio.playErrorBuzz();
        alert('Acesso negado: senha root incorreta (ou o alvo rotacionou a senha)! Use a aba "Invadir" para quebrar novamente.');
        return false;
      }

      // REVALIDAÇÃO ESTRITA DE DEFESA (Internet.class.php linhas 657-865 & hacking.txt linhas 26-43):
      // Se o alvo evoluiu o Firewall.fwl ou Hasher.hash depois que você salvou a senha, você NÃO entra!
      const method = validByExploit ? 'exploit' : 'password';
      const defCheck = this.validateRemoteSessionDefenses(host, method);
      if (!defCheck.ok) {
        if (window.hackerAudio) window.hackerAudio.playErrorBuzz();
        alert(defCheck.reason);
        return false;
      }

      const route = window.bounceEngine
        ? window.bounceEngine.routeConnectionAndGetVisibleIp(host.ip)
        : { visibleIp: window.networkIdentity.getPublicIp(), bounced: false };
      this.currentIp = host.ip;
      this.activeSshIp = host.ip;
      this.activeSshMethod = method;
      this.activeSshRole = defCheck.role || 'root';
      this.activeTab = 'entrar';

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('SSH-OUT', `localhost logged in to ${host.ip} as ${this.activeSshRole}`, 'info');
      }
      this.appendServerLog(host.ip, `${route.visibleIp} logged in as ${this.activeSshRole}`);

      if (window.tutorialEngine) {
        window.tutorialEngine.onHostHackedOrLoggedRoot(host.ip);
      }
      if (window.hackerAudio) window.hackerAudio.playEnterBeep();
      this.render();
      return true;
    }

    disconnectSsh(silent = false) {
      this.activeSshIp = null;
      this.activeSshRole = 'root';
      if (!silent) {
        if (typeof window.showToast === 'function') window.showToast('Sessão remota encerrada.');
        this.render();
      }
    }

    applyQuickTauntToRemoteLog() {
      if (!this.activeSshIp) return;
      const ta = document.getElementById('remoteSyslogTextarea');
      if (!ta) return;

      const myReal = window.networkIdentity ? window.networkIdentity.getPublicIp() : '';
      const usedVisible = (this.lastPvpVisibleIpByTarget && this.lastPvpVisibleIpByTarget[this.activeSshIp]) || myReal;
      const myTag = (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador';
      const customInp = document.getElementById('remoteTauntMsgInput');
      const rawTaunt = customInp && customInp.value.trim()
        ? customInp.value.trim()
        : `Firewall de papelão hein fraco kkk passei a limpa e apaguei meu IP! - Ass: ${myTag}`;

      const keptLines = ta.value
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && (!myReal || !l.includes(myReal)) && (!usedVisible || !l.includes(usedVisible)));

      keptLines.unshift(`[LOG EDITADA POR ${myTag}]: "${rawTaunt}"`);
      ta.value = keptLines.join('\n');
      this.saveEditedRemoteLogs();
    }

    saveEditedRemoteLogs() {
      if (!this.activeSshIp) return;
      const ta = document.getElementById('remoteSyslogTextarea');
      if (!ta) return;

      const prevLines = this.getServerLogs(this.activeSshIp);
      const newLines = ta.value
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (window.botAI && window.botAI.syslogRegistry) {
        window.botAI.syslogRegistry.set(this.activeSshIp, newLines);
        const myCurIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '';
        if (myCurIp && !newLines.some((l) => l.includes(myCurIp)) && window.livingBotsEngine && typeof window.livingBotsEngine.clearTraceTimestamp === 'function') {
          window.livingBotsEngine.clearTraceTimestamp(this.activeSshIp, myCurIp);
        }

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
        const grantRep = () => {
          window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 5;
        };
        if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
          window.integrityGuard.runAuthorized(grantRep);
        } else {
          grantRep();
        }
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      }
      if (window.tutorialEngine) {
        window.tutorialEngine.notifyLogsSaved(this.activeSshIp, newLines);
      }
      if (window.dynamicContractsEngine) {
        window.dynamicContractsEngine.onGameAction('wipe_log', this.activeSshIp);
      }
      if (newLines.length < prevLines.length && window.nineSystemsEngine && typeof window.nineSystemsEngine.recordSimpleLogWipe === 'function') {
        window.nineSystemsEngine.recordSimpleLogWipe(this.activeSshIp);
      }
      if (newLines.length < prevLines.length && window.operatorRetentionEngine && typeof window.operatorRetentionEngine.recordDailyGoalProgress === 'function') {
        window.operatorRetentionEngine.recordDailyGoalProgress('ghost_wipe');
      }
      const sshHost = this.resolveHost(this.activeSshIp);
      if (sshHost && sshHost.isRealHuman && window.onlineEngine) {
        const myReal = window.networkIdentity.getPublicIp();
        const usedVisible = (this.lastPvpVisibleIpByTarget && this.lastPvpVisibleIpByTarget[this.activeSshIp]) || myReal;
        const wipedOwnIp = !newLines.some((l) => l.includes(usedVisible) || l.includes(myReal));

        // Captura linhas customizadas / farpas escritas ou editadas pelo invasor para injetar na log da vítima!
        const customLines = newLines
          .filter((l) => !prevLines.includes(l) && !l.includes('systemd[1]: sshd.service initialized'))
          .slice(0, 6)
          .map((l) => l.slice(0, 260));

        window.onlineEngine.sendPvpPacket({
          kind: 'PVP_EDIT_LOG',
          visibleIp: usedVisible,
          targetUserId: sshHost.humanUserId,
          targetTag: sshHost.humanTag,
          targetIp: sshHost.ip,
          d: {
            wipedOwnIp,
            fullClear: newLines.length === 0,
            customLines,
            crcVer: this.getPlayerCrackerVer(),
            expVer: Math.max(this.getPlayerSshExploitVer(), this.getPlayerFtpExploitVer())
          }
        });
      }
      if (window.hackerAudio) window.hackerAudio.playKeyClick();
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
      if (typeof window.showToast === 'function') {
        window.showToast(`Syslog remoto de ${this.activeSshIp} reescrito com sucesso!`);
      }
      this.render();
    }

    drainRemoteHostFunds() {
      if (!this.activeSshIp) return;
      if (!this.hasRemotePermission('drain')) {
        alert('PERMISSÃO INSUFICIENTE (Sessão FTP-Only)! Para executar saques ou comandos no servidor, obtenha acesso SSH ou ROOT!');
        return;
      }
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
      if (loot >= 100 && window.nineSystemsEngine) {
        window.nineSystemsEngine.addDirtyMoney(loot, `${host.hostname} [${host.ip}]`);
        if (typeof window.showToast === 'function') {
          window.showToast(`🩸 +$ ${loot.toLocaleString('pt-BR')} em Dinheiro Sujo drenado! Lave nas Empresas de Lavagem antes de gastar!`);
        }
      } else if (window.currentWallet) {
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
      if (host.isRealHuman && window.onlineEngine) {
        window.onlineEngine.sendPvpPacket({
          kind: 'PVP_DRAIN_WALLET',
          visibleIp: route.visibleIp,
          targetUserId: host.humanUserId,
          targetTag: host.humanTag,
          targetIp: host.ip,
          d: {
            amt: loot,
            crcVer: this.getPlayerCrackerVer(),
            expVer: Math.max(this.getPlayerSshExploitVer(), this.getPlayerFtpExploitVer())
          }
        });
      }
      const stealthBypassed = (window.topTenMechanics && typeof window.topTenMechanics.consumeIptablesStealthIfArmed === 'function')
        ? window.topTenMechanics.consumeIptablesStealthIfArmed(host.ip)
        : false;
      if (!stealthBypassed && !route.bounced && loot >= 800 && window.safenetFbiEngine) {
        window.safenetFbiEngine.evaluatePlayerCrime(`Transferência ilícita de $ ${loot} HC`, loot, host.ip);
      }
      if (window.ecosystemHub && typeof window.ecosystemHub.onCorporateHostSabotaged === 'function') {
        window.ecosystemHub.onCorporateHostSabotaged(host.ip, 'bank_drain');
      }
      if (window.hackerAudio) window.hackerAudio.playMoneyCollect();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (typeof window.showToast === 'function') {
        window.showToast(`+$ ${loot}.00 HC drenados de ${host.hostname}! Lembre-se de limpar o syslog!`);
      }
      this.render();
    }

    // ETAPA 1 DE 2: Subir o arquivo do vírus para o HD da vítima (Upload!)
    stageSelectedVirusToCurrentHost() {
      if (!this.activeSshIp || !window.softwareEngine) return Promise.resolve(null);
      if (!this.hasRemotePermission('upload')) {
        const role = (this.activeSshRole || 'ssh').toUpperCase();
        const msg = `PERMISSÃO INSUFICIENTE (Sessão ${role})! Subir arquivos exige permissão de Upload (FTP ou ROOT)!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return Promise.resolve({ success: false, code: 'NO_UPLOAD_PERMISSION', message: msg });
      }
      const host = this.resolveHost(this.activeSshIp);
      const sel = document.getElementById('remoteVirusSelect');
      const virusKey = sel ? sel.value : 'vspam';

      return new Promise((resolve) => {
        const up = window.softwareEngine.stageUploadVirusToRemote(host, virusKey, (res) => {
          if (res && res.success) {
            if (typeof window.showToast === 'function') window.showToast(res.message);
          } else if (res && typeof window.showToast === 'function') {
            window.showToast(res.message);
          }
          this.render();
          resolve(res);
        });

        if (!up.started) {
          if (typeof window.showToast === 'function') window.showToast(up.message);
          resolve({ success: false, code: up.code, message: up.message });
        }
      });
    }

    // ETAPA 2 DE 2: Executar na memória do PC da vítima um vírus que já foi subido!
    executeStagedVirusOnCurrentHost(virusKey, uiAsync = false) {
      if (!this.activeSshIp || !window.softwareEngine) return { success: false };
      if (!this.hasRemotePermission('install')) {
        const role = (this.activeSshRole || 'ftp').toUpperCase();
        const msg = `PERMISSÃO INSUFICIENTE (Sessão ${role})! Executar programas no PC da vítima exige permissão SSH ou ROOT!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'NO_EXEC_PERMISSION', message: msg };
      }
      const host = this.resolveHost(this.activeSshIp);
      const tourBusy = !!(window.spotlightTour && window.spotlightTour.isActive);

      if (uiAsync && !tourBusy && window.taskManager) {
        const staged = window.softwareEngine.getStagedVirusesOnIp(host.ip).find((sv) => sv.virusKey === virusKey);
        if (staged) {
          const verStr = (staged.versionInt / 10).toFixed(1);
          const enq = window.taskManager.enqueue({
            dedupeKey: `exec_remote_${host.ip}_${virusKey}`,
            title: `Executar vírus ${staged.filename} (${verStr}) em ${host.ip}`,
            labelHtml: `Executar vírus <strong>${esc(staged.filename)}</strong> (${verStr}) em ${esc(host.ip)}`,
            subtitle: `CPU · ${host.ip}`,
            targetIp: host.ip,
            queueKind: 'cpu',
            category: 'Ataque',
            idealSeconds: 1.5,
            onComplete: () => {
              const resDone = window.softwareEngine.executeStagedVirusOnRemote(host, virusKey);
              if (resDone && typeof window.showToast === 'function') window.showToast(resDone.message);
              this.render();
            }
          });
          if (enq.started) {
            this.render();
            return { success: true, queued: true, pid: enq.process.pid };
          }
        }
      }

      const res = window.softwareEngine.executeStagedVirusOnRemote(host, virusKey);
      if (res && res.success && window.ecosystemHub && typeof window.ecosystemHub.onCorporateHostSabotaged === 'function') {
        window.ecosystemHub.onCorporateHostSabotaged(host.ip, 'virus_exec');
      }
      if (res && typeof window.showToast === 'function') {
        window.showToast(res.message);
      }
      this.render();
      return res;
    }

    deploySelectedVirusToCurrentHost() {
      if (!this.activeSshIp || !window.softwareEngine) return Promise.resolve(null);
      if (!this.hasRemotePermission('upload') || !this.hasRemotePermission('install')) {
        const role = (this.activeSshRole || 'root').toUpperCase();
        const msg = `PERMISSÃO INSUFICIENTE (Sessão ${role})! Enviar E instalar vírus exige tanto Upload (FTP) quanto Execução (SSH) — use ambos os Exploits (FTP + SSH) ou quebre a senha ROOT!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return Promise.resolve({ success: false, code: 'NO_ROOT_PERMISSION', message: msg });
      }
      const host = this.resolveHost(this.activeSshIp);
      const sel = document.getElementById('remoteVirusSelect');
      const virusKey = sel ? sel.value : 'vspam';

      return new Promise((resolve) => {
        const up = window.softwareEngine.uploadVirusWithBandwidth(host, virusKey, (res) => {
          if (res && res.success) {
            if (window.tutorialEngine) {
              window.tutorialEngine.onFileReadOrVirusPlanted(host.ip);
            }
            if (window.ecosystemHub && typeof window.ecosystemHub.onCorporateHostSabotaged === 'function') {
              window.ecosystemHub.onCorporateHostSabotaged(host.ip, 'virus_exec');
            }
            if (typeof window.showToast === 'function') window.showToast(res.message);
          } else if (res && typeof window.showToast === 'function') {
            window.showToast(res.message);
          }
          this.render();
          resolve(res);
        });

        if (!up.started) {
          if (typeof window.showToast === 'function') window.showToast(up.message);
          resolve({ success: false, code: up.code, message: up.message });
        }
      });
    }

    deleteStaticRemoteFile(ip, fileName) {
      if (!this.hasRemotePermission('delete')) {
        alert('PERMISSÃO NEGADA (Sessão FTP-Only)! Deletar arquivos exige permissão SSH ou ROOT.');
        return;
      }
      if (!this.deletedHostFiles.has(ip)) {
        this.deletedHostFiles.set(ip, new Set());
      }
      this.deletedHostFiles.get(ip).add(fileName);
      const visibleIp = window.bounceEngine
        ? window.bounceEngine.routeConnectionAndGetVisibleIp(ip).visibleIp
        : (window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0');
      this.appendServerLog(ip, `${visibleIp} deleted file /root/${fileName} (disk space freed)`);
      if (window.ecosystemHub && typeof window.ecosystemHub.onCorporateHostSabotaged === 'function') {
        window.ecosystemHub.onCorporateHostSabotaged(ip, 'file_delete');
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('RM-REMOTE', `Arquivo ${fileName} removido de ${ip}:/root (espaço em disco liberado no alvo)`, 'info');
      }
      this.render();
    }

    drainCurrentHostBtcWallet() {
      if (!this.activeSshIp || !window.bitcoinEngine) return;
      if (!this.hasRemotePermission('drain')) {
        alert('PERMISSÃO NEGADA (Sessão FTP-Only)! Extrair chaves privadas exige acesso SSH ou ROOT.');
        return;
      }
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

    // Executa Analyzer.ana no servidor invadido (v1.0 = 50%, v2.0 = 80%, v3.0 = 100% precisão -> grava no Hacked Database!)
    runRemoteHardwareAnalyzer(ip) {
      if (!window.softwareEngine) return { success: false };
      if (!this.hasRemotePermission('analyze')) {
        const msg = 'PERMISSÃO NEGADA (Sessão FTP-Only)! Executar Analyzer.ana exige acesso SSH ou ROOT.';
        alert(msg);
        return { success: false, message: msg };
      }
      const anaVer = window.softwareEngine.getSoftwareVersion('analyzer');
      if (anaVer <= 0) {
        const msg = 'Instale/Ative primeiro o Analyzer.ana na sua RAM (aba Software & Vírus)!';
        alert(msg);
        return { success: false, code: 'ANALYZER_OFF', message: msg };
      }

      const host = this.resolveHost(ip);
      const specs = window.softwareEngine.inspectRemoteHostResources(host);
      const accuracy = anaVer >= 3.0 ? 1.0 : (anaVer >= 2.0 ? 0.8 : 0.5);
      let hwReport = '';
      if (accuracy >= 1.0) {
        hwReport = `${specs.cpuMhz} MHz CPU · ${specs.ramTotalMb} MB RAM · ${specs.hddTotalMb} MB HDD (100% Exato)`;
      } else {
        const spanCpu = Math.round(specs.cpuMhz * (1 - accuracy));
        const spanRam = Math.round(specs.ramTotalMb * (1 - accuracy));
        hwReport = `~${Math.max(400, specs.cpuMhz - spanCpu)}–${specs.cpuMhz + spanCpu} MHz CPU · ~${Math.max(64, specs.ramTotalMb - spanRam)}–${specs.ramTotalMb + spanRam} MB RAM (Precisão ${Math.round(accuracy * 100)}%)`;
      }

      if (window.hackedDb) {
        window.hackedDb.upsertHost({
          ip: host.ip,
          hostname: host.hostname,
          kind: host.kind,
          analyzedHw: hwReport
        });
      }
      const route = window.bounceEngine
        ? window.bounceEngine.routeConnectionAndGetVisibleIp(host.ip)
        : { visibleIp: window.networkIdentity.getPublicIp() };
      this.appendServerLog(host.ip, `${route.visibleIp} executed Analyzer.ana (v${anaVer.toFixed(1)})`);
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('ANALYZE-HW', `Analyzer.ana (v${anaVer.toFixed(1)}) salvou hardware de ${host.ip} no Hacked Database: ${hwReport}`, 'info');
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`Hardware de ${host.ip} registrado no seu Hacked Database!`);
      }
      this.render();
      return { success: true, hwReport };
    }

    // Pichar / Alterar página HTTP pública de um servidor invadido usando WebServer.exe!
    defaceRemoteWebPage(ip, customMsg) {
      if (!this.hasRemotePermission('deface')) {
        alert('PERMISSÃO NEGADA (Sessão FTP-Only)! Pichar servidor HTTP exige acesso SSH ou ROOT.');
        return { success: false };
      }
      if (window.softwareEngine && !window.softwareEngine.isSoftwareInstalled('webserver')) {
        const msg = 'Instale/Ative primeiro o WebServer.exe na sua RAM (aba Software & Vírus) para editar páginas HTTP!';
        alert(msg);
        return { success: false, message: msg };
      }
      const clean = String(customMsg || '').trim().slice(0, 220);
      if (!clean) return { success: false };
      this.defacedPages.set(ip, clean);
      const route = window.bounceEngine
        ? window.bounceEngine.routeConnectionAndGetVisibleIp(ip)
        : { visibleIp: window.networkIdentity.getPublicIp() };
      this.appendServerLog(ip, `${route.visibleIp} edited /var/www/index.html via WebServer.exe`);
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('WEB-DEFACE', `Página HTTP pública de ${ip} alterada via WebServer.exe!`, 'warning');
      }
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
      if (typeof window.showToast === 'function') window.showToast(`Deface HTTP publicado em ${ip}:80!`);
      this.render();
      return { success: true };
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
            <h3 style="margin: 0.5rem 0 0.35rem; font-size: 1.05rem;">Este é o seu próprio endereço IP público (${window.networkIdentity.renderBlurredMyIpHtml(host.ip, true)})</h3>
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
                <span><span style="color: var(--hc-text-3);">${esc(h.from)}</span> → <strong style="color: var(--hc-accent-text);">${h.to === myIp ? window.networkIdentity.renderBlurredMyIpHtml(h.to, true) : esc(h.to)}</strong></span>
                <span style="color: var(--hc-text-2);">${esc(h.mode)} · ${esc(h.at)}</span>
              </div>
            `).join('');

        return `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div class="hc-card" style="padding: 1.25rem; border-color: rgba(53, 184, 119, 0.35);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
                <div>
                  <div class="hc-eyebrow">Painel do Assinante · Renovação de IPv4 Dinâmico</div>
                  <div style="margin-top: 0.35rem; font-size: 0.85rem; color: var(--hc-text-2);">Seu IP Público Atual <span style="font-size: 0.75rem; color: var(--hc-text-3);">(passe o mouse p/ revelar)</span>:</div>
                  <div id="ispCurrentMyIpBox" style="font-family: var(--hc-font-mono); font-size: 1.5rem; font-weight: 700; color: var(--hc-accent-text); margin: 0.15rem 0 0.5rem;">${window.networkIdentity.renderBlurredMyIpHtml(myIp, true)}</div>
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

      // 3. Diretórios Públicos WHOIS (First, Second, Third e Fourth Whois: 71.4.20.1 -> .4)
      if (host.kind === 'whois') {
        return this.renderWhoisDirectoryHtml(host);
      }

      // 3b. Bitcoin Market Exchange Público (144.202.44.8)
      if (host.kind === 'btc_market') {
        const btcRate = window.bitcoinEngine ? window.bitcoinEngine.priceUsd : 64250;
        const myBtc = window.bitcoinEngine ? window.bitcoinEngine.getFormattedBtc() : '0.00000000';
        const myCash = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
        return `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div class="hc-stat-strip">
              <div class="hc-stat-cell">
                <div class="hc-stat-label">Cotação 1 BTC</div>
                <div class="hc-stat-value">$${btcRate.toLocaleString('pt-BR')}</div>
                <div class="hc-stat-sub ok">Liquidez imediata</div>
              </div>
              <div class="hc-stat-cell">
                <div class="hc-stat-label">Sua Carteira BTC</div>
                <div class="hc-stat-value">${String(myBtc).slice(0, 8)}</div>
                <div class="hc-stat-sub">Chave sincronizada</div>
              </div>
              <div class="hc-stat-cell">
                <div class="hc-stat-label">Saldo Bancário</div>
                <div class="hc-stat-value" style="color: var(--hc-accent-text);">$${myCash.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</div>
                <div class="hc-stat-sub">Conta principal</div>
              </div>
              <div class="hc-stat-cell">
                <div class="hc-stat-label">Segurança do Host</div>
                <div class="hc-stat-value">FW v${(host.firewallVer || 3.5).toFixed(1)}</div>
                <div class="hc-stat-sub">Servidor de câmbio</div>
              </div>
            </div>

            <div class="hc-split-card">
              <div class="hc-split-main">
                <div>
                  <div class="hc-eyebrow">Comprar Bitcoin com Dólares</div>
                  <p style="font-size: 12.5px; color: var(--hc-text-2); margin: 4px 0 12px;">Converta saldo bancário em BTC para proteger patrimônio ou operar de forma anônima.</p>
                  <div style="display: flex; gap: 8px;">
                    <input type="number" id="inetBtcBuyUsd" class="hc-input mono" placeholder="Valor em dólares (ex: 250)" min="10" value="100">
                    <button type="button" class="hc-btn primary" onclick="window.handleInetBtcTrade('buy')">Comprar BTC</button>
                  </div>
                </div>
              </div>
              <div class="hc-split-side">
                <div class="hc-eyebrow">Vender Bitcoin por Dólares</div>
                <p style="font-size: 12.5px; color: var(--hc-text-2); margin: 2px 0 8px;">Liquide seus Bitcoins minerados direto para sua conta corrente.</p>
                <div style="display: flex; gap: 8px;">
                  <input type="text" id="inetBtcSellAmt" class="hc-input mono" placeholder="Qtd BTC (ex: 0.0010)" value="0.0010">
                  <button type="button" class="hc-btn" onclick="window.handleInetBtcTrade('sell')">Vender</button>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // 4. Download Center (33.8.2.71) — Utilitários Freeware Básicos v1.0 (Sem vírus!)
      if (host.kind === 'download') {
        const dcList = window.stealthXhdEngine ? window.stealthXhdEngine.getStealableSoftwaresOnHost(host) : [];
        return `
          <div class="hc-card" style="padding: 1.15rem;">
            <div class="hc-eyebrow" style="margin-bottom: 0.4rem;">Espelho Público Oficial · Utilitários Básicos v1.0 (Freeware)</div>
            <p style="font-size: 0.84rem; color: var(--hc-text-2); margin-bottom: 0.65rem;">
              Baixe gratuitamente utilitários básicos de defesa, análise e recuperação (<code>Antivirus.av</code>, <code>Analyzer.ana</code>, <code>WebServer.exe</code>).
            </p>
            <div style="margin-bottom: 0.9rem; padding: 0.65rem 0.85rem; background: rgba(216,155,56,0.09); border: 1px solid var(--hc-warning); border-radius: 7px; font-size: 0.79rem; color: var(--hc-warning); display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
              <span><strong>Onde estão os Vírus Básicos?</strong> Vírus (<code>.vspam</code>, <code>.vwarez</code>, <code>.vminer</code>, <code>.vddos</code>, <code>.vbank</code>) não existem em lojas públicas — resolva e invada as máquinas de <strong>Puzzle</strong>!</span>
              <button type="button" class="hc-btn primary sm" onclick="window.internetEngine.navigate('109.64.200.10')">Ir p/ First Puzzle (109.64.200.10) →</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${dcList.map((st) => {
                const alreadyHas = window.softwareEngine ? window.softwareEngine.isSoftwareOwned(st.softKey) : false;
                const sizeMb = window.softwareEngine ? window.softwareEngine.getItemSizeMb(st.softKey, st.versionInt) : 16;
                return `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.85rem; background: var(--hc-inset); border: 1px solid var(--hc-border); border-radius: 8px; gap: 8px; flex-wrap: wrap;">
                    <div>
                      <strong style="font-family: var(--hc-font-mono); font-size: 0.86rem;">${esc(st.filename)}</strong>
                      <span class="hc-badge info" style="margin-left: 6px;">v${(st.versionInt / 10).toFixed(1)} · ${sizeMb} MB</span>
                      <span class="hc-badge ${alreadyHas ? 'success' : 'warn'}" style="margin-left: 4px;">${alreadyHas ? 'Já no seu HD' : 'Disponível p/ Download'}</span>
                    </div>
                    ${alreadyHas
                      ? `<span style="font-size: 0.78rem; color: var(--hc-accent-text); font-family: var(--hc-font-mono);">✓ Instalado no Disco</span>`
                      : `<button type="button" id="btnDcDownload_${esc(st.softKey)}" class="hc-btn primary sm" onclick="window.handleDownloadRemoteSoft('33.8.2.71', '${esc(st.softKey)}', ${st.versionInt})">⬇ Baixar Freeware (${sizeMb} MB)</button>`}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      // 4b. Portal Underground ZeroBin (hc://vazamentos — 185.220.101.77)
      if (host.kind === 'zerobin' && window.nineSystemsEngine) {
        return window.nineSystemsEngine.renderZeroBinPortalHtml();
      }

      // 5. Blackmarket Onion (185.220.101.9) — Preserva compras PostgreSQL + Mercado Clandestino P2P!
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
          ${window.nineSystemsEngine ? `<div style="margin-top:14px;">${window.nineSystemsEngine.renderP2pMarketSectionHtml()}</div>` : ''}
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
              <button type="button" class="hc-btn ghost" onclick="window.internetEngine.openIp('161.89.1.1')">Infiltrar Mainframe do FBI (161.89.1.1) →</button>
            </div>
          </div>
        `;
      }

      // 6d. Mainframe Central do FBI (161.89.1.1)
      if (host.kind === 'fbi_mainframe' || host.ip === '161.89.1.1') {
        const saved = window.hackedDb ? window.hackedDb.getEntry(host.ip) : null;
        if (!saved && !this.crackedHosts?.has(host.ip)) {
          return `
            <div class="hc-card" style="padding: 1.3rem; border-color: rgba(239, 68, 68, 0.5); background: linear-gradient(135deg, rgba(30,12,18,0.7) 0%, rgba(15,23,42,0.7) 100%);">
              <div class="hc-eyebrow" style="color: var(--hc-danger); margin-bottom: 0.4rem;">🚨 CLASSIFICADO // ACESSO FEDERAL ULTRA-RESTRITO</div>
              <h3 style="font-size: 1.15rem; margin-bottom: 0.4rem; color: #fff;">FEDERAL BUREAU OF INVESTIGATION — MAINFRAME CENTRAL</h3>
              <p style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.9rem;">
                Terminal Central de Inteligência Federal. Conexões sem autorização Root acionam protocolo de contra-rastreamento policial em 60 segundos.
              </p>
              <div style="font-family: monospace; font-size: 0.82rem; background: #0b0f17; padding: 12px; border-radius: 6px; border: 1px solid #334155; margin-bottom: 1.1rem; color: #94a3b8; line-height: 1.5;">
                • IP Alvo: <strong>161.89.1.1</strong> [fbi.gov.internal]<br>
                • Defesas do Host: <strong>Firewall v9.0 · Hasher v8.5 · AV v8.0</strong><br>
                • Alvo Primário: Banco de Dossiês Criminais, Mandados e Registros de IPs Mascarados.
              </div>
              <div style="display: flex; gap: 8px;">
                <button type="button" class="hc-btn primary" style="background: #dc2626; border-color: #ef4444;" onclick="window.internetEngine.switchTab('invadir')">
                  Iniciar Quebra de Senha no Mainframe (Invadir) →
                </button>
              </div>
            </div>
          `;
        } else {
          return window.safenetFbiEngine ? window.safenetFbiEngine.renderMainframeRootTerminal() : 'Mainframe Root Terminal Carregando...';
        }
      }

      // 7. Empresas, Bots e Jogadores VPC (com suporte a página HTTP customizada + Portal NVR de Câmeras!)
      const customHttp = this.defacedPages.get(host.ip) || host.customWebPage || null;
      const hasCctv = window.cctvEngine && window.cctvEngine.hostSupportsCctv(host);
      const alreadyHacked = window.hackedDb ? !!window.hackedDb.getEntry(host.ip) : false;
      const nvrProf = hasCctv ? window.cctvEngine.getCompanyNvrProfile(host.ip, host.hostname) : null;

      return `
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div class="hc-card" style="padding: 1.2rem;">
            <div class="hc-eyebrow" style="margin-bottom: 0.35rem;">Resposta HTTP Porta 80 · ${esc(host.badge)}</div>
            <h3 style="font-size: 1.05rem; margin-bottom: 0.4rem;">${esc(host.hostname)}</h3>
            ${customHttp
              ? `<div style="margin:0.55rem 0 0.85rem;padding:0.75rem 0.95rem;background:var(--hc-inset);border:1px solid var(--hc-accent);border-radius:7px;font-family:var(--hc-font-mono);font-size:0.82rem;color:var(--hc-accent-text);">
                   [HTTP :80 WebServer.exe]: ${esc(customHttp)}
                 </div>`
              : ''}
            <p style="font-size: 0.85rem; color: var(--hc-text-2); margin-bottom: 1rem;">
              Servidor operando em <code>${esc(host.ip)}</code> (${esc(host.cpuSpec)}).
              Defesas ativas: <strong>Firewall.fwl v${(host.firewallVer || 1.0).toFixed(1)}</strong> · <strong>Hasher.hash v${(host.hasherVer || 1.0).toFixed(1)}</strong>.
              ${host.newbieProtected ? `<br><strong style="color: var(--hc-info-text);">🛡️ Este operador está sob Escudo de Novato de 24h${host.newbieShieldRemaining ? ' (restam ' + esc(host.newbieShieldRemaining) + ')' : ''}.</strong>` : ''}
            </p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="hc-btn primary" onclick="window.internetEngine.switchTab('invadir')">Ir para Aba Invadir →</button>
              <button type="button" class="hc-btn ghost" onclick="window.internetEngine.switchTab('entrar')">Login SSH Remoto</button>
              ${hasCctv ? `
                <button type="button" id="btnPublicOpenCctv" class="hc-btn ${alreadyHacked ? 'primary' : 'ghost'}"
                  style="${alreadyHacked ? '' : 'border-color:rgba(229,83,75,0.45);color:#ff9b95;'}"
                  onclick="window.internetEngine.openCompanyCctv('${esc(host.ip)}')">
                  ${HC.icon('video')} ${alreadyHacked ? `Abrir ${nvrProf.cameras.length} Câmeras Ao Vivo` : `CFTV Trancado (${nvrProf.cameras.length} Câmeras — Invadir)`}
                </button>
              ` : ''}
            </div>
          </div>

          ${hasCctv ? `
            <div class="hc-card" style="padding:1rem 1.2rem;border-color:rgba(53,184,119,0.28);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
              <div>
                <div class="hc-eyebrow" style="color:var(--hc-accent-text);">${esc(nvrProf.nvrSystem)}</div>
                <div style="font-size:0.83rem;color:var(--hc-text-2);margin-top:3px;">
                  Canais RTSP detectados: <strong>${nvrProf.cameras.map((c) => `${c.code} (${c.room})`).join(' · ')}</strong>
                </div>
              </div>
              <span class="hc-badge ${alreadyHacked ? 'success' : 'danger'}">${alreadyHacked ? 'Acesso NVR Liberado' : 'RTSP:554 Protegido por Senha'}</span>
            </div>
          ` : ''}
        </div>
      `;
    }

    renderLoginOrRootTab(host) {
      if (host.kind === 'self') {
        return this.renderPublicPageTab(host);
      }

      // REVALIDAÇÃO CONTÍNUA DE CONEXÃO ATIVA (hacking.txt linhas 26-43):
      // Se o alvo evoluiu o Firewall/Hasher ou se você desligou seu Cracker/Exploit na RAM, cai ou reduz permissões na hora!
      let droppedReason = null;
      if (this.activeSshIp === host.ip) {
        const liveCheck = this.validateRemoteSessionDefenses(host, this.activeSshMethod || 'password');
        if (!liveCheck.ok) {
          this.activeSshIp = null;
          this.activeSshRole = 'root';
          droppedReason = liveCheck.reason;
        } else if (liveCheck.role && liveCheck.role !== this.activeSshRole) {
          this.activeSshRole = liveCheck.role;
        }
      }

      const saved = window.hackedDb ? window.hackedDb.getEntry(host.ip) : null;

      // Se AINDA NÃO está conectado via SSH neste IP -> mostra tela de Login
      if (this.activeSshIp !== host.ip) {
        const prefillPwd = (saved && saved.accessMethod === 'password') ? saved.password : '';
        return `
          <div class="hc-card" style="max-width: 480px; margin: 0 auto; padding: 1.35rem;">
            ${droppedReason
              ? `<div style="margin-bottom:0.85rem;padding:0.7rem 0.85rem;background:rgba(208,68,58,0.12);border:1px solid var(--hc-danger);border-radius:7px;font-size:0.79rem;color:var(--hc-danger-text);">
                   <strong>CONEXÃO DERRUBADA PELA DEFESA DO ALVO:</strong><br>${esc(droppedReason)}
                 </div>`
              : ''}
            <div class="hc-eyebrow" style="margin-bottom: 0.35rem;">Terminal de Autenticação Remota (Valida Firewall v${(host.firewallVer || 1.0).toFixed(1)} & Hasher v${(host.hasherVer || 1.0).toFixed(1)})</div>
            <h3 style="font-size: 1rem; margin-bottom: 0.75rem;">Entrar em <code>${esc(host.ip)}</code></h3>
            ${saved
              ? `<div style="margin-bottom: 0.85rem; font-size: 0.8rem; color: var(--hc-accent-text);">Credencial no Hacked Database (${saved.accessMethod === 'exploit' ? `Exploit [${esc((saved.sshUser || 'root').toUpperCase())}]` : 'Senha root preenchida'}).</div>`
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
                <button type="button" id="btnConnectSshPwd" class="hc-btn primary" style="flex: 1;" onclick="window.internetEngine.connectSsh('${esc(host.ip)}', document.getElementById('inetSshPwdInput').value)">Conectar c/ Senha</button>
                ${saved && saved.accessMethod === 'exploit'
                  ? `<button type="button" id="btnConnectSshExploit" class="hc-btn" onclick="window.internetEngine.connectSsh('${esc(host.ip)}', '', true)">Entrar c/ Exploit</button>`
                  : ''}
              </div>
            </div>
          </div>
        `;
      }

      // CONECTADO NO SERVIDOR REMOTO (root, ftp ou ssh)!
      const role = this.activeSshRole || 'root';
      const roleBadge = role === 'root'
        ? `<span class="hc-badge success">ACESSO ROOT COMPLETO</span>`
        : (role === 'ftp'
            ? `<span class="hc-badge warn">SESSÃO FTP (Porta 21: Logs + Download/Upload apenas)</span>`
            : `<span class="hc-badge info">SESSÃO SSH (Porta 22: Logs + Execução/Delete apenas)</span>`);

      const logs = this.getServerLogs(host.ip);
      const myIp = window.networkIdentity.getPublicIp();
      const myIpExposed = logs.some((l) => l.includes(myIp));

      let subContent = '';
      if (this.sshSubTab === 'logs') {
        const myTag = (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador';
        const defaultTaunt = `Firewall de papelão hein fraco kkk passei a limpa e apaguei meu IP! - Ass: ${myTag}`;
        subContent = `
          <div id="remoteLogEditorBox" style="display:flex;flex-direction:column;gap:8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
              <div>
                <strong style="font-size: 0.88rem;">Rastros de Acesso neste PC <span style="font-family:var(--hc-font-mono);font-size:0.78rem;color:var(--hc-text-3);">(${esc(host.ip)}:/var/log/syslog)</span></strong>
                <div style="font-size: 0.78rem; color: ${myIpExposed ? 'var(--hc-danger-text)' : 'var(--hc-text-2)'};">
                  ${myIpExposed
                    ? `⚠️ CUIDADO: Seu endereço (${window.networkIdentity.renderBlurredMyIpHtml(myIp, true)}) está anotado abaixo! Apague antes de sair para ninguém te rastrear!`
                    : `✅ Limpo! Seu endereço (${window.networkIdentity.renderBlurredMyIpHtml(myIp, true)}) não aparece mais nos rastros deste PC.`}
                </div>
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button type="button" id="btnWipeAllRemoteLogs" class="hc-btn ghost sm" onclick="document.getElementById('remoteSyslogTextarea').value=''; window.internetEngine.saveEditedRemoteLogs();">Apagar Comum (Fica rastro 5m)</button>
                ${window.nineSystemsEngine ? `
                  <button type="button" id="btnSevenPassShredRemote" class="hc-btn sm" style="border-color:var(--hc-danger);color:var(--hc-danger-text);" onclick="window.nineSystemsEngine.executeSevenPassShred('${esc(host.ip)}'); document.getElementById('remoteSyslogTextarea').value='';">🔥 Apagar de Vez (Sem rastro)</button>
                  <button type="button" id="btnScanMagneticShadowRemote" class="hc-btn ghost sm" onclick="const r = window.nineSystemsEngine.scanMagneticShadowsOnHost('${esc(host.ip)}'); const bx = document.getElementById('remoteMagShadowResultBox'); if (bx) { bx.style.display='block'; bx.innerHTML = r.shadows && r.shadows.length ? r.shadows.map(s => '🔬 Rastro Apagado Encontrado: <code>' + s.subnetPrefix + '</code> (apagado às ' + s.wipedAt + ')').join('<br>') : r.message; }">🔬 Procurar Rastro Apagado</button>
                ` : ''}
                <button type="button" id="btnSaveRemoteSyslog" class="hc-btn primary sm" onclick="window.internetEngine.saveEditedRemoteLogs()">Salvar Alteração</button>
              </div>
            </div>
            <div id="remoteMagShadowResultBox" style="display:none;padding:8px 10px;background:#0d1520;border:1px solid #2b3e57;border-radius:7px;font-size:12px;color:#7dd3fc;"></div>

            <!-- Barra Rápida: Apagar Próprio IP & Deixar Farpa / Recado para o Alvo! -->
            <div id="remoteTauntQuickBar" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:8px 10px;background:var(--hc-inset);border:1px solid rgba(216,155,56,0.35);border-radius:7px;">
              <input type="text" id="remoteTauntMsgInput" class="form-input" style="flex:1;min-width:240px;font-family:var(--hc-font-mono);font-size:0.77rem;" value="${esc(defaultTaunt)}" placeholder="Escreva uma farpa/aviso p/ deixar na log do alvo sem seu IP...">
              <button type="button" id="btnQuickWipeAndTaunt" class="hc-btn sm" style="border-color:var(--hc-warning);color:var(--hc-warning);" onclick="window.internetEngine.applyQuickTauntToRemoteLog()">
                🔥 Apagar Meu IP &amp; Deixar Farpa
              </button>
            </div>

            <!-- Culpar Outro IP na Safenet! -->
            ${window.ecosystemHub ? `
              <div id="remoteFalseFlagBar" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:8px 10px;background:var(--hc-inset);border:1px solid rgba(53,184,119,0.32);border-radius:7px;">
                <span style="font-size:0.77rem;color:var(--hc-text-2);">🎭 <strong>Culpar Outro IP:</strong> apaga seu IP e coloca o IP de um rival no lugar para a polícia ir atrás dele:</span>
                <input type="text" id="falseFlagTargetIpInput" class="form-input" style="width:155px;font-family:var(--hc-font-mono);font-size:0.77rem;" value="149.56.28.11" placeholder="IP p/ incriminar">
                <button type="button" id="btnPlantFalseFlag" class="hc-btn primary sm" onclick="window.ecosystemHub.plantFalseFlagOnHost('${esc(host.ip)}', document.getElementById('falseFlagTargetIpInput')?.value)">
                  🎭 Colocar IP Falso
                </button>
              </div>
            ` : ''}

            <textarea id="remoteSyslogTextarea" class="ssh-syslog-editor" spellcheck="false">${esc(logs.join('\n'))}</textarea>
          </div>
        `;
      } else if (this.sshSubTab === 'files') {
        const specs = window.softwareEngine
          ? window.softwareEngine.inspectRemoteHostResources(host)
          : { cpuMhz: 1000, netMbps: 10, antivirusVer: 1.0, hddTotalMb: 250, hddUsedMb: 120, hddFreeMb: 130, ramTotalMb: 128, ramUsedMb: 64, ramFreeMb: 64 };
        const dynamicFiles = window.missionsEngine ? window.missionsEngine.getMissionFilesForHost(host.ip) : [];
        const customNotes = (this.remoteCustomNotes && this.remoteCustomNotes.get(host.ip)) || [];
        const customFolders = (this.remoteCustomFolders && this.remoteCustomFolders.get(host.ip)) || [];
        const allFiles = [...customNotes, ...dynamicFiles, ...(host.files || [])];

        const remoteBtcSats = window.bitcoinEngine ? window.bitcoinEngine.getRemoteHostWalletSats(host) : 0;
        const remoteBtcStr = (remoteBtcSats / 100000000).toFixed(8);
        const virusOpts = window.softwareEngine ? window.softwareEngine.getVirusCatalogOptions(host) : [];
        const stagedOnTarget = window.softwareEngine ? window.softwareEngine.getStagedVirusesOnIp(host.ip) : [];
        const installedOnTarget = window.softwareEngine ? window.softwareEngine.getRemoteVirusesOnIp(host.ip) : [];
        const upJob = window.softwareEngine && window.softwareEngine.activeUploadJob && window.softwareEngine.activeUploadJob.targetIp === host.ip
          ? window.softwareEngine.activeUploadJob
          : null;

        const stealables = window.stealthXhdEngine ? window.stealthXhdEngine.getStealableSoftwaresOnHost(host) : [];
        const stealableKeys = new Set(stealables.map((s) => s.softKey));

        // Programas nativos da vítima + seus vírus + binários para Download (Estilo Enxuto Foto 2: Ícone | Nome | Versão | Tamanho | Ícones + Mini-Aba Hover)
        const remoteSoftRows = [];

        // 1) Pastas remotas
        customFolders.forEach((rf) => {
          remoteSoftRows.push(`
            <tr>
              <td class="soft-col-icon">
                <span class="soft-mini-glyph kind-folder" data-tip-title="Pasta /${esc(rf.name)}" data-tip-meta="Diretório" data-tip-desc="Pasta criada neste servidor remoto.">
                  ${HC.icon('folder')}
                </span>
              </td>
              <td>
                <span class="soft-name-trigger" tabindex="0" data-tip-title="Pasta /${esc(rf.name)}" data-tip-meta="${esc(host.ip)}" data-tip-desc="Diretório remoto criado por você neste computador.">
                  ${esc(rf.name)}/
                </span>
              </td>
              <td class="soft-col-ver"><span style="color:var(--hc-text-3);">—</span></td>
              <td class="soft-col-size">0 MB</td>
              <td class="soft-col-acts">
                <div class="soft-icon-actions">
                  <button type="button" class="soft-icon-act ic-del" aria-label="Excluir pasta ${esc(rf.name)}"
                    data-tip-title="Excluir pasta" data-tip-desc="Apagar a pasta /${esc(rf.name)} do disco da vítima."
                    onclick="window.internetEngine.remoteCustomFolders.set('${esc(host.ip)}', (window.internetEngine.remoteCustomFolders.get('${esc(host.ip)}')||[]).filter(x=>x.id!=='${esc(rf.id)}'));window.internetEngine.render();">${HC.icon('trash-2')}</button>
                </div>
              </td>
            </tr>
          `);
        });

        // 2) Vírus que você subiu p/ o disco da vítima e aguardam clicar no ícone Rodar (⚙️)
        stagedOnTarget.forEach((sv) => {
          const def = window.softwareEngine ? window.softwareEngine.getDefinition(sv.virusKey) : null;
          const verStr = (sv.versionInt / 10).toFixed(1);
          remoteSoftRows.push(`
            <tr>
              <td class="soft-col-icon">
                <span class="soft-mini-glyph kind-virus"
                  data-tip-title="${esc(sv.friendlyTitle || def?.friendlyTitle || sv.filename)}"
                  data-tip-meta="No disco · v${verStr}"
                  data-tip-desc="${esc(def?.desc || 'Arquivo de vírus enviado para o disco da vítima. Clique no ícone Rodar para iniciar!')}">
                  ${HC.icon('bug')}
                </span>
              </td>
              <td>
                <span class="soft-name-trigger" tabindex="0"
                  data-tip-title="${esc(sv.friendlyTitle || def?.friendlyTitle || sv.filename)}"
                  data-tip-meta="Aguardando rodar (${sv.ramMb} MB RAM)"
                  data-tip-desc="${esc(def?.desc || 'Subido por você para este PC. Clique na engrenagem para deixar rodando em segundo plano!')}">
                  <span>${esc(sv.filename)}</span>
                  <span style="font-size:11px;color:var(--hc-warning-text);">(parado)</span>
                </span>
              </td>
              <td class="soft-col-ver"><span class="soft-ver-badge v-tier2">${verStr}</span></td>
              <td class="soft-col-size">${sv.sizeMb} MB</td>
              <td class="soft-col-acts">
                <div class="soft-icon-actions">
                  <button type="button" class="soft-icon-act ic-run" aria-label="Rodar ${esc(sv.filename)} no PC da vítima"
                    data-tip-title="Rodar vírus" data-tip-meta="${sv.ramMb} MB RAM"
                    data-tip-desc="Executar ${esc(sv.filename)} (${verStr}) e deixá-lo rodando em segundo plano no PC de ${esc(host.ip)}."
                    onclick="window.internetEngine.executeStagedVirusOnCurrentHost('${esc(sv.virusKey)}', true)">${HC.icon('settings')}</button>
                  <button type="button" class="soft-icon-act ic-del" aria-label="Excluir ${esc(sv.filename)} do PC da vítima"
                    data-tip-title="Excluir arquivo" data-tip-desc="Apagar ${esc(sv.filename)} do disco de ${esc(host.ip)}."
                    onclick="window.internetEngine.deleteRemoteStagedVirus('${esc(host.ip)}', '${esc(sv.virusKey)}')">${HC.icon('trash-2')}</button>
                </div>
              </td>
            </tr>
          `);
        });

        // 3) Vírus seus já em execução na memória da vítima
        installedOnTarget.forEach((iv) => {
          const def = window.softwareEngine ? window.softwareEngine.getDefinition(iv.virusKey) : null;
          const isHid = (iv.hiddenWithVer || 0) > 0;
          const verStr = (iv.versionInt / 10).toFixed(1);
          remoteSoftRows.push(`
            <tr class="row-running ${isHid ? 'row-hidden' : ''}">
              <td class="soft-col-icon">
                <span class="soft-mini-glyph kind-virus"
                  data-tip-title="${esc(def?.friendlyTitle || iv.filename)}"
                  data-tip-meta="Ativo v${verStr}"
                  data-tip-desc="${esc(def?.desc || 'Seu vírus ativo neste computador invadido.')}">
                  ${HC.icon('bug')}
                </span>
              </td>
              <td>
                <span class="soft-name-trigger" tabindex="0"
                  data-tip-title="${esc(def?.friendlyTitle || iv.filename)}"
                  data-tip-meta="${isHid ? `Oculto v${iv.hiddenWithVer.toFixed(1)}` : 'Rodando em 2º plano'}"
                  data-tip-desc="${esc(def?.desc || 'Seu vírus em execução na memória desta máquina.')}">
                  <span class="soft-run-dot"></span>
                  <span>${esc(iv.filename)}</span>
                  ${isHid ? `<span style="font-size:11px;color:var(--hc-text-3);">(oculto)</span>` : ''}
                </span>
              </td>
              <td class="soft-col-ver"><span class="soft-ver-badge v-tier2">${verStr}</span></td>
              <td class="soft-col-size">${iv.sizeMb || 18} MB</td>
              <td class="soft-col-acts">
                <div class="soft-icon-actions">
                  ${window.stealthXhdEngine
                    ? `<button type="button" class="soft-icon-act ic-hide" aria-label="Esconder ${esc(iv.filename)} no PC da vítima"
                        data-tip-title="Esconder vírus" data-tip-meta="Hider"
                        data-tip-desc="Camuflar ${esc(iv.filename)} no PC da vítima para dificultar detecção."
                        onclick="window.stealthXhdEngine.hideRemoteVirusWithHider(${iv.id});window.internetEngine.render();">${HC.icon('eye-off')}</button>`
                    : ''}
                  <button type="button" class="soft-icon-act ic-del" aria-label="Excluir ${esc(iv.filename)} do PC da vítima"
                    data-tip-title="Excluir vírus" data-tip-desc="Encerrar e remover seu ${esc(iv.filename)} deste computador."
                    onclick="window.softwareEngine.removeRemoteVirus(${iv.id});window.internetEngine.render();">${HC.icon('trash-2')}</button>
                </div>
              </td>
            </tr>
          `);
        });

        // 4) Softwares disponíveis no PC invadido para você baixar p/ o seu PC (ícone de Download ⬇️ + Mini-Aba!)
        stealables.forEach((st) => {
          const def = window.softwareEngine ? window.softwareEngine.getDefinition(st.softKey) : null;
          const sizeMb = window.softwareEngine ? window.softwareEngine.getItemSizeMb(st.softKey, st.versionInt) : 18;
          const verStr = (st.versionInt / 10).toFixed(1);
          const friendly = def?.friendlyTitle || st.filename;
          const desc = def?.desc || 'Programa instalado neste computador. Você pode baixá-lo para o seu próprio PC.';
          remoteSoftRows.push(`
            <tr>
              <td class="soft-col-icon">
                <span class="soft-mini-glyph kind-${def?.iconKind || 'attack'}"
                  data-tip-title="${esc(friendly)}" data-tip-meta="v${verStr} · ${sizeMb} MB" data-tip-desc="${esc(desc)}">
                  ${HC.icon(def?.icon || 'package')}
                </span>
              </td>
              <td>
                <span class="soft-name-trigger" tabindex="0"
                  data-tip-title="${esc(friendly)}" data-tip-meta="${esc(st.sourceBadge || 'No disco')}" data-tip-desc="${esc(desc)}">
                  <span>${esc(st.filename)}</span>
                </span>
              </td>
              <td class="soft-col-ver"><span class="soft-ver-badge v-tier2">${verStr}</span></td>
              <td class="soft-col-size">${sizeMb} MB</td>
              <td class="soft-col-acts">
                <div class="soft-icon-actions">
                  <button type="button" class="soft-icon-act ic-info" aria-label="Sobre ${esc(st.filename)}"
                    data-tip-title="${esc(friendly)}" data-tip-meta="v${verStr}" data-tip-desc="${esc(desc)}"
                    onclick="if(window.showToast) window.showToast('${esc(friendly)} (${verStr}): ${esc(desc)}')">
                    ${HC.icon('info')}
                  </button>
                  <button type="button" id="btnStealSoft_${esc(st.softKey)}" class="soft-icon-act ic-dl" aria-label="Baixar ${esc(st.filename)} para o seu PC"
                    data-tip-title="Download para o meu PC" data-tip-meta="${sizeMb} MB"
                    data-tip-desc="Baixar ${esc(friendly)} (${verStr}) deste computador invadido para o seu disco."
                    onclick="window.handleDownloadRemoteSoft('${esc(host.ip)}', '${esc(st.softKey)}', ${st.versionInt})">
                    ${HC.icon('download')}
                  </button>
                </div>
              </td>
            </tr>
          `);
        });

        // 5) Programas de sistema da própria vítima (Firewall, Hasher, Antivírus) caso ainda não listados acima
        const nativeDefs = [
          { softKey: 'firewall', ver: host.firewallVer || 1.0, icon: 'shield', kind: 'defense', name: 'Escudo de Rede (Firewall)', fn: 'Firewall.fwl' },
          { softKey: 'hasher', ver: host.hasherVer || 1.0, icon: 'lock', kind: 'defense', name: 'Cofre de Senha (Hasher)', fn: 'Hasher.hash' },
          ...(specs.antivirusVer > 0 ? [{ softKey: 'antivirus', ver: specs.antivirusVer, icon: 'shield-check', kind: 'defense', name: 'Varredor Antivírus', fn: 'Antivirus.av' }] : [])
        ];
        nativeDefs.forEach((nd) => {
          if (stealableKeys.has(nd.softKey)) return;
          const def = window.softwareEngine ? window.softwareEngine.getDefinition(nd.softKey) : null;
          const verInt = Math.round(nd.ver * 10);
          const sz = window.softwareEngine ? window.softwareEngine.getItemSizeMb(nd.softKey, verInt) : 18;
          const verStr = nd.ver.toFixed(1);
          const desc = def?.desc || 'Programa de proteção instalado neste computador.';
          remoteSoftRows.push(`
            <tr class="row-running">
              <td class="soft-col-icon">
                <span class="soft-mini-glyph kind-${nd.kind}"
                  data-tip-title="${esc(nd.name)}" data-tip-meta="Ativo v${verStr}" data-tip-desc="${esc(desc)}">
                  ${HC.icon(nd.icon)}
                </span>
              </td>
              <td>
                <span class="soft-name-trigger" tabindex="0"
                  data-tip-title="${esc(nd.name)}" data-tip-meta="Rodando v${verStr}" data-tip-desc="${esc(desc)}">
                  <span class="soft-run-dot"></span>
                  <span>${esc(nd.fn)}</span>
                </span>
              </td>
              <td class="soft-col-ver"><span class="soft-ver-badge v-tier1">${verStr}</span></td>
              <td class="soft-col-size">${sz} MB</td>
              <td class="soft-col-acts">
                <div class="soft-icon-actions">
                  <button type="button" class="soft-icon-act ic-info" aria-label="Sobre ${esc(nd.fn)}"
                    data-tip-title="${esc(nd.name)}" data-tip-meta="v${verStr}" data-tip-desc="${esc(desc)}"
                    onclick="if(window.showToast) window.showToast('${esc(nd.name)} (${verStr}): ${esc(desc)}')">
                    ${HC.icon('info')}
                  </button>
                  <button type="button" class="soft-icon-act ic-dl" aria-label="Baixar ${esc(nd.fn)} para o seu PC"
                    data-tip-title="Download para o meu PC" data-tip-meta="${sz} MB"
                    data-tip-desc="Copiar ${esc(nd.fn)} (${verStr}) deste computador invadido para o seu disco."
                    onclick="window.handleDownloadRemoteSoft('${esc(host.ip)}', '${esc(nd.softKey)}', ${verInt})">
                    ${HC.icon('download')}
                  </button>
                </div>
              </td>
            </tr>
          `);
        });

        // 6) Arquivos, contratos e notas .txt no disco da vítima
        allFiles.forEach((f) => {
          const safeId = esc(f.name.replace(/[^a-zA-Z0-9]/g, '_'));
          const isStaticDeletable = !f.missionId && !f.isTutorial && ((f.sizeMb || 0) > 0 || f.isCustomNote);
          const fileTag = f.missionId ? 'Arquivo de Missão' : (f.isTutorial ? 'Arquivo do Tutorial' : 'Arquivo no disco');
          remoteSoftRows.push(`
            <tr>
              <td class="soft-col-icon">
                <span class="soft-mini-glyph kind-text"
                  data-tip-title="${esc(f.name)}" data-tip-meta="${esc(fileTag)}" data-tip-desc="${esc(f.content)}">
                  ${HC.icon('file-text')}
                </span>
              </td>
              <td>
                <span class="soft-name-trigger" tabindex="0"
                  data-tip-title="${esc(f.name)}" data-tip-meta="${esc(fileTag)}" data-tip-desc="${esc(f.content)}">
                  <span>${esc(f.name)}</span>
                </span>
              </td>
              <td class="soft-col-ver"><span style="color:var(--hc-text-3);">—</span></td>
              <td class="soft-col-size">${esc(f.size || (f.sizeMb ? f.sizeMb + ' MB' : '1 MB'))}</td>
              <td class="soft-col-acts">
                <div class="soft-icon-actions">
                  <button type="button" id="btnReadFile_${safeId}" class="soft-icon-act ic-dl" aria-label="${f.canSteal || f.missionId ? 'Baixar' : 'Ler'} ${esc(f.name)}"
                    data-tip-title="${f.canSteal || f.missionId ? 'Download do arquivo' : 'Ler arquivo'}"
                    data-tip-desc="${esc(f.content)}"
                    onclick="window.handleRemoteFileAction('${esc(host.ip)}', '${esc(f.name)}', 'read')">
                    ${HC.icon('download')}
                  </button>
                  ${f.canDelete
                    ? `<button type="button" id="btnDeleteFile_${safeId}" class="soft-icon-act ic-del" aria-label="Excluir ${esc(f.name)}"
                        data-tip-title="Excluir arquivo" data-tip-desc="Apagar ${esc(f.name)} do disco da vítima."
                        onclick="window.handleRemoteFileAction('${esc(host.ip)}', '${esc(f.name)}', 'delete')">${HC.icon('trash-2')}</button>`
                    : ''}
                  ${isStaticDeletable
                    ? `<button type="button" id="btnFreeSpace_${safeId}" class="soft-icon-act ic-del" aria-label="Excluir ${esc(f.name)}"
                        data-tip-title="Excluir p/ liberar espaço" data-tip-desc="Apagar ${esc(f.name)} e liberar espaço no HD da vítima."
                        onclick="window.internetEngine.deleteStaticRemoteFile('${esc(host.ip)}', '${esc(f.name)}')">${HC.icon('trash-2')}</button>`
                    : ''}
                </div>
              </td>
            </tr>
          `);
        });

        const seekerRevealed = window.stealthXhdEngine ? window.stealthXhdEngine.revealedHosts.has(host.ip) : false;
        const seekerClaimed = window.stealthXhdEngine ? window.stealthXhdEngine.claimedHiddenLoot.has(host.ip) : false;
        const foreignViruses = (window.nineSystemsEngine && typeof window.nineSystemsEngine.getForeignVirusesOnHost === 'function')
          ? window.nineSystemsEngine.getForeignVirusesOnHost(host.ip)
          : [];
        foreignViruses.forEach((fv) => {
          remoteSoftRows.push(`
            <tr>
              <td class="soft-col-icon">
                <span class="soft-mini-glyph kind-virus" data-tip-title="Vírus Alheio (${esc(fv.ownerTag)})" data-tip-meta="Revelado por Seeker.skr" data-tip-desc="Sequestre a chave C2 para desviar 70% do fluxo deste zumbi para sua conta (Máx. 4 simultâneos)!">
                  ${HC.icon('bug')}
                </span>
              </td>
              <td>
                <span class="soft-name-trigger" tabindex="0">
                  <strong style="color:#fbbf24;">${esc(fv.family)}_c2.${esc(fv.ownerTag)}</strong>
                  <span style="font-size:11px;color:var(--hc-text-3);">(${fv.hijacked ? 'roubando 70% ✓' : 'vírus de outro jogador!'})</span>
                </span>
              </td>
              <td class="soft-col-ver"><span class="soft-ver-badge v-tier2">${esc(fv.versionLabel)}</span></td>
              <td class="soft-col-size">24 MB</td>
              <td class="soft-col-acts">
                <div class="soft-icon-actions">
                  ${fv.hijacked
                    ? `<span class="hc-badge success">✓ Roubando 70%</span>`
                    : `<button type="button" id="btnHijackForeignC2" class="hc-btn primary sm" onclick="window.nineSystemsEngine.hijackForeignVirus('${esc(host.ip)}')">🏴‍☠️ Roubar 70% desse Vírus</button>`}
                </div>
              </td>
            </tr>
          `);
        });
        const cctMeta = (window.ecosystemHub && typeof window.ecosystemHub.getHostCctContract === 'function')
          ? window.ecosystemHub.getHostCctContract(host.ip)
          : null;
        if (cctMeta) {
          remoteSoftRows.push(`
            <tr>
              <td class="soft-col-icon">
                <span class="soft-mini-glyph kind-attack" data-tip-title="Contrato Criptografado (.CCT)" data-tip-meta="${cctMeta.solved ? 'Decodificado ✓' : cctMeta.attemptsLeft + ' tentativas'}" data-tip-desc="Arquivo de desafio algorítmico que paga $ HC + BTC + Catalisador do Laboratório de Vírus!">
                  ${HC.icon('lock')}
                </span>
              </td>
              <td>
                <span class="soft-name-trigger" tabindex="0">
                  <strong style="color:${cctMeta.solved ? '#5fd39a' : 'var(--hc-warning-text)'};">${esc(cctMeta.filename)}</strong>
                  <span style="font-size:11px;color:var(--hc-text-3);">${cctMeta.solved ? '(resolvido ✓)' : `(${cctMeta.attemptsLeft} tent.)`}</span>
                </span>
              </td>
              <td class="soft-col-ver"><span class="soft-ver-badge v-tier2">.CCT</span></td>
              <td class="soft-col-size">12 MB</td>
              <td class="soft-col-acts">
                <div class="soft-icon-actions">
                  ${cctMeta.solved
                    ? `<span style="font-size:11px;color:#5fd39a;">✓ Pago</span>`
                    : `<button type="button" id="btnOpenRemoteCct" class="hc-btn primary sm" onclick="window.ecosystemHub.openHostCctContract('${esc(host.ip)}')">🔓 Decodificar .CCT</button>`}
                </div>
              </td>
            </tr>
          `);
        }
        const donutHtml = window.softwareEngine
          ? window.softwareEngine.renderDonutSvg(specs.hddUsedMb, specs.hddTotalMb, 'Disco da Vítima')
          : '';
        const inlineTmBars = window.taskManager ? window.taskManager.renderInlineActiveBarsHtml(host.ip) : '';

        subContent = `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${inlineTmBars}
            ${role !== 'root'
              ? `<div style="padding:10px 12px;background:rgba(216,155,56,0.1);border:1px solid var(--hc-warning);border-radius:8px;font-size:12px;color:var(--hc-warning);display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
                   <div><strong>Permissão parcial (${role.toUpperCase()}):</strong> ${role === 'ftp' ? 'Somente Download/Upload e Logs.' : 'Somente Execução/Exclusão e Logs.'}</div>
                   ${window.topTenMechanics ? `<button type="button" id="btnOpenBufferOverflow" class="hc-btn primary sm" onclick="window.topTenMechanics.openBufferOverflowModal('${esc(host.ip)}')">🧨 Escalar p/ ROOT (Buffer Overflow 12s)</button>` : ''}
                 </div>`
              : ''}

            <!-- Barra rápida de Upload e Execução de Vírus (mantém IDs do Tutorial!) -->
            <div id="remoteVirusDeployCard" class="hc-card" style="padding: 12px 14px; border-color: rgba(53, 184, 119, 0.35);">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">
                <span class="hc-eyebrow">Enviar Vírus do Seu PC para ${esc(host.ip)}</span>
                <span class="mono" style="font-size:11px;color:var(--hc-text-3);">Sua banda: ${window.softwareEngine ? window.softwareEngine.getPlayerNetMbps() : 1} Mbps</span>
              </div>
              ${virusOpts.length === 0
                ? `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:12.5px;color:var(--hc-text-2);">
                     <span>Você ainda não baixou vírus para o seu PC. Descubra-os nos Enigmas da rede!</span>
                     <button type="button" class="hc-btn sm" onclick="window.internetEngine.navigate('109.64.200.10')">Ver Enigma →</button>
                   </div>`
                : `<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                     <select id="remoteVirusSelect" class="hc-input mono" style="flex: 1; min-width: 220px; height: 34px; font-size: 12px;">
                       ${virusOpts.map((vo) => `<option value="${vo.key}">${esc(vo.filename)} (${vo.versionStr}) — ${esc(vo.extraLabel)}</option>`).join('')}
                     </select>
                     <button type="button" id="btnUploadVirusStage" class="hc-btn primary sm" ${upJob ? 'disabled' : ''} onclick="window.internetEngine.stageSelectedVirusToCurrentHost()">
                       ${upJob ? 'Subindo...' : '1️⃣ Subir pro PC da Vítima'}
                     </button>
                     <button type="button" id="btnDeployRemoteVirus" class="hc-btn ghost sm" ${upJob ? 'disabled' : ''} onclick="window.internetEngine.deploySelectedVirusToCurrentHost()">
                       Subir + Rodar
                     </button>
                   </div>`}

              ${stagedOnTarget.length > 0 ? `
                <div id="stagedVirusesBox" style="margin-top:10px;padding:10px 12px;background:rgba(240,168,58,0.1);border:1px solid var(--hc-warning);border-radius:8px;display:flex;flex-direction:column;gap:6px;">
                  <div style="font-size:12px;color:var(--hc-warning-text);font-weight:600;">
                    Arquivo subido no disco da vítima — clique para rodar na memória dela:
                  </div>
                  ${stagedOnTarget.map((sv) => `
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-size:12.5px;">
                      <strong class="mono">/root/${esc(sv.filename)} (${window.softwareEngine.fmtVer(sv.versionInt)})</strong>
                      <button type="button" id="btnExecStagedVirus_${esc(sv.virusKey)}" class="hc-btn primary sm" onclick="window.internetEngine.executeStagedVirusOnCurrentHost('${esc(sv.virusKey)}', true)">
                        2️⃣ ▶ Executar no PC da Vítima
                      </button>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              ${installedOnTarget.length > 0 && myIpExposed ? `
                <div id="runningVirusesOnTargetBox" style="margin-top:8px;padding:8px 10px;background:rgba(53,184,119,0.1);border:1px solid rgba(53,184,119,0.3);border-radius:7px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px;">
                  <span style="color:var(--hc-accent-text);">Vírus rodando neste PC! Não esqueça de limpar seu IP da log.</span>
                  <button type="button" class="hc-btn sm" style="border-color:var(--hc-warning);color:var(--hc-warning);" onclick="window.internetEngine.sshSubTab='logs'; window.internetEngine.render();">
                    Ir p/ Logs ⚠️
                  </button>
                </div>
              ` : ''}
            </div>

            ${foreignViruses.length > 0 ? `
              <details class="nds-rules-drawer">
                <summary>📖 Regras de Funcionamento do Sequestro Tático de Zumbis (Botnet Hijacking C2 — 70%)</summary>
                <ol class="nds-rules-list">
                  <li><strong>Pré-Requisito:</strong> Vírus de rivais/Bots só aparecem na tabela abaixo quando você obtém acesso SSH/Root ao servidor e roda <code>Seeker.skr</code> nele.</li>
                  <li><strong>Divisão 70% / 30% &amp; Duração:</strong> Clicar em <strong>🏴‍☠️ Sequestrar C2 (70%)</strong> coleta na hora o buffer retido (<strong>+$ 480,00 em Dinheiro Sujo</strong>) e desvia <strong>70% dos rendimentos por 6 horas reais</strong> sem gastar upload (deixando 30% de fachada pro dono original).</li>
                  <li><strong>Limite &amp; Rastro Crítico:</strong> Máximo estrito de <strong>4 servidores sequestrados simultâneos</strong>; a ação grava <code>injected C2_KEY_HIJACK</code> no <code>/var/log/syslog</code> do alvo — limpe com Shred 7-Passos antes de sair!</li>
                </ol>
              </details>
            ` : ''}

            <!-- Gerenciador de Programas & Arquivos do PC da Vítima (Estilo Foto 2: Ícones Compactos + Mini-Aba Hover!) -->
            <div class="soft-frame" id="remoteTargetSpecsCard">
              <div class="soft-explorer-shell" style="min-height:360px;">
                <div class="soft-main-col">
                  ${host.kind === 'puzzle' && stealables.length === 0 ? `
                    <div class="soft-breadcrumb-bar" style="border-color:var(--hc-warning);color:var(--hc-warning-text);">
                      <span>Resolva o Enigma na aba <strong>Página</strong> para liberar o download do software recompensa aqui!</span>
                      <button type="button" class="hc-btn primary sm" onclick="window.internetEngine.switchTab('pagina')">Resolver Enigma →</button>
                    </div>
                  ` : ''}
                  <div class="soft-table-wrap" role="region" aria-label="Programas no PC invadido">
                    <table class="soft-table clean-hw-table">
                      <thead>
                        <tr>
                          <th class="soft-col-icon"></th>
                          <th>Nome do programa</th>
                          <th class="soft-col-ver">Versão</th>
                          <th class="soft-col-size">Tamanho</th>
                          <th class="soft-col-acts">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${remoteSoftRows.join('')}
                      </tbody>
                    </table>
                  </div>
                </div>

                <aside class="soft-side-bar">
                  ${donutHtml}

                  <div class="soft-bays-box">
                    <div class="soft-bay-row"><span>Disco Livre</span><span style="color:var(--hc-accent-text);">${specs.hddFreeMb} MB</span></div>
                    <div class="soft-bay-row"><span>RAM Livre</span><span style="color:var(--hc-accent-text);">${specs.ramFreeMb}/${specs.ramTotalMb} MB</span></div>
                    <div class="soft-bay-row"><span>CPU / Rede</span><span>${specs.cpuMhz}MHz · ${specs.netMbps}Mb</span></div>
                    <div class="soft-bay-row"><span>Antivírus</span><span>${specs.antivirusVer > 0 ? 'v' + specs.antivirusVer.toFixed(1) : 'Ausente'}</span></div>
                  </div>

                  <div class="soft-tool-tiles">
                    <button type="button" class="soft-tool-tile" onclick="window.internetEngine.createRemoteNoteOnHost('${esc(host.ip)}')">
                      ${HC.icon('file-plus')}
                      <span>Novo .txt</span>
                    </button>
                    <button type="button" class="soft-tool-tile" onclick="window.internetEngine.createRemoteFolderOnHost('${esc(host.ip)}')">
                      ${HC.icon('folder-plus')}
                      <span>Criar pasta</span>
                    </button>
                    ${window.stealthXhdEngine ? (!seekerRevealed
                      ? `<button type="button" id="btnRunRemoteSeeker" class="soft-tool-tile span-2" onclick="window.handleRunRemoteSeeker('${esc(host.ip)}')">
                           ${HC.icon('eye')}
                           <span>Revelar Ocultos (Seeker v${window.stealthXhdEngine.getSeekerVer().toFixed(1)})</span>
                         </button>`
                      : (!seekerClaimed
                          ? `<button type="button" id="btnClaimHiddenVault" class="soft-tool-tile span-2" style="border-color:var(--hc-accent);color:var(--hc-accent-text);" onclick="window.handleClaimHiddenVault('${esc(host.ip)}')">
                               ${HC.icon('sparkles')}
                               <span>Extrair Cofre Oculto</span>
                             </button>`
                          : '')) : ''}
                  </div>

                  <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
                    <button type="button" id="btnDrainRemoteVault" class="hc-btn ${host.bankBalance > 0 ? 'primary' : 'ghost'} sm block" ${host.bankBalance <= 0 ? 'disabled' : ''} onclick="window.internetEngine.drainRemoteHostFunds()">
                      Saque Local ($ ${host.bankBalance})
                    </button>
                    ${host.kind === 'empresa' && window.ecosystemHub ? `
                      <button type="button" id="btnPivotCorpLan" class="hc-btn ghost sm block" style="border-color:rgba(53,184,119,0.45);color:var(--hc-accent-text);" onclick="window.ecosystemHub.scanInternalCorporateLan('${esc(host.ip)}')">
                        🖧 Vasculhar Sub-rede 10.x
                      </button>
                    ` : ''}
                    ${['209.141.55.10', '161.89.2.1', '77.3.13.99', '161.89.1.1'].includes(host.ip) && window.topTenMechanics ? `
                      <button type="button" id="btnExtractRelicRing0" class="hc-btn sm block" style="border-color:rgba(168,85,247,0.65);color:#d8b4fe;" onclick="window.topTenMechanics.extractRelicBlockFromHost('${esc(host.ip)}')">
                        🧬 Extrair Relíquia Ring-0 (Seeker v3.0+)
                      </button>
                    ` : ''}
                    ${remoteBtcSats > 0 ? `
                      <button type="button" id="btnDrainRemoteBtc" class="hc-btn sm block" style="border-color:var(--hc-warning);color:var(--hc-warning-text);" onclick="window.internetEngine.drainCurrentHostBtcWallet()">
                        Roubar ${remoteBtcStr} BTC
                      </button>
                    ` : ''}
                  </div>
                </aside>
              </div>
            </div>
          </div>
        `;
      } else if (this.sshSubTab === 'cctv' && window.cctvEngine && window.cctvEngine.hostSupportsCctv(host)) {
        subContent = window.cctvEngine.renderRemoteCctvPanelHtml(host);
      } else {
        const specs = window.softwareEngine ? window.softwareEngine.inspectRemoteHostResources(host) : null;
        subContent = `
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div class="hc-card" style="padding: 1.1rem; font-family: var(--hc-font-mono); font-size: 0.82rem; display: flex; flex-direction: column; gap: 7px;">
              <div>HOST: <strong>${esc(host.hostname)}</strong> [${esc(host.ip)}]</div>
              <div>PROCESSADOR (CPU): <strong>${specs ? specs.cpuMhz.toLocaleString('pt-BR') + ' MHz' : esc(host.cpuSpec)}</strong></div>
              <div>INTERNET DO ALVO: <strong>${specs ? specs.netMbps + ' Mbit/s' : '10 Mbit/s'}</strong></div>
              <div>ARMAZENAMENTO (HDD): <strong>${specs ? `${specs.hddUsedMb} / ${specs.hddTotalMb} MB (${specs.hddFreeMb} MB livres)` : 'N/A'}</strong></div>
              <div>MEMÓRIA RAM: <strong>${specs ? `${specs.ramUsedMb} / ${specs.ramTotalMb} MB (${specs.ramFreeMb} MB livres)` : 'N/A'}</strong></div>
              <div>DEFESAS ATIVAS: Firewall.fwl v${(host.firewallVer || 1.0).toFixed(1)} · Hasher.hash v${(host.hasherVer || 1.0).toFixed(1)} · Antivirus.av ${specs && specs.antivirusVer > 0 ? 'v' + specs.antivirusVer.toFixed(1) : 'Ausente'}</div>
              ${role === 'root' ? `<div>SENHA ROOT: <strong style="color: var(--hc-accent-text);">${esc(host.rootPassword)}</strong></div>` : `<div>SENHA ROOT: <span style="color:var(--hc-warning);">OCULTA (Acesso via Exploit ${role.toUpperCase()})</span></div>`}
            </div>

            <div class="hc-card" style="padding:0.95rem 1.1rem;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
              <div style="font-size:0.8rem;color:var(--hc-text-2);">
                Ferramentas Remotas (<code>Analyzer.ana</code> &amp; <code>WebServer.exe</code>):
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button type="button" id="btnRunRemoteAnalyzer" class="hc-btn primary sm" onclick="window.internetEngine.runRemoteHardwareAnalyzer('${esc(host.ip)}')">
                  🔬 Analisar &amp; Salvar Hardware (Analyzer.ana)
                </button>
                <button type="button" id="btnRemoteDefaceHttp" class="hc-btn ghost sm" onclick="const m=prompt('Mensagem de Deface HTTP p/ ${esc(host.ip)}:80:','HACKED BY '+(window.currentProfile?.hacker_tag||'OPERADOR')); if(m) window.internetEngine.defaceRemoteWebPage('${esc(host.ip)}', m);">
                  🏴 Pichar Página HTTP (WebServer.exe)
                </button>
              </div>
            </div>
          </div>
        `;
      }

      const hasCctvTab = window.cctvEngine && window.cctvEngine.hostSupportsCctv(host);
      const activeCctvMsn = (window.missionsEngine && window.missionsEngine.ensureLoaded().activeMission);
      const cctvBadgeAlert = !!(activeCctvMsn && activeCctvMsn.type === 'cctv_hack' && activeCctvMsn.targetIp === host.ip);

      return `
        <div>
          <div class="ssh-root-bar">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              ${roleBadge}
              <span style="font-family: var(--hc-font-mono); font-size: 0.84rem;">${esc(role)}@${esc(host.ip)}:~#</span>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button type="button" id="btnSshSubTabLogs" class="hc-btn sm ${this.sshSubTab === 'logs' ? 'primary' : 'ghost'}" onclick="window.internetEngine.sshSubTab='logs'; window.internetEngine.render();">Logs (/var/log/syslog)${myIpExposed ? ' ⚠️' : ''}</button>
              <button type="button" id="btnSshSubTabFiles" class="hc-btn sm ${this.sshSubTab === 'files' ? 'primary' : 'ghost'}" onclick="window.internetEngine.sshSubTab='files'; window.internetEngine.render();">Vírus, Carteira &amp; Arquivos</button>
              ${hasCctvTab ? `
                <button type="button" id="btnSshSubTabCctv" class="hc-btn sm ${this.sshSubTab === 'cctv' ? 'primary' : 'ghost'}"
                  style="${this.sshSubTab !== 'cctv' ? 'border-color:rgba(53,184,119,0.5);color:var(--hc-accent-text);' : ''}"
                  onclick="window.internetEngine.sshSubTab='cctv'; window.internetEngine.render();">
                  ${HC.icon('video')} Câmeras Ao Vivo (CFTV)${cctvBadgeAlert ? ' 🎯' : ''}
                </button>
              ` : ''}
              <button type="button" id="btnSshSubTabHw" class="hc-btn sm ${this.sshSubTab === 'hw' ? 'primary' : 'ghost'}" onclick="window.internetEngine.sshSubTab='hw'; window.internetEngine.render();">Hardware &amp; Analyzer</button>
              <button type="button" class="hc-btn ghost sm" style="color: var(--hc-danger-text);" onclick="window.internetEngine.disconnectSsh()">Desconectar</button>
            </div>
          </div>
          ${subContent}
        </div>
      `;
    }

    renderWhoisDirectoryHtml(host) {
      const currentTier = host.whoisTier || 1;
      const myCrc = this.getPlayerCrackerVer();
      const q = (this.whoisSearch || '').trim().toLowerCase();
      const w = this.whoisQueryResult;

      // Catálogo completo de IPs públicos (para acessar & usar e para invadir)
      const publicServices = [
        { ip: '33.8.2.71', name: 'Download Center', role: 'service', iconCls: 'service', icon: 'download', tier: 1, useLabel: 'Baixar utilitários gratuitos v1.0 (Antivírus, Analyzer, Cracker)', fw: 1.0 },
        { ip: '71.4.5.1', name: 'HC Telecom ISP', role: 'service', iconCls: 'service', icon: 'wifi', tier: 1, useLabel: 'Consultar e renovar seu endereço IP público (1 troca grátis/semana)', fw: 3.0 },
        { ip: '77.3.9.21', name: 'Banco Colchão', role: 'service', iconCls: 'bank', icon: 'landmark', tier: 1, useLabel: 'Abrir conta, transferir dinheiro ou quebrar senhas de contas bancárias', fw: 2.5 },
        { ip: '185.220.101.9', name: 'Blackmarket Store', role: 'service', iconCls: 'service', icon: 'package', tier: 1, useLabel: 'Adquirir kits táticos, limpadores e Licenças P2P do Lab', fw: 1.5 },
        { ip: '185.220.101.77', name: 'hc://vazamentos (ZeroBin)', role: 'service', iconCls: 'service', icon: 'file-text', tier: 1, useLabel: 'Portal horário de senhas vazadas, rumores TIX e Iscas PGP', fw: 2.0 },
        { ip: '77.3.10.44', name: 'HEBC Clearing Bank', role: 'service', iconCls: 'bank', icon: 'landmark', tier: 2, useLabel: 'Banco comercial corporativo para contas secundárias e transferências', fw: 4.0 },
        { ip: '144.202.44.8', name: 'Bitcoin Market Exchange', role: 'service', iconCls: 'service', icon: 'bitcoin', tier: 3, useLabel: 'Comprar e vender Bitcoins na cotação em tempo real', fw: 3.5 },
        { ip: '109.64.211.37', name: 'Safenet Authority', role: 'service', iconCls: 'gov', icon: 'shield', tier: 3, useLabel: 'Consultar IPs rastreados por transferências e invasões sem limpeza', fw: 3.5 },
        { ip: '77.3.12.15', name: 'Swiss Offshore Vault', role: 'service', iconCls: 'bank', icon: 'landmark', tier: 4, useLabel: 'Cofre bancário suíço de alto sigilo para proteger grandes valores', fw: 6.0 },
        { ip: '161.89.1.1', name: 'FBI Mainframe Central', role: 'service', iconCls: 'gov', icon: 'shield-alert', tier: 4, useLabel: 'Mural federal de procurados e terminal restrito de dossiês criminais', fw: 9.0 }
      ];

      const publicTargets = [
        { ip: '198.51.100.42', name: 'Treinamento Numataka', role: 'target', iconCls: 'corp', icon: 'building-2', tier: 1, useLabel: 'Servidor inicial de treino sem antivírus · Reserva $65', fw: 1.0 },
        { ip: '203.17.88.40', name: 'Farofa Systems (CFTV 4x)', role: 'target', iconCls: 'corp', icon: 'video', tier: 1, useLabel: 'Empresa B2B com 4 Câmeras de Segurança Ao Vivo · Reserva $185', fw: 1.0 },
        { ip: '194.88.14.202', name: 'Meridian BioLabs (CFTV P&D)', role: 'target', iconCls: 'corp', icon: 'video', tier: 1, useLabel: 'Laboratório BioTech com Câmeras Ao Vivo da Sala Limpa · Reserva $290', fw: 1.0 },
        { ip: '172.66.40.18', name: 'Aegis Security (Matriz 6 Câmeras)', role: 'target', iconCls: 'corp', icon: 'camera', tier: 1, useLabel: 'Central de Segurança operando todos os 6 Modelos CFTV Ao Vivo · Reserva $310', fw: 1.0 },
        { ip: '133.70.13.37', name: 'Rádio Pirata 1337 FM', role: 'target', iconCls: 'corp', icon: 'zap', tier: 1, useLabel: 'Estação comunitária · Boa para treinar upload de vírus · Reserva $110', fw: 1.0 },
        { ip: '187.22.5.60', name: 'Boteco h4x0r', role: 'target', iconCls: 'corp', icon: 'message-square', tier: 1, useLabel: 'Ponto de encontro underground · Antivírus básico v1.0 · Reserva $260', fw: 1.5 },
        { ip: '58.40.12.9', name: 'Corvo Cinza Logística (CFTV Doca)', role: 'target', iconCls: 'corp', icon: 'video', tier: 2, useLabel: 'Transportadora com CFTV na Doca Subterrânea & AGV · Reserva $340', fw: 1.5 },
        { ip: '189.40.7.12', name: 'KronoTech Sistemas (CFTV)', role: 'target', iconCls: 'corp', icon: 'cpu', tier: 2, useLabel: 'Corporação de médio porte · Data Center & Cofre CFTV · Reserva $680', fw: 2.5 },
        { ip: '192.99.44.80', name: 'OmniDyne Defense', role: 'target', iconCls: 'gov', icon: 'radar', tier: 3, useLabel: 'Contratante militar com link gigabit · Reserva $1.450', fw: 4.5 },
        { ip: '209.141.55.10', name: 'EvilCorp Conglomerate', role: 'target', iconCls: 'corp', icon: 'building-2', tier: 4, useLabel: 'Conglomerado global de alta segurança · Reserva $4.200', fw: 7.0 },
        { ip: '161.89.2.1', name: 'NSA Signal Intelligence', role: 'target', iconCls: 'gov', icon: 'shield-alert', tier: 4, useLabel: 'Agência de inteligência de sinais · Desafio máximo de força-bruta', fw: 9.5 }
      ];

      const puzzleNodes = (window.puzzleTrailEngine ? window.puzzleTrailEngine.getAllNodes() : []).slice(0, 8).map((p) => {
        const solved = window.puzzleTrailEngine ? window.puzzleTrailEngine.isSolved(p.index) : false;
        const pTier = p.index <= 2 ? 1 : (p.index <= 4 ? 2 : (p.index <= 6 ? 3 : 4));
        return {
          ip: p.ip,
          name: `${p.hostname}`,
          role: 'puzzle',
          iconCls: 'puzzle',
          icon: 'lock',
          tier: pTier,
          solved,
          useLabel: `${solved ? 'Enigma resolvido · Entre para baixar o software liberado' : 'Resolva o enigma na página pública para destravar vírus e softwares grátis'}`,
          fw: 1.0
        };
      });

      const onlinePlayers = ((window.onlineEngine ? window.onlineEngine.getUnifiedOnlinePlayers() : []).slice(0, 8)).map((hp) => ({
        ip: hp.publicIp,
        name: hp.hackerTag,
        role: 'player',
        iconCls: '',
        icon: 'user',
        tier: 1,
        useLabel: `Operador ativo na rede · ${(hp.reputation || 100).toLocaleString('pt-BR')} REP`,
        fw: Number(hp.firewallVer || 1.0)
      }));

      const matchQuery = (item) => {
        if (!q) return true;
        return item.ip.toLowerCase().includes(q) ||
               item.name.toLowerCase().includes(q) ||
               item.useLabel.toLowerCase().includes(q);
      };

      const filterByTier = (list) => {
        if (q || this.whoisCategory !== 'overview') return list.filter(matchQuery);
        return list.filter((it) => it.tier === currentTier || (currentTier === 1 && it.tier === 1));
      };

      const renderRow = (item, primaryAccess) => {
        const saved = window.hackedDb ? window.hackedDb.getEntry(item.ip) : null;
        const isFav = this.favorites.has(item.ip);
        const canCrack = myCrc > 0 && myCrc >= item.fw;
        return `
          <div class="whois-row">
            <div class="whois-row-main">
              <div class="whois-row-icon ${item.iconCls || ''}">${HC.icon(item.icon)}</div>
              <div class="whois-row-info">
                <div class="whois-row-top">
                  <span class="whois-row-ip" onclick="window.internetEngine.navigate('${esc(item.ip)}', 'pagina')">${esc(item.ip)}</span>
                  <span class="whois-row-name">${esc(item.name)}</span>
                  ${saved ? '<span class="hc-badge success">Acesso salvo</span>' : ''}
                  ${item.solved ? '<span class="hc-badge violet">Enigma concluído</span>' : ''}
                  <span class="hc-badge ${canCrack ? 'success' : ''}" title="Versão do Firewall deste servidor">FW v${item.fw.toFixed(1)}</span>
                </div>
                <div class="whois-row-desc">${esc(item.useLabel)}</div>
              </div>
            </div>
            <div class="whois-row-actions">
              <button type="button" class="hc-btn ${primaryAccess ? 'primary' : ''} sm" onclick="window.internetEngine.navigate('${esc(item.ip)}', 'pagina')">
                ${primaryAccess ? 'Acessar' : 'Ver site'}
              </button>
              <button type="button" class="hc-btn ${primaryAccess ? 'ghost' : 'primary'} sm" style="${primaryAccess ? 'border-color:var(--hc-border);' : ''}" onclick="window.internetEngine.navigate('${esc(item.ip)}', 'invadir')">
                Invadir
              </button>
              <button type="button" class="inet-bm-star ${isFav ? 'fav' : ''}" onclick="window.internetEngine.toggleFavoriteIp('${esc(item.ip)}', event)" title="${isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}">
                ${isFav ? '★' : '☆'}
              </button>
            </div>
          </div>
        `;
      };

      const renderHubLine = (item) => {
        const isFav = this.favorites.has(item.ip);
        return `
          <div class="hub-site-line whois-row">
            <button type="button" class="hub-site-link"
              data-tip-title="${esc(item.name)}" data-tip-meta="FW v${item.fw.toFixed(1)}" data-tip-desc="${esc(item.useLabel)}"
              onclick="window.internetEngine.navigate('${esc(item.ip)}', 'pagina')">
              <span class="hub-site-ip">${esc(item.ip)}</span>
              <span class="hub-site-sep">-</span>
              <span class="hub-site-title">${esc(item.name)}</span>
            </button>
            <div class="hub-site-mini-acts">
              <button type="button" class="hub-mini-hack"
                data-tip-title="Invadir ${esc(item.name)}" data-tip-meta="${esc(item.ip)}" data-tip-desc="Abrir direto a aba Invadir deste endereço IP."
                onclick="window.internetEngine.navigate('${esc(item.ip)}', 'invadir')">Invadir</button>
              <button type="button" class="inet-bm-star ${isFav ? 'fav' : ''}"
                data-tip-title="${isFav ? 'Remover dos Favoritos' : 'Favoritar IP'}" data-tip-meta="${esc(item.ip)}" data-tip-desc="Salva ou remove este IP da sua lista lateral de favoritos."
                onclick="window.internetEngine.toggleFavoriteIp('${esc(item.ip)}', event)">${isFav ? '★' : '☆'}</button>
            </div>
          </div>
        `;
      };

      // Links essenciais que já aparecem logo ao entrar no Hub Inicial (Puzzle inicial, Banco, FBI, Safenet, Downloads, ISP, etc.)
      const essentialHubLinks = [
        { ip: '33.8.2.71', name: 'Download Center', fw: 1.0, useLabel: 'Baixe gratuitamente utilitários iniciais v1.0 (Antivírus, Analyzer, WebServer).' },
        { ip: '185.220.101.9', name: 'Torrent & Blackmarket', fw: 1.5, useLabel: 'Mercado clandestino de kits de exploit e limpadores policiais.' },
        { ip: '109.64.200.10', name: 'First Puzzle (Enigma #1)', fw: 1.0, useLabel: 'Desafio inicial obrigatório para destravar vírus gratuitos e próximos IPs.' },
        { ip: '77.3.9.21', name: 'First International Bank', fw: 2.5, useLabel: 'Portal bancário central para contas, transferências e invasão de cofres.' },
        { ip: '109.64.211.37', name: 'Safenet Authority', fw: 3.5, useLabel: 'Órgão de rastreamento de IPs expostos em transferências sem limpeza.' },
        { ip: '161.89.1.1', name: 'FBI Cybercrime Mainframe', fw: 9.0, useLabel: 'Lista oficial de procurados federais e terminal restrito de mandados.' },
        { ip: '198.51.100.42', name: 'Treinamento Numataka', fw: 1.0, useLabel: 'Servidor inicial de treinamento prático de invasão e limpeza de logs.' }
      ];

      const trendingHubLinks = [
        { ip: '71.4.5.1', name: 'ISP - Provedor de Internet', fw: 3.0, useLabel: 'Gerencie e troque gratuitamente seu endereço IP público (1x por semana).' },
        { ip: '203.17.88.40', name: 'Farofa Systems (CFTV Ao Vivo)', fw: 1.0, useLabel: 'Empresa corporativa com NVR de 4 Câmeras de Segurança Ao Vivo.' },
        { ip: '194.88.14.202', name: 'Meridian BioLabs (CFTV P&D)', fw: 1.0, useLabel: 'Laboratório restrito com Câmeras Ao Vivo de Sala Limpa e Cofre.' },
        { ip: '172.66.40.18', name: 'Aegis Security (6 Câmeras CFTV)', fw: 1.0, useLabel: 'Central corporativa operando os 6 modelos de vídeo CFTV simultâneos.' },
        { ip: '58.40.12.9', name: 'Corvo Cinza Logística (CFTV)', fw: 1.5, useLabel: 'Doca subterrânea com empilhadeira AGV e câmeras industriais.' },
        { ip: '144.202.44.8', name: 'Bitcoin Market', fw: 3.5, useLabel: 'Câmbio em tempo real para comprar e vender Bitcoins minerados.' },
        { ip: '161.89.2.1', name: 'NSA Signal Intelligence', fw: 9.5, useLabel: 'Agência de inteligência de sinais — defesa máxima da rede.' }
      ];

      let contentBlocks = '';
      if (this.whoisCategory === 'services') {
        const list = publicServices.filter(matchQuery);
        contentBlocks = `<div class="whois-list">${list.map((i) => renderRow(i, true)).join('') || '<div style="padding:20px;text-align:center;color:var(--hc-text-3);">Nenhum serviço encontrado.</div>'}</div>`;
      } else if (this.whoisCategory === 'targets') {
        const list = publicTargets.filter(matchQuery);
        contentBlocks = `<div class="whois-list">${list.map((i) => renderRow(i, false)).join('') || '<div style="padding:20px;text-align:center;color:var(--hc-text-3);">Nenhum alvo encontrado.</div>'}</div>`;
      } else if (this.whoisCategory === 'puzzles') {
        const list = puzzleNodes.filter(matchQuery);
        contentBlocks = `<div class="whois-list">${list.map((i) => renderRow(i, true)).join('') || '<div style="padding:20px;text-align:center;color:var(--hc-text-3);">Nenhum enigma encontrado.</div>'}</div>`;
      } else if (this.whoisCategory === 'players') {
        const list = onlinePlayers.filter(matchQuery);
        contentBlocks = `<div class="whois-list">${list.map((i) => renderRow(i, false)).join('') || '<div style="padding:20px;text-align:center;color:var(--hc-text-3);">Nenhum operador encontrado.</div>'}</div>`;
      } else {
        const colLeft = currentTier === 1 && !q
          ? essentialHubLinks
          : filterByTier(publicServices);
        const colRight = currentTier === 1 && !q
          ? trendingHubLinks
          : [...filterByTier(puzzleNodes.slice(0, 3)), ...filterByTier(publicTargets)];

        contentBlocks = `
          <div class="hub-two-cols" id="inetHubTwoCols">
            <div class="hub-col">
              <div class="hub-col-head">
                ${HC.icon('globe')} <span>Serviços &amp; Locais Essenciais</span>
              </div>
              ${colLeft.map((it) => renderHubLine(it)).join('')}
            </div>

            <div class="hub-col">
              <div class="hub-col-head">
                ${HC.icon('trending-up')} <span>Em Alta &amp; Servidores Públicos</span>
              </div>
              ${colRight.map((it) => renderHubLine(it)).join('')}
            </div>
          </div>
        `;
      }

      const whoisTiers = [
        ['71.4.20.1', 1, 'First Whois'],
        ['71.4.20.2', 2, 'Second Whois'],
        ['71.4.20.3', 3, 'Third Whois'],
        ['71.4.20.4', 4, 'Fourth Whois']
      ];

      return `
        <div class="whois-portal">
          <div class="hub-welcome-banner">
            <div>
              <div style="font-size:13.5px;font-weight:700;color:var(--hc-text);">
                Bem-vindo ao Hub Inicial da Rede (<span style="color:var(--hc-accent-text);">${esc(host.hostname)}</span>)
              </div>
              <div style="font-size:12px;color:var(--hc-text-2);margin-top:2px;">
                Clique em qualquer link essencial abaixo ou digite um IP avulso na barra superior para acessar ou invadir.
              </div>
            </div>
            <div class="whois-tier-pills" role="group" aria-label="Diretórios Whois">
              ${whoisTiers.map(([tIp, tNum, tLbl]) => `
                <button type="button" class="whois-tier-btn ${currentTier === tNum && this.whoisCategory === 'overview' && !q ? 'active' : ''}" onclick="window.internetEngine.whoisCategory='overview'; window.internetEngine.whoisSearch=''; window.internetEngine.navigate('${tIp}', 'pagina');">
                  ${tLbl}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="hc-tabs">
            <button type="button" class="hc-tab ${this.whoisCategory === 'overview' ? 'active' : ''}" onclick="window.internetEngine.setWhoisCategory('overview')">Hub Inicial (Resumo)</button>
            <button type="button" class="hc-tab ${this.whoisCategory === 'services' ? 'active' : ''}" onclick="window.internetEngine.setWhoisCategory('services')">Serviços (${publicServices.length})</button>
            <button type="button" class="hc-tab ${this.whoisCategory === 'targets' ? 'active' : ''}" onclick="window.internetEngine.setWhoisCategory('targets')">Empresas &amp; Alvos (${publicTargets.length})</button>
            <button type="button" class="hc-tab ${this.whoisCategory === 'puzzles' ? 'active' : ''}" onclick="window.internetEngine.setWhoisCategory('puzzles')">Enigmas (${puzzleNodes.length})</button>
            <button type="button" class="hc-tab ${this.whoisCategory === 'players' ? 'active' : ''}" onclick="window.internetEngine.setWhoisCategory('players')">Jogadores Online (${onlinePlayers.length})</button>
          </div>

          ${contentBlocks}
        </div>
      `;
    }

    renderInvadirTab(host) {
      if (host.kind === 'self') {
        return `<div class="hc-card" style="padding: 18px; color: var(--hc-text-2);">Este é o seu próprio endereço IP (${esc(host.ip)}). Use o menu lateral para gerenciar seu computador.</div>`;
      }

      const crcVer = this.getPlayerCrackerVer();
      const ftpVer = this.getPlayerFtpExploitVer();
      const sshVer = this.getPlayerSshExploitVer();
      const speedFactor = this.getCpuSpeedFactor();
      const portScanActive = window.softwareEngine ? window.softwareEngine.isPortScanActive() : true;
      const scanVer = (window.softwareEngine && window.softwareEngine.ensureLoaded().inventory.scan)
        ? ((window.softwareEngine.ensureLoaded().inventory.scan.versionInt || 10) / 10)
        : 1.0;

      const reqHasher = host.hasherVer || 1.0;
      const reqFwl = host.firewallVer || 1.0;
      const reqBfMin = Math.max(reqFwl, reqHasher);
      const canBruteforce = crcVer > 0 && crcVer >= reqFwl && crcVer >= reqHasher;

      const canFtpExp = ftpVer > 0 && ftpVer >= reqFwl;
      const canSshExp = sshVer > 0 && sshVer >= reqFwl;
      const canAnyExp = canFtpExp || canSshExp;

      const scanned = this.portScannedIps.has(host.ip);
      const saved = window.hackedDb ? window.hackedDb.getEntry(host.ip) : null;
      const targetAv = host.antivirusVer !== undefined ? host.antivirusVer : 0;
      const canEnterSomehow = canBruteforce || canAnyExp;

      const inlineAttackBars = window.taskManager ? window.taskManager.renderInlineActiveBarsHtml(host.ip) : '';

      return `
        <div class="inet-attack-wrap">
          ${inlineAttackBars}
          ${window.topTenMechanics && typeof window.topTenMechanics.renderInvadirEliteTacticalStripHtml === 'function'
            ? window.topTenMechanics.renderInvadirEliteTacticalStripHtml(host)
            : ''}

          <div class="inet-attack-heading">Escolha seu método de ataque:</div>

          <div class="inet-attack-grid">
            <div class="inet-attack-card ${canBruteforce ? 'ready' : ''}" id="cardAttackBruteforce">
              <div class="inet-attack-icon">${HC.icon('key-round', 'lg')}</div>
              <strong style="font-size: 15px; color: var(--hc-text);">Ataque força-bruta</strong>
              <div class="inet-attack-reqs">
                <span title="Seu melhor Hash/Cracker no disco vs Exigido" style="color: ${canBruteforce ? 'var(--hc-accent-text)' : 'var(--hc-danger-text)'};">
                  ${HC.icon('key-round')} ${crcVer > 0 ? crcVer.toFixed(1) : '0.0'} / ${reqBfMin.toFixed(1)}
                </span>
              </div>
              <div style="font-size: 12px; color: var(--hc-text-3); min-height: 32px;">
                ${canBruteforce
                  ? `Roda em 2º plano · Escolha qual hash usar (HD/SSD/NVMe)`
                  : (crcVer <= 0 ? 'Baixe um Cracker no Download Center' : `Requer Cracker v${reqBfMin.toFixed(1)} ou superior`)}
              </div>
              <button type="button" id="btnInetBruteforce" class="hc-btn ${canBruteforce ? 'primary' : ''} block" onclick="window.internetEngine.startBruteforce()">
                Quebrar senha
              </button>
            </div>

            <div class="inet-attack-card ${canAnyExp ? 'ready' : ''}" id="cardAttackExploit">
              <div class="inet-attack-icon">${HC.icon('terminal', 'lg')}</div>
              <strong style="font-size: 15px; color: var(--hc-text);">Ataque exploit</strong>
              <div class="inet-attack-reqs">
                <span style="color: ${canFtpExp ? 'var(--hc-accent-text)' : 'var(--hc-text-3)'};">FTP ${ftpVer > 0 ? ftpVer.toFixed(1) : '0.0'}</span>
                <span>·</span>
                <span style="color: ${canSshExp ? 'var(--hc-accent-text)' : 'var(--hc-text-3)'};">SSH ${sshVer > 0 ? sshVer.toFixed(1) : '0.0'}</span>
              </div>
              <div style="font-size: 12px; color: var(--hc-text-3); min-height: 32px;">
                ${canAnyExp
                  ? `Entra sem senha após rodar o Port scan`
                  : `Requer Exploit v${reqFwl.toFixed(1)}+ e Port scan`}
              </div>
              <button type="button" id="btnInetExploit" class="hc-btn ${canAnyExp ? 'primary' : ''} block" onclick="window.internetEngine.startExploitAttack()">
                Explorar brecha
              </button>
            </div>
          </div>

          <div class="inet-portscan-bar">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <span class="mono" style="font-size: 12.5px; font-weight: 600; color: var(--hc-text); display: inline-flex; align-items: center; gap: 6px;">
                ${HC.icon('radar')} Port scan · v${scanVer.toFixed(1)}
              </span>
              <span class="mono" style="font-size: 11.5px; color: var(--hc-text-3);">
                ${!portScanActive
                  ? 'Desligado na memória'
                  : (scanned
                      ? `21/ftp ${canFtpExp ? 'aberta' : 'FW v' + reqFwl.toFixed(1)} · 22/ssh ${canSshExp ? 'aberta' : 'FW v' + reqFwl.toFixed(1)}`
                      : 'Portas ainda não escaneadas')}
              </span>
            </div>
            <button type="button" id="btnInetPortScan" class="hc-btn sm" onclick="window.internetEngine.runPortScan()">Rodar port scan</button>
          </div>

          <!-- Resumo compacto de defesa do alvo (mantém #inetHostDefenseCompareBox para o Tour) -->
          <div id="inetHostDefenseCompareBox" class="hc-card" style="padding: 11px 15px; display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; background: var(--hc-inset);">
            <div style="font-size: 12px; color: var(--hc-text-2);">
              Defesa do alvo: <strong class="mono">Firewall v${reqFwl.toFixed(1)}</strong> · <strong class="mono">Hasher v${reqHasher.toFixed(1)}</strong> · <strong class="mono">${targetAv > 0 ? 'AV v' + targetAv.toFixed(1) : 'Sem AV'}</strong>
            </div>
            ${saved
              ? `<span class="hc-badge success" style="cursor:pointer;" onclick="window.internetEngine.switchTab('entrar')">Senha salva: ${esc(saved.password)} →</span>`
              : `<span class="hc-badge ${canEnterSomehow ? 'success' : 'warning'}">${canEnterSomehow ? 'Alcance compatível' : 'Defesa superior'}</span>`}
          </div>

          ${window.ddosOverloadEngine ? (() => {
            const myDdosGbps = window.ddosOverloadEngine.getPlayerTotalDdosGbps();
            const reqDdosGbps = window.ddosOverloadEngine.getTargetMitigationGbps(host);
            const targetHwPct = window.ddosOverloadEngine.getTargetHealthPct(host.ip);
            const canDdos = myDdosGbps >= reqDdosGbps;
            return `
              <div id="cardAttackDdosOverload" class="hc-card" style="padding: 11px 15px; display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; background: var(--hc-inset);">
                <div style="font-size: 12px; color: var(--hc-text-2);">
                  <strong>Sobrecarga DDoS</strong> · Seu poder: <span class="mono" style="color:${canDdos ? 'var(--hc-accent-text)' : 'var(--hc-text)'};">${myDdosGbps} Gbps</span> / Mitigação <span class="mono">${reqDdosGbps} Gbps</span> (Saúde ${targetHwPct}%)
                </div>
                <button type="button" id="btnInetLaunchDdosStrike" class="hc-btn ${canDdos ? 'danger' : 'ghost'} sm" onclick="window.ddosOverloadEngine.launchDdosOverloadOnHost('${esc(host.ip)}')">
                  Disparar DDoS
                </button>
              </div>
            `;
          })() : ''}
        </div>
      `;
    }

    render(containerId = 'internetAppBody') {
      const container = document.getElementById(containerId);
      if (!container) return;

      const host = this.resolveHost(this.currentIp);
      const isFav = this.favorites.has(this.currentIp);
      const isAtHome = this.currentIp === '71.4.20.1' && this.activeTab === 'pagina';

      // Status compacto de Rota/Bounce na barra de endereço
      let routeProtected = false;
      let routeHopsCount = 0;
      if (window.bounceEngine && host && !host.notFound && host.kind !== 'self') {
        window.bounceEngine.ensureLoaded();
        const validHops = window.bounceEngine.state.enabled ? window.bounceEngine.getValidHopsForTarget(host.ip) : [];
        routeProtected = window.bounceEngine.state.enabled && validHops.length > 0;
        routeHopsCount = validHops.length;
      }

      let mainPanelHtml = '';
      if (host.notFound) {
        mainPanelHtml = `
          <div class="inet-viewport">
            <div class="hc-empty-box" style="padding: 48px 20px;">
              <div class="hc-empty-icon">${HC.icon('globe')}</div>
              <strong>Servidor não encontrado (${esc(host.ip)})</strong>
              <p>${esc(host.reason)}</p>
              <button type="button" class="hc-btn primary" style="margin-top: 8px;" onclick="window.internetEngine.goHome()">Voltar ao First Whois</button>
            </div>
          </div>
        `;
      } else {
        const tabBody = this.activeTab === 'pagina'
          ? this.renderPublicPageTab(host)
          : (this.activeTab === 'entrar' ? this.renderLoginOrRootTab(host) : this.renderInvadirTab(host));

        const connectedDot = this.activeSshIp === host.ip
          ? `<span style="width:6px;height:6px;border-radius:50%;background:var(--hc-success);display:inline-block;"></span>`
          : '';

        mainPanelHtml = `
          <div class="inet-host-banner">
            <div class="inet-host-id">
              <div class="inet-host-icon">${HC.icon(this.getHostIconName(host), 'lg')}</div>
              <div>
                <div class="inet-ip-row">
                  <span class="inet-ip-code">${esc(host.ip)}</span>
                  <button type="button" class="inet-fav-btn ${isFav ? 'active' : ''}" onclick="window.internetEngine.toggleFavoriteCurrent()" title="${isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}">${isFav ? '★' : '☆'}</button>
                  <span class="hc-badge">${esc(host.badge)}</span>
                </div>
                <div class="inet-host-name">${esc(host.hostname)}</div>
              </div>
            </div>
            <div>
              <span class="hc-badge ${host.online ? 'success' : 'danger'}">${host.online ? '● Online' : '○ Offline'}</span>
            </div>
          </div>

          <div class="inet-tabs" id="inetBrowserTabs">
            <button type="button" id="btnInetTabPagina" class="inet-tab ${this.activeTab === 'pagina' ? 'active' : ''}" onclick="window.internetEngine.switchTab('pagina')">${HC.icon('globe')} <span>Página</span></button>
            <button type="button" id="btnInetTabEntrar" class="inet-tab ${this.activeTab === 'entrar' ? 'active' : ''}" onclick="window.internetEngine.switchTab('entrar')">${HC.icon('terminal')} <span>Entrar</span> ${connectedDot}</button>
            <button type="button" id="btnInetTabInvadir" class="inet-tab ${this.activeTab === 'invadir' ? 'active' : ''}" onclick="window.internetEngine.switchTab('invadir')">${HC.icon('zap')} <span>Invadir</span></button>
          </div>

          <div class="inet-viewport">${tabBody}</div>
        `;
      }

      const renderSideEntry = (ip, customLabel) => {
        const h = this.resolveHost(ip);
        const label = customLabel || (h && !h.notFound ? h.hostname : ip);
        const fav = this.favorites.has(ip);
        const isCurrent = ip === this.currentIp;
        return `
          <div class="inet-side-row ${isCurrent ? 'current' : ''}">
            <button type="button" class="inet-bm-item" onclick="window.internetEngine.navigate('${esc(ip)}')">
              <span class="inet-bm-mini-icon">${HC.icon(this.getHostIconName(h))}</span>
              <span class="inet-bm-text">
                <span class="inet-bm-ip">${esc(ip)}</span>
                <span class="inet-bm-label">${esc(label)}</span>
              </span>
            </button>
            <button type="button" class="inet-bm-star ${fav ? 'fav' : ''}" onclick="window.internetEngine.toggleFavoriteIp('${esc(ip)}', event)" title="${fav ? 'Remover favorito' : 'Adicionar favorito'}">${fav ? '★' : '☆'}</button>
          </div>
        `;
      };

      const favList = Array.from(this.favorites);
      const visits = Array.isArray(this.recentVisits) && this.recentVisits.length > 0
        ? this.recentVisits
        : this.recentIps.map((ip) => ({ ip, ts: Date.now() }));

      const renderVisitEntry = (v) => {
        const h = this.resolveHost(v.ip);
        const label = h && !h.notFound ? h.hostname : v.ip;
        const fav = this.favorites.has(v.ip);
        const isCurrent = v.ip === this.currentIp;
        const ageStr = this.formatVisitRelativeTime(v.ts);
        return `
          <div class="inet-side-row ${isCurrent ? 'current' : ''}">
            <button type="button" class="inet-bm-item" onclick="window.internetEngine.navigate('${esc(v.ip)}')">
              <span class="inet-bm-mini-icon">${HC.icon(this.getHostIconName(h))}</span>
              <span class="inet-bm-text">
                <span class="inet-bm-ip">${esc(v.ip)}</span>
                <span class="inet-bm-label">${esc(label)}</span>
              </span>
            </button>
            <span class="inet-visit-age">${esc(ageStr)}</span>
            <button type="button" class="inet-bm-star ${fav ? 'fav' : ''}" onclick="window.internetEngine.toggleFavoriteIp('${esc(v.ip)}', event)" title="${fav ? 'Remover favorito' : 'Favoritar IP'}">${fav ? '★' : '☆'}</button>
          </div>
        `;
      };

      container.innerHTML = `
        <div class="inet-browser-frame">
          <div class="inet-navbar">
            <button type="button" class="inet-nav-btn" ${this.historyIdx <= 0 ? 'disabled' : ''} onclick="window.internetEngine.goBack()" title="Voltar">${HC.icon('arrow-left')}</button>
            <button type="button" class="inet-nav-btn" ${this.historyIdx >= this.history.length - 1 ? 'disabled' : ''} onclick="window.internetEngine.goForward()" title="Avançar">${HC.icon('arrow-right')}</button>

            <div class="inet-addr-wrap">
              <span class="inet-addr-label">Endereço IP:</span>
              <input type="text" id="inetAddressInput" class="inet-addr-input" value="${esc(this.currentIp)}" placeholder="Digite um IP avulso (ex: 1.2.3.4, 203.17.88.40)..." onkeydown="if(event.key==='Enter') window.internetEngine.navigate(this.value)">
              ${window.bounceEngine ? `
                <button type="button" id="btnOpenBounceBuilder" class="inet-route-chip ${routeProtected ? 'protected' : ''}" onclick="window.bounceEngine.openBuilderModal()" title="${routeProtected ? 'Disfarce de IP ativo — clique para ajustar saltos' : 'Conexão direta — clique para configurar disfarce de IP'}">
                  ${HC.icon('shield')}
                  <span>${routeProtected ? `${routeHopsCount} salto${routeHopsCount > 1 ? 's' : ''}` : 'Rota direta'}</span>
                </button>
              ` : ''}
            </div>

            <button type="button" id="btnInetGo" class="inet-go-btn" onclick="window.internetEngine.navigate(document.getElementById('inetAddressInput').value)">
              ${HC.icon('search')} <span>Buscar IP</span>
            </button>
            <button type="button" id="btnInetHomeWhois" class="inet-nav-btn ${isAtHome ? 'active-home' : ''}" onclick="window.internetEngine.goHome()" title="Voltar ao Hub Inicial (First Whois)">${HC.icon('house')}</button>
            <button type="button" class="inet-nav-btn" onclick="window.internetEngine.render()" title="Atualizar página">${HC.icon('refresh-cw')}</button>
            <button type="button" id="btnTopFavCurrentIp" class="inet-nav-btn ${isFav ? 'active-home' : ''}" onclick="window.internetEngine.toggleFavoriteCurrent()" title="${isFav ? 'Remover IP atual dos Favoritos' : 'Favoritar este IP'}">${HC.icon('star')}</button>
          </div>

          <div class="inet-shell">
            <div class="inet-main-panel">
              ${mainPanelHtml}
            </div>

            <aside class="inet-side" aria-label="Histórico de IPs e Favoritos">
              <!-- Card 1: Histórico de IPs Acessados (igual Recently visited da Foto 2) -->
              <div class="inet-side-card" id="inetRecentHistoryCard">
                <div class="inet-side-card-head">
                  <div class="inet-side-group-title" style="padding:0;">${HC.icon('clock')} <span>Histórico de IPs</span></div>
                  <button type="button" style="background:transparent;border:0;color:var(--hc-text-3);font-size:10.5px;cursor:pointer;" onclick="window.internetEngine.clearRecentHistory()">Limpar</button>
                </div>
                ${visits.map((v) => renderVisitEntry(v)).join('')}
              </div>

              <!-- Card 2: IPs Favoritos & Importantes (igual Important IPs da Foto 2) -->
              <div class="inet-side-card" id="inetFavoritesCard">
                <div class="inet-side-card-head">
                  <div class="inet-side-group-title" style="padding:0;">${HC.icon('star')} <span>Meus Favoritos</span></div>
                  <span class="inet-side-count-pill">${favList.length}</span>
                </div>
                ${favList.length === 0
                  ? `<div style="font-size: 11.5px; color: var(--hc-text-3); padding: 6px 4px;">Clique na estrela ☆ ao lado de qualquer IP para salvar aqui.</div>`
                  : favList.map((fIp) => renderSideEntry(fIp)).join('')}
              </div>

              <div class="inet-side-card">
                <div class="inet-side-card-head">
                  <div class="inet-side-group-title" style="padding:0;">${HC.icon('landmark')} <span>Atalhos do Jogo</span></div>
                </div>
                ${IMPORTANT_BOOKMARKS.map((b) => renderSideEntry(b.ip, b.label)).join('')}
              </div>
            </aside>
          </div>
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
    let msnRes = null;
    if (window.missionsEngine) {
      msnRes = window.missionsEngine.notifyRemoteFileAction(ip, fileName, actionKind);
    }
    if ((!msnRes || (!msnRes.downloaded && !msnRes.deleted)) && typeof window.showToast === 'function') {
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

  window.handleInetBtcTrade = async function (mode) {
    if (!window.bitcoinEngine) return;
    let res;
    if (mode === 'buy') {
      const val = document.getElementById('inetBtcBuyUsd')?.value;
      res = await window.bitcoinEngine.buyBtcWithCash(val);
    } else {
      const val = document.getElementById('inetBtcSellAmt')?.value;
      res = window.bitcoinEngine.sellBtcForCash(val);
    }
    if (!res || !res.success) {
      if (window.showToast) window.showToast((res && res.message) || 'Operação não concluída.');
      return;
    }
    if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
    if (window.internetEngine) window.internetEngine.render();
    if (window.showToast) window.showToast(res.message);
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
