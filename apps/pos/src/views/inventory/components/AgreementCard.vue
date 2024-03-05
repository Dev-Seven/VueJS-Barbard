<template>
  <div
    class="tw-font-bold tw-flex tw-flex-col tw-border tw-rounded-lg tw-shadow-sm tw-h-40 tw-cursor-pointer hover:tw-border-primary hover:tw-bg-primary hover:tw-bg-opacity-10 hover:tw-text-primary"
    v-bind="$attrs"
  >
    <div class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center tw-h-40">
      <strong v-if="title">{{ title }}</strong>
      <slot></slot>
    </div>
    <Points v-if="points" :points="points" />
  </div>
</template>

<script lang="ts">
import Points from '../../sale/components/Points.vue'
export default {
  components: { Points },
  props: {
    title: String,
    points: {
      type: Number,
      required: false
    }
  }
}
</script>
