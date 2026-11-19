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

      // Credita Saldo em Dólares
      if (!window.currentWallet) {
        window.currentWallet = { balance: 0 };
      }
      window.currentWallet.balance = +(parseFloat(window.currentWallet.balance || 0) + c.rewardCash).toFixed(2);

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
      const activeSection = this.activeContracts.length === 0
        ? `<div style="background:#0c1017;border:1px dashed #243144;border-radius:8px;padding:14px;text-align:center;color:#8e9db4;font-size:0.84rem;margin-bottom:18px;">
             Nenhum contrato ativo no momento. Aceite até 3 contratos procedurais abaixo!
           </div>`
        : `
          <div style="margin-bottom:20px;">
            <h4 style="margin:0 0 10px 0;font-size:0.92rem;color:#35b877;display:flex;align-items:center;gap:6px;">
              <span>⚡</span> SEUS CONTRATOS ATIVOS (${this.activeContracts.length}/3)
            </h4>
            <div style="display:flex;flex-direction:column;gap:10px;">
              ${this.activeContracts.map((c) => {
                const fMeta = FACTION_DATA[c.faction];
                const allDone = c.actions.every((a) => a.done);

                return `
                  <div style="background:#151c27;border:1px solid ${allDone ? '#35b877' : '#28374d'};border-radius:8px;padding:14px;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
                      <div>
                        <span style="font-size:0.75rem;padding:2px 8px;border-radius:4px;background:rgba(56,189,248,0.15);color:${fMeta.color};font-weight:bold;">${fMeta.badge}</span>
                        <strong style="font-size:0.95rem;margin-left:6px;color:#fff;">${esc(c.title)}</strong>
                        <div style="font-size:0.8rem;color:#94a3b8;margin-top:2px;">Cliente: ${esc(c.clientName)} · Alvo: <code style="color:#38bdf8;cursor:pointer;" onclick="window.internetEngine.openIp('${esc(c.targetIp)}')">${esc(c.targetIp)}</code> (${esc(c.targetHostname)})</div>
                      </div>
                      <div style="text-align:right;">
                        <strong style="color:#35b877;font-family:monospace;font-size:0.95rem;">${fmtUsd(c.rewardCash)}</strong>
                        <div style="font-size:0.76rem;color:#f59e0b;font-family:monospace;">+${c.rewardBtc} BTC · +${c.reputationGain} REP</div>
                      </div>
                    </div>

                    <div style="margin:12px 0 10px 0;padding:10px;background:#0d121a;border-radius:6px;border:1px solid #1f2a3a;">
                      <div style="font-size:0.76rem;color:#64748b;text-transform:uppercase;margin-bottom:6px;">Checklist de Requisitos:</div>
                      <div style="display:flex;flex-direction:column;gap:4px;">
                        ${c.actions.map((act) => `
                          <div style="font-size:0.82rem;display:flex;align-items:center;gap:6px;color:${act.done ? '#35b877' : '#cbd5e1'};">
                            <span>${act.done ? '✅' : '⬜'}</span>
                            <span style="${act.done ? 'text-decoration:line-through;opacity:0.85;' : ''}">${esc(act.label)}</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>

                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                      <button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('${esc(c.targetIp)}', 'invadir')">
                        Conectar ao Alvo (${esc(c.targetIp)}) →
                      </button>
                      <div style="display:flex;gap:8px;">
                        ${allDone
                          ? `<button type="button" class="hc-btn primary sm" onclick="window.dynamicContractsEngine.claimReward('${esc(c.id)}')">🎉 Coletar Recompensa</button>`
                          : `<button type="button" class="hc-btn ghost sm" style="color:#ef4444;border-color:#7f1d1d;" onclick="window.dynamicContractsEngine.abandonContract('${esc(c.id)}')">Abandonar</button>`}
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
        ? `<div style="padding:24px;text-align:center;color:#8e9db4;font-size:0.84rem;">Nenhum contrato nesta categoria agora. Novos contratos chegam a cada 45 minutos!</div>`
        : filtered.map((c) => {
            const fMeta = FACTION_DATA[c.faction];
            return `
              <div style="background:#111622;border:1px solid #233044;border-radius:8px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                    <span style="font-size:0.72rem;padding:2px 8px;border-radius:4px;background:rgba(56,189,248,0.12);color:${fMeta.color};font-weight:bold;">${fMeta.badge}</span>
                    <span style="font-size:0.72rem;color:#8e9db4;text-transform:uppercase;">Dif: <strong>${esc(c.difficulty)}</strong></span>
                  </div>
                  <strong style="color:#fff;font-size:0.92rem;">${esc(c.title)}</strong>
                  <div style="font-size:0.8rem;color:#94a3b8;margin:4px 0 8px 0;line-height:1.4;">${esc(c.briefing)}</div>
                  <div style="font-size:0.78rem;color:#cbd5e1;margin-bottom:10px;">
                    Alvo: <code style="color:#38bdf8;">${esc(c.targetIp)}</code> (${esc(c.targetHostname)})
                  </div>
                </div>

                <div style="border-top:1px solid #1e293b;padding-top:10px;display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <strong style="color:#35b877;font-family:monospace;font-size:0.95rem;">${fmtUsd(c.rewardCash)}</strong>
                    <div style="font-size:0.72rem;color:#f59e0b;font-family:monospace;">+${c.rewardBtc} BTC · +${c.reputationGain} REP</div>
                  </div>
                  <button type="button" class="hc-btn primary sm" onclick="window.dynamicContractsEngine.acceptContract('${esc(c.id)}')">
                    Aceitar Contrato
                  </button>
                </div>
              </div>
            `;
          }).join('');

      return `
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${activeSection}

          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;border-bottom:1px solid #28374d;padding-bottom:10px;">
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button type="button" class="hc-btn sm ${this.activeTab === 'all' ? 'primary' : 'ghost'}" onclick="window.dynamicContractsEngine.activeTab='all';window.dynamicContractsEngine.renderUI();">
                Todos os Contratos (${this.contracts.length})
              </button>
              <button type="button" class="hc-btn sm ${this.activeTab === 'corporate' ? 'primary' : 'ghost'}" onclick="window.dynamicContractsEngine.activeTab='corporate';window.dynamicContractsEngine.renderUI();">
                🏢 Corporativo (White Hat)
              </button>
              <button type="button" class="hc-btn sm ${this.activeTab === 'syndicate' ? 'primary' : 'ghost'}" onclick="window.dynamicContractsEngine.activeTab='syndicate';window.dynamicContractsEngine.renderUI();">
                🏴‍☠️ Syndicate (Black Hat)
              </button>
              <button type="button" class="hc-btn sm ${this.activeTab === 'bounty' ? 'primary' : 'ghost'}" onclick="window.dynamicContractsEngine.activeTab='bounty';window.dynamicContractsEngine.renderUI();">
                🎯 Caçador (Gray Hat)
              </button>
            </div>
            <button type="button" class="hc-btn ghost sm" onclick="window.dynamicContractsEngine.generateContracts(true);window.dynamicContractsEngine.renderUI();">
              Renovar Quadro Agora ↻
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
