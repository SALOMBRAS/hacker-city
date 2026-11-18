/**
 * Hacker City // Bloco 4 MMO:
 * 1. SafenetFbiEngine      — Rastreio Safenet, Lista Pública de Procurados do FBI (Bounties $ HC + BTC),
 *                            Captura de Recompensa via Ataque DDoS e Integração com Fuga de IP / Batida Policial
 * 2. LivingWorldBotsEngine — Bots Online Vivos Jogando em Tempo Real: Bots Caçando Bots, Subindo no Ranking,
 *                            Caindo na Lista do FBI e Caçando Jogadores Expostos / Procurados (PvE Dinâmico)
 */
(function () {
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtUsd(n) {
    return '$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' HC';
  }

  function nowTime() {
    return new Date().toLocaleTimeString('pt-BR');
  }

  // =========================================================================
  // 1. SAFENET & FBI WANTED ENGINE (RASTREIO FORENSE + BOUNTY HUNTING DDoS)
  // =========================================================================
  class SafenetFbiEngine {
    constructor() {
      this.activeTab = 'fbi'; // 'fbi' | 'safenet' | 'liveworld'
      this.safenetList = [];
      this.fbiWantedList = [];
      this.worldNews = [];
      this.seeded = false;
    }

    ensureSeeded() {
      if (this.seeded) return;
      this.seeded = true;

      // Buscar bots reais do turno atual para popular procurados iniciais autênticos
      const bots = (window.botScheduler && window.botScheduler.getCurrentDayBots()) || [];
      const b1 = bots.find((b) => b.tier === 2) || { ip: '10.110.2.14', handle: 'Kuro_Phantom', tier: 2 };
      const b2 = bots.find((b) => b.tier === 3) || { ip: '10.110.3.22', handle: 'ZeroDay_Valkyrie', tier: 3 };
      const b3 = bots[3] || { ip: '10.110.1.18', handle: 'NullByte_BR', tier: 1 };

      this.safenetList = [
        {
          ip: b3.ip,
          handle: b3.handle,
          kind: 'bot',
          reason: 'Transferência bancária ilícita sem limpeza de log',
          severity: 1,
          since: nowTime()
        },
        {
          ip: b1.ip,
          handle: b1.handle,
          kind: 'bot',
          reason: 'Disseminação em massa de Trojan Miner.vminer',
          severity: 2,
          since: nowTime()
        }
      ];

      this.fbiWantedList = [
        {
          ip: b1.ip,
          handle: b1.handle,
          kind: 'bot',
          crime: 'Dreno recorrente de cofres corporativos & Botnet Spam',
          bountyCash: 1150,
          bountySats: 85000, // 0.00085000 BTC
          defenseGbps: 2.2,
          since: nowTime()
        },
        {
          ip: b2.ip,
          handle: b2.handle,
          kind: 'bot',
          crime: 'Sabotagem DDoS contra infraestrutura financeira',
          bountyCash: 3200,
          bountySats: 220000, // 0.00220000 BTC
          defenseGbps: 5.5,
          since: nowTime()
        }
      ];

      this.addNews('FBI-ALERT', `Recompensa federal de ${fmtUsd(3200)} aberta pela captura por DDoS de ${b2.handle} [${b2.ip}].`);
      this.addNews('SAFENET', `Monitoramento forense iniciado sobre ${b1.handle} [${b1.ip}] após tráfego suspeito de mineração.`);
    }

    addNews(tag, headline) {
      this.worldNews.unshift({
        id: Date.now() + Math.floor(Math.random() * 1000),
        at: nowTime(),
        tag,
        headline
      });
      if (this.worldNews.length > 25) this.worldNews.length = 25;
    }

    isIpOnSafenet(ip) {
      this.ensureSeeded();
      return this.safenetList.some((s) => s.ip === ip);
    }

    isIpWantedByFbi(ip) {
      this.ensureSeeded();
      return this.fbiWantedList.some((w) => w.ip === ip);
    }

    addOrEscalateSuspect({ ip, handle, kind, reason, amountValue = 1500, defenseGbps = 2.5 }) {
      this.ensureSeeded();
      if (!ip) return;

      const existingSafenet = this.safenetList.find((s) => s.ip === ip);
      if (!existingSafenet) {
        this.safenetList.unshift({
          ip,
          handle,
          kind,
          reason,
          severity: amountValue >= 3000 ? 2 : 1,
          since: nowTime()
        });
        if (this.safenetList.length > 10) this.safenetList.length = 10;

        if (kind === 'player') {
          if (window.currentProfile) {
            window.currentProfile.heat_level = Math.min(5, Math.max(2, (window.currentProfile.heat_level || 1) + 1));
          }
          if (typeof window.addLocalLog === 'function') {
            window.addLocalLog('SAFENET-WARN', `SEU IP (${ip}) entrou na Mira da Safenet: ${reason}! Limpe seus logs ou renove seu IP no ISP.`, 'warning');
          }
          if (typeof window.showToast === 'function') {
            window.showToast(`ALERTA SAFENET: Seu IP (${ip}) está sob investigação forense!`);
          }
          if (window.mailEngine) {
            window.mailEngine.pushSystemMail(
              'Safenet Authority <forensics@safenet.hc>',
              `Aviso Forense: Seu IP (${ip}) entrou em investigação`,
              `Detectamos atividade suspeita partindo de ${ip} (${reason}).\nReincidência sem ocultação por Proxy Bounce elevará seu caso para a Lista de Procurados do FBI!`,
              'fbi'
            );
          }
        }
        return { stage: 'safenet' };
      }

      // Reincidente na Safenet -> Escala para Procurado Oficial do FBI com Bounty!
      existingSafenet.severity = Math.min(5, existingSafenet.severity + 1);
      existingSafenet.reason = reason;

      let fbiEntry = this.fbiWantedList.find((w) => w.ip === ip);
      const addedBounty = Math.max(550, Math.round(amountValue * 0.42));
      const addedSats = Math.round(addedBounty * 65);

      if (fbiEntry) {
        fbiEntry.bountyCash = Math.min(35000, fbiEntry.bountyCash + addedBounty);
        fbiEntry.bountySats += addedSats;
        fbiEntry.crime = reason;
      } else {
        fbiEntry = {
          ip,
          handle,
          kind,
          crime: reason,
          bountyCash: Math.max(950, addedBounty),
          bountySats: addedSats,
          defenseGbps,
          since: nowTime()
        };
        this.fbiWantedList.unshift(fbiEntry);
        if (this.fbiWantedList.length > 8) this.fbiWantedList.length = 8;
        this.addNews('FBI-WANTED', `${handle} [${ip}] entrou na Lista de Procurados do FBI! Recompensa: ${fmtUsd(fbiEntry.bountyCash)}.`);
      }

      if (kind === 'player') {
        if (window.currentProfile) {
          window.currentProfile.heat_level = Math.min(5, Math.max(3, (window.currentProfile.heat_level || 2) + 1));
        }
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('FBI-BOUNTY', `PROCURADO PELO FBI! Seu IP (${ip}) agora vale ${fmtUsd(fbiEntry.bountyCash)} de recompensa! Bots caçadores em rota!`, 'danger');
        }
        if (typeof window.showToast === 'function') {
          window.showToast(`PERIGO FBI: Seu IP (${ip}) entrou na Lista de Procurados (${fmtUsd(fbiEntry.bountyCash)})!`);
        }
        if (window.mailEngine) {
          window.mailEngine.pushSystemMail(
            'FBI Cyber Division <bounty@safenet.hc>',
            `MANDADO FEDERAL: Recompensa de ${fmtUsd(fbiEntry.bountyCash)} sobre ${ip}!`,
            `Seu endereço IP (${ip}) foi incluído na Lista Pública de Procurados do FBI por: ${reason}.\nRenove imediatamente seu IP em 71.4.5.1 antes que caçadores derrubem sua máquina via DDoS!`,
            'fbi'
          );
        }
      }
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      return { stage: 'fbi', entry: fbiEntry };
    }

    evaluatePlayerCrime(reason, amountValue = 1500, victimIp = '') {
      if (!window.currentProfile || !window.networkIdentity) return;
      const myIp = window.networkIdentity.getPublicIp();
      // Sentinel tem furtividade natural (-35% chance de cair na malha na 1ª ação)
      const isSentinel = window.currentProfile.specialty === 'sentinel';
      if (isSentinel && amountValue < 2000 && Math.random() < 0.35) return;

      const fwlVer = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('firewall') : 1.0;
      const res = this.addOrEscalateSuspect({
        ip: myIp,
        handle: window.currentProfile.hacker_tag,
        kind: 'player',
        reason: victimIp ? `${reason} (${victimIp})` : reason,
        amountValue,
        defenseGbps: +(1.5 + fwlVer * 1.2).toFixed(1)
      });
      this.renderUI();
      return res;
    }

    // Quando o jogador renova o IP no Provedor ISP (71.4.5.1), o IP antigo perde vínculo direto!
    onPlayerIpChanged(oldIp, newIp) {
      this.ensureSeeded();
      const wasTracked = this.isIpOnSafenet(oldIp) || this.isIpWantedByFbi(oldIp);
      this.safenetList = this.safenetList.filter((s) => s.ip !== oldIp);
      this.fbiWantedList = this.fbiWantedList.filter((w) => w.ip !== oldIp);
      if (wasTracked) {
        if (window.currentProfile) window.currentProfile.heat_level = 1;
        this.addNews('ISP-GHOST', `Rastro federal sobre ${oldIp} perdeu sinal após rotação de IPv4 no provedor.`);
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('FBI-EVADED', `Seu antigo IP (${oldIp}) saiu do radar ativo da Safenet/FBI após migrar para ${newIp}!`, 'success');
        }
      }
    }

    getPlayerDdosPowerGbps() {
      const virusGbps = window.softwareEngine ? window.softwareEngine.getPendingHarvestSummary().totalGbps : 0;
      const cpuGbps = window.terminalTools ? +(window.terminalTools.getCpuMultiplier() * 0.9).toFixed(1) : 0.9;
      const certBonus = (window.universityEngine && window.universityEngine.hasCert(4)) ? 1.5 : 0;
      return +(virusGbps + cpuGbps + certBonus).toFixed(1);
    }

    takedownFbiTarget(targetIp) {
      this.ensureSeeded();
      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '';
      if (targetIp === myIp) {
        return { success: false, message: 'Você não pode disparar DDoS contra o seu próprio IP público para coletar a própria recompensa!' };
      }

      const target = this.fbiWantedList.find((w) => w.ip === targetIp);
      if (!target) {
        return { success: false, message: 'Este IP não está mais na Lista de Procurados do FBI.' };
      }

      const hasCert4 = window.universityEngine ? window.universityEngine.hasCert(4) : false;
      const virusGbps = window.softwareEngine ? window.softwareEngine.getPendingHarvestSummary().totalGbps : 0;
      const hasBreaker = window.softwareEngine ? window.softwareEngine.isDdosBreakerActive() : true;
      if (!hasBreaker) {
        return {
          success: false,
          code: 'NO_DDOS_BREAKER',
          message: 'Seu DDoS_Breaker.vbrk está DESATIVADO na RAM! Instale-o na aba Software & Vírus para lançar ataques DDoS.'
        };
      }
      if (!hasCert4 && virusGbps <= 0) {
        return {
          success: false,
          message: 'Você precisa instalar ao menos 1 vírus DDoS_Node.vddos na rede (ou concluir o Curso #4 na Universidade) para disparar um DDoS!'
        };
      }

      const myGbps = this.getPlayerDdosPowerGbps();
      if (myGbps < target.defenseGbps) {
        return {
          success: false,
          message: `Ataque DDoS mitigado pelo alvo! Seu poder atual (${myGbps} Gbps) é menor que a defesa de ${target.handle} (${target.defenseGbps} Gbps). Plante mais DDoS_Node.vddos ou evolua a potência deles!`
        };
      }

      // SUCESSO: Derrubou o Procurado do FBI e capturou o Bounty!
      this.fbiWantedList = this.fbiWantedList.filter((w) => w.ip !== targetIp);
      this.safenetList = this.safenetList.filter((s) => s.ip !== targetIp);

      if (window.currentWallet) {
        window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) + target.bountyCash).toFixed(2);
      }
      if (target.bountySats > 0 && window.bitcoinEngine) {
        window.bitcoinEngine.creditSats(
          target.bountySats,
          'FBI-BOUNTY',
          `Recompensa oficial do FBI por derrubar ${target.handle} [${target.ip}]`
        );
      }
      if (window.currentProfile) {
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 180;
      }

      const tag = (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador';
      this.addNews(
        'BOUNTY-CLAIMED',
        `${tag} derrubou o servidor de ${target.handle} [${target.ip}] via DDoS (${myGbps} Gbps) e recebeu ${fmtUsd(target.bountyCash)} do FBI!`
      );

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog(
          'FBI-TAKEDOWN',
          `Alvo procurado ${target.handle} [${target.ip}] neutralizado! Recompensa creditada: +${fmtUsd(target.bountyCash)} (+180 REP)`,
          'success'
        );
      }
      if (window.hackerAudio) window.hackerAudio.playMoneyCollect();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();

      return {
        success: true,
        bountyCash: target.bountyCash,
        bountySats: target.bountySats,
        message: `Alvo derrubado! O FBI depositou ${fmtUsd(target.bountyCash)} + ${(target.bountySats / 100000000).toFixed(5)} BTC na sua conta!`
      };
    }

    renderUI(containerId = 'fbiAppBody') {
      const container = document.getElementById(containerId);
      if (!container) return;
      this.ensureSeeded();

      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      const myGbps = this.getPlayerDdosPowerGbps();
      const playerWanted = this.isIpWantedByFbi(myIp);
      const playerSafenet = this.isIpOnSafenet(myIp);

      const statusAlert = playerWanted
        ? `<div class="hc-card" style="padding:1rem 1.2rem;border-color:var(--hc-danger);background:rgba(208,68,58,0.1);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
             <div>
               <strong style="color:var(--hc-danger-text);">ALERTA MÁXIMO: SEU IP (${esc(myIp)}) ESTÁ NA LISTA DE PROCURADOS DO FBI!</strong>
               <div style="font-size:0.8rem;color:var(--hc-text-2);">Bots caçadores e outros jogadores podem derrubar seu servidor! Renove seu IP no Provedor (71.4.5.1) para despistar o rastreio.</div>
             </div>
             <button type="button" class="hc-btn primary sm" style="background:var(--hc-danger);border-color:var(--hc-danger);" onclick="window.internetEngine.openIp('71.4.5.1')">Fugir p/ Provedor ISP →</button>
           </div>`
        : (playerSafenet
            ? `<div class="hc-card" style="padding:0.95rem 1.2rem;border-color:var(--hc-warning);background:rgba(216,155,56,0.08);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
                 <div>
                   <strong style="color:var(--hc-warning);">AVISO: Seu IP (${esc(myIp)}) está na Mira da Safenet!</strong>
                   <div style="font-size:0.8rem;color:var(--hc-text-2);">Evite novos crimes sem apagar logs para não escalar para a Lista de Procurados do FBI.</div>
                 </div>
                 <button type="button" class="hc-btn ghost sm" onclick="openWindow('winLogs')">Revisar Meus Logs</button>
               </div>`
            : '');

      let bodyHtml = '';
      if (this.activeTab === 'fbi') {
        const rows = this.fbiWantedList.length === 0
          ? `<div class="hc-card" style="padding:2rem;text-align:center;color:var(--hc-text-2);">Nenhum procurado ativo neste segundo. Os bots vivos da rede logo cometerão novos crimes!</div>`
          : this.fbiWantedList.map((w) => {
              const canBeat = myGbps >= w.defenseGbps && w.ip !== myIp;
              return `
                <div class="hc-card" style="padding:1rem 1.2rem;display:grid;grid-template-columns:minmax(210px,1.3fr) minmax(210px,1.5fr) minmax(150px,1fr) auto;gap:12px;align-items:center;border-color:rgba(208,68,58,0.35);">
                  <div>
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                      <span class="hc-badge danger">PROCURADO FBI</span>
                      <strong style="font-size:0.95rem;">${esc(w.handle)}</strong>
                    </div>
                    <div style="font-family:var(--hc-font-mono);font-size:0.82rem;color:var(--hc-accent-text);margin-top:3px;cursor:pointer;" onclick="window.internetEngine.openIp('${esc(w.ip)}')">
                      IP: ${esc(w.ip)} (${w.kind === 'player' ? 'Jogador' : 'Bot Online'})
                    </div>
                  </div>

                  <div style="font-size:0.8rem;color:var(--hc-text-2);">
                    <div>${esc(w.crime)}</div>
                    <div style="font-family:var(--hc-font-mono);font-size:0.74rem;color:var(--hc-text-3);margin-top:3px;">Defesa do Alvo: ${w.defenseGbps} Gbps</div>
                  </div>

                  <div>
                    <div style="font-size:0.7rem;color:var(--hc-text-3);text-transform:uppercase;">Recompensa Federal</div>
                    <strong style="font-family:var(--hc-font-mono);font-size:0.95rem;color:var(--hc-accent-text);">${fmtUsd(w.bountyCash)}</strong>
                    <div style="font-family:var(--hc-font-mono);font-size:0.75rem;color:var(--hc-warning);">+${(w.bountySats / 100000000).toFixed(5)} BTC</div>
                  </div>

                  <div style="display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap;">
                    <button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('${esc(w.ip)}', 'invadir')">Invadir IP</button>
                    <button type="button" id="btnFbiTakedown_${esc(w.ip.replace(/\./g, '_'))}" class="hc-btn ${canBeat ? 'primary' : 'ghost'} sm" onclick="window.handleFbiTakedown('${esc(w.ip)}')">
                      DDoS & Capturar Bounty
                    </button>
                  </div>
                </div>
              `;
            }).join('');
        bodyHtml = `<div style="display:flex;flex-direction:column;gap:10px;">${rows}</div>`;
      } else if (this.activeTab === 'safenet') {
        const sRows = this.safenetList.length === 0
          ? `<div class="hc-card" style="padding:2rem;text-align:center;color:var(--hc-text-2);">Nenhum IP sob investigação preliminar da Safenet agora.</div>`
          : this.safenetList.map((s) => `
              <div class="hc-card" style="padding:0.9rem 1.15rem;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
                <div>
                  <span class="hc-badge warn">Severidade ${s.severity}</span>
                  <strong style="margin-left:8px;">${esc(s.handle)}</strong>
                  <code style="margin-left:8px;color:var(--hc-accent-text);cursor:pointer;" onclick="window.internetEngine.openIp('${esc(s.ip)}')">${esc(s.ip)}</code>
                  <div style="font-size:0.8rem;color:var(--hc-text-2);margin-top:4px;">Motivo: ${esc(s.reason)} · Detectado às ${esc(s.since)}</div>
                </div>
                <button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('${esc(s.ip)}', 'invadir')">Rastrear na Internet →</button>
              </div>
            `).join('');
        bodyHtml = `<div style="display:flex;flex-direction:column;gap:8px;">${sRows}</div>`;
      } else {
        bodyHtml = window.livingBotsEngine ? window.livingBotsEngine.renderLiveWorldHtml() : '';
      }

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${statusAlert}

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;">
            <div class="hc-card" style="padding:0.95rem 1.1rem;">
              <div class="hc-stat-label">Procurados do FBI</div>
              <div class="hc-stat-value" style="color:var(--hc-danger-text);">${this.fbiWantedList.length}</div>
            </div>
            <div class="hc-card" style="padding:0.95rem 1.1rem;">
              <div class="hc-stat-label">Mira da Safenet</div>
              <div class="hc-stat-value" style="color:var(--hc-warning);">${this.safenetList.length}</div>
            </div>
            <div class="hc-card" style="padding:0.95rem 1.1rem;">
              <div class="hc-stat-label">Seu Poder de DDoS Atual</div>
              <div class="hc-stat-value" style="font-family:var(--hc-font-mono);color:var(--hc-accent-text);">${myGbps} Gbps</div>
            </div>
            <div class="hc-card" style="padding:0.95rem 1.1rem;">
              <div class="hc-stat-label">Bots Online Jogando</div>
              <div class="hc-stat-value">${window.livingBotsEngine ? window.livingBotsEngine.getOnlineBotsCount() : 30}</div>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;border-bottom:1px solid var(--hc-border);padding-bottom:10px;">
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button type="button" class="hc-btn sm ${this.activeTab === 'fbi' ? 'primary' : 'ghost'}" onclick="window.safenetFbiEngine.activeTab='fbi';window.safenetFbiEngine.renderUI();">
                Procurados do FBI (${this.fbiWantedList.length})
              </button>
              <button type="button" class="hc-btn sm ${this.activeTab === 'safenet' ? 'primary' : 'ghost'}" onclick="window.safenetFbiEngine.activeTab='safenet';window.safenetFbiEngine.renderUI();">
                Mira da Safenet (${this.safenetList.length})
              </button>
              <button type="button" id="tabLiveBotsWorld" class="hc-btn sm ${this.activeTab === 'liveworld' ? 'primary' : 'ghost'}" onclick="window.safenetFbiEngine.activeTab='liveworld';window.safenetFbiEngine.renderUI();">
                Bots Online, Caçadas & Ranking Vivo
              </button>
            </div>
            <button type="button" id="btnTriggerWorldStep" class="hc-btn ghost sm" onclick="window.livingBotsEngine.simulateWorldStep(true)">
              Simular Rodada de Bots Agora ↻
            </button>
          </div>

          ${bodyHtml}
        </div>
      `;
    }
  }

  // =========================================================================
  // 2. LIVING WORLD BOTS ENGINE (BOTS JOGANDO, SE CAÇANDO E CAÇANDO JOGADORES)
  // =========================================================================
  class LivingWorldBotsEngine {
    constructor() {
      this.botStats = new Map(); // ip -> { rep, kills, hacks, statusAction }
      this.battleFeed = [];
      this.initialized = false;
      this.lastPlayerHuntAt = 0;
      this.startAutonomousLoop();
    }

    ensureInitialized() {
      if (this.initialized) return;
      const dayBots = (window.botScheduler && window.botScheduler.getCurrentDayBots()) || [];
      if (dayBots.length === 0) return;

      this.initialized = true;
      dayBots.forEach((b, idx) => {
        const baseRep = b.tier === 3 ? 2800 + idx * 140 : (b.tier === 2 ? 950 + idx * 65 : 220 + idx * 25);
        this.botStats.set(b.ip, {
          ip: b.ip,
          handle: b.handle,
          tier: b.tier,
          tierName: b.tierName,
          rep: baseRep,
          hacks: 3 + (idx % 9),
          bountiesClaimed: b.tier >= 2 ? (idx % 3) : 0,
          lastAction: 'Escaneando portas TCP na sub-rede pública'
        });
      });

      // Rodar 2 ciclos silenciosos para já ter histórico real ao abrir o jogo!
      this.simulateBotVsBotEvent();
      this.simulateBotVsBotEvent();
    }

    getOnlineBotsCount() {
      this.ensureInitialized();
      const dayBots = (window.botScheduler && window.botScheduler.getCurrentDayBots()) || [];
      return dayBots.filter((b) => window.botScheduler.isBotOnline(b.ip)).length || dayBots.length;
    }

    startAutonomousLoop() {
      setInterval(() => {
        if (!window.currentProfile) return;
        this.simulateWorldStep(false);
      }, 9500);
    }

    getPlayerDefenseScore() {
      const fwl = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('firewall') : 1.0;
      const hash = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('hasher') : 1.0;
      return +(Math.max(fwl, Math.min(fwl, hash))).toFixed(1);
    }

    getPlayerDefensesStrict() {
      const fwl = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('firewall') : 0;
      const hash = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('hasher') : 0;
      return { fwl, hash };
    }

    // Pool realista de farpas / provocações deixadas por invasores que apagam o próprio IP da sua log!
    buildHackerTaunt(handle, playerFwl, stolenCash, plantedLabel) {
      const fwlStr = Number(playerFwl || 1.0).toFixed(1);
      const lootPart = stolenCash > 0 ? `raspei $ ${stolenCash} HC` : 'vasculhei seu HD inteiro';
      const virPart = plantedLabel ? ` e deixei ${plantedLabel} rodando na sua RAM` : '';
      const pool = [
        `[LOG EDITADA POR ${handle}]: "Firewall v${fwlStr}? Papelão demais seu fraco kkk ${lootPart}${virPart} e apaguei meu IP! Melhora essa carroça!"`,
        `[RECADO DE ${handle}]: "Entrei como root, ${lootPart}${virPart} e zerei meu rastro da sua log. Quando tiver defesa de gente grande tenta me achar noob ;)"`,
        `[pwned_by_${handle}]: "Que segurança patética hein comédia kkk PC aberto igual peneira! Limpei meu IP, chora mais fraco!"`,
        `[root@localhost]# echo "Invadido por ${handle} — facil demais fraco, apaguei minha log e saí tomando café kkk" > /var/log/syslog`,
        `[ASS: ${handle}]: "Obrigado pelo patrocínio! Apaguei meu IP da sua log pra vc nem perder tempo tentando revidar, fraco dms."`,
        `[FARPA // ${handle}]: "Deixou seu IP dando sopa em log alheia e achou que ninguém ia ver? Passei a limpa e sumi do mapa, aprende a limpar rastro noob!"`,
        `[${handle} esteve aqui]: "Firewall v${fwlStr} não segura nem script de padaria kkk ${lootPart}${virPart}. Rastro 100% apagado, abraço fraco!"`,
        `[AVISO DE ${handle}]: "Próxima vez compra um Firewall decente antes de brincar na rede! Limpei meu IP e deixei só minha assinatura pra vc lembrar quem manda."`
      ];
      return pool[Math.floor(Math.random() * pool.length)];
    }

    wipeOwnIpFromPlayerLocalLogs(botIp, handle, tauntText) {
      if (Array.isArray(window.systemLogs) && botIp) {
        window.systemLogs = window.systemLogs.filter((entry) => !String(entry.msg || '').includes(botIp));
        const lsKey = typeof window.getSystemLogsStorageKey === 'function' ? window.getSystemLogsStorageKey() : 'HC_SYSTEM_LOGS';
        try { localStorage.setItem(lsKey, JSON.stringify(window.systemLogs)); } catch (e) {}
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('FARPA-INVASOR', `${tauntText} (IP de origem apagado pelo invasor)`, 'danger');
      }
    }

    // Bots SÓ descobrem o IP do jogador se ele esqueceu o IP gravado dentro do /var/log/syslog de outra máquina/jogador!
    findPlayerIpInExternalLogs() {
      if (!window.networkIdentity || !window.botAI || !window.botAI.syslogRegistry) return null;
      const myIp = window.networkIdentity.getPublicIp();
      const exposedList = [];
      for (const [hostIp, lines] of window.botAI.syslogRegistry.entries()) {
        if (!hostIp || hostIp === myIp || hostIp === 'localhost') continue;
        const match = (lines || []).find((l) => String(l).includes(myIp));
        if (match) {
          const hMeta = window.internetEngine ? window.internetEngine.resolveHost(hostIp) : null;
          exposedList.push({
            hostIp,
            hostName: (hMeta && hMeta.hostname) || 'Servidor Remoto',
            matchingLine: match
          });
        }
      }
      if (exposedList.length === 0) return null;
      return exposedList[Math.floor(Math.random() * exposedList.length)];
    }

    hasExposedRemoteTraces() {
      const found = this.findPlayerIpInExternalLogs();
      return found ? found.hostIp : null;
    }

    simulateBotVsBotEvent() {
      this.ensureInitialized();
      const bots = Array.from(this.botStats.values());
      if (bots.length < 2) return null;

      const attacker = bots[Math.floor(Math.random() * bots.length)];
      let defender = bots[Math.floor(Math.random() * bots.length)];
      if (defender.ip === attacker.ip) {
        defender = bots[(bots.indexOf(attacker) + 1) % bots.length];
      }

      const actions = [
        { kind: 'virus', msg: `${attacker.handle} [${attacker.ip}] invadiu ${defender.handle} [${defender.ip}], plantou Miner.vminer v${attacker.tier}.5 e limpou o próprio IP`, repDelta: 45 },
        { kind: 'loot', msg: `${attacker.handle} [${attacker.ip}] coletou IPs nos logs de 203.17.88.40 e drenou $ ${320 * attacker.tier} HC de ${defender.handle} [${defender.ip}]`, repDelta: 65, noisyCrime: 'Dreno bancário entre operadores na sub-rede' },
        { kind: 'ddos', msg: `${attacker.handle} [${attacker.ip}] disparou rajada DDoS (${(attacker.tier * 2.4).toFixed(1)} Gbps) contra ${defender.handle} [${defender.ip}]`, repDelta: 80, noisyCrime: 'Ataque DDoS autônomo contra VPC rival' }
      ];
      const chosen = actions[Math.floor(Math.random() * actions.length)];

      attacker.rep += chosen.repDelta;
      attacker.hacks += 1;
      attacker.lastAction = `Atacou ${defender.ip} (${chosen.kind.toUpperCase()})`;
      defender.lastAction = `Sofreu intrusão de ${attacker.handle} e auditou logs`;

      this.battleFeed.unshift({
        at: nowTime(),
        type: 'BOT-VS-BOT',
        text: chosen.msg,
        attackerIp: attacker.ip
      });
      if (this.battleFeed.length > 25) this.battleFeed.length = 25;

      if (window.safenetFbiEngine) {
        window.safenetFbiEngine.addNews('REDE-VIVA', chosen.msg);
        if (chosen.noisyCrime && Math.random() < 0.45) {
          window.safenetFbiEngine.addOrEscalateSuspect({
            ip: attacker.ip,
            handle: attacker.handle,
            kind: 'bot',
            reason: chosen.noisyCrime,
            amountValue: 1800 * attacker.tier,
            defenseGbps: +(1.6 + attacker.tier * 1.4).toFixed(1)
          });
        }
      }
      return { attacker, defender, chosen };
    }

    // REGRA REALISTA DE RASTREAMENTO:
    // Bots ativos NUNCA adivinham o IP do jogador do nada! Eles SÓ pegam seu IP dentro de logs esquecidos em outras máquinas/jogadores (ou lista pública FBI/Safenet)!
    attemptBotHuntOnPlayer(forceHunt = false, options = {}) {
      this.ensureInitialized();
      if (!window.currentProfile || !window.networkIdentity) return { triggered: false, reason: 'NO_SESSION' };

      const rep = window.currentProfile.reputation || 0;
      if (rep < 100 && !forceHunt) {
        return { triggered: false, reason: 'NEWBIE_SANDBOX_PROTECTED' };
      }

      const myIp = window.networkIdentity.getPublicIp();
      const exposedTrace = this.findPlayerIpInExternalLogs();
      const isWanted = window.safenetFbiEngine && (window.safenetFbiEngine.isIpWantedByFbi(myIp) || window.safenetFbiEngine.isIpOnSafenet(myIp));

      // ZERO RADAR MÁGICO: Sem IP exposto em logs de outras máquinas e sem estar na lista pública Safenet/FBI -> NENHUM bot encontra seu IP!
      if (!exposedTrace && !isWanted) {
        if (forceHunt && typeof window.showToast === 'function') {
          window.showToast(`Stealth 100%: Nenhum bot encontrou seu IP (${myIp}) porque ele não consta na log de nenhuma máquina externa!`);
        }
        return {
          triggered: false,
          reason: 'NO_EXPOSED_IP_IN_LOGS',
          myIp,
          message: `Nenhum bot ativo encontrou seu IP (${myIp}): zero rastros em logs de outras máquinas ou jogadores!`
        };
      }

      const allBots = Array.from(this.botStats.values());
      let pool = allBots.filter((b) => b.tier >= 2);
      if (options.forceSloppyTier1) {
        pool = allBots.filter((b) => b.tier === 1);
      } else if (!forceHunt && Math.random() < 0.25) {
        pool = allBots;
      }
      const hunter = pool[Math.floor(Math.random() * pool.length)] || allBots[0];
      if (!hunter) return { triggered: false };

      const botCrackerVer = hunter.tier === 3 ? 2.5 : (hunter.tier === 2 ? 1.5 : 1.0);
      const botExploitVer = hunter.tier === 3 ? 2.5 : (hunter.tier === 2 ? 1.5 : 1.0);
      const defs = this.getPlayerDefensesStrict();
      const triggerCause = exposedTrace
        ? `coletou seu IP [${myIp}] esquecido na log de ${exposedTrace.hostName} [${exposedTrace.hostIp}]`
        : 'coletou seu IP exposto no mural público da Safenet/FBI';

      // PORTÃO ESTRITO: Bot tenta Força-Bruta (exige botCracker >= seu Firewall E >= seu Hasher) OU Exploit (exige botExploit >= seu Firewall)!
      const canBotBruteforce = botCrackerVer >= defs.fwl && botCrackerVer >= defs.hash;
      const canBotExploit = botExploitVer >= defs.fwl;

      if (!canBotBruteforce && !canBotExploit) {
        // Como o bot NÃO conseguiu entrar como root no seu PC, ele NÃO pôde apagar o próprio IP da tentativa falha!
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 15;
        const msg = `Bot ${hunter.handle} [${hunter.ip}] (v${botCrackerVer.toFixed(1)}) ${triggerCause} e tentou invadir seu PC, mas seu Firewall v${defs.fwl.toFixed(1)} / Hasher v${defs.hash.toFixed(1)} BLOQUEOU 100% a entrada! (+15 REP)`;
        this.battleFeed.unshift({ at: nowTime(), type: 'CAÇADA-BLOQUEADA', text: msg, attackerIp: hunter.ip });
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('HUNTER-BLOCKED', msg, 'success');
        }
        if (typeof window.showToast === 'function') {
          window.showToast(`Firewall v${defs.fwl.toFixed(1)} bloqueou invasão do bot ${hunter.handle} [${hunter.ip}]!`);
        }
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
        return {
          triggered: true,
          outcome: 'BLOCKED_BY_PLAYER_FIREWALL',
          leakedFromHost: exposedTrace ? exposedTrace.hostIp : 'SAFENET_PUBLIC',
          hunterIp: hunter.ip,
          hunterHandle: hunter.handle,
          wipedOwnLog: false,
          playerFirewall: defs.fwl,
          playerHasher: defs.hash,
          botAttackPower: botCrackerVer
        };
      }

      // BOT ENTROU COMO ROOT NO SEU PC!
      const certMitigation = (window.universityEngine && window.universityEngine.hasCert(5)) ? 0.65 : 1.0;
      const curBal = window.currentWallet ? parseFloat(window.currentWallet.balance) : 0;
      const stolenCash = Math.min(450, Math.round(curBal * 0.045 * certMitigation));

      if (window.currentWallet && stolenCash > 0) {
        window.currentWallet.balance = Math.max(0, +(curBal - stolenCash).toFixed(2));
      }
      const plantedVerInt = hunter.tier === 3 ? 25 : (hunter.tier === 2 ? 20 : 10);
      const plantedHiddenVer = (hunter.tier === 3 && Math.random() < 0.4) ? 1.5 : 0;
      const malwareName = `Spyware.${hunter.handle.toLowerCase()}.vbank`;

      // COMPORTAMENTO REALISTA DE JOGADOR HUMANO:
      // Bots experientes (100% dos Tier 3, ~80% dos Tier 2, ~30% dos Tier 1) APAGAM o próprio IP da sua log antes de sair e deixam só uma FARPA com o nick deles!
      // Já bots descuidados/iniciantes esquecem o próprio IP gravado na sua log!
      const wipesOwnLog = options.forceWipeMode === 'wipe'
        ? true
        : (options.forceWipeMode === 'sloppy'
            ? false
            : (hunter.tier === 3 ? true : (hunter.tier === 2 ? Math.random() < 0.80 : Math.random() < 0.30)));

      const visibleOriginLabel = wipesOwnLog ? `RASTRO APAGADO POR ${hunter.handle}` : hunter.ip;

      if (window.softwareEngine) {
        window.softwareEngine.infectLocalPc(
          'hunter_spyware',
          malwareName,
          plantedVerInt,
          visibleOriginLabel,
          plantedHiddenVer
        );
      }

      hunter.rep += 70;
      hunter.lastAction = `Invadiu ${window.currentProfile.hacker_tag} e ${wipesOwnLog ? 'apagou o próprio IP deixando farpa' : 'esqueceu o IP na log'}`;

      const methodUsed = canBotExploit ? `Exploit v${botExploitVer.toFixed(1)}` : `Força-Bruta v${botCrackerVer.toFixed(1)}`;

      if (wipesOwnLog) {
        const tauntMsg = this.buildHackerTaunt(
          hunter.handle,
          defs.fwl,
          stolenCash,
          `${malwareName} v${(plantedVerInt / 10).toFixed(1)}`
        );
        this.wipeOwnIpFromPlayerLocalLogs(hunter.ip, hunter.handle, tauntMsg);

        const maskedFeedMsg = `INVASÃO SOFRIDA: ${hunter.handle} [IP APAGADO DA LOG] (${triggerCause}) entrou via ${methodUsed}, drenou $ ${stolenCash} HC, instalou ${malwareName} v${(plantedVerInt / 10).toFixed(1)} e deixou uma farpa na sua log!`;
        this.battleFeed.unshift({ at: nowTime(), type: 'JOGADOR-CAÇADO', text: maskedFeedMsg, attackerIp: null });

        if (typeof window.showToast === 'function') {
          window.showToast(`INVADIDO POR ${hunter.handle}! Ele apagou o próprio IP da sua log e deixou uma farpa em Meus Logs!`);
        }
      } else {
        const sloppyMsg = `sshd[root]: ${hunter.ip} (${hunter.handle}) ${triggerCause}, entrou via ${methodUsed}, drenou $ ${stolenCash} HC, instalou ${malwareName} v${(plantedVerInt / 10).toFixed(1)} — MAS ESQUECEU O PRÓPRIO IP NA SUA LOG!`;
        this.battleFeed.unshift({ at: nowTime(), type: 'JOGADOR-CAÇADO', text: sloppyMsg, attackerIp: hunter.ip });
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('INTRUSION-IP-EXPOSTO', sloppyMsg, 'danger');
        }
        if (typeof window.showToast === 'function') {
          window.showToast(`ALERTA: ${hunter.handle} [${hunter.ip}] invadiu seu PC mas esqueceu o IP na sua log!`);
        }
      }

      if (window.hackerAudio && typeof window.hackerAudio.playErrorBuzz === 'function') {
        window.hackerAudio.playErrorBuzz();
      }
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.winManager && window.winManager.current === 'winLogs' && typeof window.renderLogsPage === 'function') {
        window.renderLogsPage();
      }
      return {
        triggered: true,
        outcome: 'BREACHED_PLAYER',
        leakedFromHost: exposedTrace ? exposedTrace.hostIp : 'SAFENET_PUBLIC',
        hunterHandle: hunter.handle,
        hunterIp: wipesOwnLog ? null : hunter.ip,
        wipedOwnLog: wipesOwnLog,
        stolenCash,
        plantedVerInt,
        playerFirewall: defs.fwl,
        botAttackPower: botCrackerVer
      };
    }

    simulateWorldStep(manualTrigger = false) {
      this.ensureInitialized();
      const bvb = this.simulateBotVsBotEvent();
      let hunt = null;
      const now = Date.now();
      if (manualTrigger || now - this.lastPlayerHuntAt > 25000) {
        this.lastPlayerHuntAt = now;
        hunt = this.attemptBotHuntOnPlayer(false);
      }
      if (window.winManager && window.winManager.current === 'winFbi' && window.safenetFbiEngine) {
        window.safenetFbiEngine.renderUI();
      }
      if (window.winManager && window.winManager.current === 'winHome' && typeof window.renderHome === 'function') {
        window.renderHome();
      }
      return { bvb, hunt };
    }

    getLiveLeaderboard(limit = 8) {
      this.ensureInitialized();
      const entries = Array.from(this.botStats.values()).map((b) => ({
        handle: b.handle,
        ip: b.ip,
        isPlayer: false,
        tierLabel: b.tierName,
        rep: b.rep,
        hacks: b.hacks,
        lastAction: b.lastAction
      }));

      if (window.currentProfile && window.networkIdentity) {
        entries.push({
          handle: window.currentProfile.hacker_tag,
          ip: window.networkIdentity.getPublicIp(),
          isPlayer: true,
          tierLabel: 'VOCÊ',
          rep: window.currentProfile.reputation || 0,
          hacks: window.hackedDb ? (window.hackedDb.entries || []).length : 0,
          lastAction: 'Sessão Ativa'
        });
      }

      entries.sort((a, b) => b.rep - a.rep);
      entries.forEach((e, i) => {
        e.rank = i + 1;
      });

      const topSlice = entries.slice(0, limit);
      const playerEntry = entries.find((e) => e.isPlayer);
      if (playerEntry && !topSlice.some((e) => e.isPlayer)) {
        topSlice.push(playerEntry);
      }
      return topSlice;
    }

    renderLiveWorldHtml() {
      const board = this.getLiveLeaderboard(7);
      const playerDef = this.getPlayerDefenseScore();

      const rankingRows = board.map((r) => `
        <div style="display:grid;grid-template-columns:42px minmax(150px,1.2fr) minmax(120px,1fr) minmax(90px,0.7fr) auto;gap:10px;align-items:center;padding:8px 10px;border-bottom:1px solid var(--hc-border);background:${r.isPlayer ? 'rgba(53,184,119,0.09)' : 'transparent'};border-radius:6px;font-size:0.81rem;">
          <strong style="font-family:var(--hc-font-mono);color:${r.isPlayer ? 'var(--hc-accent-text)' : 'var(--hc-text-3)'};">#${r.rank}</strong>
          <div>
            <strong>${esc(r.handle)}</strong>
            <span class="hc-badge ${r.isPlayer ? 'success' : 'info'}" style="margin-left:6px;">${esc(r.tierLabel)}</span>
          </div>
          <code style="color:var(--hc-accent-text);cursor:pointer;" onclick="window.internetEngine.openIp('${esc(r.ip)}')">${esc(r.ip)}</code>
          <strong style="font-family:var(--hc-font-mono);">${r.rep.toLocaleString('pt-BR')} REP</strong>
          <div style="text-align:right;">
            ${r.isPlayer
              ? `<span style="font-size:0.75rem;color:var(--hc-accent-text);">Defesa: ${playerDef}x</span>`
              : `<button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('${esc(r.ip)}', 'invadir')">Caçar Bot →</button>`}
          </div>
        </div>
      `).join('');

      const feedRows = this.battleFeed.slice(0, 8).map((f) => {
        const badgeCls = f.type === 'JOGADOR-CAÇADO' ? 'danger' : (f.type === 'CAÇADA-BLOQUEADA' ? 'success' : 'info');
        return `
          <div style="padding:7px 0;border-bottom:1px solid var(--hc-border);font-size:0.8rem;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
            <div>
              <span style="font-family:var(--hc-font-mono);color:var(--hc-text-3);">[${esc(f.at)}]</span>
              <span class="hc-badge ${badgeCls}" style="margin:0 6px;">${esc(f.type)}</span>
              <span style="color:var(--hc-text-2);">${esc(f.text)}</span>
            </div>
            ${f.attackerIp ? `<button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('${esc(f.attackerIp)}', 'invadir')">Abrir IP</button>` : ''}
          </div>
        `;
      }).join('');

      return `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:14px;">
          <div class="hc-card" style="padding:1.1rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <div class="hc-eyebrow">Ranking Vivo da Sub-Rede (Operadores + Bots Online)</div>
              <span style="font-size:0.75rem;color:var(--hc-text-2);">Sua Defesa (FWL+HASH): <strong>${playerDef}x</strong></span>
            </div>
            ${rankingRows}
          </div>

          <div class="hc-card" style="padding:1.1rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <div class="hc-eyebrow">Telemetria em Tempo Real (Bots vs Bots & Caçadas PvE)</div>
              <button type="button" id="btnSimulateBotHuntNow" class="hc-btn ghost sm" onclick="window.livingBotsEngine.attemptBotHuntOnPlayer(true);window.safenetFbiEngine.renderUI();">
                Testar Defesa Contra Caçador
              </button>
            </div>
            ${feedRows}
          </div>
        </div>
      `;
    }
  }

  window.safenetFbiEngine = new SafenetFbiEngine();
  window.livingBotsEngine = new LivingWorldBotsEngine();

  window.handleFbiTakedown = function (ip) {
    const res = window.safenetFbiEngine.takedownFbiTarget(ip);
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };
})();
