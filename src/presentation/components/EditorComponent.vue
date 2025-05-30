<template>
  <div
    class="document flex-row flex"
    ref="mainDocument"
    tabindex="-1"
    @keydown.prevent="handleKeyDown"
    @keyup.prevent="handleKeyUp"
    role="textbox"
    contenteditable="true"
    aria-multiline="true"
  >
    <div>
      <div
        v-for="(line, lineIndex) in documentStore.document.lines"
        :key="lineIndex"
        class="line"
        @click.capture="cursorStore.setCursorAt({ line: lineIndex, col: line.cols.length - 1 })"
      >
        <div class="w-5 text-xs text-gray-400 mr-3 text-right">{{ lineIndex + 1 }}</div>
        <div
          v-for="(col, colIndex) in line.cols"
          :key="colIndex"
          @click.capture="cursorStore.setCursorAt({ line: lineIndex, col: colIndex })"
          :class="[
            'col relative',
            getClasses(lineIndex, colIndex),
            {
              space: col.value === ' ',
            },
          ]"
        >
          <span
            v-if="getRemoteCursorName(lineIndex, colIndex)"
            :class="[
              'absolute text-xs py-1/2 px-1 inline rounded-box -top-full -left-1/2',
              getRemoteCursorTagClasses(lineIndex, colIndex),
            ]"
            :style="getRemoteCursorTagStyle(lineIndex, colIndex)"
            >{{ getRemoteCursorName(lineIndex, colIndex) }}</span
          >
          {{ col.value }}
        </div>
      </div>
    </div>
    <!-- <hr /> -->
    <!-- <pre>{{ cursorStore.cursor }}</pre> -->
    <!-- <pre>{{ selectionStore.copy }}</pre> -->
    <!-- <pre>{{ selectionStore.selection }}</pre> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useDocumentStore } from '@/core/stores/document'
import { useCursorStore } from '@/core/stores/cursor'
import { useKeyHandler } from '@/core/composables/KeyHandler'
import { useSelectionStore } from '@/core/stores/selection'
import { useRegistryStore } from '@/core/stores/registry'
import { useRemoteHandler } from '@/core/composables/RemoteHandler'

const { handleKeyDown, handleKeyUp } = useKeyHandler()

const documentStore = useDocumentStore()
const cursorStore = useCursorStore()
const selectionStore = useSelectionStore()
const registryStore = useRegistryStore()

const remote = useRemoteHandler()

type Props = {
  id: string
}

const props = defineProps<Props>()

watch(
  remote.state,
  (state) => {
    if (state === 'joined') {
      registryStore.loadDocumentById(props.id)
    }
  },
  { immediate: true },
)

const mainDocument = ref<HTMLDivElement | undefined>()

onMounted(() => {
  mainDocument.value!.focus()
  cursorStore.setCursorAt({ line: 0, col: 0 })
})

onUnmounted(() => {
  registryStore.leaveActiveDocument()
})

const getRemoteCursorTagStyle = (lineIndex: number, colIndex: number) => {
  const remoteUser = remote.getRemoteUser(lineIndex, colIndex)
  const styles: { [key: string]: string } = {}

  if (remoteUser?.activity !== 5) {
    styles['opacity'] = '0%'
  }
  return styles
}

const getRemoteCursorTagClasses = (lineIndex: number, colIndex: number) => {
  const classes: { [key: string]: boolean } = {}

  const remoteUser = remote.getRemoteUser(lineIndex, colIndex)
  if (remoteUser) {
    classes['transition-color'] = true
    classes['transition-opacity'] = true
    classes['duration-[5s]'] = true
    const backgroundColor = remoteUser.color.background?.[5]
    if (backgroundColor) {
      classes[backgroundColor] = true
    }
    const opacity = remoteUser.color.opacity?.[5]
    if (opacity) {
      classes[opacity] = true
    }
  }

  return classes
}

const getRemoteCursorName = (lineIndex: number, colIndex: number) => {
  const remoteUser = remote.getRemoteUser(lineIndex, colIndex)
  return remoteUser?.user.nickname
}

const getClasses = (lineIndex: number, colIndex: number) => {
  const classes: { [key: string]: boolean } = {}

  if (colIndex === cursorStore.cursor.col && lineIndex === cursorStore.cursor.line) {
    classes['cursor animate-cursor'] = true
  } else {
    const remoteUser = remote.getRemoteUser(lineIndex, colIndex)
    if (remoteUser) {
      const borderClass = remoteUser.color.borderStart?.[5]
      if (borderClass) {
        classes['cursor'] = true
        classes[borderClass] = true
      }
    }
  }

  if (selectionStore.isSelected(lineIndex, colIndex)) {
    classes['bg-primary'] = true
  } else {
    const remoteUser = remote.getRemoteSelectionUser(lineIndex, colIndex)
    if (remoteUser) {
      const backgroundColor = remoteUser.color.background?.[1]
      if (backgroundColor) {
        classes[backgroundColor] = true
      }
    }
  }

  return classes
}
</script>

<style scoped>
.col {
  /* border-left: 0.5px none rgba(0, 0, 0, 0); */
  border-left-color: var(--color-base-content);
  border-left-width: 0.5px;
  border-left-style: none;
  height: 24px;
  display: flex;
  position: relative;
}

.col.cursor {
  border-left-style: solid;
}

.line {
  min-height: 24px;
  flex: 1;
  flex-direction: row;
  display: flex;
  align-items: center;
}

.space {
  min-width: 0.5em;
  min-height: 24px;
}

.document {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  outline: none;
  caret-color: transparent;
  padding: 15px;
}
</style>
