import { LoyaltyMemberGroup } from './users'
import { type Timestamp } from 'firebase/firestore'

export interface Ledger {
  amount: number
  date: Timestamp
  method: string
  order: string
  orderId: string
  status: number
  userId?: string
  userName: string
}

export interface Location {
  // connectaId: string;
  // connectaBranchId: string;
  // Let's change the keys to connectaIdHob, connectaBranchIdHob for appointments and connectaIdMom and connectaBranchIdMom for reservations
  connectaIdHob: string
  connectaBranchCodeHob: string // SGN_HOB
  connectaIdMom: string
  connectaBranchCodeMom: string
  name: string
  phone: string
  code: string
  addressFirst: string
  addressSecond: string
}

export interface Event {
  booklyId: number
  chainId?: number

  completed?: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  createdFrom: string

  upgrades?: {
    id: string
    name: string
    price: number
  }[]

  drink?: number
  food?: number

  startDate: Timestamp
  endDate: Timestamp

  internalNote?: string
  notes?: string

  staffAny: boolean

  status?: EventStatus
  type?: string // TODO?

  userId?: string
  userName?: string
  userTags?: string[]

  connectaId?: string
  services?: EventService[]
  discountCode?: string

  comment?: string
  daysSinceLastAppointment?: number
  daysSinceLastReservation?: number
  notifyUser?: boolean
  notifyWhatsapp?: boolean

  source?: string
  medium?: string
  campaign?: string

  // computed/derived
  serviceName?: string
  staffName?: string
  reminderDate?: Timestamp

  orderId?: string
  billTotal?: number
  amountOfGuest?: number

  notifications?: EventNotification[]

  memberGroup?: LoyaltyMemberGroup

  firstVisit?: boolean
}

export enum EventStatus {
  Cancelled = 'cancelled',
  NoShow = 'no-show',
  Confirmed = 'confirmed',
  Approved = 'approved',
  ArrivedOnTime = 'arrived-on-time',
  ArrivedLate = 'arrived-late'
}

export enum EventNotification {
  Confirmation = 'confirmation',
  Cancelled = 'cancelled',
  Completed = 'completed',
  NoShow = 'no-show',
  Update = 'update'
}

export enum EventType {
  reservation = 'reservation',
  appointment = 'appointment'
}

export interface EventService {
  id: string
  name: string
  price: number
  staff?: string
  staffId?: string
  duration?: number
}

export interface Order {
  id?: string
  discountAmount?: number
  discountCode?: number
  orderDevice?: string
  orderNote?: string
  orderNumber?: string
  orderedAt?: Timestamp
  paymentId: string
  paymentMethod: string
  paid?: boolean
  completed?: boolean // to avoid re-running onOrderComplete.
  products?: {
    attributes: {
      Color: string
      Size: string
      'color-id': string
      'label-id': string
    }
    id: number
    image: string
    itemTotal: number
    nhanhId: number
    price: number
    quantity: number
    slug: string
    title: string
    name?: string
    category: string
    totalPayableAmount: number
    salesPerson?: {
      staffId?: string
      staffName?: string
    }
  }[]
  shippingInformation?: {
    city: string
    district: string
    email: string
    firstName: string
    lastName: string
    phone: string
    street: string
    ward: string
  }
  totalOrderValue: number
  totalReportingValue: number
  totalSpending: number
  totalOrders: number
  averageSpending: number
  userId: string
  userName: string
  userTags: string[]
  isPushedToConnecta?: boolean
  eventItem?: {
    _id: string
    createdAt: Timestamp
    updatedAt: Timestamp
    startDate: Timestamp
    endDate: Timestamp
    reminderDate?: Timestamp
    services?: {
      staffId?: string
      staff?: string
    }[]
  }

  tableName?: string

  source?: string
  medium?: string
  campaign?: string

  createdAt: Timestamp
  updatedAt: Timestamp
  closedAt?: string
  amountOfGuests: number

  registerID?: string

  staffName?: string
  staffId?: string
  tips?: Tips

  totalServiceCharge?: string | number
  totalWithVat?: string | number

  confirmed_by_user?: boolean
  tip?: number
}

export interface OrderProduct {
  category: 'agreement'
  id: 'agreement-redemption'
  price: number
  priceAfterDiscount: number
  quantity: 1
}
export interface InternalOrder {
  createdAt: Timestamp
  id: string
  paid: boolean
  paymentMethod: 'storecredit'
  totalOrderValue: number
  totalReportingValue: number
  userName: 'internal' | string
  products: OrderProduct[]
}

export enum LocationId {
  hanoi = 'hanoi',
  hcmc = 'hcmc'
}
export interface Service {
  duration: number
  kiotvietId: number
  price: number
  vendId: string
  name: string
  status: 'public' | 'private' | 'group'
  wpId: number
  type: string
  connectaId: string
}

export enum AgreementType {
  King = 'king',
  Service = 'service',
  GentlemanUp = 'gentleman up'
}

export const memberGroupValue: { [m in LoyaltyMemberGroup]?: number } = {
  [LoyaltyMemberGroup.ClubMember]: 1,
  [LoyaltyMemberGroup.SilverMember]: 2,
  [LoyaltyMemberGroup.Gold]: 3,
  [LoyaltyMemberGroup.Black]: 4,
  [LoyaltyMemberGroup.BlackDiamond]: 5
}

export interface Upgrade {
  price: number
  name: string
}

export interface Agreement {
  amount?: number
  appointments?: {
    date: Timestamp
    id: string
    location: string
    staff: string[]
  }[]
  purchasedAt?: Timestamp
  expiryDate?: Timestamp
  active?: boolean
  orderId?: string
  paid?: boolean
  price?: number
  redeemed?: number
  services?: {
    id: string
    name: string
  }[]
  users?: [
    {
      userId: string
      userName: string
    }
  ]
  userMap: {
    [userId: string]: boolean
  }

  type?: string

  left?: number // amount - redeemed
  pricePerService?: number // price/amount
  storeCredit?: number // (amount - left) * pricePerService
  serviceName?: string //  $service1 & $service2....

  purchaseLocation?: string

  orders?: {
    date: Timestamp
    id: string
    orderNumber: string
    total: number
  }[]
}

export interface Lockerbox {
  active: boolean
  averageSpending: number
  expiryDate: Timestamp
  freeGuests: number
  months: number
  number: number
  orderId: string
  orders: {
    date: Timestamp
    amountOfGuests?: number
    id: string
    orderNumber: string
    total: number
  }[]
  pricePerMonth: number
  purchasedAt: Timestamp
  redeemed: number
  storeCredit: number
  totalSpending: number
  userId: string
  userName: string
  visits: number
  totalRevenue: number

  price: number
  amount: number
}

export interface GiftCheque {
  active: boolean
  code: string
  expiryDate: Timestamp
  orderId: string
  orders: {
    date: Timestamp
    id: string
    total: number
  }[]
  purchaseAt: Timestamp
  storeCredit: number
  userId: string
  userName: string
  value: number
}

export enum Locale {
  en = 'en',
  vi = 'vi'
}

export interface Staff {
  kiotvietId: number
  name: string
  nickName?: string
  status: 'public' | 'private' | 'archive'
  vendId: string
  wpId: number
}

export enum ProductCategory {
  Product = 'product'
}

export interface Tips {
  amount: number | null
  reward_type: 'team' | 'staff' | null
  staff_name?: string | null
  staff_id?: string | null
}
