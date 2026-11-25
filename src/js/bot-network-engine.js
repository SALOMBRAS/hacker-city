/**
 * Hacker City // Bot Network & Traceback Engine (Full Web Port)
 * Módulos 1A, 1B, 2, 3 e 4:
 * - Catálogo determinístico de 210 Bots Hackers (70 Médio, 70 Alto, 70 Super Alto)
 * - Agendador Semanal (30 bots/dia, 10 de cada tier) e turnos horários
 * - Motor de Traceback Ativo & Bouncing Proxies (+12s/salto, Bypass -50%)
 * - IA Reativa de Bots (Auditoria de logs, retaliação por tier, cancelamento via rmlog)
 * - Central C2 de Botnet & Mineração Passiva Contínua (Fantasma, Overclock, DDoS Swarm)
 */

class PseudoRNG {
  constructor(seed = 0x48433231) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
  range(min, max) {
    return min + this.next() * (max - min);
  }
  rangeInt(min, max) {
    return Math.floor(this.range(min, max + 1));
  }
}

class BotNetworkRegistry {
  constructor(seed = 0x52455354) {
    this.rng = new PseudoRNG(seed);
    this.bots = [];
    this.lawEnforcement = [];
    this.botsById = new Map();
    this.botsByIp = new Map();
    this.botsByTier = { 1: [], 2: [], 3: [] };

    this.initCatalog();
  }

