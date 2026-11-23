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
  // 1. UNIVERSIDADE & CERTIFICAÇÕES SEQUENCIAIS (5 CURSOS REFINADOS + EXAME PRÁTICO + DIPLOMA OFICIAL)
  // =========================================================================
  const CERT_COURSES = [
    {
      id: 1,
      code: 'CERT-101',
      title: 'Fundamentos: IP Protegido, Contas das 12h & Dinheiro Sujo vs. Limpo',
      cost: 0,
      reqRep: 0,
      studyLabel: 'Imediato',
      repReward: 100,
      unlockBadge: 'Libera Trabalhos, Lavagem & Etapa 2',
      bonusDesc: '+100 REP · Destrava Trabalhos & Missões, Lavagem de Dinheiro e Curso #2',
      exam: {
        question: 'O que acontece se você esquecer seu IP gravado no /var/log/syslog de uma máquina invadida?',
        options: [
          'Nada, os registros somem sozinhos em 5 segundos.',
          'A vítima, outros jogadores ou o FBI rastreiam seu IP real e podem contra-atacar seu PC!',
          'Você ganha bônus automático de reputação.'
        ],
        correctIdx: 1
      },
      pages: [
        {
          heading: 'Aula 1/3 — Seu IP Protegido, Escudo Iniciante (< 200 REP) & Menu Progressivo',
          body: 'Seu endereço IPv4 no topo da tela é a placa do seu PC na rede (os últimos 7 dígitos ficam borrados automaticamente para ninguém espiar — passe o mouse para ver). Enquanto você tiver menos de 200 REP, seu Escudo Iniciante bloqueia ataques surpresa na porta 22! E repare no menu lateral: novas telas abrem aos poucos conforme você evolui (com selo verde NOVO), sem poluir sua tela.'
        },
        {
          heading: 'Aula 2/3 — Troca Grátis no Provedor ISP (71.4.5.1) & Contas das 12:00',
          body: 'Esqueceu seu IP num servidor invadido? Você tem 1 troca gratuita de IP por semana no Provedor ISP (71.4.5.1). No relógio do jogo, 1 hora real = 1 dia e 24h reais = 1 mês: às 12:00 fecham as contas de Luz, Internet e Aluguel do seu Esconderijo (acumulam no máximo 3 meses e pausam sozinhas se você ficar offline!).'
        },
        {
          heading: 'Aula 3/3 — Regra de Ouro: Dinheiro Limpo vs. Dinheiro Sujo (Lavagem)',
          body: 'No Hacker City existem duas carteiras: Dinheiro Limpo (ganho em cursos, trabalhos legais e Bolsa — aceito para comprar Peças, Cursos e Imóveis) e Dinheiro Sujo (ganho em invasões, saques e vírus). Nunca tente forçar Dinheiro Sujo na loja sem lavar antes, senão a polícia cola em você e prende! Basta lavar na Vitrine Global de Lavagem (15 min reais) para transformá-lo em Dinheiro Limpo.'
        }
      ]
    },
    {
      id: 2,
      code: 'CERT-102',
      title: 'Invasão 101: Força de Programas, Peças/Fonte & Rastros 7-Passos',
      cost: 0,
      reqRep: 100,
      studyLabel: '10 min',
      repReward: 100,
      unlockBadge: '+20% Vel. Quebra + Fórum & BTC',
      bonusDesc: '+100 REP · +20% velocidade no Quebrador · Destrava Fórum, Notícias, Bitcoin e Placar',
      exam: {
        question: 'Qual é a regra obrigatória para quebrar a senha de um servidor alvo?',
        options: [
          'Ter apenas um processador caro, mesmo com Cracker v0.5 contra Firewall v5.0.',
          'Seu Cracker.crc escolhido no Mini-PC precisa ter versão maior ou igual ao Firewall E ao Hasher do alvo.',
          'Desligar seu próprio Firewall antes de atacar.'
        ],
        correctIdx: 1
      },
      pages: [
        {
          heading: 'Aula 1/3 — Programas na Memória RAM vs. Sob Demanda & Regra de Versão',
          body: 'Defesas contínuas (Firewall.fwl, Hasher.hash, Collector.vcol e Torrent.torrent) rodam na sua Memória RAM (1 de cada tipo por vez, com tempo de troca). Já o Cracker.crc, PortScan.scan e Antivirus.av rodam sob demanda direto do seu HD, SSD ou NVMe. Para quebrar uma senha, seu Cracker.crc precisa ter versão maior ou igual ao Firewall E ao Hasher da vítima!'
        },
        {
          heading: 'Aula 2/3 — Peças sem Pular Geração, Gargalo de CPU & Fonte de Energia (PSU)',
          body: 'Você evolui o PC degrau por degrau (Geração 1 → 2 → 3 → 4 → 5, pagando sempre com Dinheiro Limpo). Fique atento a duas regras físicas: (1) cada CPU tem um limite máximo de versão de programa (rodar acima disso limita a força e esquenta +15°C!), e (2) se suas peças passarem da potência da sua Fonte PSU (180W → 400W → 750W), o disjuntor cai derrubando seus processos!'
        },
        {
          heading: 'Aula 3/3 — Limpe Seu Rastro por Último (Sombra Magnética & 7-Passos)',
          body: 'Entrar no alvo, subir um vírus e executá-lo gravam seu IP na aba Logs (/var/log/syslog) da vítima! Sempre limpe seu IP como último passo antes de sair. Contra rivais avançados, apagar simples ainda deixa uma Sombra Magnética parcial por 5 min — use o Triturador 7-Passos quando quiser destruir 100% da prova física!'
        }
      ]
    },
    {
      id: 3,
      code: 'CERT-201',
      title: 'Mercado Global MMO: Lavagem 5/1h, Bolsa Unificada, Rotas & Fórum 30m',
      cost: 1500,
      reqRep: 250,
      studyLabel: '45 min',
      repReward: 120,
      unlockBadge: 'Libera Bolsa, Mapa-Múndi & Clãs',
      bonusDesc: '+120 REP · Destrava Bolsa de Empresas, Mapa-Múndi, Exploits FTP+SSH, Câmeras e Clãs',
      exam: {
        question: 'Como obter acesso ROOT sem precisar quebrar a senha do servidor?',
        options: [
          'Executando PortScan.scan e depois combinando FTP_Exploit.exp + SSH_Exploit.exp em versões >= Firewall do alvo.',
          'Apenas olhando a página inicial do servidor.',
          'Instalando um arquivo .txt no seu próprio HD.'
        ],
        correctIdx: 0
      },
      pages: [
        {
          heading: 'Aula 1/3 — Exploits FTP+SSH, Rotas no Mapa-Múndi & Iscas PGP',
          body: 'Rode o PortScan.scan e combine FTP_Exploit.exp + SSH_Exploit.exp >= Firewall para entrar como ROOT sem senha! Atenção: servidores Nível 3+ exigem ligar 2+ cidades de salto no Mapa-Múndi (atacar direto gera bloqueio 403 e +2 de Procura!). E no portal hc://vazamentos, sempre confira a assinatura PGP antes de usar um vazamento para não cair em isca policial.'
        },
        {
          heading: 'Aula 2/3 — Vitrine Global de Lavagem (5/1h) & Bolsa Unificada',
          body: 'Na Vitrine Global aparecem 5 empresas por hora (empresas anunciadas por jogadores reais por $ 10.000 + Bots completando vagas; máx. 3 lavagens/dia na mesma dupla). Já na Bolsa CyberStock, os preços das 8 empresas são compartilhados entre todos os jogadores: aposte na queda (Short), apague as câmeras CFTV da empresa para derrubar a ação e lucre Dinheiro Limpo! (3 ataques em 10m ativam o Circuit Breaker de proteção).'
        },
        {
          heading: 'Aula 3/3 — Mural de Serviços do Fórum (Reserva Exclusiva de 30 min)',
          body: 'No Fórum você pode contratar outro jogador com pagamento garantido ($ 2.000 a $ 25.000 Limpos + 15% taxa) ou pegar serviços disponíveis com 30 minutos de exclusividade para ganhar Dinheiro Sujo (atrasar custa -35 REP). Contratos ainda abertos podem ser cancelados pelo criador, mas os 15% de taxa não voltam.'
        }
      ]
    },
    {
      id: 4,
      code: 'CERT-301',
      title: 'Engenharia de Vírus: Lab (1+2+1), Aluguel P2P, Encomendas & Leilão 2h',
      cost: 6000,
      reqRep: 600,
      studyLabel: '2 horas',
      repReward: 150,
      unlockBadge: 'Libera Lab, VPS & Canhão DDoS',
      bonusDesc: '+150 REP · Destrava Laboratório de Vírus, Servidores VPS, Ataques DDoS e +15% no Coletor',
      exam: {
        question: 'Qual é o multiplicador máximo do vírus mais forte (v10.0) e a regra de uso do Laboratório?',
        options: [
          'v10.0 rende 50x e pode ser usado infinitas vezes por minuto de graça.',
          'v10.0 rende 3.00x (regredindo nas versões menores), custando $ 1.000 com limite de 1 vez por Mês (dia).',
          'Vírus não precisam ser executados na memória da vítima para render.'
        ],
        correctIdx: 1
      },
      pages: [
        {
          heading: 'Módulo 1/3 — As 5 Famílias de Vírus & Escala Regressiva (v10.0 = 3.00x)',
          body: 'Spam.vspam ($/CPU), Warez.vwarez ($/Banda — exige Torrent.torrent rodando no seu PC!), Miner.vminer (BTC/CPU), BankTrojan.vbank ($ bancário) e DDoS_Node.vddos (Gbps). A versão máxima atual é v10.0 com multiplicador de 3.00x, regredindo proporcionalmente até v1.0 (1.00x) e protótipos abaixo disso.'
        },
        {
          heading: 'Módulo 2/3 — Laboratório de Vírus ($ 1.000 · 1x por Mês/Dia)',
          body: 'Em Meu Computador > Laboratório de Vírus, por $ 1.000 (1 vez por Mês / 24h reais), você monta seu próprio vírus em 3 rounds aleatórios (escolher 1 -> escolher 2 -> escolher 1 bloco de código) entre 54 conjuntos! Se cair um vírus que você já tem, o sistema preserva sua versão mais forte e lapida +v0.1/+v0.2 sem entupir seu HD.'
        },
        {
          heading: 'Módulo 3/3 — Antivírus, Coletor e Ataques DDoS',
          body: 'Ative o Collector.vcol para recolher dólares e Bitcoins dos vírus espalhados, e use o DDoS_Breaker.vbrk para disparar sobrecargas DDoS que derrubam alvos do FBI e danificam o hardware de rivais!'
        }
      ]
    },
    {
      id: 5,
      code: 'CERT-401',
      title: 'Mestrado MIT-HC: Defesa 15s (VPS), Cofre Suíço, RAID & Patrocínio Clã',
      cost: 18000,
      reqRep: 1500,
      studyLabel: '6 horas',
      repReward: 200,
      unlockBadge: 'Escudo DDoS + Acesso Tier 5',
      bonusDesc: '+200 REP · Medalha [GRADUADO MIT-HC] · Firewall mitiga ataques DDoS e libera Mainframes Tier 5!',
      exam: {
        question: 'Se um invasor apagar o próprio IP da sua log e deixar apenas uma farpa com o nick dele, como reagir?',
        options: [
          'É impossível fazer qualquer coisa.',
          'Colocar a cabeça dele a prêmio pelo Nick no Quadro Público de Vingança e reforçar Firewall/Hasher!',
          'Apagar seu próprio sistema operacional.'
        ],
        correctIdx: 1
      },
      pages: [
        {
          heading: 'Módulo 1/2 — Blindagem Ativa, Reparo Físico & Backup em HD Externo',
          body: 'Mantenha Firewall.fwl e Hasher.hash evoluídos rodando na RAM, guarde cópias seguras no HD Externo e verifique a Saúde Física das peças caso sofra sobrecarga DDoS.'
        },
        {
          heading: 'Módulo 2/2 — Mitigação DDoS Automática & Quadro de Vingança',
          body: 'Com este diploma máximo (MIT-HC), seu Firewall.fwl mitiga automaticamente ataques DDoS proporcionalmente à versão dele — e você domina a contra-inteligência via Nmap.nmap, Conexões ao Vivo e Recompensas por Nick!'
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
      this.selectedExamOption = null;
      this.examFeedback = null;
      this.viewingDiplomaId = null;
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

      this.state = saved && Array.isArray(saved.completed)
        ? { completed: saved.completed, issuedAt: saved.issuedAt || {} }
        : { completed: [], issuedAt: {} };
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
        if (typeof window.showToast === 'function') {
          window.showToast(`Pré-requisito pendente: conclua primeiro a Certificação #${certId - 1}!`);
        }
        return;
      }
      this.viewingDiplomaId = null;
      this.readingCourseId = certId;
      this.readingPageIdx = 0;
      this.selectedExamOption = null;
      this.examFeedback = null;
      this.renderUI();
    }

    selectExamAnswer(optIdx) {
      const course = CERT_COURSES.find((c) => c.id === this.readingCourseId);
      if (!course || !course.exam) return;
      this.selectedExamOption = Number(optIdx);
      if (this.selectedExamOption === course.exam.correctIdx) {
        this.examFeedback = { ok: true, text: '✅ Resposta exata! Exame aprovado — você já pode emitir seu Certificado Oficial.' };
      } else {
        this.examFeedback = { ok: false, text: '❌ Resposta incorreta. Revise a regra apresentada na aula acima e tente outra alternativa!' };
      }
      this.renderUI();
    }

    openDiplomaView(certId) {
      this.ensureLoaded();
      if (!this.hasCert(certId)) return;
      this.readingCourseId = null;
      this.viewingDiplomaId = Number(certId);
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

    async completeCourse(certId, opts = {}) {
      this.ensureLoaded();
      const course = CERT_COURSES.find((c) => c.id === certId);
      if (!course) return { success: false, message: 'Curso inexistente.' };
      if (this.hasCert(certId)) return { success: true, already: true, message: 'Certificação já concluída!' };
      if (certId > 1 && !this.hasCert(certId - 1)) {
        return { success: false, message: `Conclua primeiro o Curso #${certId - 1}!` };
      }
      if (!opts.skipExam && this.readingCourseId === certId && course.exam && this.selectedExamOption !== course.exam.correctIdx) {
        return { success: false, message: 'Responda corretamente à pergunta rápida do Exame Prático antes de emitir o certificado!' };
      }

      if (course.cost > 0 && !opts.tuitionAlreadyPaid) {
        if (!window.currentWallet || parseFloat(window.currentWallet.balance) < course.cost) {
          return { success: false, message: `Saldo insuficiente para a taxa acadêmica de ${fmtUsd(course.cost)}!` };
        }
        let nextBal = Math.max(0, +(parseFloat(window.currentWallet.balance) - course.cost).toFixed(2));
        if (window.supabase && typeof window.supabase.rpc === 'function') {
          try {
            const { data } = await window.supabase.rpc('buy_black_market_item', {
              p_item_type: `university_cert_${certId}`,
              p_cost: course.cost
            });
            if (data && data.new_balance !== undefined) {
              nextBal = Number(data.new_balance);
            }
          } catch (e) {}
        }
        const applyFee = () => { window.currentWallet.balance = nextBal; };
        if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
          window.integrityGuard.runAuthorized(applyFee);
        } else {
          applyFee();
        }
      }

      this.state.completed.push(certId);
      if (!this.state.issuedAt) this.state.issuedAt = {};
      this.state.issuedAt[certId] = new Date().toLocaleDateString('pt-BR') + ' · ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      this.readingCourseId = null;
      this.viewingDiplomaId = certId;
      this.save();

      if (window.currentProfile) {
        const applyRep = () => {
          window.currentProfile.reputation = (window.currentProfile.reputation || 0) + course.repReward;
        };
        if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
          window.integrityGuard.runAuthorized(applyRep);
        } else {
          applyRep();
        }
      }
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('UNIVERSITY', `Certificação ${course.code} (${course.title}) concluída! (+${course.repReward} REP)`, 'success');
      }
      if (window.hackerAudio) window.hackerAudio.playCashChime();

      if (window.tutorialEngine) {
        window.tutorialEngine.onCertCompleted(certId);
      }
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      this.renderUI();
      return { success: true, message: `Diploma ${course.code} emitido! ${course.unlockBadge}` };
    }

    renderUI(containerId = 'universityAppBody') {
      const container = document.getElementById(containerId);
      if (!container) return;
      this.ensureLoaded();
      const ic = (n) => (window.HC && window.HC.icon ? window.HC.icon(n) : '');

      // Visualização do Certificado / Diploma Oficial Emitido
      if (this.viewingDiplomaId) {
        const course = CERT_COURSES.find((c) => c.id === this.viewingDiplomaId);
        if (course && this.hasCert(course.id)) {
          const opName = (window.currentProfile && window.currentProfile.hacker_tag) || 'Operador';
          const issuedStr = (this.state.issuedAt && this.state.issuedAt[course.id]) || new Date().toLocaleDateString('pt-BR');
          const serialHash = ('MIT-HC-' + course.code + '-' + opName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)).padEnd(20, 'X');
          container.innerHTML = `
            <div class="soft-frame" id="universityDiplomaCard">
              <div class="soft-tabs-bar">
                <div class="soft-tabs-left">
                  <button type="button" class="soft-tab-btn active">
                    ${ic('award')} <span>Certificado Oficial · ${esc(course.code)}</span>
                  </button>
                </div>
                <button type="button" class="hc-btn ghost sm" onclick="window.universityEngine.viewingDiplomaId=null;window.universityEngine.renderUI();">← Voltar à Grade</button>
              </div>
              <div style="padding:26px;display:flex;justify-content:center;">
                <div style="max-width:680px;width:100%;padding:28px 30px;border-radius:14px;background:linear-gradient(155deg,#101923,#0b1118);border:2px solid rgba(53,184,119,0.55);box-shadow:0 18px 48px rgba(0,0,0,0.55);text-align:center;">
                  <div class="hc-eyebrow" style="color:#4ade80;letter-spacing:0.12em;">INSTITUTO DE ENGENHARIA CIBERNÉTICA · MIT-HC</div>
                  <h2 style="margin:8px 0 6px;font-size:1.45rem;color:#f8fafc;">CERTIFICADO DE HABILITAÇÃO</h2>
                  <div style="font-size:0.84rem;color:var(--hc-text-2);margin-bottom:16px;">Certificamos que o operador registrado sob o codinome</div>
                  <div style="display:inline-block;padding:8px 22px;border-radius:999px;background:rgba(53,184,119,0.12);border:1px solid rgba(53,184,119,0.45);font-family:var(--hc-font-mono);font-size:1.15rem;font-weight:800;color:#4ade80;margin-bottom:16px;">
                    @${esc(opName)}
                  </div>
                  <div style="font-size:0.9rem;color:var(--hc-text);margin-bottom:6px;">concluiu com aprovação integral o exame prático de</div>
                  <div style="font-size:1.1rem;font-weight:700;color:#38bdf8;margin-bottom:14px;">${esc(course.code)} — ${esc(course.title)}</div>
                  <div style="padding:10px 14px;border-radius:8px;background:#090d12;border:1px solid var(--hc-border);font-size:0.82rem;color:#d1fae5;margin-bottom:16px;">
                    ⚡ <strong>Bônus Passivo Vitalício Ativado:</strong> ${esc(course.bonusDesc)}
                  </div>
                  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;padding-top:12px;border-top:1px dashed var(--hc-border);font-family:var(--hc-font-mono);font-size:0.72rem;color:var(--hc-text-3);">
                    <span>SÉRIE: ${esc(serialHash)}</span>
                    <span>EMISSÃO: ${esc(issuedStr)}</span>
                  </div>
                </div>
              </div>
            </div>
          `;
          return;
        }
      }

      if (this.readingCourseId) {
        const course = CERT_COURSES.find((c) => c.id === this.readingCourseId);
        const page = course.pages[this.readingPageIdx];
        const isLast = this.readingPageIdx === course.pages.length - 1;
        const done = this.hasCert(course.id);
        const pl = window.progressionLocksEngine || null;
        const gateMeta = pl ? pl.getCourseGateMeta(course.id) : null;
        const enr = pl && pl.state && pl.state.uniEnrollment && pl.state.uniEnrollment.certId === course.id ? pl.state.uniEnrollment : null;
        const studyRemMs = enr ? Math.max(0, enr.readyAt - Date.now()) : (course.id > 1 ? (gateMeta ? gateMeta.studyMs : 0) : 0);
        const lockRemMs = pl && pl.state && pl.state.examLockUntil ? Math.max(0, Number(pl.state.examLockUntil[course.id] || 0) - Date.now()) : 0;
        const retakeDue = pl && pl.state && pl.state.retakeFeeDue ? Number(pl.state.retakeFeeDue[course.id] || 0) : 0;

        if (!this.multiExamAns || this.multiExamCourseId !== course.id) {
          this.multiExamCourseId = course.id;
          this.multiExamAns = [null, null, null];
        }

        const examBlockHtml = (isLast && !done && gateMeta) ? `
          <div id="uniExamBox" style="background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.35);border-radius:10px;padding:15px 16px;display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
              <div class="hc-eyebrow" style="color:#38bdf8;">🔒 Banca Oficial MIT-HC (3 Questões · Reprovação trava 30m + 25% Taxa)</div>
              ${course.id > 1 && !enr ? `
                <button type="button" id="btnEnrollCourse_${course.id}" class="hc-btn primary sm" onclick="window.progressionLocksEngine.enrollInCourse(${course.id})">
                  🎓 Matricular e Iniciar Aula (${gateMeta.costClean > 0 ? '$ ' + gateMeta.costClean.toLocaleString('pt-BR') + ' Limpos' : 'Grátis'} · ${Math.round(gateMeta.studyMs / 60000)}m reais)
                </button>
              ` : ''}
              ${enr && studyRemMs > 0 ? `<span class="hc-badge warn mono">⏳ Carga horária em curso: faltam ${Math.ceil(studyRemMs / 60000)} min reais</span>` : ''}
              ${lockRemMs > 0 ? `<span class="hc-badge danger mono">❌ Reprovado: aguarde ${Math.ceil(lockRemMs / 60000)}m (+$ ${retakeDue} 2ª chamada)</span>` : ''}
            </div>
            ${gateMeta.questions.map((qObj, qIdx) => `
              <div style="padding:10px 12px;background:#0a0f16;border:1px solid #1e2c3e;border-radius:8px;">
                <div style="font-size:0.84rem;font-weight:700;margin-bottom:7px;">${esc(qObj.q)}</div>
                <div style="display:flex;flex-direction:column;gap:5px;">
                  ${qObj.opts.map((opt, oIdx) => {
                    const sel = this.multiExamAns[qIdx] === oIdx;
                    return `
                      <button type="button" class="uni-exam-opt" style="text-align:left;padding:7px 10px;border-radius:6px;background:${sel ? 'rgba(56,189,248,0.16)' : '#0e151f'};border:1px solid ${sel ? '#38bdf8' : '#223146'};color:var(--hc-text);font-size:0.8rem;cursor:pointer;"
                        onclick="window.universityEngine.multiExamAns[${qIdx}]=${oIdx}; window.universityEngine.renderUI();">
                        <strong>${String.fromCharCode(65 + oIdx)})</strong> ${esc(opt)}
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        ` : '';
        const examPassed = done || (this.multiExamAns && this.multiExamAns.every((v) => v !== null) && (course.id === 1 || (enr && studyRemMs === 0)) && lockRemMs === 0);

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

              ${examBlockHtml}

              <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
                <div style="font-size:12.5px;color:var(--hc-text-2);">Vantagem do Diploma: <strong style="color:var(--hc-accent-text);">${esc(course.unlockBadge)}</strong></div>
                <div style="display:flex;gap:8px;">
                  ${this.readingPageIdx > 0
                    ? `<button type="button" class="hc-btn ghost sm" onclick="window.universityEngine.prevLessonPage()">← Anterior</button>`
                    : ''}
                  ${!isLast
                    ? `<button type="button" id="btnNextLesson" class="hc-btn primary sm" onclick="window.universityEngine.nextLessonPage()">Próxima Aula →</button>`
                    : (done
                        ? `<button type="button" class="hc-btn primary sm" onclick="window.universityEngine.openDiplomaView(${course.id})">📜 Ver Certificado</button>`
                        : `<button type="button" id="btnFinishCert_${course.id}" class="hc-btn primary sm" ${examPassed ? '' : 'disabled'} onclick="window.progressionLocksEngine ? window.progressionLocksEngine.submitThreeQuestionExam(${course.id}, window.universityEngine.multiExamAns) : window.handleCompleteCourse(${course.id})">
                             Submeter Prova &amp; Emitir Diploma
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
        const costStr = c.cost === 0 ? 'Grátis' : `$ ${c.cost.toLocaleString('pt-BR')} Limpos`;
        const loadStr = `${c.studyLabel || (c.pages.length + ' aulas')}${c.reqRep > 0 ? ` · ${c.reqRep} REP` : ''}`;
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
            <td class="soft-col-ver" style="white-space:nowrap;">${esc(loadStr)}</td>
            <td class="soft-col-size" style="width:128px;white-space:nowrap;color:${c.cost === 0 ? 'var(--hc-accent-text)' : 'var(--hc-warning-text)'};">${esc(costStr)}</td>
            <td class="soft-col-acts">
              <div class="soft-icon-actions">
                ${done ? `
                  <button type="button" id="btnViewDiploma_${c.id}" class="soft-icon-act ic-run" aria-label="Ver Certificado Oficial de ${esc(c.title)}"
                    data-tip-title="Ver Certificado Emitido" data-tip-meta="${esc(c.code)}" data-tip-desc="Abrir diploma assinado com seu bônus passivo."
                    onclick="window.universityEngine.openDiplomaView(${c.id})">
                    ${ic('award')}
                  </button>` : `
                  <button type="button" class="soft-icon-act ic-info" aria-label="Ver bônus de ${esc(c.title)}"
                    data-tip-title="${esc(c.unlockBadge)}" data-tip-meta="${esc(c.code)}" data-tip-desc="${esc(c.bonusDesc)}">
                    ${ic('info')}
                  </button>`}
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
          const grantStep1 = () => {
            window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) + 80).toFixed(2);
          };
          if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
            window.integrityGuard.runAuthorized(grantStep1);
          } else {
            grantStep1();
          }
        }
        this.save();
        if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
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

      const grantTutFinal = () => {
        if (window.currentWallet) {
          window.currentWallet.balance = +(parseFloat(window.currentWallet.balance) + 350).toFixed(2);
        }
        if (window.currentProfile) {
          window.currentProfile.reputation = (window.currentProfile.reputation || 0) + 120;
        }
      };
      if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
        window.integrityGuard.runAuthorized(grantTutFinal);
      } else {
        grantTutFinal();
      }
      if (window.bitcoinEngine) {
        window.bitcoinEngine.creditSats(200000, 'TUTORIAL', 'Pagamento inicial Numataka // Conclusão da Invasão Tutorial (+0.00200000 BTC)');
      }
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);

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
    { ip: '172.66.40.18', hostname: 'Aegis Security & Vaults S.A.', tier: 1, balanceHint: 310 },
    { ip: '189.40.7.12', hostname: 'KronoTech Sistemas', tier: 2, balanceHint: 680 }
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
      // Garante que contratos legados tenham as novas missões de Desativar Câmeras p/ Roubo e Apagar Gravações do DVR
      const hasHeistCctv = this.state.pool.some((m) => m.cctvObjective === 'disable_all' || m.cctvObjective === 'wipe_recording') ||
        (this.state.activeMission && this.state.activeMission.type === 'cctv_hack');
      if ((this.state.pool.length > 0 && !this.state.pool[0].hirerIp) || !hasHeistCctv) {
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
          badge: 'Desativar Câmeras p/ Roubo',
          tier: 1,
          hirerIdx: 3,
          targetIdx: 0,
          camCode: 'TODAS (4x)',
          camRoom: 'Circuito Completo do Prédio',
          cctvObjective: 'disable_all',
          rewardCash: 1050,
          rewardSats: 0,
          repReward: 105,
          brief: 'Ajude o roubo ao cofre da Farofa Systems S.A. (203.17.88.40): invada o servidor, abra Câmeras Ao Vivo (CFTV) e desative todas as 4 câmeras da empresa para deixar os seguranças no escuro.'
        },
        {
          type: 'cctv_hack',
          badge: 'Apagar Gravação do DVR',
          tier: 1,
          hirerIdx: 2,
          targetIdx: 6,
          camCode: 'CAM-01',
          camRoom: 'Laboratório Limpo P&D Nível 3',
          dvrFileName: 'DVR_CAM01_Invasao_Lab_03h12.mp4',
          cctvObjective: 'wipe_recording',
          rewardCash: 1180,
          rewardSats: 30000,
          repReward: 115,
          brief: 'Um aliado foi filmado sem máscara em 194.88.14.202 (Meridian BioLabs S.A.): invada o NVR, abra Gravações do DVR e apague o vídeo DVR_CAM01_Invasao_Lab_03h12.mp4 antes da perícia!'
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
          badge: 'Cortar Câmera da Doca',
          tier: 2,
          hirerIdx: 5,
          targetIdx: 3,
          camCode: 'CAM-01',
          camRoom: 'Doca Sul & Pátio de Contêineres',
          cctvObjective: 'disable_cam',
          rewardCash: 1490,
          rewardSats: 55000,
          repReward: 135,
          brief: 'Invadir 58.40.12.9 (Corvo Cinza Logística), abrir Câmeras Ao Vivo (CFTV) e desativar a câmera CAM-01 da doca subterrânea para cobrir a retirada do caminhão.'
        },
        {
          type: 'cctv_hack',
          badge: 'Formatar DVR da Empresa',
          tier: 2,
          hirerIdx: 4,
          targetIdx: 8,
          camCode: 'DVR COMPLETO',
          camRoom: 'Todas as 4 Gravações Salvas',
          cctvObjective: 'wipe_all_dvr',
          rewardCash: 1650,
          rewardSats: 75000,
          repReward: 150,
          brief: 'Invadir 189.40.7.12 (KronoTech Sistemas), abrir Gravações do DVR e apagar todas as gravações do assalto noturno ao subsolo.'
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
          dvrFileName: tpl.dvrFileName || null,
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
        if (m.cctvObjective === 'disable_all') {
          return `${playerTag},\n\nNossa equipe está pronta para invadir o prédio da ${m.targetHostname} (${m.targetIp}) e arrombar o cofre agora, mas as câmeras internas estão transmitindo ao vivo para a guarita.\nInvada ${m.targetIp}, abra "Câmeras Ao Vivo (CFTV)" e clique em "Desativar Todas as Câmeras" para deixar os seguranças cegos durante o roubo!\n\nPagamento: $${m.rewardCash} assim que o circuito inteiro estiver desligado.\nLimpe seu IP da log na saída!\n\n— ${m.hirer} [${m.hirerIp}]`;
        }
        if (m.cctvObjective === 'disable_cam') {
          return `${playerTag},\n\nVamos retirar uma carga milionária pela doca da ${m.targetHostname} (${m.targetIp}) em poucos minutos.\nInvada o servidor deles, entre em "Câmeras Ao Vivo (CFTV)" e desative a câmera ${m.camCode} (${m.camRoom}) para cobrir nossa saída.\n\nPagamento: $${m.rewardCash}.\n\n— ${m.hirer} [${m.hirerIp}]`;
        }
        if (m.cctvObjective === 'wipe_recording' || m.cctvObjective === 'wipe_all_dvr') {
          const targetRec = m.cctvObjective === 'wipe_all_dvr' ? 'todas as gravações do DVR' : `a gravação "${m.dvrFileName}"`;
          return `${playerTag},\n\nDeu ruim ontem à noite na ${m.targetHostname} (${m.targetIp}): as câmeras gravaram nossa equipe e o vídeo está salvo no disco do NVR deles!\nAntes que a polícia baixe as imagens, invada ${m.targetIp}, abra "Câmeras Ao Vivo (CFTV) -> Gravações DVR" e apague permanentemente ${targetRec}.\n\nPagamento: $${m.rewardCash} assim que o arquivo não existir mais lá.\n\n— ${m.hirer} [${m.hirerIp}]`;
        }
        return `${playerTag},\n\nInvada ${m.targetHostname} (${m.targetIp}), abra "Câmeras Ao Vivo (CFTV)" na câmera ${m.camCode} e conclua a operação solicitada.\nPagamento: $${m.rewardCash}.\n\n— ${m.hirer} [${m.hirerIp}]`;
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
        if (m.cctvObjective === 'disable_all') {
          return `<strong>${esc(playerTag)}</strong>, nossa equipe tática está posicionada na esquina pronta para entrar na <strong>${esc(m.targetHostname)}</strong> e limpar o cofre, mas os vigilantes estão de olho nas telas. Invada o NVR deles em ${ipLink}, abra <strong>Câmeras Ao Vivo (CFTV)</strong>, confira o movimento e clique em <span class="msn-hl-file">Desativar Todas as Câmeras (Ajudar Roubo)</span> para cortar todo o circuito de vídeo! Pagamos ${moneySpan} no instante em que todas as câmeras ficarem sem sinal.`;
        }
        if (m.cctvObjective === 'disable_cam') {
          return `<strong>${esc(playerTag)}</strong>, vamos retirar um carregamento roubado pela doca da <strong>${esc(m.targetHostname)}</strong> agora mesmo. Invada ${ipLink}, entre em <strong>Câmeras Ao Vivo (CFTV)</strong> e <strong>desative a câmera</strong> <span class="msn-hl-file">${esc(m.camCode)} · ${esc(m.camRoom)}</span> (ou apague todo o circuito CFTV) para que nosso furgão passe invisível. Você recebe ${moneySpan} assim que o sinal cair!`;
        }
        if (m.cctvObjective === 'wipe_recording') {
          return `<strong>${esc(playerTag)}</strong>, um dos nossos operadores entrou ontem de madrugada na <strong>${esc(m.targetHostname)}</strong> sem máscara e a câmera do teto gravou o rosto dele inteiro! Antes que a segurança entregue o backup para o FBI, invada ${ipLink}, abra <strong>Câmeras Ao Vivo (CFTV) → Gravações DVR</strong> e <strong>apague permanentemente o arquivo</strong> <span class="msn-hl-file">${esc(m.dvrFileName)}</span>. Depositamos ${moneySpan} assim que essa prova for destruída!`;
        }
        if (m.cctvObjective === 'wipe_all_dvr') {
          return `<strong>${esc(playerTag)}</strong>, fizemos um assalto silencioso no subsolo da <strong>${esc(m.targetHostname)}</strong>, mas todas as câmeras registraram a ação no disco do NVR deles. Invada ${ipLink}, entre em <strong>Câmeras Ao Vivo (CFTV) → Gravações DVR</strong> e clique em <span class="msn-hl-file">Apagar Todas (Formatar DVR)</span> para queimar 100% das gravações da empresa! Recompensa: ${moneySpan}.`;
        }
        return `<strong>${esc(playerTag)}</strong>, invada o servidor da <strong>${esc(m.targetHostname)}</strong> em ${ipLink}, entre em <strong>Câmeras Ao Vivo (CFTV)</strong> na câmera <span class="msn-hl-file">${esc(m.camCode)} · ${esc(m.camRoom)}</span> e conclua a ação solicitada para receber ${moneySpan}.`;
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
        const obj = m.cctvObjective || 'disable_all';
        let doneByEngine = false;
        let pendingMsg = '';
        let okMsg = '';

        if (window.cctvEngine) {
          if (obj === 'disable_all') {
            doneByEngine = window.cctvEngine.areAllCamerasDisabled(m.targetIp, m.targetHostname);
            pendingMsg = `As câmeras de ${m.targetIp} ainda estão LIGADAS! Invada ${m.targetIp}, abra "Câmeras Ao Vivo (CFTV)" e clique em "Desativar Todas as Câmeras (Ajudar Roubo)"!`;
            okMsg = `Circuito CFTV de ${m.targetHostname} (${m.targetIp}) 100% desativado — equipe liberada para o roubo!`;
          } else if (obj === 'disable_cam') {
            doneByEngine = window.cctvEngine.isCameraDisabled(m.targetIp, m.camCode) ||
              window.cctvEngine.areAllCamerasDisabled(m.targetIp, m.targetHostname);
            pendingMsg = `A câmera ${m.camCode} (${m.camRoom}) ainda está transmitindo em ${m.targetIp}! Abra "Câmeras Ao Vivo (CFTV)" e desative ${m.camCode} (ou desative todas).`;
            okMsg = `Sinal de ${m.camCode} (${m.camRoom}) cortado com sucesso em ${m.targetIp}!`;
          } else if (obj === 'wipe_recording') {
            doneByEngine = window.cctvEngine.isRecordingDeleted(m.targetIp, m.dvrFileName) ||
              window.cctvEngine.areAllRecordingsDeleted(m.targetIp, m.targetHostname);
            pendingMsg = `A gravação "${m.dvrFileName}" AINDA está salva no DVR de ${m.targetIp}! Abra "Câmeras Ao Vivo (CFTV) -> Gravações DVR" e clique na lixeira para apagá-la!`;
            okMsg = `Confirmado: a gravação ${m.dvrFileName} foi permanentemente destruída do DVR de ${m.targetIp}!`;
          } else if (obj === 'wipe_all_dvr') {
            doneByEngine = window.cctvEngine.areAllRecordingsDeleted(m.targetIp, m.targetHostname);
            pendingMsg = `Ainda existem gravações salvas no DVR de ${m.targetIp}! Abra "Câmeras Ao Vivo (CFTV) -> Gravações DVR" e clique em "Apagar Todas (Formatar DVR)"!`;
            okMsg = `HD do DVR de ${m.targetHostname} (${m.targetIp}) 100% formatado e sem provas!`;
          } else if (obj === 'loop') {
            doneByEngine = window.cctvEngine.isCameraLooped(m.targetIp, m.camCode);
            pendingMsg = `Invada ${m.targetIp}, abra ${m.camCode} em "Câmeras Ao Vivo (CFTV)" e injete o Loop Falso!`;
            okMsg = `Loop fantasma ativo em ${m.camCode} (${m.targetIp})!`;
          } else {
            doneByEngine = window.cctvEngine.hasCapturedCamera(m.targetIp, m.camCode);
            pendingMsg = `Invada ${m.targetIp}, abra ${m.camCode} em "Câmeras Ao Vivo (CFTV)" e salve a gravação!`;
            okMsg = `Vídeo ao vivo capturado de ${m.camCode} (${m.targetIp})!`;
          }
        }

        const verified = !!m.cctvVerified || doneByEngine;
        if (!verified) {
          return { verified: false, hacked, reason: pendingMsg };
        }
        return { verified: true, hacked: true, detail: okMsg };
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

    notifyCctvAction(ip, targetKey, actionKind) {
      this.ensureLoaded();
      const m = this.state.activeMission;
      if (!m || m.type !== 'cctv_hack' || m.targetIp !== ip) return;

      const check = this.verifyActiveMissionStatus();
      if (check.verified) {
        m.cctvVerified = true;
        m.progressDone = true;
        this.save();
        if (typeof window.showToast === 'function') {
          window.showToast(`✓ Objetivo CFTV concluído! Vá em Missões → Missão Atual para receber $${m.rewardCash}!`);
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

      const isCriminalMission = m.rewardCash >= 150 && ['cctv_hack', 'steal_file', 'delete_file', 'drain_host', 'bank_hack', 'ddos_attack'].includes(m.type);
      if (isCriminalMission && window.nineSystemsEngine && typeof window.nineSystemsEngine.addDirtyMoney === 'function') {
        window.nineSystemsEngine.addDirtyMoney(m.rewardCash, `Contrato Darknet (${m.hirer})`);
      } else if (window.currentWallet) {
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
            ? (active.dvrFileName ? 'Gravação no DVR' : 'Alvo no CFTV')
            : (active.type === 'install_virus' ? 'Vírus Exigido' : (active.fileName ? 'Arquivo Alvo' : 'Operação'));
          const objRowVal = active.type === 'cctv_hack'
            ? (active.dvrFileName
                ? `<span class="msn-hl-file">${esc(active.dvrFileName)}</span> <span style="color:var(--hc-text-3);">(Apagar do DVR)</span>`
                : `<span class="msn-hl-file">${esc(active.camCode)} · ${esc(active.camRoom)}</span> <span style="color:var(--hc-text-3);">(${
                    active.cctvObjective === 'disable_all' ? 'Desativar Todas' :
                    active.cctvObjective === 'disable_cam' ? 'Desativar Câmera' :
                    active.cctvObjective === 'wipe_all_dvr' ? 'Formatar DVR' :
                    active.cctvObjective === 'loop' ? 'Injetar Loop' : 'Gravar Vídeo'
                  })</span>`)
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
            ? (m.cctvObjective === 'disable_all' ? 'Desativar Câmeras (Roubo)' :
               m.cctvObjective === 'disable_cam' ? `Desativar ${m.camCode} (Fuga)` :
               m.cctvObjective === 'wipe_recording' ? `Apagar ${m.dvrFileName}` :
               m.cctvObjective === 'wipe_all_dvr' ? 'Formatar Gravações DVR' : m.badge)
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
