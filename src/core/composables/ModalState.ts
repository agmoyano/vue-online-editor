import { computed, ref } from 'vue'

const states = ref<{ [key: string]: boolean }>({})

export const useModalStates = () => {
  return {
    get(key: string) {
      return computed(() => {
        if (!(key in states.value)) {
          states.value[key] = false
        }
        return states.value[key]
      })
    },
    open(key: string) {
      states.value[key] = true
    },
    close(key: string) {
      states.value[key] = false
    },
  }
}
