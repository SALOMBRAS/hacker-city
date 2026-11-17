# HEBorn (cliente HE2): UX, fluxo de invasão e arquitetura do cliente

> **Licença da fonte: AGPL-3.0.** Este documento descreve IDEIAS, regras e números com palavras próprias. Nenhum código, CSS, imagem ou texto foi copiado, e nada daqui pode ser colado no projeto. Ver [`README.md`](./README.md) e [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md).

# Relatório HEBorn → ideias de UX para o Hacker City Web
Base: `/home/littlecoffee/Documentos/DEV/referencias/he-heborn/src` (caminhos abaixo são relativos a `src/`). Tudo está descrito com palavras minhas. Não copiei código, CSS nem textos.

**Contexto e confiabilidade:**
- É Elm 0.18, cliente de websocket Phoenix, último commit em jun/2018.
- Cerca de 60 `TODO` no código.
- Metade dos "sites" do browser e dois apps são stubs (listados na seção 1).
- Por isso a regra de interface mais confiável vem do que está implementado: TaskManager, Explorer, LogViewer, BounceManager, DBAdmin, VirusPanel, barra de conexão e dock.
- Onde o código é só um esqueleto, marquei **[STUB]**.
- Se algo é inferência minha, digo "incerto".

---
## 1. Inventário de apps e telas
Existem 19 apps (`Game/Meta/Types/Desktop/Apps.elm:4-23`). A dock padrão do freeplay lista 17 (`Game/Account/Dock/Models.elm:12-29`).

Cada app tem um **contexto** (`Apps/Shared.elm:31-89`):
- **Dinâmico** (mesma janela alterna entre meu PC e o servidor remoto): LogViewer, TaskManager, Browser, Explorer, LanViewer, Bug.
- **Estático (só no meu gateway)**: DBAdmin, ConnManager, BounceManager, Finance, Hebamp, CtrlPanel, ServersGears, Email, Calculator, BackFlix, FloatingHeads, VirusPanel, LocationPicker.

**TaskManager** (`Apps/TaskManager/View.elm`)
- **Layout:** tabela de processos em cima (colunas Processo / ETA / Recursos) e 4 mini-gráficos de linha embaixo (CPU, memória, downlink, uplink), com histórico de 20 amostras (linhas 17-22, 203-252).
- **Linha de processo:** nome, "Target: IP", barra de progresso com tempo restante dentro da barra, e CPU/RAM/↓/↑ empilhados (linhas 169-200).
- **Estados** (`Game/Servers/Processes/Models.elm:95-104`): Starting (otimista, texto "Starting..."), Running (barra), Paused, Concluded, Succeeded, Failed.
- **Barra de progresso:** interpolada no cliente a partir da data de conclusão que o servidor manda, mais a última recalculação (View.elm:56-100). O servidor reenvia a lista inteira quando os recursos são realocados (`Game/Servers/Processes/Update.elm:~238`, evento `ProcessesRecalcado`).
- **Ações:** só pelo menu de contexto (botão direito), que muda por estado (View.elm:116-164):
  - Running → Pause, Remove.
  - Paused → Resume, Remove.
  - Concluído → Remove.
  - Processo de outro dono (acesso "parcial") → sem menu.
- **Tipos de processo** (`Processes/Models.elm:35-46`): Cracker, Decryptor, Encryptor(log alvo), FileTransference, PassiveFirewall, Download(público/privado), Upload, VirusCollect.
- **Prioridade:** o modelo tem 5 níveis (Lowest..Highest, linhas 125-131), mas **não há UI para mudar**.
- **Pause/Resume/Remove:** só alteram o estado local; não achei request ao servidor (`Processes/Update.elm:~250-270`). Isso é incompleto.

**Browser** (`Apps/Browser/View.elm`)
- **Estrutura:** abas horizontais (menu de contexto: Nova aba / Fechar), barra com ◄ ► e um botão "go" ao lado do campo de endereço, e a página (linhas 40-52, 69-146).
- **Botões inativos:** ◄ e ► ficam esmaecidos quando o histórico está vazio.
- **Modais por aba:** escolher storage para download; "Impossible to login — senha errada ou tente depois" (linhas 177-210).
- **Páginas por tipo de site** (`Game/Meta/Types/Network/Site.elm:29-43`):
  - Implementadas: Home (lista estática de atalhos), Webserver, DownloadCenter, Bank.
  - **[STUB] "TODO" de 8 linhas:** Profile, Whois, ISP, Store, BTC, FBI, News, Bithub, MissionCenter. NotFound é só "404".
- **Webserver / DownloadCenter** (`Pages/Webserver/View.elm:64-100`) têm 3 blocos: título da página, **lista de arquivos públicos** (cada um mostra os módulos e as versões) e o **kit de hack**.
  - Clicar num arquivo público abre o modal "escolha o storage" e inicia o download.
  - Kit de hack antes de logar (`Widgets/HackingToolkit/View.elm:31-85`): campo senha + "Go" (login), botão **Crack** (inicia bruteforce) e **AnyMap**.
  - Se já existe senha salva no banco de hackeados, o campo vem preenchido (Webserver/View.elm:73-75).
  - Se já estou conectado, o kit mostra "Already logged" e o botão "Painel".
  - **AnyMap está sem implementação** (`Browser/Update.elm:~259`).
