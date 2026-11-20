/**
 * Hacker City // Motor de Invasão a Câmeras de Segurança Corporativas (NVR / CFTV Ao Vivo & Arquivo DVR)
 *
 * Recursos:
 * - 6 Modelos Distintos de Vídeo 3D Real (.webm + .mp4 + poster .jpg):
 *   1) Data Center & Mainframe 42U (cam_01_datacenter)
 *   2) Cofre Blindado & Lasers de Segurança (cam_02_vault)
 *   3) Recepção Corporativa & Catracas Biométricas (cam_03_reception)
 *   4) Sala da Diretoria / CEO & Cofre de Parede à Noite (cam_04_exec_office)
 *   5) Doca Subterrânea & Galpão Logístico c/ AGV (cam_05_warehouse)
 *   6) Laboratório P&D Restrito / Sala Limpa (cam_06_biolab)
 * - Operações Reais de Invasão CFTV:
 *   a) DESATIVAR CÂMERAS DA EMPRESA (individual ou apagão total do circuito CFTV para ajudar um roubo!)
 *   b) APAGAR GRAVAÇÕES DO DVR DA EMPRESA (excluir vídeo comprometedor específico ou formatar o HD do DVR!)
 *   c) INJETAR LOOP FALSO (sinal fantasma) ou BAIXAR GRAVAÇÃO (.mp4)
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

  // Perfis NVR e Gravações Arquivadas no DVR das Empresas Fictícias
  const COMPANY_NVR_PROFILES = {
    '203.17.88.40': {
      nvrSystem: 'HikNet Corporate NVR v4.2 // Farofa Systems S.A.',
      rtspPort: 554,
      cameras: [
        { code: 'CAM-01', room: 'Recepção & Catracas Térreo', zone: 'BLOCO A', modelKey: 'reception', secretIntel: 'Crachá mestre registrado às 18:42' },
        { code: 'CAM-02', room: 'Corredor Data Center B1', zone: 'SUBSOLO', modelKey: 'datacenter', secretIntel: 'Rack 04 conectado ao gateway interno' },
        { code: 'CAM-03', room: 'Sala da Diretoria Executiva', zone: '12º ANDAR', modelKey: 'exec_office', secretIntel: 'Diretor abrindo cofre oculto fora do expediente' },
        { code: 'CAM-04', room: 'Doca Subterrânea de Entregas', zone: 'GARAGEM G2', modelKey: 'warehouse', secretIntel: 'Remessa confidencial embarcada no AGV #02' }
      ],
      recordings: [
        { fileName: 'DVR_CAM01_Recepcao_22h14.mp4', camCode: 'CAM-01', modelKey: 'reception', stamp: '22:14', sizeMb: 184, desc: 'Entrada noturna pela catraca principal sem crachá' },
        { fileName: 'DVR_CAM02_DataCenter_01h08.mp4', camCode: 'CAM-02', modelKey: 'datacenter', stamp: '01:08', sizeMb: 210, desc: 'Acesso físico direto ao rack 04 no subsolo' },
        { fileName: 'DVR_CAM03_Cofre_Diretoria_23h50.mp4', camCode: 'CAM-03', modelKey: 'exec_office', stamp: '23:50', sizeMb: 245, desc: 'Abertura manual do cofre de parede da diretoria' },
        { fileName: 'DVR_CAM04_Doca_Furgao_02h35.mp4', camCode: 'CAM-04', modelKey: 'warehouse', stamp: '02:35', sizeMb: 290, desc: 'Retirada de caixas na doca subterrânea' }
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
      ],
      recordings: [
        { fileName: 'DVR_CAM01_Invasao_Lab_03h12.mp4', camCode: 'CAM-01', modelKey: 'biolab', stamp: '03:12', sizeMb: 264, desc: 'Rosto de invasor sem máscara gravado na câmara limpa!' },
        { fileName: 'DVR_CAM02_Servidores_Bio_01h20.mp4', camCode: 'CAM-02', modelKey: 'datacenter', stamp: '01:20', sizeMb: 175, desc: 'Conexão de pendrive externo no cluster genômico' },
        { fileName: 'DVR_CAM03_Diretoria_Bio_21h45.mp4', camCode: 'CAM-03', modelKey: 'exec_office', stamp: '21:45', sizeMb: 198, desc: 'Reunião sigilosa fora do expediente no gabinete' },
        { fileName: 'DVR_CAM04_Cofre_Amostras_04h02.mp4', camCode: 'CAM-04', modelKey: 'vault', stamp: '04:02', sizeMb: 320, desc: 'Ronda armada e disparo de feixe laser no subsolo B3' }
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
      ],
      recordings: [
        { fileName: 'DVR_CAM01_Placa_Caminhao_02h19.mp4', camCode: 'CAM-01', modelKey: 'warehouse', stamp: '02:19', sizeMb: 310, desc: 'Placa de furgão clandestino filmada ao lado do AGV' },
        { fileName: 'DVR_CAM02_Portaria_Sul_00h44.mp4', camCode: 'CAM-02', modelKey: 'reception', stamp: '00:44', sizeMb: 160, desc: ' Passagem da equipe pela catraca lateral' },
        { fileName: 'DVR_CAM03_Racks_GPS_01h55.mp4', camCode: 'CAM-03', modelKey: 'datacenter', stamp: '01:55', sizeMb: 192, desc: 'Desligamento manual de rastreador no mezanino' },
        { fileName: 'DVR_CAM04_Cofre_Carga_03h05.mp4', camCode: 'CAM-04', modelKey: 'vault', stamp: '03:05', sizeMb: 280, desc: 'Movimentação próxima à porta circular blindada' }
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
      ],
      recordings: [
        { fileName: 'DVR_CAM01_Assalto_Subsolo_02h40.mp4', camCode: 'CAM-01', modelKey: 'datacenter', stamp: '02:40', sizeMb: 275, desc: 'Equipe copiando discos direto dos racks B1' },
        { fileName: 'DVR_CAM02_Litografia_02h52.mp4', camCode: 'CAM-02', modelKey: 'biolab', stamp: '02:52', sizeMb: 230, desc: 'Extração do protótipo de chip na sala limpa' },
        { fileName: 'DVR_CAM03_CEO_Cofre_03h01.mp4', camCode: 'CAM-03', modelKey: 'exec_office', stamp: '03:01', sizeMb: 205, desc: ' Digitação de senha no cofre do 28º andar' },
        { fileName: 'DVR_CAM04_Bunker_Lasers_03h15.mp4', camCode: 'CAM-04', modelKey: 'vault', stamp: '03:15', sizeMb: 340, desc: 'Fuga registrada pelos sensores da sala-forte' }
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
      this.viewMode = 'mosaic';       // 'mosaic' | 'single' | 'recordings' | 'all_models'
      this.selectedCamIdx = 0;
      this.previewRecFile = null;
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
            loopedCameras: saved.loopedCameras && typeof saved.loopedCameras === 'object' ? saved.loopedCameras : {},
            disabledCameras: saved.disabledCameras && typeof saved.disabledCameras === 'object' ? saved.disabledCameras : {},
            deletedRecordings: saved.deletedRecordings && typeof saved.deletedRecordings === 'object' ? saved.deletedRecordings : {}
          }
        : {
            capturedClips: [],
            loopedCameras: {},
            disabledCameras: {},   // { '203.17.88.40::CAM-01': timestamp }
            deletedRecordings: {}  // { '194.88.14.202::DVR_CAM01_Invasao_Lab_03h12.mp4': timestamp }
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

    // Lista as gravações salvas no HD do DVR da empresa (filtrando as que o jogador já apagou!)
    getCompanyDvrRecordings(ip, hostname = 'Corporação Alvo') {
      this.ensureLoaded();
      const profile = this.getCompanyNvrProfile(ip, hostname);
      const baseList = Array.isArray(profile.recordings)
        ? profile.recordings
        : profile.cameras.map((c, idx) => ({
            fileName: `DVR_${c.code.replace('-', '')}_Noturno_0${idx + 1}h15.mp4`,
            camCode: c.code,
            modelKey: c.modelKey,
            stamp: `0${idx + 1}:15`,
            sizeMb: 180 + idx * 35,
            desc: `Gravação automática de movimento em ${c.room}`
          }));

      return baseList.map((r) => ({
        ...r,
        deleted: !!this.state.deletedRecordings[`${ip}::${r.fileName}`]
      }));
    }

    isRecordingDeleted(ip, fileName) {
      this.ensureLoaded();
      return !!this.state.deletedRecordings[`${ip}::${fileName}`];
    }

    areAllRecordingsDeleted(ip, hostname = '') {
      const list = this.getCompanyDvrRecordings(ip, hostname);
      return list.length > 0 && list.every((r) => r.deleted);
    }

    isCameraDisabled(ip, camCode) {
      this.ensureLoaded();
      return !!this.state.disabledCameras[`${ip}::${camCode}`];
    }

    areAllCamerasDisabled(ip, hostname = '') {
      this.ensureLoaded();
      const cams = this.getCompanyNvrProfile(ip, hostname).cameras;
      return cams.length > 0 && cams.every((c) => !!this.state.disabledCameras[`${ip}::${c.code}`]);
    }

    getActiveCameraCount(ip, hostname = '') {
      const cams = this.getCompanyNvrProfile(ip, hostname).cameras;
      return cams.filter((c) => !this.isCameraDisabled(ip, c.code)).length;
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

    previewDvrRecording(fileName) {
      this.previewRecFile = fileName;
      this.viewMode = 'recordings';
      if (window.internetEngine) window.internetEngine.render();
      this.syncReducedMotionPreference();
    }

    setOpticalFilter(filterName) {
      this.opticalFilter = filterName || 'normal';
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

    // =========================================================================
    // AÇÃO DE ROUBO #1: DESATIVAR CÂMERA INDIVIDUAL OU TODAS AS CÂMERAS DA EMPRESA!
    // =========================================================================
    toggleSingleCameraPower(ip, camCode) {
      this.ensureLoaded();
      const key = `${ip}::${camCode}`;
      const currentlyOff = !!this.state.disabledCameras[key];
      if (currentlyOff) {
        delete this.state.disabledCameras[key];
      } else {
        this.state.disabledCameras[key] = Date.now();
      }
      this.save();

      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      if (window.internetEngine) {
        window.internetEngine.appendServerLog(
          ip,
          `${myIp} RTSP/554 ${currentlyOff ? 'restored video feed' : 'cut camera power/signal'} on ${camCode} [NVR_OVERRIDE]`
        );
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('CCTV-CUT', `${currentlyOff ? 'Sinal religado' : 'Câmera desativada'} em ${ip} // ${camCode}`, 'warning');
      }
      if (window.hackerAudio) window.hackerAudio.playKeyClick();

      if (!currentlyOff && window.missionsEngine && typeof window.missionsEngine.notifyCctvAction === 'function') {
        window.missionsEngine.notifyCctvAction(ip, camCode, 'disable_cam');
        if (this.areAllCamerasDisabled(ip)) {
          window.missionsEngine.notifyCctvAction(ip, null, 'disable_all');
        }
      }
      if (!currentlyOff && window.ecosystemHub && typeof window.ecosystemHub.onCorporateHostSabotaged === 'function') {
        window.ecosystemHub.onCorporateHostSabotaged(ip, 'cctv_disable');
      }
      if (window.onlineEngine && typeof window.onlineEngine.saveLocalSnapshotImmediate === 'function') {
        window.onlineEngine.saveLocalSnapshotImmediate();
      }
      if (typeof window.showToast === 'function') {
        window.showToast(currentlyOff ? `🔌 ${camCode} religada em ${ip}.` : `⛔ ${camCode} DESATIVADA! Sinal cortado (limpe seu IP na aba Logs!).`);
      }
      if (window.internetEngine) window.internetEngine.render();
    }

    disableAllCompanyCameras(ip) {
      this.ensureLoaded();
      const host = window.internetEngine ? window.internetEngine.resolveHost(ip) : null;
      const profile = this.getCompanyNvrProfile(ip, host ? host.hostname : ip);
      const now = Date.now();
      profile.cameras.forEach((c) => {
        this.state.disabledCameras[`${ip}::${c.code}`] = now;
      });
      this.save();

      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      if (window.internetEngine) {
        window.internetEngine.appendServerLog(
          ip,
          `${myIp} RTSP/554 shut down ALL ${profile.cameras.length} security cameras [FULL_CCTV_BLACKOUT]`
        );
      }
      if (window.safenetFbiEngine) {
        window.safenetFbiEngine.evaluatePlayerCrime(`Sabotagem total do circuito CFTV em ${host ? host.hostname : ip}`, 950, ip);
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('CCTV-BLACKOUT', `Todas as ${profile.cameras.length} câmeras de ${ip} foram DESATIVADAS!`, 'warning');
      }
      if (window.hackerAudio) window.hackerAudio.playCashChime();

      if (window.missionsEngine && typeof window.missionsEngine.notifyCctvAction === 'function') {
        window.missionsEngine.notifyCctvAction(ip, null, 'disable_all');
      }
      if (window.ecosystemHub && typeof window.ecosystemHub.onCorporateHostSabotaged === 'function') {
        window.ecosystemHub.onCorporateHostSabotaged(ip, 'cctv_disable');
      }
      if (window.onlineEngine && typeof window.onlineEngine.saveLocalSnapshotImmediate === 'function') {
        window.onlineEngine.saveLocalSnapshotImmediate();
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`⛔ Apagão CFTV concluído! Todas as ${profile.cameras.length} câmeras de ${host ? host.hostname : ip} estão DESATIVADAS.`);
      }
      if (window.internetEngine) window.internetEngine.render();
      return { success: true };
    }

    restoreAllCompanyCameras(ip) {
      this.ensureLoaded();
      const profile = this.getCompanyNvrProfile(ip);
      profile.cameras.forEach((c) => {
        delete this.state.disabledCameras[`${ip}::${c.code}`];
      });
      this.save();
      if (window.onlineEngine && typeof window.onlineEngine.saveLocalSnapshotImmediate === 'function') {
        window.onlineEngine.saveLocalSnapshotImmediate();
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`🔌 Circuito CFTV de ${ip} religado.`);
      }
      if (window.internetEngine) window.internetEngine.render();
    }

    // =========================================================================
    // AÇÃO QUEIMA DE ARQUIVO #2: APAGAR GRAVAÇÃO ESPECÍFICA OU FORMATAR O DVR!
    // =========================================================================
    deleteDvrRecording(ip, fileName) {
      this.ensureLoaded();
      const key = `${ip}::${fileName}`;
      this.state.deletedRecordings[key] = Date.now();
      this.save();

      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      if (window.internetEngine) {
        window.internetEngine.appendServerLog(
          ip,
          `${myIp} deleted NVR surveillance recording /var/nvr/recordings/${fileName}`
        );
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('DVR-WIPE', `Gravação comprometedora ${fileName} apagada do DVR de ${ip}`, 'success');
      }
      if (window.hackerAudio) window.hackerAudio.playKeyClick();

      if (window.missionsEngine && typeof window.missionsEngine.notifyCctvAction === 'function') {
        window.missionsEngine.notifyCctvAction(ip, fileName, 'wipe_recording');
        if (this.areAllRecordingsDeleted(ip)) {
          window.missionsEngine.notifyCctvAction(ip, null, 'wipe_all_dvr');
        }
      }
      if (window.ecosystemHub && typeof window.ecosystemHub.onCorporateHostSabotaged === 'function') {
        window.ecosystemHub.onCorporateHostSabotaged(ip, 'cctv_wipe');
      }
      if (window.onlineEngine && typeof window.onlineEngine.saveLocalSnapshotImmediate === 'function') {
        window.onlineEngine.saveLocalSnapshotImmediate();
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`🗑️ Gravação ${fileName} apagada permanentemente do DVR de ${ip}!`);
      }
      if (window.internetEngine) window.internetEngine.render();
      return { success: true };
    }

    wipeAllCompanyRecordings(ip) {
      this.ensureLoaded();
      const host = window.internetEngine ? window.internetEngine.resolveHost(ip) : null;
      const list = this.getCompanyDvrRecordings(ip, host ? host.hostname : ip);
      const now = Date.now();
      list.forEach((r) => {
        this.state.deletedRecordings[`${ip}::${r.fileName}`] = now;
      });
      this.save();

      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      if (window.internetEngine) {
        window.internetEngine.appendServerLog(
          ip,
          `${myIp} formatted NVR storage /var/nvr/recordings/* (${list.length} surveillance clips wiped)`
        );
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('DVR-FORMAT', `HD do DVR de ${ip} formatado (${list.length} gravações destruídas)!`, 'warning');
      }
      if (window.hackerAudio) window.hackerAudio.playCashChime();

      if (window.missionsEngine && typeof window.missionsEngine.notifyCctvAction === 'function') {
        window.missionsEngine.notifyCctvAction(ip, null, 'wipe_all_dvr');
      }
      if (window.onlineEngine && typeof window.onlineEngine.saveLocalSnapshotImmediate === 'function') {
        window.onlineEngine.saveLocalSnapshotImmediate();
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`🔥 Todas as ${list.length} gravações do DVR de ${host ? host.hostname : ip} foram destruídas!`);
      }
      if (window.internetEngine) window.internetEngine.render();
      return { success: true };
    }

    // Ações Clássicas: Baixar Gravação (.mp4) e Injetar Loop Fantasma
    captureCameraEvidence(ip, camCode) {
      this.ensureLoaded();
      const host = window.internetEngine ? window.internetEngine.resolveHost(ip) : null;
      const profile = this.getCompanyNvrProfile(ip, host ? host.hostname : ip);
      const cam = profile.cameras.find((c) => c.code === camCode) || profile.cameras[0];
      if (!cam) return { success: false };

      const clipFile = `CFTV_${ip.replace(/\./g, '_')}_${cam.code}.mp4`;
      this.state.capturedClips = [
        { ip, hostname: host ? host.hostname : ip, camCode: cam.code, room: cam.room, modelKey: cam.modelKey, clipFile, at: new Date().toLocaleTimeString('pt-BR') },
        ...this.state.capturedClips.filter((x) => !(x.ip === ip && x.camCode === cam.code))
      ].slice(0, 30);
      this.save();

      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      if (window.internetEngine) {
        window.internetEngine.appendServerLog(ip, `${myIp} RTSP/554 exported live surveillance stream /var/nvr/${cam.code}_${cam.modelKey}.mp4`);
      }
      if (window.hackerAudio) window.hackerAudio.playKeyClick();
      if (window.missionsEngine && typeof window.missionsEngine.notifyCctvAction === 'function') {
        window.missionsEngine.notifyCctvAction(ip, cam.code, 'capture');
      }
      if (window.onlineEngine && typeof window.onlineEngine.saveLocalSnapshotImmediate === 'function') {
        window.onlineEngine.saveLocalSnapshotImmediate();
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`Gravação ${clipFile} salva no seu PC!`);
      }
      if (window.internetEngine) window.internetEngine.render();
      return { success: true, clipFile };
    }

    injectCameraLoop(ip, camCode) {
      this.ensureLoaded();
      const host = window.internetEngine ? window.internetEngine.resolveHost(ip) : null;
      const profile = this.getCompanyNvrProfile(ip, host ? host.hostname : ip);
      const cam = profile.cameras.find((c) => c.code === camCode) || profile.cameras[0];
      if (!cam) return { success: false };

      this.state.loopedCameras[`${ip}::${cam.code}`] = Date.now();
      this.save();

      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      if (window.internetEngine) {
        window.internetEngine.appendServerLog(ip, `${myIp} RTSP/554 hijacked camera feed ${cam.code} (${cam.room}) [GHOST_LOOP_INJECTED]`);
      }
      if (window.hackerAudio) window.hackerAudio.playCashChime();
      if (window.missionsEngine && typeof window.missionsEngine.notifyCctvAction === 'function') {
        window.missionsEngine.notifyCctvAction(ip, cam.code, 'loop');
      }
      if (window.onlineEngine && typeof window.onlineEngine.saveLocalSnapshotImmediate === 'function') {
        window.onlineEngine.saveLocalSnapshotImmediate();
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`Loop Falso ativo em ${cam.code} (${cam.room})!`);
      }
      if (window.internetEngine) window.internetEngine.render();
      return { success: true };
    }

    syncReducedMotionPreference() {
      if (typeof window === 'undefined' || !window.matchMedia) return;
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

    renderMissionBannerHtml(host, cams, msn) {
      if (!msn) return '';
      const obj = msn.cctvObjective;
      let descHtml = '';
      let actionBtnHtml = '';

      if (obj === 'disable_all') {
        const done = this.areAllCamerasDisabled(host.ip, host.hostname);
        descHtml = done
          ? `✓ Todas as câmeras da <strong>${esc(host.hostname)}</strong> estão DESATIVADAS! A equipe já pode fazer o roubo — volte em Missões p/ receber.`
          : `Desative <strong>TODAS as ${cams.length} câmeras</strong> da <strong>${esc(host.hostname)}</strong> para cobrir o roubo em andamento!`;
        actionBtnHtml = done
          ? `<button type="button" class="hc-btn primary sm" onclick="navTo('winMissions');window.missionsEngine.setSubTab('current');">Receber Recompensa →</button>`
          : `<button type="button" id="btnBannerDisableAll" class="hc-btn primary sm" onclick="window.cctvEngine.disableAllCompanyCameras('${esc(host.ip)}')">Desativar Todas Agora</button>`;
      } else if (obj === 'disable_cam') {
        const done = this.isCameraDisabled(host.ip, msn.camCode) || this.areAllCamerasDisabled(host.ip, host.hostname);
        descHtml = done
          ? `✓ Câmera <strong>${esc(msn.camCode)}</strong> desativada! A rota de fuga está limpa — volte em Missões p/ receber.`
          : `Desative a câmera <strong>${esc(msn.camCode)} (${esc(msn.camRoom)})</strong> (ou derrube todo o CFTV) para liberar a fuga!`;
        actionBtnHtml = done
          ? `<button type="button" class="hc-btn primary sm" onclick="navTo('winMissions');window.missionsEngine.setSubTab('current');">Receber Recompensa →</button>`
          : `<button type="button" id="btnJumpMissionCam" class="hc-btn primary sm" onclick="window.cctvEngine.openCameraFocus(${Math.max(0, cams.findIndex((c) => c.code === msn.camCode))})">Abrir ${esc(msn.camCode)} →</button>`;
      } else if (obj === 'wipe_recording' || obj === 'wipe_all_dvr') {
        const done = obj === 'wipe_all_dvr'
          ? this.areAllRecordingsDeleted(host.ip, host.hostname)
          : (this.isRecordingDeleted(host.ip, msn.dvrFileName) || this.areAllRecordingsDeleted(host.ip, host.hostname));
        descHtml = done
          ? `✓ Gravação comprometedora apagada do DVR! Volte em Missões p/ receber.`
          : (obj === 'wipe_all_dvr'
              ? `Abra <strong>Gravações do DVR</strong> e apague <strong>todas as gravações</strong> salvas da empresa!`
              : `Abra <strong>Gravações do DVR</strong> e exclua o arquivo <strong>${esc(msn.dvrFileName)}</strong>!`);
        actionBtnHtml = done
          ? `<button type="button" class="hc-btn primary sm" onclick="navTo('winMissions');window.missionsEngine.setSubTab('current');">Receber Recompensa →</button>`
          : `<button type="button" id="btnJumpMissionDvr" class="hc-btn primary sm" onclick="window.cctvEngine.setViewMode('recordings')">Abrir Gravações do DVR →</button>`;
      } else {
        descHtml = `Abra <strong>${esc(msn.camCode)} (${esc(msn.camRoom)})</strong> e execute <strong>${obj === 'loop' ? 'Injetar Loop Falso' : 'Gravar Prova (.mp4)'}</strong>!`;
        actionBtnHtml = `<button type="button" id="btnJumpMissionCam" class="hc-btn primary sm" onclick="window.cctvEngine.openCameraFocus(${Math.max(0, cams.findIndex((c) => c.code === msn.camCode))})">Focar ${esc(msn.camCode)} →</button>`;
      }

      return `
        <div id="cctvMissionTargetBanner" class="hc-card" style="padding:10px 14px;border-color:rgba(240,160,58,0.55);background:rgba(240,160,58,0.11);display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:12.5px;">
          <div>
            <strong style="color:#ffd28a;">Alvo da Missão (${esc(msn.hirer)}):</strong>
            <span style="color:var(--hc-text);margin-left:6px;">${descHtml}</span>
          </div>
          ${actionBtnHtml}
        </div>
      `;
    }

    renderRemoteCctvPanelHtml(host) {
      this.ensureLoaded();
      const ic = (n) => (window.HC && window.HC.icon ? window.HC.icon(n) : '');
      const profile = this.getCompanyNvrProfile(host.ip, host.hostname);
      const cams = profile.cameras;
      if (this.selectedCamIdx >= cams.length) this.selectedCamIdx = 0;

      const dvrList = this.getCompanyDvrRecordings(host.ip, host.hostname);
      const remainingDvrCount = dvrList.filter((r) => !r.deleted).length;
      const activeCamsCount = this.getActiveCameraCount(host.ip, host.hostname);
      const allOff = activeCamsCount === 0;

      const activeMsn = (window.missionsEngine && window.missionsEngine.ensureLoaded().activeMission) || null;
      const msnOnThisHost = activeMsn && activeMsn.type === 'cctv_hack' && activeMsn.targetIp === host.ip ? activeMsn : null;
      const nowStr = new Date().toLocaleTimeString('pt-BR', { hour12: false });

      const missionHintBanner = this.renderMissionBannerHtml(host, cams, msnOnThisHost);

      // Barra Tática Rápida: Status do Circuito + Desativar Todas as Câmeras p/ Roubo + Atalho p/ Apagar Gravações do DVR
      const heistToolbarHtml = `
        <div class="cctv-heist-strip">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span class="hc-badge ${allOff ? 'danger' : 'success'}">
              ${allOff ? `APAGÃO CFTV: 0/${cams.length} ONLINE` : `${activeCamsCount}/${cams.length} Câmeras Online`}
            </span>
            <span class="hc-badge ${remainingDvrCount === 0 ? 'success' : 'info'}">
              ${remainingDvrCount === 0 ? 'DVR Limpo (0 vídeos)' : `${remainingDvrCount} gravação(ões) salva(s) no DVR`}
            </span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${allOff
              ? `<button type="button" id="btnRestoreCompanyCams" class="hc-btn ghost sm" onclick="window.cctvEngine.restoreAllCompanyCameras('${esc(host.ip)}')">
                   Religar Câmeras (${cams.length})
                 </button>`
              : `<button type="button" id="btnDisableAllCompanyCams" class="hc-btn sm" style="background:rgba(229,83,75,0.16);border-color:rgba(229,83,75,0.55);color:#ff9b95;"
                   onclick="window.cctvEngine.disableAllCompanyCameras('${esc(host.ip)}')">
                   ${ic('zap')} Desativar Todas as Câmeras (Ajudar Roubo)
                 </button>`}
            <button type="button" id="btnQuickOpenDvrArchive" class="hc-btn ${this.viewMode === 'recordings' ? 'primary' : 'ghost'} sm"
              onclick="window.cctvEngine.setViewMode('recordings')">
              ${ic('trash-2')} Gravações do DVR (${remainingDvrCount})
            </button>
          </div>
        </div>
      `;

      let mainStageHtml = '';

      // MODO 4: ARQUIVO DE GRAVAÇÕES DO DVR DA EMPRESA (/var/nvr/recordings — Assistir e Apagar Provas!)
      if (this.viewMode === 'recordings') {
        const previewTarget = dvrList.find((r) => r.fileName === this.previewRecFile && !r.deleted) ||
          dvrList.find((r) => !r.deleted) ||
          null;
        const previewMdl = previewTarget ? (CCTV_VIDEO_MODELS[previewTarget.modelKey] || CCTV_VIDEO_MODELS.datacenter) : null;

        const dvrRowsHtml = dvrList.map((rec) => {
          const safeId = rec.fileName.replace(/[^a-zA-Z0-9]/g, '_');
          const isMsnTarget = !!(msnOnThisHost && (msnOnThisHost.dvrFileName === rec.fileName || msnOnThisHost.cctvObjective === 'wipe_all_dvr'));
          return `
            <tr class="${rec.deleted ? 'row-hidden' : ''}">
              <td class="soft-col-icon">
                <span class="soft-mini-glyph kind-${rec.deleted ? 'text' : 'attack'}">
                  ${ic(rec.deleted ? 'circle-check' : 'video')}
                </span>
              </td>
              <td>
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                  <strong class="mono" style="font-size:12px;${rec.deleted ? 'text-decoration:line-through;color:var(--hc-text-3);' : ''}">${esc(rec.fileName)}</strong>
                  <span class="hc-badge ${rec.deleted ? 'success' : 'info'}">${rec.deleted ? 'APAGADA' : `${esc(rec.camCode)} · ${esc(rec.stamp)}`}</span>
                  ${!rec.deleted && isMsnTarget ? '<span class="hc-badge warn">ALVO MISSÃO</span>' : ''}
                </div>
                <div style="font-size:11.5px;color:var(--hc-text-3);margin-top:2px;">
                  ${rec.deleted ? 'Setor sobrescrito com zeros no HD do NVR — impossível recuperar.' : esc(rec.desc)}
                </div>
              </td>
              <td class="soft-col-size" style="width:72px;">${rec.deleted ? '0 MB' : `${rec.sizeMb} MB`}</td>
              <td class="soft-col-acts" style="width:94px;">
                ${rec.deleted
                  ? `<span class="hc-badge success">Apagado</span>`
                  : `<div class="soft-icon-actions">
                       <button type="button" class="soft-icon-act ic-info" aria-label="Assistir ${esc(rec.fileName)}"
                         data-tip-title="Reproduzir Gravação" data-tip-meta="${rec.sizeMb} MB" data-tip-desc="Assistir o trecho gravado no monitor DVR ao lado."
                         onclick="window.cctvEngine.previewDvrRecording('${esc(rec.fileName)}')">
                         ${ic('play')}
                       </button>
                       <button type="button" id="btnDeleteDvr_${esc(safeId)}" class="soft-icon-act ic-del" aria-label="Apagar ${esc(rec.fileName)} do DVR"
                         data-tip-title="Apagar Gravação do DVR" data-tip-meta="${esc(rec.camCode)}" data-tip-desc="Excluir permanentemente este vídeo de segurança da empresa!"
                         onclick="window.cctvEngine.deleteDvrRecording('${esc(host.ip)}', '${esc(rec.fileName)}')">
                         ${ic('trash-2')}
                       </button>
                     </div>`}
              </td>
            </tr>
          `;
        }).join('');

        mainStageHtml = `
          <div class="cctv-dvr-layout" id="cctvDvrArchiveView">
            <div class="soft-frame">
              <div class="soft-tabs-bar">
                <div class="soft-tabs-left">
                  <button type="button" class="soft-tab-btn active">
                    ${ic('hard-drive')} <span>/var/nvr/recordings — Histórico Salvo (${remainingDvrCount}/${dvrList.length} vídeos)</span>
                  </button>
                </div>
                <button type="button" id="btnWipeAllDvrRecordings" class="hc-btn sm"
                  ${remainingDvrCount === 0 ? 'disabled' : ''}
                  style="${remainingDvrCount === 0 ? 'opacity:0.45;' : 'background:rgba(229,83,75,0.18);border-color:rgba(229,83,75,0.55);color:#ff9b95;'}"
                  onclick="window.cctvEngine.wipeAllCompanyRecordings('${esc(host.ip)}')">
                  ${ic('trash-2')} ${remainingDvrCount === 0 ? 'DVR Formatado ✓' : 'Apagar Todas (Formatar DVR)'}
                </button>
              </div>
              <div class="soft-table-wrap" role="region" aria-label="Gravações salvas no DVR da empresa">
                <table class="soft-table clean-hw-table">
                  <thead>
                    <tr>
                      <th class="soft-col-icon"></th>
                      <th>Arquivo de Vídeo &amp; Ocorrência Registrada</th>
                      <th class="soft-col-size" style="width:72px;">Tam.</th>
                      <th class="soft-col-acts" style="width:94px;">Ações</th>
                    </tr>
                  </thead>
                  <tbody>${dvrRowsHtml}</tbody>
                </table>
              </div>
            </div>

            <aside class="cctv-dvr-preview-card" aria-label="Monitor de Reprodução do DVR">
              <div class="hc-eyebrow">Monitor de Reprodução do DVR</div>
              ${previewTarget && previewMdl
                ? `<div class="cctv-viewport cctv-filter-${esc(this.opticalFilter)}">
                     <video class="cctv-video-el" autoplay loop muted playsinline preload="metadata"
                       width="640" height="360" poster="${esc(previewMdl.poster)}">
                       <source src="${esc(previewMdl.webm)}" type="video/webm">
                       <source src="${esc(previewMdl.mp4)}" type="video/mp4">
                     </video>
                     <div class="cctv-scanline-layer"></div>
                     <div class="cctv-osd-top">
                       <span class="cctv-osd-chip"><span class="cctv-rec-dot"></span> PLAYBACK · ${esc(previewTarget.camCode)}</span>
                       <span class="cctv-osd-chip">${esc(previewTarget.stamp)}</span>
                     </div>
                     <div class="cctv-osd-bottom">
                       <span class="cctv-osd-chip">${esc(previewTarget.fileName)}</span>
                     </div>
                   </div>
                   <div style="font-size:12px;color:var(--hc-text-2);">${esc(previewTarget.desc)}</div>
                   <button type="button" class="hc-btn sm block" style="background:rgba(229,83,75,0.18);border-color:rgba(229,83,75,0.55);color:#ff9b95;"
                     onclick="window.cctvEngine.deleteDvrRecording('${esc(host.ip)}', '${esc(previewTarget.fileName)}')">
                     ${ic('trash-2')} Destruir Esta Gravação Agora
                   </button>`
                : `<div style="padding:28px 14px;text-align:center;background:#0a0e13;border:1px dashed var(--hc-accent);border-radius:8px;">
                     <strong style="color:var(--hc-accent-text);font-size:13.5px;">✓ Disco DVR 100% Limpo</strong>
                     <p style="font-size:12px;color:var(--hc-text-2);margin:6px 0 0;">Nenhuma gravação restante neste servidor corporativo. Lembre-se de apagar seu IP na aba Logs!</p>
                   </div>`}
            </aside>
          </div>
        `;
      }
      // MODO 3: GALERIA COMPLETA DOS 6 MODELOS DE VÍDEO DE CÂMERAS CORPORATIVAS
      else if (this.viewMode === 'all_models') {
        const allModels = Object.values(CCTV_VIDEO_MODELS);
        const cardsHtml = allModels.map((mdl, idx) => `
          <div class="cctv-cam-tile cctv-filter-${esc(this.opticalFilter)}" tabindex="0" aria-label="${esc(mdl.modelTitle)}">
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

        mainStageHtml = `<div class="cctv-mosaic-grid cols-3" id="cctvAllModelsGrid">${cardsHtml}</div>`;
      }
      // MODO 1: MOSAICO AO VIVO DA EMPRESA INVADIDA (4x ou 6x CÂMERAS SIMULTÂNEAS)
      else if (this.viewMode === 'mosaic') {
        const tilesHtml = cams.map((cam, idx) => {
          const mdl = CCTV_VIDEO_MODELS[cam.modelKey] || CCTV_VIDEO_MODELS.datacenter;
          const isOff = this.isCameraDisabled(host.ip, cam.code);
          const looped = this.isCameraLooped(host.ip, cam.code);
          const isTargetCam = !!(msnOnThisHost && (msnOnThisHost.camCode === cam.code || msnOnThisHost.cctvObjective === 'disable_all'));

          return `
            <div id="cctvTile_${esc(cam.code)}" class="cctv-cam-tile cctv-filter-${esc(this.opticalFilter)} ${isTargetCam ? 'is-mission-target' : ''} ${looped ? 'is-looped' : ''} ${isOff ? 'is-disabled' : ''}"
              tabindex="0" role="button" aria-label="Abrir ${esc(cam.code)} ${esc(cam.room)}"
              onclick="window.cctvEngine.openCameraFocus(${idx})"
              onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window.cctvEngine.openCameraFocus(${idx});}">
              <div class="cctv-viewport" style="border:none;border-radius:0;">
                ${isOff ? `
                  <div class="cctv-disabled-overlay">
                    <div class="cctv-disabled-box">
                      <div class="cctv-disabled-title">⛔ CÂMERA DESATIVADA · SEM SINAL</div>
                      <div class="cctv-disabled-sub">${esc(cam.code)} (${esc(cam.room)}) — VIGILÂNCIA CEGA</div>
                    </div>
                  </div>
                ` : `
                  <video class="cctv-video-el" autoplay loop muted playsinline preload="metadata"
                    width="640" height="360" poster="${esc(mdl.poster)}">
                    <source src="${esc(mdl.webm)}" type="video/webm">
                    <source src="${esc(mdl.mp4)}" type="video/mp4">
                  </video>
                  <div class="cctv-scanline-layer"></div>
                  ${this.motionHud ? `<div class="cctv-motion-box"><span class="cctv-motion-label">MOVIMENTO · ${esc(cam.zone)}</span></div>` : ''}
                  ${looped ? `<div class="cctv-loop-stamp">SINAL EM LOOP FALSO (SEGURANÇA CEGADA)</div>` : ''}
                `}
                <div class="cctv-osd-top">
                  <span class="cctv-osd-chip">
                    <span class="cctv-rec-dot ${isOff ? 'off' : ''}"></span>
                    <strong>${esc(cam.code)}</strong> · ${esc(cam.room)}
                  </span>
                  <span class="cctv-osd-chip cctv-live-clock">${isOff ? 'OFFLINE' : esc(nowStr)}</span>
                </div>
                <div class="cctv-osd-bottom">
                  <span class="cctv-osd-chip">${isOff ? 'Clique p/ Religar ou Inspecionar' : 'Clique p/ Controles, Desativar ou Gravar'}</span>
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
      // MODO 2: CÂMERA INDIVIDUAL EM ALTA DEFINIÇÃO + PAINEL PTZ & DESATIVAÇÃO
      else {
        const cam = cams[this.selectedCamIdx] || cams[0];
        const mdl = CCTV_VIDEO_MODELS[cam.modelKey] || CCTV_VIDEO_MODELS.datacenter;
        const isOff = this.isCameraDisabled(host.ip, cam.code);
        const looped = this.isCameraLooped(host.ip, cam.code);
        const captured = this.hasCapturedCamera(host.ip, cam.code);

        const camButtonsHtml = cams.map((c, idx) => {
          const cOff = this.isCameraDisabled(host.ip, c.code);
          const cLooped = this.isCameraLooped(host.ip, c.code);
          return `
            <button type="button" id="btnSelectCam_${esc(c.code)}" class="cctv-cam-sel-btn ${idx === this.selectedCamIdx ? 'active' : ''}"
              onclick="window.cctvEngine.openCameraFocus(${idx})">
              <span><strong class="mono">${esc(c.code)}</strong> · ${esc(c.room)}</span>
              <span class="mono" style="font-size:10.5px;color:${cOff ? '#ff8e88' : 'var(--hc-accent-text)'};">${cOff ? 'OFF' : (cLooped ? 'LOOP' : 'LIVE')}</span>
            </button>
          `;
        }).join('');

        mainStageHtml = `
          <div class="cctv-single-layout" id="cctvSingleInspector">
            <div class="cctv-viewport cctv-filter-${esc(this.opticalFilter)}">
              ${isOff ? `
                <div class="cctv-disabled-overlay">
                  <div class="cctv-disabled-box">
                    <div class="cctv-disabled-title">⛔ CÂMERA DESATIVADA · FEED CORTADO</div>
                    <div class="cctv-disabled-sub">${esc(host.hostname)} // ${esc(cam.code)} — Segurança sem visão deste setor</div>
                  </div>
                </div>
              ` : `
                <video id="cctvPrimaryVideo" class="cctv-video-el" autoplay loop muted playsinline preload="auto"
                  width="640" height="360" poster="${esc(mdl.poster)}"
                  style="transform: scale(${this.zoomLevel}) translate(${this.panX}%, ${this.panY}%);">
                  <source src="${esc(mdl.webm)}" type="video/webm">
                  <source src="${esc(mdl.mp4)}" type="video/mp4">
                </video>
                <div class="cctv-scanline-layer"></div>
                ${this.motionHud ? `<div class="cctv-motion-box"><span class="cctv-motion-label">ALVO EM MOVIMENTO · ${esc(cam.zone)}</span></div>` : ''}
                ${looped ? `<div class="cctv-loop-stamp">LOOP FANTASMA ATIVO — MONITORAMENTO ENGANADO</div>` : ''}
              `}

              <div class="cctv-osd-top">
                <span class="cctv-osd-chip">
                  <span class="cctv-rec-dot ${isOff ? 'off' : ''}"></span>
                  <strong>${esc(host.hostname)}</strong> // ${esc(cam.code)} — ${esc(cam.room)}
                </span>
                <span class="cctv-osd-chip cctv-live-clock">${isOff ? 'OFFLINE' : esc(nowStr)}</span>
              </div>

              <div class="cctv-osd-bottom">
                <span class="cctv-osd-chip">Intel Visual: ${esc(cam.secretIntel)}</span>
                <span class="cctv-osd-chip">Zoom <strong id="cctvZoomLabel">${this.zoomLevel.toFixed(1)}x</strong> · ${esc(mdl.lensSpec)}</span>
              </div>
            </div>

            <aside class="cctv-control-deck" aria-label="Controles NVR e Sabotagem de Câmera">
              <div>
                <div class="hc-eyebrow" style="margin-bottom:6px;">Canais de Câmera (${cams.length})</div>
                <div class="cctv-cam-selector-list">${camButtonsHtml}</div>
              </div>

              <div style="border-top:1px solid var(--hc-border);padding-top:10px;">
                <div class="hc-eyebrow" style="margin-bottom:6px;">Controle PTZ (Pan &amp; Zoom)</div>
                <div class="cctv-ptz-pad">
                  <button type="button" class="cctv-ptz-btn" ${isOff ? 'disabled' : ''} onclick="window.cctvEngine.adjustPtz(6, 0, 0)">◀ Pan</button>
                  <button type="button" class="cctv-ptz-btn" ${isOff ? 'disabled' : ''} onclick="window.cctvEngine.adjustPtz(0, 5, 0)">▲ Tilt</button>
                  <button type="button" class="cctv-ptz-btn" ${isOff ? 'disabled' : ''} onclick="window.cctvEngine.adjustPtz(-6, 0, 0)">Pan ▶</button>
                  <button type="button" class="cctv-ptz-btn" ${isOff ? 'disabled' : ''} onclick="window.cctvEngine.adjustPtz(0, 0, 0.4)">＋ Zoom</button>
                  <button type="button" class="cctv-ptz-btn" ${isOff ? 'disabled' : ''} onclick="window.cctvEngine.adjustPtz(0, -5, 0)">▼ Tilt</button>
                  <button type="button" class="cctv-ptz-btn" ${isOff ? 'disabled' : ''} onclick="window.cctvEngine.adjustPtz(0, 0, -0.4)">－ Zoom</button>
                </div>
              </div>

              <div style="border-top:1px solid var(--hc-border);padding-top:10px;display:flex;flex-direction:column;gap:7px;">
                <div class="hc-eyebrow">Sabotagem &amp; Ações na Câmera</div>
                <button type="button" id="btnToggleSingleCamPower" class="hc-btn sm block"
                  style="${isOff ? 'border-color:var(--hc-accent);color:var(--hc-accent-text);' : 'background:rgba(229,83,75,0.18);border-color:rgba(229,83,75,0.55);color:#ff9b95;'}"
                  onclick="window.cctvEngine.toggleSingleCameraPower('${esc(host.ip)}', '${esc(cam.code)}')">
                  ${ic('zap')} ${isOff ? `Religar ${esc(cam.code)}` : `Desativar ${esc(cam.code)} (Cortar Sinal)`}
                </button>
                <button type="button" id="btnInjectCctvLoop" class="hc-btn ${looped ? 'ghost' : ''} sm block" ${isOff ? 'disabled' : ''}
                  style="${looped ? 'border-color:var(--hc-accent);color:var(--hc-accent-text);' : 'border-color:var(--hc-warning);color:#ffd28a;'}"
                  onclick="window.cctvEngine.injectCameraLoop('${esc(host.ip)}', '${esc(cam.code)}')">
                  ${ic('video')} ${looped ? 'Loop Fantasma Ativo ✓' : `Injetar Loop Falso (${esc(cam.code)})`}
                </button>
                <button type="button" id="btnCaptureCctvEvidence" class="hc-btn primary sm block" ${isOff ? 'disabled' : ''}
                  onclick="window.cctvEngine.captureCameraEvidence('${esc(host.ip)}', '${esc(cam.code)}')">
                  ${ic('camera')} ${captured ? 'Regravar Prova (.mp4) ✓' : `Salvar Cópia Ao Vivo (${esc(cam.code)})`}
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
              <span class="cctv-live-pill ${allOff ? 'is-blackout' : ''}">
                <span class="cctv-rec-dot ${allOff ? 'off' : ''}"></span>
                ${allOff ? 'CFTV DESATIVADO' : `AO VIVO · RTSP:${profile.rtspPort}`}
              </span>
              <strong style="font-size:13px;color:var(--hc-text);">${esc(profile.nvrSystem)}</strong>
            </div>

            <div class="cctv-mode-pills">
              <button type="button" id="btnCctvModeMosaic" class="cctv-pill-btn ${this.viewMode === 'mosaic' ? 'active' : ''}"
                onclick="window.cctvEngine.setViewMode('mosaic')">
                ${ic('layout-grid')} Mosaico (${cams.length}x)
              </button>
              <button type="button" id="btnCctvModeSingle" class="cctv-pill-btn ${this.viewMode === 'single' ? 'active' : ''}"
                onclick="window.cctvEngine.setViewMode('single')">
                ${ic('video')} Câmera HD
              </button>
              <button type="button" id="btnCctvModeRecordings" class="cctv-pill-btn ${this.viewMode === 'recordings' ? 'active' : ''}"
                onclick="window.cctvEngine.setViewMode('recordings')">
                ${ic('trash-2')} Gravações DVR (${remainingDvrCount})
              </button>
              <button type="button" id="btnCctvModeAll6" class="cctv-pill-btn ${this.viewMode === 'all_models' ? 'active' : ''}"
                onclick="window.cctvEngine.setViewMode('all_models')">
                ${ic('camera')} 6 Modelos
              </button>
              <span style="width:1px;height:18px;background:var(--hc-border);margin:0 2px;"></span>
              <button type="button" id="btnCctvFilterNormal" class="cctv-pill-btn ${this.opticalFilter === 'normal' ? 'active' : ''}"
                onclick="window.cctvEngine.setOpticalFilter('normal')">Cor</button>
              <button type="button" id="btnCctvFilterIr" class="cctv-pill-btn ${this.opticalFilter === 'ir' ? 'active' : ''}"
                onclick="window.cctvEngine.setOpticalFilter('ir')">IR</button>
              <button type="button" id="btnCctvFilterThermal" class="cctv-pill-btn ${this.opticalFilter === 'thermal' ? 'active' : ''}"
                onclick="window.cctvEngine.setOpticalFilter('thermal')">Térmica</button>
            </div>
          </div>

          ${heistToolbarHtml}

          ${mainStageHtml}
        </div>
      `;
    }
  }

  window.CCTV_VIDEO_MODELS = CCTV_VIDEO_MODELS;
  window.cctvEngine = new CctvSurveillanceEngine();
})();
