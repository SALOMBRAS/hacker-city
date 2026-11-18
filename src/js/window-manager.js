/**
 * Hacker City // Gerenciador de páginas
 * Mantém a API antiga (open/close/focus) para não quebrar o resto do jogo,
 * mas cada "janela" agora é uma página única na área principal do shell.
 */
class WindowManager {
  constructor() {
    this.current = null;
    this.home = 'winHome';
  }

  frames() {
    return document.querySelectorAll('.window-frame');
  }

  open(winId) {
    const el = document.getElementById(winId);
    if (!el) return;
    this.frames().forEach(w => {
      if (w !== el) w.style.display = 'none';
      w.classList.remove('focused');
    });
    el.style.display = 'flex';
    el.classList.add('focused');
    this.current = winId;
    if (winId === this.home && !(window.spotlightTour && window.spotlightTour.isActive)) {
      document.querySelectorAll('details.nav-topic').forEach(d => { d.open = false; });
    }
    this.syncNav();
  }

  close(winId) {
    // Páginas não fecham: voltam para a Home.
    if (winId === this.home) return;
    const el = document.getElementById(winId);
    if (el) el.style.display = 'none';
    this.open(this.home);
  }

  focus(winId) { this.open(winId); }

  // Compatibilidade: páginas não são arrastáveis.
  startDrag() {}

  // Compatibilidade com chamadas antigas.
  updateTaskbar() { this.syncNav(); }

  syncNav() {
    let activeTopic = null;
    document.querySelectorAll('.nav-item[data-win]').forEach(btn => {
      const active = btn.getAttribute('data-win') === this.current;
      btn.classList.toggle('active', active);
      if (active) {
        btn.setAttribute('aria-current', 'page');
        const title = document.getElementById('pageTitle');
        const label = btn.querySelector('span');
        if (title && label) title.textContent = label.textContent;
        activeTopic = btn.closest('details.nav-topic');
      } else {
        btn.removeAttribute('aria-current');
      }
    });

    document.querySelectorAll('details.nav-topic').forEach(topic => {
      const isParent = topic === activeTopic;
      topic.classList.toggle('has-active-child', isParent);
      if (isParent && !topic.open) {
        topic.open = true;
      }
    });
  }
}

window.winManager = new WindowManager();