  _hashId(str) {
    let h = 2166136261 >>> 0;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  _nextScatteredIp(usedIps) {
    const firstOctets = [177, 179, 186, 187, 189, 191, 200, 201, 138, 168, 170, 143];
    const staticReserved = new Set([
      '187.22.5.60', '189.40.7.12', '203.17.88.40', '198.51.100.42',
      '186.214.73.49', '179.108.52.91', '201.49.118.34'
    ]);
    for (let guard = 0; guard < 500; guard++) {
      const o1 = firstOctets[this.rng.rangeInt(0, firstOctets.length - 1)];
      const o2 = this.rng.rangeInt(11, 251);
      const o3 = this.rng.rangeInt(11, 251);
      const o4 = this.rng.rangeInt(12, 252);
      const ip = `${o1}.${o2}.${o3}.${o4}`;
      if (!usedIps.has(ip) && !staticReserved.has(ip)) {
        usedIps.add(ip);
        return ip;
      }
    }
    const fallback = `179.${this.rng.rangeInt(20, 240)}.${this.rng.rangeInt(20, 240)}.${this.rng.rangeInt(20, 240)}`;
    usedIps.add(fallback);
    return fallback;
  }

  initCatalog() {
    const usedIps = new Set();

    // 70 nomes únicos por nível de inteligência (BR, cotidiano e memes — zero sufixo robótico!)
    const tierHandles = {
      1: [
        'josenacimento', 'hackerbr', 'vitinladrão', 'lulaladrão', 'enzogamer2011',
        'juninhodograu', 'calabreso_xp', 'boleto_falso', 'pix_fantasma', 'tiozao_do_zap',
        'flavinhodopneu', 'ze_gotinha_root', 'cleitinho_ssh', 'nego_ney_404', 'pastel_de_flango',
        'chico_moedas_btc', 'pedrinho_lanhouse', 'agostinho_carrara', 'marcos_jeeps', 'betinho_proxy',
        'caio_do_ modem'.replace(/\s+/g, ''), 'duduzinho_br', 'gordinho_do_pc', 'rafa_baiano', 'matheus_sp011',
        'lukinhas_rj', 'tiago_formata_pc', 'vini_malvadeza', 'renatinho_wifi', 'zé_pequeno_net',
        'cabecao_linux', 'tonhao_da_firma', 'biel_quebra_senha', 'kaua_script', 'jorginho_244',
        'carlinhos_cavalo', 'manoel_gomes_blue', 'caneta_azul_sec', 'toguro_mansao', 'casimiro_cortes',
        'smzinho_rage', 'paulinhooloko_br', 'xaropinho_ratinho', 'serjão_foguetes', 'ednaldo_pereira',
        'galo_cego_ip', 'jeremias_muito_louco', 'jailson_mendes_oco', 'rodrigo_faro_danca', 'craque_neto_pao',
        'vampeta_cambalhota', 'ronaldinho_bruxo', 'adriano_imperador', 'romario_peixe', 'amaral_coveiro',
        'seu_madruga_72', 'kiko_tesouro', 'chaves_do_8', 'barriga_aluguel', 'jooj_natu',
        'faisca_curto', 'gato_net_oficial', 'sky_gato_hd', 'desbloqueio_xbox', 'windows_ativado',
        'baixa_memoria_ram', 'clicou_ganhou', 'principe_nigeriano', 'urubu_do_pix', 'farao_dos_bitcoins'
      ],
      2: [
        'sombra_sp', 'fantasma_rj', 'ratao_da_rede', 'mago_do_pix', 'tranca_rua_sec',
        'caos_brasilia', 'tubarao_b3', 'coringa_011', 'barao_offshore', 'malandro_root',
        'vampiro_curitiba', 'lobo_guarulhos', 'zero_rastro_br', 'ninja_faria_lima', 'pirata_anhanguera',
        'falcao_noturno', 'cangaceiro_digital', 'rei_do_laranja', 'espectro_sul', 'viper_paulista',
        'carcara_sombrio', 'boto_cor_de_rosa', 'saci_de_rede', 'curupira_reverso', 'jararaca_hex',
        'sucuri_payload', 'onca_pintada_sec', 'gaviao_fiel_01', 'urutu_cruzeiro', 'cascavel_binaria',
        'ferreiro_de_exploits', 'mercenario_bh', 'fantasma_do_porto', 'operador_mooca', 'hacker_da_lapa',
        'sombra_de_recife', 'barao_de_manaus', 'corsario_santos', 'contrabandista_foz', 'doleiro_digital',
        'contador_fantasma', 'advogado_porta', 'despachante_dark', 'laranja_premium', 'nota_fria_ltda',
        'shell_de_padaria', 'tunel_congonhas', 'ponte_rio_niteroi', 'viaduto_do_cha', 'beco_diagonal_br',
        'submundo_021', 'frequencia_pirata', 'radio_clandestina', 'antena_parabolica', 'cabo_submarino',
        'fibra_cortada', 'pacote_perdido', 'porta_22_aberta', 'forca_bruta_br', 'quebra_cofre_sp',
        'assaltante_de_banco', 'mestre_dos_clones', 'cartao_infinito', ' maquininha_adulterada'.trim(), 'chupa_cabra_atm',
        'trojan_bancario', 'kl_boleto_br', 'engenharia_social', 'falso_gerente', 'central_fantasma'
      ],
      3: [
        'oraculo_br', 'ceifador_kernel', 'soberano_0day', 'xandao_firewall', 'imperador_satoshi',
        'leviata_tropical', 'fantasma_planalto', 'protocolo_carcara', 'abismo_binario', 'tita_submarino',
        'arquiteto_da_matrix', 'deus_ex_tupiniquim', 'senhor_das_botnets', 'zero_absoluto_br', 'eclipse_federal',
        'espectro_supremo', 'general_cyber_br', 'marechal_root', 'almirante_darknet', 'comendador_offshore',
        'fantasma_de_itaipu', 'nucleo_angra_3', 'satelite_amazonia', 'radar_cindacta', 'cripto_ soberano'.replace(/\s+/g, ''),
        'monarca_invisivel', 'juiz_do_submundo', 'carrasco_de_logs', 'devorador_de_ram', 'apocalipse_bgp',
        'sequestrador_dns', 'quebra_rsa_4096', 'mestre_polimorfico', 'engenheiro_ring0', 'fantasma_bios',
        'sombra_inviolavel', 'lenda_de_sao_paulo', 'terror_dos_bancos', 'fantasma_do_bacen', 'dreno_bilionario',
        'rei_das_cayman', 'barao_de_zurique', 'sindicato_zero', 'cupula_invisivel', 'ordem_do_silicio',
        'legiao_fantasma', 'vanguarda_preta', 'esquadrao_zero_day', 'celula_fantasma', 'operacao_ouro_preto',
        'tempestade_solar_br', 'pulso_eletromagnetico', 'apagao_nacional', 'curto_circuito_geral', 'colapso_da_bolsa',
        'baleia_de_bitcoin', 'minerador_industrial', 'fazenda_clandestina', 'usina_fantasma', 'bunker_subterraneo',
        'cofre_suico_root', 'chave_mestra_global', 'oraculo_invisivel', 'sentinela_imortal', 'guardiao_do_caos',
        'ultimo_chefe_br', 'pesadelo_da_pf', 'intocavel_001', 'fantasma_sem_ip', 'lenda_urbana_hc'
      ]
    };

    // 70 Bots Tier 1, 70 Tier 2, 70 Tier 3 = 210 Total (30 por dia: 10 de cada inteligência!)
    for (let tier = 1; tier <= 3; tier++) {
      for (let i = 1; i <= 70; i++) {
        const tierPrefix = tier === 1 ? 'med' : (tier === 2 ? 'high' : 'super');
        const id = `bot_${tierPrefix}_${String(i).padStart(2, '0')}`;
        const handle = tierHandles[tier][(i - 1) % tierHandles[tier].length];
        const ip = this._nextScatteredIp(usedIps);

        const hardware = {
          cpuCores: tier === 1 ? 4 : (tier === 2 ? 8 : 24),
          cpuClock: tier === 1 ? 2.8 : (tier === 2 ? 3.8 : 4.5),
          ramGb: tier === 1 ? 8 : (tier === 2 ? 32 : 128),
          storageGb: tier === 1 ? 800 : (tier === 2 ? 3500 : 12000),
          netMbps: tier === 1 ? 40 : (tier === 2 ? 200 : 1000)
        };

        const bankBalance = tier === 1
          ? this.rng.rangeInt(250, 1500)
          : (tier === 2 ? this.rng.rangeInt(5000, 25000) : this.rng.rangeInt(50000, 200000));

        const bot = {
          id,
          handle,
          role: 'hacker',
          tier,
          tierName: tier === 1 ? 'Iniciante / Rua' : (tier === 2 ? 'Operacional / Blackhat' : 'Elite / APT'),
          ip,
          hardware,
          bankAccount: {
            accountNum: `HC-${tier === 1 ? 'MED' : (tier === 2 ? 'HIGH' : 'SUP')}-${String(i).padStart(4, '0')}`,
            password: `bot_pass_${this.rng.rangeInt(1000, 9999)}`,
            balance: bankBalance,
            bankIp: '10.40.10.5'
          },
          activeDay: (i - 1) % 7,
          activeShift: (i - 1) % 4,
          phaseSeed: this._hashId(id + '::' + handle),
          softwareList: [
            { name: 'firewall', version: tier === 1 ? '2.0' : (tier === 2 ? '4.5' : '9.0') },
            { name: 'hasher', version: tier === 1 ? '1.5' : (tier === 2 ? '3.2' : '8.0') },
            { name: 'cracker', version: tier === 1 ? '1.0' : (tier === 2 ? '3.0' : '7.5') }
          ],
          vfsFiles: {
            'passwords.txt': `Credencial Admin: root / adm_bot#${i * 13}\nBanco: HC-${tier === 1 ? 'MED' : (tier === 2 ? 'HIGH' : 'SUP')}-${String(i).padStart(4, '0')}\n`,
            'notes.txt': `Operações sigilosas do operador ${handle}.\n`,
            'intel.dat': `[CHAVE PRIVADA RSA 4096-BIT]\n${btoa(unescape(encodeURIComponent(handle + '_' + ip))).substring(0, 32)}\n`
          }
        };

        this.bots.push(bot);
        this.botsById.set(id, bot);
        this.botsByIp.set(ip, bot);
        this.botsByTier[tier].push(bot);
      }
    }

    // Garante que os 4 nomes icônicos de meme/BR citados pelo jogador também façam parte garantida da rotação diária de qualquer dia!
    this.featuredDailyHandles = ['josenacimento', 'hackerbr', 'vitinladrão', 'lulaladrão'];

    // 5 Policiais Cibernéticos + 1 Delegado Chefe (com rotação orgânica de plantão a cada 10 min!)
    const lawSpecs = [
      { id: 'law_pol_01', handle: 'pf_monteiro', role: 'policial', clanTag: 'PF-CYBER', rep: 4600, tier: 3, defVer: 4.5 },
      { id: 'law_pol_02', handle: 'agente_pecanha', role: 'policial', clanTag: 'PF-CYBER', rep: 3250, tier: 2, defVer: 3.5 },
      { id: 'law_pol_03', handle: 'inspetor_tavares', role: 'policial', clanTag: 'PF-CYBER', rep: 4950, tier: 3, defVer: 5.0 },
      { id: 'law_pol_04', handle: 'perito_camargo', role: 'policial', clanTag: 'PF-CYBER', rep: 4100, tier: 3, defVer: 4.0 },
      { id: 'law_pol_05', handle: 'agente_antunes', role: 'policial', clanTag: 'PF-CYBER', rep: 3780, tier: 2, defVer: 3.5 },
      { id: 'law_del_01', handle: 'delegado_silva', role: 'delegado', clanTag: 'DELEGADO', rep: 9800, tier: 3, defVer: 8.5 }
    ];

    lawSpecs.forEach((lw, idx) => {
      const ip = this._nextScatteredIp(usedIps);
      const unit = {
        id: lw.id,
        handle: lw.handle,
        role: lw.role,
        clanTag: lw.clanTag,
        reputation: lw.rep,
        tier: lw.tier,
        tierName: lw.role === 'delegado' ? 'Delegado Chefe Cyber' : 'Polícia Cibernética',
        ip,
        defVer: lw.defVer,
        phaseSeed: this._hashId(lw.id + '::LAW'),
        hardware: { cpuCores: 16, cpuClock: 4.4, ramGb: 64, storageGb: 8000, netMbps: 1000 },
        bankAccount: {
          accountNum: `PF-GOV-990${idx + 1}`,
          password: `pf_sec_${this.rng.rangeInt(1000, 9999)}`,
          balance: this.rng.rangeInt(8000, 35000),
          bankIp: '10.40.10.5'
        },
        softwareList: [
          { name: 'firewall', version: String(lw.defVer) },
          { name: 'hasher', version: String(lw.defVer) },
          { name: 'cracker', version: String(Math.max(2.0, lw.defVer - 0.5)) }
        ],
        vfsFiles: {
          'mandados_sigilosos.txt': `Divisão de Crimes Cibernéticos — Oficial @${lw.handle}.\n`,
          'relatorio_plantao.txt': `Monitoramento ativo de lavagem ilícita e rastros em logs.\n`
        }
      };
      this.lawEnforcement.push(unit);
      this.botsById.set(unit.id, unit);
      this.botsByIp.set(ip, unit);
    });
  }

  getBotByIp(ip) {
    return this.botsByIp.get(ip) || null;
  }

  getBotById(id) {
    return this.botsById.get(id) || null;
  }

  getAllBots() {
    return this.bots;
  }

  getLawEnforcementUnits() {
    return this.lawEnforcement || [];
  }

  getBotsByTier(tier) {
    return this.botsByTier[tier] || [];
  }

  searchBots(query) {
    const q = query.toLowerCase().trim();
    return this.bots.filter(b => b.handle.toLowerCase().includes(q));
  }
}

class BotScheduler {
  constructor(registry) {
    this.registry = registry;
  }

