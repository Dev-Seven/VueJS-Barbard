<template>
  <Modal :isShown="isShown" @update:isShown="$emit('update:isShown', $event)">
    <div
      class="tw-flex tw-justify-between tw-items-center tw-w-full tw-p-6 tw-border-b tw-border-gray-300"
    >
      <h6 class="tw-mb-0">Choose The Variant</h6>

      <CloseIcon class="tw-w-4 tw-h-4" @click="$emit('update:isShown', false)" />
    </div>

    <div class="tw-grid tw-grid-cols-6 tw-p-6 tw-gap-4 md:tw-grid-cols-4">
      <div
        v-for="(variant, index) in product.variants || []"
        :key="`product-variant-${index}`"
        class="tw-card tw-shadow-md tw-cursor-pointer tw-border tw-border-gray-300 tw-transition tw-duration-100 hover:tw-border-primary"
        @click="setVariant(variant)"
      >
        <figure class="tw-mb-0">
          <img :src="variant.image" :alt="variant.id" />
        </figure>
        <div class="tw-card-body tw-p-2">
          <h6 class="tw-mb-0">{{ variant.title }}</h6>
          <small class="tw-mb-0" v-if="variant.price">
            Price: ₫ {{ numberWithCommas(variant.price) }}
          </small>
        </div>
        <Points v-if="variant.data.points" :points="variant.data.points" />
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import Points from '@/views/sale/components/Points.vue'
import { numberWithCommas } from '@/utilities/utility'
import { CloseIcon } from '@/components/icons'
import Modal from '@/components/common/Modal.vue'
import Product from '@/stores/inventory/product'

export default {
  components: {
    Modal,
    CloseIcon,
    Points
  },
  props: {
    isShown: Boolean,
    product: {
      type: Product,
      required: true
    }
  },

  data() {
    return {
      selectedVarient: '',
      numberWithCommas: numberWithCommas
    }
  },

  methods: {
    setVariant(variant: any) {
      console.log(variant)
      this.$emit('selected', variant)
    }
  }
}
</script>

<style lang="scss" scoped>
.product-img {
  background-size: contain;
  height: 10rem;
  background-repeat: no-repeat;
  background-position: center center;
}
</style>
