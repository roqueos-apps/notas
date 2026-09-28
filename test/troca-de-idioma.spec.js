// A troca de idioma fora de ordem: o texto do idioma pedido primeiro chega por último.
//
// O `import()` do JSON de cada idioma volta na ordem que a rede quiser. Se o montar
// aceitasse a resposta que chegou por último, e não a do último pedido, a pessoa que trocou
// de árabe para alemão ficaria com a tela em árabe. O teste controla a ordem das respostas,
// coisa que o teste pelo import de verdade (app.spec.js) não consegue.
import { describe, it, expect, vi } from 'vitest'
import { criarSistemaFalso } from '@roqueos-apps/app-sdk/sistema-falso'

const h = vi.hoisted(() => ({ pendentes: new Map() }))

vi.mock('../src/textos.js', async (original) => {
  const real = await original()
  return {
    ...real,
    carregarTextos: (idioma) =>
      new Promise((resolver) => h.pendentes.set(idioma, () => resolver({ titulo: idioma }))),
  }
})

import notas from '../src/index.js'

const rotulo = (el) => el.querySelector('.notas__marca span')?.textContent

describe('as Notas trocam de idioma fora de ordem', () => {
  it('vale o último idioma pedido, mesmo que a resposta dele chegue antes', async () => {
    const falso = criarSistemaFalso({ appId: 'notes', colecoes: ['notas'], idioma: 'pt-BR' })
    const el = document.createElement('div')
    const montagem = notas.mount(el, falso.sistema, { ativo: true })
    h.pendentes.get('pt-BR')()
    await vi.waitFor(() => expect(rotulo(el)).toBe('pt-BR'))

    falso.mudarIdioma('ar-AR')
    falso.mudarIdioma('de-DE')
    h.pendentes.get('de-DE')()
    await vi.waitFor(() => expect(rotulo(el)).toBe('de-DE'))
    h.pendentes.get('ar-AR')()
    await new Promise((r) => setTimeout(r, 20))
    expect(rotulo(el)).toBe('de-DE')
    montagem.desmontar()
  })
})
