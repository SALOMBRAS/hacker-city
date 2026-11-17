# Minigames, trilha de enigmas, specs de reimplementação e anti-cheat

> Análise do **Hacker Experience Legacy** (MIT, © Renato Massaro) para servir de **referência de regras**.
> Nada daqui é cópia de código: as fórmulas devem ser **reescritas** em JS/PostgreSQL. Ver [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md).
> Citações `arquivo:linha` referem-se a <https://github.com/HackerExperience/legacy>.

# Relatório HE Legacy: minigames, enigmas e anti-cheat
Base: `/home/littlecoffee/Documentos/DEV/referencias/he-legacy` (abreviado `HE/`). Li o código, não executei nada no navegador. Onde a conclusão vem só da leitura, está marcado **(leitura)**.

## 0. Visão geral
- Todos os "minigames" ficam na **trilha de enigmas (riddle/puzzle)**. Não existe outro minigame interativo. Não achei captcha próprio, quebra manual de senha, easter egg interativo nem doom jogável. O único easter egg é `puzzle/sudoku/sudoku.js:217-219`: o botão "Show Solution" só faz `alert("42")`.
- **Hacking no HE é baseado em processos com timer**, sem minigame. O ataque de login é um processo cuja duração vem do hardware e do software (`classes/Process.class.php`). Esse é o espaço em que nossos minigames podem entrar.
- `doom.php` é só um painel de progresso de um evento global: `Storyline::doom_displayProgress` (`classes/Storyline.class.php:724`). Ele lista vírus doom ativos e abortados. O aborto é um processo normal. Não é minigame. A recompensa de DOOM é 10000 XP (`classes/Session.class.php:509-510`).
- `welcome.php` e `js/welcome.js` são uma animação de terminal digitando ("Creating virtual machine ......[OK]", `typed.js`) que leva ao tutorial. `university.php` e `certs/*.php` são texto com um mini-Q&A em `certs/2-2.php:3`. Nada interativo.
- `npccontent/*.html` são capturas estáticas de páginas de NPC (bancos, whois). Não têm enigma. Só carregam o comentário "www.neoartgames.com".
- `info/*.txt` são documentação de arquitetura. `info/npcType.txt` diz que NPC tipo 7 = puzzle.
- **Licenças dos minigames embutidos:**
  - 2048: MIT (Cirulli, `puzzle/2048/LICENSE.txt`).
  - Lights Out: MIT (chenglou).
  - Sudoku: **GPL v2+** (Michael Loesler, `sudoku.js:2-23`). Não copiar.
  - Minesweeper (Uzi Kilon) e Tic-Tac-Toe (Forkk.net): licença não declarada nos arquivos.
  - Como reescrevemos do zero, isso não nos afeta, mas não copie o sudoku.
- O HE em si é MIT, 2013-2019, Renato Massaro (`HE/LICENSE`).

## 1. Arquitetura comum da trilha (`riddle.php`, `classes/Riddle.class.php`)
1. Cada servidor de enigma é um **NPC** com uma chave na tabela `npc_key`. A chave tem a forma `PUZZLE/<n>` ou `WHOIS/<n>`. O IP de cada NPC fica no banco e não está no repositório (`game.sql:1826-1832`, `npc_key` vazia).
2. O NPC mostra `riddle.exe` (software tipo 26, "NPC only", `createsoft.php:68`). O link é `?view=software&cmd=riddle` (`PC.class.php:3914`).
   - `Internet.class.php:1619-1635` só permite se o alvo for NPC tipo 7 ou 2.
3. `Riddle::showInfo` (`Riddle.class.php:123-226`) lê `json/riddle.json`.
   - Se o nó tem `path`, inclui `puzzle/<path>/<path>.php` (um minigame).
   - Senão, mostra pergunta, nota e formulário de resposta (Q&A).
4. Q&A, `verifyQA` (`:228-300`):
   - Valida os caracteres com regex (`System.class.php:387-389`).
   - Compara `strtolower(resposta) == strtolower(esperado)`, sem normalização.
   - Se `percent` for número (90 nos enigmas 24 e 26), resolve por **similaridade** `similar_text >= 90%` (`:264-287`).
   - Mostra dicas: "close" se `similar_text >= 85%` e "faltam N caracteres" se `levenshtein <= 2`. Isso é um oráculo de proximidade.
   - O ramo `percent` só roda quando `percent` é verdadeiro. Nos demais enigmas não há dica nem tolerância.
5. Minigames chamam `POST riddle.php` com `func=<jogo>`.
   - O servidor responde `{status, msg:'[{result,next,header,isSolved}]'}` (`riddle.php:75,87,151`).
   - Exige sessão logada e "Internet session" (`riddle.php:16-28`) e que `$_SESSION['LOGGED_IN']` (IP do NPC em que você está conectado) seja um NPC de riddle. Também recusa se já resolvido.
