import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { type Document, type Line, type Col, UpdateOrigin } from '@/types/DocumentType'
import type { CursorPosition } from '@/types/CursorType'
import { getOrderedPosition } from '@/utils/StoreUtils'
import { useRemoteHandler } from '../composables/RemoteHandler'

const createEOL = (): Col => {
  return {
    isEOL: true,
  }
}

const processLine = (col: string): Line => {
  const line: Line = {
    cols: Array.from(col).map((char) => ({
      value: char,
    })),
  }
  const endOfLine = createEOL()
  line.cols.push(endOfLine)
  return line
}

const processDocumentString = (newDocument: string): Document => {
  const rows = newDocument.split('\n')

  const document: Document = {
    lines: rows.map(processLine),
  }

  return document
}

const createNewLine = (): Line => {
  return {
    cols: [createEOL()],
  }
}

const createNewDocument = (): Document => {
  const line = createNewLine()
  return {
    lines: [line],
  }
}

export type ActionRecord = {
  action: 'paste' | 'remove'
  start: CursorPosition
  end: CursorPosition
  cols: Col[]
  origin: UpdateOrigin
}

const actionListeners: ((record: ActionRecord) => void)[] = []

const publishAction = (
  action: 'paste' | 'remove',
  start: CursorPosition,
  end: CursorPosition,
  cols: Col[],
  origin: UpdateOrigin,
) => {
  const record: ActionRecord = {
    action,
    start,
    end,
    cols,
    origin,
  }
  for (const listener of actionListeners) {
    listener(record)
  }
}
export const useDocumentStore = defineStore('document', () => {
  const document = ref<Document>(createNewDocument())

  const remote = useRemoteHandler()

  const pasteCols = (cursor: CursorPosition, copy: Col[], origin: UpdateOrigin) => {
    const start = { ...cursor }
    let currentLine: Line = document.value.lines[cursor.line]
    const remainingCols = currentLine.cols.splice(cursor.col, currentLine.cols.length - cursor.col)
    for (const col of copy) {
      currentLine.cols.splice(cursor.col, 0, col)
      cursor.col++
      if (col.isEOL) {
        currentLine = { cols: [] }
        document.value.lines.splice(++cursor.line, 0, currentLine)
        cursor.col = 0
      }
    }
    currentLine.cols.splice(cursor.col, 0, ...remainingCols)
    publishAction('paste', start, cursor, copy, origin)
    return cursor
  }

  const removeCols = (start: CursorPosition, end: CursorPosition, origin: UpdateOrigin) => {
    const { first, last } = getOrderedPosition(start, end)
    const { lines } = document.value

    let cols: Col[] = []
    if (first.line === last.line) {
      cols = lines[first.line].cols.splice(first.col, last.col - first.col)
    } else {
      const remainingCols: Col[] = lines[last.line].cols.splice(
        last.col,
        lines[last.line].cols.length - last.col,
      )
      // console.log(remainingCols)
      const removedLines = lines.splice(first.line + 1, last.line - first.line)
      cols = lines[first.line].cols.splice(
        first.col,
        lines[first.line].cols.length - first.col,
        ...remainingCols,
      )
      cols = removedLines.reduce<Col[]>((acc, line) => {
        acc.push(...line.cols)
        return acc
      }, cols)
    }
    publishAction('remove', first, last, cols, origin)
    return first
  }

  remote.on('addColumn', (cols, cursor) => {
    pasteCols(cursor, cols, UpdateOrigin.REMOTE)
  })

  remote.on('removeColumn', (start, end) => {
    removeCols(start, end, UpdateOrigin.REMOTE)
  })

  return {
    document: computed(() => document.value),
    load: (newDocument: string, origin = UpdateOrigin.LOAD) => {
      document.value = processDocumentString(newDocument)
      document.value.updateOrigin = origin
    },
    addNewLineAt: (cursor: CursorPosition, origin = UpdateOrigin.USER) => {
      document.value.updateOrigin = origin
      return pasteCols(cursor, [createEOL()], origin)
    },
    addNewCharAt(cursor: CursorPosition, char: string, origin = UpdateOrigin.USER) {
      document.value.updateOrigin = origin
      return pasteCols(cursor, [{ value: char }], origin)
    },
    removeCharAt(
      cursor: CursorPosition,
      options = { forward: false },
      origin = UpdateOrigin.USER,
    ): CursorPosition {
      document.value.updateOrigin = origin
      const { line, col } = cursor
      const { forward } = options
      if (!forward) {
        const start = { line, col }
        if (line === 0 && col === 0) return cursor
        if (col === 0) {
          start.line--
          start.col = document.value.lines[start.line].cols.length - 1
        } else {
          start.col--
        }
        removeCols(start, cursor, origin)
        return start
      } else {
        const currentCol = document.value.lines[line].cols[col]
        const end = { line, col }
        if (line === document.value.lines.length - 1 && currentCol.isEOL) return cursor
        if (currentCol.isEOL) {
          end.line++
          end.col = 0
        } else {
          end.col++
        }
        removeCols(cursor, end, origin)
        return cursor
      }
    },
    removeBlock(start: CursorPosition, end: CursorPosition, origin = UpdateOrigin.USER) {
      document.value.updateOrigin = origin
      return removeCols(start, end, origin)
    },
    pasteBlockAt(cursor: CursorPosition, copy: Col[], origin = UpdateOrigin.USER): CursorPosition {
      document.value.updateOrigin = origin
      pasteCols(cursor, copy, origin)
      return cursor
    },
    setDocumentLinesState(lines: Line[], origin = UpdateOrigin.HISTORY) {
      document.value.lines = lines
      document.value.updateOrigin = origin
    },
    setDocumentState(newDocument: Document, origin = UpdateOrigin.LOAD) {
      document.value = newDocument
      document.value.updateOrigin = origin
    },
    createNewDocument,
    createNewLine,
    onAction(listener: (record: ActionRecord) => void) {
      actionListeners.push(listener)
    },
  }
})
