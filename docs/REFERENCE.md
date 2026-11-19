# Reference

_[Português](pt-BR/REFERENCIA.md) | English_

> **For whom:** whoever needs one exact name: a command, a file, a field, a key, a URL parameter.
> **What is here:** tables of commands, scripts, files and folders, configuration, URL parameters of `yarn dev`, the note document, the preferences and the language files.
> **Where to go for the rest:** how the pieces fit is in [ARCHITECTURE.md](ARCHITECTURE.md); the contracts other code relies on, in [INTEGRATIONS.md](INTEGRATIONS.md).

Messages printed by the tools are in Portuguese and are quoted verbatim.

## Table of contents

1. [Commands](#1-commands)
2. [Files and folders](#2-files-and-folders)
3. [Configuration](#3-configuration)
4. [URL parameters of yarn dev](#4-url-parameters-of-yarn-dev)
5. [The note document](#5-the-note-document)
6. [Preferences](#6-preferences)
7. [Language files](#7-language-files)
8. [Constants in the code](#8-constants-in-the-code)

## 1. Commands

All from [`package.json`](../package.json), run with yarn 1.22 (`packageManager: yarn@1.22.22`).

| Command                                           | What it does                                                              | Exit code                                    |
| ------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------- |
| `yarn install --ignore-scripts`                   | installs exactly the lockfile, with no install script running             | non zero when a dependency cannot be fetched |
| `yarn install --frozen-lockfile --ignore-scripts` | the same, and fails if `yarn.lock` would change (what CI runs)            | non zero on lockfile drift                   |
| `yarn dev`                                        | `vite`: Notes in a fake RoqueOS window with a local account               | stays running                                |
| `yarn test`                                       | `vitest run`: every `test/**/*.spec.js` in jsdom                          | 1 when a test fails                          |
| `yarn lint`                                       | `eslint .` with [`eslint.config.js`](../eslint.config.js)                 | 1 on an error                                |
| `yarn format`                                     | `prettier --write .`                                                      | 0                                            |
| `yarn format:check`                               | `prettier --check .`, Markdown included                                   | 1 when a file is not formatted               |
| `yarn app:check`                                  | `app check` from the SDK: the contract sections                           | 1 when any section prints `REPROVOU`         |
| `yarn verificar`                                  | `yarn lint && yarn format:check && yarn test && yarn app:check`: the gate | the first failing step's code                |

`app check` prints one line per section; on a green repository, measured on 18/11/2026:

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

## 2. Files and folders

| Path                                                        | What it is                                                  | Who writes                                       | Who reads                                        |
| ----------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| [`app.json`](../app.json)                                   | the manifest                                                | a person, rarely                                 | RoqueOS, `app check`, `yarn dev`, tests          |
| [`paridade.json`](../paridade.json)                         | parity inventory, 52 items                                  | a person, when a feature or a cited test changes | RoqueOS's `paridade-dos-apps.mjs`                |
| [`i18n/`](../i18n/pt-BR.json)                               | screen texts, ten JSON files                                | a person                                         | `src/textos.js`, `app check`                     |
| [`src/`](../src/index.js)                                   | the app                                                     | a person                                         | RoqueOS build, Vite, Vitest                      |
| [`test/`](../test/app.spec.js)                              | Vitest suites and [`test/preparar.js`](../test/preparar.js) | a person                                         | `yarn test`, RoqueOS (cited tests in the parity) |
| [`dev/main.js`](../dev/main.js)                             | the `yarn dev` entry                                        | a person                                         | Vite                                             |
| [`docs/capa.jpg`](capa.jpg)                                 | README cover, not in the package                            | a person                                         | GitHub                                           |
| [`ASSETS.md`](../ASSETS.md)                                 | origin of every file in `public/` (there is none)           | a person                                         | `app check`                                      |
| [`CHANGELOG.md`](../CHANGELOG.md)                           | Keep a Changelog, semver                                    | a person, every release                          | people                                           |
| [`.nvmrc`](../.nvmrc)                                       | Node `24`                                                   | a person                                         | CI (`setup-node`)                                |
| [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)   | workflow `verificar`                                        | a person                                         | GitHub Actions                                   |
| [`.github/workflows/dco.yml`](../.github/workflows/dco.yml) | workflow `dco`                                              | a person                                         | GitHub Actions                                   |
| [`.claude/loop.md`](../.claude/loop.md)                     | maintenance routine for agents                              | a person                                         | Claude Code                                      |
| `node_modules/`                                             | dependencies, ignored by git                                | yarn                                             | everything                                       |

What ships to RoqueOS is the `files` list of `package.json`: `src`, `i18n`, `app.json`, `paridade.json`, `ASSETS.md`, `LICENSE`, `README.md`. `docs/` does not ship.

## 3. Configuration

| Setting                  | Where                                     | Value                                                  | Effect                                                                |
| ------------------------ | ----------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| Node                     | `engines` in `package.json`; `.nvmrc`     | `>=22`; `24`                                           | CI uses `.nvmrc`                                                      |
| Package exports          | `exports` in `package.json`               | `.` → `src/index.js`, `./app.json`                     | what RoqueOS imports                                                  |
| Test environment         | [`vite.config.js`](../vite.config.js)     | `jsdom`, setup `test/preparar.js`, `test/**/*.spec.js` | Vitest                                                                |
| Inline dependency        | `server.deps.inline` in `vite.config.js`  | `/@roqueos-apps\/ui/`                                  | the `ui` kit arrives as `.vue` source and goes through the Vue plugin |
| Lint rule                | [`eslint.config.js`](../eslint.config.js) | `vue/no-undef-components: error`                       | a component used without import fails lint                            |
| Prettier                 | [`.prettierrc`](../.prettierrc)           | no semicolons, single quotes, width 100, LF            | `yarn format:check`                                                   |
| Prettier ignore          | [`.prettierignore`](../.prettierignore)   | `node_modules`, `yarn.lock`, `dist`, `public`          | everything else, docs included, is checked                            |
| `app.json` `janela`      | [`app.json`](../app.json)                 | 900×600, minimum 400×300                               | window size in RoqueOS and `yarn dev`                                 |
| `app.json` `capacidades` | [`app.json`](../app.json)                 | `colecoes`, `ia`, `arquivos`, `abertura`               | optional capabilities the system must provide                         |
| `app.json` `colecoes`    | [`app.json`](../app.json)                 | `notas`                                                | the collection the app opens                                          |

The app has no environment variable.

## 4. URL parameters of yarn dev

Read by the SDK development system ([`dev/main.js`](../dev/main.js) comment, [README](../README.md)).

| Parameter                     | Effect                                                        |
| ----------------------------- | ------------------------------------------------------------- |
| `?idioma=ar-AR`               | opens in that language; Arabic runs right to left             |
| `?leve=1`                     | the light profile of a weak device: no blur, no animated mesh |
| `?convidado=1`                | no account, as a guest sees it                                |
| `?abertura={"nota":"note_1"}` | as a desktop sticky note opens it                             |

## 5. The note document

| Field                      | Type        | Written by Notes | Meaning                                                                        |
| -------------------------- | ----------- | ---------------- | ------------------------------------------------------------------------------ |
| `title`                    | string      | yes              | title, may be empty                                                            |
| `content`                  | string      | yes              | Markdown text                                                                  |
| `color`                    | string      | on create only   | one of eight sticky note colors (`CORES` in [`src/notas.js`](../src/notas.js)) |
| `x`, `y`                   | number      | on create only   | desktop position: `100 + (n·30 mod 200)`, `100 + (n·30 mod 150)`               |
| `width`, `height`          | number      | on create only   | `200`, `200`                                                                   |
| `zIndex`                   | number      | on create only   | `1000 + n`, where `n` is the number of notes                                   |
| `showOnDesktop`            | boolean     | yes              | shown on the desktop; `false` hides it                                         |
| `pinned`                   | boolean     | yes              | pinned on top; old sticky notes may lack it                                    |
| `tags`                     | string[]    | yes              | lowercase, spaces become `-`; old sticky notes may lack it                     |
| `criadoEm`, `atualizadoEm` | number (ms) | never            | stamped by the system                                                          |

The document id is `note_<Date.now()>`, created by Notes.

## 6. Preferences

Stored through `sistema.armazenamento` under the key `preferencias`, as JSON ([`src/notas.js`](../src/notas.js)). In the SDK's key space that is `roqueos:notes:preferencias`.

| Field           | Values                            | Default                       |
| --------------- | --------------------------------- | ----------------------------- |
| `sortBy`        | `updatedAt`, `createdAt`, `title` | `updatedAt`                   |
| `viewMode`      | `list`, `grid`                    | `list`                        |
| `showOnDesktop` | `true`, `false`                   | `true` (applies to new notes) |

An unknown value is ignored and the default stays.

## 7. Language files

| Language               | File                                    |
| ---------------------- | --------------------------------------- |
| Portuguese (canonical) | [`i18n/pt-BR.json`](../i18n/pt-BR.json) |
| English                | [`i18n/en-US.json`](../i18n/en-US.json) |
| Spanish                | [`i18n/es-ES.json`](../i18n/es-ES.json) |
| French                 | [`i18n/fr-FR.json`](../i18n/fr-FR.json) |
| German                 | [`i18n/de-DE.json`](../i18n/de-DE.json) |
| Japanese               | [`i18n/ja-JP.json`](../i18n/ja-JP.json) |
| Chinese                | [`i18n/zh-CN.json`](../i18n/zh-CN.json) |
| Hindi                  | [`i18n/hi-IN.json`](../i18n/hi-IN.json) |
| Russian                | [`i18n/ru-RU.json`](../i18n/ru-RU.json) |
| Arabic                 | [`i18n/ar-AR.json`](../i18n/ar-AR.json) |

Every file has the same keys as `pt-BR.json`; `app check` fails on a missing, extra or empty key.

## 8. Constants in the code

| Name                     | Value                                        | File                                    |
| ------------------------ | -------------------------------------------- | --------------------------------------- |
| `COLECAO`                | `'notas'`                                    | [`src/useNotas.js`](../src/useNotas.js) |
| `ACENTO`                 | `'#f59e0b'`                                  | [`src/useNotas.js`](../src/useNotas.js) |
| `ESPERA_DO_TEXTO_MS`     | `500`                                        | [`src/useNotas.js`](../src/useNotas.js) |
| `CAPACIDADES`            | `['colecoes', 'ia', 'arquivos', 'abertura']` | [`src/index.js`](../src/index.js)       |
| `ORDENS`                 | `['updatedAt', 'createdAt', 'title']`        | [`src/notas.js`](../src/notas.js)       |
| `CHAVE_DAS_PREFERENCIAS` | `'preferencias'`                             | [`src/notas.js`](../src/notas.js)       |
| `IDIOMA_CANONICO`        | `'pt-BR'`                                    | [`src/textos.js`](../src/textos.js)     |
