/**
 * Hacker City // Pilar 7: Fórum da Rede (Cloud + Realtime + Voto Único + Busca),
 * Notícias da Rede & Perfil Público Clicável (Sem Vazamento de IP + Bounty Real).
 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function iconSvg(name) {
    return (window.HC && window.HC.icon) ? window.HC.icon(name) : '';
  }

  const CATEGORY_LABELS = {
    geral: 'Todos',
    exploits: 'Dicas & Exploits',
    recrutamento: 'Recrutamento',
    farpas: 'Farpas & Disputas',
    mercado: 'Mercado'
  };

  const SPEC_NAMES = {
    exploiter: 'Infiltrador',
    sentinel: 'Cyber Sentinel',
    botmaster: 'Botmaster',
    carder: 'Cripto-Carder'
  };

  const DEFAULT_FORUM_THREADS = [
    {
      id: 'th_01',
      category: 'exploits',
      title: 'Guia prático: como fechar o Enigma 15 (Buffer 2048) e destravar combinações no Laboratório de Vírus',
      authorTag: 'ZeroCool',
      authorSpec: 'exploiter',
      pinned: true,
      locked: false,
      upvotes: 42,
      votedBy: [],
      views: 312,
      createdAt: 'Ontem · 22:15',
      posts: [
        {
          id: 'p_01_1',
          authorTag: 'ZeroCool',
          content: 'Para fechar a grade 2048 sem travar o tabuleiro, mantenham o maior bloco no canto inferior direito. E no Laboratório ($ 1.000 · 1x/dia), leiam sempre a explicação azul dos blocos antes de escolher para evitar a rotina sleep(2) que derruba o encaixe!',
          upvotes: 28,
          votedBy: [],
          createdAt: 'Ontem · 22:15'
        },
        {
          id: 'p_01_2',
          authorTag: 'AcidBurn',
          content: 'Dica de ouro! Peguei um conjunto da Camada III hoje e já subiu meu minerador para mais de 2.00x de Bitcoin.',
          upvotes: 14,
          votedBy: [],
          createdAt: 'Ontem · 22:40'
        }
      ]
    },
    {
      id: 'th_02',
      category: 'farpas',
      title: 'Recado ao clã CyberShadows: os nós de vocês em Tóquio caíram',
      authorTag: 'CrashOver',
      authorSpec: 'botmaster',
      pinned: false,
      locked: false,
      upvotes: 68,
      votedBy: [],
      views: 520,
      createdAt: 'Hoje · 00:04',
      posts: [
        {
          id: 'p_02_1',
          authorTag: 'CrashOver',
          content: 'Tentaram derrubar nosso gateway durante a madrugada, mas revidamos pelo backbone de Seul e tomamos a influência da região.',
          upvotes: 45,
          votedBy: [],
          createdAt: 'Hoje · 00:04'
        },
        {
          id: 'p_02_2',
          authorTag: 'LordNikon',
          content: 'A disputa ainda não acabou. Nos vemos no próximo ciclo de território.',
          upvotes: 19,
          votedBy: [],
          createdAt: 'Hoje · 00:22'
        }
      ]
    },
    {
      id: 'th_03',
      category: 'recrutamento',
      title: 'The Syndicate com 3 vagas abertas para especialistas em defesa (Firewall v5.0+)',
      authorTag: 'PhantomX',
      authorSpec: 'sentinel',
      pinned: true,
      locked: false,
      upvotes: 35,
      votedBy: [],
      views: 290,
      createdAt: 'Hoje · 01:10',
      posts: [
        {
          id: 'p_03_1',
          authorTag: 'PhantomX',
          content: 'Procuramos operadores graduados em CERT-401 para manter nossas zonas na Europa. Cofre do clã abastecido e bônus regional ativo.',
          upvotes: 21,
          votedBy: [],
          createdAt: 'Hoje · 01:10'
        }
      ]
    },
    {
      id: 'th_04',
      category: 'mercado',
      title: 'Procuro parceiro com acesso CFTV para apagar gravações de DVR corporativo',
      authorTag: 'CerealKiller',
      authorSpec: 'carder',
      pinned: false,
      locked: false,
      upvotes: 18,
      votedBy: [],
      views: 180,
      createdAt: 'Hoje · 02:00',
      posts: [
        {
          id: 'p_04_1',
          authorTag: 'CerealKiller',
          content: 'Divido recompensa de contrato pesado. Interessados mandem mensagem direta pela caixa criptografada clicando no meu @nick.',
          upvotes: 12,
          votedBy: [],
          createdAt: 'Hoje · 02:00'
        }
      ]
    }
  ];

  const DEFAULT_NEWS = [
    {
      id: 'news_01',
      edition: 'Edição #413',
      category: 'Manchete',
      badgeCls: 'success',
      date: '20/11/2026',
      headline: 'Laboratórios clandestinos sintetizam cepas v10.0 com multiplicador de 3.00x em Bitcoin',
      lead: 'Analistas de segurança detectaram 54 conjuntos distintos de código polimórfico circulando entre os servidores da rede.',
      body: 'Com custo operacional de $ 1.000 e janela restrita de uma síntese por ciclo diário, engenheiros de elite disputam o topo do Códice combinando instruções nativas AVX-512 e rootkits Ring-0.',
      source: 'Redação da Rede'
    },
    {
      id: 'news_02',
      edition: 'Edição #413',
      category: 'Polícia Federal',
      badgeCls: 'danger',
      date: '20/11/2026',
      headline: 'Apagão coordenado em câmeras CFTV e DVRs corporativos coloca FBI em alerta máximo',
      lead: 'Empresas financeiras e laboratórios tiveram circuitos ao vivo desligados minutos antes de extrações milionárias.',
      body: 'O mainframe federal 161.89.1.1 elevou os prêmios por operadores que deixaram rastros em /var/log/syslog após sabotarem gravadores /var/nvr/recordings.',
      source: 'Boletim Safenet'
    },
    {
      id: 'news_03',
      edition: 'Edição #413',
      category: 'Territórios',
      badgeCls: 'info',
      date: '20/11/2026',
      headline: 'Disputa entre clãs movimenta rotas submarinas na Europa e Ásia-Pacífico',
      lead: 'Controle dos pontos de presença em Cingapura e Frankfurt garante vantagem de banda e sigilo bancário às equipes vencedoras.',
      body: 'Qualquer operador pode contribuir reforçando ou infiltrando regiões diretamente pelo Mapa-Múndi para virar o placar de influência.',
      source: 'Observatório Global'
    }
  ];

  class DarknetSocialNewsEngine {
    constructor() {
      this.threads = [];
      this.news = [];
      this.activeCategory = 'geral';
      this.searchQuery = '';
      this.activeThreadId = null;
      this.composeOpen = false;
      this.localBus = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('hc_forum_realtime_v1') : null;
      this.init();
    }

    init() {
      this.loadState();
      this.setupNickClickDelegation();
      if (this.localBus) {
        this.localBus.onmessage = (ev) => {
          const msg = ev.data;
          if (!msg || !msg.type) return;
          if (msg.type === 'NEW_THREAD' && msg.thread) {
            if (!this.threads.some((t) => t.id === msg.thread.id)) {
              this.threads.unshift(msg.thread);
              this.saveState();
              if (window.winManager && window.winManager.current === 'winForum') this.renderForumUI();
            }
          } else if (msg.type === 'NEW_REPLY' && msg.threadId && msg.post) {
            const th = this.threads.find((t) => t.id === msg.threadId);
            if (th && !th.posts.some((p) => p.id === msg.post.id)) {
              th.posts.push(msg.post);
              this.saveState();
              if (window.winManager && window.winManager.current === 'winForum') this.renderForumUI();
            }
          }
        };
      }
      setTimeout(() => this.syncFromCloud(), 1600);
    }

    currentVoterKey() {
      return (window.currentProfile && (window.currentProfile.id || window.currentProfile.hacker_tag)) || 'guest';
    }

    storageKey() {
      return 'HC_DARKNET_SOCIAL_STATE_V3';
    }

    loadState() {
      try {
        const raw = localStorage.getItem(this.storageKey());
        if (raw) {
          const data = JSON.parse(raw);
          this.threads = Array.isArray(data.threads) && data.threads.length > 0 ? data.threads : JSON.parse(JSON.stringify(DEFAULT_FORUM_THREADS));
          this.news = Array.isArray(data.news) && data.news.length > 0 ? data.news : JSON.parse(JSON.stringify(DEFAULT_NEWS));
        } else {
          this.threads = JSON.parse(JSON.stringify(DEFAULT_FORUM_THREADS));
          this.news = JSON.parse(JSON.stringify(DEFAULT_NEWS));
          this.saveState();
        }
      } catch (e) {
        this.threads = JSON.parse(JSON.stringify(DEFAULT_FORUM_THREADS));
        this.news = JSON.parse(JSON.stringify(DEFAULT_NEWS));
      }
      // Garantir arrays votedBy em todos os itens
      this.threads.forEach((t) => {
        if (!Array.isArray(t.votedBy)) t.votedBy = [];
        (t.posts || []).forEach((p) => {
          if (!Array.isArray(p.votedBy)) p.votedBy = [];
        });
      });
    }

    saveState() {
      try {
        localStorage.setItem(this.storageKey(), JSON.stringify({
          threads: this.threads.slice(0, 60),
          news: this.news
        }));
      } catch (e) {}
    }

    async syncFromCloud() {
      if (!window.supabase || typeof window.supabase.from !== 'function') return;
      try {
        const { data: rows, error } = await window.supabase
          .from('darknet_forum_threads')
          .select('id, author_tag, category, title, pinned, locked, view_count, upvotes, created_at, darknet_forum_posts(id, author_tag, content, upvotes, created_at)')
          .order('created_at', { ascending: false })
          .limit(30);
        if (error || !Array.isArray(rows) || rows.length === 0) return;

        rows.reverse().forEach((r) => {
          const cloudId = String(r.id);
          const mappedPosts = Array.isArray(r.darknet_forum_posts)
            ? r.darknet_forum_posts.map((p) => ({
                id: String(p.id),
                authorTag: p.author_tag || 'Operador',
                content: p.content || '',
                upvotes: Number(p.upvotes || 0),
                votedBy: [],
                createdAt: p.created_at ? new Date(p.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Recente'
              }))
            : [];
          const existing = this.threads.find((t) => String(t.cloudId || t.id) === cloudId);
          if (!existing) {
            this.threads.unshift({
              id: cloudId,
              cloudId,
              category: r.category || 'geral',
              title: r.title,
              authorTag: r.author_tag || 'Operador',
              authorSpec: 'exploiter',
              pinned: !!r.pinned,
              locked: !!r.locked,
              upvotes: Number(r.upvotes || 1),
              votedBy: [],
              views: Number(r.view_count || 1),
              createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString('pt-BR') : 'Hoje',
              posts: mappedPosts
            });
          }
        });
        this.saveState();
        if (window.winManager && window.winManager.current === 'winForum') this.renderForumUI();
      } catch (e) {}
    }

    setupNickClickDelegation() {
      document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-player-tag], .player-nick-link');
        if (target) {
          const tag = target.getAttribute('data-player-tag') || target.innerText.trim().replace(/^@/, '');
          if (tag) {
            e.preventDefault();
            e.stopPropagation();
            this.openProfileModal(tag);
          }
        }
      });
    }

    // =========================================================================
    // 1. FÓRUM DA REDE (winForum) — Voto Único, Busca, Exclusão Própria & Nuvem
    // =========================================================================
    openForumModal() {
      if (typeof window.navTo === 'function') {
        window.navTo('winForum');
      }
      this.renderForumUI();
    }

    async createThread(category, title, content) {
      const cleanTitle = String(title || '').trim().slice(0, 140);
      const cleanContent = String(content || '').trim().slice(0, 2000);
      if (cleanTitle.length < 3 || cleanContent.length < 3) {
        if (window.showToast) window.showToast('Digite pelo menos 3 caracteres no título e na mensagem.');
        return { success: false };
      }

      const myTag = (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador';
      const mySpec = (window.currentProfile && window.currentProfile.specialty) || 'exploiter';
      const voterKey = this.currentVoterKey();
      const timeNow = 'Agora · ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      const newTh = {
        id: `th_${Date.now()}`,
        category: CATEGORY_LABELS[category] ? category : 'geral',
        title: cleanTitle,
        authorTag: myTag,
        authorSpec: mySpec,
        pinned: false,
        locked: false,
        upvotes: 1,
        votedBy: [voterKey],
        views: 1,
        createdAt: timeNow,
        posts: [
          {
            id: `p_${Date.now()}_1`,
            authorTag: myTag,
            content: cleanContent,
            upvotes: 1,
            votedBy: [voterKey],
            createdAt: timeNow
          }
        ]
      };

      this.threads.unshift(newTh);
      this.composeOpen = false;
      this.activeThreadId = newTh.id;
      this.saveState();

      if (this.localBus) {
        try { this.localBus.postMessage({ type: 'NEW_THREAD', thread: newTh }); } catch (e) {}
      }

      if (window.supabase && typeof window.supabase.rpc === 'function') {
        try {
          const { data } = await window.supabase.rpc('publish_forum_thread_secure', {
            p_author_tag: myTag,
            p_category: newTh.category,
            p_title: cleanTitle,
            p_content: cleanContent
          });
          if (data && data.success && data.thread_id) {
            newTh.cloudId = String(data.thread_id);
            this.saveState();
          }
        } catch (e) {}
      }

      if (window.showToast) window.showToast('✅ Tópico publicado no Fórum da Rede!');
      this.renderForumUI();
      return { success: true, thread: newTh };
    }

    async replyThread(threadId, content) {
      const cleanContent = String(content || '').trim().slice(0, 2000);
      if (cleanContent.length < 2) {
        if (window.showToast) window.showToast('Digite uma resposta válida antes de publicar.');
        return { success: false };
      }
      const th = this.threads.find((t) => t.id === threadId);
      if (!th) return { success: false };
      if (th.locked) {
        if (window.showToast) window.showToast('Este tópico está trancado.');
        return { success: false };
      }

      const myTag = (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador';
      const newPost = {
        id: `p_${Date.now()}_${Math.floor(Math.random() * 999)}`,
        authorTag: myTag,
        content: cleanContent,
        upvotes: 1,
        votedBy: [this.currentVoterKey()],
        createdAt: 'Agora · ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      th.posts.push(newPost);
      th.views = (th.views || 1) + 1;
      this.saveState();

      if (this.localBus) {
        try { this.localBus.postMessage({ type: 'NEW_REPLY', threadId: th.id, post: newPost }); } catch (e) {}
      }

      const uuidTarget = th.cloudId || (/^[0-9a-f-]{36}$/i.test(th.id) ? th.id : null);
      if (uuidTarget && window.supabase && typeof window.supabase.rpc === 'function') {
        try {
          await window.supabase.rpc('reply_forum_thread_secure', {
            p_thread_id: uuidTarget,
            p_author_tag: myTag,
            p_content: cleanContent
          });
        } catch (e) {}
      }

      if (window.showToast) window.showToast('💬 Resposta publicada no tópico!');
      this.renderForumUI();
      return { success: true, post: newPost };
    }

    // Voto único por operador (clicar novamente retira o apoio — impede spam infinito!)
    upvoteThread(threadId) {
      const th = this.threads.find((t) => t.id === threadId);
      if (!th) return;
      if (!Array.isArray(th.votedBy)) th.votedBy = [];
      const vk = this.currentVoterKey();
      const idx = th.votedBy.indexOf(vk);
      if (idx >= 0) {
        th.votedBy.splice(idx, 1);
        th.upvotes = Math.max(0, (th.upvotes || 1) - 1);
      } else {
        th.votedBy.push(vk);
        th.upvotes = (th.upvotes || 0) + 1;
      }
      this.saveState();
      this.renderForumUI();
    }

    upvotePost(threadId, postId) {
      const th = this.threads.find((t) => t.id === threadId);
      if (!th) return;
      const p = (th.posts || []).find((x) => x.id === postId);
      if (!p) return;
      if (!Array.isArray(p.votedBy)) p.votedBy = [];
      const vk = this.currentVoterKey();
      const idx = p.votedBy.indexOf(vk);
      if (idx >= 0) {
        p.votedBy.splice(idx, 1);
        p.upvotes = Math.max(0, (p.upvotes || 1) - 1);
      } else {
        p.votedBy.push(vk);
        p.upvotes = (p.upvotes || 0) + 1;
      }
      this.saveState();
      this.renderForumUI();
    }

    deleteOwnThread(threadId) {
      const myTag = ((window.currentProfile && window.currentProfile.hacker_tag) || '').toLowerCase();
      const idx = this.threads.findIndex((t) => t.id === threadId && String(t.authorTag || '').toLowerCase() === myTag);
      if (idx < 0) return;
      this.threads.splice(idx, 1);
      if (this.activeThreadId === threadId) this.activeThreadId = null;
      this.saveState();
      if (window.showToast) window.showToast('🗑️ Tópico removido.');
      this.renderForumUI();
    }

    deleteOwnPost(threadId, postId) {
      const myTag = ((window.currentProfile && window.currentProfile.hacker_tag) || '').toLowerCase();
      const th = this.threads.find((t) => t.id === threadId);
      if (!th || !Array.isArray(th.posts)) return;
      const idx = th.posts.findIndex((p) => p.id === postId && String(p.authorTag || '').toLowerCase() === myTag);
      if (idx < 0) return;
      th.posts.splice(idx, 1);
      this.saveState();
      if (window.showToast) window.showToast('🗑️ Comentário removido.');
      this.renderForumUI();
    }

    setSearchQuery(q) {
      this.searchQuery = String(q || '');
      this.renderForumUI();
    }

    renderForumHtml() {
      const vk = this.currentVoterKey();
      const myTagLower = ((window.currentProfile && window.currentProfile.hacker_tag) || '').toLowerCase();

      if (this.activeThreadId) {
        const th = this.threads.find((t) => t.id === this.activeThreadId);
        if (th) {
          const catLabel = CATEGORY_LABELS[th.category] || th.category;
          const hasVotedTh = Array.isArray(th.votedBy) && th.votedBy.includes(vk);
          const isMyThread = String(th.authorTag || '').toLowerCase() === myTagLower;

          const postsHtml = (th.posts || []).map((p, idx) => {
            const initials = String(p.authorTag || 'OP').slice(0, 2).toUpperCase();
            const hasVotedPost = Array.isArray(p.votedBy) && p.votedBy.includes(vk);
            const isMyPost = idx > 0 && String(p.authorTag || '').toLowerCase() === myTagLower;
            return `
              <div class="hc-card" style="padding: 14px 18px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 8px; flex-wrap: wrap;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="width: 28px; height: 28px; border-radius: 50%; background: var(--hc-surface-3); color: var(--hc-text); font-size: 11px; font-weight: 700; display: grid; place-items: center;">${esc(initials)}</span>
                    <strong style="cursor: pointer; color: var(--hc-accent-text); font-size: 13.5px;" data-player-tag="${esc(p.authorTag)}">@${esc(p.authorTag)}</strong>
                    <span class="mono" style="font-size: 11.5px; color: var(--hc-text-3);">${esc(p.createdAt)}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <button type="button" class="hc-btn ghost sm" style="padding:3px 9px;font-size:11.5px;${hasVotedPost ? 'border-color:var(--hc-accent);color:var(--hc-accent-text);' : ''}"
                      onclick="window.darknetSocialEngine.upvotePost('${esc(th.id)}', '${esc(p.id)}')">
                      ▲ ${p.upvotes || 0}${hasVotedPost ? ' ✓' : ''}
                    </button>
                    ${isMyPost ? `<button type="button" class="hc-btn ghost sm" style="padding:3px 8px;font-size:11.5px;color:var(--hc-danger-text);" onclick="window.darknetSocialEngine.deleteOwnPost('${esc(th.id)}', '${esc(p.id)}')">Excluir</button>` : ''}
                  </div>
                </div>
                <div style="font-size: 13.5px; color: var(--hc-text); line-height: 1.55; white-space: pre-wrap; padding-left: 38px;">${esc(p.content)}</div>
              </div>
            `;
          }).join('');

          return `
            <div class="soft-frame" style="padding:18px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 10px; flex-wrap: wrap;">
                <button type="button" id="btnForumBackToList" class="hc-btn ghost sm" onclick="window.darknetSocialEngine.activeThreadId = null; window.darknetSocialEngine.renderForumUI();">
                  ${iconSvg('arrow-left')} Voltar aos tópicos
                </button>
                <div style="display:flex;gap:8px;align-items:center;">
                  ${isMyThread ? `<button type="button" class="hc-btn ghost sm" style="color:var(--hc-danger-text);" onclick="window.darknetSocialEngine.deleteOwnThread('${esc(th.id)}')">Excluir meu tópico</button>` : ''}
                  <button type="button" id="btnForumUpvoteThread" class="hc-btn ${hasVotedTh ? 'primary' : ''} sm" onclick="window.darknetSocialEngine.upvoteThread('${esc(th.id)}')">
                    ${iconSvg('arrow-up')} ${hasVotedTh ? 'Apoiado ✓' : 'Apoiar tópico'} (${th.upvotes})
                  </button>
                </div>
              </div>

              <div class="hc-card" style="margin-bottom: 16px; padding: 18px 20px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                  <span class="hc-badge info">${esc(catLabel)}</span>
                  <span style="font-size: 12px; color: var(--hc-text-3);">Iniciado por <strong style="cursor:pointer;color:var(--hc-accent-text);" data-player-tag="${esc(th.authorTag)}">@${esc(th.authorTag)}</strong> · ${esc(th.createdAt)} · ${th.views || 1} visualizações</span>
                </div>
                <h2 style="margin: 0; font-size: 19px; color: var(--hc-text);">${esc(th.title)}</h2>
              </div>

              <div class="hc-eyebrow" style="margin-bottom: 10px;">Mensagens (${th.posts.length})</div>
              <div style="margin-bottom: 18px;">${postsHtml}</div>

              <div class="hc-card" style="padding: 16px 18px;">
                <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Participar da discussão</div>
                <textarea id="forum-reply-input" class="form-input" style="width:100%;height: 84px; padding: 10px 12px; resize: vertical;" placeholder="Escreva sua resposta..."></textarea>
                <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                  <button type="button" id="btnForumPublishReply" class="hc-btn primary" onclick="window.darknetSocialEngine.replyThread('${esc(th.id)}', document.getElementById('forum-reply-input').value)">
                    Publicar resposta
                  </button>
                </div>
              </div>
            </div>
          `;
        }
      }

      const qLower = this.searchQuery.trim().toLowerCase();
      const filtered = this.threads.filter((t) => {
        const catOk = this.activeCategory === 'geral' || t.category === this.activeCategory;
        if (!catOk) return false;
        if (!qLower) return true;
        return String(t.title || '').toLowerCase().includes(qLower) ||
               String(t.authorTag || '').toLowerCase().includes(qLower) ||
               (t.posts || []).some((p) => String(p.content || '').toLowerCase().includes(qLower));
      });

      const rows = filtered.map((t) => {
        const initials = String(t.authorTag || 'OP').slice(0, 2).toUpperCase();
        const catLabel = CATEGORY_LABELS[t.category] || t.category;
        return `
          <tr style="cursor: pointer;" onclick="window.darknetSocialEngine.activeThreadId = '${esc(t.id)}'; window.darknetSocialEngine.renderForumUI();">
            <td>
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="width: 32px; height: 32px; border-radius: 50%; background: var(--hc-surface-2); border: 1px solid var(--hc-border); color: var(--hc-text-2); font-size: 11px; font-weight: 700; display: grid; place-items: center; flex-shrink: 0;">${esc(initials)}</span>
                <div>
                  <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    ${t.pinned ? '<span class="hc-badge warning">Fixado</span>' : ''}
                    <strong style="font-size: 14px; color: var(--hc-text);">${esc(t.title)}</strong>
                  </div>
                  <div style="font-size: 12px; color: var(--hc-text-3); margin-top: 2px;">
                    Por <span style="color: var(--hc-accent-text); font-weight:600;" data-player-tag="${esc(t.authorTag)}">@${esc(t.authorTag)}</span> · ${esc(t.createdAt)}
                  </div>
                </div>
              </div>
            </td>
            <td><span class="hc-badge">${esc(catLabel)}</span></td>
            <td class="mono" style="color: var(--hc-text-2); font-size: 12.5px;">${(t.posts || []).length}</td>
            <td class="mono" style="text-align: right; color: var(--hc-accent-text); font-weight: 600;">▲ ${t.upvotes}</td>
          </tr>
        `;
      }).join('');

      return `
        <div class="soft-frame" style="padding: 16px 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; border-bottom: 1px solid var(--hc-border); padding-bottom: 10px; margin-bottom: 16px;">
            <div class="hc-tabs" style="border-bottom: 0;">
              ${Object.entries(CATEGORY_LABELS).map(([key, label]) => `
                <button type="button" class="hc-tab ${this.activeCategory === key ? 'active' : ''}" onclick="window.darknetSocialEngine.activeCategory = '${key}'; window.darknetSocialEngine.renderForumUI();">
                  ${esc(label)}
                </button>
              `).join('')}
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <input type="search" id="forumSearchInput" class="form-input" style="width:210px;font-size:12.5px;padding:6px 10px;"
                placeholder="Buscar assunto ou @nick..." value="${esc(this.searchQuery)}"
                oninput="window.darknetSocialEngine.setSearchQuery(this.value)">
              <button type="button" id="btnForumNewTopic" class="hc-btn primary sm" onclick="window.darknetSocialEngine.composeOpen = !window.darknetSocialEngine.composeOpen; window.darknetSocialEngine.renderForumUI();">
                + Novo tópico
              </button>
            </div>
          </div>

          ${this.composeOpen ? `
            <div class="hc-card" id="forumComposeCard" style="margin-bottom: 16px; padding: 16px 18px;">
              <div style="font-size: 14px; font-weight: 600; margin-bottom: 10px;">Criar novo tópico no Fórum da Rede</div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 10px; margin-bottom: 10px;">
                <input type="text" id="new-thread-title" class="form-input" maxlength="140" placeholder="Assunto claro e direto...">
                <select id="new-thread-category" class="form-input">
                  <option value="exploits">Dicas &amp; Exploits</option>
                  <option value="recrutamento">Recrutamento</option>
                  <option value="farpas">Farpas &amp; Disputas</option>
                  <option value="mercado">Mercado</option>
                  <option value="geral">Geral</option>
                </select>
              </div>
              <textarea id="new-thread-content" class="form-input" style="width:100%;height: 84px; padding: 10px 12px; resize: vertical;" maxlength="2000" placeholder="Escreva os detalhes da publicação..."></textarea>
              <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
                <button type="button" class="hc-btn ghost sm" onclick="window.darknetSocialEngine.composeOpen = false; window.darknetSocialEngine.renderForumUI();">Cancelar</button>
                <button type="button" id="btnForumSubmitThread" class="hc-btn primary sm" onclick="window.darknetSocialEngine.createThread(document.getElementById('new-thread-category').value, document.getElementById('new-thread-title').value, document.getElementById('new-thread-content').value)">
                  Publicar tópico
                </button>
              </div>
            </div>
          ` : ''}

          ${window.topTenMechanics && typeof window.topTenMechanics.renderForumMercenaryEscrowSectionHtml === 'function'
            ? window.topTenMechanics.renderForumMercenaryEscrowSectionHtml()
            : ''}

          <div class="hc-card" style="padding: 0; overflow: hidden;">
            <table class="hc-table">
              <thead>
                <tr>
                  <th>Tópico</th>
                  <th>Categoria</th>
                  <th>Respostas</th>
                  <th style="text-align: right;">Votos</th>
                </tr>
              </thead>
              <tbody>
                ${rows || '<tr><td colspan="4" style="text-align:center;color:var(--hc-text-3);padding:24px;">Nenhum tópico encontrado para este filtro.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    renderForumUI() {
      const container = document.getElementById('forumAppBody') || document.getElementById('darknet-forum-body');
      if (container) {
        container.innerHTML = this.renderForumHtml();
      }
    }

    // =========================================================================
    // 2. NOTÍCIAS DA REDE (winNews)
    // =========================================================================
    openNewsModal() {
      if (typeof window.navTo === 'function') {
        window.navTo('winNews');
      }
      this.renderNewsUI();
    }

    renderNewsHtml() {
      const btcPrice = (window.bitcoinEngine && window.bitcoinEngine.priceUsd) || 84250;
      const fbiCount = (window.safenetFbiEngine && Array.isArray(window.safenetFbiEngine.fbiWantedList))
        ? window.safenetFbiEngine.fbiWantedList.length
        : 0;

      const cards = this.news.map((n) => `
        <article class="hc-card" style="padding: 20px 22px;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="hc-badge ${n.badgeCls || 'info'}">${esc(n.category)}</span>
              <span class="mono" style="font-size: 11.5px; color: var(--hc-text-3);">${esc(n.edition)}</span>
            </div>
            <span class="mono" style="font-size: 11.5px; color: var(--hc-text-3);">${esc(n.date)} · ${esc(n.source)}</span>
          </div>
          <h3 style="margin: 0 0 8px 0; font-size: 17.5px; color: var(--hc-text); line-height: 1.3;">${esc(n.headline)}</h3>
          <p style="margin: 0 0 10px 0; font-size: 13.5px; color: var(--hc-accent-text); font-weight: 500; line-height: 1.45;">${esc(n.lead)}</p>
          <p style="margin: 0; font-size: 13px; color: var(--hc-text-2); line-height: 1.55;">${esc(n.body)}</p>
        </article>
      `).join('');

      return `
        <div>
          <div class="hc-stat-strip" style="margin-bottom: 20px;">
            <div class="hc-stat-cell">
              <div class="hc-stat-label">Cotação Bitcoin</div>
              <div class="hc-stat-value">$${Number(btcPrice).toLocaleString('pt-BR')}</div>
              <div class="hc-stat-sub ok">Mercado Cripto Ativo</div>
            </div>
            <div class="hc-stat-cell">
              <div class="hc-stat-label">Mandados federais</div>
              <div class="hc-stat-value">${fbiCount}</div>
              <div class="hc-stat-sub">Mainframe 161.89.1.1</div>
            </div>
            <div class="hc-stat-cell">
              <div class="hc-stat-label">Tráfego de ataque</div>
              <div class="hc-stat-value">184 Gbps</div>
              <div class="hc-stat-sub">Pico nos cabos asiáticos</div>
            </div>
            <div class="hc-stat-cell">
              <div class="hc-stat-label">Boletim</div>
              <div class="hc-stat-value">Edição #413</div>
              <div class="hc-stat-sub">Atualizado automaticamente</div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${cards}
          </div>
        </div>
      `;
    }

    renderNewsUI() {
      const container = document.getElementById('newsAppBody') || document.getElementById('cyber-chronicle-body');
      if (container) {
        container.innerHTML = this.renderNewsHtml();
      }
    }

    // =========================================================================
    // 3. PERFIL PÚBLICO CLICÁVEL (Dados Reais + IP 100% Oculto + Bounty Real!)
    // =========================================================================
    openProfileModal(tagOrId) {
      let modal = document.getElementById('player-profile-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'player-profile-modal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(8,10,14,0.72);backdrop-filter:blur(3px);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;';
        modal.onclick = (ev) => {
          if (ev.target === modal) modal.style.display = 'none';
        };
        modal.innerHTML = `
          <div class="hc-card" style="width: 480px; max-width: 100%; padding: 0; overflow: hidden; box-shadow: var(--hc-shadow-3);">
            <div style="padding: 14px 18px; border-bottom: 1px solid var(--hc-border); display: flex; justify-content: space-between; align-items: center;">
              <strong style="font-size: 14px; color: var(--hc-text);">Perfil Público do Operador</strong>
              <button id="close-profile-modal-btn" type="button" class="icon-btn" aria-label="Fechar">${iconSvg('x') || '✕'}</button>
            </div>
            <div id="player-profile-body" style="padding: 18px;"></div>
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

      const tag = String(targetTag || 'Operador').replace(/^@/, '').trim();
      const initials = tag.slice(0, 2).toUpperCase();

      // Busca dados reais primeiro (próprio operador ou diretório MMO) sem NUNCA vazar o IP público!
      const myTag = (window.currentProfile && window.currentProfile.hacker_tag) || '';
      const isSelf = myTag && myTag.toLowerCase() === tag.toLowerCase();
      const realPeer = (!isSelf && window.onlineEngine && typeof window.onlineEngine.findAnyPlayerByTag === 'function')
        ? window.onlineEngine.findAnyPlayerByTag(tag)
        : null;

      const hash = tag.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      let specLabel = SPEC_NAMES[(window.currentProfile && window.currentProfile.specialty) || 'exploiter'] || 'Infiltrador';
      let rep = Number((window.currentProfile && window.currentProfile.reputation) || 100);
      let heat = Number((window.currentProfile && window.currentProfile.heat_level) || 1);
      let clanLabel = 'Sem Clã';
      let onlineBadge = '<span class="hc-badge success">Você (Online)</span>';

      if (isSelf) {
        if (window.clanEngine && typeof window.clanEngine.getMyClan === 'function') {
          const mc = window.clanEngine.getMyClan();
          if (mc) clanLabel = `[${mc.tag}] ${mc.name}`;
        }
      } else if (realPeer) {
        specLabel = SPEC_NAMES[realPeer.specialty] || 'Infiltrador';
        rep = Number(realPeer.reputation || 100);
        heat = Number(realPeer.heatLevel || 1);
        clanLabel = realPeer.clanTag ? `[${realPeer.clanTag}]` : 'Lobo Solitário';
        onlineBadge = realPeer.onlineNow ? '<span class="hc-badge success">Online</span>' : '<span class="hc-badge">Offline</span>';
      } else {
        const specs = ['Infiltrador', 'Cyber Sentinel', 'Botmaster', 'Cripto-Carder'];
        specLabel = specs[hash % specs.length];
        rep = 280 + (hash * 37) % 6400;
        heat = (hash % 4) + 1;
        clanLabel = (hash % 2 === 0) ? 'The Syndicate' : 'Lobo Solitário';
        onlineBadge = '<span class="hc-badge info">Registrado</span>';
      }

      const activeBounties = (window.playerBountyEngine && Array.isArray(window.playerBountyEngine.bounties))
        ? window.playerBountyEngine.bounties.filter((b) => !b.claimed && String(b.targetTag || '').toLowerCase() === tag.toLowerCase()).length
        : 0;

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--hc-accent); color: #05150d; font-weight: 800; font-size: 15px; display: grid; place-items: center; flex-shrink: 0;">
              ${esc(initials)}
            </div>
            <div style="min-width: 0; flex: 1;">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <strong style="font-size: 17px; color: var(--hc-text);">@${esc(tag)}</strong>
                ${onlineBadge}
                ${activeBounties > 0 ? `<span class="hc-badge danger">${activeBounties} Recompensa(s) Ativa(s)</span>` : ''}
              </div>
              <div style="font-size: 12.5px; color: var(--hc-text-2); margin-top: 2px;">
                ${esc(specLabel)} · Clã <strong style="color: var(--hc-text);">${esc(clanLabel)}</strong>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); background: var(--hc-inset); border: 1px solid var(--hc-border); border-radius: 8px; overflow: hidden;">
            <div style="padding: 10px 12px; border-right: 1px solid var(--hc-border);">
              <div class="hc-eyebrow" style="font-size: 9.5px;">Reputação</div>
              <div class="mono" style="font-size: 14px; font-weight: 600; color: var(--hc-accent-text); margin-top: 2px;">${rep.toLocaleString('pt-BR')}</div>
            </div>
            <div style="padding: 10px 12px; border-right: 1px solid var(--hc-border);">
              <div class="hc-eyebrow" style="font-size: 9.5px;">Alerta</div>
              <div class="mono" style="font-size: 14px; font-weight: 600; margin-top: 2px;">Nível ${heat}/5</div>
            </div>
            <div style="padding: 10px 12px;">
              <div class="hc-eyebrow" style="font-size: 9.5px;">Endereço IP</div>
              <div class="mono" style="font-size: 12px; color: var(--hc-text-3); margin-top: 2px;" id="profileIpProtectedBadge">🔒 Oculto</div>
            </div>
          </div>

          ${!isSelf ? `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 2px;">
              <button type="button" id="btnProfileSendMail" class="hc-btn primary" onclick="window.darknetSocialEngine.actionSendMessage('${esc(tag)}')">
                ${iconSvg('mail')} Enviar mensagem
              </button>
              <button type="button" id="btnProfilePlaceBounty" class="hc-btn danger" onclick="window.darknetSocialEngine.actionPlaceBounty('${esc(tag)}')">
                ${iconSvg('crosshair')} Cabeça a Prêmio
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }

    actionSendMessage(targetTag) {
      const modal = document.getElementById('player-profile-modal');
      if (modal) modal.style.display = 'none';
      if (typeof window.navTo === 'function') window.navTo('winMail');
      setTimeout(() => {
        const toInp = document.getElementById('mailToInput');
        if (toInp) {
          toInp.value = targetTag;
          toInp.focus();
        }
      }, 120);
      if (window.showToast) window.showToast(`Caixa de mensagens aberta para @${targetTag}.`);
    }

    actionPlaceBounty(targetTag) {
      const modal = document.getElementById('player-profile-modal');
      if (modal) modal.style.display = 'none';
      if (window.playerBountyEngine && typeof window.playerBountyEngine.openQuickBountyModal === 'function') {
        window.playerBountyEngine.openQuickBountyModal(targetTag, `Alvo marcado via Perfil do Fórum (@${targetTag})`);
      } else {
        if (window.navTo) window.navTo('winFbi');
        if (window.showToast) window.showToast(`Abrindo mural de recompensas para @${targetTag}.`);
      }
    }
  }

  window.darknetSocialEngine = new DarknetSocialNewsEngine();
  window.openDarknetForumModal = () => window.darknetSocialEngine.openForumModal();
  window.openCyberChronicleModal = () => window.darknetSocialEngine.openNewsModal();
  window.openPublicProfileModal = (tag) => window.darknetSocialEngine.openProfileModal(tag);
})();
