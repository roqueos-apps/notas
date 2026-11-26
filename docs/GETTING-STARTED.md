# Getting started

_[Português](pt-BR/COMECAR.md) | English_

> **For whom:** whoever just cloned the repository and wants to see Notes running and the gate green.
> **What is here:** prerequisites with the command that checks each one, the install, the first visible result in `yarn dev`, the gate, and the first-time errors.
> **Where to go for the rest:** what each command does is in [REFERENCE.md](REFERENCE.md); errors beyond the first time, in [WHEN-IT-BREAKS.md](WHEN-IT-BREAKS.md).

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Install](#2-install)
3. [See it running](#3-see-it-running)
4. [Run the gate](#4-run-the-gate)
5. [First-time errors](#5-first-time-errors)

## 1. Prerequisites

| Tool | Version                                   | Check           |
| ---- | ----------------------------------------- | --------------- |
| Node | 22 or newer (`engines`); `.nvmrc` says 24 | `node -v`       |
| Yarn | 1.22 (`packageManager: yarn@1.22.22`)     | `yarn -v`       |
| Git  | any recent one                            | `git --version` |

No account, no Firebase and no RoqueOS checkout are needed: the SDK brings a development system that runs the app alone in the browser.

## 2. Install

```bash
git clone https://github.com/roqueos-apps/notas.git
cd notas
yarn install --ignore-scripts
```

`--ignore-scripts` keeps any dependency's install script from running; `app check` already fails a repository that declares one. It worked when yarn ends with `Done in`. The two `@roqueos-apps/*` dependencies come by HTTPS from GitHub tags (`github:roqueos-apps/app-sdk#v0.2.0`, `github:roqueos-apps/ui#v0.6.0`), so no SSH key is needed.

## 3. See it running

```bash
yarn dev
```

Vite prints a local address; open it. You see Notes inside a fake RoqueOS window with a language selector, signed in to a local account. Click **Nova Nota** (or the plus icon in a narrow window), type a title and some Markdown, switch to **Dividido** to see text and preview side by side. Reload with F5: the note is still there, because the development system keeps the collection in `localStorage`.

Try the URL parameters from [REFERENCE.md](REFERENCE.md#4-url-parameters-of-yarn-dev): `?idioma=ar-AR` for right to left, `?convidado=1` to see that creating a note without an account warns instead of pretending. The AI button shows a notice where the RoqueOS panel would open, and **Salvar em Arquivos** becomes a download ([README](../README.md)).

## 4. Run the gate

```bash
yarn verificar
```

It runs lint, Prettier, the tests and `app check`, the same as CI. It worked when it ends with these lines (measured on 18/11/2026: 5 test files, 36 tests):

```text
 Test Files  5 passed (5)
      Tests  36 passed (36)
...
ok, o repo cumpre o contrato.
```

`ok, o repo cumpre o contrato.` means "ok, the repository meets the contract". Before a pull request, this is the command that has to be green; then read [CONTRIBUTING.md](../CONTRIBUTING.md) for the DCO sign-off.

## 5. First-time errors

| What you see                                                   | Cause                                                                   | What to do                                                                                                  |
| -------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `Permission denied (publickey)` during install                 | an old lockfile or fork still pins a dependency by `git+ssh`            | use the `github:` pins of `package.json` on `main`; see [WHEN-IT-BREAKS.md](WHEN-IT-BREAKS.md#1-installing) |
| `The engine "node" is incompatible with this module`           | Node older than 22                                                      | `nvm use` (reads `.nvmrc`)                                                                                  |
| `Code style issues found` from `yarn format:check`             | a file, often a Markdown you edited, is not in Prettier's format        | `yarn format`, then commit the result                                                                       |
| `yarn dev` opens in a language you did not expect              | without `?idioma=`, the development system follows the browser language | add `?idioma=pt-BR` (or any of the ten) to the URL                                                          |
| creating a note shows `Entre na sua conta para guardar notas.` | you opened with `?convidado=1`                                          | remove the parameter                                                                                        |