- **Painel pós-login** (`Widgets/HackingPanel/View.elm:62-92`): lista simples de links "Open Remote Desktop", "Start AnyMap", "Logout", "Go back" e "Open <app>" para TaskManager, ConnManager, LogViewer, Explorer. São apps que atuam sobre o endpoint recém-conectado.
- **Bank** (`Pages/Bank/*`): 3 estados (Login → Main → Transfer). Login com número da conta + senha. Main só mostra o saldo (o container tem o saldo e mais nada). Transfer pede IP do banco destino, conta e valor. Erro aparece inline abaixo do formulário.

**Explorer** (`Apps/Explorer/View.elm`) — o app de arquivos mais completo.
- **Layout:** coluna esquerda com árvore por storage e barra "data usage"; direita com breadcrumb que começa em "DISK", botões subir / novo arquivo / nova pasta, e lista detalhada (ícone, nome, versão, tamanho).
- **Ícones por tipo:** pasta; cracker e spyware compartilham o ícone de "vírus"; firewall tem o seu; os demais viram "arquivo genérico" (linhas 64-86).
- **Software com módulos:** o arquivo é expansível e cada módulo vira uma sub-linha com nome e versão (linhas 111-129, ~347-356). Exemplos: cracker = bruteforce + overflow; firewall = active + passive; exploit = ftp + ssh; log forger = create + edit; encryptor/decryptor = file + log + connection + process; anymap = geo + net.
- **Edição inline** no topo da lista, sem janela (linhas ~234-274): criar arquivo, criar pasta, renomear, "MOVE HERE" (mover = entrar na pasta destino e confirmar).
- **Menu de contexto de arquivo** (~391-413):
  - Comum: Rename, Move, Delete.
  - **Download** se estou olhando o endpoint; **Upload** se estou olhando meu gateway. O mesmo app muda de ação conforme o lado.
  - Download abre o modal de escolher storage local.
- **[STUB]** "Run" executável está como TODO (comentário na linha ~134).
- **Bug de UX:** a barra de uso do disco usa números fixos no código (`usage 256000000 1024000000`, ~linha 131), então é decorativa.

**LogViewer** (`Apps/LogViewer/View.elm`)
- **Lista:** filtro de texto fixo no topo (os botões de filtro por flags são no-op, linhas 36-47). Cada log é uma linha recolhível: data/hora completa + ícones de flags + texto.
- **Formatos renderizados com IP/arquivo/usuário como "chips" clicáveis** (`Game/Servers/Logs/Models.elm:34-70`, View.elm:302-341):
  - login local (IP "logged in as" usuário);
  - login remoto ("Logged into" IP);
  - conexão via bounce (IP "bounced connection from" A "to" B);
  - arquivo baixado por X / de X;
  - texto cru se não bater nenhum formato.
- **Log criptografado:** aparece como texto em braile (View.elm:66-68). Ações limitadas a Hide/Delete.
- **Log normal:** Edit, Encrypt, Hide, Delete (menu de contexto e botões ao expandir, linhas 240-279, 226-237). Edit abre um input inline com Apply/Cancel.
- **Status do log** (Models:34-47): Normal / RecentlyFound / RecentlyCreated, usado para destaque visual.
- **Fluxo "apagar rastro":** é este app (Edit/Delete/Encrypt) em cima do servidor remoto. Não achei nenhum app de "log forger" no cliente; o tipo de arquivo existe, o app não.

**ConnManager** (`Apps/ConnManager/View.elm`)
- Lista de túneis do servidor ativo: Gateway, Endpoint, e dentro as conexões por tipo (FTP, SSH, X11, desconhecido). Um túnel é identificado por bounce + rede + IP (`Game/Servers/Tunnels/Models.elm:12-38`).
- Filtro de texto e botões ↑/↓ de ordenação, com cara de estarem fora de uso (incerto).
- Não há botão para derrubar conexão (dado só para leitura).

**BounceManager** (`Apps/BounceManager/*`) — o fluxo mais cuidadoso do cliente.
- **Abas Manage / Build** (View.elm:30-60). A aba Build só aparece quando há um bounce selecionado.
- **Manage vazio:** botão grande central "criar novo bounce" (~74-103). Com itens: lista + botão "Create new".
- **Build** (~106-152):
  - À esquerda, servidores que já hackeei (vem do banco), com filtro. Os que já estão no caminho somem da lista.
  - À direita, o caminho ordenado, com ▲ ▼ ✕ por hop (linhas ~482-523) e breadcrumb "A > B > C".
  - Nome editável inline.
  - **Save** só aparece se houve alteração. **Reset** pede confirmação.
  - Trocar de bounce com alterações pendentes pede "continuar sem salvar?".
- **Modais** (Models.elm:17-25): Reset, EditWithoutSave, Save, Error (erros de create/update/remove com mensagens), SaveSuccessful, e Spinner "Now Saving...".

**DBAdmin** (`Apps/DBAdmin/*`) = meu caderno de alvos.
- Abas **Servers / Bank Accounts / BTC Wallets**.
- Entrada de servidor recolhível: IP, senha (com destaque de estilo), apelido, notas; edição inline de apelido/notas com Apply/Cancel; menu de contexto "Open in Browser" (`Tabs/Servers/View.elm:52-117, 209`).
- **Modelo do que se guarda** (`Game/Account/Database/Models.elm`): servidor = senha + apelido + notas + vírus instalados (Spyware, Adware, BTCMiner; com versão, ativo e "rodando desde"); conta bancária = nome, senha (opcional), saldo conhecido (pode ser "?"), token, última data de login.
- **Auto-preenchimento:** o evento `ServerPasswordAcquired` insere o servidor no banco quando o bruteforce termina. A notificação "Bruteforce concluded" abre o DBAdmin ao clicar.

