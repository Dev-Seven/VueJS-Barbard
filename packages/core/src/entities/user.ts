import { AffiliateCode } from "./affiliate-code.js";
import type { Indexable } from "./types.js";

export type UserReferent = {
  code?: string;
  id?: string;
  userName?: string;
  date?: Date;
};

export type BarbershopData = {
  totalNoShows: number;
  totalAppointments: number;
  lastBarber: string;
  expressBeardTrim: boolean;
  expressHaircut: boolean;
  appointmentsLate: number;
  appointmentsOnTime: number;
  averageDaysPerAppointment: number;
  averageDays: number;
  firstAppointment?: Date;
  lastAppointment?: Date;
};

export class User {
  public get fullName(): string | undefined {
    return this._fullName;
  }
  public set fullName(value: string) {
    this._fullName = value;
  }
  public get id(): string {
    return this._id;
  }
  public set id(value: string) {
    this._id = value;
  }
  public get affiliateCodes(): AffiliateCode[] {
    return this._affiliateCodes;
  }
  public set affiliateCodes(value: AffiliateCode[]) {
    this._affiliateCodes = value;
  }
  public get email(): string | undefined {
    return this._email;
  }
  public set email(value: string) {
    this._email = value;
  }
  private _referrer?: UserReferent | undefined;
  public get referrer(): UserReferent | undefined {
    return this._referrer;
  }
  public set referrer(value: UserReferent | undefined) {
    this._referrer = value;
  }
  private _referrals?: UserReferent[] | undefined;
  public get referrals(): UserReferent[] | undefined {
    return this._referrals;
  }
  public set referrals(value: UserReferent[] | undefined) {
    this._referrals = value;
  }
  private _barbershop?: BarbershopData | undefined;
  public get barbershop(): BarbershopData | undefined {
    return this._barbershop;
  }
  public set barbershop(value: BarbershopData | undefined) {
    this._barbershop = value;
  }
  public get firstName(): string | undefined {
    return this._firstName;
  }
  public set firstName(value: string) {
    this._firstName = value;
  }
  public get lastName(): string | undefined {
    return this._lastName;
  }
  public set lastName(value: string) {
    this._lastName = value;
  }

  constructor(
    private _affiliateCodes: AffiliateCode[] = [],
    private _id: string,
    private _email?: string,
    private _fullName?: string,
    private _firstName?: string,
    private _lastName?: string,
  ) {}

  addAffiliateCode(code: AffiliateCode) {
    if (!this.hasAffiliateCode(code)) {
      this.affiliateCodes.push(code);
    }
  }

  removeAffiliateCode(code: AffiliateCode) {
    this.affiliateCodes = this.affiliateCodes.filter(
      (a) => a.value != code.value,
    );
  }

  hasAffiliateCode(code: AffiliateCode) {
    return this.affiliateCodes.some((v) => v.value == code.value);
  }

  addReferral(referral: UserReferent) {
    if (!this.referrals) {
      this.referrals = [referral];
    } else {
      this.referrals.push(referral);
    }
  }

  get isNewComer(): boolean {
    return !this.barbershop?.lastAppointment;
  }

  static from(raw: Indexable) {
    try {
      const res = new User(
        (raw.affiliateCodes as string[] | undefined)?.map(
          (v) => new AffiliateCode(v),
        ) ?? [],
        raw.id as string,
      );
      res.email = raw.email as string;
      res.fullName = raw.fullName as string;
      res.lastName = raw.lastName as string;
      res.firstName = raw.firstName as string;
      res.referrer = raw.referrer as UserReferent | undefined;
      res.referrals = raw.referrals as UserReferent[] | undefined;
      const barbershop = raw.barbershop as Indexable;
      res.barbershop = {
        totalNoShows: barbershop?.totalNoShows as number,
        totalAppointments: barbershop?.totalAppointments as number,
        lastBarber: barbershop?.lastBarber as string,
        expressBeardTrim: barbershop?.expressHaircut as boolean,
        expressHaircut: barbershop?.expressHaircut as boolean,
        appointmentsLate: barbershop?.appointmentsLate as number,
        appointmentsOnTime: barbershop?.appointmentsOnTime as number,
        averageDaysPerAppointment:
          barbershop?.averageDaysPerAppointment as number,
        averageDays: barbershop?.averageDays as number,
        firstAppointment: barbershop?.firstAppointment as Date | undefined,
        lastAppointment: barbershop?.lastAppointment as Date | undefined,
      };

      return res;
    } catch (e) {
      console.warn(e);
      return null;
    }
  }

  static to(user: User): object {
    return {
      fullName: user._fullName,
      firstName: user._firstName,
      lastName: user._lastName,
      email: user._email,
      affiliateCodes: user._affiliateCodes.length
        ? user._affiliateCodes.map((a) => a.value)
        : [], // if undefined => firestore update method will omit this field
      referrer: user._referrer,
      referrals: user._referrals?.length ? user._referrals : undefined,
      barbershop: user._barbershop,
    };
  }
}
