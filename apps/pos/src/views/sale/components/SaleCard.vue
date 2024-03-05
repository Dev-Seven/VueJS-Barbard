<template>
  <div
    class="tw-flex tw-flex-col tw-border tw-rounded-lg tw-shadow-sm"
    :class="`${
      disabled
        ? 'tw-cursor-not-allowed tw-bg-gray-300 tw-text-secondary tw-opacity-70'
        : 'tw-cursor-pointer hover:tw-border-primary hover:tw-bg-primary hover:tw-bg-opacity-10 hover:tw-text-primary'
    }`"
    v-bind="$attrs"
  >
    <div class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center tw-h-40">
      <strong v-if="title">{{ title }}</strong>
      <slot></slot>
    </div>
    <slot name="footer"></slot>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    title: String,
    disabled: Boolean
  }
}
</script>
