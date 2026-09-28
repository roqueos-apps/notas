// A lógica das Notas que não depende de tela nem de sistema: ordenar, filtrar, a prévia do
// cartão, a data, a exportação, a barra de Markdown. Funções puras, testadas sozinhas.
//
// ⚠️ UMA NOTA É UM POST-IT. A coleção é a mesma dos post-its da área de trabalho do RoqueOS
// (`users/{uid}/desktop_postits`): o post-it lê título, texto, cor, posição, tamanho, camada e
// `showOnDesktop`; as Notas acrescentaram `pinned` e `tags`, que o post-it ignora. As Notas
// NUNCA gravam a posição, o tamanho nem a camada de uma nota que já existe: isso é do post-it,
// e gravar de volta um valor antigo desfaria o que a pessoa arrastou na mesa.

/** As cores de sempre dos post-its. */
export const CORES = Object.freeze([
  '#fff59d',
  '#ffcc80',
  '#f48fb1',
  '#ce93d8',
  '#90caf9',
  '#80cbc4',
  '#a5d6a7',
  '#bcaaa4',
])

/**
 * As ordens da lista, com os valores que as preferências de quem já usa têm gravados
 * (`updatedAt`, `createdAt`, `title`). Trocar o valor seria perder a ordem que a pessoa
 * escolheu; por dentro eles apontam para as datas do sistema.
 */
export const ORDENS = Object.freeze(['updatedAt', 'createdAt', 'title'])
const CAMPO_DA_ORDEM = { updatedAt: 'atualizadoEm', createdAt: 'criadoEm' }

export const PREFERENCIAS_PADRAO = Object.freeze({
  showOnDesktop: true,
  sortBy: 'updatedAt',
  viewMode: 'list',
})

/** A chave das preferências no armazenamento do app (o sistema trouxe a antiga para cá). */
export const CHAVE_DAS_PREFERENCIAS = 'preferencias'

/**
 * @param {{ ler: (k: string) => string | null }} armazenamento
 * @returns {{ showOnDesktop: boolean, sortBy: string, viewMode: string }}
 */
export function lerPreferencias(armazenamento) {
  let salvas = {}
  try {
    salvas = JSON.parse(armazenamento.ler(CHAVE_DAS_PREFERENCIAS) ?? '{}') ?? {}
  } catch {
    salvas = {}
  }
  const p = { ...PREFERENCIAS_PADRAO }
  if (typeof salvas.showOnDesktop === 'boolean') p.showOnDesktop = salvas.showOnDesktop
  if (ORDENS.includes(salvas.sortBy)) p.sortBy = salvas.sortBy
  if (salvas.viewMode === 'grid' || salvas.viewMode === 'list') p.viewMode = salvas.viewMode
  return p
}

export function gravarPreferencias(armazenamento, preferencias) {
  return armazenamento.gravar(CHAVE_DAS_PREFERENCIAS, JSON.stringify(preferencias))
}

/** As etiquetas de todas as notas, sem repetir, em ordem alfabética. */
export function todasAsTags(notas) {
  const todas = new Set()
  for (const n of notas) for (const t of Array.isArray(n.tags) ? n.tags : []) todas.add(t)
  return [...todas].sort((a, b) => a.localeCompare(b))
}

/**
 * A lista que aparece: busca no título e no texto, filtro de etiqueta, fixadas primeiro, e a
 * ordem escolhida. Nota sem data (post-it antigo) vai para o fim.
 */
export function filtrarEOrdenar(notas, { busca = '', tag = null, ordem = 'updatedAt' } = {}) {
  let lista = [...notas]
  const q = busca.trim().toLowerCase()
  if (q) {
    lista = lista.filter(
      (n) => n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q),
    )
  }
  if (tag) lista = lista.filter((n) => (Array.isArray(n.tags) ? n.tags : []).includes(tag))
  const campo = CAMPO_DA_ORDEM[ordem]
  lista.sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1
    if (!campo) return (a.title || '').localeCompare(b.title || '')
    return (b[campo] ?? 0) - (a[campo] ?? 0)
  })
  return lista
}

/** Os primeiros cem caracteres do texto, sem os sinais do Markdown. */
export function previa(conteudo, textoSeVazia) {
  if (!conteudo) return textoSeVazia
  const texto = conteudo.replace(/[#*`~[\]()>-]/g, '').trim()
  return texto.length > 100 ? `${texto.substring(0, 100)}...` : texto
}

const DIA = 24 * 60 * 60 * 1000

/**
 * A data do cartão, no idioma de quem usa: a hora se for de hoje, o dia da semana se for
 * desta semana, e dia e mês se for mais antiga.
 * @param {number | null} ms
 */
export function formatarData(ms, idioma, agora = Date.now()) {
  if (!ms) return ''
  const data = new Date(ms)
  const dias = Math.floor((agora - data.getTime()) / DIA)
  if (dias === 0) return data.toLocaleTimeString(idioma, { hour: '2-digit', minute: '2-digit' })
  if (dias < 7) return data.toLocaleDateString(idioma, { weekday: 'short' })
  return data.toLocaleDateString(idioma, { day: 'numeric', month: 'short' })
}

/** Etiqueta em minúsculas, com hífen no lugar dos espaços. Vazia devolve ''. */
export function limparTag(tag) {
  return String(tag ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}

/**
 * Os campos de uma nota nova. A posição, o tamanho e a camada são os do post-it, e só a
 * criação grava: depois disso eles são do post-it.
 * @param {{ quantas: number, naMesa: boolean, sortear?: () => number }} opcoes
 */
export function novaNota({ quantas, naMesa, sortear = Math.random }) {
  return {
    title: '',
    content: '',
    color: CORES[Math.floor(sortear() * CORES.length)],
    x: 100 + ((quantas * 30) % 200),
    y: 100 + ((quantas * 30) % 150),
    width: 200,
    height: 200,
    zIndex: 1000 + quantas,
    showOnDesktop: naMesa,
    pinned: false,
    tags: [],
  }
}

/**
 * O arquivo de uma nota exportada: `md` com o título como `#`, ou `txt` sem os sinais do
 * Markdown. O nome do arquivo vem do título, só com letras, dígitos, `_` e `-`.
 */
export function montarExportacao(nota, formato, semTitulo) {
  const titulo = nota.title?.trim() || semTitulo
  const corpo =
    formato === 'txt' ? (nota.content || '').replace(/[#*`~[\]()>]/g, '') : nota.content || ''
  const texto = formato === 'md' ? `# ${titulo}\n\n${corpo}` : `${titulo}\n\n${corpo}`
  const seguro = titulo.replace(/[^\wÀ-ſ-]+/g, '_').slice(0, 40) || 'note'
  return {
    texto,
    nome: `${seguro}.${formato}`,
    tipo: formato === 'md' ? 'text/markdown' : 'text/plain',
  }
}

/**
 * A barra de Markdown: põe `antes` e `depois` em volta do que está selecionado e devolve o
 * texto novo e a seleção que o campo deve mostrar (o mesmo trecho, agora marcado).
 */
export function marcar(texto, inicio, fim, antes, depois) {
  const selecionado = texto.substring(inicio, fim)
  return {
    texto: texto.substring(0, inicio) + antes + selecionado + depois + texto.substring(fim),
    selecao: [inicio + antes.length, inicio + antes.length + selecionado.length],
  }
}
