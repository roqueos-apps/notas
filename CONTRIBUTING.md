# Contributing

_[Português](docs/pt-BR/CONTRIBUTING.md) | English_

Thanks for wanting to help. The organization-wide guide is the [roqueos-apps CONTRIBUTING](https://github.com/roqueos-apps/.github/blob/main/CONTRIBUTING.md); here goes only what belongs to Notes.

## How to contribute

1. Open an issue before changing what people see or what a note stores. A small fix can go straight to the pull request.
2. Fork, create a branch and run `yarn install --ignore-scripts`.
3. Every commit carries `Signed-off-by` (`git commit -s`, the DCO). The pull request's `dco` check fails without it; `git rebase --signoff main` fixes a branch that missed it.
4. Every fix comes with a test that fails without it. What an action writes goes into `test/app.spec.js`, call by call.
5. **A note is a RoqueOS desktop sticky note.** Never write the whole note, nor the position (`x`, `y`), size (`width`, `height`) or layer (`zIndex`) of an existing note: those belong to the sticky note. A new field is additive (the sticky note ignores what it does not know); renaming or changing the meaning of an existing one erases what people had.
6. New text goes into all ten `i18n/*.json`, with the same keys. `app check` fails if a language is missing one.
7. Changed a feature or a test cited in `paridade.json`? Update the inventory in the same commit.
8. Run `yarn verificar` before opening the pull request. It is what CI runs. `yarn dev` opens Notes in a fake RoqueOS window with a local account.

Never change the `id` in `app.json` (`notes`) or the collection name (`notas`): RoqueOS finds the windows, shortcuts and notes of people already using it by them.

## Language

Code, comments and commit messages are in Brazilian Portuguese. Issues and pull requests in English are welcome. The documentation is in English in `docs/`, with the Portuguese pair in `docs/pt-BR/`; a change of behavior updates both in the same pull request ([docs/INDEX.md](docs/INDEX.md)).

By taking part you agree to the [code of conduct](CODE_OF_CONDUCT.md).
