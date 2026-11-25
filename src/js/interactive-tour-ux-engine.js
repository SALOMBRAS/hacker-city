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
            width: min(415px, calc(100vw - 24px));
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
          if (unlockEl && this.isActive && audio.src.endsWith(src)) unlockEl.hidden = false;
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
        const prev = pill.textContent;
        pill.textContent = '👆 Clique aqui dentro da luz!';
        setTimeout(() => {
          if (this.isActive) pill.textContent = prev;
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
        // PASSO 1 (idx 0)
        {
          id: 'my_ip',
          selector: '#hudMyIpChip',
          pointerLabel: '👀 Seu IP + Escudo 24h',
          requiresDirectClick: false,
          title: '1. Seu IP Protegido & Escudo Iniciante (24h)',
          desc: 'Esse número no topo é a <strong>placa do seu PC</strong> na rede (passe o mouse ou toque para revelar os últimos 7 dígitos). Nas suas <strong>primeiras 24 horas reais</strong>, seu <strong>Escudo Iniciante de 24h</strong> impede invasões e DDoS de outros jogadores (cai na hora se você atacar um jogador real)!',
          hint: '💡 Suas contas do Esconderijo fecham às <strong>12:00</strong> (1h real = 1 dia; acumulam no máx. 3 meses e pausam sozinhas se você ficar offline).',
          nextLabel: 'Entendi, Próximo →',
          onEnter: () => {
            if (typeof window.navTo === 'function') window.navTo('winHome');
            document.querySelectorAll('details.nav-topic').forEach((d) => { d.open = false; });
          }
        },
        // PASSO 2 (idx 1)
        {
          id: 'topic_pc',
          selector: '#navSummary_pc',
          pointerLabel: '👆 Clique neste tópico',
          requiresDirectClick: true,
          title: '2. Menu Progressivo (Destrava Aos Poucos!)',
          desc: 'Para não poluir sua tela com 27 sistemas de uma vez, o menu lateral começa enxuto e <strong>libera novas telas automaticamente</strong> (com selo verde <strong>NOVO</strong>) conforme você avança!',
          hint: '👆 <strong>Clique em "Meu Computador"</strong> (veteranos podem liberar tudo em <em>Minha Conta → Mostrar Todo o Menu</em>).',
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
        // PASSO 3 (idx 2)
        {
          id: 'open_software',
          selector: 'button.nav-item[data-win="winSoftware"]',
          pointerLabel: '👆 Clique aqui',
          requiresDirectClick: true,
          title: '3. Seus Programas & Peças do PC',
          desc: 'Aqui você controla seus programas de ataque/defesa e melhora as peças do computador (sempre degrau por degrau, cuidando da temperatura e da Fonte de Energia!).',
          hint: '👆 <strong>Clique em "Programas & Proteção"</strong> para ver como funciona a força dos seus programas!',
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
        // PASSO 4
        {
          id: 'running_ram_cooldown',
          selector: '#softwareExplorerMain',
          fallbackSelector: '#runningProgramsPanel',
          pointerLabel: '👀 Programas na RAM & Disco',
          requiresDirectClick: false,
          title: '4. Defesas na Memória vs. Ataques no Disco',
          desc: 'Defesas como <strong>Firewall</strong> e <strong>Hasher</strong> ficam ligadas na sua Memória RAM (1 de cada por vez). Já o <strong>Quebrador de Senha</strong> roda direto do seu disco quando você ataca!',
          hint: '💡 Mais adiante (em <strong>500 REP / Curso #4</strong>) também abre aqui o <strong>Laboratório de Vírus</strong> para criar seus próprios vírus e cumprir encomendas de <strong>$ 18.000 Limpos</strong>!',
          nextLabel: 'Entendi! Vamos Invadir →',
          onEnter: () => {
            this.ensureMobileDrawerIfNeeded(false);
            if (window.winManager && window.winManager.current !== 'winSoftware') {
              if (typeof window.navTo === 'function') window.navTo('winSoftware');
            }
            if (window.softwareEngine) {
              window.softwareEngine.activeTab = 'inventory';
              window.softwareEngine.renderUI('softwareAppBody');
            }
          }
        },
        // PASSO 5
        {
          id: 'topic_net',
          selector: '#navSummary_net',
          pointerLabel: '👆 Clique neste tópico',
          requiresDirectClick: true,
          title: '5. Explorar & Invadir na Prática',
          desc: 'Agora vamos fazer sua <strong>1ª invasão completa</strong>: comparar a força dos programas, quebrar a senha, plantar seu 1º vírus, limpar seu IP e ganhar sua 1ª amostra de <strong>Dinheiro Sujo</strong>!',
          hint: '👆 <strong>Clique em "Explorar & Invadir"</strong> na barra lateral!',
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
        // PASSO 6
        {
          id: 'open_browser',
          selector: 'button.nav-item[data-win="winBrowser"]',
          pointerLabel: '👆 Clique em Navegar por IPs',
          requiresDirectClick: true,
          title: '6. Abrir a Internet do Jogo',
          desc: 'É por aqui (ou pelo atalho <strong>Internet</strong> no topo do menu) que você entra em qualquer IP de empresa, banco, fórum secreto ou outro jogador!',
          hint: '👆 <strong>Clique em "Navegar por IPs"</strong> para mirarmos no computador de treino!',
          nextLabel: 'Abrir Internet →',
          onEnter: () => {
            const d = document.getElementById('navTopic_net');
            if (d) d.open = true;
            this.ensureMobileDrawerIfNeeded(true);
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
        // PASSO 7 — COMPARAR FORÇA DOS APLICATIVOS DA VÍTIMA!
        {
          id: 'compare_defenses',
          selector: '#inetHostDefenseCompareBox',
          pointerLabel: '👀 Compare a Força!',
          requiresDirectClick: false,
          title: '7. Regra nº 1: Seu Quebrador Alcança a Defesa Dele?',
          desc: '<strong>Sempre confira este quadro antes de atacar!</strong> Você só quebra a senha se o seu <strong>Quebrador (Cracker)</strong> tiver versão maior ou igual ao <strong>Firewall</strong> e ao <strong>Hasher</strong> da vítima.',
          hint: '✅ Seu Quebrador é <code>v1.0</code> e a defesa dele também é <code>v1.0</code> — alcance 100% liberado!',
          nextLabel: 'Boa! Quebrar Senha →',
          onEnter: () => {
            this.ensureMobileDrawerIfNeeded(false);
            if (window.internetEngine) {
              window.internetEngine.closeCrackerMiniPc();
              window.internetEngine.disconnectSsh(true);
              window.internetEngine.openIp(TRAINING_IP, 'invadir');
            }
          }
        },
        // PASSO 8 — CLICAR EM QUEBRAR SENHA PARA ABRIR O MINI-PC!
        {
          id: 'crack_password',
          selector: '#btnInetBruteforce',
          fallbackSelector: '#cardAttackBruteforce',
          pointerLabel: '👆 Clique em Quebrar senha!',
          requiresDirectClick: true,
          title: '8. Iniciar Quebra de Senha',
          desc: 'Não precisa abrir o Quebrador antes na memória: basta clicar em <strong>Quebrar senha</strong> para escolher qual versão do seu disco você quer usar!',
          hint: '🔑 <strong>Clique em "Quebrar senha"</strong> na área iluminada!',
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
        // PASSO 9 — ESCOLHER QUAL QUEBRADOR USAR NO MINI-PC!
        {
          id: 'choose_minipc_hash',
          selector: '#miniPcCrackerWindow',
          fallbackSelector: '#btnMiniPcUseBest',
          pointerLabel: '👆 Escolha o Cracker v1.0!',
          requiresDirectClick: true,
          title: '9. Escolha o Quebrador Mais Forte (v1.0)',
          desc: 'Veja as versões guardadas no seu PC: o <code>v0.5</code> não alcança a defesa, mas o <code>Cracker.crc v1.0</code> quebra fácil! Processadores melhores diminuem os segundos de espera.',
          hint: '👆 <strong>Clique em "Usar este"</strong> no <code>Cracker.crc v1.0</code> e aguarde chegar em 100%!',
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
        // PASSO 10 — SUBIR O VÍRUS PRO PC DA VÍTIMA (UPLOAD)!
        {
          id: 'upload_virus_stage',
          selector: '#remoteVirusDeployCard',
          fallbackSelector: '#btnUploadVirusStage',
          pointerLabel: '👆 Clique em 1️⃣ Subir pro PC da Vítima!',
          requiresDirectClick: true,
          title: '10. Enviar Seu Vírus pro Disco da Vítima (1ª Parte)',
          desc: 'Entramos como <strong>root</strong>! Você pode roubar programas melhores da vítima clicando em <strong>Baixar</strong> ou plantar vírus para gerar renda passiva (que entra como <strong>🩸 Dinheiro Sujo</strong>).',
          hint: '📤 <strong>Clique em "1️⃣ Subir pro PC da Vítima"</strong> para enviar sua amostra <code>Spam.vspam (v1.0)</code>!',
          nextLabel: '1️⃣ Subir Vírus Agora →',
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
        // PASSO 11 — EXECUTAR O VÍRUS NO PC DA VÍTIMA!
        {
          id: 'execute_staged_virus',
          selector: '#stagedVirusesBox',
          fallbackSelector: '#btnExecStagedVirus_vspam',
          pointerLabel: '👆 Clique em 2️⃣ Executar no PC da Vítima!',
          requiresDirectClick: true,
          title: '11. Executando o Vírus na Memória da Vítima (2ª Etapa)',
          desc: 'Subir o arquivo só colocou o <code>/root/Spam.vspam</code> no disco da vítima — <strong>ele ainda está parado</strong>! Se você sair sem rodar, ele não gera dinheiro.',
          hint: '▶️ <strong>Clique em "2️⃣ ▶ Executar no PC da Vítima"</strong> para ativá-lo na memória dela!',
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
        // PASSO 12 — VOLTAR NA ABA DE LOGS DA VÍTIMA!
        {
          id: 'back_to_logs_tab',
          selector: '#btnSshSubTabLogs',
          pointerLabel: '👆 Volte p/ Logs da Vítima!',
          requiresDirectClick: true,
          title: '12. Cuidado: Entrar, Subir e Rodar Gravaram Seu IP!',
          desc: 'Seu vírus já está ativo! <strong>MAS ATENÇÃO:</strong> cada passo dentro do PC alheio anota seu IP na aba Logs — se esquecer lá, a polícia ou rivais contra-atacam você!',
          hint: '⚠️ <strong>Sempre limpe a log por último!</strong> Clique em <strong>"Logs (/var/log/syslog) ⚠️"</strong>!',
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
        // PASSO 13 — APAGAR RASTROS + DEIXAR FARPA + RECEBER 1º DINHEIRO SUJO!
        {
          id: 'wipe_log_and_taunt',
          selector: '#remoteTauntQuickBar',
          fallbackSelector: '#remoteLogEditorBox',
          pointerLabel: '👆 Apague seu IP & Deixe Farpa!',
          requiresDirectClick: true,
          title: '13. Apague Todos os Seus Rastros & Saqueie!',
          desc: 'Olhe na caixa abaixo: lá estão seus <strong>3 rastros</strong> com seu IP! Contra rivais fortes você também usará o <strong>Triturador 7-Passos</strong> para apagar até a sombra magnética do disco.',
          hint: '🔥 <strong>Clique em "Apagar Meu IP & Deixar Farpa"</strong> para limpar seu rastro e receber <strong>+$ 600 em 🩸 Dinheiro Sujo</strong> da invasão!',
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
        // PASSO 14 — DINHEIRO SUJO vs. DINHEIRO LIMPO & VITRINE DE LAVAGEM!
        {
          id: 'dirty_vs_clean_economy',
          selector: '#hudDirtyCashBadge',
          fallbackSelector: '#hudWalletMoney',
          pointerLabel: '🩸 Notas Sujas!',
          requiresDirectClick: false,
          title: '14. Regra de Ouro: Dinheiro Sujo vs. Dinheiro Limpo!',
          desc: 'Olhe no topo: entraram <strong>🩸 $ 600 Sujos</strong>! Dinheiro de invasão e vírus vem <strong>Sujo</strong> — se tentar forçar notas sujas para comprar Peças ou Cursos, a polícia prende você! Por isso o menu <strong>Dinheiro & Vida → Lavar Dinheiro</strong> acabou de abrir com o selo <strong>NOVO</strong>.',
          hint: '🧼 Clique em <strong>Concluir (+$ 500 Limpos)</strong> para receber seu bônus legalizado e depois lave seus $ 600 Sujos na <strong>Vitrine Global de Lavagem</strong>!',
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

      this.goToStep(0);

      if (this.trackTimer) clearInterval(this.trackTimer);
      this.trackTimer = setInterval(() => {
        if (this.isActive) this.repositionCurrentStep();
      }, 140);

      window.addEventListener('resize', this._onViewportChange);
    }

    voiceTutorialId = 'tour-guiado';

    _onViewportChange = () => {
      if (this.isActive) this.repositionCurrentStep();
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

      requestAnimationFrame(() => {
        const target = this.resolveTargetElement(step);
        if (target) {
          try {
            target.scrollIntoView({ block: window.innerWidth <= 860 ? 'center' : 'nearest', inline: 'center' });
          } catch (e) {}
          this.bindDirectTargetInteraction(step, target);
        }
        this.repositionCurrentStep();
      });
    }

    resolveTargetElement(step) {
      if (!step) return null;
      const isCompact = window.innerWidth <= 860 || window.innerHeight <= 600;
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
        if (step.id === 'running_ram_cooldown') {
          const compactRam = document.querySelector('#softwareExplorerMain .soft-tab-btn.active') || document.querySelector('#softwareExplorerMain .soft-tabs-bar') || document.getElementById('runningProgramsPanel');
          if (compactRam && compactRam.offsetWidth > 0) return compactRam;
        }
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
      if (!step.requiresDirectClick || !targetEl) return;

      this.boundTargetEl = targetEl;
      this.boundClickHandler = (ev) => {
        if (!this.isActive) return;

        if (step.id === 'topic_pc') {
          setTimeout(() => {
            const d = document.getElementById('navTopic_pc');
            if (d) d.open = true;
            if (this.isActive && this.currentStepId() === 'topic_pc') this.goToStepById('open_software');
          }, 80);
          return;
        }

        if (step.id === 'open_software') {
          setTimeout(() => {
            if (this.isActive && this.currentStepId() === 'open_software') this.goToStepById('running_ram_cooldown');
          }, 100);
          return;
        }

        if (step.id === 'topic_net') {
          setTimeout(() => {
            const d = document.getElementById('navTopic_net');
            if (d) d.open = true;
            if (this.isActive && this.currentStepId() === 'topic_net') this.goToStepById('open_browser');
          }, 80);
          return;
        }

        if (step.id === 'open_browser') {
          setTimeout(() => {
            if (window.internetEngine) {
              window.internetEngine.disconnectSsh(true);
              window.internetEngine.openIp(TRAINING_IP, 'invadir');
            }
            if (this.isActive && this.currentStepId() === 'open_browser') this.goToStepById('compare_defenses');
          }, 100);
          return;
        }

        if (step.id === 'crack_password') {
          setTimeout(() => {
            if (this.isActive && this.currentStepId() === 'crack_password') {
              this.goToStepById('choose_minipc_hash');
            }
          }, 90);
          return;
        }

        if (step.id === 'choose_minipc_hash') {
          const clickedBtn = ev.target && ev.target.closest ? ev.target.closest('button') : null;
          if (clickedBtn && (clickedBtn.id === 'btnMiniPcUseBest' || String(clickedBtn.getAttribute('onclick') || '').includes('confirmBruteforceWithHash'))) {
            const hintEl = document.getElementById('hcTourActionHint');
            if (hintEl) {
              hintEl.innerHTML = '⏳ <strong>Boa! Quebrando a senha em segundo plano...</strong> Aguarde chegar em 100% que o próximo passo abre sozinho!';
            }
            this.startWatchingAsyncStep('crack');
          }
          return;
        }

        if (step.id === 'upload_virus_stage') {
          const clickedBtn = ev.target && ev.target.closest ? ev.target.closest('button') : null;
          if (clickedBtn && (clickedBtn.id === 'btnUploadVirusStage' || clickedBtn.id === 'btnDeployRemoteVirus')) {
            const hintEl = document.getElementById('hcTourActionHint');
            if (hintEl) {
              hintEl.innerHTML = '⏳ <strong>Subindo o arquivo do vírus pro PC da vítima...</strong> Aguarde chegar em 100%!';
            }
            this.startWatchingAsyncStep('upload_stage');
          }
          return;
        }

        if (step.id === 'execute_staged_virus') {
          const clickedBtn = ev.target && ev.target.closest ? ev.target.closest('button') : null;
          if (clickedBtn && clickedBtn.id.startsWith('btnExecStagedVirus_')) {
            setTimeout(() => {
              if (this.isActive && this.currentStepId() === 'execute_staged_virus') this.goToStepById('back_to_logs_tab');
            }, 180);
          }
          return;
        }

        if (step.id === 'back_to_logs_tab') {
          setTimeout(() => {
            if (this.isActive && this.currentStepId() === 'back_to_logs_tab') this.goToStepById('wipe_log_and_taunt');
          }, 120);
          return;
        }

        if (step.id === 'wipe_log_and_taunt') {
          const clickedBtn = ev.target && ev.target.closest ? ev.target.closest('button') : null;
          if (clickedBtn && (clickedBtn.id === 'btnQuickWipeAndTaunt' || clickedBtn.id === 'btnSaveRemoteSyslog' || clickedBtn.id === 'btnWipeAllRemoteLogs')) {
            setTimeout(() => {
              this.grantDirtyTourSampleOnce();
              if (this.isActive) this.goToStepById('dirty_vs_clean_economy');
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

      if (ring) {
        if (hole.width > 0 && hole.height > 0) {
          ring.style.display = 'block';
          ring.style.top = hole.top + 'px';
          ring.style.left = hole.left + 'px';
          ring.style.width = hole.width + 'px';
          ring.style.height = hole.height + 'px';
          if (pill) {
            pill.classList.toggle('below', hole.top < 36);
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
        const cw = card.offsetWidth || 405;
        const ch = card.offsetHeight || 205;
        const gap = 16;
        const bottomGap = hole.top < 36 ? 38 : gap;
        const topGap = 36;
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
