# Origem dos assets

Todo arquivo em `public/` tem uma linha aqui, com a licença e a origem. O `app check` reprova
arquivo sem linha e licença fora da lista do SDK.

As Notas não têm `public/`: não usam imagem, som nem fonte de arquivo.

Os ícones da tela vêm do kit de interface (`@roqueos-apps/ui`), que leva os traços do
[Material Icons](https://fonts.google.com/icons) do Google, sob Apache-2.0; a origem está no
ASSETS.md do kit. O ícone da janela e da Launchpad é o `sticky_note_2` do Material Icons,
desenhado pelo RoqueOS a partir do nome no `app.json`.
