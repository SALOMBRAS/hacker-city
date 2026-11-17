# Roadmap de mecânicas — o que portar do HE Legacy e como encaixa no Hacker City

Documentos-fonte (análise do código, com `arquivo:linha`):
[`01-mecanicas-core`](./referencia-he-legacy/01-mecanicas-core.md) ·
[`02-economia-missoes-social`](./referencia-he-legacy/02-economia-missoes-social.md) ·
[`03-minigames-enigmas`](./referencia-he-legacy/03-minigames-enigmas.md)

HE2, **só ideias** (AGPL, ver [`referencia-he2/README.md`](./referencia-he2/README.md)):
[`01-helix-processos-software`](./referencia-he2/01-helix-processos-software.md) ·
[`02-helix-rede-logs-story-seguranca`](./referencia-he2/02-helix-rede-logs-story-seguranca.md) ·
[`03-heborn-ux`](./referencia-he2/03-heborn-ux.md)

Regra: **regras e fórmulas são reescritas, nunca copiadas.** Visual é nosso (design system em `src/css/design-system.css`).

## O que já temos × o que o Legacy resolve

| Já existe no Hacker City | O que o Legacy traz para melhorar |
|---|---|
| Janelas flutuantes de "SO" | Navegação por páginas (sidebar + topbar), Task Manager, Internet por IP |
| Ataque instantâneo / barra simples | **Processos com duração** (CPU/NET dividida entre tarefas) + minigame opcional que encurta o tempo |
| Heat policial (Sentinel 30%) | **Safenet → FBI → bounty**: Safenet = rastro (Heat 1), FBI = procurado, recompensa coletável por outro jogador |
| Botnet 210 bots | Fórmula de renda de vírus (spam/warez/miner), collector, DDoS por poder agregado |
| Quitinete (contas) | Sinks escalonados (reset de IP/senha), transferência com log nos dois lados + XP |
| Árvore de habilidades / subclasses | Certificações sequenciais como *gate* dos nós (cracker → exploits → DDoS → mitigação) |
| Missões fixas por subclasse | **Quadro de missões** com pool por nível, 5 tipos, prêmio com multiplicador |
| Arcade (jogos soltos) | Minigames dentro do fluxo de ataque, validados no servidor |

## Regras de ouro que o Legacy errou (e a gente não pode repetir)

Nosso público é de TI e vai tentar burlar. Tudo abaixo vem das seções **ARMADILHAS** dos relatórios.

1. **Nunca confiar no cliente.** No Legacy, 4 dos 5 minigames resolvem com um `POST` forjado. Aqui: o servidor sorteia a *seed*, o cliente envia só as jogadas, o servidor **reexecuta** e só então credita.
2. **Conclusão de processo é do servidor** (transação + `FOR UPDATE SKIP LOCKED`), nunca disparada pelo cliente.
3. **Estado de jogo em tabela**, não em sessão/cookie. Cookie editável = cheat.
4. **Crédito idempotente**: `UNIQUE(user_id, puzzle_id)` + `INSERT ... ON CONFLICT DO NOTHING RETURNING` (o Legacy dava XP duplicado por corrida).
5. **RPC parametrizada + RLS** em tudo (o original é SQL por concatenação).
6. **Rate limit e atraso progressivo** em respostas de enigma (o original deixa força bruta ilimitada e ainda dá dica de proximidade).
7. **Enigmas parametrizados por jogador** (seed) ou com conteúdo próprio: as respostas do Legacy são públicas desde o open source.
8. **Sem temporada com reset total**: perder tudo é ruim para retenção. Preferir temporadas parciais.
9. **Preço de BTC simulado** (random walk), nunca API real (quebra o balanceamento).
10. **Sem monetização predatória / premium.**

## Licenças dos minigames (importante)

- Sudoku do Legacy é **GPL v2+** → **não copiar nada**; implementação nossa, do zero.
- Minesweeper e Tic-Tac-Toe do Legacy: licença não declarada → só reimplementação própria.
- 2048 e Lights Out originais são MIT, mas também reescrevemos (créditos em `THIRD_PARTY_NOTICES.md`).
- Imagens do Legacy: o autor avisa que não incluiu a maioria e que cada um deve checar atribuição → **usamos Lucide (ISC)**, não os sprites.

## Decisões que o HE2 muda (Helix + HEBorn)

O HE2 corrige os pontos fracos do Legacy, mas é **incompleto** (muitos `TODO`) e só serve como ideia, nunca como código.

