<template>
  <MerchantsAgreementCard :item="item" :index="index" />
</template>

<script lang="ts">
import MerchantsAgreementCard from './MerchantsAgreementCard.vue'

export default {
  name: 'GrandMerchantsAgreementCard',
  components: { MerchantsAgreementCard },
  props: {
    item: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  }
}
</script>
