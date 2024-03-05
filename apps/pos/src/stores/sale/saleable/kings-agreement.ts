import { reactive } from 'vue'
import { Product, type P } from './product'

export type KA = P & {
  months: number
}

export class KingsAgreement extends Product {
  months: number

  constructor({ months, ...base }: KA) {
    super(base)
    this.months = months

    return reactive(this)
  }

  override get price() {
    return this._price / 1.05 / 1.08
  }

  get pricePerMonth() {
    return this._price / this.months
  }

  get netPricePerMonth() {
    return this.price / this.months
  }

  override toJson() {
    return {
      ...super.toJson(),
      price: this._price,
      originalPrice: this.price,
      pricePerMonth: this.pricePerMonth,
      netPricePerMonth: this.netPricePerMonth
    }
  }

  static override fromJson(product: any) {
    const { id, name, price, discount, type, category, serviceCharge, VAT, months } = product
    return new KingsAgreement({
      id,
      name,
      price,
      months,
      discount,
      type,
      category,
      serviceCharge,
      VAT
    })
  }
}
