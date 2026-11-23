/**
 * Hacker City // Motor de Tempo do Jogo & Faturamento Diário às 12:00 (Quitinete & Infraestrutura)
 *
 * Regras Oficiais de Tempo & Contas:
 * 1) Escala de Tempo:
 *    - 1 Hora da vida real = 1 Dia no jogo
 *    - 1 Dia da vida real (24h) = 1 Mês no jogo (24 dias do jogo)
 * 2) Vencimento Diário às 12:00:
 *    - Todo dia às 12:00 (meio-dia real) vira 1 Mês no jogo e chega a fatura mensal de Energia (PC), Internet/VPS, Aluguel e Água.
 * 3) Limite de Acúmulo de 3 Meses (3 Dias) + Pausa Automática:
 *    - Só pode acumular no máximo 3 meses (3 dias no jogo/vida real).
 *    - Ao atingir 3 meses acumulados, a conta é PAUSADA automaticamente (não acumula 4º, 5º, 10º mês enquanto a pessoa estiver fora).
 *    - O relógio do ciclo só recomeça a contar depois que a pessoa entrar no game novamente (e quitar a pendência para liberar novos meses).
 */

const GAME_TIME_CONFIG = {
  REAL_MS_PER_GAME_DAY: 60 * 60 * 1000,          // 1h real = 1 dia no jogo
  REAL_MS_PER_GAME_MONTH: 24 * 60 * 60 * 1000,   // 24h reais (1 dia) = 1 mês no jogo
  BILLING_NOON_HOUR: 12,                         // Todo dia às 12:00 chega a conta
  MAX_ACCUMULATED_MONTHS: 3                      // Teto máximo de 3 meses (dias) -> depois pausa!
};

class QuitineteEngine {
  constructor() {
    this.userId = null;
    this.config = GAME_TIME_CONFIG;
    this.cycle = {
      lastEvalMs: Date.now(),
      isPaused: false,
      pausedAtMs: null,
      wasPausedWhileAway: false,
      lastPlayerLoginMs: Date.now()
    };

    this.bills = {
      power: {
        id: 'power',
        icon: 'zap',
        glyph: 'attack',
        name: 'COMPANHIA DE ENERGIA (LUZ DO PC)',
        shortName: 'Energia Elétrica',
        tagUnpaid: 'FATURA ABERTA',
        tagPaid: 'EM DIA',
        monthlyBase: 307,
        monthsDue: 1,
        price: 307,
        desc: 'Calculada sobre o consumo em Watts do seu PC Principal.',
        descPaid: 'Fornecimento elétrico em dia para o seu PC Principal.',
        paid: false,
        repGain: 25
      },
      internet: {
        id: 'internet',
        icon: 'wifi',
        glyph: 'defense',
        name: 'PROVEDOR DE INTERNET & CLOUD VPS',
        shortName: 'Internet & VPS',
        tagUnpaid: 'FATURA ABERTA',
        tagPaid: 'EM DIA',
        monthlyBase: 35,
        monthsDue: 1,
        price: 35,
        desc: 'Assinatura mensal do seu plano de Internet + servidores VPS ativos.',
        descPaid: 'Link de Internet e servidores VPS quitados neste mês.',
        paid: false,
        repGain: 25
      },
      rent: {
        id: 'rent',
        icon: 'house',
        glyph: 'stealth',
        name: 'IMOBILIÁRIA CENTRAL (ALUGUEL)',
        shortName: 'Aluguel',
        tagUnpaid: 'FATURA ABERTA',
        tagPaid: 'EM DIA',
        monthlyBase: 800,
        monthsDue: 1,
        price: 800,
        desc: 'Aluguel mensal da Quitinete / Esconderijo de operações.',
        descPaid: 'Aluguel do mês quitado. Sem risco de despejo.',
        paid: false,
        repGain: 50
      },
      water: {
        id: 'water',
        icon: 'droplets',
        glyph: 'defense',
        name: 'COMPANHIA DE ÁGUA',
        shortName: 'Água',
        tagUnpaid: 'FATURA ABERTA',
        tagPaid: 'EM DIA',
        monthlyBase: 150,
        monthsDue: 1,
        price: 150,
        desc: 'Taxa mensal básica de abastecimento do esconderijo.',
        descPaid: 'Abastecimento regularizado neste mês.',
        paid: false,
        repGain: 15
      }
    };

    this.load();
    this.syncDynamicPowerBill();
    this.applyEffects();
    this.startLiveClockWatcher();
  }

  storageKey(uidOverride = null) {
    const uid = uidOverride || (typeof window !== 'undefined' && window.currentProfile && window.currentProfile.id) || null;
    return uid ? `HC_QUITINETE_STATE_${uid}` : 'HC_QUITINETE_STATE';
  }

