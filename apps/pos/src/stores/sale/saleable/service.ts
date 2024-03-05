import { reactive } from 'vue'
import { Product, type P } from './product'

export type ComplimentaryType = {
  drink: string
  food: string
}

export type NoComplimentaryType = {
  text: string
  value: number
}

type CT = Product | NoComplimentaryType | boolean

export type S = P & {
  complimentaries: ComplimentaryType
  complimentaryDrink?: CT
  complimentaryFood?: CT
}

export class Service extends Product {
  complimentaries: ComplimentaryType
  complimentaryDrink: CT
  complimentaryFood: CT

  constructor({ complimentaries, complimentaryDrink, complimentaryFood, ...base }: S) {
    super(base)
    this.complimentaries = complimentaries
    this.complimentaryDrink = complimentaryDrink ?? false
    this.complimentaryFood = complimentaryFood ?? false

    return reactive(this)
  }

  override toJson(): any {
    return {
      ...super.toJson(),
      complimentaries: this.complimentaries,
      complimentaryDrink:
        this.complimentaryDrink instanceof Product
          ? this.complimentaryDrink.toJson()
          : this.complimentaryDrink,
      complimentaryFood:
        this.complimentaryFood instanceof Product
          ? this.complimentaryFood.toJson()
          : this.complimentaryDrink
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
      complimentaryDrink = false,
      complimentaryFood = false
    } = product
    let _complimentaryDrink = false
    if (typeof complimentaryDrink !== 'boolean' && complimentaryDrink.value !== 1) {
      _complimentaryDrink = Product.fromJson(complimentaryDrink)
    }

    let _complimentaryFood = false
    if (typeof complimentaryFood !== 'boolean' && complimentaryFood.value !== 1) {
      _complimentaryFood = Product.fromJson(complimentaryFood)
    }
    return new Service({
      id,
      name,
      price,
      discount,
      type,
      category,
      serviceCharge,
      VAT,
      complimentaries,
      complimentaryDrink: _complimentaryDrink,
      complimentaryFood: _complimentaryFood
    })
  }
}
