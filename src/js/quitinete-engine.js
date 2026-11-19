/**
 * Hacker City // Quitinete & Despesas de Sobrevivência
 * Controla os pagamentos de sobrevivência do jogador (Aluguel, Luz e Água)
 * Baseado no design original da quitinete do submundo
 */

class QuitineteEngine {
  constructor() {
    this.bills = {
      rent: {
        id: 'rent',
        name: 'IMOBILIÁRIA CENTRAL',
        tagUnpaid: '6 MESES ATRASO',
        tagPaid: 'EM DIA',
        price: 800,
        desc: 'Aluguel da Quitinete acumulado. Notificação judicial de despejo despachada.',
        descPaid: 'Aluguel quitado. Notificação judicial de despejo revogada.',
        paid: false,
        repGain: 50
      },
      power: {
        id: 'power',
        name: 'COMPANHIA DE ENERGIA',
        tagUnpaid: 'CORTE ATIVO',
        tagPaid: 'RELIGADO',
        price: 350,
        desc: 'Energia elétrica desligada no poste. Sem luz para ligar novo equipamento.',
        descPaid: 'Religação efetuada no poste. Estabilidade elétrica normalizada.',
        paid: false,
        repGain: 25
      },
      water: {
        id: 'water',
        name: 'COMPANHIA DE ÁGUA',
        tagUnpaid: 'LACRADO',
        tagPaid: 'REGULARIZADO',
        price: 150,
        desc: 'Fornecimento de água cortado com hidrômetro lacrado. Multa por violação.',
        descPaid: 'Hidrômetro deslacrado e fornecimento restabelecido sem multas.',
        paid: false,
        repGain: 15
      }
    };

    this.load();
    this.applyEffects();
  }

