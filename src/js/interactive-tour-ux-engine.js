/**
 * Hacker City // Tour Guiado Interativo Completo com Spotlight (12 Passos Práticos)
 * - Escurece o resto da tela com 4 cortinas ao redor do elemento real (mantendo o botão 100% clicável!)
 * - Ensina toda a lógica do jogo na prática já no 1º tutorial:
 *   1. Seu IP (sua placa na rede)
 *   2. Menu limpo por tópicos -> 3. Programas & Proteção
 *   4. O Que Está Rodando, Comparação de Força & Tempo de Carência (proibido 2 Firewalls!)
 *   5. Explorar & Invadir -> 6. Navegar por IPs
 *   7. Ver se os aplicativos da vítima (Escudo, Cofre, Antivírus) são melhores que os seus!
 *   8. Quebrar a senha e invadir o PC da vítima
 *   9. Checar HD/RAM/Antivírus da vítima e 1º SUBIR (Upload) o vírus pro PC dela
 *  10. 2º EXECUTAR o vírus subido na memória do PC da vítima
 *  11. Voltar para a aba de Logs da vítima (vendo os rastros de entrada + upload + execução)
 *  12. Apagar todos os rastros do seu IP, deixar uma farpa e receber +$ 500 HC + 100 REP!
 */
(function () {
  'use strict';

  const TOUR_REWARD_CASH = 500;
  const TOUR_REWARD_REP = 100;
  const TRAINING_IP = '198.51.100.42';
  const VOICE_DIR = 'assets/audio/tutorial/';

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
      this.asyncWatchTimer = null;
    }

    storageKey(uid) {
      return `HC_SPOTLIGHT_TOUR_DONE_${uid || 'guest'}`;
    }

    rewardKey(uid) {
      return `HC_SPOTLIGHT_TOUR_REWARDED_${uid || 'guest'}`;
    }

    dirtySampleKey(uid) {
      return `HC_SPOTLIGHT_DIRTY_SAMPLE_${uid || 'guest'}`;
    }

    grantDirtyTourSampleOnce() {
      const uid = this.currentUid();
      try {
        if (localStorage.getItem(this.dirtySampleKey(uid)) === '1') return;
        localStorage.setItem(this.dirtySampleKey(uid), '1');
      } catch (e) {}
      if (window.nineSystemsEngine && typeof window.nineSystemsEngine.addDirtyMoney === 'function') {
        window.nineSystemsEngine.addDirtyMoney(600, '1º Saque de Treino (198.51.100.42)');
      }
      if (window.progressiveUnlockEngine && typeof window.progressiveUnlockEngine.syncSidebarDom === 'function') {
        window.progressiveUnlockEngine.syncSidebarDom();
      }
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
        // Jogador novo escolhe a foto de perfil antes do tutorial (avatar-picker-engine.js).
        const picker = window.avatarPicker;
        if (picker && picker.needsChoice()) {
          picker.open({
            mode: 'onboarding',
            onClose: (reason) => {
              if (reason === 'cancelado') return; // logout com a tela aberta: não começa o tutorial
              if (window.currentProfile && !this.isActive && !this.hasCompletedOrSkipped()) this.start(false);
            }
          });
          return;
        }
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
            background: rgba(6, 10, 16, 0.36);
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            pointer-events: auto;
          }
          #hcTourRing {
            position: fixed;
            z-index: 9402;
            pointer-events: none;
            border: 2.5px solid #35b877;
            border-radius: 10px;
            box-shadow: 0 0 0 5px rgba(53, 184, 119, 0.28), 0 0 30px rgba(53, 184, 119, 0.65), inset 0 0 18px rgba(53, 184, 119, 0.14);
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
            top: auto;
            bottom: -30px;
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
          #hcTourPointerPill.above {
            bottom: auto;
            top: -30px;
          }
          #hcTourCard {
            position: fixed;
            z-index: 9405;
            pointer-events: auto;
            width: min(415px, calc(100vw - 24px));
            max-height: calc(100dvh - 16px);
            overflow-y: auto;
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
          #btnTourVoiceUnlock {
            display: block;
            width: 100%;
            margin-top: 8px;
            padding: 8px 10px;
            border: 1px solid rgba(53, 184, 119, 0.55);
            background: rgba(53, 184, 119, 0.16);
            color: #5eead4;
            border-radius: 7px;
            font-size: 12.5px;
            font-weight: 700;
            cursor: pointer;
            animation: hcVoicePulse 1.4s ease-in-out infinite;
          }
          #btnTourVoiceUnlock[hidden] { display: none; }
          @keyframes hcVoicePulse { 50% { box-shadow: 0 0 0 4px rgba(53, 184, 119, 0.25); } }
          @media (prefers-reduced-motion: reduce) { #btnTourVoiceUnlock { animation: none; } }
          #hcTourVoiceWarn {
            margin-top: 8px;
            padding: 6px 9px;
            border: 1px solid rgba(245, 158, 11, 0.45);
            background: rgba(245, 158, 11, 0.12);
            color: #fbbf24;
            border-radius: 7px;
            font-size: 11.5px;
          }
          #hcTourCardTitle {
            font-size: 15.8px;
            font-weight: 700;
            margin: 0 0 6px;
            color: #ffffff;
            line-height: 1.28;
          }
          #hcTourCardDesc {
            font-size: 13px;
            line-height: 1.48;
            color: #c5d0df;
            margin: 0 0 9px;
          }
          #hcTourActionHint {
            background: rgba(53, 184, 119, 0.09);
            border-left: 3px solid #35b877;
            border-radius: 6px;
            padding: 7px 10px;
            font-size: 12.2px;
            color: #dffaf0;
            margin-bottom: 11px;
          }
          .hc-tour-dots {
            display: flex;
            gap: 3px;
            align-items: center;
            flex-wrap: nowrap;
          }
          .hc-tour-dot {
            width: 5px;
            height: 5px;
            border-radius: 999px;
            background: #2b3648;
            transition: width .18s ease, background .18s ease;
          }
          .hc-tour-dot.done {
            background: rgba(53, 184, 119, 0.55);
          }
          .hc-tour-dot.current {
            width: 15px;
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
          @media (max-width: 640px) {
            #hcTourCard {
              width: calc(100vw - 20px);
              max-height: 46vh;
              overflow-y: auto;
              padding: 11px 13px;
            }
            #hcTourCardTitle {
              font-size: 14.2px;
              margin-bottom: 5px;
            }
            #hcTourCardDesc {
              font-size: 12.1px;
              line-height: 1.42;
              margin-bottom: 7px;
            }
            #hcTourActionHint {
              font-size: 11.5px;
              padding: 6px 9px;
              margin-bottom: 8px;
            }
            #hcTourPointerPill {
              font-size: 10.5px;
              padding: 2px 8px;
              max-width: calc(100vw - 24px);
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
          @media (max-width: 420px) {
            .hc-tour-dots {
              display: none;
            }
            .hc-tour-footer {
              justify-content: flex-end;
            }
          }
          @media (max-height: 600px) {
            #hcTourCard {
              max-height: 44vh;
              overflow-y: auto;
              padding: 9px 12px;
            }
            #hcTourCardTitle {
              font-size: 13.5px;
              margin-bottom: 4px;
            }
            #hcTourCardDesc {
              font-size: 11.6px;
              line-height: 1.35;
              margin-bottom: 5px;
            }
            #hcTourActionHint {
              font-size: 11px;
              padding: 5px 8px;
              margin-bottom: 6px;
            }
          }
          @media (max-height: 500px) and (orientation: landscape) {
            #hcTourCard {
              width: min(365px, 48vw);
              max-height: calc(100vh - 16px);
            }
            .hc-tour-dots {
              display: none;
            }
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
              <span class="hc-tour-step-badge" id="hcTourStepCounter">Passo 1 de 12</span>
              <div style="display:flex;gap:6px;">
                <button type="button" id="btnTourVoice" class="hc-tour-skip-btn" aria-pressed="true">🔊 Voz</button>
                <button type="button" id="btnTourSkip" class="hc-tour-skip-btn">Pular Tutorial ✕</button>
              </div>
            </div>
            <h3 id="hcTourCardTitle">Bem-vindo!</h3>
            <p id="hcTourCardDesc"></p>
            <div id="hcTourActionHint"></div>
            <div id="hcTourVoiceWarn" role="status" hidden></div>
            <button type="button" id="btnTourVoiceUnlock" hidden>🔊 Toque aqui para ouvir a narração</button>
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

        document.getElementById('btnTourVoice').addEventListener('click', () => this.toggleVoice());
        // play() direto no clique: o Safari só libera som dentro do próprio gesto.
        document.getElementById('btnTourVoiceUnlock').addEventListener('click', () => {
          if (this.voiceAudio) this.voiceAudio.play().catch(() => {});
        });
        document.getElementById('btnTourSkip').addEventListener('click', () => this.skip());
        document.getElementById('btnTourPrev').addEventListener('click', () => this.prev());
        document.getElementById('btnTourNext').addEventListener('click', () => this.handleNextButton());
      }

      this.syncVoiceButton();
      this.domReady = true;
    }

    voiceEnabled() {
      if (this.voiceOn === undefined) {
        try { this.voiceOn = localStorage.getItem('HC_TOUR_VOICE') !== '0'; } catch (e) { this.voiceOn = true; }
      }
      return this.voiceOn;
    }

    stopVoice() {
      if (this.voiceAudio) this.voiceAudio.pause();
      const unlockEl = document.getElementById('btnTourVoiceUnlock');
      if (unlockEl) unlockEl.hidden = true;
    }

    // Texto falado pela narração. Fonte única: o navegador confere a versão do áudio com ele
    // e scripts/gerar-audios-tutorial.mjs gera os MP3 a partir dele.
    speechText(step, idx) {
      const clean = (html) => String(html || '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
        .replace(/[\p{Extended_Pictographic}️‍→←✕]/gu, '')
        .replace(/\s&\s/g, ' e ')
        .replace(/\s+/g, ' ')
        .trim();
      const title = clean(step.title).replace(/^\d+\.\s*/, '');
      return [`Passo ${idx + 1}: ${title}.`, clean(step.desc), clean(step.hint)].filter(Boolean).join(' ');
    }

    // FNV-1a 32 bits: identifica a versão do texto (detecta mudança; não é segurança).
    textHash(text) {
      let h = 0x811c9dc5;
      for (const ch of text) {
        h ^= ch.codePointAt(0);
        h = Math.imul(h, 0x01000193) >>> 0;
      }
      return h.toString(16).padStart(8, '0');
    }

    loadVoiceManifest() {
      if (!this.voiceManifestPromise) {
        this.voiceManifestPromise = fetch(`${VOICE_DIR}manifest.json`, { cache: 'no-cache' })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
          .then((m) => {
            if (!m) this.voiceManifestPromise = null; // offline/erro: tenta de novo no próximo passo
            return m;
          });
      }
      return this.voiceManifestPromise;
    }

    // Narração do passo (acessibilidade). Só toca o áudio gerado para ESTE texto: passo novo ou
    // alterado sem áudio regenerado fica mudo e mostra o aviso para qualquer jogador.
    playStepVoice(step) {
      this.stopVoice();
      const idx = this.stepIndex;
      const warnEl = document.getElementById('hcTourVoiceWarn');
      if (warnEl) warnEl.hidden = true;
      this.loadVoiceManifest().then((manifest) => {
        if (!manifest || !this.isActive || this.steps[this.stepIndex] !== step) return;
        const entry = ((manifest[this.voiceTutorialId] || {}).steps || {})[step.id];
        const hash = this.textHash(this.speechText(step, idx));
        if (!entry || entry.hash !== hash) {
          if (warnEl) {
            warnEl.textContent = '🔇 Narração por voz desativada neste passo: o texto do tutorial mudou e o áudio ainda não foi atualizado. Por favor, avise o desenvolvedor.';
            warnEl.hidden = false;
            if (typeof this.repositionCurrentStep === 'function') this.repositionCurrentStep();
          }
          console.warn(`[Tour/voz] áudio desatualizado: tutorial=${this.voiceTutorialId} passo=${step.id} texto=${hash} manifesto=${entry ? entry.hash : 'ausente'}. Rode: npm run gerar:voz`);
          return;
        }
        if (!this.voiceEnabled() || (window.hackerAudio && window.hackerAudio.isMuted)) return;
        if (!this.voiceAudio) {
          this.voiceAudio = new Audio();
          this.voiceAudio.addEventListener('playing', () => {
            const unlockEl = document.getElementById('btnTourVoiceUnlock');
            if (unlockEl) unlockEl.hidden = true;
          });
        }
        const audio = this.voiceAudio;
        const src = `${VOICE_DIR}${entry.file}?v=${entry.version}`;
        audio.src = src;
        // O navegador barra som antes do 1º toque na página (tour aberto direto no carregamento):
        // mostra o botão "Toque aqui para ouvir" e também toca no primeiro toque do jogador.
        audio.play().catch((err) => {
          if (!err || err.name !== 'NotAllowedError') return;
          const unlockEl = document.getElementById('btnTourVoiceUnlock');
          if (unlockEl && this.isActive && audio.src.endsWith(src)) {
            unlockEl.hidden = false;
            if (typeof this.repositionCurrentStep === 'function') this.repositionCurrentStep();
          }
          document.addEventListener('pointerdown', () => {
            if (this.isActive && this.voiceEnabled() && audio.paused && audio.src.endsWith(src)) audio.play().catch(() => {});
          }, { once: true });
        });
      });
    }

    toggleVoice() {
      this.voiceOn = !this.voiceEnabled();
      try { localStorage.setItem('HC_TOUR_VOICE', this.voiceOn ? '1' : '0'); } catch (e) {}
      this.syncVoiceButton();
      if (this.voiceOn) this.playStepVoice(this.steps[this.stepIndex]);
      else this.stopVoice();
    }

    syncVoiceButton() {
      const btn = document.getElementById('btnTourVoice');
      if (!btn) return;
      const on = this.voiceEnabled();
      btn.textContent = on ? '🔊 Voz' : '🔇 Voz';
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? 'Narração por voz ligada (clique para desligar)' : 'Narração por voz desligada (clique para ligar)');
    }

    nudgeSpotlight() {
      const ring = document.getElementById('hcTourRing');
      const pill = document.getElementById('hcTourPointerPill');
      if (!ring) return;
      ring.classList.add('nudge');
      if (pill) {
        this._nudgingPill = true;
        const isAbove = pill.classList.contains('above');
        pill.textContent = isAbove ? '👇 Clique aqui dentro da luz!' : '👆 Clique aqui dentro da luz!';
        setTimeout(() => {
          this._nudgingPill = false;
          if (this.isActive) this.repositionCurrentStep(true);
        }, 1100);
      }
      setTimeout(() => ring.classList.remove('nudge'), 450);
    }

    ensureConnectedRootOnTrainingHost() {
      if (!window.internetEngine) return;
      if (window.winManager && window.winManager.current !== 'winBrowser') {
        if (typeof window.navTo === 'function') window.navTo('winBrowser');
      }
      if (window.internetEngine.activeSshIp !== TRAINING_IP) {
        const host = window.internetEngine.resolveHost(TRAINING_IP);
        window.internetEngine.onAttackSucceeded(host, 'password', host.rootPassword || 'admin123', 'root');
      }
    }

    buildSteps() {
      return [
        // PASSO 1 (idx 0) — SEU IP & ESCUDO 24H
        {
          id: 'my_ip',
          selector: '#hudMyIpChip',
          pointerLabel: '👆 Toque aqui (Seu IP + Escudo 24h)',
          requiresDirectClick: false,
          title: '1. Seu IP & Escudo Iniciante (24h)',
          desc: 'Bem-vindo ao Hacker City! Esse número no topo é o endereço do seu PC. Nas primeiras 24 horas reais seu <strong>Escudo Iniciante</strong> impede invasões de outros jogadores.',
          hint: '👆 Toque no seu IP iluminado para partirmos direto para sua 1ª invasão!',
          nextLabel: 'Bora Invadir →',
          onEnter: () => {
            this.ensureMobileDrawerIfNeeded(false);
            if (typeof window.navTo === 'function') window.navTo('winHome');
            document.querySelectorAll('details.nav-topic').forEach((d) => { d.open = false; });
          }
        },
        // PASSO 2 (idx 1) — DIRETO PARA A 1ª INVASÃO!
        {
          id: 'start_first_invasion',
          selector: '#btnHomeOpenInternet',
          fallbackSelector: '#navQuickBtnBrowser',
          pointerLabel: '👆 Clique em Abrir Internet!',
          requiresDirectClick: true,
          title: '2. Direto para Sua 1ª Invasão!',
          desc: 'Sem enrolação: vamos invadir seu primeiro computador na prática! Abrindo a Internet, já vamos mirar no alvo de treino <code>198.51.100.42</code>.',
          hint: '👆 Clique em <strong>"Abrir Internet"</strong> no botão iluminado!',
          nextLabel: 'Abrir Alvo de Treino →',
          onEnter: () => {
            this.ensureMobileDrawerIfNeeded(false);
            if (typeof window.navTo === 'function') window.navTo('winHome');
            document.querySelectorAll('details.nav-topic').forEach((d) => { d.open = false; });
          },
          triggerAction: () => {
            if (window.internetEngine) {
              window.internetEngine.disconnectSsh(true);
              window.internetEngine.openIp(TRAINING_IP, 'invadir');
            } else if (typeof window.navTo === 'function') {
              window.navTo('winBrowser');
            }
          }
        },
        // PASSO 3 (idx 2) — COMPARAR FORÇA DA VÍTIMA!
        {
          id: 'compare_defenses',
          selector: '#inetHostDefenseCompareBox',
          pointerLabel: '👆 Confira e toque p/ avançar!',
          requiresDirectClick: false,
          title: '3. Confira a Defesa Antes de Atacar',
          desc: 'Regra principal: você só invade se o seu <strong>Quebrador</strong> tiver versão igual ou maior que o <strong>Firewall</strong> e o <strong>Hasher</strong> do alvo.',
          hint: '✅ Tudo empatado em <code>v1.0</code>! Toque neste quadro iluminado para continuar.',
          nextLabel: 'Quebrar Senha →',
          onEnter: () => {
            this.ensureMobileDrawerIfNeeded(false);
            if (window.internetEngine) {
              window.internetEngine.closeCrackerMiniPc();
              window.internetEngine.disconnectSsh(true);
              window.internetEngine.openIp(TRAINING_IP, 'invadir');
            }
          }
        },
        // PASSO 4 (idx 3) — CLICAR EM QUEBRAR SENHA!
        {
          id: 'crack_password',
          selector: '#btnInetBruteforce',
          fallbackSelector: '#cardAttackBruteforce',
          pointerLabel: '👆 Clique em Quebrar senha!',
          requiresDirectClick: true,
          title: '4. Quebrar a Senha do Alvo',
          desc: 'Clique em <strong>Quebrar senha</strong> para abrir seus programas de ataque e invadir essa máquina.',
          hint: '🔑 Clique em <strong>"Quebrar senha"</strong> na área iluminada!',
          nextLabel: 'Abrir Quebrador →',
          onEnter: () => {
            this.ensureMobileDrawerIfNeeded(false);
            if (window.internetEngine) {
              window.internetEngine.closeCrackerMiniPc();
              if (window.internetEngine.activeSshIp === TRAINING_IP) {
                setTimeout(() => {
                  if (this.isActive && this.currentStepId() === 'crack_password') {
                    this.goToStepById('upload_virus_stage');
                  }
                }, 120);
                return;
              }
              window.internetEngine.openIp(TRAINING_IP, 'invadir');
            }
          },
          triggerAction: () => {
            if (window.internetEngine) {
              window.internetEngine.openCrackerMiniPc('all');
            }
          }
        },
        // PASSO 5 (idx 4) — ESCOLHER CRACKER v1.0 NO MINI-PC!
        {
          id: 'choose_minipc_hash',
          selector: '#miniPcCrackerWindow',
          fallbackSelector: '#btnMiniPcUseBest',
          pointerLabel: '👆 Escolha o Cracker v1.0!',
          requiresDirectClick: true,
          title: '5. Escolha o Quebrador v1.0',
          desc: 'O <code>v0.5</code> não alcança a defesa, mas o <code>Cracker.crc v1.0</code> quebra fácil! Processadores melhores deixam tudo mais rápido.',
          hint: '👆 Clique em <strong>"Usar este"</strong> no <code>Cracker.crc v1.0</code> e aguarde 100%!',
          nextLabel: 'Usar Cracker v1.0 →',
          onEnter: () => {
            this.ensureMobileDrawerIfNeeded(false);
            if (window.internetEngine) {
              if (window.internetEngine.activeSshIp === TRAINING_IP) {
                setTimeout(() => {
                  if (this.isActive && this.currentStepId() === 'choose_minipc_hash') {
                    this.goToStepById('upload_virus_stage');
                  }
                }, 120);
                return;
              }
              if (!window.internetEngine.isCracking && !window.internetEngine.miniPcOpen) {
                window.internetEngine.openIp(TRAINING_IP, 'invadir');
                window.internetEngine.openCrackerMiniPc('all');
              }
            }
            this.startWatchingAsyncStep('crack');
          },
          triggerAction: () => {
            if (!window.internetEngine) return;
            if (window.internetEngine.activeSshIp === TRAINING_IP) {
              this.goToStepById('upload_virus_stage');
              return;
            }
            if (!window.internetEngine.isCracking) {
              window.internetEngine.confirmBruteforceWithHash('main_cracker');
            }
            this.startWatchingAsyncStep('crack');
          }
        },
        // PASSO 6 (idx 5) — SUBIR O VÍRUS PRO PC DA VÍTIMA!
        {
          id: 'upload_virus_stage',
          selector: '#remoteVirusDeployCard',
          fallbackSelector: '#btnUploadVirusStage',
          pointerLabel: '👆 Clique em 1️⃣ Subir pro PC da Vítima!',
          requiresDirectClick: true,
          title: '6. Envie Seu 1º Vírus pro Alvo',
          desc: 'Entramos como <strong>root</strong>! Vírus plantados geram renda passiva em <strong>🩸 Dinheiro Sujo</strong>. Primeiro envie o arquivo pro disco dele.',
          hint: '📤 Clique em <strong>"1️⃣ Subir pro PC da Vítima"</strong>!',
          nextLabel: '1️⃣ Subir Vírus →',
          onEnter: () => {
            this.ensureMobileDrawerIfNeeded(false);
            if (window.internetEngine) window.internetEngine.closeCrackerMiniPc();
            this.ensureConnectedRootOnTrainingHost();
            if (window.softwareEngine && typeof window.softwareEngine.grantTutorialStarterSample === 'function') {
              window.softwareEngine.grantTutorialStarterSample();
            }
            if (window.internetEngine) {
              window.internetEngine.activeTab = 'entrar';
              window.internetEngine.sshSubTab = 'files';
              window.internetEngine.render('internetAppBody');
            }
            const staged = window.softwareEngine ? window.softwareEngine.getStagedVirusesOnIp(TRAINING_IP) : [];
            if (staged.length > 0) {
              setTimeout(() => {
                if (this.isActive && this.currentStepId() === 'upload_virus_stage') {
                  this.goToStepById('execute_staged_virus');
                }
              }, 140);
              return;
            }
            this.startWatchingAsyncStep('upload_stage');
          },
          triggerAction: () => {
            if (!window.internetEngine || !window.softwareEngine) return;
            const staged = window.softwareEngine.getStagedVirusesOnIp(TRAINING_IP);
            if (staged.length > 0) {
              this.goToStepById('execute_staged_virus');
              return;
            }
            if (!window.softwareEngine.activeUploadJob) {
              window.internetEngine.stageSelectedVirusToCurrentHost();
            }
            this.startWatchingAsyncStep('upload_stage');
          }
        },
        // PASSO 7 (idx 6) — EXECUTAR O VÍRUS NA MEMÓRIA DA VÍTIMA!
        {
          id: 'execute_staged_virus',
          selector: '#stagedVirusesBox',
          fallbackSelector: '#btnExecStagedVirus_vspam',
          pointerLabel: '👆 Clique em 2️⃣ Executar no PC da Vítima!',
          requiresDirectClick: true,
          title: '7. Ative o Vírus na Memória',
          desc: 'Subir o arquivo só guardou o vírus no disco. Para começar a render dinheiro, você precisa executá-lo!',
          hint: '▶️ Clique em <strong>"2️⃣ ▶ Executar no PC da Vítima"</strong>!',
          nextLabel: '2️⃣ Executar Vírus →',
          onEnter: () => {
            this.ensureMobileDrawerIfNeeded(false);
            this.ensureConnectedRootOnTrainingHost();
            if (window.softwareEngine) {
              window.softwareEngine.grantTutorialStarterSample();
              const staged = window.softwareEngine.getStagedVirusesOnIp(TRAINING_IP);
              const running = window.softwareEngine.getRemoteVirusesOnIp(TRAINING_IP);
              if (staged.length === 0 && running.length === 0) {
                window.softwareEngine.state.stagedRemoteViruses[TRAINING_IP] = [{
                  virusKey: 'vspam',
                  filename: 'Spam.vspam',
                  friendlyTitle: 'Gerador de Dinheiro (Spam)',
                  versionInt: 10,
                  sizeMb: 16,
                  ramMb: 10,
                  uploadedAt: new Date().toLocaleTimeString()
                }];
                window.softwareEngine.save();
              }
            }
            if (window.internetEngine) {
              window.internetEngine.activeTab = 'entrar';
              window.internetEngine.sshSubTab = 'files';
              window.internetEngine.render('internetAppBody');
            }
          },
          triggerAction: () => {
            if (window.internetEngine) {
              window.internetEngine.executeStagedVirusOnCurrentHost('vspam');
            }
          }
        },
        // PASSO 8 (idx 7) — ABRIR LOGS DA VÍTIMA!
        {
          id: 'back_to_logs_tab',
          selector: '#btnSshSubTabLogs',
          pointerLabel: '👆 Abra a aba Logs da Vítima!',
          requiresDirectClick: true,
          title: '8. Cuidado: Seu IP Ficou Gravado!',
          desc: 'Tudo que você faz no PC invadido grava seu IP nos registros dele. Se sair sem apagar, a polícia ou rivais encontram você!',
          hint: '⚠️ Clique na aba <strong>"Logs (/var/log/syslog) ⚠️"</strong> iluminada!',
          nextLabel: 'Abrir Logs da Vítima →',
          onEnter: () => {
            this.ensureMobileDrawerIfNeeded(false);
            this.ensureConnectedRootOnTrainingHost();
            if (window.internetEngine) {
              window.internetEngine.activeTab = 'entrar';
              window.internetEngine.sshSubTab = 'files';
              window.internetEngine.render('internetAppBody');
            }
          },
          triggerAction: () => {
            if (window.internetEngine) {
              window.internetEngine.sshSubTab = 'logs';
              window.internetEngine.render('internetAppBody');
            }
          }
        },
        // PASSO 9 (idx 8) — APAGAR RASTRO & SAQUEAR!
        {
          id: 'wipe_log_and_taunt',
          selector: '#remoteTauntQuickBar',
          fallbackSelector: '#remoteLogEditorBox',
          pointerLabel: '👆 Apague seu IP & Deixe Farpa!',
          requiresDirectClick: true,
          title: '9. Apague Seu Rastro e Saqueie!',
          desc: 'Sempre apague seu IP por último antes de sair! Aqui você limpa todas as pistas com um clique e garante o saque da invasão.',
          hint: '🔥 Clique em <strong>"Apagar Meu IP & Deixar Farpa"</strong> para ganhar <strong>+$ 600 Sujos</strong>!',
          nextLabel: 'Limpar IP & Saquear →',
          onEnter: () => {
            this.ensureMobileDrawerIfNeeded(false);
            this.ensureConnectedRootOnTrainingHost();
            if (window.internetEngine) {
              window.internetEngine.activeTab = 'entrar';
              window.internetEngine.sshSubTab = 'logs';
              window.internetEngine.render('internetAppBody');
            }
          },
          triggerAction: () => {
            if (window.internetEngine && typeof window.internetEngine.applyQuickTauntToRemoteLog === 'function') {
              window.internetEngine.applyQuickTauntToRemoteLog();
            }
            this.grantDirtyTourSampleOnce();
            this.goToStepById('dirty_vs_clean_economy');
          }
        },
        // PASSO 10 (idx 9) — DINHEIRO SUJO vs. DINHEIRO LIMPO!
        {
          id: 'dirty_vs_clean_economy',
          selector: '#hudDirtyCashBadge',
          fallbackSelector: '#hudWalletMoney',
          pointerLabel: '👆 Toque aqui p/ Concluir (+$500)!',
          requiresDirectClick: false,
          title: '10. Dinheiro Sujo vs. Dinheiro Limpo!',
          desc: 'Entraram <strong>🩸 $ 600 Sujos</strong> no topo! Dinheiro de invasão precisa passar em <strong>Dinheiro &amp; Vida, em Lavar Dinheiro,</strong> antes de comprar peças ou cursos.',
          hint: '🧼 Toque nas <strong>Notas Sujas</strong> iluminadas para concluir e ganhar <strong>+$ 500 Limpos</strong>!',
          nextLabel: 'Concluir (+$ 500 Limpos) →',
          onEnter: () => {
            this.ensureMobileDrawerIfNeeded(false);
            if (window.internetEngine && typeof window.internetEngine.closeCrackerMiniPc === 'function') {
              window.internetEngine.closeCrackerMiniPc();
            }
            this.grantDirtyTourSampleOnce();
            if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
          },
          triggerAction: () => {
            this.finishWithReward();
          }
        }
      ];
    }

    ensureMobileDrawerIfNeeded(wantSidebarOpen) {
      if (window.innerWidth <= 860) {
        if (typeof window.toggleMobileSidebar === 'function') {
          window.toggleMobileSidebar(!!wantSidebarOpen);
        } else {
          const sb = document.querySelector('.sidebar');
          if (sb) sb.classList.toggle('mobile-open', !!wantSidebarOpen);
        }
      }
    }

    start(manualRestart = false) {
      this.injectStylesAndDom();
      this.isActive = true;
      if (manualRestart) {
        delete this.statusByUid[this.currentUid()];
        try { localStorage.removeItem(this.storageKey(this.currentUid())); } catch (e) {}
      }
      const root = document.getElementById('hcSpotlightRoot');
      if (root) root.classList.add('active');

      document.removeEventListener('click', this._onDocCaptureClick, true);
      document.addEventListener('click', this._onDocCaptureClick, true);

      this.goToStep(0);

      if (this.trackTimer) clearInterval(this.trackTimer);
      this.trackTimer = setInterval(() => {
        if (!this.isActive) return;
        this.checkAutoStateCompletion();
        this.repositionCurrentStep();
      }, 140);

      window.addEventListener('resize', this._onViewportChange);
    }

    voiceTutorialId = 'tour-guiado';

    _onViewportChange = () => {
      if (this.isActive) this.repositionCurrentStep();
    };

    readGameStepSignals() {
      const ie = window.internetEngine;
      const se = window.softwareEngine;
      const myIp = window.networkIdentity && typeof window.networkIdentity.getPublicIp === 'function'
        ? window.networkIdentity.getPublicIp()
        : '';
      const trainingLogs = (window.botAI && typeof window.botAI.getLogs === 'function')
        ? (window.botAI.getLogs(TRAINING_IP) || [])
        : [];
      const hasMyIpInTrainingLog = Boolean(myIp && trainingLogs.some((line) => String(line || '').includes(myIp)));
      return {
        win: (window.winManager && window.winManager.current) || '',
        topicPcOpen: Boolean(document.getElementById('navTopic_pc')?.open),
        topicNetOpen: Boolean(document.getElementById('navTopic_net')?.open),
        onTrainingBrowser: Boolean((window.winManager && window.winManager.current === 'winBrowser') && ie && ie.currentIp === TRAINING_IP),
        miniPcOrCracking: Boolean(ie && (ie.miniPcOpen || ie.isCracking || ie.activeSshIp === TRAINING_IP)),
        rootOnTraining: Boolean(ie && ie.activeSshIp === TRAINING_IP),
        stagedCount: se && typeof se.getStagedVirusesOnIp === 'function' ? se.getStagedVirusesOnIp(TRAINING_IP).length : 0,
        runningCount: se && typeof se.getRemoteVirusesOnIp === 'function' ? se.getRemoteVirusesOnIp(TRAINING_IP).length : 0,
        sshSubTab: (ie && ie.sshSubTab) || '',
        hasMyIpInTrainingLog
      };
    }

    checkAutoStateCompletion() {
      if (!this.isActive || !this._stepBaseline) return;
      if (Date.now() - (this._stepEnteredAt || 0) < 160) return;
      const step = this.steps[this.stepIndex];
      if (!step) return;
      const b = this._stepBaseline;
      const cur = this.readGameStepSignals();

      if (step.id === 'topic_pc' && !b.topicPcOpen && cur.topicPcOpen) {
        this.goToStep(this.stepIndex + 1);
      } else if (step.id === 'open_software' && b.win !== 'winSoftware' && cur.win === 'winSoftware') {
        this.goToStep(this.stepIndex + 1);
      } else if (step.id === 'topic_net' && !b.topicNetOpen && cur.topicNetOpen) {
        this.goToStep(this.stepIndex + 1);
      } else if ((step.id === 'open_browser' || step.id === 'start_first_invasion') && (b.win !== 'winBrowser' && cur.win === 'winBrowser')) {
        if (window.internetEngine && window.internetEngine.currentIp !== TRAINING_IP) {
          window.internetEngine.disconnectSsh(true);
          window.internetEngine.openIp(TRAINING_IP, 'invadir');
        }
        this.goToStep(this.stepIndex + 1);
      } else if (step.id === 'crack_password' && !b.miniPcOrCracking && cur.miniPcOrCracking) {
        this.goToStepById(cur.rootOnTraining ? 'upload_virus_stage' : 'choose_minipc_hash');
      } else if (step.id === 'choose_minipc_hash' && !b.rootOnTraining && cur.rootOnTraining) {
        this.goToStepById('upload_virus_stage');
      } else if (step.id === 'upload_virus_stage' && b.stagedCount === 0 && cur.stagedCount > 0) {
        this.goToStepById('execute_staged_virus');
      } else if (step.id === 'execute_staged_virus' && b.runningCount === 0 && cur.runningCount > 0) {
        this.goToStep(this.stepIndex + 1);
      } else if (step.id === 'back_to_logs_tab' && b.sshSubTab !== 'logs' && cur.sshSubTab === 'logs') {
        this.goToStep(this.stepIndex + 1);
      } else if (step.id === 'wipe_log_and_taunt' && b.hasMyIpInTrainingLog && !cur.hasMyIpInTrainingLog) {
        this.grantDirtyTourSampleOnce();
        this.goToStepById('dirty_vs_clean_economy');
      }
    }

    // Delegação global em capture=true: clicar na área iluminada ou executar a ação do passo
    // avança imediatamente para o próximo (interrompendo o áudio atual sem precisar clicar no card!).
    _onDocCaptureClick = (ev) => {
      if (!this.isActive || !ev.target || typeof ev.target.closest !== 'function') return;
      if (ev.target.closest('#hcTourCard') || ev.target.closest('.hc-tour-mask')) return;

      const step = this.steps[this.stepIndex];
      if (!step) return;
      const target = this.resolveTargetElement(step);
      const extraSoftHit = step.id === 'running_ram_cooldown' && Boolean(ev.target.closest('#softwareExplorerMain'));
      const hitTarget = Boolean((target && target.contains(ev.target)) || extraSoftHit);

      if (!step.requiresDirectClick) {
        if (hitTarget) {
          ev.preventDefault();
          ev.stopPropagation();
          this.handleNextButton();
        }
        return;
      }

      if (!hitTarget) return;

      if (step.id === 'topic_pc') {
        setTimeout(() => {
          const d = document.getElementById('navTopic_pc');
          if (d) d.open = true;
          if (this.isActive && this.currentStepId() === 'topic_pc') this.goToStep(this.stepIndex + 1);
        }, 65);
        return;
      }

      if (step.id === 'open_software') {
        setTimeout(() => {
          if (this.isActive && this.currentStepId() === 'open_software') this.goToStep(this.stepIndex + 1);
        }, 75);
        return;
      }

      if (step.id === 'topic_net') {
        setTimeout(() => {
          const d = document.getElementById('navTopic_net');
          if (d) d.open = true;
          if (this.isActive && this.currentStepId() === 'topic_net') this.goToStep(this.stepIndex + 1);
        }, 65);
        return;
      }

      if (step.id === 'open_browser' || step.id === 'start_first_invasion') {
        setTimeout(() => {
          if (window.internetEngine) {
            window.internetEngine.disconnectSsh(true);
            window.internetEngine.openIp(TRAINING_IP, 'invadir');
          }
          if (this.isActive && (this.currentStepId() === 'open_browser' || this.currentStepId() === 'start_first_invasion')) {
            this.goToStep(this.stepIndex + 1);
          }
        }, 75);
        return;
      }

      if (step.id === 'crack_password') {
        const clickedBruteBtn = ev.target.closest('#btnInetBruteforce');
        if (!clickedBruteBtn && window.internetEngine && !window.internetEngine.miniPcOpen) {
          window.internetEngine.openCrackerMiniPc('all');
        }
        setTimeout(() => {
          if (this.isActive && this.currentStepId() === 'crack_password') {
            this.goToStepById('choose_minipc_hash');
          }
        }, 75);
        return;
      }

      if (step.id === 'choose_minipc_hash') {
        const clickedBtn = ev.target.closest('button');
        if (clickedBtn && (clickedBtn.id === 'btnMiniPcUseBest' || String(clickedBtn.getAttribute('onclick') || '').includes('confirmBruteforceWithHash'))) {
          const hintEl = document.getElementById('hcTourActionHint');
          if (hintEl) {
            hintEl.innerHTML = '⏳ <strong>Boa! Quebrando a senha...</strong> Assim que chegar em 100%, avançamos sozinhos!';
          }
          this.startWatchingAsyncStep('crack');
        }
        return;
      }

      if (step.id === 'upload_virus_stage') {
        const clickedBtn = ev.target.closest('button');
        if (clickedBtn && (clickedBtn.id === 'btnUploadVirusStage' || clickedBtn.id === 'btnDeployRemoteVirus')) {
          const hintEl = document.getElementById('hcTourActionHint');
          if (hintEl) {
            hintEl.innerHTML = '⏳ <strong>Subindo o vírus pro PC da vítima...</strong> Aguarde chegar em 100%!';
          }
          this.startWatchingAsyncStep('upload_stage');
        }
        return;
      }

      if (step.id === 'execute_staged_virus') {
        const clickedBtn = ev.target.closest('button');
        if (clickedBtn && clickedBtn.id.startsWith('btnExecStagedVirus_')) {
          setTimeout(() => {
            if (this.isActive && this.currentStepId() === 'execute_staged_virus') this.goToStep(this.stepIndex + 1);
          }, 120);
        }
        return;
      }

      if (step.id === 'back_to_logs_tab') {
        setTimeout(() => {
          if (this.isActive && this.currentStepId() === 'back_to_logs_tab') this.goToStep(this.stepIndex + 1);
        }, 90);
        return;
      }

      if (step.id === 'wipe_log_and_taunt') {
        const clickedBtn = ev.target.closest('button');
        if (clickedBtn && (clickedBtn.id === 'btnQuickWipeAndTaunt' || clickedBtn.id === 'btnSaveRemoteSyslog' || clickedBtn.id === 'btnWipeAllRemoteLogs')) {
          setTimeout(() => {
            this.grantDirtyTourSampleOnce();
            if (this.isActive && this.currentStepId() === 'wipe_log_and_taunt') this.goToStepById('dirty_vs_clean_economy');
          }, 120);
        }
      }
    };

    cleanupListeners() {
      if (this.boundTargetEl && this.boundClickHandler) {
        this.boundTargetEl.removeEventListener('click', this.boundClickHandler, false);
      }
      this.boundTargetEl = null;
      this.boundClickHandler = null;
      if (this.asyncWatchTimer) {
        clearInterval(this.asyncWatchTimer);
        this.asyncWatchTimer = null;
      }
    }

    stop(statusValue = 'done') {
      this.cleanupListeners();
      document.removeEventListener('click', this._onDocCaptureClick, true);
      this.stopVoice();
      this.isActive = false;
      if (this.trackTimer) {
        clearInterval(this.trackTimer);
        this.trackTimer = null;
      }
      window.removeEventListener('resize', this._onViewportChange);
      const root = document.getElementById('hcSpotlightRoot');
      if (root) root.classList.remove('active');
      this.ensureMobileDrawerIfNeeded(false);
      if (window.internetEngine && typeof window.internetEngine.closeCrackerMiniPc === 'function') {
        window.internetEngine.closeCrackerMiniPc();
      }

      if (statusValue) {
        this.statusByUid[this.currentUid()] = statusValue;
        try {
          localStorage.setItem(this.storageKey(this.currentUid()), statusValue);
        } catch (e) {}
        if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
      }
    }

    finishTour(silent = false) {
      this.stop('completed');
      if (!silent && typeof window.showToast === 'function') {
        window.showToast('Tour Guiado concluído!');
      }
    }

    skip() {
      this.stop('skipped');
      if (typeof window.showToast === 'function') {
        window.showToast('Tutorial fechado! Você pode reabrir a qualquer hora em "Tour Guiado (Ajuda)" no menu.');
      }
    }

    currentStepId() {
      return (this.steps[this.stepIndex] && this.steps[this.stepIndex].id) || '';
    }

    goToStepById(stepId) {
      const idx = this.steps.findIndex((s) => s.id === stepId);
      if (idx >= 0) this.goToStep(idx);
    }

    prev() {
      if (this.stepIndex <= 0) return;
      if (window.internetEngine) window.internetEngine.closeCrackerMiniPc();
      this.goToStep(this.stepIndex - 1);
    }

    handleNextButton() {
      const step = this.steps[this.stepIndex];
      if (!step) return;

      if (step.id === 'crack_password') {
        if (step.triggerAction) step.triggerAction();
        this.goToStepById('choose_minipc_hash');
        return;
      }

      if (step.id === 'choose_minipc_hash') {
        if (step.triggerAction) step.triggerAction();
        const hintEl = document.getElementById('hcTourActionHint');
        if (hintEl && window.internetEngine && window.internetEngine.isCracking) {
          hintEl.innerHTML = '⏳ <strong>Quebrando senha em segundo plano...</strong> Assim que chegar em 100%, avançaremos sozinhos!';
        }
        return;
      }

      if (step.id === 'upload_virus_stage') {
        if (step.triggerAction) step.triggerAction();
        const hintEl = document.getElementById('hcTourActionHint');
        if (hintEl && window.softwareEngine && window.softwareEngine.activeUploadJob) {
          hintEl.innerHTML = '⏳ <strong>Subindo Spam.vspam pro HD da vítima...</strong> Assim que chegar em 100%, vamos executá-lo!';
        }
        return;
      }

      if (step.id === 'wipe_log_and_taunt') {
        if (step.triggerAction) step.triggerAction();
        return;
      }

      if (step.id === 'dirty_vs_clean_economy') {
        this.finishWithReward();
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

    startWatchingAsyncStep(kind) {
      if (this.asyncWatchTimer) clearInterval(this.asyncWatchTimer);
      this.asyncWatchTimer = setInterval(() => {
        if (!this.isActive) {
          clearInterval(this.asyncWatchTimer);
          this.asyncWatchTimer = null;
          return;
        }
        const curId = this.currentStepId();
        if (kind === 'crack' && (curId === 'crack_password' || curId === 'choose_minipc_hash')) {
          if (window.internetEngine && window.internetEngine.activeSshIp === TRAINING_IP) {
            clearInterval(this.asyncWatchTimer);
            this.asyncWatchTimer = null;
            this.goToStepById('upload_virus_stage');
          }
        } else if (kind === 'upload_stage' && curId === 'upload_virus_stage') {
          const staged = window.softwareEngine ? window.softwareEngine.getStagedVirusesOnIp(TRAINING_IP) : [];
          const running = window.softwareEngine ? window.softwareEngine.getRemoteVirusesOnIp(TRAINING_IP) : [];
          if (staged.length > 0) {
            clearInterval(this.asyncWatchTimer);
            this.asyncWatchTimer = null;
            this.goToStepById('execute_staged_virus');
          } else if (running.length > 0) {
            clearInterval(this.asyncWatchTimer);
            this.asyncWatchTimer = null;
            this.goToStepById('back_to_logs_tab');
          }
        }
      }, 200);
    }

    goToStep(idx) {
      this.cleanupListeners();
      this.stepIndex = Math.max(0, Math.min(this.steps.length - 1, idx));
      const step = this.steps[this.stepIndex];

      if (typeof step.onEnter === 'function') {
        step.onEnter();
      }
      // Garante que nenhum submenu lateral fique esquecido aberto por cima da tela quando o passo não aponta para um subitem!
      if (step.id !== 'open_software' && step.id !== 'open_browser') {
        document.querySelectorAll('details.nav-topic[open]').forEach((d) => { d.open = false; });
      }
      this._lastCardLayoutKey = '';
      this._stepEnteredAt = Date.now();
      this._stepBaseline = this.readGameStepSignals();

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
      this.playStepVoice(step);

      if (dotsEl) {
        dotsEl.innerHTML = this.steps.map((_, i) => {
          const cls = i === this.stepIndex ? 'current' : (i < this.stepIndex ? 'done' : '');
          return `<span class="hc-tour-dot ${cls}"></span>`;
        }).join('');
      }

      const cardEl = document.getElementById('hcTourCard');
      if (cardEl) cardEl.scrollTop = 0;
      this.repositionCurrentStep(true);
      requestAnimationFrame(() => {
        const target = this.resolveTargetElement(step);
        if (target) {
          try {
            target.scrollIntoView({ block: window.innerWidth <= 860 ? 'center' : 'nearest', inline: 'center' });
          } catch (e) {}
          this.bindDirectTargetInteraction(step, target);
        }
        this.repositionCurrentStep(true);
      });
    }

    resolveTargetElement(step) {
      if (!step) return null;
      const isCompact = window.innerWidth <= 860 || window.innerHeight <= 600;
      if (step.id === 'running_ram_cooldown') {
        const tabsBar = isCompact
          ? (document.querySelector('#softwareExplorerMain .soft-tab-btn.active') || document.querySelector('#softwareExplorerMain .soft-tabs-bar'))
          : document.querySelector('#softwareExplorerMain .soft-tabs-bar');
        if (tabsBar && tabsBar.offsetWidth > 0) return tabsBar;
      }
      if (step.id === 'choose_minipc_hash') {
        if (window.internetEngine && window.internetEngine.isCracking) {
          return document.getElementById('cardAttackBruteforce') || document.querySelector(step.selector);
        }
        if (isCompact) {
          const bestBtn = document.getElementById('btnMiniPcUseBest') || document.querySelector('#miniPcCrackerWindow button[onclick*="confirmBruteforceWithHash"]');
          if (bestBtn && bestBtn.offsetWidth > 0) return bestBtn;
        }
      }
      if (isCompact) {
        if (step.id === 'upload_virus_stage') {
          const upBtn = document.getElementById('btnUploadVirusStage') || document.getElementById('btnDeployRemoteVirus');
          if (upBtn && upBtn.offsetWidth > 0) return upBtn;
        }
        if (step.id === 'execute_staged_virus') {
          const exBtn = document.getElementById('btnExecStagedVirus_vspam') || document.querySelector('[id^="btnExecStagedVirus_"]');
          if (exBtn && exBtn.offsetWidth > 0) return exBtn;
        }
        if (step.id === 'wipe_log_and_taunt') {
          const wipeBtn = document.getElementById('btnQuickWipeAndTaunt');
          if (wipeBtn && wipeBtn.offsetWidth > 0) return wipeBtn;
        }
      }
      let el = document.querySelector(step.selector);
      if ((!el || el.offsetWidth === 0) && step.fallbackSelector) {
        el = document.querySelector(step.fallbackSelector);
      }
      return el;
    }

    bindDirectTargetInteraction(step, targetEl) {
      // Delegado via _onDocCaptureClick (capture=true) + checkAutoStateCompletion:
      // funciona mesmo se o alvo for re-renderizado ou se o áudio estiver tocando!
      this.boundTargetEl = targetEl || null;
      this.boundClickHandler = null;
    }

    repositionCurrentStep(forceCardMeasure = false) {
      const step = this.steps[this.stepIndex];
      if (!step) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const target = this.resolveTargetElement(step);

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
      if (vw <= 680 && hole.width > 0 && card) {
        const chEst = card.offsetHeight || 220;
        const maxHoleH = Math.max(96, vh - chEst - 44);
        if (hole.height > maxHoleH) {
          hole.height = maxHoleH;
          hole.bottom = hole.top + hole.height;
        }
      }

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

      // Pílula fica EMBAIXO apontando p/ CIMA (👆); só sobe p/ cima com 👇 se o alvo estiver colado no rodapé!
      const putPillAbove = hole.bottom > vh - 38;
      if (ring) {
        if (hole.width > 0 && hole.height > 0) {
          ring.style.display = 'block';
          ring.style.top = hole.top + 'px';
          ring.style.left = hole.left + 'px';
          ring.style.width = hole.width + 'px';
          ring.style.height = hole.height + 'px';
          if (pill) {
            pill.classList.toggle('above', putPillAbove);
            if (!this._nudgingPill) {
              const baseLabel = step.pointerLabel || '👆 Clique aqui';
              pill.textContent = putPillAbove
                ? baseLabel.replace(/👆/g, '👇')
                : baseLabel.replace(/👇/g, '👆');
            }
            if (hole.left > vw * 0.45) {
              pill.style.left = 'auto';
              pill.style.right = '0px';
            } else {
              pill.style.left = '0px';
              pill.style.right = 'auto';
            }
          }
        } else {
          ring.style.display = 'none';
        }
      }

      if (card) {
        // Evita recalcular/zerar maxHeight a cada 140ms quando nada mudou (impede o scroll do card de pular pro início!)
        const layoutKey = `${this.stepIndex}|${vw}x${vh}|${hole.top},${hole.left},${hole.width},${hole.height}`;
        if (!forceCardMeasure && layoutKey === this._lastCardLayoutKey) {
          return;
        }
        this._lastCardLayoutKey = layoutKey;

        const savedScrollTop = card.scrollTop;
        card.style.maxHeight = '';
        const cw = card.offsetWidth || 405;
        const ch = card.offsetHeight || 205;
        const gap = 16;
        const bottomGap = putPillAbove ? gap : 38;
        const topGap = putPillAbove ? 38 : gap;
        const margin = 12;

        const spaceRight = vw - hole.right - gap - margin;
        const spaceLeft = hole.left - gap - margin;
        const spaceBottom = vh - hole.bottom - bottomGap - margin;
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
          top = hole.bottom + bottomGap;
          left = hole.width > cw ? hole.right - cw : hole.left;
        } else if (spaceTop >= ch) {
          top = hole.top - ch - topGap;
          left = hole.left;
        } else if (spaceLeft >= cw) {
          left = hole.left - cw - gap;
          top = hole.top;
        } else {
          left = Math.round((vw - cw) / 2);
          if (hole.top > vh * 0.48) {
            top = margin;
          } else {
            top = vh - ch - margin;
          }
        }

        left = Math.max(margin, Math.min(vw - cw - margin, left));
        top = Math.max(margin, Math.min(vh - ch - margin, top));

        // Garantia extra em telas ultra-baixas (320x568 / paisagem 844x390): ajusta max-height se ainda encostar no alvo
        if (hole.width > 0 && !(left + cw < hole.left || left > hole.right || top + ch < hole.top || top > hole.bottom)) {
          const clearBelow = vh - hole.bottom - bottomGap - margin;
          const clearAbove = hole.top - topGap - margin;
          if (clearBelow >= clearAbove && clearBelow >= 115) {
            card.style.maxHeight = Math.floor(clearBelow) + 'px';
            top = hole.bottom + bottomGap;
          } else if (clearAbove >= 115) {
            card.style.maxHeight = Math.floor(clearAbove) + 'px';
            top = margin;
          }
        } else {
          card.style.maxHeight = '';
        }

        card.style.left = Math.round(left) + 'px';
        card.style.top = Math.round(top) + 'px';
        if (savedScrollTop > 0) {
          card.scrollTop = savedScrollTop;
        }
      }
    }

    finishWithReward() {
      const uid = this.currentUid();
      let alreadyRewarded = !!this.rewardedByUid[uid];
      try {
        alreadyRewarded = alreadyRewarded || localStorage.getItem(this.rewardKey(uid)) === '1';
      } catch (e) {}

      this.stop('completed');

      if (!alreadyRewarded) {
        this.rewardedByUid[uid] = '1';
        try { localStorage.setItem(this.rewardKey(uid), '1'); } catch (e) {}
        const grantTourReward = () => {
          if (window.currentWallet) {
            window.currentWallet.balance = +(parseFloat(window.currentWallet.balance || 0) + TOUR_REWARD_CASH).toFixed(2);
          }
          if (window.currentProfile) {
            window.currentProfile.reputation = (window.currentProfile.reputation || 0) + TOUR_REWARD_REP;
          }
        };
        if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
          window.integrityGuard.runAuthorized(grantTourReward);
        } else {
          grantTourReward();
        }
        if (window.tutorialEngine && typeof window.tutorialEngine.ensureLoaded === 'function') {
          const ts = window.tutorialEngine.ensureLoaded();
          if (!ts.completed) {
            ts.fileExtracted = true;
            ts.virusPlanted = true;
            ts.logsCleaned = true;
            if (ts.step >= 2 && ts.step < 5) {
              ts.step = 5;
            }
            window.tutorialEngine.save();
          }
        }
        if (typeof window.renderHome === 'function' && window.winManager?.current === 'winHome') {
          window.renderHome();
        }
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('TOUR-CONCLUIDO', `Tour Completo concluído! Recebido +$ ${TOUR_REWARD_CASH} Limpos e +${TOUR_REWARD_REP} REP.`, 'success');
        }
        if (window.hackerAudio) window.hackerAudio.playCashChime();
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
        if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
        if (typeof window.showToast === 'function') {
          window.showToast(`🎉 Tour concluído (+$ ${TOUR_REWARD_CASH} Limpos + ${TOUR_REWARD_REP} REP)! Agora conclua o Curso #1 e lave seus $ 600 Sujos na Vitrine!`);
        }
      } else if (typeof window.showToast === 'function') {
        window.showToast('🎉 Tour Guiado concluído! Bom jogo!');
      }
    }
  }

  window.spotlightTour = new InteractiveSpotlightTourEngine();
})();
