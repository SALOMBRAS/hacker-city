# ⚡ Hacker City — Web Edition (Online Multiplayer)

![Hacker City Badge](https://img.shields.io/badge/Security-Hardened%20Postgres-06b6d4?style=for-the-badge)
![Supabase Badge](https://img.shields.io/badge/Backend-Supabase%20Cloud-10b981?style=for-the-badge)
![Vercel Badge](https://img.shields.io/badge/Deploy-Vercel%20Edge-000000?style=for-the-badge)
![Anti-Cheat](https://img.shields.io/badge/Anti--Cheat-Server--Authoritative-ef4444?style=for-the-badge)

> **Hacker City** é um MMORPG underground simulador de sistema operacional (*HackerOS Web Desktop*) onde você cria sua identidade cibernética, invade servidores na cidade, negocia no Mercado Negro, gerencia carteiras digitais P2P em tempo real e foge de mandados policiais.

---

## 🛡️ Camada de Segurança & Hardening Extremo (Anti-Cheat)

Como o público-alvo são entusiastas de cibersegurança e desenvolvedores, o jogo foi blindado diretamente no **PostgreSQL** para impedir qualquer trapaça via console (`F12`), inspeção de rede ou manipulação de requisições:

1. **Confirmação de E-mail Obrigatória (Supabase Auth):**
   - Criação de contas protegida contra spam e bots com envio de token OTP e verificação de integridade.
2. **Restrição Radical de Privilégios (Revoke Direct Writes):**
   - `REVOKE INSERT, UPDATE, DELETE ON public.wallets FROM authenticated, anon;`
   - `REVOKE INSERT, UPDATE, DELETE ON public.transactions FROM authenticated, anon;`
   - `REVOKE UPDATE ON public.profiles FROM authenticated, anon;`
   - O cliente frontend **não possui permissão** para alterar saldos, transações ou reputação diretamente.
3. **Stored Procedures Server-Authoritative (`SECURITY DEFINER`):**
   - `p2p_transfer`: Transferência bancária atômica protegida com travas de linha (`FOR UPDATE`), verificação de saldo e constraint `CHECK (balance >= 0)`.
   - `hack_network_target`: Validação no servidor de reputação mínima, cálculo de bônus por classe e **cooldown de CPU (4 segundos)** contra scripts de flood/automação.
   - `buy_black_market_item`: Transação segura para compra de ferramentas darknet e propinas policiais.
4. **Trigger Anti-XSS & Anti-Spam no Chat IRC:**
   - Mensagens sanitizadas no banco com remoção de qualquer tag `<...>`, limite de 250 caracteres e flood control de 1.5s entre transmissões.
5. **RegEx Constraints:**
   - Hacker Tags restritas ao padrão `^[a-zA-Z0-9_]{3,20}$`, bloqueando caracteres de escape e tentativas de injeção.

---

## 🎮 Mecânicas & Sistemas do Jogo

- **📟 Terminal CLI:** Shell Bash com comandos reais (`scan`, `hack <ip>`, `banco`, `saldo`, `whoami`, `reputation`, `panic`).
- **🏦 Hacker Bank (P2P Realtime):** Carteiras com padrão `HC-XXXX-XX`. Transferências entre jogadores atualizam o saldo do destinatário instantaneamente via **WebSockets (Supabase Realtime)**.
- **💬 IRC Darknet (`#hackercity-lounge`):** Sala de chat global criptografada para comunicação entre hackers conectados.
- **🎯 Scanner de Rede:** Varredura de alvos com exploits como *EternalBlue*, *SQL Injection* e *Default Credentials*.
- **🌐 Dark Browser:** Compra de kits Zero-Day e passes de suborno policial.
- **🕹️ Cyber Arcade:** Minigames de Damas Brasileiras (com IA) e Cobrinha retrô.
- **🚨 Protocolo 404 (Batida Policial):** Sistema sequencial de pânico. Se for pego pela polícia, o operador cumpre pena, perde seus bens acumulados e reinicia sua carreira no **PC Sucata Inicial (Celeron 800MHz)** mantendo sua **Reputação**.

---

## 🚀 Como Executar Localmente

```bash
# Iniciar servidor local
python3 -m http.server 8080

# Abrir no navegador
xdg-open http://localhost:8080/index.html
```

---

## 🔊 Narração por Voz do Tour Guiado (Acessibilidade)

Cada passo do Tour Guiado tem narração em MP3 (`assets/audio/tutorial/`), servida como arquivo estático: o jogador nunca dispara síntese de voz. O botão **🔊 Voz** no card liga/desliga a narração.

`assets/audio/tutorial/manifest.json` registra a versão de cada passo (hash do texto, versão do áudio, modelo, voz e data). Se o texto de um passo mudar, ou entrar um passo novo, sem o áudio ser regenerado, o jogo **desliga a voz daquele passo** e mostra um aviso para o jogador avisar o desenvolvedor.

```bash
# Depois de mudar qualquer texto do tour: gera só os passos novos ou alterados
OPENROUTER_API_KEY=... npm run gerar:voz

# Confere se todos os passos têm narração em dia (sai 1 se faltar algum)
npm run test:voz
```

---

## 🧑‍💻 Autor
Desenvolvido por **[@SALOMBRAS](https://github.com/SALOMBRAS)**.
