import type { CursorPosition } from '@/types/CursorType'
import type { Col } from '@/types/DocumentType'
import type { RegistryRecord } from '@/types/RegistryType'
import type { RemoteServer, RemoteStates } from '@/types/RemoteServerInterface'
import type { User } from '@/types/UserType'
import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'

const state = ref<RemoteStates>('disconnected')
let socket: Socket

const listeners: {
  event: string
  listenerCallback:
    | ((id: string, cols: Col[], cursor: CursorPosition, user: User) => void)
    | ((id: string, start: CursorPosition, end: CursorPosition, user: User) => void)
    | ((id: string, user: User) => void)
    | ((id: string, cursor: CursorPosition, user: User) => void)
    | ((registry: RegistryRecord, user: User) => void)
    | ((registries: RegistryRecord[]) => void)
}[] = []

export const useWebSocket = (): RemoteServer => {
  return {
    state,
    connect(user: User) {
      state.value = 'connecting'
      socket = io('ws://localhost:3000')
      socket.on('disconnect', () => {
        console.log('Disconnected from server')
        state.value = 'disconnected'
      })
      socket.on('error', (error) => {
        console.log('Error from server', error)
        state.value = 'error'
      })

      socket.on('connect', () => {
        console.log('Connected to server')
        state.value = 'connected'
        listeners.forEach((listener) => {
          socket.on(listener.event, listener.listenerCallback)
        })
      })

      socket.emit('join:user', user, () => {
        console.log('Joined server')
        state.value = 'joined'
      })
    },
    async disconnect() {
      socket.disconnect()
      state.value = 'disconnected'
    },
    async updateRegistry(registry: RegistryRecord) {
      await new Promise((resolve) => {
        socket.emit('update:document:registry', registry.id, registry, resolve)
      })
      console.log('Updated registry')
    },
    async updateCursorPosition(id: string, cursor: CursorPosition) {
      await new Promise((resolve) => {
        socket.emit('update:active:position', id, cursor, resolve)
      })
      console.log('Updated cursor position')
    },
    async updateDocumentSelection(id: string, start?: CursorPosition, end?: CursorPosition) {
      await new Promise((resolve) => {
        socket.emit('update:active:selection', id, start, end, resolve)
      })
      console.log('Updated document selection')
    },
    async addDocumentColumn(id: string, cols: Col[], cursor: CursorPosition) {
      await new Promise((resolve) => {
        socket.emit('add:active:column', id, cols, cursor, resolve)
      })
      console.log('Add document column')
    },
    async removeDocumentColumn(id: string, start: CursorPosition, end: CursorPosition) {
      await new Promise((resolve) => {
        socket.emit('remove:active:column', id, start, end, resolve)
      })
      console.log('Add document column')
    },
    async joinActiveRegistry(id: string): Promise<RegistryRecord | undefined> {
      const registry = await new Promise<RegistryRecord | undefined>((resolve) => {
        socket.emit('join:active', id, resolve)
      })
      console.log('Joined active registry')
      return registry
    },
    async leaveActiveRegistry(id: string) {
      await new Promise((resolve) => {
        socket.emit('leave:active', id, resolve)
      })
      console.log('Left active registry')
    },

    // Listeners
    onRemoteAddColumn(
      callback: (id: string, cols: Col[], cursor: CursorPosition, user: User) => void,
    ) {
      if (!socket) {
        listeners.push({
          event: 'add:active:column',
          listenerCallback: callback,
        })
        return
      }
      socket.on('add:active:column', callback)
    },
    onRemoteRemoveColumn(
      callback: (id: string, start: CursorPosition, end: CursorPosition, user: User) => void,
    ) {
      if (!socket) {
        listeners.push({
          event: 'remove:active:column',
          listenerCallback: callback,
        })
        return
      }
      socket.on('remove:active:column', callback)
    },
    onRemoteUsersUpdate(callback: (id: string, user: User) => void) {
      if (!socket) {
        listeners.push({
          event: 'update:active:users',
          listenerCallback: callback,
        })
        return
      }
      socket.on('update:active:users', callback)
    },
    onRemoteCursorPositionUpdate(
      callback: (id: string, cursor: CursorPosition, user: User) => void,
    ) {
      if (!socket) {
        listeners.push({
          event: 'update:active:position',
          listenerCallback: callback,
        })
        return
      }
      socket.on('update:active:position', callback)
    },
    onRemoteRegistryUpdate(callback: (registry: RegistryRecord, user: User) => void) {
      if (!socket) {
        listeners.push({
          event: 'update:document:registry',
          listenerCallback: callback,
        })
        return
      }
      socket.on('update:document:registry', callback)
    },
    onUserRegistries(callback: (registries: RegistryRecord[]) => void) {
      if (!socket) {
        listeners.push({
          event: 'user:registries',
          listenerCallback: callback,
        })
        return
      }
      socket.on('user:registries', callback)
    },
    onRemoteSelectionUpdate(
      callback: (id: string, user: User, start?: CursorPosition, end?: CursorPosition) => void,
    ) {
      const listenerCallback = (
        id: string,
        start: CursorPosition,
        end: CursorPosition,
        user: User,
      ) => {
        callback(id, user, start, end)
        console.log(`received remote selection for ${id}`)
      }
      if (!socket) {
        listeners.push({
          event: 'update:active:selection',
          listenerCallback,
        })
        return
      }
      socket.on('update:active:selection', listenerCallback)
    },
  }
}
