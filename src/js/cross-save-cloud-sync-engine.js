/**
 * ============================================================================
 * HACKER CITY — MOTOR DE CROSS-SAVE REAL PC ↔ CELULAR & ANTI-DUPLICAÇÃO
 * Reconcilia snapshots Local e Nuvem (Supabase) com união monotônica de
 * Check-in 2.0, Metas, Marcos Mensais, Escudo de 24h e Estágios Desbloqueados,
 * mais pull automático ao desbloquear a tela do celular (visibilitychange).
 * ============================================================================
 */
(function () {
  'use strict';

  const AUTO_PULL_MIN_INTERVAL_MS = 18000;

  function isTouchOrMobileDevice() {
    try {
      if (window.matchMedia && window.matchMedia('(max-width: 860px)').matches) return true;
      if (navigator.maxTouchPoints > 0 && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '')) return true;
    } catch (e) {}
    return false;
  }

  class CrossSaveCloudSyncEngine {
    constructor() {
      this.lastCloudPullAtMs = 0;
      this.lastReconcileSummary = 'Pronto para sincronizar';
      this.isReconciling = false;
      this.bindFocusListeners();
    }

    getDeviceBadge() {
      return isTouchOrMobileDevice() ? '📱 Celular / Touch' : '💻 PC / Desktop';
    }

    isRealCloudAuthSession() {
      if (!window.currentProfile || !window.supabase) return false;
      const uid = String(window.currentProfile.id || '');
      if (!uid || uid.startsWith('local-') || uid.startsWith('uid-')) return false;
      if (sessionStorage.getItem('HC_TAB_INSTANT_SESSION')) return false;
      return true;
    }

    mergeRetentionBlocks(aRaw, bRaw) {
      if (!aRaw && !bRaw) return null;
      if (!aRaw) return JSON.parse(JSON.stringify(bRaw));
      if (!bRaw) return JSON.parse(JSON.stringify(aRaw));

      const a = JSON.parse(JSON.stringify(aRaw));
      const b = JSON.parse(JSON.stringify(bRaw));
      const out = { ...a, ...b };

      const aClaim = String(a.lastSupplyClaimDay || '');
      const bClaim = String(b.lastSupplyClaimDay || '');
      if (aClaim > bClaim) {
        out.lastSupplyClaimDay = aClaim;
        out.supplyStreakDay = a.supplyStreakDay;
      } else if (bClaim > aClaim) {
        out.lastSupplyClaimDay = bClaim;
        out.supplyStreakDay = b.supplyStreakDay;
      } else {
        out.supplyStreakDay = Math.max(Number(a.supplyStreakDay || 1), Number(b.supplyStreakDay || 1));
      }

      if (a.monthlyKey && a.monthlyKey === b.monthlyKey) {
        out.monthlyCheckinCount = Math.max(Number(a.monthlyCheckinCount || 0), Number(b.monthlyCheckinCount || 0));
        out.monthlyMilestonesClaimed = { ...(a.monthlyMilestonesClaimed || {}), ...(b.monthlyMilestonesClaimed || {}) };
      } else if ((a.monthlyKey || '') > (b.monthlyKey || '')) {
        out.monthlyKey = a.monthlyKey;
        out.monthlyCheckinCount = a.monthlyCheckinCount;
        out.monthlyMilestonesClaimed = { ...(a.monthlyMilestonesClaimed || {}) };
      }

      const bestGoalDay = String(a.dailyGoalsDay || '') >= String(b.dailyGoalsDay || '') ? a.dailyGoalsDay : b.dailyGoalsDay;
      out.dailyGoalsDay = bestGoalDay;
      out.dailyGoalsDone = {
        ...(a.dailyGoalsDay === bestGoalDay ? a.dailyGoalsDone : {}),
        ...(b.dailyGoalsDay === bestGoalDay ? b.dailyGoalsDone : {})
      };
      out.dailyGoalsClaimed = {
        ...(a.dailyGoalsDay === bestGoalDay ? a.dailyGoalsClaimed : {}),
        ...(b.dailyGoalsDay === bestGoalDay ? b.dailyGoalsClaimed : {})
      };

      out.comboClaimedDay = String(a.comboClaimedDay || '') > String(b.comboClaimedDay || '') ? a.comboClaimedDay : b.comboClaimedDay;
      out.rerolledDay = String(a.rerolledDay || '') > String(b.rerolledDay || '') ? a.rerolledDay : b.rerolledDay;
      out.cpuBoostUntil = Math.max(Number(a.cpuBoostUntil || 0), Number(b.cpuBoostUntil || 0));
      out.lastTrustedClaimEpoch = Math.max(Number(a.lastTrustedClaimEpoch || 0), Number(b.lastTrustedClaimEpoch || 0));
      return out;
    }

    mergeUnlockBlocks(aRaw, bRaw) {
      if (!aRaw && !bRaw) return null;
      if (!aRaw) return JSON.parse(JSON.stringify(bRaw));
      if (!bRaw) return JSON.parse(JSON.stringify(aRaw));
      const out = { ...aRaw, ...bRaw };
      out.everUnlocked = { ...(aRaw.everUnlocked || {}), ...(bRaw.everUnlocked || {}) };
      if (aRaw.shieldStartedAt && bRaw.shieldStartedAt) {
        out.shieldStartedAt = Math.min(Number(aRaw.shieldStartedAt), Number(bRaw.shieldStartedAt));
      } else {
        out.shieldStartedAt = Number(aRaw.shieldStartedAt || bRaw.shieldStartedAt || Date.now());
      }
      out.shieldBrokenByPvp = !!(aRaw.shieldBrokenByPvp || bRaw.shieldBrokenByPvp);
      out.veteranShowAll = !!(aRaw.veteranShowAll || bRaw.veteranShowAll);
      return out;
    }

    mergeSnapshotsAntiDupe(localSnap, cloudSnap) {
      if (!localSnap && !cloudSnap) return null;
      if (!localSnap) return cloudSnap;
      if (!cloudSnap) return localSnap;

      const cloudNewer = Number(cloudSnap.savedAt || 0) >= Number(localSnap.savedAt || 0);
      const base = JSON.parse(JSON.stringify(cloudNewer ? cloudSnap : localSnap));
      const other = cloudNewer ? localSnap : cloudSnap;

      base.reputation = Math.max(Number(base.reputation || 0), Number(other.reputation || 0));
      base.operatorRetentionState = this.mergeRetentionBlocks(other.operatorRetentionState, base.operatorRetentionState);
      base.progressiveUnlockState = this.mergeUnlockBlocks(other.progressiveUnlockState, base.progressiveUnlockState);

      if (other.tour || base.tour) {
        base.tour = {
          done: (base.tour && base.tour.done) || (other.tour && other.tour.done) || null,
          rewarded: (base.tour && base.tour.rewarded) || (other.tour && other.tour.rewarded) || null
        };
      }
      return base;
    }

    async pullAndReconcileFromCloud(silent = true) {
      if (!this.isRealCloudAuthSession() || !window.onlineEngine) {
        return { success: false, code: 'LOCAL_SESSION' };
      }
      if (this.isReconciling) return { success: false, code: 'BUSY' };

      this.isReconciling = true;
      try {
        const uid = String(window.currentProfile.id);
        const { data: secData, error: secErr } = await window.supabase.rpc('load_my_account_snapshot_secure', {
          p_operator_key: uid,
          p_write_secret: window.onlineEngine.getOrCreateWriteSecret(uid)
        });

        let liveDbBalance = null;
        try {
          const { data: walRow } = await window.supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', uid)
            .maybeSingle();
          if (walRow && walRow.balance != null) liveDbBalance = Number(walRow.balance);
        } catch (e) {}

        const cloudSnap = (!secErr && secData && secData.success && secData.save_payload) ? secData.save_payload : null;
        const localSnap = window.onlineEngine.collectMasterSnapshot();

        if (cloudSnap) {
          const merged = this.mergeSnapshotsAntiDupe(localSnap, cloudSnap);
          window.onlineEngine.applyMasterSnapshot(merged, liveDbBalance);
          window.onlineEngine.saveLocalSnapshotImmediate();
          if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
          if (window.dailyCheckinV2) {
            window.dailyCheckinV2.syncTopbarBadge();
            window.dailyCheckinV2.rerenderIfOpen();
          }
        }

        this.lastCloudPullAtMs = Date.now();
        this.lastReconcileSummary = `Sincronizado às ${new Date().toLocaleTimeString('pt-BR')}`;
        if (typeof this.renderProfileCrossSaveCard === 'function') this.renderProfileCrossSaveCard();
        if (!silent && typeof window.showToast === 'function') {
          window.showToast(`☁️ Cross-Save sincronizado (${this.getDeviceBadge()})!`);
        }
        return { success: true, hadCloudSnap: !!cloudSnap, liveDbBalance };
      } catch (err) {
        return { success: false, code: 'ERROR', message: String(err && err.message || err) };
      } finally {
        this.isReconciling = false;
      }
    }

    async syncNowManual() {
      if (!this.isRealCloudAuthSession() || !window.onlineEngine) {
        if (window.onlineEngine) window.onlineEngine.saveLocalSnapshotImmediate();
        if (typeof window.showToast === 'function') {
          window.showToast('💾 Progresso salvo neste aparelho! Crie/entre em uma conta com senha para Cross-Save PC ↔ Celular.');
        }
        return { success: true, mode: 'local_only' };
      }
      await this.pullAndReconcileFromCloud(true);
      const pushRes = await window.onlineEngine.pushSnapshotToCloud();
      this.lastReconcileSummary = `PC ↔ Celular sincronizado às ${new Date().toLocaleTimeString('pt-BR')}`;
      if (typeof this.renderProfileCrossSaveCard === 'function') this.renderProfileCrossSaveCard();
      if (typeof window.showToast === 'function') {
        window.showToast('☁️ Cross-Save PC ↔ Celular atualizado na nuvem com sucesso!');
      }
      return { success: true, mode: pushRes && pushRes.mode ? pushRes.mode : 'synced' };
    }

    bindFocusListeners() {
      const maybeAutoPull = () => {
        if (document.hidden || !this.isRealCloudAuthSession()) return;
        if (Date.now() - this.lastCloudPullAtMs < AUTO_PULL_MIN_INTERVAL_MS) return;
        this.pullAndReconcileFromCloud(true);
      };
      document.addEventListener('visibilitychange', maybeAutoPull);
      window.addEventListener('focus', maybeAutoPull);
    }
  }

  window.crossSaveEngine = new CrossSaveCloudSyncEngine();
})();
