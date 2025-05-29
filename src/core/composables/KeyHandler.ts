import { useCursorStore } from '@/core/stores/cursor'
import { useDocumentStore } from '@/core/stores/document'
import { useHistoryStore } from '@/core/stores/history'
import { useSelectionStore } from '@/core/stores/selection'
import type { CursorPosition } from '@/types/CursorType'

const hasModifierEnabled = (event: KeyboardEvent) => {
  if (navigator.platform.startsWith('Mac') || navigator.platform === 'iPhone') {
    return event.metaKey
  } else if (navigator.platform.startsWith('Win') || navigator.platform.startsWith('Linux')) {
    return event.ctrlKey
  }
  return event.metaKey || event.ctrlKey
}

export const useKeyHandler = () => {
  const cursorStore = useCursorStore()
  const documentStore = useDocumentStore()
  const selectionStore = useSelectionStore()
  const historyStore = useHistoryStore()

  const deleteSelection = () => {
    const { start, end } = selectionStore.selection
    const first = documentStore.removeBlock({ ...start! }, { ...end! })
    cursorStore.setCursorAt(first!)
    selectionStore.clearSelection()
  }

  return {
    handleKeyUp: (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Shift':
          console.log('stop selection')
          selectionStore.signalStopSelection()
          break
      }
    },
    handleKeyDown: (event: KeyboardEvent) => {
      console.log('keypress', event.key)
      let newPosition: CursorPosition
      switch (event.key) {
        case 'ArrowUp':
          cursorStore.moveCursor('up')
          break
        case 'ArrowDown':
          cursorStore.moveCursor('down')
          break
        case 'ArrowLeft':
          cursorStore.moveCursor('left')
          break
        case 'ArrowRight':
          cursorStore.moveCursor('right')
          break
        case 'Enter':
          newPosition = documentStore.addNewLineAt({ ...cursorStore.cursor })
          cursorStore.setCursorAt(newPosition)
          break
        case 'Backspace':
          if (selectionStore.hasSelection) {
            deleteSelection()
            break
          }
          newPosition = documentStore.removeCharAt({ ...cursorStore.cursor })
          cursorStore.setCursorAt(newPosition)
          break
        case 'Delete':
          if (selectionStore.hasSelection) {
            deleteSelection()
            break
          }
          newPosition = documentStore.removeCharAt({ ...cursorStore.cursor }, { forward: true })
          cursorStore.setCursorAt(newPosition)
          break
        case 'Tab':
          newPosition = documentStore.addNewCharAt({ ...cursorStore.cursor }, ' ')
          cursorStore.setCursorAt(newPosition)
          newPosition = documentStore.addNewCharAt({ ...cursorStore.cursor }, ' ')
          cursorStore.setCursorAt(newPosition)
          break
        case 'End':
          cursorStore.teleportTo('EOL')
          break
        case 'Home':
          cursorStore.teleportTo('BOL')
          break
        case 'Shift':
          console.log('start selection')
          selectionStore.signalStartSelection()
          break
        case 'c':
        case 'x':
        case 'v':
        case 'z':
        case 'Z':
        case 'y':
        case 'Y':
          if (hasModifierEnabled(event)) {
            switch (event.key) {
              case 'c':
                if (selectionStore.hasSelection) {
                  selectionStore.createCopy()
                }
                break
              case 'x':
                if (selectionStore.hasSelection) {
                  selectionStore.createCopy()
                  deleteSelection()
                }
                break
              case 'v':
                if (selectionStore.hasSelection) {
                  deleteSelection()
                }
                documentStore.pasteBlockAt({ ...cursorStore.cursor }, selectionStore.copy)
                break
              case 'z':
              case 'Y':
                selectionStore.clearSelection()
                historyStore.undo()
                break
              case 'Z':
              case 'y':
                selectionStore.clearSelection()
                historyStore.redo()
                break
            }
            break
          }
        default:
          if (event.key.length > 1 || event.ctrlKey || event.altKey || event.metaKey) break
          selectionStore.clearSelection()
          newPosition = documentStore.addNewCharAt({ ...cursorStore.cursor }, event.key)
          cursorStore.setCursorAt(newPosition)
          break
      }
    },
  }
}
