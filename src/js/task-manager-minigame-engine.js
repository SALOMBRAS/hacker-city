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
    return `${h}h:${String(m).padStart(2, '0')}m:${String(rem).padStart(2, '0')}s`;
  }

  // =========================================================================
  // 1. TASK MANAGER ENGINE (DIVISÃO REAL DE CPU & REDE + WIDGET FLUTUANTE)
  // =========================================================================
  class TaskManagerEngine {
    constructor() {
      this.processes = [];
      this.activeFilter = 'all'; // 'all' | 'cpu' | 'net' | 'running'
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
      // Impedir duplicata idêntica rodando ao mesmo tempo (igual a Process::newProcess do HE Legacy)
      if (opts.dedupeKey) {
        const dup = this.processes.find((p) => p.status === 'running' && p.dedupeKey === opts.dedupeKey);
        if (dup) {
          return { started: false, duplicate: true, process: dup, message: `Já existe "${dup.title}" em execução no Task Manager!` };
        }
      }

      const workTotal = Math.max(1.2, Number(opts.idealSeconds || 6));
      const proc = {
        pid: this.nextPid++,
        dedupeKey: opts.dedupeKey || null,
        title: opts.title || 'Processo do Sistema',
        subtitle: opts.subtitle || 'CPU · Localhost',
        targetIp: opts.targetIp || 'localhost',
        queueKind: opts.queueKind === 'net' ? 'net' : 'cpu',
        category: opts.category || 'Sistema',
        workTotal,
        workDone: 0,
        status: 'running',
        boostedByMinigame: false,
        createdAt: Date.now(),
        onComplete: typeof opts.onComplete === 'function' ? opts.onComplete : null,
        onCancel: typeof opts.onCancel === 'function' ? opts.onCancel : null
      };

      this.processes.unshift(proc);
      if (this.processes.length > 30) {
        this.processes = this.processes.filter((p) => p.status === 'running').concat(
          this.processes.filter((p) => p.status !== 'running').slice(0, 12)
        );
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
      if (proc.status === 'running') {
        proc.status = 'cancelled';
        if (proc.onCancel) {
          try { proc.onCancel(proc); } catch (e) {}
        }
      }
      this.processes.splice(idx, 1);
      this.syncWidgets();
      this.renderUI();
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
      this.syncWidgets();
      if (window.winManager && window.winManager.current === 'winTaskManager') {
        this.renderUI();
      }
    }

    startSchedulerLoop() {
      const TICK_MS = 250;
      const dt = TICK_MS / 1000;
      setInterval(() => {
        const cpuRunning = this.getRunningByKind('cpu');
        const netRunning = this.getRunningByKind('net');
        if (cpuRunning.length === 0 && netRunning.length === 0) return;

        // Divisão exata da fila: N tarefas na mesma fila recebem 1/N do recurso!
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
        if (window.attackMinigame && window.attackMinigame.activePid) {
          window.attackMinigame.refreshTimerDisplay();
        }
      }, TICK_MS);
    }

    getProcessTelemetry(proc) {
      if (proc.status !== 'running') {
        return { pct: 100, sharePct: 0, etaSec: 0 };
      }
      const sameQueue = this.getRunningByKind(proc.queueKind);
      const count = Math.max(1, sameQueue.length);
      const sharePct = Math.round(100 / count);
      const pct = Math.min(99, Math.round((proc.workDone / proc.workTotal) * 100));
      const etaSec = (proc.workTotal - proc.workDone) * count;
      return { pct, sharePct, etaSec };
    }

    syncWidgets() {
      const running = this.getRunningAll();
      const navBadge = document.getElementById('navTaskCountBadge');
      if (navBadge) {
        navBadge.textContent = String(running.length);
        navBadge.style.display = running.length > 0 ? 'inline-flex' : 'none';
      }

      let pill = document.getElementById('floatingProcessWidget');
      if (!pill && document.getElementById('desktopEnvironment')) {
        pill = document.createElement('div');
        pill.id = 'floatingProcessWidget';
        pill.style.cssText = 'position:fixed;right:20px;bottom:16px;z-index:850;display:none;';
        document.body.appendChild(pill);
      }
      if (!pill) return;

      const desk = document.getElementById('desktopEnvironment');
      const isLogged = desk && desk.style.display !== 'none';
      if (!isLogged || running.length === 0) {
        pill.style.display = 'none';
        return;
      }

      pill.style.display = 'block';
      const drawerRows = this.drawerOpen
        ? `<div style="background:var(--hc-surface);border:1px solid var(--hc-border-strong);border-radius:10px;padding:10px 12px;margin-bottom:8px;width:340px;box-shadow:0 12px 32px rgba(0,0,0,0.45);">
             <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
               <strong style="font-size:0.8rem;">Processos em Execução (${running.length})</strong>
               <button type="button" class="hc-btn ghost sm" style="padding:2px 7px;font-size:0.72rem;" onclick="navTo('winTaskManager')">Abrir Task Manager →</button>
             </div>
             ${running.slice(0, 4).map((p) => {
               const t = this.getProcessTelemetry(p);
               return `
                 <div style="padding:6px 0;border-bottom:1px solid var(--hc-border);font-size:0.76rem;">
                   <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                     <strong style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:210px;">${esc(p.title)}</strong>
                     <span style="font-family:var(--hc-font-mono);color:var(--hc-text-2);">${fmtEta(t.etaSec)}</span>
                   </div>
                   <div style="height:5px;background:var(--hc-inset);border-radius:999px;overflow:hidden;">
                     <div style="height:100%;width:${t.pct}%;background:${p.queueKind === 'net' ? '#3b82f6' : 'var(--hc-accent)'};"></div>
                   </div>
                 </div>
               `;
             }).join('')}
           </div>`
        : '';

      pill.innerHTML = `
        ${drawerRows}
        <button type="button" id="btnFloatingProcessPill" onclick="window.taskManager.drawerOpen=!window.taskManager.drawerOpen;window.taskManager.syncWidgets();" style="margin-left:auto;display:flex;align-items:center;gap:9px;background:var(--hc-surface-2);border:1px solid rgba(53,184,119,0.45);color:var(--hc-text);padding:8px 14px;border-radius:999px;cursor:pointer;font-size:0.82rem;font-weight:600;box-shadow:0 6px 20px rgba(0,0,0,0.4);">
          <span style="width:8px;height:8px;border-radius:50%;background:var(--hc-accent);display:inline-block;"></span>
          <span>${running.length} processo${running.length === 1 ? '' : 's'}</span>
          <span style="color:var(--hc-text-3);font-size:0.75rem;">${this.drawerOpen ? '▾' : '▴'}</span>
        </button>
      `;
    }

    renderUI(containerId = 'taskManagerBody') {
      const container = document.getElementById(containerId);
      if (!container) return;

      const allCount = this.processes.length;
      const cpuCount = this.getRunningByKind('cpu').length;
      const netCount = this.getRunningByKind('net').length;
      const runCount = this.getRunningAll().length;

      const filtered = this.processes.filter((p) => {
        if (this.activeFilter === 'cpu') return p.queueKind === 'cpu';
        if (this.activeFilter === 'net') return p.queueKind === 'net';
        if (this.activeFilter === 'running') return p.status === 'running';
        return true;
      });

      const catBadgeClass = (cat) => {
        if (cat === 'Ataque') return 'danger';
        if (cat === 'Camuflagem' || cat === 'Rede') return 'info';
        if (cat === 'Vírus') return 'warn';
        return 'success';
      };

      const rowsHtml = filtered.length === 0
        ? `<div style="padding:2.4rem;text-align:center;color:var(--hc-text-2);font-size:0.86rem;">
             Nenhum processo nesta fila agora. Inicie uma invasão, upload/download ou pesquisa de software para acompanhar e acelerar os processos aqui!
           </div>`
        : filtered.map((p) => {
            const t = this.getProcessTelemetry(p);
            const isNet = p.queueKind === 'net';
            const isRun = p.status === 'running';
            return `
              <div style="display:grid;grid-template-columns:minmax(220px,1.5fr) minmax(115px,0.8fr) minmax(230px,1.5fr) minmax(105px,0.7fr) minmax(95px,0.65fr) auto;gap:12px;align-items:center;padding:12px 14px;border-bottom:1px solid var(--hc-border);font-size:0.82rem;">
                <div>
                  <strong style="display:block;font-size:0.88rem;color:var(--hc-text);">${esc(p.title)}</strong>
                  <span style="font-size:0.74rem;color:var(--hc-text-3);font-family:var(--hc-font-mono);">${esc(p.subtitle)}</span>
                </div>

                <div style="font-family:var(--hc-font-mono);color:var(--hc-accent-text);cursor:pointer;" onclick="if('${esc(p.targetIp)}'!=='localhost') window.internetEngine.openIp('${esc(p.targetIp)}')">
                  ${esc(p.targetIp)}
                </div>

                <div>
                  <div style="display:flex;align-items:center;gap:10px;">
                    <div style="flex:1;height:8px;background:var(--hc-inset);border-radius:999px;overflow:hidden;">
                      <div style="height:100%;width:${t.pct}%;background:${isNet ? '#3b82f6' : 'var(--hc-accent)'};transition:width 0.2s linear;"></div>
                    </div>
                    <span style="font-family:var(--hc-font-mono);font-size:0.77rem;color:var(--hc-text-2);min-width:68px;text-align:right;">
                      ${isRun ? fmtEta(t.etaSec) : '0h:00m:00s'}
                    </span>
                  </div>
                  <div style="font-size:0.72rem;color:var(--hc-text-3);font-family:var(--hc-font-mono);margin-top:3px;">
                    ${isRun ? `${t.pct}% · ${t.sharePct}% da ${isNet ? 'banda' : 'CPU'}` : '100% · Concluído'}
                  </div>
                </div>

                <div><span class="hc-badge ${catBadgeClass(p.category)}">${esc(p.category)}</span></div>

                <div>
                  <span class="hc-badge ${isRun ? (isNet ? 'info' : 'success') : ''}">
                    ● ${isRun ? (isNet ? 'Rede' : 'Rodando') : 'Concluído'}
                  </span>
                </div>

                <div style="display:flex;gap:6px;justify-content:flex-end;">
                  ${isRun
                    ? `<button type="button" id="btnBoostProc_${p.pid}" class="hc-btn primary sm" title="Jogar minigame do cofre para cortar tempo!" onclick="window.attackMinigame.openForProcess(${p.pid})">⚡ Cortar Tempo</button>`
                    : ''}
                  <button type="button" class="hc-btn ghost sm" title="Cancelar / Remover" onclick="window.taskManager.cancelProcess(${p.pid})">✕</button>
                </div>
              </div>
            `;
          }).join('');

      container.innerHTML = `
        <div class="hc-card" style="padding:0;overflow:hidden;">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--hc-border);flex-wrap:wrap;gap:10px;">
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button type="button" class="hc-btn sm ${this.activeFilter === 'all' ? 'primary' : 'ghost'}" onclick="window.taskManager.activeFilter='all';window.taskManager.renderUI();">Todas (${allCount})</button>
              <button type="button" class="hc-btn sm ${this.activeFilter === 'cpu' ? 'primary' : 'ghost'}" onclick="window.taskManager.activeFilter='cpu';window.taskManager.renderUI();">CPU (${cpuCount})</button>
              <button type="button" class="hc-btn sm ${this.activeFilter === 'net' ? 'primary' : 'ghost'}" onclick="window.taskManager.activeFilter='net';window.taskManager.renderUI();">Download manager (${netCount})</button>
              <button type="button" class="hc-btn sm ${this.activeFilter === 'running' ? 'primary' : 'ghost'}" onclick="window.taskManager.activeFilter='running';window.taskManager.renderUI();">Rodando (${runCount})</button>
            </div>
            <button type="button" class="hc-btn ghost sm" onclick="window.taskManager.processes=window.taskManager.getRunningAll();window.taskManager.renderUI();">Limpar Concluídos</button>
          </div>

          <div style="display:grid;grid-template-columns:minmax(220px,1.5fr) minmax(115px,0.8fr) minmax(230px,1.5fr) minmax(105px,0.7fr) minmax(95px,0.65fr) auto;gap:12px;padding:9px 14px;border-bottom:1px solid var(--hc-border);font-family:var(--hc-font-mono);font-size:0.7rem;color:var(--hc-text-3);text-transform:uppercase;">
            <div>Processo</div>
            <div>Alvo</div>
            <div>Progresso</div>
            <div>Categoria</div>
            <div>Estado</div>
            <div style="text-align:right;">Ações</div>
          </div>

          ${rowsHtml}

          <div style="padding:10px 16px;background:var(--hc-inset);font-size:0.76rem;color:var(--hc-text-3);">
            ⓘ Tarefas da mesma fila dividem o recurso (CPU ou Internet) em partes iguais. Clique em <strong>⚡ Cortar Tempo</strong> para abrir o Cofre Giratório e acelerar qualquer tarefa!
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
  // 3. PUZZLE TRAIL ENGINE ("FIRST PUZZLE" 109.64.200.10 -> 7 SERVIDORES EM CADEIA!)
  // Regra Oficial: Você NÃO nasce com vírus nem compra qualquer vírus do nada!
  // Os vírus básicos (v1.0) e ferramentas táticas são baixados invadindo as máquinas da Trilha de Enigmas!
  // =========================================================================
  const PUZZLE_CHAIN = [
    {
      index: 1,
      ip: '109.64.200.10',
      hostname: 'First Puzzle // Gateway Enigma #1',
      kind: 'lightsout',
      title: 'Enigma #1 — Matriz Lights Out (3×3)',
      prompt: 'Acenda TODOS os 9 nós da matriz quântica! Clicar em uma célula inverte ela e suas vizinhas ortogonais (ou resolva decodificando a chave secundária).',
      fallbackAnswer: '42',
      nextIp: '109.64.200.22',
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
      ip: '109.64.200.22',
      hostname: 'Enigma Node #2 // Cipher Relay',
      kind: 'qa',
      title: 'Enigma #2 — Decodificação Binária ASCII',
      prompt: 'Converta os 4 bytes binários interceptados no cabeçalho SSH para texto ASCII:\n01010010 01001111 01001111 01010100',
      hint: 'São 4 letras (usuário administrador padrão do Unix).',
      expectedAnswer: 'root',
      nextIp: '109.64.200.35',
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
      ip: '109.64.200.35',
      hostname: 'Enigma Node #3 // Port Knocking',
      kind: 'qa',
      title: 'Enigma #3 — Protocolo e Porta Padrão',
      prompt: 'Qual é o número da porta TCP padrão mundialmente reservada para conexões Secure Shell (SSH)?',
      hint: 'Número inteiro de 2 dígitos.',
      expectedAnswer: '22',
      nextIp: '109.64.200.48',
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
      ip: '109.64.200.48',
      hostname: 'Enigma Node #4 // Hexadecimal Vault',
      kind: 'qa',
      title: 'Enigma #4 — Conversão Hexadecimal',
      prompt: 'Um pacote suspeito carrega o payload hexadecimal 0xFF. Qual é o valor decimal exato de 0xFF (1 byte cheio)?',
      hint: '16 × 15 + 15 (último octeto de broadcast IPv4).',
      expectedAnswer: '255',
      nextIp: '109.64.200.61',
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
      ip: '109.64.200.61',
      hostname: 'Enigma Node #5 // Cifra César Forense',
      kind: 'qa',
      title: 'Enigma #5 — Criptoanálise ROT-1 (Deslocamento -1)',
      prompt: 'Recue 1 letra no alfabeto em cada caractere de "IBDLFS" para revelar a senha mestre:',
      hint: 'I->H, B->A, D->C...',
      expectedAnswer: 'hacker',
      nextIp: '109.64.200.77',
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
      ip: '109.64.200.77',
      hostname: 'Enigma Node #6 // Sub-Rede Bancária',
      kind: 'qa',
      title: 'Enigma #6 — Máscara de Sub-Rede (/24)',
      prompt: 'Quantos endereços IPv4 totais (incluindo rede e broadcast) existem em um bloco CIDR /24 (2 elevado a 8)?',
      hint: '2^8.',
      expectedAnswer: '256',
      nextIp: '109.64.200.88',
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
      ip: '109.64.200.88',
      hostname: 'Sanctum Omega // Enigma Final #7',
      kind: 'qa',
      title: 'Enigma #7 — Protocolo HyperText (HTTP)',
      prompt: 'Qual é o número da porta TCP padrão utilizada por servidores Web HTTP não criptografados (WebServer.exe)?',
      hint: 'Porta clássica de 2 dígitos da World Wide Web.',
      expectedAnswer: '80',
      nextIp: '71.4.20.1',
      rewardLabel: 'Firewall.fwl v2.5 + Hasher.hash v2.5 + Hider.hdr v2.5',
      rewardSoftwares: [
        { softKey: 'firewall', versionInt: 25 },
        { softKey: 'hasher', versionInt: 25 },
        { softKey: 'hider', versionInt: 25 }
      ],
      rewardSoftKey: 'firewall',
      rewardSoftVer: 25,
      rewardRep: 150
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
      if (node.kind === 'lightsout') {
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