  // Conta quantos meios-dias (12:00:00 horário local) ocorreram no intervalo (fromMs, toMs]
  countNoonCrossings(fromMs, toMs) {
    const start = Number(fromMs || 0);
    const end = Number(toMs || 0);
    if (!start || !end || end <= start) return 0;

    const f = new Date(start);
    const cand = new Date(f.getFullYear(), f.getMonth(), f.getDate(), GAME_TIME_CONFIG.BILLING_NOON_HOUR, 0, 0, 0);
    if (cand.getTime() <= start) {
      cand.setDate(cand.getDate() + 1);
    }

    let count = 0;
    while (cand.getTime() <= end && count < 400) {
      count += 1;
      cand.setDate(cand.getDate() + 1);
    }
    return count;
  }

  getNextNoonMs(nowMs = Date.now()) {
    const d = new Date(nowMs);
    const noonToday = new Date(d.getFullYear(), d.getMonth(), d.getDate(), GAME_TIME_CONFIG.BILLING_NOON_HOUR, 0, 0, 0);
    if (nowMs < noonToday.getTime()) return noonToday.getTime();
    noonToday.setDate(noonToday.getDate() + 1);
    return noonToday.getTime();
  }

  getLastNoonMs(nowMs = Date.now()) {
    const d = new Date(nowMs);
    const noonToday = new Date(d.getFullYear(), d.getMonth(), d.getDate(), GAME_TIME_CONFIG.BILLING_NOON_HOUR, 0, 0, 0);
    if (nowMs >= noonToday.getTime()) return noonToday.getTime();
    noonToday.setDate(noonToday.getDate() - 1);
    return noonToday.getTime();
  }

