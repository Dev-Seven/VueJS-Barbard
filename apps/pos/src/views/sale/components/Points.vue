<template>
  <div class="tw-flex tw-items-center tw-h-8 tw-px-4 tw-bg-sky-500 tw-rounded-b-lg" v-bind="$attrs">
    <div
      class="tw-bg-amber-500 tw-rounded-full"
      :class="{
        'tw-h-4 tw-w-4 tw-pl-0.5 tw-pt-0.5': sm,
        'tw-h-5 tw-w-5 tw-pl-1 tw-pt-1': !sm
      }"
    >
      <StarFillIcon class="tw-h-3 tw-w-3 tw-text-amber-300" />
    </div>
    <div class="tw-text-sm tw-text-white" :class="{ 'tw-mx-1': sm, 'tw-mx-2': !sm }">
      <span class="tw-font-bold">
        {{ points }}
      </span>
      Coins
    </div>
  </div>
</template>

<script lang="ts">
import { StarFillIcon } from '@/components/icons'
export default {
  components: { StarFillIcon },
  props: {
    points: Number,
    sm: Boolean
  }
}
</script>
