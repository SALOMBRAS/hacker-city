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
  }

  window.pwaAlertsEngine = new PwaAlertsHapticsEngine();
})();
