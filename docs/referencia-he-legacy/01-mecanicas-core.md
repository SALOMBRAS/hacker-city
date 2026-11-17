# Mecânicas core: processos, hardware, software, invasão, logs e XP

> Análise do **Hacker Experience Legacy** (MIT, © Renato Massaro) para servir de **referência de regras**.
> Nada daqui é cópia de código: as fórmulas devem ser **reescritas** em JS/PostgreSQL. Ver [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md).
> Citações `arquivo:linha` referem-se a <https://github.com/HackerExperience/legacy>.

# HE Legacy → regras p/ Hacker City Web (processos, software, hardware, invasão, logs, XP)

Abreviações (base `/home/littlecoffee/Documentos/DEV/referencias/he-legacy/`): **P**=classes/Process.class.php · **C**=classes/PC.class.php (HardwareVPC, SoftwareVPC, LogVPC, Virus) · **I**=classes/Internet.class.php · **S**=classes/Session.class.php · **R**=classes/Ranking.class.php · **L**=classes/List.class.php · **Pl**=classes/Player.class.php · **SQL**=game.sql. Cito `arquivo:linha`.
Convenções: versão é INTEIRO ×10 (10 = "1.0", exibido `v/10`, C:5363). Tamanho/RAM/HDD em MB, CPU em MHz, NET em Mbit/s. Tempos em segundos.
Validação: as fórmulas de pesquisa batem com o cracker inicial (v10 → size 28, RAM 9; Storyline.class.php:1062), então estão corretas.

---
## 1. MODELO DE DADOS ESSENCIAL → Postgres

| Tabela HE | Colunas que importam | Sugestão Postgres |
|---|---|---|
| users (SQL:2608) | id, login, gamePass(8 chars, texto puro), gameIP(bigint), homeIP | `users` + `hosts(id, owner_user_id NULL, npc_id NULL, ip inet UNIQUE, root_pass)`. Unifique VPC/NPC em `hosts` (HE usa `isNPC` em toda tabela). |
| users_stats (SQL:2901) | exp, hackCount, ipResets, lastIpReset, pwdResets, lastPwdReset, moneyHardware, moneyResearch | `player_stats` |
| hardware (SQL:790) | serverID, userID, name, cpu=500, hdd=100, ram=256, net=1, isNPC | `machines(host_id, name, cpu, hdd, ram)`; **net é por conta** (updateHardwareNet atualiza todas as linhas do user, C:2175-2196) → `hosts.net_mbit` |
| hardware_external (SQL:820) | serverID,userID,name,size(MB) | `external_drives` |
| software (SQL:2350) | id,userID,softName,softVersion,softSize,softRam,softType,softHidden,softHiddenWith,isNPC,originalFrom,licensedTo,isFolder | `software(id, host_id, name, type, version, size_mb, ram_mb, hidden, hidden_with, original_from, licensed_to, folder_id)` |
| software_running (SQL:2501) | softID,userID,ramUsage,isNPC | = "instalado". `software.installed bool` ou tabela `running_software(software_id, ram)` |
| software_external / software_texts / software_research | cópia p/ XHD; texto de .txt; histórico de pesquisas (userID,softwareType,newVersion) | idem |
| processes (SQL:1950) | pid,pCreatorID,pVictimID,pAction,pSoftID,pInfo,pInfoStr,pTimeStart,pTimeEnd,pTimeIdeal,cpuUsage,netUsage(%),pLocal(1=local,0=remoto),pNPC,isPaused | `processes(id, creator_id, victim_host_id, action text, software_id, info, info_str, started_at, ends_at, ideal_seconds, cpu_share, net_share, is_local, paused)` |
| processes_paused | pid,timeLeft,timePaused | opcional (pause está desabilitado p/ não-admin, P:3843) |
| log (SQL:1433) | userID,isNPC,**text** (UM blob por máquina, linhas novas concatenadas NO TOPO) | **trocar por `log_entries(id, host_id, at, text)`**; "editar log" vira reescrever/apagar linhas |
| log_edit (SQL:1457) | id,vicID,isNPC,editorID,logText | `pending_log_edits` (texto novo guardado até o processo terminar) |
| lists (SQL:1273) | userID,ip,user,pass,hackedTime,virusID | `hacked_db(owner_id, target_host_id, login, pass_state, hacked_at, virus_id)`. `pass` guarda valores mágicos: `'unknown'` (senha trocada), `'exploited'`, `'download'`, ou a senha real → use enum `credential_kind` |
| lists_specs / lists_specs_analyzed / lists_notifications | HDD/NET vistos no login; min/max CPU/RAM do analyzer; avisos tipo 1 IP mudou, 2 senha mudou, 3 vírus removido | `hacked_db_specs`, `notifications` |
| virus (SQL:2966) / virus_ddos | installedIp,installedBy,virusID,virusVersion,virusType(1 spam,2 warez,3 ddos,4 miner),lastCollect,active | `viruses` |
| internet_connections (SQL:1177) | userID(PK),ip,expires | **1 conexão ativa por jogador**; `connections(user_id PK, host_id)` |
| npc (npcType,npcIP,npcPass) | tipos em info/npcType.txt (1 banco,2 whois,5 ISP,8 download center,10 clan,50 safenet,52 NSA…) | `hosts` com `kind` |

Ordem de grandeza: `getHardwareInfo` SOMA cpu/hdd/ram de todas as máquinas do dono (C:29-88). RAM usada = soma de `software_running.ramUsage` (C:540). HDD usado = soma de `softSize` de TUDO em `software` (inclui escondidos/não instalados) (C:586). Instalar não ocupa HDD extra, só RAM.

