import { has, isEmpty, round } from 'lodash'
import { ProductTypes } from '@/stores/sale/saleable/product'
import type { SaleProduct } from '@/stores/sale/types'
import { determinePoints, uuid } from './utility'

export const getOriginalTotal = (product) => {
  if (product.type === ProductTypes.GentlemanAgreement) {
    if (!product.service) {
      return 0
    }

    const _vat = calculateVAT(product.service, true)
    const _serviceCharge = calculateServiceCharge(product.service, true)
    return round((product.service.price + _vat + _serviceCharge) * product.agreementCount)
  }
  const total =
    (product.price + calculateVAT(product, true) + calculateServiceCharge(product, true)) *
    product.quantity
  return round(total)
}

export const priceToConsider = (product: SaleProduct): number => {
  if (product.discount) {
    return product.priceAfterDiscount
  } else if (product.manualPrice) {
    return product.manualPrice
  } else {
    return product.price
  }
}

export const calculateVAT = (product: SaleProduct, original = false) => {
  const serviceCharge = calculateServiceCharge(product, original)
  const _price = original ? product.price : priceToConsider(product)
  return product?.VAT?.amount ? ((_price + serviceCharge) / 100) * product.VAT.amount : 0
}

export const calculateServiceCharge = (product, original = false) => {
  return product?.serviceCharge?.amount
    ? ((original ? product.price : priceToConsider(product)) / 100) * product.serviceCharge.amount
    : 0
}

export const calculatePoints = (product: SaleProduct) => {
  if ([ProductTypes.Product, ProductTypes.ProductVariant].includes(product.type) && product.cost) {
    return determinePoints(priceToConsider(product) - product.cost)
  }
  return product?.points || 0
}

export const getTotalPayableAmount = (product: any, voidChargesByPercentage?: number) => {
  let amount,
    _vat,
    _serviceCharge = 0
  switch (product.category) {
    case ProductTypes.GentlemanAgreement:
      if (product.service?.id) {
        _vat = calculateVAT(product.service)
        _serviceCharge = calculateServiceCharge(product.service)

        if (voidChargesByPercentage) {
          _vat = _vat - (_vat / 100) * voidChargesByPercentage
          _serviceCharge = _serviceCharge - (_serviceCharge / 100) * voidChargesByPercentage
        }
        amount = (product.service.price + _vat + _serviceCharge) * product.agreementCount
      }

      if (product.discount) {
        amount = amount - (amount / 100) * product.discount
      }

      break
    case ProductTypes.KingsAgreement:
      _vat = calculateVAT(product)
      _serviceCharge = calculateServiceCharge(product)
      amount = product.price + _vat + _serviceCharge - (product.discount || 0)
      break
    case ProductTypes.GiftCheque:
      amount = product.price
      break
    case ProductTypes.LockerBox:
      _vat = calculateVAT(product)
      amount = product.price + _vat - (product.discount || 0)
      break
    default:
      _vat = calculateVAT(product)
      _serviceCharge = calculateServiceCharge(product)

      if (voidChargesByPercentage) {
        _vat = _vat - (_vat / 100) * voidChargesByPercentage
        _serviceCharge = _serviceCharge - (_serviceCharge / 100) * voidChargesByPercentage
      }
      amount = (priceToConsider(product) + _vat + _serviceCharge) * product.quantity
      break
  }
  return round(amount)
}

export const getSubTotalAmount = (product: SaleProduct) => {
  let amount = 0
  switch (product.category) {
    case ProductTypes.GentlemanAgreement:
      if (product.service?.id) {
        amount = product.service.price * product.agreementCount
      }

      if (product.discount) {
        amount = amount - (amount / 100) * product.discount
      }

      break
    case ProductTypes.KingsAgreement:
      amount = product.price - (product.discount || 0)
      break
    case ProductTypes.GiftCheque:
      amount = product.price
      break
    case ProductTypes.LockerBox:
      amount = product.price - (product.discount || 0)
      break
    default:
      amount = priceToConsider(product) * product.quantity
      break
  }
  return round(amount)
}

/**
 * @description Pre-processing function for product item in sale
 * before copying it to Firestore for consistency for document
 */
export const sanitizeProduct: any = (product: SaleProduct, additionalProperties = {}) => {
  const associatedProducts = []
  if (product.type === ProductTypes.Service) {
    // @ts-ignore
    if (product.complimentaryFood && product.complimentaryFood.id !== 1) {
      // @ts-ignore
      product.complimentaryFood.salesPerson = product.salesPerson
      associatedProducts.push(
        sanitizeProduct(product.complimentaryFood as SaleProduct, additionalProperties)
      )
      // @ts-ignore
      product.complimentaryFood = product.complimentaryFood.id
    }
  }

  if ([ProductTypes.Upgrade, ProductTypes.Service].includes(product.type)) {
    // @ts-ignore
    if (product.complimentaryDrink && product.complimentaryDrink.id !== 1) {
      // @ts-ignore
      product.complimentaryDrink.salesPerson = product.salesPerson
      associatedProducts.push(
        sanitizeProduct(product.complimentaryDrink as SaleProduct, additionalProperties)
      )
      // @ts-ignore
      product.complimentaryDrink = product.complimentaryDrink.id
    }
  }

  if ([ProductTypes.Product, ProductTypes.ProductVariant].includes(product.type)) {
    product.brand = product.brandName
    product.category = ProductTypes.Product

    delete product.brandName
  }

  if ([ProductTypes.FnB, ProductTypes.FnBVariant].includes(product.type)) {
    product.category = ProductTypes.FnB
    delete product.brand
  }

  if (product.type === ProductTypes.Complimentary) {
    delete product.brand
  }

  if (
    [
      ProductTypes.FnB,
      ProductTypes.FnBVariant,
      ProductTypes.Complimentary,
      ProductTypes.ProductVariant,
      ProductTypes.Product
    ].includes(product.category)
  ) {
    delete product.storeBrand
    delete product.storeCategory
  }

  if (product.type === ProductTypes.ProductVariant) {
    product.category = ProductTypes.Product
  }

  product.staffId = product?.salesPerson?.staffId || ''
  product.staffName = product?.salesPerson?.staffName || ''
  delete product.salesPerson

  if (has(product, 'VAT')) {
    product.vat = product.VAT
    delete product.VAT
  }

  delete product.complimentaries
  delete product.component
  delete product.uuid

  if (isEmpty(associatedProducts)) {
    return { ...product, ...additionalProperties }
  } else {
    return [...associatedProducts, { ...product, ...additionalProperties }]
  }
}

export const generateSaleItem = (product: Partial<SaleProduct>): SaleProduct => {
  return {
    uuid: uuid(),
    quantity: 1,
    itemNote: '',
    originalPrice: product.price,
    manualPrice: 0,
    discount: 0,
    priceAfterDiscount: 0,
    discountByPromotion: 0,
    VAT: product.VAT || false,
    serviceCharge: product.serviceCharge || false,
    promotionId: false,
    manualPromotion: false,
    ...product
  } as SaleProduct
}
