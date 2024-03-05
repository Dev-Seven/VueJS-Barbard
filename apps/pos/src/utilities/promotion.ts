import { DiscountTypes, Promotions } from './constants'
import { filter, findIndex, has, isEmpty, keys } from 'lodash'
import { ProductTypes } from '@/stores/sale/saleable'
import { priceToConsider } from './sale'
import type { SaleProduct } from '@/stores/sale/types'

export const getPriceToConsider = priceToConsider

/**
 * @description lookup the items given and retrieve promotion
 * applicable items
 *
 * @param {Promotion} promotion - Promotion Document
 * @param {Products} products - Products added in sales
 * @returns object[] - List of promotion applicable items
 */
export const filterPromotionApplicableProducts = (promotion, products) => {
  const obtain = () => {
    switch (promotion.type) {
      case Promotions.Product:
        // Avoid products which has been manually promoted
        return filter(products, (product) => {
          // empty product empty array will apply promotion to all products
          return has(promotion, 'product')
            ? promotion.product.length
              ? promotion.product.includes(product.id)
              : product.type === ProductTypes.Product ||
                product.type === ProductTypes.ProductVariant
            : product.type === ProductTypes.Product || product.type === ProductTypes.ProductVariant
        })
      case Promotions.ProductCategory:
        return filter(products, (product) => {
          // empty productCategory array in promotion will apply promotion to all product categories
          if (!has(promotion, 'productCategory') || !promotion.productCategory.length) {
            return true
          }

          if (!has(product, 'storeCategory')) {
            return false
          }

          return (
            findIndex(
              promotion.productCategory,
              (i) => i.toString() === product.storeCategory.toString()
            ) !== -1
          )
        })
      case Promotions.ProductBrand:
        return filter(products, (product) => {
          // empty productBrand array in promotion will apply promotion to all product brand
          if (!has(promotion, 'productBrand') || !promotion.productBrand.length) {
            return true
          }

          if (!has(product, 'storeBrand')) {
            return false
          }

          return (
            findIndex(
              promotion.productBrand,
              (i) => i.toString() === product.storeBrand.toString()
            ) !== -1
          )
        })
      case Promotions.FnB:
        return filter(products, (product) => {
          // empty fnb array in promotion will apply promotion to all f&b items
          return has(promotion, 'fnb')
            ? promotion.fnb.length
              ? promotion.fnb.includes(product.id)
              : product.type === ProductTypes.FnB || ProductTypes.FnBVariant
            : product.type === ProductTypes.FnB || ProductTypes.FnBVariant
        })
      case Promotions.FnBCategory:
        return filter(products, (product) => {
          // empty fnbCategory array in promotion will apply promotion to all f&b categories
          if (!has(promotion, 'fnbCategory') || !promotion.fnbCategory.length) {
            return product.type === ProductTypes.FnB
          }

          if (!has(product, 'storeCategory')) {
            return false
          }
          return promotion.fnbCategory.includes(product.storeCategory)
        })
      case Promotions.Service:
        return filter(products, (product) => {
          if (product.type !== ProductTypes.Service) {
            return false
          }

          if (!has(promotion, 'services') || !promotion.services.length) {
            return true
          }
          return promotion.services.includes(product.id)
        })
      case Promotions.Agreement:
        return filter(products, (product) => {
          return [
            ProductTypes.GentlemanAgreement,
            ProductTypes.MerchantsAgreement,
            ProductTypes.GrandMerchantsAgreement,
            ProductTypes.KingsAgreement,
            ProductTypes.EmperorsAgreement
          ].includes(product.type)
        })
      case Promotions.Upgrade:
        // Avoid products which has been manually promoted
        return filter(products, (product) => {
          // empty product empty array will apply promotion to all products
          return has(promotion, 'upgrades')
            ? promotion.upgrades.length
              ? promotion.upgrades.includes(product.id)
              : product.type === ProductTypes.Upgrade
            : product.type === ProductTypes.Upgrade
        })
      default:
        return []
    }
  }

  /**
   * All products that are being controlled from POS user should be ignored
   * considering that product as manualPromotion product
   *
   */
  return filter(obtain(), (product) => !product.manualPromotion)
}

/**
 * @description calculate the discount amount applicable on product item
 * added in sale by promotion type discount or money
 *
 * @param {Number} amount
 * @param {String} type - Promotion discount type
 * @param {Number} value - Discountable value
 * @returns Number
 */

export const feeder = (amount: number, type: string, value: any) => {
  switch (type) {
    case DiscountTypes.Percentage:
      return (amount / 100) * parseFloat(value)
    case DiscountTypes.Money:
      return parseFloat(value)
    case DiscountTypes.FixedPrice:
      return value
    default:
      return 0
  }
}

/**
 * @description Obtain best possible estimate from the given
 * estimates based on discount applied value
 *
 * @param {Array} promotions
 * @returns Object
 */
export const reducer = (promotions) => {
  const bestMatch = keys(promotions).reduce(
    (acc, current) => {
      return promotions[current].discount > acc.discount ? promotions[current] : acc
    },
    { promotion: {}, discount: 0 }
  )

  if (isEmpty(bestMatch.promotion) || bestMatch.discount === 0) {
    return false
  }

  return bestMatch
}

/**
 * @description Obtain best possible estimate from the given
 * estimates based on discount applied value
 *
 * @param {Array} promotions
 * @returns Object
 */
export const productTotal = (product: SaleProduct) => {
  if (product.type === ProductTypes.GentlemanAgreement) {
    return product.service ? product.service.price * product.agreementCount : 0
  }
  return priceToConsider(product) * product.quantity
}
