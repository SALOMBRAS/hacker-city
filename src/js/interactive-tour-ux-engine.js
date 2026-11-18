/**
 * Hacker City // Tour Guiado Interativo com Spotlight (Estilo Game Tutorial)
 * - Escurece o resto da tela com 4 cortinas ao redor do alvo (mantendo o botão real 100% clicável!)
 * - Desenha anel luminoso pulsante + etiqueta "👆 Clique aqui" exatamente onde o jogador deve clicar
 * - Card flutuante acessível (role="dialog", aria-labelledby) com linguagem simples para quem não é de TI
 * - Faz um mini-tour completo: Seu IP -> Tópico Meu Computador -> Programas Rodando & Carência ->
 *   Tópico Explorar & Invadir -> Navegar por IPs -> Quebrar Senha -> Apagar Rastro & Deixar Farpa (+$500 HC!)
 */
(function () {
  'use strict';

  const TOUR_REWARD_CASH = 500;
  const TOUR_REWARD_REP = 100;
  const TRAINING_IP = '198.51.100.42';

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  class InteractiveSpotlightTourEngine {
    constructor() {
      this.isActive = false;
      this.stepIndex = 0;
      this.statusByUid = {};
      this.rewardedByUid = {};
      this.steps = this.buildSteps();
      this.domReady = false;
      this.trackTimer = null;
      this.boundTargetEl = null;
      this.boundClickHandler = null;
      this.crackWatchTimer = null;
    }

    storageKey(uid) {
      return `HC_SPOTLIGHT_TOUR_DONE_${uid || 'guest'}`;
    }

    rewardKey(uid) {
      return `HC_SPOTLIGHT_TOUR_REWARDED_${uid || 'guest'}`;
    }

    currentUid() {
      return (window.currentProfile && window.currentProfile.id) || 'guest';
    }

    hasCompletedOrSkipped() {
      const uid = this.currentUid();
      if (this.statusByUid[uid]) return true;
      try {
        const v = localStorage.getItem(this.storageKey(uid));
        if (v) {
          this.statusByUid[uid] = v;
          return true;
        }
      } catch (e) {}
      return false;
    }

    maybeAutoStartForSession() {
      if (window.DISABLE_AUTO_TOUR) return;
      try {
        if (localStorage.getItem('HC_DISABLE_AUTO_TOUR') === '1') return;
      } catch (e) {}
      if (this.hasCompletedOrSkipped() || this.isActive) return;

      setTimeout(() => {
        if (!window.currentProfile || this.isActive || this.hasCompletedOrSkipped()) return;
        this.start(false);
      }, 550);
    }

    injectStylesAndDom() {
      if (this.domReady && document.getElementById('hcSpotlightRoot')) return;

      if (!document.getElementById('hcSpotlightStyles')) {
        const st = document.createElement('style');
        st.id = 'hcSpotlightStyles';
        st.textContent = `
          #hcSpotlightRoot {
            position: fixed;
            inset: 0;
            z-index: 9400;
            pointer-events: none;
            display: none;
          }
          #hcSpotlightRoot.active {
            display: block;
          }
          .hc-tour-mask {
            position: fixed;
            background: rgba(5, 8, 13, 0.82);
            backdrop-filter: blur(1.5px);
            pointer-events: auto;
            transition: top .18s ease, left .18s ease, width .18s ease, height .18s ease;
          }
          #hcTourRing {
            position: fixed;
            z-index: 9402;
            pointer-events: none;
            border: 2px solid #35b877;
            border-radius: 10px;
            box-shadow: 0 0 0 4px rgba(53, 184, 119, 0.24), 0 0 28px rgba(53, 184, 119, 0.55);
            transition: top .18s ease, left .18s ease, width .18s ease, height .18s ease, transform .18s ease;
            animation: hcTourPulse 1.6s infinite ease-in-out;
          }
          #hcTourRing.nudge {
            border-color: #f5b942;
            box-shadow: 0 0 0 7px rgba(245, 185, 66, 0.42), 0 0 36px rgba(245, 185, 66, 0.85);
            transform: scale(1.03);
          }
          @keyframes hcTourPulse {
            0%, 100% { box-shadow: 0 0 0 3px rgba(53, 184, 119, 0.22), 0 0 22px rgba(53, 184, 119, 0.48); }
            50% { box-shadow: 0 0 0 7px rgba(53, 184, 119, 0.36), 0 0 34px rgba(53, 184, 119, 0.75); }
          }
          #hcTourPointerPill {
            position: absolute;
            top: -28px;
            left: 0;
            background: #35b877;
            color: #06130d;
            font-size: 11.5px;
            font-weight: 800;
            letter-spacing: 0.02em;
            padding: 3px 9px;
            border-radius: 999px;
            white-space: nowrap;
            box-shadow: 0 4px 14px rgba(0,0,0,0.55);
          }
          #hcTourPointerPill.below {
            top: auto;
            bottom: -28px;
          }
          #hcTourCard {
            position: fixed;
            z-index: 9405;
            pointer-events: auto;
            width: min(400px, calc(100vw - 24px));
            background: #131922;
            border: 1px solid rgba(53, 184, 119, 0.55);
            border-radius: 14px;
            padding: 13px 16px;
            color: var(--hc-text, #e8edf4);
            box-shadow: 0 22px 60px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(53, 184, 119, 0.18);
            transition: top .2s ease, left .2s ease;
          }
          .hc-tour-toprow {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }
          .hc-tour-step-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(53, 184, 119, 0.14);
            border: 1px solid rgba(53, 184, 119, 0.38);
            color: #5eead4;
            font-family: var(--hc-font-mono, monospace);
            font-size: 11px;
            font-weight: 700;
            padding: 2px 9px;
            border-radius: 999px;
          }
          .hc-tour-skip-btn {
            background: transparent;
            border: 1px solid var(--hc-border, #263040);
            color: var(--hc-text-2, #9aa6b8);
            border-radius: 7px;
            padding: 3px 8px;
            font-size: 11.5px;
            cursor: pointer;
          }
          .hc-tour-skip-btn:hover {
            background: rgba(255,255,255,0.06);
            color: #fff;
          }
          #hcTourCardTitle {
            font-size: 16px;
            font-weight: 700;
            margin: 0 0 6px;
            color: #ffffff;
            line-height: 1.28;
          }
          #hcTourCardDesc {
            font-size: 13.2px;
            line-height: 1.5;
            color: #c5d0df;
            margin: 0 0 10px;
          }
          #hcTourActionHint {
            background: rgba(53, 184, 119, 0.09);
            border-left: 3px solid #35b877;
            border-radius: 6px;
            padding: 7px 10px;
            font-size: 12.3px;
            color: #dffaf0;
            margin-bottom: 12px;
          }
          .hc-tour-dots {
            display: flex;
            gap: 5px;
            align-items: center;
          }
          .hc-tour-dot {
            width: 7px;
            height: 7px;
            border-radius: 999px;
            background: #2b3648;
            transition: width .18s ease, background .18s ease;
          }
          .hc-tour-dot.done {
            background: rgba(53, 184, 119, 0.55);
          }
          .hc-tour-dot.current {
            width: 18px;
            background: #35b877;
          }
          .hc-tour-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            padding-top: 8px;
            border-top: 1px solid rgba(255,255,255,0.07);
          }
          .hc-tour-footer button {
            white-space: nowrap;
          }
        `;
        document.head.appendChild(st);
      }

      let root = document.getElementById('hcSpotlightRoot');
      if (!root) {
        root = document.createElement('div');
        root.id = 'hcSpotlightRoot';
        root.innerHTML = `
          <div id="hcTourMaskTop" class="hc-tour-mask"></div>
          <div id="hcTourMaskBottom" class="hc-tour-mask"></div>
          <div id="hcTourMaskLeft" class="hc-tour-mask"></div>
          <div id="hcTourMaskRight" class="hc-tour-mask"></div>
          <div id="hcTourRing">
            <div id="hcTourPointerPill">👆 Clique aqui</div>
          </div>
          <div id="hcTourCard" role="dialog" aria-modal="false" aria-labelledby="hcTourCardTitle">
            <div class="hc-tour-toprow">
              <span class="hc-tour-step-badge" id="hcTourStepCounter">Passo 1 de 8</span>
              <button type="button" id="btnTourSkip" class="hc-tour-skip-btn">Pular Tutorial ✕</button>
            </div>
            <h3 id="hcTourCardTitle">Bem-vindo!</h3>
            <p id="hcTourCardDesc"></p>
            <div id="hcTourActionHint"></div>
            <div class="hc-tour-footer">
              <div class="hc-tour-dots" id="hcTourDots"></div>
              <div style="display:flex;gap:6px;">
                <button type="button" id="btnTourPrev" class="hc-btn ghost sm">← Voltar</button>
                <button type="button" id="btnTourNext" class="hc-btn primary sm">Próximo →</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(root);

        ['hcTourMaskTop', 'hcTourMaskBottom', 'hcTourMaskLeft', 'hcTourMaskRight'].forEach((id) => {
          const maskEl = document.getElementById(id);
          if (maskEl) {
            maskEl.addEventListener('click', (ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              this.nudgeSpotlight();
            });
          }
        });

        document.getElementById('btnTourSkip').addEventListener('click', () => this.skip());
        document.getElementById('btnTourPrev').addEventListener('click', () => this.prev());
        document.getElementById('btnTourNext').addEventListener('click', () => this.handleNextButton());
      }

      this.domReady = true;
    }

    nudgeSpotlight() {
      const ring = document.getElementById('hcTourRing');
      const pill = document.getElementById('hcTourPointerPill');
      if (!ring) return;
      ring.classList.add('nudge');
      if (pill) {
        const prev = pill.textContent;
        pill.textContent = '👆 Clique aqui dentro da luz!';
        setTimeout(() => {
          if (this.isActive) pill.textContent = prev;
        }, 1100);
      }
      setTimeout(() => ring.classList.remove('nudge'), 450);
    }

    buildSteps() {
      return [
        {
          id: 'my_ip',
          selector: '#hudMyIpChip',
          pointerLabel: '👀 Seu Endereço (IP)',
          requiresDirectClick: false,
          title: '1. O Endereço do Seu PC (Seu IP)',
          desc: 'Não precisa saber nada de informática! Pense nesse número aqui em cima como a <strong>placa do seu carro</strong> na internet.',
          hint: '💡 Se você invadir alguém e esquecer esse número anotado lá dentro, outros jogadores ou robôs vão descobrir quem você é!',
          nextLabel: 'Entendi, Próximo →',
          onEnter: () => {
            if (typeof window.navTo === 'function') window.navTo('winHome');
            document.querySelectorAll('details.nav-topic').forEach((d) => { d.open = false; });
          }
        },
        {
          id: 'topic_pc',
          selector: '#navSummary_pc',
          pointerLabel: '👆 Clique neste tópico',
          requiresDirectClick: true,
          sidebarStep: true,
          title: '2. Menu Limpo por Tópicos',
          desc: 'Repare na lateral esquerda: em vez de dezenas de botões soltos, tudo fica guardado em <strong>5 tópicos simples</strong> que só abrem quando você clica.',
          hint: '👆 <strong>Clique agora em "Meu Computador"</strong> (na área iluminada) para abrir o mini-menu dele!',
          nextLabel: 'Abrir Meu Computador →',
          onEnter: () => {
            const d = document.getElementById('navTopic_pc');
            if (d) d.open = false;
            this.ensureMobileDrawerIfNeeded(true);
          },
          triggerAction: () => {
            const d = document.getElementById('navTopic_pc');
            if (d) d.open = true;
          }
        },
        {
          id: 'open_software',
          selector: 'button.nav-item[data-win="winSoftware"]',
          pointerLabel: '👆 Clique aqui',
          requiresDirectClick: true,
          sidebarStep: true,
          title: '3. Programas & Proteção do Seu PC',
          desc: 'Boa! O sub-menu abriu com tudo o que pertence ao seu computador: seus programas, fila de ações, peças do PC e seus rastros.',
          hint: '👆 <strong>Clique em "Programas & Proteção"</strong> para ver o que está ligado no seu PC agora!',
          nextLabel: 'Abrir Programas →',
          onEnter: () => {
            const d = document.getElementById('navTopic_pc');
            if (d) d.open = true;
            this.ensureMobileDrawerIfNeeded(true);
          },
          triggerAction: () => {
            if (typeof window.navTo === 'function') window.navTo('winSoftware');
          }
        },
        {
          id: 'running_ram_cooldown',
          selector: '#runningProgramsPanel',
          pointerLabel: '👀 Regra de Carência',
          requiresDirectClick: false,
          title: '4. Um Escudo por Vez + Tempo de Carência!',
          desc: 'Aqui em cima você vê tudo o que está <strong>rodando agora</strong>. Você <strong>não pode ligar 2 Firewalls ao mesmo tempo</strong>!',
          hint: '⏱️ Quando conseguir um Firewall melhor (ex: v1.5), você desliga o antigo (v1.0) e aguarda alguns segundos de <strong>Tempo de Carência</strong> (ficando desprotegido na troca!) até o novo assumir.',
          nextLabel: 'Legal! Próximo →',
          onEnter: () => {
            this.ensureMobileDrawerIfNeeded(false);
            if (window.winManager && window.winManager.current !== 'winSoftware') {
              if (typeof window.navTo === 'function') window.navTo('winSoftware');
            }
            if (window.softwareEngine && window.softwareEngine.state) {
              window.softwareEngine.state.activeTab = 'tools';
              window.softwareEngine.renderUI('softwareAppBody');
            }
          }
        },
        {
          id: 'topic_net',
          selector: '#navSummary_net',
          pointerLabel: '👆 Clique neste tópico',
          requiresDirectClick: true,
          sidebarStep: true,
          title: '5. Hora da Ação: Explorar & Invadir',
          desc: 'Agora vamos fazer sua primeira invasão real passo a passo! Tudo sobre outros computadores e jogadores online fica no segundo tópico.',
          hint: '👆 <strong>Clique em "Explorar & Invadir"</strong> no menu lateral para abrir as opções de rede!',
          nextLabel: 'Abrir Explorar & Invadir →',
          onEnter: () => {
            const d = document.getElementById('navTopic_net');
            if (d) d.open = false;
            this.ensureMobileDrawerIfNeeded(true);
          },
          triggerAction: () => {
            const d = document.getElementById('navTopic_net');
            if (d) d.open = true;
          }
        },
        {
          id: 'open_browser',
          selector: 'button.nav-item[data-win="winBrowser"]',
          pointerLabel: '👆 Clique em Navegar por IPs',
          requiresDirectClick: true,
          sidebarStep: true,
          title: '6. O Navegador de Computadores',
          desc: 'Por aqui você entra em qualquer endereço IP de empresas, bancos, robôs de puzzles (onde se baixam os primeiros vírus!) e outros jogadores.',
          hint: '👆 <strong>Clique em "Navegar por IPs"</strong> para abrirmos um computador de treinamento na sua mira!',
          nextLabel: 'Ir p/ Navegar por IPs →',
          onEnter: () => {
            const d = document.getElementById('navTopic_net');
            if (d) d.open = true;
            this.ensureMobileDrawerIfNeeded(true);
          },
          triggerAction: () => {
            if (window.internetEngine) {
              window.internetEngine.openIp(TRAINING_IP, 'invadir');
            } else if (typeof window.navTo === 'function') {
              window.navTo('winBrowser');
            }
          }
        },
        {
          id: 'crack_password',
          selector: '#btnInetBruteforce',
          fallbackSelector: '#cardAttackBruteforce',
          pointerLabel: '👆 Clique p/ Quebrar a Senha!',
          requiresDirectClick: true,
          title: '7. Quebrando a Senha do Alvo!',
          desc: `Colocamos o computador de treino (<code>${TRAINING_IP}</code>) na aba <strong>3. Invadir PC</strong>. Como seu Quebrador de Senhas (<code>v1.0</code>) alcança o Escudo dele (<code>v1.0</code>), a invasão está liberada!`,
          hint: '🔑 <strong>Clique em "Quebrar Senha Agora"</strong> e aguarde a barrinha chegar a 100%!',
          nextLabel: 'Quebrar Senha Agora →',
          onEnter: () => {
            this.ensureMobileDrawerIfNeeded(false);
            if (window.internetEngine) {
              if (window.internetEngine.activeSshIp === TRAINING_IP) {
                setTimeout(() => {
                  if (this.isActive && this.stepIndex === 6) this.goToStep(7);
                }, 120);
                return;
              }
              window.internetEngine.openIp(TRAINING_IP, 'invadir');
            }
            this.startWatchingCrackCompletion();
          },
          triggerAction: () => {
            if (!window.internetEngine) return;
            if (window.internetEngine.activeSshIp === TRAINING_IP) {
              this.goToStep(7);
              return;
            }
            if (!window.internetEngine.isCracking) {
              window.internetEngine.startBruteforce();
            }
            this.startWatchingCrackCompletion();
          }
        },
        {
          id: 'wipe_log_and_taunt',
          selector: '#remoteTauntQuickBar',
          fallbackSelector: '#remoteLogEditorBox',
          pointerLabel: '👆 Apague seu IP & Deixe Farpa!',
          requiresDirectClick: true,
          title: '8. Apague Seu Rastro (Regra de Sobrevivência!)',
          desc: 'Você entrou no PC dele! Mas olhe o alerta vermelho: <strong>seu IP ficou gravado nos rastros dele</strong>. Jogadores espertos apagam o próprio IP e ainda deixam uma farpa tirando onda!',
          hint: '🔥 <strong>Clique em "Apagar Meu IP & Deixar Farpa"</strong> (na faixa iluminada) para limpar seu rastro e receber <strong>+$ 500 HC + 100 REP</strong>!',
          nextLabel: 'Concluir (+$500) →',
          onEnter: () => {
            this.ensureMobileDrawerIfNeeded(false);
            if (window.internetEngine) {
              if (window.internetEngine.activeSshIp !== TRAINING_IP) {
                const host = window.internetEngine.resolveHost(TRAINING_IP);
                window.internetEngine.onAttackSucceeded(host, 'password', host.rootPassword || 'admin123', 'root');
              }
              window.internetEngine.activeTab = 'entrar';
              window.internetEngine.sshSubTab = 'logs';
              window.internetEngine.render('internetAppBody');
            }
          },
          triggerAction: () => {
            if (window.internetEngine && typeof window.internetEngine.applyQuickTauntToRemoteLog === 'function') {
              window.internetEngine.applyQuickTauntToRemoteLog();
            }
            this.finishWithReward();
          }
        }
      ];
    }

    ensureMobileDrawerIfNeeded(wantSidebarOpen) {
      const sb = document.querySelector('.sidebar');
      if (!sb) return;
      if (window.innerWidth <= 860) {
        sb.classList.toggle('mobile-open', !!wantSidebarOpen);
      }
    }

    start(manualRestart = false) {
      this.injectStylesAndDom();
      this.isActive = true;
      if (manualRestart) {
        try { localStorage.removeItem(this.storageKey(this.currentUid())); } catch (e) {}
      }
      const root = document.getElementById('hcSpotlightRoot');
      if (root) root.classList.add('active');

      this.goToStep(0);

      if (this.trackTimer) clearInterval(this.trackTimer);
      this.trackTimer = setInterval(() => {
        if (this.isActive) this.repositionCurrentStep();
      }, 140);

      window.addEventListener('resize', this._onViewportChange);
    }

    _onViewportChange = () => {
      if (this.isActive) this.repositionCurrentStep();
    };

    cleanupListeners() {
      if (this.boundTargetEl && this.boundClickHandler) {
        this.boundTargetEl.removeEventListener('click', this.boundClickHandler, false);
      }
      this.boundTargetEl = null;
      this.boundClickHandler = null;
      if (this.crackWatchTimer) {
        clearInterval(this.crackWatchTimer);
        this.crackWatchTimer = null;
      }
    }

    stop(statusValue = 'done') {
      this.cleanupListeners();
      this.isActive = false;
      if (this.trackTimer) {
        clearInterval(this.trackTimer);
        this.trackTimer = null;
      }
      window.removeEventListener('resize', this._onViewportChange);
      const root = document.getElementById('hcSpotlightRoot');
      if (root) root.classList.remove('active');
      this.ensureMobileDrawerIfNeeded(false);

      if (statusValue) {
        this.statusByUid[this.currentUid()] = statusValue;
        try {
          localStorage.setItem(this.storageKey(this.currentUid()), statusValue);
        } catch (e) {}
        if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
      }
    }

    skip() {
      this.stop('skipped');
      if (typeof window.showToast === 'function') {
        window.showToast('Tutorial fechado! Você pode reabrir a qualquer hora em "Tour Guiado (Ajuda)" no menu.');
      }
    }

    prev() {
      if (this.stepIndex <= 0) return;
      this.goToStep(this.stepIndex - 1);
    }

    handleNextButton() {
      const step = this.steps[this.stepIndex];
      if (!step) return;

      if (step.id === 'crack_password') {
        if (step.triggerAction) step.triggerAction();
        const hintEl = document.getElementById('hcTourActionHint');
        if (hintEl && window.internetEngine && window.internetEngine.isCracking) {
          hintEl.innerHTML = '⏳ <strong>Quebrando senha em tempo real...</strong> Assim que chegar em 100%, avançaremos automaticamente!';
        }
        return;
      }

      if (step.id === 'wipe_log_and_taunt') {
        if (step.triggerAction) step.triggerAction();
        return;
      }

      if (step.triggerAction) {
        step.triggerAction();
      }

      if (this.stepIndex < this.steps.length - 1) {
        this.goToStep(this.stepIndex + 1);
      } else {
        this.finishWithReward();
      }
    }

    startWatchingCrackCompletion() {
      if (this.crackWatchTimer) clearInterval(this.crackWatchTimer);
      this.crackWatchTimer = setInterval(() => {
        if (!this.isActive || this.stepIndex !== 6) {
          clearInterval(this.crackWatchTimer);
          this.crackWatchTimer = null;
          return;
        }
        if (window.internetEngine && window.internetEngine.activeSshIp === TRAINING_IP) {
          clearInterval(this.crackWatchTimer);
          this.crackWatchTimer = null;
          this.goToStep(7);
        }
      }, 220);
    }

    goToStep(idx) {
      this.cleanupListeners();
      this.stepIndex = Math.max(0, Math.min(this.steps.length - 1, idx));
      const step = this.steps[this.stepIndex];

      if (typeof step.onEnter === 'function') {
        step.onEnter();
      }

      // Atualiza conteúdo do Card Flutuante
      const counterEl = document.getElementById('hcTourStepCounter');
      const titleEl = document.getElementById('hcTourCardTitle');
      const descEl = document.getElementById('hcTourCardDesc');
      const hintEl = document.getElementById('hcTourActionHint');
      const prevBtn = document.getElementById('btnTourPrev');
      const nextBtn = document.getElementById('btnTourNext');
      const pillEl = document.getElementById('hcTourPointerPill');
      const dotsEl = document.getElementById('hcTourDots');

      if (counterEl) counterEl.textContent = `Passo ${this.stepIndex + 1} de ${this.steps.length}`;
      if (titleEl) titleEl.innerHTML = step.title;
      if (descEl) descEl.innerHTML = step.desc;
      if (hintEl) hintEl.innerHTML = step.hint;
      if (pillEl) pillEl.textContent = step.pointerLabel || '👆 Clique aqui';
      if (prevBtn) prevBtn.style.visibility = this.stepIndex === 0 ? 'hidden' : 'visible';
      if (nextBtn) nextBtn.textContent = step.nextLabel || 'Próximo →';

      if (dotsEl) {
        dotsEl.innerHTML = this.steps.map((_, i) => {
          const cls = i === this.stepIndex ? 'current' : (i < this.stepIndex ? 'done' : '');
          return `<span class="hc-tour-dot ${cls}"></span>`;
        }).join('');
      }

      // Aguarda micro-frame para DOM da janela renderizar e vincula clique direto no elemento iluminado
      requestAnimationFrame(() => {
        const target = this.resolveTargetElement(step);
        if (target) {
          try {
            target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          } catch (e) {}
          this.bindDirectTargetInteraction(step, target);
        }
        this.repositionCurrentStep();
      });
    }

    resolveTargetElement(step) {
      if (!step) return null;
      let el = document.querySelector(step.selector);
      if ((!el || el.offsetWidth === 0) && step.fallbackSelector) {
        el = document.querySelector(step.fallbackSelector);
      }
      return el;
    }

    bindDirectTargetInteraction(step, targetEl) {
      if (!step.requiresDirectClick || !targetEl) return;

      this.boundTargetEl = targetEl;
      this.boundClickHandler = (ev) => {
        if (!this.isActive) return;

        if (step.id === 'topic_pc') {
          setTimeout(() => {
            const d = document.getElementById('navTopic_pc');
            if (d) d.open = true;
            if (this.isActive && this.stepIndex === 1) this.goToStep(2);
          }, 80);
          return;
        }

        if (step.id === 'open_software') {
          setTimeout(() => {
            if (this.isActive && this.stepIndex === 2) this.goToStep(3);
          }, 100);
          return;
        }

        if (step.id === 'topic_net') {
          setTimeout(() => {
            const d = document.getElementById('navTopic_net');
            if (d) d.open = true;
            if (this.isActive && this.stepIndex === 4) this.goToStep(5);
          }, 80);
          return;
        }

        if (step.id === 'open_browser') {
          setTimeout(() => {
            if (window.internetEngine) {
              window.internetEngine.openIp(TRAINING_IP, 'invadir');
            }
            if (this.isActive && this.stepIndex === 5) this.goToStep(6);
          }, 100);
          return;
        }

        if (step.id === 'crack_password') {
          const hintEl = document.getElementById('hcTourActionHint');
          if (hintEl) {
            hintEl.innerHTML = '⏳ <strong>Boa! Quebrando a senha...</strong> Aguarde chegar em 100% que o próximo passo abre sozinho!';
          }
          this.startWatchingCrackCompletion();
          return;
        }

        if (step.id === 'wipe_log_and_taunt') {
          const clickedBtn = ev.target && ev.target.closest ? ev.target.closest('button') : null;
          if (clickedBtn && (clickedBtn.id === 'btnQuickWipeAndTaunt' || clickedBtn.id === 'btnSaveRemoteSyslog' || clickedBtn.id === 'btnWipeAllRemoteLogs')) {
            setTimeout(() => {
              if (this.isActive) this.finishWithReward();
            }, 180);
          }
        }
      };

      targetEl.addEventListener('click', this.boundClickHandler, false);
    }

    repositionCurrentStep() {
      const step = this.steps[this.stepIndex];
      if (!step) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const target = this.resolveTargetElement(step);

      // Re-bind caso o painel tenha sido re-renderizado dinamicamente (ex: contador de RAM ou barra de crack)
      if (target && step.requiresDirectClick && target !== this.boundTargetEl) {
        if (this.boundTargetEl && this.boundClickHandler) {
          this.boundTargetEl.removeEventListener('click', this.boundClickHandler, false);
        }
        this.bindDirectTargetInteraction(step, target);
      }

      const pad = 7;
      let hole;
      if (target && target.offsetWidth > 0 && target.offsetHeight > 0) {
        const r = target.getBoundingClientRect();
        hole = {
          top: Math.max(4, Math.round(r.top - pad)),
          left: Math.max(4, Math.round(r.left - pad)),
          width: Math.min(vw - 8, Math.round(r.width + pad * 2)),
          height: Math.min(vh - 8, Math.round(r.height + pad * 2))
        };
        hole.right = hole.left + hole.width;
        hole.bottom = hole.top + hole.height;
      } else {
        hole = { top: Math.round(vh / 2), left: Math.round(vw / 2), width: 0, height: 0, right: Math.round(vw / 2), bottom: Math.round(vh / 2) };
      }

      const mTop = document.getElementById('hcTourMaskTop');
      const mBot = document.getElementById('hcTourMaskBottom');
      const mLeft = document.getElementById('hcTourMaskLeft');
      const mRight = document.getElementById('hcTourMaskRight');
      const ring = document.getElementById('hcTourRing');
      const pill = document.getElementById('hcTourPointerPill');
      const card = document.getElementById('hcTourCard');

      if (mTop) {
        mTop.style.top = '0px';
        mTop.style.left = '0px';
        mTop.style.width = vw + 'px';
        mTop.style.height = Math.max(0, hole.top) + 'px';
      }
      if (mBot) {
        mBot.style.top = hole.bottom + 'px';
        mBot.style.left = '0px';
        mBot.style.width = vw + 'px';
        mBot.style.height = Math.max(0, vh - hole.bottom) + 'px';
      }
      if (mLeft) {
        mLeft.style.top = hole.top + 'px';
        mLeft.style.left = '0px';
        mLeft.style.width = Math.max(0, hole.left) + 'px';
        mLeft.style.height = Math.max(0, hole.height) + 'px';
      }
      if (mRight) {
        mRight.style.top = hole.top + 'px';
        mRight.style.left = hole.right + 'px';
        mRight.style.width = Math.max(0, vw - hole.right) + 'px';
        mRight.style.height = Math.max(0, hole.height) + 'px';
      }

      if (ring) {
        if (hole.width > 0 && hole.height > 0) {
          ring.style.display = 'block';
          ring.style.top = hole.top + 'px';
          ring.style.left = hole.left + 'px';
          ring.style.width = hole.width + 'px';
          ring.style.height = hole.height + 'px';
          if (pill) {
            pill.classList.toggle('below', hole.top < 36);
          }
        } else {
          ring.style.display = 'none';
        }
      }

      if (card) {
        const cw = card.offsetWidth || 390;
        const ch = card.offsetHeight || 205;
        const gap = 16;
        const topGap = 36; // Espaço extra acima da etiqueta "👆 Clique aqui"
        const margin = 12;

        const spaceRight = vw - hole.right - gap - margin;
        const spaceLeft = hole.left - gap - margin;
        const spaceBottom = vh - hole.bottom - gap - margin;
        const spaceTop = hole.top - topGap - margin;

        let top = margin;
        let left = margin;

        if (hole.width === 0) {
          top = Math.round((vh - ch) / 2);
          left = Math.round((vw - cw) / 2);
        } else if (spaceRight >= cw) {
          left = hole.right + gap;
          top = hole.top;
        } else if (spaceBottom >= ch) {
          top = hole.bottom + gap;
          left = hole.width > cw ? hole.right - cw : hole.left;
        } else if (spaceTop >= ch) {
          top = hole.top - ch - topGap;
          left = hole.left;
        } else if (spaceLeft >= cw) {
          left = hole.left - cw - gap;
          top = hole.top;
        } else {
          // Telas compactas / mobile: posiciona no extremo oposto do alvo sem cobrir o botão iluminado!
          left = Math.round((vw - cw) / 2);
          if (hole.top > vh * 0.48) {
            top = margin;
          } else {
            top = vh - ch - margin;
          }
        }

        left = Math.max(margin, Math.min(vw - cw - margin, left));
        top = Math.max(margin, Math.min(vh - ch - margin, top));

        card.style.left = Math.round(left) + 'px';
        card.style.top = Math.round(top) + 'px';
      }
    }

    finishWithReward() {
      const uid = this.currentUid();
      let alreadyRewarded = false;
      try {
        alreadyRewarded = localStorage.getItem(this.rewardKey(uid)) === '1';
      } catch (e) {}

      this.stop('completed');

      if (!alreadyRewarded) {
        try { localStorage.setItem(this.rewardKey(uid), '1'); } catch (e) {}
        if (window.currentWallet) {
          window.currentWallet.balance = +(parseFloat(window.currentWallet.balance || 0) + TOUR_REWARD_CASH).toFixed(2);
        }
        if (window.currentProfile) {
          window.currentProfile.reputation = (window.currentProfile.reputation || 0) + TOUR_REWARD_REP;
        }
        if (window.tutorialEngine && typeof window.tutorialEngine.ensureLoaded === 'function') {
          const ts = window.tutorialEngine.ensureLoaded();
          ts.completed = true;
          ts.step = 5;
          window.tutorialEngine.save();
        }
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('TOUR-CONCLUIDO', `Tour Guiado Interativo concluído! Recompensa: +$ ${TOUR_REWARD_CASH} HC e +${TOUR_REWARD_REP} REP`, 'success');
        }
        if (window.hackerAudio) window.hackerAudio.playCashChime();
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
        if (typeof window.showToast === 'function') {
          window.showToast(`🎉 Parabéns! Tour concluído: +$ ${TOUR_REWARD_CASH} HC e +${TOUR_REWARD_REP} REP creditados!`);
        }
      } else if (typeof window.showToast === 'function') {
        window.showToast('🎉 Tour Guiado concluído! Bom jogo!');
      }
    }
  }

  window.spotlightTour = new InteractiveSpotlightTourEngine();
})();
