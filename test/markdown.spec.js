import { describe, it, expect } from 'vitest'
import { marked } from 'marked'
import { markdownSeguro } from '../src/markdown.js'

describe('o Markdown da pré-visualização', () => {
  it('quebra de linha vira <br>, e o GFM vale (lista de tarefas)', () => {
    expect(markdownSeguro('a\nb')).toContain('<br>')
    expect(markdownSeguro('- [ ] pão')).toContain('type="checkbox"')
  })

  it('script, handler e link javascript: não passam', () => {
    expect(markdownSeguro('<script>alert(1)</script>oi')).not.toMatch(/<script/i)
    expect(markdownSeguro('<img src=x onerror="alert(2)">')).not.toMatch(/onerror/i)
    const link = markdownSeguro('[x](javascript:alert(3))')
    expect(link).not.toMatch(/href="javascript:/i)
    expect(markdownSeguro('[x](https://roqueos.com.br)')).toContain('href="https://roqueos.com.br"')
  })

  it('não mexe na configuração global do marked, que no RoqueOS é a do sistema', () => {
    markdownSeguro('a\nb')
    expect(marked.defaults.breaks).toBe(false)
  })

  it('vazio é vazio', () => {
    expect(markdownSeguro('')).toBe('')
  })
})
