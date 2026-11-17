# Referência HE2 (Helix e HEBorn)

Análise de dois repositórios do Hacker Experience 2, ambos **arquivados** e sob **AGPL-3.0** (ver autorização abaixo):

| Repositório | O que é | Licença |
|---|---|---|
| [Helix](https://github.com/HackerExperience/Helix) | Backend (Elixir) | AGPL-3.0 |
| [HEBorn](https://github.com/HackerExperience/HEBorn) | Cliente web (Elm 0.18) | AGPL-3.0 |

## Regra deste projeto

A licença pública é **AGPL-3.0**, que obriga o código derivado (inclusive o servidor, pela cláusula de rede) a ser AGPL.
Além da licença pública, o responsável pelo projeto informa que o **autor autorizou por e-mail** copiar e adaptar este material.
O registro está em [`PERMISSIONS.md`](../../PERMISSIONS.md).

Na prática:

1. **A autorização vale para este material**, não para código de terceiros que ele contenha.
2. **Reescrever continua sendo o padrão.** Elixir e Elm não rodam no nosso stack (Postgres e JS), então o valor está nas regras, fórmulas e telas, não no código.
3. **Se algum trecho for copiado literalmente**, ele fica identificado em [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md) com origem e licença.
4. **Nome e marca "Hacker Experience" não entram** no nome do nosso jogo.
5. **Pendência:** o e-mail ainda precisa ser registrado em `PERMISSIONS.md` (data, remetente, trecho e alcance).

## Documentos

1. [Helix: processos e software](./01-helix-processos-software.md)
2. [Helix: rede, bounce, logs, história, eventos e segurança](./02-helix-rede-logs-story-seguranca.md)
3. [HEBorn: UX e fluxo de invasão](./03-heborn-ux.md)

Cada relatório termina com **PRONTO PARA PORTAR** e **ARMADILHAS**.
4. [Game design e specs (GameDesign + specs)](./04-game-design-specs.md)
