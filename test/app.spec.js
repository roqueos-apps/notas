// As Notas como o app-sdk entende um app: o `mount` que o RoqueOS chama, com o sistema falso
// do SDK. O que importa aqui é o que cada ação GRAVA: a nota é o post-it da área de trabalho,
// e as Notas não podem gravar campo que não é delas.
import { describe, it, expect, afterEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { criarSistemaFalso } from '@roqueos-apps/app-sdk/sistema-falso'
import { validarManifesto, verificarSistema } from '@roqueos-apps/app-sdk'
import notas, { CAPACIDADES } from '../src/index.js'
import { ESPERA_DO_TEXTO_MS } from '../src/useNotas.js'
import manifesto from '../app.json'

const ANA = { uid: 'ana', nome: 'Ana' }

/** Um post-it que a mesa criou: posição, tamanho, camada; sem pinned e sem tags. */
const postIt = (id, extra = {}) => ({
  id,
  title: `Título ${id}`,
  content: `Texto ${id}`,
  color: '#fff59d',
  x: 40,
  y: 90,
  width: 220,
  height: 180,
  zIndex: 1004,
  criadoEm: 1_000,
  atualizadoEm: 2_000,
  ...extra,
})

function montar({ identidade = ANA, abertura = {}, semear = [], idioma = 'pt-BR' } = {}) {
  const falso = criarSistemaFalso({
    appId: 'notes',
    identidade,
    colecoes: ['notas'],
    abertura,
    idioma,
  })
  if (semear.length) falso.colecoes.semear('notas', 'ana', semear)
  // O que o app manda gravar, chamada por chamada: a prova de que ele manda só o que mudou.
  const gravacoes = []
  const abrir = falso.sistema.colecoes.abrir
  falso.sistema.colecoes = {
    abrir(nome) {
      const c = abrir(nome)
      return {
        observar: c.observar,
        criar: (id, campos) => (gravacoes.push(['criar', id, campos]), c.criar(id, campos)),
        atualizar: (id, campos) => (
          gravacoes.push(['atualizar', id, campos]), c.atualizar(id, campos)
        ),
        apagar: (id) => (gravacoes.push(['apagar', id]), c.apagar(id)),
      }
    },
  }
  const el = document.createElement('div')
  document.body.appendChild(el)
  const montagem = notas.mount(el, falso.sistema, { windowId: 'w1', ativo: true })
  const q = (s) => el.querySelector(s)
  const botao = (rotulo) =>
    [...el.querySelectorAll('button')].find(
      (b) => b.getAttribute('aria-label') === rotulo || b.textContent.trim() === rotulo,
    )
  const guardado = () => falso.colecoes.guardado('notas', 'ana')
  return { ...falso, el, montagem, q, botao, gravacoes, guardado }
}

const montou = (el) => vi.waitFor(() => expect(el.querySelector('.notas')).not.toBeNull())
const digitar = async (campo, valor) => {
  campo.value = valor
  campo.dispatchEvent(new Event('input'))
  await flushPromises()
}

describe('as Notas pelo app-sdk', () => {
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('o id e as capacidades são os do manifesto, e o manifesto é válido', () => {
    expect(notas.id).toBe('notes')
    expect(manifesto.id).toBe(notas.id)
    expect(validarManifesto(manifesto)).toEqual([])
    // O index.js não pode importar o app.json (o build do RoqueOS quebra): as duas listas são
    // escritas duas vezes, e é este teste que não deixa uma andar sem a outra.
    expect([...notas.capacidades].sort()).toEqual([...manifesto.capacidades].sort())
    expect(CAPACIDADES).toEqual(notas.capacidades)
    expect(manifesto.colecoes).toEqual(['notas'])
  })

  it('não monta num sistema sem as capacidades que pede, e diz quais faltam', () => {
    const { sistema } = criarSistemaFalso()
    const semIa = { ...sistema }
    delete semIa.ia
    expect(verificarSistema(semIa, { exigidas: notas.capacidades }).problemas).toEqual([
      'falta a capacidade "ia"',
    ])
    expect(() => notas.mount(document.createElement('div'), semIa)).toThrow(/ia/)
  })

  it('lista as notas da conta, com o post-it antigo sem pinned e sem tags', async () => {
    const { el, montagem } = montar({
      semear: [postIt('n1'), postIt('n2', { pinned: true, tags: ['casa'] })],
    })
    await montou(el)
    const titulos = [...el.querySelectorAll('.notas__cartao-titulo')].map((e) => e.textContent)
    expect(titulos).toEqual(['Título n2', 'Título n1'])
    expect(el.querySelector('.notas__etiquetas').textContent).toContain('#casa')
    montagem.desmontar()
  })

  it('criar abre o editor na hora e grava a nota com os campos do post-it', async () => {
    const { el, montagem, botao, gravacoes, guardado } = montar()
    await montou(el)
    botao('Nova Nota').click()
    await flushPromises()
    expect(el.querySelector('.notas__editor')).not.toBeNull()
    expect(gravacoes).toHaveLength(1)
    const [acao, id, campos] = gravacoes[0]
    expect(acao).toBe('criar')
    expect(id).toMatch(/^note_\d+$/)
    expect(Object.keys(campos).sort()).toEqual(
      [
        'color',
        'content',
        'height',
        'pinned',
        'showOnDesktop',
        'tags',
        'title',
        'width',
        'x',
        'y',
        'zIndex',
      ].sort(),
    )
    expect(guardado()[0]).toMatchObject({ id, criadoEm: expect.any(Number) })
    montagem.desmontar()
  })

  it('convidado: criar não finge, avisa que precisa de conta', async () => {
    const { el, montagem, botao, gravacoes, registro } = montar({
      identidade: { uid: null, nome: null },
    })
    await montou(el)
    botao('Nova Nota').click()
    await flushPromises()
    expect(gravacoes).toEqual([])
    expect(el.querySelector('.notas__editor')).toBeNull()
    expect(registro.avisos).toEqual([
      { mensagem: 'Entre na sua conta para guardar notas.', tipo: 'aviso', fixo: false },
    ])
    montagem.desmontar()
  })

  it('digitar grava só o título e o texto, depois da pausa, e não desfaz o post-it arrastado', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const { el, montagem, gravacoes, guardado, colecoes, q } = montar({ semear: [postIt('n1')] })
    await vi.waitFor(() => expect(el.querySelector('.notas__cartao')).not.toBeNull())
    q('.notas__cartao').click()
    await flushPromises()
    // Enquanto a nota está aberta aqui, a pessoa arrasta o post-it na mesa.
    colecoes.semear('notas', 'ana', [{ ...guardado()[0], x: 400, y: 300 }])
    await digitar(q('.notas__texto'), 'texto novo')
    await digitar(q('.notas__titulo'), 'título novo')
    expect(gravacoes).toEqual([])
    vi.advanceTimersByTime(ESPERA_DO_TEXTO_MS)
    await flushPromises()
    expect(gravacoes).toEqual([
      ['atualizar', 'n1', { title: 'título novo', content: 'texto novo' }],
    ])
    expect(guardado()[0]).toMatchObject({
      x: 400,
      y: 300,
      content: 'texto novo',
      title: 'título novo',
    })
    montagem.desmontar()
  })

  it('a nota aberta acompanha o que mudou em outro lugar, menos o que a pessoa digita', async () => {
    const { el, montagem, q, botao, colecoes, guardado } = montar({ semear: [postIt('n1')] })
    await vi.waitFor(() => expect(el.querySelector('.notas__cartao')).not.toBeNull())
    q('.notas__cartao').click()
    await flushPromises()
    await digitar(q('.notas__texto'), 'digitando aqui')
    // Outro aparelho fixa a nota e troca o texto dela; o post-it troca de cor.
    colecoes.semear('notas', 'ana', [
      { ...guardado()[0], pinned: true, color: '#90caf9', content: 'de outro aparelho' },
    ])
    await flushPromises()
    expect(botao('Desafixar')?.getAttribute('aria-pressed')).toBe('true')
    expect(q('.notas__texto').value).toBe('digitando aqui')
    montagem.desmontar()
  })

  it('fixar, etiquetar e esconder da mesa gravam cada um só o seu campo', async () => {
    const { el, montagem, gravacoes, q, botao, registro } = montar({ semear: [postIt('n1')] })
    await vi.waitFor(() => expect(el.querySelector('.notas__cartao')).not.toBeNull())
    q('.notas__cartao').click()
    await flushPromises()
    botao('Fixar').click()
    const campoDaTag = q('.notas__tag-campo')
    campoDaTag.value = 'Lista de Compras'
    campoDaTag.dispatchEvent(new Event('input'))
    campoDaTag.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    await flushPromises()
    botao('Mostrar notas no Desktop').click()
    await flushPromises()
    expect(gravacoes).toEqual([
      ['atualizar', 'n1', { pinned: true }],
      ['atualizar', 'n1', { tags: ['lista-de-compras'] }],
      ['atualizar', 'n1', { showOnDesktop: false }],
    ])
    expect(registro.avisos.at(-1)).toEqual({
      mensagem: 'Escondido do Desktop',
      tipo: 'info',
      fixo: false,
      titulo: 'Esconder do Desktop',
    })
    montagem.desmontar()
  })

  it('excluir pergunta antes, e só apaga no confirmar', async () => {
    const { el, montagem, gravacoes, q, botao, guardado, registro } = montar({
      semear: [postIt('n1')],
    })
    await vi.waitFor(() => expect(el.querySelector('.notas__cartao')).not.toBeNull())
    q('.notas__cartao').click()
    await flushPromises()
    botao('Excluir').click()
    await flushPromises()
    const dialogo = el.querySelector('[role="alertdialog"]')
    expect(dialogo.textContent).toContain('Tem certeza que deseja excluir esta nota?')
    expect(gravacoes).toEqual([])
    ;[...dialogo.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Excluir').click()
    await flushPromises()
    expect(gravacoes).toEqual([['apagar', 'n1']])
    expect(guardado()).toEqual([])
    expect(registro.avisos.at(-1)).toMatchObject({ mensagem: 'Nota excluída', tipo: 'sucesso' })
    montagem.desmontar()
  })

  it('aberta pelo post-it vai direto na nota, e o próximo post-it troca a nota aberta', async () => {
    const { el, montagem, q, mudarAbertura } = montar({
      semear: [postIt('n1'), postIt('n2')],
      abertura: { nota: 'n2' },
    })
    await vi.waitFor(() => expect(el.querySelector('.notas__titulo')?.value).toBe('Título n2'))
    mudarAbertura({ nota: 'n1' })
    await flushPromises()
    expect(q('.notas__titulo').value).toBe('Título n1')
    montagem.desmontar()
  })

  it('a IA é o painel do sistema, dentro da âncora do editor, e o resultado entra na nota', async () => {
    const { el, montagem, q, botao, ia, registro, gravacoes } = montar({ semear: [postIt('n1')] })
    await vi.waitFor(() => expect(el.querySelector('.notas__cartao')).not.toBeNull())
    q('.notas__cartao').click()
    await flushPromises()
    botao('Melhorar com IA').click()
    await flushPromises()
    expect(registro.paineis).toEqual([
      { tipo: 'text', acento: '#f59e0b', titulo: 'Melhorar com IA', aplica: true, aberto: true },
    ])
    expect(await ia.contexto()).toBe('Texto n1')
    ia.aplicar('Texto melhor')
    await flushPromises()
    expect(q('.notas__texto').value).toBe('Texto melhor')
    expect(gravacoes.at(-1)).toEqual([
      'atualizar',
      'n1',
      { title: 'Título n1', content: 'Texto melhor' },
    ])
    // Voltar para a lista fecha o painel: a âncora dele vai embora com o editor.
    botao('Voltar').click()
    await flushPromises()
    expect(ia.aberto()).toBeNull()
    montagem.desmontar()
  })

  it('o resultado da IA que chega depois de trocar de nota não escreve na nota nova', async () => {
    const { el, montagem, q, botao, sistema, mudarAbertura, gravacoes } = montar({
      semear: [postIt('n1'), postIt('n2')],
    })
    // O agente pode terminar com o painel fechado: o `aplicar` guardado é o que o sistema chama.
    const pedidos = []
    const abrirPainel = sistema.ia.abrirPainel
    sistema.ia.abrirPainel = (pedido) => (pedidos.push(pedido), abrirPainel(pedido))
    await vi.waitFor(() => expect(el.querySelectorAll('.notas__cartao')).toHaveLength(2))
    const cartao = (id) =>
      [...el.querySelectorAll('.notas__cartao')].find((c) => c.textContent.includes(`Título ${id}`))
    cartao('n1').click()
    await flushPromises()
    botao('Melhorar com IA').click()
    await flushPromises()
    // Fechar o painel pelo mesmo botão, com a mesma nota aberta: o resultado ainda entra nela.
    botao('Melhorar com IA').click()
    await flushPromises()
    pedidos[0].aplicar('Melhor n1')
    await flushPromises()
    expect(q('.notas__texto').value).toBe('Melhor n1')
    // O post-it pede a n2 enquanto o agente da n1 ainda roda.
    botao('Melhorar com IA').click()
    await flushPromises()
    mudarAbertura({ nota: 'n2' })
    await vi.waitFor(() => expect(q('.notas__titulo')?.value).toBe('Título n2'))
    const antes = gravacoes.length
    pedidos[1].aplicar('Resultado da n1')
    await flushPromises()
    expect(q('.notas__texto').value).toBe('Texto n2')
    expect(gravacoes.slice(antes).filter(([, id]) => id === 'n2')).toEqual([])
    montagem.desmontar()
  })

  it('salvar em Arquivos entrega o Markdown ao sistema, na pasta Documentos', async () => {
    const { el, montagem, q, botao, registro } = montar({ semear: [postIt('n1')] })
    await vi.waitFor(() => expect(el.querySelector('.notas__cartao')).not.toBeNull())
    q('.notas__cartao').click()
    await flushPromises()
    botao('Exportar').click()
    await flushPromises()
    botao('Salvar em Arquivos').click()
    await flushPromises()
    expect(registro.arquivos).toEqual([
      {
        nome: 'Título_n1.md',
        conteudo: '# Título n1\n\nTexto n1',
        tipo: 'text/markdown',
        pasta: 'Documentos',
      },
    ])
    expect(registro.avisos.at(-1)).toMatchObject({ mensagem: 'Nota salva em Documentos' })
    montagem.desmontar()
  })

  it('as preferências vêm do armazenamento do app, e a troca de visualização grava', async () => {
    const falso = montar({ semear: [postIt('a', { title: 'b' }), postIt('b', { title: 'a' })] })
    falso.montagem.desmontar()
    falso.storage.setItem(
      'roqueos:notes:preferencias',
      JSON.stringify({ showOnDesktop: true, sortBy: 'title', viewMode: 'list' }),
    )
    const el = document.createElement('div')
    const montagem = notas.mount(el, falso.sistema, { ativo: true })
    await vi.waitFor(() => expect(el.querySelectorAll('.notas__cartao')).toHaveLength(2))
    expect([...el.querySelectorAll('.notas__cartao-titulo')].map((e) => e.textContent)).toEqual([
      'a',
      'b',
    ])
    ;[...el.querySelectorAll('button')]
      .find((b) => b.getAttribute('aria-label') === 'Grade')
      .click()
    await flushPromises()
    expect(JSON.parse(falso.storage.getItem('roqueos:notes:preferencias')).viewMode).toBe('grid')
    expect(el.querySelector('.notas__itens--grid')).not.toBeNull()
    montagem.desmontar()
  })

  it('a lista segue a conta: sair esvazia sem o app refazer nada', async () => {
    const { el, montagem, mudarIdentidade } = montar({ semear: [postIt('n1')] })
    await vi.waitFor(() => expect(el.querySelector('.notas__cartao')).not.toBeNull())
    mudarIdentidade({ uid: null, nome: null })
    await flushPromises()
    expect(el.querySelector('.notas__cartao')).toBeNull()
    montagem.desmontar()
  })

  it('desmontar grava o texto da última pausa e solta todos os ouvintes', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const { el, montagem, q, gravacoes, ouvintesVivos } = montar({ semear: [postIt('n1')] })
    await vi.waitFor(() => expect(el.querySelector('.notas__cartao')).not.toBeNull())
    q('.notas__cartao').click()
    await flushPromises()
    await digitar(q('.notas__texto'), 'quase perdido')
    montagem.desmontar()
    expect(gravacoes).toEqual([
      ['atualizar', 'n1', { title: 'Título n1', content: 'quase perdido' }],
    ])
    expect(ouvintesVivos()).toBe(0)
    expect(el.querySelector('.notas')).toBeNull()
  })
})
