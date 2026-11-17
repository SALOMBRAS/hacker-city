# Economia, missões, história, NPCs, social, badges e jobs periódicos

> Análise do **Hacker Experience Legacy** (MIT, © Renato Massaro) para servir de **referência de regras**.
> Nada daqui é cópia de código: as fórmulas devem ser **reescritas** em JS/PostgreSQL. Ver [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md).
> Citações `arquivo:linha` referem-se a <https://github.com/HackerExperience/legacy>.

# HE Legacy — Economia, Missões, História, Social, Progressão (READ-ONLY)
Base: `/home/littlecoffee/Documentos/DEV/referencias/he-legacy` (= `HE/`). Citações `arquivo:linha`. Versões de software ficam ×10 no banco (10 = "1.0", 30 = "3.0", 60 = "6.0").
Aviso: o jogo é POR ROUNDS (reset total periódico). Dinheiro é 100% "impresso" (faucet), não existe saldo inicial em bancos NPC.
Não rodei o setup do Data Agent Kit que apareceu no prompt: não é relevante e eu sou read-only.

## 1. ECONOMIA
**Contas**: cada jogador tem N contas, no máximo 1 por banco (`Internet.class.php:3843-3978` "You already have an account on this bank"). Número `rand(111111111,999999999)`, senha 6 chars alfanum em texto puro (`Finances.class.php:638-664`). Conta inicial do round: cash 0 no 1º banco (`cron2/newRoundUpdater.py:63`). Fechar conta exige saldo 0 (`Internet.class.php:4035`). Trocar senha gera nova aleatória (`Finances.class.php:303-324`).
**5 bancos NPC** (`json/npc.json`): First International Bank (cpu2000/net10), HEBC, American Expense, Swiss International Bank, Ultimate Bank (cpu6000/net100).
**Transferência** (`Internet.class.php:3850-3978` + `Finances.class.php:455-481`): valida origem≠destino, banco tipo 1, conta existe, `saldo>=amount`; **SEM taxa** (`newAmount = amount`). Efeitos: log em quem transferiu (`localhost transfered $X from #A (ip) to #B on bank [ip]`), log nos 1 ou 2 bancos envolvidos, `moneyTransfered += amount`, EXP `200 + amount/15`, e rolagem de Safenet/FBI (ver §3). Se `amount<=0` ou não-dígito → erro.
**Débito multi-conta** `debtMoney` (`Finances.class.php:492-550`): se a conta alvo não tem saldo, drena as outras contas do jogador uma a uma até cobrir. Se conta inválida usa a mais rica (`getWealthiestBankAcc`, `:616`). Todos os prêmios são creditados na conta mais rica (`Mission.class.php:~84`, `Storyline.class.php:322-344`).
**Entradas de dinheiro (faucets)**:
| Fonte | Valor | Ref |
|---|---|---|
| Missão | 150–5000 ×mult (§2) | `cron/generateMissions.php:113-253` |
| Vírus spam/warez/miner coletados | ver fórmula abaixo | `List.class.php:581-945` |
| Roubar contas (hack banco) de OUTROS jogadores e das contas-isca das missões (100–1400) | variável | `generateMissions.php:192` |
| Bounty do FBI (pago ao derrubar IP procurado via DDoS) | soma `fbi.bounty` | `Storyline.class.php:322` |
| Guerra de clã (bounty ÷ influência) | `Σ power/10` | `Clan.class.php:4096`, `cron/endWar2.php:~75-115` |
| Desarmar Doom | $100.000 | `PC.class.php:8392` |
| Missões Doom (seed money) | $25k (cracker) / $100k (doom) ; prêmio da missão 1 bilhão | `PC.class.php:8043-8070`, `Mission.class.php:1742` |
| Vender BTC | `ceil(btc*preço)` | `Finances.class.php:60-71` |
**Fórmula de coleta de vírus** (`List.class.php:650-770`): precisa de `.vcol` (collector). Por vírus ativo: só paga se `segundos desde lastCollect >= 600`.
`money = ceil( seg * rate * hardUsage * (1 + 2*ver/1000) * bonus / nVirusDoMesmoTipoNoIP )`, `bonus = 2` com 5% (`rand(1,20)==1`, `:~690`), `rate_efetiva = base/2` (`:~722`).
- spam: base 0,00000694 $/MHz·s (=$0,025/MHz·h, efetivo $0,0125) × CPU do alvo; warez: precisa torrent; base por versão do torrent 10→0,000555556 … 50→0,001111111 por Mbit·s (=$2…$4/Mbit·h, /2) × NET do alvo; miner (virusType 4): base 0,00010417/3600 BTC por MHz·s ×CPU (efetivo ≈0,0000521 BTC/MHz·h → ~5 BTC/dia por host de 4 GHz) — **só se tiver wallet**.
- Total ×`(1 + versãoCollector/1000)`; EXP `COLLECT`: `round(total*0.1)` ou `btc*600`.
**Bitcoin** (`bitcoin.php`, `Finances.class.php:36-257`): preço = API real `blockchain.info/q/24hrprice` (fallback 472) → `bitcoin_getValue :36-50`. Wallet: endereço `'1'+33 chars`, key 64 chars, criada com **1,337 BTC** como bônus ao terminar a missão-tutorial 84 (`Finances.class.php:225`, `Mission.class.php:~1230`). Comprar: `amount>0`, saldo total ≥ `amount*preço`, debita `ceil(amount*preço)` (`bitcoin.php:113-190`). Vender: **mínimo 1 BTC** (`:214`). Transferir wallet→wallet: valida 34 chars, existe, ≠ próprio, ≤ saldo (`:25-84`). 7 casas decimais. Wallets não são crackeáveis por brute-force; a key vaza no log da vítima ao coletar/transacionar (wiki `en/bitcoin.txt`). Mercado BTC = NPC tipo 40.
**Sinks** (o que drena): certificações ($50/$200/$500, §4), clã ($1000, `Clan.class.php:3146`), upgrades de hardware e pesquisa de software (fora do meu escopo; `moneyHardware`/`moneyResearch` em `users_stats`), reset de IP/senha (abaixo), compra de BTC (vira ativo), penalidade de abortar missão (só -10% EXP, `Mission.class.php:1716`; a wiki fala em "$500+prêmio" mas está comentado no código `:1712`).
**Reset de IP/senha como sink escalonado** (`Player.class.php:1436-1583`): espera após n-ésimo reset: 3h,6h,12h,24h,48h,96h,168h; se já passou esse tempo é grátis; senão paga. IP: `100 + 500n + n^3.8/10` (teto 100.000). Senha: `50 + 10n + n^3.2/10`. EXP: reset IP +50, senha +15.
**Limites**: não há limite diário de transferência; limite implícito = Safenet/FBI. Round apaga TUDO (`cron/finishRound.php:241-327`: `DELETE bankAccounts`, `bitcoin_wallets`, `software`, `hardware`, `missions`, `fbi`, `safeNet`, `clan_war`...). Persistem: usuários, badges, certificações, clãs (power=0), Hall of Fame, `users_stats` zerado (exp, contadores).

