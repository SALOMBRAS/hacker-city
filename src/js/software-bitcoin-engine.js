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
    // --- Utilitários Sob Demanda (Ficam no HD/SSD/NVMe e rodam em segundo plano quando acionados!) ---
    cracker: {
      key: 'cracker',
      filename: 'Cracker.crc',
      friendlyTitle: 'Quebrador de Senhas (Cracker)',
      category: 'system',
      onDemandTool: true,
      icon: 'key-round',
      iconKind: 'attack',
      badge: 'Invasão',
      multCost: 1.25,
      baseMb: 20,
      baseRam: 0,
      starterOwned: true,
      starterInstalled: false,
      starterDrive: 'hd',
      desc: 'Quebra senhas em segundo plano sob demanda. Ao clicar para invadir, abre o Mini-PC com todos os hashes salvos no seu HD, SSD ou NVMe para escolher qual usar!'
    },
    hasher: {
      key: 'hasher',
      filename: 'Hasher.hash',
      friendlyTitle: 'Cofre da Sua Senha (Hasher)',
      category: 'system',
      onDemandTool: false,
      icon: 'lock',
      iconKind: 'defense',
      badge: 'Defesa',
      multCost: 1.15,
      baseMb: 18,
      baseRam: 14,
      starterOwned: true,
      starterInstalled: true,
      starterDrive: 'hd',
      desc: 'Embaralha e tranca a senha do seu PC continuamente. Impede que invasores com Quebrador de Senha mais fraco descubram sua senha.'
    },
    firewall: {
      key: 'firewall',
      filename: 'Firewall.fwl',
      friendlyTitle: 'Escudo de Rede (Firewall)',
      category: 'system',
      onDemandTool: false,
      icon: 'shield',
      iconKind: 'defense',
      badge: 'Defesa',
      multCost: 1.2,
      baseMb: 20,
      baseRam: 18,
      starterOwned: true,
      starterInstalled: true,
      starterDrive: 'hd',
      desc: 'A porta blindada do seu PC: barra invasões mais fracas que ele. Só pode rodar 1 Escudo por vez (com tempo de carência ao trocar).'
    },
    portscan: {
      key: 'portscan',
      filename: 'PortScan.scan',
      friendlyTitle: 'Detector de Brechas (PortScan)',
      category: 'system',
      onDemandTool: true,
      icon: 'radar',
      iconKind: 'attack',
      badge: 'Reconhecimento',
      multCost: 1.0,
      baseMb: 8,
      baseRam: 0,
      nonResearchable: true,
      starterOwned: true,
      starterInstalled: false,
      starterDrive: 'ssd',
      desc: 'Roda sob demanda para escanear as portas FTP e SSH do servidor alvo antes de usar ataques de Exploit.'
    },
    hider: {
      key: 'hider',
      filename: 'Hider.hdr',
      friendlyTitle: 'Camuflador de Arquivos (Hider)',
      category: 'system',
      onDemandTool: true,
      icon: 'eye-off',
      iconKind: 'stealth',
      badge: 'Furtividade',
      multCost: 1.1,
      baseMb: 12,
      baseRam: 0,
      starterOwned: true,
      starterInstalled: false,
      starterDrive: 'ssd',
      desc: 'Esconde aplicativos no seu disco ou camufla vírus instalados em outros PCs contra olhares curiosos e Antivírus mais fracos.'
    },
    seeker: {
      key: 'seeker',
      filename: 'Seeker.skr',
      friendlyTitle: 'Detector de Ocultos (Seeker)',
      category: 'system',
      onDemandTool: true,
      icon: 'eye',
      iconKind: 'stealth',
      badge: 'Furtividade',
      multCost: 1.1,
      baseMb: 12,
      baseRam: 0,
      starterOwned: true,
      starterInstalled: false,
      starterDrive: 'nvme',
      desc: 'Revela programas, pastas secretas e vírus que foram escondidos com camuflagem de versão igual ou menor.'
    },
    exploit_ftp: {
      key: 'exploit_ftp',
      filename: 'FTP_Exploit.exp',
      friendlyTitle: 'Exploit de Arquivos (FTP)',
      category: 'system',
      onDemandTool: true,
      icon: 'terminal',
      iconKind: 'attack',
      badge: 'Invasão s/ Senha',
      multCost: 1.32,
      baseMb: 16,
      baseRam: 0,
      starterOwned: false,
      starterInstalled: false,
      starterDrive: 'ssd',
      desc: 'Invade servidores sem precisar descobrir a senha quando vence o Firewall do alvo, liberando download e upload de arquivos.'
    },
    exploit_ssh: {
      key: 'exploit_ssh',
      filename: 'SSH_Exploit.exp',
      friendlyTitle: 'Exploit de Comandos (SSH)',
      category: 'system',
      onDemandTool: true,
      icon: 'terminal',
      iconKind: 'attack',
      badge: 'Invasão s/ Senha',
      multCost: 1.4,
      baseMb: 18,
      baseRam: 0,
      starterOwned: false,
      starterInstalled: false,
      starterDrive: 'ssd',
      desc: 'Invade sem senha quando supera o Firewall do alvo, liberando execução de programas e exclusão remota (junto com o FTP dá acesso total).'
    },
    antivirus: {
      key: 'antivirus',
      filename: 'Antivirus.av',
      friendlyTitle: 'Varredor Antivírus',
      category: 'system',
      onDemandTool: true,
      icon: 'shield-check',
      iconKind: 'defense',
      badge: 'Limpeza',
      multCost: 1.05,
      baseMb: 18,
      baseRam: 0,
      starterOwned: false,
      starterInstalled: false,
      starterDrive: 'hd',
      desc: 'Funciona sob demanda (sem precisar ficar rodando direto): basta clicar em Rodar para limpar vírus de força igual ou menor no seu PC.'
    },
    collector: {
      key: 'collector',
      filename: 'Collector.vcol',
      friendlyTitle: 'Coletor de Lucros',
      category: 'system',
      onDemandTool: false,
      icon: 'coins',
      iconKind: 'defense',
      badge: 'Economia',
      multCost: 1.5,
      baseMb: 14,
      baseRam: 12,
      starterOwned: false,
      starterInstalled: false,
      starterDrive: 'hd',
      desc: 'Fica ativo na memória recolhendo os dólares e Bitcoins gerados pelos seus vírus espalhados na rede. Versões maiores multiplicam o ganho.'
    },
    torrent: {
      key: 'torrent',
      filename: 'Torrent.torrent',
      friendlyTitle: 'Distribuidor Torrent',
      category: 'system',
      onDemandTool: false,
      icon: 'share-2',
      iconKind: 'defense',
      badge: 'Rede P2P',
      multCost: 1.0,
      baseMb: 10,
      baseRam: 8,
      nonResearchable: true,
      starterOwned: false,
      starterInstalled: false,
      starterDrive: 'hd',
      desc: 'Sincronizador P2P que precisa estar rodando no seu PC para alimentar seus vírus de vendas piratas (Warez) e gerar renda.'
    },
    ddos_breaker: {
      key: 'ddos_breaker',
      filename: 'DDoS_Breaker.vbrk',
      friendlyTitle: 'Controlador de Sobrecarga (DDoS)',
      category: 'system',
      onDemandTool: true,
      icon: 'zap',
      iconKind: 'attack',
      badge: 'Ataque em Massa',
      multCost: 1.25,
      baseMb: 14,
      baseRam: 0,
      starterOwned: false,
      starterInstalled: false,
      starterDrive: 'ssd',
      desc: 'Coordena todos os seus vírus DDoS espalhados na rede para sobrecarregar servidores rivais, danificar hardware e derrubar alvos pesados.'
    },
    nmap: {
      key: 'nmap',
      filename: 'Nmap.nmap',
      friendlyTitle: 'Rastreador de Conexões (Nmap)',
      category: 'system',
      onDemandTool: true,
      icon: 'network',
      iconKind: 'stealth',
      badge: 'Contra-Espionagem',
      multCost: 1.15,
      baseMb: 12,
      baseRam: 0,
      starterOwned: false,
      starterInstalled: false,
      starterDrive: 'ssd',
      desc: 'Escaneia sob demanda sua rede para descobrir o IP de invasores conectados agora caso o Firewall deles seja menor ou igual ao seu Nmap.'
    },
    analyzer: {
      key: 'analyzer',
      filename: 'Analyzer.ana',
      friendlyTitle: 'Analisador de Hardware',
      category: 'system',
      onDemandTool: true,
      icon: 'search',
      iconKind: 'attack',
      badge: 'Diagnóstico',
      multCost: 1.3,
      baseMb: 12,
      baseRam: 0,
      maxVerInt: 30,
      starterOwned: false,
      starterInstalled: false,
      starterDrive: 'ssd',
      desc: 'Inspeciona processador, memória e internet de computadores invadidos e salva o relatório técnico no seu caderno de acessos.'
    },
    webserver: {
      key: 'webserver',
      filename: 'WebServer.exe',
      friendlyTitle: 'Servidor Web & Deface',
      category: 'system',
      onDemandTool: false,
      icon: 'globe',
      iconKind: 'defense',
      badge: 'Web Pública',
      multCost: 1.0,
      baseMb: 10,
      baseRam: 10,
      nonResearchable: true,
      starterOwned: false,
      starterInstalled: false,
      starterDrive: 'hd',
      desc: 'Publica uma página própria no seu endereço IP e habilita alterar (deface) a capa pública de servidores que você invadir.'
    },

    // --- 5 Famílias de Vírus ---
    vspam: {
      key: 'vspam',
      filename: 'Spam.vspam',
      friendlyTitle: 'Vírus de Propaganda (Spam)',
      category: 'virus',
      virusKind: 'cash_cpu',
      icon: 'bug',
      iconKind: 'virus',
      badge: 'Vírus · Renda Contínua',
      multCost: 1.0,
      baseMb: 16,
      baseRam: 10,
      starterOwned: false,
      starterDrive: 'hd',
      desc: 'Vírus leve que usa o processador da máquina invadida para disparar campanhas de spam e gerar dólares continuamente.'
    },
    vwarez: {
      key: 'vwarez',
      filename: 'Warez.vwarez',
      friendlyTitle: 'Vírus de Vendas Piratas (Warez)',
      category: 'virus',
      virusKind: 'cash_net',
      icon: 'package',
      iconKind: 'virus',
      badge: 'Vírus · Banda Larga',
      multCost: 1.2,
      baseMb: 22,
      baseRam: 14,
      starterOwned: false,
      starterDrive: 'hd',
      desc: 'Aproveita a velocidade de internet da vítima para distribuir arquivos e gerar ótimo lucro em dólar (requer Torrent ativo no seu PC).'
    },
    vminer: {
      key: 'vminer',
      filename: 'Miner.vminer',
      friendlyTitle: 'Garimpeiro de Bitcoin (Miner)',
      category: 'virus',
      virusKind: 'btc_cpu',
      icon: 'bitcoin',
      iconKind: 'virus',
      badge: 'Vírus · Mineração BTC',
      multCost: 1.55,
      baseMb: 26,
      baseRam: 18,
      starterOwned: false,
      starterDrive: 'hd',
      desc: 'Usa a potência de CPU do computador invadido para minerar frações reais de Bitcoin diretamente para sua carteira.'
    },
    vbank: {
      key: 'vbank',
      filename: 'BankTrojan.vbank',
      friendlyTitle: 'Trojan Financeiro (BankTrojan)',
      category: 'virus',
      virusKind: 'cash_fin',
      icon: 'landmark',
      iconKind: 'virus',
      badge: 'Vírus · Alto Rendimento',
      multCost: 1.85,
      baseMb: 34,
      baseRam: 26,
      starterOwned: false,
      starterDrive: 'hd',
      desc: 'Payload pesado de espionagem corporativa que gera lucros elevados quando instalado em servidores bancários e grandes empresas.'
    },
    vddos: {
      key: 'vddos',
      filename: 'DDoS_Node.vddos',
      friendlyTitle: 'Agente de Enxame (DDoS)',
      category: 'virus',
      virusKind: 'ddos_power',
      icon: 'zap',
      iconKind: 'virus',
      badge: 'Vírus · Poder de Ataque',
      multCost: 1.35,
      baseMb: 20,
      baseRam: 16,
      starterOwned: false,
      starterDrive: 'hd',
      desc: 'Transforma o servidor invadido em um nó escravo de tráfego pesado para ampliar seu poder em Gbps nos ataques de sobrecarga DDoS.'
    }
  };

  class SoftwareEngine {
    constructor() {
      this.userId = null;
      this.state = null;
      this.activeTab = 'inventory';
      this.driveFilter = 'all';
      this.currentFolderId = null;
      this.activeUploadJob = null;
      this.feedbackMessage = null;
      this.avPurgeHistory = [];
      this.lastNmapReport = null;
      this.transitions = {}; // softKey -> { mode: 'cooldown_off' | 'booting' | 'swapping', fromVerInt, toVerInt, startedAt, endsAt, durationMs }
      this.initHoverMiniTabController();
      this.startTransitionUiLoop();
      this.startVirusYieldTicker();
      this.startRemoteAvSweepLoop();
    }

    showFeedbackBanner(msg) {
      this.feedbackMessage = msg;
      if (window.winManager && window.winManager.current === 'winSoftware') {
        this.renderUI();
      }
    }

    // Controlador global da Mini-Aba flutuante (#hcHoverMiniTab) ao passar o mouse sobre qualquer app ou ícone de ação
    initHoverMiniTabController() {
      if (typeof document === 'undefined' || window.__hcHoverMiniTabBound) return;
      window.__hcHoverMiniTabBound = true;

      let hideTimer = null;
      let currentAnchor = null;

      const ensureTipEl = () => {
        let el = document.getElementById('hcHoverMiniTab');
        if (!el && document.body) {
          el = document.createElement('div');
          el.id = 'hcHoverMiniTab';
          el.setAttribute('role', 'tooltip');
          el.setAttribute('aria-hidden', 'true');
          el.addEventListener('mouseenter', () => {
            if (hideTimer) {
              clearTimeout(hideTimer);
              hideTimer = null;
            }
          });
          el.addEventListener('mouseleave', () => {
            hideTipImmediate();
          });
          document.body.appendChild(el);
        }
        return el;
      };

      const hideTipImmediate = () => {
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
        currentAnchor = null;
        const el = document.getElementById('hcHoverMiniTab');
        if (el) {
          el.classList.remove('visible');
          el.setAttribute('aria-hidden', 'true');
        }
      };

      const positionAndShowTip = (anchor) => {
        if (!anchor || !anchor.isConnected) return;
        const title = anchor.getAttribute('data-tip-title');
        if (!title) return;
        const meta = anchor.getAttribute('data-tip-meta') || '';
        const desc = anchor.getAttribute('data-tip-desc') || '';
        const tip = ensureTipEl();
        if (!tip) return;

        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
        currentAnchor = anchor;

        tip.innerHTML = `
          <div class="mht-head">
            <span class="mht-title">${esc(title)}</span>
            ${meta ? `<span class="mht-meta">${esc(meta)}</span>` : ''}
          </div>
          ${desc ? `<div class="mht-desc">${esc(desc)}</div>` : ''}
        `;
        tip.classList.add('visible');
        tip.setAttribute('aria-hidden', 'false');

        const rect = anchor.getBoundingClientRect();
        const tipRect = tip.getBoundingClientRect();
        let top = rect.top - tipRect.height - 8;
        if (top < 10) {
          top = rect.bottom + 8;
        }
        let left = rect.left + (rect.width / 2) - (tipRect.width / 2);
        const maxLeft = Math.max(10, window.innerWidth - tipRect.width - 10);
        left = Math.max(10, Math.min(maxLeft, left));

        tip.style.top = `${Math.round(top)}px`;
        tip.style.left = `${Math.round(left)}px`;
      };

      document.addEventListener('mouseover', (ev) => {
        const anchor = ev.target && ev.target.closest ? ev.target.closest('[data-tip-title]') : null;
        if (anchor) {
          positionAndShowTip(anchor);
        } else if (currentAnchor && (!ev.target || !ev.target.closest || !ev.target.closest('#hcHoverMiniTab'))) {
          if (!hideTimer) {
            hideTimer = setTimeout(hideTipImmediate, 65);
          }
        }
      }, true);

      document.addEventListener('focusin', (ev) => {
        const anchor = ev.target && ev.target.closest ? ev.target.closest('[data-tip-title]') : null;
        if (anchor) positionAndShowTip(anchor);
      }, true);

      document.addEventListener('focusout', () => {
        if (!hideTimer) hideTimer = setTimeout(hideTipImmediate, 65);
      }, true);

      document.addEventListener('mousedown', (ev) => {
        if (!ev.target || !ev.target.closest || !ev.target.closest('#hcHoverMiniTab')) {
          hideTipImmediate();
        }
      }, true);

      document.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') hideTipImmediate();
      });
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
        const inst = owned && def.category === 'system' && !def.onDemandTool ? !!def.starterInstalled : false;
        inv[k] = {
          owned,
          versionInt: owned ? 10 : 0,
          runningVerInt: inst ? 10 : 0,
          installed: inst,
          licensed: owned,
          drive: def.starterDrive || 'hd',
          folderId: null,
          hiddenWithVer: 0
        };
      }
      return inv;
    }

    normalizeState(targetState) {
      const s = targetState || {};
      if (!s.inventory || typeof s.inventory !== 'object') {
        s.inventory = this.buildStarterInventory();
      }
      if (!Array.isArray(s.deletedStarterKeys)) s.deletedStarterKeys = [];
      const deletedSet = new Set(s.deletedStarterKeys);

      const defaults = this.buildStarterInventory();
      for (const [k, defVal] of Object.entries(defaults)) {
        const def = SOFTWARE_DEFINITIONS[k];
        if (!s.inventory[k]) {
          s.inventory[k] = { ...defVal };
        } else {
          const cur = s.inventory[k];
          // Cura automática de snapshots antigos na nuvem onde ferramentas iniciais vieram zeradas sem terem sido deletadas manualmente
          if (def.starterOwned && !deletedSet.has(k) && (!cur.owned || Number(cur.versionInt || 0) <= 0)) {
            cur.owned = true;
            cur.versionInt = 10;
            cur.licensed = true;
            if (!def.onDemandTool && def.starterInstalled && cur.installed === undefined) {
              cur.installed = true;
              cur.runningVerInt = 10;
            }
          }
          if (cur.owned === undefined) {
            const inferredOwned = !!def.starterOwned || Number(cur.versionInt || 0) > 10;
            cur.owned = inferredOwned;
            if (!inferredOwned) {
              cur.versionInt = 0;
              cur.runningVerInt = 0;
              cur.installed = false;
              cur.licensed = false;
            }
          }
          // Permite deixar utilitários sob demanda rodando em 2º plano quando o jogador clicar em Rodar (⚙️), sem consumir RAM extra!
          if (cur.installed) {
            cur.runningVerInt = Number(cur.runningVerInt || cur.versionInt || 10);
          } else {
            cur.installed = false;
            cur.runningVerInt = 0;
          }
          if (cur.licensed === undefined) cur.licensed = !!cur.owned;
          if (!['hd', 'ssd', 'nvme'].includes(cur.drive)) cur.drive = def.starterDrive || 'hd';
          if (cur.folderId === undefined) cur.folderId = null;
          if (cur.hiddenWithVer === undefined) cur.hiddenWithVer = 0;
        }
      }

      if (!Array.isArray(s.localHostileInfections)) s.localHostileInfections = [];
      if (!Array.isArray(s.remoteInfections)) s.remoteInfections = [];
      if (!s.stagedRemoteViruses || typeof s.stagedRemoteViruses !== 'object') s.stagedRemoteViruses = {};
      if (typeof s.customWebPage !== 'string') {
        s.customWebPage = 'Gateway Operacional Privado // Acesso Restrito SSH Porta 22';
      }
      if (!Array.isArray(s.folders)) {
        s.folders = [];
      }
      if (!Array.isArray(s.textFiles)) {
        s.textFiles = [
          {
            id: 'txt_starter_note',
            name: 'anotacoes',
            content: 'Lembrete operacional:\n- Firewall e Hasher ficam rodando na memória protegendo o PC.\n- Cracker.crc e Antivirus.av funcionam sob demanda (basta clicar para usar).\n- Sempre apague seu IP de /var/log/syslog antes de desconectar!',
            sizeMb: 1,
            drive: 'hd',
            folderId: null,
            hiddenWithVer: 0,
            updatedAt: 'Sistema'
          }
        ];
      }
      if (!Array.isArray(s.extraCopies)) {
        // Cópia auxiliar leve de dicionário no SSD p/ demonstrar múltiplos hashes nas baias HD/SSD/NVMe do Mini-PC
        s.extraCopies = [
          {
            id: 'copy_starter_wordlist_ssd',
            softKey: 'cracker',
            customFilename: 'Wordlist_Rapida.crc',
            customTitle: 'Hash Dicionário Leve',
            versionInt: 5, // v0.5 (serve apenas p/ alvos muito fracos, mas mostra comparativo real no Mini-PC)
            sizeMb: 6,
            drive: 'ssd',
            folderId: null,
            hiddenWithVer: 0
          }
        ];
      }
      return s;
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
        this.state = this.normalizeState(saved);
        this.reconcileSavedTransitions();
      } else {
        this.state = this.normalizeState({
          inventory: this.buildStarterInventory(),
          localHostileInfections: [],
          remoteInfections: [],
          stagedRemoteViruses: {},
          activeTransitions: {},
          customWebPage: 'Gateway Operacional Privado // Acesso Restrito SSH Porta 22'
        });
        this.save();
      }
      return this.state;
    }

    reconcileSavedTransitions() {
      if (!this.state) return;
      const savedTr = this.state.activeTransitions || {};
      const now = Date.now();
      this.transitions = {};
      let mutated = false;

      Object.entries(savedTr).forEach(([k, tr]) => {
        if (!tr || !tr.endsAt) return;
        if (tr.endsAt > now) {
          this.transitions[k] = { ...tr };
        } else {
          mutated = true;
          if (tr.mode === 'booting' || tr.mode === 'swapping') {
            const cur = this.state.inventory && this.state.inventory[k];
            if (cur && cur.owned) {
              cur.installed = true;
              cur.runningVerInt = tr.toVerInt || cur.versionInt;
            }
          }
        }
      });

      if (mutated) {
        this.save();
      }
    }

    save() {
      if (!this.state) return;
      this.state.activeTransitions = { ...(this.transitions || {}) };
      try {
        localStorage.setItem(this.storageKey(this.userId), JSON.stringify(this.state));
      } catch (e) {}
    }

    fmtVer(versionInt) {
      return 'v' + (Number(versionInt || 10) / 10).toFixed(1);
    }

    // ESCALA REGRESSIVA OFICIAL DE MULTIPLICADOR DE VÍRUS (Teto v10.0 = 3.00x MÁXIMO!)
    // - v10.0 (100) -> 3.00x (máximo atual: 3x mineração BTC, 3x dinheiro Spam/Warez/Bank, 3x Gbps DDoS)
    // - Regressão linear limpa de v10.0 (3.00x) até v1.0 (1.00x): mult = 1.00 + ((v - 1.0) / 9.0) * 2.00
    // - Protótipos instáveis abaixo de v1.0 (v0.5..v0.9): regridem de 0.92x até 0.60x
    getVirusYieldMultiplier(versionInt) {
      const v = Math.max(0.5, Math.min(10.0, Number(versionInt || 10) / 10));
      if (v >= 1.0) {
        return +(1.0 + ((v - 1.0) / 9.0) * 2.0).toFixed(2);
      }
      return +(0.60 + (v - 0.5) * 0.80).toFixed(2);
    }

    getVirusEffectShortLabel(virusKey, versionInt) {
      const multStr = this.getVirusYieldMultiplier(versionInt).toFixed(2) + 'x';
      if (virusKey === 'vminer') return `${multStr} BTC`;
      if (virusKey === 'vspam') return `${multStr} $ Spam`;
      if (virusKey === 'vwarez') return `${multStr} $ P2P`;
      if (virusKey === 'vbank') return `${multStr} $ Banco`;
      if (virusKey === 'vddos') return `${multStr} DDoS`;
      return multStr;
    }

    getDefinition(softKey) {
      return SOFTWARE_DEFINITIONS[softKey] || null;
    }

    isSoftwareOwned(softKey) {
      this.ensureLoaded();
      const item = this.state.inventory[softKey];
      const hasMain = !!(item && item.owned && item.versionInt > 0);
      if (hasMain) return true;
      return (this.state.extraCopies || []).some((c) => c.softKey === softKey && c.versionInt > 0);
    }

    isOnDemandTool(softKey) {
      return !!SOFTWARE_DEFINITIONS[softKey]?.onDemandTool;
    }

    // Lista todos os hashes/quebradores de senha (Cracker.crc) presentes nas unidades HD / SSD / NVMe do seu PC
    getCrackerHashesOnMyPc(includeHidden = false) {
      this.ensureLoaded();
      const speedByDrive = { hd: 1.0, ssd: 1.12, nvme: 1.25 };
      const driveLabel = { hd: 'HD', ssd: 'SSD', nvme: 'NVMe' };
      const list = [];

      const mainCrc = this.state.inventory.cracker;
      if (mainCrc && mainCrc.owned && mainCrc.versionInt > 0) {
        const isHidden = (mainCrc.hiddenWithVer || 0) > 0;
        if (includeHidden || !isHidden) {
          const drv = ['hd', 'ssd', 'nvme'].includes(mainCrc.drive) ? mainCrc.drive : 'hd';
          list.push({
            id: 'main_cracker',
            isMain: true,
            softKey: 'cracker',
            filename: 'Cracker.crc',
            title: 'Quebrador de Senhas Principal',
            versionInt: mainCrc.versionInt,
            version: +(mainCrc.versionInt / 10).toFixed(1),
            sizeMb: this.getItemSizeMb('cracker', mainCrc.versionInt),
            drive: drv,
            driveName: driveLabel[drv],
            driveSpeedMult: speedByDrive[drv] || 1.0,
            hiddenWithVer: mainCrc.hiddenWithVer || 0
          });
        }
      }

      (this.state.extraCopies || []).forEach((cp) => {
        if (cp.softKey !== 'cracker' || cp.versionInt <= 0) return;
        const isHidden = (cp.hiddenWithVer || 0) > 0;
        if (!includeHidden && isHidden) return;
        const drv = ['hd', 'ssd', 'nvme'].includes(cp.drive) ? cp.drive : 'hd';
        list.push({
          id: cp.id,
          isMain: false,
          softKey: 'cracker',
          filename: cp.customFilename || 'Cracker.crc',
          title: cp.customTitle || 'Quebrador de Senhas (Cópia)',
          versionInt: cp.versionInt,
          version: +(cp.versionInt / 10).toFixed(1),
          sizeMb: cp.sizeMb || this.getItemSizeMb('cracker', cp.versionInt),
          drive: drv,
          driveName: driveLabel[drv],
          driveSpeedMult: speedByDrive[drv] || 1.0,
          hiddenWithVer: cp.hiddenWithVer || 0
        });
      });

      list.sort((a, b) => (b.versionInt - a.versionInt) || (b.driveSpeedMult - a.driveSpeedMult));
      return list;
    }

    // REGRA REALISTA DE EXECUÇÃO:
    // - Ferramentas SOB DEMANDA (Cracker, Antivírus, PortScan, Exploits, Hider, Seeker, Nmap, Analyzer, DDoS Breaker)
    //   rodam em segundo plano direto do seu HD/SSD/NVMe sem precisar ficar ligadas na RAM antes (desde que não estejam ocultas)!
    // - Daemons RESIDENTES (Firewall, Hasher, Collector, Torrent, WebServer) precisam estar ligados na RAM (1 por vez, com carência)!
    getSoftwareVersion(softKey) {
      this.ensureLoaded();
      const def = SOFTWARE_DEFINITIONS[softKey];
      const item = this.state.inventory[softKey];
      if (!def) return 0;

      if (def.onDemandTool) {
        if (softKey === 'cracker') {
          const hashes = this.getCrackerHashesOnMyPc(false);
          return hashes.length > 0 ? hashes[0].version : 0;
        }
        let bestInt = 0;
        if (item && item.owned && item.versionInt > 0 && !(item.hiddenWithVer > 0)) {
          bestInt = item.versionInt;
        }
        (this.state.extraCopies || []).forEach((cp) => {
          if (cp.softKey === softKey && !(cp.hiddenWithVer > 0) && cp.versionInt > bestInt) {
            bestInt = cp.versionInt;
          }
        });
        if (softKey === 'hider' && window.stealthXhdEngine && window.stealthXhdEngine.state) {
          bestInt = Math.max(bestInt, window.stealthXhdEngine.state.hiderVerInt || 0);
        }
        if (softKey === 'seeker' && window.stealthXhdEngine && window.stealthXhdEngine.state) {
          bestInt = Math.max(bestInt, window.stealthXhdEngine.state.seekerVerInt || 0);
        }
        return bestInt > 0 ? +(bestInt / 10).toFixed(1) : 0;
      }

      if (!item || !item.owned || item.versionInt <= 0) return 0;
      if (def.category === 'system') {
        if (!item.installed || this.isSoftwareInTransition(softKey)) return 0;
        return (item.runningVerInt || item.versionInt) / 10;
      }
      return item.versionInt / 10;
    }

    isSoftwareInstalled(softKey) {
      this.ensureLoaded();
      const def = SOFTWARE_DEFINITIONS[softKey];
      if (def && def.onDemandTool) {
        return this.getSoftwareVersion(softKey) > 0;
      }
      const item = this.state.inventory[softKey];
      if (this.isSoftwareInTransition(softKey)) return false;
      return !!(item && item.owned && item.installed);
    }

    isTorrentActive() {
      return this.isSoftwareInstalled('torrent');
    }

    isDdosBreakerActive() {
      return this.getSoftwareVersion('ddos_breaker') > 0;
    }

    isPortScanActive() {
      return this.getSoftwareVersion('portscan') > 0;
    }

    // Crescimento quadrático realista de Tamanho em Disco (MB) conforme a potência sobe (v1.0 -> v10.0)
    // Binários autorais enxutos compilados no Laboratório de Vírus possuem footprint otimizado (-55% bloat)
    getItemSizeMb(softKey, versionInt) {
      const def = SOFTWARE_DEFINITIONS[softKey];
      if (!def) return 20;
      const v = Math.max(1, (versionInt || 10) / 10) - 1;
      const rawMb = def.baseMb * (1 + 0.16 * v + 0.24 * v * v);
      const st = this.state && this.state.inventory && this.state.inventory[softKey];
      const labFactor = (def.category === 'virus' && st && st.customLabStrain) ? 0.45 : 1.0;
      return Math.max(4, Math.round(rawMb * labFactor));
    }

    // Consumo de RAM: apenas daemons residentes (no seu PC) e vírus (no PC da vítima!)
    getItemRamMb(softKey, versionInt, forVictim = false) {
      const def = SOFTWARE_DEFINITIONS[softKey];
      if (!def) return 12;
      if ((def.category === 'virus' || def.onDemandTool) && !forVictim) return 0;
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

    // Capacidades e uso por unidade interna (HD, SSD, NVMe) somando o armazenamento total do Hardware
    getDriveBaysSummary() {
      this.ensureLoaded();
      const totalCap = this.getMaxHddMb();
      const hdCap = Math.max(180, Math.round(totalCap * 0.62));
      const ssdCap = Math.max(90, Math.round(totalCap * 0.26));
      const nvmeCap = Math.max(40, totalCap - hdCap - ssdCap);

      const used = { hd: 0, ssd: 0, nvme: 0 };
      for (const [k, st] of Object.entries(this.state.inventory)) {
        if (st && st.owned && st.versionInt > 0) {
          const drv = ['hd', 'ssd', 'nvme'].includes(st.drive) ? st.drive : 'hd';
          used[drv] += this.getItemSizeMb(k, st.versionInt);
        }
      }
      (this.state.extraCopies || []).forEach((cp) => {
        if (cp.versionInt > 0) {
          const drv = ['hd', 'ssd', 'nvme'].includes(cp.drive) ? cp.drive : 'hd';
          used[drv] += cp.sizeMb || this.getItemSizeMb(cp.softKey, cp.versionInt);
        }
      });
      (this.state.textFiles || []).forEach((tf) => {
        const drv = ['hd', 'ssd', 'nvme'].includes(tf.drive) ? tf.drive : 'hd';
        used[drv] += tf.sizeMb || 1;
      });
      used.hd += (this.state.localHostileInfections || []).reduce((acc, inf) => acc + (inf.hddMb || 18), 0);

      return {
        hd:   { key: 'hd',   label: 'HD',   speedLabel: '1.00x', speedMult: 1.0,  usedMb: used.hd,   capMb: hdCap,   freeMb: Math.max(0, hdCap - used.hd) },
        ssd:  { key: 'ssd',  label: 'SSD',  speedLabel: '1.12x', speedMult: 1.12, usedMb: used.ssd,  capMb: ssdCap,  freeMb: Math.max(0, ssdCap - used.ssd) },
        nvme: { key: 'nvme', label: 'NVMe', speedLabel: '1.25x', speedMult: 1.25, usedMb: used.nvme, capMb: nvmeCap, freeMb: Math.max(0, nvmeCap - used.nvme) }
      };
    }

    getPlayerNetMbps() {
      if (!window.hardwareEngine) return 1;
      if (typeof window.hardwareEngine.getEffectiveNetMbps === 'function') {
        return window.hardwareEngine.getEffectiveNetMbps();
      }
      return window.hardwareEngine.getNetwork().mbps || 1;
    }

    getPlayerCpuMhz() {
      if (!window.hardwareEngine) return 800;
      if (typeof window.hardwareEngine.getEffectiveCpuMhz === 'function') {
        return window.hardwareEngine.getEffectiveCpuMhz();
      }
      return window.hardwareEngine.getCpu().mhz || 800;
    }

    getUsedRamMb() {
      this.ensureLoaded();
      let sum = 0;
      for (const [k, st] of Object.entries(this.state.inventory)) {
        const def = SOFTWARE_DEFINITIONS[k];
        if (st.owned && st.installed && !this.isSoftwareInTransition(k) && def && def.category === 'system' && !def.onDemandTool) {
          sum += this.getItemRamMb(k, st.runningVerInt || st.versionInt, false);
        }
      }
      sum += (this.state.localHostileInfections || []).reduce((acc, inf) => acc + (inf.ramMb || 32), 0);
      return sum;
    }

    getUsedHddMb() {
      const bays = this.getDriveBaysSummary();
      return bays.hd.usedMb + bays.ssd.usedMb + bays.nvme.usedMb;
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

      const prevVer = cur.versionInt;
      cur.versionInt = nextVer;
      cur.licensed = true;

      // Sincroniza Hider/Seeker com stealthXhdEngine
      if (softKey === 'hider' && window.stealthXhdEngine && window.stealthXhdEngine.state) {
        window.stealthXhdEngine.state.hiderVerInt = Math.max(window.stealthXhdEngine.state.hiderVerInt || 10, nextVer);
        window.stealthXhdEngine.save();
      }
      if (softKey === 'seeker' && window.stealthXhdEngine && window.stealthXhdEngine.state) {
        window.stealthXhdEngine.state.seekerVerInt = Math.max(window.stealthXhdEngine.state.seekerVerInt || 10, nextVer);
        window.stealthXhdEngine.save();
      }

      // Mantém versão anterior de Cracker como cópia arquivada (se couber no disco) p/ escolha no Mini-PC
      if (softKey === 'cracker' && prevVer >= 10) {
        const oldCopyMb = this.getItemSizeMb('cracker', prevVer);
        if (this.getUsedHddMb() + oldCopyMb <= this.getMaxHddMb()) {
          if (!Array.isArray(this.state.extraCopies)) this.state.extraCopies = [];
          const dup = this.state.extraCopies.some((c) => c.softKey === 'cracker' && c.versionInt === prevVer);
          if (!dup && this.state.extraCopies.filter((c) => c.softKey === 'cracker').length < 3) {
            this.state.extraCopies.push({
              id: 'copy_crc_' + prevVer + '_' + Date.now(),
              softKey: 'cracker',
              customFilename: 'Cracker.crc',
              customTitle: `Quebrador de Senhas (${this.fmtVer(prevVer)})`,
              versionInt: prevVer,
              sizeMb: oldCopyMb,
              drive: cur.drive || 'hd',
              folderId: null,
              hiddenWithVer: 0
            });
          }
        }
      }

      // REGRA REALISTA DE EXECUÇÃO NO PC:
      // Se este daemon residente JÁ estava rodando na memória (ex: Escudo v1.0), ele NÃO duplica nem pula magicamente!
      // A versão antiga (runningVerInt) continua rodando até você desligá-la e ativar a nova após o tempo de carência!
      const needsSwap = def.category === 'system' && !def.onDemandTool && cur.installed && (cur.runningVerInt || 10) < nextVer;
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

    // Registra no disco um vírus autoral desenvolvido no Laboratório de Vírus (3 Rounds: 1 + 2 + 1 blocos)
    // Trata automaticamente quando sai o MESMO VÍRUS que o jogador já possui (sem perder a versão maior e sem lotar o HD com cópias repetidas!)
    registerLabCompiledVirus({ virusKey, versionInt, maxLabVerInt, strainName, setId, setTitle, fitGrade, fitScore }) {
      this.ensureLoaded();
      const def = SOFTWARE_DEFINITIONS[virusKey];
      if (!def || def.category !== 'virus') {
        return { success: false, message: 'Família de vírus inválida.' };
      }
      const clampedVerInt = Math.max(6, Math.min(100, Math.round(Number(versionInt) || 10)));
      const capVerInt = Math.max(clampedVerInt, Math.min(100, Math.round(Number(maxLabVerInt) || 100)));
      const cur = this.state.inventory[virusKey] || {
        owned: false,
        installed: false,
        versionInt: 0,
        runningVerInt: 0,
        drive: 'hd',
        hiddenWithVer: 0
      };

      const alreadyOwned = !!(cur.owned && (cur.versionInt || 0) > 0);
      const prevVerInt = alreadyOwned ? (cur.versionInt || 0) : 0;
      let outcomeMode = 'new_unlock'; // 'new_unlock' | 'upgraded_existing' | 'duplicate_refined' | 'duplicate_maxed'
      let refineBonusInt = 0;

      cur.owned = true;
      cur.licensed = true; // Vírus desenvolvido por você já nasce licenciado!
      if (!['hd', 'ssd', 'nvme'].includes(cur.drive)) {
        cur.drive = 'hd';
      }

      if (!alreadyOwned) {
        outcomeMode = 'new_unlock';
        cur.versionInt = clampedVerInt;
        cur.customLabStrain = {
          strainName: strainName || def.filename,
          setId: setId || null,
          setTitle: setTitle || null,
          fitGrade: fitGrade || 'B',
          fitScore: fitScore || 65
        };
      } else if (clampedVerInt > prevVerInt) {
        outcomeMode = 'upgraded_existing';
        cur.versionInt = clampedVerInt;
        cur.customLabStrain = {
          strainName: strainName || def.filename,
          setId: setId || null,
          setTitle: setTitle || null,
          fitGrade: fitGrade || 'B',
          fitScore: fitScore || 65
        };
      } else {
        // O jogador JÁ TINHA esse mesmo vírus em versão igual ou mais forte!
        // Preserva o mais forte, recicla os blocos compatíveis para lapidar +v0.1/+v0.2 (até o teto do nível/v10.0) e não entope o HD!
        if (prevVerInt < capVerInt && prevVerInt < 100) {
          refineBonusInt = (Number(fitScore) >= 74) ? 2 : 1;
          cur.versionInt = Math.min(100, Math.min(capVerInt, prevVerInt + refineBonusInt));
          outcomeMode = 'duplicate_refined';
        } else {
          outcomeMode = 'duplicate_maxed';
        }
        if (!cur.customLabStrain) {
          cur.customLabStrain = {
            strainName: strainName || def.filename,
            setId: setId || null,
            setTitle: setTitle || null,
            fitGrade: fitGrade || 'B',
            fitScore: fitScore || 65
          };
        }
      }

      this.state.inventory[virusKey] = cur;

      // Remove antigas cópias duplicadas da mesma família em extraCopies para não desperdiçar espaço com repetidos!
      if (Array.isArray(this.state.extraCopies)) {
        this.state.extraCopies = this.state.extraCopies.filter((c) => !(c.isLabVirus && c.softKey === virusKey));
      }

      this.save();
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
      this.renderUI();

      return {
        success: true,
        alreadyOwned,
        outcomeMode,
        refineBonusInt,
        upgradedMain: outcomeMode === 'new_unlock' || outcomeMode === 'upgraded_existing' || refineBonusInt > 0,
        prevVersion: prevVerInt > 0 ? this.fmtVer(prevVerInt) : null,
        prevMultiplier: prevVerInt > 0 ? this.getVirusYieldMultiplier(prevVerInt) : null,
        activeVersion: this.fmtVer(cur.versionInt),
        activeVersionInt: cur.versionInt,
        activeMultiplier: this.getVirusYieldMultiplier(cur.versionInt),
        compiledVersion: this.fmtVer(clampedVerInt),
        compiledMultiplier: this.getVirusYieldMultiplier(clampedVerInt)
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
      this.save();
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);

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
      this.save();
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);

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
      this.save();
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);

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

    // REGRA ESTRITA: Antivirus.av roda SOB DEMANDA (não precisa ficar ligado na memória antes) e limpa vírus VISÍVEIS com versão <= Antivirus.av!
    runLocalAntivirus() {
      this.ensureLoaded();
      const av = this.state.inventory.antivirus;
      if (!av || !av.owned || av.versionInt <= 0) {
        const msg = 'Você ainda NÃO possui o Antivirus.av no seu disco! Baixe grátis no Download Center ou use Formatar Disco!';
        alert(msg);
        return { success: false, code: 'AV_NOT_OWNED', cleaned: 0, remaining: this.state.localHostileInfections.length, message: msg };
      }
      if ((av.hiddenWithVer || 0) > 0) {
        const msg = 'Seu Antivirus.av está escondido (camuflado)! Clique em "Revelar" na linha dele antes de rodar a varredura.';
        alert(msg);
        return { success: false, code: 'AV_HIDDEN', cleaned: 0, remaining: this.state.localHostileInfections.length, message: msg };
      }

      const avVer = av.versionInt;
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
      if (!nm || !nm.owned || nm.versionInt <= 0) {
        const msg = 'Você ainda não possui o Nmap.nmap no seu disco!';
        alert(msg);
        return { success: false, message: msg };
      }
      if ((nm.hiddenWithVer || 0) > 0) {
        const msg = 'Revele o Nmap.nmap antes de executá-lo!';
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
      const activeKeys = new Set(virusesHere.map((v) => v.virusKey));
      const stagedHere = this.getStagedVirusesOnIp(host.ip).filter((sv) => !activeKeys.has(sv.virusKey));
      const virusesHddMb = virusesHere.reduce((s, v) => s + this.getItemSizeMb(v.virusKey, v.versionInt), 0)
        + stagedHere.reduce((s, sv) => s + (sv.sizeMb || this.getItemSizeMb(sv.virusKey, sv.versionInt)), 0);
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

    getStagedVirusesOnIp(ip) {
      this.ensureLoaded();
      if (!this.state.stagedRemoteViruses) this.state.stagedRemoteViruses = {};
      return Array.isArray(this.state.stagedRemoteViruses[ip]) ? this.state.stagedRemoteViruses[ip] : [];
    }

    // Amostra básica liberada no 1º Tutorial (Ensei Tankado) para treinar Upload -> Executar -> Apagar Log!
    grantTutorialStarterSample() {
      this.ensureLoaded();
      let granted = false;
      ['vspam', 'collector'].forEach((k) => {
        const cur = this.state.inventory[k];
        if (cur && (!cur.owned || cur.versionInt <= 0)) {
          cur.owned = true;
          cur.versionInt = 10;
          cur.licensed = true;
          if (k === 'collector') {
            cur.installed = true;
            cur.runningVerInt = 10;
          }
          granted = true;
        }
      });
      if (granted) {
        this.save();
        if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('TUTORIAL-KIT', 'Mestre Tankado liberou amostra básica Spam.vspam v1.0 + Recolhedor v1.0 para o seu treinamento!', 'success');
        }
      }
      return granted;
    }

    installVirusOnRemote(host, virusKey, opts = {}) {
      this.ensureLoaded();
      if (!host || host.notFound || host.kind === 'self') {
        return { success: false, message: 'Alvo inválido para instalação de vírus.' };
      }
      if (!window.internetEngine || window.internetEngine.activeSshIp !== host.ip) {
        return { success: false, message: 'Conecte-se ao PC alvo antes de executar um vírus!' };
      }

      const def = SOFTWARE_DEFINITIONS[virusKey];
      const inv = this.state.inventory[virusKey];
      const stagedList = this.getStagedVirusesOnIp(host.ip);
      const stagedItem = stagedList.find((sv) => sv.virusKey === virusKey);
      const targetVerInt = stagedItem ? stagedItem.versionInt : (inv ? inv.versionInt : 0);

      if (!def || def.category !== 'virus' || targetVerInt <= 0 || (!stagedItem && (!inv || !inv.owned))) {
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
      const newSizeMb = this.getItemSizeMb(virusKey, targetVerInt);
      const newRamMb = this.getItemRamMb(virusKey, targetVerInt, true);

      // Se o arquivo já estava subido (staged) no disco da vítima, o espaço dele já está contabilizado em specs.hddUsedMb!
      const alreadyCountedHddMb = existing
        ? this.getItemSizeMb(virusKey, existing.versionInt)
        : (stagedItem ? (stagedItem.sizeMb || newSizeMb) : 0);
      const oldRamMb = existing ? this.getItemRamMb(virusKey, existing.versionInt, true) : 0;

      if (existing && existing.versionInt >= targetVerInt) {
        return {
          success: false,
          code: 'ALREADY_INSTALLED',
          message: `${def.filename} (${this.fmtVer(existing.versionInt)}) já está rodando em ${host.ip}! Pesquise uma potência maior primeiro.`
        };
      }

      // 1) Checagem Física de Armazenamento (HDD) no PC da Vítima!
      if (newSizeMb - alreadyCountedHddMb > specs.hddFreeMb) {
        return {
          success: false,
          code: 'TARGET_HDD_FULL',
          message: `ARMAZENAMENTO INSUFICIENTE NO ALVO! Seu ${def.filename} (${this.fmtVer(targetVerInt)}) ocupa ${newSizeMb} MB, mas ${host.hostname} [${host.ip}] só tem ${specs.hddFreeMb + alreadyCountedHddMb} MB livres em disco!`
        };
      }

      // 2) Checagem Física de Memória RAM Livre no PC da Vítima!
      if (newRamMb - oldRamMb > specs.ramFreeMb) {
        return {
          success: false,
          code: 'TARGET_RAM_FULL',
          message: `MEMÓRIA RAM INSUFICIENTE NO ALVO! Seu ${def.filename} (${this.fmtVer(targetVerInt)}) exige ${newRamMb} MB de RAM, mas ${host.ip} só tem ${specs.ramFreeMb + oldRamMb} MB livres (${specs.ramUsedMb}/${specs.ramTotalMb} MB em uso)!`
        };
      }

      if (existing) {
        existing.versionInt = targetVerInt;
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
          versionInt: targetVerInt,
          sizeMb: newSizeMb,
          ramMb: newRamMb,
          installedAt: new Date().toLocaleString('pt-BR'),
          accumulatedCash: 0,
          accumulatedSats: 0
        });
      }

      // Remove da lista de "aguardando executar" já que agora entrou em execução na RAM da vítima!
      if (this.state.stagedRemoteViruses && Array.isArray(this.state.stagedRemoteViruses[host.ip])) {
        this.state.stagedRemoteViruses[host.ip] = this.state.stagedRemoteViruses[host.ip].filter((sv) => sv.virusKey !== virusKey);
      }
      this.save();

      const visibleIp = window.bounceEngine
        ? window.bounceEngine.routeConnectionAndGetVisibleIp(host.ip).visibleIp
        : (window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0');
      window.internetEngine.appendServerLog(
        host.ip,
        opts.fromStaged
          ? `${visibleIp} executed virus /root/${def.filename} (${this.fmtVer(targetVerInt)}, ${newRamMb}MB RAM)`
          : `${visibleIp} uploaded (${newSizeMb}MB) and executed ${def.filename} (${this.fmtVer(targetVerInt)})`
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
            ver: targetVerInt,
            hiddenWithVer: 0,
            crcVer: myCrc,
            expVer: myExp
          }
        });
      }
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('VIRUS-EXEC', `${def.filename} (${this.fmtVer(targetVerInt)}, ${newSizeMb}MB) EXECUTADO na memória de ${host.hostname} [${host.ip}]`, 'warning');
      }
      if (window.currentProfile) {
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 12;
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      }
      if (window.hackerAudio) window.hackerAudio.playMalwareInstalled();

      const avWarn = specs.antivirusVer > 0 && (targetVerInt / 10) <= specs.antivirusVer
        ? ` CUIDADO: O alvo possui Antivirus.av v${specs.antivirusVer.toFixed(1)} e pode expurgar este vírus na próxima varredura!`
        : '';

      return {
        success: true,
        sizeMb: newSizeMb,
        ramMb: newRamMb,
        message: `✅ ${def.filename} (${this.fmtVer(targetVerInt)}) EXECUTADO em ${host.ip}! Lembre-se de apagar seu IP na aba Logs antes de sair!${avWarn}`
      };
    }

    // ETAPA 1 DE 2: Apenas SUBIR (Upload) o arquivo do vírus para o HD da vítima (ainda sem executar!)
    stageUploadVirusToRemote(host, virusKey, onDone) {
      return this.uploadVirusWithBandwidth(host, virusKey, onDone, { stageOnly: true });
    }

    // ETAPA 2 DE 2: EXECUTAR o vírus que já foi subido para o HD da vítima!
    executeStagedVirusOnRemote(host, virusKey) {
      this.ensureLoaded();
      const staged = this.getStagedVirusesOnIp(host.ip).find((sv) => sv.virusKey === virusKey);
      if (!staged) {
        return { success: false, code: 'NOT_STAGED', message: 'Suba primeiro o arquivo do vírus para o HD da vítima antes de executar!' };
      }
      const res = this.installVirusOnRemote(host, virusKey, { fromStaged: true });
      if (window.tutorialEngine && res.success) {
        window.tutorialEngine.onFileReadOrVirusPlanted(host.ip);
      }
      if (window.internetEngine) window.internetEngine.render();
      return res;
    }

    // Upload assíncrono com barra de progresso real governada pela velocidade da sua Internet vs Internet do alvo!
    uploadVirusWithBandwidth(host, virusKey, onDone, opts = {}) {
      this.ensureLoaded();
      const stageOnly = !!opts.stageOnly;
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
      const alreadyStaged = this.getStagedVirusesOnIp(host.ip).find((sv) => sv.virusKey === virusKey);
      const oldSize = existing
        ? this.getItemSizeMb(virusKey, existing.versionInt)
        : (alreadyStaged ? (alreadyStaged.sizeMb || 0) : 0);
      const oldRam = existing ? this.getItemRamMb(virusKey, existing.versionInt, true) : 0;

      if (existing && existing.versionInt >= invCheck.versionInt) {
        return { started: false, message: `${def.filename} já está rodando nesta potência em ${host.ip}!` };
      }
      if (stageOnly && alreadyStaged && alreadyStaged.versionInt >= invCheck.versionInt) {
        return { started: false, code: 'ALREADY_STAGED', message: `${def.filename} já foi subido para o HD de ${host.ip}! Clique em "▶ Executar no PC da Vítima".` };
      }
      if (tr.sizeMb - oldSize > tr.specs.hddFreeMb) {
        return {
          started: false,
          code: 'TARGET_HDD_FULL',
          message: `Não cabe no HD de ${host.ip}! Precisa de ${tr.sizeMb} MB, livre: ${tr.specs.hddFreeMb + oldSize} MB (apague arquivos em /root do alvo ou escolha máquina maior).`
        };
      }
      if (!stageOnly && tr.ramNeededMb - oldRam > tr.specs.ramFreeMb) {
        return {
          started: false,
          code: 'TARGET_RAM_FULL',
          message: `Memória RAM insuficiente no alvo! Precisa de ${tr.ramNeededMb} MB livres, disponível: ${tr.specs.ramFreeMb + oldRam} MB.`
        };
      }

      const verNumStr = (invCheck.versionInt / 10).toFixed(1);
      this.activeUploadJob = {
        targetIp: host.ip,
        virusKey,
        filename: def.filename,
        sizeMb: tr.sizeMb,
        myMbps: tr.myMbps,
        targetMbps: tr.targetMbps,
        durationSec: tr.durationSec,
        stageOnly,
        pct: 8,
        pid: null
      };

      const finalizeVirusUpload = () => {
        this.activeUploadJob = null;
        if (!window.internetEngine || window.internetEngine.activeSshIp !== host.ip) {
          if (typeof window.showToast === 'function') window.showToast('Upload abortado: conexão encerrada antes do término!');
          return;
        }

        if (stageOnly) {
          if (!this.state.stagedRemoteViruses) this.state.stagedRemoteViruses = {};
          const curList = (this.state.stagedRemoteViruses[host.ip] || []).filter((sv) => sv.virusKey !== virusKey);
          curList.unshift({
            virusKey,
            filename: def.filename,
            friendlyTitle: def.friendlyTitle || def.filename,
            versionInt: invCheck.versionInt,
            sizeMb: tr.sizeMb,
            ramMb: tr.ramNeededMb,
            uploadedAt: new Date().toLocaleTimeString()
          });
          this.state.stagedRemoteViruses[host.ip] = curList;
          this.save();

          const visibleIp = window.bounceEngine
            ? window.bounceEngine.routeConnectionAndGetVisibleIp(host.ip).visibleIp
            : (window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0');
          if (window.internetEngine) {
            window.internetEngine.appendServerLog(
              host.ip,
              `${visibleIp} uploaded file /root/${def.filename} (${this.fmtVer(invCheck.versionInt)}, ${tr.sizeMb}MB)`
            );
          }
          if (typeof window.addLocalLog === 'function') {
            window.addLocalLog('VIRUS-UPLOAD', `Arquivo ${def.filename} (${this.fmtVer(invCheck.versionInt)}, ${tr.sizeMb}MB) subido p/ ${host.ip}:/root (aguardando executar!)`, 'info');
          }
          if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
          const stageRes = {
            success: true,
            stagedOnly: true,
            virusKey,
            sizeMb: tr.sizeMb,
            message: `📦 1/2 ${def.filename} subido pro disco de ${host.ip}! Agora clique em "▶ Executar no PC da Vítima"!`
          };
          if (typeof onDone === 'function') onDone(stageRes);
          if (window.internetEngine) window.internetEngine.render();
          return;
        }

        const res = this.installVirusOnRemote(host, virusKey);
        if (typeof onDone === 'function') onDone(res);
        if (window.internetEngine) window.internetEngine.render();
      };

      if (window.taskManager) {
        const idealSec = Math.max(1.3, tr.durationSec);
        const enq = window.taskManager.enqueue({
          dedupeKey: `up_virus_${host.ip}_${virusKey}`,
          title: `Subir ${def.filename} (${verNumStr}) para ${host.ip}`,
          labelHtml: `Subir arquivo <strong>${esc(def.filename)}</strong> (${verNumStr}) para ${esc(host.ip)}`,
          subtitle: `Rede · ${tr.sizeMb} MB @ ${tr.myMbps} Mbps`,
          targetIp: host.ip,
          queueKind: 'net',
          category: 'Rede',
          idealSeconds: idealSec,
          onComplete: finalizeVirusUpload,
          onCancel: () => {
            this.activeUploadJob = null;
            if (window.internetEngine) window.internetEngine.render();
          }
        });

        if (enq.started) {
          this.activeUploadJob.pid = enq.process.pid;
          const watchConn = setInterval(() => {
            const proc = window.taskManager.processes.find((x) => x.pid === enq.process.pid);
            if (!proc || proc.status !== 'running') {
              clearInterval(watchConn);
              return;
            }
            if (!window.internetEngine || window.internetEngine.activeSshIp !== host.ip) {
              clearInterval(watchConn);
              window.taskManager.cancelProcess(enq.process.pid);
              if (typeof window.showToast === 'function') window.showToast('Upload abortado: conexão encerrada antes do término!');
              return;
            }
            const pct = Math.min(99, Math.round((proc.workDone / proc.workTotal) * 100));
            if (this.activeUploadJob) this.activeUploadJob.pct = pct;
          }, 150);

          if (window.internetEngine) window.internetEngine.render();
          return { started: true, durationSec: idealSec, sizeMb: tr.sizeMb, pid: enq.process.pid };
        }
      }

      if (window.internetEngine) window.internetEngine.render();
      const steps = Math.max(3, Math.round(tr.durationSec / 0.25));
      let curStep = 0;
      const timer = setInterval(() => {
        if (!window.internetEngine || window.internetEngine.activeSshIp !== host.ip) {
          clearInterval(timer);
          this.activeUploadJob = null;
          return;
        }
        curStep++;
        const pct = Math.min(100, Math.round((curStep / steps) * 100));
        if (this.activeUploadJob) this.activeUploadJob.pct = pct;
        if (pct >= 100) {
          clearInterval(timer);
          finalizeVirusUpload();
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

    // FÓRMULA MONETÁRIA REGRESSIVA OFICIAL (Base Teto v10.0 = 3.00x -> regredindo até v1.0 = 1.00x e v0.5 = 0.60x):
    // Depende de CPU (MHz) do alvo, Internet (Mbps) do alvo, Multiplicador Regressivo da Versão (getVirusYieldMultiplier) e Divisão de Carga!
    computeInfectionPerSec(v) {
      const def = SOFTWARE_DEFINITIONS[v.virusKey];
      if (!def) return { cashPerSec: 0, satsPerSec: 0, gbps: 0, yieldMult: 1, pausedReason: null };

      const host = window.internetEngine ? window.internetEngine.resolveHost(v.targetIp) : null;
      const cpuMhz = (host && host.cpuMhz) || v.targetCpuMhz || 800;
      const netMbps = (host && host.netMbps) || v.targetNetMbps || 4;
      const yieldMult = this.getVirusYieldMultiplier(v.versionInt || 10);

      const siblings = this.getRemoteVirusesOnIp(v.targetIp);
      const cpuSiblings = Math.max(1, siblings.filter((s) => ['vspam', 'vminer', 'vbank'].includes(s.virusKey)).length);
      const netSiblings = Math.max(1, siblings.filter((s) => ['vwarez', 'vddos'].includes(s.virusKey)).length);
      const cpuShare = 1 / Math.pow(cpuSiblings, 0.75);
      const netShare = 1 / Math.pow(netSiblings, 0.75);

      if (v.virusKey === 'vspam') {
        const cashPerSec = +(((cpuMhz / 1000) * 0.036 * yieldMult * cpuShare)).toFixed(4);
        return { cashPerSec, satsPerSec: 0, gbps: 0, yieldMult, pausedReason: null };
      }
      if (v.virusKey === 'vwarez') {
        // Regra Oficial HE (softwares.txt): Vírus Warez EXIGE Torrent.torrent rodando na SUA lista de software!
        if (!this.isTorrentActive()) {
          return { cashPerSec: 0, satsPerSec: 0, gbps: 0, yieldMult, pausedReason: 'PAUSADO: Ative Torrent.torrent na sua RAM!' };
        }
        const cashPerSec = +(((Math.pow(netMbps, 0.68) / 8) * 0.052 * yieldMult * netShare)).toFixed(4);
        return { cashPerSec, satsPerSec: 0, gbps: 0, yieldMult, pausedReason: null };
      }
      if (v.virusKey === 'vbank') {
        const finMult = v.targetKind === 'banco' ? 1.85 : (v.targetKind === 'empresa' ? 1.35 : 0.65);
        const cashPerSec = +((((cpuMhz / 1000) * 0.042 + (Math.pow(netMbps, 0.55) / 10) * 0.030) * yieldMult * finMult * cpuShare)).toFixed(4);
        return { cashPerSec, satsPerSec: 0, gbps: 0, yieldMult, pausedReason: null };
      }
      if (v.virusKey === 'vminer') {
        const satsPerSec = Math.max(1, Math.round((cpuMhz / 1000) * 20 * yieldMult * cpuShare));
        return { cashPerSec: 0, satsPerSec, gbps: 0, yieldMult, pausedReason: null };
      }
      if (v.virusKey === 'vddos') {
        const gbps = +((((cpuMhz / 2200) + (netMbps / 220)) * 0.65 * yieldMult * netShare)).toFixed(2);
        return { cashPerSec: 0, satsPerSec: 0, gbps: Math.max(0.15, gbps), yieldMult, pausedReason: null };
      }
      return { cashPerSec: 0, satsPerSec: 0, gbps: 0, yieldMult, pausedReason: null };
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

      const applyHarvestRewards = () => {
        if (summary.cashReady > 0 && window.currentWallet) {
          window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) + summary.cashReady).toFixed(2);
        }
        const repGain = Math.min(60, 5 + Math.floor(summary.cashReady * 0.12) + Math.floor(summary.satsReady / 1500));
        if (window.currentProfile) {
          window.currentProfile.reputation = (window.currentProfile.reputation || 0) + repGain;
        }
      };
      if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
        window.integrityGuard.runAuthorized(applyHarvestRewards);
      } else {
        applyHarvestRewards();
      }
      if (summary.satsReady > 0 && window.bitcoinEngine) {
        window.bitcoinEngine.creditSats(
          summary.satsReady,
          'VMINER',
          `Coleta Collector.vcol (${summary.collectorMult.toFixed(2)}x) de mineradores remotos`
        );
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

    // =========================================================================
    // GERENCIADOR DE ARQUIVOS & APLICATIVOS (ESCONDER, MOVER, APAGAR, RODAR, PASTAS, .TXT, DONUT SVG)
    // =========================================================================
    versionTierClass(verInt) {
      const v = (verInt || 10) / 10;
      if (v >= 5.0) return 'v-tier4';
      if (v >= 3.0) return 'v-tier3';
      if (v >= 1.5) return 'v-tier2';
      return 'v-tier1';
    }

    renderDonutSvg(usedMb, totalMb, labelTitle = 'Uso do Disco') {
      const safeTotal = Math.max(1, Number(totalMb || 100));
      const safeUsed = Math.max(0, Number(usedMb || 0));
      const pct = Math.min(100, Math.round((safeUsed / safeTotal) * 100));
      const r = 46;
      const c = +(2 * Math.PI * r).toFixed(2);
      const offset = +(c - (pct / 100) * c).toFixed(2);
      const strokeColor = pct >= 88 ? '#f0a03a' : '#35b877';
      const fmtCap = (mb) => (mb >= 1024 ? `${+(mb / 1024).toFixed(2)} GB` : `${Math.round(mb)} MB`);

      return `
        <div class="soft-donut-wrap">
          <svg class="soft-donut-svg" viewBox="0 0 116 116" aria-label="${esc(labelTitle)} ${pct}%">
            <circle cx="58" cy="58" r="${r}" fill="none" stroke="#222832" stroke-width="8"></circle>
            <circle cx="58" cy="58" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="8"
              stroke-linecap="round"
              stroke-dasharray="${c}"
              stroke-dashoffset="${offset}"
              transform="rotate(-90 58 58)"></circle>
            <text x="58" y="63" text-anchor="middle" fill="#ebeff4" font-family="var(--hc-font-mono)" font-size="18" font-weight="700">${pct}%</text>
          </svg>
          <div class="soft-donut-title">${esc(labelTitle)}</div>
          <div class="soft-donut-numbers">
            <span class="used">${fmtCap(safeUsed)}</span> / <span class="total">${fmtCap(safeTotal)}</span>
          </div>
        </div>
      `;
    }

    ensureActionModalRoot() {
      let el = document.getElementById('softActionOverlay');
      if (!el) {
        el = document.createElement('div');
        el.id = 'softActionOverlay';
        el.className = 'minipc-backdrop';
        el.addEventListener('click', (ev) => {
          if (ev.target === el) this.closeActionModal();
        });
        document.body.appendChild(el);
      }
      return el;
    }

    closeActionModal() {
      const el = document.getElementById('softActionOverlay');
      if (el) el.classList.remove('open');
    }

    runLocalItem(kind, idOrKey) {
      this.ensureLoaded();
      if (kind === 'folder') {
        this.currentFolderId = idOrKey;
        this.renderUI();
        return;
      }
      if (kind === 'txt') {
        this.openTextEditorModal(idOrKey);
        return;
      }

      let softKey = idOrKey;
      let hiddenVer = 0;
      if (kind === 'copy') {
        const cp = (this.state.extraCopies || []).find((c) => c.id === idOrKey);
        if (!cp) return;
        softKey = cp.softKey;
        hiddenVer = cp.hiddenWithVer || 0;
      } else {
        const st = this.state.inventory[softKey];
        if (!st || !st.owned) return;
        hiddenVer = st.hiddenWithVer || 0;
      }

      if (hiddenVer > 0) {
        this.notifyActionBlocked('Este programa está escondido! Clique em "Revelar" antes de rodá-lo.');
        return;
      }

      const def = SOFTWARE_DEFINITIONS[softKey];
      if (!def) return;

      if (def.category === 'virus') {
        this.notifyActionBlocked('Vírus não devem ser executados no seu próprio PC! Invada um alvo na Internet e suba o arquivo lá.');
        return;
      }

      if (softKey === 'antivirus') {
        this.runLocalAntivirus();
        return;
      }
      if (softKey === 'nmap') {
        this.runLocalNmapScan();
        return;
      }
      if (softKey === 'seeker') {
        const mySkr = this.getSoftwareVersion('seeker') || 1.0;
        let revFiles = 0;
        Object.values(this.state.inventory).forEach((it) => {
          if (it && (it.hiddenWithVer || 0) > 0 && mySkr >= it.hiddenWithVer) {
            it.hiddenWithVer = 0;
            revFiles++;
          }
        });
        (this.state.extraCopies || []).forEach((cp) => {
          if ((cp.hiddenWithVer || 0) > 0 && mySkr >= cp.hiddenWithVer) {
            cp.hiddenWithVer = 0;
            revFiles++;
          }
        });
        (this.state.textFiles || []).forEach((tf) => {
          if ((tf.hiddenWithVer || 0) > 0 && mySkr >= tf.hiddenWithVer) {
            tf.hiddenWithVer = 0;
            revFiles++;
          }
        });
        this.save();
        this.runLocalSeekerScan();
        if (revFiles > 0 && typeof window.showToast === 'function') {
          window.showToast(`Seeker.skr (v${mySkr.toFixed(1)}) também revelou ${revFiles} arquivo(s) oculto(s) no seu disco!`);
        }
        return;
      }
      if (softKey === 'cracker') {
        if (window.internetEngine && window.internetEngine.currentIp && window.internetEngine.currentIp !== '71.4.20.1') {
          if (typeof window.navTo === 'function') window.navTo('winBrowser');
          window.internetEngine.switchTab('invadir');
          if (typeof window.internetEngine.openCrackerMiniPc === 'function') {
            window.internetEngine.openCrackerMiniPc();
          }
        } else {
          if (typeof window.navTo === 'function') window.navTo('winBrowser');
          if (typeof window.showToast === 'function') {
            window.showToast('Cracker pronto em segundo plano! Escolha um alvo na Internet e clique em "Quebrar senha" para abrir o Mini-PC.');
          }
        }
        return;
      }

      if (def.onDemandTool) {
        if (typeof window.showToast === 'function') {
          window.showToast(`${def.filename} funciona sob demanda em segundo plano — não precisa ficar ligado gastando memória RAM!`);
        }
        return;
      }

      // Daemon residente (Firewall, Hasher, Collector, Torrent, WebServer)
      const cur = this.state.inventory[softKey];
      if (cur && cur.installed && !this.isSoftwareInTransition(softKey) && cur.versionInt > (cur.runningVerInt || cur.versionInt)) {
        this.swapToLatestVersion(softKey);
        return;
      }
      this.toggleLocalInstall(softKey);
    }

    toggleHideLocalItem(kind, idOrKey) {
      this.ensureLoaded();
      const myHider = this.getSoftwareVersion('hider') || (window.stealthXhdEngine ? window.stealthXhdEngine.getHiderVer() : 1.0);
      const mySeeker = this.getSoftwareVersion('seeker') || (window.stealthXhdEngine ? window.stealthXhdEngine.getSeekerVer() : 1.0);

      let target = null;
      let label = '';
      if (kind === 'soft') {
        const st = this.state.inventory[idOrKey];
        const def = SOFTWARE_DEFINITIONS[idOrKey];
        if (!st || !def) return;
        if (st.installed) {
          this.notifyActionBlocked('Pare o programa primeiro antes de escondê-lo no disco!');
          return;
        }
        target = st;
        label = def.filename;
      } else if (kind === 'copy') {
        target = (this.state.extraCopies || []).find((c) => c.id === idOrKey);
        label = target ? (target.customFilename || 'Cracker.crc') : '';
      } else if (kind === 'txt') {
        target = (this.state.textFiles || []).find((t) => t.id === idOrKey);
        label = target ? `${target.name}.txt` : '';
      }
      if (!target) return;

      if ((target.hiddenWithVer || 0) > 0) {
        if (mySeeker < target.hiddenWithVer) {
          this.notifyActionBlocked(`Arquivo oculto com Hider v${target.hiddenWithVer.toFixed(1)}! Seu Seeker (v${mySeeker.toFixed(1)}) precisa ser >= v${target.hiddenWithVer.toFixed(1)}.`);
          return;
        }
        target.hiddenWithVer = 0;
        this.save();
        if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
        if (typeof window.showToast === 'function') window.showToast(`${label} revelado com Seeker v${mySeeker.toFixed(1)}!`);
      } else {
        target.hiddenWithVer = myHider;
        this.save();
        if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
        if (typeof window.showToast === 'function') window.showToast(`${label} escondido no disco com Hider v${myHider.toFixed(1)}!`);
      }
      this.renderUI();
    }

    openMoveModal(kind, idOrKey) {
      this.ensureLoaded();
      let label = '';
      let sizeMb = 1;
      let curDrive = 'hd';
      let curFolder = null;
      let softKeyForXhd = null;

      if (kind === 'soft') {
        const st = this.state.inventory[idOrKey];
        const def = SOFTWARE_DEFINITIONS[idOrKey];
        if (!st || !def) return;
        label = `${def.filename} (${this.fmtVer(st.versionInt)})`;
        sizeMb = this.getItemSizeMb(idOrKey, st.versionInt);
        curDrive = st.drive || 'hd';
        curFolder = st.folderId || null;
        softKeyForXhd = idOrKey;
      } else if (kind === 'copy') {
        const cp = (this.state.extraCopies || []).find((c) => c.id === idOrKey);
        if (!cp) return;
        label = `${cp.customFilename || 'Cracker.crc'} (${this.fmtVer(cp.versionInt)})`;
        sizeMb = cp.sizeMb || 10;
        curDrive = cp.drive || 'hd';
        curFolder = cp.folderId || null;
      } else if (kind === 'txt') {
        const tf = (this.state.textFiles || []).find((t) => t.id === idOrKey);
        if (!tf) return;
        label = `${tf.name}.txt`;
        sizeMb = tf.sizeMb || 1;
        curDrive = tf.drive || 'hd';
        curFolder = tf.folderId || null;
      }

      const bays = this.getDriveBaysSummary();
      const folders = this.state.folders || [];
      const xhd = window.stealthXhdEngine ? window.stealthXhdEngine.getXhdInfo() : { capMb: 0, freeMb: 0 };
      const modal = this.ensureActionModalRoot();

      modal.innerHTML = `
        <div class="minipc-window" style="width:min(500px,100%);">
          <div class="minipc-titlebar">
            <div class="minipc-title-left">
              <div class="minipc-title-icon">${HC.icon('folder-input')}</div>
              <div>
                <strong style="font-size:14px;">Mover Aplicativo / Arquivo</strong>
                <div style="font-size:11.5px;color:var(--hc-text-3);">${esc(label)} · ${sizeMb} MB</div>
              </div>
            </div>
            <button type="button" class="hc-btn ghost sm" onclick="window.softwareEngine.closeActionModal()">Fechar ✕</button>
          </div>
          <div class="minipc-body">
            <div class="hc-eyebrow">1. Escolher Unidade de Armazenamento (HD / SSD / NVMe)</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
              ${['hd', 'ssd', 'nvme'].map((dk) => {
                const b = bays[dk];
                const isCur = curDrive === dk;
                const fits = isCur || b.freeMb >= sizeMb;
                return `
                  <button type="button" class="minipc-drive-tab ${isCur ? 'active' : ''}" ${!fits ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}
                    onclick="window.softwareEngine.confirmMoveItem('${esc(kind)}', '${esc(idOrKey)}', '${dk}', ${curFolder ? `'${esc(curFolder)}'` : 'null'})">
                    <span class="minipc-drive-name">${b.label} · ${b.speedLabel}</span>
                    <span class="minipc-drive-sub">${b.freeMb} MB livres de ${b.capMb} MB</span>
                  </button>
                `;
              }).join('')}
            </div>

            ${softKeyForXhd ? `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 12px;background:var(--hc-inset);border:1px solid var(--hc-border);border-radius:8px;font-size:12px;">
                <div>
                  <strong>Copiar p/ HD Externo (Cofre Backup)</strong>
                  <div style="color:var(--hc-text-3);font-size:11px;">${xhd.capMb > 0 ? `${xhd.freeMb} MB livres no HD Externo` : 'Você ainda não comprou um HD Externo'}</div>
                </div>
                ${xhd.capMb > 0
                  ? `<button type="button" class="hc-btn sm" onclick="window.handleXhdBackup('${esc(softKeyForXhd)}');window.softwareEngine.closeActionModal();">Salvar no XHD</button>`
                  : `<button type="button" class="hc-btn ghost sm" onclick="window.softwareEngine.closeActionModal();window.softwareEngine.activeTab='xhd';window.softwareEngine.renderUI();">Ver HD Externo</button>`}
              </div>
            ` : ''}

            <div class="hc-eyebrow" style="margin-top:4px;">2. Mover para Pasta</div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <button type="button" class="hc-btn ${!curFolder ? 'primary' : 'ghost'} sm" style="justify-content:flex-start;"
                onclick="window.softwareEngine.confirmMoveItem('${esc(kind)}', '${esc(idOrKey)}', '${curDrive}', null)">
                ${HC.icon('hard-drive')} Raiz Principal (/)
              </button>
              ${folders.length === 0
                ? `<div style="font-size:12px;color:var(--hc-text-3);">Nenhuma pasta criada ainda. Use o botão "Criar pasta" na barra lateral.</div>`
                : folders.map((fd) => `
                    <button type="button" class="hc-btn ${curFolder === fd.id ? 'primary' : 'ghost'} sm" style="justify-content:flex-start;"
                      onclick="window.softwareEngine.confirmMoveItem('${esc(kind)}', '${esc(idOrKey)}', '${curDrive}', '${esc(fd.id)}')">
                      ${HC.icon('folder')} /${esc(fd.name)}
                    </button>
                  `).join('')}
            </div>
          </div>
        </div>
      `;
      modal.classList.add('open');
    }

    confirmMoveItem(kind, idOrKey, targetDrive, targetFolderId) {
      this.ensureLoaded();
      const bays = this.getDriveBaysSummary();
      let target = null;
      let sizeMb = 1;
      let label = '';

      if (kind === 'soft') {
        target = this.state.inventory[idOrKey];
        sizeMb = this.getItemSizeMb(idOrKey, target?.versionInt || 10);
        label = SOFTWARE_DEFINITIONS[idOrKey]?.filename || idOrKey;
      } else if (kind === 'copy') {
        target = (this.state.extraCopies || []).find((c) => c.id === idOrKey);
        sizeMb = target?.sizeMb || 10;
        label = target?.customFilename || 'Cracker.crc';
      } else if (kind === 'txt') {
        target = (this.state.textFiles || []).find((t) => t.id === idOrKey);
        sizeMb = target?.sizeMb || 1;
        label = `${target?.name || 'nota'}.txt`;
      }
      if (!target) return;

      const prevDrive = target.drive || 'hd';
      if (prevDrive !== targetDrive && bays[targetDrive] && bays[targetDrive].freeMb < sizeMb) {
        this.notifyActionBlocked(`Espaço insuficiente na unidade ${bays[targetDrive].label}! Precisa de ${sizeMb} MB livres.`);
        return;
      }

      target.drive = targetDrive;
      target.folderId = targetFolderId || null;
      this.save();
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
      this.closeActionModal();
      if (typeof window.showToast === 'function') {
        window.showToast(`${label} movido para ${bays[targetDrive]?.label || 'HD'}${targetFolderId ? ' (em pasta)' : ''}!`);
      }
      this.renderUI();
    }

    deleteLocalItem(kind, idOrKey) {
      this.ensureLoaded();
      if (kind === 'folder') {
        const fd = (this.state.folders || []).find((f) => f.id === idOrKey);
        if (!fd) return;
        Object.values(this.state.inventory).forEach((it) => { if (it && it.folderId === idOrKey) it.folderId = null; });
        (this.state.extraCopies || []).forEach((cp) => { if (cp.folderId === idOrKey) cp.folderId = null; });
        (this.state.textFiles || []).forEach((tf) => { if (tf.folderId === idOrKey) tf.folderId = null; });
        this.state.folders = (this.state.folders || []).filter((f) => f.id !== idOrKey);
        if (this.currentFolderId === idOrKey) this.currentFolderId = null;
        this.save();
        if (typeof window.showToast === 'function') window.showToast(`Pasta /${fd.name} removida (arquivos movidos p/ raiz).`);
        this.renderUI();
        return;
      }

      if (kind === 'txt') {
        const tf = (this.state.textFiles || []).find((t) => t.id === idOrKey);
        if (!tf) return;
        this.state.textFiles = (this.state.textFiles || []).filter((t) => t.id !== idOrKey);
        this.save();
        if (typeof window.showToast === 'function') window.showToast(`Arquivo ${tf.name}.txt apagado.`);
        this.renderUI();
        return;
      }

      if (kind === 'copy') {
        const cp = (this.state.extraCopies || []).find((c) => c.id === idOrKey);
        if (!cp) return;
        this.state.extraCopies = (this.state.extraCopies || []).filter((c) => c.id !== idOrKey);
        this.save();
        if (typeof window.showToast === 'function') window.showToast(`Cópia ${cp.customFilename || 'Cracker.crc'} (${this.fmtVer(cp.versionInt)}) apagada (+${cp.sizeMb || 10} MB livres).`);
        this.renderUI();
        return;
      }

      const st = this.state.inventory[idOrKey];
      const def = SOFTWARE_DEFINITIONS[idOrKey];
      if (!st || !def || !st.owned) return;
      if (st.installed) {
        this.notifyActionBlocked(`Pare primeiro o ${def.filename} antes de apagá-lo do disco!`);
        return;
      }

      const freedMb = this.getItemSizeMb(idOrKey, st.versionInt);
      const ok = window.confirm(`Apagar ${def.filename} (${this.fmtVer(st.versionInt)}) do seu disco para liberar ${freedMb} MB?\n(Utilitários básicos v1.0 podem ser baixados novamente de graça no Download Center.)`);
      if (!ok) return;

      st.owned = false;
      st.versionInt = 0;
      st.runningVerInt = 0;
      st.installed = false;
      st.hiddenWithVer = 0;
      if (def.starterOwned) {
        if (!Array.isArray(this.state.deletedStarterKeys)) this.state.deletedStarterKeys = [];
        if (!this.state.deletedStarterKeys.includes(idOrKey)) this.state.deletedStarterKeys.push(idOrKey);
      }
      this.save();
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
      if (typeof window.showToast === 'function') window.showToast(`${def.filename} apagado (+${freedMb} MB liberados).`);
      this.renderUI();
    }

    // =========================================================================
    // AÇÕES DO GERENCIADOR DE PROGRAMAS COM BARRA AO VIVO NO TASK MANAGER (FOTO 1 -> FOTO 2)
    // =========================================================================
    startSoftwareViaTaskManager(kind, idOrKey) {
      this.ensureLoaded();
      if (kind === 'folder' || kind === 'txt') {
        this.runLocalItem(kind, idOrKey);
        return;
      }

      let softKey = idOrKey;
      let verInt = 10;
      let hiddenVer = 0;
      let labelName = '';
      if (kind === 'copy') {
        const cp = (this.state.extraCopies || []).find((c) => c.id === idOrKey);
        if (!cp) return;
        softKey = cp.softKey;
        verInt = cp.versionInt || 10;
        hiddenVer = cp.hiddenWithVer || 0;
        labelName = cp.customFilename || 'Cracker.crc';
      } else {
        const st = this.state.inventory[softKey];
        const def = SOFTWARE_DEFINITIONS[softKey];
        if (!st || !def || !st.owned) return;
        verInt = st.versionInt || 10;
        hiddenVer = st.hiddenWithVer || 0;
        labelName = def.filename;
      }

      if (hiddenVer > 0) {
        this.notifyActionBlocked('Este programa está escondido! Clique no ícone de Revelar antes de rodá-lo.');
        return;
      }

      const def = SOFTWARE_DEFINITIONS[softKey];
      if (!def) return;
      if (def.category === 'virus') {
        this.notifyActionBlocked('Vírus não devem ser executados no seu próprio PC! Invada um alvo na Internet e suba o arquivo lá.');
        return;
      }

      const st = this.state.inventory[softKey];
      if (!def.onDemandTool && st) {
        const neededRam = this.getItemRamMb(softKey, verInt, false);
        const curRam = st.installed ? this.getItemRamMb(softKey, st.runningVerInt || verInt, false) : 0;
        if (this.getUsedRamMb() - curRam + neededRam > this.getMaxRamMb()) {
          this.notifyActionBlocked(`Memória RAM cheia (${this.getUsedRamMb()}/${this.getMaxRamMb()} MB)! Pare algum programa ou melhore sua RAM.`);
          return;
        }
      }

      const verStr = (verInt / 10).toFixed(1);
      const finishRun = () => {
        if (softKey === 'antivirus') {
          const r = this.runLocalAntivirus();
          this.showFeedbackBanner(`Sucesso! ${r.message}`);
          return;
        }
        if (softKey === 'nmap') {
          this.runLocalNmapScan();
          this.showFeedbackBanner(`Sucesso! Varredura de conexões Nmap.nmap (${verStr}) concluída.`);
          return;
        }
        if (softKey === 'seeker') {
          this.runLocalItem('soft', 'seeker');
          this.showFeedbackBanner(`Sucesso! Seeker.skr (${verStr}) varreu itens ocultos no seu PC.`);
          return;
        }

        if (st && st.owned) {
          delete this.transitions[softKey];
          st.installed = true;
          st.runningVerInt = st.versionInt;
          this.save();
          if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
          if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
        }
        this.showFeedbackBanner(`Sucesso! ${labelName} (${verStr}) está rodando em segundo plano.`);
      };

      if (!window.taskManager) {
        finishRun();
        return;
      }

      window.taskManager.enqueue({
        dedupeKey: `tm_run_${kind}_${idOrKey}`,
        title: `Rodar arquivo ${labelName} (${verStr})`,
        labelHtml: `Rodar arquivo <strong>${esc(labelName)}</strong> (${verStr}) em localhost`,
        subtitle: 'CPU · localhost',
        targetIp: 'localhost',
        queueKind: 'cpu',
        category: 'Sistema',
        idealSeconds: 1.6,
        openTaskManagerNow: true,
        returnWindowId: 'winSoftware',
        onComplete: finishRun
      });
    }

    stopSoftwareViaTaskManager(softKey) {
      this.ensureLoaded();
      const st = this.state.inventory[softKey];
      const def = SOFTWARE_DEFINITIONS[softKey];
      if (!st || !def || !st.installed) return;

      const verStr = ((st.runningVerInt || st.versionInt || 10) / 10).toFixed(1);
      const finishStop = () => {
        delete this.transitions[softKey];
        st.installed = false;
        st.runningVerInt = 0;
        this.save();
        if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
        this.showFeedbackBanner(`Sucesso! ${def.filename} (${verStr}) foi encerrado.`);
      };

      if (!window.taskManager) {
        finishStop();
        return;
      }

      window.taskManager.enqueue({
        dedupeKey: `tm_stop_${softKey}`,
        title: `Encerrar arquivo ${def.filename} (${verStr})`,
        labelHtml: `Encerrar arquivo <strong>${esc(def.filename)}</strong> (${verStr}) em localhost`,
        subtitle: 'CPU · localhost',
        targetIp: 'localhost',
        queueKind: 'cpu',
        category: 'Sistema',
        idealSeconds: 1.5,
        openTaskManagerNow: true,
        returnWindowId: 'winSoftware',
        onComplete: finishStop
      });
    }

    uiToggleHideItem(kind, idOrKey) {
      this.ensureLoaded();
      const mySeeker = this.getSoftwareVersion('seeker') || (window.stealthXhdEngine ? window.stealthXhdEngine.getSeekerVer() : 1.0);
      let target = null;
      let label = '';
      let verStr = '';

      if (kind === 'soft') {
        const st = this.state.inventory[idOrKey];
        const def = SOFTWARE_DEFINITIONS[idOrKey];
        if (!st || !def) return;
        if (st.installed) {
          this.notifyActionBlocked('Pare o programa primeiro antes de escondê-lo no disco!');
          return;
        }
        target = st;
        label = def.filename;
        verStr = (st.versionInt / 10).toFixed(1);
      } else if (kind === 'copy') {
        target = (this.state.extraCopies || []).find((c) => c.id === idOrKey);
        label = target ? (target.customFilename || 'Cracker.crc') : '';
        verStr = target ? (target.versionInt / 10).toFixed(1) : '1.0';
      } else if (kind === 'txt') {
        target = (this.state.textFiles || []).find((t) => t.id === idOrKey);
        label = target ? `${target.name}.txt` : '';
      }
      if (!target) return;

      const wasHidden = (target.hiddenWithVer || 0) > 0;
      if (wasHidden && mySeeker < target.hiddenWithVer) {
        this.notifyActionBlocked(`Arquivo oculto com Hider v${target.hiddenWithVer.toFixed(1)}! Seu Seeker (v${mySeeker.toFixed(1)}) precisa ser >= v${target.hiddenWithVer.toFixed(1)}.`);
        return;
      }

      const finishHide = () => {
        this.toggleHideLocalItem(kind, idOrKey);
        this.showFeedbackBanner(`Sucesso! ${label} foi ${wasHidden ? 'revelado' : 'escondido'} no disco.`);
      };

      if (!window.taskManager) {
        finishHide();
        return;
      }

      const verb = wasHidden ? 'Revelar arquivo' : 'Esconder arquivo';
      window.taskManager.enqueue({
        dedupeKey: `tm_hide_${kind}_${idOrKey}`,
        title: `${verb} ${label}`,
        labelHtml: `${verb} <strong>${esc(label)}</strong>${verStr ? ` (${verStr})` : ''} em localhost`,
        subtitle: 'CPU · localhost',
        targetIp: 'localhost',
        queueKind: 'cpu',
        category: 'Sistema',
        idealSeconds: 1.4,
        openTaskManagerNow: true,
        returnWindowId: 'winSoftware',
        onComplete: finishHide
      });
    }

    uiDeleteItem(kind, idOrKey) {
      this.ensureLoaded();
      if (kind === 'folder') {
        this.deleteLocalItem('folder', idOrKey);
        return;
      }

      let label = '';
      let verStr = '';
      if (kind === 'soft') {
        const st = this.state.inventory[idOrKey];
        const def = SOFTWARE_DEFINITIONS[idOrKey];
        if (!st || !def || !st.owned) return;
        if (st.installed) {
          this.notifyActionBlocked(`Pare primeiro o ${def.filename} antes de excluí-lo do disco!`);
          return;
        }
        const freedMb = this.getItemSizeMb(idOrKey, st.versionInt);
        const ok = window.confirm(`Excluir ${def.filename} (${this.fmtVer(st.versionInt)}) do seu disco para liberar ${freedMb} MB?\n(Utilitários básicos v1.0 podem ser baixados novamente de graça no Download Center.)`);
        if (!ok) return;
        label = def.filename;
        verStr = (st.versionInt / 10).toFixed(1);
      } else if (kind === 'copy') {
        const cp = (this.state.extraCopies || []).find((c) => c.id === idOrKey);
        if (!cp) return;
        label = cp.customFilename || 'Cracker.crc';
        verStr = (cp.versionInt / 10).toFixed(1);
      } else if (kind === 'txt') {
        const tf = (this.state.textFiles || []).find((t) => t.id === idOrKey);
        if (!tf) return;
        label = `${tf.name}.txt`;
      }

      const finishDelete = () => {
        if (kind === 'soft') {
          const st = this.state.inventory[idOrKey];
          const def = SOFTWARE_DEFINITIONS[idOrKey];
          if (st && def) {
            st.owned = false;
            st.versionInt = 0;
            st.runningVerInt = 0;
            st.installed = false;
            st.hiddenWithVer = 0;
            if (def.starterOwned) {
              if (!Array.isArray(this.state.deletedStarterKeys)) this.state.deletedStarterKeys = [];
              if (!this.state.deletedStarterKeys.includes(idOrKey)) this.state.deletedStarterKeys.push(idOrKey);
            }
            this.save();
            if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
          }
        } else {
          this.deleteLocalItem(kind, idOrKey);
        }
        this.showFeedbackBanner(`Sucesso! ${label} foi excluído do seu disco.`);
      };

      if (!window.taskManager) {
        finishDelete();
        return;
      }

      window.taskManager.enqueue({
        dedupeKey: `tm_del_${kind}_${idOrKey}`,
        title: `Excluir arquivo ${label}`,
        labelHtml: `Excluir arquivo <strong>${esc(label)}</strong>${verStr ? ` (${verStr})` : ''} em localhost`,
        subtitle: 'CPU · localhost',
        targetIp: 'localhost',
        queueKind: 'cpu',
        category: 'Sistema',
        idealSeconds: 1.5,
        openTaskManagerNow: true,
        returnWindowId: 'winSoftware',
        onComplete: finishDelete
      });
    }

    openCreateFolderModal() {
      const modal = this.ensureActionModalRoot();
      modal.innerHTML = `
        <div class="minipc-window" style="width:min(420px,100%);">
          <div class="minipc-titlebar">
            <div class="minipc-title-left">
              <div class="minipc-title-icon">${HC.icon('folder-plus')}</div>
              <strong>Criar Nova Pasta</strong>
            </div>
            <button type="button" class="hc-btn ghost sm" onclick="window.softwareEngine.closeActionModal()">Fechar ✕</button>
          </div>
          <div class="minipc-body">
            <label style="font-size:12px;color:var(--hc-text-2);">Nome da pasta no seu disco:</label>
            <input type="text" id="newSoftFolderNameInput" class="hc-input mono" placeholder="Ex: arsenal, ferramentas, cofre" maxlength="24" onkeydown="if(event.key==='Enter') window.softwareEngine.saveNewFolder()">
            <div style="display:flex;justify-content:flex-end;gap:8px;">
              <button type="button" class="hc-btn ghost sm" onclick="window.softwareEngine.closeActionModal()">Cancelar</button>
              <button type="button" class="hc-btn primary sm" onclick="window.softwareEngine.saveNewFolder()">Criar pasta</button>
            </div>
          </div>
        </div>
      `;
      modal.classList.add('open');
      setTimeout(() => document.getElementById('newSoftFolderNameInput')?.focus(), 40);
    }

    saveNewFolder() {
      this.ensureLoaded();
      const raw = (document.getElementById('newSoftFolderNameInput')?.value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      if (!raw) {
        this.notifyActionBlocked('Informe um nome válido para a pasta!');
        return;
      }
      if (!Array.isArray(this.state.folders)) this.state.folders = [];
      this.state.folders.push({
        id: 'fld_' + Date.now(),
        name: raw,
        createdAt: new Date().toLocaleTimeString()
      });
      this.save();
      this.closeActionModal();
      if (typeof window.showToast === 'function') window.showToast(`Pasta /${raw} criada!`);
      this.renderUI();
    }

    openTextEditorModal(txtId = null) {
      this.ensureLoaded();
      const existing = txtId ? (this.state.textFiles || []).find((t) => t.id === txtId) : null;
      const modal = this.ensureActionModalRoot();
      modal.innerHTML = `
        <div class="minipc-window" style="width:min(520px,100%);">
          <div class="minipc-titlebar">
            <div class="minipc-title-left">
              <div class="minipc-title-icon">${HC.icon('file-text')}</div>
              <strong>${existing ? `Editar ${esc(existing.name)}.txt` : 'Novo Arquivo de Texto (.txt)'}</strong>
            </div>
            <button type="button" class="hc-btn ghost sm" onclick="window.softwareEngine.closeActionModal()">Fechar ✕</button>
          </div>
          <div class="minipc-body">
            <div style="display:flex;align-items:center;gap:6px;">
              <input type="text" id="softTxtNameInput" class="hc-input mono" value="${esc(existing ? existing.name : '')}" placeholder="nome_do_arquivo" maxlength="28">
              <span class="mono" style="color:var(--hc-text-3);">.txt</span>
            </div>
            <textarea id="softTxtContentInput" class="hc-input mono" style="height:140px;padding:10px 12px;resize:vertical;line-height:1.45;" placeholder="Anote senhas, pistas de enigmas ou lembretes...">${esc(existing ? existing.content : '')}</textarea>
            <div style="display:flex;justify-content:flex-end;gap:8px;">
              <button type="button" class="hc-btn ghost sm" onclick="window.softwareEngine.closeActionModal()">Cancelar</button>
              <button type="button" class="hc-btn primary sm" onclick="window.softwareEngine.saveTextFile(${existing ? `'${esc(existing.id)}'` : 'null'})">Salvar .txt</button>
            </div>
          </div>
        </div>
      `;
      modal.classList.add('open');
    }

    saveTextFile(txtId = null) {
      this.ensureLoaded();
      const name = (document.getElementById('softTxtNameInput')?.value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'nota';
      const content = document.getElementById('softTxtContentInput')?.value || '';
      if (!Array.isArray(this.state.textFiles)) this.state.textFiles = [];

      if (txtId) {
        const ex = this.state.textFiles.find((t) => t.id === txtId);
        if (ex) {
          ex.name = name;
          ex.content = content;
          ex.updatedAt = new Date().toLocaleTimeString();
        }
      } else {
        this.state.textFiles.unshift({
          id: 'txt_' + Date.now(),
          name,
          content,
          sizeMb: 1,
          drive: this.driveFilter !== 'all' ? this.driveFilter : 'hd',
          folderId: this.currentFolderId || null,
          hiddenWithVer: 0,
          updatedAt: new Date().toLocaleTimeString()
        });
      }
      this.save();
      this.closeActionModal();
      if (typeof window.showToast === 'function') window.showToast(`Arquivo ${name}.txt salvo no disco!`);
      this.renderUI();
    }

    openSoftwareInfoModal(softKey) {
      this.ensureLoaded();
      const def = SOFTWARE_DEFINITIONS[softKey];
      const cur = this.state.inventory[softKey];
      if (!def || !cur || !cur.owned) return;

      const stepVer = softKey === 'analyzer' ? 10 : 5;
      const maxVer = def.maxVerInt || 100;
      const nextVerStr = this.fmtVer(Math.min(maxVer, cur.versionInt + stepVer));
      const cost = this.getResearchCost(softKey);
      const licCost = this.getLicenseCost(softKey);
      const needsLicense = cur.licensed === false && !def.nonResearchable;
      const sizeMb = this.getItemSizeMb(softKey, cur.versionInt);
      const ramMb = this.getItemRamMb(softKey, cur.versionInt, def.category === 'virus');

      const modal = this.ensureActionModalRoot();
      modal.innerHTML = `
        <div class="minipc-window" style="width:min(480px,100%);">
          <div class="minipc-titlebar">
            <div class="minipc-title-left">
              <div class="soft-app-icon kind-${def.iconKind || 'attack'}">${HC.icon(def.icon || 'cpu')}</div>
              <div>
                <strong style="font-size:14px;">${esc(def.friendlyTitle)}</strong>
                <div class="mono" style="font-size:11.5px;color:var(--hc-text-3);">${esc(def.filename)} · ${this.fmtVer(cur.versionInt)}</div>
              </div>
            </div>
            <button type="button" class="hc-btn ghost sm" onclick="window.softwareEngine.closeActionModal()">Fechar ✕</button>
          </div>
          <div class="minipc-body">
            <p style="font-size:13px;color:var(--hc-text-2);line-height:1.5;">${esc(def.desc)}</p>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;background:var(--hc-inset);border:1px solid var(--hc-border);border-radius:8px;padding:10px;font-family:var(--hc-font-mono);font-size:11.5px;">
              <div><div style="color:var(--hc-text-3);font-size:10px;">TAMANHO</div><strong>${sizeMb} MB</strong></div>
              <div><div style="color:var(--hc-text-3);font-size:10px;">MODO</div><strong>${def.category === 'virus' ? 'Payload Remoto' : (def.onDemandTool ? '2º Plano (0 RAM)' : `${ramMb} MB RAM`)}</strong></div>
              <div><div style="color:var(--hc-text-3);font-size:10px;">UNIDADE</div><strong>${(cur.drive || 'hd').toUpperCase()}</strong></div>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:4px;">
              ${def.nonResearchable
                ? `<span class="hc-badge">Versão única (não pesquisável)</span>`
                : (cur.versionInt >= maxVer
                    ? `<span class="hc-badge success">Potência Máxima (${this.fmtVer(maxVer)})</span>`
                    : (needsLicense
                        ? `<button type="button" class="hc-btn sm" style="border-color:var(--hc-warning);color:var(--hc-warning);" onclick="window.handleBuySoftwareLicense('${esc(softKey)}');window.softwareEngine.openSoftwareInfoModal('${esc(softKey)}');">Comprar Licença ($ ${licCost.toLocaleString('pt-BR')})</button>`
                        : `<button type="button" class="hc-btn primary sm" onclick="window.handleSoftwareResearch('${esc(softKey)}').then(()=>window.softwareEngine.closeActionModal())">Melhorar para ${nextVerStr} ($ ${cost.toLocaleString('pt-BR')})</button>`))}
            </div>
          </div>
        </div>
      `;
      modal.classList.add('open');
    }

    // Grade de Cards dos programas que ainda falta encontrar — ZERO IPs revelados!
    renderDiscoverCardsHtml(unownedKeys) {
      if (!unownedKeys || unownedKeys.length === 0) {
        return `<div class="hc-card" style="padding:18px;text-align:center;color:var(--hc-accent-text);">Parabéns! Você já descobriu e baixou todos os tipos de programas existentes na rede!</div>`;
      }
      return `
        <div class="soft-discover-grid" id="discoverCardsGrid">
          ${unownedKeys.map((k) => {
            const def = SOFTWARE_DEFINITIONS[k];
            const isVirus = def.category === 'virus';
            return `
              <article class="soft-discover-card">
                <div class="soft-discover-top">
                  <div class="soft-discover-id">
                    <div class="soft-app-icon kind-${def.iconKind || 'attack'}">${HC.icon(def.icon || 'cpu')}</div>
                    <div>
                      <div class="soft-discover-name">${esc(def.friendlyTitle)}</div>
                      <div class="soft-discover-ext">${esc(def.filename)}</div>
                    </div>
                  </div>
                  <span class="hc-badge ${isVirus ? 'warning' : 'info'}">${esc(def.badge)}</span>
                </div>
                <p class="soft-discover-desc">${esc(def.desc)}</p>
              </article>
            `;
          }).join('')}
        </div>
      `;
    }

    renderUI(containerId = 'softwareAppBody') {
      const container = document.getElementById(containerId);
      if (!container) return;
      this.ensureLoaded();

      const usedRam = this.getUsedRamMb();
      const maxRam = this.getMaxRamMb();
      const usedHdd = this.getUsedHddMb();
      const maxHdd = this.getMaxHddMb();
      const bays = this.getDriveBaysSummary();
      const harvest = this.getPendingHarvestSummary();
      const hostiles = this.state.localHostileInfections || [];

      const avItem = this.state.inventory.antivirus || { owned: false, versionInt: 0 };
      const avReady = !!(avItem.owned && avItem.versionInt > 0 && !(avItem.hiddenWithVer > 0));
      const myActiveAvVerInt = avReady ? avItem.versionInt : 0;
      const mySeekerVer = this.getSoftwareVersion('seeker') || 1.0;
      const hasHiddenLocal = hostiles.some((h) => !h.revealed && (h.hiddenWithVer || 0) > 0);

      const hostileBanner = hostiles.length === 0 ? '' : `
        <div id="localQuarantineBanner" class="hc-card" style="padding:14px 16px;border-color:var(--hc-danger);background:rgba(208,68,58,0.09);display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
            <div>
              <strong style="color:var(--hc-danger-text);font-size:14px;">
                Alerta de Vírus no Seu PC: ${hostiles.length} infecção(ões) ativa(s)
              </strong>
              <div style="font-size:12px;color:var(--hc-text-2);margin-top:2px;">
                Seu Antivírus roda sob demanda e limpa qualquer vírus visível com versão igual ou menor que ele (${avReady ? this.fmtVer(myActiveAvVerInt) : 'não instalado no disco'}).
              </div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${hasHiddenLocal
                ? `<button type="button" id="btnRunLocalSeeker" class="hc-btn sm" onclick="window.softwareEngine.runLocalSeekerScan()">Revelar Ocultos (v${mySeekerVer.toFixed(1)})</button>`
                : ''}
              <button type="button" id="btnRunLocalAv" class="hc-btn primary sm" style="background:var(--hc-danger);border-color:var(--hc-danger);" onclick="window.softwareEngine.runLocalAntivirus()">
                Rodar Antivírus (${avReady ? this.fmtVer(myActiveAvVerInt) : 'Ausente'})
              </button>
              <button type="button" id="btnEmergencyFormatHd" class="hc-btn ghost sm" style="color:var(--hc-danger-text);" onclick="window.softwareEngine.formatLocalHardDrive(false)">
                Formatar Disco
              </button>
            </div>
          </div>
        </div>
      `;

      const allSoftOrder = [
        'cracker', 'firewall', 'hasher', 'portscan', 'hider', 'seeker',
        'antivirus', 'exploit_ftp', 'exploit_ssh', 'collector', 'torrent',
        'ddos_breaker', 'nmap', 'analyzer', 'webserver',
        'vspam', 'vwarez', 'vminer', 'vbank', 'vddos'
      ];
      const unownedAllKeys = allSoftOrder.filter((k) => !this.isSoftwareOwned(k));

      let bodySectionHtml = '';

      if (this.activeTab === 'xhd' && window.stealthXhdEngine) {
        bodySectionHtml = `<div style="padding:18px;">${window.stealthXhdEngine.renderXhdAndStealthPanelHtml()}</div>`;
      } else if (this.activeTab === 'discover') {
        bodySectionHtml = `
          <div style="padding:18px;display:flex;flex-direction:column;gap:12px;">
            <div>
              <strong style="font-size:15px;">Programas &amp; Vírus que Ainda Falta Encontrar (${unownedAllKeys.length})</strong>
              <p style="font-size:12.5px;color:var(--hc-text-2);margin-top:2px;">Explore servidores, serviços públicos e trilhas de enigmas pela Internet para encontrar e fazer download desses aplicativos.</p>
            </div>
            ${this.renderDiscoverCardsHtml(unownedAllKeys)}
          </div>
        `;
      } else if (this.activeTab === 'viruses') {
        const list = this.state.remoteInfections || [];
        const rows = list.length === 0
          ? `<div class="hc-empty-box" style="padding:36px 20px;">
               <div class="hc-empty-icon">${HC.icon('bug')}</div>
               <strong>Nenhum vírus ativo na rede ainda</strong>
               <p>Invada servidores pela Internet, suba um vírus para o disco do alvo e clique em Rodar na lista de programas dele.</p>
             </div>`
          : list.map((v) => {
              const host = window.internetEngine ? window.internetEngine.resolveHost(v.targetIp) : null;
              const avVer = host && host.antivirusVer !== undefined ? host.antivirusVer : (v.targetAvVer || 0);
              const effPotency = Math.max(v.versionInt || 10, v.effectiveStealthInt || 0) / 10;
              const isFud = avVer <= 0 || effPotency > avVer;
              const rate = this.computeInfectionPerSec(v);
              const perHourCash = +(rate.cashPerSec * 3600 * Math.max(1, harvest.collectorMult)).toFixed(2);
              const perHourBtc = fmtSatsToBtc(Math.round(rate.satsPerSec * 3600 * Math.max(1, harvest.collectorMult)));
              const rateStr = rate.pausedReason
                ? `<span style="color:var(--hc-danger-text);">${esc(rate.pausedReason)}</span>`
                : (rate.satsPerSec > 0
                    ? `+${perHourBtc} BTC/h`
                    : (rate.gbps > 0 ? `+${rate.gbps} Gbps DDoS` : `+$ ${perHourCash.toLocaleString('pt-BR')}/h`));
              const accStr = v.virusKey === 'vminer'
                ? `${fmtSatsToBtc(v.accumulatedSats)} BTC`
                : (v.virusKey === 'vddos' ? 'Ativo no Enxame' : fmtUsd(v.accumulatedCash));

              return `
                <div class="hc-card" style="padding:12px 14px;display:grid;grid-template-columns:minmax(180px,1.2fr) minmax(180px,1.2fr) minmax(120px,0.8fr) auto;gap:12px;align-items:center;">
                  <div>
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                      <strong class="mono" style="color:var(--hc-accent-text);">${esc(v.targetIp)}</strong>
                      <span class="hc-badge ${isFud ? 'success' : 'danger'}">${isFud ? (v.hiddenWithVer ? `Oculto v${v.hiddenWithVer.toFixed(1)}` : 'Invisível ao AV') : `Risco AV v${avVer.toFixed(1)}`}</span>
                    </div>
                    <div style="font-size:12px;color:var(--hc-text-3);">${esc(v.targetHostname)}</div>
                  </div>
                  <div>
                    <strong class="mono">${esc(v.filename)}</strong>
                    <span class="hc-badge success" style="margin-left:6px;">${this.fmtVer(v.versionInt)}</span>
                    <div class="mono" style="font-size:11.5px;color:var(--hc-accent-text);margin-top:2px;">${rateStr}</div>
                  </div>
                  <div>
                    <div style="font-size:10.5px;color:var(--hc-text-3);text-transform:uppercase;">Acumulado</div>
                    <strong class="mono" style="color:var(--hc-warning-text);">${accStr}</strong>
                  </div>
                  <div style="display:flex;gap:6px;justify-content:flex-end;">
                    ${window.stealthXhdEngine
                      ? `<button type="button" class="soft-act-btn" onclick="window.stealthXhdEngine.hideRemoteVirusWithHider(${v.id})" title="Esconder vírus no alvo">${HC.icon('eye-off')} Esconder</button>`
                      : ''}
                    <button type="button" class="soft-act-btn" onclick="window.internetEngine.openIp('${esc(v.targetIp)}', 'entrar')">Abrir PC</button>
                    <button type="button" class="soft-act-btn act-del" onclick="window.softwareEngine.removeRemoteVirus(${v.id})">${HC.icon('trash-2')}</button>
                  </div>
                </div>
              `;
            }).join('');

        bodySectionHtml = `
          <div style="padding:18px;display:flex;flex-direction:column;gap:14px;">
            <div class="hc-stats-strip">
              <div class="hc-stat-cell"><div class="hc-stat-label">Vírus Ativos</div><div class="hc-stat-value">${harvest.virusCount}</div></div>
              <div class="hc-stat-cell"><div class="hc-stat-label">Pronto p/ Coleta ($)</div><div class="hc-stat-value emerald">${fmtUsd(harvest.cashReady)}</div></div>
              <div class="hc-stat-cell"><div class="hc-stat-label">Pronto p/ Coleta (BTC)</div><div class="hc-stat-value">${harvest.btcReadyStr}</div></div>
              <div class="hc-stat-cell"><div class="hc-stat-label">Poder DDoS</div><div class="hc-stat-value">${harvest.totalGbps} Gbps</div></div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
              <span style="font-size:12.5px;color:var(--hc-text-2);">
                Coletor (<code>Collector.vcol</code>): <strong style="color:${harvest.collectorActive ? 'var(--hc-accent-text)' : 'var(--hc-danger-text)'};">${harvest.collectorActive ? harvest.collectorMult.toFixed(2) + 'x ativo' : 'Desligado (rode Collector.vcol em Meus Programas)'}</strong>
              </span>
              <button type="button" id="btnCollectAllViruses" class="hc-btn primary sm" onclick="window.handleCollectViruses()">Recolher Lucros ($ + BTC)</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">${rows}</div>
          </div>
        `;
      } else {
        // ABA PRINCIPAL: MEUS PROGRAMAS (Estilo Enxuto Foto 2: Ícone | Nome | Versão | Tamanho | Ações por Ícones + Mini-Aba Hover)
        const inFolder = this.currentFolderId
          ? (this.state.folders || []).find((f) => f.id === this.currentFolderId) || null
          : null;
        if (this.currentFolderId && !inFolder) this.currentFolderId = null;

        const matchDriveAndFolder = (drv, fldId) => {
          const cleanDrv = ['hd', 'ssd', 'nvme'].includes(drv) ? drv : 'hd';
          if (this.driveFilter !== 'all' && cleanDrv !== this.driveFilter) return false;
          if ((fldId || null) !== (this.currentFolderId || null)) return false;
          return true;
        };

        const tableRows = [];

        // 1) Pastas (quando estiver na raiz)
        if (!this.currentFolderId) {
          (this.state.folders || []).forEach((fd) => {
            const countInside = Object.values(this.state.inventory).filter((it) => it && it.owned && it.folderId === fd.id).length
              + (this.state.extraCopies || []).filter((c) => c.folderId === fd.id).length
              + (this.state.textFiles || []).filter((t) => t.folderId === fd.id).length;
            tableRows.push(`
              <tr>
                <td class="soft-col-icon">
                  <span class="soft-mini-glyph kind-folder" data-tip-title="Pasta /${esc(fd.name)}" data-tip-meta="${countInside} arq." data-tip-desc="Pasta criada no seu disco para organizar programas e arquivos.">
                    ${HC.icon('folder')}
                  </span>
                </td>
                <td>
                  <span class="soft-name-trigger" style="cursor:pointer;" onclick="window.softwareEngine.runLocalItem('folder', '${esc(fd.id)}')"
                    data-tip-title="Pasta /${esc(fd.name)}" data-tip-meta="Diretório" data-tip-desc="Clique para abrir esta pasta e ver os programas guardados dentro dela.">
                    ${esc(fd.name)}/
                  </span>
                </td>
                <td class="soft-col-ver"><span style="color:var(--hc-text-3);">—</span></td>
                <td class="soft-col-size">${countInside} arq.</td>
                <td class="soft-col-acts">
                  <div class="soft-icon-actions">
                    <button type="button" class="soft-icon-act ic-run" aria-label="Abrir pasta ${esc(fd.name)}"
                      data-tip-title="Abrir pasta" data-tip-meta="/${esc(fd.name)}" data-tip-desc="Entrar na pasta /${esc(fd.name)}."
                      onclick="window.softwareEngine.runLocalItem('folder', '${esc(fd.id)}')">${HC.icon('folder')}</button>
                    <button type="button" class="soft-icon-act ic-del" aria-label="Excluir pasta ${esc(fd.name)}"
                      data-tip-title="Excluir pasta" data-tip-desc="Remove a pasta e devolve os arquivos para a raiz principal."
                      onclick="window.softwareEngine.uiDeleteItem('folder', '${esc(fd.id)}')">${HC.icon('trash-2')}</button>
                  </div>
                </td>
              </tr>
            `);
          });
        }

        // 2) Aplicativos principais instalados no disco
        const connectedRemoteIp = window.internetEngine && window.internetEngine.activeSshIp ? window.internetEngine.activeSshIp : null;

        allSoftOrder.forEach((k) => {
          const st = this.state.inventory[k];
          const def = SOFTWARE_DEFINITIONS[k];
          if (!st || !def || !st.owned || st.versionInt <= 0) return;
          if (!matchDriveAndFolder(st.drive, st.folderId)) return;

          const tr = this.getTransitionInfo(k);
          const isHidden = (st.hiddenWithVer || 0) > 0;
          const isRunning = def.category === 'system' && st.installed && !tr;
          const runVer = st.runningVerInt || st.versionInt;
          const hasPendingSwap = isRunning && st.versionInt > runVer;
          const sizeMb = this.getItemSizeMb(k, st.versionInt);
          const drv = ['hd', 'ssd', 'nvme'].includes(st.drive) ? st.drive : 'hd';
          const drvLabel = drv.toUpperCase();
          const verStr = (st.versionInt / 10).toFixed(1);

          const maxVer = def.maxVerInt || 100;
          const stepVer = k === 'analyzer' ? 10 : 5;
          const canUpgrade = !def.nonResearchable && st.versionInt < maxVer;
          const nextVerStr = this.fmtVer(Math.min(maxVer, st.versionInt + stepVer));

          const stateLabel = isRunning
            ? `Em execução v${(runVer / 10).toFixed(1)} · ${drvLabel}`
            : (isHidden ? `Escondido v${Number(st.hiddenWithVer).toFixed(1)} · ${drvLabel}` : `v${verStr} · ${drvLabel}`);

          let runIconBtnHtml = '';
          if (def.category === 'virus') {
            if (connectedRemoteIp) {
              runIconBtnHtml = `
                <button type="button" class="soft-icon-act ic-run" aria-label="Subir ${esc(def.filename)} para ${esc(connectedRemoteIp)}"
                  data-tip-title="Subir para PC invadido" data-tip-meta="${esc(connectedRemoteIp)}"
                  data-tip-desc="Enviar ${esc(def.filename)} (${verStr}) pela rede para o computador ${esc(connectedRemoteIp)}."
                  onclick="window.navTo('winBrowser');window.internetEngine.switchTab('entrar');window.internetEngine.sshSubTab='files';window.internetEngine.render();">
                  ${HC.icon('upload')}
                </button>`;
            }
          } else if (tr) {
            runIconBtnHtml = `
              <button type="button" class="soft-icon-act" disabled aria-label="Aguardando transição"
                data-tip-title="Aguarde ${tr.remainingSec}s" data-tip-desc="Transição em andamento na memória.">
                ${HC.icon('refresh-cw')}
              </button>`;
          } else if (hasPendingSwap) {
            runIconBtnHtml = `
              <button type="button" id="btnRowSwap_${k}" class="soft-icon-act ic-stop" aria-label="Atualizar ${esc(def.filename)} em execução"
                data-tip-title="Trocar p/ ${nextVerStr}" data-tip-meta="Nova versão"
                data-tip-desc="Substituir a versão antiga pela versão ${verStr} em segundo plano."
                onclick="window.softwareEngine.startSoftwareViaTaskManager('soft', '${k}')">
                ${HC.icon('refresh-cw')}
              </button>`;
          } else if (isRunning) {
            runIconBtnHtml = `
              <button type="button" id="btnToggleInstall_${k}" class="soft-icon-act ic-stop" aria-label="Parar ${esc(def.filename)}"
                data-tip-title="Parar execução" data-tip-meta="Ativo v${(runVer / 10).toFixed(1)}"
                data-tip-desc="Encerrar ${esc(def.friendlyTitle)} que está rodando em segundo plano."
                onclick="window.softwareEngine.stopSoftwareViaTaskManager('${k}')">
                ${HC.icon('circle-stop')}
              </button>`;
          } else {
            runIconBtnHtml = `
              <button type="button" id="btnToggleInstall_${k}" class="soft-icon-act ic-run" aria-label="Rodar ${esc(def.filename)}"
                data-tip-title="Rodar programa" data-tip-meta="2º plano"
                data-tip-desc="Rodar ${esc(def.friendlyTitle)} (${verStr}) e deixá-lo ativo em segundo plano no seu PC."
                onclick="window.softwareEngine.startSoftwareViaTaskManager('soft', '${k}')">
                ${HC.icon('settings')}
              </button>`;
          }

          tableRows.push(`
            <tr class="${isRunning ? 'row-running' : ''} ${isHidden ? 'row-hidden' : ''}">
              <td class="soft-col-icon">
                <span class="soft-mini-glyph kind-${def.iconKind || 'attack'}"
                  data-tip-title="${esc(def.friendlyTitle)}" data-tip-meta="${esc(stateLabel)}" data-tip-desc="${esc(def.desc)}">
                  ${HC.icon(def.icon || 'cpu')}
                </span>
              </td>
              <td>
                <span class="soft-name-trigger" tabindex="0"
                  data-tip-title="${esc(def.friendlyTitle)}" data-tip-meta="${esc(stateLabel)}" data-tip-desc="${esc(def.desc)}">
                  ${isRunning ? '<span class="soft-run-dot"></span>' : ''}
                  <span>${esc(def.filename)}</span>
                  ${def.category === 'virus' ? `<span class="hc-badge info" style="font-size:10px;padding:1px 6px;margin-left:5px;">${esc(this.getVirusEffectShortLabel(k, st.versionInt))}</span>` : ''}
                  ${st.customLabStrain ? `<span class="hc-badge success" style="font-size:10px;padding:1px 5px;margin-left:4px;" title="Cepa ${esc(st.customLabStrain.strainName)}">LAB</span>` : ''}
                  ${isHidden ? `<span style="font-size:11px;color:var(--hc-text-3);">(oculto)</span>` : ''}
                </span>
              </td>
              <td class="soft-col-ver">
                <span class="soft-ver-badge ${this.versionTierClass(st.versionInt)}">${verStr}</span>
              </td>
              <td class="soft-col-size">${sizeMb} MB</td>
              <td class="soft-col-acts">
                <div class="soft-icon-actions">
                  <button type="button" id="btnResearch_${k}" class="soft-icon-act ic-info" aria-label="Informações de ${esc(def.filename)}"
                    data-tip-title="${canUpgrade ? `Informações · Evoluir p/ ${nextVerStr}` : 'Informações do programa'}"
                    data-tip-meta="${esc(def.badge)}"
                    data-tip-desc="${esc(def.desc)}"
                    onclick="window.softwareEngine.openSoftwareInfoModal('${k}')">
                    ${HC.icon('info')}
                  </button>
                  ${runIconBtnHtml}
                  <button type="button" class="soft-icon-act ic-hide" aria-label="${isHidden ? 'Revelar' : 'Esconder'} ${esc(def.filename)}"
                    data-tip-title="${isHidden ? 'Revelar programa' : 'Esconder programa'}"
                    data-tip-meta="${isHidden ? 'Seeker' : 'Hider'}"
                    data-tip-desc="${isHidden ? `Revelar ${esc(def.filename)} oculto no disco.` : `Esconder ${esc(def.filename)} no seu disco para que invasores não vejam.`}"
                    onclick="window.softwareEngine.uiToggleHideItem('soft', '${k}')">
                    ${HC.icon(isHidden ? 'eye' : 'eye-off')}
                  </button>
                  <button type="button" class="soft-icon-act ic-move" aria-label="Mover ${esc(def.filename)}"
                    data-tip-title="Mover programa"
                    data-tip-meta="${drvLabel}"
                    data-tip-desc="Mover ${esc(def.filename)} entre HD, SSD, NVMe, pastas ou fazer backup no HD Externo."
                    onclick="window.softwareEngine.openMoveModal('soft', '${k}')">
                    ${HC.icon('folder-input')}
                  </button>
                  <button type="button" class="soft-icon-act ic-del" aria-label="Excluir ${esc(def.filename)}"
                    data-tip-title="Excluir programa"
                    data-tip-meta="+${sizeMb} MB"
                    data-tip-desc="Excluir ${esc(def.filename)} do seu computador e liberar ${sizeMb} MB em disco."
                    onclick="window.softwareEngine.uiDeleteItem('soft', '${k}')">
                    ${HC.icon('trash-2')}
                  </button>
                </div>
              </td>
            </tr>
          `);
        });

        // 3) Cópias auxiliares de Hash / Cracker guardadas nas unidades (HD / SSD / NVMe)
        (this.state.extraCopies || []).forEach((cp) => {
          if (!matchDriveAndFolder(cp.drive, cp.folderId)) return;
          const def = SOFTWARE_DEFINITIONS[cp.softKey] || SOFTWARE_DEFINITIONS.cracker;
          const isHidden = (cp.hiddenWithVer || 0) > 0;
          const drv = ['hd', 'ssd', 'nvme'].includes(cp.drive) ? cp.drive : 'hd';
          const verStr = (cp.versionInt / 10).toFixed(1);
          const fn = cp.customFilename || def.filename;
          const title = cp.customTitle || def.friendlyTitle;
          const isVirusCopy = def.category === 'virus' || !!cp.isLabVirus;
          const copyDesc = isVirusCopy
            ? `${title} — Cepa autoral compilada no Laboratório de Vírus.`
            : `Hash alternativo salvo na unidade ${drv.toUpperCase()} para escolha rápida no Mini-PC.`;
          const primaryCopyBtn = isVirusCopy
            ? (connectedRemoteIp
                ? `<button type="button" class="soft-icon-act ic-run" aria-label="Subir ${esc(fn)} para ${esc(connectedRemoteIp)}"
                    data-tip-title="Subir cepa para PC invadido" data-tip-meta="${esc(connectedRemoteIp)}"
                    data-tip-desc="Enviar ${esc(fn)} (v${verStr}) pela rede para ${esc(connectedRemoteIp)}."
                    onclick="window.navTo('winBrowser');window.internetEngine.switchTab('entrar');window.internetEngine.sshSubTab='files';window.internetEngine.render();">${HC.icon('upload')}</button>`
                : `<button type="button" class="soft-icon-act ic-info" aria-label="Abrir Laboratório de Vírus"
                    data-tip-title="Cepa do Laboratório" data-tip-meta="v${verStr}"
                    data-tip-desc="${esc(title)}"
                    onclick="window.navTo('winVirusLab')">${HC.icon('flask-conical')}</button>`)
            : `<button type="button" class="soft-icon-act ic-run" aria-label="Rodar ${esc(fn)}"
                data-tip-title="Rodar programa" data-tip-meta="2º plano"
                data-tip-desc="Ativar ${esc(fn)} (${verStr}) em segundo plano."
                onclick="window.softwareEngine.startSoftwareViaTaskManager('copy', '${esc(cp.id)}')">${HC.icon('settings')}</button>`;
          tableRows.push(`
            <tr class="${isHidden ? 'row-hidden' : ''}">
              <td class="soft-col-icon">
                <span class="soft-mini-glyph kind-${def.iconKind || 'attack'}"
                  data-tip-title="${esc(title)}" data-tip-meta="v${verStr} · ${drv.toUpperCase()}"
                  data-tip-desc="${esc(copyDesc)}">
                  ${HC.icon(def.icon || 'key-round')}
                </span>
              </td>
              <td>
                <span class="soft-name-trigger" tabindex="0"
                  data-tip-title="${esc(title)}" data-tip-meta="v${verStr} · ${drv.toUpperCase()}"
                  data-tip-desc="${esc(copyDesc)}">
                  <span>${esc(fn)}</span>
                  ${cp.isLabVirus ? `<span class="hc-badge success" style="font-size:10px;padding:1px 5px;margin-left:4px;">LAB</span>` : ''}
                  ${isHidden ? `<span style="font-size:11px;color:var(--hc-text-3);">(oculto)</span>` : ''}
                </span>
              </td>
              <td class="soft-col-ver"><span class="soft-ver-badge ${this.versionTierClass(cp.versionInt)}">${verStr}</span></td>
              <td class="soft-col-size">${cp.sizeMb || 8} MB</td>
              <td class="soft-col-acts">
                <div class="soft-icon-actions">
                  ${primaryCopyBtn}
                  <button type="button" class="soft-icon-act ic-hide" aria-label="${isHidden ? 'Revelar' : 'Esconder'} ${esc(fn)}"
                    data-tip-title="${isHidden ? 'Revelar cópia' : 'Esconder cópia'}" data-tip-meta="${isHidden ? 'Seeker' : 'Hider'}"
                    data-tip-desc="${isHidden ? 'Tornar visível novamente.' : 'Esconder esta cópia no disco.'}"
                    onclick="window.softwareEngine.uiToggleHideItem('copy', '${esc(cp.id)}')">${HC.icon(isHidden ? 'eye' : 'eye-off')}</button>
                  <button type="button" class="soft-icon-act ic-move" aria-label="Mover ${esc(fn)}"
                    data-tip-title="Mover cópia" data-tip-meta="${drv.toUpperCase()}"
                    data-tip-desc="Transferir entre HD, SSD, NVMe ou pastas."
                    onclick="window.softwareEngine.openMoveModal('copy', '${esc(cp.id)}')">${HC.icon('folder-input')}</button>
                  <button type="button" class="soft-icon-act ic-del" aria-label="Excluir ${esc(fn)}"
                    data-tip-title="Excluir cópia" data-tip-meta="+${cp.sizeMb || 8} MB"
                    data-tip-desc="Remover esta cópia do disco."
                    onclick="window.softwareEngine.uiDeleteItem('copy', '${esc(cp.id)}')">${HC.icon('trash-2')}</button>
                </div>
              </td>
            </tr>
          `);
        });

        // 4) Arquivos de texto (.txt)
        (this.state.textFiles || []).forEach((tf) => {
          if (!matchDriveAndFolder(tf.drive, tf.folderId)) return;
          const isHidden = (tf.hiddenWithVer || 0) > 0;
          const drv = ['hd', 'ssd', 'nvme'].includes(tf.drive) ? tf.drive : 'hd';
          const preview = String(tf.content || '').slice(0, 120);
          tableRows.push(`
            <tr class="${isHidden ? 'row-hidden' : ''}">
              <td class="soft-col-icon">
                <span class="soft-mini-glyph kind-text"
                  data-tip-title="${esc(tf.name)}.txt" data-tip-meta="Texto · ${drv.toUpperCase()}" data-tip-desc="${esc(preview)}">
                  ${HC.icon('file-text')}
                </span>
              </td>
              <td>
                <span class="soft-name-trigger" style="cursor:pointer;" tabindex="0" onclick="window.softwareEngine.openTextEditorModal('${esc(tf.id)}')"
                  data-tip-title="Nota: ${esc(tf.name)}.txt" data-tip-meta="${drv.toUpperCase()}" data-tip-desc="${esc(preview)}">
                  <span>${esc(tf.name)}.txt</span>
                  ${isHidden ? `<span style="font-size:11px;color:var(--hc-text-3);">(oculto)</span>` : ''}
                </span>
              </td>
              <td class="soft-col-ver"><span style="color:var(--hc-text-3);">—</span></td>
              <td class="soft-col-size">${tf.sizeMb || 1} MB</td>
              <td class="soft-col-acts">
                <div class="soft-icon-actions">
                  <button type="button" class="soft-icon-act ic-info" aria-label="Ler ou editar ${esc(tf.name)}.txt"
                    data-tip-title="Abrir arquivo .txt" data-tip-desc="Ler ou editar o conteúdo de ${esc(tf.name)}.txt."
                    onclick="window.softwareEngine.openTextEditorModal('${esc(tf.id)}')">${HC.icon('pencil')}</button>
                  <button type="button" class="soft-icon-act ic-hide" aria-label="${isHidden ? 'Revelar' : 'Esconder'} ${esc(tf.name)}.txt"
                    data-tip-title="${isHidden ? 'Revelar nota' : 'Esconder nota'}" data-tip-desc="Alternar visibilidade da nota .txt."
                    onclick="window.softwareEngine.uiToggleHideItem('txt', '${esc(tf.id)}')">${HC.icon(isHidden ? 'eye' : 'eye-off')}</button>
                  <button type="button" class="soft-icon-act ic-move" aria-label="Mover ${esc(tf.name)}.txt"
                    data-tip-title="Mover nota" data-tip-meta="${drv.toUpperCase()}" data-tip-desc="Mover nota entre HD, SSD, NVMe ou pastas."
                    onclick="window.softwareEngine.openMoveModal('txt', '${esc(tf.id)}')">${HC.icon('folder-input')}</button>
                  <button type="button" class="soft-icon-act ic-del" aria-label="Excluir ${esc(tf.name)}.txt"
                    data-tip-title="Excluir nota" data-tip-desc="Apagar ${esc(tf.name)}.txt do seu disco."
                    onclick="window.softwareEngine.uiDeleteItem('txt', '${esc(tf.id)}')">${HC.icon('trash-2')}</button>
                </div>
              </td>
            </tr>
          `);
        });

        const webServerPanel = this.isSoftwareInstalled('webserver') ? `
          <div class="hc-card" style="padding:11px 14px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <span class="hc-eyebrow">Página Web Pública:</span>
            <input type="text" id="localWebServerTextInput" class="hc-input mono" style="flex:1;min-width:200px;height:32px;font-size:12px;" value="${esc(this.state.customWebPage || '')}">
            <button type="button" id="btnSaveLocalWebPage" class="hc-btn primary sm" onclick="window.softwareEngine.saveLocalWebServerPage(document.getElementById('localWebServerTextInput').value)">Publicar</button>
          </div>
        ` : '';

        const nmapPanel = this.lastNmapReport ? `
          <div class="hc-card" style="padding:11px 14px;font-family:var(--hc-font-mono);font-size:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong style="color:var(--hc-accent-text);">Nmap v${esc(this.lastNmapReport.nmapVer)} (${esc(this.lastNmapReport.at)})</strong>
              <button type="button" class="hc-btn ghost sm" onclick="window.softwareEngine.lastNmapReport=null;window.softwareEngine.renderUI();">Fechar</button>
            </div>
            <div style="margin-top:6px;color:var(--hc-text-2);">
              ${this.lastNmapReport.found.length === 0
                ? 'Nenhuma conexão externa detectada neste momento.'
                : this.lastNmapReport.found.map((f) => `<div>• ${esc(f.ip)} (${esc(f.role)}) <button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('${esc(f.ip)}', 'invadir')">Abrir IP</button></div>`).join('')}
            </div>
          </div>
        ` : '';

        bodySectionHtml = `
          <div class="soft-explorer-shell" id="runningProgramsPanel">
            <div class="soft-main-col">
              ${inFolder ? `
                <div class="soft-breadcrumb-bar">
                  <span>${HC.icon('folder')} Pasta atual: <strong class="mono">/${esc(inFolder.name)}</strong></span>
                  <button type="button" class="hc-btn ghost sm" onclick="window.softwareEngine.currentFolderId=null;window.softwareEngine.renderUI();">← Voltar p/ Raiz</button>
                </div>
              ` : ''}
              ${nmapPanel}
              ${webServerPanel}
              <div class="soft-table-wrap" role="region" aria-label="Programas no seu computador">
                <table class="soft-table clean-hw-table">
                  <thead>
                    <tr>
                      <th class="soft-col-icon"></th>
                      <th>Nome do programa</th>
                      <th class="soft-col-ver">Versão</th>
                      <th class="soft-col-size">Tamanho</th>
                      <th class="soft-col-acts">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRows.length > 0
                      ? tableRows.join('')
                      : `<tr><td colspan="5" style="text-align:center;padding:34px 16px;color:var(--hc-text-3);">Não há programas para exibir nesta unidade.</td></tr>`}
                  </tbody>
                </table>
              </div>
            </div>

            <aside class="soft-side-bar">
              ${this.renderDonutSvg(usedHdd, maxHdd, 'Uso do Disco')}

              <div class="soft-bays-box">
                <div class="soft-bay-row"><span>HD (${bays.hd.speedLabel})</span><span>${bays.hd.usedMb}/${bays.hd.capMb} MB</span></div>
                <div class="soft-bay-row"><span style="color:var(--hc-info-text);">SSD (${bays.ssd.speedLabel})</span><span>${bays.ssd.usedMb}/${bays.ssd.capMb} MB</span></div>
                <div class="soft-bay-row"><span style="color:var(--hc-accent-text);">NVMe (${bays.nvme.speedLabel})</span><span>${bays.nvme.usedMb}/${bays.nvme.capMb} MB</span></div>
                <div style="border-top:1px solid var(--hc-border);margin:3px 0;"></div>
                <div class="soft-bay-row"><span>Memória RAM</span><span>${usedRam}/${maxRam} MB</span></div>
              </div>

              <div class="soft-tool-tiles">
                <button type="button" class="soft-tool-tile" onclick="window.softwareEngine.openTextEditorModal(null)">
                  ${HC.icon('file-plus')}
                  <span>Novo arquivo .txt</span>
                </button>
                <button type="button" class="soft-tool-tile" onclick="window.softwareEngine.openCreateFolderModal()">
                  ${HC.icon('folder-plus')}
                  <span>Criar pasta</span>
                </button>
                <button type="button" class="soft-tool-tile span-2 danger" onclick="window.softwareEngine.formatLocalHardDrive(false)">
                  ${HC.icon('hard-drive')}
                  <span>Formatar HD</span>
                </button>
              </div>
            </aside>
          </div>
        `;
      }

      const feedbackBannerHtml = this.feedbackMessage ? `
        <div class="soft-feedback-banner" id="softFeedbackBanner">
          <span>${esc(this.feedbackMessage)}</span>
          <button type="button" aria-label="Fechar aviso" onclick="window.softwareEngine.feedbackMessage=null;window.softwareEngine.renderUI();">✕</button>
        </div>
      ` : '';

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${feedbackBannerHtml}
          ${hostileBanner}

          <div class="soft-frame" id="softwareExplorerMain">
            <div class="soft-tabs-bar">
              <div class="soft-tabs-left">
                <button type="button" class="soft-tab-btn ${this.activeTab === 'inventory' ? 'active' : ''}" onclick="window.softwareEngine.activeTab='inventory';window.softwareEngine.renderUI();">
                  ${HC.icon('folder')} <span>Programas</span>
                </button>
                <button type="button" id="tabStealthAndXhd" class="soft-tab-btn ${this.activeTab === 'xhd' ? 'active' : ''}" onclick="window.softwareEngine.activeTab='xhd';window.softwareEngine.renderUI();">
                  ${HC.icon('hard-drive')} <span>HD Externo</span>
                </button>
                <button type="button" id="tabActiveViruses" class="soft-tab-btn ${this.activeTab === 'viruses' ? 'active' : ''}" onclick="window.softwareEngine.activeTab='viruses';window.softwareEngine.renderUI();">
                  ${HC.icon('bug')} <span>Rede de Vírus (${harvest.virusCount})</span>
                </button>
                <button type="button" id="tabDiscoverSoft" class="soft-tab-btn ${this.activeTab === 'discover' ? 'active' : ''}" onclick="window.softwareEngine.activeTab='discover';window.softwareEngine.renderUI();">
                  ${HC.icon('sparkles')} <span>A Encontrar (${unownedAllKeys.length})</span>
                </button>
              </div>

              ${this.activeTab === 'inventory' ? `
                <div class="soft-drive-pills" role="group" aria-label="Filtrar por unidade">
                  <button type="button" class="soft-drive-pill ${this.driveFilter === 'all' ? 'active' : ''}" onclick="window.softwareEngine.driveFilter='all';window.softwareEngine.renderUI();">Todas</button>
                  <button type="button" class="soft-drive-pill ${this.driveFilter === 'hd' ? 'active' : ''}" onclick="window.softwareEngine.driveFilter='hd';window.softwareEngine.renderUI();">HD</button>
                  <button type="button" class="soft-drive-pill ${this.driveFilter === 'ssd' ? 'active' : ''}" onclick="window.softwareEngine.driveFilter='ssd';window.softwareEngine.renderUI();">SSD</button>
                  <button type="button" class="soft-drive-pill ${this.driveFilter === 'nvme' ? 'active' : ''}" onclick="window.softwareEngine.driveFilter='nvme';window.softwareEngine.renderUI();">NVMe</button>
                </div>
              ` : ''}
            </div>

            ${bodySectionHtml}
          </div>

          ${this.activeTab === 'inventory' && unownedAllKeys.length > 0 ? `
            <section class="soft-discover-section" id="softwareDiscoverCardsSection">
              <div class="soft-discover-header">
                <div>
                  <div class="hc-eyebrow">Catálogo da Rede · Ainda Não Encontrados (${unownedAllKeys.length})</div>
                  <div style="font-size:12.5px;color:var(--hc-text-3);margin-top:2px;">Outros aplicativos e vírus existentes no mundo para você descobrir explorando servidores e enigmas.</div>
                </div>
              </div>
              ${this.renderDiscoverCardsHtml(unownedAllKeys)}
            </section>
          ` : ''}
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