### Tipos de software (info/softType.txt + C:5375)
1 cracker .crc · 2 hasher .hash · 3 portscan .scan · 4 firewall .fwl · 5 hider .hdr · 6 seeker .skr · 7 antivírus .av · 8 spam .vspam · 9 warez .vwarez · 10 ddos .vddos · 11 collector .vcol · 12 ddos breaker .vbrk · 13 FTP exploit .exp · 14 SSH exploit .exp · 15 nmap · 16 analyzer .ana · 17 torrent · 18 webserver.exe · 19 wallet.dat · 20 miner .vminer · 26 riddle · 29 doom · 30 txt · 31 pasta. Vírus instalados mudam de tipo: 8→99, 9→98, 10→97, 20→96 (P:2786-2806). ≥90 não pode ser baixado/enviado (P:1873, 2001).
isVirus: 8,9,10,20,29 (C:3158). isExecutable (C:3211): NÃO instala 30,31,17 nem os já-instalados (96-99,90); collector (11) só instala local; doom exige licença.

---
## 2. PROCESSOS

### 2.1 Mecânica geral
- **Criação** `newProcess` (P:692-751): recusa se já existe processo "idêntico" (mesmo creator,victim,action,soft,local[,pInfo]; para RESET_IP/RESET_PWD/E_LOG ignora pInfo) (P:1466-1507) → `processDuration` (valida requisitos, devolve tempo ideal ou erro) → calcula parcela de recurso → grava `pTimeIdeal=tempo ideal`, `pTimeEnd=now+ideal/uso`.
- **Recurso**: ação 1 e 2 (download/upload) usam **NET**; todas as outras (menos a 6 deprecated) usam **CPU** (`resourceableInfo`, P:1015-1041).
- **Divisão de recurso** (P:841-889): para o mesmo criador e mesma coluna (cpuUsage ou netUsage), `uso = 100/N` com N processos ativos (não pausados). Novo processo: tempo real = `ideal*100/uso`. Os já existentes são reescritos com `pTimeEnd = now + ideal*100/novoUso - decorrido` (P:868-871). **Atenção**: ele não conserva o progresso já feito (usa o tempo decorrido, não a fração). Ao terminar/cancelar, redistribui (P:891-1010, bem confuso).
  → Para portar, use modelo por **trabalho restante**: `work_total = ideal_seconds`; `rate = 1/N`; recalcula `ends_at` a cada mudança de N (e de hardware).
- **Comprou hardware**: `updateProcessTime` (P:754-839) recalcula `pTimeIdeal` e `pTimeEnd` dos processos ativos (`novo = ideal*100/uso - decorrido`). Tem bugs (usa `$data['0']['psoftid']` sempre do índice 0, P:793).
- **Conclusão é disparada pelo cliente**: ajax `completeProcess` (ajax.php:1437-1475) checa `pCreatorID==$_SESSION['id']` e `pTimeLeft<=0` e chama `completeProcess` (P:1784). `getProcessInfo` satura `pTimeLeft` em 0 (P:1395). Se `pTimeLeft != 0`: `die("Process not yet done")` (P:3813).
- **Pré-condição de conclusão remota** (P:1815-1849): para ação remota (`pLocal==0`) o jogador precisa estar logado no IP da vítima; exceções: 11 (crack), 16 (exploit), 27 (ddos); 12 e 15 sempre válidos. Senão `error` + redirect (processo continua pronto).
- **Se o software sumiu antes de concluir** (e ação ≠ upload/XHD): processo é apagado (P:1851-1854).
- **Erros em `handleError($x,$redirect)` com redirect = exit** → o processo NÃO é deletado e fica pronto p/ retentar/cancelar; sem redirect segue e deleta (P:3810, System.class.php:329-334).
- **Cancelar** `processes.php:39-50` → `deleteProcess($pid,false)` (P:3818-3839): apaga a linha; se `pTimeLeft>0` redistribui share aos demais; se era E_LOG apaga o log temporário. **Nada é debitado no início** (dinheiro de research/reset só sai na conclusão), logo cancelar = sem custo, sem log, sem XP.
- **Pausar** existe (P:3841-3927) mas desligado para não-admin.
- `pTimeIdeal`/min-max de `config.php:41-62 $processTimeConfig` **não é usado** em lugar nenhum (grep).

### 2.2 Tabela de processos (id numérico = `config.php:9-39`)
Notação: `cpu`=CPU total do **atacante** (`$_SESSION['id']`, soma das máquinas); `size`=softSize MB; `local`=processo na própria máquina → ×0.5.
Tempo ideal (P:3942-4219 `calculateDuration`, usado em reajustes), valor no `newProcess` vem de `processDuration` (P:1074-1361) e é igual salvo onde indicado.