  load() {
    try {
      const saved = localStorage.getItem('HC_QUITINETE_STATE');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(this.bills).forEach(k => {
          if (parsed[k]) {
            this.bills[k].paid = !!parsed[k].paid;
          }
        });
      }
    } catch (e) {
      console.warn('Erro ao carregar quitinete do storage:', e);
    }
  }

  save() {
    try {
      const toSave = {};
      Object.keys(this.bills).forEach(k => {
        toSave[k] = { paid: this.bills[k].paid };
      });
      localStorage.setItem('HC_QUITINETE_STATE', JSON.stringify(toSave));
    } catch (e) {
      console.warn('Erro ao salvar quitinete:', e);
    }
  }

  applyEffects() {
    if (typeof document === 'undefined' || !document.body) {
      if (typeof window !== 'undefined') {
        window.addEventListener('DOMContentLoaded', () => this.applyEffects());
      }
      return;
    }

    // Efeito de queda de luz caso a conta de energia não esteja paga
    if (this.hasPowerOutage()) {
      document.body.classList.add('power-outage-active');
    } else {
      document.body.classList.remove('power-outage-active');
    }
    this.updatePill();
  }

  hasPowerOutage() {
    return !this.bills.power.paid;
  }

  hasEvictionNotice() {
    return !this.bills.rent.paid;
  }

  getPendingCount() {
    return Object.values(this.bills).filter(b => !b.paid).length;
  }

  syncDynamicPowerBill() {
    if (typeof window !== 'undefined' && window.hardwareEngine && typeof window.hardwareEngine.getPrimaryPcElectricityMonthlyCost === 'function') {
      const fleet = window.hardwareEngine.getMachinesFleet();
      const pc = fleet.find((m) => m.isPrimaryPc);
      if (pc) {
        this.bills.power.price = pc.energyMonthlyCost;
        this.bills.power.desc = `Consumo atual do seu PC Principal: ${pc.watts} W ($${pc.energyMonthlyCost}/mês de energia elétrica). Sem luz para ligar novo equipamento.`;
        this.bills.power.descPaid = `Religação efetuada. Consumo atual do seu PC Principal: ${pc.watts} W ($${pc.energyMonthlyCost}/mês).`;
      }
    }
  }

  payBill(billKey, walletBalance) {
    this.syncDynamicPowerBill();
    const bill = this.bills[billKey];
    if (!bill) {
      return { success: false, message: 'Conta inválida ou não encontrada.' };
    }

    if (bill.paid) {
      return { success: false, message: `${bill.name} já foi quitada!` };
    }

    if (walletBalance < bill.price) {
      return { 
        success: false, 
        message: `Saldo insuficiente no Hacker Bank! Necessário: $ ${bill.price} HC (Saldo: $ ${walletBalance.toFixed(2)} HC)` 
      };
    }

    bill.paid = true;
    this.save();
    this.applyEffects();

    return {
      success: true,
      price: bill.price,
      repGain: bill.repGain,
      message: `[PAGO] ${bill.name} quitado com sucesso! (+${bill.repGain} REP)`
    };
  }

  updatePill() {
    const pill = document.getElementById('hudQuitinetePill');
    if (!pill) return;

    const pending = this.getPendingCount();
    if (pending > 0) {
      pill.className = 'hud-notif-btn has-alerts';
      pill.title = `Esconderijo: ${pending} ${pending === 1 ? 'conta pendente' : 'contas pendentes'} (clique para pagar)`;
      pill.innerHTML = `${HC.icon('bell')}<span class="hud-notif-count">${pending}</span>`;
    } else {
      pill.className = 'hud-notif-btn';
      pill.title = 'Esconderijo em dia — nenhuma conta atrasada';
      pill.innerHTML = `${HC.icon('bell')}`;
    }
  }

  renderUI(containerId, walletBalance) {
    this.syncDynamicPowerBill();
    const el = document.getElementById(containerId);
    if (!el) return;

    const pend = this.getPendingCount();
    let html = `
      <div class="hc-card" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
        <div>
          <strong style="font-size: 15px; color: var(--hc-text);">Despesas fixas do seu esconderijo</strong>
          <p style="font-size: 13px; color: var(--hc-text-2); margin: 4px 0 0 0; max-width: 65ch;">
            Mantenha aluguel, luz e internet em dia para continuar operando sem queda de energia ou despejo.
          </p>
        </div>
        <span class="hc-badge ${pend > 0 ? 'warning' : 'success'}">
          ${pend > 0 ? `${pend} pendente${pend === 1 ? '' : 's'}` : 'Tudo em dia'}
        </span>
      </div>

      <div class="quitinete-grid">
    `;

    Object.keys(this.bills).forEach(key => {
      const b = this.bills[key];
      const isPaid = b.paid;
      const canAfford = !isPaid && walletBalance >= b.price;

      html += `
        <div class="quitinete-card ${isPaid ? 'paid' : 'unpaid'}">
          <div>
            <div class="quitinete-header">
              <div class="quitinete-title">${b.name}</div>
              <div class="quitinete-badge ${isPaid ? 'success' : 'danger'}">
                ${isPaid ? b.tagPaid : b.tagUnpaid}
              </div>
            </div>

            <div class="quitinete-price">
              <span>$</span> ${b.price} <span>HC</span>
            </div>

            <div class="quitinete-desc">
              ${isPaid ? b.descPaid : b.desc}
            </div>
          </div>

          <div>
            ${isPaid ? 
              `<div class="btn-bill-paid">✓ CONTA QUITADA</div>` :
              `<button class="btn-bill-pay" ${!canAfford ? 'disabled' : ''} onclick="payQuitineteBill('${b.id}')">
                ${canAfford ? `PAGAR ${b.name.split(' ')[0]} ($${b.price})` : `SALDO INSUFICIENTE ($${b.price})`}
              </button>`
            }
          </div>
        </div>
      `;
    });

    html += `</div>`;

    // Painel de Status Geral da Moradia
    html += `
      <div style="background: #111418; border: 1px solid #262c35; border-radius: 6px; padding: 1rem; display: flex; justify-content: space-around; text-align: center;">
        <div>
          <span style="font-size: 0.72rem; color: #aab3c0; display: block; text-transform: uppercase;">Ameaça de Despejo</span>
          <strong style="font-family: var(--hc-font-sans); font-size: 0.95rem; color: ${this.bills.rent.paid ? 'var(--green-safe)' : '#d0443a'};">
            ${this.bills.rent.paid ? 'NENHUMA (PROTEGIDO)' : 'ALTA (ORDEM EXPEDIDA)'}
          </strong>
        </div>
        <div style="border-left: 1px solid #262c35; border-right: 1px solid #262c35; padding: 0 1.5rem;">
          <span style="font-size: 0.72rem; color: #aab3c0; display: block; text-transform: uppercase;">Rede Elétrica</span>
          <strong style="font-family: var(--hc-font-sans); font-size: 0.95rem; color: ${this.bills.power.paid ? 'var(--green-safe)' : '#f0a03a'};">
            ${this.bills.power.paid ? 'FORNECIMENTO NORMAL' : 'CORTE ATIVO NO POSTE'}
          </strong>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: #aab3c0; display: block; text-transform: uppercase;">Abastecimento Água</span>
          <strong style="font-family: var(--hc-font-sans); font-size: 0.95rem; color: ${this.bills.water.paid ? 'var(--green-safe)' : '#d0443a'};">
            ${this.bills.water.paid ? 'REGULARIZADO' : 'HIDRÔMETRO LACRADO'}
          </strong>
        </div>
      </div>
    `;

    el.innerHTML = html;
  }
}

window.quitineteEngine = new QuitineteEngine();
