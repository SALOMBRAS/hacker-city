/**
 * Hacker City // Gerenciador de Páginas, Mini-Menu Flyout & Barra de Processos
 * Cada tela ocupa a área principal do shell de forma limpa e integrada.
 */
class WindowManager {
  constructor() {
    this.current = null;
    this.home = 'winHome';
    this.boundListeners = false;
    setTimeout(() => this.initShellInteractions(), 0);
  }

  frames() {
    return document.querySelectorAll('.window-frame');
  }

  initShellInteractions() {
    if (this.boundListeners) return;
    this.boundListeners = true;

    // Posiciona o Mini-Menu Flutuante (Flyout) ao abrir qualquer tópico da sidebar
    document.querySelectorAll('details.nav-topic').forEach((topic) => {
      topic.addEventListener('toggle', () => {
        if (topic.open) {
          // Fecha os demais tópicos para manter 1 único mini-menu limpo por vez
          document.querySelectorAll('details.nav-topic').forEach((other) => {
            if (other !== topic && other.open) other.open = false;
          });
          this.positionFlyout(topic);
        }
      });
    });

    // Fecha o Mini-Menu ao clicar fora da sidebar (respeitando o Tour Guiado se ativo)
    document.addEventListener('click', (ev) => {
      if (window.spotlightTour && window.spotlightTour.isActive) return;
      const inTopic = ev.target.closest('details.nav-topic');
      if (!inTopic) {
        this.closeAllFlyouts();
      }
    });

    // Atalhos de teclado: Esc fecha mini-menus e gaveta mobile; Ctrl+K foca na busca de IP
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        if (!(window.spotlightTour && window.spotlightTour.isActive)) {
          this.closeAllFlyouts();
          this.setMobileSidebarOpen(false);
        }
      }
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k') {
        const input = document.getElementById('topbarIpInput');
        if (input && input.offsetParent !== null) {
          ev.preventDefault();
          input.focus();
          input.select();
        }
      }
    });

    window.addEventListener('resize', () => {
      const openTopic = document.querySelector('details.nav-topic[open]');
      if (openTopic) this.positionFlyout(openTopic);
    });

    // Restaura preferência de sidebar recolhida se salva
    try {
      if (localStorage.getItem('HC_SIDEBAR_COLLAPSED') === '1') {
        this.setSidebarCollapsed(true);
      }
    } catch (e) {}

    // Atualiza o widget flutuante de processos no canto inferior direito
    setInterval(() => this.refreshFloatingTasksPill(), 450);
  }

  positionFlyout(topic) {
    if (window.innerWidth <= 860) {
      const sub = topic.querySelector('.nav-sublist');
      if (sub) {
        sub.style.top = '';
        sub.style.left = '';
      }
      return;
    }
    const summary = topic.querySelector('.nav-topic-summary');
    const sub = topic.querySelector('.nav-sublist');
    if (!summary || !sub) return;

    const rect = summary.getBoundingClientRect();
    const subHeight = sub.offsetHeight || 280;
    const maxTop = Math.max(12, window.innerHeight - subHeight - 16);
    const idealTop = Math.min(Math.max(12, rect.top - 6), maxTop);
    sub.style.top = `${Math.round(idealTop)}px`;
  }

  closeAllFlyouts() {
    document.querySelectorAll('details.nav-topic[open]').forEach((d) => {
      d.open = false;
    });
  }

  setSidebarCollapsed(collapsed) {
    const desk = document.getElementById('desktopEnvironment');
    if (!desk) return;
    desk.classList.toggle('sidebar-collapsed', !!collapsed);
    const btn = document.getElementById('btnCollapseSidebar');
    if (btn && window.HC && window.HC.icon) {
      btn.innerHTML = window.HC.icon(collapsed ? 'chevrons-right' : 'chevrons-left');
      btn.title = collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral';
    }
    try {
      localStorage.setItem('HC_SIDEBAR_COLLAPSED', collapsed ? '1' : '0');
    } catch (e) {}
  }

  toggleSidebarCollapse() {
    const desk = document.getElementById('desktopEnvironment');
    if (!desk) return;
    this.setSidebarCollapsed(!desk.classList.contains('sidebar-collapsed'));
  }

  setMobileSidebarOpen(open) {
    const sb = document.querySelector('.sidebar');
    const bd = document.getElementById('hcMobileDrawerBackdrop');
    const next = typeof open === 'boolean' ? open : !(sb && sb.classList.contains('mobile-open'));
    if (sb) sb.classList.toggle('mobile-open', next);
    if (bd) bd.classList.toggle('active', next);
    if (next) this.setMobileIpBarOpen(false);
    return next;
  }

  setMobileIpBarOpen(open) {
    const bar = document.getElementById('hcMobileIpDrawerBar');
    if (!bar) return false;
    const next = typeof open === 'boolean' ? open : !bar.classList.contains('open');
    bar.classList.toggle('open', next);
    if (next) {
      const inp = document.getElementById('mobileQuickIpInput');
      if (inp) setTimeout(() => inp.focus(), 40);
    }
    return next;
  }

  refreshFloatingTasksPill() {
    const pill = document.getElementById('hcFloatingTasksPill');
    const txt = document.getElementById('hcFloatingTasksLabel');
    const bar = document.getElementById('hcFloatingTasksBar');
    if (!pill || !txt || !bar) return;

    const running = (window.taskManager && typeof window.taskManager.getRunningAll === 'function')
      ? window.taskManager.getRunningAll()
      : [];
    const count = running.length;

    txt.textContent = count === 1 ? '1 processo' : `${count} processos`;
    if (count === 0) {
      bar.style.width = '0%';
    } else {
      let sum = 0;
      running.forEach((p) => {
        const pct = (Number(p.workDone || 0) / Math.max(0.1, Number(p.workTotal || 1))) * 100;
        sum += Math.min(99.9, Math.max(1, pct));
      });
      bar.style.width = `${Math.round(sum / count)}%`;
    }
  }

  open(winId) {
    this.initShellInteractions();
    const el = document.getElementById(winId);
    if (!el) return;

    this.frames().forEach((w) => {
      if (w !== el) w.style.display = 'none';
      w.classList.remove('focused');
    });
    el.style.display = 'flex';
    el.classList.add('focused');
    this.current = winId;
    if (winId !== 'winBrowser' && window.internetEngine && typeof window.internetEngine.closeCrackerMiniPc === 'function') {
      window.internetEngine.closeCrackerMiniPc();
    }
    if (window.progressiveUnlockEngine && typeof window.progressiveUnlockEngine.markSeen === 'function') {
      window.progressiveUnlockEngine.markSeen(winId);
    }

    // Dispara renderização sob demanda das páginas novas
    if (winId === 'winHome' && typeof window.renderHome === 'function') {
      window.renderHome();
    } else if (winId === 'winConnManager' && window.connManagerEngine) {
      window.connManagerEngine.renderPage();
    } else if (winId === 'winLan' && window.lanServersEngine) {
      window.lanServersEngine.renderUI();
    } else if (winId === 'winWorldMap' && window.worldMapEngine) {
      window.worldMapEngine.renderUI();
    } else if (winId === 'winForum' && window.darknetSocialEngine) {
      window.darknetSocialEngine.renderForumUI();
    } else if (winId === 'winNews' && window.darknetSocialEngine) {
      window.darknetSocialEngine.renderNewsUI();
    } else if (winId === 'winVirusLab' && window.virusLabEngine) {
      window.virusLabEngine.renderUI('virusLabAppBody');
    } else if (winId === 'winOpsHub' && window.ecosystemHub) {
      window.ecosystemHub.renderUI('opsHubAppBody');
    } else if (winId === 'winLaundering' && window.nineSystemsEngine) {
      window.nineSystemsEngine.renderLaunderingHub('launderingAppBody');
    }

    // Fecha o flyout após escolher um destino (a menos que o Tour esteja guiando o menu)
    if (!(window.spotlightTour && window.spotlightTour.isActive)) {
      this.closeAllFlyouts();
      this.setMobileSidebarOpen(false);
    }

    this.syncNav();
  }

  close(winId) {
    if (winId === this.home) return;
    const el = document.getElementById(winId);
    if (el) el.style.display = 'none';
    this.open(this.home);
  }

  focus(winId) { this.open(winId); }
  startDrag() {}
  updateTaskbar() { this.syncNav(); }

  syncNav() {
    let activeTopic = null;

    document.querySelectorAll('.nav-item[data-win]').forEach((btn) => {
      const active = btn.getAttribute('data-win') === this.current;
      btn.classList.toggle('active', active);
      if (active) {
        btn.setAttribute('aria-current', 'page');
        const title = document.getElementById('pageTitle');
        const label = btn.querySelector('.nav-item-copy > span') || btn.querySelector('span');
        if (title && label) title.textContent = label.textContent;
        activeTopic = btn.closest('details.nav-topic');
      } else {
        btn.removeAttribute('aria-current');
      }
    });

    document.querySelectorAll('.nav-quick-btn[data-win]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-win') === this.current);
    });

    document.querySelectorAll('details.nav-topic').forEach((topic) => {
      topic.classList.toggle('has-active-child', topic === activeTopic);
    });
    if (window.progressiveUnlockEngine && typeof window.progressiveUnlockEngine.syncSidebarDom === 'function') {
      window.progressiveUnlockEngine.syncSidebarDom();
    }
  }
}

window.winManager = new WindowManager();
window.toggleSidebarCollapse = () => window.winManager.toggleSidebarCollapse();
window.toggleMobileSidebar = (force) => window.winManager.setMobileSidebarOpen(force);
window.toggleMobileIpBar = (force) => window.winManager.setMobileIpBarOpen(force);
