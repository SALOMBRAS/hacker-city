/**
 * Hacker City // Pilar 2: Mapa-Múndi & Rotas de Saltos (50+ POPs, Continentes SVG Reais & Territórios)
 * Página nativa limpa seguindo o Design System ("Arroz com Feijão Bem Feito").
 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Silhuetas vetoriais estilizadas dos continentes (ViewBox 960 x 460)
  const CONTINENT_PATHS = [
    // América do Norte + América Central
    'M 72 68 L 138 52 L 210 56 L 268 78 L 288 118 L 258 158 L 232 192 L 204 212 L 196 238 L 222 256 L 210 264 L 178 242 L 154 206 L 132 174 L 118 140 L 82 114 Z',
    // Groenlândia
    'M 295 32 L 358 26 L 372 56 L 332 76 L 292 60 Z',
    // América do Sul
    'M 236 262 L 284 258 L 336 294 L 344 338 L 312 392 L 282 436 L 266 432 L 262 378 L 242 324 L 228 286 Z',
    // Reino Unido & Irlanda
    'M 436 108 L 454 104 L 458 128 L 438 130 Z',
    // Europa Continental + Escandinávia
    'M 464 118 L 478 78 L 518 58 L 552 72 L 568 104 L 562 152 L 534 176 L 496 178 L 456 174 L 452 146 Z',
    // África + Madagascar
    'M 448 188 L 516 186 L 566 206 L 594 256 L 578 322 L 548 390 L 514 392 L 498 334 L 482 282 L 442 262 L 434 218 Z M 594 336 L 608 332 L 606 366 L 592 368 Z',
    // Eurásia + Rússia + Oriente Médio + Índia + Sudeste Asiático
    'M 566 74 L 664 56 L 782 58 L 878 82 L 892 122 L 844 156 L 818 198 L 792 238 L 758 282 L 736 286 L 718 246 L 682 268 L 656 228 L 622 234 L 584 206 L 564 154 Z',
    // Japão & Taiwan
    'M 828 158 L 844 166 L 836 196 L 820 190 Z M 790 218 L 800 222 L 796 234 L 786 230 Z',
    // Arquipélago Indonésio / Filipinas
    'M 738 294 L 778 298 L 814 312 L 806 324 L 756 318 L 732 306 Z M 798 250 L 812 256 L 808 278 L 794 272 Z',
    // Austrália & Nova Zelândia
    'M 776 342 L 848 336 L 882 368 L 872 412 L 814 416 L 772 388 Z M 904 412 L 924 406 L 920 434 L 900 436 Z'
  ];

  // 50 POPs calibrados sobre as silhuetas continentais (960 x 460)
  const WORLD_POPS = [
    // América do Sul
    { id: 'sao_paulo', name: 'São Paulo', country: 'Brasil', region: 'sa', x: 312, y: 356, regionName: 'América do Sul', bonus: '+15% anonimato contra bancos locais' },
    { id: 'rio_de_janeiro', name: 'Rio de Janeiro', country: 'Brasil', region: 'sa', x: 326, y: 346, regionName: 'América do Sul', bonus: '+10% extração de Bitcoins' },
    { id: 'buenos_aires', name: 'Buenos Aires', country: 'Argentina', region: 'sa', x: 292, y: 394, regionName: 'América do Sul', bonus: '+12% resposta de firewall' },
    { id: 'santiago', name: 'Santiago', country: 'Chile', region: 'sa', x: 270, y: 390, regionName: 'América do Sul', bonus: '+10% mitigação de DDoS' },
    { id: 'bogota', name: 'Bogotá', country: 'Colômbia', region: 'sa', x: 252, y: 276, regionName: 'América do Sul', bonus: '+15% evasão de rastreio' },
    { id: 'lima', name: 'Lima', country: 'Peru', region: 'sa', x: 246, y: 322, regionName: 'América do Sul', bonus: '+10% vazão de mineração' },

    // América do Norte
    { id: 'silicon_valley', name: 'Vale do Silício', country: 'EUA', region: 'na', x: 146, y: 168, regionName: 'América do Norte', bonus: '+25% velocidade em quebra de senhas' },
    { id: 'new_york', name: 'Nova York', country: 'EUA', region: 'na', x: 248, y: 154, regionName: 'América do Norte', bonus: '+20% rendimento bancário' },
    { id: 'washington', name: 'Washington D.C.', country: 'EUA', region: 'na', x: 238, y: 168, regionName: 'América do Norte', bonus: '+20% acesso a bases federais' },
    { id: 'chicago', name: 'Chicago', country: 'EUA', region: 'na', x: 214, y: 148, regionName: 'América do Norte', bonus: '+15% banda de botnet' },
    { id: 'dallas', name: 'Dallas', country: 'EUA', region: 'na', x: 196, y: 188, regionName: 'América do Norte', bonus: '+12% poder de hash' },
    { id: 'miami', name: 'Miami', country: 'EUA', region: 'na', x: 232, y: 206, regionName: 'América do Norte', bonus: '+18% sigilo em contas intermediárias' },
    { id: 'seattle', name: 'Seattle', country: 'EUA', region: 'na', x: 148, y: 132, regionName: 'América do Norte', bonus: '+15% velocidade de download' },
    { id: 'toronto', name: 'Toronto', country: 'Canadá', region: 'na', x: 234, y: 138, regionName: 'América do Norte', bonus: '+15% proteção contra bloqueio' },
    { id: 'vancouver', name: 'Vancouver', country: 'Canadá', region: 'na', x: 144, y: 116, regionName: 'América do Norte', bonus: '+12% estabilidade de proxy' },
    { id: 'mexico_city', name: 'Cidade do México', country: 'México', region: 'na', x: 186, y: 224, regionName: 'América do Norte', bonus: '+14% camuflagem de rota' },

    // Europa
    { id: 'london', name: 'Londres', country: 'Reino Unido', region: 'eu', x: 452, y: 124, regionName: 'Europa', bonus: '+20% eficiência em transferências' },
    { id: 'dublin', name: 'Dublin', country: 'Irlanda', region: 'eu', x: 438, y: 120, regionName: 'Europa', bonus: '+18% banda de saída' },
    { id: 'amsterdam', name: 'Amsterdã', country: 'Holanda', region: 'eu', x: 476, y: 124, regionName: 'Europa', bonus: '+30% tráfego blindado' },
    { id: 'frankfurt', name: 'Frankfurt', country: 'Alemanha', region: 'eu', x: 492, y: 132, regionName: 'Europa', bonus: '+25% velocidade de backbone' },
    { id: 'paris', name: 'Paris', country: 'França', region: 'eu', x: 472, y: 142, regionName: 'Europa', bonus: '+15% redução de rastro' },
    { id: 'zurich', name: 'Zurique', country: 'Suíça', region: 'eu', x: 492, y: 148, regionName: 'Europa', bonus: '+35% sigilo bancário offshore' },
    { id: 'madrid', name: 'Madrid', country: 'Espanha', region: 'eu', x: 456, y: 166, regionName: 'Europa', bonus: '+12% velocidade de compilação' },
    { id: 'rome', name: 'Roma', country: 'Itália', region: 'eu', x: 504, y: 166, regionName: 'Europa', bonus: '+14% captura de pacotes' },
    { id: 'oslo', name: 'Oslo', country: 'Noruega', region: 'eu', x: 490, y: 88, regionName: 'Europa', bonus: '+15% resiliência de backup' },
    { id: 'stockholm', name: 'Estocolmo', country: 'Suécia', region: 'eu', x: 512, y: 92, regionName: 'Europa', bonus: '+20% baixa latência nórdica' },
    { id: 'helsinki', name: 'Helsinque', country: 'Finlândia', region: 'eu', x: 534, y: 88, regionName: 'Europa', bonus: '+18% precisão de exploits' },
    { id: 'warsaw', name: 'Varsóvia', country: 'Polônia', region: 'eu', x: 524, y: 128, regionName: 'Europa', bonus: '+15% potência em sobrecarga' },
    { id: 'saint_petersburg', name: 'São Petersburgo', country: 'Rússia', region: 'eu', x: 554, y: 96, regionName: 'Europa', bonus: '+25% evasão de listas' },
    { id: 'moscow', name: 'Moscou', country: 'Rússia', region: 'eu', x: 576, y: 114, regionName: 'Europa', bonus: '+40% resistência a mandados' },

    // Ásia & Oriente Médio
    { id: 'tel_aviv', name: 'Tel Aviv', country: 'Israel', region: 'asia', x: 568, y: 194, regionName: 'Oriente Médio', bonus: '+30% pesquisa de vulnerabilidades' },
    { id: 'dubai', name: 'Dubai', country: 'Emirados Árabes', region: 'asia', x: 618, y: 214, regionName: 'Oriente Médio', bonus: '+25% liquidez em cripto' },
    { id: 'mumbai', name: 'Mumbai', country: 'Índia', region: 'asia', x: 668, y: 232, regionName: 'Ásia-Pacífico', bonus: '+15% filas paralelas' },
    { id: 'bangalore', name: 'Bangalore', country: 'Índia', region: 'asia', x: 678, y: 252, regionName: 'Ásia-Pacífico', bonus: '+20% automação de scripts' },
    { id: 'bangkok', name: 'Bangkok', country: 'Tailândia', region: 'asia', x: 738, y: 248, regionName: 'Ásia-Pacífico', bonus: '+16% recuperação de dados' },
    { id: 'singapore', name: 'Cingapura', country: 'Cingapura', region: 'asia', x: 744, y: 286, regionName: 'Ásia-Pacífico', bonus: '+30% largura de banda asiática' },
    { id: 'hong_kong', name: 'Hong Kong', country: 'Hong Kong', region: 'asia', x: 772, y: 226, regionName: 'Ásia-Pacífico', bonus: '+25% câmbio instantâneo' },
    { id: 'taipei', name: 'Taipei', country: 'Taiwan', region: 'asia', x: 794, y: 224, regionName: 'Ásia-Pacífico', bonus: '+28% clock de CPU' },
    { id: 'shanghai', name: 'Xangai', country: 'China', region: 'asia', x: 786, y: 198, regionName: 'Ásia-Pacífico', bonus: '+22% quebra de hashes' },
    { id: 'beijing', name: 'Pequim', country: 'China', region: 'asia', x: 766, y: 166, regionName: 'Ásia-Pacífico', bonus: '+25% filtragem defensiva' },
    { id: 'seoul', name: 'Seul', country: 'Coreia do Sul', region: 'asia', x: 804, y: 174, regionName: 'Ásia-Pacífico', bonus: '+35% velocidade de fibra' },
    { id: 'tokyo', name: 'Tóquio', country: 'Japão', region: 'asia', x: 834, y: 178, regionName: 'Ásia-Pacífico', bonus: '+30% coordenação de botnet' },

    // Oceania
    { id: 'sydney', name: 'Sydney', country: 'Austrália', region: 'oc', x: 864, y: 392, regionName: 'Oceania', bonus: '+20% estabilidade transoceânica' },
    { id: 'melbourne', name: 'Melbourne', country: 'Austrália', region: 'oc', x: 844, y: 406, regionName: 'Oceania', bonus: '+18% atraso no rastreio' },
    { id: 'auckland', name: 'Auckland', country: 'Nova Zelândia', region: 'oc', x: 912, y: 418, regionName: 'Oceania', bonus: '+22% isolamento de túnel' },

    // África
    { id: 'casablanca', name: 'Casablanca', country: 'Marrocos', region: 'af', x: 448, y: 196, regionName: 'África', bonus: '+15% ponte atlântica' },
    { id: 'cairo', name: 'Cairo', country: 'Egito', region: 'af', x: 544, y: 202, regionName: 'África', bonus: '+15% rota mediterrânea' },
    { id: 'lagos', name: 'Lagos', country: 'Nigéria', region: 'af', x: 478, y: 268, regionName: 'África', bonus: '+16% engenharia social' },
    { id: 'nairobi', name: 'Nairóbi', country: 'Quênia', region: 'af', x: 564, y: 286, regionName: 'África', bonus: '+14% relé oriental' },
    { id: 'johannesburg', name: 'Joanesburgo', country: 'África do Sul', region: 'af', x: 534, y: 378, regionName: 'África', bonus: '+18% autonomia energética' }
  ];

  const TRUNK_LINES = [
    ['sao_paulo', 'rio_de_janeiro'], ['sao_paulo', 'buenos_aires'], ['buenos_aires', 'santiago'],
    ['sao_paulo', 'miami'], ['rio_de_janeiro', 'casablanca'], ['miami', 'new_york'],
    ['new_york', 'london'], ['new_york', 'frankfurt'], ['new_york', 'washington'],
    ['washington', 'dallas'], ['dallas', 'silicon_valley'], ['silicon_valley', 'seattle'],
    ['silicon_valley', 'tokyo'], ['seattle', 'vancouver'], ['toronto', 'new_york'],
    ['london', 'amsterdam'], ['amsterdam', 'frankfurt'], ['frankfurt', 'zurich'],
    ['frankfurt', 'paris'], ['paris', 'madrid'], ['madrid', 'casablanca'],
    ['frankfurt', 'warsaw'], ['warsaw', 'moscow'], ['moscow', 'saint_petersburg'],
    ['stockholm', 'helsinki'], ['frankfurt', 'rome'], ['rome', 'cairo'],
    ['cairo', 'dubai'], ['dubai', 'mumbai'], ['mumbai', 'singapore'],
    ['singapore', 'hong_kong'], ['hong_kong', 'shanghai'], ['shanghai', 'beijing'],
    ['shanghai', 'taipei'], ['taipei', 'tokyo'], ['seoul', 'tokyo'],
    ['singapore', 'sydney'], ['sydney', 'auckland'], ['cairo', 'nairobi'],
    ['nairobi', 'johannesburg'], ['lagos', 'johannesburg']
  ];

  const FACTIONS = [
    { id: 'syndicate', name: 'The Syndicate', color: '#d0443a', badgeCls: 'danger' },
    { id: 'lulzsec', name: 'LulzSec Coalition', color: '#f0a03a', badgeCls: 'warning' },
    { id: 'cicada', name: 'Cicada 3301', color: '#4b8fe0', badgeCls: 'info' },
    { id: 'player_clan', name: 'Seu Clã & Aliados', color: '#35b877', badgeCls: 'success' }
  ];

  class WorldMapEngine {
    constructor() {
      this.pops = WORLD_POPS;
      this.bounceRoute = ['sao_paulo'];
      this.territoryControl = {};
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
      this.territoryControl = {
        'América do Sul': { faction: 'player_clan', influence: 72 },
        'América do Norte': { faction: 'lulzsec', influence: 64 },
        'Europa': { faction: 'cicada', influence: 85 },
        'Ásia-Pacífico': { faction: 'syndicate', influence: 78 },
        'Oriente Médio': { faction: 'syndicate', influence: 55 },
        'Oceania': { faction: 'cicada', influence: 60 },
        'África': { faction: 'player_clan', influence: 52 }
      };
      this.saveState();
    }

    getBounceStats() {
      const hops = this.bounceRoute.length;
      const traceReduction = Math.min(85, Math.max(0, (hops - 1) * 18));
      const avgPing = 12 + hops * 32;
      const activeBonuses = [];
      for (const [reg, data] of Object.entries(this.territoryControl)) {
        if (data.faction === 'player_clan') {
          activeBonuses.push(`${reg} (${data.influence}%)`);
        }
      }
      return { hops, traceReduction, avgPing, activeBonuses };
    }

    resetBounceRoute() {
      this.bounceRoute = ['sao_paulo'];
      this.saveState();
      this.renderUI();
    }

    toggleBounceHop(popId) {
      const idx = this.bounceRoute.indexOf(popId);
      const pop = this.pops.find((p) => p.id === popId);
      const label = pop ? pop.name : popId;

      if (idx !== -1) {
        if (this.bounceRoute.length > 1) {
          this.bounceRoute.splice(idx, 1);
          if (window.showToast) window.showToast(`Salto removido: ${label}.`, 'info');
        } else {
          if (window.showToast) window.showToast('Mantenha pelo menos 1 ponto de origem na rota.', 'warning');
        }
      } else {
        if (this.bounceRoute.length >= 8) {
          if (window.showToast) window.showToast('Máximo de 8 saltos encadeados atingido.', 'warning');
          return;
        }
        this.bounceRoute.push(popId);
        if (window.showToast) window.showToast(`Salto adicionado: ${label}. Rastreamento reduzido.`, 'success');
      }

      if (window.audioEngine && typeof window.audioEngine.playKeyClick === 'function') {
        window.audioEngine.playKeyClick();
      }
      this.saveState();
      this.renderUI();
    }

    infiltrateRegion(regionName) {
      const curBal = window.currentWallet ? parseFloat(window.currentWallet.balance || 0) : 0;
      const cost = 2500;

      if (curBal < cost) {
        if (window.showToast) window.showToast(`Saldo insuficiente. A operação regional custa $2.500.`, 'danger');
        return;
      }

      if (window.currentWallet) {
        window.currentWallet.balance = Math.max(0, +(curBal - cost).toFixed(2));
      }

      const regData = this.territoryControl[regionName] || { faction: 'syndicate', influence: 50 };
      if (regData.faction === 'player_clan') {
        regData.influence = Math.min(100, regData.influence + 12);
      } else {
        regData.influence -= 18;
        if (regData.influence <= 0) {
          regData.faction = 'player_clan';
          regData.influence = 25;
          if (window.showToast) window.showToast(`Seu clã assumiu o controle de ${regionName}!`, 'success');
        }
      }

      this.territoryControl[regionName] = regData;
      this.saveState();

      if (window.audioEngine && typeof window.audioEngine.playCashChime === 'function') {
        window.audioEngine.playCashChime();
      }
      if (window.showToast) {
        window.showToast(`Infiltração em ${regionName} concluída (${regData.influence}%).`, 'info');
      }

      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
    }

    openModal() {
      this.isModalOpen = true;
      if (typeof window.navTo === 'function') {
        window.navTo('winWorldMap');
      }
      this.renderUI();
    }

    renderHtml() {
      const stats = this.getBounceStats();
      const popMap = new Map(this.pops.map((p) => [p.id, p]));

      const continentsSvg = CONTINENT_PATHS.map((d) =>
        `<path d="${d}" fill="#18202a" stroke="#263242" stroke-width="1.1" stroke-linejoin="round" />`
      ).join('');

      const trunkLinesSvg = TRUNK_LINES.map(([fromId, toId]) => {
        const p1 = popMap.get(fromId);
        const p2 = popMap.get(toId);
        if (!p1 || !p2) return '';
        const mx = Math.round((p1.x + p2.x) / 2);
        const my = Math.round((p1.y + p2.y) / 2 - Math.abs(p1.x - p2.x) * 0.08);
        return `<path d="M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}" fill="none" stroke="#253244" stroke-width="1.1" opacity="0.7" />`;
      }).join('');

      let bounceLinesSvg = '';
      for (let i = 0; i < this.bounceRoute.length - 1; i++) {
        const p1 = popMap.get(this.bounceRoute[i]);
        const p2 = popMap.get(this.bounceRoute[i + 1]);
        if (p1 && p2) {
          const mx = Math.round((p1.x + p2.x) / 2);
          const my = Math.round((p1.y + p2.y) / 2 - Math.abs(p1.x - p2.x) * 0.1);
          bounceLinesSvg += `<path d="M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}" fill="none" stroke="#5fd39a" stroke-width="2.2" stroke-dasharray="5 3" />`;
        }
      }

      const popsSvg = this.pops.map((p) => {
        const isSelected = this.bounceRoute.includes(p.id);
        const routeIdx = this.bounceRoute.indexOf(p.id);
        const regData = this.territoryControl[p.regionName] || { faction: 'syndicate', influence: 50 };
        const fac = FACTIONS.find((f) => f.id === regData.faction) || FACTIONS[0];
        const fill = isSelected ? '#5fd39a' : fac.color;
        const r = isSelected ? 5.5 : 3.4;

        return `
          <g style="cursor:pointer;" onclick="window.worldMapEngine.toggleBounceHop('${esc(p.id)}')">
            <circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${fill}" stroke="#0e1115" stroke-width="1.3">
              <title>${esc(p.name)}, ${esc(p.country)} — ${esc(p.bonus)} (clique para alternar salto)</title>
            </circle>
            ${isSelected ? `
              <circle cx="${p.x}" cy="${p.y}" r="9.5" fill="none" stroke="#5fd39a" stroke-width="1.1" opacity="0.65" />
              <rect x="${p.x - 38}" y="${p.y - 23}" width="76" height="14" rx="4" fill="#0e1115" stroke="#2c3a4b" stroke-width="0.8" opacity="0.92" />
              <text x="${p.x}" y="${p.y - 13}" text-anchor="middle" fill="#eceff3" font-size="9" font-family="JetBrains Mono, monospace" font-weight="600">${routeIdx + 1}. ${esc(p.name.slice(0, 10))}</text>
            ` : ''}
          </g>
        `;
      }).join('');

      const territoryRows = Object.entries(this.territoryControl).map(([regName, data]) => {
        const fac = FACTIONS.find((f) => f.id === data.faction) || FACTIONS[0];
        const isMine = data.faction === 'player_clan';

        return `
          <tr>
            <td><strong style="color: var(--hc-text);">${esc(regName)}</strong></td>
            <td><span class="hc-badge ${fac.badgeCls}">${esc(fac.name)}</span></td>
            <td style="min-width: 160px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div class="hc-progress ${isMine ? '' : 'info'}" style="flex: 1;"><span style="width: ${data.influence}%;"></span></div>
                <span class="mono" style="font-size: 12px; width: 38px; text-align: right;">${data.influence}%</span>
              </div>
            </td>
            <td style="font-size: 12.5px; color: var(--hc-text-2);">
              ${isMine ? 'Bônus regional ativo para seu clã' : 'Sob domínio rival'}
            </td>
            <td style="text-align: right;">
              <button type="button" class="hc-btn ${isMine ? 'ghost' : ''} sm" onclick="window.worldMapEngine.infiltrateRegion('${esc(regName)}')">
                ${isMine ? 'Reforçar ($2.500)' : 'Disputar ($2.500)'}
              </button>
            </td>
          </tr>
        `;
      }).join('');

      return `
        <div class="hc-stat-strip" style="margin-bottom: 18px;">
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Cadeia de saltos</div>
            <div class="hc-stat-value">${stats.hops} ${stats.hops === 1 ? 'salto' : 'saltos'}</div>
            <div class="hc-stat-sub">Máximo de 8 nós globais</div>
          </div>
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Redução de rastreio</div>
            <div class="hc-stat-value" style="color: var(--hc-accent-text);">-${stats.traceReduction}%</div>
            <div class="hc-stat-sub ok">Atraso na detecção policial</div>
          </div>
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Latência estimada</div>
            <div class="hc-stat-value">${stats.avgPing} ms</div>
            <div class="hc-stat-sub">Tempo de resposta da rota</div>
          </div>
          <div class="hc-stat-cell">
            <div class="hc-stat-label">Zonas aliadas</div>
            <div class="hc-stat-value">${stats.activeBonuses.length} de 7</div>
            <div class="hc-stat-sub">Regiões sob seu clã</div>
          </div>
        </div>

        <!-- Mapa-Múndi Vetorial com Continentes Reais -->
        <div class="hc-card" style="padding: 14px 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div>
              <strong style="font-size: 14px;">Roteamento global (${this.pops.length} pontos de presença)</strong>
              <span style="font-size: 12.5px; color: var(--hc-text-3); margin-left: 8px;">Clique em qualquer cidade no mapa para incluir ou remover da sua rota</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; font-size: 11.5px; color: var(--hc-text-3);">
              <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#35b877;margin-right:4px;"></span>Seu Clã</span>
              <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#4b8fe0;margin-right:4px;"></span>Cicada</span>
              <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f0a03a;margin-right:4px;"></span>LulzSec</span>
              <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#d0443a;margin-right:4px;"></span>Syndicate</span>
            </div>
          </div>

          <div style="background: #0d1117; border: 1px solid var(--hc-border-subtle); border-radius: 8px; overflow-x: auto;">
            <svg width="960" height="460" viewBox="0 0 960 460" style="display: block; width: 100%; height: auto; min-width: 720px;">
              <defs>
                <pattern id="hcWorldGrid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#131922" stroke-width="0.8" />
                </pattern>
              </defs>
              <rect width="960" height="460" fill="url(#hcWorldGrid)" />
              <line x1="0" y1="248" x2="960" y2="248" stroke="#18222f" stroke-width="1" stroke-dasharray="4 4" />
              ${continentsSvg}
              ${trunkLinesSvg}
              ${bounceLinesSvg}
              ${popsSvg}
            </svg>
          </div>

          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--hc-border-subtle); display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
            <div style="font-size: 12.5px; color: var(--hc-text-2);">
              <span class="hc-eyebrow" style="margin-right: 8px;">Rota ativa</span>
              <span class="mono" style="color: var(--hc-text);">
                ${this.bounceRoute.map((id, i) => {
                  const p = popMap.get(id);
                  return `${i + 1}. ${esc(p ? p.name : id)}`;
                }).join('  →  ')}
              </span>
            </div>
            ${this.bounceRoute.length > 1 ? `<button type="button" class="hc-btn ghost sm" onclick="window.worldMapEngine.resetBounceRoute()">Resetar rota</button>` : ''}
          </div>
        </div>

        <!-- Tabela Limpa de Disputa Regional -->
        <div class="hc-card" style="padding: 0; overflow: hidden;">
          <div style="padding: 14px 18px; border-bottom: 1px solid var(--hc-border); display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 14px;">Influência regional por continente</strong>
            <span style="font-size: 12px; color: var(--hc-text-3);">Infiltre backbones para transferir o controle ao seu clã</span>
          </div>
          <table class="hc-table">
            <thead>
              <tr>
                <th>Região</th>
                <th>Facção dominante</th>
                <th>Influência</th>
                <th>Efeito</th>
                <th style="text-align: right;">Operação</th>
              </tr>
            </thead>
            <tbody>${territoryRows}</tbody>
          </table>
        </div>
      `;
    }

    renderUI() {
      const container = document.getElementById('worldMapAppBody') || document.getElementById('world-map-body');
      if (container) {
        container.innerHTML = this.renderHtml();
      }
    }
  }

  window.worldMapEngine = new WorldMapEngine();
  window.openWorldMapModal = () => window.worldMapEngine.openModal();
})();
