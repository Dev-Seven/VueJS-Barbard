<template>
  <div class="tw-px-4 tw-border-b tw-border-gray-300">
    <div class="tw-flex tw-justify-between tw-py-3">
      <div class="">
        <h6 class="tw-mb-0" v-html="item.name"></h6>
        <p class="tw-mb-0 tw-text-gray-600">Quantity {{ item.quantity }}</p>
      </div>
      <div class="tw-ml-2">
        <h6>₫{{ numberWithCommas(item.total) }}</h6>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { numberWithCommas } from '@/utilities/utility'
export default {
  name: 'OrderItem',
  props: {
    item: {
      type: Object,
      required: true
    },
    index: Number
  },
  methods: {
    numberWithCommas
  }
}
</script>
