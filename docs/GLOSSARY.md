# Glossary

_[Português](pt-BR/GLOSSARIO.md) | English_

> **For whom:** whoever reads the code or the issues and meets a word that means something specific here.
> **What is here:** each term as it appears in the code, what it is, and where it lives.
> **Where to go for the rest:** how the pieces fit, [ARCHITECTURE.md](ARCHITECTURE.md); exact values, [REFERENCE.md](REFERENCE.md).

The code is in Portuguese, so most terms are Portuguese words.

| Term                      | What it is                                                                                                            | Where                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `sistema`                 | the object RoqueOS (or the SDK's dev or fake system) passes to `montar`; the only door to the outside                 | [`src/index.js`](../src/index.js)                           |
| capability (`capacidade`) | a named part of the `sistema`; optional ones must be listed in `app.json`                                             | [`app.json`](../app.json)                                   |
| `colecoes`                | capability that opens a collection kept in the person's account                                                       | [`src/useNotas.js`](../src/useNotas.js)                     |
| `notas` (collection)      | the collection name; RoqueOS maps it to `users/{uid}/desktop_postits`                                                 | [`src/useNotas.js`](../src/useNotas.js)                     |
| `abertura`                | capability that says which note to open (`{ nota }`), and tells when another sticky note is clicked                   | [`src/useNotas.js`](../src/useNotas.js)                     |
| `ia`                      | capability that opens the system AI panel over the note text                                                          | [`src/useNotas.js`](../src/useNotas.js)                     |
| `arquivos`                | capability that saves a file to Documents in the Files app                                                            | [`src/useNotas.js`](../src/useNotas.js)                     |
| `armazenamento`           | the app's key-value storage, used for preferences                                                                     | [`src/notas.js`](../src/notas.js)                           |
| post-it, sticky note      | the desktop representation of a note, owned by RoqueOS; same document as the note                                     | [`src/notas.js`](../src/notas.js)                           |
| mesa                      | "desk", the RoqueOS desktop; `showOnDesktop` decides whether the note shows there                                     | [`src/useNotas.js`](../src/useNotas.js)                     |
| `markdownSeguro`          | the only path from note text to `v-html`: `marked` then DOMPurify                                                     | [`src/markdown.js`](../src/markdown.js)                     |
| `?raw`                    | Vite suffix that imports a file as text; used for every JSON                                                          | [`src/textos.js`](../src/textos.js)                         |
| modo leve                 | the light profile of a weak device (`sistema.desempenho.modoLeve()`); no blur, no animated mesh                       | [`src/notas.scss`](../src/notas.scss)                       |
| `app check`               | the SDK command that checks the repository against the contract                                                       | [`package.json`](../package.json)                           |
| `yarn verificar`          | the gate: lint, format, tests, `app check`                                                                            | [`package.json`](../package.json)                           |
| paridade                  | the inventory of what the app did inside RoqueOS and what happened to each item; states `mantida`, `mudou`, `perdida` | [`paridade.json`](../paridade.json)                         |
| sistema falso             | the SDK's fake system for tests, with `semear` and `guardado`                                                         | [`test/app.spec.js`](../test/app.spec.js)                   |
| janela falsa              | the fake RoqueOS window of `yarn dev`                                                                                 | [`dev/main.js`](../dev/main.js)                             |
| primeira-parte            | the app's layer in `app.json`: first party, all ten languages required                                                | [`app.json`](../app.json)                                   |
| DCO                       | Developer Certificate of Origin; the `Signed-off-by` line every commit carries                                        | [`.github/workflows/dco.yml`](../.github/workflows/dco.yml) |
