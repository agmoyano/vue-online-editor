export type Page = {
  lines: Line[]
}

export type Line = {
  cols: Col[]
}

export type Col = {
  value?: string
  isEOL?: boolean
  selected?: boolean
  remoteSelected?: boolean
  remoteBgSelectedColor?: string
  remoteCursorBgColor?: string
  remoteCursorName?: string
  cursor?: boolean
}

export enum UpdateOrigin {
  HISTORY = 'history',
  USER = 'user',
  LOAD = 'load',
  REMOTE = 'remote',
}

export type Document = {
  pages?: Page[]
  lines: Line[]
  updateOrigin?: UpdateOrigin
}
