/**
 * Hacker City // Motor do Mercado Global MMO (Sincronia Real Entre Jogadores)
 *
 * Conecta as 5 vitrines econômicas do jogo entre todos os jogadores:
 *  1. Vitrine Global de Lavagem (5 Empresas/Hora + Fila Real de 15 Vagas + Bots completando vagas livres)
 *  2. Bolsa CyberStock Unificada (8 Empresas c/ Piso 30%, Teto 220% e Circuit Breaker de 10 min)
 *  3. Leilão Global de 2h (Estorno instantâneo via Caixa de Recebimentos + Anti-Sniping +30s máx 5x)
 *  4. Aluguel Atômico de Vírus P2P (Trava ALREADY_SOLD sem cobrar 2º clique + pagamento ao criador via Inbox)
 *  5. Mural do Fórum c/ Reserva Exclusiva de 30m + Cancelamento de Contrato Aberto (estorna prêmio, retém taxa 15%)
 *
 * Arquitetura Anti-Bug:
 *  - ZERO sobrescrita de save de terceiros: pagamentos entre jogadores vão sempre para `walletInbox`
 *    (espelhado em `public.hc_wallet_inbox` no Supabase) e são resgatados pela própria sessão do dono
 *    dentro de `window.integrityGuard.runAuthorized(...)`.
 *  - Sincronia instantânea multi-aba/multi-sessão via `HC_GLOBAL_SHARED_MARKET_V1` + `BroadcastChannel`
 *    + sincronia assíncrona não-bloqueante com RPCs `SECURITY DEFINER` e Realtime no Supabase Cloud.
 */
