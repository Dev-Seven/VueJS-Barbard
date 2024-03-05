import {
  cloneDeep,
  each,
  filter,
  findIndex,
  map,
  reduce,
  round,
  has,
  forEach,
  isArray
} from 'lodash'
import { defineStore } from 'pinia'
import { ProductTypes } from './saleable/product'
import { PromotionTypes, type Promotion, usePromotion } from '../promotion/promotion'
import { EventStatus, useEvents, type ExtendedEvent } from '../events'
import { SaleStatus, generateOrder } from './order'
import { useRegister } from '../register'
import { ref, remove, set, update, serverTimestamp } from 'firebase/database'
import { useStaff } from '../staff'
import database, { transform } from '@/config/firebase/realtime-database'
import db from '@/config/firebase/database'
import {
  collection,
  doc,
  Timestamp,
  runTransaction,
  serverTimestamp as serverTimestampFirestore
} from 'firebase/firestore'
import { deepCloneObject, patchTimeStamp } from '@/utilities/utility'
import { type SaleProduct } from './types'
import {
  calculatePoints,
  calculateServiceCharge,
  calculateVAT,
  getSubTotalAmount,
  getTotalPayableAmount,
  priceToConsider,
  sanitizeProduct
} from '@/utilities/sale'
import Product from '../inventory/product'
import {
  createGentlemanAgreements,
  createGiftCheque,
  createKingsAgreements,
  createLedgerEntries,
  createLockerBox,
  createMerchantAgreements,
  updateAgreements,
  updatePromotions
} from './helper'
import moment from 'moment'
import { productTotal, feeder, filterPromotionApplicableProducts } from '@/utilities/promotion'
import { KingAgreementCategories } from '../agreement'

export const DiscountTypes = {
  Money: 'money',
  Percentage: 'percentage',
  FixedPrice: 'fixed-price'
}

export type Customer = {
  userTags: Array<string>
  userName: string
  userId: string
  userPhone?: string
  userEmail?: string
  userPersona?: Array<string>
  memberGroup?: string
  onAccount?: boolean
  customerAlert?: string
  affiliateCodes: Array<string>
}

export type SaleDiscount = {
  type: string
  percentage: number
  amount: number
  promotion: Promotion | null
  manual: boolean
}

