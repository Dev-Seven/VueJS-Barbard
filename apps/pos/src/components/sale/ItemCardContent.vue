<template>
  <div>
    <div class="tw-flex">
      <div
        class="tw-flex tw-w-full tw-flex-grow-1 tw-gap-2 tw-mr-2"
        @click="$emit('expandDetails')"
        role="button"
      >
        <CaretDownIcon
          class="tw-text-primary tw-w-5 tw-h-5 tw-transition tw-duration-100 tw-shrink-0"
          :class="{
            '-tw-rotate-90': !detailsVisible
          }"
        />

        <div class="tw-flex tw-flex-col tw-w-full tw-gap-2">
          <p class="tw-mb-0 tw-font-medium" v-html="item.name"></p>
          <p class="tw-mb-0 tw-text-sm">
            {{ item.quantity || 0 }} x ₫{{ numberWithCommas(round(item.price)) }}
          </p>

          <div v-if="item.promotionId" class="tw-flex tw-items-center tw-gap-2">
            <GiftIcon class="tw-text-success tw-w-3 tw-h-3 tw-shrink-0" />

            <p class="tw-mb-0 tw-text-xs">
              {{ promotion?.name }}
            </p>

            <TrashIcon
              class="tw-text-error tw-w-4 tw-h-4 tw-shrink-0 relative z-10 hover:tw-opacity-80"
              @click.stop="onPromotionRemove"
            />
          </div>
        </div>

        <div class="tw-text-right">
          <p class="tw-font-bold tw-mb-0">₫{{ numberWithCommas(total) ?? 0 }}</p>
          <p v-if="item.discount || item.manualPrice" class="tw-mb-0 tw-line-through">
            ₫ {{ numberWithCommas(originalTotal) }}
          </p>
        </div>
      </div>

      <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
        <assigned-sales-person
          :id="String(item.id)"
          :staff="item.salesPerson"
          @assign="onStaffMemberChange"
        />

        <div
          v-if="item.points"
          class="tw-flex tw-items-center tw-justify-center tw-bg-amber-500 tw-px-1 tw-py-0.5 tw-rounded-full"
        >
          <div>
            <StarFillIcon class="tw-h-2.5 tw-w-2.5 tw-text-amber-300" />
          </div>
          <div class="tw-text-xs tw-text-white tw-mx-1 tw-font-bold">
            {{ item.points }}
          </div>
        </div>

        <TrashIcon
          class="tw-text-error tw-w-5 tw-h-5 tw-shrink-0 hover:tw-opacity-80"
          @click="remove(item)"
        />
      </div>
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { mapActions } from 'pinia'
import { numberWithCommas } from '@/utilities/utility'
import AssignedSalesPerson from './AssignedSalesPerson.vue'
import { TrashIcon, GiftIcon, CaretDownIcon, StarFillIcon } from '@/components/icons'
import { round } from 'lodash'
import { useSale } from '@/stores/sale/sale'
import generic from './generic.mixin'

export default {
  name: 'ItemCardContent',
  mixins: [generic],
  components: { AssignedSalesPerson, TrashIcon, GiftIcon, CaretDownIcon, StarFillIcon },
  props: {
    item: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    detailsVisible: Boolean
  },
  methods: {
    round,
    numberWithCommas,
    ...mapActions(useSale, ['remove'])
  }
}
</script>