  formatTimeUntilNextNoon(nowMs = Date.now()) {
    const diffMs = Math.max(0, this.getNextNoonMs(nowMs) - nowMs);
    const totalMins = Math.ceil(diffMs / 60000);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}h ${String(m).padStart(2, '0')}m`;
  }

  // Retorna qual Dia do Mês (1..24) estamos no relógio do jogo (1 hora real desde o último 12:00 = 1 dia no jogo!)
  getCurrentGameClockInfo(nowMs = Date.now()) {
    const lastNoon = this.getLastNoonMs(nowMs);
    const elapsedMs = Math.max(0, nowMs - lastNoon);
    const gameDayInMonth = Math.min(24, Math.floor(elapsedMs / GAME_TIME_CONFIG.REAL_MS_PER_GAME_DAY) + 1);
    const remInHourMs = elapsedMs % GAME_TIME_CONFIG.REAL_MS_PER_GAME_DAY;
    const gameHourInDay = Math.min(23, Math.floor((remInHourMs / GAME_TIME_CONFIG.REAL_MS_PER_GAME_DAY) * 24));
    return {
      gameDayInMonth,
      gameHourStr: `${String(gameHourInDay).padStart(2, '0')}:00`,
      untilNextNoonStr: this.formatTimeUntilNextNoon(nowMs),
      nextNoonDateStr: new Date(this.getNextNoonMs(nowMs)).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  }

  getMaxAccumulatedMonths() {
    return Math.max(0, ...Object.values(this.bills).map((b) => Number(b.monthsDue || 0)));
  }

  load(uidOverride = null) {
    try {
      const key = this.storageKey(uidOverride);
      const raw = localStorage.getItem(key) || (!uidOverride ? localStorage.getItem('HC_QUITINETE_STATE') : null);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed._cycle) {
          this.cycle = { ...this.cycle, ...parsed._cycle };
        }
        Object.keys(this.bills).forEach((k) => {
          if (parsed[k]) {
            const b = this.bills[k];
            if (typeof parsed[k].monthsDue === 'number') {
              b.monthsDue = Math.max(0, Math.min(GAME_TIME_CONFIG.MAX_ACCUMULATED_MONTHS, Math.round(parsed[k].monthsDue)));
              b.paid = b.monthsDue === 0;
            } else {
              b.paid = !!parsed[k].paid;
              b.monthsDue = b.paid ? 0 : 1;
            }
          }
        });
      }
    } catch (e) {
      console.warn('Erro ao carregar estado de contas:', e);
    }
  }

  save() {
    try {
      const toSave = {
        _cycle: { ...this.cycle }
      };
      Object.keys(this.bills).forEach((k) => {
        toSave[k] = {
          paid: this.bills[k].monthsDue === 0,
          monthsDue: this.bills[k].monthsDue
        };
      });
      localStorage.setItem(this.storageKey(), JSON.stringify(toSave));
    } catch (e) {
      console.warn('Erro ao salvar estado de contas:', e);
    }
  }

  saveState() {
    this.save();
  }

  // Chamado automaticamente toda vez que a pessoa ENTRA no jogo!
  // Regra: se tinha batido 3 meses (dias) e pausado enquanto estava fora, descarta qualquer excesso > 3
  // e só recomeça a contar o relógio a partir de agora que ela entrou no game novamente!
  onPlayerEnteredGame(nowMs = Date.now()) {
    const uid = (typeof window !== 'undefined' && window.currentProfile && window.currentProfile.id) || 'guest';
    if (this.userId !== uid) {
      this.userId = uid;
      this.load(uid);
    }
    this.evaluateNoonBilling(nowMs, true);
    this.syncDynamicPowerBill();
    this.applyEffects();
    return this.getBillingStatusSummary(nowMs);
  }

  // Avalia viradas diárias das 12:00 respeitando o limite estrito de 3 meses (dias) e a pausa automática!
  evaluateNoonBilling(nowMs = Date.now(), isEnteringGame = false) {
    const prevEval = Number(this.cycle.lastEvalMs || nowMs);
    const crossings = this.countNoonCrossings(prevEval, nowMs);

    // Se a conta já estava PAUSADA no teto de 3 meses:
    if (this.cycle.isPaused) {
      // Enquanto o jogador NÃO entrou no jogo novamente, permanece 100% congelada.
      // Quando ele ENTRA no jogo novamente (isEnteringGame === true), reancora o relógio para agora!
      if (isEnteringGame) {
        if (crossings > 0) {
          this.cycle.wasPausedWhileAway = true;
        }
        this.cycle.lastPlayerLoginMs = nowMs;
        this.cycle.lastEvalMs = nowMs;
        this.save();
      }
      return { crossingsApplied: 0, paused: true };
    }

    let applied = 0;
    if (crossings > 0) {
      let hitCapNow = false;
      Object.values(this.bills).forEach((b) => {
        const nextMonths = Math.min(GAME_TIME_CONFIG.MAX_ACCUMULATED_MONTHS, (b.monthsDue || 0) + crossings);
        b.monthsDue = nextMonths;
        b.paid = nextMonths === 0;
        if (nextMonths >= GAME_TIME_CONFIG.MAX_ACCUMULATED_MONTHS) {
          hitCapNow = true;
        }
      });
      applied = Math.min(GAME_TIME_CONFIG.MAX_ACCUMULATED_MONTHS, crossings);

      if (hitCapNow) {
        this.cycle.isPaused = true;
        this.cycle.pausedAtMs = nowMs;
        if (crossings > GAME_TIME_CONFIG.MAX_ACCUMULATED_MONTHS || isEnteringGame) {
          this.cycle.wasPausedWhileAway = true;
        }
      }

      this.cycle.lastEvalMs = nowMs;
      if (isEnteringGame) {
        this.cycle.lastPlayerLoginMs = nowMs;
      }

      this.syncDynamicPowerBill();
      this.save();
      this.applyEffects();

      if (typeof window !== 'undefined' && window.ecosystemHub && typeof window.ecosystemHub.payNoonDividends === 'function') {
        window.ecosystemHub.payNoonDividends(applied);
      }
      if (typeof window !== 'undefined' && window.topTenMechanics) {
        if (typeof window.topTenMechanics.checkSafehouseEvictionOnThreeMonths === 'function') {
          window.topTenMechanics.checkSafehouseEvictionOnThreeMonths();
        }
        if (typeof window.topTenMechanics.applyNoonBankingAndSponsorshipSettlement === 'function') {
          window.topTenMechanics.applyNoonBankingAndSponsorshipSettlement(applied);
        }
      }

      if (!isEnteringGame && typeof window !== 'undefined') {
        if (typeof window.showToast === 'function') {
          window.showToast(
            hitCapNow
              ? '🕛 12:00 — Limite de 3 meses atingido! Suas contas foram PAUSADAS até regularização.'
              : '🕛 12:00 — Virada de Mês no Jogo! Novas faturas chegaram no Esconderijo.'
          );
        }
        if (window.mailEngine && typeof window.mailEngine.pushSystemMail === 'function') {
          window.mailEngine.pushSystemMail(
            'Central de Faturamento <cobranca@hackercity.hc>',
            hitCapNow
              ? '[PAUSA AUTOMÁTICA] Limite de 3 Meses Acumulados Atingido'
              : '[Fatura 12:00] Fechamento Mensal de Energia, Internet & Aluguel',
            hitCapNow
              ? 'Você atingiu o teto máximo de 3 meses (dias) acumulados. Suas faturas foram pausadas automaticamente para não acumular dívida infinita enquanto você estiver fora.'
              : 'O relógio bateu 12:00 (1 Mês no Jogo). Confira e quite suas contas de Energia do PC, Provedor de Internet e Esconderijo.',
            'system'
          );
        }
      }
    } else if (isEnteringGame) {
      this.cycle.lastPlayerLoginMs = nowMs;
      this.save();
    }

    return { crossingsApplied: applied, paused: this.cycle.isPaused };
  }

  startLiveClockWatcher() {
    if (typeof window === 'undefined') return;
    if (this._watcherId) clearInterval(this._watcherId);
    this._watcherId = setInterval(() => {
      this.evaluateNoonBilling(Date.now(), false);
      if (window.winManager && window.winManager.current === 'winQuitinete' && window.currentWallet) {
        this.renderUI('quitineteAppBody', window.currentWallet.balance);
      }
    }, 20000);
  }

  syncDynamicPowerBill() {
    let pcWatts = 105;
    let pcEnergyMonthly = 307;
    let netProviderLabel = 'NET1 · HC Rádio Comunitária';
    let netAndVpsMonthly = 35;

    if (typeof window !== 'undefined' && window.hardwareEngine && typeof window.hardwareEngine.getMachinesFleet === 'function') {
      const fleet = window.hardwareEngine.getMachinesFleet();
      const pc = fleet.find((m) => m.isPrimaryPc);
      const vpsList = fleet.filter((m) => !m.isPrimaryPc);
      if (pc) {
        pcWatts = pc.watts;
        pcEnergyMonthly = pc.energyMonthlyCost;
        netProviderLabel = `${pc.netPlanCode} · ${pc.netProvider}`;
        const vpsMonthlySum = vpsList.reduce((acc, v) => acc + (v.monthlyCost || 0), 0);
        netAndVpsMonthly = (pc.netMonthlyFee || 35) + vpsMonthlySum;
      }
    }

    const energyDiscPct = (typeof window !== 'undefined' && window.ecosystemHub && window.ecosystemHub.state)
      ? Number(window.ecosystemHub.state.energyDiscountPct || 0)
      : 0;
    const wmDiscPct = (typeof window !== 'undefined' && window.ecosystemHub && typeof window.ecosystemHub.getWorldMapActiveMultipliers === 'function')
      ? Number(window.ecosystemHub.getWorldMapActiveMultipliers().billDiscountPct || 0)
      : 0;
    const subBlackHatDisc = (typeof window !== 'undefined' && window.skillTreeEngine && window.skillTreeEngine.selectedSubclass === 'sub_blackhat_finance')
      ? 25
      : 0;
    const totalBillKeep = Math.max(0.55, 1 - (energyDiscPct + wmDiscPct + subBlackHatDisc) / 100);

    const companyPermitMonthly = (typeof window !== 'undefined' && window.nineSystemsEngine && typeof window.nineSystemsEngine.getMyCompanyNoonPermitFee === 'function')
      ? Number(window.nineSystemsEngine.getMyCompanyNoonPermitFee() || 0)
      : 0;

    const cnpjNetMult = (typeof window !== 'undefined' && window.nineSystemsEngine && typeof window.nineSystemsEngine.getCompanyCnpjPerks === 'function')
      ? Number(window.nineSystemsEngine.getCompanyCnpjPerks().netBillDiscountMult || 1.0)
      : 1.0;

    this.bills.power.monthlyBase = Math.max(40, Math.round(pcEnergyMonthly * totalBillKeep));
    this.bills.internet.monthlyBase = Math.max(20, Math.round((netAndVpsMonthly + companyPermitMonthly) * Math.max(0.65, 1 - (wmDiscPct + subBlackHatDisc) / 100) * cnpjNetMult));
    if (typeof window !== 'undefined' && window.topTenMechanics && typeof window.topTenMechanics.getSafehouseNoonRent === 'function') {
      this.bills.rent.monthlyBase = window.topTenMechanics.getSafehouseNoonRent();
    }

    Object.values(this.bills).forEach((b) => {
      b.monthsDue = Math.max(0, Math.min(GAME_TIME_CONFIG.MAX_ACCUMULATED_MONTHS, Number(b.monthsDue || 0)));
      b.paid = b.monthsDue === 0;
      const mult = Math.max(1, b.monthsDue);
      b.price = Math.round(b.monthlyBase * mult);
      b.tagUnpaid = b.monthsDue >= 3
        ? '3/3 MESES · PAUSADO'
        : `${b.monthsDue} MÊS${b.monthsDue > 1 ? 'ES' : ''} ABERTO${b.monthsDue > 1 ? 'S' : ''}`;
    });

    const pwr = this.bills.power;
    pwr.desc = `Baseado no seu PC Principal (${pcWatts} W = $${pcEnergyMonthly}/mês · ~$${Math.max(1, Math.round(pcEnergyMonthly / 24))}/dia no jogo).`;
    pwr.descPaid = `Energia em dia (${pcWatts} W · próxima leitura às 12:00: $${pcEnergyMonthly}/mês).`;

    const net = this.bills.internet;
    net.desc = `Plano ${netProviderLabel} + VPS ativas ($${netAndVpsMonthly}/mês · ~$${Math.max(1, Math.round(netAndVpsMonthly / 24))}/dia no jogo).`;
    net.descPaid = `Assinatura ${netProviderLabel} e VPS em dia neste mês.`;

    const rent = this.bills.rent;
    rent.desc = `Aluguel mensal do esconderijo ($${rent.monthlyBase}/mês · ~$${Math.round(rent.monthlyBase / 24)}/dia no jogo).`;

    const water = this.bills.water;
    water.desc = `Abastecimento mensal ($${water.monthlyBase}/mês · ~$${Math.max(1, Math.round(water.monthlyBase / 24))}/dia no jogo).`;
  }

  applyEffects() {
    if (typeof document === 'undefined' || !document.body) {
      if (typeof window !== 'undefined') {
        window.addEventListener('DOMContentLoaded', () => this.applyEffects());
      }
      return;
    }

    // Queda severa de luz ocorre apenas se acumular o limite máximo de 3 meses de energia sem pagar
    if (this.hasPowerOutage()) {
      document.body.classList.add('power-outage-active');
    } else {
      document.body.classList.remove('power-outage-active');
    }
    this.updatePill();
  }

  hasPowerOutage() {
    return (this.bills.power.monthsDue || 0) >= GAME_TIME_CONFIG.MAX_ACCUMULATED_MONTHS;
  }

  hasEvictionNotice() {
    return (this.bills.rent.monthsDue || 0) >= GAME_TIME_CONFIG.MAX_ACCUMULATED_MONTHS;
  }

  getPendingCount() {
    return Object.values(this.bills).filter((b) => (b.monthsDue || 0) > 0).length;
  }

  getTotalDueAmount() {
    this.syncDynamicPowerBill();
    return Object.values(this.bills).reduce((acc, b) => acc + (b.monthsDue > 0 ? b.price : 0), 0);
  }

  getTotalMonthlyRate() {
    this.syncDynamicPowerBill();
    return Object.values(this.bills).reduce((acc, b) => acc + (b.monthlyBase || 0), 0);
  }

  getBillingStatusSummary(nowMs = Date.now()) {
    this.syncDynamicPowerBill();
    const clock = this.getCurrentGameClockInfo(nowMs);
    const maxMonths = this.getMaxAccumulatedMonths();
    return {
      maxMonths,
      maxCap: GAME_TIME_CONFIG.MAX_ACCUMULATED_MONTHS,
      isPaused: !!this.cycle.isPaused,
      wasPausedWhileAway: !!this.cycle.wasPausedWhileAway,
      pendingBillsCount: this.getPendingCount(),
      totalDue: this.getTotalDueAmount(),
      monthlyRate: this.getTotalMonthlyRate(),
      hourlyDayRate: Math.max(1, Math.round(this.getTotalMonthlyRate() / 24)),
      ...clock
    };
  }

  refreshPauseStateAfterPayment(nowMs = Date.now()) {
    const maxMonths = this.getMaxAccumulatedMonths();
    if (maxMonths < GAME_TIME_CONFIG.MAX_ACCUMULATED_MONTHS && this.cycle.isPaused) {
      this.cycle.isPaused = false;
      this.cycle.pausedAtMs = null;
      this.cycle.wasPausedWhileAway = false;
      this.cycle.lastEvalMs = nowMs;
    }
  }

  payBill(billKey, walletBalance) {
    this.syncDynamicPowerBill();
    const bill = this.bills[billKey];
    if (!bill) {
      return { success: false, message: 'Conta inválida ou não encontrada.' };
    }

    if (bill.monthsDue === 0) {
      return { success: false, message: `${bill.shortName} já está em dia neste mês!` };
    }

    const amountToPay = bill.price;
    const monthsPaid = bill.monthsDue;
    if (walletBalance < amountToPay) {
      return {
        success: false,
        message: `Saldo insuficiente! Necessário: $${amountToPay.toLocaleString('pt-BR')} (${monthsPaid} mês${monthsPaid > 1 ? 'es' : ''}).`
      };
    }

    bill.monthsDue = 0;
    bill.paid = true;
    this.refreshPauseStateAfterPayment(Date.now());
    this.syncDynamicPowerBill();
    this.save();
    this.applyEffects();

    return {
      success: true,
      price: amountToPay,
      monthsPaid,
      repGain: bill.repGain,
      message: `✓ ${bill.shortName} quitada (${monthsPaid} mês${monthsPaid > 1 ? 'es' : ''}: -$${amountToPay.toLocaleString('pt-BR')})! +${bill.repGain} REP`
    };
  }

  payAllBills(walletBalance) {
    this.syncDynamicPowerBill();
    const pendingList = Object.values(this.bills).filter((b) => b.monthsDue > 0);
    if (pendingList.length === 0) {
      return { success: false, message: 'Todas as suas contas já estão 100% em dia!' };
    }
    const total = pendingList.reduce((s, b) => s + b.price, 0);
    if (walletBalance < total) {
      return {
        success: false,
        message: `Saldo insuficiente para quitar tudo! Total necessário: $${total.toLocaleString('pt-BR')}.`
      };
    }

    let repTotal = 0;
    pendingList.forEach((b) => {
      repTotal += b.repGain || 15;
      b.monthsDue = 0;
      b.paid = true;
    });

    this.refreshPauseStateAfterPayment(Date.now());
    this.syncDynamicPowerBill();
    this.save();
    this.applyEffects();

    return {
      success: true,
      price: total,
      repGain: repTotal,
      message: `✓ Todas as contas quitadas (-$${total.toLocaleString('pt-BR')})! Ciclo das 12:00 ativo e regularizado (+${repTotal} REP).`
    };
  }

  updatePill() {
    const pill = document.getElementById('hudQuitinetePill');
    if (!pill) return;

    const pending = this.getPendingCount();
    const icBell = (typeof window !== 'undefined' && window.HC && window.HC.icon) ? window.HC.icon('bell') : '';
    if (pending > 0) {
      pill.className = 'hud-notif-btn has-alerts';
      pill.title = this.cycle.isPaused
        ? `Contas PAUSADAS no limite de 3 meses (${pending} pendentes)`
        : `Esconderijo: ${pending} conta(s) aberta(s) · Fechamento todo dia às 12:00`;
      pill.innerHTML = `${icBell}<span class="hud-notif-count">${pending}</span>`;
    } else {
      pill.className = 'hud-notif-btn';
      pill.title = 'Contas em dia — próxima fatura chega às 12:00';
      pill.innerHTML = `${icBell}`;
    }
  }

  renderUI(containerId, walletBalance) {
    this.evaluateNoonBilling(Date.now(), false);
    this.syncDynamicPowerBill();
    const el = document.getElementById(containerId);
    if (!el) return;

    const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const ic = (n) => (typeof window !== 'undefined' && window.HC && window.HC.icon ? window.HC.icon(n) : '');

    const summary = this.getBillingStatusSummary(Date.now());
    const canPayAll = summary.totalDue > 0 && walletBalance >= summary.totalDue;

    const capPct = Math.round((summary.maxMonths / summary.maxCap) * 100);
    const r = 46;
    const cCirc = +(2 * Math.PI * r).toFixed(2);
    const offset = +(cCirc - (capPct / 100) * cCirc).toFixed(2);
    const strokeColor = summary.maxMonths === 0 ? '#35b877' : (summary.maxMonths < 3 ? '#f0a03a' : '#e5534b');

    const rowsHtml = Object.values(this.bills).map((b) => {
      const isPaid = b.monthsDue === 0;
      const canAfford = !isPaid && walletBalance >= b.price;
      const perDayGame = Math.max(1, Math.round(b.monthlyBase / 24));

      return `
        <tr class="${isPaid ? 'row-running' : ''}">
          <td class="soft-col-icon">
            <span class="soft-mini-glyph kind-${b.glyph}"
              data-tip-title="${esc(b.shortName)}"
              data-tip-meta="$${b.monthlyBase.toLocaleString('pt-BR')}/mês"
              data-tip-desc="${esc(isPaid ? b.descPaid : b.desc)}">
              ${ic(b.icon)}
            </span>
          </td>
          <td>
            <span class="soft-name-trigger" tabindex="0"
              data-tip-title="${esc(b.name)}"
              data-tip-meta="Fecha às 12:00"
              data-tip-desc="${esc(isPaid ? b.descPaid : b.desc)}">
              ${isPaid ? '<span class="soft-run-dot"></span>' : ''}
              <strong>${esc(b.shortName)}</strong>
              <span class="hc-badge ${isPaid ? 'success' : (b.monthsDue >= 3 ? 'danger' : 'warn')}">${isPaid ? 'Em Dia' : esc(b.tagUnpaid)}</span>
            </span>
            <div style="font-size:11.5px;color:var(--hc-text-3);margin-top:2px;">${esc(isPaid ? b.descPaid : b.desc)}</div>
          </td>
          <td class="soft-col-size" style="width:125px;color:var(--hc-text-2);">
            $${b.monthlyBase.toLocaleString('pt-BR')}/mês
            <div style="font-size:10.5px;color:var(--hc-text-3);">~$${perDayGame}/dia (1h)</div>
          </td>
          <td class="soft-col-size" style="width:125px;font-weight:700;color:${isPaid ? 'var(--hc-accent-text)' : '#ff8e88'};">
            ${isPaid ? '$0 (Quitado)' : `$${b.price.toLocaleString('pt-BR')}`}
          </td>
          <td class="soft-col-acts">
            ${isPaid
              ? `<span class="hc-badge success">✓ Quitado</span>`
              : `<div class="soft-icon-actions">
                   <button type="button" class="soft-icon-act ic-info" aria-label="Detalhes de ${esc(b.shortName)}"
                     data-tip-title="${esc(b.shortName)} (${b.monthsDue}/${summary.maxCap} meses)"
                     data-tip-meta="Total $${b.price.toLocaleString('pt-BR')}"
                     data-tip-desc="Valor de 1 mês (1 dia real): $${b.monthlyBase.toLocaleString('pt-BR')} · Acumulado atual: ${b.monthsDue} mês(es).">
                     ${ic('info')}
                   </button>
                   <button type="button" id="btnPayBill_${esc(b.id)}" class="soft-icon-act ic-run" ${!canAfford ? 'disabled' : ''}
                     aria-label="Pagar ${esc(b.shortName)}"
                     data-tip-title="${canAfford ? `Pagar ${esc(b.shortName)} ($${b.price.toLocaleString('pt-BR')})` : `Saldo insuficiente ($${b.price.toLocaleString('pt-BR')})`}"
                     data-tip-meta="+${b.repGain} REP"
                     data-tip-desc="Quita imediatamente os ${b.monthsDue} mês(es) acumulados desta conta."
                     onclick="payQuitineteBill('${esc(b.id)}')">
                     ${ic('shopping-cart')}
                   </button>
                 </div>`}
          </td>
        </tr>
      `;
    }).join('');

    el.innerHTML = `
      <div class="soft-frame" id="quitineteExplorerMain">
        <div class="soft-tabs-bar">
          <div class="soft-tabs-left">
            <button type="button" class="soft-tab-btn active">
              ${ic('clock')} <span>Contas &amp; Relógio do Jogo (1h = 1 Dia · 1 Dia = 1 Mês)</span>
            </button>
          </div>
          <span class="mono" style="font-size:12px;color:var(--hc-accent-text);">
            Dia ${summary.gameDayInMonth}/24 do Mês · Próxima Fatura (12:00): em ${summary.untilNextNoonStr}
          </span>
        </div>

