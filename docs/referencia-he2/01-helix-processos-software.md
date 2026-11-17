# Helix (HE2): processos e software

> **Licença da fonte: AGPL-3.0.** Este documento descreve IDEIAS, regras e números com palavras próprias. Nenhum código, CSS, imagem ou texto foi copiado, e nada daqui pode ser colado no projeto. Ver [`README.md`](./README.md) e [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md).

# Relatório: Processos e Software no Helix (HE2) — somente ideias, regras e números (nada de código copiado)

Pontos que podem surpreender, para você conferir:
- Quase tudo que um jogador faz em Helix (copiar, mover, apagar arquivo, forjar log) é uma ação instantânea, não um processo. Só existem 9 tipos de processo e 7 deles funcionam.
- Pausar, retomar e mudar prioridade estão previstos no modelo, mas nunca foram ligados. Estão comentados em `process/action/process.ex:63-69, 98-105` e em `process/event/handler/process.ex:41-44`.
- Várias fórmulas de balanceamento são provisórias (`TODO balance`).
- Todo `arquivo:linha` abaixo é relativo a `/home/littlecoffee/Documentos/DEV/referencias/he-helix/lib/`.
- Nota à parte: a mensagem do sistema pedindo a configuração do plugin Data Agent Kit exige um ID de projeto GCP, que só o usuário pode informar. Não fiz essa configuração.

---
## 1. Modelo de PROCESSO

### 1.1 Entidade (`process/model/process.ex`)
Uma linha da tabela `processes` guarda:
- **Identificação:** `gateway_id` (servidor de origem), `target_id` (servidor alvo), `source_entity_id` (jogador), `network_id`, `bounce_id` (L305-322).
- **Chaves opcionais de contexto** (L324-360): `src_connection_id`, `tgt_connection_id`, `src_file_id`, `tgt_file_id`, `src/tgt_atm_id` + `src/tgt_acc_number` (banco) e `tgt_process_id`. A maior parte do código só faz consulta por essas colunas.
- **Dados e tipo:** `data` (jsonb específico do tipo) e `type` (L362-368).
- **Prioridade:** inteiro, default 3 (L370-372). A view documenta o intervalo 0..5 (`process/public/view/process.ex:37`).
- **Trabalho:**
  - `objective` = trabalho total necessário, por recurso.
  - `processed` = trabalho já feito, por recurso.
  - `l_limit` / `r_limit` = tetos locais e remotos.
  - `l_reserved` / `r_reserved` = o que o Allocator reservou (L376-397).
  - `static` = consumo mínimo fixo, com chaves `paused` e `running` (L402-403).
  - `l_dynamic` / `r_dynamic` = lista de recursos que o processo pode "absorver" (L405-408).
  - `last_checkpoint_time` e `creation_time` (L399-400, 429).
- **Campos calculados** (não persistidos): `state`, `time_left`, `percentage`, `completion_date`, `l_allocated`, `r_allocated`, `next_allocation`, `local?` (L410-442).

### 1.2 Estados (L688-698)
- Não existe coluna `state`. Ela é derivada: `priority == 0` é `paused`; `l_reserved` vazio é `waiting_allocation`; caso contrário é `running`.
- A consulta `by_state(:running)` filtra `priority > 1` (L777-782). Isso parece inconsistente com o intervalo 0..5, então tome como incerto.
- O processo é "completado" ou "morto" e a linha é deletada: `Internal.Process.delete` (`process/internal/process.ex:96-102`) e `Action.Process.delete` (`process/action/process.ex:50-61`). Não há status final persistido, só os eventos `ProcessCompleted` e `ProcessKilled`.

### 1.3 Sinais, estilo UNIX (L85-185, 199-207)
- **Ciclo de vida:**
  - `SIGTERM`: objetivo atingido, chama o `on_completion`.
  - `SIGKILL` + motivo: chama o `on_kill`.
  - `SIGSTOP`, `SIGCONT`, `SIGPRIO`: só especificados.
- **Sinais de objeto:**
  - `SIGSRCCONND` / `SIGTGTCONND`: a conexão de origem ou de alvo fechou.
  - Também há variantes para arquivo e conta bancária (`SIGSRCFILED`, `SIGTGTFILED`, `SIGSRCBANKACCD`, `SIGTGTBANKACCD`).
  - Só os sinais de conexão estão ligados em `process/action/process.ex:107-111`.
- **Motivos de kill:** `completed`, `killed`, `src_connection_closed`, `tgt_connection_closed`, `src_file_deleted`, `tgt_file_deleted`, `src_bank_acc_closed`, `tgt_bank_acc_closed`.
- **Resposta padrão** (`process/processable.ex`): se a conexão de origem ou de alvo fecha, o processo manda `SIGKILL` para si mesmo. O `on_kill` padrão apenas deleta o processo. `on_completion` é obrigatório em cada tipo.
- **Ações possíveis** que um callback devolve (`process/model/processable.ex:70-77`): `delete`, `pause`, `resume`, `renice`, `restart`, `{SIGKILL, motivo}`, `noop`. Só `delete`, `SIGKILL` e `noop` são tratados de fato.
- **Filtro de eco** (`process/event/handler/top.ex:111-161`): quando uma conexão fecha, todo processo que dependia dela é notificado, **exceto** o que causou o fechamento. Isso evita laço e condição de corrida.

