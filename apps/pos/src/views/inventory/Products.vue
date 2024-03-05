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
    <ProductCard
      v-for="product in getProductsByBrand(category || '')"
      :key="product.id"
      :product="product"
      @add="saveItem(product)"
    />
    <product-variants
      v-if="!isEmpty(selectedProductVariants)"
      :isShown="!!selectedProductVariants"
      :product="selectedProductVariants"
      @update:isShown="onModalChange"
      @selected="saveItem($event)"
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
import type Product from '@/stores/inventory/product'
import { isEmpty } from 'lodash'
import { generateSaleItem } from '@/utilities/sale'
import BackArrowIcon from '@/components/icons/BackArrowIcon.vue'
import Points from '../sale/components/Points.vue'
import ProductCard from './components/ProductCard.vue'

export default {
  components: { ProductVariants, BackArrowIcon, Points, ProductCard },
  props: {
    category: String
  },
  mounted() {
    if (this.category) this.setActiveCategory(this.category)
  },
  data() {
    return {
      selectedProductVariants: {} as Product
    }
  },
  computed: {
    ...mapState(useInventory, ['getItemById', 'getProductsByBrand'])
  },
  methods: {
    numberWithCommas,
    isEmpty,

    ...mapActions(useSale, { addToSale: 'add' }),
    ...mapActions(useInventory, ['setActiveCategory']),

    onModalChange(val: any) {
      if (val) return

      this.selectedProductVariants = {} as Product
    },

    goBackInCategory(): void {
      this.$emit('closed-category-products')
    },

    saveItem(product: Product): void {
      if (product.type === ProductTypes.Product && product.variants.length) {
        this.selectedProductVariants = product
        return
      }

      this.selectedProductVariants = {} as Product

      const item = generateSaleItem({
        id: product.id,
        category: ProductTypes.Product,
        type: ProductTypes.Product,
        brand: product.category,
        name: product.title,
        price: product.price,
        originalPrice: product.price,
        storeCategory: product.storeCategory,
        storeBrand: product.storeBrand,
        VAT: product.VAT,
        serviceCharge: product.serviceCharge,
        brandName: product.data.brandName,
        cost: product.data.importPrice,
        points: product.data.points
      })

      this.addToSale(item)
    }
  }
}
</script>
