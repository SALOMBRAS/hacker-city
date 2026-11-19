/**
 * Hacker City // Bloco 3 MMO:
 * 1. UniversityEngine    — 5 Cursos & Certificações Sequenciais (aulas reais, taxas, bônus de ataque/defesa/DDoS)
 * 2. TutorialStoryEngine — Invasão Tutorial Guiada em 5 Etapas (estilo Ensei Tankado / Numataka do HE Legacy, pagando $ 1.500 HC + 0.01337000 BTC)
 * 3. MissionsBoardEngine — Quadro Dinâmico de Contratos (5 tipos: Apagar Arquivo, Roubar Dados, Auditar Saldo, Drenar Conta, Ataque DDoS)
 */
(function () {
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtUsd(n) {
    return '$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' HC';
  }

  // =========================================================================
  // 1. UNIVERSIDADE & CERTIFICAÇÕES SEQUENCIAIS (5 CURSOS REAIS)
  // =========================================================================
  const CERT_COURSES = [
    {
      id: 1,
      code: 'CERT-101',
      title: 'Fundamentos & Identidade de Rede',
      cost: 0,
      repReward: 100,
      unlockBadge: 'Acesso à Rede & Tutorial',
      bonusDesc: '+100 REP · Destrava o Curso #2 e a operação inicial da Numataka',
      pages: [
        {
          heading: 'Módulo 1/2 — Seu IP Público Dinâmico',
          body: 'Na Hacker City, cada operador e servidor possui um endereço IPv4 público único. Toda vez que você invade um servidor ou faz login SSH sem proxy, o seu IP real fica gravado no arquivo /var/log/syslog da máquina alvo.'
        },
        {
          heading: 'Módulo 2/2 — Provedor ISP (71.4.5.1) e Regra Semanal',
          body: 'Você tem direito a 1 troca de IP 100% gratuita por semana no servidor 71.4.5.1 (HC Telecom ISP) ou na aba Minha Conta. Precisar trocar de IP antes dos 7 dias para fugir do FBI ou de bots caçadores custa caro ($ 50.000 HC+). Por isso, limpar seus logs sempre vem primeiro!'
        }
      ]
    },
    {
      id: 2,
      code: 'CERT-102',
      title: 'Hacking 101: Força-Bruta, Firewall & Limpeza Forense',
      cost: 0,
      repReward: 100,
      unlockBadge: '+20% Velocidade CPU em Quebras',
      bonusDesc: '+100 REP · +20% velocidade de tempo no Cracker · Libera Invasão Tutorial',
      pages: [
        {
          heading: 'Módulo 1/3 — Regra Estrita de Versão (Firewall & Hasher vs Cracker)',
          body: 'Para invadir por Força-Bruta, seu Cracker.crc precisa estar ATIVO na RAM e ter versão >= Firewall.fwl E >= Hasher.hash da vítima! Ter uma CPU rápida acelera o TEMPO do processo, mas NUNCA substitui a versão do software.'
        },
        {
          heading: 'Módulo 2/3 — Entrando via SSH e Operando Arquivos',
          body: 'Com a senha salva no Hacked Database, vá à guia Entrar para abrir o shell root@alvo. Lembre-se: se a vítima evoluir o Firewall ou Hasher depois, você precisará evoluir seu Cracker para continuar entrando!'
        },
        {
          heading: 'Módulo 3/3 — Regra de Ouro: Apague seu IP na Saída',
          body: 'Antes de desconectar do servidor invadido, abra a sub-aba Logs (/var/log/syslog), apague todas as linhas com seu IP público e clique em Salvar / Reescrever Syslog.'
        }
      ]
    },
    {
      id: 3,
      code: 'CERT-201',
      title: 'Exploits FTP/SSH, PortScan & Reconhecimento Nmap',
      cost: 250,
      repReward: 120,
      unlockBadge: 'Domínio FTP/SSH & Bank Hack',
      bonusDesc: '+120 REP · Destrava táticas avançadas de Exploit Dual (FTP+SSH = Root) e Contas Bancárias',
      pages: [
        {
          heading: 'Módulo 1/2 — Mapeamento de Portas com PortScan.scan',
          body: 'Mantenha PortScan.scan ativo na RAM e execute a varredura na aba Invadir para sondar as portas 21/FTP e 22/SSH contra o Firewall.fwl do alvo.'
        },
        {
          heading: 'Módulo 2/2 — Permissões FTP vs SSH vs ROOT',
          body: 'FTP_Exploit.exp >= Firewall libera transferência de arquivos (Download/Upload); SSH_Exploit.exp >= Firewall libera execução/deleção; rodar AMBOS acima do Firewall concede acesso ROOT completo sem precisar da senha!'
        }
      ]
    },
    {
      id: 4,
      code: 'CERT-301',
      title: 'Engenharia de Vírus, Torrent, Mineração BTC & DDoS',
      cost: 800,
      repReward: 150,
      unlockBadge: 'Libera Ataques DDoS & +15% Coletor',
      bonusDesc: '+150 REP · Destrava Canhão DDoS (com DDoS_Breaker.vbrk) · +15% no Collector.vcol',
      pages: [
        {
          heading: 'Módulo 1/3 — As 5 Famílias de Vírus e o Tracker Torrent',
          body: 'Spam.vspam ($/CPU), Warez.vwarez ($/Banda — exige Torrent.torrent ativo na SUA RAM!), Miner.vminer (BTC/CPU), BankTrojan.vbank ($ alto) e DDoS_Node.vddos (Gbps).'
        },
        {
          heading: 'Módulo 2/3 — Antivírus vs Vírus & Formatar HD',
          body: 'Tanto nos alvos quanto no SEU PC, o Antivirus.av SÓ consegue remover vírus visíveis de versão <= Antivírus! Se um inimigo plantar um vírus mais forte que seu Antivírus, evolua seu Antivirus.av ou use Formatar HD (salvando backups no XHD!).'
        },
        {
          heading: 'Módulo 3/3 — Derrubando Procurados do FBI via DDoS',
          body: 'Ative o DDoS_Breaker.vbrk na sua RAM e plante DDoS_Node.vddos em múltiplos servidores para disparar ataques DDoS em Missões e capturar recompensas na Lista do FBI!'
        }
      ]
    },
    {
      id: 5,
      code: 'CERT-401',
      title: 'Defesa Cibernética & Mitigação Automática de DDoS',
      cost: 2000,
      repReward: 200,
      unlockBadge: 'Mitigação DDoS via Firewall.fwl',
      bonusDesc: '+200 REP · Medalha [GRADUADO MIT-HC] · Seu Firewall.fwl passa a mitigar/anular ataques DDoS!',
      pages: [
        {
          heading: 'Módulo 1/2 — Protegendo Seu PC (Firewall + Hasher + Antivirus)',
          body: 'Bots caçadores e jogadores rivais só conseguem invadir seu PC se os softwares de invasão deles superarem seu Firewall.fwl e Hasher.hash ativos na RAM!'
        },
        {
          heading: 'Módulo 2/2 — Mitigação DDoS Automática',
          body: 'Com esta certificação concluída, seu Firewall.fwl mitiga automaticamente ataques DDoS proporcionalmente à versão dele (podendo anular 100% do ataque em versões altas!).'
        }
      ]
    }
  ];

  class UniversityEngine {
    constructor() {
      this.userId = null;
      this.state = null;
      this.readingCourseId = null;
      this.readingPageIdx = 0;
    }

    storageKey(uid) {
      return `HC_UNIVERSITY_${uid || 'guest'}`;
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

      this.state = saved && Array.isArray(saved.completed) ? saved : { completed: [] };
      return this.state;
    }

    save() {
      if (!this.state) return;
      try {
        localStorage.setItem(this.storageKey(this.userId), JSON.stringify(this.state));
      } catch (e) {}
    }

    hasCert(certId) {
      this.ensureLoaded();
      return this.state.completed.includes(Number(certId));
    }

    getCompletedCount() {
      this.ensureLoaded();
      return this.state.completed.length;
    }

    openCourseReader(certId) {
      this.ensureLoaded();
      const course = CERT_COURSES.find((c) => c.id === certId);
      if (!course) return;
      if (certId > 1 && !this.hasCert(certId - 1)) {
        alert(`Pré-requisito pendente: conclua primeiro a Certificação #${certId - 1}!`);
        return;
      }
      this.readingCourseId = certId;
      this.readingPageIdx = 0;
      this.renderUI();
    }

    nextLessonPage() {
      const course = CERT_COURSES.find((c) => c.id === this.readingCourseId);
      if (!course) return;
      if (this.readingPageIdx < course.pages.length - 1) {
        this.readingPageIdx++;
        this.renderUI();
      }
    }

    prevLessonPage() {
      if (this.readingPageIdx > 0) {
        this.readingPageIdx--;
        this.renderUI();
      }
    }

    async completeCourse(certId) {
      this.ensureLoaded();
      const course = CERT_COURSES.find((c) => c.id === certId);
      if (!course) return { success: false, message: 'Curso inexistente.' };
      if (this.hasCert(certId)) return { success: true, already: true, message: 'Certificação já concluída!' };
      if (certId > 1 && !this.hasCert(certId - 1)) {
        return { success: false, message: `Conclua primeiro o Curso #${certId - 1}!` };
      }

      if (course.cost > 0) {
        if (!window.currentWallet || parseFloat(window.currentWallet.balance) < course.cost) {
          return { success: false, message: `Saldo insuficiente para a taxa acadêmica de ${fmtUsd(course.cost)}!` };
        }
        if (window.supabase && typeof window.supabase.rpc === 'function') {
          try {
            const { data } = await window.supabase.rpc('buy_black_market_item', {
              p_item_type: `university_cert_${certId}`,
              p_cost: course.cost
            });
            if (data && data.new_balance !== undefined) {
              window.currentWallet.balance = Number(data.new_balance);
            } else {
              window.currentWallet.balance = Math.max(0, parseFloat(window.currentWallet.balance) - course.cost);
            }
          } catch (e) {
            window.currentWallet.balance = Math.max(0, parseFloat(window.currentWallet.balance) - course.cost);
          }
        } else {
          window.currentWallet.balance = Math.max(0, parseFloat(window.currentWallet.balance) - course.cost);
        }
      }

      this.state.completed.push(certId);
      this.readingCourseId = null;
      this.save();

      if (window.currentProfile) {
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + course.repReward;
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('UNIVERSITY', `Certificação ${course.code} (${course.title}) concluída! (+${course.repReward} REP)`, 'success');
      }
      if (window.hackerAudio) window.hackerAudio.playCashChime();

      if (window.tutorialEngine) {
        window.tutorialEngine.onCertCompleted(certId);
      }
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
      return { success: true, message: `Diploma ${course.code} emitido! ${course.unlockBadge}` };
    }

    renderUI(containerId = 'universityAppBody') {
      const container = document.getElementById(containerId);
      if (!container) return;
      this.ensureLoaded();
      const ic = (n) => (window.HC && window.HC.icon ? window.HC.icon(n) : '');

      if (this.readingCourseId) {
        const course = CERT_COURSES.find((c) => c.id === this.readingCourseId);
        const page = course.pages[this.readingPageIdx];
        const isLast = this.readingPageIdx === course.pages.length - 1;
        const done = this.hasCert(course.id);

        container.innerHTML = `
          <div class="soft-frame">
            <div class="soft-tabs-bar">
              <div class="soft-tabs-left">
                <button type="button" class="soft-tab-btn active">
                  ${ic('book-open')} <span>${esc(course.code)} · Aula ${this.readingPageIdx + 1} de ${course.pages.length}</span>
                </button>
              </div>
              <button type="button" class="hc-btn ghost sm" onclick="window.universityEngine.readingCourseId=null;window.universityEngine.renderUI();">← Voltar à Grade</button>
            </div>

            <div style="padding:20px 22px;display:flex;flex-direction:column;gap:14px;">
              <div>
                <h2 style="font-size:18px;font-weight:700;margin-bottom:4px;">${esc(course.title)}</h2>
                <div class="hc-eyebrow" style="color:var(--hc-accent-text);">${esc(page.heading)}</div>
              </div>

              <div style="background:var(--hc-inset);border:1px solid var(--hc-border);border-radius:10px;padding:18px;font-size:14px;line-height:1.65;color:var(--hc-text);">
                ${esc(page.body)}
              </div>

              <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
                <div style="font-size:12.5px;color:var(--hc-text-2);">Vantagem do Diploma: <strong style="color:var(--hc-accent-text);">${esc(course.unlockBadge)}</strong></div>
                <div style="display:flex;gap:8px;">
                  ${this.readingPageIdx > 0
                    ? `<button type="button" class="hc-btn ghost sm" onclick="window.universityEngine.prevLessonPage()">← Anterior</button>`
                    : ''}
                  ${!isLast
                    ? `<button type="button" id="btnNextLesson" class="hc-btn primary sm" onclick="window.universityEngine.nextLessonPage()">Próxima Aula →</button>`
                    : (done
                        ? `<button type="button" class="hc-btn primary sm" onclick="window.universityEngine.readingCourseId=null;window.universityEngine.renderUI();">Concluir Revisão</button>`
                        : `<button type="button" id="btnFinishCert_${course.id}" class="hc-btn primary sm" onclick="window.handleCompleteCourse(${course.id})">
                             Emitir Certificado ${course.cost > 0 ? `(${fmtUsd(course.cost)})` : '(Grátis)'}
                           </button>`)}
                </div>
              </div>
            </div>
          </div>
        `;
        return;
      }

      const doneCount = this.getCompletedCount();
      const gradPct = Math.round((doneCount / 5) * 100);
      const r = 46;
      const cCirc = +(2 * Math.PI * r).toFixed(2);
      const offset = +(cCirc - (gradPct / 100) * cCirc).toFixed(2);

      const courseRows = CERT_COURSES.map((c) => {
        const done = this.hasCert(c.id);
        const unlocked = c.id === 1 || this.hasCert(c.id - 1);
        const costStr = c.cost === 0 ? 'Grátis' : `$ ${c.cost.toLocaleString('pt-BR')}`;
        const glyph = done ? 'defense' : (unlocked ? 'attack' : 'text');

        return `
          <tr class="${done ? 'row-running' : ''} ${!unlocked && !done ? 'row-hidden' : ''}">
            <td class="soft-col-icon">
              <span class="soft-mini-glyph kind-${glyph}"
                data-tip-title="${esc(c.code)} · ${esc(c.title)}"
                data-tip-meta="${done ? 'Concluído' : costStr}"
                data-tip-desc="${esc(c.unlockBadge)} — ${esc(c.bonusDesc)}">
                ${ic(done ? 'award' : (unlocked ? 'graduation-cap' : 'lock'))}
              </span>
            </td>
            <td>
              <span class="soft-name-trigger" tabindex="0"
                data-tip-title="${esc(c.title)}"
                data-tip-meta="${esc(c.code)}"
                data-tip-desc="${esc(c.unlockBadge)} — ${esc(c.bonusDesc)}">
                ${done ? '<span class="soft-run-dot"></span>' : ''}
                <span style="font-family:var(--hc-font-sans);font-weight:500;">${esc(c.title)}</span>
              </span>
            </td>
            <td class="soft-col-ver">${c.pages.length} aulas</td>
            <td class="soft-col-size" style="width:110px;color:${c.cost === 0 ? 'var(--hc-accent-text)' : 'var(--hc-warning-text)'};">${esc(costStr)}</td>
            <td class="soft-col-acts">
              <div class="soft-icon-actions">
                <button type="button" class="soft-icon-act ic-info" aria-label="Ver bônus de ${esc(c.title)}"
                  data-tip-title="${esc(c.unlockBadge)}" data-tip-meta="${esc(c.code)}" data-tip-desc="${esc(c.bonusDesc)}">
                  ${ic('info')}
                </button>
                <button type="button" id="btnOpenCourse_${c.id}" class="soft-icon-act ${done ? 'ic-hide' : 'ic-run'}" ${!unlocked && !done ? 'disabled' : ''}
                  aria-label="${done ? 'Revisar' : 'Estudar'} ${esc(c.title)}"
                  data-tip-title="${done ? 'Revisar aulas' : (!unlocked ? `Conclua o Curso #${c.id - 1} antes` : (c.cost === 0 ? 'Iniciar curso gratuito' : `Matricular (${costStr})`))}"
                  data-tip-meta="${c.pages.length} aulas"
                  data-tip-desc="${esc(c.bonusDesc)}"
                  onclick="window.universityEngine.openCourseReader(${c.id})">
                  ${ic(done ? 'book-open' : 'play')}
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      container.innerHTML = `
        <div class="soft-frame" id="universityExplorerMain">
          <div class="soft-tabs-bar">
            <div class="soft-tabs-left">
              <button type="button" class="soft-tab-btn active">
                ${ic('graduation-cap')} <span>Certificações Oficiais (${doneCount}/5)</span>
              </button>
            </div>
            <span class="hc-badge ${doneCount === 5 ? 'success' : 'info'}">${doneCount === 5 ? 'Graduado MIT-HC' : 'Matrículas Abertas'}</span>
          </div>

          <div class="soft-explorer-shell">
            <div class="soft-main-col">
              <div class="soft-table-wrap" role="region" aria-label="Grade de cursos e certificações">
                <table class="soft-table clean-hw-table">
                  <thead>
                    <tr>
                      <th class="soft-col-icon"></th>
                      <th>Curso &amp; Certificação</th>
                      <th class="soft-col-ver">Carga</th>
                      <th class="soft-col-size" style="width:110px;">Taxa</th>
                      <th class="soft-col-acts">Ações</th>
                    </tr>
                  </thead>
                  <tbody>${courseRows}</tbody>
                </table>
              </div>
            </div>

            <aside class="soft-side-bar">
              <div class="soft-donut-wrap">
                <svg class="soft-donut-svg" viewBox="0 0 116 116" aria-label="Progresso Acadêmico ${gradPct}%">
                  <circle cx="58" cy="58" r="${r}" fill="none" stroke="#222832" stroke-width="8"></circle>
                  <circle cx="58" cy="58" r="${r}" fill="none" stroke="#35b877" stroke-width="8"
                    stroke-linecap="round" stroke-dasharray="${cCirc}" stroke-dashoffset="${offset}" transform="rotate(-90 58 58)"></circle>
                  <text x="58" y="63" text-anchor="middle" fill="#ebeff4" font-family="var(--hc-font-mono)" font-size="18" font-weight="700">${gradPct}%</text>
                </svg>
                <div class="soft-donut-title">Progresso Acadêmico</div>
                <div class="soft-donut-numbers"><span class="used">${doneCount}</span> / <span>5 Diplomas</span></div>
              </div>

              <div class="soft-bays-box">
                <div class="soft-bay-row"><span>Acesso Inicial</span><span style="color:${this.hasCert(1) ? 'var(--hc-accent-text)' : 'var(--hc-text-3)'};">${this.hasCert(1) ? 'Ativo' : 'Pendente'}</span></div>
                <div class="soft-bay-row"><span>Tempo Cracker</span><span style="color:${this.hasCert(2) ? 'var(--hc-accent-text)' : 'var(--hc-text-3)'};">${this.hasCert(2) ? '+20% Vel.' : 'Padrão'}</span></div>
                <div class="soft-bay-row"><span>Exploit &amp; Banco</span><span style="color:${this.hasCert(3) ? 'var(--hc-accent-text)' : 'var(--hc-text-3)'};">${this.hasCert(3) ? 'Liberado' : 'Bloq.'}</span></div>
                <div class="soft-bay-row"><span>Canhão DDoS</span><span style="color:${this.hasCert(4) ? 'var(--hc-accent-text)' : 'var(--hc-text-3)'};">${this.hasCert(4) ? '+15% Col.' : 'Bloq.'}</span></div>
                <div class="soft-bay-row"><span>Escudo DDoS</span><span style="color:${this.hasCert(5) ? 'var(--hc-accent-text)' : 'var(--hc-text-3)'};">${this.hasCert(5) ? 'Protegido' : 'Inativo'}</span></div>
              </div>
            </aside>
          </div>
        </div>
      `;
    }
  }

  // =========================================================================
  // 2. TUTORIAL DE INVASÃO GUIADA EM 5 ETAPAS (ALVO 198.51.100.42)
  // =========================================================================
  const TUTORIAL_TARGET_IP = '198.51.100.42';

  class TutorialStoryEngine {
    constructor() {
      this.userId = null;
      this.state = null;
    }

    storageKey(uid) {
      return `HC_TUTORIAL_${uid || 'guest'}`;
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

      this.state = saved && saved.step ? saved : {
        step: 1, // 1..5, 6 = concluído
        completed: false,
        fileExtracted: false,
        virusPlanted: false,
        logsCleaned: false
      };
      return this.state;
    }

    save() {
      if (!this.state) return;
      try {
        localStorage.setItem(this.storageKey(this.userId), JSON.stringify(this.state));
      } catch (e) {}
    }

    isCompleted() {
      this.ensureLoaded();
      return !!this.state.completed;
    }

    getCurrentStepInfo() {
      this.ensureLoaded();
      if (this.state.completed) {
        return {
          completed: true,
          step: 5,
          title: 'Operação Numataka Concluída',
          desc: 'Você concluiu o treinamento de invasão e desbloqueou todos os contratos do submundo!',
          cta: 'Abrir Quadro de Missões',
          action: () => window.openWindow('winMissions')
        };
      }

      const s = this.state.step;
      if (s === 1) {
        return {
          completed: false,
          step: 1,
          badge: 'Tutorial · Etapa 1 de 5',
          title: 'Conclua o Curso #1 (Grátis) na Universidade',
          desc: 'Ensei Tankado (Numataka Corp) exige que você conclua a Certificação #1 gratuita antes de liberar o IP do servidor de teste.',
          cta: 'Abrir Universidade (Grátis)',
          action: () => {
            window.openWindow('winUniversity');
            window.universityEngine.openCourseReader(1);
          }
        };
      }
      if (s === 2) {
        return {
          completed: false,
          step: 2,
          badge: 'Tutorial · Etapa 2 de 5',
          title: `Invada o Servidor de Treinamento (${TUTORIAL_TARGET_IP})`,
          desc: `Abra ${TUTORIAL_TARGET_IP} na aba Internet, quebre a senha com Ataque Força-Bruta (ou Port Scan + Exploit) e conecte-se como root.`,
          cta: `Invadir ${TUTORIAL_TARGET_IP} →`,
          action: () => window.internetEngine.openIp(TUTORIAL_TARGET_IP, 'invadir')
        };
      }
      if (s === 3) {
        return {
          completed: false,
          step: 3,
          badge: 'Tutorial · Etapa 3 de 5',
          title: `Extraia o Dossiê ou Plante um Vírus em ${TUTORIAL_TARGET_IP}`,
          desc: `Conectado como root em ${TUTORIAL_TARGET_IP}, abra a sub-aba "Vírus, Carteira & Arquivos", clique em "Ler / Extrair" no arquivo dossie_tankado.txt ou instale um vírus!`,
          cta: `Abrir Arquivos de ${TUTORIAL_TARGET_IP} →`,
          action: () => {
            window.internetEngine.openIp(TUTORIAL_TARGET_IP, 'entrar');
            if (window.internetEngine.activeSshIp === TUTORIAL_TARGET_IP) {
              window.internetEngine.sshSubTab = 'files';
              window.internetEngine.render();
            }
          }
        };
      }
      if (s === 4) {
        return {
          completed: false,
          step: 4,
          badge: 'Tutorial · Etapa 4 de 5',
          title: `Apague seu IP do /var/log/syslog de ${TUTORIAL_TARGET_IP}`,
          desc: 'Regra vital de sobrevivência: vá à sub-aba Logs (/var/log/syslog) da máquina invadida, limpe todas as linhas com seu IP público e salve!',
          cta: `Limpar Log em ${TUTORIAL_TARGET_IP} →`,
          action: () => {
            window.internetEngine.openIp(TUTORIAL_TARGET_IP, 'entrar');
            if (window.internetEngine.activeSshIp === TUTORIAL_TARGET_IP) {
              window.internetEngine.sshSubTab = 'logs';
              window.internetEngine.render();
            }
          }
        };
      }
      return {
        completed: false,
        step: 5,
        badge: 'Tutorial · Etapa 5 de 5 (Recompensa Pronta!)',
        title: 'Resgate seu Pagamento Inicial ($ 350 HC + 0.00200 BTC)',
        desc: 'Invasão limpa sem deixar rastros! Clique para receber $ 350 HC, +0.00200000 BTC na carteira e liberar o Quadro de Missões.',
        cta: 'Resgatar $ 350 + 0.00200 BTC →',
        action: () => this.claimFinalReward()
      };
    }

    onCertCompleted(certId) {
      this.ensureLoaded();
      if (!this.state.completed && this.state.step === 1 && certId >= 1) {
        this.state.step = 2;
        if (window.currentWallet) {
          window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) + 80).toFixed(2);
        }
        this.save();
        if (typeof window.showToast === 'function') {
          window.showToast(`Etapa 1 concluída (+$ 80 HC)! Agora invada ${TUTORIAL_TARGET_IP} na aba Internet.`);
        }
      }
    }

    onHostHackedOrLoggedRoot(ip) {
      this.ensureLoaded();
      if (this.state.completed) return;
      if (ip === TUTORIAL_TARGET_IP && this.state.step <= 2) {
        this.state.step = 3;
        this.save();
        if (typeof window.showToast === 'function') {
          window.showToast('Etapa 2 concluída! Abra "Vírus, Carteira & Arquivos" para extrair dossie_tankado.txt ou plantar um vírus.');
        }
        if (typeof window.renderHome === 'function') window.renderHome();
      }
    }

    onFileReadOrVirusPlanted(ip) {
      this.ensureLoaded();
      if (this.state.completed) return;
      if (ip === TUTORIAL_TARGET_IP && this.state.step <= 3) {
        this.state.fileExtracted = true;
        this.state.step = 4;
        this.save();
        if (typeof window.showToast === 'function') {
          window.showToast('Etapa 3 concluída! Agora apague seu IP na aba Logs (/var/log/syslog) e salve!');
        }
        if (typeof window.renderHome === 'function') window.renderHome();
      }
    }

    notifyLogsSaved(ip, remainingLines) {
      this.ensureLoaded();
      if (this.state.completed) return;
      if (ip === TUTORIAL_TARGET_IP && this.state.step >= 3 && this.state.step <= 4) {
        const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '';
        const stillExposed = (remainingLines || []).some((l) => myIp && l.includes(myIp));
        if (!stillExposed) {
          this.state.logsCleaned = true;
          this.state.step = 5;
          this.save();
          if (typeof window.showToast === 'function') {
            window.showToast('Rastro apagado com perfeição! Resgate agora seu prêmio de $ 350 HC + 0.00200 BTC!');
          }
          if (typeof window.renderHome === 'function') window.renderHome();
          if (window.missionsEngine) window.missionsEngine.renderUI();
        }
      }
    }

    claimFinalReward() {
      this.ensureLoaded();
      if (this.state.completed || this.state.step < 5) return { success: false };

      this.state.completed = true;
      this.state.step = 6;
      this.save();

      if (window.currentWallet) {
        window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) + 350).toFixed(2);
      }
      if (window.bitcoinEngine) {
        window.bitcoinEngine.creditSats(200000, 'TUTORIAL', 'Pagamento inicial Numataka // Conclusão da Invasão Tutorial (+0.00200000 BTC)');
      }
      if (window.currentProfile) {
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 120;
      }

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('STORY-OK', 'Invasão Tutorial Numataka concluída! Recebido +$ 350.00 HC, +0.00200000 BTC e +120 REP.', 'success');
      }
      if (window.hackerAudio) window.hackerAudio.playMoneyCollect();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.missionsEngine) window.missionsEngine.renderUI();
      if (typeof window.showToast === 'function') {
        window.showToast('Parabéns! Você recebeu $ 350 HC + 0.00200000 BTC e liberou todos os contratos!');
      }
      return { success: true };
    }
  }

  // =========================================================================
  // 3. QUADRO DE MISSÕES POR MENSAGEM/E-MAIL COM MINI-HISTÓRIA E VERIFICAÇÃO REAL
  // =========================================================================
  const HIRERS_DIRECTORY = [
    { name: 'Geek Pride Labs', ip: '239.231.94.245', email: 'ops@geekpridelabs.hc', icon: 'terminal' },
    { name: 'Meridian BioLabs', ip: '194.88.14.202', email: 'board@meridian.hc', icon: 'database' },
    { name: 'Coletivo Vagalume', ip: '177.54.99.18', email: 'cipher@vagalume.hc', icon: 'bug' },
    { name: 'Orion Syndicate', ip: '89.207.132.41', email: 'vault@orion.hc', icon: 'bitcoin' },
    { name: 'Helios Clearing', ip: '91.198.174.192', email: 'exec@helios.hc', icon: 'landmark' },
    { name: 'Kestrel Defense', ip: '198.18.44.9', email: 'blackops@kestrel.hc', icon: 'radar' }
  ];

  const MISSION_TARGETS = [
    { ip: '203.17.88.40', hostname: 'Farofa Systems S.A.', tier: 1, balanceHint: 185 },
    { ip: '133.70.13.37', hostname: 'Rádio Pirata 1337 FM', tier: 1, balanceHint: 110 },
    { ip: '187.22.5.60', hostname: 'Boteco h4x0r', tier: 1, balanceHint: 260 },
    { ip: '58.40.12.9', hostname: 'Corvo Cinza Logística', tier: 2, balanceHint: 340 },
    { ip: '185.220.101.9', hostname: 'Blackmarket Onion', tier: 2, balanceHint: 420 },
    { ip: '77.3.9.21', hostname: 'Banco Colchão & Clearing HC', tier: 3, balanceHint: 1150 },
    { ip: '194.88.14.202', hostname: 'Meridian BioLabs S.A.', tier: 1, balanceHint: 290 },
    { ip: '172.66.40.18', hostname: 'Aegis Security & Vaults S.A.', tier: 1, balanceHint: 310 }
  ];

  class MissionsBoardEngine {
    constructor() {
      this.userId = null;
      this.state = null;
      this.mainTab = 'campaign'; // 'campaign' | 'dynamic'
      this.subTab = 'available'; // 'available' | 'current' | 'completed'
      this.filterTier = 0;       // 0 = todos
      this.lastVerifyFeedback = null;
    }

    storageKey(uid) {
      return `HC_MISSIONS_${uid || 'guest'}`;
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

      if (saved && Array.isArray(saved.pool)) {
        this.state = {
          downloadedFiles: [],
          deletedFiles: [],
          ...saved
        };
      } else {
        this.state = {
          activeMission: null,
          pool: [],
          history: [],
          downloadedFiles: [],
          deletedFiles: [],
          completedCount: 0,
          abortedCount: 0
        };
        this.generatePool();
      }
      // Garante que contratos legados tenham hirerIp e as novas missões de Câmera de Segurança (CFTV)
      const hasCctvInPoolOrActive = this.state.pool.some((m) => m.type === 'cctv_hack') ||
        (this.state.activeMission && this.state.activeMission.type === 'cctv_hack');
      if ((this.state.pool.length > 0 && !this.state.pool[0].hirerIp) || !hasCctvInPoolOrActive) {
        this.generatePool();
      }
      return this.state;
    }

    save() {
      if (!this.state) return;
      try {
        localStorage.setItem(this.storageKey(this.userId), JSON.stringify(this.state));
      } catch (e) {}
    }

    generatePool() {
      const nowStamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const templates = [
        {
          type: 'cctv_hack',
          badge: 'Invadir Câmera CFTV',
          tier: 1,
          hirerIdx: 2,
          targetIdx: 0,
          camCode: 'CAM-03',
          camRoom: 'Sala da Diretoria Executiva',
          cctvObjective: 'capture',
          rewardCash: 920,
          rewardSats: 0,
          repReward: 95,
          brief: 'Invadir 203.17.88.40 (Farofa Systems S.A.), abrir o painel Câmeras Ao Vivo (CFTV) na CAM-03 (Sala da Diretoria) e gravar o vídeo ao vivo (.mp4) como prova.'
        },
        {
          type: 'cctv_hack',
          badge: 'Sabotar CFTV Ao Vivo',
          tier: 1,
          hirerIdx: 3,
          targetIdx: 6,
          camCode: 'CAM-01',
          camRoom: 'Laboratório Limpo P&D Nível 3',
          cctvObjective: 'loop',
          rewardCash: 1100,
          rewardSats: 25000,
          repReward: 110,
          brief: 'Invadir o NVR da Meridian BioLabs S.A. (194.88.14.202), abrir Câmeras Ao Vivo na CAM-01 (Laboratório Limpo P&D) e injetar um Loop Falso para cegar a segurança.'
        },
        {
          type: 'steal_data',
          badge: 'Roubar Arquivo',
          tier: 1,
          hirerIdx: 0,
          targetIdx: 0,
          fileName: 'Users.dat',
          fileSizeMb: 28,
          fileContent: 'DUMP CONFIDENCIAL DE CREDENCIAIS CORPORATIVAS // FAROFA SYSTEMS S.A.',
          rewardCash: 650,
          rewardSats: 0,
          repReward: 70,
          brief: 'Invadir 203.17.88.40 (Farofa Systems S.A.) e baixar o arquivo Users.dat (28 MB) para o seu computador.'
        },
        {
          type: 'delete_file',
          badge: 'Deletar Arquivo',
          tier: 1,
          hirerIdx: 1,
          targetIdx: 1,
          fileName: 'Auditoria_Fiscal_2026.db',
          fileSizeMb: 42,
          fileContent: 'Registros fiscais sigilosos solicitados para destruição imediata.',
          rewardCash: 580,
          rewardSats: 0,
          repReward: 65,
          brief: 'Invadir 133.70.13.37 (Rádio Pirata 1337 FM) e excluir permanentemente o arquivo Auditoria_Fiscal_2026.db (42 MB) do servidor deles.'
        },
        {
          type: 'install_virus',
          badge: 'Instalar Vírus',
          tier: 1,
          hirerIdx: 2,
          targetIdx: 0,
          virusKey: 'vspam',
          virusFilename: 'Spam.vspam',
          rewardCash: 780,
          rewardSats: 0,
          repReward: 85,
          brief: 'Invadir 203.17.88.40, subir o vírus Spam.vspam e executá-lo (⚙️) para deixá-lo rodando em segundo plano no PC da vítima.'
        },
        {
          type: 'cctv_hack',
          badge: 'Vigiar Doca CFTV',
          tier: 2,
          hirerIdx: 5,
          targetIdx: 3,
          camCode: 'CAM-01',
          camRoom: 'Doca Sul & Pátio de Contêineres',
          cctvObjective: 'capture',
          rewardCash: 1480,
          rewardSats: 55000,
          repReward: 135,
          brief: 'Invadir 58.40.12.9 (Corvo Cinza Logística), abrir a câmera ao vivo CAM-01 (Doca Subterrânea & AGV) e capturar a gravação da carga.'
        },
        {
          type: 'install_virus',
          badge: 'Plantar Minerador',
          tier: 2,
          hirerIdx: 3,
          targetIdx: 3,
          virusKey: 'vminer',
          virusFilename: 'Miner.vminer',
          rewardCash: 1250,
          rewardSats: 45000,
          repReward: 115,
          brief: 'Invadir 58.40.12.9 (Corvo Cinza Logística), enviar Miner.vminer e deixá-lo rodando ativo na memória do alvo.'
        },
        {
          type: 'drain_funds',
          badge: 'Drenar Cofre',
          tier: 2,
          hirerIdx: 4,
          targetIdx: 4,
          rewardCash: 950,
          rewardSats: 65000,
          repReward: 125,
          brief: 'Invadir 185.220.101.9 (Blackmarket Onion) como root e esvaziar a reserva financeira ou carteira BTC do servidor.'
        },
        {
          type: 'ddos_takedown',
          badge: 'Ataque DDoS',
          tier: 3,
          hirerIdx: 5,
          targetIdx: 5,
          requiredGbps: 2.5,
          rewardCash: 1850,
          rewardSats: 180000,
          repReward: 195,
          brief: 'Lançar sobrecarga DDoS (>= 2.5 Gbps ou Curso #4) contra o mainframe 77.3.9.21 (Banco Colchão & Clearing HC).'
        }
      ];

      this.state.pool = templates.map((tpl, idx) => {
        const tgt = MISSION_TARGETS[tpl.targetIdx];
        const hirerObj = HIRERS_DIRECTORY[tpl.hirerIdx % HIRERS_DIRECTORY.length];
        return {
          id: 'MSN-' + (100 + idx) + '-' + Math.floor(100 + Math.random() * 899),
          hirer: hirerObj.name,
          hirerIp: hirerObj.ip,
          hirerEmail: hirerObj.email,
          hirerIcon: hirerObj.icon,
          sentAt: nowStamp,
          type: tpl.type,
          badge: tpl.badge,
          tier: tpl.tier,
          targetIp: tgt.ip,
          targetHostname: tgt.hostname,
          camCode: tpl.camCode || null,
          camRoom: tpl.camRoom || null,
          cctvObjective: tpl.cctvObjective || null,
          cctvVerified: false,
          fileName: tpl.fileName || null,
          fileSizeMb: tpl.fileSizeMb || 24,
          fileContent: tpl.fileContent || null,
          virusKey: tpl.virusKey || null,
          virusFilename: tpl.virusFilename || null,
          expectedAmount: tpl.expectedAmount || tgt.balanceHint,
          requiredGbps: tpl.requiredGbps || 0,
          rewardCash: tpl.rewardCash,
          rewardSats: tpl.rewardSats,
          repReward: tpl.repReward,
          brief: tpl.brief,
          downloadedToLocal: false,
          deletedOnRemote: false,
          drainedConfirmed: false,
          progressDone: false
        };
      });
      this.save();
    }

    buildPlainEmailBody(m, playerTag) {
      if (m.type === 'cctv_hack') {
        const actTxt = m.cctvObjective === 'loop'
          ? `injetar um Loop Falso no sinal de vídeo da câmera ${m.camCode} (${m.camRoom})`
          : `assistir e gravar o vídeo ao vivo (.mp4) da câmera ${m.camCode} (${m.camRoom})`;
        return `${playerTag},\n\nNós da ${m.hirer} precisamos de acesso visual imediato às câmeras internas de ${m.targetHostname} (${m.targetIp}).\nInvada o servidor deles, abra a aba "Câmeras Ao Vivo (CFTV)" e vá até ${m.camCode} (${m.camRoom}) para ${actTxt}.\n\nPagamento: $${m.rewardCash} assim que confirmarmos a operação no NVR.\nNão esqueça de apagar seu IP da log antes de sair!\n\n— ${m.hirer} [${m.hirerIp}]`;
      }
      if (m.type === 'steal_data') {
        return `${playerTag},\n\nNós da ${m.hirer} temos uma proposta confidencial para você.\nPrecisamos que você acesse os servidores de ${m.targetHostname} (${m.targetIp}) e baixe uma cópia do arquivo "${m.fileName}" (${m.fileSizeMb} MB) para o seu computador.\n\nPagamento: $${m.rewardCash} quando confirmarmos que o arquivo está salvo com você.\nFaça isso em silêncio, apague seu IP da log e lembre-se: se for pego, nós não conhecemos você.\n\n— ${m.hirer} [${m.hirerIp}]`;
      }
      if (m.type === 'delete_file') {
        return `${playerTag},\n\nVazaram documentos críticos para o servidor de ${m.targetHostname} (${m.targetIp}).\nInvada a máquina deles, localize o arquivo "${m.fileName}" (${m.fileSizeMb} MB) e exclua-o permanentemente do disco antes que terceiros façam cópias.\n\nPagamento: $${m.rewardCash} mediante verificação de exclusão.\n\n— ${m.hirer} [${m.hirerIp}]`;
      }
      if (m.type === 'install_virus') {
        return `${playerTag},\n\nQueremos infiltrar a máquina de ${m.targetHostname} (${m.targetIp}).\nSuba o vírus "${m.virusFilename}" para o disco da vítima e clique em Rodar (⚙️) para deixá-lo ativo em segundo plano.\n\nPagamento: $${m.rewardCash} assim que nosso scanner confirmar o processo "${m.virusFilename}" rodando em ${m.targetIp}.\n\n— ${m.hirer} [${m.hirerIp}]`;
      }
      if (m.type === 'drain_funds') {
        return `${playerTag},\n\nRastreamos fundos ilícitos guardados no servidor ${m.targetHostname} (${m.targetIp}).\nEntre como root e drene a reserva financeira local ou a carteira BTC deles.\n\nPagamento extra do contrato: $${m.rewardCash}.\n\n— ${m.hirer} [${m.hirerIp}]`;
      }
      return `${playerTag},\n\nPrecisamos tirar ${m.targetHostname} (${m.targetIp}) do ar com um ataque de sobrecarga DDoS.\n\nPagamento: $${m.rewardCash}.\n\n— ${m.hirer} [${m.hirerIp}]`;
    }

    buildStoryRichHtml(m, playerTag) {
      const ipLink = `<span class="msn-hl-ip" onclick="window.internetEngine.openIp('${esc(m.targetIp)}', '${m.type === 'cctv_hack' ? 'cctv' : 'invadir'}')">${esc(m.targetIp)}</span>`;
      const moneySpan = `<span class="msn-hl-money">$${m.rewardCash.toLocaleString('pt-BR')}</span>`;

      if (m.type === 'cctv_hack') {
        if (m.cctvObjective === 'loop') {
          return `<strong>${esc(playerTag)}</strong>, nossa equipe de campo vai entrar nas instalações da <strong>${esc(m.targetHostname)}</strong>, mas o circuito de câmeras está monitorando tudo ao vivo. Invada o NVR deles em ${ipLink}, abra o console <strong>Câmeras Ao Vivo (CFTV)</strong>, selecione <span class="msn-hl-file">${esc(m.camCode)} · ${esc(m.camRoom)}</span> e clique em <strong>Injetar Loop Falso</strong> para cegar os vigilantes. Pagaremos ${moneySpan} na hora que o sinal estiver em loop!`;
        }
        return `<strong>${esc(playerTag)}</strong>, recebemos informações de movimentação secreta dentro da <strong>${esc(m.targetHostname)}</strong> e precisamos do flagrante em vídeo. Invada o servidor em ${ipLink}, entre em <strong>Câmeras Ao Vivo (CFTV)</strong>, abra a câmera <span class="msn-hl-file">${esc(m.camCode)} · ${esc(m.camRoom)}</span> ao vivo e clique em <strong>Gravar Prova Ao Vivo (.mp4)</strong>. Depositaremos ${moneySpan} assim que a gravação estiver salva com você!`;
      }
      if (m.type === 'steal_data') {
        return `<strong>${esc(playerTag)}</strong>, nós da <strong>${esc(m.hirer)}</strong> temos uma proposta para você. Precisamos que você invada os servidores de <strong>${esc(m.targetHostname)}</strong> e baixe o arquivo <span class="msn-hl-file">${esc(m.fileName)}</span> (${m.fileSizeMb} MB) para o seu computador. Você receberá ${moneySpan} assim que o trabalho for verificado. Acesse o alvo em ${ipLink}. Faça tudo em silêncio, limpe seu IP da log e lembre-se: se você for pego, nunca ouvimos falar de você.`;
      }
      if (m.type === 'delete_file') {
        return `<strong>${esc(playerTag)}</strong>, vazaram registros internos que jamais poderiam sair da <strong>${esc(m.hirer)}</strong> e agora estão guardados no servidor de <strong>${esc(m.targetHostname)}</strong>. Invada ${ipLink}, localize o arquivo <span class="msn-hl-file">${esc(m.fileName)}</span> (${m.fileSizeMb} MB) e <strong>exclua-o permanentemente</strong> do disco da vítima. Você receberá ${moneySpan} assim que verificarmos que o arquivo não existe mais lá.`;
      }
      if (m.type === 'install_virus') {
        return `<strong>${esc(playerTag)}</strong>, nós do <strong>${esc(m.hirer)}</strong> precisamos comprometer a infraestrutura de <strong>${esc(m.targetHostname)}</strong>. Invada o servidor em ${ipLink}, faça upload do vírus <span class="msn-hl-virus">${esc(m.virusFilename)}</span> e execute-o para deixá-lo <strong>rodando em segundo plano</strong> na máquina da vítima. Pagamos ${moneySpan} assim que nossa varredura confirmar que o vírus está ativo lá dentro.`;
      }
      if (m.type === 'drain_funds') {
        return `<strong>${esc(playerTag)}</strong>, a <strong>${esc(m.hirer)}</strong> localizou reservas ocultas em <strong>${esc(m.targetHostname)}</strong> (${ipLink}). Quebre o acesso root e execute a drenagem da reserva financeira ou carteira BTC deles. Além do valor saqueado, depositaremos ${moneySpan} pela confirmação do serviço.`;
      }
      return `<strong>${esc(playerTag)}</strong>, a <strong>${esc(m.hirer)}</strong> autorizou um ataque de sobrecarga DDoS contra <strong>${esc(m.targetHostname)}</strong> (${ipLink}). Reúna pelo menos <strong>${m.requiredGbps} Gbps</strong> (ou Certificação #4) e derrube o mainframe alvo para receber ${moneySpan}.`;
    }

    getPlayerAllowedTier() {
      const crcVer = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('cracker') : 1.0;
      const rep = (window.currentProfile && window.currentProfile.reputation) || 0;
      if (crcVer >= 2.5 || rep >= 900) return 3;
      if (crcVer >= 1.5 || rep >= 350) return 2;
      return 1;
    }

    setSubTab(tab) {
      this.subTab = tab || 'available';
      this.lastVerifyFeedback = null;
      this.renderUI();
    }

    acceptMission(missionId) {
      this.ensureLoaded();
      if (this.state.activeMission) {
        this.subTab = 'current';
        this.renderUI();
        return { success: false, message: 'Você já possui uma missão em andamento! Conclua ou abandone-a na aba Missão Atual.' };
      }
      const found = this.state.pool.find((m) => m.id === missionId);
      if (!found) return { success: false, message: 'Contrato não encontrado no quadro.' };

      const maxTier = this.getPlayerAllowedTier();
      if (found.tier > maxTier) {
        return {
          success: false,
          message: `Este contrato exige Nível ${found.tier} (evolua seu Cracker.crc ou acumule mais Reputação primeiro).`
        };
      }

      const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
      this.state.activeMission = {
        ...found,
        acceptedAt: nowStr,
        downloadedToLocal: false,
        deletedOnRemote: false,
        drainedConfirmed: false,
        progressDone: false
      };
      this.state.pool = this.state.pool.filter((m) => m.id !== missionId);
      this.subTab = 'current';
      this.lastVerifyFeedback = null;
      this.save();

      // Envia de verdade a mensagem por E-mail na Caixa de Entrada do jogador!
      const playerTag = (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador';
      if (window.mailEngine && typeof window.mailEngine.pushSystemMail === 'function') {
        window.mailEngine.pushSystemMail(
          `${found.hirer} <${found.hirerEmail || 'contrato@rede.hc'}>`,
          `[Missão ${found.id}] ${found.badge} — Alvo ${found.targetIp}`,
          this.buildPlainEmailBody(found, playerTag),
          'story'
        );
      }

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('MISSION', `Missão ${found.id} (${found.badge}) recebida por e-mail de ${found.hirer} -> Alvo ${found.targetIp}`, 'info');
      }
      if (typeof window.renderHome === 'function') window.renderHome();
      this.renderUI();
      return { success: true, mission: this.state.activeMission };
    }

    abortActiveMission() {
      this.ensureLoaded();
      const m = this.state.activeMission;
      if (!m) return;

      const penalty = Math.min(50, Math.round((window.currentProfile?.reputation || 0) * 0.05));
      if (window.currentProfile) {
        window.currentProfile.reputation = Math.max(0, (window.currentProfile.reputation || 0) - penalty);
      }
      this.state.abortedCount = (this.state.abortedCount || 0) + 1;
      this.state.history.unshift({
        id: m.id,
        badge: m.badge,
        hirer: m.hirer,
        targetIp: m.targetIp,
        targetHostname: m.targetHostname,
        objectiveStr: m.fileName || m.virusFilename || m.badge,
        status: 'ABANDONADA',
        rewardStr: `-${penalty} REP`,
        at: new Date().toLocaleTimeString()
      });
      this.state.activeMission = null;
      this.subTab = 'available';
      this.lastVerifyFeedback = null;
      if (this.state.pool.length < 4) this.generatePool();
      this.save();

      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
    }

    // Verifica de verdade se o jogador cumpriu exatamente o objetivo pedido no servidor da vítima!
    verifyActiveMissionStatus() {
      this.ensureLoaded();
      const m = this.state.activeMission;
      if (!m) return { verified: false, reason: 'Nenhuma missão ativa.' };

      const hacked = window.hackedDb ? !!window.hackedDb.getEntry(m.targetIp) : false;

      if (m.type === 'cctv_hack') {
        const doneByEngine = window.cctvEngine
          ? (m.cctvObjective === 'loop'
              ? window.cctvEngine.isCameraLooped(m.targetIp, m.camCode)
              : window.cctvEngine.hasCapturedCamera(m.targetIp, m.camCode))
          : false;
        const verified = !!m.cctvVerified || doneByEngine;
        if (!verified) {
          const reqAction = m.cctvObjective === 'loop' ? 'Injetar Loop Falso' : 'Gravar Prova Ao Vivo (.mp4)';
          return {
            verified: false,
            hacked,
            reason: `Invada ${m.targetIp}, clique em "Câmeras Ao Vivo (CFTV)", abra ${m.camCode} (${m.camRoom}) e clique em "${reqAction}"!`
          };
        }
        return {
          verified: true,
          hacked: true,
          detail: m.cctvObjective === 'loop'
            ? `Loop fantasma confirmado na câmera ${m.camCode} (${m.camRoom}) de ${m.targetIp}!`
            : `Vídeo ao vivo de ${m.camCode} (${m.camRoom}) capturado com sucesso em ${m.targetIp}!`
        };
      }

      if (m.type === 'steal_data') {
        const hasDownloaded = !!m.downloadedToLocal ||
          (Array.isArray(this.state.downloadedFiles) && this.state.downloadedFiles.some((f) => f.ip === m.targetIp && f.fileName === m.fileName));
        if (!hasDownloaded) {
          return {
            verified: false,
            hacked,
            reason: `Arquivo "${m.fileName}" ainda NÃO foi baixado para o seu computador. Conecte em ${m.targetIp}, abra "Arquivos & Programas" e clique no ícone de Download (⬇️) ao lado de ${m.fileName}!`
          };
        }
        return { verified: true, hacked: true, detail: `Arquivo ${m.fileName} (${m.fileSizeMb} MB) verificado no seu computador!` };
      }

      if (m.type === 'delete_file') {
        const wasDeleted = !!m.deletedOnRemote ||
          (Array.isArray(this.state.deletedFiles) && this.state.deletedFiles.some((f) => f.ip === m.targetIp && f.fileName === m.fileName)) ||
          !!(window.internetEngine && window.internetEngine.deletedHostFiles && window.internetEngine.deletedHostFiles.get(m.targetIp)?.has(m.fileName));
        if (!wasDeleted) {
          return {
            verified: false,
            hacked,
            reason: `O arquivo "${m.fileName}" AINDA existe no servidor ${m.targetIp}! Entre no PC da vítima e clique no ícone de Lixeira (🗑️) ao lado de ${m.fileName} para apagá-lo.`
          };
        }
        return { verified: true, hacked: true, detail: `Confirmado: ${m.fileName} foi permanentemente apagado de ${m.targetIp}!` };
      }

      if (m.type === 'install_virus') {
        const runningList = window.softwareEngine ? window.softwareEngine.getRemoteVirusesOnIp(m.targetIp) : [];
        const stagedList = window.softwareEngine ? window.softwareEngine.getStagedVirusesOnIp(m.targetIp) : [];
        const isRunning = runningList.some((rv) => rv.virusKey === m.virusKey);
        if (!isRunning) {
          const isOnlyStaged = stagedList.some((sv) => sv.virusKey === m.virusKey);
          return {
            verified: false,
            hacked,
            reason: isOnlyStaged
              ? `Quase lá! Você subiu ${m.virusFilename} para ${m.targetIp}, mas ainda falta clicar na engrenagem Rodar (⚙️) para deixá-lo em execução na vítima!`
              : `O vírus "${m.virusFilename}" ainda NÃO está rodando em ${m.targetIp}. Invada o alvo, faça upload de ${m.virusFilename} e clique em Rodar (⚙️)!`
          };
        }
        return { verified: true, hacked: true, detail: `Scanner confirmou: ${m.virusFilename} está ativo e rodando em ${m.targetIp}!` };
      }

      if (m.type === 'drain_funds') {
        const drained = !!m.drainedConfirmed || !!(window.internetEngine && window.internetEngine.drainedNpcIps && window.internetEngine.drainedNpcIps.has(m.targetIp));
        if (!drained) {
          return {
            verified: false,
            hacked,
            reason: `Os fundos de ${m.targetIp} ainda não foram esvaziados. Conecte como root em ${m.targetIp} e clique em Drenar Reserva / Roubar Carteira!`
          };
        }
        return { verified: true, hacked: true, detail: `Cofre de ${m.targetIp} esvaziado com sucesso!` };
      }

      if (m.type === 'ddos_takedown') {
        if (!m.progressDone) {
          return {
            verified: false,
            hacked,
            reason: `Execute o disparo de sobrecarga DDoS contra ${m.targetIp} para concluir este contrato.`
          };
        }
        return { verified: true, hacked: true, detail: `Alvo ${m.targetIp} derrubado por DDoS!` };
      }

      return { verified: !!m.progressDone, hacked, reason: 'Objetivo ainda pendente.' };
    }

    verifyAndClaimActiveMission() {
      this.ensureLoaded();
      const m = this.state.activeMission;
      if (!m) return { success: false, message: 'Nenhuma missão ativa.' };

      if (m.type === 'ddos_takedown' && !m.progressDone) {
        return this.executeMissionDdos();
      }

      const check = this.verifyActiveMissionStatus();
      if (!check.verified) {
        this.lastVerifyFeedback = { ok: false, text: check.reason };
        this.renderUI();
        if (typeof window.showToast === 'function') window.showToast(check.reason);
        return { success: false, message: check.reason };
      }

      this.lastVerifyFeedback = null;
      return this.completeActiveMission();
    }

    // Arquivos dinâmicos injetados no /root do alvo enquanto a missão está ativa!
    getMissionFilesForHost(ip) {
      this.ensureLoaded();
      const files = [];
      if (ip === TUTORIAL_TARGET_IP) {
        files.push({
          name: 'dossie_tankado.txt',
          size: '12 KB',
          sizeMb: 1,
          content: 'Prova de intrusão Numataka. Extraia este arquivo e apague seu IP na aba Logs!',
          isTutorial: true,
          canDelete: false
        });
      }
      const m = this.state.activeMission;
      if (m && m.targetIp === ip && m.fileName && !m.deletedOnRemote) {
        files.push({
          name: m.fileName,
          size: `${m.fileSizeMb || 28} MB`,
          sizeMb: m.fileSizeMb || 28,
          content: m.fileContent,
          missionId: m.id,
          canDelete: true,
          canSteal: true
        });
      }
      return files;
    }

    notifyRemoteFileAction(ip, fileName, actionKind) {
      this.ensureLoaded();
      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';
      if (window.internetEngine) {
        window.internetEngine.appendServerLog(
          ip,
          `${myIp} ${actionKind === 'delete' ? 'deleted critical file' : 'downloaded confidential file'} /root/${fileName}`
        );
      }

      if (ip === TUTORIAL_TARGET_IP && window.tutorialEngine) {
        window.tutorialEngine.onFileReadOrVirusPlanted(ip);
      }

      const m = this.state.activeMission;
      if (m && m.targetIp === ip && m.fileName === fileName) {
        if (actionKind === 'read') {
          m.downloadedToLocal = true;
          this.state.downloadedFiles = [
            { ip, fileName, at: new Date().toLocaleTimeString() },
            ...(this.state.downloadedFiles || []).filter((x) => !(x.ip === ip && x.fileName === fileName))
          ];
          this.save();
          if (typeof window.showToast === 'function') {
            window.showToast(`✓ Arquivo ${fileName} baixado para o seu PC! Vá em Missões → Missão Atual para verificar e receber $${m.rewardCash}!`);
          }
          this.renderUI();
          return { success: true, downloaded: true };
        }
        if (actionKind === 'delete') {
          m.deletedOnRemote = true;
          this.state.deletedFiles = [
            { ip, fileName, at: new Date().toLocaleTimeString() },
            ...(this.state.deletedFiles || [])
          ];
          this.save();
          if (window.safenetFbiEngine) {
            window.safenetFbiEngine.evaluatePlayerCrime('Sabotagem e destruição de arquivo corporativo', 1200, ip);
          }
          if (typeof window.showToast === 'function') {
            window.showToast(`✓ Arquivo ${fileName} excluído de ${ip}! Vá em Missões → Missão Atual para verificar e receber $${m.rewardCash}!`);
          }
          this.renderUI();
          return { success: true, deleted: true };
        }
      }
      return { success: true };
    }

    notifyCctvAction(ip, camCode, actionKind) {
      this.ensureLoaded();
      const m = this.state.activeMission;
      if (!m || m.type !== 'cctv_hack' || m.targetIp !== ip) return;
      if (m.camCode && m.camCode !== camCode) return;

      const wanted = m.cctvObjective || 'capture';
      if (actionKind === wanted) {
        m.cctvVerified = true;
        m.progressDone = true;
        this.save();
        if (typeof window.showToast === 'function') {
          window.showToast(`✓ Objetivo CFTV cumprido em ${camCode}! Vá em Missões → Missão Atual para receber $${m.rewardCash}!`);
        }
        this.renderUI();
      }
    }

    notifyHostDrained(ip) {
      this.ensureLoaded();
      const m = this.state.activeMission;
      if (m && m.targetIp === ip && m.type === 'drain_funds') {
        m.drainedConfirmed = true;
        m.progressDone = true;
        this.save();
        if (typeof window.showToast === 'function') {
          window.showToast(`✓ Cofre de ${ip} drenado! Vá em Missões → Missão Atual para receber o pagamento do contrato!`);
        }
        this.renderUI();
      }
    }

    submitBalanceCheck(typedVal) {
      this.ensureLoaded();
      const m = this.state.activeMission;
      if (!m || m.type !== 'check_balance') return { success: false, message: 'Nenhuma auditoria ativa.' };

      const hacked = window.hackedDb ? window.hackedDb.getEntry(m.targetIp) : null;
      if (!hacked) {
        return { success: false, message: `Invada ${m.targetIp} primeiro para inspecionar o saldo real!` };
      }

      const cleanNum = Math.round(Number(String(typedVal || '').replace(/[^0-9.]/g, '')));
      if (cleanNum !== m.expectedAmount && cleanNum !== 0) {
        return { success: false, message: `Valor incorreto! Conecte via SSH em ${m.targetIp} e confira o valor da Reserva Local ($ ${m.expectedAmount}).` };
      }

      m.progressDone = true;
      this.save();
      return this.completeActiveMission();
    }

    executeMissionDdos() {
      this.ensureLoaded();
      const m = this.state.activeMission;
      if (!m || m.type !== 'ddos_takedown') return { success: false, message: 'Nenhum contrato DDoS ativo.' };

      if (window.softwareEngine && !window.softwareEngine.isDdosBreakerActive()) {
        return {
          success: false,
          code: 'NO_DDOS_BREAKER',
          message: 'Seu DDoS_Breaker.vbrk está DESATIVADO na sua RAM! Instale-o na aba Programas antes de lançar um ataque DDoS.'
        };
      }

      const hasCert4 = window.universityEngine ? window.universityEngine.hasCert(4) : false;
      const gbps = window.softwareEngine ? window.softwareEngine.getPendingHarvestSummary().totalGbps : 0;
      const cpuBonusGbps = window.terminalTools ? +(window.terminalTools.getCpuMultiplier() * 0.8).toFixed(1) : 0.8;
      const totalPower = +(gbps + cpuBonusGbps).toFixed(1);

      if (!hasCert4 && gbps < m.requiredGbps) {
        return {
          success: false,
          message: `Poder DDoS insuficiente (${totalPower} Gbps)! Conclua o Curso #4 na Universidade ou instale DDoS_Node.vddos em servidores invadidos até atingir ${m.requiredGbps} Gbps.`
        };
      }

      m.progressDone = true;
      this.save();
      if (window.safenetFbiEngine) {
        window.safenetFbiEngine.evaluatePlayerCrime(`Ataque DDoS (${Math.max(m.requiredGbps, totalPower)} Gbps) contra ${m.targetHostname}`, 3500, m.targetIp);
      }
      return this.completeActiveMission();
    }

    completeActiveMission() {
      this.ensureLoaded();
      const m = this.state.activeMission;
      if (!m) return { success: false };

      if (window.currentWallet) {
        const payFn = () => {
          window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) + m.rewardCash).toFixed(2);
        };
        if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
          window.integrityGuard.runAuthorized(payFn);
        } else {
          payFn();
        }
      }
      if (m.rewardSats > 0 && window.bitcoinEngine) {
        window.bitcoinEngine.creditSats(m.rewardSats, 'MISSION-BTC', `Bônus cripto do contrato ${m.id} (${m.hirer})`);
      }
      if (window.currentProfile) {
        window.currentProfile.reputation = (window.currentProfile.reputation || 0) + m.repReward;
      }

      this.state.completedCount = (this.state.completedCount || 0) + 1;
      const btcTxt = m.rewardSats > 0 ? ` + ${(m.rewardSats / 100000000).toFixed(5)} BTC` : '';
      this.state.history.unshift({
        id: m.id,
        badge: m.badge,
        hirer: m.hirer,
        hirerIp: m.hirerIp,
        targetIp: m.targetIp,
        targetHostname: m.targetHostname,
        objectiveStr: m.fileName || m.virusFilename || m.badge,
        status: 'CONCLUÍDA',
        rewardStr: `$${m.rewardCash.toLocaleString('pt-BR')}${btcTxt} (+${m.repReward} REP)`,
        at: new Date().toLocaleTimeString()
      });

      if (window.mailEngine && typeof window.mailEngine.pushSystemMail === 'function') {
        window.mailEngine.pushSystemMail(
          `${m.hirer} <${m.hirerEmail || 'pagamento@rede.hc'}>`,
          `[Pagamento Liberado] Missão ${m.id} Verificada (+$${m.rewardCash})`,
          `Serviço verificado com sucesso em ${m.targetIp} (${m.targetHostname}).\nTransferimos $${m.rewardCash.toLocaleString('pt-BR')}${btcTxt} para sua conta e apagamos nosso vínculo.\n\n— ${m.hirer}`,
          'system'
        );
      }

      this.state.activeMission = null;
      this.subTab = 'completed';
      if (this.state.pool.length < 4) this.generatePool();
      this.save();

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('MISSION-OK', `Contrato ${m.id} (${m.hirer}) verificado e pago! +$${m.rewardCash}${btcTxt}`, 'success');
      }
      if (window.hackerAudio) window.hackerAudio.playMoneyCollect();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
      if (typeof window.showToast === 'function') {
        window.showToast(`✓ Missão verificada e concluída! Recebido $${m.rewardCash.toLocaleString('pt-BR')}${btcTxt}!`);
      }
      return { success: true, rewardCash: m.rewardCash, rewardSats: m.rewardSats };
    }

    renderUI(containerId = 'missionsAppBody') {
      const container = document.getElementById(containerId);
      if (!container) return;
      this.ensureLoaded();
      const ic = (n) => (window.HC && window.HC.icon ? window.HC.icon(n) : '');

      const tutInfo = window.tutorialEngine ? window.tutorialEngine.getCurrentStepInfo() : { completed: true };
      const maxTier = this.getPlayerAllowedTier();
      const active = this.state.activeMission;
      const playerTag = (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador';
      const dynamicCount = window.dynamicContractsEngine ? window.dynamicContractsEngine.contracts.length : 6;

      if (!this.subTab) {
        this.subTab = active ? 'current' : 'available';
      }

      const tutBannerHtml = tutInfo.completed ? '' : `
        <div class="hc-card" style="padding:12px 16px;border-color:rgba(95,211,154,0.42);background:rgba(18,129,79,0.12);display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;">
          <div style="max-width:720px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">
              <span class="hc-badge success">${esc(tutInfo.badge)}</span>
              <strong style="font-size:14px;">${esc(tutInfo.title)}</strong>
            </div>
            <p style="font-size:12.5px;color:var(--hc-text-2);margin:0;">${esc(tutInfo.desc)}</p>
          </div>
          <button type="button" id="btnTutorialAction" class="hc-btn primary sm" onclick="window.tutorialEngine.getCurrentStepInfo().action()">
            ${esc(tutInfo.cta)}
          </button>
        </div>
      `;

      // 3 Abas Superiores idênticas à Foto 1: Missões Disponíveis | Missão Atual | Missões Concluídas (+ Facções à direita)
      const topFrameBarHtml = `
        <div class="soft-tabs-bar">
          <div class="soft-tabs-left" role="tablist" aria-label="Abas de Missões">
            <button type="button" id="tabMsnAvailable" class="soft-tab-btn ${this.mainTab !== 'dynamic' && this.subTab === 'available' ? 'active' : ''}"
              onclick="window.missionsEngine.mainTab='campaign';window.missionsEngine.setSubTab('available');">
              ${ic('folder')} <span>Missões Disponíveis (${this.state.pool.length})</span>
            </button>
            <button type="button" id="tabMsnCurrent" class="soft-tab-btn ${this.mainTab !== 'dynamic' && this.subTab === 'current' ? 'active' : ''}"
              onclick="window.missionsEngine.mainTab='campaign';window.missionsEngine.setSubTab('current');">
              ${ic('mail')} <span>Missão Atual${active ? ' ●' : ''}</span>
            </button>
            <button type="button" id="tabMsnCompleted" class="soft-tab-btn ${this.mainTab !== 'dynamic' && this.subTab === 'completed' ? 'active' : ''}"
              onclick="window.missionsEngine.mainTab='campaign';window.missionsEngine.setSubTab('completed');">
              ${ic('circle-check')} <span>Missões Concluídas (${this.state.completedCount || 0})</span>
            </button>
          </div>

          <div style="display:flex;gap:8px;align-items:center;">
            <button type="button" id="tabDynamicContracts" class="soft-drive-pill ${this.mainTab === 'dynamic' ? 'active' : ''}"
              onclick="window.missionsEngine.mainTab=(window.missionsEngine.mainTab==='dynamic'?'campaign':'dynamic');window.missionsEngine.renderUI();">
              Facções (${dynamicCount})
            </button>
          </div>
        </div>
      `;

      if (this.mainTab === 'dynamic' && window.dynamicContractsEngine) {
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:14px;">
            ${tutBannerHtml}
            <div class="soft-frame" id="missionsExplorerMain">
              ${topFrameBarHtml}
              <div style="padding:16px;">${window.dynamicContractsEngine.renderHtml()}</div>
            </div>
          </div>
        `;
        return;
      }

      let bodyContentHtml = '';

      // ABA 2: MISSÃO ATUAL (Layout E-mail + Mini-História à esquerda | Informações da Missão à direita — igual à Foto 1!)
      if (this.subTab === 'current') {
        if (!active) {
          bodyContentHtml = `
            <div style="padding:36px 20px;text-align:center;">
              <div style="font-size:15px;font-weight:600;color:var(--hc-text);margin-bottom:6px;">Nenhuma missão ativa no momento</div>
              <p style="font-size:13px;color:var(--hc-text-2);margin:0 auto 14px;max-width:52ch;">Abra <strong>Missões Disponíveis</strong> para ler as propostas enviadas pelos contratantes e aceitar um serviço.</p>
              <button type="button" class="hc-btn primary sm" onclick="window.missionsEngine.setSubTab('available')">Ver Missões Disponíveis →</button>
            </div>
          `;
        } else {
          const verif = this.verifyActiveMissionStatus();
          const btcBonusStr = active.rewardSats > 0 ? ` + ${(active.rewardSats / 100000000).toFixed(5)} BTC` : '';
          const objRowLabel = active.type === 'cctv_hack'
            ? 'Câmera Alvo (CFTV)'
            : (active.type === 'install_virus' ? 'Vírus Exigido' : (active.fileName ? 'Arquivo Alvo' : 'Operação'));
          const objRowVal = active.type === 'cctv_hack'
            ? `<span class="msn-hl-file">${esc(active.camCode)} · ${esc(active.camRoom)}</span> <span style="color:var(--hc-text-3);">(${active.cctvObjective === 'loop' ? 'Injetar Loop' : 'Gravar Vídeo'})</span>`
            : (active.type === 'install_virus'
                ? `<span class="msn-hl-virus">${esc(active.virusFilename)}</span> <span style="color:var(--hc-text-3);">rodando ativo</span>`
                : (active.fileName
                    ? `<span class="msn-hl-file">${esc(active.fileName)}</span> <span style="color:var(--hc-text-3);">${active.fileSizeMb || 28} MB (${active.type === 'delete_file' ? 'Excluir' : 'Baixar'})</span>`
                    : esc(active.badge)));

          bodyContentHtml = `
            <div style="padding:18px 20px;">
              <div class="msn-current-layout" id="currentMissionMailLayout">
                <!-- Coluna Esquerda: Mensagem / E-mail com Mini-História do Contratante -->
                <div class="msn-mail-box">
                  <div class="msn-mail-header">
                    <div class="msn-sender-avatar" aria-hidden="true">${ic(active.hirerIcon || 'terminal')}</div>
                    <div>
                      <div class="msn-mail-meta">
                        Enviado por: <strong style="color:var(--hc-text-2);">${esc(active.hirer)}</strong> em ${esc(active.acceptedAt || active.sentAt)} · IP: ${esc(active.hirerIp || '239.231.94.245')}
                      </div>
                      <div class="msn-mail-story">
                        ${this.buildStoryRichHtml(active, playerTag)}
                      </div>
                    </div>
                  </div>

                  <!-- Caixa de Verificação Real da Missão -->
                  <div class="msn-verify-box ${verif.verified ? 'is-ready' : ''}" id="missionVerifyBox">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
                      <div style="font-size:12.5px;">
                        <strong style="color:${verif.verified ? 'var(--hc-accent-text)' : 'var(--hc-warning-text)'};">
                          ${verif.verified ? '✓ Verificação Concluída — Objetivo confirmado!' : '⏳ Verificação Automática Pendente'}
                        </strong>
                        <div style="color:var(--hc-text-2);margin-top:3px;">
                          ${esc(verif.verified ? verif.detail : verif.reason)}
                        </div>
                      </div>
                      <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button type="button" id="btnOpenMissionTargetIp" class="hc-btn ghost sm"
                          onclick="${active.type === 'cctv_hack'
                            ? `window.internetEngine.openCompanyCctv('${esc(active.targetIp)}', '${esc(active.camCode || '')}')`
                            : `window.internetEngine.openIp('${esc(active.targetIp)}', '${verif.hacked ? 'entrar' : 'invadir'}')`}">
                          ${ic(active.type === 'cctv_hack' ? 'video' : 'globe')} ${active.type === 'cctv_hack' ? `Abrir CFTV (${esc(active.targetIp)})` : `Ir para ${esc(active.targetIp)}`}
                        </button>
                        <button type="button" id="btnVerifyAndClaimMission" class="hc-btn primary sm"
                          onclick="window.handleVerifyMission()">
                          ${ic('circle-check')} ${verif.verified ? `Entregar & Receber $${active.rewardCash}` : 'Verificar Cumprimento'}
                        </button>
                      </div>
                    </div>
                    ${this.lastVerifyFeedback && !this.lastVerifyFeedback.ok ? `
                      <div style="font-size:12px;color:#ff8e88;border-top:1px solid var(--hc-border);padding-top:8px;">
                        ⚠️ ${esc(this.lastVerifyFeedback.text)}
                      </div>
                    ` : ''}
                  </div>

                  <div>
                    <button type="button" id="btnAbortActiveMission" class="hc-btn sm" style="background:rgba(208,68,58,0.16);border-color:rgba(229,83,75,0.4);color:#ff8e88;"
                      onclick="window.missionsEngine.abortActiveMission()">
                      Abandonar Missão
                    </button>
                  </div>
                </div>

                <!-- Coluna Direita: Tabela Informações da Missão (Idêntica à Foto 1) -->
                <aside class="msn-info-card" aria-label="Informações da Missão">
                  <div class="msn-info-head">
                    ${ic('sparkles')} <span>Informações da Missão</span>
                  </div>
                  <table class="msn-info-table">
                    <tbody>
                      <tr>
                        <th>Vítima</th>
                        <td>
                          <span class="msn-hl-ip" onclick="window.internetEngine.openIp('${esc(active.targetIp)}', 'invadir')">${esc(active.targetIp)}</span>
                          <span style="color:var(--hc-text-3);font-family:var(--hc-font-sans);margin-left:4px;">${esc(active.targetHostname)}</span>
                        </td>
                      </tr>
                      <tr>
                        <th>${esc(objRowLabel)}</th>
                        <td>${objRowVal}</td>
                      </tr>
                      <tr>
                        <th>Verificação</th>
                        <td>
                          <span class="hc-badge ${verif.verified ? 'success' : 'warn'}">${verif.verified ? '✓ Confirmado' : 'Pendente'}</span>
                        </td>
                      </tr>
                      <tr>
                        <th>Recompensa</th>
                        <td><span class="msn-hl-money">$${active.rewardCash.toLocaleString('pt-BR')}${esc(btcBonusStr)}</span> <span style="color:var(--hc-text-3);font-size:11px;">+${active.repReward} REP</span></td>
                      </tr>
                      <tr>
                        <th>Contratante</th>
                        <td>${esc(active.hirerIp || '239.231.94.245')} <span style="color:var(--hc-text-3);font-family:var(--hc-font-sans);margin-left:4px;">${esc(active.hirer)}</span></td>
                      </tr>
                    </tbody>
                  </table>
                </aside>
              </div>
            </div>
          `;
        }
      }
      // ABA 3: MISSÕES CONCLUÍDAS
      else if (this.subTab === 'completed') {
        const hist = this.state.history || [];
        const histRows = hist.length === 0
          ? `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--hc-text-3);">Nenhuma missão concluída ainda. Aceite um contrato em Missões Disponíveis!</td></tr>`
          : hist.map((h) => `
              <tr>
                <td class="soft-col-ver" style="width:95px;color:var(--hc-text-3);">${esc(h.at)}</td>
                <td>
                  <strong>${esc(h.hirer)}</strong>
                  <span class="hc-badge ${h.status === 'CONCLUÍDA' ? 'success' : 'danger'}" style="margin-left:6px;">${esc(h.badge)}</span>
                </td>
                <td class="soft-col-size" style="width:140px;">${esc(h.targetIp)}</td>
                <td class="soft-col-size" style="width:160px;color:var(--hc-text-2);">${esc(h.objectiveStr || h.badge)}</td>
                <td class="soft-col-size" style="width:150px;color:${h.status === 'CONCLUÍDA' ? 'var(--hc-accent-text)' : 'var(--hc-danger-text)'};font-weight:600;">${esc(h.rewardStr)}</td>
              </tr>
            `).join('');

        bodyContentHtml = `
          <div style="padding:14px 16px;">
            <div class="soft-table-wrap">
              <table class="soft-table clean-hw-table">
                <thead>
                  <tr>
                    <th class="soft-col-ver" style="width:95px;">Hora</th>
                    <th>Contratante &amp; Tipo</th>
                    <th class="soft-col-size" style="width:140px;">Vítima</th>
                    <th class="soft-col-size" style="width:160px;">Arquivo / Vírus</th>
                    <th class="soft-col-size" style="width:150px;">Resultado</th>
                  </tr>
                </thead>
                <tbody>${histRows}</tbody>
              </table>
            </div>
          </div>
        `;
      }
      // ABA 1: MISSÕES DISPONÍVEIS (Propostas por E-mail prontas para aceitar)
      else {
        const typeIconMap = {
          cctv_hack: ['video', 'defense'],
          delete_file: ['trash-2', 'attack'],
          steal_data: ['download', 'defense'],
          install_virus: ['bug', 'virus'],
          check_balance: ['search', 'stealth'],
          drain_funds: ['landmark', 'virus'],
          ddos_takedown: ['zap', 'virus']
        };

        const poolFiltered = this.state.pool.filter((m) => this.filterTier === 0 || m.tier === this.filterTier);
        const poolRows = poolFiltered.map((m) => {
          const locked = m.tier > maxTier;
          const [icName, glyphCls] = typeIconMap[m.type] || ['mail', 'attack'];
          const rewardShort = `$${m.rewardCash.toLocaleString('pt-BR')}${m.rewardSats > 0 ? ' + BTC' : ''}`;
          const targetObjLabel = m.type === 'cctv_hack'
            ? `${m.camCode} · ${m.cctvObjective === 'loop' ? 'Loop CFTV' : 'Gravar CFTV'}`
            : (m.fileName
                ? `${m.type === 'delete_file' ? 'Deletar' : 'Roubar'} ${m.fileName}`
                : (m.virusFilename ? `Rodar ${m.virusFilename}` : m.badge));

          return `
            <tr class="${locked ? 'row-hidden' : ''}">
              <td class="soft-col-icon">
                <span class="soft-mini-glyph kind-${glyphCls}"
                  data-tip-title="${esc(m.hirer)} · ${esc(m.badge)}"
                  data-tip-meta="${esc(rewardShort)}"
                  data-tip-desc="${esc(m.brief)}">
                  ${ic(icName)}
                </span>
              </td>
              <td>
                <span class="soft-name-trigger" tabindex="0"
                  data-tip-title="Mensagem de ${esc(m.hirer)}"
                  data-tip-meta="Nível ${m.tier}"
                  data-tip-desc="${esc(m.brief)}">
                  <strong style="font-family:var(--hc-font-sans);color:var(--hc-text);">${esc(m.hirer)}</strong>
                  <span class="hc-badge ${m.tier === 3 ? 'danger' : (m.tier === 2 ? 'warn' : 'info')}">${esc(targetObjLabel)}</span>
                </span>
                <div style="font-size:11.5px;color:var(--hc-text-3);margin-top:2px;">
                  Vítima: <span class="mono" style="color:var(--hc-text-2);">${esc(m.targetIp)}</span> (${esc(m.targetHostname)})
                </div>
              </td>
              <td class="soft-col-size" style="width:125px;color:var(--hc-accent-text);font-weight:700;white-space:nowrap;">${esc(rewardShort)}</td>
              <td class="soft-col-acts">
                <div class="soft-icon-actions">
                  <button type="button" class="soft-icon-act ic-info" aria-label="Resumo da proposta de ${esc(m.hirer)}"
                    data-tip-title="Proposta por E-mail" data-tip-meta="Nível ${m.tier}" data-tip-desc="${esc(m.brief)}">
                    ${ic('info')}
                  </button>
                  <button type="button" id="btnAcceptMission_${m.type}_${esc(m.id)}" class="soft-icon-act ic-run btn-accept-msn-${m.type}" ${locked || active ? 'disabled' : ''}
                    aria-label="Aceitar missão de ${esc(m.hirer)}"
                    data-tip-title="${locked ? `Requer Nível ${m.tier}` : (active ? 'Conclua ou abandone sua Missão Atual primeiro' : 'Aceitar e abrir mensagem completa')}"
                    data-tip-meta="${esc(rewardShort)}"
                    data-tip-desc="Recebe a proposta completa por e-mail e abre a aba Missão Atual com todos os dados do alvo."
                    onclick="window.handleAcceptMission('${esc(m.id)}')">
                    ${ic(locked ? 'lock' : 'play')}
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('');

        bodyContentHtml = `
          <div style="padding:14px 16px;display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
              <span style="font-size:12.5px;color:var(--hc-text-2);">Escolha um contrato abaixo: o contratante enviará um <strong>e-mail cifrado</strong> com a história, o arquivo ou vírus exato e os dados da vítima.</span>
              <button type="button" class="hc-btn ghost sm" onclick="window.missionsEngine.generatePool();window.missionsEngine.renderUI();">
                ${ic('refresh-cw')} Atualizar Propostas
              </button>
            </div>
            <div class="soft-table-wrap" role="region" aria-label="Missões disponíveis">
              <table class="soft-table clean-hw-table">
                <thead>
                  <tr>
                    <th class="soft-col-icon"></th>
                    <th>Contratante, Objetivo &amp; Vítima</th>
                    <th class="soft-col-size" style="width:125px;">Recompensa</th>
                    <th class="soft-col-acts">Ações</th>
                  </tr>
                </thead>
                <tbody>${poolRows}</tbody>
              </table>
            </div>
          </div>
        `;
      }

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${tutBannerHtml}
          <div class="soft-frame" id="missionsExplorerMain">
            ${topFrameBarHtml}
            ${bodyContentHtml}
          </div>
        </div>
      `;
    }
  }

  window.universityEngine = new UniversityEngine();
  window.tutorialEngine = new TutorialStoryEngine();
  window.missionsEngine = new MissionsBoardEngine();

  window.handleCompleteCourse = async function (certId) {
    const res = await window.universityEngine.completeCourse(certId);
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(res.message);
    return res;
  };

  window.handleAcceptMission = function (missionId) {
    const res = window.missionsEngine.acceptMission(missionId);
    if (!res.success) alert(res.message);
    else if (typeof window.showToast === 'function') window.showToast(`Nova mensagem de ${res.mission.hirer}! Confira os detalhes em Missão Atual.`);
    return res;
  };

  window.handleVerifyMission = function () {
    return window.missionsEngine.verifyAndClaimActiveMission();
  };

  window.handleMissionBalanceSubmit = function () {
    const val = document.getElementById('missionBalanceInput')?.value;
    const res = window.missionsEngine.submitBalanceCheck(val);
    if (!res.success) alert(res.message);
    return res;
  };

  window.handleMissionDdos = function () {
    const res = window.missionsEngine.executeMissionDdos();
    if (!res.success) alert(res.message);
    return res;
  };
})();
