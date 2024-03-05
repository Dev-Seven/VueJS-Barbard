import type {
  ErrorOr,
  LocationEvent,
  LocationEventLoyaltyMemberGroup,
  LocationEventNotification,
  LocationEventService,
  LocationEventStatus,
  LocationEventType,
  LocationEventUpgrade,
} from "@barbaard/types";
import dto from "../dto.js";

export type AppLocationEvent = {
  booklyId: number;
  chainId: number;

  completed: boolean;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  createdFrom: string;

  upgrades: AppLocationEventUpgrade[];

  drink: number;
  food: number;

  startDate: FirebaseFirestore.Timestamp;
  endDate: FirebaseFirestore.Timestamp;

  internalNote: string;
  notes: string;

  staffAny: boolean;

  status: AppLocationEventStatus | null;
  type: AppLocationEventType | null;

  userId: string;
  userName: string;
  userTags: string[];

  services: AppLocationEventService[];
  discountCode: string;

  comment: string;
  daysSinceLastAppointment: number;
  daysSinceLastReservation: number;
  notifyUser: boolean;

  //TODO(tuan); need to confirm with tom
  notifyWhatsapp: boolean;

  source: string;
  medium: string;
  campaign: string;

  // computed/derived
  serviceName: string;
  staffName: string;
  reminderDate: FirebaseFirestore.Timestamp | null;

  orderId: string;
  billTotal: number;
  amountOfGuest: number;

  notifications: AppLocationEventNotification[];

  memberGroup: AppLocationEventLoyaltyMemberGroup | null;

  firstVisit: boolean;
};

export type AppLocationEventLoyaltyMemberGroup =
  LocationEventLoyaltyMemberGroup;
export type AppLocationEventStatus = LocationEventStatus;

export type AppLocationEventNotification = LocationEventNotification;

export type AppLocationEventType = LocationEventType;

export type AppLocationEventUpgrade = LocationEventUpgrade;

export type AppLocationEventService = {
  id: string;
  name: string;
  price: number;
  staff?: string;
  staffId: string;
  duration: number;
};

const eventTypeToDto = (
  dao: LocationEventType | null,
): AppLocationEventType | null => dao;

const eventStatusToDto = (
  dao: LocationEventStatus | null,
): AppLocationEventStatus | null => dao;

const eventServiceToDto = (
  dao: LocationEventService,
): AppLocationEventService => ({
  id: dao.id,
  name: dao.name,
  price: dao.price,
  staff: dao.staff ?? "",
  staffId: dao.staffId ?? "",
  duration: dao.duration ?? 0,
});

const eventNotificationToDto = (
  dao: LocationEventNotification,
): AppLocationEventNotification => dao;

const memberGroupToDto = (
  dao: LocationEventLoyaltyMemberGroup | null,
): AppLocationEventLoyaltyMemberGroup | null => dao;

const toDto = (dao: LocationEvent): AppLocationEvent => ({
  food: dao.food ?? 0,
  type: eventTypeToDto(dao.type ?? null),
  drink: dao.drink ?? 0,
  notes: dao.notes ?? "",
  medium: dao.medium ?? "",
  source: dao.source ?? "",
  status: eventStatusToDto(dao.status ?? null),
  userId: dao.userId ?? "",
  chainId: dao.chainId ?? 0,
  comment: dao.comment ?? "",
  endDate: dao.endDate ?? null,
  orderId: dao.orderId ?? "",
  booklyId: dao.booklyId,
  campaign: dao.campaign ?? "",
  memberGroup: memberGroupToDto(dao.memberGroup ?? null),
  services: dao.services?.map(eventServiceToDto) ?? [],
  staffAny: dao.staffAny ?? false,
  upgrades: dao.upgrades ?? [],
  userName: dao.userName ?? "",
  userTags: dao.userTags ?? [],
  billTotal: dao.billTotal ?? 0,
  completed: dao.completed ?? false,
  createdAt: dao.createdAt ?? null,
  staffName: dao.staffName ?? "",
  startDate: dao.startDate ?? null,
  updatedAt: dao.updatedAt ?? null,
  notifyUser: dao.notifyUser ?? false,
  firstVisit: dao.firstVisit ?? false,
  createdFrom: dao.createdFrom ?? null,
  serviceName: dao.serviceName ?? "",
  discountCode: dao.discountCode ?? "",
  internalNote: dao.internalNote ?? "",
  reminderDate: dao.reminderDate ?? null,
  amountOfGuest: dao.amountOfGuest ?? 0,
  notifications: dao.notifications?.map(eventNotificationToDto) ?? [],
  notifyWhatsapp: dao.notifyWhatsapp ?? false,
  daysSinceLastAppointment: dao.daysSinceLastAppointment ?? 0,
  daysSinceLastReservation: dao.daysSinceLastReservation ?? 0,
});

const fromDto = (data: AppLocationEvent): ErrorOr<LocationEvent> =>
  dto.fromDto<AppLocationEvent, LocationEvent>(data);

export default { toDto, fromDto };