## 2. MISSÕES
**Geração** (`cron/generateMissions.php`): roda no crontab a cada **15 min** (`crontab` `*/15`; `info/cron.txt` fala "hourly" — divergência), só se round ativo (`:17`), apaga TODAS as missões `status=1` não aceitas (`:26`) e recompõe o pool: **50 (nível 1), 30 (nível 2), 25 (nível 3)** (`:266-268`). Missões não acumulam.
Contratante e vítima = NPCs "hirer" distintos: nível1=tipo 71 (15 empresas: elgooG, Murder King, Microlost, Pineapple, Hell Computers, WTF, Stalker, GayPal, Noplace, uPay, McDiabetes, Gimme Your Bucks, Capitalism, Fiasco Systems, Very Cheesy Pictures), nível2=72 (10: Hacker Inside, CatVideos, Nokids, Life's Though, Titanic, Oh Deere, Fail, Insane, Elvi's, Broke), nível3=73 (10: Sexsi, Nothing to do, Oops, Sunk Microsystems, Toshibe, Weird, Nuke, Pervert, Yahoo?, Abersnobby & Bitch) (`json/npc.json`).
**Distribuição de tipo** (`:90-107`): `r=rand(1,100)`: <30→T1 (29%), <60→T2 (30%), <80→T3 (20%), <90→T4 (10%), senão T5 (11%).
**Prêmio** (`:111-134,253`): base T1 150–350, T2 250–450, T3 500–750, T4 1000–1500, T5 3000–5000 (wiki diz 2000–3000, desatualizado); nível2 ×1,25 e depois ×1,1 hirer (=×1,375); nível3 ×1,5 ×1,2 (=×1,8); nível1 ×1. Valor esperado nível 1 ≈ $870/missão.
**Nível do jogador** = versão do melhor cracker: <3.0→1; 3.0–5.9→2; ≥6.0→3 (`Mission.class.php:1310-1327`); só aceita missão do próprio nível (`:1337-1349`). Só 1 missão por vez (`:82`). Exige tutorial concluído (`:72`). Hirers só aparecem se estiverem na "hacked database" do jogador (wiki `en/missions.txt` "Hidden Missions").
**Tipos** (`info/mission.txt`, `Mission.class.php:212-590`):
| Tipo | O que fazer | Completa quando | Exemplo de texto |
|---|---|---|---|
| 1 delete (rate 1.0) | hackear vítima e **apagar** arquivo X (soft type<7) | apagar o software "pertinente" (`Process.class.php:2292`) | "wipe out the file *Xpto.crc*" |
| 2 copy/steal (2.0) | baixar arquivo X da vítima e **subir no hirer** | upload do software certo (`Process.class.php:2118`) | "upload the file…to our servers" |
| 3 check balance (3.0) | invadir banco vítima, ler saldo da conta #N e **informar o valor digitado** | valor == `newInfo` (`Mission.class.php:~145`); conta-isca cash 100–1400 | "check the total balance… They say they have no money" |
| 4 transfer (5.0) | transferir TODO o dinheiro da conta A (banco vítima) para a conta B do hirer | transferência (`Internet.class.php:3912`); contas podem estar em bancos distintos (2 logs); B tem cash 0–2500 | "transfer all the money from #A to #B" |
| 5 DDoS (20.0) | derrubar servidor da vítima (precisa ≥3 vírus DDoS + poder≥15000 no NPC já "seized") | `down==1` (`PC.class.php:7640`) | "DDoS'em and seize their hardware" |
| 50–54 Doom | storyline (§3) | — | "Doom the world" |
| 80–84 tutorial | cadeia de 5 etapas (§3) | — | "retrieve Users.dat" |
Observação: contas de T3/T4 são apagadas 2 dias depois da conclusão (`Mission.class.php:1198-1220` + `cron2/removeExpiredAccs.py`), o jogador pode roubar o saldo antes ("chance de roubar o dinheiro", wiki).
**Texto**: 6 blocos (saudação/intro/chamada/pagamento/local/aviso), cada um com 2–4 variantes sorteadas por seed salvo em `missions_seed` (`:593-660`) — dá para portar como templates.
**Conclusão**: prêmio na conta mais rica, grava `missions_history`, EXP `50 + prêmio*0.05` (`Session.class.php:462`), `moneyEarned`. **Abortar**: permitido se tipo<49; perde 10% do EXP (`Mission.class.php:1709-1721`), grava `completed=0`; 5 abortadas = badge N00b. **Falha/expiração**: não existe prazo para missão aceita; só some se o round acabar. Taxa de sucesso = `completed/total`.

