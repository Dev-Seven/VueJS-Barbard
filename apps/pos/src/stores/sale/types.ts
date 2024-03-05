export type Customer = {
  userTags: Array<string>
  userName: string
  userId: string
  userPhone?: string
  userEmail?: string
  userPersona?: Array<string>
  memberGroup?: string
  onAccount?: boolean
  customerAlert?: string
  affiliateCodes: Array<string>
}

export type SaleTax = {
  label: string
  amount: number
}

export type SalesPerson = {
  staffId: string
  staffName: string
  image?: string
}

export type BrandType = {
  id: string
  name: string
}

export type ComplimentaryType = {
  drink: string
  food?: string
}

export type NoComplimentaryType = {
  text: string
  value: number
}

export type SaleProduct = {
  id: string
  uuid: string
  name: string
  discount: number
  type: string

  category: string
  // Service Specific property
  serviceCategory?: string

  price: number
  priceAfterDiscount: number
  quantity: number
  discountByPromotion: number
  agreement: string
  serviceCharge: SaleTax | undefined
  VAT: SaleTax | undefined
  itemNote: string
  manualPrice: number
  promotionId: string | boolean
  manualPromotion: boolean
  salesPerson?: SalesPerson

  // Gentleman's agreement specific properties
  agreementCount?: number
  agreementComp?: number

  service?: SaleProduct
  // Merchant's Agreement specific properties
  services?: Array<SaleProduct>

  // F&B Specific properties
  brand?: BrandType
  storeCategory?: BrandType
  storeBrand?: BrandType
  categoryName?: string
  cost?: number

  // GiftCheque Specific properties
  code?: string

  // KingsAgreement & Lockerbox Specific properties
  months?: number
  pricePerMonth?: number
  netPricePerMonth?: number

  // Lockerbox Specific properties
  lockerNumber?: number
  freeGuests?: number

  // Service and Upgarade Specific properties
  complimentaries?: ComplimentaryType
  complimentaryDrink?: SaleProduct | NoComplimentaryType | boolean

  // Service Specific properties
  complimentaryFood?: SaleProduct | NoComplimentaryType | boolean
  payedByAgreement?: boolean
  payedByAgreementId?: string

  points: number
}