(function () {
  const SHARED_STORAGE_KEY = 'HC_GLOBAL_SHARED_MARKET_V1';
  const CHANNEL_NAME = 'hc_global_economy_bus_v1';

  const DEFAULT_CORPS = [
    { symbol: 'FARO', name: 'Farofa Systems B2B', ip: '203.17.88.40', basePrice: 42.00 },
    { symbol: 'MRDN', name: 'Meridian BioLabs', ip: '194.88.14.202', basePrice: 68.50 },
    { symbol: 'AEGS', name: 'Aegis Security Corp', ip: '172.66.40.18', basePrice: 54.00 },
    { symbol: 'CRVO', name: 'Corvo Cinza Logística', ip: '58.40.12.9', basePrice: 37.20 },
    { symbol: 'KRNO', name: 'KronoTech Sistemas', ip: '189.40.7.12', basePrice: 92.00 },
    { symbol: 'OMNI', name: 'OmniDyne Defense', ip: '192.99.44.80', basePrice: 148.00 },
    { symbol: 'HEBC', name: 'HEBC Clearing Bank', ip: '77.3.10.44', basePrice: 116.00 },
    { symbol: 'EVIL', name: 'EvilCorp Conglomerate', ip: '209.141.55.10', basePrice: 215.00 }
  ];

  function runAuth(fn) {
    if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
      return window.integrityGuard.runAuthorized(fn);
    }
    return fn();
  }

  function buildDefaultStocks() {
    const map = {};
    DEFAULT_CORPS.forEach((c) => {
      const p0 = +(c.basePrice * 0.99).toFixed(2);
      const p1 = +(c.basePrice * 1.01).toFixed(2);
      map[c.symbol] = {
        symbol: c.symbol,
        name: c.name,
        ip: c.ip,
        basePrice: c.basePrice,
        price: c.basePrice,
        integrity: 100.0,
        momentum: 0,
        history: [c.basePrice, p0, p1, c.basePrice],
        recentDropsCount: 0,
        lastDropWindowAt: 0,
        circuitBreakerUntil: 0,
        lastActorTag: null,
        updatedAt: Date.now()
      };
    });
    return map;
  }

  function createEmptySharedLedger() {
    return {
      version: 1,
      txIds: {},
      pairDailyLimits: {},
      walletInbox: [],
      companies: {},
      companyAds: [],
      stocks: buildDefaultStocks(),
      auctions: {},
      p2pOffers: [],
      escrowContracts: [],
      sponsoredAlertLog: [],
      updatedAt: Date.now()
    };
  }

  class MmoGlobalMarketEngine {
    constructor() {
      this.bus = null;
      this.supaChannel = null;
      this.cloudRpcSupported = true;
      this.recentClaimedHistory = [];
      this._pollTimer = null;
      this.initRealtimeListeners();
    }

    getActorIdentity() {
      const prof = window.currentProfile || null;
      const tag = (prof && prof.hacker_tag) ? String(prof.hacker_tag) : 'Operador';
      const id = (prof && (prof.id || prof.user_id || prof.hacker_tag)) ? String(prof.id || prof.user_id || prof.hacker_tag) : tag;
      return { id, tag };
    }

    isUuid(str) {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(str || ''));
    }

    getDayKey() {
      return new Date().toISOString().slice(0, 10);
    }

    getCurrentHourBucket() {
      return Math.floor(Date.now() / (60 * 60 * 1000));
    }

    readShared() {
      try {
        const raw = localStorage.getItem(SHARED_STORAGE_KEY);
        let parsed = raw ? JSON.parse(raw) : null;
        if (this._memLedger && (!parsed || Number(this._memLedger.updatedAt || 0) > Number(parsed.updatedAt || 0))) {
          parsed = JSON.parse(JSON.stringify(this._memLedger));
        }
        if (!parsed || typeof parsed !== 'object') return createEmptySharedLedger();
        if (!parsed.txIds) parsed.txIds = {};
        if (!parsed.pairDailyLimits) parsed.pairDailyLimits = {};
        if (!Array.isArray(parsed.walletInbox)) parsed.walletInbox = [];
        if (!parsed.companies) parsed.companies = {};
        if (!Array.isArray(parsed.companyAds)) parsed.companyAds = [];
        if (!parsed.stocks) parsed.stocks = buildDefaultStocks();
        DEFAULT_CORPS.forEach((c) => {
          if (!parsed.stocks[c.symbol]) {
            parsed.stocks[c.symbol] = buildDefaultStocks()[c.symbol];
          }
        });
        if (!parsed.auctions) parsed.auctions = {};
        if (!Array.isArray(parsed.p2pOffers)) parsed.p2pOffers = [];
        if (!Array.isArray(parsed.escrowContracts)) parsed.escrowContracts = [];
        if (!Array.isArray(parsed.sponsoredAlertLog)) parsed.sponsoredAlertLog = [];
        return parsed;
      } catch (e) {
        return createEmptySharedLedger();
      }
    }

    writeShared(ledger, eventType, payload) {
      try {
        // Mescla atômica contra condição de corrida entre abas: preserva itens já marcados claimed=true e novos itens de outras abas!
        const rawLatest = localStorage.getItem(SHARED_STORAGE_KEY);
        if (rawLatest) {
          try {
            const latest = JSON.parse(rawLatest);
            if (latest && Array.isArray(latest.walletInbox) && Array.isArray(ledger.walletInbox)) {
              const latestById = new Map();
              latest.walletInbox.forEach((it) => { if (it && it.id) latestById.set(it.id, it); });
              const curIds = new Set();
              ledger.walletInbox.forEach((it) => {
                if (!it || !it.id) return;
                curIds.add(it.id);
                const prev = latestById.get(it.id);
                if (prev && prev.claimed) {
                  it.claimed = true;
                  it.claimedAt = prev.claimedAt || it.claimedAt;
                }
              });
              latest.walletInbox.forEach((it) => {
                if (it && it.id && !curIds.has(it.id)) {
                  ledger.walletInbox.push(it);
                }
              });
            }
          } catch (e2) {}
        }

        ledger.updatedAt = Date.now();
        // Compacta histórico de transações antigas (> 400 chaves)
        const txKeys = Object.keys(ledger.txIds || {});
        if (txKeys.length > 450) {
          txKeys.slice(0, txKeys.length - 300).forEach((k) => delete ledger.txIds[k]);
        }
        // Compacta inbox antigo já resgatado (> 120 itens)
        if (Array.isArray(ledger.walletInbox) && ledger.walletInbox.length > 160) {
          const unclaimed = ledger.walletInbox.filter((i) => !i.claimed);
          const claimedRecent = ledger.walletInbox.filter((i) => i.claimed).slice(-80);
          ledger.walletInbox = unclaimed.concat(claimedRecent);
        }
        this._memLedger = JSON.parse(JSON.stringify(ledger));
        localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(ledger));
      } catch (e) {}
      this.broadcastEvent(eventType || 'ledger_sync', payload || {}, ledger);
    }

    broadcastEvent(type, payload, ledgerSnapshot) {
      if (this.bus) {
        try {
          this.bus.postMessage({
            type,
            payload,
            ledger: ledgerSnapshot || null,
            ts: Date.now()
          });
        } catch (e) {}
      }
    }

    initRealtimeListeners() {
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          this.bus = new BroadcastChannel(CHANNEL_NAME);
          this.bus.onmessage = (ev) => {
            const data = ev && ev.data ? ev.data : null;
            if (data && data.ledger && typeof data.ledger === 'object') {
              if (!this._memLedger || Number(data.ledger.updatedAt || 0) >= Number(this._memLedger.updatedAt || 0)) {
                this._memLedger = data.ledger;
                try {
                  localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(data.ledger));
                } catch (e) {}
              }
            }
            this.handleExternalMarketSync(data);
          };
        } catch (e) {}
      }

      if (typeof window !== 'undefined') {
        window.addEventListener('storage', (ev) => {
          if (ev && ev.key === SHARED_STORAGE_KEY) {
            this.handleExternalMarketSync({ type: 'storage_sync' });
          }
        });

        this._pollTimer = setInterval(() => {
          if (window.currentProfile && window.currentWallet) {
            this.claimMyInboxPayouts();
          }
        }, 2500);

        setTimeout(() => this.tryAttachSupabaseRealtime(), 1800);
      }
    }

    async tryAttachSupabaseRealtime() {
      const sb = window.supabase;
      if (!sb || typeof sb.channel !== 'function' || this.supaChannel) return;
      try {
        const { data } = sb.auth ? await sb.auth.getSession() : { data: null };
        if (!data || !data.session) return;
        this.supaChannel = sb
          .channel('hc-global-economy-v1')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'global_cyberstock_tickers' }, () => {
            this.pullCloudStocksSilent();
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'hc_wallet_inbox' }, () => {
            this.claimCloudInboxSilent();
          })
          .subscribe();
      } catch (e) {}
    }

    handleExternalMarketSync(msg) {
      if (window.currentProfile && window.currentWallet) {
        this.claimMyInboxPayouts();
      }
      // Alerta se ação patrocinada pelo clã sofreu ataque
      if (msg && msg.type === 'stock_impact' && msg.payload && msg.payload.deltaPct < 0) {
        this.notifyIfMySponsoredCompanyAttacked(msg.payload);
      }
      this.refreshOpenMarketWindows();
    }

    notifyIfMySponsoredCompanyAttacked(payload) {
      if (!window.topTenMechanics || !window.topTenMechanics.state) return;
      const sp = window.topTenMechanics.state.clanSponsorship || window.topTenMechanics.state.clanSponsor;
      if (sp && (sp.status === 'active' || sp.active) && sp.corpSymbol === payload.symbol) {
        const me = this.getActorIdentity();
        if (payload.actorTag && payload.actorTag === me.tag) return;
        if (typeof window.showToast === 'function') {
          window.showToast(`🚨 ALERTA DO CLÃ: @${payload.actorTag || 'Invasor'} atacou ${payload.symbol} (sua empresa patrocinada)! Use 🛡️ Defender na Bolsa antes das 12h!`);
        }
      }
    }

    refreshOpenMarketWindows() {
      const isVisible = (id) => {
        const el = document.getElementById(id);
        return !!(el && el.style.display !== 'none' && el.offsetParent !== null);
      };
      try {
        if (isVisible('winLaundering') && window.nineSystemsEngine) {
          window.nineSystemsEngine.renderLaunderingHub();
        }
        if (isVisible('winOpsHub') && window.ecosystemHub) {
          window.ecosystemHub.syncStocksFromGlobalMarket(true);
          window.ecosystemHub.renderUI();
        }
        if (isVisible('winVirusLab') && window.nineSystemsEngine && typeof window.renderVirusLab === 'function') {
          window.renderVirusLab();
        }
        if (isVisible('winForum') && window.darknetSocialEngine && typeof window.darknetSocialEngine.renderForumUI === 'function') {
          window.darknetSocialEngine.renderForumUI();
        }
      } catch (e) {}
    }

    // =========================================================================
    // 1. IDEMPOTÊNCIA E TRAVAS DIÁRIAS ANTI-CONTA-FAKE (DUPLA DE JOGADORES)
    // =========================================================================
    generateTxId(prefix) {
      return `${prefix || 'tx'}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    hasProcessedTx(txId) {
      if (!txId) return false;
      const ledger = this.readShared();
      return !!ledger.txIds[txId];
    }

    markTxProcessed(txId) {
      if (!txId) return;
      const ledger = this.readShared();
      ledger.txIds[txId] = Date.now();
      this.writeShared(ledger);
    }

    getPairDailyKey(actorId, counterpartyId, kind) {
      const a = String(actorId || '').toLowerCase();
      const b = String(counterpartyId || '').toLowerCase();
      return `${this.getDayKey()}::${a}::${b}::${kind}`;
    }

    canUsePairDailyLimit(actorId, counterpartyId, kind, maxPerDay) {
      if (!actorId || !counterpartyId || String(actorId) === String(counterpartyId)) {
        return { ok: true, hits: 0, maxPerDay };
      }
      const ledger = this.readShared();
      const key = this.getPairDailyKey(actorId, counterpartyId, kind);
      const hits = Number(ledger.pairDailyLimits[key] || 0);
      return {
        ok: hits < maxPerDay,
        hits,
        maxPerDay,
        remaining: Math.max(0, maxPerDay - hits)
      };
    }

    incrementPairDailyLimit(actorId, counterpartyId, kind) {
      if (!actorId || !counterpartyId || String(actorId) === String(counterpartyId)) return 0;
      const ledger = this.readShared();
      const key = this.getPairDailyKey(actorId, counterpartyId, kind);
      const next = Number(ledger.pairDailyLimits[key] || 0) + 1;
      ledger.pairDailyLimits[key] = next;
      this.writeShared(ledger);
      return next;
    }

    // =========================================================================
    // 2. CAIXA DE RECEBIMENTOS ASSÍNCRONA (hc_wallet_inbox — ZERO CONFLITO SAVE)
    // =========================================================================
    enqueueInboxPayout(opts) {
      if (!opts || (!opts.recipientId && !opts.recipientTag)) return null;
      const clean = Math.max(0, +(Number(opts.amountClean || 0)).toFixed(2));
      const dirty = Math.max(0, Math.round(Number(opts.amountDirty || 0)));
      if (clean <= 0 && dirty <= 0) return null;

      const ledger = this.readShared();
      const entry = {
        id: 'inbx_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        recipientId: opts.recipientId ? String(opts.recipientId) : null,
        recipientTag: opts.recipientTag ? String(opts.recipientTag) : null,
        senderId: opts.senderId ? String(opts.senderId) : null,
        senderTag: opts.senderTag ? String(opts.senderTag) : 'Sistema MMO',
        kind: opts.kind || 'LAUNDER_COMMISSION',
        amountClean: clean,
        amountDirty: dirty,
        note: String(opts.note || 'Recebimento do Mercado Global'),
        claimed: false,
        createdAt: Date.now()
      };
      ledger.walletInbox.push(entry);
      this.writeShared(ledger, 'inbox_enqueued', {
        recipientId: entry.recipientId,
        recipientTag: entry.recipientTag,
        kind: entry.kind
      });

      // Se o próprio destinatário estiver ativo nesta sessão, já resgata na hora
      if (window.currentProfile && window.currentWallet) {
        const me = this.getActorIdentity();
        if (
          (entry.recipientId && entry.recipientId === me.id) ||
          (entry.recipientTag && entry.recipientTag.toLowerCase() === me.tag.toLowerCase())
        ) {
          this.claimMyInboxPayouts();
        }
      }
      return entry;
    }

    getRecipientClaimedSet(recipientKey) {
      if (!this._claimedByRecipient) this._claimedByRecipient = {};
      const k = String(recipientKey || 'default');
      if (!this._claimedByRecipient[k]) {
        const set = new Set();
        try {
          const raw = localStorage.getItem('HC_MMO_CLAIMED_IDS_V1_' + k);
          if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) arr.forEach((id) => set.add(id));
          }
        } catch (e) {}
        this._claimedByRecipient[k] = set;
      }
      return this._claimedByRecipient[k];
    }

    persistRecipientClaimedSet(recipientKey) {
      const k = String(recipientKey || 'default');
      const set = this.getRecipientClaimedSet(k);
      try {
        const arr = Array.from(set).slice(-300);
        localStorage.setItem('HC_MMO_CLAIMED_IDS_V1_' + k, JSON.stringify(arr));
      } catch (e) {}
    }

    claimMyInboxPayouts() {
      if (!window.currentProfile || !window.currentWallet) {
        return { claimedCount: 0, totalClean: 0, totalDirty: 0, items: [] };
      }
      const me = this.getActorIdentity();
      const myClaimedSet = this.getRecipientClaimedSet(me.id);
      const ledger = this.readShared();
      const mine = ledger.walletInbox.filter((item) => {
        if (!item || item.claimed || myClaimedSet.has(item.id)) return false;
        if (item.recipientId && item.recipientId === me.id) return true;
        if (item.recipientTag && item.recipientTag.toLowerCase() === me.tag.toLowerCase()) return true;
        return false;
      });

      if (mine.length === 0) {
        return { claimedCount: 0, totalClean: 0, totalDirty: 0, items: [] };
      }

      let totalClean = 0;
      let totalDirty = 0;
      mine.forEach((item) => {
        item.claimed = true;
        item.claimedAt = Date.now();
        myClaimedSet.add(item.id);
        totalClean += Number(item.amountClean || 0);
        totalDirty += Number(item.amountDirty || 0);
        this.recentClaimedHistory.unshift({ ...item });
      });
      this.persistRecipientClaimedSet(me.id);
      if (this.recentClaimedHistory.length > 20) this.recentClaimedHistory.length = 20;

      totalClean = +(totalClean.toFixed(2));
      totalDirty = Math.round(totalDirty);
      this.writeShared(ledger);

      runAuth(() => {
        if (totalClean > 0 && window.currentWallet) {
          window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + totalClean).toFixed(2);
        }
      });
      if (totalDirty > 0 && window.nineSystemsEngine && typeof window.nineSystemsEngine.addDirtyMoney === 'function') {
        window.nineSystemsEngine.addDirtyMoney(totalDirty, 'Recebimento Mercado Global');
      }

      if (window.onlineEngine && typeof window.onlineEngine.saveLocalSnapshotImmediate === 'function') {
        window.onlineEngine.saveLocalSnapshotImmediate();
      }
      if (typeof window.updateHudDisplays === 'function') {
        window.updateHudDisplays();
      }
      if (typeof window.showToast === 'function') {
        const last = mine[mine.length - 1];
        const cleanLabel = totalClean > 0 ? `+$ ${totalClean.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Limpos` : '';
        const dirtyLabel = totalDirty > 0 ? `${cleanLabel ? ' e ' : ''}+$ ${totalDirty.toLocaleString('pt-BR')} Sujos` : '';
        window.showToast(`📬 Caixa MMO: ${cleanLabel}${dirtyLabel} — ${last.note}`);
      }

      return { claimedCount: mine.length, totalClean, totalDirty, items: mine };
    }

    async claimCloudInboxSilent() {
      if (!this.cloudRpcSupported || !window.supabase || typeof window.supabase.rpc !== 'function') return;
      try {
        const { data, error } = await window.supabase.rpc('rpc_claim_wallet_inbox');
        if (error) {
          this.cloudRpcSupported = false;
          return;
        }
        if (data && data.success && Number(data.clean_added || 0) > 0 && window.currentWallet) {
          const added = Number(data.clean_added || 0);
          runAuth(() => {
            window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + added).toFixed(2);
          });
          if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
          if (typeof window.showToast === 'function') {
            window.showToast(`📬 Caixa Nuvem MMO: +$ ${added.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Limpos creditados!`);
          }
        }
      } catch (e) {}
    }

    getMyRecentInboxLog() {
      const me = this.getActorIdentity();
      const ledger = this.readShared();
      const fromShared = ledger.walletInbox
        .filter((i) => i && ((i.recipientId && i.recipientId === me.id) || (i.recipientTag && i.recipientTag.toLowerCase() === me.tag.toLowerCase())))
        .slice(-8)
        .reverse();
      return fromShared.length > 0 ? fromShared : this.recentClaimedHistory.slice(0, 8);
    }

    // =========================================================================
    // 3. VITRINE GLOBAL DE LAVAGEM (5 EMPRESAS/HORA + FILA REAL DE 15 VAGAS)
    // =========================================================================
    upsertGlobalCompany(coObj) {
      if (!coObj || !coObj.id) return;
      const me = this.getActorIdentity();
      const ledger = this.readShared();
      const prev = ledger.companies[coObj.id] || {};
      const curBucket = this.getCurrentHourBucket();
      const queuedHour = prev.hourBucket === curBucket ? Number(prev.dirtyQueuedHour || 0) : 0;

      ledger.companies[coObj.id] = {
        id: coObj.id,
        ownerId: coObj.ownerId || me.id,
        ownerTag: coObj.ownerTag || me.tag,
        name: coObj.name,
        tier: Number(coObj.tier || 1),
        feePct: Number(coObj.feePct || 16),
        capacityPerHour: Number(coObj.capacityPerHour || 30000),
        cleanReserve: Number(coObj.cleanReserve || 0),
        dirtyQueuedHour: Math.max(queuedHour, Number(coObj.dirtyQueuedHour || 0)),
        hourBucket: curBucket,
        updatedAt: Date.now()
      };
      this.writeShared(ledger, 'company_updated', { companyId: coObj.id });
    }

    publishGlobalAdSlot(company) {
      if (!company || !company.id) {
        return { ok: false, code: 'NO_COMPANY', message: 'Abra uma empresa antes de anunciar.' };
      }
      const me = this.getActorIdentity();
      this.upsertGlobalCompany(company);

      const ledger = this.readShared();
      const curBucket = this.getCurrentHourBucket();
      // Remove anúncios velhos já expirados
      ledger.companyAds = ledger.companyAds.filter((a) => a && Number(a.hourBucket) >= curBucket);

      // Procura a primeira hora disponível (máx 5 por hora nas próximas 3 horas = 15 vagas reais!)
      let chosenBucket = null;
      for (let offset = 0; offset < 3; offset++) {
        const b = curBucket + offset;
        const bucketAds = ledger.companyAds.filter((a) => a.hourBucket === b);
        const alreadyInBucket = bucketAds.some((a) => a.companyId === company.id || a.ownerId === me.id);
        if (alreadyInBucket) {
          if (offset === 0) {
            return {
              ok: false,
              code: 'ALREADY_ADVERTISED_THIS_HOUR',
              message: 'Sua empresa já está anunciada na vitrine desta hora!'
            };
          }
          continue;
        }
        if (bucketAds.length < 5) {
          chosenBucket = b;
          break;
        }
      }

      if (chosenBucket === null) {
        return {
          ok: false,
          code: 'GLOBAL_AD_QUEUE_FULL',
          message: 'As 15 vagas globais das próximas 3 horas já foram ocupadas! Tente novamente na virada da hora.'
        };
      }

      const slotIndex = ledger.companyAds.filter((a) => a.hourBucket === chosenBucket).length;
      const adEntry = {
        id: 'gad_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        hourBucket: chosenBucket,
        slotIndex,
        companyId: company.id,
        ownerId: me.id,
        ownerTag: me.tag,
        createdAt: Date.now()
      };
      ledger.companyAds.push(adEntry);
      this.writeShared(ledger, 'launder_ads_updated', { hourBucket: chosenBucket, companyId: company.id });

      return {
        ok: true,
        hourBucket: chosenBucket,
        hoursWait: chosenBucket - curBucket,
        slotIndex
      };
    }

    getGlobalHourAds(hourBucket) {
      const targetBucket = Number.isFinite(hourBucket) ? hourBucket : this.getCurrentHourBucket();
      const me = this.getActorIdentity();
      const ledger = this.readShared();
      const bucketAds = ledger.companyAds
        .filter((a) => a && a.hourBucket === targetBucket)
        .sort((a, b) => (a.slotIndex - b.slotIndex) || (a.createdAt - b.createdAt))
        .slice(0, 5);

      return bucketAds
        .map((ad) => {
          const co = ledger.companies[ad.companyId];
          if (!co) return null;
          const used = co.hourBucket === targetBucket ? Number(co.dirtyQueuedHour || 0) : 0;
          const isMine = (co.ownerId === me.id) || (co.ownerTag && co.ownerTag.toLowerCase() === me.tag.toLowerCase());
          return {
            id: co.id,
            name: co.name,
            ownerId: co.ownerId,
            ownerTag: co.ownerTag,
            tier: co.tier,
            feePct: Number(co.feePct || 16),
            capacityPerHour: Number(co.capacityPerHour || 30000),
            usedCapacityThisHour: used,
            isBot: false,
            isMine,
            isGlobalPlayer: !isMine,
            adHourBucket: targetBucket
          };
        })
        .filter(Boolean);
    }

    getGlobalAdQueueSummary() {
      const curBucket = this.getCurrentHourBucket();
      const ledger = this.readShared();
      const active = ledger.companyAds.filter((a) => a && a.hourBucket >= curBucket && a.hourBucket <= curBucket + 2);
      return {
        currentHourCount: active.filter((a) => a.hourBucket === curBucket).length,
        totalQueuedNext3h: active.length,
        maxQueuedNext3h: 15
      };
    }

    recordGlobalWashInPlayerCompany(opts) {
      if (!opts || !opts.companyId) return { ok: false };
      const me = this.getActorIdentity();
      const ledger = this.readShared();
      const curBucket = this.getCurrentHourBucket();
      const co = ledger.companies[opts.companyId];
      if (co) {
        if (co.hourBucket !== curBucket) {
          co.hourBucket = curBucket;
          co.dirtyQueuedHour = 0;
        }
        co.dirtyQueuedHour = Number(co.dirtyQueuedHour || 0) + Number(opts.grossDirty || 0);
        co.updatedAt = Date.now();
        this.writeShared(ledger, 'company_wash_volume', { companyId: co.id });
      }

      if (opts.ownerId && opts.ownerId !== me.id && Number(opts.ownerCutClean || 0) > 0) {
        this.incrementPairDailyLimit(me.id, opts.ownerId, 'launder_batch');
        this.enqueueInboxPayout({
          recipientId: opts.ownerId,
          recipientTag: opts.ownerTag,
          senderId: me.id,
          senderTag: me.tag,
          kind: 'LAUNDER_COMMISSION',
          amountClean: opts.ownerCutClean,
          amountDirty: 0,
          note: `Comissão da empresa "${opts.companyName || 'Fachada'}" (lote de @${me.tag})`
        });
      }
      return { ok: true };
    }

    // =========================================================================
    // 4. BOLSA GLOBAL UNIFICADA (8 EMPRESAS + CIRCUIT BREAKER 10 MIN)
    // =========================================================================
    getSharedUpdatedAt() {
      const ledger = this.readShared();
      return Number(ledger.updatedAt || 0);
    }

    tickGlobalStocksIfDue() {
      const ledger = this.readShared();
      const now = Date.now();
      if (ledger.lastStockTickAt && (now - ledger.lastStockTickAt) < 15000) {
        return false;
      }
      ledger.lastStockTickAt = now;
      DEFAULT_CORPS.forEach((c) => {
        const st = ledger.stocks[c.symbol];
        if (!st) return;
        if (st.circuitBreakerUntil && st.circuitBreakerUntil > now) return;
        if (st.integrity < 100) st.integrity = Math.min(100, +(st.integrity + 0.8).toFixed(1));
        if (st.integrity > 100) st.integrity = Math.max(100, +(st.integrity - 0.5).toFixed(1));
        const targetFairPrice = c.basePrice * (st.integrity / 100);
        const pull = (targetFairPrice - st.price) * 0.12;
        const nextPrice = Math.max(+(c.basePrice * 0.30).toFixed(2), Math.min(+(c.basePrice * 2.20).toFixed(2), +(st.price + pull).toFixed(2)));
        st.momentum = +(nextPrice - st.price).toFixed(2);
        st.price = nextPrice;
        if (!Array.isArray(st.history)) st.history = [c.basePrice];
        st.history.push(nextPrice);
        if (st.history.length > 14) st.history.shift();
      });
      this.writeShared(ledger);
      return true;
    }

    getGlobalStocks() {
      const ledger = this.readShared();
      const now = Date.now();
      let mutated = false;
      Object.keys(ledger.stocks).forEach((sym) => {
        const st = ledger.stocks[sym];
        if (st.circuitBreakerUntil && now >= st.circuitBreakerUntil) {
          st.circuitBreakerUntil = 0;
          st.recentDropsCount = 0;
          mutated = true;
        }
      });
      if (mutated) this.writeShared(ledger);
      return JSON.parse(JSON.stringify(ledger.stocks));
    }

    applyGlobalStockImpact(symbol, deltaPct, reasonText) {
      const sym = String(symbol || '').toUpperCase();
      const ledger = this.readShared();
      const st = ledger.stocks[sym];
      if (!st) return { ok: false, code: 'INVALID_SYMBOL', message: 'Empresa inválida.' };

      const now = Date.now();
      const me = this.getActorIdentity();
      let effDelta = Number(deltaPct || 0);
      let damped50 = false;

      if (effDelta < 0) {
        if (st.circuitBreakerUntil && st.circuitBreakerUntil > now) {
          const minsLeft = Math.max(1, Math.ceil((st.circuitBreakerUntil - now) / 60000));
          return {
            ok: false,
            code: 'CIRCUIT_BREAKER_ACTIVE',
            symbol: sym,
            oldPrice: st.price,
            newPrice: st.price,
            integrity: st.integrity,
            circuitBreakerUntil: st.circuitBreakerUntil,
            message: `⏸️ Circuit Breaker ativo em ${sym} (${minsLeft} min restantes): cotação protegida contra manipulação em série!`
          };
        }

        const TEN_MIN = 10 * 60 * 1000;
        if (!st.lastDropWindowAt || (now - st.lastDropWindowAt) > TEN_MIN) {
          st.recentDropsCount = 1;
          st.lastDropWindowAt = now;
        } else {
          st.recentDropsCount = Number(st.recentDropsCount || 0) + 1;
          if (st.recentDropsCount === 2) {
            effDelta = effDelta * 0.50;
            damped50 = true;
          } else if (st.recentDropsCount >= 3) {
            st.circuitBreakerUntil = now + TEN_MIN;
            this.writeShared(ledger, 'stock_circuit_breaker', { symbol: sym, until: st.circuitBreakerUntil });
            return {
              ok: false,
              code: 'CIRCUIT_BREAKER_TRIGGERED',
              symbol: sym,
              oldPrice: st.price,
              newPrice: st.price,
              integrity: st.integrity,
              circuitBreakerUntil: st.circuitBreakerUntil,
              message: `🛑 3º ataque seguido em 10 min disparou o Circuit Breaker da Bolsa em ${sym} por 10 min!`
            };
          }
        }
      }

      const oldPrice = Number(st.price || st.basePrice);
      const minFloor = +(st.basePrice * 0.30).toFixed(2);
      const maxCap = +(st.basePrice * 2.20).toFixed(2);
      const newPrice = Math.max(minFloor, Math.min(maxCap, +(oldPrice * (1 + effDelta)).toFixed(2)));
      const newIntegrity = Math.max(20, Math.min(125, +(Number(st.integrity || 100) + (effDelta * 100)).toFixed(1)));

      st.price = newPrice;
      st.integrity = newIntegrity;
      st.momentum = +(newPrice - oldPrice).toFixed(2);
      st.lastActorTag = me.tag;
      st.lastReason = reasonText || '';
      st.updatedAt = now;
      if (!Array.isArray(st.history)) st.history = [st.basePrice];
      st.history.push(newPrice);
      if (st.history.length > 14) st.history.shift();

      this.writeShared(ledger, 'stock_impact', {
        symbol: sym,
        oldPrice,
        newPrice,
        deltaPct: effDelta,
        actorTag: me.tag,
        damped50
      });

      this.pushCloudStockImpactSilent(sym, deltaPct, me.tag);

      return {
        ok: true,
        symbol: sym,
        oldPrice,
        newPrice,
        effectiveDeltaPct: effDelta,
        damped50,
        integrity: newIntegrity,
        history: st.history.slice()
      };
    }

    async pushCloudStockImpactSilent(sym, deltaPct, actorTag) {
      if (!this.cloudRpcSupported || !window.supabase || typeof window.supabase.rpc !== 'function') return;
      try {
        const { error } = await window.supabase.rpc('rpc_apply_global_stock_impact', {
          p_symbol: sym,
          p_delta_pct: deltaPct,
          p_actor_tag: actorTag
        });
        if (error) this.cloudRpcSupported = false;
      } catch (e) {}
    }

    async pullCloudStocksSilent() {
      if (!window.supabase || typeof window.supabase.from !== 'function') return;
      try {
        const { data, error } = await window.supabase.from('global_cyberstock_tickers').select('*');
        if (error || !Array.isArray(data) || !data.length) return;
        const ledger = this.readShared();
        data.forEach((row) => {
          if (ledger.stocks[row.symbol]) {
            ledger.stocks[row.symbol].price = Number(row.price);
            ledger.stocks[row.symbol].integrity = Number(row.integrity);
            if (Array.isArray(row.history_json) && row.history_json.length) {
              ledger.stocks[row.symbol].history = row.history_json.slice(-14).map(Number);
            }
          }
        });
        this.writeShared(ledger);
        this.refreshOpenMarketWindows();
      } catch (e) {}
    }

    // =========================================================================
    // 5. LEILÃO GLOBAL DE 2H (ESTORNO INSTANTÂNEO + ANTI-SNIPING +30S MÁX 5X)
    // =========================================================================
    getGlobalAuctionState(bucket, defaultLot) {
      const bKey = String(bucket);
      const ledger = this.readShared();
      if (!ledger.auctions[bKey]) {
        ledger.auctions[bKey] = {
          bucket,
          lotCode: defaultLot ? defaultLot.lotCode : `LOT-FBI-${bucket}`,
          origin: defaultLot ? defaultLot.origin : 'Servidor Apreendido',
          highestBid: defaultLot ? Number(defaultLot.botCurrentBid || 8000) : 8000,
          highestBidderId: null,
          highestBidderTag: defaultLot ? defaultLot.botLeaderTag : 'kr0n0s_apt',
          isBotLeader: true,
          minIncrement: 1500,
          expiresAt: (bucket + 1) * (2 * 60 * 60 * 1000),
          snipeExtensions: 0,
          bidHistory: []
        };
        this.writeShared(ledger);
      }
      return JSON.parse(JSON.stringify(ledger.auctions[bKey]));
    }

    setAuctionExpiresAtForCurrentBucket(bucket, expiresAtMs) {
      const bKey = String(bucket);
      const ledger = this.readShared();
      if (!ledger.auctions[bKey]) {
        this.getGlobalAuctionState(bucket, null);
      }
      const fresh = this.readShared();
      if (fresh.auctions[bKey]) {
        fresh.auctions[bKey].expiresAt = Number(expiresAtMs);
        this.writeShared(fresh, 'auction_updated', { bucket });
      }
    }

    placeGlobalAuctionBid(opts) {
      const bucket = opts.bucket;
      const bKey = String(bucket);
      const me = this.getActorIdentity();
      const bidderId = opts.bidderId || me.id;
      const bidderTag = opts.bidderTag || me.tag;
      const bidClean = Math.round(Number(opts.bidClean || 0));
      const txId = opts.txId || this.generateTxId('bid');

      if (this.hasProcessedTx(txId)) {
        return { ok: false, code: 'DUPLICATE_TX', message: 'Clique de lance já processado.' };
      }

      // Garante lote inicializado
      this.getGlobalAuctionState(bucket, opts.defaultLot || null);

      const ledger = this.readShared();
      const lot = ledger.auctions[bKey];
      const now = Date.now();

      if (lot.expiresAt <= now) {
        return { ok: false, code: 'AUCTION_CLOSED', message: 'Este lote de 2h já encerrou!' };
      }
      if (!lot.isBotLeader && lot.highestBidderId === bidderId) {
        return {
          ok: false,
          code: 'SELF_OUTBID_BLOCKED',
          message: 'Você já detém o maior lance global deste lote!'
        };
      }
      const minRequired = Number(lot.highestBid || 8000) + 1500;
      if (bidClean < minRequired) {
        return {
          ok: false,
          code: 'BID_TOO_LOW',
          minRequired,
          message: `Lance mínimo global atual: $ ${minRequired.toLocaleString('pt-BR')} Limpos (+ $ 1.500 sobre @${lot.highestBidderTag}).`
        };
      }

      // Estorno instantâneo na mesma transação se o líder anterior era um jogador real!
      let refundedPrevTag = null;
      let refundedAmount = 0;
      const prevBidderId = !lot.isBotLeader ? lot.highestBidderId : null;
      const prevBidderTag = !lot.isBotLeader ? lot.highestBidderTag : null;
      const prevBidAmount = !lot.isBotLeader ? Number(lot.highestBid || 0) : 0;

      let snipeExtended = false;
      if ((lot.expiresAt - now) < 30000 && Number(lot.snipeExtensions || 0) < 5) {
        lot.expiresAt = Number(lot.expiresAt) + 30000;
        lot.snipeExtensions = Number(lot.snipeExtensions || 0) + 1;
        snipeExtended = true;
      }

      lot.highestBid = bidClean;
      lot.highestBidderId = bidderId;
      lot.highestBidderTag = bidderTag;
      lot.isBotLeader = false;
      lot.bidHistory.unshift({
        bidderTag,
        amount: bidClean,
        snipeExtended,
        at: now
      });
      if (lot.bidHistory.length > 10) lot.bidHistory.length = 10;

      ledger.txIds[txId] = now;
      this.writeShared(ledger, 'auction_updated', {
        bucket,
        highestBid: bidClean,
        highestBidderTag: bidderTag,
        snipeExtended
      });

      if (prevBidderId && prevBidAmount > 0) {
        refundedPrevTag = prevBidderTag;
        refundedAmount = prevBidAmount;
        this.enqueueInboxPayout({
          recipientId: prevBidderId,
          recipientTag: prevBidderTag,
          senderId: bidderId,
          senderTag: bidderTag,
          kind: 'AUCTION_OUTBID_REFUND',
          amountClean: prevBidAmount,
          amountDirty: 0,
          note: `Seu lance no lote ${lot.lotCode} foi coberto por @${bidderTag} — estorno integral automático!`
        });
      }

      return {
        ok: true,
        lot: JSON.parse(JSON.stringify(lot)),
        refundedPrevTag,
        refundedAmount,
        snipeExtended
      };
    }

    markGlobalAuctionClaimed(bucket, winnerId) {
      const bKey = String(bucket);
      const ledger = this.readShared();
      const lot = ledger.auctions[bKey];
      if (!lot) return { ok: false, code: 'LOT_NOT_FOUND' };
      if (lot.claimed) return { ok: false, code: 'ALREADY_CLAIMED', message: 'Este servidor já foi aberto pelo vencedor!' };
      if (lot.isBotLeader || lot.highestBidderId !== winnerId) {
        return { ok: false, code: 'NOT_WINNER', message: 'Apenas o jogador com o maior lance vencedor pode abrir o servidor.' };
      }
      if (lot.expiresAt > Date.now()) {
        return { ok: false, code: 'STILL_RUNNING', message: 'Aguarde o cronômetro do leilão encerrar para abrir o servidor.' };
      }
      lot.claimed = true;
      lot.claimedAt = Date.now();
      this.writeShared(ledger, 'auction_updated', { bucket, claimed: true });
      return { ok: true, lot: JSON.parse(JSON.stringify(lot)) };
    }

    // =========================================================================
    // 6. ALUGUEL ATÔMICO DE VÍRUS P2P (ZERO CLONAGEM + PAGAMENTO VIA INBOX)
    // =========================================================================
    publishGlobalP2pLicense(offerObj) {
      if (!offerObj || !offerObj.offerId) return null;
      const me = this.getActorIdentity();
      const ledger = this.readShared();
      const entry = {
        offerId: offerObj.offerId,
        strainId: offerObj.strainId || null,
        sellerId: offerObj.sellerId || me.id,
        sellerTag: offerObj.sellerTag || me.tag,
        name: offerObj.strainName || offerObj.name || 'Strain-P2P',
        strainName: offerObj.strainName || offerObj.name || 'Strain-P2P',
        family: offerObj.family || 'vwarez',
        versionInt: Number(offerObj.versionInt || 50),
        fitGrade: offerObj.fitGrade || 'A',
        durationHours: Number(offerObj.durationHours || 48),
        powerBonus: Number(offerObj.powerBonus || 0.25),
        priceClean: Math.round(Number(offerObj.priceClean || 2500)),
        burnTaxPct: Number(offerObj.burnTaxPct || 15),
        soldToId: null,
        soldToTag: null,
        soldAt: 0,
        createdAt: Date.now()
      };
      ledger.p2pOffers.unshift(entry);
      if (ledger.p2pOffers.length > 60) ledger.p2pOffers.length = 60;
      this.writeShared(ledger, 'p2p_offers_updated', { offerId: entry.offerId });
      return entry;
    }

    getGlobalOpenP2pLicenses() {
      const ledger = this.readShared();
      const me = this.getActorIdentity();
      const cutoff = Date.now() - (12 * 60 * 60 * 1000);
      return ledger.p2pOffers
        .filter((o) => o && !o.soldToId && o.createdAt >= cutoff)
        .map((o) => ({
          ...o,
          strainName: o.strainName || o.name,
          isBot: false,
          isPlayerOffer: true,
          isMine: (o.sellerId === me.id) || (o.sellerTag && o.sellerTag.toLowerCase() === me.tag.toLowerCase())
        }));
    }

    buyGlobalP2pLicenseAtomic(opts) {
      const offerId = opts && opts.offerId ? String(opts.offerId) : '';
      const me = this.getActorIdentity();
      const buyerId = (opts && opts.buyerId) ? String(opts.buyerId) : me.id;
      const buyerTag = (opts && opts.buyerTag) ? String(opts.buyerTag) : me.tag;
      const buyerCleanBalance = Number(opts && opts.buyerCleanBalance != null ? opts.buyerCleanBalance : 0);

      const ledger = this.readShared();
      const offer = ledger.p2pOffers.find((o) => o && o.offerId === offerId);
      if (!offer) {
        return { ok: false, code: 'NOT_GLOBAL_OFFER' };
      }
      if (offer.soldToId) {
        return {
          ok: false,
          code: 'ALREADY_SOLD',
          message: 'Outro jogador alugou esta licença 1 segundo antes — nada foi cobrado de você!'
        };
      }
      if (offer.sellerId === buyerId || (offer.sellerTag && offer.sellerTag.toLowerCase() === buyerTag.toLowerCase())) {
        return {
          ok: false,
          code: 'SELF_BUY_BLOCKED',
          message: 'Você não pode alugar seu próprio vírus anunciado na vitrine!'
        };
      }
      if (buyerCleanBalance < offer.priceClean) {
        return {
          ok: false,
          code: 'NEED_CLEAN_MONEY',
          priceClean: offer.priceClean,
          message: `O aluguel P2P exige $ ${offer.priceClean.toLocaleString('pt-BR')} em Dinheiro Limpo.`
        };
      }

      offer.soldToId = buyerId;
      offer.soldToTag = buyerTag;
      offer.soldAt = Date.now();
      this.writeShared(ledger, 'p2p_offers_updated', { offerId, soldToTag: buyerTag });

      const taxPct = Number(offer.burnTaxPct || 15);
      const netSeller = Math.round(offer.priceClean * (1 - taxPct / 100));
      this.enqueueInboxPayout({
        recipientId: offer.sellerId,
        recipientTag: offer.sellerTag,
        senderId: buyerId,
        senderTag: buyerTag,
        kind: 'P2P_VIRUS_SALE',
        amountClean: netSeller,
        amountDirty: 0,
        note: `@${buyerTag} alugou sua licença "${offer.strainName || offer.name}" (${offer.durationHours}h, -${taxPct}% taxa da rede)`
      });

      return {
        ok: true,
        offer: { ...offer },
        netSeller
      };
    }

    // =========================================================================
    // 7. MURAL DO FÓRUM C/ RESERVA EXCLUSIVA 30M E CANCELAMENTO SEGURO
    // =========================================================================
    publishGlobalEscrowContract(contractObj) {
      const me = this.getActorIdentity();
      const ledger = this.readShared();
      const entry = {
        id: contractObj.id,
        issuerId: contractObj.issuerId || me.id,
        issuerTag: contractObj.hirerTag || contractObj.issuerTag || me.tag,
        hirerTag: contractObj.hirerTag || contractObj.issuerTag || me.tag,
        targetIp: contractObj.targetIp,
        targetLabel: contractObj.targetLabel || contractObj.targetIp,
        objective: contractObj.objectiveKind || contractObj.objective || 'crack_root',
        objectiveKind: contractObj.objectiveKind || contractObj.objective || 'crack_root',
        objectiveLabel: contractObj.objectiveLabel || contractObj.objective || 'Quebrar Acesso Root Verificado',
        rewardDirty: Number(contractObj.rewardDirty || 0),
        feePaid: Number(contractObj.notaryFeeBurned || contractObj.feePaid || 0),
        notaryFeeBurned: Number(contractObj.notaryFeeBurned || contractObj.feePaid || 0),
        status: 'open',
        reservedById: null,
        reservedByTag: null,
        reservedUntil: 0,
        completedByTag: null,
        createdAt: contractObj.createdAt || Date.now()
      };
      ledger.escrowContracts.unshift(entry);
      if (ledger.escrowContracts.length > 50) ledger.escrowContracts.length = 50;
      this.writeShared(ledger, 'escrow_updated', { id: entry.id });
      return entry;
    }

    getGlobalEscrowContracts() {
      const ledger = this.readShared();
      const now = Date.now();
      let changed = false;
      ledger.escrowContracts.forEach((c) => {
        if (c && c.status === 'reserved' && c.reservedUntil && c.reservedUntil <= now) {
          c.status = 'open';
          c.reservedById = null;
          c.reservedByTag = null;
          c.reservedUntil = 0;
          changed = true;
        }
      });
      if (changed) this.writeShared(ledger);
      const me = this.getActorIdentity();
      return ledger.escrowContracts
        .filter((c) => c && c.status !== 'cancelled')
        .map((c) => ({
          ...c,
          hirerTag: c.hirerTag || c.issuerTag,
          objectiveKind: c.objectiveKind || c.objective,
          objectiveLabel: c.objectiveLabel || c.objective,
          notaryFeeBurned: Number(c.notaryFeeBurned || c.feePaid || 0),
          isMine: (c.issuerId === me.id) || (c.issuerTag && c.issuerTag.toLowerCase() === me.tag.toLowerCase()),
          reservedByMe: (c.status === 'reserved') && ((c.reservedById === me.id) || (c.reservedByTag && c.reservedByTag.toLowerCase() === me.tag.toLowerCase())),
          isBot: false
        }));
    }

    reserveGlobalEscrow30m(opts) {
      const contractId = opts && opts.contractId ? String(opts.contractId) : '';
      const me = this.getActorIdentity();
      const hunterId = (opts && opts.hunterId) ? String(opts.hunterId) : me.id;
      const hunterTag = (opts && opts.hunterTag) ? String(opts.hunterTag) : me.tag;

      const ledger = this.readShared();
      const c = ledger.escrowContracts.find((x) => x && x.id === contractId);
      if (!c) return { ok: false, code: 'NOT_GLOBAL_CONTRACT' };

      const now = Date.now();
      if (c.status === 'reserved' && c.reservedUntil && c.reservedUntil <= now) {
        c.status = 'open';
        c.reservedById = null;
        c.reservedByTag = null;
        c.reservedUntil = 0;
      }

      if (c.issuerId === hunterId || (c.issuerTag && c.issuerTag.toLowerCase() === hunterTag.toLowerCase())) {
        return {
          ok: false,
          code: 'SELF_CONTRACT_BLOCKED',
          message: 'Você não pode aceitar seu próprio contrato publicado no mural!'
        };
      }

      const pairCheck = this.canUsePairDailyLimit(hunterId, c.issuerId, 'escrow_contract', 2);
      if (!pairCheck.ok) {
        return {
          ok: false,
          code: 'MAX_2_PAIR_CONTRACTS_PER_DAY',
          message: `Limite anti-abuso: você já cumpriu 2 contratos hoje de @${c.issuerTag}. Escolha outro contratante!`
        };
      }

      if (c.status === 'reserved' && c.reservedById !== hunterId) {
        const mins = Math.max(1, Math.ceil((c.reservedUntil - now) / 60000));
        return {
          ok: false,
          code: 'RESERVED_BY_OTHER',
          message: `Contrato já reservado com exclusividade por @${c.reservedByTag} (${mins} min restantes)!`
        };
      }

      if (c.status !== 'open' && !(c.status === 'reserved' && c.reservedById === hunterId)) {
        return {
          ok: false,
          code: 'CONTRACT_NOT_OPEN',
          message: 'Este contrato já foi concluído ou cancelado.'
        };
      }

      c.status = 'reserved';
      c.reservedById = hunterId;
      c.reservedByTag = hunterTag;
      c.reservedUntil = now + (30 * 60 * 1000);
      this.writeShared(ledger, 'escrow_updated', { id: c.id, status: 'reserved', reservedByTag: hunterTag });

      return { ok: true, contract: { ...c } };
    }

    completeGlobalEscrow(opts) {
      const contractId = opts && opts.contractId ? String(opts.contractId) : '';
      const me = this.getActorIdentity();
      const hunterId = (opts && opts.hunterId) ? String(opts.hunterId) : me.id;
      const hunterTag = (opts && opts.hunterTag) ? String(opts.hunterTag) : me.tag;

      const ledger = this.readShared();
      const c = ledger.escrowContracts.find((x) => x && x.id === contractId);
      if (!c) return { ok: false, code: 'NOT_GLOBAL_CONTRACT' };

      c.status = 'completed';
      c.completedByTag = hunterTag;
      c.completedAt = Date.now();
      this.writeShared(ledger, 'escrow_updated', { id: c.id, status: 'completed', completedByTag: hunterTag });

      if (c.issuerId) {
        this.incrementPairDailyLimit(hunterId, c.issuerId, 'escrow_contract');
      }
      return { ok: true, contract: { ...c } };
    }

    cancelMyOpenEscrow(contractId) {
      const me = this.getActorIdentity();
      const ledger = this.readShared();
      const c = ledger.escrowContracts.find((x) => x && x.id === String(contractId || ''));
      if (!c) {
        return { ok: false, code: 'NOT_FOUND', message: 'Contrato não encontrado.' };
      }

      const now = Date.now();
      if (c.status === 'reserved' && c.reservedUntil && c.reservedUntil <= now) {
        c.status = 'open';
        c.reservedById = null;
        c.reservedByTag = null;
        c.reservedUntil = 0;
      }

      const isMine = (c.issuerId === me.id) || (c.issuerTag && c.issuerTag.toLowerCase() === me.tag.toLowerCase());
      if (!isMine) {
        return { ok: false, code: 'NOT_OWNER', message: 'Apenas o criador do contrato pode cancelá-lo.' };
      }
      if (c.status === 'reserved') {
        const mins = Math.max(1, Math.ceil((c.reservedUntil - now) / 60000));
        return {
          ok: false,
          code: 'LOCKED_IN_EXECUTION',
          message: `Contrato em execução exclusiva por @${c.reservedByTag} — aguarde ${mins} min caso ele falhe.`
        };
      }
      if (c.status !== 'open') {
        return { ok: false, code: 'ALREADY_FINALIZED', message: 'Este contrato já foi finalizado.' };
      }

      c.status = 'cancelled';
      c.cancelledAt = now;
      this.writeShared(ledger, 'escrow_updated', { id: c.id, status: 'cancelled' });

      return {
        ok: true,
        refundClean: Number(c.rewardDirty || 0),
        burnedFee: Number(c.feePaid || 0),
        contract: { ...c }
      };
    }
  }

  window.mmoGlobalMarket = new MmoGlobalMarketEngine();
})();
