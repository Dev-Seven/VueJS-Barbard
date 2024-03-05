import type { AffiliateCar, AffiliateCode } from "./affiliate-code.js";
import type { Indexable } from "./types.js";
import type { User } from "./user.js";

const DRINK_UPGRADES = ["bxXLvnX6bs6d1JojsvbQ"];

type AffiliateUpgrades = string[] | undefined;
type DiscountValue = number;
type AffiliatePromotionInfo = [
  PromotionType,
  DiscountType,
  DiscountValue,
  AffiliateUpgrades,
];

export type DiscountType =
  | "money"
  | "percentage"
  | "fixed-price"
  | "drinkUpgrade";

export type PromotionType =
  | "sale"
  | "productCategory"
  | "productBrand"
  | "product"
  | "service"
  | "fnb"
  | "fnbCategory"
  | "agreement"
  | "upgrade"
  | "individual";

export const _getRefererPromotion = (
  code: AffiliateCar,
): AffiliatePromotionInfo => {
  switch (code) {
    case "A":
      return ["service", "percentage", 25, undefined];
    case "B":
      return ["service", "money", 150_000, undefined];
    case "C":
      return ["service", "drinkUpgrade", 100, DRINK_UPGRADES];
  }
};

export const _getRecepientPromotion = (
  code: AffiliateCar,
): AffiliatePromotionInfo => {
  switch (code) {
    case "A":
      return ["service", "percentage", 25, undefined];
    case "C":
      return ["service", "drinkUpgrade", 100, DRINK_UPGRADES];
    case "B":
      throw new Error(
        "never happend - call check first to validate affiliate code",
      );
  }
};

export class Promotion {
  public get redeemedAffiliate(): boolean {
    return this._redeemedAffiliate ?? false;
  }
  public set redeemedAffiliate(value: boolean) {
    this._redeemedAffiliate = value;
  }
  public get voucher(): boolean {
    return this._voucher ?? false;
  }
  public set voucher(value: boolean) {
    this._voucher = value;
  }
  public get active(): boolean {
    return this._active ?? false;
  }
  public set active(value: boolean) {
    this._active = value;
  }
  public get days(): number[] {
    return this._days ?? [];
  }
  public set days(value: number[]) {
    this._days = value;
  }
  public get users(): string[] {
    return this._users ?? [];
  }
  public set users(value: string[]) {
    this._users = value;
  }
  public get services(): string[] {
    return this._services ?? [];
  }
  public set services(value: string[]) {
    this._services = value;
  }
  public get upgrades(): string[] {
    return this._upgrades ?? [];
  }
  public set upgrades(value: string[]) {
    this._upgrades = value;
  }
  public get endDate(): Date {
    return this._endDate;
  }
  public set endDate(value: Date) {
    this._endDate = value;
  }
  public get startDate(): Date {
    return this._startDate;
  }
  public set startDate(value: Date) {
    this._startDate = value;
  }
  public get type(): PromotionType {
    return this._type;
  }
  public set type(value: PromotionType) {
    this._type = value;
  }
  public get discountValue(): number {
    return this._discountValue;
  }
  public set discountValue(value: number) {
    this._discountValue = value;
  }
  public get discountType(): DiscountType {
    return this._discountType;
  }
  public set discountType(value: DiscountType) {
    this._discountType = value;
  }
  public get redemptionLimit(): number {
    return this._redemptionLimit ?? 0;
  }
  public set redemptionLimit(value: number) {
    this._redemptionLimit = value;
  }
  public get name(): string {
    return this._name ?? "Promotion";
  }
  public set name(value: string) {
    this._name = value;
  }
  public get autoApply(): boolean {
    return this._autoApply ?? false;
  }
  public set autoApply(value: boolean) {
    this._autoApply = value;
  }

  public get id(): string {
    return this._id;
  }

  constructor(
    private _id: string,
    private _discountType: DiscountType,
    private _discountValue: DiscountValue,
    private _type: PromotionType,
    private _startDate: Date,
    private _endDate: Date,
    private _name?: string,
    private _redemptionLimit?: number,
    private _upgrades?: string[],
    private _services?: string[],
    private _users?: string[],
    private _days?: number[],
    private _active?: boolean,
    private _voucher?: boolean,
    private _redeemedAffiliate?: boolean,
    private _autoApply?: boolean,
  ) {}

  static referralPromotions(
    affiliateCode: AffiliateCode,
    referrer: User,
    referralRecepient: User,
  ): [Promotion, Promotion] {
    const date = new Date();
    const expDate = new Date(new Date().setFullYear(date.getFullYear() + 1));
    const name = `Referral Promotion (${affiliateCode.value})`;
    const [refPtype, refDtype, refValue, refUps] = _getRefererPromotion(
      affiliateCode.referrerCode,
    );
    const [recPtype, recDtype, recValue, recUps] = _getRecepientPromotion(
      affiliateCode.recepientCode,
    );

    return [
      new PromotionBuilder()
        .withDiscountType(refDtype)
        .withDiscountValue(refValue)
        .withType(refPtype)
        .withUpgrades(refUps)
        .withStartDate(date)
        .withEndDate(expDate)
        .withName(name)
        .withRedemptionLimit(1)
        .withDays([...Array(7).keys()])
        .withActive(true)
        .withUsers([referrer.id])
        .withVoucher(true)
        .withAutoApply(true)
        .withRedeemedAffiliate(false)
        .build(),
      new PromotionBuilder()
        .withDiscountType(recDtype)
        .withDiscountValue(recValue)
        .withType(recPtype)
        .withUpgrades(recUps)
        .withStartDate(date)
        .withEndDate(expDate)
        .withName(name)
        .withRedemptionLimit(1)
        .withDays([...Array(7).keys()])
        .withActive(true)
        .withUsers([referralRecepient.id])
        .withVoucher(true)
        .withAutoApply(true)
        .withRedeemedAffiliate(false)
        .build(),
    ];
  }

