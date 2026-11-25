/**
 * Hacker City // Fase 2 — Bloco 5:
 * 1. TaskManagerEngine    — Fila Central de Processos dividindo CPU e Banda em tempo real (100% / N) + Widget Flutuante "N processos ^"
 * 2. AttackMinigameEngine — Modal "Operação: Cofre de Segurança" (Disco Giratório de Tambores) para cortar até -65% do tempo de processos
 * 3. PuzzleTrailEngine    — Trilha de Enigmas ("First Puzzle" 109.64.200.10 -> 6 servidores encadeados com Lights Out, Charadas e Softwares Grátis!)
 */
(function () {
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtEta(secRaw) {
    const s = Math.max(0, Math.ceil(Number(secRaw || 0)));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const rem = s % 60;
    return `${h}h:${m}m:${rem}s`;
  }

  // =========================================================================
  // 1. TASK MANAGER ENGINE (ESTILO LIMPO REFERÊNCIA FOTO 1: ALL TASKS / CPU / DOWNLOADS / RUNNING SOFTWARE)
  // =========================================================================
  class TaskManagerEngine {
    constructor() {
      this.processes = [];
      this.activeFilter = 'all'; // 'all' | 'cpu' | 'net' | 'running_soft'
      this.nextPid = 101;
      this.drawerOpen = false;
      this.startSchedulerLoop();
    }

    getRunningByKind(kind) {
      return this.processes.filter((p) => p.status === 'running' && p.queueKind === kind);
    }

    getRunningAll() {
      return this.processes.filter((p) => p.status === 'running');
    }

    enqueue(opts) {
      if (opts.dedupeKey) {
        const dup = this.processes.find((p) => p.status === 'running' && p.dedupeKey === opts.dedupeKey);
        if (dup) {
          return { started: false, duplicate: true, process: dup, message: `Já existe "${dup.title}" em execução na Fila de Ações!` };
        }
      }

      const workTotal = Math.max(1.0, Number(opts.idealSeconds || 2.2));
      const tourBusy = !!(window.spotlightTour && window.spotlightTour.isActive);
      const shouldSwitchToTm = !!opts.openTaskManagerNow && !tourBusy;

      const proc = {
        pid: this.nextPid++,
        dedupeKey: opts.dedupeKey || null,
        title: opts.title || 'Processo do Sistema',
        labelHtml: opts.labelHtml || null,
        subtitle: opts.subtitle || 'CPU · localhost',
        targetIp: opts.targetIp || 'localhost',
        queueKind: opts.queueKind === 'net' ? 'net' : 'cpu',
        category: opts.category || 'Sistema',
        workTotal,
        workDone: 0,
        status: 'running',
        boostedByMinigame: false,
        returnWindowId: shouldSwitchToTm ? (opts.returnWindowId || null) : null,
        createdAt: Date.now(),
        onComplete: typeof opts.onComplete === 'function' ? opts.onComplete : null,
        onCancel: typeof opts.onCancel === 'function' ? opts.onCancel : null
      };

      this.processes.unshift(proc);
      if (this.processes.length > 30) {
        this.processes = this.processes.filter((p) => p.status === 'running').concat(
          this.processes.filter((p) => p.status !== 'running').slice(0, 10)
        );
      }

      if (shouldSwitchToTm && typeof window.navTo === 'function') {
        this.activeFilter = proc.queueKind === 'net' ? 'net' : 'cpu';
        window.navTo('winTaskManager');
      }

      this.syncWidgets();
      if (window.winManager && window.winManager.current === 'winTaskManager') {
        this.renderUI();
      }
      return { started: true, process: proc };
    }

    cancelProcess(pid) {
      const idx = this.processes.findIndex((p) => p.pid === Number(pid));
      if (idx === -1) return false;
      const proc = this.processes[idx];
      const retWin = proc.returnWindowId;
      if (proc.status === 'running') {
        proc.status = 'cancelled';
        if (proc.onCancel) {
          try { proc.onCancel(proc); } catch (e) {}
        }
      }
      this.processes.splice(idx, 1);
      this.syncWidgets();
      if (retWin && window.winManager && window.winManager.current === 'winTaskManager' && this.getRunningAll().length === 0) {
        if (typeof window.navTo === 'function') window.navTo(retWin);
      } else {
        this.renderUI();
      }
      if (window.internetEngine && window.winManager && window.winManager.current === 'winBrowser') {
        window.internetEngine.render();
      }
      return true;
    }

    // Corta uma fração do trabalho total (usado pelo Minigame de Cofre!)
    cutProcessWork(pid, fractionCut = 0.22) {
      const proc = this.processes.find((p) => p.pid === Number(pid) && p.status === 'running');
      if (!proc) return { found: false };

      const cutAmount = Math.max(0.8, proc.workTotal * fractionCut);
      proc.workDone = Math.min(proc.workTotal, proc.workDone + cutAmount);
      proc.boostedByMinigame = true;

      if (proc.workDone >= proc.workTotal) {
        this.finishProcess(proc);
        return { found: true, completedNow: true, cutSec: +cutAmount.toFixed(1) };
      }
      this.syncWidgets();
      this.renderUI();
      return { found: true, completedNow: false, cutSec: +cutAmount.toFixed(1), remainingSec: +(proc.workTotal - proc.workDone).toFixed(1) };
    }

    finishProcess(proc) {
      if (proc.status !== 'running') return;
      proc.status = 'completed';
      proc.workDone = proc.workTotal;
      if (proc.onComplete) {
        try { proc.onComplete(proc); } catch (e) { console.error('Erro ao concluir processo:', e); }
      }
      if (window.pwaAlertsEngine && typeof window.pwaAlertsEngine.triggerAlert === 'function') {
        window.pwaAlertsEngine.triggerAlert('taskDone', {
          title: '⚡ Ação Concluída na Fila!',
          body: `${proc.title || 'Processo'}${proc.targetIp ? ` (${proc.targetIp})` : ''} finalizado.`,
          winId: proc.returnWindowId || 'winTaskManager',
          tag: 'task-done'
        });
      }
      this.syncWidgets();

      if (proc.returnWindowId && window.winManager && window.winManager.current === 'winTaskManager') {
        const stillAuto = this.getRunningAll().some((r) => !!r.returnWindowId);
        if (!stillAuto && typeof window.navTo === 'function') {
          window.navTo(proc.returnWindowId);
          return;
        }
      }
      if (window.winManager && window.winManager.current === 'winTaskManager') {
        this.renderUI();
      }
    }

    startSchedulerLoop() {
      const TICK_MS = 100;
      const dt = TICK_MS / 1000;
      setInterval(() => {
        const cpuRunning = this.getRunningByKind('cpu');
        const netRunning = this.getRunningByKind('net');
        if (cpuRunning.length === 0 && netRunning.length === 0) return;

        const cpuShare = cpuRunning.length > 0 ? 1 / cpuRunning.length : 1;
        const netShare = netRunning.length > 0 ? 1 / netRunning.length : 1;

        const completedNow = [];
        cpuRunning.forEach((p) => {
          p.workDone = Math.min(p.workTotal, p.workDone + dt * cpuShare);
          if (p.workDone >= p.workTotal - 0.001) completedNow.push(p);
        });
        netRunning.forEach((p) => {
          p.workDone = Math.min(p.workTotal, p.workDone + dt * netShare);
          if (p.workDone >= p.workTotal - 0.001) completedNow.push(p);
        });

        completedNow.forEach((p) => this.finishProcess(p));
        this.syncWidgets();
        if (window.winManager && window.winManager.current === 'winTaskManager') {
          this.renderUI();
        }
        // Atualiza barras inline ao vivo se estiverem visíveis na Internet
        this.updateInlineDomBars();
        if (window.attackMinigame && window.attackMinigame.activePid) {
          window.attackMinigame.refreshTimerDisplay();
        }
      }, TICK_MS);
    }

    getProcessTelemetry(proc) {
      if (proc.status !== 'running') {
        return { pct: 100, pctDecStr: '100.0%', sharePct: 0, etaSec: 0 };
      }
      const sameQueue = this.getRunningByKind(proc.queueKind);
      const count = Math.max(1, sameQueue.length);
      const sharePct = Math.round(100 / count);
      const rawPct = Math.min(99.9, Math.max(0.5, (proc.workDone / proc.workTotal) * 100));
      const pct = Math.round(rawPct);
      const pctDecStr = rawPct.toFixed(1) + '%';
      const etaSec = (proc.workTotal - proc.workDone) * count;
      return { pct, pctDecStr, sharePct, etaSec };
    }

    updateInlineDomBars() {
      const running = this.getRunningAll();
      running.forEach((p) => {
        const t = this.getProcessTelemetry(p);
        const fillEl = document.getElementById(`tmInlineFill_${p.pid}`);
        const pctEl = document.getElementById(`tmInlinePct_${p.pid}`);
        const etaEl = document.getElementById(`tmInlineEta_${p.pid}`);
        if (fillEl) fillEl.style.width = t.pctDecStr;
        if (pctEl) pctEl.textContent = t.pctDecStr;
        if (etaEl) etaEl.textContent = fmtEta(t.etaSec);
      });
    }

    renderProcessRowHtml(p, inlinePrefix = false) {
      const t = this.getProcessTelemetry(p);
      const isNet = p.queueKind === 'net';
      const labelContent = p.labelHtml
        ? p.labelHtml
        : `${esc(p.title)} <span class="mono" style="color:var(--hc-text-3);">(${esc(p.targetIp)})</span>`;
      const iconName = isNet ? 'globe' : 'cpu';

      return `
        <div class="tm-process-row" data-pid="${p.pid}">
          <div class="tm-proc-label">${labelContent}</div>

          <div class="tm-bar-col">
            <div class="tm-bar-pct" ${inlinePrefix ? `id="tmInlinePct_${p.pid}"` : ''}>${t.pctDecStr}</div>
            <div class="tm-bar-track">
              <div class="tm-bar-fill ${isNet ? 'is-net' : ''}" ${inlinePrefix ? `id="tmInlineFill_${p.pid}"` : ''} style="width: ${t.pctDecStr};"></div>
            </div>
            <div class="tm-bar-eta" ${inlinePrefix ? `id="tmInlineEta_${p.pid}"` : ''}>${fmtEta(t.etaSec)}</div>
          </div>

          <div class="tm-share-col">
            ${window.HC ? HC.icon(iconName) : ''}
            <span>${t.sharePct}%</span>
            ${window.attackMinigame && p.workTotal >= 3.2
              ? `<button type="button" class="soft-icon-act ic-run" data-tip-title="Acelerar tarefa (Cofre)" data-tip-desc="Abrir cofre giratório para cortar o tempo restante" onclick="window.attackMinigame.openForProcess(${p.pid})" aria-label="Acelerar tarefa">${window.HC ? HC.icon('zap') : '⚡'}</button>`
              : ''}
            ${window.ecosystemHub && p.workTotal >= 3.2
              ? `<button type="button" class="soft-icon-act ic-info" data-tip-title="Overclock Matriz Hex (+55%)" data-tip-desc="Resolver Matriz Hexadecimal 5x5 para acelerar +55% de todas as tarefas!" onclick="window.ecosystemHub.startTaskOverclockWithHex()" aria-label="Overclock Matriz Hex">🧩</button>`
              : ''}
          </div>

          <button type="button" class="tm-cancel-btn" data-tip-title="Cancelar ação" data-tip-desc="Interromper esta tarefa imediatamente" aria-label="Cancelar tarefa" onclick="window.taskManager.cancelProcess(${p.pid})">✕</button>
        </div>
      `;
    }

    renderInlineActiveBarsHtml(targetIp = null) {
      const list = this.getRunningAll().filter((p) => !targetIp || p.targetIp === targetIp);
      if (list.length === 0) return '';
      return `
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px;">
          ${list.map((p) => this.renderProcessRowHtml(p, true)).join('')}
        </div>
      `;
    }

    syncWidgets() {
      const running = this.getRunningAll();
      const navBadge = document.getElementById('navTaskCountBadge');
      if (navBadge) {
        navBadge.textContent = String(running.length);
        navBadge.style.display = running.length > 0 ? 'inline-flex' : 'none';
      }
      if (window.winManager && typeof window.winManager.refreshFloatingTasksPill === 'function') {
        window.winManager.refreshFloatingTasksPill();
      }
    }

    renderRunningSoftwareTabHtml() {
      if (!window.softwareEngine) return '<div style="padding:28px;text-align:center;color:var(--hc-text-3);">Nenhum software ativo.</div>';
      window.softwareEngine.ensureLoaded();
      const inv = window.softwareEngine.state.inventory || {};
      const runningItems = Object.entries(inv).filter(([, st]) => st && st.owned && st.installed);

      if (runningItems.length === 0) {
        return `<div style="padding:32px 16px;text-align:center;color:var(--hc-text-3);font-size:13px;">Nenhum programa rodando em segundo plano no momento.</div>`;
      }

      const rows = runningItems.map(([k, st]) => {
        const def = window.softwareEngine.getDefinition(k) || { filename: k, friendlyTitle: k, icon: 'cpu', iconKind: 'attack' };
        const ver = ((st.runningVerInt || st.versionInt || 10) / 10).toFixed(1);
        const ramMb = window.softwareEngine.getItemRamMb(k, st.runningVerInt || st.versionInt, false);
        return `
          <tr class="row-running">
            <td class="soft-col-icon">
              <span class="soft-mini-glyph kind-${def.iconKind || 'attack'}" data-tip-title="${esc(def.friendlyTitle)}" data-tip-meta="${esc(def.filename)} v${ver}" data-tip-desc="${esc(def.desc || '')}">
                ${window.HC ? HC.icon(def.icon || 'cpu') : ''}
              </span>
            </td>
            <td>
              <span class="soft-name-trigger" data-tip-title="${esc(def.friendlyTitle)}" data-tip-meta="Em execução" data-tip-desc="${esc(def.desc || '')}">
                <span class="soft-run-dot"></span> ${esc(def.filename)}
              </span>
            </td>
            <td class="soft-col-ver"><span class="soft-ver-badge v-tier2">${ver}</span></td>
            <td class="soft-col-size">${ramMb > 0 ? ramMb + ' MB RAM' : '2º Plano'}</td>
            <td class="soft-col-acts">
              <div class="soft-icon-actions">
                <button type="button" class="soft-icon-act ic-stop" aria-label="Encerrar ${esc(def.filename)}"
                  data-tip-title="Parar execução" data-tip-desc="Encerrar ${esc(def.filename)} (${ver}) que está rodando em segundo plano"
                  onclick="window.softwareEngine.stopSoftwareViaTaskManager('${esc(k)}')">
                  ${window.HC ? HC.icon('circle-stop') : '⏹'}
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      return `
        <div class="soft-table-wrap">
          <table class="soft-table clean-hw-table">
            <thead>
              <tr>
                <th class="soft-col-icon"></th>
                <th>Programa em segundo plano</th>
                <th class="soft-col-ver">Versão</th>
                <th class="soft-col-size">Memória</th>
                <th class="soft-col-acts">Ações</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    renderUI(containerId = 'taskManagerBody') {
      const container = document.getElementById(containerId);
      if (!container) return;

      const runningAll = this.getRunningAll();
      const cpuRunning = this.getRunningByKind('cpu');
      const netRunning = this.getRunningByKind('net');
      let runningSoftCount = 0;
      if (window.softwareEngine && window.softwareEngine.state && window.softwareEngine.state.inventory) {
        runningSoftCount = Object.values(window.softwareEngine.state.inventory).filter((s) => s && s.owned && s.installed).length;
      }

      let bodyHtml = '';
      if (this.activeFilter === 'running_soft') {
        bodyHtml = this.renderRunningSoftwareTabHtml();
      } else {
        const list = runningAll.filter((p) => {
          if (this.activeFilter === 'cpu') return p.queueKind === 'cpu';
          if (this.activeFilter === 'net') return p.queueKind === 'net';
          return true;
        });

        bodyHtml = list.length === 0
          ? `<div style="padding:34px 16px;text-align:center;color:var(--hc-text-3);font-size:13px;">
               Nenhuma ação em andamento nesta aba agora. Quando você rodar um programa, subir um arquivo ou executar um vírus, a barra de progresso aparecerá aqui em tempo real.
             </div>`
          : list.map((p) => this.renderProcessRowHtml(p, false)).join('');
      }

      container.innerHTML = `
        <div class="tm-frame" id="taskManagerMainFrame">
          <div class="soft-tabs-bar">
            <div class="soft-tabs-left">
              <button type="button" class="soft-tab-btn ${this.activeFilter === 'all' ? 'active' : ''}" onclick="window.taskManager.activeFilter='all';window.taskManager.renderUI();">
                ${window.HC ? HC.icon('activity') : ''} <span>Todas as tarefas${runningAll.length > 0 ? ` (${runningAll.length})` : ''}</span>
              </button>
              <button type="button" class="soft-tab-btn ${this.activeFilter === 'cpu' ? 'active' : ''}" onclick="window.taskManager.activeFilter='cpu';window.taskManager.renderUI();">
                ${window.HC ? HC.icon('cpu') : ''} <span>Tarefas de CPU${cpuRunning.length > 0 ? ` (${cpuRunning.length})` : ''}</span>
              </button>
              <button type="button" class="soft-tab-btn ${this.activeFilter === 'net' ? 'active' : ''}" onclick="window.taskManager.activeFilter='net';window.taskManager.renderUI();">
                ${window.HC ? HC.icon('download') : ''} <span>Gerenciador de Downloads${netRunning.length > 0 ? ` (${netRunning.length})` : ''}</span>
              </button>
              <button type="button" class="soft-tab-btn ${this.activeFilter === 'running_soft' ? 'active' : ''}" onclick="window.taskManager.activeFilter='running_soft';window.taskManager.renderUI();">
                ${window.HC ? HC.icon('layers') : ''} <span>Programas em execução${runningSoftCount > 0 ? ` (${runningSoftCount})` : ''}</span>
              </button>
            </div>
          </div>

          <div class="tm-body">
            ${bodyHtml}
          </div>
        </div>
      `;
    }
  }

  // =========================================================================
  // 2. ATTACK MINIGAME ENGINE ("OPERAÇÃO: COFRE DE SEGURANÇA" — DISCO GIRATÓRIO)
  // =========================================================================
  const DIAL_SYMBOLS = ['8', '4', 'D', '6', '3', 'A', '0', 'F', '7', '1', 'C', '9', '5', 'E', '2', 'B'];

  class AttackMinigameEngine {
    constructor() {
      this.activePid = null;
      this.drumsTotal = 4;
      this.drumsLocked = 0;
      this.resistedCount = 0;
      this.totalCutSec = 0;
      this.angleDeg = 0;
      this.speedDegPerSec = 105;
      this.direction = 1;
      this.targetSymbolIdx = 3;
      this.animHandle = null;
      this.lastFrameTs = 0;
      this.bindSpaceKey();
    }

    bindSpaceKey() {
      window.addEventListener('keydown', (e) => {
        if (this.activePid && e.code === 'Space') {
          e.preventDefault();
          this.attemptLockDrum(false);
        } else if (this.activePid && e.key === 'Escape') {
          this.closeModal();
        }
      });
    }

    ensureModalDom() {
      let modal = document.getElementById('vaultMinigameOverlay');
      if (modal) return modal;

      modal = document.createElement('div');
      modal.id = 'vaultMinigameOverlay';
      modal.style.cssText = 'position:fixed;inset:0;z-index:1200;background:rgba(7,9,12,0.84);backdrop-filter:blur(5px);display:none;align-items:center;justify-content:center;padding:20px;';
      document.body.appendChild(modal);
      return modal;
    }

    openForProcess(pid) {
      const proc = window.taskManager ? window.taskManager.processes.find((p) => p.pid === Number(pid) && p.status === 'running') : null;
      if (!proc) {
        if (typeof window.showToast === 'function') window.showToast('Este processo já foi concluído!');
        return;
      }

      this.activePid = proc.pid;
      this.drumsLocked = 0;
      this.resistedCount = 0;
      this.totalCutSec = 0;
      this.angleDeg = 0;
      this.direction = 1;
      this.pickNextTargetSymbol();

      const modal = this.ensureModalDom();
      modal.style.display = 'flex';
      this.renderModalContent(proc);
      this.startDialAnimation();
    }

    pickNextTargetSymbol() {
      this.targetSymbolIdx = Math.floor(Math.random() * DIAL_SYMBOLS.length);
    }

    startDialAnimation() {
      if (this.animHandle) cancelAnimationFrame(this.animHandle);
      this.lastFrameTs = performance.now();

      const step = (now) => {
        if (!this.activePid) return;
        const dt = Math.min(0.08, (now - this.lastFrameTs) / 1000);
        this.lastFrameTs = now;
        this.angleDeg = (this.angleDeg + this.direction * this.speedDegPerSec * dt + 360) % 360;

        const ring = document.getElementById('vaultDialRotatingGroup');
        if (ring) {
          ring.setAttribute('transform', `rotate(${this.angleDeg.toFixed(1)} 120 120)`);
        }
        this.animHandle = requestAnimationFrame(step);
      };
      this.animHandle = requestAnimationFrame(step);
    }

    getCurrentTopSymbolIdx() {
      // Símbolo i foi desenhado em baseAngle = i * 22.5 graus (0 = topo).
      // Quando o grupo gira +angleDeg, o símbolo no topo (0 graus) tem baseAngle + angleDeg ≡ 0 (mod 360).
      const stepDeg = 360 / DIAL_SYMBOLS.length; // 22.5°
      const rawIdx = Math.round(((360 - (this.angleDeg % 360)) % 360) / stepDeg) % DIAL_SYMBOLS.length;
      return rawIdx;
    }

    attemptLockDrum(forceAlign = false) {
      if (!this.activePid || !window.taskManager) return { hit: false };
      const proc = window.taskManager.processes.find((p) => p.pid === this.activePid && p.status === 'running');
      if (!proc) {
        this.closeModal();
        return { hit: false, finished: true };
      }

      if (forceAlign) {
        const stepDeg = 360 / DIAL_SYMBOLS.length;
        this.angleDeg = (360 - this.targetSymbolIdx * stepDeg) % 360;
      }

      const curIdx = this.getCurrentTopSymbolIdx();
      const diff = Math.min(
        Math.abs(curIdx - this.targetSymbolIdx),
        DIAL_SYMBOLS.length - Math.abs(curIdx - this.targetSymbolIdx)
      );

      // Tolerância justa de ±1 casa no disco giratório
      if (diff <= 1) {
        this.drumsLocked++;
        this.direction *= -1; // Inverte sentido igual a um cofre mecânico real!
        this.speedDegPerSec = Math.min(165, this.speedDegPerSec + 14);
        const cutRes = window.taskManager.cutProcessWork(this.activePid, 0.22);
        this.totalCutSec = +(this.totalCutSec + (cutRes.cutSec || 0)).toFixed(1);
        if (window.hackerAudio) window.hackerAudio.playCashChime();

        if (cutRes.completedNow || this.drumsLocked >= this.drumsTotal) {
          // Se travou todos os 4 tambores e ainda sobrava um restinho, dá bônus extra!
          if (!cutRes.completedNow) {
            window.taskManager.cutProcessWork(this.activePid, 0.20);
          }
          if (typeof window.showToast === 'function') {
            window.showToast(`Cofre destravado! Tempo cortado em -${this.totalCutSec}s!`);
          }
          this.closeModal();
          return { hit: true, finished: true, totalCutSec: this.totalCutSec };
        }

        this.pickNextTargetSymbol();
        this.renderModalContent(proc);
        return { hit: true, drumsLocked: this.drumsLocked, totalCutSec: this.totalCutSec };
      }

      // Errou o pino -> tambor resistiu (não cancela nem pune o processo!)
      this.resistedCount++;
      if (window.hackerAudio && typeof window.hackerAudio.playErrorBuzz === 'function') {
        window.hackerAudio.playErrorBuzz();
      }
      this.renderModalContent(proc);
      return { hit: false, resistedCount: this.resistedCount };
    }

    refreshTimerDisplay() {
      if (!this.activePid || !window.taskManager) return;
      const proc = window.taskManager.processes.find((p) => p.pid === this.activePid && p.status === 'running');
      if (!proc) {
        this.closeModal();
        return;
      }
      const lbl = document.getElementById('vaultModalEtaLbl');
      if (lbl) {
        const t = window.taskManager.getProcessTelemetry(proc);
        lbl.textContent = fmtEta(t.etaSec);
      }
    }

    closeModal() {
      this.activePid = null;
      if (this.animHandle) {
        cancelAnimationFrame(this.animHandle);
        this.animHandle = null;
      }
      const modal = document.getElementById('vaultMinigameOverlay');
      if (modal) modal.style.display = 'none';
    }

    renderModalContent(proc) {
      const modal = this.ensureModalDom();
      const t = window.taskManager.getProcessTelemetry(proc);
      const targetChar = DIAL_SYMBOLS[this.targetSymbolIdx];

      const stepDeg = 360 / DIAL_SYMBOLS.length;
      const marksSvg = DIAL_SYMBOLS.map((sym, idx) => {
        const deg = idx * stepDeg;
        const isTarget = idx === this.targetSymbolIdx;
        return `
          <g transform="rotate(${deg} 120 120)">
            <text x="120" y="34" text-anchor="middle" fill="${isTarget ? '#e5b84b' : '#dbe2ec'}" font-family="JetBrains Mono, monospace" font-size="${isTarget ? '15' : '13'}" font-weight="${isTarget ? '700' : '500'}">${sym}</text>
          </g>
        `;
      }).join('');

      const drumBadges = [1, 2, 3, 4].map((n) => {
        if (n <= this.drumsLocked) {
          return `<span class="hc-badge success" style="padding:4px 10px;">🔒 ${n} Travado</span>`;
        }
        if (n === this.drumsLocked + 1) {
          return `<span class="hc-badge warn" style="padding:4px 10px;">🎯 ${n} Tambor ${n} de 4</span>`;
        }
        return `<span class="hc-badge" style="padding:4px 10px;opacity:0.65;">○ ${n}</span>`;
      }).join('');

      modal.innerHTML = `
        <div class="hc-card" style="width:100%;max-width:700px;padding:1.5rem 1.75rem;border-color:rgba(216,155,56,0.5);background:#101318;box-shadow:0 24px 64px rgba(0,0,0,0.7);">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--hc-border);padding-bottom:12px;margin-bottom:14px;gap:10px;flex-wrap:wrap;">
            <div>
              <strong style="font-size:1.08rem;display:block;">Operação: Cofre de Segurança (${esc(proc.title)})</strong>
              <span style="font-family:var(--hc-font-mono);font-size:0.8rem;color:var(--hc-accent-text);">${esc(proc.targetIp)}</span>
              <span style="font-family:var(--hc-font-mono);font-size:0.8rem;color:var(--hc-text-2);margin-left:10px;">⏱ <span id="vaultModalEtaLbl">${fmtEta(t.etaSec)}</span></span>
            </div>
            <div style="display:flex;gap:8px;">
              <button type="button" class="hc-btn ghost sm" onclick="window.attackMinigame.closeModal()">Pular</button>
              <button type="button" class="hc-btn ghost sm" onclick="window.attackMinigame.closeModal()">✕</button>
            </div>
          </div>

          <div style="font-size:0.85rem;color:var(--hc-text-2);margin-bottom:12px;">
            Aperte <strong>Travar</strong> (ou barra de <code>Espaço</code>) quando a marca dourada <strong style="color:#e5b84b;">ALVO ${targetChar}</strong> passar sob o pino branco superior!
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
            ${drumBadges}
          </div>
          <div style="font-family:var(--hc-font-mono);font-size:0.78rem;color:var(--hc-text-3);margin-bottom:16px;">
            Travados: ${this.drumsLocked}/4 · Resistiu: ${this.resistedCount} · Tempo cortado: <strong style="color:var(--hc-accent-text);">-${this.totalCutSec} s</strong>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-around;gap:24px;flex-wrap:wrap;">
            <!-- Disco Giratório SVG -->
            <div style="position:relative;width:240px;height:240px;">
              <div style="position:absolute;left:8px;top:6px;font-family:var(--hc-font-mono);font-size:0.76rem;color:#e5b84b;">◎ ALVO ${targetChar}</div>
              <svg viewBox="0 0 240 240" width="240" height="240">
                <circle cx="120" cy="120" r="108" fill="#141820" stroke="#c8962e" stroke-width="2.5"/>
                <g id="vaultDialRotatingGroup" transform="rotate(${this.angleDeg.toFixed(1)} 120 120)">
                  ${marksSvg}
                </g>
                <circle cx="120" cy="120" r="64" fill="#232934" stroke="#475164" stroke-width="3"/>
                <circle cx="120" cy="120" r="46" fill="#9ea7b5" stroke="#5d6678" stroke-width="2"/>
                <circle cx="120" cy="120" r="14" fill="#cfd6e2"/>
                <!-- Pino indicador fixo no topo -->
                <polygon points="120,18 113,6 127,6" fill="#ffffff"/>
              </svg>
            </div>

            <div style="flex:1;min-width:220px;display:flex;flex-direction:column;gap:10px;">
              <button type="button" id="btnLockVaultDrum" onclick="window.attackMinigame.attemptLockDrum(false)" style="width:100%;padding:14px 20px;border-radius:9px;border:1px solid #d4a134;background:#9c751c;color:#fff;font-size:0.96rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;">
                <span>Travar</span>
                <span style="background:rgba(0,0,0,0.35);padding:2px 8px;border-radius:5px;font-family:var(--hc-font-mono);font-size:0.76rem;">Espaço</span>
              </button>
              <div style="font-size:0.76rem;color:var(--hc-text-3);line-height:1.45;">
                Atalho 100% opcional: cada tambor travado corta <strong>-22%</strong> do tempo total do processo. Clicar em <em>Pular</em> mantém o processo rodando normalmente em segundo plano.
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  // =========================================================================
  // 3. PUZZLE TRAIL ENGINE ("FIRST PUZZLE" 109.64.200.10 -> 20 MÁQUINAS EM CADEIA!)
  // Regra Oficial: Você NÃO nasce com vírus nem compra qualquer vírus do nada!
  // Os vírus e softwares raros (v1.0 a v10.0) são conquistados nos 5 minijogos reais!
  // =========================================================================
  const PUZZLE_CHAIN = [
    {
      index: 1,
      ip: '109.64.200.10',
      hostname: 'First Puzzle // Gateway Enigma #1',
      kind: 'lightsout',
      title: 'Enigma #1 — Matriz Lights Out (3×3)',
      prompt: 'Acenda TODOS os 9 nós da matriz quântica! Clicar em uma célula inverte ela e suas vizinhas ortogonais.',
      fallbackAnswer: '42',
      nextIp: '109.64.200.20',
      rewardLabel: 'Spam.vspam v1.0 + Collector.vcol v1.0',
      rewardSoftwares: [
        { softKey: 'vspam', versionInt: 10 },
        { softKey: 'collector', versionInt: 10 }
      ],
      rewardSoftKey: 'vspam',
      rewardSoftVer: 10,
      rewardRep: 45
    },
    {
      index: 2,
      ip: '109.64.200.20',
      hostname: 'Enigma Node #2 // Memory Sweep',
      kind: 'minesweeper',
      rows: 4, cols: 4, mineCount: 2,
      title: 'Enigma #2 — Campo Minado Forense (4×4)',
      prompt: 'Mapeie o setor de memória sem detonar as armadilhas de kernel ativas.',
      fallbackAnswer: 'root',
      nextIp: '109.64.200.30',
      rewardLabel: 'Warez.vwarez v1.0 + Torrent.torrent v1.0',
      rewardSoftwares: [
        { softKey: 'vwarez', versionInt: 10 },
        { softKey: 'torrent', versionInt: 10 }
      ],
      rewardSoftKey: 'vwarez',
      rewardSoftVer: 10,
      rewardRep: 55
    },
    {
      index: 3,
      ip: '109.64.200.30',
      hostname: 'Enigma Node #3 // Cripto Sudoku',
      kind: 'hex_sudoku',
      title: 'Enigma #3 — Sudoku Hexadecimal 4×4',
      prompt: 'Preencha a matriz criptográfica com 1, 2, 3 e 4 sem repetir em nenhuma linha, coluna ou bloco 2×2.',
      fallbackAnswer: '22',
      nextIp: '109.64.200.40',
      rewardLabel: 'FTP_Exploit.exp v1.0 + SSH_Exploit.exp v1.0 + Nmap.nmap v1.0',
      rewardSoftwares: [
        { softKey: 'exploit_ftp', versionInt: 10 },
        { softKey: 'exploit_ssh', versionInt: 10 },
        { softKey: 'nmap', versionInt: 10 }
      ],
      rewardSoftKey: 'exploit_ssh',
      rewardSoftVer: 10,
      rewardRep: 65
    },
    {
      index: 4,
      ip: '109.64.200.40',
      hostname: 'Enigma Node #4 // Buffer Fusion 2048',
      kind: 'buffer_2048',
      targetVal: 64,
      title: 'Enigma #4 — Fusão Algorítmica 2048 (Meta: 64KB)',
      prompt: 'Funda blocos binários de pacotes até compilar um buffer íntegro de 64KB.',
      fallbackAnswer: '255',
      nextIp: '109.64.200.50',
      rewardLabel: 'Miner.vminer v1.0 + Antivirus.av v1.5',
      rewardSoftwares: [
        { softKey: 'vminer', versionInt: 10 },
        { softKey: 'antivirus', versionInt: 15 }
      ],
      rewardSoftKey: 'vminer',
      rewardSoftVer: 10,
      rewardRep: 80
    },
    {
      index: 5,
      ip: '109.64.200.50',
      hostname: 'Enigma Node #5 // Neural Tic-Tac-Toe',
      kind: 'neural_ttt',
      title: 'Enigma #5 — Jogo da Velha Quântico vs Safenet AI',
      prompt: 'Vença ou empate estrategicamente contra o algoritmo minimax em 2 rodadas.',
      fallbackAnswer: 'hacker',
      nextIp: '109.64.200.60',
      rewardLabel: 'DDoS_Node.vddos v1.0 + DDoS_Breaker.vbrk v1.0',
      rewardSoftwares: [
        { softKey: 'vddos', versionInt: 10 },
        { softKey: 'ddos_breaker', versionInt: 10 }
      ],
      rewardSoftKey: 'vddos',
      rewardSoftVer: 10,
      rewardRep: 95
    },
    {
      index: 6,
      ip: '109.64.200.60',
      hostname: 'Enigma Node #6 // Memory Sweep Tier 2',
      kind: 'minesweeper',
      rows: 5, cols: 5, mineCount: 3,
      title: 'Enigma #6 — Campo Minado Militar (5×5)',
      prompt: 'Desarme 3 armadilhas de kernel em bloco de alta velocidade.',
      fallbackAnswer: '256',
      nextIp: '109.64.200.65',
      rewardLabel: 'BankTrojan.vbank v1.0 + Cracker.crc v2.0',
      rewardSoftwares: [
        { softKey: 'vbank', versionInt: 10 },
        { softKey: 'cracker', versionInt: 20 }
      ],
      rewardSoftKey: 'vbank',
      rewardSoftVer: 10,
      rewardRep: 120
    },
    {
      index: 7,
      ip: '109.64.200.65',
      hostname: 'Enigma Node #7 // Relé de Grade 4x4',
      kind: 'lightsout',
      title: 'Enigma #7 — Lights Out Quântico',
      prompt: 'Alinhe o fluxo elétrico de todos os 9 relés de comutação.',
      fallbackAnswer: '80',
      nextIp: '109.64.200.70',
      rewardLabel: 'Firewall.fwl v2.5 + Hasher.hash v2.5 + Hider.hdr v2.5',
      rewardSoftwares: [
        { softKey: 'firewall', versionInt: 25 },
        { softKey: 'hasher', versionInt: 25 },
        { softKey: 'hider', versionInt: 25 }
      ],
      rewardSoftKey: 'firewall',
      rewardSoftVer: 25,
      rewardRep: 150
    },
    {
      index: 8,
      ip: '109.64.200.70',
      hostname: 'Enigma Node #8 // Cripto Sudoku Tier 2',
      kind: 'hex_sudoku',
      title: 'Enigma #8 — Sudoku Criptográfico Especialista',
      prompt: 'Resolva a alocação de registros sem colisões de hash.',
      fallbackAnswer: '443',
      nextIp: '109.64.200.75',
      rewardLabel: 'PortScan.scan v3.0 + Bypass.byp v3.0',
      rewardSoftwares: [
        { softKey: 'portscan', versionInt: 30 },
        { softKey: 'hasher', versionInt: 30 }
      ],
      rewardSoftKey: 'portscan',
      rewardSoftVer: 30,
      rewardRep: 180
    },
    {
      index: 9,
      ip: '109.64.200.75',
      hostname: 'Enigma Node #9 // Buffer Merge 128KB',
      kind: 'buffer_2048',
      targetVal: 128,
      title: 'Enigma #9 — Compilador 2048 (Meta: 128KB)',
      prompt: 'Funda pacotes em tempo real até consolidar o token binário de 128KB.',
      fallbackAnswer: '1337',
      nextIp: '109.64.200.80',
      rewardLabel: 'Miner.vminer v3.5 + Collector.vcol v3.0',
      rewardSoftwares: [
        { softKey: 'vminer', versionInt: 35 },
        { softKey: 'collector', versionInt: 30 }
      ],
      rewardSoftKey: 'vminer',
      rewardSoftVer: 35,
      rewardRep: 210
    },
    {
      index: 10,
      ip: '109.64.200.80',
      hostname: 'Enigma Node #10 // Neural Minimax Nível 2',
      kind: 'neural_ttt',
      title: 'Enigma #10 — Duelo Quântico Safenet II',
      prompt: 'Supere a heurística neural da polícia federal.',
      fallbackAnswer: 'cipher',
      nextIp: '109.64.200.82',
      rewardLabel: 'Cracker.crc v4.0 + Hasher.hash v4.0',
      rewardSoftwares: [
        { softKey: 'cracker', versionInt: 40 },
        { softKey: 'hasher', versionInt: 40 }
      ],
      rewardSoftKey: 'cracker',
      rewardSoftVer: 40,
      rewardRep: 250
    },
    {
      index: 11,
      ip: '109.64.200.82',
      hostname: 'Enigma Node #11 // Memory Sweep Militar',
      kind: 'minesweeper',
      rows: 5, cols: 5, mineCount: 4,
      title: 'Enigma #11 — Campo Minado Militar de Alta Densidade',
      prompt: 'Limpe o setor sem detonar os 4 setores corrompidos.',
      fallbackAnswer: 'defense',
      nextIp: '109.64.200.84',
      rewardLabel: 'Firewall.fwl v5.0 + Antivirus.av v5.0',
      rewardSoftwares: [
        { softKey: 'firewall', versionInt: 50 },
        { softKey: 'antivirus', versionInt: 50 }
      ],
      rewardSoftKey: 'firewall',
      rewardSoftVer: 50,
      rewardRep: 300
    },
    {
      index: 12,
      ip: '109.64.200.84',
      hostname: 'Enigma Node #12 // Matriz de Relés II',
      kind: 'lightsout',
      title: 'Enigma #12 — Reconfiguração de Switch Central',
      prompt: 'Ative todas as linhas da malha de roteamento.',
      fallbackAnswer: 'router',
      nextIp: '109.64.200.86',
      rewardLabel: 'DDoS_Node.vddos v5.0 + Spammer.vspam v5.0',
      rewardSoftwares: [
        { softKey: 'vddos', versionInt: 50 },
        { softKey: 'vspam', versionInt: 50 }
      ],
      rewardSoftKey: 'vddos',
      rewardSoftVer: 50,
      rewardRep: 360
    },
    {
      index: 13,
      ip: '109.64.200.86',
      hostname: 'Enigma Node #13 // Cripto Sudoku Militar',
      kind: 'hex_sudoku',
      title: 'Enigma #13 — Sudoku Cripto Pentágono',
      prompt: 'Alinhe a grade 4×4 sem duplicidade em sub-redes.',
      fallbackAnswer: 'pentagon',
      nextIp: '109.64.200.88',
      rewardLabel: 'BankTrojan.vbank v6.0 + Cracker.crc v6.0',
      rewardSoftwares: [
        { softKey: 'vbank', versionInt: 60 },
        { softKey: 'cracker', versionInt: 60 }
      ],
      rewardSoftKey: 'cracker',
      rewardSoftVer: 60,
      rewardRep: 420
    },
    {
      index: 14,
      ip: '109.64.200.88',
      hostname: 'Enigma Node #14 // Buffer 2048 - 128KB Elite',
      kind: 'buffer_2048',
      targetVal: 128,
      title: 'Enigma #14 — Fusão Algorítmica Avançada',
      prompt: 'Compile um token binário de alta octanagem de 128KB.',
      fallbackAnswer: 'token',
      nextIp: '109.64.200.90',
      rewardLabel: 'Miner.vminer v7.0 + DDoS_Breaker.vbrk v7.0',
      rewardSoftwares: [
        { softKey: 'vminer', versionInt: 70 },
        { softKey: 'ddos_breaker', versionInt: 70 }
      ],
      rewardSoftKey: 'vminer',
      rewardSoftVer: 70,
      rewardRep: 500
    },
    {
      index: 15,
      ip: '109.64.200.90',
      hostname: 'Enigma Node #15 // Neural Minimax Mestre',
      kind: 'neural_ttt',
      title: 'Enigma #15 — Enfrentamento de Rede Neural Safenet',
      prompt: 'Contenha o algoritmo preditivo em batalha direta de 3 rounds.',
      fallbackAnswer: 'minimax',
      nextIp: '109.64.200.92',
      rewardLabel: 'PortScan.scan v7.5 + Hasher.hash v7.5',
      rewardSoftwares: [
        { softKey: 'portscan', versionInt: 75 },
        { softKey: 'hasher', versionInt: 75 }
      ],
      rewardSoftKey: 'portscan',
      rewardSoftVer: 75,
      rewardRep: 600
    },
    {
      index: 16,
      ip: '109.64.200.92',
      hostname: 'Enigma Node #16 // Memory Sweep Quântico',
      kind: 'minesweeper',
      rows: 5, cols: 5, mineCount: 4,
      title: 'Enigma #16 — Desarme de Memória Safenet',
      prompt: 'Mapeie o kernel criptográfico de alta vigilância.',
      fallbackAnswer: 'safenet',
      nextIp: '109.64.200.94',
      rewardLabel: 'Firewall.fwl v8.0 + Antivirus.av v8.0',
      rewardSoftwares: [
        { softKey: 'firewall', versionInt: 80 },
        { softKey: 'antivirus', versionInt: 80 }
      ],
      rewardSoftKey: 'firewall',
      rewardSoftVer: 80,
      rewardRep: 720
    },
    {
      index: 17,
      ip: '109.64.200.94',
      hostname: 'Enigma Node #17 // Matriz Lights Out Final',
      kind: 'lightsout',
      title: 'Enigma #17 — Comutador Quântico Matrix',
      prompt: 'Ative a malha integral de conexões de Sanctum.',
      fallbackAnswer: 'matrix',
      nextIp: '109.64.200.96',
      rewardLabel: 'BankTrojan.vbank v8.5 + DDoS_Node.vddos v8.5',
      rewardSoftwares: [
        { softKey: 'vbank', versionInt: 85 },
        { softKey: 'vddos', versionInt: 85 }
      ],
      rewardSoftKey: 'vddos',
      rewardSoftVer: 85,
      rewardRep: 850
    },
    {
      index: 18,
      ip: '109.64.200.96',
      hostname: 'Enigma Node #18 // Hex Sudoku Quântico',
      kind: 'hex_sudoku',
      title: 'Enigma #18 — Sudoku Quântico sem Colisão',
      prompt: 'Resolva a matriz mestre de 4×4 para desbloquear o penúltimo IP.',
      fallbackAnswer: 'quantum',
      nextIp: '109.64.200.98',
      rewardLabel: 'Cracker.crc v9.0 + Hasher.hash v9.0',
      rewardSoftwares: [
        { softKey: 'cracker', versionInt: 90 },
        { softKey: 'hasher', versionInt: 90 }
      ],
      rewardSoftKey: 'cracker',
      rewardSoftVer: 90,
      rewardRep: 1000
    },
    {
      index: 19,
      ip: '109.64.200.98',
      hostname: 'Enigma Node #19 // Buffer 2048 - 256KB Mestre',
      kind: 'buffer_2048',
      targetVal: 64,
      title: 'Enigma #19 — Fusão Binária Mestre (Meta: 64KB)',
      prompt: 'Compile o token final de autorização para o Sanctum Omega.',
      fallbackAnswer: 'omega',
      nextIp: '109.64.200.99',
      rewardLabel: 'Miner.vminer v9.5 + Firewall.fwl v9.5',
      rewardSoftwares: [
        { softKey: 'vminer', versionInt: 95 },
        { softKey: 'firewall', versionInt: 95 }
      ],
      rewardSoftKey: 'vminer',
      rewardSoftVer: 95,
      rewardRep: 1250
    },
    {
      index: 20,
      ip: '109.64.200.99',
      hostname: 'Sanctum Final Omega // Enigma Supremo #20',
      kind: 'neural_ttt',
      title: 'Enigma #20 — Sanctum Omega (IA Suprema)',
      prompt: 'Duelo final contra a inteligência de defesa mais poderosa da rede. Vença ou empate para conquistar os Softwares Lendários v10.0!',
      fallbackAnswer: 'godmode',
      nextIp: '109.64.200.99',
      rewardLabel: 'Cracker.crc v10.0 + Firewall.fwl v10.0 + Antivirus.av v10.0',
      rewardSoftwares: [
        { softKey: 'cracker', versionInt: 100 },
        { softKey: 'firewall', versionInt: 100 },
        { softKey: 'antivirus', versionInt: 100 }
      ],
      rewardSoftKey: 'cracker',
      rewardSoftVer: 100,
      rewardRep: 2000
    }
  ];

  class PuzzleTrailEngine {
    constructor() {
      this.userId = null;
      this.state = null;
      // Estado inicial resolvível em 1 clique no centro (1,1): centro apagado e 4 cantos acesos!
      this.lightsGrid = [
        [1, 0, 1],
        [0, 0, 0],
        [1, 0, 1]
      ];
    }

    storageKey(uid) {
      return `HC_PUZZLE_TRAIL_${uid || 'guest'}`;
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
      this.state = saved && Array.isArray(saved.solved) ? saved : { solved: [] };
      return this.state;
    }

    save() {
      if (!this.state) return;
      try {
        localStorage.setItem(this.storageKey(this.userId), JSON.stringify(this.state));
      } catch (e) {}
    }

    getNodeByIp(ip) {
      return PUZZLE_CHAIN.find((n) => n.ip === ip) || null;
    }

    getAllNodes() {
      return PUZZLE_CHAIN;
    }

    isSolved(index) {
      this.ensureLoaded();
      return this.state.solved.includes(Number(index));
    }

    getHighestUnlockedIp() {
      this.ensureLoaded();
      for (const node of PUZZLE_CHAIN) {
        if (!this.isSolved(node.index)) return node.ip;
      }
      return PUZZLE_CHAIN[PUZZLE_CHAIN.length - 1].ip;
    }

    clickLightsOutCell(r, c, nodeIndex = 1) {
      const dirs = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];
      dirs.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
          this.lightsGrid[nr][nc] = this.lightsGrid[nr][nc] ? 0 : 1;
        }
      });

      const allLit = this.lightsGrid.every((row) => row.every((v) => v === 1));
      if (allLit) {
        this.markSolved(nodeIndex);
      }
      if (window.internetEngine) window.internetEngine.render();
      return { allLit };
    }

    resetLightsOut() {
      this.lightsGrid = [
        [1, 0, 1],
        [0, 0, 0],
        [1, 0, 1]
      ];
      if (window.internetEngine) window.internetEngine.render();
    }

    refreshCurrentView() {
      if (window.internetEngine) window.internetEngine.render();
    }

    submitRiddleAnswer(nodeIndex, rawAnswer) {
      this.ensureLoaded();
      const node = PUZZLE_CHAIN.find((n) => n.index === Number(nodeIndex));
      if (!node) return { success: false, message: 'Enigma inválido.' };

      const clean = String(rawAnswer || '').trim().toLowerCase();
      const expected = String(node.expectedAnswer || node.fallbackAnswer || '').toLowerCase();
      if (!clean || clean !== expected) {
        if (window.hackerAudio && typeof window.hackerAudio.playErrorBuzz === 'function') {
          window.hackerAudio.playErrorBuzz();
        }
        return { success: false, message: `Resposta incorreta! Dica: ${node.hint || 'Analise os bytes com atenção.'}` };
      }

      return this.markSolved(node.index);
    }

    markSolved(nodeIndex) {
      this.ensureLoaded();
      const node = PUZZLE_CHAIN.find((n) => n.index === Number(nodeIndex));
      if (!node) return { success: false };

      if (!this.isSolved(node.index)) {
        this.state.solved.push(node.index);
        this.save();

        if (window.currentProfile) {
          window.currentProfile.reputation = (window.currentProfile.reputation || 0) + node.rewardRep;
        }
        if (typeof window.addLocalLog === 'function') {
          window.addLocalLog('PUZZLE-OK', `Enigma #${node.index} resolvido! Próximo IP revelado: ${node.nextIp} (+${node.rewardRep} REP)`, 'success');
        }
        if (window.hackerAudio) window.hackerAudio.playCashChime();
        if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      }

      if (typeof window.showToast === 'function') {
        window.showToast(`Enigma #${node.index} resolvido! Próximo servidor: ${node.nextIp} (invada este IP p/ baixar software grátis!).`);
      }
      if (window.internetEngine) window.internetEngine.render();
      return { success: true, nextIp: node.nextIp };
    }

    renderPuzzlePublicPage(node) {
      this.ensureLoaded();
      const solved = this.isSolved(node.index);
      const prevSolved = node.index === 1 || this.isSolved(node.index - 1);

      if (!prevSolved) {
        return `
          <div class="hc-card" style="padding:1.25rem;border-color:var(--hc-warning);">
            <span class="hc-badge warn">Trilha Bloqueada</span>
            <h3 style="margin:8px 0 4px;">Resolva primeiro o Enigma #${node.index - 1}!</h3>
            <p style="font-size:0.84rem;color:var(--hc-text-2);margin-bottom:10px;">A Trilha de Enigmas exige progressão sequencial para destravar as chaves criptográficas.</p>
            <button type="button" class="hc-btn primary sm" onclick="window.internetEngine.navigate('${esc(this.getHighestUnlockedIp())}')">Ir para meu Enigma Atual →</button>
          </div>
        `;
      }

      const solvedBanner = solved
        ? `<div class="hc-card" style="padding:1rem 1.15rem;margin-bottom:12px;border-color:var(--hc-accent);background:rgba(53,184,119,0.09);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
             <div>
               <span class="hc-badge success">ENIGMA #${node.index} RESOLVIDO</span>
               <div style="font-size:0.84rem;margin-top:4px;">
                 Destravado no HD deste servidor: <strong style="color:var(--hc-accent-text);">${esc(node.rewardLabel || '')}</strong>
                 · Próximo IP: <code style="font-family:var(--hc-font-mono);">${esc(node.nextIp)}</code>
               </div>
               <div style="font-size:0.78rem;color:var(--hc-text-2);margin-top:2px;">
                 Invada este servidor na aba <strong>Invadir</strong> → <strong>Vírus, Carteira &amp; Arquivos</strong> para baixar seus vírus/softwares básicos!
               </div>
             </div>
             <div style="display:flex;gap:8px;flex-wrap:wrap;">
               <button type="button" id="btnInvadeThisPuzzle" class="hc-btn sm" style="border-color:var(--hc-accent);color:var(--hc-accent-text);" onclick="window.internetEngine.switchTab('invadir')">⬇ Invadir p/ Baixar Softwares</button>
               <button type="button" id="btnNextPuzzleIp" class="hc-btn primary sm" onclick="window.internetEngine.navigate('${esc(node.nextIp)}')">Ir p/ Próximo IP (${esc(node.nextIp)}) →</button>
             </div>
           </div>`
        : '';

      let interactiveHtml = '';
      if (node.kind === 'minesweeper' && window.MinesweeperEngine) {
        if (!window.activeMinesweeper || window.activeMinesweeper.nodeIndex !== node.index) {
          window.activeMinesweeper = new window.MinesweeperEngine(node.rows || 5, node.cols || 5, node.mineCount || 3, () => {
            this.markSolved(node.index);
          });
          window.activeMinesweeper.nodeIndex = node.index;
        }
        interactiveHtml = `
          <div style="margin-top:14px;">
            ${window.activeMinesweeper.renderHtml()}
            <div style="display:flex;gap:8px;margin-top:10px;justify-content:center;">
              <input type="text" id="riddleAnsInput_${node.index}" class="form-input" placeholder="Bypass de emergência..." style="max-width:180px;font-family:var(--hc-font-mono);">
              <button type="button" class="hc-btn sm" onclick="window.handleRiddleSubmit(${node.index})">Submeter Chave</button>
            </div>
          </div>
        `;
      } else if (node.kind === 'hex_sudoku' && window.HexSudokuEngine) {
        if (!window.activeSudoku || window.activeSudoku.nodeIndex !== node.index) {
          window.activeSudoku = new window.HexSudokuEngine(() => {
            this.markSolved(node.index);
          });
          window.activeSudoku.nodeIndex = node.index;
        }
        interactiveHtml = `
          <div style="margin-top:14px;">
            ${window.activeSudoku.renderHtml()}
            <div style="display:flex;gap:8px;margin-top:10px;justify-content:center;">
              <input type="text" id="riddleAnsInput_${node.index}" class="form-input" placeholder="Bypass de emergência..." style="max-width:180px;font-family:var(--hc-font-mono);">
              <button type="button" class="hc-btn sm" onclick="window.handleRiddleSubmit(${node.index})">Submeter Chave</button>
            </div>
          </div>
        `;
      } else if (node.kind === 'buffer_2048' && window.BufferMerge2048Engine) {
        if (!window.active2048 || window.active2048.nodeIndex !== node.index) {
          window.active2048 = new window.BufferMerge2048Engine(node.targetVal || 64, () => {
            this.markSolved(node.index);
          });
          window.active2048.nodeIndex = node.index;
        }
        interactiveHtml = `
          <div style="margin-top:14px;">
            ${window.active2048.renderHtml()}
            <div style="display:flex;gap:8px;margin-top:10px;justify-content:center;">
              <input type="text" id="riddleAnsInput_${node.index}" class="form-input" placeholder="Bypass de emergência..." style="max-width:180px;font-family:var(--hc-font-mono);">
              <button type="button" class="hc-btn sm" onclick="window.handleRiddleSubmit(${node.index})">Submeter Chave</button>
            </div>
          </div>
        `;
      } else if (node.kind === 'neural_ttt' && window.NeuralTicTacToeEngine) {
        if (!window.activeTicTacToe || window.activeTicTacToe.nodeIndex !== node.index) {
          window.activeTicTacToe = new window.NeuralTicTacToeEngine(() => {
            this.markSolved(node.index);
          });
          window.activeTicTacToe.nodeIndex = node.index;
        }
        interactiveHtml = `
          <div style="margin-top:14px;">
            ${window.activeTicTacToe.renderHtml()}
            <div style="display:flex;gap:8px;margin-top:10px;justify-content:center;">
              <input type="text" id="riddleAnsInput_${node.index}" class="form-input" placeholder="Bypass de emergência..." style="max-width:180px;font-family:var(--hc-font-mono);">
              <button type="button" class="hc-btn sm" onclick="window.handleRiddleSubmit(${node.index})">Submeter Chave</button>
            </div>
          </div>
        `;
      } else if (node.kind === 'lightsout') {
        const cells = [];
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const lit = this.lightsGrid[r][c] === 1;
            cells.push(`
              <button type="button" id="lightsCell_${r}_${c}" onclick="window.puzzleTrailEngine.clickLightsOutCell(${r}, ${c}, ${node.index})" style="width:58px;height:58px;border-radius:8px;cursor:pointer;border:1px solid ${lit ? 'var(--hc-accent)' : 'var(--hc-border-strong)'};background:${lit ? 'rgba(53,184,119,0.32)' : 'var(--hc-inset)'};color:${lit ? '#fff' : 'var(--hc-text-3)'};font-family:var(--hc-font-mono);font-weight:700;font-size:0.9rem;">
                ${lit ? 'ON' : 'OFF'}
              </button>
            `);
          }
        }
        interactiveHtml = `
          <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;margin-top:10px;">
            <div style="display:grid;grid-template-columns:repeat(3,58px);gap:8px;">${cells.join('')}</div>
            <div style="flex:1;min-width:220px;">
              <div style="font-size:0.8rem;color:var(--hc-text-2);margin-bottom:8px;">Acenda os 9 blocos (ou insira o código universal da resposta para a vida, o universo e tudo mais):</div>
              <div style="display:flex;gap:8px;">
                <input type="text" id="riddleAnsInput_${node.index}" class="form-input" placeholder="Código alternativo..." style="max-width:170px;font-family:var(--hc-font-mono);">
                <button type="button" class="hc-btn sm" onclick="window.handleRiddleSubmit(${node.index})">Validar</button>
                <button type="button" class="hc-btn ghost sm" onclick="window.puzzleTrailEngine.resetLightsOut()">Resetar Grade</button>
              </div>
            </div>
          </div>
        `;
      } else {
        interactiveHtml = `
          <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
            <input type="text" id="riddleAnsInput_${node.index}" class="form-input" style="max-width:280px;font-family:var(--hc-font-mono);" placeholder="Digite sua resposta..." onkeydown="if(event.key==='Enter') window.handleRiddleSubmit(${node.index})">
            <button type="button" id="btnSubmitRiddle_${node.index}" class="hc-btn primary" onclick="window.handleRiddleSubmit(${node.index})">Submeter Resposta</button>
          </div>
          <div style="font-size:0.75rem;color:var(--hc-text-3);margin-top:6px;">Dica criptográfica: ${esc(node.hint || '')}</div>
        `;
      }

      return `
        <div>
          ${solvedBanner}
          <div class="hc-card" style="padding:1.25rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:6px;">
              <div class="hc-eyebrow">Trilha Oficial de Enigmas (${this.state.solved.length} / ${PUZZLE_CHAIN.length} resolvidos)</div>
              <span class="hc-badge info">+${node.rewardRep} REP · Libera no HD: ${esc(node.rewardLabel || '')}</span>
            </div>
            <h3 style="font-size:1.05rem;margin-bottom:6px;">${esc(node.title)}</h3>
            <pre style="white-space:pre-wrap;font-family:var(--hc-font-mono);font-size:0.83rem;background:var(--hc-inset);border:1px solid var(--hc-border);padding:0.85rem;border-radius:7px;color:var(--hc-text);margin:0;">${esc(node.prompt)}</pre>
            ${interactiveHtml}
          </div>
        </div>
      `;
    }
  }

  window.taskManager = new TaskManagerEngine();
  window.attackMinigame = new AttackMinigameEngine();
  window.puzzleTrailEngine = new PuzzleTrailEngine();

  window.handleRiddleSubmit = function (idx) {
    const val = document.getElementById(`riddleAnsInput_${idx}`)?.value;
    const res = window.puzzleTrailEngine.submitRiddleAnswer(idx, val);
    if (!res.success) alert(res.message);
    return res;
  };
})();
