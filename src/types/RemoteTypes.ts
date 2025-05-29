import type { CursorPosition } from './CursorType'
import type { Col } from './DocumentType'
import type { RegistryRecord } from './RegistryType'
import type { User } from './UserType'

export type RemoteUser = {
  user: User
  color: {
    active: string
    inactive: string
    text: string
    background?: string[]
    borderStart?: string[]
    opacity?: string[]
  }
  activity: number
  position?: CursorPosition
  selection: {
    start?: CursorPosition
    end?: CursorPosition
  }
  activityInterval?: number
}

export type RemoteCallbacks = {
  addColumn: (cols: Col[], cursor: CursorPosition) => void
  removeColumn: (start: CursorPosition, end: CursorPosition) => void
  updateUsers: (user: User) => void
  updateRegistry: (record: RegistryRecord) => void
  syncRegistries: (records: RegistryRecord[]) => void
}

export type RemoteEvent = keyof RemoteCallbacks
