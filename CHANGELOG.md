# Changelog

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), e o projeto
usa [versionamento semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

### Mudado

- O kit de interface (`@roqueos-apps/ui`) entra por HTTPS (`github:roqueos-apps/ui#v0.6.0`), no
  mesmo commit de antes (`d2a66cb`). Pelo `git+ssh` o GitHub Actions não instalava sem chave,
  nem com o repo aberto (medido em 29/09 no `verificar`: `Permission denied (publickey)`).

## [0.1.1] - 2026-09-28

A auditoria de paridade de 28/09/2026 (Goal 28): o founder pediu que nenhuma funcionalidade
se perdesse na saída do núcleo.

### Adicionado

- `paridade.json`: o inventário do que as Notas fazia dentro do RoqueOS, item por item, e o que
  aconteceu com cada coisa na saída (52 itens: 39 mantidas, 13 mudaram, 0 perdidas). Cada item
  cita o teste deste repo que o prova, ou a evidência, e o RoqueOS confere o arquivo no pacote
  instalado: teste citado que não existe mais, estado de dúvida ou perda sem decisão escrita
  reprovam. O arquivo vai no pacote (`files`).

### Corrigido

- **O resultado da IA que chega depois de trocar de nota não escreve mais na nota nova.** O
  agente pode terminar com o painel fechado (pelo botão, ou porque o post-it pediu outra nota);
  o texto da outra nota era trocado pelo resultado da primeira. O defeito já existia dentro do
  RoqueOS. Fechar o painel com a mesma nota aberta continua aplicando o resultado nela.
- **No app do iPhone, a lista e o rodapé do editor voltam a ficar acima da barra de gestos**:
  a margem de baixo volta a usar a `--safe-area-inset-bottom` que o RoqueOS congela, com o
  `env()` só de reserva, como as Notas faziam antes da saída.

### Mudado

- A folha dos ajustes fecha também arrastando a alça para baixo, como fechava dentro do
  RoqueOS (kit `ui` 0.6.0).

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