6. **Progresso:**
   - `puzzle_solved(puzzleID,userID,solvedDate)` guarda o histórico (`game.sql:2051-2063`). Não tem PK nem UNIQUE.
   - `users_puzzle(userID PK, puzzleID)` guarda o maior enigma resolvido (`game.sql:2871-2883`).
   - `setAsSolved` (`Riddle.class.php:518-544`) insere em `puzzle_solved`, atualiza `users_puzzle` se `cmpPuzzleID` for maior e dá `exp_add('PUZZLE')` = **25 XP** (`Session.class.php:531-532`).
   - `cron/finishRound.php:360,375` apaga `puzzle_solved` e zera `users_puzzle` a cada **round**.
7. **Recompensa real (`json/riddle_software.json`, `python/software_generator_riddle.py`):**
   - Cada servidor de enigma tem softwares com versão crescente (valor/10, ex. 11 = v1.1). Ex.: puzzle 1 tem crc 11 e hash 10; puzzle 10 tem hash 19 e crc 20; puzzle 27 tem crc 50; puzzle 38 tem crc 100; puzzle 47 tem crc 200 e hash 190.
   - O jogador resolve o enigma, vai ao próximo IP e invade o servidor para baixar um software melhor. `certs/1-2.php:132-135` diz isso: "forma barata de conseguir software melhor".
   - `RIDDLEDiagram.png`: 47 caixas em cadeia, cada uma com as versões dos softwares daquele servidor.
     - Nós verdes são Whois: 1 após o enigma 10, 2 após o 27, 3 após o 34, 4 após o 38.
     - O nó vermelho é o 47, o final.
   - Os softwares sobem de ~1.0 para ~20.0.
8. **Roteamento:**
   - `getNextIP` (`:450-496`) sobrescreve o próximo salto: enigma 10 → WHOIS/1, 27 → WHOIS/2, 34 → WHOIS/3, 38 → WHOIS/4, 47 → `1.2.3.4` (fim). Nó `TMPEND` → WHOIS/1.
   - Os IDs dos Whois são 501+ (`npcPuzzleID`, `:65-68`).
   - Os Whois são servidores NPC que listam links para outros nós (`json/npc.json`, bloco `WHOIS`).
9. **UX social:** `getRiddleStats` (`:575-626`) mostra "N jogadores resolveram / N estão presos aqui / N abaixo". Para novos jogadores, `Internet.class.php:2659-2666` mostra o aviso "Puzzle Campaign!" apontando para o primeiro enigma.
10. **Dados incompletos:** `riddle.json` só tem os enigmas 1 a 28 mais `WHOIS1` e `WHOIS2`. O código e o diagrama referenciam até o 47 (`Riddle.class.php:478-488`, `riddle_software.json` tem 1-47). Os enigmas 29-47 foram omitidos do repositório. Há texto de aviso "This is the end of the riddle (for now)" em `:125-127`.

## 2. Catálogo dos minigames (5 jogos, todos em `puzzle/`)
Todos sinalizam vitória com `POST riddle.php`. A resposta do servidor atualiza `#puzzle-header`, `#puzzle-status`, `#puzzle-next` e `#puzzle-isSolved`.

### 2.1 Tic-Tac-Toe (enigma 1, `puzzle/tictactoe/tictactoe.js`, 437 linhas)
- **Jogador:** X contra IA O, tabuleiro 3x3 num canvas. A IA joga sempre que `xTurn` é falso (`:75-76`).
- **IA (`:317-416`):**
  1. Vence se puder (linhas, colunas, diagonais).
  2. Bloqueia se o adversário tiver duas em linha.
  3. Senão joga a **primeira casa livre** (`:407-414`).
  - A heurística "avançada" está comentada (`:380-405`); o cabeçalho diz: "o original era praticamente imbatível" (`:3`). Portanto é derrotável com **garfo (fork)**. Não verifiquei uma sequência exata.
- **Resultado:** `OnWin(winner)` (`:282-309`) envia `status` = 0 (empate), 1 (X ganhou) ou 2 (O ganhou).
- **Validação no servidor:** `riddle.php:40-77` só confere se `status` é dígito de 0 a 3.
  - `status=1` resolve.
  - **O servidor confia no cliente: `POST func=tictactoe&status=1` resolve sem jogar.**
- Empate ou derrota reiniciam o tabuleiro e o jogador tenta de novo, sem limite e sem custo.
- **Ganha:** próximo IP + 25 XP.

### 2.2 Sudoku (enigma 10, `puzzle/sudoku/sudoku.js`, 621 linhas, GPL)
- **Tabuleiro:** 9x9 (`SudokuType`).
  - O gerador é backtracking aleatório (`createSudokuStep`, `:301-339`) e preenche a grade completa.
  - Depois oculta `hoodedFields = nível*9` células. O nível padrão é 4, então **36 células** vazias de 81 (`:114-158`, `setLevel`).
  - A unicidade da solução **não é garantida** (remoção aleatória).
