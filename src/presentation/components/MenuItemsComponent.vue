<template>
  <template v-if="userStore.hasUser">
    <div class="breadcrumbs text-sm inline-flex items-center">
      <ul>
        <li>
          <RouterLink :to="{ name: 'documents' }"
            ><FolderIcon class="size-4!" /> Documents</RouterLink
          >
        </li>
        <li v-if="registryStore.activeDocumentTitle">
          <span class="inline-flex items-center gap-2">
            <DocumentIcon class="size-4!" />
            {{ registryStore.activeDocumentTitle }}
          </span>
        </li>
      </ul>
    </div>
    <div class="flex-1"></div>
    <ul
      class="menu bg-base-200 min-h-full w-80 p-4 lg:p-0 lg:bg-base-300 lg:menu-horizontal lg:w-auto flex justify-between items-center"
    >
      <li class="lg:hidden">
        <RouterLink :to="{ name: 'documents' }"
          ><FolderIcon class="size-4!" /> Documents</RouterLink
        >
      </li>
      <li v-if="remote.remoteUsers.value.length">
        <div class="avatar-group -space-x-6 transition-all">
          <div
            v-for="remoteUser in remote.remoteUsers.value"
            :key="remoteUser.user.id"
            class="avatar tooltip hover:z-30 transition-all"
            :style="[`border-color: ${remoteUser.color.active}`]"
            :data-tip="remoteUser.user.nickname"
          >
            <div class="w-12">
              <img :src="remoteUser.user.avatar" />
            </div>
          </div>
        </div>
      </li>
      <li>
        <div class="mr-4">
          <div class="capitalize">
            {{ remote.state.value }}
          </div>
          <div class="inline-grid *:[grid-area:1/1]">
            <!-- <div
              :class="[
                'status animate-ping',
                {
                  'status-error': webSocket.state.value === 'error',
                  'status-success': webSocket.state.value === 'joined',
                },
              ]"
            ></div> -->
            <div
              :class="[
                'status',
                {
                  'status-error': remote.state.value === 'error',
                  'status-success': remote.state.value === 'joined',
                  'status-info': remote.state.value === 'connected',
                  'status-neutral': remote.state.value === 'disconnected',
                  'status-warning': remote.state.value === 'connecting',
                },
              ]"
            ></div>
          </div>
        </div>
      </li>
      <li>
        <button
          class="tooltip tooltip-bottom btn btn-primary"
          data-tip="New Document"
          @click="modal.open('documentModal')"
        >
          <PlusIcon class="size-4!" />
        </button>
      </li>
      <li>
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn m-1">
            {{ userStore.user?.nickname }}
            <div class="avatar">
              <div class="w-10 rounded-full">
                <img :src="userStore.user?.avatar" />
              </div>
            </div>
          </div>
          <ul
            ref="logoutMenu"
            tabindex="0"
            role="menu"
            class="dropdown-content menu bg-base-200 rounded-box z-1 w-52 p-2 shadow-sm"
          >
            <li @click="openLogoutModal">
              <a> Logout </a>
            </li>
          </ul>
        </div>
      </li>
    </ul>
    <LogoutModalComponent />
  </template>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import router from '@/presentation/router'

import { useUserStore } from '@/core/stores/user'
import { useModalStates } from '@/core/composables/ModalState'
import { useRegistryStore } from '@/core/stores/registry'

import LogoutModalComponent from './LogoutModalComponent.vue'
import PlusIcon from '@/presentation/icons/PlusIcon.vue'
import FolderIcon from '@/presentation/icons/FolderIcon.vue'
import DocumentIcon from '@/presentation/icons/DocumentIcon.vue'
import { useRemoteHandler } from '@/core/composables/RemoteHandler'

const userStore = useUserStore()
const registryStore = useRegistryStore()
const modal = useModalStates()

const remote = useRemoteHandler()

if (!userStore.hasUser) {
  router.replace({ name: 'home' })
}

watch(
  () => registryStore.activeDocumentTitle,
  () => {
    console.log(registryStore.activeDocumentTitle, Date.now())
  },
)

const logoutMenu = ref<HTMLUListElement>()

const openLogoutModal = () => {
  console.log('openLogoutModal')
  modal.open('logoutModal')
  logoutMenu.value?.blur()
}
</script>

<style scoped></style>
