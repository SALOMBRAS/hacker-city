/**
 * Hacker City // Motor Oficial das 8 Travas de Desenvolvimento & Causa-e-Efeito
 *
 * 1. Trava da Universidade MIT-HC: Cronômetro real de aula (0m/10m/45m/2h/6h) + Prova de 3 questões
 *    com Reprovação (trava de 30m reais + Taxa de 2ª Chamada de 25% em Dinheiro Limpo).
 * 2. Trava Física de Hardware: Proibido pular geração (Tier 1->2->3->4->5) + Fonte PSU (180W / 400W / 750W)
 *    com Queda de Disjuntor (PSU Brownout: derruba processos e trava CPU em -50%) + Tempo de Bancada.
 * 3. Trava de Gargalo CPU <-> Software: Celeron <= v2.5, P4 <= v4.5, Quad <= v6.5, Xeon <= v8.5, Quantum <= v10.0
 *    (acima disso opera limitado + aquece +15°C na CPU!).
 * 4. Trava de Desbloqueio em 4 Estágios (Recruta -> Infiltrador -> Operador Sombra -> Magnata) c/ Card Classificado.
 * 5. Trava de Saltos Mínimos no Mapa-Múndi (Tier 3 >= 2, Tier 4 >= 4, Tier 5 >= 6 saltos + 3 continentes + CERT-401):
 *    tentar em Rota Direta gera [403 DIRECT IP BLOCKED], +2 Heat e Blacklist de 30 min reais no alvo!
 * 6. Trava Real de Atraso às 12:00 (1/3 Nome Sujo +10%, 2/3 Racionamento -50% Net / -35% CPU, 3/3 Corte Externo + Pausa
 *    com Micro-Reparo Municipal Anti-Softlock de +$180 Limpos + Bônus Bom Pagador -10%).
 * 7. Trava da Botnet: Teto de servidores ativos no Collector.vcol (v1.0=3 .. v10.0=25) + Varredura Antivírus NPC de 4h.
 * 8. Trava Econômica Anti-Boost: Quarentena de 24h em Clã, Teto P2P Recruta ($2.500/dia) e Teto/Cooldown na Bolsa TIX.
 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function runAuth(fn) {
    if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
      return window.integrityGuard.runAuthorized(fn);
    }
    return fn();
  }

  function fmtMoney(n) {
    return '$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const PSU_CATALOG = {
    psu_180w: { id: 'psu_180w', name: 'Fonte Genérica 180W (Sucata)', maxWatts: 180, priceClean: 0 },
    psu_400w: { id: 'psu_400w', name: 'Fonte 400W 80+ Bronze Estabilizada', maxWatts: 400, priceClean: 1800 },
    psu_750w: { id: 'psu_750w', name: 'Fonte 750W 80+ Gold Modular', maxWatts: 750, priceClean: 6500 }
  };

  const CPU_MAX_SOFT_VER = {
    celeron_800: 2.5,
    pentium_4: 4.5,
    core_2_quad: 6.5,
    xeon_server: 8.5,
    quantum_core: 10.0
  };

  // Configuração oficial dos 5 cursos com tempo real de aula, pré-requisito de REP, custo Limpo e 3 questões!
  const UNIVERSITY_GATES = {
    1: {
      id: 1,
      costClean: 0,
      reqRep: 0,
      studyMs: 0, // Imediato para não travar o 1º minuto do Tutorial!
      questions: [
        {
          q: '1/3 · O que acontece se você esquecer seu IP gravado no /var/log/syslog de um alvo?',
          opts: ['Some sozinho em 5s', 'A vítima ou o FBI rastreiam seu IP real e contra-atacam!', 'Ganha bônus de dinheiro'],
          ans: 1
        },
        {
          q: '2/3 · Como funciona o relógio de despesas mensais do Esconderijo?',
          opts: ['1h real = 1 dia e 24h = 1 mês (fecha às 12:00 e pausa em 3/3 meses)', 'Nunca existem contas', 'Cobra a cada 3 segundos'],
          ans: 0
        },
        {
          q: '3/3 · Onde você renova seu endereço IP gratuitamente 1 vez por semana?',
          opts: ['No Fliperama', 'No Provedor Central ISP (71.4.5.1)', 'No chat público'],
          ans: 1
        }
      ]
    },
    2: {
      id: 2,
      costClean: 0,
      reqRep: 100,
      studyMs: 10 * 60 * 1000, // 10 min reais
      questions: [
        {
          q: '1/3 · Qual regra é obrigatória para quebrar a senha de um servidor?',
          opts: ['Ter só CPU cara', 'Seu Cracker.crc precisa ter versão >= Firewall E >= Hasher do alvo', 'Desligar o monitor'],
          ans: 1
        },
        {
          q: '2/3 · Qual a diferença entre Firewall.fwl e Cracker.crc na memória?',
          opts: ['Firewall roda contínuo na RAM; Cracker roda sob demanda do HD/SSD/NVMe', 'São iguais', 'Cracker não ocupa disco'],
          ans: 0
        },
        {
          q: '3/3 · Qual deve ser sempre o último passo antes de desconectar de um servidor invadido?',
          opts: ['Postar seu IP no fórum', 'Apagar seu IP do /var/log/syslog (ou aplicar Shred 7-Passos)', 'Reiniciar o navegador'],
          ans: 1
        }
      ]
    },
    3: {
      id: 3,
      costClean: 1500,
      reqRep: 250,
      studyMs: 45 * 60 * 1000, // 45 min reais
      questions: [
        {
          q: '1/3 · Como obter acesso ROOT por exploits sem precisar quebrar a senha?',
          opts: ['Rodar PortScan e combinar FTP_Exploit + SSH_Exploit >= Firewall do alvo', 'Olhar a página pública', 'Criar pasta vazia'],
          ans: 0
        },
        {
          q: '2/3 · O que acontece com o dinheiro roubado de servidores (>= $100) e bancos?',
          opts: ['Já entra 100% limpo', 'Entra como Dinheiro Sujo e precisa ser lavado nas Empresas (15 min reais)', 'Vira experiência'],
          ans: 1
        },
        {
          q: '3/3 · No portal hc://vazamentos, o que fazer antes de clicar em Usar Vazamento?',
          opts: ['Clicar de olhos fechados', 'Verificar a assinatura PGP para não cair em Isca da Safenet (+2 Heat)', 'Formatar o PC'],
          ans: 1
        }
      ]
    },
    4: {
      id: 4,
      costClean: 6000,
      reqRep: 600,
      studyMs: 2 * 60 * 60 * 1000, // 2 horas reais
      questions: [
        {
          q: '1/3 · Qual é o multiplicador do vírus v10.0 e o limite do Laboratório?',
          opts: ['50x infinito grátis', '3.00x no v10.0, custando $ 1.000 com trava de 1 vez a cada 24h reais', '1.0x sem custo'],
          ans: 1
        },
        {
          q: '2/3 · O que acontece se você instalar vírus num servidor sem Hider.hid compatível?',
          opts: ['Na varredura periódica de 4h o Antivírus NPC detecta e deleta seu vírus!', 'Ele dobra de versão', 'Nada acontece'],
          ans: 0
        },
        {
          q: '3/3 · O que limita de quantos servidores simultâneos você consegue colher lucro?',
          opts: ['A cor do tema', 'A versão ativa do seu Collector.vcol instalado na RAM', 'O nome do seu Clã'],
          ans: 1
        }
      ]
    },
    5: {
      id: 5,
      costClean: 18000,
      reqRep: 1500,
      studyMs: 6 * 60 * 60 * 1000, // 6 horas reais
      questions: [
        {
          q: '1/3 · O que acontece se você desviar um ataque de 15s para uma VPS sua?',
          opts: ['Só reinicia a VPS de graça', 'Salva seu PC e captura o IP do invasor, MAS você perde a VPS permanentemente!', 'Ganha outra VPS'],
          ans: 1
        },
        {
          q: '2/3 · Quantos saltos no Mapa-Múndi são exigidos para atacar Mainframes Tier 5 (ex: FBI)?',
          opts: ['0 saltos (Rota Direta)', 'Mínimo de 6 saltos em pelo menos 3 continentes + CERT-401', 'Apenas 1 salto'],
          ans: 1
        },
        {
          q: '3/3 · Qual diploma permite que seu Firewall.fwl mitigue ataques DDoS automaticamente?',
          opts: ['Nenhum', 'CERT-401 (Mestrado MIT-HC)', 'Apenas comprar mouse gamer'],
          ans: 1
        }
      ]
    }
  };

  class ProgressionLocksEngine {
    constructor() {
      this.userId = null;
      this.state = null;
      this._sweepTimer = null;
      this.mountGateModal();
      this.startBackgroundEnforcer();
    }

    storageKey(uidOverride = null) {
      const uid = uidOverride || (window.currentProfile && window.currentProfile.id) || 'guest';
      return `HC_PROG_LOCKS_V1_${uid}`;
    }

    normalizeState(raw) {
      const s = raw && typeof raw === 'object' ? { ...raw } : {};
      if (!s.psuId || !PSU_CATALOG[s.psuId]) s.psuId = 'psu_180w';
      if (typeof s.brownoutActive !== 'boolean') s.brownoutActive = false;
      if (typeof s.benchAssemblyUntil !== 'number') s.benchAssemblyUntil = 0;
      if (!s.benchPartLabel) s.benchPartLabel = '';

      // Universidade: matrícula em andamento, reprovação (30m) e taxa 2ª chamada
      if (!s.uniEnrollment || typeof s.uniEnrollment !== 'object') {
        s.uniEnrollment = null; // { certId, enrolledAt, readyAt, paidTuition: true }
      }
      if (!s.examLockUntil || typeof s.examLockUntil !== 'object') s.examLockUntil = {};
      if (!s.retakeFeeDue || typeof s.retakeFeeDue !== 'object') s.retakeFeeDue = {};

      // Blacklist de IPs por tentar atacar Tier 3-5 sem saltos mínimos (hostIp -> { blockedIp, until })
      if (!s.hostIpBlacklists || typeof s.hostIpBlacklists !== 'object') s.hostIpBlacklists = {};

      // Fidelidade das contas das 12:00 & Micro-Reparo Municipal
      if (typeof s.cleanBillingStreak !== 'number') s.cleanBillingStreak = 0;
      if (typeof s.lastMunicipalJobAt !== 'number') s.lastMunicipalJobAt = 0;

      // Varredura Antivírus NPC de 4h
      if (typeof s.lastNpcAvSweepAt !== 'number') s.lastNpcAvSweepAt = Date.now();

      // Travas Anti-Boost (Clã 24h, Recebimento P2P Recruta, Cooldown Queda TIX 20m)
      if (typeof s.clanJoinedAt !== 'number') s.clanJoinedAt = 0;
      if (!s.dailyP2pReceived || typeof s.dailyP2pReceived !== 'object') {
        s.dailyP2pReceived = { dayKey: new Date().toISOString().slice(0, 10), usd: 0 };
      }
      if (!s.stockSabotageCooldownBySym || typeof s.stockSabotageCooldownBySym !== 'object') {
        s.stockSabotageCooldownBySym = {};
      }
      return s;
    }

    ensureLoaded() {
      const uid = (window.currentProfile && window.currentProfile.id) || 'guest';
      if (this.userId === uid && this.state) return this.state;
      this.userId = uid;
      let parsed = null;
      try {
        const raw = localStorage.getItem(this.storageKey(uid));
        if (raw) parsed = JSON.parse(raw);
      } catch (e) {}
      this.state = this.normalizeState(parsed);
      this.save(true);
      return this.state;
    }

    save(silentCloud = false) {
      if (!this.state) return;
      try {
        localStorage.setItem(this.storageKey(this.userId), JSON.stringify(this.state));
      } catch (e) {}
      if (!silentCloud && window.onlineEngine && typeof window.onlineEngine.scheduleSave === 'function') {
        window.onlineEngine.scheduleSave(false);
      }
    }

    getSnapshotState() {
      this.ensureLoaded();
      return JSON.parse(JSON.stringify(this.state));
    }

    applySnapshotState(snap) {
      if (!snap || typeof snap !== 'object') return;
      this.userId = (window.currentProfile && window.currentProfile.id) || 'guest';
      this.state = this.normalizeState(snap);
      this.save(true);
    }

    getCleanBalance() {
      return window.currentWallet ? Math.max(0, +(Number(window.currentWallet.balance || 0)).toFixed(2)) : 0;
    }

    // =========================================================================
    // TRAVA #1: UNIVERSIDADE MIT-HC (TEMPO DE ESTUDO + 3 QUESTÕES + REPROVAÇÃO 30M)
    // =========================================================================
    getCourseGateMeta(certId) {
      return UNIVERSITY_GATES[Number(certId)] || UNIVERSITY_GATES[1];
    }

    enrollInCourse(certId) {
      this.ensureLoaded();
      const id = Number(certId);
      const gate = this.getCourseGateMeta(id);
      if (window.universityEngine && window.universityEngine.hasCert(id)) {
        return { success: false, message: 'Você já possui este diploma!' };
      }
      if (id > 1 && window.universityEngine && !window.universityEngine.hasCert(id - 1)) {
        const msg = `🔒 Trava Sequencial: conclua primeiro o Certificado #${id - 1}!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'PREV_CERT_REQUIRED', message: msg };
      }
      const myRep = (window.currentProfile && window.currentProfile.reputation) || 0;
      if (myRep < gate.reqRep) {
        const msg = `🔒 Reputação insuficiente para matrícula! Exige ${gate.reqRep} REP (você tem ${myRep} REP).`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'INSUFFICIENT_REP', message: msg };
      }
      if (this.state.uniEnrollment && this.state.uniEnrollment.certId !== id) {
        const msg = `Você já está matriculado no Curso #${this.state.uniEnrollment.certId}! Conclua um curso por vez.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'ONE_COURSE_AT_A_TIME', message: msg };
      }
      if (this.state.uniEnrollment && this.state.uniEnrollment.certId === id) {
        return { success: true, alreadyEnrolled: true, enrollment: this.state.uniEnrollment };
      }

      if (gate.costClean > 0) {
        const clean = this.getCleanBalance();
        if (clean < gate.costClean) {
          const msg = `Matrícula exige ${fmtMoney(gate.costClean)} em DINHEIRO LIMPO (você tem ${fmtMoney(clean)}).`;
          if (typeof window.showToast === 'function') window.showToast(msg);
          return { success: false, code: 'CLEAN_TUITION_REQUIRED', message: msg };
        }
        runAuth(() => {
          window.currentWallet.balance = Math.max(0, +(clean - gate.costClean).toFixed(2));
        });
      }

      const now = Date.now();
      this.state.uniEnrollment = {
        certId: id,
        enrolledAt: now,
        readyAt: now + gate.studyMs,
        paidTuition: true
      };
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.universityEngine) window.universityEngine.renderUI();
      const mins = Math.round(gate.studyMs / 60000);
      const msg = gate.studyMs > 0
        ? `🎓 Matrícula confirmada! Estude os módulos — a Banca libera a prova em ${mins} min da vida real.`
        : '🎓 Matrícula inicial confirmada! Prova liberada imediatamente.';
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, enrollment: this.state.uniEnrollment, message: msg };
    }

    submitThreeQuestionExam(certId, answers) {
      this.ensureLoaded();
      const id = Number(certId);
      const gate = this.getCourseGateMeta(id);

      // Se curso > 1 e ainda não matriculado, exige matrícula primeiro!
      if (id > 1 && (!this.state.uniEnrollment || this.state.uniEnrollment.certId !== id)) {
        return { success: false, code: 'NOT_ENROLLED', message: 'Matricule-se primeiro neste curso para iniciar o cronômetro de aula!' };
      }
      if (this.state.uniEnrollment && this.state.uniEnrollment.certId === id && Date.now() < this.state.uniEnrollment.readyAt) {
        const remMin = Math.ceil((this.state.uniEnrollment.readyAt - Date.now()) / 60000);
        const msg = `⏳ Aula em andamento! Faltam ${remMin} min da vida real de carga horária antes da prova liberar.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'STUDY_TIMER_ACTIVE', remainingMs: this.state.uniEnrollment.readyAt - Date.now(), message: msg };
      }

      const lockUntil = Number(this.state.examLockUntil[id] || 0);
      if (Date.now() < lockUntil) {
        const remMin = Math.ceil((lockUntil - Date.now()) / 60000);
        const msg = `❌ Banca bloqueada após reprovação! Aguarde ${remMin} min reais para a 2ª chamada.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'EXAM_LOCKED_30M', message: msg };
      }

      const retakeFee = Number(this.state.retakeFeeDue[id] || 0);
      if (retakeFee > 0) {
        const clean = this.getCleanBalance();
        if (clean < retakeFee) {
          const msg = `Taxa de 2ª chamada pendente: ${fmtMoney(retakeFee)} em Dinheiro Limpo!`;
          if (typeof window.showToast === 'function') window.showToast(msg);
          return { success: false, code: 'RETAKE_FEE_REQUIRED', retakeFee, message: msg };
        }
        runAuth(() => {
          window.currentWallet.balance = Math.max(0, +(clean - retakeFee).toFixed(2));
        });
        delete this.state.retakeFeeDue[id];
      }

      const ansArr = Array.isArray(answers) ? answers.map(Number) : [];
      const allCorrect = gate.questions.every((q, idx) => ansArr[idx] === q.ans);

      if (!allCorrect) {
        this.state.examLockUntil[id] = Date.now() + 30 * 60 * 1000; // 30 min reais!
        this.state.retakeFeeDue[id] = Math.max(100, Math.round(gate.costClean * 0.25));
        this.save();
        if (window.universityEngine) window.universityEngine.renderUI();
        const failMsg = `❌ REPROVADO PELA BANCA MIT-HC! Nova prova bloqueada por 30 minutos reais + Taxa de 2ª Chamada de ${fmtMoney(this.state.retakeFeeDue[id])} Limpos!`;
        if (typeof window.showToast === 'function') window.showToast(failMsg);
        return {
          success: false,
          code: 'EXAM_FAILED_LOCKED',
          lockedUntil: this.state.examLockUntil[id],
          retakeFee: this.state.retakeFeeDue[id],
          message: failMsg
        };
      }

      // Aprovado 3/3! Limpa matrícula ativa e conclui diploma sem cobrar custo duplicado!
      this.state.uniEnrollment = null;
      delete this.state.examLockUntil[id];
      delete this.state.retakeFeeDue[id];
      this.save();
      if (window.universityEngine) {
        return window.universityEngine.completeCourse(id, { skipExam: true, tuitionAlreadyPaid: true });
      }
      return { success: true };
    }

    // =========================================================================
    // TRAVA #2 & #3: ESCADA HARDWARE, FONTE PSU (WATTS/BROWNOUT) & GARGALO CPU
    // =========================================================================
    getCurrentPsu() {
      this.ensureLoaded();
      return PSU_CATALOG[this.state.psuId] || PSU_CATALOG.psu_180w;
    }

    buyPsuUpgrade(psuId) {
      this.ensureLoaded();
      const psu = PSU_CATALOG[psuId];
      if (!psu) return { success: false };
      const cur = this.getCurrentPsu();
      if (psu.maxWatts <= cur.maxWatts) {
        return { success: false, message: 'Você já possui uma Fonte igual ou superior instalada!' };
      }
      const cnpjMult = (window.nineSystemsEngine && typeof window.nineSystemsEngine.getCompanyCnpjPerks === 'function')
        ? Number(window.nineSystemsEngine.getCompanyCnpjPerks().hwDiscountMult || 1.0)
        : 1.0;
      const effCost = Math.round(psu.priceClean * cnpjMult);
      const clean = this.getCleanBalance();
      if (clean < effCost) {
        if (window.nineSystemsEngine && window.nineSystemsEngine.getDirtyBalance() > 0) {
          window.nineSystemsEngine.openDirtyMoneyBridgeModal(psu.name, effCost);
        }
        const msg = `Comprar ${psu.name} exige ${fmtMoney(effCost)} em Dinheiro Limpo!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'CLEAN_MONEY_REQUIRED', required: effCost, message: msg };
      }
      runAuth(() => {
        window.currentWallet.balance = Math.max(0, +(clean - effCost).toFixed(2));
      });
      this.state.psuId = psu.id;
      this.state.brownoutActive = false;
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (typeof window.updateHardwareDisplay === 'function') window.updateHardwareDisplay();
      const msg = `⚡ ${psu.name} (${psu.maxWatts}W) instalada (-${fmtMoney(effCost)} Limpos${cnpjMult < 1 ? ' · -10% CNPJ!' : ''})! Subtensão eliminada.`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, psu, paidClean: effCost, message: msg };
    }

    validateHardwareStepLadder(category, itemId, targetMachineId = 'pc_main') {
      this.ensureLoaded();
      if (!window.hardwareEngine || category === 'network') return { ok: true };
      const list = window.hardwareEngine.catalog[category] || [];
      const targetIdx = list.findIndex((x) => x.id === itemId);
      if (targetIdx <= 0) return { ok: true };

      let curIdx = 0;
      if (!targetMachineId || targetMachineId === 'pc_main') {
        const curId = window.hardwareEngine.current[category];
        curIdx = Math.max(0, list.findIndex((x) => x.id === curId));
      } else if (window.lanServersEngine) {
        const srv = window.lanServersEngine.servers.find((s) => s.id === targetMachineId);
        const curPartId = srv && srv.parts ? srv.parts[category] : null;
        curIdx = curPartId ? Math.max(0, list.findIndex((x) => x.id === curPartId)) : 0;
      }

      if (targetIdx > curIdx + 1) {
        const reqPrev = list[targetIdx - 1];
        const msg = `🔒 Evolua uma peça por vez! Para instalar "${list[targetIdx].name}", instale primeiro "${reqPrev.name}"!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { ok: false, code: 'CANNOT_SKIP_HARDWARE_TIER', requiredPartId: reqPrev.id, message: msg };
      }

      // Peças Tier 4 exigem CERT-301; Tier 5 exigem CERT-401!
      if (targetIdx >= 3 && window.universityEngine && !window.universityEngine.hasCert(4)) {
        const msg = `🔒 Esta peça avançada exige concluir primeiro o Certificado CERT-301 na Universidade!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { ok: false, code: 'CERT_301_REQUIRED_FOR_HW', message: msg };
      }
      if (targetIdx >= 4 && window.universityEngine && !window.universityEngine.hasCert(5)) {
        const msg = `🔒 Esta peça máxima exige concluir o Mestrado CERT-401 na Universidade!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { ok: false, code: 'CERT_401_REQUIRED_FOR_HW', message: msg };
      }

      const benchMins = [0, 2, 4, 8, 12][targetIdx] || 2;
      return { ok: true, tierIndex: targetIdx, benchMs: benchMins * 60 * 1000, partName: list[targetIdx].name };
    }

    recordHardwareBenchAssembly(partName, benchMs) {
      this.ensureLoaded();
      this.state.benchAssemblyUntil = Date.now() + Number(benchMs || 120000);
      this.state.benchPartLabel = partName || 'Componente';
      this.checkPsuOverloadAndTriggerBrownout(false);
      this.save();
    }

    getPrimaryPcTotalWatts() {
      if (!window.hardwareEngine) return 100;
      const fleet = window.hardwareEngine.getMachinesFleet();
      const pc = fleet.find((m) => m.isPrimaryPc);
      return pc ? Number(pc.watts || 100) : 100;
    }

    checkPsuOverloadAndTriggerBrownout(abortRunningTasks = true) {
      this.ensureLoaded();
      const watts = this.getPrimaryPcTotalWatts();
      const psu = this.getCurrentPsu();
      if (watts <= psu.maxWatts) {
        if (this.state.brownoutActive) {
          this.state.brownoutActive = false;
          this.save(true);
        }
        return { overloaded: false, watts, maxWatts: psu.maxWatts };
      }

      const running = (window.taskManager && typeof window.taskManager.getRunningAll === 'function')
        ? window.taskManager.getRunningAll()
        : [];
      this.state.brownoutActive = true;

      if (abortRunningTasks && running.length >= 2 && window.taskManager) {
        // Derruba os processos extras e desconecta SSH!
        running.slice(1).forEach((proc) => {
          if (typeof window.taskManager.cancelTask === 'function') {
            window.taskManager.cancelTask(proc.pid);
          }
        });
        if (window.internetEngine && window.internetEngine.activeSshIp) {
          window.internetEngine.activeSshIp = null;
        }
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('PSU-BROWNOUT', `⚡ QUEDA DE DISJUNTOR! Consumo (${watts}W) superou sua ${psu.name} (${psu.maxWatts}W) — processos derrubados e CPU em -50%!`, 'danger');
        }
        if (typeof window.showToast === 'function') {
          window.showToast(`⚡ QUEDA DE DISJUNTOR (${watts}W > ${psu.maxWatts}W)! Compre uma Fonte mais forte em Peças do PC!`);
        }
      }
      this.save(true);
      return { overloaded: true, brownoutActive: true, watts, maxWatts: psu.maxWatts };
    }

    getCpuMaxSoftwareVersion() {
      if (!window.hardwareEngine) return 10.0;
      window.hardwareEngine.ensureForProfile();
      const cpuId = window.hardwareEngine.current && window.hardwareEngine.current.cpu;
      return CPU_MAX_SOFT_VER[cpuId] || 2.5;
    }

    hasAnyBottleneckedSoftware() {
      if (!window.softwareEngine || !window.softwareEngine.state) return false;
      const capInt = Math.round(this.getCpuMaxSoftwareVersion() * 10);
      const inv = window.softwareEngine.state.inventory || {};
      return Object.values(inv).some((it) => it && it.owned && Number(it.versionInt || 0) > capInt);
    }

    // =========================================================================
    // TRAVA #4: OS 4 ESTÁGIOS DE CARREIRA DO OPERADOR
    // =========================================================================
    getOperatorStageInfo() {
      const rep = (window.currentProfile && window.currentProfile.reputation) || 0;
      const has201 = window.universityEngine ? window.universityEngine.hasCert(3) : false;
      const has301 = window.universityEngine ? window.universityEngine.hasCert(4) : false;
      const has401 = window.universityEngine ? window.universityEngine.hasCert(5) : false;

      if (has401 && rep >= 1500) {
        return { stage: 4, title: 'Estágio 4 · Magnata / Elite', nextReq: 'Acesso Total Desbloqueado' };
      }
      if (has301 && rep >= 500) {
        return { stage: 3, title: 'Estágio 3 · Operador Sombra', nextReq: 'Próximo (Magnata): CERT-401 + 1.500 REP' };
      }
      if (has201 || rep >= 250) {
        return { stage: 2, title: 'Estágio 2 · Infiltrador', nextReq: 'Próximo (Sombra): CERT-301 + 500 REP' };
      }
      return { stage: 1, title: 'Estágio 1 · Recruta', nextReq: 'Próximo (Infiltrador): CERT-201 ou 250 REP' };
    }

    showStageGateModal(featureLabel, reqStage, reqDesc) {
      const modal = document.getElementById('hcStageGateModal');
      if (!modal) return;
      const cur = this.getOperatorStageInfo();
      modal.style.display = 'flex';
      modal.innerHTML = `
        <div class="hc-jail-card" style="border-color:#f0a83a;">
          <span class="hc-badge warn" style="align-self:flex-start;">🔒 NÍVEL DE CARREIRA ${reqStage} NECESSÁRIO</span>
          <h3 style="font-size:18px;color:#fff;margin:0;">${esc(featureLabel)} ainda está bloqueado</h3>
          <p style="font-size:13px;color:#d6e2f0;margin:0;">Seu nível atual é <strong>${esc(cur.title)}</strong>. Faça o passo abaixo para liberar:</p>
          <div style="padding:10px 12px;background:#16120b;border:1px solid #4d3816;border-radius:8px;font-size:12.5px;color:#fcd34d;">
            <strong>O que falta fazer:</strong> ${esc(reqDesc)}
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;">
            <button type="button" class="hc-btn ghost sm" onclick="document.getElementById('hcStageGateModal').style.display='none'">Fechar</button>
            <button type="button" class="hc-btn primary sm" onclick="document.getElementById('hcStageGateModal').style.display='none'; navTo('winUniversity');">🎓 Abrir Universidade →</button>
          </div>
        </div>
      `;
    }

    // =========================================================================
    // TRAVA #5: SALTOS MÍNIMOS NO MAPA-MÚNDI + BLACKLIST DE 30 MIN EM ALVOS TIER 3-5
    // =========================================================================
    getActiveBounceInfo() {
      const nodes = (window.worldMapEngine && Array.isArray(window.worldMapEngine.bounceRoute))
        ? window.worldMapEngine.bounceRoute
        : [];
      const continents = new Set();
      if (window.worldMapEngine && Array.isArray(window.worldMapEngine.cities)) {
        nodes.forEach((cid) => {
          const c = window.worldMapEngine.cities.find((x) => x.id === cid);
          if (c && c.region) continents.add(c.region);
        });
      }
      const cnpjFreeHops = (window.nineSystemsEngine && typeof window.nineSystemsEngine.getCompanyCnpjPerks === 'function')
        ? Number(window.nineSystemsEngine.getCompanyCnpjPerks().bonusFreeBounceHops || 0)
        : 0;
      const totalHops = nodes.length + cnpjFreeHops;
      return { hops: totalHops, continentsCount: Math.max(continents.size, Math.min(3, Math.floor(totalHops / 2))) };
    }

    validateTargetBounceGate(host) {
      this.ensureLoaded();
      if (!host || host.kind === 'self' || host.isTutorial) return { ok: true };
      const myIp = window.networkIdentity ? window.networkIdentity.getPublicIp() : '0.0.0.0';

      // 1) Checa se o IP atual do jogador está na Blacklist de 30m deste servidor!
      const bl = this.state.hostIpBlacklists[host.ip];
      if (bl && bl.blockedIp === myIp && Date.now() < bl.until) {
        const remMin = Math.ceil((bl.until - Date.now()) / 60000);
        const msg = `🚨 Seu IP está bloqueado em ${host.hostname} (${host.ip}) por mais ${remMin} min! Troque seu IP no Provedor (71.4.5.1) ou espere.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { ok: false, code: 'HOST_IP_BLACKLISTED_30M', remainingMs: bl.until - Date.now(), message: msg };
      }

      const isTier5Federal = host.ip === '161.89.1.1' || host.ip === '109.64.211.37' || host.ip === '77.3.13.99' || Number(host.tier || 1) >= 5;
      const effTier = isTier5Federal ? 5 : Number(host.tier || 1);
      if (effTier <= 2) return { ok: true };

      const reqHops = effTier === 3 ? 2 : (effTier === 4 ? 4 : 6);
      const bounce = this.getActiveBounceInfo();
      const missingCert401 = effTier >= 5 && window.universityEngine && !window.universityEngine.hasCert(5);

      if (bounce.hops < reqHops || (effTier >= 5 && bounce.continentsCount < 3) || missingCert401) {
        // CONSEQUÊNCIA REAL: +2 Heat instantâneo + Blacklist de 30 minutos reais contra o IP atual!
        this.state.hostIpBlacklists[host.ip] = {
          blockedIp: myIp,
          until: Date.now() + 30 * 60 * 1000
        };
        runAuth(() => {
          if (window.currentProfile) {
            window.currentProfile.heat_level = Math.min(5, Number(window.currentProfile.heat_level || 1) + 2);
          }
        });
        this.save();
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
        const reasonExtra = missingCert401 ? ' + Diploma CERT-401' : '';
        const msg = `🚨 Precisa de mais cidades na Rota! Este servidor (Nível ${effTier}) exige pelo menos ${reqHops} saltos no Mapa-Múndi${reasonExtra} (você usou ${bounce.hops})! Seu IP foi bloqueado nele por 30 min e sua Procura subiu +2!`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { ok: false, code: 'INSUFFICIENT_BOUNCE_HOPS', requiredHops: reqHops, currentHops: bounce.hops, message: msg };
      }
      return { ok: true };
    }

    // =========================================================================
    // TRAVA #6: ESCALA DE INADIMPLÊNCIA ÀS 12:00 (1/3, 2/3, 3/3) + MICRO-REPARO MUNICIPAL
    // =========================================================================
    getNoonDelinquencyEffects() {
      const maxMonths = (window.quitineteEngine && typeof window.quitineteEngine.getMaxAccumulatedMonths === 'function')
        ? window.quitineteEngine.getMaxAccumulatedMonths()
        : ((window.quitineteEngine && typeof window.quitineteEngine.getMaxMonthsDue === 'function')
            ? window.quitineteEngine.getMaxMonthsDue()
            : 0);
      if (maxMonths >= 3) {
        return {
          monthsDue: 3,
          commercialBlocked: true,
          netMult: 0.15,
          cpuMult: 0.50,
          externalNetSuspended: true,
          lateFineMult: 1.15
        };
      }
      if (maxMonths === 2) {
        return {
          monthsDue: 2,
          commercialBlocked: true,
          netMult: 0.50,
          cpuMult: 0.65,
          externalNetSuspended: false,
          lateFineMult: 1.10
        };
      }
      if (maxMonths === 1) {
        return {
          monthsDue: 1,
          commercialBlocked: false,
          netMult: 1.0,
          cpuMult: 1.0,
          externalNetSuspended: false,
          lateFineMult: 1.0
        };
      }
      return {
        monthsDue: 0,
        commercialBlocked: false,
        netMult: 1.0,
        cpuMult: 1.0,
        externalNetSuspended: false,
        lateFineMult: this.state && this.state.cleanBillingStreak >= 5 ? 0.90 : 1.0
      };
    }

    executeMunicipalEmergencyJob() {
      this.ensureLoaded();
      const now = Date.now();
      if (now - this.state.lastMunicipalJobAt < 15000) {
        const msg = 'Aguarde 15s para pegar outro lote de reparo municipal.';
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, message: msg };
      }
      this.state.lastMunicipalJobAt = now;
      const payClean = 180;
      runAuth(() => {
        if (window.currentWallet) {
          window.currentWallet.balance = +(Number(window.currentWallet.balance || 0) + payClean).toFixed(2);
        }
      });
      this.save();
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (window.quitineteEngine && window.currentWallet) {
        window.quitineteEngine.renderUI('quitineteAppBody', window.currentWallet.balance);
      }
      const msg = `🛠️ Micro-Reparo Municipal concluído! +${fmtMoney(payClean)} Limpos creditados para ajudar a religar suas contas.`;
      if (typeof window.showToast === 'function') window.showToast(msg);
      return { success: true, payClean, message: msg };
    }

    // =========================================================================
    // TRAVA #7: TETO DO COLLECTOR.VCOL + VARREDURA ANTIVÍRUS NPC DE 4H REAIS
    // =========================================================================
    getCollectorMaxSupportedHosts() {
      if (!window.softwareEngine) return 3;
      window.softwareEngine.ensureLoaded();
      const item = window.softwareEngine.state && window.softwareEngine.state.inventory
        ? window.softwareEngine.state.inventory.collector
        : null;
      const rawVer = item && item.owned ? (item.runningVerInt || item.versionInt || 10) / 10 : 1.0;
      const effVer = Math.min(rawVer, this.getCpuMaxSoftwareVersion());
      return Math.min(25, Math.max(3, Math.floor(effVer * 2.5)));
    }

    runNpcAntivirusSweep(forceNow = false) {
      this.ensureLoaded();
      const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
      if (!forceNow && Date.now() - this.state.lastNpcAvSweepAt < FOUR_HOURS_MS) {
        return { swept: false, removedCount: 0 };
      }
      this.state.lastNpcAvSweepAt = Date.now();

      if (!window.softwareEngine || !window.softwareEngine.state) {
        this.save(true);
        return { swept: true, removedCount: 0 };
      }
      const list = window.softwareEngine.state.remoteInfections || [];
      const kept = [];
      const purged = [];

      list.forEach((inf) => {
        const host = window.internetEngine ? window.internetEngine.resolveHost(inf.targetIp) : null;
        const targetAv = host ? Number(host.antivirusVer || 1.0) : 1.0;
        const hiddenVer = Number(inf.hiddenWithVer || 0);
        if (hiddenVer < targetAv) {
          purged.push({ ip: inf.targetIp, filename: inf.filename || inf.virusKey, targetAv });
        } else {
          kept.push(inf);
        }
      });

      if (purged.length > 0) {
        window.softwareEngine.state.remoteInfections = kept;
        window.softwareEngine.save();
        if (window.mailEngine && Array.isArray(window.mailEngine.inbox)) {
          window.mailEngine.inbox.unshift({
            id: 'av_purge_' + Date.now(),
            from: 'Monitor Botnet // Collector',
            subject: `⚠️ ${purged.length} vírus deletado(s) na varredura de 4h!`,
            body: `Os sysadmins rodaram Antivirus.av e expurgaram seus vírus sem Hider compatível em: ${purged.map((p) => `${p.ip} (AV v${p.targetAv.toFixed(1)})`).join(', ')}. Use sempre Hider.hid >= Antivírus do alvo!`,
            time: new Date().toLocaleTimeString('pt-BR'),
            unread: true
          });
        }
      }
      this.save(true);
      return { swept: true, removedCount: purged.length, purged };
    }

    // =========================================================================
    // TRAVA #8: ANTI-BOOST EM CLÃS, P2P BANCÁRIO E BOLSA CYBERSTOCK (TIX)
    // =========================================================================
    validateBankP2pReceive(amountUsd) {
      this.ensureLoaded();
      const rep = (window.currentProfile && window.currentProfile.reputation) || 0;
      if (rep >= 500) return { ok: true };
      const today = new Date().toISOString().slice(0, 10);
      if (this.state.dailyP2pReceived.dayKey !== today) {
        this.state.dailyP2pReceived = { dayKey: today, usd: 0 };
      }
      if (this.state.dailyP2pReceived.usd + amountUsd > 2500) {
        return {
          ok: false,
          code: 'RECRUIT_P2P_CAP_2500',
          message: '🛑 LIMITE COMPLIANCE P/ CONTA RECRUTA (< 500 REP): máximo de $ 2.500/dia em transferências de terceiros (Anti-Boost)!'
        };
      }
      this.state.dailyP2pReceived.usd += amountUsd;
      this.save(true);
      return { ok: true };
    }

    validateCyberStockCap(investUsd) {
      const has401 = window.universityEngine ? window.universityEngine.hasCert(5) : false;
      if (!has401 && Number(investUsd || 0) > 15000) {
        const msg = '🔒 Teto de Operação TIX: sem o Mestrado CERT-401, o máximo permitido por posição na Bolsa é $ 15.000 Limpos!';
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { ok: false, code: 'STOCK_CAP_15K_WITHOUT_CERT401', message: msg };
      }
      return { ok: true };
    }

    canTriggerSabotageStockDrop(symbol) {
      this.ensureLoaded();
      const last = Number(this.state.stockSabotageCooldownBySym[symbol] || 0);
      if (Date.now() - last < 20 * 60 * 1000) {
        return { ok: false, code: 'STOCK_DROP_COOLDOWN_20M', remainingMs: 20 * 60 * 1000 - (Date.now() - last) };
      }
      this.state.stockSabotageCooldownBySym[symbol] = Date.now();
      this.save(true);
      return { ok: true };
    }

    renderHardwarePsuAndBottleneckHtml() {
      this.ensureLoaded();
      const psu = this.getCurrentPsu();
      const watts = this.getPrimaryPcTotalWatts();
      const overloaded = watts > psu.maxWatts;
      const cpuCap = this.getCpuMaxSoftwareVersion();
      const bottlenecked = this.hasAnyBottleneckedSoftware();
      const stage = this.getOperatorStageInfo();
      const benchRemSec = Math.max(0, Math.ceil((this.state.benchAssemblyUntil - Date.now()) / 1000));

      return `
        <div class="nds-card ${overloaded ? 'crimson' : 'amber'}" style="margin-top:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
            <div>
              <span class="hc-badge ${overloaded ? 'danger' : 'success'}">⚡ SUA FONTE: ${esc(psu.name)} (${watts}W usados de ${psu.maxWatts}W)</span>
              <span class="hc-badge ${bottlenecked ? 'warn' : 'info'}" style="margin-left:6px;">🔒 Versão máx. dos Programas na sua CPU: até v${cpuCap.toFixed(1)}</span>
              <span class="hc-badge info" style="margin-left:6px;">${esc(stage.title)}</span>
            </div>
            ${benchRemSec > 0 ? `<span class="hc-badge warn mono">🔧 Instalando ${esc(this.state.benchPartLabel)}: ${Math.ceil(benchRemSec / 60)}m restantes</span>` : ''}
          </div>
          ${overloaded ? `
            <div style="padding:8px 10px;background:#261015;border:1px solid #e5534b;border-radius:7px;font-size:12px;color:#fca5a5;">
              🚨 <strong>FONTE FRACA (${watts}W &gt; ${psu.maxWatts}W)!</strong> Rodar 2 tarefas juntas desliga o PC e deixa sua velocidade pela metade (-50%)! Compre uma Fonte mais forte abaixo:
            </div>
          ` : ''}
          ${bottlenecked ? `
            <div style="padding:8px 10px;background:#241b0c;border:1px solid #f0a83a;border-radius:7px;font-size:12px;color:#fcd34d;">
              ⚠️ <strong>PROCESSADOR LIMITANDO SEUS PROGRAMAS:</strong> Seus programas acima de v${cpuCap.toFixed(1)} só rodam até v${cpuCap.toFixed(1)} e esquentam o PC em +15°C até você melhorar a CPU!
            </div>
          ` : ''}
          <div class="nds-grid-3">
            <div class="nds-row">
              <div><strong>Fonte 180W Básica</strong><div style="font-size:11px;color:var(--hc-text-2);">Vem no PC inicial</div></div>
              <span class="hc-badge">${psu.id === 'psu_180w' ? 'Instalada' : 'Trocada'}</span>
            </div>
            <div class="nds-row">
              <div><strong>Fonte 400W Bronze</strong><div style="font-size:11px;color:var(--hc-text-2);">Aguenta Xeon + Air Cooler</div></div>
              <button type="button" id="btnBuyPsu400w" class="hc-btn ${psu.maxWatts >= 400 ? 'ghost' : 'primary'} sm" ${psu.maxWatts >= 400 ? 'disabled' : ''} onclick="window.progressionLocksEngine.buyPsuUpgrade('psu_400w')">${psu.maxWatts >= 400 ? '✓ Instalada' : 'Comprar ($ 1.800)'}</button>
            </div>
            <div class="nds-row">
              <div><strong style="color:#fcd34d;">Fonte 750W Gold</strong><div style="font-size:11px;color:var(--hc-text-2);">Aguenta o PC máximo</div></div>
              <button type="button" id="btnBuyPsu750w" class="hc-btn ${psu.maxWatts >= 750 ? 'ghost' : 'primary'} sm" ${psu.maxWatts >= 750 ? 'disabled' : ''} onclick="window.progressionLocksEngine.buyPsuUpgrade('psu_750w')">${psu.maxWatts >= 750 ? '✓ Instalada' : 'Comprar ($ 6.500)'}</button>
            </div>
          </div>
        </div>
      `;
    }

    mountGateModal() {
      if (typeof document === 'undefined') return;
      const mount = () => {
        if (!document.getElementById('hcStageGateModal')) {
          const m = document.createElement('div');
          m.id = 'hcStageGateModal';
          m.className = 'hc-jail-overlay';
          m.style.display = 'none';
          document.body.appendChild(m);
        }
      };
      if (document.body) mount();
      else window.addEventListener('DOMContentLoaded', mount);
    }

    startBackgroundEnforcer() {
      if (typeof window === 'undefined') return;
      if (this._sweepTimer) clearInterval(this._sweepTimer);
      this._sweepTimer = setInterval(() => {
        if (!window.currentProfile) return;
        this.checkPsuOverloadAndTriggerBrownout(true);
        this.runNpcAntivirusSweep(false);
      }, 5000);
    }
  }

  window.progressionLocksEngine = new ProgressionLocksEngine();
})();
