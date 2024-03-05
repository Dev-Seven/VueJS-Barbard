import { toNumber, isEmpty } from 'lodash'
import { ProductTypes } from '@/stores/sale/saleable/product'

type FirebaseProductType = {
  [key: string]: any
}

type ProductMetadataType = {
  [key: string]: any
}

export type Product = Product

export default class Product {
  data: FirebaseProductType
  type: string
  meta: ProductMetadataType
  location: string
  _variants: Array<Product>

  constructor(
    data: FirebaseProductType,
    type: string,
    meta: ProductMetadataType = {},
    location: string = ''
  ) {
    this.data = data
    this.type = type
    this.meta = meta
    this.location = location
    this._variants = []
  }

  get variants() {
    return this._variants
  }

  set variants(variants) {
    this._variants = variants
  }

  get id() {
    switch (this.type) {
      case ProductTypes.Product:
      case ProductTypes.ProductVariant:
        return this.data.idNhanh
      case ProductTypes.FnB:
      case ProductTypes.FnBVariant:
        return this.data._id || this.data.id
      case ProductTypes.Service:
      case ProductTypes.Upgrade:
        return this.data._id
      default:
        return ''
    }
  }

  get price(): number {
    switch (this.type) {
      case ProductTypes.Product:
        return isEmpty(this.variants) ? toNumber(this.data.price) : 0
      case ProductTypes.ProductVariant:
        return toNumber(this.data.price) || toNumber(this.data.price[this.location]) || 0
      case ProductTypes.Service:
      case ProductTypes.Upgrade:
        return toNumber(this.data.price)
      case ProductTypes.FnB:
        return isEmpty(this.variants) ? toNumber(this.data?.price?.[this.location] || 0) || 0 : 0
      case ProductTypes.FnBVariant:
        return toNumber(this.data?.price?.[this.location] || 0) || 0
      default:
        return 0
    }
  }

  get title() {
    switch (this.type) {
      case ProductTypes.Product:
      case ProductTypes.ProductVariant:
      case ProductTypes.Service:
      case ProductTypes.Upgrade:
        return this.data.name
      case ProductTypes.FnB:
      case ProductTypes.FnBVariant:
        return this.data.name || this.data.Name
      default:
        return ''
    }
  }

  get category(): any {
    switch (this.type) {
      case ProductTypes.Product:
      case ProductTypes.ProductVariant:
        if (this.data.brandId && this.data.brandName)
          return { id: this.data.brandId, title: this.data.brandName }
        else if (this.data.CategoryID && this.data.CategoryName)
          return { id: this.data.CategoryID, title: this.data.CategoryName }
        else return { id: 1, title: 'All Products' }
      case ProductTypes.FnB:
      case ProductTypes.FnBVariant:
        if (this.data.CategoryID && this.data.CategoryName)
          return { id: this.data.CategoryID, title: this.data.CategoryName }
        else if (this.variants[0]) return this.variants[0].category
        else return { id: 2, title: 'All F&B Products' }
      case ProductTypes.Service:
      case ProductTypes.Upgrade:
        console.log('Service and Upgrades are independent categories')
        return {}
      default:
        return {}
    }
  }

  get storeCategory() {
    switch (this.type) {
      case ProductTypes.Product:
      case ProductTypes.ProductVariant:
        return this.data.categoryId ? parseInt(this.data.categoryId) : false
      case ProductTypes.FnB:
      case ProductTypes.FnBVariant:
        return this.data.CategoryID ? this.data.CategoryID : false
      default:
        return false
    }
  }

  get storeBrand() {
    switch (this.type) {
      case ProductTypes.Product:
      case ProductTypes.ProductVariant:
        return this.data.brandId ? parseInt(this.data.brandId) : undefined
      default:
        return undefined
    }
  }

  get image() {
    switch (this.type) {
      case ProductTypes.Product:
      case ProductTypes.ProductVariant:
      case ProductTypes.FnB:
      case ProductTypes.FnBVariant:
      case ProductTypes.Service:
      case ProductTypes.Upgrade:
        return this.data.image ?? ''
      default:
        return ''
    }
  }

  get serviceCharge() {
    switch (this.type) {
      case ProductTypes.FnB:
      case ProductTypes.FnBVariant:
      case ProductTypes.Service:
      case ProductTypes.GentlemanAgreement:
      case ProductTypes.KingsAgreement:
      case ProductTypes.Upgrade:
        return { amount: 5, label: '5%' }
      default:
        return undefined
    }
  }

  get VAT() {
    switch (this.type) {
      case ProductTypes.FnB:
      case ProductTypes.FnBVariant:
        return this.meta.tax
      case ProductTypes.Product:
      case ProductTypes.ProductVariant:
      case ProductTypes.Service:
      case ProductTypes.Upgrade:
        return { amount: 8, label: '8%' }
      default:
        return undefined
    }
  }
}
