# Referência

_Português | [English](../REFERENCE.md)_

> **Para quem:** quem precisa de um nome exato: um comando, um arquivo, um campo, uma chave, um parâmetro de URL.
> **O que tem aqui:** tabelas de comandos, scripts, arquivos e pastas, configuração, parâmetros de URL do `yarn dev`, o documento da nota, as preferências e os arquivos de idioma.
> **Onde ir para o resto:** como as peças se ligam está na [ARQUITETURA.md](ARQUITETURA.md); os contratos de que outro código depende, nas [INTEGRACOES.md](INTEGRACOES.md).

As mensagens que as ferramentas imprimem são em português e vão citadas como aparecem.

## Sumário

1. [Comandos](#1-comandos)
2. [Arquivos e pastas](#2-arquivos-e-pastas)
3. [Configuração](#3-configuração)
4. [Parâmetros de URL do yarn dev](#4-parâmetros-de-url-do-yarn-dev)
5. [O documento da nota](#5-o-documento-da-nota)
6. [Preferências](#6-preferências)
7. [Arquivos de idioma](#7-arquivos-de-idioma)
8. [Constantes do código](#8-constantes-do-código)

## 1. Comandos

Todos do [`package.json`](../../package.json), rodados com o yarn 1.22 (`packageManager: yarn@1.22.22`).

| Comando                                           | O que faz                                                               | Código de saída                                    |
| ------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| `yarn install --ignore-scripts`                   | instala exatamente o lockfile, sem rodar script de instalação           | diferente de zero quando uma dependência não baixa |
| `yarn install --frozen-lockfile --ignore-scripts` | o mesmo, e falha se o `yarn.lock` fosse mudar (o que o CI roda)         | diferente de zero com o lockfile divergente        |
| `yarn dev`                                        | `vite`: as Notas numa janela falsa do RoqueOS, numa conta local         | fica rodando                                       |
| `yarn test`                                       | `vitest run`: todo `test/**/*.spec.js` no jsdom                         | 1 quando um teste falha                            |
| `yarn lint`                                       | `eslint .` com o [`eslint.config.js`](../../eslint.config.js)           | 1 com erro                                         |
| `yarn format`                                     | `prettier --write .`                                                    | 0                                                  |
| `yarn format:check`                               | `prettier --check .`, Markdown incluído                                 | 1 quando um arquivo não está formatado             |
| `yarn app:check`                                  | o `app check` do SDK: as seções do contrato                             | 1 quando alguma seção imprime `REPROVOU`           |
| `yarn verificar`                                  | `yarn lint && yarn format:check && yarn test && yarn app:check`: o gate | o código do primeiro passo que falhar              |

O `app check` imprime uma linha por seção; num repo verde, medido em 18/11/2026:

```text
ok        scripts de instalação
ok        manifesto
ok        textos nos idiomas
ok        origem dos assets
ok        o app não fala com banco
ok        o app não importa o RoqueOS
ok        variáveis do sistema no contrato
ok        capacidades opcionais declaradas

ok, o repo cumpre o contrato.
```

## 2. Arquivos e pastas

| Caminho                                                        | O que é                                                              | Quem escreve                                                  | Quem lê                                             |
| -------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------- |
| [`app.json`](../../app.json)                                   | o manifesto                                                          | uma pessoa, raramente                                         | o RoqueOS, o `app check`, o `yarn dev`, os testes   |
| [`paridade.json`](../../paridade.json)                         | inventário de paridade, 52 itens                                     | uma pessoa, quando muda uma funcionalidade ou um teste citado | o `paridade-dos-apps.mjs` do RoqueOS                |
| [`i18n/`](../../i18n/pt-BR.json)                               | textos da tela, dez arquivos JSON                                    | uma pessoa                                                    | `src/textos.js`, `app check`                        |
| [`src/`](../../src/index.js)                                   | o app                                                                | uma pessoa                                                    | o build do RoqueOS, o Vite, o Vitest                |
| [`test/`](../../test/app.spec.js)                              | as suítes do Vitest e o [`test/preparar.js`](../../test/preparar.js) | uma pessoa                                                    | `yarn test`, o RoqueOS (testes citados na paridade) |
| [`dev/main.js`](../../dev/main.js)                             | a entrada do `yarn dev`                                              | uma pessoa                                                    | o Vite                                              |
| [`docs/capa.jpg`](../capa.jpg)                                 | capa do README, fora do pacote                                       | uma pessoa                                                    | o GitHub                                            |
| [`ASSETS.md`](../../ASSETS.md)                                 | origem de todo arquivo em `public/` (não há nenhum)                  | uma pessoa                                                    | `app check`                                         |
| [`CHANGELOG.md`](../../CHANGELOG.md)                           | Keep a Changelog, semver                                             | uma pessoa, a cada release                                    | pessoas                                             |
| [`.nvmrc`](../../.nvmrc)                                       | Node `24`                                                            | uma pessoa                                                    | o CI (`setup-node`)                                 |
| [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)   | workflow `verificar`                                                 | uma pessoa                                                    | GitHub Actions                                      |
| [`.github/workflows/dco.yml`](../../.github/workflows/dco.yml) | workflow `dco`                                                       | uma pessoa                                                    | GitHub Actions                                      |
| [`.claude/loop.md`](../../.claude/loop.md)                     | rotina de manutenção para agentes                                    | uma pessoa                                                    | Claude Code                                         |
| `node_modules/`                                                | dependências, ignoradas pelo git                                     | o yarn                                                        | tudo                                                |

O que vai para o RoqueOS é a lista `files` do `package.json`: `src`, `i18n`, `app.json`, `paridade.json`, `ASSETS.md`, `LICENSE`, `README.md`. `docs/` não vai.

## 3. Configuração

| Ajuste                      | Onde                                         | Valor                                                  | Efeito                                                        |
| --------------------------- | -------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| Node                        | `engines` no `package.json`; `.nvmrc`        | `>=22`; `24`                                           | o CI usa o `.nvmrc`                                           |
| Exports do pacote           | `exports` no `package.json`                  | `.` → `src/index.js`, `./app.json`                     | o que o RoqueOS importa                                       |
| Ambiente de teste           | [`vite.config.js`](../../vite.config.js)     | `jsdom`, setup `test/preparar.js`, `test/**/*.spec.js` | Vitest                                                        |
| Dependência inline          | `server.deps.inline` no `vite.config.js`     | `/@roqueos-apps\/ui/`                                  | o kit `ui` chega como fonte `.vue` e passa pelo plugin do Vue |
| Regra de lint               | [`eslint.config.js`](../../eslint.config.js) | `vue/no-undef-components: error`                       | componente usado sem import reprova o lint                    |
| Prettier                    | [`.prettierrc`](../../.prettierrc)           | sem ponto e vírgula, aspas simples, largura 100, LF    | `yarn format:check`                                           |
| Prettier ignore             | [`.prettierignore`](../../.prettierignore)   | `node_modules`, `yarn.lock`, `dist`, `public`          | todo o resto, docs incluídos, é conferido                     |
| `janela` do `app.json`      | [`app.json`](../../app.json)                 | 900×600, mínimo 400×300                                | tamanho da janela no RoqueOS e no `yarn dev`                  |
| `capacidades` do `app.json` | [`app.json`](../../app.json)                 | `colecoes`, `ia`, `arquivos`, `abertura`               | capacidades opcionais que o sistema tem de oferecer           |
| `colecoes` do `app.json`    | [`app.json`](../../app.json)                 | `notas`                                                | a coleção que o app abre                                      |

O app não tem variável de ambiente.

## 4. Parâmetros de URL do yarn dev

Lidos pelo sistema de desenvolvimento do SDK (comentário do [`dev/main.js`](../../dev/main.js), [README](../../README.pt-BR.md)).

| Parâmetro                     | Efeito                                                             |
| ----------------------------- | ------------------------------------------------------------------ |
| `?idioma=ar-AR`               | abre naquele idioma; o árabe corre da direita para a esquerda      |
| `?leve=1`                     | o perfil leve do aparelho fraco: sem desfoque, sem a malha animada |
| `?convidado=1`                | sem conta, como o convidado vê                                     |
| `?abertura={"nota":"note_1"}` | como o post-it da mesa abre                                        |

## 5. O documento da nota

| Campo                      | Tipo        | As Notas gravam | Sentido                                                                         |
| -------------------------- | ----------- | --------------- | ------------------------------------------------------------------------------- |
| `title`                    | string      | sim             | título, pode ser vazio                                                          |
| `content`                  | string      | sim             | texto em Markdown                                                               |
| `color`                    | string      | só na criação   | uma das oito cores de post-it (`CORES` em [`src/notas.js`](../../src/notas.js)) |
| `x`, `y`                   | number      | só na criação   | posição na mesa: `100 + (n·30 mod 200)`, `100 + (n·30 mod 150)`                 |
| `width`, `height`          | number      | só na criação   | `200`, `200`                                                                    |
| `zIndex`                   | number      | só na criação   | `1000 + n`, em que `n` é o número de notas                                      |
| `showOnDesktop`            | boolean     | sim             | aparece na mesa; `false` esconde                                                |
| `pinned`                   | boolean     | sim             | fixada no topo; post-it antigo pode não ter                                     |
| `tags`                     | string[]    | sim             | minúsculas, espaço vira `-`; post-it antigo pode não ter                        |
| `criadoEm`, `atualizadoEm` | number (ms) | nunca           | carimbados pelo sistema                                                         |

O id do documento é `note_<Date.now()>`, criado pelas Notas.

## 6. Preferências

Guardadas pelo `sistema.armazenamento` na chave `preferencias`, em JSON ([`src/notas.js`](../../src/notas.js)). No espaço de chaves do SDK isso é `roqueos:notes:preferencias`.

| Campo           | Valores                           | Padrão                            |
| --------------- | --------------------------------- | --------------------------------- |
| `sortBy`        | `updatedAt`, `createdAt`, `title` | `updatedAt`                       |
| `viewMode`      | `list`, `grid`                    | `list`                            |
| `showOnDesktop` | `true`, `false`                   | `true` (vale para as notas novas) |

Valor desconhecido é ignorado e o padrão fica.

## 7. Arquivos de idioma

| Idioma               | Arquivo                                    |
| -------------------- | ------------------------------------------ |
| Português (canônico) | [`i18n/pt-BR.json`](../../i18n/pt-BR.json) |
| Inglês               | [`i18n/en-US.json`](../../i18n/en-US.json) |
| Espanhol             | [`i18n/es-ES.json`](../../i18n/es-ES.json) |
| Francês              | [`i18n/fr-FR.json`](../../i18n/fr-FR.json) |
| Alemão               | [`i18n/de-DE.json`](../../i18n/de-DE.json) |
| Japonês              | [`i18n/ja-JP.json`](../../i18n/ja-JP.json) |
| Chinês               | [`i18n/zh-CN.json`](../../i18n/zh-CN.json) |
| Hindi                | [`i18n/hi-IN.json`](../../i18n/hi-IN.json) |
| Russo                | [`i18n/ru-RU.json`](../../i18n/ru-RU.json) |
| Árabe                | [`i18n/ar-AR.json`](../../i18n/ar-AR.json) |

Todo arquivo tem as mesmas chaves do `pt-BR.json`; o `app check` reprova chave faltando, sobrando ou vazia.

## 8. Constantes do código

| Nome                     | Valor                                        | Arquivo                                    |
| ------------------------ | -------------------------------------------- | ------------------------------------------ |
| `COLECAO`                | `'notas'`                                    | [`src/useNotas.js`](../../src/useNotas.js) |
| `ACENTO`                 | `'#f59e0b'`                                  | [`src/useNotas.js`](../../src/useNotas.js) |
| `ESPERA_DO_TEXTO_MS`     | `500`                                        | [`src/useNotas.js`](../../src/useNotas.js) |
| `CAPACIDADES`            | `['colecoes', 'ia', 'arquivos', 'abertura']` | [`src/index.js`](../../src/index.js)       |
| `ORDENS`                 | `['updatedAt', 'createdAt', 'title']`        | [`src/notas.js`](../../src/notas.js)       |
| `CHAVE_DAS_PREFERENCIAS` | `'preferencias'`                             | [`src/notas.js`](../../src/notas.js)       |
| `IDIOMA_CANONICO`        | `'pt-BR'`                                    | [`src/textos.js`](../../src/textos.js)     |
