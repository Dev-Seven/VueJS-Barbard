<template>
  <div class="">
    <div
      class="tw-flex tw-items-center tw-px-4 tw-py-2 tw-rounded-lg tw-border tw-border-gray-300 cursor-pointer tw-mb-4 hover:tw-bg-primary hover:tw-bg-opacity-10"
      @click="goBackInCategory"
    >
      <BackArrowIcon class="tw-w-4 tw-h-4 tw-mr-2" />
      <p class="tw-mb-0">Back</p>
    </div>

    <div
      v-for="(upgrade, index) in sortedUpgrades"
      :key="index"
      class="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-2 tw-border-b tw-border-x tw-border-gray-300 pointer first:tw-border-t first:tw-rounded-t-lg last:tw-rounded-b-lg hover:tw-bg-primary hover:tw-bg-opacity-10"
      @click="saveUpgrade(upgrade)"
    >
      <div class="tw-flex tw-flex-1 tw-flex-col tw-gap-1">
        <h6 class="tw-mb-0">{{ upgrade.title }}</h6>
        <small v-if="upgrade.price" class="tw-mb-0">
          Price: ₫ {{ numberWithCommas(round(upgrade.price)) }}
        </small>
      </div>
      <div>
        <Points
          v-if="upgrade.data.points"
          :points="upgrade.data.points"
          class="tw-rounded-lg tw-ml-4"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState, mapActions } from 'pinia'
import { numberWithCommas } from '@/utilities/utility'
import { useInventory } from '@/stores/inventory/inventory'
import { useSale } from '@/stores/sale/sale'
import { type Product } from '@/stores/inventory/product'
import { round } from 'lodash'
import { ProductTypes } from '@/stores/sale/saleable'
import { generateSaleItem } from '@/utilities/sale'
import BackArrowIcon from '@/components/icons/BackArrowIcon.vue'
import Points from '../sale/components/Points.vue'

export default {
  name: 'DisplayUpgrades',
  components: { BackArrowIcon, Points },

  data() {
    return {
      numberWithCommas: numberWithCommas
    }
  },

  computed: {
    ...mapState(useInventory, ['Upgrades']),

    sortedUpgrades() {
      return [...this.Upgrades].sort((a, b) => {
        return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1
      })
    }
  },

  methods: {
    round,
    ...mapActions(useSale, ['add']),

    goBackInCategory(): void {
      this.$emit('closed-category-products')
    },

    saveUpgrade(upgrade: Product): void {
      const item = generateSaleItem({
        id: upgrade.id,
        type: ProductTypes.Upgrade,
        category: ProductTypes.Upgrade,
        name: upgrade.title,
        price: upgrade.price,
        VAT: upgrade.VAT,
        serviceCharge: upgrade.serviceCharge,
        points: upgrade.data.points ? upgrade.data.points : 0
      })

      // Signature Drink Upgrade
      if (upgrade.data?.linkedDrink) {
        item.complimentaries = {
          drink: 'drink-gentlemanup'
        }
      }

      this.add(item)
    }
  }
}
</script>