        <div class="soft-explorer-shell">
          <div class="soft-main-col">
            <!-- Faixa de Tempo & Regra das 12h + Pausa em 3 Meses -->
            <div class="hw-total-strip" style="grid-template-columns:repeat(4, minmax(0, 1fr));">
              <div class="hw-total-tile" tabindex="0"
                data-tip-title="Escala de Tempo do Jogo" data-tip-meta="24x Tempo Real"
                data-tip-desc="1 Hora da vida real equivale a 1 Dia no jogo; 1 Dia da vida real (24h) equivale a 1 Mês inteiro no jogo.">
                <div class="hw-tile-ico">${ic('clock')}</div>
                <div class="hw-tile-meta">
                  <span class="hw-tile-val">Dia ${summary.gameDayInMonth}/24</span>
                  <span class="hw-tile-unit">1h = 1 dia · 24h = 1 mês</span>
                </div>
              </div>

              <div class="hw-total-tile" tabindex="0"
                data-tip-title="Fechamento Diário às 12:00" data-tip-meta="Meio-dia"
                data-tip-desc="Todo dia às 12:00 (meio-dia) vira o mês no jogo e chega a fatura mensal de Luz, Internet/VPS, Aluguel e Água.">
                <div class="hw-tile-ico is-net">${ic('bell')}</div>
                <div class="hw-tile-meta">
                  <span class="hw-tile-val" id="quitNextNoonCountdown">${summary.untilNextNoonStr}</span>
                  <span class="hw-tile-unit">Próxima conta às 12:00</span>
                </div>
              </div>

