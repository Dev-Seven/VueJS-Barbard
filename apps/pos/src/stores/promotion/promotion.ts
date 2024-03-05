import { writeBatch, type Timestamp } from 'firebase/firestore'
import {
  each,
  filter,
  forOwn,
  groupBy,
  has,
  intersection,
  isArray,
  isString,
  map,
  orderBy,
  reduce,
  words
} from 'lodash'
import { defineStore } from 'pinia'
import { useSale } from '../sale/sale'
import { feeder, filterPromotionApplicableProducts, reducer } from '@/utilities/promotion'
import database from '@/config/firebase/database'
import { collection, doc } from 'firebase/firestore'
import { produce } from './producer'

export const DiscountTypes = {
  Money: 'money',
  Percentage: 'percentage',
  FixedPrice: 'fixed-price'
}

export const PromotionTypes = {
  Sale: 'sale',
  ProductCategory: 'productCategory',
  ProductBrand: 'productBrand',
  Product: 'product',
  Service: 'service',
  FnB: 'fnb',
  FnBCategory: 'fnbCategory',
  Agreement: 'agreement',
  Upgrade: 'upgrade'
}

export type Promotion = {
  _id: string
  name: string
  active: boolean
  voucher?: boolean
  autoApply?: boolean
  customerGroup?: Array<string>
  customerId?: Array<string>
  days?: Array<string>
  discountType: string
  discountValue: number
  product?: Array<string>
  productBrand?: Array<string>
  productCategory?: Array<string>
  fnb?: Array<string>
  fnbCategory?: Array<string>
  service?: Array<string>
  upgrades?: Array<string>
  memberGroup?: Array<string>
  userId?: Array<string>
  users?: Array<string>
  userTags?: Array<string>
  minAmount: number
  redemptionLimit?: number
  redemptionCount?: number

  timeFilter: boolean
  timeFrom: Timestamp
  timeTill: Timestamp

  type: string

  startDate: Timestamp
  endDate: Timestamp
}

