# Changelog

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), e o projeto
usa [versionamento semântico](https://semver.org/lang/pt-BR/).

## [0.1.0] - 2026-09-27

As Notas saem do RoqueOS para o próprio repositório, falando com ele pelo `app-sdk` 0.2.0 e
desenhadas com o kit `ui` 0.1.0. Para quem usa, a nota, o post-it da mesa e as preferências
continuam os mesmos: mesmo lugar na conta, mesmos campos, mesma chave.

### Mudado

- Cada ação grava só o campo que mudou (título e texto, fixar, etiquetas, mostrar na mesa).
  Antes a nota inteira ia a cada tecla e, com ela aberta, desfazia o arraste do post-it na
  mesa.
- Nota nova abre o editor na hora, sem esperar o sistema confirmar: sem rede, criar não trava
  mais a tela.
- Com as Notas abertas, clicar em outro post-it da mesa troca a nota aberta. Antes o pedido
  chegava e era ignorado.
- O painel de IA é o do sistema, aberto dentro do editor.
- O editor é opaco de verdade: a lista não aparece mais fantasma por trás do texto.
- As dicas da barra de Markdown estão nos dez idiomas (eram em inglês em todos).
- Os avisos dizem o que aconteceu: "Nota excluída" (era a pergunta "Tem certeza que deseja
  excluir?") e "Nota salva em Documentos" (era o rótulo do botão). Convidado que tenta criar
  uma nota é avisado de que precisa entrar, em vez de nada acontecer.
- A descrição do app está traduzida nos dez idiomas (oito estavam em inglês).
- O Markdown usa uma instância própria do `marked`, sem mexer na configuração global que o
  RoqueOS usa em outros lugares.
