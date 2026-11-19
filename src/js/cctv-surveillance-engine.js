/**
 * Hacker City // Motor de Invasão a Câmeras de Segurança Corporativas (NVR / CFTV Ao Vivo)
 *
 * Recursos:
 * - 6 Modelos Distintos de Vídeo 3D Real (.webm + .mp4 + poster .jpg):
 *   1) Data Center & Mainframe 42U (cam_01_datacenter)
 *   2) Cofre Blindado & Lasers de Segurança (cam_02_vault)
 *   3) Recepção Corporativa & Catracas Biométricas (cam_03_reception)
 *   4) Sala da Diretoria / CEO & Cofre de Parede à Noite (cam_04_exec_office)
 *   5) Doca Subterrânea & Galpão Logístico c/ AGV (cam_05_warehouse)
 *   6) Laboratório P&D Restrito / Sala Limpa (cam_06_biolab)
 * - Mosaico 4x Ao Vivo da Empresa Invadida + Câmera Focada HD + Galeria dos 6 Modelos
 * - Controles PTZ (Pan/Zoom), Lentes (Padrão / Visão Noturna IR / Térmica FLIR) e Detecção de Movimento
 * - Ações Reais de Missão: Gravar Prova (.mp4) no PC do Jogador e Injetar Sinal Falso em Loop (Bypass CFTV)
 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function hashIp(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  // 6 Modelos Reais de Vídeos CFTV renderizados em 3D
  const CCTV_VIDEO_MODELS = {
    datacenter: {
      modelKey: 'datacenter',
      slug: 'cam_01_datacenter',
      modelTitle: 'Modelo #1 · Corredor Data Center 42U',
      webm: 'assets/cctv/cam_01_datacenter.webm',
      mp4: 'assets/cctv/cam_01_datacenter.mp4',
      poster: 'assets/cctv/cam_01_datacenter.jpg',
      lensSpec: '18mm Wide · 15 FPS · H.265',
      defaultActivity: 'Técnico de TI inspecionando racks e mainframe ativo'
    },
    vault: {
      modelKey: 'vault',
      slug: 'cam_02_vault',
      modelTitle: 'Modelo #2 · Sala-Forte & Lasers do Cofre',
      webm: 'assets/cctv/cam_02_vault.webm',
      mp4: 'assets/cctv/cam_02_vault.mp4',
      poster: 'assets/cctv/cam_02_vault.jpg',
      lensSpec: '18mm Dome · 15 FPS · IR-Cut',
      defaultActivity: 'Vigilante noturno em ronda diante da grade de lasers'
    },
    reception: {
      modelKey: 'reception',
      slug: 'cam_03_reception',
      modelTitle: 'Modelo #3 · Recepção & Catracas Biométricas',
      webm: 'assets/cctv/cam_03_reception.webm',
      mp4: 'assets/cctv/cam_03_reception.mp4',
      poster: 'assets/cctv/cam_03_reception.jpg',
      lensSpec: '17mm Lobby · 15 FPS · WDR Color',
      defaultActivity: 'Fluxo de funcionários pelas catracas ópticas e balcão'
    },
    exec_office: {
      modelKey: 'exec_office',
      slug: 'cam_04_exec_office',
      modelTitle: 'Modelo #4 · Sala da Diretoria & Cofre Noturno',
      webm: 'assets/cctv/cam_04_exec_office.webm',
      mp4: 'assets/cctv/cam_04_exec_office.mp4',
      poster: 'assets/cctv/cam_04_exec_office.jpg',
      lensSpec: 'Pinhole 18mm · 15 FPS · Low-Light',
      defaultActivity: 'Diretor acessando teclado do cofre de parede fora do expediente'
    },
    warehouse: {
      modelKey: 'warehouse',
      slug: 'cam_05_warehouse',
      modelTitle: 'Modelo #5 · Doca Subterrânea & Galpão AGV',
      webm: 'assets/cctv/cam_05_warehouse.webm',
      mp4: 'assets/cctv/cam_05_warehouse.mp4',
      poster: 'assets/cctv/cam_05_warehouse.jpg',
      lensSpec: 'Bullet 17mm · 15 FPS · Industrial',
      defaultActivity: 'Empilhadeira autônoma AGV e operador movimentando cargas'
    },
    biolab: {
      modelKey: 'biolab',
      slug: 'cam_06_biolab',
      modelTitle: 'Modelo #6 · Laboratório Limpo P&D Restrito',
      webm: 'assets/cctv/cam_06_biolab.webm',
      mp4: 'assets/cctv/cam_06_biolab.mp4',
      poster: 'assets/cctv/cam_06_biolab.jpg',
      lensSpec: 'CleanRoom 17.5mm · 15 FPS · 4K Downscale',
      defaultActivity: 'Pesquisador monitorando câmara de contenção energética'
    }
  };

  // Perfis NVR das Empresas Fictícias do Jogo
  const COMPANY_NVR_PROFILES = {
    '203.17.88.40': {
      nvrSystem: 'HikNet Corporate NVR v4.2 // Farofa Systems S.A.',
      rtspPort: 554,
      cameras: [
        { code: 'CAM-01', room: 'Recepção & Catracas Térreo', zone: 'BLOCO A', modelKey: 'reception', secretIntel: 'Crachá mestre registrado às 18:42' },
        { code: 'CAM-02', room: 'Corredor Data Center B1', zone: 'SUBSOLO', modelKey: 'datacenter', secretIntel: 'Rack 04 conectado ao gateway interno' },
        { code: 'CAM-03', room: 'Sala da Diretoria Executiva', zone: '12º ANDAR', modelKey: 'exec_office', secretIntel: 'Diretor abrindo cofre oculto fora do expediente' },
        { code: 'CAM-04', room: 'Doca Subterrânea de Entregas', zone: 'GARAGEM G2', modelKey: 'warehouse', secretIntel: 'Remessa confidencial embarcada no AGV #02' }
      ]
    },
    '194.88.14.202': {
      nvrSystem: 'Axis BioGuard NVR v5.1 // Meridian BioLabs S.A.',
      rtspPort: 554,
      cameras: [
        { code: 'CAM-01', room: 'Laboratório Limpo P&D Nível 3', zone: 'ALA BIO', modelKey: 'biolab', secretIntel: 'Protótipo sintético ativo na câmara central' },
        { code: 'CAM-02', room: 'Cluster Genômico & Servidores', zone: 'ALA TI', modelKey: 'datacenter', secretIntel: 'Backup não criptografado rodando no nó 02' },
        { code: 'CAM-03', room: 'Gabinete do Diretor Científico', zone: 'COBERTURA', modelKey: 'exec_office', secretIntel: 'Fórmula trancada no cofre lateral' },
        { code: 'CAM-04', room: 'Cofre Criogênico Blindado', zone: 'SUBSOLO B3', modelKey: 'vault', secretIntel: 'Ronda armada a cada 40 segundos nos lasers' }
      ]
    },
    '58.40.12.9': {
      nvrSystem: 'Dahua CargoWatch DVR // Corvo Cinza Logística',
      rtspPort: 554,
      cameras: [
        { code: 'CAM-01', room: 'Doca Sul & Pátio de Contêineres', zone: 'GALPÃO 01', modelKey: 'warehouse', secretIntel: 'Carga sem nota fiscal movida pelo AGV amarelo' },
        { code: 'CAM-02', room: 'Portaria & Catracas de Motoristas', zone: 'ENTRADA', modelKey: 'reception', secretIntel: 'Visitante externo entrou sem biometria' },
        { code: 'CAM-03', room: 'Sala de Rastreamento & Racks', zone: 'MEZANINO', modelKey: 'datacenter', secretIntel: 'Servidor GPS das frotas ativo' },
        { code: 'CAM-04', room: 'Gaiola Blindada de Alto Valor', zone: 'COFRE SUL', modelKey: 'vault', secretIntel: 'Sensores laser calibrados na porta circular' }
      ]
    },
    '189.40.7.12': {
      nvrSystem: 'KronoVision Sentinel NVR // KronoTech Sistemas',
      rtspPort: 554,
      cameras: [
        { code: 'CAM-01', room: 'Data Center Principal KronoCloud', zone: 'TORRE B1', modelKey: 'datacenter', secretIntel: 'Chaves de API espelhadas no terminal central' },
        { code: 'CAM-02', room: 'Sala Limpa de Litografia de Chips', zone: 'LAB P&D', modelKey: 'biolab', secretIntel: 'Wafer quântico em teste na contenção' },
        { code: 'CAM-03', room: 'Suíte da Presidência (CEO)', zone: '28º ANDAR', modelKey: 'exec_office', secretIntel: 'Acesso noturno ao cofre de contratos' },
        { code: 'CAM-04', room: 'Cofre de Propriedade Intelectual', zone: 'BUNKER', modelKey: 'vault', secretIntel: 'Quatro feixes laser ativos diante da porta' }
      ]
    },
    '77.3.9.21': {
      nvrSystem: 'VaultEye Financial CCTV // Banco Colchão & Clearing',
      rtspPort: 554,
      cameras: [
        { code: 'CAM-01', room: 'Porta do Cofre Central & Lasers', zone: 'SUBSOLO FORTE', modelKey: 'vault', secretIntel: 'Guarda noturno patrulhando a escotilha dourada' },
        { code: 'CAM-02', room: 'Átrio Bancário & Catracas VIP', zone: 'TÉRREO', modelKey: 'reception', secretIntel: 'Movimentação executiva no hall principal' },
        { code: 'CAM-03', room: 'Mainframe Interbancário SWIFT', zone: 'COFRE TI', modelKey: 'datacenter', secretIntel: 'Racks de liquidação operando em carga máxima' },
        { code: 'CAM-04', room: 'Diretoria de Câmbio & Compliance', zone: '10º ANDAR', modelKey: 'exec_office', secretIntel: 'Cofre secundário aberto pelo diretor' }
      ]
    },
    '172.66.40.18': {
      nvrSystem: 'Aegis Matrix 6-CH NVR // Aegis Security Corp (Central 6 Modelos)',
      rtspPort: 554,
      cameras: [
        { code: 'CAM-01', room: 'Corredor Mainframe 42U', zone: 'SETOR 01', modelKey: 'datacenter', secretIntel: 'Monitoramento central NVR' },
        { code: 'CAM-02', room: 'Cofre Principal c/ Lasers', zone: 'SETOR 02', modelKey: 'vault', secretIntel: 'Barreira óptica ativa' },
        { code: 'CAM-03', room: 'Recepção & Catracas', zone: 'SETOR 03', modelKey: 'reception', secretIntel: 'Controle de acesso térreo' },
        { code: 'CAM-04', room: 'Sala da Diretoria à Noite', zone: 'SETOR 04', modelKey: 'exec_office', secretIntel: 'Cofre executivo monitorado' },
        { code: 'CAM-05', room: 'Doca Logística & AGV', zone: 'SETOR 05', modelKey: 'warehouse', secretIntel: 'Pátio subterrâneo' },
        { code: 'CAM-06', room: 'Laboratório Limpo P&D', zone: 'SETOR 06', modelKey: 'biolab', secretIntel: 'Contenção especial' }
      ]
    }
  };

  class CctvSurveillanceEngine {
    constructor() {
      this.userId = null;
      this.state = null;
      this.viewMode = 'mosaic';       // 'mosaic' | 'single' | 'all_models'
      this.selectedCamIdx = 0;
      this.opticalFilter = 'normal';  // 'normal' | 'ir' | 'thermal'
      this.motionHud = true;
      this.zoomLevel = 1.0;
      this.panX = 0;
      this.panY = 0;
      this._clockTimer = null;
      this.startLiveOsdTicker();
    }

    storageKey(uid) {
      return `HC_CCTV_STATE_${uid || 'guest'}`;
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

      this.state = saved && typeof saved === 'object'
        ? {
            capturedClips: Array.isArray(saved.capturedClips) ? saved.capturedClips : [],
            loopedCameras: saved.loopedCameras && typeof saved.loopedCameras === 'object' ? saved.loopedCameras : {}
          }
        : {
            capturedClips: [],
            loopedCameras: {} // { '203.17.88.40::CAM-03': timestamp }
          };
      return this.state;
    }

    save() {
      if (!this.state) return;
      try {
        localStorage.setItem(this.storageKey(this.userId), JSON.stringify(this.state));
      } catch (e) {}
    }

    getVideoModelsCatalog() {
      return CCTV_VIDEO_MODELS;
    }

    hostSupportsCctv(host) {
      if (!host) return false;
      if (COMPANY_NVR_PROFILES[host.ip]) return true;
      return ['empresa', 'banco', 'btc_market', 'darknet', 'federal', 'fbi_mainframe'].includes(host.kind);
    }

    getCompanyNvrProfile(ip, hostname = 'Corporação Alvo') {
      if (COMPANY_NVR_PROFILES[ip]) return COMPANY_NVR_PROFILES[ip];

      const modelKeys = Object.keys(CCTV_VIDEO_MODELS);
      const roomLabels = {
        datacenter: ['Sala de Servidores TI', 'SUBSOLO'],
        vault: ['Sala-Forte & Cofre Interno', 'COFRE B2'],
        reception: ['Recepção & Catracas de Acesso', 'TÉRREO'],
        exec_office: ['Sala da Diretoria Executiva', 'COBERTURA'],
        warehouse: ['Doca Subterrânea & Estoque', 'GALPÃO G1'],
        biolab: ['Laboratório Restrito P&D', 'ALA NORTE']
      };
      const seed = hashIp(String(ip || '0.0.0.0'));
      const cams = [];
      for (let i = 0; i < 4; i++) {
        const mk = modelKeys[(seed + i) % modelKeys.length];
        const [room, zone] = roomLabels[mk];
        cams.push({
          code: `CAM-0${i + 1}`,
          room,
          zone,
          modelKey: mk,
          secretIntel: `Feed RTSP ativo em ${hostname}`
        });
      }
      return {
        nvrSystem: `Sentinel Corporate NVR v3.8 // ${hostname}`,
        rtspPort: 554,
        cameras: cams
      };
    }

    isCameraLooped(ip, camCode) {
      this.ensureLoaded();
      return !!this.state.loopedCameras[`${ip}::${camCode}`];
    }

    hasCapturedCamera(ip, camCode) {
      this.ensureLoaded();
      return this.state.capturedClips.some((c) => c.ip === ip && (!camCode || c.camCode === camCode));
    }

    resetPtz() {
      this.zoomLevel = 1.0;
      this.panX = 0;
      this.panY = 0;
    }

    openCameraFocus(camIdx) {
      this.selectedCamIdx = Number(camIdx) || 0;
      this.viewMode = 'single';
      this.resetPtz();
      if (window.internetEngine) window.internetEngine.render();
      this.syncReducedMotionPreference();
    }

    setViewMode(mode) {
      this.viewMode = mode || 'mosaic';
      this.resetPtz();
      if (window.internetEngine) window.internetEngine.render();
      this.syncReducedMotionPreference();
    }

    setOpticalFilter(filterName) {
      this.opticalFilter = filterName || 'normal';
      if (window.internetEngine) window.internetEngine.render();
    }

    toggleMotionHud() {
      this.motionHud = !this.motionHud;
      if (window.internetEngine) window.internetEngine.render();
    }

    adjustPtz(dx, dy, dz) {
      this.zoomLevel = Math.max(1.0, Math.min(2.2, +(this.zoomLevel + dz).toFixed(2)));
      if (this.zoomLevel <= 1.02) {
        this.panX = 0;
        this.panY = 0;
      } else {
        this.panX = Math.max(-18, Math.min(18, this.panX + dx));
        this.panY = Math.max(-14, Math.min(14, this.panY + dy));
      }
      const vid = document.getElementById('cctvPrimaryVideo');
      if (vid) {
        vid.style.transform = `scale(${this.zoomLevel}) translate(${this.panX}%, ${this.panY}%)`;
      }
      const zLbl = document.getElementById('cctvZoomLabel');
      if (zLbl) zLbl.textContent = `${this.zoomLevel.toFixed(1)}x`;
    }

    // Ação Hacker #1: Gravar prova ao vivo (.mp4) da câmera invadida para o PC do jogador
    captureCameraEvidence(ip, camCode) {
      this.ensureLoaded();
      const host = window.internetEngine ? window.internetEngine.resolveHost(ip) : null;
      const profile = this.getCompanyNvrProfile(ip, host ? host.hostname : ip);
      const cam = profile.cameras.find((c) => c.code === camCode) || profile.cameras[0];
      if (!cam) return { success: false };

      const clipFile = `CFTV_${ip.replace(/\./g, '_')}_${cam.code}.mp4`;
      const recEntry = {
        ip,
        hostname: host ? host.hostname : ip,
        camCode: cam.code,
        room: cam.room,
        modelKey: cam.modelKey,
        clipFile,
        at: new Date().toLocaleTimeString('pt-BR')
      };

      this.state.capturedClips = [
        recEntry,
        ...this.state.capturedClips.filter((x) => !(x.ip === ip && x.camCode === cam.code))
      ].slice(0, 30);
      this.save();

      // Registra rastro forense no /var/log/syslog do alvo!
      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      if (window.internetEngine) {
        window.internetEngine.appendServerLog(
          ip,
          `${myIp} RTSP/554 exported live surveillance stream /var/nvr/${cam.code}_${cam.modelKey}.mp4`
        );
      }

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('CCTV-REC', `Gravação ao vivo capturada de ${ip} (${cam.code} · ${cam.room}) -> ${clipFile}`, 'success');
      }
      if (window.hackerAudio) window.hackerAudio.playKeyClick();

      // Notifica motor de missões caso seja o objetivo do contrato!
      if (window.missionsEngine && typeof window.missionsEngine.notifyCctvAction === 'function') {
        window.missionsEngine.notifyCctvAction(ip, cam.code, 'capture');
      }
      if (window.onlineEngine && typeof window.onlineEngine.saveLocalSnapshotImmediate === 'function') {
        window.onlineEngine.saveLocalSnapshotImmediate();
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`📹 Gravação ${clipFile} salva no seu PC! (Lembre-se de limpar seu IP na aba Logs)`);
      }
      if (window.internetEngine) window.internetEngine.render();
      return { success: true, clipFile };
    }

    // Ação Hacker #2: Injetar Loop Fantasma na câmera para cegar a segurança da empresa
    injectCameraLoop(ip, camCode) {
      this.ensureLoaded();
      const host = window.internetEngine ? window.internetEngine.resolveHost(ip) : null;
      const profile = this.getCompanyNvrProfile(ip, host ? host.hostname : ip);
      const cam = profile.cameras.find((c) => c.code === camCode) || profile.cameras[0];
      if (!cam) return { success: false };

      const key = `${ip}::${cam.code}`;
      this.state.loopedCameras[key] = Date.now();
      this.save();

      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      if (window.internetEngine) {
        window.internetEngine.appendServerLog(
          ip,
          `${myIp} RTSP/554 hijacked camera feed ${cam.code} (${cam.room}) [GHOST_LOOP_INJECTED]`
        );
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('CCTV-LOOP', `Loop fantasma injetado em ${ip} // ${cam.code} (${cam.room})`, 'info');
      }
      if (window.hackerAudio) window.hackerAudio.playCashChime();

      if (window.missionsEngine && typeof window.missionsEngine.notifyCctvAction === 'function') {
        window.missionsEngine.notifyCctvAction(ip, cam.code, 'loop');
      }
      if (window.onlineEngine && typeof window.onlineEngine.saveLocalSnapshotImmediate === 'function') {
        window.onlineEngine.saveLocalSnapshotImmediate();
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`🔁 Loop Falso ativo em ${cam.code} (${cam.room})! Segurança da empresa cegada.`);
      }
      if (window.internetEngine) window.internetEngine.render();
      return { success: true };
    }

    syncReducedMotionPreference() {
      if (typeof window === 'undefined' || !window.matchMedia) return;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReduced) return;
      document.querySelectorAll('.cctv-video-el').forEach((v) => {
        v.removeAttribute('autoplay');
        try { v.pause(); } catch (e) {}
      });
    }

    startLiveOsdTicker() {
      if (typeof window === 'undefined') return;
      if (this._clockTimer) clearInterval(this._clockTimer);
      this._clockTimer = setInterval(() => {
        const stamps = document.querySelectorAll('.cctv-live-clock');
        if (!stamps.length) return;
        const nowStr = new Date().toLocaleTimeString('pt-BR', { hour12: false });
        stamps.forEach((el) => { el.textContent = nowStr; });
      }, 1000);
    }

    renderRemoteCctvPanelHtml(host) {
      this.ensureLoaded();
      const ic = (n) => (window.HC && window.HC.icon ? window.HC.icon(n) : '');
      const profile = this.getCompanyNvrProfile(host.ip, host.hostname);
      const cams = profile.cameras;
      if (this.selectedCamIdx >= cams.length) this.selectedCamIdx = 0;

      const activeMsn = (window.missionsEngine && window.missionsEngine.ensureLoaded().activeMission) || null;
      const msnOnThisHost = activeMsn && activeMsn.type === 'cctv_hack' && activeMsn.targetIp === host.ip ? activeMsn : null;
      const nowStr = new Date().toLocaleTimeString('pt-BR', { hour12: false });

      const missionHintBanner = msnOnThisHost ? `
        <div id="cctvMissionTargetBanner" class="hc-card" style="padding:10px 14px;border-color:rgba(240,160,58,0.55);background:rgba(240,160,58,0.11);display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:12.5px;">
          <div>
            <strong style="color:#ffd28a;">🎯 Alvo da Missão Ativa (${esc(msnOnThisHost.hirer)}):</strong>
            <span style="color:var(--hc-text);margin-left:6px;">
              Abra <strong>${esc(msnOnThisHost.camCode)} (${esc(msnOnThisHost.camRoom)})</strong> e execute
              <strong>${msnOnThisHost.cctvObjective === 'loop' ? 'Injetar Loop Falso (Bypass)' : 'Gravar Prova (.mp4)'}</strong>!
            </span>
          </div>
          <button type="button" id="btnJumpMissionCam" class="hc-btn primary sm"
            onclick="window.cctvEngine.openCameraFocus(${Math.max(0, cams.findIndex((c) => c.code === msnOnThisHost.camCode))})">
            Focar ${esc(msnOnThisHost.camCode)} →
          </button>
        </div>
      ` : '';

      let mainStageHtml = '';

      // MODO 3: GALERIA COMPLETA DOS 6 MODELOS DE VÍDEO DE CÂMERAS CORPORATIVAS
      if (this.viewMode === 'all_models') {
        const allModels = Object.values(CCTV_VIDEO_MODELS);
        const cardsHtml = allModels.map((mdl, idx) => `
          <div class="cctv-cam-tile cctv-filter-${esc(this.opticalFilter)}" tabindex="0"
            aria-label="${esc(mdl.modelTitle)}">
            <div class="cctv-viewport" style="border:none;border-radius:0;">
              <video class="cctv-video-el" autoplay loop muted playsinline preload="metadata"
                width="640" height="360" poster="${esc(mdl.poster)}">
                <source src="${esc(mdl.webm)}" type="video/webm">
                <source src="${esc(mdl.mp4)}" type="video/mp4">
              </video>
              <div class="cctv-scanline-layer"></div>
              <div class="cctv-osd-top">
                <span class="cctv-osd-chip"><span class="cctv-rec-dot"></span> MOD-0${idx + 1} · ${esc(mdl.modelTitle.split('·')[1]?.trim() || mdl.modelTitle)}</span>
                <span class="cctv-osd-chip cctv-live-clock">${esc(nowStr)}</span>
              </div>
              <div class="cctv-osd-bottom">
                <span class="cctv-osd-chip">${esc(mdl.lensSpec)}</span>
                <span class="cctv-osd-chip" style="max-width:48%;">${esc(mdl.defaultActivity)}</span>
              </div>
            </div>
          </div>
        `).join('');

        mainStageHtml = `
          <div class="cctv-mosaic-grid cols-3" id="cctvAllModelsGrid">
            ${cardsHtml}
          </div>
        `;
      }
      // MODO 1: MOSAICO AO VIVO DA EMPRESA INVADIDA (4x ou 6x CÂMERAS SIMULTÂNEAS)
      else if (this.viewMode === 'mosaic') {
        const tilesHtml = cams.map((cam, idx) => {
          const mdl = CCTV_VIDEO_MODELS[cam.modelKey] || CCTV_VIDEO_MODELS.datacenter;
          const looped = this.isCameraLooped(host.ip, cam.code);
          const captured = this.hasCapturedCamera(host.ip, cam.code);
          const isTargetCam = !!(msnOnThisHost && msnOnThisHost.camCode === cam.code);

          return `
            <div id="cctvTile_${esc(cam.code)}" class="cctv-cam-tile cctv-filter-${esc(this.opticalFilter)} ${isTargetCam ? 'is-mission-target' : ''} ${looped ? 'is-looped' : ''}"
              tabindex="0" role="button" aria-label="Abrir ${esc(cam.code)} ${esc(cam.room)} em tela cheia"
              onclick="window.cctvEngine.openCameraFocus(${idx})"
              onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window.cctvEngine.openCameraFocus(${idx});}">
              <div class="cctv-viewport" style="border:none;border-radius:0;">
                <video class="cctv-video-el" autoplay loop muted playsinline preload="metadata"
                  width="640" height="360" poster="${esc(mdl.poster)}">
                  <source src="${esc(mdl.webm)}" type="video/webm">
                  <source src="${esc(mdl.mp4)}" type="video/mp4">
                </video>
                <div class="cctv-scanline-layer"></div>
                ${this.motionHud ? `<div class="cctv-motion-box"><span class="cctv-motion-label">MOVIMENTO · ${esc(cam.zone)}</span></div>` : ''}
                ${looped ? `<div class="cctv-loop-stamp">🔁 SINAL EM LOOP FALSO (SEGURANÇA CEGADA)</div>` : ''}
                <div class="cctv-osd-top">
                  <span class="cctv-osd-chip">
                    <span class="cctv-rec-dot"></span>
                    <strong>${esc(cam.code)}</strong> · ${esc(cam.room)}
                    ${isTargetCam ? '<span class="hc-badge warn" style="margin-left:4px;">ALVO MISSÃO</span>' : ''}
                  </span>
                  <span class="cctv-osd-chip cctv-live-clock">${esc(nowStr)}</span>
                </div>
                <div class="cctv-osd-bottom">
                  <span class="cctv-osd-chip">${captured ? '✓ Gravação Salva' : 'Clique p/ Abrir Controles & Gravar'}</span>
                  <span class="cctv-osd-chip">${esc(mdl.lensSpec)}</span>
                </div>
              </div>
            </div>
          `;
        }).join('');

        mainStageHtml = `
          <div class="cctv-mosaic-grid ${cams.length >= 6 ? 'cols-3' : ''}" id="cctvCompanyMosaicGrid">
            ${tilesHtml}
          </div>
        `;
      }
      // MODO 2: CÂMERA INDIVIDUAL EM ALTA DEFINIÇÃO + PAINEL PTZ & INVASÃO
      else {
        const cam = cams[this.selectedCamIdx] || cams[0];
        const mdl = CCTV_VIDEO_MODELS[cam.modelKey] || CCTV_VIDEO_MODELS.datacenter;
        const looped = this.isCameraLooped(host.ip, cam.code);
        const captured = this.hasCapturedCamera(host.ip, cam.code);

        const camButtonsHtml = cams.map((c, idx) => {
          const isTarget = !!(msnOnThisHost && msnOnThisHost.camCode === c.code);
          const cLooped = this.isCameraLooped(host.ip, c.code);
          const cCap = this.hasCapturedCamera(host.ip, c.code);
          return `
            <button type="button" id="btnSelectCam_${esc(c.code)}" class="cctv-cam-sel-btn ${idx === this.selectedCamIdx ? 'active' : ''}"
              onclick="window.cctvEngine.openCameraFocus(${idx})">
              <span>
                <strong class="mono">${esc(c.code)}</strong> · ${esc(c.room)}
                ${isTarget ? '<span class="hc-badge warn" style="margin-left:4px;">Missão</span>' : ''}
              </span>
              <span class="mono" style="font-size:10.5px;color:var(--hc-accent-text);">${cLooped ? 'LOOP' : (cCap ? 'REC✓' : 'LIVE')}</span>
            </button>
          `;
        }).join('');

        mainStageHtml = `
          <div class="cctv-single-layout" id="cctvSingleInspector">
            <div class="cctv-viewport cctv-filter-${esc(this.opticalFilter)}">
              <video id="cctvPrimaryVideo" class="cctv-video-el" autoplay loop muted playsinline preload="auto"
                width="640" height="360" poster="${esc(mdl.poster)}"
                style="transform: scale(${this.zoomLevel}) translate(${this.panX}%, ${this.panY}%);">
                <source src="${esc(mdl.webm)}" type="video/webm">
                <source src="${esc(mdl.mp4)}" type="video/mp4">
              </video>
              <div class="cctv-scanline-layer"></div>
              ${this.motionHud ? `<div class="cctv-motion-box"><span class="cctv-motion-label">ALVO EM MOVIMENTO · ${esc(cam.zone)}</span></div>` : ''}
              ${looped ? `<div class="cctv-loop-stamp">🔁 LOOP FANTASMA ATIVO — MONITORAMENTO LOCAL ENGANADO</div>` : ''}

              <div class="cctv-osd-top">
                <span class="cctv-osd-chip">
                  <span class="cctv-rec-dot"></span>
                  <strong>${esc(host.hostname)}</strong> // ${esc(cam.code)} — ${esc(cam.room)}
                </span>
                <span class="cctv-osd-chip cctv-live-clock">${esc(nowStr)}</span>
              </div>

              <div class="cctv-osd-bottom">
                <span class="cctv-osd-chip">Intel Visual: ${esc(cam.secretIntel)}</span>
                <span class="cctv-osd-chip">Zoom <strong id="cctvZoomLabel">${this.zoomLevel.toFixed(1)}x</strong> · ${esc(mdl.lensSpec)}</span>
              </div>
            </div>

            <aside class="cctv-control-deck" aria-label="Controles NVR e Ações de Invasão">
              <div>
                <div class="hc-eyebrow" style="margin-bottom:6px;">Canais de Câmera (${cams.length})</div>
                <div class="cctv-cam-selector-list">
                  ${camButtonsHtml}
                </div>
              </div>

              <div style="border-top:1px solid var(--hc-border);padding-top:10px;">
                <div class="hc-eyebrow" style="margin-bottom:6px;">Controle PTZ (Pan &amp; Zoom Óptico)</div>
                <div class="cctv-ptz-pad">
                  <button type="button" class="cctv-ptz-btn" onclick="window.cctvEngine.adjustPtz(6, 0, 0)">◀ Pan</button>
                  <button type="button" class="cctv-ptz-btn" onclick="window.cctvEngine.adjustPtz(0, 5, 0)">▲ Tilt</button>
                  <button type="button" class="cctv-ptz-btn" onclick="window.cctvEngine.adjustPtz(-6, 0, 0)">Pan ▶</button>
                  <button type="button" class="cctv-ptz-btn" onclick="window.cctvEngine.adjustPtz(0, 0, 0.4)">＋ Zoom</button>
                  <button type="button" class="cctv-ptz-btn" onclick="window.cctvEngine.adjustPtz(0, -5, 0)">▼ Tilt</button>
                  <button type="button" class="cctv-ptz-btn" onclick="window.cctvEngine.adjustPtz(0, 0, -0.4)">－ Zoom</button>
                </div>
              </div>

              <div style="border-top:1px solid var(--hc-border);padding-top:10px;display:flex;flex-direction:column;gap:7px;">
                <div class="hc-eyebrow">Ações na Câmera Invadida</div>
                <button type="button" id="btnCaptureCctvEvidence" class="hc-btn primary sm block"
                  onclick="window.cctvEngine.captureCameraEvidence('${esc(host.ip)}', '${esc(cam.code)}')">
                  ${ic('camera')} ${captured ? 'Regravar Prova (.mp4) ✓' : `Gravar Prova Ao Vivo (${esc(cam.code)})`}
                </button>
                <button type="button" id="btnInjectCctvLoop" class="hc-btn ${looped ? 'ghost' : ''} sm block"
                  style="${looped ? 'border-color:var(--hc-accent);color:var(--hc-accent-text);' : 'border-color:var(--hc-warning);color:#ffd28a;'}"
                  onclick="window.cctvEngine.injectCameraLoop('${esc(host.ip)}', '${esc(cam.code)}')">
                  ${ic('video')} ${looped ? 'Loop Fantasma Ativo ✓' : `Injetar Loop Falso (${esc(cam.code)})`}
                </button>
                <button type="button" class="hc-btn ghost sm block" onclick="window.cctvEngine.setViewMode('mosaic')">
                  ← Voltar ao Mosaico 4x
                </button>
              </div>
            </aside>
          </div>
        `;
      }

      return `
        <div class="cctv-nvr-shell" id="cctvLiveConsoleRoot">
          ${missionHintBanner}

          <div class="cctv-top-bar">
            <div class="cctv-brand-block">
              <span class="cctv-live-pill"><span class="cctv-rec-dot"></span> AO VIVO · RTSP:${profile.rtspPort}</span>
              <strong style="font-size:13px;color:var(--hc-text);">${esc(profile.nvrSystem)}</strong>
            </div>

            <div class="cctv-mode-pills">
              <button type="button" id="btnCctvModeMosaic" class="cctv-pill-btn ${this.viewMode === 'mosaic' ? 'active' : ''}"
                onclick="window.cctvEngine.setViewMode('mosaic')">
                ${ic('layout-grid')} Mosaico Ao Vivo (${cams.length}x)
              </button>
              <button type="button" id="btnCctvModeSingle" class="cctv-pill-btn ${this.viewMode === 'single' ? 'active' : ''}"
                onclick="window.cctvEngine.setViewMode('single')">
                ${ic('video')} Câmera HD + Ações
              </button>
              <button type="button" id="btnCctvModeAll6" class="cctv-pill-btn ${this.viewMode === 'all_models' ? 'active' : ''}"
                onclick="window.cctvEngine.setViewMode('all_models')">
                ${ic('camera')} 6 Modelos CFTV
              </button>
              <span style="width:1px;height:18px;background:var(--hc-border);margin:0 2px;"></span>
              <button type="button" id="btnCctvFilterNormal" class="cctv-pill-btn ${this.opticalFilter === 'normal' ? 'active' : ''}"
                onclick="window.cctvEngine.setOpticalFilter('normal')">Cor</button>
              <button type="button" id="btnCctvFilterIr" class="cctv-pill-btn ${this.opticalFilter === 'ir' ? 'active' : ''}"
                onclick="window.cctvEngine.setOpticalFilter('ir')">Noturna IR</button>
              <button type="button" id="btnCctvFilterThermal" class="cctv-pill-btn ${this.opticalFilter === 'thermal' ? 'active' : ''}"
                onclick="window.cctvEngine.setOpticalFilter('thermal')">Térmica</button>
            </div>
          </div>

          ${mainStageHtml}
        </div>
      `;
    }
  }

  window.CCTV_VIDEO_MODELS = CCTV_VIDEO_MODELS;
  window.cctvEngine = new CctvSurveillanceEngine();
})();
