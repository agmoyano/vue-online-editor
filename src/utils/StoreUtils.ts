import type { CursorPosition } from '@/types/CursorType'
import type { SelectionType } from '@/types/SelectionTypes'

export const getOrderedPosition = (start: CursorPosition, end: CursorPosition) => {
  let first: CursorPosition
  let last: CursorPosition
  if (start.line !== end.line) {
    first = start.line <= end.line ? start : end
    last = start.line > end.line ? start : end
  } else {
    first = start.col <= end.col ? start : end
    last = start.col > end.col ? start : end
  }
  return { first, last }
}

export const isColSelected = (selection: SelectionType, line: number, col: number) => {
  const { start, end } = selection
  if (!isSelectionAvailable(start, end)) return false
  const { first, last } = getOrderedPosition(start!, end!)
  if (line < first.line || line > last.line) return false
  if (line === first.line && col < first.col) return false
  if (line === last.line && col > last.col - 1) return false
  return true
}

export const isSelectionAvailable = (start?: CursorPosition, end?: CursorPosition) => {
  if (!start || !end) return false
  if (start.line === end.line && start.col === end.col) return false
  return true
}