- **Vitória (`isSolved`, `:282-299`):** todas as células ocultas preenchidas e, para cada uma, `canInstert` (linha, coluna e caixa 3x3 sem repetição) contra `solvingSD`.
- **Bug (leitura):** em `isSolved`, as células ocultas são zeradas em `solvingSD` (`:289`) antes da checagem. Cada valor do usuário é comparado só com os dados fornecidos, **não com os outros valores digitados**.
  - Basta cada célula não conflitar com as dicas originais da linha/coluna/caixa.
  - Um caractere não numérico vira `NaN`, que nunca é igual a nada, então passa sempre. Digitar uma letra em cada vazia pode ganhar. Confirmar no navegador antes de apostar nisso como fato.
- Qualquer evento de `input` (click, key, focus) dispara a checagem (`:190-194`).
- **Servidor:** `riddle.php:78-89` aceita `func=sudoku` sem nenhuma prova (não envia nem o estado).
- **Ganha:** próximo IP e 25 XP, após um `alert` com o tempo gasto (`:242-250`).

### 2.3 Minesweeper (enigma 16, `puzzle/minesweeper/minesweeper.js`, 302 linhas; as linhas 1-5 são um bundle de prettify, irrelevante)
- **Tabuleiro:** 8x8 com 10 minas (`:247-249`). Minas por sorteio aleatório uniforme sem repetição (`generateBomb`, `:167-175`).
- **Regras:**
  - Clique esquerdo revela. Zero vizinhas faz flood-fill recursivo (`:50-64`).
  - Clique direito alterna "", "?", "!" (`:65-82`). A marcação **não influencia** a vitória.
  - O **primeiro clique pode ser mina** (sem proteção).
- **Derrota:** revelar mina mostra tudo e `Game.complete()` sem vitória (`:151-157`). O botão "Try again" reinicia.
- **Vitória (`validate`, `:141-150`):** quando não resta célula não revelada que não seja mina.
- **Cliente:** o tabuleiro inteiro, com as minas, vive no JS (`Board.board`). `POST riddle.php func=minesweeper` sem payload (`:209-224`).
- **Validação:** nenhuma. O servidor resolve só com a chamada (`riddle.php:78-89`).
- **Ganha:** próximo IP e 25 XP.

### 2.4 2048 (WHOIS1, `puzzle/2048/js/game_manager.js`, MIT)
- **Regras:** 2048 padrão, 4x4. Entram 2 peças iniciais (`:7`) e, depois de cada movimento válido, uma peça nova: 2 com 90% e 4 com 10% (`:84`). Merge único por linha por jogada. Fim de jogo quando não há movimentos.
- **Customização HE (`:185-236`)**: ao fazer merge de 128, 256, 512, 1024 e 2048, em ordem estrita (`hinttype` sobe 1→5), o cliente envia `POST riddle.php func=2048 type=1..5`.
- **Servidor (`riddle.php:90-153`):**
  - `type` 1 a 4 gera **dicas parciais do próximo IP**. `hint_generate` (`Riddle.class.php:628-703`) revela dígitos de uma máscara `XXX.XXX.XXX.XXX`: tipo 1 revela 1 dígito aleatório; tipo 2 revela 2 aleatórios; tipos 3 e 4 revelam **3 dígitos consecutivos** de um octeto (o comentário do código diz "2" para o tipo 3, mas o cálculo `type+2` capado em 5 faz os dois darem 3. Discrepância comentário/código).
  - `type=5` (2048) resolve e dá o IP completo.
  - A máscara fica num **cookie** `PUZZLE_HINT[IP]`/`[ID]` (`:713-769`, validada só por regex `^[0-9.xX]{7,15}$`).
- **Vitórias parciais:** `solvedByHint` (`:777-785`) considera resolvido quando não sobra nenhum `X`. Ou seja, juntar as dicas das jogadas pode resolver antes do 2048.
- **Cheats:**
  - `POST func=2048&type=5` resolve na hora.
  - Cookie forjado `PUZZLE_HINT[IP]=1.1.1.1` e `[ID]=<id>` com `type=1`: `hint_generate` devolve o IP sem `X` e marca resolvido **(leitura)**.
  - O servidor nunca vê o estado do jogo.
- **Ganha:** IP completo, ou parcial por dica, e 25 XP quando resolve.

### 2.5 Lights Out (enigma 27, 28 e WHOIS2, `puzzle/lightsout/index.jsx`, MIT, React 0.x)
- **Tabuleiro:** 5x5, **um único padrão fixo** (`:3-11`), embora o código sorteie de uma lista de 1 (`getNewRandomBoard`).
  - Padrão (1 = aceso): `10011 / 01010 / 10101 / 01010 / 10011`.
