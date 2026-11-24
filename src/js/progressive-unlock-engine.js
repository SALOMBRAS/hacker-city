/**
 * Hacker City // Motor de Desbloqueio Progressivo em 4 Degraus (Anti-Choque nos Primeiros 10 Minutos)
 *
 * Regras Oficiais & Blindagem Anti-Bug:
 * 1. Degrau 1 (Minuto 0 · Recruta): Exibe apenas os 13 módulos essenciais (Início limpo, Internet, Programas,
 *    Peças, Fila, Rastros, Senhas, Universidade, Banco, Esconderijo, Mensagens, Bate-Papo e Minha Conta).
 * 2. Degrau 2 (~10m · Rua): Destrava Lavar Dinheiro no EXATO SEGUNDO do 1º Dinheiro Sujo (> $0) ou CERT-101;
 *    Missões no CERT-101; Bitcoin, Fórum, Notícias, Placar, Terminal e Fliperama em 150 REP ou CERT-102.
 * 3. Degrau 3 (250+ REP ou CERT-201): Destrava Mapa-Múndi, Bolsa & 6 Desafios, Talentos, Polícia FBI,
 *    Conexões ao Vivo, Jogadores Online e Clãs.
 * 4. Degrau 4 (500+ REP ou CERT-301): Destrava Laboratório de Vírus, Servidores & LAN (VPS) e Fuga 404.
 * 5. Trava Permanente "everUnlocked": Abriu uma vez, NUNCA tranca de volta mesmo se perder REP depois!
 * 6. Escudo Iniciante (< 200 REP): Bloqueia invasões surpresa na porta 22 enquanto o novato aprende o básico.
 * 7. Opção "Modo Veterano (Mostrar Todo o Menu)": Mostra todos os atalhos visuais sem burlar regras de jogo.
 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const NEWBIE_SHIELD_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas reais (86.400.000 ms) de Escudo de Novato

  const STEP1_ALWAYS_OPEN = new Set([
    'winHome',
    'winBrowser',
    'winSoftware',
    'winHardware',
    'winTaskManager',
    'winLogs',
    'winHackedDb',
    'winUniversity',
    'winBank',
    'winQuitinete',
    'winMail',
    'winIrc',
    'winProfile',
    'winCracker',
    'winScanner',
    'winBotnetC2'
  ]);

  const MODULE_UNLOCK_RULES = {
    winMissions: {
      step: 2,
      label: 'Trabalhos & Missões',
      shortHint: 'Concluir Curso Grátis #1 (CERT-101) ou 120 REP',
      fullDesc: 'Faça o Curso #1 (grátis e rápido) na Universidade para liberar o mural de contratos e trabalhos pagos!'
    },
    winLaundering: {
      step: 2,
      label: 'Lavar Dinheiro & Alugar Vírus',
      shortHint: 'Ganhar seu 1º Dinheiro Sujo ou Curso #1',
      fullDesc: 'Abre automaticamente no instante em que você conseguir seu 1º Dinheiro Sujo em uma invasão (ou concluir o Curso #1)!'
    },
    winBitcoin: {
      step: 2,
      label: 'Carteira Bitcoin (BTC)',
      shortHint: 'Minerar/ganhar BTC, Curso #2 ou 150 REP',
      fullDesc: 'Abre assim que você ganhar Bitcoin em missões/mineração, chegar a 150 REP ou concluir o Curso #2!'
    },
    winForum: {
      step: 2,
      label: 'Fórum da Rede & Serviços',
      shortHint: 'Curso #2 (CERT-102) ou 150 REP',
      fullDesc: 'Chegue a 150 REP ou conclua o Curso #2 na Universidade para participar do Fórum e pegar serviços entre jogadores.'
    },
    winNews: {
      step: 2,
      label: 'Notícias da Rede',
      shortHint: 'Curso #2 (CERT-102) ou 150 REP',
      fullDesc: 'Chegue a 150 REP ou conclua o Curso #2 para acompanhar as manchetes das invasões e da Bolsa.'
    },
    winRanking: {
      step: 2,
      label: 'Placar dos Melhores',
      shortHint: 'Curso #2 (CERT-102) ou 150 REP',
      fullDesc: 'Chegue a 150 REP ou conclua o Curso #2 para disputar a Temporada Mensal e ver o Hall da Fama.'
    },
    winTerminal: {
      step: 2,
      label: 'Terminal de Comandos',
      shortHint: 'Curso #2 (CERT-102) ou 150 REP',
      fullDesc: 'Ferramenta opcional de linha de comando liberada em 150 REP ou após concluir o Curso #2.'
    },
    winArcade: {
      step: 2,
      label: 'Fliperama de Treino',
      shortHint: 'Curso #2 (CERT-102) ou 150 REP',
      fullDesc: 'Liberado em 150 REP ou após concluir o Curso #2 na Universidade.'
    },
    winWorldMap: {
      step: 3,
      label: 'Mapa-Múndi & Rotas',
      shortHint: '250 REP ou Curso #3 (CERT-201)',
      fullDesc: 'Chegue a 250 REP ou conclua o Curso #3! Você vai usar o Mapa-Múndi para ligar cidades na sua rota antes de invadir servidores Nível 3+.'
    },
    winOpsHub: {
      step: 3,
      label: 'Bolsa de Empresas & Desafios',
      shortHint: '250 REP ou Curso #3 (CERT-201)',
      fullDesc: 'Chegue a 250 REP ou conclua o Curso #3 para apostar na alta/queda das empresas, usar Dossiês de Senha e disputar Leilões!'
    },
    winSkillTree: {
      step: 3,
      label: 'Talentos & Classes',
      shortHint: '250 REP ou Curso #3 (CERT-201)',
      fullDesc: 'Chegue a 250 REP ou conclua o Curso #3 para distribuir seus Pontos de Talento e escolher sua subclasse.'
    },
    winFbi: {
      step: 3,
      label: 'Polícia & Recompensas',
      shortHint: '250 REP, Curso #3 ou Nível 3+ de Procura',
      fullDesc: 'Abre em 250 REP, no Curso #3 ou imediatamente caso seu Nível de Procura suba para 3+.'
    },
    winConnManager: {
      step: 3,
      label: 'Conexões ao Vivo',
      shortHint: '250 REP ou Curso #3 (CERT-201)',
      fullDesc: 'Painel de monitoramento de portas liberado em 250 REP ou após o Curso #3 (até 200 REP você conta com o Escudo Iniciante!).'
    },
    winOnline: {
      step: 3,
      label: 'Jogadores Online',
      shortHint: '200 REP ou Curso #2 (CERT-102)',
      fullDesc: 'Chegue a 200 REP ou conclua o Curso #2 para inspecionar operadores online na rede.'
    },
    winClan: {
      step: 3,
      label: 'Equipes & Guerras (Clãs)',
      shortHint: '250 REP ou Curso #3 (CERT-201)',
      fullDesc: 'Chegue a 250 REP ou conclua o Curso #3 para entrar em um Clã, assinar Patrocínios e disputar Guerras!'
    },
    winVirusLab: {
      step: 4,
      label: 'Laboratório de Vírus',
      shortHint: '500 REP ou Curso #4 (CERT-301)',
      fullDesc: 'Chegue a 500 REP ou conclua o Curso #4 (CERT-301) para criar seus próprios vírus combinando blocos e cumprir Encomendas de $ 18.000 Limpos!'
    },
    winLan: {
      step: 4,
      label: 'Servidores & LAN (VPS)',
      shortHint: 'Comprar 1ª VPS, 500 REP ou Curso #4',
      fullDesc: 'Abre automaticamente ao contratar sua 1ª VPS em Peças do PC, chegar a 500 REP ou concluir o Curso #4!'
    },
    winPanic: {
      step: 4,
      label: 'Fuga de Emergência (Protocolo 404)',
      shortHint: '500 REP, Curso #4 ou Procura Nível 4+',
      fullDesc: 'Sistema de destruição rápida de provas liberado em 500 REP, Curso #4 ou caso sua Procura chegue ao Nível 4+.'
    }
  };

  class ProgressiveUnlockEngine {
    constructor() {
      this.userId = null;
      this.state = null;
      this._initializedUid = null;
      this._syncTimer = null;
      this.startWatcher();
    }

    storageKey(uidOverride = null) {
      const uid = uidOverride || (window.currentProfile && window.currentProfile.id) || 'guest';
      return `HC_PROGRESSIVE_UNLOCKS_V1_${uid}`;
    }

    resolveProfileCreatedMs() {
      const p = window.currentProfile;
      if (p && p.created_at) {
        const parsed = Date.parse(p.created_at);
        if (Number.isFinite(parsed) && parsed > 0) return parsed;
      }
      return Date.now();
    }

    normalizeState(raw) {
      const s = raw && typeof raw === 'object' ? { ...raw } : {};
      if (!s.everUnlocked || typeof s.everUnlocked !== 'object') s.everUnlocked = {};
      if (!s.unseenNew || typeof s.unseenNew !== 'object') s.unseenNew = {};
      if (typeof s.veteranShowAll !== 'boolean') s.veteranShowAll = false;
      if (typeof s.seededInitial !== 'boolean') s.seededInitial = false;
      const fallbackStart = this.resolveProfileCreatedMs();
      s.shieldStartedAt = (Number.isFinite(Number(s.shieldStartedAt)) && Number(s.shieldStartedAt) > 0)
        ? Number(s.shieldStartedAt)
        : fallbackStart;
      if (window.currentProfile && window.currentProfile.created_at) {
        const createdMs = Date.parse(window.currentProfile.created_at);
        if (Number.isFinite(createdMs) && createdMs > 0) {
          s.shieldStartedAt = Math.min(s.shieldStartedAt, createdMs);
        }
      }
      if (typeof s.shieldBrokenByPvp !== 'boolean') s.shieldBrokenByPvp = false;
      if (typeof s.shieldBrokenReason !== 'string') s.shieldBrokenReason = '';
      return s;
    }

    ensureLoaded() {
      const uid = (window.currentProfile && window.currentProfile.id) || 'guest';
      if (this.userId === uid && this.state) return this.state;
      this.userId = uid;
      let parsed = null;
      try {
        const raw = localStorage.getItem(this.storageKey(uid));
        if (raw) parsed = JSON.parse(raw);
      } catch (e) {}
      this.state = this.normalizeState(parsed);
      if (!this.state.seededInitial && window.currentProfile) {
        this.evaluateUnlocks(true);
        this.state.seededInitial = true;
        this.save(true);
      }
      return this.state;
    }

    save(silentCloud = false) {
      if (!this.state) return;
      try {
        localStorage.setItem(this.storageKey(this.userId), JSON.stringify(this.state));
      } catch (e) {}
      if (!silentCloud && window.onlineEngine && typeof window.onlineEngine.scheduleSave === 'function') {
        window.onlineEngine.scheduleSave(false);
      }
    }

    getSnapshotState() {
      this.ensureLoaded();
      return JSON.parse(JSON.stringify(this.state));
    }

    applySnapshotState(snap) {
      if (!snap || typeof snap !== 'object') return;
      this.userId = (window.currentProfile && window.currentProfile.id) || 'guest';
      const prevEver = (this.state && this.state.everUnlocked) || {};
      const prevStart = (this.state && this.state.shieldStartedAt) || null;
      const prevBroken = !!(this.state && this.state.shieldBrokenByPvp);
      const next = this.normalizeState(snap);
      // União monotônica: nunca perde um desbloqueio nem reseta o relógio de 24h do escudo!
      next.everUnlocked = { ...prevEver, ...next.everUnlocked };
      if (prevStart && prevStart > 0) {
        next.shieldStartedAt = Math.min(prevStart, next.shieldStartedAt);
      }
      next.shieldBrokenByPvp = prevBroken || !!next.shieldBrokenByPvp;
      this.state = next;
      this.save(true);
      this.syncSidebarDom();
    }

    formatShieldRemaining(ms) {
      const safe = Math.max(0, Number(ms || 0));
      if (safe <= 0) return 'Expirado';
      const totalMin = Math.ceil(safe / 60000);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
      return `${m}m`;
    }

    getNewbieShieldStatus() {
      this.ensureLoaded();
      const now = Date.now();
      const rep = Number((window.currentProfile && window.currentProfile.reputation) || 100);
      const hasCert4 = !!(window.universityEngine && typeof window.universityEngine.hasCert === 'function' && window.universityEngine.hasCert(4));
      const shieldStartedAt = Number(this.state.shieldStartedAt || now);
      const shieldUntilMs = shieldStartedAt + NEWBIE_SHIELD_DURATION_MS;
      const remainingMs = Math.max(0, shieldUntilMs - now);
      const brokenByPvp = !!this.state.shieldBrokenByPvp;
      const graduatedByTier = rep >= 1000 || hasCert4;
      const active = !brokenByPvp && !graduatedByTier && remainingMs > 0;

      return {
        active,
        remainingMs: active ? remainingMs : 0,
        formattedRemaining: active ? this.formatShieldRemaining(remainingMs) : 'Encerrado',
        shieldStartedAt,
        shieldUntilMs: active ? shieldUntilMs : 0,
        brokenByPvp,
        brokenReason: this.state.shieldBrokenReason || '',
        graduatedByTier
      };
    }

    isNewbiePvpShieldActive() {
      return this.getNewbieShieldStatus().active;
    }

    checkLiveCondition(winId) {
      if (STEP1_ALWAYS_OPEN.has(winId)) return true;
      const rep = Number((window.currentProfile && window.currentProfile.reputation) || 100);
      const heat = Number((window.currentProfile && window.currentProfile.heat_level) || 1);
      const hasCert = (n) => !!(window.universityEngine && typeof window.universityEngine.hasCert === 'function' && window.universityEngine.hasCert(n));
      const dirty = (window.nineSystemsEngine && typeof window.nineSystemsEngine.getDirtyBalance === 'function')
        ? window.nineSystemsEngine.getDirtyBalance()
        : 0;
      const hasCompany = !!(window.nineSystemsEngine && window.nineSystemsEngine.state && window.nineSystemsEngine.state.myCompany);
      const hasWashJobs = !!(window.nineSystemsEngine && window.nineSystemsEngine.state && Array.isArray(window.nineSystemsEngine.state.washingJobs) && window.nineSystemsEngine.state.washingJobs.length > 0);
      const btc = window.bitcoinEngine ? Number(window.bitcoinEngine.btcBalance || 0) : 0;
      const vpsCount = (window.lanServersEngine && Array.isArray(window.lanServersEngine.servers))
        ? Math.max(0, window.lanServersEngine.servers.length - 1)
        : 0;
      const labStrains = (window.virusLabEngine && window.virusLabEngine.state && Array.isArray(window.virusLabEngine.state.creations))
        ? window.virusLabEngine.state.creations.length
        : 0;
      const hasClan = !!(window.clanEngine && typeof window.clanEngine.getMyClan === 'function' && window.clanEngine.getMyClan());

      switch (winId) {
        case 'winLaundering':
          return dirty > 0 || hasCompany || hasWashJobs || hasCert(1) || rep >= 140;
        case 'winMissions':
          return hasCert(1) || rep >= 120;
        case 'winBitcoin':
          return btc > 0.0004 || hasCert(2) || rep >= 150;
        case 'winForum':
        case 'winNews':
        case 'winRanking':
        case 'winTerminal':
        case 'winArcade':
          return hasCert(2) || rep >= 150;
        case 'winOnline':
          return hasCert(2) || rep >= 200;
        case 'winWorldMap':
        case 'winOpsHub':
        case 'winSkillTree':
        case 'winConnManager':
          return hasCert(3) || rep >= 250;
        case 'winClan':
          return hasClan || hasCert(3) || rep >= 250;
        case 'winFbi':
          return heat >= 3 || hasCert(3) || rep >= 250;
        case 'winVirusLab':
          return labStrains > 0 || hasCert(4) || rep >= 500;
        case 'winLan':
          return vpsCount > 0 || hasCert(4) || rep >= 500;
        case 'winPanic':
          return heat >= 4 || hasCert(4) || rep >= 500;
        default:
          return true;
      }
    }

    evaluateUnlocks(silent = false) {
      if (!window.currentProfile) return [];
      this.ensureLoaded();
      const newlyUnlocked = [];

      Object.keys(MODULE_UNLOCK_RULES).forEach((winId) => {
        if (this.state.everUnlocked[winId]) return;
        if (this.checkLiveCondition(winId)) {
          this.state.everUnlocked[winId] = true;
          if (!silent) {
            this.state.unseenNew[winId] = true;
            newlyUnlocked.push(winId);
          }
        }
      });

      if (newlyUnlocked.length > 0) {
        this.save();
        this.syncSidebarDom();
        if (window.winManager && window.winManager.current === 'winHome' && typeof window.renderHome === 'function') {
          window.renderHome();
        }
        const firstMeta = MODULE_UNLOCK_RULES[newlyUnlocked[0]];
        const extraTxt = newlyUnlocked.length > 1 ? ` (+${newlyUnlocked.length - 1} módulo[s])` : '';
        if (typeof window.showToast === 'function' && firstMeta) {
          window.showToast(`🔓 NOVO SISTEMA LIBERADO: ${firstMeta.label}${extraTxt}! Confira o selo NOVO no menu lateral.`);
        }
      }
      return newlyUnlocked;
    }

    isUnlocked(winId) {
      if (STEP1_ALWAYS_OPEN.has(winId)) return true;
      this.ensureLoaded();
      if (this.state.veteranShowAll) return true;
      if (this.state.everUnlocked[winId]) return true;
      if (this.checkLiveCondition(winId)) {
        this.state.everUnlocked[winId] = true;
        this.save(true);
        return true;
      }
      return false;
    }

    markSeen(winId) {
      if (!this.state || !this.state.unseenNew || !this.state.unseenNew[winId]) return;
      delete this.state.unseenNew[winId];
      this.save(true);
      this.syncSidebarDom();
    }

    getCurrentStepNumber() {
      this.ensureLoaded();
      if (this.state.veteranShowAll || this.isUnlocked('winVirusLab')) return 4;
      if (this.isUnlocked('winOpsHub')) return 3;
      if (this.isUnlocked('winLaundering') || this.isUnlocked('winMissions')) return 2;
      return 1;
    }

    toggleVeteranShowAll(forceVal = null) {
      this.ensureLoaded();
      this.state.veteranShowAll = typeof forceVal === 'boolean' ? forceVal : !this.state.veteranShowAll;
      this.save();
      this.syncSidebarDom();
      if (typeof window.renderHome === 'function' && window.winManager?.current === 'winHome') {
        window.renderHome();
      }
      this.renderProfilePreferenceCard();
      const msg = this.state.veteranShowAll
        ? '🔓 Modo Veterano ativado: todas as 27 telas estão visíveis no menu lateral (as regras de preço e diploma continuam valendo!).'
        : '🧭 Modo Progressivo ativado: o menu lateral mostra apenas as telas já conquistadas no seu estágio.';
      if (typeof window.showToast === 'function') window.showToast(msg);
      return this.state.veteranShowAll;
    }

    notifyResourceEarned(kind) {
      // Chamado instantaneamente quando entra Dinheiro Sujo, BTC ou VPS!
      this.evaluateUnlocks(false);
    }

    closeUnlockModal() {
      const m = typeof document !== 'undefined' ? document.getElementById('hcUnlockPreviewModal') : null;
      if (m) m.remove();
    }

    showUnlockHintModal(winId) {
      if (typeof document === 'undefined') return;
      this.closeUnlockModal();
      const meta = MODULE_UNLOCK_RULES[winId] || {
        step: 2,
        label: 'Sistema Avançado',
        shortHint: 'Evolua reputação ou cursos',
        fullDesc: 'Continue avançando nos cursos da Universidade e nas invasões para liberar este sistema.'
      };
      const rep = Number((window.currentProfile && window.currentProfile.reputation) || 100);

      const wrap = document.createElement('div');
      wrap.id = 'hcUnlockPreviewModal';
      wrap.style.cssText = 'position:fixed;inset:0;z-index:9997;background:rgba(4,8,14,0.86);display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px;';
      wrap.innerHTML = `
        <div class="hc-card" style="max-width:500px;width:100%;margin:auto;padding:18px 18px;border-color:rgba(56,189,248,0.5);background:#0b1119;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;">
            <span class="hc-badge info">🔒 PRÓXIMA LIBERAÇÃO · DEGRAU ${meta.step}/4</span>
            <button type="button" class="hc-btn ghost sm" onclick="window.progressiveUnlockEngine.closeUnlockModal()">✕</button>
          </div>
          <h3 style="margin:0 0 6px;font-size:17px;color:var(--hc-text);">${esc(meta.label)}</h3>
          <p style="font-size:13px;color:var(--hc-text-2);margin:0 0 12px;line-height:1.5;">
            ${esc(meta.fullDesc)}
          </p>
          <div style="padding:10px 12px;border-radius:8px;background:#08121d;border:1px solid rgba(56,189,248,0.3);font-size:12.5px;color:#7dd3fc;margin-bottom:14px;">
            <strong>O que falta fazer:</strong> ${esc(meta.shortHint)} <span style="color:var(--hc-text-3);">(Você tem ${rep} REP)</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
            <button type="button" id="btnModalEnableVeteranMenu" class="hc-btn ghost sm"
              onclick="window.progressiveUnlockEngine.toggleVeteranShowAll(true); window.progressiveUnlockEngine.closeUnlockModal();">
              Já sou veterano (Mostrar tudo)
            </button>
            <div style="display:flex;gap:8px;">
              <button type="button" class="hc-btn ghost sm" onclick="window.progressiveUnlockEngine.closeUnlockModal()">Entendi</button>
              <button type="button" class="hc-btn primary sm" onclick="window.progressiveUnlockEngine.closeUnlockModal(); navTo('winUniversity');">🎓 Ir p/ Universidade →</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(wrap);
    }

    syncSidebarDom() {
      if (typeof document === 'undefined' || !window.currentProfile) return;
      this.ensureLoaded();

      document.querySelectorAll('details.nav-topic').forEach((topic) => {
        const sub = topic.querySelector('.nav-sublist');
        if (!sub) return;

        let firstLockedWinId = null;
        let lockedCount = 0;

        sub.querySelectorAll('.nav-item[data-win]').forEach((btn) => {
          const winId = btn.getAttribute('data-win');
          const open = this.isUnlocked(winId);
          btn.style.display = open ? '' : 'none';

          // Selo verde "NOVO" nos módulos recém-desbloqueados!
          let newPill = btn.querySelector('.hc-nav-new-pill');
          if (open && this.state.unseenNew[winId]) {
            if (!newPill) {
              newPill = document.createElement('span');
              newPill.className = 'hc-nav-new-pill';
              newPill.textContent = 'NOVO';
              btn.appendChild(newPill);
            }
          } else if (newPill) {
            newPill.remove();
          }

          if (!open) {
            lockedCount += 1;
            if (!firstLockedWinId) firstLockedWinId = winId;
          }
        });

        let previewBtn = sub.querySelector('.hc-next-unlock-pill');
        if (firstLockedWinId && !this.state.veteranShowAll) {
          const meta = MODULE_UNLOCK_RULES[firstLockedWinId];
          if (!previewBtn) {
            previewBtn = document.createElement('button');
            previewBtn.type = 'button';
            previewBtn.className = 'hc-next-unlock-pill';
            sub.appendChild(previewBtn);
          }
          const moreNote = lockedCount > 1 ? ` (+${lockedCount - 1})` : '';
          previewBtn.onclick = (ev) => {
            ev.stopPropagation();
            this.showUnlockHintModal(firstLockedWinId);
          };
          previewBtn.innerHTML = `
            <span class="hc-nup-title">🔒 Próximo: ${esc(meta ? meta.label : firstLockedWinId)}${moreNote}</span>
            <span class="hc-nup-sub">${esc(meta ? meta.shortHint : 'Avance na carreira')}</span>
          `;
        } else if (previewBtn) {
          previewBtn.remove();
        }
      });

      this.renderProfilePreferenceCard();
    }

    renderBeginnerHomeGuideHtml() {
      this.ensureLoaded();
      if (this.isUnlocked('winOpsHub')) return '';

      const tut = window.tutorialEngine ? window.tutorialEngine.getCurrentStepInfo() : null;
      const tutDone = !!(tut && tut.completed);
      const curStep = tut ? Number(tut.step || 1) : 1;
      const has101 = !!(window.universityEngine && window.universityEngine.hasCert(1));
      const invDone = tutDone || curStep >= 5;
      const dirty = window.nineSystemsEngine ? window.nineSystemsEngine.getDirtyBalance() : 0;
      const washedBefore = tutDone || curStep >= 6 || !!(window.nineSystemsEngine && window.nineSystemsEngine.state && window.nineSystemsEngine.state.washingJobs && window.nineSystemsEngine.state.washingJobs.length > 0);
      const readyClaim = !tutDone && curStep === 6;

      return `
        <div class="hc-card" id="beginnerThreeStepCard" style="margin-bottom:16px;padding:14px 16px;border-color:rgba(53,184,119,0.45);background:linear-gradient(145deg,rgba(14,28,22,0.92),rgba(11,16,24,0.96));">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
            <div>
              <span class="hc-badge success">🧭 JORNADA DO RECRUTA (${tutDone ? 'CONCLUÍDA ✓' : `ETAPA ${curStep} DE 6`})</span>
              ${this.isNewbiePvpShieldActive() ? `<span class="hc-badge info" style="margin-left:6px;">🛡️ Escudo Iniciante Ativo (&lt; 200 REP)</span>` : ''}
            </div>
            <span style="font-size:11.5px;color:var(--hc-text-3);">Siga os passos para aprender Invasão, Rastro e Lavagem na prática!</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">
            <div style="padding:10px 12px;border-radius:8px;background:#0a1118;border:1px solid ${has101 ? 'var(--hc-accent)' : '#1e2c3e'};">
              <strong style="font-size:12.5px;color:${has101 ? '#4ade80' : '#fff'};">${has101 ? '✓ ' : '1. '}Curso Grátis #1 (Imediato)</strong>
              <div style="font-size:11.5px;color:var(--hc-text-2);margin:4px 0 8px;">Ensina IP, Contas 12h e Sujo vs. Limpo (+100 REP e +$ 80).</div>
              <button type="button" class="hc-btn ${has101 ? 'ghost' : 'primary'} sm" onclick="navTo('winUniversity'); if(!${has101} && window.universityEngine) window.universityEngine.openCourseReader(1);">${has101 ? '✓ Concluído' : 'Fazer Curso #1 →'}</button>
            </div>
            <div style="padding:10px 12px;border-radius:8px;background:#0a1118;border:1px solid ${invDone ? 'var(--hc-accent)' : '#1e2c3e'};">
              <strong style="font-size:12.5px;color:${invDone ? '#4ade80' : '#fff'};">${invDone ? '✓ ' : '2. '}Invadir Treino &amp; Limpar IP</strong>
              <div style="font-size:11.5px;color:var(--hc-text-2);margin:4px 0 8px;">Invada <code>198.51.100.42</code>, ganhe $ 600 Sujos e apague a Log.</div>
              <button type="button" class="hc-btn ${invDone ? 'ghost' : 'primary'} sm" onclick="window.internetEngine.openIp('198.51.100.42', '${curStep === 4 ? 'entrar' : 'invadir'}')">${invDone ? '✓ Rastro Limpo' : 'Invadir 198.51.100.42 →'}</button>
            </div>
            <div style="padding:10px 12px;border-radius:8px;background:#0a1118;border:1px solid ${washedBefore ? 'var(--hc-accent)' : '#1e2c3e'};">
              <strong style="font-size:12.5px;color:${washedBefore ? '#4ade80' : '#fff'};">${washedBefore ? '✓ ' : '3. '}Lavar 1º Dinheiro Sujo (8s)</strong>
              <div style="font-size:11.5px;color:var(--hc-text-2);margin:4px 0 8px;">${readyClaim ? 'Prêmio de Formatura pronto para resgatar!' : (dirty > 0 ? `Lave seus $ ${Math.round(dirty)} Sujos em só 8s no 1º treino!` : 'Transforme notas sujas em Dinheiro Limpo na Vitrine!')}</div>
              ${readyClaim
                ? `<button type="button" class="hc-btn primary sm" onclick="window.tutorialEngine.claimFinalReward()">🏆 Resgatar +$ 500 + BTC →</button>`
                : `<button type="button" class="hc-btn ${dirty > 0 && !washedBefore ? 'primary' : 'ghost'} sm" onclick="navTo('winLaundering')">${washedBefore ? '✓ Já Lavou' : 'Abrir Lavagem →'}</button>`}
            </div>
          </div>
        </div>
      `;
    }

    renderProfilePreferenceCard() {
      if (typeof document === 'undefined') return;
      const anchor = document.getElementById('profileIpCardMount');
      if (!anchor || !anchor.parentElement) return;
      let box = document.getElementById('profileMenuModeCard');
      if (!box) {
        box = document.createElement('div');
        box.id = 'profileMenuModeCard';
        box.style.marginTop = '12px';
        anchor.insertAdjacentElement('afterend', box);
      }
      this.ensureLoaded();
      const vet = !!this.state.veteranShowAll;
      const stepNum = this.getCurrentStepNumber();
      box.innerHTML = `
        <div style="padding:10px 12px;border-radius:8px;background:var(--hc-inset);border:1px solid var(--hc-border);display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
          <div>
            <strong style="font-size:12.5px;color:var(--hc-text);">🧭 Menu Lateral Progressivo (Degrau ${stepNum}/4)</strong>
            <div style="font-size:11.5px;color:var(--hc-text-2);">${vet ? 'Mostrando todas as 27 telas (Modo Veterano ligado).' : 'Liberando novas telas aos poucos conforme você evolui.'}</div>
          </div>
          <button type="button" id="btnToggleVeteranMenuMode" class="hc-btn ${vet ? 'primary' : 'ghost'} sm" onclick="window.progressiveUnlockEngine.toggleVeteranShowAll()">
            ${vet ? '✓ Todo o Menu Visível' : 'Mostrar Todo o Menu'}
          </button>
        </div>
      `;
    }

    startWatcher() {
      if (typeof window === 'undefined') return;
      if (this._syncTimer) clearInterval(this._syncTimer);
      this._syncTimer = setInterval(() => {
        if (!window.currentProfile) return;
        if (this._initializedUid !== window.currentProfile.id) {
          this._initializedUid = window.currentProfile.id;
          this.ensureLoaded();
          this.syncSidebarDom();
        } else {
          this.evaluateUnlocks(false);
        }
      }, 2500);
    }
  }

  window.progressiveUnlockEngine = new ProgressiveUnlockEngine();
})();
