import { reactive } from 'vue'
import { Product, type P } from './product'

export type F = P & {
  brand: B
  storeCategory: B
  storeBrand: B
  categoryName: string
  cost: number
}

export type B = { id: string; name: string }

export class FnBProduct extends Product {
  brand: B
  storeCategory: B
  storeBrand: B
  categoryName: string
  cost: number

  constructor({ brand, storeCategory, storeBrand, categoryName, cost, ...base }: F) {
    super(base)
    this.brand = brand
    this.storeCategory = storeCategory
    this.storeBrand = storeBrand
    this.categoryName = categoryName
    this.cost = cost

    return reactive(this)
  }

  override toJson(): any {
    return {
      ...super.toJson(),
      brand: this.brand,
      storeCategory: this.storeCategory,
      storeBrand: this.storeBrand,
      categoryName: this.categoryName,
      cost: this.cost
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
      categoryName,
      serviceCharge,
      VAT,
      brand,
      storeCategory,
      storeBrand,
      cost
    } = product

    return new FnBProduct({
      id,
      name,
      price,
      discount,
      type,
      category,
      categoryName,
      serviceCharge,
      VAT,
      brand,
      storeCategory,
      storeBrand,
      cost
    })
  }
}