## 3. STORYLINE / NPCs / MUNDO
**Enredo** (`classes/Storyline.class.php:1042-1066`, wiki `en/storyline.txt`): Geek Pride Labs (MD, tipo 20, CEO Stella Camargus) criou o **Doom Virus**, entregue à NSA (diretor B. Kate). Snowden vaza; **Numataka Corp / NumaCorp (EVILCORP, tipo 30, CEO Ensei Tankado)** contrata freelancers para hackear a NSA. O jogador é o hacker contratado.
**Cadeia tutorial** (`Storyline.class.php:1028-1066`, `Mission.class.php:1818-1900`, `Ranking.class.php:542-587`): cert1 "Basic tutorial" (grátis) → auto-libera cert2 → ao concluir cert2 chama `tutorial_start`: cria 2 vítimas NPC tipo 80 (somem em 7 dias), manda e-mail de Tankado (-1), dá um cracker v1.0. Missões 80 (pegar `Users.dat`, prêmio $500) → 81 (arquivo não está lá, vá ao log; muda IP da vítima) → 82 (recebe vírus `heartbleed.vspam`, instale no IP do apagador) → 83 → 84 (ao concluir: e-mail de boas-vindas + **cria wallet com 1,337 BTC**). Só depois liberam missões normais.
**Doom** (`PC.class.php:7978-8450`, `Process.class.php:3188-3200`, `cron/doomUpdater.php`): ao pesquisar um cracker **≥ versão 9200 (92.0 no dado)** o jogador recebe missão 50 (hackear NSA, baixar DooM) + $25.000. Missões: 50 pesquisou CRC X; 51 baixou doom ($100k); 52 baixou CRC X; 53 recebeu doom por upload ($100k); 54 recebeu CRC X por upload. Prêmio de todas: **$1.000.000.000** (`Mission.class.php:1742`). Lançar Doom exige 500 MB livres, instala no PC do jogador ou no servidor do clã, **duração 6 h** (`:8143`), cria `virus_doom`, Safenet(motivo 2, 1 semana) + FBI (bounty $100.000, 1 semana), notícia "Doom revealed", badges 11/71. Para parar: DDoSar o lançador até o hardware cair e apagar o `.vdoom`; recompensa $100.000, badges 12/71. Se chegar a 0: `finishRound.php` (round acaba, badge 14 Doom Master). `finishRound.php` está desativado com `exit()` na linha ~5 (precisa ser habilitado manualmente).
**NPCs** (`json/npc.json`, `info/npcType.txt`): 1 banco(5), 2 Whois(4; o "First Whois" tem IP fixo 1.2.3.4), 5 ISP, 6 NPCs comuns(3), 7 puzzle(47; mini-games tictactoe/2048/lightsout/minesweeper/sudoku, `json/riddle.json`, EXP +25), 8 Download Center, 10 clan server, 20 MD (Geek Pride Labs), 30 Numataka Corp, 40 Bitcoin Market, 45 Torrent Market, 50 Safenet, 51 FBI, 52 NSA (cpu8000/ram4096/net1000), 61/71/72/73 hirers, 80 tutorial, 99 bot. Hardware definido por NPC (cpu 1000–8000 MHz, hdd 10–50 GB, net 10–1000).
**População do mundo** (`python/npc_generator.py`, `cron2/newRoundUpdater.py`): a cada round apaga NPCs (≠80) e recria a partir do JSON; IP = random (exceto First Whois), senha 8 chars; softwares por NPC vêm de `software_original` (`software_generator.py`); `npc_reset.nextScan` = agora+rand(1..50)h. Jogadores recebem `gameIP` e `gamePass` novos, 1 "Server #1" e 1 conta bancária; cada clã ganha novo NPC tipo 10.
**Manutenção do mundo**: `antivirusNPC.py` (3/3h; se `nextScan<now`): apaga vírus instalados no NPC, avisa os donos (`lists_notifications` tipo 3) e reagenda **+1 dia** (comentário do código diz 7 dias); `restoreNPC.py` repõe softwares originais; `removeDownNPC.py` religa NPCs derrubados (2 h de queda); `removeExpiredNPC.py` apaga NPCs do tutorial.
**Safenet / FBI** (`Storyline.class.php:21-488`):
- Motivos: 1 DDoS, 2 Doom, 3 Transferência ilegal, 4 Deletar arquivo.
- `safenet_add` duração: DDoS `round(poder*0,8)` s; Doom 604800; Transfer `max(3600, amount*0,01)`; Delete 1000. Reincidente (`safenet_update`): +`poder*0,1`/+`max(3600,amount*0,01)`/+1000 s. E-mail "Safenet is tracking you" (-3).
- FBI (`fbi_add`, só se já estiver na Safenet): bounty DDoS `poder/100`; Doom 100.000; Transfer `min(100000, amount*0,10)`; Delete 1.000. Duração: DDoS `poder*0,8` (reincidente `*0,1`), Doom 604800, Transfer `amount*0,01`, Delete 600. E-mail "FBI suspect" (-2); "Bounty increased".
- **Pegar o procurado**: quem faz DDoS bem-sucedido num IP presente em `fbi` recebe a soma dos bounties na conta mais rica, o IP sai de `fbi`+`safeNet`, vira notícia (`PC.class.php:7725-7735`) e badge 71. Alvo procurado não gera novo Safenet/FBI (`PC.class.php:8506`).
- **Probabilidades reais**: o dado é `rand(1,10)/10` ∈{0,1…1,0} e o teste é `odds >= dado` ⇒ odds 0,01 nunca dispara; 0,1→10%; 0,25→20%; 0,5→50%; 1,0→100%.
  - DDoS (`PC.class.php:8501-8570`): poder ≤20000: Safenet 0,1/FBI 0,1; 20–25k: 0,25/0,1; 25–35k: 0,5/0,25; >35k: 1,0/0,5.
  - Transferência: **dois blocos somados** (`Internet.class.php:3944-3974`: ≤10k: 0,1/0,1; 10–25k: 0,25/0,1; 25–50k: 0,5/0,25; >50k: 1,0/0,5) **e** `Storyline.class.php:222-269` (≥100k: odds=`min(50,⌊amount/10000⌋)/100`; <100k: 0,01).
