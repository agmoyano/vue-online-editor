<template>
  <div class="relative flex-1">
    <RouterView />
    <div
      v-if="webSocket.state.value !== 'joined'"
      class="backdrop-blur-xs absolute inset-0 flex items-center justify-center"
    >
      <div class="bg-base-300 p-8 rounded-xs flex flex-col justify-center items-center">
        <div class="loading loading-dots loading-md"></div>
        <div>Trying to conect to server...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegistryStore } from '@/core/stores/registry'
import { useUserStore } from '@/core/stores/user'
import type { RemoteServer } from '@/types/RemoteServerInterface'
import { inject, onMounted, onUnmounted, watch } from 'vue'

const userStore = useUserStore()
const registryStore = useRegistryStore()
const webSocket = inject('RemoteServer') as RemoteServer
let previousJoin = false
onMounted(() => {
  webSocket.connect(userStore.user!)
})

onUnmounted(() => {
  webSocket.disconnect()
  registryStore.leaveActiveDocument()
})

watch(
  () => webSocket.state,
  () => {
    if (webSocket.state.value === 'joined' && !previousJoin) {
      previousJoin = true
    }
    if (previousJoin && webSocket.state.value === 'connected') {
      webSocket.connect(userStore.user!)
    }
  },
)
</script>

<style scoped></style>
