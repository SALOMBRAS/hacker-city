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

    maybeAutoOpenOfflineBriefing(awayMs) {
      if (!awayMs || awayMs < AUTO_OPEN_MIN_AWAY_MS) return false;
      if (window.DISABLE_AUTO_TOUR === true) return false;
      try {
        if (localStorage.getItem('HC_DISABLE_AUTO_TOUR') === '1') return false;
      } catch (e) {}
      if (window.spotlightTour && window.spotlightTour.isActive) return false;
      const authEl = document.getElementById('authOverlay');
      if (authEl && getComputedStyle(authEl).display !== 'none') return false;
      setTimeout(() => {
        if (window.spotlightTour && window.spotlightTour.isActive) return;
        this.openOfflineBriefingModal();
      }, 450);
      return true;
    }

    collectVirusesFromBriefing() {
      if (!window.softwareEngine || typeof window.softwareEngine.collectAllViruses !== 'function') return;
      const res = window.softwareEngine.collectAllViruses();
      if (typeof window.showToast === 'function' && res && res.message) {
        window.showToast(res.message);
      }
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (typeof window.renderHome === 'function') window.renderHome();
      this.openOfflineBriefingModal();
    }

    openOfflineBriefingModal() {
      const d = this.getOfflineBriefingData();
      let modal = document.getElementById('hcOfflineBriefingModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'hcOfflineBriefingModal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:26200;background:rgba(8,11,15,0.82);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:12px;';
        document.body.appendChild(modal);
      }
      const laundUnlocked = !window.progressiveUnlockEngine || window.progressiveUnlockEngine.isUnlocked('winLaundering');
      const stockDeltaStr = (d.stockDelta >= 0 ? '+$' : '-$') + Math.abs(d.stockDelta).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const fmtUsd = (v) => '$' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      modal.innerHTML = `
        <div style="width:min(460px, calc(100vw - 24px));max-height:calc(100dvh - 24px);overflow-y:auto;background:#131922;border:1px solid rgba(53,184,119,0.45);border-radius:12px;padding:16px;box-shadow:0 20px 50px rgba(0,0,0,0.7);color:var(--hc-text);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:10px;">
            <div>
              <div style="font-size:11px;color:var(--hc-accent-text);text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">📬 Relatório de Operações</div>
              <strong style="font-size:16px;color:#fff;display:block;">Enquanto Você Esteve Offline</strong>
              <span style="font-size:12px;color:var(--hc-text-3);">${escHtml(d.awayLabel)}</span>
            </div>
            <button type="button" class="hc-btn ghost sm" onclick="window.operatorRetentionEngine.closeOfflineBriefingModal()">✕</button>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:8px;margin-bottom:12px;font-size:12.5px;">
            <div style="background:var(--hc-inset);border:1px solid var(--hc-border);border-radius:8px;padding:10px;">
              <span style="color:var(--hc-text-3);font-size:11px;display:block;">🦠 RENDIMENTO DE VÍRUS</span>
              <strong style="color:var(--hc-accent-text);font-size:14px;">${fmtUsd(d.cashReady)}</strong>
              <div style="font-size:11px;color:var(--hc-text-2);margin-top:2px;">${d.virusCount} vírus ativos · ${escHtml(d.btcReadyStr)} BTC</div>
            </div>
            <div style="background:var(--hc-inset);border:1px solid var(--hc-border);border-radius:8px;padding:10px;">
              <span style="color:var(--hc-text-3);font-size:11px;display:block;">🛡️ DEFESA &amp; PERÍMETRO</span>
              <strong style="color:#60a5fa;font-size:14px;">${d.blockedCount} bloqueio${d.blockedCount === 1 ? '' : 's'}</strong>
              <div style="font-size:11px;color:var(--hc-text-2);margin-top:2px;">${d.shieldActive ? `Escudo 24h (${escHtml(d.shieldRemText)})` : `Total histórico: ${d.totalBlocked}`}</div>
            </div>
            <div style="background:var(--hc-inset);border:1px solid var(--hc-border);border-radius:8px;padding:10px;">
              <span style="color:var(--hc-text-3);font-size:11px;display:block;">🧼 LAVAGEM &amp; COMISSÕES</span>
              <strong style="color:#fbbf24;font-size:14px;">${d.readyWashesCount} lote${d.readyWashesCount === 1 ? '' : 's'} pronto${d.readyWashesCount === 1 ? '' : 's'}</strong>
              <div style="font-size:11px;color:var(--hc-text-2);margin-top:2px;">${d.pendingWashesCount} em curso · +${fmtUsd(d.companyDelta)} comissão</div>
            </div>
            <div style="background:var(--hc-inset);border:1px solid var(--hc-border);border-radius:8px;padding:10px;">
              <span style="color:var(--hc-text-3);font-size:11px;display:block;">📈 CARTEIRA NA BOLSA</span>
              <strong style="color:${d.stockDelta >= 0 ? 'var(--hc-accent-text)' : 'var(--hc-danger-text)'};font-size:14px;">${fmtUsd(d.stockNow)}</strong>
              <div style="font-size:11px;color:var(--hc-text-2);margin-top:2px;">Variação recente: ${stockDeltaStr}</div>
            </div>
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;">
            ${d.cashReady >= 0.05 ? `<button type="button" id="btnBriefingCollectViruses" class="hc-btn sm" style="border-color:rgba(53,184,119,0.5);color:var(--hc-accent-text);" onclick="window.operatorRetentionEngine.collectVirusesFromBriefing()">🦠 Coletar Vírus (${fmtUsd(d.cashReady)})</button>` : ''}
            ${laundUnlocked && d.readyWashesCount > 0 ? `<button type="button" class="hc-btn sm" onclick="window.operatorRetentionEngine.closeOfflineBriefingModal(); navTo('winLaundering');">🧼 Ver Lavagem</button>` : ''}
            <button type="button" id="btnCloseOfflineBriefing" class="hc-btn primary sm" onclick="window.operatorRetentionEngine.closeOfflineBriefingModal()">Continuar Operação</button>
          </div>
        </div>
      `;
      modal.style.display = 'flex';
    }

    closeOfflineBriefingModal() {
      const m = document.getElementById('hcOfflineBriefingModal');
      if (m) m.style.display = 'none';
    }
  }

  window.OperatorRetentionQolEngine = OperatorRetentionQolEngine;
  window.operatorRetentionEngine = new OperatorRetentionQolEngine();
  window._hcRetentionEsc = escHtml;
  window._hcRetentionMinAwayMs = AUTO_OPEN_MIN_AWAY_MS;
})();
