export type TraitType = {
  key: string
  name: string
  highlight?: boolean
}
export const PersonaTraits: Array<TraitType> = [
  {
    key: 'tourist',
    name: 'Tourist'
  },
  {
    key: 'businessman',
    name: 'Businessman'
  },
  {
    key: 'rich_kid',
    name: 'Rich Kid'
  },
  {
    key: 'metrosexual_man',
    name: 'Metrosexual man'
  },
  {
    key: 'westernised_vietnamese',
    name: 'Westernised Vietnamese'
  },
  {
    key: 'expat',
    name: 'Expat'
  },
  {
    key: 'ultra_rich',
    name: 'Ulta rich'
  },
  {
    key: 'student',
    name: 'Student'
  },
  {
    key: 'vip',
    name: 'VIP',
    highlight: true
  },
  {
    key: 'svip',
    name: 'SVIP',
    highlight: true
  }
]

export const Promotions = {
  Sale: 'sale',
  ProductCategory: 'productCategory',
  ProductBrand: 'productBrand',
  Product: 'product',
  Service: 'service',
  FnB: 'fnb',
  FnBCategory: 'fnbCategory',
  Agreement: 'agreement',
  Upgrade: 'upgrade'
}

export const { Sale, ...EntityPromotions } = Promotions

export const DiscountTypes = {
  Money: 'money',
  Percentage: 'percentage',
  FixedPrice: 'fixed-price'
}

export const INTERNAL_CASH_MANAGEMENT_METHOD: string = 'Internal Cash Management'

export const STORE_CREDIT_AGREEMENT: string = 'Store Credit - Agreement'
export const STORE_CREDIT_GIFTCHEQUE: string = 'Store Credit - Gift Cheque'
export const STORE_CREDIT_LOCKERBOX: string = 'Store Credit - Lockerbox'

export const FixedPoints = {
  Gentleman: 40,
  Merchant: 100,
  GrandMerchant: 200,
  King: 300,
  Emperor: 500,
  LockerBox: 500
}
