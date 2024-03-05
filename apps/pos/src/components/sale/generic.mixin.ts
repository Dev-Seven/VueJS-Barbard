import { find, trim } from 'lodash'
import { mapState, mapActions } from 'pinia'

import {
  getOriginalTotal,
  calculateVAT,
  calculateServiceCharge,
  getTotalPayableAmount,
  getSubTotalAmount
} from '@/utilities/sale'
import { ProductTypes } from '@/stores/sale/saleable'
import { useSale } from '@/stores/sale/sale'
import { usePromotion } from '@/stores/promotion/promotion'

export default {
  computed: {
    promotion() {
      return find(this.promotions, (p) => p._id === this.item.promotionId)
    },

    originalTotal() {
      return getOriginalTotal(this.item)
    },

    vat() {
      if (this.item.category === ProductTypes.GentlemanAgreement) {
        return this.item.service ? calculateVAT(this.item.service) : 0
      }
      return calculateVAT(this.item)
    },

    serviceCharge() {
      if (this.item.category === ProductTypes.GentlemanAgreement) {
        return this.item.service ? calculateServiceCharge(this.item.service) : 0
      }
      return calculateServiceCharge(this.item)
    },

    /**
     *
     * @returns {Number} price
     * @description priceToConsider determines which price should take precedence
     * when multiple price properties available in the product object
     */
    priceToConsider() {
      if (this.item.category === ProductTypes.GentlemanAgreement) {
        return this.item.service?.price || 0
      }
      if (this.item.discount) {
        return this.item.priceAfterDiscount
      } else if (this.item.manualPrice) {
        return this.item.manualPrice
      } else {
        return this.item.price
      }
    },

    price() {
      switch (this.item.category) {
        case ProductTypes.GentlemanAgreement:
          return this.item.service?.price || 0
        default:
          return this.item.price
      }
    },

    total() {
      return getTotalPayableAmount(this.item)
    },

    subTotal() {
      return getSubTotalAmount(this.item)
    },

    tax(): string {
      if (!this.item) {
        return ''
      }

      const { VAT = {}, serviceCharge = {} } = this.item
      let info = VAT?.amount ? `VAT ${VAT.label}` : ''

      if (info && serviceCharge?.amount) {
        info = `${info} & Service Charge ${serviceCharge.label}`
      }

      info = `${info} applied`

      return trim(info)
    },

    ...mapState(usePromotion, ['promotions'])
  },

  methods: {
    ...mapActions(useSale, ['updateProperty', 'removePromotionFromProduct']),

    update(property: string, value: any, min?: any) {
      if (!this.index && this.index != 0) {
        console.error(`Product mixin update called without item index in component`)
      }

      let _value = value
      if (!value && min) {
        _value = min
      }

      const update = { [property]: _value }
      console.log(update)
      this.updateProperty(this.index, update)
    },

    onCashDiscount(event: any) {
      const discount = parseInt((event.target as HTMLInputElement).value)
      this.update('discount', discount)
      this.update('priceAfterDiscount', this.item.price - discount)
    },

    onPromotionRemove() {
      this.removePromotionFromProduct(this.item)
    },

    onStaffMemberChange(staff: any) {
      this.updateProperty(this.index, { salesPerson: staff })
    },

    scrollToSelf() {
      const element: any = this.$refs['item-card-' + this.item.id]
      setTimeout(() => {
        element.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }, 10)
    }
  }
}
