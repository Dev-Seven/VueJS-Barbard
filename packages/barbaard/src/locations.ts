import type { LoyaltyMemberGroup } from "./users.js";

export interface Ledger {
  amount: number;
  date: FirebaseFirestore.Timestamp;
  method: string;
  order: string;
  orderId: string;
  status: number;
  userId?: string;
  userName: string;
}

export interface Location {
  // connectaId: string;
  // connectaBranchId: string;
  // Let's change the keys to connectaIdHob, connectaBranchIdHob for appointments and connectaIdMom and connectaBranchIdMom for reservations
  connectaIdHob: string;
  connectaBranchCodeHob: string; // SGN_HOB
  connectaIdMom: string;
  connectaBranchCodeMom: string;
  name: string;
  phone: string;
  code: string;
  addressFirst: string;
  addressSecond: string;
}

export interface Event {
  booklyId: number;
  chainId?: number;

  completed?: boolean;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  createdFrom: string;

  upgrades?: {
    id: string;
    name: string;
    price: number;
  }[];

  drink?: number;
  food?: number;

  startDate: FirebaseFirestore.Timestamp;
  endDate: FirebaseFirestore.Timestamp;

  internalNote?: string;
  notes?: string;

  staffAny: boolean;

  status?: EventStatus;
  type?: EventType; // TODO?

  userId?: string;
  userName?: string;
  userTags?: string[];

  connectaId?: string;
  services?: EventService[];
  discountCode?: string;

  comment?: string;
  daysSinceLastAppointment?: number;
  daysSinceLastReservation?: number;
  notifyUser?: boolean;
  notifyWhatsapp?: boolean;

  source?: string;
  medium?: string;
  campaign?: string;

  // computed/derived
  serviceName?: string;
  staffName?: string;
  reminderDate?: FirebaseFirestore.Timestamp;

  orderId?: string;
  billTotal?: number;
  amountOfGuest?: number;

  notifications?: EventNotification[];

  memberGroup?: LoyaltyMemberGroup;

  firstVisit?: boolean;
}

export type EventStatus =
  | "cancelled"
  | "no-show"
  | "confirmed"
  | "approved"
  | "arrived-on-time"
  | "arrived-late";

export type EventNotification =
  | "confirmation"
  | "cancelled"
  | "completed"
  | "no-show"
  | "update";

export type EventType = "reservation" | "appointment";

export interface EventService {
  id: string;
  name: string;
  price: number;
  staff?: string;
  staffId?: string;
  duration?: number;
}

export interface Order {
  id?: string;
  discountAmount?: number;
  discountCode?: number;
  orderDevice?: string;
  orderNote?: string;
  orderNumber?: string;
  orderedAt?: FirebaseFirestore.Timestamp;
  paymentId: string;
  paymentMethod: string;
  paid?: boolean;
  completed?: boolean; // to avoid re-running onOrderComplete.
  products?: BarbaardProduct[];
  shippingInformation?: {
    city: string;
    district: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    street: string;
    ward: string;
  };

  discount?: {
    amount?: number;
    manual?: boolean;
    percentage?: number;
    promotion?: boolean;
    type?: string;
  };
  totalPayableAmount: number;
  totalDiscount: number;
  totalOrderValue: number;
  totalReportingValue: number;
  totalSpending: number;
  totalOrders: number;
  averageSpending: number;
  userId: string;
  userName: string;
  userTags: string[];
  isPushedToConnecta?: boolean;
  department: Department;

  eventItem?: {
    serviceName?: string;
    _id: string;
    createdAt: FirebaseFirestore.Timestamp;
    updatedAt: FirebaseFirestore.Timestamp;
    startDate: FirebaseFirestore.Timestamp;
    endDate: FirebaseFirestore.Timestamp;
    reminderDate?: FirebaseFirestore.Timestamp;
    services?: {
      staffId?: string;
      staff?: string;
    }[];
  };

  tableName?: string;

  source?: string;
  medium?: string;
  campaign?: string;

  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  closedAt?: string;
  amountOfGuests: number;

  registerID?: string;

  staffName?: string;
  staffId?: string;
  tips?: Tips;

  totalServiceCharge?: string | number;
  totalWithVat?: string | number;
  totalWithoutVat?: string | number;

  confirmed_by_user?: boolean;
  tip?: number;
}

