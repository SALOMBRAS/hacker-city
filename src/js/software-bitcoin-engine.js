/**
 * Hacker City // Economia Hardcore & Física Real de Vírus, Hardware, Internet, Armazenamento & Antivírus:
 * 1. BitcoinEngine  — Carteira BTC enxuta (25.000 sats iniciais), Câmbio simulado e saques proporcionais de wallet.dat
 * 2. SoftwareEngine — Crescimento real de Disco (MB) e RAM (MB) por potência (v1.0→v10.0), validação se o vírus
 *                     CABE no HD e na RAM da vítima, tempo de upload pela velocidade de Internet (Mbps),
 *                     varredura periódica do Antivirus.av dos alvos e lucros difíceis escalados por CPU/Rede/Potência/Collector
 */
(function () {
  const SATS_PER_BTC = 100000000;

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
  // 1. BITCOIN ENGINE (ECONOMIA ESCASSA — CADA SATOSHI IMPORTA)
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
        // Semente humilde (0.00025000 BTC ≈ $ 16 HC) — jogador precisa ralar minerando/invadindo!
        this.state = {
          address: '1HC' + randomBase58(31),
          privateKey: randomHex(64),
          balanceSats: 25000,
          ledger: [
            {
              at: new Date().toLocaleTimeString(),
              kind: 'GENESIS',
              deltaSats: 25000,
              desc: 'Abertura da carteira fria (Semente inicial 0.00025000 BTC)'
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
        const drift = (Math.random() - 0.495) * 0.009;
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

      const isLocalDemo = String(window.currentProfile?.id || '').startsWith('local-');
      if (window.supabase && !isLocalDemo && typeof window.supabase.rpc === 'function') {
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
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 15;
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('BTC-P2P', `Transferência on-chain enviada para ${addr}: -${fmtSatsToBtc(sats)} BTC`, 'info');
      }
      if (window.hackerAudio) window.hackerAudio.playKeyClick();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
      return { success: true, message: `Enviado ${fmtSatsToBtc(sats)} BTC para ${addr}!` };
    }

    // Saldo enxuto e difícil em carteiras remotas wallet.dat (~$22 a ~$260 HC em BTC conforme o Tier)
    getRemoteHostWalletSats(host) {
      if (!host || host.kind === 'self' || this.drainedRemoteWallets.has(host.ip)) return 0;
      const seed = hashHostSeed(host.ip);
      if (host.kind === 'banco') {
        return 220000 + (seed % 180000); // ~0.0022 a 0.0040 BTC
      }
      if (host.kind === 'darknet') {
        return 110000 + (seed % 95000); // ~0.0011 a 0.0020 BTC
      }
      if (host.kind === 'empresa' || host.kind === 'underground') {
        return 35000 + (seed % 40000); // ~0.00035 a 0.00075 BTC
      }
      if (host.kind === 'bot' && host.tier >= 2) {
        return (host.tier === 3 ? 175000 : 55000) + (seed % 50000);
      }
      if (host.kind === 'player' && !host.newbieProtected) {
        return 65000 + (seed % 55000);
      }
      return 0;
    }

    drainRemoteHostBtc(host) {
      const sats = this.getRemoteHostWalletSats(host);
      if (sats <= 0) return { success: false, message: 'Nenhuma carteira wallet.dat com saldo encontrada neste host.' };
      this.drainedRemoteWallets.add(host.ip);
      this.creditSats(sats, 'WALLET-LOOT', `Chave wallet.dat extraída de ${host.hostname} [${host.ip}]`);

      const visibleIp = window.bounceEngine
        ? window.bounceEngine.routeConnectionAndGetVisibleIp(host.ip).visibleIp
        : (window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0');
      if (window.internetEngine) {
        window.internetEngine.appendServerLog(host.ip, `${visibleIp} exported private key from /root/wallet.dat (${fmtSatsToBtc(sats)} BTC)`);
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

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;">
            <div class="hc-card" style="padding:1.1rem;">
              <div class="hc-eyebrow" style="margin-bottom:0.45rem;">Comprar Bitcoin com Saldo Bancário</div>
              <div style="display:flex;gap:8px;">
                <input type="number" id="btcBuyUsdInput" class="form-input" placeholder="Valor em $ HC (ex: 150)" min="10">
                <button type="button" id="btnBtcBuy" class="hc-btn primary" onclick="window.handleBtcBuy()">Comprar</button>
              </div>
              <div style="font-size:0.75rem;color:var(--hc-text-3);margin-top:6px;">Converte dólares HC em satoshis pela cotação atual.</div>
            </div>

            <div class="hc-card" style="padding:1.1rem;">
              <div class="hc-eyebrow" style="margin-bottom:0.45rem;">Vender Bitcoin (Liquidar para $ HC)</div>
              <div style="display:flex;gap:8px;">
                <input type="text" id="btcSellAmountInput" class="form-input" style="font-family:var(--hc-font-mono);" placeholder="Qtd BTC (ex: 0.0005)">
                <button type="button" id="btnBtcSell" class="hc-btn" onclick="window.handleBtcSell()">Vender</button>
              </div>
              <div style="font-size:0.75rem;color:var(--hc-text-3);margin-top:6px;">Deposita o valor em $ HC imediatamente na sua conta.</div>
            </div>

            <div class="hc-card" style="padding:1.1rem;">
              <div class="hc-eyebrow" style="margin-bottom:0.45rem;">Transferir BTC (Carteira → Carteira)</div>
              <div style="display:flex;flex-direction:column;gap:6px;">
                <input type="text" id="btcTransferAddrInput" class="form-input" style="font-family:var(--hc-font-mono);font-size:0.78rem;" placeholder="Endereço destino (1HC...)">
                <div style="display:flex;gap:8px;">
                  <input type="text" id="btcTransferAmtInput" class="form-input" style="font-family:var(--hc-font-mono);" placeholder="BTC (ex: 0.0002)">
                  <button type="button" class="hc-btn ghost" onclick="window.handleBtcTransfer()">Enviar</button>
                </div>
              </div>
            </div>
          </div>

          <div class="hc-card" style="padding:1.1rem;">
            <div class="hc-eyebrow" style="margin-bottom:0.5rem;">Livro-Razão da Carteira (Mineração .vminer, Câmbio & Saques wallet.dat)</div>
            ${ledgerHtml}
          </div>
        </div>
      `;
    }
  }

  // =========================================================================
  // 2. SOFTWARE & VIRUS ENGINE — FÍSICA AUTÊNTICA (VERSÃO ESTRITA, LICENÇAS, AV vs VÍRUS, FORMAT HD)
  // =========================================================================
  const SOFTWARE_DEFINITIONS = {
    // --- Utilitários Principais de Invasão, Defesa & Rede (Rodam na sua RAM) ---
    cracker: {
      key: 'cracker',
      filename: 'Cracker.crc',
      friendlyTitle: 'Quebrador de Senhas (Cracker)',
      category: 'system',
      badge: 'Descobrir Senhas',
      multCost: 1.25,
      baseMb: 20,
      baseRam: 16,
      starterOwned: true,
      starterInstalled: true,
      acquireIp: '33.8.2.71',
      acquireHint: 'Já vem no seu PC / Central de Downloads (33.8.2.71)',
      desc: 'Descobre a senha de outros computadores e contas bancárias. Precisa ter versão igual ou maior que o Escudo e o Cofre de Senha da vítima!'
    },
    hasher: {
      key: 'hasher',
      filename: 'Hasher.hash',
      friendlyTitle: 'Cofre da Sua Senha (Hasher)',
      category: 'system',
      badge: 'Tranca sua Senha',
      multCost: 1.15,
      baseMb: 18,
      baseRam: 14,
      starterOwned: true,
      starterInstalled: true,
      acquireIp: '33.8.2.71',
      acquireHint: 'Já vem no seu PC / Central de Downloads (33.8.2.71)',
      desc: 'Embaralha e tranca a senha do seu PC. Impede que invasores com Quebrador de Senha mais fraco consigam adivinhar sua senha!'
    },
    firewall: {
      key: 'firewall',
      filename: 'Firewall.fwl',
      friendlyTitle: 'Escudo de Rede (Firewall)',
      category: 'system',
      badge: 'Protege seu PC',
      multCost: 1.2,
      baseMb: 20,
      baseRam: 18,
      starterOwned: true,
      starterInstalled: true,
      acquireIp: '33.8.2.71',
      acquireHint: 'Já vem no seu PC / Central de Downloads (33.8.2.71)',
      desc: 'A porta blindada do seu PC: barra invasões mais fracas que ele! Só pode rodar 1 Escudo por vez (com tempo de carência ao trocar).'
    },
    portscan: {
      key: 'portscan',
      filename: 'PortScan.scan',
      friendlyTitle: 'Detector de Brechas (Scanner)',
      category: 'system',
      badge: 'Olhar Portas',
      multCost: 1.0,
      baseMb: 8,
      baseRam: 8,
      nonResearchable: true,
      starterOwned: true,
      starterInstalled: true,
      acquireIp: '33.8.2.71',
      acquireHint: 'Já vem no seu PC / Central de Downloads (33.8.2.71)',
      desc: 'Verifica se o computador alvo tem portas destrancadas antes de tentar entrar sem senha.'
    },
    exploit_ftp: {
      key: 'exploit_ftp',
      filename: 'FTP_Exploit.exp',
      friendlyTitle: 'Chave Mestra de Arquivos (FTP)',
      category: 'system',
      badge: 'Invasão s/ Senha (Arquivos)',
      multCost: 1.32,
      baseMb: 16,
      baseRam: 14,
      starterOwned: false,
      starterInstalled: false,
      acquireIp: '109.64.200.35',
      acquireHint: 'Enigma #3 (109.64.200.35) ou Mercado Clandestino (185.220.101.9)',
      desc: 'Entra sem saber a senha se vencer o Escudo do alvo! Libera baixar/enviar arquivos (junto com a Chave SSH dá controle total).'
    },
    exploit_ssh: {
      key: 'exploit_ssh',
      filename: 'SSH_Exploit.exp',
      friendlyTitle: 'Chave Mestra de Comandos (SSH)',
      category: 'system',
      badge: 'Invasão s/ Senha (Comandos)',
      multCost: 1.4,
      baseMb: 18,
      baseRam: 16,
      starterOwned: false,
      starterInstalled: false,
      acquireIp: '109.64.200.35',
      acquireHint: 'Enigma #3 (109.64.200.35) ou Mercado Clandestino (185.220.101.9)',
      desc: 'Entra sem saber a senha se vencer o Escudo do alvo! Libera rodar programas e apagar arquivos (junto com a Chave FTP dá controle total).'
    },
    antivirus: {
      key: 'antivirus',
      filename: 'Antivirus.av',
      friendlyTitle: 'Faxina de Vírus (Antivírus)',
      category: 'system',
      badge: 'Limpa seu PC',
      multCost: 1.05,
      baseMb: 18,
      baseRam: 16,
      starterOwned: false,
      starterInstalled: false,
      acquireIp: '33.8.2.71',
      acquireHint: 'Central de Downloads (33.8.2.71 — grátis!) ou Enigma #4 (109.64.200.48)',
      desc: 'Remove vírus que inimigos colocaram no seu PC — mas só apaga vírus de força igual ou menor que o seu Antivírus!'
    },
    collector: {
      key: 'collector',
      filename: 'Collector.vcol',
      friendlyTitle: 'Recolhedor de Dinheiro (Coletor)',
      category: 'system',
      badge: 'Puxa seus Lucros',
      multCost: 1.5,
      baseMb: 14,
      baseRam: 12,
      starterOwned: false,
      starterInstalled: false,
      acquireIp: '109.64.200.10',
      acquireHint: 'Primeiro Enigma (109.64.200.10)',
      desc: 'Deixe ligado na memória para recolher o dinheiro e os Bitcoins que seus vírus estão gerando! Melhorar ele aumenta seus ganhos em +36%.'
    },
    torrent: {
      key: 'torrent',
      filename: 'Torrent.torrent',
      friendlyTitle: 'Distribuidor Pirata (Torrent)',
      category: 'system',
      badge: 'Ativa Vírus Warez',
      multCost: 1.0,
      baseMb: 10,
      baseRam: 8,
      nonResearchable: true,
      starterOwned: false,
      starterInstalled: false,
      acquireIp: '109.64.200.22',
      acquireHint: 'Enigma #2 (109.64.200.22)',
      desc: 'Precisa estar ligado no seu PC para que seus vírus de vendas piratas (Warez) funcionem e gerem dinheiro!'
    },
    ddos_breaker: {
      key: 'ddos_breaker',
      filename: 'DDoS_Breaker.vbrk',
      friendlyTitle: 'Disparador de Sobrecarga (DDoS)',
      category: 'system',
      badge: 'Botão de Ataque em Massa',
      multCost: 1.25,
      baseMb: 14,
      baseRam: 12,
      starterOwned: false,
      starterInstalled: false,
      acquireIp: '109.64.200.61',
      acquireHint: 'Enigma #5 (109.64.200.61)',
      desc: 'O controle remoto que junta seus vírus de sobrecarga para derrubar servidores rivais e capturar procurados do FBI!'
    },
    nmap: {
      key: 'nmap',
      filename: 'Nmap.nmap',
      friendlyTitle: 'Rastreador de Espiões (Nmap)',
      category: 'system',
      badge: 'Descobre Quem Conectou',
      multCost: 1.15,
      baseMb: 12,
      baseRam: 10,
      starterOwned: false,
      starterInstalled: false,
      acquireIp: '109.64.200.35',
      acquireHint: 'Enigma #3 (109.64.200.35)',
      desc: 'Mostra o endereço de quem está conectado na rede agora (se o Escudo deles for mais fraco que seu Rastreador).'
    },
    analyzer: {
      key: 'analyzer',
      filename: 'Analyzer.ana',
      friendlyTitle: 'Raio-X de Máquina (Analyzer)',
      category: 'system',
      badge: 'Olha a Força do Alvo',
      multCost: 1.3,
      baseMb: 12,
      baseRam: 10,
      maxVerInt: 30,
      starterOwned: false,
      starterInstalled: false,
      acquireIp: '33.8.2.71',
      acquireHint: 'Central de Downloads (33.8.2.71 — grátis!)',
      desc: 'Examina a potência das peças do computador invadido e anota automaticamente no seu Caderno de Senhas.'
    },
    webserver: {
      key: 'webserver',
      filename: 'WebServer.exe',
      friendlyTitle: 'Criador de Página Web',
      category: 'system',
      badge: 'Seu Site & Pichação',
      multCost: 1.0,
      baseMb: 10,
      baseRam: 10,
      nonResearchable: true,
      starterOwned: false,
      starterInstalled: false,
      acquireIp: '33.8.2.71',
      acquireHint: 'Central de Downloads (33.8.2.71 — grátis!)',
      desc: 'Permite colocar uma mensagem no seu próprio endereço IP e pichar a capa de sites que você invadir!'
    },

    // --- 5 Famílias de Vírus (Baixe os básicos v1.0 resolvendo as máquinas de Enigma!) ---
    vspam: {
      key: 'vspam',
      filename: 'Spam.vspam',
      friendlyTitle: 'Vírus de Propaganda (Spam)',
      category: 'virus',
      virusKind: 'cash_cpu',
      badge: 'Gera Dinheiro Fácil',
      multCost: 1.0,
      baseMb: 16,
      baseRam: 10,
      starterOwned: false,
      acquireIp: '109.64.200.10',
      acquireHint: 'Primeiro Enigma (109.64.200.10)',
      desc: 'Seu primeiro vírus! Levinho, envia propagandas usando o computador da vítima e gera dólares continuamente.'
    },
    vwarez: {
      key: 'vwarez',
      filename: 'Warez.vwarez',
      friendlyTitle: 'Vírus de Vendas Piratas (Warez)',
      category: 'virus',
      virusKind: 'cash_net',
      badge: 'Gera + Dinheiro c/ Internet Boa',
      multCost: 1.2,
      baseMb: 22,
      baseRam: 14,
      starterOwned: false,
      acquireIp: '109.64.200.22',
      acquireHint: 'Enigma #2 (109.64.200.22)',
      desc: 'Usa a internet rápida da vítima para vender downloads e render bons dólares (mantenha o Distribuidor Torrent ligado!).'
    },
    vminer: {
      key: 'vminer',
      filename: 'Miner.vminer',
      friendlyTitle: 'Garimpeiro de Bitcoin (Miner)',
      category: 'virus',
      virusKind: 'btc_cpu',
      badge: 'Gera Moeda Bitcoin',
      multCost: 1.55,
      baseMb: 26,
      baseRam: 18,
      starterOwned: false,
      acquireIp: '109.64.200.48',
      acquireHint: 'Enigma #4 (109.64.200.48)',
      desc: 'Coloca o computador invadido para garimpar moedas digitais Bitcoin de graça para a sua carteira!'
    },
    vbank: {
      key: 'vbank',
      filename: 'BankTrojan.vbank',
      friendlyTitle: 'Vírus Espião de Cofre (Trojan)',
      category: 'virus',
      virusKind: 'cash_fin',
      badge: 'Lucro Pesado em Bancos',
      multCost: 1.85,
      baseMb: 34,
      baseRam: 26,
      starterOwned: false,
      acquireIp: '109.64.200.77',
      acquireHint: 'Enigma #6 (109.64.200.77)',
      desc: 'Grande e pesado, mas rende muito dinheiro quando instalado em Bancos e grandes Empresas!'
    },
    vddos: {
      key: 'vddos',
      filename: 'DDoS_Node.vddos',
      friendlyTitle: 'Vírus de Sobrecarga (DDoS)',
      category: 'virus',
      virusKind: 'ddos_power',
      badge: 'Derruba Servidores & FBI',
      multCost: 1.35,
      baseMb: 20,
      baseRam: 16,
      starterOwned: false,
      acquireIp: '109.64.200.61',
      acquireHint: 'Enigma #5 (109.64.200.61)',
      desc: 'Transforma o computador invadido num soldado do seu exército para derrubar alvos pesados e procurados do FBI.'
    }
  };

  class SoftwareEngine {
    constructor() {
      this.userId = null;
      this.state = null;
      this.activeTab = 'inventory';
      this.activeUploadJob = null;
      this.avPurgeHistory = [];
      this.lastNmapReport = null;
      this.transitions = {}; // softKey -> { mode: 'cooldown_off' | 'booting' | 'swapping', fromVerInt, toVerInt, startedAt, endsAt, durationMs }
      this.startTransitionUiLoop();
      this.startVirusYieldTicker();
      this.startRemoteAvSweepLoop();
    }

    storageKey(uid) {
      return `HC_SOFTWARE_STATE_${uid || 'guest'}`;
    }

    startTransitionUiLoop() {
      setInterval(() => {
        const keys = Object.keys(this.transitions || {});
        if (keys.length === 0) return;
        const now = Date.now();
        let anyChanged = false;

        keys.forEach((k) => {
          const tr = this.transitions[k];
          if (!tr) return;
          if (now >= tr.endsAt) {
            delete this.transitions[k];
            anyChanged = true;
            if (tr.mode === 'booting' || tr.mode === 'swapping') {
              this.ensureLoaded();
              const cur = this.state.inventory[k];
              if (cur && cur.owned) {
                cur.installed = true;
                cur.runningVerInt = tr.toVerInt || cur.versionInt;
                this.save();
                if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
                const def = SOFTWARE_DEFINITIONS[k];
                if (typeof window.addLocalLog === 'function') {
                  window.addLocalLog('RAM-ACTIVE', `${def?.friendlyTitle || def?.filename || k} (${this.fmtVer(cur.runningVerInt)}) terminou o tempo de carência e está ATIVO na memória!`, 'success');
                }
                if (typeof window.showToast === 'function') {
                  window.showToast(`${def?.friendlyTitle || def?.filename} (${this.fmtVer(cur.runningVerInt)}) agora está ATIVO no seu PC!`);
                }
              }
            }
          }
        });

        if (window.winManager && window.winManager.current === 'winSoftware') {
          this.renderUI();
        } else if (anyChanged && typeof window.updateHudDisplays === 'function') {
          window.updateHudDisplays();
        }
      }, 250);
    }

    getTransitionInfo(softKey) {
      const tr = this.transitions && this.transitions[softKey];
      if (!tr) return null;
      const now = Date.now();
      if (now >= tr.endsAt) return null;
      const remMs = Math.max(0, tr.endsAt - now);
      const pct = Math.min(99, Math.max(4, Math.round(((now - tr.startedAt) / Math.max(200, tr.durationMs)) * 100)));
      return {
        ...tr,
        remainingSec: +(remMs / 1000).toFixed(1),
        pct
      };
    }

    isSoftwareInTransition(softKey) {
      return !!this.getTransitionInfo(softKey);
    }

    getGraceDurationMs(baseMs = 3500) {
      const cpuMhz = this.getPlayerCpuMhz();
      const speedMult = Math.max(1, Math.pow(cpuMhz / 800, 0.35));
      return Math.max(1800, Math.round(baseMs / speedMult));
    }

    buildStarterInventory() {
      const inv = {};
      for (const [k, def] of Object.entries(SOFTWARE_DEFINITIONS)) {
        const owned = !!def.starterOwned;
        const inst = owned && def.category === 'system' ? !!def.starterInstalled : false;
        inv[k] = {
          owned,
          versionInt: owned ? 10 : 0,
          runningVerInt: inst ? 10 : 0,
          installed: inst,
          licensed: owned
        };
      }
      return inv;
    }

    ensureLoaded() {
      const uid = (window.currentProfile && window.currentProfile.id) || 'guest';
      if (this.userId === uid && this.state) return this.state;

      this.userId = uid;
      this.transitions = {};
      let saved = null;
      try {
        const raw = localStorage.getItem(this.storageKey(uid));
        if (raw) saved = JSON.parse(raw);
      } catch (e) {}

      if (saved && saved.inventory) {
        const defaults = this.buildStarterInventory();
        for (const [k, defVal] of Object.entries(defaults)) {
          if (!saved.inventory[k]) {
            saved.inventory[k] = { ...defVal };
          } else {
            if (saved.inventory[k].owned === undefined) {
              const inferredOwned = !!SOFTWARE_DEFINITIONS[k]?.starterOwned || Number(saved.inventory[k].versionInt || 0) > 10;
              saved.inventory[k].owned = inferredOwned;
              if (!inferredOwned) {
                saved.inventory[k].versionInt = 0;
                saved.inventory[k].runningVerInt = 0;
                saved.inventory[k].installed = false;
                saved.inventory[k].licensed = false;
              }
            }
            if (saved.inventory[k].runningVerInt === undefined) {
              saved.inventory[k].runningVerInt = saved.inventory[k].installed ? Number(saved.inventory[k].versionInt || 10) : 0;
            }
            if (saved.inventory[k].licensed === undefined) {
              saved.inventory[k].licensed = !!saved.inventory[k].owned;
            }
          }
        }
        if (!Array.isArray(saved.localHostileInfections)) saved.localHostileInfections = [];
        if (!Array.isArray(saved.remoteInfections)) saved.remoteInfections = [];
        if (typeof saved.customWebPage !== 'string') {
          saved.customWebPage = 'Gateway Operacional Privado // Acesso Restrito SSH Porta 22';
        }
        this.state = saved;
      } else {
        this.state = {
          inventory: this.buildStarterInventory(),
          localHostileInfections: [],
          remoteInfections: [],
          customWebPage: 'Gateway Operacional Privado // Acesso Restrito SSH Porta 22'
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

    getDefinition(softKey) {
      return SOFTWARE_DEFINITIONS[softKey] || null;
    }

    isSoftwareOwned(softKey) {
      this.ensureLoaded();
      const item = this.state.inventory[softKey];
      return !!(item && item.owned && item.versionInt > 0);
    }

    // REGRA REALISTA DE EXECUÇÃO:
    // Durante o tempo de carência (desligando/trocando/ligando), o programa está FORA DE OPERAÇÃO (retorna 0)!
    // E enquanto você não trocar para a versão mais nova do disco, vale a versão que está RODANDO na memória (runningVerInt)!
    getSoftwareVersion(softKey) {
      this.ensureLoaded();
      const item = this.state.inventory[softKey];
      if (!item || !item.owned || item.versionInt <= 0) return 0;
      if (SOFTWARE_DEFINITIONS[softKey]?.category === 'system') {
        if (!item.installed || this.isSoftwareInTransition(softKey)) return 0;
        return (item.runningVerInt || item.versionInt) / 10;
      }
      return item.versionInt / 10;
    }

    isSoftwareInstalled(softKey) {
      this.ensureLoaded();
      const item = this.state.inventory[softKey];
      if (this.isSoftwareInTransition(softKey)) return false;
      return !!(item && item.owned && item.installed);
    }

    isTorrentActive() {
      return this.isSoftwareInstalled('torrent');
    }

    isDdosBreakerActive() {
      return this.isSoftwareInstalled('ddos_breaker');
    }

    isPortScanActive() {
      return this.isSoftwareInstalled('portscan');
    }

    // Crescimento quadrático realista de Tamanho em Disco (MB) conforme a potência sobe (v1.0 -> v10.0)
    getItemSizeMb(softKey, versionInt) {
      const def = SOFTWARE_DEFINITIONS[softKey];
      if (!def) return 20;
      const v = Math.max(1, (versionInt || 10) / 10) - 1;
      return Math.round(def.baseMb * (1 + 0.16 * v + 0.24 * v * v));
    }

    // Consumo de RAM: para utilitários (no seu PC) e para vírus (no PC da vítima!)
    getItemRamMb(softKey, versionInt, forVictim = false) {
      const def = SOFTWARE_DEFINITIONS[softKey];
      if (!def) return 12;
      if (def.category === 'virus' && !forVictim) return 0;
      const v = Math.max(1, (versionInt || 10) / 10) - 1;
      return Math.round(def.baseRam * (1 + 0.14 * v + 0.20 * v * v));
    }

    getMaxRamMb() {
      if (!window.hardwareEngine) return 256;
      return window.hardwareEngine.getRam().ramMb || 256;
    }

    getMaxHddMb() {
      if (!window.hardwareEngine) return 350;
      return window.hardwareEngine.getHdd().hddMb || 350;
    }

    getPlayerNetMbps() {
      if (!window.hardwareEngine) return 1;
      return window.hardwareEngine.getNetwork().mbps || 1;
    }

    getPlayerCpuMhz() {
      if (!window.hardwareEngine) return 800;
      return window.hardwareEngine.getCpu().mhz || 800;
    }

    getUsedRamMb() {
      this.ensureLoaded();
      let sum = 0;
      for (const [k, st] of Object.entries(this.state.inventory)) {
        if (st.owned && st.installed && !this.isSoftwareInTransition(k) && SOFTWARE_DEFINITIONS[k]?.category === 'system') {
          sum += this.getItemRamMb(k, st.runningVerInt || st.versionInt, false);
        }
      }
      sum += (this.state.localHostileInfections || []).reduce((acc, inf) => acc + (inf.ramMb || 32), 0);
      return sum;
    }

    getUsedHddMb() {
      this.ensureLoaded();
      let sum = 0;
      for (const [k, st] of Object.entries(this.state.inventory)) {
        if (st.owned && st.versionInt > 0) {
          sum += this.getItemSizeMb(k, st.versionInt);
        }
      }
      sum += (this.state.localHostileInfections || []).reduce((acc, inf) => acc + (inf.hddMb || 18), 0);
      return sum;
    }

    getResearchCost(softKey) {
      this.ensureLoaded();
      const def = SOFTWARE_DEFINITIONS[softKey];
      const cur = this.state.inventory[softKey];
      if (!def || !cur) return 500;
      const v = Math.max(1, cur.versionInt / 10);
      return Math.round(220 * Math.pow(v, 2.25) * def.multCost);
    }

    getLicenseCost(softKey) {
      return Math.max(90, Math.round(this.getResearchCost(softKey) * 0.45));
    }

    buySoftwareLicense(softKey) {
      this.ensureLoaded();
      const def = SOFTWARE_DEFINITIONS[softKey];
      const cur = this.state.inventory[softKey];
      if (!def || !cur) return { success: false, message: 'Software inválido.' };
      if (!cur.owned || cur.versionInt <= 0) {
        return {
          success: false,
          code: 'NOT_OWNED',
          message: `Você ainda NÃO possui ${def.filename} no seu HD! Você não compra vírus/softwares do nada — baixe primeiro a versão básica em ${def.acquireHint || '109.64.200.10'}!`
        };
      }
      if (cur.licensed !== false) return { success: true, message: 'Este software já está licenciado no seu nome!' };

      const cost = this.getLicenseCost(softKey);
      if (!window.currentWallet || parseFloat(window.currentWallet.balance) < cost) {
        return {
          success: false,
          message: `Saldo insuficiente! A licença de código-fonte para pesquisar ${def.filename} (${this.fmtVer(cur.versionInt)}) custa $ ${cost.toLocaleString('pt-BR')} HC.`
        };
      }

      window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) - cost).toFixed(2);
      cur.licensed = true;
      this.save();
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('LICENSE-BUY', `Licença adquirida para ${def.filename} (${this.fmtVer(cur.versionInt)}) por -$ ${cost} HC — Pesquisa liberada!`, 'info');
      }
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
      return { success: true, message: `Licença de ${def.filename} registrada! Agora você pode evoluir este software.` };
    }

    async researchUpgrade(softKey) {
      this.ensureLoaded();
      const def = SOFTWARE_DEFINITIONS[softKey];
      const cur = this.state.inventory[softKey];
      if (!def || !cur) return { success: false, message: 'Software inválido.' };
      if (!cur.owned || cur.versionInt <= 0) {
        return {
          success: false,
          code: 'NOT_OWNED',
          message: `BLOQUEADO: Você não possui ${def.filename} no seu HD! Não é possível comprar qualquer vírus/ferramenta a qualquer hora — resolva e invada ${def.acquireHint || 'as máquinas de Puzzle (109.64.200.10+)'} para baixar o básico primeiro!`
        };
      }
      if (def.nonResearchable) {
        return { success: false, message: `${def.filename} possui versão única e não pode ser pesquisado (conforme manual oficial).` };
      }
      const maxVer = def.maxVerInt || 100;
      if (cur.versionInt >= maxVer) {
        return { success: false, message: `${def.filename} já atingiu sua potência máxima (${this.fmtVer(maxVer)})!` };
      }
      if (cur.licensed === false) {
        const licCost = this.getLicenseCost(softKey);
        return {
          success: false,
          code: 'LICENSE_REQUIRED',
          message: `LICENÇA NECESSÁRIA! Como você baixou/roubou ${def.filename} (${this.fmtVer(cur.versionInt)}) de outro servidor, compre primeiro a Licença ($ ${licCost.toLocaleString('pt-BR')} HC) antes de pesquisar versões maiores!`
        };
      }

      const cost = this.getResearchCost(softKey);
      if (!window.currentWallet || parseFloat(window.currentWallet.balance) < cost) {
        return { success: false, message: `Saldo insuficiente! Evoluir ${def.filename} custa $ ${cost.toLocaleString('pt-BR')} HC.` };
      }

      const stepVer = softKey === 'analyzer' ? 10 : 5;
      const nextVer = Math.min(maxVer, cur.versionInt + stepVer);
      const extraMb = this.getItemSizeMb(softKey, nextVer) - this.getItemSizeMb(softKey, cur.versionInt);
      if (this.getUsedHddMb() + extraMb > this.getMaxHddMb()) {
        return {
          success: false,
          message: `Armazenamento HDD cheio no seu PC (${this.getUsedHddMb() + extraMb} > ${this.getMaxHddMb()} MB)! Compre um HD/SSD maior na aba Hardware.`
        };
      }

      if (cur.installed && def.category === 'system') {
        const extraRam = this.getItemRamMb(softKey, nextVer, false) - this.getItemRamMb(softKey, cur.versionInt, false);
        if (this.getUsedRamMb() + extraRam > this.getMaxRamMb()) {
          return {
            success: false,
            message: `Memória RAM insuficiente no seu PC (${this.getUsedRamMb() + extraRam} > ${this.getMaxRamMb()} MB)! Desative algo ou compre mais RAM em Hardware.`
          };
        }
      }

      const isLocalDemo = String(window.currentProfile?.id || '').startsWith('local-');
      if (window.supabase && !isLocalDemo && typeof window.supabase.rpc === 'function') {
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
      cur.licensed = true;
      // REGRA REALISTA DE EXECUÇÃO NO PC:
      // Se este programa de sistema JÁ estava rodando na memória (ex: Escudo v1.0), ele NÃO duplica nem pula magicamente!
      // A versão antiga (runningVerInt) continua rodando até você desligá-la e ativar a nova após o tempo de carência!
      const needsSwap = def.category === 'system' && cur.installed && (cur.runningVerInt || 10) < nextVer;
      this.save();
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);

      if (window.currentProfile) {
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 35;
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('RESEARCH', `${def.friendlyTitle || def.filename} evoluído no disco para ${this.fmtVer(nextVer)} (-$ ${cost} HC)${needsSwap ? ' — troque a versão em uso para ativar!' : ''}`, 'success');
      }
      if (window.hackerAudio) window.hackerAudio.playCashChime();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
      return {
        success: true,
        newVersion: this.fmtVer(nextVer),
        needsSwap,
        runningVersion: cur.installed ? this.fmtVer(cur.runningVerInt || 10) : null,
        message: needsSwap
          ? `${def.friendlyTitle || def.filename} ${this.fmtVer(nextVer)} salvo no disco! Como já há o ${this.fmtVer(cur.runningVerInt || 10)} rodando (não pode ter 2 iguais!), clique em "🔄 Trocar Versão" e aguarde a carência!`
          : `${def.friendlyTitle || def.filename} compilado na potência ${this.fmtVer(nextVer)}!`
      };
    }

    notifyActionBlocked(msg, opts = {}) {
      if (opts && opts.silent) return;
      if (window.hackerAudio && typeof window.hackerAudio.playErrorBuzz === 'function') {
        window.hackerAudio.playErrorBuzz();
      }
      if (typeof window.showToast === 'function') {
        window.showToast(msg);
      }
    }

    // 1) Desligar programa que está rodando na memória -> entra em TEMPO DE CARÊNCIA antes de poder ligar outro!
    deactivateLocalSoftware(softKey, opts = {}) {
      this.ensureLoaded();
      const def = SOFTWARE_DEFINITIONS[softKey];
      const cur = this.state.inventory[softKey];
      if (!def || !cur || def.category !== 'system') return { success: false };

      const tr = this.getTransitionInfo(softKey);
      if (tr) {
        const msg = `Aguarde o tempo de carência atual (${tr.remainingSec}s restantes)!`;
        this.notifyActionBlocked(msg, opts);
        return { success: false, code: 'IN_COOLDOWN', remainingSec: tr.remainingSec, message: msg };
      }

      if (!cur.installed) {
        return { success: false, code: 'ALREADY_OFF', message: `${def.friendlyTitle || def.filename} já está desligado.` };
      }

      const prevVer = cur.runningVerInt || cur.versionInt;
      cur.installed = false;
      cur.runningVerInt = 0;
      this.save();
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);

      if (opts.instant) {
        this.renderUI();
        return { success: true, installed: false, cooldownSec: 0 };
      }

      const durMs = opts.durationMs || this.getGraceDurationMs(3200);
      const now = Date.now();
      this.transitions[softKey] = {
        mode: 'cooldown_off',
        fromVerInt: prevVer,
        toVerInt: 0,
        startedAt: now,
        endsAt: now + durMs,
        durationMs: durMs
      };

      const sec = +(durMs / 1000).toFixed(1);
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('RAM-STOP', `${def.friendlyTitle || def.filename} (${this.fmtVer(prevVer)}) desligado — tempo de carência de ${sec}s iniciado.`, 'warning');
      }
      if (!opts.silent && typeof window.showToast === 'function') {
        window.showToast(`${def.friendlyTitle || def.filename} desligado! Aguarde ${sec}s de carência antes de ligar outra versão.`);
      }
      this.renderUI();
      return { success: true, installed: false, cooldownSec: sec };
    }

    // 2) Ligar programa na memória -> PROIBIDO ligar 2 iguais ao mesmo tempo + exige fim da carência + tempo de inicialização!
    activateLocalSoftware(softKey, opts = {}) {
      this.ensureLoaded();
      const def = SOFTWARE_DEFINITIONS[softKey];
      const cur = this.state.inventory[softKey];
      if (!def || !cur || def.category !== 'system') return { success: false };

      if (!cur.owned || cur.versionInt <= 0) {
        const msg = `Você ainda não possui ${def.friendlyTitle || def.filename} no seu PC! Baixe primeiro em ${def.acquireHint || '109.64.200.10 / 33.8.2.71'}.`;
        this.notifyActionBlocked(msg, opts);
        return { success: false, code: 'NOT_OWNED', message: msg };
      }

      // REGRA DE EXCLUSIVIDADE: Nunca podem rodar 2 Firewalls (ou 2 programas do mesmo tipo) juntos!
      if (cur.installed && !this.isSoftwareInTransition(softKey)) {
        const runVerStr = this.fmtVer(cur.runningVerInt || cur.versionInt);
        const diskVerStr = this.fmtVer(cur.versionInt);
        const msg = cur.versionInt > (cur.runningVerInt || cur.versionInt)
          ? `PROIBIDO RODAR DOIS DO MESMO TIPO! Seu ${def.friendlyTitle || def.filename} (${runVerStr}) ainda está rodando no PC. Desligue o ${runVerStr} e aguarde a carência (ou clique em "🔄 Trocar p/ ${diskVerStr}")!`
          : `${def.friendlyTitle || def.filename} (${runVerStr}) já está rodando na memória! Não é permitido abrir dois ao mesmo tempo.`;
        this.notifyActionBlocked(msg, opts);
        return { success: false, code: 'ALREADY_RUNNING_SAME_TYPE', message: msg };
      }

      // REGRA DO TEMPO DE CARÊNCIA: Não pode religar enquanto o encerramento ou troca anterior não terminar!
      const tr = this.getTransitionInfo(softKey);
      if (tr) {
        const msg = `TEMPO DE CARÊNCIA ATIVO! Aguarde mais ${tr.remainingSec}s para o sistema liberar o slot antes de ligar ${def.friendlyTitle || def.filename} (${this.fmtVer(cur.versionInt)}).`;
        this.notifyActionBlocked(msg, opts);
        return { success: false, code: 'IN_COOLDOWN', remainingSec: tr.remainingSec, message: msg };
      }

      const neededRam = this.getItemRamMb(softKey, cur.versionInt, false);
      if (this.getUsedRamMb() + neededRam > this.getMaxRamMb()) {
        const msg = `Memória RAM cheia (${this.getUsedRamMb()}/${this.getMaxRamMb()} MB)! Desligue algum programa ou compre mais Memória em "Melhorar Peças do PC".`;
        this.notifyActionBlocked(msg, opts);
        return { success: false, code: 'RAM_FULL', message: msg };
      }

      if (opts.instant) {
        cur.installed = true;
        cur.runningVerInt = cur.versionInt;
        this.save();
        if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
        this.renderUI();
        return { success: true, installed: true, bootSec: 0 };
      }

      const durMs = opts.durationMs || this.getGraceDurationMs(2800);
      const now = Date.now();
      this.transitions[softKey] = {
        mode: 'booting',
        fromVerInt: 0,
        toVerInt: cur.versionInt,
        startedAt: now,
        endsAt: now + durMs,
        durationMs: durMs
      };

      const sec = +(durMs / 1000).toFixed(1);
      if (window.taskManager) {
        window.taskManager.enqueue({
          dedupeKey: `boot_local_${softKey}`,
          title: `Ativar ${def.friendlyTitle || def.filename} (${this.fmtVer(cur.versionInt)})`,
          subtitle: `Carência de Inicialização · ${neededRam} MB RAM`,
          targetIp: 'localhost',
          queueKind: 'cpu',
          category: 'Sistema',
          idealSeconds: sec
        });
      }
      if (!opts.silent && typeof window.showToast === 'function') {
        window.showToast(`Iniciando ${def.friendlyTitle || def.filename} (${this.fmtVer(cur.versionInt)}) — ativo em ${sec}s...`);
      }
      this.renderUI();
      return { success: true, booting: true, bootSec: sec };
    }

    // 3) Trocar da versão antiga p/ a versão mais forte do disco (Desliga o antigo NA HORA -> PC fica sem ele durante a carência -> Liga o novo!)
    swapToLatestVersion(softKey, opts = {}) {
      this.ensureLoaded();
      const def = SOFTWARE_DEFINITIONS[softKey];
      const cur = this.state.inventory[softKey];
      if (!def || !cur || def.category !== 'system' || !cur.owned) return { success: false };

      const tr = this.getTransitionInfo(softKey);
      if (tr) {
        const msg = `Já existe uma transição em andamento (${tr.remainingSec}s restantes)!`;
        this.notifyActionBlocked(msg, opts);
        return { success: false, code: 'IN_COOLDOWN', remainingSec: tr.remainingSec, message: msg };
      }

      const oldVer = cur.installed ? (cur.runningVerInt || 10) : 0;
      const targetVer = cur.versionInt;
      if (cur.installed && oldVer >= targetVer) {
        return { success: false, code: 'ALREADY_LATEST', message: 'A versão mais forte já está em uso!' };
      }

      const oldRam = cur.installed ? this.getItemRamMb(softKey, oldVer, false) : 0;
      const newRam = this.getItemRamMb(softKey, targetVer, false);
      if (this.getUsedRamMb() - oldRam + newRam > this.getMaxRamMb()) {
        const msg = `Memória insuficiente para subir a versão ${this.fmtVer(targetVer)} (precisa de ${newRam} MB)!`;
        this.notifyActionBlocked(msg, opts);
        return { success: false, code: 'RAM_FULL', message: msg };
      }

      // Desliga o antigo imediatamente (deixando a máquina temporariamente vulnerável durante a carência!)
      cur.installed = false;
      cur.runningVerInt = 0;
      this.save();

      const durMs = opts.durationMs || this.getGraceDurationMs(4200);
      const now = Date.now();
      this.transitions[softKey] = {
        mode: 'swapping',
        fromVerInt: oldVer,
        toVerInt: targetVer,
        startedAt: now,
        endsAt: now + durMs,
        durationMs: durMs
      };

      const sec = +(durMs / 1000).toFixed(1);
      if (window.taskManager) {
        window.taskManager.enqueue({
          dedupeKey: `swap_local_${softKey}`,
          title: `Trocar ${def.friendlyTitle || def.filename} (${this.fmtVer(oldVer)} → ${this.fmtVer(targetVer)})`,
          subtitle: `Tempo de carência (${sec}s sem ${def.filename} ativo!)`,
          targetIp: 'localhost',
          queueKind: 'cpu',
          category: 'Sistema',
          idealSeconds: sec
        });
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('RAM-SWAP', `Trocando ${def.friendlyTitle || def.filename} (${this.fmtVer(oldVer)} → ${this.fmtVer(targetVer)}): carência de ${sec}s (proteção temporariamente desligada!).`, 'warning');
      }
      if (!opts.silent && typeof window.showToast === 'function') {
        window.showToast(`Desligando ${this.fmtVer(oldVer)} e subindo ${this.fmtVer(targetVer)}... Aguarde ${sec}s de carência!`);
      }
      this.renderUI();
      return { success: true, swapping: true, cooldownSec: sec, fromVer: this.fmtVer(oldVer), toVer: this.fmtVer(targetVer) };
    }

    toggleLocalInstall(softKey, opts = {}) {
      this.ensureLoaded();
      const cur = this.state.inventory[softKey];
      if (!cur) return { success: false };
      if (cur.installed) {
        return this.deactivateLocalSoftware(softKey, opts);
      }
      return this.activateLocalSoftware(softKey, opts);
    }

    infectLocalPc(malwareId, label, versionInt = 15, attackerIp = 'desconhecido', hiddenWithVer = 0, attackerUserId = null) {
      this.ensureLoaded();
      const ramDrain = Math.round(24 * (versionInt / 10));
      const hddDrain = Math.round(18 * (versionInt / 10));
      const cleanHidden = Number(hiddenWithVer || 0);
      this.state.localHostileInfections.push({
        id: Date.now() + Math.floor(Math.random() * 999),
        malwareId,
        label,
        versionInt: Number(versionInt || 15),
        ramMb: ramDrain,
        hddMb: hddDrain,
        attackerIp,
        attackerUserId: attackerUserId || null,
        hiddenWithVer: cleanHidden,
        revealed: cleanHidden <= 0,
        at: new Date().toLocaleTimeString()
      });
      this.save();
      if (window.winManager && window.winManager.current === 'winSoftware') {
        this.renderUI();
      }
    }

    // Revelar malwares ocultos no seu próprio PC usando Seeker.skr >= Hider usado pelo invasor!
    runLocalSeekerScan() {
      this.ensureLoaded();
      const mySeekerVer = window.stealthXhdEngine ? window.stealthXhdEngine.getSeekerVer() : 1.0;
      let revealedNow = 0;
      let stillHidden = 0;

      (this.state.localHostileInfections || []).forEach((inf) => {
        if (!inf.revealed && (inf.hiddenWithVer || 0) > 0) {
          if (mySeekerVer >= inf.hiddenWithVer) {
            inf.revealed = true;
            revealedNow++;
          } else {
            stillHidden++;
          }
        }
      });

      this.save();
      if (revealedNow > 0 && typeof window.addLocalLog === 'function') {
        window.addLocalLog('SEEKER-LOCAL', `Seeker.skr (v${mySeekerVer.toFixed(1)}) desmascarou ${revealedNow} malware(s) oculto(s) no localhost!`, 'success');
      }
      const msg = stillHidden > 0
        ? `Seeker.skr (v${mySeekerVer.toFixed(1)}): ${revealedNow} ameaça(s) revelada(s), mas ${stillHidden} malware(s) continua(m) oculto(s) por Hider superior! Evolua seu Seeker.skr ou Formate o HD.`
        : (revealedNow > 0
            ? `Seeker.skr (v${mySeekerVer.toFixed(1)}) revelou ${revealedNow} malware(s) oculto(s)! Agora use o Antivirus.av para expurgá-los.`
            : `Seeker.skr (v${mySeekerVer.toFixed(1)}): nenhum processo oculto pendente no localhost.`);
      if (typeof window.showToast === 'function') window.showToast(msg);
      this.renderUI();
      return { revealedNow, stillHidden, mySeekerVer, message: msg };
    }

    // REGRA ESTRITA DO JOGO DE REFERÊNCIA: Antivirus.av SÓ limpa vírus VISÍVEIS com versão <= Antivirus.av!
    runLocalAntivirus() {
      this.ensureLoaded();
      const av = this.state.inventory.antivirus;
      if (!av || !av.owned || av.versionInt <= 0) {
        const msg = 'Você ainda NÃO possui o Antivirus.av no seu HD! Baixe o Antivirus.av v1.0 grátis no Download Center (33.8.2.71) ou o v1.5 no Enigma #4 (109.64.200.48) — ou use Formatar HD!';
        alert(msg);
        return { success: false, code: 'AV_NOT_OWNED', cleaned: 0, remaining: this.state.localHostileInfections.length, message: msg };
      }
      if (!av.installed || this.isSoftwareInTransition('antivirus')) {
        const tr = this.getTransitionInfo('antivirus');
        const msg = tr
          ? `Aguarde mais ${tr.remainingSec}s: seu Antivírus ainda está em tempo de carência!`
          : 'Seu Antivírus está DESLIGADO! Clique em "Ligar na Memória" na lista de programas e aguarde os segundos de inicialização.';
        alert(msg);
        return { success: false, code: 'AV_NOT_INSTALLED', cleaned: 0, remaining: this.state.localHostileInfections.length, message: msg };
      }

      const avVer = av.runningVerInt || av.versionInt;
      const before = this.state.localHostileInfections.length;
      if (before === 0) {
        const okMsg = `Varredura Antivirus.av (${this.fmtVer(avVer)}): 0 ameaças encontradas no seu PC.`;
        if (typeof window.showToast === 'function') window.showToast(okMsg);
        return { success: true, cleaned: 0, remaining: 0, blockedTooStrong: 0, blockedHidden: 0, message: okMsg };
      }

      const kept = [];
      const purgedList = [];
      let cleaned = 0;
      let blockedTooStrong = 0;
      let blockedHidden = 0;

      this.state.localHostileInfections.forEach((inf) => {
        const isHidden = !inf.revealed && (inf.hiddenWithVer || 0) > 0;
        if (isHidden) {
          blockedHidden++;
          kept.push(inf);
        } else if (inf.versionInt > avVer) {
          blockedTooStrong++;
          kept.push(inf);
        } else {
          cleaned++;
          purgedList.push(inf);
        }
      });

      this.state.localHostileInfections = kept;
      this.save();
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);

      // Notificar atacantes humanos via PvP quando o Antivirus.av expurga o vírus deles (como Process.class.php linha 2511)!
      if (window.onlineEngine && window.networkIdentity) {
        const myIp = window.networkIdentity.getPublicIp();
        purgedList.forEach((pInf) => {
          if (pInf.attackerUserId || (pInf.attackerIp && pInf.attackerIp !== 'desconhecido')) {
            window.onlineEngine.sendPvpPacket({
              kind: 'PVP_AV_PURGED',
              visibleIp: myIp,
              targetUserId: pInf.attackerUserId || null,
              targetIp: pInf.attackerIp || null,
              d: { victimIp: myIp, fn: pInf.label, avVer }
            });
          }
        });
      }

      if (cleaned > 0) {
        if (window.currentProfile) window.currentProfile.reputation = (window.currentProfile.reputation || 0) + (cleaned * 10);
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('AV-CLEAN', `Antivirus.av (${this.fmtVer(avVer)}) expurgou ${cleaned} malware(s) visíveis <= ${this.fmtVer(avVer)} (+${cleaned * 10} REP)`, 'success');
        }
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      }

      let resultMsg = '';
      if (kept.length === 0) {
        resultMsg = `Antivirus.av (${this.fmtVer(avVer)}) limpou ${cleaned} ameaça(s)! Seu PC está 100% limpo.`;
      } else {
        const parts = [];
        if (blockedTooStrong > 0) {
          const maxNeed = Math.max(...kept.filter((x) => x.revealed || !x.hiddenWithVer).map((x) => x.versionInt), avVer + 5);
          parts.push(`${blockedTooStrong} vírus mais forte(s) que seu Antivirus.av (${this.fmtVer(avVer)}) — evolua seu Antivirus.av para >= ${this.fmtVer(maxNeed)} ou Formate o HD!`);
        }
        if (blockedHidden > 0) {
          parts.push(`${blockedHidden} malware(s) oculto(s) por Hider — rode seu Seeker.skr primeiro!`);
        }
        resultMsg = `Varredura concluída (${cleaned} removido(s)): FALHA AO REMOVER ${kept.length} ameaça(s) — ${parts.join(' | ')}`;
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('AV-BLOCKED', resultMsg, 'danger');
        }
      }

      if (typeof window.showToast === 'function') window.showToast(resultMsg);
      this.renderUI();
      return {
        success: kept.length === 0,
        cleaned,
        remaining: kept.length,
        blockedTooStrong,
        blockedHidden,
        myAvVer: this.fmtVer(avVer),
        message: resultMsg
      };
    }

    // ÚLTIMO RECURSO NUCLEAR (Action 10 - Format HD): Formata o HD interno eliminando QUALQUER vírus (até v10.0 ou oculto),
    // voltando os programas do HD interno para v1.0, mas PRESERVANDO 100% dos seus backups no HD Externo (XHD)!
    formatLocalHardDrive(skipConfirm = false) {
      this.ensureLoaded();
      if (!skipConfirm) {
        const ok = window.confirm(
          'FORMATAR DISCO RÍGIDO (EMERGÊNCIA):\n\nIsso apagará IMEDIATAMENTE 100% dos vírus e malwares instalados na sua máquina (inclusive vírus ocultos ou mais fortes que seu Antivirus.av!).\n\nPorém, todos os programas do seu HD interno voltarão para v1.0 (os backups salvos no seu HD Externo XHD permanecerão 100% intactos para restauração).\n\nDeseja formatar seu HD agora?'
        );
        if (!ok) return { success: false, cancelled: true };
      }

      const executeFormat = () => {
        const wipedCount = (this.state.localHostileInfections || []).length;
        const purgedCopy = [...(this.state.localHostileInfections || [])];
        this.state.localHostileInfections = [];
        this.state.inventory = this.buildStarterInventory();
        this.save();

        if (window.onlineEngine && window.networkIdentity) {
          const myIp = window.networkIdentity.getPublicIp();
          purgedCopy.forEach((pInf) => {
            if (pInf.attackerUserId || (pInf.attackerIp && pInf.attackerIp !== 'desconhecido')) {
              window.onlineEngine.sendPvpPacket({
                kind: 'PVP_AV_PURGED',
                visibleIp: myIp,
                targetUserId: pInf.attackerUserId || null,
                targetIp: pInf.attackerIp || null,
                d: { victimIp: myIp, fn: pInf.label, avVer: 999 }
              });
            }
          });
          window.onlineEngine.scheduleSave(false);
        }

        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('FORMAT-HD', `Disco rígido formatado! ${wipedCount} malware(s) erradicado(s). Sistema restaurado p/ imagem limpa v1.0 (Backups XHD preservados).`, 'warning');
        }
        if (typeof window.showToast === 'function') {
          window.showToast(`HD formatado com sucesso! ${wipedCount} vírus eliminado(s). Restaure seus backups na aba XHD!`);
        }
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
        this.renderUI();
        return { success: true, wipedCount };
      };

      if (skipConfirm || !window.taskManager) {
        return executeFormat();
      }

      const cpuMhz = this.getPlayerCpuMhz();
      const idealSec = Math.max(2.0, Math.min(6.0, +(4800 / Math.max(800, cpuMhz)).toFixed(1)));
      const enq = window.taskManager.enqueue({
        dedupeKey: 'format_local_hdd',
        title: 'Formatar Disco Rígido (localhost)',
        subtitle: 'Wipe de partição & reinstalação limpa do Kernel v1.0',
        targetIp: 'localhost',
        queueKind: 'cpu',
        category: 'Sistema',
        idealSeconds: idealSec,
        onComplete: executeFormat
      });
      if (!enq.started) return executeFormat();
      if (typeof window.showToast === 'function') {
        window.showToast(`Formatação do HD iniciada no Task Manager (~${idealSec}s)...`);
      }
      return { success: true, queued: true, pid: enq.process.pid };
    }

    runLocalNmapScan() {
      this.ensureLoaded();
      const nm = this.state.inventory.nmap;
      if (!nm || !nm.installed) {
        const msg = 'Ative seu Nmap.nmap na RAM antes de escanear conexões ativas!';
        alert(msg);
        return { success: false, message: msg };
      }
      const myNmapVer = nm.versionInt / 10;
      const found = [];

      // Verificar infecções locais e conexões recentes em que o Firewall do invasor <= seu Nmap (somente se o IP real não foi apagado!)
      (this.state.localHostileInfections || []).forEach((inf) => {
        const rawIp = String(inf.attackerIp || '');
        const isValidIpv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(rawIp);
        if (isValidIpv4) {
          const h = window.internetEngine ? window.internetEngine.resolveHost(rawIp) : null;
          const fwl = (h && h.firewallVer) || 1.0;
          if (myNmapVer >= fwl && !found.some((x) => x.ip === rawIp)) {
            found.push({ ip: rawIp, role: `Backdoor ${inf.label}`, fwl });
          }
        }
      });

      if (window.onlineEngine) {
        window.onlineEngine.getOnlineHumansList().slice(0, 4).forEach((hp) => {
          const fwl = Number(hp.firewallVer || 1.0);
          if (myNmapVer >= fwl && !found.some((x) => x.ip === hp.publicIp)) {
            found.push({ ip: hp.publicIp, role: `Operador Online (${hp.hackerTag})`, fwl });
          }
        });
      }

      this.lastNmapReport = {
        at: new Date().toLocaleTimeString(),
        nmapVer: myNmapVer.toFixed(1),
        found
      };
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('NMAP-SCAN', `Nmap.nmap (v${myNmapVer.toFixed(1)}) varreu a sub-rede e detectou ${found.length} IP(s) visíveis.`, 'info');
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`Nmap.nmap v${myNmapVer.toFixed(1)}: ${found.length} conexão(ões) ativa(s) mapeada(s)!`);
      }
      this.renderUI();
      return { success: true, found };
    }

    saveLocalWebServerPage(textRaw) {
      this.ensureLoaded();
      if (!this.isSoftwareInstalled('webserver')) {
        const msg = 'Instale/Ative primeiro o WebServer.exe na sua RAM para publicar sua página HTTP!';
        alert(msg);
        return { success: false, message: msg };
      }
      this.state.customWebPage = String(textRaw || '').trim().slice(0, 280) || 'Servidor HTTP Online.';
      this.save();
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
      if (typeof window.showToast === 'function') window.showToast('Página HTTP pública (WebServer.exe) atualizada!');
      this.renderUI();
      return { success: true };
    }

    // =========================================================================
    // FÍSICA REMOTA DA VÍTIMA: DISCO LIVRE, RAM LIVRE, INTERNET & ANTIVÍRUS!
    // =========================================================================
    inspectRemoteHostResources(host) {
      this.ensureLoaded();
      const hddTotalMb = host.hddTotalMb || (host.tier === 3 ? 4096 : (host.tier === 2 ? 768 : 220));
      const ramTotalMb = host.ramTotalMb || (host.tier === 3 ? 2048 : (host.tier === 2 ? 512 : 128));
      const cpuMhz = host.cpuMhz || (host.tier === 3 ? 8000 : (host.tier === 2 ? 2800 : 650));
      const netMbps = host.netMbps || (host.tier === 3 ? 500 : (host.tier === 2 ? 50 : 4));
      const antivirusVer = host.antivirusVer !== undefined ? host.antivirusVer : (host.tier === 3 ? 3.0 : (host.tier === 2 ? 1.5 : 1.0));

      // Uso base do sistema operacional + arquivos em /root (deletar arquivos libera espaço real!)
      const osBaseHdd = host.hddOsBaseMb || Math.round(hddTotalMb * 0.52);
      const osBaseRam = host.ramOsBaseMb || Math.round(ramTotalMb * 0.50);
      const deletedBytesBonusMb = (window.internetEngine && window.internetEngine.deletedHostFileMb)
        ? (window.internetEngine.deletedHostFileMb.get(host.ip) || 0)
        : 0;
      const filesMb = Math.max(0, ((host.files || []).reduce((s, f) => s + (f.sizeMb || 18), 0)) - deletedBytesBonusMb);

      const virusesHere = this.getRemoteVirusesOnIp(host.ip);
      const virusesHddMb = virusesHere.reduce((s, v) => s + this.getItemSizeMb(v.virusKey, v.versionInt), 0);
      const virusesRamMb = virusesHere.reduce((s, v) => s + this.getItemRamMb(v.virusKey, v.versionInt, true), 0);

      const hddUsedMb = Math.min(hddTotalMb, osBaseHdd + filesMb + virusesHddMb);
      const ramUsedMb = Math.min(ramTotalMb, osBaseRam + virusesRamMb);

      return {
        cpuMhz,
        netMbps,
        antivirusVer,
        hddTotalMb,
        hddUsedMb,
        hddFreeMb: Math.max(0, hddTotalMb - hddUsedMb),
        ramTotalMb,
        ramUsedMb,
        ramFreeMb: Math.max(0, ramTotalMb - ramUsedMb),
        virusesCount: virusesHere.length
      };
    }

    calculateUploadTransfer(host, virusKey) {
      this.ensureLoaded();
      const inv = this.state.inventory[virusKey] || { versionInt: 10 };
      const sizeMb = this.getItemSizeMb(virusKey, inv.versionInt);
      const ramNeededMb = this.getItemRamMb(virusKey, inv.versionInt, true);
      const specs = this.inspectRemoteHostResources(host);
      const myMbps = this.getPlayerNetMbps();

      // Gargalo real entre seu Upload (myMbps) e o Download da vítima (specs.netMbps)
      const bottleneckMbps = Math.min(myMbps, specs.netMbps * 1.2);
      const effectiveMBps = Math.max(0.22, +(bottleneckMbps / 4.5).toFixed(2));
      const durationSec = Math.max(0.6, Math.min(16, +(sizeMb / (effectiveMBps * 8)).toFixed(1)));

      const potency = inv.versionInt / 10;
      const stealthVsAv = specs.antivirusVer <= 0 || potency > specs.antivirusVer;

      return {
        sizeMb,
        ramNeededMb,
        myMbps,
        targetMbps: specs.netMbps,
        effectiveMBps,
        durationSec,
        fitsHdd: sizeMb <= specs.hddFreeMb,
        fitsRam: ramNeededMb <= specs.ramFreeMb,
        stealthVsAv,
        targetAvVer: specs.antivirusVer,
        specs
      };
    }

    getVirusCatalogOptions(targetHost = null) {
      this.ensureLoaded();
      return ['vspam', 'vwarez', 'vminer', 'vbank', 'vddos']
        .filter((k) => this.isSoftwareOwned(k))
        .map((k) => {
          const def = SOFTWARE_DEFINITIONS[k];
          const st = this.state.inventory[k] || { versionInt: 10 };
          const sizeMb = this.getItemSizeMb(k, st.versionInt);
          const ramMb = this.getItemRamMb(k, st.versionInt, true);
          let extra = `Disco:${sizeMb}MB · RAM:${ramMb}MB`;
          if (targetHost) {
            const tr = this.calculateUploadTransfer(targetHost, k);
            const fitTag = (!tr.fitsHdd || !tr.fitsRam) ? ' [NÃO CABE NO ALVO]' : (tr.stealthVsAv ? ' [FUD/INVISÍVEL]' : ` [RISCO AV v${tr.targetAvVer.toFixed(1)}]`);
            extra = `${sizeMb}MB HDD · ${ramMb}MB RAM · ~${tr.durationSec}s${fitTag}`;
          }
          return {
            key: k,
            filename: def.filename,
            versionInt: st.versionInt,
            versionStr: this.fmtVer(st.versionInt),
            sizeMb,
            ramMb,
            badge: def.badge,
            extraLabel: extra
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
      if (!def || def.category !== 'virus' || !inv || !inv.owned || inv.versionInt <= 0) {
        return {
          success: false,
          code: 'VIRUS_NOT_OWNED',
          message: `Você ainda NÃO possui ${def ? def.filename : 'este vírus'} no seu HD! Resolva e invada as máquinas de Puzzle (${def?.acquireIp || '109.64.200.10'}) para baixar os vírus básicos primeiro!`
        };
      }

      if (virusKey === 'vminer' && window.bitcoinEngine) {
        window.bitcoinEngine.ensureLoaded();
      }

      const existing = this.state.remoteInfections.find((v) => v.targetIp === host.ip && v.virusKey === virusKey);
      const specs = this.inspectRemoteHostResources(host);
      const newSizeMb = this.getItemSizeMb(virusKey, inv.versionInt);
      const newRamMb = this.getItemRamMb(virusKey, inv.versionInt, true);

      const oldSizeMb = existing ? this.getItemSizeMb(virusKey, existing.versionInt) : 0;
      const oldRamMb = existing ? this.getItemRamMb(virusKey, existing.versionInt, true) : 0;

      if (existing && existing.versionInt >= inv.versionInt) {
        return {
          success: false,
          code: 'ALREADY_INSTALLED',
          message: `${def.filename} (${this.fmtVer(existing.versionInt)}) já está rodando em ${host.ip}! Pesquise uma potência maior primeiro.`
        };
      }

      // 1) Checagem Física de Armazenamento (HDD) no PC da Vítima!
      if (newSizeMb - oldSizeMb > specs.hddFreeMb) {
        return {
          success: false,
          code: 'TARGET_HDD_FULL',
          message: `ARMAZENAMENTO INSUFICIENTE NO ALVO! Seu ${def.filename} (${this.fmtVer(inv.versionInt)}) ocupa ${newSizeMb} MB, mas ${host.hostname} [${host.ip}] só tem ${specs.hddFreeMb + oldSizeMb} MB livres em disco! Apague arquivos em /root do alvo ou invada um servidor com HD maior.`
        };
      }

      // 2) Checagem Física de Memória RAM Livre no PC da Vítima!
      if (newRamMb - oldRamMb > specs.ramFreeMb) {
        return {
          success: false,
          code: 'TARGET_RAM_FULL',
          message: `MEMÓRIA RAM INSUFICIENTE NO ALVO! Seu ${def.filename} (${this.fmtVer(inv.versionInt)}) exige ${newRamMb} MB de RAM, mas ${host.ip} só tem ${specs.ramFreeMb + oldRamMb} MB livres (${specs.ramUsedMb}/${specs.ramTotalMb} MB em uso)!`
        };
      }

      if (existing) {
        existing.versionInt = inv.versionInt;
        existing.sizeMb = newSizeMb;
        existing.ramMb = newRamMb;
      } else {
        this.state.remoteInfections.unshift({
          id: Date.now() + Math.floor(Math.random() * 1000),
          targetIp: host.ip,
          targetHostname: host.hostname,
          targetKind: host.kind,
          targetTier: host.tier || 1,
          targetCpuMhz: specs.cpuMhz,
          targetNetMbps: specs.netMbps,
          targetAvVer: specs.antivirusVer,
          virusKey,
          filename: def.filename,
          versionInt: inv.versionInt,
          sizeMb: newSizeMb,
          ramMb: newRamMb,
          installedAt: new Date().toLocaleString('pt-BR'),
          accumulatedCash: 0,
          accumulatedSats: 0
        });
      }
      this.save();

      const visibleIp = window.bounceEngine
        ? window.bounceEngine.routeConnectionAndGetVisibleIp(host.ip).visibleIp
        : (window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0');
      window.internetEngine.appendServerLog(
        host.ip,
        `${visibleIp} uploaded (${newSizeMb}MB) and executed ${def.filename} (${this.fmtVer(inv.versionInt)})`
      );
      if (host.isRealHuman && window.onlineEngine) {
        const myCrc = this.getSoftwareVersion('cracker');
        const myExp = Math.max(this.getSoftwareVersion('exploit_ssh'), this.getSoftwareVersion('exploit_ftp'));
        window.onlineEngine.sendPvpPacket({
          kind: 'PVP_VIRUS_PLANT',
          visibleIp,
          targetUserId: host.humanUserId,
          targetTag: host.humanTag,
          targetIp: host.ip,
          d: {
            fn: def.filename,
            ver: inv.versionInt,
            hiddenWithVer: 0,
            crcVer: myCrc,
            expVer: myExp
          }
        });
      }
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('VIRUS-DEPLOY', `${def.filename} (${this.fmtVer(inv.versionInt)}, ${newSizeMb}MB) instalado em ${host.hostname} [${host.ip}]`, 'warning');
      }
      if (window.currentProfile) {
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 12;
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      }
      if (window.hackerAudio) window.hackerAudio.playMalwareInstalled();

      const avWarn = specs.antivirusVer > 0 && (inv.versionInt / 10) <= specs.antivirusVer
        ? ` CUIDADO: O alvo possui Antivirus.av v${specs.antivirusVer.toFixed(1)} e pode expurgar este vírus na próxima varredura!`
        : '';

      return {
        success: true,
        sizeMb: newSizeMb,
        ramMb: newRamMb,
        message: `${def.filename} (${this.fmtVer(inv.versionInt)}) ativo em ${host.ip}!${avWarn}`
      };
    }

    // Upload assíncrono com barra de progresso real governada pela velocidade da sua Internet vs Internet do alvo!
    uploadVirusWithBandwidth(host, virusKey, onDone) {
      this.ensureLoaded();
      if (this.activeUploadJob) {
        return { started: false, message: 'Já existe um upload de vírus em andamento na sua conexão!' };
      }
      const def = SOFTWARE_DEFINITIONS[virusKey];
      const invCheck = this.state.inventory[virusKey];
      if (!def || !invCheck || !invCheck.owned || invCheck.versionInt <= 0) {
        return {
          started: false,
          code: 'VIRUS_NOT_OWNED',
          message: `Você ainda NÃO possui ${def ? def.filename : 'este vírus'} no seu HD! Baixe os vírus básicos resolvendo e invadindo as máquinas de Puzzle (${def?.acquireIp || '109.64.200.10'})!`
        };
      }
      const tr = this.calculateUploadTransfer(host, virusKey);

      // Validar espaço ANTES de gastar banda subindo o arquivo!
      const existing = this.state.remoteInfections.find((v) => v.targetIp === host.ip && v.virusKey === virusKey);
      const oldSize = existing ? this.getItemSizeMb(virusKey, existing.versionInt) : 0;
      const oldRam = existing ? this.getItemRamMb(virusKey, existing.versionInt, true) : 0;
      if (existing && existing.versionInt >= (this.state.inventory[virusKey]?.versionInt || 10)) {
        return { started: false, message: `${def.filename} já está instalado nesta potência em ${host.ip}!` };
      }
      if (tr.sizeMb - oldSize > tr.specs.hddFreeMb) {
        return {
          started: false,
          code: 'TARGET_HDD_FULL',
          message: `Não cabe no HD de ${host.ip}! Precisa de ${tr.sizeMb} MB, livre: ${tr.specs.hddFreeMb + oldSize} MB (apague arquivos em /root do alvo ou escolha máquina maior).`
        };
      }
      if (tr.ramNeededMb - oldRam > tr.specs.ramFreeMb) {
        return {
          started: false,
          code: 'TARGET_RAM_FULL',
          message: `Memória RAM insuficiente no alvo! Precisa de ${tr.ramNeededMb} MB livres, disponível: ${tr.specs.ramFreeMb + oldRam} MB.`
        };
      }

      const steps = Math.max(3, Math.round(tr.durationSec / 0.25));
      let curStep = 0;
      this.activeUploadJob = {
        targetIp: host.ip,
        virusKey,
        filename: def.filename,
        sizeMb: tr.sizeMb,
        myMbps: tr.myMbps,
        targetMbps: tr.targetMbps,
        durationSec: tr.durationSec,
        pct: 5
      };
      if (window.internetEngine) window.internetEngine.render();

      const timer = setInterval(() => {
        // Se desconectou do SSH no meio do upload, aborta a transferência!
        if (!window.internetEngine || window.internetEngine.activeSshIp !== host.ip) {
          clearInterval(timer);
          this.activeUploadJob = null;
          if (typeof window.showToast === 'function') window.showToast('Upload abortado: conexão SSH encerrada antes do término!');
          return;
        }
        curStep++;
        const pct = Math.min(100, Math.round((curStep / steps) * 100));
        if (this.activeUploadJob) this.activeUploadJob.pct = pct;
        const fillEl = document.getElementById('sshVirusUploadBarFill');
        const lblEl = document.getElementById('sshVirusUploadPctLbl');
        if (fillEl) fillEl.style.width = pct + '%';
        if (lblEl) lblEl.textContent = `${pct}% (${tr.sizeMb} MB @ ${tr.myMbps} Mbps)`;

        if (pct >= 100) {
          clearInterval(timer);
          this.activeUploadJob = null;
          const res = this.installVirusOnRemote(host, virusKey);
          if (typeof onDone === 'function') onDone(res);
          if (window.internetEngine) window.internetEngine.render();
        }
      }, 220);

      return { started: true, durationSec: tr.durationSec, sizeMb: tr.sizeMb };
    }

    removeRemoteVirus(id) {
      this.ensureLoaded();
      this.state.remoteInfections = (this.state.remoteInfections || []).filter((v) => v.id !== id);
      this.save();
      this.renderUI();
    }

    // Varredura periódica do Antivirus.av dos servidores/bots invadidos!
    startRemoteAvSweepLoop() {
      setInterval(() => {
        if (!window.currentProfile) return;
        this.runRemoteTargetsAntivirusSweep(false);
      }, 38000);
    }

    runRemoteTargetsAntivirusSweep(forceSweepAll = false) {
      this.ensureLoaded();
      const list = this.state.remoteInfections || [];
      if (list.length === 0) return { purgedCount: 0, survivedCount: 0, purgedItems: [] };

      const kept = [];
      const purgedItems = [];

      list.forEach((v) => {
        const host = window.internetEngine ? window.internetEngine.resolveHost(v.targetIp) : null;
        const avVer = host && host.antivirusVer !== undefined ? host.antivirusVer : (v.targetAvVer || 0);
        const virusPotency = Math.max(v.versionInt || 10, v.effectiveStealthInt || 0) / 10;

        // Se forceSweepAll=true testa todos; no loop normal, cada host tem 45% de chance de rodar scan no turno
        const runsScanNow = forceSweepAll || Math.random() < 0.45;
        if (runsScanNow && avVer > 0 && virusPotency <= avVer) {
          purgedItems.push({
            ip: v.targetIp,
            hostname: v.targetHostname,
            filename: v.filename,
            virusVer: this.fmtVer(v.versionInt),
            avVer: 'v' + avVer.toFixed(1)
          });
        } else {
          kept.push(v);
        }
      });

      if (purgedItems.length > 0) {
        this.state.remoteInfections = kept;
        this.save();
        purgedItems.forEach((p) => {
          const msg = `Antivirus.av (${p.avVer}) de ${p.hostname} [${p.ip}] detectou e EXPURGOU seu ${p.filename} (${p.virusVer})! Evolua o vírus acima de ${p.avVer}.`;
          this.avPurgeHistory.unshift({ at: new Date().toLocaleTimeString(), msg });
          if (typeof window.addLocalLog === 'function') {
            window.addLocalLog('AV-REMOTO', msg, 'danger');
          }
        });
        if (this.avPurgeHistory.length > 8) this.avPurgeHistory.length = 8;
        if (typeof window.showToast === 'function') {
          window.showToast(`ALERTA: ${purgedItems.length} vírus seu(s) foram deletados pelo Antivírus dos alvos!`);
        }
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
        if (window.winManager && window.winManager.current === 'winSoftware') this.renderUI();
      }

      return { purgedCount: purgedItems.length, survivedCount: kept.length, purgedItems };
    }

    isCollectorActive() {
      return this.isSoftwareInstalled('collector');
    }

    // Multiplicador forte do Collector.vcol por versão em execução (v1.0=1.00x, v2.0=1.36x, v5.0=2.44x, v10.0=4.24x)
    getCollectorMultiplier() {
      this.ensureLoaded();
      if (!this.isCollectorActive()) return 0;
      const colItem = this.state.inventory.collector;
      const colVer = ((colItem && (colItem.runningVerInt || colItem.versionInt)) || 10) / 10;
      let mult = 1 + (colVer - 1.0) * 0.36;
      if (window.currentProfile && window.currentProfile.specialty === 'botmaster') mult *= 1.25;
      if (window.universityEngine && window.universityEngine.hasCert(4)) mult *= 1.15;
      if (window.skillTreeEngine) {
        const rank = typeof window.skillTreeEngine.getRank === 'function' ? window.skillTreeEngine.getRank('botnet_boost') : 0;
        if (rank > 0) mult *= (1 + rank * 0.12);
        if (window.skillTreeEngine.selectedSubclass === 'sub_botmaster') mult *= 1.18;
      }
      return +mult.toFixed(2);
    }

    // Chamado quando uma vítima humana limpa nosso vírus usando Antivirus.av >= versão do vírus (ou Formatar HD)
    handleRemoteVirusPurgedByVictim(victimIp, avVerInt = 10) {
      this.ensureLoaded();
      const before = (this.state.remoteInfections || []).length;
      const purged = (this.state.remoteInfections || []).filter(
        (v) => v.targetIp === victimIp && (avVerInt >= 999 || v.versionInt <= avVerInt)
      );
      if (purged.length === 0) return 0;

      this.state.remoteInfections = (this.state.remoteInfections || []).filter(
        (v) => !(v.targetIp === victimIp && (avVerInt >= 999 || v.versionInt <= avVerInt))
      );
      this.save();

      purged.forEach((pv) => {
        const msg = avVerInt >= 999
          ? `Vítima [${victimIp}] formatou o HD e eliminou seu ${pv.filename} (${this.fmtVer(pv.versionInt)})!`
          : `Vítima [${victimIp}] limpou seu ${pv.filename} (${this.fmtVer(pv.versionInt)}) com Antivirus.av (${this.fmtVer(avVerInt)})!`;
        this.avPurgeHistory.unshift({ at: new Date().toLocaleTimeString(), msg });
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('AV-PVP-PURGE', msg, 'danger');
        }
      });
      if (this.avPurgeHistory.length > 8) this.avPurgeHistory.length = 8;
      if (typeof window.showToast === 'function') {
        window.showToast(`ALERTA: Vítima [${victimIp}] expurgou ${purged.length} vírus seu(s)!`);
      }
      if (window.winManager && window.winManager.current === 'winSoftware') this.renderUI();
      return before - this.state.remoteInfections.length;
    }

    // FÓRMULA MONETÁRIA HARDCORE: depende de CPU (MHz) do alvo, Internet (Mbps) do alvo, Potência^1.75, Torrent.torrent (p/ Warez) e Divisão de Carga!
    computeInfectionPerSec(v) {
      const def = SOFTWARE_DEFINITIONS[v.virusKey];
      if (!def) return { cashPerSec: 0, satsPerSec: 0, gbps: 0, pausedReason: null };

      const host = window.internetEngine ? window.internetEngine.resolveHost(v.targetIp) : null;
      const cpuMhz = (host && host.cpuMhz) || v.targetCpuMhz || 800;
      const netMbps = (host && host.netMbps) || v.targetNetMbps || 4;
      const potency = Math.max(1, (v.versionInt || 10) / 10);
      const potencyFactor = Math.pow(potency, 1.75);

      const siblings = this.getRemoteVirusesOnIp(v.targetIp);
      const cpuSiblings = Math.max(1, siblings.filter((s) => ['vspam', 'vminer', 'vbank'].includes(s.virusKey)).length);
      const netSiblings = Math.max(1, siblings.filter((s) => ['vwarez', 'vddos'].includes(s.virusKey)).length);
      const cpuShare = 1 / Math.pow(cpuSiblings, 0.75);
      const netShare = 1 / Math.pow(netSiblings, 0.75);

      if (v.virusKey === 'vspam') {
        const cashPerSec = +(((cpuMhz / 1000) * 0.022 * potencyFactor * cpuShare)).toFixed(4);
        return { cashPerSec, satsPerSec: 0, gbps: 0, pausedReason: null };
      }
      if (v.virusKey === 'vwarez') {
        // Regra Oficial HE (softwares.txt): Vírus Warez EXIGE Torrent.torrent rodando na SUA lista de software!
        if (!this.isTorrentActive()) {
          return { cashPerSec: 0, satsPerSec: 0, gbps: 0, pausedReason: 'PAUSADO: Ative Torrent.torrent na sua RAM!' };
        }
        const cashPerSec = +(((Math.pow(netMbps, 0.68) / 8) * 0.032 * potencyFactor * netShare)).toFixed(4);
        return { cashPerSec, satsPerSec: 0, gbps: 0, pausedReason: null };
      }
      if (v.virusKey === 'vbank') {
        const finMult = v.targetKind === 'banco' ? 1.85 : (v.targetKind === 'empresa' ? 1.35 : 0.65);
        const cashPerSec = +((((cpuMhz / 1000) * 0.026 + (Math.pow(netMbps, 0.55) / 10) * 0.020) * potencyFactor * finMult * cpuShare)).toFixed(4);
        return { cashPerSec, satsPerSec: 0, gbps: 0, pausedReason: null };
      }
      if (v.virusKey === 'vminer') {
        const satsPerSec = Math.max(1, Math.round((cpuMhz / 1000) * 14 * potencyFactor * cpuShare));
        return { cashPerSec: 0, satsPerSec, gbps: 0, pausedReason: null };
      }
      if (v.virusKey === 'vddos') {
        const gbps = +((((cpuMhz / 2200) + (netMbps / 220)) * 0.45 * Math.pow(potency, 1.3) * netShare)).toFixed(2);
        return { cashPerSec: 0, satsPerSec: 0, gbps: Math.max(0.15, gbps), pausedReason: null };
      }
      return { cashPerSec: 0, satsPerSec: 0, gbps: 0, pausedReason: null };
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
        collectorActive: this.isCollectorActive(),
        cashReady: +(rawCash * mult).toFixed(2),
        satsReady: Math.round(rawSats * mult),
        btcReadyStr: fmtSatsToBtc(Math.round(rawSats * mult)),
        totalGbps: +totalGbps.toFixed(2),
        collectorMult: mult
      };
    }

    collectAllViruses() {
      this.ensureLoaded();
      if (!this.isCollectorActive()) {
        return {
          success: false,
          code: 'COLLECTOR_NOT_INSTALLED',
          message: 'Seu Collector.vcol está DESATIVADO! Instale-o na RAM na aba "Meus Softwares" para poder recolher os lucros.'
        };
      }

      const summary = this.getPendingHarvestSummary();
      if (summary.cashReady < 0.05 && summary.satsReady < 10) {
        return { success: false, message: 'Rendimento acumulado ainda muito baixo (< $ 0.05 HC). Aguarde os vírus trabalharem mais!' };
      }

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

      const repGain = Math.min(60, 5 + Math.floor(summary.cashReady * 0.12) + Math.floor(summary.satsReady / 1500));
      if (window.currentProfile) {
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + repGain;
      }

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog(
          'VCOL-HARVEST',
          `Coleta Collector.vcol (${summary.collectorMult.toFixed(2)}x): +${fmtUsd(summary.cashReady)} e +${summary.btcReadyStr} BTC`,
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
        message: `Collector.vcol (${summary.collectorMult.toFixed(2)}x) recolheu +${fmtUsd(summary.cashReady)} e +${summary.btcReadyStr} BTC!`
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
      const myNetMbps = this.getPlayerNetMbps();
      const harvest = this.getPendingHarvestSummary();
      const hostiles = this.state.localHostileInfections || [];

      const avItem = this.state.inventory.antivirus || { owned: false, versionInt: 0, runningVerInt: 0, installed: false };
      const avOwnedAndActive = !!(avItem.owned && avItem.installed && !this.isSoftwareInTransition('antivirus') && avItem.versionInt > 0);
      const myActiveAvVerInt = avOwnedAndActive ? (avItem.runningVerInt || avItem.versionInt) : 0;
      const mySeekerVer = window.stealthXhdEngine ? window.stealthXhdEngine.getSeekerVer() : 1.0;
      const hasHiddenLocal = hostiles.some((h) => !h.revealed && (h.hiddenWithVer || 0) > 0);
      const hasUnremovableByCurrentAv = hostiles.some((h) => !avOwnedAndActive || h.versionInt > myActiveAvVerInt || (!h.revealed && (h.hiddenWithVer || 0) > 0));

      const hostileBanner = hostiles.length === 0 ? '' : `
        <div id="localQuarantineBanner" class="hc-card" style="padding:1rem 1.15rem;border-color:var(--hc-danger);background:rgba(208,68,58,0.10);display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
            <div>
              <strong style="color:var(--hc-danger-text);font-size:0.92rem;">
                ALERTA DE VÍRUS NO SEU PC: ${hostiles.length} invasão(ões) ativa(s)! (Seu Antivírus: ${!avItem.owned ? 'NÃO BAIXADO' : (avOwnedAndActive ? this.fmtVer(myActiveAvVerInt) : 'DESLIGADO / EM CARÊNCIA')})
              </strong>
              <div style="font-size:0.76rem;color:var(--hc-text-2);margin-top:2px;">
                Regra Simples: seu <strong>Antivírus</strong> só limpa vírus de força igual ou menor que ele! ${!avItem.owned ? 'Baixe o Antivírus grátis em <code>33.8.2.71</code> ou use <strong>Formatar Disco</strong>.' : 'Se o vírus for mais forte, melhore seu Antivírus ou use <strong>Formatar Disco</strong>.'}
              </div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${hasHiddenLocal
                ? `<button type="button" id="btnRunLocalSeeker" class="hc-btn sm" style="border-color:var(--hc-warning);color:var(--hc-warning);" onclick="window.softwareEngine.runLocalSeekerScan()">
                     🔍 Revelar Escondidos (v${mySeekerVer.toFixed(1)})
                   </button>`
                : ''}
              ${!avItem.owned
                ? `<button type="button" class="hc-btn sm" style="border-color:var(--hc-accent);color:var(--hc-accent-text);" onclick="window.internetEngine.openIp('33.8.2.71')">
                     ⬇ Baixar Antivírus Grátis (33.8.2.71)
                   </button>`
                : ''}
              <button type="button" id="btnRunLocalAv" class="hc-btn primary sm" style="background:var(--hc-danger);border-color:var(--hc-danger);" onclick="window.softwareEngine.runLocalAntivirus()">
                🛡 Limpar PC (${avOwnedAndActive ? this.fmtVer(myActiveAvVerInt) : 'OFF'})
              </button>
              <button type="button" id="btnEmergencyFormatHd" class="hc-btn ghost sm" style="border-color:var(--hc-danger);color:var(--hc-danger-text);" onclick="window.softwareEngine.formatLocalHardDrive(false)">
                ☢ Formatar Disco (Limpeza Geral)
              </button>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:6px;">
            ${hostiles.map((h) => {
              const isHidden = !h.revealed && (h.hiddenWithVer || 0) > 0;
              const canCleanNow = avOwnedAndActive && !isHidden && myActiveAvVerInt >= h.versionInt;
              const statusBadge = isHidden
                ? `<span class="hc-badge warn">ESCONDIDO (v${Number(h.hiddenWithVer).toFixed(1)}) — Clique em Revelar Escondidos</span>`
                : (!avItem.owned
                    ? `<span class="hc-badge danger">Baixe o Antivírus em 33.8.2.71 (ou Formate o Disco)!</span>`
                    : (!avOwnedAndActive
                        ? `<span class="hc-badge danger">Ligue seu Antivírus na Memória!</span>`
                        : (canCleanNow
                            ? `<span class="hc-badge success">PODE LIMPAR (Seu AV ${this.fmtVer(myActiveAvVerInt)} &gt;= Vírus ${this.fmtVer(h.versionInt)})</span>`
                            : `<span class="hc-badge danger">MUITO FORTE: Vírus ${this.fmtVer(h.versionInt)} &gt; Seu AV ${this.fmtVer(myActiveAvVerInt)} (Melhore o AV ou Formate o Disco)</span>`)));
              return `
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding:6px 10px;background:var(--hc-inset);border:1px solid ${canCleanNow ? 'rgba(53,184,119,0.4)' : 'var(--hc-danger)'};border-radius:7px;font-family:var(--hc-font-mono);font-size:0.77rem;">
                  <div>
                    <strong style="color:var(--hc-text);">${isHidden ? '??? [Vírus Escondido na Memória]' : esc(h.label)}</strong>
                    <span style="color:var(--hc-warning);margin-left:6px;">${isHidden ? `(Camuflagem v${Number(h.hiddenWithVer).toFixed(1)})` : this.fmtVer(h.versionInt)}</span>
                    <span style="color:var(--hc-text-3);margin-left:6px;">Usa ${h.ramMb || 24}MB · Origem: ${esc(h.attackerIp)}</span>
                  </div>
                  ${statusBadge}
                </div>
              `;
            }).join('')}
          </div>
          ${hasUnremovableByCurrentAv ? `<div style="font-size:0.75rem;color:var(--hc-warning);">Dica: Guarde seus melhores programas na aba <strong>Pen-Drive Externo (Backup)</strong> antes de clicar em <strong>Formatar Disco</strong>!</div>` : ''}
        </div>
      `;

      const avAlertBanner = this.avPurgeHistory.length === 0 ? '' : `
        <div class="hc-card" style="padding:0.8rem 1.1rem;border-color:var(--hc-warning);background:rgba(216,155,56,0.07);font-size:0.79rem;">
          <strong style="color:var(--hc-warning);">Últimos avisos da sua rede de vírus:</strong>
          <span style="color:var(--hc-text-2);margin-left:6px;">${esc(this.avPurgeHistory[0].msg)}</span>
        </div>
      `;

      let tabContent = '';
      if (this.activeTab === 'inventory') {
        const sysKeys = [
          'cracker', 'hasher', 'firewall', 'portscan',
          'exploit_ftp', 'exploit_ssh', 'antivirus', 'collector',
          'torrent', 'ddos_breaker', 'nmap', 'analyzer', 'webserver'
        ];
        const virKeys = ['vspam', 'vwarez', 'vminer', 'vbank', 'vddos'];

        const ownedVirKeys = virKeys.filter((k) => this.isSoftwareOwned(k));
        const ownedSysKeys = sysKeys.filter((k) => this.isSoftwareOwned(k));
        const unownedAllKeys = [...virKeys, ...sysKeys].filter((k) => !this.isSoftwareOwned(k));

        // Painel Visual "O Que Está Rodando no Meu PC Agora" (Exclusividade de 1 instância + Tempo de Carência)
        const activeOrTransitioningKeys = ownedSysKeys.filter((k) => {
          const st = this.state.inventory[k];
          return (st && st.installed) || this.isSoftwareInTransition(k) || (st && st.versionInt > (st.runningVerInt || 0) && k === 'firewall');
        });

        const runningChipsHtml = activeOrTransitioningKeys.length === 0
          ? `<div style="font-size:0.8rem;color:var(--hc-text-3);">Nenhum programa ligado na memória neste instante (seu PC está desprotegido!).</div>`
          : activeOrTransitioningKeys.map((k) => {
              const def = SOFTWARE_DEFINITIONS[k];
              const cur = this.state.inventory[k];
              const tr = this.getTransitionInfo(k);
              const runVer = cur.runningVerInt || cur.versionInt;
              const hasNewerOnDisk = cur.installed && !tr && cur.versionInt > runVer;

              if (tr) {
                const trLabel = tr.mode === 'swapping'
                  ? `Trocando ${this.fmtVer(tr.fromVerInt)} → ${this.fmtVer(tr.toVerInt)} (Carência: ${tr.remainingSec}s — Desprotegido agora!)`
                  : (tr.mode === 'booting'
                      ? `Ligando ${this.fmtVer(tr.toVerInt)} (${tr.remainingSec}s restantes...)`
                      : `Encerrando ${this.fmtVer(tr.fromVerInt)} — Aguarde ${tr.remainingSec}s de carência p/ religar!`);
                return `
                  <div id="ramSlotCard_${k}" style="padding:8px 11px;background:rgba(240,160,58,0.10);border:1px solid var(--hc-warning);border-radius:8px;display:flex;flex-direction:column;gap:5px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-size:0.8rem;">
                      <strong>⏳ ${esc(def.friendlyTitle || def.filename)}</strong>
                      <span class="hc-badge warning">${trLabel}</span>
                    </div>
                    <div style="height:6px;background:var(--hc-inset);border-radius:999px;overflow:hidden;">
                      <div style="height:100%;width:${tr.pct}%;background:var(--hc-warning);transition:width 0.2s linear;"></div>
                    </div>
                  </div>
                `;
              }

              return `
                <div id="ramSlotCard_${k}" style="padding:8px 11px;background:var(--hc-inset);border:1px solid ${hasNewerOnDisk ? 'var(--hc-warning)' : 'rgba(53,184,119,0.35)'};border-radius:8px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:0.8rem;">
                  <div>
                    <span class="hc-badge ${cur.installed ? 'success' : 'danger'}">${cur.installed ? `RODANDO ${this.fmtVer(runVer)}` : 'DESLIGADO'}</span>
                    <strong style="margin-left:6px;">${esc(def.friendlyTitle || def.filename)}</strong>
                    ${hasNewerOnDisk
                      ? `<span class="hc-badge warning" style="margin-left:6px;">✨ Versão ${this.fmtVer(cur.versionInt)} pronta no Disco!</span>`
                      : ''}
                  </div>
                  <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    ${hasNewerOnDisk
                      ? `<button type="button" id="btnSwapVer_${k}" class="hc-btn primary sm" onclick="window.softwareEngine.swapToLatestVersion('${k}')">
                           🔄 Trocar ${this.fmtVer(runVer)} → ${this.fmtVer(cur.versionInt)} (Carência)
                         </button>`
                      : ''}
                    ${cur.installed
                      ? `<button type="button" class="hc-btn ghost sm" onclick="window.softwareEngine.deactivateLocalSoftware('${k}')">Desligar</button>`
                      : `<button type="button" class="hc-btn primary sm" onclick="window.softwareEngine.activateLocalSoftware('${k}')">Ligar ${this.fmtVer(cur.versionInt)}</button>`}
                  </div>
                </div>
              `;
            }).join('');

        const runningProgramsPanel = `
          <div id="runningProgramsPanel" class="hc-card" style="padding:1rem 1.15rem;border-color:rgba(53,184,119,0.4);display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
              <div>
                <div class="hc-eyebrow" style="color:var(--hc-accent-text);">🟢 O Que Está Rodando no Seu PC Agora (Memória Ativa)</div>
                <div style="font-size:0.78rem;color:var(--hc-text-2);margin-top:2px;">
                  <strong>Regra do Sistema:</strong> nunca podem rodar 2 programas iguais juntos (ex: 2 Escudos). Para ativar uma versão mais forte, é preciso desligar a antiga e aguardar os segundos de <strong>tempo de carência</strong>!
                </div>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${runningChipsHtml}
            </div>
          </div>
        `;

        const renderRow = (k) => {
          const def = SOFTWARE_DEFINITIONS[k];
          const cur = this.state.inventory[k] || { owned: true, versionInt: 10, runningVerInt: 10, installed: false, licensed: true };
          const tr = this.getTransitionInfo(k);
          const stepVer = k === 'analyzer' ? 10 : 5;
          const maxVer = def.maxVerInt || 100;
          const cost = this.getResearchCost(k);
          const licCost = this.getLicenseCost(k);
          const sizeMb = this.getItemSizeMb(k, cur.versionInt);
          const nextSizeMb = this.getItemSizeMb(k, Math.min(maxVer, cur.versionInt + stepVer));
          const runVer = cur.runningVerInt || cur.versionInt;
          const ramMb = def.category === 'system'
            ? this.getItemRamMb(k, cur.installed ? runVer : cur.versionInt, false)
            : this.getItemRamMb(k, cur.versionInt, true);
          const nextVerStr = this.fmtVer(Math.min(maxVer, cur.versionInt + stepVer));
          const needsLicense = cur.licensed === false && !def.nonResearchable;
          const hasPendingNewerVer = def.category === 'system' && cur.installed && !tr && cur.versionInt > runVer;

          const statusText = tr
            ? `EM CARÊNCIA (${tr.remainingSec}s...)`
            : (cur.installed
                ? (hasPendingNewerVer ? `RODANDO ${this.fmtVer(runVer)} (Novo ${this.fmtVer(cur.versionInt)} no Disco!)` : `LIGADO NA MEMÓRIA (${this.fmtVer(runVer)})`)
                : 'DESLIGADO');

          return `
            <div class="hc-card" style="padding:0.85rem 1.05rem;display:grid;grid-template-columns:minmax(235px,1.5fr) minmax(190px,1.5fr) auto;gap:12px;align-items:center;">
              <div>
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                  <strong style="font-size:0.92rem;">${esc(def.friendlyTitle || def.filename)}</strong>
                  <code style="font-size:0.74rem;color:var(--hc-text-3);">${esc(def.filename)}</code>
                  <span class="hc-badge success">Disco ${this.fmtVer(cur.versionInt)}</span>
                  <span class="hc-badge info">${esc(def.badge)}</span>
                  ${needsLicense ? `<span class="hc-badge warn">Precisa de Licença</span>` : ''}
                </div>
                <div style="font-size:0.73rem;color:${tr || hasPendingNewerVer ? 'var(--hc-warning)' : 'var(--hc-text-3)'};font-family:var(--hc-font-mono);margin-top:3px;">
                  ${def.category === 'system'
                    ? `Tamanho: ${sizeMb}MB${def.nonResearchable ? '' : ` (próx: ${nextSizeMb}MB)`} · Usa ${ramMb}MB Memória · ${statusText}`
                    : `Tamanho no seu PC: ${sizeMb}MB · Exige na Vítima: ${sizeMb}MB Disco + ${ramMb}MB Memória`}
                </div>
              </div>

              <div style="font-size:0.8rem;color:var(--hc-text-2);">${esc(def.desc)}</div>

              <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
                ${k === 'antivirus'
                  ? `<button type="button" class="hc-btn ghost sm" onclick="window.softwareEngine.runLocalAntivirus()">Limpar PC</button>`
                  : ''}
                ${k === 'nmap' && cur.installed && !tr
                  ? `<button type="button" id="btnRunLocalNmap" class="hc-btn ghost sm" onclick="window.softwareEngine.runLocalNmapScan()">Ver Conectados</button>`
                  : ''}
                ${hasPendingNewerVer
                  ? `<button type="button" id="btnRowSwap_${k}" class="hc-btn primary sm" style="background:var(--hc-warning);border-color:var(--hc-warning);color:#111;" onclick="window.softwareEngine.swapToLatestVersion('${k}')">
                       🔄 Trocar p/ ${this.fmtVer(cur.versionInt)}
                     </button>`
                  : ''}
                ${def.category === 'system'
                  ? `<button type="button" id="btnToggleInstall_${k}" class="hc-btn ${cur.installed ? 'ghost' : 'primary'} sm" ${tr ? 'disabled' : ''} onclick="window.softwareEngine.toggleLocalInstall('${k}')">
                       ${tr ? `⏳ ${tr.remainingSec}s` : (cur.installed ? `Desligar (${this.fmtVer(runVer)})` : `Ligar (${this.fmtVer(cur.versionInt)})`)}
                     </button>`
                  : ''}
                ${def.nonResearchable
                  ? `<span class="hc-badge" style="opacity:0.7;">Versão Única</span>`
                  : (cur.versionInt >= maxVer
                      ? `<span class="hc-badge success">MÁX (${this.fmtVer(maxVer)})</span>`
                      : (needsLicense
                          ? `<button type="button" id="btnBuyLicense_${k}" class="hc-btn sm" style="border-color:var(--hc-warning);color:var(--hc-warning);" onclick="window.handleBuySoftwareLicense('${k}')">
                               Liberar Melhoria ($ ${licCost.toLocaleString('pt-BR')})
                             </button>`
                          : `<button type="button" id="btnResearch_${k}" class="hc-btn primary sm" onclick="window.handleSoftwareResearch('${k}')">
                               Melhorar → ${nextVerStr} ($ ${cost.toLocaleString('pt-BR')})
                             </button>`))}
              </div>
            </div>
          `;
        };

        const renderUnownedRow = (k) => {
          const def = SOFTWARE_DEFINITIONS[k];
          const isVirus = def.category === 'virus';
          return `
            <div class="hc-card" style="padding:0.75rem 1rem;display:grid;grid-template-columns:minmax(235px,1.45fr) minmax(190px,1.55fr) auto;gap:12px;align-items:center;opacity:0.82;border-style:dashed;">
              <div>
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                  <strong style="font-size:0.9rem;color:var(--hc-text-2);">${esc(def.friendlyTitle || def.filename)}</strong>
                  <span class="hc-badge warn">AINDA NÃO TEM</span>
                  <span class="hc-badge ${isVirus ? 'danger' : 'info'}">${isVirus ? 'Baixe no Enigma' : esc(def.badge)}</span>
                </div>
                <div style="font-size:0.73rem;color:var(--hc-accent-text);font-family:var(--hc-font-mono);margin-top:3px;">
                  Onde pegar grátis: ${esc(def.acquireHint || 'Primeiro Enigma (109.64.200.10)')}
                </div>
              </div>
              <div style="font-size:0.78rem;color:var(--hc-text-3);">${esc(def.desc)}</div>
              <div style="display:flex;justify-content:flex-end;">
                <button type="button" id="btnFindSoft_${k}" class="hc-btn ghost sm" style="border-color:var(--hc-border-strong);" onclick="window.internetEngine.openIp('${esc(def.acquireIp || '109.64.200.10')}')">
                  Ir Buscar (${esc(def.acquireIp || '109.64.200.10')}) →
                </button>
              </div>
            </div>
          `;
        };

        const nmapPanel = this.lastNmapReport ? `
          <div class="hc-card" style="padding:0.85rem 1.05rem;border-color:rgba(53,184,119,0.35);font-family:var(--hc-font-mono);font-size:0.78rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong style="color:var(--hc-accent-text);">Conexões Detectadas (Rastreador v${esc(this.lastNmapReport.nmapVer)} · ${esc(this.lastNmapReport.at)})</strong>
              <button type="button" class="hc-btn ghost sm" onclick="window.softwareEngine.lastNmapReport=null;window.softwareEngine.renderUI();">Fechar</button>
            </div>
            <div style="margin-top:6px;color:var(--hc-text-2);">
              ${this.lastNmapReport.found.length === 0
                ? 'Nenhum IP externo desprotegido conectado agora.'
                : this.lastNmapReport.found.map((f) => `<div>• IP [${esc(f.ip)}] detectado (${esc(f.role)} · Escudo v${f.fwl.toFixed(1)}) <button type="button" class="hc-btn ghost sm" style="padding:1px 6px;margin-left:6px;" onclick="window.internetEngine.openIp('${esc(f.ip)}', 'invadir')">Visitar IP</button></div>`).join('')}
            </div>
          </div>
        ` : '';

        const webServerPanel = this.isSoftwareInstalled('webserver') ? `
          <div class="hc-card" style="padding:0.95rem 1.1rem;border-color:rgba(53,184,119,0.35);">
            <div class="hc-eyebrow" style="margin-bottom:6px;">Sua Página Web Pública (Visível quando outros visitam seu IP)</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <input type="text" id="localWebServerTextInput" class="form-input" style="flex:1;min-width:240px;font-family:var(--hc-font-mono);font-size:0.8rem;" value="${esc(this.state.customWebPage || '')}" placeholder="Escreva o recado público da sua máquina...">
              <button type="button" id="btnSaveLocalWebPage" class="hc-btn primary sm" onclick="window.softwareEngine.saveLocalWebServerPage(document.getElementById('localWebServerTextInput').value)">Publicar na Rede</button>
            </div>
          </div>
        ` : '';

        const emptyVirusesCard = ownedVirKeys.length === 0
          ? `<div id="noOwnedVirusesBanner" class="hc-card" style="padding:1rem 1.2rem;border-color:var(--hc-warning);background:rgba(216,155,56,0.08);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
               <div>
                 <strong style="color:var(--hc-warning);font-size:0.9rem;">Você ainda não baixou nenhum vírus (0 de 5 tipos)</strong>
                 <div style="font-size:0.8rem;color:var(--hc-text-2);margin-top:3px;">
                   Você não compra vírus prontos em loja! Clique ao lado para abrir o <strong>Primeiro Enigma (<code>109.64.200.10</code>)</strong>, resolva o desafio e invada o computador dele para baixar seu primeiro vírus grátis!
                 </div>
               </div>
               <button type="button" id="btnGoFirstPuzzleFromSoft" class="hc-btn primary sm" onclick="window.internetEngine.openIp('109.64.200.10')">
                 Ir ao Primeiro Enigma →
               </button>
             </div>`
          : `<div style="display:flex;flex-direction:column;gap:8px;">${ownedVirKeys.map(renderRow).join('')}</div>`;

        tabContent = `
          <div style="display:flex;flex-direction:column;gap:14px;">
            ${runningProgramsPanel}
            ${nmapPanel}
            ${webServerPanel}
            <div class="hc-eyebrow">1. Meus Vírus para Ganhar Dinheiro (${ownedVirKeys.length} / ${virKeys.length} baixados)</div>
            ${emptyVirusesCard}

            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;flex-wrap:wrap;gap:8px;">
              <div class="hc-eyebrow">2. Meus Programas de Proteção &amp; Invasão (${ownedSysKeys.length} / ${sysKeys.length} no seu Disco)</div>
              <button type="button" class="hc-btn ghost sm" style="color:var(--hc-danger-text);" onclick="window.softwareEngine.formatLocalHardDrive(false)">
                ☢ Formatar Meu Disco (Zerar Vírus)
              </button>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">${ownedSysKeys.map(renderRow).join('')}</div>

            ${unownedAllKeys.length > 0 ? `
              <div style="margin-top:8px;">
                <div class="hc-eyebrow" style="margin-bottom:8px;color:var(--hc-warning);">
                  3. Ainda Não Desbloqueados (${unownedAllKeys.length} itens — Descubra e Baixe nos Enigmas / Central de Downloads)
                </div>
                <div style="display:flex;flex-direction:column;gap:7px;">${unownedAllKeys.map(renderUnownedRow).join('')}</div>
              </div>
            ` : ''}
          </div>
        `;
      } else if (this.activeTab === 'xhd' && window.stealthXhdEngine) {
        tabContent = window.stealthXhdEngine.renderXhdAndStealthPanelHtml();
      } else {
        const list = this.state.remoteInfections || [];
        const rows = list.length === 0
          ? `<div class="hc-card" style="padding:2rem;text-align:center;color:var(--hc-text-2);">
               <div style="font-weight:600;color:var(--hc-text);margin-bottom:6px;">Nenhum vírus instalado em servidores remotos ainda</div>
               <div style="font-size:0.84rem;margin-bottom:14px;">Invada servidores com boa CPU/Internet e espaço em disco livre na aba <strong>Internet</strong>! Lembre-se: vírus mais fracos que o <code>Antivirus.av</code> do alvo são expurgados nas varreduras (ou camufle-os com <code>Hider.hdr</code>!).</div>
               <button type="button" class="hc-btn primary" onclick="window.internetEngine.openIp('203.17.88.40', 'invadir')">Ir Invadir um Servidor →</button>
             </div>`
          : list.map((v) => {
              const host = window.internetEngine ? window.internetEngine.resolveHost(v.targetIp) : null;
              const cpuMhz = (host && host.cpuMhz) || v.targetCpuMhz || 800;
              const netMbps = (host && host.netMbps) || v.targetNetMbps || 4;
              const avVer = host && host.antivirusVer !== undefined ? host.antivirusVer : (v.targetAvVer || 0);
              const effPotency = Math.max(v.versionInt || 10, v.effectiveStealthInt || 0) / 10;
              const isFud = avVer <= 0 || effPotency > avVer;

              const rate = this.computeInfectionPerSec(v);
              const perHourCash = +(rate.cashPerSec * 3600 * Math.max(1, harvest.collectorMult)).toFixed(2);
              const perHourBtc = fmtSatsToBtc(Math.round(rate.satsPerSec * 3600 * Math.max(1, harvest.collectorMult)));

              const rateStr = rate.pausedReason
                ? `<span style="color:var(--hc-danger-text);">${esc(rate.pausedReason)}</span>`
                : (rate.satsPerSec > 0
                    ? `+${perHourBtc} BTC/h (${rate.satsPerSec} sats/s)`
                    : (rate.gbps > 0 ? `+${rate.gbps} Gbps DDoS` : `+$ ${perHourCash.toLocaleString('pt-BR')} HC/h ($ ${rate.cashPerSec.toFixed(3)}/s)`));
              const accStr = v.virusKey === 'vminer'
                ? `${fmtSatsToBtc(v.accumulatedSats)} BTC`
                : (v.virusKey === 'vddos' ? 'Ativo no Enxame' : fmtUsd(v.accumulatedCash));

              return `
                <div class="hc-card" style="padding:0.9rem 1.1rem;display:grid;grid-template-columns:minmax(210px,1.3fr) minmax(210px,1.3fr) minmax(140px,0.9fr) auto;gap:12px;align-items:center;">
                  <div>
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                      <strong style="font-family:var(--hc-font-mono);color:var(--hc-accent-text);">${esc(v.targetIp)}</strong>
                      <span class="hc-badge ${isFud ? 'success' : 'danger'}">${isFud ? (v.hiddenWithVer ? `CAMUFLADO (Hider v${v.hiddenWithVer.toFixed(1)})` : 'FUD / INVISÍVEL') : `RISCO AV v${avVer.toFixed(1)}`}</span>
                    </div>
                    <div style="font-size:0.78rem;color:var(--hc-text-2);">${esc(v.targetHostname)}</div>
                    <div style="font-size:0.72rem;color:var(--hc-text-3);font-family:var(--hc-font-mono);">
                      Alvo: ${cpuMhz}MHz · ${netMbps}Mbps · AV v${avVer.toFixed(1)}
                    </div>
                  </div>

                  <div>
                    <strong style="font-family:var(--hc-font-mono);font-size:0.86rem;">${esc(v.filename)}</strong>
                    <span class="hc-badge success" style="margin-left:6px;">${this.fmtVer(v.versionInt)}</span>
                    <div style="font-size:0.73rem;color:var(--hc-text-3);font-family:var(--hc-font-mono);">Ocupa ${v.sizeMb || 20}MB HDD / ${v.ramMb || 12}MB RAM</div>
                    <div style="font-size:0.75rem;color:var(--hc-accent-text);font-family:var(--hc-font-mono);margin-top:2px;">${rateStr}</div>
                  </div>

                  <div>
                    <div style="font-size:0.7rem;color:var(--hc-text-3);text-transform:uppercase;">Acumulado Bruto</div>
                    <strong style="font-family:var(--hc-font-mono);font-size:0.88rem;color:var(--hc-warning);">${accStr}</strong>
                  </div>

                  <div style="display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap;">
                    ${window.stealthXhdEngine
                      ? `<button type="button" id="btnHideVirus_${v.id}" class="hc-btn ghost sm" onclick="window.stealthXhdEngine.hideRemoteVirusWithHider(${v.id})">Hider (v${window.stealthXhdEngine.getHiderVer().toFixed(1)})</button>`
                      : ''}
                    <button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('${esc(v.targetIp)}', 'entrar')">SSH</button>
                    <button type="button" class="hc-btn ghost sm" style="color:var(--hc-danger-text);" onclick="window.softwareEngine.removeRemoteVirus(${v.id})">Remover</button>
                  </div>
                </div>
              `;
            }).join('');

        tabContent = `
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(195px,1fr));gap:10px;">
              <div class="hc-card" style="padding:0.9rem 1rem;">
                <div class="hc-stat-label">Vírus Ativos na Rede</div>
                <div class="hc-stat-value">${harvest.virusCount}</div>
              </div>
              <div class="hc-card" style="padding:0.9rem 1rem;">
                <div class="hc-stat-label">Pronto p/ Coleta ($ HC)</div>
                <div class="hc-stat-value" style="color:var(--hc-accent-text);font-size:1.2rem;">${fmtUsd(harvest.cashReady)}</div>
              </div>
              <div class="hc-card" style="padding:0.9rem 1rem;">
                <div class="hc-stat-label">Pronto p/ Coleta (BTC)</div>
                <div class="hc-stat-value" style="font-family:var(--hc-font-mono);color:var(--hc-warning);font-size:1.1rem;">${harvest.btcReadyStr} BTC</div>
              </div>
              <div class="hc-card" style="padding:0.9rem 1rem;">
                <div class="hc-stat-label">Poder DDoS (.vddos)</div>
                <div class="hc-stat-value" style="font-family:var(--hc-font-mono);font-size:1.2rem;">${harvest.totalGbps} Gbps</div>
              </div>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
              <span style="font-size:0.82rem;color:var(--hc-text-2);">
                Multiplicador do seu <code>Collector.vcol</code> (${this.fmtVer(this.state.inventory.collector?.versionInt || 10)}):
                <strong style="color:${harvest.collectorActive ? 'var(--hc-accent-text)' : 'var(--hc-danger-text)'};">
                  ${harvest.collectorActive ? harvest.collectorMult.toFixed(2) + 'x' : 'DESATIVADO NA RAM!'}
                </strong>
                · Tracker Warez: <strong style="color:${this.isTorrentActive() ? 'var(--hc-accent-text)' : 'var(--hc-warning)'};">${this.isTorrentActive() ? 'Torrent ATIVO' : 'Torrent PARADO'}</strong>
              </span>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button type="button" id="btnSimulateTargetAvSweep" class="hc-btn ghost sm" onclick="window.softwareEngine.runRemoteTargetsAntivirusSweep(true)">
                  Testar Varredura AV dos Alvos ↻
                </button>
                <button type="button" id="btnCollectAllViruses" class="hc-btn primary" onclick="window.handleCollectViruses()">
                  Coletar com Collector.vcol ($ HC + BTC)
                </button>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:8px;">${rows}</div>
          </div>
        `;
      }

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${hostileBanner}
          ${avAlertBanner}

          <!-- Barras Físicas do Seu PC: HDD, RAM e Internet -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;">
            <div class="hc-card" style="padding:0.8rem 1rem;">
              <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:5px;">
                <span style="color:var(--hc-text-2);">Seu Disco (HDD/SSD)</span>
                <strong style="font-family:var(--hc-font-mono);">${usedHdd} / ${maxHdd} MB</strong>
              </div>
              <div style="height:7px;background:var(--hc-inset);border-radius:999px;overflow:hidden;">
                <div style="height:100%;width:${Math.min(100, Math.round((usedHdd / maxHdd) * 100))}%;background:${usedHdd > maxHdd * 0.85 ? 'var(--hc-warning)' : 'var(--hc-accent)'};"></div>
              </div>
            </div>

            <div class="hc-card" style="padding:0.8rem 1rem;">
              <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:5px;">
                <span style="color:var(--hc-text-2);">Sua Memória RAM</span>
                <strong style="font-family:var(--hc-font-mono);">${usedRam} / ${maxRam} MB</strong>
              </div>
              <div style="height:7px;background:var(--hc-inset);border-radius:999px;overflow:hidden;">
                <div style="height:100%;width:${Math.min(100, Math.round((usedRam / maxRam) * 100))}%;background:${usedRam > maxRam * 0.85 ? 'var(--hc-warning)' : 'var(--hc-accent)'};"></div>
              </div>
            </div>

            <div class="hc-card" style="padding:0.8rem 1rem;display:flex;flex-direction:column;justify-content:center;">
              <div style="display:flex;justify-content:space-between;font-size:0.78rem;">
                <span style="color:var(--hc-text-2);">Sua Internet (Upload SSH)</span>
                <strong style="font-family:var(--hc-font-mono);color:var(--hc-accent-text);">${myNetMbps} Mbit/s</strong>
              </div>
              <div style="font-size:0.72rem;color:var(--hc-text-3);margin-top:3px;">CPU Local: ${this.getPlayerCpuMhz()} MHz (acelera tempo · não substitui versão)</div>
            </div>
          </div>

          <div style="display:flex;gap:8px;border-bottom:1px solid var(--hc-border);padding-bottom:10px;flex-wrap:wrap;">
            <button type="button" class="hc-btn sm ${this.activeTab === 'inventory' ? 'primary' : 'ghost'}" onclick="window.softwareEngine.activeTab='inventory';window.softwareEngine.renderUI();">
              Meus Softwares & Potências (v1.0 → v10.0)
            </button>
            <button type="button" id="tabActiveViruses" class="hc-btn sm ${this.activeTab === 'viruses' ? 'primary' : 'ghost'}" onclick="window.softwareEngine.activeTab='viruses';window.softwareEngine.renderUI();">
              Vírus Instalados & Coletor (${harvest.virusCount})
            </button>
            <button type="button" id="tabStealthAndXhd" class="hc-btn sm ${this.activeTab === 'xhd' ? 'primary' : 'ghost'}" onclick="window.softwareEngine.activeTab='xhd';window.softwareEngine.renderUI();">
              Camuflagem (Hider/Seeker) & HD Externo (XHD)
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

  window.handleBuySoftwareLicense = function (softKey) {
    const res = window.softwareEngine.buySoftwareLicense(softKey);
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };

  window.handleCollectViruses = function () {
    const res = window.softwareEngine.collectAllViruses();
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };
})();
