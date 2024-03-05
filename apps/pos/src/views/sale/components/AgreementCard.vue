<template>
  <div
    class="tw-flex tw-flex-col tw-cursor-pointer hover:tw-bg-gray-100"
    :class="{ 'tw-pointer-events-none': !applicable || applied }"
    @click="onAgreementClick"
  >
    <div
      class="tw-p-2 tw-border tw-border-gray-300"
      :class="{ 'tw-rounded-lg': applicable, 'tw-rounded-t-lg tw-border-b-none': !applicable }"
    >
      <div class="tw-flex tw-items-center tw-p-2">
        <CheckCircleFillIcon v-if="applied" class="tw-h-4 tw-w-4 tw-text-success tw-shrink-0" />
        <CheckCircleIcon v-else class="tw-h-4 tw-w-4 tw-text-secondary tw-shrink-0" />

        <div class="tw-ml-4">
          <b> {{ title }}</b>
          <slot name="content" />

          <slot name="footer" />
        </div>
      </div>
    </div>

    <div
      v-if="!applicable"
      class="tw-p-2 tw-text-center tw-bg-gray-200 tw-border tw-border-gray-300 tw-rounded-b-lg"
    >
      <p class="tw-text-sm tw-font-bold tw-mb-0">Not Applicable</p>
    </div>

    <Confirm :isShown="showConfirmDialog" @confirm="onApplyAgreementConfirm">
      <template #content>
        This order has Promotion discount applied already. Applying agreement will remove any
        additional discounts on services. Do you want to continue?
      </template>
    </Confirm>
  </div>
</template>

<script lang="ts">
import { CheckCircleFillIcon, CheckCircleIcon } from '@/components/icons'
import Confirm from '@/components/modal/Confirm.vue'
import { ProductTypes } from '@/stores/sale/saleable'
import { map, filter, difference, some, find, reduce } from 'lodash'
import { mapActions, mapState } from 'pinia'
import { useSale } from '@/stores'

export default {
  name: 'AgreementCard',
  props: {
    agreement: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showConfirmDialog: false,
      confirmed: false
    }
  },
  components: { CheckCircleFillIcon, CheckCircleIcon, Confirm },
  computed: {
    ...mapState(useSale, ['order', 'products', 'appliedAgreements']),
    applied() {
      return map(this.appliedAgreements, (a) => a.agreement._id).includes(this.agreement._id)
    },
    applicable() {
      if (
        [ProductTypes.MerchantsAgreement, ProductTypes.GrandMerchantsAgreement].includes(
          this.agreement.type
        )
      ) {
        /**
         * Sale must have two services with no other agreements applied to
         * apply merchant agreement
         *
         */
        const exclude = reduce(
          this.appliedAgreements,
          (items, applied) => {
            items = [...items, ...map(applied.old, 'id')]
            return items
          },
          [] as Array<string>
        )
        const services = map(
          filter(this.products, (p) => p.type === ProductTypes.Service),
          'id'
        )
        return difference(services, exclude).length >= 2
      }
      return this.agreement.applicable
    },
    canApply() {
      const getApplicableServices = () => {
        switch (this.agreement.type) {
          case ProductTypes.Upgrade:
            return filter(this.products, (upgrade) => upgrade.type === ProductTypes.Upgrade)
          default:
            return filter(this.products, (product) =>
              some(this.agreement.services, (s) => s.id === product.id)
            )
        }
      }

      const applicableItems = getApplicableServices()

      return !some(applicableItems, (i) => !!i.promotionId)
    },
    title() {
      switch (this.agreement.type) {
        case 'service':
          return this.agreement.serviceName
        case ProductTypes.MerchantsAgreement:
          return `Merchant's Agreement`
        case ProductTypes.GrandMerchantsAgreement:
          return `Grand Merchant's Agreement`
        case ProductTypes.KingsAgreement:
          return `King's Agreement`
        case ProductTypes.EmperorsAgreement:
          return `Emperor's Agreement`
        case 'upgrades':
          return map(this.agreement.upgrades, 'name').join(' & ')
        default:
          return 'Unknown Agreement'
      }
    }
  },
  methods: {
    ...mapActions(useSale, [
      'applyAgreement',
      'revertAgreement',
      'removePromotion',
      'fromSale',
      'flushAppliedAgreements'
    ]),
    handleAgreement() {
      const callable = this.applied ? this.revertAgreement : this.applyAgreement
      callable(this.agreement)
    },
    onApplyAgreementConfirm() {
      this.showConfirmDialog = false
      this.confirmed = true
    },
    onAgreementClick() {
      console.log(this.agreement)
      if (this.applied || !this.applicable) {
        return
      }

      if (!this.canApply && this.confirmed) {
        this.confirmed = false

        if (this.agreement?.type === 'service') {
          const serviceId = this.agreement.services[0].id
          const product = find(this.order.products, (p) => p.id === serviceId)

          if (product) {
            const promotion = find(this.order.promotion, (p) => p._id === product.promotionId)
            if (promotion) {
              this.removePromotion(promotion, true)
            } else {
              console.log(`Trying to revert promotion ${product.promotionId} lookup failed`)
            }
          }
        }

        this.handleAgreement()
      } else if (!this.canApply && !this.confirmed) {
        this.showConfirmDialog = true
        return
      } else {
        this.handleAgreement()
      }
    }
  }
}
</script>
