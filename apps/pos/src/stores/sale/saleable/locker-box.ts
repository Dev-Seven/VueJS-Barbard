import { reactive } from 'vue'
import { Product, type P } from './product'

export type L = P & {
  months: number
  lockerNumber: number
  freeGuests: number
}

export class LockerBox extends Product {
  months: number
  lockerNumber: number
  freeGuests: number

  constructor({ months, lockerNumber, freeGuests, ...base }: L) {
    super(base)
    this.months = months
    this.lockerNumber = lockerNumber
    this.freeGuests = freeGuests

    return reactive(this)
  }

  override get price() {
    /**
     * @description LockerBox comes with VAT included
     * price. To avoid collision in sale taxes, ditch
     * the applied VAT(8%) first
     *
     */
    return this._price / 1.08
  }

  get pricePerMonth() {
    return this.price / 12
  }

  get netPricePerMonth() {
    return this.price / 12
  }

  override toJson(): any {
    return {
      ...super.toJson(),
      originalPrice: this.price,
      pricePerMonth: this.pricePerMonth,
      netPricePerMonth: this.netPricePerMonth,
      months: this.months,
      lockerNumber: this.lockerNumber,
      freeGuests: this.freeGuests
    }
  }

  static override fromJson(product: any) {
    const {
      id,
      name,
      price,
      discount,
      type,
      category,
      serviceCharge,
      VAT,
      months,
      lockerNumber,
      freeGuests
    } = product
    return new LockerBox({
      id,
      name,
      price,
      discount,
      type,
      category,
      serviceCharge,
      VAT,
      months,
      lockerNumber,
      freeGuests
    })
  }
}
