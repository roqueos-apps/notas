# Modelo de ameaças

_Português | [English](../THREAT-MODEL.md)_

> **Para quem:** quem revisa uma mudança do ponto de vista de segurança, ou quer saber o que as Notas protegem e o que não protegem.
> **O que tem aqui:** o que está em jogo, quem poderia atacar, cada ameaça com o controle e o arquivo que o sustenta, e o que fica de fora.
> **Onde ir para o resto:** como reportar uma vulnerabilidade, o [SECURITY.md](../../SECURITY.md); como o app é feito, a [ARQUITETURA.md](ARQUITETURA.md).

## Sumário

1. [O que está em jogo](#1-o-que-está-em-jogo)
2. [Quem poderia atacar](#2-quem-poderia-atacar)
3. [Ameaças e controles](#3-ameaças-e-controles)
4. [Fora do escopo](#4-fora-do-escopo)

## 1. O que está em jogo

As Notas rodam **na mesma origem do RoqueOS**. Script que roda dentro delas roda com tudo o que a página do RoqueOS alcança: a sessão de quem entrou e os outros apps. O texto da nota é escrito pela pessoa, ou por outro aparelho dela, e a pré-visualização o mostra como HTML. Então o bem a proteger é menos as notas em si e mais a sessão do RoqueOS em volta delas.

As notas são dado da pessoa, guardado na conta dela pelo sistema; as Notas não têm acesso próprio a banco.

## 2. Quem poderia atacar

| Quem                                              | Como entraria                                                                                   |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Alguém que consegue pôr texto numa nota           | uma nota compartilhada ou colada com HTML ou link `javascript:`, sincronizada de outro aparelho |
| Um contribuidor mal-intencionado                  | um pull request neste repositório aberto, vindo de fork                                         |
| Uma dependência comprometida ou com nome parecido | um pacote que este app puxa e que o RoqueOS então instala na origem dele                        |
| Um workflow de CI abusado por um fork             | um workflow que entrega ao fork um token com escrita ou um segredo                              |

## 3. Ameaças e controles

| Ameaça                                                              | Controle                                                                                                                                                                     | Onde                                                                                                                         |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| HTML ou script numa nota roda no RoqueOS                            | todo texto de nota só chega ao `v-html` pelo `markdownSeguro`, que passa a saída do `marked` pelo `DOMPurify.sanitize`; o teste reprova script, handler e link `javascript:` | [`src/markdown.js`](../../src/markdown.js), [`test/markdown.spec.js`](../../test/markdown.spec.js)                           |
| Um defeito no sanitizador                                           | `dompurify` pinado na versão exata do RoqueOS, subido para 3.4.16 em 08/10/2026 pelos advisories de mutation-XSS                                                             | [`package.json`](../../package.json), [`CHANGELOG.md`](../../CHANGELOG.md)                                                   |
| As Notas mudam o Markdown de outro lugar do RoqueOS                 | instância própria do `Marked`, nunca as opções globais; testado                                                                                                              | [`src/markdown.js`](../../src/markdown.js)                                                                                   |
| O app alcança o banco ou o interior do RoqueOS                      | o `app check` reprova import do Firebase ou de apelido do RoqueOS                                                                                                            | seções do `app check`                                                                                                        |
| O app sobrescreve o que é da mesa                                   | cada ação grava só o seu campo; toda gravação é conferida                                                                                                                    | [`src/useNotas.js`](../../src/useNotas.js), [`test/app.spec.js`](../../test/app.spec.js)                                     |
| O app vê um agente ou chave de IA                                   | o painel de IA é do sistema; as Notas passam uma função de contexto e recebem texto                                                                                          | [`src/useNotas.js`](../../src/useNotas.js)                                                                                   |
| Um script de instalação roda na máquina de quem desenvolve ou no CI | `--ignore-scripts` em todo lugar; o `app check` reprova o repo que declara um                                                                                                | [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)                                                                 |
| O pull request de um fork recebe token com escrita                  | os workflows usam `pull_request`, nunca `pull_request_target`, `contents: read`, sem segredo                                                                                 | [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml), [`.github/workflows/dco.yml`](../../.github/workflows/dco.yml) |
| Um merge que ninguém revisou                                        | o `CODEOWNERS` manda toda mudança para o mantenedor                                                                                                                          | [`.github/CODEOWNERS`](../../.github/CODEOWNERS)                                                                             |
| O RoqueOS instala outra coisa que não a revisada                    | tag exata, commit travado no `yarn.lock` do RoqueOS                                                                                                                          | [OPERACAO.md](OPERACAO.md#3-cortar-uma-release)                                                                              |
| Uma dependência nova com nome parecido                              | o `supply-chain-reviewer` do kit em toda mudança de `package.json` ou `yarn.lock`                                                                                            | o manifesto de quality `app` do kit                                                                                          |

## 4. Fora do escopo

- **Quem pode ler uma nota.** As regras da coleção são do RoqueOS e do banco dele, não deste repositório.
- **O provedor de IA e o que ele vê.** Quem decide é o sistema; as Notas mandam o texto da nota como contexto quando a pessoa abre o painel.
- **Links da pré-visualização que levam a sites de fora.** O DOMPurify mantém links `http(s)` comuns; seguir um é escolha da pessoa.
- **O `prompt()` usado para o endereço do link** é a caixa do navegador; o conteúdo passa pelo mesmo sanitizador quando é desenhado.
- **Não provado:** não houve teste de intrusão nem fuzzing da pré-visualização; a proteção é o DOMPurify mais os quatro testes do `markdown.spec.js`.
