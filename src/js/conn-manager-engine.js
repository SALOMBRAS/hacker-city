/**
 * Hacker City // Pilar 5: ConnManager & Defesa Ativa em Tempo Real
 * Monitor de Conexões Ao Vivo (Inbound/Outbound) com Alerta Sonoro de Intrusão,
 * Telemetria de Ações e Botão de Emergência para Cortar Cabo (Kill Session).
 */
(function () {
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function nowTime() {
    return new Date().toLocaleTimeString('pt-BR');
  }

  class ConnManagerEngine {
    constructor() {
      this.inboundSessions = [];
      this.outboundSessions = [];
      this.channel = null;
      this.isModalOpen = false;
      this.pollTimer = null;
      this.init();
    }

    init() {
      this.setupRealtimeChannel();
      this.setupSimulatedIntrusions();
      this.renderHeaderWidget();
    }

    // Retorna o IP público atual do jogador
    getPlayerIp() {
      if (window.networkIdentity && window.networkIdentity.publicIp) {
        return window.networkIdentity.publicIp;
      }
      return localStorage.getItem('hc_public_ip') || '187.45.12.90';
    }

    // Configura canal Supabase Realtime para sincronização de sessões de rede ativas
    setupRealtimeChannel() {
      if (!window.supabaseClient) {
        // Fallback para LocalStorage / BroadcastChannel nativo
        if (window.BroadcastChannel) {
          try {
            this.broadcastChannel = new BroadcastChannel('hc_peer_sessions_mesh');
            this.broadcastChannel.onmessage = (ev) => this.handlePeerMessage(ev.data);
          } catch (e) {
            console.warn('[ConnManager] BroadcastChannel fallback unavailable', e);
          }
        }
        return;
      }

      try {
        this.channel = window.supabaseClient.channel('hc-conn-sessions');
        this.channel
          .on('broadcast', { event: 'intrusion_start' }, (payload) => this.handlePeerMessage(payload))
          .on('broadcast', { event: 'session_kill' }, (payload) => this.handlePeerMessage(payload))
          .subscribe();
      } catch (err) {
        console.warn('[ConnManager] Supabase channel error, running local mesh:', err);
      }
    }

    handlePeerMessage(msg) {
      if (!msg || !msg.event) return;
      const myIp = this.getPlayerIp();

      if (msg.event === 'intrusion_start' && msg.target_ip === myIp) {
        this.registerInboundSession({
          id: msg.session_id || 'sess_' + Math.random().toString(36).substring(2, 9),
          originIp: msg.origin_ip || '198.51.100.22',
          originAlias: msg.origin_alias || 'Operador Remoto',
          protocol: msg.protocol || 'SSH',
          action: msg.action || 'Quebrando Senha Root',
          progressPct: msg.progress_pct || 10,
          startedAt: nowTime()
        });
      }

      if (msg.event === 'session_kill') {
        // Se alguém cortou uma sessão iniciada por nós
        if (msg.origin_ip === myIp || msg.target_ip === myIp) {
          this.handleOutboundKilled(msg);
        }
      }
    }

    // Registra conexão de entrada (alguém nos atacando)
    registerInboundSession(session) {
      // Evita duplicatas do mesmo IP
      const idx = this.inboundSessions.findIndex((s) => s.originIp === session.originIp);
      if (idx >= 0) {
        this.inboundSessions[idx].action = session.action;
        this.inboundSessions[idx].progressPct = session.progressPct;
      } else {
        this.inboundSessions.push(session);
        // Efeito sonoro de alerta de intrusão
        if (window.audioEngine && typeof window.audioEngine.playInvasionAlert === 'function') {
          window.audioEngine.playInvasionAlert();
        } else if (window.audioEngine && typeof window.audioEngine.playAlertSiren === 'function') {
          window.audioEngine.playAlertSiren(1.5);
        }

        // Exibe toast de aviso tático no sistema operacional
        if (window.showToast) {
          window.showToast(
            `⚠️ ALERTA DE INTRUSÃO: ${session.originIp} (${session.originAlias}) conectou via ${session.protocol}!`,
            'danger'
          );
        }
      }

      this.updateUI();
    }

    // Registra conexão de saída (nós atacando alguém)
    registerOutboundSession(targetIp, targetAlias, actionLabel) {
      const existing = this.outboundSessions.find((s) => s.targetIp === targetIp);
      if (existing) {
        existing.action = actionLabel;
      } else {
        const sess = {
          id: 'out_' + Math.random().toString(36).substring(2, 9),
          targetIp,
          targetAlias: targetAlias || 'Alvo Remoto',
          protocol: 'SSH',
          action: actionLabel || 'Conectado / Varredura',
          startedAt: nowTime()
        };
        this.outboundSessions.push(sess);

        // Notifica canal caso haja oponente online
        const myIp = this.getPlayerIp();
        const payload = {
          event: 'intrusion_start',
          session_id: sess.id,
          origin_ip: myIp,
          origin_alias: localStorage.getItem('hc_hacker_tag') || 'Operador',
          target_ip: targetIp,
          protocol: 'SSH',
          action: actionLabel,
          progress_pct: 15
        };
        if (this.channel) this.channel.send({ type: 'broadcast', event: 'intrusion_start', payload });
        if (this.broadcastChannel) this.broadcastChannel.postMessage(payload);
      }
      this.updateUI();
    }

    // Encerra sessão de saída por nossa vontade
    closeOutboundSession(targetIp) {
      this.outboundSessions = this.outboundSessions.filter((s) => s.targetIp !== targetIp);
      this.updateUI();
    }

    // BOTÃO DE PÂNICO: Cortar Cabo (Kill Session)
    async killSession(sessionId) {
      const idx = this.inboundSessions.findIndex((s) => s.id === sessionId);
      if (idx === -1) return;

      const victimSess = this.inboundSessions[idx];
      this.inboundSessions.splice(idx, 1);

      // Toca som de cabo cortado e erro
      if (window.audioEngine && typeof window.audioEngine.playErrorBuzz === 'function') {
        window.audioEngine.playErrorBuzz();
      }

      // Notifica canal Realtime para abortar o invasor
      const payload = {
        event: 'session_kill',
        session_id: sessionId,
        origin_ip: victimSess.originIp,
        target_ip: this.getPlayerIp()
      };
      if (this.channel) this.channel.send({ type: 'broadcast', event: 'session_kill', payload });
      if (this.broadcastChannel) this.broadcastChannel.postMessage(payload);

      // Chama RPC no Supabase caso configurado
      if (window.supabaseClient) {
        try {
          await window.supabaseClient.rpc('kill_active_peer_session', {
            p_session_id: sessionId.includes('-') ? sessionId : '00000000-0000-0000-0000-000000000001',
            p_caller_ip: this.getPlayerIp()
          });
        } catch (e) {
          console.warn('[ConnManager] RPC kill session notice:', e);
        }
      }

      // Grava no syslog como invasor frustrado
      if (window.networkIdentity && typeof window.networkIdentity.addSystemLog === 'function') {
        window.networkIdentity.addSystemLog(
          `ALERTA DEFESA: Conexão de ${victimSess.originIp} abortada com sucesso pelo botão Cortar Cabo.`,
          'warning'
        );
      }

      if (window.showToast) {
        window.showToast(
          `⚡ CABO CORTADO! Sessão de ${victimSess.originIp} encerrada com sucesso. Invasor desconectado!`,
          'success'
        );
      }

      this.updateUI();
    }

    // Tratamento quando nosso próprio ataque for cortado pelo defensor
    handleOutboundKilled(payload) {
      const target = payload.target_ip;
      const found = this.outboundSessions.find((s) => s.targetIp === target);
      if (found) {
        this.closeOutboundSession(target);

        // Aborta a barra de ataque atual caso aberta
        if (window.activeAttackSession) {
          window.activeAttackSession.aborted = true;
        }

        if (window.audioEngine && typeof window.audioEngine.playErrorBuzz === 'function') {
          window.audioEngine.playErrorBuzz();
        }

        if (window.showToast) {
          window.showToast(
            `❌ CONEXÃO ABORTADA PELO HOST REMOTO (${target}): O defensor cortou o cabo da conexão!`,
            'danger'
          );
        }

        // Imprime no terminal se ativo
        const term = document.querySelector('#terminal-output, .terminal-body');
        if (term) {
          const div = document.createElement('div');
          div.style.color = '#ef4444';
          div.style.fontWeight = 'bold';
          div.style.marginTop = '6px';
          div.textContent = `[ALERTA DE REDE] Connection reset by peer (${target}). A sessão foi encerrada à força pelo host.`;
          term.appendChild(div);
          term.scrollTop = term.scrollHeight;
        }
      }
    }

    // Gera invasões simuladas periódicas de bots da rede caso esteja sozinho
    setupSimulatedIntrusions() {
      // Simulação a cada 90 segundos de um bot explorando o IP
      setInterval(() => {
        if (this.inboundSessions.length === 0 && Math.random() < 0.45) {
          const botIps = ['10.110.1.18', '10.110.2.14', '177.20.14.88', '198.51.100.41'];
          const botAliases = ['NullByte_BR', 'Kuro_Phantom', 'Ransom_Crawler', 'GhostScanner_01'];
          const pick = Math.floor(Math.random() * botIps.length);

          this.registerInboundSession({
            id: 'sim_' + Date.now(),
            originIp: botIps[pick],
            originAlias: botAliases[pick],
            protocol: 'SSH',
            action: 'Tentando quebrar senha root (' + (30 + Math.floor(Math.random() * 40)) + '%)',
            progressPct: 45,
            startedAt: nowTime()
          });
        }
      }, 75000);
    }

    // Renderiza Widget de Conexões no Header / Barra Superior do Sistema
    renderHeaderWidget() {
      let widget = document.getElementById('header-conn-widget');
      if (!widget) {
        const topBar = document.querySelector('.desktop-topbar, .header-right, .os-taskbar, header');
        if (topBar) {
          widget = document.createElement('div');
          widget.id = 'header-conn-widget';
          widget.style.display = 'inline-flex';
          widget.style.alignItems = 'center';
          widget.style.gap = '8px';
          widget.style.padding = '4px 10px';
          widget.style.borderRadius = '6px';
          widget.style.background = '#151c27';
          widget.style.border = '1px solid #28374d';
          widget.style.fontSize = '0.78rem';
          widget.style.fontFamily = 'monospace';
          widget.style.cursor = 'pointer';
          widget.title = 'Clique para abrir o Monitor de Conexões Ao Vivo (ConnManager)';
          widget.onclick = () => this.openModal();
          topBar.appendChild(widget);
        }
      }
      this.updateHeaderWidget();
    }

    updateHeaderWidget() {
      const widget = document.getElementById('header-conn-widget');
      if (!widget) return;

      const inCount = this.inboundSessions.length;
      const outCount = this.outboundSessions.length;

      let inColor = inCount > 0 ? '#ef4444' : '#8e9db4';
      let inAnim = inCount > 0 ? 'animation: blink 1s infinite;' : '';

      widget.innerHTML = `
        <span style="color:${inColor}; font-weight:bold; ${inAnim}">⚡ IN: ${inCount}</span>
        <span style="color:#4b6a9b;">|</span>
        <span style="color:#35b877;">OUT: ${outCount}</span>
      `;
    }

    updateUI() {
      this.updateHeaderWidget();
      if (this.isModalOpen) {
        this.renderModalBody();
      }
    }

    openModal() {
      this.isModalOpen = true;
      let modal = document.getElementById('conn-manager-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'conn-manager-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(5, 8, 14, 0.75)';
        modal.style.backdropFilter = 'blur(6px)';
        modal.style.zIndex = '9999';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.innerHTML = `
          <div style="background:#111622; border:1px solid #2e3e56; border-radius:12px; width:720px; max-width:94vw; box-shadow:0 16px 40px rgba(0,0,0,0.6); overflow:hidden; font-family:sans-serif; color:#e2e8f0;">
            <div style="background:#182130; padding:12px 18px; border-bottom:1px solid #2e3e56; display:flex; justify-content:space-between; align-items:center;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:1.15rem;">⚡</span>
                <strong style="font-size:0.98rem; letter-spacing:0.02em; color:#38bdf8;">CONNMANAGER // MONITOR DE CONEXÕES AO VIVO</strong>
              </div>
              <button id="close-conn-modal-btn" style="background:transparent; border:none; color:#8e9db4; font-size:1.2rem; cursor:pointer; padding:0 6px;">✕</button>
            </div>
            <div id="conn-modal-body" style="padding:18px; max-height:75vh; overflow-y:auto;"></div>
          </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('close-conn-modal-btn').onclick = () => {
          modal.style.display = 'none';
          this.isModalOpen = false;
        };
      } else {
        modal.style.display = 'flex';
      }

      this.renderModalBody();
    }

    renderModalBody() {
      const container = document.getElementById('conn-modal-body');
      if (!container) return;

      const myIp = this.getPlayerIp();

      let inHtml = '';
      if (this.inboundSessions.length === 0) {
        inHtml = `
          <div style="background:#0c1017; border:1px dashed #243144; border-radius:8px; padding:16px; text-align:center; color:#8e9db4; font-size:0.86rem;">
            🟢 Nenhuma conexão de entrada não autorizada detectada no momento. Firewall e Gateway protegidos.
          </div>
        `;
      } else {
        inHtml = `
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${this.inboundSessions
              .map(
                (s) => `
              <div style="background:#1c1318; border:1px solid #7f1d1d; border-radius:8px; padding:14px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
                <div>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#ef4444;"></span>
                    <strong style="color:#f87171; font-family:monospace; font-size:0.95rem;">${esc(s.originIp)}</strong>
                    <span style="font-size:0.78rem; background:#361014; color:#fca5a5; padding:2px 8px; border-radius:4px;">${esc(s.originAlias)}</span>
                    <span style="font-size:0.75rem; color:#8e9db4;">Protocolo: ${esc(s.protocol)}</span>
                  </div>
                  <div style="font-size:0.84rem; color:#fecaca; margin-top:4px;">
                    Ação: <strong>${esc(s.action)}</strong> (${esc(s.progressPct)}%) • Conectado às ${esc(s.startedAt)}
                  </div>
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="kill-btn" onclick="window.connManagerEngine.killSession('${esc(s.id)}')" style="background:#dc2626; color:#fff; border:none; padding:8px 14px; border-radius:6px; font-weight:bold; font-size:0.82rem; cursor:pointer; box-shadow:0 2px 8px rgba(220,38,38,0.4);">
                    ⚡ CORTAR CABO
                  </button>
                  <button onclick="window.connManagerEngine.retaliateAgainst('${esc(s.originIp)}')" style="background:#1f2937; color:#38bdf8; border:1px solid #374151; padding:8px 12px; border-radius:6px; font-size:0.82rem; cursor:pointer;">
                    🎯 Vingar / Rastrear
                  </button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        `;
      }

      let outHtml = '';
      if (this.outboundSessions.length === 0) {
        outHtml = `
          <div style="background:#0c1017; border:1px dashed #243144; border-radius:8px; padding:14px; text-align:center; color:#8e9db4; font-size:0.84rem;">
            Nenhuma sessão de saída ativa no momento. Conecte-se a outro IP para iniciar ações.
          </div>
        `;
      } else {
        outHtml = `
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${this.outboundSessions
              .map(
                (s) => `
              <div style="background:#0f172a; border:1px solid #1e3a5f; border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <strong style="color:#38bdf8; font-family:monospace;">${esc(s.targetIp)}</strong> (${esc(s.targetAlias)})
                  <div style="font-size:0.82rem; color:#94a3b8; margin-top:2px;">Ação: ${esc(s.action)} • Desde: ${esc(s.startedAt)}</div>
                </div>
                <button onclick="window.connManagerEngine.closeOutboundSession('${esc(s.targetIp)}')" style="background:#1e293b; color:#cbd5e1; border:1px solid #334155; padding:6px 12px; border-radius:6px; font-size:0.78rem; cursor:pointer;">
                  Desconectar
                </button>
              </div>
            `
              )
              .join('')}
          </div>
        `;
      }

      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:14px; font-size:0.84rem; color:#94a3b8;">
          <span>Seu IP de Escuta: <strong style="color:#e2e8f0; font-family:monospace;">${esc(myIp)}</strong></span>
          <span>Defesa de Sockets: <strong style="color:#35b877;">ATIVA (Realtime)</strong></span>
        </div>

        <h4 style="margin:0 0 8px 0; font-size:0.9rem; color:#f87171; display:flex; align-items:center; gap:6px;">
          <span>🔴</span> CONEXÕES DE ENTRADA (INBOUND) — ALVOS DE INTRUSÃO
        </h4>
        ${inHtml}

        <h4 style="margin:20px 0 8px 0; font-size:0.9rem; color:#38bdf8; display:flex; align-items:center; gap:6px;">
          <span>🔵</span> SUAS CONEXÕES DE SAÍDA (OUTBOUND)
        </h4>
        ${outHtml}

        <div style="margin-top:22px; padding-top:14px; border-top:1px solid #243144; font-size:0.8rem; color:#64748b; line-height:1.4;">
          💡 <strong>Dica Tática de Defesa:</strong> Ao clicar em <em>"Cortar Cabo"</em>, a conexão do invasor é imediatamente encerrada e o IP dele fica gravado para vingança ou emissão de recompensa no mural da cidade.
        </div>
      `;
    }

    retaliateAgainst(targetIp) {
      if (this.isModalOpen) {
        document.getElementById('conn-manager-modal').style.display = 'none';
        this.isModalOpen = false;
      }
      if (window.openBountyModalForTarget) {
        window.openBountyModalForTarget(targetIp, 'Invasor pego em flagrante no ConnManager');
      } else if (window.connectToIp) {
        window.connectToIp(targetIp);
      } else {
        if (window.showToast) window.showToast(`🎯 IP ${targetIp} preparado para contra-ataque!`, 'warning');
      }
    }
  }

  // Instancia e expõe globalmente
  window.connManagerEngine = new ConnManagerEngine();
  window.openConnManagerModal = () => window.connManagerEngine.openModal();
})();
