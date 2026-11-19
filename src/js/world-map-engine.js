/**
 * Hacker City // Pilar 2: Mapa-Múndi Interativo, Rotas de Bounce Geográficas & Guerra de Territórios
 * Mapeia 50+ POPs globais, conexões submarinas/terrestres, cálculo de Trace Rate com base na rota
 * e disputa de influência regional entre clãs/facções com bônus operacionais.
 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // 52 POPs/Cidades globais com coordenadas no plano SVG 960x500 (Projeção Equirretangular simplificada)
  const WORLD_POPS = [
    // Américas
    { id: 'sao_paulo', name: 'São Paulo', country: 'Brasil', region: 'sa', x: 310, y: 360, regionName: 'América do Sul', bonus: '+15% anonimato contra bancos locais' },
    { id: 'rio_de_janeiro', name: 'Rio de Janeiro', country: 'Brasil', region: 'sa', x: 325, y: 350, regionName: 'América do Sul', bonus: '+10% extração de Bitcoins' },
    { id: 'buenos_aires', name: 'Buenos Aires', country: 'Argentina', region: 'sa', x: 295, y: 400, regionName: 'América do Sul', bonus: '+12% velocidade de firewall' },
    { id: 'santiago', name: 'Santiago', country: 'Chile', region: 'sa', x: 275, y: 395, regionName: 'América do Sul', bonus: '+10% defesa contra DDoS' },
    { id: 'bogota', name: 'Bogotá', country: 'Colômbia', region: 'sa', x: 260, y: 280, regionName: 'América do Sul', bonus: '+15% evasão de rastreio' },
    { id: 'lima', name: 'Lima', country: 'Peru', region: 'sa', x: 255, y: 320, regionName: 'América do Sul', bonus: '+10% vazão de minerador' },
    
    // América do Norte
    { id: 'silicon_valley', name: 'Vale do Silício', country: 'EUA', region: 'na', x: 160, y: 175, regionName: 'América do Norte', bonus: '+25% velocidade em quebra de senhas' },
    { id: 'new_york', name: 'Nova York', country: 'EUA', region: 'na', x: 265, y: 165, regionName: 'América do Norte', bonus: '+20% rendimento de exploração bancária' },
    { id: 'washington', name: 'Washington D.C.', country: 'EUA', region: 'na', x: 255, y: 180, regionName: 'América do Norte', bonus: '+20% acesso a relatórios confidenciais' },
    { id: 'chicago', name: 'Chicago', country: 'EUA', region: 'na', x: 230, y: 160, regionName: 'América do Norte', bonus: '+15% banda larga de botnet' },
    { id: 'dallas', name: 'Dallas', country: 'EUA', region: 'na', x: 205, y: 200, regionName: 'América do Norte', bonus: '+12% poder de hash' },
    { id: 'miami', name: 'Miami', country: 'EUA', region: 'na', x: 245, y: 220, regionName: 'América do Norte', bonus: '+18% juros em contas de laranjas' },
    { id: 'seattle', name: 'Seattle', country: 'EUA', region: 'na', x: 165, y: 140, regionName: 'América do Norte', bonus: '+15% velocidade de download' },
    { id: 'toronto', name: 'Toronto', country: 'Canadá', region: 'na', x: 250, y: 150, regionName: 'América do Norte', bonus: '+15% mitigação de congelamento bancário' },
    { id: 'vancouver', name: 'Vancouver', country: 'Canadá', region: 'na', x: 160, y: 130, regionName: 'América do Norte', bonus: '+12% estabilidade de proxy' },
    { id: 'mexico_city', name: 'Cidade do México', country: 'México', region: 'na', x: 195, y: 235, regionName: 'América do Norte', bonus: '+14% camuflagem de IP' },

    // Europa
    { id: 'london', name: 'Londres', country: 'Reino Unido', region: 'eu', x: 470, y: 145, regionName: 'Europa', bonus: '+20% lucro em transferências Swift' },
    { id: 'frankfurt', name: 'Frankfurt', country: 'Alemanha', region: 'eu', x: 505, y: 150, regionName: 'Europa', bonus: '+25% rendimento de nós bancários' },
    { id: 'amsterdam', name: 'Amsterdã', country: 'Holanda', region: 'eu', x: 490, y: 140, regionName: 'Europa', bonus: '+30% tráfego blindado offshore' },
    { id: 'paris', name: 'Paris', country: 'França', region: 'eu', x: 485, y: 160, regionName: 'Europa', bonus: '+15% redução de rastro policial' },
    { id: 'zurich', name: 'Zurique', country: 'Suíça', region: 'eu', x: 505, y: 168, regionName: 'Europa', bonus: '+35% sigilo absoluto em contas bancárias' },
    { id: 'madrid', name: 'Madrid', country: 'Espanha', region: 'eu', x: 465, y: 185, regionName: 'Europa', bonus: '+12% velocidade de compilação' },
    { id: 'rome', name: 'Roma', country: 'Itália', region: 'eu', x: 515, y: 185, regionName: 'Europa', bonus: '+14% vazão de sniffer de rede' },
    { id: 'stockholm', name: 'Estocolmo', country: 'Suécia', region: 'eu', x: 520, y: 110, regionName: 'Europa', bonus: '+20% latência reduzida no norte' },
    { id: 'oslo', name: 'Oslo', country: 'Noruega', region: 'eu', x: 500, y: 110, regionName: 'Europa', bonus: '+15% resiliência de nós de backup' },
    { id: 'helsinki', name: 'Helsinque', country: 'Finlândia', region: 'eu', x: 545, y: 105, regionName: 'Europa', bonus: '+18% taxa de sucesso de payloads' },
    { id: 'warsaw', name: 'Varsóvia', country: 'Polônia', region: 'eu', x: 535, y: 145, regionName: 'Europa', bonus: '+15% poder de fogo em DDoS' },
    { id: 'moscow', name: 'Moscou', country: 'Rússia', region: 'eu', x: 585, y: 130, regionName: 'Europa', bonus: '+40% imunidade contra mandados do FBI' },
    { id: 'saint_petersburg', name: 'São Petersburgo', country: 'Rússia', region: 'eu', x: 565, y: 118, regionName: 'Europa', bonus: '+25% evasão de blacklist' },
    { id: 'dublin', name: 'Dublin', country: 'Irlanda', region: 'eu', x: 450, y: 140, regionName: 'Europa', bonus: '+18% otimização de banda de saída' },

    // Ásia
    { id: 'tokyo', name: 'Tóquio', country: 'Japão', region: 'asia', x: 835, y: 190, regionName: 'Ásia-Pacífico', bonus: '+30% throughput de botnet militar' },
    { id: 'seoul', name: 'Seul', country: 'Coreia do Sul', region: 'asia', x: 800, y: 185, regionName: 'Ásia-Pacífico', bonus: '+35% velocidade de conexão de rede' },
    { id: 'singapore', name: 'Cingapura', country: 'Cingapura', region: 'asia', x: 740, y: 295, regionName: 'Ásia-Pacífico', bonus: '+30% largura de banda e troca rápida' },
    { id: 'hong_kong', name: 'Hong Kong', country: 'Hong Kong', region: 'asia', x: 770, y: 228, regionName: 'Ásia-Pacífico', bonus: '+25% rendimento em lavagem de dinheiro' },
    { id: 'beijing', name: 'Pequim', country: 'China', region: 'asia', x: 765, y: 175, regionName: 'Ásia-Pacífico', bonus: '+25% muralha contra contra-ataques' },
    { id: 'shanghai', name: 'Xangai', country: 'China', region: 'asia', x: 785, y: 205, regionName: 'Ásia-Pacífico', bonus: '+22% força de quebra de hash SHA' },
    { id: 'taipei', name: 'Taipei', country: 'Taiwan', region: 'asia', x: 795, y: 225, regionName: 'Ásia-Pacífico', bonus: '+28% clock boost em processadores' },
    { id: 'mumbai', name: 'Mumbai', country: 'Índia', region: 'asia', x: 670, y: 235, regionName: 'Ásia-Pacífico', bonus: '+15% geração de tarefas paralelas' },
    { id: 'bangalore', name: 'Bangalore', country: 'Índia', region: 'asia', x: 680, y: 255, regionName: 'Ásia-Pacífico', bonus: '+20% eficiência de scripts Python' },
    { id: 'dubai', name: 'Dubai', country: 'Emirados Árabes', region: 'asia', x: 625, y: 220, regionName: 'Oriente Médio', bonus: '+25% sigilo financeiro em cripto' },
    { id: 'tel_aviv', name: 'Tel Aviv', country: 'Israel', region: 'asia', x: 575, y: 205, regionName: 'Oriente Médio', bonus: '+30% descoberta de Zero-Days' },
    { id: 'bangkok', name: 'Bangkok', country: 'Tailândia', region: 'asia', x: 745, y: 250, regionName: 'Ásia-Pacífico', bonus: '+16% recuperação de arquivos deletados' },

    // Oceania
    { id: 'sydney', name: 'Sydney', country: 'Austrália', region: 'oc', x: 870, y: 410, regionName: 'Oceania', bonus: '+20% estabilidade de proxy transoceânico' },
    { id: 'melbourne', name: 'Melbourne', country: 'Austrália', region: 'oc', x: 855, y: 425, regionName: 'Oceania', bonus: '+18% tempo extra antes de detecção' },
    { id: 'auckland', name: 'Auckland', country: 'Nova Zelândia', region: 'oc', x: 915, y: 435, regionName: 'Oceania', bonus: '+22% isolamento de túnel SSH' },

    // África
    { id: 'johannesburg', name: 'Joanesburgo', country: 'África do Sul', region: 'af', x: 535, y: 395, regionName: 'África', bonus: '+18% eficiência de mineração solar' },
    { id: 'cairo', name: 'Cairo', country: 'Egito', region: 'af', x: 550, y: 210, regionName: 'África', bonus: '+15% conexões satelitais alternativas' },
    { id: 'lagos', name: 'Lagos', country: 'Nigéria', region: 'af', x: 485, y: 275, regionName: 'África', bonus: '+16% geração de campanhas de phishing' },
    { id: 'nairobi', name: 'Nairóbi', country: 'Quênia', region: 'af', x: 565, y: 295, regionName: 'África', bonus: '+14% velocidade de relé móvel' },
    { id: 'casablanca', name: 'Casablanca', country: 'Marrocos', region: 'af', x: 455, y: 205, regionName: 'África', bonus: '+15% blindagem costeira' }
  ];

  // Principais cabos submarinos e rotas troncos
  const TRUNK_LINES = [
    ['sao_paulo', 'rio_de_janeiro'],
    ['sao_paulo', 'buenos_aires'],
    ['buenos_aires', 'santiago'],
    ['sao_paulo', 'miami'],
    ['rio_de_janeiro', 'casablanca'],
    ['miami', 'new_york'],
    ['new_york', 'london'],
    ['new_york', 'frankfurt'],
    ['new_york', 'washington'],
    ['washington', 'dallas'],
    ['dallas', 'silicon_valley'],
    ['silicon_valley', 'seattle'],
    ['silicon_valley', 'tokyo'],
    ['silicon_valley', 'seoul'],
    ['seattle', 'vancouver'],
    ['toronto', 'new_york'],
    ['london', 'amsterdam'],
    ['amsterdam', 'frankfurt'],
    ['frankfurt', 'zurich'],
    ['frankfurt', 'paris'],
    ['paris', 'madrid'],
    ['madrid', 'casablanca'],
    ['frankfurt', 'warsaw'],
    ['warsaw', 'moscow'],
    ['moscow', 'saint_petersburg'],
    ['stockholm', 'helsinki'],
    ['frankfurt', 'rome'],
    ['rome', 'cairo'],
    ['cairo', 'dubai'],
    ['dubai', 'mumbai'],
    ['mumbai', 'singapore'],
    ['singapore', 'hong_kong'],
    ['hong_kong', 'shanghai'],
    ['shanghai', 'beijing'],
    ['shanghai', 'taipei'],
    ['taipei', 'tokyo'],
    ['seoul', 'tokyo'],
    ['singapore', 'sydney'],
    ['sydney', 'auckland'],
    ['cairo', 'nairobi'],
    ['nairobi', 'johannesburg'],
    ['lagos', 'johannesburg']
  ];

  const FACTIONS = [
    { id: 'syndicate', name: 'The Syndicate', color: '#ef4444', icon: '☠️' },
    { id: 'lulzsec', name: 'LulzSec Coalition', color: '#f59e0b', icon: '🎭' },
    { id: 'cicada', name: 'Cicada 3301', color: '#38bdf8', icon: '🦋' },
    { id: 'player_clan', name: 'Seu Clã / Aliados', color: '#35b877', icon: '⚡' }
  ];

  class WorldMapEngine {
    constructor() {
      this.pops = WORLD_POPS;
      this.bounceRoute = ['sao_paulo']; // Nós da rota atual de saltos
      this.territoryControl = {};
      this.selectedPop = null;
      this.isModalOpen = false;
      this.init();
    }

    init() {
      this.loadState();
      if (Object.keys(this.territoryControl).length === 0) {
        this.seedTerritoryControl();
      }
    }

    storageKey() {
      const uid = (window.currentProfile && window.currentProfile.id) || 'guest';
      return `HC_WORLD_MAP_${uid}`;
    }

    loadState() {
      try {
        const raw = localStorage.getItem(this.storageKey());
        if (raw) {
          const data = JSON.parse(raw);
          this.bounceRoute = Array.isArray(data.bounceRoute) && data.bounceRoute.length > 0 ? data.bounceRoute : ['sao_paulo'];
          this.territoryControl = data.territoryControl || {};
        }
      } catch (e) {}
    }

    saveState() {
      try {
        localStorage.setItem(this.storageKey(), JSON.stringify({
          bounceRoute: this.bounceRoute,
          territoryControl: this.territoryControl
        }));
      } catch (e) {}
    }

    seedTerritoryControl() {
      // Distribui controle procedural das regiões
      const regions = ['América do Sul', 'América do Norte', 'Europa', 'Ásia-Pacífico', 'Oriente Médio', 'Oceania', 'África'];
      const defaultAssignments = {
        'América do Sul': { faction: 'player_clan', influence: 72 },
        'América do Norte': { faction: 'lulzsec', influence: 64 },
        'Europa': { faction: 'cicada', influence: 85 },
        'Ásia-Pacífico': { faction: 'syndicate', influence: 78 },
        'Oriente Médio': { faction: 'syndicate', influence: 55 },
        'Oceania': { faction: 'cicada', influence: 60 },
        'África': { faction: 'player_clan', influence: 52 }
      };

      this.territoryControl = defaultAssignments;
      this.saveState();
    }

    // Calcula bônus e modificador de rastreamento com base na rota de bounce
    getBounceStats() {
      const hops = this.bounceRoute.length;
      // Cada salto além do 1º reduz o rastreamento em 18% (com teto de 85% de redução)
      const traceReduction = Math.min(85, Math.max(0, (hops - 1) * 18));
      // Cada salto adiciona 22ms a 45ms de ping
      const avgPing = 12 + hops * 32;

      // Coleta bônus de regiões controladas pelo jogador
      const activeBonuses = [];
      for (const [reg, data] of Object.entries(this.territoryControl)) {
        if (data.faction === 'player_clan') {
          activeBonuses.push(`${reg}: Influência ${data.influence}%`);
        }
      }

      return {
        hops,
        traceReduction,
        avgPing,
        activeBonuses
      };
    }

    // Adiciona nó à rota de saltos
    toggleBounceHop(popId) {
      const idx = this.bounceRoute.indexOf(popId);
      if (idx !== -1) {
        if (this.bounceRoute.length > 1) {
          this.bounceRoute.splice(idx, 1);
          if (window.showToast) window.showToast(`Salto removido da rota: ${popId}`, 'info');
        } else {
          if (window.showToast) window.showToast('Sua rota precisa de pelo menos 1 nó de saída!', 'warning');
        }
      } else {
        if (this.bounceRoute.length >= 8) {
          if (window.showToast) window.showToast('Limite de 8 saltos na cadeia de bounce atingido!', 'warning');
          return;
        }
        this.bounceRoute.push(popId);
        if (window.showToast) window.showToast(`⚡ Salto adicionado à rota: ${popId}! Rastros reduzidos.`, 'success');
      }

      if (window.audioEngine && typeof window.audioEngine.playKeyClick === 'function') {
        window.audioEngine.playKeyClick();
      }

      this.saveState();
      this.renderUI();
    }

    // Executa infiltração para aumentar controle territorial de uma região
    infiltrateRegion(regionName) {
      const curBal = window.currentWallet ? parseFloat(window.currentWallet.balance || 0) : 0;
      const cost = 2500;

      if (curBal < cost) {
        if (window.showToast) window.showToast(`Fundos insuficientes! Infiltração requer ${cost} HC.`, 'danger');
        return;
      }

      // Debita custo
      if (window.currentWallet) {
        window.currentWallet.balance = Math.max(0, +(curBal - cost).toFixed(2));
      }
      if (window.currentProfile) {
        window.currentProfile.wallet_balance = Math.max(0, (window.currentProfile.wallet_balance || 0) - cost);
      }

      const regData = this.territoryControl[regionName] || { faction: 'syndicate', influence: 50 };
      if (regData.faction === 'player_clan') {
        regData.influence = Math.min(100, regData.influence + 12);
      } else {
        regData.influence -= 18;
        if (regData.influence <= 0) {
          regData.faction = 'player_clan';
          regData.influence = 25;
          if (window.showToast) window.showToast(`🚩 VITÓRIA! Seu clã tomou o controle territorial de ${regionName}!`, 'success');
        }
      }

      this.territoryControl[regionName] = regData;
      this.saveState();

      if (window.audioEngine && typeof window.audioEngine.playCashChime === 'function') {
        window.audioEngine.playCashChime();
      }
      if (window.showToast) {
        window.showToast(`📡 Infiltração executada em ${regionName}! Nova influência: ${regData.influence}%.`, 'info');
      }

      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
    }

    openModal() {
      this.isModalOpen = true;
      let modal = document.getElementById('world-map-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'world-map-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(4, 7, 13, 0.85)';
        modal.style.backdropFilter = 'blur(6px)';
        modal.style.zIndex = '9999';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.innerHTML = `
          <div style="background:#0e141f;border:1px solid #233247;border-radius:12px;width:1050px;max-width:96vw;box-shadow:0 20px 50px rgba(0,0,0,0.7);overflow:hidden;font-family:sans-serif;color:#e2e8f0;">
            <div style="background:#151e2e;padding:12px 18px;border-bottom:1px solid #233247;display:flex;justify-content:space-between;align-items:center;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:1.15rem;">🌐</span>
                <strong style="font-size:0.98rem;letter-spacing:0.02em;color:#38bdf8;">MAPA-MÚNDI TÁTICO // CABOS SUBMARINOS, BOUNCE &amp; GUERRA DE CLÃS</strong>
              </div>
              <button id="close-world-map-btn" style="background:transparent;border:none;color:#8e9db4;font-size:1.2rem;cursor:pointer;padding:0 6px;">✕</button>
            </div>
            <div id="world-map-body" style="padding:16px;max-height:85vh;overflow-y:auto;"></div>
          </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('close-world-map-btn').onclick = () => {
          modal.style.display = 'none';
          this.isModalOpen = false;
        };
      } else {
        modal.style.display = 'flex';
      }

      this.renderUI();
    }

    renderHtml() {
      const stats = this.getBounceStats();
      const popMap = new Map(this.pops.map((p) => [p.id, p]));

      // Linhas troncos submarinas
      const trunkLinesSvg = TRUNK_LINES.map(([fromId, toId]) => {
        const p1 = popMap.get(fromId);
        const p2 = popMap.get(toId);
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#1e2c40" stroke-width="1.2" opacity="0.65" />`;
      }).join('');

      // Linhas da rota de saltos (Bounce Chaining) em destaque ciano pulsante
      let bounceLinesSvg = '';
      for (let i = 0; i < this.bounceRoute.length - 1; i++) {
        const p1 = popMap.get(this.bounceRoute[i]);
        const p2 = popMap.get(this.bounceRoute[i + 1]);
        if (p1 && p2) {
          bounceLinesSvg += `
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="5 3" />
          `;
        }
      }

      // Renderiza os POPs como círculos
      const popsSvg = this.pops.map((p) => {
        const isSelected = this.bounceRoute.includes(p.id);
        const routeIdx = this.bounceRoute.indexOf(p.id);
        const regData = this.territoryControl[p.regionName] || { faction: 'syndicate', influence: 50 };
        const fac = FACTIONS.find((f) => f.id === regData.faction) || FACTIONS[0];

        let circleFill = isSelected ? '#38bdf8' : fac.color;
        let circleR = isSelected ? 6.5 : 4;

        return `
          <g style="cursor:pointer;" onclick="window.worldMapEngine.toggleBounceHop('${esc(p.id)}')">
            <circle cx="${p.x}" cy="${p.y}" r="${circleR}" fill="${circleFill}" stroke="#0b1017" stroke-width="1.5">
              <title>${esc(p.name)} (${esc(p.country)}) - ${esc(p.bonus)} | Clique para alternar salto</title>
            </circle>
            ${isSelected ? `
              <circle cx="${p.x}" cy="${p.y}" r="11" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.8">
                <animate attributeName="r" values="7;14;7" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.9;0.1;0.9" dur="2s" repeatCount="indefinite"/>
              </circle>
              <text x="${p.x}" y="${p.y - 9}" text-anchor="middle" fill="#38bdf8" font-size="9" font-family="monospace" font-weight="bold">${routeIdx + 1}º</text>
            ` : ''}
          </g>
        `;
      }).join('');

      // Cards de territórios e influência
      const territoryCards = Object.entries(this.territoryControl).map(([regName, data]) => {
        const fac = FACTIONS.find((f) => f.id === data.faction) || FACTIONS[0];
        const isMine = data.faction === 'player_clan';

        return `
          <div style="background:#131b27;border:1px solid ${isMine ? '#35b877' : '#233247'};border-radius:6px;padding:10px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="display:flex;align-items:center;gap:6px;">
                <span style="font-size:0.9rem;">${fac.icon}</span>
                <strong style="color:#fff;font-size:0.86rem;">${esc(regName)}</strong>
              </div>
              <div style="font-size:0.75rem;color:${fac.color};margin-top:2px;">
                Controlado por: <strong>${esc(fac.name)}</strong> (${data.influence}%)
              </div>
              <div style="font-size:0.72rem;color:#94a3b8;margin-top:2px;">
                ${isMine ? '⚡ Bônus regional ativo para você e seu clã' : 'Infiltre nós para roubar o controle desta zona'}
              </div>
            </div>

            <button type="button" class="hc-btn ghost sm" style="font-size:0.75rem;color:${isMine ? '#35b877' : '#f59e0b'};" onclick="window.worldMapEngine.infiltrateRegion('${esc(regName)}')">
              ${isMine ? 'Reforçar (+12%)' : 'Infiltrar (-18%)'}
            </button>
          </div>
        `;
      }).join('');

      return `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <!-- Telemetria de Bounce & Ping -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;background:#080c13;padding:12px;border-radius:8px;border:1px solid #1f2a3a;">
            <div>
              <div style="font-size:0.72rem;color:#8e9db4;text-transform:uppercase;">Cadeia de Bounce Atual</div>
              <div style="font-size:1.15rem;font-weight:bold;color:#38bdf8;">${stats.hops} Saltos Globais</div>
            </div>
            <div>
              <div style="font-size:0.72rem;color:#8e9db4;text-transform:uppercase;">Evasão de Rastreio (Trace)</div>
              <div style="font-size:1.15rem;font-weight:bold;color:#35b877;">-${stats.traceReduction}% Detecção</div>
            </div>
            <div>
              <div style="font-size:0.72rem;color:#8e9db4;text-transform:uppercase;">Latência Acumulada</div>
              <div style="font-size:1.15rem;font-weight:bold;color:#f59e0b;">${stats.avgPing} ms</div>
            </div>
            <div>
              <div style="font-size:0.72rem;color:#8e9db4;text-transform:uppercase;">Regiões sob seu Clã</div>
              <div style="font-size:1.15rem;font-weight:bold;color:#a855f7;">${stats.activeBonuses.length} Territórios</div>
            </div>
          </div>

          <!-- Mapa-Múndi Tático SVG -->
          <div style="background:#070a10;border:1px solid #1f2b3b;border-radius:8px;padding:8px;position:relative;overflow-x:auto;">
            <div style="display:flex;justify-content:space-between;padding:4px 8px;font-size:0.75rem;font-family:monospace;color:#64748b;">
              <span>CABOS SUBMARINOS &amp; ROTEAMENTO BGP EM TEMPO REAL</span>
              <span>Clique nos pontos do mapa para adicionar/remover da cadeia de saltos</span>
            </div>
            <svg width="960" height="480" viewBox="0 0 960 480" style="display:block;margin:0 auto;background:#05070c;border-radius:6px;">
              <!-- Grade de fundo -->
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0e1724" stroke-width="0.8"/>
                </pattern>
              </defs>
              <rect width="960" height="480" fill="url(#grid)" />

              <!-- Cabos submarinos troncos -->
              ${trunkLinesSvg}

              <!-- Cadeia de saltos ativa -->
              ${bounceLinesSvg}

              <!-- POPs Globais -->
              ${popsSvg}
            </svg>
          </div>

          <!-- Detalhes da Rota Atual -->
          <div style="background:#101723;border:1px solid #233247;border-radius:8px;padding:12px;">
            <div style="font-size:0.8rem;color:#94a3b8;margin-bottom:6px;font-family:monospace;">
              ROTA DE SALTO ATUAL: 
              ${this.bounceRoute.map((id, i) => {
                const p = popMap.get(id);
                return `<span style="color:#38bdf8;font-weight:bold;">${i + 1}. ${p ? p.name : id}</span>`;
              }).join(' ➔ ')}
            </div>
            <div style="font-size:0.75rem;color:#64748b;">
              💡 Dica tática: Intercale saltos entre Américas, Europa e Ásia para confundir o rastreamento policial do FBI e de jogadores rivais.
            </div>
          </div>

          <!-- Controle de Territórios & Bônus de Clãs -->
          <div>
            <h4 style="margin:0 0 8px 0;font-size:0.9rem;color:#e2e8f0;">DISPUTA TERRITORIAL DE CLÃS // GUERRA REGIONAL DE INFLUÊNCIA</h4>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:8px;">
              ${territoryCards}
            </div>
          </div>
        </div>
      `;
    }

    renderUI() {
      const container = document.getElementById('world-map-body');
      if (container) {
        container.innerHTML = this.renderHtml();
      }
    }
  }

  window.worldMapEngine = new WorldMapEngine();
  window.openWorldMapModal = () => window.worldMapEngine.openModal();
})();
