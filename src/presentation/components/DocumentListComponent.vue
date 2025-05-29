<template>
  <div class="flex flex-1 flex-col">
    <ul class="list bg-base-100 rounded-box shadow-md">
      <li class="p-4 pb-2 text-md opacity-60 tracking-wide mb-10">My Documents</li>
      <template v-if="registryStore.hasRecords">
        <li
          v-for="record in registryStore.registry"
          :key="record.id"
          class="list-row hover:bg-base-200 cursor-pointer items-center mx-15"
          @click="router.push({ name: 'edit', params: { id: record.id } })"
        >
          <div></div>
          <div>
            <div>{{ record.title }}</div>
          </div>
          <div class="avatar-group -space-x-6 transition-all">
            <div
              v-for="user in record.users"
              :key="user.id"
              class="avatar tooltip hover:z-30 transition-all"
              :data-tip="user.nickname"
            >
              <div class="w-12">
                <img :src="user.avatar" />
              </div>
            </div>

            <!-- <div class="avatar avatar-placeholder">
              <div class="bg-neutral text-neutral-content w-12">
                <span>+99</span>
              </div>
            </div> -->
          </div>
          <div>Created: {{ useDateFormat(record.createdAt, dateFormatStr) }}</div>
          <div>Updated: {{ useDateFormat(record.updatedAt, dateFormatStr) }}</div>
        </li>
      </template>
    </ul>
    <div class="flex flex-1 justify-center items-center" v-if="!registryStore.hasRecords">
      <div class="px-15 py-10 text-lg opacity-60 tracking-wide bg-base-300 rounded-box shadow-md">
        <div class="mb-8">There are no records</div>
        <button class="btn btn-primary" @click="modal.open(modalName)">Add new document</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/presentation/router'
import { useModalStates } from '@/core/composables/ModalState'
import { useRegistryStore } from '@/core/stores/registry'
import { useDateFormat } from '@vueuse/core'
const dateFormatStr = 'DD/MM/YYYY HH:mm'

const registryStore = useRegistryStore()
const modalName = 'documentModal'
const modal = useModalStates()
</script>

<style scoped></style>