              <div class="hw-total-tile" tabindex="0"
                data-tip-title="Limite de 3 Meses (Dias)" data-tip-meta="${summary.isPaused ? 'PAUSADO' : 'Ativo'}"
                data-tip-desc="Só pode acumular até 3 meses (3 dias). Ao bater 3 meses, a conta PAUSA automaticamente e só volta a contar depois que você entrar no jogo novamente.">
                <div class="hw-tile-ico is-power">${ic('shield')}</div>
                <div class="hw-tile-meta">
                  <span class="hw-tile-val" id="quitAccumulatedMonthsVal">${summary.maxMonths} / ${summary.maxCap} Meses</span>
                  <span class="hw-tile-unit">${summary.isPaused ? '⏸ Conta Pausada' : 'Limite máx: 3 meses'}</span>
                </div>
              </div>

              <div class="hw-total-tile" tabindex="0"
                data-tip-title="Total Pendente Agora" data-tip-meta="$${summary.monthlyRate.toLocaleString('pt-BR')}/mês base"
                data-tip-desc="Custo base mensal somado: $${summary.monthlyRate.toLocaleString('pt-BR')}/mês (~$${summary.hourlyDayRate}/dia no jogo).">
                <div class="hw-tile-ico is-cost">${ic('dollar-sign')}</div>
                <div class="hw-tile-meta">
                  <span class="hw-tile-val" id="quitTotalDueVal">$${summary.totalDue.toLocaleString('pt-BR')}</span>
                  <span class="hw-tile-unit">Base: $${summary.monthlyRate.toLocaleString('pt-BR')}/mês</span>
                </div>
              </div>
            </div>

