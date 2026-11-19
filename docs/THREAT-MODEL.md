# Threat model

_[Português](pt-BR/MODELO-DE-AMEACAS.md) | English_

> **For whom:** whoever reviews a change for security, or wants to know what Notes protects and what it does not.
> **What is here:** what is at stake, who could attack it, each threat with the control and the file that holds it, and what is out of scope.
> **Where to go for the rest:** how to report a vulnerability, [SECURITY.md](../SECURITY.md); how the app is built, [ARCHITECTURE.md](ARCHITECTURE.md).

## Table of contents

1. [What is at stake](#1-what-is-at-stake)
2. [Who could attack](#2-who-could-attack)
3. [Threats and controls](#3-threats-and-controls)
4. [Out of scope](#4-out-of-scope)

## 1. What is at stake

Notes runs **on the same origin as RoqueOS**. Script that runs inside it runs with everything the RoqueOS page can reach: the signed-in session and the other apps. The note text is written by the person, or by another device of theirs, and the preview shows it as HTML. So the asset is less the notes themselves than the RoqueOS session around them.

The notes are the person's data, kept in their account by the system; Notes has no database access of its own.

## 2. Who could attack

| Who                                    | How they would get in                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| Someone who gets text into a note      | a shared or pasted note with HTML or a `javascript:` link, synced from another device |
| A malicious contributor                | a pull request to this public repository, from a fork                                 |
| A compromised or look-alike dependency | a package this app pulls, which RoqueOS then installs on its origin                   |
| A CI workflow abused by a fork         | a workflow that hands the fork a write token or a secret                              |

## 3. Threats and controls

| Threat                                                  | Control                                                                                                                                                                             | Where                                                                                                                  |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| HTML or script in a note runs in RoqueOS                | every note text reaches `v-html` only through `markdownSeguro`, which passes `marked` output through `DOMPurify.sanitize`; the test fails on script, handler and `javascript:` link | [`src/markdown.js`](../src/markdown.js), [`test/markdown.spec.js`](../test/markdown.spec.js)                           |
| A sanitizer bug                                         | `dompurify` pinned to the exact RoqueOS version, raised to 3.4.16 on 08/10/2026 for the mutation-XSS advisories                                                                     | [`package.json`](../package.json), [`CHANGELOG.md`](../CHANGELOG.md)                                                   |
| Notes changes Markdown elsewhere in RoqueOS             | own `Marked` instance, never the global options; tested                                                                                                                             | [`src/markdown.js`](../src/markdown.js)                                                                                |
| The app reaches the database or RoqueOS internals       | `app check` fails a Firebase import or a RoqueOS alias import                                                                                                                       | `app check` sections                                                                                                   |
| The app overwrites what the desktop owns                | each action writes only its field; every write is asserted                                                                                                                          | [`src/useNotas.js`](../src/useNotas.js), [`test/app.spec.js`](../test/app.spec.js)                                     |
| The app sees an AI agent or key                         | the AI panel is the system's; Notes passes a context function and receives text                                                                                                     | [`src/useNotas.js`](../src/useNotas.js)                                                                                |
| An install script runs on a developer's or CI machine   | `--ignore-scripts` everywhere; `app check` fails a repository that declares one                                                                                                     | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)                                                              |
| A fork's pull request gets a write token                | workflows use `pull_request`, never `pull_request_target`, `contents: read`, no secret                                                                                              | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml), [`.github/workflows/dco.yml`](../.github/workflows/dco.yml) |
| A merge nobody reviewed                                 | `CODEOWNERS` routes every change to the maintainer                                                                                                                                  | [`.github/CODEOWNERS`](../.github/CODEOWNERS)                                                                          |
| RoqueOS installs something other than what was reviewed | exact tag, commit locked in RoqueOS's `yarn.lock`                                                                                                                                   | [OPERATIONS.md](OPERATIONS.md#3-cutting-a-release)                                                                     |
| A new dependency with a look-alike name                 | the kit's `supply-chain-reviewer` on any change to `package.json` or `yarn.lock`                                                                                                    | the kit's quality manifest for `app`                                                                                   |

## 4. Out of scope

- **Who can read a note.** The collection rules belong to RoqueOS and its database, not to this repository.
- **The AI provider and what it sees.** The system decides; Notes sends the note text as context when the person opens the panel.
- **Links in the preview going to outside sites.** DOMPurify keeps ordinary `http(s)` links; following one is the person's choice.
- **The `prompt()` used for a link URL** is the browser's dialog; its content goes through the same sanitizer when rendered.
- **Not proven:** no penetration test or fuzzing of the preview was done; the protection is DOMPurify plus the four tests of `markdown.spec.js`.
