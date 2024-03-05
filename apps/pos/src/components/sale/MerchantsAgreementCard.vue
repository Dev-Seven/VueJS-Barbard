<template>
  <div
    :ref="'item-card-' + item.id"
    tabIndex="{0}"
    class="tw-collapse tw-rounded-lg tw-border-b tw-border-gray-300"
    :class="{
      'tw-collapse-open': visible,
      'tw-collapse-close': !visible,
      'tw-border tw-border-danger': !isEmpty(errors)
    }"
  >
    <div class="tw-collapse-title tw-py-2 tw-px-4">
      <ItemCardContent
        :item="item"
        :index="index"
        :details-visible="visible"
        @expandDetails="onExpand"
        @assign="onStaffMemberChange"
      />
    </div>

    <div class="tw-collapse-content tw-flex tw-flex-col tw-gap-2">
      <div class="tw-flex tw-flex-col">
        <div class="tw-flex tw-gap-2 tw-mt-2">
          <div role="group" class="tw-flex-1">
            <p class="tw-mb-0 tw-text-sm">Services</p>
            <input
              type="number"
              class="tw-input tw-input-sm tw-border tw-border-gray-300 tw-rounded-lg tw-w-full focus:tw-outline-none"
              :min="1"
              :value="item.agreementCount"
              @input="update('price', parseInt(($event.target as HTMLInputElement).value))"
            />
          </div>
          <div role="group" class="tw-flex-1">
            <p class="tw-mb-0 tw-text-sm">Comp.</p>
            <input
              type="number"
              class="tw-input tw-input-sm tw-border tw-border-gray-300 tw-rounded-lg tw-w-full focus:tw-outline-none"
              :min="0"
              :value="item.agreementComp"
              @input="update('agreementComp', parseInt(($event.target as HTMLInputElement).value))"
            />
          </div>
          <div role="group" class="tw-flex-1">
            <p class="tw-mb-0 tw-text-sm">Discount (%)</p>
            <input
              type="number"
              class="tw-input tw-input-sm tw-border tw-border-gray-300 tw-rounded-lg tw-w-full focus:tw-outline-none"
              :min="0"
              :value="item.discount"
              @input="applyDiscount(parseInt(($event.target as HTMLInputElement).value))"
            />
          </div>
        </div>
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
import { mapState, mapActions } from 'pinia'
import { findIndex, isEmpty } from 'lodash'
import { getInitials, numberWithCommas } from '@/utilities/utility'
import ItemCardContent from './ItemCardContent.vue'
import { TrashIcon } from '@/components/icons'
import { useSale } from '@/stores/sale/sale'
import genericMixin from './generic.mixin'

export default {
  name: 'MerchantsAgreementCard',
  components: { ItemCardContent, TrashIcon },
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
      errors: {} as any,
      visible: false
    }
  },

  computed: {
    ...mapState(useSale, ['selectedAgreementId']),

    isActive() {
      return this.selectedAgreementId === this.item.id
    }
  },

  methods: {
    isEmpty,
    getInitials,
    numberWithCommas,

    ...mapActions(useSale, ['activateAgreement']),

    onExpand() {
      this.visible = !this.visible

      if (this.visible) {
        this.scrollToSelf()
      }
    },

    activate(active: boolean) {
      this.activateAgreement(active ? this.item.id : '')
    },

    remove(id: string) {
      const updated = [...(this.item.services || [])]
      const index = findIndex(updated, (i) => i.id === id)
      if (index !== -1) {
        updated.splice(index, 1)
        this.update('services', updated)
      }
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

      this.updateProperty(this.index, {
        ...common,
        discount: percentage,
        priceAfterDiscount
      })
    }
  }
}
</script>
