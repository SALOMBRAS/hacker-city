/**
 * Hacker City // Árvore de Habilidades, Cards de Classes & Missões (Dual-Spec RPG)
 * Gerencia progressão de Pontos de Habilidade (SP), dossiê das classes primárias,
 * cards de desbloqueio das 11 subclasses, execução interativa de missões e persistência.
 */

class SkillTreeEngine {
  constructor() {
    // 1. Dossiê Completo das 4 Classes Principais
    this.primaryClasses = {
      exploiter: {
        id: 'exploiter',
        name: 'Infiltrador',
        icon: '⚡',
        cat: 'Ofensivo // 0-Days',
        catBadge: 'EXPLOITS',
        lore: 'Especialista em invasões de impacto rápido, quebra brutal de senhas e injeção de exploits em firewalls corporativos.',
        benefits: [
          { label: 'Cooldown Ofensivo -25%', desc: 'Tempo de espera reduzido para 3.0s no PostgreSQL (contra 4.0s das demais classes).' },
          { label: 'Aceleração Hashcat +25%', desc: 'O utilitário hashcrack decodifica senhas com 25% mais velocidade no terminal.' },
          { label: 'Bypass de Port Scan', desc: 'Maior tolerância a falhas e velocidade ao explorar portas abertas em firewalls remotos.' }
        ],
        masteryMission: {
          title: 'Operação Zero-Day Municipal',
          targetHost: 'GATEWAY-PREFEITURA-01',
          targetIp: '192.168.10.1',
          difficulty: 'Tier 1 // Fácil',
          difficultyClass: 'diff-easy',
          briefing: 'Infiltre-se no gateway de entrada da administração municipal e injete a backdoor primária.',
          expectedPayload: 'INJECT_0DAY_PAYLOAD',
          rewards: { rep: 60, cash: 600 }
        }
      },
      sentinel: {
        id: 'sentinel',
        name: 'Cyber Sentinel',
        icon: '🛡️',
        cat: 'Defensivo // Evasão',
        catBadge: 'DEFESA',
        lore: 'Operador focado em camuflagem digital, neutralização de contra-rastreio e evasão contra a Polícia Federal.',
        benefits: [
          { label: 'Mitigação Policial Exata de 30%', desc: '30% de chance (random < 0.30) de anular 100% do ganho de Heat em qualquer hack.' },
          { label: 'Radar de Mandados', desc: 'Aviso visual e sonoro antecipado de aproximação de viaturas e batidas do Protocolo 404.' },
          { label: 'Blindagem contra Bots Defensores', desc: 'Menor probabilidade de sofrer retaliação ofensiva após invasões a hosts com defesas ativas.' }
        ],
        masteryMission: {
          title: 'Operação Escudo Cego',
          targetHost: 'HONEYPOT-POLICIA-FEDERAL',
          targetIp: '10.0.1.254',
          difficulty: 'Tier 1 // Fácil',
          difficultyClass: 'diff-easy',
          briefing: 'Detecte a armadilha do provedor da polícia, expurgue os rastros e desvie os pacotes de log.',
          expectedPayload: 'PURGE_TRACE_SIGNATURE',
          rewards: { rep: 60, cash: 600 }
        }
      },
      botmaster: {
        id: 'botmaster',
        name: 'Botmaster',
        icon: '🤖',
        cat: 'Swarm // Infecção C2',
        catBadge: 'BOTNET',
        lore: 'Comandante de enxames e redes de máquinas zumbis, operando mineração passiva em massa e ataques DDoS orquestrados.',
        benefits: [
          { label: 'Lucro Passivo Turbinado +30%', desc: 'Multiplicador de 1.3x em todo rendimento de criptomoedas gerado pelos nós da Botnet C2.' },
          { label: 'Capacidade de Enxame', desc: 'Estrutura otimizada para gerenciar até 210 bots determinísticos na rede de escravos.' },
          { label: 'Overclock Econômico', desc: 'Consumo de energia da Quitinete reduzido em 15% durante a mineração contínua.' }
        ],
        masteryMission: {
          title: 'Operação Enxame Alpha',
          targetHost: 'CLUSTER-ROUTER-NET',
          targetIp: '172.16.50.12',
          difficulty: 'Tier 2 // Médio',
          difficultyClass: 'diff-medium',
          briefing: 'Dissemine o malware zumbi em 3 roteadores vulneráveis e sincronize com a central C2.',
          expectedPayload: 'SWARM_SYNCHRONIZE_C2',
          rewards: { rep: 80, cash: 850 }
        }
      },
      carder: {
        id: 'carder',
        name: 'Cripto-Carder',
        icon: '💳',
        cat: 'Financeiro // Dark Web',
        catBadge: 'CARDING',
        lore: 'Mestre da lavagem de dinheiro, interceptação de pagamentos, extração de dumps financeiros e transações P2P blindadas.',
        benefits: [
          { label: 'Capital Inicial $750.00 HC', desc: 'Começa com saldo inicial aumentado na carteira (em vez dos $500.00 padrão).' },
          { label: 'Loot Financeiro +25%', desc: 'Gera 25% a mais de dinheiro líquido em cada transferência e contrato concluído.' },
          { label: 'Tumbling Clandestino', desc: 'Isenção de taxas bancárias ao converter saldo em carteiras de criptomoedas anônimas.' }
        ],
        masteryMission: {
          title: 'Operação Sangria em Gateway',
          targetHost: 'PAYMENT-GATEWAY-FIN',
          targetIp: '198.51.100.80',
          difficulty: 'Tier 2 // Médio',
          difficultyClass: 'diff-medium',
          briefing: 'Extraia lotes de transações sem acionar os gatilhos antifraude do mainframe bancário.',
          expectedPayload: 'BYPASS_FRAUD_TRIGGER',
          rewards: { rep: 90, cash: 1000 }
        }
      }
    };

    // 2. Nós Passivos Aprimoráveis com SP
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

    // 3. Catálogo das 11 Subclasses com Missões Exclusivas & Benefícios
    this.subclasses = {
      sub_exploiter: {
        id: 'sub_exploiter',
        name: 'Sub-Infiltrador',
        icon: '⚡',
        cat: 'Exploits & 0-Days',
        catBadge: 'OFENSIVO',
        detailedBenefits: [
          '+15% de aceleração em decodificação de senhas e injeção de scripts',
          '-10% na taxa de falha de invasões contra servidores corporativos',
          'Acesso antecipado ao catálogo de ferramentas de 0-Days no dark market'
        ],
        minRep: 150,
        mission: {
          title: 'Operação Shadow Bypass',
          targetHost: 'PREFEITURA-STORAGE-01',
          targetIp: '192.168.10.88',
          difficulty: 'Tier 2 // Médio',
          difficultyClass: 'diff-medium',
          briefing: 'Contorne o firewall de aplicação da prefeitura e baixe o dump de credenciais sem disparar o alarme de intrusão.',
          expectedPayload: 'OVERRIDE_AUTH_TOKEN',
          rewards: { rep: 120, cash: 1800, badge: 'EXPLOIT 0-DAY V1' }
        }
      },
      sub_sentinel: {
        id: 'sub_sentinel',
        name: 'Sub-Sentinel',
        icon: '🛡️',
        cat: 'Defesa & Evasão',
        catBadge: 'DEFESA',
        detailedBenefits: [
          '+15% de mitigação residual adicional de Heat em todas as operações',
          '+5 segundos de tempo extra de tolerância em rastreamentos policiais',
          'Reduz pela metade o custo de formatação do HD no Protocolo 404'
        ],
        minRep: 150,
        mission: {
          title: 'Operação Escudo Cego',
          targetHost: 'POLICIA-INVESTIGATIVE-NODE',
          targetIp: '10.0.12.99',
          difficulty: 'Tier 2 // Médio',
          difficultyClass: 'diff-medium',
          briefing: 'Intercepte o pacote de monitoramento do provedor e apague remotamente o histórico de IPs atribuídos ao seu modem.',
          expectedPayload: 'NULL_ROUTE_ISP_TRACER',
          rewards: { rep: 130, cash: 1600, badge: 'FIREWALL DEFENSOR V2' }
        }
      },
      sub_botmaster: {
        id: 'sub_botmaster',
        name: 'Sub-Botmaster',
        icon: '🤖',
        cat: 'Swarm & Zumbis',
        catBadge: 'BOTNET',
        detailedBenefits: [
          '+20% no rendimento financeiro da Botnet em todos os modos C2',
          '+5 slots adicionais para escravizar novos servidores zumbis',
          'Taxa reduzida de perda de bots por reboots automáticos'
        ],
        minRep: 150,
        mission: {
          title: 'Operação Enxame Zumbi',
          targetHost: 'CLUSTER-ROUTER-SWARM',
          targetIp: '172.16.80.0/24',
          difficulty: 'Tier 3 // Difícil',
          difficultyClass: 'diff-hard',
          briefing: 'Explore a vulnerabilidade CVE-2026-MIPS em lote e anexe 10 roteadores comerciais à sua central C2.',
          expectedPayload: 'HIJACK_IOT_CLUSTER',
          rewards: { rep: 150, cash: 2400, badge: 'CHAVE MESTRA C2' }
        }
      },
      sub_carder: {
        id: 'sub_carder',
        name: 'Sub-Carder',
        icon: '💳',
        cat: 'Engenharia Financeira',
        catBadge: 'FINANCEIRO',
        detailedBenefits: [
          '+15% de lucro financeiro líquido em todas as transferências bancárias',
          'Elimina a retenção de transferências no banco clandestino',
          'Gera juros passivos de 2% ao dia sobre o saldo guardado no banco'
        ],
        minRep: 150,
        mission: {
          title: 'Operação Sangria Offshore',
          targetHost: 'SWISS-BANKING-GATEWAY',
          targetIp: '193.134.20.10',
          difficulty: 'Tier 3 // Difícil',
          difficultyClass: 'diff-hard',
          briefing: 'Desvie um lote de ordens de pagamento internacionais através de uma conta fantasma blindada.',
          expectedPayload: 'DIVERT_SWIFT_TRANSFER',
          rewards: { rep: 140, cash: 3500, badge: 'CRYPTO TUMBLER PRO' }
        }
      },
      sub_scada: {
        id: 'sub_scada',
        name: 'Especialista SCADA & IoT',
        icon: '🏭',
        cat: 'Infraestrutura Urbana',
        catBadge: 'HARDWARE / IOT',
        detailedBenefits: [
          '+40% de recompensa em dinheiro em semáforos, totens, PDVs e CLPs',
          'Destrava o comando de desligamento temporário da grade de energia urbana',
          'Infiltração imediata sem necessidade de quebra prévia de senhas em portas Modbus 502'
        ],
        minRep: 250,
        mission: {
          title: 'Blackout na Subestação Norte',
          targetHost: 'SUBESTACAO-CLP-GRID-04',
          targetIp: '10.0.84.12',
          difficulty: 'Tier 4 // Muito Alto',
          difficultyClass: 'diff-veryhard',
          briefing: 'Acesse o controlador lógico programável (CLP) da subestação metropolitana e execute um override na grade de distribuição.',
          expectedPayload: 'OVERRIDE_PLC_GRID',
          rewards: { rep: 220, cash: 4800, badge: 'DONGLE PLC INDUSTRIAL' }
        }
      },
      sub_quantum: {
        id: 'sub_quantum',
        name: 'Criptógrafo Quântico',
        icon: '⚛️',
        cat: 'Criptoanálise',
        catBadge: 'MATEMÁTICA',
        detailedBenefits: [
          '-60% no tempo de decodificação de senhas em qualquer hash',
          'Habilita a decodificação de hashes complexos como SHA-512, bcrypt e Argon2',
          'Gera chaves RSA de 4096 bits para criptografar o canal C2 da Botnet'
        ],
        minRep: 350,
        mission: {
          title: 'Arca Criptográfica da NSA',
          targetHost: 'QUANTUM-STORAGE-ARRAY',
          targetIp: '198.18.0.42',
          difficulty: 'Tier 5 // Extremo',
          difficultyClass: 'diff-extreme',
          briefing: 'Desmonte o anel de criptografia quântica assimétrica de um servidor governamental confidencial.',
          expectedPayload: 'FACTORIZE_QUANTUM_CORE',
          rewards: { rep: 300, cash: 6200, badge: 'QUANTUM RIG UPGRADE' }
        }
      },
      sub_ghost: {
        id: 'sub_ghost',
        name: 'Fantasma de Rede (Proxy Ghost)',
        icon: '👻',
        cat: 'Anonimato Absoluto',
        catBadge: 'CAMUFLAGEM',
        detailedBenefits: [
          '+20 segundos de bônus em todo traceback durante invasões ativas',
          'Decaimento passivo contínuo de Heat de 2% a cada 10 segundos fora de combate',
          'Imunidade contra scans de sniffing de IPs da rede externa'
        ],
        minRep: 300,
        mission: {
          title: 'Infiltração nos Satélites Skynet',
          targetHost: 'ORBITAL-SAT-RELAY-09',
          targetIp: '100.64.250.7',
          difficulty: 'Tier 3 // Difícil',
          difficultyClass: 'diff-hard',
          briefing: 'Efetue um salto quadruplo de proxies encadeados em estações repetidoras de satélite para ocultar seu uplink.',
          expectedPayload: 'CHAIN_GHOST_PROXIES',
          rewards: { rep: 180, cash: 3200, badge: 'TUNELADOR GHOST VPN' }
        }
      },
      sub_social: {
        id: 'sub_social',
        name: 'Engenheiro Social (OSINT)',
        icon: '🎭',
        cat: 'Inteligência Humana',
        catBadge: 'OSINT',
        detailedBenefits: [
          'Revela portas vulneráveis e senhas fracas de alvos sem necessidade de executar nmap',
          'Desconto de 30% em compras de 0-days no Dark Market através de contatos humanos',
          'Chance de 20% de alvos corporativos fornecerem o dump completo sem combate'
        ],
        minRep: 200,
        mission: {
          title: 'Doxxing do Delegado Cibernético',
          targetHost: 'INTERPOL-DOSSIER-SRV',
          targetIp: '194.105.140.22',
          difficulty: 'Tier 4 // Muito Alto',
          difficultyClass: 'diff-veryhard',
          briefing: 'Conduza uma campanha cirúrgica de spear-phishing e extraia a credencial mestra de acesso restrito da diretoria.',
          expectedPayload: 'EXTRACTION_OSINT_DOSSIER',
          rewards: { rep: 210, cash: 4500, badge: 'DOSSIÊ CONFIDENCIAL' }
        }
      },
      sub_forensic: {
        id: 'sub_forensic',
        name: 'Forense Ofensivo (Reverse Eng.)',
        icon: '🔬',
        cat: 'Engenharia Reversa',
        catBadge: 'FORENSE',
        detailedBenefits: [
          'Anula permanentemente 50% dos contra-ataques de bots defensores de sistemas',
          'Desmonta automaticamente malwares e trojans para reverter em créditos HC',
          'Permite criar payloads customizados para furar defesas de alto nível'
        ],
        minRep: 300,
        mission: {
          title: 'Dissecação do Malware Stuxnet',
          targetHost: 'MILITARY-SANDBOX-LAB',
          targetIp: '192.0.2.199',
          difficulty: 'Tier 4 // Muito Alto',
          difficultyClass: 'diff-veryhard',
          briefing: 'Descompile o binário ELF armado no laboratório isolado e isole a assinatura de controle ofensivo.',
          expectedPayload: 'DISSECT_BINARY_PAYLOAD',
          rewards: { rep: 200, cash: 4200, badge: 'DESCOMPILADOR PRO' }
        }
      },
      sub_redteam: {
        id: 'sub_redteam',
        name: 'Comandante Red Team',
        icon: '🎖️',
        cat: 'Ataques em Enxame',
        catBadge: 'RED TEAM',
        detailedBenefits: [
          '40% de chance de converter automaticamente qualquer host hackeado em escravo zumbi da Botnet',
          '+15% de poder destrutivo em comandos de sobrecarga DDoS',
          'Bônus de reputação em cadeia ao invadir múltiplos nós da mesma rede'
        ],
        minRep: 400,
        mission: {
          title: 'Tomada do Datacenter Militar',
          targetHost: 'DEFENSE-CORE-DATACENTER',
          targetIp: '203.0.113.55',
          difficulty: 'Tier 5 // Extremo',
          difficultyClass: 'diff-extreme',
          briefing: 'Lidere um ataque coordenado contra o mainframe central das forças de defesa e implante uma raiz persistente.',
          expectedPayload: 'REDTEAM_ROOT_TAKEOVER',
          rewards: { rep: 350, cash: 7000, badge: 'SATÉLITE RED TEAM' }
        }
      },
      sub_blackhat_finance: {
        id: 'sub_blackhat_finance',
        name: 'Operador Black Hat Finanças',
        icon: '💰',
        cat: 'Economia Clandestina',
        catBadge: 'BLACK HAT',
        detailedBenefits: [
          'Reduz as contas e o aluguel da Quitinete em 25% através de fraudes nas faturas',
          'Zera completamente qualquer taxa de intermediação em transferências P2P',
          'Imunidade contra congelamento de ativos bancários decretado pela justiça'
        ],
        minRep: 250,
        mission: {
          title: 'Lavagem da Carteira Silk Road',
          targetHost: 'CRYPTO-OFFSHORE-VAULT',
          targetIp: '198.51.100.222',
          difficulty: 'Tier 5 // Extremo',
          difficultyClass: 'diff-extreme',
          briefing: 'Infiltre-se no cofre de custódia judicial, destrave fundos congelados e misture o montante em 20 pools anônimos.',
          expectedPayload: 'CLEANSE_TUMBLED_CRYPTO',
          rewards: { rep: 280, cash: 8500, badge: 'CONTA OFFSHORE BLINDADA' }
        }
      }
    };

    this.activeTab = 'subclasses'; // Inicia na aba de subclasses com cards de desbloqueio
    this.ranks = {};
    this.selectedSubclass = null;
    this.unlockedSubclasses = {};
    this.completedMissions = {};
    this.activeMission = null;

    this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem('HC_SKILL_TREE');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.ranks = parsed.ranks || {};
        this.selectedSubclass = parsed.selectedSubclass || null;
        this.unlockedSubclasses = parsed.unlockedSubclasses || {};
        this.completedMissions = parsed.completedMissions || {};

        // Se o jogador já tinha uma subclasse selecionada no passado, garante que está marcada como desbloqueada
        if (this.selectedSubclass) {
          this.unlockedSubclasses[this.selectedSubclass] = true;
        }
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
        unlockedSubclasses: this.unlockedSubclasses,
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

  startMission(subId) {
    const sub = this.subclasses[subId];
    if (!sub) return { success: false, message: 'Subclasse inválida.' };
    this.activeMission = subId;
    return { success: true, message: `[MISSÃO INICIADA] Conectando ao alvo ${sub.mission.targetHost} (${sub.mission.targetIp})...` };
  }

  closeMissionRunner() {
    this.activeMission = null;
  }

  completeMission(subId) {
    const sub = this.subclasses[subId];
    if (!sub) return { success: false, message: 'Missão não encontrada.' };

    this.completedMissions[subId] = true;
    this.unlockedSubclasses[subId] = true;
    this.activeMission = null;
    this.save();

    const m = sub.mission;
    return {
      success: true,
      repReward: m.rewards.rep || 150,
      cashReward: m.rewards.cash || 1000,
      badge: m.rewards.badge || 'CONQUISTA RPG',
      message: `[MISSÃO CUMPRIDA] ${m.title} finalizada com sucesso! Subclasse ${sub.name} desbloqueada (+${m.rewards.rep} REP | +$ ${m.rewards.cash} HC)!`
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

    // Verifica se a subclasse foi desbloqueada através de sua missão (ou reputação direta em legado)
    const isUnlocked = !!this.unlockedSubclasses[subId] || (reputation >= sub.minRep && !!this.completedMissions[subId]);
    if (!isUnlocked) {
      if (reputation < sub.minRep) {
        return { success: false, message: `Reputação insuficiente! Exige ${sub.minRep} REP para habilitar o teste de desbloqueio.` };
      }
      return { success: false, message: `Subclasse bloqueada! Você precisa primeiro cumprir a missão "${sub.mission.title}" para desbloqueá-la.` };
    }

    this.selectedSubclass = subId;
    this.save();
    return {
      success: true,
      message: `[SUBCLASSE EQUIPADA] Especialização ativa definida como: ${sub.name}!`
    };
  }

  switchTab(tab, containerId) {
    this.activeTab = tab;
    if (typeof updateSkillTreeDisplay === 'function') {
      updateSkillTreeDisplay();
    }
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
        <!-- Header da Árvore de Especialização -->
        <div class="tree-header-card">
          <div class="tree-title-group">
            <h2>🌳 ÁRVORE DE ESPECIALIZAÇÃO // DUAL-SPEC RPG</h2>
            <div class="tree-title-badge">
              🎖️ TÍTULO: <strong>${title}</strong> &nbsp;|&nbsp; ${this.getFullBadge(primary, rep)}
            </div>
          </div>
          <div class="sp-counter-box">
            <div class="sp-counter-val">${sp} SP</div>
            <div class="sp-counter-label">Pontos de Habilidade</div>
          </div>
        </div>

        <!-- Abas de Navegação -->
        <div class="skill-tabs">
          <button class="skill-tab-btn ${this.activeTab === 'subclasses' ? 'active' : ''}" onclick="window.skillTreeEngine.switchTab('subclasses', '${containerId}')">
            🧬 SUBCLASSES & CARDS DE DESBLOQUEIO (${Object.keys(this.subclasses).length})
          </button>
          <button class="skill-tab-btn ${this.activeTab === 'primary' ? 'active' : ''}" onclick="window.skillTreeEngine.switchTab('primary', '${containerId}')">
            👑 CLASSES PRINCIPAIS & MAESTRIA (4)
          </button>
          <button class="skill-tab-btn ${this.activeTab === 'passives' ? 'active' : ''}" onclick="window.skillTreeEngine.switchTab('passives', '${containerId}')">
            ⚡ ÁRVORE DE PASSIVAS (SP)
          </button>
          <button class="skill-tab-btn ${this.activeTab === 'missions' ? 'active' : ''}" onclick="window.skillTreeEngine.switchTab('missions', '${containerId}')">
            🎯 HISTÓRICO DE MISSÕES
          </button>
        </div>
    `;

    // 1. ABA DE SUBCLASSES COM CARDS DE DESBLOQUEIO E MISSÕES
    if (this.activeTab === 'subclasses') {
      html += `<div class="subclass-unlock-grid">`;
      const mapping = { exploiter: 'sub_exploiter', sentinel: 'sub_sentinel', botmaster: 'sub_botmaster', carder: 'sub_carder' };

      Object.values(this.subclasses).forEach(sub => {
        const isEquipped = (this.selectedSubclass === sub.id);
        const isPrimaryMatch = (mapping[primary] === sub.id);
        const isCompleted = !!this.completedMissions[sub.id];
        const isUnlocked = !!this.unlockedSubclasses[sub.id] || isCompleted;
        const meetsRep = (rep >= sub.minRep);

        let cardState = 'locked-req';
        let statusBadge = '';

        if (isPrimaryMatch) {
          cardState = 'primary-base';
          statusBadge = `<span class="unlock-status-badge status-badge-primary-base">👑 SUA CLASSE BASE</span>`;
        } else if (isEquipped) {
          cardState = 'equipped';
          statusBadge = `<span class="unlock-status-badge status-badge-equipped">🟢 EQUIPADA NO OPERADOR</span>`;
        } else if (isUnlocked) {
          cardState = 'unlocked';
          statusBadge = `<span class="unlock-status-badge status-badge-unlocked">🔓 DESBLOQUEADA</span>`;
        } else if (meetsRep) {
          cardState = 'ready-mission';
          statusBadge = `<span class="unlock-status-badge status-badge-ready">⚡ MISSÃO DISPONÍVEL</span>`;
        } else {
          cardState = 'locked-req';
          statusBadge = `<span class="unlock-status-badge status-badge-locked">🔒 EXIGE ${sub.minRep} REP</span>`;
        }

        html += `
          <div class="subclass-unlock-card ${cardState}">
            <div>
              <div class="card-top-bar">
                <div class="card-title-group">
                  <span class="card-spec-icon">${sub.icon}</span>
                  <div>
                    <div class="card-spec-name">${sub.name}</div>
                    <span class="card-category-pill">${sub.cat}</span>
                  </div>
                </div>
                <div>${statusBadge}</div>
              </div>

              <!-- Seção de Benefícios da Subclasse -->
              <div class="benefits-section">
                <div class="benefits-title">
                  <span>✦ BÔNUS & BENEFÍCIOS OPERACIONAIS</span>
                </div>
                <ul class="benefits-list">
                  ${sub.detailedBenefits.map(b => `
                    <li class="benefit-item">
                      <span class="benefit-bullet">✓</span>
                      <span class="benefit-desc">${b}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>

              <!-- Card da Missão de Desbloqueio -->
              <div class="mission-contract-card ${isCompleted ? 'completed' : ''}">
                <div class="mission-contract-header">
                  <span class="mission-contract-title">
                    🎯 ${sub.mission.title}
                  </span>
                  <span class="mission-difficulty-pill ${sub.mission.difficultyClass}">
                    ${sub.mission.difficulty}
                  </span>
                </div>
                <div class="mission-contract-target">
                  ALVO: <strong>${sub.mission.targetHost}</strong> (${sub.mission.targetIp})
                </div>
                <div class="mission-contract-desc">
                  ${sub.mission.briefing}
                </div>
                <div class="mission-contract-rewards">
                  <span>RECOMPENSA: +$ ${sub.mission.rewards.cash} HC &nbsp;|&nbsp; +${sub.mission.rewards.rep} REP &nbsp;|&nbsp; 🏅 ${sub.mission.rewards.badge}</span>
                </div>
              </div>
            </div>

            <!-- Botões de Ação do Card -->
            <div>
              ${isEquipped ? `
                <button disabled class="btn-card-action btn-equipped-locked">
                  ✓ SUBCLASSE EQUIPADA & ATIVA
                </button>
              ` : (isPrimaryMatch ? `
                <button disabled class="btn-card-action btn-disabled-locked">
                  CLASSE PRIMÁRIA ATIVA (NÃO PODE SER SUB)
                </button>
              ` : (isUnlocked ? `
                <button onclick="window.skillTreeEngine.handleEquipSubclass('${sub.id}')" class="btn-card-action btn-equip-subclass">
                  ⚡ EQUIPAR SUBCLASSE
                </button>
              ` : (!meetsRep ? `
                <button disabled class="btn-card-action btn-disabled-locked">
                  🔒 REPUTAÇÃO INSUFICIENTE (EXIGE ${sub.minRep} REP)
                </button>
              ` : `
                <button onclick="window.skillTreeEngine.handleStartMission('${sub.id}')" class="btn-card-action btn-start-mission">
                  🚀 INICIAR MISSÃO DE DESBLOQUEIO
                </button>
              `)))}
            </div>
          </div>
        `;
      });
      html += `</div>`;

    // 2. ABA DE CLASSES PRINCIPAIS & MAESTRIA
    } else if (this.activeTab === 'primary') {
      html += `<div class="primary-classes-grid">`;
      Object.values(this.primaryClasses).forEach(pc => {
        const isCurrent = (primary === pc.id);

        html += `
          <div class="primary-class-card ${isCurrent ? 'active-primary' : ''}">
            <div>
              <div class="primary-card-header">
                <div class="primary-title-wrap">
                  <span class="primary-icon">${pc.icon}</span>
                  <div>
                    <div class="primary-class-name">${pc.name}</div>
                    <span class="primary-cat-badge">${pc.cat}</span>
                  </div>
                </div>
                <div>
                  <span class="primary-status-pill ${isCurrent ? 'equipped' : 'inactive'}">
                    ${isCurrent ? '🟢 SUA CLASSE PRINCIPAL' : '⚪ NÃO SELECIONADA'}
                  </span>
                </div>
              </div>

              <div class="primary-lore">${pc.lore}</div>

              <!-- Benefícios da Classe Principal -->
              <div class="benefits-section">
                <div class="benefits-title">
                  <span>✦ BÔNUS PASSIVOS DESTA CLASSE</span>
                </div>
                <ul class="benefits-list">
                  ${pc.benefits.map(b => `
                    <li class="benefit-item">
                      <span class="benefit-bullet">✓</span>
                      <div>
                        <span class="benefit-label">${b.label}:</span>
                        <span class="benefit-desc"> ${b.desc}</span>
                      </div>
                    </li>
                  `).join('')}
                </ul>
              </div>

              <!-- Missão de Maestria da Classe Principal -->
              <div class="mission-contract-card">
                <div class="mission-contract-header">
                  <span class="mission-contract-title">
                    🎯 PROVA DE MAESTRIA: ${pc.masteryMission.title}
                  </span>
                  <span class="mission-difficulty-pill ${pc.masteryMission.difficultyClass}">
                    ${pc.masteryMission.difficulty}
                  </span>
                </div>
                <div class="mission-contract-target">
                  ALVO: <strong>${pc.masteryMission.targetHost}</strong> (${pc.masteryMission.targetIp})
                </div>
                <div class="mission-contract-desc">${pc.masteryMission.briefing}</div>
                <div class="mission-contract-rewards">
                  <span>RECOMPENSA: ${pc.masteryMission.rewards.cash ? '+$ ' + pc.masteryMission.rewards.cash + ' HC | +' + pc.masteryMission.rewards.rep + ' REP' : 'Consagração de Operador'}</span>
                </div>
              </div>
            </div>

            <div>
              ${isCurrent ? `
                <div class="btn-card-action btn-equipped-locked" style="text-align:center;">
                  ✓ OPERADOR ATIVO NESTA ESPECIALIDADE
                </div>
              ` : `
                <div class="btn-card-action btn-disabled-locked" style="text-align:center;font-size:0.75rem;">
                  CLASSE DEFINIDA NO CADASTRO DO SUPABASE
                </div>
              `}
            </div>
          </div>
        `;
      });
      html += `</div>`;

    // 3. ABA DE HABILIDADES PASSIVAS & SP
    } else if (this.activeTab === 'passives') {
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
                `<button disabled class="btn-skill-upgrade" style="background:#1e293b;border-color:#334155;color:#10b981;">✓ NÍVEL MÁXIMO ATINGIDO</button>` :
                `<button ${!canBuy ? 'disabled' : ''} onclick="buySkillUpgrade('${s.id}')" class="btn-skill-upgrade">
                  ${canBuy ? `APRIMORAR (-${s.cost} SP)` : (sp < s.cost ? 'SP INSUFICIENTE' : 'BLOQUEADO')}
                </button>`
              }
            </div>
          </div>
        `;
      });
      html += `</div>`;

    // 4. ABA DE HISTÓRICO DE MISSÕES
    } else if (this.activeTab === 'missions') {
      html += `<div style="display:flex;flex-direction:column;gap:1rem;">`;
      const completedList = Object.keys(this.completedMissions);

      if (completedList.length === 0) {
        html += `
          <div style="text-align:center;padding:3rem;background:#090d16;border:1px dashed #334155;border-radius:8px;">
            <div style="font-size:2.5rem;margin-bottom:0.75rem;">📂</div>
            <div style="font-family:'Orbitron';color:#fff;font-size:1.1rem;margin-bottom:0.5rem;">NENHUMA MISSÃO DE DESBLOQUEIO CONCLUÍDA</div>
            <div style="color:#94a3b8;font-size:0.85rem;max-width:500px;margin:0 auto;">
              Navegue até a aba <strong>"SUBCLASSES & CARDS DE DESBLOQUEIO"</strong>, atinja a reputação mínima requerida e inicie os testes para habilitar novas classes!
            </div>
          </div>
        `;
      } else {
        completedList.forEach(subId => {
          const sub = this.subclasses[subId];
          if (!sub) return;
          html += `
            <div style="background:#090d16;border:1px solid var(--green-safe);border-radius:8px;padding:1rem;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-family:'Orbitron';font-size:0.95rem;color:#fff;margin-bottom:0.25rem;">
                  ✓ ${sub.mission.title} <span style="font-size:0.75rem;color:#10b981;">[${sub.mission.difficulty}]</span>
                </div>
                <div style="font-size:0.8rem;color:#94a3b8;margin-bottom:0.3rem;">${sub.mission.briefing}</div>
                <div style="font-size:0.75rem;color:#38bdf8;">Subclasse Desbloqueada: <strong>${sub.name}</strong> (${sub.cat})</div>
              </div>
              <div style="text-align:right;">
                <span style="color:var(--green-safe);font-family:'Orbitron';font-size:0.85rem;font-weight:bold;">CONSAGRADA</span>
                <div style="font-size:0.72rem;color:#94a3b8;margin-top:0.2rem;">+$ ${sub.mission.rewards.cash} HC &nbsp;|&nbsp; +${sub.mission.rewards.rep} REP</div>
              </div>
            </div>
          `;
        });
      }
      html += `</div>`;
    }

    // 5. MODAL INTERATIVO DE EXECUÇÃO DE MISSÃO (SE HOUVER UMA ATIVA)
    if (this.activeMission && this.subclasses[this.activeMission]) {
      const activeSub = this.subclasses[this.activeMission];
      const m = activeSub.mission;

      html += `
        <div class="mission-runner-overlay" id="missionRunnerOverlay">
          <div class="mission-runner-terminal">
            <div class="runner-terminal-header">
              <div class="runner-terminal-title">
                <span>🎯 TESTE DE HABILITAÇÃO: ${m.title}</span>
                <span class="mission-difficulty-pill ${m.difficultyClass}">${m.difficulty}</span>
              </div>
              <button class="btn-runner-close" onclick="window.skillTreeEngine.handleCloseMissionRunner()">&times;</button>
            </div>

            <div class="runner-terminal-body">
              <div class="runner-briefing-box">
                <div><strong>ALVO DESIGNADO:</strong> <span style="color:var(--cyan-neon);">${m.targetHost}</span> [${m.targetIp}]</div>
                <div style="margin-top:0.4rem;"><strong>BRIEFING OPERACIONAL:</strong> ${m.briefing}</div>
                <div style="margin-top:0.4rem;color:#10b981;"><strong>RECOMPENSA DE DESBLOQUEIO:</strong> +$ ${m.rewards.cash} HC &nbsp;|&nbsp; +${m.rewards.rep} REP &nbsp;|&nbsp; Desbloqueio Permanente da Subclasse ${activeSub.name}</div>
              </div>

              <div class="runner-log-console" id="missionLogConsole">
                [SYSTEM] Conexão remota estabelecida com ${m.targetIp}...<br>
                [FIREWALL] Analisando regras de proteção do nó ${m.targetHost}...<br>
                [EXPLOIT] Porta vulnerável identificada. Payload de infiltração carregado: <code>${m.expectedPayload}</code>.<br>
                [STATUS] Pronto para execução do bypass de habilitação.
              </div>

              <div class="runner-challenge-box">
                <div class="runner-challenge-title">
                  <span>INJEÇÃO DE PAYLOAD & BYPASS</span>
                  <span>AUTENTICAÇÃO NECESSÁRIA</span>
                </div>
                <div class="runner-challenge-input-row">
                  <input type="text" id="missionPayloadInput" class="runner-input" value="${m.expectedPayload}" readonly>
                  <button onclick="window.skillTreeEngine.handleExecuteActiveMission('${activeSub.id}')" class="btn-runner-execute">
                    ⚡ EXECUTAR & DESBLOQUEAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    el.innerHTML = html;
  }

  handleStartMission(subId) {
    const res = this.startMission(subId);
    if (window.hackerAudio) window.hackerAudio.playEnterBeep();
    if (typeof showToast === 'function') showToast(res.message);
    if (typeof updateSkillTreeDisplay === 'function') updateSkillTreeDisplay();
  }

  handleCloseMissionRunner() {
    this.closeMissionRunner();
    if (typeof updateSkillTreeDisplay === 'function') updateSkillTreeDisplay();
  }

  handleExecuteActiveMission(subId) {
    if (!subId) return;
    const res = this.completeMission(subId);
    if (!res.success) {
      if (window.hackerAudio) window.hackerAudio.playErrorBuzz();
      alert(res.message);
      return;
    }

    if (typeof currentProfile !== 'undefined' && currentProfile) {
      currentProfile.reputation = (currentProfile.reputation || 0) + res.repReward;
    }
    if (typeof currentWallet !== 'undefined' && currentWallet) {
      currentWallet.balance = (currentWallet.balance || 0) + res.cashReward;
    }

    if (window.hackerAudio) {
      window.hackerAudio.playCashChime();
    }
    if (typeof showToast === 'function') {
      showToast(res.message);
    }
    if (typeof updateHudDisplays === 'function') {
      updateHudDisplays();
    }
    if (typeof loadBankTransactions === 'function') {
      loadBankTransactions();
    }
    if (typeof updateSkillTreeDisplay === 'function') {
      updateSkillTreeDisplay();
    }
  }

  handleEquipSubclass(subId) {
    if (typeof chooseSubclass === 'function') {
      chooseSubclass(subId);
    } else {
      const pSpec = (typeof currentProfile !== 'undefined' && currentProfile) ? currentProfile.specialty : 'exploiter';
      const pRep = (typeof currentProfile !== 'undefined' && currentProfile) ? currentProfile.reputation : 100;
      const res = this.selectSubclass(subId, pRep, pSpec);
      if (res.success) {
        if (window.hackerAudio) window.hackerAudio.playEnterBeep();
        if (typeof showToast === 'function') showToast(res.message);
        if (typeof updateHudDisplays === 'function') updateHudDisplays();
        if (typeof updateSkillTreeDisplay === 'function') updateSkillTreeDisplay();
      } else {
        if (window.hackerAudio) window.hackerAudio.playErrorBuzz();
        alert(res.message);
      }
    }
  }
}

window.skillTreeEngine = new SkillTreeEngine();
