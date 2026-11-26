# Integrations

_[Português](pt-BR/INTEGRACOES.md) | English_

> **For whom:** whoever changes RoqueOS, the desktop sticky note or the SDK, and needs to know what Notes expects and offers.
> **What is here:** what the package exports, the capabilities it calls and how, the shared document with the sticky note, the opening payload, the parity file RoqueOS reads.
> **Where to go for the rest:** field by field, [REFERENCE.md](REFERENCE.md); why it is shaped this way, [ARCHITECTURE.md](ARCHITECTURE.md).

Notes has no API, CLI or webhook. Its outward surface is the package RoqueOS installs and the document it shares with the desktop.

## Table of contents

1. [The package](#1-the-package)
2. [Capabilities used](#2-capabilities-used)
3. [The shared document](#3-the-shared-document)
4. [Opening a note](#4-opening-a-note)
5. [The parity file](#5-the-parity-file)

## 1. The package

| Export        | File                              | What RoqueOS does with it                                                                                                  |
| ------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `.` (default) | [`src/index.js`](../src/index.js) | the app from `definirApp`: `id: 'notes'`, `capacidades`, `mount(el, sistema, { ativo })` returning `{ ativar, desmontar }` |
| `./app.json`  | [`app.json`](../app.json)         | the registry entry: names, icon, color, category, window                                                                   |

`CAPACIDADES` is also a named export of `src/index.js`.

## 2. Capabilities used

| Capability      | Call                                                                                                        | Notes                                                      |
| --------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `colecoes`      | `abrir('notas')`, then `observar(ok, erro)`, `criar(id, campos)`, `atualizar(id, campos)`, `apagar(id)`     | `atualizar` replaces only the fields sent                  |
| `ia`            | `abrirPainel({ ancora, tipo: 'text', contexto, aplicar, acento, titulo, aoFechar })` returning `{ fechar }` | the result comes back through `aplicar(texto)`             |
| `arquivos`      | `salvar({ nome, conteudo, tipo })`                                                                          | Markdown, `text/markdown`                                  |
| `abertura`      | `atual()`, `aoMudar(fn)`                                                                                    | see section 4                                              |
| `idioma`        | `atual()`, `aoMudar(fn)`                                                                                    | the latest request wins when two loads return out of order |
| `desempenho`    | `modoLeve()`                                                                                                | read once on mount                                         |
| `avisar`        | `avisar(mensagem, { tipo, titulo })`                                                                        | `sucesso`, `info`, `aviso`, `erro`                         |
| `armazenamento` | `ler(chave)`, `gravar(chave, valor)`                                                                        | the key `preferencias`                                     |
| `identidade`    | `atual().uid`                                                                                               | no `uid` means guest                                       |

The first four are optional and declared in `app.json`; a host without one of them makes `mount` throw with the missing name (test `não monta num sistema sem as capacidades que pede, e diz quais faltam` in [`test/app.spec.js`](../test/app.spec.js)). Errors come as an object with `codigo`; Notes treats `sem-conta` as "sign in" and everything else as a generic failure ([`src/useNotas.js`](../src/useNotas.js)).

## 3. The shared document

The desktop sticky note and Notes write the same document. The split is the contract, and changing it breaks the other side silently:

```text
desktop owns  : x, y, width, height, zIndex, color (after create)
Notes owns    : title, content, pinned, tags, showOnDesktop
system stamps : criadoEm, atualizadoEm
```

New fields are additive: the sticky note ignores what it does not know. Renaming or changing the meaning of an existing field erases what people had ([`CONTRIBUTING.md`](../CONTRIBUTING.md)).

## 4. Opening a note

```json
{ "nota": "note_1727400000000" }
```

The sticky note that opens Notes sends this. With the window already open, a new request through `aoMudar` saves and closes the open note and opens the requested one. An id that is not in the list yet is kept until the list brings it.

## 5. The parity file

[`paridade.json`](../paridade.json) ships in the package (`files`), and RoqueOS checks it before accepting a version, with `scripts/paridade-dos-apps.mjs` of `roqueos-front`. Format version `1`; each item has `o_que`, `estado` (`mantida`, `mudou`, `perdida`), and `testes` (`test/<file> › <exact title>`) or `evidencia`; `mudou` needs `nota`, `perdida` needs `decisao`. On 18/11/2026 it has 52 items: 39 `mantida`, 13 `mudou`, 0 `perdida`.
