/**
 * Hacker City // Motor Oficial das 9 Mecânicas Profundas Aprovadas
 * Todas projetadas com Lados Bons (Vantagens), Lados Negativos (Contrapesos/Riscos),
 * Filas Reais, Portes, Cronômetros da Vida Real e Conexão Cruzada Total:
 *
 * 1. Mercado Clandestino P2P de Licenças do Lab (24h/48h/72h DRM, 12%–20% Taxa, Máx 2/cepa)
 * 2. Temporadas Mensais (30 dias) + Hall da Fama Imutável (100% ZERO Reset + Fadiga/Holofote)
 * 3. Empresas de Lavagem de Dinheiro (Limpo vs Sujo, 3 Portes: $50K->$5K, $150K->$15K, $400K->$50K,
 *    Espera de 15 min reais, Vitrine de 5 Empresas/1h c/ Bots, 15 Vagas $10K [3h], Mín 17% s/ teto,
 *    Cola da Polícia + Prisão se tentar gastar Dinheiro Sujo!)
 * 4. Termodinâmica Física do PC (°C, Pasta Térmica ressecável, Air Cooler, Watercooler +22% Frio)
 * 5. Sequestro Tático de Zumbis / Botnet Hijacking (70% desvio C2 + Risco de Canário Reverso)
 * 6. Perfil Psicológico Dinâmico dos 4 Delegados FBI/Safenet (Vargas, Kovács, Sterling, Sato)
 * 7. Pilha Forense Profunda (Sombra Magnética de 5m/10m vs Shred 7-Passos DoD 5220.22-M)
 * 8. Popover de Defesa Ativa de 15 Segundos (Cortar Cabo, Redirecionar Honeypot, Pulso EMP)
 * 9. Portal Underground hc://vazamentos (185.220.101.77 — Pastebin 1h + Isca Federal PGP!)
 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function runAuth(fn) {
    if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
      return window.integrityGuard.runAuthorized(fn);
    }
    return fn();
  }

  function fmtMoney(n) {
    return '$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // =========================================================================
  // CATÁLOGOS OFICIAIS CALIBRADOS (PORTES, BOTS EMPRESÁRIOS, DELEGADOS & COOLERS)
  // =========================================================================
  const LAUNDERING_TIERS = {
    1: {
      tier: 1,
      code: 'PORTE 1 · PEQUENA',
      title: 'Lavanderia & Lan House de Bairro',
      priceClean: 50000,
      maxBatchUsd: 5000,
      waitMs: 15 * 60 * 1000, // 15 minutos da vida real!
      noonPermitFee: 250,
      selfTaxPct: 5
    },
    2: {
      tier: 2,
      code: 'PORTE 2 · MÉDIA',
      title: 'Boate Neon VIP & Transportadora',
      priceClean: 150000,
      maxBatchUsd: 15000,
      waitMs: 15 * 60 * 1000, // 15 minutos da vida real!
      noonPermitFee: 600,
      selfTaxPct: 4
    },
    3: {
      tier: 3,
      code: 'PORTE 3 · HOLDING',
      title: 'Holding Exportadora Offshore',
      priceClean: 400000,
      maxBatchUsd: 50000,
      waitMs: 15 * 60 * 1000, // 15 minutos da vida real!
      noonPermitFee: 1400,
      selfTaxPct: 3
    }
  };

  // Pool de 15 Empresas de Operadores da Rede para manter 5 opções ativas a cada 1 hora real!
  const SEEDED_BOT_COMPANIES = [
    { id: 'bot_co_01', name: 'Lavanderia Brilho Rápido', ownerTag: 'sombra_sp', isBot: true, tier: 1, feePct: 18 },
    { id: 'bot_co_02', name: 'Auto Posto & Conveniência Sul', ownerTag: 'vitinladrão', isBot: true, tier: 1, feePct: 20 },
    { id: 'bot_co_03', name: 'Boate Eclipse Lounge VIP', ownerTag: 'm4riposa', isBot: true, tier: 2, feePct: 22 },
    { id: 'bot_co_04', name: 'Exportadora Atlântico Cargo', ownerTag: 'barao_offshore', isBot: true, tier: 3, feePct: 28 },
    { id: 'bot_co_05', name: 'Holding Tubarão Cinza S.A.', ownerTag: 'tubarao_b3', isBot: true, tier: 3, feePct: 45 },

    { id: 'bot_co_06', name: 'Estacionamento 24h Centro', ownerTag: 'josenacimento', isBot: true, tier: 1, feePct: 17 },
    { id: 'bot_co_07', name: 'Lan House Cyber Arena', ownerTag: 'hackerbr', isBot: true, tier: 1, feePct: 21 },
    { id: 'bot_co_08', name: 'Frota Rápida Expresso', ownerTag: 'nyx_0day', isBot: true, tier: 2, feePct: 24 },
    { id: 'bot_co_09', name: 'Cassino Marítimo Internacional', ownerTag: 'doleiro_digital', isBot: true, tier: 3, feePct: 31 },
    { id: 'bot_co_10', name: 'Fundo Cartel Escorpião', ownerTag: 'rei_do_laranja', isBot: true, tier: 2, feePct: 58 },

    { id: 'bot_co_11', name: 'Lava-Jato Turbinado HC', ownerTag: 'malandro_root', isBot: true, tier: 1, feePct: 19 },
    { id: 'bot_co_12', name: 'Padaria & Distribuidora Real', ownerTag: 'fantasma_rj', isBot: true, tier: 1, feePct: 22 },
    { id: 'bot_co_13', name: 'Eventos & Shows Metrópole', ownerTag: 'coringa_011', isBot: true, tier: 2, feePct: 25 },
    { id: 'bot_co_14', name: 'Logística Transcontinental', ownerTag: 'oraculo_br', isBot: true, tier: 3, feePct: 27 },
    { id: 'bot_co_15', name: 'Offshore Barão Implacável', ownerTag: 'imperador_satoshi', isBot: true, tier: 3, feePct: 65 }
  ];

  const FBI_DELEGATES = [
    {
      id: 'vargas',
      name: 'Comissário Augusto Vargas',
      archetype: 'VENAL / CORRUPTÍVEL',
      badgeCls: 'warn',
      proText: 'LADO BOM: Aceita Suborno Discreto (-40% mais barato: $ 270 Limpos) reduzindo -2 Níveis de Heat na hora!',
      conText: 'LADO NEGATIVO: Se cair em Prisão por gastar dinheiro sujo, a equipe dele cobra Fiança +40% mais cara ($ 910)!',
      allowBribe: true,
      bribeCostClean: 270,
      bountyMult: 1.0,
      instantJailOnFirstDirty: false,
      shadowDurationMs: 5 * 60 * 1000,
      bailCostClean: 910
    },
    {
      id: 'kovacs',
      name: 'Diretora Helena Kovács',
      archetype: 'LINHA-DURA INCORRUPTÍVEL',
      badgeCls: 'danger',
      proText: 'LADO BOM: Paga +35% de bônus em todas as Recompensas (Bounties) do FBI e valoriza missões Blue-Team!',
      conText: 'LADO NEGATIVO: ARMADILHA DE SUBORNO! Tentar suborná-la confisca o dinheiro e joga seu Heat direto para 5/5!',
      allowBribe: false,
      bribeCostClean: 450,
      bountyMult: 1.35,
      instantJailOnFirstDirty: false,
      shadowDurationMs: 5 * 60 * 1000,
      bailCostClean: 650
    },
    {
      id: 'sterling',
      name: 'Agente Especial Marcus Sterling',
      archetype: 'CAÇADOR DO COLARINHO BRANCO',
      badgeCls: 'info',
      proText: 'LADO BOM: Faz vista grossa para duelos PvP/DDoS entre hackers e paga +20% em auditorias corporativas.',
      conText: 'LADO NEGATIVO: TOLERÂNCIA ZERO COM DINHEIRO SUJO! Basta 1 única tentativa de gastar dinheiro sujo para PRISÃO IMEDIATA!',
      allowBribe: true,
      bribeCostClean: 550,
      bountyMult: 1.15,
      instantJailOnFirstDirty: true,
      shadowDurationMs: 5 * 60 * 1000,
      bailCostClean: 800
    },
    {
      id: 'sato',
      name: 'Inspetor Kenji Sato',
      archetype: 'PERITO FORENSE & ANTI-BOTNET',
      badgeCls: 'success',
      proText: 'LADO BOM: Reduz em -30% o custo do Protocolo Fênix e dobra pontos Safenet para peritos forenses.',
      conText: 'LADO NEGATIVO: Sombras Magnéticas de logs apagados sem Shred 7-Passos duram 10 MINUTOS (o dobro do normal)!',
      allowBribe: false,
      bribeCostClean: 500,
      bountyMult: 1.25,
      instantJailOnFirstDirty: false,
      shadowDurationMs: 10 * 60 * 1000,
      bailCostClean: 700
    }
  ];

  const COOLING_CATALOG = {
    stock: { id: 'stock', name: 'Cooler Box Padrão', priceClean: 0, coolingC: 0, extraWatts: 0, allowsColdOc: false },
    paste_silver: { id: 'paste_silver', name: 'Pasta Térmica Prata Pura (7h)', priceClean: 250, coolingC: 9, extraWatts: 0, isPaste: true },
    air_dual: { id: 'air_dual', name: 'Air Cooler Tower Duplo', priceClean: 850, coolingC: 16, extraWatts: 12, allowsColdOc: false },
    water_360: { id: 'water_360', name: 'Watercooler Custom 360mm Silencioso', priceClean: 2400, coolingC: 28, extraWatts: 0, allowsColdOc: true }
  };

  const AD_SLOT_FEE_CLEAN = 10000;
  const MAX_AD_QUEUE_SLOTS = 15; // 3 horas reais * 5 empresas/hora = 15 vagas!
  const MIN_LAUNDERING_FEE_PCT = 17;

  class NineDeepSystemsEngine {
    constructor() {
      this.userId = null;
      this.state = null;
      this.activeLaunderingTab = 'vitrine';
      this.activeDefenseAlert = null;
      this._defenseTimer = null;
      this._mainTimer = null;
      this.magneticShadows = new Map(); // hostIp -> [{ subnetPrefix, wipedAt, expiresAt, method }]
      this.mountGlobalOverlays();
      this.startEngineLoop();
    }

    storageKey(uidOverride = null) {
      const uid = uidOverride || (window.currentProfile && window.currentProfile.id) || 'guest';
      return `HC_NINE_DEEP_V1_${uid}`;
    }

    currentHourBucket() {
      return Math.floor(Date.now() / (60 * 60 * 1000));
    }

    currentSeasonKey() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    normalizeState(raw) {
      const s = raw && typeof raw === 'object' ? { ...raw } : {};
      if (typeof s.dirtyBalance !== 'number' || Number.isNaN(s.dirtyBalance)) s.dirtyBalance = 0;
      s.dirtyBalance = Math.max(0, +s.dirtyBalance.toFixed(2));
      if (typeof s.dirtyTailStrikes !== 'number') s.dirtyTailStrikes = 0;
      if (!s.jailState || typeof s.jailState !== 'object') {
        s.jailState = { jailed: false, releaseAt: 0, reason: '', confiscatedUsd: 0 };
      }

      // Empresa Própria & Fila de Anúncios + Jobs de 15 min
      if (!s.myCompany || typeof s.myCompany !== 'object') {
        s.myCompany = null; // { name, tier: 1|2|3, feePct: 20, totalLaundered: 0, ownerProfits: 0 }
      } else {
        s.myCompany.feePct = Math.max(MIN_LAUNDERING_FEE_PCT, Number(s.myCompany.feePct || 20));
      }
      if (!Array.isArray(s.adQueue)) s.adQueue = [];
      if (!Array.isArray(s.washingJobs)) s.washingJobs = [];
      if (typeof s.tutorialExpressWashUsed !== 'boolean') s.tutorialExpressWashUsed = false;

      // Mercado P2P de Licenças do Lab
      if (!Array.isArray(s.myListedLicenses)) s.myListedLicenses = [];
      if (!Array.isArray(s.rentedDrmLicenses)) s.rentedDrmLicenses = [];
      if (!s.licensesIssuedByStrain || typeof s.licensesIssuedByStrain !== 'object') s.licensesIssuedByStrain = {};

      // Temporada Mensal & Hall da Fama (Zero Reset!)
      const curSk = this.currentSeasonKey();
      if (!s.season || s.season.seasonKey !== curSk) {
        s.season = {
          seasonKey: curSk,
          points: 0,
          targetHitsToday: {},
          lastDayKey: new Date().toISOString().slice(0, 10)
        };
      }
      if (!Array.isArray(s.hallOfFame)) {
        s.hallOfFame = [
          { seasonKey: '2026-10', first: 'm4riposa', firstPts: 14200, second: 'Kuro_Phantom', third: 'nyx_0day', topClan: 'KRNS' }
        ];
      }

      // Termodinâmica Física (°C, Pasta Térmica & Cooler)
      if (!s.thermals || typeof s.thermals !== 'object') {
        s.thermals = {
          coolerId: 'stock',
          pasteAppliedAt: 0,
          coldOverclockOn: false,
          empHeatUntil: 0
        };
      }

      // Botnet Hijacking C2
      if (!Array.isArray(s.hijackedNodes)) s.hijackedNodes = [];
      if (typeof s.collectorStunnedUntil !== 'number') s.collectorStunnedUntil = 0;

      // Defesa Ativa 15s & ZeroBin Vazamentos
      if (typeof s.honeypotCooldownUntil !== 'number') s.honeypotCooldownUntil = 0;
      if (typeof s.empCooldownUntil !== 'number') s.empCooldownUntil = 0;
      if (typeof s.netCutPausedUntil !== 'number') s.netCutPausedUntil = 0;
      if (!s.verifiedLeakIds || typeof s.verifiedLeakIds !== 'object') s.verifiedLeakIds = {};
      if (!s.claimedLeakIds || typeof s.claimedLeakIds !== 'object') s.claimedLeakIds = {};
      if (!Array.isArray(s.customPastes)) s.customPastes = [];
      if (typeof s.delegateOverrideIdx !== 'number') s.delegateOverrideIdx = -1;
      if (!s.dailyBtcSold || typeof s.dailyBtcSold !== 'object') {
        s.dailyBtcSold = { dayKey: '', usd: 0 };
      }

      return s;
    }

    ensureLoaded() {
      const uid = (window.currentProfile && window.currentProfile.id) || 'guest';
      if (this.userId === uid && this.state) return this.state;
      this.userId = uid;
      let parsed = null;
      try {
        const raw = localStorage.getItem(this.storageKey(uid));
        if (raw) parsed = JSON.parse(raw);
      } catch (e) {}
      this.state = this.normalizeState(parsed);
      this.save(true);
      return this.state;
    }

    save(silentCloud = false) {
      if (!this.state) return;
      try {
        localStorage.setItem(this.storageKey(this.userId), JSON.stringify(this.state));
      } catch (e) {}
      if (!silentCloud && window.onlineEngine && typeof window.onlineEngine.scheduleSave === 'function') {
        window.onlineEngine.scheduleSave(false);
      }
      this.syncHudBadges();
    }

    getSnapshotState() {
      this.ensureLoaded();
      return JSON.parse(JSON.stringify(this.state));
    }

    applySnapshotState(snap) {
      if (!snap || typeof snap !== 'object') return;
      this.userId = (window.currentProfile && window.currentProfile.id) || 'guest';
      this.state = this.normalizeState(snap);
      this.save(true);
    }

    getCleanBalance() {
      return window.currentWallet ? Math.max(0, +(Number(window.currentWallet.balance || 0)).toFixed(2)) : 0;
    }

    getDirtyBalance() {
      this.ensureLoaded();
      return Math.max(0, +(Number(this.state.dirtyBalance || 0)).toFixed(2));
    }

    // Benefícios reais de CNPJ no mundo inteiro conforme o Porte da Empresa de Lavagem do jogador!
    getCompanyCnpjPerks() {
      this.ensureLoaded();
      const tier = this.state.myCompany ? Number(this.state.myCompany.tier || 0) : 0;
      return {
        tier,
        companyName: this.state.myCompany ? this.state.myCompany.name : null,
        hwDiscountMult: tier >= 1 ? 0.90 : 1.0,                 // Porte 1+: -10% atacado CNPJ em Peças e Fontes PSU
        netBillDiscountMult: tier >= 2 ? 0.80 : 1.0,            // Porte 2+: -20% na conta de Internet & VPS às 12:00
        bonusFreeBounceHops: tier >= 2 ? 1 : 0,                 // Porte 2+: +1 salto corporativo gratuito na rota
        exemptBankCustody2Pct: tier >= 3,                       // Porte 3: isento da taxa de 2% > $100K às 12:00
        swissDepositFeeRate: tier >= 3 ? 0.015 : 0.04,          // Porte 3: taxa do Cofre Suíço cai de 4% p/ 1.5%
        dailyCleanBtcCapUsd: tier >= 3 ? 15000 : (tier === 2 ? 8000 : (tier === 1 ? 5000 : 2000))
      };
    }

    // Liquidação de BTC na Corretora (144.202.44.8): até o limite diário COAF entra Limpo; o excedente entra Sujo!
    processBtcLiquidationSplit(grossUsdRaw) {
      this.ensureLoaded();
      const gross = Math.max(0, +(Number(grossUsdRaw || 0)).toFixed(2));
      if (gross <= 0) return { cleanAdded: 0, dirtyAdded: 0, capUsd: 2000 };

      const perks = this.getCompanyCnpjPerks();
      const todayKey = new Date().toISOString().slice(0, 10);
      if (this.state.dailyBtcSold.dayKey !== todayKey) {
        this.state.dailyBtcSold = { dayKey: todayKey, usd: 0 };
      }

      const alreadyUsed = Number(this.state.dailyBtcSold.usd || 0);
      const cleanRoomLeft = Math.max(0, +(perks.dailyCleanBtcCapUsd - alreadyUsed).toFixed(2));
      const cleanPart = Math.min(gross, cleanRoomLeft);
      const dirtyPart = Math.max(0, +(gross - cleanPart).toFixed(2));

      this.state.dailyBtcSold.usd = +(alreadyUsed + gross).toFixed(2);
      if (cleanPart > 0) {
        runAuth(() => {
          if (window.currentWallet) {
            window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + cleanPart).toFixed(2);
          }
        });
      }
      if (dirtyPart > 0) {
        this.addDirtyMoney(dirtyPart, 'Excedente Câmbio BTC s/ Lastro COAF');
      } else {
        this.save();
      }
      return { cleanAdded: cleanPart, dirtyAdded: dirtyPart, capUsd: perks.dailyCleanBtcCapUsd };
    }

    // Válvula Clandestina de Contrabando (+35% de ágio em Dinheiro Sujo no Blackmarket — apenas consumíveis ilegais!)
    buyBlackmarketSmuggledConsumable(kind) {
      this.ensureLoaded();
      const catalog = {
        smuggle_paste: { id: 'smuggle_paste', name: 'Pasta Térmica Prata Contrabandeada (-8°C)', baseClean: 450, dirtyCost: 610 },
        smuggle_osint: { id: 'smuggle_osint', name: 'Lote 2x Dossiês OSINT Vazados', baseClean: 800, dirtyCost: 1080 },
        smuggle_cve:   { id: 'smuggle_cve',   name: 'Exploit Descartável Zero-Day 24h', baseClean: 1500, dirtyCost: 2025 }
      };
      const item = catalog[kind];
      if (!item) return { success: false, message: 'Item de contrabando inválido.' };

      const dirtyAvail = this.getDirtyBalance();
      if (dirtyAvail < item.dirtyCost) {
        const msg = `Dinheiro Sujo insuficiente! "${item.name}" custa ${fmtMoney(item.dirtyCost)} em Dinheiro Sujo (+35% mais caro).`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'INSUFFICIENT_DIRTY_SMUGGLE', message: msg };
      }

      this.state.dirtyBalance = Math.max(0, +(dirtyAvail - item.dirtyCost).toFixed(2));
      if (kind === 'smuggle_paste') {
        this.state.thermals.pasteAppliedAt = Date.now();
      } else if (kind === 'smuggle_osint' && window.ecosystemHub) {
        window.ecosystemHub.ensureLoaded();
        window.ecosystemHub.state.osintDossiers = Number(window.ecosystemHub.state.osintDossiers || 0) + 2;
        window.ecosystemHub.save();
      } else if (kind === 'smuggle_cve' && window.ecosystemHub) {
        window.ecosystemHub.ensureLoaded();
        window.ecosystemHub.state.zeroDays.push({ id: 'cve_smug_' + Date.now(), label: 'CVE-Contrabando Ring-3', expiresAt: Date.now() + 24 * 3600 * 1000 });
        window.ecosystemHub.save();
      }

      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.internetEngine && window.winManager?.current === 'winBrowser') window.internetEngine.render();
      const msg = `🕶️ COMPRA FEITA (-${fmtMoney(item.dirtyCost)} em Dinheiro Sujo): ${item.name} ativado na hora!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, item, message: msg };
    }

    closeDirtyMoneyBridgeModal() {
      const m = typeof document !== 'undefined' ? document.getElementById('hcDirtyBridgeModal') : null;
      if (m) m.remove();
    }

    // Modal simples e direto sempre que faltar Dinheiro Limpo mas o jogador tiver Dinheiro Sujo guardado!
    openDirtyMoneyBridgeModal(itemLabel, requiredCleanRaw) {
      this.ensureLoaded();
      if (typeof document === 'undefined') return;
      this.closeDirtyMoneyBridgeModal();

      const clean = this.getCleanBalance();
      const dirty = this.getDirtyBalance();
      const req = Math.max(0, Math.round(Number(requiredCleanRaw || 0)));
      const missing = Math.max(1, Math.round(req - clean));

      const wrap = document.createElement('div');
      wrap.id = 'hcDirtyBridgeModal';
      wrap.style.cssText = 'position:fixed;inset:0;z-index:9996;background:rgba(4,8,14,0.86);display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px;';
      wrap.innerHTML = `
        <div class="hc-card" style="max-width:560px;width:100%;margin:auto;padding:18px 18px;border-color:rgba(248,113,113,0.55);background:#0b1119;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;">
            <span class="hc-badge danger">🛑 PRECISA DE DINHEIRO LIMPO</span>
            <button type="button" class="hc-btn ghost sm" onclick="window.nineSystemsEngine.closeDirtyMoneyBridgeModal()">✕</button>
          </div>
          <h3 style="margin:0 0 6px;font-size:17px;color:var(--hc-text);">Faltam ${fmtMoney(missing)} em Dinheiro Limpo</h3>
          <p style="font-size:13px;color:var(--hc-text-2);margin:0 0 14px;line-height:1.5;">
            Para pagar <strong>${esc(itemLabel)}</strong> (${fmtMoney(req)}) você precisa de Dinheiro Limpo. Você tem <strong style="color:#4ade80;">${fmtMoney(clean)} Limpos</strong> na conta e <strong style="color:#f87171;">🩸 ${fmtMoney(dirty)} de Dinheiro Sujo</strong> guardado. Escolha o que fazer:
          </p>

          <div style="display:flex;flex-direction:column;gap:9px;">
            <button type="button" id="btnBridgeGoLaunder" class="hc-choice-row recommended"
              onclick="window.nineSystemsEngine.closeDirtyMoneyBridgeModal(); navTo('winLaundering');">
              <span class="hc-choice-main">
                <span class="hc-choice-title">🧼 1. Lavar meu Dinheiro Sujo</span>
                <span class="hc-choice-desc">Demora 15 min da vida real e desconta a taxa da empresa (mín. 17%).</span>
              </span>
              <span class="hc-choice-cta">Ir Lavar →</span>
            </button>

            <button type="button" id="btnBridgeGoCleanLab" class="hc-choice-row info-opt"
              onclick="window.nineSystemsEngine.closeDirtyMoneyBridgeModal(); navTo('winVirusLab');">
              <span class="hc-choice-main">
                <span class="hc-choice-title" style="color:#7dd3fc;">🧬 2. Ganhar $ 18.000 Limpos no Laboratório</span>
                <span class="hc-choice-desc">Entregue o vírus pedido pela facção e receba Dinheiro Limpo na hora.</span>
              </span>
              <span class="hc-choice-cta" style="color:#7dd3fc;">Abrir Lab →</span>
            </button>

            <button type="button" id="btnBridgeGoSmuggle" class="hc-choice-row warn-opt"
              onclick="window.nineSystemsEngine.closeDirtyMoneyBridgeModal(); window.internetEngine.openIp('185.220.101.9');">
              <span class="hc-choice-main">
                <span class="hc-choice-title" style="color:#fde68a;">🕶️ 3. Gastar Sujo no Mercado Clandestino</span>
                <span class="hc-choice-desc">Compra itens rápidos direto com Dinheiro Sujo (paga +35% mais caro).</span>
              </span>
              <span class="hc-choice-cta" style="color:#fde68a;">Ir à Loja →</span>
            </button>

            <button type="button" id="btnBridgeForceDirtyRisk" class="hc-choice-row danger-opt"
              onclick="window.nineSystemsEngine.closeDirtyMoneyBridgeModal(); window.nineSystemsEngine.attemptSpendDirtyMoney(${Math.min(dirty, missing)}, '${esc(itemLabel)}');">
              <span class="hc-choice-main">
                <span class="hc-choice-title" style="color:#fca5a5;">🚨 Tentar pagar com Dinheiro Sujo mesmo assim</span>
                <span class="hc-choice-desc">Perigo: a loja avisa a polícia (1ª vez = procurado · 2ª vez = preso!).</span>
              </span>
              <span class="hc-choice-cta" style="color:#fca5a5;">Arriscar</span>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(wrap);
    }

    penalizeDirtySpendAttempt(itemLabel = 'Operação Oficial') {
      return this.attemptSpendDirtyMoney(500, itemLabel);
    }

    // =========================================================================
    // MECÂNICA #06: PERFIL PSICOLÓGICO DINÂMICO DOS DELEGADOS FBI / SAFENET
    // =========================================================================
    getActiveDelegate() {
      this.ensureLoaded();
      if (this.state.delegateOverrideIdx >= 0 && this.state.delegateOverrideIdx < FBI_DELEGATES.length) {
        return FBI_DELEGATES[this.state.delegateOverrideIdx];
      }
      const sixHourBucket = Math.floor(Date.now() / (6 * 60 * 60 * 1000));
      return FBI_DELEGATES[sixHourBucket % FBI_DELEGATES.length];
    }

    attemptPoliceBribe() {
      this.ensureLoaded();
      const del = this.getActiveDelegate();
      const clean = this.getCleanBalance();
      if (clean < del.bribeCostClean) {
        const msg = `Saldo Limpo insuficiente! O contato exige ${fmtMoney(del.bribeCostClean)} Limpos.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'NO_CLEAN_FUNDS', message: msg };
      }

      runAuth(() => {
        window.currentWallet.balance = Math.max(0, +(clean - del.bribeCostClean).toFixed(2));
      });

      // LADO NEGATIVO REAL: Tentar subornar delegado Incorruptível (Kovács / Sato) dispara Corrupção Ativa!
      if (!del.allowBribe) {
        runAuth(() => {
          if (window.currentProfile) window.currentProfile.heat_level = 5;
        });
        this.save();
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
        const trapMsg = `🚨 CORRUPÇÃO ATIVA! ${del.name} (${del.archetype}) confiscou seus ${fmtMoney(del.bribeCostClean)} e elevou seu Alerta Policial para 5/5! Use Plantão Blue-Team ou False-Flag!`;
        if (typeof window.showToast === 'function') window.showToast(trapMsg);
        if (window.safenetFbiEngine) window.safenetFbiEngine.renderUI('fbiAppBody');
        return { success: false, trapped: true, heatAfter: 5, message: trapMsg };
      }

      runAuth(() => {
        if (window.currentProfile) {
          window.currentProfile.heat_level = Math.max(1, Number(window.currentProfile.heat_level || 1) - 2);
        }
      });
      this.state.dirtyTailStrikes = 0;
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const okMsg = `🕶️ Acordo aceito por ${del.name}! Alerta Policial reduzido em -2 níveis (-${fmtMoney(del.bribeCostClean)} Limpos).`;
      if (typeof window.showToast === 'function') window.showToast(okMsg);
      if (window.safenetFbiEngine) window.safenetFbiEngine.renderUI('fbiAppBody');
      return { success: true, heatAfter: window.currentProfile ? window.currentProfile.heat_level : 1, message: okMsg };
    }

    renderDelegateBannerHtml() {
      const del = this.getActiveDelegate();
      return `
        <div class="nds-card ${del.allowBribe ? 'amber' : 'crimson'}" style="margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
            <div>
              <span class="hc-badge ${del.badgeCls}">DELEGADO DE PLANTÃO (TROCA A CADA 6H)</span>
              <strong style="font-size:15px;margin-left:8px;color:#fff;">${esc(del.name)}</strong>
              <span class="hc-badge info" style="margin-left:6px;">${esc(del.archetype)}</span>
            </div>
            <button type="button" id="btnAttemptDelegateBribe" class="hc-btn ${del.allowBribe ? 'primary' : 'ghost'} sm"
              style="${!del.allowBribe ? 'border-color:var(--hc-danger);color:var(--hc-danger-text);' : ''}"
              onclick="window.nineSystemsEngine.attemptPoliceBribe()">
              ${del.allowBribe ? `🕶️ Pagar Propina (${fmtMoney(del.bribeCostClean)} Limpos)` : `⚠️ Tentar Suborno (${fmtMoney(del.bribeCostClean)} · PERIGOSO!)`}
            </button>
          </div>
          <div class="nds-pros-cons">
            <div class="nds-pc-box pro"><strong>✅ ${esc(del.proText)}</strong></div>
            <div class="nds-pc-box con"><strong>⚠️ ${esc(del.conText)}</strong></div>
          </div>
          <details class="nds-rules-drawer">
            <summary>📖 Como funcionam os 4 Delegados da Polícia (Troca a cada 6h reais)</summary>
            <ol class="nds-rules-list">
              <li><strong>Troca de Plantão:</strong> A cada <strong>6 horas da vida real</strong> (00h, 06h, 12h, 18h) muda o delegado no comando para todo o jogo.</li>
              <li><strong>Comissário Vargas (Aceita Propina):</strong> Aceita <strong>$ 270 Limpos</strong> para baixar -2 níveis de procura e tirar a polícia da sua cola, mas cobra Fiança mais cara (<strong>$ 910 Limpos</strong>) se você for preso.</li>
              <li><strong>Diretora Kovács (Honesta):</strong> Paga <strong>+35% em Dinheiro Limpo</strong> quando você captura Procurados, mas se tentar suborná-la você perde <strong>$ 450 Limpos</strong> e vira Procurado Nível 5 na hora!</li>
              <li><strong>Agente Sterling (Rigoroso):</strong> Paga +15% nas capturas e aceita propina cara ($ 550), mas <strong>prende já na 1ª tentativa</strong> de gastar Dinheiro Sujo sem aviso!</li>
              <li><strong>Inspetor Sato (Detetive):</strong> Paga +25% nas capturas, rejeita suborno (perde $ 500 + Nível 5) e faz os rastros apagados comuns ficarem visíveis no disco por <strong>10 minutos reais</strong> (o dobro do normal).</li>
            </ol>
          </details>
        </div>
      `;
    }

    // =========================================================================
    // MECÂNICA #02: TEMPORADAS MENSAIS + HALL DA FAMA (ZERO RESET + CONTRAPESOS)
    // =========================================================================
    awardSeasonPoints(rawPts, targetIpOrKey = null) {
      this.ensureLoaded();
      const today = new Date().toISOString().slice(0, 10);
      if (this.state.season.lastDayKey !== today) {
        this.state.season.lastDayKey = today;
        this.state.season.targetHitsToday = {};
      }
      // LADO NEGATIVO / ANTI-FARM: Repetir o mesmo alvo > 3x no dia dá 0 pts de Temporada!
      if (targetIpOrKey) {
        const hits = Number(this.state.season.targetHitsToday[targetIpOrKey] || 0);
        this.state.season.targetHitsToday[targetIpOrKey] = hits + 1;
        if (hits >= 3) {
          this.save(true);
          return { added: 0, fatigued: true };
        }
      }
      const add = Math.max(0, Math.round(Number(rawPts || 0)));
      this.state.season.points = Number(this.state.season.points || 0) + add;
      this.save(true);
      return { added: add, total: this.state.season.points, fatigued: false };
    }

    isPlayerInSeasonTop3() {
      this.ensureLoaded();
      return Number(this.state.season.points || 0) >= 950;
    }

    renderSeasonAndHallOfFameHtml() {
      this.ensureLoaded();
      const myTag = (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador';
      const myPts = Number(this.state.season.points || 0);
      const contenders = [
        { tag: myTag, pts: myPts, isMe: true, clan: (window.clanEngine && window.clanEngine.getMyClan && window.clanEngine.getMyClan()?.tag) || 'SOLO' },
        { tag: 'm4riposa', pts: 1420, isMe: false, clan: 'KRNS' },
        { tag: 'Kuro_Phantom', pts: 1180, isMe: false, clan: '0DAY' },
        { tag: 'nyx_0day', pts: 940, isMe: false, clan: 'ZTRC' },
        { tag: 'ZeroDay_Valkyrie', pts: 790, isMe: false, clan: 'VRTX' }
      ].sort((a, b) => b.pts - a.pts);

      const hofRows = (this.state.hallOfFame || []).map((h) => `
        <div class="nds-row">
          <div>
            <span class="hc-badge warn">TEMPORADA ${esc(h.seasonKey)}</span>
            <strong style="margin-left:8px;color:#fcd34d;">👑 1º ${esc(h.first)} (${h.firstPts.toLocaleString('pt-BR')} pts)</strong>
            <span style="font-size:12px;color:var(--hc-text-2);margin-left:8px;">🥈 ${esc(h.second)} · 🥉 ${esc(h.third)}</span>
          </div>
          <span class="hc-badge success">Clã Campeão: [${esc(h.topClan)}]</span>
        </div>
      `).join('');

      return `
        <div class="nds-card emerald" style="margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
            <div>
              <span class="hc-badge success">🔥 TEMPORADA MENSAL ATIVA (${esc(this.state.season.seasonKey)}) · ZERO RESET DE CONTA!</span>
              <div style="font-size:12px;color:var(--hc-text-2);margin-top:3px;">
                Sua conta nunca reseta! O placar mensal soma apenas os pontos feitos neste mês e grava o Top 3 eternamente no Hall da Fama.
              </div>
            </div>
            <span class="mono hc-badge info">Seus Pontos no Mês: ${myPts.toLocaleString('pt-BR')} pts</span>
          </div>

          <div class="nds-pros-cons">
            <div class="nds-pc-box pro">
              <strong>✅ Lados Bons:</strong> Novatos disputam o Top 1 do mês de igual p/ igual com veteranos; Top 3 ganha Coroa no Fórum + Catalisadores do Lab!
            </div>
            <div class="nds-pc-box con">
              <strong>⚠️ Contrapesos &amp; Riscos:</strong> Atacar o mesmo IP &gt;3x no dia rende <strong>0 pts (Fadiga)</strong>; entrar no Top 3 aumenta sua recompensa no FBI em <strong>+50% (Holofote)</strong>; ser preso desconta <strong>-15% pts do mês</strong>!
            </div>
          </div>

          <div class="nds-grid-3">
            ${contenders.slice(0, 3).map((c, idx) => `
              <div style="padding:11px;border-radius:9px;background:#0c121a;border:1px solid ${c.isMe ? '#35b877' : '#263447'};text-align:center;">
                <div style="font-size:18px;">${idx === 0 ? '👑 1º' : (idx === 1 ? '🥈 2º' : '🥉 3º')}</div>
                <strong style="color:${c.isMe ? '#6ee7b7' : '#fff'};">${esc(c.tag)} [${esc(c.clan)}]</strong>
                <div class="mono" style="font-size:12px;color:#7dd3fc;margin-top:3px;">${c.pts.toLocaleString('pt-BR')} pts/mês</div>
              </div>
            `).join('')}
          </div>

          <div style="border-top:1px solid var(--hc-border);padding-top:10px;">
            <div style="font-size:12px;font-weight:700;margin-bottom:6px;color:#fcd34d;">🏛️ Hall da Fama Imutável (Campeões Eternizados):</div>
            ${hofRows}
          </div>
          <details class="nds-rules-drawer">
            <summary>📖 Regras de Funcionamento da Temporada Mensal &amp; Hall da Fama</summary>
            <ol class="nds-rules-list">
              <li><strong>Ciclo &amp; Zero Reset:</strong> Dura do dia 01 às 00:00 até o último dia do mês às 23:59. <strong>Nada da sua conta reseta</strong> (dinheiro, peças, VPS, certificados, cepas e reputação vitalícia ficam 100% intactos); apenas o placar paralelo do mês zera para todos competirem de igual p/ igual.</li>
              <li><strong>Como Pontuar:</strong> +4 pts a cada $ 100 em saques/operações (mín. +5 pts); +8 pts a cada $ 100 em Bounties do FBI; +85/+170/+255 pts ao abrir/evoluir Empresa; +45 pts ao capturar invasor no Honeypot; +25 pts ao desmascarar Isca PGP.</li>
              <li><strong>Trava Anti-Farm (Fadiga Diária):</strong> Você só ganha pontos nas <strong>primeiras 3 ações por dia real contra o mesmo IP</strong>. A partir da 4ª vez no mesmo alvo no dia, rende <strong>0 pts</strong>.</li>
              <li><strong>Holofote &amp; Punição de Prisão:</strong> Estar no Top 3 (ou &ge; 950 pts) aumenta em <strong>+50%</strong> sua recompensa caso caia no FBI; ser preso gastando Dinheiro Sujo confisca <strong>-15% dos seus pontos do mês</strong>.</li>
            </ol>
          </details>
        </div>
      `;
    }

    // =========================================================================
    // MECÂNICA #03: EMPRESAS DE LAVAGEM DE DINHEIRO (3 PORTES, 5/1H, 15 VAGAS $10K, 15 MIN, PRISÃO)
    // =========================================================================
    addDirtyMoney(amountRaw, sourceLabel = 'Operação Clandestina') {
      this.ensureLoaded();
      const amt = Math.max(0, +(Number(amountRaw || 0)).toFixed(2));
      if (amt <= 0) return 0;
      this.state.dirtyBalance = +(this.state.dirtyBalance + amt).toFixed(2);
      this.awardSeasonPoints(Math.max(5, Math.round(amt * 0.04)), sourceLabel);
      this.save();
      if (window.progressiveUnlockEngine && typeof window.progressiveUnlockEngine.notifyResourceEarned === 'function') {
        window.progressiveUnlockEngine.notifyResourceEarned('dirty_money');
      }
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      return this.state.dirtyBalance;
    }

    // O que acontece se tentar gastar Dinheiro Sujo direto sem lavar!
    attemptSpendDirtyMoney(amountRaw, itemLabel = 'Compra Direta') {
      this.ensureLoaded();
      const amt = Math.max(50, +(Number(amountRaw || 500)).toFixed(2));
      if (this.state.dirtyBalance < amt) {
        const msg = `Você não possui ${fmtMoney(amt)} em Dinheiro Sujo no momento.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'NO_DIRTY_BALANCE', message: msg };
      }

      const del = this.getActiveDelegate();
      this.state.dirtyTailStrikes = Number(this.state.dirtyTailStrikes || 0) + 1;

      // 1ª Tentativa (exceto sob Agente Sterling, que prende na 1ª!) -> Polícia cola na sua cola!
      if (this.state.dirtyTailStrikes === 1 && !del.instantJailOnFirstDirty) {
        runAuth(() => {
          if (window.currentProfile) {
            window.currentProfile.heat_level = Math.max(4, Number(window.currentProfile.heat_level || 1));
          }
        });
        this.save();
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
        const warnMsg = `🚨 POLÍCIA NA SUA COLA! A loja denunciou suas notas sujas (${itemLabel}) à Safenet! Heat subiu para 4/5 — se insistir em gastar dinheiro sujo sem lavar, você será PRESO!`;
        if (typeof window.showToast === 'function') window.showToast(warnMsg);
        this.renderLaunderingHub();
        return { success: false, code: 'POLICE_ON_TAIL', strikes: 1, jailed: false, message: warnMsg };
      }

      // 2ª Tentativa (ou 1ª com Agente Sterling!) -> PRISÃO FEDERAL EXECUTADA!
      const confiscated = Math.min(this.state.dirtyBalance, amt);
      this.state.dirtyBalance = Math.max(0, +(this.state.dirtyBalance - confiscated).toFixed(2));
      this.state.season.points = Math.floor(Number(this.state.season.points || 0) * 0.85); // -15% pts Temporada!
      this.state.jailState = {
        jailed: true,
        releaseAt: Date.now() + 60 * 1000,
        reason: `Tentativa reincidente de gastar Dinheiro Sujo (${itemLabel}) sob vigilância de ${del.name}`,
        confiscatedUsd: confiscated
      };
      runAuth(() => {
        if (window.currentProfile) window.currentProfile.heat_level = 5;
      });
      this.save();
      this.syncJailOverlay();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const jailMsg = `🚔 MANDADO DE PRISÃO EXECUTADO! ${fmtMoney(confiscated)} sujos confiscados e -15% pts na Temporada! Pague Fiança Limpa ou cumpra custódia!`;
      if (typeof window.showToast === 'function') window.showToast(jailMsg);
      this.renderLaunderingHub();
      return { success: false, code: 'ARRESTED_BY_POLICE', jailed: true, confiscated, message: jailMsg };
    }

    payCleanBail() {
      this.ensureLoaded();
      if (!this.state.jailState || !this.state.jailState.jailed) return { success: false };
      const del = this.getActiveDelegate();
      const bail = del.bailCostClean || 650;
      const clean = this.getCleanBalance();
      if (clean < bail) {
        const msg = `Fiança exige ${fmtMoney(bail)} em DINHEIRO LIMPO (você tem ${fmtMoney(clean)}). Aguarde o fim da custódia!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, message: msg };
      }
      runAuth(() => {
        window.currentWallet.balance = Math.max(0, +(clean - bail).toFixed(2));
        if (window.currentProfile) window.currentProfile.heat_level = 2;
      });
      this.state.jailState.jailed = false;
      this.state.dirtyTailStrikes = 0;
      this.save();
      this.syncJailOverlay();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = `🔓 Fiança paga (${fmtMoney(bail)} Limpos)! Terminal desbloqueado — lave seu dinheiro sujo nas empresas antes de gastar!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, message: msg };
    }

    buyOrUpgradeOwnCompany(targetTier, customNameRaw) {
      this.ensureLoaded();
      if (window.progressionLocksEngine && window.progressionLocksEngine.getNoonDelinquencyEffects().commercialBlocked) {
        const msg = '🛑 NOME SUJO ÀS 12:00! Quite primeiro suas faturas vencidas (2+ meses) em Meu Esconderijo antes de comprar/evoluir empresa!';
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'BILLS_OVERDUE_COMMERCIAL_BLOCK', message: msg };
      }
      const tDef = LAUNDERING_TIERS[targetTier];
      if (!tDef) return { success: false, message: 'Porte empresarial inválido.' };

      const curTier = this.state.myCompany ? this.state.myCompany.tier : 0;
      if (curTier >= targetTier) {
        return { success: false, message: 'Você já possui uma empresa deste porte ou superior!' };
      }

      const prevPaid = curTier > 0 ? LAUNDERING_TIERS[curTier].priceClean : 0;
      const costClean = tDef.priceClean - prevPaid;
      const clean = this.getCleanBalance();

      if (clean < costClean) {
        const hasDirty = this.getDirtyBalance() > 0;
        if (hasDirty) {
          this.openDirtyMoneyBridgeModal(`Abertura/Upgrade ${tDef.code}`, costClean);
        }
        const msg = `BLOQUEADO PELA JUNTA COMERCIAL! Comprar/evoluir para ${tDef.code} exige ${fmtMoney(costClean)} 100% em DINHEIRO LIMPO (você tem ${fmtMoney(clean)} limpos${hasDirty ? ` — lave antes seus ${fmtMoney(this.getDirtyBalance())} sujos na vitrine!` : ''}).`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'CLEAN_MONEY_REQUIRED', required: costClean, cleanBalance: clean, message: msg };
      }

      runAuth(() => {
        window.currentWallet.balance = Math.max(0, +(clean - costClean).toFixed(2));
      });

      const cleanName = String(customNameRaw || (this.state.myCompany && this.state.myCompany.name) || `${(window.currentProfile && window.currentProfile.hacker_tag) || 'HC'} Holdings S.A.`).trim().slice(0, 42);
      const actor = window.mmoGlobalMarket ? window.mmoGlobalMarket.getActorIdentity() : { id: this.userId || 'me', tag: (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador' };
      this.state.myCompany = {
        id: 'plr_co_' + actor.id,
        ownerId: actor.id,
        name: cleanName,
        ownerTag: actor.tag,
        isPlayerOwned: true,
        tier: targetTier,
        feePct: this.state.myCompany ? Math.max(MIN_LAUNDERING_FEE_PCT, this.state.myCompany.feePct) : 19,
        totalLaundered: this.state.myCompany ? this.state.myCompany.totalLaundered : 0,
        ownerProfits: this.state.myCompany ? this.state.myCompany.ownerProfits : 0
      };
      if (window.mmoGlobalMarket) {
        window.mmoGlobalMarket.upsertGlobalCompany({
          ...this.state.myCompany,
          capacityPerHour: tDef.maxBatchUsd
        });
      }

      this.awardSeasonPoints(targetTier * 85, 'company_upgrade');
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = `🏢 Parabéns! Empresa "${cleanName}" (${tDef.code}) registrada com Dinheiro Limpo! Limite por remessa: ${fmtMoney(tDef.maxBatchUsd)} (15 min reais).`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      this.renderLaunderingHub();
      return { success: true, company: this.state.myCompany, message: msg };
    }

    setMyCompanyFeePct(newFeeRaw) {
      this.ensureLoaded();
      if (!this.state.myCompany) return { success: false, message: 'Compre primeiro sua empresa com Dinheiro Limpo!' };
      const parsed = Number(newFeeRaw);
      if (Number.isNaN(parsed) || parsed < MIN_LAUNDERING_FEE_PCT) {
        const msg = `Taxa inválida! O mínimo obrigatório é ${MIN_LAUNDERING_FEE_PCT}% (não há limite máximo).`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'BELOW_MIN_17_PCT', message: msg };
      }
      this.state.myCompany.feePct = +parsed.toFixed(1);
      // Atualiza também na fila de anúncios se já anunciado
      this.state.adQueue.forEach((ad) => {
        if (ad.isMine) ad.feePct = this.state.myCompany.feePct;
      });
      if (window.mmoGlobalMarket) {
        const tDef = LAUNDERING_TIERS[this.state.myCompany.tier] || LAUNDERING_TIERS[1];
        window.mmoGlobalMarket.upsertGlobalCompany({
          ...this.state.myCompany,
          capacityPerHour: tDef.maxBatchUsd
        });
      }
      this.save();
      if (typeof window.showToast === 'function') {
        window.showToast(`💼 Taxa da sua empresa ajustada para ${this.state.myCompany.feePct}%!`);
      }
      this.renderLaunderingHub();
      return { success: true, feePct: this.state.myCompany.feePct };
    }

    // Limpa anúncios de horas já passadas e garante no máximo 15 vagas nas 3 horas atuais (Hora +0, +1, +2)
    getNormalizedAdQueue() {
      this.ensureLoaded();
      const curBucket = this.currentHourBucket();
      this.state.adQueue = (this.state.adQueue || []).filter((ad) => ad.hourBucket >= curBucket && ad.hourBucket <= curBucket + 2);
      return this.state.adQueue;
    }

    purchaseCompanyAdSlot(customFeeRaw = null) {
      this.ensureLoaded();
      if (!this.state.myCompany) {
        const msg = 'Você precisa ser dono de uma Empresa de Fachada (comprada com Dinheiro Limpo) para anunciar!';
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'NO_COMPANY', message: msg };
      }
      if (customFeeRaw != null) {
        const feeCheck = this.setMyCompanyFeePct(customFeeRaw);
        if (!feeCheck.success) return feeCheck;
      }

      const q = this.getNormalizedAdQueue();
      if (q.length >= MAX_AD_QUEUE_SLOTS) {
        const msg = `Fila lotada (${MAX_AD_QUEUE_SLOTS}/15 vagas ocupadas pelas próximas 3 horas reais)! Aguarde a virada da hora liberar 5 novas vagas.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'QUEUE_15_FULL', message: msg };
      }

      const clean = this.getCleanBalance();
      if (clean < AD_SLOT_FEE_CLEAN) {
        const msg = `Anunciar exige ${fmtMoney(AD_SLOT_FEE_CLEAN)} em DINHEIRO LIMPO (você tem ${fmtMoney(clean)}).`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'INSUFFICIENT_CLEAN_AD_FEE', message: msg };
      }

      // Publica na Fila Global Real de 15 vagas (3 horas x 5 vagas compartilhadas entre todos os jogadores!)
      const curBucket = this.currentHourBucket();
      let targetBucket = curBucket;
      if (window.mmoGlobalMarket) {
        const tDef = LAUNDERING_TIERS[this.state.myCompany.tier] || LAUNDERING_TIERS[1];
        const globalAd = window.mmoGlobalMarket.publishGlobalAdSlot({
          ...this.state.myCompany,
          capacityPerHour: tDef.maxBatchUsd
        });
        if (!globalAd.ok) {
          if (typeof window.showToast === 'function') window.showToast(globalAd.message);
          return { success: false, code: globalAd.code, message: globalAd.message };
        }
        targetBucket = globalAd.hourBucket;
      } else {
        for (let h = 0; h < 3; h++) {
          const countInHour = q.filter((a) => a.hourBucket === curBucket + h).length;
          if (countInHour < 5) {
            targetBucket = curBucket + h;
            break;
          }
        }
      }

      runAuth(() => {
        window.currentWallet.balance = Math.max(0, +(clean - AD_SLOT_FEE_CLEAN).toFixed(2));
      });

      const slotNumber = q.length + 1;
      const adEntry = {
        adId: 'ad_' + Date.now(),
        slotNumber,
        hourBucket: targetBucket,
        isMine: true,
        companyId: this.state.myCompany.id,
        name: this.state.myCompany.name,
        ownerTag: this.state.myCompany.ownerTag,
        tier: this.state.myCompany.tier,
        feePct: this.state.myCompany.feePct
      };
      this.state.adQueue.push(adEntry);

      // Se a taxa for justa (17%..28%), clientes operadores simulados na rede já encomendam lavagens gerando comissão!
      let simulatedClientsNote = '';
      if (this.state.myCompany.feePct <= 28) {
        const tDef = LAUNDERING_TIERS[this.state.myCompany.tier];
        const clientVolume = Math.round(tDef.maxBatchUsd * (this.state.myCompany.feePct <= 20 ? 1.6 : 0.9));
        const myCut = +(clientVolume * (this.state.myCompany.feePct / 100)).toFixed(2);
        this.state.myCompany.ownerProfits = +(this.state.myCompany.ownerProfits + myCut).toFixed(2);
        this.state.myCompany.totalLaundered = +(this.state.myCompany.totalLaundered + clientVolume).toFixed(2);
        runAuth(() => {
          window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + myCut).toFixed(2);
        });
        simulatedClientsNote = ` Clientes da rede já lavaram ${fmtMoney(clientVolume)} com você (seu lucro imediato: +${fmtMoney(myCut)} Limpos)!`;
      } else if (this.state.myCompany.feePct >= 45) {
        simulatedClientsNote = ` ⚠️ Atenção: sua taxa (${this.state.myCompany.feePct}%) está muito alta — clientes estão preferindo concorrentes mais baratos da vitrine!`;
      }

      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = `📢 Anúncio publicado na Vitrine Global MMO (Vaga #${slotNumber}/15 · -${fmtMoney(AD_SLOT_FEE_CLEAN)} Limpos)!${simulatedClientsNote}`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      this.renderLaunderingHub();
      return { success: true, slotNumber, hourBucket: targetBucket, message: msg };
    }

    // Retorna SEMPRE 5 empresas diferentes na hora atual (Anúncios Globais de Jogadores Reais + Bots completando!)
    getCurrentHourFiveCompanies() {
      const q = this.getNormalizedAdQueue();
      const curBucket = this.currentHourBucket();
      const list = [];

      if (window.mmoGlobalMarket) {
        const globalAds = window.mmoGlobalMarket.getGlobalHourAds(curBucket);
        globalAds.forEach((ga) => {
          if (list.length < 5 && !list.some((x) => x.id === ga.id)) {
            const tierDef = LAUNDERING_TIERS[ga.tier] || LAUNDERING_TIERS[1];
            list.push({
              id: ga.id,
              name: ga.name,
              ownerId: ga.ownerId,
              ownerTag: ga.ownerTag,
              isBot: false,
              isMine: !!ga.isMine,
              isGlobalPlayer: !!ga.isGlobalPlayer,
              tier: ga.tier,
              maxBatchUsd: tierDef.maxBatchUsd,
              feePct: ga.feePct
            });
          }
        });
      }

      const activeAds = q.filter((a) => a.hourBucket === curBucket).slice(0, 5);
      activeAds.forEach((a) => {
        if (list.length < 5 && !list.some((x) => x.id === a.companyId)) {
          list.push({
            id: a.companyId,
            name: a.name,
            ownerTag: a.ownerTag,
            isBot: false,
            isMine: !!a.isMine,
            tier: a.tier,
            maxBatchUsd: LAUNDERING_TIERS[a.tier].maxBatchUsd,
            feePct: a.feePct
          });
        }
      });

      const offset = (curBucket * 5) % SEEDED_BOT_COMPANIES.length;
      let idx = 0;
      while (list.length < 5 && idx < SEEDED_BOT_COMPANIES.length) {
        const botCo = SEEDED_BOT_COMPANIES[(offset + idx) % SEEDED_BOT_COMPANIES.length];
        idx += 1;
        if (!list.some((x) => x.id === botCo.id)) {
          list.push({
            ...botCo,
            isMine: false,
            maxBatchUsd: LAUNDERING_TIERS[botCo.tier].maxBatchUsd
          });
        }
      }
      return list;
    }

    startLaunderingBatch(companyId, dirtyAmountRaw) {
      this.ensureLoaded();
      const dirtyAvail = this.getDirtyBalance();
      if (dirtyAvail <= 0) {
        const msg = 'Você não possui Dinheiro Sujo pendente para lavar.';
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, message: msg };
      }

      let targetCo = null;
      let effectiveFeePct = 20;
      if (companyId === 'MY_OWN_COMPANY' && this.state.myCompany) {
        const tDef = LAUNDERING_TIERS[this.state.myCompany.tier];
        targetCo = {
          id: this.state.myCompany.id,
          name: this.state.myCompany.name + ' (Sua Empresa)',
          ownerTag: this.state.myCompany.ownerTag,
          tier: this.state.myCompany.tier,
          maxBatchUsd: tDef.maxBatchUsd,
          isMine: true
        };
        effectiveFeePct = tDef.selfTaxPct; // custo contábil mínimo na própria empresa
      } else {
        const five = this.getCurrentHourFiveCompanies();
        targetCo = five.find((c) => c.id === companyId);
        if (!targetCo) {
          return { success: false, message: 'Esta empresa saiu da rotação horária. Escolha uma das 5 ativas!' };
        }
        effectiveFeePct = targetCo.isMine ? LAUNDERING_TIERS[targetCo.tier].selfTaxPct : Math.max(MIN_LAUNDERING_FEE_PCT, Number(targetCo.feePct));
      }

      // Trava Anti-Conta-Fake: máx. 3 lavagens por dia entre a mesma dupla de jogadores!
      if (!targetCo.isBot && !targetCo.isMine && targetCo.ownerId && window.mmoGlobalMarket) {
        const me = window.mmoGlobalMarket.getActorIdentity();
        const pairCheck = window.mmoGlobalMarket.canUsePairDailyLimit(me.id, targetCo.ownerId, 'launder_batch', 3);
        if (!pairCheck.ok) {
          const msg = `🛑 Trava Anti-Abuso: você já lavou 3 lotes hoje na empresa de @${targetCo.ownerTag}! Escolha outra empresa da vitrine.`;
          if (typeof window.showToast === 'function') window.showToast(msg);
          return { success: false, code: 'MAX_3_PAIR_WASHES_PER_DAY', message: msg };
        }
      }

      // Verifica se já há lote em lavagem nesta mesma empresa por este jogador (limite por vez!)
      const activeInSame = this.state.washingJobs.find((j) => !j.claimed && j.companyId === targetCo.id && j.completesAt > Date.now());
      if (activeInSame) {
        const remMin = Math.ceil((activeInSame.completesAt - Date.now()) / 60000);
        const msg = `Esta empresa já está lavando um lote seu! Aguarde ${remMin} min reais ou use outra das 5 empresas da vitrine.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'COMPANY_BUSY_FOR_PLAYER', message: msg };
      }

      const requested = Number(dirtyAmountRaw || targetCo.maxBatchUsd);
      if (requested > targetCo.maxBatchUsd) {
        const msg = `Limite do Porte excedido! "${targetCo.name}" só pode lavar até ${fmtMoney(targetCo.maxBatchUsd)} por vez de cada jogador!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'EXCEEDS_TIER_BATCH_CAP', maxBatchUsd: targetCo.maxBatchUsd, message: msg };
      }

      const grossDirty = Math.min(dirtyAvail, Math.max(1, +requested.toFixed(2)));
      const ownerCut = +(grossDirty * (effectiveFeePct / 100)).toFixed(2);
      const netClean = +(grossDirty - ownerCut).toFixed(2);
      const now = Date.now();
      const isTutStep = !!(window.tutorialEngine && typeof window.tutorialEngine.isReadyForTutorialWash === 'function' && window.tutorialEngine.isReadyForTutorialWash());
      const useTutorialExpress = isTutStep && !this.state.tutorialExpressWashUsed && grossDirty <= 1000;
      if (useTutorialExpress) {
        this.state.tutorialExpressWashUsed = true;
      }
      const waitMs = useTutorialExpress ? (8 * 1000) : (15 * 60 * 1000); // 8s bônus único no Treino Inicial; depois SEMPRE 15 MINUTOS REAIS!

      this.state.dirtyBalance = Math.max(0, +(dirtyAvail - grossDirty).toFixed(2));
      const job = {
        jobId: 'wash_' + now + '_' + Math.floor(Math.random() * 999),
        companyId: targetCo.id,
        companyName: targetCo.name,
        ownerTag: targetCo.ownerTag,
        grossDirty,
        feePct: effectiveFeePct,
        ownerCut,
        netClean,
        startedAt: now,
        completesAt: now + waitMs,
        tutorialExpress: useTutorialExpress,
        claimed: false
      };
      this.state.washingJobs.unshift(job);

      if (window.tutorialEngine && typeof window.tutorialEngine.onFirstWashStarted === 'function') {
        window.tutorialEngine.onFirstWashStarted(grossDirty, useTutorialExpress);
      }

      // Envia comissão em Dinheiro Limpo direto para a Caixa de Recebimentos (Inbox) do dono real!
      if (!targetCo.isBot && !targetCo.isMine && targetCo.ownerId && window.mmoGlobalMarket) {
        window.mmoGlobalMarket.recordGlobalWashInPlayerCompany({
          companyId: targetCo.id,
          ownerId: targetCo.ownerId,
          ownerTag: targetCo.ownerTag,
          grossDirty,
          ownerCutClean: ownerCut,
          companyName: targetCo.name
        });
      }

      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const timeLabel = useTutorialExpress ? '8 segundos (Bônus Único de 1º Treino!)' : '15 minutos da vida real';
      const msg = `🧼 Remessa de ${fmtMoney(grossDirty)} enviada para "${targetCo.name}" (Taxa ${effectiveFeePct}%)! Ficará limpa (${fmtMoney(netClean)}) em ${timeLabel}.`;
      if (window.operatorRetentionEngine && typeof window.operatorRetentionEngine.recordDailyGoalProgress === 'function') {
        window.operatorRetentionEngine.recordDailyGoalProgress('clean_finance');
      }
      if (typeof window.showToast === 'function') window.showToast(msg);
      this.renderLaunderingHub();
      return { success: true, job, message: msg };
    }

    processCompletedWashingJobs() {
      this.ensureLoaded();
      const now = Date.now();
      let totalReleased = 0;
      this.state.washingJobs.forEach((j) => {
        if (!j.claimed && now >= j.completesAt) {
          j.claimed = true;
          totalReleased += Number(j.netClean || 0);
        }
      });
      if (totalReleased > 0) {
        runAuth(() => {
          if (window.currentWallet) {
            window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + totalReleased).toFixed(2);
          }
        });
        this.state.dirtyTailStrikes = 0;
        this.save();
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
        if (typeof window.showToast === 'function') {
          window.showToast(`💵 Lavagem concluída (15 min)! +${fmtMoney(totalReleased)} em DINHEIRO LIMPO creditados na sua conta!`);
        }
        if (window.pwaAlertsEngine && typeof window.pwaAlertsEngine.triggerAlert === 'function') {
          window.pwaAlertsEngine.triggerAlert('launderDone', {
            title: '💵 Lavagem de Dinheiro Concluída!',
            body: `+${fmtMoney(totalReleased)} Limpos já estão disponíveis na sua conta bancária.`,
            winId: 'winLaundering',
            tag: 'launder-done'
          });
        }
      }
      return totalReleased;
    }

    // =========================================================================
    // MECÂNICA #01: MERCADO CLANDESTINO P2P DE LICENÇAS DO LAB (DRM 24H/48H/72H)
    // =========================================================================
    getHourlyP2pOffers() {
      this.ensureLoaded();
      const b = this.currentHourBucket();
      const botPool = [
        { offerId: `p2p_bot_${b}_1`, sellerTag: 'm4riposa', strainName: 'Hydra-SIMD', family: 'vminer', versionInt: 74, fitGrade: 'S', durationHours: 48, priceClean: 2800, burnTaxPct: 15, isBot: true },
        { offerId: `p2p_bot_${b}_2`, sellerTag: 'nyx_0day', strainName: 'Burst-SMTP', family: 'vspam', versionInt: 58, fitGrade: 'A', durationHours: 24, priceClean: 1550, burnTaxPct: 12, isBot: true },
        { offerId: `p2p_bot_${b}_3`, sellerTag: 'ZeroDay_Valkyrie', strainName: 'Swarm-ZeroCopy', family: 'vwarez', versionInt: 82, fitGrade: 'S+', durationHours: 72, priceClean: 3900, burnTaxPct: 20, isBot: true },
        { offerId: `p2p_bot_${b}_4`, sellerTag: 'Kuro_Phantom', strainName: 'Vault-Hook', family: 'vbank', versionInt: 64, fitGrade: 'A', durationHours: 48, priceClean: 2250, burnTaxPct: 15, isBot: true }
      ];
      if (window.mmoGlobalMarket) {
        const globalOpen = window.mmoGlobalMarket.getGlobalOpenP2pLicenses();
        return [...globalOpen, ...botPool];
      }
      return [...(this.state.myListedLicenses || []), ...botPool];
    }

    listMyStrainOnP2p(strainId, durationHoursRaw = 48, priceCleanRaw = 1800) {
      this.ensureLoaded();
      if (window.virusLabEngine && typeof window.virusLabEngine.ensureLoaded === 'function') {
        window.virusLabEngine.ensureLoaded();
      }
      const creations = (window.virusLabEngine && window.virusLabEngine.state && window.virusLabEngine.state.creations) || [];
      const strain = creations.find((c) => c.id === strainId) || creations[0];
      if (!strain) {
        const msg = 'Compile primeiro uma cepa no Laboratório de Vírus para poder emitir licenças P2P!';
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, message: msg };
      }

      const issued = Number(this.state.licensesIssuedByStrain[strain.id] || 0);
      if (issued >= 2) {
        const msg = 'Limite atingido (Lado Negativo Anti-Clonagem): cada cepa compilada só pode emitir no máximo 2 licenças!';
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'MAX_2_LICENSES_PER_STRAIN', message: msg };
      }

      const dur = [24, 48, 72].includes(Number(durationHoursRaw)) ? Number(durationHoursRaw) : 48;
      const burnTaxPct = dur === 24 ? 12 : (dur === 48 ? 15 : 20);
      const minPrice = Math.max(400, strain.versionInt * 25);
      const maxPrice = Math.max(2500, strain.versionInt * 250);
      const price = Math.round(Number(priceCleanRaw || minPrice));

      if (price < minPrice || price > maxPrice) {
        const msg = `Preço fora da faixa auditada para v${(strain.versionInt / 10).toFixed(1)}: mínimo ${fmtMoney(minPrice)} e máximo ${fmtMoney(maxPrice)}.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'PRICE_OUT_OF_BAND', message: msg };
      }

      this.state.licensesIssuedByStrain[strain.id] = issued + 1;
      const netSeller = Math.round(price * (1 - burnTaxPct / 100));
      const actor = window.mmoGlobalMarket ? window.mmoGlobalMarket.getActorIdentity() : { id: 'me', tag: (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador' };
      const offer = {
        offerId: 'p2p_plr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        strainId: strain.id,
        sellerId: actor.id,
        sellerTag: actor.tag,
        strainName: strain.strainName,
        family: strain.family,
        versionInt: strain.versionInt,
        fitGrade: strain.fitGrade || 'A',
        durationHours: dur,
        priceClean: price,
        burnTaxPct,
        isMine: true
      };
      this.state.myListedLicenses.unshift(offer);

      if (window.mmoGlobalMarket) {
        window.mmoGlobalMarket.publishGlobalP2pLicense(offer);
      } else {
        runAuth(() => {
          if (window.currentWallet) {
            window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + netSeller).toFixed(2);
          }
        });
      }
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = window.mmoGlobalMarket
        ? `🧬 Licença ${dur}h de "${strain.strainName}" anunciada na Vitrine Global MMO por ${fmtMoney(price)} Limpos! Quando outro jogador alugar, você recebe +${fmtMoney(netSeller)} Limpos na Caixa MMO.`
        : `🧬 Licença ${dur}h de "${strain.strainName}" vendida no P2P! Recebeu +${fmtMoney(netSeller)} Limpos (Taxa queimada: ${burnTaxPct}%).`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, netSeller, offer, message: msg };
    }

    buyP2pLicense(offerId) {
      this.ensureLoaded();
      const clean = this.getCleanBalance();
      let offer = null;

      if (window.mmoGlobalMarket) {
        const atomicRes = window.mmoGlobalMarket.buyGlobalP2pLicenseAtomic({
          offerId,
          buyerCleanBalance: clean
        });
        if (atomicRes.ok) {
          offer = atomicRes.offer;
        } else if (atomicRes.code !== 'NOT_GLOBAL_OFFER') {
          const mappedCode = atomicRes.code === 'NEED_CLEAN_MONEY' ? 'CLEAN_MONEY_REQUIRED' : atomicRes.code;
          if (typeof window.showToast === 'function' && atomicRes.message) window.showToast(atomicRes.message);
          return { success: false, code: mappedCode, message: atomicRes.message };
        }
      }

      if (!offer) {
        offer = this.getHourlyP2pOffers().find((o) => o.offerId === offerId);
        if (!offer) return { success: false, code: 'ALREADY_SOLD', message: 'Oferta expirada ou já alugada por outro jogador!' };
        if (offer.isMine) return { success: false, code: 'SELF_BUY_BLOCKED', message: 'Você não pode comprar sua própria licença!' };
        if (clean < offer.priceClean) {
          const msg = `Comprar licença P2P exige ${fmtMoney(offer.priceClean)} em DINHEIRO LIMPO!`;
          if (typeof window.showToast === 'function') window.showToast(msg);
          return { success: false, code: 'CLEAN_MONEY_REQUIRED', message: msg };
        }
      }

      runAuth(() => {
        window.currentWallet.balance = Math.max(0, +(clean - offer.priceClean).toFixed(2));
      });

      const expiresAt = Date.now() + offer.durationHours * 60 * 60 * 1000;
      this.state.rentedDrmLicenses.push({
        licenseId: 'drm_' + Date.now(),
        strainName: offer.strainName,
        family: offer.family,
        versionInt: offer.versionInt,
        expiresAt,
        ramOverheadPct: 20 // Lado Negativo DRM: +20% consumo de RAM no alvo!
      });

      // Libera uso temporário no SoftwareEngine se for maior que a versão atual!
      if (window.softwareEngine) {
        if (typeof window.softwareEngine.ensureLoaded === 'function') window.softwareEngine.ensureLoaded();
        const inv = window.softwareEngine.state && window.softwareEngine.state.inventory ? window.softwareEngine.state.inventory[offer.family] : null;
        if (inv && offer.versionInt > Number(inv.versionInt || 0)) {
          inv.owned = true;
          inv.versionInt = offer.versionInt;
          inv.licensed = true;
          inv.rentedExpiresAt = expiresAt;
          window.softwareEngine.save();
        }
      }

      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      const msg = `🔒 Licença DRM (${offer.durationHours}h) de ${offer.strainName} v${(offer.versionInt / 10).toFixed(1)} ativada! (Nota: consome +20% RAM no alvo e não pode ser revendida).`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, expiresAt, message: msg };
    }

    // =========================================================================
    // MECÂNICA #04: TERMODINÂMICA FÍSICA (°C, PASTA TÉRMICA & WATERCOOLER)
    // =========================================================================
    getLiveThermalTelemetry() {
      this.ensureLoaded();
      const t = this.state.thermals;
      const cooler = COOLING_CATALOG[t.coolerId] || COOLING_CATALOG.stock;
      const pasteFresh = t.pasteAppliedAt > 0 && (Date.now() - t.pasteAppliedAt) < (7 * 60 * 60 * 1000);
      const pasteCooling = pasteFresh ? COOLING_CATALOG.paste_silver.coolingC : 0;

      const runningTasks = (window.taskManager && typeof window.taskManager.getRunningAll === 'function')
        ? window.taskManager.getRunningAll().length
        : 0;
      const activeViruses = (window.softwareEngine && window.softwareEngine.state && Array.isArray(window.softwareEngine.state.remoteInfections))
        ? Math.min(3, window.softwareEngine.state.remoteInfections.length)
        : 0;
      const empHeat = t.empHeatUntil > Date.now() ? 12 : 0;
      const kpHeat = t.kernelPanicUntil && t.kernelPanicUntil > Date.now() ? Number(t.extraKernelPanicC || 18) : 0;
      const ocHeat = t.coldOverclockOn ? (cooler.allowsColdOc ? 6 : 22) : 0;
      const bottleneckHeat = (window.progressionLocksEngine && typeof window.progressionLocksEngine.hasAnyBottleneckedSoftware === 'function' && window.progressionLocksEngine.hasAnyBottleneckedSoftware())
        ? 15
        : 0;
      const basePropertyCool = (window.topTenMechanics && typeof window.topTenMechanics.getSafehouseThermalBonusC === 'function')
        ? window.topTenMechanics.getSafehouseThermalBonusC()
        : 0;

      const rawTemp = 38 + runningTasks * 12 + activeViruses * 3 + empHeat + kpHeat + ocHeat + bottleneckHeat - cooler.coolingC - pasteCooling - basePropertyCool;
      const tempC = Math.max(31, Math.min(98, Math.round(rawTemp)));
      const throttling = tempC >= 80;
      const cpuSpeedMult = throttling ? 0.80 : (t.coldOverclockOn && cooler.allowsColdOc ? 1.22 : 1.0);

      return {
        tempC,
        cooler,
        pasteFresh,
        throttling,
        coldOverclockOn: !!(t.coldOverclockOn && cooler.allowsColdOc),
        cpuSpeedMult,
        extraWatts: cooler.extraWatts || 0
      };
    }

    buyCoolingUpgrade(itemId) {
      this.ensureLoaded();
      const item = COOLING_CATALOG[itemId];
      if (!item) return { success: false };
      const clean = this.getCleanBalance();
      if (clean < item.priceClean) {
        const msg = `Saldo Limpo insuficiente! ${item.name} custa ${fmtMoney(item.priceClean)} Limpos.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, message: msg };
      }
      runAuth(() => {
        window.currentWallet.balance = Math.max(0, +(clean - item.priceClean).toFixed(2));
      });
      if (item.isPaste) {
        this.state.thermals.pasteAppliedAt = Date.now();
      } else {
        this.state.thermals.coolerId = item.id;
      }
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (typeof window.updateHardwareDisplay === 'function') window.updateHardwareDisplay();
      const msg = `❄️ ${item.name} instalado com sucesso!`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, telemetry: this.getLiveThermalTelemetry(), message: msg };
    }

    toggleColdOverclock() {
      this.ensureLoaded();
      const cooler = COOLING_CATALOG[this.state.thermals.coolerId] || COOLING_CATALOG.stock;
      if (!cooler.allowsColdOc) {
        const msg = 'Exige instalar o Watercooler Custom 360mm Silencioso em Peças do PC para ativar o Overclock Frio (+22% CPU s/ subir conta de Luz)!';
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, message: msg };
      }
      this.state.thermals.coldOverclockOn = !this.state.thermals.coldOverclockOn;
      this.save();
      if (typeof window.updateHardwareDisplay === 'function') window.updateHardwareDisplay();
      const msg = this.state.thermals.coldOverclockOn
        ? '❄️ Overclock Frio ATIVADO (+22% velocidade de CPU · +$0 na fatura de Luz das 12:00)!'
        : 'Overclock Frio desativado.';
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, active: this.state.thermals.coldOverclockOn, message: msg };
    }

    renderHardwareThermalSectionHtml() {
      const tel = this.getLiveThermalTelemetry();
      const badgeCls = tel.throttling ? 'danger' : (tel.tempC >= 65 ? 'warn' : 'success');
      return `
        <div class="nds-card ${tel.throttling ? 'crimson' : 'emerald'}" style="margin-top:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
            <div>
              <span class="hc-badge ${badgeCls}">🌡️ TEMPERATURA DO PC: ${tel.tempC}°C (${tel.throttling ? 'MUITO QUENTE · -20% LENTO' : 'NORMAL'})</span>
              <strong style="margin-left:8px;">${esc(tel.cooler.name)} ${tel.pasteFresh ? '+ Pasta Prata Nova' : '(Pasta Seca)'}</strong>
            </div>
            <button type="button" id="btnToggleColdOverclock" class="hc-btn ${tel.coldOverclockOn ? 'primary' : 'ghost'} sm" onclick="window.nineSystemsEngine.toggleColdOverclock()">
              ❄️ ${tel.coldOverclockOn ? 'Turbo Frio LIGADO (+22% Vel.)' : 'Ligar Turbo Frio (+22% Vel.)'}
            </button>
          </div>
          <div class="nds-pros-cons">
            <div class="nds-pc-box pro"><strong>✅ Lado Bom:</strong> Com o Watercooler 360mm você liga o <strong>Turbo Frio (+22% velocidade)</strong> sem aumentar sua conta de Luz das 12h!</div>
            <div class="nds-pc-box con"><strong>⚠️ Lado Negativo:</strong> Rodar 4+ tarefas juntas sem cooler passa de 80°C e deixa seu PC <strong>-20% mais lento</strong> até esfriar, e a pasta seca após 7h!</div>
          </div>
          <div class="nds-grid-3">
            <div class="nds-row">
              <div><strong>Pasta Térmica Prata</strong><div style="font-size:11px;color:var(--hc-text-2);">Esfria -9°C por 7h reais</div></div>
              <button type="button" id="btnBuyPasteSilver" class="hc-btn sm" onclick="window.nineSystemsEngine.buyCoolingUpgrade('paste_silver')">Comprar ($ 250)</button>
            </div>
            <div class="nds-row">
              <div><strong>Air Cooler Duplo</strong><div style="font-size:11px;color:var(--hc-text-2);">Esfria -16°C (+12W luz)</div></div>
              <button type="button" id="btnBuyAirDual" class="hc-btn sm" onclick="window.nineSystemsEngine.buyCoolingUpgrade('air_dual')">Comprar ($ 850)</button>
            </div>
            <div class="nds-row" style="border-color:rgba(53,184,119,0.5);">
              <div><strong style="color:#6ee7b7;">Watercooler 360mm</strong><div style="font-size:11px;color:var(--hc-text-2);">Esfria -28°C · Libera +22% Vel.!</div></div>
              <button type="button" id="btnBuyWater360" class="hc-btn primary sm" onclick="window.nineSystemsEngine.buyCoolingUpgrade('water_360')">Comprar ($ 2.400)</button>
            </div>
          </div>
          <details class="nds-rules-drawer">
            <summary>📖 Como funciona a Temperatura do PC, Pasta e Coolers</summary>
            <ol class="nds-rules-list">
              <li><strong>O que esquenta o PC:</strong> Começa em 38°C e sobe +12°C para cada tarefa rodando ao mesmo tempo (mais +3°C por vírus ativo). Melhorar o Esconderijo (Studio -5°C / Bunker -12°C) e instalar coolers esfriam o PC.</li>
              <li><strong>Peças de Resfriamento (Dinheiro Limpo):</strong> Pasta Prata ($ 250) esfria <strong>-9°C por 7 horas reais</strong>; Air Cooler ($ 850) esfria <strong>-16°C</strong> fixos (+12W de consumo); Watercooler 360mm ($ 2.400) esfria <strong>-28°C</strong> sem gastar energia extra.</li>
              <li><strong>Turbo Frio (+22%):</strong> Liberado quando você instala o Watercooler 360mm — deixa seu PC <strong>+22% mais rápido</strong> sem subir a conta de luz.</li>
              <li><strong>Passou de 80°C:</strong> O PC fica <strong>-20% mais lento</strong> para se proteger até a temperatura baixar (o calor nunca queima nem apaga suas peças!).</li>
            </ol>
          </details>
        </div>
      `;
    }

    // =========================================================================
    // MECÂNICA #05: SEQUESTRO TÁTICO DE ZUMBIS (BOTNET HIJACKING C2)
    // =========================================================================
    getForeignVirusesOnHost(hostIp) {
      this.ensureLoaded();
      if (!hostIp) return [];
      const revealed = window.stealthXhdEngine ? window.stealthXhdEngine.revealedHosts.has(hostIp) : false;
      if (!revealed) return [];
      const h = String(hostIp).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const owners = ['Kuro_Phantom', 'nyx_0day', 'm4riposa', 'ZeroDay_Valkyrie'];
      const fams = ['vminer', 'vspam', 'vwarez'];
      const hijacked = this.state.hijackedNodes.some((n) => n.hostIp === hostIp && n.expiresAt > Date.now());
      return [{
        foreignId: 'fvir_' + hostIp.replace(/\./g, '_'),
        hostIp,
        ownerTag: owners[h % owners.length],
        family: fams[h % fams.length],
        versionLabel: 'v' + (2.5 + (h % 4)).toFixed(1),
        hijacked
      }];
    }

    hijackForeignVirus(hostIp) {
      this.ensureLoaded();
      this.state.hijackedNodes = this.state.hijackedNodes.filter((n) => n.expiresAt > Date.now());
      if (this.state.hijackedNodes.some((n) => n.hostIp === hostIp)) {
        return { success: false, message: 'Chave C2 deste servidor já está sequestrada para sua conta!' };
      }
      if (this.state.hijackedNodes.length >= 4) {
        const msg = 'Limite tático atingido (Lado Negativo: máx. 4 nós sequestrados simultâneos)!';
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'MAX_4_HIJACKS', message: msg };
      }

      const immediateSiphonDirty = 480;
      this.state.hijackedNodes.push({
        hostIp,
        hijackedAt: Date.now(),
        expiresAt: Date.now() + 6 * 60 * 60 * 1000
      });
      this.addDirtyMoney(immediateSiphonDirty, `Botnet Hijack ${hostIp}`);

      if (window.internetEngine) {
        const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
        window.internetEngine.appendServerLog(hostIp, `${myIp} injected C2_KEY_HIJACK (70% stream diverted)`);
      }

      this.save();
      if (window.internetEngine && window.internetEngine.currentIp === hostIp) window.internetEngine.render();
      const msg = `🏴‍☠️ Sequestro C2 concluído em ${hostIp}! 70% do fluxo desviado (+${fmtMoney(immediateSiphonDirty)} Sujos já coletados — limpe o syslog para evitar Canário Reverso do dono!).`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, immediateSiphonDirty, message: msg };
    }

    // =========================================================================
    // MECÂNICA #07: PILHA FORENSE PROFUNDA (SOMBRA MAGNÉTICA VS SHRED 7-PASSOS)
    // =========================================================================
    recordSimpleLogWipe(hostIp, actorIpRaw = null) {
      const ip = actorIpRaw || (window.networkIdentity ? window.networkIdentity.getPublicIp() : '187.44.12.9');
      const parts = String(ip).split('.');
      const prefix = parts.length >= 2 ? `${parts[0]}.${parts[1]}.***.**` : '187.44.***.**';
      const del = this.getActiveDelegate();
      const dur = del.shadowDurationMs || (5 * 60 * 1000);
      const arr = this.magneticShadows.get(hostIp) || [];
      arr.unshift({
        subnetPrefix: prefix,
        wipedAt: new Date().toLocaleTimeString('pt-BR'),
        expiresAt: Date.now() + dur,
        shredded: false
      });
      this.magneticShadows.set(hostIp, arr.slice(0, 5));
    }

    executeSevenPassShred(hostIp) {
      this.ensureLoaded();
      const target = hostIp || 'localhost';
      if (target === 'localhost') {
        window.systemLogs = [];
        try { localStorage.setItem(window.getSystemLogsStorageKey(), '[]'); } catch (e) {}
      } else {
        if (window.botAI) window.botAI.wipeLogs(target);
        const rHost = window.internetEngine && typeof window.internetEngine.resolveHost === 'function'
          ? window.internetEngine.resolveHost(target)
          : null;
        if (rHost && rHost.isRealHuman && window.onlineEngine) {
          const visIp = (window.internetEngine.lastPvpVisibleIpByTarget && window.internetEngine.lastPvpVisibleIpByTarget[target])
            || (window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0');
          window.onlineEngine.sendPvpPacket({
            kind: 'PVP_WIPE_LOG',
            visibleIp: visIp,
            targetUserId: rHost.humanUserId,
            targetTag: rHost.humanTag,
            targetIp: rHost.ip,
            d: { wipedOwnIp: true, fullClear: true, shredded7Pass: true }
          });
        }
        if (window.operatorRetentionEngine && typeof window.operatorRetentionEngine.recordDailyGoalProgress === 'function') {
          window.operatorRetentionEngine.recordDailyGoalProgress('ghost_wipe');
        }
      }
      this.magneticShadows.set(target, [{
        subnetPrefix: '0x00000000 (SHRED 7-PASSOS IRRECUPERÁVEL)',
        wipedAt: new Date().toLocaleTimeString('pt-BR'),
        expiresAt: Date.now() + 60000,
        shredded: true
      }]);
      // Contrapeso: Shred 7-Passos aquece levemente a CPU!
      this.state.thermals.empHeatUntil = Date.now() + 45 * 1000;
      this.save();
      if (target === 'localhost' && typeof window.renderLogsPage === 'function') window.renderLogsPage();
      if (window.internetEngine && window.internetEngine.currentIp === target) window.internetEngine.render();
      const msg = `🔥 Shred Forense 7-Passos (DoD 5220.22-M) executado em ${target}! Zero sombra magnética restante (CPU +6°C temporário).`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, shredded: true, message: msg };
    }

    scanMagneticShadowsOnHost(hostIp) {
      const anaVer = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('analyzer') : 0;
      const isForensicSub = window.skillTreeEngine && window.skillTreeEngine.selectedSubclass === 'sub_forensic';
      if (anaVer < 2.0 && !isForensicSub) {
        const msg = 'Perícia de Setor Magnético exige Analyzer.ana v2.0+ ou subclasse Forense Ofensivo!';
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'NEEDS_ANALYZER_V2', message: msg };
      }
      const list = (this.magneticShadows.get(hostIp) || []).filter((s) => s.expiresAt > Date.now());
      if (list.length === 0) {
        return { success: true, shadows: [], message: 'Nenhuma sombra magnética recente encontrada nos setores deste disco.' };
      }
      return { success: true, shadows: list, message: `🔬 ${list.length} setor(es) magnético(s) inspecionado(s) em ${hostIp}!` };
    }

    getActiveShadowCount(hostIp = 'localhost') {
      const list = (this.magneticShadows.get(hostIp) || []).filter((s) => s.expiresAt > Date.now() && !s.shredded);
      return list.length;
    }

    // =========================================================================
    // MECÂNICA #08: POPOVER DE DEFESA ATIVA DE 15 SEGUNDOS (CONTRA-MEDIDA AO VIVO)
    // =========================================================================
    triggerActiveDefensePopover(sessionMeta) {
      this.ensureLoaded();
      const attackerIp = (sessionMeta && sessionMeta.originIp) || '91.134.72.19';
      const alias = (sessionMeta && sessionMeta.originAlias) || 'nyx_0day';
      const bunkerBonusSec = (window.topTenMechanics && typeof window.topTenMechanics.getActiveDefenseBonusSeconds === 'function')
        ? Number(window.topTenMechanics.getActiveDefenseBonusSeconds() || 0)
        : 0;
      const totalWindowMs = (15 + bunkerBonusSec) * 1000;
      this.activeDefenseAlert = {
        attackerIp,
        alias,
        startedAt: Date.now(),
        expiresAt: Date.now() + totalWindowMs,
        windowSeconds: 15 + bunkerBonusSec
      };
      this.renderDefensePopoverDom();
      if (this._defenseTimer) clearInterval(this._defenseTimer);
      this._defenseTimer = setInterval(() => {
        if (!this.activeDefenseAlert || Date.now() >= this.activeDefenseAlert.expiresAt) {
          this.activeDefenseAlert = null;
          clearInterval(this._defenseTimer);
          this.renderDefensePopoverDom();
          return;
        }
        this.renderDefensePopoverDom();
      }, 250);
      return this.activeDefenseAlert;
    }

    respondActiveDefense(actionKind) {
      this.ensureLoaded();
      if (!this.activeDefenseAlert) return { success: false, message: 'Nenhuma intrusão ativa no momento.' };
      const attIp = this.activeDefenseAlert.attackerIp;
      const attAlias = this.activeDefenseAlert.alias;

      if (actionKind === 'cut_cable') {
        // Lado Bom: grátis e corta na hora. Lado Negativo: pausa rede própria por 15s!
        this.state.netCutPausedUntil = Date.now() + 15000;
        if (window.connManagerEngine) {
          window.connManagerEngine.inboundSessions = [];
          window.connManagerEngine.updateUI();
        }
        this.activeDefenseAlert = null;
        this.save();
        this.renderDefensePopoverDom();
        const msg = `✂️ Cabo SSH cortado contra ${attIp}! (Contrapeso: reset da placa pausou transferências locais por 15s).`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: true, action: 'cut_cable', message: msg };
      }

      if (actionKind === 'honeypot') {
        const sacVps = (window.lanServersEngine && typeof window.lanServersEngine.getSacrificeableVps === 'function')
          ? window.lanServersEngine.getSacrificeableVps()
          : null;
        if (!sacVps) {
          const msg = '🔒 VOCÊ NÃO POSSUI NENHUMA VPS PARA SACRIFICAR! Desviar invasão exige ter comprado uma VPS ($ 2.500+ Limpos), pois o invasor destrói a VPS permanentemente! Use Cortar Cabo ou Pulso EMP.';
          if (typeof window.showToast === 'function') window.showToast(msg);
          return { success: false, code: 'NO_VPS_TO_SACRIFICE', message: msg };
        }

        // PREÇO ALTÍSSIMO: O invasor entra na VPS e você PERDE ELA PERMANENTEMENTE (sem opção de reformatar — tem que comprar e montar outra!)
        const wreck = window.lanServersEngine.sacrificeAndDestroyVps(attIp, attAlias);
        if (window.hackedDb) {
          window.hackedDb.upsertHost({
            ip: attIp,
            hostname: `Intruso Capturado (${attAlias})`,
            kind: 'player',
            analyzedHw: `Capturado no sacrifício irreversível de ${wreck ? wreck.label : 'VPS'} (+25% Bônus Contra-Ataque)`
          });
        }
        if (typeof window.addLocalLog === 'function' && wreck) {
          window.addLocalLog(
            'VPS-DESTRUIDA',
            `DESVIO DE EMERGÊNCIA: Ataque de ${attIp} (${attAlias}) desviado p/ ${wreck.label} (${wreck.ip}). A VPS e suas peças foram DESTRUÍDAS PERMANENTEMENTE (sem reformatação — compre e monte outra!).`,
            'danger'
          );
        }
        if (window.connManagerEngine) {
          window.connManagerEngine.inboundSessions = [];
          window.connManagerEngine.updateUI();
        }
        this.activeDefenseAlert = null;
        this.awardSeasonPoints(45, 'honeypot_trap');
        this.save();
        this.renderDefensePopoverDom();
        const msg = `💀🔥 Ataque desviado! Seu PC Principal foi salvo e o IP de ${attAlias} (${attIp}) foi capturado, MAS sua "${wreck ? wreck.label : 'VPS'}" foi DESTRUÍDA PERMANENTEMENTE (sem reformatação — compre e monte outra VPS)!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: true, action: 'honeypot', capturedIp: attIp, burnedVps: wreck, message: msg };
      }

      if (actionKind === 'emp_pulse') {
        this.state.empCooldownUntil = Date.now() + 180000;
        this.state.thermals.empHeatUntil = Date.now() + 60000; // Contrapeso: +12°C na própria CPU!
        if (window.connManagerEngine) {
          window.connManagerEngine.inboundSessions = [];
          window.connManagerEngine.updateUI();
        }
        this.activeDefenseAlert = null;
        this.save();
        this.renderDefensePopoverDom();
        const msg = `⚡ Pulso Reverso EMP fritou o buffer de ${attIp}! (Contrapeso: sua CPU aqueceu +12°C por 60s).`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: true, action: 'emp_pulse', message: msg };
      }
      return { success: false };
    }

    // =========================================================================
    // MECÂNICA #09: PORTAL UNDERGROUND hc://vazamentos (185.220.101.77 + ISCA PGP!)
    // =========================================================================
    getHourlyZeroBinPastes() {
      this.ensureLoaded();
      const b = this.currentHourBucket();
      const targets = [
        { ip: '58.40.12.9', name: 'Corvo Cinza Logística', stock: 'CRVO' },
        { ip: '203.17.88.40', name: 'Farofa Systems B2B', stock: 'FARO' },
        { ip: '189.40.7.12', name: 'KronoTech Sistemas', stock: 'KRNO' }
      ];
      const tgt = targets[b % targets.length];
      return [
        {
          id: `leak_cred_${b}`,
          kind: 'cred',
          badge: 'EXPIRA EM 20 MIN',
          badgeCls: 'danger',
          title: `[DUMP #${700 + (b % 299)}] Credencial de Manutenção Vazada — ${tgt.name}`,
          body: `Host vulnerável: ${tgt.ip} (${tgt.name}) · Chave SSH temporária vazada por ex-funcionário. Resgate antes que troquem!`,
          targetIp: tgt.ip,
          isFbiHoneyTrap: false,
          pgpFingerprint: 'PGP-VALID-99A4-CICADA'
        },
        {
          id: `leak_trap_${b}`,
          kind: 'cred',
          badge: 'URGENTE · COFRE FÁCIL',
          badgeCls: 'warn',
          title: `[VAZAMENTO VIP #${410 + (b % 99)}] Acesso Direto Reserva Bancária Sem Senha!`,
          body: `Servidor espelho 109.64.211.37 liberando lote rápido! Conecte já sem proxy!`,
          targetIp: '109.64.211.37',
          isFbiHoneyTrap: true, // LADO NEGATIVO: Isca plantada pela Safenet!
          pgpFingerprint: 'INVALID-SIG-SAFENET-HONEYPOT'
        },
        {
          id: `leak_tix_${b}`,
          kind: 'rumor',
          badge: 'RUMOR CYBERSTOCK',
          badgeCls: 'info',
          title: ` Memorando Interno HEBC sobre ${tgt.stock} (${tgt.ip})`,
          body: `Fontes indicam fragilidade crítica no NVR de ${tgt.name}. Operadores posicionados em Short em ${tgt.stock} podem lucrar pesado.`,
          targetIp: tgt.ip,
          isFbiHoneyTrap: false,
          pgpFingerprint: 'PGP-VALID-HEBC-LEAK'
        },
        {
          id: `leak_lab_${b}`,
          kind: 'lab',
          badge: 'RECEITA BANCADA LAB',
          badgeCls: 'success',
          title: 'Diário de Engenheiro Viral — Combinação de Alto Encaixe',
          body: 'Dica da hora: evitem sync_stall no Round 2! Alinhar canais simd_alu (Round 1 + Round 2) com universal_cloak rendeu Nota S+ hoje.',
          isFbiHoneyTrap: false,
          pgpFingerprint: 'PGP-VALID-LAB-GUILD'
        }
      ];
    }

    verifyZeroBinPgp(pasteId) {
      this.ensureLoaded();
      const p = this.getHourlyZeroBinPastes().find((x) => x.id === pasteId);
      if (!p) return { success: false };
      this.state.verifiedLeakIds[pasteId] = true;
      if (p.isFbiHoneyTrap) {
        runAuth(() => {
          if (window.currentProfile) window.currentProfile.reputation = Number(window.currentProfile.reputation || 100) + 25;
        });
        this.awardSeasonPoints(25, pasteId);
      }
      this.save();
      if (window.internetEngine && window.internetEngine.currentIp === '185.220.101.77') window.internetEngine.render();
      const msg = p.isFbiHoneyTrap
        ? `🕵️ ARMADILHA DESMASCARADA! A assinatura PGP (${p.pgpFingerprint}) revelou uma Isca Federal da Safenet (+25 REP por não cair no golpe)!`
        : `✓ Assinatura PGP autêntica (${p.pgpFingerprint})! Vazamento seguro para explorar.`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, isTrap: p.isFbiHoneyTrap, message: msg };
    }

    exploitZeroBinPaste(pasteId) {
      this.ensureLoaded();
      const p = this.getHourlyZeroBinPastes().find((x) => x.id === pasteId);
      if (!p) return { success: false };
      if (this.state.claimedLeakIds[pasteId]) {
        return { success: false, message: 'Este vazamento horário já foi utilizado.' };
      }

      // LADO NEGATIVO REAL: Se clicar sem verificar PGP numa Isca Federal, leva +2 Heat na hora!
      if (p.isFbiHoneyTrap) {
        this.state.claimedLeakIds[pasteId] = true;
        runAuth(() => {
          if (window.currentProfile) {
            window.currentProfile.heat_level = Math.min(5, Number(window.currentProfile.heat_level || 1) + 2);
          }
        });
        this.save();
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
        if (window.internetEngine) window.internetEngine.render();
        const trapMsg = '🚨 CAIU EM ISCA FEDERAL (HONEY-PASTE)! O vazamento era falso da Safenet — seu Heat subiu +2! Sempre verifique o PGP antes!';
        if (typeof window.showToast === 'function') window.showToast(trapMsg);
        return { success: false, fellInTrap: true, message: trapMsg };
      }

      this.state.claimedLeakIds[pasteId] = true;
      if (p.targetIp && window.internetEngine && window.hackedDb) {
        const host = window.internetEngine.resolveHost(p.targetIp);
        if (host && !host.notFound) {
          window.hackedDb.upsertHost({
            ip: host.ip,
            hostname: host.hostname,
            kind: host.kind,
            password: host.rootPassword,
            accessMethod: 'password'
          });
        }
      }
      this.addDirtyMoney(420, pasteId);
      this.save();
      if (window.internetEngine) window.internetEngine.render();
      const okMsg = `🔓 Credencial vazada aplicada! Senha root de ${p.targetIp} salva em Senhas Descobertas + $ 420,00 Sujos extraídos!`;
      if (typeof window.showToast === 'function') window.showToast(okMsg);
      return { success: true, targetIp: p.targetIp, message: okMsg };
    }

    postCustomZeroBinPaste(titleRaw, bodyRaw) {
      this.ensureLoaded();
      const clean = this.getCleanBalance();
      if (clean < 200) {
        return { success: false, message: 'Publicar no ZeroBin custa $ 200 Limpos (taxa de relay anônimo).' };
      }
      // Sanitiza qualquer IP para impedir doxxing!
      const safeTitle = String(titleRaw || 'Nota Anônima').replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, '[IP-REDACTED]').slice(0, 60);
      const safeBody = String(bodyRaw || '').replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, '[IP-REDACTED]').slice(0, 220);
      if (!safeBody.trim()) return { success: false, message: 'Escreva o conteúdo do vazamento.' };

      runAuth(() => {
        window.currentWallet.balance = Math.max(0, +(clean - 200).toFixed(2));
        if (window.currentProfile) window.currentProfile.reputation = Number(window.currentProfile.reputation || 100) + 15;
      });
      this.state.customPastes.unshift({
        title: safeTitle,
        body: safeBody,
        at: new Date().toLocaleTimeString('pt-BR')
      });
      this.state.customPastes = this.state.customPastes.slice(0, 8);
      this.save();
      if (window.internetEngine) window.internetEngine.render();
      return { success: true };
    }

    renderZeroBinPortalHtml() {
      const pastes = this.getHourlyZeroBinPastes();
      const rows = pastes.map((p) => {
        const verified = !!this.state.verifiedLeakIds[p.id];
        const claimed = !!this.state.claimedLeakIds[p.id];
        return `
          <div class="nds-row" style="border-color:${verified && p.isFbiHoneyTrap ? '#e5534b' : '#233246'};">
            <div style="flex:1;min-width:240px;">
              <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                <span class="hc-badge ${p.badgeCls}">${esc(p.badge)}</span>
                <strong style="font-size:13px;">${esc(p.title)}</strong>
                ${verified ? `<span class="hc-badge ${p.isFbiHoneyTrap ? 'danger' : 'success'}">${p.isFbiHoneyTrap ? '⚠️ ARMADILHA POLICIAL!' : '✓ VAZAMENTO VERDADEIRO'}</span>` : ''}
              </div>
              <div style="font-size:12px;color:var(--hc-text-2);margin-top:4px;">${esc(p.body)}</div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${!verified ? `<button type="button" id="btnVerifyPgp_${p.id}" class="hc-btn ghost sm" onclick="window.nineSystemsEngine.verifyZeroBinPgp('${p.id}')">🔍 Checar se é Verdadeiro</button>` : ''}
              ${p.kind === 'cred' && !claimed ? `<button type="button" id="btnExploitLeak_${p.id}" class="hc-btn primary sm" onclick="window.nineSystemsEngine.exploitZeroBinPaste('${p.id}')">Pegar Senha Vazada ↗</button>` : ''}
              ${claimed ? `<span class="hc-badge">Já Usado</span>` : ''}
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="nds-shell">
          <div class="nds-card emerald">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
              <div>
                <span class="hc-badge success">hc://vazamentos · Mural Anônimo de Senhas (185.220.101.77)</span>
                <div style="font-size:12px;color:var(--hc-text-2);margin-top:3px;">
                  Troca a cada <strong>1 hora real</strong>! <strong>⚠️ Cuidado:</strong> a polícia coloca 1 armadilha falsa por hora — sempre clique em <em>Checar se é Verdadeiro</em> antes de pegar a senha!
                </div>
              </div>
            </div>
            ${rows}
            <details class="nds-rules-drawer">
              <summary>📖 Como funciona o Mural de Vazamentos (185.220.101.77)</summary>
              <ol class="nds-rules-list">
                <li><strong>Troca a Cada 1 Hora:</strong> Entram <strong>4 publicações</strong> por hora: 1 Senha Real de Empresa, 1 Armadilha da Polícia, 1 Dica da Bolsa e 1 Dica do Laboratório.</li>
                <li><strong>Checar Antes (Grátis):</strong> Clique em <strong>🔍 Checar se é Verdadeiro</strong> antes de usar! Se for verdadeiro, você pega a senha root e ganha +$ 420 Sujos sem risco. Se descobrir a armadilha da polícia, ganha <strong>+25 REP e +25 pts no mês</strong>!</li>
                <li><strong>O Que Acontece se Pular a Checagem:</strong> Clicar direto em <em>Pegar Senha Vazada</em> numa armadilha falsa sobe <strong>+2 Níveis de Procura na hora</strong>!</li>
                <li><strong>Publicar Dica ($ 200 Limpos):</strong> Custam $ 200 Limpos (+15 REP) e qualquer IP digitado é ocultado automaticamente para evitar perseguição.</li>
              </ol>
            </details>
          </div>
        </div>
      `;
    }

    // =========================================================================
    // RENDERIZAÇÃO DA CENTRAL EMPRESARIAL DE LAVAGEM & P2P (#winLaundering)
    // =========================================================================
    renderP2pMarketSectionHtml() {
      const offers = this.getHourlyP2pOffers();
      if (window.virusLabEngine && typeof window.virusLabEngine.ensureLoaded === 'function') {
        window.virusLabEngine.ensureLoaded();
      }
      const creations = (window.virusLabEngine && window.virusLabEngine.state && window.virusLabEngine.state.creations) || [];
      const firstStrain = creations[0];

      return `
        <div class="nds-card emerald">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
            <div>
              <strong style="font-size:14.5px;">🧬 Alugar ou Vender Vírus do Laboratório (24h a 72h)</strong>
              <div style="font-size:12px;color:var(--hc-text-2);">Alugue vírus fortes com Dinheiro Limpo ou ganhe dinheiro alugando os vírus que você criou no Lab (taxa: 12% a 20%).</div>
            </div>
            ${firstStrain ? `
              <button type="button" id="btnListMyFirstStrainP2p" class="hc-btn primary sm" onclick="window.nineSystemsEngine.listMyStrainOnP2p('${firstStrain.id}', 48, ${Math.max(500, firstStrain.versionInt * 35)})">
                + Colocar "${esc(firstStrain.strainName)}" p/ Alugar (48h)
              </button>
            ` : `<button type="button" class="hc-btn ghost sm" onclick="navTo('winVirusLab')">Criar Vírus no Lab →</button>`}
          </div>

          <div class="nds-pros-cons">
            <div class="nds-pc-box pro"><strong>✅ Lado Bom:</strong> Ganhe dinheiro Limpo com vírus que você criou e não está usando, ou alugue um vírus forte na hora sem esperar 24h do Lab.</div>
            <div class="nds-pc-box con"><strong>⚠️ Limites do Aluguel:</strong> Vírus alugado usa <strong>+20% de Memória RAM</strong> no servidor invadido, <strong>não pode ser revendido</strong> e cada vírus criado só pode ser alugado <strong>2 vezes</strong>!</div>
          </div>
          <details class="nds-rules-drawer">
            <summary>📖 Como funciona o Aluguel de Vírus entre Jogadores</summary>
            <ol class="nds-rules-list">
              <li><strong>Quem Pode Anunciar:</strong> Qualquer vírus criado por você no Laboratório. Cada criação pode ser alugada no máximo <strong>2 vezes</strong>.</li>
              <li><strong>Tempo &amp; Taxa:</strong> Aluguel de <strong>24h reais</strong> desconta <strong>12%</strong>; <strong>48h</strong> desconta <strong>15%</strong>; <strong>72h</strong> desconta <strong>20%</strong>. Pago sempre com <strong>Dinheiro Limpo</strong>.</li>
              <li><strong>Preço Justo:</strong> O jogo define um valor mínimo e máximo conforme a força do vírus para evitar repasse ilegal de dinheiro entre contas.</li>
              <li><strong>Para Quem Aluga:</strong> O vírus alugado ocupa <strong>+20% de RAM</strong> no alvo, não vai para o HD Externo e desliga sozinho quando o tempo acaba.</li>
            </ol>
          </details>

          ${offers.map((o) => `
            <div class="nds-row">
              <div>
                <strong class="mono" style="color:#6ee7b7;">${esc(o.strainName)}.${esc(o.family)} (v${(o.versionInt / 10).toFixed(1)})</strong>
                <span class="hc-badge success" style="margin-left:6px;">Nota ${esc(o.fitGrade)} · Vale por ${o.durationHours}h</span>
                <div style="font-size:11.5px;color:var(--hc-text-2);margin-top:2px;">Criador: <strong>${esc(o.sellerTag)}</strong> · Taxa: ${o.burnTaxPct}%</div>
              </div>
              <div style="display:flex;align-items:center;gap:10px;">
                <strong class="mono">${fmtMoney(o.priceClean)} Limpos</strong>
                ${o.isMine
                  ? `<span class="hc-badge info">Seu Anúncio</span>`
                  : `<button type="button" id="btnBuyP2p_${o.offerId}" class="hc-btn primary sm" onclick="window.nineSystemsEngine.buyP2pLicense('${o.offerId}')">Alugar Vírus</button>`}
              </div>
            </div>
          `).join('')}

          <div style="margin-top:12px;padding-top:10px;border-top:1px solid #1f2a38;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
              <strong style="font-size:13px;color:#fbbf24;">🕶️ Comprar Direto com Dinheiro Sujo (+35% mais caro · Sem polícia)</strong>
              <span class="mono" style="font-size:11.5px;color:#f87171;">Dinheiro Sujo disponível: ${fmtMoney(this.getDirtyBalance())}</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px;">
              <div style="padding:9px 11px;border-radius:8px;background:#090e16;border:1px solid #2b2318;display:flex;flex-direction:column;gap:6px;justify-content:space-between;">
                <div style="font-size:12px;"><strong>Pasta Térmica Prata (-8°C)</strong><br><span style="color:var(--hc-text-3);font-size:11px;">Normal $ 450 Limpos → Aqui $ 610 Sujos</span></div>
                <button type="button" id="btnSmugglePaste" class="hc-btn sm" style="border-color:#f59e0b;color:#fde68a;" onclick="window.nineSystemsEngine.buyBlackmarketSmuggledConsumable('smuggle_paste')">Pagar c/ Sujo ($ 610)</button>
              </div>
              <div style="padding:9px 11px;border-radius:8px;background:#090e16;border:1px solid #2b2318;display:flex;flex-direction:column;gap:6px;justify-content:space-between;">
                <div style="font-size:12px;"><strong>2x Dossiês OSINT Vazados</strong><br><span style="color:var(--hc-text-3);font-size:11px;">Normal $ 800 Limpos → Aqui $ 1.080 Sujos</span></div>
                <button type="button" id="btnSmuggleOsint" class="hc-btn sm" style="border-color:#f59e0b;color:#fde68a;" onclick="window.nineSystemsEngine.buyBlackmarketSmuggledConsumable('smuggle_osint')">Pagar c/ Sujo ($ 1.080)</button>
              </div>
              <div style="padding:9px 11px;border-radius:8px;background:#090e16;border:1px solid #2b2318;display:flex;flex-direction:column;gap:6px;justify-content:space-between;">
                <div style="font-size:12px;"><strong>Exploit Zero-Day 24h</strong><br><span style="color:var(--hc-text-3);font-size:11px;">Normal $ 1.500 Limpos → Aqui $ 2.025 Sujos</span></div>
                <button type="button" id="btnSmuggleCve" class="hc-btn sm" style="border-color:#f59e0b;color:#fde68a;" onclick="window.nineSystemsEngine.buyBlackmarketSmuggledConsumable('smuggle_cve')">Pagar c/ Sujo ($ 2.025)</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    renderLaunderingHub(containerId = 'launderingAppBody') {
      this.ensureLoaded();
      this.processCompletedWashingJobs();
      const el = typeof document !== 'undefined' ? document.getElementById(containerId) : null;
      if (!el) return;

      const clean = this.getCleanBalance();
      const dirty = this.getDirtyBalance();
      const five = this.getCurrentHourFiveCompanies();
      const q = this.getNormalizedAdQueue();
      const curBucket = this.currentHourBucket();
      const minsLeftHour = 60 - new Date().getMinutes();

      let tabBody = '';
      if (this.activeLaunderingTab === 'vitrine') {
        const pendingJobs = this.state.washingJobs.filter((j) => !j.claimed);
        tabBody = `
          ${pendingJobs.length > 0 ? `
            <div class="nds-card amber">
              <strong style="font-size:13px;color:#fbbf24;">⏳ Dinheiro Lavando Agora (15 Minutos da Vida Real):</strong>
              ${pendingJobs.map((j) => {
                const remSec = Math.max(0, Math.ceil((j.completesAt - Date.now()) / 1000));
                const mm = Math.floor(remSec / 60);
                const ss = String(remSec % 60).padStart(2, '0');
                return `
                  <div class="nds-row">
                    <div>
                      <strong>${esc(j.companyName)}</strong> · Enviado: ${fmtMoney(j.grossDirty)} (Taxa ${j.feePct}%) → Vai cair: <strong style="color:#6ee7b7;">${fmtMoney(j.netClean)} Limpos</strong>
                    </div>
                    <span class="mono hc-badge warn">Cai em ${mm}m ${ss}s</span>
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}

          <div class="nds-card emerald">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
              <div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                  <strong style="font-size:14.5px;">🧼 Empresas Abertas Nesta Hora (5 Opções · Troca em ${minsLeftHour}m)</strong>
                  <span class="hc-badge success">🌐 Vitrine Global MMO</span>
                </div>
                <div style="font-size:12px;color:var(--hc-text-2);">Empresas patrocinadas na vitrine aparecem primeiro na rotação horária. Taxa mínima <strong>17%</strong> · <strong>15 min reais</strong>.</div>
              </div>
              <div style="display:flex;align-items:center;gap:6px;">
                <label style="font-size:12px;">Valor p/ Lavar:</label>
                <input type="number" id="launderAmtInput" class="hc-input mono" style="width:125px;height:34px;" min="100" step="500" value="${Math.min(5000, Math.max(500, Math.round(dirty || 2500)))}">
              </div>
            </div>

            ${this.state.myCompany ? `
              <div class="nds-row" style="border-color:#35b877;background:rgba(53,184,119,0.08);">
                <div>
                  <strong style="color:#6ee7b7;">🏢 ${esc(this.state.myCompany.name)} (Sua Empresa · Porte ${this.state.myCompany.tier})</strong>
                  <div style="font-size:11.5px;color:var(--hc-text-2);">Sua taxa interna: só ${LAUNDERING_TIERS[this.state.myCompany.tier].selfTaxPct}% · Limite: ${fmtMoney(LAUNDERING_TIERS[this.state.myCompany.tier].maxBatchUsd)}/vez · 15 min reais</div>
                </div>
                <button type="button" id="btnLaunderOwnCompany" class="hc-btn primary sm" onclick="window.nineSystemsEngine.startLaunderingBatch('MY_OWN_COMPANY', document.getElementById('launderAmtInput')?.value)">Lavar na Minha Empresa</button>
              </div>
            ` : ''}

            <div style="margin:8px 0;padding:10px 12px;border-radius:8px;background:#081119;border:1px solid rgba(56,189,248,0.32);font-size:11.8px;color:var(--hc-text-2);display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
              <div>
                <strong style="color:#7dd3fc;">🎁 Vantagens Extras de Ter Sua Empresa:</strong>
                Porte 1 ($ 50 mil) = <strong>10% desconto em Peças/Fontes + vende até $ 5 mil/dia de BTC Limpo</strong> ·
                Porte 2 ($ 150 mil) = <strong>20% desconto na Internet/VPS + 1 salto grátis na rota</strong> ·
                Porte 3 ($ 400 mil) = <strong>sem taxa de 2% no Banco + Cofre Suíço a 1,5% + $ 15 mil/dia BTC Limpo</strong>!
              </div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                <button type="button" class="hc-btn ghost sm" onclick="navTo('winVirusLab')">🧬 Ganhar $ 18 mil no Lab →</button>
                <button type="button" class="hc-btn ghost sm" onclick="navTo('winOpsHub');window.ecosystemHub.switchTab('stocks');">📉 Lucrar Limpo na Bolsa →</button>
              </div>
            </div>

            ${five.map((c, i) => `
              <div class="nds-row" style="border-color:${c.feePct <= 20 ? 'rgba(53,184,119,0.45)' : (c.feePct >= 45 ? 'rgba(229,83,75,0.4)' : '#1e2938')};">
                <div>
                  <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                    <strong>${i + 1}. ${esc(c.name)}</strong>
                    <span class="hc-badge info">Dono: ${esc(c.ownerTag)}</span>
                    <span class="hc-badge ${c.feePct <= 20 ? 'success' : (c.feePct >= 45 ? 'danger' : 'warn')}">TAXA: ${c.feePct}%</span>
                    <span class="hc-badge info">Porte ${c.tier} · Máx ${fmtMoney(c.maxBatchUsd)}/vez</span>
                  </div>
                  <div style="font-size:11.5px;color:var(--hc-text-2);margin-top:3px;">
                    Tempo de lavagem: <strong>15 min da vida real</strong> · ${c.feePct}% fica de lucro para ${esc(c.ownerTag)}.
                  </div>
                </div>
                <button type="button" id="btnLaunderCo_${i}" class="hc-btn ${c.feePct <= 22 ? 'primary' : 'ghost'} sm" onclick="window.nineSystemsEngine.startLaunderingBatch('${c.id}', document.getElementById('launderAmtInput')?.value)">
                  Lavar Aqui (${c.feePct}%)
                </button>
              </div>
            `).join('')}
          </div>
        `;
      } else if (this.activeLaunderingTab === 'ads') {
        const gSummary = window.mmoGlobalMarket ? window.mmoGlobalMarket.getGlobalAdQueueSummary() : null;
        const hCounts = [0, 1, 2].map((off) => {
          if (window.mmoGlobalMarket) {
            return window.mmoGlobalMarket.getGlobalHourAds(curBucket + off).length;
          }
          return q.filter((a) => a.hourBucket === curBucket + off).length;
        });
        const totalUsed15 = gSummary ? gSummary.totalQueuedNext3h : q.length;
        tabBody = `
          <div class="nds-card amber">
            <strong style="font-size:14.5px;">📢 Fila Global de Anúncios Empresariais (15 Vagas = 3 Horas Reais · $ 10.000 Limpos)</strong>
            <div class="nds-pros-cons">
              <div class="nds-pc-box pro"><strong>✅ Lado Bom:</strong> Coloca sua empresa entre as 5 exibidas da hora para todos os jogadores lavarem com você pagando a taxa que você definir (&ge; 17%)!</div>
              <div class="nds-pc-box con"><strong>⚠️ Lado Negativo:</strong> Se você cobrar uma taxa abusiva (ex.: 65%) e ninguém lavar com você naquela 1h, você <strong>perde os $ 10.000 do anúncio no prejuízo</strong>!</div>
            </div>
            <div class="nds-grid-3">
              <div class="nds-pc-box"><strong>Hora 1 (Agora):</strong> ${hCounts[0]}/5 anúncios de jogadores (+${5 - hCounts[0]} Bots)</div>
              <div class="nds-pc-box"><strong>Hora 2 (+1h..+2h):</strong> ${hCounts[1]}/5 vagas reservadas</div>
              <div class="nds-pc-box"><strong>Hora 3 (+2h..+3h):</strong> ${hCounts[2]}/5 vagas reservadas (Total Fila: ${totalUsed15}/15)</div>
            </div>
            <div class="nds-row">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span style="font-size:12.5px;">Sua Taxa de Lavagem (<strong>Mínimo 17%</strong> · Sem teto máximo):</span>
                <input type="number" id="myCompanyFeeInput" class="hc-input mono" style="width:90px;height:34px;" min="17" value="${this.state.myCompany ? this.state.myCompany.feePct : 19}">
                <span class="mono">%</span>
              </div>
              <button type="button" id="btnBuyAdSlot10k" class="hc-btn primary sm" onclick="window.nineSystemsEngine.purchaseCompanyAdSlot(document.getElementById('myCompanyFeeInput')?.value)">
                📢 Anunciar Minha Empresa ($ 10.000 Limpos)
              </button>
            </div>
          </div>
        `;
      } else if (this.activeLaunderingTab === 'company') {
        const curTier = this.state.myCompany ? this.state.myCompany.tier : 0;
        tabBody = `
          <div class="nds-card emerald">
            <strong style="font-size:14.5px;">🏢 Comprar ou Evoluir Sua Empresa de Fachada (100% Dinheiro Limpo!)</strong>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <span style="font-size:12px;color:var(--hc-text-2);">Nome da sua Empresa:</span>
              <input type="text" id="myCompanyNameInput" class="hc-input" style="width:260px;height:34px;" value="${esc(this.state.myCompany ? this.state.myCompany.name : 'Aurora Lavanderia & Tech S.A.')}">
            </div>
            <div class="nds-grid-3">
              ${[1, 2, 3].map((t) => {
                const td = LAUNDERING_TIERS[t];
                const prevPaid = curTier > 0 && curTier < t ? LAUNDERING_TIERS[curTier].priceClean : 0;
                const cost = td.priceClean - prevPaid;
                const owned = curTier >= t;
                return `
                  <div class="nds-card ${owned ? 'emerald' : ''}">
                    <span class="hc-badge ${t === 1 ? 'success' : (t === 2 ? 'info' : 'warn')}">${td.code}</span>
                    <strong>${esc(td.title)}</strong>
                    <div class="mono" style="font-size:16px;font-weight:800;color:#6ee7b7;">${fmtMoney(td.priceClean)} Limpos</div>
                    <div style="font-size:12px;color:var(--hc-text-2);">
                      • Limite por vez/jogador: <strong>${fmtMoney(td.maxBatchUsd)}</strong><br>
                      • Tempo p/ lavar: <strong>15 min da vida real</strong><br>
                      • Alvará às 12:00 (Contrapeso): <strong>${fmtMoney(td.noonPermitFee)}/mês</strong>
                    </div>
                    <button type="button" id="btnBuyCompanyTier_${t}" class="hc-btn ${owned ? 'ghost' : 'primary'} sm" ${owned ? 'disabled' : ''} onclick="window.nineSystemsEngine.buyOrUpgradeOwnCompany(${t}, document.getElementById('myCompanyNameInput')?.value)">
                      ${owned ? '✓ Porte Adquirido' : (curTier > 0 ? `Evoluir (${fmtMoney(cost)} Limpos)` : `Comprar (${fmtMoney(cost)} Limpos)`)}
                    </button>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="nds-card crimson">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
                <div>
                  <strong style="color:#fca5a5;">🚨 Risco Real: O Que Acontece Se Você Tentar Gastar Dinheiro Sujo Sem Lavar!</strong>
                  <div style="font-size:12px;color:var(--hc-text-2);margin-top:3px;">
                    Status atual da Polícia: <strong>${this.state.dirtyTailStrikes > 0 ? '🚨 NA SUA COLA (Próximo gasto sujo = PRISÃO IMEDIATA!)' : 'Sem rastreio de notas marcadas'}</strong>
                  </div>
                </div>
                <button type="button" id="btnTrySpendDirtyRisk" class="hc-btn sm" style="border-color:var(--hc-danger);color:var(--hc-danger-text);" onclick="window.nineSystemsEngine.attemptSpendDirtyMoney(500, 'Compra Clandestina s/ Nota')">
                  ⚠️ Arriscar Gastar $ 500 Sujos Direto
                </button>
              </div>
            </div>
          </div>
        `;
      } else {
        tabBody = this.renderP2pMarketSectionHtml();
      }

      el.innerHTML = `
        <div class="nds-shell">
          <div class="nds-dual-wallet">
            <div class="nds-wallet-box clean">
              <span style="font-size:11px;color:#6ee7b7;font-weight:700;text-transform:uppercase;">💵 Dinheiro Limpo &amp; Legalizado</span>
              <strong class="mono" style="font-size:22px;color:#6ee7b7;">${fmtMoney(clean)}</strong>
              <span style="font-size:11.5px;color:var(--hc-text-2);">Aceito p/ Comprar Empresa ($50K+), Anunciar ($10K), Licenças P2P e Hardware!</span>
            </div>
            <div class="nds-wallet-box dirty">
              <span style="font-size:11px;color:#fca5a5;font-weight:700;text-transform:uppercase;">🩸 Dinheiro Sujo (De Invasões &amp; Saques)</span>
              <strong class="mono" style="font-size:22px;color:#fca5a5;">${fmtMoney(dirty)}</strong>
              <span style="font-size:11.5px;color:#fbbf24;">Obrigatório lavar em 1 das 5 empresas (15 min reais). Gastar sujo = Polícia na cola &amp; Prisão!</span>
            </div>
          </div>

          <div class="nds-tabs">
            <button type="button" id="ndsTab_vitrine" class="nds-tab-btn ${this.activeLaunderingTab === 'vitrine' ? 'active' : ''}" onclick="window.nineSystemsEngine.activeLaunderingTab='vitrine'; window.nineSystemsEngine.renderLaunderingHub();">🧼 Vitrine 5 Empresas/1h</button>
            <button type="button" id="ndsTab_ads" class="nds-tab-btn ${this.activeLaunderingTab === 'ads' ? 'active' : ''}" onclick="window.nineSystemsEngine.activeLaunderingTab='ads'; window.nineSystemsEngine.renderLaunderingHub();">📢 Anunciar ($10K · ${q.length}/15 Vagas)</button>
            <button type="button" id="ndsTab_company" class="nds-tab-btn ${this.activeLaunderingTab === 'company' ? 'active' : ''}" onclick="window.nineSystemsEngine.activeLaunderingTab='company'; window.nineSystemsEngine.renderLaunderingHub();">🏢 3 Portes ($50K/$150K/$400K) &amp; Risco</button>
            <button type="button" id="ndsTab_p2p" class="nds-tab-btn ${this.activeLaunderingTab === 'p2p' ? 'active' : ''}" onclick="window.nineSystemsEngine.activeLaunderingTab='p2p'; window.nineSystemsEngine.renderLaunderingHub();">🧬 Mercado P2P (Cepas do Lab)</button>
          </div>

          <details class="nds-rules-drawer">
            <summary>📖 Regras Completas da Lavagem de Dinheiro (Moeda, 3 Portes, 5/1h, 15 Vagas $10K, 15 Min &amp; Prisão)</summary>
            <ol class="nds-rules-list">
              <li><strong>Dinheiro Sujo vs. Limpo:</strong> Drenos de servidores (&ge; $ 100), bancos NPC/Bots, Hijacks e ZeroBin caem como <strong>Dinheiro Sujo</strong>. Comprar empresa, anunciar ($ 10K), licenças P2P e peças aceitam <strong>100% Dinheiro Limpo</strong> — no início você obrigatoriamente lava nas empresas de outros jogadores/Bots!</li>
              <li><strong>Os 3 Portes (100% Dinheiro Limpo):</strong> <strong>Porte 1 ($ 50.000)</strong> lava até <strong>$ 5.000/vez</strong> por jogador (alvará $ 250 às 12h); <strong>Porte 2 ($ 150.000)</strong> lava até <strong>$ 15.000/vez</strong> (alvará $ 600); <strong>Porte 3 ($ 400.000)</strong> lava até <strong>$ 50.000/vez</strong> (alvará $ 1.400). Evoluir cobra só a diferença!</li>
              <li><strong>Espera Real &amp; Trava por Empresa:</strong> Cada lote leva exatos <strong>15 minutos da vida real</strong> p/ limpar, e cada empresa só processa 1 remessa ativa sua por vez (mas você pode usar outras das 5 empresas simultaneamente).</li>
              <li><strong>Vitrine 5/Hora &amp; Fila de 15 Vagas ($ 10.000 = 3h Reais):</strong> A cada <strong>1h real</strong> aparecem <strong>5 empresas diferentes</strong> (anúncios de jogadores + Bots preenchendo vagas livres). Anunciar sua empresa custa <strong>$ 10.000 Limpos</strong> na fila de <strong>15 vagas</strong> (3h × 5 empresas).</li>
              <li><strong>Taxa Livre (&ge; 17% s/ Teto) &amp; Prisão:</strong> Piso obrigatório de <strong>17%</strong> e sem teto máximo (cobrar caro demais afasta clientes e perde os $ 10K do anúncio!). Tentar gastar Dinheiro Sujo direto: <strong>1ª vez = Polícia na cola (Heat 4/5)</strong>; <strong>2ª vez (ou 1ª c/ Sterling) = Prisão Federal</strong> (confisca o valor sujo, tira -15% pts da Temporada e tranca 60s até pagar Fiança Limpa).</li>
            </ol>
          </details>

          ${tabBody}
        </div>
      `;
    }

    // =========================================================================
    // OVERLAYS GLOBAIS (POPOVER DEFESA 15S + CELA DE CUSTÓDIA FEDERAL + HUD CHIPS)
    // =========================================================================
    mountGlobalOverlays() {
      if (typeof document === 'undefined') return;
      const mount = () => {
        if (!document.getElementById('hcActiveDefensePopover')) {
          const pop = document.createElement('div');
          pop.id = 'hcActiveDefensePopover';
          pop.className = 'hc-defense-popover';
          document.body.appendChild(pop);
        }
        if (!document.getElementById('hcJailOverlay')) {
          const jail = document.createElement('div');
          jail.id = 'hcJailOverlay';
          jail.className = 'hc-jail-overlay';
          document.body.appendChild(jail);
        }
        this.syncHudBadges();
        this.syncJailOverlay();
      };
      if (document.body) mount();
      else window.addEventListener('DOMContentLoaded', mount);
    }

    renderDefensePopoverDom() {
      const pop = typeof document !== 'undefined' ? document.getElementById('hcActiveDefensePopover') : null;
      if (!pop) return;
      const a = this.activeDefenseAlert;
      if (!a) {
        pop.classList.remove('open');
        pop.innerHTML = '';
        return;
      }
      const remMs = Math.max(0, a.expiresAt - Date.now());
      const maxMs = Math.max(1000, Number(a.windowSeconds || 15) * 1000);
      const pct = Math.min(100, Math.round((remMs / maxMs) * 100));
      const sacVps = (window.lanServersEngine && typeof window.lanServersEngine.getSacrificeableVps === 'function')
        ? window.lanServersEngine.getSacrificeableVps()
        : null;
      pop.classList.add('open');
      pop.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
          <strong style="color:#fca5a5;font-size:13.5px;">🚨 ALGUÉM ESTÁ INVADINDO SEU PC!</strong>
          <span class="mono hc-badge danger">${(remMs / 1000).toFixed(1)}s</span>
        </div>
        <div style="font-size:12px;color:#e2e8f0;">
          Invasor: <code class="mono">${esc(a.attackerIp)}</code> (${esc(a.alias)}) · Escolha rápido o que fazer:
        </div>
        <div class="hc-def-bar-track"><div class="hc-def-bar-fill" style="width:${pct}%;"></div></div>
        <div style="display:flex;flex-direction:column;gap:7px;">
          <button type="button" id="btnDefCutCable" class="hc-choice-row danger-opt" style="padding:8px 11px;"
            onclick="window.nineSystemsEngine.respondActiveDefense('cut_cable')">
            <span class="hc-choice-main">
              <span class="hc-choice-title" style="color:#fca5a5;">✂️ 1. Cortar Cabo de Rede (Grátis)</span>
              <span class="hc-choice-desc">Expulsa o invasor na hora, mas pausa sua internet por 15s.</span>
            </span>
            <span class="hc-choice-cta" style="color:#fca5a5;">Cortar</span>
          </button>

          <button type="button" id="btnDefHoneypot" class="hc-choice-row warn-opt" style="padding:8px 11px;${!sacVps ? 'opacity:0.6;' : ''}"
            onclick="window.nineSystemsEngine.respondActiveDefense('honeypot')">
            <span class="hc-choice-main">
              <span class="hc-choice-title" style="color:#fde68a;">${sacVps ? `🔥 2. Jogar Ataque p/ ${esc(sacVps.label)} (Perde a VPS!)` : '🔒 2. Jogar Ataque p/ VPS (Compre 1 VPS antes)'}</span>
              <span class="hc-choice-desc">${sacVps ? 'Salva seu PC e descobre o IP dele, MAS destrói essa VPS de vez!' : 'Exige ter uma VPS ($ 2.500+) para sacrificar no desvio.'}</span>
            </span>
            <span class="hc-choice-cta" style="color:#fde68a;">${sacVps ? 'Desviar' : 'Sem VPS'}</span>
          </button>

          <button type="button" id="btnDefEmp" class="hc-choice-row info-opt" style="padding:8px 11px;"
            onclick="window.nineSystemsEngine.respondActiveDefense('emp_pulse')">
            <span class="hc-choice-main">
              <span class="hc-choice-title" style="color:#7dd3fc;">⚡ 3. Dar Choque Reverso (+12°C no PC)</span>
              <span class="hc-choice-desc">Derruba a conexão dele na hora, mas esquenta seu PC por 1 min.</span>
            </span>
            <span class="hc-choice-cta" style="color:#7dd3fc;">Choque</span>
          </button>
        </div>
      `;
    }

    syncJailOverlay() {
      if (typeof document === 'undefined' || !this.state) return;
      const jail = document.getElementById('hcJailOverlay');
      if (!jail) return;
      const js = this.state.jailState;
      if (!js || !js.jailed) {
        jail.classList.remove('active');
        jail.innerHTML = '';
        return;
      }
      if (Date.now() >= js.releaseAt) {
        js.jailed = false;
        this.state.dirtyTailStrikes = 0;
        this.save(true);
        jail.classList.remove('active');
        return;
      }
      const remS = Math.max(1, Math.ceil((js.releaseAt - Date.now()) / 1000));
      const del = this.getActiveDelegate();
      jail.classList.add('active');
      jail.innerHTML = `
        <div class="hc-jail-card">
          <span class="hc-badge danger" style="align-self:flex-start;">🚔 PRESO PELA POLÍCIA FEDERAL</span>
          <h2 style="font-size:20px;color:#fff;margin:0;">Você Foi Preso por Gastar Dinheiro Sujo!</h2>
          <p style="font-size:13px;color:#e2e8f0;margin:0;">${esc(js.reason)}</p>
          <div style="padding:10px 12px;background:#1f1418;border:1px solid #4a232b;border-radius:8px;font-size:12.5px;color:#fca5a5;">
            • Dinheiro Sujo tomado pela polícia: <strong>${fmtMoney(js.confiscatedUsd)}</strong><br>
            • Perda nos pontos do mês: <strong>-15%</strong> (sua conta e peças continuam 100% salvas!)<br>
            • Solto automaticamente em: <strong class="mono">${remS}s</strong>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end;">
            <button type="button" id="btnPayCleanBail" class="hc-btn primary" onclick="window.nineSystemsEngine.payCleanBail()">
              💵 Pagar Fiança e Sair Agora (${fmtMoney(del.bailCostClean)} Limpos)
            </button>
          </div>
        </div>
      `;
    }

    syncHudBadges() {
      if (typeof document === 'undefined' || !this.state) return;
      const walletEl = document.getElementById('hudWalletMoney') || document.getElementById('hudBalance');
      const anchorMetric = walletEl ? (walletEl.closest('.topbar-metric') || walletEl.parentElement) : null;
      if (anchorMetric && anchorMetric.parentElement) {
        let dirtyChip = document.getElementById('hudDirtyCashBadge');
        if (!dirtyChip) {
          dirtyChip = document.createElement('span');
          dirtyChip.id = 'hudDirtyCashBadge';
          dirtyChip.className = 'hud-dirty-chip';
          dirtyChip.title = 'Dinheiro Sujo — clique para abrir Empresas de Lavagem!';
          dirtyChip.onclick = (ev) => {
            ev.stopPropagation();
            if (typeof window.navTo === 'function') window.navTo('winLaundering');
          };
          anchorMetric.insertAdjacentElement('afterend', dirtyChip);
        }
        const d = this.getDirtyBalance();
        dirtyChip.style.display = d > 0 ? 'inline-flex' : 'none';
        dirtyChip.textContent = `🩸 Sujo: $${Math.round(d).toLocaleString('pt-BR')}`;

        let tempChip = document.getElementById('hudTempBadge');
        if (!tempChip) {
          tempChip = document.createElement('span');
          tempChip.id = 'hudTempBadge';
          tempChip.className = 'hud-temp-chip';
          tempChip.title = 'Temperatura física da CPU — clique para abrir Refrigeração!';
          tempChip.onclick = (ev) => {
            ev.stopPropagation();
            if (typeof window.navTo === 'function') window.navTo('winHardware');
          };
          dirtyChip.insertAdjacentElement('afterend', tempChip);
        }
        const tel = this.getLiveThermalTelemetry();
        tempChip.className = 'hud-temp-chip' + (tel.throttling ? ' throttle' : (tel.tempC >= 65 ? ' hot' : ''));
        tempChip.textContent = `🌡️ ${tel.tempC}°C`;
      }
    }

    getMyCompanyNoonPermitFee() {
      this.ensureLoaded();
      if (!this.state.myCompany) return 0;
      const td = LAUNDERING_TIERS[this.state.myCompany.tier];
      return td ? td.noonPermitFee : 0;
    }

    startEngineLoop() {
      if (typeof window === 'undefined') return;
      if (this._mainTimer) clearInterval(this._mainTimer);
      this._mainTimer = setInterval(() => {
        if (!window.currentProfile) return;
        this.processCompletedWashingJobs();
        this.syncJailOverlay();
        this.syncHudBadges();
        if (window.winManager && window.winManager.current === 'winLaundering') {
          this.renderLaunderingHub();
        }
      }, 3000);
    }
  }

  window.nineSystemsEngine = new NineDeepSystemsEngine();
})();
