/**
 * Hacker City // Pilar 3: Motores dos 5 Minijogos Clássicos Autênticos
 * 1. MinesweeperEngine      — Campo Minado Forense (Desarme de Blocos de RAM)
 * 2. LightsOutEngine        — Alternador de Relés de Rede Matriz
 * 3. HexSudokuEngine        — Sudoku Hexadecimal 4x4 Criptográfico
 * 4. BufferMerge2048Engine  — 2048 Algorítmico de Fusão de Pacotes
 * 5. NeuralTicTacToeEngine  — Jogo da Velha Quântico contra Minimax da Safenet
 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // =========================================================================
  // 1. MINESWEEPER FORENSE (DESARME DE RAM SEM CORROMPER KERNEL)
  // =========================================================================
  class MinesweeperEngine {
    constructor(rows = 5, cols = 5, mineCount = 4, onWin = null) {
      this.rows = rows;
      this.cols = cols;
      this.mineCount = mineCount;
      this.onWin = onWin;
      this.board = [];
      this.revealed = [];
      this.flagged = [];
      this.gameOver = false;
      this.won = false;
      this.initBoard();
    }

    initBoard() {
      this.board = Array(this.rows).fill(0).map(() => Array(this.cols).fill(0));
      this.revealed = Array(this.rows).fill(false).map(() => Array(this.cols).fill(false));
      this.flagged = Array(this.rows).fill(false).map(() => Array(this.cols).fill(false));
      this.gameOver = false;
      this.won = false;

      // Aloca minas aleatoriamente
      let placed = 0;
      while (placed < this.mineCount) {
        const r = Math.floor(Math.random() * this.rows);
        const c = Math.floor(Math.random() * this.cols);
        // Nunca coloca mina na célula central inicial
        if (r === Math.floor(this.rows / 2) && c === Math.floor(this.cols / 2)) continue;
        if (this.board[r][c] !== 'M') {
          this.board[r][c] = 'M';
          placed++;
        }
      }

      // Calcula números vizinhos
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.board[r][c] === 'M') continue;
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.board[nr][nc] === 'M') {
                count++;
              }
            }
          }
          this.board[r][c] = count;
        }
      }
    }

    reveal(r, c) {
      if (this.gameOver || this.revealed[r][c] || this.flagged[r][c]) return;
      this.revealed[r][c] = true;

      if (this.board[r][c] === 'M') {
        this.gameOver = true;
        if (window.audioEngine && typeof window.audioEngine.playErrorBuzz === 'function') {
          window.audioEngine.playErrorBuzz();
        }
        return { hitMine: true };
      }

      if (window.audioEngine && typeof window.audioEngine.playKeyClick === 'function') {
        window.audioEngine.playKeyClick();
      }

      // Expansão em cascata se zero
      if (this.board[r][c] === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && !this.revealed[nr][nc]) {
              this.reveal(nr, nc);
            }
          }
        }
      }

      this.checkWinCondition();
      return { hitMine: false, won: this.won };
    }

    toggleFlag(r, c) {
      if (this.gameOver || this.revealed[r][c]) return;
      this.flagged[r][c] = !this.flagged[r][c];
      if (window.audioEngine && typeof window.audioEngine.playKeyClick === 'function') {
        window.audioEngine.playKeyClick();
      }
    }

    checkWinCondition() {
      let unrevealedSafe = 0;
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.board[r][c] !== 'M' && !this.revealed[r][c]) {
            unrevealedSafe++;
          }
        }
      }
      if (unrevealedSafe === 0) {
        this.won = true;
        this.gameOver = true;
        if (typeof this.onWin === 'function') this.onWin();
      }
    }

    renderHtml(containerId = 'minesweeper-box') {
      const gridHtml = this.board.map((row, r) => `
        <div style="display:flex;gap:4px;justify-content:center;">
          ${row.map((val, c) => {
            const isRev = this.revealed[r][c];
            const isFlag = this.flagged[r][c];
            let cellContent = '■';
            let cellBg = '#141d2b';
            let cellColor = '#475569';

            if (isRev) {
              cellBg = '#1e293b';
              if (val === 'M') {
                cellContent = '💥';
                cellBg = '#7f1d1d';
              } else if (val === 0) {
                cellContent = ' ';
              } else {
                cellContent = val;
                cellColor = val === 1 ? '#38bdf8' : (val === 2 ? '#35b877' : '#f59e0b');
              }
            } else if (isFlag) {
              cellContent = '🚩';
              cellColor = '#ef4444';
            }

            return `
              <button type="button"
                id="mineCell_${r}_${c}"
                onclick="window.activeMinesweeper.reveal(${r}, ${c}); window.puzzleTrailEngine.refreshCurrentView();"
                oncontextmenu="event.preventDefault(); window.activeMinesweeper.toggleFlag(${r}, ${c}); window.puzzleTrailEngine.refreshCurrentView();"
                style="width:44px;height:44px;border:1px solid #334155;border-radius:6px;background:${cellBg};color:${cellColor};font-family:monospace;font-size:0.95rem;font-weight:bold;cursor:pointer;">
                ${cellContent}
              </button>
            `;
          }).join('')}
        </div>
      `).join('');

      let statusMsg = this.won
        ? '<div style="color:#35b877;font-weight:bold;margin-top:8px;">✅ Memória Mapeada sem Falhas! Kernel Desbloqueado!</div>'
        : (this.gameOver
            ? '<div style="color:#ef4444;font-weight:bold;margin-top:8px;">💥 Setor Corrompido Atingido! <button type="button" class="hc-btn ghost sm" onclick="window.activeMinesweeper.initBoard();window.puzzleTrailEngine.refreshCurrentView();">Tentar Novamente</button></div>'
            : '<div style="font-size:0.8rem;color:#94a3b8;margin-top:8px;">Botão Esquerdo: Revelar Bloco · Botão Direito / Segurar: Bandeira 🚩</div>');

      return `
        <div style="background:#0c1017;border:1px solid #243144;border-radius:8px;padding:16px;text-align:center;">
          <div style="font-size:0.82rem;color:#38bdf8;margin-bottom:12px;font-family:monospace;">
            SETOR DE RAM // ${this.mineCount} ARMADILHAS DE KERNEL ATIVAS
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            ${gridHtml}
          </div>
          ${statusMsg}
        </div>
      `;
    }
  }

  // =========================================================================
  // 2. CRIPTO SUDOKU HEXADECIMAL 4x4 (SEM REPETIÇÃO)
  // =========================================================================
  class HexSudokuEngine {
    constructor(onWin = null) {
      this.onWin = onWin;
      this.solution = [
        ['1', '2', '3', '4'],
        ['3', '4', '1', '2'],
        ['2', '1', '4', '3'],
        ['4', '3', '2', '1']
      ];
      // Pistas iniciais fixas, jogador deve preencher os vazios
      this.board = [
        ['1', '', '3', ''],
        ['', '4', '', '2'],
        ['2', '', '4', ''],
        ['', '3', '', '1']
      ];
      this.fixed = [
        [true, false, true, false],
        [false, true, false, true],
        [true, false, true, false],
        [false, true, false, true]
      ];
      this.won = false;
    }

    setDigit(r, c, val) {
      if (this.fixed[r][c] || this.won) return;
      val = String(val || '').trim();
      if (!['1', '2', '3', '4', ''].includes(val)) return;
      this.board[r][c] = val;

      if (window.audioEngine && typeof window.audioEngine.playKeyClick === 'function') {
        window.audioEngine.playKeyClick();
      }

      this.checkWin();
    }

    checkWin() {
      // Verifica se todas as células estão cheias e batem com a solução
      let complete = true;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (this.board[r][c] !== this.solution[r][c]) {
            complete = false;
            break;
          }
        }
      }
      if (complete) {
        this.won = true;
        if (typeof this.onWin === 'function') this.onWin();
      }
    }

    renderHtml() {
      const grid = this.board.map((row, r) => `
        <div style="display:flex;gap:6px;justify-content:center;">
          ${row.map((val, c) => {
            const isFix = this.fixed[r][c];
            if (isFix) {
              return `
                <div style="width:48px;height:48px;background:#1e293b;border:1px solid #475569;border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:1.1rem;font-weight:bold;color:#38bdf8;">
                  ${val}
                </div>
              `;
            }
            return `
              <input type="text" maxlength="1" value="${val}"
                id="sudokuInput_${r}_${c}"
                oninput="window.activeSudoku.setDigit(${r}, ${c}, this.value); window.puzzleTrailEngine.refreshCurrentView();"
                style="width:48px;height:48px;background:#0b111a;border:1px solid #3b82f6;border-radius:6px;text-align:center;font-family:monospace;font-size:1.1rem;font-weight:bold;color:#35b877;outline:none;">
            `;
          }).join('')}
        </div>
      `).join('');

      let statusMsg = this.won
        ? '<div style="color:#35b877;font-weight:bold;margin-top:10px;">✅ Matriz Hexadecimal Alinhada! Criptograma Resolvido!</div>'
        : '<div style="font-size:0.8rem;color:#94a3b8;margin-top:10px;">Preencha os números 1, 2, 3 e 4 sem repetir em nenhuma linha, coluna ou bloco 2x2.</div>';

      return `
        <div style="background:#0c1017;border:1px solid #243144;border-radius:8px;padding:16px;text-align:center;">
          <div style="font-size:0.82rem;color:#a855f7;margin-bottom:12px;font-family:monospace;">
            REGISTRO CRIPTOGRÁFICO 4x4 // HEX SUDOKU
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            ${grid}
          </div>
          ${statusMsg}
        </div>
      `;
    }
  }

  // =========================================================================
  // 3. BUFFER MERGE 2048 (FUSÃO BINÁRIA DE PACOTES DE REDE)
  // =========================================================================
  class BufferMerge2048Engine {
    constructor(targetVal = 64, onWin = null) {
      this.targetVal = targetVal; // Meta: 64KB, 128KB ou 256KB
      this.onWin = onWin;
      this.grid = Array(4).fill(0).map(() => Array(4).fill(0));
      this.score = 0;
      this.won = false;
      this.initGame();
    }

    initGame() {
      this.grid = Array(4).fill(0).map(() => Array(4).fill(0));
      this.score = 0;
      this.won = false;
      this.addRandomTile();
      this.addRandomTile();
    }

    addRandomTile() {
      const empty = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (this.grid[r][c] === 0) empty.push({ r, c });
        }
      }
      if (empty.length > 0) {
        const pick = empty[Math.floor(Math.random() * empty.length)];
        this.grid[pick.r][pick.c] = Math.random() < 0.85 ? 2 : 4;
      }
    }

    move(dir) {
      if (this.won) return;
      let moved = false;

      const slide = (row) => {
        let arr = row.filter((v) => v !== 0);
        for (let i = 0; i < arr.length - 1; i++) {
          if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            this.score += arr[i];
            if (arr[i] >= this.targetVal) {
              this.won = true;
              if (typeof this.onWin === 'function') this.onWin();
            }
            arr.splice(i + 1, 1);
          }
        }
        while (arr.length < 4) arr.push(0);
        return arr;
      };

      if (dir === 'left') {
        for (let r = 0; r < 4; r++) {
          const old = [...this.grid[r]];
          this.grid[r] = slide(this.grid[r]);
          if (old.some((v, i) => v !== this.grid[r][i])) moved = true;
        }
      } else if (dir === 'right') {
        for (let r = 0; r < 4; r++) {
          const old = [...this.grid[r]];
          let rev = [...this.grid[r]].reverse();
          this.grid[r] = slide(rev).reverse();
          if (old.some((v, i) => v !== this.grid[r][i])) moved = true;
        }
      } else if (dir === 'up') {
        for (let c = 0; c < 4; c++) {
          let col = [this.grid[0][c], this.grid[1][c], this.grid[2][c], this.grid[3][c]];
          let sl = slide(col);
          for (let r = 0; r < 4; r++) {
            if (this.grid[r][c] !== sl[r]) moved = true;
            this.grid[r][c] = sl[r];
          }
        }
      } else if (dir === 'down') {
        for (let c = 0; c < 4; c++) {
          let col = [this.grid[3][c], this.grid[2][c], this.grid[1][c], this.grid[0][c]];
          let sl = slide(col).reverse();
          for (let r = 0; r < 4; r++) {
            if (this.grid[r][c] !== sl[r]) moved = true;
            this.grid[r][c] = sl[r];
          }
        }
      }

      if (moved) {
        this.addRandomTile();
        if (window.audioEngine && typeof window.audioEngine.playKeyClick === 'function') {
          window.audioEngine.playKeyClick();
        }
      }
    }

    renderHtml() {
      const colors = {
        0: { bg: '#0b111a', text: '#334155' },
        2: { bg: '#1e293b', text: '#cbd5e1' },
        4: { bg: '#1e3a5f', text: '#38bdf8' },
        8: { bg: '#064e3b', text: '#35b877' },
        16: { bg: '#854d0e', text: '#f59e0b' },
        32: { bg: '#7f1d1d', text: '#f87171' },
        64: { bg: '#581c87', text: '#c084fc' },
        128: { bg: '#831843', text: '#f472b6' },
        256: { bg: '#e11d48', text: '#ffffff' }
      };

      const gridHtml = this.grid.map((row) => `
        <div style="display:flex;gap:6px;justify-content:center;">
          ${row.map((v) => {
            const c = colors[v] || { bg: '#2563eb', text: '#fff' };
            return `
              <div style="width:48px;height:48px;background:${c.bg};color:${c.text};border:1px solid #334155;border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:0.92rem;font-weight:bold;">
                ${v > 0 ? v + 'K' : ''}
              </div>
            `;
          }).join('')}
        </div>
      `).join('');

      let statusMsg = this.won
        ? `<div style="color:#35b877;font-weight:bold;margin-top:10px;">✅ Pacote de ${this.targetVal}KB Compilado com Sucesso!</div>`
        : `<div style="font-size:0.8rem;color:#94a3b8;margin-top:10px;">Funda pacotes iguais até compilar um bloco de <strong>${this.targetVal}KB</strong>!</div>`;

      return `
        <div style="background:#0c1017;border:1px solid #243144;border-radius:8px;padding:16px;text-align:center;">
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:0.82rem;font-family:monospace;color:#38bdf8;">
            <span>BUFFER FUSION // 2048</span>
            <span>Meta: <strong>${this.targetVal}KB</strong> | Score: ${this.score}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            ${gridHtml}
          </div>
          <div style="display:flex;justify-content:center;gap:8px;margin-top:12px;">
            <button type="button" class="hc-btn ghost sm" onclick="window.active2048.move('up'); window.puzzleTrailEngine.refreshCurrentView();">⬆️</button>
            <button type="button" class="hc-btn ghost sm" onclick="window.active2048.move('left'); window.puzzleTrailEngine.refreshCurrentView();">⬅️</button>
            <button type="button" class="hc-btn ghost sm" onclick="window.active2048.move('down'); window.puzzleTrailEngine.refreshCurrentView();">⬇️</button>
            <button type="button" class="hc-btn ghost sm" onclick="window.active2048.move('right'); window.puzzleTrailEngine.refreshCurrentView();">➡️</button>
          </div>
          ${statusMsg}
        </div>
      `;
    }
  }

  // =========================================================================
  // 4. JOGO DA VELHA NEURAL QUÂNTICO (VS MINIMAX SAFENET AI)
  // =========================================================================
  class NeuralTicTacToeEngine {
    constructor(onWin = null) {
      this.onWin = onWin;
      this.board = Array(9).fill('');
      this.playerWins = 0;
      this.draws = 0;
      this.currentRound = 1;
      this.gameOver = false;
      this.won = false;
    }

    play(idx) {
      if (this.gameOver || this.board[idx] !== '' || this.won) return;
      this.board[idx] = 'X'; // Jogador é X

      if (window.audioEngine && typeof window.audioEngine.playKeyClick === 'function') {
        window.audioEngine.playKeyClick();
      }

      if (this.checkWinner('X')) {
        this.playerWins++;
        this.advanceRound('Vitória do Jogador!');
        return;
      }

      if (this.isFull()) {
        this.draws++;
        this.advanceRound('Empate Tático!');
        return;
      }

      // Turno da IA (Minimax)
      this.aiMove();
    }

    aiMove() {
      // IA procura vitória imediata, bloqueio, ou centro
      const best = this.findBestMove();
      if (best !== -1) {
        this.board[best] = 'O';
      }

      if (this.checkWinner('O')) {
        this.advanceRound('A IA da Safenet venceu esta rodada!');
      } else if (this.isFull()) {
        this.draws++;
        this.advanceRound('Empate Tático!');
      }
    }

    findBestMove() {
      // 1. Ganhar se possível
      for (let i = 0; i < 9; i++) {
        if (this.board[i] === '') {
          this.board[i] = 'O';
          if (this.checkWinner('O')) return i;
          this.board[i] = '';
        }
      }
      // 2. Bloquear jogador
      for (let i = 0; i < 9; i++) {
        if (this.board[i] === '') {
          this.board[i] = 'X';
          if (this.checkWinner('X')) {
            this.board[i] = '';
            return i;
          }
          this.board[i] = '';
        }
      }
      // 3. Centro
      if (this.board[4] === '') return 4;
      // 4. Primeiro livre
      return this.board.findIndex((v) => v === '');
    }

    checkWinner(p) {
      const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];
      return wins.some(([a, b, c]) => this.board[a] === p && this.board[b] === p && this.board[c] === p);
    }

    isFull() {
      return this.board.every((v) => v !== '');
    }

    advanceRound(resultMsg) {
      this.gameOver = true;
      if (this.playerWins >= 1 || (this.playerWins + this.draws) >= 2) {
        this.won = true;
        if (typeof this.onWin === 'function') this.onWin();
      }
    }

    resetBoard() {
      this.board = Array(9).fill('');
      this.gameOver = false;
      this.currentRound++;
    }

    renderHtml() {
      const cells = this.board.map((v, i) => `
        <button type="button"
          id="tttCell_${i}"
          onclick="window.activeTicTacToe.play(${i}); window.puzzleTrailEngine.refreshCurrentView();"
          style="width:58px;height:58px;border:1px solid #334155;border-radius:6px;background:#0f172a;color:${v === 'X' ? '#38bdf8' : '#ef4444'};font-family:monospace;font-size:1.4rem;font-weight:bold;cursor:pointer;">
          ${v}
        </button>
      `).join('');

      let statusMsg = this.won
        ? '<div style="color:#35b877;font-weight:bold;margin-top:10px;">✅ Algoritmo Minimax Superado/Contido! Desafio Quântico Concluído!</div>'
        : (this.gameOver
            ? `<div style="margin-top:10px;">Rodada Encerrada! <button type="button" class="hc-btn ghost sm" onclick="window.activeTicTacToe.resetBoard(); window.puzzleTrailEngine.refreshCurrentView();">Próxima Rodada</button></div>`
            : '<div style="font-size:0.8rem;color:#94a3b8;margin-top:10px;">Jogue como [X]. Consiga pelo menos 1 vitória ou 2 empates táticos contra a IA para passar!</div>');

      return `
        <div style="background:#0c1017;border:1px solid #243144;border-radius:8px;padding:16px;text-align:center;">
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:0.82rem;font-family:monospace;color:#f59e0b;">
            <span>NEURAL TIC-TAC-TOE // SAFENET AI</span>
            <span>Vitórias: ${this.playerWins} | Empates: ${this.draws}</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3, 58px);gap:6px;justify-content:center;">
            ${cells}
          </div>
          ${statusMsg}
        </div>
      `;
    }
  }

  // Exporta globalmente
  window.MinesweeperEngine = MinesweeperEngine;
  window.HexSudokuEngine = HexSudokuEngine;
  window.BufferMerge2048Engine = BufferMerge2048Engine;
  window.NeuralTicTacToeEngine = NeuralTicTacToeEngine;
})();
