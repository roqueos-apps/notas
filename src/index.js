// A porta de entrada das Notas: o app como o app-sdk entende um app.
//
// `montar` recebe o elemento, o sistema e se a janela está ativa, cria um app Vue próprio
// dentro do elemento e devolve `{ ativar, desmontar }`. Nenhuma store, nenhum plugin e nenhum
// estilo global do RoqueOS chega aqui dentro; o que as Notas precisam vem pelo `sistema`:
//
//   colecoes   as notas, que são os post-its da área de trabalho, na conta da pessoa
//   ia         o painel de IA do sistema, sobre o texto da nota
//   arquivos   salvar a nota em Documentos
//   abertura   o post-it que abriu as Notas, e o próximo que for clicado com elas abertas
//
// As capacidades são as mesmas do `app.json`: o teste `app.spec.js` confere que as duas
// listas batem, porque o build do RoqueOS não deixa este arquivo importar o JSON.

import { createApp, reactive } from 'vue'
import { definirApp } from '@roqueos-apps/app-sdk'
import Notas from './Notas.vue'
import { carregarTextos } from './textos.js'

export const CAPACIDADES = Object.freeze(['colecoes', 'ia', 'arquivos', 'abertura'])

export default definirApp({
  id: 'notes',
  capacidades: [...CAPACIDADES],
  montar(el, sistema, { ativo }) {
    const estado = reactive({
      ativo,
      idioma: sistema.idioma.atual(),
      textos: null,
      leve: sistema.desempenho.modoLeve(),
    })
    let app = null
    let desmontado = false
    // Duas trocas de idioma seguidas podem voltar fora de ordem; vale a última.
    let pedido = 0

    const trocarIdioma = async (idioma) => {
      const meu = ++pedido
      const textos = await carregarTextos(idioma)
      if (desmontado || meu !== pedido) return
      estado.idioma = idioma
      estado.textos = textos
    }
    const pararIdioma = sistema.idioma.aoMudar((novo) => {
      trocarIdioma(novo).catch((erro) => console.error('[notas] textos do idioma', novo, erro))
    })

    // O app só monta com o texto na mão: montar antes mostraria botões sem rótulo.
    trocarIdioma(estado.idioma)
      .catch((erro) => console.error('[notas] textos do idioma', estado.idioma, erro))
      .finally(() => {
        if (desmontado) return
        app = createApp(Notas, { sistema, estado })
        app.mount(el)
      })

    return {
      ativar(sim) {
        estado.ativo = sim
      },
      desmontar() {
        desmontado = true
        pararIdioma?.()
        app?.unmount()
        app = null
      },
    }
  },
})
