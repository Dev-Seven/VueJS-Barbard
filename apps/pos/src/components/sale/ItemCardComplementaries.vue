<template>
  <div>
    <div
      v-if="item.complimentaries.drink && (autoHide ? !item.complimentaryDrink : true)"
      class="drink pt-3"
    >
      <div class="tw-flex tw-justify-between">
        <p class="tw-mb-0 tw-text-sm">Select drink</p>
        <p class="tw-mb-0 tw-text-sm">free</p>
      </div>

      <select
        class="tw-select tw-select-sm tw-flex-shrink tw-w-full tw-px-3 tw-font-normal tw-text-base tw-rounded-lg tw-border tw-border-gray-300 focus:tw-outline-none"
        :value="item?.complimentaryDrink?.id"
        @change="onDrinkSelected"
      >
        <option v-for="drink in drinks" :key="drink.value" :value="drink.value">
          {{ drink.text }}
        </option>
      </select>
    </div>

    <div v-if="item.complimentaries.food && (autoHide ? !item.complimentaryFood : true)">
      <div class="tw-flex tw-justify-between">
        <p class="tw-mb-0 tw-text-sm">Select snack</p>
        <p class="tw-mb-0 tw-text-sm">free</p>
      </div>

      <select
        class="tw-select tw-select-sm tw-flex-shrink tw-w-full tw-px-3 tw-font-normal tw-text-base tw-rounded-lg tw-border tw-border-gray-300 focus:tw-outline-none"
        :value="item?.complimentaryFood?.id"
        @change="onFoodSelected"
      >
        <option v-for="food in foodOptions" :key="food.value" :value="food.value">
          {{ food.text }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { isEmpty, map, filter } from 'lodash'
import { ProductTypes } from '@/stores/sale/saleable/product'
import { useInventory } from '@/stores/inventory/inventory'
import { useRegister } from '@/stores/register'
import genericMixin from './generic.mixin'
import { useStaff } from '../../stores/staff'

export default {
  name: 'ItemCardComplementaries',
  props: {
    item: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    autoHide: Boolean,
    upgrade: Boolean
  },
  mixins: [genericMixin],
  data() {
    return {
      drinkOptions: Array(),
      foodOptions: Array(),
      upgrades: Array(),
      complimentaries: Array()
    }
  },
  computed: {
    ...mapState(useInventory, [
      'getDrinkComplimentary',
      'getFoodComplimentary',
      'UpgradeComplimentary'
    ]),
    ...mapState(useRegister, ['location']),
    ...mapState(useStaff, ['active']),

    drinks() {
      if (this.item.type === ProductTypes.Upgrade) {
        return this.upgrades
      }

      return this.drinkOptions
    }
  },
  methods: {
    isEmpty,

    onDrinkSelected(event: any) {
      const id = event.target.value
      this.addComplimentary(id, 'complimentaryDrink')
    },
    onFoodSelected(event: any) {
      const id = event.target.value
      this.addComplimentary(id, 'complimentaryFood')
    },

    getComplimentaryItems() {
      this.drinkOptions = []
      this.foodOptions = []

      this.foodOptions = [
        {
          text: 'No Snack',
          value: 1
        },
        ...map(
          filter(this.getFoodComplimentary, (f) => f.location === this.location),
          (c) => {
            this.complimentaries.push(c)
            return {
              text: c.title,
              value: c.id
            }
          }
        )
      ]

      this.drinkOptions = [
        {
          text: 'No Drink',
          value: 1
        },
        ...map(
          filter(this.getDrinkComplimentary, (f) => f.location === this.location),
          (c) => {
            this.complimentaries.push(c)
            return {
              text: c.title,
              value: c.id
            }
          }
        )
      ]

      this.upgrades = map(this.UpgradeComplimentary, (c) => ({
        text: c.title,
        value: c.id
      }))
    },

    addComplimentary(id: string, type: 'complimentaryFood' | 'complimentaryDrink') {
      if (id === '1') {
        const label = type === 'complimentaryDrink' ? 'Drink' : 'Food'
        this.update(type, {
          text: label,
          value: 1
        })

        return
      }

      const product =
        this.item.type === ProductTypes.Upgrade
          ? this.UpgradeComplimentary.find((c) => c.id === id)
          : this.complimentaries.find((c) => c.id === id)

      if (product) {
        /**
         * @description Special case when upgrade has complimentary
         * item attached, update the parent product price as it relies
         * on the linked item.
         *
         */
        const item = {
          type: ProductTypes.FnB,
          quantity: 1,
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
          categoryName: product.data.CategoryName,
          cost: product.data.BOMPrice,
          salesPerson: this.item.salesPerson
        }

        if (this.item.type === ProductTypes.Upgrade) {
          this.update('price', product.price)
        } else {
          item.type = ProductTypes.Complimentary
          item.category = ProductTypes.Complimentary
          item.categoryName =
            type === 'complimentaryDrink' ? 'Complimentary Drink' : 'Complimentary Food'
        }

        this.update(type, item)
      }
    }
  },

  mounted() {
    this.getComplimentaryItems()
  }
}
</script>
