import type { RemoteCallbacks, RemoteEvent, RemoteUser } from '@/types/RemoteTypes'
import { computed, inject, ref } from 'vue'
import type { RegistryRecord } from '@/types/RegistryType'
import colorVariants from '@/utils/color-variants.json'
import type { CursorPosition } from '@/types/CursorType'
import type { User } from '@/types/UserType'
import type { Col } from '@/types/DocumentType'
import { isColSelected } from '@/utils/StoreUtils'
import type { RemoteServer } from '@/types/RemoteServerInterface'

const remoteUsers = ref<RemoteUser[]>([])

const listeners = new Map<RemoteEvent, RemoteCallbacks[RemoteEvent][]>()
let activeRecord: RegistryRecord | undefined
let currentUser: User | undefined
let remoteServer: RemoteServer

const addRemoteUser = (user: User) => {
  if (remoteUsers.value.some((remoteUser) => remoteUser.user.id === user.id)) return
  const { colors, variants, opacity } = colorVariants
  const color = colors[Math.floor(Math.random() * colors.length)]
  const remoteUser = {
    user,
    color: { ...variants[color as keyof typeof variants], opacity },
    activity: 0,
    selection: {},
  }
  remoteUsers.value.push(remoteUser)
}

export const useRemoteHandler = () => {
  if (!remoteServer) {
    remoteServer = inject('RemoteServer') as RemoteServer
    setListeners(remoteServer)
  }

  return {
    // Reactive
    state: computed(() => remoteServer.state.value),
    remoteUsers: computed(() => remoteUsers.value),

    // Setters
    setActive(active?: RegistryRecord) {
      activeRecord = active
      if (active === undefined) {
        remoteUsers.value = []
      } else if (currentUser) {
        const users = active.users.filter((user) => user && user.id !== currentUser!.id)
        users.forEach(addRemoteUser)
      }
    },
    setUser(user?: User) {
      currentUser = user
      if (user === undefined) remoteServer.disconnect()
    },

    // Getters
    getRemoteUser(line: number, col: number): RemoteUser | undefined {
      const remoteUser = remoteUsers.value.find((remoteUser) => {
        if (remoteUser.position) {
          return remoteUser.position.line === line && remoteUser.position.col === col
        }
        return false
      })
      if (remoteUser) {
        return remoteUser
      }
      return undefined
    },
    getRemoteSelectionUser(line: number, col: number): RemoteUser | undefined {
      return remoteUsers.value.find((remoteUser) =>
        isColSelected({ ...remoteUser.selection }, line, col),
      )
    },

    // Actions
    updateCursorPosition(cursor: CursorPosition) {
      if (activeRecord) {
        remoteServer.updateCursorPosition(activeRecord.id, cursor)
      }
    },
    updateDocumentSelection(start: CursorPosition, end: CursorPosition) {
      if (activeRecord) {
        remoteServer.updateDocumentSelection(activeRecord.id, start, end)
      }
    },
    updateRegistry(registry: RegistryRecord) {
      return remoteServer.updateRegistry(registry)
    },
    addDocumentColumn(id: string, cols: Col[], start: CursorPosition) {
      remoteServer.addDocumentColumn(id, cols, start)
    },
    removeDocumentColumn(id: string, start: CursorPosition, end: CursorPosition) {
      remoteServer.removeDocumentColumn(id, start, end)
    },
    joinActiveRegistry(id: string) {
      return remoteServer.joinActiveRegistry(id)
    },
    leaveActiveRegistry(id: string) {
      return remoteServer.leaveActiveRegistry(id)
    },

    // Listeners
    on<T extends RemoteEvent>(event: T, callback: RemoteCallbacks[T]) {
      if (!listeners.has(event)) {
        listeners.set(event, [])
      }
      listeners.get(event)!.push(callback)
    },
  }
}

function setListeners(remoteServer: RemoteServer) {
  const isValidEvent = (id: string, user: User) => {
    return activeRecord?.id === id && currentUser?.id !== user.id
  }

  const throttleActivityCountdown = (remoteUser: RemoteUser) => {
    if (remoteUser.activityInterval) clearInterval(remoteUser.activityInterval)
    remoteUser.activityInterval = setInterval(() => {
      remoteUser.activity--
      if (remoteUser.activity <= 0) {
        clearInterval(remoteUser.activityInterval)
        remoteUser.activityInterval = undefined
      }
    }, 1000)
  }

  remoteServer.onRemoteUsersUpdate((id, user) => {
    if (!isValidEvent(id, user)) return

    const callbacks = listeners.get('updateUsers') as RemoteCallbacks['updateUsers'][]
    callbacks?.forEach((callback) => callback(user))
    console.log(`received remote update user for ${id}`)

    addRemoteUser(user)
  })

  remoteServer.onRemoteAddColumn((id, cols, cursor, user) => {
    if (!isValidEvent(id, user)) return
    const callbacks = listeners.get('addColumn') as RemoteCallbacks['addColumn'][]
    callbacks?.forEach((callback) => callback(cols, cursor))
    console.log(`received remote add column for ${id}`)
    // documentStore.pasteBlockAt(cursor, cols, UpdateOrigin.REMOTE)
  })

  remoteServer.onRemoteRemoveColumn((id, start, end, user) => {
    if (!isValidEvent(id, user)) return
    const callbacks = listeners.get('removeColumn') as RemoteCallbacks['removeColumn'][]
    callbacks?.forEach((callback) => callback(start, end))
    console.log(`received remote remove column for ${id}`)
  })

  remoteServer.onRemoteCursorPositionUpdate((id, cursor, user) => {
    if (!isValidEvent(id, user)) return
    const remoteUser = remoteUsers.value.find((remoteUser) => remoteUser.user.id === user.id)
    if (remoteUser) {
      remoteUser.position = cursor
      remoteUser.activity = 5
      throttleActivityCountdown(remoteUser)
    }
  })

  remoteServer.onRemoteSelectionUpdate((id, user, start, end) => {
    if (!isValidEvent(id, user)) return
    const remoteUser = remoteUsers.value.find((remoteUser) => remoteUser.user.id === user.id)
    if (remoteUser) {
      remoteUser.selection = { start, end }
    }
  })

  remoteServer.onRemoteRegistryUpdate((record) => {
    const callbacks = listeners.get('updateRegistry') as RemoteCallbacks['updateRegistry'][]
    callbacks?.forEach((callback) => callback(record))
    console.log('received remote update registry')
  })

  remoteServer.onUserRegistries((records) => {
    const callbacks = listeners.get('syncRegistries') as RemoteCallbacks['syncRegistries'][]
    callbacks?.forEach((callback) => callback(records))
    console.log('received sync registries')
  })
}