- Cron: `safenetUpdate.php` (*/30) apaga expirados e escreve no servidor Safenet um arquivo `Fwd to FBI` (softType 30) listando IPs rastreados (jogador pode hackear Safenet e editar/deletar). `fbiUpdate.py` (*/5) apaga FBI expirado.
**Remetentes de sistema** (mail/news): 0 Unknown, -1 Numataka, -2 FBI, -3 Safenet, -4 Social Clan, -5 Clan news, -6 Social, -7 Badge Advisor, -8 Game System (`info/npcType.txt`, `Mail.class.php:764-796`, `News.class.php:54-67`).

## 4. UNIVERSIDADE / CERTIFICAÇÕES (`certs.php`, `Ranking.class.php:373-607`, `university.php`)
Sequencial (precisa da anterior, `cert_haveReq :598`), 1 por vez. **Sem timer**: custo em $ e leitura de páginas; completar = link `md5('cert'+id+uid)` (`university.php:132`) — dá para pular.
| # | Nome | Preço | Págs | Libera |
|---|---|---|---|---|
| 1 | Basic tutorial | 0 | 3 | acesso à universidade; dispara cert 2 |
| 2 | Hacking 101 | 0 | 3 | internet/browser, brute-force, hack de banco(?), instalar vírus; **inicia tutorial** (`Internet.class.php:2142`, `internet.php:18`) |
| 3 | Intermediate hacking | $50 | 2 | exploits (xp), port scan/NMAP/analyze (`Internet.class.php:316,512,2153`) |
| 4 | Advanced hacking | $200 | 3 | DDoS (`list.php:140`) |
| 5 | DDoS security | $500 | 1 | firewall passa a mitigar DDoS |
Cada cert: EXP +100; ao ter 5 → badge 54 Student. `certs/6-1.php` existe mas é cópia (não usado: `ranking handlePost` aceita id≤6, tabela só tem 5). Mensagem do cert 3 diz "hackear banco" mas o código de hack de banco checa cert 2 (incerto qual vale). A universidade também tem aba "Research" (pesquisa de software) — fora do meu escopo.

