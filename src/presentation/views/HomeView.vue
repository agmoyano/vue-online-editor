<template>
  <div class="hero bg-base-100">
    <div class="hero-content min-w-full flex-col bg-base-300 lg:flex-row-reverse">
      <img src="@/presentation/assets/logo.svg" class="max-w-sm rounded-lg shadow-2xl" />
      <div>
        <h1 class="lg:whitespace-nowrap text-5xl font-bold">Experimental Online Editor</h1>
        <p class="py-6">Welcome to Vue experimental online editor!</p>
        <button class="btn btn-primary" @click="getStarted">Get Started</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useModalStates } from '@/core/composables/ModalState'
import router from '@/presentation/router'
import { useUserStore } from '@/core/stores/user'

const userStore = useUserStore()
const modalName = 'userModal'
const modal = useModalStates()

const getStarted = () => {
  if (!userStore.hasUser) return modal.open(modalName)
  router.push({ name: 'documents' })
}
</script>

<style scoped></style>
