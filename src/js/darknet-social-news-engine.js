/**
 * Hacker City // Pilar 7: Fórum da Rede, Notícias da Rede & Perfil Público Clicável
 * Páginas nativas integradas ao Design System ("Arroz com Feijão Bem Feito").
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

  const DEFAULT_FORUM_THREADS = [
    {
      id: 'th_01',
      category: 'exploits',
      title: 'Guia prático: como fechar o Enigma 15 (Buffer 2048) e destravar o Minerador v7.0',
      authorTag: 'ZeroCool',
      authorSpec: 'exploiter',
      pinned: true,
      locked: false,
      upvotes: 42,
      views: 312,
      createdAt: 'Ontem · 22:15',
      posts: [
        {
          id: 'p_01_1',
          authorTag: 'ZeroCool',
          content: 'Para fechar a grade 2048 sem travar o tabuleiro, mantenham sempre o maior bloco fixo no canto inferior direito e evitem subir a coluna principal.',
          upvotes: 28,
          createdAt: 'Ontem · 22:15'
        },
        {
          id: 'p_01_2',
          authorTag: 'AcidBurn',
          content: 'Testado e aprovado! Passei de primeira usando essa sequência e já instalei o minerador novo.',
          upvotes: 14,
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
      views: 520,
      createdAt: 'Hoje · 00:04',
      posts: [
        {
          id: 'p_02_1',
          authorTag: 'CrashOver',
          content: 'Tentaram derrubar nosso gateway durante a madrugada, mas revidamos pelo backbone de Seul e tomamos a influência da região.',
          upvotes: 45,
          createdAt: 'Hoje · 00:04'
        },
        {
          id: 'p_02_2',
          authorTag: 'LordNikon',
          content: 'A disputa ainda não acabou. Nos vemos no próximo ciclo de território.',
          upvotes: 19,
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
      views: 290,
      createdAt: 'Hoje · 01:10',
      posts: [
        {
          id: 'p_03_1',
          authorTag: 'PhantomX',
          content: 'Procuramos operadores ativos para manter nossas zonas na Europa. Cofre do clã abastecido e bônus regional liberado para todos os membros.',
          upvotes: 21,
          createdAt: 'Hoje · 01:10'
        }
      ]
    },
    {
      id: 'th_04',
      category: 'mercado',
      title: 'Troco coordenadas de servidores vulneráveis por informações de contas offshore',
      authorTag: 'CerealKiller',
      authorSpec: 'carder',
      pinned: false,
      locked: false,
      upvotes: 18,
      views: 180,
      createdAt: 'Hoje · 02:00',
      posts: [
        {
          id: 'p_04_1',
          authorTag: 'CerealKiller',
          content: 'Interessados podem mandar mensagem direta pela caixa criptografada.',
          upvotes: 12,
          createdAt: 'Hoje · 02:00'
        }
      ]
    }
  ];

  const DEFAULT_NEWS = [
    {
      id: 'news_01',
      edition: 'Edição #412',
      category: 'Manchete',
      badgeCls: 'success',
      date: '19/11/2026',
      headline: 'Transferência milionária esvazia reservas de banco offshore em Zurique',
      lead: 'Operadores usaram cadeia de 4 saltos intercontinentais para contornar o rastreamento e limpar os registros em menos de dois minutos.',
      body: 'Analistas da Safenet apontam que o grupo combinou quebra de senha de alta versão com roteamento por São Paulo, Londres e Tóquio. Quatro novos dossiês sob investigação foram abertos no servidor federal 161.89.1.1.',
      source: 'Redação da Rede'
    },
    {
      id: 'news_02',
      edition: 'Edição #412',
      category: 'Polícia Federal',
      badgeCls: 'danger',
      date: '19/11/2026',
      headline: 'FBI eleva recompensas por procurados que deixaram rastros em invasões recentes',
      lead: 'Servidores governamentais atualizaram a lista pública de mandados com pagamentos imediatos para quem derrubar os alvos.',
      body: 'Operadores experientes seguem tentando invadir o próprio mainframe 161.89.1.1 para expurgar fichas antes que caçadores de recompensas localizem seus gateways públicos.',
      source: 'Boletim Safenet'
    },
    {
      id: 'news_03',
      edition: 'Edição #412',
      category: 'Territórios',
      badgeCls: 'info',
      date: '19/11/2026',
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
      this.activeThreadId = null;
      this.composeOpen = false;
      this.init();
    }

    init() {
      this.loadState();
      this.setupNickClickDelegation();
    }

    storageKey() {
      return 'HC_DARKNET_SOCIAL_STATE_V2';
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
    // 1. FÓRUM DA REDE (Página Nativa winForum)
    // =========================================================================
    openForumModal() {
      if (typeof window.navTo === 'function') {
        window.navTo('winForum');
      }
      this.renderForumUI();
    }

    createThread(category, title, content) {
      if (!title || !content) {
        if (window.showToast) window.showToast('Preencha o título e a mensagem do tópico.', 'warning');
        return;
      }

      const myTag = (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador';
      const mySpec = (window.currentProfile && window.currentProfile.specialty) || 'exploiter';
      const timeNow = 'Agora · ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

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
        createdAt: timeNow,
        posts: [
          {
            id: `p_${Date.now()}_1`,
            authorTag: myTag,
            content: content.trim(),
            upvotes: 1,
            createdAt: timeNow
          }
        ]
      };

      this.threads.unshift(newTh);
      this.composeOpen = false;
      this.saveState();

      if (window.showToast) window.showToast('Tópico publicado no Fórum da Rede.', 'success');
      this.activeThreadId = newTh.id;
      this.renderForumUI();
    }

    replyThread(threadId, content) {
      if (!content || !content.trim()) return;
      const th = this.threads.find((t) => t.id === threadId);
      if (!th) return;

      const myTag = (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador';
      th.posts.push({
        id: `p_${Date.now()}`,
        authorTag: myTag,
        content: content.trim(),
        upvotes: 0,
        createdAt: 'Agora · ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      });
      th.views += 1;
      this.saveState();

      if (window.showToast) window.showToast('Resposta enviada.', 'info');
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
      if (this.activeThreadId) {
        const th = this.threads.find((t) => t.id === this.activeThreadId);
        if (th) {
          const catLabel = CATEGORY_LABELS[th.category] || th.category;
          const postsHtml = th.posts.map((p) => {
            const initials = p.authorTag.slice(0, 2).toUpperCase();
            return `
              <div class="hc-card" style="padding: 14px 18px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="width: 28px; height: 28px; border-radius: 50%; background: var(--hc-surface-3); color: var(--hc-text); font-size: 11px; font-weight: 700; display: grid; place-items: center;">${esc(initials)}</span>
                    <strong style="cursor: pointer; color: var(--hc-accent-text); font-size: 13.5px;" data-player-tag="${esc(p.authorTag)}">@${esc(p.authorTag)}</strong>
                    <span class="mono" style="font-size: 11.5px; color: var(--hc-text-3);">${esc(p.createdAt)}</span>
                  </div>
                </div>
                <div style="font-size: 13.5px; color: var(--hc-text); line-height: 1.55; white-space: pre-wrap; padding-left: 38px;">${esc(p.content)}</div>
              </div>
            `;
          }).join('');

          return `
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 10px; flex-wrap: wrap;">
                <button type="button" class="hc-btn ghost sm" onclick="window.darknetSocialEngine.activeThreadId = null; window.darknetSocialEngine.renderForumUI();">
                  ${iconSvg('arrow-left')} Voltar aos tópicos
                </button>
                <button type="button" class="hc-btn sm" onclick="window.darknetSocialEngine.upvoteThread('${esc(th.id)}')">
                  ${iconSvg('arrow-up')} Apoiar tópico (${th.upvotes})
                </button>
              </div>

              <div class="hc-card" style="margin-bottom: 16px; padding: 18px 20px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <span class="hc-badge info">${esc(catLabel)}</span>
                  <span style="font-size: 12px; color: var(--hc-text-3);">Iniciado por <strong style="cursor:pointer;color:var(--hc-text-2);" data-player-tag="${esc(th.authorTag)}">@${esc(th.authorTag)}</strong> · ${esc(th.createdAt)}</span>
                </div>
                <h2 style="margin: 0; font-size: 19px; color: var(--hc-text);">${esc(th.title)}</h2>
              </div>

              <div class="hc-eyebrow" style="margin-bottom: 10px;">Mensagens (${th.posts.length})</div>
              <div style="margin-bottom: 18px;">${postsHtml}</div>

              <div class="hc-card" style="padding: 16px 18px;">
                <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Participar da discussão</div>
                <textarea id="forum-reply-input" class="hc-input" style="height: 84px; padding: 10px 12px; resize: vertical;" placeholder="Escreva sua resposta..."></textarea>
                <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                  <button type="button" class="hc-btn primary" onclick="window.darknetSocialEngine.replyThread('${esc(th.id)}', document.getElementById('forum-reply-input').value)">
                    Publicar resposta
                  </button>
                </div>
              </div>
            </div>
          `;
        }
      }

      const filtered = this.activeCategory === 'geral'
        ? this.threads
        : this.threads.filter((t) => t.category === this.activeCategory);

      const rows = filtered.map((t) => {
        const initials = t.authorTag.slice(0, 2).toUpperCase();
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
                    Por <span style="color: var(--hc-accent-text);" data-player-tag="${esc(t.authorTag)}">@${esc(t.authorTag)}</span> · ${esc(t.createdAt)}
                  </div>
                </div>
              </div>
            </td>
            <td><span class="hc-badge">${esc(catLabel)}</span></td>
            <td class="mono" style="color: var(--hc-text-2); font-size: 12.5px;">${t.posts.length}</td>
            <td class="mono" style="text-align: right; color: var(--hc-accent-text); font-weight: 600;">▲ ${t.upvotes}</td>
          </tr>
        `;
      }).join('');

      return `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; border-bottom: 1px solid var(--hc-border); margin-bottom: 16px;">
            <div class="hc-tabs" style="border-bottom: 0;">
              ${Object.entries(CATEGORY_LABELS).map(([key, label]) => `
                <button type="button" class="hc-tab ${this.activeCategory === key ? 'active' : ''}" onclick="window.darknetSocialEngine.activeCategory = '${key}'; window.darknetSocialEngine.renderForumUI();">
                  ${esc(label)}
                </button>
              `).join('')}
            </div>
            <button type="button" class="hc-btn primary sm" style="margin-bottom: 6px;" onclick="window.darknetSocialEngine.composeOpen = !window.darknetSocialEngine.composeOpen; window.darknetSocialEngine.renderForumUI();">
              + Novo tópico
            </button>
          </div>

          ${this.composeOpen ? `
            <div class="hc-card" style="margin-bottom: 16px; padding: 16px 18px;">
              <div style="font-size: 14px; font-weight: 600; margin-bottom: 10px;">Criar novo tópico</div>
              <div style="display: grid; grid-template-columns: 1fr 200px; gap: 10px; margin-bottom: 10px;">
                <input type="text" id="new-thread-title" class="hc-input" placeholder="Assunto claro e direto...">
                <select id="new-thread-category" class="hc-input">
                  <option value="exploits">Dicas &amp; Exploits</option>
                  <option value="recrutamento">Recrutamento</option>
                  <option value="farpas">Farpas &amp; Disputas</option>
                  <option value="mercado">Mercado</option>
                  <option value="geral">Geral</option>
                </select>
              </div>
              <textarea id="new-thread-content" class="hc-input" style="height: 84px; padding: 10px 12px; resize: vertical;" placeholder="Escreva os detalhes da publicação..."></textarea>
              <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
                <button type="button" class="hc-btn ghost sm" onclick="window.darknetSocialEngine.composeOpen = false; window.darknetSocialEngine.renderForumUI();">Cancelar</button>
                <button type="button" class="hc-btn primary sm" onclick="window.darknetSocialEngine.createThread(document.getElementById('new-thread-category').value, document.getElementById('new-thread-title').value, document.getElementById('new-thread-content').value)">
                  Publicar tópico
                </button>
              </div>
            </div>
          ` : ''}

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
                ${rows || '<tr><td colspan="4" style="text-align:center;color:var(--hc-text-3);padding:24px;">Nenhum tópico publicado nesta categoria.</td></tr>'}
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
    // 2. NOTÍCIAS DA REDE (Página Nativa winNews)
    // =========================================================================
    openNewsModal() {
      if (typeof window.navTo === 'function') {
        window.navTo('winNews');
      }
      this.renderNewsUI();
    }

    renderNewsHtml() {
      const btcPrice = (window.bitcoinEngine && window.bitcoinEngine.btcUsdRate) || 84250;
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
              <div class="hc-stat-sub ok">+4,8% nas últimas 24h</div>
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
              <div class="hc-stat-value">Edição #412</div>
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
    // 3. PERFIL PÚBLICO CLICÁVEL (Dialog Compacto Neutro + Verde)
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
              <strong style="font-size: 14px; color: var(--hc-text);">Perfil do operador</strong>
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

      const tag = String(targetTag || 'Operador').replace(/^@/, '');
      const initials = tag.slice(0, 2).toUpperCase();
      const hash = tag.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const specs = ['Infiltrador', 'Cyber Sentinel', 'Botmaster', 'Cripto-Carder'];
      const spec = specs[hash % specs.length];
      const rep = 150 + (hash * 37) % 8500;
      const heat = (hash % 5) + 1;
      const clan = (hash % 2 === 0) ? 'The Syndicate' : (hash % 3 === 0 ? 'Cicada 3301' : 'LulzSec Coalition');
      const ipMask = `187.${(hash % 150) + 10}.X.X`;
      const isWanted = heat >= 4;

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--hc-accent); color: #fff; font-weight: 700; font-size: 15px; display: grid; place-items: center; flex-shrink: 0;">
              ${esc(initials)}
            </div>
            <div style="min-width: 0; flex: 1;">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <strong style="font-size: 17px; color: var(--hc-text);">${esc(tag)}</strong>
                ${isWanted ? '<span class="hc-badge danger">Procurado FBI</span>' : '<span class="hc-badge success">Ativo</span>'}
              </div>
              <div style="font-size: 12.5px; color: var(--hc-text-2); margin-top: 2px;">
                ${esc(spec)} · Clã <strong style="color: var(--hc-text);">${esc(clan)}</strong>
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
              <div class="hc-eyebrow" style="font-size: 9.5px;">Gateway</div>
              <div class="mono" style="font-size: 13px; color: var(--hc-text-2); margin-top: 2px;">${ipMask}</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 2px;">
            <button type="button" class="hc-btn primary" onclick="window.darknetSocialEngine.actionSendMessage('${esc(tag)}')">
              ${iconSvg('mail')} Enviar mensagem
            </button>
            <button type="button" class="hc-btn danger" onclick="window.darknetSocialEngine.actionPlaceBounty('${esc(tag)}')">
              ${iconSvg('crosshair')} Recompensa
            </button>
          </div>
        </div>
      `;
    }

    actionSendMessage(targetTag) {
      const modal = document.getElementById('player-profile-modal');
      if (modal) modal.style.display = 'none';
      if (typeof window.navTo === 'function') window.navTo('winMail');
      if (window.showToast) window.showToast(`Caixa de mensagens aberta para @${targetTag}.`, 'info');
    }

    actionPlaceBounty(targetTag) {
      const modal = document.getElementById('player-profile-modal');
      if (modal) modal.style.display = 'none';
      if (window.mmoEngine && typeof window.mmoEngine.openBountyModalForTarget === 'function') {
        window.mmoEngine.openBountyModalForTarget(targetTag);
      } else {
        if (window.navTo) window.navTo('winFbi');
        if (window.showToast) window.showToast(`Abrindo mural de recompensas para @${targetTag}.`, 'warning');
      }
    }
  }

  window.darknetSocialEngine = new DarknetSocialNewsEngine();
  window.openDarknetForumModal = () => window.darknetSocialEngine.openForumModal();
  window.openCyberChronicleModal = () => window.darknetSocialEngine.openNewsModal();
  window.openPublicProfileModal = (tag) => window.darknetSocialEngine.openProfileModal(tag);
})();