### 1.4 Criação (`process/executable.ex`, `process/action/process.ex:28-39`)
A criação é declarativa. Cada tipo declara:
- seus recursos;
- o arquivo de origem e o de alvo;
- a conexão de origem (criar uma de tal tipo) e a de alvo;
- a conta bancária e o processo-alvo.

Fluxo (executable.ex:345-430):
1. Monta o `data` do processo.
2. Calcula os recursos.
3. Resolve arquivos, banco, bounce e dono.
4. Cria a conexão, se declarada (um túnel + connection por processo).
5. Faz insert do processo.
6. Emite `ProcessCreated(confirmed: false)`.

A criação é otimista: insere primeiro e valida recursos depois (`process/action/process.ex:20-27`). Quem reage ao evento é `recalque_handler` (`process/event/handler/top.ex:47-61`): ele faz o recalque dos dois servidores e reemite o evento como confirmado. **Se o recalque falha (overflow de recursos), o ramo está `:todo`** (L54-60). O `ProcessCreateFailed` nunca foi implementado. Não sei o que acontece com a linha no banco nesse caso, e isso é uma lacuna que não convém copiar.

### 1.5 TOP: alocação de recursos (`process/model/top/allocator.ex`)
**Recursos** (`process/model/process/resources.ex:30-48`): `cpu`, `ram` (números simples), `dlk` e `ulk` (mapa `rede -> número`). `dlk` espelha `ulk` e vice-versa.

**Capacidade do servidor** (`process/query/top.ex:45-46`):
- `cpu_total = clock da CPU + clock da RAM`
- `ram_total = tamanho da RAM`
- `dlk` e `ulk` vêm da placa de rede, por rede.

**Algoritmo de 3 passes**, executado para um servidor (`allocator.ex:238-296`):
1. **Estático.** Cada processo recebe o mínimo fixo, `static.paused` ou `static.running` conforme o estado (`behaviour/default.ex:135-150`). Não depende de prioridade. Remotos (`local?=false`) não recebem estático.
2. **Dinâmico.**
   - Sobra = capacidade − estático.
   - Cada processo tem "shares" = sua prioridade, mas só nos recursos listados em `dynamic` e **somente se o recurso ainda não bateu o objetivo** (`default.ex:98-122`).
   - Paused tem prioridade 0, então fica com 0 shares.
   - Valor por share = sobra / total_de_shares.
   - Cada processo recebe `shares × valor_por_share`, limitado pelo seu `limit` (L375-425).
3. **Remanescente.** O que sobrou (por teto de alguém) é redistribuído **só** entre processos **sem limite algum** (L427-465). O código admite que isso é impreciso para processos com limite parcial (L433-434).

**Overflow** (L319-351; `default.ex:178-184`): se a sobra final ficar abaixo de −1 (tolerância de arredondamento), é erro `{:error, :resources, processos_mais_pesados}`. O mais pesado é o de maior valor naquele recurso.

**Local vs remoto** (L203-214): para um servidor S, o processo é "local" se S é o gateway e "remoto" se S é o alvo. Cada servidor só mexe nos campos `l_*` (local) ou `r_*` (remoto). Cada processo tem listas `l_dynamic` e `r_dynamic` próprias (ex.: download usa DLK local e ULK remoto).

**Uso efetivo** (`process.ex:530-558`, `infer_usage`):
- O Allocator **reserva otimisticamente**; o uso real é calculado depois.
- Uso = `min(limite, reservado)` de cada lado.
- Se há alocação remota, ela é espelhada (ULK remoto vira DLK local) e **trunca a alocação local de rede**.
- Efeito: baixar de alguém com ULK baixo limita seu DLK alto.
- O doc (L172-193) admite que isso desperdiça banda em casos raros ("GoodEnoughForNow").

### 1.6 Tempo restante e progresso (`process/model/top/scheduler.ex`)
- **Simular** (L62-93): `processado += alocação_atual_por_segundo × ms_desde_o_último_checkpoint`. Está concluído quando **todos** os recursos do objetivo foram atingidos.
- **Estimar** (L242-271):
  1. `restante = objetivo − processado`.
  2. `tempo_por_recurso = restante / alocação` (usa a `next_allocation` se existir).
  3. O tempo restante é o **maior** desses valores, arredondado a 2 casas.
