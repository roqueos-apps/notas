import { describe, it, expect } from 'vitest'
import {
  CORES,
  ORDENS,
  PREFERENCIAS_PADRAO,
  filtrarEOrdenar,
  formatarData,
  gravarPreferencias,
  lerPreferencias,
  limparTag,
  marcar,
  montarExportacao,
  novaNota,
  previa,
  todasAsTags,
} from '../src/notas.js'
import { armazenamentoDoApp, armazenamentoEmMemoria } from '@roqueos-apps/app-sdk/armazenamento'

const nota = (id, extra = {}) => ({ id, title: id, content: '', ...extra })

describe('a lista', () => {
  const notas = [
    nota('b', { atualizadoEm: 300, criadoEm: 100, tags: ['casa'] }),
    nota('a', { atualizadoEm: 100, criadoEm: 300, pinned: true }),
    nota('c', {
      atualizadoEm: 200,
      criadoEm: 200,
      content: 'Comprar pão',
      tags: ['casa', 'mercado'],
    }),
    // Post-it antigo, criado pela mesa: sem pinned, sem tags, sem data.
    { id: 'postit_1', title: 'Nova nota', content: '' },
  ]

  it('fixadas primeiro, depois a ordem escolhida; sem data vai para o fim', () => {
    expect(filtrarEOrdenar(notas, { ordem: 'updatedAt' }).map((n) => n.id)).toEqual([
      'a',
      'b',
      'c',
      'postit_1',
    ])
    expect(filtrarEOrdenar(notas, { ordem: 'createdAt' }).map((n) => n.id)).toEqual([
      'a',
      'c',
      'b',
      'postit_1',
    ])
    expect(filtrarEOrdenar(notas, { ordem: 'title' }).map((n) => n.id)).toEqual([
      'a',
      'b',
      'c',
      'postit_1',
    ])
  })

  it('a busca olha título e texto, sem caixa; a etiqueta filtra', () => {
    expect(filtrarEOrdenar(notas, { busca: '  PÃO ' }).map((n) => n.id)).toEqual(['c'])
    expect(filtrarEOrdenar(notas, { tag: 'casa' }).map((n) => n.id)).toEqual(['b', 'c'])
  })

  it('as etiquetas de todas as notas, sem repetir e em ordem', () => {
    expect(todasAsTags(notas)).toEqual(['casa', 'mercado'])
  })

  it('não muda a lista que recebeu', () => {
    const antes = notas.map((n) => n.id)
    filtrarEOrdenar(notas, { ordem: 'title' })
    expect(notas.map((n) => n.id)).toEqual(antes)
  })
})

describe('o cartão', () => {
  it('a prévia tira os sinais do Markdown e corta em cem', () => {
    expect(previa('# Título\n**negrito** e [link](x)', 'vazia')).toBe('Título\nnegrito e linkx')
    expect(previa('', 'vazia')).toBe('vazia')
    expect(previa('x'.repeat(120), 'vazia')).toBe(`${'x'.repeat(100)}...`)
  })

  it('a data: hora hoje, dia da semana nesta semana, dia e mês antes disso', () => {
    const agora = new Date('2026-09-27T15:00:00').getTime()
    const hoje = new Date('2026-09-27T09:05:00').getTime()
    const antesDeOntem = new Date('2026-09-25T09:00:00').getTime()
    const mesPassado = new Date('2026-08-10T09:00:00').getTime()
    expect(formatarData(hoje, 'pt-BR', agora)).toBe('09:05')
    expect(formatarData(antesDeOntem, 'pt-BR', agora)).toBe(
      new Date(antesDeOntem).toLocaleDateString('pt-BR', { weekday: 'short' }),
    )
    expect(formatarData(mesPassado, 'en-US', agora)).toBe('Aug 10')
    expect(formatarData(null, 'pt-BR', agora)).toBe('')
  })
})

describe('nota nova', () => {
  it('tem os campos do post-it, e a posição em escada', () => {
    expect(novaNota({ quantas: 3, naMesa: false, sortear: () => 0 })).toEqual({
      title: '',
      content: '',
      color: CORES[0],
      x: 190,
      y: 190,
      width: 200,
      height: 200,
      zIndex: 1003,
      showOnDesktop: false,
      pinned: false,
      tags: [],
    })
  })
})

describe('etiqueta', () => {
  it('minúsculas, hífen no lugar do espaço, vazia vira vazio', () => {
    expect(limparTag('  Lista de Compras ')).toBe('lista-de-compras')
    expect(limparTag('   ')).toBe('')
    expect(limparTag(null)).toBe('')
  })
})

describe('exportar', () => {
  const n = { title: 'Lista: casa/mercado', content: '# Itens\n- **pão**' }

  it('Markdown com o título como #, e nome de arquivo seguro', () => {
    expect(montarExportacao(n, 'md', 'Sem título')).toEqual({
      texto: '# Lista: casa/mercado\n\n# Itens\n- **pão**',
      nome: 'Lista_casa_mercado.md',
      tipo: 'text/markdown',
    })
  })

  it('texto sem os sinais do Markdown, e sem título usa o do idioma', () => {
    expect(montarExportacao({ content: '**oi**' }, 'txt', 'Sem título')).toEqual({
      texto: 'Sem título\n\noi',
      nome: 'Sem_título.txt',
      tipo: 'text/plain',
    })
  })
})

describe('a barra de Markdown', () => {
  it('marca o trecho selecionado e devolve a seleção nele', () => {
    expect(marcar('um dois três', 3, 7, '**', '**')).toEqual({
      texto: 'um **dois** três',
      selecao: [5, 9],
    })
    expect(marcar('abc', 0, 0, '## ', '')).toEqual({ texto: '## abc', selecao: [3, 3] })
  })
})

describe('preferências', () => {
  const armazenamento = () => armazenamentoDoApp('notes', armazenamentoEmMemoria())

  it('sem nada gravado, as de sempre', () => {
    expect(lerPreferencias(armazenamento())).toEqual(PREFERENCIAS_PADRAO)
  })

  it('lê o formato que o RoqueOS gravava, e ignora valor estranho', () => {
    const a = armazenamento()
    a.gravar(
      'preferencias',
      JSON.stringify({ showOnDesktop: false, sortBy: 'title', viewMode: 'grid' }),
    )
    expect(lerPreferencias(a)).toEqual({ showOnDesktop: false, sortBy: 'title', viewMode: 'grid' })
    a.gravar('preferencias', JSON.stringify({ sortBy: 'cor', viewMode: 'mosaico' }))
    expect(lerPreferencias(a)).toEqual(PREFERENCIAS_PADRAO)
    a.gravar('preferencias', '{quebrado')
    expect(lerPreferencias(a)).toEqual(PREFERENCIAS_PADRAO)
  })

  it('grava e lê de volta', () => {
    const a = armazenamento()
    gravarPreferencias(a, { showOnDesktop: true, sortBy: 'createdAt', viewMode: 'list' })
    expect(lerPreferencias(a).sortBy).toBe('createdAt')
    expect(ORDENS).toContain('createdAt')
  })
})
