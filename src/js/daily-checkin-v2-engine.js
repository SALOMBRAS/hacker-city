/**
 * ============================================================================
 * HACKER CITY — MOTOR DO CHECK-IN DIÁRIO 2.0 (MODAL DEDICADO, RELÓGIO BRT
 * ANTI-EXPLOIT, ESCALONAMENTO POR ESTÁGIO 1–4, ESCUDO DE SEQUÊNCIA & MENSAL)
 * ============================================================================
 */
(function () {
  'use strict';

  const BRT_OFFSET_MS = -3 * 60 * 60 * 1000; // America/Sao_Paulo (UTC-3)
  const GOAL_STAGE_MULT = [1.0, 1.8, 3.2, 6.0];

  const DYNAMIC_GOALS_POOL = [
    { id: 'ghost_wipe', minStage: 1, title: 'Infiltrador Limpo', desc: 'Apagar seu IP dos logs de 1 servidor remoto', rewardClean: 450, rewardRep: 25, goWin: 'winLogs' },
    { id: 'break_pass', minStage: 1, title: 'Quebrador de Acesso', desc: 'Quebrar a senha de 1 servidor na Internet', rewardClean: 420, rewardRep: 25, goWin: 'winBrowser' },
    { id: 'sharp_mind', minStage: 1, title: 'Mente Afiada', desc: 'Resolver 1 Desafio/Enigma OU concluir 1 Curso', rewardClean: 400, rewardRep: 25, goWin: 'winUniversity' },
    { id: 'harvest_virus', minStage: 1, title: 'Colheita Clandestina', desc: 'Coletar lucros acumulados da rede de vírus', rewardClean: 380, rewardRep: 20, goWin: 'winSoftware' },
    { id: 'pay_hideout', minStage: 1, title: 'Esconderijo em Dia', desc: 'Quitar 1 conta mensal do Esconderijo', rewardClean: 400, rewardRep: 20, goWin: 'winQuitinete' },
    { id: 'clean_finance', minStage: 2, title: 'Operador Financeiro', desc: 'Lavar dinheiro sujo OU abrir operação na Bolsa', rewardClean: 600, rewardRep: 30, goWin: 'winLaundering' },
    { id: 'plant_virus', minStage: 2, title: 'Semeador de Botnet', desc: 'Instalar 1 vírus em servidor invadido', rewardClean: 520, rewardRep: 30, goWin: 'winBrowser' },
    { id: 'sabotage_corp', minStage: 3, title: 'Sabotagem Corporativa', desc: 'Invadir ou sabotar empresa listada na Bolsa', rewardClean: 680, rewardRep: 35, goWin: 'winOpsHub' }
  ];

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
        const cat = this.getActiveDailyGoals(st);
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

    getGoalById(goalId, stageOverride = null) {
      const base = DYNAMIC_GOALS_POOL.find((g) => g.id === goalId);
      if (!base) return null;
      const stage = stageOverride || this.getOperatorStage();
      const mult = GOAL_STAGE_MULT[Math.max(0, Math.min(3, stage - 1))] || 1.0;
      return {
        ...base,
        scaledClean: Math.round(base.rewardClean * mult),
        scaledRep: Math.round(base.rewardRep * (1 + (stage - 1) * 0.4))
      };
    }

    getActiveDailyGoals(stOverride = null) {
      const st = stOverride || this.getState();
      if (!st) return DYNAMIC_GOALS_POOL.slice(0, 3).map((g) => this.getGoalById(g.id, 1));
      const tk = this.todayBrtKey();
      const stage = this.getOperatorStage();
      const eligible = DYNAMIC_GOALS_POOL.filter((g) => g.minStage <= stage);

      if (!Array.isArray(st.activeDailyGoalIds) || st.activeDailyGoalIds.length !== 3 || st.activeDailyGoalsDay !== tk) {
        let seed = 0;
        for (let i = 0; i < tk.length; i++) seed = (seed * 31 + tk.charCodeAt(i)) >>> 0;
        const pool = eligible.slice();
        const picked = [];
        while (picked.length < 3 && pool.length > 0) {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          const idx = seed % pool.length;
          picked.push(pool.splice(idx, 1)[0].id);
        }
        st.activeDailyGoalIds = picked;
        st.activeDailyGoalsDay = tk;
        this.saveState();
      }
      return st.activeDailyGoalIds.map((id) => this.getGoalById(id, stage)).filter(Boolean);
    }

    rerollDailyGoal(goalId) {
      const st = this.getState();
      if (!st) return { success: false };
      const tk = this.todayBrtKey();
      if (st.rerolledDay === tk) {
        if (typeof window.showToast === 'function') window.showToast('🔄 Você já usou sua troca grátis de meta hoje!');
        return { success: false, code: 'REROLL_USED_TODAY' };
      }
      const activeIds = this.getActiveDailyGoals(st).map((g) => g.id);
      const slotIdx = activeIds.indexOf(goalId);
      if (slotIdx === -1) return { success: false, code: 'GOAL_NOT_ACTIVE' };
      if (st.dailyGoalsClaimed && st.dailyGoalsClaimed[goalId]) {
        return { success: false, code: 'GOAL_ALREADY_CLAIMED' };
      }
      const stage = this.getOperatorStage();
      const candidates = DYNAMIC_GOALS_POOL.filter((g) => g.minStage <= stage && !activeIds.includes(g.id));
      if (candidates.length === 0) return { success: false, code: 'NO_ALTERNATIVE' };

      const replacement = candidates[Math.floor(Math.random() * candidates.length)];
      st.activeDailyGoalIds[slotIdx] = replacement.id;
      st.rerolledDay = tk;
      this.saveState();
      this.rerenderIfOpen();
      if (typeof window.renderHome === 'function') window.renderHome();
      const msg = `🔄 Meta trocada grátis por: "${replacement.title}"!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, newGoalId: replacement.id, title: replacement.title };
    }

    claimTodaySupplyV2() {
      if (!window.operatorRetentionEngine) return { success: false, code: 'NO_ENGINE' };
      const st = window.operatorRetentionEngine.ensureDailyReset();
      this.getState();
      const tk = this.todayBrtKey();

      if (st.lastSupplyClaimDay === tk) {
        if (typeof window.showToast === 'function') {
          window.showToast('🎁 Você já resgatou o Check-in de hoje! Volte após 00:00 BRT.');
        }
        return { success: false, code: 'ALREADY_CLAIMED_TODAY' };
      }

      const dayIndex = Math.max(1, Math.min(7, Number(st.supplyStreakDay || 1)));
      const rw = this.getResolvedDayReward(dayIndex);

      runAuthorized(() => {
        if (rw.cleanCash > 0 && window.currentWallet) {
          window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + rw.cleanCash).toFixed(2);
        }
        if (rw.rep > 0 && window.currentProfile) {
          window.currentProfile.reputation = Number(window.currentProfile.reputation || 0) + rw.rep;
        }
      });

      if (rw.sats > 0 && window.bitcoinEngine && typeof window.bitcoinEngine.creditSats === 'function') {
        window.bitcoinEngine.creditSats(rw.sats, 'DAILY-SUPPLY-V2', `Check-in Dia ${dayIndex} (Estágio ${rw.stage})`);
      }

      let bonusOutcome = null;
      if (rw.spec && typeof rw.spec.onClaimBonus === 'function') {
        bonusOutcome = rw.spec.onClaimBonus(rw.stage, st);
      }

      st.lastSupplyClaimDay = tk;
      st.lastTrustedClaimEpoch = this.nowTrustedMs();
      st.monthlyCheckinCount = Number(st.monthlyCheckinCount || 0) + 1;
      st.supplyStreakDay = dayIndex >= 7 ? 1 : dayIndex + 1;
      this.saveState();

      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (typeof window.renderHome === 'function') window.renderHome();
      this.rerenderIfOpen();

      const extraTxt = bonusOutcome && bonusOutcome.note ? ` · ${bonusOutcome.note}` : '';
      const msg = `🎁 Dia ${dayIndex} resgatado (Estágio ${rw.stage}): ${rw.summaryLabel}${extraTxt}!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return {
        success: true,
        claimedDay: dayIndex,
        stage: rw.stage,
        reward: rw,
        bonusOutcome,
        message: msg
      };
    }

    openModal(tab = null) {
      if (tab) this.activeTab = tab;
      let modal = document.getElementById('hcDailyCheckinModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'hcDailyCheckinModal';
        modal.className = 'hc-checkin-overlay';
        modal.addEventListener('click', (e) => {
          if (e.target === modal) this.closeModal();
        });
        document.body.appendChild(modal);
      }
      modal.style.display = 'flex';
      this.renderModalBody();
    }

    closeModal() {
      const m = document.getElementById('hcDailyCheckinModal');
      if (m) m.style.display = 'none';
    }

    rerenderIfOpen() {
      const m = document.getElementById('hcDailyCheckinModal');
      if (m && m.style.display !== 'none') this.renderModalBody();
    }

    switchTab(tab) {
      this.activeTab = tab || 'calendar';
      this.renderModalBody();
    }

    selectDayPreview(dayNum) {
      this.selectedPreviewDay = Number(dayNum);
      this.renderModalBody();
    }

    renderDayCardHtml(dNum, curDay, claimedToday, selectedDay) {
      const rw = this.getResolvedDayReward(dNum);
      const isPast = claimedToday ? (curDay === 1 ? dNum <= 7 : dNum < curDay) : (dNum < curDay);
      const isCurrent = !claimedToday && dNum === curDay;
      const isSelected = selectedDay === dNum;
      const cls = [
        'hc-ck-day',
        dNum === 7 ? 'is-day-7' : '',
        isCurrent ? 'is-current' : '',
        isPast ? 'is-past' : '',
        isSelected ? 'is-selected' : ''
      ].filter(Boolean).join(' ');

      const extraBadge = (rw.spec && typeof rw.spec.renderExtraMeta === 'function')
        ? rw.spec.renderExtraMeta(rw.stage, this.getState())
        : '';

      return `
        <button type="button" id="btnCheckinDayCard_${dNum}" class="${cls}" onclick="window.dailyCheckinV2.selectDayPreview(${dNum})">
          <div class="hc-ck-day-top">
            <span>DIA ${dNum} ${isPast ? '✓' : (isCurrent ? '●' : '')}</span>
            <span>${esc(rw.icon)}</span>
          </div>
          <strong class="hc-ck-day-val">${esc(rw.summaryLabel)}</strong>
          ${extraBadge}
        </button>
      `;
    }

    renderModalBody() {
      const modal = document.getElementById('hcDailyCheckinModal');
      if (!modal || !window.operatorRetentionEngine) return;
      const st = window.operatorRetentionEngine.ensureDailyReset();
      this.getState();
      const tk = this.todayBrtKey();
      const stage = this.getOperatorStage();
      const claimedToday = st.lastSupplyClaimDay === tk;
      const curDay = Math.max(1, Math.min(7, Number(st.supplyStreakDay || 1)));
      const selDay = this.selectedPreviewDay || curDay;
      const selRw = this.getResolvedDayReward(selDay);

      let bodyHtml = '';
      if (this.activeTab === 'goals') {
        bodyHtml = typeof this.renderDynamicGoalsTabHtml === 'function'
          ? this.renderDynamicGoalsTabHtml(st, tk, stage)
          : `<div style="font-size:12px;color:var(--hc-text-2);">Carregando metas operacionais...</div>`;
      } else if (this.activeTab === 'monthly') {
        bodyHtml = typeof this.renderMonthlyMilestonesTabHtml === 'function'
          ? this.renderMonthlyMilestonesTabHtml(st)
          : `<div style="padding:12px;background:var(--hc-inset);border:1px solid var(--hc-border);border-radius:8px;font-size:12px;color:var(--hc-text-2);">Check-ins acumulados neste mês (${esc(st.monthlyKey)}): <strong style="color:#fff;">${st.monthlyCheckinCount} dia(s)</strong>.</div>`;
      } else {
        const cards = [1, 2, 3, 4, 5, 6, 7].map((d) => this.renderDayCardHtml(d, curDay, claimedToday, selDay)).join('');
        const detailCustom = (selRw.spec && typeof selRw.spec.renderDetailPanel === 'function')
          ? selRw.spec.renderDetailPanel(stage, st)
          : '';
        bodyHtml = `
          <div class="hc-ck-grid">${cards}</div>
          <div class="hc-ck-detail">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
              <strong style="font-size:12.8px;color:#fff;">${esc(selRw.icon)} Dia ${selRw.day} — ${esc(selRw.codeName)}</strong>
              <span class="hc-badge success" style="font-size:10.5px;">Escalado: Estágio ${stage}</span>
            </div>
            <div style="font-size:11.8px;color:var(--hc-accent-text);font-weight:600;margin-top:3px;">${esc(selRw.summaryLabel)}</div>
            <div style="font-size:11.3px;color:var(--hc-text-2);margin-top:2px;">${esc(selRw.bonusDesc)}</div>
            ${detailCustom}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px;">
            <span style="font-size:11px;color:var(--hc-text-3);">🔒 Relógio BRT anti-adulteração ativo</span>
            ${claimedToday
              ? `<span class="hc-badge success" style="font-size:11.5px;padding:5px 10px;">✓ Suprimento de hoje resgatado</span>`
              : `<button type="button" id="btnModalClaimDailySupply" class="hc-btn primary" onclick="window.dailyCheckinV2.claimTodaySupplyV2()">🎁 Resgatar Dia ${curDay} Agora</button>`}
          </div>
        `;
      }

      const headerExtra = typeof this.renderHeaderFreezeBadge === 'function' ? this.renderHeaderFreezeBadge(st) : '';
      modal.innerHTML = `
        <div class="hc-checkin-dialog" role="dialog" aria-label="Central de Check-in Diário">
          <div class="hc-ck-head">
            <div>
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <strong style="font-size:15px;color:#fff;">🎁 Check-in &amp; Operações Diárias</strong>
                <span class="hc-badge" style="font-size:10.5px;">Estágio ${stage}/4</span>
                ${headerExtra}
              </div>
              <span style="font-size:11.2px;color:var(--hc-text-3);">Recompensas escalam automaticamente com o seu nível de desbloqueio.</span>
            </div>
            <button type="button" class="hc-btn ghost sm" onclick="window.dailyCheckinV2.closeModal()" aria-label="Fechar">✕</button>
          </div>
          <div class="hc-ck-tabs">
            <button type="button" id="btnCkTabCalendar" class="hc-ck-tab ${this.activeTab === 'calendar' ? 'active' : ''}" onclick="window.dailyCheckinV2.switchTab('calendar')">📅 7 Dias</button>
            <button type="button" id="btnCkTabGoals" class="hc-ck-tab ${this.activeTab === 'goals' ? 'active' : ''}" onclick="window.dailyCheckinV2.switchTab('goals')">🎯 Metas</button>
            <button type="button" id="btnCkTabMonthly" class="hc-ck-tab ${this.activeTab === 'monthly' ? 'active' : ''}" onclick="window.dailyCheckinV2.switchTab('monthly')">🏅 Mês (${st.monthlyCheckinCount}/28)</button>
          </div>
          <div class="hc-ck-body">${bodyHtml}</div>
        </div>
      `;
    }
  }

  window.DailyCheckinV2Engine = DailyCheckinV2Engine;
  window.dailyCheckinV2 = new DailyCheckinV2Engine();
  window._hcCheckinEsc = esc;
  window._hcCheckinFmtUsd = fmtUsd;
  window._hcCheckinRunAuth = runAuthorized;
})();
