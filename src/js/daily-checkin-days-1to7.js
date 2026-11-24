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
})();
