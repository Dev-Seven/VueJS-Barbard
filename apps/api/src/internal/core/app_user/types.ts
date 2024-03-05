import type {
  BarbaardUser,
  ErrorOr,
  UserBarData,
  UserBarberData,
  UserImportSource,
  UserPersona,
  UserPref,
  UserReferent,
  UserTag,
} from "@barbaard/types";
import dto from "../dto.js";

export type AppUser = {
  referrals: AppUserReferent[];
  referrer: AppUserReferent | null;
  affilateCodes: string[];
  isBrevoActivated: boolean;

  onAccount: boolean;

  trengoProfileId: string;
  vendID: string;
  kiotvietID: string;
  booklyUserId: string;
  wpId: string;

  importSource: AppUserImportSource | null;
  customerAlert: string;
  barbershop: AppUserBarberData | null;
  bar: AppUserBarData | null;
  birthday: FirebaseFirestore.Timestamp | null;
  company: string;
  followUp: boolean;
  gender: string;
  location: string;
  lostReason: string;
  mergeUserIds: string[];
  persona: AppUserPersona[];
  preferences: AppUserPref | null;

  createdAt: FirebaseFirestore.Timestamp | null;
  email: string;
  firstName: string;
  fullName: string;
  lastName: string;
  nationality: string;
  phone: string;
  tags: AppUserTag[];
};

export type AppUserTag = UserTag;

export type AppUserPref = UserPref;

export type AppUserImportSource = UserImportSource;
export type AppUserPersona = UserPersona;

export type AppUserReferent = {
  id: string;
  userName: string;
  date: FirebaseFirestore.Timestamp | null;
  code: string;
};

export type AppUserBarData = {
  firstReservation: FirebaseFirestore.Timestamp | null;
  lastReservation: FirebaseFirestore.Timestamp | null;
  totalReservations: number;
  averageDaysPerReservation: number;
};
export type AppUserBarberData = {
  totalNoShows: number;
  totalAppointments: number;
  firstAppointment: FirebaseFirestore.Timestamp | null;
  lastAppointment: FirebaseFirestore.Timestamp | null;
  lastBarber: string;
  expressBeardTrim: boolean;
  expressHaircut: boolean;
  appointmentsLate: number;
  appointmentsOnTime: number;
  averageDaysPerAppointment: number;
  averageDays: number;
};

const refToDto = (data: UserReferent): AppUserReferent => ({
  id: data.id ?? "",
  userName: data.userName ?? "",
  date: data.date ?? null,
  code: data.code ?? "",
});

const barToDto = (data: UserBarData | undefined): AppUserBarData => {
  return {
    lastReservation: data?.lastReservation ?? null,
    firstReservation: data?.firstReservation ?? null,
    totalReservations: data?.totalReservations ?? 0,
    averageDaysPerReservation: data?.averageDaysPerReservation ?? 0,
  };
};

const barberToDto = (data: UserBarberData | undefined): AppUserBarberData => {
  return {
    lastBarber: data?.lastBarber ?? "",
    averageDays: data?.averageDays ?? 0,
    averageDaysPerAppointment: data?.averageDaysPerAppointment ?? 0,
    totalNoShows: data?.totalNoShows ?? 0,
    expressHaircut: data?.expressHaircut ?? false,
    appointmentsLate: data?.appointmentsLate ?? 0,
    expressBeardTrim: data?.expressBeardTrim ?? false,
    lastAppointment: data?.lastAppointment ?? null,
    firstAppointment: data?.firstAppointment ?? null,
    appointmentsOnTime: data?.appointmentsOnTime ?? 0,
    totalAppointments: data?.totalAppointments ?? 0,
  };
};

const prefToDto = (data: UserPref | undefined | null): AppUserPref | null =>
  data ?? null;

const impsrcToDto = (
  data: UserImportSource | undefined | null,
): AppUserImportSource | null => data ?? null;

const toDto = (dao: BarbaardUser): AppUser => {
  return {
    referrer: dao.referrer ? refToDto(dao.referrer) : null,
    referrals: dao.referrals?.map(refToDto) ?? [],
    affilateCodes: dao.affiliateCodes ?? [],
    bar: barToDto(dao.bar),
    tags: dao.tags ?? [],
    wpId: dao.wpId?.toString() ?? "",
    email: dao.email ?? "",
    phone: dao.phone ?? "",
    gender: dao.gender ?? "",
    vendID: dao.vendID ?? "",
    company: dao.company ?? "",
    persona: Array.isArray(dao.persona)
      ? dao.persona
      : typeof dao.persona == "string"
        ? [dao.persona]
        : [],
    birthday: dao.birthday ?? null,
    followUp: dao.followUp ?? false,
    fullName: dao.fullName ?? "",
    lastName: dao.lastName ?? "",
    location: dao.location ?? "",
    createdAt: dao.createdAt ?? null,
    firstName: dao.firstName ?? "",
    onAccount: dao.onAccount ?? false,
    barbershop: barberToDto(dao.barbershop),
    kiotvietID: dao.kiotvietID?.toString() ?? "",
    lostReason: dao.lostReason ?? "",
    nationality: dao.nationality ?? "",
    preferences: prefToDto(dao.preferences),
    booklyUserId: dao.booklyUserId?.toString() ?? "",
    importSource: impsrcToDto(dao.importSource),
    mergeUserIds: dao.mergeUserIds ?? [],
    isBrevoActivated: !!dao.isBrevoActivated,
    customerAlert: dao.customerAlert ?? "",
    trengoProfileId: dao.trengoProfileId?.toString() ?? "",
  };
};

export type AppUserWithId = [id: string, user: AppUser];

export type AppUserUpdatePayload = Partial<BarbaardUser>;

const fromDto = (data: AppUser): ErrorOr<BarbaardUser> => dto.fromDto(data);

export default { toDto, fromDto };
