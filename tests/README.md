# Suítes Automatizadas E2E — Hacker City Web

Com o servidor HTTP local ativo na porta `8080` (`python3 -m http.server 8080`), execute as suítes Puppeteer abaixo para validar regressões, sincronia MMO multi-aba e o novo treinamento unificado:

```bash
# 1. Novo Treinamento Unificado (Universidade + Tour 14 Passos + Trilha 6 Etapas c/ 8s/15m)
NODE_PATH=../pague-on-old/node_modules node tests/verify-new-onboarding-training.js

# 2. Mercado Global MMO Multi-Aba (Alpha + Bravo + Charlie) & Desbloqueio Progressivo
NODE_PATH=../pague-on-old/node_modules node tests/verify-mmo-global-and-unlocks.js

# 3. Matriz Completa de 8 Resoluções Mobile, Paisagem & Tablet (320x568 a 844x390 + 768x1024 + Tour 14 Passos)
NODE_PATH=../pague-on-old/node_modules node tests/verify-mobile-responsiveness-e2e.js

# 4. Escudo de Novato de 24 Horas & Regra Anti-Abuso PvP (Multi-Aba Veterano vs. Novato)
NODE_PATH=../pague-on-old/node_modules node tests/verify-newbie-24h-shield-e2e.js

# 5. Novas Mecânicas de Retenção, PWA Mobile, Paleta Rápida ⚡ & Unificação PvP (PRs #92 a #97)
NODE_PATH=../pague-on-old/node_modules node tests/verify-retention-pwa-pvp-ideas-e2e.js
```

Critérios obrigatórios em todas as execuções:
- `0` violações no `IntegrityGuard` (`cheatStrikes === 0`)
- `0` estouros horizontais ou colisões de texto em Desktop (`1366x860` / `1200x800`) e nas 8 resoluções Mobile/Paisagem/Tablet (`320x568`, `360x800`, `375x667`, `390x844`, `412x915`, `430x932`, `844x390` e `768x1024`)
- `0` sobreposições entre `#hcTourCard` e `#hcTourRing` nos 14 passos do Tour Guiado
- Preservação integral da regra de `15 minutos` (`900.000ms`) após o bônus único do 1º lote de treino (`8.000ms`).
