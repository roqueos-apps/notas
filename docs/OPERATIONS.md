# Operations

_[Português](pt-BR/OPERACAO.md) | English_

> **For whom:** the maintainer, and whoever cuts a release or keeps the repository healthy.
> **What is here:** the maintenance routine, how a version reaches RoqueOS, updating dependencies without breaking, undoing a release, where the data is and what to watch.
> **Where to go for the rest:** when something fails, [WHEN-IT-BREAKS.md](WHEN-IT-BREAKS.md); the commands, [REFERENCE.md](REFERENCE.md).

## Table of contents

1. [What runs and where](#1-what-runs-and-where)
2. [The maintenance routine](#2-the-maintenance-routine)
3. [Cutting a release](#3-cutting-a-release)
4. [Updating without breaking](#4-updating-without-breaking)
5. [Undoing](#5-undoing)
6. [Data and backup](#6-data-and-backup)
7. [What to watch](#7-what-to-watch)

## 1. What runs and where

Nothing of this repository runs on a schedule. The app runs inside RoqueOS, in the browser of whoever uses it. What runs here is the gate: on your machine (`yarn verificar`, and the kit's `pre-push` hook when installed) and on GitHub Actions on every push to `main` and every pull request, forks included ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)), plus the `dco` workflow on pull requests ([`.github/workflows/dco.yml`](../.github/workflows/dco.yml)). Neither workflow reads a secret.

## 2. The maintenance routine

The routine is written for agents in [`.claude/loop.md`](../.claude/loop.md), one item per pass, stopping at the first with work:

1. Local gate red: fix it and paste the output.
2. GitHub CI red: `gh run list --limit 3`. Red there and green here is a divergent environment, investigated before anything else.
3. Pull request without `Signed-off-by`: answer with the fix command, `git rebase --signoff main`.
4. Outside issue or pull request without an answer: `gh issue list`, `gh pr list`.
5. Asset without origin in `ASSETS.md`.
6. SDK behind: a new `app-sdk` tag with a capability this app uses becomes a bump.
7. Docs drift: README, CONTRIBUTING and `app.json` say the same thing about what the app does, its capabilities and languages.

```bash
yarn verificar
gh run list --limit 3
gh issue list
gh pr list
```

A visible change does not close without the app opened for real in `yarn dev`, with a screenshot, and in RoqueOS when the change gets there ([`.claude/loop.md`](../.claude/loop.md)).

## 3. Cutting a release

RoqueOS installs Notes as a git dependency pinned to an exact tag. On 18/11/2026 `roqueos-front` pins `git+ssh://git@github.com/roqueos-apps/notas.git#v0.1.2`, and its test `apps-fora-do-nucleo.spec.js` accepts only `github:` or `git+ssh` with a `vX.Y.Z` tag, never a branch or a loose commit. The tags so far are `v0.1.0`, `v0.1.1` and `v0.1.2`.

No release script exists in this repository. What the tags and [`CHANGELOG.md`](../CHANGELOG.md) show is this order:

```bash
# on a branch, with the change merged into main through a pull request
yarn verificar
# bump "version" in package.json and move [Não lançado] into a dated section of CHANGELOG.md
git commit -s -m "versao 0.1.3"
git tag v0.1.3          # on a commit that is already on main
git push origin v0.1.3
```

The tag goes on a commit that is already on `main`. The `app-sdk` enforces this with a `tag` workflow; this repository has no such workflow, so here it is discipline.

Then, in RoqueOS, the pin moves to the new tag and its checks run, among them the parity of [`paridade.json`](../paridade.json) read from the installed package: a cited test that no longer exists, an unknown state or a loss without a written decision fails. You can run the same check before tagging, from a RoqueOS checkout next to this one: `node scripts/paridade-dos-apps.mjs ../notas`.

Changed a feature or a test cited in `paridade.json`? Update the inventory in the same commit ([README](../README.md)).

## 4. Updating without breaking

| Dependency              | Rule                                                                                | Why                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `marked`, `dompurify`   | exact version, the same as RoqueOS                                                  | inside RoqueOS yarn deduplicates them with the system's copy ([`CLAUDE.md`](../CLAUDE.md)) |
| `@roqueos-apps/app-sdk` | by tag; bump only with `yarn verificar` green and the changelog saying what changed | the contract; a capability the system lacks makes `mount` refuse                           |
| `@roqueos-apps/ui`      | by tag, through `github:`                                                           | `git+ssh` did not install on Actions (29/09/2026)                                          |
| anything new            | with `yarn.lock` in the same diff, judged by the kit's `supply-chain-reviewer`      | what the app pulls runs on the RoqueOS origin                                              |

The app imports only `vue`, `@roqueos-apps/app-sdk`, `@roqueos-apps/ui`, `marked`, `dompurify` and files of this repository; `app check` and RoqueOS's own check fail anything else ([`CLAUDE.md`](../CLAUDE.md)).

## 5. Undoing

| Step                                         | How to undo                                                                                                                                                            |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a merged change                              | `git revert <commit>` on a branch, pull request, the same gate                                                                                                         |
| a pushed tag that RoqueOS has not pinned yet | cut the next patch tag with the fix; do not move a published tag                                                                                                       |
| a tag RoqueOS already pinned                 | pin RoqueOS back to the previous tag in `roqueos-front`; the commit is locked in its `yarn.lock`, so moving the tag here would not change what it installed            |
| a field renamed by mistake                   | there is no undo for the people who already wrote with the new name; this is why field names, the `id` and the collection are permanent ([DECISIONS.md](DECISIONS.md)) |

## 6. Data and backup

Notes stores no data in this repository. The notes live in the account of each person, in the collection RoqueOS maps to `users/{uid}/desktop_postits`, and their backup is RoqueOS's. Preferences live in the system's app storage. In `yarn dev` everything stays in the browser's `localStorage` under keys `roqueos:notes:*`; clearing the site data resets it.

The code backup is GitHub: every change goes through a pull request on `roqueos-apps/notas`.

## 7. What to watch

| Signal           | Healthy                                                                      | Where                               |
| ---------------- | ---------------------------------------------------------------------------- | ----------------------------------- |
| `yarn verificar` | exits 0; 36 tests in 5 files and 8 `ok` sections of `app check` (18/11/2026) | your machine                        |
| CI               | `verificar` green on `main` and on open pull requests                        | `gh run list --limit 3`             |
| DCO              | `dco` green on every pull request                                            | the pull request checks             |
| Parity           | 52 items, none `perdida` without a decision                                  | [`paridade.json`](../paridade.json) |
| Org page         | the roqueos-apps page shows the current name, description, icon and color    | the kit's `roqueos-perfil-da-org`   |
