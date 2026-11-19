# Testes

_Português | [English](../TESTING.md)_

> **Para quem:** quem acrescenta uma funcionalidade ou uma correção e precisa saber que teste escrever e o que o gate prova.
> **O que tem aqui:** o gate passo a passo, o que cada suíte prova, como um teste vê as gravações, o critério de aceite e o que nenhum teste cobre.
> **Onde ir para o resto:** os comandos, a [REFERENCIA.md](REFERENCIA.md); um passo que falha, o [QUANDO-QUEBRA.md](QUANDO-QUEBRA.md).

## Sumário

1. [O gate](#1-o-gate)
2. [As suítes](#2-as-suítes)
3. [Como um teste vê o que o app grava](#3-como-um-teste-vê-o-que-o-app-grava)
4. [Critério de aceite](#4-critério-de-aceite)
5. [O que nenhum teste cobre](#5-o-que-nenhum-teste-cobre)

## 1. O gate

```bash
yarn verificar
```

| Passo               | Prova                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------- |
| `yarn lint`         | o recomendado do ESLint mais o essencial do Vue, e nenhum componente usado sem import |
| `yarn format:check` | todo arquivo, Markdown incluído, está no formato do Prettier                          |
| `yarn test`         | as cinco suítes do Vitest abaixo                                                      |
| `yarn app:check`    | as oito seções do contrato do SDK                                                     |

O mesmo comando roda no GitHub Actions em todo push na `main` e em todo pull request. Medido em 18/11/2026: 36 testes em 5 arquivos, todos passando.

## 2. As suítes

| Suíte                                                                | Testes | Prova                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`test/app.spec.js`](../../test/app.spec.js)                         | 16     | o app pelo SDK: manifesto e capacidades batem, recusa sem uma capacidade, a lista, criar, convidado, digitar, mudança de fora, fixar/etiqueta/mesa, excluir, abertura pelo post-it, IA, Arquivos, preferências, sair da conta, desmontar |
| [`test/notas.spec.js`](../../test/notas.spec.js)                     | 14     | a lógica pura: ordenar, buscar, etiquetas, prévia e data do cartão, nota nova, limpar etiqueta, exportar, barra de Markdown, preferências                                                                                                |
| [`test/markdown.spec.js`](../../test/markdown.spec.js)               | 4      | quebra de linha e GFM, sem script/handler/`javascript:`, o `marked` global intocado, entrada vazia                                                                                                                                       |
| [`test/troca-de-idioma.spec.js`](../../test/troca-de-idioma.spec.js) | 1      | vale o último idioma pedido quando as cargas voltam fora de ordem                                                                                                                                                                        |
| [`test/estilo.spec.js`](../../test/estilo.spec.js)                   | 1      | todo `env(safe-area-inset-bottom)` fica atrás de `var(--safe-area-inset-bottom, …)`                                                                                                                                                      |

O [`test/preparar.js`](../../test/preparar.js) acrescenta o `ResizeObserver` e o `matchMedia` que o jsdom não tem e desmonta todo componente ao fim de cada teste.

## 3. Como um teste vê o que o app grava

O `montar()` do `app.spec.js` monta o sistema falso do SDK e embrulha o `colecoes.abrir` para cada `criar`, `atualizar` e `apagar` entrar numa lista `gravacoes`. O teste então confere a lista exata, chamada por chamada. É assim que "cada ação grava só o seu campo" é teste e não promessa: uma gravação com um campo a mais reprova.

## 4. Critério de aceite

- `yarn verificar` sai 0, na máquina e no CI.
- Toda correção vem com um teste que reprova sem ela; check novo passa por mutação ([`CLAUDE.md`](../../CLAUDE.md)).
- O que uma ação grava vai em `test/app.spec.js`, chamada por chamada ([`CONTRIBUTING.md`](CONTRIBUTING.md)).
- Um teste citado no [`paridade.json`](../../paridade.json) mantém o título exato, ou o inventário muda no mesmo commit; o RoqueOS compara os títulos ao pé da letra.
- Mudança visível também é aberta no `yarn dev`, com print ([`.claude/loop.md`](../../.claude/loop.md)).

## 5. O que nenhum teste cobre

Pela auditoria do `paridade.json` e pelo código: o layout da janela estreita, a ligação do campo de busca com a lista, a criação que falha, a ordem depois de fixar, dois aparelhos reais sincronizando, o iPhone real, o Launchpad e os rótulos do dock. Isso aparece como não medido, não como funcionando.
