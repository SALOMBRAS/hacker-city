const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('--- TESTE E2E FASE 2: 20 PUZZLES & CONTRATOS PROCEDURAIS INFINITOS ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('[BROWSER ERROR]', msg.text());
    }
  });

  console.log('[1/5] Carregando interface...');
  await page.goto('http://localhost:8080/hacker-city-web/index.html', { waitUntil: 'networkidle2', timeout: 15000 });

  // 1-Click operator login if auth overlay active
  await page.evaluate(() => {
    const instantBtn = document.getElementById('btnQuickPlay') || document.querySelector('.btn-quick-play');
    if (instantBtn) instantBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  const shotDir = path.join(__dirname, '../../reports/planejamento-expansao-7-pilares/evidencias');
  if (!fs.existsSync(shotDir)) fs.mkdirSync(shotDir, { recursive: true });

  // 1. Testa Trilha de Puzzles Expandida para 20 Máquinas
  console.log('[2/5] Testando Trilha de Puzzles Expandida (20 Nós)...');
  const puzzleTrailTest = await page.evaluate(() => {
    if (!window.puzzleTrailEngine) return { success: false, reason: 'puzzleTrailEngine ausente' };
    const all = window.puzzleTrailEngine.getAllNodes();
    return {
      success: all.length === 20,
      totalNodes: all.length,
      kinds: [...new Set(all.map(n => n.kind))]
    };
  });
  console.log('Resultado Trilha de Puzzles:', puzzleTrailTest);
  if (!puzzleTrailTest.success) throw new Error('Trilha de Puzzles não possui 20 nós');

  // 2. Testa os Motores dos Minijogos Clássicos
  console.log('[3/5] Testando Motores de Minijogos Clássicos...');
  const gamesTest = await page.evaluate(() => {
    // 2a. Minesweeper
    const ms = new window.MinesweeperEngine(4, 4, 1);
    let msOk = false;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (ms.board[r][c] !== 'M') ms.reveal(r, c);
      }
    }
    msOk = ms.won;

    // 2b. Hex Sudoku
    const sud = new window.HexSudokuEngine();
    sud.board = [
      ['1', '2', '3', '4'],
      ['3', '4', '1', '2'],
      ['2', '1', '4', '3'],
      ['4', '3', '2', '1']
    ];
    sud.checkWin();
    const sudOk = sud.won;

    // 2c. 2048
    const b2048 = new window.BufferMerge2048Engine(8);
    b2048.grid[0][0] = 4;
    b2048.grid[0][1] = 4;
    b2048.move('left');
    const b2048Ok = b2048.won;

    // 2d. Neural Tic-Tac-Toe
    const ttt = new window.NeuralTicTacToeEngine();
    ttt.board = ['X', 'X', 'X', 'O', 'O', '', '', '', ''];
    const tttWin = ttt.checkWinner('X');

    return {
      success: msOk && sudOk && b2048Ok && tttWin,
      minesweeper: msOk,
      sudoku: sudOk,
      b2048: b2048Ok,
      tictactoe: tttWin
    };
  });
  console.log('Resultado Minijogos Clássicos:', gamesTest);
  if (!gamesTest.success) throw new Error('Falha na validação de vitória dos minijogos clássicos');

  // Abre Enigma #2 no navegador para capturar screenshot
  await page.evaluate(() => {
    window.internetEngine.openIp('109.64.200.20');
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(shotDir, '06_puzzle_node_minesweeper.png') });

  // 3. Testa Quadro de Contratos Dinâmicos & Infinitos
  console.log('[4/5] Testando Geração e Aceitação de Contratos Procedurais...');
  const contractTest = await page.evaluate(() => {
    if (!window.dynamicContractsEngine) return { success: false, reason: 'dynamicContractsEngine ausente' };
    
    // Força geração se vazia
    window.dynamicContractsEngine.generateContracts(true);
    const poolCount = window.dynamicContractsEngine.contracts.length;
    if (poolCount === 0) return { success: false, reason: 'Nenhum contrato gerado' };

    // Aceita o primeiro contrato
    const first = window.dynamicContractsEngine.contracts[0];
    const accepted = window.dynamicContractsEngine.acceptContract(first.id);
    const activeCount = window.dynamicContractsEngine.activeContracts.length;

    // Simula execução de ações do contrato no alvo aceito
    const activeC = window.dynamicContractsEngine.activeContracts[0];
    activeC.actions.forEach(a => {
      window.dynamicContractsEngine.onGameAction(a.id, activeC.targetIp);
    });

    const allDone = activeC.actions.every(a => a.done);

    // Coleta recompensa
    const initialBal = window.currentWallet ? parseFloat(window.currentWallet.balance || 0) : (window.currentProfile?.wallet_balance || 0);
    const claimRes = window.dynamicContractsEngine.claimReward(activeC.id);
    const finalBal = window.currentWallet ? parseFloat(window.currentWallet.balance || 0) : (window.currentProfile?.wallet_balance || 0);

    return {
      success: accepted && allDone && finalBal > initialBal,
      poolCount,
      accepted,
      allDone,
      paid: finalBal > initialBal,
      payout: finalBal - initialBal,
      claimRes,
      walletBefore: initialBal,
      walletAfter: finalBal,
      hasCurrentWallet: !!window.currentWallet,
      hasCurrentProfile: !!window.currentProfile
    };
  });
  console.log('Resultado Contratos Procedurais:', contractTest);
  if (!contractTest.success) throw new Error('Falha no ciclo de vida de contratos procedurais');

  // 4. Abre Janela de Missões com a nova aba de Contratos
  console.log('[5/5] Abrindo Janela de Missões e alternando para Contratos Procedurais...');
  await page.evaluate(() => {
    window.navTo('winMissions');
    window.missionsEngine.mainTab = 'dynamic';
    window.missionsEngine.renderUI();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(shotDir, '07_dynamic_contracts_board.png') });

  console.log('--- TESTE E2E FASE 2 CONCLUÍDO COM 100% DE SUCESSO! ---');
  await browser.close();
})();