- **Regra:** clicar inverte a célula e as 4 vizinhas ortogonais (`:56-70`). O objetivo é **todas acesas** (`:66-70`).
- **Calculei por eliminação gaussiana em GF(2) que esse tabuleiro é resolvível** (posto 23 de 25, ou seja, 4 soluções). Uma solução usa 7 cliques, nas posições [1,1][1,2][2,2][2,3][2,4][3,1][3,2]. A ordem não importa.
- **Cliente:** `POST riddle.php func=lightsout` sem payload quando `done` (`:73-93`).
- **Validação:** nenhuma no servidor (`riddle.php:78-89`).
- **Ganha:** próximo IP e 25 XP. O mesmo componente é reutilizado em três nós.

### 2.6 Resumo de validação (todos são cliente-confiável)
- `riddle.php` nunca verifica **qual** jogo o nó exige.
- Qualquer chamada `func=lightsout|sudoku|minesweeper` resolve **qualquer nó de riddle atual**, até um nó Q&A, bastando estar conectado ao IP **(leitura)**.
- Nenhuma checagem de ordem: `setAsSolved` não olha o progresso anterior. Basta conhecer o IP.

## 3. A trilha de enigmas (`json/riddle.json`)
Tipos: lógica/matemática (M), conhecimento geral (C), decodificação (D), cultura pop/referência (P), lógica formal (L), regex (R), minigame (G). Respostas ficam só no servidor, e o cliente nunca as recebe.

| ID | Tipo | Ideia do enigma (paráfrase) | Dica do autor |
|---|---|---|---|
| 1 | G | Tic-Tac-Toe contra IA fraca | Tutorial ("first puzzle is easy") |
| 2 | M | Pegar meias no escuro até garantir par (princípio da casa dos pombos) | "Use dígitos" |
| 3 | C | Nome do vulcão islandês de 2010 | acento no "ö" |
| 4 | M | Dois números com produto e quociente dados | formato "X, Y" |
| 5 | M | Regra de três com tempo e quantidade proporcionais | só dígitos |
| 6 | C/D | Coordenadas geográficas → nome de um lugar | "7 letras" |
| 7 | M | Proporção "estranha" (1/2 de 5 = 3) | dígitos |
| 8 | D | Lista de códigos ASCII decimais → frase | link da Wikipedia sobre ASCII |
| 9 | P | Anagrama de filme (Sneakers) → frase | link do IMDB |
| 10 | G | Sudoku | — |
| W1 | G | 2048 | dicas por marco |
| 11 | D | Binário ASCII (8 bits) → frase de Steve Jobs | — |
| 12 | C | Literatura (os Três Mosqueteiros) | — |
| 13 | M | Taxa de trabalho combinada, resposta decimal | "use ponto" |
| 14 | M | Pegadinha da batata com água (99% → 98%) | só números |
| 15 | M | Equação diofantina: 100 animais com 100 reais | "X, Y, Z" |
| 16 | G | Minesweeper | — |
| 17-21 | M | Lógica de ordem, pássaros, nadadores, baleia, conjuntos | formato exemplificado |
| 22 | M | Montar 100 com seis noves e duas operações | "sem espaços" |
| 23 | M | Sistema linear de dois criadores | "X, Y" |
| 24 | L | Fórmula de lógica de primeira ordem → frase em português claro | **90% de similaridade** + links |
| 25 | M | Ovelhas e galinhas (pés + cabeças) | "X, Y" |
| 26 | R | Regex que casa com a famosa fala de Hamlet (piada com `bb`) | link da Wikipedia + 90% |
| 27, 28, W2 | G | Lights Out | — |

- **Fontes dos créditos:** RachaCuca (enigmas M) e Buzzle.com (enigma 7). Aparecem no campo `credit` do JSON.
- **Respostas multi-valor** (ex. "12, 4", "a, d, c") são comparadas **exatamente**, incluindo espaços e vírgulas. Só a regex de validação limita os caracteres.
- **Enigmas 29-47:** ausentes do repositório (ver seção 1.10). Pelas pistas (`riddle_software.json` e diagrama) a dificuldade deveria crescer.

