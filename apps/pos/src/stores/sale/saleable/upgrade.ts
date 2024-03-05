import { reactive } from 'vue'
import { Product, type P } from './product'

export type ComplimentaryType = {
  drink: string
}

export type U = P & {
  complimentaries: ComplimentaryType
  complimentaryDrink?: string
}

export class Upgrade extends Product {
  complimentaries: ComplimentaryType
  complimentaryDrink: string

  constructor({ complimentaries, complimentaryDrink, ...base }: U) {
    super(base)
    this.complimentaries = complimentaries
    this.complimentaryDrink = complimentaryDrink ?? ''

    return reactive(this)
  }

  override toJson(): any {
    return {
      ...super.toJson(),
      complimentaries: this.complimentaries,
      complimentaryDrink: this.complimentaryDrink
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
      complimentaries,
      complimentaryDrink
    } = product
    return new Upgrade({
      id,
      name,
      price,
      discount,
      type,
      category,
      serviceCharge,
      VAT,
      complimentaries,
      complimentaryDrink
    })
  }
}
