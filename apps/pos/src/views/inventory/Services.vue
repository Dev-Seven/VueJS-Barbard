<template>
  <div class="">
    <div
      class="tw-flex tw-items-center tw-px-4 tw-py-2 tw-rounded-lg tw-border tw-border-gray-300 pointer tw-mb-4 hover:tw-bg-primary hover:tw-bg-opacity-10"
      @click="goBackInCategory"
    >
      <BackArrowIcon class="tw-w-4 tw-h-4 tw-mr-2" />
      <p class="tw-mb-0">Back</p>
    </div>

    <div
      v-for="(service, index) in services"
      :key="index"
      class="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-2 tw-border-b tw-border-x tw-border-gray-300 pointer first:tw-border-t first:tw-rounded-t-lg last:tw-rounded-b-lg hover:tw-bg-primary hover:tw-bg-opacity-10"
      @click="addService(service)"
    >
      <div class="tw-flex tw-flex-1 tw-flex-col tw-gap-1">
        <h6 class="tw-mb-0">{{ service.title }}</h6>
        <small v-if="service.price" class="tw-mb-0">
          Price: ₫ {{ numberWithCommas(round(service.price)) }}
        </small>
      </div>
      <div>
        <Points
          v-if="service.data.points"
          :points="service.data.points"
          class="tw-rounded-lg tw-ml-4"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState, mapActions } from 'pinia'
import { numberWithCommas } from '@/utilities/utility'
import { round } from 'lodash'
import { useInventory } from '@/stores/inventory/inventory'
import { useSale } from '@/stores/sale/sale'
import { type Product } from '@/stores/inventory/product'
import { ProductTypes } from '@/stores/sale/saleable/product'
import { generateSaleItem } from '@/utilities/sale'
import BackArrowIcon from '@/components/icons/BackArrowIcon.vue'
import Points from '../sale/components/Points.vue'

export default {
  name: 'DisplayServices',
  components: {
    BackArrowIcon,
    Points
  },

  computed: {
    ...mapState(useInventory, ['Services']),

    services() {
      return this.Services.filter((s) => s.data.type === 'appointment')
    }
  },

  methods: {
    round,
    numberWithCommas,
    ...mapActions(useSale, { addToSale: 'add' }),
    goBackInCategory(): void {
      this.$emit('closed-category-products')
    },

    addService(data: Product) {
      const item = generateSaleItem({
        id: data.id,
        type: ProductTypes.Service,
        name: data.title,
        category: ProductTypes.Service,
        serviceCategory: data.data.category,
        price: data.price,
        VAT: data.VAT,
        serviceCharge: data.serviceCharge,
        complimentaries: {
          drink: 'drink-complimentary',
          food: 'snack-complimentary'
        },
        points: data.data.points ? data.data.points : 0
      })

      this.addToSale(item)
    }
  }
}
</script>