- Estado `waiting_allocation` vira `running` na simulação (L50-60).
- **Checkpoint** (L174-207): só grava `processed` e `last_checkpoint_time` quando a alocação **mudou**. Se não mudou, o progresso é reconstruído por fórmula, sem escrita no banco.
- **Porcentagem** (`process.ex:597-627`): é o **menor** progresso entre os recursos do objetivo. Isso é conservador e pode ter um bug mencionado nos comentários.
- **Data de conclusão** = último update + tempo restante. `:infinity` se pausado ou sem alocação.
- **Recálculo** (`process/action/top.ex:68-183`): `recalque(servidor)` carrega capacidade + todos os processos (locais e remotos), roda o Allocator e depois:
  - prevê (`forecast`) só os processos locais;
  - completa os já terminados;
  - faz o checkpoint em lote numa transação;
  - agenda um evento `BringMeToLife` para daqui a `tempo_restante` ms, para o próximo processo que vai terminar (L240-246).
- Quando o evento dispara (`handler/top.ex:22-39`): busca o processo, simula e, se terminou, manda `SIGTERM`; se ainda não terminou (raro), só refaz o recalque. Depois de completar, faz um novo recalque, porque sobrou recurso.
- Um recalque num processo cobre os **dois** servidores (gateway e alvo) (`action/top.ex:70-81`).
- **Mudança de hardware:** o evento `Motherboard.Updated` existe, mas **não há handler de recalque ligado a ele** (`event/dispatcher.ex:184-185`). Os comentários dizem que "precisa de recalque quando o total de recursos muda", mas não vi isso conectado.

### 1.7 Comparação com o Legacy (PHP/HE1)
O que segue sobre o HE1 vem do que você descreveu (CPU dividida em partes iguais) e não do repositório. Melhorias do HE2:
- Rede em **duas pontas** (ULK de quem envia limita o DLK de quem recebe).
- Prioridade vira **peso** (shares) em vez de divisão igual.
- **Static** (RAM) separado de **dynamic** (CPU/rede), com valores diferentes em pausa e em execução.
- **Limites** por processo, com redistribuição da sobra.
- **Paused** ainda ocupa RAM, mas não CPU nem rede.
- Cada recurso só é consumido enquanto o objetivo dele não foi atingido.
- Conclusão por **eventos agendados** (não varredura periódica): cada processo conhece o instante exato em que termina.
- Checkpoint só quando a alocação muda.

---
## 2. TIPOS DE PROCESSO (todos os existentes)

Há 9 tipos declarados em `process.ex:74-83`. Os 5 do pacote software (`software/process/`) e os 2 do banco (`universe/bank/process/`) estão funcionais. Os outros 2 estão desligados.