| id | ação | requisitos (no `processDuration`) | tempo ideal | ao concluir | ao cancelar |
|---|---|---|---|---|---|
| 1 | DOWNLOAD | soft existe no alvo, HDD livre ≥ size (P:1101-1109); não ter igual (nome+versão+tipo, não escondido) (I:1210-1214); tipo≠19,26,31,≥90; permissão ftp | `size / min(netAtk/8 , netAlvo/16)` (P:3950-3965). Sem clamp. Usa NET | cria cópia na sua máquina (`originalFrom=id original`), log nos dois lados, XP ACTIONS('net',size) (P:1868-1979) | nada |
| 2 | UPLOAD | soft não escondido, HDD do alvo livre (P:1113-1118), permissão ftp | `size / min(netAtk/16 , netAlvo/8)` (P:3966-3981) | cria no alvo, logs, XP (P:1994-2152) | nada |
| 3 | DELETE | soft não escondido (P:1220) | `max(10, (size - cpu/50) × (local?0.5:1))` (P:3982-3999) | remove soft (+ remove de running; webserver desliga). Não apaga vírus instalado/doom29/wallet. Remoto: log nos dois lados + risco Safenet (ver §5) | nada |
| 4 HIDE | precisa de hider **instalado** (running) e não escondido; soft não instalado (exceto doom); soft não escondido; se esconder seu melhor hider precisa de 2º hider (P:1126-1172) | `max(4, round(size×1.5 - cpu/9)) × (local?0.5:1)` (P:4000-4031) | `softHidden=1, softHiddenWith=<versão do melhor hider>` (local usa o 2º melhor se está escondendo o próprio melhor) (P:2343-2404) | nada |
| 5 SEEK | seeker instalado e não escondido; soft precisa estar escondido; **seekerVersão ≥ softHiddenWith** (P:1174-1204; comentário diz ">" mas é ">=") | igual hide + `max(0,(hiddenWith-10)×2)` somado depois do ×0.5 | `softHidden=0, hiddenWith=0` (P:2405-2455) | nada |
| 7 AV | RAM livre > ram do AV (P:1206-1214) | **200 fixo** (P:4032) | remove todos os vírus (`softType>95`) com `versão ≤ versão do AV` na máquina alvo/local; avisa donos; XP 10/vírus local, 15 remoto (P:2459-2543) | nada |
| 8 E_LOG (editar log) | 1 só E_LOG por (creator,vítima,local) (logEdit.php:98) | `clamp(round(max(len(logAtual),len(logNovo))/20 - cpu/6) × (local?0.5:1), 4, 60)` (P:4035-4071) | `UPDATE log SET text=<novo>` (pode ser vazio = apagar tudo). **Não grava log da edição** (P:2544-2575). XP 1 local / 3 remoto | apaga o texto temporário (P:3824) |
| 10 FORMAT | — | 40 | **vazio, não implementado** (P:2576) | — |
| 11 HACK bf (crack servidor) | tem cracker instalado; não estar na lista com senha conhecida (exceto 'unknown'/'exploited'/download-center); cert 2 | tabela §5.1 (**independe de CPU**; usa `cracker` do atacante vs `hasher` da vítima, ambos instalados) (P:4072-4132) | se `crackerV ≥ hasherV` (rechecado): grava na hacked DB `user=root,pass=senha real`; XP HACK (P:2578-2679). Se não: msg "cracker isn't good enough" e processo some | nada |
| 12 BANK_HACK | idem p/ conta de banco | mesma tabela (hasher do banco NPC) | revela senha da conta + lista (P:2680-2729). XP 50+hasherV | nada |
| 13 INSTALL | não instalado; executável; não escondido; RAM livre ≥ ram do soft; vírus só em máquina remota (P:1227-1249) | `max(4, round(size×2 - cpu/9)) × (local?0.5:1)` (P:4134-4156) | cria linha em software_running (RAM). **Vírus**: vira vírus ativo no IP alvo (§4.4), 1 vírus por tipo por IP/instalador (P:2730-2892) | nada |
| 14 UNINSTALL | instalado, executável, não escondido, não vírus | igual install ×0.85 (min 4 aplicado depois) | remove de running; webserver → shutdown (P:2893-2975) | nada |
| 15 PORT_SCAN | scan instalado; cert 3 | `newProcess` usa **4** (P:1319); `calculateDuration` diz 30 | seta sessão `PORT_SCAN=ip` (P:2976-2998) → UI mostra FTP/SSH [VULNERABLE]/[FAILED] (I:326-377) | nada |
| 16 HACK_XP (exploit) | scan feito + ≥1 exploit instalado + exploit ≥ firewall do alvo (§5.2) | `newProcess` usa **22** (P:1325); calc diz 60 | cria entrada `exploited` com user ftp/ssh/root (P:2999-3143). XP | nada |
| 17 RESEARCH | soft licenciado a você, não escondido, dinheiro ≥ preço, conta bancária sua (P:3145-3226) | ver §4.2 (280…1800 s) | cria **nova linha** com versão+1 (tamanho/RAM recalculados), opcional apaga a antiga (checa HDD); debita só aqui; XP | nada (nada cobrado) |
| 18/19/20 | UPLOAD/DOWNLOAD/DELETE em HD externo | — | **100 fixo** | copia/apaga p/ `software_external` (XHD ≥ uso+size); XP (P:3228-3348) | nada |
| 22 NMAP | nmap instalado na máquina; | 30 | gera arquivo `NMAP_<host>.txt` com IPs conectados cujo firewall ≤ versão do nmap; XP 25+25·n (P:3355-3464) | nada |
| 23 ANALYZE | analyzer v10/20/30 (precisão 50/80/100%) | 60 | grava min/max CPU/RAM do alvo na hacked DB: `min = cpu - cpu(1-a) + cpu(1-a)/rand(5,50)` (P:3465-3520). XP 15 | nada |
| 24 INSTALL_DOOM | HDD livre ≥ 500 | 60 | (doom — fora de escopo) | nada |
| 25 RESET_IP | 1º reset grátis; depois só após cooldown ou pagando (§3.4) | **600** | novo IP aleatório (1-255 ×4, único); apaga hacked-DBs que tinham o IP antigo (+notificação tipo 1), desativa vírus, derruba conexões e **apaga todos os processos cuja vítima era você** (P:3534-3679). XP 50 | nada (dinheiro só sai na conclusão) |
| 26 RESET_PWD | idem | **60** | senha nova 8 chars alfanum; hacked-DB vira `'unknown'` (exceto 'exploited'), vírus desativados, conexões caem, notificação tipo 2 (P:3680-3778). XP 15 | nada |
| 27 DDOS | — | 300 (e P:971 força 300 ao redistribuir) | `Virus::DDoS` (C:7220) fora de escopo | — |
| 28 EDIT_WEBSERVER | — | 30 | — | — |