export const usePromotion = defineStore('promotion', {
  state: () => ({
    promotions: [] as Array<Promotion>
  }),
  getters: {
    autoPromotions(state): Array<Promotion> {
      return state.promotions.filter((p: Promotion) => has(p, 'autoApply') && p.autoApply)
    },

    affiliatePromotions(): Array<Promotion> {
      const sale = useSale()
      return this.autoPromotions.filter(
        (p) => !!p?.voucher && p.users?.includes(sale.customer.userId)
      )
    },

    manualPromotions(state): Array<Promotion> {
      return state.promotions.filter((p: Promotion) => has(p, 'autoApply') && !p.autoApply)
    },

    autoProductPromotionGroups() {
      return groupBy(
        filter(this.autoPromotions, (p: Promotion) => p.type !== PromotionTypes.Sale),
        'type'
      )
    },

    autoSalePromotions(): Array<Promotion> {
      return this.autoPromotions.filter((p: Promotion) => p.type === PromotionTypes.Sale)
    },

    productPromotions(state): Array<Promotion> {
      return state.promotions.filter((p: Promotion) => p.type !== PromotionTypes.Sale)
    },

    salePromotions(state) {
      return state.promotions.filter((p: Promotion) => p.type === PromotionTypes.Sale)
    }
  },
  actions: {
    searchPromotion(search: string) {
      if (!search) {
        return []
      }

      const result = this.promotions.filter((p) => {
        return !!intersection(words(search.toLowerCase()), words(p.name.toLowerCase())).length
      })

      return orderBy(result, ['name'], ['asc'])
    },

    async recomputePromotion() {
      const sale = useSale()

      if (this.affiliatePromotions.length) {
        await sale.applyPromotion(this.affiliatePromotions[0], false)
        return
      }

      const productDecisions = await this.computeAutoPromotions()
      const saleDecision: any = await this.computeAutoSalePromotion()
      this.removeAllAutoAppliedPromotions()

      forOwn(productDecisions, async (computed, type) => {
        if (computed) {
          console.log(`Order: Applying ${type} auto promotion to the products`)
          await sale.applyPromotion(computed.promotion, false)
        }
      })

      if (saleDecision && saleDecision.discount > sale.subTotal) {
        await sale.applySalePromotion(saleDecision.promotion, false)
      }
    },

    async __populatePromotions() {
      const promotions = produce()
      const batch = writeBatch(database)
      promotions.forEach((promotion) => {
        batch.set(doc(collection(database, `promotions`)), promotion)
      })

      await batch.commit()
      console.log(`Created ${promotions.length} promotions`)
    },

    async computeAutoPromotions() {
      const sale = useSale()

      const groups = this.autoProductPromotionGroups
      const customer = sale.customer
      const products = sale.products

      const _assign = (promotion: Array<Promotion> | Promotion) => {
        if (isArray(promotion)) {
          const intermediateResults: { [key: string]: any } = {}
          each(promotion, (p: Promotion, index: number) => {
            const applicableProducts = filterPromotionApplicableProducts(p, products)
            const amount = reduce(
              applicableProducts,
              (total, item) => {
                return total + item.total
              },
              0
            )
            intermediateResults[index] = {}
            intermediateResults[index].promotion = p
            intermediateResults[index].products = applicableProducts
            intermediateResults[index].discount = feeder(amount, p.discountType, p.discountValue)
          })

          return reducer(intermediateResults)
        } else {
          const applicableProducts = filterPromotionApplicableProducts(promotion, products)
          const amount = reduce(
            applicableProducts,
            (total, item) => {
              return total + item.total
            },
            0
          )

          return {
            promotion,
            discount: feeder(amount, promotion.discountType, promotion.discountValue),
            products: applicableProducts
          }
        }
      }

      const computed: { [key: string]: any } = {}

      forOwn(groups, (promotions: Array<Promotion>, type) => {
        const intermediateResults: { [key: string]: any } = {}

        if (customer.userId) {
          // determine the value of discount for specific user & product | f&b
          const userProductPromotion = filter(promotions, (p) => {
            return p?.users && isArray(p.users) && p.users.includes(customer?.userId)
          })
          if (userProductPromotion.length) {
            intermediateResults['customer'] = _assign(userProductPromotion)
          }

          // determine the value of discount for specific user tags & product | f&b
          const tagSalePromotion = filter(promotions, (p) => {
            return (
              has(p, 'customerGroup') &&
              isArray(p.customerGroup) &&
              p.customerGroup.filter((i) => customer?.userTags?.includes(i)).length
            )
          })
          if (tagSalePromotion.length) {
            intermediateResults['tag'] = _assign(tagSalePromotion)
          }

          // determine the value of discount for user groups
          const groupSalePromotion = filter(promotions, (p) => {
            return (
              has(p, 'memberGroup') &&
              isArray(p.memberGroup) &&
              customer?.memberGroup &&
              p.memberGroup.includes(customer?.memberGroup)
            )
          })
          if (groupSalePromotion.length) {
            intermediateResults['group'] = _assign(groupSalePromotion)
          }
        }

        // determine the value of discount for normal product & f&b promotion
        const normalSalePromotion = filter(promotions, (p) => {
          return (
            (!p?.users || !p?.users?.length) &&
            (!p?.customerGroup || !p?.customerGroup?.length) &&
            (!p?.memberGroup || !p?.memberGroup?.length)
          )
        })
        if (normalSalePromotion.length) {
          intermediateResults['normal'] = _assign(normalSalePromotion)
        }

        computed[type] = reducer(intermediateResults)
      })

      return computed
    },

    async computeAutoSalePromotion() {
      const sale = useSale()

      const customer = sale.customer
      const amount = sale.subTotal

      if (!amount) {
        console.log(`Promotion:: order amount ${amount} is not valid`)
        return {
          promotion: {},
          discount: 0
        }
      }

      const estimates: { [key: string]: any } = {}

      const _assign = (promotion: Array<Promotion> | Promotion) => {
        if (isArray(promotion)) {
          const intermediateResults: { [key: string]: any } = {}
          each(promotion, (p, index) => {
            intermediateResults[index] = {}
            intermediateResults[index].promotion = p
            intermediateResults[index].discount = feeder(amount, p.discountType, p.discountValue)
          })

          return reducer(intermediateResults)
        } else {
          return {
            promotion,
            discount: feeder(amount, promotion.discountType, promotion.discountValue)
          }
        }
      }

      if (customer.userId) {
        // determine the value of discount for specific user
        const userSalePromotion = filter(this.autoSalePromotions, (p) => {
          return has(p, 'userId') && isArray(p.userId) && p.userId.includes(customer.userId)
        })
        if (userSalePromotion.length) {
          estimates['customer'] = _assign(userSalePromotion)
        }

        // determine the value of discount for specific user tags & product | fandb
        const tagSalePromotion = filter(this.autoSalePromotions, (p) => {
          return (
            has(p, 'customerGroup') &&
            isArray(p.customerGroup) &&
            p.customerGroup.filter((i: string) => customer.userTags.includes(i)).length
          )
        })
        if (tagSalePromotion.length) {
          estimates['tag'] = _assign(tagSalePromotion)
        }

        // determine the value of discount for specific user group
        const groupSalePromotion = filter(this.autoSalePromotions, (p) => {
          return (
            has(p, 'memberGroup') &&
            isArray(p.memberGroup) &&
            p.memberGroup.includes(customer.memberGroup)
          )
        })
        if (groupSalePromotion.length) {
          estimates['group'] = _assign(groupSalePromotion)
        }
      }

      // determine normal sale discount
      const normalSalePromotion = filter(this.autoSalePromotions, (p) => {
        return (
          (!p?.users || !p?.users?.length) &&
          (!p?.customerGroup || !p?.customerGroup?.length) &&
          (!p?.memberGroup || !p?.memberGroup?.length)
        )
      })
      if (normalSalePromotion.length) {
        estimates['normal'] = _assign(normalSalePromotion)
      }

      return reducer(estimates)
    },

    removeAllAutoAppliedPromotions(manual: boolean = false) {
      const sale = useSale()
      const autoAppliedPromotionIds = map(
        filter(sale.order.promotion, (i) => !i.manual),
        (i) => i._id
      )

      sale.$patch((state) => {
        state.order.products.forEach((product, index, products) => {
          if (
            isString(product.promotionId) &&
            autoAppliedPromotionIds.includes(product.promotionId)
          ) {
            const _product = { ...product }
            _product.promotionId = false
            _product.manualPromotion = manual
            _product.discountByPromotion = 0
            _product.priceAfterDiscount = 0
            _product.discount = 0
            _product.manualPrice = 0

            products[index] = _product
          }
        })
      })
    },

    hydrate(promotions: Array<Promotion>) {
      this.promotions = promotions
    }
  }
})
