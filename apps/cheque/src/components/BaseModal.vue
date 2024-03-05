<template>
  <vue-final-modal
    v-bind="$attrs"
    class="flex items-center justify-center"
    content-class="flex flex-col mx-4"
    :content-style="{
      'max-width': maxWidth,
    }"
  >
    <h1 class="m-0 component-gradient-title" v-if="title">
      {{ title }}
    </h1>
    <h2 class="mt-0 component-title" v-if="subTitle">
      {{ subTitle }}
    </h2>
    <slot />
  </vue-final-modal>
</template>

<script setup lang="ts">
import { VueFinalModal } from "vue-final-modal";

withDefaults(
  defineProps<{
    title?: string;
    subTitle?: string;
    maxWidth?: string;
  }>(),
  {},
);
</script>

<style lang="scss">
.vfm__content {
  max-width: 27.6875rem;
  flex: 1 1 auto;
  background: radial-gradient(
      96.31% 96.31% at 50% 50%,
      #2a2a2a 0%,
      #000000 100%
    ),
    #282828;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.3125rem;
  padding: 1.5rem 1.8125rem 2rem;
  .component-gradient-title {
    margin-bottom: 0.5625rem;
  }
  .component-title {
    margin: 0 0 1.5rem;
  }
  color: var(--color-white);
  max-height: calc(100vh - 100px);
  overflow: auto;
}
</style>