Observação: **o tempo de hack/crack NÃO usa CPU/NET** (só versão). Tempo de hide/seek/install/delete/log usam **CPU do atacante** (mesmo se atuando em NPC) → upgrade de CPU é o gargalo do jogo.

---
## 3. HARDWARE

### 3.1 Como o poder entra
- **CPU** (soma das máquinas): reduz tempo de delete (`cpu/50`), hide/seek/install/uninstall (`cpu/9`), edit-log (`cpu/6`); e é a base de renda de spam/miner. Não afeta crack/port-scan/analyze/AV/research.
- **NET** (conta): download `NET/8` MB/s do receptor vs `NET/16` do emissor, upload inverso; `getInternetRates` (C:400-423).
- **RAM**: capacidade p/ instalar (soma `softRam` instalados ≤ RAM). Reduzir RAM (overclock check) remove os maiores programas (C:2285-2313).
- **HDD**: capacidade total de arquivos; ao reduzir HDD apaga os maiores softwares até caber (C:2200-2283).
- **XHD**: espaço extra (hardware_external.size), limitado por `software_external`.
- `getHardwareInfo` retorna `NET` via `SELECT ... net` com SUM (net "qualquer linha") → ok porque todas iguais.

### 3.2 Catálogo e preços (hardwareItens.php — autoritativo; info/rates.txt está desatualizado)
Upgrades **só para valor maior** (`DOWNGRADE` error, C:2472-2543), custo = PRICE do item escolhido (preço absoluto, não diferença), qualquer item da lista pode ser comprado pulando níveis. Aplica à máquina selecionada (net: toda a conta).
- **CPU** (MHz→$): 500→99(inicial), 1000→99, 1500→150, 2000→300, 2500→600, 3000→1500, 3500→2000, 4000→5000
- **RAM** (MB→$): 256→100(inicial), 512→99, 1024→500, 2048→2500
- **HDD** (MB→$): 100(inicial), 500→99, 1000→300, 2000→1000, 5000→3000, 10000→8000
- **NET** (Mbit→$): 1(inicial), 2→50, 4→99, 10→250, 25→1000, 50→2500, 100→10000, 250→25000, 500→50000, 1000→100000
- **XHD** (MB→$): 200→50, 500→99, 1000→500
- Nota: badges (P:956-968) esperam HDD máx 100000 e `4 PCs`; a tabela só vai a 10000 → inconsistência, usem a sua.
### 3.3 PC extra / XHD extra
- `getPCPrice` (C:1994-2016): `n=PCs que tenho`: n=1→1.000; 2→10.000; 3→50.000; 4→100.000; 5→500.000. PC novo nasce 500 MHz / 100 MB / 256 MB (C:2340-2345). Não vi limite de PCs no código (UI).
- `getXHDPrice` (C:2019-2046): possuo 0→100; 1→1.000; 2→10.000; 3→50.000; 4→150.000; 5→300.000; ≥6→500.000.
- Efeito em XP: `BUY` pc: 2º=100, 3º=500, n-ésimo=500·n; xhd=100·n; hardware=5+round(preço/10) (S:478-493). `updateMoneyStats` acumula `moneyHardware`.
### 3.4 Preços de reset
- **Reset de IP** (Pl:1436-1485): 1º grátis (`resets==0`). Depois cooldown por nº de resets: 1→3h, 2→6h, 3→12h, 4→24h, 5→48h, 6→96h, ≥7→168h. Se cooldown já passou: grátis. Senão paga `min(100000, int(100 + 500·r + r^3.8/10))` (r=ipResets): 1→600, 2→1101, 3→1606, 4→2119, 5→2645… 
- **Reset de senha** (Pl:1537-1582): mesmos cooldowns; preço `int(50 + 10·r + r^3.2/10)`: 1→60, 2→70, 3→83, 4→98, 5→117, 6→140, 7→170.
- Cobrança: debita **na conclusão** de uma conta do jogador (P:3545-3548, 3702-3705). `info/rates.txt` cita outra fórmula (500+100n…): **ignorar**.

---
## 4. SOFTWARE

### 4.1 Versão, tamanho, RAM de cada tipo (C:5851-5931). `i`=versão×10, `m`=multiplicador do tipo
Multiplicadores `m`: cracker 25 · hasher 23 · exploit ftp/ssh 19 · firewall 21 · hider/seeker 15 · AV/nmap 16 · spam/warez 12 · ddos 13 · collector/breaker 14. (Tipos 3 scan, 16, 17, 18, 19 e ≥30 **não são pesquisáveis**, C:6139-6156.)
```
price(i)= i>=100 ? ceil(i*(m*((i-90)/100)-10)+3000-(25-m)*80) : ceil((i²-9i)/100*m)
size(i) = i>=100 ? ceil(i*(m*((i-100)/100)-9.5)+3000-(25-m)*80) : ceil(((i²-9i)/110+1)*m)
ram(i)  = i>=100 ? ceil(i*(m*((i-110)/100)-15)+3000-(25-m)*80)
                 : ceil( ( i>=50 ? ((0.9i)²-9i)/145+0.3 : ((0.9i)²-9i)/140+0.4 ) * m )
```
(`i` é a versão ATUAL na chamada de preço; size/ram são da NOVA versão = `softVersion+1`? Não: C:6172-6173 usa `softInfo->softversion` (atual) para calcular size/RAM e grava com `version+1` → o novo soft tem size/RAM do nível anterior. Detalhe do original.)
Exemplos cracker (m=25): v10→preço 3, size 28, RAM 9 · v20→56/75/36 · v30→158/169/92 · v50→513/491/280 · v100→2250/2050/1250 · v150→3750/3450/2250 · v200→6501/6100/4500. Hider (m=15): v10→2/17/6 · v50→308/295/168.

