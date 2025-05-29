import type { Ref } from 'vue'
import type { User } from './UserType'
import type { RegistryRecord } from './RegistryType'
import type { CursorPosition } from './CursorType'
import type { Col } from './DocumentType'

export type RemoteStates = 'connected' | 'disconnected' | 'joined' | 'error' | 'connecting'

export interface RemoteServer {
  state: Ref<RemoteStates>
  connect(user: User): void
  disconnect(): Promise<void>
  updateRegistry(registry: RegistryRecord): Promise<void>
  updateCursorPosition(id: string, cursor: CursorPosition): Promise<void>
  updateDocumentSelection(id: string, start?: CursorPosition, end?: CursorPosition): Promise<void>
  addDocumentColumn(id: string, cols: Col[], cursor: CursorPosition): Promise<void>
  removeDocumentColumn(id: string, start: CursorPosition, end: CursorPosition): Promise<void>
  joinActiveRegistry(id: string): Promise<RegistryRecord | undefined>
  leaveActiveRegistry(id: string): Promise<void>
  onRemoteAddColumn(
    callback: (id: string, cols: Col[], cursor: CursorPosition, user: User) => void,
  ): void
  onRemoteRemoveColumn(
    callback: (id: string, start: CursorPosition, end: CursorPosition, user: User) => void,
  ): void
  onRemoteUsersUpdate(callback: (id: string, user: User) => void): void
  onRemoteCursorPositionUpdate(
    callback: (id: string, cursor: CursorPosition, user: User) => void,
  ): void
  onRemoteRegistryUpdate(callback: (registry: RegistryRecord, user: User) => void): void
  onUserRegistries(callback: (registries: RegistryRecord[]) => void): void
  onRemoteSelectionUpdate(
    callback: (id: string, user: User, start?: CursorPosition, end?: CursorPosition) => void,
  ): void
}
