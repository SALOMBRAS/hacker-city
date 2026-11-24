/**
 * ============================================================================
 * HACKER CITY — PALETA DE COMANDO RÁPIDO (⚡ Ação Rápida / Alt+K)
 * Busca instantânea de telas (respeitando desbloqueio progressivo), abertura
 * direta de IPs colados/digitados e atalhos de 1 toque para celular e PC.
 * ============================================================================
 */
(function () {
  'use strict';

  const SCREEN_ENTRIES = [
    { win: 'winHome', title: 'Início (Painel Principal)', tags: 'home inicio painel rotina metas' },
    { win: 'winBrowser', title: 'Internet & Navegar por IPs', tags: 'internet navegador ip invadir ssh' },
    { win: 'winTaskManager', title: 'Fila de Ações & Processos', tags: 'processos fila downloads quebras' },
    { win: 'winSoftware', title: 'Programas, Vírus & Proteção', tags: 'programas softwares virus firewall antivirus' },
    { win: 'winHardware', title: 'Peças do PC & Conserto', tags: 'hardware pecas cpu ram hd vps consertar raid' },
    { win: 'winLogs', title: 'Meus Rastros (Logs)', tags: 'logs rastros apagar ip syslog sombra' },
    { win: 'winBank', title: 'Finanças & Bancos', tags: 'banco dinheiro saldo transferir offshore' },
    { win: 'winUniversity', title: 'Universidade & Cursos', tags: 'universidade cursos estudo cert' },
    { win: 'winQuitinete', title: 'Esconderijo & Contas Fixas', tags: 'esconderijo quitinete luz aluguel contas' },
    { win: 'winLaundering', title: 'Empresas de Lavagem & Mercado P2P', tags: 'lavagem dinheiro sujo limpo empresa' },
    { win: 'winOpsHub', title: 'Bolsa de Empresas & Desafios', tags: 'bolsa acoes cyberstock desafios minigames' },
    { win: 'winBitcoin', title: 'Carteira Bitcoin & Mercado Negro', tags: 'bitcoin btc cripto carteira' },
    { win: 'winMissions', title: 'Missões & Contratos', tags: 'missoes contratos faccoes' },
    { win: 'winOnline', title: 'Jogadores Online (PvP)', tags: 'online jogadores pvp rede' },
    { win: 'winVirusLab', title: 'Laboratório de Vírus', tags: 'laboratorio virus cepas montar' },
    { win: 'winFbi', title: 'Polícia, FBI & Vingança', tags: 'fbi policia procurado recompensa bounty' },
    { win: 'winClan', title: 'Clãs & Equipes', tags: 'cla equipe guerra chat' },
    { win: 'winProfile', title: 'Minha Conta, IP & App PWA', tags: 'conta perfil trocar ip instalar app pwa' }
  ];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  class QuickCommandPalette {
    constructor() {
      this.isOpen = false;
      this.query = '';
      this.selectedIndex = 0;
      this.currentItems = [];
      this.bindGlobalKeys();
    }

    bindGlobalKeys() {
      document.addEventListener('keydown', (e) => {
        if ((e.altKey && (e.key === 'k' || e.key === 'K')) || ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'k' || e.key === 'K'))) {
          const authEl = document.getElementById('authOverlay');
          if (authEl && getComputedStyle(authEl).display !== 'none') return;
          e.preventDefault();
          this.toggle();
          return;
        }
        if (!this.isOpen) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          this.close();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (this.currentItems.length > 0) {
            this.selectedIndex = (this.selectedIndex + 1) % this.currentItems.length;
            this.renderList();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (this.currentItems.length > 0) {
            this.selectedIndex = (this.selectedIndex - 1 + this.currentItems.length) % this.currentItems.length;
            this.renderList();
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.executeIndex(this.selectedIndex);
        }
      });
    }

    ensureDom() {
      let ov = document.getElementById('hcQuickPaletteOverlay');
      if (ov) return ov;
      ov = document.createElement('div');
      ov.id = 'hcQuickPaletteOverlay';
      ov.className = 'hc-qcp-overlay';
      ov.style.display = 'none';
      ov.addEventListener('click', (e) => {
        if (e.target === ov) this.close();
      });
      ov.innerHTML = `
        <div id="hcQuickPaletteDialog" class="hc-qcp-dialog" role="dialog" aria-label="Paleta de Ações Rápidas">
          <div class="hc-qcp-head">
            <span style="font-size:15px;">⚡</span>
            <input type="text" id="hcQuickPaletteInput" class="hc-qcp-input" placeholder="Buscar tela, ação ou digitar IP (ex: 71.4.5.1)..." autocomplete="off">
            <button type="button" class="hc-btn ghost sm" onclick="window.quickCommandPalette.close()" aria-label="Fechar">✕</button>
          </div>
          <div id="hcQuickPaletteList" class="hc-qcp-list"></div>
          <div class="hc-qcp-foot">
            <span>Dica: digite qualquer IP para conectar em 1 toque · Atalho: <strong>Alt + K</strong></span>
          </div>
        </div>
      `;
      document.body.appendChild(ov);
      const inp = ov.querySelector('#hcQuickPaletteInput');
      if (inp) {
        inp.addEventListener('input', () => {
          this.query = inp.value || '';
          this.selectedIndex = 0;
          this.renderList();
        });
      }
      return ov;
    }

    buildItems(rawQuery) {
      const q = String(rawQuery || '').trim().toLowerCase();
      const items = [];

      const ipMatch = q.match(/^(\d{1,3}(?:\.\d{1,3}){3})$/);
      if (ipMatch) {
        const ip = ipMatch[1];
        items.push({
          id: 'open_ip',
          badge: 'IP Direto',
          title: `🌐 Conectar ao endereço ${ip}`,
          sub: 'Abre o navegador de rede direto neste alvo',
          run: () => {
            if (window.internetEngine) window.internetEngine.openIp(ip);
          }
        });
      }

      const harvest = (window.softwareEngine && typeof window.softwareEngine.getPendingHarvestSummary === 'function')
        ? window.softwareEngine.getPendingHarvestSummary()
        : { cashReady: 0, virusCount: 0 };
      const quickActions = [
        {
          id: 'act_harvest',
          badge: harvest.cashReady >= 0.05 ? `+$${harvest.cashReady.toFixed(2)}` : `${harvest.virusCount} ativos`,
          title: '🦠 Coletar Vírus Prontos Agora',
          sub: 'Recolhe lucros acumulados da rede de vírus em 1 clique',
          tags: 'coletar virus colher dinheiro btc',
          run: () => {
            if (window.softwareEngine) {
              const res = window.softwareEngine.collectAllViruses();
              if (res && res.message && typeof window.showToast === 'function') window.showToast(res.message);
              if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
            }
          }
        },
        {
          id: 'act_briefing',
          badge: 'Relatório',
          title: '📬 Abrir Resumo "Enquanto Esteve Offline"',
          sub: 'Veja rendimentos, lavagens prontas e ataques bloqueados',
          tags: 'resumo offline ausente bloqueios relatorio',
          run: () => {
            if (window.operatorRetentionEngine) window.operatorRetentionEngine.openOfflineBriefingModal();
          }
        },
        {
          id: 'act_fullscreen',
          badge: 'Mobile / App',
          title: '📲 Instalar Aplicativo ou Alternar Tela Cheia',
          sub: 'Oculta barras do navegador no celular ou computador',
          tags: 'tela cheia fullscreen instalar app celular pwa',
          run: () => {
            if (window.pwaHelper) window.pwaHelper.promptInstallApp();
          }
        }
      ];

      quickActions.forEach((act) => {
        if (!q || act.title.toLowerCase().includes(q) || act.tags.includes(q)) {
          items.push(act);
        }
      });

      SCREEN_ENTRIES.forEach((sc) => {
        if (q && !sc.title.toLowerCase().includes(q) && !sc.tags.includes(q)) return;
        const unlocked = !window.progressiveUnlockEngine || window.progressiveUnlockEngine.isUnlocked(sc.win);
        items.push({
          id: `win_${sc.win}`,
          badge: unlocked ? 'Abrir Tela' : '🔒 Bloqueado',
          locked: !unlocked,
          title: `${unlocked ? '▸' : '🔒'} ${sc.title}`,
          sub: unlocked ? 'Navegação imediata' : 'Toque para ver como desbloquear esta etapa',
          run: () => {
            if (unlocked && typeof window.navTo === 'function') {
              window.navTo(sc.win);
            } else if (window.progressiveUnlockEngine && typeof window.progressiveUnlockEngine.showUnlockHintModal === 'function') {
              window.progressiveUnlockEngine.showUnlockHintModal(sc.win);
            } else if (typeof window.navTo === 'function') {
              window.navTo(sc.win);
            }
          }
        });
      });

      return items.slice(0, 14);
    }

    renderList() {
      const ov = this.ensureDom();
      const listEl = ov.querySelector('#hcQuickPaletteList');
      if (!listEl) return;
      this.currentItems = this.buildItems(this.query);
      if (this.currentItems.length === 0) {
        listEl.innerHTML = `<div style="padding:18px 12px;text-align:center;color:var(--hc-text-3);font-size:12.5px;">Nenhum comando encontrado. Digite um nome de tela ou um IP (ex: 71.4.5.1).</div>`;
        return;
      }
      if (this.selectedIndex >= this.currentItems.length) this.selectedIndex = 0;
      listEl.innerHTML = this.currentItems.map((it, idx) => `
        <button type="button" class="hc-qcp-item ${idx === this.selectedIndex ? 'active' : ''}" onclick="window.quickCommandPalette.executeIndex(${idx})">
          <div style="min-width:0;text-align:left;flex:1 1 160px;">
            <strong style="display:block;font-size:12.8px;color:${it.locked ? 'var(--hc-text-2)' : '#fff'};overflow-wrap:anywhere;">${esc(it.title)}</strong>
            <span style="display:block;font-size:11px;color:var(--hc-text-3);">${esc(it.sub)}</span>
          </div>
          <span class="hc-badge ${it.locked ? '' : 'success'}" style="font-size:10.5px;flex-shrink:0;">${esc(it.badge)}</span>
        </button>
      `).join('');
    }

    executeIndex(idx) {
      const item = this.currentItems[idx];
      if (!item) return;
      this.close();
      item.run();
    }

    open() {
      const ov = this.ensureDom();
      this.isOpen = true;
      this.query = '';
      this.selectedIndex = 0;
      ov.style.display = 'flex';
      const inp = ov.querySelector('#hcQuickPaletteInput');
      if (inp) {
        inp.value = '';
        setTimeout(() => inp.focus(), 30);
      }
      this.renderList();
    }

    close() {
      this.isOpen = false;
      const ov = document.getElementById('hcQuickPaletteOverlay');
      if (ov) ov.style.display = 'none';
    }

    toggle() {
      if (this.isOpen) this.close();
      else this.open();
    }
  }

  window.quickCommandPalette = new QuickCommandPalette();
})();