  // Retorna exatamente 30 Bots Hackers para o dia (10 Tier 1, 10 Tier 2, 10 Tier 3),
  // garantindo presença dos nomes brasileiros/memes icônicos na rotação do dia!
  getActiveBotsForDay(dayOfWeek) {
    const base = this.registry.bots.filter(b => b.activeDay === dayOfWeek);
    const featured = (this.registry.featuredDailyHandles || [])
      .map(h => this.registry.bots.find(b => b.handle === h))
      .filter(Boolean);

    const out = [...base];
    featured.forEach((fb, idx) => {
      if (!out.some(x => x.id === fb.id)) {
        // Substitui um slot Tier 1 do dia para manter exatamente 30 bots hackers no dia!
        const t1Idx = out.findIndex((x, k) => x.tier === 1 && k >= idx && !featured.some(f => f.id === x.id));
        if (t1Idx >= 0) out[t1Idx] = fb;
      }
    });
    return out.slice(0, 30);
  }

  getCurrentDayBots() {
    const day = new Date().getDay();
    return this.getActiveBotsForDay(day);
  }

  getCurrentDayLawEnforcement() {
    return this.registry.getLawEnforcementUnits();
  }

  // Variação orgânica a cada 10 minutos (com defasagem individual de fase para entrar um e sair outro aos poucos,
  // nunca ficando travado em 35/36 online fixos!).
  isUnitOnlineAt(unit, nowMs = Date.now()) {
    if (!unit) return false;
    const TEN_MIN_MS = 10 * 60 * 1000;
    const globalSlot = Math.floor(nowMs / TEN_MIN_MS);
    const phaseOffsetMs = ((unit.phaseSeed || 0) % 10) * 60 * 1000;
    const unitSlot = Math.floor((nowMs + phaseOffsetMs) / TEN_MIN_MS);

    // Ocupação alvo da janela de 10 min oscila entre ~56% e ~86% (ex: ora 20 online, ora 27, ora 31)
    const waveHash = Math.imul((globalSlot ^ 0x9e3779b9) >>> 0, 1664525) >>> 0;
    const targetPct = 56 + (waveHash % 31); // 56..86%

    const rollHash = Math.imul(((unit.phaseSeed || 1) ^ Math.imul(unitSlot + 17, 2246822519)) >>> 0, 3266489917) >>> 0;
    const roll = rollHash % 100;

    if (unit.role === 'delegado') {
      // Delegado entra e sai em rondas (presente ~62% das janelas de 10 min)
      return roll < 62;
    }
    if (unit.role === 'policial') {
      // Dos 5 policiais, sempre há entre 2 e 5 de plantão variando a cada 10 min (~68% cada)
      return roll < 68;
    }
    return roll < targetPct;
  }

  isBotOnline(botIp, nowMs = Date.now()) {
    const unit = this.registry.getBotByIp(botIp);
    if (!unit) return false;
    if (unit.role === 'policial' || unit.role === 'delegado') {
      return this.isUnitOnlineAt(unit, nowMs);
    }
    const dayBots = this.getCurrentDayBots();
    if (!dayBots.some(b => b.ip === botIp)) return false;
    return this.isUnitOnlineAt(unit, nowMs);
  }
}

class TracebackEngine {
  constructor() {
    this.active = false;
    this.targetBot = null;
    this.baseDuration = 75.0;
    this.totalDuration = 75.0;
    this.elapsedTime = 0.0;
    this.crackProgress = 0.0;
    this.crackDuration = 30.0;
    this.timer = null;

    // Rota de Saltos Proxies Intermediários (+12s por nó)
    this.availableProxies = ["10.40.1.12", "10.50.2.88", "10.60.3.45", "10.70.4.99"];
    this.activeProxies = ["10.40.1.12", "10.50.2.88"];

    this.onProgress = null;
    this.onCompromised = null;
    this.onSuccess = null;
    this.onTraced = null;
  }

  setTarget(bot) {
    this.targetBot = bot;
    const tier = bot ? bot.tier : 1;
    if (tier === 1) {
      this.baseDuration = 75.0;
      this.crackDuration = 26.0;
    } else if (tier === 2) {
      this.baseDuration = 42.0;
      this.crackDuration = 36.0;
    } else {
      this.baseDuration = 20.0; // Letal
      this.crackDuration = 45.0;
    }
    this.recalculateDuration();
  }

  setBouncingProxies(proxyList) {
    this.activeProxies = [...proxyList];
    this.recalculateDuration();
  }

  recalculateDuration() {
    this.totalDuration = this.baseDuration + (this.activeProxies.length * 12.0);
  }

  startAttack(onProgress, onCompromised, onSuccess, onTraced) {
    this.stop();
    this.active = true;
    this.elapsedTime = 0.0;
    this.crackProgress = 0.0;

    this.onProgress = onProgress;
    this.onCompromised = onCompromised;
    this.onSuccess = onSuccess;
    this.onTraced = onTraced;

    const step = 0.1;
    this.timer = setInterval(() => {
      if (!this.active) return;
      this.elapsedTime += step;
      this.crackProgress += (100.0 / this.crackDuration) * step;

      const tracePct = Math.min(100, (this.elapsedTime / this.totalDuration) * 100);
      const timeLeft = Math.max(0, this.totalDuration - this.elapsedTime);

      // Verificar nós proxies comprometidos
      const compromisedProxies = [];
      this.activeProxies.forEach((ip, idx) => {
        const threshold = ((idx + 1) / (this.activeProxies.length + 1)) * this.totalDuration;
        if (this.elapsedTime >= threshold) {
          compromisedProxies.push(ip);
        }
      });

      if (this.onProgress) {
        this.onProgress({
          tracePercent: tracePct,
          timeLeft: timeLeft,
          crackProgress: Math.min(100, this.crackProgress),
          compromisedProxies: compromisedProxies
        });
      }

      // Vitória do Cracker
      if (this.crackProgress >= 100) {
        this.stop();
        if (this.onSuccess) this.onSuccess(this.targetBot);
        return;
      }

      // Alvo rastreou o jogador (Trace 100%)
      if (this.elapsedTime >= this.totalDuration) {
        this.stop();
        if (this.onTraced) this.onTraced(this.targetBot);
        return;
      }
    }, 100);
  }

  executeBypass() {
    if (!this.active) return;
    const remainingCrack = 100.0 - this.crackProgress;
    this.crackProgress = Math.min(100.0, this.crackProgress + (remainingCrack * 0.5));
    // Alívio de 6 segundos no rastro
    this.elapsedTime = Math.max(0.0, this.elapsedTime - 6.0);
  }

