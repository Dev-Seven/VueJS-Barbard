<template>
  <button
    class="tw-btn tw-btn-sm tw-btn-outline tw-border-white tw-text-white hover:tw-bg-white hover:tw-text-black"
    @click="$router.back()"
  >
    <ArrowRightIcon class="tw-w-4 tw-h-4 tw-translate tw-rotate-180" />
  </button>
</template>

<script lang="ts">
import { ArrowRightIcon } from '@/components/icons'
export default {
  components: { ArrowRightIcon }
}
</script>
