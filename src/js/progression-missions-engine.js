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
  // 3. QUADRO DINÂMICO DE MISSÕES (5 TIPOS REAIS DE CONTRATO — ECONOMIA HARDCORE)
  // =========================================================================
  const HIRERS = [
    'Numataka Corp',
    'Meridian BioLabs',
    'Kestrel Defense',
    'Coletivo Vagalume',
    'Helios Clearing',
    'Aegis Telecom',
    'Orion Syndicate'
  ];

  const MISSION_TARGETS = [
    { ip: '203.17.88.40', hostname: 'Farofa Systems S.A.', tier: 1, balanceHint: 185 },
    { ip: '133.70.13.37', hostname: 'Rádio Pirata 1337 FM', tier: 1, balanceHint: 110 },
    { ip: '185.220.101.9', hostname: 'Blackmarket Onion', tier: 2, balanceHint: 420 },
    { ip: '149.56.28.11', hostname: 'VPC Operador m4riposa', tier: 2, balanceHint: 340 },
    { ip: '77.3.9.21', hostname: 'Banco Colchão & Clearing HC', tier: 3, balanceHint: 1150 }
  ];

  class MissionsBoardEngine {
    constructor() {
      this.userId = null;
      this.state = null;
      this.filterTier = 0; // 0 = todos
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
        this.state = saved;
      } else {
        this.state = {
          activeMission: null,
          pool: [],
          history: [],
          completedCount: 0,
          abortedCount: 0
        };
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
      const templates = [
        {
          type: 'delete_file',
          badge: 'Apagar Arquivo',
          tier: 1,
          targetIdx: 0,
          fileName: 'auditoria_secreta_2026.db',
          fileContent: 'Registros fiscais comprometedores solicitados para destruição imediata.',
          rewardCash: 150,
          rewardSats: 0,
          repReward: 50,
          brief: 'Invada o servidor alvo via SSH Root, localize o arquivo confidencial na aba "Vírus, Carteira & Arquivos" e clique em Apagar Arquivo.'
        },
        {
          type: 'steal_data',
          badge: 'Roubar Dados',
          tier: 1,
          targetIdx: 1,
          fileName: 'chaves_transmissao_1337.key',
          fileContent: 'HASH-9941-KESTREL-PAYLOAD-VERIFIED',
          rewardCash: 195,
          rewardSats: 0,
          repReward: 65,
          brief: 'Quebre o acesso root do alvo, extraia o arquivo criptografado na aba de arquivos SSH para transmitir uma cópia ao contratante.'
        },
        {
          type: 'check_balance',
          badge: 'Auditar Reserva',
          tier: 2,
          targetIdx: 3,
          expectedAmount: 340,
          rewardCash: 420,
          rewardSats: 40000,
          repReward: 95,
          brief: 'Invada a VPC alvo, verifique na sessão SSH o valor exato em dólares da reserva financeira local e informe abaixo para validar a auditoria.'
        },
        {
          type: 'drain_funds',
          badge: 'Drenar Conta / Carteira',
          tier: 2,
          targetIdx: 2,
          rewardCash: 640,
          rewardSats: 65000,
          repReward: 120,
          brief: 'Invada o servidor alvo, entre como root e execute "Drenar Reserva Local" ou "Roubar wallet.dat" para esvaziar os fundos ilícitos.'
        },
        {
          type: 'ddos_takedown',
          badge: 'Ataque DDoS',
          tier: 3,
          targetIdx: 4,
          requiredGbps: 2.5,
          rewardCash: 1650,
          rewardSats: 180000,
          repReward: 190,
          brief: 'Exige Curso #4 (Engenharia de Vírus & DDoS) ou >= 2.5 Gbps de vírus DDoS_Node.vddos ativos. Dispare a sobrecarga DDoS para derrubar o mainframe alvo!'
        }
      ];

      this.state.pool = templates.map((tpl, idx) => {
        const tgt = MISSION_TARGETS[tpl.targetIdx];
        const hirer = HIRERS[(idx + Math.floor(Math.random() * HIRERS.length)) % HIRERS.length];
        return {
          id: 'MSN-' + (100 + idx) + '-' + Math.floor(100 + Math.random() * 899),
          hirer,
          type: tpl.type,
          badge: tpl.badge,
          tier: tpl.tier,
          targetIp: tgt.ip,
          targetHostname: tgt.hostname,
          fileName: tpl.fileName || null,
          fileContent: tpl.fileContent || null,
          expectedAmount: tpl.expectedAmount || tgt.balanceHint,
          requiredGbps: tpl.requiredGbps || 0,
          rewardCash: tpl.rewardCash,
          rewardSats: tpl.rewardSats,
          repReward: tpl.repReward,
          brief: tpl.brief,
          progressDone: false
        };
      });
      this.save();
    }

    getPlayerAllowedTier() {
      const crcVer = window.softwareEngine ? window.softwareEngine.getSoftwareVersion('cracker') : 1.0;
      const rep = (window.currentProfile && window.currentProfile.reputation) || 0;
      if (crcVer >= 2.5 || rep >= 900) return 3;
      if (crcVer >= 1.5 || rep >= 350) return 2;
      return 1;
    }

    acceptMission(missionId) {
      this.ensureLoaded();
      if (this.state.activeMission) {
        return { success: false, message: 'Você já possui um contrato em andamento! Conclua ou aborte-o antes de aceitar outro.' };
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

      this.state.activeMission = { ...found, acceptedAt: new Date().toLocaleTimeString(), progressDone: false };
      this.state.pool = this.state.pool.filter((m) => m.id !== missionId);
      this.save();

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('MISSION', `Contrato ${found.id} (${found.badge}) aceito de ${found.hirer} -> Alvo ${found.targetIp}`, 'info');
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
        status: 'ABORTOU',
        rewardStr: `-${penalty} REP`,
        at: new Date().toLocaleTimeString()
      });
      this.state.activeMission = null;
      if (this.state.pool.length < 3) this.generatePool();
      this.save();

      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
    }

    // Arquivos dinâmicos injetados no /root do alvo enquanto a missão está ativa!
    getMissionFilesForHost(ip) {
      this.ensureLoaded();
      const files = [];
      // Arquivo fixo do servidor tutorial
      if (ip === TUTORIAL_TARGET_IP) {
        files.push({
          name: 'dossie_tankado.txt',
          size: '12 KB',
          content: 'Prova de intrusão Numataka. Extraia este arquivo e apague seu IP na aba Logs!',
          isTutorial: true,
          canDelete: false
        });
      }
      const m = this.state.activeMission;
      if (m && m.targetIp === ip && m.fileName && !m.progressDone) {
        files.push({
          name: m.fileName,
          size: '48 KB',
          content: m.fileContent,
          missionId: m.id,
          canDelete: m.type === 'delete_file',
          canSteal: m.type === 'steal_data'
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
        if ((m.type === 'delete_file' && actionKind === 'delete') || (m.type === 'steal_data' && actionKind === 'read')) {
          m.progressDone = true;
          this.save();
          if (actionKind === 'delete' && window.safenetFbiEngine) {
            window.safenetFbiEngine.evaluatePlayerCrime('Sabotagem e destruição de arquivo corporativo', 1200, ip);
          }
          return this.completeActiveMission();
        }
      }
      return { success: true };
    }

    notifyHostDrained(ip) {
      this.ensureLoaded();
      const m = this.state.activeMission;
      if (m && m.targetIp === ip && m.type === 'drain_funds' && !m.progressDone) {
        m.progressDone = true;
        this.save();
        this.completeActiveMission();
      }
    }

    submitBalanceCheck(typedVal) {
      this.ensureLoaded();
      const m = this.state.activeMission;
      if (!m || m.type !== 'check_balance') return { success: false, message: 'Nenhuma auditoria ativa.' };

      // Exigir que o alvo tenha sido invadido no Hacked Database primeiro (anti-chute)
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
          message: 'Seu DDoS_Breaker.vbrk está DESATIVADO na sua RAM! Instale-o na aba Software & Vírus antes de lançar um ataque DDoS.'
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
        window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) + m.rewardCash).toFixed(2);
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
        targetIp: m.targetIp,
        status: 'CONCLUÍDA',
        rewardStr: `${fmtUsd(m.rewardCash)}${btcTxt} (+${m.repReward} REP)`,
        at: new Date().toLocaleTimeString()
      });
      this.state.activeMission = null;
      if (this.state.pool.length < 4) this.generatePool();
      this.save();

      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('MISSION-OK', `Contrato ${m.id} (${m.hirer}) cumprido! Pagamento: ${fmtUsd(m.rewardCash)}${btcTxt}`, 'success');
      }
      if (window.hackerAudio) window.hackerAudio.playMoneyCollect();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
      if (typeof window.showToast === 'function') {
        window.showToast(`Missão concluída! Recebido ${fmtUsd(m.rewardCash)}${btcTxt}!`);
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
      const myRep = (window.currentProfile && window.currentProfile.reputation) || 100;

      const dynamicCount = window.dynamicContractsEngine ? window.dynamicContractsEngine.contracts.length : 6;
      const activeDynamicCount = window.dynamicContractsEngine ? window.dynamicContractsEngine.activeContracts.length : 0;

      const tierPct = Math.min(100, Math.round((maxTier / 3) * 100));
      const r = 46;
      const cCirc = +(2 * Math.PI * r).toFixed(2);
      const offset = +(cCirc - (tierPct / 100) * cCirc).toFixed(2);

      const tutBannerHtml = tutInfo.completed ? '' : `
        <div class="hc-card" style="padding:14px 18px;border-color:rgba(95,211,154,0.42);background:rgba(18,129,79,0.12);display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;">
          <div style="max-width:720px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">
              <span class="hc-badge success">${esc(tutInfo.badge)}</span>
              <strong style="font-size:14.5px;">${esc(tutInfo.title)}</strong>
            </div>
            <p style="font-size:12.5px;color:var(--hc-text-2);margin:0;">${esc(tutInfo.desc)}</p>
          </div>
          <button type="button" id="btnTutorialAction" class="hc-btn primary sm" onclick="window.tutorialEngine.getCurrentStepInfo().action()">
            ${esc(tutInfo.cta)}
          </button>
        </div>
      `;

      const topFrameBarHtml = `
        <div class="soft-tabs-bar">
          <div class="soft-tabs-left" role="tablist" aria-label="Categorias de Missões">
            <button type="button" id="tabCampaignMissions" class="soft-tab-btn ${this.mainTab !== 'dynamic' ? 'active' : ''}" onclick="window.missionsEngine.mainTab='campaign';window.missionsEngine.renderUI();">
              ${ic('crosshair')} <span>Quadro de Contratos</span>
            </button>
            <button type="button" id="tabDynamicContracts" class="soft-tab-btn ${this.mainTab === 'dynamic' ? 'active' : ''}" onclick="window.missionsEngine.mainTab='dynamic';window.missionsEngine.renderUI();">
              ${ic('file-text')} <span>Facções (${dynamicCount})${activeDynamicCount > 0 ? ` · ${activeDynamicCount} ativo` : ''}</span>
            </button>
          </div>

          ${this.mainTab !== 'dynamic' ? `
            <div class="soft-drive-pills" role="group" aria-label="Filtrar por nível">
              <button type="button" class="soft-drive-pill ${this.filterTier === 0 ? 'active' : ''}" onclick="window.missionsEngine.filterTier=0;window.missionsEngine.renderUI();">Todos</button>
              <button type="button" class="soft-drive-pill ${this.filterTier === 1 ? 'active' : ''}" onclick="window.missionsEngine.filterTier=1;window.missionsEngine.renderUI();">Nível 1</button>
              <button type="button" class="soft-drive-pill ${this.filterTier === 2 ? 'active' : ''}" onclick="window.missionsEngine.filterTier=2;window.missionsEngine.renderUI();">Nível 2</button>
              <button type="button" class="soft-drive-pill ${this.filterTier === 3 ? 'active' : ''}" onclick="window.missionsEngine.filterTier=3;window.missionsEngine.renderUI();">Nível 3</button>
            </div>
          ` : ''}
        </div>
      `;

      if (this.mainTab === 'dynamic' && window.dynamicContractsEngine) {
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:14px;">
            ${tutBannerHtml}
            <div class="soft-frame">
              ${topFrameBarHtml}
              <div style="padding:16px;">${window.dynamicContractsEngine.renderHtml()}</div>
            </div>
          </div>
        `;
        return;
      }

      let activeHtml = '';
      if (active) {
        const btcTag = active.rewardSats > 0 ? ` + ${(active.rewardSats / 100000000).toFixed(5)} BTC` : '';
        let actionControl = `
          <button type="button" class="hc-btn primary sm" onclick="window.internetEngine.openIp('${esc(active.targetIp)}', 'invadir')">
            Abrir ${esc(active.targetIp)} →
          </button>
        `;
        if (active.type === 'check_balance') {
          actionControl = `
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
              <button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('${esc(active.targetIp)}', 'invadir')">Inspecionar ${esc(active.targetIp)}</button>
              <input type="number" id="missionBalanceInput" class="hc-input mono" style="width:155px;height:30px;font-size:12px;" placeholder="Saldo visto ($)">
              <button type="button" id="btnSubmitBalanceMission" class="hc-btn primary sm" onclick="window.handleMissionBalanceSubmit()">Confirmar</button>
            </div>
          `;
        } else if (active.type === 'ddos_takedown') {
          actionControl = `
            <button type="button" id="btnExecMissionDdos" class="hc-btn primary sm" onclick="window.handleMissionDdos()">Disparar DDoS em ${esc(active.targetIp)}</button>
          `;
        }

        activeHtml = `
          <div class="hc-card" style="padding:13px 16px;border-color:var(--hc-accent);background:var(--hc-inset);">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px;">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span class="hc-badge success">Em Andamento</span>
                <strong>${esc(active.hirer)}</strong>
                <span class="mono" style="color:var(--hc-accent-text);font-size:12.5px;">${esc(active.targetIp)}</span>
              </div>
              <strong class="mono" style="color:var(--hc-accent-text);font-size:13px;">${fmtUsd(active.rewardCash)}${btcTag}</strong>
            </div>
            <p style="font-size:12.5px;color:var(--hc-text-2);margin:0 0 10px;">${esc(active.brief)}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
              ${actionControl}
              <button type="button" class="hc-btn ghost sm" style="color:var(--hc-danger-text);" onclick="window.missionsEngine.abortActiveMission()">Abortar</button>
            </div>
          </div>
        `;
      }

      const typeIconMap = {
        delete_file: ['trash-2', 'attack'],
        steal_data: ['download', 'defense'],
        check_balance: ['search', 'stealth'],
        drain_funds: ['landmark', 'virus'],
        ddos_takedown: ['zap', 'virus']
      };

      const poolFiltered = this.state.pool.filter((m) => this.filterTier === 0 || m.tier === this.filterTier);
      const poolRows = poolFiltered.map((m) => {
        const locked = m.tier > maxTier;
        const [icName, glyphCls] = typeIconMap[m.type] || ['crosshair', 'attack'];
        const rewardShort = `$ ${m.rewardCash.toLocaleString('pt-BR')}${m.rewardSats > 0 ? ' + BTC' : ''}`;

        return `
          <tr class="${locked ? 'row-hidden' : ''}">
            <td class="soft-col-icon">
              <span class="soft-mini-glyph kind-${glyphCls}"
                data-tip-title="${esc(m.badge)} · Nível ${m.tier}"
                data-tip-meta="${esc(rewardShort)}"
                data-tip-desc="${esc(m.brief)}">
                ${ic(icName)}
              </span>
            </td>
            <td>
              <span class="soft-name-trigger" tabindex="0"
                data-tip-title="${esc(m.hirer)} — ${esc(m.badge)}"
                data-tip-meta="Nível ${m.tier}"
                data-tip-desc="${esc(m.brief)}">
                <strong style="font-family:var(--hc-font-sans);color:var(--hc-text);">${esc(m.hirer)}</strong>
                <span class="hc-badge ${m.tier === 3 ? 'danger' : (m.tier === 2 ? 'warn' : 'info')}">${esc(m.badge)}</span>
              </span>
            </td>
            <td class="soft-col-size" style="width:140px;color:var(--hc-text-2);">${esc(m.targetIp)}</td>
            <td class="soft-col-size" style="width:125px;color:var(--hc-accent-text);white-space:nowrap;">${esc(rewardShort)}</td>
            <td class="soft-col-acts">
              <div class="soft-icon-actions">
                <button type="button" class="soft-icon-act ic-info" aria-label="Briefing de ${esc(m.hirer)}"
                  data-tip-title="Objetivo do Contrato" data-tip-meta="Nível ${m.tier}" data-tip-desc="${esc(m.brief)}">
                  ${ic('info')}
                </button>
                <button type="button" class="soft-icon-act ic-move" aria-label="Inspecionar IP ${esc(m.targetIp)}"
                  data-tip-title="Ver alvo na Internet" data-tip-meta="${esc(m.targetIp)}" data-tip-desc="${esc(m.targetHostname)}"
                  onclick="window.internetEngine.openIp('${esc(m.targetIp)}')">
                  ${ic('globe')}
                </button>
                <button type="button" id="btnAcceptMission_${m.type}" class="soft-icon-act ic-run" ${locked || active ? 'disabled' : ''}
                  aria-label="Aceitar contrato de ${esc(m.hirer)}"
                  data-tip-title="${locked ? `Requer Nível ${m.tier}` : (active ? 'Conclua ou aborte a missão atual' : 'Aceitar este contrato')}"
                  data-tip-meta="${esc(rewardShort)}"
                  data-tip-desc="${esc(m.brief)}"
                  onclick="window.handleAcceptMission('${esc(m.id)}')">
                  ${ic(locked ? 'lock' : 'play')}
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${tutBannerHtml}

          <div class="soft-frame" id="missionsExplorerMain">
            ${topFrameBarHtml}

            <div class="soft-explorer-shell">
              <div class="soft-main-col">
                ${activeHtml}
                <div class="soft-table-wrap" role="region" aria-label="Contratos disponíveis">
                  <table class="soft-table clean-hw-table">
                    <thead>
                      <tr>
                        <th class="soft-col-icon"></th>
                        <th>Contratante &amp; Operação</th>
                        <th class="soft-col-size" style="width:140px;">Alvo</th>
                        <th class="soft-col-size" style="width:125px;">Pagamento</th>
                        <th class="soft-col-acts">Ações</th>
                      </tr>
                    </thead>
                    <tbody>${poolRows}</tbody>
                  </table>
                </div>
              </div>

              <aside class="soft-side-bar">
                <div class="soft-donut-wrap">
                  <svg class="soft-donut-svg" viewBox="0 0 116 116" aria-label="Nível de Acesso ${maxTier} de 3">
                    <circle cx="58" cy="58" r="${r}" fill="none" stroke="#222832" stroke-width="8"></circle>
                    <circle cx="58" cy="58" r="${r}" fill="none" stroke="#35b877" stroke-width="8"
                      stroke-linecap="round" stroke-dasharray="${cCirc}" stroke-dashoffset="${offset}" transform="rotate(-90 58 58)"></circle>
                    <text x="58" y="63" text-anchor="middle" fill="#ebeff4" font-family="var(--hc-font-mono)" font-size="18" font-weight="700">Nv.${maxTier}</text>
                  </svg>
                  <div class="soft-donut-title">Nível de Acesso</div>
                  <div class="soft-donut-numbers"><span class="used">${this.state.completedCount || 0}</span> concluídas</div>
                </div>

                <div class="soft-bays-box">
                  <div class="soft-bay-row"><span>Acesso Atual</span><span style="color:var(--hc-accent-text);">Nível ${maxTier} / 3</span></div>
                  <div class="soft-bay-row"><span>Reputação</span><span>${myRep.toLocaleString('pt-BR')} REP</span></div>
                  <div class="soft-bay-row"><span>Concluídas</span><span>${this.state.completedCount || 0}</span></div>
                </div>

                <div class="soft-tool-tiles">
                  <button type="button" class="soft-tool-tile span-2" onclick="window.missionsEngine.generatePool();window.missionsEngine.renderUI();">
                    ${ic('refresh-cw')}
                    <span>Renovar Contratos</span>
                  </button>
                </div>
              </aside>
            </div>
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
    else if (typeof window.showToast === 'function') window.showToast(`Contrato aceito! Invada ${res.mission.targetIp}.`);
    return res;
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