  stop() {
    this.active = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

class BotAIService {
  constructor() {
    this.pendingAttacks = new Map(); // botIp -> AttackData
    this.syslogRegistry = new Map();  // botIp -> Array[Logs]
    this.isUnderDDoS = false;
    this.ddosTimeLeft = 0;
    this.ddosTimer = null;
  }

  registerIntrusion(botIp, playerIp = null) {
    const activeIp = playerIp || (window.networkIdentity ? window.networkIdentity.getPublicIp() : "142.87.13.9");
    const reg = window.botRegistry;
    const bot = reg ? reg.getBotByIp(botIp) : null;
    const tier = bot ? bot.tier : 1;

    // Gravar nos logs internos do bot
    if (!this.syslogRegistry.has(botIp)) {
      this.syslogRegistry.set(botIp, []);
    }
    this.syslogRegistry.get(botIp).push(`[${new Date().toLocaleTimeString()}] INTRUSION src=${activeIp} dest=${botIp} exploit=OK`);

    if (typeof window.addLocalLog === 'function') {
      window.addLocalLog('SSH/EXPLOIT', `Acesso root em ${bot ? bot.handle : 'Host'} [${botIp}] — seu IP (${activeIp}) ficou em /var/log/syslog`, 'warning');
    }

    let delaySec = 15;
    let attackType = "light_theft";

    if (tier === 1) {
      delaySec = 20; // Médio: 20s para demonstração interativa web (ou 3h simuladas)
      attackType = "light_theft";
    } else if (tier === 2) {
      delaySec = 10; // Alto: 10s (ou 15m)
      attackType = "bank_drain_and_vminer";
    } else {
      delaySec = 0; // Super Alto: imediato
      attackType = "ddos_and_ransomware";
    }

    const attackData = {
      botIp,
      botHandle: bot ? bot.handle : "Remoto",
      tier,
      attackType,
      delaySec,
      timeLeft: delaySec,
      loggedPlayerIp: activeIp
    };

    this.pendingAttacks.set(botIp, attackData);

    if (delaySec === 0) {
      this.executeCounterAttack(botIp);
    } else {
      this.startCountdown(botIp);
    }

    if (typeof window.renderLogsPage === 'function') window.renderLogsPage();
    return attackData;
  }

  startCountdown(botIp) {
    const att = this.pendingAttacks.get(botIp);
    if (!att) return;

    const interval = setInterval(() => {
      if (!this.pendingAttacks.has(botIp)) {
        clearInterval(interval);
        return;
      }
      att.timeLeft -= 1;
      if (typeof window.renderLogsPage === 'function' && window.winManager && window.winManager.current === 'winLogs') {
        window.renderLogsPage();
      }
      if (att.timeLeft <= 0) {
        clearInterval(interval);
        this.executeCounterAttack(botIp);
      }
    }, 1000);
  }

  wipeLogs(botIp) {
    let hadTrace = false;
    if (this.syslogRegistry.has(botIp) && this.syslogRegistry.get(botIp).length > 0) {
      this.syslogRegistry.set(botIp, []);
      hadTrace = true;
    }
    const hadPending = this.pendingAttacks.has(botIp);
    if (hadPending) {
      this.pendingAttacks.delete(botIp);
    }
    if ((hadTrace || hadPending) && typeof window.addLocalLog === 'function') {
      window.addLocalLog('RMLOG', `Rastro apagado em ${botIp}:/var/log/syslog${hadPending ? ' (contra-ataque abortado)' : ''}`, 'success');
    }
    if (typeof window.renderLogsPage === 'function') window.renderLogsPage();
    return hadPending;
  }

  executeCounterAttack(botIp) {
    const att = this.pendingAttacks.get(botIp);
    this.pendingAttacks.delete(botIp);

    const handle = att ? att.botHandle : "Bot Defensor";
    const currentIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : null;
    const syslogLines = this.syslogRegistry.get(botIp) || [];

    // Se o jogador trocou de IP no Provedor ISP (ou apagou/editou o IP do syslog), o contra-ataque perde a rota!
    if (att && att.loggedPlayerIp) {
      const stillInLog = syslogLines.some((l) => l.includes(att.loggedPlayerIp));
      if (!stillInLog) {
        if (typeof window.renderLogsPage === 'function') window.renderLogsPage();
        return;
      }
      if (currentIp && att.loggedPlayerIp !== currentIp) {
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('ISP-SHIELD', `${handle} [${botIp}] tentou retaliar seu IP antigo (${att.loggedPlayerIp}), mas seu novo IP (${currentIp}) escapou ileso!`, 'success');
        }
        if (typeof window.showToast === 'function') {
          window.showToast(`Contra-ataque de ${handle} despistado! Ele mirou no seu IP antigo (${att.loggedPlayerIp}).`);
        }
        if (typeof window.renderLogsPage === 'function') window.renderLogsPage();
        return;
      }
    }

    // VERIFICAÇÃO ESTRITA DE DEFESA: Firewall.fwl & Hasher.hash do jogador vs Software do Bot!
    const tier = att ? att.tier : 1;
    const botSoftVer = tier === 3 ? 2.5 : (tier === 2 ? 1.5 : 1.0);
    const myFwl = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('firewall') : 1.0;
    const myHash = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('hasher') : 1.0;
    const hasDdosCert = window.universityEngine ? window.universityEngine.hasCert(5) : false;

    const type = att ? att.attackType : "light_theft";

    // Para ataques de intrusão (Tier 1 e Tier 2), se seu Firewall OU Hasher > software do Bot -> 100% BLOQUEADO!
    if (type !== "ddos_and_ransomware" && (myFwl > botSoftVer || myHash > botSoftVer)) {
      const shieldReason = myFwl > botSoftVer ? `Firewall.fwl v${myFwl.toFixed(1)}` : `Hasher.hash v${myHash.toFixed(1)}`;
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('FIREWALL-BLOCK', `${handle} [${botIp}] tentou contra-atacar (v${botSoftVer.toFixed(1)}), mas seu ${shieldReason} BLOQUEOU a invasão!`, 'success');
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`Escudo Ativo: seu ${shieldReason} bloqueou a retaliação de ${handle} [${botIp}]!`);
      }
      if (typeof window.renderLogsPage === 'function') window.renderLogsPage();
      return;
    }

    if (window.hackerAudio) window.hackerAudio.playInvasionAlert();

    // Comportamento realista: bots experientes (Tier 3 = 100%, Tier 2 = 80%, Tier 1 = 35%) apagam o próprio IP da sua log e deixam uma farpa!
    const wipesOwnLog = tier === 3 ? true : (tier === 2 ? Math.random() < 0.80 : Math.random() < 0.35);
    const originForMalware = wipesOwnLog ? `RASTRO APAGADO POR ${handle}` : botIp;

    const writeBotBreachLog = (stolenVal, malwareLabel) => {
      if (wipesOwnLog && window.livingBotsEngine) {
        const taunt = window.livingBotsEngine.buildHackerTaunt(handle, myFwl, stolenVal, malwareLabel);
        window.livingBotsEngine.wipeOwnIpFromPlayerLocalLogs(botIp, handle, taunt);
      } else if (typeof window.addLocalLog === 'function') {
        const extraMal = malwareLabel ? ` e instalou ${malwareLabel}` : '';
        window.addLocalLog('INTRUSION-IP-EXPOSTO', `${handle} [${botIp}] rastreou seu IP esquecido na log dele, drenou $ ${stolenVal}.00 HC${extraMal} e esqueceu de apagar o próprio IP!`, 'danger');
      }
    };

