/**
 * Hacker City // Árvore de Habilidades & Subclasses (Dual-Spec RPG)
 * Gerencia progressão de Pontos de Habilidade (SP), nós passivos,
 * catálogo de 11 subclasses de especialização e missões exclusivas.
 */

class SkillTreeEngine {
  constructor() {
    this.passiveSkills = {
      firewall_bypass: { 
        id: 'firewall_bypass', 
        name: 'Penetração de Firewalls', 
        max: 3, 
        cost: 1, 
        desc: '+10% de recompensa em dinheiro em todos os alvos por rank.' 
      },
      stealth_protocol: { 
        id: 'stealth_protocol', 
        name: 'Protocolo Camaleão', 
        max: 3, 
        cost: 1, 
        desc: '+15% de chance por rank de não gerar Heat policial ao invadir.' 
      },
      cpu_overclock: { 
        id: 'cpu_overclock', 
        name: 'Overclock de Instrução', 
        max: 3, 
        cost: 1, 
        desc: '-0.5s no cooldown de buffer entre comandos e invasões por rank.' 
      },
      botnet_boost: { 
        id: 'botnet_boost', 
        name: 'Sincronização Swarm', 
        max: 3, 
        cost: 1, 
        desc: '+15% de lucro por segundo na mineração da rede de bots zumbi por rank.' 
      },
      quick_wipe: { 
        id: 'quick_wipe', 
        name: 'Purga Relâmpago de Syslog', 
        max: 2, 
        cost: 1, 
        desc: 'Dobra a velocidade do rmlog e garante anulação de retaliações.' 
      }
    };

    this.subclasses = {
      sub_exploiter: {
        id: 'sub_exploiter',
        name: 'Sub-Infiltrador',
        cat: 'Exploits & 0-Days',
        bonus: '+15% velocidade de decodificação e invasão.',
        missionTitle: 'Missão: Invasão do Servidor de Arquivos da Prefeitura',
        missionDesc: 'Quebre a porta FTP e contorne o hash MD5 da folha de pagamento.',
        difficulty: 'Média',
        minRep: 150
      },
      sub_sentinel: {
        id: 'sub_sentinel',
        name: 'Sub-Sentinel',
        cat: 'Defesa & Evasão',
        bonus: '+15% de chance de mitigar Heat policial em qualquer ataque.',
        missionTitle: 'Missão: Interceptação do Pacote de Monitoramento',
        missionDesc: 'Contorne o monitoramento do provedor e destrua os logs de conexão.',
        difficulty: 'Média',
        minRep: 150
      },
      sub_botmaster: {
        id: 'sub_botmaster',
        name: 'Sub-Botmaster',
        cat: 'Swarm & Zumbis',
        bonus: '+20% de lucro passivo nos escravos da Botnet C2.',
        missionTitle: 'Missão: Recrutamento Forçado de Roteadores',
        missionDesc: 'Infecte 5 roteadores com firmware vulnerável para a Botnet.',
        difficulty: 'Fácil',
        minRep: 150
      },
      sub_carder: {
        id: 'sub_carder',
        name: 'Sub-Carder',
        cat: 'Engenharia Financeira',
        bonus: '+15% de lucro líquido em todas as invasões e transações.',
        missionTitle: 'Missão: Desvio de Lote em Gateway de Pagamento',
        missionDesc: 'Intercepte transações sem disparar o antifraude do banco.',
        difficulty: 'Média',
        minRep: 150
      },
      sub_scada: {
        id: 'sub_scada',
        name: 'Especialista SCADA & IoT',
        cat: 'Infraestrutura Urbana',
        bonus: '+40% de recompensa contra câmeras, totens, PDVs e semáforos.',
        missionTitle: 'Missão: Blackout nos Semáforos do Centro',
        missionDesc: 'Invada o controlador CLP de tráfego e crie uma onda verde permanente.',
        difficulty: 'Difícil',
        minRep: 250
      },
      sub_quantum: {
        id: 'sub_quantum',
        name: 'Criptógrafo Quântico',
        cat: 'Matemática & Criptoanálise',
        bonus: 'Reduz o tempo do hashcrack em 60% e destrava quebra de hashes SHA-512.',
        missionTitle: 'Missão: Decodificação do Cofre Militar QX-5',
        missionDesc: 'Quebre 3 chaves criptográficas em cadeia antes do tempo limite de 45s.',
        difficulty: 'Pesadelo',
        minRep: 350
      },
      sub_ghost: {
        id: 'sub_ghost',
        name: 'Fantasma de Rede (Proxy Ghost)',
        cat: 'Anonimato Absoluto',
        bonus: '+20 segundos de bônus em todo traceback e decaimento passivo de Heat.',
        missionTitle: 'Missão: Salto Quádruplo em Túnel Escuro',
        missionDesc: 'Passe por 4 proxies sem deixar um único pacote TCP visível nos firewalls.',
        difficulty: 'Extrema',
        minRep: 300
      },
      sub_social: {
        id: 'sub_social',
        name: 'Engenheiro Social (OSINT)',
        cat: 'Inteligência Humana',
        bonus: 'Revela portas vulneráveis e senhas fracas sem precisar de port scan.',
        missionTitle: 'Missão: Spear Phishing Corporativo',
        missionDesc: 'Obtenha as credenciais do diretor de TI da empresa de saneamento.',
        difficulty: 'Média',
        minRep: 200
      },
      sub_forensic: {
        id: 'sub_forensic',
        name: 'Forense Ofensivo (Reverse Engineer)',
        cat: 'Engenharia Reversa',
        bonus: 'Anula permanentemente 50% dos contra-ataques de bots defensores.',
        missionTitle: 'Missão: Desmontagem de Malware Governamental',
        missionDesc: 'Desmonte o binário ELF invasor e descubra a assinatura do criador.',
        difficulty: 'Difícil',
        minRep: 300
      },
      sub_redteam: {
        id: 'sub_redteam',
        name: 'Comandante Red Team',
        cat: 'Ataques em Enxame',
        bonus: '40% de chance de converter automaticamente qualquer servidor invadido em nó C2.',
        missionTitle: 'Missão: Invasão em Enxame contra CPD Central',
        missionDesc: 'Tome controle de 3 hosts da mesma sub-rede sem reiniciar os nós.',
        difficulty: 'Extrema',
        minRep: 400
      },
      sub_blackhat_finance: {
        id: 'sub_blackhat_finance',
        name: 'Operador Black Hat Finanças',
        cat: 'Economia Clandestina',
        bonus: 'Reduz as despesas e aluguel da Quitinete em 25% e zera taxas de P2P.',
        missionTitle: 'Missão: Lavagem em Offshore nas Ilhas Cayman',
        missionDesc: 'Escalone privilégios em banco offshore e transfira fundos sem retenção fiscal.',
        difficulty: 'Difícil',
        minRep: 250
      }
    };

    this.activeTab = 'passives';
    this.ranks = {};
    this.selectedSubclass = null;
    this.completedMissions = {};

    this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem('HC_SKILL_TREE');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.ranks = parsed.ranks || {};
        this.selectedSubclass = parsed.selectedSubclass || null;
        this.completedMissions = parsed.completedMissions || {};
      }
    } catch (e) {
      console.warn('Erro ao carregar árvore de habilidades:', e);
    }
  }

  save() {
    try {
      const payload = {
        ranks: this.ranks,
        selectedSubclass: this.selectedSubclass,
        completedMissions: this.completedMissions
      };
      localStorage.setItem('HC_SKILL_TREE', JSON.stringify(payload));
    } catch (e) {
      console.warn('Erro ao salvar árvore de habilidades:', e);
    }
  }

  getRank(skillId) {
    return this.ranks[skillId] || 0;
  }

  getSpentSP() {
    return Object.values(this.ranks).reduce((acc, cur) => acc + (cur || 0), 0);
  }

  getAvailableSP(reputation = 100) {
    const totalEarned = Math.floor(reputation / 50);
    return Math.max(0, totalEarned - this.getSpentSP());
  }

  getPlayerTitle(primarySpec = 'exploiter', reputation = 100) {
    const titles = {
      exploiter: [
        { minRep: 0, title: 'Infiltrador Novato' },
        { minRep: 250, title: 'Explorador de 0-Days' },
        { minRep: 600, title: 'Fantasma Infiltrador Cibernético' }
      ],
      sentinel: [
        { minRep: 0, title: 'Sentinela Iniciante' },
        { minRep: 250, title: 'Analista de Tráfego Clandestino' },
        { minRep: 600, title: 'Guardião Supremo do Core' }
      ],
      botmaster: [
        { minRep: 0, title: 'Operador de Zumbis' },
        { minRep: 250, title: 'Arquiteto de Botnet C2' },
        { minRep: 600, title: 'Senhor da Infecção Global' }
      ],
      carder: [
        { minRep: 0, title: 'Laranja de Dump' },
        { minRep: 250, title: 'Lavador de Criptoativos' },
        { minRep: 600, title: 'Barão das Finanças Sombrias' }
      ]
    };

    const list = titles[primarySpec] || titles.exploiter;
    let chosen = list[0].title;
    for (let i = list.length - 1; i >= 0; i--) {
      if (reputation >= list[i].minRep) {
        chosen = list[i].title;
        break;
      }
    }
    return chosen;
  }

  getFullBadge(primarySpec = 'exploiter', reputation = 100) {
    const primary = primarySpec.toUpperCase();
    if (this.selectedSubclass && this.subclasses[this.selectedSubclass]) {
      const sub = this.subclasses[this.selectedSubclass].name.replace('Sub-', '').toUpperCase();
      return `[${primary} // SUB: ${sub}]`;
    }
    return `[${primary}]`;
  }

  upgradePassive(skillId, reputation = 100) {
    const skill = this.passiveSkills[skillId];
    if (!skill) return { success: false, message: 'Habilidade não encontrada.' };

    const currentRank = this.getRank(skillId);
    if (currentRank >= skill.max) {
      return { success: false, message: 'Habilidade já está no nível máximo!' };
    }

    const available = this.getAvailableSP(reputation);
    if (available < skill.cost) {
      return { success: false, message: `Pontos de habilidade insuficientes! Necessário: ${skill.cost} SP (Disponível: ${available} SP).` };
    }

    this.ranks[skillId] = currentRank + 1;
    this.save();
    return { 
      success: true, 
      message: `[UPGRADE] ${skill.name} evoluído para Rank ${this.ranks[skillId]}/${skill.max}!` 
    };
  }

  selectSubclass(subId, reputation = 100, primarySpec = 'exploiter') {
    const sub = this.subclasses[subId];
    if (!sub) return { success: false, message: 'Subclasse inválida.' };

    // Evita escolher a mesma subclasse correspondente à primária
    const mapping = { exploiter: 'sub_exploiter', sentinel: 'sub_sentinel', botmaster: 'sub_botmaster', carder: 'sub_carder' };
    if (mapping[primarySpec] === subId) {
      return { success: false, message: 'Você já possui esta especialidade como Classe Primária!' };
    }

    if (reputation < sub.minRep) {
      return { success: false, message: `Reputação insuficiente! Exige ${sub.minRep} REP para desbloquear (Atual: ${reputation} REP).` };
    }

    this.selectedSubclass = subId;
    this.save();
    return {
      success: true,
      message: `[SUBCLASSE ATIVA] Especialização definida como: ${sub.name}! Bônus ativo.`
    };
  }

  completeMission(subId) {
    const sub = this.subclasses[subId];
    if (!sub) return { success: false, message: 'Missão não encontrada.' };

    this.completedMissions[subId] = true;
    this.save();
    return {
      success: true,
      repReward: 150,
      cashReward: 1000,
      message: `[MISSÃO CONSAGRADA] ${sub.missionTitle} concluída com êxito! (+150 REP | +$ 1000 HC)`
    };
  }

  renderUI(containerId, profile, wallet) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const rep = profile ? profile.reputation : 100;
    const primary = profile ? profile.specialty : 'exploiter';
    const sp = this.getAvailableSP(rep);
    const title = this.getPlayerTitle(primary, rep);

    let html = `
      <div class="skill-tree-layout">
        <!-- Header da Árvore -->
        <div class="tree-header-card">
          <div class="tree-title-group">
            <h2>🌳 ÁRVORE DE HABILIDADES // ESPECIALIZAÇÃO</h2>
            <div class="tree-title-badge">
              🎖️ TÍTULO: <strong>${title}</strong> &nbsp;|&nbsp; ${this.getFullBadge(primary, rep)}
            </div>
          </div>
          <div class="sp-counter-box">
            <div class="sp-counter-val">${sp} SP</div>
            <div class="sp-counter-label">Pontos Disponíveis</div>
          </div>
        </div>

        <!-- Abas -->
        <div class="skill-tabs">
          <button class="skill-tab-btn ${this.activeTab === 'passives' ? 'active' : ''}" onclick="window.skillTreeEngine.switchTab('passives', '${containerId}')">
            ⚡ HABILIDADES PASSIVAS
          </button>
          <button class="skill-tab-btn ${this.activeTab === 'subclasses' ? 'active' : ''}" onclick="window.skillTreeEngine.switchTab('subclasses', '${containerId}')">
            🧬 SUBCLASSES & DUAL-SPEC (${Object.keys(this.subclasses).length} DISPONÍVEIS)
          </button>
          <button class="skill-tab-btn ${this.activeTab === 'missions' ? 'active' : ''}" onclick="window.skillTreeEngine.switchTab('missions', '${containerId}')">
            🎯 MISSÕES EXCLUSIVAS
          </button>
        </div>
    `;

    if (this.activeTab === 'passives') {
      html += `<div class="passives-grid">`;
      Object.values(this.passiveSkills).forEach(s => {
        const r = this.getRank(s.id);
        const isMax = r >= s.max;
        const canBuy = !isMax && sp >= s.cost;

        html += `
          <div class="passive-node-card ${isMax ? 'maxed' : (r > 0 ? 'active-rank' : '')}">
            <div>
              <div class="passive-node-header">
                <span class="passive-name">${s.name}</span>
                <span class="passive-rank-badge ${isMax ? 'full' : ''}">RANK ${r}/${s.max}</span>
              </div>
              <div class="passive-desc">${s.desc}</div>
            </div>
            <div>
              ${isMax ? 
                `<button disabled class="btn-skill-upgrade" style="background:#1e293b;border-color:#334155;color:#10b981;">✓ NÍVEL MÁXIMO</button>` :
                `<button ${!canBuy ? 'disabled' : ''} onclick="buySkillUpgrade('${s.id}')" class="btn-skill-upgrade">
                  ${canBuy ? `APRIMORAR (-${s.cost} SP)` : (sp < s.cost ? 'SP INSUFICIENTE' : 'BLOQUEADO')}
                </button>`
              }
            </div>
          </div>
        `;
      });
      html += `</div>`;

    } else if (this.activeTab === 'subclasses') {
      html += `<div class="subclass-grid">`;
      const mapping = { exploiter: 'sub_exploiter', sentinel: 'sub_sentinel', botmaster: 'sub_botmaster', carder: 'sub_carder' };

      Object.values(this.subclasses).forEach(sub => {
        const isSelected = (this.selectedSubclass === sub.id);
        const isPrimary = (mapping[primary] === sub.id);
        const canUnlock = !isPrimary && rep >= sub.minRep;

        html += `
          <div class="subclass-card ${isSelected ? 'selected' : ''} ${isPrimary ? 'primary-locked' : ''}">
            <div>
              <div class="subclass-header">
                <div>
                  <div class="subclass-title">${sub.name}</div>
                  <div class="subclass-cat">${sub.cat}</div>
                </div>
                <div>
                  ${isPrimary ? '<span style="color:#94a3b8;font-size:0.75rem;">[CLASSE PRINCIPAL]</span>' : 
                    `<span style="font-family:'Fira Code';font-size:0.75rem;color:${rep >= sub.minRep ? '#10b981' : '#f43f5e'};">
                      ${rep >= sub.minRep ? '🟢 DESBLOQUEADO' : '🔒 EXIGE ' + sub.minRep + ' REP'}
                    </span>`
                  }
                </div>
              </div>

              <div class="subclass-bonus">
                <strong>Bônus de Subclasse:</strong> ${sub.bonus}
              </div>

              <div class="subclass-mission-box">
                <div class="subclass-mission-title">
                  <span>${sub.missionTitle}</span>
                  <span style="font-size:0.7rem;color:#f59e0b;">[${sub.difficulty.toUpperCase()}]</span>
                </div>
                <div class="subclass-mission-desc">${sub.missionDesc}</div>
              </div>
            </div>

            <div>
              ${isSelected ? 
                `<div class="btn-subclass-active">✓ SUBCLASSE ATIVA NO OPERADOR</div>` :
                (isPrimary ? 
                  `<button disabled class="btn-select-subclass" style="opacity:0.4;cursor:not-allowed;">CLASSE PRIMÁRIA ATIVA</button>` :
                  `<button ${!canUnlock ? 'disabled' : ''} onclick="chooseSubclass('${sub.id}')" class="btn-select-subclass" style="${!canUnlock ? 'opacity:0.4;cursor:not-allowed;' : ''}">
                    ${canUnlock ? 'ESPECIALIZAR NESTA SUBCLASSE' : 'REPUTAÇÃO INSUFICIENTE'}
                  </button>`
                )
              }
            </div>
          </div>
        `;
      });
      html += `</div>`;

    } else if (this.activeTab === 'missions') {
      html += `<div style="display:flex;flex-direction:column;gap:1rem;">`;
      Object.values(this.subclasses).forEach(sub => {
        const isCompleted = !!this.completedMissions[sub.id];
        const isCurrentSub = (this.selectedSubclass === sub.id);

        html += `
          <div style="background:#090d16;border:1px solid ${isCompleted ? 'var(--green-safe)' : (isCurrentSub ? '#a855f7' : '#1e293b')};border-radius:8px;padding:1rem;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-family:'Orbitron';font-size:0.95rem;color:#fff;margin-bottom:0.25rem;">
                ${sub.missionTitle} <span style="font-size:0.75rem;color:#f59e0b;">(${sub.difficulty})</span>
              </div>
              <div style="font-size:0.8rem;color:#94a3b8;margin-bottom:0.4rem;">${sub.missionDesc}</div>
              <div style="font-size:0.75rem;color:#38bdf8;">Subclasse Associada: <strong>${sub.name}</strong> (${sub.cat})</div>
            </div>

            <div>
              ${isCompleted ? 
                `<span style="color:var(--green-safe);font-family:'Orbitron';font-size:0.85rem;font-weight:bold;">✓ CONSAGRADA (+150 REP)</span>` :
                `<button onclick="executeSubclassMission('${sub.id}')" class="btn-skill-upgrade" style="width:auto;padding:0.5rem 1.25rem;background:linear-gradient(180deg,#7e22ce 0%,#581c87 100%);border-color:#a855f7;">
                  EXECUTAR MISSÃO
                </button>`
              }
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    html += `</div>`;
    el.innerHTML = html;
  }

  switchTab(tab, containerId) {
    this.activeTab = tab;
    if (typeof updateSkillTreeDisplay === 'function') {
      updateSkillTreeDisplay();
    }
  }
}

window.skillTreeEngine = new SkillTreeEngine();