            ${summary.isPaused ? `
              <div id="quitPausedCapBanner" class="soft-feedback-banner" style="background:rgba(240,160,58,0.14);border-color:rgba(240,160,58,0.45);color:#ffd28a;">
                <span>⏸ <strong>Contas Pausadas no Limite de 3 Meses:</strong> nenhum valor novo acumulou enquanto você esteve fora! Sem Dinheiro Limpo para pagar? Faça um <strong>Serviço Rápido da Prefeitura</strong> abaixo para ganhar $ 180 Limpos e religar tudo:</span>
                ${window.progressionLocksEngine ? `<button type="button" id="btnMunicipalEmergencyJob" class="hc-btn primary sm" onclick="window.progressionLocksEngine.executeMunicipalEmergencyJob()">🛠️ Serviço da Prefeitura (+$ 180 Limpos)</button>` : ''}
              </div>
            ` : (summary.maxMonths >= 2 && window.progressionLocksEngine ? `
              <div class="soft-feedback-banner" style="background:rgba(229,83,75,0.12);border-color:rgba(229,83,75,0.45);color:#fca5a5;">
                <span>⚠️ <strong>Contas Atrasadas (${summary.maxMonths}/3 meses):</strong> compras de empresas bloqueadas, Internet -50% mais lenta e PC -35% mais fraco! Pague as contas ou faça um Serviço da Prefeitura:</span>
                <button type="button" id="btnMunicipalEmergencyJob" class="hc-btn ghost sm" onclick="window.progressionLocksEngine.executeMunicipalEmergencyJob()">🛠️ Serviço Rápido (+$ 180 Limpos)</button>
              </div>
            ` : '')}

