/**
 * ============================================================================
 * HACKER CITY — MOTOR DO CHECK-IN DIÁRIO 2.0 (MODAL DEDICADO, RELÓGIO BRT
 * ANTI-EXPLOIT, ESCALONAMENTO POR ESTÁGIO 1–4, ESCUDO DE SEQUÊNCIA & MENSAL)
 * ============================================================================
 */
(function () {
  'use strict';

  const BRT_OFFSET_MS = -3 * 60 * 60 * 1000; // America/Sao_Paulo (UTC-3)

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function runAuthorized(fn) {
    if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
      return window.integrityGuard.runAuthorized(fn);
    }
    return fn();
  }

  function fmtUsd(val) {
    return '$ ' + Number(val || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  }

  class DailyCheckinV2Engine {
    constructor() {
      this.serverOffsetMs = 0;
      this.clockSynced = false;
      this.activeTab = 'calendar'; // 'calendar' | 'goals' | 'monthly'
      this.selectedPreviewDay = null;
      this.dayRegistry = new Map();
      this.seedPlaceholderDays();
      this.syncServerClock();
    }

    seedPlaceholderDays() {
      for (let d = 1; d <= 7; d++) {
        this.dayRegistry.set(d, {
          day: d,
          title: `Dia ${d}`,
          codeName: `Suprimento #0${d}`,
          icon: d === 7 ? '🏆' : '📦',
          cleanByStage: [350, 350, 350, 350],
          repByStage: [0, 0, 0, 0],
          satsByStage: [0, 0, 0, 0],
          bonusTag: '',
          bonusDesc: 'Pacote operacional diário.',
          onClaimBonus: null,
          renderExtraMeta: null
        });
      }
    }

    registerDaySpec(dayNum, spec) {
      const d = Number(dayNum);
      if (d < 1 || d > 7 || !spec) return;
      const prev = this.dayRegistry.get(d) || { day: d };
      this.dayRegistry.set(d, { ...prev, ...spec, day: d });
    }

    async syncServerClock() {
      try {
        const res = await fetch('manifest.json', { method: 'HEAD', cache: 'no-store' });
        const dateHdr = res.headers && res.headers.get('date');
        if (dateHdr) {
          const srvMs = Date.parse(dateHdr);
          if (Number.isFinite(srvMs) && srvMs > 0) {
            this.serverOffsetMs = srvMs - Date.now();
            this.clockSynced = true;
          }
        }
      } catch (e) {}
    }

    nowTrustedMs() {
      return Date.now() + (this.serverOffsetMs || 0);
    }

    brtDateKeyFromMs(ms) {
      const shifted = new Date(ms + BRT_OFFSET_MS);
      const y = shifted.getUTCFullYear();
      const m = String(shifted.getUTCMonth() + 1).padStart(2, '0');
      const d = String(shifted.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    todayBrtKey() {
      return this.brtDateKeyFromMs(this.nowTrustedMs());
    }

    yesterdayBrtKey() {
      return this.brtDateKeyFromMs(this.nowTrustedMs() - 86400000);
    }

    currentMonthKey() {
      return this.todayBrtKey().slice(0, 7);
    }

    getOperatorStage() {
      if (window.progressiveUnlockEngine && typeof window.progressiveUnlockEngine.getCurrentStepNumber === 'function') {
        const st = Number(window.progressiveUnlockEngine.getCurrentStepNumber() || 1);
        return Math.max(1, Math.min(4, st));
      }
      return 1;
    }

    getState() {
      if (!window.operatorRetentionEngine) return null;
      const st = window.operatorRetentionEngine.ensureLoaded();
      if (typeof st.freezeTokens !== 'number') st.freezeTokens = 0;
      if (typeof st.cpuBoostUntil !== 'number') st.cpuBoostUntil = 0;
      if (typeof st.monthlyKey !== 'string') st.monthlyKey = '';
      if (typeof st.monthlyCheckinCount !== 'number') st.monthlyCheckinCount = 0;
      if (!st.monthlyMilestonesClaimed || typeof st.monthlyMilestonesClaimed !== 'object') {
        st.monthlyMilestonesClaimed = {};
      }
      if (typeof st.comboClaimedDay !== 'string') st.comboClaimedDay = '';
      if (typeof st.rerolledDay !== 'string') st.rerolledDay = '';
      if (!Array.isArray(st.activeDailyGoalIds)) st.activeDailyGoalIds = [];
      if (typeof st.lastTrustedClaimEpoch !== 'number') st.lastTrustedClaimEpoch = 0;

      const curMonth = this.currentMonthKey();
      if (st.monthlyKey !== curMonth) {
        st.monthlyKey = curMonth;
        st.monthlyCheckinCount = 0;
        st.monthlyMilestonesClaimed = {};
      }
      return st;
    }

    saveState() {
      if (window.operatorRetentionEngine) window.operatorRetentionEngine.save();
      this.syncTopbarBadge();
    }

    getResolvedDayReward(dayNum, stageOverride = null) {
      const stage = stageOverride || this.getOperatorStage();
      const idx = Math.max(0, Math.min(3, stage - 1));
      const spec = this.dayRegistry.get(Number(dayNum)) || this.dayRegistry.get(1);
      const cleanCash = Array.isArray(spec.cleanByStage) ? Number(spec.cleanByStage[idx] || 0) : 0;
      const rep = Array.isArray(spec.repByStage) ? Number(spec.repByStage[idx] || 0) : 0;
      const sats = Array.isArray(spec.satsByStage) ? Number(spec.satsByStage[idx] || 0) : 0;

      const parts = [];
      if (cleanCash > 0) parts.push(`${fmtUsd(cleanCash)} Limpos`);
      if (rep > 0) parts.push(`+${rep} REP`);
      if (sats > 0) parts.push(`${(sats / 100000000).toFixed(5)} BTC`);
      if (spec.bonusTag) parts.push(spec.bonusTag);

      return {
        day: spec.day,
        stage,
        icon: spec.icon || '🎁',
        title: spec.title,
        codeName: spec.codeName,
        cleanCash,
        rep,
        sats,
        bonusTag: spec.bonusTag || '',
        bonusDesc: spec.bonusDesc || '',
        summaryLabel: parts.join(' · ') || 'Suprimento Tático',
        spec
      };
    }

    getPendingAlertsCount() {
      const st = this.getState();
      if (!st) return 0;
      const tk = this.todayBrtKey();
      let count = st.lastSupplyClaimDay !== tk ? 1 : 0;
      if (window.operatorRetentionEngine) {
        const cat = window.operatorRetentionEngine.getDailyGoalsCatalog();
        cat.forEach((g) => {
          if (st.dailyGoalsDone && st.dailyGoalsDone[g.id] && !(st.dailyGoalsClaimed && st.dailyGoalsClaimed[g.id])) {
            count += 1;
          }
        });
      }
      if (typeof this.getReadyComboAndMonthlyCount === 'function') {
        count += this.getReadyComboAndMonthlyCount(st, tk);
      }
      return count;
    }

    syncTopbarBadge() {
      const dot = document.getElementById('topbarCheckinDot');
      if (!dot) return;
      const pending = this.getPendingAlertsCount();
      dot.style.display = pending > 0 ? 'inline-block' : 'none';
      dot.textContent = pending > 9 ? '9+' : String(pending);
    }
  }

  window.DailyCheckinV2Engine = DailyCheckinV2Engine;
  window.dailyCheckinV2 = new DailyCheckinV2Engine();
  window._hcCheckinEsc = esc;
  window._hcCheckinFmtUsd = fmtUsd;
  window._hcCheckinRunAuth = runAuthorized;
})();
