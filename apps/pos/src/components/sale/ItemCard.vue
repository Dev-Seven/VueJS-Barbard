<template>
  <div
    :ref="'item-card-' + item.id"
    tabIndex="{0}"
    class="tw-collapse tw-rounded-lg tw-border-b tw-border-gray-300"
    :class="{
      'tw-collapse-open': visible,
      'tw-collapse-close': !visible
    }"
  >
    <div class="tw-collapse-title tw-px-4">
      <ItemCardContent
        :item="item"
        :index="index"
        :details-visible="visible"
        @expandDetails="onExpand"
        @assign="onStaffMemberChange"
        @removePromotion="onPromotionRemove"
      >
        <ItemCardComplementaries
          v-if="item.complimentaries && !visible"
          :item="item"
          :index="index"
          upgrade
          auto-hide
        />
      </ItemCardContent>
    </div>
    <div class="tw-collapse-content tw-flex tw-flex-col tw-gap-2">
      <ItemCardComplementaries v-if="item.complimentaries" :item="item" :index="index" upgrade />

      <div class="tw-flex tw-gap-2">
        <div v-if="item.type !== types.Service" class="tw-flex tw-flex-col tw-w-1/3">
          <p class="tw-mb-1 tw-text-sm">Quantity</p>
          <div class="tw-flex">
            <button
              class="tw-btn tw-btn-gray-300 tw-text-white tw-btn-sm tw-rounded-r-none"
              @click="update('quantity', item.quantity - 1 || 1, 1)"
              :disabled="item.quantity === 1"
            >
              <MinusIcon class="tw-w-3 tw-h-3" />
            </button>
            <input
              class="tw-input tw-input-sm tw-border tw-border-gray-300 tw-w-full tw-rounded-none focus:tw-outline-none hidden-number-input tw-p-1 tw-text-center"
              type="number"
              :value="item.quantity"
              @change="update('quantity', parseInt(($event.target as HTMLInputElement).value) || 1)"
              placeholder="Qty."
            />
            <button
              class="tw-btn tw-btn-gray-100 tw-text-white tw-btn-sm tw-rounded-l-none"
              @click="update('quantity', item.quantity + 1, 1)"
            >
              <PlusIcon class="tw-w-3 tw-h-3" />
            </button>
          </div>
        </div>

        <div role="group" class="tw-w-1/3">
          <p class="tw-mb-1 tw-text-sm">Price</p>

          <input
            :value="item.manualPrice ? item.manualPrice : null"
            min="0"
            :max="item.price"
            :disabled="!!item.discount"
            :placeholder="numberWithCommas(round(item.price))"
            @input="applyManualPrice(parseInt(($event.target as HTMLInputElement).value))"
            class="tw-input tw-input-sm tw-border tw-border-gray-300 tw-w-full"
          />
        </div>

        <div role="group" class="tw-w-1/3">
          <p class="tw-mb-1 tw-text-sm">Discount(%)</p>
          <input
            type="number"
            class="tw-input tw-input-sm tw-border tw-border-gray-300 tw-rounded-lg tw-w-full focus:tw-outline-none"
            :disabled="!!item.manualPrice"
            :value="item.discount"
            placeholder="Discount"
            min="0"
            max="100"
            @input="applyDiscount(parseInt(($event.target as HTMLInputElement).value))"
          />
        </div>
      </div>

      <div role="group">
        <p class="tw-mb-1 tw-text-sm">Note</p>
        <input
          type="text"
          class="tw-input tw-input-sm tw-border tw-border-gray-300 tw-rounded-lg tw-w-full focus:tw-outline-none"
          :value="item.itemNote"
          placeholder="Item Note"
          @change="update('itemNote', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div v-if="item.promotionId" class="tw-flex tw-justify-between">
        <p class="tw-text-sm tw-mb-0"><b>Promotion:</b> {{ promotion?.name }}</p>

        <TrashIcon
          class="tw-w-4 tw-h-4 tw-cursor-pointer hover:tw-opacity-80"
          @click="onPromotionRemove"
        />
      </div>

      <p class="tw-text-sm" v-if="tax">
        {{ tax }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { isEmpty, round } from 'lodash'
import { getInitials, numberWithCommas } from '@/utilities/utility'
import ItemCardContent from './ItemCardContent.vue'
import ItemCardComplementaries from './ItemCardComplementaries.vue'
import { PlusIcon, MinusIcon, TrashIcon } from '@/components/icons'
import { useSale } from '@/stores/sale/sale'
import { mapActions } from 'pinia'
import genericMixin from './generic.mixin'
import { ProductTypes } from '@/stores/sale/saleable'
import { determinePoints } from '../../utilities/utility'

export default {
  name: 'ItemCard',
  components: {
    ItemCardContent,
    ItemCardComplementaries,
    PlusIcon,
    MinusIcon,
    TrashIcon
  },
  mixins: [genericMixin],
  props: {
    item: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      visible: false
    }
  },

  computed: {
    types() {
      return ProductTypes
    },
    shouldComputePoints() {
      return [ProductTypes.Product, ProductTypes.ProductVariant].includes(this.item.type)
    }
  },

  methods: {
    round,
    isEmpty,
    getInitials,
    numberWithCommas,

    ...mapActions(useSale, ['removePromotionFromProduct']),

    onExpand() {
      this.visible = !this.visible

      if (this.visible) {
        this.scrollToSelf()
      }
    },

    applyManualPrice(price: number) {
      const common = {
        manualPromotion: true,
        promotionId: false,
        priceAfterDiscount: 0
      }

      if (!price) {
        const points = this.shouldComputePoints
          ? determinePoints(this.item.price - this.item.cost)
          : this.item.points

        this.updateProperty(this.index, { ...common, manualPrice: 0, points })
        return
      }

      const points = this.shouldComputePoints
        ? determinePoints(price - this.item.cost)
        : this.item.points

      this.updateProperty(this.index, { ...common, manualPrice: price, points })
    },

    applyDiscount(percentage: number) {
      const common = {
        manualPromotion: true,
        promotionId: false
      }

      if (!percentage) {
        this.updateProperty(this.index, { ...common, discount: 0, priceAfterDiscount: 0 })
        return
      }

      const { price } = this.item
      const priceAfterDiscount = price - (price / 100) * percentage

      const points = this.shouldComputePoints
        ? determinePoints(priceAfterDiscount - this.item.cost)
        : this.item.points

      this.updateProperty(this.index, {
        ...common,
        discount: percentage,
        priceAfterDiscount,
        points
      })
    }
  }
}
</script>
