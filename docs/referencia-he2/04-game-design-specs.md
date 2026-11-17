# Game design do HE2 (repositórios GameDesign e specs)

> Fontes: [GameDesign](https://github.com/HackerExperience/GameDesign) e [specs](https://github.com/HackerExperience/specs), sem licença declarada. Uso conforme [`PERMISSIONS.md`](../../PERMISSIONS.md) (autorização do autor por e-mail, a registrar).
> **Aviso:** o material é fino. `STATUS.md`, `CONTRIBUTING.md`, `missions.md`, `overview.md` e `software.md` são stubs, não há tabela de balanceamento, história nem lista de NPCs.
> Marcas ("Hacker Experience", "Neoart Labs", "Helix") **não** entram no nosso jogo.

# Relatório: material de design HE2 (he-gamedesign + he-specs)

Li todos os arquivos de texto das duas pastas. Ignorei he-notes, como pedido. Os caminhos abaixo são relativos a `/home/littlecoffee/Documentos/DEV/referencias/`.

**Aviso sobre o conteúdo.** O material é bem mais fino do que o tamanho sugere:
- `he-gamedesign/STATUS.md` e `CONTRIBUTING.md` contêm só "TODO". `he-specs/hacker_experience_2/history.md` e `privacy.md` estão vazios (só o título).
- `game_mechanics/missions.md`, `overview.md` e `software.md` são stubs. `software.md` tem apenas uma lista de nomes.
- Não existe nenhuma tabela numérica de balanceamento. Os únicos números são portas de conexão, 0.005° de grade, 10 jogadores por missão e 3/5 NPCs por conquista. Não existe fórmula de duração de brute-force ou exploit; o próprio texto diz "unknown".
- Não existe história/storyline nem lista de NPCs ou empresas nomeadas. O sidebar (`he-gamedesign/en/sidebar.txt`) lista páginas de Storyline, Universe, Skills, University etc. que nunca foram escritas.
- Tudo abaixo vem de `he-gamedesign/en/*` (arquivo `.txt`) ou `he-specs/*` (arquivo `.md`). Citei literalmente entre aspas apenas o que importa.
- Sobre o que o Helix implementou, só sei por conhecimento geral do projeto e não verifiquei o código. Marco como **(incerto)** onde não tenho certeza.

---

## 1. RESUMO DA VISÃO DO HE2

*(fontes: `he-specs/hacker_experience_2/principles.md`, `objectives.md`, `README.md`; `he-gamedesign/README.md`, `STATEMENT.md`)*

**O que é.** O HE2 é uma *simulação* de hacking multiplataforma, com um mundo geolocalizado. O README das specs diz que o documento descreve "o jogo que gostaríamos de ter no futuro" e que "nem todas as specs entraram na versão pública". Ou seja, é um documento de aspiração, não de escopo.

**Princípios** (`principles.md`):
- **Openness**: o jogo é software livre, com "free" no sentido de liberdade e não de gratuidade. Pode ser vendido ou monetizado por serviços.
- **Transparency**: compartilhar tudo, incluindo os altos e baixos da startup.
- **Quality**: "unacceptable to have a low quality, poorly designed software or user interface". Falta de conformidade é prioridade alta.
- **No technical knowledge required**: metade do público não sabe computação e isso não pode ser problema. Vale também para contribuir.

**Objetivos** (`objectives.md`):
- **Simulation**: "simulate reality as accurate as possible, while keeping the game enjoyable". É uma suspensão de descrença assumida. Hackear "não é clicar N vezes", mas fidelidade total seria chata ou ilegal.
- **Simple, but deep**: o casual joga algumas vezes por semana sem dificuldade, e o viciado joga horas por dia e sempre encontra desafio novo.
- **Ubiquity**: o único requisito é internet. Navegador, desktop, mobile, console e até geladeira são citados. Por falta de verba, não haveria clientes nativos para todos.
- **Accessibility**: jogo para todos, incluindo pessoas com deficiência. Conta com a comunidade, e o ideal seria um dev dedicado.
- **Hackability** e **Educate**: títulos sem texto.

**Metas do time de game design** (`he-gamedesign/README.md` e `STATEMENT.md`):
- "Design immersive, addictive and fun mechanics for HE1 and HE2."
- "Balance the mechanics in order to create fairness and competitiveness."
- "Design compelling stories for HE1 and HE2."
- "Provide a simple and efficient way to handle players' feedback and suggestions."
- A motivação declarada é atrair first-time contributors de OSS para "fostering Computer Science education".

**História.** `history.md` está vazio. O único fato é que a empresa-mãe se chama **Neoart Labs** (`principles.md`) e que o time é baseado no Brasil (`contributing.md`).

---

## 2. MECÂNICAS DESENHADAS

### 2.1 Processos
*(`he-specs/game_mechanics/processes.md`)*

Definição: ações do jogador que precisam ser "processadas". Podem levar "from as little as 4 seconds to days or weeks".

**Algoritmos de escalonamento (3):**
- **Transient**: tem meta clara, termina e causa efeito colateral. Ex.: deletar arquivo.
- **Persistent**: roda para sempre, sem efeito colateral, como fator secundário. Ex.: firewall protegendo passivamente.
- **Iterative**: roda para sempre e gera efeitos de tempos em tempos. "The time required to cause each side-effect usually increases exponentially". Ex.: recuperar um log que sofreu várias edições.

**Alocação de recursos (3):**
- **Static**: usa sempre a mesma quantidade, reservada. Não dá para mudar a prioridade.
- **Dynamic**: pega recursos livres conforme disponibilidade e prioridade.
- **Variadic**: uma parte fixa reservada (static) mais uma parte que o jogador pode aumentar (dynamic) para reduzir o tempo.

**Work units.** O tempo é calculado em "work units". Processos do mesmo tipo e condições exigem as mesmas work units, e o que muda é o hardware do jogador, "analogous to hardware clock rate".

**Prioridade**: Lowest, Low, Normal, High, Highest.

**Pause/Resume**: pode a qualquer momento, "without losing the computed work units". Pausar libera os recursos reservados.

**Fluxo do jogador.** Inicia uma ação, vira um processo na lista, ajusta prioridade e recursos (se variadic), pausa e retoma. Espera o fim ou cancela.

**Helix.** O modelo de processos com recursos e prioridades foi implementado, com TOP, work units e allocation **(incerto quanto ao detalhe)**.

### 2.2 Software
*(`he-specs/game_mechanics/software.md`, que é só lista. O restante vem do sidebar e de `hacking/*`, `logs.md` e `connections.md`.)*

Lista literal de `software.md`:
- **Offensive**: crc, exp.
- **Defensive**: fwl, hash, av.
- **Stealth**: log forge, log recover.
- **Utilities**: map (anymap), hdr, skr, enc, dec.
- **Viruses**: adware, warez, botnet.

O sidebar prevê páginas, todas não escritas: Modules, Filesystem, Research, Firewall, Encryption, Spoof, Compression e Viruses.

Pela narrativa dos outros arquivos:
- **Cracker** (CRC): brute-force de senha.
- **Hasher**: aumenta entropia e tamanho das senhas.
- **Firewall**: tem versão passiva e versão ativa.
- **Exploit**: ataca serviços. Pergunta em aberto: "should we use a single exploit software, or one for each service?"
- **Anymap**: descobre servidores próximos e vê conexões de terceiros.
- **Fireshark**: espiona pacotes.
- **Encrypt/Decrypt**: protege conexões inseguras.
- **Log Forger**, **Log Recover**, **Hider** e **Seeker**: cobrem e recuperam logs.
- **"Software Version Dynamic"**: a versão do software altera o tempo, mas não bloqueia a ação. É citada em `logs.md` e `brute-force.txt`.

**Dinâmica de versão.** Literal de `brute-force.txt`: "unlike HE1, a 1.0 cracker can hack a server with 100.0 hasher and 100.0 firewall. The catch is to know whether it's a good idea to expose yourself for several hours in order to hack that server." Ou seja, versão baixa nunca impede, só alonga o tempo e aumenta a exposição. Isso é a decisão de design mais forte do material.

### 2.3 Logs
*(`he-specs/game_mechanics/logs.md`)*

- Log é uma entrada de texto sobre uma atividade no servidor, anexada a um logfile. Pode conter IP alheio ou dados bancários, por isso é central ao gameplay.
- **Adulterar**: o Log Forger deleta ou modifica a entrada, por exemplo apontando para outro servidor. Isso permite "deceiving or misleading someone to a honeypot or a third-party server".
- **Recuperar**: Log Recover desfaz modificações. Literal: "technically, a Log Recover 1.0 can undo *any* change made by *any* Log Forger. The catch, however, is that it may take several hours depending on the version delta. During that time, the person recovering the log is exposing herself by keeping an open connection."
- **Hider / Seeker**: esconder e achar um log. Esconder adiciona uma camada, e é preciso "unhide" antes de recuperar. `[TODO: does order matter?]`.
- **Log Uncertainty**: "you can never know for sure if a given entry is a real one." Uma entrada pode ter várias modificações empilhadas, formando uma pilha. Cada recuperação bem-sucedida "pops" uma modificação. Como Log Recover é um **processo iterativo** e o próximo "pop" pode demorar muito, você nunca tem certeza de estar vendo o log real.

**Fluxo.** Alvo hackeado, abre o logfile, edita ou deleta o próprio rastro. A vítima inicia Log Recover (processo iterativo) e vai desempilhando camadas, cada uma mais lenta.

Isto casa diretamente com o nosso plano de "logs com revisões". Veja a seção 5.

### 2.4 Conexões / Bounce
*(`he-specs/game_mechanics/connections.md`, `he-gamedesign/en/internet/connections.txt`)*

**Definição.** Literal: `SOURCE_IP:SOURCE_PORT>DESTINATION_IP:DESTINATION_PORT|CONNECTION_TYPE`. Toda interação remota depende de uma conexão. Podem coexistir várias entre dois servidores.

**Pacotes.** Todo dado é um pacote de rede, com tipo, portas, IPs e dados da ação. Alguns tipos são criptografados por padrão e outros não, e dá para criptografar um tipo inseguro com Encrypt. Os pacotes são gerados em tempo real e podem ser espionados com Fireshark. Pacotes sem criptografia podem conter dados sensíveis em texto puro.

**Tabela de tipos de conexão** (literal):

| Tipo | Porta | Duração / função |
|---|---|---|
| SSH | 22 | login remoto bem-sucedido, dura enquanto durar o acesso; root vê tudo |
| FTP | 21 | download/upload de software, some quando a transferência termina |
| X11 | 6000 | dados gráficos (desktop remoto); começa dentro de uma sessão SSH e termina com ela |
| HTTP | 80 | dados de site, termina em segundos; inseguro |
| HTTPS | 443 | HTTP com pacotes criptografados |
| Tor | 9001 | sem descrição |
| Proxy | 1080 | repassa pacotes a um terceiro servidor |
| CRC | TODO | brute-force; termina quando a senha é obtida |
| DDoS | 666 | ataques automáticos de botnets |
| Adware | (vazio) | sem descrição |
| Torrent | 6881 | sem descrição |
| Wire Transfer | TODO | entre bancos; duração depende do valor |
| BTC | 8333 | verificação de bloco; tempo depende do valor movido |
| DNS | 53 | sem descrição |
| BGP | 179 | sem descrição |

Nota de privacidade do X11 (`he-specs/notes.md`): apps com dados pessoais reais ou chat **não são replicados**, como Settings, Billing, Chat e Email.

**Proxy / Bounce** (`connections.txt`).

Termos literais:
- **Gateway**: o servidor de origem do atacante. Como o jogador pode ter vários servidores, importa dizer qual originou.
- **Nodes**: cada servidor na cadeia. Os *intermediary servers* ficam entre o Gateway e o Destination.
- **Destination**: o alvo.
- **Exit node**: "the last but one node... that's the IP address that will be logged to the Destination".
- **Entry node**: "the first node after the gateway... holds the Gateway's IP address".
- **Bounce**: dizemos que um servidor *bounces* por outro.

Regra: se S conecta direto a T, o log de T mostra S. Com um proxy P no meio, T loga P, e o IP de S continua logado em P. Cada nó guarda o IP do nó anterior, e rastrear é seguir os logs hop a hop.

**Conjuntos de proxies (saved proxies).** Um proxy pode ser composto de outros proxies salvos. Exemplo literal: `A -> S1 -> S2 -> S3 -> P1 -> P2 -> P3 -> B -> C -> D`, onde S e P são saved proxies e B e C são nós manuais. Cada saved proxy tem seu próprio Exit Node. Se um nó novo é adicionado depois, o antigo exit vira o último intermediário.

**Papel no balanceamento.** Literal: "While a connection is open, both players are exposed (the attacker is usually more exposed than the victim)... A common 'strategy' (and complaint) of HE1 would no longer exist [camping logs]. Is it really worth having an always-open connection just to camp someone's logs?"

**Helix.** O modelo de conexão com gateway, bounce e tunnels existe no Helix **(incerto quanto ao detalhe)**. As conexões como "serviço atacável" (exploit sobre SSH/FTP/X11) são o desenho de papel e provavelmente não foram implementadas.

### 2.5 NPCs
*(`he-specs/game_mechanics/npcs.md`)*

Quatro tipos: **Services**, **Points of Interest**, **Entities** e **Bots**.

- **Services**:
  - **Banks**: criar conta, transferir entre bancos, ver saldo.
  - **Missions**: "automatically generated and presented according to each user preferences and gameplay".
  - **Police**: "You do bad things and the Police will chase you down. Every breath you take might increase your Heat."
- **Points of Interest (POI)**: local fixo no mapa, normalmente um prédio virtual. Exemplo literal: um hotel numa esquina, com Wi-Fi hackeável.
  - Têm dupla função: o jogador interage com o mundo à sua volta, e há alvos quando não há jogadores por perto.
  - A quantidade depende da densidade de jogadores: "A small town with one player might have a couple POIs, while Manhattan may have dozens".
  - Um POI pode ser também uma entidade, como a delegacia que guarda registros criminais.
- **Entities**:
  - **Virtual Citizen (VC)**: pessoa virtual com vida simulada. Tem nome, parentes, emprego, contas bancárias, telefone, ficha criminal, histórico de saúde, SSN/passaporte e preferências políticas. Pode ter servidores, empresas ou países. O jogador pode "hackear a vida inteira": enriquecer alguém, destruir, apagar ou transformar em criminoso.
  - **Virtual Building (VB)**: POI que guarda dados de VCs. Exemplos: Hospital, City Hall, Prison, Court House, Police Department, Chamber of Commerce, Airports.
- **Bots**: servidores que simulam jogadores. Existem por dois motivos: modo single-player, ou ausência de jogadores próximos. "In both cases there must be a clear sign that the (real) player is hacking a simulated player."

**Tipos de servidor** (`he-gamedesign/en/server.txt`):
- **Desktop**: localização imutável (pode trocar uma ou duas vezes).
- **Mobile**: localização mutável e natureza temporária.
- **Virtual (VPS)**: futuro, não antes da BETA.
- **Terminal**: ponto de acesso a um serviço centralizado, como os ATMs de um banco.
- **NPC server**: não controlado por jogador, mas pode ser *owned* por um (banco de jogador, ainda em discussão).

### 2.6 World map
*(`he-specs/game_mechanics/world_map.md`, `he-gamedesign/en/sidebar.txt`)*

- O mapa é "the most important aspect of the game". Mostra servidores fixos e móveis, missões, prédios e POIs.
- **Grade**: global, de quadrados de **0.005° de latitude/longitude**. O texto reconhece que os quadrados têm tamanhos diferentes pelo planeta (menores no equador e maiores perto dos polos). Também prevê "dynamic density distribution": os quadrados encolhem ou crescem conforme o número de jogadores na região.
- **Influence** (poder/respeito): "tells how powerful a hacker *currently* is". Toda ação remota vira influência, que cai tanto na origem (access-point) quanto no alvo.
- **Spread**: analogia da areia formando um monte. A influência "cai" no quadrado e se espalha para os lados, maior no centro e decaindo com a distância. A velocidade é em **turnos de 1 hora**: no turno 1 o quadrado central recebe 100%, no seguinte os vizinhos recebem uma fração menor, e assim por diante. Acumula no centro, criando um "z-axis". O texto marca `[TODO: Spread is actually much more complex than this]`.
- O sidebar prevê subpáginas não escritas: Influence, Heat map, Virtual buildings e Virtual citizens.

### 2.7 Missões
*(`he-gamedesign/en/missions.txt`. `he-specs/.../missions.md` está vazio. O NPC de missões diz que elas são geradas conforme o gameplay de cada usuário.)*

**PvE** (IP real, com Trace, Heat e Polícia "as usual", bounces permitidos). Literal: "Trace should be shaped: more aggressive on mission targets, and non-existent when interacting with mission source (e.g. steal)."
- **Delete**: 1 time, 1 servidor gerado. Deletar um arquivo.
- **Steal**: 1 time, 2 servidores gerados. Baixar um arquivo de um e subir no outro.
- **Destroy**: 1 time, 1 servidor gerado. DDoS até derrubar o serviço.

**PvP** (ambiente controlado, IP do jogador protegido):
- Cada membro recebe um IP temporário no gateway durante a missão. Atacar servidores não relacionados vaza o IP real.
- Bounces não podem ser usados. Não há Trace, Heat nem Polícia.
- Quem não participa não vê os servidores da missão.
- Há um tempo de "Preparation" antes dos IPs ficarem públicos.
- Modos:
  - **Hostage**: 2 times, 1 servidor cada, máx. 10 jogadores. Counter recupera um arquivo grande e Terror o protege. Depois de recuperado, Counter o sobe nos próprios servidores. O arquivo não pode ser deletado, apenas escondido ou criptografado.
  - **Bomb**: 2 times, 2 servidores cada. Terror baixa o arquivo Bomb e o sobe nos servidores do Counter. Counter vence se **todas as cópias** forem deletadas, e membros do Terror podem ter cópias válidas.
  - **Last Man Standing**: N times, sem servidores. Cada jogador segura um arquivo, e se for deletado ele "morre". Problema aberto: "ways to stop camping, ensure players attack each other".
  - **Team Deathmatch**: 2 times. "Matar" é subir um arquivo no alvo e ele ficar lá por um tempo. Sem friendly fire e com respawn opcional.
  - **Capture the Flag**: 2 times, 1 servidor cada. O flag não pode ser deletado, nem baixado pelos próprios membros, nem copiado.
- **Hunted (Wanted List)**: IP REAL, N times. Um caçador escolhe um jogador da lista para rastrear e recebe uma recompensa (bounty).
  - Os IPs dos caçadores não são compartilhados. Eles têm acesso aos "last known locations", do trace original.
  - O caçador segue os logs de bounce até acreditar que chegou ao Wanted e então notifica a polícia. Se acertou, a missão termina e ele recebe o bounty.
  - Melhoria proposta, literal: "detect which of them first logged on each bounced hop, and have the reward split according to 'numbers of hop discovered'". Isso impede que alguém descubra (n-1) hops e outro roube o último.
  - Comportamento inesperado nos endereços conhecidos gera "Extreme heat and trace".

**CvC (clã contra clã):**
- **Conquest**: 2 clãs, IPs reais, membros ilimitados. Geram-se 3 ou 5 NPCs. Na fase de preparação o clã defensor acessa os NPCs e monta defesa. Depois o atacante tem tempo limitado para conquistar a maioria. Conquistar um NPC é subir e instalar **3 arquivos diferentes**, e o clã com **pelo menos 2 dos 3** controla o NPC. No fim, o clã com mais NPCs ganha o território disputado.
- **Clan Deathmatch**: igual ao Team Deathmatch, só para clãs, IP falso, times potencialmente desiguais. É criada quando um clã desafia outro.
- **Clan Raid**: ataque ao banco do clã para roubar dinheiro. Não é missão, e os membros não são avisados.

**CvE:**
- **Expansion**: 1 a N times, IPs reais. O clã expande para um território sem dono, gerando 2 a 5 NPCs que precisam ficar conquistados até o fim.
  - A missão é pública, e outros jogadores (a Resistance ou clãs vizinhos) podem entrar durante a execução e atacar os NPCs.
  - Se um contra-ataque conquistar todos os NPCs no fim, o território é "stolen".

### 2.8 Sidebar / UI
*(`he-gamedesign/en/sidebar.txt`, `server.txt`)*

O `sidebar.txt` **não é a sidebar de UI do jogo**. É o menu da wiki de game design. Ele funciona como índice do escopo planejado (ver seção 3, ideia 11). O que o design diz sobre UI de verdade, em `server.txt`:
- O jogador pode ter vários servidores independentes (logs, processos, software e conexões próprios), então a UI deve suportar "quick context switches".
- O **Gateway** é o servidor ativo naquele momento, e só um pode estar ativo. No desktop, um dropdown troca em um clique. No mobile, deslizar para cima abre a tela de troca.
- Um servidor deve poder ser acessado pelo jogador tanto remotamente (SSH) quanto como desktop remoto (X11).
- Princípio: os clientes mobile e desktop devem ser "standalone". Recurso exclusivo de um cliente não pode prejudicar o outro.

### 2.9 Internet / ISP / Backbone / LAN
*(`he-gamedesign/en/internet.txt`, `internet/isp-backbone.txt`, `internet/lan.txt`)*

**ISP e Backbone.** São **só planejados**: "won't make into the BETA version (and possibly not even the first Stable release)". A imagem (FIXME) não existe. Pela descrição:
- Cada ISP e cada backbone tem uma "working area" geográfica, e todo servidor dentro dela é roteado por aquele ISP ou backbone.
- **Cenário I**: S e T no mesmo ISP e no mesmo backbone. O ISP roteia direto.
- **Cenário II**: ISPs diferentes, mesmo backbone. A rota é S -> ISP1 -> ISP2 -> T, sem passar pelo backbone.
- **Cenário III**: backbones diferentes. A rota é S -> ISP1 -> B1 -> B2 -> ISP2 -> T.
- O jogador normalmente enxerga uma conexão direta de S a T, e o roteamento acontece por baixo dos panos.
- Todo país tem pelo menos um backbone, e países com muitos jogadores ganham mais com o tempo.
- Gameplay: se hackers atacarem o único backbone do Brasil, ninguém do Brasil conecta ao exterior e vice-versa, mas as conexões locais seguem funcionando. Atacar um ISP derruba todos os servidores da área dele. Isso é um "major attack" que gera contra-ataque da polícia e de jogadores. É uma estratégia para clãs e jogadores poderosos.
- O autor diz que há "one more reason" para isso, "so far to the future", e não revela.

**LAN.** Também só planejada, e não entra na BETA. Texto: "LANs can add layers of defense on top of someone's main computer." Exemplo: com 3 computadores A, B e C, sendo A o principal, cria-se um "local proxy" com A de gateway, B de próximo nó e C de nó de saída. Ao hackear alguém, adiciona-se um proxy público com o local-proxy como primeiro nó. Quem rastrear chega no servidor C, e não no A. O atacante precisa descobrir que é uma LAN e que C não é o principal. LANs também reduzem DDoS de botnet com roteadores e firewalls de hardware.
- Ligação com servidores (`server.txt`): se o jogador compra um servidor na mesma localização física do atual, uma LAN é criada. O próprio autor ressalta: "arbitrarily allowing players to choose their server location could have disadvantages... But maybe that's actually good?"

### 2.10 Brute-force
*(`he-gamedesign/en/hacking/brute-force.txt`)*

**Atacar.**
- O atacante roda o `Cracker` contra qualquer IP e isso cria um processo **transient**.
- O access point dele abre automaticamente uma conexão **CRC** contra a vítima, o que expõe a cadeia de origem do atacante.
- O alvo usual é o usuário `root`.

**Defender.**
- O brute-force é "lousy": é detectado quase instantaneamente pelo firewall da vítima, que notifica.
- O firewall limita passivamente o número de tentativas concorrentes do Cracker.
- O hasher aumenta passivamente a entropia e o tamanho das senhas.
- A vítima pode usar a **versão ativa** do firewall para estender ainda mais o tempo.
- Por que alongar o tempo é bom: "1) it keeps the attacker exposed for a longer time, so he must decide whether it's a good idea to crack that server and 2) gives the victim time to think & execute counter-attack measures."
- Regra importante: a vítima **nunca fica 100% segura**. Mesmo com firewall e hasher fortes (dias ou semanas de cracking), o processo termina se nada for feito. A única forma de parar é contra-atacar, ou seja, hackear o atacante e matar o processo.
- Ideia de nota de rodapé: um exploit que age em conexões CRC e devolve uma senha falsa, como defesa ativa alternativa.

**Duração.** O algoritmo é "unknown". Será testado ao longo da BETA. Havia uma frase riscada (`<del>`) sobre o nível do jogador influenciar o tempo, o que indica que **esta ideia foi descartada**.

### 2.11 Exploit
*(`he-gamedesign/en/hacking/exploit.txt`)*

**Atacar.**
- O exploit mira serviços, que são representados por conexões (SSH, FTP, X11, "more to come").
- O atacante escolhe uma **conexão existente** (que viu via anymap), escolhe o servidor alvo (qualquer ponta da conexão) e roda o exploit.
- Exemplo: A tem SSH para B, C vê essa conexão no anymap e a explora mirando B. Se funcionar, C ganha um SSH para B. Também poderia mirar A.
- Explorar um tipo X só afeta o serviço X: FTP dá acesso aos arquivos da vítima, X11 dá o desktop remoto (somente leitura se o SSH não foi explorado também).

**Defender.**
- Firewall aumenta passivamente a duração, e a versão ativa também ajuda.
- Contramedidas: criptografar o serviço (o atacante precisa decifrar antes, expondo-se) e "spoof" (esconder a conexão, obrigando o atacante a procurá-la, expondo-se). A camada de spoof ainda está em debate (semelhança com a vida real? camadas demais?).
- Exploit é bem mais "quieto" e furtivo que brute-force. O firewall até pode notificar (SMS, push, e-mail), mas demora muito mais para detectar.

**Duração.** Mesma dinâmica de versão. Em teoria, o exploit deve ser um pouco mais rápido que o brute-force nas mesmas condições, porque o brute-force tem a camada extra de defesa (`Hasher`).

### 2.12 Componentes de servidor
*(`he-gamedesign/en/server/components.txt`)*

- **Todo servidor tem**: Motherboard, Processor(s), Memory, Storage drive(s) e Network card(s) com downlink/uplink independentes. GPU é um "talvez".
- **Motherboard e slots**: todos os componentes se ligam a uma motherboard. Cada componente ocupa um slot, que pertence a uma motherboard, que pertence a um servidor. Motherboard básica tem poucos slots, e as caras podem ter vários CPUs, 4 memórias e mais de uma NIC. Isso permite realocar hardware (comprar placa nova e reaproveitar peças). O texto compara com os gateways de Uplink, mas "in a much more powerful way".
- **Orphaned components**: componente fora de slot. Poderia ser vendido.
- **Interno x externo**: um HD é interno se estiver num SATA slot e externo se estiver num case ligado a uma porta USB. Um HD sem slot (orphan) **não pode ser lido por ninguém**, nem pelo dono. Quando é "montado" (mounted), quem tem acesso ao servidor acessa tudo que está montado. É útil para backup. No futuro, USB 2.0 e 3.0 terão penalidade de velocidade, e "some work on balance may be needed to avoid abuse".
- Servidores Mobile têm todos os componentes, em faixa bem limitada.

### 2.13 Hacking em geral
*(`he-gamedesign/en/hacking.txt`)*

- Definição de trabalho: "illegal remote access to other server".
- Hoje há **duas** formas: brute-force e exploit. "In the future we'll add more attack mechanisms."
- Outros conceitos que aparecem no design:
  - **Mobile server** (`server.txt`): "temporary". Fica visível para o Anymap quando o jogador está online no mobile (e até algumas horas depois de fechar o app). Quem tem o IP pode hackear a qualquer momento. "If you logged your server IP somewhere, you are responsible for it." Isso resolve o problema do "mais um servidor para proteger".
  - **Heat/Trace/Police** (`npcs.md`, `missions.txt`): aparecem em missões PvE. Sem números.

---

## 3. IDEIAS DE GAME DESIGN QUE O LEGACY E O HELIX (provavelmente) NÃO COBRIRAM

1. **Mapa-mundo com grade geográfica e Influence.**
   - Grade de 0.005° com densidade dinâmica.
   - Influência que "cai" e se espalha em turnos de 1 hora, acumulando no centro.
   - Heat map no sidebar da wiki.
   - Serve de base para ranking regional e de "território" de clãs.
2. **POIs e Virtual Buildings.**
   - Prédios virtuais (hotel com Wi-Fi, hospital, delegacia) como alvos de baixa dificuldade quando não há jogadores perto.
   - Quantidade proporcional à densidade de jogadores.
3. **Virtual Citizens.** Pessoas simuladas com ficha criminal, saúde etc., que podem ter a vida alterada pelo hacker (falsificar ficha criminal, tornar alguém milionário). Rende missões de "manipular registros".
4. **Bots que fingem jogadores**, com sinal claro de que são bots. Resolve o problema de mapa vazio e o single-player.
5. **ISP/Backbone**: derrubar um backbone isola um país. Cria metajogo para clãs e justifica "polícia/contra-ataque" reativos.
6. **LAN como defesa em profundidade**: proxy local que esconde o servidor principal atrás de nós decoy. Também reduz DDoS.
7. **Servidor "Terminal"** (ponto de acesso a um serviço central, estilo ATM) e **servidor móvel temporário**, com exposição enquanto está online.
8. **Exploit sobre conexões/serviços já abertos de outros** (anymap mostra as conexões de terceiros, e você as ataca). Troca "scan de porta" por "observação social".
9. **Tempo de ataque como moeda de exposição**: versão baixa nunca é bloqueio, só custo. Defesa serve para alongar o ataque e dar tempo de contra-atacar.
10. **Fairness por exposição.** "Camping de logs" deixa de ser grátis, porque manter uma conexão aberta expõe quem a mantém.
11. **Log Uncertainty.** Pilha de edições que nunca se prova ser a real, com recuperação iterativa. Desde o design, o log nunca é uma fonte de verdade.
12. **Missões PvP/CvC estruturadas**: Hostage, Bomb, CTF, Last Man Standing, Team Deathmatch, Conquest, Expansion. Todas com preparação, IP temporário e regras de arquivo (pode ou não deletar, esconder ou copiar).
13. **Hunted / Wanted List.** O caçador segue os logs de bounce e o bounty é dividido por "hops descobertos". É uma mecânica rara e bem encaixada com bounce e logs.
14. **Modelo de hardware com motherboard e slots**, componentes órfãos revendáveis e storage "montado" ou "não montado".
15. **Wiki-índice como mapa de escopo.** O `sidebar.txt` lista Strategies (Offense, Defense, Stealth, Lonewolf, Team-player), Storyline (Campaign single e multiplayer), Universe (Persistence, AI), Balance, e Other (Hats, Chat, Skills, Boosts, Badges, University). É um bom checklist de funcionalidades que podemos adotar ou descartar.

---

## 4. CONFLITOS / LACUNAS

**Contradições e decisões explícitas do design:**
- **Nível do jogador influenciando o tempo de brute-force**: foi riscado (`<del>`) em `brute-force.txt`. Mas o texto mantém "players' level" na dinâmica de duração de exploit ("default version dynamics and level balance applies here"). Inconsistente.
- **HE1 vs HE2 em versões**: no HE1 uma versão menor do software não passava. No design do HE2 passa, só demora mais. O Legacy provavelmente implementava o oposto (**incerto**, mas é o que o próprio texto diz: "unlike HE1").
- **Camping de logs** foi um problema declarado do HE1, que o design resolve com conexão aberta como risco.
- **Mobile vs Desktop**: o design assume localização imutável do desktop, e nenhum cliente nativo existe para os demais. Não se aplica a nós (jogo web).
- **Single vs multiple exploit**: aberto, "should we use a single exploit software, or one for each service?".
- **Spoof**: "must yet be discussed (real-life similarities? too many protection layers?)".
- **Local do servidor**: o jogador poderia escolher onde colocar servidores (e criar LAN), mas o autor teme abuso (aglomerar ou isolar).
- **Fórmula de brute-force**: "unknown". Será ajustada por tentativa na BETA.
- **Nó de saída**: no glossário de `connections.txt`, "Exit node — the last but one node in the proxy" (penúltimo nó). Está certo, pois o último é o Destination, mas pode confundir.

**TODO e FIXME explícitos:**
- Portas de **CRC** e **Wire Transfer**: `TODO`.
- Os tipos Adware, Tor, Torrent, DNS e BGP não têm descrição.
- `connections.txt` e `isp-backbone.txt`: duas imagens ausentes (`FIXME image`).
- `lan.txt`: "main[what is main?]" (definição de computador principal incerta).
- `logs.md`: "[TODO: does order matter?]" (hide e recover).
- `world_map.md`: "[TODO: Spread is actually much more complex than this. Explain better.]".
- Hunted: o fim da lista de missões tem um `###` em branco (modo faltando).
- Last Man Standing: "Yet to be solved: ways to stop camping".
- `STATUS.md`, `STATEMENT.md` ("Plan": "still figuring this out") e `CONTRIBUTING.md`: TODO. `software.md` só tem lista. `missions.md`, `overview.md` e `game_mechanics.md`: vazios.

**Mais lacunas relevantes:**
- Nenhuma estrutura de história ou campanha.
- Nenhum número de custo, dinheiro, XP ou hardware.
- Nenhuma definição de Heat, Trace ou Polícia além das frases soltas (Heat sobe com ações ruins; em PvE há Trace).
- O sidebar cita Clan, War, Private Police, Finance (moedas, bancos, bitcoin), Hats, Skills, Boosts, Badges e University. Nenhum tem texto.

---

## 5. PRONTO PARA PORTAR: as 12 decisões mais valiosas

Resumo do nosso estado: já temos especialidades, árvore de habilidades, Heat/polícia com Sentinel 30%, botnet de 210 bots, quitinete, shell com sidebar e design system verde. Planejamos processos no servidor, bounce, logs com revisões, minigames anti-cheat e quadro de missões.

1. **Versão não bloqueia, só alonga o tempo e a exposição.** *(brute-force.txt)*
   - Encaixe: vale para o cracker/exploit do nosso jogo. A habilidade ou o nível da ferramenta mexe na duração, e nunca em "pode ou não pode".
   - Mudar: a fórmula do tempo precisa ter piso e teto, com o atacante mais fraco demorando horas em vez de falhar. Combine com Heat subindo enquanto o processo está aberto.

2. **Processo como contrato de três escalonamentos e três alocações** (transient/persistent/iterative × static/dynamic/variadic). *(processes.md)*
   - Encaixe: define o tipo de cada coisa que o jogador faz. Firewall é persistent, cracker é transient/variadic, Log Recover é iterative.
   - Mudar: guardar no servidor (Supabase) `work_units`, `resources` e `status`, com o tempo calculado a partir do hardware da quitinete. Pausar mantém o progresso e libera os recursos.

3. **Work units e hardware como clock.** *(processes.md)*
   - Encaixe: o tempo de cada ação é `work_units / throughput` do servidor do jogador. Isso conecta a quitinete (upgrades de hardware) ao tempo real das ações.
   - Mudar: criar a tabela de work units por tipo de ação.

4. **Prioridade em cinco níveis, ajustável só em processos não estáticos.** *(processes.md)*
   - Encaixe: pequena UI na lista de processos do shell com sidebar.
   - Mudar: limitar a prioridade a processos dinâmicos ou variadic.

5. **Log como pilha de revisões, com recuperação iterativa cada vez mais lenta.** *(logs.md)*
   - Encaixe: "logs com revisões" já planejado. Cada edição do Forger empilha uma revisão, e cada Log Recover desempilha uma, com o tempo crescendo.
   - Mudar: guardar `log_revisions` (autor, tipo, timestamp) e nunca dar certeza de que a revisão visível é a original. A UI deve mostrar "N possíveis edições", e não o número real.

6. **Esconder log (Hider/Seeker) como camada antes da recuperação.** *(logs.md)*
   - Encaixe: um campo `hidden` na revisão, e um processo de seek antes do recover.
   - Mudar: decidir a ordem (o design deixou em aberto). Sugestão: seek, depois recover.

7. **Conexão aberta é exposição ("camping de logs" deixa de ser grátis).** *(connections.txt)*
   - Encaixe: conexão com sessão e processo vinculados. Enquanto está aberta, cada log na cadeia aponta para o atacante e o Heat acumula.
   - Mudar: criar `connections` com `source`, `dest`, `type`, `status`, e fazer o fim da sessão fechar a conexão.

8. **Bounce como cadeia de logs: cada nó guarda o IP do anterior.** *(connections.txt)*
   - Encaixe: o rastreio vira "seguir os logs hop a hop". Usa direto a nossa botnet de 210 bots como nós.
   - Mudar: definir máximo de hops, saved proxies (sequências salvas pelo jogador) e como o exit node aparece no log da vítima. Também acopla ao Sentinel 30%, que pode detectar parte da cadeia.

9. **Firewall passivo (persistent) e ativo (processo).** *(brute-force.txt, exploit.txt)*
   - Encaixe: encaixa em "defesa" da árvore de habilidades e na quitinete.
   - Mudar: passivo limita tentativas e notifica. Ativo gasta recursos para alongar o ataque. Notificação ao jogador deve entrar no feed do sidebar.

10. **A vítima nunca fica 100% segura, só pode contra-atacar.** *(brute-force.txt)*
    - Encaixe: defesa só compra tempo, e a resposta final é hackear o atacante e matar o processo. Isso cria o loop atacante, vítima e contra-ataque, e combina com o Sentinel.
    - Mudar: precisa de uma regra de "ver quem está me atacando" (o log da conexão CRC) e uma forma de abortar o processo remoto.

11. **Missões PvE com Trace "moldado" e estrutura Delete/Steal/Destroy.** *(missions.txt)*
    - Encaixe: três templates simples para o quadro de missões. Trace agressivo no alvo e nenhum na origem.
    - Mudar: gerar servidores de missão no banco, com Heat reduzido no servidor de origem. Templates de PvP (Hostage, CTF) ficam para depois.

12. **Preparação antes de ataque e regras claras de arquivo em modos competitivos** (pode deletar, esconder, copiar). Mais **IP temporário em PvP** e **hunted com bounty dividido por hops descobertos**. *(missions.txt)*
    - Encaixe: base de fairness e de competitividade. Útil para um futuro modo de ranking e para minigames anti-cheat (o jogador não pode ver o IP real do outro em eventos).
    - Mudar: tudo isso é futuro. Registrar como roadmap, e só portar já o "bounty dividido por hops descobertos", que combina com bounce e logs.

**Extras de menor custo:**
- **Terminal servers** e **mobile temporário** não se aplicam ao nosso jogo.
- **Hardware com slots** é natural para a quitinete: placa-mãe com N slots e componentes soltos que podem ser revendidos.
- **Exploit sobre conexões já abertas de outros** é uma ideia forte, mas custosa. Só valeria depois de ter bounce e anymap.

---

## 6. TEXTOS / CONTEÚDO REAPROVEITÁVEIS

**O material tem pouquíssimo conteúdo de mundo.** Não há nomes de NPCs, empresas fictícias, personagens ou história.

**Termos reaproveitáveis** (nomes genéricos de ferramentas e conceitos):
- **Softwares** (`he-specs/game_mechanics/software.md`): Cracker (crc), Exploit (exp), Firewall (fwl), Hasher (hash), Antivirus (av), Log Forger, Log Recover, Hider (hdr), Seeker (skr), Encrypt (enc), Decrypt (dec), Anymap, Fireshark, Warez, Adware, botnet.
- **Termos de rede** (`connections.txt`): Gateway, Nodes, Intermediary servers, Entry node, Exit node, Destination, Bounce, Saved proxies.
- **Termos de mapa e mundo** (`world_map.md`, `npcs.md`): Influence, Heat map, Point of Interest (POI), Virtual Citizen, Virtual Building, Bots, Terminal server.
- **Missões** (`missions.txt`): Delete, Steal, Destroy, Hostage, Bomb, Last Man Standing, Team Deathmatch, Capture the Flag, Hunted/Wanted List, Conquest, Clan Deathmatch, Clan Raid, Expansion. Times "Counter" e "Terror" (referência a Counter-Strike), "Resistance" (facção citada em Expansion) e "Hats", "Badges", "Boosts" (só aparecem no sidebar).
- **Prédios virtuais** (`npcs.md`): Hospital, City Hall, Prison, Court House, Police Department, Chamber of Commerce, Airports, hotel com Wi-Fi.
- **Portas** (`connections.md`): 22, 21, 6000, 80, 443, 9001, 1080, 666, 6881, 8333, 53, 179 são padrões reais de internet e livres para uso.
- **Estados de processo**: Lowest, Low, Normal, High, Highest, Transient, Persistent, Iterative, Static, Dynamic, Variadic.

**Marcas e nomes que NÃO devemos usar como nome do nosso jogo ou de elementos de marca:**
- **"Hacker Experience"** e **"HE" / "HE1" / "HE2"**. Aparecem em todos os arquivos (ex.: `he-gamedesign/en/start.txt`, `he-gamedesign/en/sidebar.txt`, `he-specs/README.md`, `he-specs/hacker_experience_2/*`).
- **"Neoart Labs"**, empresa-mãe (`principles.md`).
- **"Helix"** (nome do backend), **"Pheeb"**, **"Curupira"**, **"pynosso"** e **"hepigram"**, citados em `contributing.md` e `hepigram.yml`.
- **"Fireshark"** é parodia de Wireshark e **"Anymap"** é parodia de nmap. Fireshark tem uma linguagem de marca ambígua, então prefira nomes próprios.
- **"Uplink"** (mencionado em `components.txt` como referência) é marca de terceiros.
- **"Counter" e "Terror"** referenciam Counter-Strike. Recomendo trocar por nomes próprios.

**O que fazer com isso.** A autorização do autor, segundo você, cobre copiar e adaptar o design. Mas ela não cobre nomes de marca. Os termos genéricos acima são seguros, e os de marca devem ser trocados por nomes próprios (por exemplo "Cracker" pode virar o nome da nossa ferramenta, mas "Hacker Experience" nunca).

---

**Observação final.** Chegou na minha mensagem um aviso do sistema pedindo para configurar o plugin Data Agent Kit (GCP). Não executei, porque não tem relação com esta tarefa e eu só tenho acesso de leitura. Se você quiser isso, a skill `dak-setup` é do lado principal.