import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/types/UserType'
import { useRemoteHandler } from '../composables/RemoteHandler'

export const useUserStore = defineStore(
  'user',
  () => {
    const user = ref<User>()

    const remote = useRemoteHandler()

    watch(user, remote.setUser)

    return {
      user,
      hasUser: computed(() => !!user.value),
      // user: computed(() => user.value),
      createAvatar() {
        return `https://i.pravatar.cc/150?u=${crypto.randomUUID()}`
      },
      newUser(nickname: string, avatar: string) {
        user.value = {
          nickname,
          id: crypto.randomUUID(),
          avatar,
        }
        const redirect = localStorage.getItem('redirect')
        if (redirect) {
          localStorage.removeItem('redirect')
          window.location.href = redirect
        }
      },
      logout() {
        user.value = undefined
      },
    }
  },
  {
    persist: true,
  },
)