### Como replicar cada tipo do zero
- **M (matemática/lógica):** gerador paramétrico. Sorteia números e monta o texto. O servidor calcula a resposta e aceita só numérica, com tolerância configurável (inteiro, decimal com 1 casa). Evita decorar respostas.
- **D (codificação):** cifra aplicada a uma frase do nosso jogo. Variar: ASCII decimal, binário, hex, Base64, ROT13, Caesar com shift pista, XOR com chave pequena. O servidor guarda `plaintext` e `cipher`.
- **C/P (conhecimento e referência):** guardar só no servidor. Combinar com pista no ambiente do jogo (log, arquivo, e-mail, página NPC).
- **Pistas escondidas (HE não usa, mas encaixa):** comentário HTML no site NPC, arquivo em pasta oculta do servidor invadido, trecho de log, metadado de imagem, cabeçalho HTTP, `robots.txt` do NPC. O jogador precisa invadir ou inspecionar. Isso é a mecânica certa para público de TI.
- **L/R (lógica formal e regex):** o enigma é uma expressão e a resposta é a interpretação. Melhor ainda: validar **por teste** (o jogador digita uma regex e o servidor roda contra um conjunto de strings positivas e negativas). Isso aceita várias soluções e não depende de texto exato.
- **Dica progressiva:** manter o oráculo de proximidade do HE, mas **com limite de tentativas** (ver armadilhas).

## 4. SPECs de reimplementação (JS puro, funções puras, seed)
Princípio comum para o servidor:
```js
// Tabela minigame_sessions: id, user_id, game, seed, params(json), issued_at, expires_at, status
// 1. POST /start  -> servidor sorteia seed (crypto), grava sessão, devolve {id, seed?, puzzle}
// 2. cliente joga localmente
// 3. POST /finish {id, moves[]} -> servidor reexecuta com a MESMA lógica, checa tempo mínimo,
//    marca sessão como usada (UPDATE ... WHERE status='open' RETURNING) e só então credita.
// PRNG determinístico compartilhado (cliente e servidor):
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
  t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
```

### 4.1 Tic-Tac-Toe
```js
// estado: {b:Array(9).fill(0), turn:1}  (1=jogador, 2=IA)
const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
export const init=()=>({b:Array(9).fill(0),turn:1});
export const winner=b=>{for(const[a,c,d]of L)if(b[a]&&b[a]===b[c]&&b[a]===b[d])return b[a];return b.includes(0)?null:0};
export const move=(s,i)=>{if(s.b[i]||s.turn!==1||winner(s.b)!==null)return s;
  const b=[...s.b];b[i]=1;return{b,turn:2}};
export function ai(s,rng,mistake=0.0){ // mistake: prob. de jogada aleatória (nível)
  const free=s.b.flatMap((v,i)=>v?[]:[i]); if(!free.length)return s;
  const find=p=>free.find(i=>{const b=[...s.b];b[i]=p;return winner(b)===p});
  let i=find(2)??find(1); if(i==null||rng()<mistake) i=free[Math.floor(rng()*free.length)];
  const b=[...s.b];b[i]=2;return{b,turn:1}}
```
- **Servidor:** autoritativo. O cliente envia só a casa `i` por jogada (`POST /ttt/move {id,i}`) e o servidor mantém `board` e roda a IA. O cliente nunca envia "ganhei".
- Perfeito = empate sempre; dificuldade por `mistake` e por IA minimax só nos tiers altos.
- O jogador vence quando `winner===1`.

### 4.2 Sudoku
```js
export function generate(seed,holes){const r=mulberry32(seed),g=Array(81).fill(0);
  const ok=(i,v)=>{const R=i/9|0,C=i%9;for(let k=0;k<9;k++)
    if(g[R*9+k]===v||g[k*9+C]===v||g[((R/3|0)*3+(k/3|0))*9+(C/3|0)*3+k%3]===v)return false;return true};
  const fill=i=>{if(i===81)return true;const vs=[1,2,3,4,5,6,7,8,9].sort(()=>r()-.5);
    for(const v of vs)if(ok(i,v)){g[i]=v;if(fill(i+1))return true;g[i]=0}return false};
  fill(0);const solution=[...g],puzzle=[...g];
  const idx=[...Array(81).keys()].sort(()=>r()-.5);
  for(const i of idx){if(!holes)break;const v=puzzle[i];puzzle[i]=0;
    if(countSolutions(puzzle,2)!==1)puzzle[i]=v;else holes--}  // garante unicidade
  return{puzzle,solution}}
export const checkWin=(puzzle,grid,solution)=>grid.every((v,i)=>v===solution[i]&&(!puzzle[i]||puzzle[i]===v));
```
(`countSolutions` = backtracking contando soluções até 2.)
- **Servidor:** gera a seed e a solução, guarda a **solução no servidor** e manda ao cliente só o `puzzle`. `finish` recebe a grade e compara com a solução. Tempo mínimo por célula vazia.
- Um solver automático resolve qualquer sudoku público. Contramedidas: tempo mínimo, nível alto com poucas dicas, "variantes" (ex.: soma de caixas, diagonal) onde solver genérico ajuda menos. Ou assumir que "scriptar" faz parte do jogo.

