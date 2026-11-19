/**
 * Hacker City // Fase 2 — Pilar 5:
 * Sistema Multi-Bancos (5 Bancos NPC), Vazamento Forense de #Contas em Logs Remotos,
 * Quebra de Senha de Contas Bancárias (BANK_HACK), Aba "Contas Bancárias" no Hacked Database
 * e Transferência / Drenagem Interbancária (com rastreio Safenet se sem Proxy Bounce).
 */
(function () {
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function hashSeed(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  const NPC_BANKS = {
    '77.3.9.21': {
      ip: '77.3.9.21',
      domain: 'bank.hc',
      name: 'First International Bank (Banco Colchão HC)',
      shortName: 'Banco Colchão HC',
      tier: 1,
      openFee: 0,
      accHasherVer: 1.0, // Cracker v1.0 já consegue quebrar contas básicas aqui!
      serverHasherVer: 2.5,
      firewallVer: 2.5,
      antivirusVer: 3.0,
      cpuMhz: 12000,
      netMbps: 1000,
      hddTotalMb: 8192,
      ramTotalMb: 4096,
      desc: 'Banco comercial padrão de Hacker City. Contas correntes protegidas por Hasher de Conta v1.0.'
    },
    '77.3.10.44': {
      ip: '77.3.10.44',
      domain: 'hebc.hc',
      name: 'HEBC Global Clearing Corp',
      shortName: 'HEBC Clearing',
      tier: 2,
      openFee: 250,
      accHasherVer: 1.5,
      serverHasherVer: 3.0,
      firewallVer: 3.0,
      antivirusVer: 3.5,
      cpuMhz: 16000,
      netMbps: 1000,
      hddTotalMb: 12288,
      ramTotalMb: 6144,
      desc: 'Banco corporativo B2B usado por fornecedores de tecnologia e mercados cinza. Exige Cracker v1.5+.'
    },
    '77.3.11.88': {
      ip: '77.3.11.88',
      domain: 'amex.hc',
      name: 'American Expense Private Bank',
      shortName: 'American Expense',
      tier: 2,
      openFee: 650,
      accHasherVer: 2.0,
      serverHasherVer: 3.5,
      firewallVer: 3.5,
      antivirusVer: 4.0,
      cpuMhz: 20000,
      netMbps: 1000,
      hddTotalMb: 16384,
      ramTotalMb: 8192,
      desc: 'Custódia executiva de operadores veteranos. Proteção de PIN bancário Hasher v2.0.'
    },
    '77.3.12.15': {
      ip: '77.3.12.15',
      domain: 'swiss.hc',
      name: 'Swiss Alpine Offshore Vault',
      shortName: 'Swiss Offshore',
      tier: 3,
      openFee: 1800,
      accHasherVer: 2.5,
      serverHasherVer: 4.0,
      firewallVer: 4.0,
      antivirusVer: 4.5,
      cpuMhz: 28000,
      netMbps: 1000,
      hddTotalMb: 32768,
      ramTotalMb: 16384,
      desc: 'Cofre numerado alpino com sigilo reforçado. Exige Cracker.crc v2.5+ para quebrar contas.'
    },
    '77.3.13.99': {
      ip: '77.3.13.99',
      domain: 'quantum-bank.hc',
      name: 'Ultimate Quantum Reserve Bank',
      shortName: 'Quantum Bank',
      tier: 3,
      openFee: 4500,
      accHasherVer: 3.0,
      serverHasherVer: 4.5,
      firewallVer: 4.5,
      antivirusVer: 5.0,
      cpuMhz: 36000,
      netMbps: 1000,
      hddTotalMb: 65536,
      ramTotalMb: 32768,
      desc: 'Reserva institucional de altíssimo valor. Contas blindadas por Hasher Quântico v3.0.'
    }
  };

  // Contas bancárias de vítimas reais espalhadas nos syslogs de servidores do mundo!
  const SEEDED_TARGET_ACCOUNTS = [
    {
      accNumber: '40918204',
      pin: '739201',
      bankIp: '77.3.9.21',
      owner: 'Farofa Systems S.A.',
      leakedOnHostIp: '203.17.88.40',
      initialBalance: 420
    },
    {
      accNumber: '44190827',
      pin: '184509',
      bankIp: '77.3.9.21',
      owner: 'Rádio Pirata 1337 FM',
      leakedOnHostIp: '133.70.13.37',
      initialBalance: 265
    },
    {
      accNumber: '58203911',
      pin: '904216',
      bankIp: '77.3.10.44',
      owner: 'Blackmarket Escrow',
      leakedOnHostIp: '185.220.101.9',
      initialBalance: 790
    },
    {
      accNumber: '69104422',
      pin: '551930',
      bankIp: '77.3.11.88',
      owner: 'Operador m4riposa',
      leakedOnHostIp: '149.56.28.11',
      initialBalance: 1380
    },
    {
      accNumber: '69881205',
      pin: '317842',
      bankIp: '77.3.10.44',
      owner: 'Operador nyx_0day',
      leakedOnHostIp: '91.134.72.19',
      initialBalance: 640
    },
    {
      accNumber: '81209934',
      pin: '660418',
      bankIp: '77.3.12.15',
      owner: 'HC Telecom Treasury',
      leakedOnHostIp: '71.4.5.1',
      initialBalance: 2950
    },
    {
      accNumber: '94007718',
      pin: '882741',
      bankIp: '77.3.13.99',
      owner: 'Fundo Soberano Safenet',
      leakedOnHostIp: '109.64.211.37',
      initialBalance: 5800
    }
  ];

  class MultiBankAccountHackEngine {
    constructor() {
      this.userId = null;
      this.state = null;
      this.loggedBankSession = null; // { bankIp, accNumber }
    }

    storageKey(uid) {
      return `HC_MULTI_BANKS_${uid || 'guest'}`;
    }

    ensureLoaded() {
      const uid = (window.currentProfile && window.currentProfile.id) || 'guest';
      if (this.userId === uid && this.state) return this.state;
      this.userId = uid;

      let saved = null;
      try {
        const raw = localStorage.getItem(this.storageKey(uid));
        if (raw) saved = JSON.parse(raw);
      } catch (e) {}

      if (saved && saved.targetBalances && Array.isArray(saved.hackedAccounts)) {
        this.state = saved;
      } else {
        const targetBalances = {};
        SEEDED_TARGET_ACCOUNTS.forEach((a) => {
          targetBalances[a.accNumber] = a.initialBalance;
        });
        this.state = {
          playerSecondaryAccounts: {}, // bankIp -> { accNumber, pin, balance, openedAt }
          hackedAccounts: [],          // [{ accNumber, pin, bankIp, bankName, owner, lastBalance, crackedAt }]
          targetBalances
        };
        this.save();
      }
      return this.state;
    }

    save() {
      if (!this.state) return;
      try {
        localStorage.setItem(this.storageKey(this.userId), JSON.stringify(this.state));
      } catch (e) {}
    }

    getBankByIp(ip) {
      return NPC_BANKS[ip] || null;
    }

    getAllBanks() {
      return Object.values(NPC_BANKS);
    }

    // Retorna linha forense inicial para semear no /var/log/syslog de hosts com conta bancária!
    getForensicBankLogForHost(hostIp) {
      const seeded = SEEDED_TARGET_ACCOUNTS.find((a) => a.leakedOnHostIp === hostIp);
      if (seeded) {
        return `[00:12:44] wire-daemon: transferred $ ${Math.round(seeded.initialBalance * 0.25)}.00 from account #${seeded.accNumber} at bank [${seeded.bankIp}]`;
      }
      // Para bots Tier 2 e Tier 3, gera conta determinística para investigação forense!
      if (window.botRegistry) {
        const bot = window.botRegistry.getBotByIp(hostIp);
        if (bot && bot.tier >= 2) {
          const dynAcc = this.getOrCreateBotAccount(bot);
          return `[00:18:09] wire-daemon: payment settled via account #${dynAcc.accNumber} at bank [${dynAcc.bankIp}]`;
        }
      }
      return null;
    }

    getOrCreateBotAccount(bot) {
      this.ensureLoaded();
      const h = hashSeed('BOT_BANK::' + bot.ip);
      const accNumber = String(51000000 + (h % 38000000));
      const pin = String(100000 + ((h >>> 3) % 899999));
      const bankIp = bot.tier === 3 ? '77.3.12.15' : '77.3.10.44';
      if (this.state.targetBalances[accNumber] === undefined) {
        this.state.targetBalances[accNumber] = bot.tier === 3 ? 1450 : 480;
        this.save();
      }
      return {
        accNumber,
        pin,
        bankIp,
        owner: `Bot ${bot.handle}`,
        balance: this.state.targetBalances[accNumber]
      };
    }

    resolveTargetAccount(bankIp, accNumRaw) {
      this.ensureLoaded();
      const clean = String(accNumRaw || '').replace(/^#/, '').trim();
      if (!clean) return null;

      const fixed = SEEDED_TARGET_ACCOUNTS.find((a) => a.accNumber === clean && a.bankIp === bankIp);
      if (fixed) {
        const bal = this.state.targetBalances[clean] !== undefined ? this.state.targetBalances[clean] : fixed.initialBalance;
        return { ...fixed, balance: bal };
      }

      // Checar contas determinísticas dos bots
      if (window.botRegistry && Array.isArray(window.botRegistry.bots)) {
        for (const bot of window.botRegistry.bots) {
          if (bot.tier >= 2) {
            const h = hashSeed('BOT_BANK::' + bot.ip);
            const bAcc = String(51000000 + (h % 38000000));
            const bBank = bot.tier === 3 ? '77.3.12.15' : '77.3.10.44';
            if (bAcc === clean && bBank === bankIp) {
              return this.getOrCreateBotAccount(bot);
            }
          }
        }
      }
      return null;
    }

    openSecondaryAccount(bankIp) {
      this.ensureLoaded();
      const bank = NPC_BANKS[bankIp];
      if (!bank) return { success: false, message: 'Banco não encontrado.' };
      if (bankIp === '77.3.9.21') {
        return { success: false, message: 'Você já possui sua conta principal ativa no First International / Banco Colchão!' };
      }
      if (this.state.playerSecondaryAccounts[bankIp]) {
        return { success: false, message: `Você já possui a conta #${this.state.playerSecondaryAccounts[bankIp].accNumber} neste banco.` };
      }
      if (!window.currentWallet || parseFloat(window.currentWallet.balance) < bank.openFee) {
        return { success: false, message: `Saldo insuficiente! A taxa de abertura no ${bank.shortName} é $ ${bank.openFee.toLocaleString('pt-BR')} HC.` };
      }

      window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) - bank.openFee).toFixed(2);
      const accNum = 'HC-' + String(Math.floor(100000 + Math.random() * 899999));
      const pin = String(Math.floor(100000 + Math.random() * 899999));

      this.state.playerSecondaryAccounts[bankIp] = {
        accNumber: accNum,
        pin,
        bankIp,
        bankName: bank.shortName,
        balance: 0,
        openedAt: new Date().toLocaleDateString('pt-BR')
      };
      this.save();

      if (window.currentProfile) window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 25;
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('BANK-OPEN', `Conta offshore #${accNum} aberta em ${bank.shortName} [${bankIp}]`, 'info');
      }
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.internetEngine) window.internetEngine.render();
      this.renderMultiBankOverview();
      return { success: true, accNum, message: `Conta #${accNum} aberta com sucesso no ${bank.shortName}!` };
    }

    moveFundsBetweenOwnAccounts(bankIp, direction, amountRaw) {
      this.ensureLoaded();
      const sec = this.state.playerSecondaryAccounts[bankIp];
      if (!sec || !window.currentWallet) return { success: false, message: 'Conta secundária não localizada.' };
      const amount = +(Number(amountRaw || 0)).toFixed(2);
      if (!Number.isFinite(amount) || amount <= 0) return { success: false, message: 'Informe um valor positivo.' };

      if (direction === 'deposit_offshore') {
        if (parseFloat(window.currentWallet.balance) < amount) {
          return { success: false, message: 'Saldo insuficiente na conta principal!' };
        }
        window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) - amount).toFixed(2);
        sec.balance = +(sec.balance + amount).toFixed(2);
      } else {
        if (sec.balance < amount) {
          return { success: false, message: 'Saldo insuficiente nesta conta offshore!' };
        }
        sec.balance = +(sec.balance - amount).toFixed(2);
        window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) + amount).toFixed(2);
      }
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderMultiBankOverview();
      if (window.internetEngine) window.internetEngine.render();
      return { success: true, message: `Transferência interna de $ ${amount.toLocaleString('pt-BR')} HC concluída!` };
    }

    // Quebrar a senha (PIN) de uma conta bancária descoberta nos logs! (Process::BANK_HACK)
    crackBankAccount(bankIp, accNumRaw, instant = false) {
      this.ensureLoaded();
      const bank = NPC_BANKS[bankIp];
      if (!bank) return { success: false, message: 'IP bancário inválido.' };

      const targetAcc = this.resolveTargetAccount(bankIp, accNumRaw);
      if (!targetAcc) {
        return {
          success: false,
          code: 'ACCOUNT_NOT_FOUND',
          message: `Conta #${String(accNumRaw || '').replace(/^#/, '')} não existe no ${bank.shortName} (${bankIp}). Verifique o número e o IP do banco nos logs!`
        };
      }

      const myCrc = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('cracker') : 1.0;
      if (myCrc < bank.accHasherVer) {
        return {
          success: false,
          code: 'CRACKER_TOO_WEAK',
          message: `Hasher Bancário v${bank.accHasherVer.toFixed(1)} bloqueou o ataque! Evolua seu Cracker.crc para >= v${bank.accHasherVer.toFixed(1)}.`
        };
      }

      const finalizeCrack = () => {
        const route = window.bounceEngine
          ? window.bounceEngine.routeConnectionAndGetVisibleIp(bankIp)
          : { visibleIp: window.networkIdentity.getPublicIp(), bounced: false };

        if (window.internetEngine) {
          window.internetEngine.appendServerLog(
            bankIp,
            `${route.visibleIp} cracked authentication PIN for bank account #${targetAcc.accNumber}`
          );
        }

        const existing = this.state.hackedAccounts.find((h) => h.accNumber === targetAcc.accNumber && h.bankIp === bankIp);
        if (existing) {
          existing.pin = targetAcc.pin;
          existing.lastBalance = targetAcc.balance;
          existing.updatedAt = new Date().toLocaleTimeString();
        } else {
          this.state.hackedAccounts.unshift({
            accNumber: targetAcc.accNumber,
            pin: targetAcc.pin,
            bankIp,
            bankName: bank.shortName,
            owner: targetAcc.owner,
            lastBalance: targetAcc.balance,
            crackedAt: new Date().toLocaleString('pt-BR')
          });
        }
        this.save();

        if (window.currentProfile) {
          window.currentProfile.reputation = (window.currentProfile.reputation || 0) + (35 * bank.tier);
          if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
        }
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog(
            'BANK-CRACK',
            `PIN da conta #${targetAcc.accNumber} (${bank.shortName}) quebrado: PIN ${targetAcc.pin} — salvo em Hacked Database!`,
            'warning'
          );
        }
        if (window.hackerAudio) window.hackerAudio.playCashChime();
        if (typeof window.showToast === 'function') {
          window.showToast(`Conta #${targetAcc.accNumber} quebrada! PIN: ${targetAcc.pin} (salvo em Hacked Database).`);
        }
        this.loggedBankSession = { bankIp, accNumber: targetAcc.accNumber };
        if (window.internetEngine) window.internetEngine.render();
        if (window.hackedDb) window.hackedDb.renderUI();
      };

      if (instant || !window.taskManager) {
        finalizeCrack();
        return { success: true, crackedNow: true, pin: targetAcc.pin, accNumber: targetAcc.accNumber };
      }

      const idealSec = Math.max(2.5, +(4.0 * bank.accHasherVer / Math.max(1, myCrc * 0.85)).toFixed(1));
      const enq = window.taskManager.enqueue({
        dedupeKey: `bank_crack_${bankIp}_${targetAcc.accNumber}`,
        title: `Quebrar Conta #${targetAcc.accNumber}`,
        subtitle: `${bank.shortName} · Cracker v${myCrc.toFixed(1)}`,
        targetIp: bankIp,
        queueKind: 'cpu',
        category: 'Ataque',
        idealSeconds: idealSec,
        onComplete: finalizeCrack
      });

      if (!enq.started) return { success: false, message: enq.message };
      if (typeof window.showToast === 'function') {
        window.showToast(`Quebrando PIN da conta #${targetAcc.accNumber} no Task Manager...`);
      }
      return { success: true, queued: true, pid: enq.process.pid };
    }

    loginBankAccount(bankIp, accNumRaw, pinRaw) {
      const targetAcc = this.resolveTargetAccount(bankIp, accNumRaw);
      if (!targetAcc) return { success: false, message: 'Número de conta inválido neste banco.' };
      if (String(pinRaw || '').trim() !== targetAcc.pin) {
        return { success: false, message: 'PIN bancário incorreto! Quebre a senha da conta primeiro.' };
      }
      this.loggedBankSession = { bankIp, accNumber: targetAcc.accNumber };
      if (window.internetEngine) window.internetEngine.render();
      return { success: true };
    }

    drainCrackedBankAccount(bankIp, accNumRaw, pinRaw = null) {
      this.ensureLoaded();
      const bank = NPC_BANKS[bankIp];
      const targetAcc = this.resolveTargetAccount(bankIp, accNumRaw);
      if (!bank || !targetAcc) return { success: false, message: 'Conta não encontrada.' };

      const hackedEntry = this.state.hackedAccounts.find((h) => h.accNumber === targetAcc.accNumber && h.bankIp === bankIp);
      const effectivePin = pinRaw != null ? String(pinRaw).trim() : (hackedEntry ? hackedEntry.pin : '');
      if (effectivePin !== targetAcc.pin) {
        return { success: false, message: 'Acesso negado: você precisa quebrar o PIN desta conta antes de drenar o saldo!' };
      }
      if (targetAcc.balance <= 0) {
        return { success: false, code: 'EMPTY_ACCOUNT', message: `A conta #${targetAcc.accNumber} já está zerada ($ 0.00 HC).` };
      }

      const amount = targetAcc.balance;
      this.state.targetBalances[targetAcc.accNumber] = 0;
      if (hackedEntry) hackedEntry.lastBalance = 0;
      this.save();

      if (window.currentWallet) {
        window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) + amount).toFixed(2);
      }

      const route = window.bounceEngine
        ? window.bounceEngine.routeConnectionAndGetVisibleIp(bankIp)
        : { visibleIp: window.networkIdentity.getPublicIp(), bounced: false };
      const myAccNum = (window.currentWallet && window.currentWallet.account_number) || 'HC-MAIN';

      if (window.internetEngine) {
        window.internetEngine.appendServerLog(
          bankIp,
          `${route.visibleIp} transferred $ ${amount} from #${targetAcc.accNumber} to #${myAccNum} [77.3.9.21]`
        );
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog(
          'BANK-DRAIN',
          `Wire transfer concluído de #${targetAcc.accNumber} (${bank.shortName}): +$ ${amount.toLocaleString('pt-BR')} HC!`,
          'success'
        );
      }

      // Se drenou valor alto SEM Bounce ativo, a Safenet rastreia o wire transfer!
      if (!route.bounced && amount >= 400 && window.safenetFbiEngine) {
        window.safenetFbiEngine.evaluatePlayerCrime(
          `Fraude bancária direta sem Bounce ($ ${amount} de #${targetAcc.accNumber})`,
          amount,
          bankIp
        );
      }
      if (window.missionsEngine) {
        window.missionsEngine.notifyHostDrained(bankIp);
      }
      if (window.currentProfile) {
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + Math.min(120, Math.round(amount / 18));
      }
      if (window.hackerAudio) window.hackerAudio.playMoneyCollect();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.internetEngine) window.internetEngine.render();
      if (window.hackedDb) window.hackedDb.renderUI();

      return {
        success: true,
        amount,
        bounced: route.bounced,
        message: `+$ ${amount.toLocaleString('pt-BR')} HC transferidos da conta #${targetAcc.accNumber}! Lembre-se de apagar os logs do banco (${bankIp})!`
      };
    }

    renderBankPortalHtml(host) {
      this.ensureLoaded();
      const bank = NPC_BANKS[host.ip] || NPC_BANKS['77.3.9.21'];
      const mySecAcc = this.state.playerSecondaryAccounts[bank.ip];
      const hackedHere = this.state.hackedAccounts.filter((h) => h.bankIp === bank.ip);

      const activeAcc = (this.loggedBankSession && this.loggedBankSession.bankIp === bank.ip)
        ? this.resolveTargetAccount(bank.ip, this.loggedBankSession.accNumber)
        : null;

      const prefillAcc = hackedHere.length > 0 ? hackedHere[0].accNumber : '';
      const prefillPin = hackedHere.length > 0 ? hackedHere[0].pin : '';

      return `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <!-- Cabeçalho Institucional do Banco -->
          <div class="hc-card" style="padding:1.15rem;border-color:rgba(53,184,119,0.35);">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
              <div>
                <div class="hc-eyebrow">Sistema Interbancário · ${esc(bank.domain)}</div>
                <h3 style="font-size:1.08rem;margin:3px 0 4px;">${esc(bank.name)}</h3>
                <p style="font-size:0.82rem;color:var(--hc-text-2);margin:0;">${esc(bank.desc)}</p>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <span class="hc-badge info">Hasher de Conta v${bank.accHasherVer.toFixed(1)}</span>
                ${bank.ip === '77.3.9.21'
                  ? `<button type="button" class="hc-btn primary sm" onclick="navTo('winBank')">Minha Conta Principal →</button>`
                  : (mySecAcc
                      ? `<span class="hc-badge success">Sua Conta: #${esc(mySecAcc.accNumber)} ($ ${mySecAcc.balance.toLocaleString('pt-BR')})</span>`
                      : `<button type="button" id="btnOpenBankAcc_${esc(bank.ip.replace(/\./g, '_'))}" class="hc-btn primary sm" onclick="window.handleOpenSecondaryBank('${esc(bank.ip)}')">Abrir Conta Offshore ($ ${bank.openFee.toLocaleString('pt-BR')})</button>`)}
              </div>
            </div>
          </div>

          ${activeAcc ? `
            <!-- Sessão Autenticada na Conta Invadida! -->
            <div class="hc-card" style="padding:1.15rem;border-color:var(--hc-warning);background:rgba(216,155,56,0.08);">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
                <div>
                  <span class="hc-badge warn">ACESSO BANCÁRIO REMOTO ATIVO</span>
                  <div style="font-family:var(--hc-font-mono);font-size:1rem;margin-top:4px;">
                    Conta <strong>#${esc(activeAcc.accNumber)}</strong> · Titular: ${esc(activeAcc.owner)}
                  </div>
                  <div style="font-family:var(--hc-font-mono);font-size:1.3rem;font-weight:700;color:var(--hc-accent-text);margin-top:2px;">
                    Saldo Disponível: $ ${activeAcc.balance.toLocaleString('pt-BR')}.00 HC
                  </div>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  <button type="button" id="btnDrainBankAccountNow" class="hc-btn primary" ${activeAcc.balance <= 0 ? 'disabled' : ''} onclick="window.handleDrainBankAccount('${esc(bank.ip)}', '${esc(activeAcc.accNumber)}', '${esc(activeAcc.pin)}')">
                    ${activeAcc.balance > 0 ? `Transferir Tudo p/ Minha Carteira (+$ ${activeAcc.balance} HC)` : 'Conta Zerada ($ 0)'}
                  </button>
                  <button type="button" class="hc-btn ghost sm" onclick="window.multiBankEngine.loggedBankSession=null;window.internetEngine.render();">Sair da Conta</button>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Grid: Login em Conta de Terceiros vs Quebrar Senha de #Conta (BANK_HACK) -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:14px;">
            <div class="hc-card" style="padding:1.1rem;">
              <div class="hc-eyebrow" style="margin-bottom:6px;">Quebrar Senha de Conta (BANK_HACK)</div>
              <p style="font-size:0.78rem;color:var(--hc-text-2);margin:0 0 10px;">
                Descobriu um número <code>#conta</code> no <code>/var/log/syslog</code> de uma empresa ou bot? Quebre o PIN aqui (exige <code>Cracker.crc &gt;= v${bank.accHasherVer.toFixed(1)}</code>):
              </p>
              <div style="display:flex;gap:8px;">
                <input type="text" id="bankCrackAccInput" class="form-input" style="font-family:var(--hc-font-mono);" placeholder="Nº da Conta (ex: 40918204)" value="${esc(prefillAcc)}">
                <button type="button" id="btnCrackBankAcc" class="hc-btn primary" onclick="window.handleCrackBankAccount('${esc(bank.ip)}')">Quebrar PIN</button>
              </div>
            </div>

            <div class="hc-card" style="padding:1.1rem;">
              <div class="hc-eyebrow" style="margin-bottom:6px;">Acessar Conta por #Número + PIN</div>
              <div style="display:flex;gap:8px;margin-bottom:8px;">
                <input type="text" id="bankLoginAccInput" class="form-input" style="font-family:var(--hc-font-mono);" placeholder="#Conta" value="${esc(prefillAcc)}">
                <input type="text" id="bankLoginPinInput" class="form-input" style="font-family:var(--hc-font-mono);max-width:130px;" placeholder="PIN" value="${esc(prefillPin)}">
              </div>
              <button type="button" id="btnLoginBankAcc" class="hc-btn sm" style="width:100%;justify-content:center;" onclick="window.handleLoginBankAccount('${esc(bank.ip)}')">Entrar na Conta</button>
            </div>
          </div>

          <div class="hc-card" style="padding:0.95rem 1.1rem;">
            <div class="hc-eyebrow" style="margin-bottom:6px;">Diretório dos 5 Bancos Internacionais de Hacker City</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${this.getAllBanks().map((b) => `
                <button type="button" class="hc-btn ${b.ip === bank.ip ? 'primary' : 'ghost'} sm" onclick="window.internetEngine.navigate('${b.ip}')">
                  ${esc(b.shortName)} (${b.ip} · Hasher v${b.accHasherVer.toFixed(1)})
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    renderHackedBankAccountsHtml() {
      this.ensureLoaded();
      const list = this.state.hackedAccounts || [];
      if (list.length === 0) {
        return `
          <div class="hc-card" style="padding:2rem;text-align:center;color:var(--hc-text-2);">
            <div style="font-weight:600;color:var(--hc-text);margin-bottom:6px;">Nenhuma conta bancária hackeada salva ainda</div>
            <div style="font-size:0.84rem;margin-bottom:12px;">
              Inspecione o <code>/var/log/syslog</code> de servidores invadidos (ex: <code>203.17.88.40</code> Farofa Systems) para achar números de <code>#conta</code> vazados em transferências e quebre o PIN no IP do respectivo banco!
            </div>
            <button type="button" class="hc-btn primary sm" onclick="window.internetEngine.openIp('77.3.9.21')">Ir ao First International Bank (77.3.9.21) →</button>
          </div>
        `;
      }

      return `
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${list.map((a) => {
            const live = this.resolveTargetAccount(a.bankIp, a.accNumber);
            const curBal = live ? live.balance : a.lastBalance;
            return `
              <div class="hc-card" style="padding:0.9rem 1.1rem;display:grid;grid-template-columns:minmax(200px,1.2fr) minmax(170px,1fr) minmax(140px,0.9fr) auto;gap:12px;align-items:center;">
                <div>
                  <strong style="font-family:var(--hc-font-mono);font-size:0.95rem;color:var(--hc-accent-text);">#${esc(a.accNumber)}</strong>
                  <span class="hc-badge info" style="margin-left:6px;">${esc(a.bankName)}</span>
                  <div style="font-size:0.77rem;color:var(--hc-text-2);margin-top:2px;">Titular: ${esc(a.owner)} · Banco: <code>${esc(a.bankIp)}</code></div>
                </div>
                <div>
                  <span style="font-size:0.7rem;color:var(--hc-text-3);display:block;">CREDENCIAIS BANCÁRIAS</span>
                  <code style="font-family:var(--hc-font-mono);color:var(--hc-text);">PIN: <strong style="color:var(--hc-accent-text);">${esc(a.pin)}</strong></code>
                </div>
                <div>
                  <span style="font-size:0.7rem;color:var(--hc-text-3);display:block;">SALDO ATUAL</span>
                  <strong style="font-family:var(--hc-font-mono);color:${curBal > 0 ? 'var(--hc-warning)' : 'var(--hc-text-3)'};">$ ${curBal.toLocaleString('pt-BR')}.00 HC</strong>
                </div>
                <div style="display:flex;gap:6px;justify-content:flex-end;">
                  ${curBal > 0
                    ? `<button type="button" class="hc-btn primary sm" onclick="window.handleDrainBankAccount('${esc(a.bankIp)}', '${esc(a.accNumber)}', '${esc(a.pin)}')">Drenar ($ ${curBal})</button>`
                    : ''}
                  <button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('${esc(a.bankIp)}')">Abrir Banco</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    copyAccountNumber(acc) {
      if (navigator.clipboard && acc) {
        navigator.clipboard.writeText(acc).catch(() => {});
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`Conta ${acc} copiada!`);
      }
    }

    renderMultiBankOverview(containerId = 'multiBankMount') {
      const el = document.getElementById(containerId);
      if (!el) return;
      this.ensureLoaded();
      const ic = (n) => (window.HC && window.HC.icon ? window.HC.icon(n) : '');

      const mainAcc = (window.currentWallet && window.currentWallet.account_number) || 'HC-0000-00';
      const mainBal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
      const btcUsd = window.bitcoinEngine ? Number(window.bitcoinEngine.getEstimatedUsdValue() || 0) : 0;
      const btcFmt = window.bitcoinEngine ? window.bitcoinEngine.getFormattedBtc() : '0.00025000';

      const allBanks = this.getAllBanks();
      let offshoreTotal = 0;
      const secMap = this.state.playerSecondaryAccounts || {};
      Object.values(secMap).forEach((s) => { offshoreTotal += Number(s.balance || 0); });

      const netWorth = Math.max(1, mainBal + offshoreTotal + btcUsd);
      const protectedSharePct = Math.min(100, Math.round(((offshoreTotal + btcUsd) / netWorth) * 100));
      const r = 46;
      const cCirc = +(2 * Math.PI * r).toFixed(2);
      const offset = +(cCirc - (protectedSharePct / 100) * cCirc).toFixed(2);

      const rows = allBanks.map((b, idx) => {
        const isPrimary = idx === 0;
        const sec = !isPrimary ? secMap[b.ip] : null;
        const isOpen = isPrimary || !!sec;
        const accNum = isPrimary ? mainAcc : (sec ? sec.accNumber : 'Não aberta');
        const bal = isPrimary ? mainBal : (sec ? Number(sec.balance || 0) : 0);
        const desc = isPrimary
          ? 'Sua conta corrente principal para compras de hardware, softwares e transferências entre jogadores.'
          : 'Banco Offshore independente: fundos guardados aqui ficam protegidos contra batidas policiais na conta principal.';

        return `
          <tr class="${isOpen ? 'row-running' : 'row-hidden'}">
            <td class="soft-col-icon">
              <span class="soft-mini-glyph kind-${isPrimary ? 'defense' : 'stealth'}"
                data-tip-title="${esc(b.name)}" data-tip-meta="${esc(b.ip)}" data-tip-desc="${esc(desc)}">
                ${ic('landmark')}
              </span>
            </td>
            <td>
              <span class="soft-name-trigger" tabindex="0"
                data-tip-title="${esc(b.name)}" data-tip-meta="${esc(b.ip)}" data-tip-desc="${esc(desc)}">
                ${isOpen ? '<span class="soft-run-dot"></span>' : ''}
                <span style="font-family:var(--hc-font-sans);">${esc(b.shortName || b.name)}</span>
                ${isPrimary ? `<span class="hc-badge success">Principal</span>` : (isOpen ? `<span class="hc-badge info">Offshore</span>` : '')}
              </span>
            </td>
            <td class="soft-col-size" style="width:135px;color:${isOpen ? 'var(--hc-text)' : 'var(--hc-text-3)'};">${esc(accNum)}</td>
            <td class="soft-col-size" style="width:125px;color:${isOpen ? 'var(--hc-accent-text)' : 'var(--hc-text-3)'};">
              ${isOpen ? `$ ${bal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
            </td>
            <td class="soft-col-acts">
              <div class="soft-icon-actions">
                ${isOpen ? `
                  <button type="button" class="soft-icon-act ic-hide" aria-label="Copiar conta ${esc(accNum)}"
                    data-tip-title="Copiar número da conta" data-tip-meta="${esc(accNum)}"
                    data-tip-desc="Copiar ${esc(accNum)} para receber transferências."
                    onclick="window.multiBankEngine.copyAccountNumber('${esc(accNum)}')">${ic('copy')}</button>
                ` : ''}
                ${!isPrimary && isOpen ? `
                  <button type="button" class="soft-icon-act ic-run" aria-label="Guardar $100 em ${esc(b.shortName)}"
                    data-tip-title="Guardar +$ 100 no cofre" data-tip-meta="Offshore"
                    data-tip-desc="Transferir $ 100 da sua conta principal para ${esc(b.shortName)}."
                    onclick="window.multiBankEngine.moveFundsBetweenOwnAccounts('${esc(b.ip)}', 'deposit_offshore', 100)">${ic('upload')}</button>
                  <button type="button" class="soft-icon-act ic-dl" ${bal <= 0 ? 'disabled' : ''} aria-label="Sacar saldo de ${esc(b.shortName)}"
                    data-tip-title="Resgatar saldo p/ conta principal" data-tip-meta="$ ${bal.toLocaleString('pt-BR')}"
                    data-tip-desc="Trazer todo o saldo de ${esc(b.shortName)} de volta para sua conta principal."
                    onclick="window.multiBankEngine.moveFundsBetweenOwnAccounts('${esc(b.ip)}', 'withdraw_offshore', ${bal})">${ic('download')}</button>
                ` : ''}
                <button type="button" class="soft-icon-act ic-info" aria-label="Visitar portal ${esc(b.shortName)}"
                  data-tip-title="${isOpen ? 'Acessar Portal do Banco' : 'Abrir Conta neste Banco'}"
                  data-tip-meta="${esc(b.ip)}"
                  data-tip-desc="${isOpen ? `Visitar ${esc(b.name)} (${esc(b.ip)}) na Internet.` : `Visite ${esc(b.ip)} na Internet para abrir sua conta secundária gratuita.`}"
                  onclick="window.internetEngine.openIp('${esc(b.ip)}')">${ic('globe')}</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      el.innerHTML = `
        <div class="soft-table-wrap" role="region" aria-label="Suas contas bancárias">
          <table class="soft-table clean-hw-table">
            <thead>
              <tr>
                <th class="soft-col-icon"></th>
                <th>Instituição Bancária</th>
                <th class="soft-col-size" style="width:135px;">Nº da Conta</th>
                <th class="soft-col-size" style="width:125px;">Saldo</th>
                <th class="soft-col-acts">Ações</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;

      const sideEl = document.getElementById('bankSideSummaryMount');
      if (sideEl) {
        const openCount = 1 + Object.keys(secMap).length;
        sideEl.innerHTML = `
          <div class="soft-donut-wrap">
            <svg class="soft-donut-svg" viewBox="0 0 116 116" aria-label="Reserva Protegida ${protectedSharePct}%">
              <circle cx="58" cy="58" r="${r}" fill="none" stroke="#222832" stroke-width="8"></circle>
              <circle cx="58" cy="58" r="${r}" fill="none" stroke="#35b877" stroke-width="8"
                stroke-linecap="round" stroke-dasharray="${cCirc}" stroke-dashoffset="${offset}" transform="rotate(-90 58 58)"></circle>
              <text x="58" y="63" text-anchor="middle" fill="#ebeff4" font-family="var(--hc-font-mono)" font-size="16" font-weight="700">$${Math.round(mainBal + offshoreTotal + btcUsd).toLocaleString('pt-BR')}</text>
            </svg>
            <div class="soft-donut-title">Patrimônio Estimado</div>
            <div class="soft-donut-numbers"><span class="used">${openCount}/5</span> bancos ativos</div>
          </div>

          <div class="soft-bays-box">
            <div class="soft-bay-row"><span>Conta Principal</span><span style="color:var(--hc-accent-text);">$ ${mainBal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span></div>
            <div class="soft-bay-row"><span>Cofres Offshore</span><span>$ ${offshoreTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span></div>
            <div class="soft-bay-row"><span>Carteira BTC</span><span style="color:var(--hc-warning-text);">${String(btcFmt).slice(0, 8)}</span></div>
          </div>

          <div class="soft-tool-tiles">
            <button type="button" class="soft-tool-tile" onclick="navTo('winBitcoin')">
              ${ic('bitcoin')}
              <span>Carteira BTC</span>
            </button>
            <button type="button" class="soft-tool-tile" onclick="window.internetEngine.openIp('144.202.44.8')">
              ${ic('trending-up')}
              <span>Câmbio BTC</span>
            </button>
          </div>
        `;
      }
    }
  }

  window.multiBankEngine = new MultiBankAccountHackEngine();

  window.handleOpenSecondaryBank = function (bankIp) {
    const res = window.multiBankEngine.openSecondaryAccount(bankIp);
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };

  window.handleCrackBankAccount = function (bankIp) {
    const acc = document.getElementById('bankCrackAccInput')?.value;
    const res = window.multiBankEngine.crackBankAccount(bankIp, acc, false);
    if (!res.success) alert(res.message);
    return res;
  };

  window.handleLoginBankAccount = function (bankIp) {
    const acc = document.getElementById('bankLoginAccInput')?.value;
    const pin = document.getElementById('bankLoginPinInput')?.value;
    const res = window.multiBankEngine.loginBankAccount(bankIp, acc, pin);
    if (!res.success) alert(res.message);
    return res;
  };

  window.handleDrainBankAccount = function (bankIp, acc, pin) {
    const res = window.multiBankEngine.drainCrackedBankAccount(bankIp, acc, pin);
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };
})();
