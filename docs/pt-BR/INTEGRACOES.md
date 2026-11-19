# Integrações

_Português | [English](../INTEGRATIONS.md)_

> **Para quem:** quem muda o RoqueOS, o post-it da mesa ou o SDK, e precisa saber o que as Notas esperam e oferecem.
> **O que tem aqui:** o que o pacote exporta, as capacidades que ele chama e como, o documento compartilhado com o post-it, o pedido de abertura, o arquivo de paridade que o RoqueOS lê.
> **Onde ir para o resto:** campo por campo, a [REFERENCIA.md](REFERENCIA.md); por que tem esta forma, a [ARQUITETURA.md](ARQUITETURA.md).

As Notas não têm API, CLI nem webhook. A superfície delas para fora é o pacote que o RoqueOS instala e o documento que elas dividem com a mesa.

## Sumário

1. [O pacote](#1-o-pacote)
2. [Capacidades usadas](#2-capacidades-usadas)
3. [O documento compartilhado](#3-o-documento-compartilhado)
4. [Abrir uma nota](#4-abrir-uma-nota)
5. [O arquivo de paridade](#5-o-arquivo-de-paridade)

## 1. O pacote

| Export        | Arquivo                              | O que o RoqueOS faz com ele                                                                                             |
| ------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `.` (default) | [`src/index.js`](../../src/index.js) | o app do `definirApp`: `id: 'notes'`, `capacidades`, `mount(el, sistema, { ativo })` devolvendo `{ ativar, desmontar }` |
| `./app.json`  | [`app.json`](../../app.json)         | a entrada do registro: nomes, ícone, cor, categoria, janela                                                             |

`CAPACIDADES` também é export nomeado do `src/index.js`.

## 2. Capacidades usadas

| Capacidade      | Chamada                                                                                                      | Notas                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `colecoes`      | `abrir('notas')`, depois `observar(ok, erro)`, `criar(id, campos)`, `atualizar(id, campos)`, `apagar(id)`    | o `atualizar` troca só os campos enviados                    |
| `ia`            | `abrirPainel({ ancora, tipo: 'text', contexto, aplicar, acento, titulo, aoFechar })` devolvendo `{ fechar }` | o resultado volta pelo `aplicar(texto)`                      |
| `arquivos`      | `salvar({ nome, conteudo, tipo })`                                                                           | Markdown, `text/markdown`                                    |
| `abertura`      | `atual()`, `aoMudar(fn)`                                                                                     | veja a seção 4                                               |
| `idioma`        | `atual()`, `aoMudar(fn)`                                                                                     | vale o último pedido quando duas cargas voltam fora de ordem |
| `desempenho`    | `modoLeve()`                                                                                                 | lido uma vez ao montar                                       |
| `avisar`        | `avisar(mensagem, { tipo, titulo })`                                                                         | `sucesso`, `info`, `aviso`, `erro`                           |
| `armazenamento` | `ler(chave)`, `gravar(chave, valor)`                                                                         | a chave `preferencias`                                       |
| `identidade`    | `atual().uid`                                                                                                | sem `uid` é convidado                                        |

As quatro primeiras são opcionais e declaradas no `app.json`; um hospedeiro sem uma delas faz o `mount` lançar erro com o nome que falta (teste `não monta num sistema sem as capacidades que pede, e diz quais faltam` no [`test/app.spec.js`](../../test/app.spec.js)). O erro vem como objeto com `codigo`; as Notas tratam `sem-conta` como "entre na conta" e todo o resto como falha genérica ([`src/useNotas.js`](../../src/useNotas.js)).

## 3. O documento compartilhado

O post-it da mesa e as Notas gravam o mesmo documento. A divisão é o contrato, e mudá-la quebra o outro lado em silêncio:

```text
a mesa é dona  : x, y, width, height, zIndex, color (depois de criar)
as Notas são donas : title, content, pinned, tags, showOnDesktop
o sistema carimba  : criadoEm, atualizadoEm
```

Campo novo é aditivo: o post-it ignora o que não conhece. Mudar o nome ou o sentido de um campo que existe apaga o que a pessoa tinha ([`CONTRIBUTING.md`](CONTRIBUTING.md)).

## 4. Abrir uma nota

```json
{ "nota": "note_1727400000000" }
```

O post-it que abre as Notas manda isto. Com a janela já aberta, um pedido novo pelo `aoMudar` salva e fecha a nota aberta e abre a pedida. Um id que ainda não está na lista fica guardado até a lista trazer a nota.

## 5. O arquivo de paridade

O [`paridade.json`](../../paridade.json) vai no pacote (`files`), e o RoqueOS o confere antes de aceitar a versão, com o `scripts/paridade-dos-apps.mjs` do `roqueos-front`. Versão do formato `1`; cada item tem `o_que`, `estado` (`mantida`, `mudou`, `perdida`) e `testes` (`test/<arquivo> › <título exato>`) ou `evidencia`; `mudou` precisa de `nota`, `perdida` precisa de `decisao`. Em 18/11/2026 ele tem 52 itens: 39 `mantida`, 13 `mudou`, 0 `perdida`.
