# Quando quebra

_Português | [English](../WHEN-IT-BREAKS.md)_

> **Para quem:** quem está olhando para um gate vermelho, uma instalação que falhou, ou uma nota que fez o que não devia.
> **O que tem aqui:** o primeiro comando de diagnóstico, depois sintoma, causa e o que fazer, por área: instalar, o gate, o app rodando, publicar.
> **Onde ir para o resto:** como as coisas deveriam funcionar está na [ARQUITETURA.md](ARQUITETURA.md); a rotina, na [OPERACAO.md](OPERACAO.md).

As ferramentas imprimem em português. As mensagens vão citadas como aparecem.

## Sumário

1. [Instalação](#1-instalação)
2. [O gate](#2-o-gate)
3. [O app rodando](#3-o-app-rodando)
4. [Publicação](#4-publicação)

## Primeiro, o diagnóstico

```bash
node -v && yarn -v
yarn verificar
```

O `yarn verificar` para no primeiro passo que falha; o nome do passo (`eslint`, `prettier`, `vitest`, `app check`) diz qual tabela abaixo ler.

## 1. Instalação

| O que aparece                                                                   | Causa                                                                                                                                 | O que fazer                                                                  |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `Permission denied (publickey)`                                                 | uma dependência pinada por `git+ssh`; o GitHub Actions não tem chave. Aconteceu em 29/09/2026 com o kit `ui`, mesmo com o repo aberto | pine por `github:dono/repo#vX.Y.Z`, como o `package.json` faz desde a v0.1.2 |
| `The engine "node" is incompatible with this module`                            | Node mais velho que o 22                                                                                                              | `nvm use`, ou instale o Node do `.nvmrc`                                     |
| `Your lockfile needs to be updated` no CI                                       | o `package.json` mudou sem o `yarn.lock`                                                                                              | rode `yarn install --ignore-scripts` e commite o `yarn.lock` no mesmo diff   |
| um script de instalação rodou, ou o `app check` reprova `scripts de instalação` | uma dependência ou este `package.json` tem `preinstall`/`postinstall`                                                                 | instale sempre com `--ignore-scripts`; tire o script deste repositório       |

## 2. O gate

| O que aparece                                                                                           | Causa                                                                                    | O que fazer                                                                                               |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `Code style issues found in the above file`                                                             | o Prettier confere também Markdown e JSON                                                | `yarn format`, revise, commite                                                                            |
| `REPROVOU  textos nos idiomas` com `i18n/<idioma>.json sem: <chave>`                                    | um texto novo entrou no `pt-BR.json` e não nos outros nove                               | acrescente a chave nos dez `i18n/*.json`                                                                  |
| `REPROVOU  capacidades opcionais declaradas` com `usa sistema.<x> sem "<x>" em capacidades no app.json` | o código usa uma capacidade opcional que o manifesto não declara                         | acrescente em `capacidades` no `app.json` e em `CAPACIDADES` no `src/index.js`; o teste confere que batem |
| `REPROVOU  variáveis do sistema no contrato`                                                            | um `var(--ros-…)` fora da lista do contrato, ou uma variável `--ros-` declarada pelo app | use só as variáveis do contrato; as cores do app são `--notas-*`                                          |
| `REPROVOU  o app não fala com banco`                                                                    | um import de `firebase/…` em `src/`                                                      | a coleção é do sistema; use `sistema.colecoes`                                                            |
| `REPROVOU  o app não importa o RoqueOS`                                                                 | um import de `quasar` ou de um apelido do RoqueOS (`src/`, `stores/`, `boot/`…)          | o que o app precisa vem pelo `sistema`; os primitivos vêm do `@roqueos-apps/ui`                           |
| um teste do `app.spec.js` falha comparando a lista de gravações                                         | uma ação agora grava um campo que não é dela, ou a nota inteira                          | grave só o campo que mudou; nunca `x`, `y`, `width`, `height`, `zIndex` de nota existente                 |
| `vue/no-undef-components`                                                                               | um componente usado no template sem import                                               | importe do `@roqueos-apps/ui`; fora do RoqueOS não existe Quasar global                                   |

## 3. O app rodando

| O que aparece                                                                                            | Causa                                                                                                                     | O que fazer                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| um post-it arrastado na mesa volta para o lugar com a nota aberta nas Notas                              | uma gravação mandou a nota inteira com a posição velha. Era o RoqueOS de antes da saída, corrigido na v0.1.0 (27/09/2026) | ache a gravação que manda mais que o campo dela; o `test/app.spec.js` já deve reprovar                                                                                |
| o resultado da IA trocou o texto de outra nota                                                           | o agente terminou depois de a pessoa trocar de nota. Corrigido na v0.1.1 (28/09/2026)                                     | o `aplicar` tem de conferir que a nota aberta é a que foi enviada ([`src/useNotas.js`](../../src/useNotas.js))                                                        |
| no app do iPhone, a lista ou o rodapé do editor ficam embaixo da barra de gestos                         | `env(safe-area-inset-bottom)` usado sozinho. Corrigido na v0.1.1                                                          | use `var(--safe-area-inset-bottom, env(…))`; o `test/estilo.spec.js` confere                                                                                          |
| aviso `Entre na sua conta para guardar notas.`                                                           | sem conta (convidado), ou o sistema devolveu o código `sem-conta`                                                         | entre na conta; no `yarn dev`, tire o `?convidado=1`                                                                                                                  |
| aviso `Não foi possível concluir a operação. Tente novamente.` e `[notas] gravação recusada:` no console | o sistema recusou uma gravação com outro código (`sem-permissao`, `sem-rede`, `colecao-desconhecida`…)                    | leia o `codigo` no objeto do console; os códigos estão no `src/erros.js` do SDK                                                                                       |
| `[notas] textos do idioma` no console                                                                    | o JSON do idioma não carregou                                                                                             | o app cai no `pt-BR` para idioma desconhecido; erro de carga de um conhecido é problema de build, confira os imports `?raw` do [`src/textos.js`](../../src/textos.js) |
| `[notes] o sistema não cumpre o contrato: falta a capacidade "ia"`                                       | o hospedeiro não tem uma capacidade que o app declara                                                                     | um RoqueOS mais velho que o SDK de que esta versão precisa; atualize o RoqueOS, não o app                                                                             |

## 4. Publicação

| O que aparece                                                                                                       | Causa                                                                                                             | O que fazer                                                  |
| ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `::error::commit <sha> sem Signed-off-by. Refaça com: git commit --amend -s (ou git rebase --signoff)`              | um commit sem o `Signed-off-by` do DCO                                                                            | `git rebase --signoff main` e empurre o branch de novo       |
| o RoqueOS recusa a versão nova citando o `paridade.json`, por exemplo `test/app.spec.js não tem o teste "<título>"` | um teste citado no inventário foi renomeado ou removido                                                           | atualize o `paridade.json` no mesmo commit do teste          |
| o RoqueOS recusa com `perdida sem "decisao"`                                                                        | um item marcado como perdido sem quem decidiu, quando e onde está escrito                                         | escreva a decisão, ou mantenha a funcionalidade              |
| `[reprovado] nao li a vitrine publicada de roqueos-apps` do `roqueos-perfil-da-org`                                 | sem `gh`, ou sem acesso de leitura ao repo `.github` da org. Visto em 18/11/2026 numa sessão sem acesso ao GitHub | rode com o `gh` logado; não conferir não é aprovar           |
| o `roqueos-perfil-da-org` diz que um campo não bate                                                                 | o `app.json` mudou nome, descrição, ícone ou cor e a página da org não                                            | `node scripts/gerar.mjs` no repo `.github` da org, e empurre |