| Tipo | Requisitos | Recurso / objetivo | RAM (static) | Resultado ao completar | Falha / kill |
|---|---|---|---|---|---|
| `cracker_bruteforce` (`software/process/cracker/bruteforce.ex`) | Gateway tem um cracker com módulo `bruteforce` (`henforcer/software/cracker.ex:29-52`). O alvo não pode ser o próprio jogador (`target:self`). Precisa de bounce válido, de que o IP exista na rede e de que a origem seja local. | **CPU**: `10000 − 100×v_bruteforce` se o alvo não tem hasher (L119-121); `v_bruteforce × v_hasher.password` se tem (L123-125). Dynamic `[cpu]`. Usa o melhor hasher do alvo (L155-157). | pausado 20, rodando 50 (L127-132) | Revela a **senha real** do servidor (determinística) e grava no banco do atacante (`handler/cracker.ex:35-54`, `server/action/server.ex:101-130`). | Se o IP não existe, emite `Bruteforce.Failed`. Se a conexão de origem fecha, `SIGKILL`. |
| `cracker_overflow` (`overflow.ex`) | Cracker com overflow, um processo ou conexão alvo. **Não existe request websocket para ele**, então é pouco usado. | **CPU = versão do módulo overflow** (L74-76). | pausado 100, rodando 200 | Ataca um `wire_transfer` (ou um `bank_login`) e gera um **token de conta** (`handler/cracker.ex:70-149`). | Padrão. |
| `file_download` / `file_upload` (`software/process/file/transfer.ex`) | O arquivo pertence ao servidor de origem da transferência; o storage destino é do servidor de destino e tem espaço (checagem de espaço é `TODO`); servidores diferentes (`henforcer/file/transfer.ex:43-97`). | **DLK = tamanho do arquivo** (download) ou **ULK = tamanho** (upload), na rede da conexão (L153-166). Local dynamic = dlk/ulk; remoto dynamic = o espelho (L172-193). | pausado 10, rodando 20 | Copia o arquivo para `/Downloads` no storage destino, nos dois sentidos (`handler/file/transfer.ex`), e emite `Downloaded` / `Uploaded`. | Evento `TransferAborted`, deleta o processo. Se a cópia falhar, emite `DownloadFailed` / `UploadFailed` (motivo `:unknown`, `TODO`). |
| `install_virus` (`file/install.ex`) | O arquivo é instalável e o jogador existe. Para vírus: ele não pode estar ativo, o jogador não pode ter vírus naquele storage, e não pode ser instalação no **próprio** servidor (`henforcer/virus.ex:54-66`). Tem que haver uma conexão SSH. | **CPU fixa = 300** (L104-106, comentário `TODO usar tempo #364`). Ignora versão e tamanho. | sem static | `Virus.Installed`: registra o vírus e o **ativa** se for o primeiro do jogador naquele storage (`internal/virus.ex:114-135`). | Falha dá `InstallFailed(:internal)`. Dedupe: se já existe um install deste arquivo, devolve o processo existente (`public/file.ex`). |
| `virus_collect` (`virus/collect.ex`) | O vírus pertence ao jogador e está ativo; o pagamento é válido (miner precisa de wallet; spyware/spam precisam de conta bancária); o tipo é coletável (`henforcer/virus.ex:116-126, 267-274`). | **CPU fixa = 500** (L81-83). | pausado 10, rodando 20 | Cria o evento `Collected` com ganhos de **5000** fixo (placeholder, `model/virus.ex:111-116`); reseta o `running_time` do vírus (`action/virus.ex`); credita no banco. | `{:error, []}` se `earnings` não for inteiro. |
| `wire_transfer` (`universe/bank/process/bank/transfer.ex`) | Existe uma transferência bancária. | **CPU = valor transferido** (L83-85). `dynamic []`: **não ganha CPU extra**, então a duração depende só do static. Não entendi totalmente como isso termina, e o `TODO` indica que deveria ser tempo. | pausado 50, rodando 100 | `Transfer.Processed`. | `Transfer.Aborted` ao ser morto. |
| `bank_reveal_password` (`.../account/password_reveal.ex`) | Existe a conta e o token. | **CPU = 1** (placeholder, `TODO proper balance`). | sem static | `RevealPassword.Processed`. | Padrão. |
| `log_forger` (`software/model/software_type/log_forge/process_type.ex`) | Código **legado**, nunca migrado (`TODO` na L1). O flow está comentado (`software/action/flow/software/log_forger.ex`). | Ver fórmulas na seção 5. | RAM = `v×5 + trunc(sqrt(v)×50)`, igual pausado e rodando | `LogEdit.Processed` / `LogCreate.Processed`. | Kill deleta sem evento. Se a conexão fecha, deleta. |
| `firewall` (`.../firewall/process_type.ex`) | Código **legado**, nunca migrado. | Sem objetivo definido. | n/d | `Firewall.Stopped`. | Padrão. |

Também existem `encryptor` / `decryptor` (+ `crypto_key`), mas estão **comentados** inteiros (`encryptor/process_type.ex`, `handler/encryptor.ex`, `model/crypto_key.ex`). A fórmula que sobrou: `RAM = v × 100`, só CPU dinâmica, o resultado seria criptografar o arquivo e gerar uma chave em `/.keys` (tamanho 1).

**Sem processo, apenas ação instantânea:** copiar, mover, renomear, apagar arquivo (`software/internal/file.ex:102-165`) e criptografar/descriptografar. Não existe processo de recuperar log nem de DDoS. Os pedidos websocket de software são só: bruteforce, download, upload, install, virus collect e as operações de PFTP (servidor FTP público).

**Conexões criadas por processo** (a conexão é o "cano" e morre junto): `cracker_bruteforce`, `ftp`, `public_ftp`, `virus_collect`, `wire_transfer`. Se a conexão cai, o processo recebe o sinal e morre.

---
## 3. SOFTWARE no HE2

### 3.1 Tipos e módulos (`software/model/software.ex:12-120`)
| Tipo | Extensão | Módulos |
|---|---|---|
| cracker | `.crc` | bruteforce, overflow |
| firewall | `.fwl` | fwl_active, fwl_passive |
| text | `.txt` | (nenhum) |
| exploit | `.exp` | ftp, ssh |
| hasher | `.hash` | password |
| log_forger | `.logf` | log_create, log_edit |
| log_recover | `.logr` | log_recover |
| encryptor | `.enc` | enc_file, enc_log, enc_conn, enc_process |
| decryptor | `.dec` | dec_file, dec_log, dec_conn, dec_process |
| anymap | `.map` | map_geo, map_net |
| crypto_key | `.key` | (nenhum) |
| virus_spyware | `.spy` | vir_spyware |

Só `virus_spyware` conta como vírus (`software.ex:86, 146-147`). O código também referencia `virus_miner` e `virus_spam`, mas eles não existem na lista de tipos.

