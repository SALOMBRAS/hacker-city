/**
 * ============================================================================
 * HACKER CITY — MOTOR DE RETENÇÃO, RESUMO OFFLINE & ROTINA DO OPERADOR
 * Parte 1 (PR #93): Snapshot de Sessão & Relatório "Enquanto Você Esteve Offline"
 * ============================================================================
 */
(function () {
  'use strict';

  const AUTO_OPEN_MIN_AWAY_MS = 15 * 60 * 1000; // 15 minutos reais offline

  const SEVEN_DAY_SUPPLY = [
    { day: 1, label: '$ 350 Limpos', cleanCash: 350, rep: 0, sats: 0 },
    { day: 2, label: '+40 REP', cleanCash: 0, rep: 40, sats: 0 },
    { day: 3, label: '$ 750 Limpos', cleanCash: 750, rep: 0, sats: 0 },
    { day: 4, label: '0.00020 BTC', cleanCash: 0, rep: 0, sats: 20000 },
    { day: 5, label: '$ 1.400 Limpos', cleanCash: 1400, rep: 0, sats: 0 },
    { day: 6, label: '+80 REP', cleanCash: 0, rep: 80, sats: 0 },
    { day: 7, label: '🏆 Baú ($ 3.000 + BTC)', cleanCash: 3000, rep: 0, sats: 50000 }
  ];

  const DAILY_GOALS_CATALOG = [
    {
      id: 'ghost_wipe',
      title: 'Infiltrador Limpo',
      desc: 'Apagar seu IP dos logs de 1 servidor remoto',
      rewardClean: 450,
      rewardRep: 25,
      goWin: 'winLogs'
    },
    {
      id: 'clean_finance',
      title: 'Operador Financeiro',
      desc: 'Lavar dinheiro sujo OU abrir operação na Bolsa',
      rewardClean: 600,
      rewardRep: 30,
      goWin: 'winLaundering'
    },
    {
      id: 'sharp_mind',
      title: 'Mente Afiada',
      desc: 'Resolver 1 Desafio/Enigma OU concluir 1 Curso',
      rewardClean: 400,
      rewardRep: 25,
      goWin: 'winUniversity'
    }
  ];

  function runAuthorized(fn) {
    if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
      return window.integrityGuard.runAuthorized(fn);
    }
    return fn();
  }

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
      if (typeof s.supplyStreakDay !== 'number' || s.supplyStreakDay < 1 || s.supplyStreakDay > 7) s.supplyStreakDay = 1;
      if (typeof s.lastSupplyClaimDay !== 'string') s.lastSupplyClaimDay = '';
      if (typeof s.dailyGoalsDay !== 'string') s.dailyGoalsDay = '';
      if (!s.dailyGoalsDone || typeof s.dailyGoalsDone !== 'object') s.dailyGoalsDone = {};
      if (!s.dailyGoalsClaimed || typeof s.dailyGoalsClaimed !== 'object') s.dailyGoalsClaimed = {};
      if (typeof s.routineCollapsed !== 'boolean') s.routineCollapsed = false;
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

      const shieldStatus = (window.progressiveUnlockEngine && typeof window.progressiveUnlockEngine.getNewbieShieldStatus === 'function')
        ? window.progressiveUnlockEngine.getNewbieShieldStatus()
        : { active: false, formattedRemaining: 'Encerrado' };
      const shieldActive = !!shieldStatus.active;
      const shieldRemText = shieldActive ? shieldStatus.formattedRemaining : null;

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
              <span style="color:var(--hc-text-3);font-size:11px;display:block;">🦠 VÍRUS PRONTOS (SUJO)</span>
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

    todayKey() {
      if (window.dailyCheckinV2 && typeof window.dailyCheckinV2.todayBrtKey === 'function') {
        return window.dailyCheckinV2.todayBrtKey();
      }
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    yesterdayKey() {
      if (window.dailyCheckinV2 && typeof window.dailyCheckinV2.yesterdayBrtKey === 'function') {
        return window.dailyCheckinV2.yesterdayBrtKey();
      }
      const d = new Date(Date.now() - 86400000);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    ensureDailyReset() {
      const st = this.ensureLoaded();
      const tk = this.todayKey();
      if (st.dailyGoalsDay !== tk) {
        st.dailyGoalsDay = tk;
        st.dailyGoalsDone = {};
        st.dailyGoalsClaimed = {};
        if (st.lastSupplyClaimDay && st.lastSupplyClaimDay !== tk && st.lastSupplyClaimDay !== this.yesterdayKey()) {
          if (Number(st.freezeTokens || 0) > 0) {
            st.freezeTokens -= 1;
            st.lastFreezeSavedDay = tk;
            if (typeof window.showToast === 'function') {
              window.showToast('🧊 Escudo de Sequência ativado! Sua ofensiva de Check-in foi protegida após 1 dia ausente.');
            }
          } else {
            st.supplyStreakDay = 1;
          }
        }
        this.save();
      }
      return st;
    }

    getSevenDayCatalog() {
      return SEVEN_DAY_SUPPLY;
    }

    getDailyGoalsCatalog() {
      return DAILY_GOALS_CATALOG;
    }

    claimDailySupply() {
      if (window.dailyCheckinV2 && typeof window.dailyCheckinV2.claimTodaySupplyV2 === 'function') {
        return window.dailyCheckinV2.claimTodaySupplyV2();
      }
      const st = this.ensureDailyReset();
      const tk = this.todayKey();
      if (st.lastSupplyClaimDay === tk) {
        if (typeof window.showToast === 'function') {
          window.showToast('🎁 Você já resgatou o Suprimento Diário de hoje! Volte amanhã para avançar a sequência.');
        }
        return { success: false, code: 'ALREADY_CLAIMED_TODAY' };
      }

      const dayIndex = Math.max(1, Math.min(7, Number(st.supplyStreakDay || 1)));
      const tier = SEVEN_DAY_SUPPLY[dayIndex - 1] || SEVEN_DAY_SUPPLY[0];

      runAuthorized(() => {
        if (tier.cleanCash > 0 && window.currentWallet) {
          window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + tier.cleanCash).toFixed(2);
        }
        if (tier.rep > 0 && window.currentProfile) {
          window.currentProfile.reputation = Number(window.currentProfile.reputation || 0) + tier.rep;
        }
      });
      if (tier.sats > 0 && window.bitcoinEngine && typeof window.bitcoinEngine.creditSats === 'function') {
        window.bitcoinEngine.creditSats(tier.sats, 'DAILY-SUPPLY', `Suprimento Diário Dia ${dayIndex}`);
      }

      st.lastSupplyClaimDay = tk;
      st.supplyStreakDay = dayIndex >= 7 ? 1 : dayIndex + 1;
      this.save();
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (typeof window.renderHome === 'function') window.renderHome();
      const msg = `🎁 Suprimento do Dia ${dayIndex} resgatado: ${tier.label}!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, claimedDay: dayIndex, reward: tier, message: msg };
    }

    recordDailyGoalProgress(goalId) {
      const st = this.ensureDailyReset();
      const goal = DAILY_GOALS_CATALOG.find((g) => g.id === goalId);
      if (!goal || st.dailyGoalsDone[goalId]) return false;
      st.dailyGoalsDone[goalId] = true;
      this.save();
      if (typeof window.showToast === 'function') {
        window.showToast(`✅ Meta Diária concluída: "${goal.title}"! Resgate +$${goal.rewardClean} Limpos no Painel Inicial.`);
      }
      if (window.winManager && window.winManager.current === 'winHome' && typeof window.renderHome === 'function') {
        window.renderHome();
      }
      return true;
    }

    claimDailyGoal(goalId) {
      const st = this.ensureDailyReset();
      const goal = DAILY_GOALS_CATALOG.find((g) => g.id === goalId);
      if (!goal) return { success: false, code: 'INVALID_GOAL' };
      if (!st.dailyGoalsDone[goalId]) return { success: false, code: 'NOT_COMPLETED' };
      if (st.dailyGoalsClaimed[goalId]) return { success: false, code: 'ALREADY_CLAIMED' };

      runAuthorized(() => {
        if (window.currentWallet) {
          window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + goal.rewardClean).toFixed(2);
        }
        if (window.currentProfile) {
          window.currentProfile.reputation = Number(window.currentProfile.reputation || 0) + goal.rewardRep;
        }
      });

      st.dailyGoalsClaimed[goalId] = true;
      this.save();
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (typeof window.renderHome === 'function') window.renderHome();
      const msg = `💵 Meta "${goal.title}" resgatada: +$${goal.rewardClean} Limpos e +${goal.rewardRep} REP!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, goal, message: msg };
    }

    toggleRoutineCollapsed() {
      const st = this.ensureLoaded();
      st.routineCollapsed = !st.routineCollapsed;
      this.save();
      if (typeof window.renderHome === 'function') window.renderHome();
    }

    navigateToGoalTarget(winId) {
      let target = winId || 'winBrowser';
      if (window.progressiveUnlockEngine && !window.progressiveUnlockEngine.isUnlocked(target)) {
        target = target === 'winLaundering' ? 'winBrowser' : 'winUniversity';
      }
      if (typeof window.navTo === 'function') window.navTo(target);
    }

    renderHomeRoutineCardHtml() {
      const st = this.ensureDailyReset();
      const tk = this.todayKey();
      const claimedToday = st.lastSupplyClaimDay === tk;
      const curDay = Math.max(1, Math.min(7, Number(st.supplyStreakDay || 1)));
      const goalsList = (window.dailyCheckinV2 && typeof window.dailyCheckinV2.getActiveDailyGoals === 'function')
        ? window.dailyCheckinV2.getActiveDailyGoals(st)
        : DAILY_GOALS_CATALOG;
      const doneGoalsCount = goalsList.filter((g) => !!st.dailyGoalsClaimed[g.id]).length;
      const pendingCount = (window.dailyCheckinV2 && typeof window.dailyCheckinV2.getPendingAlertsCount === 'function')
        ? window.dailyCheckinV2.getPendingAlertsCount()
        : ((!claimedToday ? 1 : 0) + goalsList.filter((g) => st.dailyGoalsDone[g.id] && !st.dailyGoalsClaimed[g.id]).length);
      const stage = (window.dailyCheckinV2 && typeof window.dailyCheckinV2.getOperatorStage === 'function')
        ? window.dailyCheckinV2.getOperatorStage()
        : 1;

      return `
        <div id="hcHomeRoutineCard" class="hc-card" style="padding:8px 11px;margin-bottom:11px;border-color:${pendingCount > 0 ? 'rgba(53,184,119,0.48)' : 'var(--hc-border)'};">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0;">
              <strong style="font-size:12.2px;color:#fff;">🎁 Check-in Diário</strong>
              <span class="hc-badge ${pendingCount > 0 ? 'success' : ''}" style="font-size:10.5px;">
                ${claimedToday ? `✓ Dia OK · ${doneGoalsCount}/3 metas` : `Dia ${curDay}/7 pronto · Estágio ${stage}`}
              </span>
            </div>
            <div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;">
              ${!claimedToday ? `<button type="button" id="btnClaimDailySupply" class="hc-btn primary sm" onclick="window.operatorRetentionEngine.claimDailySupply()">🎁 Resgatar Dia ${curDay}</button>` : ''}
              <button type="button" id="btnOpenDailyCheckinModal" class="hc-btn sm" style="border-color:var(--hc-border-strong);" onclick="if(window.dailyCheckinV2) window.dailyCheckinV2.openModal();">Abrir Central →</button>
            </div>
          </div>
        </div>
      `;
    }
  }

  window.OperatorRetentionQolEngine = OperatorRetentionQolEngine;
  window.operatorRetentionEngine = new OperatorRetentionQolEngine();
  window._hcRetentionEsc = escHtml;
  window._hcRetentionMinAwayMs = AUTO_OPEN_MIN_AWAY_MS;
})();
