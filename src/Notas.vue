<template>
  <div class="notas" :class="{ 'notas--leve': estado.leve }" :style="estiloDoAcento">
    <div class="notas__malha" aria-hidden="true"></div>

    <!-- A lista -->
    <div class="notas__lista">
      <div class="notas__barra">
        <div class="notas__marca">
          <RosIcone nome="sticky_note_2" :tamanho="18" />
          <span>{{ t('titulo') }}</span>
        </div>
        <div class="notas__espaco"></div>
        <RosBotao
          :icone="n.preferencias.viewMode === 'grid' ? 'view_list' : 'grid_view'"
          :rotulo="n.preferencias.viewMode === 'grid' ? t('lista') : t('grade')"
          @click="alternarVisualizacao"
        />
        <RosBotao icone="tune" :rotulo="t('ajustes')" @click="ajustesAbertos = true" />
        <RosBotao
          class="notas__nova"
          variante="primario"
          icone="add"
          :acento="ACENTO"
          :rotulo="t('novaNota')"
          @click="n.criar()"
        >
          <span class="notas__nova-texto">{{ t('novaNota') }}</span>
        </RosBotao>
      </div>

      <label class="notas__busca">
        <RosIcone nome="search" :tamanho="18" />
        <input
          v-model="n.busca.value"
          class="notas__busca-campo"
          type="search"
          :placeholder="t('buscar')"
          :aria-label="t('buscar')"
        />
      </label>

      <div v-if="n.tags.value.length" class="notas__etiquetas notas__sem-rolagem">
        <button
          class="notas__etiqueta"
          :class="{ ativa: !n.tag.value }"
          :aria-pressed="String(!n.tag.value)"
          @click="n.tag.value = null"
        >
          {{ t('todasAsTags') }}
        </button>
        <button
          v-for="etiqueta in n.tags.value"
          :key="etiqueta"
          class="notas__etiqueta"
          :class="{ ativa: n.tag.value === etiqueta }"
          :aria-pressed="String(n.tag.value === etiqueta)"
          @click="n.tag.value = n.tag.value === etiqueta ? null : etiqueta"
        >
          #{{ etiqueta }}
        </button>
      </div>

      <RosVazio
        v-if="n.vazio.value"
        class="notas__vazio"
        icone="sticky_note_2"
        :titulo="t('nenhumaNota')"
        :acento="ACENTO"
      >
        <RosBotao variante="primario" icone="add" :acento="ACENTO" @click="n.criar()">
          {{ t('novaNota') }}
        </RosBotao>
      </RosVazio>

      <div
        v-else
        class="notas__itens notas__rolagem"
        :class="`notas__itens--${n.preferencias.viewMode}`"
      >
        <div
          v-for="nota in n.lista.value"
          :key="nota.id"
          class="notas__cartao"
          :style="{ '--cor-do-cartao': nota.color }"
          role="button"
          tabindex="0"
          @click="n.selecionar(nota)"
          @keydown.enter.prevent="n.selecionar(nota)"
          @keydown.space.prevent="n.selecionar(nota)"
        >
          <div class="notas__cartao-topo">
            <span class="notas__cartao-titulo">{{ nota.title || t('semTitulo') }}</span>
            <RosIcone v-if="nota.pinned" nome="push_pin" :tamanho="14" class="notas__cartao-pino" />
          </div>
          <p class="notas__cartao-previa">{{ previa(nota.content, t('notaVazia')) }}</p>
          <div class="notas__cartao-pe">
            <span>{{ formatarData(nota.atualizadoEm, estado.idioma) }}</span>
            <span v-if="nota.tags && nota.tags.length" class="notas__cartao-tags">
              #{{ nota.tags[0]
              }}<template v-if="nota.tags.length > 1"> +{{ nota.tags.length - 1 }}</template>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- O editor -->
    <div v-if="n.editorAberto.value && n.editando.value" class="notas__editor">
      <div class="notas__editor-topo">
        <RosBotao icone="arrow_back" :rotulo="t('voltar')" @click="n.fechar()" />
        <input
          v-model="n.editando.value.title"
          class="notas__titulo"
          :placeholder="t('tituloDaNota')"
          :aria-label="t('tituloDaNota')"
          @input="n.textoMudou()"
        />
        <RosBotao
          icone="push_pin"
          :rotulo="n.editando.value.pinned ? t('desafixar') : t('fixar')"
          :ligado="Boolean(n.editando.value.pinned)"
          :acento="ACENTO"
          @click="n.alternarFixa()"
        />
        <RosBotao icone="delete" :rotulo="t('excluir')" @click="confirmarExclusao = true" />
      </div>

      <div class="notas__ferramentas notas__sem-rolagem">
        <div class="notas__modos" role="group">
          <button
            v-for="m in MODOS"
            :key="m.valor"
            :class="{ ativo: modo === m.valor }"
            :aria-pressed="String(modo === m.valor)"
            @click="modo = m.valor"
          >
            {{ t(m.texto) }}
          </button>
        </div>
        <div class="notas__espaco"></div>
        <template v-if="modo !== 'preview'">
          <RosBotao
            v-for="f in FORMATOS"
            :key="f.icone"
            :icone="f.icone"
            :rotulo="t(f.texto)"
            :tamanho-do-icone="18"
            class="notas__ferramenta"
            @click="f.link ? inserirLink() : marcarSelecao(f.antes, f.depois)"
          />
        </template>
        <RosBotao
          icone="auto_awesome"
          :rotulo="t('melhorarComIa')"
          :ligado="n.iaAberta.value"
          :acento="ACENTO"
          :tamanho-do-icone="18"
          class="notas__ferramenta notas__ferramenta--ia"
          @click="alternarIa"
        />
      </div>

      <div class="notas__corpo" :class="`notas__corpo--${modo}`">
        <!-- A âncora do painel de IA do sistema: vazia, e o Vue das Notas nunca desenha nada
             dentro dela. Com `display: contents` ela não ocupa caixa, e o painel se posiciona
             pelo corpo, que é o `position: relative` mais perto. -->
        <div ref="ancoraDaIa" class="notas__ancora-ia"></div>
        <textarea
          v-if="modo !== 'preview'"
          ref="campoDoTexto"
          v-model="n.editando.value.content"
          class="notas__texto notas__rolagem"
          :placeholder="t('escreverMarkdown')"
          :aria-label="t('escreverMarkdown')"
          @input="n.textoMudou()"
        ></textarea>
        <!-- eslint-disable vue/no-v-html -- markdownSeguro: DOMPurify.sanitize(marked.parse(...)) -->
        <div
          v-if="modo !== 'edit'"
          class="notas__previa notas__rolagem"
          v-html="n.htmlDaPrevia.value"
        ></div>
        <!-- eslint-enable vue/no-v-html -->
      </div>

      <div class="notas__editor-pe">
        <div class="notas__tags">
          <span v-for="etiqueta in n.editando.value.tags" :key="etiqueta" class="notas__tag">
            #{{ etiqueta }}
            <button :aria-label="`${t('excluir')} #${etiqueta}`" @click="n.removerTag(etiqueta)">
              <RosIcone nome="close" :tamanho="13" />
            </button>
          </span>
          <input
            v-model="rascunhoDaTag"
            class="notas__tag-campo"
            :placeholder="t('adicionarTag')"
            :aria-label="t('adicionarTag')"
            @keydown.enter.prevent="confirmarTag"
          />
        </div>
        <div class="notas__acoes">
          <RosBotao
            :icone="
              n.editando.value.showOnDesktop !== false
                ? 'desktop_windows'
                : 'desktop_access_disabled'
            "
            :rotulo="t('mostrarNotasNaMesa')"
            :ligado="n.editando.value.showOnDesktop !== false"
            :acento="ACENTO"
            @click="n.alternarMesa()"
          />
          <div class="notas__exportar">
            <RosBotao
              icone="ios_share"
              :rotulo="t('exportar')"
              :ligado="menuDeExportar"
              :acento="ACENTO"
              @click="menuDeExportar = !menuDeExportar"
            />
            <div
              v-if="menuDeExportar"
              class="notas__menu-fundo"
              @click.self="menuDeExportar = false"
              @keydown.esc.stop="menuDeExportar = false"
            >
              <div class="notas__menu" role="menu">
                <button role="menuitem" @click="exportar('md')">{{ t('exportarMarkdown') }}</button>
                <button role="menuitem" @click="exportar('txt')">{{ t('exportarTexto') }}</button>
                <button role="menuitem" @click="salvarEmArquivos">
                  {{ t('salvarEmArquivos') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <RosFolha
      v-model="ajustesAbertos"
      :titulo="t('ajustes')"
      icone="tune"
      :acento="ACENTO"
      :rotulo-fechar="t('fechar')"
    >
      <div class="notas__ajustes">
        <div class="notas__ajuste">
          <span class="notas__ajuste-rotulo"
            ><RosIcone nome="sort" :tamanho="18" />{{ t('ordenarPor') }}</span
          >
          <div class="notas__segmentos" role="group">
            <button
              v-for="o in ORDENS"
              :key="o"
              :class="{ ativo: n.preferencias.sortBy === o }"
              :aria-pressed="String(n.preferencias.sortBy === o)"
              @click="n.preferir({ sortBy: o })"
            >
              {{ t(`ordem_${o}`) }}
            </button>
          </div>
        </div>
        <div class="notas__ajuste">
          <span class="notas__ajuste-rotulo"
            ><RosIcone nome="grid_view" :tamanho="18" />{{ t('grade') }}</span
          >
          <div class="notas__segmentos" role="group">
            <button
              v-for="v in ['list', 'grid']"
              :key="v"
              :class="{ ativo: n.preferencias.viewMode === v }"
              :aria-pressed="String(n.preferencias.viewMode === v)"
              @click="n.preferir({ viewMode: v })"
            >
              {{ v === 'grid' ? t('grade') : t('lista') }}
            </button>
          </div>
        </div>
        <div class="notas__ajuste notas__ajuste--linha">
          <span class="notas__ajuste-rotulo"
            ><RosIcone nome="desktop_windows" :tamanho="18" />{{ t('mostrarNotasNaMesa') }}</span
          >
          <RosInterruptor
            :model-value="n.preferencias.showOnDesktop"
            :rotulo="t('mostrarNotasNaMesa')"
            :acento="ACENTO"
            @update:model-value="(v) => n.preferir({ showOnDesktop: v })"
          />
        </div>
      </div>
    </RosFolha>

    <RosConfirmar
      v-model="confirmarExclusao"
      :titulo="t('excluirNota')"
      :texto="t('confirmarExclusao')"
      icone="delete"
      perigo
      :rotulo-confirmar="t('excluir')"
      :rotulo-cancelar="t('cancelar')"
      @confirmar="n.excluir()"
    />
  </div>
</template>

<script setup>
// A tela das Notas. O motor (useNotas.js) guarda, grava e fala com o sistema; aqui só se
// desenha e se chama. A barra de Markdown fica aqui porque depende da seleção do campo.
import { nextTick, onBeforeUnmount, ref } from 'vue'
import {
  RosBotao,
  RosConfirmar,
  RosFolha,
  RosIcone,
  RosInterruptor,
  RosVazio,
} from '@roqueos-apps/ui'
import { ACENTO, criarNotas } from './useNotas.js'
import { ORDENS, formatarData, marcar, previa } from './notas.js'
import { traduzir } from './textos.js'

const props = defineProps({
  /** O sistema do app-sdk. */
  sistema: { type: Object, required: true },
  /** `{ idioma, textos, ativo, leve }`, que o index.js mantém. */
  estado: { type: Object, required: true },
})

const t = (chave) => traduzir(props.estado.textos, chave)
const n = criarNotas({ sistema: props.sistema, t })

const MODOS = [
  { valor: 'edit', texto: 'editar' },
  { valor: 'split', texto: 'dividido' },
  { valor: 'preview', texto: 'visualizar' },
]
const FORMATOS = [
  { icone: 'format_bold', texto: 'fmtNegrito', antes: '**', depois: '**' },
  { icone: 'format_italic', texto: 'fmtItalico', antes: '*', depois: '*' },
  { icone: 'title', texto: 'fmtTitulo', antes: '## ', depois: '' },
  { icone: 'format_list_bulleted', texto: 'fmtLista', antes: '- ', depois: '' },
  { icone: 'checklist', texto: 'fmtTarefas', antes: '- [ ] ', depois: '' },
  { icone: 'code', texto: 'fmtCodigo', antes: '`', depois: '`' },
  { icone: 'link', texto: 'fmtLink', link: true },
  { icone: 'format_quote', texto: 'fmtCitacao', antes: '> ', depois: '' },
]
const estiloDoAcento = { '--notas-acento': ACENTO, '--notas-acento-rgb': '245, 158, 11' }

const ajustesAbertos = ref(false)
const confirmarExclusao = ref(false)
const menuDeExportar = ref(false)
const modo = ref('edit')
const ancoraDaIa = ref(null)
const campoDoTexto = ref(null)
const rascunhoDaTag = ref('')

function alternarVisualizacao() {
  n.preferir({ viewMode: n.preferencias.viewMode === 'grid' ? 'list' : 'grid' })
}
function confirmarTag() {
  n.adicionarTag(rascunhoDaTag.value)
  rascunhoDaTag.value = ''
}
function exportar(formato) {
  menuDeExportar.value = false
  n.exportar(formato)
}
function salvarEmArquivos() {
  menuDeExportar.value = false
  n.salvarEmArquivos()
}
function alternarIa() {
  if (n.iaAberta.value) n.fecharIa()
  else if (ancoraDaIa.value) n.abrirIa(ancoraDaIa.value)
}

async function marcarSelecao(antes, depois) {
  const campo = campoDoTexto.value
  const nota = n.editando.value
  if (!campo || !nota) return
  const { texto, selecao } = marcar(
    nota.content || '',
    campo.selectionStart,
    campo.selectionEnd,
    antes,
    depois,
  )
  nota.content = texto
  n.textoMudou()
  await nextTick()
  campo.focus()
  campo.setSelectionRange(...selecao)
}
function inserirLink() {
  const url = globalThis.prompt?.(t('enderecoDoLink'))
  if (url) marcarSelecao('[', `](${url})`)
}

onBeforeUnmount(() => n.encerrar())
</script>

<style lang="scss" scoped>
@import './notas.scss';
</style>