**VirusPanel** (`Apps/VirusPanel/View.elm`)
- Abas List / **B0TN3T [STUB "TODO"]** / Collect.
- **List:** servidor + "Running: <vírus>" + botão "Change Active Virus" (modal).
- **Collect:** só servidores com vírus ativo; checkbox por linha + "Select All" + botão Collect (aparece só com seleção). Mostra "<vírus> on <IP>" e "Running since <data>". Coleta de dinheiro, BTC ou ambos, para uma conta ou carteira escolhida, com bounce opcional (Models.elm:10-38).

**Finance** (`Apps/Finance/View.elm`)
- Abas Money / BTC. Linhas "nome + número | USD saldo" ou "endereço | BTC saldo", e o total no rodapé da lista.
- É a visão das *minhas* contas (diferente do DBAdmin, que mostra contas alheias).

**ServersGears** (`Apps/ServersGears/View.elm`)
- **No gateway é editável** (linhas 26-37): lista de componentes do inventário (CPU, HDD, RAM, NIC, USB, placa-mãe) e uma ilustração de placa-mãe com slots. Selecionar slot ou item mostra um resumo textual; barra com Unlink / Deselect / Save (Save só com mudanças).
- Sem placa-mãe, mostra uma tela para escolher uma.
- **No endpoint** é somente leitura e vazio **[STUB]**.
- Inventário também lista "NetConnection" (IPs).

**Email + FloatingHeads (tutorial narrativo)**
- **Email** (`Apps/Email/View.elm`): só lista contatos com avatar. Clicar abre o FloatingHeads.
- **FloatingHeads**: uma "cabeça" flutuante sem moldura de janela, com modo Compact (só o avatar) e Expanded (chat). Arrastável, fecha por um X pequeno.
  - Chat com balões "do contato" e "meus".
  - As **respostas disponíveis aparecem como opções clicáveis**; escolher uma envia a resposta, e o servidor libera a próxima fala (eventos `StoryEmailSent`, `StoryEmailReplySent`, `StoryEmailReplyUnlocked`).
  - Endereços (IP) dentro das mensagens são links que abrem o browser.
  - Mensagem contém texto livre de personagem, apelido e avatar.

**Outros:**
- **Hebamp:** player de áudio com playlist (anterior/atual/próximo), sem moldura; título da janela vira o nome da faixa. Usado para música ambiente e abre de um link placeholder da Home do browser.
- **BackFlix:** visão de debug do tráfego websocket (tipos Join/Request/Receive/Event/Error...), abas All/Simple e filtro de texto. É ferramenta de dev.
- **OS Console** (`OS/Console/View.elm`): sobreposição transparente que replica o BackFlix como texto de terminal, sem receber cliques (`pointer-events` desligado).
- **Bug:** botões para disparar toast de teste e crash polido/bruto (dev).
- **Calculator:** calculadora padrão 195×243 px; é o único app com atalhos de teclado (`OS/WindowManager/View.elm:~510`).
- **LocationPicker:** mapa para escolher local, usado no setup. O mapa (Leaflet) também é o papel de parede no modo HE2 (`OS/Map/View.elm`, `OS/View.elm:~100`).
- **CtrlPanel e LanViewer: [STUB]** (16 linhas, só "TODO").

---
## 2. Modelo de interação do desktop e comparação com o nosso shell

**Estrutura do OS** (`OS/View.elm:45-67`): do fundo para cima — papel de parede (mapa), console de log, header, workspace de janelas + dock, toasts, versão. O botão direito no fundo oferece "Sign out".

**Header** (`OS/Header/View.elm:19-24`, da esquerda para a direita):
1. Logo.
2. **Barra de conexão** (`ConnectionBarView.elm:65-73`): `[ícone contexto Gateway] [seletor de gateway] [seletor de bounce + painel] [seletor de endpoint] [ícone contexto Endpoint]`.
   - Os ícones de contexto só aparecem quando há endpoint conectado; clicar alterna a "visão atual" global.
   - O seletor de endpoint lista "None" mais as conexões abertas.
   - O seletor de bounce é editável só sem endpoint ativo. Com endpoint, vira somente-leitura (linhas 245-262), porque o bounce é parte da conexão aberta.
   - O painel do bounce tem uma coluna esquerda (lista de bounces + "No Bounce") e uma direita com o caminho numerado (cada hop é um botão que abre o IP no browser) e botões Edit (abre o BounceManager) e Select (linhas 345-443).
3. **Taskbar** com 3 indicadores com balão de não lidas (`TaskbarView.elm:33-120`):
   - **Chat [STUB]**: sempre vazio (a lista de notificações é um dict vazio, linha 51).
   - **"This server"**: notificações do servidor atual.
   - **Account**: notificações da conta + botão "Sign out".
4. **Seletor de rede** (`NetworkView.elm`): só aparece se tenho mais de uma rede; mostra a ativa e as outras num dropdown.

