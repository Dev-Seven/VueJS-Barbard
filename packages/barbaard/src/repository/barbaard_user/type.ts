export type BarbaardUser = {
  referrals?: UserReferent[];
  referrer?: UserReferent;
  affiliateCodes?: string[];

  onAccount?: null | boolean; // only few users have it || Users who can put their bill on account || needed
  trengoProfileId?: number;
  vendID?: string;
  kiotvietID?: null | number | string;
  importSource?: UserImportSource | null;
  customerAlert?: string; // important one time notification about the customer
  barbershop?: UserBarberData;
  bar?: UserBarData;
  birthday?: FirebaseFirestore.Timestamp;
  booklyUserId?: number | null;
  wpId?: number | null;
  company?: string | null;
  followUp?: boolean;
  gender?: string | null;
  location?: string;
  lostReason?: string | null;
  mergeUserIds?: string[];
  persona?: UserPersona[] | null;
  preferences?: UserPref;
  createdAt?: FirebaseFirestore.Timestamp; //migration
  email?: string | null;
  firstName?: string;
  fullName?: string;
  lastName?: string;
  nationality?: string | null;
  phone?: string | null;
  tags?: UserTag[];

  isBrevoActivated?: boolean;
};

export type UserPref = { locale: string };

export type UserBarData = {
  firstReservation?: FirebaseFirestore.Timestamp;
  lastReservation?: FirebaseFirestore.Timestamp;
  totalReservations?: number;
  averageDaysPerReservation?: number;
};

export type UserBarberData = {
  // check when it was updated and how || functions that update this
  totalNoShows?: number;
  totalAppointments?: number;
  firstAppointment?: FirebaseFirestore.Timestamp;
  lastAppointment?: FirebaseFirestore.Timestamp;
  lastBarber?: string;
  lastService?: string;
  expressBeardTrim?: boolean;
  expressHaircut?: boolean;
  appointmentsLate?: number;
  appointmentsOnTime?: number;
  averageDaysPerAppointment?: number; // same as AverageDays
  averageDays?: number;
};
export type UserReferent = {
  code?: string;
  id?: string;
  userName?: string;
  date?: FirebaseFirestore.Timestamp;
};

export type UserImportSource = "timely" | "fresha" | "KiotViet";

export type UserPersona =
  | "ultra_rich"
  | "tourist"
  | "rich_kid"
  | "svip"
  | "expat"
  | "businessman"
  | "metrosexual_man"
  | "westernised_vietnamese"
  | "student"
  | "metrosexual man"
  | "vip";

export type UserLoyaltyMemberGroup =
  | "Gold Member"
  | "Black Member"
  | "Black Diamond Member"
  | "Club Member"
  | "Silver Member";

export type UserTag =
  | "generation 1"
  | "agreement"
  | "kings-agreement"
  | "left vietnam"
  | "locker box"
  | "app"
  | "returning"
  | "corporate"
  | "duplicate"
  | "notify guido"
  | "ex-agreement"
  | "friends & family"
  | "customer lost"
  | "accor plus"
  | "barbershop"
  | "kings agreement"
  | "ex-kings-agreement"
  | "new"
  | "friend & family"
  | "ex locker box"
  | "bar";

export const isBarbaardUser = (o: unknown) => o instanceof Object;
