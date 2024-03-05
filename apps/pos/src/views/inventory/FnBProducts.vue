<template>
  <div class="tw-grid tw-grid-cols-2 tw-gap-4 lg:tw-grid-cols-4">
    <div
      class="tw-card tw-shadow-md tw-cursor-pointer tw-border tw-border-gray-300 tw-transition tw-duration-100 hover:tw-border-primary"
    >
      <div
        class="tw-card-body tw-p-2 tw-flex tw-items-center tw-justify-center"
        @click="goBackInCategory"
      >
        <BackArrowIcon class="tw-text-primary hover:tw-text-secondary tw-w-8 tw-h-8" />
      </div>
    </div>
    <div
      v-for="product in getProductsByFnBBrand(category)"
      :key="product.id"
      class="tw-card tw-shadow-md tw-cursor-pointer tw-border tw-border-gray-300 tw-transition tw-duration-100 hover:tw-border-primary"
      @click="saveItem(product)"
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
    </div>
    <product-variants
      v-if="!isEmpty(selectedProductVariants)"
      :isShown="!!selectedProductVariants"
      :product="selectedProductVariants"
      @update:isShown="onModalChange"
      @selected="(product: Product) => saveItem(product)"
    />
  </div>
</template>

<script lang="ts">
import ProductVariants from '@/components/modal/ProductVariants.vue'
import { mapActions, mapState } from 'pinia'
import { numberWithCommas } from '@/utilities/utility'
import { useInventory } from '@/stores/inventory/inventory'
import { useSale } from '@/stores/sale/sale'
import { ProductTypes } from '@/stores/sale/saleable/product'
import { type Product } from '@/stores/inventory/product'
import { isEmpty } from 'lodash'
import { generateSaleItem } from '@/utilities/sale'
import BackArrowIcon from '@/components/icons/BackArrowIcon.vue'
import { SaleProduct } from '../../stores/sale/types'

export default {
  components: { ProductVariants, BackArrowIcon },
  props: {
    category: {
      type: String,
      required: true
    }
  },

  mounted() {
    this.setActiveCategory(this.category)
  },

  data() {
    return {
      variant: '',
      selectedProductVariants: {} as Product
    }
  },

  computed: {
    ...mapState(useInventory, ['getFnBItemById', 'getProductsByFnBBrand'])
  },

  methods: {
    numberWithCommas,
    isEmpty,

    ...mapActions(useSale, ['add']),

    ...mapActions(useInventory, ['setActiveCategory']),

    onModalChange(val: any) {
      if (val) return

      this.selectedProductVariants = {} as Product
    },

    goBackInCategory(): void {
      this.$emit('closed-category-products')
    },

    saveItem(product: Product) {
      if (product.type === ProductTypes.FnB && product.variants.length) {
        this.selectedProductVariants = product
        return
      }

      this.selectedProductVariants = {} as Product

      const item = generateSaleItem({
        type: ProductTypes.FnB,
        category: ProductTypes.FnB,
        brand: product.category,
        id: product.id,
        name: product.title,
        price: product.price,
        originalPrice: product.price,
        storeCategory: product.storeCategory,
        storeBrand: product.storeBrand,
        VAT: product.VAT,
        serviceCharge: product.serviceCharge,
        categoryName: product.data.categoryName,
        cost: product.data?.BOMPrice || 0,
        points: 0
      })

      this.add(item as SaleProduct)
    }
  }
}
</script>
