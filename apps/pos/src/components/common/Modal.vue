<template>
  <div
    class="tw-modal"
    :class="{
      'tw-visible tw-pointer-events-auto tw-opacity-100': isShown
    }"
    @click.self="$emit('update:isShown', false)"
  >
    <div
      class="tw-modal-box tw-overflow-hidden tw-p-0 tw-bg-white"
      :class="{
        [maxWidthClass]: true
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    isShown: {
      type: Boolean
    },
    maxWidthClass: {
      type: String,
      default: 'tw-max-w-screen-lg'
    }
  }
}
</script>
