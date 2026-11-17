# Helix (HE2): rede, bounce, logs, história, eventos e segurança

> **Licença da fonte: AGPL-3.0.** Este documento descreve IDEIAS, regras e números com palavras próprias. Nenhum código, CSS, imagem ou texto foi copiado, e nada daqui pode ser colado no projeto. Ver [`README.md`](./README.md) e [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md).

# Relatório Helix (HE2) → Hacker City Web
Escopo lido: server, network, log, entity, account, story, notification, event, websocket, http, cache, universe (bank/npc), client, core, priv/migrations, events.json, STYLE.md. Caminhos relativos a `he-helix/` (ex.: `lib/network/model/tunnel.ex:172` = `lib/network/...`). Tudo abaixo é descrição minha de ideias, fórmulas e constantes (fatos); pseudo-código é meu.
Nota: a mensagem original trazia um aviso de "Data Agent Kit não configurado". Não rodei o `dak-setup`, porque sou read-only e ele exige input do usuário. Ignorei esse aviso nesta tarefa.

## 0. ACHADOS-CHAVE (leia primeiro)
1. **O HE2 NÃO tem "Heat", polícia nem traceback ativo.** `grep` por traceback/heat/wanted/fbi/police/safenet/detect não achou nada no código. O rastreio é 100% **passivo e forense**: o jogo grava logs em cada nó da cadeia, e investigar significa ler logs salto a salto. Nosso Heat/Sentinel/Safenet/FBI é design original nosso, e dá para usá-lo em cima dos logs/bounce do HE2.
2. **Jogador não apaga log.** Não existe "delete log" para o jogador. Só existem `forge edit` (cria uma revisão), `forge create` (log falso) e `recover` (desfaz a última revisão forjada). A única remoção é efeito colateral do recover (ver §3). Os arquivos `log_forge`/`recover` estão em estado legado/incompleto (ver §3).
3. **Storyline implementada = só um Tutorial de 3 steps** (`lib/story/mission/tutorial/steps.ex`). Não há recompensas, quadro de missões nem NPC de missão procedural. O que vale aproveitar é a **máquina de estados** (steps + emails + filtros de evento), não o conteúdo.
4. **Segurança do HE2 = validação em camadas no servidor + transações SERIALIZABLE + `SELECT … FOR UPDATE` no dinheiro.** Não há rate limit nem idempotency-key no código lido (`grep rate/throttle` vazio).
5. Os IDs do Helix são IPv6-like (128 bits) e o jogo usa IPs de NIC. O tipo `HELL.IPv4` aparece em vários modelos e há `lib/hell/hell/ip.ex` com IPv6. **Incerto** qual dos dois é o IP de jogo.

