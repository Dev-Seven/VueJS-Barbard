<template>
  <Modal :isShown="isShown">
    <div
      class="tw-flex tw-justify-between tw-items-center tw-w-full tw-p-6 tw-border-b tw-border-gray-300"
    >
      <h6 class="tw-mb-0">Apply Promotion</h6>

      <CloseIcon
        class="tw-w-4 tw-h-4 tw-cursor-pointer hover:tw-opacity-70"
        @click="$emit('update:isShown', false)"
      />
    </div>

    <div class="tw-flex tw-flex-col tw-p-6 tw-gap-4">
      <div
        v-for="(promotion, index) in order.promotion"
        class="tw-w-100 tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-flex tw-items-center"
        :key="`applied-promotion-${index}`"
      >
        <p class="tw-mb-0">{{ promotion.name }}</p>

        <CheckCircleFillIcon class="tw-ml-auto tw-text-success tw-h-5 tw-w-5 tw-mr-2" />

        <TrashIcon
          class="tw-text-error tw-h-5 tw-w-5 tw-cursor-pointer hover:tw-opacity-80"
          @click="removePromotion(promotion)"
        />
      </div>

      <input
        type="search"
        class="tw-input tw-w-full tw-px-3 tw-border tw-border-gray-300 focus:tw-outline-none"
        placeholder="Search Promotion"
        @input="onSearch"
      />

      <div v-if="searchItemsResult.length" class="tw-w-full tw-flex tw-flex-col">
        <div
          v-for="promotion in searchItemsResult"
          class="tw-flex tw-items-center tw-justify-between tw-border-x tw-border-b tw-border-gray-300 tw-px-4 tw-py-2 first:tw-rounded-t-lg first:tw-border-t last:tw-rounded-b-lg"
          :key="promotion.name"
          @click="onSearchItemClick(promotion)"
        >
          <p class="tw-mb-0">{{ promotion.name }}</p>
          <p class="tw-mb-0">{{ promotion.discount }}</p>

          <div class="tw-flex tw-gap-4">
            <button
              v-if="appliedPromotionIds.includes(promotion._id)"
              class="tw-btn tw-btn-error tw-text-white tw-font-normal"
              @click="removePromotion(promotion)"
            >
              Remove
            </button>
            <button
              v-else
              class="tw-btn tw-btn-primary tw-text-white tw-font-normal"
              @click="() => applyPromotion(promotion)"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div class="tw-overflow-x-auto">
        <table class="tw-table tw-table-compact tw-w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Discount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(promotion, index) in manualPromotions" :key="index">
              <td>
                <p class="tw-mb-0">
                  {{ promotion.name }}
                </p>

                <div
                  v-if="promotion.type === Promotions.Sale"
                  className="tw-badge tw-badge-success"
                >
                  Sale Promotion
                </div>
              </td>

              <td>
                <p class="tw-mb-0">
                  {{ promotion.discountValue }}
                  {{ promotion.discountType === 'percentage' ? '%' : '₫' }}
                </p>
              </td>

              <td>
                <button
                  v-if="appliedPromotionIds.includes(promotion._id)"
                  class="tw-btn tw-btn-sm tw-btn-error tw-font-normal tw-text-white"
                  @click="removePromotion(promotion)"
                >
                  Remove
                </button>
                <button
                  v-else
                  class="tw-btn tw-btn-sm tw-btn-primary tw-font-normal tw-text-white"
                  @click="() => applyPromotion(promotion)"
                >
                  Apply
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="tw-px-6 tw-pb-6 tw-flex tw-justify-end">
      <button
        class="tw-btn tw-btn-primary tw-text-white tw-font-normal"
        @click="$emit('update:isShown', false)"
      >
        Ok
      </button>
    </div>
  </Modal>
</template>

<script lang="ts">
import { mapActions, mapState } from 'pinia'
import { debounce, isEmpty, map } from 'lodash'
import Modal from '@/components/common/Modal.vue'
import { useSale } from '@/stores/sale/sale'
import { PromotionTypes, usePromotion } from '@/stores/promotion/promotion'
import { CloseIcon, TrashIcon, CheckCircleFillIcon } from '../icons'

export default {
  components: {
    Modal,
    CloseIcon,
    TrashIcon,
    CheckCircleFillIcon
  },
  props: {
    isShown: [Boolean]
  },
  data() {
    return {
      searchItemsResult: [],
      fields: [
        // A column that needs custom formatting
        { key: 'name', label: 'Promotion' },
        // A regular column
        'discount',
        // A regular column
        { key: 'action', label: '' }
      ]
    }
  },

  computed: {
    ...mapState(usePromotion, ['manualPromotions']),
    ...mapState(useSale, ['order']),

    appliedPromotionIds() {
      return map(this.order.promotion, '_id')
    },

    Promotions() {
      return PromotionTypes
    }
  },
  methods: {
    isEmpty,

    ...mapActions(usePromotion, ['searchPromotion']),
    ...mapActions(useSale, ['applyPromotion', 'removePromotion']),

    onSearchItemClick(promotion) {
      this.applyPromotion(promotion)
      this.search = ''
      this.searchItemsResult = []
    },

    onSearch: debounce(async function (event) {
      const search = event.target.value
      this.searchItemsResult = await this.searchPromotion(search)
    }, 100)
  }
}
</script>