### 4.2 Pesquisa (research)
- Requisitos: soft não escondido, `licensedTo == você`, tipo pesquisável, ≠doom, dinheiro ≥ preço, HDD livre ≥ size novo (se marcar "apagar antiga", soma o size dela) (P:3145-3226, C:6158-6213, C:2690-2766).
- **Tempo real** (P:4161-4191 — o `research_calculateDuration` de C:5933 é só UI e erra a faixa 30-49):
  `v<30: 280+20·(v-10)` · `30≤v<50: 660+10·(v-29)` · `<75: 900` · `<100: 1200` · `<150: 1500` · `≥150: 1800` (v10→280, v20→480, v30→670, v49→860).
- Custo: `price(i)` acima, debitado na conclusão; `updateMoneyStats('2')`.
- XP: `35 + round(novaVersão)`, **dobra** se tipo ≤4 (S:472-477).
- Produz software com `originalFrom=você, licensedTo=você`, registra em `software_research` (ranking de pesquisa por soma de versões, R:186-211).
- **Licença** (`license_buy`/`license_studyPrice` C:4284-4338): para pesquisar software baixado de NPC é preciso comprar a licença: `round(v · cte · mult · 2 / 10)`, `mult=1` se `licensedTo<0` senão 3; `cte`: v<20→10, <50→40, <100→60, <200→80, <300→110, else 150; doom = 100000.
- Nomes de NPC (info/softType.txt): v<15 Basic, <20 Generic, <30 Decent, <40 Intermediate, <50 Competent, <65 Advanced, <80 Big, <100 Amazing, <120 Super, <150 Ultra, <175 Epic, resto Ultimate.

### 4.3 Qual versão conta ("melhor software")
`getBestSoftware(tipo, dono, pcType, installed=1)` (C:5431-5471): maior `softVersion` entre os do tipo **instalados (software_running) E não escondidos**. Sem nenhum → `exists=0`, versão 0. Isso vale p/ cracker, hasher, firewall, scan, exploit, hider, seeker etc. e **para o alvo** também (firewall/hasher só valem se instalados e visíveis). Por isso: esconder e desinstalar muda a defesa.

### 4.4 Vírus (resumo; detalhe de collect em L:581-945)
- Instalar (13) exige logado remoto; `alreadyInstalled(ip,tipo)` por (instalador, ip, tipo) (C:6841); se já tinha outro vírus do instalador nesse IP desativa 1 (P:2822-2830). Entra em `virus` com `lastCollect=now`; marca `lists.virusID`. DDoS vira linha em `virus_ddos` com CPU do alvo (P:2845-2854).
- **Coleta** (`Lists::collect`) — precisa de collector (qualquer, não precisa estar instalado, `$installed=0`), conta bancária, vírus ativo, `duration ≥ 600 s`:
  ```
  rate = spam 0.00000694 | warez {v10:0.000555556,20:0.000694444,30:0.000833333,40:0.000972222,50:0.001111111}(exige torrent) | miner 0.00010417/3600(exige wallet)
  rate /= 2
  hw = CPU da vítima (spam, miner) | NET da vítima (warez)
  pct = 1 + 2*virusVersion/1000
  bonus = rand(1..20)==1 ? 2 : 1
  money = ceil( duration*rate*hw*pct*bonus / nVirusesMesmoTipoNoIP )   // miner sem ceil
  total = ceil(sum * (1 + collectorVersion/1000))
  ```
  (só paga se `money>1` ou miner; atualiza `lastCollect`). XP: `round(total*0.1)`; BTC `btc*600`.
- AV remove vírus de versão ≤ AV; avisa dono (notificação 3).

---
## 5. INVASÃO

### 5.1 Brute force / login root
- Pré: cert 2 ("Hacking 101") p/ acessar internet/login/bf (internet.php:12-17, I:2142); newbie protection: alvo VPC com `exp<100` e sem rodada anterior é **imune** (Pl:1664-1684, I:284-288); não pode hackear a si mesmo (I:163).
- Condição: `crackerAtkVer ≥ hasherVítimaVer` (ambos instalados e visíveis; hasher ausente = 0). Se não, "Your cracker isn't good enough" (I:2211-2249, P:2636-2671).
- Tempo (P:4072-4132; `crc`=cracker atacante, `hash`=hasher da vítima, `diff=crc-hash`):
  ```
  if (hash==0) return 4
  tier(h)=  h<30 ? A : h<50 ? B : h<75 ? C : D
  diff==0 → tier(30,40,50,60) ; diff==1 → tier(20,30,40,50) ; diff>=20 → tier(4,10,15,30)
  senão   → max(4, round(diff + hash/diff))      // ex: crc12/hash10→7s, 25/20→9s, 60/50→15s
  ```
  (Descontínuo: diff 1 é mais lento que diff 2. Mantenha ou suavize.)
