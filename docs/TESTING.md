# Testing

_[Português](pt-BR/TESTES.md) | English_

> **For whom:** whoever adds a feature or a fix and needs to know which test to write and what the gate proves.
> **What is here:** the gate step by step, what each suite proves, how a test sees the writes, the acceptance criteria and what no test covers.
> **Where to go for the rest:** the commands, [REFERENCE.md](REFERENCE.md); a failing step, [WHEN-IT-BREAKS.md](WHEN-IT-BREAKS.md).

## Table of contents

1. [The gate](#1-the-gate)
2. [The suites](#2-the-suites)
3. [How a test sees what the app writes](#3-how-a-test-sees-what-the-app-writes)
4. [Acceptance criteria](#4-acceptance-criteria)
5. [What no test covers](#5-what-no-test-covers)

## 1. The gate

```bash
yarn verificar
```

| Step                | Proves                                                                      |
| ------------------- | --------------------------------------------------------------------------- |
| `yarn lint`         | ESLint recommended plus Vue essential, and no component used without import |
| `yarn format:check` | every file, Markdown included, is in Prettier's format                      |
| `yarn test`         | the five Vitest suites below                                                |
| `yarn app:check`    | the eight sections of the SDK contract                                      |

The same command runs on GitHub Actions for every push to `main` and every pull request. Measured on 18/11/2026: 36 tests in 5 files, all passing.

## 2. The suites

| Suite                                                             | Tests | Proves                                                                                                                                                                                                                               |
| ----------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`test/app.spec.js`](../test/app.spec.js)                         | 16    | the app through the SDK: manifest and capabilities match, refusal without a capability, the list, create, guest, typing, outside changes, pin/tag/desktop, delete, opening by sticky note, AI, Files, preferences, sign out, unmount |
| [`test/notas.spec.js`](../test/notas.spec.js)                     | 14    | the pure logic: sort, search, tags, card preview and date, new note, tag cleanup, export, toolbar, preferences                                                                                                                       |
| [`test/markdown.spec.js`](../test/markdown.spec.js)               | 4     | line breaks and GFM, no script/handler/`javascript:`, global `marked` untouched, empty input                                                                                                                                         |
| [`test/troca-de-idioma.spec.js`](../test/troca-de-idioma.spec.js) | 1     | the last language requested wins when loads return out of order                                                                                                                                                                      |
| [`test/estilo.spec.js`](../test/estilo.spec.js)                   | 1     | every `env(safe-area-inset-bottom)` sits behind `var(--safe-area-inset-bottom, …)`                                                                                                                                                   |

[`test/preparar.js`](../test/preparar.js) adds the `ResizeObserver` and `matchMedia` jsdom lacks and unmounts every component after each test.

## 3. How a test sees what the app writes

`montar()` in `app.spec.js` builds the SDK fake system and wraps `colecoes.abrir` so each `criar`, `atualizar` and `apagar` is pushed to a `gravacoes` list. A test then asserts the exact list, call by call. That is how "each action writes only its field" is a test and not a promise: a write that carries one field more fails.

## 4. Acceptance criteria

- `yarn verificar` exits 0, locally and in CI.
- Every fix comes with a test that fails without it; a new check is proven by mutation ([`CLAUDE.md`](../CLAUDE.md)).
- What an action writes goes into `test/app.spec.js`, call by call ([`CONTRIBUTING.md`](../CONTRIBUTING.md)).
- A test cited in [`paridade.json`](../paridade.json) keeps its exact title, or the inventory changes in the same commit; RoqueOS matches titles literally.
- A visible change is also opened in `yarn dev`, with a screenshot ([`.claude/loop.md`](../.claude/loop.md)).

## 5. What no test covers

From the audit in `paridade.json` and the code: the narrow-window layout, the link between the search field and the list, a failed create, the order after pinning, two real devices syncing, the real iPhone, the Launchpad and the dock labels. These are stated as not measured, not as working.