---
## 1. MODELO DE DADOS HE2 → TABELAS POSTGRES/SUPABASE
Entidades e relações, descritas em palavras:
- **Account** (`lib/account/model/account.ex:42-190`): id, email, username, display_name, password (bcrypt), confirmed, timestamps. Username: regex `[A-Za-z0-9][A-Za-z0-9!?$%-_.]{1,15}`. Senha: mínimo 8 caracteres. Email e username são únicos e guardados em minúsculas. `account_sessions` guarda o token de sessão (UUID assinado, max_age de 7 dias, `lib/account/internal/session.ex:9`). `account_settings`: embed com flags.
- **Entity** (`lib/entity/model/entity.ex:36-45`): "quem age". Pode ser player ou npc. 1 conta ↔ 1 entity. Tabelas de ligação `entity_servers` (único por server_id) e `entity_components` (inventário de hardware). O Account **não** é a dona dos servidores, a Entity é.
- **Server** (`lib/server/model/server.ex:45-55`, `server/type.ex:19`): `server_id`, `type ∈ {desktop, mobile, npc, desktop_story, npc_story}`, `motherboard_id` (único, nulo = "desmontado"), `hostname` (regex `[a-zA-Z0-9-_.@#]{1,20}`), `password` (root). A senha do servidor é gerada com 8 letras + 4 dígitos (`lib/hell/hell/password.ex:3-4`). Senha de conta bancária: 8 letras (`:6-7`).
- **Hardware**: component(cpu, ram, hdd, nic, mobo) + `component_specs`. Specs iniciais (`lib/server/component/specs/specable.ex`): CPU clock 256, RAM size 256 clock 100, HDD size 1024 iops 1000, NIC genérica, preços base 50–150. A mobo tem slots por tipo (cpu, ram, hdd, nic, usb).
- **Network** (`lib/network/model/network.ex:41`): `{id, name, type ∈ internet|story|mission|lan}`. A internet é a rede com id `::`. Outras redes isolam NPCs de história/missão.
- **Network.Connection = NIP** (`lib/network/model/network/connection.ex:67-77`): PK composta `(network_id, ip)` + `entity_id` + `nic_id` nulo. O IP pertence à Entity (inventário) e só vale se estiver numa NIC montada. Servidor ↔ IP vem da NIC.
- **Tunnel** (`lib/network/model/tunnel.ex:58-88`): `(tunnel_id, network_id, gateway_id, target_id, bounce_id nullable)`. Existe índice **UNIQUE (gateway, target, network, bounce)** (`priv/repo/network/migrations/20180118194327_add_bounce.exs:52-54`). Ou seja, uma "rota" por combinação.
- **Link** (`lib/network/model/link.ex:41-60`): materializa os saltos do tunnel `(tunnel_id, source_id, target_id, sequence)`. Serve para a consulta "quais conexões passam por este nó" (`connection.ex:96-133`).
- **Connection** (`lib/network/model/connection.ex:49-57`): `(connection_id, tunnel_id, connection_type, meta jsonb)`. Tipos: ssh, ftp, public_ftp, bank_login, wire_transfer, virus_collect, cracker_bruteforce. `meta` leva dados do tipo (ex.: `atm_id` e `account_number` no bank_login).
- **Bounce** (`lib/network/model/bounce.ex:265-283`): `(bounce_id, entity_id, name)` + `bounce_entries` (server_id, network_id, ip) + `sorted_bounces` (array jsonb ordenado). É a **cadeia nomeada e reutilizável de saltos do jogador**.
- **DNS**: `dns_unicast(network_id, name, ip)` e `dns_anycast(name → npc_id)` (`lib/network/model/dns/*.ex`). `webservers(ip, content ≤2048 chars)` guarda a página do jogador (`web/player.ex:19`).
- **Log**: `logs(log_id, server_id, entity_id, message, crypto_version, creation_time)` + `revisions(revision_id, log_id, entity_id, message, forge_version nullable, creation_time)` + `log_touches(log_id, entity_id)` (`lib/log/model/*.ex`). Índice `(server_id, creation_time)`.
- **Database do jogador** ("hosts conhecidos", `lib/entity/model/database/*.ex`): `database_servers(entity_id, network_id, server_ip, server_id, server_type npc|vpc, password, notes ≤1024, last_update)`, `database_bank_accounts(entity_id, atm_id, account_number, password, token, known_balance, last_login_date…)`, `database_viruses(entity_id, server_id, file_id único)`. Atualizada por eventos (senha crackeada, login no banco, vírus instalado).
- **Bank** (`lib/universe/bank/model/*.ex`): `bank_accounts(PK atm_id+account_number, bank_id, owner_id, password, balance int, creation_date)`, nº da conta aleatório 100000..999999. `bank_transfers(transfer_id, account_from/to, atm_from/to, amount>0, started_by, started_time)`. `bank_tokens(token_id uuid, atm_id, account_number, connection_id, expiration_date)`. NPC → bank → atm (cada ATM é um server).
- **NPC** (`lib/universe/npc/model/npc.ex`): tipos `download_center|bank|atm|story_char`. O seed (`npc/model/seed.ex`) tem 1 download center (DC0), Bank1 com 3 ATMs e Bank2 com 2 ATMs, com IPs fixos e DNS anycast (`bank.com`, `dc.com`).
- **Notificações**: `notifications_account(notification_id, account_id, code, data jsonb, is_read, creation_time)` e `notifications_server(…, server_id, account_id, …)` (`lib/notification/model/notification/account.ex:35-57`). Índices por conta e conta+servidor.
- **Story** (`lib/story/model/story/*.ex`): `story_steps(entity_id, contact_id → PK; step_name, meta jsonb, emails_sent[], allowed_replies[])`, `story_emails(entity_id, contact_id; emails jsonb[] {id,sender,meta,timestamp})`, `story_contexts(entity_id; context jsonb)`, `story_manager(entity_id, server_id, network_id)`.
- **Core listener** (`lib/core/listener`): tabela `listeners(object_id, event hash md5, callback[módulo,método], meta)` + `owners`. É um "quando o evento X acontecer no objeto Y, chame Z" persistido.
- **Process** (`lib/process/model/process.ex:301-361`, fora de escopo): carrega `gateway_id`, `target_id`, `source_entity_id`, `network_id`, `bounce_id`, `src_connection_id`, `src_file_id`, atm/conta origem/destino. Isso vincula o processo ao túnel e ao bounce.
- **Cache**: `server_cache`, `network_cache`, `storage_cache`, `web_cache` com `expiration_date` (web = 24 h, `cache/model/web_cache.ex:18`). É cache de lookup ip→server em Postgres, com fila de purge.

**Mapeamento sugerido (Supabase)** — esquema enxuto, adaptado ao nosso jogo:
```sql
players(id uuid pk refs auth.users, handle text unique, ...)      -- = account+entity fundidos
servers(id, owner_id nullable, kind text check in ('player','npc','story','bot'),
        ip inet unique, hostname text, root_pwd text, hw jsonb, heat_signature int)
tunnels(id, gateway_id, target_id, bounce_id nullable,
        unique (gateway_id, target_id, bounce_id))
connections(id, tunnel_id on delete cascade, kind text, meta jsonb, opened_at, closed_at)
bounces(id, owner_id, name, hops uuid[] /*ordenado*/, created_at)
server_logs(id, server_id, author_id, message, created_at, orig_message, forged bool)
log_revisions(id, log_id, author_id, message, forge_ver int null, created_at)
known_hosts(player_id, server_id, ip, pwd, notes, updated_at, pk(player_id,server_id))
bank_accounts(bank_id, number int, owner_id, pwd, balance bigint check(balance>=0))
bank_transfers(id, from_acc, to_acc, amount check(amount>0), state, done_at)
notifications(id, player_id, code, data jsonb, read bool, created_at)
story_state(player_id, contact, step, meta jsonb, emails_sent text[], allowed_replies text[])
```
Decisão importante: o HE2 separa em muitos Repos/bancos por domínio. Para nós, **um único schema Postgres** e FKs reais.

---
## 2. REDE E RASTREIO