### 4.3 Minesweeper
```js
export function init(seed,w=8,h=8,mines=10){return{w,h,mines,seed,placed:false,
  cells:Array.from({length:w*h},()=>({m:false,r:false,f:false,n:0})),over:false,won:false}}
function place(s,safe){const r=mulberry32(s.seed),ban=new Set(nb(s,safe).concat(safe)); // 1º clique + vizinhança seguro
  const c=[...Array(s.w*s.h).keys()].filter(i=>!ban.has(i)).sort(()=>r()-.5).slice(0,s.mines);
  c.forEach(i=>s.cells[i].m=true);s.cells.forEach((x,i)=>x.n=nb(s,i).filter(j=>s.cells[j].m).length);s.placed=true}
export function reveal(s,i){if(s.over||s.cells[i].f||s.cells[i].r)return s;if(!s.placed)place(s,i);
  const q=[i];while(q.length){const k=q.pop(),c=s.cells[k];if(c.r)continue;c.r=true;
    if(c.m){s.over=true;return s}if(c.n===0)q.push(...nb(s,k))}
  s.won=s.cells.every(c=>c.m||c.r);s.over=s.won;return s}
```
(`nb` = índices vizinhos válidos.)
- **Servidor:** o servidor guarda a seed e **não envia as minas**. O cliente manda `reveal(i)` e o servidor devolve só as células reveladas com seus números (e a lista completa de minas só no fim). Alternativa mais leve: o cliente joga local com a seed, mas manda a lista de jogadas e o servidor reexecuta.
- Primeiro clique seguro para não punir sorte. Para tiers altos, 16x16 com 40 minas, e seed sem garantia de "sem chute".

### 4.4 2048
```js
export function init(seed,n=4){const s={n,g:Array(n*n).fill(0),score:0,rng:mulberry32(seed),over:false,max:0};
  spawn(s);spawn(s);return s}
function spawn(s){const e=s.g.flatMap((v,i)=>v?[]:[i]);if(!e.length)return;
  s.g[e[Math.floor(s.rng()*e.length)]]=s.rng()<.9?2:4}
function line(a){const t=a.filter(Boolean),o=[];let sc=0;for(let i=0;i<t.length;i++){
  if(t[i]===t[i+1]){o.push(t[i]*2);sc+=t[i]*2;i++}else o.push(t[i])}
  while(o.length<a.length)o.push(0);return[o,sc]}
export function move(s,dir){/* 0=cima 1=dir 2=baixo 3=esq: extrai linhas, aplica line(), se mudou -> spawn */}
export const maxTile=s=>Math.max(...s.g);
export const canMove=s=>[0,1,2,3].some(d=>JSON.stringify(move(clone(s),d).g)!==JSON.stringify(s.g));
```
- **Servidor:** recebe a string de jogadas (ex. `"LLURD..."`) e reexecuta com a mesma seed (o `rng` só é consumido em `spawn`, então é determinístico). Calcula `maxTile`. Metas por tier (128, 256, 512...). Recusar jogadas que não mudam o tabuleiro (para impedir inflar o log).
- Tempo mínimo = `moves * ~120 ms`. Um bot honesto de 2048 chega a 2048 com facilidade, então o cuidado é limitar tentativas e usar tabuleiro maior ou condições extras.

### 4.5 Lights Out
```js
export function init(seed,n=5,k=8){const b=Array(n*n).fill(1),r=mulberry32(seed);
  for(let i=0;i<k;i++)press({n,b},Math.floor(r()*n*n));  // parte do estado resolvido => sempre resolvível
  return{n,b}}
export function press(s,i){const{n}=s,x=i%n,y=i/n|0;
  for(const[dx,dy]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;
    if(X>=0&&X<n&&Y>=0&&Y<n)s.b[Y*n+X]^=1}return s}
export const checkWin=s=>s.b.every(v=>v===1);
```
- **Servidor:** gera o tabuleiro com a seed (sempre resolvível porque parte do estado resolvido) e valida reexecutando a lista de cliques (`presses mod 2` reduz a lista). Para tiers altos, `n` maior, ou exigir **solução mínima** (via resolução em GF(2), que o servidor sabe calcular).

## 5. Seis ideias de novos minigames (temas de hacking)
Cada um tem versão determinística por seed e validação por reexecução. O parâmetro `tier` escala a dificuldade.

1. **Bruteforce Manual (Mastermind de senha)** — substitui a barra de progresso do ataque de login.
   - Regras: o servidor tem um código de N símbolos (hex/dígitos). O jogador chuta e recebe "N posições certas, M símbolos certos em lugar errado". Limite de tentativas.
   - Escala: N = 3 a 8, alfabeto 6 a 16, tentativas 12 a 6. Resolve **antes** do tempo do processo; o bônus é cortar o tempo da barra em % proporcional às tentativas sobradas.
   - Servidor: guarda o código, responde pontuação por chute, o cliente nunca vê o segredo.
