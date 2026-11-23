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
      this.channel = null;
      this.isModalOpen = false;
      this.init();
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
      if (window.progressiveUnlockEngine && typeof window.progressiveUnlockEngine.isNewbiePvpShieldActive === 'function' && window.progressiveUnlockEngine.isNewbiePvpShieldActive() && !(session && session.forceTest)) {
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('SHIELD-RECRUTA', `Escudo Iniciante (< 200 REP) bloqueou tentativa de intrusão externa de ${session ? session.originIp : 'remoto'}.`, 'info');
        }
        return;
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

    async killSession(sessionId) {
      const idx = this.inboundSessions.findIndex((s) => s.id === sessionId);
      if (idx === -1) return;

      const victimSess = this.inboundSessions[idx];
      this.inboundSessions.splice(idx, 1);

      if (window.audioEngine && typeof window.audioEngine.playErrorBuzz === 'function') {
        window.audioEngine.playErrorBuzz();
      }

      const payload = {
        event: 'session_kill',
        session_id: sessionId,
        origin_ip: victimSess.originIp,
        target_ip: this.getPlayerIp()
      };
      if (this.channel) this.channel.send({ type: 'broadcast', event: 'session_kill', payload });
      if (this.broadcastChannel) this.broadcastChannel.postMessage(payload);

      if (window.supabaseClient) {
        try {
          await window.supabaseClient.rpc('kill_active_peer_session', {
            p_session_id: sessionId.includes('-') ? sessionId : '00000000-0000-0000-0000-000000000001',
            p_caller_ip: this.getPlayerIp()
          });
        } catch (e) {}
      }

      if (window.networkIdentity && typeof window.networkIdentity.addSystemLog === 'function') {
        window.networkIdentity.addSystemLog(
          `DEFESA ATIVA: Conexão de ${victimSess.originIp} encerrada pelo operador (Cortar Cabo).`,
          'warning'
        );
      }

      if (window.showToast) {
        window.showToast(`Cabo cortado! Sessão de ${victimSess.originIp} derrubada com sucesso.`, 'success');
      }

      this.updateUI();
    }

    handleOutboundKilled(payload) {
      const target = payload.target_ip;
      const found = this.outboundSessions.find((s) => s.targetIp === target);
      if (found) {
        this.closeOutboundSession(target);
        if (window.activeAttackSession) {
          window.activeAttackSession.aborted = true;
        }
        if (window.audioEngine && typeof window.audioEngine.playErrorBuzz === 'function') {
          window.audioEngine.playErrorBuzz();
        }
        if (window.showToast) {
          window.showToast(`Conexão encerrada pelo alvo (${target}): o defensor cortou o cabo.`, 'danger');
        }
      }
    }

    setupSimulatedIntrusions() {
      setInterval(() => {
        if (this.inboundSessions.length === 0 && Math.random() < 0.35) {
          const botIps = ['10.110.1.18', '10.110.2.14', '177.20.14.88', '198.51.100.41'];
          const botAliases = ['NullByte_BR', 'Kuro_Phantom', 'Ransom_Crawler', 'GhostScanner_01'];
          const pick = Math.floor(Math.random() * botIps.length);

          this.registerInboundSession({
            id: 'sim_' + Date.now(),
            originIp: botIps[pick],
            originAlias: botAliases[pick],
            protocol: 'SSH',
            action: 'Tentando quebrar senha (' + (30 + Math.floor(Math.random() * 40)) + '%)',
            progressPct: 45,
            startedAt: nowTime()
          });
        }
      }, 85000);
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
               ${this.inboundSessions.map((s) => `
                 <tr>
                   <td class="mono" style="color: var(--hc-danger-text); font-weight: 600;">${esc(s.originIp)}</td>
                   <td>
                     <span class="hc-badge danger" style="cursor:pointer;" data-player-tag="${esc(s.originAlias)}">${esc(s.originAlias)}</span>
                     <span class="mono" style="font-size:11px;color:var(--hc-text-3);margin-left:6px;">${esc(s.protocol)}</span>
                   </td>
                   <td>
                     <div style="font-weight:500;">${esc(s.action)}</div>
                     <div class="hc-progress danger" style="margin-top:5px;max-width:220px;"><span style="width:${Math.min(100, Number(s.progressPct || 35))}%;"></span></div>
                   </td>
                   <td class="mono" style="color:var(--hc-text-3);font-size:12px;">${esc(s.startedAt)}</td>
                   <td style="text-align:right;white-space:nowrap;">
                     <button type="button" class="hc-btn danger sm kill-btn" onclick="window.connManagerEngine.killSession('${esc(s.id)}')">
                       ${iconSvg('unplug')} Cortar cabo
                     </button>
                     <button type="button" class="hc-btn ghost sm" onclick="window.connManagerEngine.retaliateAgainst('${esc(s.originIp)}')">
                       Investigar IP
                     </button>
                   </td>
                 </tr>
               `).join('')}
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
              <summary>📖 Regras de Funcionamento do Popover de Defesa Ativa de 15 Segundos</summary>
              <ol class="nds-rules-list">
                <li><strong>Gatilho &amp; Prazo de 15s:</strong> Abre automaticamente no canto superior direito quando alguém invade sua porta 22. Se você não reagir em <strong>15 segundos reais</strong>, o alerta fecha e o invasor prossegue normalmente.</li>
                <li><strong>✂️ Cortar Cabo:</strong> Grátis e sem recarga — derruba o invasor na hora, mas o reset da placa <strong>pausa suas transferências por 15s</strong>.</li>
                <li><strong>🔥 Desviar Ataque p/ VPS (SACRIFÍCIO TOTAL DA VPS):</strong> Exige ter pelo menos <strong>1 VPS comprada</strong> na sua frota. Salva 100% seu PC Principal, captura o IP real do invasor em <em>Senhas Descobertas</em> (+25% contra-ataque) e dá +45 pts na Temporada, <strong>MAS VOCÊ PERDE A VPS PERMANENTEMENTE (o invasor destrói ela junto com todas as peças montadas nela — NÃO existe opção de reformatar, tem que comprar e montar outra do zero!)</strong>.</li>
                <li><strong>⚡ Pulso Reverso EMP:</strong> Frita o invasor na hora, porém aquece sua própria CPU em <strong>+12°C por 60s</strong> e entra em <strong>recarga de 3 minutos (180s)</strong>.</li>
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
