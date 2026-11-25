/**
 * Hacker City // Pilar 5: Conexões ao Vivo (ConnManager) & Defesa Ativa
 * Página nativa integrada ao Design System ("Arroz com Feijão Bem Feito").
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

  function iconSvg(name) {
    return (window.HC && window.HC.icon) ? window.HC.icon(name) : '';
  }

  class ConnManagerEngine {
    constructor() {
      this.inboundSessions = [];
      this.outboundSessions = [];
      this.reinvadeLocks = new Map(); // targetIp -> untilTimestampMs (2 min de prazo pro alvo trocar IP)
      this.channel = null;
      this.isModalOpen = false;
      this.init();
    }

    getReinvadeLockStatus(targetIp) {
      if (!targetIp || !this.reinvadeLocks.has(targetIp)) return { locked: false, remSec: 0 };
      const until = this.reinvadeLocks.get(targetIp);
      const remMs = until - Date.now();
      if (remMs <= 0) {
        this.reinvadeLocks.delete(targetIp);
        return { locked: false, remSec: 0 };
      }
      const remSec = Math.ceil(remMs / 1000);
      return {
        locked: true,
        remSec,
        message: `⏳ O alvo conseguiu cortar sua conexão! Ele tem 2 min para trocar de IP — se ele NÃO trocar o IP, você poderá invadir ${targetIp} novamente em ${remSec}s!`
      };
    }

    setReinvadeLock(targetIp, durationMs = 120000) {
      if (!targetIp) return;
      this.reinvadeLocks.set(targetIp, Date.now() + Math.max(1000, durationMs));
    }

    init() {
      this.setupRealtimeChannel();
      this.setupSimulatedIntrusions();
      this.syncSidebarBadge();
    }

    getPlayerIp() {
      if (window.networkIdentity && window.networkIdentity.getPublicIp) {
        return window.networkIdentity.getPublicIp();
      }
      return localStorage.getItem('hc_public_ip') || '187.45.12.90';
    }

    setupRealtimeChannel() {
      if (!window.supabaseClient) {
        if (window.BroadcastChannel) {
          try {
            this.broadcastChannel = new BroadcastChannel('hc_peer_sessions_mesh');
            this.broadcastChannel.onmessage = (ev) => this.handlePeerMessage(ev.data);
          } catch (e) {}
        }
        return;
      }

      try {
        this.channel = window.supabaseClient.channel('hc-conn-sessions');
        this.channel
          .on('broadcast', { event: 'intrusion_start' }, (payload) => this.handlePeerMessage(payload))
          .on('broadcast', { event: 'session_kill' }, (payload) => this.handlePeerMessage(payload))
          .subscribe();
      } catch (err) {}
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
        if (msg.origin_ip === myIp || msg.target_ip === myIp) {
          this.handleOutboundKilled(msg);
        }
      }
    }

    registerInboundSession(session) {
      const isExplicitTrainingSim = !!(session && (session.forceTest || String(session.id || '').startsWith('sim_')));
      if (window.progressiveUnlockEngine && typeof window.progressiveUnlockEngine.isNewbiePvpShieldActive === 'function' && window.progressiveUnlockEngine.isNewbiePvpShieldActive() && !isExplicitTrainingSim) {
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('SHIELD-RECRUTA', `Escudo de Novato (24h) bloqueou tentativa de intrusão externa de ${session ? session.originIp : 'remoto'}.`, 'info');
        }
        return { blockedByNewbieShield: true };
      }
      const idx = this.inboundSessions.findIndex((s) => s.originIp === session.originIp);
      if (idx >= 0) {
        this.inboundSessions[idx].action = session.action;
        this.inboundSessions[idx].progressPct = session.progressPct;
      } else {
        this.inboundSessions.push(session);
        if (window.audioEngine && typeof window.audioEngine.playInvasionAlert === 'function') {
          window.audioEngine.playInvasionAlert();
        } else if (window.audioEngine && typeof window.audioEngine.playAlertSiren === 'function') {
          window.audioEngine.playAlertSiren(1.2);
        }

          if (window.showToast) {
          window.showToast(
            `Intrusão detectada: ${session.originIp} (${session.originAlias}) conectou via ${session.protocol}.`,
            'danger'
          );
        }
        if (window.nineSystemsEngine && typeof window.nineSystemsEngine.triggerActiveDefensePopover === 'function') {
          window.nineSystemsEngine.triggerActiveDefensePopover(session);
        }
      }
      this.updateUI();
    }

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

        const myIp = this.getPlayerIp();
        const payload = {
          event: 'intrusion_start',
          session_id: sess.id,
          origin_ip: myIp,
          origin_alias: (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador',
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

    closeOutboundSession(targetIp) {
      this.outboundSessions = this.outboundSessions.filter((s) => s.targetIp !== targetIp);
      this.updateUI();
    }

    async killSession(sessionId, actionKind = 'cut_cable', opts = {}) {
      if (window.nineSystemsEngine && typeof window.nineSystemsEngine.attemptEmergencyDisconnect === 'function') {
        return window.nineSystemsEngine.attemptEmergencyDisconnect(actionKind, { ...(opts || {}), sessionId });
      }
      return { success: false };
    }

    async forceDropInboundAfterRoulette(sessionId, originIp, actionKind = 'cut_cable') {
      this.inboundSessions = this.inboundSessions.filter((s) => s.id !== sessionId && s.originIp !== originIp);
      if (window.audioEngine && typeof window.audioEngine.playErrorBuzz === 'function') {
        window.audioEngine.playErrorBuzz();
      }
      const payload = {
        event: 'session_kill',
        session_id: sessionId,
        origin_ip: originIp,
        target_ip: this.getPlayerIp(),
        action_kind: actionKind,
        reinvade_lock_ms: 120000
      };
      if (this.channel) this.channel.send({ type: 'broadcast', event: 'session_kill', payload });
      if (this.broadcastChannel) this.broadcastChannel.postMessage(payload);
      if (window.supabaseClient) {
        try {
          await window.supabaseClient.rpc('kill_active_peer_session', {
            p_session_id: String(sessionId || '').includes('-') ? sessionId : '00000000-0000-0000-0000-000000000001',
            p_caller_ip: this.getPlayerIp()
          });
        } catch (e) {}
      }
      this.updateUI();
    }

    handleOutboundKilled(payload) {
      const target = payload.target_ip;
      const lockMs = Number(payload.reinvade_lock_ms || 120000);
      this.setReinvadeLock(target, lockMs);
      this.closeOutboundSession(target);
      if (window.activeAttackSession) {
        window.activeAttackSession.aborted = true;
      }
      if (window.internetEngine && typeof window.internetEngine.abortActiveInvasionByDefenderCut === 'function') {
        window.internetEngine.abortActiveInvasionByDefenderCut(target);
      }
      if (window.audioEngine && typeof window.audioEngine.playErrorBuzz === 'function') {
        window.audioEngine.playErrorBuzz();
      }
      if (window.showToast) {
        window.showToast(`🔌 Conexão derrubada por ${target}! Ele tem 2 min para trocar de IP — se não trocar, você poderá invadir de novo em 2 min!`, 'danger');
      }
    }

    setupSimulatedIntrusions() {
      setInterval(() => {
        if (this.inboundSessions.length === 0 && Math.random() < 0.25) {
          const dayBots = (window.botScheduler && window.botScheduler.getCurrentDayBots()) || [];
          const picked = dayBots.length > 0 ? dayBots[Math.floor(Math.random() * dayBots.length)] : { ip: '177.84.22.91', handle: 'hackerbr' };
          this.registerInboundSession({
            id: 'bot_bg_' + Date.now(),
            originIp: picked.ip,
            originAlias: picked.handle,
            isBot: true,
            protocol: 'SSH',
            action: 'Tentando quebrar senha (' + (30 + Math.floor(Math.random() * 40)) + '%)',
            progressPct: 45,
            startedAt: nowTime()
          });
        }
      }, 95000);
    }

    syncSidebarBadge() {
      const badge = document.getElementById('navConnAlertBadge');
      if (!badge) return;
      const n = this.inboundSessions.length;
      badge.textContent = String(n);
      badge.style.display = n > 0 ? 'inline-flex' : 'none';
    }

    updateUI() {
      this.syncSidebarBadge();
      this.renderPage();
    }

    openModal() {
      this.isModalOpen = true;
      if (typeof window.navTo === 'function') {
        window.navTo('winConnManager');
      }
      this.renderPage();
    }

    renderModalBody() {
      this.renderPage();
    }

    renderPage() {
      const container = document.getElementById('connManagerAppBody') || document.getElementById('conn-modal-body');
      if (!container) return;

      const myIp = this.getPlayerIp();
      const inCount = this.inboundSessions.length;
      const outCount = this.outboundSessions.length;

      const inboundHtml = inCount === 0
        ? `<div class="hc-empty-box">
             <div class="hc-empty-icon">${iconSvg('shield')}</div>
             <strong>Nenhuma conexão suspeita agora</strong>
             <p>Quando outro operador tentar quebrar sua senha ou mexer nos seus arquivos, a sessão aparecerá aqui ao vivo.</p>
           </div>`
        : `<table class="hc-table">
             <thead>
               <tr>
                 <th>Origem</th>
                 <th>Operador</th>
                 <th>Atividade detectada</th>
                 <th>Horário</th>
                 <th style="text-align:right;">Ações</th>
               </tr>
             </thead>
             <tbody>
               ${this.inboundSessions.map((s) => {
                 const avail = (window.nineSystemsEngine && typeof window.nineSystemsEngine.getInvasionCutAvailability === 'function')
                   ? window.nineSystemsEngine.getInvasionCutAvailability(s.id, s.originIp)
                   : { canAttempt: true };
                 const empCfg = (window.nineSystemsEngine && window.nineSystemsEngine.getEmergencyCutConfig('emp_pulse')) || { cost: 1200 };
                 const vpsCfg = (window.nineSystemsEngine && window.nineSystemsEngine.getEmergencyCutConfig('vps_reroute')) || { cost: 3500 };
                 return `
                 <tr>
                   <td class="mono" style="color: var(--hc-danger-text); font-weight: 600;">Rota oculta</td>
                   <td>
                     <span class="hc-badge danger" style="cursor:pointer;" data-player-tag="${esc(s.originAlias)}">${esc(s.originAlias)}</span>
                     <span class="mono" style="font-size:11px;color:var(--hc-text-3);margin-left:6px;">${esc(s.protocol)}</span>
                   </td>
                   <td>
                     <div style="font-weight:500;">${esc(s.action)}</div>
                     <div class="hc-progress danger" style="margin-top:5px;max-width:220px;"><span style="width:${Math.min(100, Number(s.progressPct || 35))}%;"></span></div>
                   </td>
                   <td class="mono" style="color:var(--hc-text-3);font-size:12px;">${esc(s.startedAt)}</td>
                   <td style="text-align:right;">
                     ${avail.canAttempt
                       ? `<div style="display:flex;gap:5px;justify-content:flex-end;flex-wrap:wrap;">
                            <button type="button" class="hc-btn danger sm kill-btn" onclick="window.connManagerEngine.killSession('${esc(s.id)}', 'cut_cable')">
                              🔌 Cabo 20% (Grátis)
                            </button>
                            <button type="button" class="hc-btn ghost sm" style="border-color:#38bdf8;color:#7dd3fc;" onclick="window.connManagerEngine.killSession('${esc(s.id)}', 'emp_pulse')">
                              ⚡ EMP 40% ($${empCfg.cost.toLocaleString('pt-BR')})
                            </button>
                            <button type="button" class="hc-btn ghost sm" style="border-color:#f59e0b;color:#fde68a;" onclick="window.connManagerEngine.killSession('${esc(s.id)}', 'vps_reroute')">
                              🖥️ VPS 70% ($${vpsCfg.cost.toLocaleString('pt-BR')})
                            </button>
                          </div>`
                       : `<span class="hc-badge danger" style="font-size:11px;">${esc(avail.reason || 'Tentativa já usada')}</span>`}
                   </td>
                 </tr>`;
               }).join('')}
             </tbody>
           </table>`;

      const outboundHtml = outCount === 0
        ? `<div class="hc-empty-box" style="padding: 20px 16px;">
             <strong>Nenhuma conexão de saída ativa</strong>
             <p>Suas sessões abertas em servidores remotos aparecem listadas aqui.</p>
           </div>`
        : `<table class="hc-table">
             <thead>
               <tr>
                 <th>Alvo remoto</th>
                 <th>Identificação</th>
                 <th>Operação atual</th>
                 <th>Início</th>
                 <th style="text-align:right;">Ação</th>
               </tr>
             </thead>
             <tbody>
               ${this.outboundSessions.map((s) => `
                 <tr>
                   <td class="mono" style="color: var(--hc-accent-text); font-weight: 600;">${esc(s.targetIp)}</td>
                   <td>${esc(s.targetAlias)}</td>
                   <td style="color: var(--hc-text-2);">${esc(s.action)}</td>
                   <td class="mono" style="color: var(--hc-text-3); font-size: 12px;">${esc(s.startedAt)}</td>
                   <td style="text-align:right;">
                     <button type="button" class="hc-btn ghost sm" onclick="window.connManagerEngine.closeOutboundSession('${esc(s.targetIp)}')">
                       Encerrar
                     </button>
                   </td>
                 </tr>
               `).join('')}
             </tbody>
           </table>`;

      container.innerHTML = `
        <div class="hc-stat-strip" style="margin-bottom: 20px;">
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Seu IP monitorado</div>
            <div class="hc-stat-value" style="color: var(--hc-accent-text);">${esc(myIp)}</div>
            <div class="hc-stat-sub">Porta SSH 22 vigiada</div>
          </div>
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Conexões entrando</div>
            <div class="hc-stat-value" style="color: ${inCount > 0 ? 'var(--hc-danger-text)' : 'var(--hc-text)'};">${inCount}</div>
            <div class="hc-stat-sub ${inCount > 0 ? 'danger' : 'ok'}">${inCount > 0 ? 'Intruso conectado agora' : 'Perímetro limpo'}</div>
          </div>
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Conexões saindo</div>
            <div class="hc-stat-value">${outCount}</div>
            <div class="hc-stat-sub">Sessões remotas abertas</div>
          </div>
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Sensor de rede</div>
            <div class="hc-stat-value">Ativo</div>
            <div class="hc-stat-sub ok">Sincronizado em tempo real</div>
          </div>
        </div>

        <div class="hc-card" style="padding: 0; overflow: hidden; margin-bottom: 18px;">
          <div style="padding: 14px 18px; border-bottom: 1px solid var(--hc-border); display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
            <strong style="font-size: 14px;">Sessões entrando no seu computador</strong>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <button type="button" id="btnSimulateActiveDefense15s" class="hc-btn ghost sm" style="border-color:var(--hc-danger);color:var(--hc-danger-text);" onclick="window.connManagerEngine.registerInboundSession({ id: 'sim_' + Date.now(), originIp: '91.134.72.19', originAlias: 'nyx_0day', protocol: 'SSH', action: 'Quebrando senha root (48%)', progressPct: 48, startedAt: new Date().toLocaleTimeString('pt-BR') })">
                🚨 Simular Intrusão p/ Testar Defesa 15s
              </button>
              <span class="hc-badge ${inCount > 0 ? 'danger' : 'success'}">${inCount > 0 ? `${inCount} invasão ativa` : 'Seguro'}</span>
            </div>
          </div>
          <div style="padding: 10px 18px; border-bottom: 1px solid var(--hc-border);">
            <details class="nds-rules-drawer">
              <summary>📖 Regras da Roleta Russa de Corte de Conexão &amp; Prazo de 2 Minutos para Trocar IP</summary>
              <ol class="nds-rules-list">
                <li><strong>Fim do Corte 100% Garantido (1 Tentativa por Invasão):</strong> Você só tem <strong>1 única tentativa</strong> para tentar derrubar uma invasão em andamento — se a roleta falhar, não é possível tentar de novo na mesma invasão!</li>
                <li><strong>🔌 1. Puxar o Cabo (Grátis · 20% de chance):</strong> Não custa nada, mas só funciona em <strong>20%</strong> das vezes (e pausa suas transferências por 15s se der certo).</li>
                <li><strong>⚡ 2. Pulso Reverso EMP ($ 1.200 HC · 40% de chance):</strong> Cobra <strong>$ 1.200 HC</strong> ao tentar (+12°C na CPU) e tem <strong>40%</strong> de chance de cancelar a invasão.</li>
                <li><strong>🖥️ 3. Desvio via VPS ($ 3.500 HC · 70% de chance):</strong> Cobra ao tentar ($ 2.000 se já tiver VPS própria) e tem <strong>70%</strong> de chance de derrubar a conexão e rastrear o IP do invasor!</li>
                <li><strong>⏱️ Prazo de 2 Minutos p/ Trocar o IP:</strong> Se conseguir cancelar a invasão, o atacante fica impedido de atacar seu IP por <strong>2 minutos</strong>. Se você <strong>NÃO comprar outro IP em 71.4.5.1</strong> dentro desses 2 minutos, ele poderá invadir de novo e o corte não funcionará novamente no mesmo IP!</li>
              </ol>
            </details>
          </div>
          ${inboundHtml}
        </div>

        <div class="hc-card" style="padding: 0; overflow: hidden;">
          <div style="padding: 14px 18px; border-bottom: 1px solid var(--hc-border); display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 14px;">Suas conexões de saída</strong>
            <span class="hc-badge">${outCount} ativa${outCount === 1 ? '' : 's'}</span>
          </div>
          ${outboundHtml}
        </div>
      `;
    }

    retaliateAgainst(targetIp) {
      if (window.internetEngine && typeof window.internetEngine.openIp === 'function') {
        window.internetEngine.openIp(targetIp);
      } else if (window.openBountyModalForTarget) {
        window.openBountyModalForTarget(targetIp, 'Invasor detectado nas Conexões ao Vivo');
      }
    }
  }

  window.connManagerEngine = new ConnManagerEngine();
  window.openConnManagerModal = () => window.connManagerEngine.openModal();
})();