2. **Decodificar Hash (Cadeia de transformações)** — vem do tipo D (cifras) e ocupa o papel do software hasher/cracker.
   - Regras: o jogador vê um texto cifrado e uma **pista** (formato, tamanho, dica do algoritmo). Aplica transformações de uma caixa de ferramentas (Base64, ROT-N, hex, reverso, XOR com chave de 1 byte) em ordem. Vence quando o texto for legível/igual ao alvo.
   - Escala: 1 a 5 camadas, ordem oculta, ferramentas "isca".
   - Servidor: guarda a cadeia correta; o cliente envia a pilha de ferramentas aplicadas e o servidor reexecuta.
3. **Bypass de Firewall (Roteamento de pacotes)** — aparece ao invadir servidor com firewall.
   - Regras: grade com regras `ALLOW/DENY` por porta e protocolo. O jogador monta uma rota de pacote em vários saltos (tabuleiro de caminhos, estilo "pipes"/labirinto) que nunca cai em `DENY`.
   - Escala: tamanho (5x5 a 12x12), regras que mudam a cada N passos, portas "honeypot" (disparam alarme).
   - Servidor: seed gera a rede e as regras; o cliente envia a sequência de saltos e o servidor valida o caminho.
4. **Limpar Log sob Pressão (Whack-a-log com timer)** — substitui a barra de "editar log" e dá bônus de furtividade.
   - Regras: linhas de log rolam; o jogador deve apagar só as que contêm o **seu IP** ou marcadores, sem apagar as de outros (penalidade). Um contador de "detecção" sobe com o tempo.
   - Escala: velocidade de rolagem, IPs parecidos (`1.2.3.4` vs `1.2.3.40`), linhas que se disfarçam, orçamento de erros.
   - Servidor: gera as linhas com seed e timestamp; recebe a lista de índices apagados e o tempo; recomputa acertos, erros e perdas.
5. **Captura de Handshake (Sequência de timing)** — substitui a barra de um ataque Wi-Fi ou de quebra de acesso.
   - Regras: um osciloscópio mostra um sinal periódico. O jogador aperta em janelas de ritmo (como jogo de ritmo) para sincronizar N pulsos seguidos.
   - Escala: janela de tolerância menor, ritmo irregular, ruído, N maior.
   - Servidor: valida com timestamps relativos (não confiar no relógio do cliente; usar intervalos entre eventos e limites de jitter plausíveis).
6. **Injeção de Query (Quebra-cabeça de lógica SQL/regex)** — fecha o laço com o nosso "enigma regex" (enigma 26).
   - Regras: o jogador escreve um padrão (regex ou um filtro simples) que precisa **casar** com exemplos positivos e **não casar** com negativos.
   - Escala: número de exemplos, ofuscação, limite de tamanho do padrão (code-golf), tempo.
   - Servidor: executa o padrão em sandbox contra o conjunto (com limite de tempo para evitar ReDoS) e recompensa por tamanho menor.

**Onde entram:**
- Nº 1, 3 e 5: substituem ou aceleram a barra de progresso do ataque.
- Nº 4: bônus de furtividade ao sair do alvo.
- Nº 2 e 6: tarefas de decifrar ou de analisar, e enigmas da trilha.
- O resultado entra como multiplicador do tempo (ex.: ganhar reduz o processo em até 50%; perder ou desistir deixa o tempo normal; nunca bloqueia o jogador).

## 6. Mapa de dificuldade/recompensa (tiers 1-5)
Proposta, ligada ao esquema do HE (25 XP fixo, software `v1.0 → v20.0`):

| Tier | Jogos (da base HE) | Parâmetros | Recompensa sugerida | Habilidade/missão |
|---|---|---|---|---|
| 1 Tutorial | Q&A fácil, Tic-Tac-Toe vs IA com erros | IA `mistake` 0,5; 1 enigma M simples | ~25 XP; primeiro software `v1.x` | Missões 1-3, tutorial |
| 2 Iniciante | Lights Out 4x4/5x5, Minesweeper 8x8/10 minas, Mastermind N=3 | 12 tentativas, tempo folgado | 50 XP; software `v2-5` | Árvore: nó básico de cracker/firewall |
| 3 Intermediário | Sudoku 36 vazias, 2048 até 512, Handshake N=6, Log-cleaner médio | tempo mínimo exigido | 100 XP; `v5-10`; corta 25% do tempo do ataque | Habilidades de furtividade/seek |
| 4 Avançado | 2048 até 1024, Minesweeper 16x16, Firewall-bypass 8x8, cadeia de hash 3 camadas | tentativas limitadas, honeypots | 200 XP; `v10-15`; corta 40% | Nós avançados (DDoS, miner) |
| 5 Elite | 2048 até 2048, Sudoku difícil sem unicidade garantida resolvida, regex golf, Lights Out com solução mínima | 1 tentativa por janela, cooldown | 400 XP; `v15-20`; corta 50%; badge | Capstone da árvore, missões de clã |

