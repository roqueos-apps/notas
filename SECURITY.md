# Segurança

## Como reportar

Não abra issue pública para falha de segurança. Use o
[relatório privado de vulnerabilidade](https://github.com/roqueos-apps/notas/security/advisories/new)
do GitHub. A resposta vem em até sete dias. A política completa está no
[SECURITY da roqueos-apps](https://github.com/roqueos-apps/.github/blob/main/SECURITY.md).

## O que vale aqui

As Notas rodam **na mesma origem** do RoqueOS e mostram texto que a pessoa escreveu (ou que
outro aparelho dela escreveu) como HTML. O que protege quem usa o RoqueOS é:

- todo texto de nota só vira HTML pelo `markdownSeguro` (`src/markdown.js`), que passa o
  resultado do `marked` pelo DOMPurify; o teste reprova script, handler e link `javascript:`;
- as Notas não falam com banco: a coleção é do sistema, que decide onde ela mora e com que
  regra, e o `app check` reprova import do Firebase ou de dentro do RoqueOS;
- a IA é o painel do sistema: agente e chave nunca chegam ao app;
- todo merge passa pela revisão do mantenedor (`CODEOWNERS`), e todo commit tem
  `Signed-off-by`;
- o RoqueOS instala o app por uma tag exata, com o commit travado no lockfile, e o `marked` e
  o DOMPurify são pinados na mesma versão que o RoqueOS usa;
- nenhum script roda sozinho no install, e o CI de pull request não lê segredo nenhum.

---

## Security (English)

Do not open public issues for vulnerabilities; use GitHub's private vulnerability reporting.
Notes runs on the same origin as RoqueOS and renders user text as HTML only through
`markdownSeguro` (marked + DOMPurify, tested against scripts, handlers and `javascript:`
links). It has no database access of its own (the system owns the collection), never sees AI
agents or keys, is pinned by exact tag, pins `marked` and DOMPurify to RoqueOS's versions, and
has no install-time scripts or CI secrets.
