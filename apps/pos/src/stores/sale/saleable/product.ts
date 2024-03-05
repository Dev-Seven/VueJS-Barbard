import { usePromotion } from '@/stores/promotion/promotion'
import { uuid as generateUUID } from '@/utilities/utility'
import { find, round, trim } from 'lodash'
import { reactive } from 'vue'

type C = {
  label: string
  amount: number
}

export type SalesPerson = {
  staffId: string
  staffName: string
  image?: string
}

export type P = {
  id: string
  uuid?: string
  name: string
  price: number
  discount: number
  type: string
  category: string
  itemNote?: string
  serviceCharge: C
  VAT: C
  salesPerson?: SalesPerson
}

export const ProductTypes = {
  Product: 'product',
  ProductVariant: 'productVariant',
  GentlemanAgreement: 'services',
  MerchantsAgreement: 'merchant',
  GrandMerchantsAgreement: 'grand-merchant',
  KingsAgreement: 'king',
  EmperorsAgreement: 'emperor',
  Service: 'service',
  Upgrade: 'upgrade',
  GiftCheque: 'giftcheque',
  LockerBox: 'lockerbox',
  FnB: 'fnb',
  FnBVariant: 'fnbVariant',
  Complimentary: 'complimentary'
}

export const ComplimentaryTypes = {
  Food: 'food',
  Drink: 'drink'
}

export class Product {
  id: string
  uuid: string
  name: string
  discount: number
  type: string
  category: string
  serviceCharge: C
  VAT: C
  itemNote: string
  manualPrice: number
  promotionId: string
  manualPromotion: boolean
  salesPerson?: SalesPerson

  _price: number
  _quantity: number
  _discountByPromotion: number
  _agreement: string

  constructor({
    id,
    name,
    price,
    discount,
    type,
    category,
    serviceCharge,
    VAT,
    itemNote,
    uuid
  }: P) {
    this.id = id
    this.uuid = uuid ? uuid : generateUUID()
    this.name = name
    this._price = price
    this.discount = discount
    this.type = type
    this.category = category
    this.itemNote = itemNote
    this.serviceCharge = serviceCharge
    this.VAT = VAT
    this._quantity = 1
    this.manualPrice = 0
    this._discountByPromotion = 0
    this.manualPromotion = false
    this.promotionId = ''
    this._agreement = ''

    return reactive(this)
  }

  get price() {
    return this._price
  }

  set price(price: number) {
    this._price = price
  }

  get priceAfterDiscount() {
    return this.discount ? this.price - (this.price / 100) * this.discount : this.price
  }

  get considerable() {
    if (this.manualPrice) {
      return this.manualPrice
    }

    if (this.discount) {
      return this.priceAfterDiscount
    }
    return this.price
  }

  get originalServiceCharge() {
    return this.calculateServiceCharge(this.price)
  }

  get originalVAT() {
    return this.calculateVAT(this.price)
  }

  get originalSubTotal() {
    return this.price + this.originalServiceCharge + this.originalVAT
  }

  get originalTotal() {
    return round(this.originalSubTotal * this.quantity)
  }

  get appliedServiceCharge() {
    return this.calculateServiceCharge(this.considerable)
  }

  get appliedVAT() {
    return this.calculateVAT(this.considerable)
  }

  get subTotal() {
    return this.considerable + this.appliedServiceCharge + this.appliedVAT
  }

  get total() {
    return round(this.subTotal * this.quantity)
  }

  get totalExcludingVAT() {
    return round((this.considerable + this.appliedServiceCharge) * this.quantity)
  }

  get quantity() {
    return this._quantity
  }

  set quantity(quantity: number) {
    this._quantity = quantity
  }

  get discountByPromotion() {
    return this._discountByPromotion
  }

  set discountByPromotion(amount: number) {
    this._discountByPromotion = amount
  }

  get tax() {
    let info = this.VAT.amount ? `VAT ${this.VAT.label}` : ''

    if (info && this.serviceCharge.amount) {
      info = `${info} & Service Charge ${this.serviceCharge.label}`
    }

    info = `${info} applied`

    return trim(info)
  }

  get promotion() {
    const promotions = usePromotion()
    return find(promotions.promotions, (p) => p._id === this.promotionId)
  }

  calculateServiceCharge(amount: number) {
    if (this.serviceCharge?.amount) {
      return (amount / 100) * this.serviceCharge.amount
    }
    return 0
  }

  calculateVAT(amount: number) {
    if (this.VAT?.amount) {
      return ((amount + this.calculateServiceCharge(amount)) / 100) * this.VAT.amount
    }
    return 0
  }

  totalPayableAmount = (voidChargesByPercentage: number | undefined) => {
    if (voidChargesByPercentage) {
      const _serviceCharge =
        this.appliedServiceCharge - (this.appliedServiceCharge / 100) * voidChargesByPercentage
      const _VAT = this.appliedVAT - (this.appliedVAT / 100) * voidChargesByPercentage
      return (this.considerable + _serviceCharge + _VAT) * this.quantity
    }
    return round(this.considerable + this.appliedServiceCharge + this.appliedVAT)
  }

  toJson() {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      discount: this.discount,
      type: this.type,
      category: this.category,
      serviceCharge: this.serviceCharge,
      VAT: this.VAT,
      quantity: this.quantity,
      itemNote: this.itemNote,
      manualPrice: this.manualPrice,
      originalVAT: this.originalVAT,
      originalServiceCharge: this.originalServiceCharge,
      originalTotal: this.originalTotal,
      appliedVAT: this.appliedVAT,
      appliedServiceCharge: this.appliedServiceCharge,
      total: this.total
    }
  }

  static fromJson(product: any) {
    const { id, name, price, discount, type, category, serviceCharge, VAT, uuid, itemNote } =
      product
    return new Product({
      id,
      name,
      price,
      discount,
      type,
      category,
      serviceCharge,
      VAT,
      itemNote,
      uuid
    })
  }
}