            <div class="soft-table-wrap" role="region" aria-label="Faturas mensais que chegam às 12:00">
              <table class="soft-table clean-hw-table">
                <thead>
                  <tr>
                    <th class="soft-col-icon"></th>
                    <th>Serviço &amp; Regra de Consumo</th>
                    <th class="soft-col-size" style="width:125px;">Custo Base</th>
                    <th class="soft-col-size" style="width:125px;">Acumulado</th>
                    <th class="soft-col-acts">Ação</th>
                  </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
              </table>
            </div>
            ${typeof window !== 'undefined' && window.topTenMechanics && typeof window.topTenMechanics.renderSafehouseUpgradeSectionHtml === 'function'
              ? window.topTenMechanics.renderSafehouseUpgradeSectionHtml()
              : ''}
          </div>

          <aside class="soft-side-bar">
            <div class="soft-donut-wrap">
              <svg class="soft-donut-svg" viewBox="0 0 116 116" aria-label="Acúmulo ${summary.maxMonths} de ${summary.maxCap} meses">
                <circle cx="58" cy="58" r="${r}" fill="none" stroke="#222832" stroke-width="8"></circle>
                <circle cx="58" cy="58" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="8"
                  stroke-linecap="round" stroke-dasharray="${cCirc}" stroke-dashoffset="${offset}" transform="rotate(-90 58 58)"></circle>
                <text x="58" y="63" text-anchor="middle" fill="#ebeff4" font-family="var(--hc-font-mono)" font-size="17" font-weight="700">${summary.maxMonths}/${summary.maxCap}</text>
              </svg>
              <div class="soft-donut-title">${summary.isPaused ? 'Cobrança Pausada' : (summary.maxMonths === 0 ? 'Tudo em Dia' : 'Meses Acumulados')}</div>
              <div class="soft-donut-numbers">
                <span class="${summary.maxMonths >= 3 ? 'total' : 'used'}">${summary.isPaused ? 'Teto de 3 dias atingido' : 'Fecha todo dia às 12h'}</span>
              </div>
            </div>

            <div class="soft-bays-box">
              <div class="soft-bay-row"><span>1 Dia no Jogo</span><span>1 Hora Real</span></div>
              <div class="soft-bay-row"><span>1 Mês no Jogo</span><span>1 Dia Real (24h)</span></div>
              <div class="soft-bay-row"><span>Chegada</span><span style="color:var(--hc-accent-text);">Todo dia 12:00</span></div>
              <div class="soft-bay-row"><span>Acúmulo Máx.</span><span style="color:#f5ba66;">3 Meses (Pausa)</span></div>
            </div>

            <div class="soft-tool-tiles">
              <button type="button" id="btnPayAllBills" class="soft-tool-tile span-2" ${!canPayAll ? 'disabled style="opacity:0.45;cursor:not-allowed;"' : ''}
                onclick="window.payAllQuitineteBills()">
                ${ic('circle-check')}
                <span>${summary.totalDue === 0 ? 'Contas Quitadas' : `Quitar Tudo ($${summary.totalDue.toLocaleString('pt-BR')})`}</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    `;
  }
}

window.GAME_TIME_CONFIG = GAME_TIME_CONFIG;
window.quitineteEngine = new QuitineteEngine();
