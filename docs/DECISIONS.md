# Decisions

_[Português](pt-BR/DECISOES.md) | English_

> **For whom:** whoever, person or agent, is about to "simplify" something that looks arbitrary.
> **What is here:** what is settled and does not get reopened, with the date and the reason.
> **Where to go for the rest:** the design decisions with their rejected alternatives are in [ARCHITECTURE.md](ARCHITECTURE.md#8-design-decisions).

Dates are when the decision took effect in this repository; 27/09/2026 is the day Notes left the RoqueOS core, v0.1.0.

| Decision                                                                                 | Since      | Why it does not get reopened                                                                                                    |
| ---------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| The `id` in `app.json` is `notes`, forever                                               | 27/09/2026 | RoqueOS finds windows, shortcuts and the notes of people already using it by this id ([`CONTRIBUTING.md`](../CONTRIBUTING.md))  |
| The collection name is `notas`, forever                                                  | 27/09/2026 | it is the name RoqueOS maps to the account; another name is an empty list for everyone                                          |
| The sort values are `updatedAt`, `createdAt`, `title`                                    | 27/09/2026 | they are what people's saved preferences contain; internally they point to the system dates ([`src/notas.js`](../src/notas.js)) |
| A note is a desktop sticky note                                                          | 27/09/2026 | the same document; Notes never writes position, size or layer of an existing note                                               |
| Each action writes only its field                                                        | 27/09/2026 | the whole-note write undid sticky note drags                                                                                    |
| Imports are limited to `vue`, `app-sdk`, `ui`, `marked`, `dompurify` and this repository | 27/09/2026 | `app check` and RoqueOS's check enforce it ([`CLAUDE.md`](../CLAUDE.md))                                                        |
| `marked` and `dompurify` at the exact RoqueOS version                                    | 27/09/2026 | one copy inside RoqueOS                                                                                                         |
| JSON enters as `?raw` plus `JSON.parse`                                                  | 27/09/2026 | RoqueOS's build breaks on direct JSON imports                                                                                   |
| Note text reaches the screen only through `markdownSeguro`                               | 27/09/2026 | the app runs on the RoqueOS origin                                                                                              |
| Theme only from the SDK contract variables; app colors `--notas-*`                       | 27/09/2026 | `--ros-` belongs to the system; `app check` fails a declaration                                                                 |
| Nothing lost in the move without a written decision                                      | 28/09/2026 | the founder asked that no feature be lost; `paridade.json` and RoqueOS's check hold it                                          |
| Every commit signed off (DCO)                                                            | 27/09/2026 | the `dco` workflow fails without it                                                                                             |
| Code, comments and commits in Brazilian Portuguese                                       | 27/09/2026 | the house language ([`CLAUDE.md`](../CLAUDE.md)); issues and pull requests in English are welcome                               |
