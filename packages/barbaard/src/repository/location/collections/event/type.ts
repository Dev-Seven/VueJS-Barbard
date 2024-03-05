export type LocationEvent = {
  booklyId: number;
  chainId?: number;

  completed?: boolean;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  createdFrom: string;

  upgrades?: LocationEventUpgrade[];

  drink?: number;
  food?: number;

  startDate: FirebaseFirestore.Timestamp;
  endDate: FirebaseFirestore.Timestamp;

  internalNote?: string;
  notes?: string;

  staffAny: boolean;

  status?: LocationEventStatus;
  type?: LocationEventType;

  userId?: string;
  userName?: string;
  userTags?: string[];

  services?: LocationEventService[];
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

  notifications?: LocationEventNotification[];

  memberGroup?: LocationEventLoyaltyMemberGroup;

  firstVisit?: boolean;
};
export const isLocationEvent = (o: unknown) =>
  o instanceof Object &&
  [
    "booklyId",
    "createdAt",
    "updatedAt",
    "createdFrom",
    "startDate",
    "endDate",
    "staffAny",
  ]
    .map((p) => p in o)
    .every((b) => b);

export type LocationEventLoyaltyMemberGroup =
  | "Gold Member"
  | "Black Member"
  | "Black Diamond Member"
  | "Club Member"
  | "Silver Member";

export type LocationEventStatus =
  | "cancelled"
  | "no-show"
  | "confirmed"
  | "approved"
  | "arrived-on-time"
  | "arrived-late";

export type LocationEventNotification =
  | "confirmation"
  | "cancelled"
  | "completed"
  | "no-show"
  | "update";

export type LocationEventType = "reservation" | "appointment";

export type LocationEventUpgrade = {
  id: string;
  name: string;
  price: number;
};

export type LocationEventService = {
  id: string;
  name: string;
  price: number;
  staff?: string;
  staffId?: string;
  duration?: number;
};
