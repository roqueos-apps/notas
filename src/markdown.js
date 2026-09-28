// O Markdown da pré-visualização, sempre limpo pelo DOMPurify antes de virar HTML na tela.
//
// ⚠️ Uma instância própria do `marked` (`new Marked(...)`), e não o `marked.setOptions` global:
// dentro do RoqueOS o pacote é o mesmo do sistema (o yarn deduplica), e mudar a opção global
// aqui mudaria o Markdown de todo o resto do RoqueOS em silêncio.
import { Marked } from 'marked'
import DOMPurify from 'dompurify'

const conversor = new Marked({ breaks: true, gfm: true })

/**
 * O HTML seguro de um texto em Markdown. É o único caminho de texto da nota para `v-html`.
 * @param {string} texto
 * @returns {string}
 */
export function markdownSeguro(texto) {
  if (!texto) return ''
  return DOMPurify.sanitize(conversor.parse(texto, { async: false }))
}