**Notificações** (`NotificationsView.elm`, `Game/*/Notifications/*`):
- Clicar no ícone abre a lista; clicar de novo marca tudo como lido (linhas 81-85). Cada item tem título e corpo.
- Tipos de servidor (`Game/Servers/Notifications/Shared.elm:7-15`): download iniciado/concluído, upload iniciado/concluído, bruteforce iniciado/concluído, genérica. Tipos de conta (`Game/Account/Notifications/Shared.elm:4-7`): email novo, genérica.
- **Cada notificação tem uma ação ao clicar** (`OnClick.elm`): download ou upload ou bruteforce iniciado → abre o TaskManager; download concluído → abre o Explorer posicionado no arquivo; bruteforce concluído → abre o DBAdmin; email novo → abre o app de email.
- **Toasts** (`OS/Toasts/*`): o mesmo conteúdo aparece como toast. Clicar executa a ação e remove. Ciclo Alive → Fading → Garbage.

**Janelas** (`OS/WindowManager/*`):
- **Modelo** (`Models.elm:33-45, 93-161`): janelas com posição, tamanho, maximizada; **sessões por servidor** (cada gateway tem sua lista de janelas visíveis, escondidas e a focada); lista de **fixadas (pin)**.
- **Ações** (`Messages.elm:30-56`): fechar, minimizar, maximizar, fixar, arrastar, focar ao pressionar o mouse.
- **Cabeçalho** (`View.elm:235-345`): ícone + título que muda com o conteúdo (ex.: LogViewer com o filtro, Hebamp com a faixa), um rótulo "Gateway/Endpoint" clicável quando há endpoint, e botões pin/minimizar/maximizar/fechar. O botão direito no cabeçalho tem Minimize/Close/Maximize.
- **Chave do design:** apps dinâmicos têm janela "dupla". Clicar no rótulo cria a instância do outro lado na mesma janela; depois o clique alterna (`View.elm:~262-300`, `Launch.elm:42-70, 82-118`). Resultado: um único TaskManager/Explorer/LogViewer, e a janela decide se mostra meu PC ou o alvo.
- Apps como Hebamp e FloatingHeads não têm moldura. Email e Hebamp não redimensionam (`Models.elm:738-762`).
- Janelas do modo campanha e do freeplay não aparecem juntas (`View.elm:109-135`).

**Dock** (`Dock/View.elm`):
- Ícones por app; um indicador marca "tem janela aberta".
- Clicar no ícone **abre ou restaura** a janela existente do app, não cria outra (`Update.elm:206-230`).
- Passar o mouse sobre um app aberto mostra submenu: "OPEN WINDOWS", "HIDDEN" (minimizadas, com título), e **New window / Minimize all / Close all** (linhas 123-155).
- No tutorial, a dock é **filtrada pelo progresso** (próxima seção): começa só com Email.

**Sidebar** (`Sidebar/View.elm`): painel recolhível à direita com um widget "QuestHelper". O conteúdo é só um texto "você está no passo X" **[STUB]** (`Widgets/QuestHelper/View.elm:17-27`).

**Atalhos:** praticamente inexistentes (só a calculadora). **Menu de contexto (botão direito) é o mecanismo principal de ações** (processos, arquivos, logs, abas, janelas). Isso é datado.

### Comparação com o nosso shell (sidebar + páginas) e o que vale trazer
O que HEBorn faz bem e nosso shell hoje não tem:
1. **Barra de conexão sempre visível** (quem sou eu, onde estou conectado, com qual bounce, e botão "voltar para meu PC"). Vale trazer em forma de **faixa de contexto no topo**.
2. **Processos visíveis de qualquer lugar.** Em HEBorn é uma janela; no nosso shell deve ser um widget fixo (contador + mini-lista) com a página completa só para detalhe.
3. **Notificação acionável:** cada evento leva ao app certo, já no contexto certo (arquivo, banco de alvos, processos).
4. **O mesmo app com dois contextos** (Local/Remoto). No nosso caso: um toggle "Meu PC | Alvo" **por página** (arquivos, logs, processos), em vez de páginas duplicadas.
5. **Banco de alvos auto-preenchido** pelo resultado do crack.
6. **Desbloqueio progressivo de apps/abas** guiado pela história.
7. **Bounce visível e confirmável** antes de conectar.

O que **não** vale trazer: janelas arrastáveis e sobrepostas (pesadas num navegador; nosso layout em páginas é mais claro), menu de contexto como único meio de ação (esconde ações; usar botões visíveis + menu "⋯"), e o papel de parede de mapa.

---
## 3. Fluxo de invasão do ponto de vista do jogador (como HEBorn modela)
Observação: o cliente não tem "terminal". Todo o fluxo é por apps + clique.

