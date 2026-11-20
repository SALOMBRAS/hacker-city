/**
 * Hacker City // Motor MMO Completo:
 * 1. IntegrityGuard       — Anti-Cheat em 3 Camadas (Getter/Setter Trap em Memória contra Console F12,
 *                           Assinatura Criptográfica Salgada em LocalStorage e Validação Server-Side PostgreSQL RPC)
 * 2. OfflinePvpMailbox    — Fila Assíncrona Persistente de PvP Offline & Diretório Global 24/7 (atacar/drenar/farpar offline)
 * 3. DdosOverloadEngine   — Ataque de Sobrecarga DDoS que danifica fisicamente o Hardware do alvo (exigindo Conserto em $ HC)
 * 4. PlayerBountyEngine   — Quadro Público de Vingança por Nick (Colocar Cabeça a Prêmio quando o invasor apaga o IP e deixa farpa)
 * 5. ClanCloudChatEngine  — Clãs Globais Compartilhados na Nuvem + Chat Privado em Tempo Real da Equipe
 */
(function () {
  const SNAPSHOT_PEPPER = 'HC_MMO_V4_KERNEL_PEPPER_91F7_44C2_88E1';

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fnv32(str, seed = 2166136261) {
    let h = seed >>> 0;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return (h >>> 0).toString(16).padStart(8, '0');
  }

  function computeSnapshotSig(snap) {
    if (!snap || typeof snap !== 'object') return '';
    const softInvSig = snap.soft && snap.soft.inventory
      ? ['cracker', 'firewall', 'hasher', 'antivirus', 'collector', 'vspam', 'vwarez', 'vminer', 'vbank', 'vddos']
          .map((k) => {
            const it = snap.soft.inventory[k];
            return it && it.owned ? `${k}:${it.versionInt || 0}` : `${k}:0`;
          })
          .join(',')
      : '';
    const uniSig = snap.uni && Array.isArray(snap.uni.completed)
      ? snap.uni.completed.slice().sort((a, b) => a - b).join(',')
      : '';
    const vlabSig = snap.virusLabState
      ? `${snap.virusLabState.level || 1}|${snap.virusLabState.xp || 0}|${snap.virusLabState.totalCompiled || 0}|${snap.virusLabState.lastCompiledAtMs || 0}`
      : '1|0|0|0';

    const canonical = [
      SNAPSHOT_PEPPER,
      String(snap.userId || ''),
      Number(snap.walletBalance || 0).toFixed(2),
      String(Math.round(Number(snap.reputation || 0))),
      String(Math.round(Number(snap.heatLevel || 1))),
      snap.hw ? `${snap.hw.cpu}|${snap.hw.ram}|${snap.hw.hdd}|${snap.hw.network}|${snap.hw.healthPct ?? 100}` : '',
      snap.btc ? String(Math.round(Number(snap.btc.balanceSats || 0))) : '0',
      softInvSig,
      uniSig,
      vlabSig
    ].join('::');
    return 'hcsig5_' + fnv32(canonical, 2166136261) + fnv32(canonical + '::B', 291543107);
  }

  // =========================================================================
  // 1. INTEGRITY GUARD — ANTI-CHEAT CONTRA CONSOLE F12 & EDIÇÃO DE LOCALSTORAGE
  // =========================================================================
  const walletShadow = new WeakMap();
  const profileShadow = new WeakMap();
  let authorizedDepth = 0;

  function isTrustedGameCaller() {
    try {
      const rawStack = String(new Error().stack || '');
      const lines = rawStack
        .split('\n')
        .slice(1)
        .filter((ln) => !ln.includes('mmo-anticheat-clans-bounty-ddos.js'));
      if (lines.length === 0) return false;
      // Chamadas legítimas vêm sempre dos módulos do jogo (/src/js/ ou index.html), nunca de <anonymous> do Console F12!
      return lines.some((ln) =>
        ln.includes('/src/js/') ||
        ln.includes('src/js/') ||
        ln.includes('index.html')
      );
    } catch (e) {
      return false;
    }
  }

  class IntegrityGuard {
    constructor() {
      this.cheatStrikes = 0;
      this.blockedEvents = [];
      this.installGlobalWindowTraps();
    }

    runAuthorized(fn) {
      authorizedDepth += 1;
      try {
        return fn();
      } finally {
        authorizedDepth = Math.max(0, authorizedDepth - 1);
      }
    }

    recordBlockedCheat(kind, attemptedValue, keptValue, reason) {
      this.cheatStrikes += 1;
      const evt = {
        kind,
        attemptedValue,
        keptValue,
        reason,
        at: new Date().toLocaleTimeString('pt-BR')
      };
      this.blockedEvents.unshift(evt);
      if (this.blockedEvents.length > 20) this.blockedEvents.length = 20;

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog(
          'ANTI-CHEAT',
          `Tentativa ilegal bloqueada (${kind}): valor forjado "${attemptedValue}" rejeitado pelo Kernel. Valor legítimo mantido: ${keptValue}.`,
          'danger'
        );
      }
      if (window.hackerAudio && typeof window.hackerAudio.playErrorBuzz === 'function') {
        window.hackerAudio.playErrorBuzz();
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`🛡️ ANTI-CHEAT: Adulteração via F12 bloqueada! Valor real (${keptValue}) preservado.`);
      }
    }

    protectWalletObject(walletObj) {
      if (!walletObj || typeof walletObj !== 'object') return walletObj;
      if (walletShadow.has(walletObj)) return walletObj;

      const initialBal = Math.max(0, +(Number(walletObj.balance || 0)).toFixed(2));
      walletShadow.set(walletObj, { balance: initialBal });

      const guard = this;
      Object.defineProperty(walletObj, 'balance', {
        enumerable: true,
        configurable: false,
        get() {
          return walletShadow.get(walletObj).balance;
        },
        set(nextRaw) {
          const st = walletShadow.get(walletObj);
          const cur = st.balance;
          const nextNum = +(Number(nextRaw)).toFixed(2);
          if (!Number.isFinite(nextNum) || nextNum < 0) {
            guard.recordBlockedCheat('WALLET_INVALID', String(nextRaw), cur, 'INVALID_NUMBER');
            return;
          }
          if (authorizedDepth > 0) {
            st.balance = nextNum;
            return;
          }
          const delta = +(nextNum - cur).toFixed(2);
          const trusted = isTrustedGameCaller();
          if ((!trusted && Math.abs(delta) > 0.001) || delta > 250000) {
            guard.recordBlockedCheat('WALLET_F12_TAMPER', nextNum, cur, !trusted ? 'UNTRUSTED_CONSOLE_CALLER' : 'VELOCITY_CAP');
            return;
          }
          st.balance = nextNum;
        }
      });

      return walletObj;
    }

    protectProfileObject(profileObj) {
      if (!profileObj || typeof profileObj !== 'object') return profileObj;
      if (profileShadow.has(profileObj)) return profileObj;

      const initialRep = Math.max(0, Math.round(Number(profileObj.reputation || 0)));
      profileShadow.set(profileObj, { reputation: initialRep });

      const guard = this;
      Object.defineProperty(profileObj, 'reputation', {
        enumerable: true,
        configurable: false,
        get() {
          return profileShadow.get(profileObj).reputation;
        },
        set(nextRaw) {
          const st = profileShadow.get(profileObj);
          const cur = st.reputation;
          const nextInt = Math.round(Number(nextRaw));
          if (!Number.isFinite(nextInt) || nextInt < 0) {
            guard.recordBlockedCheat('REP_INVALID', String(nextRaw), cur, 'INVALID_NUMBER');
            return;
          }
          if (authorizedDepth > 0) {
            st.reputation = nextInt;
            return;
          }
          const delta = nextInt - cur;
          const trusted = isTrustedGameCaller();
          if ((!trusted && delta !== 0) || delta > 10000) {
            guard.recordBlockedCheat('REP_F12_TAMPER', nextInt, cur, !trusted ? 'UNTRUSTED_CONSOLE_CALLER' : 'VELOCITY_CAP');
            return;
          }
          st.reputation = nextInt;
        }
      });

      return profileObj;
    }

    protectSessionObjects(profileObj, walletObj) {
      if (profileObj) this.protectProfileObject(profileObj);
      if (walletObj) this.protectWalletObject(walletObj);
    }

    installGlobalWindowTraps() {
      let activeProfileRef = window.currentProfile || null;
      let activeWalletRef = window.currentWallet || null;
      const guard = this;

      try {
        Object.defineProperty(window, 'currentWallet', {
          configurable: true,
          enumerable: true,
          get() {
            return activeWalletRef;
          },
          set(val) {
            if (val === null) {
              if (authorizedDepth > 0 || isTrustedGameCaller()) {
                activeWalletRef = null;
              }
              return;
            }
            if (activeWalletRef && authorizedDepth === 0 && !isTrustedGameCaller()) {
              guard.recordBlockedCheat('WALLET_OBJECT_SWAP', JSON.stringify(val).slice(0, 60), activeWalletRef.balance, 'CONSOLE_SWAP');
              return;
            }
            activeWalletRef = guard.protectWalletObject(val);
          }
        });

        Object.defineProperty(window, 'currentProfile', {
          configurable: true,
          enumerable: true,
          get() {
            return activeProfileRef;
          },
          set(val) {
            if (val === null) {
              if (authorizedDepth > 0 || isTrustedGameCaller()) {
                activeProfileRef = null;
              }
              return;
            }
            if (activeProfileRef && authorizedDepth === 0 && !isTrustedGameCaller()) {
              guard.recordBlockedCheat('PROFILE_OBJECT_SWAP', JSON.stringify(val).slice(0, 60), activeProfileRef.reputation, 'CONSOLE_SWAP');
              return;
            }
            activeProfileRef = guard.protectProfileObject(val);
          }
        });
      } catch (e) {}
    }

    signSnapshot(snap) {
      if (!snap || typeof snap !== 'object') return snap;
      snap.v = 4;
      snap._sig = computeSnapshotSig(snap);
      return snap;
    }

    verifySnapshot(snap) {
      if (!snap || typeof snap !== 'object') return { valid: false, reason: 'EMPTY' };
      // Migração suave de saves v3 legítimos (antes da assinatura v4) desde que dentro de teto razoável
      if (snap.v === 3 && !snap._sig) {
        if (Number(snap.walletBalance || 0) <= 100000 && Number(snap.reputation || 0) <= 25000) {
          return { valid: true, migratedFromV3: true };
        }
        return { valid: false, reason: 'UNSIGNED_INFLATED_V3' };
      }
      const expected = computeSnapshotSig(snap);
      if (!snap._sig || snap._sig !== expected) {
        this.recordBlockedCheat('LOCALSTORAGE_SAVE_TAMPER', snap.walletBalance, 500, 'SIGNATURE_MISMATCH');
        return { valid: false, reason: 'SIGNATURE_MISMATCH' };
      }
      return { valid: true };
    }
  }

  // =========================================================================
  // 2. OFFLINE PVP MAILBOX & DIRETÓRIO PERSISTENTE 24/7 DE JOGADORES
  // =========================================================================
  class OfflinePvpMailbox {
    constructor() {
      this.dirKey = 'HC_GLOBAL_PLAYER_DIRECTORY_V1';
      this.queueKey = 'HC_GLOBAL_PVP_QUEUE_V1';
    }

    upsertPublicDirectoryEntry(peer) {
      if (!peer || !peer.userId || !peer.publicIp) return;
      try {
        const map = JSON.parse(localStorage.getItem(this.dirKey) || '{}');
        map[peer.userId] = {
          userId: peer.userId,
          hackerTag: peer.hackerTag || 'Operador',
          specialty: peer.specialty || 'exploiter',
          publicIp: peer.publicIp,
          pwdEpoch: Number(peer.pwdEpoch || 1),
          reputation: Number(peer.reputation || 100),
          heatLevel: Number(peer.heatLevel || 1),
          firewallVer: Number(peer.firewallVer || 1.0),
          hasherVer: Number(peer.hasherVer || 1.0),
          antivirusVer: Number(peer.antivirusVer || 1.0),
          hddTotalMb: Number(peer.hddTotalMb || 350),
          ramTotalMb: Number(peer.ramTotalMb || 256),
          cpuMhz: Number(peer.cpuMhz || 800),
          netMbps: Number(peer.netMbps || 1),
          hardwareHealthPct: Number(peer.hardwareHealthPct ?? 100),
          bestSoftVer: Number(peer.bestSoftVer || 1.0),
          ddosGbps: Number(peer.ddosGbps || 0),
          clanTag: peer.clanTag || null,
          customWebPage: peer.customWebPage || null,
          savedAt: Date.now()
        };
        const keys = Object.keys(map);
        if (keys.length > 65) {
          keys
            .sort((a, b) => (map[a].savedAt || 0) - (map[b].savedAt || 0))
            .slice(0, keys.length - 65)
            .forEach((k) => delete map[k]);
        }
        localStorage.setItem(this.dirKey, JSON.stringify(map));
      } catch (e) {}
    }

    getKnownDirectoryPeers(excludeUserId = null) {
      try {
        const map = JSON.parse(localStorage.getItem(this.dirKey) || '{}');
        return Object.values(map).filter((p) => p && p.userId && p.userId !== excludeUserId);
      } catch (e) {
        return [];
      }
    }

    enqueuePacket(pkt) {
      if (!pkt || !pkt.pktId) return;
      // Somente pacotes direcionados ou globais relevantes entram na fila offline
      const queueable = [
        'PVP_INTRUSION',
        'PVP_VIRUS_PLANT',
        'PVP_VIRUS_HIDE',
        'PVP_AV_PURGED',
        'PVP_WIPE_LOG',
        'PVP_EDIT_LOG',
        'PVP_DRAIN_WALLET',
        'PVP_DDOS_DAMAGE',
        'P2P_MAIL',
        'BOUNTY_CLAIMED'
      ];
      if (!queueable.includes(pkt.kind)) return;

      try {
        const list = JSON.parse(localStorage.getItem(this.queueKey) || '[]');
        if (!list.some((x) => x.pktId === pkt.pktId)) {
          list.push({
            ...pkt,
            queuedAtMs: Date.now(),
            ackedBy: []
          });
          while (list.length > 120) list.shift();
          localStorage.setItem(this.queueKey, JSON.stringify(list));
        }
      } catch (e) {}
    }

    async flushPendingForCurrentPlayer() {
      if (!window.currentProfile || !window.onlineEngine) return { replayed: 0 };
      const myId = window.currentProfile.id;
      const myTag = String(window.currentProfile.hacker_tag || '').toLowerCase();
      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '';

      let replayed = 0;

      // 1) Processar fila local persistente (mesma máquina / múltiplas contas / retorno após aba fechada!)
      try {
        const list = JSON.parse(localStorage.getItem(this.queueKey) || '[]');
        let dirty = false;
        list.forEach((pkt) => {
          if (!pkt || pkt.senderId === myId) return;
          const acked = Array.isArray(pkt.ackedBy) ? pkt.ackedBy : [];
          if (acked.includes(myId)) return;

          const hitId = pkt.targetUserId && pkt.targetUserId === myId;
          const hitTag = pkt.targetTag && String(pkt.targetTag).toLowerCase() === myTag;
          const hitIp = pkt.targetIp && pkt.targetIp === myIp;

          if (hitId || hitTag || hitIp) {
            const applied = window.onlineEngine.handleIncomingPacket(pkt, true);
            pkt.ackedBy = [...acked, myId];
            dirty = true;
            if (applied) replayed += 1;
          }
        });
        if (dirty) {
          localStorage.setItem(this.queueKey, JSON.stringify(list));
        }
      } catch (e) {}

      // 2) Processar fila em nuvem public.pvp_network_events (ataques vindos de outras redes enquanto offline!)
      if (window.supabase && window.onlineEngine.cloudTablesAvailable !== false) {
        try {
          const filters = [];
          if (myIp) filters.push(`target_ip.eq.${myIp}`);
          if (myId) filters.push(`target_operator_key.eq.${myId}`);
          if (myTag) filters.push(`target_tag.ilike.${myTag}`);

          if (filters.length > 0) {
            const { data: rows, error } = await window.supabase
              .from('pvp_network_events')
              .select('id, payload')
              .eq('consumed', false)
              .or(filters.join(','))
              .order('created_at', { ascending: true })
              .limit(40);

            if (!error && Array.isArray(rows) && rows.length > 0) {
              window.onlineEngine.cloudTablesAvailable = true;
              const consumedIds = [];
              rows.forEach((r) => {
                if (r.payload && r.payload.pktId) {
                  const applied = window.onlineEngine.handleIncomingPacket(r.payload, true);
                  if (applied) replayed += 1;
                }
                consumedIds.push(r.id);
              });
              if (consumedIds.length > 0) {
                await window.supabase
                  .from('pvp_network_events')
                  .update({ consumed: true })
                  .in('id', consumedIds);
              }
            } else if (error && error.code === 'PGRST205') {
              window.onlineEngine.cloudTablesAvailable = false;
            }
          }
        } catch (e) {}
      }

      if (replayed > 0) {
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog(
            'OFFLINE-REPORT',
            `RELATÓRIO OFFLINE: Seu PC recebeu ${replayed} evento(s) na rede enquanto você estava desconectado! Revise seus Rastros, Vírus e Integridade das Peças.`,
            'warning'
          );
        }
        window.onlineEngine.saveLocalSnapshotImmediate();
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
        setTimeout(() => {
          if (typeof window.showToast === 'function') {
            window.showToast(`⚠️ Enquanto você estava offline, seu PC sofreu ${replayed} ação(ões) na rede! Cheque Meus Rastros e Peças do PC.`);
          }
        }, 450);
      }

      return { replayed };
    }
  }

  // =========================================================================
  // 3. DDOS OVERLOAD HARDWARE STRIKE ENGINE
  // =========================================================================
  class DdosOverloadEngine {
    constructor() {
      this.storageKey = 'HC_REMOTE_DDOS_DAMAGE_V1';
      this.remoteDamage = this.loadDamageMap();
    }

    loadDamageMap() {
      try {
        return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      } catch (e) {
        return {};
      }
    }

    saveDamageMap() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.remoteDamage));
      } catch (e) {}
    }

    getTargetHealthPct(ip) {
      const rec = this.remoteDamage[ip];
      if (rec && rec.healthPct != null) return Math.max(20, Math.min(100, rec.healthPct));
      const human = window.onlineEngine ? window.onlineEngine.getHumanPlayerByIp(ip) : null;
      if (human && human.hardwareHealthPct != null) return Math.max(20, Math.min(100, Number(human.hardwareHealthPct)));
      return 100;
    }

    getTargetFirewallPenalty(ip) {
      const rec = this.remoteDamage[ip];
      return rec ? Number(rec.fwPenalty || 0) : 0;
    }

    getPlayerTotalDdosGbps() {
      const baseGbps = window.safenetFbiEngine ? window.safenetFbiEngine.getPlayerDdosPowerGbps() : 0.9;
      const c2Bots = (window.botnetC2 && Array.isArray(window.botnetC2.slaves)) ? window.botnetC2.slaves.length : 0;
      return +(baseGbps + c2Bots * 0.9).toFixed(1);
    }

    getTargetMitigationGbps(host) {
      if (!host) return 1.0;
      const fwl = Number(host.firewallVer || 1.0);
      if (fwl <= 1.0) return 0.8;
      return +(fwl * 1.15).toFixed(1);
    }

    launchDdosOverloadOnHost(targetIp) {
      if (!window.internetEngine) return { success: false, message: 'Motor de rede indisponível.' };
      const host = window.internetEngine.resolveHost(targetIp);
      if (!host || host.notFound) return { success: false, message: 'Alvo não encontrado.' };
      if (host.kind === 'self') {
        const msg = 'Operação bloqueada: você não pode disparar Sobrecarga DDoS contra o seu próprio PC!';
        if (typeof window.showToast === 'function') window.showToast('⚠️ ' + msg);
        return { success: false, message: msg };
      }
      if (host.newbieProtected) {
        const msg = `Proteção de Iniciante: ${host.hostname} possui menos de 100 REP e não pode sofrer DDoS PvP!`;
        if (typeof window.showToast === 'function') window.showToast('⚠️ ' + msg);
        return { success: false, message: msg };
      }

      const myGbps = this.getPlayerTotalDdosGbps();
      const reqGbps = this.getTargetMitigationGbps(host);

      if (myGbps < reqGbps) {
        const msg = `SOBRECARGA MITIGADA! Seu poder DDoS atual (${myGbps} Gbps) é menor que a mitigação do Escudo de ${host.hostname} (${reqGbps} Gbps). Anexe bots na Botnet C2 ou plante vírus DDoS_Node.vddos!`;
        if (window.hackerAudio) window.hackerAudio.playErrorBuzz();
        if (typeof window.showToast === 'function') window.showToast('🛡️ ' + msg);
        return { success: false, code: 'DDOS_TOO_WEAK', message: msg };
      }

      const dmgPct = Math.min(50, Math.max(30, Math.round(30 + (myGbps - reqGbps) * 7)));
      const prevHealth = this.getTargetHealthPct(host.ip);
      const nextHealth = Math.max(20, prevHealth - dmgPct);
      const prevPen = this.getTargetFirewallPenalty(host.ip);
      const nextPen = Math.min(1.0, +(prevPen + 0.5).toFixed(1));

      this.remoteDamage[host.ip] = {
        healthPct: nextHealth,
        fwPenalty: nextPen,
        updatedAt: Date.now()
      };
      this.saveDamageMap();

      const route = window.bounceEngine
        ? window.bounceEngine.routeConnectionAndGetVisibleIp(host.ip)
        : { visibleIp: window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0', bounced: false };

      window.internetEngine.appendServerLog(
        host.ip,
        `DDOS_OVERLOAD src=${route.visibleIp} power=${myGbps}Gbps hw_integrity=${nextHealth}%`
      );

      if (host.isRealHuman && window.onlineEngine) {
        const peer = window.onlineEngine.getHumanPlayerByIp(host.ip);
        if (peer) peer.hardwareHealthPct = nextHealth;
        window.onlineEngine.sendPvpPacket({
          kind: 'PVP_DDOS_DAMAGE',
          visibleIp: route.visibleIp,
          targetUserId: host.humanUserId,
          targetTag: host.humanTag,
          targetIp: host.ip,
          d: {
            damagePct: dmgPct,
            gbps: myGbps
          }
        });
      }

      if (window.currentProfile) {
        window.integrityGuard.runAuthorized(() => {
          window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 30;
        });
      }

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog(
          'DDOS-STRIKE',
          `Sobrecarga DDoS (${myGbps} Gbps) atingiu ${host.hostname} [${host.ip}]: peças danificadas de ${prevHealth}% para ${nextHealth}%! (+30 REP)`,
          'success'
        );
      }

      // Verificar se este alvo tinha a cabeça a prêmio no Quadro de Vingança por Nick!
      let bountyClaimedMsg = '';
      if (window.playerBountyEngine) {
        const bRes = window.playerBountyEngine.checkAndClaimBountyForHost(host, 'Sobrecarga DDoS');
        if (bRes && bRes.claimed) {
          bountyClaimedMsg = ` 💀 RECOMPENSA CAPTURADA: +$ ${bRes.rewardCash.toLocaleString('pt-BR')} HC!`;
        }
      }

      if (window.hackerAudio && typeof window.hackerAudio.playCashChime === 'function') {
        window.hackerAudio.playCashChime();
      }
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
      window.internetEngine.render();

      const finalMsg = `💥 Sobrecarga DDoS queimou circuitos de ${host.hostname}! Saúde do PC alvo caiu para ${nextHealth}%!${bountyClaimedMsg}`;
      if (typeof window.showToast === 'function') window.showToast(finalMsg);
      return { success: true, prevHealth, nextHealth, dmgPct, message: finalMsg };
    }
  }

  // =========================================================================
  // 4. PLAYER REVENGE BOUNTY BOARD BY NICK (VINGANÇA QUANDO APAGAM O IP!)
  // =========================================================================
  class PlayerBountyEngine {
    constructor() {
      this.storageKey = 'HC_GLOBAL_PLAYER_BOUNTIES_V1';
      this.bounties = [];
      this.loaded = false;
    }

    ensureLoaded() {
      if (this.loaded) return this.bounties;
      this.loaded = true;
      try {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.bounties = parsed;
            return this.bounties;
          }
        }
      } catch (e) {}

      const bots = (window.botScheduler && window.botScheduler.getCurrentDayBots()) || [];
      const bTarget = bots[0] || { handle: 'Kuro_Phantom', ip: '10.110.2.14' };
      this.bounties = [
        {
          id: 'bty_seed_1',
          posterKey: 'npc_rookie',
          posterTag: 'rookie_br',
          targetTag: bTarget.handle,
          reason: 'Invadiu meu PC, limpou a log inteira e deixou farpa me chamando de fraco!',
          rewardCash: 450,
          status: 'open',
          claimedByTag: null,
          claimedTargetIp: null,
          createdAt: new Date().toLocaleTimeString('pt-BR')
        },
        {
          id: 'bty_seed_2',
          posterKey: 'npc_nyx',
          posterTag: 'nyx_0day',
          targetTag: 'm4riposa',
          reason: 'Drenou minha conta corrente de madrugada e sumiu no Proxy Bounce.',
          rewardCash: 1200,
          status: 'open',
          claimedByTag: null,
          claimedTargetIp: null,
          createdAt: new Date().toLocaleTimeString('pt-BR')
        }
      ];
      this.saveLocal();
      return this.bounties;
    }

    saveLocal() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.bounties.slice(0, 40)));
      } catch (e) {}
    }

    reloadFromStorage() {
      try {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) this.bounties = parsed;
        }
      } catch (e) {}
      return this.bounties;
    }

    async syncFromCloud() {
      this.ensureLoaded();
      this.reloadFromStorage();
      if (!window.supabase || (window.onlineEngine && window.onlineEngine.cloudTablesAvailable === false)) return;
      try {
        const { data, error } = await window.supabase
          .from('player_bounties')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(35);
        if (!error && Array.isArray(data)) {
          data.forEach((row) => {
            this.mergeRemoteBounty({
              id: row.id,
              posterKey: row.poster_key,
              posterTag: row.poster_tag,
              targetTag: row.target_tag,
              reason: row.reason,
              rewardCash: Number(row.reward_cash || 300),
              status: row.status,
              claimedByTag: row.claimed_by_tag,
              claimedTargetIp: row.claimed_target_ip,
              createdAt: new Date(row.created_at).toLocaleTimeString('pt-BR')
            });
          });
          this.saveLocal();
        }
      } catch (e) {}
    }

    mergeRemoteBounty(bObj) {
      if (!bObj || !bObj.id) return;
      this.ensureLoaded();
      const idx = this.bounties.findIndex((x) => x.id === bObj.id);
      if (idx >= 0) {
        this.bounties[idx] = { ...this.bounties[idx], ...bObj };
      } else {
        this.bounties.unshift(bObj);
      }
      this.saveLocal();
    }

    getOpenBounties() {
      this.ensureLoaded();
      this.reloadFromStorage();
      return this.bounties.filter((b) => b.status === 'open');
    }

    extractNickFromTauntMsg(msg) {
      const txt = String(msg || '').trim();
      const assMatch = txt.match(/(?:Ass|Assinado|By|Por)\s*:\s*([A-Za-z0-9_.-]{3,24})/i);
      if (assMatch) return assMatch[1];
      const farpaMatch = txt.match(/FARPA\s+DE\s+([A-Za-z0-9_.-]{3,24})/i);
      if (farpaMatch) return farpaMatch[1];
      const wipedMatch = txt.match(/APAGADO\s+POR\s+([A-Za-z0-9_.-]{3,24})/i);
      if (wipedMatch) return wipedMatch[1];
      return '';
    }

    async postBounty(targetTagRaw, rewardCashRaw, reasonRaw) {
      this.ensureLoaded();
      this.reloadFromStorage();
      if (!window.currentProfile || !window.currentWallet) {
        return { success: false, message: 'Sessão não carregada.' };
      }

      const targetTag = String(targetTagRaw || '').trim().replace(/^[@[\]]+|[\]]+$/g, '');
      const rewardCash = Math.round(Number(rewardCashRaw || 0));
      const reason = String(reasonRaw || '').trim() || 'Apagou o próprio IP da minha log e deixou farpa!';

      if (targetTag.length < 3 || targetTag.length > 24) {
        return { success: false, message: 'Informe o Nick exato do alvo (3 a 24 caracteres).' };
      }
      if (targetTag.toLowerCase() === String(window.currentProfile.hacker_tag || '').toLowerCase()) {
        return { success: false, message: 'Você não pode colocar a própria cabeça a prêmio!' };
      }
      if (!Number.isFinite(rewardCash) || rewardCash < 300) {
        return { success: false, message: 'O prêmio mínimo para publicar um Contrato de Vingança é $ 300 HC.' };
      }
      if (parseFloat(window.currentWallet.balance) < rewardCash) {
        return { success: false, message: `Saldo insuficiente! Você precisa de $ ${rewardCash.toLocaleString('pt-BR')} HC em caixa para depositar o prêmio em custódia.` };
      }

      window.integrityGuard.runAuthorized(() => {
        window.currentWallet.balance = Math.max(0, +(parseFloat(window.currentWallet.balance) - rewardCash).toFixed(2));
      });

      const bounty = {
        id: 'bty_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 5),
        posterKey: window.currentProfile.id,
        posterTag: window.currentProfile.hacker_tag,
        targetTag,
        reason: reason.slice(0, 140),
        rewardCash,
        status: 'open',
        claimedByTag: null,
        claimedTargetIp: null,
        createdAt: new Date().toLocaleTimeString('pt-BR')
      };

      this.bounties.unshift(bounty);
      this.saveLocal();

      if (window.supabase && (!window.onlineEngine || window.onlineEngine.cloudTablesAvailable !== false)) {
        try {
          await window.supabase.from('player_bounties').insert({
            id: bounty.id,
            poster_key: bounty.posterKey,
            poster_tag: bounty.posterTag,
            target_tag: bounty.targetTag,
            reason: bounty.reason,
            reward_cash: bounty.rewardCash,
            status: 'open'
          });
        } catch (e) {}
      }

      if (window.onlineEngine) {
        window.onlineEngine.sendPvpPacket({
          kind: 'BOUNTY_POSTED',
          visibleIp: '0.0.0.0',
          d: { bounty }
        });
        window.onlineEngine.scheduleSave(true);
      }

      if (window.safenetFbiEngine) {
        window.safenetFbiEngine.addNews(
          'VINGANÇA-PVP',
          `${bounty.posterTag} colocou $ ${rewardCash.toLocaleString('pt-BR')} HC pela cabeça de "${targetTag}"!`
        );
        if (window.winManager && window.winManager.current === 'winFbi') {
          window.safenetFbiEngine.renderUI();
        }
      }

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('BOUNTY-POSTED', `Contrato de Vingança publicado contra "${targetTag}": -$ ${rewardCash} HC em custódia.`, 'warning');
      }
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.hackerAudio) window.hackerAudio.playCashChime();
      return { success: true, bounty, message: `💀 Cabeça de ${targetTag} colocada a prêmio por $ ${rewardCash.toLocaleString('pt-BR')} HC!` };
    }

    checkAndClaimBountyForHost(host, methodLabel = 'Invasão Root') {
      if (!host || !window.currentProfile || !window.currentWallet) return { claimed: false };
      this.ensureLoaded();
      this.reloadFromStorage();

      const candidateTags = [
        host.humanTag,
        host.hacker_tag,
        host.botRef && host.botRef.handle,
        String(host.hostname || '').replace(/^PC de\s+/i, '').replace(/\s*\[.*\]$/, '')
      ]
        .filter(Boolean)
        .map((t) => String(t).trim().toLowerCase());

      if (candidateTags.length === 0) return { claimed: false };

      const matching = this.bounties.filter(
        (b) => b.status === 'open' && candidateTags.includes(String(b.targetTag || '').trim().toLowerCase())
      );
      if (matching.length === 0) return { claimed: false };

      let totalReward = 0;
      const hunterTag = window.currentProfile.hacker_tag || 'Caçador';

      matching.forEach((b) => {
        b.status = 'claimed';
        b.claimedByTag = hunterTag;
        b.claimedTargetIp = host.ip;
        totalReward += Number(b.rewardCash || 0);

        if (window.supabase && (!window.onlineEngine || window.onlineEngine.cloudTablesAvailable !== false)) {
          window.supabase
            .from('player_bounties')
            .update({
              status: 'claimed',
              claimed_by_tag: hunterTag,
              claimed_target_ip: host.ip,
              claimed_at: new Date().toISOString()
            })
            .eq('id', b.id)
            .then(() => {})
            .catch(() => {});
        }

        if (window.onlineEngine) {
          window.onlineEngine.sendPvpPacket({
            kind: 'BOUNTY_CLAIMED',
            visibleIp: '0.0.0.0',
            targetUserId: b.posterKey,
            targetTag: b.posterTag,
            d: {
              bountyId: b.id,
              targetTag: b.targetTag,
              targetIp: host.ip,
              claimedByTag: hunterTag,
              method: methodLabel,
              rewardCash: b.rewardCash
            }
          });
        }
      });

      this.saveLocal();

      window.integrityGuard.runAuthorized(() => {
        window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) + totalReward).toFixed(2);
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 110;
      });

      if (window.safenetFbiEngine) {
        window.safenetFbiEngine.addNews(
          'VINGANÇA-PAGA',
          `${hunterTag} localizou e puniu ${matching[0].targetTag} [${host.ip}] via ${methodLabel}, embolsando $ ${totalReward.toLocaleString('pt-BR')} HC!`
        );
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog(
          'BOUNTY-CLAIMED',
          `Contrato de Vingança concluído contra ${matching[0].targetTag} (${host.ip}): +$ ${totalReward} HC (+110 REP)!`,
          'success'
        );
      }
      if (window.hackerAudio && typeof window.hackerAudio.playMoneyCollect === 'function') {
        window.hackerAudio.playMoneyCollect();
      }
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.onlineEngine) window.onlineEngine.scheduleSave(true);

      return { claimed: true, rewardCash: totalReward, targetTag: matching[0].targetTag };
    }

    renderBountyTabHtml() {
      this.ensureLoaded();
      this.reloadFromStorage();
      const openList = this.bounties.filter((b) => b.status === 'open');
      const claimedList = this.bounties.filter((b) => b.status === 'claimed').slice(0, 6);

      const openRows = openList.length === 0
        ? `<div class="hc-card" style="padding:1.5rem;text-align:center;color:var(--hc-text-2);">Nenhuma cabeça a prêmio aberta agora. Publique um contrato acima quando algum folgado deixar farpa na sua log!</div>`
        : openList.map((b) => {
            const knownPeer = window.onlineEngine && window.onlineEngine.findAnyPlayerByTag
              ? window.onlineEngine.findAnyPlayerByTag(b.targetTag)
              : null;
            return `
              <div class="hc-card" style="padding:0.95rem 1.15rem;border-color:rgba(240,168,58,0.45);display:grid;grid-template-columns:minmax(190px,1.2fr) minmax(220px,1.6fr) minmax(135px,0.9fr) auto;gap:12px;align-items:center;">
                <div>
                  <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                    <span class="hc-badge danger">ALVO PROCURADO</span>
                    <strong style="font-size:0.95rem;color:#fff;">${esc(b.targetTag)}</strong>
                  </div>
                  <div style="font-size:0.75rem;color:var(--hc-text-3);margin-top:3px;">
                    Contratante: <strong>${esc(b.posterTag)}</strong> · às ${esc(b.createdAt)}
                  </div>
                </div>
                <div style="font-size:0.8rem;color:var(--hc-text-2);">
                  "${esc(b.reason)}"
                  <div style="font-size:0.73rem;color:var(--hc-accent-text);font-family:var(--hc-font-mono);margin-top:3px;">
                    Como cobrar: Invada o PC de ${esc(b.targetTag)} ou dispare Sobrecarga DDoS nele!
                  </div>
                </div>
                <div>
                  <div style="font-size:0.68rem;color:var(--hc-text-3);text-transform:uppercase;">Prêmio em Custódia</div>
                  <strong style="font-family:var(--hc-font-mono);font-size:1rem;color:var(--hc-warning);">$ ${Number(b.rewardCash).toLocaleString('pt-BR')} HC</strong>
                </div>
                <div style="display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap;">
                  ${knownPeer && knownPeer.publicIp
                    ? `<button type="button" class="hc-btn primary sm" onclick="window.internetEngine.openIp('${esc(knownPeer.publicIp)}', 'invadir')">Caçar ${esc(knownPeer.publicIp)} →</button>`
                    : `<button type="button" class="hc-btn ghost sm" onclick="navTo('winOnline')">Buscar na Rede →</button>`}
                </div>
              </div>
            `;
          }).join('');

      const claimedHtml = claimedList.length === 0
        ? ''
        : `
          <div class="hc-eyebrow" style="margin-top:6px;">Vinganças Já Executadas Recentemente</div>
          <div class="hc-card" style="padding:0.75rem 1rem;display:flex;flex-direction:column;gap:6px;">
            ${claimedList.map((c) => `
              <div style="font-size:0.78rem;font-family:var(--hc-font-mono);color:var(--hc-text-2);border-bottom:1px solid var(--hc-border);padding-bottom:5px;">
                💀 <strong>${esc(c.claimedByTag || 'Caçador')}</strong> derrubou <strong>${esc(c.targetTag)}</strong> ${c.claimedTargetIp ? `[${esc(c.claimedTargetIp)}]` : ''} e levou <span style="color:var(--hc-accent-text);">$ ${Number(c.rewardCash).toLocaleString('pt-BR')} HC</span> (contrato de ${esc(c.posterTag)})
              </div>
            `).join('')}
          </div>
        `;

      return `
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div class="hc-card" style="padding:1.1rem 1.2rem;border-color:rgba(208,68,58,0.45);background:rgba(208,68,58,0.06);">
            <div class="hc-eyebrow" style="margin-bottom:6px;">💀 Publicar Contrato de Vingança por Nick (Quando o invasor apagou o IP e deixou só o Nome na Farpa!)</div>
            <div style="display:grid;grid-template-columns:minmax(160px,1fr) 150px minmax(220px,1.6fr) auto;gap:8px;align-items:center;">
              <input type="text" id="bountyTargetNickInput" class="form-input" placeholder="Nick do Alvo (ex: ShadowViper)">
              <input type="number" id="bountyRewardCashInput" class="form-input" min="300" step="50" value="500" style="font-family:var(--hc-font-mono);" placeholder="Prêmio ($ HC)">
              <input type="text" id="bountyReasonInput" class="form-input" placeholder="Motivo (ex: Apagou o IP e me xingou na log!)">
              <button type="button" id="btnPostPlayerBounty" class="hc-btn primary" style="background:var(--hc-danger);border-color:var(--hc-danger);" onclick="window.handlePostPlayerBountyFromForm()">
                💀 Colocar a Prêmio
              </button>
            </div>
            <div style="font-size:0.75rem;color:var(--hc-text-3);margin-top:6px;">
              O valor fica retido em custódia. O primeiro jogador que invadir o PC ou queimar o hardware desse Nick recebe o prêmio na hora e você é avisado por e-mail!
            </div>
          </div>

          <div class="hc-eyebrow">Cabeças a Prêmio Abertas (${openList.length})</div>
          <div style="display:flex;flex-direction:column;gap:8px;">${openRows}</div>
          ${claimedHtml}
        </div>
      `;
    }

    openQuickBountyModal(prefillNick = '', prefillReason = '') {
      let overlay = document.getElementById('hcBountyModalOverlay');
      if (overlay) overlay.remove();

      overlay = document.createElement('div');
      overlay.id = 'hcBountyModalOverlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:99990;background:rgba(6,9,14,0.82);display:flex;align-items:center;justify-content:center;padding:16px;';
      overlay.innerHTML = `
        <div class="hc-card" style="width:100%;max-width:480px;padding:1.3rem;border-color:var(--hc-danger);box-shadow:0 22px 60px rgba(0,0,0,0.75);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span class="hc-badge danger">CONTRATO DE VINGANÇA P2P</span>
            <button type="button" class="hc-btn ghost sm" onclick="document.getElementById('hcBountyModalOverlay')?.remove()">✕</button>
          </div>
          <h3 style="font-size:1.05rem;margin:0 0 6px;">💀 Colocar Cabeça do Invasor a Prêmio</h3>
          <p style="font-size:0.8rem;color:var(--hc-text-2);margin:0 0 12px;">
            O invasor apagou o IP dele, mas deixou o Nick na farpa? Ofereça uma recompensa para que caçadores da rede descubram o IP dele e derrubem o PC dele por você!
          </p>
          <div style="display:flex;flex-direction:column;gap:9px;">
            <div>
              <label style="font-size:0.74rem;color:var(--hc-text-3);display:block;margin-bottom:3px;">NICK DO INVASOR</label>
              <input type="text" id="modalBountyNick" class="form-input" value="${esc(prefillNick)}" placeholder="Digite o Nick exato do invasor...">
            </div>
            <div>
              <label style="font-size:0.74rem;color:var(--hc-text-3);display:block;margin-bottom:3px;">RECOMPENSA EM CUSTÓDIA (MÍNIMO $ 300 HC)</label>
              <input type="number" id="modalBountyAmount" class="form-input" min="300" step="50" value="400" style="font-family:var(--hc-font-mono);">
            </div>
            <div>
              <label style="font-size:0.74rem;color:var(--hc-text-3);display:block;margin-bottom:3px;">MOTIVO DO CONTRATO</label>
              <input type="text" id="modalBountyReason" class="form-input" value="${esc(prefillReason || 'Apagou o IP da minha log e deixou farpa!')}">
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px;">
              <button type="button" class="hc-btn ghost" onclick="document.getElementById('hcBountyModalOverlay')?.remove()">Cancelar</button>
              <button type="button" id="btnConfirmModalBounty" class="hc-btn primary" style="background:var(--hc-danger);border-color:var(--hc-danger);" onclick="window.submitModalPlayerBounty()">
                💀 Publicar Recompensa Agora
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }
  }

  // =========================================================================
  // 5. CLÃS GLOBAIS COMPARTILHADOS & CHAT PRIVADO DA EQUIPE EM TEMPO REAL
  // =========================================================================
  class ClanCloudChatEngine {
    constructor() {
      this.clansKey = 'HC_GLOBAL_SHARED_CLANS_V1';
      this.chatKey = 'HC_GLOBAL_CLAN_CHAT_V1';
    }

    loadGlobalClans() {
      try {
        const raw = localStorage.getItem(this.clansKey);
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        return {};
      }
    }

    saveGlobalClan(clanObj) {
      if (!clanObj || !clanObj.tag) return;
      try {
        const map = this.loadGlobalClans();
        map[clanObj.tag] = { ...clanObj, updatedAt: Date.now() };
        localStorage.setItem(this.clansKey, JSON.stringify(map));
      } catch (e) {}
    }

    mergeGlobalClansIntoEngine() {
      if (!window.clanEngine || !window.clanEngine.state) return;
      const map = this.loadGlobalClans();
      Object.values(map).forEach((gc) => {
        if (!gc || !gc.tag) return;
        const idx = window.clanEngine.state.clans.findIndex((c) => c.tag === gc.tag || c.id === gc.id);
        if (idx >= 0) {
          window.clanEngine.state.clans[idx] = {
            ...window.clanEngine.state.clans[idx],
            ...gc,
            treasury: Math.max(Number(window.clanEngine.state.clans[idx].treasury || 0), Number(gc.treasury || 0)),
            members: Math.max(Number(window.clanEngine.state.clans[idx].members || 1), Number(gc.members || 1)),
            powerScore: Math.max(Number(window.clanEngine.state.clans[idx].powerScore || 0), Number(gc.powerScore || 0))
          };
        } else {
          window.clanEngine.state.clans.unshift(gc);
        }
      });
    }

    async publishClanSync(clanObj) {
      if (!clanObj || !clanObj.tag) return;
      this.saveGlobalClan(clanObj);

      if (window.supabase && (!window.onlineEngine || window.onlineEngine.cloudTablesAvailable !== false)) {
        try {
          await window.supabase.from('global_clans').upsert({
            id: clanObj.id,
            tag: clanObj.tag,
            name: clanObj.name,
            leader_tag: clanObj.leader,
            description: clanObj.desc || '',
            server_ip: clanObj.serverIp,
            treasury: Number(clanObj.treasury || 0),
            power_score: Number(clanObj.powerScore || 500),
            wars_won: Number(clanObj.warsWon || 0),
            updated_at: new Date().toISOString()
          });
        } catch (e) {}
      }

      if (window.onlineEngine) {
        window.onlineEngine.sendPvpPacket({
          kind: 'CLAN_SYNC',
          visibleIp: '0.0.0.0',
          d: { clan: clanObj }
        });
      }
    }

    async syncClansFromCloud() {
      this.mergeGlobalClansIntoEngine();
      if (!window.supabase || (window.onlineEngine && window.onlineEngine.cloudTablesAvailable === false)) return;
      try {
        const { data, error } = await window.supabase
          .from('global_clans')
          .select('*')
          .order('power_score', { ascending: false })
          .limit(30);
        if (!error && Array.isArray(data)) {
          data.forEach((row) => {
            this.saveGlobalClan({
              id: row.id,
              tag: row.tag,
              name: row.name,
              leader: row.leader_tag,
              desc: row.description,
              serverIp: row.server_ip,
              treasury: Number(row.treasury || 0),
              powerScore: Number(row.power_score || 500),
              warsWon: Number(row.wars_won || 0),
              members: Array.isArray(row.members) && row.members.length > 0 ? row.members.length : 2
            });
          });
          this.mergeGlobalClansIntoEngine();
          if (window.winManager && window.winManager.current === 'winClan' && window.clanEngine) {
            window.clanEngine.renderUI();
          }
        }
      } catch (e) {}

      const myClan = window.clanEngine ? window.clanEngine.getMyClan() : null;
      if (myClan) {
        try {
          const { data: msgs } = await window.supabase
            .from('clan_messages')
            .select('id, clan_tag, sender_tag, message, created_at')
            .eq('clan_tag', myClan.tag)
            .order('created_at', { ascending: false })
            .limit(25);
          if (Array.isArray(msgs)) {
            msgs.reverse().forEach((m) => {
              this.appendClanMessageLocal(myClan.tag, {
                id: m.id,
                senderTag: m.sender_tag,
                text: m.message,
                at: new Date(m.created_at).toLocaleTimeString('pt-BR')
              });
            });
          }
        } catch (e) {}
      }
    }

    getClanMessages(clanTag) {
      if (!clanTag) return [];
      try {
        const all = JSON.parse(localStorage.getItem(this.chatKey) || '{}');
        const list = all[clanTag] || [];
        if (list.length === 0) {
          return [
            {
              id: 'welcome_' + clanTag,
              senderTag: 'Sistema_Clã',
              text: `Canal criptografado exclusivo da equipe [${clanTag}] online. Coordene alvos, defesas e guerras aqui!`,
              at: 'agora'
            }
          ];
        }
        return list;
      } catch (e) {
        return [];
      }
    }

    appendClanMessageLocal(clanTag, msgObj) {
      if (!clanTag || !msgObj || !msgObj.text) return;
      try {
        const all = JSON.parse(localStorage.getItem(this.chatKey) || '{}');
        const list = Array.isArray(all[clanTag]) ? all[clanTag] : [];
        if (!list.some((x) => x.id === msgObj.id)) {
          list.push(msgObj);
          while (list.length > 35) list.shift();
          all[clanTag] = list;
          localStorage.setItem(this.chatKey, JSON.stringify(all));
        }
      } catch (e) {}
    }

    async sendClanMessage(textRaw) {
      if (!window.clanEngine || !window.currentProfile) {
        return { success: false, message: 'Entre em uma equipe primeiro!' };
      }
      const myClan = window.clanEngine.getMyClan();
      if (!myClan) return { success: false, message: 'Você ainda não pertence a nenhuma equipe!' };

      const text = String(textRaw || '').trim().slice(0, 240);
      if (!text) return { success: false, message: 'Digite uma mensagem para o chat da equipe.' };

      const msgObj = {
        id: 'cmsg_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 5),
        senderTag: window.currentProfile.hacker_tag || 'Operador',
        text,
        at: new Date().toLocaleTimeString('pt-BR')
      };

      this.appendClanMessageLocal(myClan.tag, msgObj);

      if (window.supabase && (!window.onlineEngine || window.onlineEngine.cloudTablesAvailable !== false)) {
        try {
          await window.supabase.from('clan_messages').insert({
            clan_tag: myClan.tag,
            sender_tag: msgObj.senderTag,
            message: msgObj.text
          });
        } catch (e) {}
      }

      if (window.onlineEngine) {
        window.onlineEngine.sendPvpPacket({
          kind: 'CLAN_CHAT_MSG',
          visibleIp: '0.0.0.0',
          d: { clanTag: myClan.tag, msg: msgObj }
        });
      }

      // Se for uma equipe com membros de IA (ex: VGL, NXS, KRS), aliado responde de forma realista!
      if (['VGL', 'NXS', 'KRS'].includes(myClan.tag)) {
        const allyByTag = { VGL: 'm4riposa', NXS: 'kr0n0s_apt', KRS: 'nyx_0day' };
        const ally = allyByTag[myClan.tag];
        setTimeout(() => {
          const replies = [
            `Copiado, ${msgObj.senderTag}! Já deixei meus nós de DDoS prontos caso a gente declare guerra.`,
            `Boa! Se alguém mexer no servidor ${myClan.serverIp} da nossa equipe a gente revida em peso.`,
            `Tô de olho no Quadro de Vingança hoje, tem uns alvos pagando bem em $ HC!`
          ];
          const replyMsg = {
            id: 'cmsg_ai_' + Date.now(),
            senderTag: ally,
            text: replies[Math.floor(Math.random() * replies.length)],
            at: new Date().toLocaleTimeString('pt-BR')
          };
          this.appendClanMessageLocal(myClan.tag, replyMsg);
          if (window.winManager && window.winManager.current === 'winClan' && window.clanEngine) {
            window.clanEngine.renderUI();
          }
        }, 1600);
      }

      window.clanEngine.renderUI();
      return { success: true, msg: msgObj };
    }

    renderClanChatCardHtml(myClan) {
      if (!myClan) return '';
      const msgs = this.getClanMessages(myClan.tag);
      const rows = msgs.map((m) => `
        <div style="padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:0.8rem;">
          <span style="font-family:var(--hc-font-mono);font-size:0.72rem;color:var(--hc-text-3);">[${esc(m.at)}]</span>
          <strong style="color:var(--hc-accent-text);margin:0 5px;">${esc(m.senderTag)}:</strong>
          <span style="color:var(--hc-text);">${esc(m.text)}</span>
        </div>
      `).join('');

      return `
        <div id="clanPrivateChatCard" class="hc-card" style="padding:1rem 1.15rem;border-color:rgba(53,184,119,0.35);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:8px;flex-wrap:wrap;">
            <strong style="font-size:0.88rem;">💬 Chat Privado da Equipe #[${esc(myClan.tag)}]</strong>
            <span class="hc-badge info">Criptografado · Somente Membros [${esc(myClan.tag)}]</span>
          </div>
          <div id="clanChatMessagesList" style="max-height:175px;overflow-y:auto;background:var(--hc-inset);border:1px solid var(--hc-border);border-radius:7px;padding:8px 10px;margin-bottom:8px;">
            ${rows}
          </div>
          <div style="display:flex;gap:8px;">
            <input type="text" id="clanChatInput" class="form-input" placeholder="Escreva para os membros da equipe [${esc(myClan.tag)}]..." onkeydown="if(event.key==='Enter') window.handleSendClanChatMessage()">
            <button type="button" id="btnSendClanChat" class="hc-btn primary sm" onclick="window.handleSendClanChatMessage()">Enviar</button>
          </div>
        </div>
      `;
    }
  }

  window.integrityGuard = new IntegrityGuard();
  window.offlinePvpMailbox = new OfflinePvpMailbox();
  window.ddosOverloadEngine = new DdosOverloadEngine();
  window.playerBountyEngine = new PlayerBountyEngine();
  window.clanCloudChatEngine = new ClanCloudChatEngine();

  window.handlePostPlayerBountyFromForm = async function () {
    const nick = document.getElementById('bountyTargetNickInput')?.value;
    const amt = document.getElementById('bountyRewardCashInput')?.value;
    const reason = document.getElementById('bountyReasonInput')?.value;
    const res = await window.playerBountyEngine.postBounty(nick, amt, reason);
    if (!res.success) {
      if (window.hackerAudio) window.hackerAudio.playErrorBuzz();
      if (typeof window.showToast === 'function') window.showToast('⚠️ ' + res.message);
      return res;
    }
    if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };

  window.submitModalPlayerBounty = async function () {
    const nick = document.getElementById('modalBountyNick')?.value;
    const amt = document.getElementById('modalBountyAmount')?.value;
    const reason = document.getElementById('modalBountyReason')?.value;
    const res = await window.playerBountyEngine.postBounty(nick, amt, reason);
    if (!res.success) {
      if (window.hackerAudio) window.hackerAudio.playErrorBuzz();
      if (typeof window.showToast === 'function') window.showToast('⚠️ ' + res.message);
      return res;
    }
    document.getElementById('hcBountyModalOverlay')?.remove();
    if (typeof window.showToast === 'function') window.showToast(res.message);
    if (window.winManager && window.winManager.current === 'winFbi' && window.safenetFbiEngine) {
      window.safenetFbiEngine.renderUI();
    }
    return res;
  };

  window.handleSendClanChatMessage = async function () {
    const inp = document.getElementById('clanChatInput');
    if (!inp) return null;
    const val = inp.value;
    inp.value = '';
    const res = await window.clanCloudChatEngine.sendClanMessage(val);
    if (!res.success && typeof window.showToast === 'function') {
      window.showToast('⚠️ ' + res.message);
    }
    return res;
  };
})();
