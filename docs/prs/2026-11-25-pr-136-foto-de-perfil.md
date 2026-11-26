# PR #136 — foto de perfil entre o cadastro e o tutorial

## Pedido

> "Quero que entre o cadastro e o tutorial inicial, antes de começar tudo, o usuario possa escolher uma foto de perfil, crie diversas artes nesse estilo que mandei como exemplo, e quero que faça de diversas formas, homens, mulheres, quero que faça tbm diferentes estilos, tipo um nerdão, outra com um capuz assoprando uma bola de chiclete, e etc, quero 70 imagens dessas, faça com cuidado e faça um layout bonito de escolha, mas acompanhando o design e tematica do projeto" (25/11)

Combinado na mesma conversa: retratos a lápis caricatos, gerados só por descrição em texto. A imagem de exemplo é de terceiros (tem marca d'água) e não foi enviada ao gerador. O estilo e o layout foram aprovados num protótipo antes de escalar.

## O que muda

- **Escolha antes do tutorial.** O jogador novo vê "Escolha sua foto de perfil" no lugar do início automático do tour (`maybeAutoStartForSession`, em `src/js/interactive-tour-ux-engine.js`). O tutorial começa quando ele confirma. Vale para a conta com e-mail e para o 1 Clique.
- **Tela.** Grade no visual do HackerOS, com filtros (Todos, Homens, Mulheres), Sortear, ficha com prévia e navegação por teclado (setas, Enter, duplo clique). No celular, a ficha vira uma barra fixa embaixo. "Decidir depois" segue para o tutorial e não pergunta de novo.
- **Onde a foto aparece.** HUD (barra do topo) e janela Perfil. Clicar na foto do Perfil reabre a tela para trocar; em tela de toque, o rótulo "Trocar" fica sempre visível.
- **Onde fica salva.** Conta com e-mail: `profiles.avatar_url`. 1 Clique: `localStorage` (`HC_AVATAR_<uid>`), como o resto da sessão instantânea.
- **Retratos.** 25 de 70 em `assets/avatars/` (WebP de 384 px para ficha e Perfil, 160 px para grade e HUD; cerca de 480 KB no total). A lista dos 70, com nome, gênero e prompt, está em `scripts/avatares/retratos.json`.
- **Script.** `scripts/avatares/montar_avatares.py` registra os jobs, baixa os originais, corta a borda do caderno, normaliza os níveis com a tinta e o papel do jogo e regera `src/js/avatar-catalog.js`.
- **Service worker.** `.webp` entra no cache-first dos estáticos.

Arquivos novos: `src/js/avatar-picker-engine.js`, `src/js/avatar-catalog.js` (gerado), `src/css/avatar-picker.css`, `scripts/avatares/`, `tests/verify-avatar-picker-e2e.js` e `evidencias/foto-de-perfil/`.

## Por quê

Dar um rosto ao operador logo na entrada, antes do treinamento. A coluna `profiles.avatar_url` já existia, com `GRANT UPDATE (avatar_url)` para `authenticated`, mas nenhuma tela a usava.

## Segurança

| Camada | Como |
|---|---|
| Banco | `profiles` não tem RLS, e o grant de coluna vale para qualquer linha: qualquer jogador logado consegue gravar o `avatar_url` de qualquer perfil. A tela só grava a própria linha. |
| Cliente | Só IDs do catálogo (`hc-av-NN`) viram imagem; o valor lido do banco nunca vai cru para o HTML. Se a foto passar a aparecer para outros jogadores, vale uma policy de UPDATE restrita à própria linha. |
| Dados | As URLs de download dos retratos levam o identificador da conta que gerou e ficam fora do git (`scripts/avatares/origens.local.txt`, no `.gitignore`). |

## Testes

- `tests/verify-avatar-picker-e2e.js` (`npm run test:avatar`) bloqueia `*.supabase.co` e cobre catálogo × arquivos, formato dos cartões, escolha antes do tutorial, troca no Perfil, "Decidir depois", compatibilidade com as outras suítes, logout com a tela aberta e celular, com 0 strikes no IntegrityGuard. Cada cenário roda num contexto próprio.
- As 8 suítes existentes passam no `main` (d39bb6c, #134) e nesta branch, com o navegador sem resolver `*.supabase.co`.
- A conferência de formato dos cartões foi validada tirando a correção da grade: sem ela, a suíte falha.

## Pendências

- 45 retratos (`hc-av-26` a `hc-av-70`) aguardam crédito no gerador. Para gerar: um job por vez, `montar_avatares.py registrar <relatório>` e depois `montar <pasta dos originais>`.
- Bug do 1 Clique, encontrado e não corrigido aqui: com uma sessão salva, o jogo entra sozinho ao carregar (`index.html:3959`); se o jogador entrar com outro nome antes dessa hidratação terminar, `applyMasterSnapshot` grava o snapshot da conta antiga no uid da nova (`src/js/online-cloud-pvp-engine.js:807`).