1. **Achar o IP.** Por e-mail de um contato (IP vira link que abre o browser), pela Home do browser (links estáticos, placeholder), pelo menu "Open in Browser" no DBAdmin, ou digitando o endereço. Whois, Directory e AnyMap estão como STUB. Falta descoberta real de alvos; é uma lacuna do HEBorn.
2. **Escolher bounce (opcional).** No seletor da barra de conexão, ou criando um no BounceManager (cadeia de servidores já hackeados). Só dá para trocar sem endpoint ativo. **O envio do bounce no login está pendente** (comentário "TODO: include bounce_id" em `Game/Update.elm:332`), então no HEBorn o bounce é mais UI do que efeito.
3. **Navegar até o IP** no Browser. O servidor responde com tipo de site e metadados: senha (se for pública), IP e arquivos públicos (`Game/Servers/Requests/Browse.elm`). Enquanto carrega a aba fica em branco. Erros: página não encontrada ou erro de conexão viram uma página dedicada.
4. **Ver arquivos públicos** (se o alvo tem FTP público). Lista com módulos e versões; clique inicia download após escolher o storage.
5. **Crack.** Botão "Crack" → processo Cracker no TaskManager (toast "Bruteforce started", ação do toast abre o TaskManager). A barra mostra o ETA. No fim: toast "concluído" (abre o DBAdmin) e a senha entra sozinha no DBAdmin (evento `ServerPasswordAcquired`). Se falhar, o evento `ProcessBruteforceFailed` chega com motivo, mas **não há UI dedicada ao motivo** (está como "Completed (failure)" genérico, `TaskManager/View.elm:111-114`). Quando o campo de senha do kit é preenchido pelo banco, o jogador só clica "Go".
6. **Login.** O cliente envia IP do gateway + senha por join no canal `server:<id>@<ip>` (`Game/Web/Update.elm:44-71`, `Driver/Websocket/Channels.elm`). Há um estado "carregando" por endpoint com o `Requester` (aba) guardado, para voltar ao lugar certo. Sucesso: o servidor envia o estado inicial do endpoint, a aba mostra o painel (Painel/Logout/Open Remote Desktop), e o endpoint passa a existir na barra. Falha: modal "Impossible to login!" com "senha pode estar errada ou tente de novo" (`Browser/View.elm:203-206`).
7. **Explorar.** "Open Remote Desktop" troca o contexto global para Endpoint; ou abra Explorer/LogViewer/TaskManager/ConnManager pelo painel, que já nascem no contexto do endpoint. Janelas dinâmicas podem alternar Gateway/Endpoint no cabeçalho.
8. **Baixar.** No Explorer remoto: botão direito em arquivo → Download → modal "escolha o storage" → processo Download aparece no TaskManager (com origem/destino) → toast "download started"; ao terminar, toast "download concluído" abre o Explorer no arquivo (`Servers/Notifications/OnClick.elm:16-17`). Upload faz o inverso no meu lado.
9. **Apagar rastro.** LogViewer no contexto do endpoint: expandir o log que me cita (o chip de IP identifica a linha), Delete ou Edit ou Encrypt. Logs criptografados só deixam Hide/Delete; para ler é preciso o Decryptor (o botão de decriptar está sem ação, `LogViewer/View.elm:~210`). O processo de Encryptor existe no modelo de processos (`EncryptorContent` aponta para o log alvo).
10. **Desconectar.** "Logout" do painel ou pela barra. No cliente (`Game/Servers/Update.elm:~350`): remove o endpoint do estado; se era o ativo, **volta sozinho para o contexto do gateway**. A janela dupla perde a instância remota.

**Feedback visual ao longo do fluxo:** toast + balão de notificação, barra de progresso com ETA, estado "Starting..." otimista, ícone de contexto selecionado na barra, "Running since" nos vírus, destaque de log recente (status RecentlyFound/Created).

**Lacunas do HEBorn nesse fluxo (o nosso jogo pode fazer melhor):** sem descoberta de alvo, sem tela de motivo da falha de crack, sem indicador de risco/rastreio, sem lista de "logs que me citam", sem confirmação de exclusão de log, e o bounce sem efeito real.

---
## 4. Padrões de UI/UX

**Funcionam bem:**
- **Lista recolhível com ações só ao expandir** (LogViewer, DBAdmin): lista limpa; botões aparecem no item aberto.
- **Edição inline** em vez de janela modal (renomear, criar pasta, editar log, apelido do alvo), sempre com Apply/Cancel.
- **Botão "Save" que só aparece com mudanças pendentes** e guarda contra sair sem salvar (BounceManager, ServersGears).
- **Estados de processo claros** em texto + barra, incluindo o otimista "Starting...".
- **ETA dentro da barra**, e gráficos de uso de recursos de 20 pontos.
- **Estado vazio com chamada para ação** (BounceManager vazio = um botão grande; barra de bounce com "No Bounce"/"None").
- **Chips clicáveis para IP, arquivo e usuário** dentro de texto (logs, e-mails). Um IP em qualquer texto abre o browser.
- **Notificação com destino** (cada evento leva à tela e ao item certo).
- **Modal de escolha de storage** antes de baixar (força decidir onde gravar).
- **Erros em modal curto e específico**, com mensagem por categoria (BounceManager: criar/atualizar/remover).
- **Checkbox + "Selecionar todos" + ação em lote que só aparece com seleção** (VirusPanel).
- **Filtro de texto fixo no topo** (`verticalSticked`, com cabeçalho preso e lista rolando).
- **Valores formatados com unidade** (bytes, bits/s, GHz, tempo) em `UI/ToString.elm`.
- **Título da janela contextual** (ex.: o LogViewer mostra o filtro atual).

**Confusos ou datados:** ver seção 8.

---
## 5. Arquitetura do cliente e o que transpõe para JS puro + Supabase Realtime

**Estado** (`Core/Models.elm:36-41, 60-78`): máquina de 4 estados Home (landing/login) → Setup (assistente inicial) → Play (OS) | Panic. Dentro do Play: `game` (conta, servidores, storyline, inventário, web, backflix) + `os` (header, janelas, toasts, mapa).
- **Servidores** (`Game/Servers/*`): cada servidor guarda processos, logs, arquivos (por storage), hardware, túneis, notificações e endpoints.
- **Conta:** banco de alvos, finanças, bounces, dock, notificações.
- **Cache de gateways:** o cliente guarda quais endpoints cada gateway tem aberto.