### 3.2 Arquivo, módulo e versão
- **Modelo:** a tabela `files` guarda nome, `path`, `software_type`, `file_size`, `storage_id`, `crypto_version` (null = não criptografado) e uma associação para os módulos (`software/model/file.ex:68-105`). `full_path = path + "/" + nome + "." + extensão`, único por storage (L172, 196-205). O path é normalizado (barra inicial, sem barra final).
- **Módulo = linha** em `file_modules` com `(file_id, nome, versão inteira > 0)` (`model/file/module.ex:49-66, 85-91`). A versão representa o poder. Não há "experiência" nem "pesquisa" no repositório; só existe o comentário "tempo/custo de pesquisa" em `balance/software.ex:14-15`.
- **Tamanho padrão** do arquivo = 500, nome = tipo (`model/file.ex:232-253`). Todos os arquivos gerados pelo código têm esse tamanho. A constante `ratio` pretendia escalá-lo, mas não é usada para isso.
- **Melhor versão:** `fetch_best(storage, módulo)` pega o arquivo com maior versão **daquele módulo** no storage (`internal/file.ex:22-41`). É assim que o bruteforce escolhe o cracker e o hasher alvo.
- **Instalar:** só vírus. A instalação de um tipo genérico não faz nada além do evento (`file/install.ex:58-71`).
- **Licenças:** não existem no repositório. Pesquisa: também não (só o comentário acima).
- **Criptografia:** o campo `crypto_version` existe e há consultas para filtrar arquivos não criptografados, mas o processo de criptografar/descriptografar está desligado.

### 3.3 Storage
- **Hardware:** `storage` é ligado a uma ou mais unidades do disco (`storage_drives`). Os discos têm `size` e `iops`.
- **Verificação de espaço:** `has_enough_space?` é um stub (`TODO #279`, `henforcer/storage.ex`). Ou seja, o limite de disco **não é imposto** na versão atual. Lacuna.

### 3.4 Vírus (modelo)
Dados em `viruses` (arquivo, jogador dono) e `viruses_active` (`virus_id`, `entity_id`, `storage_id`, `activation_time`).
- Regra principal: **um vírus ativo por (jogador, storage)**, com chave única `(entity_id, storage_id)` (`model/virus/active.ex:6-12`).
- Instalar um vírus novo ativa-o automaticamente **só se não houver outro ativo**; ativar manualmente substitui o anterior (`internal/virus.ex:98-135, 143-190`).
- `running_time = agora − activation_time`. Coletar reseta isso para zero.
- Os ganhos reais são só um placeholder (5000, `model/virus.ex:111-116`, `TODO #389`). O design previsto é usar `Helix.Balance`.

### 3.5 FTP público (PFTP)
Um servidor pode ligar o FTP público (flag `is_active`), com uma lista de arquivos baixáveis por qualquer um (`model/public_ftp.ex`). O download passa por `pftp_download`: o mesmo processo `file_download`, só que com conexão `public_ftp` e sem SSH (`action/flow/file/transfer.ex`).

---
## 4. PADRÕES `factor` e `henforcer`

### 4.1 Henforcer (validador de regra antes de agir) — `henforcer/henforcer.ex`
Ideias centrais (L2-173):
1. **Uma função, uma verificação.** Quem precisa de mais constrói a partir de blocos menores.
2. **Retorno uniforme:** sucesso = `(true, relay)`; falha = `(false, motivo, relay_parcial)`. Nunca um booleano solto.
3. **Relay:** tudo que o validador buscou no banco (arquivo, servidor, entidade) sobe de volta para quem chamou. Assim o handler **não precisa buscar de novo** o que o validador já leu.
4. **Aceita id ou objeto:** se recebe só o id, verifica a existência e busca; se recebe o objeto, assume que já foi verificado.
5. **Cada validador adiciona no máximo um motivo de erro** (os demais vêm dos sub-validadores). Erros são pares tipo `{objeto, razão}`: `{file, not_found}`, `{target, self}`, `{cracker, not_found}`, `{virus, active}`.
6. **Conflito de chaves do relay:** quem compõe renomeia (ex.: `server` vira `gateway` e `target`).
7. Combinadores úteis: `henforce_not` (inverte, com o motivo), `henforce_else` (troca o motivo de erro por um mais específico).

**Exemplo de composição** (`software/henforcer/software/cracker.ex:29-52`) para "pode fazer bruteforce?": gateway existe → o `nip` (rede+IP) do alvo existe → o alvo não é do próprio jogador → existe um cracker com módulo bruteforce → devolve o melhor cracker.

O fluxo de uma request websocket é sempre `check_params` (só formato) → `check_permissions` (henforcers) → `handle_request` (executa). Também vi essa separação em `software/websocket/requests/cracker/bruteforce.ex`. Isso é uma boa ideia de arquitetura.