## 5. SOCIAL
**EXP/Reputação = ranking** (`Session.class.php:420-543`). Tabela completa de EXP por ação:
| Ação | EXP |
|---|---|
| LOGIN | 1 (autor comenta que foi péssima ideia) |
| EDIT_LOG | local 1 / remoto 3 |
| REMOTE_LOGIN | download 1; banco 25; clã 3; outro `15 - (verAtacante-verDefensor)` mín. 5 |
| HACK | `50 + round(vCRC+vPEC)` |
| CERT | 100 |
| MISSION | `50 + prêmio*0,05` |
| TRANSFER | `200 + amount/15` |
| RESEARCH | `35 + versão` (×2 na parte do bônus se tipo ≤4) |
| BUY | licença `25+v`; PC 2º=100, 3º=500, n≥4=500n; XHD 100n; hardware `5+custo/10` |
| ACTIONS (up/download/delete) | `round(size/10)` (net ×2), mín 1, máx 15 |
| AV | local 10×, remoto 15× |
| DOOM | 10.000 |
| DDOS | `250 + poder*0,01` (100 se já seized e dano 0) |
| COLLECT | cash `total*0,1`; BTC `btc*600` |
| PUZZLE 25 / NMAP `25+25n` / ANALYZE 15 / reset IP 50 / reset senha 15 |
Abortar missão: `exp*0.9`. **Nível** (`Ranking.class.php:160`): <100→1, <500→2, <1000→3, <2500→4, <5000→5, <10000→6, <20000→7, <40000→8, <80000→9, ≥80000→10.
**Ranking de jogadores**: ordenado por `exp` (reputação); só entra no ranking quem tem `exp>1000` (`cron2/updateRanking.py:~13`). Atualiza a cada hora no crontab (info diz 30 min): `updateCurStats → updateRanking → rank_generator`. Rankings paralelos: clã (por `clan.power`>0), software (maior versão pesquisada), DDoS (maior `round_ddos.power`, só vítimas jogadores). Top 10 de cada vira badges no fim do round.
**Hall of Fame** (`Fame.class.php`, `python/fame_generator*.py`): histórico por round (`hist_users`, `hist_clans`, `hist_software`, `hist_ddos`, `hist_clans_war`, `hist_missions`, `hist_doom`) + all-time; só aparece a partir do 2º round.
**Clãs** (`Clan.class.php`, `clan.php`, `war.php`): criar custa **$1000** (`:3146`), nome ≤25 (`azAZ09_ .!-`), tag 3 chars; cria NPC clan-server (tipo 10) + fórum; `slotsTotal=6` e `moneyTax=20` gravados mas **sem enforcement encontrado** (só `slotsUsed` é contado); authLevel 4=dono, 3=co-dono, novo membro 1 (`:2727`, `:3956`). Sair sendo dono apaga o clã (`:3328`). Convites e pedidos via `clan_requests`; kick/permissões por nível.
**Pontos de poder do clã** (`Clan.class.php:4051-4094`): cada DDoS do membro: `+poder*mult*0,01`, mult = NPC comum 1; jogador sem clã 3; jogador com clã (sem guerra) 5; jogador de clã em guerra **ou** clan-server 10. Clã vencedor soma `totalPower` do score no `power`.
**Guerra** (automática! sem declarar): `cron/defcon2.php` (a cada 10 min) detecta guerra quando: (a) ≥2 atacantes do clã A atacam jogadores do clã B **e** B revida em A, ou (b) 1 atacante bate ≥2 jogadores de B e B revida, ou (c) A ataca o clan-server de B e B revida. Registros `clan_defcon` expiram em 3 dias. Cria `clan_war` de **2 dias**, badge 62 para quem iniciou. Cada DDoS entre os clãs em guerra: `score += poder`, `bounty += poder/10` (`Clan.class.php:4096`). `cron/endWar2.php` (10 min): maior score vence (**empate = `continue`, guerra nunca fecha**: bug), bounty dividido por influência `ceil(bounty*poderDoJogador/totalPower)` na conta mais pobre de cada DDoSer, vencedor `won++` e `+totalPower` ao power, e-mails (-5), notícia, badges 60/61/71/85.
**DDoS** (`DDoS.php`, `PC.class.php:6940-7640`): requer cert 4, IP na hacked database (`List`), **≥3 vírus DDoS ativos** (`:7270` / `DDoS.php`), não pode ser em si mesmo. Poder = `CPU + NET*10 + Σ(cpuBot + versãoVirus*5)`. Penalidades: hardware base ⇒ `/2`; "noob" (vítima sem cracker, ou cracker vítima ≤2.0 e atacante >+1.0, ou `2*vVit < vAtk`): `/(2+n)` e se ≥100000 `*0,1`. Dano por 4 componentes (CPU/RAM/HDD/NET): <10k: 15% de 1; <15k: 30% de 1–2; <20k: 50% de 1–3; ≥20k: `rand(2,4)` ou `ceil((p-20000)/2000)±2`; +1 por componente do alvo no nível mínimo. **Mitigação** (cert 5, firewall da vítima): v<30 → 0–1, <50 → 1–2, <100 → 2–3, <150 → 3–4, <200 → 4–5, ≥200 → nulifica (`:6966-7000`). "Seized" = hardware no nível base; registro em `round_ddos` com `poder/5`; NPC seized + poder≥15000 ⇒ NPC cai por 2 h. Clan points contam `poder/5` se seized.
**Mail** (`mail.php`, `Mail.class.php`): jogador↔jogador (não pode para si; assunto `azAZ09.,!? _-$()"'`; regras "não compartilhe IPs/ofenda/seja legal"), mais mensagens de sistema por `from` negativo; `mails_history` guarda o prazo do Safenet/FBI e o bounty. Badges Talker (100 enviados) / Famous.
**News** (`news.php`, `News.class.php`): autores 0/-8 Game news, -1 Numataka, -2 FBI, -5 Clan Battle Advisor; geradas por: Doom revelado/desarmado, FBI seize, fim de guerra, "Round #N started" (`newRoundUpdater.py`). Ter nome na notícia = badge 71.
**Amigos** (`Social.class.php:451-539`): pedido/aceite; badge 48 com 10, 49 com 50 (json diz 30; código usa 50).
**Premium** (`premium.php`, `Premium.class.php:870-890`): US$5,99/mês, 4,99×3 (14,99), 3,99×6 (23,99)… Benefícios = **só cosmético**: sem anúncios, web server pessoal, badge premium (5), assinatura custom, nome com estrela, notificações. Expirar dá badge Donator (80) (`cron2/removeExpiredPremium.py`). Nenhuma vantagem de gameplay encontrada. **Não copiar** (sem monetização).

