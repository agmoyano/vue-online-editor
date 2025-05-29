import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useDocumentStore } from './document'
import { useUserStore } from './user'
import type { RegistryRecord } from '@/types/RegistryType'
import { UpdateOrigin } from '@/types/DocumentType'
import { useRemoteHandler } from '../composables/RemoteHandler'

export const useRegistryStore = defineStore(
  'registry',
  () => {
    const registry = ref<{ [key: string]: RegistryRecord }>({})

    const documentStore = useDocumentStore()
    const userStore = useUserStore()

    const active = ref<RegistryRecord | undefined>()

    const remote = useRemoteHandler()

    let timeout: number
    let throttling = false

    const throttleRegistryUpdate = (lines: string) => {
      if (throttling) {
        clearTimeout(timeout)
      }
      throttling = true
      timeout = setTimeout(async () => {
        throttling = false
        if (active.value) {
          active.value = {
            ...active.value,
            lines,
            updatedAt: new Date().getTime(),
          }
          registry.value[active.value.id] = active.value
          remote.updateRegistry(active.value)
        }
      }, 500)
    }

    watch(
      () => documentStore.document.lines,
      () => {
        if (active.value) {
          throttleRegistryUpdate(JSON.stringify(documentStore.document.lines))
        }
      },
      { deep: true, immediate: true },
    )

    watch(active, remote.setActive)

    remote.on('updateUsers', (user) => {
      if (active.value?.users.some((u) => u.id === user.id)) return
      active.value?.users.push(user)
    })

    remote.on('syncRegistries', (records) => {
      for (const remote of records) {
        registry.value[remote.id] = remote
      }
    })

    remote.on('updateRegistry', (remoteRegistry) => {
      if (remoteRegistry.id !== active.value?.id) registry.value[remoteRegistry.id] = remoteRegistry
    })

    documentStore.onAction((documentAction) => {
      if (active.value && documentAction.origin !== UpdateOrigin.REMOTE) {
        if (documentAction.action === 'paste') {
          remote.addDocumentColumn(active.value.id, documentAction.cols, documentAction.start)
        } else {
          remote.removeDocumentColumn(active.value.id, documentAction.start, documentAction.end)
        }
      }
    })

    return {
      registry,
      active: computed(() => active.value),
      hasRecords: computed(() => Object.keys(registry.value).length > 0),
      activeDocumentTitle: computed(() => {
        return active.value?.title
      }),
      newDocument(title: string): string | undefined {
        if (!userStore.hasUser) return
        const id = crypto.randomUUID()

        const created: RegistryRecord = {
          lines: JSON.stringify([documentStore.createNewLine()]),
          title,
          id,
          createdAt: new Date().getTime(),
          users: [userStore.user!],
        }
        registry.value[id] = created
        remote.updateRegistry(created)

        return id
      },
      async loadDocumentById(id: string) {
        const remoteRegistry = await remote.joinActiveRegistry(id)
        const record = registry.value[id]
        if (record) {
          if (remoteRegistry && (remoteRegistry.updatedAt ?? 0) > (record.updatedAt ?? 0)) {
            active.value = remoteRegistry
            registry.value[id] = remoteRegistry
          } else {
            active.value = record
          }
          documentStore.setDocumentLinesState(JSON.parse(active.value.lines))
        } else if (remoteRegistry) {
          active.value = remoteRegistry
          registry.value[id] = remoteRegistry
          documentStore.setDocumentLinesState(JSON.parse(remoteRegistry.lines))
        }
      },
      async leaveActiveDocument() {
        if (!active.value) return
        const id = active.value.id
        active.value = undefined
        await remote.leaveActiveRegistry(id)
      },
      clear() {
        registry.value = {}
        active.value = undefined
      },
    }
  },
  {
    persist: true,
  },
)
