# Roadmap de mecânicas — o que portar do HE Legacy e como encaixa no Hacker City

Documentos-fonte (análise do código, com `arquivo:linha`):
[`01-mecanicas-core`](./referencia-he-legacy/01-mecanicas-core.md) ·
[`02-economia-missoes-social`](./referencia-he-legacy/02-economia-missoes-social.md) ·
[`03-minigames-enigmas`](./referencia-he-legacy/03-minigames-enigmas.md)

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

## Ordem de execução (cada item = 1 PR atômica ou mais)

### Fase 1 — Cara de produto (visual)
1. ✅ Créditos e licenças (#18)
2. ✅ Design system: paleta neutra + acento verde, Inter/JetBrains Mono (#19)
3. **App shell:** sidebar + topbar (IP, dinheiro, BTC, reputação), janelas viram *páginas*, ícones Lucide no lugar de emojis
4. **Home "Painel de operações":** próximo passo, notícias, procurados, mira da Safenet
5. **Auth:** landing curta ("Digite um IP. Entre. Suma.") e verificação por OTP/link refinada

### Fase 2 — Núcleo de jogo
6. **Motor de processos** (`processes`, `rebalance`, conclusão no servidor) + página **Task Manager**
7. **Software e versões** (cracker/hasher/firewall/exploits) + **Internet por IP** (Página / Entrar / Invadir: força-bruta, exploit, port scan)
8. **Logs por linha** (`log_entries`) + "editar/limpar log" como processo
9. **XP, níveis 1–10 e ranking** (função única `grant_xp(action, ctx)`)

### Fase 3 — Minigames anti-cheat
10. **Framework `minigame_sessions`** (seed, expiração, reexecução, tempo mínimo)
11. Minigames: Lights Out, 2048, Campo Minado, Velha (IA ajustável), Sudoku com solução única
12. Minigames temáticos: Bruteforce manual (Mastermind), Decodificar hash, Bypass de firewall, Limpar log, Handshake, Regex
13. **Trilha de enigmas** própria (conteúdo nosso, parametrizado por seed)

### Fase 4 — Mundo e economia
14. **Quadro de missões** (pool por nível, cron a cada 15 min) e certificações como *gate* da árvore
15. **Safenet/FBI/bounty** ligado ao Heat existente
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