export type Department = "babershop" | "bar" | "Event" | "";
export type BarbaardProduct = {
  originalPrice?: number;
  attributes: {
    Color: string;
    Size: string;
    "color-id": string;
    "label-id": string;
  };
  id: number;
  manualPrice?: number;
  discount?: number;
  image: string;
  itemTotal: number;
  nhanhId: number;
  price: number;
  quantity: number;
  slug: string;
  title: string;
  name?: string;
  category: string;
  totalPayableAmount: number;
  salesPerson?: {
    staffId?: string;
    staffName?: string;
  };

  VAT: {
    amount: number;
    label: string;
  };
  serviceCharge?: {
    amount: number;
    label: string;
  };
  priceAfterDiscount?: number;
  service?: BarbaardProductService;
};

export type BarbaardProductService = {
  manualPrice?: number;
  priceAfterDiscount?: number;
  price: number;
  discount?: number;
  VAT: {
    amount: number;
    label: string;
  };
  serviceCharge?: {
    amount: number;
    label: string;
  };
};

export interface OrderProduct {
  category: "agreement";
  id: "agreement-redemption";
  price: number;
  priceAfterDiscount: number;
  quantity: 1;
}
export interface InternalOrder {
  createdAt: FirebaseFirestore.Timestamp;
  id: string;
  paid: boolean;
  paymentMethod: "storecredit";
  totalOrderValue: number;
  totalReportingValue: number;
  userName: "internal" | string;
  products: OrderProduct[];
}

export type LocationId = "hanoi" | "hcmc";

export interface Service {
  duration: number;
  kiotvietId: number;
  price: number;
  vendId: string;
  name: string;
  status: "public" | "private" | "group";
  wpId: number;
  type: EventType;
  connectaId: string;
}

export type AgreementType = "king" | "service" | "gentleman up";

export type MemberGroupValue = {
  "Club Member"?: 1;
  "Silver Member"?: 2;
  "Gold Member"?: 3;
  "Black Member"?: 4;
  "Black Diamond Member"?: 5;
};

export interface Upgrade {
  price: number;
  name: string;
}

export interface Agreement {
  amount?: number;
  appointments?: {
    date: FirebaseFirestore.Timestamp;
    id: string;
    location: string;
    staff: string[];
  }[];
  purchasedAt?: FirebaseFirestore.Timestamp;
  expiryDate?: FirebaseFirestore.Timestamp;
  active?: boolean;
  orderId?: string;
  paid?: boolean;
  price?: number;
  redeemed?: number;
  services?: {
    id: string;
    name: string;
  }[];
  users?: [
    {
      userId: string;
      userName: string;
    },
  ];
  userMap: {
    [userId: string]: boolean;
  };

  type?: AgreementType;

  left?: number; // amount - redeemed
  pricePerService?: number; // price/amount
  storeCredit?: number; // (amount - left) * pricePerService
  serviceName?: string; //  $service1 & $service2....

  purchaseLocation?: LocationId;

  orders?: {
    date: FirebaseFirestore.Timestamp;
    id: string;
    orderNumber: string;
    total: number;
  }[];
}

export interface Lockerbox {
  active: boolean;
  averageSpending: number;
  expiryDate: FirebaseFirestore.Timestamp;
  freeGuests: number;
  months: number;
  number: number;
  orderId: string;
  orders: {
    date: FirebaseFirestore.Timestamp;
    amountOfGuests?: number;
    id: string;
    orderNumber: string;
    total: number;
  }[];
  pricePerMonth: number;
  purchasedAt: FirebaseFirestore.Timestamp;
  redeemed: number;
  storeCredit: number;
  totalSpending: number;
  userId: string;
  userName: string;
  visits: number;
  totalRevenue: number;

  price: number;
  amount: number;
}

export interface GiftCheque {
  active: boolean;
  code: string;
  expiryDate: FirebaseFirestore.Timestamp;
  orderId: string;
  orders: {
    date: FirebaseFirestore.Timestamp;
    id: string;
    total: number;
  }[];
  purchaseAt: FirebaseFirestore.Timestamp;
  storeCredit: number;
  userId: string;
  userName: string;
  value: number;
}

export type Locale = "en" | "vi";

export interface Staff {
  kiotvietId: number;
  name: string;
  nickName?: string;
  status: "public" | "private" | "archive";
  vendId: string;
  wpId: number;
}

export type ProductCategory = "product";

export type TipType = "staff" | "team" | null;
export type StaffTip = {
  amount: number;
  staffId: string | number;
  staffName: string;
};
export interface Tips {
  amount?: number | null;
  rewardType: TipType;
  tip?: StaffTip[];
}
