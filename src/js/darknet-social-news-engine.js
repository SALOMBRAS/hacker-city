/**
 * Hacker City // Pilar 7: Darknet Fórum, The Cyber Chronicle & Perfil Público Clicável
 * Integra comunicação assíncrona da comunidade, jornalismo procedural do submundo cibernético
 * e modal de dossiê/perfil de qualquer jogador ao clicar em seu codinome.
 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Sementes iniciais para o Fórum
  const DEFAULT_FORUM_THREADS = [
    {
      id: 'th_01',
      category: 'exploits',
      title: 'Dica: Como quebrar o Puzzle do Nó 15 (Buffer 2048) e liberar Minerador v7.0',
      authorTag: 'ZeroCool',
      authorSpec: 'exploiter',
      pinned: true,
      locked: false,
      upvotes: 42,
      views: 312,
      createdAt: '2026-11-18 22:15',
      posts: [
        {
          id: 'p_01_1',
          authorTag: 'ZeroCool',
          content: 'Irmãos da rede, para fechar a grade 2048 no BufferMerge sempre empurrem os blocos maiores para o canto inferior direito. Não deixem o nó 64 no meio do buffer!',
          upvotes: 28,
          createdAt: '2026-11-18 22:15'
        },
        {
          id: 'p_01_2',
          authorTag: 'AcidBurn',
          content: 'Confirmo a técnica. Funcionou de primeira no mainframe do FBI também. Valeu pela dica, Zero.',
          upvotes: 14,
          createdAt: '2026-11-18 22:40'
        }
      ]
    },
    {
      id: 'th_02',
      category: 'farpas',
      title: 'Aviso ao clã CyberShadows: sua botnet em Tóquio caiu',
      authorTag: 'CrashOver',
      authorSpec: 'botmaster',
      pinned: false,
      locked: false,
      upvotes: 68,
      views: 520,
      createdAt: '2026-11-19 00:04',
      posts: [
        {
          id: 'p_02_1',
          authorTag: 'CrashOver',
          content: 'Tentaram derrubar nosso gateway com DDoS fraco de 12 Gbps. Revidamos com 80 Gbps pelo backbone de Seul e limpamos todos os zumbis de vocês. Melhorem.',
          upvotes: 45,
          createdAt: '2026-11-19 00:04'
        },
        {
          id: 'p_02_2',
          authorTag: 'LordNikon',
          content: 'Prints ou nunca aconteceu. A gente viu o trace do FBI batendo na porta de vocês agorinha...',
          upvotes: 19,
          createdAt: '2026-11-19 00:22'
        }
      ]
    },
    {
      id: 'th_03',
      category: 'recrutamento',
      title: '[RECRUTAMENTO] The Syndicate abrindo 3 vagas para Sentinels nível 10+',
      authorTag: 'PhantomX',
      authorSpec: 'sentinel',
      pinned: true,
      locked: false,
      upvotes: 35,
      views: 290,
      createdAt: '2026-11-19 01:10',
      posts: [
        {
          id: 'p_03_1',
          authorTag: 'PhantomX',
          content: 'Buscamos operadores com foco em defesa territorial e firewall v6.0+. Oferecemos cofre compartilhado com mais de 2.500.000 HC e bônus de banda em Zurique.',
          upvotes: 21,
          createdAt: '2026-11-19 01:10'
        }
      ]
    },
    {
      id: 'th_04',
      category: 'mercado',
      title: 'Vendo lote de Exploits Zero-Day v8.5 para Mainframes Bancários',
      authorTag: 'CerealKiller',
      authorSpec: 'carder',
      pinned: false,
      locked: false,
      upvotes: 18,
      views: 180,
      createdAt: '2026-11-19 02:00',
      posts: [
        {
          id: 'p_04_1',
          authorTag: 'CerealKiller',
          content: 'Aceito BTC ou HC via escrow de conta offshore. Quem tiver interesse manda PM na caixa de mensagens.',
          upvotes: 12,
          createdAt: '2026-11-19 02:00'
        }
      ]
    }
  ];

  // Notícias dinâmicas do jornal The Cyber Chronicle
  const DEFAULT_NEWS = [
    {
      id: 'news_01',
      edition: 'Edição Noturna #412',
      category: 'manchete',
      date: '19/11/2026',
      headline: 'RAID MASSIVO NO BANCO CENTRAL OFFSHORE: MAIS DE 1.2M HC TRANSFERIDOS EM MINUTOS',
      lead: 'Operação relâmpago atribuída a operadores anônimos contornou firewalls v7.0 e esvaziou cofres em Zurique.',
      body: 'Especialistas em segurança da Safenet confirmam que os atacantes utilizaram cadeias de saltos transatlânticos passando por São Paulo, Londres e Tóquio, reduzindo a taxa de rastreamento para menos de 10%. As autoridades já emitiram 4 novos dossiês de busca no Mainframe FBI 161.89.1.1.',
      source: 'Redação Darknet Press'
    },
    {
      id: 'news_02',
      edition: 'Edição Noturna #412',
      category: 'fbi',
      date: '19/11/2026',
      headline: 'MAINFRAME DO FBI REFORÇA LISTA DE PROCURADOS COM RECOMPENSAS DE ATÉ 150.000 HC',
      lead: 'Agentes federais aumentam vigilância sobre nós de gateway suspeitos que utilizam roteamento de Honeypot.',
      body: 'Qualquer operador que expurgar seus dossiês do servidor 161.89.1.1 poderá ter o mandado suspenso temporariamente, porém o algoritmo de correlação de logs do FBI está operando em capacidade máxima.',
      source: 'Divisão de Crimes Cibernéticos'
    },
    {
      id: 'news_03',
      edition: 'Edição Noturna #412',
      category: 'territorios',
      date: '19/11/2026',
      headline: 'GUERRA DE CLÃS: THE SYNDICATE DOMINA ROTA DE CABOS SUBMARINOS EM CINGAPURA',
      lead: 'Batalha de botnets pelo controle do tráfego do Sudeste Asiático atinge pico de 140 Gbps.',
      body: 'Com o controle de Cingapura e Hong Kong, membros do Syndicate agora desfrutam de um bônus de 30% em largura de banda e taxas de lavagem reduzidas.',
      source: 'Observatório BGP Global'
    }
  ];

  class DarknetSocialNewsEngine {
    constructor() {
      this.threads = [];
      this.news = [];
      this.activeCategory = 'geral';
      this.activeThreadId = null;
      this.init();
    }

    init() {
      this.loadState();
      this.setupNickClickDelegation();
    }

    storageKey() {
      return 'HC_DARKNET_SOCIAL_STATE';
    }

    loadState() {
      try {
        const raw = localStorage.getItem(this.storageKey());
        if (raw) {
          const data = JSON.parse(raw);
          this.threads = data.threads || DEFAULT_FORUM_THREADS;
          this.news = data.news || DEFAULT_NEWS;
        } else {
          this.threads = JSON.parse(JSON.stringify(DEFAULT_FORUM_THREADS));
          this.news = JSON.parse(JSON.stringify(DEFAULT_NEWS));
          this.saveState();
        }
      } catch (e) {
        this.threads = JSON.parse(JSON.stringify(DEFAULT_FORUM_THREADS));
        this.news = JSON.parse(JSON.stringify(DEFAULT_NEWS));
      }
    }

    saveState() {
      try {
        localStorage.setItem(this.storageKey(), JSON.stringify({
          threads: this.threads,
          news: this.news
        }));
      } catch (e) {}
    }

    // Configura delegação de eventos para que qualquer clique em [data-player-tag] abra o perfil
    setupNickClickDelegation() {
      document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-player-tag], .player-nick-link');
        if (target) {
          const tag = target.getAttribute('data-player-tag') || target.innerText.trim().replace(/^@/, '');
          if (tag) {
            e.preventDefault();
            this.openProfileModal(tag);
          }
        }
      });
    }

    // =========================================================================
    // 1. FÓRUM DARKNET
    // =========================================================================
    openForumModal() {
      let modal = document.getElementById('darknet-forum-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'darknet-forum-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(5, 8, 14, 0.82)';
        modal.style.backdropFilter = 'blur(6px)';
        modal.style.zIndex = '9999';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.innerHTML = `
          <div style="background:#0f1521;border:1px solid #23344d;border-radius:12px;width:920px;max-width:96vw;box-shadow:0 18px 45px rgba(0,0,0,0.7);overflow:hidden;font-family:sans-serif;color:#e2e8f0;">
            <div style="background:#151f30;padding:12px 18px;border-bottom:1px solid #23344d;display:flex;justify-content:space-between;align-items:center;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:1.15rem;">💬</span>
                <strong style="font-size:0.98rem;letter-spacing:0.02em;color:#38bdf8;">DARKNET COMMUNITY FÓRUM // TÓPICOS &amp; EXPLOITS</strong>
              </div>
              <button id="close-forum-modal-btn" style="background:transparent;border:none;color:#8e9db4;font-size:1.2rem;cursor:pointer;padding:0 6px;">✕</button>
            </div>
            <div id="darknet-forum-body" style="padding:16px;max-height:82vh;overflow-y:auto;"></div>
          </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('close-forum-modal-btn').onclick = () => {
          modal.style.display = 'none';
        };
      } else {
        modal.style.display = 'flex';
      }

      this.renderForumUI();
    }

    createThread(category, title, content) {
      if (!title || !content) {
        if (window.showToast) window.showToast('Título e conteúdo são obrigatórios!', 'warning');
        return;
      }

      const myTag = (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador_Anônimo';
      const mySpec = (window.currentProfile && window.currentProfile.specialty) || 'exploiter';

      const newTh = {
        id: `th_${Date.now()}`,
        category: category || 'geral',
        title: title.trim(),
        authorTag: myTag,
        authorSpec: mySpec,
        pinned: false,
        locked: false,
        upvotes: 1,
        views: 1,
        createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        posts: [
          {
            id: `p_${Date.now()}_1`,
            authorTag: myTag,
            content: content.trim(),
            upvotes: 1,
            createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };

      this.threads.unshift(newTh);
      this.saveState();

      if (window.showToast) window.showToast('📝 Tópico publicado no Darknet Fórum!', 'success');
      if (window.audioEngine && typeof window.audioEngine.playKeyClick === 'function') {
        window.audioEngine.playKeyClick();
      }

      this.activeThreadId = newTh.id;
      this.renderForumUI();
    }

    replyThread(threadId, content) {
      if (!content || !content.trim()) return;

      const th = this.threads.find((t) => t.id === threadId);
      if (!th) return;

      const myTag = (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador_Anônimo';

      th.posts.push({
        id: `p_${Date.now()}`,
        authorTag: myTag,
        content: content.trim(),
        upvotes: 0,
        createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      });

      th.views += 1;
      this.saveState();

      if (window.showToast) window.showToast('💬 Resposta postada com sucesso!', 'info');
      if (window.audioEngine && typeof window.audioEngine.playKeyClick === 'function') {
        window.audioEngine.playKeyClick();
      }

      this.renderForumUI();
    }

    upvoteThread(threadId) {
      const th = this.threads.find((t) => t.id === threadId);
      if (th) {
        th.upvotes += 1;
        this.saveState();
        this.renderForumUI();
      }
    }

    renderForumHtml() {
      // Se tiver um tópico aberto em detalhes
      if (this.activeThreadId) {
        const th = this.threads.find((t) => t.id === this.activeThreadId);
        if (th) {
          const postsHtml = th.posts.map((p) => `
            <div style="background:#131c2a;border:1px solid #23344d;border-radius:6px;padding:12px;margin-bottom:8px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;border-bottom:1px solid #1a273b;padding-bottom:4px;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="cursor:pointer;color:#38bdf8;font-weight:bold;font-size:0.88rem;" data-player-tag="${esc(p.authorTag)}">
                    @${esc(p.authorTag)}
                  </span>
                  <span style="font-size:0.7rem;background:#1e293b;color:#94a3b8;padding:1px 5px;border-radius:3px;">${esc(p.createdAt)}</span>
                </div>
                <div style="font-size:0.75rem;color:#35b877;font-weight:bold;">▲ ${p.upvotes}</div>
              </div>
              <div style="font-size:0.85rem;color:#cbd5e1;line-height:1.45;white-space:pre-wrap;">${esc(p.content)}</div>
            </div>
          `).join('');

          return `
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <button type="button" class="hc-btn ghost sm" onclick="window.darknetSocialEngine.activeThreadId = null; window.darknetSocialEngine.renderForumUI();">
                  ◀ Voltar para Lista de Tópicos
                </button>
                <button type="button" class="hc-btn primary sm" onclick="window.darknetSocialEngine.upvoteThread('${esc(th.id)}')">
                  ▲ Upvote Tópico (${th.upvotes})
                </button>
              </div>

              <div style="background:#0c111a;border:1px solid #1e2c40;border-radius:8px;padding:14px;margin-bottom:14px;">
                <div style="font-size:0.75rem;color:#f59e0b;font-weight:bold;text-transform:uppercase;margin-bottom:4px;">
                  [${esc(th.category)}] · Publicado por @${esc(th.authorTag)} em ${esc(th.createdAt)}
                </div>
                <h3 style="margin:0 0 10px 0;font-size:1.1rem;color:#fff;">${esc(th.title)}</h3>
              </div>

              <div style="margin-bottom:14px;">
                <h4 style="margin:0 0 8px 0;font-size:0.86rem;color:#94a3b8;">RESPOSTAS DA COMUNIDADE (${th.posts.length})</h4>
                ${postsHtml}
              </div>

              <!-- Caixa de resposta -->
              <div style="background:#0c111a;border:1px solid #1e2c40;border-radius:8px;padding:12px;">
                <div style="font-size:0.82rem;font-weight:bold;color:#38bdf8;margin-bottom:6px;">RESPONDER A ESTE TÓPICO</div>
                <textarea id="forum-reply-input" style="width:100%;height:70px;background:#151f30;border:1px solid #23344d;border-radius:6px;color:#fff;padding:8px;font-size:0.85rem;resize:none;" placeholder="Escreva sua resposta ou contra-argumento..."></textarea>
                <div style="display:flex;justify-content:flex-end;margin-top:6px;">
                  <button type="button" class="hc-btn primary sm" onclick="window.darknetSocialEngine.replyThread('${esc(th.id)}', document.getElementById('forum-reply-input').value)">
                    Publicar Resposta
                  </button>
                </div>
              </div>
            </div>
          `;
        }
      }

      // Lista geral de tópicos
      const filteredThreads = this.activeCategory === 'geral' 
        ? this.threads 
        : this.threads.filter((t) => t.category === this.activeCategory);

      const threadCards = filteredThreads.map((t) => `
        <div style="background:#131c2a;border:1px solid #23344d;border-radius:8px;padding:12px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;transition:border-color 0.2s;" onclick="window.darknetSocialEngine.activeThreadId = '${esc(t.id)}'; window.darknetSocialEngine.renderForumUI();">
          <div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              ${t.pinned ? '<span style="font-size:0.7rem;background:rgba(245,158,11,0.2);color:#f59e0b;padding:1px 6px;border-radius:3px;font-weight:bold;">PINNED</span>' : ''}
              <span style="font-size:0.72rem;background:#1e293b;color:#94a3b8;padding:1px 6px;border-radius:3px;text-transform:uppercase;">${esc(t.category)}</span>
              <strong style="color:#fff;font-size:0.92rem;">${esc(t.title)}</strong>
            </div>
            <div style="font-size:0.75rem;color:#8e9db4;">
              Por <span style="color:#38bdf8;" data-player-tag="${esc(t.authorTag)}">@${esc(t.authorTag)}</span> · ${t.posts.length} respostas · ${t.views} views · ${esc(t.createdAt)}
            </div>
          </div>

          <div style="text-align:right;">
            <div style="font-size:0.85rem;color:#35b877;font-weight:bold;">▲ ${t.upvotes}</div>
          </div>
        </div>
      `).join('');

      return `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <!-- Barra de Categorias e Novo Tópico -->
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;border-bottom:1px solid #1f2b3d;padding-bottom:10px;">
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${['geral', 'exploits', 'recrutamento', 'farpas', 'mercado'].map((cat) => `
                <button type="button" class="hc-btn ${this.activeCategory === cat ? 'primary' : 'ghost'} sm" onclick="window.darknetSocialEngine.activeCategory = '${cat}'; window.darknetSocialEngine.renderForumUI();">
                  ${cat.toUpperCase()}
                </button>
              `).join('')}
            </div>

            <button type="button" class="hc-btn primary sm" onclick="document.getElementById('forum-new-thread-box').style.display = document.getElementById('forum-new-thread-box').style.display === 'none' ? 'block' : 'none';">
              + Criar Tópico
            </button>
          </div>

          <!-- Caixa Expansível de Criar Novo Tópico -->
          <div id="forum-new-thread-box" style="display:none;background:#0c111a;border:1px solid #23344d;border-radius:8px;padding:12px;">
            <div style="font-size:0.85rem;font-weight:bold;color:#38bdf8;margin-bottom:8px;">PUBLICAR NOVO TÓPICO NA DARKNET</div>
            <div style="display:grid;grid-template-columns:1fr 200px;gap:8px;margin-bottom:8px;">
              <input type="text" id="new-thread-title" placeholder="Título chamativo do tópico..." style="background:#151f30;border:1px solid #23344d;border-radius:6px;color:#fff;padding:8px;font-size:0.85rem;">
              <select id="new-thread-category" style="background:#151f30;border:1px solid #23344d;border-radius:6px;color:#fff;padding:8px;font-size:0.85rem;">
                <option value="exploits">Exploits &amp; Puzzles</option>
                <option value="recrutamento">Recrutamento de Clã</option>
                <option value="farpas">Dossiês &amp; Farpas</option>
                <option value="mercado">Mercado Negro</option>
                <option value="geral">Geral &amp; Conversa</option>
              </select>
            </div>
            <textarea id="new-thread-content" style="width:100%;height:80px;background:#151f30;border:1px solid #23344d;border-radius:6px;color:#fff;padding:8px;font-size:0.85rem;resize:none;" placeholder="Conteúdo da postagem..."></textarea>
            <div style="display:flex;justify-content:flex-end;margin-top:8px;">
              <button type="button" class="hc-btn primary sm" onclick="window.darknetSocialEngine.createThread(document.getElementById('new-thread-category').value, document.getElementById('new-thread-title').value, document.getElementById('new-thread-content').value)">
                Publicar Tópico Agora
              </button>
            </div>
          </div>

          <!-- Lista de Tópicos -->
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${threadCards || '<div style="color:#64748b;text-align:center;padding:20px;">Nenhum tópico nesta categoria ainda.</div>'}
          </div>
        </div>
      `;
    }

    renderForumUI() {
      const container = document.getElementById('darknet-forum-body');
      if (container) {
        container.innerHTML = this.renderForumHtml();
      }
    }

    // =========================================================================
    // 2. JORNAL DA REDE (THE CYBER CHRONICLE)
    // =========================================================================
    openNewsModal() {
      let modal = document.getElementById('cyber-chronicle-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cyber-chronicle-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(4, 6, 11, 0.88)';
        modal.style.backdropFilter = 'blur(6px)';
        modal.style.zIndex = '9999';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.innerHTML = `
          <div style="background:#0e131d;border:2px solid #38bdf8;border-radius:8px;width:880px;max-width:96vw;box-shadow:0 20px 50px rgba(0,0,0,0.8);overflow:hidden;font-family:'Courier New', monospace;color:#e2e8f0;">
            <div style="background:#131c2a;padding:14px 20px;border-bottom:2px solid #38bdf8;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-size:1.3rem;font-weight:bold;letter-spacing:0.08em;color:#38bdf8;">📰 THE CYBER CHRONICLE</div>
                <div style="font-size:0.75rem;color:#8e9db4;">O DIÁRIO INDEPENDENTE DO SUBMUNDO CIBERNÉTICO &amp; MERCADO SHADOW</div>
              </div>
              <button id="close-news-modal-btn" style="background:transparent;border:none;color:#8e9db4;font-size:1.4rem;cursor:pointer;padding:0 6px;">✕</button>
            </div>
            <div id="cyber-chronicle-body" style="padding:18px;max-height:82vh;overflow-y:auto;"></div>
          </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('close-news-modal-btn').onclick = () => {
          modal.style.display = 'none';
        };
      } else {
        modal.style.display = 'flex';
      }

      this.renderNewsUI();
    }

    renderNewsHtml() {
      const btcPrice = (window.softwareEngine && window.softwareEngine.btcPrice) || 84250;
      const btcChange = '+4.8%';

      const newsCards = this.news.map((n) => `
        <div style="background:#080c14;border:1px solid #1f2b3e;border-radius:6px;padding:14px;margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:#64748b;margin-bottom:6px;">
            <span>[${esc(n.category.toUpperCase())}] · ${esc(n.edition)}</span>
            <span>${esc(n.date)} · ${esc(n.source)}</span>
          </div>
          <h3 style="margin:0 0 8px 0;font-size:1.05rem;color:#fff;line-height:1.3;">${esc(n.headline)}</h3>
          <div style="font-size:0.86rem;color:#38bdf8;font-style:italic;margin-bottom:8px;line-height:1.4;">"${esc(n.lead)}"</div>
          <div style="font-size:0.82rem;color:#94a3b8;line-height:1.45;">${esc(n.body)}</div>
        </div>
      `).join('');

      return `
        <div>
          <!-- Ticker Financeiro da Rede -->
          <div style="background:#070a10;border:1px dashed #23344d;border-radius:4px;padding:8px 12px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;font-size:0.78rem;">
            <span>🪙 <strong>BITCOIN (BTC):</strong> $ ${Number(btcPrice).toLocaleString('pt-BR')} HC <span style="color:#35b877;">(${btcChange})</span></span>
            <span>🛡️ <strong>STATUS SAFENET:</strong> <span style="color:#ef4444;">ALERTA VERMELHO (161.89.1.1)</span></span>
            <span>⚡ <strong>VOLUMES DDOS:</strong> 184 Gbps</span>
          </div>

          <!-- Manchetes e Artigos -->
          <div>${newsCards}</div>
        </div>
      `;
    }

    renderNewsUI() {
      const container = document.getElementById('cyber-chronicle-body');
      if (container) {
        container.innerHTML = this.renderNewsHtml();
      }
    }

    // =========================================================================
    // 3. MODAL DE PERFIL PÚBLICO CLICÁVEL
    // =========================================================================
    openProfileModal(tagOrId) {
      let modal = document.getElementById('player-profile-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'player-profile-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(4, 6, 12, 0.84)';
        modal.style.backdropFilter = 'blur(6px)';
        modal.style.zIndex = '10000';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.innerHTML = `
          <div style="background:#101724;border:1px solid #2d415e;border-radius:12px;width:580px;max-width:94vw;box-shadow:0 18px 45px rgba(0,0,0,0.7);overflow:hidden;font-family:sans-serif;color:#e2e8f0;">
            <div style="background:#162133;padding:12px 18px;border-bottom:1px solid #2d415e;display:flex;justify-content:space-between;align-items:center;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:1.15rem;">👤</span>
                <strong style="font-size:0.95rem;letter-spacing:0.02em;color:#38bdf8;">DOSSIÊ DE OPERADOR // PERFIL PÚBLICO</strong>
              </div>
              <button id="close-profile-modal-btn" style="background:transparent;border:none;color:#8e9db4;font-size:1.2rem;cursor:pointer;padding:0 6px;">✕</button>
            </div>
            <div id="player-profile-body" style="padding:16px;"></div>
          </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('close-profile-modal-btn').onclick = () => {
          modal.style.display = 'none';
        };
      } else {
        modal.style.display = 'flex';
      }

      this.renderProfileUI(tagOrId);
    }

    renderProfileUI(targetTag) {
      const container = document.getElementById('player-profile-body');
      if (!container) return;

      const tag = String(targetTag || 'Operador_Anônimo').replace(/^@/, '');
      
      // Gera dados enriquecidos se for bot ou jogador do histórico
      const hash = tag.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const specs = ['Infiltrador', 'Cyber Sentinel', 'Botmaster', 'Cripto-Carder'];
      const spec = specs[hash % specs.length];
      const rep = 150 + (hash * 37) % 8500;
      const heat = (hash % 5) + 1;
      const clan = (hash % 2 === 0) ? 'The Syndicate' : (hash % 3 === 0 ? 'Cicada 3301' : 'LulzSec Coalition');
      const ipMask = `187.${(hash % 150) + 10}.X.X`;
      const isWanted = heat >= 4;

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:12px;">
          <!-- Topo do Perfil com Avatar e Tag -->
          <div style="display:flex;align-items:center;gap:14px;background:#0a0e16;padding:12px;border-radius:8px;border:1px solid #1f2d40;">
            <div style="width:56px;height:56px;border-radius:8px;background:linear-gradient(135deg, #1e293b, #0f172a);border:1px solid #38bdf8;display:flex;align-items:center;justify-content:center;font-size:1.6rem;">
              👤
            </div>
            <div style="flex:1;">
              <div style="display:flex;align-items:center;gap:8px;">
                <strong style="font-size:1.15rem;color:#fff;">${esc(tag)}</strong>
                ${isWanted ? '<span style="font-size:0.68rem;background:rgba(239,68,68,0.2);color:#ef4444;border:1px solid #ef4444;padding:1px 6px;border-radius:4px;font-weight:bold;">PROCURADO FBI</span>' : ''}
              </div>
              <div style="font-size:0.8rem;color:#94a3b8;margin-top:2px;">
                Especialidade: <strong style="color:#38bdf8;">${spec}</strong> · Clã: <strong style="color:#f59e0b;">${clan}</strong>
              </div>
            </div>
          </div>

          <!-- Métricas e Hardware Estimado -->
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;">
            <div style="background:#131c2a;border:1px solid #23344d;border-radius:6px;padding:8px;text-align:center;">
              <div style="font-size:0.7rem;color:#8e9db4;">REPUTAÇÃO</div>
              <div style="font-size:1.05rem;font-weight:bold;color:#35b877;">${rep.toLocaleString()} pts</div>
            </div>
            <div style="background:#131c2a;border:1px solid #23344d;border-radius:6px;padding:8px;text-align:center;">
              <div style="font-size:0.7rem;color:#8e9db4;">NÍVEL DE HEAT</div>
              <div style="font-size:1.05rem;font-weight:bold;color:${heat >= 4 ? '#ef4444' : '#f59e0b'};">★ ${heat}/5</div>
            </div>
            <div style="background:#131c2a;border:1px solid #23344d;border-radius:6px;padding:8px;text-align:center;">
              <div style="font-size:0.7rem;color:#8e9db4;">GATEWAY IP</div>
              <div style="font-size:0.92rem;font-family:monospace;color:#38bdf8;">${ipMask}</div>
            </div>
          </div>

          <!-- Dossiê de Inteligência -->
          <div style="background:#090d14;border:1px solid #1c2738;border-radius:6px;padding:10px;font-size:0.78rem;color:#94a3b8;line-height:1.4;">
            <strong style="color:#e2e8f0;">Relatório de Sensores:</strong> Alvo visto recentemente orbitando a faixa de rede de bancos offshore. Possui firewall ativo estimado em v4.0+ e histórico de ataques combinados de botnet.
          </div>

          <!-- Ações Rápidas de Interação Direta -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;">
            <button type="button" class="hc-btn primary sm" onclick="window.darknetSocialEngine.actionSendMessage('${esc(tag)}')">
              ✉️ Enviar Mensagem Privada
            </button>
            <button type="button" class="hc-btn ghost sm" style="color:#ef4444;" onclick="window.darknetSocialEngine.actionPlaceBounty('${esc(tag)}')">
              🎯 Colocar Cabeça a Prêmio
            </button>
          </div>
        </div>
      `;
    }

    actionSendMessage(targetTag) {
      // Fecha modal de perfil e abre tela de mensagens
      const modal = document.getElementById('player-profile-modal');
      if (modal) modal.style.display = 'none';

      if (typeof window.navTo === 'function') window.navTo('winMail');
      if (window.showToast) window.showToast(`Caixa de mensagens aberta para @${targetTag}`, 'info');
    }

    actionPlaceBounty(targetTag) {
      // Fecha modal de perfil e abre modal de recompensa
      const modal = document.getElementById('player-profile-modal');
      if (modal) modal.style.display = 'none';

      if (window.mmoEngine && typeof window.mmoEngine.openBountyModalForTarget === 'function') {
        window.mmoEngine.openBountyModalForTarget(targetTag);
      } else {
        if (window.showToast) window.showToast(`Preparando contrato de caça para @${targetTag}...`, 'warning');
      }
    }
  }

  window.darknetSocialEngine = new DarknetSocialNewsEngine();
  window.openDarknetForumModal = () => window.darknetSocialEngine.openForumModal();
  window.openCyberChronicleModal = () => window.darknetSocialEngine.openNewsModal();
  window.openPublicProfileModal = (tag) => window.darknetSocialEngine.openProfileModal(tag);
})();
