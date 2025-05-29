<script setup lang="ts">
import CreateDocumentModal from '@/presentation/components/CreateDocumentModal.vue'
import MenuItemsComponent from '@/presentation/components/MenuItemsComponent.vue'
import UserModalComponent from '@/presentation/components/UserModalComponent.vue'
import LogoIcon from '@/presentation/icons/LogoIcon.vue'
</script>

<template>
  <div class="drawer">
    <input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col">
      <!-- Navbar -->
      <div class="navbar bg-base-300 w-full">
        <div class="flex-none lg:hidden">
          <label for="my-drawer-3" aria-label="open sidebar" class="btn btn-square btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block h-6 w-6 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </label>
        </div>
        <RouterLink to="/">
          <div class="mx-2 flex-1 flex flex-row lg:px-2 items-end">
            <LogoIcon class="size-7! inline-block" />
            <div class="max-h-content line-clamp-1">EOE</div>
          </div>
        </RouterLink>

        <div class="divider divider-horizontal hidden lg:block"></div>
        <div class="hidden flex-1 lg:flex">
          <!-- Navbar menu content here -->
          <MenuItemsComponent />
        </div>
      </div>
      <!-- Page content here -->
      <div class="flex flex-1">
        <RouterView />
      </div>

      <footer class="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
        <aside>
          <p>
            Copyright © {{ new Date().getFullYear() }} - All right reserved by ACME Industries Ltd
          </p>
        </aside>
      </footer>
    </div>
    <div class="drawer-side">
      <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label>
      <!-- Sidebar content here -->
      <MenuItemsComponent />
    </div>
  </div>
  <UserModalComponent />
  <CreateDocumentModal />
</template>

<style scoped></style>
