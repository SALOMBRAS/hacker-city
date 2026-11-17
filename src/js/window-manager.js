/**
 * Hacker City // Floating Window Manager
 * Gerencia ciclo de vida, arrasto e foco das janelas do desktop
 */
class WindowManager {
  constructor() {
    this.highestZ = 100;
    this.isDragging = false;
    this.dragTarget = null;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    this.initGlobalDragListeners();
  }

  open(winId) {
    const el = document.getElementById(winId);
    if (!el) return;
    el.style.display = 'flex';
    this.focus(winId);
    this.updateTaskbar();
  }

  close(winId) {
    const el = document.getElementById(winId);
    if (el) el.style.display = 'none';
    this.updateTaskbar();
  }

  focus(winId) {
    this.highestZ += 2;
    document.querySelectorAll('.window-frame').forEach(w => w.classList.remove('focused'));
    const el = document.getElementById(winId);
    if (el) {
      el.style.zIndex = this.highestZ;
      el.classList.add('focused');
    }
  }

  startDrag(e, winId) {
    this.isDragging = true;
    this.dragTarget = document.getElementById(winId);
    this.focus(winId);
    const rect = this.dragTarget.getBoundingClientRect();
    this.dragOffsetX = e.clientX - rect.left;
    this.dragOffsetY = e.clientY - rect.top;
  }

  initGlobalDragListeners() {
    window.addEventListener('mousemove', (e) => {
      if (this.isDragging && this.dragTarget) {
        this.dragTarget.style.left = (e.clientX - this.dragOffsetX) + 'px';
        this.dragTarget.style.top = (e.clientY - this.dragOffsetY) + 'px';
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.dragTarget = null;
    });
  }

  updateTaskbar() {
    const container = document.getElementById('taskbarTasks');
    if (!container) return;
    container.innerHTML = '';

    const list = [
      { id: 'winTerminal', label: '📟 Terminal' },
      { id: 'winBank', label: '🏦 Banco' },
      { id: 'winIrc', label: '💬 IRC Chat' },
      { id: 'winBrowser', label: '🌐 Browser' },
      { id: 'winScanner', label: '🎯 Scanner' },
      { id: 'winArcade', label: '🕹️ Arcade' },
      { id: 'winPanic', label: '🚨 Pânico' },
      { id: 'winProfile', label: '👤 Perfil' }
    ];

    list.forEach(item => {
      const el = document.getElementById(item.id);
      if (el && el.style.display !== 'none') {
        const btn = document.createElement('div');
        btn.className = 'task-item' + (el.classList.contains('focused') ? ' active' : '');
        btn.innerText = item.label;
        btn.onclick = () => this.focus(item.id);
        container.appendChild(btn);
      }
    });
  }
}

window.winManager = new WindowManager();
