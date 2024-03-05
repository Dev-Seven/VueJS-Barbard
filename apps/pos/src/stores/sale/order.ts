import { serverTimestamp } from 'firebase/firestore'
import type { ExtendedEvent } from '../events'
import type { SaleDiscount } from './sale'
import type { Promotion } from '../promotion/promotion'

import { type SaleProduct } from './types'

export const SaleStatus = {
  DISCARDED: 'discarded',
  OPEN: 'open',
  CLOSED: 'closed',
  PARKED: 'parked'
}

export const salePromotion = () => ({
  type: 'percentage',
  percentage: 0,
  amount: 0,
  promotion: {},
  manual: false
})

export const generateOrder = () => ({
  _id: '',
  orderId: '',
  orderNumber: '',
  active: false,
  status: '',
  tableId: '',
  tableName: '',
  registerId: '',
  openRegisterEntryId: '',
  department: '',
  customBill: '',
  isCustomBill: false,
  amountOfGuest: 0,
  generalSalesPerson: {
    staffName: '',
    profile: ''
  },
  products: [] as Array<SaleProduct>,
  orderNote: '',
  totalOrderValue: 0,
  totalReportingValue: 0,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  closedAt: '',
  parkedSale: false,
  payment: {
    receivedCash: 0,
    paymentStatus: false
  },
  distributedPayment: {},
  staffId: '',
  staffName: '',
  eventItem: {} as ExtendedEvent,

  userTags: [] as Array<string>,
  userName: '',
  userId: '',
  userPhone: '',
  userEmail: '',
  userPersona: [] as Array<string>,
  affiliateCodes: [] as Array<string>,
  memberGroup: '',
  customerAlert: '',
  onAccount: false,

  promotionDiscount: 0,
  promotion: [] as Array<Promotion & { promotionDiscount: number; manual: boolean }>,

  discount: {
    type: 'percentage',
    percentage: 0,
    amount: 0,
    promotion: null,
    manual: false
  } as SaleDiscount,

  salePromotion: salePromotion(),

  paid: false,
  isPromotionalSale: false
})
