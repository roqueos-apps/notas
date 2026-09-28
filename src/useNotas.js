// O motor das Notas: a coleção em tempo real, criar, editar, fixar, etiquetar, excluir,
// exportar, salvar nos Arquivos, a IA e as preferências. A tela (Notas.vue) só desenha e
// chama; tudo que fala com o RoqueOS passa por aqui, e só pelo `sistema`.
//
// ⚠️ CADA GRAVAÇÃO MANDA SÓ O CAMPO QUE MUDOU. A nota é o post-it da área de trabalho (veja
// `notas.js`): o texto é das Notas, a posição é do post-it, e os dois escrevem no mesmo
// documento. O RoqueOS de antes gravava a nota inteira a cada tecla, e isso devolvia a
// posição velha de um post-it arrastado na mesa enquanto a nota estava aberta aqui. A
// capacidade `colecoes` troca só os campos enviados; o resto é disciplina deste arquivo, e o
// teste `app.spec.js` confere o que cada ação grava.

import { computed, reactive, ref } from 'vue'
import { markdownSeguro } from './markdown.js'
import {
  filtrarEOrdenar,
  gravarPreferencias,
  lerPreferencias,
  limparTag,
  montarExportacao,
  novaNota,
  todasAsTags,
} from './notas.js'

export const COLECAO = 'notas'
export const ACENTO = '#f59e0b'
/** Espera depois da última tecla antes de gravar o texto. */
export const ESPERA_DO_TEXTO_MS = 500

/**
 * @param {{ sistema: object, t: (chave: string) => string }} opcoes
 */