- Conclui: `lists` ganha `user=root, pass=<senha real da vítima>` (revela se estava 'unknown'/'exploited'); incrementa `hackCount` só ao inserir. XP `50 + round(hasherVítima + crackerDaVítima[qualquer, não-instalado conta])` (P:2657-2663 + S:458).
- **Login**: `verifyLogin` (I:1857-1908): root+senha igual → login (exige cracker ≥ hasher de novo, I:657-666); `doLogin` cria `internet_connections` (1 por jogador, substitui) (I:3127-3145). Grava logs: vítima `"[IP_atacante] logged in as root"`, atacante `"localhost logged in to [IP_vítima] as root"` (I:683-687; C:6383-6391). XP REMOTE_LOGIN: `max(5, 15 - (crc-hash))` (S:432-456).
- **Conexão é revalidada a cada requisição** (`refreshConnection`, I:1946-2130): se vítima trocou IP/senha (a conexão é apagada, P:3610/3748) → "disconnected"; se você perdeu/desinstalou cracker ou o hasher da vítima subiu → desconecta; exploit idem com firewall; se só um exploit ainda vale, **rebaixa** a permissão (root→ssh ou ftp).

### 5.2 Exploit (port scan + exploit)
1. Port-scan (4 s) → UI compara `ftpExp.v ≥ fw.v` e `sshExp.v ≥ fw.v` (fw ausente=0) (I:326-377).
2. HACK_XP (22 s) → conclui se `exp.v ≥ fwVítima.v` para ftp e/ou ssh (P:3062-3081). Permissão: ftp ok → `'ldu'` user `ftp`; ssh ok → `'ls'` user `ssh`; ambos → user `root` sem senha (grava `pass='exploited'`, P:3084-3095). Se já existia user diferente na lista, substitui (P:3097-3103); se já é root, erro `ALREADY_LISTED`.
3. Permissões efetivas (I:1910-1944): ftp(`r`) = download/upload; ssh(`a`) = hide/seek/delete/install/uninstall/move; root-com-senha (`''`) e root-exploit (`w`) = tudo. **Ver/editar log não checa permissão** (I:1170-1175; logEdit.php), só estar logado.
4. NSA (npcType 52) não é explorável nem crackeável (I:299, 306).
5. Download Center (type 8): login `download/download` apenas leitura (I:1870-1883); NPC id 59 sem logs e sem delete (C:6630, P:2217).
6. Banco: hack de conta específica (BANK_HACK) usa hasher do banco; cert 3 (I:434-486).

### 5.3 Firewall vs cracker
Firewall (tipo 4) **só bloqueia exploit** (compara com exploit); hasher (tipo 2) **só bloqueia brute force** (compara com cracker). Nmap só lista conexões de quem tem `firewall ≤ nmap`.

### 5.4 O que fica gravado (LogVPC)
- Formato linha (C:6726-6761): `"YYYY-MM-DD HH:MM - <texto>\n"` prependida. Todo log remoto grava em **ambos**: vítima vê `[IP do atacante]`, atacante vê `localhost ... at [IP]`. Não há proxy/bounce.
- Textos (C:6379-6598): LOGIN, DOWNLOAD, UPLOAD, DELETE, HIDE, SEEK, AV, INSTALL (virus: "installed virus"), UNINSTALL, RESEARCH(custo/conta), ANALYZE, DOOM, IP_RESET/PWD_RESET (`for $x` ou `for free`), TXT/FOLDER, BUY_*, BTCLOGIN. DDoS grava em outra função.
- Ações **sem log**: port-scan, hack bf/xp (a vítima NÃO vê tentativa; só vê o LOGIN depois), logout, edit-log, research sem rastro na vítima.
- Download: o log do *atacante* usa o próprio IP (P:1972, bug de cópia).
- **Edição/limpeza**: processo 8 (§2.2) substitui o blob inteiro pelo texto novo (purificado por HTMLPurifier). Apagar = texto vazio. Local (seu próprio log) é metade do tempo. A edição **não deixa rastro**.
- Tracking (Safenet/FBI): **delete remoto** de software de VPC/NPC (P:2209-2271): `P(%)=floor(5 + softVersion/10)` (`odds=(5+v/10)*10` vs `rand(1..100)*10`; v10→6%, v100→15%, v200→25%); 1ª vez cria registro Safenet (motivo 4, 1000 s, e-mail), se já estava no Safenet → `fbi_add` + safenet_update. Também: DDoS (reason 1), transferência bancária (3, ≥1h), doom (2, 7 dias) (Storyline.class.php:90-420). Regras de proteção do delete: não apaga soft básico (v10 tipos ≤2 ou 4) de jogador real (P:2212); se vítima≠NPC e `victimCracker<=20 ? vic+10<atk : vic*2<atk` bloqueia ("muito mais forte", P:2236-2258).
- IP reset também apaga o histórico de ataques (processos, hacked DB alheias, conexões) → principal defesa.