## 6. BADGES (`json/badges.json`, `info/badges.txt`, `python/badge_hunter*.py`)
Flags: *round* = reconcedida a cada round; *coleção* = vitrine. Staff (1 Developer, 2 Admin, 3 Moderator, 4 Translator, 5 Premium, 6 Beta, 80 Donator) são manuais.
| ID | Nome | Critério | Gatilho |
|---|---|---|---|
| 7/8/9/10 | Best Player / Runner up / 3rd / Almost there | top1/2/3 / 4–10 do ranking de usuários no round | fim de round |
| 72–75 / 76–79 / 81–84 | idem p/ software / DDoS / clã | top1/2/3 / 4–10 | fim de round |
| 11 Doom the World | lançou Doom | `PC.class.php:8257` |
| 12 Anti-Doom | desativou Doom | `:8387` |
| 13 DDoS | primeiro DDoS que causa dano | `:7619` |
| 14 Doom Master | Doom completou | fim de round |
| 15 Go Multi | comprou 2º servidor | `PC.class.php:787` |
| 16 Clock Maniac / 17 Overclocker | upgrades no máximo (1+ / todos servidores) | `:962/971` |
| 18/19/20/21 Storage/Processor/Memory/Internet Maniac | HDD/CPU/RAM/NET no máximo | `:949,921` |
| 22 H4x0r | ≥100 IPs na hacked DB | `badge_hunter.py` (30 min) |
| 23 B4nk3r | ≥50 contas bancárias na lista | idem |
| 24/26/29/32/34 (por round) e 25/27/28/30/33/35 (geral) | ganhar/transferir/gastar pesquisa/enviar warez/spam com limites `$x` | **não implementado** (placeholders "x") |
| 31 Web Celeb | 1000 cliques no perfil | `badge_hunter_all` |
| 36 Employee / 37 Addicted | 50 missões no round / 500 geral | hunters |
| 38 I Can't Handle / 39 Noob Cert | 20 resets de IP no round / 100 geral (json fala 200) | hunters |
| 40 Addicted Player / 41 I Need Help | ≥24 h no round / ≥14 d geral (código compara `timePlaying>=86400` em minutos = 60 dias: bug) | hunters |
| 42/43/44 | conta com 1/2/5 anos | `badge_hunter_all` |
| 45 Loyal Player | ficou no mesmo clã o round todo | TODO |
| 46 Powerful Member / 47 I Am Your Hacker | reputação 1M / 10M | hunters |
| 48 Social / 49 Go To Facebook | 10 / 50 amigos | `Social.class.php:516-534` |
| 50 Badge Hunter | 30 badges | — |
| 51 Who Ate My RAM? | ≥20 softwares rodando | hunter |
| 52 Downloader | >50 GB de HD usado | `PC.class.php:4101` |
| 53 Googler | todos os "important IPs" | `Internet.class.php:3661` |
| 54 Student | todas as certs | `Ranking.class.php:537` |
| 55 I Haz Money | >$1.000.000 somando contas | hunter |
| 56 DDoSer / 57 DDoS Master | 100/round, 1000/geral | hunters |
| 58 N00b | abortar 5 missões | `Mission.class.php:1683` |
| 59 Efficient | ≥10 missões e taxa >95% | hunter |
| 60 300 / 61 War Lord / 62 Dat Guy / 85 Bad Ass | participar / mais influente / iniciar / vencer guerra | `endWar2.php`, `defcon2.php` |
| 63 Talker / 64 Famous | enviar 100 / receber 50 e-mails | hunter all |
| 65/66 Researcher / Software Engineer | 50 pesquisas round / 500 geral | hunters |
| 67 Hacker / 68 Top Hacker | 100 hacks round / 1000 geral | hunters |
| 69 What'ya doin'?? | >50 processos | hunter |
| 70 Hipster | 1º HD externo (XHD) | `PC.class.php:830` |
| 71 Hacker News | nome citado em notícia | Doom/FBI/guerra |
| 86 Feels like a clan | clã com 5+ membros | só `info/badges.txt:353` (sem JSON) |
`badge_config.php` = só nome/descrição (para UI).

