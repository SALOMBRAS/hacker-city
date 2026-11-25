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

  function getMaskedIp(ip, tier = 1) {
    const parts = String(ip || '161.89.0.1').split('.');
    if (parts.length < 4) return '161.89.X.X';
    if (tier === 1) return parts[0] + '.' + parts[1] + '.X.X';
    if (tier === 2) return parts[0] + '.' + parts[1] + '.' + parts[2] + '.X';
    if (tier === 3) return parts[0] + '.' + parts[1] + '.' + parts[2] + '.' + parts[3].slice(0, 1) + '?';
    return ip;
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
      this.counterSeconds = 60;
      this.counterTraceInterval = null;
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
          maskTier: 1,
          maskedDisplayIp: getMaskedIp(b1.ip, 1),
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
          maskTier: 2,
          maskedDisplayIp: getMaskedIp(b2.ip, 2),
          since: nowTime()
        }
      ];

      this.addNews('FBI-ALERT', `Recompensa federal de ${fmtUsd(3200)} aberta pela captura de @${b2.handle} na Lista de Procurados.`);
      this.addNews('SAFENET', `Divisão Cyber iniciou monitoramento sobre @${b1.handle} após tráfego suspeito de mineração.`);
    }

    addNews(tag, headline) {
      // Blindagem anti-vazamento: manchetes públicas NUNCA entregam IPs de máquinas/jogadores de graça!
      const cleanHeadline = String(headline || '')
        .replace(/\s*\[\d{1,3}(?:\.\d{1,3}|\.X){3}\]/gi, '')
        .replace(/\b10\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[rastro oculto]')
        .replace(/\s{2,}/g, ' ')
        .trim();
      this.worldNews.unshift({
        id: Date.now() + Math.floor(Math.random() * 1000),
        at: nowTime(),
        tag,
        headline: cleanHeadline
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
      const top3Mult = (kind === 'player' && window.nineSystemsEngine && typeof window.nineSystemsEngine.isPlayerInSeasonTop3 === 'function' && window.nineSystemsEngine.isPlayerInSeasonTop3())
        ? 1.5 // Contrapeso Holofote da Temporada Mensal: Top 3 tem +50% de recompensa no FBI!
        : 1.0;
      const addedBounty = Math.max(550, Math.round(amountValue * 0.42 * top3Mult));
      const addedSats = Math.round(addedBounty * 65);

      if (fbiEntry) {
        fbiEntry.bountyCash = Math.min(35000, fbiEntry.bountyCash + addedBounty);
        fbiEntry.bountySats += addedSats;
        fbiEntry.crime = reason;
        fbiEntry.maskTier = Math.min(4, (fbiEntry.maskTier || 1) + 1);
        fbiEntry.maskedDisplayIp = getMaskedIp(fbiEntry.ip, fbiEntry.maskTier);
      } else {
        fbiEntry = {
          ip,
          handle,
          kind,
          crime: reason,
          bountyCash: Math.max(950, addedBounty),
          bountySats: addedSats,
          defenseGbps,
          maskTier: 1,
          maskedDisplayIp: getMaskedIp(ip, 1),
          since: nowTime()
        };
        this.fbiWantedList.unshift(fbiEntry);
        if (this.fbiWantedList.length > 8) this.fbiWantedList.length = 8;
        this.addNews('FBI-WANTED', `@${handle} entrou na Lista de Procurados do FBI! Recompensa pela cabeça: ${fmtUsd(fbiEntry.bountyCash)}.`);
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

      // SUCESSO: Derrubou o Procurado do FBI e capturou o Bounty (com bônus do Delegado em Exercício)!
      this.fbiWantedList = this.fbiWantedList.filter((w) => w.ip !== targetIp);
      this.safenetList = this.safenetList.filter((s) => s.ip !== targetIp);

      const delMult = (window.nineSystemsEngine && typeof window.nineSystemsEngine.getActiveDelegate === 'function')
        ? Number(window.nineSystemsEngine.getActiveDelegate().bountyMult || 1.0)
        : 1.0;
      const finalBountyCash = Math.round(target.bountyCash * delMult);

      if (window.currentWallet) {
        window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) + finalBountyCash).toFixed(2);
      }
      if (window.nineSystemsEngine) {
        window.nineSystemsEngine.awardSeasonPoints(Math.round(finalBountyCash * 0.08), targetIp);
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
          ? `<div class="hc-card" style="padding:2rem;text-align:center;color:var(--hc-text-2);">Nenhum procurado ativo neste segundo. Os operadores da rede logo cometerão novos crimes!</div>`
          : this.fbiWantedList.map((w) => {
              const isDecrypted = Number(w.maskTier || 1) >= 4;
              const canBeat = isDecrypted && myGbps >= w.defenseGbps && w.ip !== myIp;
              return `
                <div class="hc-card hc-responsive-row-grid" style="padding:1rem 1.2rem;display:grid;grid-template-columns:minmax(210px,1.3fr) minmax(210px,1.5fr) minmax(150px,1fr) auto;gap:12px;align-items:center;border-color:rgba(208,68,58,0.35);">
                  <div>
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                      <span class="hc-badge danger">PROCURADO FBI</span>
                      <strong style="font-size:0.95rem;">@${esc(w.handle)}</strong>
                    </div>
                    <div style="font-family:var(--hc-font-mono);font-size:0.82rem;color:#fca5a5;margin-top:3px;">
                      ${isDecrypted
                        ? `IP Desmascarado: <strong style="color:var(--hc-accent-text);cursor:pointer;" onclick="window.internetEngine.openIp('${esc(w.ip)}')">${esc(w.ip)}</strong>`
                        : `Rastro Sigiloso: <strong>🔒 Criptografado (Nível ${w.maskTier || 1}/4)</strong>`}
                    </div>
                  </div>

                  <div style="font-size:0.8rem;color:var(--hc-text-2);">
                    <div>${esc(w.crime)}</div>
                    <div style="font-family:var(--hc-font-mono);font-size:0.74rem;color:var(--hc-text-3);margin-top:3px;">Defesa Estimada: ${w.defenseGbps} Gbps</div>
                  </div>

                  <div>
                    <div style="font-size:0.7rem;color:var(--hc-text-3);text-transform:uppercase;">Recompensa Federal</div>
                    <strong style="font-family:var(--hc-font-mono);font-size:0.95rem;color:var(--hc-accent-text);">${fmtUsd(w.bountyCash)}</strong>
                    <div style="font-family:var(--hc-font-mono);font-size:0.75rem;color:var(--hc-warning);">+${(w.bountySats / 100000000).toFixed(5)} BTC</div>
                  </div>

                  <div style="display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap;">
                    ${isDecrypted
                      ? `<button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('${esc(w.ip)}', 'invadir')">Abrir Alvo</button>
                         <button type="button" id="btnFbiTakedown_${esc(w.ip.replace(/\./g, '_'))}" class="hc-btn ${canBeat ? 'primary' : 'ghost'} sm" onclick="window.handleFbiTakedown('${esc(w.ip)}')">DDoS &amp; Capturar Bounty</button>`
                      : `<button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('161.89.1.1')">🔓 Desmascarar no FBI</button>
                         <button type="button" class="hc-btn ghost sm" onclick="if(window.darknetSocialEngine) window.darknetSocialEngine.openAuthorPublications('${esc(w.handle)}')">Ver Publicações</button>`}
                  </div>
                </div>
              `;
            }).join('');
        bodyHtml = `
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;background:#151c27;border:1px solid #28374d;border-radius:8px;padding:10px 14px;margin-bottom:10px;">
            <div style="font-size:0.84rem;color:#cbd5e1;">
              💡 <strong>Caça Real de IPs:</strong> O IP dos procurados não é entregue de bandeja — cace pistas em logs de servidores ou invada o Mainframe do FBI para descriptografar o dossiê!
            </div>
            <button type="button" class="hc-btn primary sm" style="background:#dc2626;border-color:#ef4444;" onclick="window.internetEngine.openIp('161.89.1.1')">
              🏛️ Infiltrar Mainframe Central FBI (161.89.1.1) →
            </button>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;">${rows}</div>
        `;
      } else if (this.activeTab === 'safenet') {
        const sRows = this.safenetList.length === 0
          ? `<div class="hc-card" style="padding:2rem;text-align:center;color:var(--hc-text-2);">Nenhum operador sob investigação preliminar da Safenet agora.</div>`
          : this.safenetList.map((s) => `
              <div class="hc-card" style="padding:0.9rem 1.15rem;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
                <div>
                  <span class="hc-badge warn">Severidade ${s.severity}</span>
                  <strong style="margin-left:8px;">@${esc(s.handle)}</strong>
                  <span class="mono" style="margin-left:8px;font-size:0.76rem;color:var(--hc-text-3);">[IP sob sigilo forense]</span>
                  <div style="font-size:0.8rem;color:var(--hc-text-2);margin-top:4px;">Motivo: ${esc(s.reason)} · Detectado às ${esc(s.since)}</div>
                </div>
                <button type="button" class="hc-btn ghost sm" onclick="if(window.darknetSocialEngine) window.darknetSocialEngine.openAuthorPublications('${esc(s.handle)}')">Ver Publicações →</button>
              </div>
            `).join('');
        bodyHtml = `<div style="display:flex;flex-direction:column;gap:8px;">${sRows}</div>`;
      } else if (this.activeTab === 'bounties') {
        bodyHtml = window.playerBountyEngine ? window.playerBountyEngine.renderBountyTabHtml() : '';
      } else {
        bodyHtml = window.livingBotsEngine ? window.livingBotsEngine.renderLiveWorldHtml() : '';
      }

      const openP2pBounties = window.playerBountyEngine ? window.playerBountyEngine.getOpenBounties().length : 0;

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${window.nineSystemsEngine && typeof window.nineSystemsEngine.renderDelegateBannerHtml === 'function' ? window.nineSystemsEngine.renderDelegateBannerHtml() : ''}
          ${statusAlert}

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(195px,1fr));gap:12px;">
            <div class="hc-card" style="padding:0.95rem 1.1rem;">
              <div class="hc-stat-label">Procurados do FBI</div>
              <div class="hc-stat-value" style="color:var(--hc-danger-text);">${this.fbiWantedList.length}</div>
            </div>
            <div class="hc-card" style="padding:0.95rem 1.1rem;">
              <div class="hc-stat-label">Vingança por Nick (P2P)</div>
              <div class="hc-stat-value" style="color:var(--hc-warning);">${openP2pBounties}</div>
            </div>
            <div class="hc-card" style="padding:0.95rem 1.1rem;">
              <div class="hc-stat-label">Seu Poder de DDoS Atual</div>
              <div class="hc-stat-value" style="font-family:var(--hc-font-mono);color:var(--hc-accent-text);">${window.ddosOverloadEngine ? window.ddosOverloadEngine.getPlayerTotalDdosGbps() : myGbps} Gbps</div>
            </div>
            <div class="hc-card" style="padding:0.95rem 1.1rem;">
              <div class="hc-stat-label">Operadores Ativos</div>
              <div class="hc-stat-value">${window.livingBotsEngine ? window.livingBotsEngine.getOnlineBotsCount() : 24}</div>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;border-bottom:1px solid var(--hc-border);padding-bottom:10px;">
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button type="button" class="hc-btn sm ${this.activeTab === 'fbi' ? 'primary' : 'ghost'}" onclick="window.safenetFbiEngine.activeTab='fbi';window.safenetFbiEngine.renderUI();">
                Procurados do FBI (${this.fbiWantedList.length})
              </button>
              <button type="button" id="tabPlayerBounties" class="hc-btn sm ${this.activeTab === 'bounties' ? 'primary' : 'ghost'}" onclick="window.safenetFbiEngine.activeTab='bounties';window.safenetFbiEngine.renderUI();">
                🎯 Vingança por Nick (${openP2pBounties})
              </button>
              <button type="button" class="hc-btn sm ${this.activeTab === 'safenet' ? 'primary' : 'ghost'}" onclick="window.safenetFbiEngine.activeTab='safenet';window.safenetFbiEngine.renderUI();">
                Mira da Safenet (${this.safenetList.length})
              </button>
              <button type="button" id="tabLiveBotsWorld" class="hc-btn sm ${this.activeTab === 'liveworld' ? 'primary' : 'ghost'}" onclick="window.safenetFbiEngine.activeTab='liveworld';window.safenetFbiEngine.renderUI();">
                Movimentação &amp; Ranking Vivo
              </button>
            </div>
            <button type="button" id="btnTriggerWorldStep" class="hc-btn ghost sm" onclick="window.livingBotsEngine.simulateWorldStep(true)">
              Atualizar Radar Agora ↻
            </button>
          </div>

          ${bodyHtml}
        </div>
      `;
    }

    // =======================================================================
    // MAINFRAME CENTRAL DO FBI (161.89.1.1) — OPERAÇÕES ROOT GOVERNAMENTAIS
    // =======================================================================
    renderMainframeRootTerminal() {
      this.ensureSeeded();
      this.startMainframeCounterTrace();
      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      const myWanted = this.fbiWantedList.find((w) => w.ip === myIp);
      const mySafenet = this.safenetList.find((s) => s.ip === myIp);
      const heat = window.currentProfile ? window.currentProfile.heat_level || 1 : 1;

      return `
        <div class="hc-card" style="padding:1.4rem;border-color:rgba(239,68,68,0.6);background:linear-gradient(145deg, #11090c 0%, #0d121c 100%);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;border-bottom:1px solid #3b1d24;padding-bottom:12px;margin-bottom:16px;">
            <div>
              <div class="hc-eyebrow" style="color:#ef4444;">TERMINAL FEDERAL ROOT // FBI CYBERCRIME DIVISION</div>
              <h3 style="margin:4px 0;color:#fff;font-size:1.15rem;">SISTEMA CENTRAL DE MANDADOS E DOSSIÊS (161.89.1.1)</h3>
              <div style="font-size:0.8rem;color:#94a3b8;">Acesso Root Concedido · Chave Criptográfica Federal Ativa</div>
            </div>
            <div id="fbiCounterTraceBox" style="background:#2a0f13;border:1px solid #7f1d1d;border-radius:6px;padding:8px 12px;text-align:right;">
              <div style="font-size:0.7rem;color:#fca5a5;text-transform:uppercase;">Alarme de Contra-Rastreamento</div>
              <div id="fbiCounterTraceTimer" style="font-family:monospace;font-size:1.1rem;font-weight:bold;color:#ef4444;">
                TEMPO: ${this.counterSeconds}s
              </div>
            </div>
          </div>

          <!-- Ação 1: Limpar Minha Ficha -->
          <div style="background:#171116;border:1px solid #4a1d26;border-radius:8px;padding:12px 14px;margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
              <div>
                <strong style="color:#f87171;font-size:0.92rem;">1. Expurgar Minha Ficha Criminal (Expunge Record)</strong>
                <div style="font-size:0.8rem;color:#cbd5e1;margin-top:2px;">
                  Seu IP: <code>${window.networkIdentity && window.networkIdentity.renderBlurredMyIpHtml ? window.networkIdentity.renderBlurredMyIpHtml(myIp, true) : esc(myIp)}</code> · Calor Atual: <strong>${heat}/5</strong> · Status: <strong>${myWanted ? 'MANDADO FEDERAL ATIVO' : (mySafenet ? 'Na Mira da Safenet' : 'Ficha Limpa')}</strong>
                </div>
              </div>
              <button type="button" class="hc-btn primary sm" style="background:#dc2626;border-color:#ef4444;" onclick="window.safenetFbiEngine.expungeMyRecord()">
                🗑️ Expurgar Ficha e Zerar Mandado
              </button>
            </div>
          </div>

          <!-- Ação 2: Descriptografar IPs Mascarados de Alvos -->
          <div style="background:#0f172a;border:1px solid #1e3a5f;border-radius:8px;padding:12px 14px;margin-bottom:14px;">
            <strong style="color:#38bdf8;font-size:0.92rem;">2. Descriptografar IPs Mascarados da Rede (Decrypt Mask)</strong>
            <div style="font-size:0.8rem;color:#94a3b8;margin:4px 0 10px 0;">
              Remova a máscara dos octetos de procurados para revelar os 4 números do IP e permitir ataques diretos:
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${this.fbiWantedList.map((w) => `
                <div style="display:flex;justify-content:space-between;align-items:center;background:#131c2e;padding:8px 12px;border-radius:6px;font-size:0.82rem;">
                  <div>
                    <strong style="color:#e2e8f0;">${esc(w.handle)}</strong> · Rastro: <code style="color:${w.maskTier >= 4 ? '#35b877' : '#fca5a5'};font-weight:bold;">${esc(w.maskedDisplayIp || w.ip)}</code>
                    ${w.maskTier < 4 ? `<span style="font-size:0.72rem;color:#f87171;margin-left:6px;">(Máscara Nível ${w.maskTier}/4)</span>` : '<span style="font-size:0.72rem;color:#35b877;margin-left:6px;">(100% Revelado)</span>'}
                  </div>
                  ${w.maskTier < 4
                    ? `<button type="button" class="hc-btn ghost sm" onclick="window.safenetFbiEngine.decryptMask('${esc(w.ip)}')">🔍 Revelar IP Completo</button>`
                    : `<button type="button" class="hc-btn primary sm" onclick="window.internetEngine.openIp('${esc(w.ip)}', 'invadir')">Atacar IP Revelado →</button>`}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Ação 3: Falsificar Evidências e Incriminar Rival -->
          <div style="background:#161922;border:1px solid #2d3748;border-radius:8px;padding:12px 14px;">
            <strong style="color:#f59e0b;font-size:0.92rem;">3. Falsificar Provas Forenses (Frame Rival)</strong>
            <div style="font-size:0.8rem;color:#94a3b8;margin:4px 0 10px 0;">
              Transfira seus registros de crimes para o IP de outro jogador ou bot rival para direcionar os caçadores para ele:
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <input type="text" id="frameTargetIpInput" placeholder="Ex: 10.110.1.18 ou IP de um rival..." style="background:#090d14;border:1px solid #334155;color:#e2e8f0;padding:6px 12px;border-radius:6px;font-family:monospace;font-size:0.82rem;flex:1;min-width:200px;">
              <button type="button" class="hc-btn ghost sm" style="border-color:#f59e0b;color:#f59e0b;" onclick="window.safenetFbiEngine.framePlayer(document.getElementById('frameTargetIpInput').value)">
                🎭 Falsificar Provas e Incriminar Alvo
              </button>
            </div>
          </div>
        </div>
      `;
    }

    async expungeMyRecord() {
      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      this.safenetList = this.safenetList.filter((s) => s.ip !== myIp);
      this.fbiWantedList = this.fbiWantedList.filter((w) => w.ip !== myIp);

      if (window.currentProfile) {
        window.currentProfile.heat_level = 1;
      }

      if (window.supabaseClient) {
        try {
          await window.supabaseClient.rpc('expunge_fbi_criminal_dossier', {
            p_target_ip: myIp,
            p_operator_alias: (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador'
          });
        } catch (e) {
          console.warn('[FBI] Supabase RPC expunge error:', e);
        }
      }

      if (window.audioEngine && typeof window.audioEngine.playCashChime === 'function') {
        window.audioEngine.playCashChime();
      }

      if (window.showToast) {
        window.showToast('🗑️ FICHA EXPURGADA! Seus registros e mandados foram completamente deletados do Mainframe do FBI!', 'success');
      }

      if (window.internetEngine) {
        window.internetEngine.render();
      }
      this.renderUI();
    }

    async decryptMask(targetIp) {
      const entry = this.fbiWantedList.find((w) => w.ip === targetIp);
      if (entry) {
        entry.maskTier = 4;
        entry.maskedDisplayIp = targetIp;
      }

      if (window.supabaseClient) {
        try {
          await window.supabaseClient.rpc('decrypt_fbi_masked_ip', { p_target_ip: targetIp });
        } catch (e) {}
      }

      if (window.audioEngine && typeof window.audioEngine.playEnterBeep === 'function') {
        window.audioEngine.playEnterBeep();
      }

      if (window.showToast) {
        window.showToast(`🔍 IP DESCRIPTOGRAFADO: ${targetIp} revelado com sucesso!`, 'info');
      }

      if (window.internetEngine) {
        window.internetEngine.render();
      }
      this.renderUI();
    }

    async framePlayer(targetIp) {
      targetIp = String(targetIp || '').trim();
      if (!targetIp || targetIp.split('.').length < 4) {
        if (window.showToast) window.showToast('Digite um endereço IP válido com 4 octetos!', 'danger');
        return;
      }

      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      if (targetIp === myIp) {
        if (window.showToast) window.showToast('Você não pode incriminar seu próprio IP!', 'danger');
        return;
      }

      this.addOrEscalateSuspect({
        ip: targetIp,
        handle: 'Suspeito Incriminado',
        kind: 'bot',
        reason: 'Evidência forjada e transferida do IP ' + myIp,
        amountValue: 3500,
        defenseGbps: 3.2
      });

      // Reduz o calor do jogador
      if (window.currentProfile) {
        window.currentProfile.heat_level = Math.max(1, (window.currentProfile.heat_level || 2) - 1);
      }

      if (window.supabaseClient) {
        try {
          await window.supabaseClient.rpc('frame_rival_fbi_dossier', {
            p_source_ip: myIp,
            p_framed_ip: targetIp,
            p_framing_alias: (window.currentProfile && window.currentProfile.hacker_tag) || 'Root'
          });
        } catch (e) {}
      }

      if (window.audioEngine && typeof window.audioEngine.playCashChime === 'function') {
        window.audioEngine.playCashChime();
      }

      if (window.showToast) {
        window.showToast(`🎭 PROVAS FALSIFICADAS! O FBI agora está caçando ${targetIp}!`, 'warning');
      }

      if (window.internetEngine) {
        window.internetEngine.render();
      }
      this.renderUI();
    }

    startMainframeCounterTrace() {
      if (this.counterTraceInterval) return;
      this.counterSeconds = 60;
      this.counterTraceInterval = setInterval(() => {
        this.counterSeconds--;
        const timerEl = document.getElementById('fbiCounterTraceTimer');
        if (timerEl) {
          timerEl.textContent = `TEMPO: ${this.counterSeconds}s`;
        }
        if (this.counterSeconds <= 0) {
          clearInterval(this.counterTraceInterval);
          this.counterTraceInterval = null;
          this.triggerMainframeRaid();
        }
      }, 1000);
    }

    cancelMainframeCounterTrace() {
      if (this.counterTraceInterval) {
        clearInterval(this.counterTraceInterval);
        this.counterTraceInterval = null;
      }
    }

    triggerMainframeRaid() {
      if (window.audioEngine && typeof window.audioEngine.playAlertSiren === 'function') {
        window.audioEngine.playAlertSiren(4);
      }
      if (window.showToast) {
        window.showToast('🚨 CONTRA-RASTREAMENTO CONCLUÍDO! BATIDA POLICIAL IMINENTE PELO FBI!', 'danger');
      }
      if (window.panicEngine && typeof window.panicEngine.triggerPoliceRaid === 'function') {
        window.panicEngine.triggerPoliceRaid();
      }
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
      this.traceFirstSeenMs = new Map(); // hostIp::myIp -> timestampMs da 1ª detecção na log
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
        if (document.visibilityState === 'hidden') return;
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

    markFreshTrace(hostIp, ip) {
      const targetIp = ip || (window.networkIdentity ? window.networkIdentity.getPublicIp() : '');
      if (!hostIp || !targetIp) return;
      this.traceFirstSeenMs.set(`${hostIp}::${targetIp}`, Date.now());
    }

    clearTraceTimestamp(hostIp, ip) {
      if (!hostIp) return;
      if (ip) {
        this.traceFirstSeenMs.delete(`${hostIp}::${ip}`);
        return;
      }
      const prefix = `${hostIp}::`;
      for (const k of Array.from(this.traceFirstSeenMs.keys())) {
        if (k.startsWith(prefix)) this.traceFirstSeenMs.delete(k);
      }
    }

    // Bots SÓ descobrem o IP do jogador se ele ESQUECEU o IP gravado dentro do /var/log/syslog de outra máquina por tempo suficiente!
    // Enquanto o jogador acabou de logar (< 95s) ou ainda está operando dentro do host (até 120s), nenhum bot adivinha/raspa o IP na hora!
    findPlayerIpInExternalLogs(requireMinAgeMs = 0) {
      if (!window.networkIdentity || !window.botAI || !window.botAI.syslogRegistry) return null;
      const myIp = window.networkIdentity.getPublicIp();
      const now = Date.now();
      const activeSshIp = (window.internetEngine && window.internetEngine.activeSshIp) || null;
      const exposedList = [];

      for (const [hostIp, lines] of window.botAI.syslogRegistry.entries()) {
        if (!hostIp || hostIp === myIp || hostIp === 'localhost') continue;
        const key = `${hostIp}::${myIp}`;
        const match = (lines || []).find((l) => String(l).includes(myIp));
        if (!match) {
          this.traceFirstSeenMs.delete(key);
          continue;
        }
        if (!this.traceFirstSeenMs.has(key)) {
          this.traceFirstSeenMs.set(key, now);
        }
        const ageMs = now - this.traceFirstSeenMs.get(key);
        if (requireMinAgeMs > 0) {
          const minRequired = (activeSshIp && activeSshIp === hostIp) ? Math.max(120000, requireMinAgeMs) : requireMinAgeMs;
          if (ageMs < minRequired) continue;
        }
        const hMeta = window.internetEngine ? window.internetEngine.resolveHost(hostIp) : null;
        exposedList.push({
          hostIp,
          hostName: (hMeta && hMeta.hostname) || 'Servidor Remoto',
          matchingLine: match,
          ageMs
        });
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

      // Zero vazamento de IP nas manchetes! Quando o invasor limpa o rastro, nem o nick do atacante aparece!
      const actions = [
        { kind: 'virus', msg: `Um operador fantasma invadiu @${defender.handle}, plantou Miner.vminer v${attacker.tier}.5 e limpou todos os rastros da log`, repDelta: 45 },
        { kind: 'loot', msg: `@${attacker.handle} rastreou uma brecha esquecida em logs públicos e drenou $ ${320 * attacker.tier} HC de @${defender.handle}`, repDelta: 65, noisyCrime: 'Dreno bancário entre operadores na sub-rede' },
        { kind: 'ddos', msg: `@${attacker.handle} disparou sobrecarga DDoS (${(attacker.tier * 2.4).toFixed(1)} Gbps) contra a máquina de @${defender.handle}`, repDelta: 80, noisyCrime: 'Ataque DDoS autônomo contra operador rival' }
      ];
      const chosen = actions[Math.floor(Math.random() * actions.length)];

      attacker.rep += chosen.repDelta;
      attacker.hacks += 1;
      attacker.lastAction = `Operação em curso (${chosen.kind.toUpperCase()})`;
      defender.lastAction = `Auditou logs após intrusão`;

      this.battleFeed.unshift({
        at: nowTime(),
        type: 'BOT-VS-BOT',
        text: chosen.msg,
        attackerHandle: attacker.handle
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
      if (!forceHunt && window.spotlightTour && window.spotlightTour.isActive) {
        return { triggered: false, reason: 'IN_TUTORIAL_TOUR' };
      }

      const rep = window.currentProfile.reputation || 0;
      const shielded24h = !!(window.progressiveUnlockEngine && typeof window.progressiveUnlockEngine.isNewbiePvpShieldActive === 'function' && window.progressiveUnlockEngine.isNewbiePvpShieldActive());
      if ((shielded24h || rep < 100) && !forceHunt) {
        return { triggered: false, reason: 'NEWBIE_SANDBOX_PROTECTED' };
      }

      const myIp = window.networkIdentity.getPublicIp();
      // Em caçadas autônomas (forceHunt=false), exige que o rastro tenha ficado esquecido por >= 95s (nunca ataca em < 1 min após logar!)
      const minTraceAgeMs = forceHunt ? 0 : 95000;
      const exposedTrace = this.findPlayerIpInExternalLogs(minTraceAgeMs);
      const isWanted = window.safenetFbiEngine && (window.safenetFbiEngine.isIpWantedByFbi(myIp) || window.safenetFbiEngine.isIpOnSafenet(myIp));

      // ZERO RADAR MÁGICO: Sem IP esquecido (>95s) em logs externas e sem estar na lista Safenet/FBI -> NENHUM bot encontra seu IP!
      if (!exposedTrace && !isWanted) {
        if (forceHunt && typeof window.showToast === 'function') {
          window.showToast(`Stealth 100%: Nenhum bot encontrou seu IP (${myIp}) porque ele não consta na log de nenhuma máquina externa!`);
        }
        return {
          triggered: false,
          reason: 'NO_EXPOSED_IP_IN_LOGS',
          myIp,
          message: `Nenhum bot ativo encontrou seu IP (${myIp}): zero rastros esquecidos em logs externas!`
        };
      }

      // Redução de 10% na inteligência/atenção dos bots hackers em background
      if (!forceHunt && Math.random() < 0.10) {
        return { triggered: false, reason: 'BOT_DISTRACTED_10PCT' };
      }

      const allBots = Array.from(this.botStats.values());
      let pool = allBots.filter((b) => b.tier >= 2);
      if (options.forceSloppyTier1) {
        pool = allBots.filter((b) => b.tier === 1);
      } else if (!forceHunt && Math.random() < 0.38) {
        pool = allBots;
      }
      const hunter = pool[Math.floor(Math.random() * pool.length)] || allBots[0];
      if (!hunter) return { triggered: false };

      // Inteligência ofensiva dos bots hackers reduzida em 10% (2.2 / 1.3 / 0.9)
      const botCrackerVer = hunter.tier === 3 ? 2.2 : (hunter.tier === 2 ? 1.3 : 0.9);
      const botExploitVer = hunter.tier === 3 ? 2.2 : (hunter.tier === 2 ? 1.3 : 0.9);
      const defs = this.getPlayerDefensesStrict();
      const triggerCause = exposedTrace
        ? `coletou seu IP [${myIp}] esquecido na log de ${exposedTrace.hostName} [${exposedTrace.hostIp}]`
        : 'coletou seu IP exposto no mural público da Safenet/FBI';

      // PORTÃO ESTRITO: Bot tenta Força-Bruta (exige botCracker >= seu Firewall E >= seu Hasher) OU Exploit (exige botExploit >= seu Firewall)!
      const canBotBruteforce = botCrackerVer >= defs.fwl && botCrackerVer >= defs.hash;
      const canBotExploit = botExploitVer >= defs.fwl;

      if (!canBotBruteforce && !canBotExploit) {
        // Como o invasor NÃO conseguiu entrar como root no seu PC, ele NÃO pôde apagar o próprio IP da tentativa falha!
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 15;
        const msg = `Jogador ${hunter.handle} [${hunter.ip}] (v${botCrackerVer.toFixed(1)}) ${triggerCause} e tentou invadir seu PC, mas seu Firewall v${defs.fwl.toFixed(1)} / Hasher v${defs.hash.toFixed(1)} BLOQUEOU 100% a entrada! (+15 REP)`;
        this.battleFeed.unshift({ at: nowTime(), type: 'INVASÃO-BLOQUEADA', text: msg, attackerIp: hunter.ip });
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('HUNTER-BLOCKED', msg, 'success');
        }
        if (typeof window.showToast === 'function') {
          window.showToast(`Firewall v${defs.fwl.toFixed(1)} bloqueou invasão do jogador ${hunter.handle} [${hunter.ip}]!`);
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
            : (hunter.tier === 3 ? Math.random() < 0.90 : (hunter.tier === 2 ? Math.random() < 0.70 : Math.random() < 0.20)));

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
      if (manualTrigger || now - this.lastPlayerHuntAt > 75000) {
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
        tierLabel: '● Jogador Online',
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
        <div class="hc-responsive-row-grid" style="display:grid;grid-template-columns:42px minmax(160px,1.4fr) minmax(110px,0.9fr) auto;gap:10px;align-items:center;padding:8px 10px;border-bottom:1px solid var(--hc-border);background:${r.isPlayer ? 'rgba(53,184,119,0.09)' : 'transparent'};border-radius:6px;font-size:0.81rem;">
          <strong style="font-family:var(--hc-font-mono);color:${r.isPlayer ? 'var(--hc-accent-text)' : 'var(--hc-text-3)'};">#${r.rank}</strong>
          <div>
            <strong>@${esc(r.handle)}</strong>
            <span class="hc-badge success" style="margin-left:6px;">${esc(r.tierLabel)}</span>
          </div>
          <strong style="font-family:var(--hc-font-mono);">${r.rep.toLocaleString('pt-BR')} REP</strong>
          <div style="text-align:right;display:flex;gap:6px;justify-content:flex-end;">
            ${r.isPlayer
              ? `<span style="font-size:0.75rem;color:var(--hc-accent-text);">Defesa: ${playerDef}x</span>`
              : `<button type="button" class="hc-btn ghost sm" onclick="if(window.darknetSocialEngine) window.darknetSocialEngine.openAuthorPublications('${esc(r.handle)}')">Ver Publicações →</button>`}
          </div>
        </div>
      `).join('');

      const feedRows = this.battleFeed.slice(0, 8).map((f) => {
        const badgeCls = f.type === 'JOGADOR-CAÇADO' ? 'danger' : (f.type.includes('BLOQUEADA') ? 'success' : 'info');
        const labelType = f.type === 'BOT-VS-BOT' ? 'REDE AO VIVO' : f.type;
        return `
          <div style="padding:7px 0;border-bottom:1px solid var(--hc-border);font-size:0.8rem;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
            <div>
              <span style="font-family:var(--hc-font-mono);color:var(--hc-text-3);">[${esc(f.at)}]</span>
              <span class="hc-badge ${badgeCls}" style="margin:0 6px;">${esc(labelType)}</span>
              <span style="color:var(--hc-text-2);">${esc(f.text)}</span>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="hc-fbi-two-col">
          <div class="hc-card" style="padding:1.1rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
              <div class="hc-eyebrow">Ranking Vivo da Sub-Rede (Jogadores Online Agora)</div>
              <span style="font-size:0.75rem;color:var(--hc-text-2);">Sua Defesa (FWL+HASH): <strong>${playerDef}x</strong></span>
            </div>
            ${rankingRows}
          </div>

          <div class="hc-card" style="padding:1.1rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
              <div class="hc-eyebrow">Movimentação em Tempo Real (Invasões &amp; Disputas na Rede)</div>
              <button type="button" id="btnSimulateBotHuntNow" class="hc-btn ghost sm" onclick="window.livingBotsEngine.attemptBotHuntOnPlayer(true);window.safenetFbiEngine.renderUI();">
                Testar Defesa Contra Invasor
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