---
## 6. XP / NÍVEL / RANKING
- XP único em `users_stats.exp` via `Session::exp_add` (S:404-545). Tabela:
  - LOGIN 1 · EDIT_LOG 1 local/3 remoto · REMOTE_LOGIN: download 1, bank 25, clan 3, senão `max(5, 15-(att-def))` (diff==0→15).
  - HACK: `50 + round(a+b)` (bf: hasherVítima+crackerVítima; xp: fwVítima+crackerVítima; bank: hasherVítima)
  - RESEARCH `35 + round(novaVers)`, ×2 no bônus se tipo≤4 · CERT 100 · MISSION `50+round(reward*0.05)` · TRANSFER `200+round(valor/15)` · RESET ip 50/pwd 15
  - BUY: pc 2º=100, 3º=500, n≥4=500n · xhd 100n · hardware `5+round(preço/10)` · license `25+round(v)`
  - ACTIONS (download/upload/delete/hide/seek/install…): `bonus=round(x/10)` (x=size; NET×2; local usa size/2), clamp **[1,15]**
  - AV 10/vírus local, 15 remoto · NMAP `25+25n` · ANALYZE 15 · DOOM 10000 · DDOS `250+round(power*0.01)` · COLLECT btc `n*600`, cash `round(n*0.1)` · PUZZLE 25
- **Nível** (R:160-184): exp<100→1, <500→2, <1000→3, <2500→4, <5000→5, <10000→6, <20000→7, <40000→8, <80000→9, senão 10.
- **Certificações** (gate): cert1 tutorial, cert2 = hackear servidor/instalar vírus/internet, cert3 = bancos/exploit/portscan, cert4 DDoS, cert5 mitigar (R:546-562, S:380-402).
- **Ranking de jogadores**: `hist_users_current.reputation = users_stats.exp` (cron2/updateCurStats.py), `updateRanking.py` ordena DESC e só ranqueia `reputation > 1000`; rank 1..N (ranking_user.rank, -1 = sem rank). Cron a cada hora/30 min. Ranking de clã/DDoS/software análogo (cron2/updateRanking.py). Ranking de pesquisa: soma de `newVersion` por usuário (R:186-211).
- Newbie: `exp<100` protege contra invasão (§5.1).

---
## 7. PRONTO PARA PORTAR (top 10, ordem de valor)

**1. Motor de processos por trabalho (corrige o original)**
```js
// work = ideal_seconds; rate = share (1/N de cada recurso)
function addProcess(uid, kind, ideal) {            // kind->resource: DL/UL='net', resto='cpu'
  const res = ['download','upload'].includes(kind) ? 'net' : 'cpu';
  rebalance(uid, res, +1);                         // N+1
  return insert({uid, kind, work_total: ideal, work_done: 0, res, last_tick: now()});
}
const endsAt = p => p.last_tick + (p.work_total - p.work_done) * activeCount(p.uid, p.res);
function rebalance(uid,res){ for(p of active(uid,res)){ p.work_done += (now()-p.last_tick)/oldN; p.last_tick = now(); } }
// ao cancelar: debitar nada; rebalance(-1). Completar: servidor valida now()>=endsAt (NUNCA o cliente).
```
**2. Tempos por CPU/NET/tamanho** (usar CPU/NET do **criador**; local ×0.5)
```js
const half = local => local ? 0.5 : 1;
dl  = size / Math.min(atkNet/8, vicNet/16);  ul = size / Math.min(atkNet/16, vicNet/8);
del = Math.max(10, (size - cpu/50) * half(local));
hide= Math.max(4, Math.round(size*1.5 - cpu/9) * half(local));
seek= Math.max(4, Math.round(size*1.5 - cpu/9) * half(local) + Math.max(0,(hiddenWith-10)*2));
inst= Math.max(4, Math.round(size*2 - cpu/9) * half(local));  uninst = Math.max(4, inst*0.85);
elog= Math.min(60, Math.max(4, Math.round(Math.max(curLen,newLen)/20 - cpu/6) * half(local)));
fixed = {av:200, portScan:4, exploit:22, nmap:30, analyze:60, resetIp:600, resetPwd:60, xhd:100, format:40, ddos:300, webserver:30};
```
**3. Crack (bruteforce)**
```js
function crackSeconds(crc, hash){
  if(hash===0) return 4; const d=crc-hash, t=(a,b,c,e)=>hash<30?a:hash<50?b:hash<75?c:e;
  if(d===0) return t(30,40,50,60); if(d===1) return t(20,30,40,50); if(d>=20) return t(4,10,15,30);
  return Math.max(4, Math.round(d + hash/d));
}
// requisito: bestInstalledVisible(attacker,'cracker') >= bestInstalledVisible(victim,'hasher'||0)
```
**4. Exploit vs firewall + permissões**
```js
const best = (host,type)=> max(version of software where host=host && type=type && installed && !hidden) ?? 0;
const fw = best(vic,'firewall'); const ftp = best(me,'ftp')>=fw && has(me,'ftp'); const ssh = best(me,'ssh')>=fw && has(me,'ssh');
const user = ftp&&ssh ? 'root' : ftp ? 'ftp' : ssh ? 'ssh' : null;
const perms = {ftp:['logs','download','upload'], ssh:['logs','hide','seek','delete','install','uninstall'], root:'*'};
// revalidar a cada ação/tick: se versões mudarem, rebaixar/derrubar conexão. 1 conexão por jogador.
```
**5. Pesquisa**
```js
const M={crc:25,hash:23,ftp:19,ssh:19,fwl:21,hdr:15,skr:15,av:16,nmap:16,spam:12,warez:12,ddos:13,col:14,brk:14};
price=(i,m)=> i>=100 ? Math.ceil(i*(m*((i-90)/100)-10)+3000-(25-m)*80) : Math.ceil((i*i-9*i)/100*m);
size =(i,m)=> i>=100 ? Math.ceil(i*(m*((i-100)/100)-9.5)+3000-(25-m)*80) : Math.ceil(((i*i-9*i)/110+1)*m);
ram  =(i,m)=> i>=100 ? Math.ceil(i*(m*((i-110)/100)-15)+3000-(25-m)*80) : Math.ceil(((i>=50?((.9*i)**2-9*i)/145+.3:((.9*i)**2-9*i)/140+.4))*m);
dur  = v => v<30?280+20*(v-10): v<50?660+10*(v-29): v<75?900: v<100?1200: v<150?1500:1800;
// cobrar só na conclusão; nova versão = i+1 (recomendo size/ram do novo nível i+1, o original usa o atual)
```
**6. Hardware** (tabelas §3.2/3.3). `buyPcPrice=[1000,10000,50000,100000,500000][ownedPCs-1]`; upgrade só se `newPower>current`, preço absoluto do item; ao reduzir HDD/RAM remover os maiores itens.
**7. Logs** — `appendLog(host,text)` com timestamp; todo ato remoto escreve em ambos os lados com IP do atacante; hack/scan/logout/editar-log não escrevem; "editar log" = processo (fórmula elog) que reescreve o log do host.
**8. XP/Nível/Rank**
```js
levelOf = xp => [100,500,1000,2500,5000,10000,20000,40000,80000].findIndex(t=>xp<t)+1 || 10;  // 1..10
xpHack = 50+Math.round(a+b); xpLogin = Math.max(5, 15-(att-def)); xpAction = clamp(Math.round(size/10)*(net?2:1),1,15);
rank = users.filter(u=>u.xp>1000).sortBy(xp desc)  // refresh a cada 30-60min
newbieProtected = xp<100;
```
**9. Reset IP / senha** — `cooldownH=[0,3,6,12,24,48,96,168][min(r,7)]` (r=resets feitos); grátis se r==0 ou `now-last>=cooldown`; senão `ip=min(100000,100+500r+r^3.8/10)`, `pwd=50+10r+r^3.2/10`. Efeitos: apagar hacked-DB alheias (+notificação), derrubar conexões/vírus/processos que tinham você como vítima.
**10. Renda passiva por vírus** (fórmula de §4.4) e **risco de rastreio no delete remoto**: `P=floor(5+version/10)%`, 1ª vez → alerta Safenet, 2ª → FBI.