    if (type === "light_theft") {
      const stolen = 50;
      if (window.currentWallet) {
        window.currentWallet.balance = Math.max(0, parseFloat(window.currentWallet.balance) - stolen);
        if (typeof updateHudDisplays === 'function') updateHudDisplays();
      }
      writeBotBreachLog(stolen, '');
      alert(wipesOwnLog
        ? `[INVASÃO & LOG APAGADA]\nO hacker ${handle} encontrou seu IP esquecido na log, debitou $ ${stolen}.00 HC, APAGOU o próprio IP da sua log e deixou uma farpa em Meus Logs!`
        : `[ALERTA DE INVASÃO]\nO bot defensor ${handle} [${botIp}] rastreou seus logs, debitou $ ${stolen}.00 HC e esqueceu o IP na sua log!`);
    } else if (type === "bank_drain_and_vminer") {
      const stolen = 250;
      if (window.currentWallet) {
        window.currentWallet.balance = Math.max(0, parseFloat(window.currentWallet.balance) - stolen);
        if (typeof updateHudDisplays === 'function') updateHudDisplays();
      }
      writeBotBreachLog(stolen, 'Trojan.vminer v2.0');
      if (window.softwareEngine && typeof window.softwareEngine.infectLocalPc === 'function') {
        // Tier 2 planta v2.0 (20) -> exige Antivirus.av >= v2.0 ou Formatar HD!
        window.softwareEngine.infectLocalPc('vminer_trojan', 'Trojan.vminer', 20, originForMalware);
      }
      if (window.hackerAudio) window.hackerAudio.playMalwareInstalled();
      alert(wipesOwnLog
        ? `[INVASÃO CRÍTICA — RASTRO APAGADO]\n${handle} invadiu seu PC, drenou $ ${stolen}.00 HC, plantou 'Trojan.vminer (v2.0)', APAGOU o próprio IP da sua log e deixou uma farpa!`
        : `[INVASÃO CRÍTICA]\n${handle} [${botIp}] invadiu seu sistema, drenou $ ${stolen}.00 HC e instalou 'Trojan.vminer (v2.0)' na sua RAM!`);
    } else {
      // Mitigação DDoS Oficial (ddos.txt): Curso #5 + Firewall.fwl forte reduz ou anula o DDoS!
      if (hasDdosCert && myFwl >= 3.0) {
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('DDOS-MITIGATED', `Seu Firewall.fwl (v${myFwl.toFixed(1)}) + Curso #5 ANULARAM 100% do DDoS de ${handle} [${botIp}]!`, 'success');
        }
        if (typeof window.showToast === 'function') {
          window.showToast(`Mitigação DDoS Ativa: Firewall v${myFwl.toFixed(1)} neutralizou o ataque de ${handle}!`);
        }
        if (typeof window.renderLogsPage === 'function') window.renderLogsPage();
        return;
      }
      const ddosDur = hasDdosCert ? Math.max(4, Math.round(12 - myFwl * 2)) : 12;
      this.startDDoS(ddosDur);
      if (myFwl <= botSoftVer && window.softwareEngine && typeof window.softwareEngine.infectLocalPc === 'function') {
        window.softwareEngine.infectLocalPc('apt_ransomware', 'APT_Rootkit.vbank', 25, originForMalware);
      }
      writeBotBreachLog(0, myFwl <= botSoftVer ? 'APT_Rootkit.vbank v2.5' : `ataque DDoS (${ddosDur}s)`);
      if (window.hackerAudio) window.hackerAudio.playDDoSAlert();
      alert(`[ATAQUE DEVASTADOR DDOS]\n${handle} disparou um ataque DDoS (${ddosDur}s) e limpou o próprio rastro da sua log!`);
    }
    if (typeof window.renderLogsPage === 'function') window.renderLogsPage();
  }

  startDDoS(durationSec = 12) {
    this.isUnderDDoS = true;
    this.ddosTimeLeft = durationSec;

    const banner = document.getElementById('ddosGlobalBanner');
    if (banner) banner.style.display = 'block';

    if (this.ddosTimer) clearInterval(this.ddosTimer);
    this.ddosTimer = setInterval(() => {
      this.ddosTimeLeft -= 1;
      if (this.ddosTimeLeft <= 0) {
        clearInterval(this.ddosTimer);
        this.isUnderDDoS = false;
        if (banner) banner.style.display = 'none';
      }
    }, 1000);
  }
}

class BotnetC2Engine {
  constructor() {
    this.profile = "ghost"; // "ghost" (1.0x), "overclock" (3.5x), "ddos" (0.0x)
    this.multiplier = 1.0;
    this.accumulatedProfits = 0.0;
    this.slaves = [];

    this.initTicker();
  }

  setProfile(mode) {
    if (mode === "ghost") {
      this.profile = "ghost";
      this.multiplier = 1.0;
    } else if (mode === "overclock") {
      this.profile = "overclock";
      this.multiplier = 3.5;
    } else if (mode === "ddos") {
      this.profile = "ddos";
      this.multiplier = 0.0;
    }
  }

  getBonusMultiplier() {
    let bonus = 1.0;
    if (window.currentProfile && window.currentProfile.specialty === 'botmaster') {
      bonus *= 1.30;
    }
    if (window.skillTreeEngine) {
      const rank = typeof window.skillTreeEngine.getRank === 'function' ? window.skillTreeEngine.getRank('botnet_boost') : 0;
      if (rank > 0) bonus *= (1 + rank * 0.15);
      if (window.skillTreeEngine.selectedSubclass === 'sub_botmaster') bonus *= 1.20;
    }
    return bonus;
  }

  getIncomeRate() {
    if (this.profile === "ddos") return 0.0;
    const baseTotal = this.slaves.reduce((acc, s) => acc + s.baseRate, 0);
    return baseTotal * this.multiplier * this.getBonusMultiplier();
  }

  addSlave(bot) {
    if (!bot) return;
    const exists = this.slaves.find(s => s.ip === bot.ip);
    if (!exists) {
      const rate = bot.tier === 1 ? 0.35 : (bot.tier === 2 ? 1.20 : 3.50);
      this.slaves.push({
        ip: bot.ip,
        handle: bot.handle,
        tier: bot.tier,
        baseRate: rate
      });
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('BOTNET-C2', `Zumbi ${bot.handle} [${bot.ip}] anexado ao enxame (+$ ${rate.toFixed(2)}/s base)`, 'info');
      }
      if (window.hackerAudio) window.hackerAudio.playMalwareInstalled();
    }
  }

  removeSlave(botIp) {
    this.slaves = this.slaves.filter(s => s.ip !== botIp);
  }

  collectProfits() {
    const amount = this.accumulatedProfits;
    if (amount <= 0) return 0;
    this.accumulatedProfits = 0.0;

    if (window.currentWallet) {
      window.currentWallet.balance = parseFloat(window.currentWallet.balance) + amount;
      if (typeof updateHudDisplays === 'function') updateHudDisplays();
    }
    if (typeof window.addLocalLog === 'function') {
      window.addLocalLog('BOTNET-PAYOUT', `Rendimentos de mineração coletados: +$ ${amount.toFixed(2)} HC`, 'success');
    }

    if (window.hackerAudio) window.hackerAudio.playMoneyCollect();
    return amount;
  }

  initTicker() {
    setInterval(() => {
      const rate = this.getIncomeRate();
      this.accumulatedProfits += rate * 0.5;

      const earnedEl = document.getElementById('c2EarnedLive');
      if (earnedEl) {
        earnedEl.innerText = `$ ${this.accumulatedProfits.toFixed(2)} HC`;
      }
    }, 500);
  }
}

// =========================================================================
// RENDERERS DE INTERFACE GRÁFICA DO DESKTOP (CRACKER & BOTNET C2)
// =========================================================================

