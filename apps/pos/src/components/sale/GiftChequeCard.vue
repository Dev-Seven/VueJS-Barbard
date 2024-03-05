<template>
  <div
    :ref="'item-card-' + item.id"
    tabIndex="{0}"
    class="tw-collapse tw-rounded-lg"
    :class="{
      'tw-collapse-open': visible,
      'tw-collapse-close': !visible,
      'tw-border tw-border-error': !isEmpty(errors),
      'tw-border-b tw-border-gray-300': isEmpty(errors)
    }"
  >
    <div class="tw-collapse-title tw-py-2 tw-px-4">
      <ItemCardContent
        :item="item"
        :index="index"
        :details-visible="visible"
        @expandDetails="onExpand"
        @assign="onStaffMemberChange"
        @removePromotion="onPromotionRemove"
      />
    </div>

    <div class="tw-collapse-content tw-flex tw-gap-4">
      <div role="group" class="tw-flex tw-flex-col">
        <p class="tw-mb-0 tw-text-sm">Value</p>
        <input
          :value="item.price"
          @change="update('price', parseInt(($event.target as HTMLInputElement).value))"
          name="amount"
          placeholder="Enter Amount"
          pattern="[0-9]*"
          class="tw-input tw-input-sm tw-border tw-border-gray-300 tw-w-full"
        />
      </div>
      <div role="group" class="tw-flex tw-flex-col">
        <p class="tw-mb-0 tw-text-sm">Code</p>
        <input
          type="text"
          class="tw-input tw-input-sm tw-border tw-rounded-lg tw-w-full focus:tw-outline-none"
          :class="{
            'tw-border-gray-300': !errors.code,
            'tw-border-error': errors.code
          }"
          :value="item.code"
          @change="onItemCodeInput(($event.target as HTMLInputElement).value)"
        />
        <p v-if="!isEmpty(errors) && errors.code" class="tw-mb-0 tw-text-xs tw-text-error">
          {{ errors.code }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { numberWithCommas } from '@/utilities/utility'
import ItemCardContent from './ItemCardContent.vue'
import { isEmpty, debounce } from 'lodash'
import db from '@/config/firebase/database'
import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import { mapActions } from 'pinia'
import { useSale } from '@/stores/sale/sale'
import genericMixin from './generic.mixin'

export default {
  name: 'GiftChequeCard',
  components: {
    ItemCardContent
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
      visible: true,
      errors: {} as any,
      voucher: null
    }
  },

  methods: {
    isEmpty,
    debounce,
    numberWithCommas,

    ...mapActions(useSale, ['updateProperty']),

    onItemCodeInput(code: string) {
      this.update('code', code)
      this.validator()

      if (code) this.checkVoucher(code)
    },

    validator() {
      if (!this.isEmpty(this.errors)) return false

      if (!this.item.code) {
        this.errors = {
          code: 'Giftcheque code required'
        }
        return false
      }
      this.errors = {}
      return true
    },

    onExpand() {
      this.visible = !this.visible

      if (this.visible) {
        this.scrollToSelf()
      }
    },

    async checkVoucher(val: string) {
      const voucherQuery = query(
        collection(db, `giftcheques`),
        where('code', '==', `${val}`),
        limit(1)
      )
      const snapshot = await getDocs(voucherQuery)

      if (snapshot.size !== 1) {
        this.errors = {}
        return
      }

      snapshot.forEach((v) => {
        const data = v.data()
        if (data.orderId) {
          this.errors = {
            code: 'Code already in use. Please change to a different one'
          }
          return
        }

        this.errors = {}
      })
    }
  }
}
</script>
