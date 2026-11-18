/**
 * Hacker City // Bloco 2 MMO:
 * 1. BitcoinEngine  — Carteira BTC (satoshis inteiros), Chave Privada, Cotação Simulada & Câmbio BTC <-> $ HC
 * 2. SoftwareEngine — Inventário de Programas & 5 Famílias de Vírus com Versões/Potências (v1.0 a v10.0),
 *                     Pesquisa de Upgrade, Limite de RAM/HDD, Antivírus Local, Upload Remoto e Coletor (.vcol)
 */
(function () {
  const SATS_PER_BTC = 100000000; // 1 BTC = 100.000.000 satoshis

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtUsd(n) {
    return '$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' HC';
  }

  function fmtSatsToBtc(sats) {
    const val = Math.max(0, Math.round(Number(sats || 0))) / SATS_PER_BTC;
    return val.toFixed(8);
  }

  function randomBase58(len) {
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let out = '';
    for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return out;
  }

  function randomHex(len) {
    const alphabet = '0123456789abcdef';
    let out = '';
    for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return out;
  }

  function hashHostSeed(ip) {
    let h = 2166136261 >>> 0;
    const s = 'BTC_VAULT::' + ip;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  // =========================================================================
  // 1. BITCOIN ENGINE (CARTEIRA, CHAVE PRIVADA, COTAÇÃO RANDOM-WALK & CÂMBIO)
  // =========================================================================
  class BitcoinEngine {
    constructor() {
      this.userId = null;
      this.state = null;
      this.priceUsd = 64250;
      this.open24hPrice = 63100;
      this.priceHistory = [63100, 63420, 63280, 63650, 63910, 63800, 64050, 64250];
      this.showPrivateKey = false;
      this.drainedRemoteWallets = new Set();
      this.startPriceTicker();
    }

    storageKey(uid) {
      return `HC_BTC_WALLET_${uid || 'guest'}`;
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

      if (saved && saved.address) {
        this.state = saved;
      } else {
        this.state = {
          address: '1HC' + randomBase58(31), // 34 chars padrão Bitcoin
          privateKey: randomHex(64),
          balanceSats: 500000, // 0.00500000 BTC bônus inicial de carteira
          ledger: [
            {
              at: new Date().toLocaleTimeString(),
              kind: 'GENESIS',
              deltaSats: 500000,
              desc: 'Abertura da carteira fria (Bônus inicial 0.00500000 BTC)'
            }
          ]
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

    startPriceTicker() {
      setInterval(() => {
        // Random walk controlado (±0.45%), nunca API externa real (Regra #9 do Roadmap)
        const drift = (Math.random() - 0.492) * 0.009;
        this.priceUsd = Math.round(Math.max(44000, Math.min(92000, this.priceUsd * (1 + drift))));
        this.priceHistory = [...this.priceHistory.slice(-11), this.priceUsd];
        if (window.winManager && window.winManager.current === 'winBitcoin') {
          this.renderUI();
        }
      }, 4500);
    }

    getBalanceSats() {
      this.ensureLoaded();
      return Math.max(0, Math.round(this.state.balanceSats || 0));
    }

    getFormattedBtc() {
      return fmtSatsToBtc(this.getBalanceSats());
    }

    getEstimatedUsdValue() {
      return (this.getBalanceSats() / SATS_PER_BTC) * this.priceUsd;
    }

    getAddress() {
      this.ensureLoaded();
      return this.state.address;
    }

    addLedger(kind, deltaSats, desc) {
      this.ensureLoaded();
      this.state.ledger.unshift({
        at: new Date().toLocaleTimeString(),
        kind,
        deltaSats,
        desc
      });
      if (this.state.ledger.length > 30) this.state.ledger.length = 30;
    }

    creditSats(sats, kind, desc) {
      this.ensureLoaded();
      const clean = Math.max(0, Math.round(Number(sats || 0)));
      if (clean <= 0) return 0;
      this.state.balanceSats = this.getBalanceSats() + clean;
      this.addLedger(kind, clean, desc);
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      return clean;
    }

    async buyBtcWithCash(usdAmountRaw) {
      this.ensureLoaded();
      const usd = Number(usdAmountRaw);
      if (!Number.isFinite(usd) || usd < 10) {
        return { success: false, message: 'Valor mínimo de compra na corretora é $ 10.00 HC.' };
      }
      if (!window.currentWallet || parseFloat(window.currentWallet.balance) < usd) {
        return { success: false, message: 'Saldo em dólar ($ HC) insuficiente no banco!' };
      }

      const satsBought = Math.floor((usd / this.priceUsd) * SATS_PER_BTC);
      if (satsBought <= 0) {
        return { success: false, message: 'Quantia muito baixa para gerar satoshis.' };
      }

      // Sincronizar débito no PostgreSQL quando logado
      if (window.supabase && typeof window.supabase.rpc === 'function') {
        try {
          const { data } = await window.supabase.rpc('buy_black_market_item', {
            p_item_type: 'btc_exchange_buy',
            p_cost: usd
          });
          if (data && data.new_balance !== undefined) {
            window.currentWallet.balance = Number(data.new_balance);
          } else {
            window.currentWallet.balance = Math.max(0, parseFloat(window.currentWallet.balance) - usd);
          }
        } catch (e) {
          window.currentWallet.balance = Math.max(0, parseFloat(window.currentWallet.balance) - usd);
        }
      } else {
        window.currentWallet.balance = Math.max(0, parseFloat(window.currentWallet.balance) - usd);
      }

      this.state.balanceSats = this.getBalanceSats() + satsBought;
      this.addLedger('COMPRA', satsBought, `Compra de ${fmtSatsToBtc(satsBought)} BTC por ${fmtUsd(usd)} (@ $${this.priceUsd.toLocaleString('pt-BR')})`);
      this.save();

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('BTC-EXCHANGE', `Compra executada: +${fmtSatsToBtc(satsBought)} BTC (-${fmtUsd(usd)})`, 'info');
      }
      if (window.hackerAudio) window.hackerAudio.playCashChime();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
      return { success: true, satsBought, message: `Comprado +${fmtSatsToBtc(satsBought)} BTC com sucesso!` };
    }

    sellBtcForCash(btcAmountRaw) {
      this.ensureLoaded();
      const btc = Number(String(btcAmountRaw || '').replace(',', '.'));
      if (!Number.isFinite(btc) || btc <= 0) {
        return { success: false, message: 'Informe uma quantidade válida de BTC para vender.' };
      }
      const satsToSell = Math.round(btc * SATS_PER_BTC);
      if (satsToSell <= 0 || satsToSell > this.getBalanceSats()) {
        return { success: false, message: `Saldo BTC insuficiente! Você possui ${this.getFormattedBtc()} BTC.` };
      }

      const usdReceived = +((satsToSell / SATS_PER_BTC) * this.priceUsd).toFixed(2);
      this.state.balanceSats = this.getBalanceSats() - satsToSell;
      if (window.currentWallet) {
        window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) + usdReceived).toFixed(2);
      }

      this.addLedger('VENDA', -satsToSell, `Venda de ${fmtSatsToBtc(satsToSell)} BTC por +${fmtUsd(usdReceived)} (@ $${this.priceUsd.toLocaleString('pt-BR')})`);
      this.save();

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('BTC-EXCHANGE', `Liquidação BTC: -${fmtSatsToBtc(satsToSell)} BTC -> +${fmtUsd(usdReceived)}`, 'success');
      }
      if (window.hackerAudio) window.hackerAudio.playMoneyCollect();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
      return { success: true, usdReceived, message: `Vendido ${fmtSatsToBtc(satsToSell)} BTC por ${fmtUsd(usdReceived)}!` };
    }

    transferBtc(targetAddrRaw, btcAmountRaw) {
      this.ensureLoaded();
      const addr = String(targetAddrRaw || '').trim();
      if (!/^1[A-Za-z0-9]{25,35}$/.test(addr)) {
        return { success: false, message: 'Endereço Bitcoin inválido! Deve iniciar com "1" e ter ~34 caracteres.' };
      }
      if (addr === this.state.address) {
        return { success: false, message: 'Você não pode transferir BTC para a sua própria carteira.' };
      }
      const btc = Number(String(btcAmountRaw || '').replace(',', '.'));
      const sats = Math.round(btc * SATS_PER_BTC);
      if (!Number.isFinite(btc) || sats <= 0 || sats > this.getBalanceSats()) {
        return { success: false, message: 'Quantidade inválida ou saldo BTC insuficiente.' };
      }

      this.state.balanceSats = this.getBalanceSats() - sats;
      this.addLedger('ENVIO P2P', -sats, `Transferido para ${addr.slice(0, 12)}...`);
      this.save();

      if (window.currentProfile) {
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 20;
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('BTC-P2P', `Transferência on-chain enviada para ${addr}: -${fmtSatsToBtc(sats)} BTC`, 'info');
      }
      if (window.hackerAudio) window.hackerAudio.playKeyClick();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
      return { success: true, message: `Enviado ${fmtSatsToBtc(sats)} BTC para ${addr}!` };
    }

    // Saldo determinístico de wallet.dat em máquinas remotas Tier II/III ou empresas/darknet
    getRemoteHostWalletSats(host) {
      if (!host || host.kind === 'self' || this.drainedRemoteWallets.has(host.ip)) return 0;
      const seed = hashHostSeed(host.ip);
      if (host.kind === 'darknet' || host.kind === 'banco') {
        return 1250000 + (seed % 900000); // ~0.0125 a 0.0215 BTC
      }
      if (host.kind === 'empresa' || host.kind === 'underground') {
        return 350000 + (seed % 450000); // ~0.0035 a 0.0080 BTC
      }
      if (host.kind === 'bot' && host.tier >= 2) {
        return (host.tier === 3 ? 900000 : 280000) + (seed % 400000);
      }
      if (host.kind === 'player' && !host.newbieProtected) {
        return 420000 + (seed % 300000);
      }
      return 0;
    }

    drainRemoteHostBtc(host) {
      const sats = this.getRemoteHostWalletSats(host);
      if (sats <= 0) return { success: false, message: 'Nenhuma carteira wallet.dat com saldo encontrada neste host.' };
      this.drainedRemoteWallets.add(host.ip);
      this.creditSats(sats, 'WALLET-LOOT', `Chave wallet.dat extraída de ${host.hostname} [${host.ip}]`);

      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      if (window.internetEngine) {
        window.internetEngine.appendServerLog(host.ip, `${myIp} exported private key from /root/wallet.dat (${fmtSatsToBtc(sats)} BTC)`);
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('BTC-STEAL', `Carteira wallet.dat drenada de ${host.ip}: +${fmtSatsToBtc(sats)} BTC`, 'warning');
      }
      if (window.hackerAudio) window.hackerAudio.playMoneyCollect();
      return { success: true, sats, btcStr: fmtSatsToBtc(sats) };
    }

    renderUI(containerId = 'bitcoinAppBody') {
      const container = document.getElementById(containerId);
      if (!container) return;
      this.ensureLoaded();

      const pctDelta = (((this.priceUsd - this.open24hPrice) / this.open24hPrice) * 100).toFixed(2);
      const isUp = Number(pctDelta) >= 0;
      const minP = Math.min(...this.priceHistory);
      const maxP = Math.max(...this.priceHistory);
      const span = Math.max(100, maxP - minP);

      const barsHtml = this.priceHistory.map((p, idx) => {
        const hPct = 25 + Math.round(((p - minP) / span) * 70);
        const active = idx === this.priceHistory.length - 1;
        return `<div title="$ ${p.toLocaleString('pt-BR')}" style="flex:1;height:${hPct}%;background:${active ? 'var(--hc-accent)' : 'var(--hc-surface-3)'};border-radius:3px 3px 0 0;"></div>`;
      }).join('');

      const ledgerHtml = this.state.ledger.length === 0
        ? `<div style="color:var(--hc-text-3);font-size:0.8rem;">Nenhuma movimentação registrada.</div>`
        : this.state.ledger.slice(0, 10).map((tx) => {
            const pos = tx.deltaSats >= 0;
            return `
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--hc-border);font-size:0.8rem;flex-wrap:wrap;">
                <div>
                  <span style="font-family:var(--hc-font-mono);color:var(--hc-text-3);">[${esc(tx.at)}]</span>
                  <span class="hc-badge ${pos ? 'success' : 'warn'}" style="margin:0 6px;">${esc(tx.kind)}</span>
                  <span style="color:var(--hc-text-2);">${esc(tx.desc)}</span>
                </div>
                <strong style="font-family:var(--hc-font-mono);color:${pos ? 'var(--hc-accent-text)' : 'var(--hc-danger-text)'};">
                  ${pos ? '+' : '-'}${fmtSatsToBtc(Math.abs(tx.deltaSats))} BTC
                </strong>
              </div>`;
          }).join('');

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;">
            <!-- Card da Carteira Fria -->
            <div class="hc-card" style="padding:1.25rem;border-color:rgba(53,184,119,0.35);">
              <div class="hc-eyebrow">Minha Carteira Bitcoin (wallet.dat)</div>
              <div style="font-family:var(--hc-font-mono);font-size:1.65rem;font-weight:700;color:var(--hc-accent-text);margin-top:0.25rem;">
                ${this.getFormattedBtc()} <span style="font-size:0.9rem;color:var(--hc-text-2);">BTC</span>
              </div>
              <div style="font-size:0.82rem;color:var(--hc-text-2);margin-bottom:0.85rem;">
                Valor estimado: <strong>${fmtUsd(this.getEstimatedUsdValue())}</strong>
              </div>
              <div style="background:var(--hc-inset);border:1px solid var(--hc-border);border-radius:7px;padding:0.55rem 0.75rem;font-family:var(--hc-font-mono);font-size:0.76rem;margin-bottom:0.5rem;word-break:break-all;">
                <span style="color:var(--hc-text-3);display:block;font-size:0.68rem;">ENDEREÇO PÚBLICO (RECEBIMENTO & MINERAÇÃO)</span>
                <span style="color:var(--hc-text);">${esc(this.state.address)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:0.75rem;color:var(--hc-text-2);">
                <span style="font-family:var(--hc-font-mono);word-break:break-all;">
                  Key: ${this.showPrivateKey ? esc(this.state.privateKey.slice(0, 32) + '...') : '••••••••••••••••••••••••••••••••'}
                </span>
                <button type="button" class="hc-btn ghost sm" onclick="window.bitcoinEngine.showPrivateKey=!window.bitcoinEngine.showPrivateKey;window.bitcoinEngine.renderUI();">
                  ${this.showPrivateKey ? 'Ocultar Key' : 'Ver Key'}
                </button>
              </div>
            </div>

            <!-- Card da Cotação Simulada HC Crypto Exchange -->
            <div class="hc-card" style="padding:1.25rem;display:flex;flex-direction:column;justify-content:space-between;">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <div class="hc-eyebrow">Cotação Simulada · HC Crypto Exchange</div>
                  <span class="hc-badge ${isUp ? 'success' : 'danger'}">${isUp ? '+' : ''}${pctDelta}% (24h)</span>
                </div>
                <div style="font-family:var(--hc-font-mono);font-size:1.55rem;font-weight:700;margin-top:0.25rem;">
                  $ ${this.priceUsd.toLocaleString('pt-BR')} <span style="font-size:0.82rem;color:var(--hc-text-2);">HC / 1 BTC</span>
                </div>
                <div style="font-size:0.78rem;color:var(--hc-text-2);margin-top:2px;">
                  Saldo disponível no Hacker Bank: <strong>${fmtUsd(window.currentWallet ? window.currentWallet.balance : 0)}</strong>
                </div>
              </div>
              <div style="height:64px;display:flex;align-items:flex-end;gap:5px;margin-top:14px;padding-top:8px;border-top:1px solid var(--hc-border);">
                ${barsHtml}
              </div>
            </div>
          </div>

          <!-- Operações: Comprar BTC / Vender BTC / Transferir BTC -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;">
            <div class="hc-card" style="padding:1.1rem;">
              <div class="hc-eyebrow" style="margin-bottom:0.45rem;">Comprar Bitcoin com Saldo Bancário</div>
              <div style="display:flex;gap:8px;">
                <input type="number" id="btcBuyUsdInput" class="form-input" placeholder="Valor em $ HC (ex: 500)" min="10">
                <button type="button" id="btnBtcBuy" class="hc-btn primary" onclick="window.handleBtcBuy()">Comprar</button>
              </div>
              <div style="font-size:0.75rem;color:var(--hc-text-3);margin-top:6px;">Converte dólares HC em satoshis pela cotação atual.</div>
            </div>

            <div class="hc-card" style="padding:1.1rem;">
              <div class="hc-eyebrow" style="margin-bottom:0.45rem;">Vender Bitcoin (Liquidar para $ HC)</div>
              <div style="display:flex;gap:8px;">
                <input type="text" id="btcSellAmountInput" class="form-input" style="font-family:var(--hc-font-mono);" placeholder="Qtd BTC (ex: 0.005)">
                <button type="button" id="btnBtcSell" class="hc-btn" onclick="window.handleBtcSell()">Vender</button>
              </div>
              <div style="font-size:0.75rem;color:var(--hc-text-3);margin-top:6px;">Deposita o valor em $ HC imediatamente na sua conta.</div>
            </div>

            <div class="hc-card" style="padding:1.1rem;">
              <div class="hc-eyebrow" style="margin-bottom:0.45rem;">Transferir BTC (Carteira → Carteira)</div>
              <div style="display:flex;flex-direction:column;gap:6px;">
                <input type="text" id="btcTransferAddrInput" class="form-input" style="font-family:var(--hc-font-mono);font-size:0.78rem;" placeholder="Endereço destino (1HC...)">
                <div style="display:flex;gap:8px;">
                  <input type="text" id="btcTransferAmtInput" class="form-input" style="font-family:var(--hc-font-mono);" placeholder="BTC (ex: 0.001)">
                  <button type="button" class="hc-btn ghost" onclick="window.handleBtcTransfer()">Enviar</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Extrato On-Chain -->
          <div class="hc-card" style="padding:1.1rem;">
            <div class="hc-eyebrow" style="margin-bottom:0.5rem;">Livro-Razão da Carteira (Mineração .vminer, Câmbio & Saques wallet.dat)</div>
            ${ledgerHtml}
          </div>
        </div>
      `;
    }
  }

  // =========================================================================
  // 2. SOFTWARE & VIRUS POTENCY ENGINE (v1.0 a v10.0 + RAM/HDD + COLLECTOR)
  // =========================================================================
  const SOFTWARE_DEFINITIONS = {
    // --- Utilitários & Defesa Locais ---
    cracker: {
      key: 'cracker',
      filename: 'Cracker.crc',
      category: 'system',
      badge: 'Ataque SSH',
      multCost: 1.2,
      baseMb: 28,
      baseRam: 16,
      desc: 'Quebra senhas root por força-bruta. Versões maiores aceleram o crack e vencem Hashers fortes.'
    },
    exploit_ssh: {
      key: 'exploit_ssh',
      filename: 'SSH_Exploit.exp',
      category: 'system',
      badge: 'Exploit Porta 22',
      multCost: 1.35,
      baseMb: 22,
      baseRam: 20,
      desc: 'Injeta payload direto em portas abertas sem precisar de senha quando versão >= Firewall do alvo.'
    },
    hasher: {
      key: 'hasher',
      filename: 'Hasher.hash',
      category: 'system',
      badge: 'Defesa Root',
      multCost: 1.1,
      baseMb: 24,
      baseRam: 14,
      desc: 'Criptografa a senha root do seu PC, dificultando força-bruta de bots e jogadores.'
    },
    firewall: {
      key: 'firewall',
      filename: 'Firewall.fwl',
      category: 'system',
      badge: 'Filtro Rede',
      multCost: 1.15,
      baseMb: 30,
      baseRam: 24,
      desc: 'Bloqueia exploits de versão inferior e reduz impacto de ataques DDoS.'
    },
    antivirus: {
      key: 'antivirus',
      filename: 'Antivirus.av',
      category: 'system',
      badge: 'Limpeza Malware',
      multCost: 1.0,
      baseMb: 26,
      baseRam: 18,
      desc: 'Varre seu PC e expurga trojans/vírus cuja potência seja <= versão do seu Antivírus.'
    },
    collector: {
      key: 'collector',
      filename: 'Collector.vcol',
      category: 'system',
      badge: 'Coletor Botnet',
      multCost: 1.25,
      baseMb: 20,
      baseRam: 12,
      desc: 'Recolhe $ HC e BTC de todos os seus vírus instalados (+10% de bônus por versão inteira).'
    },

    // --- 5 Tipos Diferentes de Vírus com Potências e Rendimentos Distintos ---
    vspam: {
      key: 'vspam',
      filename: 'Spam.vspam',
      category: 'virus',
      virusKind: 'cash_cpu',
      badge: 'Vírus Spam ($ / CPU)',
      multCost: 1.0,
      baseMb: 18,
      baseRam: 0,
      baseCashPerSec: 0.36,
      desc: 'Usa a CPU da máquina invadida para disparar spam comercial e gerar dólares ($ HC).'
    },
    vwarez: {
      key: 'vwarez',
      filename: 'Warez.vwarez',
      category: 'virus',
      virusKind: 'cash_net',
      badge: 'Vírus Warez ($ / Banda)',
      multCost: 1.15,
      baseMb: 24,
      baseRam: 0,
      baseCashPerSec: 0.52,
      desc: 'Usa a largura de banda da vítima para seed pirata. Rende muito mais em empresas/ISPs de link alto.'
    },
    vminer: {
      key: 'vminer',
      filename: 'Miner.vminer',
      category: 'virus',
      virusKind: 'btc_cpu',
      badge: 'Vírus Bitcoin (BTC / CPU)',
      multCost: 1.45,
      baseMb: 32,
      baseRam: 0,
      baseSatsPerSec: 450, // 0.00000450 BTC/s base * tier * (ver/10)
      desc: 'Minera frações reais de Bitcoin (BTC) na CPU do alvo direto para a sua carteira wallet.dat!'
    },
    vbank: {
      key: 'vbank',
      filename: 'BankTrojan.vbank',
      category: 'virus',
      virusKind: 'cash_fin',
      badge: 'Trojan Financeiro (Alto $)',
      multCost: 1.65,
      baseMb: 38,
      baseRam: 0,
      baseCashPerSec: 0.92,
      desc: 'Intercepta ordens financeiras em empresas e bancos gerando alto retorno em $ HC por potência.'
    },
    vddos: {
      key: 'vddos',
      filename: 'DDoS_Node.vddos',
      category: 'virus',
      virusKind: 'ddos_power',
      badge: 'Canhão DDoS (Gbps)',
      multCost: 1.3,
      baseMb: 26,
      baseRam: 0,
      baseGbps: 2.5,
      desc: 'Converte a vítima em nó de ataque DDoS somando poder bruto (Gbps) para derrubar alvos e caçar recompensas do FBI.'
    }
  };

  class SoftwareEngine {
    constructor() {
      this.userId = null;
      this.state = null;
      this.activeTab = 'inventory'; // 'inventory' | 'viruses'
      this.startVirusYieldTicker();
    }

    storageKey(uid) {
      return `HC_SOFTWARE_STATE_${uid || 'guest'}`;
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

      if (saved && saved.inventory) {
        this.state = saved;
      } else {
        this.state = {
          inventory: {
            cracker: { versionInt: 10, installed: true },
            exploit_ssh: { versionInt: 10, installed: true },
            hasher: { versionInt: 10, installed: true },
            firewall: { versionInt: 10, installed: true },
            antivirus: { versionInt: 10, installed: true },
            collector: { versionInt: 10, installed: true },
            vspam: { versionInt: 10, installed: false },
            vwarez: { versionInt: 10, installed: false },
            vminer: { versionInt: 10, installed: false },
            vbank: { versionInt: 10, installed: false },
            vddos: { versionInt: 10, installed: false }
          },
          localHostileInfections: [],
          remoteInfections: []
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

    fmtVer(versionInt) {
      return 'v' + (Number(versionInt || 10) / 10).toFixed(1);
    }

    getSoftwareVersion(softKey) {
      this.ensureLoaded();
      const item = this.state.inventory[softKey];
      if (!item) return 0;
      if (SOFTWARE_DEFINITIONS[softKey]?.category === 'system' && !item.installed) return 0;
      return item.versionInt / 10;
    }

    getItemSizeMb(softKey, versionInt) {
      const def = SOFTWARE_DEFINITIONS[softKey];
      if (!def) return 20;
      return Math.round(def.baseMb * (1 + (versionInt - 10) * 0.06));
    }

    getItemRamMb(softKey, versionInt) {
      const def = SOFTWARE_DEFINITIONS[softKey];
      if (!def || def.category === 'virus') return 0;
      return Math.round(def.baseRam * (1 + (versionInt - 10) * 0.05));
    }

    getMaxRamMb() {
      if (!window.hardwareEngine) return 256;
      const ramId = window.hardwareEngine.getRam().id;
      const map = { ram_256mb: 256, ram_1gb: 1024, ram_4gb: 4096, ram_16gb: 16384, ram_64gb: 65536 };
      return map[ramId] || 256;
    }

    getMaxHddMb() {
      if (!window.hardwareEngine) return 2048;
      const cpuId = window.hardwareEngine.getCpu().id;
      const map = { celeron_800: 2048, pentium_4: 5120, core_2_quad: 10240, xeon_server: 25600, quantum_core: 65536 };
      return map[cpuId] || 2048;
    }

    getUsedRamMb() {
      this.ensureLoaded();
      let sum = 0;
      for (const [k, st] of Object.entries(this.state.inventory)) {
        if (st.installed && SOFTWARE_DEFINITIONS[k]?.category === 'system') {
          sum += this.getItemRamMb(k, st.versionInt);
        }
      }
      // Malwares hostis na máquina do jogador consomem 32 MB cada!
      sum += (this.state.localHostileInfections || []).length * 32;
      return sum;
    }

    getUsedHddMb() {
      this.ensureLoaded();
      let sum = 0;
      for (const [k, st] of Object.entries(this.state.inventory)) {
        sum += this.getItemSizeMb(k, st.versionInt);
      }
      return sum;
    }

    getResearchCost(softKey) {
      this.ensureLoaded();
      const def = SOFTWARE_DEFINITIONS[softKey];
      const cur = this.state.inventory[softKey];
      if (!def || !cur) return 500;
      const v = cur.versionInt / 10;
      return Math.round(280 * Math.pow(v, 1.85) * def.multCost);
    }

    async researchUpgrade(softKey) {
      this.ensureLoaded();
      const def = SOFTWARE_DEFINITIONS[softKey];
      const cur = this.state.inventory[softKey];
      if (!def || !cur) return { success: false, message: 'Software inválido.' };
      if (cur.versionInt >= 100) {
        return { success: false, message: 'Este software já atingiu a potência máxima v10.0!' };
      }

      const cost = this.getResearchCost(softKey);
      if (!window.currentWallet || parseFloat(window.currentWallet.balance) < cost) {
        return { success: false, message: `Saldo insuficiente! Pesquisar a próxima potência de ${def.filename} custa $ ${cost.toLocaleString('pt-BR')} HC.` };
      }

      const nextVer = cur.versionInt + 5; // +0.5 de potência por nível de pesquisa!
      const extraMb = this.getItemSizeMb(softKey, nextVer) - this.getItemSizeMb(softKey, cur.versionInt);
      if (this.getUsedHddMb() + extraMb > this.getMaxHddMb()) {
        return { success: false, message: 'Espaço em disco (HDD) insuficiente para compilar a nova versão!' };
      }

      // Se estiver instalado em RAM, validar se o acréscimo de RAM cabe
      if (cur.installed && def.category === 'system') {
        const extraRam = this.getItemRamMb(softKey, nextVer) - this.getItemRamMb(softKey, cur.versionInt);
        if (this.getUsedRamMb() + extraRam > this.getMaxRamMb()) {
          return { success: false, message: `Memória RAM insuficiente (${this.getUsedRamMb()}/${this.getMaxRamMb()} MB)! Faça upgrade de RAM na aba Hardware.` };
        }
      }

      if (window.supabase && typeof window.supabase.rpc === 'function') {
        try {
          const { data } = await window.supabase.rpc('buy_black_market_item', {
            p_item_type: `research_${softKey}_v${nextVer}`,
            p_cost: cost
          });
          if (data && data.new_balance !== undefined) {
            window.currentWallet.balance = Number(data.new_balance);
          } else {
            window.currentWallet.balance = Math.max(0, parseFloat(window.currentWallet.balance) - cost);
          }
        } catch (e) {
          window.currentWallet.balance = Math.max(0, parseFloat(window.currentWallet.balance) - cost);
        }
      } else {
        window.currentWallet.balance = Math.max(0, parseFloat(window.currentWallet.balance) - cost);
      }

      cur.versionInt = nextVer;
      this.save();

      if (window.currentProfile) {
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 35;
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('RESEARCH', `${def.filename} evoluído para potência ${this.fmtVer(nextVer)} (-$ ${cost} HC, +35 REP)`, 'success');
      }
      if (window.hackerAudio) window.hackerAudio.playCashChime();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
      return { success: true, newVersion: this.fmtVer(nextVer), message: `${def.filename} compilado na potência ${this.fmtVer(nextVer)}!` };
    }

    toggleLocalInstall(softKey) {
      this.ensureLoaded();
      const def = SOFTWARE_DEFINITIONS[softKey];
      const cur = this.state.inventory[softKey];
      if (!def || !cur || def.category !== 'system') return;

      if (!cur.installed) {
        const neededRam = this.getItemRamMb(softKey, cur.versionInt);
        if (this.getUsedRamMb() + neededRam > this.getMaxRamMb()) {
          alert(`RAM insuficiente (${this.getUsedRamMb()}/${this.getMaxRamMb()} MB)! Desative outro utilitário ou compre mais RAM na Oficina de Hardware.`);
          return;
        }
        cur.installed = true;
      } else {
        cur.installed = false;
      }
      this.save();
      this.renderUI();
    }

    // Infecção hostil recebida na máquina do próprio jogador (ex: contra-ataque de Bot Tier II)
    infectLocalPc(malwareId, label, versionInt = 15, attackerIp = 'desconhecido') {
      this.ensureLoaded();
      this.state.localHostileInfections.push({
        id: Date.now() + Math.floor(Math.random() * 999),
        malwareId,
        label,
        versionInt,
        attackerIp,
        at: new Date().toLocaleTimeString()
      });
      this.save();
      if (window.winManager && window.winManager.current === 'winSoftware') {
        this.renderUI();
      }
    }

    runLocalAntivirus() {
      this.ensureLoaded();
      const av = this.state.inventory.antivirus;
      if (!av || !av.installed) {
        alert('Ative seu Antivirus.av na lista de programas antes de executar a varredura!');
        return { cleaned: 0, remaining: this.state.localHostileInfections.length };
      }

      const avVer = av.versionInt;
      const before = this.state.localHostileInfections.length;
      if (before === 0) {
        if (typeof window.showToast === 'function') window.showToast(`Varredura Antivirus.av (${this.fmtVer(avVer)}): 0 ameaças encontradas no seu PC.`);
        return { cleaned: 0, remaining: 0 };
      }

      const kept = [];
      let cleaned = 0;
      this.state.localHostileInfections.forEach((inf) => {
        if (inf.versionInt <= avVer) {
          cleaned++;
        } else {
          kept.push(inf);
        }
      });

      this.state.localHostileInfections = kept;
      this.save();

      if (cleaned > 0) {
        if (window.currentProfile) window.currentProfile.reputation = (window.currentProfile.reputation || 0) + (cleaned * 10);
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('AV-CLEAN', `Antivirus.av (${this.fmtVer(avVer)}) expurgou ${cleaned} malware(s) da sua máquina (+${cleaned * 10} REP)`, 'success');
        }
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      }
      if (typeof window.showToast === 'function') {
        window.showToast(
          kept.length === 0
            ? `Antivírus limpou ${cleaned} ameaça(s)! Seu PC está seguro.`
            : `${cleaned} removido(s), mas ${kept.length} vírus exige Antivirus.av de potência maior!`
        );
      }
      this.renderUI();
      return { cleaned, remaining: kept.length };
    }

    // =========================================================================
    // UPLOAD & EXECUÇÃO DE VÍRUS EM SERVIDORES INVADIDOS (SSH ROOT)
    // =========================================================================
    getVirusCatalogOptions() {
      this.ensureLoaded();
      return ['vspam', 'vwarez', 'vminer', 'vbank', 'vddos'].map((k) => {
        const def = SOFTWARE_DEFINITIONS[k];
        const st = this.state.inventory[k] || { versionInt: 10 };
        return {
          key: k,
          filename: def.filename,
          versionInt: st.versionInt,
          versionStr: this.fmtVer(st.versionInt),
          badge: def.badge
        };
      });
    }

    getRemoteVirusesOnIp(ip) {
      this.ensureLoaded();
      return (this.state.remoteInfections || []).filter((v) => v.targetIp === ip);
    }

    installVirusOnRemote(host, virusKey) {
      this.ensureLoaded();
      if (!host || host.notFound || host.kind === 'self') {
        return { success: false, message: 'Alvo inválido para instalação de vírus.' };
      }
      if (!window.internetEngine || window.internetEngine.activeSshIp !== host.ip) {
        return { success: false, message: 'Conecte-se como root via SSH antes de enviar e executar um vírus!' };
      }

      const def = SOFTWARE_DEFINITIONS[virusKey];
      const inv = this.state.inventory[virusKey];
      if (!def || def.category !== 'virus' || !inv) {
        return { success: false, message: 'Tipo de vírus não encontrado no seu inventário.' };
      }

      // Garantir carteira Bitcoin criada antes de plantar .vminer
      if (virusKey === 'vminer' && window.bitcoinEngine) {
        window.bitcoinEngine.ensureLoaded();
      }

      const existing = this.state.remoteInfections.find((v) => v.targetIp === host.ip && v.virusKey === virusKey);
      if (existing) {
        if (existing.versionInt >= inv.versionInt) {
          return {
            success: false,
            message: `${def.filename} (${this.fmtVer(existing.versionInt)}) já está rodando em ${host.ip}! Pesquise uma potência maior primeiro.`
          };
        }
        existing.versionInt = inv.versionInt;
      } else {
        this.state.remoteInfections.unshift({
          id: Date.now() + Math.floor(Math.random() * 1000),
          targetIp: host.ip,
          targetHostname: host.hostname,
          targetKind: host.kind,
          targetTier: host.tier || 1,
          virusKey,
          filename: def.filename,
          versionInt: inv.versionInt,
          installedAt: new Date().toLocaleString('pt-BR'),
          accumulatedCash: 0,
          accumulatedSats: 0
        });
      }
      this.save();

      // Gravar rastro real do upload + execução no /var/log/syslog da vítima (igual ao HE!)
      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      window.internetEngine.appendServerLog(
        host.ip,
        `${myIp} uploaded and executed ${def.filename} (${this.fmtVer(inv.versionInt)}) as daemon`
      );
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('VIRUS-DEPLOY', `${def.filename} (${this.fmtVer(inv.versionInt)}) implantado em ${host.hostname} [${host.ip}]`, 'warning');
      }
      if (window.currentProfile) {
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 15;
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      }
      if (window.hackerAudio) window.hackerAudio.playMalwareInstalled();
      return {
        success: true,
        message: `${def.filename} (${this.fmtVer(inv.versionInt)}) ativo em ${host.ip}! Apague o rastro na aba Logs antes de desconectar!`
      };
    }

    removeRemoteVirus(id) {
      this.ensureLoaded();
      this.state.remoteInfections = (this.state.remoteInfections || []).filter((v) => v.id !== id);
      this.save();
      this.renderUI();
    }

    getCollectorMultiplier() {
      this.ensureLoaded();
      const colVer = (this.state.inventory.collector && this.state.inventory.collector.versionInt) || 10;
      let mult = 1 + (colVer / 10) * 0.10; // v1.0 = 1.10x, v2.0 = 1.20x, v5.0 = 1.50x
      if (window.currentProfile && window.currentProfile.specialty === 'botmaster') mult *= 1.30;
      if (window.skillTreeEngine) {
        const rank = typeof window.skillTreeEngine.getRank === 'function' ? window.skillTreeEngine.getRank('botnet_boost') : 0;
        if (rank > 0) mult *= (1 + rank * 0.15);
        if (window.skillTreeEngine.selectedSubclass === 'sub_botmaster') mult *= 1.20;
      }
      return mult;
    }

    computeInfectionPerSec(v) {
      const def = SOFTWARE_DEFINITIONS[v.virusKey];
      if (!def) return { cashPerSec: 0, satsPerSec: 0, gbps: 0 };
      const potency = (v.versionInt || 10) / 10;
      const tierFactor = v.targetTier === 3 ? 2.8 : (v.targetTier === 2 ? 1.7 : 1.0);

      if (v.virusKey === 'vspam') {
        return { cashPerSec: +(def.baseCashPerSec * potency * tierFactor).toFixed(3), satsPerSec: 0, gbps: 0 };
      }
      if (v.virusKey === 'vwarez') {
        const netBonus = (v.targetKind === 'isp' || v.targetKind === 'empresa' || v.targetKind === 'download') ? 1.5 : 1.0;
        return { cashPerSec: +(def.baseCashPerSec * potency * tierFactor * netBonus).toFixed(3), satsPerSec: 0, gbps: 0 };
      }
      if (v.virusKey === 'vbank') {
        const bankBonus = (v.targetKind === 'banco' || v.targetKind === 'empresa') ? 1.6 : 1.0;
        return { cashPerSec: +(def.baseCashPerSec * potency * tierFactor * bankBonus).toFixed(3), satsPerSec: 0, gbps: 0 };
      }
      if (v.virusKey === 'vminer') {
        return { cashPerSec: 0, satsPerSec: Math.round(def.baseSatsPerSec * potency * tierFactor), gbps: 0 };
      }
      if (v.virusKey === 'vddos') {
        return { cashPerSec: 0, satsPerSec: 0, gbps: +(def.baseGbps * potency * tierFactor).toFixed(1) };
      }
      return { cashPerSec: 0, satsPerSec: 0, gbps: 0 };
    }

    startVirusYieldTicker() {
      setInterval(() => {
        if (!window.currentProfile) return;
        this.ensureLoaded();
        const list = this.state.remoteInfections || [];
        if (list.length === 0) return;

        list.forEach((v) => {
          const r = this.computeInfectionPerSec(v);
          if (r.cashPerSec > 0) v.accumulatedCash = +((v.accumulatedCash || 0) + r.cashPerSec).toFixed(4);
          if (r.satsPerSec > 0) v.accumulatedSats = Math.round((v.accumulatedSats || 0) + r.satsPerSec);
        });

        if (window.winManager && window.winManager.current === 'winSoftware' && this.activeTab === 'viruses') {
          this.renderUI();
        }
      }, 1000);
    }

    getPendingHarvestSummary() {
      this.ensureLoaded();
      const mult = this.getCollectorMultiplier();
      let rawCash = 0;
      let rawSats = 0;
      let totalGbps = 0;
      (this.state.remoteInfections || []).forEach((v) => {
        rawCash += v.accumulatedCash || 0;
        rawSats += v.accumulatedSats || 0;
        totalGbps += this.computeInfectionPerSec(v).gbps;
      });
      return {
        virusCount: (this.state.remoteInfections || []).length,
        cashReady: +(rawCash * mult).toFixed(2),
        satsReady: Math.round(rawSats * mult),
        btcReadyStr: fmtSatsToBtc(Math.round(rawSats * mult)),
        totalGbps: +totalGbps.toFixed(1),
        collectorMult: mult
      };
    }

    collectAllViruses() {
      this.ensureLoaded();
      const summary = this.getPendingHarvestSummary();
      if (summary.cashReady <= 0 && summary.satsReady <= 0) {
        return { success: false, message: 'Ainda não há rendimentos acumulados nos seus vírus para coletar.' };
      }

      // Zerar acumuladores atomicamente antes de creditar (anti-duplicação)
      (this.state.remoteInfections || []).forEach((v) => {
        v.accumulatedCash = 0;
        v.accumulatedSats = 0;
      });
      this.save();

      if (summary.cashReady > 0 && window.currentWallet) {
        window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) + summary.cashReady).toFixed(2);
      }
      if (summary.satsReady > 0 && window.bitcoinEngine) {
        window.bitcoinEngine.creditSats(
          summary.satsReady,
          'VMINER',
          `Coleta Collector.vcol (${summary.collectorMult.toFixed(2)}x) de mineradores remotos`
        );
      }

      const repGain = Math.min(80, 10 + Math.floor(summary.cashReady * 0.08) + Math.floor(summary.satsReady / 4000));
      if (window.currentProfile) {
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + repGain;
      }

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog(
          'VCOL-HARVEST',
          `Coleta de vírus concluída: +${fmtUsd(summary.cashReady)} e +${summary.btcReadyStr} BTC (+${repGain} REP)`,
          'success'
        );
      }
      if (window.hackerAudio) window.hackerAudio.playMoneyCollect();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();

      return {
        success: true,
        cashCollected: summary.cashReady,
        satsCollected: summary.satsReady,
        btcStr: summary.btcReadyStr,
        message: `Collector.vcol recolheu +${fmtUsd(summary.cashReady)} e +${summary.btcReadyStr} BTC!`
      };
    }

    renderUI(containerId = 'softwareAppBody') {
      const container = document.getElementById(containerId);
      if (!container) return;
      this.ensureLoaded();

      const usedRam = this.getUsedRamMb();
      const maxRam = this.getMaxRamMb();
      const usedHdd = this.getUsedHddMb();
      const maxHdd = this.getMaxHddMb();
      const harvest = this.getPendingHarvestSummary();
      const hostiles = this.state.localHostileInfections || [];

      const hostileBanner = hostiles.length === 0 ? '' : `
        <div class="hc-card" style="padding:0.95rem 1.15rem;border-color:var(--hc-danger);background:rgba(208,68,58,0.09);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
          <div>
            <strong style="color:var(--hc-danger-text);font-size:0.9rem;">ALERTA DE INFECÇÃO LOCAL: ${hostiles.length} malware(s) rodando na sua CPU!</strong>
            <div style="font-size:0.78rem;color:var(--hc-text-2);font-family:var(--hc-font-mono);">
              ${hostiles.map((h) => `${esc(h.label)} (${this.fmtVer(h.versionInt)}) de ${esc(h.attackerIp)}`).join(' · ')}
            </div>
          </div>
          <button type="button" id="btnRunLocalAv" class="hc-btn primary sm" style="background:var(--hc-danger);border-color:var(--hc-danger);" onclick="window.softwareEngine.runLocalAntivirus()">
            Expurgar com Antivirus.av
          </button>
        </div>
      `;

      let tabContent = '';
      if (this.activeTab === 'inventory') {
        const sysKeys = ['cracker', 'exploit_ssh', 'hasher', 'firewall', 'antivirus', 'collector'];
        const virKeys = ['vspam', 'vwarez', 'vminer', 'vbank', 'vddos'];

        const renderRow = (k) => {
          const def = SOFTWARE_DEFINITIONS[k];
          const cur = this.state.inventory[k] || { versionInt: 10, installed: false };
          const cost = this.getResearchCost(k);
          const sizeMb = this.getItemSizeMb(k, cur.versionInt);
          const ramMb = this.getItemRamMb(k, cur.versionInt);
          const nextVerStr = this.fmtVer(cur.versionInt + 5);

          return `
            <div class="hc-card" style="padding:0.9rem 1.1rem;display:grid;grid-template-columns:minmax(200px,1.3fr) minmax(180px,1.5fr) auto;gap:12px;align-items:center;">
              <div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                  <strong style="font-family:var(--hc-font-mono);font-size:0.92rem;">${esc(def.filename)}</strong>
                  <span class="hc-badge success">${this.fmtVer(cur.versionInt)}</span>
                  <span class="hc-badge info">${esc(def.badge)}</span>
                </div>
                <div style="font-size:0.74rem;color:var(--hc-text-3);font-family:var(--hc-font-mono);margin-top:3px;">
                  Disco: ${sizeMb} MB ${def.category === 'system' ? `· RAM: ${ramMb} MB (${cur.installed ? 'ATIVO' : 'PARADO'})` : '· Payload p/ Upload SSH'}
                </div>
              </div>

              <div style="font-size:0.8rem;color:var(--hc-text-2);">${esc(def.desc)}</div>

              <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
                ${k === 'antivirus'
                  ? `<button type="button" class="hc-btn ghost sm" onclick="window.softwareEngine.runLocalAntivirus()">Varrer PC</button>`
                  : ''}
                ${def.category === 'system'
                  ? `<button type="button" class="hc-btn ghost sm" onclick="window.softwareEngine.toggleLocalInstall('${k}')">${cur.installed ? 'Desativar' : 'Instalar'}</button>`
                  : ''}
                <button type="button" id="btnResearch_${k}" class="hc-btn primary sm" onclick="window.handleSoftwareResearch('${k}')">
                  Upgrade → ${nextVerStr} ($ ${cost.toLocaleString('pt-BR')})
                </button>
              </div>
            </div>
          `;
        };

        tabContent = `
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="hc-eyebrow">1. Vírus Ofensivos & Mineradores (Envie via SSH na aba Internet → Entrar)</div>
            <div style="display:flex;flex-direction:column;gap:8px;">${virKeys.map(renderRow).join('')}</div>

            <div class="hc-eyebrow" style="margin-top:6px;">2. Utilitários de Ataque, Defesa & Coleta (Rodando no Seu PC)</div>
            <div style="display:flex;flex-direction:column;gap:8px;">${sysKeys.map(renderRow).join('')}</div>
          </div>
        `;
      } else {
        const list = this.state.remoteInfections || [];
        const rows = list.length === 0
          ? `<div class="hc-card" style="padding:2rem;text-align:center;color:var(--hc-text-2);">
               <div style="font-weight:600;color:var(--hc-text);margin-bottom:6px;">Nenhum vírus instalado em servidores remotos ainda</div>
               <div style="font-size:0.84rem;margin-bottom:14px;">Invada qualquer IP na aba <strong>Internet</strong>, entre como <code>root</code>, suba um <code>.vspam</code>, <code>.vwarez</code>, <code>.vminer</code>, <code>.vbank</code> ou <code>.vddos</code> e apague seu IP do log!</div>
               <button type="button" class="hc-btn primary" onclick="window.internetEngine.openIp('203.17.88.40', 'invadir')">Ir Invadir um Servidor →</button>
             </div>`
          : list.map((v) => {
              const rate = this.computeInfectionPerSec(v);
              const rateStr = rate.satsPerSec > 0
                ? `+${fmtSatsToBtc(rate.satsPerSec)} BTC/s`
                : (rate.gbps > 0 ? `+${rate.gbps} Gbps DDoS` : `+$ ${rate.cashPerSec.toFixed(2)} HC/s`);
              const accStr = v.virusKey === 'vminer'
                ? `${fmtSatsToBtc(v.accumulatedSats)} BTC`
                : (v.virusKey === 'vddos' ? 'Pronto p/ Ataque' : fmtUsd(v.accumulatedCash));

              return `
                <div class="hc-card" style="padding:0.9rem 1.1rem;display:grid;grid-template-columns:minmax(200px,1.3fr) minmax(170px,1fr) minmax(150px,1fr) auto;gap:12px;align-items:center;">
                  <div>
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                      <strong style="font-family:var(--hc-font-mono);color:var(--hc-accent-text);">${esc(v.targetIp)}</strong>
                      <span class="hc-badge info">Tier ${v.targetTier}</span>
                    </div>
                    <div style="font-size:0.8rem;color:var(--hc-text-2);">${esc(v.targetHostname)}</div>
                  </div>

                  <div>
                    <strong style="font-family:var(--hc-font-mono);font-size:0.86rem;">${esc(v.filename)}</strong>
                    <span class="hc-badge success" style="margin-left:6px;">${this.fmtVer(v.versionInt)}</span>
                    <div style="font-size:0.75rem;color:var(--hc-text-2);font-family:var(--hc-font-mono);margin-top:2px;">${rateStr}</div>
                  </div>

                  <div>
                    <div style="font-size:0.7rem;color:var(--hc-text-3);text-transform:uppercase;">Acumulado Bruto</div>
                    <strong style="font-family:var(--hc-font-mono);font-size:0.88rem;color:var(--hc-warning);">${accStr}</strong>
                  </div>

                  <div style="display:flex;gap:6px;justify-content:flex-end;">
                    <button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('${esc(v.targetIp)}', 'entrar')">SSH</button>
                    <button type="button" class="hc-btn ghost sm" style="color:var(--hc-danger-text);" onclick="window.softwareEngine.removeRemoteVirus(${v.id})">Desativar</button>
                  </div>
                </div>
              `;
            }).join('');

        tabContent = `
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;">
              <div class="hc-card" style="padding:0.9rem 1rem;">
                <div class="hc-stat-label">Vírus Ativos na Rede</div>
                <div class="hc-stat-value">${harvest.virusCount}</div>
              </div>
              <div class="hc-card" style="padding:0.9rem 1rem;">
                <div class="hc-stat-label">Pronto p/ Coleta ($ HC)</div>
                <div class="hc-stat-value" style="color:var(--hc-accent-text);font-size:1.25rem;">${fmtUsd(harvest.cashReady)}</div>
              </div>
              <div class="hc-card" style="padding:0.9rem 1rem;">
                <div class="hc-stat-label">Pronto p/ Coleta (BTC)</div>
                <div class="hc-stat-value" style="font-family:var(--hc-font-mono);color:var(--hc-warning);font-size:1.15rem;">${harvest.btcReadyStr} BTC</div>
              </div>
              <div class="hc-card" style="padding:0.9rem 1rem;">
                <div class="hc-stat-label">Poder DDoS (.vddos)</div>
                <div class="hc-stat-value" style="font-family:var(--hc-font-mono);font-size:1.25rem;">${harvest.totalGbps} Gbps</div>
              </div>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
              <span style="font-size:0.82rem;color:var(--hc-text-2);">
                Bônus total do seu <code>Collector.vcol</code> + Especializações: <strong>${harvest.collectorMult.toFixed(2)}x</strong>
              </span>
              <button type="button" id="btnCollectAllViruses" class="hc-btn primary" onclick="window.handleCollectViruses()">
                Coletar Tudo com Collector.vcol ($ HC + BTC)
              </button>
            </div>

            <div style="display:flex;flex-direction:column;gap:8px;">${rows}</div>
          </div>
        `;
      }

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${hostileBanner}

          <!-- Barras de Capacidade Física: HDD & RAM -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="hc-card" style="padding:0.8rem 1rem;">
              <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:5px;">
                <span style="color:var(--hc-text-2);">Armazenamento HDD</span>
                <strong style="font-family:var(--hc-font-mono);">${usedHdd} / ${maxHdd} MB</strong>
              </div>
              <div style="height:7px;background:var(--hc-inset);border-radius:999px;overflow:hidden;">
                <div style="height:100%;width:${Math.min(100, Math.round((usedHdd / maxHdd) * 100))}%;background:var(--hc-accent);"></div>
              </div>
            </div>

            <div class="hc-card" style="padding:0.8rem 1rem;">
              <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:5px;">
                <span style="color:var(--hc-text-2);">Memória RAM Alocada</span>
                <strong style="font-family:var(--hc-font-mono);">${usedRam} / ${maxRam} MB</strong>
              </div>
              <div style="height:7px;background:var(--hc-inset);border-radius:999px;overflow:hidden;">
                <div style="height:100%;width:${Math.min(100, Math.round((usedRam / maxRam) * 100))}%;background:${usedRam > maxRam * 0.85 ? 'var(--hc-warning)' : 'var(--hc-accent)'};"></div>
              </div>
            </div>
          </div>

          <!-- Abas Internas: Meus Programas vs Rede de Vírus Ativos -->
          <div style="display:flex;gap:8px;border-bottom:1px solid var(--hc-border);padding-bottom:10px;flex-wrap:wrap;">
            <button type="button" class="hc-btn sm ${this.activeTab === 'inventory' ? 'primary' : 'ghost'}" onclick="window.softwareEngine.activeTab='inventory';window.softwareEngine.renderUI();">
              Meus Softwares & Upgrade de Potência (v1.0 → v10.0)
            </button>
            <button type="button" id="tabActiveViruses" class="hc-btn sm ${this.activeTab === 'viruses' ? 'primary' : 'ghost'}" onclick="window.softwareEngine.activeTab='viruses';window.softwareEngine.renderUI();">
              Vírus Instalados & Coletor (${harvest.virusCount})
            </button>
          </div>

          ${tabContent}
        </div>
      `;
    }
  }

  window.bitcoinEngine = new BitcoinEngine();
  window.softwareEngine = new SoftwareEngine();

  window.handleBtcBuy = async function () {
    const btn = document.getElementById('btnBtcBuy');
    if (btn && btn.disabled) return;
    if (btn) {
      btn.disabled = true;
      btn.innerText = 'Comprando...';
    }
    try {
      const val = document.getElementById('btcBuyUsdInput')?.value;
      const res = await window.bitcoinEngine.buyBtcWithCash(val);
      if (!res.success) alert(res.message);
      else if (typeof window.showToast === 'function') window.showToast(res.message);
      return res;
    } finally {
      const b2 = document.getElementById('btnBtcBuy');
      if (b2) {
        b2.disabled = false;
        b2.innerText = 'Comprar';
      }
    }
  };

  window.handleBtcSell = function () {
    const val = document.getElementById('btcSellAmountInput')?.value;
    const res = window.bitcoinEngine.sellBtcForCash(val);
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };

  window.handleBtcTransfer = function () {
    const addr = document.getElementById('btcTransferAddrInput')?.value;
    const amt = document.getElementById('btcTransferAmtInput')?.value;
    const res = window.bitcoinEngine.transferBtc(addr, amt);
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };

  window.handleSoftwareResearch = async function (softKey) {
    const btn = document.getElementById(`btnResearch_${softKey}`);
    if (btn && btn.disabled) return;
    if (btn) {
      btn.disabled = true;
      btn.innerText = 'Compilando...';
    }
    try {
      const res = await window.softwareEngine.researchUpgrade(softKey);
      if (!res.success) alert(res.message);
      else if (typeof window.showToast === 'function') window.showToast(res.message);
      return res;
    } finally {
      const b2 = document.getElementById(`btnResearch_${softKey}`);
      if (b2) b2.disabled = false;
    }
  };

  window.handleCollectViruses = function () {
    const res = window.softwareEngine.collectAllViruses();
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
  };
})();
