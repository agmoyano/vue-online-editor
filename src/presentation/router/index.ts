import { useModalStates } from '@/core/composables/ModalState'
import { useUserStore } from '@/core/stores/user'
import HomeView from '@/presentation/views/HomeView.vue'
import MainLayout from '@/presentation/views/MainLayout.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: MainLayout,
      children: [
        {
          path: '/',
          name: 'home',
          component: HomeView,
        },
        {
          path: 'private',
          name: 'private',
          component: () => import('@/presentation/views/PrivateView.vue'),
          beforeEnter: (to, from, next) => {
            const userStore = useUserStore()
            const modal = useModalStates()
            if (!userStore.hasUser) {
              localStorage.setItem('redirect', to.fullPath)
              next({ name: 'home' })
              modal.open('userModal')
            } else {
              next()
            }
          },
          redirect: { name: 'documents' },
          children: [
            {
              path: 'documents',
              props: true,
              name: 'documents',
              component: () => import('@/presentation/components/DocumentListComponent.vue'),
            },
            {
              path: 'edit/:id',
              props: true,
              name: 'edit',
              component: () => import('@/presentation/components/EditorComponent.vue'),
            },
          ],
        },
        {
          path: '/about',
          name: 'about',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('@/presentation/views/AboutView.vue'),
        },
      ],
    },
  ],
})

export default router