| Tema | Legacy (HE1) | HE2 | Decisão nossa |
|---|---|---|---|
| Divisão de recursos | CPU em partes iguais | **Prioridade como peso**, RAM fixa para pausado, 3 passes, teto por processo | Usar peso por prioridade (1 a 5; 0 = pausa) |
| Conclusão de processo | Disparada pelo cliente | Instante exato **agendado** após cada recálculo | Servidor agenda a conclusão; cliente só anima a barra |
| Rede | Sem proxy | **Bounce**: cadeia nomeada de saltos, só com máquinas já invadidas | Cada bot da botnet vira salto possível |
| Rastro | Log em ambos os lados | Log com IP real do atacante sem bounce, e um log "veio de A, foi para B" por salto | Heat calculado a partir desses logs reais |
| Logs | Editar/apagar livre | **Pilha de revisões**: forjar empilha, recuperar desempilha, custo fatorial | Adotar a pilha (anti-abuso embutido) |
| Polícia / Heat | Safenet/FBI por tempo | **Não existe** (rastreio é só forense) | Heat, Sentinel 30% e Safenet/FBI continuam design nosso |
| Missões | Quadro procedural | Steps como máquina de estados por evento, só tutorial pronto | Missões como **dados** + eventos de domínio do servidor |
| Segurança | `$_SESSION`, SQL concatenado | Pipeline em 4 fases, `can_*` composáveis, `FOR UPDATE` no dinheiro | RPCs `security definer`, RLS, escrita só por RPC |
| UX | Páginas PHP | Janelas, barra de conexão, notificação que leva ao lugar certo | Manter páginas; trazer faixa de conexão, widget de processos e notificação acionável |

### Lacunas do próprio HE2 que **não** vamos repetir
- Verificação de espaço em disco nunca implementada → implementar desde o início.
- Criação de processo sem rollback → validar RAM/rede **antes** do insert, na mesma transação.
- Pausa/prioridade só no modelo → implementar o ciclo completo com testes.
- Bounce selecionável no cliente mas sem efeito → só mostrar anonimato que existe de verdade.
- Sem rate limit nem idempotency-key → criar `request_log(request_id)` e limite por ação.
- Falha de crack sem motivo na UI → sempre mostrar o motivo.

## Ordem de execução (cada item = 1 PR atômica ou mais)

### Fase 1 — Cara de produto (visual)
1. ✅ Créditos e licenças (#18)
2. ✅ Design system: paleta neutra + acento verde, Inter/JetBrains Mono (#19)
3. **App shell:** sidebar + topbar (IP, dinheiro, BTC, reputação), janelas viram *páginas*, ícones Lucide no lugar de emojis
4. **Home "Painel de operações":** próximo passo, notícias, procurados, mira da Safenet
5. **Notificações acionáveis** (sino + toasts que levam ao item certo) e **auth:** landing curta e verificação por OTP/link refinada

### Fase 2 — Núcleo de jogo
6. **Motor de processos** com prioridade por peso, RAM fixa para pausado, validação **antes** do insert e conclusão agendada no servidor + página **Task Manager** e widget de processos sempre visível
7. **Software e versões** (módulos com versão própria) + **Internet por IP** (Página / Entrar / Invadir) + **faixa de conexão** (Meu PC → Bounce → Alvo) e **Caderno de alvos** preenchido ao quebrar a senha
8. **Túneis e bounce** (só com máquinas invadidas) + **logs por linha com pilha de revisões** (forjar/recuperar, custo fatorial) e geração de rastro por salto
9. **XP, níveis 1–10 e ranking** (função única `grant_xp(action, ctx)`)

### Fase 3 — Minigames anti-cheat
10. **Framework `minigame_sessions`** (seed, expiração, reexecução, tempo mínimo)
11. Minigames: Lights Out, 2048, Campo Minado, Velha (IA ajustável), Sudoku com solução única
12. Minigames temáticos: Bruteforce manual (Mastermind), Decodificar hash, Bypass de firewall, Limpar log, Handshake, Regex
13. **Trilha de enigmas** própria (conteúdo nosso, parametrizado por seed)

### Fase 4 — Mundo e economia
14. **Quadro de missões** (pool por nível, cron a cada 15 min) e certificações como *gate* da árvore
15. **Safenet/FBI/bounty** ligado ao Heat, lendo os logs reais da cadeia (sem bounce = IP exposto)
16. Renda de vírus no botnet, mercado BTC simulado, DDoS por poder agregado
17. Clãs com guerra automática por retaliação

## Mapa de dificuldade dos minigames (tiers 1–5)

| Tier | Exemplos | Efeito no ataque |
|---|---|---|
| 1 | Velha com IA errando, Lights Out 4×4 | -10% do tempo |
| 2 | Campo minado 8×8/10, Mastermind N=3 | -25% |
| 3 | Sudoku 36 vazias, 2048 até 512, handshake N=6 | -35% |
| 4 | 2048 até 1024, campo minado 16×16, bypass de firewall 8×8 | -45% |
| 5 | 2048 até 2048, Lights Out com solução mínima, regex golf | -50% + badge |

O minigame é **atalho opcional**: perder ou desistir mantém o tempo normal e nunca bloqueia o jogador.
