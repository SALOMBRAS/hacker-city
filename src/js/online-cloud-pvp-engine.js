/**
 * Hacker City // Motor Online, Cloud Save Anti-F5, PvP Humano em Tempo Real & Protocolo 404 Real:
 * 1. OnlineCloudPvpEngine — Sincronização dupla (Local por UID + Supabase Cloud Metadata / PostgreSQL RPC),
 *                           Presença Realtime (hc-mmo-world), Diretório Global de Jogadores Reais (public.profiles),
 *                           Eventos PvP Reais (Invasão, Syslog Remoto, Vírus Hostil, Saque, Mail P2P e Clãs).
 * 2. PanicRaidEngine      — Protocolo 404 embutido na conta real (3 travas em 15s; falha confisca HD principal e 75%
 *                           da conta corrente, mas preserva 100% do HD Externo XHD e das Contas Offshore!).
 */
(function () {
  const RESERVED_OCTETS = new Set([0, 10, 33, 71, 77, 100, 109, 127, 133, 155, 169, 172, 185, 192, 198, 203, 224, 240, 255]);

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function hash32(str) {
    let h = 2166136261 >>> 0;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  // Gera um IP público determinístico e único para contas reais de public.profiles que ainda não anunciaram IP próprio
  function deterministicIpFromUserId(uid) {
    let h = hash32('PLAYER_IP::' + uid);
    let o1 = 14 + (h % 205);
    while (RESERVED_OCTETS.has(o1)) {
      o1 = ((o1 + 7) % 210) + 12;
    }
    const o2 = 1 + ((h >>> 8) % 250);
    const o3 = 1 + ((h >>> 16) % 250);
    const o4 = 2 + ((h >>> 24) % 250);
    return `${o1}.${o2}.${o3}.${o4}`;
  }

  // =========================================================================
  // 1. ONLINE CLOUD SAVE, REALTIME PRESENCE & HUMAN-VS-HUMAN PVP ENGINE
  // =========================================================================
  class OnlineCloudPvpEngine {
    constructor() {
      this.userId = null;
      this.syncStatus = 'idle'; // 'idle' | 'syncing' | 'synced' | 'local_only'
      this.lastSyncedAt = null;
      this.lastDbWalletBalance = null;
      this.saveTimer = null;
      this.realtimeChannel = null;
      this.localBus = null;
      this.onlinePeers = new Map();      // userId -> peerMeta (ao vivo no Realtime / BroadcastChannel)
      this.knownHumansById = new Map();  // userId -> peerMeta (mesclado com public.profiles & player_cloud_saves)
      this.knownHumansByIp = new Map();  // publicIp -> peerMeta
      this.livePvpFeed = [];             // histórico de eventos online na sessão
      this.processedPacketIds = new Set();
      this.cloudTablesAvailable = null;  // auto-detectado p/ evitar 404 repetidos
      this.initLocalCrossTabBus();
      this.bindLifecycleHooks();
    }

    masterSaveKey(uid) {
      return `HC_MASTER_SAVE_V2_${uid || 'guest'}`;
    }

    getOrCreateWriteSecret(uid) {
      const k = `HC_WRITE_SECRET_V1_${uid || 'guest'}`;
      try {
        let sec = localStorage.getItem(k);
        if (!sec || sec.length < 16) {
          const rand = Array.from({ length: 4 }, () => Math.random().toString(36).slice(2, 10)).join('');
          sec = `wcs_${Date.now().toString(36)}_${rand}`;
          localStorage.setItem(k, sec);
        }
        return sec;
      } catch (e) {
        return `wcs_mem_${String(uid || 'guest')}`;
      }
    }

    bindLifecycleHooks() {
      const flushNow = (pushCloud) => {
        if (window.currentProfile && window.currentWallet) {
          this.saveLocalSnapshotImmediate();
          if (pushCloud) {
            this.pushSnapshotToCloud();
          }
        }
      };

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          flushNow(true);
        }
      });

      const leaveMesh = () => {
        flushNow(false);
        if (this.realtimeChannel) {
          try { this.realtimeChannel.untrack(); } catch (e) {}
          try { window.supabase.removeChannel(this.realtimeChannel); } catch (e) {}
        }
      };
      window.addEventListener('pagehide', leaveMesh);
      window.addEventListener('beforeunload', leaveMesh);
    }

    initLocalCrossTabBus() {
      if (typeof BroadcastChannel === 'undefined') return;
      try {
        this.localBus = new BroadcastChannel('hc_mmo_cross_tab_v2');
        this.localBus.onmessage = (ev) => {
          const msg = ev.data;
          if (!msg || !msg.type) return;
          if (msg.type === 'PRESENCE_PING' && msg.peer && msg.peer.userId) {
            if (!window.currentProfile || msg.peer.userId !== window.currentProfile.id) {
              this.registerDiscoveredPeer(msg.peer, true);
            }
          } else if (msg.type === 'PRESENCE_REQUEST') {
            if (window.currentProfile) this.broadcastLocalPresence();
          } else if (msg.type === 'PVP_PACKET' && msg.packet) {
            this.handleIncomingPacket(msg.packet);
          }
        };
      } catch (e) {}
    }

    broadcastLocalPresence() {
      if (!this.localBus || !window.currentProfile) return;
      try {
        this.localBus.postMessage({
          type: 'PRESENCE_PING',
          peer: this.buildMyPublicPeerDescriptor()
        });
      } catch (e) {}
    }

    buildMyPublicPeerDescriptor() {
      const p = window.currentProfile || {};
      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      const pwdEpoch = (window.networkIdentity && window.networkIdentity.state && window.networkIdentity.state.pwdEpoch) || 1;
      const fw = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('firewall') : 1.0;
      const hs = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('hasher') : 1.0;
      const av = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('antivirus') : 1.0;
      const hddTotalMb = window.softwareEngine ? window.softwareEngine.getMaxHddMb() : 350;
      const ramTotalMb = window.softwareEngine ? window.softwareEngine.getMaxRamMb() : 256;
      const customWebPage = (window.softwareEngine && window.softwareEngine.isSoftwareInstalled('webserver'))
        ? window.softwareEngine.state.customWebPage
        : null;
      const bestSoft = window.rankingBadgesEngine ? window.rankingBadgesEngine.getPlayerBestSoftwareVer() : 1.0;
      const ddosGbps = window.softwareEngine ? window.softwareEngine.getPendingHarvestSummary().totalGbps : 0;
      const cpuMhz = window.softwareEngine ? window.softwareEngine.getPlayerCpuMhz() : 800;
      const netMbps = window.softwareEngine ? window.softwareEngine.getPlayerNetMbps() : 1;
      const hardwareHealthPct = window.hardwareEngine && typeof window.hardwareEngine.getHealthPct === 'function'
        ? window.hardwareEngine.getHealthPct()
        : 100;
      const myClan = window.clanEngine ? window.clanEngine.getMyClan() : null;

      return {
        userId: p.id || 'guest',
        hackerTag: p.hacker_tag || 'Operador',
        specialty: p.specialty || 'exploiter',
        publicIp: myIp,
        pwdEpoch,
        reputation: Number(p.reputation || 100),
        heatLevel: Number(p.heat_level || 1),
        firewallVer: fw,
        hasherVer: hs,
        antivirusVer: av,
        hddTotalMb,
        ramTotalMb,
        customWebPage,
        bestSoftVer: bestSoft,
        ddosGbps,
        cpuMhz,
        netMbps,
        hardwareHealthPct,
        clanTag: myClan ? myClan.tag : null,
        clanObj: myClan || null,
        onlineNow: true,
        seenAt: Date.now()
      };
    }

    registerDiscoveredPeer(peer, isLiveOnline = false) {
      if (!peer || !peer.userId) return;
      if (window.currentProfile && peer.userId === window.currentProfile.id) return;

      const ip = peer.publicIp || deterministicIpFromUserId(peer.userId);
      const merged = {
        ...(this.knownHumansById.get(peer.userId) || {}),
        ...peer,
        publicIp: ip,
        onlineNow: isLiveOnline || !!(this.onlinePeers.has(peer.userId))
      };

      // Remover mapeamento de IP antigo se o jogador trocou de IP no ISP!
      const prev = this.knownHumansById.get(peer.userId);
      if (prev && prev.publicIp && prev.publicIp !== ip) {
        this.knownHumansByIp.delete(prev.publicIp);
      }

      this.knownHumansById.set(peer.userId, merged);
      this.knownHumansByIp.set(ip, merged);
      if (isLiveOnline) {
        this.onlinePeers.set(peer.userId, merged);
      }

      // Sincronizar clã customizado criado por outro jogador online!
      if (merged.clanObj && window.clanEngine) {
        window.clanEngine.ensureLoaded();
        const exists = window.clanEngine.state.clans.some((c) => c.tag === merged.clanObj.tag);
        if (!exists) {
          window.clanEngine.state.clans.push(merged.clanObj);
          window.clanEngine.save();
        }
      }

      this.updateHudSyncChip();
      if (window.winManager && window.winManager.current === 'winOnline') {
        this.renderOnlineHubUI();
      }
    }

    getHumanPlayerByIp(ip) {
      return this.knownHumansByIp.get(String(ip || '').trim()) || null;
    }

    getHumanPlayerByTag(tagRaw) {
      const q = String(tagRaw || '').trim().toLowerCase();
      if (!q) return null;
      for (const peer of this.knownHumansById.values()) {
        if ((peer.hackerTag || '').toLowerCase() === q) return peer;
      }
      return null;
    }

    getOnlineHumansList() {
      const now = Date.now();
      const arr = [];
      this.onlinePeers.forEach((p) => {
        if (now - (p.seenAt || now) < 5 * 60 * 1000) {
          arr.push(p);
        }
      });
      return arr.sort((a, b) => (b.reputation || 0) - (a.reputation || 0));
    }

    getAllKnownHumansList() {
      return Array.from(this.knownHumansById.values()).sort((a, b) => {
        if (!!b.onlineNow !== !!a.onlineNow) return b.onlineNow ? 1 : -1;
        return (b.reputation || 0) - (a.reputation || 0);
      });
    }

    // Operadores de IA marcados e exibidos 100% como Jogadores Reais (com sessões online/offline, clãs, reputação viva e defesas reais!)
    getSimulatedPlayersList(onlyOnlineNow = false) {
      if (window.livingBotsEngine) window.livingBotsEngine.ensureInitialized();
      const clanPool = [null, null, '0DAY', 'ZTRC', 'KRNS', 'VRTX', null];
      const dayBots = (window.botScheduler && window.botScheduler.getCurrentDayBots()) || [];
      const list = [];

      dayBots.forEach((b, idx) => {
        const liveStat = (window.livingBotsEngine && window.livingBotsEngine.botStats)
          ? window.livingBotsEngine.botStats.get(b.ip)
          : null;
        const shiftOnline = window.botScheduler ? window.botScheduler.isBotOnline(b.ip) : true;
        // Garante um lobby vivo com operadores entrando/saindo igual servidor MMO real (~12 online simultâneos)
        const onlineNow = shiftOnline || (idx % 3 === 0);
        if (onlyOnlineNow && !onlineNow) return;

        const defVer = b.tier === 3 ? 2.5 : (b.tier === 2 ? 1.5 : 1.0);
        const rep = liveStat ? liveStat.rep : (b.tier === 3 ? 3100 : (b.tier === 2 ? 1050 : 240));
        const clanTag = b.tier >= 2 ? clanPool[idx % clanPool.length] : (idx % 5 === 0 ? '0DAY' : null);

        list.push({
          userId: 'plr_' + b.id,
          hackerTag: b.handle,
          publicIp: b.ip,
          reputation: rep,
          firewallVer: defVer,
          hasherVer: defVer,
          antivirusVer: defVer,
          bestSoftVer: +(defVer + 0.5).toFixed(1),
          ddosGbps: +(b.tier * 1.8 + (idx % 4) * 0.4).toFixed(2),
          clanTag,
          lastAction: liveStat ? liveStat.lastAction : 'Navegando na rede',
          onlineNow,
          isAiPlayer: true
        });
      });

      // Inclui também m4riposa e rookie_br como jogadores registrados na rede
      const extraPlayers = [
        { userId: 'plr_m4riposa', hackerTag: 'm4riposa', publicIp: '149.56.28.11', reputation: 8240, firewallVer: 1.5, hasherVer: 1.5, antivirusVer: 1.5, bestSoftVer: 4.5, ddosGbps: 11.2, clanTag: 'KRNS', onlineNow: true, isAiPlayer: true },
        { userId: 'plr_rookie_br', hackerTag: 'rookie_br', publicIp: '177.84.19.62', reputation: 65, firewallVer: 1.0, hasherVer: 1.0, antivirusVer: 1.0, bestSoftVer: 1.0, ddosGbps: 0, clanTag: null, onlineNow: true, isAiPlayer: true }
      ];
      extraPlayers.forEach((ep) => {
        if (!onlyOnlineNow || ep.onlineNow) list.push(ep);
      });

      return list;
    }

    getUnifiedOnlinePlayers() {
      const myTag = ((window.currentProfile && window.currentProfile.hacker_tag) || '').toLowerCase();
      const humans = this.getOnlineHumansList();
      const seenTags = new Set(humans.map((h) => (h.hackerTag || '').toLowerCase()));
      seenTags.add(myTag);

      const aiOnline = this.getSimulatedPlayersList(true).filter((p) => !seenTags.has((p.hackerTag || '').toLowerCase()));
      return [...humans, ...aiOnline].sort((a, b) => (b.reputation || 0) - (a.reputation || 0));
    }

    getUnifiedPlayerDirectory() {
      const myTag = ((window.currentProfile && window.currentProfile.hacker_tag) || '').toLowerCase();
      const humans = this.getAllKnownHumansList();
      const seenTags = new Set(humans.map((h) => (h.hackerTag || '').toLowerCase()));
      seenTags.add(myTag);

      const aiAll = this.getSimulatedPlayersList(false).filter((p) => !seenTags.has((p.hackerTag || '').toLowerCase()));
      return [...humans, ...aiAll].sort((a, b) => {
        if (!!b.onlineNow !== !!a.onlineNow) return b.onlineNow ? 1 : -1;
        return (b.reputation || 0) - (a.reputation || 0);
      });
    }

    findAnyPlayerByTag(tagRaw) {
      const q = String(tagRaw || '').trim().toLowerCase();
      if (!q) return null;
      const human = this.getHumanPlayerByTag(q);
      if (human) return human;
      return this.getSimulatedPlayersList(false).find((p) => (p.hackerTag || '').toLowerCase() === q) || null;
    }

    // =========================================================================
    // SNAPSHOT COMPLETO DA CONTA (FIM DO BUG DE PERDER PROGRESSO NO F5!)
    // =========================================================================
    collectMasterSnapshot() {
      if (!window.currentProfile || !window.currentWallet) return null;

      if (window.networkIdentity) window.networkIdentity.ensureForProfile(window.currentProfile);
      if (window.softwareEngine) window.softwareEngine.ensureLoaded();
      if (window.bitcoinEngine) window.bitcoinEngine.ensureLoaded();
      if (window.stealthXhdEngine) window.stealthXhdEngine.ensureLoaded();
      if (window.bounceEngine) window.bounceEngine.ensureLoaded();
      if (window.multiBankEngine) window.multiBankEngine.ensureLoaded();
      if (window.hackedDb) window.hackedDb.ensureLoaded();
      if (window.universityEngine) window.universityEngine.ensureLoaded();
      if (window.tutorialEngine) window.tutorialEngine.ensureLoaded();
      if (window.missionsEngine) window.missionsEngine.ensureLoaded();
      if (window.cctvEngine) window.cctvEngine.ensureLoaded();
      if (window.puzzleTrailEngine) window.puzzleTrailEngine.ensureLoaded();
      if (window.clanEngine) window.clanEngine.ensureLoaded();
      if (window.mailEngine) window.mailEngine.ensureLoaded();

      const uid = window.currentProfile.id;
      const billsPaid = {};
      const quitineteBilling = { cycle: null, months: {} };
      if (window.quitineteEngine && window.quitineteEngine.bills) {
        quitineteBilling.cycle = window.quitineteEngine.cycle ? { ...window.quitineteEngine.cycle } : null;
        Object.entries(window.quitineteEngine.bills).forEach(([k, b]) => {
          billsPaid[k] = !!b.paid;
          quitineteBilling.months[k] = Number(b.monthsDue != null ? b.monthsDue : (b.paid ? 0 : 1));
        });
      }

      // Capturar logs remotos editados/sujos, páginas pichadas, arquivos deletados e favoritos (zero perda no F5!)
      const modifiedLogs = {};
      if (window.botAI && window.botAI.syslogRegistry) {
        for (const [ip, lines] of window.botAI.syslogRegistry.entries()) {
          if (!Array.isArray(lines)) continue;
          const isUntouchedDefault = lines.length === 1 && String(lines[0] || '').includes('sshd.service initialized');
          if (!isUntouchedDefault) {
            modifiedLogs[ip] = lines.slice(0, 25);
          }
        }
      }

      const defaced = {};
      const deletedFiles = {};
      if (window.internetEngine) {
        if (window.internetEngine.defacedPages) {
          for (const [ip, html] of window.internetEngine.defacedPages.entries()) {
            defaced[ip] = html;
          }
        }
        if (window.internetEngine.deletedHostFiles) {
          for (const [ip, setObj] of window.internetEngine.deletedHostFiles.entries()) {
            deletedFiles[ip] = Array.from(setObj || []);
          }
        }
      }

      let tourDone = (window.spotlightTour && window.spotlightTour.statusByUid && window.spotlightTour.statusByUid[uid]) || null;
      let tourRewarded = (window.spotlightTour && window.spotlightTour.rewardedByUid && window.spotlightTour.rewardedByUid[uid]) || null;
      try {
        tourDone = tourDone || localStorage.getItem(`HC_SPOTLIGHT_TOUR_DONE_${uid}`);
        tourRewarded = tourRewarded || localStorage.getItem(`HC_SPOTLIGHT_TOUR_REWARDED_${uid}`);
      } catch (e) {}

      if (window.softwareEngine && window.softwareEngine.state) {
        window.softwareEngine.state.activeTransitions = { ...(window.softwareEngine.transitions || {}) };
      }

      const rawSnap = {
        v: 4,
        savedAt: Date.now(),
        userId: uid,
        walletBalance: +(Number(window.currentWallet.balance || 0)).toFixed(2),
        lastDbBalance: this.lastDbWalletBalance != null
          ? Number(this.lastDbWalletBalance)
          : +(Number(window.currentWallet.balance || 0)).toFixed(2),
        reputation: Number(window.currentProfile.reputation || 100),
        heatLevel: Number(window.currentProfile.heat_level || 1),
        netId: window.networkIdentity ? window.networkIdentity.state : null,
        hw: window.hardwareEngine ? window.hardwareEngine.current : null,
        soft: window.softwareEngine ? window.softwareEngine.state : null,
        btc: window.bitcoinEngine ? window.bitcoinEngine.state : null,
        xhd: window.stealthXhdEngine ? window.stealthXhdEngine.state : null,
        stealthLoot: window.stealthXhdEngine ? {
          revealedHosts: Array.from(window.stealthXhdEngine.revealedHosts || []),
          claimedHiddenLoot: Array.from(window.stealthXhdEngine.claimedHiddenLoot || [])
        } : null,
        bounce: window.bounceEngine ? window.bounceEngine.state : null,
        banks: window.multiBankEngine ? window.multiBankEngine.state : null,
        hdb: window.hackedDb ? (window.hackedDb.entries || []).slice(0, 40) : [],
        uni: window.universityEngine ? window.universityEngine.state : null,
        tut: window.tutorialEngine ? window.tutorialEngine.state : null,
        tour: { done: tourDone, rewarded: tourRewarded },
        msn: window.missionsEngine ? window.missionsEngine.state : null,
        puz: window.puzzleTrailEngine ? window.puzzleTrailEngine.state : null,
        clan: window.clanEngine ? {
          myClanId: window.clanEngine.state.myClanId,
          customClans: (window.clanEngine.state.clans || []).filter((c) => String(c.id).startsWith('clan_usr_')),
          activeWar: window.clanEngine.state.activeWar,
          warsWonByPlayer: window.clanEngine.state.warsWonByPlayer || 0
        } : null,
        mail: window.mailEngine ? {
          inbox: (window.mailEngine.state.inbox || []).slice(0, 25),
          sent: (window.mailEngine.state.sent || []).slice(0, 15)
        } : null,
        skills: window.skillTreeEngine ? {
          passiveRanks: window.skillTreeEngine.passiveRanks || {},
          selectedSubclass: window.skillTreeEngine.selectedSubclass || null,
          completedMissions: Array.from(window.skillTreeEngine.completedMissions || [])
        } : null,
        sysLogs: Array.isArray(window.systemLogs) ? window.systemLogs.slice(0, 45) : null,
        netWorld: window.internetEngine ? {
          modifiedLogs,
          defaced,
          deletedFiles,
          drainedIps: Array.from(window.internetEngine.drainedNpcIps || []),
          favorites: Array.from(window.internetEngine.favorites || []),
          recentIps: (window.internetEngine.recentIps || []).slice(0, 8),
          portScannedIps: Array.from(window.internetEngine.portScannedIps || [])
        } : null,
        botnetC2: window.botnetC2 ? {
          profile: window.botnetC2.profile || 'ghost',
          accumulatedProfits: +(Number(window.botnetC2.accumulatedProfits || 0)).toFixed(2),
          slaveIps: (window.botnetC2.slaves || []).map((s) => s.ip)
        } : null,
        billsPaid,
        quitineteBilling,
        cctvState: window.cctvEngine && window.cctvEngine.state ? {
          capturedClips: (window.cctvEngine.state.capturedClips || []).slice(0, 20),
          loopedCameras: { ...(window.cctvEngine.state.loopedCameras || {}) },
          disabledCameras: { ...(window.cctvEngine.state.disabledCameras || {}) },
          deletedRecordings: { ...(window.cctvEngine.state.deletedRecordings || {}) }
        } : null,
        virusLabState: window.virusLabEngine && window.virusLabEngine.state ? {
          xp: Number(window.virusLabEngine.state.xp || 0),
          level: Number(window.virusLabEngine.state.level || 1),
          totalCompiled: Number(window.virusLabEngine.state.totalCompiled || 0),
          lastCompiledAtMs: Number(window.virusLabEngine.state.lastCompiledAtMs || 0),
          discoveredSets: Array.isArray(window.virusLabEngine.state.discoveredSets)
            ? window.virusLabEngine.state.discoveredSets.slice(0, 60)
            : [],
          creations: Array.isArray(window.virusLabEngine.state.creations)
            ? window.virusLabEngine.state.creations.slice(0, 30)
            : [],
          activeDraft: window.virusLabEngine.state.activeDraft || null
        } : null
      };
      return window.integrityGuard && typeof window.integrityGuard.signSnapshot === 'function'
        ? window.integrityGuard.signSnapshot(rawSnap)
        : rawSnap;
    }

    applyMasterSnapshot(snap, liveDbWalletBalance = null) {
      if (!snap || !window.currentProfile || !window.currentWallet) return false;
      const uid = window.currentProfile.id;

      // Se houve transferência P2P real no banco enquanto estava offline, soma a diferença!
      let targetBalance = Number(snap.walletBalance || 0);
      if (liveDbWalletBalance != null && snap.lastDbBalance != null) {
        const dbDelta = +(Number(liveDbWalletBalance) - Number(snap.lastDbBalance)).toFixed(2);
        if (Math.abs(dbDelta) >= 0.01) {
          targetBalance = Math.max(0, +(targetBalance + dbDelta).toFixed(2));
        }
      }
      const applyCoreVals = () => {
        window.currentWallet.balance = targetBalance;
        if (liveDbWalletBalance != null) {
          this.lastDbWalletBalance = Number(liveDbWalletBalance);
        }

        if (snap.reputation != null) {
          window.currentProfile.reputation = Math.max(Number(window.currentProfile.reputation || 0), Number(snap.reputation));
        }
        if (snap.heatLevel != null) {
          window.currentProfile.heat_level = Math.min(5, Math.max(1, Number(snap.heatLevel)));
        }
      };
      if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
        window.integrityGuard.runAuthorized(applyCoreVals);
      } else {
        applyCoreVals();
      }

      if (snap.netId && window.networkIdentity) {
        window.networkIdentity.userId = uid;
        window.networkIdentity.state = snap.netId;
        window.networkIdentity.save();
        window.currentProfile.public_ip = snap.netId.publicIp;
        window.currentProfile.root_password = snap.netId.rootPassword;
      }

      if (snap.hw && window.hardwareEngine) {
        window.hardwareEngine.saveRig(snap.hw);
      }

      if (snap.soft && window.softwareEngine) {
        window.softwareEngine.userId = uid;
        window.softwareEngine.state = typeof window.softwareEngine.normalizeState === 'function'
          ? window.softwareEngine.normalizeState(snap.soft)
          : snap.soft;
        if (typeof window.softwareEngine.reconcileSavedTransitions === 'function') {
          window.softwareEngine.reconcileSavedTransitions();
        }
        window.softwareEngine.save();
      }

      if (snap.btc && window.bitcoinEngine) {
        window.bitcoinEngine.userId = uid;
        window.bitcoinEngine.state = snap.btc;
        window.bitcoinEngine.save();
      }

      if (snap.xhd && window.stealthXhdEngine) {
        window.stealthXhdEngine.userId = uid;
        window.stealthXhdEngine.state = snap.xhd;
        window.stealthXhdEngine.save();
      }

      if (snap.bounce && window.bounceEngine) {
        window.bounceEngine.userId = uid;
        window.bounceEngine.state = snap.bounce;
        window.bounceEngine.save();
      }

      if (snap.banks && window.multiBankEngine) {
        window.multiBankEngine.userId = uid;
        window.multiBankEngine.state = snap.banks;
        window.multiBankEngine.save();
      }

      if (Array.isArray(snap.hdb) && window.hackedDb) {
        window.hackedDb.userId = uid;
        window.hackedDb.entries = snap.hdb;
        window.hackedDb.save();
      }

      if (snap.uni && window.universityEngine) {
        window.universityEngine.userId = uid;
        window.universityEngine.state = snap.uni;
        window.universityEngine.save();
      }

      if (snap.tut && window.tutorialEngine) {
        window.tutorialEngine.userId = uid;
        window.tutorialEngine.state = snap.tut;
        window.tutorialEngine.save();
      }

      if (snap.msn && window.missionsEngine) {
        window.missionsEngine.userId = uid;
        window.missionsEngine.state = snap.msn;
        window.missionsEngine.save();
      }

      if (snap.puz && window.puzzleTrailEngine) {
        window.puzzleTrailEngine.userId = uid;
        window.puzzleTrailEngine.state = snap.puz;
        window.puzzleTrailEngine.save();
      }

      if (snap.clan && window.clanEngine) {
        window.clanEngine.ensureLoaded();
        (snap.clan.customClans || []).forEach((cc) => {
          if (!window.clanEngine.state.clans.some((x) => x.id === cc.id)) {
            window.clanEngine.state.clans.unshift(cc);
          }
        });
        window.clanEngine.state.myClanId = snap.clan.myClanId || null;
        window.clanEngine.state.activeWar = snap.clan.activeWar || null;
        window.clanEngine.state.warsWonByPlayer = snap.clan.warsWonByPlayer || 0;
        window.clanEngine.save();
      }

      if (snap.mail && window.mailEngine) {
        window.mailEngine.userId = uid;
        window.mailEngine.state = snap.mail;
        window.mailEngine.save();
      }

      if (snap.skills && window.skillTreeEngine) {
        window.skillTreeEngine.passiveRanks = snap.skills.passiveRanks || {};
        window.skillTreeEngine.selectedSubclass = snap.skills.selectedSubclass || null;
        window.skillTreeEngine.completedMissions = new Set(snap.skills.completedMissions || []);
        if (typeof window.skillTreeEngine.saveState === 'function') {
          window.skillTreeEngine.saveState();
        }
      }

      if (window.quitineteEngine && window.quitineteEngine.bills) {
        window.quitineteEngine.userId = uid;
        if (snap.quitineteBilling) {
          if (snap.quitineteBilling.cycle) {
            window.quitineteEngine.cycle = {
              ...window.quitineteEngine.cycle,
              ...snap.quitineteBilling.cycle
            };
          }
          if (snap.quitineteBilling.months) {
            const maxCap = (window.GAME_TIME_CONFIG && window.GAME_TIME_CONFIG.MAX_ACCUMULATED_MONTHS) || 3;
            Object.entries(snap.quitineteBilling.months).forEach(([k, m]) => {
              if (window.quitineteEngine.bills[k]) {
                const clamped = Math.max(0, Math.min(maxCap, Math.round(Number(m) || 0)));
                window.quitineteEngine.bills[k].monthsDue = clamped;
                window.quitineteEngine.bills[k].paid = clamped === 0;
              }
            });
          }
          if (typeof window.quitineteEngine.saveState === 'function') {
            window.quitineteEngine.saveState();
          }
        } else if (snap.billsPaid) {
          Object.entries(snap.billsPaid).forEach(([k, paid]) => {
            if (window.quitineteEngine.bills[k]) {
              window.quitineteEngine.bills[k].paid = !!paid;
              window.quitineteEngine.bills[k].monthsDue = paid ? 0 : 1;
            }
          });
          if (typeof window.quitineteEngine.saveState === 'function') {
            window.quitineteEngine.saveState();
          }
        }
      }

      if (snap.cctvState && window.cctvEngine) {
        window.cctvEngine.userId = uid;
        window.cctvEngine.state = {
          capturedClips: Array.isArray(snap.cctvState.capturedClips) ? snap.cctvState.capturedClips : [],
          loopedCameras: snap.cctvState.loopedCameras && typeof snap.cctvState.loopedCameras === 'object' ? snap.cctvState.loopedCameras : {},
          disabledCameras: snap.cctvState.disabledCameras && typeof snap.cctvState.disabledCameras === 'object' ? snap.cctvState.disabledCameras : {},
          deletedRecordings: snap.cctvState.deletedRecordings && typeof snap.cctvState.deletedRecordings === 'object' ? snap.cctvState.deletedRecordings : {}
        };
        window.cctvEngine.save();
      }

      if (snap.virusLabState && window.virusLabEngine) {
        window.virusLabEngine.userId = uid;
        window.virusLabEngine.state = typeof window.virusLabEngine.normalizeState === 'function'
          ? window.virusLabEngine.normalizeState(snap.virusLabState)
          : snap.virusLabState;
        window.virusLabEngine.save();
      }

      if (snap.stealthLoot && window.stealthXhdEngine) {
        window.stealthXhdEngine.revealedHosts = new Set(snap.stealthLoot.revealedHosts || []);
        window.stealthXhdEngine.claimedHiddenLoot = new Set(snap.stealthLoot.claimedHiddenLoot || []);
      }

      if (snap.tour) {
        if (window.spotlightTour) {
          if (snap.tour.done) window.spotlightTour.statusByUid[uid] = snap.tour.done;
          if (snap.tour.rewarded) window.spotlightTour.rewardedByUid[uid] = snap.tour.rewarded;
        }
        try {
          if (snap.tour.done) localStorage.setItem(`HC_SPOTLIGHT_TOUR_DONE_${uid}`, snap.tour.done);
          if (snap.tour.rewarded) localStorage.setItem(`HC_SPOTLIGHT_TOUR_REWARDED_${uid}`, snap.tour.rewarded);
        } catch (e) {}
      }

      if (Array.isArray(snap.sysLogs) && snap.sysLogs.length > 0) {
        window.systemLogs = snap.sysLogs;
        try {
          localStorage.setItem(`HC_SYSTEM_LOGS_${uid}`, JSON.stringify(window.systemLogs));
        } catch (e) {}
      }

      if (snap.netWorld) {
        if (snap.netWorld.modifiedLogs && window.botAI && window.botAI.syslogRegistry) {
          Object.entries(snap.netWorld.modifiedLogs).forEach(([ip, lines]) => {
            if (Array.isArray(lines)) window.botAI.syslogRegistry.set(ip, lines);
          });
        }
        if (window.internetEngine) {
          if (snap.netWorld.defaced && window.internetEngine.defacedPages) {
            Object.entries(snap.netWorld.defaced).forEach(([ip, html]) => {
              window.internetEngine.defacedPages.set(ip, html);
            });
          }
          if (snap.netWorld.deletedFiles && window.internetEngine.deletedHostFiles) {
            Object.entries(snap.netWorld.deletedFiles).forEach(([ip, arr]) => {
              window.internetEngine.deletedHostFiles.set(ip, new Set(arr || []));
            });
          }
          if (Array.isArray(snap.netWorld.drainedIps)) {
            window.internetEngine.drainedNpcIps = new Set(snap.netWorld.drainedIps);
          }
          if (Array.isArray(snap.netWorld.favorites)) {
            window.internetEngine.favorites = new Set(snap.netWorld.favorites);
          }
          if (Array.isArray(snap.netWorld.recentIps) && snap.netWorld.recentIps.length > 0) {
            window.internetEngine.recentIps = snap.netWorld.recentIps;
          }
          if (Array.isArray(snap.netWorld.portScannedIps)) {
            window.internetEngine.portScannedIps = new Set(snap.netWorld.portScannedIps);
          }
        }
      }

      if (snap.botnetC2 && window.botnetC2 && window.botRegistry) {
        if (snap.botnetC2.profile) window.botnetC2.setProfile(snap.botnetC2.profile);
        window.botnetC2.slaves = [];
        (snap.botnetC2.slaveIps || []).forEach((ip) => {
          const b = window.botRegistry.getBotByIp(ip);
          if (b && !window.botnetC2.slaves.some((s) => s.ip === b.ip)) {
            const rate = b.tier === 1 ? 0.35 : (b.tier === 2 ? 1.20 : 3.50);
            window.botnetC2.slaves.push({ ip: b.ip, handle: b.handle, tier: b.tier, baseRate: rate });
          }
        });
        if (snap.botnetC2.accumulatedProfits != null) {
          window.botnetC2.accumulatedProfits = Number(snap.botnetC2.accumulatedProfits) || 0;
        }
      }

      return true;
    }

    saveLocalSnapshotImmediate() {
      const snap = this.collectMasterSnapshot();
      if (!snap) return null;
      try {
        localStorage.setItem(this.masterSaveKey(snap.userId), JSON.stringify(snap));
      } catch (e) {}
      if (window.offlinePvpMailbox && typeof window.offlinePvpMailbox.upsertPublicDirectoryEntry === 'function') {
        window.offlinePvpMailbox.upsertPublicDirectoryEntry(this.buildMyPublicPeerDescriptor());
      }
      return snap;
    }

    scheduleSave(immediateCloud = false) {
      if (!window.currentProfile || !window.currentWallet) return;
      this.saveLocalSnapshotImmediate();

      if (immediateCloud) {
        clearTimeout(this.saveTimer);
        this.pushSnapshotToCloud();
        return;
      }

      clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => {
        this.pushSnapshotToCloud();
      }, 1400);
    }

    async pushSnapshotToCloud() {
      const snap = this.saveLocalSnapshotImmediate();
      if (!snap) return { success: false };

      this.broadcastLocalPresence();

      if (!window.supabase) {
        this.syncStatus = 'local_only';
        this.lastSyncedAt = new Date().toLocaleTimeString();
        this.updateHudSyncChip();
        return { success: true, mode: 'local_only' };
      }

      this.syncStatus = 'syncing';
      this.updateHudSyncChip();
      const me = this.buildMyPublicPeerDescriptor();
      const isInstantOp = String(snap.userId || '').startsWith('local-') ||
        String(snap.userId || '').startsWith('uid-') ||
        !!sessionStorage.getItem('HC_TAB_INSTANT_SESSION');

      let cloudSaved = false;

      // 1) Tentar Stored Procedure Anti-Cheat sync_account_snapshot_secure (com trava de posse p_write_secret + fallback compatível)
      if (this.cloudTablesAvailable !== false && typeof window.supabase.rpc === 'function') {
        try {
          const baseRpcArgs = {
            p_operator_key: String(snap.userId),
            p_hacker_tag: me.hackerTag,
            p_specialty: me.specialty,
            p_wallet_balance: snap.walletBalance,
            p_reputation: snap.reputation,
            p_heat_level: snap.heatLevel,
            p_public_ip: me.publicIp,
            p_best_soft_ver: me.bestSoftVer,
            p_ddos_gbps: me.ddosGbps,
            p_firewall_ver: me.firewallVer,
            p_hasher_ver: me.hasherVer,
            p_antivirus_ver: me.antivirusVer,
            p_cpu_mhz: me.cpuMhz,
            p_net_mbps: me.netMbps,
            p_hdd_total_mb: me.hddTotalMb,
            p_ram_total_mb: me.ramTotalMb,
            p_hardware_health_pct: me.hardwareHealthPct ?? 100,
            p_clan_tag: me.clanTag,
            p_custom_web_page: me.customWebPage,
            p_public_syslog: (window.systemLogs || []).slice(0, 18),
            p_save_payload: snap
          };
          let { data, error } = await window.supabase.rpc('sync_account_snapshot_secure', {
            ...baseRpcArgs,
            p_write_secret: this.getOrCreateWriteSecret(snap.userId)
          });
          if (error && (error.code === 'PGRST202' || String(error.message || '').includes('p_write_secret'))) {
            const retry = await window.supabase.rpc('sync_account_snapshot_secure', baseRpcArgs);
            data = retry.data;
            error = retry.error;
          }
          if (!error && data && data.success) {
            this.cloudTablesAvailable = true;
            if (data.cheat_blocked && window.integrityGuard) {
              window.integrityGuard.runAuthorized(() => {
                if (data.synced_balance != null) window.currentWallet.balance = Number(data.synced_balance);
                if (data.synced_rep != null) window.currentProfile.reputation = Number(data.synced_rep);
              });
              if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
            }
            this.lastDbWalletBalance = Number(window.currentWallet.balance || snap.walletBalance);
            cloudSaved = true;
          } else if (error && (error.code === 'PGRST202' || String(error.message || '').includes('Could not find'))) {
            this.cloudTablesAvailable = false;
          }
        } catch (e) {}
      }

      // 2) Fallback nativo p/ contas autenticadas via Supabase Auth (user_metadata + profiles & wallets)
      if (!isInstantOp) {
        try {
          if (window.supabase.auth && typeof window.supabase.auth.updateUser === 'function') {
            const { error: uErr } = await window.supabase.auth.updateUser({
              data: { hc_save_v2: snap }
            });
            if (!uErr) cloudSaved = true;
          }
          if (this.cloudTablesAvailable === false) {
            await Promise.allSettled([
              window.supabase.from('profiles').update({
                reputation: snap.reputation,
                heat_level: snap.heatLevel
              }).eq('id', snap.userId),
              window.supabase.from('wallets').update({
                balance: snap.walletBalance
              }).eq('user_id', snap.userId)
            ]);
            this.lastDbWalletBalance = snap.walletBalance;
          }
        } catch (e) {}
      }

      // 3) Atualizar presença ao vivo no canal Global Realtime WebSocket ('hc-mmo-world')!
      this.trackRealtimePresence();

      this.syncStatus = (cloudSaved || this.realtimeChannel) ? 'synced' : 'local_only';
      this.lastSyncedAt = new Date().toLocaleTimeString();
      this.updateHudSyncChip();
      if (window.winManager && window.winManager.current === 'winOnline') {
        this.renderOnlineHubUI();
      }
      return { success: true, mode: this.syncStatus };
    }

    // Chamado no boot da sessão (inclusive após F5!) para restaurar o save mais recente (Local vs Nuvem)
    async hydrateSessionAndConnect(userId, dbWalletBalance = null) {
      this.userId = userId;
      this.lastDbWalletBalance = dbWalletBalance != null ? Number(dbWalletBalance) : null;

      let localSnap = null;
      try {
        const raw = localStorage.getItem(this.masterSaveKey(userId));
        if (raw) {
          const parsed = JSON.parse(raw);
          if (window.integrityGuard && typeof window.integrityGuard.verifySnapshot === 'function') {
            const ver = window.integrityGuard.verifySnapshot(parsed);
            if (ver.valid) {
              localSnap = parsed;
            } else {
              // Save local adulterado manualmente no F12/Application: descarta valores forjados!
              localSnap = null;
              try { localStorage.removeItem(this.masterSaveKey(userId)); } catch (e) {}
            }
          } else {
            localSnap = parsed;
          }
        }
      } catch (e) {}

      let cloudSnap = null;
      const isInstantOp = String(userId || '').startsWith('local-') ||
        String(userId || '').startsWith('uid-') ||
        !!sessionStorage.getItem('HC_TAB_INSTANT_SESSION');

      if (window.supabase) {
        // 1) Carregar save privado APENAS via RPC autenticada load_my_account_snapshot_secure (impede leitura de save_payload de terceiros!)
        if (this.cloudTablesAvailable !== false) {
          try {
            let loadedViaSecureRpc = false;
            if (typeof window.supabase.rpc === 'function') {
              const { data: secData, error: secErr } = await window.supabase.rpc('load_my_account_snapshot_secure', {
                p_operator_key: String(userId),
                p_write_secret: this.getOrCreateWriteSecret(userId)
              });
              if (!secErr && secData && secData.success && secData.save_payload && secData.save_payload.savedAt) {
                this.cloudTablesAvailable = true;
                cloudSnap = secData.save_payload;
                loadedViaSecureRpc = true;
              }
            }
            if (!loadedViaSecureRpc) {
              const { data, error } = await window.supabase
                .from('player_cloud_saves')
                .select('save_payload, wallet_balance')
                .eq('operator_key', String(userId))
                .maybeSingle();
              if (!error && data && data.save_payload && data.save_payload.savedAt) {
                this.cloudTablesAvailable = true;
                cloudSnap = data.save_payload;
              } else if (error && (error.code === 'PGRST205' || error.code === '42703')) {
                this.cloudTablesAvailable = false;
              }
            }
          } catch (e) {}
        }

        // 2) Checar Supabase Auth user_metadata.hc_save_v2 (para contas Auth)
        if (!isInstantOp) {
          try {
            const { data: uData } = await window.supabase.auth.getUser();
            const metaSnap = uData?.user?.user_metadata?.hc_save_v2;
            if (metaSnap && metaSnap.savedAt) {
              if (!cloudSnap || metaSnap.savedAt > cloudSnap.savedAt) {
                cloudSnap = metaSnap;
              }
            }
          } catch (e) {}
        }
      }

      // Escolher o snapshot mais recente entre Local e Nuvem!
      let winner = localSnap;
      if (cloudSnap && (!localSnap || (cloudSnap.savedAt || 0) > (localSnap.savedAt || 0))) {
        winner = cloudSnap;
      }

      if (winner) {
        this.applyMasterSnapshot(winner, dbWalletBalance);
        this.saveLocalSnapshotImmediate();
      } else {
        this.saveLocalSnapshotImmediate();
      }

      await this.connectMultiplayerMesh();
      if (window.offlinePvpMailbox && typeof window.offlinePvpMailbox.flushPendingForCurrentPlayer === 'function') {
        await window.offlinePvpMailbox.flushPendingForCurrentPlayer();
      }
      if (window.clanCloudChatEngine) {
        window.clanCloudChatEngine.syncClansFromCloud();
      }
      if (window.playerBountyEngine) {
        window.playerBountyEngine.syncFromCloud();
      }
      this.syncStatus = this.realtimeChannel ? 'synced' : 'local_only';
      this.lastSyncedAt = new Date().toLocaleTimeString();
      this.updateHudSyncChip();
    }

    // =========================================================================
    // REDE MULTIPLAYER REALTIME: PRESENCE + DIRETÓRIO PROFILES + EVENTOS PVP
    // =========================================================================
    async connectMultiplayerMesh() {
      this.broadcastLocalPresence();
      if (this.localBus) {
        try { this.localBus.postMessage({ type: 'PRESENCE_REQUEST' }); } catch (e) {}
      }

      const uid = window.currentProfile ? window.currentProfile.id : null;

      // 0. Carregar jogadores registrados no diretório persistente local (permite PvP contra jogadores OFFLINE!)
      if (window.offlinePvpMailbox && typeof window.offlinePvpMailbox.getKnownDirectoryPeers === 'function') {
        window.offlinePvpMailbox.getKnownDirectoryPeers(uid).forEach((savedPeer) => {
          this.registerDiscoveredPeer({ ...savedPeer, onlineNow: false }, false);
        });
      }

      if (!window.supabase || !window.currentProfile) return;
      const isInstantOp = String(uid).startsWith('local-') ||
        String(uid).startsWith('uid-') ||
        !!sessionStorage.getItem('HC_TAB_INSTANT_SESSION');

      // 1. Carregar todos os operadores reais cadastrados em public.profiles!
      try {
        const { data: profs } = await window.supabase
          .from('profiles')
          .select('id, hacker_tag, specialty, reputation, heat_level, created_at')
          .order('reputation', { ascending: false })
          .limit(60);

        if (Array.isArray(profs)) {
          profs.forEach((pr) => {
            if (pr.id === uid) return;
            const rep = Number(pr.reputation || 100);
            const estVer = rep >= 3000 ? 3.0 : (rep >= 1000 ? 2.0 : (rep >= 300 ? 1.5 : 1.0));
            this.registerDiscoveredPeer({
              userId: pr.id,
              hackerTag: pr.hacker_tag,
              specialty: pr.specialty || 'exploiter',
              publicIp: deterministicIpFromUserId(pr.id),
              reputation: rep,
              heatLevel: pr.heat_level || 1,
              firewallVer: estVer,
              hasherVer: estVer,
              antivirusVer: estVer,
              bestSoftVer: estVer,
              ddosGbps: +(rep / 850).toFixed(2),
              cpuMhz: rep >= 1000 ? 4000 : 1200,
              netMbps: rep >= 1000 ? 100 : 10,
              onlineNow: false
            }, false);
          });
        }
      } catch (e) {}

      // 2. Diretório público seguro (via get_public_mmo_directory sem nunca expor save_payload privado!)
      if (this.cloudTablesAvailable !== false) {
        try {
          let saves = null;
          let sErr = null;
          if (typeof window.supabase.rpc === 'function') {
            const rpcRes = await window.supabase.rpc('get_public_mmo_directory', { p_limit: 60 });
            if (!rpcRes.error && Array.isArray(rpcRes.data)) {
              saves = rpcRes.data;
            }
          }
          if (!saves) {
            const fbRes = await window.supabase
              .from('player_cloud_saves')
              .select('operator_key, user_id, hacker_tag, public_ip, specialty, reputation, heat_level, best_soft_ver, ddos_gbps, firewall_ver, hasher_ver, antivirus_ver, cpu_mhz, net_mbps, hardware_health_pct, clan_tag, last_seen_at')
              .limit(60);
            saves = fbRes.data;
            sErr = fbRes.error;
          }
          if (!sErr && Array.isArray(saves)) {
            this.cloudTablesAvailable = true;
            saves.forEach((sv) => {
              const peerKey = sv.operator_key || sv.user_id;
              if (!peerKey || peerKey === uid) return;
              this.registerDiscoveredPeer({
                userId: peerKey,
                hackerTag: sv.hacker_tag,
                specialty: sv.specialty,
                publicIp: sv.public_ip,
                reputation: Number(sv.reputation || 100),
                heatLevel: Number(sv.heat_level || 1),
                bestSoftVer: Number(sv.best_soft_ver || 1.0),
                ddosGbps: Number(sv.ddos_gbps || 0),
                firewallVer: Number(sv.firewall_ver || 1.0),
                hasherVer: Number(sv.hasher_ver || 1.0),
                antivirusVer: Number(sv.antivirus_ver || 1.0),
                cpuMhz: Number(sv.cpu_mhz || 800),
                netMbps: Number(sv.net_mbps || 1),
                hardwareHealthPct: Number(sv.hardware_health_pct ?? 100),
                clanTag: sv.clan_tag || null
              }, false);
            });
          } else if (sErr && (sErr.code === 'PGRST205' || sErr.code === '42703')) {
            this.cloudTablesAvailable = false;
          }
        } catch (e) {}
      }

      // 3. Ler beacons recentes de diretório e fila PvP/Mail via chat_messages (apenas sessões autenticadas c/ JWT; 1-Clique usa Realtime + pvp_network_events!)
      if (!isInstantOp) {
        try {
          const { data: netMsgs } = await window.supabase
            .from('chat_messages')
            .select('id, user_id, hacker_tag, message, channel, created_at')
            .in('channel', ['hc_dir', 'hc_pvp'])
            .order('created_at', { ascending: false })
            .limit(45);

          if (Array.isArray(netMsgs)) {
            netMsgs.reverse().forEach((row) => {
              try {
                const pkt = JSON.parse(row.message);
                if (row.channel === 'hc_dir' && pkt && pkt.ip) {
                  this.registerDiscoveredPeer({
                    userId: row.user_id,
                    hackerTag: row.hacker_tag,
                    publicIp: pkt.ip,
                    reputation: pkt.rep || 100,
                    firewallVer: pkt.fw || 1.0,
                    hasherVer: pkt.hs || 1.0,
                    antivirusVer: pkt.av || 1.0,
                    bestSoftVer: pkt.bs || 1.0,
                    clanTag: pkt.cl || null
                  }, false);
                } else if (row.channel === 'hc_pvp' && pkt && pkt.pktId) {
                  const seenKey = `HC_PKT_ACK_${uid}_${pkt.pktId}`;
                  if (!localStorage.getItem(seenKey)) {
                    const hit = this.handleIncomingPacket(pkt, true);
                    if (hit) {
                      try { localStorage.setItem(seenKey, '1'); } catch (e) {}
                    }
                  }
                }
              } catch (e) {}
            });
          }
        } catch (e) {}
      }

      // 4. Conectar 100% dos Operadores (Auth E Entrada 1-Clique!) ao Canal Global Supabase Realtime 'hc-mmo-world' (<80ms entre casas/redes!)
      if (typeof window.supabase.channel === 'function') {
        if (this.realtimeChannel) {
          try { window.supabase.removeChannel(this.realtimeChannel); } catch (e) {}
        }

        const ch = window.supabase.channel('hc-mmo-world', {
          config: {
            presence: { key: uid },
            broadcast: { self: false }
          }
        });

        ch.on('presence', { event: 'sync' }, () => {
          const state = ch.presenceState();
          this.onlinePeers.clear();
          Object.values(state || {}).forEach((presList) => {
            (presList || []).forEach((peer) => {
              if (peer && peer.userId && peer.userId !== uid) {
                this.registerDiscoveredPeer(peer, true);
                if (window.offlinePvpMailbox) {
                  window.offlinePvpMailbox.upsertPublicDirectoryEntry(peer);
                }
              }
            });
          });
          this.updateHudSyncChip();
          if (window.winManager && window.winManager.current === 'winOnline') {
            this.renderOnlineHubUI();
          }
        });

        ch.on('broadcast', { event: 'pvp_packet' }, (payload) => {
          if (payload && payload.payload) {
            this.handleIncomingPacket(payload.payload, false);
          }
        });

        ch.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            this.syncStatus = 'synced';
            this.trackRealtimePresence();
            if (!isInstantOp) {
              this.publishDirectoryBeacon();
            }
            this.updateHudSyncChip();
          }
        });

        this.realtimeChannel = ch;
      }
    }

    trackRealtimePresence() {
      const me = this.buildMyPublicPeerDescriptor();
      this.broadcastLocalPresence();
      if (this.realtimeChannel) {
        try { this.realtimeChannel.track(me); } catch (e) {}
      }
    }

    async publishDirectoryBeacon() {
      if (!window.supabase || !window.currentProfile) return;
      const uid = String(window.currentProfile.id || '');
      if (uid.startsWith('local-') || uid.startsWith('uid-') || !!sessionStorage.getItem('HC_TAB_INSTANT_SESSION')) return;

      const lastBeaconKey = `HC_LAST_DIR_BEACON_${uid}`;
      const me = this.buildMyPublicPeerDescriptor();
      const compact = JSON.stringify({
        ip: me.publicIp,
        rep: me.reputation,
        fw: me.firewallVer,
        hs: me.hasherVer,
        av: me.antivirusVer,
        bs: me.bestSoftVer,
        cl: me.clanTag
      });

      if (sessionStorage.getItem(lastBeaconKey) === compact) return;
      sessionStorage.setItem(lastBeaconKey, compact);

      try {
        await window.supabase.from('chat_messages').insert({
          user_id: window.currentProfile.id,
          hacker_tag: window.currentProfile.hacker_tag,
          message: compact.slice(0, 248),
          channel: 'hc_dir'
        });
      } catch (e) {}
    }

    // Dispara pacote PvP / Mail / Guerra em Tempo Real (BroadcastChannel + Supabase Broadcast + Fila Persistente)
    async sendPvpPacket(packetData) {
      if (!window.currentProfile) return { sent: false };
      const pkt = {
        pktId: 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
        senderId: window.currentProfile.id,
        senderTag: window.currentProfile.hacker_tag,
        at: new Date().toLocaleTimeString(),
        ...packetData
      };
      this.processedPacketIds.add(pkt.pktId);

      // 0) Enfileirar na Caixa Postal Offline Persistente (garante entrega mesmo se a vítima estiver com o navegador fechado!)
      if (window.offlinePvpMailbox && typeof window.offlinePvpMailbox.enqueuePacket === 'function') {
        window.offlinePvpMailbox.enqueuePacket(pkt);
      }

      // 1) Entrega instantânea entre abas/janelas locais (< 5ms)
      if (this.localBus) {
        try { this.localBus.postMessage({ type: 'PVP_PACKET', packet: pkt }); } catch (e) {}
      }

      // 2) Entrega WebSocket global (< 80ms) via Supabase Realtime Broadcast
      if (this.realtimeChannel) {
        try {
          this.realtimeChannel.send({
            type: 'broadcast',
            event: 'pvp_packet',
            payload: pkt
          });
        } catch (e) {}
      }

      // 3) Persistência na nuvem p/ caso o alvo esteja offline ou em outra rede!
      const uid = String(window.currentProfile.id || '');
      const isInstantOp = uid.startsWith('local-') ||
        uid.startsWith('uid-') ||
        !!sessionStorage.getItem('HC_TAB_INSTANT_SESSION');

      if (window.supabase) {
        if (this.cloudTablesAvailable) {
          try {
            await window.supabase.from('pvp_network_events').insert({
              sender_key: String(pkt.senderId),
              sender_tag: pkt.senderTag,
              sender_visible_ip: pkt.visibleIp || '0.0.0.0',
              target_operator_key: pkt.targetUserId ? String(pkt.targetUserId) : null,
              target_tag: pkt.targetTag || null,
              target_ip: pkt.targetIp || null,
              event_kind: pkt.kind,
              payload: pkt
            });
          } catch (e) {}
        } else if (!isInstantOp) {
          try {
            const compactWire = JSON.stringify({
              pktId: pkt.pktId,
              kind: pkt.kind,
              senderId: pkt.senderId,
              senderTag: pkt.senderTag,
              visibleIp: pkt.visibleIp,
              targetUserId: pkt.targetUserId,
              targetTag: pkt.targetTag,
              targetIp: pkt.targetIp,
              d: pkt.d || {}
            });
            if (compactWire.length <= 248) {
              await window.supabase.from('chat_messages').insert({
                user_id: pkt.senderId,
                hacker_tag: pkt.senderTag,
                message: compactWire,
                channel: 'hc_pvp'
              });
            }
          } catch (e) {}
        }
      }

      this.livePvpFeed.unshift({
        at: pkt.at,
        dir: 'OUT',
        summary: this.describePacket(pkt)
      });
      if (this.livePvpFeed.length > 25) this.livePvpFeed.length = 25;
      return { sent: true, pktId: pkt.pktId };
    }

    describePacket(pkt) {
      if (pkt.kind === 'PVP_INTRUSION') return `Invasão SSH (${pkt.d?.method || 'ROOT'}) contra ${pkt.targetIp} (origem visível: ${pkt.visibleIp})`;
      if (pkt.kind === 'PVP_VIRUS_PLANT') return `Vírus ${pkt.d?.fn || 'Malware'} v${((pkt.d?.ver || 10) / 10).toFixed(1)} enviado para ${pkt.targetIp}`;
      if (pkt.kind === 'PVP_VIRUS_HIDE') return `Camuflagem Hider v${Number(pkt.d?.hiddenWithVer || 1).toFixed(1)} aplicada em ${pkt.targetIp}`;
      if (pkt.kind === 'PVP_AV_PURGED') return `Antivirus.av de ${pkt.d?.victimIp || pkt.visibleIp} expurgou seu vírus (${pkt.d?.fn || 'Malware'})`;
      if (pkt.kind === 'PVP_WIPE_LOG') return `Rastro de ${pkt.visibleIp} limpo em ${pkt.targetIp}:/var/log/syslog`;
      if (pkt.kind === 'PVP_EDIT_LOG') return `Log editada / farpa deixada em ${pkt.targetIp}:/var/log/syslog`;
      if (pkt.kind === 'PVP_DRAIN_WALLET') return `Drenagem PvP de $ ${pkt.d?.amt || 0} HC em ${pkt.targetIp}`;
      if (pkt.kind === 'PVP_DDOS_DAMAGE') return `Sobrecarga DDoS (${pkt.d?.gbps || 1} Gbps) causou -${pkt.d?.damagePct || 35}% de dano às peças de ${pkt.targetIp}`;
      if (pkt.kind === 'P2P_MAIL') return `E-mail criptografado de ${pkt.senderTag} → ${pkt.targetTag}: "${pkt.d?.sub || ''}"`;
      if (pkt.kind === 'CLAN_WAR_STRIKE') return `Ataque DDoS de Guerra [${pkt.d?.fromClan}] → [${pkt.d?.toClan}] (+${pkt.d?.pts} pts)`;
      if (pkt.kind === 'CLAN_SYNC') return `Clã global [${pkt.d?.clan?.tag || '?'}] sincronizado na rede`;
      if (pkt.kind === 'CLAN_CHAT_MSG') return `Mensagem no Chat Privado do Clã #[${pkt.d?.clanTag || '?'}]`;
      if (pkt.kind === 'BOUNTY_POSTED') return `Contrato de Vingança publicado contra "${pkt.d?.bounty?.targetTag || '?'}" ($ ${pkt.d?.bounty?.rewardCash || 0} HC)`;
      if (pkt.kind === 'BOUNTY_CLAIMED') return `Vingança cumprida contra "${pkt.d?.targetTag || '?'}" por ${pkt.d?.claimedByTag || 'Caçador'}`;
      return `Pacote ${pkt.kind}`;
    }

    handleIncomingPacket(pkt, silentReplay = false) {
      if (!pkt || !pkt.pktId || !window.currentProfile) return false;
      if (this.processedPacketIds.has(pkt.pktId)) return false;
      if (pkt.senderId === window.currentProfile.id) return false;

      const myId = window.currentProfile.id;
      const myTag = (window.currentProfile.hacker_tag || '').toLowerCase();
      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '';
      const myClan = window.clanEngine ? window.clanEngine.getMyClan() : null;

      const isForMeById = pkt.targetUserId && pkt.targetUserId === myId;
      const isForMeByTag = pkt.targetTag && pkt.targetTag.toLowerCase() === myTag;
      const isForMeByIp = pkt.targetIp && pkt.targetIp === myIp;
      const isGlobalBroadcast = ['CLAN_WAR_STRIKE', 'CLAN_SYNC', 'BOUNTY_POSTED', 'BOUNTY_CLAIMED'].includes(pkt.kind);
      const isMyClanChat = pkt.kind === 'CLAN_CHAT_MSG' && myClan && pkt.d?.clanTag === myClan.tag;

      if (!isForMeById && !isForMeByTag && !isForMeByIp && !isGlobalBroadcast && !isMyClanChat) {
        return false;
      }

      this.processedPacketIds.add(pkt.pktId);
      this.livePvpFeed.unshift({
        at: pkt.at || new Date().toLocaleTimeString(),
        dir: 'IN',
        summary: this.describePacket(pkt)
      });
      if (this.livePvpFeed.length > 25) this.livePvpFeed.length = 25;

      // VALIDAÇÃO KERNEL LOCAL DO DEFENSOR (Firewall.fwl & Hasher.hash):
      // Se meu Firewall.fwl (ou Hasher.hash) for mais forte que o software usado pelo atacante humano, BLOQUEIA no ato!
      if (['PVP_INTRUSION', 'PVP_VIRUS_PLANT', 'PVP_DRAIN_WALLET', 'PVP_EDIT_LOG'].includes(pkt.kind) && isForMeByIp && window.softwareEngine) {
        const myFw = window.softwareEngine.getSoftwareVersion('firewall');
        const myHs = window.softwareEngine.getSoftwareVersion('hasher');
        const attCrc = Number(pkt.d?.crcVer || 1.0);
        const attExp = Number(pkt.d?.expVer || 1.0);
        const method = pkt.d?.method || 'password';

        const blockedByFw = method === 'exploit' ? (myFw > attExp) : (myFw > Math.max(attCrc, attExp));
        const blockedByHs = method !== 'exploit' && (myHs > attCrc);

        if (blockedByFw || blockedByHs) {
          const shield = blockedByFw ? `Firewall.fwl v${myFw.toFixed(1)}` : `Hasher.hash v${myHs.toFixed(1)}`;
          if (typeof window.addLocalLog === 'function') {
            window.addLocalLog(
              'FIREWALL-PVP-BLOCK',
              `Seu ${shield} BLOQUEOU tentativa de invasão/ação PvP de ${pkt.visibleIp}!`,
              'success'
            );
          }
          if (!silentReplay && typeof window.showToast === 'function') {
            window.showToast(`Escudo PvP: seu ${shield} bloqueou ataque de ${pkt.visibleIp}!`);
          }
          return true;
        }
      }

      // 1) Invasão PvP Real: grava o IP visível do atacante (ou último salto de Bounce!) nos seus Logs!
      if (pkt.kind === 'PVP_INTRUSION' && isForMeByIp) {
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog(
            'PVP-INTRUSION',
            `ALERTA DE INVASÃO HUMANA: ${pkt.visibleIp} acessou ${(pkt.d?.role || 'root').toUpperCase()} no seu PC (${myIp}) via ${(pkt.d?.method || 'SSH').toUpperCase()}!`,
            'danger'
          );
        }
        if (!silentReplay) {
          if (window.hackerAudio && typeof window.hackerAudio.playErrorBuzz === 'function') window.hackerAudio.playErrorBuzz();
          if (typeof window.showToast === 'function') {
            window.showToast(`ALERTA PVP: ${pkt.visibleIp} invadiu seu IP (${myIp})! Cheque a aba Logs!`);
          }
        }
      }

      // 2) Vírus Hostil Real plantado por outro jogador na sua máquina (respeitando potência v1.0->v10.0 e Hider)!
      if (pkt.kind === 'PVP_VIRUS_PLANT' && isForMeByIp && window.softwareEngine) {
        const fn = pkt.d?.fn || 'Trojan.vspam';
        const verInt = Number(pkt.d?.ver || 15);
        const hiddenWithVer = Number(pkt.d?.hiddenWithVer || 0);
        window.softwareEngine.infectLocalPc(
          'pvp_' + fn,
          `${fn} (PvP)`,
          verInt,
          pkt.visibleIp || 'desconhecido',
          hiddenWithVer,
          pkt.senderId || null
        );
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog(
            'PVP-MALWARE',
            `${pkt.visibleIp} instalou ${fn} (v${(verInt / 10).toFixed(1)}) na sua RAM! (Exige Antivirus.av >= v${(verInt / 10).toFixed(1)} p/ remover!)`,
            'danger'
          );
        }
        if (!silentReplay && typeof window.showToast === 'function') {
          window.showToast(`PERIGO: Um jogador plantou ${fn} v${(verInt / 10).toFixed(1)} no seu PC!`);
        }
      }

      // 2b) Atacante camuflou o vírus no seu PC usando Hider.hdr!
      if (pkt.kind === 'PVP_VIRUS_HIDE' && isForMeByIp && window.softwareEngine) {
        window.softwareEngine.ensureLoaded();
        const hVer = Number(pkt.d?.hiddenWithVer || 1.5);
        const list = window.softwareEngine.state.localHostileInfections || [];
        const targetInf = list.find((inf) => inf.attackerUserId === pkt.senderId || String(inf.label).includes(pkt.d?.fn || ''));
        if (targetInf) {
          targetInf.hiddenWithVer = hVer;
          targetInf.revealed = false;
          window.softwareEngine.save();
          if (window.winManager && window.winManager.current === 'winSoftware') {
            window.softwareEngine.renderUI();
          }
        }
      }

      // 2c) Vítima limpou nosso vírus com Antivirus.av >= versão do vírus (ou Formatar HD)!
      if (pkt.kind === 'PVP_AV_PURGED' && (isForMeById || isForMeByIp) && window.softwareEngine) {
        const victimIp = pkt.d?.victimIp || pkt.visibleIp;
        const avVer = Number(pkt.d?.avVer || 10);
        window.softwareEngine.handleRemoteVirusPurgedByVictim(victimIp, avVer);
      }

      // 3) Atacante apagou o próprio rastro de IP e/ou editou sua /var/log/syslog deixando farpa/recado!
      if ((pkt.kind === 'PVP_WIPE_LOG' || pkt.kind === 'PVP_EDIT_LOG') && isForMeByIp && Array.isArray(window.systemLogs)) {
        const ipToRemove = pkt.visibleIp;
        const wipedOwnIp = pkt.kind === 'PVP_WIPE_LOG' ? true : !!pkt.d?.wipedOwnIp;
        const fullClear = !!pkt.d?.fullClear;
        const customLines = Array.isArray(pkt.d?.customLines) ? pkt.d.customLines : [];
        const attackerLabel = pkt.senderTag || 'INVASOR';

        if (fullClear) {
          window.systemLogs = [];
        } else if (wipedOwnIp && ipToRemove) {
          window.systemLogs = window.systemLogs.filter((entry) => !String(entry.msg || '').includes(ipToRemove));
        }

        // Se o invasor limpou o próprio IP da sua log, apaga também a pista de IP visível na Quarentena dos malwares dele!
        if ((fullClear || wipedOwnIp) && window.softwareEngine) {
          window.softwareEngine.ensureLoaded();
          (window.softwareEngine.state.localHostileInfections || []).forEach((inf) => {
            if ((pkt.senderId && inf.attackerUserId === pkt.senderId) || (ipToRemove && inf.attackerIp === ipToRemove)) {
              inf.attackerIp = `RASTRO APAGADO POR ${attackerLabel}`;
            }
          });
          window.softwareEngine.save();
          if (window.winManager && window.winManager.current === 'winSoftware') {
            window.softwareEngine.renderUI();
          }
        }

        // Injeta qualquer linha editada / farpa escrita pelo invasor na log local da vítima (sem revelar o IP se ele apagou!)
        if (customLines.length > 0 && typeof window.addLocalLog === 'function') {
          [...customLines].reverse().forEach((lineText) => {
            const cleanLine = String(lineText || '').trim().slice(0, 260);
            if (cleanLine) {
              window.addLocalLog('FARPA-PVP', cleanLine, 'danger');
            }
          });
          if (!silentReplay && typeof window.showToast === 'function') {
            window.showToast(`💀 ${attackerLabel} editou sua log local: "${String(customLines[0]).slice(0, 72)}"`);
          }
        }

        const lsKey = typeof window.getSystemLogsStorageKey === 'function' ? window.getSystemLogsStorageKey() : 'HC_SYSTEM_LOGS';
        try { localStorage.setItem(lsKey, JSON.stringify(window.systemLogs)); } catch (e) {}
        if (window.winManager && window.winManager.current === 'winLogs' && typeof window.renderLogsPage === 'function') {
          window.renderLogsPage();
        }
      }

      // 4) Saque PvP na carteira corrente exposta (nunca afeta Contas Offshore!)
      if (pkt.kind === 'PVP_DRAIN_WALLET' && isForMeByIp && window.currentWallet) {
        const maxTake = Math.min(450, Math.round(parseFloat(window.currentWallet.balance || 0) * 0.12));
        const lost = Math.max(0, Math.min(maxTake, Number(pkt.d?.amt || 0)));
        if (lost > 0) {
          window.currentWallet.balance = Math.max(0, +(parseFloat(window.currentWallet.balance) - lost).toFixed(2));
          if (typeof window.addLocalLog === 'function') {
            window.addLocalLog('PVP-DRAIN', `${pkt.visibleIp} drenou -$ ${lost} HC da sua conta corrente! (Contas Offshore intactas)`, 'danger');
          }
          if (window.mailEngine) {
            window.mailEngine.pushSystemMail(
              'Fraud Alert <security@bank.hc>',
              `Saque Remoto Detectado (-$ ${lost} HC)`,
              `Uma conexão vinda de ${pkt.visibleIp} drenou $ ${lost} HC da sua reserva local.\nDica: guarde suas economias em Contas Offshore (Swiss / HEBC) e troque sua senha root!`,
              'fbi'
            );
          }
          if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
        }
      }

      // 5) E-mail P2P Real entre dois jogadores!
      if (pkt.kind === 'P2P_MAIL' && (isForMeByTag || isForMeById) && window.mailEngine) {
        window.mailEngine.pushSystemMail(
          `${pkt.senderTag} <${pkt.senderTag.toLowerCase()}@operador.hc>`,
          pkt.d?.sub || 'Mensagem Criptografada',
          pkt.d?.body || '',
          'p2p'
        );
        if (!silentReplay && typeof window.showToast === 'function') {
          window.showToast(`Novo e-mail recebido de ${pkt.senderTag}!`);
        }
      }

      // 6) Sobrecarga DDoS Real danificando fisicamente o Hardware do PC (exige conserto em Peças do PC)!
      if (pkt.kind === 'PVP_DDOS_DAMAGE' && isForMeByIp && window.hardwareEngine) {
        const dmg = Number(pkt.d?.damagePct || 35);
        const res = window.hardwareEngine.applyDdosDamage(dmg, pkt.visibleIp || pkt.senderTag);
        if (window.mailEngine) {
          window.mailEngine.pushSystemMail(
            'Hardware Monitor <sensors@localhost.hc>',
            `ALERTA CRÍTICO: Sobrecarga DDoS queimou circuitos (${res.healthPct}% saúde)`,
            `Uma rajada DDoS (${pkt.d?.gbps || 1} Gbps) disparada de ${pkt.visibleIp || 'origem oculta'} danificou suas peças!\nIntegridade atual: ${res.healthPct}%. Abra "Melhorar Peças do PC" para consertar ($ ${res.repairCost} HC) e recuperar 100% da velocidade.`,
            'war'
          );
        }
        if (!silentReplay) {
          if (window.hackerAudio && typeof window.hackerAudio.playErrorBuzz === 'function') window.hackerAudio.playErrorBuzz();
          if (typeof window.showToast === 'function') {
            window.showToast(`💥 SOBRECARGA DDoS! Suas peças caíram para ${res.healthPct}% de saúde! Conserte em Peças do PC.`);
          }
        }
      }

      // 7) Sincronização Global de Clãs & Tesouraria Coletiva!
      if (pkt.kind === 'CLAN_SYNC' && pkt.d?.clan && window.clanCloudChatEngine) {
        window.clanCloudChatEngine.saveGlobalClan(pkt.d.clan);
        window.clanCloudChatEngine.mergeGlobalClansIntoEngine();
        if (window.clanEngine) {
          window.clanEngine.save();
          if (window.winManager && window.winManager.current === 'winClan') {
            window.clanEngine.renderUI();
          }
        }
      }

      // 8) Mensagem em Tempo Real no Chat Privado do Clã #[TAG]!
      if (pkt.kind === 'CLAN_CHAT_MSG' && isMyClanChat && pkt.d?.msg && window.clanCloudChatEngine) {
        window.clanCloudChatEngine.appendClanMessageLocal(pkt.d.clanTag, pkt.d.msg);
        if (window.winManager && window.winManager.current === 'winClan' && window.clanEngine) {
          window.clanEngine.renderUI();
        } else if (!silentReplay && typeof window.showToast === 'function') {
          window.showToast(`💬 [${pkt.d.clanTag}] ${pkt.d.msg.senderTag}: ${String(pkt.d.msg.text || '').slice(0, 60)}`);
        }
      }

      // 9) Novo Contrato de Vingança por Nick publicado na rede!
      if (pkt.kind === 'BOUNTY_POSTED' && pkt.d?.bounty && window.playerBountyEngine) {
        window.playerBountyEngine.mergeRemoteBounty(pkt.d.bounty);
        if (window.winManager && window.winManager.current === 'winFbi' && window.safenetFbiEngine) {
          window.safenetFbiEngine.renderUI();
        }
      }

      // 10) Contrato de Vingança cumprido por um Caçador de Recompensas!
      if (pkt.kind === 'BOUNTY_CLAIMED' && pkt.d?.bountyId && window.playerBountyEngine) {
        window.playerBountyEngine.mergeRemoteBounty({
          id: pkt.d.bountyId,
          status: 'claimed',
          claimedByTag: pkt.d.claimedByTag,
          claimedTargetIp: pkt.d.targetIp
        });
        if ((isForMeById || isForMeByTag) && window.mailEngine) {
          window.mailEngine.pushSystemMail(
            'Sindicato de Caçadores <bounties@darknet.hc>',
            `💀 VINGANÇA EXECUTADA: ${pkt.d.targetTag} foi derrubado!`,
            `Seu contrato foi cumprido!\n\nO caçador ${pkt.d.claimedByTag} rastreou ${pkt.d.targetTag} no IP ${pkt.d.targetIp} e executou o serviço via ${pkt.d.method || 'Invasão'}.\nO prêmio em custódia ($ ${pkt.d.rewardCash} HC) foi liberado ao caçador.`,
            'war'
          );
          if (!silentReplay && typeof window.showToast === 'function') {
            window.showToast(`💀 VINGANÇA CUMPRIDA! ${pkt.d.claimedByTag} derrubou ${pkt.d.targetTag} [${pkt.d.targetIp}]!`);
          }
        }
        if (window.winManager && window.winManager.current === 'winFbi' && window.safenetFbiEngine) {
          window.safenetFbiEngine.renderUI();
        }
      }

      this.scheduleSave(false);
      if (window.winManager && window.winManager.current === 'winOnline') {
        this.renderOnlineHubUI();
      }
      return true;
    }

    updateHudSyncChip() {
      let chip = document.getElementById('hudCloudSyncBadge');
      if (!chip) return;

      const onlineCount = 1 + this.getUnifiedOnlinePlayers().length;
      const dotColor = this.syncStatus === 'syncing' ? '#f0a03a' : '#35b877';
      const label = this.syncStatus === 'syncing' ? 'Salvando...' : `${onlineCount} online`;
      chip.title = `Save Automático (${this.syncStatus === 'synced' ? 'Nuvem + Local' : 'Instantâneo Anti-F5'}) · Clique para ver Jogadores Online`;
      chip.innerHTML = `<span style="width:6px;height:6px;border-radius:50%;background:${dotColor};display:inline-block;"></span><span>${esc(label)}</span>`;
    }

    renderOnlineHubUI(containerId = 'onlineAppBody') {
      const container = document.getElementById(containerId);
      if (!container) return;

      const me = this.buildMyPublicPeerDescriptor();
      const onlinePlayers = this.getUnifiedOnlinePlayers();
      const allPlayers = this.getUnifiedPlayerDirectory();

      const onlineRows = onlinePlayers.map((p) => `
        <div class="online-player-row" style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid var(--hc-border);gap:10px;flex-wrap:wrap;font-size:0.83rem;">
          <div>
            <span class="hc-badge success" style="margin-right:6px;">● ONLINE · Jogador</span>
            <strong>${esc(p.hackerTag)}</strong>
            ${p.clanTag ? `<span class="hc-badge info" style="margin-left:6px;">[${esc(p.clanTag)}]</span>` : ''}
            <code style="color:var(--hc-accent-text);margin-left:8px;">${esc(p.publicIp)}</code>
            <span style="color:var(--hc-text-3);font-size:0.76rem;margin-left:8px;">
              ${(p.reputation || 100).toLocaleString('pt-BR')} REP · ${(p.reputation || 100) < 100 ? 'Iniciante (<100 REP)' : `Escudo v${(p.firewallVer || 1).toFixed(1)}`}
            </span>
          </div>
          <div style="display:flex;gap:6px;">
            <button type="button" class="hc-btn primary sm" onclick="window.internetEngine.openIp('${esc(p.publicIp)}', 'invadir')">Invadir PC</button>
            <button type="button" class="hc-btn ghost sm" onclick="window.mailEngine.activeTab='compose';navTo('winMail');setTimeout(()=>{const el=document.getElementById('mailToInput');if(el)el.value='${esc(p.hackerTag)}';},60);">Enviar Mensagem</button>
          </div>
        </div>
      `).join('');

      const directoryRows = allPlayers.slice(0, 28).map((p) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 14px;border-bottom:1px solid var(--hc-border);gap:10px;flex-wrap:wrap;font-size:0.82rem;">
          <div>
            <span class="hc-badge ${p.onlineNow ? 'success' : ''}" style="margin-right:6px;">${p.onlineNow ? '● ONLINE' : '○ OFFLINE'}</span>
            <strong>${esc(p.hackerTag)}</strong>
            ${p.clanTag ? `<span class="hc-badge info" style="margin-left:6px;">[${esc(p.clanTag)}]</span>` : ''}
            <code style="color:var(--hc-accent-text);margin-left:8px;">${esc(p.publicIp)}</code>
            <span style="color:var(--hc-text-3);font-size:0.75rem;margin-left:8px;">${(p.reputation || 100).toLocaleString('pt-BR')} REP · ${(p.reputation || 100) < 100 ? 'Protegido (<100 REP)' : `Cofre v${(p.hasherVer || 1).toFixed(1)}`}</span>
          </div>
          <div style="display:flex;gap:6px;">
            <button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('${esc(p.publicIp)}')">Abrir PC</button>
            <button type="button" class="hc-btn primary sm" onclick="window.internetEngine.openIp('${esc(p.publicIp)}', 'invadir')">Invadir PC</button>
          </div>
        </div>
      `).join('');

      const feedRows = this.livePvpFeed.length === 0
        ? `<div style="color:var(--hc-text-3);font-size:0.8rem;padding:8px 0;">Nenhuma invasão ou mensagem registrada nesta sessão ainda.</div>`
        : this.livePvpFeed.slice(0, 10).map((f) => `
            <div style="padding:6px 0;border-bottom:1px solid var(--hc-border);font-family:var(--hc-font-mono);font-size:0.77rem;">
              <span style="color:var(--hc-text-3);">[${esc(f.at)}]</span>
              <span class="hc-badge ${f.dir === 'IN' ? 'danger' : 'info'}" style="margin:0 6px;">${f.dir === 'IN' ? 'RECEBIDO' : 'ENVIADO'}</span>
              <span>${esc(f.summary)}</span>
            </div>
          `).join('');

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <!-- Card de Status Cloud Save + Presença -->
          <div class="hc-card" style="padding:1.15rem;border-color:rgba(53,184,119,0.4);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
            <div>
              <div class="hc-eyebrow">Save Automático Anti-F5 &amp; Nuvem (Zero Perda de Dados)</div>
              <h3 style="font-size:1.05rem;margin:4px 0;">
                Seu IP Atual: <code style="color:var(--hc-accent-text);">${esc(me.publicIp)}</code> ·
                Estado do Save: <strong style="color:var(--hc-accent-text);">${this.syncStatus === 'synced' ? 'Nuvem + Navegador Sincronizados' : 'Salvo Instantaneamente (Anti-F5)'}</strong>
              </h3>
              <div style="font-size:0.8rem;color:var(--hc-text-2);">
                Tudo salvo em tempo real (dinheiro, BTC, peças, programas ativos, carência, vírus, senhas descobertas, logs/farpas e missões) · Último save: ${esc(this.lastSyncedAt || 'agora')}
              </div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button type="button" id="btnForceCloudSync" class="hc-btn primary sm" onclick="window.onlineEngine.pushSnapshotToCloud().then(()=>showToast('Todos os seus dados foram salvos e sincronizados!'))">
                Salvar Agora ↻
              </button>
              <button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('71.4.5.1')">Trocar Meu IP</button>
            </div>
          </div>

          <!-- Jogadores Online Agora (Humanos + IA unificados como Jogadores!) -->
          <div class="hc-card" id="onlinePlayersLiveCard" style="padding:0;overflow:hidden;">
            <div style="padding:11px 14px;border-bottom:1px solid var(--hc-border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
              <strong style="font-size:0.9rem;">🟢 Jogadores Online Agora (${onlinePlayers.length + 1} conectados na rede)</strong>
              <span class="hc-badge success">Servidor Online Ao Vivo</span>
            </div>
            ${onlineRows}
          </div>

          <!-- Todos os Jogadores do Servidor -->
          <div class="hc-card" id="onlinePlayersDirectoryCard" style="padding:0;overflow:hidden;">
            <div style="padding:11px 14px;border-bottom:1px solid var(--hc-border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
              <strong style="font-size:0.9rem;">🌐 Todos os Jogadores Registrados (${allPlayers.length} operadores)</strong>
              <span style="font-size:0.75rem;color:var(--hc-text-3);font-family:var(--hc-font-mono);">Online &amp; Offline</span>
            </div>
            ${directoryRows}
          </div>

          <!-- Telemetria de Pacotes PvP & Mail -->
          <div class="hc-card" style="padding:1rem 1.15rem;">
            <div class="hc-eyebrow" style="margin-bottom:6px;">Histórico de Invasões, Farpas em Logs &amp; Mensagens entre Jogadores</div>
            ${feedRows}
          </div>
        </div>
      `;
    }
  }

  // =========================================================================
  // 2. PROTOCOLO 404 REAL EMBUTIDO NA CONTA (COM SALVAÇÃO PELO XHD & OFFSHORE!)
  // =========================================================================
  class PanicRaidEngine {
    constructor() {
      this.raidActive = false;
      this.stepCompleted = 0; // 0 -> 1 -> 2 -> 3
      this.secondsLeft = 15;
      this.timer = null;
      this.lastOutcome = null;
    }

    startEmergencyRaid() {
      if (this.raidActive) return;
      this.raidActive = true;
      this.stepCompleted = 0;
      this.secondsLeft = 15;
      this.lastOutcome = null;

      if (window.winManager && window.winManager.current !== 'winPanic') {
        window.openWindow('winPanic');
      }
      this.renderUI();

      clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.secondsLeft--;
        const tEl = document.getElementById('panicCountdownVal');
        if (tEl) tEl.textContent = `${this.secondsLeft}s`;
        if (this.secondsLeft <= 0) {
          this.executePoliceConfiscation();
        }
      }, 1000);
    }

    completeDestructionStep(stepNum) {
      if (!this.raidActive || stepNum !== this.stepCompleted + 1) return;
      this.stepCompleted = stepNum;
      if (window.hackerAudio) window.hackerAudio.playKeyClick();

      if (this.stepCompleted >= 3) {
        clearInterval(this.timer);
        this.raidActive = false;

        // Sucesso: limpa Heat p/ Nível 1, tira IP da Safenet/FBI e premia reputação!
        if (window.currentProfile) {
          window.currentProfile.heat_level = 1;
          window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 60;
        }
        if (window.safenetFbiEngine && window.networkIdentity) {
          const myIp = window.networkIdentity.getPublicIp();
          window.safenetFbiEngine.safenetList = (window.safenetFbiEngine.safenetList || []).filter((s) => s.ip !== myIp);
          window.safenetFbiEngine.fbiWantedList = (window.safenetFbiEngine.fbiWantedList || []).filter((w) => w.ip !== myIp);
        }

        this.lastOutcome = {
          escaped: true,
          msg: 'EVIDÊNCIAS DESTRUÍDAS A TEMPO! A Polícia Federal não encontrou provas no seu HD. Seu Heat caiu para Nível 1 e você saiu da mira do FBI (+60 REP)!'
        };
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('PROTOCOLO-404', 'Batida federal neutralizada! Provas destruídas em 3 etapas — Heat Nível 1.', 'success');
        }
        if (window.hackerAudio) window.hackerAudio.playCashChime();
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
        if (window.onlineEngine) window.onlineEngine.scheduleSave(true);
      }
      this.renderUI();
    }

    executePoliceConfiscation() {
      clearInterval(this.timer);
      this.raidActive = false;

      // Confisco real: perde 75% da conta corrente principal e reseta HD principal p/ v1.0,
      // MAS preserva 100% do HD Externo (XHD) e 100% das Contas Offshore!
      const oldBal = window.currentWallet ? parseFloat(window.currentWallet.balance || 0) : 0;
      const seizedCash = +(oldBal * 0.75).toFixed(2);
      if (window.currentWallet) {
        window.currentWallet.balance = Math.max(0, +(oldBal - seizedCash).toFixed(2));
      }

      if (window.softwareEngine) {
        window.softwareEngine.ensureLoaded();
        window.softwareEngine.transitions = {};
        Object.entries(window.softwareEngine.state.inventory).forEach(([k, s]) => {
          const def = window.softwareEngine.getDefinition(k);
          if (def && def.starterOwned) {
            s.owned = true;
            s.versionInt = 10;
            s.runningVerInt = s.installed ? 10 : 0;
            s.licensed = true;
          } else {
            s.owned = false;
            s.versionInt = 0;
            s.runningVerInt = 0;
            s.installed = false;
            s.licensed = false;
          }
        });
        window.softwareEngine.state.remoteInfections = [];
        window.softwareEngine.save();
      }

      if (window.currentProfile) {
        window.currentProfile.heat_level = 1;
      }
      if (window.safenetFbiEngine && window.networkIdentity) {
        const myIp = window.networkIdentity.getPublicIp();
        window.safenetFbiEngine.safenetList = (window.safenetFbiEngine.safenetList || []).filter((s) => s.ip !== myIp);
        window.safenetFbiEngine.fbiWantedList = (window.safenetFbiEngine.fbiWantedList || []).filter((w) => w.ip !== myIp);
      }

      const xhdCount = window.stealthXhdEngine ? Object.keys(window.stealthXhdEngine.ensureLoaded().backups || {}).length : 0;
      const offshoreTotal = window.multiBankEngine
        ? Object.values(window.multiBankEngine.ensureLoaded().playerSecondaryAccounts || {}).reduce((s, a) => s + (a.balance || 0), 0)
        : 0;

      this.lastOutcome = {
        escaped: false,
        seizedCash,
        xhdCount,
        offshoreTotal,
        msg: `MANDADO CUMPRIDO! A Polícia confiscou -$ ${seizedCash.toLocaleString('pt-BR')} HC da sua conta corrente e formatou seu HD principal para v1.0. Seus ${xhdCount} backup(s) no HD Externo (XHD) e $ ${offshoreTotal.toLocaleString('pt-BR')} HC em Contas Offshore permaneceram 100% INTACTOS!`
      };

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('CONFISCO-PF', this.lastOutcome.msg, 'danger');
      }
      if (window.hackerAudio && typeof window.hackerAudio.playErrorBuzz === 'function') window.hackerAudio.playErrorBuzz();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.onlineEngine) window.onlineEngine.scheduleSave(true);
      this.renderUI();
    }

    restoreAllFromXhd() {
      if (!window.stealthXhdEngine) return;
      const baks = Object.keys(window.stealthXhdEngine.ensureLoaded().backups || {});
      let restored = 0;
      baks.forEach((k) => {
        const r = window.stealthXhdEngine.restoreSoftwareFromXhd(k);
        if (r.success) restored++;
      });
      if (window.onlineEngine) window.onlineEngine.scheduleSave(true);
      if (typeof window.showToast === 'function') {
        window.showToast(`${restored} software(s) restaurado(s) do seu HD Externo (XHD)!`);
      }
      this.renderUI();
      return restored;
    }

    renderUI(containerId = 'panicAppBody') {
      const el = document.getElementById(containerId);
      if (!el) return;

      const heat = (window.currentProfile && window.currentProfile.heat_level) || 1;
      const xhdInfo = window.stealthXhdEngine ? window.stealthXhdEngine.getXhdInfo() : { name: 'Sem XHD', capMb: 0 };
      const xhdBackups = window.stealthXhdEngine ? Object.keys(window.stealthXhdEngine.ensureLoaded().backups || {}).length : 0;
      const offshoreTotal = window.multiBankEngine
        ? Object.values(window.multiBankEngine.ensureLoaded().playerSecondaryAccounts || {}).reduce((s, a) => s + (a.balance || 0), 0)
        : 0;

      const outcomeBanner = this.lastOutcome
        ? `<div class="hc-card" style="padding:1.1rem;border-color:${this.lastOutcome.escaped ? 'var(--hc-accent)' : 'var(--hc-danger)'};background:${this.lastOutcome.escaped ? 'rgba(53,184,119,0.09)' : 'rgba(208,68,58,0.09)'};">
             <strong style="color:${this.lastOutcome.escaped ? 'var(--hc-accent-text)' : 'var(--hc-danger-text)'};display:block;margin-bottom:6px;">
               ${this.lastOutcome.escaped ? '✅ OPERAÇÃO DE EMERGÊNCIA BEM-SUCEDIDA' : '🚨 CONFISCO FEDERAL EXECUTADO'}
             </strong>
             <div style="font-size:0.84rem;color:var(--hc-text);margin-bottom:8px;">${esc(this.lastOutcome.msg)}</div>
             ${!this.lastOutcome.escaped && xhdBackups > 0
               ? `<button type="button" id="btnRestoreAllXhdAfterRaid" class="hc-btn primary sm" onclick="window.panicRaidEngine.restoreAllFromXhd()">⚡ Restaurar Todos os Meus Softwares do XHD (${xhdBackups}) →</button>`
               : ''}
           </div>`
        : '';

      const activeRaidHtml = this.raidActive
        ? `
          <div class="hc-card" style="padding:1.25rem;border-color:var(--hc-danger);background:rgba(208,68,58,0.1);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <strong style="color:var(--hc-danger-text);font-size:1.05rem;">🚨 VIATURA NA PORTA! DESTRUA AS PROVAS EM ORDEM!</strong>
              <span id="panicCountdownVal" style="font-family:var(--hc-font-mono);font-size:1.4rem;font-weight:700;color:var(--hc-warning);">${this.secondsLeft}s</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;">
              <div class="hc-card" style="padding:0.95rem;opacity:${this.stepCompleted >= 1 ? '0.6' : '1'};">
                <div class="hc-eyebrow">ETAPA 1 DE 3</div>
                <strong style="display:block;margin:4px 0 8px;">Curto-Circuito na RAM</strong>
                <button type="button" id="btnPanicStep1" class="hc-btn ${this.stepCompleted === 0 ? 'primary' : 'ghost'} sm" ${this.stepCompleted !== 0 ? 'disabled' : ''} onclick="window.panicRaidEngine.completeDestructionStep(1)">
                  ${this.stepCompleted >= 1 ? '✓ RAM Zerada' : '1. Descarregar RAM'}
                </button>
              </div>
              <div class="hc-card" style="padding:0.95rem;opacity:${this.stepCompleted >= 2 ? '0.6' : '1'};">
                <div class="hc-eyebrow">ETAPA 2 DE 3</div>
                <strong style="display:block;margin:4px 0 8px;">Carga Termite no HD</strong>
                <button type="button" id="btnPanicStep2" class="hc-btn ${this.stepCompleted === 1 ? 'primary' : 'ghost'} sm" ${this.stepCompleted !== 1 ? 'disabled' : ''} onclick="window.panicRaidEngine.completeDestructionStep(2)">
                  ${this.stepCompleted >= 2 ? '✓ Pratos Derretidos' : '2. Ativar Termite'}
                </button>
              </div>
              <div class="hc-card" style="padding:0.95rem;opacity:${this.stepCompleted >= 3 ? '0.6' : '1'};">
                <div class="hc-eyebrow">ETAPA 3 DE 3</div>
                <strong style="display:block;margin:4px 0 8px;">Disjuntor Geral & Fuga</strong>
                <button type="button" id="btnPanicStep3" class="hc-btn ${this.stepCompleted === 2 ? 'primary' : 'ghost'} sm" ${this.stepCompleted !== 2 ? 'disabled' : ''} onclick="window.panicRaidEngine.completeDestructionStep(3)">
                  ${this.stepCompleted >= 3 ? '✓ Apagão Concluído' : '3. Cortar Energia'}
                </button>
              </div>
            </div>
          </div>
        `
        : `
          <div class="hc-card" style="padding:1.2rem;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:14px;">
              <div style="background:var(--hc-inset);padding:0.8rem;border-radius:8px;border:1px solid var(--hc-border);">
                <div style="font-size:0.72rem;color:var(--hc-text-3);">SEU HEAT POLICIAL ATUAL</div>
                <strong style="font-size:1.1rem;color:${heat >= 4 ? 'var(--hc-danger-text)' : 'var(--hc-accent-text)'};">Nível ${heat} / 5</strong>
              </div>
              <div style="background:var(--hc-inset);padding:0.8rem;border-radius:8px;border:1px solid var(--hc-border);">
                <div style="font-size:0.72rem;color:var(--hc-text-3);">PROTEGIDO NO HD EXTERNO (XHD)</div>
                <strong style="font-size:0.95rem;color:var(--hc-accent-text);">${xhdBackups} backup(s) (${esc(xhdInfo.name)})</strong>
              </div>
              <div style="background:var(--hc-inset);padding:0.8rem;border-radius:8px;border:1px solid var(--hc-border);">
                <div style="font-size:0.72rem;color:var(--hc-text-3);">BLINDADO EM CONTAS OFFSHORE</div>
                <strong style="font-size:0.95rem;color:var(--hc-warning);">$ ${offshoreTotal.toLocaleString('pt-BR')} HC</strong>
              </div>
            </div>

            <p style="font-size:0.84rem;color:var(--hc-text-2);margin:0 0 12px;">
              Se o seu Heat chegar ao Nível 5, a Polícia Federal arromba a quitinete. Destrua a RAM, o HD e o Disjuntor em <strong>15s</strong> para zerar seu Heat sem perder nada. Se falhar, a PF confisca <strong>75% da conta corrente principal</strong> e formata seu <strong>HD principal para v1.0</strong> — mas tudo guardado no <strong>XHD</strong> e nas <strong>Contas Offshore</strong> fica 100% salvo!
            </p>

            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <button type="button" id="btnTriggerPanicRaidNow" class="hc-btn primary" style="background:var(--hc-danger);border-color:var(--hc-danger);" onclick="window.panicRaidEngine.startEmergencyRaid()">
                🚨 Acionar Protocolo 404 Agora (15s)
              </button>
              <button type="button" class="hc-btn ghost sm" onclick="navTo('winSoftware');window.softwareEngine.activeTab='xhd';window.softwareEngine.renderUI();">
                Fazer Backup no XHD →
              </button>
              <button type="button" class="hc-btn ghost sm" onclick="window.open('panic/index.html', '_blank')">
                Abrir Simulador 3D Clássico (Aba Extra) ↗
              </button>
            </div>
          </div>
        `;

      el.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${outcomeBanner}
          ${activeRaidHtml}
        </div>
      `;
    }
  }

  window.onlineEngine = new OnlineCloudPvpEngine();
  window.panicRaidEngine = new PanicRaidEngine();
})();
