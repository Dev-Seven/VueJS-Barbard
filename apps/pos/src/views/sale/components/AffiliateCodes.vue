<template>
  <div v-if="shouldRender">
    <div
      v-for="(code, index) in customer.affiliateCodes"
      :key="`affiliate-code-${index}`"
      className="tw-badge tw-rounded tw-bg-amber-500 tw-text-white tw-border-none tw-p-3"
    >
      {{ code }}
    </div>
  </div>
</template>

<script lang="ts">
import { useSale } from '@/stores'
import { mapState } from 'pinia'

export default {
  computed: {
    ...mapState(useSale, ['customer']),
    shouldRender() {
      return this.customer.affiliateCodes.length
    }
  },
  data() {
    return {
      loading: false
    }
  }
}
</script>
