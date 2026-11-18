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
      title: 'Hacking 101: Força-Bruta & Limpeza Forense',
      cost: 0,
      repReward: 100,
      unlockBadge: '+15% Velocidade Bruteforce',
      bonusDesc: '+100 REP · +15% potência em Cracker.crc · Libera Invasão Tutorial',
      pages: [
        {
          heading: 'Módulo 1/3 — Quebrando Senhas Root com Cracker.crc',
          body: 'Na aba Internet, digite o IP do alvo e abra a guia Invadir. O Ataque Força-Bruta usa seu Cracker.crc para descobrir a senha root e salvá-la automaticamente no seu Hacked Database.'
        },
        {
          heading: 'Módulo 2/3 — Entrando via SSH e Operando Arquivos',
          body: 'Com a senha salva no Hacked Database, vá à guia Entrar para abrir o shell root@alvo. Lá você acessa arquivos confidenciais, carteiras wallet.dat de Bitcoin e envia seus vírus.'
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
      title: 'Exploits de Porta & Reconhecimento Nmap',
      cost: 250,
      repReward: 120,
      unlockBadge: '+0.4x Potência SSH_Exploit.exp',
      bonusDesc: '+120 REP · Bônus permanente +0.4x em ataques Exploit após Port Scan',
      pages: [
        {
          heading: 'Módulo 1/2 — Mapeamento de Portas (Port Scan)',
          body: 'Enquanto força-bruta leva tempo na CPU, um ataque Exploit invade instantaneamente sem precisar descobrir a senha. Primeiro execute o Port Scan na aba Invadir para mapear as portas 22/ssh e 21/ftp.'
        },
        {
          heading: 'Módulo 2/2 — Superando o Firewall do Alvo',
          body: 'O ataque Exploit compara a potência do seu SSH_Exploit.exp contra o Firewall.fwl da vítima. Com esta certificação, todos os seus exploits ganham +0.4x de potência efetiva.'
        }
      ]
    },
    {
      id: 4,
      code: 'CERT-301',
      title: 'Engenharia de Vírus, Mineração BTC & Ataque DDoS',
      cost: 800,
      repReward: 150,
      unlockBadge: 'Libera Ataques DDoS & +15% Coletor',
      bonusDesc: '+150 REP · Destrava Canhão DDoS contra alvos/FBI · +15% no Collector.vcol',
      pages: [
        {
          heading: 'Módulo 1/3 — As 5 Famílias de Vírus e Suas Potências',
          body: 'Cada vírus tem papel tático: Spam.vspam ($/CPU), Warez.vwarez ($/Banda), Miner.vminer (minera Bitcoin real direto para sua carteira), BankTrojan.vbank (alto $ em bancos/empresas) e DDoS_Node.vddos (soma Gbps de ataque).'
        },
        {
          heading: 'Módulo 2/3 — Coletando com Collector.vcol',
          body: 'Vírus plantados acumulam dólares e satoshis em tempo real. Use o Collector.vcol na aba Software & Vírus para recolher tudo de uma vez com multiplicador de eficiência.'
        },
        {
          heading: 'Módulo 3/3 — Derrubando Procurados do FBI via DDoS',
          body: 'Plante DDoS_Node.vddos em múltiplos servidores para somar poder em Gbps. Com esta certificação, você pode disparar ataques DDoS em Missões e capturar recompensas milionárias na Lista de Procurados do FBI!'
        }
      ]
    },
    {
      id: 5,
      code: 'CERT-401',
      title: 'Defesa Cibernética, Mitigação DDoS & Criptografia',
      cost: 2000,
      repReward: 200,
      unlockBadge: 'Escudo -35% contra Bots/PvP',
      bonusDesc: '+200 REP · Medalha [GRADUADO MIT-HC] · Reduz em 35% perdas em invasões hostis',
      pages: [
        {
          heading: 'Módulo 1/2 — Protegendo Seu PC de Bots Caçadores',
          body: 'Bots online de alto nível e outros jogadores caçam operadores expostos ou listados na Safenet/FBI. Mantenha Firewall.fwl, Hasher.hash e Antivirus.av ativos e atualizados na aba Software & Vírus.'
        },
        {
          heading: 'Módulo 2/2 — Hardening de Kernel & Mitigação',
          body: 'Ao concluir esta especialização máxima, seu kernel aplica mitigação automática: bots caçadores precisam de 35% mais poder para furar seu Firewall e qualquer dreno sofrido é reduzido drasticamente.'
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

      if (this.readingCourseId) {
        const course = CERT_COURSES.find((c) => c.id === this.readingCourseId);
        const page = course.pages[this.readingPageIdx];
        const isLast = this.readingPageIdx === course.pages.length - 1;
        const done = this.hasCert(course.id);

        container.innerHTML = `
          <div class="hc-card" style="padding: 1.5rem; border-color: rgba(53, 184, 119, 0.4);">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
              <div>
                <span class="hc-badge info">${esc(course.code)}</span>
                <span style="margin-left:8px;font-size:0.8rem;color:var(--hc-text-2);">Aula ${this.readingPageIdx + 1} de ${course.pages.length}</span>
              </div>
              <button type="button" class="hc-btn ghost sm" onclick="window.universityEngine.readingCourseId=null;window.universityEngine.renderUI();">← Voltar aos Cursos</button>
            </div>

            <h2 style="font-size:1.25rem;margin-bottom:6px;">${esc(course.title)}</h2>
            <div class="hc-eyebrow" style="color:var(--hc-accent-text);margin-bottom:12px;">${esc(page.heading)}</div>

            <div style="background:var(--hc-inset);border:1px solid var(--hc-border);border-radius:8px;padding:1.15rem;font-size:0.92rem;line-height:1.65;color:var(--hc-text);margin-bottom:16px;">
              ${esc(page.body)}
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
              <div style="font-size:0.8rem;color:var(--hc-text-2);">Recompensa: <strong>${esc(course.bonusDesc)}</strong></div>
              <div style="display:flex;gap:8px;">
                ${this.readingPageIdx > 0
                  ? `<button type="button" class="hc-btn ghost" onclick="window.universityEngine.prevLessonPage()">← Aula Anterior</button>`
                  : ''}
                ${!isLast
                  ? `<button type="button" id="btnNextLesson" class="hc-btn primary" onclick="window.universityEngine.nextLessonPage()">Próxima Aula →</button>`
                  : (done
                      ? `<button type="button" class="hc-btn primary" onclick="window.universityEngine.readingCourseId=null;window.universityEngine.renderUI();">Revisão Concluída</button>`
                      : `<button type="button" id="btnFinishCert_${course.id}" class="hc-btn primary" onclick="window.handleCompleteCourse(${course.id})">
                           Emitir Certificado ${course.cost > 0 ? `(${fmtUsd(course.cost)})` : '(GRÁTIS)'}
                         </button>`)}
              </div>
            </div>
          </div>
        `;
        return;
      }

      const doneCount = this.getCompletedCount();
      const cardsHtml = CERT_COURSES.map((c) => {
        const done = this.hasCert(c.id);
        const unlocked = c.id === 1 || this.hasCert(c.id - 1);
        return `
          <div class="hc-card" style="padding:1.1rem 1.25rem;display:grid;grid-template-columns:minmax(220px,1.4fr) minmax(200px,1.5fr) auto;gap:14px;align-items:center;opacity:${unlocked || done ? '1' : '0.58'};border-color:${done ? 'rgba(53,184,119,0.4)' : 'var(--hc-border)'};">
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span class="hc-badge ${done ? 'success' : (unlocked ? 'info' : 'warn')}">${done ? 'CERTIFICADO' : (unlocked ? c.code : 'BLOQUEADO')}</span>
                <strong style="font-size:0.95rem;">${esc(c.title)}</strong>
              </div>
              <div style="font-size:0.76rem;color:var(--hc-text-3);font-family:var(--hc-font-mono);margin-top:4px;">
                ${c.pages.length} aulas · Taxa: ${c.cost === 0 ? 'GRÁTIS' : fmtUsd(c.cost)}
              </div>
            </div>

            <div style="font-size:0.82rem;color:var(--hc-text-2);">
              <strong style="color:var(--hc-accent-text);display:block;margin-bottom:2px;">${esc(c.unlockBadge)}</strong>
              ${esc(c.bonusDesc)}
            </div>

            <div style="display:flex;gap:8px;justify-content:flex-end;">
              <button type="button" id="btnOpenCourse_${c.id}" class="hc-btn ${done ? 'ghost' : 'primary'} sm" ${!unlocked && !done ? 'disabled' : ''} onclick="window.universityEngine.openCourseReader(${c.id})">
                ${done ? 'Revisar Aulas' : (c.cost === 0 ? 'Estudar Grátis →' : `Matricular (${fmtUsd(c.cost)})`)}
              </button>
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
            <div class="hc-card" style="padding:1rem 1.15rem;">
              <div class="hc-stat-label">Progresso Acadêmico</div>
              <div class="hc-stat-value">${doneCount} / 5 <span style="font-size:0.85rem;color:var(--hc-text-2);">Certificações</span></div>
            </div>
            <div class="hc-card" style="padding:1rem 1.15rem;">
              <div class="hc-stat-label">Status de Graduação</div>
              <div class="hc-stat-value" style="font-size:1.15rem;color:${doneCount === 5 ? 'var(--hc-accent-text)' : 'var(--hc-text)'};">
                ${doneCount === 5 ? '[GRADUADO MIT-HC]' : 'Estudante Ativo'}
              </div>
            </div>
            <div class="hc-card" style="padding:1rem 1.15rem;">
              <div class="hc-stat-label">Bônus Ativos de Curso</div>
              <div style="font-size:0.8rem;color:var(--hc-text-2);margin-top:4px;font-family:var(--hc-font-mono);">
                CRC:${this.hasCert(2) ? '+15%' : '0%'} · EXP:${this.hasCert(3) ? '+0.4x' : '0'} · DDoS:${this.hasCert(4) ? 'LIBERADO' : 'LOCK'} · DEF:${this.hasCert(5) ? '-35%' : '0%'}
              </div>
            </div>
          </div>

          <div class="hc-eyebrow">Trilha Oficial de Certificações (Ordem Sequencial)</div>
          <div style="display:flex;flex-direction:column;gap:10px;">${cardsHtml}</div>
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

      const tutInfo = window.tutorialEngine ? window.tutorialEngine.getCurrentStepInfo() : { completed: true };
      const maxTier = this.getPlayerAllowedTier();
      const active = this.state.activeMission;

      const tutCardHtml = tutInfo.completed ? '' : `
        <div class="hc-card" style="padding:1.15rem 1.3rem;border-color:rgba(53,184,119,0.45);background:rgba(53,184,119,0.06);display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;">
          <div style="max-width:720px;">
            <span class="hc-badge success">${esc(tutInfo.badge)}</span>
            <h3 style="font-size:1.02rem;margin:6px 0 4px;">${esc(tutInfo.title)}</h3>
            <p style="font-size:0.83rem;color:var(--hc-text-2);margin:0;">${esc(tutInfo.desc)}</p>
          </div>
          <button type="button" id="btnTutorialAction" class="hc-btn primary" onclick="window.tutorialEngine.getCurrentStepInfo().action()">
            ${esc(tutInfo.cta)}
          </button>
        </div>
      `;

      let activeHtml = '';
      if (active) {
        const btcTag = active.rewardSats > 0 ? ` + ${(active.rewardSats / 100000000).toFixed(5)} BTC` : '';
        let actionControl = `
          <button type="button" class="hc-btn primary sm" onclick="window.internetEngine.openIp('${esc(active.targetIp)}', 'invadir')">
            Abrir Alvo ${esc(active.targetIp)} na Internet →
          </button>
        `;
        if (active.type === 'check_balance') {
          actionControl = `
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
              <button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('${esc(active.targetIp)}', 'invadir')">Inspecionar ${esc(active.targetIp)}</button>
              <input type="number" id="missionBalanceInput" class="form-input" style="width:170px;padding:0.35rem 0.6rem;" placeholder="Saldo $ visto (ex: 1340)">
              <button type="button" id="btnSubmitBalanceMission" class="hc-btn primary sm" onclick="window.handleMissionBalanceSubmit()">Confirmar Saldo</button>
            </div>
          `;
        } else if (active.type === 'ddos_takedown') {
          actionControl = `
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button type="button" id="btnExecMissionDdos" class="hc-btn primary sm" onclick="window.handleMissionDdos()">Disparar Ataque DDoS em ${esc(active.targetIp)}</button>
            </div>
          `;
        }

        activeHtml = `
          <div class="hc-card" style="padding:1.2rem;border-color:var(--hc-accent);">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:10px;">
              <div>
                <span class="hc-badge success">CONTRATO EM ANDAMENTO</span>
                <span class="hc-badge info" style="margin-left:6px;">${esc(active.badge)} · Nível ${active.tier}</span>
                <h3 style="font-size:1.05rem;margin-top:6px;">Contratante: ${esc(active.hirer)} — Alvo: <code style="color:var(--hc-accent-text);">${esc(active.targetIp)}</code> (${esc(active.targetHostname)})</h3>
              </div>
              <div style="text-align:right;">
                <div style="font-family:var(--hc-font-mono);font-weight:700;color:var(--hc-accent-text);font-size:1.05rem;">${fmtUsd(active.rewardCash)}${btcTag}</div>
                <div style="font-size:0.75rem;color:var(--hc-text-3);">+${active.repReward} REP</div>
              </div>
            </div>
            <p style="font-size:0.84rem;color:var(--hc-text-2);margin:0 0 12px;">${esc(active.brief)}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
              ${actionControl}
              <button type="button" class="hc-btn ghost sm" style="color:var(--hc-danger-text);" onclick="window.missionsEngine.abortActiveMission()">Abortar Contrato</button>
            </div>
          </div>
        `;
      }

      const poolFiltered = this.state.pool.filter((m) => this.filterTier === 0 || m.tier === this.filterTier);
      const poolHtml = poolFiltered.map((m) => {
        const locked = m.tier > maxTier;
        const btcTag = m.rewardSats > 0 ? ` + ${(m.rewardSats / 100000000).toFixed(5)} BTC` : '';
        return `
          <div class="hc-card" style="padding:1rem 1.15rem;display:grid;grid-template-columns:minmax(220px,1.4fr) minmax(220px,1.6fr) auto;gap:12px;align-items:center;opacity:${locked ? '0.58' : '1'};">
            <div>
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <span class="hc-badge ${m.tier === 3 ? 'danger' : (m.tier === 2 ? 'warn' : 'info')}">Nível ${m.tier}</span>
                <span class="hc-badge">${esc(m.badge)}</span>
              </div>
              <strong style="display:block;margin-top:5px;font-size:0.92rem;">${esc(m.hirer)}</strong>
              <div style="font-size:0.76rem;color:var(--hc-text-3);font-family:var(--hc-font-mono);">Alvo: ${esc(m.targetIp)} (${esc(m.targetHostname)})</div>
            </div>

            <div style="font-size:0.8rem;color:var(--hc-text-2);">${esc(m.brief)}</div>

            <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
              <div style="font-family:var(--hc-font-mono);font-weight:700;color:var(--hc-accent-text);font-size:0.9rem;">
                ${fmtUsd(m.rewardCash)}${btcTag}
              </div>
              <button type="button" id="btnAcceptMission_${m.type}" class="hc-btn ${locked || active ? 'ghost' : 'primary'} sm" ${locked || active ? 'disabled' : ''} onclick="window.handleAcceptMission('${esc(m.id)}')">
                ${locked ? `Requer Nível ${m.tier}` : (active ? '1 Ativa por Vez' : 'Aceitar Contrato')}
              </button>
            </div>
          </div>
        `;
      }).join('');

      const histHtml = (this.state.history || []).slice(0, 5).map((h) => `
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--hc-border);font-size:0.79rem;">
          <span><strong style="font-family:var(--hc-font-mono);">[${esc(h.at)}]</strong> ${esc(h.hirer)} · <code>${esc(h.targetIp)}</code> (${esc(h.badge)})</span>
          <strong style="color:${h.status === 'CONCLUÍDA' ? 'var(--hc-accent-text)' : 'var(--hc-danger-text)'};">${esc(h.status)} · ${esc(h.rewardStr)}</strong>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${tutCardHtml}
          ${activeHtml}

          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button type="button" class="hc-btn sm ${this.filterTier === 0 ? 'primary' : 'ghost'}" onclick="window.missionsEngine.filterTier=0;window.missionsEngine.renderUI();">Todos</button>
              <button type="button" class="hc-btn sm ${this.filterTier === 1 ? 'primary' : 'ghost'}" onclick="window.missionsEngine.filterTier=1;window.missionsEngine.renderUI();">Nível 1 (Iniciante)</button>
              <button type="button" class="hc-btn sm ${this.filterTier === 2 ? 'primary' : 'ghost'}" onclick="window.missionsEngine.filterTier=2;window.missionsEngine.renderUI();">Nível 2 (Corporativo)</button>
              <button type="button" class="hc-btn sm ${this.filterTier === 3 ? 'primary' : 'ghost'}" onclick="window.missionsEngine.filterTier=3;window.missionsEngine.renderUI();">Nível 3 (Black-Ops)</button>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-size:0.8rem;color:var(--hc-text-2);">Seu Nível de Acesso: <strong>Nível ${maxTier}</strong> · Concluídas: <strong>${this.state.completedCount || 0}</strong></span>
              <button type="button" class="hc-btn ghost sm" onclick="window.missionsEngine.generatePool();window.missionsEngine.renderUI();">Renovar Contratos</button>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px;">${poolHtml}</div>

          ${histHtml ? `
            <div class="hc-card" style="padding:1rem 1.15rem;">
              <div class="hc-eyebrow" style="margin-bottom:6px;">Histórico Recente de Contratos</div>
              ${histHtml}
            </div>
          ` : ''}
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
