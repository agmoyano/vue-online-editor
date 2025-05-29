<template>
  <ModalComponent :open="modalState" @close="modal.close(modalName)">
    <template #title> Create new document </template>
    <template #content>
      <form class="inline-block flex-1" id="docForm" ref="docForm" @submit.prevent="validateForm">
        <label class="floating-label">
          <span>Title</span>
          <input
            required
            pattern="[A-Za-z][A-Za-z0-9\-]*"
            minlength="3"
            maxlength="30"
            type="text"
            placeholder="Title"
            v-model="title"
            class="input input-md validator"
            title="Only letters, numbers or dash"
          />
          <p class="validator-hint">
            Must be 3 to 30 characters
            <br />containing only letters, numbers or dash
          </p>
        </label>
      </form>
    </template>
    <template #actions>
      <div class="flex flex-row gap-4 justify-end">
        <button @click="modal.close(modalName)" class="btn btn-secondary">Cancel</button>
        <button class="btn btn-primary" @click="validateForm">Save</button>
      </div>
    </template>
  </ModalComponent>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ModalComponent from './ModalComponent.vue'
import { useRegistryStore } from '@/core/stores/registry'
import router from '@/presentation/router'
import { useModalStates } from '@/core/composables/ModalState'

const modal = useModalStates()
const modalName = 'documentModal'
const modalState = modal.get(modalName)

const title = ref<string>('')
const docForm = ref<HTMLFormElement>()

const registryStore = useRegistryStore()

const validateForm = () => {
  docForm.value?.reportValidity()
  if (docForm.value?.checkValidity()) {
    const id = registryStore.newDocument(title.value)
    docForm.value.reset()
    modal.close(modalName)
    router.push({ name: 'edit', params: { id } })
  }
}
</script>

<style scoped></style>
