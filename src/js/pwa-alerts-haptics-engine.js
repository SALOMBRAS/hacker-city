/**
 * ============================================================================
 * HACKER CITY — MOTOR DE ALERTAS NATIVOS DO SISTEMA & VIBRAÇÃO TÁTIL MOBILE
 * Dispara notificações via Service Worker (ou Notification API) e pulsos táteis
 * distintos (navigator.vibrate) para invasões PvP, lavagens, fila e escudo 24h.
 * ============================================================================
 */
(function () {
  'use strict';

  const PREFS_KEY = 'HC_PWA_ALERTS_PREFS_V1';
  const VIBRATION_PATTERNS = {
    intrusion: [200, 80, 200, 80, 260],
    launderDone: [70, 50, 110],
    taskDone: [45, 35, 45],
    shieldExpiring: [140, 70, 140],
    test: [80, 45, 120]
  };

  class PwaAlertsHapticsEngine {
    constructor() {
      this.prefs = this.loadPrefs();
      this.recentAlerts = [];
      this.lastTagSentAt = {};
      this.lastVibrationPattern = null;
    }

    loadPrefs() {
      try {
        const raw = localStorage.getItem(PREFS_KEY);
        if (raw) {
          const p = JSON.parse(raw);
          return {
            notificationsEnabled: !!p.notificationsEnabled,
            hapticsEnabled: p.hapticsEnabled !== false
          };
        }
      } catch (e) {}
      return { notificationsEnabled: false, hapticsEnabled: true };
    }

    savePrefs() {
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs));
      } catch (e) {}
    }

    isHapticsSupported() {
      return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
    }

    isNotificationSupported() {
      return typeof window !== 'undefined' && 'Notification' in window;
    }

    vibrate(kind = 'taskDone') {
      const pattern = VIBRATION_PATTERNS[kind] || VIBRATION_PATTERNS.taskDone;
      this.lastVibrationPattern = { kind, pattern, at: Date.now() };
      if (!this.prefs.hapticsEnabled || !this.isHapticsSupported()) return false;
      try {
        return !!navigator.vibrate(pattern);
      } catch (e) {
        return false;
      }
    }

    triggerAlert(kind, opts = {}) {
      const title = String(opts.title || 'Hacker City — Alerta Operacional');
      const body = String(opts.body || '');
      const winId = String(opts.winId || 'winHome');
      const tag = String(opts.tag || `hc-${kind}`);
      const cooldownMs = Number(opts.cooldownMs != null ? opts.cooldownMs : 8000);
      const now = Date.now();

      if (this.lastTagSentAt[tag] && (now - this.lastTagSentAt[tag]) < cooldownMs) {
        return { sent: false, reason: 'COOLDOWN' };
      }
      this.lastTagSentAt[tag] = now;

      const vibrated = this.vibrate(kind);
      const entry = { id: now + '_' + kind, kind, title, body, winId, at: now, vibrated, notified: false };
      this.recentAlerts.unshift(entry);
      if (this.recentAlerts.length > 15) this.recentAlerts.length = 15;

      const shouldNotifyOs = this.prefs.notificationsEnabled &&
        this.isNotificationSupported() &&
        Notification.permission === 'granted' &&
        (document.hidden || opts.forceOs === true || kind === 'intrusion');

      if (shouldNotifyOs) {
        try {
          const swCtrl = navigator.serviceWorker && navigator.serviceWorker.controller;
          if (swCtrl) {
            swCtrl.postMessage({ type: 'SHOW_NOTIFICATION', title, body, tag, winId });
            entry.notified = true;
          } else {
            const n = new Notification(title, { body, icon: 'src/assets/icon-192.png', tag });
            n.onclick = () => {
              window.focus();
              if (typeof window.navTo === 'function') window.navTo(winId);
              n.close();
            };
            entry.notified = true;
          }
        } catch (e) {}
      }

      return { sent: true, vibrated, notified: entry.notified, entry };
    }

    async toggleNotifications() {
      if (!this.isNotificationSupported()) {
        if (typeof window.showToast === 'function') {
          window.showToast('Seu navegador não suporta Notificações Nativas neste modo.');
        }
        return { enabled: false, reason: 'UNSUPPORTED' };
      }
      if (this.prefs.notificationsEnabled) {
        this.prefs.notificationsEnabled = false;
        this.savePrefs();
        this.renderProfileControls();
        if (typeof window.showToast === 'function') window.showToast('🔕 Alertas do sistema desativados.');
        return { enabled: false };
      }

      let perm = Notification.permission;
      if (perm === 'default') {
        try { perm = await Notification.requestPermission(); } catch (e) {}
      }
      if (perm !== 'granted') {
        if (typeof window.showToast === 'function') {
          window.showToast('⚠️ Permissão de notificação bloqueada nas configurações do navegador.');
        }
        this.renderProfileControls();
        return { enabled: false, reason: perm };
      }

      this.prefs.notificationsEnabled = true;
      this.savePrefs();
      this.renderProfileControls();
      this.triggerAlert('test', {
        title: '🔔 Alertas Táticos Ativados!',
        body: 'Você será avisado sobre invasões, lavagens prontas e fim do Escudo.',
        winId: 'winProfile',
        forceOs: true,
        cooldownMs: 0
      });
      if (typeof window.showToast === 'function') {
        window.showToast('🔔 Alertas nativos de Invasão, Lavagem e Escudo ativados!');
      }
      return { enabled: true };
    }

    toggleHaptics() {
      this.prefs.hapticsEnabled = !this.prefs.hapticsEnabled;
      this.savePrefs();
      if (this.prefs.hapticsEnabled) this.vibrate('test');
      this.renderProfileControls();
      if (typeof window.showToast === 'function') {
        window.showToast(this.prefs.hapticsEnabled ? '📳 Vibração tátil mobile ativada!' : '📳 Vibração tátil desativada.');
      }
      return { enabled: this.prefs.hapticsEnabled };
    }

    sendTestAlert() {
      const res = this.triggerAlert('test', {
        title: '📡 Teste Operacional Hacker City',
        body: 'Canal de alerta e vibração tátil funcionando em tempo real.',
        winId: 'winConnManager',
        forceOs: true,
        cooldownMs: 0
      });
      if (typeof window.showToast === 'function') {
        window.showToast('📡 Pulso tátil e alerta de teste disparados!');
      }
      return res;
    }

    renderProfileControls() {
      const mount = document.getElementById('profilePwaAlertsSubMount');
      if (!mount) return;
      const notifOn = !!(this.prefs.notificationsEnabled && this.isNotificationSupported() && Notification.permission === 'granted');
      const hapOn = !!this.prefs.hapticsEnabled;
      mount.innerHTML = `
        <div style="margin-top:6px;padding-top:8px;border-top:1px dashed var(--hc-border);display:flex;flex-direction:column;gap:6px;">
          <div style="font-size:11.5px;color:var(--hc-text-2);">
            <strong>🔔 Central de Alertas &amp; Vibração:</strong> receba aviso se invadirem seu IP, lavagem terminar ou Escudo estiver acabando.
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button type="button" id="btnTogglePwaNotifications" class="hc-btn ${notifOn ? 'primary' : ''} sm" onclick="window.pwaAlertsEngine.toggleNotifications()">
              ${notifOn ? '🔔 Alertas: Ligados' : '🔕 Ativar Alertas'}
            </button>
            <button type="button" id="btnTogglePwaHaptics" class="hc-btn ${hapOn ? 'primary' : ''} sm" onclick="window.pwaAlertsEngine.toggleHaptics()">
              ${hapOn ? '📳 Vibração: Ligada' : '📴 Vibração: Off'}
            </button>
            <button type="button" id="btnTestPwaAlert" class="hc-btn ghost sm" onclick="window.pwaAlertsEngine.sendTestAlert()">
              🧪 Testar Pulso
            </button>
          </div>
        </div>
      `;
    }
  }

  window.pwaAlertsEngine = new PwaAlertsHapticsEngine();
  document.addEventListener('DOMContentLoaded', () => {
    if (window.pwaAlertsEngine) window.pwaAlertsEngine.renderProfileControls();
  });
})();
