# Decisões

_Português | [English](../DECISIONS.md)_

> **Para quem:** quem, pessoa ou agente, está para "simplificar" algo que parece arbitrário.
> **O que tem aqui:** o que está decidido e não se reabre, com a data e o motivo.
> **Onde ir para o resto:** as decisões de design com a alternativa recusada estão na [ARQUITETURA.md](ARQUITETURA.md#8-decisões-de-design).

As datas são de quando a decisão passou a valer neste repositório; 27/09/2026 é o dia em que as Notas saíram do núcleo do RoqueOS, a v0.1.0.

| Decisão                                                                                  | Desde      | Por que não se reabre                                                                                                                      |
| ---------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| O `id` do `app.json` é `notes`, para sempre                                              | 27/09/2026 | é por ele que o RoqueOS acha as janelas, os atalhos e as notas de quem já usa ([`CONTRIBUTING.md`](CONTRIBUTING.md))                       |
| O nome da coleção é `notas`, para sempre                                                 | 27/09/2026 | é o nome que o RoqueOS mapeia para a conta; outro nome é lista vazia para todo mundo                                                       |
| Os valores de ordem são `updatedAt`, `createdAt`, `title`                                | 27/09/2026 | é o que as preferências salvas das pessoas contêm; por dentro eles apontam para as datas do sistema ([`src/notas.js`](../../src/notas.js)) |
| A nota é um post-it da mesa                                                              | 27/09/2026 | é o mesmo documento; as Notas nunca gravam posição, tamanho nem camada de nota existente                                                   |
| Cada ação grava só o seu campo                                                           | 27/09/2026 | a gravação da nota inteira desfazia o arraste do post-it                                                                                   |
| Os imports se limitam a `vue`, `app-sdk`, `ui`, `marked`, `dompurify` e este repositório | 27/09/2026 | o `app check` e a verificação do RoqueOS garantem ([`CLAUDE.md`](../../CLAUDE.md))                                                         |
| `marked` e `dompurify` na versão exata do RoqueOS                                        | 27/09/2026 | uma cópia só dentro do RoqueOS                                                                                                             |
| JSON entra com `?raw` e `JSON.parse`                                                     | 27/09/2026 | o build do RoqueOS quebra com import de JSON direto                                                                                        |
| Texto de nota só chega à tela pelo `markdownSeguro`                                      | 27/09/2026 | o app roda na origem do RoqueOS                                                                                                            |
| Tema só pelas variáveis do contrato do SDK; cores do app `--notas-*`                     | 27/09/2026 | o `--ros-` é do sistema; o `app check` reprova declarar um                                                                                 |
| Nada se perde na saída sem decisão escrita                                               | 28/09/2026 | o founder pediu que nenhuma funcionalidade se perdesse; o `paridade.json` e a verificação do RoqueOS sustentam                             |
| Todo commit com `Signed-off-by` (DCO)                                                    | 27/09/2026 | o workflow `dco` reprova sem                                                                                                               |
| Código, comentários e commits em português do Brasil                                     | 27/09/2026 | é o idioma da casa ([`CLAUDE.md`](../../CLAUDE.md)); issue e PR em inglês são bem-vindos                                                   |
