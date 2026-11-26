# Glossário

_Português | [English](../GLOSSARY.md)_

> **Para quem:** quem lê o código ou as issues e encontra uma palavra que significa coisa específica aqui.
> **O que tem aqui:** cada termo como aparece no código, o que é, e onde mora.
> **Onde ir para o resto:** como as peças se ligam, a [ARQUITETURA.md](ARQUITETURA.md); os valores exatos, a [REFERENCIA.md](REFERENCIA.md).

O código é em português, então a maioria dos termos é palavra do português.

| Termo             | O que é                                                                                                                   | Onde                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `sistema`         | o objeto que o RoqueOS (ou o sistema de desenvolvimento ou o falso do SDK) passa para o `montar`; a única porta para fora | [`src/index.js`](../../src/index.js)                           |
| capacidade        | uma parte com nome do `sistema`; as opcionais têm de estar no `app.json`                                                  | [`app.json`](../../app.json)                                   |
| `colecoes`        | capacidade que abre uma coleção guardada na conta da pessoa                                                               | [`src/useNotas.js`](../../src/useNotas.js)                     |
| `notas` (coleção) | o nome da coleção; o RoqueOS a mapeia para `users/{uid}/desktop_postits`                                                  | [`src/useNotas.js`](../../src/useNotas.js)                     |
| `abertura`        | capacidade que diz qual nota abrir (`{ nota }`), e avisa quando outro post-it é clicado                                   | [`src/useNotas.js`](../../src/useNotas.js)                     |
| `ia`              | capacidade que abre o painel de IA do sistema sobre o texto da nota                                                       | [`src/useNotas.js`](../../src/useNotas.js)                     |
| `arquivos`        | capacidade que salva um arquivo em Documentos, nos Arquivos                                                               | [`src/useNotas.js`](../../src/useNotas.js)                     |
| `armazenamento`   | o armazenamento chave-valor do app, usado para as preferências                                                            | [`src/notas.js`](../../src/notas.js)                           |
| post-it           | a forma da nota na área de trabalho, do RoqueOS; o mesmo documento da nota                                                | [`src/notas.js`](../../src/notas.js)                           |
| mesa              | a área de trabalho do RoqueOS; o `showOnDesktop` decide se a nota aparece lá                                              | [`src/useNotas.js`](../../src/useNotas.js)                     |
| `markdownSeguro`  | o único caminho do texto da nota para o `v-html`: `marked` e depois DOMPurify                                             | [`src/markdown.js`](../../src/markdown.js)                     |
| `?raw`            | sufixo do Vite que importa um arquivo como texto; usado em todo JSON                                                      | [`src/textos.js`](../../src/textos.js)                         |
| modo leve         | o perfil leve do aparelho fraco (`sistema.desempenho.modoLeve()`); sem desfoque, sem a malha animada                      | [`src/notas.scss`](../../src/notas.scss)                       |
| `app check`       | o comando do SDK que confere o repositório contra o contrato                                                              | [`package.json`](../../package.json)                           |
| `yarn verificar`  | o gate: lint, formato, testes, `app check`                                                                                | [`package.json`](../../package.json)                           |
| paridade          | o inventário do que o app fazia dentro do RoqueOS e do que aconteceu com cada item; estados `mantida`, `mudou`, `perdida` | [`paridade.json`](../../paridade.json)                         |
| sistema falso     | o sistema falso do SDK para teste, com `semear` e `guardado`                                                              | [`test/app.spec.js`](../../test/app.spec.js)                   |
| janela falsa      | a janela falsa do RoqueOS do `yarn dev`                                                                                   | [`dev/main.js`](../../dev/main.js)                             |
| primeira-parte    | a camada do app no `app.json`: primeira parte, os dez idiomas obrigatórios                                                | [`app.json`](../../app.json)                                   |
| DCO               | Developer Certificate of Origin; a linha `Signed-off-by` que todo commit leva                                             | [`.github/workflows/dco.yml`](../../.github/workflows/dco.yml) |