### 4.2 Factor (coletar fatos para fórmulas) — `factor/factor.ex`, `factor/client.ex`
- **Ideia:** separar a **coleta de dados** (arquivo, versão, tamanho, servidor...) do **cálculo de balanceamento**. Assim cada fórmula vira uma função pura, testável com números cruos.
- **Hierarquia de fatos** por objeto, p.ex. o factor de arquivo só tem `size` e `version` (`software/factor/file.ex`). Em `get_factors`, o processo escolhe quais fatos precisa (`only: :version`, `as: :cracker`, `if: condição`).
- **Relay de dados já buscados** também existe aqui (mesmo princípio do Henforcer).
- No repositório, **só existe um Factor** (arquivo). Todo o resto ainda usa números fixos.
- **Resourceable** (`process/resourceable.ex`): DSL em que cada processo declara, por recurso (cpu, ram, dlk, ulk), qual é o objetivo, e declara também `static` e `dynamic`. O DSL força cobrir todos os casos do padrão, para que um erro de digitação não vire "download instantâneo".
- Objetivos com valor 0 ou vazio são **descartados**; `dlk`/`ulk` só entram se o processo tem uma rede (`resourceable.ex`, função `calculate`).

### 4.3 Como levar isso para RPCs Postgres
- **Henforcer = função SQL `can_<ação>(...)`** que devolve `(ok boolean, reason text, relay jsonb)`. Compor com `PERFORM` e `RETURN` imediato no primeiro erro. O `relay` é um `jsonb` acumulado.
- **Factor = função SQL pura** `facts_<objeto>(id)` que devolve `jsonb`, usada pela função `process_objective(type, facts)`.
- **Resourceable = tabela** `process_catalog(type, cpu_formula, ram_paused, ram_running, dynamic[])` mais uma função que calcula o objetivo.
- Motivos de erro como texto padronizado `'target.self'`, `'cracker.not_found'`, que o front traduz.

---
## 5. FÓRMULAS E CONSTANTES

| Item | Valor | Fonte |
|---|---|---|
| Prioridade padrão / faixa / pausado | 3 / 0..5 / 0 | `process.ex:370-372`, `public/view/process.ex:37` |
| Capacidade de CPU do servidor | `clock CPU + clock RAM` | `process/query/top.ex:45` |
| Capacidade de RAM | tamanho da RAM | `process/query/top.ex:46` |
| Tolerância de overflow | sobra < −1 | `resources/behaviour/default.ex:180` |
| Arredondamento de recursos / tempo | 3 casas / 2 casas | `resources/utils.ex`, `scheduler.ex:268` |
| CPU do bruteforce (sem hasher) | `10000 − 100 × v_bruteforce` | `bruteforce.ex:119-121` |
| CPU do bruteforce (com hasher) | `v_bruteforce × v_hasher.password` | `bruteforce.ex:123-125` |
| RAM do bruteforce (pausado / rodando) | 20 / 50 | `bruteforce.ex:127-132` |
| CPU do overflow | `v_overflow` | `overflow.ex:74-76` |
| RAM do overflow (pausado / rodando) | 100 / 200 | `overflow.ex:82-87` |
| Download/upload | DLK ou ULK = `tamanho do arquivo` | `file/transfer.ex:153-162` |
| RAM do download/upload (pausado / rodando) | 10 / 20 | `file/transfer.ex:180-185` |
| CPU do install de vírus | 300 | `file/install.ex:104-106` |
| CPU do collect de vírus | 500 | `virus/collect.ex:81-83` |
| RAM do collect (pausado / rodando) | 10 / 20 | `virus/collect.ex:85-90` |
| Ganho de vírus por coleta | 5000 (placeholder) | `model/virus.ex:111-116` |
| CPU do wire_transfer | `valor` (sem CPU dinâmica) | `bank/transfer.ex:83-85` |
| RAM do wire_transfer (pausado / rodando) | 50 / 100 | `bank/transfer.ex:92-97` |
| CPU do reveal_password | 1 (placeholder) | `password_reveal.ex:78-80` |
| Log forge: edição | `fatorial(revisões) × 10000 + versão × 150` (se o log é seu), `fatorial(revisões+1) × 10000 + versão × 150` (se for de outro jogador) | `log_forge/process_type.ex:35-36, 63-75` |
| Log forge: criação | `versão × 400` | `process_type.ex:37, 77-81` |
| Log forge: RAM | `v × 5 + trunc(sqrt(v) × 50)` | `process_type.ex:130-144` |
| Encryptor/decryptor: RAM (comentado) | `v × 100` | `encryptor/process_type.ex:10-25` |
| Tamanho padrão de arquivo | 500 | `model/file.ex:244-247` |
| Razões de módulo (relativas ao bruteforce = 1) | overflow 0.9, hasher password 0.95, fwl_passive 0.9, fwl_active 0.8, log_edit 0.7, log_create 0.6, log_recover 0.65, vir_spyware 0.5 | `balance/software/constant.ex:24-42` |
| Base de um cracker | `1×v_bruteforce + 0.9×v_overflow` (a razão devia escalar tamanho/custo/pesquisa, mas só esse cálculo existe) | `balance/software.ex:19-30` |
| Hardware semente | CPU 256, RAM clock 100 e size 256, HDD size 1024, plano de internet DLK 128 / ULK 16 | `server/component/specs/specable.ex:46-50, 86-91, 127-131`; `server/action/flow/motherboard.ex:77` |
| Preço da CPU / RAM / HDD / NIC / mobo | 100 / 100 / 150 / 50 / 100 | `specable.ex` (mesmas linhas, mais 279) |

