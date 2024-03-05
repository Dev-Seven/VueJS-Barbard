<template>
  <div
    v-if="!image && name"
    v-bind="$attrs"
    class="tw-rounded-full tw-flex tw-items-center tw-justify-center tw-cursor-pointer"
    :class="{
      'tw-bg-white tw-text-primary': !variant,
      'tw-bg-primary tw-text-white': variant === 'primary',
      'tw-bg-success tw-text-white': variant === 'success',
      'tw-h-8 tw-w-8': !size,
      'tw-h-10 tw-w-10': size === 'lg'
    }"
  >
    {{ getInitials(name) }}
  </div>
  <img
    v-else
    v-bind="$attrs"
    class="tw-rounded-full tw-flex tw-items-center tw-justify-center tw-cursor-pointer"
    :class="{
      'tw-h-8 tw-w-8': !size,
      'tw-h-10 tw-w-10': size === 'lg'
    }"
    :src="image"
    :alt="name"
  />
</template>

<script lang="ts">
import { getInitials } from '../../utilities/utility'

export default {
  props: {
    name: {
      type: String
    },
    variant: {
      type: String
    },
    image: {
      type: String
    },
    size: {
      type: String
    }
  },
  methods: {
    getInitials
  }
}
</script>