**Eventos do servidor → UI:**
- **Canais** (`Driver/Websocket/Channels.elm:4-24`): `account:<id>`, `server:<id>` (meu), `server:<id>@<ip>` (remoto) e `logflix` (debug).
- **Mapa evento → handler** (`Events/*/Handlers/*`):
  - Conta: bounce criado/atualizado/removido; conta bancária atualizada/fechada; conta do DB atualizada/removida; **senha adquirida**; vírus coletado; história (e-mail enviado, resposta enviada, resposta liberada, passo avançou, tutorial terminou).
  - Servidor: arquivo adicionado; arquivo baixado; log criado; log alterado; placa-mãe atualizada; processo concluído; **processos recalculados**; bruteforce falhou.
  - Cada handler decodifica o payload para uma mensagem tipada, e o `Core/Update.elm` repassa em lote para os submodelos.
- **Eventos ricos em payload** (nip, senha, id do processo, motivo) permitem atualizar a UI sem refetch.

**Requests:**
- Cada ação tem um "tópico" (`Requests/Topics.elm`): `file.index/delete/move/rename/create/download/upload`, `log.index`, `processes.index`, `meta.index`, `cracker.bruteforce`, `network.browse`, `bounce.create/update/remove`, `bank.login/transfer`, `virus.collect`, `email.reply`, `pftp.*` (FTP público), `client.setup`, `client.action`, `config.check/set`, `bootstrap` (ressincronizar), `logout`.
- Estas são ações do jogador; use-as como lista de endpoints/RPCs para planejar.
- **Request ↔ evento assíncrono:** `Game/Meta/Types/AwaitEvent.elm` associa um id de request a "quando chegar o evento X, dispare a mensagem Y". Pegar o id do request, esperar o evento correspondente e só então atualizar a UI. Transponível 1:1.
- **Otimismo:** processo "Starting" criado localmente e substituído pelo estado oficial quando o servidor responde.
- **Servidor autoritativo:** a lista de processos é substituída por inteiro a cada recálculo; o cliente só interpola a barra.

**O que transpõe para JS puro + Supabase Realtime:**
- Canal por conta e por servidor → `supabase.channel('account:'+id)` e canal por servidor (`broadcast` ou Postgres Changes em tabelas `processes`, `logs`, `files`). O prefixo de canal diferencia "meu servidor" de "servidor remoto".
- Handler por nome de evento → um `Map` evento→função que atualiza uma store; UI reativa a partir da store.
- AwaitEvent → Promise/`Map<requestId, resolver>` ligada ao evento de volta.
- Cliente pequeno: estado normalizado (processos, logs, arquivos) + store com `subscribe`; a UI só renderiza.
- Processo = linha com `started_at`, `completes_at`, `state`; o cliente anima a barra localmente (não há necessidade de ticks do servidor).
- Reconexão: HEBorn só trata `Disconnected` e não demonstra reconexão nem ressincronização (incerto; só vi o evento, não achei lógica de retry no `Driver`). **No nosso caso: ressincronizar (`bootstrap`) ao reconectar e mostrar estado "offline".**

---
## 6. Onboarding, setup e landing

**Landing** (`Landing/View.elm:28-78`, `Landing/Login/View.elm`):
- Um texto estilo terminal ("startx", "Loading resources... OKAY") que cria atmosfera, e depois o formulário de login. O signup só aparece em build de desenvolvimento (linha 75).
- Validação inline por campo e mensagem de erro de login separada para três casos: credenciais erradas, erro de rede, erro inesperado (`Login/View.elm:55-70`). O botão fica desabilitado visualmente enquanto há erro.

**Setup** (`Setup/*`): assistente com barra lateral de passos, ordem Welcome → Mainframe (nome do servidor) → Finish (`Models.elm:50-55`); PickLocation (mapa) existe como página mas não está na ordem padrão.
- Textos de boas-vindas e despedida com humor e personagem.
- Jogadores que voltam veem um "Welcome" e "Finish" alternativos ("temos novidades, mas configure primeiro").
- Tela de carregamento com piada enquanto baixa os dados do servidor (`Setup/View.elm:33-41`).
- Dados coletados: nome do servidor e localização geográfica (`Setup/Settings.elm:16-18`).

**Tutorial narrativo** (`Game/Storyline/*`) — a parte mais original:
- Um NPC "amigo" conversa por e-mail/chat. As falas do jogador são opções de resposta pré-definidas, e cada resposta destrava a próxima fala. O "checkpoint" é uma tupla (quest, passo, última fala) comparada por ordem (`Shared.elm:79-215`).
- **A dock começa só com o Email** e libera Browser, TaskManager, DBAdmin e Explorer conforme o checkpoint (`Storyline/Dock.elm:8-54`).
- Passos do tutorial: preparar o PC → baixar o cracker → "vírus feio" (invadir um servidor e achar o arquivo) (`Shared.elm:62-66`). Objetivos: baixar cracker, perguntar sobre o vírus, limpar rastro, etc. (linhas 55-60).
- O NPC explica apps no momento certo (ex.: "dá uma olhada no TaskManager", e depois explica que ali se vê processos, recursos e tempo).
- **O cliente avisa o servidor de ações do tutorial** (`Game/Meta/Types/ClientActions.elm:4-14`: abriu o TaskManager, viu o vírus). O avanço do passo depende de eventos do jogador, não só de tempo.
- Um passo pode pedir ao cliente "execute este arquivo" ou "vá para este app neste contexto" (`StepActions/Shared.elm:11-13`).

