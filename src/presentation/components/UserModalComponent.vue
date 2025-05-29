<template>
  <ModalComponent :open="modalState" @close="modal.close(modalName)">
    <template #title>Create a user</template>
    <template #content>
      <div class="flex flex-row gap-4 px-4 items-start">
        <form
          class="inline-block flex-1"
          id="userForm"
          ref="userForm"
          @submit.prevent="validateForm"
        >
          <label class="floating-label">
            <span>Nickname</span>
            <input
              required
              pattern="[A-Za-z][A-Za-z0-9\-]*"
              minlength="3"
              maxlength="30"
              type="text"
              placeholder="Nickname"
              v-model="nickname"
              class="input input-md validator"
              title="Only letters, numbers or dash"
            />
            <p class="validator-hint">
              Must be 3 to 30 characters
              <br />containing only letters, numbers or dash
            </p>
          </label>
        </form>
        <span v-if="!avatar" class="loading loading-spinner loading-xl"></span>
        <div class="join -space-x-4">
          <div v-if="avatar" class="avatar">
            <div class="w-15 rounded-full">
              <img :src="avatar" />
            </div>
          </div>
          <button class="btn btn-circle btn-xs z-0 self-end" @click="changeAvatar">
            <ArrowRoundedIcon />
          </button>
        </div>
      </div>
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
import { useUserStore } from '@/core/stores/user'
import ModalComponent from './ModalComponent.vue'
import { ref, watch } from 'vue'
import { useModalStates } from '@/core/composables/ModalState'
import ArrowRoundedIcon from '@/presentation/icons/ArrowRoundedIcon.vue'

const modalName = 'userModal'
const modal = useModalStates()
const modalState = modal.get(modalName)

const userForm = ref<HTMLFormElement>()
const nickname = ref<string>('')
const userStore = useUserStore()
const avatar = ref<string>('')

const changeAvatar = () => {
  avatar.value = ''
  avatar.value = userStore.createAvatar()
}

watch(
  modalState,
  (modalState) => {
    if (modalState) {
      changeAvatar()
    } else {
      avatar.value = ''
    }
  },
  { immediate: true },
)

const validateForm = () => {
  userForm.value?.reportValidity()
  if (userForm.value?.checkValidity()) {
    userStore.newUser(nickname.value, avatar.value!)
    userForm.value.reset()
    modal.close(modalName)
  }
}
</script>

<style scoped></style>
