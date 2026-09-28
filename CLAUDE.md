# Notas

App da organização roqueos-apps, montado pelo RoqueOS através do `app-sdk`. Leia o README
antes de mudar qualquer coisa.

- Gate: `yarn verificar` (o mesmo do CI e do pre-push).
- O app só importa `vue`, `@roqueos-apps/app-sdk`, `@roqueos-apps/ui`, `marked`, `dompurify` e
  arquivo deste repo. O `app check` e a catraca `apps-fora-do-nucleo` do RoqueOS reprovam o
  resto. `marked` e `dompurify` ficam na versão exata do RoqueOS.
- A nota é o post-it da mesa (coleção `notas` → `users/{uid}/desktop_postits` no RoqueOS).
  Cada ação grava só o campo que mudou; nunca a nota inteira, nunca `x`/`y`/`width`/`height`/
  `zIndex` de nota existente. `test/app.spec.js` confere cada gravação.
- JSON de texto entra com `?raw` e `JSON.parse` (`src/textos.js`): o build do RoqueOS quebra
  com import de JSON direto, e é por isso que `src/index.js` repete as capacidades do
  `app.json` (o teste confere que batem).
- O `id` do `app.json` (`notes`), o nome da coleção (`notas`) e os valores de ordem das
  preferências (`updatedAt`, `createdAt`, `title`) são permanentes.
- Do tema do RoqueOS só as variáveis CSS do contrato do SDK; as cores do app são `--notas-*`.
- Texto na tela só com `v-html` pelo `markdownSeguro`.
- Toda correção vem com teste que reprova sem ela; check novo passa por mutação.
- Todo commit com `Signed-off-by` (`git commit -s`): o workflow `dco` reprova sem.
- Português do Brasil no código e nos commits.
