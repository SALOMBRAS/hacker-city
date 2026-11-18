/**
 * Hacker City // Fase 2 — Pilar 6:
 * 1. MailEngine          — Caixa de Entrada, Enviados, Escrever E-mail e Alertas Automáticos (Numataka, ISP, Safenet, Guerra de Clãs)
 * 2. ClanEngine          — Clãs ($ 1.000 HC p/ fundar), Servidor Dedicado de Clã (IP próprio), Tesouraria e Guerra de Clãs por DDoS com Bounty
 * 3. RankingBadgesEngine — Ranking Oficial em 4 Categorias (Operadores, Software, DDoS, Clãs) + Vitrine de 16 Medalhas (Badges)
 */
(function () {
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // =========================================================================
  // 1. MAIL ENGINE (CORREIO CRIPTOGRAFADO & NOTIFICAÇÕES DE HISTÓRIA/SISTEMA)
  // =========================================================================
  class MailEngine {
    constructor() {
      this.userId = null;
      this.state = null;
      this.activeTab = 'inbox'; // 'inbox' | 'sent' | 'compose'
      this.selectedMailId = null;
    }

    storageKey(uid) {
      return `HC_PLAYER_MAIL_${uid || 'guest'}`;
    }

    ensureLoaded() {
      const uid = (window.currentProfile && window.currentProfile.id) || 'guest';
      if (this.userId === uid && this.state) return this.state;
      this.userId = uid;

      let saved = null;
      try {
        const raw = localStorage.getItem(this.storageKey(uid));
        if (raw) saved = JSON.parse(raw);
      } catch (e) {}

      if (saved && Array.isArray(saved.inbox)) {
        this.state = saved;
      } else {
        const nowStr = new Date().toLocaleString('pt-BR');
        this.state = {
          inbox: [
            {
              id: 1001,
              sender: 'Ensei Tankado <tankado@numataka.hc>',
              subject: 'Bem-vindo ao submundo — Roteiro de Sobrevivência',
              body:
                'Operador,\n\n' +
                'Seu terminal já está conectado à espinha dorsal de Hacker City.\n' +
                '1) Conclua o treinamento em 198.51.100.42 e SEMPRE apague seu IP de /var/log/syslog.\n' +
                '2) Visite o First Puzzle em 109.64.200.10 para destravar a Trilha de Enigmas e roubar softwares superiores de graça.\n' +
                '3) Ative sua cadeia de Proxy Bounce antes de drenar contas bancárias para não cair na mira da Safenet.\n\n' +
                '— Ensei Tankado',
              kind: 'story',
              isRead: false,
              at: nowStr
            },
            {
              id: 1002,
              sender: 'HC Telecom NOC <dhcp@isp.hc>',
              subject: 'Concessão de IPv4 Público & Política de Troca Semanal',
              body:
                'Prezado assinante,\n\n' +
                'Sua linha conta com 1 renovação gratuita de endereço IPv4 a cada 7 dias em 71.4.5.1.\n' +
                'Trocas emergenciais fora do prazo custam $ 50.000 HC. Proteja seu IP usando saltos de Bounce!',
              kind: 'system',
              isRead: false,
              at: nowStr
            }
          ],
          sent: []
        };
        this.save();
      }
      this.syncBadge();
      return this.state;
    }

    save() {
      if (!this.state) return;
      try {
        localStorage.setItem(this.storageKey(this.userId), JSON.stringify(this.state));
      } catch (e) {}
      this.syncBadge();
    }

    getUnreadCount() {
      this.ensureLoaded();
      return (this.state.inbox || []).filter((m) => !m.isRead).length;
    }

    syncBadge() {
      if (!this.state) return;
      const unread = (this.state.inbox || []).filter((m) => !m.isRead).length;
      const badge = document.getElementById('navMailCountBadge');
      if (badge) {
        badge.textContent = String(unread);
        badge.style.display = unread > 0 ? 'inline-flex' : 'none';
      }
    }

    pushSystemMail(sender, subject, body, kind = 'system') {
      this.ensureLoaded();
      const mail = {
        id: Date.now() + Math.floor(Math.random() * 999),
        sender,
        subject,
        body,
        kind,
        isRead: false,
        at: new Date().toLocaleString('pt-BR')
      };
      this.state.inbox.unshift(mail);
      if (this.state.inbox.length > 40) this.state.inbox.length = 40;
      this.save();
      if (window.winManager && window.winManager.current === 'winMail') {
        this.renderUI();
      }
      return mail;
    }

    openMail(id) {
      this.ensureLoaded();
      this.selectedMailId = Number(id);
      const item = this.state.inbox.find((m) => m.id === Number(id));
      if (item && !item.isRead) {
        item.isRead = true;
        this.save();
      }
      this.renderUI();
    }

    deleteMail(id, box = 'inbox') {
      this.ensureLoaded();
      if (box === 'sent') {
        this.state.sent = this.state.sent.filter((m) => m.id !== Number(id));
      } else {
        this.state.inbox = this.state.inbox.filter((m) => m.id !== Number(id));
      }
      if (this.selectedMailId === Number(id)) this.selectedMailId = null;
      this.save();
      this.renderUI();
    }

    sendMail(toRaw, subjectRaw, bodyRaw) {
      this.ensureLoaded();
      const to = String(toRaw || '').trim();
      const subject = String(subjectRaw || '').trim();
      const body = String(bodyRaw || '').trim();
      if (!to || !subject || !body) {
        return { success: false, message: 'Preencha destinatário, assunto e mensagem!' };
      }

      const msg = {
        id: Date.now() + Math.floor(Math.random() * 999),
        to,
        subject,
        body,
        at: new Date().toLocaleString('pt-BR')
      };
      this.state.sent.unshift(msg);
      this.activeTab = 'sent';
      this.save();

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('MAIL-OUT', `E-mail criptografado enviado para ${to}: "${subject}"`, 'info');
      }
      if (window.onlineEngine) {
        const targetPeer = window.onlineEngine.getHumanPlayerByTag(to);
        window.onlineEngine.sendPvpPacket({
          kind: 'P2P_MAIL',
          visibleIp: window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0',
          targetUserId: targetPeer ? targetPeer.userId : null,
          targetTag: to,
          targetIp: targetPeer ? targetPeer.publicIp : null,
          d: { sub: subject.slice(0, 60), body: body.slice(0, 120) }
        });
        window.onlineEngine.scheduleSave(false);
      }
      if (window.hackerAudio) window.hackerAudio.playKeyClick();
      this.renderUI();
      return { success: true, message: `Mensagem enviada para ${to}!` };
    }

    renderUI(containerId = 'mailAppBody') {
      const container = document.getElementById(containerId);
      if (!container) return;
      this.ensureLoaded();

      const unread = this.getUnreadCount();
      let contentHtml = '';

      if (this.activeTab === 'compose') {
        contentHtml = `
          <div class="hc-card" style="padding:1.25rem;max-width:680px;">
            <div class="hc-eyebrow" style="margin-bottom:8px;">Transmitir Mensagem PGP</div>
            <div style="display:flex;flex-direction:column;gap:10px;">
              <input type="text" id="mailToInput" class="form-input" placeholder="Destinatário (Hacker Tag ou e-mail, ex: m4riposa)">
              <input type="text" id="mailSubjectInput" class="form-input" placeholder="Assunto da mensagem">
              <textarea id="mailBodyInput" class="form-input" rows="5" style="resize:vertical;font-family:var(--hc-font-mono);font-size:0.82rem;" placeholder="Escreva o conteúdo criptografado..."></textarea>
              <div>
                <button type="button" id="btnSendMailNow" class="hc-btn primary" onclick="window.handleSendMail()">Enviar Mensagem Criptografada</button>
              </div>
            </div>
          </div>
        `;
      } else if (this.activeTab === 'sent') {
        contentHtml = this.state.sent.length === 0
          ? `<div class="hc-card" style="padding:2rem;text-align:center;color:var(--hc-text-2);">Nenhum e-mail enviado ainda.</div>`
          : `<div style="display:flex;flex-direction:column;gap:8px;">
               ${this.state.sent.map((m) => `
                 <div class="hc-card" style="padding:0.95rem 1.1rem;">
                   <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                     <strong>Para: <span style="color:var(--hc-accent-text);">${esc(m.to)}</span> — ${esc(m.subject)}</strong>
                     <div style="display:flex;gap:8px;align-items:center;">
                       <span style="font-size:0.75rem;color:var(--hc-text-3);font-family:var(--hc-font-mono);">${esc(m.at)}</span>
                       <button type="button" class="hc-btn ghost sm" onclick="window.mailEngine.deleteMail(${m.id}, 'sent')">✕</button>
                     </div>
                   </div>
                   <div style="font-size:0.82rem;color:var(--hc-text-2);white-space:pre-wrap;">${esc(m.body)}</div>
                 </div>
               `).join('')}
             </div>`;
      } else {
        const selected = this.state.inbox.find((m) => m.id === this.selectedMailId) || this.state.inbox[0] || null;
        contentHtml = `
          <div style="display:grid;grid-template-columns:minmax(260px,0.95fr) minmax(320px,1.4fr);gap:14px;">
            <div class="hc-card" style="padding:0;overflow:hidden;">
              ${this.state.inbox.length === 0
                ? `<div style="padding:1.5rem;text-align:center;color:var(--hc-text-3);font-size:0.82rem;">Caixa de entrada vazia.</div>`
                : this.state.inbox.map((m) => `
                    <div onclick="window.mailEngine.openMail(${m.id})" style="padding:10px 14px;border-bottom:1px solid var(--hc-border);cursor:pointer;background:${selected && selected.id === m.id ? 'var(--hc-surface-2)' : 'transparent'};">
                      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
                        <strong style="font-size:0.83rem;color:${m.isRead ? 'var(--hc-text-2)' : 'var(--hc-text)'};">${m.isRead ? '' : '● '}${esc(m.subject)}</strong>
                        <span class="hc-badge ${m.kind === 'war' || m.kind === 'fbi' ? 'danger' : 'info'}" style="font-size:0.66rem;">${esc(m.kind.toUpperCase())}</span>
                      </div>
                      <div style="font-size:0.74rem;color:var(--hc-text-3);margin-top:2px;">${esc(m.sender)}</div>
                    </div>
                  `).join('')}
            </div>

            <div class="hc-card" style="padding:1.25rem;">
              ${!selected
                ? `<div style="color:var(--hc-text-3);font-size:0.85rem;">Selecione uma mensagem para ler.</div>`
                : `
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid var(--hc-border);padding-bottom:10px;margin-bottom:12px;gap:8px;">
                    <div>
                      <h3 style="font-size:1.02rem;margin:0 0 4px;">${esc(selected.subject)}</h3>
                      <div style="font-size:0.78rem;color:var(--hc-accent-text);font-family:var(--hc-font-mono);">De: ${esc(selected.sender)} · ${esc(selected.at)}</div>
                    </div>
                    <button type="button" class="hc-btn ghost sm" onclick="window.mailEngine.deleteMail(${selected.id}, 'inbox')">Apagar</button>
                  </div>
                  <pre style="white-space:pre-wrap;font-family:var(--hc-font-sans);font-size:0.86rem;line-height:1.55;color:var(--hc-text);margin:0;">${esc(selected.body)}</pre>
                `}
            </div>
          </div>
        `;
      }

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" class="hc-btn sm ${this.activeTab === 'inbox' ? 'primary' : 'ghost'}" onclick="window.mailEngine.activeTab='inbox';window.mailEngine.renderUI();">
              Caixa de Entrada (${unread} não lida${unread === 1 ? '' : 's'})
            </button>
            <button type="button" class="hc-btn sm ${this.activeTab === 'sent' ? 'primary' : 'ghost'}" onclick="window.mailEngine.activeTab='sent';window.mailEngine.renderUI();">
              Enviados (${this.state.sent.length})
            </button>
            <button type="button" id="btnComposeMailTab" class="hc-btn sm ${this.activeTab === 'compose' ? 'primary' : 'ghost'}" onclick="window.mailEngine.activeTab='compose';window.mailEngine.renderUI();">
              + Escrever E-mail
            </button>
          </div>
          ${contentHtml}
        </div>
      `;
    }
  }

  // =========================================================================
  // 2. CLAN ENGINE (CRIAÇÃO $ 1.000 HC, SERVIDOR DE CLÃ & GUERRA DE CLÃS DDoS)
  // =========================================================================
  const SEEDED_WORLD_CLANS = [
    {
      id: 'clan_vgl',
      tag: 'VGL',
      name: 'Coletivo Vagalume',
      serverIp: '155.90.10.12',
      leader: 'm4riposa',
      members: 14,
      treasury: 14500,
      powerScore: 1840,
      warsWon: 4,
      desc: 'Especialistas em criptografia reversa, proxy bounce e resgate de dados.'
    },
    {
      id: 'clan_nxs',
      tag: 'NXS',
      name: 'Nexus Black Syndicate',
      serverIp: '155.90.20.44',
      leader: 'kr0n0s_apt',
      members: 19,
      treasury: 28900,
      powerScore: 2650,
      warsWon: 7,
      desc: 'Sindicato ofensivo focado em botnets DDoS de alta potência e guerras territoriais.'
    },
    {
      id: 'clan_krs',
      tag: 'KRS',
      name: 'Kestrel Cyber Ops',
      serverIp: '155.90.30.88',
      leader: 'nyx_0day',
      members: 9,
      treasury: 8200,
      powerScore: 1190,
      warsWon: 2,
      desc: 'Célula enxuta de infiltradores zero-day e caçadores de recompensas do FBI.'
    }
  ];

  class ClanEngine {
    constructor() {
      this.userId = null;
      this.state = null;
    }

    storageKey(uid) {
      return `HC_CLAN_STATE_${uid || 'guest'}`;
    }

    ensureLoaded() {
      const uid = (window.currentProfile && window.currentProfile.id) || 'guest';
      if (this.userId === uid && this.state) return this.state;
      this.userId = uid;

      let saved = null;
      try {
        const raw = localStorage.getItem(this.storageKey(uid));
        if (raw) saved = JSON.parse(raw);
      } catch (e) {}

      this.state = saved && Array.isArray(saved.clans) ? saved : {
        clans: JSON.parse(JSON.stringify(SEEDED_WORLD_CLANS)),
        myClanId: null,
        activeWar: null, // { enemyId, enemyName, enemyTag, enemyServerIp, ourScore, enemyScore, bountyPool }
        warsWonByPlayer: 0
      };
      return this.state;
    }

    save() {
      if (!this.state) return;
      try {
        localStorage.setItem(this.storageKey(this.userId), JSON.stringify(this.state));
      } catch (e) {}
    }

    getMyClan() {
      this.ensureLoaded();
      if (!this.state.myClanId) return null;
      return this.state.clans.find((c) => c.id === this.state.myClanId) || null;
    }

    getClanByServerIp(ip) {
      this.ensureLoaded();
      return this.state.clans.find((c) => c.serverIp === ip) || null;
    }

    getAllClansSorted() {
      this.ensureLoaded();
      return [...this.state.clans].sort((a, b) => b.powerScore - a.powerScore);
    }

    createClan(nameRaw, tagRaw, descRaw) {
      this.ensureLoaded();
      if (this.getMyClan()) {
        return { success: false, message: 'Saia do seu clã atual antes de fundar um novo!' };
      }
      const name = String(nameRaw || '').trim();
      const tag = String(tagRaw || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      const desc = String(descRaw || '').trim() || 'Unidade autônoma de operadores.';

      if (name.length < 3 || name.length > 28) {
        return { success: false, message: 'O nome do clã deve ter entre 3 e 28 caracteres.' };
      }
      if (tag.length < 2 || tag.length > 4) {
        return { success: false, message: 'A TAG do clã deve ter de 2 a 4 letras/números (ex: HCK).' };
      }
      if (this.state.clans.some((c) => c.tag === tag)) {
        return { success: false, message: `A TAG [${tag}] já está em uso por outro clã!` };
      }

      const COST = 1000;
      if (!window.currentWallet || parseFloat(window.currentWallet.balance) < COST) {
        return { success: false, message: 'Fundar um Clã exige $ 1.000,00 HC para alugar o Servidor Dedicado do Clã!' };
      }

      window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) - COST).toFixed(2);
      const serverIp = `155.90.77.${10 + Math.floor(Math.random() * 230)}`;
      const newClan = {
        id: 'clan_usr_' + Date.now(),
        tag,
        name,
        serverIp,
        leader: (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador',
        members: 1,
        treasury: 500,
        powerScore: 450 + Math.round(((window.currentProfile && window.currentProfile.reputation) || 100) * 0.5),
        warsWon: 0,
        desc
      };

      this.state.clans.unshift(newClan);
      this.state.myClanId = newClan.id;
      this.save();

      if (window.currentProfile) window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 80;
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('CLAN-FOUNDED', `Clã [${tag}] ${name} fundado! Servidor dedicado: ${serverIp}`, 'success');
      }
      if (window.mailEngine) {
        window.mailEngine.pushSystemMail(
          'Clan Registry <clans@whois.hc>',
          `Servidor do Clã [${tag}] Ativado (${serverIp})`,
          `Parabéns, Comandante!\n\nSeu clã [${tag}] ${name} está registrado oficialmente com o mainframe dedicado ${serverIp}.\nVocê já pode declarar Guerra de Clãs e disputar Bounties por DDoS!`,
          'clan'
        );
      }
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.onlineEngine) {
        window.onlineEngine.trackRealtimePresence();
        window.onlineEngine.publishDirectoryBeacon();
        window.onlineEngine.scheduleSave(true);
      }
      this.renderUI();
      return { success: true, clan: newClan, message: `Clã [${tag}] ${name} fundado! Servidor: ${serverIp}` };
    }

    joinClan(clanId) {
      this.ensureLoaded();
      if (this.getMyClan()) return { success: false, message: 'Você já pertence a um clã!' };
      const clan = this.state.clans.find((c) => c.id === clanId);
      if (!clan) return { success: false, message: 'Clã não encontrado.' };

      clan.members += 1;
      clan.powerScore += 120;
      this.state.myClanId = clan.id;
      this.save();

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('CLAN-JOIN', `Você ingressou no clã [${clan.tag}] ${clan.name}`, 'info');
      }
      this.renderUI();
      return { success: true, message: `Bem-vindo ao clã [${clan.tag}] ${clan.name}!` };
    }

    leaveClan() {
      this.ensureLoaded();
      const my = this.getMyClan();
      if (!my) return;
      my.members = Math.max(1, my.members - 1);
      this.state.myClanId = null;
      this.state.activeWar = null;
      this.save();
      this.renderUI();
    }

    depositToClan(amountRaw) {
      this.ensureLoaded();
      const my = this.getMyClan();
      if (!my) return { success: false, message: 'Entre em um clã primeiro.' };
      const amt = Math.round(Number(amountRaw || 0));
      if (!Number.isFinite(amt) || amt < 50) return { success: false, message: 'Depósito mínimo para a tesouraria é $ 50 HC.' };
      if (!window.currentWallet || parseFloat(window.currentWallet.balance) < amt) {
        return { success: false, message: 'Saldo insuficiente na carteira!' };
      }

      window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) - amt).toFixed(2);
      my.treasury += amt;
      my.powerScore += Math.round(amt * 0.25);
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
      return { success: true, message: `+$ ${amt.toLocaleString('pt-BR')} HC depositados no cofre do clã [${my.tag}]!` };
    }

    startClanWar(enemyClanId) {
      this.ensureLoaded();
      const my = this.getMyClan();
      if (!my) return { success: false, message: 'Entre ou funde um clã antes de iniciar uma Guerra de Clãs!' };
      if (this.state.activeWar) return { success: false, message: 'Seu clã já está em uma Guerra ativa!' };

      const enemy = this.state.clans.find((c) => c.id === enemyClanId && c.id !== my.id);
      if (!enemy) return { success: false, message: 'Clã adversário inválido.' };

      this.state.activeWar = {
        enemyId: enemy.id,
        enemyTag: enemy.tag,
        enemyName: enemy.name,
        enemyServerIp: enemy.serverIp,
        ourScore: 0,
        enemyScore: 140,
        bountyPool: 900,
        strikesCount: 0,
        startedAt: new Date().toLocaleTimeString()
      };
      this.save();

      if (window.mailEngine) {
        window.mailEngine.pushSystemMail(
          'War Monitor <wars@whois.hc>',
          `GUERRA DECLARADA: [${my.tag}] vs [${enemy.tag}]!`,
          `Alerta Vermelho!\n\nA Guerra de Clãs entre [${my.tag}] ${my.name} e [${enemy.tag}] ${enemy.name} (${enemy.serverIp}) começou!\nDispare ataques DDoS coordenados na aba Clãs para superar a pontuação inimiga e capturar o Bounty Pool!`,
          'war'
        );
      }
      this.renderUI();
      return { success: true, message: `Guerra iniciada contra [${enemy.tag}] ${enemy.name}!` };
    }

    launchClanWarDdosStrike() {
      this.ensureLoaded();
      const my = this.getMyClan();
      const war = this.state.activeWar;
      if (!my || !war) return { success: false, message: 'Nenhuma guerra ativa no momento.' };

      const harvest = window.softwareEngine ? window.softwareEngine.getPendingHarvestSummary() : { totalGbps: 0 };
      const cpuMhz = window.softwareEngine ? window.softwareEngine.getPlayerCpuMhz() : 800;
      const ddosPts = Math.round(135 + harvest.totalGbps * 95 + (cpuMhz / 1000) * 35);
      const enemyCounterPts = Math.round(35 + Math.random() * 40);

      war.ourScore += ddosPts;
      war.enemyScore += enemyCounterPts;
      war.bountyPool += 320;
      war.strikesCount += 1;
      this.save();

      if (window.internetEngine) {
        const route = window.bounceEngine
          ? window.bounceEngine.routeConnectionAndGetVisibleIp(war.enemyServerIp)
          : { visibleIp: window.networkIdentity.getPublicIp() };
        window.internetEngine.appendServerLog(
          war.enemyServerIp,
          `CLAN_WAR_DDOS src=${route.visibleIp} clan=[${my.tag}] impact=${ddosPts}pts`
        );
      }
      if (window.hackerAudio) window.hackerAudio.playCashChime();
      if (window.onlineEngine) {
        window.onlineEngine.sendPvpPacket({
          kind: 'CLAN_WAR_STRIKE',
          visibleIp: window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0',
          d: { fromClan: my.tag, toClan: war.enemyTag, pts: ddosPts }
        });
        window.onlineEngine.scheduleSave(false);
      }
      this.renderUI();
      return {
        success: true,
        ddosPts,
        ourScore: war.ourScore,
        enemyScore: war.enemyScore,
        message: `Rajada DDoS atingiu [${war.enemyTag}] (${war.enemyServerIp}): +${ddosPts} pts de guerra!`
      };
    }

    claimClanWarVictory() {
      this.ensureLoaded();
      const my = this.getMyClan();
      const war = this.state.activeWar;
      if (!my || !war) return { success: false, message: 'Nenhuma guerra ativa.' };
      if (war.ourScore <= war.enemyScore || war.ourScore < 250) {
        return {
          success: false,
          message: `Pontuação insuficiente para encerrar a guerra! Seu clã precisa liderar e atingir >= 250 pts (Atual: ${war.ourScore} × ${war.enemyScore}).`
        };
      }

      const playerShare = Math.round(war.bountyPool * 0.65);
      const clanShare = war.bountyPool - playerShare;

      if (window.currentWallet) {
        window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) + playerShare).toFixed(2);
      }
      my.treasury += clanShare;
      my.warsWon = (my.warsWon || 0) + 1;
      my.powerScore += 320;
      this.state.warsWonByPlayer = (this.state.warsWonByPlayer || 0) + 1;
      const defeatedTag = war.enemyTag;
      this.state.activeWar = null;
      this.save();

      if (window.currentProfile) {
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 125;
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('CLAN-VICTORY', `Vitória na Guerra de Clãs contra [${defeatedTag}]! Bounty recebido: +$ ${playerShare} HC (+125 REP)`, 'success');
      }
      if (window.hackerAudio) window.hackerAudio.playMoneyCollect();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
      return {
        success: true,
        playerShare,
        message: `VITÓRIA DE CLÃ contra [${defeatedTag}]! Você recebeu +$ ${playerShare.toLocaleString('pt-BR')} HC do Bounty de Guerra (+125 REP)!`
      };
    }

    renderUI(containerId = 'clanAppBody') {
      const container = document.getElementById(containerId);
      if (!container) return;
      this.ensureLoaded();

      const my = this.getMyClan();
      const war = this.state.activeWar;
      const clans = this.getAllClansSorted();

      const topSection = my
        ? `
          <div class="hc-card" style="padding:1.25rem;border-color:rgba(53,184,119,0.4);">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
              <div>
                <span class="hc-badge success">SEU CLÃ ATIVO</span>
                <h3 style="font-size:1.15rem;margin:6px 0 3px;">[${esc(my.tag)}] ${esc(my.name)}</h3>
                <div style="font-size:0.82rem;color:var(--hc-text-2);">
                  Servidor Dedicado: <strong style="font-family:var(--hc-font-mono);color:var(--hc-accent-text);cursor:pointer;" onclick="window.internetEngine.openIp('${esc(my.serverIp)}')">${esc(my.serverIp)}</strong>
                  · Líder: <strong>${esc(my.leader)}</strong> · Membros: <strong>${my.members}</strong> · Guerras Vencidas: <strong>${my.warsWon}</strong>
                </div>
                <div style="font-size:0.8rem;color:var(--hc-text-3);margin-top:4px;">Cofre do Clã: <strong style="color:var(--hc-warning);font-family:var(--hc-font-mono);">$ ${my.treasury.toLocaleString('pt-BR')} HC</strong> · Poder: <strong>${my.powerScore} pts</strong></div>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button type="button" class="hc-btn sm" onclick="window.handleDepositClan(100)">Depositar $ 100</button>
                <button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('${esc(my.serverIp)}')">Abrir Servidor do Clã</button>
                <button type="button" class="hc-btn ghost sm" style="color:var(--hc-danger-text);" onclick="window.clanEngine.leaveClan()">Sair do Clã</button>
              </div>
            </div>
          </div>

          ${war ? `
            <div class="hc-card" style="padding:1.2rem;border-color:var(--hc-danger);background:rgba(208,68,58,0.08);">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
                <div>
                  <span class="hc-badge danger">GUERRA DE CLÃS EM ANDAMENTO</span>
                  <h4 style="font-size:1rem;margin:6px 0 3px;">[${esc(my.tag)}] ${war.ourScore} pts × ${war.enemyScore} pts [${esc(war.enemyTag)}] ${esc(war.enemyName)}</h4>
                  <div style="font-size:0.8rem;color:var(--hc-text-2);font-family:var(--hc-font-mono);">
                    Alvo DDoS: ${esc(war.enemyServerIp)} · Bounty Pool Acumulado: <strong style="color:var(--hc-warning);">$ ${war.bountyPool.toLocaleString('pt-BR')} HC</strong> (Meta: liderar c/ >= 250 pts)
                  </div>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  <button type="button" id="btnClanWarStrike" class="hc-btn primary" onclick="window.handleClanWarStrike()">⚡ Disparar Ataque DDoS de Guerra</button>
                  ${war.ourScore > war.enemyScore && war.ourScore >= 250
                    ? `<button type="button" id="btnClaimClanWarWin" class="hc-btn" style="border-color:var(--hc-warning);color:var(--hc-warning);" onclick="window.handleClaimClanWarVictory()">Encerrar & Coletar Bounty ($ ${war.bountyPool})</button>`
                    : ''}
                </div>
              </div>
            </div>
          ` : ''}
        `
        : `
          <div class="hc-card" style="padding:1.2rem;">
            <div class="hc-eyebrow" style="margin-bottom:6px;">Fundar Novo Clã ($ 1.000 HC · Inclui Servidor Dedicado IP Próprio)</div>
            <div style="display:grid;grid-template-columns:minmax(180px,1.2fr) 110px minmax(200px,1.5fr) auto;gap:8px;align-items:center;">
              <input type="text" id="clanCreateNameInput" class="form-input" placeholder="Nome do Clã (ex: Zero Trace)">
              <input type="text" id="clanCreateTagInput" class="form-input" maxlength="4" style="font-family:var(--hc-font-mono);text-transform:uppercase;" placeholder="TAG">
              <input type="text" id="clanCreateDescInput" class="form-input" placeholder="Lema / Especialidade do clã...">
              <button type="button" id="btnCreateClanSubmit" class="hc-btn primary" onclick="window.handleCreateClan()">Fundar ($ 1.000)</button>
            </div>
          </div>
        `;

      const listHtml = clans.map((c, idx) => {
        const isMine = my && my.id === c.id;
        return `
          <div class="hc-card" style="padding:0.95rem 1.1rem;display:grid;grid-template-columns:46px minmax(220px,1.4fr) minmax(160px,1fr) auto;gap:12px;align-items:center;">
            <strong style="font-family:var(--hc-font-mono);color:var(--hc-text-3);">#${idx + 1}</strong>
            <div>
              <strong style="font-size:0.94rem;">[${esc(c.tag)}] ${esc(c.name)}</strong>
              ${isMine ? `<span class="hc-badge success" style="margin-left:6px;">SEU CLÃ</span>` : ''}
              <div style="font-size:0.76rem;color:var(--hc-text-2);">${esc(c.desc)}</div>
            </div>
            <div style="font-family:var(--hc-font-mono);font-size:0.78rem;color:var(--hc-text-2);">
              IP: <span style="color:var(--hc-accent-text);cursor:pointer;" onclick="window.internetEngine.openIp('${esc(c.serverIp)}')">${esc(c.serverIp)}</span><br>
              Poder: <strong>${c.powerScore}</strong> · Vitórias: <strong>${c.warsWon}</strong>
            </div>
            <div style="display:flex;gap:6px;justify-content:flex-end;">
              ${!my
                ? `<button type="button" class="hc-btn primary sm" onclick="window.handleJoinClan('${esc(c.id)}')">Entrar</button>`
                : (!isMine && !war
                    ? `<button type="button" id="btnDeclareWar_${esc(c.tag)}" class="hc-btn sm" style="border-color:var(--hc-danger);color:var(--hc-danger-text);" onclick="window.handleStartClanWar('${esc(c.id)}')">Declarar Guerra</button>`
                    : '')}
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${topSection}
          <div class="hc-eyebrow">Clãs Ativos em Hacker City (${clans.length})</div>
          <div style="display:flex;flex-direction:column;gap:8px;">${listHtml}</div>
        </div>
      `;
    }
  }

  // =========================================================================
  // 3. RANKING (4 CATEGORIAS) & VITRINE DE 16 MEDALHAS (BADGES)
  // =========================================================================
  const BADGE_CATALOG = [
    { id: 'first_hack', title: 'Primeiro Sangue', desc: 'Invadiu e salvou 1+ servidor no Hacked Database.', check: () => window.hackedDb && window.hackedDb.getAll().length >= 1 },
    { id: 'ghost_bounce', title: 'Rastro Fantasma', desc: 'Configurou e ativou uma cadeia de Proxy Bounce.', check: () => window.bounceEngine && window.bounceEngine.ensureLoaded().enabled && window.bounceEngine.state.hops.length >= 1 },
    { id: 'numataka_grad', title: 'Operador Numataka', desc: 'Completou a Invasão Tutorial Guiada.', check: () => window.tutorialEngine && window.tutorialEngine.getCurrentStepInfo().completed },
    { id: 'uni_scholar', title: 'Acadêmico Certificado', desc: 'Concluiu ao menos 1 certificação na Universidade.', check: () => window.universityEngine && window.universityEngine.getCompletedCount() >= 1 },
    { id: 'uni_master', title: 'Reitor Ph.D', desc: 'Concluiu todas as 5 certificações da Universidade.', check: () => window.universityEngine && window.universityEngine.getCompletedCount() >= 5 },
    { id: 'puzzle_1', title: 'Mente Criptográfica', desc: 'Resolveu o First Puzzle (109.64.200.10).', check: () => window.puzzleTrailEngine && window.puzzleTrailEngine.isSolved(1) },
    { id: 'puzzle_all', title: 'Oráculo de Sanctum', desc: 'Resolveu todos os 6 servidores da Trilha de Enigmas.', check: () => window.puzzleTrailEngine && window.puzzleTrailEngine.ensureLoaded().solved.length >= 6 },
    { id: 'soft_hunter', title: 'Arsenal Superior', desc: 'Obteve qualquer software de potência >= v1.5.', check: () => window.softwareEngine && Object.values(window.softwareEngine.ensureLoaded().inventory).some((s) => s.versionInt >= 15) },
    { id: 'xhd_owner', title: 'Cofre Físico XHD', desc: 'Comprou um HD Externo e guardou backup criptografado.', check: () => window.stealthXhdEngine && Object.keys(window.stealthXhdEngine.ensureLoaded().backups || {}).length >= 1 },
    { id: 'stealth_master', title: 'Espectro Camuflado', desc: 'Evoluiu Hider.hdr/Seeker.skr ou camuflou um vírus.', check: () => window.stealthXhdEngine && (window.stealthXhdEngine.getHiderVer() > 1.0 || window.stealthXhdEngine.getSeekerVer() > 1.0) },
    { id: 'bank_cracker', title: 'Quebra-Bancos', desc: 'Quebrou o PIN de 1+ conta bancária em Contas Hackeadas.', check: () => window.multiBankEngine && window.multiBankEngine.ensureLoaded().hackedAccounts.length >= 1 },
    { id: 'offshore_holder', title: 'Magnata Offshore', desc: 'Abriu conta secundária em um banco internacional.', check: () => window.multiBankEngine && Object.keys(window.multiBankEngine.ensureLoaded().playerSecondaryAccounts || {}).length >= 1 },
    { id: 'btc_holder', title: 'Barão Satoshi', desc: 'Acumulou >= 0.00100000 BTC na carteira fria.', check: () => window.bitcoinEngine && window.bitcoinEngine.getBalanceSats() >= 100000 },
    { id: 'botnet_lord', title: 'Senhor da Botnet', desc: 'Mantém 2+ vírus ativos simultaneamente em alvos remotos.', check: () => window.softwareEngine && (window.softwareEngine.ensureLoaded().remoteInfections || []).length >= 2 },
    { id: 'clan_member', title: 'Irmandade Hacker', desc: 'Ingressou ou fundou um Clã oficial.', check: () => window.clanEngine && !!window.clanEngine.getMyClan() },
    { id: 'war_victor', title: 'Veterano de Guerra', desc: 'Venceu uma Guerra de Clãs e coletou o Bounty.', check: () => window.clanEngine && (window.clanEngine.ensureLoaded().warsWonByPlayer || 0) >= 1 }
  ];

  class RankingBadgesEngine {
    constructor() {
      this.activeTab = 'rep'; // 'rep' | 'software' | 'ddos' | 'clans' | 'badges'
    }

    getPlayerBestSoftwareVer() {
      if (!window.softwareEngine) return 1.0;
      const inv = window.softwareEngine.ensureLoaded().inventory || {};
      let maxInt = 10;
      Object.values(inv).forEach((s) => {
        if (s.versionInt > maxInt) maxInt = s.versionInt;
      });
      return maxInt / 10;
    }

    getUnlockedBadgesCount() {
      return BADGE_CATALOG.filter((b) => {
        try { return !!b.check(); } catch (e) { return false; }
      }).length;
    }

    renderUI(containerId = 'rankingAppBody') {
      const container = document.getElementById(containerId);
      if (!container) return;

      const myTag = (window.currentProfile && window.currentProfile.hacker_tag) || 'VOCÊ';
      const myRep = (window.currentProfile && window.currentProfile.reputation) || 100;
      const myBestSoft = this.getPlayerBestSoftwareVer();
      const myGbps = window.softwareEngine ? window.softwareEngine.getPendingHarvestSummary().totalGbps : 0;
      const unlockedCount = this.getUnlockedBadgesCount();

      let bodyHtml = '';
      if (this.activeTab === 'badges') {
        bodyHtml = `
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(235px,1fr));gap:10px;">
            ${BADGE_CATALOG.map((b) => {
              let unlocked = false;
              try { unlocked = !!b.check(); } catch (e) {}
              return `
                <div class="hc-card" style="padding:0.95rem 1.05rem;border-color:${unlocked ? 'rgba(53,184,119,0.45)' : 'var(--hc-border)'};opacity:${unlocked ? '1' : '0.58'};">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <strong style="font-size:0.88rem;color:${unlocked ? 'var(--hc-accent-text)' : 'var(--hc-text)'};">${unlocked ? '🏅 ' : '🔒 '}${esc(b.title)}</strong>
                    <span class="hc-badge ${unlocked ? 'success' : ''}" style="font-size:0.66rem;">${unlocked ? 'DESBLOQUEADA' : 'PENDENTE'}</span>
                  </div>
                  <div style="font-size:0.76rem;color:var(--hc-text-2);">${esc(b.desc)}</div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      } else if (this.activeTab === 'clans') {
        const clans = window.clanEngine ? window.clanEngine.getAllClansSorted() : [];
        bodyHtml = `
          <div class="hc-card" style="padding:0;overflow:hidden;">
            ${clans.map((c, i) => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 16px;border-bottom:1px solid var(--hc-border);font-size:0.84rem;">
                <div>
                  <strong style="font-family:var(--hc-font-mono);color:var(--hc-text-3);margin-right:10px;">#${i + 1}</strong>
                  <strong>[${esc(c.tag)}] ${esc(c.name)}</strong>
                  <span style="color:var(--hc-text-3);font-size:0.76rem;margin-left:8px;">Membros: ${c.members} · Vitórias: ${c.warsWon}</span>
                </div>
                <strong style="font-family:var(--hc-font-mono);color:var(--hc-accent-text);">${c.powerScore.toLocaleString('pt-BR')} pts</strong>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        // Competidores vivos p/ Reputação, Melhor Software ou Poder DDoS (mesclando jogadores humanos reais da nuvem!)
        const humanPeers = (window.onlineEngine ? window.onlineEngine.getAllKnownHumansList() : []).map((hp) => ({
          tag: hp.hackerTag,
          rep: Number(hp.reputation || 100),
          soft: Number(hp.bestSoftVer || 1.0),
          gbps: Number(hp.ddosGbps || 0),
          onlineNow: !!hp.onlineNow,
          isHuman: true,
          isMe: false
        }));

        const peers = [
          { tag: 'kr0n0s_apt', rep: 14800, soft: 5.5, gbps: 18.4, isMe: false },
          { tag: 'm4riposa', rep: 8240, soft: 4.5, gbps: 11.2, isMe: false },
          { tag: 'v0rtex_root', rep: 5190, soft: 3.5, gbps: 8.6, isMe: false },
          { tag: 'nyx_0day', rep: 1450, soft: 2.5, gbps: 3.4, isMe: false },
          { tag: 'cipher_ghost', rep: 680, soft: 1.5, gbps: 1.2, isMe: false },
          ...humanPeers.filter((hp) => hp.tag.toLowerCase() !== myTag.toLowerCase()),
          { tag: myTag, rep: myRep, soft: myBestSoft, gbps: myGbps, onlineNow: true, isHuman: true, isMe: true }
        ];

        const metricKey = this.activeTab === 'software' ? 'soft' : (this.activeTab === 'ddos' ? 'gbps' : 'rep');
        peers.sort((a, b) => b[metricKey] - a[metricKey]);

        bodyHtml = `
          <div class="hc-card" style="padding:0;overflow:hidden;">
            ${peers.slice(0, 18).map((p, idx) => {
              const valStr = metricKey === 'soft'
                ? `v${p.soft.toFixed(1)}`
                : (metricKey === 'gbps' ? `${p.gbps.toFixed(2)} Gbps` : `${p.rep.toLocaleString('pt-BR')} REP`);
              return `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 16px;border-bottom:1px solid var(--hc-border);background:${p.isMe ? 'rgba(53,184,119,0.09)' : 'transparent'};font-size:0.85rem;">
                  <div>
                    <strong style="font-family:var(--hc-font-mono);color:var(--hc-text-3);margin-right:10px;">#${idx + 1}</strong>
                    <strong style="color:${p.isMe ? 'var(--hc-accent-text)' : 'var(--hc-text)'};">${esc(p.tag)}</strong>
                    ${p.isMe ? `<span class="hc-badge success" style="margin-left:8px;">VOCÊ</span>` : (p.onlineNow ? `<span class="hc-badge success" style="margin-left:8px;">● ONLINE</span>` : (p.isHuman ? `<span class="hc-badge info" style="margin-left:8px;">JOGADOR</span>` : ''))}
                  </div>
                  <strong style="font-family:var(--hc-font-mono);color:${p.isMe ? 'var(--hc-accent-text)' : 'var(--hc-warning)'};">${valStr}</strong>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" class="hc-btn sm ${this.activeTab === 'rep' ? 'primary' : 'ghost'}" onclick="window.rankingBadgesEngine.activeTab='rep';window.rankingBadgesEngine.renderUI();">Top Operadores (REP)</button>
            <button type="button" class="hc-btn sm ${this.activeTab === 'software' ? 'primary' : 'ghost'}" onclick="window.rankingBadgesEngine.activeTab='software';window.rankingBadgesEngine.renderUI();">Melhor Software</button>
            <button type="button" class="hc-btn sm ${this.activeTab === 'ddos' ? 'primary' : 'ghost'}" onclick="window.rankingBadgesEngine.activeTab='ddos';window.rankingBadgesEngine.renderUI();">Poder DDoS</button>
            <button type="button" class="hc-btn sm ${this.activeTab === 'clans' ? 'primary' : 'ghost'}" onclick="window.rankingBadgesEngine.activeTab='clans';window.rankingBadgesEngine.renderUI();">Ranking de Clãs</button>
            <button type="button" id="btnRankingBadgesTab" class="hc-btn sm ${this.activeTab === 'badges' ? 'primary' : 'ghost'}" onclick="window.rankingBadgesEngine.activeTab='badges';window.rankingBadgesEngine.renderUI();">Medalhas / Badges (${unlockedCount}/${BADGE_CATALOG.length})</button>
          </div>
          ${bodyHtml}
        </div>
      `;
    }
  }

  window.mailEngine = new MailEngine();
  window.clanEngine = new ClanEngine();
  window.rankingBadgesEngine = new RankingBadgesEngine();

  window.handleSendMail = function () {
    const to = document.getElementById('mailToInput')?.value;
    const sub = document.getElementById('mailSubjectInput')?.value;
    const body = document.getElementById('mailBodyInput')?.value;
    const res = window.mailEngine.sendMail(to, sub, body);
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };

  window.handleCreateClan = function () {
    const name = document.getElementById('clanCreateNameInput')?.value;
    const tag = document.getElementById('clanCreateTagInput')?.value;
    const desc = document.getElementById('clanCreateDescInput')?.value;
    const res = window.clanEngine.createClan(name, tag, desc);
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };

  window.handleJoinClan = function (clanId) {
    const res = window.clanEngine.joinClan(clanId);
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };

  window.handleDepositClan = function (amt) {
    const res = window.clanEngine.depositToClan(amt);
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };

  window.handleStartClanWar = function (enemyId) {
    const res = window.clanEngine.startClanWar(enemyId);
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };

  window.handleClanWarStrike = function () {
    const res = window.clanEngine.launchClanWarDdosStrike();
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };

  window.handleClaimClanWarVictory = function () {
    const res = window.clanEngine.claimClanWarVictory();
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };
})();
