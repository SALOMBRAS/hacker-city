/**
 * Foto de perfil do operador: tela de escolha e retrato no HUD e na janela Perfil.
 *
 * - Jogador novo escolhe entre o cadastro e o tutorial: o spotlightTour consulta needsChoice()
 *   e abre esta tela antes de começar (interactive-tour-ux-engine.js, maybeAutoStartForSession).
 * - Clicar no retrato da janela Perfil abre a mesma tela para trocar.
 * - Conta com e-mail: grava em profiles.avatar_url. No "1 Clique" o perfil é só local, então a
 *   escolha fica no aparelho (localStorage), como o resto da sessão instantânea.
 * - Só aceita IDs de window.HC_AVATARS (avatar-catalog.js). A tabela profiles não tem RLS e o
 *   grant de avatar_url vale para qualquer linha, então o valor do banco nunca vai cru para o HTML.
 */
(function () {
  'use strict';

  const KEY_CHOICE = 'HC_AVATAR_';          // + uid -> id do retrato
  const KEY_POSTPONED = 'HC_AVATAR_ADIADO_'; // + uid -> '1' quando o jogador deixou para depois
  const catalog = Array.isArray(window.HC_AVATARS) ? window.HC_AVATARS : [];
  const byId = new Map(catalog.map((a) => [a.id, a]));

  const fullUrl = (a) => `assets/avatars/${a.id}.webp`;
  const miniUrl = (a) => `assets/avatars/mini/${a.id}.webp`;
  const icon = (name) => (window.HC && typeof window.HC.icon === 'function' ? window.HC.icon(name) : '');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const profile = () => window.currentProfile || null;
  const isLocalProfile = (p) => /@local\.hc$/i.test((p && p.email) || '');

  function readLS(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function writeLS(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* modo privado: vale só nesta sessão */ }
  }
  function removeLS(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  // ---------------------------------------------------------------------------
  // Estado do retrato
  // ---------------------------------------------------------------------------
  function current() {
    const p = profile();
    if (!p) return null;
    return byId.get(p.avatar_url) || byId.get(readLS(KEY_CHOICE + p.id)) || null;
  }

  function needsChoice() {
    const p = profile();
    return !!p && byId.size > 0 && !current() && readLS(KEY_POSTPONED + p.id) !== '1';
  }

  // Devolve 'nuvem' (gravou no perfil), 'local' (perfil do 1 Clique) ou 'falhou' (ficou só no aparelho).
  async function persist(id) {
    const p = profile();
    const av = byId.get(id);
    if (!p || !av) return 'falhou';
    writeLS(KEY_CHOICE + p.id, av.id);
    removeLS(KEY_POSTPONED + p.id);
    try { p.avatar_url = av.id; } catch (e) { /* perfil protegido: o localStorage cobre esta sessão */ }
    paintAll();
    if (isLocalProfile(p)) return 'local';
    const sb = window.supabase;
    if (!sb || typeof sb.from !== 'function') return 'falhou';
    try {
      const { data, error } = await sb.from('profiles').update({ avatar_url: av.id }).eq('id', p.id).select('id');
      if (error) throw error;
      if (!data || !data.length) throw new Error('nenhuma linha atualizada');
      return 'nuvem';
    } catch (e) {
      console.warn('[avatar] A nuvem não gravou a foto; ela ficou neste aparelho.', e);
      return 'falhou';
    }
  }

  // ---------------------------------------------------------------------------
  // Retrato no HUD e na janela Perfil
  // ---------------------------------------------------------------------------
  function paint(el, large) {
    if (!el) return;
    const av = current();
    let img = el.querySelector('img.hc-avatar-foto');
    if (!av) {
      if (img) img.remove();
      el.classList.remove('tem-foto');
      return;
    }
    if (!img) {
      img = document.createElement('img');
      img.className = 'hc-avatar-foto';
      img.alt = '';
      img.decoding = 'async';
      el.appendChild(img);
    }
    const url = large ? fullUrl(av) : miniUrl(av);
    if (img.getAttribute('src') !== url) img.setAttribute('src', url);
    el.classList.add('tem-foto');
  }

  function paintAll() {
    paint(document.getElementById('hudAvatar'), false);
    paint(document.getElementById('profAvatarCircle'), true);
  }

  function prepareProfileTrigger() {
    const el = document.getElementById('profAvatarCircle');
    if (!el || el.dataset.hcavReady) return;
    el.dataset.hcavReady = '1';
    el.classList.add('hcav-gatilho');
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('title', 'Trocar foto de perfil');
    el.setAttribute('aria-label', 'Trocar foto de perfil');
    const openChange = () => open({ mode: 'change' });
    el.addEventListener('click', openChange);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openChange(); }
    });
  }

  // ---------------------------------------------------------------------------
  // Tela de escolha
  // ---------------------------------------------------------------------------
  const state = { open: false, mode: 'onboarding', selected: null, onClose: null, focusBefore: null };
  let root = null;
  let ui = {};

  function build() {
    if (root) return;
    root = document.createElement('div');
    root.id = 'hcAvatarPicker';
    root.className = 'hcav';
    root.hidden = true;
    root.innerHTML = `
      <div class="hcav-fundo" data-acao="fundo"></div>
      <section class="hcav-janela" role="dialog" aria-modal="true" aria-labelledby="hcavTitulo" aria-describedby="hcavSub">
        <header class="hcav-topo">
          <ol class="hcav-etapas" aria-label="Etapas do início">
            <li class="feito">${icon('check')}<span>Cadastro</span></li>
            <li class="atual" aria-current="step"><span>Foto de perfil</span></li>
            <li><span>Tutorial</span></li>
          </ol>
          <button type="button" class="hcav-fechar" data-acao="fechar" aria-label="Fechar">${icon('x')}</button>
          <span class="hc-eyebrow">// identidade do operador</span>
          <h2 id="hcavTitulo" class="hcav-titulo">Escolha sua foto de perfil</h2>
          <p id="hcavSub" class="hcav-sub">Aparece na barra do topo e no seu perfil. Para trocar depois, clique na foto do perfil.</p>
        </header>
        <div class="hcav-corpo">
          <div class="hcav-lista">
            <div class="hcav-barra">
              <div class="hcav-filtros" role="group" aria-label="Filtrar retratos">
                <button type="button" data-filtro="todos" aria-pressed="true">Todos <span class="hcav-qtd"></span></button>
                <button type="button" data-filtro="m" aria-pressed="false">Homens <span class="hcav-qtd"></span></button>
                <button type="button" data-filtro="f" aria-pressed="false">Mulheres <span class="hcav-qtd"></span></button>
              </div>
              <button type="button" class="hcav-sortear" data-acao="sortear" aria-label="Sortear um retrato">${icon('refresh-cw')}<span>Sortear</span></button>
            </div>
            <div class="hcav-grade" role="radiogroup" aria-labelledby="hcavTitulo"></div>
          </div>
          <aside class="hcav-ficha" aria-label="Retrato escolhido">
            <div class="hcav-ficha-topo"><span>Ficha do operador</span><span class="hcav-led" aria-hidden="true"></span></div>
            <div class="hcav-foto">
              <img alt="" hidden>
              <span class="hcav-foto-vazia">${icon('user')}<span>Escolha um retrato</span></span>
            </div>
            <dl class="hcav-dados">
              <div><dt>Codinome</dt><dd data-campo="tag">—</dd></div>
              <div><dt>Retrato</dt><dd data-campo="nome" aria-live="polite">—</dd></div>
            </dl>
            <p class="hcav-dica">Setas navegam pela grade. Duplo clique ou <kbd>Enter</kbd> no retrato marcado confirma.</p>
            <div class="hcav-acoes">
              <button type="button" class="hc-btn primary block hcav-confirmar" data-acao="confirmar" disabled>Confirmar foto</button>
              <button type="button" class="hcav-depois" data-acao="depois">Decidir depois</button>
            </div>
          </aside>
        </div>
      </section>`;
    document.body.appendChild(root);

    ui = {
      dialog: root.querySelector('.hcav-janela'),
      title: root.querySelector('#hcavTitulo'),
      grid: root.querySelector('.hcav-grade'),
      photo: root.querySelector('.hcav-foto'),
      photoImg: root.querySelector('.hcav-foto img'),
      tag: root.querySelector('[data-campo="tag"]'),
      name: root.querySelector('[data-campo="nome"]'),
      confirm: root.querySelector('.hcav-confirmar'),
      filters: Array.from(root.querySelectorAll('[data-filtro]'))
    };

    const frag = document.createDocumentFragment();
    catalog.forEach((a, i) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'hcav-card';
      card.dataset.id = a.id;
      card.dataset.genero = a.genero;
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', 'false');
      card.tabIndex = -1;
      card.style.setProperty('--i', String(Math.min(i, 24)));
      card.innerHTML = `<img src="${miniUrl(a)}" alt="" loading="lazy" decoding="async" width="160" height="160">`
        + `<span class="hcav-card-nome">${esc(a.nome)}</span>`
        + `<span class="hcav-check" aria-hidden="true">${icon('check')}</span>`;
      frag.appendChild(card);
    });
    ui.grid.appendChild(frag);

    const counts = { todos: catalog.length, m: 0, f: 0 };
    catalog.forEach((a) => { if (a.genero in counts) counts[a.genero] += 1; });
    ui.filters.forEach((b) => { b.querySelector('.hcav-qtd').textContent = String(counts[b.dataset.filtro] || 0); });

    root.addEventListener('click', onClick);
    root.addEventListener('dblclick', (ev) => { if (ev.target.closest('.hcav-card')) confirm(); });
  }

  const cards = () => Array.from(ui.grid.querySelectorAll('.hcav-card'));
  const visibleCards = () => cards().filter((c) => !c.hidden);
  const columns = () => Math.max(1, getComputedStyle(ui.grid).gridTemplateColumns.split(' ').filter(Boolean).length);

  function syncTabStop() {
    const visible = visibleCards();
    const target = visible.find((c) => c.dataset.id === state.selected) || visible[0];
    cards().forEach((c) => { c.tabIndex = c === target ? 0 : -1; });
  }

  function setFilter(f) {
    ui.filters.forEach((b) => b.setAttribute('aria-pressed', b.dataset.filtro === f ? 'true' : 'false'));
    cards().forEach((c) => { c.hidden = !(f === 'todos' || c.dataset.genero === f); });
    syncTabStop();
    ui.grid.scrollTop = 0;
  }

  function clearSheet() {
    state.selected = null;
    cards().forEach((c) => c.setAttribute('aria-checked', 'false'));
    ui.photoImg.hidden = true;
    ui.photoImg.removeAttribute('src');
    ui.photo.classList.remove('tem-foto');
    ui.name.textContent = '—';
    ui.confirm.disabled = true;
  }

  function select(id, { focus = false } = {}) {
    const av = byId.get(id);
    if (!av) return;
    state.selected = id;
    let chosen = null;
    cards().forEach((c) => {
      const on = c.dataset.id === id;
      c.setAttribute('aria-checked', on ? 'true' : 'false');
      if (on) chosen = c;
    });
    syncTabStop();
    if (chosen) {
      if (focus) chosen.focus({ preventScroll: true });
      chosen.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
    }
    ui.photoImg.src = fullUrl(av);
    ui.photoImg.hidden = false;
    ui.photo.classList.add('tem-foto');
    ui.photo.classList.remove('varrendo');
    void ui.photo.offsetWidth; // reinicia a varredura a cada troca
    ui.photo.classList.add('varrendo');
    ui.name.textContent = av.nome;
    ui.confirm.disabled = false;
  }

  function shuffle() {
    const visible = visibleCards();
    const pool = visible.filter((c) => c.dataset.id !== state.selected);
    const from = pool.length ? pool : visible;
    if (from.length) select(from[Math.floor(Math.random() * from.length)].dataset.id, { focus: true });
  }

  async function confirm() {
    if (!state.selected || ui.confirm.disabled) return;
    ui.confirm.disabled = true;
    const label = ui.confirm.textContent;
    ui.confirm.textContent = 'Salvando…';
    const result = await persist(state.selected);
    ui.confirm.textContent = label;
    if (typeof window.showToast === 'function') {
      window.showToast(result === 'falhou'
        ? 'Foto salva neste aparelho. A nuvem não respondeu; tente trocar de novo mais tarde.'
        : 'Foto de perfil salva.');
    }
    close('confirmado');
  }

  function onClick(ev) {
    const card = ev.target.closest('.hcav-card');
    if (card) { select(card.dataset.id, { focus: true }); return; }
    const filter = ev.target.closest('[data-filtro]');
    if (filter) { setFilter(filter.dataset.filtro); return; }
    const action = ev.target.closest('[data-acao]');
    if (!action) return;
    switch (action.dataset.acao) {
      case 'confirmar': confirm(); break;
      case 'sortear': shuffle(); break;
      case 'depois': close('adiado'); break;
      case 'fechar': close('cancelado'); break;
      case 'fundo': if (state.mode === 'change') close('cancelado'); break;
      default: break;
    }
  }

  function trapTab(ev) {
    const focusables = Array.from(ui.dialog.querySelectorAll('button'))
      .filter((b) => !b.disabled && b.tabIndex >= 0 && b.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const inside = ui.dialog.contains(document.activeElement);
    if (!inside) { ev.preventDefault(); (ev.shiftKey ? last : first).focus(); }
    else if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  }

  // Ouvido no document enquanto a tela está aberta: logo depois de abrir, ou após um clique numa
  // área sem foco, o foco ainda está fora da janela e o Esc/Tab não chegariam aqui.
  function onKeydown(ev) {
    if (!state.open) return;
    ev.stopPropagation(); // atalhos do jogo não disparam por trás da tela aberta
    if (ev.key === 'Escape') {
      if (state.mode === 'change') { ev.preventDefault(); close('cancelado'); }
      return;
    }
    if (ev.key === 'Tab') { trapTab(ev); return; }
    const card = ev.target.closest && ev.target.closest('.hcav-card');
    if (!card) return;
    if (ev.key === 'Enter' && state.selected === card.dataset.id) { ev.preventDefault(); confirm(); return; }
    const visible = visibleCards();
    const i = visible.indexOf(card);
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns(), ArrowUp: -columns() }[ev.key];
    let target;
    if (step !== undefined) target = i + step;
    else if (ev.key === 'Home') target = 0;
    else if (ev.key === 'End') target = visible.length - 1;
    else return;
    ev.preventDefault();
    target = Math.max(0, Math.min(visible.length - 1, target));
    select(visible[target].dataset.id, { focus: true });
  }

  function open(options = {}) {
    const p = profile();
    if (!p || !catalog.length) {
      if (typeof options.onClose === 'function') options.onClose('indisponivel');
      return false;
    }
    build();
    if (state.open) return true;
    state.open = true;
    state.mode = options.mode === 'change' ? 'change' : 'onboarding';
    state.onClose = typeof options.onClose === 'function' ? options.onClose : null;
    state.focusBefore = document.activeElement;

    root.dataset.mode = state.mode;
    ui.title.textContent = state.mode === 'change' ? 'Trocar foto de perfil' : 'Escolha sua foto de perfil';
    ui.confirm.textContent = state.mode === 'change' ? 'Salvar foto' : 'Confirmar foto';
    ui.tag.textContent = '@' + (p.hacker_tag || 'operador');

    setFilter('todos');
    const now = current();
    if (now) select(now.id); else clearSheet();
    syncTabStop();

    root.hidden = false;
    document.addEventListener('keydown', onKeydown, true);
    requestAnimationFrame(() => root.classList.add('aberto'));
    setTimeout(() => {
      const target = ui.grid.querySelector('.hcav-card[tabindex="0"]') || ui.confirm;
      if (target) target.focus({ preventScroll: true });
    }, 60);
    return true;
  }

  function close(reason = 'cancelado') {
    if (!state.open) return;
    state.open = false;
    const p = profile();
    if (reason === 'adiado' && p) writeLS(KEY_POSTPONED + p.id, '1');
    document.removeEventListener('keydown', onKeydown, true);
    root.classList.remove('aberto');
    root.hidden = true;
    const callback = state.onClose;
    state.onClose = null;
    const back = state.focusBefore;
    state.focusBefore = null;
    if (back && document.contains(back) && typeof back.focus === 'function') {
      try { back.focus({ preventScroll: true }); } catch (e) {}
    }
    if (callback) callback(reason);
  }

  function init() {
    prepareProfileTrigger();
    paintAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.avatarPicker = { open, close: () => close('cancelado'), needsChoice, current, paintAll };
})();
