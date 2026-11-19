# Começar

_Português | [English](../GETTING-STARTED.md)_

> **Para quem:** quem acabou de clonar o repositório e quer ver as Notas rodando e o gate verde.
> **O que tem aqui:** pré-requisitos com o comando que confere cada um, a instalação, o primeiro resultado visível no `yarn dev`, o gate e os erros de primeira vez.
> **Onde ir para o resto:** o que cada comando faz está na [REFERENCIA.md](REFERENCIA.md); erros depois da primeira vez, no [QUANDO-QUEBRA.md](QUANDO-QUEBRA.md).

## Sumário

1. [Pré-requisitos](#1-pré-requisitos)
2. [Instalar](#2-instalar)
3. [Ver rodando](#3-ver-rodando)
4. [Rodar o gate](#4-rodar-o-gate)
5. [Erros de primeira vez](#5-erros-de-primeira-vez)

## 1. Pré-requisitos

| Ferramenta | Versão                                         | Confere         |
| ---------- | ---------------------------------------------- | --------------- |
| Node       | 22 ou mais novo (`engines`); o `.nvmrc` diz 24 | `node -v`       |
| Yarn       | 1.22 (`packageManager: yarn@1.22.22`)          | `yarn -v`       |
| Git        | qualquer um recente                            | `git --version` |

Não precisa de conta, de Firebase nem do código do RoqueOS: o SDK traz um sistema de desenvolvimento que roda o app sozinho no navegador.

## 2. Instalar

```bash
git clone https://github.com/roqueos-apps/notas.git
cd notas
yarn install --ignore-scripts
```

O `--ignore-scripts` impede que o script de instalação de qualquer dependência rode; o `app check` já reprova o repo que declara um. Deu certo quando o yarn termina com `Done in`. As duas dependências `@roqueos-apps/*` vêm por HTTPS de tags do GitHub (`github:roqueos-apps/app-sdk#v0.2.0`, `github:roqueos-apps/ui#v0.6.0`), então não precisa de chave SSH.

## 3. Ver rodando

```bash
yarn dev
```

O Vite imprime um endereço local; abra. Você vê as Notas dentro de uma janela falsa do RoqueOS, com um seletor de idioma, numa conta local. Clique em **Nova Nota** (ou no ícone de mais, com a janela estreita), escreva um título e um pouco de Markdown, e passe para **Dividido** para ver o texto e a pré-visualização lado a lado. Recarregue com F5: a nota continua lá, porque o sistema de desenvolvimento guarda a coleção no `localStorage`.

Experimente os parâmetros de URL da [REFERENCIA.md](REFERENCIA.md#4-parâmetros-de-url-do-yarn-dev): `?idioma=ar-AR` para a direita para a esquerda, `?convidado=1` para ver que criar nota sem conta avisa em vez de fingir. O botão de IA mostra um aviso onde o painel do RoqueOS abriria, e **Salvar em Arquivos** vira download ([README](../../README.pt-BR.md)).

## 4. Rodar o gate

```bash
yarn verificar
```

Ele roda o lint, o Prettier, os testes e o `app check`, o mesmo do CI. Deu certo quando termina com estas linhas (medido em 18/11/2026: 5 arquivos de teste, 36 testes):

```text
 Test Files  5 passed (5)
      Tests  36 passed (36)
...
ok, o repo cumpre o contrato.
```

O `ok, o repo cumpre o contrato.` é a última linha do `app check`. Antes de um pull request, é este comando que tem de estar verde; depois leia o [CONTRIBUTING.md](CONTRIBUTING.md) para o `Signed-off-by` do DCO.

## 5. Erros de primeira vez

| O que aparece                                              | Causa                                                                                 | O que fazer                                                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `Permission denied (publickey)` na instalação              | um lockfile ou fork antigo ainda pina uma dependência por `git+ssh`                   | use os pins `github:` do `package.json` da `main`; veja o [QUANDO-QUEBRA.md](QUANDO-QUEBRA.md#1-instalação) |
| `The engine "node" is incompatible with this module`       | Node mais velho que o 22                                                              | `nvm use` (lê o `.nvmrc`)                                                                                   |
| `Code style issues found` no `yarn format:check`           | um arquivo, muitas vezes um Markdown que você editou, não está no formato do Prettier | `yarn format`, e commite o resultado                                                                        |
| o `yarn dev` abre num idioma que você não esperava         | sem `?idioma=`, o sistema de desenvolvimento segue o idioma do navegador              | acrescente `?idioma=pt-BR` (ou qualquer um dos dez) à URL                                                   |
| criar nota mostra `Entre na sua conta para guardar notas.` | você abriu com `?convidado=1`                                                         | tire o parâmetro                                                                                            |
