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
      <div class="tw-flex tw-gap-2">
        <div role="group" class="tw-flex-1">
          <p class="tw-mb-0 tw-text-sm">Months</p>
          <input
            type="number"
            :value="item.months"
            class="tw-input tw-input-sm tw-border tw-border-gray-300 tw-rounded-lg tw-w-full focus:tw-outline-none"
            @change="update('months', parseInt(($event.target as HTMLInputElement).value))"
          />
        </div>
        <div role="group" class="tw-flex-1">
          <p class="tw-mb-0 tw-text-sm">No.</p>
          <input
            type="text"
            class="tw-input tw-input-sm tw-border tw-border-gray-300 tw-rounded-lg tw-w-full focus:tw-outline-none"
            :value="item.lockerNumber"
            @change="update('lockerNumber', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div role="group" class="tw-flex-1">
          <p class="tw-mb-0 tw-text-sm">Guests</p>
          <input
            type="number"
            class="tw-input tw-input-sm tw-border tw-border-gray-300 tw-rounded-lg tw-w-full focus:tw-outline-none"
            :value="item.freeGuests"
            @change="update('freeGuests', parseInt(($event.target as HTMLInputElement).value))"
          />
        </div>
        <div role="group" class="tw-flex-1">
          <p class="tw-mb-0 tw-text-sm">Discount ₫</p>
          <input
            type="number"
            class="tw-input tw-input-sm tw-border tw-border-gray-300 tw-rounded-lg tw-w-full focus:tw-outline-none"
            :value="item.discount"
            @change="onCashDiscount($event)"
          />
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
import { numberWithCommas } from '@/utilities/utility'
import ItemCardContent from './ItemCardContent.vue'
import { TrashIcon } from '@/components/icons'
import genericMixin from './generic.mixin'

export default {
  name: 'LockerBoxCard',
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
      visible: false
    }
  },
  methods: {
    numberWithCommas,

    onExpand() {
      this.visible = !this.visible

      if (this.visible) {
        this.scrollToSelf()
      }
    }
  }
}
</script>
