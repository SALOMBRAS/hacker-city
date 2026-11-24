/**
 * ============================================================================
 * HACKER CITY — MÓDULO PWA INSTALÁVEL & TELA CHEIA MOBILE/DESKTOP
 * Captura beforeinstallprompt, guia instalação iOS/Android, alterna Tela Cheia
 * e processa atalhos diretos (?open=winBrowser / winTaskManager) após login.
 * ============================================================================
 */
(function () {
  'use strict';

  class PwaFullscreenHelper {
    constructor() {
      this.deferredPrompt = null;
      this.installed = false;
      this.bindEvents();
    }

    bindEvents() {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.renderProfileCard();
      });

      window.addEventListener('appinstalled', () => {
        this.installed = true;
        this.deferredPrompt = null;
        if (typeof window.showToast === 'function') {
          window.showToast('📲 Hacker City instalado na tela inicial com sucesso!');
        }
        this.renderProfileCard();
      });

      document.addEventListener('fullscreenchange', () => this.syncButtons());
      document.addEventListener('webkitfullscreenchange', () => this.syncButtons());
      document.addEventListener('DOMContentLoaded', () => {
        this.renderProfileCard();
        this.syncButtons();
      });
    }

    isStandalone() {
      if (this.installed) return true;
      try {
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
        if (window.navigator && window.navigator.standalone === true) return true;
      } catch (e) {}
      return false;
    }

    isFullscreen() {
      return !!(document.fullscreenElement || document.webkitFullscreenElement);
    }

    async toggleFullscreen() {
      try {
        if (this.isFullscreen()) {
          if (document.exitFullscreen) await document.exitFullscreen();
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
          if (typeof window.showToast === 'function') window.showToast('Janela restaurada do modo Tela Cheia.');
        } else {
          const el = document.documentElement;
          if (el.requestFullscreen) await el.requestFullscreen();
          else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
          else {
            this.openInstallGuideModal();
            return { success: false, reason: 'UNSUPPORTED' };
          }
          if (typeof window.showToast === 'function') window.showToast('⛶ Modo Tela Cheia ativado! Pressione ESC ou toque novamente para sair.');
        }
        this.syncButtons();
        return { success: true, fullscreen: this.isFullscreen() };
      } catch (err) {
        if (typeof window.showToast === 'function') {
          window.showToast('Seu navegador bloqueou Tela Cheia automática — use "Instalar App" para tela cheia nativa.');
        }
        return { success: false, reason: String(err && err.message || err) };
      }
    }

    async promptInstallApp() {
      if (this.isStandalone()) {
        if (typeof window.showToast === 'function') {
          window.showToast('📲 Hacker City já está rodando como Aplicativo instalado!');
        }
        return { outcome: 'already_standalone' };
      }
      if (this.deferredPrompt) {
        try {
          const p = this.deferredPrompt;
          p.prompt();
          if (p.userChoice && typeof p.userChoice.then === 'function') {
            p.userChoice.then((choice) => {
              if (choice && choice.outcome === 'accepted') this.deferredPrompt = null;
              this.renderProfileCard();
            }).catch(() => {});
          }
          return { outcome: 'native_prompt_shown' };
        } catch (e) {}
      }
      this.openInstallGuideModal();
      return { outcome: 'guide_opened' };
    }

    openInstallGuideModal() {
      let modal = document.getElementById('hcPwaInstallGuideModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'hcPwaInstallGuideModal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:26500;background:rgba(8,11,15,0.82);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:12px;';
        document.body.appendChild(modal);
      }
      const isIos = /iPad|iPhone|iPod/i.test(navigator.userAgent || '');
      modal.innerHTML = `
        <div style="width:min(420px, calc(100vw - 24px));max-height:calc(100dvh - 24px);overflow-y:auto;background:#131922;border:1px solid rgba(53,184,119,0.45);border-radius:12px;padding:16px;box-shadow:0 18px 48px rgba(0,0,0,0.65);color:var(--hc-text);">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px;">
            <strong style="font-size:15px;color:#fff;">📲 Jogar como App em Tela Cheia</strong>
            <button type="button" class="hc-btn ghost sm" onclick="window.pwaHelper.closeInstallGuideModal()">✕</button>
          </div>
          <p style="font-size:12.5px;color:var(--hc-text-2);line-height:1.45;margin:0 0 12px;">
            Instale o <strong>Hacker City</strong> na tela inicial do seu celular ou PC para ocultar a barra do navegador e abrir em 1 toque:
          </p>
          <div style="display:flex;flex-direction:column;gap:8px;font-size:12.5px;margin-bottom:14px;">
            <div style="background:var(--hc-inset);border:1px solid ${isIos ? 'rgba(53,184,119,0.5)' : 'var(--hc-border)'};border-radius:8px;padding:10px;">
              <strong style="color:var(--hc-accent-text);display:block;margin-bottom:3px;">🍎 No iPhone / iPad (Safari)</strong>
              <span>1. Toque no botão <strong>Compartilhar (⬆️)</strong> na barra do Safari.<br>2. Escolha <strong>"Adicionar à Tela de Início"</strong> e confirme.</span>
            </div>
            <div style="background:var(--hc-inset);border:1px solid ${!isIos ? 'rgba(53,184,119,0.5)' : 'var(--hc-border)'};border-radius:8px;padding:10px;">
              <strong style="color:#60a5fa;display:block;margin-bottom:3px;">🤖 No Android / Chrome / PC</strong>
              <span>1. Toque no menu <strong>⋮</strong> do navegador.<br>2. Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;">
            <button type="button" class="hc-btn sm" onclick="window.pwaHelper.toggleFullscreen(); window.pwaHelper.closeInstallGuideModal();">⛶ Ativar Tela Cheia</button>
            <button type="button" class="hc-btn primary sm" onclick="window.pwaHelper.closeInstallGuideModal()">Entendi</button>
          </div>
        </div>
      `;
      modal.style.display = 'flex';
    }

    closeInstallGuideModal() {
      const m = document.getElementById('hcPwaInstallGuideModal');
      if (m) m.style.display = 'none';
    }

    syncButtons() {
      const fsActive = this.isFullscreen();
      document.querySelectorAll('.js-pwa-fs-label').forEach((el) => {
        el.textContent = fsActive ? 'Sair da Tela Cheia' : 'Tela Cheia';
      });
      this.renderProfileCard();
    }

    renderProfileCard() {
      const mount = document.getElementById('profilePwaCardMount');
      if (!mount) return;
      const standalone = this.isStandalone();
      const fsActive = this.isFullscreen();
      const canNativePrompt = !!this.deferredPrompt;
      mount.innerHTML = `
        <div style="margin-top:0.85rem;padding:0.8rem;border-radius:8px;background:var(--hc-inset);border:1px solid var(--hc-border);display:flex;flex-direction:column;gap:0.55rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
            <strong style="font-size:0.82rem;color:#fff;">📲 Modo Aplicativo &amp; Tela Cheia</strong>
            <span class="hc-badge ${standalone ? 'success' : ''}" style="font-size:10.5px;">${standalone ? 'App Instalado' : (canNativePrompt ? 'Pronto p/ Instalar' : 'Web / Mobile')}</span>
          </div>
          <div style="font-size:0.76rem;color:var(--hc-text-2);line-height:1.4;">
            Jogue sem barras do navegador no celular ou computador e acesse seus processos em 1 toque.
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" id="btnProfileInstallPwa" class="hc-btn primary sm" onclick="window.pwaHelper.promptInstallApp()">
              📲 ${standalone ? 'App Ativo' : 'Instalar App'}
            </button>
            <button type="button" id="btnProfileToggleFs" class="hc-btn sm" onclick="window.pwaHelper.toggleFullscreen()">
              ⛶ <span class="js-pwa-fs-label">${fsActive ? 'Sair da Tela Cheia' : 'Tela Cheia'}</span>
            </button>
          </div>
        </div>
      `;
    }

    applyShortcutDeepLinkAfterLogin() {
      try {
        const params = new URLSearchParams(window.location.search || '');
        const openWin = params.get('open');
        if (openWin && typeof window.navTo === 'function') {
          if (!window.progressiveUnlockEngine || window.progressiveUnlockEngine.isUnlocked(openWin)) {
            setTimeout(() => window.navTo(openWin), 120);
          }
        }
      } catch (e) {}
    }
  }

  window.pwaHelper = new PwaFullscreenHelper();
})();
