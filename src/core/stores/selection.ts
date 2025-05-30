import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useCursorStore } from './cursor'
import type { Col } from '@/types/DocumentType'
import { useDocumentStore } from './document'
import { getOrderedPosition, isColSelected, isSelectionAvailable } from '@/utils/StoreUtils'
import { useRemoteHandler } from '../composables/RemoteHandler'
import type { SelectionType } from '@/types/SelectionTypes'

export const useSelectionStore = defineStore('selection', () => {
  const cursorStore = useCursorStore()
  const documentStore = useDocumentStore()
  const remote = useRemoteHandler()

  const selection = ref<SelectionType>({})
  const selectingFlag = ref<boolean>(false)

  const copy = ref<Col[]>([])

  watch(
    () => cursorStore.cursor,
    () => {
      if (selectingFlag.value) {
        const { line, col } = { ...cursorStore.cursor }
        selection.value.end = { line, col }
      } else {
        selection.value = {}
      }
    },
  )

  watch(
    selection,
    (selection, oldSelection) => {
      // console.log('Selection: ', JSON.stringify(selection, null, 2))
      if (isSelectionAvailable(selection.start, selection.end)) {
        remote.updateDocumentSelection(selection.start!, selection.end!)
      } else if (oldSelection.start || oldSelection.end) {
        remote.updateDocumentSelection()
      }
    },
    {
      deep: true,
    },
  )

  return {
    selection: computed(() => {
      const { start, end } = JSON.parse(JSON.stringify(selection.value))
      if (!isSelectionAvailable(start, end)) return {}
      // const { last } = getOrderedPosition(start!, end!)
      // last.col--
      return { start, end }
    }),
    selectingFlag: computed(() => selectingFlag.value),
    hasSelection: computed(() => isSelectionAvailable(selection.value.start, selection.value.end)),
    copy: computed(() => copy.value),
    createCopy: () => {
      const { start, end } = { ...selection.value }
      if (!isSelectionAvailable(start, end)) return false
      const { first, last } = getOrderedPosition(start!, end!)
      const { lines } = documentStore.document
      if (first.line === last.line) {
        copy.value = lines[first.line].cols.slice(first.col, last.col + 1)
        return
      }
      copy.value = lines.reduce<Col[]>((acc, line, index) => {
        if (index < first.line || index > last.line) return acc
        if (index === first.line) {
          acc.push(...line.cols.slice(first.col))
        } else if (index === last.line) {
          acc.push(...line.cols.slice(0, last.col + 1))
        } else {
          acc.push(...line.cols)
        }
        return acc
      }, [])
    },
    isSelected(line: number, col: number) {
      return isColSelected({ ...selection.value }, line, col)
    },
    signalStartSelection() {
      // console.log('signalStartSelection')
      selectingFlag.value = true
      const { line, col } = cursorStore.cursor
      if (!selection.value.start) selection.value = { start: { line, col } }
    },
    signalStopSelection() {
      selectingFlag.value = false
      const { line, col } = { ...cursorStore.cursor }
      selection.value.end = { line, col }
    },
    clearSelection() {
      selectingFlag.value = false
      selection.value = {}
    },
  }
})
