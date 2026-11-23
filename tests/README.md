# Suítes Automatizadas E2E — Hacker City Web

Com o servidor HTTP local ativo na porta `8080` (`python3 -m http.server 8080`), execute as suítes Puppeteer abaixo para validar regressões, sincronia MMO multi-aba e o novo treinamento unificado:

```bash
# 1. Novo Treinamento Unificado (Universidade + Tour 14 Passos + Trilha 6 Etapas c/ 8s/15m)
NODE_PATH=../pague-on-old/node_modules node tests/verify-new-onboarding-training.js

# 2. Mercado Global MMO Multi-Aba (Alpha + Bravo + Charlie) & Desbloqueio Progressivo
NODE_PATH=../pague-on-old/node_modules node tests/verify-mmo-global-and-unlocks.js
```

Critérios obrigatórios em todas as execuções:
- `0` violações no `IntegrityGuard` (`cheatStrikes === 0`)
- `0` estouros horizontais ou colisões de texto na Topbar e nas 64 telas/modais
- Preservação integral da regra de `15 minutos` (`900.000ms`) após o bônus único do 1º lote de treino (`8.000ms`).