  static from(raw: Indexable): Promotion | null {
    try {
      if (
        !(
          ["money", "percentage", "fixed-price", "drinkUpgrade"].includes(
            raw.discountType as string,
          ) ||
          [
            "sale",
            "productCategory",
            "productBrand",
            "product",
            "service",
            "fnb",
            "fnbCategory",
            "agreement",
            "upgrade",
            "individual",
          ].includes(raw.type as string)
        )
      ) {
        throw new Error("invalid agruments");
      }

      return new Promotion(
        raw.id as string,
        raw.discountType as DiscountType,
        raw.discountValue as DiscountValue,
        raw.type as PromotionType,
        raw.startDate as Date,
        raw.endDate as Date,
        raw.name as string | undefined,
        raw.redemptionLimit as number | undefined,
        raw.upgrades as string[] | undefined,
        raw.services as string[] | undefined,
        raw.users as string[] | undefined,
        raw.days as number[] | undefined,
        raw.active as boolean | undefined,
        raw.voucher as boolean | undefined,
        raw.redeemedAffiliate as boolean | undefined,
        raw.autoApply as boolean | undefined,
      );
    } catch (e) {
      console.warn(e);
      return null;
    }
  }

  static to(promotion: Promotion): object {
    return {
      discountType: promotion._discountType,
      discountValue: promotion._discountValue,
      type: promotion._type,
      startDate: promotion._startDate,
      endDate: promotion._endDate,
      name: promotion._name,
      redemptionLimit: promotion._redemptionLimit,
      upgrades: promotion._upgrades,
      services: promotion._services,
      users: promotion._users,
      days: promotion._days,
      active: promotion._active,
      voucher: promotion._voucher,
      redeemedAffiliate: promotion._redeemedAffiliate,
      autoApply: promotion._autoApply,
    };
  }

  addUser(user: User) {
    if (!this._users) {
      this._users = [];
    }
    return this._users.includes(user.id) ? this : this.users.push(user.id);
  }

  addUpgrade(upgrade: string) {
    if (!this._upgrades) {
      this._upgrades = [];
    }
    this._upgrades.push(upgrade);
    return this;
  }

  addService(service: string) {
    if (!this._services) {
      this._services = [];
    }
    this._services.push(service);
    return this;
  }
}

export class PromotionBuilder {
  private discountType?: DiscountType;
  public withDiscountType(value: DiscountType) {
    this.discountType = value;
    return this;
  }
  private discountValue?: DiscountValue;
  public withDiscountValue(value: DiscountValue) {
    this.discountValue = value;
    return this;
  }
  private type?: PromotionType;
  public withType(value: PromotionType) {
    this.type = value;
    return this;
  }
  private startDate?: Date;
  public withStartDate(value: Date) {
    this.startDate = value;
    return this;
  }
  private endDate?: Date;
  public withEndDate(value: Date) {
    this.endDate = value;
    return this;
  }

  private name?: string;
  public withName(value: string) {
    this.name = value;
    return this;
  }
  private redemptionLimit?: number;
  public withRedemptionLimit(value: number) {
    this.redemptionLimit = value;
    return this;
  }
  private upgrades?: string[];
  public withUpgrades(value: AffiliateUpgrades) {
    this.upgrades = value;
    return this;
  }
  private services?: string[];
  public withServices(value: string[]) {
    this.services = value;
    return this;
  }
  private users?: string[];
  public withUsers(value: string[]) {
    this.users = value;
    return this;
  }
  private days?: number[];
  public withDays(value: number[]) {
    this.days = value;
    return this;
  }
  private active?: boolean;
  public withActive(value: boolean) {
    this.active = value;
    return this;
  }
  private voucher?: boolean;
  public withVoucher(value: boolean) {
    this.voucher = value;
    return this;
  }
  private redeemedAffiliate?: boolean;
  public withRedeemedAffiliate(value: boolean) {
    this.redeemedAffiliate = value;
    return this;
  }
  private autoApply?: boolean;
  public withAutoApply(value: boolean) {
    this.autoApply = value;
    return this;
  }

  private _id?: string;
  public withId(value: string) {
    this._id = value;
    return this;
  }

  private genId() {
    return `${this.users!.join("")}-${this.startDate!.valueOf()}`;
  }

  public build() {
    return new Promotion(
      this._id ?? this.genId(),
      this.discountType!,
      this.discountValue!,
      this.type!,
      this.startDate!,
      this.endDate!,
      this.name,
      this.redemptionLimit,
      this.upgrades,
      this.services,
      this.users,
      this.days,
      this.active,
      this.voucher,
      this.redeemedAffiliate,
      this.autoApply,
    );
  }
}