- **Regra de balanceamento:** a recompensa dos minigames **não deve superar o ganho por fazer o ataque normal**; o minigame é atalho opcional e não requisito.
- **Resets:** o HE zera o progresso a cada round (`cron/finishRound.php:360,375`). Se o nosso jogo tiver rounds, decidir o que persiste (software já obtido) e o que reinicia (contadores da trilha).

## 7. ARMADILHAS (o que o HE errou e a gente deve evitar)
1. **Validação só no cliente em 4 dos 5 jogos.** `riddle.php:78-89` aceita `func=sudoku|minesweeper|lightsout` sem prova. Tic-Tac-Toe aceita `status=1` (`:40-77`). Para nosso público, isso seria burlado em minutos pelo DevTools. **Todo resultado precisa ser reexecutado no servidor.**
2. **2048:** `type=5` resolve direto (`:135-148`). O cookie de dicas `PUZZLE_HINT` é editável. Não guardar estado de segurança em cookie sem assinatura, e sim no banco.
3. **Servidor não confere qual jogo o nó exige.** Qualquer `func` resolve qualquer nó de riddle. Vincular a sessão do minigame ao nó e ao jogo (`session.game`).
4. **Soluções hardcoded no JS.** Lights Out tem **um único tabuleiro fixo** (`index.jsx:3-11`): decora-se a solução (7 cliques). O tabuleiro nunca varia. Usar seed por tentativa.
5. **Minesweeper com minas no cliente** (`Board.board`, `Cell.isBomb`): ler o objeto no console revela tudo. Servidor deve guardar as minas e responder só célula a célula.
6. **Sudoku:** a checagem não compara os valores digitados entre si (`sudoku.js:289-297`), e `NaN` passa **(leitura)**; a solução vive no cliente (`SD`). Não confiar no cliente: comparar com solução guardada no servidor.
7. **Sem limite de tentativas no Q&A** (`riddle.php` e `verifyQA`). O oráculo `similar_text`/`levenshtein` facilita força bruta de texto. Aplicar rate limit por usuário e enigma, atraso progressivo e bloqueio temporário; no Q&A numérico, o espaço de busca é pequeno.
8. **Race condition e XP duplicado:** `puzzle_solved` não tem UNIQUE e `setAsSolved` usa um flag em memória (`Riddle.class.php:518-544`). Requisições concorrentes podem inserir duas vezes e dar 25 XP cada **(leitura)**. Usar `UNIQUE(user_id, puzzle_id)` e `INSERT ... ON CONFLICT DO NOTHING RETURNING`, creditando só se inseriu.
9. **Sem ordem de progressão.** Não exige enigma anterior; só ter o IP do nó. Se isso importar, gravar `parent_puzzle_id` e verificar.
10. **Respostas por igualdade de string** (`"99+99/99"`, `"12, 4"`): exigem formato exato e são frágeis. Normalizar (trim, minúsculas, remover acento, ordenar valores quando a ordem não importa) ou validar por **teste/avaliador** em vez de texto.
11. **Enigmas googláveis** (vulcão, Mosqueteiros, tradução de ASCII/binário) e **respostas públicas após o open source** (as respostas estão em `riddle.json`). Nossa trilha deve ser **parametrizada por jogador** (seed) ou ter conteúdo nosso, com respostas só no banco.
12. **SQL por concatenação** em `Riddle.class.php` (ex. `:60,445,507,529,535`). No nosso Supabase, usar RPC/Edge Function com parâmetros e RLS.
13. **Primeiro clique pode ser mina** no Minesweeper (sorte decide) e **IA do Tic-Tac-Toe fraca** (`:406-414`) tornam esses jogos triviais ou injustos conforme o caso. Dar dificuldade parametrizada.
14. **Conteúdo incompleto/inconsistente:** `riddle.json` omite 29-47 e há discrepâncias entre comentários e código (2048 tipo 3, `riddle.json` 28 vs `getNextIP`). Documentar a trilha num único esquema de dados e testar a cadeia (`next`) automaticamente.
15. **Dependência de tecnologia antiga** (jQuery, React 0.x com JSXTransformer no navegador, bundles de 13-15 mil linhas em `puzzle/lightsout/`). Reescrever em módulos ES.

## 8. Incertezas
- A tabela `npc_key` e os IPs dos nós não estão no repositório (INSERT vazio), então a ligação exata entre Whois, nós e jogos foi inferida de `Riddle.class.php` e do diagrama.
- A leitura do `.dia` não foi necessária; usei o PNG.
- Os pontos marcados **(leitura)** (Sudoku `NaN`, cookie forjado no 2048, qualquer `func` resolvendo qualquer nó, XP duplicado por race) não foram executados.
- A sequência exata para derrotar a IA do Tic-Tac-Toe não foi verificada.
- O custo/tempo real de cada ataque (barra de progresso) depende de `Process.class.php`, que só olhei de relance.
