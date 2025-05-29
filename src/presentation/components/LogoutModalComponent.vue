<template>
  <ModalComponent :open="modalState" @close="modal.close(modalName)">
    <template #title> Logout </template>
    <template #content> Are you sure you want to logout? </template>
    <template #actions>
      <div class="flex-row flex gap-4 justify-end">
        <button class="btn btn-secondary" @click="modal.close(modalName)">Cancel</button>
        <button class="btn btn-primary" @click="handleLogout">Logout</button>
      </div>
    </template>
  </ModalComponent>
</template>

<script setup lang="ts">
import { useUserStore } from '@/core/stores/user'
import ModalComponent from './ModalComponent.vue'
import router from '@/presentation/router'
import { useRegistryStore } from '@/core/stores/registry'
import { useModalStates } from '@/core/composables/ModalState'

const userStore = useUserStore()
const registryStore = useRegistryStore()

const modal = useModalStates()
const modalName = 'logoutModal'
const modalState = modal.get(modalName)

const handleLogout = () => {
  modal.close(modalName)
  userStore.logout()
  registryStore.clear()
  router.push({ name: 'home' })
}
</script>

<style scoped></style>
