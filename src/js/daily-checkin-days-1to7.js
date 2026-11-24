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
    }
  });
})();
