/**
 * ============================================================================
 * HACKER CITY — MOTOR DE RETENÇÃO, RESUMO OFFLINE & ROTINA DO OPERADOR
 * Parte 1 (PR #93): Snapshot de Sessão & Relatório "Enquanto Você Esteve Offline"
 * ============================================================================
 */
(function () {
  'use strict';

  const AUTO_OPEN_MIN_AWAY_MS = 15 * 60 * 1000; // 15 minutos reais offline

  function escHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  class OperatorRetentionQolEngine {
    constructor() {
      this.userId = null;
      this.state = null;
      this.previousSessionSnap = null;
      this._snapTimer = null;
      this.bindLifecycle();
    }

    storageKey(uidOverride = null) {
      const uid = uidOverride || (window.currentProfile && window.currentProfile.id) || 'guest';
      return `HC_OPERATOR_RETENTION_V1_${uid}`;
    }

    normalizeState(raw) {
      const s = raw && typeof raw === 'object' ? { ...raw } : {};
      if (typeof s.lastSeenAt !== 'number') s.lastSeenAt = 0;
      if (typeof s.lastCleanBalance !== 'number') s.lastCleanBalance = 500;
      if (typeof s.lastDirtyBalance !== 'number') s.lastDirtyBalance = 0;
      if (typeof s.lastCompanyProfits !== 'number') s.lastCompanyProfits = 0;
      if (typeof s.lastStockValue !== 'number') s.lastStockValue = 0;
      if (typeof s.blockedAttacksSinceLastLogin !== 'number') s.blockedAttacksSinceLastLogin = 0;
      if (typeof s.totalBlockedAttacks !== 'number') s.totalBlockedAttacks = 0;
      return s;
    }

    ensureLoaded(uidOverride = null) {
      const uid = uidOverride || (window.currentProfile && window.currentProfile.id) || 'guest';
      if (this.state && this.userId === uid) return this.state;
      this.userId = uid;
      let parsed = null;
      try {
        const raw = localStorage.getItem(this.storageKey(uid));
        if (raw) parsed = JSON.parse(raw);
      } catch (e) {}
      this.state = this.normalizeState(parsed);
      return this.state;
    }

    save() {
      if (!this.state) return;
      try {
        localStorage.setItem(this.storageKey(), JSON.stringify(this.state));
      } catch (e) {}
    }

    computeCurrentStockValue() {
      if (!window.ecosystemHub || !window.ecosystemHub.state) return 0;
      const st = window.ecosystemHub.ensureLoaded();
      const longs = st.longPositions || {};
      const stocks = st.stocks || {};
      let sum = 0;
      Object.keys(longs).forEach((sym) => {
        const pos = longs[sym];
        const mkt = stocks[sym];
        if (pos && pos.shares > 0 && mkt) {
          sum += Number(pos.shares) * Number(mkt.price || 0);
        }
      });
      return +sum.toFixed(2);
    }

    captureLiveSnapshot() {
      if (!window.currentProfile || !window.currentWallet) return;
      const st = this.ensureLoaded();
      st.lastSeenAt = Date.now();
      st.lastCleanBalance = Number(window.currentWallet.balance || 0);
      st.lastDirtyBalance = (window.nineSystemsEngine && window.nineSystemsEngine.state)
        ? Number(window.nineSystemsEngine.ensureLoaded().dirtyBalance || 0)
        : 0;
      st.lastCompanyProfits = (window.nineSystemsEngine && window.nineSystemsEngine.state && window.nineSystemsEngine.state.myCompany)
        ? Number(window.nineSystemsEngine.state.myCompany.ownerProfits || 0)
        : 0;
      st.lastStockValue = this.computeCurrentStockValue();
      this.save();
    }

    bindLifecycle() {
      window.addEventListener('beforeunload', () => this.captureLiveSnapshot());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') this.captureLiveSnapshot();
      });
      this._snapTimer = setInterval(() => {
        if (window.currentProfile) this.captureLiveSnapshot();
      }, 30000);
    }

    recordBlockedAttack(sourceLabel = 'Firewall') {
      const st = this.ensureLoaded();
      st.blockedAttacksSinceLastLogin = (st.blockedAttacksSinceLastLogin || 0) + 1;
      st.totalBlockedAttacks = (st.totalBlockedAttacks || 0) + 1;
      st.lastBlockedSource = String(sourceLabel || 'Firewall').slice(0, 60);
      this.save();
    }

    formatAwayDuration(ms) {
      if (!ms || ms < 60 * 1000) return 'Sessão atual (online agora)';
      const totalMins = Math.floor(ms / 60000);
      if (totalMins < 60) return `${totalMins} min ausente`;
      const hrs = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      if (hrs < 24) return mins > 0 ? `${hrs}h ${mins}m ausente` : `${hrs}h ausente`;
      const days = Math.floor(hrs / 24);
      const remHrs = hrs % 24;
      return remHrs > 0 ? `${days}d ${remHrs}h ausente` : `${days}d ausente`;
    }

    onSessionEntered() {
      const st = this.ensureLoaded();
      const now = Date.now();
      const prevSeen = st.lastSeenAt || 0;
      const awayMs = prevSeen > 0 ? Math.max(0, now - prevSeen) : 0;

      this.previousSessionSnap = {
        awayMs,
        lastSeenAt: prevSeen,
        prevCleanBalance: st.lastCleanBalance,
        prevCompanyProfits: st.lastCompanyProfits,
        prevStockValue: st.lastStockValue,
        blockedWhileAway: st.blockedAttacksSinceLastLogin || 0
      };

      st.blockedAttacksSinceLastLogin = 0;
      this.captureLiveSnapshot();

      if (typeof this.maybeAutoOpenOfflineBriefing === 'function') {
        this.maybeAutoOpenOfflineBriefing(awayMs);
      }
    }

    getOfflineBriefingData() {
      this.ensureLoaded();
      const snap = this.previousSessionSnap || { awayMs: 0, prevStockValue: 0, prevCompanyProfits: 0, blockedWhileAway: 0 };
      const harvest = (window.softwareEngine && typeof window.softwareEngine.getPendingHarvestSummary === 'function')
        ? window.softwareEngine.getPendingHarvestSummary()
        : { virusCount: 0, cashReady: 0, btcReadyStr: '0.00000000', collectorActive: false };

      const nineSt = (window.nineSystemsEngine && typeof window.nineSystemsEngine.ensureLoaded === 'function')
        ? window.nineSystemsEngine.ensureLoaded()
        : { washingJobs: [], myCompany: null };
      const now = Date.now();
      const readyWashes = (nineSt.washingJobs || []).filter((j) => !j.claimed && Number(j.completesAt || 0) <= now);
      const pendingWashes = (nineSt.washingJobs || []).filter((j) => !j.claimed && Number(j.completesAt || 0) > now);
      const curCompanyProfits = nineSt.myCompany ? Number(nineSt.myCompany.ownerProfits || 0) : 0;
      const companyDelta = Math.max(0, +(curCompanyProfits - Number(snap.prevCompanyProfits || 0)).toFixed(2));

      const stockNow = this.computeCurrentStockValue();
      const stockDelta = +(stockNow - Number(snap.prevStockValue || stockNow)).toFixed(2);

      const shieldActive = !!(window.progressiveUnlockEngine && typeof window.progressiveUnlockEngine.isNewbiePvpShieldActive === 'function' && window.progressiveUnlockEngine.isNewbiePvpShieldActive());
      const shieldRemText = (shieldActive && window.progressiveUnlockEngine.formatShieldRemaining)
        ? window.progressiveUnlockEngine.formatShieldRemaining()
        : null;

      return {
        awayMs: snap.awayMs || 0,
        awayLabel: this.formatAwayDuration(snap.awayMs || 0),
        virusCount: harvest.virusCount || 0,
        cashReady: Number(harvest.cashReady || 0),
        btcReadyStr: harvest.btcReadyStr || '0.00000000',
        collectorActive: !!harvest.collectorActive,
        readyWashesCount: readyWashes.length,
        pendingWashesCount: pendingWashes.length,
        companyDelta,
        stockNow,
        stockDelta,
        shieldActive,
        shieldRemText,
        blockedCount: (snap.blockedWhileAway || 0) + (this.state.blockedAttacksSinceLastLogin || 0),
        totalBlocked: this.state.totalBlockedAttacks || 0
      };
    }
  }

  window.OperatorRetentionQolEngine = OperatorRetentionQolEngine;
  window.operatorRetentionEngine = new OperatorRetentionQolEngine();
  window._hcRetentionEsc = escHtml;
  window._hcRetentionMinAwayMs = AUTO_OPEN_MIN_AWAY_MS;
})();