## 7. JOBS PERIÓDICOS (`crontab` real; `info/cron.txt` diverge)
| Intervalo | Job | O que faz |
|---|---|---|
| 1 min | `doomUpdater.php` | fecha round quando `doomDate<now` (status 3 → `finishRound`) |
| 1 min | `newRoundUpdater.py` | round `status=0` com `startDate<=now` → gera NPCs, IPs, hardware, conta por jogador, status=1, notícia "Round #N started" |
| 5 min | `fbiUpdate.py` | apaga FBI expirado |
| 10 min (:05,15…) | `defcon2.php`, `endWar2.php` | detecta/encerra guerras |
| 15 min | `generateMissions.php`, `restoreNPC.py`, `removeExpiredLogins.py` (:05,20,35,50) | repõe missões/NPCs; limpa sessões >10 h |
| 30 min | `safenetUpdate.php`, `badge_hunter.py` (:19,:49) | expira Safenet + arquivo "Fwd to FBI"; badges de contagem |
| 1 h | `updateCurStats` → `updateRanking` → `rank_generator` (:00), `removeExpiredAccs/NPC/Premium` (:09,:19), `removeDownNPC` (:02), `updateServerStats` (:10), `badge_hunter_all` (:19), `removeExpiredHTMLPages` (:40), `query_counter` | rankings e limpezas |
| 3 h | `antivirusNPC.py` (:10) | apaga vírus em NPCs vencidos |
| 4 h/6 h | `backup_game/forum` | backup |
| Fim de round | `finishRound.php` | salva histórico, concede badges, apaga tudo, cria round+1 (início em +1 dia) |
(cron.txt cita `restoreNPC` diário 4h e `generateMissions` horário; o crontab real diz */15 — usar crontab.)

## 8. PRONTO PARA PORTAR (10 mecânicas)
**1. Quadro de missões com pool fixo por nível (substituível).** Encaixa nas missões do jogo e no nível = tier do cracker na árvore de habilidades.
```js
const POOL={1:50,2:30,3:25}, MULT={1:1,2:1.375,3:1.8};
const TYPES=[[29,'delete',[150,350]],[59,'steal',[250,450]],[79,'check',[500,750]],[89,'transfer',[1000,1500]],[100,'ddos',[3000,5000]]];
function genBoard(level){ deleteWhere({status:'open',level});
  while(count({status:'open',level})<POOL[level]){ const r=rnd(1,100);
    const [,type,[a,b]]=TYPES.find(t=>r<=t[0]); insert({type,level,prize:Math.round(rnd(a,b)*MULT[level]),hirer:pick(level),victim:pickOther(level)}) } }
// pg_cron '*/15 * * * *' -> select gen_board(1),(2),(3)
const missionLevel=v=>v>=60?3:v>=30?2:1; // versão do melhor cracker (×10)
```
**2. Tabela de EXP/Reputação por ação** (§5) + níveis 1–10 por limiar. Alimenta ranking e desbloqueios; use como evento `grantXp(action, ctx)` numa só função SQL.
**3. Safenet → FBI → Bounty ligado ao Heat.** Estágio 1 (Safenet = "observação") e estágio 2 (FBI = "procurado" com bounty que OUTRO jogador pode coletar derrubando o IP).
```js
function afterIllegal(player, reason, magnitude){
  const odds = oddsFor(reason, magnitude); // tabelas §3; use die=rnd(1,10)/10 e odds>=die
  if(!watch.has(player,reason)){ if(odds.safenet>=die()) watch.add(player,reason,duration(reason,magnitude)); }
  else { watch.extend(player,reason,extra(reason,magnitude)); if(odds.fbi>=die()) wanted.addOrExtend(player,reason,{bounty:bounty(reason,magnitude),dur:wantedDur(reason,magnitude)}); }
}
// heat += f(stage). Seize: ddosSuccess(target) && wanted.has(target) => pay(attacker, sum(bounty)); clear(target)
```
Mapeia para a Polícia/Heat: Safenet = Heat 1 (rastro), FBI = Heat alto + recompensa PvP.
**4. Transferência sem taxa, mas com logs em ambos os lados + EXP `200+amount/15`.** O risco vem do rastro e do Heat. Combine com a quitinete (várias contas, `debitSpill()` que drena a maior conta e sobra nas demais).
**5. Renda passiva do botnet (210 bots).** Spam/warez/miner com `seg≥600`, `5% x2`, `/nVirus`, `(1+2v/1000)`, multiplicador do collector. Encaixa em especialidades (collector = habilidade).
```js
function collect(bot){ const s=secs(bot.lastCollect); if(s<600) return 0;
 const eff=BASE[bot.type]/2; let m=s*eff*bot.hw[bot.res]*(1+2*bot.ver/1000)*(rnd(1,20)==1?2:1)/botsSameTypeOnHost;
 return Math.ceil(m)*(1+collector.ver/1000); }
```
**6. Mercado BTC com preço controlado** (random-walk em vez de API real), compra/venda mín. 1 BTC, minerador consome CPU. Evita explosão econômica (§9).
**7. Progressão por certificações** (5, sequenciais: 0/0/50/200/500) mapeadas para nós da árvore de habilidades: Basic→Hacking101(cracker/brute/banco)→Intermediate(exploits/scan)→Advanced(DDoS)→DDoS Security(mitigação).
**8. DDoS com poder agregado + dano por tiers + mitigação por firewall + anti-noob.** `power=cpu+net*10+Σ(bot.cpu+v*5)`; tiers de dano e mitigação v<30…≥200 (§5). Use os 210 bots como "vírus DDoS"; exija ≥3 bots ativos.
**9. Clãs com guerra automática por retaliação.** Sem "declarar": detecta por `clan_defcon` (3 dias de memória), guerra 2 dias, score=poder, bounty=poder/10 distribuído por influência. Pontos de clã com multiplicador 1/3/5/10.
```sql
-- war_detect (cron 10min): para cada par (A,B) com (>=2 atacantes distintos de A ou >=2 vítimas de B ou clanServer) E existe ataque B->A
insert into clan_war(a,b,ends_at) values(A,B,now()+interval '2 days');
-- end: winner = max(score); payout_i = ceil(bounty*power_i/total_power)
```
**10. Estrutura de temporada (round) + Hall of Fame + badges de topo.** Reset de dinheiro/hardware/software/missões/FBI mantendo badges, certs e clãs; top 10 vira badge; Doom como evento de fim de temporada (6 h, DDoSar o lançador para parar, recompensa $100k/$1bi). Se não quiser reset total, use "season layers".
**Extra barato**: sinks escalonados de reset de IP/senha (tempo+`100+500n+n^3.8/10`), badges com flags `collectible/per_round`, e-mails de sistema com remetente fixo (FBI/Safenet/Numataka/Badge Advisor/Clan news), textos de missão por template com seeds.