Não sei qual é a unidade de tempo real (o código só trabalha com números por segundo). Com o plano básico (DLK 128 e ULK 16) e um arquivo de 500, um download de um jogador médio levaria ≈ 31 s se a ponta remota usa ULK 16, e ≈ 4 s se não houvesse limite remoto. Isso é uma conta minha, não está no código.

---
## 6. PRONTO PARA PORTAR (10 mecânicas)

**1. Prioridade como peso (shares) com RAM fixa para pausado.**
```
dyn_share(p) = (p.priority) se p tem recurso r em p.dynamic E ainda falta trabalho em r, senão 0
cpu_por_share = (CPU_total - soma(static)) / soma(shares)
p.cpu = min(p.limit.cpu ?? INF, p.dyn_share * cpu_por_share) + p.static[estado].cpu
```
Encaixa em: sidebar com a lista de processos ("TOP"), com um slider de prioridade 1..5 e botão de pausa. Prioridade 0 = pausa.

**2. Processo como linha com "checkpoint lazy".** Em vez de varrer, guarde `processed`, `last_checkpoint` e a alocação atual.
```sql
processed_agora = processed + alloc_por_seg * extract(epoch from now()-last_checkpoint)
-- só grava quando a alocação muda ou o processo termina
```
Encaixa em: motor de processos no Postgres. Não precisa de cron rodando a cada segundo. A UI calcula `tempo_restante` no cliente.

**3. Conclusão agendada, não varrida.** Depois de cada recálculo, calcule o `min(tempo_restante)` dos processos e agende um único "despertador" para esse instante (pg_cron, `pg_notify` com timer externo ou Edge Function).
```
next = min(restante_i / alloc_i)  -- por processo, o maior entre seus recursos
agendar(complete_process(id), agora + next)
```
Ao acordar, rode `simulate`; se ainda não terminou (raro), recalcule de novo.

**4. Duração = max entre recursos.** Um processo com CPU + rede só termina quando o recurso mais lento terminar.
```
t = max( falta_cpu/cpu_alloc , falta_dlk/dlk_alloc , ... )
```
Encaixa em: bruteforce (só CPU), transferência (só rede), e permite processos mistos mais ricos (ex.: exfiltração de dados usa rede e CPU).

**5. Gargalo de duas pontas.** O DLK de quem baixa é limitado pelo ULK de quem serve (e vice-versa).
```
vel_efetiva = min(dlk_gateway_reservado, ulk_alvo_reservado)
```
Encaixa em: botnet de 210 bots. Cada bot é um servidor com ULK baixo, e vários bots em paralelo somam banda. Também combina com especialidades de rede: a habilidade eleva a banda ou o teto.

**6. Dedupe de processo por (tipo, gateway, alvo-arquivo).** Se já existe um download ou install daquele arquivo no gateway, devolve o existente.
```sql
INSERT ... ON CONFLICT (type, gateway_id, tgt_file_id) DO NOTHING RETURNING ...
```
Encaixa em: evita spam de processos duplicados. Vale como índice único parcial.

**7. Estático + dinâmico + limite, com 3 passes.** Primeiro o que é reservado (RAM), depois a divisão por prioridade, depois a sobra vai só para quem não tem teto.
Encaixa em: quitinete, onde a RAM da casa é o limite de quantos processos rodam. Overflow de RAM no static **rejeita** o processo.
```
if soma(static) > ram_total: RAISE 'process.no_ram'
```
Definir isso desde o início (HE2 deixou em `TODO`).

**8. Morte em cascata via conexão.** Cada processo remoto amarra a uma `connection`. Fechar a conexão (cair o login, o Heat chegar ao máximo, a polícia cortar) mata os processos amarrados com o motivo `src_connection_closed` / `tgt_connection_closed`.
Encaixa em: Heat/polícia: ao disparar a perseguição, fechar todas as conexões de ataque do jogador mata os processos, com a UI mostrando o motivo.

**9. Validador composável (`can_*`) com relay.** Cada RPC devolve `(ok, reason, relay)`; veja a seção 4.3.
Encaixa em: toda RPC de ação. Motivo de erro padronizado, e o front mostra a mensagem.
```sql
CREATE FUNCTION can_bruteforce(p_entity uuid, p_gateway uuid, p_target_ip inet)
RETURNS TABLE(ok bool, reason text, relay jsonb)
```