function renderCrackerUI(containerId = 'crackerAppBody', initialTargetIp = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Nunca listar bots desconhecidos: exibe apenas IPs já descobertos pelo jogador no Caderno (Hacked DB)!
  const discoveredEntries = (window.hackedDb && typeof window.hackedDb.getAll === 'function')
    ? window.hackedDb.getAll()
    : [];
  const discoveredBots = discoveredEntries
    .map(e => window.botRegistry.getBotByIp(e.ip))
    .filter(Boolean);

  const selectedIp = initialTargetIp || (discoveredBots.length > 0 ? discoveredBots[0].ip : '198.51.100.42');
  const selectedBot = window.botRegistry.getBotByIp(selectedIp) || {
    ip: selectedIp,
    handle: selectedIp === '198.51.100.42' ? 'PC de Treino' : 'Host Descoberto',
    tier: 1,
    tierName: 'Alvo Descoberto'
  };
  window.traceEngine.setTarget(selectedBot);

  let optionsHtml = `<option value="198.51.100.42" ${selectedIp === '198.51.100.42' ? 'selected' : ''}>PC de Treino [198.51.100.42]</option>`;
  discoveredBots.forEach(b => {
    const isSel = b.ip === selectedIp ? 'selected' : '';
    optionsHtml += `<option value="${b.ip}" ${isSel}>${b.handle} [${b.ip}] — ${b.tierName}</option>`;
  });

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <!-- Seletor de Alvo e Rota de Saltos -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label style="font-size: 0.76rem; color: #aab3c0; font-weight: bold; display: block; margin-bottom: 4px;">BOT HACKER ALVO (210 DETERMINÍSTICOS):</label>
          <select id="crackerTargetSelect" class="form-input" style="padding: 0.4rem; font-size: 0.8rem;" onchange="onCrackerTargetChanged(this.value)">
            ${optionsHtml}
          </select>
        </div>
        <div>
          <label style="font-size: 0.76rem; color: #aab3c0; font-weight: bold; display: block; margin-bottom: 4px;">NÓS DE SALTO (BOUNCING PROXIES +12s CADA):</label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
            <label style="font-size: 0.75rem; color: #eceff3; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;">
              <input type="checkbox" id="chkProxy1" checked onchange="updateCrackerProxies()"> Salto 1 (+12s)
            </label>
            <label style="font-size: 0.75rem; color: #eceff3; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;">
              <input type="checkbox" id="chkProxy2" checked onchange="updateCrackerProxies()"> Salto 2 (+12s)
            </label>
            <label style="font-size: 0.75rem; color: #eceff3; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;">
              <input type="checkbox" id="chkProxy3" onchange="updateCrackerProxies()"> Salto 3 (+12s)
            </label>
            <label style="font-size: 0.75rem; color: #eceff3; display: inline-flex; align-items: center; gap: 4px; cursor: pointer;">
              <input type="checkbox" id="chkProxy4" onchange="updateCrackerProxies()"> Salto 4 (+12s)
            </label>
          </div>
        </div>
      </div>

      <!-- Traceback HUD Bar -->
      <div id="crackerTraceHud" class="trace-hud-container">
        <div class="trace-hud-header">
          <span id="crackerTraceTitle" style="color: var(--cyan-neon); font-weight: bold;">CONTRA-RASTREAMENTO DEFENSIVO: <span id="crackerTracePct">0.0%</span></span>
          <span id="crackerTimeLeft" style="color: var(--cyan-neon); font-family: monospace;">TEMPO: ${window.traceEngine.totalDuration.toFixed(1)}s</span>
        </div>
        <div class="trace-meter-bg">
          <div id="crackerTraceMeterFill" class="trace-meter-fill"></div>
        </div>

        <!-- Visual Route Strip -->
        <div class="proxy-nodes-strip" id="crackerProxyStrip">
          <!-- Injetado dinamicamente -->
        </div>
      </div>

      <!-- Cracker Progress Bar -->
      <div style="background: #1b2027; border: 1px solid #262c35; border-radius: 8px; padding: 1rem;">
        <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.4rem; font-family: var(--hc-font-mono);">
          <span style="color: #fff; font-weight: bold;">DESCRIPTOGRAFIA DO ALVO:</span>
          <span id="crackerProgressPct" style="color: var(--green-safe); font-weight: bold;">0%</span>
        </div>
        <div style="height: 12px; background: #111418; border-radius: 9999px; overflow: hidden; border: 1px solid #262c35;">
          <div id="crackerProgressFill" style="height: 100%; width: 0%; background: linear-gradient(90deg, #35b877, #34d399); transition: width 0.1s linear;"></div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button id="btnCrackerStart" class="btn-submit" style="flex: 1; margin: 0; padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="startCrackerAttack()">
          ▶ INICIAR ATAQUE COM TRACEBACK
        </button>
        <button id="btnCrackerBypass" class="btn-submit btn-bypass-challenge" style="flex: 1; margin: 0; padding: 0.5rem 1rem; font-size: 0.85rem; opacity: 0.4; cursor: not-allowed;" disabled onclick="executeCrackerBypass()">
          BYPASS DE PACOTE (-50%)
        </button>
        <button class="btn-submit" style="width: auto; background: #353c47; border-color: #353c47; margin: 0; padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="abortCrackerAttack()">
          ⏹ PARAR
        </button>
      </div>

      <!-- Resultado / Alerta -->
      <div id="crackerResultBox" style="display: none; padding: 1rem; border-radius: 6px; font-size: 0.82rem; line-height: 1.4;">
      </div>
    </div>
  `;

  renderCrackerProxyStrip();
}

function renderCrackerProxyStrip() {
  const container = document.getElementById('crackerProxyStrip');
  if (!container) return;
  container.innerHTML = '';

  const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '142.87.13.9';
  const originPill = document.createElement('div');
  originPill.className = 'proxy-node-pill active';
  originPill.innerHTML = `<span>Você [${myIp}]</span>`;
  container.appendChild(originPill);

  window.traceEngine.activeProxies.forEach((ip, idx) => {
    const pill = document.createElement('div');
    pill.id = `proxy_pill_${idx}`;
    pill.className = 'proxy-node-pill active';
    pill.innerHTML = `<span>Salto ${idx + 1}: ${ip}</span>`;
    container.appendChild(pill);
  });

  const target = window.traceEngine.targetBot;
  const targetPill = document.createElement('div');
  targetPill.className = 'proxy-node-pill';
  targetPill.innerHTML = `<span>${target ? target.handle : 'Alvo'} [${target ? target.ip : '0.0.0.0'}]</span>`;
  container.appendChild(targetPill);
}

function onCrackerTargetChanged(ip) {
  const bot = window.botRegistry.getBotByIp(ip);
  if (bot) {
    window.traceEngine.setTarget(bot);
    document.getElementById('crackerTimeLeft').innerText = `TEMPO: ${window.traceEngine.totalDuration.toFixed(1)}s`;
    renderCrackerProxyStrip();
  }
}

function updateCrackerProxies() {
  const selected = [];
  const pIps = window.traceEngine.availableProxies;
  if (document.getElementById('chkProxy1')?.checked) selected.push(pIps[0]);
  if (document.getElementById('chkProxy2')?.checked) selected.push(pIps[1]);
  if (document.getElementById('chkProxy3')?.checked) selected.push(pIps[2]);
  if (document.getElementById('chkProxy4')?.checked) selected.push(pIps[3]);

  window.traceEngine.setBouncingProxies(selected);
  const timeEl = document.getElementById('crackerTimeLeft');
  if (timeEl) timeEl.innerText = `TEMPO: ${window.traceEngine.totalDuration.toFixed(1)}s`;
  renderCrackerProxyStrip();
}

function startCrackerAttack() {
  const btnStart = document.getElementById('btnCrackerStart');
  const btnBypass = document.getElementById('btnCrackerBypass');
  const resultBox = document.getElementById('crackerResultBox');
  if (resultBox) resultBox.style.display = 'none';

  btnStart.disabled = true;
  btnStart.style.opacity = '0.5';
  btnBypass.disabled = false;
  btnBypass.style.opacity = '1';
  btnBypass.style.cursor = 'pointer';

  const traceHud = document.getElementById('crackerTraceHud');
  const traceMeter = document.getElementById('crackerTraceMeterFill');
  const tracePctEl = document.getElementById('crackerTracePct');
  const timeLeftEl = document.getElementById('crackerTimeLeft');
  const crackPctEl = document.getElementById('crackerProgressPct');
  const crackFill = document.getElementById('crackerProgressFill');

  window.traceEngine.startAttack(
    // Progresso
    (data) => {
      if (window.hackerAudio) window.hackerAudio.playKeyClick();
      traceMeter.style.width = data.tracePercent + '%';
      tracePctEl.innerText = data.tracePercent.toFixed(1) + '%';
      timeLeftEl.innerText = `TEMPO: ${data.timeLeft.toFixed(1)}s`;

      crackPctEl.innerText = Math.floor(data.crackProgress) + '%';
      crackFill.style.width = data.crackProgress + '%';

      // Alerta de cor no Traceback HUD
      if (data.tracePercent >= 75) {
        traceHud.className = 'trace-hud-container danger-alert';
        traceMeter.style.backgroundColor = '#d0443a';
        if (window.hackerAudio && Math.random() < 0.25) window.hackerAudio.playInvasionAlert();
      } else if (data.tracePercent >= 50) {
        traceHud.className = 'trace-hud-container';
        traceMeter.style.backgroundColor = '#f0a03a';
      } else {
        traceHud.className = 'trace-hud-container';
        traceMeter.style.backgroundColor = '#22d3ee';
      }

      // Atualizar nós comprometidos na strip
      window.traceEngine.activeProxies.forEach((ip, idx) => {
        const pill = document.getElementById(`proxy_pill_${idx}`);
        if (pill) {
          if (data.compromisedProxies.includes(ip)) {
            pill.className = 'proxy-node-pill compromised';
            pill.innerHTML = `<span>Salto ${idx + 1}: ${ip}</span>`;
          } else {
            pill.className = 'proxy-node-pill active';
            pill.innerHTML = `<span>Salto ${idx + 1}: ${ip}</span>`;
          }
        }
      });
    },
    // Compromissado
    () => {},
    // Vitória (Sucesso)
    (bot) => {
      btnStart.disabled = false;
      btnStart.style.opacity = '1';
      btnBypass.disabled = true;
      btnBypass.style.opacity = '0.4';
      if (window.hackerAudio) window.hackerAudio.playMoneyCollect();

      // Gravar invasão na IA do bot (para auditoria) + salvar no Hacked Database
      window.botAI.registerIntrusion(bot.ip);
      if (window.hackedDb && window.internetEngine) {
        const hostMeta = window.internetEngine.resolveHost(bot.ip);
        window.hackedDb.upsertHost({
          ip: bot.ip,
          hostname: hostMeta.hostname || bot.handle,
          kind: 'bot',
          tier: bot.tier,
          accessMethod: 'password',
          password: hostMeta.rootPassword || 'root1337',
          cpuSpec: `${bot.hardware.cpuCores}c @ ${bot.hardware.cpuClock}GHz`
        });
      }

      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.style.background = '#064e3b';
        resultBox.style.border = '1px solid #35b877';
        resultBox.style.color = '#d1fae5';
        resultBox.innerHTML = `
          <div style="font-weight: bold; font-size: 0.95rem; margin-bottom: 0.35rem;">SUCESSO: FIREWALL E HASHES DECIFRADOS!</div>
          <div>Acesso root obtido na máquina de <strong>${bot.handle}</strong> [${bot.ip}] e salvo no <strong>Hacked Database</strong>!</div>
          <div style="color: #f5bd6b; font-size: 0.75rem; margin: 0.5rem 0;">ATENÇÃO: Seu IP público foi registrado em /var/log/syslog! Apague os logs ou troque seu IP no Provedor ISP antes que a IA retalie!</div>
          <div style="display: flex; gap: 8px; margin-top: 0.5rem; flex-wrap: wrap;">
            <button class="btn-submit" style="width: auto; margin: 0; padding: 0.35rem 0.75rem; font-size: 0.75rem;" onclick="enslaveBotToC2('${bot.ip}')">Escravizar na Botnet C2</button>
            <button class="btn-submit" style="width: auto; margin: 0; padding: 0.35rem 0.75rem; font-size: 0.75rem; background: #12814f;" onclick="drainBotBank('${bot.ip}')">Drenar Saldo ($ ${bot.bankAccount.balance} HC)</button>
            <button class="btn-submit" style="width: auto; margin: 0; padding: 0.35rem 0.75rem; font-size: 0.75rem; background: #d0443a;" onclick="wipeBotLogsViaBtn('${bot.ip}')">Apagar Logs Agora</button>
            <button class="btn-submit" style="width: auto; margin: 0; padding: 0.35rem 0.75rem; font-size: 0.75rem; background: #262c35; border-color: #3a4350;" onclick="window.internetEngine.quickSshConnect('${bot.ip}')">Abrir SSH na Internet</button>
          </div>
        `;
      }
    },
    // Derrota (Rastreado a 100%)
    (bot) => {
      btnStart.disabled = false;
      btnStart.style.opacity = '1';
      btnBypass.disabled = true;
      btnBypass.style.opacity = '0.4';
      if (window.hackerAudio) window.hackerAudio.playInvasionAlert();

      // Disparar retaliação da IA
      window.botAI.executeCounterAttack(bot.ip);

      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.style.background = '#450a0a';
        resultBox.style.border = '1px solid #d0443a';
        resultBox.style.color = '#f79a91';
        resultBox.innerHTML = `
          <div style="font-weight: bold; font-size: 0.95rem; margin-bottom: 0.35rem;">ALERTA: CONTRA-RASTREAMENTO ATINGIU 100%!</div>
          <div>O bot defensor <strong>${bot.handle}</strong> rastreou seu IP e iniciou protocolo de contra-ataque cibernético. A sessão foi abortada por segurança.</div>
        `;
      }
    }
  );
}

function executeCrackerBypass() {
  window.traceEngine.executeBypass();
  if (window.hackerAudio) window.hackerAudio.playKeyClick();
}

function abortCrackerAttack() {
  window.traceEngine.stop();
  const btnStart = document.getElementById('btnCrackerStart');
  const btnBypass = document.getElementById('btnCrackerBypass');
  if (btnStart) { btnStart.disabled = false; btnStart.style.opacity = '1'; }
  if (btnBypass) { btnBypass.disabled = true; btnBypass.style.opacity = '0.4'; }
}

function enslaveBotToC2(ip) {
  const bot = window.botRegistry.getBotByIp(ip);
  if (bot) {
    window.botnetC2.addSlave(bot);
    alert(`Nó ${bot.handle} [${ip}] escravizado com sucesso na Botnet C2!`);
    renderC2UI();
  }
}

function drainBotBank(ip) {
  const bot = window.botRegistry.getBotByIp(ip);
  if (bot && bot.bankAccount) {
    const loot = bot.bankAccount.balance;
    bot.bankAccount.balance = 0;
    if (loot >= 100 && window.nineSystemsEngine) {
      window.nineSystemsEngine.addDirtyMoney(loot, `Bot ${bot.handle} [${ip}]`);
    } else if (window.currentWallet) {
      const fn = () => { window.currentWallet.balance = parseFloat(window.currentWallet.balance) + loot; };
      if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') window.integrityGuard.runAuthorized(fn);
      else fn();
    }
    if (typeof updateHudDisplays === 'function') updateHudDisplays();
    if (typeof window.addLocalLog === 'function') {
      window.addLocalLog('BANK-WIRE', `Saldo drenado de ${bot.handle} [${ip}]: +$ ${loot}.00 HC (${loot >= 100 ? 'Dinheiro Sujo' : 'Limpo'})`, 'success');
    }
    if (window.hackerAudio) window.hackerAudio.playMoneyCollect();
    if (typeof window.showToast === 'function') {
      window.showToast(loot >= 100
        ? `🩸 +$ ${loot}.00 em Dinheiro Sujo drenado de ${bot.handle}! Lave nas Empresas de Lavagem antes de gastar!`
        : `+$ ${loot}.00 HC drenados de ${bot.handle}!`);
    }
  }
}

function wipeBotLogsViaBtn(ip) {
  const ok = window.botAI.wipeLogs(ip);
  alert(`Logs em ${ip} expurgados com sucesso! Qualquer contra-ataque pendente foi abortado.`);
}

// =========================================================================
// RENDERER DA CENTRAL C2 (BOTNET MATRIX)
// =========================================================================

function renderC2UI(containerId = 'botnetC2Body') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const c2 = window.botnetC2;
  const rate = c2.getIncomeRate();
  const prof = c2.profile;
  const bonusMult = c2.getBonusMultiplier();

  let slavesRows = '';
  if (c2.slaves.length === 0) {
    slavesRows = `<div style="padding: 1rem; color: #838d9b; font-size: 0.8rem; text-align: center;">Nenhum nó escravizado. Use o Cracker para infectar alvos.</div>`;
  } else {
    c2.slaves.forEach((s, idx) => {
      const tierBadge = s.tier === 1 
        ? '<span style="background: rgba(34, 211, 238, 0.15); color: #22d3ee; padding: 2px 6px; border-radius: 4px; font-size: 0.72rem;">Tier I</span>'
        : (s.tier === 2 
          ? '<span style="background: rgba(240, 160, 58, 0.15); color: #f0a03a; padding: 2px 6px; border-radius: 4px; font-size: 0.72rem;">Tier II</span>'
          : '<span style="background: rgba(208, 68, 58, 0.15); color: #d0443a; padding: 2px 6px; border-radius: 4px; font-size: 0.72rem;">Tier III</span>');

      const liveRate = (s.baseRate * c2.multiplier * bonusMult).toFixed(2);

      slavesRows += `
        <div class="c2-slave-item">
          <div>
            <strong>${s.handle}</strong> [${s.ip}] ${tierBadge}
          </div>
          <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
            <span style="color: var(--green-safe); white-space: nowrap; font-family: var(--hc-font-mono); font-size: 0.8rem;">+$ ${liveRate} HC/s</span>
            <button class="btn-submit" style="width: auto; margin: 0; padding: 0.25rem 0.65rem; font-size: 0.72rem; background: #d0443a; border-color: #d0443a;" onclick="releaseC2Slave('${s.ip}')">Liberar</button>
          </div>
        </div>
      `;
    });
  }

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <!-- Stats Cards Topo -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px;">
        <div style="background: #1b2027; border: 1px solid #262c35; border-radius: 6px; padding: 0.75rem;">
          <div style="font-size: 0.72rem; color: #aab3c0;">ZUMBIS ATIVOS</div>
          <div style="font-size: 1.25rem; font-weight: bold; color: var(--cyan-neon);">${c2.slaves.length} Nós</div>
        </div>
        <div style="background: #1b2027; border: 1px solid #262c35; border-radius: 6px; padding: 0.75rem;">
          <div style="font-size: 0.72rem; color: #aab3c0;">TAXA DE MINERAÇÃO</div>
          <div style="font-size: 1.25rem; font-weight: bold; color: var(--green-safe);">$ ${rate.toFixed(2)} HC/s</div>
        </div>
        <div style="background: #1b2027; border: 1px solid #262c35; border-radius: 6px; padding: 0.75rem;">
          <div style="font-size: 0.72rem; color: #aab3c0;">LUCRO ACUMULADO</div>
          <div id="c2EarnedLive" style="font-size: 1.25rem; font-weight: bold; color: var(--amber-warn);">$ ${c2.accumulatedProfits.toFixed(2)} HC</div>
        </div>
      </div>

      <!-- Perfis de Operação Global -->
      <div>
        <label style="font-size: 0.76rem; color: #aab3c0; font-weight: bold; display: block; margin-bottom: 6px;">PERFIL DE OPERAÇÃO GLOBAL DO ENXAME:</label>
        <div class="c2-profile-grid">
          <div class="c2-profile-card ${prof === 'ghost' ? 'active-ghost' : ''}" onclick="selectC2Profile('ghost')">
            <div style="font-weight: bold; color: var(--cyan-neon); font-size: 0.85rem; margin-bottom: 2px;">Modo Fantasma</div>
            <div style="font-size: 0.72rem; color: #aab3c0;">15% CPU. Mineração contínua e oculta (1.0x). Risco quase zero.</div>
          </div>
          <div class="c2-profile-card ${prof === 'overclock' ? 'active-overclock' : ''}" onclick="selectC2Profile('overclock')">
            <div style="font-weight: bold; color: var(--amber-warn); font-size: 0.85rem; margin-bottom: 2px;">Modo Overclock</div>
            <div style="font-size: 0.72rem; color: #aab3c0;">85% CPU. Renda máxima (3.5x). Risco elevado de alarme no alvo.</div>
          </div>
          <div class="c2-profile-card ${prof === 'ddos' ? 'active-ddos' : ''}" onclick="selectC2Profile('ddos')">
            <div style="font-weight: bold; color: #d0443a; font-size: 0.85rem; margin-bottom: 2px;">Modo DDoS Swarm</div>
            <div style="font-size: 0.72rem; color: #aab3c0;">100% da banda. Mineração pausada p/ concentrar bombardeio.</div>
          </div>
        </div>
      </div>

      <!-- Tabela de Escravos -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 0.76rem; color: #aab3c0; font-weight: bold;">MÁQUINAS ZUMBIS INFECTADAS:</span>
          <button class="btn-submit" style="width: auto; margin: 0; padding: 0.3rem 0.8rem; font-size: 0.75rem;" onclick="infectNewRandomSlave()">Infectar nó de amostra</button>
        </div>
        <div class="c2-slave-list">
          ${slavesRows}
        </div>
      </div>

      <!-- Botão de Coleta -->
      <button class="btn-submit" style="margin: 0; padding: 0.6rem; font-size: 0.9rem; background: #059669; border-color: #35b877;" onclick="collectC2Profits()">
        COLETAR RENDIMENTOS DA MINERAÇÃO
      </button>
    </div>
  `;
}

function selectC2Profile(mode) {
  window.botnetC2.setProfile(mode);
  renderC2UI();
}

function releaseC2Slave(ip) {
  window.botnetC2.removeSlave(ip);
  renderC2UI();
}

function infectNewRandomSlave() {
  const bots = window.botRegistry.getAllBots();
  const randomBot = bots[Math.floor(Math.random() * bots.length)];
  window.botnetC2.addSlave(randomBot);
  renderC2UI();
}

function collectC2Profits() {
  const amount = window.botnetC2.collectProfits();
  if (amount > 0) {
    alert(`Coleta realizada! Creditado $ ${amount.toFixed(2)} HC na sua carteira.`);
    renderC2UI();
  } else {
    alert('Nenhum rendimento pendente para resgatar no momento.');
  }
}

// Inicialização Global
window.botRegistry = new BotNetworkRegistry();
window.botScheduler = new BotScheduler(window.botRegistry);
window.traceEngine = new TracebackEngine();
window.botAI = new BotAIService();
window.botnetC2 = new BotnetC2Engine();

window.renderCrackerUI = renderCrackerUI;
window.renderC2UI = renderC2UI;

