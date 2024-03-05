<template>
  <div class="tw-grid tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-2">
    <AgreementCard @click="$emit('closed-category-products')">
      <div class="tw-card-body tw-p-2 tw-flex tw-items-center tw-justify-center">
        <BackArrowIcon class="tw-text-primary hover:tw-text-secondary tw-w-8 tw-h-8" />
      </div>
    </AgreementCard>
    <AgreementCard
      @click="sellAgreement"
      title="Gentleman's Agreement"
      :points="$options.points.Gentleman"
    />
    <AgreementCard
      @click="sellMerchantsAgreement"
      title="Merchant's Agreement"
      :points="$options.points.Merchant"
    />
    <AgreementCard
      @click="sellGrandMerchantsAgreement"
      title="Grand Merchant's Agreement"
      :points="$options.points.GrandMerchant"
    />
    <AgreementCard
      @click="sellKingsAgreement"
      title="King's Agreement"
      :points="$options.points.King"
    />
    <AgreementCard
      @click="sellEmperorsAgreement"
      title="Emperor's Agreement"
      :points="$options.points.Emperor"
    />
  </div>
</template>

<script lang="ts">
import { mapActions } from 'pinia'
import { useSale } from '@/stores/sale/sale'
import { generateSaleItem } from '@/utilities/sale'
import { ProductTypes } from '@/stores/sale/saleable/product'
import BackArrowIcon from '@/components/icons/BackArrowIcon.vue'
import AgreementCard from './components/AgreementCard.vue'
import { FixedPoints } from '@/utilities/constants'

export default {
  points: FixedPoints,
  components: { BackArrowIcon, AgreementCard },
  getters: {
    isUserAddedToSale() {
      return true
    }
  },
  methods: {
    ...mapActions(useSale, ['add']),
    onAgreementAddedToSale() {
      this.$emit('showServices')
    },
    sellAgreement() {
      const agreement = generateSaleItem({
        id: 'Agreement',
        name: `Gentleman's Agreement`,
        price: 0,
        type: ProductTypes.GentlemanAgreement,
        category: ProductTypes.GentlemanAgreement,
        agreementCount: 10,
        agreementComp: 2,
        VAT: { amount: 8, label: '8%' },
        serviceCharge: { amount: 5, label: '5%' },
        points: FixedPoints.Gentleman
      })

      this.add(agreement)
      this.onAgreementAddedToSale()
    },

    sellMerchantsAgreement() {
      const price = 11680000
      const basePrice = price / 1.05 / 1.08

      const agreement = generateSaleItem({
        id: 'MerchantsAgreement',
        name: `Merchant's Agreement`,
        price: basePrice,
        type: ProductTypes.MerchantsAgreement,
        category: ProductTypes.MerchantsAgreement,
        agreementCount: 10,
        agreementComp: 2,
        VAT: { amount: 8, label: '8%' },
        serviceCharge: { amount: 5, label: '5%' },
        points: FixedPoints.Merchant
      })

      this.add(agreement)
    },

    sellGrandMerchantsAgreement() {
      const price = 23360000
      const basePrice = price / 1.05 / 1.08

      const agreement = generateSaleItem({
        id: 'GrandMerchantsAgreement',
        name: `Grand Merchant's Agreement`,
        price: basePrice,
        type: ProductTypes.GrandMerchantsAgreement,
        category: ProductTypes.GrandMerchantsAgreement,
        agreementCount: 20,
        agreementComp: 5,
        VAT: { amount: 8, label: '8%' },
        serviceCharge: { amount: 5, label: '5%' },
        points: FixedPoints.GrandMerchant
      })

      this.add(agreement)
    },

    sellKingsAgreement() {
      const price = 34000000

      const agreement = generateSaleItem({
        id: 'Kings',
        name: `King's Agreement`,
        price: price,
        pricePerMonth: price / 12,
        netPricePerMonth: price / 12,
        type: ProductTypes.KingsAgreement,
        category: ProductTypes.KingsAgreement,
        months: 12,
        VAT: { amount: 8, label: '8%' },
        points: FixedPoints.King
      })

      this.add(agreement)
    },

    sellEmperorsAgreement() {
      const price = 49900000
      const basePrice = price / 1.08

      const agreement = generateSaleItem({
        id: 'EmperorsAgreement',
        name: `Emperor's Agreement`,
        price: basePrice,
        pricePerMonth: price / 12,
        netPricePerMonth: basePrice / 12,
        type: ProductTypes.EmperorsAgreement,
        category: ProductTypes.EmperorsAgreement,
        months: 12,
        VAT: { amount: 8, label: '8%' },
        points: FixedPoints.Emperor
      })

      this.add(agreement)
    }
  }
}
</script>
