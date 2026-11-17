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
    document.querySelectorAll('.nav-item[data-win]').forEach(btn => {
      const active = btn.getAttribute('data-win') === this.current;
      btn.classList.toggle('active', active);
      if (active) {
        btn.setAttribute('aria-current', 'page');
        const title = document.getElementById('pageTitle');
        const label = btn.querySelector('span');
        if (title && label) title.textContent = label.textContent;
      } else {
        btn.removeAttribute('aria-current');
      }
    });
  }
}

window.winManager = new WindowManager();