---
## 7. PRONTO PARA PORTAR — 12 ideias (spec nossa; design system: neutro escuro, acento verde, Inter/JetBrains Mono, Lucide)

**1. Faixa de contexto de conexão (topo, sempre visível).**
- Layout: barra fina com chip "Meu PC" (ícone `monitor`) → "Bounce: nome ▾" (`route`) → "Alvo: IP ▾" (`crosshair`). Segmento ativo com acento verde; as outras ficam em cinza.
- Estados: *offline* (só "Meu PC"); *conectando* (spinner no chip do alvo); *conectado* (chip verde com IP e tempo de sessão, botão "Desconectar" `log-out`); *erro* (chip âmbar com motivo curto).
- Regra: bounce editável só antes de conectar, depois somente leitura (como HEBorn). Clique no chip do alvo alterna a visão global "Meu PC | Alvo".

**2. Widget global de processos (rodapé/lateral) + página completa.**
- Widget: contador "3 ativos" e as 3 linhas mais próximas de terminar (nome, alvo, barra fina, ETA em mono).
- Página: tabela com colunas Processo / Alvo / Progresso+ETA / Recursos (CPU, RAM, ↓, ↑ em colunas mono) e linha de 4 mini-gráficos (sparklines de 20 amostras) no topo.
- Estados: Starting (esqueleto), Running, Paused, Concluded, Failed (com **motivo** visível, melhoria sobre o original).
- Ações com botões visíveis (⏸ ▶ ✕), com confirmação só para cancelar processos longos. Filtros: "Meus" e "No alvo".
- Estado vazio: "Nenhum processo. Inicie um crack ou download."

**3. Painel de ataque no alvo (substitui o "browser + toolkit").**
- Cartão do alvo (IP, tipo, nome) com três seções: **Arquivos públicos** (lista com módulos e versões como chips), **Acesso** (campo senha pré-preenchido do banco de alvos, botões "Entrar" e "Quebrar senha"), **Ações pós-login** (Abrir arquivos, Logs, Processos, Desconectar).
- Estados: *sem senha conhecida* (Entrar desabilitado, destaque no "Quebrar senha"); *crackando* (barra de progresso e link para processos); *senha obtida* (campo preenchido + toast); *logado* (seção Acesso colapsa em "Conectado há mm:ss").
- Erro de login: caixa inline abaixo do campo com "Senha incorreta ou alvo indisponível. Tente novamente." Sem modal.

**4. Banco de alvos ("Caderno").**
- Abas Alvos / Contas bancárias / Carteiras BTC. Linha recolhível: apelido (fallback IP), IP em mono, chip de vírus ativo; expandida mostra senha (mascarada com "revelar"), notas, vírus instalados, "última vez que entrei".
- Edição inline de apelido e notas (Aplicar/Cancelar). Menu "⋯": Abrir alvo, Copiar IP, Esquecer.
- Auto-entrada quando o crack termina; item novo com destaque de 5 s. Busca fixa no topo. Vazio: "Quando você quebrar uma senha, o alvo aparece aqui."

**5. Gerenciador de arquivos com toggle Meu PC | Alvo.**
- Layout em 2 colunas (árvore + lista) com breadcrumb e botões subir/novo arquivo/nova pasta. Colunas: ícone por tipo, nome, versão, tamanho.
- Software com módulos: linha expansível com sub-linhas de módulo e versão.
- Ação primária muda com o lado: "Baixar" no alvo, "Enviar" no meu PC; confirmação de storage como pequeno seletor no próprio botão (não modal pesado).
- Barra de uso de disco **real**. Renomear e criar são inline; mover é "selecionar destino → confirmar".

**6. Visualizador de logs com "limpar rastro" guiado.**
- Lista recolhível em ordem cronológica. Texto formatado com chips clicáveis de IP, arquivo e usuário (tipos: login local/remoto, conexão via bounce, download por/de).
- Ações por log: Editar (inline), Criptografar, Ocultar, Apagar (esta última com confirmação rápida inline "Apagar? Sim / Não"). Logs criptografados mostram um bloco opaco e só permitem Ocultar/Apagar.
- **Melhoria sobre o original:** realçar logs que citam meu IP (filtro "Citam você") e um contador "N registros seus restantes" no cabeçalho.
- Estados: sem logs ("Nada registrado."); log novo com marca "novo" e ponto verde.

**7. Construtor de bounce.**
- Duas colunas: esquerda "Servidores disponíveis" (do banco de alvos, com busca; os já usados somem), direita "Caminho" numerado com ▲ ▼ ✕ por hop e linha final "→ destino".
- Nome editável no topo. "Salvar" só aparece com mudanças; "Descartar" pede confirmação; sair com mudanças pendentes pergunta "Continuar sem salvar?".
- Vazio: botão grande "Criar primeiro bounce". Erros curtos e específicos (criar/atualizar/remover).
- Mostra o custo/latência estimados da rota (extensão nossa, opcional).

**8. Notificações acionáveis (sino + toasts).**
- Sino com contador; dropdown com título, corpo e ação principal por tipo: "Ver processo", "Abrir arquivo", "Abrir alvo", "Ler mensagem". Clicar em qualquer item marca como lido e navega.
- Toast no canto: clique executa a ação e fecha; auto-oculta com fade. Tipos: início e fim de download, upload, crack; e-mail novo; falha.
- Botão "Marcar tudo como lido". Vazio: "Sem notificações."

