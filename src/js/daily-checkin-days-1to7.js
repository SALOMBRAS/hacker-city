/**
 * ============================================================================
 * HACKER CITY — ESPECIFICAÇÕES MODULARES DOS 7 DIAS DE CHECK-IN (PRs #104–#110)
 * Cada dia escala automaticamente pelo Estágio (1 a 4) e entrega bônus táticos.
 * ============================================================================
 */
(function () {
  'use strict';

  const ck = window.dailyCheckinV2;
  if (!ck) return;

  function renderStageScaleStrip(values, fmtFn, activeStage) {
    return `
      <div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:4px;margin-top:6px;">
        ${values.map((v, idx) => {
          const stNum = idx + 1;
          const active = stNum === activeStage;
          return `
            <div style="padding:4px 5px;border-radius:6px;background:${active ? 'rgba(53,184,119,0.14)' : 'var(--hc-inset)'};border:1px solid ${active ? 'rgba(53,184,119,0.55)' : 'var(--hc-border)'};text-align:center;">
              <div style="font-size:9.5px;color:${active ? 'var(--hc-accent-text)' : 'var(--hc-text-3)'};font-weight:700;">EST. ${stNum}</div>
              <div style="font-size:10.5px;color:#fff;font-weight:600;">${fmtFn(v)}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  window._hcCheckinStageStrip = renderStageScaleStrip;

  // =========================================================================
  // DIA 1 — SUPRIMENTO INICIAL DE OPERAÇÕES (DINHEIRO LIMPO ESCALÁVEL)
  // =========================================================================
  ck.registerDaySpec(1, {
    title: 'Dia 1',
    codeName: 'Suprimento Inicial de Operações',
    icon: '💵',
    cleanByStage: [350, 1000, 2500, 6000],
    repByStage: [0, 0, 0, 0],
    satsByStage: [0, 0, 0, 0],
    bonusTag: 'Gerador S.O.S.',
    bonusDesc: 'Capital limpo imediato para peças, cursos ou taxas bancárias, escalado pelo seu Estágio.',
    onClaimBonus: (stage) => {
      let restoredPower = false;
      if (window.quitineteEngine && window.quitineteEngine.state && window.quitineteEngine.state.powerCut) {
        window.quitineteEngine.state.powerCut = false;
        if (typeof window.quitineteEngine.save === 'function') window.quitineteEngine.save();
        restoredPower = true;
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('CHECKIN-DIA1', `Suprimento Inicial Estágio ${stage} creditado na conta corrente.`, 'info');
      }
      return {
        restoredPower,
        note: restoredPower ? 'Energia de emergência religada no esconderijo' : ''
      };
    },
    renderExtraMeta: () => `<span style="font-size:9.8px;color:var(--hc-text-3);">Capital Limpo + S.O.S.</span>`,
    renderDetailPanel: (stage) => renderStageScaleStrip([350, 1000, 2500, 6000], (v) => `$${v.toLocaleString('pt-BR')}`, stage)
  });

  // =========================================================================
  // DIA 2 — CREDENCIAL & IMPULSO DE REDE (REPUTAÇÃO ESCALÁVEL + TURBO CPU)
  // =========================================================================
  ck.getCpuBoostMultiplier = function () {
    const st = this.getState();
    if (st && Number(st.cpuBoostUntil || 0) > Date.now()) return 1.12;
    return 1.0;
  };

  ck.registerDaySpec(2, {
    title: 'Dia 2',
    codeName: 'Credencial & Impulso de CPU',
    icon: '⚡',
    cleanByStage: [0, 0, 0, 0],
    repByStage: [45, 95, 170, 300],
    satsByStage: [0, 0, 0, 0],
    bonusTag: '+12% CPU (25m)',
    bonusDesc: 'Acelera seu prestígio hacker e ativa +12% de velocidade limpa no processador por 25 minutos.',
    onClaimBonus: (stage, st) => {
      st.cpuBoostUntil = Math.max(Date.now(), Number(st.cpuBoostUntil || 0)) + 25 * 60 * 1000;
      if (window.hardwareEngine && typeof window.hardwareEngine.rerender === 'function') {
        window.hardwareEngine.rerender();
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('CHECKIN-DIA2', `Turbo de CPU (+12% MHz por 25 min) ativado no Estágio ${stage}.`, 'info');
      }
      return { cpuBoostMinutes: 25, note: 'Turbo +12% CPU ativo por 25m' };
    },
    renderExtraMeta: (stage, st) => {
      const rem = st && Number(st.cpuBoostUntil || 0) > Date.now()
        ? Math.ceil((st.cpuBoostUntil - Date.now()) / 60000)
        : 0;
      return `<span style="font-size:9.8px;color:${rem > 0 ? 'var(--hc-accent-text)' : 'var(--hc-text-3)'};">${rem > 0 ? `⚡ Ativo (${rem}m)` : 'REP + Turbo CPU'}</span>`;
    },
    renderDetailPanel: (stage) => renderStageScaleStrip([45, 95, 170, 300], (v) => `+${v} REP`, stage)
  });

  // =========================================================================
  // DIA 3 — CAIXA DE INFILTRAÇÃO & INTELIGÊNCIA OSINT
  // =========================================================================
  ck.registerDaySpec(3, {
    title: 'Dia 3',
    codeName: 'Caixa de Infiltração & OSINT',
    icon: '🕵️',
    cleanByStage: [800, 2200, 5200, 12000],
    repByStage: [0, 0, 0, 0],
    satsByStage: [0, 0, 0, 0],
    bonusTag: '+1 Dossiê OSINT',
    bonusDesc: 'Reforço financeiro limpo acompanhado de +1 Dossiê OSINT para descobrir credenciais corporativas.',
    onClaimBonus: (stage) => {
      let totalOsint = 0;
      if (window.ecosystemHub && typeof window.ecosystemHub.ensureLoaded === 'function') {
        const es = window.ecosystemHub.ensureLoaded();
        es.osintDossiers = Number(es.osintDossiers || 0) + 1;
        totalOsint = es.osintDossiers;
        window.ecosystemHub.save();
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('CHECKIN-DIA3', `Caixa OSINT Estágio ${stage} recebida (+1 Dossiê OSINT, total: ${totalOsint}).`, 'info');
      }
      return { osintAdded: 1, totalOsint, note: `+1 Dossiê OSINT (${totalOsint} no inventário)` };
    },
    renderExtraMeta: () => {
      const cur = (window.ecosystemHub && window.ecosystemHub.state) ? Number(window.ecosystemHub.state.osintDossiers || 0) : 0;
      return `<span style="font-size:9.8px;color:var(--hc-text-3);">🕵️ Dossiês: ${cur}</span>`;
    },
    renderDetailPanel: (stage) => renderStageScaleStrip([800, 2200, 5200, 12000], (v) => `$${v.toLocaleString('pt-BR')}`, stage)
  });

  // =========================================================================
  // DIA 4 — REMESSA CRIPTOGRÁFICA BTC & PASTA TÉRMICA PRATA (7H)
  // =========================================================================
  ck.registerDaySpec(4, {
    title: 'Dia 4',
    codeName: 'Remessa BTC & Resfriamento Prata',
    icon: '₿',
    cleanByStage: [0, 0, 0, 0],
    repByStage: [0, 0, 0, 0],
    satsByStage: [25000, 55000, 100000, 180000],
    bonusTag: 'Pasta Prata (7h)',
    bonusDesc: 'Transfere satoshis escalados direto para sua carteira Bitcoin e aplica Pasta Térmica Prata (-9°C por 7h).',
    onClaimBonus: (stage) => {
      if (window.nineSystemsEngine && typeof window.nineSystemsEngine.ensureLoaded === 'function') {
        const ns = window.nineSystemsEngine.ensureLoaded();
        if (!ns.thermals) ns.thermals = { coolerId: 'stock', pasteAppliedAt: 0, coldOverclockOn: false, empHeatUntil: 0 };
        ns.thermals.pasteAppliedAt = Date.now();
        window.nineSystemsEngine.save();
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('CHECKIN-DIA4', `Remessa BTC Estágio ${stage} + Pasta Térmica Prata (7h de -9°C) aplicadas.`, 'info');
      }
      return { pasteRenewed: true, note: 'Pasta Térmica Prata (-9°C por 7h) aplicada' };
    },
    renderExtraMeta: () => `<span style="font-size:9.8px;color:#7dd3fc;">❄️ -9°C CPU (7h)</span>`,
    renderDetailPanel: (stage) => renderStageScaleStrip([25000, 55000, 100000, 180000], (v) => `${(v / 100000000).toFixed(5)} BTC`, stage)
  });

  // =========================================================================
  // DIA 5 — SUBSÍDIO DE ENGENHARIA & LABORATÓRIO DE VÍRUS
  // =========================================================================
  ck.registerDaySpec(5, {
    title: 'Dia 5',
    codeName: 'Subsídio de Engenharia & Lab',
    icon: '🧪',
    cleanByStage: [1500, 4000, 9500, 22000],
    repByStage: [0, 0, 0, 0],
    satsByStage: [0, 0, 0, 0],
    bonusTag: '+1 Cupom Lab',
    bonusDesc: 'Financiamento pesado limpo para hardware/cursos mais +1 Cupom (-$250) e +40 XP no Laboratório de Vírus.',
    onClaimBonus: (stage) => {
      let coupons = 0;
      if (window.ecosystemHub && typeof window.ecosystemHub.ensureLoaded === 'function') {
        const es = window.ecosystemHub.ensureLoaded();
        es.labDiscountCoupons = Number(es.labDiscountCoupons || 0) + 1;
        coupons = es.labDiscountCoupons;
        window.ecosystemHub.save();
      }
      if (window.virusLabEngine && typeof window.virusLabEngine.ensureLoaded === 'function') {
        window.virusLabEngine.ensureLoaded();
        window.virusLabEngine.state.xp = Number(window.virusLabEngine.state.xp || 0) + 40;
        if (typeof window.virusLabEngine.computeLevelFromXp === 'function') {
          const up = window.virusLabEngine.computeLevelFromXp(window.virusLabEngine.state.xp, window.virusLabEngine.state.level);
          window.virusLabEngine.state.level = up.level;
        }
        window.virusLabEngine.save();
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('CHECKIN-DIA5', `Subsídio Estágio ${stage} + 1 Cupom Lab + 40 XP Lab creditados.`, 'info');
      }
      return { coupons, labXpAdded: 40, note: '+1 Cupom Lab (-$250) e +40 XP' };
    },
    renderExtraMeta: () => {
      const c = (window.ecosystemHub && window.ecosystemHub.state) ? Number(window.ecosystemHub.state.labDiscountCoupons || 0) : 0;
      return `<span style="font-size:9.8px;color:#f5c451;">🧪 Cupons: ${c} · +40 XP</span>`;
    },
    renderDetailPanel: (stage) => renderStageScaleStrip([1500, 4000, 9500, 22000], (v) => `$${v.toLocaleString('pt-BR')}`, stage)
  });

  // =========================================================================
  // DIA 6 — PRESTÍGIO NA REDE & ESCUDO DE SEQUÊNCIA (STREAK FREEZE)
  // =========================================================================
  ck.renderHeaderFreezeBadge = function (st) {
    const cnt = st ? Number(st.freezeTokens || 0) : 0;
    return `<span class="hc-badge" style="font-size:10.5px;border-color:rgba(125,211,252,0.45);color:#7dd3fc;">🧊 Escudos: ${cnt}/2</span>`;
  };

  ck.registerDaySpec(6, {
    title: 'Dia 6',
    codeName: 'Prestígio & Escudo de Sequência',
    icon: '🧊',
    cleanByStage: [0, 0, 0, 0],
    repByStage: [90, 180, 320, 550],
    satsByStage: [0, 0, 0, 0],
    bonusTag: '+1 Escudo Freeze',
    bonusDesc: 'Grande pacote de Reputação mais +1 Escudo de Sequência (protege seu Dia atual se você faltar 1 dia).',
    onClaimBonus: (stage, st) => {
      st.freezeTokens = Math.min(2, Number(st.freezeTokens || 0) + 1);
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('CHECKIN-DIA6', `Prestígio Estágio ${stage} + 1 Escudo de Sequência (${st.freezeTokens}/2) recebidos.`, 'info');
      }
      return { freezeTokens: st.freezeTokens, note: `🧊 Escudo de Sequência (${st.freezeTokens}/2)` };
    },
    renderExtraMeta: (stage, st) => {
      const cnt = st ? Number(st.freezeTokens || 0) : 0;
      return `<span style="font-size:9.8px;color:#7dd3fc;">🧊 Protege 1 falta (${cnt}/2)</span>`;
    },
    renderDetailPanel: (stage) => renderStageScaleStrip([90, 180, 320, 550], (v) => `+${v} REP`, stage)
  });

  // =========================================================================
  // DIA 7 — BAÚ MESTRE SEMANAL CRIPTOGRAFADO (JACKPOT + ZERO-DAY + CATALISADOR)
  // =========================================================================
  ck.registerDaySpec(7, {
    title: 'Dia 7',
    codeName: 'Baú Mestre Semanal Criptografado',
    icon: '🏆',
    cleanByStage: [3500, 9000, 20000, 45000],
    repByStage: [60, 120, 220, 400],
    satsByStage: [50000, 100000, 180000, 300000],
    bonusTag: 'Zero-Day 24h + Catalisador',
    bonusDesc: 'Jackpot semanal de Dinheiro Limpo, Bitcoin e Reputação, acompanhado de Exploit Zero-Day (24h) e Catalisador.',
    onClaimBonus: (stage) => {
      const cveCode = `CVE-2026-${1000 + Math.floor(Math.random() * 8999)}`;
      if (window.ecosystemHub && typeof window.ecosystemHub.ensureLoaded === 'function') {
        const es = window.ecosystemHub.ensureLoaded();
        if (!Array.isArray(es.zeroDays)) es.zeroDays = [];
        es.zeroDays.unshift({
          id: 'zd_wk_' + Date.now(),
          code: cveCode,
          maxTier: Math.max(2, stage),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          used: false
        });
        es.labCatalysts = Number(es.labCatalysts || 0) + 1;
        window.ecosystemHub.save();
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('CHECKIN-DIA7', `Baú Mestre Semanal Estágio ${stage} aberto! Recebeu ${cveCode} (24h) + 1 Catalisador Lab.`, 'success');
      }
      return { zeroDayCode: cveCode, catalystAdded: 1, note: `${cveCode} + 1 Catalisador` };
    },
    renderExtraMeta: () => `<span style="font-size:10px;color:#f5c451;font-weight:700;">✨ Zero-Day 24h + Catalisador</span>`,
    renderDetailPanel: (stage) => renderStageScaleStrip([3500, 9000, 20000, 45000], (v) => `$${v.toLocaleString('pt-BR')}`, stage)
  });
})();
