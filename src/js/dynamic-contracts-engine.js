/**
 * Hacker City // Pilar 6: Quadro de Contratos Dinâmicos & Infinitos (Geração Procedural)
 * 3 Facções (Corporativa, Dark Syndicate, Caçador de Recompensas) com Renovação Contínua,
 * Recompensas de $ USD + BTC + Reputação Ramificada e Checklist de Execução no HUD.
 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtUsd(n) {
    return '$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' HC';
  }

  const FACTION_DATA = {
    corporate: {
      name: 'Corporações Aliadas (White Hat)',
      color: '#38bdf8',
      badge: 'Corporativo',
      clients: ['BioHealth MedTech S.A.', 'OmniCorp Cloud Systems', 'Saint Cloud Logistics', 'Global Pharma Clear']
    },
    syndicate: {
      name: 'Dark Syndicate (Black Hat)',
      color: '#ef4444',
      badge: 'Syndicate',
      clients: ['Anon_77 Cell', 'ZeroByte Collective', 'Void_Syndicate Core', 'ShadowBroker 0day']
    },
    bounty: {
      name: 'Caçadores de Recompensas (Gray Hat)',
      color: '#f59e0b',
      badge: 'Recompensa',
      clients: ['Gabinete Federal de Saint Louis', 'Seguradora Phoenix Cyber', 'Clearing House Proteções']
    }
  };

  const PROCEDURAL_POOLS = {
    corporate: [
      {
        title: 'Auditoria de Vulnerabilidade e Log Cleanup',
        briefing: 'Nosso parceiro corporativo precisa de um pentest autorizado. Invada o terminal via SSH root e limpe a log de auditoria.',
        difficulty: 'easy',
        actions: [
          { id: 'break_pass', label: 'Quebrar senha de acesso root', done: false },
          { id: 'wipe_log', label: 'Limpar logs de acesso em /var/log/syslog', done: false }
        ],
        cash: 9500, btc: 0.015, rep: 35
      },
      {
        title: 'Desinfecção Forense de Servidor de Produção',
        briefing: 'Servidor corporativo foi infectado com malware espião. Acesse o sistema de arquivos e remova qualquer trojan ativo.',
        difficulty: 'medium',
        actions: [
          { id: 'break_pass', label: 'Infiltrar terminal remoto', done: false },
          { id: 'wipe_log', label: 'Apagar vestígios de invasão na log', done: false }
        ],
        cash: 18500, btc: 0.045, rep: 55
      }
    ],
    syndicate: [
      {
        title: 'Sabotagem de Mineradora Concorrente',
        briefing: 'Um cluster de mineração rival está operando na sub-rede. Infiltre o host, instale nosso minerador oculto e deixe nossa assinatura.',
        difficulty: 'hard',
        actions: [
          { id: 'break_pass', label: 'Quebrar firewall e senha root', done: false },
          { id: 'install_malware', label: 'Subir vírus Trojan Miner.vminer', done: false },
          { id: 'leave_taunt', label: 'Deixar aviso da guilda na log de eventos', done: false }
        ],
        cash: 34000, btc: 0.22, rep: 80
      },
      {
        title: 'Roubo de Chaves de Carteira Offshore',
        briefing: 'Vaze a lista de transações sigilosas de um cofre financeiro e apague o rastro para evitar o FBI.',
        difficulty: 'nightmare',
        actions: [
          { id: 'break_pass', label: 'Força-bruta na porta administrativa', done: false },
          { id: 'wipe_log', label: 'Deletar todos os registros de IP na log', done: false }
        ],
        cash: 62000, btc: 0.55, rep: 130
      }
    ],
    bounty: [
      {
        title: 'Caçada a Bot Zumbi Foragido',
        briefing: 'O servidor listado está propagando spam em massa. Mapeie as portas do alvo e execute ataque DDoS para neutralizar.',
        difficulty: 'medium',
        actions: [
          { id: 'port_scan', label: 'Escanear portas do servidor com PortScan', done: false },
          { id: 'ddos_takedown', label: 'Derrubar o alvo com ataque DDoS', done: false }
        ],
        cash: 22000, btc: 0.08, rep: 60
      },
      {
        title: 'Neutralização de Servidor C2 Hostil',
        briefing: 'Centro de comando e controle hostil identificado. Execute sobrecarga na rede e restaure a estabilidade.',
        difficulty: 'hard',
        actions: [
          { id: 'break_pass', label: 'Infiltrar sistema hostil', done: false },
          { id: 'ddos_takedown', label: 'Sobrecarga de banda e takedown', done: false }
        ],
        cash: 48000, btc: 0.35, rep: 95
      }
    ]
  };

  const MOCK_TARGETS = [
    { ip: '194.22.80.11', hostname: 'biohealth-srv01.corp.hc' },
    { ip: '200.112.5.90', hostname: 'crypto-rig04.under.hc' },
    { ip: '198.51.100.41', hostname: 'zombie-node-relay.net' },
    { ip: '185.190.22.88', hostname: 'omnicorp-edge-gateway.hc' },
    { ip: '10.110.1.18', hostname: 'nullbyte-workstation.hc' },
    { ip: '10.110.2.14', hostname: 'kuro-phantom-proxy.hc' }
  ];

  class DynamicContractsEngine {
    constructor() {
      this.contracts = [];
      this.activeContracts = [];
      this.activeTab = 'all'; // 'all' | 'corporate' | 'syndicate' | 'bounty'
      this.lastGeneratedAt = 0;
      this.init();
    }

    init() {
      this.loadFromStorage();
      if (this.contracts.length === 0) {
        this.generateContracts();
      }
    }

    storageKey() {
      const uid = (window.currentProfile && window.currentProfile.id) || 'guest';
      return `HC_DYNAMIC_CONTRACTS_${uid}`;
    }

    loadFromStorage() {
      try {
        const raw = localStorage.getItem(this.storageKey());
        if (raw) {
          const data = JSON.parse(raw);
          this.contracts = data.contracts || [];
          this.activeContracts = data.activeContracts || [];
          this.lastGeneratedAt = data.lastGeneratedAt || 0;
        }
      } catch (e) {}
    }

    saveToStorage() {
      try {
        localStorage.setItem(this.storageKey(), JSON.stringify({
          contracts: this.contracts,
          activeContracts: this.activeContracts,
          lastGeneratedAt: this.lastGeneratedAt
        }));
      } catch (e) {}
    }

    generateContracts(force = false) {
      const now = Date.now();
      if (!force && this.contracts.length > 0 && (now - this.lastGeneratedAt < 30 * 60 * 1000)) {
        return;
      }

      this.contracts = [];
      const factions = ['corporate', 'syndicate', 'bounty'];

      let idCounter = 1;
      factions.forEach((faction) => {
        const pool = PROCEDURAL_POOLS[faction];
        const fMeta = FACTION_DATA[faction];

        pool.forEach((tpl) => {
          const target = MOCK_TARGETS[Math.floor(Math.random() * MOCK_TARGETS.length)];
          const client = fMeta.clients[Math.floor(Math.random() * fMeta.clients.length)];

          this.contracts.push({
            id: `contract_${faction}_${Date.now()}_${idCounter++}`,
            faction,
            title: tpl.title,
            briefing: tpl.briefing,
            difficulty: tpl.difficulty,
            clientName: client,
            targetIp: target.ip,
            targetHostname: target.hostname,
            actions: JSON.parse(JSON.stringify(tpl.actions)),
            rewardCash: tpl.cash,
            rewardBtc: tpl.btc,
            reputationGain: tpl.rep,
            expiresAt: now + 45 * 60 * 1000 // 45 minutos de validade
          });
        });
      });

      this.lastGeneratedAt = now;
      this.saveToStorage();
    }

    acceptContract(contractId) {
      if (this.activeContracts.length >= 3) {
        if (window.showToast) window.showToast('Limite de 3 contratos ativos simultâneos atingido!', 'danger');
        return false;
      }

      const c = this.contracts.find((x) => x.id === contractId);
      if (!c) return false;

      // Move para ativos
      this.contracts = this.contracts.filter((x) => x.id !== contractId);
      this.activeContracts.push(JSON.parse(JSON.stringify(c)));
      this.saveToStorage();

      if (window.showToast) window.showToast(`📜 Contrato aceito: "${c.title}"! Alvo: ${c.targetIp}`, 'info');
      if (window.audioEngine && typeof window.audioEngine.playKeyClick === 'function') {
        window.audioEngine.playKeyClick();
      }

      this.renderUI();
      return true;
    }

    abandonContract(contractId) {
      this.activeContracts = this.activeContracts.filter((x) => x.id !== contractId);
      this.saveToStorage();
      if (window.showToast) window.showToast('Contrato cancelado.', 'warning');
      this.renderUI();
    }

    // Ouvinte de ações do jogo (invadiu, quebrou senha, apagou log, plantou malware)
    onGameAction(actionType, targetIp) {
      let anyProgress = false;

      this.activeContracts.forEach((contract) => {
        if (contract.targetIp === targetIp) {
          contract.actions.forEach((act) => {
            if (act.id === actionType && !act.done) {
              act.done = true;
              anyProgress = true;
            }
          });
        }
      });

      if (anyProgress) {
        this.saveToStorage();
        if (window.showToast) {
          window.showToast('🎯 Requisito de contrato cumprido no alvo!', 'success');
        }
        if (window.audioEngine && typeof window.audioEngine.playCashChime === 'function') {
          window.audioEngine.playCashChime();
        }
        this.renderUI();
      }
    }

    claimReward(contractId) {
      const idx = this.activeContracts.findIndex((x) => x.id === contractId);
      if (idx === -1) return;

      const c = this.activeContracts[idx];
      const allDone = c.actions.every((a) => a.done);
      if (!allDone) {
        if (window.showToast) window.showToast('Você ainda não concluiu todos os requisitos do contrato!', 'danger');
        return;
      }

      // Conclui e entrega prêmio
      this.activeContracts.splice(idx, 1);
      this.saveToStorage();

      // Credita em Dinheiro Sujo (contratos clandestinos da Darknet)
      if (!window.currentWallet) {
        window.currentWallet = { balance: 0 };
      }
      if (window.nineSystemsEngine && typeof window.nineSystemsEngine.addDirtyMoney === 'function') {
        window.nineSystemsEngine.addDirtyMoney(c.rewardCash, `Contrato Dinâmico (${c.title || 'Darknet'})`);
      } else {
        window.currentWallet.balance = +(parseFloat(window.currentWallet.balance || 0) + c.rewardCash).toFixed(2);
      }

      if (window.currentProfile) {
        window.currentProfile.wallet_balance = (window.currentProfile.wallet_balance || 0) + c.rewardCash;
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + c.reputationGain;
      }
      if (window.softwareEngine && typeof window.softwareEngine.addBitcoinBalance === 'function' && c.rewardBtc > 0) {
        window.softwareEngine.addBitcoinBalance(c.rewardBtc);
      }

      // RPC Supabase caso conectado
      if (window.supabaseClient) {
        try {
          window.supabaseClient.rpc('claim_dynamic_contract_reward', {
            p_contract_id: '00000000-0000-0000-0000-000000000001',
            p_user_id: window.currentProfile?.id || null
          });
        } catch (e) {}
      }

      if (window.audioEngine && typeof window.audioEngine.playCashChime === 'function') {
        window.audioEngine.playCashChime();
      }

      if (window.showToast) {
        window.showToast(
          `🎉 CONTRATO PAGO! Você recebeu ${fmtUsd(c.rewardCash)} + ${c.rewardBtc} BTC (+${c.reputationGain} REP)!`,
          'success'
        );
      }

      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
      return { success: true, payout: c.rewardCash, btc: c.rewardBtc, rep: c.reputationGain };
    }

    renderHtml() {
      const badgeClsMap = { corporate: 'info', syndicate: 'danger', bounty: 'warning' };

      const activeSection = this.activeContracts.length === 0
        ? `<div class="hc-card" style="text-align:center;color:var(--hc-text-3);font-size:13px;padding:16px;margin-bottom:14px;">
             Nenhum contrato aceito no momento. Escolha até 3 contratos simultâneos abaixo.
           </div>`
        : `
          <div style="margin-bottom:18px;">
            <div class="hc-eyebrow" style="margin-bottom:8px;">Contratos em andamento (${this.activeContracts.length}/3)</div>
            <div style="display:flex;flex-direction:column;gap:10px;">
              ${this.activeContracts.map((c) => {
                const fMeta = FACTION_DATA[c.faction] || { badge: 'Contrato' };
                const bCls = badgeClsMap[c.faction] || 'info';
                const allDone = c.actions.every((a) => a.done);

                return `
                  <div class="hc-card" style="border-color:${allDone ? 'var(--hc-success)' : 'var(--hc-border)'};">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
                      <div>
                        <span class="hc-badge ${bCls}">${esc(fMeta.badge)}</span>
                        <strong style="font-size:14.5px;margin-left:8px;color:var(--hc-text);">${esc(c.title)}</strong>
                        <div style="font-size:12.5px;color:var(--hc-text-2);margin-top:4px;">
                          Contratante: ${esc(c.clientName)} · Alvo: <code style="color:var(--hc-accent-text);cursor:pointer;" onclick="window.internetEngine.openIp('${esc(c.targetIp)}')">${esc(c.targetIp)}</code> (${esc(c.targetHostname)})
                        </div>
                      </div>
                      <div style="text-align:right;">
                        <strong class="mono" style="color:var(--hc-accent-text);font-size:14.5px;">${fmtUsd(c.rewardCash)}</strong>
                        <div class="mono" style="font-size:11.5px;color:var(--hc-text-3);">+${c.rewardBtc} BTC · +${c.reputationGain} REP</div>
                      </div>
                    </div>

                    <div style="margin:12px 0;padding:10px 12px;background:var(--hc-inset);border-radius:6px;border:1px solid var(--hc-border-subtle);">
                      <div class="hc-eyebrow" style="font-size:10px;margin-bottom:6px;">Etapas necessárias</div>
                      <div style="display:flex;flex-direction:column;gap:5px;">
                        ${c.actions.map((act) => `
                          <div style="font-size:12.5px;display:flex;align-items:center;gap:8px;color:${act.done ? 'var(--hc-accent-text)' : 'var(--hc-text)'};">
                            <span class="mono">${act.done ? '[✓]' : '[ ]'}</span>
                            <span style="${act.done ? 'text-decoration:line-through;opacity:0.8;' : ''}">${esc(act.label)}</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>

                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                      <button type="button" class="hc-btn sm" onclick="window.internetEngine.openIp('${esc(c.targetIp)}', 'invadir')">
                        Abrir alvo (${esc(c.targetIp)}) →
                      </button>
                      <div style="display:flex;gap:8px;">
                        ${allDone
                          ? `<button type="button" class="hc-btn primary sm" onclick="window.dynamicContractsEngine.claimReward('${esc(c.id)}')">Receber pagamento</button>`
                          : `<button type="button" class="hc-btn danger sm" onclick="window.dynamicContractsEngine.abandonContract('${esc(c.id)}')">Cancelar</button>`}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;

      const filtered = this.activeTab === 'all'
        ? this.contracts
        : this.contracts.filter((x) => x.faction === this.activeTab);

      const boardCards = filtered.length === 0
        ? `<div class="hc-card" style="padding:24px;text-align:center;color:var(--hc-text-3);font-size:13px;">Nenhum contrato disponível nesta aba.</div>`
        : filtered.map((c) => {
            const fMeta = FACTION_DATA[c.faction] || { badge: 'Contrato' };
            const bCls = badgeClsMap[c.faction] || 'info';
            return `
              <div class="hc-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:12px;">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span class="hc-badge ${bCls}">${esc(fMeta.badge)}</span>
                    <span class="mono" style="font-size:11px;color:var(--hc-text-3);">${esc(c.difficulty)}</span>
                  </div>
                  <strong style="color:var(--hc-text);font-size:14px;">${esc(c.title)}</strong>
                  <p style="font-size:12.5px;color:var(--hc-text-2);margin:6px 0 10px 0;line-height:1.45;">${esc(c.briefing)}</p>
                  <div style="font-size:12px;color:var(--hc-text-3);">
                    Alvo: <code style="color:var(--hc-accent-text);">${esc(c.targetIp)}</code> · ${esc(c.targetHostname)}
                  </div>
                </div>

                <div style="border-top:1px solid var(--hc-border-subtle);padding-top:10px;display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <strong class="mono" style="color:var(--hc-accent-text);font-size:14px;">${fmtUsd(c.rewardCash)}</strong>
                    <div class="mono" style="font-size:11px;color:var(--hc-text-3);">+${c.rewardBtc} BTC · +${c.reputationGain} REP</div>
                  </div>
                  <button type="button" class="hc-btn primary sm" onclick="window.dynamicContractsEngine.acceptContract('${esc(c.id)}')">
                    Aceitar
                  </button>
                </div>
              </div>
            `;
          }).join('');

      return `
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${activeSection}

          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;border-bottom:1px solid var(--hc-border);">
            <div class="hc-tabs" style="border-bottom:0;">
              <button type="button" class="hc-tab ${this.activeTab === 'all' ? 'active' : ''}" onclick="window.dynamicContractsEngine.activeTab='all';window.dynamicContractsEngine.renderUI();">
                Todos (${this.contracts.length})
              </button>
              <button type="button" class="hc-tab ${this.activeTab === 'corporate' ? 'active' : ''}" onclick="window.dynamicContractsEngine.activeTab='corporate';window.dynamicContractsEngine.renderUI();">
                Corporativo
              </button>
              <button type="button" class="hc-tab ${this.activeTab === 'syndicate' ? 'active' : ''}" onclick="window.dynamicContractsEngine.activeTab='syndicate';window.dynamicContractsEngine.renderUI();">
                Syndicate
              </button>
              <button type="button" class="hc-tab ${this.activeTab === 'bounty' ? 'active' : ''}" onclick="window.dynamicContractsEngine.activeTab='bounty';window.dynamicContractsEngine.renderUI();">
                Caçador
              </button>
            </div>
            <button type="button" class="hc-btn ghost sm" style="margin-bottom:6px;" onclick="window.dynamicContractsEngine.generateContracts(true);window.dynamicContractsEngine.renderUI();">
              Atualizar lista ↻
            </button>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;">
            ${boardCards}
          </div>
        </div>
      `;
    }

    renderUI() {
      const container = document.getElementById('contractsAppBody');
      if (container) {
        container.innerHTML = this.renderHtml();
      }
      // Se a janela de missões estiver aberta, atualiza também
      if (window.winManager && window.winManager.current === 'winMissions' && typeof window.renderMissionsWindow === 'function') {
        window.renderMissionsWindow();
      }
    }
  }

  window.dynamicContractsEngine = new DynamicContractsEngine();
})();