export const useSale = defineStore('sale', {
  state: () => ({
    order: { ...generateOrder() },

    selectedAgreementId: '',
    appliedAgreements: [] as Array<any>
  }),
  getters: {
    customer(state): Customer {
      return {
        userTags: state.order.userTags,
        userName: state.order.userName,
        userId: state.order.userId,
        userPhone: state.order.userPhone,
        userEmail: state.order.userEmail,
        userPersona: state.order.userPersona,
        memberGroup: state.order.memberGroup,
        customerAlert: state.order.customerAlert,
        onAccount: state.order.onAccount,
        affiliateCodes: state.order.affiliateCodes
      }
    },
    saleDiscount(state): SaleDiscount {
      return {
        ...state.order.discount,
        amount:
          state.order.discount.type === DiscountTypes.Percentage
            ? round((this.subTotal / 100) * state.order.discount.percentage)
            : state.order.discount.amount,
        percentage:
          state.order.discount.type === DiscountTypes.Money
            ? (state.order.discount.amount / this.subTotal) * 100
            : state.order.discount.percentage
      } as SaleDiscount
    },

    salePromotion(state): SaleDiscount {
      return {
        ...state.order.salePromotion,
        amount:
          state.order.salePromotion.type === DiscountTypes.Percentage
            ? (this.subTotal / 100) * state.order.salePromotion.percentage
            : state.order.salePromotion.amount,
        percentage:
          state.order.salePromotion.type === DiscountTypes.Money
            ? (state.order.salePromotion.amount / this.subTotal) * 100
            : state.order.salePromotion.percentage
      } as SaleDiscount
    },

    visibleSaleDiscount(state): SaleDiscount {
      return {
        ...state.order.discount,
        amount:
          state.order.discount.type === DiscountTypes.Percentage
            ? // @ts-ignore
              round((this.subTotal / 100) * state.order.discount.percentage || 0)
            : state.order.discount.amount,
        percentage:
          state.order.discount.type === DiscountTypes.Money
            ? // @ts-ignore
              (state.order.discount.amount / this.subTotal) * 100 || 0
            : state.order.discount.percentage
      }
    },

    products(state): Array<SaleProduct> {
      return state.order.products
    },

    subTotal(state) {
      const reducer = (acc: number, current: SaleProduct) => acc + getSubTotalAmount(current)
      return round(reduce(state.order.products, reducer, 0))
    },

    totalServiceCharge(state) {
      const reducer = (acc: number, current: SaleProduct) => {
        if (current.type === ProductTypes.GentlemanAgreement) {
          if (!current.service || !current.agreementCount) return 0

          return acc + calculateServiceCharge(current.service) * current.agreementCount
        }
        return acc + calculateServiceCharge(current) * current.quantity
      }
      return reduce(state.order.products, reducer, 0)
    },

    totalServiceChargePaying(): number {
      return (
        this.totalServiceCharge - (this.totalServiceCharge / 100) * this.reduceChargesByPercentage
      )
    },

    totalVAT(state): number {
      const reducer = (acc: number, current: SaleProduct) => {
        if (current.type === ProductTypes.GentlemanAgreement) {
          if (!current.service || !current.agreementCount) return 0

          return acc + calculateVAT(current.service) * current.agreementCount
        }
        return acc + calculateVAT(current) * current.quantity
      }

      return reduce(state.order.products, reducer, 0)
    },

    totalVATPaying(): number {
      return this.totalVAT - (this.totalVAT / 100) * this.reduceChargesByPercentage
    },

    total(): number {
      return round(this.subTotal + this.totalVAT + this.totalServiceCharge)
    },

    totalPayableAmount(): number {
      const voidChargesByPercentage =
        (this.saleDiscount.percentage || 0) + (this.salePromotion.percentage || 0)

      const amount = reduce(
        this.order.products,
        (acc, current) => acc + getTotalPayableAmount(current, voidChargesByPercentage),
        0
      )

      const voidAmount = (this.saleDiscount.amount || 0) + (this.salePromotion.amount || 0)

      // TODO removed -3 rounding from here
      return round(amount - voidAmount)
    },

    totalReportingValue(state): number {
      const exclude = [
        ProductTypes.GentlemanAgreement,
        ProductTypes.KingsAgreement,
        ProductTypes.GiftCheque,
        ProductTypes.LockerBox
      ]

      const voidChargesByPercentage =
        (this.saleDiscount.percentage || 0) + (this.salePromotion.percentage || 0)

      const reducer = (acc: number, current: SaleProduct) =>
        acc + getTotalPayableAmount(current, voidChargesByPercentage)
      const products = filter(state.order.products, (p) => !exclude.includes(p.type))
      const amount = reduce(products, reducer, 0)

      const voidAmount = (this.saleDiscount.amount || 0) + (this.salePromotion.amount || 0)

      return round(amount - voidAmount)
    },

    /**
     * Returns the count value times two plus one.
     *
     * @returns {number}
     */
    totalDiscountByPromotion(): number {
      const productPromotionAmount = reduce(
        this.order.products,
        (sum, product) => sum + product.discountByPromotion,
        0
      )
      const salePromotionAmount = this.salePromotion.amount
      return round(productPromotionAmount + salePromotionAmount, -3)
    },

    /**
     * @description Overall discount applied to sale considering
     * the sale discount, auto and manual promotion discounts.
     * useful for receipt and reporting data.
     *
     * @returns {number}
     */
    totalDiscount(): number {
      return this.saleDiscount.amount + this.totalDiscountByPromotion
    },

    totalPointsEarned(state): number {
      return reduce(
        state.order.products,
        (sum, product) => {
          if (!product.points) return sum
          return sum + product.points
        },
        0
      )
    },

    appliedPromotion(state) {
      return state.order.promotion
    },

    promotionToDisplay(state) {
      return filter(state.order.promotion, (p) => p.type === PromotionTypes.Sale)
    },

    appliedPromotionIds(state) {
      return map(state.order.promotion, (p) => p._id)
    },

    agreementTotal(state) {
      return reduce(
        state.appliedAgreements,
        (total, current: any) => {
          return total + current.agreementTotal
        },
        0
      )
    },

    totalExcludingVAT(state) {
      return reduce(
        state.order.products,
        (acc, current) => {
          return (acc += priceToConsider(current) * current.quantity)
        },
        0
      )
    },

    reduceChargesByPercentage(): number {
      return (this.saleDiscount.percentage || 0) + (this.salePromotion.percentage || 0)
    }

    // isPromotionalSale(state) {
    //   return !isEmpty(state.order.promotion) && !!state.order.promotion.length
    // },

    // promotion(state) {
    //   return this.isPromotionalSale ? state.order.promotion : false
    // },
  },
  actions: {
    setTable(id: string, name: string) {
      this.order.tableId = id
      this.order.tableName = name
      this.update()
      return { tableId: id, tableName: name }
    },

    setOrderNote(note: string) {
      this.order.orderNote = note
      this.update()
    },

    activateAgreement(id: string) {
      this.selectedAgreementId = id
    },

    async assignCustomer(customer: any) {
      this.order.userTags = customer.userTags ?? []
      this.order.userName = customer.fullName ?? ''
      this.order.userId = customer._id
      this.order.userPhone = customer.phone ?? ''
      this.order.userEmail = customer.email ?? ''
      this.order.userPersona = customer.persona ?? []
      this.order.memberGroup = customer.loyalty?.memberGroup ?? ''
      this.order.customerAlert = customer.customerAlert ?? ''
      this.order.onAccount = customer.onAccount ?? ''
      this.order.affiliateCodes = customer.affiliateCodes ?? []

      await this.update()
    },

    async removeCustomer() {
      this.order = {
        ...this.order,
        ...{
          userId: '',
          userTags: [],
          userName: '',
          userPhone: '',
          userEmail: '',
          userPersona: [],
          memberGroup: '',
          customerAlert: '',
          onAccount: false
        }
      }

      await this.update()
    },

    setGuestCount(count: number) {
      this.order.amountOfGuest = count
    },

    setCustomBill(customBillName: string) {
      this.order.customBill = customBillName
      return customBillName
    },

    async update(options: { shouldClearState: boolean } = { shouldClearState: false }) {
      const register = useRegister()

      const _update = {
        ...this.order,
        totalOrderValue: this.total,
        totalReportingValue: this.totalReportingValue,
        totalPayableAmount: this.totalPayableAmount,
        totalWithoutVat: this.totalExcludingVAT,
        totalServiceCharge: this.totalServiceChargePaying,
        totalVAT: this.totalVATPaying,
        totalDiscount: this.totalDiscount,
        totalPoints: this.totalPointsEarned,
        registerId: register.registerId,
        updatedAt: serverTimestamp()
      }

      if (_update.orderId) {
        console.log(`order ${this.order.orderId} being updated`)
        await update(ref(database, `${register.location}/${_update.orderId}`), transform(_update))
      } else {
        console.log(`order update skipped`)
      }

      if (options.shouldClearState) {
        this.clear()
      }
    },

    async updateProperty(index: number, updates: { [key: string]: any }) {
      this.$patch((state) => {
        const next = { ...state.order.products[index], ...updates }
        state.order.products.splice(index, 1, next)
      })
      await this.update()
    },

    async updateStatus(status: string) {
      const register = useRegister()
      const orderId = this.order.orderId

      console.log(`order ${orderId} status being updated`)

      const _update = {
        status,
        updatedAt: serverTimestamp()
      }

      if (orderId) {
        await update(ref(database, `${register.location}/${orderId}`), transform(_update))
      }
    },

    async open(data: any) {
      const register = useRegister()
      const staff = useStaff()

      const createdAtTimestamp = serverTimestamp()

      const payload = {
        ...this.order,
        registerId: register.registerId,
        createdAt: createdAtTimestamp,
        updatedAt: createdAtTimestamp,
        orderId: moment().unix(),
        staffId: staff.active._id,
        staffName: staff.active.fullName,
        isCustomBill: !!data?.customBill,
        active: true,
        status: SaleStatus.OPEN,
        ...data
      }

      await set(ref(database, `${register.location}/${payload.orderId}`), transform(payload))

      return payload
    },

    async add(product: SaleProduct) {
      const staff = useStaff()
      if (!product.salesPerson) {
        product.salesPerson = {
          staffId: staff.active._id,
          staffName: staff.active.fullName,
          image: staff.active.image
        }
      }

      if ([ProductTypes.Service, ProductTypes.Upgrade].includes(product.type)) {
        const agreementIndex = findIndex(
          this.order.products,
          (o) => o.id === this.selectedAgreementId
        )

        if (agreementIndex !== -1) {
          this.order.products[agreementIndex].service = product
          this.order.products[agreementIndex].price = product.price
          this.selectedAgreementId = ''
          await this.update()
          return
        } else {
          this.order.products.push(product)
        }
      } else {
        const existing = findIndex(this.order.products, (p) => p.id === product.id)

        if (existing !== -1) {
          this.order.products[existing].quantity = this.order.products[existing].quantity + 1
        } else {
          this.order.products.push(product)
        }
      }

      if (product.type === ProductTypes.GentlemanAgreement) {
        this.selectedAgreementId = product.id
      }

      const promotion = usePromotion()
      promotion.recomputePromotion()
      await this.update()
    },

    async remove(product: any) {
      try {
        const index = findIndex(this.order.products, (p) => p.id === product.id)

        if (index === -1) {
          console.log(`Could not find item in sale`)
          return
        }
        this.order.products.splice(index, 1)

        const promotion = usePromotion()
        promotion.recomputePromotion()
        await this.update()
      } catch (error) {
        console.error(error)
      }
    },

    createOrderProductsSummary() {
      const order = cloneDeep(this.order)

      const summary = (product: any) => {
        /**
         * price: Single item price
         * totalEx: quantity * price OR manualPrice
         * totalDiscount: TotalEx * (discount OR discountByPromotion)/100
         * totalServiceCharge: (TotalEx - TotalDiscount) * serviceCharge->amount/100
         * totalVAT: (TotalEx - TotalDiscount + TotalServiceCharge) * VAT->amount/100
         * total: totalEx + TotalServiceCharge + TotalVAT - TotalDiscount
         *
         * For agreements sold we will need to store the same information as above inside
         * the product object. Now all prices are 0 in agreement objects in the products array.
         *
         */

        if (product.type === ProductTypes.GentlemanAgreement) {
          if (product.service) {
            product.price = product.service.price
            product.totalEx = product.service.price * product.agreementCount
          } else {
            console.log(`Order:: agreement linked service not found`)
            throw new Error('Agreement has no service selected, could not proceed with order')
          }
        } else {
          product.price = product.manualPrice ? product.manualPrice : product.price
          product.totalEx = product.price * product.quantity
        }

        const discountedBy = product.discount ? product.discount : product.discountByPromotion
        if (discountedBy) {
          if (
            [
              ProductTypes.KingsAgreement,
              ProductTypes.LockerBox,
              ProductTypes.EmperorsAgreement
            ].includes(product.type)
          ) {
            product.totalDiscount = product.discount * product.quantity
          } else {
            product.totalDiscount = product.totalEx * (discountedBy / 100)
          }
        } else {
          product.totalDiscount = 0
        }

        if (has(product.serviceCharge, 'amount')) {
          product.totalServiceCharge =
            ((product.totalEx - product.totalDiscount) * product.serviceCharge.amount) / 100
        } else {
          product.totalServiceCharge = 0
        }

        if (has(product.VAT, 'amount')) {
          product.totalVAT =
            ((product.totalEx - product.totalDiscount + product.totalServiceCharge) *
              product.VAT.amount) /
            100
        } else {
          product.totalVAT = 0
        }

        product.total =
          product.totalEx + product.totalServiceCharge + product.totalVAT - product.totalDiscount
        return product
      }

      order.products = map(order.products, (product) => {
        if (product.type === ProductTypes.Upgrade) {
          if (product.complimentaryDrink) {
            const drink = { ...product.complimentaryDrink, price: 0 }
            product.complimentaryDrink = summary(drink)
          }
        }

        if (product.type === ProductTypes.Service) {
          if (product.complimentaryFood) {
            const food = { ...product.complimentaryFood, price: 0 }
            product.complimentaryFood = summary(food)
          }

          if (product.complimentaryDrink) {
            const drink = { ...product.complimentaryDrink, price: 0 }
            product.complimentaryDrink = summary(drink)
          }
        }

        return summary(product)
      })

      return order
    },

    async complete(payload: { payments: Array<any>; voucher?: any; discard?: boolean }) {
      try {
        const { discard = false } = payload
        const register = useRegister()
        const orderRef = doc(collection(db, `locations/${register.location}/orders`))

        await runTransaction(db, async (transaction) => {
          const locationRef = doc(db, `locations/${register.location}`)
          const locationDoc = await transaction.get(locationRef)
          const locationData = locationDoc.data()

          const _OrderIdSequence = locationData?.OrderIdSequence || 0
          //@ts-ignore
          const orderId = `${locationData.code}-${_OrderIdSequence + 1}`

          let orderData: any = this.createOrderProductsSummary()

          orderData.products = orderData.products.map((p: any) => patchTimeStamp(p, 'orderedAt'))

          orderData = patchTimeStamp(
            orderData,
            'createdAt',
            'updatedAt',
            'eventItem.createdAt',
            'eventItem.updatedAt',
            'eventItem.startDate',
            'eventItem.endDate',
            'eventItem.reminderDate'
          )

          const { products, ...partialOrderData } = orderData

          await transaction.set(orderRef, {
            ...partialOrderData,
            orderId,
            paid: discard ? false : true,
            status: discard ? SaleStatus.DISCARDED : SaleStatus.CLOSED,
            closedAt: serverTimestampFirestore(),
            agreementTotal: this.agreementTotal
          })

          await Promise.all(
            map(products, async (product) => {
              const _ref = doc(
                collection(db, `locations/${register.location}/orders/${orderRef.id}/items`)
              )
              const sanitized = sanitizeProduct(product, { orderId: orderRef.id })
              if (isArray(sanitized)) {
                await Promise.all(
                  sanitized.map((s) => {
                    const itemRef = doc(
                      collection(db, `locations/${register.location}/orders/${orderRef.id}/items`)
                    )
                    return transaction.set(itemRef, s)
                  })
                )
              } else {
                await transaction.set(_ref, sanitized)
              }
            })
          )

          const actions = [
            createLedgerEntries,
            updateAgreements,
            updatePromotions,
            createGentlemanAgreements,
            createMerchantAgreements,
            createKingsAgreements,
            createGiftCheque,
            createLockerBox
          ]

          await Promise.all(
            actions.map(async (action) => {
              await action({
                transaction,
                _id: orderRef.id,
                orderId,
                registerId: register.registerId,
                registerName: register.outlet,
                location: register.location,
                customer: this.customer,
                order: this.order,
                payments: payload.payments,
                voucher: payload.voucher,
                saleDiscount: this.saleDiscount
              })
            })
          )

          const OrderIdSequence = _OrderIdSequence + 1
          transaction.update(locationRef, { OrderIdSequence })

          console.log(`Order:: ${orderRef.id} has been processed`)
        })

        const _node = ref(database, `${register.location}/${this.order.orderId}`)
        await remove(_node)

        await this.clear()
      } catch (e) {
        console.log(e)
      }
    },

    removeProductById(productId: String) {
      const index = findIndex(this.order.products, (p) => p.id === productId)
      if (index === -1) return
      if (this.order.products[index].quantity > 1) {
        this.order.products[index].quantity--
      } else {
        this.order.products.splice(index, 1)
      }
    },

    removeProductByUUID(uuid: String) {
      const index = findIndex(this.order.products, (p) => p.uuid === uuid)
      if (index === -1) return
      this.order.products.splice(index, 1)
    },

    async openParked() {
      const register = useRegister()
      this.order.parkedSale = false
      this.order.active = true
      this.order.createdAt = Timestamp.fromDate(new Date())
      this.order.openRegisterEntryId = register.registerId
      return await this.update()
    },

    async discard() {
      await this.complete({
        payments: [],
        discard: true
      })
      return true
    },

    async park() {
      this.order.parkedSale = true
      this.order.active = false
      this.order.status = SaleStatus.PARKED
      this.order.openRegisterEntryId = ''
      await this.update()
      return { parkedSale: true }
    },

    clear() {
      this.order = { ...generateOrder() }
    },

    /**
     * @param discount { type, percentage, amount }
     * @description Manual discount being applied through
     * the discount dialog in the Order
     */
    async applyDiscount(discount: SaleDiscount) {
      this.order.discount = discount
      await this.update()
    },

    async resetDiscount() {
      this.order.discount = {
        type: 'percentage',
        percentage: 0,
        amount: 0,
        promotion: null,
        manual: false
      }

      await this.update()
    },

    applySalePromotion(promotion: Promotion, manual: boolean = true) {
      const payload = {
        amount:
          promotion.discountType === DiscountTypes.Money
            ? promotion.discountValue
            : (this.subTotal / 100) * promotion.discountValue,
        percentage:
          promotion.discountType === DiscountTypes.Money
            ? round((promotion.discountValue / this.subTotal) * 100)
            : promotion.discountValue,
        type: promotion.discountType,
        promotion,
        manual
      }
      this.order.salePromotion = payload
    },

    async applyPromotion(promotion: Promotion, manual: boolean = true) {
      if (promotion.type === PromotionTypes.Sale) {
        this.applySalePromotion(promotion)
      } else {
        const applicableProducts = filterPromotionApplicableProducts(promotion, this.order.products)
        const amount = reduce(applicableProducts, (total, item) => total + productTotal(item), 0)
        const discount = feeder(amount, promotion.discountType, promotion.discountValue)

        let promotionDiscount = discount
        if (applicableProducts.length) {
          promotionDiscount = 0

          each(applicableProducts, (product) => {
            const index = findIndex(this.order.products, (i) => i.id === product.id)
            if (index !== -1) {
              const _product = { ...this.order.products[index] }
              _product.promotionId = promotion._id
              _product.manualPromotion = manual

              if (promotion.discountType === DiscountTypes.Money) {
                _product.discountByPromotion = promotion.discountValue
                _product.manualPrice = _product.price - promotion.discountValue
                _product.discount = 0
                _product.priceAfterDiscount = _product.price - promotion.discountValue
                _product.points = calculatePoints(_product)
                promotionDiscount += promotion.discountValue
              } else if (promotion.discountType === DiscountTypes.Percentage) {
                const discountValue = (priceToConsider(_product) / 100) * promotion.discountValue
                _product.discountByPromotion = discountValue
                _product.manualPrice = 0
                _product.discount = promotion.discountValue
                _product.priceAfterDiscount = _product.price - discountValue
                _product.points = calculatePoints(_product)
                promotionDiscount += discountValue
              } else if (promotion.discountType === DiscountTypes.FixedPrice) {
                if (_product.price > promotion.discountValue) {
                  _product.discountByPromotion = _product.price - promotion.discountValue
                  _product.manualPrice = promotion.discountValue
                  _product.discount = 0
                  _product.priceAfterDiscount = promotion.discountValue
                  _product.points = calculatePoints(_product)
                  promotionDiscount += _product.discountByPromotion
                }
              }

              this.order.products.splice(index, 1, _product)
            } else {
              console.log(`Promotion:: product lookup failed for ${product.id} to apply promotion`)
            }
          })
        }

        const index = findIndex(this.order.promotion, (i) => i._id === promotion._id)
        if (index !== -1) {
          this.order.promotion.splice(index, 1, {
            ...promotion,
            promotionDiscount,
            manual
          })
        } else {
          this.order.promotion.push({ ...promotion, promotionDiscount, manual })
        }

        // reactivity: can me moved to computed property as it also requires sale promotion to be included
        this.order.promotionDiscount = reduce(
          this.order.promotion,
          (acc, p) => acc + p.promotionDiscount,
          0
        )
      }

      await this.update()
    },

    removeSalePromotion(manual: boolean = true) {
      this.order.salePromotion = {
        type: DiscountTypes.Percentage,
        percentage: 0,
        amount: 0,
        promotion: {},
        manual
      }
    },

    async removePromotion(promotion: Promotion, manual: boolean = false) {
      if (promotion.type === PromotionTypes.Sale) {
        await this.removeSalePromotion(manual)
      } else {
        const index: number = findIndex(this.order.promotion, (p) => p._id === promotion._id)

        if (index === -1) {
          console.log(
            `Promotion:: Trying to revert manual promotion which is not applied on order.`
          )
          return
        }

        const _promotion = this.order.promotion[index]

        if (promotion.discountType !== PromotionTypes.Sale) {
          this.order.products.forEach((product) => {
            if (product.promotionId === _promotion._id) {
              product.discountByPromotion = 0
              product.discount = 0
              product.manualPrice = 0
              product.priceAfterDiscount = 0
              product.promotionId = ''
              product.manualPromotion = manual
              product.points = calculatePoints(product)
            }
          })
        }

        // reactivity: can me moved to computed property as it also requires sale promotion to be included
        this.order.promotionDiscount =
          this.order.promotionDiscount - this.order.promotion[index].promotionDiscount

        this.order.promotion.splice(index, 1)
      }

      await this.update()
    },

    async removePromotionFromProduct(product: SaleProduct) {
      console.log(`Promotion:: Removing promotion from ${product.id}`)

      const productIndex = findIndex(this.order.products, (p) => p.id === product.id)

      if (productIndex === -1) {
        console.log(`Promotion:: Trying to revert promotion on non-existing item ${product.id}`)
        return
      }

      const promotionIndex = findIndex(
        this.order.promotion,
        (p) => p._id === this.order.products[productIndex].promotionId
      )

      if (promotionIndex === -1) {
        console.log(`Promotion:: Trying to revert promotion on ${product.id}, no promotion found`)
        return
      }

      if (this.order.promotion[promotionIndex].type === PromotionTypes.Sale) {
        console.log(`Promotion:: Trying to revert sale promotion on item ${product.id}`)
        return
      }

      const _product = deepCloneObject(this.order.products[productIndex])
      const promotion = { ...this.order.promotion[promotionIndex] }

      // _product.promotionId = false
      _product.manualPromotion = true
      _product.discount = 0
      // _product.priceAfterDiscount = 0
      _product.manualPrice = 0

      // reactivity: can me moved to computed property as it also requires sale promotion to be included
      this.order.promotionDiscount =
        reduce(this.order.promotion, (acc, p) => acc + p.promotionDiscount, 0) -
        _product.discountByPromotion

      promotion.promotionDiscount -= _product.discountByPromotion
      _product.discountByPromotion = 0
      _product.points = calculatePoints(_product)

      this.order.products.splice(productIndex, 1, _product)

      if (!promotion.promotionDiscount) {
        this.order.promotion.splice(promotionIndex, 1)
      }

      const promotions = usePromotion()
      promotions.recomputePromotion()
      await this.update()
    },

    /**
     * @description Agreement can be added or removed, Find out whether the agreement
     * is added or removed. For added case, apply agreement of all applicable items and
     * preserver it's copy in state. If agreement is being removed, restore the order
     * items from previously saved state.
     *
     */
    applyAgreement(agreement: any) {
      const _applied = {
        agreement,
        agreementTotal: 0,
        old: [] as Array<SaleProduct>
      }

      const excludeProducts = reduce(
        this.appliedAgreements,
        (items, applied) => {
          items = [...items, ...map(applied.old, 'id')]
          return items
        },
        [] as Array<string>
      )

      let appliedCounter = 0

      each(this.order.products, (product, index) => {
        if (excludeProducts.includes(product.id)) {
          console.log(`${product.id} has already applied a promotion`)
          return
        }
        if (product.category === ProductTypes.Service) {
          const _product = { ...product }

          switch (agreement.type) {
            case ProductTypes.Service:
              if (map(agreement.services, (s) => s.id).includes(product.id)) {
                // TODO remove this rounding post release v1.0.8 as permanent fix has been
                // applied in the agreement creation action
                _applied.agreementTotal += round(agreement.pricePerService) * product.quantity
                _applied.old.push({ ...product })

                /**
                 * @see https://barbaard.atlassian.net/jira/software/projects/BPS/boards/3?selectedIssue=BPS-467
                 * As pricePerService is including the VAT (8%) & Service Charge 5% we need to remove it from product price and add
                 * pricePerService as paid amount so balance the calculation
                 */
                _product.manualPrice = agreement.pricePerService / 1.05 / 1.08
                _product.discount = 0
                _product.payedByAgreement = true
                _product.payedByAgreementId = agreement._id

                this.order.products.splice(index, 1, _product)
              }
              break
            case ProductTypes.MerchantsAgreement:
            case ProductTypes.GrandMerchantsAgreement:
              if (appliedCounter <= 2) {
                _applied.agreementTotal += agreement.pricePerService * product.quantity
                _applied.old.push({ ...product })

                /**
                 * @see https://barbaard.atlassian.net/jira/software/projects/BPS/boards/3?selectedIssue=BPS-467
                 * As pricePerService is including the VAT (8%) & Service Charge 5% we need to remove it from product price and add
                 * pricePerService as paid amount so balance the calculation
                 */
                _product.manualPrice = agreement.pricePerService / 1.05 / 1.08
                _product.discount = 0
                _product.payedByAgreement = true
                _product.payedByAgreementId = agreement._id

                this.order.products.splice(index, 1, _product)

                appliedCounter++
              }
              break
            case ProductTypes.KingsAgreement:
            case ProductTypes.EmperorsAgreement:
              if (
                agreement.type === ProductTypes.KingsAgreement &&
                !KingAgreementCategories.includes(product.serviceCategory || '')
              ) {
                break
              }
              //_applied.agreementTotal += product.price * product.quantity
              _product.payedByAgreement = true
              _product.payedByAgreementId = agreement._id

              _applied.agreementTotal += getTotalPayableAmount(product)
              _applied.old.push({ ...product })

              // _product.discount = 100
              // _product.priceAfterDiscount = 0
              this.order.products.splice(index, 1, _product)
              break
          }
        }

        if (product.category === ProductTypes.Upgrade) {
          const _product = { ...product }

          switch (agreement.type) {
            case 'upgrades':
              console.log('Upgrade agreement')
              if (map(agreement.upgrades, (s) => s.id).includes(product.id)) {
                _applied.agreementTotal += round(agreement.pricePerService) * product.quantity
                _applied.old.push({ ...product })

                /**
                 * @see https://barbaard.atlassian.net/jira/software/projects/BPS/boards/3?selectedIssue=BPS-467
                 * As pricePerService is including the VAT (8%) we need to remove it from product price and add
                 * pricePerService as paid amount so balance the calculation
                 */
                _product.manualPrice = agreement.pricePerService / 1.05 / 1.08
                _product.discount = 0
                _product.payedByAgreement = true
                _product.payedByAgreementId = agreement._id

                this.order.products.splice(index, 1, _product)
              }
              break
          }
        }
      })

      this.appliedAgreements.push(_applied)
    },

    async revertAgreement(agreement: any, shouldUpdateOrder: boolean = true) {
      const index = findIndex(this.appliedAgreements, (a) => a.agreement._id === agreement._id)

      if (index === -1) {
        console.log(
          `Agreement:: Trying to revert, but ${agreement._id} not found in applied agreements`
        )
      }

      console.log(`Agreement:: ${this.appliedAgreements[index].old.length} items needs reversal`)

      each(this.appliedAgreements[index].old, (old) => {
        const index = findIndex(this.order.products, (p) => p.id === old.id)

        if (index !== -1) {
          this.order.products.splice(index, 1, { ...old })
        } else {
          console.log(`Agreement:: ${old.id} could not be restored`)
        }
      })

      this.appliedAgreements.splice(index, 1)

      if (shouldUpdateOrder) {
        await this.update()
      }
    },

    async revertAllAppliedAgreements() {
      const allAgreements = this.appliedAgreements.map((data) => data.agreement)
      allAgreements.forEach((agreement) => this.revertAgreement(agreement, false))
      await this.update()
    },

    flushAppliedAgreements() {
      this.appliedAgreements = []
    },

    async fromSale(sale: any) {
      this.order = sale
    },

    async fromAppointment(customer: any, event: ExtendedEvent, status = EventStatus.ArrivedOnTime) {
      this.order = { ...generateOrder() }

      const register = useRegister()
      const staff = useStaff()

      const guest = {
        userId: customer._id,
        userName: customer.fullName,
        userTags: customer.tags || [],
        userPhone: customer?.phone,
        userEmail: customer?.email,
        memberGroup: customer?.loyalty?.memberGroup
      }

      const products: Array<any> = []
      let department = 'bar'

      if (event?.type !== 'reservation') {
        department = 'barbershop'
        if (event.services && event.services.length) {
          event.services.forEach((service: any) => {
            const _service = new Product(service, ProductTypes.Service)

            const item: any = {
              id: service.id,
              name: _service.title,
              type: ProductTypes.Service,
              category: ProductTypes.Service,
              price: _service.price,
              itemNote: '',
              originalPrice: _service.price,
              manualPrice: 0,
              quantity: 1,
              discount: 0,
              VAT: _service.VAT,
              serviceCharge: _service.serviceCharge,
              salesPerson: {
                staffName: service?.staff ? service.staff : staff.active.fullName,
                staffId: service?.staffId ? service.staffId : staff.active._id
              },
              complimentaries: {
                drink: 'drink-complimentary',
                food: 'snack-complimentary'
              }
            }

            products.push(item)
          })
        }

        if (event.upgrades && event.upgrades.length) {
          event.upgrades.forEach((upgrade) => {
            const _upgrade = new Product(
              {
                _id: upgrade.id,
                name: upgrade.name,
                price: upgrade.price
              },
              ProductTypes.Upgrade
            )

            const item = {
              id: upgrade.id,
              name: _upgrade.title,
              price: _upgrade.price,
              itemNote: '',
              type: ProductTypes.Upgrade,
              category: ProductTypes.Upgrade,
              originalPrice: upgrade.price,
              manualPrice: 0,
              promotionId: false,
              manualPromotion: false,
              discountByPromotion: 0,
              quantity: 1,
              salesPerson: {
                // @ts-ignore
                staffName: upgrade?.staff ? upgrade.staff : staff.active.fullName,
                // @ts-ignore
                staffId: upgrade?.staffId ? upgrade.staffId : staff.active._id
              },
              VAT: _upgrade.VAT,
              serviceCharge: _upgrade.serviceCharge
            }

            // @ts-ignore
            if (upgrade?.linkedDrink) {
              // @ts-ignore
              item.complimentaries = {
                drink: 'drink-gentlemanup'
              }
            }

            products.push(item)
          })
        }
      }

      const data = {
        ...guest,
        products,
        customBill: event.staffName,
        amountOfGuest: 1,
        department: department,
        salesCategory: department,
        eventItem: event
      }

      const _order = await this.open(data)

      const _event = useEvents()
      _event.setEventStatus({
        _id: event._id,
        location: register.location,
        userId: event.userId as string,
        status
      })
      return { orderId: _order.orderId }
    },

    voidQuantityFromSale(products: Array<SaleProduct>) {
      this.$patch((state) => {
        forEach(products, (product) => {
          const index = findIndex(state.order.products, (p) => p.id === product.id)
          if (index !== -1) {
            const _product = { ...state.order.products[index] }
            if (_product.quantity === product.quantity) {
              // remove the product completely
              state.order.products.splice(index, 1)
            } else {
              _product.quantity = _product.quantity - product.quantity
              // deduct the quantity moved to new sale
              state.order.products.splice(index, 1, _product)
            }
          } else {
            console.log(`Order:: could not find ${product.id} in existing sale for split`)
          }
        })
      })
    },

    async splitSale(data: any) {
      const register = useRegister()
      const staff = useStaff()

      const createdAtTimestamp = serverTimestamp()

      const { products, ...orderData } = data

      const payload = {
        ...generateOrder(),
        registerId: register.registerId,
        createdAt: createdAtTimestamp,
        updatedAt: createdAtTimestamp,
        orderId: moment().unix(),
        staffId: staff.active._id,
        staffName: staff.active.fullName,
        active: true,
        status: SaleStatus.OPEN,
        promotionDiscount: 0,
        promotion: [],

        discount: {
          type: 'percentage',
          percentage: 0,
          amount: 0
        },

        paid: false,
        products,
        ...orderData
      }

      if (data?.customBill) {
        payload.isCustomBill = true
      } else {
        payload.tableId = ''
        payload.tableName = ''
      }

      await set(ref(database, `${register.location}/${payload.orderId}`), transform(payload))

      this.voidQuantityFromSale(products)

      await this.update()

      return payload
    }
  }
})
