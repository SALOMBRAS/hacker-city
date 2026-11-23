/**
 * ============================================================================
 * HACKER CITY WEB — AS TOP 10 MELHORES IDEIAS SELECIONADAS DAS 200
 * (CAUSA & EFEITO REAL, LADOS BONS × LADOS NEGATIVOS & REGRAS INLINE)
 * ============================================================================
 * #01 Chantagem Corporativa por Vídeo CFTV (120 MB no disco, 1x/4h por empresa;
 *     Vazar p/ Imprensa = -18% TIX + +40 REP + $0 vs Extorquir em BTC $3K/$9K/$22K;
 *     Se Diretor recusar blefe = $0 + Heat 5/5 + FBI Wanted + +2.0 FW por 2h!)
 * #02 Evolução de Base Física em 3 Portes (100% Dinheiro Limpo + 0 faturas vencidas:
 *     Quitinete $280/0°C/2 VPS -> Studio $85K/$950/-5°C/5 VPS/+15% Net ->
 *     Bunker $320K/$2.800/-12°C/10 VPS/+25% Net/+8s Popover 23s!
 *     Despejo em 3/3 meses: perde Studio/Bunker p/ sempre sem reembolso!)
 * #03 Leilão Clandestino de Servidores Apreendidos ("Storage Wars Hacker":
 *     1 lote a cada 2h reais, lance mín $8.000 Limpos + passo $1.500, Sonda $1.000
 *     c/ Analyzer >= v4.0; 65% Tesouro vs 35% Lote-Bomba / Malware Judicial se AV < v3.0!)
 * #04 12 Blocos "Relíquia" Ring-0 & Encomendas Exclusivas no Lab (extraídos c/ Seeker >= v3.0
 *     em servidores Tier 4-5; Encomenda paga $18.000 Limpos + 2 Catalisadores mas entrega
 *     100% da posse do binário à facção; Nota < B c/ Relíquia = Kernel Panic v0.0 + +18°C!)
 * #05 Bloqueio Judicial ("BACENJUD Hacker": 30% congelado em Heat 5/5 + 2% custódia > $100K)
 *     vs Cofre Físico Suíço 77.3.12.15 ($25K abertura, 4% taxa, +1.5% às 12h, 30m lockup SWIFT!)
 * #06 Matriz Física de Discos RAID-0 vs RAID-1 (exige >= 1.024 MB, 10m rebuild:
 *     RAID-0 = +25% velocidade, MAS DDoS < 40% saúde corrompe/deleta 1 software/vírus!
 *     RAID-1 = 100% imune à corrupção, MAS corta -50% da capacidade útil em MB!)
 * #07 Patrocínio Corporativo de Clãs ($30K caução Limpa: >=70% integridade paga $8.500 às 12h;
 *     <35% integridade confisca os $30K!) + Guerra de Clãs em 3 Frentes (DDoS + CFTV + Blue-Team)
 * #08 Escalação Manual FTP/SSH -> ROOT ("Buffer Overflow Stack" 12s, 1x/30m: vitória = ROOT;
 *     Segfault = kick + tranca portas 21/22 por 20m + grava IP + +1 Heat!) + Bypass IPTables
 * #09 Contratos Mercenários P2P c/ Custódia Escrow no Fórum ($2K-$25K Limpos + 15% taxa
 *     não-reembolsável; paga em Dinheiro Sujo; falhar 30m de reserva = -35 REP!)
 * #10 Sistema de "Nêmesis Evolutivo" (3 invasões no mesmo Bot -> +1.5 FW/Hasher adaptativo,
 *     farpa no Fórum, 3x saque + Catalisador vs DDoS retaliatório!) & DEFCON Laranja Corporativo
 *     (4+ ataques/1h -> +1.5 FW + +60% caixa emergencial por 30m!)
 * ============================================================================
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtMoney(n) {
    return '$ ' + Math.round(Number(n || 0)).toLocaleString('pt-BR');
  }

  function runAuth(fn) {
    if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
      return window.integrityGuard.runAuthorized(fn);
    }
    return fn();
  }

  // Mapa Corporação <-> IP CFTV / Servidor
  const CORP_BY_IP = {
    '203.17.88.40': { symbol: 'FARO', name: 'Farofa Systems B2B' },
    '194.88.14.202': { symbol: 'MRDN', name: 'Meridian BioLabs' },
    '172.66.40.18': { symbol: 'AEGS', name: 'Aegis Security Corp' },
    '58.40.12.9': { symbol: 'CRVO', name: 'Corvo Cinza Logística' },
    '189.40.7.12': { symbol: 'KRNO', name: 'KronoTech Sistemas' },
    '192.99.44.80': { symbol: 'OMNI', name: 'OmniDyne Defense' },
    '77.3.10.44': { symbol: 'HEBC', name: 'HEBC Clearing Bank' },
    '209.141.55.10': { symbol: 'EVIL', name: 'EvilCorp Conglomerate' }
  };

  // Top #02: 3 Portes de Base Física (Esconderijo)
  const SAFEHOUSE_TIERS = {
    quitinete: {
      id: 'quitinete',
      order: 1,
      name: 'Quitinete Úmida (Centro Velho)',
      buyClean: 0,
      noonRent: 280,
      thermalBonusC: 0,
      maxVps: 2,
      netSpeedBonusPct: 0,
      extraDefenseSec: 0,
      desc: 'Base inicial improvisada. Aluguel enxuto às 12:00 ($ 280), sem isolamento acústico/térmico (0°C) e teto de 2 VPS.'
    },
    studio: {
      id: 'studio',
      order: 2,
      name: 'Studio Blindado Climatizado',
      buyClean: 85000,
      noonRent: 950,
      thermalBonusC: 5,
      maxVps: 5,
      netSpeedBonusPct: 15,
      extraDefenseSec: 0,
      desc: 'Ar-condicionado dedicado (-5°C na CPU), rack p/ até 5 VPS e link dedicado (+15% velocidade de rede). Aluguel às 12:00: $ 950.'
    },
    bunker: {
      id: 'bunker',
      order: 3,
      name: 'Bunker Subterrâneo Tier-IV',
      buyClean: 320000,
      noonRent: 2800,
      thermalBonusC: 12,
      maxVps: 10,
      netSpeedBonusPct: 25,
      extraDefenseSec: 8,
      desc: 'Subsolo refrigerado (-12°C na CPU), cluster p/ 10 VPS, +25% rede e +8s extras no Popover de Defesa Ativa (23s totais!). Aluguel às 12:00: $ 2.800.'
    }
  };

  // Top #04: 12 Blocos "Relíquia" Ring-0 (4 por Round: R1, R2, R3)
  const RELIC_RING0_BLOCKS = [
    // Round 1 (4 blocos)
    {
      id: 'REL_R1_01', round: 1, tier: 5, isRelic: true, hostIp: '209.141.55.10', hostName: 'EvilCorp Conglomerate',
      lang: 'Ring-0 ASM', channel: 'tls_mem', family: 'vbank',
      fn: 'ring0_msr_syscall_hijack:', abi: 'ABI: ia32_lstar -> tls_plain_buf',
      hint: '[RELÍQUIA RING-0] Intercepta chamadas MSR do kernel p/ capturar pacotes bancários antes do TLS (Nota < B causa Kernel Panic!).',
      code: `mov ecx, 0xC0000082 ; IA32_LSTAR\nrdmsr\nmov [orig_syscall], rax\nwrmsr`
    },
    {
      id: 'REL_R1_02', round: 1, tier: 5, isRelic: true, hostIp: '161.89.2.1', hostName: 'NSA Signal Intelligence',
      lang: 'Ring-0 C', channel: 'simd_alu', family: 'vminer',
      fn: 'void* vmx_root_avx512_steal(void)', abi: 'ABI: vmcs_host -> sha_ni_pipe',
      hint: '[RELÍQUIA RING-0] Reserva ciclos hipervisor VMX invisíveis ao sistema p/ mineração SHA-NI máxima.',
      code: `__vmx_vmwrite(HOST_CR4, cr4 | X86_CR4_OSXSAVE);\nreturn map_smram_hash_lanes();`
    },
    {
      id: 'REL_R1_03', round: 1, tier: 5, isRelic: true, hostIp: '161.89.1.1', hostName: 'FBI Cybercrime Mainframe',
      lang: 'Ring-0 Rust', channel: 'raw_pkt', family: 'vddos',
      fn: 'unsafe fn ebpf_xdp_nic_dma_ring()', abi: 'ABI: dma_ring0 -> line_rate_burst',
      hint: '[RELÍQUIA RING-0] Injeta descritores DMA direto no silício da placa de rede sem passar pelo kernel.',
      code: `let bar = ioremap_nocache(0xFEBC0000, 0x4000);\nwrite_volatile(bar.add(0x3818), 0xFFFF);`
    },
    {
      id: 'REL_R1_04', round: 1, tier: 5, isRelic: true, hostIp: '77.3.13.99', hostName: 'Ultimate Quantum Bank',
      lang: 'Ring-0 C99', channel: 'p2p_chunk', family: 'vwarez',
      fn: 'int nvme_sqe_direct_p2p_bus(void)', abi: 'ABI: pcie_p2p -> swarm_slices',
      hint: '[RELÍQUIA RING-0] Transfere blocos do NVMe direto para a placa de rede via barramento PCIe P2P.',
      code: `pci_p2pdma_add_resource(nvme_dev, bar0, 1<<24, 0);\nreturn enable_bus_master_swarm();`
    },
    // Round 2 (4 blocos)
    {
      id: 'REL_R2_01', round: 2, tier: 5, isRelic: true, hostIp: '209.141.55.10', hostName: 'EvilCorp Conglomerate',
      lang: 'Ring-0 C99', channel: 'universal_boost', family: 'any', subRole: 'booster',
      fn: 'void smi_handler_ghost_tick(void)', abi: 'ABI: smm_ring_minus2 -> zero_latency_exec',
      hint: '[RELÍQUIA RING-0] Executa payload em System Management Mode invisível a qualquer monitor de processos.',
      code: `outb(0xB2, 0xE7); /* Trigger SMI */\nsmm_dispatch_shadow_queue();`
    },
    {
      id: 'REL_R2_02', round: 2, tier: 5, isRelic: true, hostIp: '161.89.2.1', hostName: 'NSA Signal Intelligence',
      lang: 'Ring-0 ASM', channel: 'simd_alu', family: 'vminer', subRole: 'generator',
      fn: 'quantum_sha256_16way_zmm:', abi: 'ABI: zmm0..zmm31 -> 16x_nonce_hit',
      hint: '[RELÍQUIA RING-0] Desdobra 16 pistas ZMM simultâneas de hash SHA-256 em nível de microcódigo.',
      code: `vpaddd zmm16, zmm0, [rip + nsa_k256]\nsha256rnds2 xmm8, xmm9\nvzeroupper`
    },
    {
      id: 'REL_R2_03', round: 2, tier: 5, isRelic: true, hostIp: '77.3.13.99', hostName: 'Ultimate Quantum Bank',
      lang: 'Ring-0 Rust', channel: 'tls_mem', family: 'vbank', subRole: 'mutator',
      fn: 'unsafe fn shadow_swift_ledger_patch()', abi: 'ABI: clear_iban_frame -> swift_mirror_zero',
      hint: '[RELÍQUIA RING-0] Espelha centavos institucionais direto no buffer SWIFT do kernel sem invalidar MAC.',
      code: `core::ptr::copy_nonoverlapping(src_iban, shadow_slot, 32);\nrecalc_quantum_crc64(shadow_slot);`
    },
    {
      id: 'REL_R2_04', round: 2, tier: 5, isRelic: true, hostIp: '161.89.1.1', hostName: 'FBI Cybercrime Mainframe',
      lang: 'Ring-0 C99', channel: 'mail_pipe', family: 'vspam', subRole: 'dispatcher',
      fn: 'int tcp_fastopen_kernel_flood_mta()', abi: 'ABI: zero_alloc_q -> tfo_smtp_256',
      hint: '[RELÍQUIA RING-0] Empacota 256 envelopes SMTP no próprio handshake SYN via TCP Fast Open de kernel.',
      code: `sk->sk_route_caps |= NETIF_F_TSO;\nreturn kernel_sendpage_batch(sk, mta_page, 256);`
    },
    // Round 3 (4 blocos)
    {
      id: 'REL_R3_01', round: 3, tier: 5, isRelic: true, hostIp: '161.89.2.1', hostName: 'NSA Signal Intelligence',
      lang: 'Ring-0 C99', channel: 'universal_cloak', family: 'any',
      fn: 'void dkmo_unlink_task_struct(void)', abi: 'ABI: init_task -> phantom_pid_0',
      hint: '[RELÍQUIA RING-0] Desvincula a struct do processo da lista do kernel — invisível ao ps/top e varreduras comuns.',
      code: `list_del_rcu(&current->tasks);\nsynchronize_rcu();`
    },
    {
      id: 'REL_R3_02', round: 3, tier: 5, isRelic: true, hostIp: '209.141.55.10', hostName: 'EvilCorp Conglomerate',
      lang: 'Ring-0 ASM', channel: 'tls_mem', family: 'vbank',
      fn: 'scrub_tlb_and_seal_iban:', abi: 'ABI: valid_mac_forge -> invlpg_stealth',
      hint: '[RELÍQUIA RING-0] Limpa entradas TLB do processador após desviar a transação bancária.',
      code: `invlpg [rdi]\nmfence\nxor eax, eax\nret`
    },
    {
      id: 'REL_R3_03', round: 3, tier: 5, isRelic: true, hostIp: '161.89.1.1', hostName: 'FBI Cybercrime Mainframe',
      lang: 'Ring-0 Rust', channel: 'raw_pkt', family: 'vddos',
      fn: 'unsafe fn mask_netfilter_conntrack()', abi: 'ABI: 64x_wire_pkt -> nf_notrack_seal',
      hint: '[RELÍQUIA RING-0] Marca todos os pacotes disparados com NF_STOP contornando logs de conntrack.',
      code: `(*skb).nfct = core::ptr::null_mut();\nNF_ACCEPT`
    },
    {
      id: 'REL_R3_04', round: 3, tier: 5, isRelic: true, hostIp: '77.3.13.99', hostName: 'Ultimate Quantum Bank',
      lang: 'Ring-0 C99', channel: 'simd_alu', family: 'vminer',
      fn: 'void thermal_msr_spoof_tdp(void)', abi: 'ABI: 8x_nonce_hit -> fake_idle_temp',
      hint: '[RELÍQUIA RING-0] Mascara telemetria de uso de CPU no host infectado para evitar suspeita do administrador.',
      code: `wrmsrl(MSR_IA32_THERM_STATUS, 0x88380000ULL);\nflush_stratum_ring();`
    }
  ];

  const SEEDED_ESCROW_CONTRACTS = [
    {
      id: 'escrow_seed_01',
      hirerTag: 'ZeroCool',
      objectiveKind: 'disable_cctv',
      objectiveLabel: 'Apagar Câmeras CFTV da Empresa',
      targetIp: '203.17.88.40',
      targetLabel: 'Farofa Systems B2B (203.17.88.40)',
      rewardDirty: 4500,
      notaryFeeBurned: 675,
      status: 'open',
      reservedByMe: false,
      reservedUntil: 0,
      isSeed: true
    },
    {
      id: 'escrow_seed_02',
      hirerTag: 'PhantomX',
      objectiveKind: 'crack_root',
      objectiveLabel: 'Quebrar Acesso Root Verificado',
      targetIp: '58.40.12.9',
      targetLabel: 'Corvo Cinza Logística (58.40.12.9)',
      rewardDirty: 6200,
      notaryFeeBurned: 930,
      status: 'open',
      reservedByMe: false,
      reservedUntil: 0,
      isSeed: true
    },
    {
      id: 'escrow_seed_03',
      hirerTag: 'm4riposa',
      objectiveKind: 'crack_root',
      objectiveLabel: 'Infiltrar Servidor KronoTech',
      targetIp: '189.40.7.12',
      targetLabel: 'KronoTech Sistemas (189.40.7.12)',
      rewardDirty: 8500,
      notaryFeeBurned: 1275,
      status: 'open',
      reservedByMe: false,
      reservedUntil: 0,
      isSeed: true
    }
  ];

  class TopTenEliteMechanicsEngine {
    constructor() {
      this.loadedUid = null;
      this.state = null;
      this.openRulebookMap = {};
      this.activeBoModal = null; // { ip, targetHex, options, expiresAt, timerId }
      this.ensureLoaded();
      this.registerRelicBlocksIntoLab();
      this.startBackgroundWatcher();
    }

    storageKey(uidOverride = null) {
      const uid = uidOverride || (window.currentProfile && window.currentProfile.id) || 'guest';
      return `HC_TOP_TEN_ELITE_V1_${uid}`;
    }

    buildDefaultState() {
      return {
        // #01 CFTV Extortion & Leaks
        extortionProofs: [],           // [{ id, ip, corpSymbol, corpName, capturedAt, sizeMb: 120 }]
        extortionCooldownByIp: {},     // ip -> timestamp (4h cooldown)
        extortionJobs: [],             // [{ id, ip, corpName, tier, rewardUsd, chancePct, resolvesAt, resolved }]
        corpFirewallBoostByIp: {},     // ip -> { bonusFw: 2.0, expiresAt }

        // #02 3-Tier Safehouse
        safehouseTier: 'quitinete',    // 'quitinete' | 'studio' | 'bunker'
        evictionHistoryCount: 0,

        // #03 Seized Server Auctions ("Storage Wars Hacker" — 1 lot / 2h)
        auctionState: {
          bucket: this.currentTwoHourBucket(),
          probedBucket: -1,
          probeHint: null,
          resolvedBucket: -1,
          lastOutcome: null,
          myBidClean: 0
        },

        // #04 12 Ring-0 Relic Blocks & Lab Commissions
        unlockedRelicIds: [],          // ['REL_R1_01', ...]
        extractedRelicByHost: {},      // hostIp -> timestamp
        activeLabCommission: {
          id: 'comm_cicada_01',
          factionName: 'Ordem Cicada 3301',
          reqFamily: 'vminer',
          reqMinVerInt: 25,
          rewardClean: 18000,
          rewardCatalysts: 2,
          completed: false
        },

        // #05 Judicial Freeze (BACENJUD) vs Swiss Physical Vault
        frozenCleanCash: 0,
        bacenjudActive: false,
        swissVaultOpened: false,
        swissVaultBalance: 0,
        swissRepatriations: [],        // [{ id, amountClean, requestedAt, availableAt, claimed }]

        // #06 Physical Disk RAID Matrix ('normal' | 'raid0' | 'raid1')
        raidMode: 'normal',
        raidRebuildUntil: 0,
        lastCorruptedSoft: null,

        // #07 Clan Corporate Sponsorship & 3-Front War
        clanSponsorship: null,         // { corpSymbol, corpName, depositClean: 30000, status: 'active' }
        warFronts: { ddos: 0, cctv: 0, blueteam: 0 },

        // #08 Buffer Overflow Stack (FTP/SSH -> ROOT) & IPTables Silent Bypass
        boAttemptCooldownByIp: {},     // ip -> timestamp (30m)
        portLockoutByIp: {},           // ip -> timestamp (20m Segfault lockout on ports 21/22!)
        iptablesCooldownByIp: {},      // ip -> timestamp (15m)
        iptablesStealthByIp: {},       // ip -> true (consumes on next drain/intrusion -> 0 Safenet alert)
        idsFirewallSpikeByIp: {},      // ip -> { bonusFw: 1.0, expiresAt }

        // #09 P2P Mercenary Escrow Contracts
        escrowContracts: JSON.parse(JSON.stringify(SEEDED_ESCROW_CONTRACTS)),

        // #10 Adaptive Nemesis Bots & Corporate DEFCON Laranja
        botHitCounts: {},              // botIp -> { count, lastMethod, adapted, handle }
        nemesisBotIp: null,
        corpHitTimestamps: {},         // corpIp -> [ts1, ts2, ...]
        defconOrangeByIp: {}           // corpIp -> expiresAt (30m: +1.5 FW, +1.0 Hasher, +60% cash)
      };
    }

    ensureLoaded() {
      const uid = (window.currentProfile && window.currentProfile.id) || 'guest';
      if (this.loadedUid === uid && this.state) return this.state;
      this.loadedUid = uid;

      let parsed = null;
      try {
        const raw = localStorage.getItem(this.storageKey(uid));
        if (raw) parsed = JSON.parse(raw);
      } catch (e) {}

      const def = this.buildDefaultState();
      this.state = parsed && typeof parsed === 'object' ? { ...def, ...parsed } : def;
      if (!Array.isArray(this.state.extortionProofs)) this.state.extortionProofs = [];
      if (!Array.isArray(this.state.extortionJobs)) this.state.extortionJobs = [];
      if (!Array.isArray(this.state.unlockedRelicIds)) this.state.unlockedRelicIds = [];
      if (!Array.isArray(this.state.swissRepatriations)) this.state.swissRepatriations = [];
      if (!Array.isArray(this.state.escrowContracts) || this.state.escrowContracts.length === 0) {
        this.state.escrowContracts = JSON.parse(JSON.stringify(SEEDED_ESCROW_CONTRACTS));
      }
      if (!this.state.warFronts || typeof this.state.warFronts !== 'object') {
        this.state.warFronts = { ddos: 0, cctv: 0, blueteam: 0 };
      }
      return this.state;
    }

    save() {
      if (!this.state) return;
      try {
        localStorage.setItem(this.storageKey(), JSON.stringify(this.state));
      } catch (e) {}
      if (window.onlineEngine && typeof window.onlineEngine.scheduleSave === 'function') {
        window.onlineEngine.scheduleSave(false);
      }
    }

    getSnapshotState() {
      this.ensureLoaded();
      return JSON.parse(JSON.stringify(this.state));
    }

    applySnapshotState(snap) {
      if (!snap || typeof snap !== 'object') return;
      this.loadedUid = (window.currentProfile && window.currentProfile.id) || 'guest';
      const def = this.buildDefaultState();
      this.state = { ...def, ...snap };
      this.registerRelicBlocksIntoLab();
      try {
        localStorage.setItem(this.storageKey(), JSON.stringify(this.state));
      } catch (e) {}
    }

    toggleRulebook(key) {
      this.openRulebookMap[key] = !this.openRulebookMap[key];
      if (window.winManager) {
        const cur = window.winManager.current;
        if (cur === 'winOpsHub' && window.ecosystemHub) window.ecosystemHub.renderUI();
        if (cur === 'winQuitinete' && window.quitineteEngine && window.currentWallet) window.quitineteEngine.renderUI('quitineteAppBody', window.currentWallet.balance);
        if (cur === 'winBank' && window.multiBankEngine) window.multiBankEngine.renderMultiBankOverview();
        if (cur === 'winHardware' && window.hardwareEngine) window.hardwareEngine.rerender();
        if (cur === 'winClan' && window.clanEngine) window.clanEngine.renderUI();
        if (cur === 'winForum' && window.darknetSocialEngine) window.darknetSocialEngine.renderForumUI();
        if (cur === 'winVirusLab' && window.virusLabEngine) window.virusLabEngine.renderUI();
        if (cur === 'winBrowser' && window.internetEngine) window.internetEngine.render();
      }
    }

    renderInlineRulesDrawerHtml(key, title, goodText, badText, rulesHtml) {
      const isOpen = !!this.openRulebookMap[key];
      return `
        <div style="margin-top:8px;">
          <button type="button" class="hc-btn ghost sm" id="btnToggleTop10Rules_${esc(key)}"
            style="font-size:11.5px;border-color:rgba(56,189,248,0.4);color:#7dd3fc;"
            onclick="window.topTenMechanics.toggleRulebook('${esc(key)}')">
            📖 ${isOpen ? 'Ocultar Regras' : 'Abrir Regras'} — ${esc(title)}
          </button>
          ${isOpen ? `
            <div style="margin-top:8px;padding:12px 14px;border-radius:8px;background:#090e16;border:1px solid rgba(56,189,248,0.35);font-size:12px;line-height:1.5;color:var(--hc-text-2);">
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:8px;margin-bottom:8px;">
                <div style="padding:8px 10px;border-radius:6px;background:rgba(53,184,119,0.09);border:1px solid rgba(53,184,119,0.32);color:#86efac;">
                  <strong>✅ Lado Bom:</strong> ${goodText}
                </div>
                <div style="padding:8px 10px;border-radius:6px;background:rgba(229,83,75,0.09);border:1px solid rgba(229,83,75,0.35);color:#fca5a5;">
                  <strong>⚠️ Lado Negativo / Risco:</strong> ${badText}
                </div>
              </div>
              <div style="color:var(--hc-text);">${rulesHtml}</div>
            </div>
          ` : ''}
        </div>
      `;
    }

    startBackgroundWatcher() {
      if (typeof window === 'undefined') return;
      if (this._bgTimer) clearInterval(this._bgTimer);
      this._bgTimer = setInterval(() => {
        this.tickTimersAndChecks();
      }, 4000);
    }

    tickTimersAndChecks() {
      this.ensureLoaded();
      const now = Date.now();
      let dirty = false;

      // 1. Checar liquidação de repatriação do Cofre Suíço (30m)
      this.state.swissRepatriations.forEach((r) => {
        if (!r.claimed && now >= r.availableAt) {
          r.claimed = true;
          runAuth(() => {
            if (window.currentWallet) {
              window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + Number(r.amountClean || 0)).toFixed(2);
            }
          });
          dirty = true;
          if (typeof window.showToast === 'function') {
            window.showToast(`🇨🇭 Repatriação Suíça concluída! +${fmtMoney(r.amountClean)} Limpos creditados na sua conta principal!`);
          }
        }
      });

      // 2. Checar Bloqueio Judicial Automático (BACENJUD em Heat === 5)
      this.evaluateBacenjudFreeze();

      // 3. Checar expiração de reservas de Contratos Mercenários P2P (30m -> -35 REP!)
      this.checkExpiredMercenaryReservations(now);

      // 4. Checar Despejo de Studio/Bunker em 3/3 meses acumulados!
      this.checkSafehouseEvictionOnThreeMonths();

      if (dirty) {
        this.save();
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      }
    }

    // =========================================================================
    // TOP #01: CHANTAGEM CORPORATIVA POR VÍDEO CFTV (120 MB · IMPRENSA vs BTC)
    // =========================================================================
    getExtortionProofsDiskMb() {
      this.ensureLoaded();
      return (this.state.extortionProofs || []).reduce((acc, p) => acc + Number(p.sizeMb || 120), 0);
    }

    captureExtortionProof(ip) {
      this.ensureLoaded();
      const corp = CORP_BY_IP[ip] || { symbol: 'FARO', name: (window.internetEngine && window.internetEngine.resolveHost(ip)?.hostname) || ip };
      const now = Date.now();
      const cdUntil = Number(this.state.extortionCooldownByIp[ip] || 0);
      if (cdUntil > now) {
        const remMin = Math.ceil((cdUntil - now) / 60000);
        const msg = `⏳ Cooldown CFTV: esta corporação já teve prova íntima extraída recentemente. Aguarde ${remMin} min.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'CFTV_PROOF_COOLDOWN', message: msg };
      }

      if (this.state.extortionProofs.some((p) => p.ip === ip)) {
        const msg = 'Você já possui uma gravação de chantagem (120 MB) desta empresa no seu disco! Use-a abaixo primeiro.';
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'ALREADY_HAS_PROOF', message: msg };
      }

      const usedMb = window.softwareEngine ? window.softwareEngine.getUsedHddMb() : 0;
      const maxMb = window.softwareEngine ? window.softwareEngine.getMaxHddMb() : 350;
      if (usedMb + 120 > maxMb) {
        const msg = `💾 Disco insuficiente para o bruto CFTV! A prova exige 120 MB livres (${usedMb} / ${maxMb} MB ocupados). Libere espaço ou faça upgrade de HD/SSD!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'DISK_FULL_120MB', message: msg };
      }

      const proof = {
        id: `proof_${ip.replace(/\./g, '_')}_${now}`,
        ip,
        corpSymbol: corp.symbol,
        corpName: corp.name,
        sizeMb: 120,
        capturedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      this.state.extortionProofs.unshift(proof);
      this.state.extortionCooldownByIp[ip] = now + 4 * 60 * 60 * 1000; // 4h real time
      this.save();

      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      if (window.internetEngine) {
        window.internetEngine.appendServerLog(ip, `${myIp} RTSP/554 exfiltrated_executive_vault_raw.mkv [120MB]`);
        window.internetEngine.render();
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`📹 Prova de Chantagem capturada de ${corp.name} (ocupando 120 MB reais no seu disco)! Escolha Vazar p/ Imprensa ou Extorquir BTC!`);
      }
      return { success: true, proof };
    }

    leakProofToPress(proofId) {
      this.ensureLoaded();
      const idx = this.state.extortionProofs.findIndex((p) => p.id === proofId);
      if (idx < 0) return { success: false, message: 'Prova não encontrada no disco.' };
      const proof = this.state.extortionProofs[idx];

      let oldPrice = 0;
      let newPrice = 0;
      if (window.mmoGlobalMarket) {
        const gRes = window.mmoGlobalMarket.applyGlobalStockImpact(proof.corpSymbol, -0.18, 'cctv_press_leak');
        if (!gRes.ok) {
          if (typeof window.showToast === 'function' && gRes.message) window.showToast(gRes.message);
          return { success: false, code: gRes.code, message: gRes.message };
        }
        oldPrice = gRes.oldPrice;
        newPrice = gRes.newPrice;
      }

      this.state.extortionProofs.splice(idx, 1);
      if (window.ecosystemHub) {
        window.ecosystemHub.ensureLoaded();
        if (window.mmoGlobalMarket) {
          window.ecosystemHub.syncStocksFromGlobalMarket();
          window.ecosystemHub.save();
        } else {
          const st = window.ecosystemHub.state.stocks && window.ecosystemHub.state.stocks[proof.corpSymbol];
          if (st) {
            oldPrice = st.price;
            st.prevClose = st.price;
            st.price = Math.max(4, +(st.price * 0.82).toFixed(2));
            st.integrity = Math.max(20, st.integrity - 24);
            st.history.push(st.price);
            if (st.history.length > 16) st.history.shift();
            newPrice = st.price;
            window.ecosystemHub.save();
          }
        }
      }

      runAuth(() => {
        if (window.currentProfile) {
          window.currentProfile.reputation = Number(window.currentProfile.reputation || 0) + 40;
        }
      });

      if (window.darknetSocialEngine && Array.isArray(window.darknetSocialEngine.news)) {
        window.darknetSocialEngine.news.unshift({
          id: 'news_leak_' + Date.now(),
          edition: 'Plantão Urgente',
          category: 'Escândalo CFTV',
          badgeCls: 'danger',
          date: new Date().toLocaleDateString('pt-BR'),
          headline: `VÍDEO VAZADO DERRUBA ${proof.corpSymbol} EM -18% NA BOLSA CYBERSTOCK!`,
          lead: `Imagens internas de 120 MB revelam movimentações ilícitas na diretoria de ${proof.corpName}.`,
          body: `As ações de ${proof.corpSymbol} despencaram de $ ${oldPrice.toFixed(2)} para $ ${newPrice.toFixed(2)} minutos após a divulgação anônima. Operadores posicionados em Short comemoram lucro recorde.`,
          source: 'Imprensa Independente HC'
        });
        window.darknetSocialEngine.saveState();
      }

      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.internetEngine) window.internetEngine.render();
      const msg = `📰 ESCÂNDALO PUBLICADO! Ações da ${proof.corpSymbol} despencaram -18% ($ ${oldPrice.toFixed(2)} → $ ${newPrice.toFixed(2)}), +40 REP ganhos e 120 MB liberados no disco ($ 0 caixa direto)!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, mode: 'press_leak', oldPrice, newPrice, repGained: 40, message: msg };
    }

    extortBoardInBtc(proofId, demandTier = 'low', forceOutcome = null) {
      this.ensureLoaded();
      const idx = this.state.extortionProofs.findIndex((p) => p.id === proofId);
      if (idx < 0) return { success: false, message: 'Prova não encontrada no disco.' };
      const proof = this.state.extortionProofs[idx];
      this.state.extortionProofs.splice(idx, 1);

      const tiers = {
        low:  { usd: 3000,  chance: 0.85, waitMin: 5,  label: 'Moderado ($ 3.000 em BTC · 85%)' },
        mid:  { usd: 9000,  chance: 0.55, waitMin: 10, label: 'Agressivo ($ 9.000 em BTC · 55%)' },
        high: { usd: 22000, chance: 0.25, waitMin: 15, label: 'Implacável ($ 22.000 em BTC · 25%)' }
      };
      const cfg = tiers[demandTier] || tiers.low;
      const accepted = forceOutcome === 'accept'
        ? true
        : (forceOutcome === 'refuse' ? false : (Math.random() < cfg.chance));

      if (accepted) {
        let btcAdded = 0;
        if (window.bitcoinEngine) {
          window.bitcoinEngine.ensureLoaded();
          const price = Number(window.bitcoinEngine.priceUsd || 84000);
          btcAdded = +(cfg.usd / price).toFixed(8);
          window.bitcoinEngine.btcBalance = +(Number(window.bitcoinEngine.btcBalance || 0) + btcAdded).toFixed(8);
          if (Array.isArray(window.bitcoinEngine.ledger)) {
            window.bitcoinEngine.ledger.unshift({
              type: 'EXTORSÃO CFTV',
              btc: `+${btcAdded.toFixed(6)} BTC`,
              usd: fmtMoney(cfg.usd),
              at: new Date().toLocaleTimeString('pt-BR')
            });
          }
          window.bitcoinEngine.save();
        }
        this.save();
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
        if (window.internetEngine) window.internetEngine.render();
        const msg = `₿ DIRETORIA CEDEU À CHANTAGEM! +${btcAdded.toFixed(6)} BTC (~${fmtMoney(cfg.usd)}) transferidos para sua carteira e 120 MB apagados!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: true, accepted: true, usdValue: cfg.usd, btcAdded, message: msg };
      }

      // LADO NEGATIVO PESADO: Diretor recusou o blefe -> $0 + Heat 5/5 + FBI Wanted + +2.0 Firewall por 2h!
      this.state.corpFirewallBoostByIp[proof.ip] = {
        bonusFw: 2.0,
        expiresAt: Date.now() + 2 * 60 * 60 * 1000
      };
      runAuth(() => {
        if (window.currentProfile) {
          window.currentProfile.heat_level = 5;
        }
      });
      if (window.safenetFbiEngine && typeof window.safenetFbiEngine.evaluatePlayerCrime === 'function') {
        window.safenetFbiEngine.evaluatePlayerCrime(`Extorsão Corporativa CFTV denunciada por ${proof.corpName}`, cfg.usd, proof.ip);
      }
      this.evaluateBacenjudFreeze();
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.internetEngine) window.internetEngine.render();
      const msg = `🚨 BLEFE RECUSADO! O CEO da ${proof.corpName} acionou o FBI: você recebeu $ 0, seu Heat subiu para 5/5 (Procurado Federal!) e o Firewall de ${proof.ip} subiu +2.0 por 2h!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, accepted: false, usdValue: 0, heatLevel: 5, fwBoost: 2.0, message: msg };
    }

    renderCctvExtortionBarHtml(host) {
      this.ensureLoaded();
      if (!host || !host.ip) return '';
      const corp = CORP_BY_IP[host.ip] || { symbol: 'CORP', name: host.hostname || host.ip };
      const myProof = this.state.extortionProofs.find((p) => p.ip === host.ip);
      const cdRemMin = Math.max(0, Math.ceil((Number(this.state.extortionCooldownByIp[host.ip] || 0) - Date.now()) / 60000));
      const fwBoost = this.getHostDynamicDefenseModifiers(host.ip);

      return `
        <div class="hc-card" id="cctvExtortionCard" style="margin-bottom:10px;padding:12px 14px;border-color:rgba(245,158,11,0.45);background:linear-gradient(160deg,rgba(25,18,12,0.94),rgba(14,18,26,0.96));">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span class="hc-badge warn">📹 CHANTAGEM POR CÂMERA (${esc(corp.symbol)})</span>
                <span class="mono" style="font-size:11.5px;color:var(--hc-text-3);">Ocupa 120 MB no disco · 1 vez a cada 4h</span>
                ${fwBoost.extortionFw > 0 ? `<span class="hc-badge danger">EMPRESA EM ALERTA (+${fwBoost.extortionFw.toFixed(1)} Firewall)</span>` : ''}
              </div>
              <div style="font-size:12.5px;color:var(--hc-text-2);margin-top:4px;">
                ${myProof
                  ? `📹 Vídeo salvo no seu PC (<strong>120 MB</strong> ocupados). Escolha o que fazer com a gravação de <strong>${esc(corp.name)}</strong>:`
                  : `Grave um vídeo secreto de <strong>120 MB</strong> desta empresa para derrubar <strong>${esc(corp.symbol)}</strong> em <strong>-18%</strong> na Bolsa ou cobrar resgate em Bitcoin!`}
              </div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${!myProof ? `
                <button type="button" id="btnCaptureExtortionProof" class="hc-btn primary sm" ${cdRemMin > 0 ? 'disabled' : ''}
                  onclick="window.topTenMechanics.captureExtortionProof('${esc(host.ip)}')">
                  ${cdRemMin > 0 ? `⏳ Aguarde (${cdRemMin}m)` : '📹 Gravar Prova (120 MB)'}
                </button>
              ` : `
                <button type="button" id="btnLeakProofPress" class="hc-btn sm" style="border-color:#38bdf8;color:#7dd3fc;"
                  onclick="window.topTenMechanics.leakProofToPress('${esc(myProof.id)}')">
                  📰 Vazar na Imprensa (-18% ${esc(corp.symbol)})
                </button>
                <button type="button" id="btnExtortBtcLow" class="hc-btn primary sm"
                  onclick="window.topTenMechanics.extortBoardInBtc('${esc(myProof.id)}', 'low')">
                  ₿ Cobrar $ 3 mil BTC (85%)
                </button>
                <button type="button" id="btnExtortBtcMid" class="hc-btn sm" style="border-color:var(--hc-warning);color:#fde68a;"
                  onclick="window.topTenMechanics.extortBoardInBtc('${esc(myProof.id)}', 'mid')">
                  ₿ Cobrar $ 9 mil BTC (55%)
                </button>
                <button type="button" id="btnExtortBtcHigh" class="hc-btn sm" style="border-color:var(--hc-danger);color:#fca5a5;"
                  onclick="window.topTenMechanics.extortBoardInBtc('${esc(myProof.id)}', 'high')">
                  ₿ Cobrar $ 22 mil BTC (25%)
                </button>
              `}
            </div>
          </div>
          <div style="margin-top:8px;padding:8px 11px;border-radius:7px;background:#08111a;border:1px solid rgba(56,189,248,0.3);display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-size:11.8px;">
            <span style="color:var(--hc-text-2);">
              📉 <strong>Dica para ganhar Dinheiro Limpo:</strong> Ação <strong>${esc(corp.symbol)}</strong> está em
              <strong style="color:#4ade80;">$ ${(window.ecosystemHub && window.ecosystemHub.ensureLoaded().stocks[corp.symbol] ? window.ecosystemHub.state.stocks[corp.symbol].price : 50).toFixed(2)}</strong>
              — aposte na queda (Short) na Bolsa antes de vazar o vídeo e lucre Limpo!
            </span>
            <button type="button" id="btnBridgeCctvToShort" class="hc-btn ghost sm" onclick="navTo('winOpsHub');window.ecosystemHub.switchTab('stocks');">
              📉 Apostar na Queda de ${esc(corp.symbol)} →
            </button>
          </div>
          ${this.renderInlineRulesDrawerHtml(
            'top01_cctv',
            'Como funciona a Chantagem por Câmera',
            'Vazar na Imprensa derruba a ação em -18% na hora (ótimo para lucrar Limpo apostando na queda na Bolsa!) e dá +40 REP sem risco policial. Cobrar resgate paga até $ 22.000 em Bitcoin.',
            'O vídeo ocupa 120 MB reais do seu disco (1 gravação a cada 4h por empresa). Se a empresa recusar pagar o resgate, você recebe $ 0, vira Procurado Nível 5 (FBI) e o Firewall dela sobe +2.0 por 2h!',
            '• <strong>Chances de pagarem:</strong> $ 3.000 BTC = 85% · $ 9.000 BTC = 55% · $ 22.000 BTC = 25%.'
          )}
        </div>
      `;
    }

    // =========================================================================
    // TOP #02: EVOLUÇÃO DE BASE FÍSICA EM 3 PORTES (QUITINETE -> STUDIO -> BUNKER)
    // =========================================================================
    getSafehouseMeta() {
      this.ensureLoaded();
      return SAFEHOUSE_TIERS[this.state.safehouseTier] || SAFEHOUSE_TIERS.quitinete;
    }

    getSafehouseThermalBonusC() {
      return Number(this.getSafehouseMeta().thermalBonusC || 0);
    }

    getMaxVpsSlots() {
      return Number(this.getSafehouseMeta().maxVps || 2);
    }

    getSafehouseNetMultiplier() {
      const pct = Number(this.getSafehouseMeta().netSpeedBonusPct || 0);
      return +(1 + pct / 100).toFixed(2);
    }

    getActiveDefenseBonusSeconds() {
      return Number(this.getSafehouseMeta().extraDefenseSec || 0);
    }

    getSafehouseNoonRent() {
      return Number(this.getSafehouseMeta().noonRent || 280);
    }

    upgradeSafehouseTier(targetTierId) {
      this.ensureLoaded();
      const target = SAFEHOUSE_TIERS[targetTierId];
      if (!target) return { success: false, message: 'Porte de imóvel inválido.' };
      const cur = this.getSafehouseMeta();

      if (target.order <= cur.order) {
        return { success: false, message: `Você já possui ${cur.name}!` };
      }
      if (target.order > cur.order + 1) {
        return {
          success: false,
          code: 'SEQUENTIAL_SAFEHOUSE_REQUIRED',
          message: 'Evolução sequencial obrigatória: adquira primeiro o Studio Blindado ($ 85.000 Limpos) antes de comprar o Bunker Subterrâneo!'
        };
      }

      const maxMonthsDue = window.quitineteEngine ? window.quitineteEngine.getMaxAccumulatedMonths() : 0;
      if (maxMonthsDue >= 2) {
        const msg = `🚫 Imobiliária bloqueou a escritura: você possui faturas vencidas (${maxMonthsDue}/3 meses — Nome Sujo)! Quite suas contas antes de evoluir de base.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'OVERDUE_BILLS_BLOCK', message: msg };
      }

      const cleanBal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
      if (cleanBal < target.buyClean) {
        const dirtyBal = window.nineSystemsEngine ? window.nineSystemsEngine.getDirtyBalance() : 0;
        if (dirtyBal > 0 && window.nineSystemsEngine && typeof window.nineSystemsEngine.openDirtyMoneyBridgeModal === 'function') {
          window.nineSystemsEngine.openDirtyMoneyBridgeModal(`Imóvel (${target.name})`, target.buyClean);
        }
        const msg = `Saldo Limpo insuficiente! ${target.name} exige ${fmtMoney(target.buyClean)} 100% em DINHEIRO LIMPO (você tem ${fmtMoney(cleanBal)} Limpos).`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'INSUFFICIENT_CLEAN_FUNDS', message: msg };
      }

      runAuth(() => {
        window.currentWallet.balance = Math.max(0, +(cleanBal - target.buyClean).toFixed(2));
      });

      this.state.safehouseTier = target.id;
      this.save();

      if (window.quitineteEngine) {
        window.quitineteEngine.bills.rent.monthlyBase = target.noonRent;
        window.quitineteEngine.syncDynamicPowerBill();
        window.quitineteEngine.save();
        if (window.winManager && window.winManager.current === 'winQuitinete') {
          window.quitineteEngine.renderUI('quitineteAppBody', window.currentWallet.balance);
        }
      }
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = `🏢 NOVA BASE ATIVA: ${target.name}! Refrigeração -${target.thermalBonusC}°C, limite de ${target.maxVps} VPS${target.extraDefenseSec > 0 ? ` e +${target.extraDefenseSec}s no Popover de Defesa Ativa (23s)` : ''}!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, tier: target.id, rent: target.noonRent, message: msg };
    }

    checkSafehouseEvictionOnThreeMonths() {
      this.ensureLoaded();
      if (this.state.safehouseTier === 'quitinete') return false;
      if (!window.quitineteEngine) return false;
      const rentMonths = Number(window.quitineteEngine.bills?.rent?.monthsDue || 0);
      if (rentMonths >= 3) {
        const lostName = this.getSafehouseMeta().name;
        this.state.safehouseTier = 'quitinete';
        this.state.evictionHistoryCount = Number(this.state.evictionHistoryCount || 0) + 1;
        window.quitineteEngine.bills.rent.monthlyBase = SAFEHOUSE_TIERS.quitinete.noonRent;
        window.quitineteEngine.syncDynamicPowerBill();
        this.save();
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('DESPEJO-IMOVEL', `ORDEM DE DESPEJO (3/3 meses sem pagar aluguel): você perdeu permanentemente "${lostName}" sem reembolso e voltou para a Quitinete!`, 'danger');
        }
        if (typeof window.showToast === 'function') {
          window.showToast(`🚨 DESPEJO EXECUTADO (3/3 meses vencidos)! Você perdeu "${lostName}" sem reembolso e retornou à Quitinete!`);
        }
        return true;
      }
      return false;
    }

    renderSafehouseUpgradeSectionHtml() {
      this.ensureLoaded();
      if (window.progressiveUnlockEngine && !window.progressiveUnlockEngine.isUnlocked('winOpsHub') && this.state.safehouseTier === 'quitinete') {
        return `
          <div class="hc-card" style="margin-top:14px;padding:11px 14px;border-color:rgba(56,189,248,0.28);background:#0a1018;font-size:12px;color:var(--hc-text-2);display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
            <span>🔒 <strong>Próxima Evolução do Esconderijo:</strong> Mudar para Studio Blindado (-5°C e 5 VPS) libera ao chegar em <strong>250 REP</strong> ou concluir o <strong>Curso #3</strong>.</span>
            <button type="button" class="hc-btn ghost sm" onclick="navTo('winUniversity')">🎓 Ver Cursos →</button>
          </div>
        `;
      }
      const cur = this.getSafehouseMeta();
      const cleanBal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
      const vpsNow = window.lanServersEngine ? window.lanServersEngine.servers.filter((s) => s.id !== 'srv_gateway_01').length : 0;

      const cards = Object.values(SAFEHOUSE_TIERS).map((t) => {
        const isCurrent = t.id === cur.id;
        const isOwnedLower = t.order < cur.order;
        const isNext = t.order === cur.order + 1;
        return `
          <div class="hc-card" style="padding:12px 14px;border-color:${isCurrent ? 'var(--hc-accent)' : 'var(--hc-border)'};background:${isCurrent ? 'rgba(53,184,119,0.08)' : '#0c1118'};display:flex;flex-direction:column;justify-content:space-between;gap:10px;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
                <strong style="font-size:13px;color:var(--hc-text);">${esc(t.name)}</strong>
                <span class="hc-badge ${isCurrent ? 'success' : (isOwnedLower ? '' : 'info')}">
                  ${isCurrent ? 'BASE ATUAL' : (isOwnedLower ? 'SUPERADA' : fmtMoney(t.buyClean) + ' Limpos')}
                </span>
              </div>
              <p style="font-size:11.5px;color:var(--hc-text-2);margin:6px 0;">${esc(t.desc)}</p>
              <div class="mono" style="font-size:11px;color:var(--hc-accent-text);">
                Aluguel 12h: ${fmtMoney(t.noonRent)} · CPU -${t.thermalBonusC}°C · Máx ${t.maxVps} VPS${t.extraDefenseSec ? ` · Defesa ${15 + t.extraDefenseSec}s` : ''}
              </div>
            </div>
            ${isCurrent
              ? `<span class="hc-badge success" style="align-self:flex-start;">✓ Morando Aqui (${vpsNow}/${t.maxVps} VPS)</span>`
              : (isNext
                  ? `<button type="button" id="btnUpgradeSafehouse_${esc(t.id)}" class="hc-btn ${cleanBal >= t.buyClean ? 'primary' : 'ghost'} sm block"
                       onclick="window.topTenMechanics.upgradeSafehouseTier('${esc(t.id)}')">
                       Mudar p/ cá (${fmtMoney(t.buyClean)} Limpos)
                     </button>`
                  : `<button type="button" class="hc-btn ghost sm block" disabled>
                       ${isOwnedLower ? 'Imóvel Anterior' : 'Compre o Studio Antes'}
                     </button>`)}
          </div>
        `;
      }).join('');

      return `
        <div class="hc-card" id="safehouseEvolutionCard" style="margin-top:14px;padding:14px 16px;border-color:rgba(53,184,119,0.35);">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
            <div>
              <span class="hc-badge success">🏢 MELHORAR ESCONDERIJO (3 TAMANHOS)</span>
              <strong style="font-size:13.5px;margin-left:6px;">Local Atual: ${esc(cur.name)} (Aluguel às 12h: ${fmtMoney(cur.noonRent)} · Cabe até ${cur.maxVps} VPS)</strong>
            </div>
            <span class="mono" style="font-size:11.5px;color:var(--hc-text-3);">Pago c/ Dinheiro Limpo · Sem contas atrasadas</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(235px,1fr));gap:10px;">
            ${cards}
          </div>
          ${this.renderInlineRulesDrawerHtml(
            'top02_safehouse',
            'Como funciona a Mudança de Esconderijo',
            'Deixa seu PC mais frio (-5°C no Studio e -12°C no Bunker), libera espaço para mais servidores VPS (2 → 5 → 10) e dá +8 segundos extras para reagir a invasões no Bunker (23s no total!).',
            'Precisa de Dinheiro Limpo e contas em dia. O aluguel das 12h sobe de $ 280 para $ 950 (Studio) e $ 2.800 (Bunker). Se atrasar 3 meses de aluguel, você sofre DESPEJO e volta para a Quitinete sem receber o dinheiro de volta!',
            '• Ordem obrigatória: Quitinete → Studio Blindado ($ 85.000) → Bunker Subterrâneo ($ 320.000).'
          )}
        </div>
      `;
    }

    // =========================================================================
    // TOP #03: LEILÃO CLANDESTINO DE SERVIDORES APREENDIDOS ("STORAGE WARS" 2H)
    // =========================================================================
    currentTwoHourBucket() {
      return Math.floor(Date.now() / (2 * 60 * 60 * 1000));
    }

    getCurrentAuctionLot() {
      this.ensureLoaded();
      const b = this.currentTwoHourBucket();
      if (this.state.auctionState.bucket !== b) {
        this.state.auctionState = {
          bucket: b,
          probedBucket: -1,
          probeHint: null,
          resolvedBucket: -1,
          lastOutcome: null,
          myBidClean: 0
        };
        this.save();
      }
      const origins = [
        { code: `LOT-FBI-${400 + (b % 500)}`, origin: 'Rack Apreendido — Operação DarkVault Zurique', botTag: 'kr0n0s_apt', botBid: 8000 },
        { code: `LOT-INT-${400 + (b % 500)}`, origin: 'Mainframe Confiscado — Bunker Báltico #09', botTag: 'ZeroDay_Valkyrie', botBid: 9500 },
        { code: `LOT-SAF-${400 + (b % 500)}`, origin: 'Cluster Forense — Datacenter Fantasma Panamá', botTag: 'm4riposa', botBid: 8000 }
      ];
      const meta = origins[b % origins.length];
      const nextTwoHourMs = (b + 1) * 2 * 60 * 60 * 1000;
      const remMin = Math.max(1, Math.ceil((nextTwoHourMs - Date.now()) / 60000));
      // Semente determinística p/ a Sonda bater de verdade com o lote (65% tesouro vs 35% bomba)
      const isTreasure = ((b * 2654435761) >>> 0) % 100 < 65;

      return {
        bucket: b,
        lotCode: meta.code,
        origin: meta.origin,
        botBidder: meta.botTag,
        currentMinBid: Math.max(8000, meta.botBid + 1500),
        remMin,
        isTreasure,
        probed: this.state.auctionState.probedBucket === b,
        probeHint: this.state.auctionState.probedBucket === b ? this.state.auctionState.probeHint : null,
        resolved: this.state.auctionState.resolvedBucket === b,
        lastOutcome: this.state.auctionState.resolvedBucket === b ? this.state.auctionState.lastOutcome : null
      };
    }

    probeAuctionWithAnalyzer() {
      this.ensureLoaded();
      const lot = this.getCurrentAuctionLot();
      if (lot.resolved) return { success: false, message: 'Este lote de 2h já foi arrematado!' };
      if (lot.probed) return { success: true, hint: lot.probeHint };

      const anaVer = (window.softwareEngine && window.softwareEngine.ensureLoaded().inventory.analyzer?.owned)
        ? Number(window.softwareEngine.state.inventory.analyzer.versionInt || 0) / 10
        : 0;
      if (anaVer < 4.0) {
        const msg = `🔬 Sonda de Setores bloqueada: exige Analyzer.ana >= v4.0 instalado no seu PC (atual: v${anaVer.toFixed(1)})!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'ANALYZER_V4_REQUIRED', message: msg };
      }

      const cleanBal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
      if (cleanBal < 1000) {
        const msg = 'Saldo Limpo insuficiente! A Sonda Remota de Setores custa $ 1.000 Limpos.';
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'INSUFFICIENT_FUNDS', message: msg };
      }

      runAuth(() => {
        window.currentWallet.balance = Math.max(0, +(cleanBal - 1000).toFixed(2));
      });

      const hint = lot.isTreasure
        ? '✨ Assinatura de partição LUKS íntegra detectada (alta chance de carteira BTC dormente, software v6.0+ ou Catalisador!).'
        : '⚠️ Alerta de entropia anômala: trilhas físicas oxidadas ou assinatura de Malware Judicial Safenet nos setores de boot!';
      this.state.auctionState.probedBucket = lot.bucket;
      this.state.auctionState.probeHint = hint;
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.ecosystemHub && window.winManager?.current === 'winOpsHub') window.ecosystemHub.renderUI();
      if (typeof window.showToast === 'function') window.showToast(`🔬 Sonda concluída (-$ 1.000): ${hint}`);
      return { success: true, hint };
    }

    placeBidAndResolveAuction(bidCleanRaw, forceMode = null) {
      this.ensureLoaded();
      const lot = this.getCurrentAuctionLot();
      if (lot.resolved && !forceMode) {
        return { success: false, code: 'LOT_ALREADY_RESOLVED', message: 'Este lote já foi encerrado! Aguarde a próxima rotação de 2h.' };
      }

      const bid = Math.max(8000, Math.round(Number(bidCleanRaw || lot.currentMinBid)));
      if (bid < lot.currentMinBid) {
        return { success: false, message: `Lance mínimo para cobrir ${lot.botBidder}: ${fmtMoney(lot.currentMinBid)} Limpos (passo +$ 1.500).` };
      }

      const cleanBal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
      if (cleanBal < bid) {
        if (window.nineSystemsEngine && window.nineSystemsEngine.getDirtyBalance() > 0) {
          window.nineSystemsEngine.openDirtyMoneyBridgeModal(`Lance Leilão (${lot.lotCode})`, bid);
        }
        const msg = `Saldo Limpo insuficiente para o lance de ${fmtMoney(bid)}!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'INSUFFICIENT_CLEAN_BID', message: msg };
      }

      runAuth(() => {
        window.currentWallet.balance = Math.max(0, +(cleanBal - bid).toFixed(2));
      });

      const winTreasure = forceMode === 'treasure'
        ? true
        : (forceMode === 'bomb' ? false : lot.isTreasure);

      let outcome = null;
      if (winTreasure) {
        const prizeRoll = lot.bucket % 3;
        if (prizeRoll === 0 && window.bitcoinEngine) {
          const usdPrize = 16500;
          const btcGain = +(usdPrize / Number(window.bitcoinEngine.priceUsd || 84000)).toFixed(8);
          window.bitcoinEngine.ensureLoaded();
          window.bitcoinEngine.btcBalance = +(Number(window.bitcoinEngine.btcBalance || 0) + btcGain).toFixed(8);
          window.bitcoinEngine.save();
          outcome = {
            treasure: true,
            title: `💎 Carteira wallet.dat Dormente Encontrada (+${btcGain.toFixed(5)} BTC / ~${fmtMoney(usdPrize)})!`,
            detail: `Lucro líquido sobre seu lance de ${fmtMoney(bid)}: +${fmtMoney(usdPrize - bid)}!`
          };
        } else if (prizeRoll === 1 && window.ecosystemHub) {
          window.ecosystemHub.ensureLoaded();
          window.ecosystemHub.state.labCatalysts = Number(window.ecosystemHub.state.labCatalysts || 0) + 2;
          window.ecosystemHub.state.osintDossiers = Number(window.ecosystemHub.state.osintDossiers || 0) + 2;
          window.ecosystemHub.save();
          const unlockedRelic = this.unlockNextRelicBlock('Leilão Clandestino ' + lot.lotCode);
          outcome = {
            treasure: true,
            title: `🧬 Cofre P&D Intacto: +2 Catalisadores Lab + 2 OSINT${unlockedRelic ? ` + Relíquia ${unlockedRelic.id}` : ''}!`,
            detail: `Equipamentos raros resgatados do lote ${lot.lotCode}!`
          };
        } else {
          if (window.softwareEngine) {
            window.softwareEngine.ensureLoaded();
            const cur = window.softwareEngine.state.inventory.cracker;
            if (cur) {
              cur.owned = true;
              cur.versionInt = Math.max(cur.versionInt || 10, 68);
              cur.licensed = true;
              window.softwareEngine.save();
            }
          }
          outcome = {
            treasure: true,
            title: `🔑 Disco Militar Desbloqueado: Cracker.crc v6.8 Licenciado Resgatado!`,
            detail: `Binário de elite transferido para o seu PC sem custo de pesquisa!`
          };
        }
      } else {
        // 35% LOTE-BOMBA: perde 100% do lance + se Antivírus < v3.0, Malware Judicial infecta o PC!
        const avVer = (window.softwareEngine && window.softwareEngine.ensureLoaded().inventory.antivirus?.installed)
          ? Number(window.softwareEngine.state.inventory.antivirus.runningVerInt || window.softwareEngine.state.inventory.antivirus.versionInt || 0) / 10
          : 0;
        let infected = false;
        if (avVer < 3.0 && window.softwareEngine) {
          infected = true;
          window.softwareEngine.ensureLoaded();
          window.softwareEngine.state.localHostileInfections.push({
            id: 'jud_mw_' + Date.now(),
            filename: 'Safenet_Beacon_Rootkit.vspy',
            versionInt: 30,
            ramMb: 48,
            hddMb: 36,
            plantedBy: 'Lote Judicial ' + lot.lotCode
          });
          window.softwareEngine.save();
        }
        outcome = {
          treasure: false,
          infected,
          title: `💣 LOTE-BOMBA CORROMPIDO! Você perdeu 100% do lance (${fmtMoney(bid)})!`,
          detail: infected
            ? `🚨 Seu Antivírus (v${avVer.toFixed(1)} < v3.0) falhou em conter o disco apreendido: "Safenet_Beacon_Rootkit.vspy" infectou sua RAM/HD!`
            : `🛡️ Seu Antivírus v${avVer.toFixed(1)} (>= v3.0) bloqueou o Malware Judicial embutido, mas os setores de dados estavam destruídos!`
        };
      }

      this.state.auctionState.resolvedBucket = lot.bucket;
      this.state.auctionState.myBidClean = bid;
      this.state.auctionState.lastOutcome = outcome;
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.ecosystemHub && window.winManager?.current === 'winOpsHub') window.ecosystemHub.renderUI();
      if (typeof window.showToast === 'function') window.showToast(`${outcome.title} ${outcome.detail}`);
      return { success: true, bid, outcome };
    }

    // =========================================================================
    // TOP #04: 12 BLOCOS "RELÍQUIA" RING-0 & ENCOMENDAS EXCLUSIVAS DO LAB
    // =========================================================================
    getRelicCatalog() {
      return RELIC_RING0_BLOCKS;
    }

    registerRelicBlocksIntoLab() {
      if (!window.VIRUS_LAB_CONSTANTS) return;
      const c = window.VIRUS_LAB_CONSTANTS;
      RELIC_RING0_BLOCKS.forEach((rb) => {
        const targetArr = rb.round === 1 ? c.ROUND_1_BLOCKS : (rb.round === 2 ? c.ROUND_2_BLOCKS : c.ROUND_3_BLOCKS);
        if (Array.isArray(targetArr) && !targetArr.some((x) => x.id === rb.id)) {
          targetArr.push(rb);
        }
      });
    }

    isRelicUnlocked(blockId) {
      this.ensureLoaded();
      return this.state.unlockedRelicIds.includes(blockId);
    }

    unlockNextRelicBlock(sourceLabel = 'Servidor Tier 4-5') {
      this.ensureLoaded();
      this.registerRelicBlocksIntoLab();
      const locked = RELIC_RING0_BLOCKS.filter((b) => !this.state.unlockedRelicIds.includes(b.id));
      if (locked.length === 0) return null;
      const picked = locked[0];
      this.state.unlockedRelicIds.push(picked.id);
      this.save();
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('RELIC-RING0', `Bloco Relíquia Ring-0 [${picked.id} · ${picked.fn}] extraído de ${sourceLabel}!`, 'success');
      }
      return picked;
    }

    extractRelicBlockFromHost(hostIp) {
      this.ensureLoaded();
      this.registerRelicBlocksIntoLab();
      const seekerVer = window.stealthXhdEngine ? window.stealthXhdEngine.getSeekerVer() : 0;
      if (seekerVer < 3.0) {
        const msg = `🔒 Extração Ring-0 bloqueada: exige Seeker.skr >= v3.0 (atual: v${seekerVer.toFixed(1)})!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'SEEKER_V3_REQUIRED', message: msg };
      }

      const hostRelics = RELIC_RING0_BLOCKS.filter((r) => r.hostIp === hostIp && !this.state.unlockedRelicIds.includes(r.id));
      const candidate = hostRelics[0] || RELIC_RING0_BLOCKS.find((r) => !this.state.unlockedRelicIds.includes(r.id));
      if (!candidate) {
        const msg = 'Você já desbloqueou todos os 12 Blocos Relíquia Ring-0 no seu Códice!';
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'ALL_RELICS_UNLOCKED', message: msg };
      }

      this.state.unlockedRelicIds.push(candidate.id);
      this.state.extractedRelicByHost[hostIp] = Date.now();
      this.save();
      if (window.internetEngine) window.internetEngine.render();
      const msg = `🧬 RELÍQUIA RING-0 EXTRAÍDA! Bloco "${candidate.id} (${candidate.fn})" desbloqueado para o Round ${candidate.round} do Laboratório de Vírus!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, relic: candidate, message: msg };
    }

    // Chamado por VirusLabEngine.compileCurrentDraft quando há bloco Relíquia nos picks!
    evaluateRelicKernelPanic(pickedBlockIds, fitGrade) {
      const hasRelic = (pickedBlockIds || []).some((id) => String(id || '').startsWith('REL_'));
      if (!hasRelic) return { kernelPanic: false, hasRelic: false };
      const unstableGrades = ['C', 'D', 'F'];
      if (unstableGrades.includes(fitGrade)) {
        // LADO NEGATIVO: Nota < B c/ Relíquia Ring-0 explode em Kernel Panic -> v0.0 + +18°C na CPU!
        if (window.nineSystemsEngine) {
          window.nineSystemsEngine.ensureLoaded();
          window.nineSystemsEngine.state.thermals.empHeatUntil = Date.now() + 120000;
          window.nineSystemsEngine.state.thermals.extraKernelPanicC = 18;
          window.nineSystemsEngine.state.thermals.kernelPanicUntil = Date.now() + 120000;
          window.nineSystemsEngine.save();
        }
        return {
          kernelPanic: true,
          hasRelic: true,
          heatSpikeC: 18,
          message: `💥 KERNEL PANIC RING-0! O bloco Relíquia exigia nota >= B (você tirou ${fitGrade}): o binário queimou em v0.0 (perdendo o turno de 24h) e sua CPU sofreu pico térmico de +18°C!`
        };
      }
      return { kernelPanic: false, hasRelic: true };
    }

    deliverCompiledStrainToCommission(strainId = null) {
      this.ensureLoaded();
      const comm = this.state.activeLabCommission;
      if (!comm || comm.completed) {
        return { success: false, message: 'Encomenda atual já foi entregue! Nova encomenda abre no próximo ciclo.' };
      }

      if (window.virusLabEngine && typeof window.virusLabEngine.ensureLoaded === 'function') {
        window.virusLabEngine.ensureLoaded();
      }
      const creations = (window.virusLabEngine && window.virusLabEngine.state && window.virusLabEngine.state.creations) || [];
      const idx = strainId
        ? creations.findIndex((c) => c.id === strainId)
        : creations.findIndex((c) => c.family === comm.reqFamily && Number(c.versionInt || 0) >= comm.reqMinVerInt);

      if (idx < 0) {
        const msg = `Nenhuma cepa compatível encontrada! A ${comm.factionName} exige um binário da família .${comm.reqFamily} >= v${(comm.reqMinVerInt / 10).toFixed(1)}.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'NO_MATCHING_STRAIN', message: msg };
      }

      const delivered = creations[idx];
      if (delivered.family !== comm.reqFamily || Number(delivered.versionInt || 0) < comm.reqMinVerInt) {
        const msg = `Esta cepa (${delivered.family} v${(delivered.versionInt / 10).toFixed(1)}) não atende à encomenda (.${comm.reqFamily} >= v${(comm.reqMinVerInt / 10).toFixed(1)})!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'STRAIN_MISMATCH', message: msg };
      }

      // LADO NEGATIVO DE CESSÃO EXCLUSIVA: a Facção leva o binário embora (você NÃO fica com ele no seu PC/Criações!)
      creations.splice(idx, 1);
      window.virusLabEngine.save();

      if (window.softwareEngine) {
        window.softwareEngine.ensureLoaded();
        const invItem = window.softwareEngine.state.inventory[delivered.family];
        if (invItem && invItem.strainName === delivered.strainName) {
          invItem.versionInt = 10;
          invItem.runningVerInt = invItem.installed ? 10 : 0;
          delete invItem.strainName;
          window.softwareEngine.save();
        }
      }

      runAuth(() => {
        if (window.currentWallet) {
          window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + comm.rewardClean).toFixed(2);
        }
      });
      if (window.ecosystemHub) {
        window.ecosystemHub.ensureLoaded();
        window.ecosystemHub.state.labCatalysts = Number(window.ecosystemHub.state.labCatalysts || 0) + comm.rewardCatalysts;
        window.ecosystemHub.save();
      }

      comm.completed = true;
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.virusLabEngine) window.virusLabEngine.renderUI();
      const msg = `🤝 ENCOMENDA ENTREGUE À ${comm.factionName}! Você recebeu +${fmtMoney(comm.rewardClean)} Limpos + ${comm.rewardCatalysts} Catalisadores, e cedeu 100% da posse exclusiva da cepa "${delivered.strainName}"!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, rewardClean: comm.rewardClean, rewardCatalysts: comm.rewardCatalysts, cededStrain: delivered.strainName, message: msg };
    }

    renderLabRelicsAndCommissionBannerHtml() {
      this.ensureLoaded();
      const comm = this.state.activeLabCommission;
      const unlockedCount = this.state.unlockedRelicIds.length;
      return `
        <div class="hc-card" id="vlabRelicsAndCommissionCard" style="margin-bottom:12px;padding:12px 14px;border-color:rgba(168,85,247,0.45);background:linear-gradient(155deg,rgba(24,15,36,0.95),rgba(13,18,26,0.96));">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span class="hc-badge info">🧬 BLOCOS SECRETOS (${unlockedCount}/12 ENCONTRADOS)</span>
                ${comm && !comm.completed
                  ? `<span class="hc-badge warn">ENCOMENDA: faça um .${esc(comm.reqFamily)} &gt;= v${(comm.reqMinVerInt / 10).toFixed(1)} → ganha ${fmtMoney(comm.rewardClean)} Limpos + ${comm.rewardCatalysts} Catalisadores</span>`
                  : `<span class="hc-badge success">✓ Encomenda Entregue</span>`}
              </div>
              <div style="font-size:12px;color:var(--hc-text-2);margin-top:4px;">
                Ache blocos secretos invadindo <code>209.141.55.10</code> (EvilCorp), <code>161.89.2.1</code> (NSA), <code>77.3.13.99</code> (Quantum) ou <code>161.89.1.1</code> (FBI) com <code>Seeker.skr &gt;= v3.0</code>!
              </div>
            </div>
            ${comm && !comm.completed ? `
              <button type="button" id="btnDeliverLabCommission" class="hc-btn primary sm"
                onclick="window.topTenMechanics.deliverCompiledStrainToCommission()">
                🤝 Entregar Vírus .${esc(comm.reqFamily)} (+${fmtMoney(comm.rewardClean)} Limpos)
              </button>
            ` : ''}
          </div>
          ${this.renderInlineRulesDrawerHtml(
            'top04_relics',
            'Como funcionam os Blocos Secretos e a Encomenda de $ 18.000',
            'Blocos Secretos aparecem no sorteio das 3 rodadas com poder máximo, e entregar a Encomenda paga $ 18.000 em Dinheiro Limpo + 2 Catalisadores na hora.',
            'Ao entregar o vírus da Encomenda, a facção fica com ele (ele sai da sua lista de criações!). E se usar um Bloco Secreto e tirar nota menor que B (C, D ou F), o vírus queima (v0.0) e seu PC esquenta +18°C!',
            '• Encontrados até agora: <strong>' + (unlockedCount > 0 ? this.state.unlockedRelicIds.join(', ') : 'Nenhum — use Seeker v3.0+ em servidores fortes ou ganhe no Leilão!') + '</strong>.'
          )}
        </div>
      `;
    }

    // =========================================================================
    // TOP #05: BLOQUEIO JUDICIAL ("BACENJUD HACKER") vs COFRE FÍSICO SUÍÇO
    // =========================================================================
    evaluateBacenjudFreeze() {
      this.ensureLoaded();
      const heat = Number((window.currentProfile && window.currentProfile.heat_level) || 1);
      const curClean = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;

      if (heat >= 5 && !this.state.bacenjudActive && curClean > 0) {
        const freezeAmt = +(curClean * 0.30).toFixed(2);
        if (freezeAmt >= 1) {
          runAuth(() => {
            window.currentWallet.balance = Math.max(0, +(curClean - freezeAmt).toFixed(2));
          });
          this.state.frozenCleanCash = +(Number(this.state.frozenCleanCash || 0) + freezeAmt).toFixed(2);
          this.state.bacenjudActive = true;
          this.save();
          if (typeof window.addLocalLog === 'function') {
            window.addLocalLog('BACENJUD-FREEZE', `ORDEM JUDICIAL FEDERAL (Heat 5/5): 30% do seu saldo limpo (${fmtMoney(freezeAmt)}) na conta comum 77.3.9.21 foi CONGELADO! Cofre Suíço permanece 100% imune.`, 'danger');
          }
          if (typeof window.showToast === 'function') {
            window.showToast(`⚖️ BACENJUD FEDERAL (Heat 5/5): ${fmtMoney(freezeAmt)} (30% da conta comum) bloqueados judicialmente! Reduza seu Heat <= 2 para liberar.`);
          }
          return { frozen: true, amount: freezeAmt };
        }
      } else if (heat <= 2 && this.state.bacenjudActive && this.state.frozenCleanCash > 0) {
        const releaseAmt = Number(this.state.frozenCleanCash || 0);
        runAuth(() => {
          if (window.currentWallet) {
            window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + releaseAmt).toFixed(2);
          }
        });
        this.state.frozenCleanCash = 0;
        this.state.bacenjudActive = false;
        this.save();
        if (typeof window.showToast === 'function') {
          window.showToast(`⚖️ Desbloqueio Judicial (Heat <= 2): +${fmtMoney(releaseAmt)} liberados de volta na sua conta principal!`);
        }
        return { released: true, amount: releaseAmt };
      }
      return { frozen: this.state.bacenjudActive, amount: this.state.frozenCleanCash };
    }

    applyNoonBankingAndSponsorshipSettlement(monthsCount = 1) {
      this.ensureLoaded();
      const count = Math.max(1, Number(monthsCount || 1));

      // 1. Taxa de Custódia de 2% às 12:00 sobre saldo comum > $ 100.000 (ISENTO se dono de Empresa Porte 3 Holding!)
      const cnpjPerks = (window.nineSystemsEngine && typeof window.nineSystemsEngine.getCompanyCnpjPerks === 'function')
        ? window.nineSystemsEngine.getCompanyCnpjPerks()
        : { exemptBankCustody2Pct: false };
      const mainBal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
      if (mainBal > 100000 && !cnpjPerks.exemptBankCustody2Pct) {
        const excess = mainBal - 100000;
        const tax = Math.round(excess * 0.02 * count);
        if (tax > 0) {
          runAuth(() => {
            window.currentWallet.balance = Math.max(0, +(mainBal - tax).toFixed(2));
          });
          if (typeof window.addLocalLog === 'function') {
            window.addLocalLog('BANK-CUSTODY-2PCT', `Taxa de Custódia Bancária às 12:00 (2% acima de $ 100K): -${fmtMoney(tax)} cobrados na conta 77.3.9.21.`, 'warning');
          }
        }
      }

      // 2. Rendimento de +1.5% às 12:00 no Cofre Físico Suíço (teto $ 5.000/dia)
      if (this.state.swissVaultOpened && this.state.swissVaultBalance > 0) {
        const yieldAmt = Math.min(5000 * count, Math.round(this.state.swissVaultBalance * 0.015 * count));
        if (yieldAmt > 0) {
          this.state.swissVaultBalance = +(this.state.swissVaultBalance + yieldAmt).toFixed(2);
        }
      }

      // 3. Liquidação de Patrocínio Corporativo de Clã às 12:00
      this.settleClanSponsorshipAtNoon(count);
      this.save();
    }

    openSwissPhysicalVault() {
      this.ensureLoaded();
      if (this.state.swissVaultOpened) {
        return { success: true, alreadyOpen: true, message: 'Seu Cofre Físico Numerado em Zurique já está aberto!' };
      }
      const FEE = 25000;
      const cleanBal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
      if (cleanBal < FEE) {
        if (window.nineSystemsEngine && window.nineSystemsEngine.getDirtyBalance() > 0) {
          window.nineSystemsEngine.openDirtyMoneyBridgeModal('Cofre Físico Suíço (77.3.12.15)', FEE);
        }
        const msg = `Abrir Cofre Físico Numerado na Suíça (77.3.12.15) exige ${fmtMoney(FEE)} em DINHEIRO LIMPO!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'INSUFFICIENT_CLEAN_FUNDS', message: msg };
      }

      runAuth(() => {
        window.currentWallet.balance = Math.max(0, +(cleanBal - FEE).toFixed(2));
      });
      this.state.swissVaultOpened = true;
      this.save();
      if (window.multiBankEngine) window.multiBankEngine.renderMultiBankOverview();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = '🇨🇭 Cofre Físico Numerado aberto em Zurique (-$ 25.000 Limpos)! 100% imune ao BACENJUD Federal e rende +1.5% às 12:00!';
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, message: msg };
    }

    depositToSwissVault(amountCleanRaw) {
      this.ensureLoaded();
      if (!this.state.swissVaultOpened) {
        return { success: false, message: 'Abra primeiro seu Cofre Físico Suíço ($ 25.000 Limpos)!' };
      }
      const amt = Math.round(Number(amountCleanRaw || 0));
      if (!Number.isFinite(amt) || amt < 500) {
        return { success: false, message: 'Depósito mínimo no Cofre Suíço: $ 500 Limpos.' };
      }
      const cleanBal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
      if (cleanBal < amt) {
        if (window.nineSystemsEngine && window.nineSystemsEngine.getDirtyBalance() > 0) {
          window.nineSystemsEngine.openDirtyMoneyBridgeModal('Remessa Cofre Suíço', amt);
        }
        return { success: false, message: 'Saldo Limpo insuficiente na conta principal!' };
      }

      const swissFeeRate = (window.nineSystemsEngine && typeof window.nineSystemsEngine.getCompanyCnpjPerks === 'function')
        ? Number(window.nineSystemsEngine.getCompanyCnpjPerks().swissDepositFeeRate || 0.04)
        : 0.04;
      const feeCharged = Math.round(amt * swissFeeRate);
      const netStored = amt - feeCharged;
      runAuth(() => {
        window.currentWallet.balance = Math.max(0, +(cleanBal - amt).toFixed(2));
      });
      this.state.swissVaultBalance = +(Number(this.state.swissVaultBalance || 0) + netStored).toFixed(2);
      this.save();
      if (window.multiBankEngine) window.multiBankEngine.renderMultiBankOverview();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = `🇨🇭 Guardado em Zurique: +${fmtMoney(netStored)} blindados no Cofre Físico (taxa helvética ${(swissFeeRate * 100).toFixed(1)}%: -${fmtMoney(feeCharged)})!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, netStored, fee4Pct: feeCharged, feeRate: swissFeeRate, balance: this.state.swissVaultBalance, message: msg };
    }

    requestSwissVaultWithdrawal(amountRaw) {
      this.ensureLoaded();
      if (!this.state.swissVaultOpened || this.state.swissVaultBalance <= 0) {
        return { success: false, message: 'Saldo vazio no Cofre Físico Suíço.' };
      }
      const amt = Math.min(this.state.swissVaultBalance, Math.round(Number(amountRaw || this.state.swissVaultBalance)));
      if (amt <= 0) return { success: false, message: 'Valor inválido.' };

      // LADO NEGATIVO ESTRUTURAL: Lockup de 30 minutos reais em fila SWIFT!
      this.state.swissVaultBalance = Math.max(0, +(this.state.swissVaultBalance - amt).toFixed(2));
      const repItem = {
        id: 'sw_rep_' + Date.now(),
        amountClean: amt,
        requestedAt: Date.now(),
        availableAt: Date.now() + 30 * 60 * 1000,
        claimed: false
      };
      this.state.swissRepatriations.unshift(repItem);
      this.save();
      if (window.multiBankEngine) window.multiBankEngine.renderMultiBankOverview();
      const msg = `⏳ Repatriação SWIFT iniciada (${fmtMoney(amt)}): devido ao sigilo alpino, o valor ficará retido por 30 MINUTOS reais antes de cair na sua conta corrente!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, repatriation: repItem, lockupMinutes: 30, message: msg };
    }

    renderBankBacenjudAndSwissCardHtml() {
      this.ensureLoaded();
      if (window.progressiveUnlockEngine && !window.progressiveUnlockEngine.isUnlocked('winVirusLab') && !this.state.swissVaultOpened && !this.state.bacenjudActive) {
        return `
          <div class="hc-card" style="margin-top:12px;padding:11px 14px;border-color:rgba(56,189,248,0.28);background:#0a1018;font-size:12px;color:var(--hc-text-2);display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
            <span>🔒 <strong>Cofre Protegido na Suíça ($ 25.000):</strong> libera automaticamente ao chegar em <strong>500 REP</strong> ou concluir o <strong>Curso #4</strong>.</span>
            <button type="button" class="hc-btn ghost sm" onclick="navTo('winUniversity')">🎓 Ver Cursos →</button>
          </div>
        `;
      }
      const pendingReps = (this.state.swissRepatriations || []).filter((r) => !r.claimed);
      const swissFeePct = (window.nineSystemsEngine && typeof window.nineSystemsEngine.getCompanyCnpjPerks === 'function')
        ? (Number(window.nineSystemsEngine.getCompanyCnpjPerks().swissDepositFeeRate || 0.04) * 100)
        : 4;
      return `
        <div class="hc-card" id="bankBacenjudSwissCard" style="margin-top:12px;padding:13px 15px;border-color:${this.state.bacenjudActive ? 'var(--hc-danger)' : 'rgba(56,189,248,0.4)'};background:#0b1119;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span class="hc-badge info">🇨🇭 PROTEÇÃO DO BANCO &amp; COFRE NA SUÍÇA</span>
                ${this.state.bacenjudActive
                  ? `<span class="hc-badge danger">🚨 BLOQUEIO POLICIAL: ${fmtMoney(this.state.frozenCleanCash)} PRESOS (NÍVEL 5 PROCURADO)</span>`
                  : `<span class="hc-badge success">Conta Liberada (cobra 2% ao dia acima de $ 100 mil)</span>`}
              </div>
              <div style="font-size:12px;color:var(--hc-text-2);margin-top:5px;">
                ${this.state.swissVaultOpened
                  ? `🇨🇭 <strong>Seu Cofre na Suíça:</strong> Guardado <strong style="color:#4ade80;">${fmtMoney(this.state.swissVaultBalance)}</strong> (Rende +1,5% às 12h · Taxa p/ guardar ${swissFeePct}% · Saque demora 30 min).`
                  : `Abra um Cofre na Suíça por <strong>$ 25.000 Limpos</strong>: a polícia nunca consegue bloquear esse dinheiro e você foge da taxa de 2% acima de $ 100 mil!`}
              </div>
              ${pendingReps.length > 0 ? `
                <div style="margin-top:6px;font-size:11.5px;color:#fde68a;">
                  ⏳ Saque vindo da Suíça (30 min): ${pendingReps.map((r) => `${fmtMoney(r.amountClean)} (cai em ${Math.max(1, Math.ceil((r.availableAt - Date.now()) / 60000))}m)`).join(' · ')}
                </div>
              ` : ''}
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
              ${!this.state.swissVaultOpened ? `
                <button type="button" id="btnOpenSwissPhysicalVault" class="hc-btn primary sm" onclick="window.topTenMechanics.openSwissPhysicalVault()">
                  🇨🇭 Abrir Cofre na Suíça ($ 25.000)
                </button>
              ` : `
                <input type="number" id="swissDepositAmtInput" class="form-input mono" style="width:120px;height:32px;font-size:12px;" value="5000" min="500" step="500">
                <button type="button" id="btnDepositSwissVault" class="hc-btn primary sm" onclick="window.topTenMechanics.depositToSwissVault(document.getElementById('swissDepositAmtInput')?.value)">
                  Guardar no Cofre (${swissFeePct}%)
                </button>
                <button type="button" id="btnWithdrawSwissVault" class="hc-btn ghost sm" ${this.state.swissVaultBalance <= 0 ? 'disabled' : ''} onclick="window.topTenMechanics.requestSwissVaultWithdrawal(${Math.min(5000, this.state.swissVaultBalance || 0)})">
                  Sacar (demora 30m)
                </button>
              `}
            </div>
          </div>
          ${this.renderInlineRulesDrawerHtml(
            'top05_swiss',
            'Como funciona o Bloqueio Policial e o Cofre na Suíça',
            'Dinheiro no Cofre da Suíça nunca é bloqueado pela polícia e ainda rende +1,5% todo dia às 12h (até $ 5.000/dia).',
            'Custa $ 25.000 Limpos para abrir + taxa para guardar (4%, ou 1,5% com Empresa Porte 3), e quando você pede saque ele demora 30 MINUTOS reais para cair na conta! Já na conta comum, saldos acima de $ 100 mil pagam 2% às 12h e 30% ficam bloqueados se você virar Procurado Nível 5!',
            '• Para liberar o dinheiro bloqueado na conta comum, baixe seu Nível de Procura para 2 ou menos.'
          )}
        </div>
      `;
    }

    // =========================================================================
    // TOP #06: MATRIZ FÍSICA DE DISCOS (RAID-0 PERFORMANCE vs RAID-1 ESPELHADO)
    // =========================================================================
    getRaidSpeedMultiplier() {
      this.ensureLoaded();
      if (this.state.raidRebuildUntil > Date.now()) return 0.85; // Reconstruindo arranjo
      return this.state.raidMode === 'raid0' ? 1.25 : 1.0;
    }

    getRaidCapacityMultiplier() {
      this.ensureLoaded();
      return this.state.raidMode === 'raid1' ? 0.50 : 1.0;
    }

    setDiskRaidMode(mode) {
      this.ensureLoaded();
      if (!['normal', 'raid0', 'raid1'].includes(mode)) return { success: false };
      if (this.state.raidMode === mode) {
        return { success: true, mode, message: `Matriz já configurada em ${mode.toUpperCase()}.` };
      }

      const rawHddMb = window.hardwareEngine ? Number(window.hardwareEngine.getHdd().hddMb || 350) : 350;
      if (mode !== 'normal' && rawHddMb < 1024) {
        const msg = `🔒 Controladora RAID bloqueada: exige disco físico >= 1.024 MB (1 GB) instalado no PC (atual: ${rawHddMb} MB)!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'RAID_MIN_1024MB', message: msg };
      }

      if (mode === 'raid1' && window.softwareEngine) {
        const usedMb = window.softwareEngine.getUsedHddMb();
        const halfCap = Math.floor(rawHddMb * 0.50);
        if (usedMb > halfCap) {
          const msg = `⚠️ Espaço insuficiente para espelhar em RAID-1! Seus arquivos ocupam ${usedMb} MB e o corte de -50% deixaria apenas ${halfCap} MB úteis.`;
          if (typeof window.showToast === 'function') window.showToast(msg);
          return { success: false, code: 'RAID1_OVERFLOW', message: msg };
        }
      }

      this.state.raidMode = mode;
      this.state.raidRebuildUntil = mode === 'normal' ? 0 : (Date.now() + 10 * 60 * 1000); // 10m rebuild
      this.save();
      if (window.hardwareEngine) window.hardwareEngine.rerender();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = mode === 'raid0'
        ? '⚡ Matriz RAID-0 ativada (+25% velocidade após sincronização; CUIDADO: DDoS < 40% saúde corrompe 1 software do disco!).'
        : (mode === 'raid1'
            ? '🛡️ Matriz RAID-1 Espelhada ativada (100% imune à corrupção por DDoS; capacidade útil do disco reduzida em -50%!).'
            : '💿 Disco retornado ao modo AHCI Padrão (100% capacidade · 1.00x velocidade).');
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, mode, rebuildMinutes: mode === 'normal' ? 0 : 10, message: msg };
    }

    // Disparado automaticamente por HardwareEngine.applyDdosDamage quando a saúde cai < 40%!
    onPlayerPcHitByDdos(newHealthPct) {
      this.ensureLoaded();
      if (newHealthPct >= 40 || this.state.raidMode !== 'raid0' || !window.softwareEngine) {
        return { corrupted: false };
      }

      window.softwareEngine.ensureLoaded();
      const inv = window.softwareEngine.state.inventory || {};
      const candidates = Object.entries(inv).filter(([k, st]) => {
        const def = window.softwareEngine.getDefinition(k);
        return st && st.owned && Number(st.versionInt || 0) > 0 && (!def || !def.starterOwned || st.versionInt > 10);
      });

      if (candidates.length === 0) return { corrupted: false };
      const [victimKey, victimSt] = candidates[0];
      const def = window.softwareEngine.getDefinition(victimKey);
      const lostLabel = `${def ? def.filename : victimKey} v${(victimSt.versionInt / 10).toFixed(1)}`;

      if (def && def.starterOwned) {
        victimSt.versionInt = 10;
        victimSt.runningVerInt = victimSt.installed ? 10 : 0;
      } else {
        victimSt.owned = false;
        victimSt.versionInt = 0;
        victimSt.runningVerInt = 0;
        victimSt.installed = false;
      }
      window.softwareEngine.save();

      this.state.lastCorruptedSoft = `${lostLabel} (corrompido às ${new Date().toLocaleTimeString('pt-BR')})`;
      this.save();
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('RAID0-CORRUPTION', `FALHA CATASTRÓFICA RAID-0 (Saúde PC ${newHealthPct}% < 40% sob DDoS): listras corrompidas destruíram "${lostLabel}" do seu disco!`, 'danger');
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`💥 CORRUPÇÃO FÍSICA RAID-0 (Saúde ${newHealthPct}% < 40%): você perdeu "${lostLabel}"! Faça backup no XHD ou use RAID-1!`);
      }
      return { corrupted: true, lostSoftware: lostLabel };
    }

    renderHardwareRaidSectionHtml() {
      this.ensureLoaded();
      const rawHddMb = window.hardwareEngine ? Number(window.hardwareEngine.getHdd().hddMb || 350) : 350;
      const effHddMb = window.softwareEngine ? window.softwareEngine.getMaxHddMb() : rawHddMb;
      const rebuildRemMin = Math.max(0, Math.ceil((this.state.raidRebuildUntil - Date.now()) / 60000));

      return `
        <div class="hc-card" id="hardwareRaidMatrixCard" style="margin-top:12px;padding:13px 15px;border-color:rgba(168,85,247,0.4);background:#0c1118;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span class="hc-badge info">💿 MODO DO DISCO (VELOCIDADE vs. SEGURANÇA)</span>
                <span class="hc-badge ${this.state.raidMode === 'raid0' ? 'warn' : (this.state.raidMode === 'raid1' ? 'success' : '')}">
                  Atual: ${this.state.raidMode === 'normal' ? 'NORMAL' : this.state.raidMode.toUpperCase()} (${effHddMb} MB livres de ${rawHddMb} MB)
                </span>
                ${rebuildRemMin > 0 ? `<span class="hc-badge warn">⏳ Ajustando Disco: ${rebuildRemMin}m (0.85x)</span>` : ''}
              </div>
              <div style="font-size:12px;color:var(--hc-text-2);margin-top:4px;">
                Precisa de disco de 1 GB+. <strong>Modo Rápido (RAID-0):</strong> fica +25% mais rápido, mas se um ataque DDoS baixar seu PC p/ menos de 40% você perde 1 programa! <strong>Modo Seguro (RAID-1):</strong> nunca perde programas, mas usa metade (-50%) do espaço!
                ${this.state.lastCorruptedSoft ? `<br><span style="color:#fca5a5;">⚠️ Último programa perdido: ${esc(this.state.lastCorruptedSoft)}</span>` : ''}
              </div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button type="button" id="btnRaidNormal" class="hc-btn ${this.state.raidMode === 'normal' ? 'primary' : 'ghost'} sm" onclick="window.topTenMechanics.setDiskRaidMode('normal')">Normal</button>
              <button type="button" id="btnRaid0" class="hc-btn ${this.state.raidMode === 'raid0' ? 'primary' : 'ghost'} sm" onclick="window.topTenMechanics.setDiskRaidMode('raid0')">⚡ Rápido RAID-0 (+25%)</button>
              <button type="button" id="btnRaid1" class="hc-btn ${this.state.raidMode === 'raid1' ? 'primary' : 'ghost'} sm" onclick="window.topTenMechanics.setDiskRaidMode('raid1')">🛡️ Seguro RAID-1 (-50% espaço)</button>
            </div>
          </div>
          ${this.renderInlineRulesDrawerHtml(
            'top06_raid',
            'Como escolher o Modo do Disco (Normal, Rápido ou Seguro)',
            'O Modo Rápido (RAID-0) acelera suas quebras e cópias em +25% (depois de 10 min ajustando). O Modo Seguro (RAID-1) protege seus programas mesmo sob ataque DDoS pesado.',
            'No Modo Rápido (RAID-0), se um ataque DDoS derrubar a saúde do seu PC abaixo de 40%, um programa instalado é corrompido e apagado! No Modo Seguro (RAID-1), você fica com metade (-50%) do espaço em MB.',
            '• Dica: se usar o Modo Rápido (RAID-0), guarde cópia dos seus programas importantes na aba HD Externo!'
          )}
        </div>
      `;
    }

    // =========================================================================
    // TOP #07: PATROCÍNIO CORPORATIVO DE CLÃS ($30K CAUÇÃO) & GUERRA 3 FRENTES
    // =========================================================================
    signClanCorpSponsorship(corpSymbol) {
      this.ensureLoaded();
      const myClan = window.clanEngine ? window.clanEngine.getMyClan() : null;
      if (!myClan) {
        const msg = 'Entre ou funde um Clã primeiro para assinar um Patrocínio Corporativo!';
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'NO_CLAN', message: msg };
      }
      if (this.state.clanSponsorship && this.state.clanSponsorship.status === 'active') {
        return { success: false, message: `Seu clã já possui contrato ativo com ${this.state.clanSponsorship.corpSymbol}!` };
      }

      const DEPOSIT = 30000;
      const cleanBal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
      if (cleanBal < DEPOSIT) {
        if (window.nineSystemsEngine && window.nineSystemsEngine.getDirtyBalance() > 0) {
          window.nineSystemsEngine.openDirtyMoneyBridgeModal(`Caução Patrocínio SLA (${corpSymbol})`, DEPOSIT);
        }
        const msg = `Caução SLA insuficiente! Assinar patrocínio corporativo exige travar ${fmtMoney(DEPOSIT)} em DINHEIRO LIMPO.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'INSUFFICIENT_SLA_DEPOSIT', message: msg };
      }

      runAuth(() => {
        window.currentWallet.balance = Math.max(0, +(cleanBal - DEPOSIT).toFixed(2));
      });

      this.state.clanSponsorship = {
        corpSymbol: String(corpSymbol || 'FARO').toUpperCase(),
        depositClean: DEPOSIT,
        status: 'active',
        signedAt: new Date().toLocaleTimeString('pt-BR')
      };
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.clanEngine) window.clanEngine.renderUI();
      const msg = `🤝 Patrocínio assinado com [${this.state.clanSponsorship.corpSymbol}]! Caução de $ 30.000 travada: mantenha integridade >= 70% p/ receber $ 8.500 às 12:00 (cair < 35% confisca os $ 30.000!).`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, sponsorship: this.state.clanSponsorship, message: msg };
    }

    evaluateSponsoredCorpIntegrity() {
      this.ensureLoaded();
      const sp = this.state.clanSponsorship;
      if (!sp || sp.status !== 'active' || !window.ecosystemHub) return null;
      window.ecosystemHub.ensureLoaded();
      const st = window.ecosystemHub.state.stocks && window.ecosystemHub.state.stocks[sp.corpSymbol];
      if (!st) return null;

      if (st.integrity < 35) {
        sp.status = 'breached_forfeited';
        this.save();
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('SLA-BREACH-30K', `QUEBRA DE CONTRATO CORPORATIVO: integridade de ${sp.corpSymbol} caiu para ${st.integrity}% (< 35%)! A corporação executou a multa e CONFISCOU seus $ 30.000 de caução!`, 'danger');
        }
        if (typeof window.showToast === 'function') {
          window.showToast(`🚨 QUEBRA DE SLA (${sp.corpSymbol} < 35% integridade): você perdeu os $ 30.000 de caução do patrocínio!`);
        }
        return { forfeited: true, integrity: st.integrity };
      }
      return { forfeited: false, integrity: st.integrity };
    }

    settleClanSponsorshipAtNoon(count = 1) {
      this.ensureLoaded();
      const sp = this.state.clanSponsorship;
      if (!sp || sp.status !== 'active' || !window.ecosystemHub) return;
      const check = this.evaluateSponsoredCorpIntegrity();
      if (!check || check.forfeited) return;

      if (check.integrity >= 70) {
        const myClan = window.clanEngine ? window.clanEngine.getMyClan() : null;
        const clanShare = 5500 * count;
        const playerShare = 3000 * count;
        if (myClan) {
          myClan.treasury = Number(myClan.treasury || 0) + clanShare;
          window.clanEngine.save();
        }
        runAuth(() => {
          if (window.currentWallet) {
            window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + playerShare).toFixed(2);
          }
        });
      }
    }

    recordClanWarFrontAction(frontKey) {
      this.ensureLoaded();
      if (!['ddos', 'cctv', 'blueteam'].includes(frontKey)) return { success: false };
      const war = window.clanEngine && window.clanEngine.ensureLoaded().activeWar;
      this.state.warFronts[frontKey] = Number(this.state.warFronts[frontKey] || 0) + 1;
      if (war) {
        const pts = frontKey === 'ddos' ? 120 : (frontKey === 'cctv' ? 110 : 95);
        war.ourScore = Number(war.ourScore || 0) + pts;
        const allThreeActive = this.state.warFronts.ddos > 0 && this.state.warFronts.cctv > 0 && this.state.warFronts.blueteam > 0;
        if (allThreeActive && !war.threeFrontBonusApplied) {
          war.bountyPool = Math.round(Number(war.bountyPool || 900) * 1.35);
          war.threeFrontBonusApplied = true;
        }
        window.clanEngine.save();
        window.clanEngine.renderUI();
      }
      this.save();
      if (typeof window.showToast === 'function') {
        window.showToast(`⚔️ Frente de Guerra [${frontKey.toUpperCase()}] pontuada!${war && war.threeFrontBonusApplied ? ' Bônus Triplo +35% no Bounty ativado!' : ''}`);
      }
      return { success: true, fronts: this.state.warFronts };
    }

    renderClanSponsorshipAnd3FrontsHtml() {
      this.ensureLoaded();
      const sp = this.state.clanSponsorship;
      const wf = this.state.warFronts || { ddos: 0, cctv: 0, blueteam: 0 };
      const symbols = ['FARO', 'MRDN', 'AEGS', 'CRVO', 'KRNO', 'OMNI', 'HEBC', 'EVIL'];
      const curIntegrity = (sp && window.ecosystemHub && window.ecosystemHub.ensureLoaded().stocks[sp.corpSymbol])
        ? window.ecosystemHub.state.stocks[sp.corpSymbol].integrity
        : 100;

      return `
        <div class="hc-card" id="clanSponsorship3FrontsCard" style="padding:14px 16px;border-color:rgba(245,158,11,0.4);background:#0c1118;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
            <div>
              <span class="hc-badge warn">🤝 PATROCÍNIO DE EMPRESA &amp; GUERRA EM 3 FRENTES</span>
              <div style="font-size:12.5px;color:var(--hc-text-2);margin-top:5px;">
                ${sp && sp.status === 'active'
                  ? `🤝 Empresa Patrocinadora: <strong>${esc(sp.corpSymbol)}</strong> · Saúde atual: <strong style="color:${curIntegrity >= 70 ? '#4ade80' : (curIntegrity < 35 ? '#f87171' : '#fbbf24')};">${curIntegrity}%</strong> (Garantia presa: $ 30.000 Limpos · Paga $ 8.500 às 12h se ficar &gt;= 70%).`
                  : (sp && sp.status === 'breached_forfeited'
                      ? `🚨 <span style="color:#fca5a5;">Contrato anterior com ${esc(sp.corpSymbol)} cancelado (saúde caiu &lt; 35% — você perdeu os $ 30.000 de garantia!).</span> Pode assinar outro:`
                      : `Deixe <strong>$ 30.000 Limpos</strong> de garantia para proteger uma empresa da Bolsa e ganhar <strong>$ 8.500/dia às 12h</strong>:`)}
              </div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">
                <span class="hc-badge ${wf.ddos > 0 ? 'success' : ''}">Frente 1 DDoS: ${wf.ddos}</span>
                <span class="hc-badge ${wf.cctv > 0 ? 'success' : ''}">Frente 2 Câmeras: ${wf.cctv}</span>
                <span class="hc-badge ${wf.blueteam > 0 ? 'success' : ''}">Frente 3 Defesa: ${wf.blueteam}</span>
                <button type="button" id="btnScoreWarCctvFront" class="hc-btn ghost sm" onclick="window.topTenMechanics.recordClanWarFrontAction('cctv')">📹 Pontuar Câmeras</button>
                <button type="button" id="btnScoreWarBlueFront" class="hc-btn ghost sm" onclick="window.topTenMechanics.recordClanWarFrontAction('blueteam')">🧯 Pontuar Defesa</button>
              </div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              ${!sp || sp.status !== 'active' ? `
                <select id="clanSponsorSymbolSelect" class="form-input mono" style="width:110px;height:32px;padding:0 8px;font-size:12px;">
                  ${symbols.map((sym) => `<option value="${sym}">${sym}</option>`).join('')}
                </select>
                <button type="button" id="btnSignClanSponsorship" class="hc-btn primary sm"
                  onclick="window.topTenMechanics.signClanCorpSponsorship(document.getElementById('clanSponsorSymbolSelect')?.value)">
                  🤝 Assinar Patrocínio ($ 30 mil)
                </button>
              ` : `
                <button type="button" class="hc-btn ghost sm" onclick="navTo('winOpsHub');window.ecosystemHub.switchTab('stocks');">Defender ${esc(sp.corpSymbol)} na Bolsa →</button>
              `}
            </div>
          </div>
          ${this.renderInlineRulesDrawerHtml(
            'top07_clan_sla',
            'Como funciona o Patrocínio de Empresa e a Guerra em 3 Frentes',
            'Se a empresa patrocinada chegar às 12h com saúde >= 70%, paga $ 8.500 Limpos/dia ($ 5.500 pro caixa do clã + $ 3.000 pra você). E pontuar nas 3 Frentes de Guerra aumenta o prêmio em +35%!',
            'CUIDADO: se outros jogadores sabotarem sua empresa e a saúde dela cair abaixo de 35%, o contrato é cancelado na hora e você PERDE OS $ 30.000 DE GARANTIA!',
            '• Você pode recuperar a saúde da sua empresa fazendo missões de Defesa (White-Hat) na Bolsa CyberStock.'
          )}
        </div>
      `;
    }

    // =========================================================================
    // TOP #08: ESCALAÇÃO MANUAL FTP/SSH -> ROOT ("BUFFER OVERFLOW") & IPTABLES
    // =========================================================================
    areExploitPortsLocked(ip) {
      this.ensureLoaded();
      const until = Number(this.state.portLockoutByIp[ip] || 0);
      if (until > Date.now()) {
        return { locked: true, remMin: Math.ceil((until - Date.now()) / 60000), until };
      }
      return { locked: false, remMin: 0, until: 0 };
    }

    openBufferOverflowModal(ip) {
      this.ensureLoaded();
      const now = Date.now();
      const cdUntil = Number(this.state.boAttemptCooldownByIp[ip] || 0);
      if (cdUntil > now) {
        const remMin = Math.ceil((cdUntil - now) / 60000);
        const msg = `⏳ Buffer de pilha protegido por ASLR temporário em ${ip}: aguarde ${remMin} min para tentar escalar privilégio novamente.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'BO_COOLDOWN', message: msg };
      }

      const targetOffset = '0x7FFFdead4090';
      const options = [
        { code: '0x7FFF004011A0', valid: false, desc: 'Guarda Stack Canary (__stack_chk_fail -> SEGFAULT!)' },
        { code: targetOffset,   valid: true,  desc: 'Ponteiro NOP-Sled alinhado -> commit_creds(prepare_kernel_cred(0))' },
        { code: '0x000000000000', valid: false, desc: 'Null Pointer Dereference (SIGSEGV -> Tranca Portas 21/22!)' }
      ];

      this.activeBoModal = {
        ip,
        targetOffset,
        options,
        secondsLeft: 12
      };
      this.renderBufferOverflowModalDom();
      if (this._boTimer) clearInterval(this._boTimer);
      this._boTimer = setInterval(() => {
        if (!this.activeBoModal) {
          clearInterval(this._boTimer);
          return;
        }
        this.activeBoModal.secondsLeft -= 1;
        const lbl = document.getElementById('boModalCountdown');
        if (lbl) lbl.textContent = `${this.activeBoModal.secondsLeft}s`;
        if (this.activeBoModal.secondsLeft <= 0) {
          clearInterval(this._boTimer);
          this.submitBufferOverflowAttempt(ip, 'TIMEOUT_SEGFAULT');
        }
      }, 1000);
      return { success: true, targetOffset };
    }

    submitBufferOverflowAttempt(ip, chosenOffset) {
      this.ensureLoaded();
      if (this._boTimer) clearInterval(this._boTimer);
      const modalMeta = this.activeBoModal;
      this.activeBoModal = null;
      const el = document.getElementById('hcBufferOverflowModal');
      if (el) el.remove();

      this.state.boAttemptCooldownByIp[ip] = Date.now() + 30 * 60 * 1000; // 1x a cada 30m por host
      const isSuccess = chosenOffset === (modalMeta ? modalMeta.targetOffset : '0x7FFFdead4090');

      if (isSuccess) {
        if (window.internetEngine && window.internetEngine.activeSshIp === ip) {
          window.internetEngine.activeSshRole = 'root';
        }
        if (window.hackedDb) {
          const entry = window.hackedDb.getEntry(ip);
          if (entry) {
            entry.sshUser = 'root';
            window.hackedDb.save();
          }
        }
        this.save();
        if (window.internetEngine) window.internetEngine.render();
        const msg = `🔥 ESCALAÇÃO RING-0 CONCLUÍDA! Sessão parcial promovida para ROOT COMPLETO em ${ip} sem precisar da senha!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: true, escalatedToRoot: true, message: msg };
      }

      // LADO NEGATIVO PESADO (SEGFAULT): expulsa na hora + tranca portas 21/22 por 20 min + grava IP + +1 Heat!
      this.state.portLockoutByIp[ip] = Date.now() + 20 * 60 * 1000;
      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      if (window.internetEngine) {
        window.internetEngine.appendServerLog(ip, `CRITICAL kernel: segfault at 00000000 ip ${myIp} sp 7fff0040 error 14 [PORTS 21/22 LOCKED 20M]`);
        if (window.internetEngine.activeSshIp === ip) {
          window.internetEngine.disconnectSsh(true);
        }
        window.internetEngine.activeTab = 'invadir';
        window.internetEngine.render();
      }
      runAuth(() => {
        if (window.currentProfile) {
          window.currentProfile.heat_level = Math.min(5, Number(window.currentProfile.heat_level || 1) + 1);
        }
      });
      this.evaluateBacenjudFreeze();
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = `💥 SEGFAULT DETECTADO! Você foi expulso de ${ip}, as portas 21/FTP e 22/SSH trancaram por 20 MINUTOS, seu IP ficou gravado no kernel e seu Heat subiu +1!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: false, code: 'SEGFAULT_PORT_LOCKOUT_20M', escalatedToRoot: false, message: msg };
    }

    renderBufferOverflowModalDom() {
      let existing = document.getElementById('hcBufferOverflowModal');
      if (existing) existing.remove();
      if (!this.activeBoModal || typeof document === 'undefined') return;
      const m = this.activeBoModal;

      const wrap = document.createElement('div');
      wrap.id = 'hcBufferOverflowModal';
      wrap.style.cssText = 'position:fixed;inset:0;z-index:9995;background:rgba(5,8,14,0.86);display:grid;place-items:center;padding:16px;';
      wrap.innerHTML = `
        <div class="hc-card" style="max-width:540px;width:100%;padding:20px 22px;border-color:var(--hc-warning);background:#0c1118;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;">
            <span class="hc-badge warn">🧨 VIRAR ROOT SEM SENHA (12 SEGUNDOS)</span>
            <strong id="boModalCountdown" class="mono" style="color:#f87171;font-size:16px;">${m.secondsLeft}s</strong>
          </div>
          <h3 style="margin:0 0 6px;font-size:16.5px;">Clique no código exato: <code style="color:#4ade80;">${esc(m.targetOffset)}</code></h3>
          <p style="font-size:12.5px;color:var(--hc-text-2);margin:0 0 12px;line-height:1.45;">
            Acerte o código acima para virar <strong>ROOT</strong> na hora em <code>${esc(m.ip)}</code>. <strong>Cuidado:</strong> se errar ou o tempo acabar, você é expulso, <strong>as portas 21/22 trancam por 20 minutos</strong>, seu IP fica gravado e seu Nível de Procura sobe +1!
          </p>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${m.options.map((opt, idx) => `
              <button type="button" id="btnBoOption_${idx}" class="hc-choice-row"
                onclick="window.topTenMechanics.submitBufferOverflowAttempt('${esc(m.ip)}', '${esc(opt.code)}')">
                <span class="hc-choice-main">
                  <span class="hc-choice-title mono">${esc(opt.code)}</span>
                  <span class="hc-choice-desc">${idx === 1 ? 'Endereço alinhado da memória' : `Endereço instável #${idx + 1}`}</span>
                </span>
                <span class="hc-choice-cta">Injetar →</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
      document.body.appendChild(wrap);
    }

    executeIptablesSilentBypass(ip, headerSignature = 'TTL64_ACK_FRAG08') {
      this.ensureLoaded();
      const now = Date.now();
      const cd = Number(this.state.iptablesCooldownByIp[ip] || 0);
      if (cd > now) {
        const remMin = Math.ceil((cd - now) / 60000);
        return { success: false, code: 'IPTABLES_COOLDOWN', message: `Aguarde ${remMin}m para recalibrar pacotes IPTables em ${ip}.` };
      }

      this.state.iptablesCooldownByIp[ip] = now + 15 * 60 * 1000;
      if (headerSignature === 'TTL64_ACK_FRAG08') {
        this.state.iptablesStealthByIp[ip] = true;
        this.save();
        if (window.internetEngine) window.internetEngine.render();
        const msg = `🕵️ Bypass Silencioso IPTables calibrado em ${ip}! Sua próxima extração neste host gerará 0 alerta na Safenet!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: true, stealthArmed: true, message: msg };
      }

      // Lado Negativo: cabeçalho malformado dispara IDS (+1.0 Firewall por 15m + +1 Heat)
      this.state.idsFirewallSpikeByIp[ip] = { bonusFw: 1.0, expiresAt: now + 15 * 60 * 1000 };
      runAuth(() => {
        if (window.currentProfile) {
          window.currentProfile.heat_level = Math.min(5, Number(window.currentProfile.heat_level || 1) + 1);
        }
      });
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.internetEngine) window.internetEngine.render();
      const msg = `🚨 PACOTE REJEITADO PELO IDS! Firewall de ${ip} subiu +1.0 por 15m e você recebeu +1 Heat!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: false, code: 'IDS_SPIKE', stealthArmed: false, message: msg };
    }

    consumeIptablesStealthIfArmed(ip) {
      this.ensureLoaded();
      if (this.state.iptablesStealthByIp[ip]) {
        delete this.state.iptablesStealthByIp[ip];
        this.save();
        return true;
      }
      return false;
    }

    // =========================================================================
    // TOP #09: CONTRATOS MERCENÁRIOS P2P COM CUSTÓDIA ESCROW NO FÓRUM
    // =========================================================================
    createMercenaryEscrowContract(targetIpRaw, objectiveKind, rewardCleanRaw) {
      this.ensureLoaded();
      const targetIp = String(targetIpRaw || '').trim();
      const reward = Math.round(Number(rewardCleanRaw || 0));
      if (!targetIp || !/^\d{1,3}(\.\d{1,3}){3}$/.test(targetIp)) {
        return { success: false, message: 'Informe um IP alvo válido (ex: 203.17.88.40).' };
      }
      if (reward < 2000 || reward > 25000) {
        return { success: false, code: 'ESCROW_OUT_OF_RANGE', message: 'A recompensa em custódia deve ser entre $ 2.000 e $ 25.000 Limpos.' };
      }

      const notaryFee = Math.round(reward * 0.15); // 15% taxa não-reembolsável do Cartório Darknet!
      const totalDebitClean = reward + notaryFee;
      const cleanBal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
      if (cleanBal < totalDebitClean) {
        if (window.nineSystemsEngine && window.nineSystemsEngine.getDirtyBalance() > 0) {
          window.nineSystemsEngine.openDirtyMoneyBridgeModal('Contrato Mercenário Escrow (+15%)', totalDebitClean);
        }
        const msg = `Saldo Limpo insuficiente! Travar ${fmtMoney(reward)} + 15% de Taxa de Custódia (${fmtMoney(notaryFee)}) exige ${fmtMoney(totalDebitClean)} Limpos.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'INSUFFICIENT_ESCROW_FUNDS', message: msg };
      }

      runAuth(() => {
        window.currentWallet.balance = Math.max(0, +(cleanBal - totalDebitClean).toFixed(2));
      });

      const labels = {
        crack_root: 'Quebrar Acesso Root Verificado',
        disable_cctv: 'Desativar Câmeras CFTV da Empresa',
        ddos_wanted: 'Derrubar Alvo via Sobrecarga DDoS'
      };
      const host = window.internetEngine ? window.internetEngine.resolveHost(targetIp) : null;
      const contract = {
        id: 'escrow_usr_' + Date.now(),
        hirerTag: (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador',
        objectiveKind: labels[objectiveKind] ? objectiveKind : 'crack_root',
        objectiveLabel: labels[objectiveKind] || labels.crack_root,
        targetIp,
        targetLabel: `${host && !host.notFound ? host.hostname : 'Host Alvo'} (${targetIp})`,
        rewardDirty: reward,
        notaryFeeBurned: notaryFee,
        status: 'open',
        isMine: true,
        reservedByMe: false,
        reservedUntil: 0
      };
      this.state.escrowContracts.unshift(contract);
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.darknetSocialEngine) window.darknetSocialEngine.renderForumUI();
      const msg = `📜 Contrato Escrow publicado! ${fmtMoney(reward)} travados em custódia + ${fmtMoney(notaryFee)} (15% taxa não-reembolsável do Cartório Darknet).`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, contract, totalDebitClean, notaryFee, message: msg };
    }

    acceptMercenaryContract(contractId) {
      this.ensureLoaded();
      const c = this.state.escrowContracts.find((x) => x.id === contractId);
      if (!c) return { success: false, message: 'Contrato não encontrado.' };
      if (c.isMine) return { success: false, message: 'Você é o contratante deste Escrow — outro mercenário deve executá-lo!' };
      if (c.status !== 'open') return { success: false, message: 'Contrato já reservado ou concluído.' };

      c.status = 'reserved';
      c.reservedByMe = true;
      c.reservedUntil = Date.now() + 30 * 60 * 1000; // 30m exclusividade (falhar = -35 REP!)
      this.save();
      if (window.darknetSocialEngine) window.darknetSocialEngine.renderForumUI();
      const msg = `🎯 Contrato reservado por 30 MINUTOS (${c.targetLabel})! Cumpra o objetivo e clique em Verificar p/ receber +${fmtMoney(c.rewardDirty)} Sujos (atrasar custa -35 REP!).`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, contract: c, message: msg };
    }

    checkExpiredMercenaryReservations(now = Date.now()) {
      this.ensureLoaded();
      let penalized = false;
      this.state.escrowContracts.forEach((c) => {
        if (c.status === 'reserved' && c.reservedByMe && now > c.reservedUntil) {
          c.status = 'open';
          c.reservedByMe = false;
          c.reservedUntil = 0;
          penalized = true;
          runAuth(() => {
            if (window.currentProfile) {
              window.currentProfile.reputation = Math.max(0, Number(window.currentProfile.reputation || 0) - 35);
            }
          });
        }
      });
      if (penalized) {
        this.save();
        if (typeof window.showToast === 'function') {
          window.showToast('⚠️ Prazo de 30m do Contrato Mercenário expirou sem entrega! Penalidade de calote: -35 REP!');
        }
      }
      return penalized;
    }

    verifyAndClaimMercenaryContract(contractId) {
      this.ensureLoaded();
      const c = this.state.escrowContracts.find((x) => x.id === contractId);
      if (!c || c.status === 'completed') return { success: false, message: 'Contrato inválido ou já pago.' };
      if (!c.reservedByMe) {
        this.acceptMercenaryContract(contractId);
      }

      let verified = false;
      if (c.objectiveKind === 'crack_root') {
        const saved = window.hackedDb ? window.hackedDb.getEntry(c.targetIp) : null;
        verified = !!(saved && (saved.sshUser || 'root') === 'root');
      } else if (c.objectiveKind === 'disable_cctv') {
        verified = !!(window.cctvEngine && window.cctvEngine.areAllCamerasDisabled(c.targetIp));
      } else if (c.objectiveKind === 'ddos_wanted') {
        const hPct = window.ddosOverloadEngine ? window.ddosOverloadEngine.getTargetHealthPct(c.targetIp) : 100;
        verified = hPct < 75;
      }

      if (!verified) {
        const msg = `❌ Verificação automática negada pelo Cartório Darknet: conclua "${c.objectiveLabel}" em ${c.targetIp} antes de sacar o Escrow!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'OBJECTIVE_NOT_VERIFIED', message: msg };
      }

      c.status = 'completed';
      c.reservedByMe = false;
      if (window.nineSystemsEngine) {
        window.nineSystemsEngine.addDirtyMoney(c.rewardDirty, `Escrow Mercenário P2P (@${c.hirerTag})`);
      }
      runAuth(() => {
        if (window.currentProfile) {
          window.currentProfile.reputation = Number(window.currentProfile.reputation || 0) + 30;
        }
      });
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.darknetSocialEngine) window.darknetSocialEngine.renderForumUI();
      const msg = `🩸 ESCROW LIBERADO! +${fmtMoney(c.rewardDirty)} em DINHEIRO SUJO creditados (+30 REP)! Lave nas Empresas de Fachada antes de gastar!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, rewardDirty: c.rewardDirty, message: msg };
    }

    renderForumMercenaryEscrowSectionHtml() {
      this.ensureLoaded();
      const rows = (this.state.escrowContracts || []).slice(0, 6).map((c) => {
        const remMin = c.reservedUntil > Date.now() ? Math.ceil((c.reservedUntil - Date.now()) / 60000) : 0;
        return `
          <div style="padding:10px 12px;border-radius:8px;background:#0c1118;border:1px solid #1f2a38;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
            <div>
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <span class="hc-badge ${c.status === 'completed' ? 'success' : (c.status === 'reserved' ? 'warn' : 'info')}">
                  ${c.status === 'completed' ? 'PAGO ✓' : (c.status === 'reserved' ? `PEGOU (${remMin}m)` : 'ABERTO')}
                </span>
                <strong style="font-size:13px;color:var(--hc-text);">${esc(c.objectiveLabel)} — <code>${esc(c.targetIp)}</code></strong>
              </div>
              <div style="font-size:11.5px;color:var(--hc-text-3);margin-top:2px;">
                Quem pediu: <strong style="color:var(--hc-accent-text);">@${esc(c.hirerTag)}</strong> · Prêmio guardado: <strong style="color:#fbbf24;">${fmtMoney(c.rewardDirty)} (recebe em Dinheiro Sujo)</strong> · Taxa de garantia: ${fmtMoney(c.notaryFeeBurned)}
              </div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${c.status === 'completed'
                ? `<span class="hc-badge success">Concluído</span>`
                : (c.isMine
                    ? `<span class="hc-badge">Esperando alguém pegar</span>`
                    : (c.reservedByMe
                        ? `<button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('${esc(c.targetIp)}', 'invadir')">Ir ao Alvo →</button>
                           <button type="button" id="btnVerifyEscrow_${esc(c.id)}" class="hc-btn primary sm" onclick="window.topTenMechanics.verifyAndClaimMercenaryContract('${esc(c.id)}')">✓ Comprovar &amp; Receber</button>`
                        : `<button type="button" id="btnAcceptEscrow_${esc(c.id)}" class="hc-btn primary sm" onclick="window.topTenMechanics.acceptMercenaryContract('${esc(c.id)}')">🎯 Pegar Serviço (30m)</button>`))}
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="hc-card" id="forumMercenaryEscrowCard" style="margin-bottom:16px;padding:14px 16px;border-color:rgba(245,158,11,0.4);background:#090d14;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
            <div>
              <span class="hc-badge warn">🎯 MURAL DE SERVIÇOS ENTRE JOGADORES (PAGAMENTO GARANTIDO)</span>
              <div style="font-size:12px;color:var(--hc-text-2);margin-top:3px;">
                Contrate outro jogador por <strong>$ 2.000 a $ 25.000 Limpos</strong> (+15% taxa) para invadir um alvo por você, ou pegue um serviço em até 30 min para ganhar Dinheiro Sujo!
              </div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
              <input type="text" id="escrowTargetIpInput" class="form-input mono" style="width:125px;height:32px;padding:0 8px;font-size:12px;" value="203.17.88.40" placeholder="IP Alvo">
              <select id="escrowObjSelect" class="form-input" style="width:165px;height:32px;padding:0 8px;font-size:12px;">
                <option value="crack_root">Quebrar Root</option>
                <option value="disable_cctv">Apagar Câmeras</option>
                <option value="ddos_wanted">Derrubar DDoS</option>
              </select>
              <input type="number" id="escrowRewardInput" class="form-input mono" style="width:100px;height:32px;padding:0 8px;font-size:12px;" value="3000" min="2000" max="25000" step="500">
              <button type="button" id="btnCreateMercenaryEscrow" class="hc-btn primary sm"
                onclick="window.topTenMechanics.createMercenaryEscrowContract(document.getElementById('escrowTargetIpInput')?.value, document.getElementById('escrowObjSelect')?.value, document.getElementById('escrowRewardInput')?.value)">
                + Criar Contrato (+15%)
              </button>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">${rows}</div>
          ${this.renderInlineRulesDrawerHtml(
            'top09_escrow',
            'Como funcionam os Serviços com Pagamento Garantido',
            'Sem risco de calote: o dinheiro fica guardado pelo Fórum e cai na hora assim que o sistema confirma o Root ou o apagão das câmeras no IP pedido.',
            'Quem contrata paga +15% de taxa ao publicar; quem faz o serviço recebe em DINHEIRO SUJO (precisa lavar depois!) e, se pegar o serviço e não entregar em 30 min, perde -35 REP!',
            '• Serviços aceitos: Quebrar Senha Root, Apagar Câmeras da Empresa ou Derrubar via DDoS.'
          )}
        </div>
      `;
    }

    // =========================================================================
    // TOP #10: SISTEMA DE "NÊMESIS EVOLUTIVO" & DEFCON LARANJA CORPORATIVO
    // =========================================================================
    getHostDynamicDefenseModifiers(ip) {
      this.ensureLoaded();
      const now = Date.now();
      let extraFw = 0;
      let extraHasher = 0;
      let cashMult = 1.0;
      let isNemesis = false;
      let isDefconOrange = false;
      let extortionFw = 0;

      // 1. Extorsão CFTV recusada (+2.0 FW por 2h)
      const extBoost = this.state.corpFirewallBoostByIp[ip];
      if (extBoost && extBoost.expiresAt > now) {
        extortionFw = Number(extBoost.bonusFw || 2.0);
        extraFw += extortionFw;
      }

      // 2. IDS IPTables malformado (+1.0 FW por 15m)
      const idsSpike = this.state.idsFirewallSpikeByIp[ip];
      if (idsSpike && idsSpike.expiresAt > now) {
        extraFw += Number(idsSpike.bonusFw || 1.0);
      }

      // 3. DEFCON Laranja Corporativo (4+ ataques em 1h -> +1.5 FW, +1.0 Hasher, +60% caixa por 30m!)
      const defUntil = Number(this.state.defconOrangeByIp[ip] || 0);
      if (defUntil > now) {
        isDefconOrange = true;
        extraFw += 1.5;
        extraHasher += 1.0;
        cashMult = +(cashMult * 1.60).toFixed(2);
      }

      // 4. Nêmesis Evolutivo (3 invasões no mesmo Bot -> +1.5 adaptativo + 3x saque!)
      const botEntry = this.state.botHitCounts[ip];
      if (botEntry && botEntry.adapted) {
        isNemesis = true;
        if (botEntry.lastMethod === 'exploit') extraFw += 1.5;
        else extraHasher += 1.5;
        cashMult = +(cashMult * 3.0).toFixed(2);
      }

      return { extraFw, extraHasher, cashMult, isNemesis, isDefconOrange, extortionFw };
    }

    registerHostIntrusionForNemesisAndDefcon(host, method = 'password') {
      this.ensureLoaded();
      if (!host || !host.ip) return null;
      const now = Date.now();

      // A) Bot -> Nêmesis Evolutivo na 3ª invasão!
      if (host.kind === 'bot') {
        const cur = this.state.botHitCounts[host.ip] || { count: 0, lastMethod: method, adapted: false, handle: host.botRef?.handle || host.hostname };
        cur.count += 1;
        cur.lastMethod = method;

        if (cur.count >= 3 && !cur.adapted) {
          cur.adapted = true;
          this.state.nemesisBotIp = host.ip;
          const myTag = (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador';
          if (window.darknetSocialEngine && Array.isArray(window.darknetSocialEngine.threads)) {
            window.darknetSocialEngine.threads.unshift({
              id: 'th_nem_' + now,
              category: 'farpas',
              title: `[CAÇADA PESSOAL] @${cur.handle} jurou vingança contra @${myTag}!`,
              authorTag: cur.handle,
              authorSpec: 'sentinel',
              pinned: false,
              locked: false,
              upvotes: 19,
              votedBy: [],
              views: 84,
              createdAt: 'Agora mesmo',
              posts: [{
                id: 'p_nem_' + now,
                authorTag: cur.handle,
                content: `Você invadiu minha máquina 3 vezes seguidas, @${myTag}! Blindei meu ${method === 'exploit' ? 'Firewall (+1.5)' : 'Hasher (+1.5)'} contra seu método favorito. Se deixar rastro na minha syslog, meu enxame DDoS vai queimar tua placa-mãe!`,
                upvotes: 11,
                votedBy: [],
                createdAt: 'Agora mesmo'
              }]
            });
            window.darknetSocialEngine.saveState();
          }
          if (typeof window.showToast === 'function') {
            window.showToast(`⚔️ NOVO NÊMESIS EVOLUTIVO: ${cur.handle} (${host.ip}) adaptou +1.5 ${method === 'exploit' ? 'Firewall' : 'Hasher'}, postou farpa no Fórum e agora rende 3x Saque!`);
          }
        } else if (cur.adapted && window.ecosystemHub && Math.random() < 0.50) {
          window.ecosystemHub.ensureLoaded();
          window.ecosystemHub.state.labCatalysts = Number(window.ecosystemHub.state.labCatalysts || 0) + 1;
          window.ecosystemHub.save();
          if (typeof window.showToast === 'function') {
            window.showToast(`🧪 Bônus Nêmesis Derrotado: +1 Catalisador do Laboratório saqueado de ${cur.handle}!`);
          }
        }
        this.state.botHitCounts[host.ip] = cur;
        this.save();
        return { nemesis: cur.adapted, count: cur.count };
      }

      // B) Corporação -> DEFCON Laranja ao atingir 4 ataques em 1h!
      if (host.kind === 'empresa' || CORP_BY_IP[host.ip]) {
        const list = (this.state.corpHitTimestamps[host.ip] || []).filter((ts) => now - ts < 60 * 60 * 1000);
        list.push(now);
        this.state.corpHitTimestamps[host.ip] = list;
        if (list.length >= 4 && Number(this.state.defconOrangeByIp[host.ip] || 0) <= now) {
          this.state.defconOrangeByIp[host.ip] = now + 30 * 60 * 1000; // 30m
          if (typeof window.showToast === 'function') {
            window.showToast(`🟠 DEFCON LARANJA ATIVADO em ${host.hostname}! Firewall +1.5 por 30m, MAS reserva líquida subiu +60%!`);
          }
        }
        this.save();
        return { defconOrange: Number(this.state.defconOrangeByIp[host.ip] || 0) > now, hitsInHour: list.length };
      }
      return null;
    }

    triggerNemesisRetaliationIfApplicable(ip) {
      this.ensureLoaded();
      const botEntry = this.state.botHitCounts[ip];
      if (!botEntry || !botEntry.adapted || !window.hardwareEngine) return null;
      const dmgRes = window.hardwareEngine.applyDdosDamage(25, `Nêmesis ${botEntry.handle}`);
      if (typeof window.showToast === 'function') {
        window.showToast(`💥 RETALIAÇÃO DO NÊMESIS (${botEntry.handle}): ataque DDoS reverso reduziu a saúde do seu PC para ${dmgRes.healthPct}%!`);
      }
      return dmgRes;
    }

    renderInvadirEliteTacticalStripHtml(host) {
      this.ensureLoaded();
      if (!host || !host.ip || host.kind === 'self') return '';
      const mods = this.getHostDynamicDefenseModifiers(host.ip);
      const portLock = this.areExploitPortsLocked(host.ip);
      const stealthArmed = !!this.state.iptablesStealthByIp[host.ip];
      const isHighTierRelicHost = ['209.141.55.10', '161.89.2.1', '77.3.13.99', '161.89.1.1'].includes(host.ip);

      return `
        <div class="hc-card" id="invadirEliteTacticalCard" style="padding:11px 14px;border-color:rgba(56,189,248,0.38);background:#0b1018;display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <span class="hc-badge info">🕵️ OPÇÕES TÁTICAS DO ALVO</span>
              ${mods.isNemesis ? `<span class="hc-badge danger">⚔️ SEU RIVAL NÊMESIS (+1.5 DEFESA · PAGA 3x MAIS!)</span>` : ''}
              ${mods.isDefconOrange ? `<span class="hc-badge warn">🟠 ALERTA LARANJA (+1.5 FW · +60% DINHEIRO!)</span>` : ''}
              ${portLock.locked ? `<span class="hc-badge danger">🔒 PORTAS 21/22 TRANCADAS (${portLock.remMin}m)</span>` : ''}
              ${stealthArmed ? `<span class="hc-badge success">🕵️ ATAQUE SILENCIOSO ATIVO (SEM ALERTA POLICIAL)</span>` : ''}
              ${isHighTierRelicHost ? `<span class="hc-badge info">🧬 TEM BLOCO SECRETO (USE SEEKER v3.0+)</span>` : ''}
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button type="button" id="btnIptablesBypass" class="hc-btn ${stealthArmed ? 'ghost' : 'primary'} sm" ${stealthArmed ? 'disabled' : ''}
                onclick="window.topTenMechanics.executeIptablesSilentBypass('${esc(host.ip)}', 'TTL64_ACK_FRAG08')">
                ${stealthArmed ? '✓ Ataque Silencioso Ativo' : '🕵️ Ataque Silencioso (Sem alerta Safenet)'}
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // =========================================================================
    // PAINEL CONSOLIDADO EM #winOpsHub (ABA "🏆 Top 10 & Leilões")
    // =========================================================================
    renderEliteAuctionAndOverviewTabHtml() {
      this.ensureLoaded();
      const lot = this.getCurrentAuctionLot();
      const baseMeta = this.getSafehouseMeta();
      const nemesisIp = this.state.nemesisBotIp;
      const nemesisEntry = nemesisIp ? this.state.botHitCounts[nemesisIp] : null;

      return `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <!-- DESTAQUE CENTRAL: TOP #03 LEILÃO DE SERVIDORES CONFISCADOS -->
          <div class="eco-card warn" id="seizedServerAuctionCard">
            <div class="eco-card-head">
              <div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px;">
                  <span class="hc-badge warn">📦 LEILÃO DE SERVIDOR CONFISCADO (NOVO A CADA 2H)</span>
                  <span class="mono" style="font-size:11.5px;color:#fde68a;">Lote: ${esc(lot.lotCode)} · Fecha em ${lot.remMin} min</span>
                </div>
                <div class="eco-card-title">📦 ${esc(lot.origin)}</div>
                <div class="eco-card-sub">
                  Maior lance atual de Bot (<strong>@${esc(lot.botBidder)}</strong>): <strong>${fmtMoney(lot.currentMinBid - 1500)}</strong> · Seu lance mínimo: <strong style="color:#4ade80;">${fmtMoney(lot.currentMinBid)} Limpos</strong>.
                </div>
                ${lot.probed ? `<div style="margin-top:6px;padding:7px 10px;border-radius:6px;background:#09131e;border:1px solid #2b4c6f;font-size:12px;color:#7dd3fc;">🔬 <strong>Resultado da Análise:</strong> ${esc(lot.probeHint)}</div>` : ''}
                ${lot.resolved && lot.lastOutcome ? `
                  <div style="margin-top:8px;padding:10px 12px;border-radius:7px;background:${lot.lastOutcome.treasure ? 'rgba(53,184,119,0.12)' : 'rgba(229,83,75,0.14)'};border:1px solid ${lot.lastOutcome.treasure ? 'var(--hc-accent)' : 'var(--hc-danger)'};font-size:12.5px;">
                    <strong>${esc(lot.lastOutcome.title)}</strong><br>
                    <span style="color:var(--hc-text-2);">${esc(lot.lastOutcome.detail)}</span>
                  </div>
                ` : ''}
              </div>
              <div style="display:flex;flex-direction:column;gap:8px;min-width:220px;">
                <button type="button" id="btnProbeAuctionLot" class="hc-btn ghost sm" ${lot.probed || lot.resolved ? 'disabled' : ''}
                  onclick="window.topTenMechanics.probeAuctionWithAnalyzer()">
                  ${lot.probed ? '✓ Disco Analisado' : '🔬 Analisar Disco ($ 1.000 · Analyzer v4.0+)'}
                </button>
                <button type="button" id="btnPlaceAuctionBid" class="hc-btn primary sm" ${lot.resolved ? 'disabled' : ''}
                  onclick="window.topTenMechanics.placeBidAndResolveAuction(${lot.currentMinBid})">
                  ${lot.resolved ? '✓ Lote Já Comprado' : `🔨 Dar Lance (${fmtMoney(lot.currentMinBid)} Limpos)`}
                </button>
              </div>
            </div>
            ${this.renderInlineRulesDrawerHtml(
              'top03_auction',
              'Como funciona o Leilão de Servidor Confiscado',
              '65% dos servidores trazem prêmios raros: carteiras com ~$ 16.500 em Bitcoin, programas v6.8 prontos ou 2 Catalisadores + Bloco Secreto do Lab.',
              '35% são SERVIDORES ESTRAGADOS: você perde o valor do lance e, se seu Antivírus estiver abaixo de v3.0, um vírus policial infecta seu PC!',
              '• Dica: pague $ 1.000 Limpos para Analisar o Disco antes (precisa ter Analyzer.ana >= v4.0) e descubra se vale a pena dar o lance!'
            )}
          </div>

          <!-- PAINEL DE ATALHOS SIMPLES -->
          <div class="eco-grid-2">
            <div class="eco-card">
              <div class="eco-card-title">📹 Chantagem por Câmera &amp; 🏢 Esconderijo</div>
              <div class="eco-card-sub">
                Vídeos salvos no disco: <strong>${this.state.extortionProofs.length} (${this.getExtortionProofsDiskMb()} MB ocupados)</strong> ·
                Local atual: <strong>${esc(baseMeta.name)}</strong> (-${baseMeta.thermalBonusC}°C · cabe até ${baseMeta.maxVps} VPS).
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
                <button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('203.17.88.40', 'cctv')">Abrir Câmeras →</button>
                <button type="button" class="hc-btn primary sm" onclick="navTo('winQuitinete')">Melhorar Esconderijo →</button>
              </div>
            </div>

            <div class="eco-card">
              <div class="eco-card-title">🧬 Blocos Secretos &amp; 🇨🇭 Cofre na Suíça</div>
              <div class="eco-card-sub">
                Blocos Secretos encontrados: <strong>${this.state.unlockedRelicIds.length}/12</strong> ·
                Cofre na Suíça: <strong>${this.state.swissVaultOpened ? fmtMoney(this.state.swissVaultBalance) : 'Fechado ($ 25 mil)'}</strong>.
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
                <button type="button" class="hc-btn ghost sm" onclick="navTo('winVirusLab')">Abrir Laboratório →</button>
                <button type="button" class="hc-btn primary sm" onclick="navTo('winBank')">Abrir Banco &amp; Cofre →</button>
              </div>
            </div>

            <div class="eco-card">
              <div class="eco-card-title">💿 Modo do Disco &amp; 🤝 Patrocínio do Clã</div>
              <div class="eco-card-sub">
                Modo do Disco: <strong>${this.state.raidMode.toUpperCase()} (${this.getRaidSpeedMultiplier().toFixed(2)}x)</strong> ·
                Patrocínio: <strong>${this.state.clanSponsorship ? this.state.clanSponsorship.corpSymbol + ' (' + (this.state.clanSponsorship.status === 'active' ? 'Ativo' : 'Cancelado') + ')' : 'Nenhum'}</strong>.
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
                <button type="button" class="hc-btn ghost sm" onclick="window.hardwareEngine.setTab('power_raid');navTo('winHardware');">Ver Fonte &amp; Disco →</button>
                <button type="button" class="hc-btn primary sm" onclick="navTo('winClan')">Abrir Clã →</button>
              </div>
            </div>

            <div class="eco-card">
              <div class="eco-card-title">🎯 Serviços no Fórum &amp; ⚔️ Rival Nêmesis</div>
              <div class="eco-card-sub">
                Serviços abertos entre jogadores: <strong>${(this.state.escrowContracts || []).filter((c) => c.status !== 'completed').length}</strong> ·
                Seu Rival Nêmesis: <strong>${nemesisEntry ? `@${esc(nemesisEntry.handle)} (${esc(nemesisIp)})` : 'Nenhum (invada o mesmo Bot 3x)'}</strong>.
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
                <button type="button" class="hc-btn ghost sm" onclick="navTo('winForum')">Mural de Serviços →</button>
                <button type="button" class="hc-btn primary sm" onclick="navTo('winBrowser')">Invadir Servidores →</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  window.topTenMechanics = new TopTenEliteMechanicsEngine();
})();
