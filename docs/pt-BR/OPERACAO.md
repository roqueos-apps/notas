# Operação

_Português | [English](../OPERATIONS.md)_

> **Para quem:** o mantenedor, e quem corta uma release ou mantém o repositório saudável.
> **O que tem aqui:** a rotina de manutenção, como uma versão chega ao RoqueOS, atualizar dependências sem quebrar, desfazer uma release, onde estão os dados e o que acompanhar.
> **Onde ir para o resto:** quando algo falha, o [QUANDO-QUEBRA.md](QUANDO-QUEBRA.md); os comandos, a [REFERENCIA.md](REFERENCIA.md).

## Sumário

1. [O que roda e onde](#1-o-que-roda-e-onde)
2. [A rotina de manutenção](#2-a-rotina-de-manutenção)
3. [Cortar uma release](#3-cortar-uma-release)
4. [Atualizar sem quebrar](#4-atualizar-sem-quebrar)
5. [Desfazer](#5-desfazer)
6. [Dados e backup](#6-dados-e-backup)
7. [O que acompanhar](#7-o-que-acompanhar)

## 1. O que roda e onde

Nada deste repositório roda com horário marcado. O app roda dentro do RoqueOS, no navegador de quem usa. O que roda aqui é o gate: na sua máquina (`yarn verificar`, e o gancho de `pre-push` do kit quando instalado) e no GitHub Actions em todo push na `main` e em todo pull request, de fork inclusive ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)), mais o workflow `dco` nos pull requests ([`.github/workflows/dco.yml`](../../.github/workflows/dco.yml)). Nenhum dos dois lê segredo.

## 2. A rotina de manutenção

A rotina está escrita para agentes no [`.claude/loop.md`](../../.claude/loop.md), um item por passada, parando no primeiro que tiver trabalho:

1. Gate local vermelho: conserte e cole a saída.
2. CI do GitHub vermelho: `gh run list --limit 3`. Vermelho lá e verde aqui é ambiente divergente, e se investiga antes de qualquer outra coisa.
3. Pull request sem `Signed-off-by`: responda com o comando que conserta, `git rebase --signoff main`.
4. Issue ou pull request de fora sem resposta: `gh issue list`, `gh pr list`.
5. Asset sem origem no `ASSETS.md`.
6. SDK atrás: tag nova do `app-sdk` com capacidade que este app usa vira bump.
7. Drift de docs: README, CONTRIBUTING e `app.json` dizem a mesma coisa sobre o que o app faz, as capacidades e os idiomas.

```bash
yarn verificar
gh run list --limit 3
gh issue list
gh pr list
```

Mudança visível não fecha sem o app aberto de verdade no `yarn dev`, com print, e no RoqueOS quando a mudança chega lá ([`.claude/loop.md`](../../.claude/loop.md)).

## 3. Cortar uma release

O RoqueOS instala as Notas como dependência git pinada numa tag exata. Em 18/11/2026 o `roqueos-front` pina `git+ssh://git@github.com/roqueos-apps/notas.git#v0.1.2`, e o teste `apps-fora-do-nucleo.spec.js` de lá só aceita `github:` ou `git+ssh` com tag `vX.Y.Z`, nunca branch ou commit solto. As tags até agora são `v0.1.0`, `v0.1.1` e `v0.1.2`.

Não existe script de release neste repositório. O que as tags e o [`CHANGELOG.md`](../../CHANGELOG.md) mostram é esta ordem:

```bash
# num branch, com a mudança já na main por pull request
yarn verificar
# sobe o "version" do package.json e passa o [Não lançado] para uma seção com data no CHANGELOG.md
git commit -s -m "versao 0.1.3"
git tag v0.1.3          # num commit que já está na main
git push origin v0.1.3
```

A tag vai num commit que já está na `main`. O `app-sdk` garante isso com um workflow `tag`; este repositório não tem esse workflow, então aqui é disciplina.

Depois, no RoqueOS, o pin passa para a tag nova e as verificações de lá rodam, entre elas a paridade do [`paridade.json`](../../paridade.json) lido do pacote instalado: teste citado que não existe mais, estado desconhecido ou perda sem decisão escrita reprovam. Dá para rodar a mesma conferência antes de taguear, de um checkout do RoqueOS ao lado deste: `node scripts/paridade-dos-apps.mjs ../notas`.

Mudou uma funcionalidade, ou um teste citado no `paridade.json`? Atualize o inventário no mesmo commit ([README](../../README.pt-BR.md)).

## 4. Atualizar sem quebrar

| Dependência             | Regra                                                                         | Por quê                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `marked`, `dompurify`   | versão exata, a mesma do RoqueOS                                              | dentro do RoqueOS o yarn deduplica os dois com a cópia do sistema ([`CLAUDE.md`](../../CLAUDE.md)) |
| `@roqueos-apps/app-sdk` | por tag; bump só com `yarn verificar` verde e o changelog dizendo o que mudou | é o contrato; capacidade que o sistema não tem faz o `mount` recusar                               |
| `@roqueos-apps/ui`      | por tag, via `github:`                                                        | o `git+ssh` não instalava no Actions (29/09/2026)                                                  |
| qualquer coisa nova     | com o `yarn.lock` no mesmo diff, julgada pelo `supply-chain-reviewer` do kit  | o que o app puxa roda na origem do RoqueOS                                                         |

O app só importa `vue`, `@roqueos-apps/app-sdk`, `@roqueos-apps/ui`, `marked`, `dompurify` e arquivo deste repositório; o `app check` e a verificação do próprio RoqueOS reprovam o resto ([`CLAUDE.md`](../../CLAUDE.md)).

## 5. Desfazer

| Passo                                           | Como desfazer                                                                                                                                                    |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| uma mudança que já entrou                       | `git revert <commit>` num branch, pull request, o mesmo gate                                                                                                     |
| uma tag publicada que o RoqueOS ainda não pinou | corte a próxima tag de patch com a correção; não mova tag publicada                                                                                              |
| uma tag que o RoqueOS já pinou                  | volte o pin do RoqueOS para a tag anterior no `roqueos-front`; o commit está travado no `yarn.lock` de lá, então mover a tag aqui não mudaria o que ele instalou |
| um campo renomeado por engano                   | não há desfazer para quem já gravou com o nome novo; é por isso que nomes de campo, o `id` e a coleção são permanentes ([DECISOES.md](DECISOES.md))              |

## 6. Dados e backup

As Notas não guardam dado neste repositório. As notas moram na conta de cada pessoa, na coleção que o RoqueOS mapeia para `users/{uid}/desktop_postits`, e o backup delas é do RoqueOS. As preferências moram no armazenamento de app do sistema. No `yarn dev` tudo fica no `localStorage` do navegador, nas chaves `roqueos:notes:*`; limpar os dados do site zera.

O backup do código é o GitHub: toda mudança passa por pull request no `roqueos-apps/notas`.

## 7. O que acompanhar

| Sinal            | Saudável                                                                      | Onde                                   |
| ---------------- | ----------------------------------------------------------------------------- | -------------------------------------- |
| `yarn verificar` | sai 0; 36 testes em 5 arquivos e 8 seções `ok` do `app check` (18/11/2026)    | sua máquina                            |
| CI               | `verificar` verde na `main` e nos pull requests abertos                       | `gh run list --limit 3`                |
| DCO              | `dco` verde em todo pull request                                              | os checks do pull request              |
| Paridade         | 52 itens, nenhum `perdida` sem decisão                                        | [`paridade.json`](../../paridade.json) |
| Página da org    | a página da roqueos-apps mostra o nome, a descrição, o ícone e a cor de agora | o `roqueos-perfil-da-org` do kit       |
