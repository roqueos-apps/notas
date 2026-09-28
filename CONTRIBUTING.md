# Como contribuir

Obrigado por querer ajudar. A régua comum da organização está no
[CONTRIBUTING da roqueos-apps](https://github.com/roqueos-apps/.github/blob/main/CONTRIBUTING.md);
aqui entra só o que é das Notas.

1. Abra uma issue antes de mudar o que a pessoa vê ou o que uma nota guarda. Correção pequena
   pode ir direto para o PR.
2. Faça o fork, crie um branch e rode `yarn install --ignore-scripts`.
3. Todo commit leva `Signed-off-by` (`git commit -s`, o DCO). O check `dco` do pull request
   reprova sem.
4. Toda correção vem com um teste que reprova sem ela. O que uma ação grava vai em
   `test/app.spec.js`, chamada por chamada.
5. **A nota é um post-it da mesa do RoqueOS.** Nunca grave a nota inteira, nem a posição
   (`x`, `y`), o tamanho (`width`, `height`) ou a camada (`zIndex`) de uma nota que já existe:
   isso é do post-it. Campo novo é aditivo (o post-it ignora o que não conhece); mudar o nome
   ou o sentido de um que existe apaga o que a pessoa tinha.
6. Texto novo entra nos dez `i18n/*.json`, com as mesmas chaves. O `app check` reprova se
   faltar um idioma.
7. Rode `yarn verificar` antes de abrir o PR. É o mesmo que o CI roda. `yarn dev` abre as
   Notas numa janela falsa do RoqueOS, numa conta local.

Não mude o `id` do `app.json` (`notes`) nem o nome da coleção (`notas`): é por eles que o
RoqueOS acha as janelas, os atalhos e as notas de quem já usa.

O código, os comentários e as mensagens de commit são em português do Brasil. Issue e PR em
inglês são bem-vindos. Ao participar você concorda com o [código de conduta](CODE_OF_CONDUCT.md).

---

## Contributing (English)

The organization-wide guide is the
[roqueos-apps CONTRIBUTING](https://github.com/roqueos-apps/.github/blob/main/CONTRIBUTING.md).
Open an issue before changing what people see or what a note stores; fork, branch,
`yarn install --ignore-scripts`; sign off every commit (`git commit -s`); every fix comes with
a test that fails without it. A note is also a RoqueOS desktop sticky note: never write the
whole note, nor the position, size or layer of an existing one. New text goes into all ten
`i18n/*.json`; run `yarn verificar` before the pull request. Never change the `id` in
`app.json` or the collection name.