## 9. ARMADILHAS (não copiar)
- **SQL injection** por todo lado: concatenação direta (`Finances.class.php:99,262,570,578,623,...`, `Storyline.class.php` quase todo, `List.class.php`) → use RPC/params e RLS do Supabase.
- **Estado de jogo em `$_SESSION`** (MISSION_ID, BANK_ACC...) e GETs com `md5` previsível para concluir cert (`university.php:132`): no web, validar tudo no servidor/RPC.
- **Senhas de banco em texto puro** (6 chars, `mt_rand`), fraco por design; não é porta-segurança.
- **Corridas de concorrência**: `UPDATE cash=cash-X` sem transação/locks; `debtMoney` pode **loop infinito** quando não há outra conta com saldo (`Finances.class.php:511-536`, `tmpAcc` falso) → use transação e `CHECK(cash>=0)`.
- **Probabilidades quantizadas** (`rand(1,10)/10` vs odds 0,01/0,25 → nunca/20%) e **dois blocos de odds somados** na transferência (`Internet.class.php:3944` + `Storyline.class.php:222`) → defina odds reais únicas.
- **BTC com preço real** (API externa, fallback 472): quebra o balanceamento (miner ~5 BTC/dia por host). Use preço simulado.
- **Empate de guerra nunca encerra** (`endWar2.php: continue`), `slotsTotal` sem enforcement, `timePlaying` em minutos vs badge em segundos (86400), badges com `$x` placeholders, "Loyal Player" TODO, `finishRound.php` com `exit()`, wiki/UI divergente do código (prêmio DDoS, penalidade de abort, `antivirusNPC` 7d vs 1d, crontab vs cron.txt).
- **Round com reset total semanal** é engajamento de nicho (jogador perde tudo); considere temporadas parciais. **Bounty de clã sai do nada** (impressão de dinheiro); cheque inflação.
- **Premium/Paypal/PagarMe/Facebook/Twitter/fórum phpBB/ads** = monetização e integrações específicas: ignorar. Premium só vende cosmético, mas o conceito "Donator badge" também.
- **Nomes/marcas**: elgooG, Microlost, Pineapple, GayPal... são paródias (ok), mas "Sexsi", "Pervert", "Abersnobby & Bitch" são de gosto duvidoso → rever. Textos do FBI ("Hey bitch, FBI is now looking for you") idem.
- **PHP-isms**: `ctype_digit`, `ip2long`/INET_ATON como chave de identidade (jogador = IP), `die()` no meio de classes, `hacked database` por IP único; em JS/Postgres use UUID e `bigint`.
- **Pouco claro / incerto**: (a) qual cert realmente libera hack de banco (cert 2 no código, cert 3 na msg); (b) tipo exato da versão 9200 do cracker (92.0 ×10?) e como `research_calculateSize` interfere; (c) se `slotsTotal` é checado no JS do clã; (d) comportamento exato de `hidden missions` no `missions.php`; (e) valores de EXP por ação variam por `info[]` que passei em resumo (`Session.class.php:420-543` tem o código completo).