### 2.1 Conectar a um servidor (fluxo "remote join")
(`lib/server/websocket/channel/server/join.ex:58-123 e 140-260`)
O cliente entra num canal com tópico `server:<network>@<ip>#<contador>` e manda gateway_ip, senha e `bounce_id` opcional. O servidor faz, nesta ordem:
1. Valida formato (nip, senha, bounce).
2. Verifica que **o gateway pertence ao jogador** (`channel.ex:48-70`).
3. Verifica que gateway e destino têm hardware montado.
4. Compara a **senha root** do destino com a enviada (igualdade simples, `server/henforcer/server.ex:77-84`).
5. Verifica que o jogador é dono do bounce (`bounce.ex` `can_use_bounce?`: bounce nulo sempre pode).
6. Cria (ou reaproveita) o tunnel + uma conexão `ssh`, emite `ConnectionStarted`, que gera os logs (§2.3).
7. Registra o canal para broadcast e devolve o "bootstrap" (logs, arquivos, processos, hardware daquele servidor).

O "contador" `#n` permite o mesmo jogador abrir **várias sessões** no mesmo servidor, cada uma com um canal próprio (`lib/server/state/websocket/server.ex`).

**Pseudo-código meu (RPC `connect_server`):**
```js
function connect(playerId, gatewayId, targetIp, pwd, bounceId) {
  assert(owns(playerId, gatewayId)); const target = byIp(targetIp);
  assert(target.root_pwd === pwd);                         // senha conquistada (bruteforce)
  const hops = bounceId ? bounceOwnedBy(playerId, bounceId).hops : [];
  assert(!hops.includes(gatewayId) && !hops.includes(target.id) && gatewayId !== target.id);
  const tunnel = upsertTunnel(gatewayId, target.id, bounceId);     // unique(gateway,target,bounce)
  const conn = insertConnection(tunnel.id, 'ssh');
  writeConnectLogs(tunnel, hops, conn);                            // §2.3
  return bootstrap(target);
}
```