**10. Fórmula pura de duração a partir de "fatos" (Factor) + versão do módulo.**
```
bruteforce_cpu(v_cracker, v_hasher) = v_hasher ? v_cracker * v_hasher : 10000 - 100 * v_cracker
```
As fórmulas do HE2 são provisórias, e o par `v_cracker × v_hasher` cresce linearmente (a fórmula "sem hasher" começa em 10000, a "com hasher" começa em 1×1 = 1). **Isso é incoerente**: um hasher fraco derruba o custo de 10000 para quase 1. Recomendo usar a razão `cpu = base_custo × (v_hasher / v_cracker)` ou algo monotônico.
Encaixa em: árvore de habilidades: o nível da skill soma na versão efetiva do módulo (`v_efetiva = v_arquivo + bônus_skill`); especialidades mudam o multiplicador por tipo de processo.

### Mecânicas do HE2 que ainda valem como inspiração
- **Visão parcial vs completa** (`process/public/view/helper.ex:65-72`): o dono e o jogador originador veem o processo completo (uso, arquivo de origem, conexões); quem só é alvo vê o processo reduzido (sem uso, sem IDs de conexão). Boa ideia de "névoa de guerra".
- **Vírus**: um vírus ativo por storage, `running_time` desde a última coleta, coleta como processo curto e fixo. Encaixa em: botnet/quitinete com renda passiva e coleta periódica.
- **Cracker revela a senha real**: não há chance de falhar. O risco vem do Heat e do tempo, não de sorte.
- **Overflow gera token de conta** para atacar uma transferência em andamento: janela de oportunidade (precisa de um processo-alvo vivo). Boa ideia para eventos bancários.

---
## 7. ARMADILHAS E DIFERENÇAS DO LEGACY

**O que mudou do HE1 para o HE2**
- Divisão **por peso** (prioridade) em vez de em partes iguais; separação static/dynamic; limites; rede de duas pontas; tempo derivado e não polled.
- Processo declarativo com `Executable` / `Processable` / `Resourceable` e comportamento por sinais.
- Conexões (túneis) viram parte do processo, com bounce como cadeia de saltos (`bounce_id`).
- Tipos de software com **módulos** versionados (um cracker tem bruteforce e overflow separados, cada um com sua versão).
- Eventos como única forma de efeito colateral.

**O que NÃO convém copiar**
1. **Alocação otimista + `infer_usage` separado.** É simples, mas desperdiça banda (o próprio código admite). No Postgres, calcule o par local/remoto num único passe: `alloc_local = alloc_remota = min(...)` e redistribua a sobra.
2. **Criação otimista sem rollback** (`ProcessCreateFailed` nunca foi implementado, `process/event/handler/top.ex:54-60`). Valide a RAM/rede **antes** do insert, na mesma transação.
3. **Verificação de espaço em disco como stub** (`henforcer/storage.ex`, `TODO #279`). Implemente desde o início, ou o jogador enche o disco sem limite.
4. **Pausa/prioridade só no modelo.** Se for portar, implemente o ciclo completo e teste (priority 0 = pausa, mas a RAM `paused` continua ocupada).
5. **Fórmulas provisórias:** `cpu` do install = 300 e do collect = 500 fixos; `reveal_password` = 1; ganho do vírus = 5000. São placeholders, não números de balanceamento.
6. **Tamanho de arquivo fixo em 500** para tudo: não escala com a versão.
7. **Sobra só para processos sem limite** (comentário do próprio código, `allocator.ex:433-434`): um processo com limite em um recurso não recebe sobra de outro. Corrija se portar.
8. **`by_state(:running)` com `priority > 1`**, em desacordo com o estado derivado (`priority == 0` = pausado). Provável bug de borda.
9. **Porcentagem = menor progresso entre recursos** com um workaround conhecido de bug (`process.ex:590-627`). Para a UI, use a razão do recurso que termina por último.
10. **Códigos legados (log_forger, firewall, encryptor, decryptor, crypto_key)** nunca foram migrados. Use só as fórmulas de log forge como ideia: o custo cresce **fatorialmente** com o número de edições do mesmo log (o dobro de penalidade se for log de outro jogador), o que desencoraja forjar o mesmo log várias vezes. É uma ótima mecânica anti-abuso.
11. **JSONB de dados** do processo exige hook de "releitura" para recuperar tipos (átomos e IDs viram strings). No Postgres você terá o mesmo problema; use colunas tipadas ou valide o jsonb.
12. **Dedupe por consulta em Elixir** (`get_custom`) tem um bug de digitação na documentação (`Enum.fiter`), e a checagem é em memória. Use índice único.

### Incertezas desta análise
- O mecanismo real de conclusão do `wire_transfer` (CPU = valor mas sem recurso dinâmico) não ficou claro para mim.
- Não rastreei o ciclo de vida do `bounce` nem do túnel/conexão (fora do meu escopo).
- Não li os testes a fundo; só vi os nomes dos casos do Allocator e um cenário de recalque para validar a descrição.
- O repositório não tem pesquisa de software, licenças, nem tempo de download calculado em tempo real. Se você ouviu falar disso do HE2, não está neste commit (`d625f3c`).