---
## 8. ARMADILHAS (não copiar)
- **SQL injection por todo lado** (concatenação de `$pid`, `$id`, nomes): ex. `softName = '$softInfo->softname'` P:1878, P:2008, P:3237; UPDATE log/INSERT software com nomes de usuário; `logEdit` etc. Use queries parametrizadas/RPC com checagem `auth.uid()` (RLS no Supabase).
- **Senhas de jogo em texto puro** (`users.gamePass`, `lists.pass` varchar(9), `'unknown'/'exploited'/'download'` mágicos). Tipar como enum + coluna separada.
- **Lógica de conclusão disparada pelo cliente** e sem lock → corrida/duplo-complete (checa `pTimeLeft` no ajax, ajax.php:1464). Use transação + `SELECT ... FOR UPDATE SKIP LOCKED` ou fila/cron no servidor.
- Estado crítico em `$_SESSION` (`LOGGED_IN`, `CHMOD`, `PORT_SCAN`, `HACKED`) → persista em tabela (`connections`, `scan_results`).
- Inconsistência `processDuration` × `calculateDuration` (port-scan 4 vs 30; exploit 22 vs 60; ddos 300/…); `processTimeConfig` morto; `research_calculateDuration` (C:5933) com faixa 30-49 errada; `rates.txt`/`hardware.txt` desatualizados (marcado "Not sure if accurate"); `hardwareItens` vs badges (HDD 100000).
- `calculateDuration` usa `$_SESSION['id']` (usuário logado) em vez do dono do processo → no servidor passe `creator_id`. `updateProcessTime` usa sempre `$data['0']` (P:793) e `$pcType` misturado; `updateProcessUsage` é frágil e não conserva progresso.
- `getHardwareInfo` faz `SUM` + coluna não agregada `net` (C:43-62); `getDownloadSpeed` tem typo (`$transfer` vs `$transferRate`, P:88, função morta).
- `ip_studyPrice`/`pwd_studyPrice` retornam escalar `0` quando `resets==0` e depois acessam `['PRICE']` (PHP engole); `NEXT_RESET` mistura 0 e string traduzida.
- HIDE: vários `$error=` sobrescrevem uns aos outros (P:1126-1170); comentário de SEEK diz ">" mas é ">=".
- Log como **blob único** com `CONCAT(novo, text)` sem limite de tamanho (cresce sem teto) e `log.userID AUTO_INCREMENT`. Prefira linhas + TTL/limite.
- Recompensa/dedupe de download compara por (nome,tamanho,tipo,versão) em vez de id; "licensedTo<0" (NPC/doom) é número mágico.
- Dependências PHP: `die()`, `header()+exit` no meio da lógica de domínio (processo fica "preso" pronto quando handleError tem redirect, P:3810), `ngettext`/`_()` gettext misturado em regra, `/var/www/...` hardcoded, HTML dentro de classes de domínio.
- `pause` desabilitado para não-admin (P:3843) → não portar sem necessidade.
- `FORMAT` (10) é no-op; `COLLECT`(6) `die("To do")`; `EXPLOIT NSA`(21) `die`.
- Cron de limpeza `removeExpiredLogins`: conexões expiram após **10 h** de login (cron2/removeExpiredLogins.py) – esqueça `internet_connections.expires` ON UPDATE.
- Pedaços fora do meu escopo/não lidos a fundo: DDoS (`Virus::DDoS` C:7220-7890), Doom (C:7894-8460), missões/storyline, banco/Finances, BTC, clã. Se precisarem, abro nesses arquivos.
