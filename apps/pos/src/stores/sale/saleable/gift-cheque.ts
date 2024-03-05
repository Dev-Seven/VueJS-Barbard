import { reactive } from 'vue'
import { Product, type P } from './product'

export type G = P & {
  code: string
}

export class GiftCheque extends Product {
  code: string

  constructor({ code, ...base }: G) {
    super(base)
    this.code = code

    return reactive(this)
  }

  override toJson(): any {
    return {
      ...super.toJson(),
      code: this.code
    }
  }

  static override fromJson(product: any) {
    const { id, name, price, discount, type, category, serviceCharge, VAT, code } = product
    return new GiftCheque({
      id,
      name,
      price,
      discount,
      type,
      category,
      serviceCharge,
      VAT,
      code
    })
  }
}
