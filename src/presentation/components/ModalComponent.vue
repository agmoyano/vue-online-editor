<template>
  <dialog
    id="my_modal_3"
    @click.self="$emit('close')"
    :class="[
      'modal',
      {
        'modal-open': open,
      },
    ]"
  >
    <div class="modal-box">
      <form method="dialog">
        <button
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          @click="$emit('close')"
        >
          ✕
        </button>
      </form>
      <h3 class="text-lg font-bold">
        <slot name="title"> </slot>
      </h3>
      <p class="py-4">
        <slot name="content"> </slot>
      </p>
      <slot name="actions"> </slot>
    </div>
  </dialog>
</template>

<script setup lang="ts">
type Props = {
  open: boolean
}

defineProps<Props>()
</script>

<style scoped></style>
