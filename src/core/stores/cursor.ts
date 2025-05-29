import { ref, computed, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { Document } from '@/types/DocumentType'
import type { CursorPosition } from '@/types/CursorType'
import { useDocumentStore } from './document'
import { useRemoteHandler } from '../composables/RemoteHandler'

const moveCursorAction = (
  direction: string,
  cursor: CursorPosition,
  document: Document,
): CursorPosition => {
  const { line, col } = cursor
  switch (direction) {
    case 'up':
      if (line > 0) {
        const newLine = line - 1
        return {
          line: newLine,
          col: Math.min(document.lines[newLine].cols.length - 1, col),
        }
      }
      break
    case 'down':
      if (line < document.lines.length - 1) {
        const newLine = line + 1
        return {
          line: newLine,
          col: Math.min(document.lines[newLine].cols.length - 1, col),
        }
      }
      break
    case 'left':
      if (line === 0 && col === 0) return { line, col }
      if (col > 0) {
        return {
          line,
          col: col - 1,
        }
      } else if (line > 0) {
        const newLine = line - 1
        return {
          line: newLine,
          col: document.lines[newLine].cols.length - 1,
        }
      }
      break
    case 'right':
      if (col < document.lines[line].cols.length - 1) {
        return {
          line,
          col: col + 1,
        }
      } else if (line < document.lines.length - 1) {
        const newLine = line + 1
        return {
          line: newLine,
          col: 0,
        }
      } else {
        return {
          line,
          col,
        }
      }
  }
  return cursor
}

export const useCursorStore = defineStore('cursor', () => {
  const cursorBlink = ref(true)
  const cursor = ref<CursorPosition>({
    line: 0,
    col: 0,
  })
  // setInterval(() => {
  //   cursorBlink.value = !cursorBlink.value
  // }, 500)

  const { document } = storeToRefs(useDocumentStore())
  const remote = useRemoteHandler()

  watch(cursor, (cursor) => {
    remote.updateCursorPosition(cursor)
  })

  return {
    cursor: computed(() => cursor.value),
    cursorBlink: computed(() => cursorBlink.value),
    setCursorAt: (newCursor: Partial<CursorPosition>) => {
      console.log('setCursorAt', newCursor)
      cursor.value = { ...cursor.value, ...newCursor }
    },
    moveCursor: (direction: string) => {
      console.log('moving cursor')
      cursor.value = moveCursorAction(direction, cursor.value, document.value)
    },
    teleportTo(target: 'EOL' | 'BOL') {
      switch (target) {
        case 'EOL':
          cursor.value.col = document.value.lines[cursor.value.line].cols.length - 1
          break
        case 'BOL':
          cursor.value.col = 0
          break
      }
    },
  }
})
