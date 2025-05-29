import { ref } from 'vue'
import { defineStore } from 'pinia'
import { UpdateOrigin } from '@/types/DocumentType'
import { useDocumentStore, type ActionRecord } from './document'
// import { useCursorStore } from './cursor'

type HistoryRecord = Omit<ActionRecord, 'action'> & {
  undo: 'paste' | 'remove'
  redo: 'paste' | 'remove'
}
const actionsQueue: ActionRecord[] = []

export const useHistoryStore = defineStore('history', () => {
  const history = ref<HistoryRecord[]>([])
  const present = ref<HistoryRecord>()
  const future = ref<HistoryRecord[]>([])

  const documentStore = useDocumentStore()
  // const cursorStore = useCursorStore()

  const addAction = (action: ActionRecord) => {
    if (present.value) {
      history.value.push(present.value)
    }

    present.value = {
      ...action,
      undo: action.action === 'paste' ? 'remove' : 'paste',
      redo: action.action,
    }
    future.value = []
  }

  let timeout: number
  let throttling = false
  const throttleActions = () => {
    if (throttling) {
      clearTimeout(timeout)
    }
    throttling = true
    timeout = setTimeout(async () => {
      throttling = false
      let fakeAction: ActionRecord | undefined
      for (const record of actionsQueue) {
        if (record.cols.length > 1) {
          if (fakeAction) addAction(fakeAction)
          addAction(record)
          continue
        } else if (!fakeAction) {
          fakeAction = record
          continue
        } else {
          if (record.action === fakeAction.action) {
            fakeAction.cols.push(...record.cols)
            if (record.start.line === fakeAction.start.line) {
              fakeAction.start.col = Math.min(fakeAction.start.col, record.start.col)
            } else if (record.start.line < fakeAction.start.line) {
              fakeAction.start.line = record.start.line
              fakeAction.start.col = record.start.col
            }

            const eols = fakeAction.cols.filter((col) => col.isEOL)
            fakeAction.end.line = fakeAction.start.line + eols.length
            fakeAction.end.col =
              fakeAction.cols.length - fakeAction.cols.indexOf(eols[eols.length - 1])
          } else {
            addAction(fakeAction)
            fakeAction = record
          }
        }
      }
      if (fakeAction) addAction(fakeAction)
      actionsQueue.length = 0
    }, 500)
  }

  documentStore.onAction((action) => {
    if (action.origin === UpdateOrigin.HISTORY) return
    actionsQueue.push(action)
    throttleActions()
  })

  // const throttleDocumentUpdate = (document: Document) => {
  //   if (throttling) {
  //     clearTimeout(timeout)
  //   }
  //   throttling = true
  //   timeout = setTimeout(async () => {
  //     throttling = false
  //     if (document.updateOrigin === UpdateOrigin.HISTORY) {
  //       const cursor = cursorStore.cursor
  //       if (cursor.line >= document.lines.length) {
  //         cursor.line = document.lines.length - 1
  //       }
  //       if (cursor.col >= document.lines[cursor.line].cols.length - 1) {
  //         cursor.col = document.lines[cursor.line].cols.length - 1
  //       }
  //       cursorStore.setCursorAt(cursor)
  //       return
  //     }
  //     if (present.value) history.value.push(present.value)
  //     present.value = {
  //       lines: JSON.stringify(documentStore.document.lines),
  //     }
  //     future.value = []
  //   }, 500)
  // }
  // watch(
  //   () => documentStore.document.lines,
  //   () => {
  //     throttleDocumentUpdate(documentStore.document)
  //   },
  //   { deep: true, immediate: true },
  // )

  return {
    canUndo() {
      return history.value.length > 0
    },
    canRedo() {
      return future.value.length > 0
    },
    undo() {
      const lastHistory = history.value.pop()
      if (lastHistory) {
        if (present.value) future.value.push(present.value)
        present.value = lastHistory
        if (lastHistory.undo === 'paste') {
          documentStore.pasteBlockAt(lastHistory.start, lastHistory.cols, UpdateOrigin.HISTORY)
        } else {
          documentStore.removeBlock(lastHistory.start, lastHistory.end, UpdateOrigin.HISTORY)
        }
      }
    },
    redo() {
      const lastHistory = future.value.pop()
      if (lastHistory) {
        if (present.value) history.value.push(present.value)
        present.value = lastHistory
        if (lastHistory.redo === 'paste') {
          documentStore.pasteBlockAt(lastHistory.start, lastHistory.cols, UpdateOrigin.HISTORY)
        } else {
          documentStore.removeBlock(lastHistory.start, lastHistory.end, UpdateOrigin.HISTORY)
        }
      }
    },
  }
})
