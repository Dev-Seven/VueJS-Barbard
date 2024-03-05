<template>
  <div
    class="tw-card tw-shadow-md tw-cursor-pointer tw-border tw-border-gray-300 tw-transition tw-duration-100 hover:tw-border-primary tw-overflow-hidden"
    @click="$emit('add', product)"
  >
    <figure class="tw-h-32 tw-mb-0">
      <img
        class="tw-w-full tw-object-cover tw-object-center tw-h-full"
        :src="product.image"
        :alt="product.id"
      />
    </figure>
    <div class="tw-card-body tw-p-2">
      <h6 class="line-clamp-2 tw-mb-0" v-html="product.title" />
      <small class="tw-mb-0" v-if="product.price">
        Price: ₫ {{ numberWithCommas(product.price) }}
      </small>
    </div>
    <Points v-if="product.data.points" :points="product.data.points" sm />
  </div>
</template>

<script lang="ts">
import Points from '../../sale/components/Points.vue'
import { numberWithCommas } from '@/utilities/utility'

export default {
  components: { Points },
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  methods: {
    numberWithCommas
  }
}
</script>
