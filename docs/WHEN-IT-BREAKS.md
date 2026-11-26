# When it breaks

_[Português](pt-BR/QUANDO-QUEBRA.md) | English_

> **For whom:** whoever is looking at a red gate, a failed install, or a note that did something it should not.
> **What is here:** the first diagnostic command, then symptom, cause and what to do, by area: installing, the gate, the app at runtime, publishing.
> **Where to go for the rest:** how things are supposed to work is in [ARCHITECTURE.md](ARCHITECTURE.md); the routine, in [OPERATIONS.md](OPERATIONS.md).

The tools print in Portuguese. Messages are quoted verbatim, with a short English gloss where it helps.

## Table of contents

1. [Installing](#1-installing)
2. [The gate](#2-the-gate)
3. [The app at runtime](#3-the-app-at-runtime)
4. [Publishing](#4-publishing)

## First, the diagnosis

```bash
node -v && yarn -v
yarn verificar
```

`yarn verificar` stops at the first failing step; the name of the step (`eslint`, `prettier`, `vitest`, `app check`) tells you which table below to read.

## 1. Installing

| What you see                                                        | Cause                                                                                                                                  | What to do                                                                     |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `Permission denied (publickey)`                                     | a dependency pinned by `git+ssh`; GitHub Actions has no key. Happened on 29/09/2026 with the `ui` kit, even with the repository public | pin by `github:owner/repo#vX.Y.Z`, as `package.json` does since v0.1.2         |
| `The engine "node" is incompatible with this module`                | Node older than 22                                                                                                                     | `nvm use`, or install the Node of `.nvmrc`                                     |
| `Your lockfile needs to be updated` in CI                           | `package.json` changed without `yarn.lock`                                                                                             | run `yarn install --ignore-scripts` and commit `yarn.lock` in the same diff    |
| an install script ran, or `app check` fails `scripts de instalação` | a dependency or this `package.json` has a `preinstall`/`postinstall`                                                                   | always install with `--ignore-scripts`; remove the script from this repository |

## 2. The gate

| What you see                                                                                             | Cause                                                                                  | What to do                                                                                               |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `Code style issues found in the above file`                                                              | Prettier also checks Markdown and JSON                                                 | `yarn format`, review, commit                                                                            |
| `REPROVOU  textos nos idiomas` with `i18n/<idioma>.json sem: <chave>` ("missing key")                    | a new text went into `pt-BR.json` and not into the other nine                          | add the key to all ten `i18n/*.json`                                                                     |
| `REPROVOU  capacidades opcionais declaradas` with `usa sistema.<x> sem "<x>" em capacidades no app.json` | the code uses an optional capability not declared in the manifest                      | add it to `capacidades` in `app.json` and to `CAPACIDADES` in `src/index.js`; the test checks both match |
| `REPROVOU  variáveis do sistema no contrato`                                                             | a `var(--ros-…)` outside the contract list, or a `--ros-` variable declared by the app | use only the contract variables; app colors are `--notas-*`                                              |
| `REPROVOU  o app não fala com banco`                                                                     | an import of `firebase/…` in `src/`                                                    | the collection belongs to the system; use `sistema.colecoes`                                             |
| `REPROVOU  o app não importa o RoqueOS`                                                                  | an import of `quasar` or a RoqueOS alias (`src/`, `stores/`, `boot/`…)                 | what the app needs comes through the `sistema`; primitives come from `@roqueos-apps/ui`                  |
| a test in `app.spec.js` fails comparing the list of writes                                               | an action now writes a field that is not its own, or the whole note                    | write only the changed field; never `x`, `y`, `width`, `height`, `zIndex` of an existing note            |
| `vue/no-undef-components`                                                                                | a component used in a template without import                                          | import it from `@roqueos-apps/ui`; outside RoqueOS there is no global Quasar                             |

## 3. The app at runtime

| What you see                                                                                                                     | Cause                                                                                                                    | What to do                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a sticky note dragged on the desktop jumps back while the note is open in Notes                                                  | a write sent the whole note with the old position. This was the RoqueOS of before the move, fixed in v0.1.0 (27/09/2026) | find the write that sends more than its field; `test/app.spec.js` should already fail                                                                                   |
| the AI result replaced the text of another note                                                                                  | the agent finished after the person switched notes. Fixed in v0.1.1 (28/09/2026)                                         | `aplicar` must check the open note id is the one sent ([`src/useNotas.js`](../src/useNotas.js))                                                                         |
| on the iPhone app, the list or editor footer sits under the gesture bar                                                          | `env(safe-area-inset-bottom)` used alone. Fixed in v0.1.1                                                                | use `var(--safe-area-inset-bottom, env(…))`; `test/estilo.spec.js` checks it                                                                                            |
| toast `Entre na sua conta para guardar notas.` ("sign in to keep notes")                                                         | no account (guest), or the system returned the code `sem-conta`                                                          | sign in; in `yarn dev`, remove `?convidado=1`                                                                                                                           |
| toast `Não foi possível concluir a operação. Tente novamente.` and `[notas] gravação recusada:` in the console                   | the system refused a write with another code (`sem-permissao`, `sem-rede`, `colecao-desconhecida`…)                      | read the `codigo` in the console object; the codes are in the SDK's `src/erros.js`                                                                                      |
| `[notas] textos do idioma` in the console                                                                                        | the language JSON did not load                                                                                           | the app falls back to `pt-BR` for an unknown language; a load error for a known one is a build problem, check the `?raw` imports in [`src/textos.js`](../src/textos.js) |
| `[notes] o sistema não cumpre o contrato: falta a capacidade "ia"` ("the system does not meet the contract: capability missing") | the host lacks a capability the app declares                                                                             | a RoqueOS older than the SDK this version needs; update RoqueOS, not the app                                                                                            |

## 4. Publishing

| What you see                                                                                                      | Cause                                                                                                              | What to do                                                           |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `::error::commit <sha> sem Signed-off-by. Refaça com: git commit --amend -s (ou git rebase --signoff)`            | a commit without DCO sign-off                                                                                      | `git rebase --signoff main` and push the branch again                |
| RoqueOS refuses the new version citing `paridade.json`, for example `test/app.spec.js não tem o teste "<título>"` | a test cited in the inventory was renamed or removed                                                               | update `paridade.json` in the same commit as the test                |
| RoqueOS refuses with `perdida sem "decisao"`                                                                      | an item marked lost without who decided, when and where it is written                                              | write the decision, or keep the feature                              |
| `[reprovado] nao li a vitrine publicada de roqueos-apps` from `roqueos-perfil-da-org`                             | no `gh` or no read access to the org's `.github` repository. Seen on 18/11/2026 in a session without GitHub access | run with `gh` signed in; not reading is not approving                |
| `roqueos-perfil-da-org` says a field does not match                                                               | `app.json` changed name, description, icon or color and the org page did not                                       | `node scripts/gerar.mjs` in the org's `.github` repository, and push |
