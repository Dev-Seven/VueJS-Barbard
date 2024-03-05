import type { SendinblueEventType } from './sendinblue'
import { type Timestamp } from 'firebase/firestore'

export type User = {
  firstName: string
  lastName: string
  fullName: string
  email?: string
  phone?: string
  notifySMS?: boolean
  birthday?: Timestamp
  nationality?: string
  company?: string
  preferences?: {
    locale?: string
  }
  barbershop?: {
    firstAppointment?: Timestamp
    lastAppointment?: Timestamp
    lastBarber?: string
    totalAppointments?: number
    expressBeardTrim?: boolean
    expressHaircut?: boolean
    appointmentsLate?: number
    appointmentsOnTime?: number
    totalNoShows?: number
    averageDaysPerAppointment?: number
  }

  bar?: {
    firstReservation?: Timestamp
    lastReservation?: Timestamp
    totalReservations?: number
    averageDaysPerReservation?: number
  }

  referredById?: string
  referredByName?: string
  refferedRedeemed?: boolean
  referrals?: Referral[]

  location?: string
  connectaId?: string
  sendinblueId?: number
  trengoProfileId?: number
  trengoPhoneContactId?: number
  // booklyId?: number;
  wpId?: number
  createdAt?: Timestamp
  customerAlert?: string
  membershipNumber?: string
  vendID?: string
  comments?: string
  // groups?: string[];
  kiotvietID?: string
  tags?: Tag[]
  persona?: Persona[]

  loyalty?: {
    totalPoints: number
    actualPoints: number
    memberGroup: LoyaltyMemberGroup
    memberGroupId: string
    memberGroupPoints: number
    nextMemberGroupPoints: number
    nextMemberGroupId: string
    nextMemberGroup: string
    loyaltyApp: string
    loyaltyAppActivation?: Timestamp
    lastLoyaltyTransaction?: Timestamp
  }

  notifications?: {
    emailError?: boolean
    emailErrorType?: 'event'
    emailErrorReason?: SendinblueEventType
    emailNotificationSubscribed?: boolean
  }

  booklyUserId?: number
}

export type Referral = {
  id?: string
  userName?: string
  date?: Timestamp
  status?: string
  email?: string
}

export enum Persona {
  tourist = 'tourist',
  vip = 'vip',
  svip = 'svip'
}

export enum LoyaltyMemberGroup {
  Gold = 'Gold Member',
  Black = 'Black Member',
  BlackDiamond = 'Black Diamond Member',
  ClubMember = 'Club Member',
  SilverMember = 'Silver Member'
}

export enum Tag {
  New = 'new', // - set 'new' tag in users with customers with one appointment
  ExAgreement = 'ex-agreement', // - Add tag 'ex-agreement' for users that have an active = false agreement linked
  Agreement = 'agreement',
  Barbershop = 'barbershop', // - Add 'barbershop' tag for people that have at least one completed appointment
  Returning = 'returning',
  App = 'app',
  ExKingsAgreement = 'ex-kings-agreement',
  KingsAgreement = 'kings-agreement',
  ExLockerBox = 'ex locker box',
  LockerBox = 'locker box',
  CustomerLost = 'customer lost',
  NotifyGuido = 'notify guido',
  Bar = 'bar',
  Duplicate = 'duplicate'
}