**9. Mensageiro de missão (tutorial narrativo).**
- Cabeça/avatar flutuante (compacto) que expande para um painel de chat. As falas do NPC aparecem como balões; as **respostas do jogador são botões** (não texto livre). IPs viram links que abrem o painel de ataque.
- Progresso do tutorial dirigido por eventos reais do jogador (abriu processos, baixou, entrou), não por tempo.
- Cada passo pode apontar para uma tela ("Ir para Processos"). Barra lateral estreita "Objetivo atual" com 1 linha e um botão de ação.

**10. Desbloqueio progressivo da navegação.**
- A sidebar começa só com "Mensagens" e "Terminal/Alvo"; itens novos surgem com animação sutil e um ponto verde de "novo" conforme os passos do tutorial. Itens futuros nunca aparecem bloqueados (evita ruído).
- Estado: um mapa `passo → itens liberados` configurável no servidor.

**11. Coleta de vírus/renda passiva.**
- Lista de alvos com vírus ativo: checkbox, "<vírus> em <alvo>", "rodando desde", rendimento estimado. "Selecionar todos". Botão "Coletar (N)" só aparece com seleção.
- Passo 2: escolher conta ou carteira de destino e bounce (se houver). Confirmação em um resumo: "Coletar de 3 alvos para Conta X".
- Estados: coletando (barra), sucesso (valor creditado e link para finanças), erro (motivo).

**12. Tela de carteira ("Finanças").**
- Abas Dinheiro / BTC. Linhas "nome + conta | saldo" com total no rodapé fixo. Separar claramente "minhas contas" de "contas de alvos" (aba do Caderno).
- Banco no mundo do jogo: login (conta + senha), saldo, transferência (banco destino, conta, valor) com erros inline. Vazio: "Nenhuma conta ainda."

---
## 8. ARMADILHAS

1. **Janelas flutuantes (arrastar/sobrepor/fixar/minimizar)** pesam no DOM e confundem em telas pequenas; muita chrome por pouca informação. Preferir páginas e painéis.
2. **Ações escondidas em menu de contexto** (processos, arquivos, logs, abas, janelas). Descoberta ruim, sem equivalente em touch. Use botões visíveis.
3. **Dois contextos (Gateway/Endpoint) em toda parte** gera dúvida de "onde estou olhando?". Se adotar o toggle, **rotule sempre** o lado e use cor/etiqueta no cabeçalho da página.
4. **Painel pós-login em lista de links textuais** é pobre; não copie a ideia de "listar apps" como menu.
5. **Muitos stubs "TODO"** (9 sites do browser, LanViewer, CtrlPanel, B0TN3T, Chat, QuestHelper, readonly do ServersGears, AnyMap, Run). Não tomar o que existe como especificação completa.
6. **Pause/Resume/Remove só locais** (sem request) e **sem UI de prioridade** apesar do modelo ter 5 níveis: promessas de produto não entregues.
7. **Falha de crack com texto genérico** ("Completed (failure)"); o motivo chega do servidor mas é ignorado.
8. **Filtros decorativos** (flags do LogViewer, ordenação do ConnManager) e barra de disco com dados fixos: UI que parece funcional e não é.
9. **Bounce selecionável mas não aplicado** no login (TODO no código); risco de prometer anonimato sem efeito.
10. **Modal com texto de placeholder** (o seletor de storage mantém uma frase de exemplo no código). Revisar todo microcopy.
11. **Humor excessivo e referências datadas** na landing e no setup (piadas, "FINISH HIM"); pode cansar. Manter o tom, enxugar a quantidade.
12. **Dois modos (campanha e freeplay)** com janelas e docks separados dobram a complexidade; só considere se o produto realmente tiver os dois.
13. **Sem atalhos de teclado e sem navegação por teclado** (exceto a calculadora); acessibilidade fraca.
14. **Contraste/legibilidade:** o uso de texto cru em mono para tudo (IP, logs, e-mail) é bom, mas ausência de hierarquia tipográfica faz as telas parecerem tabelas de debug. Hierarquia (título, metadado, dado em mono) é onde podemos ganhar.
15. **Reconexão/ressincronização não evidente** (só tratamento de `Disconnected`); evite depender de eventos perdidos. Usar `bootstrap`/snapshot ao reconectar.
16. **Dado sensível exposto**: senhas dos alvos aparecem em claro no Caderno; mascarar com "revelar".
17. **Nomes e jargão** (DLaydOS, HEBorn, Thunderpigeon, B0TN3T) são identidade deles; não reaproveitar nomes, ícones, textos ou assets (AGPL).

---
**Nota legal final:** nada neste relatório reproduz trechos de código, CSS, imagens ou textos do HEBorn. Onde mencionei "frases" (ex.: erro de login) descrevi o sentido, não o texto. Para a UI nossa, escreva microcopy original.

**Itens incertos:**
- ConnManager: se os botões ↑/↓ de filtro têm efeito.
- Existência de lógica de reconexão no `Driver`.
- Detalhes finos de `AnyMap` (marcado STUB no browser).
- Onde exatamente `Encryptor` e `Decryptor` são iniciados pelo jogador (há tipos e notificações, mas não achei botão ligado).

Não rodei nenhum comando de escrita. A skill `dak-setup` mencionada no prompt do sistema não faz parte da minha tarefa read-only, então não a executei.