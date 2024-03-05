<template>
  <div class="tw-p-4 tw-border tw-border-gray-300 tw-rounded-lg">
    <div class="tw-flex tw-gap-4">
      <div>
        <b>{{ method }}</b>
        <div>
          <slot name="content" />
        </div>
        <p>₫ {{ numberWithCommas(amount) }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { numberWithCommas } from '@/utilities/utility'

export default {
  props: {
    amount: {
      type: Number,
      required: true
    },
    method: {
      type: String,
      required: true
    }
  },
  methods: {
    numberWithCommas
  }
}
</script>