### 2.2 Bounce / proxy chain
- Um bounce é uma lista ordenada de nós `(server, network, ip)` do jogador (`bounce.ex:285-297`).
- **Para criar ou editar o bounce o jogador precisa ter acesso a cada salto**: o `link` enviado carrega ip + SENHA de cada nó e o servidor confere (`network/henforcer/bounce.ex:180-195`, `can_create_bounce?:48`). Ou seja, **só se pode usar como proxy uma máquina que já foi invadida**. Mecânica ótima para a nossa botnet de 210 bots: cada bot hackeado é um salto potencial.
- **Não pode remover nem editar os saltos** de um bounce enquanto ele estiver em uso por algum tunnel (`bounce.ex:66-125`, `bounce_not_in_use?`). Renomear é livre.
- O Tunnel valida (`tunnel.ex:172-218`): `gateway != target`, e nenhum salto pode ser o gateway ou o alvo (`cyclic_gateway/cyclic_target`).
- O bounce vai herdado em **todos os processos e eventos** da sessão (`event.ex:121-150`, o `inherit` repassa `bounce`, `process_id`, `request_id`, e acumula uma `stack` de eventos de origem). Isso faz cada ação (download, upload, virus install…) gerar logs ao longo do mesmo caminho.
- Pode ser ligado a transferência bancária: `bank/action/flow/bank_transfer.ex` carrega `bounce_id` do tunnel no processo (há TODO #379 para bounce implícito entre ATMs).
- Os saltos são materializados em `links(sequence)`: `[gateway→hop1, hop1→hop2, …, hopN→target]` (`link.ex:41-60`).
- Fechar a última conexão de um tunnel **apaga o tunnel** (`network/event/handler/tunnel.ex:8-12`). Fechar uma conexão **mata os processos que dependiam dela** (`events.json` `Process.TOP` recebe `Connection.Closed`).

### 2.3 Como o rastro nos logs é gerado (o coração do traceback)
Núcleo: `lib/event/loggable/flow.ex:115-169` e `266-308`.
Cada evento "logável" declara só: quem é o gateway (origem), quem é o endpoint (destino) e **duas mensagens com marcadores** (`$first_ip` e `$last_ip`). O motor então grava:
```js
function writeTraceLogs({gateway, endpoint, hops, msgGw, msgEp}) {
  const firstIp = hops.length ? hops[0].ip  : endpoint.ip;       // o que o ORIGEM "vê" ao sair
  const lastIp  = hops.length ? hops.at(-1).ip : gateway.ip;      // o que o DESTINO "vê" ao receber
  insertLog(gateway.id,  msgGw.replace('$first_ip', firstIp));    // "localhost logged into X"
  insertLog(endpoint.id, msgEp.replace('$last_ip',  lastIp));     // "Y logged in as root"
  const path = [gateway, ...hops, endpoint];
  for (let i = 1; i < path.length - 1; i++)                       // cada salto intermediário
    insertLog(path[i].id, `Connection bounced from ${path[i-1].ip} to ${path[i+1].ip}`);
}
```
Consequências de design (valiosas):
- **Sem bounce**: o log do destino contém o **IP real do atacante**, e o log do atacante contém o IP do destino. É o "atacante identificável".
- **Com bounce**: o destino só enxerga o **último salto**. Cada salto guarda "veio de A, foi para B" (IP anterior e próximo), então um investigador consegue **caminhar a cadeia de trás para frente**, desde que consiga entrar em cada salto (senha). Isso é a mecânica de traceback.
- **Logs são strings**: textos como "localhost logged into $first_ip", "$last_ip uploaded file NAME to localhost", "…installed virus NAME at…" (`connection.ex:39-40`, `virus.ex:128-129`, `file.ex` upload/download).
- **Quem gera log**: login remoto (ssh), upload, download, install de vírus, join local ("Localhost logged in", `server/event/server.ex:30-45`). **Bruteforce/cracker e bank login não geram log próprio** nos arquivos lidos (só ssh/file/virus/server têm `loggable`).
- **Opções do motor** (`flow.ex`): `skip_bounce` (log "offline" sem cadeia), `censor_first` e `censor_last` (censura o IP). `censor_ip` troca por `x` os **últimos 5 dígitos** do IP, ex. `123.123.123.123 → 123.123.1xx.xxx` (`lib/event/loggable/utils.ex:22-48`). O **Public FTP** usa isso: o servidor público grava o IP do baixador **censurado**, enquanto quem baixa grava o IP do servidor inteiro (`file.ex:185-215`). Ideia pronta para "proxy anônimo/honeypot".
- Logs de IP desconhecido usam a string "Unknown".
- O log é criado no momento do evento, no mesmo fluxo (`log/event/handler/log.ex`), e o evento `log_created` é publicado para quem estiver no servidor (§5).

### 2.4 Como o rastreamento é "evitado" e "medido"
- **Evitado** apenas por: (a) bounce com N saltos, (b) editar/forjar logs (§3), (c) censura de IP em serviços públicos.
- **Medido**: não existe métrica. Não há "custo de rastreio", "tempo de traceback" nem "nível de procurado". A única medida natural é **n.º de saltos** e **n.º de logs ainda intactos** na cadeia.
- Para o nosso Heat: derivar de dados reais do HE2, por exemplo `heat_gain(ação) = base[ação] * (1 + 0)` se a cadeia tem saltos limpos, ou proporcional ao **número de logs com `forged=false` que ainda ligam ao seu IP**. Sentinel 30% e Safenet podem virar "probabilidade de varrer a cadeia salto a salto".

---
## 3. LOGS: revisões, forjar, recuperar
**Modelo** (`lib/log/model/log.ex`, `revision.ex`, `log_touch.ex`): o log tem texto atual + pilha de revisões. A criação já nasce com a revisão 0 (forge_version=nulo = original do sistema). Cada forjada empilha uma revisão com `forge_version = nível do software de forjar` (>0). `log_touches` registra todo mundo que já tocou o log, mesmo se a revisão for removida (o cliente mostra "logs que editei").

**Regras do recover** (`lib/log/internal/log.ex:86-113`, doc em `action/log.ex`): olha as 2 últimas revisões.
- Só 1 revisão e ela é original (`forge_version` nulo) → **erro `original_revision`** (nada a recuperar).
- Só 1 revisão e ela é forjada → o **log inteiro é apagado** (era um log falso criado por `forge create`).
- 2+ revisões → remove a mais nova e restaura a mensagem da anterior.
Eventos emitidos: `log_modified` ou `log_deleted`.

**Forge create** (`log/event/handler/log.ex`): cria um log novo no alvo com `forge_version` → é falso por definição, e por isso o recover o apaga.

**Fórmulas e constantes do processo de forjar** (`lib/software/model/software_type/log_forge/process_type.ex`; arquivo marcado "TODO: rewrite"; o fluxo `log_forger.ex` está **todo comentado** e **não há request websocket** de forge/recover no canal do servidor → mecânica **incompleta/dormente**):
```js
// "cpu" = trabalho total do processo; edit/criar dependem da versão do software
edit_cost   = fat(revs) * 10000 + versao * 150     // revs = n.º de revisões JÁ feitas por ESSE jogador nesse log
              // se o log foi criado por OUTRA entity: usa fat(revs + 1) (um passo a mais)
              // fat(n) = n!   (fat(0)=1 pelo reduce 1..0 tratado)  -> custo explode a cada re-edição
create_cost = versao * 400
// RAM exigida do processo: versao*5 + trunc(sqrt(versao)*50)
```
Constantes de balance (`lib/balance/software/constant.ex:26-45`): razão (peso) por módulo, normalizada em `bruteforce = 1`: overflow 0.9, hasher password 0.95, firewall passivo 0.9 / ativo 0.8, **log_edit 0.7**, **log_create 0.6**, **log_recover 0.65**, spyware 0.5. Essas razões escalam tamanho do arquivo e custo de evolução.
Observações:
- Fórmula recover tempo/dificuldade: **só a razão 0.65 existe**. Não achei processo de recover implementado → incerto como seria o custo. Podemos propor: `recover_cost ∝ revisões_forjadas` simétrico ao edit.
- `crypto_version` existe como coluna do log (para criptografar), mas não há uso no escopo lido.
- Importante p/ nosso jogo: **revisões como pilha** dão um "undo" natural, de modo que quem investiga pode **desfazer** a forja de um atacante (o recover custa e é limitado pelo `forge_version`).
- **Forjar depende de estar conectado** ao servidor alvo: o processo morre se a conexão de origem ou de destino cai (`source_connection_closed`/`target_connection_closed → delete`, `process_type.ex` ~linhas 155-161).

**Pseudo-código meu, "pilha de revisões" em SQL:**
```sql
-- forjar: nunca sobrescreve, empilha
insert into log_revisions(log_id, author_id, message, forge_ver) values ($1,$2,$3,$4);
update server_logs set message = $3 where id = $1;
-- recuperar: desempilha 1
with last2 as (select * from log_revisions where log_id=$1 order by created_at desc limit 2) ...
-- 1 linha com forge_ver is null -> erro; 1 linha forjada -> delete log; 2 linhas -> apaga a mais nova e restaura a anterior
```

---
## 4. STORYLINE / MISSÕES / NPCs
**Hierarquia** (`lib/story/model/step/steppable.ex` docs): Storyline → Chapters → Missions → Steps; **o servidor só conhece Steps**. O resto é abstração.

**Mecânica de um Step** (DSL por macros, `lib/story/model/step/macros.ex`):
- Tem um **contato** (um personagem; um step ativo por contato por jogador, PK `(entity_id, contact_id)`).
- Declara **emails** (mensagens do contato) e **replies** (respostas do jogador). Cada email tem a lista de replies que oferece; cada reply pode estar **travada** até um evento de jogo destravar.
- `on_reply`/`on_email` encadeiam ações: enviar outro email (com `sleep` em segundos), responder sozinho, chamar `complete`, executar bloco arbitrário.
- **`setup/1` é idempotente**: usa `setup_once(:char|:file|:pftp_server|:pftp_file, chave)` que consulta se o objeto já existe e é válido (`story/query/story/setup.ex`). Serve para criar o NPC, o servidor e os arquivos da missão **sem duplicar** quando o step reinicia.
- **`handle_event(step, evento, meta)`** é o gancho central: qualquer evento do jogador passa por todos os steps ativos dele. O retorno é `:noop | :complete | {:restart, motivo, checkpoint_email} | {:send_email,…} | {:send_reply,…}` (`event/handler/story.ex:74-170`).
- **Filtros** prontos no DSL: `filter_download_started`, `filter_bruteforce_started`, `filter_client_action` (ações de UI enviadas pelo cliente, como "abriu o gerenciador de tarefas"), `story_listen(objeto, Evento, callback)` (usa o Core Listener persistido).
- **Restart**: se o jogador estraga o ambiente (apaga o arquivo da missão), o step devolve `{:restart, :file_deleted, "email_checkpoint"}`; `setup` recria os objetos, o histórico de emails volta ao checkpoint (`Story.Step.rollback_email`) e o cliente recebe `story_step_restarted`.
- **Fim do step**: `complete` → `next_step`. Se o próximo for ele mesmo, a história terminou. Avanço feito num processo assíncrono, `Steppable.start(next)` roda, publica `step_proceeded`.
- **Contexto de longo prazo** `story_contexts(entity, contact → json)`: guarda ids de servidor/arquivo do personagem (merge profundo). Dados curtos ficam no `meta` do step.
- **Delay narrativo**: as opções `sleep: N` viram `emit_after(N*1000 ms)` (`event/handler/story.ex:226-232`), fazendo os emails do NPC chegarem "digitando" com atraso.
- **Personagem NPC de história** (`story/make/story.ex`): cria `npc story_char` → entity → servidor NPC com IP aleatório e link `dlk 128 / ulk 64`. Sai com PFTP (Public FTP) para o jogador baixar arquivos.
- **Mapa do Tutorial** (`events.json` + `tutorial/steps.ex`): SetupPC (2 emails de boas-vindas, reply destrava `complete`) → DownloadCracker (NPC publica um cracker bruteforce/overflow lvl 10 no PFTP; baixar dispara reply; apagar reinicia) → NastyVirus (NPC `rcn` com spyware 30; gatilhos: bruteforce iniciado, bruteforce concluído `Server.Password.Acquired`, download iniciado, ações de UI) → loop final.
- **Recompensas**: `grep reward lib/story` vazio. Dinheiro de missão está só previsto como `BankAction.direct_deposit` ("recompensas de missão" citadas na doc, `bank/action/bank.ex`).

**Formato de dados para nós** (missões como DATA, não como código):
```json
{ "id":"m_ilha_01", "contact":"rcn", "steps":[{
    "name":"invadir_banco_local",
    "emails":[{"id":"e1","body_key":"m_ilha_01.e1","replies":["r_aceito"],"delay_s":3}],
    "replies":{"r_aceito":{"locked":false,"on":{"send":"e2"}}},
    "setup":{"npc":"banco_menor","files":["cracker_lv10"],"pftp":true},
    "triggers":[{"event":"server.password_acquired","where":{"server":"$npc"},"do":{"unlock":"r_done"}},
                {"event":"file.deleted","where":{"file":"$cracker"},"do":{"restart":"e1"}}],
    "complete_when":"reply:r_done", "next":"m_ilha_01_s2",
    "reward":{"cash":500,"xp":50} }]}
```

---
## 5. EVENTOS, NOTIFICAÇÕES E CANAIS WEBSOCKET
**Padrão** (`lib/event/event.ex`, `dispatcher.ex`, `events.json`): evento de domínio = struct imutável emitida por uma Action/Flow. O `Dispatcher` (lista declarativa) liga cada evento a:
- **handlers globais** (`dispatcher.ex` "Global handlers"): Listener (listeners persistidos), **Log** (se o evento é "loggable" gera logs), **Notification** (se "notificable" grava notificação), **Publication** (se "publishable" manda para o websocket);
- **handlers específicos**, p. ex. `Bruteforce.Processed → Cracker.bruteforce_conclusion → emite Server.Password.Acquired → Entity.Database grava a senha`.
Cada evento herda metadados do evento de origem: `request_id`, `process_id`, `bounce`, `stack` de eventos que o originaram. Isso dá **rastreabilidade de causa** (auditoria).

**Cadeia típica (process_completed)**: `process termina` → handler `TOP` emite `Process.Completed` (publica para os servidores gateway **e** target, `process/event/process.ex:129`) → handler do tipo emite o evento de domínio (`File.Downloaded`, etc.) → Log gera logs → Database do jogador atualiza → Notification cria registro.

**Lista de eventos publicáveis** (`events.json` "publishable"): `log_created/modified/deleted`, `bounce_*`, `server_password_acquired`, `process_created/completed/killed`, `file_added/deleted/uploaded`, `story_email_sent`, `story_reply_sent`, `story_step_proceeded/restarted`, `virus_installed/install_failed`.

**Canais** (`lib/websocket/websocket.ex:40-45`):
- `account:<id>` — eventos pessoais: bounces, notificações, senha adquirida, história, banco. Tópicos de request: `bootstrap`, `client.setup`, `client.action`, `email.reply`, `account.logout`, `bounce.create|update|remove`, `notification.read`, `virus.collect` (`account/websocket/channel/account.ex`).
- `server:<id>` (jogo local) ou `server:<net>@<ip>#<n>` (remoto) — eventos **do servidor**: logs, processos, arquivos. Tópicos: `config.set/check`, `motherboard.update`, `set_hostname`, `file.download/upload/install`, `pftp.*`, `network.browse`, `cracker.bruteforce`, `bootstrap`.
- **Roteamento da publicação** (`event/publication_handler.ex`): cada evento declara `whom_to_publish = {server:[ids], account:[ids]}`; o handler expande o servidor para **todos os canais abertos** nesse servidor (um por NIP/sessão remota + o canal local por id).
- **Filtragem por quem recebe** (`Publishable.generate_payload(evento, socket)` por socket): o mesmo evento pode chegar diferente — ou não chegar — para cada jogador. Exemplo: processo é `:full` para o dono do gateway ou entity origem, `:partial` para qualquer outro (`process/public/view/helper.ex:67-72`). **A vítima vê o processo, mas sem detalhes.**
- **Notificação** (`event/notificable/*`, `notification/model/code/*`): evento implementa `notification { class, code, whom_to_notify, extra_params }`; o handler grava em `notifications_*` e emite `NotificationAdded`. Códigos existentes: `server_password_acquired`, `file_downloaded`. O `data` é jsonb com `generate_data / after_read_hook / render_data` por código.
- **Bootstrap** (`server/public/index.ex`, `account/public/index.ex`): ao entrar no canal, o cliente recebe snapshot completo (logs, arquivos, hardware, processos, túneis, notificações, bounces, database, contas bancárias). Depois só deltas por evento.
- **Observabilidade extra**: cada request ganha `request_id` (UUID ou do cliente) e a resposta o devolve em `meta` (`websocket.ex`, `request/relay.ex`), permitindo ao cliente casar request ↔ evento.

**Mapeamento Supabase Realtime**
| HE2 | Supabase |
|---|---|
| `account:<id>` | Postgres Changes em `notifications`/`known_hosts`/`bounces` filtrado `player_id=eq.<uid>` + RLS |
| `server:<id>` (logs, processos) | Postgres Changes em `server_logs`, `processes` com RLS "tenho conexão aberta neste servidor" |
| "payload diferente por jogador" | **RLS + view** (ex.: view `processes_visible` que mascara colunas p/ não-dono), ou broadcast por canal privado `server:<id>:<player>` publicado por trigger `realtime.send()` |
| evento de domínio + handlers | Trigger `AFTER INSERT` na tabela `domain_events(type, payload, request_id, cause_stack[])` + funções que reagem (`pg_net`/queue) |
| Dispatcher declarativo | tabela `event_handlers(event_type, fn_name)` + função `dispatch(ev)` |
| `request_id` | coluna `request_id uuid` em todas as tabelas de ação |
Regra de ouro: **o cliente só lê; toda escrita vai por RPC** (`security definer`).

---
## 6. SEGURANÇA E ANTI-CHEAT: o que é transponível
O que o HE2 faz (e o que NÃO faz):
1. **Pipeline de 4 fases por request** (`websocket/request/requestable.ex`, `websocket.ex:handle_request`): `check_params` (formato; tudo que o cliente manda fica em `unsafe` e nunca é reusado depois) → `check_permissions` (posse/autorização) → `handle_request` (ação) → `reply`. Nunca se confia em `unsafe` depois da fase 1. **Transponível**: toda RPC = validar entrada, checar `auth.uid()`/posse, executar, retornar.
2. **"Henforcer"** (`lib/henforcer/henforcer.ex`, STYLE.md): predicados compostos que retornam `{true, relay}` ou `{false, motivo, relay}`; um check só verifica 1 coisa e **devolve os objetos que buscou** (evita refetch). Checks: `owns_server`, `owns_bounce`, `owns_nip`, `owns_component`, `owns_virus`, `owns_bank_account`, `password_valid`, `server_assembled`, `bounce_not_in_use`, `valid_counter`. **Transponível**: funções SQL `assert_owns_server(uid, sid)` reutilizáveis dentro das RPCs.
3. **Dinheiro**: tudo em transação **SERIALIZABLE** + `SELECT … FOR UPDATE` (`universe/repo.ex:9`, `bank/internal/bank_account.ex:88-120`, `bank_transfer.ex:39-130`). Saque confere `saldo >= valor` dentro da transação. Transferência é em 2 fases com **dinheiro em trânsito**: debita na origem ao iniciar, cria a linha de transfer, e o processo (TOP) leva tempo proporcional ao valor; ao concluir, credita no destino e apaga a linha; se o processo é morto/abortado, **estorna** a origem (`transfer_aborted`). Conta só fecha com saldo 0.
4. **Tokens bancários** (`bank_token.ex`): UUID ligado a **uma conexão**; vive enquanto a conexão existe + **TTL de 300 s depois que fecha**. Um token por conexão (dois atacantes na mesma conexão compartilham). Token + processo `reveal_password` (cpu=1, dinâmico) revela a senha.
5. **Sessão**: token assinado com `max_age` 7 dias + validação da sessão no banco no `connect` (`account/internal/session.ex`). Senha em bcrypt. Registro público desabilitado por ora (`account/http/controller/account.ex`).
6. **Ações de UI**: o cliente envia `client.action` com nome de ação; o servidor só aceita nomes de uma **whitelist por tipo de cliente** (`client/websocket/requests/action.ex`). Ações enviadas pelo cliente servem **apenas** para progressão de tutorial (não confiáveis p/ economia).
7. **IDs**: o ID do objeto é 128 bits com timestamp + hash de pais (localidade de dados, `lib/id/id.ex`). O cliente nunca deveria receber ids internos (objetivo declarado: identificar servidores por NIP, `server/state/websocket/server.ex` doc). **Transponível**: expor só `ip` e `hostname`, não o uuid do servidor, em views públicas.
8. **Idempotência**: aparece só em `setup/1` do story (`setup_once`) e em `connect_once` (não duplica conexão com mesmo tipo+meta, `network/action/flow/tunnel.ex`). **Não há idempotency-key** para requests. **Não há rate limit.** **Não há detecção de bot/cheat.**
9. **Eventos como fonte da verdade do progresso**: missões avançam por evento do servidor, não por afirmação do cliente. **Transponível**: nosso quadro de missões deve reagir a `domain_events` gerados por RPC, jamais a "cliquei concluir".

**Para RPCs/RLS** (transposição):
```sql
-- RLS: leitura só do que é seu / do servidor onde você tem conexão aberta
create policy logs_read on server_logs for select using (
  server_id in (select target_id from tunnels t join connections c on c.tunnel_id=t.id
                where t.gateway_id in (select id from servers where owner_id=auth.uid()) and c.closed_at is null)
  or server_id in (select id from servers where owner_id=auth.uid()));
-- sem policies de insert/update: escrita só por RPC security definer
-- dinheiro: select ... for update; check (balance >= 0); isolamento serializable com retry em 40001
-- idempotência (nosso, extra ao HE2): tabela request_log(request_id uuid pk) -> insert on conflict do nothing
-- rate limit (nosso): contador por (uid,ação) em janela de tempo dentro da RPC, ou pg_net/edge function
```

---
## 7. BANCO / FINANÇAS E UNIVERSE
**Fórmulas e constantes**
- Conta: número aleatório em `[100000, 999999]`; saldo inicial 0; senha 8 letras; PK `(atm_id, account_number)` (`bank_account.ex:14, 136`).
- **Tempo de transferência**: o objetivo do processo de wire transfer é `cpu = valor` (**linear no valor transferido**), com RAM estática de 50 (pausado) / 100 (rodando) (`bank/process/bank/transfer.ex`, comentado como `TODO: usar tempo, não CPU #364`). Ou seja, `duração = valor / cpu_alocada`.
- `reveal_password`: custo `cpu=1`, dinâmico (praticamente imediato).
- Fluxo de login: `login_password` compara a senha da conta; `login_token` compara token válido (não expirado). Ambos criam uma conexão `bank_login` com `meta {atm_id, account_number}` e atualizam a Database do jogador (`last_login_date`, token, saldo conhecido).
- **Hackear banco**: ataque *overflow* contra uma conexão `bank_login` ou `wire_transfer` rouba um **token** (`software/event/handler/cracker.ex:76-134`). Um overflow em `wire_transfer` também pode alvo-desviar o dinheiro em trânsito (**incerto o detalhe**; o handler está no escopo de outro agente).
- **Dinheiro de vírus**: `Virus.Collected` credita direto na conta via `direct_deposit` (`bank/event/handler/bank/account.ex`); se for minerador (bitcoin), ignora.
- **Logout** do banco fecha só as conexões `bank_login` daquela conta (`bank/action/bank.ex:240-255`).
- **Abertura** `open_account(owner, atm)` e **fechamento** só com saldo zero.
- NPC/Universe: servidores NPC seedados com IP fixo, DNS anycast, e 1 entity por NPC; cada ATM tem `region`. `network.browse` resolve um endereço (DNS) para a "página" do servidor + metadados (senha, lista de arquivos PFTP) (`network/websocket/requests/browse.ex`).

**Sugestão p/ Supabase**: `transfer(from,to,amount)` RPC: `begin; select … for update` nas 2 contas; `balance_from -= amount; insert transfer(state='pending', done_at = now() + duracao(amount))`; job (pg_cron ou edge) conclui os `pending` vencidos creditando no destino; `abort(transfer_id)` estorna. Idempotência no `complete` (transição `pending→done` só 1 vez, `UPDATE … WHERE state='pending' RETURNING`).

---
## 8. PRONTO PARA PORTAR — TOP 10 (pseudo-código meu)
1. **Tunnel + Bounce com senha por salto.** Cada bot que o jogador já invadiu vira salto reutilizável; salto exige posse (senha/`known_hosts`).
   ```js
   rpc.create_bounce(name, hopIps) { for (ip of hopIps) assert(knownHosts.has(me, ip) && knownHosts.get(me,ip).pwd); }
   ```
   Encaixe: botnet de 210 bots = pool de saltos. Bounce em uso não pode ser editado.
2. **Gerador de logs de trilha com marcadores `$first_ip/$last_ip` + um log "bounced from A to B" por salto** (§2.3). Encaixe: este é o dado cru do traceback; Safenet/FBI "lê" logs para subir Heat.
3. **Heat derivado dos logs reais (ideia nossa a partir do HE2).**
   ```js
   // ao final da ação: heat += custo[acao] * (hops.length==0 ? 1.0 : 1/(1+hops.length*0.6)) // sua curva
   // Sentinel 30%: com prob 0.30 por salto limpo, o sentinel "anota" o IP do salto -> abre pista para o policial
   ```
   Justificativa: no HE2 sem bounce o IP do atacante fica no log do alvo.
4. **Log com pilha de revisões (forge = empilhar, recover = desempilhar, create = log falso removível).** Custo `n! * 10000 + versão*150` para editar (cresce fatorialmente com re-edições), `versão*400` para criar falso. Encaixe: minigame de "apagar rastros" como processo no servidor; a mesma pilha dá ao investigador (Safenet) a opção de recover.
5. **Censura parcial de IP** (últimos 5 dígitos → `x`) em serviços públicos/honeypots. Encaixe: item de quitinete/"proxy público" que reduz heat mas não zera.
6. **`connect_once` + unique(gateway,target,bounce)**: reuso de túnel, uma conexão por tipo+meta; fechar a última conexão apaga o túnel e mata processos dependentes. Encaixe: sessões shell na UI; fechar a aba = encerrar processos.
7. **Processos do servidor ligados a conexão/bounce** (`src_connection_id`, `bounce_id`, `target_id`). Evento `process_completed` publicado para gateway **e** target; cliente do alvo vê versão `partial`. Encaixe direto no nosso "processos no servidor".
8. **Fluxo Request em 4 fases + predicados `owns_*`/`password_valid`/`assembled`** como funções SQL; escrita só por RPC security definer. Encaixe: base do anti-cheat.
9. **Dinheiro em trânsito com processo proporcional ao valor + estorno ao abortar + `FOR UPDATE`** (§7). Encaixe: Safenet/FBI podem **congelar/abortar** transferências pendentes (feature nova e barata).
10. **Missões como máquina de estados orientada a eventos** (steps, emails com delay, replies travadas, `setup_once` idempotente, restart com checkpoint, listeners persistidos) (§4). Encaixe: quadro de missões; steps reagem a `domain_events` gerados pelo servidor.

**Como encaixam no que já existe**: especialidades e árvore de habilidades → multiplicam `versão` do software (edit/create/recover/bruteforce); quitinete → hardware (cpu/ram/hdd/nic) limita processos paralelos; botnet → pool de saltos + vítimas de vírus; shell com sidebar → lista de conexões/túneis abertos + logs do servidor atual; Sentinel 30% → ponto de decisão em §8.3.

---
## 9. ARMADILHAS e DIFERENÇAS HE1 → HE2
- **AGPL**: não copiar texto de código nem DSL. Mensagens de log como "localhost logged into X" são curtas; recrie com seu texto. Constantes numéricas são fatos, mas redija suas próprias fórmulas/nomes.
- **HE2 é incompleto**: forge/recover sem processo ativo exposto; story só com tutorial; sem rate limit; muitos `TODO`. Não assuma que "o HE2 resolve X"; confira o que foi realmente construído.
- **Não existe traceback/heat no HE2** (é só forense). Se o design pressupõe "tempo de rastreio contado em segundos", isso é invenção nossa, não adaptação.
- **HE1 → HE2**: HE1 era PHP síncrono, servidor ligado a conta, logs editáveis/deletáveis livremente, "hidden/seeking" e rastro por tempo; HE2 é event-driven, **processos num scheduler (TOP)**, rede/túnel/bounce **modelados como grafo**, logs como **pilha de revisões**, tudo via websocket com canais por servidor. **Apagar log** (HE1, simples) vs **forjar/recuperar** (HE2, custo crescente): decidam qual comportamento querem; as duas coisas mudam o equilíbrio do Heat.
- **Estado em memória do HE2** (ETS de canais, contadores de sessão, GenServers do TOP/cache) **não existe no Supabase**. Troque por tabelas/triggers e Realtime. A "sessão remota com contador" vira linha em `connections`.
- **Cache do HE2** (ip→server com expiração e fila de purge) é para escala; no Postgres, índice em `servers(ip)` basta no início.
- **IDs**: não copie o esquema de bits; use uuid/bigint + índices. Não exponha uuid do servidor ao cliente.
- **Concorrência no Postgres**: SERIALIZABLE exige retry em `40001`; prefira `FOR UPDATE` curto dentro da RPC.
- **Realtime + RLS**: Postgres Changes aplica RLS apenas em `SELECT`; payload "diferente por jogador" precisa de view/canal privado, não de filtro no cliente.
- **Confiança no cliente**: `client.action` do HE2 só serve para tutorial. Nunca use ação reportada pelo cliente para recompensa ou economia (idem para minigames anti-cheat: valide no servidor com seed/tempo/tentativas).
- **Incertezas** que eu não verifiquei: (a) formato real de IP de jogo (IPv4 vs IPv6); (b) fórmula exata de bruteforce/overflow/firewall (está em `lib/software`, fora do meu pedaço); (c) detalhes do TOP (alocação de recursos, `lib/process`); (d) efeito exato do overflow em wire_transfer.

Se quiser, posso aprofundar em: (1) schema SQL completo + RPCs `connect/forge/recover/transfer`; (2) tabela de eventos de domínio proposta p/ Supabase; (3) proposta de curva de Heat baseada em logs.