export function criarNotas({ sistema, t }) {
  const colecao = sistema.colecoes.abrir(COLECAO)

  const notas = ref([])
  const carregando = ref(true)
  const busca = ref('')
  const tag = ref(null)
  const editando = ref(null)
  const editorAberto = ref(false)
  const iaAberta = ref(false)
  const preferencias = reactive(lerPreferencias(sistema.armazenamento))

  const lista = computed(() =>
    filtrarEOrdenar(notas.value, {
      busca: busca.value,
      tag: tag.value,
      ordem: preferencias.sortBy,
    }),
  )
  const tags = computed(() => todasAsTags(notas.value))
  const vazio = computed(() => !carregando.value && notas.value.length === 0)
  const htmlDaPrevia = computed(() => markdownSeguro(editando.value?.content ?? ''))

  // --- avisos ---------------------------------------------------------------------------
  const avisar = (mensagem, tipo = 'sucesso', titulo) =>
    sistema.avisar(mensagem, titulo ? { tipo, titulo } : { tipo })
  const semConta = () => !sistema.identidade.atual().uid
  function falhaAoGravar(erro) {
    if (erro?.codigo === 'sem-conta') avisar(t('entreParaGuardar'), 'aviso')
    else {
      console.error('[notas] gravação recusada:', erro)
      avisar(t('falhou'), 'erro', t('erro'))
    }
  }
  const gravar = (promessa) => promessa.catch(falhaAoGravar)

  // Declarados antes do `observar`: o sistema pode entregar a primeira lista na mesma volta, e
  // abrir a nota pedida já mexe no temporizador do texto e no painel de IA.
  let esperaDoTexto = null
  let painel = null

  // --- a coleção e o pedido de abertura -----------------------------------------------------
  let notaPedida = sistema.abertura.atual().nota ?? null

  function abrirPedida() {
    if (!notaPedida) return
    const achada = notas.value.find((n) => n.id === notaPedida)
    if (!achada) return
    notaPedida = null
    selecionar(achada)
  }

  const pararColecao = colecao.observar(
    (docs) => {
      notas.value = docs
      carregando.value = false
      // A nota aberta acompanha o que mudou em outro lugar (o post-it trocou de cor, outro
      // aparelho fixou), menos o título e o texto, que a pessoa pode estar digitando.
      const aberta = editando.value
      if (aberta && editorAberto.value) {
        const nova = docs.find((n) => n.id === aberta.id)
        if (nova) {
          aberta.color = nova.color
          aberta.showOnDesktop = nova.showOnDesktop
          aberta.pinned = nova.pinned
          aberta.tags = Array.isArray(nova.tags) ? [...nova.tags] : []
        }
      }
      abrirPedida()
    },
    (erro) => {
      carregando.value = false
      falhaAoGravar(erro)
    },
  )

  // Com a janela já aberta, o post-it pede outra nota.
  // ⚠️ Fecha a nota aberta ANTES de guardar o pedido novo: gravar o texto dela avisa a lista
  // (na mesma volta, no sistema em memória), e a lista abriria o pedido novo para o fechamento
  // logo abaixo desfazer.
  const pararAbertura = sistema.abertura.aoMudar((pedido) => {
    const nota = pedido?.nota ?? null
    if (!nota) return
    salvarAgora()
    fecharIa()
    editorAberto.value = false
    editando.value = null
    notaPedida = nota
    abrirPedida()
  })

  // --- editar -------------------------------------------------------------------------------
  function selecionar(nota) {
    fecharIa()
    editando.value = {
      ...nota,
      tags: Array.isArray(nota.tags) ? [...nota.tags] : [],
    }
    editorAberto.value = true
  }

  function criar() {
    if (semConta()) {
      avisar(t('entreParaGuardar'), 'aviso')
      return null
    }
    const id = `note_${Date.now()}`
    const campos = novaNota({ quantas: notas.value.length, naMesa: preferencias.showOnDesktop })
    // O editor abre na hora, sem esperar o sistema confirmar: sem rede, a confirmação só vem
    // quando a rede volta, e a nota já existe na lista antes disso.
    selecionar({ id, ...campos })
    gravar(colecao.criar(id, campos))
    return id
  }

  function textoMudou() {
    clearTimeout(esperaDoTexto)
    esperaDoTexto = setTimeout(salvarAgora, ESPERA_DO_TEXTO_MS)
  }

  function salvarAgora() {
    clearTimeout(esperaDoTexto)
    esperaDoTexto = null
    const n = editando.value
    if (!n || semConta()) return
    gravar(colecao.atualizar(n.id, { title: n.title ?? '', content: n.content ?? '' }))
  }

  function fechar() {
    salvarAgora()
    fecharIa()
    editorAberto.value = false
    editando.value = null
  }

  function alternarFixa(nota = editando.value) {
    if (!nota || semConta()) return
    const fixa = !nota.pinned
    nota.pinned = fixa
    if (editando.value?.id === nota.id) editando.value.pinned = fixa
    gravar(colecao.atualizar(nota.id, { pinned: fixa }))
  }

  function adicionarTag(bruta) {
    const limpa = limparTag(bruta)
    const n = editando.value
    if (!limpa || !n || n.tags.includes(limpa)) return
    n.tags = [...n.tags, limpa]
    gravar(colecao.atualizar(n.id, { tags: n.tags }))
  }

  function removerTag(etiqueta) {
    const n = editando.value
    if (!n) return
    n.tags = n.tags.filter((x) => x !== etiqueta)
    gravar(colecao.atualizar(n.id, { tags: n.tags }))
  }

  function alternarMesa() {
    const n = editando.value
    if (!n) return
    const naMesa = n.showOnDesktop === false
    n.showOnDesktop = naMesa
    gravar(colecao.atualizar(n.id, { showOnDesktop: naMesa }))
    avisar(
      naMesa ? t('mostrarNotasNaMesa') : t('escondidaDaMesa'),
      'info',
      naMesa ? t('mostrarNaMesa') : t('esconderDaMesa'),
    )
  }

  function excluir() {
    const n = editando.value
    if (!n) return
    clearTimeout(esperaDoTexto)
    fecharIa()
    editorAberto.value = false
    editando.value = null
    colecao
      .apagar(n.id)
      .then(() => avisar(t('notaExcluida')))
      .catch(falhaAoGravar)
  }

  // --- exportar e salvar --------------------------------------------------------------------
  function exportar(formato, documento = globalThis.document) {
    const n = editando.value
    if (!n) return
    const arq = montarExportacao(n, formato, t('semTitulo'))
    const url = URL.createObjectURL(new Blob([arq.texto], { type: arq.tipo }))
    const link = documento.createElement('a')
    link.href = url
    link.download = arq.nome
    link.click()
    URL.revokeObjectURL(url)
    avisar(t('exportada'))
  }

  async function salvarEmArquivos() {
    const n = editando.value
    if (!n) return
    const arq = montarExportacao(n, 'md', t('semTitulo'))
    try {
      await sistema.arquivos.salvar({ nome: arq.nome, conteudo: arq.texto, tipo: arq.tipo })
      avisar(t('salvaEmArquivos'))
    } catch (erro) {
      falhaAoGravar(erro)
    }
  }

  // --- IA: o painel é do sistema ------------------------------------------------------------
  function abrirIa(ancora) {
    if (!editando.value) return
    painel = sistema.ia.abrirPainel({
      ancora,
      tipo: 'text',
      contexto: () => editando.value?.content ?? '',
      aplicar: (texto) => {
        if (!editando.value) return
        editando.value.content = texto
        salvarAgora()
      },
      acento: ACENTO,
      titulo: t('melhorarComIa'),
      aoFechar: () => {
        painel = null
        iaAberta.value = false
      },
    })
    iaAberta.value = true
  }

  function fecharIa() {
    painel?.fechar()
    painel = null
    iaAberta.value = false
  }

  // --- preferências -------------------------------------------------------------------------
  function preferir(mudanca) {
    Object.assign(preferencias, mudanca)
    gravarPreferencias(sistema.armazenamento, { ...preferencias })
  }

  function encerrar() {
    // Texto digitado nos últimos meio segundo não se perde quando a janela fecha.
    if (esperaDoTexto) salvarAgora()
    fecharIa()
    pararColecao?.()
    pararAbertura?.()
  }

  return {
    notas,
    lista,
    tags,
    vazio,
    carregando,
    busca,
    tag,
    editando,
    editorAberto,
    iaAberta,
    htmlDaPrevia,
    preferencias,
    selecionar,
    criar,
    textoMudou,
    salvarAgora,
    fechar,
    alternarFixa,
    adicionarTag,
    removerTag,
    alternarMesa,
    excluir,
    exportar,
    salvarEmArquivos,
    abrirIa,
    fecharIa,
    preferir,
    encerrar,
  }
}
