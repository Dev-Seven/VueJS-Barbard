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

export type Promotion = {
  name?: string;
  redemptionLimit?: number;
  discountType: DiscountType;
  discountValue: number;
  type: PromotionType;
  startDate: FirebaseFirestore.Timestamp;
  endDate: FirebaseFirestore.Timestamp;
  upgrades?: string[];
  services?: string[];
  users?: string[];
  days?: number[];
  active?: boolean;
  voucher?: boolean;
  redeemedAffiliate?: boolean;
  autoApply?: boolean;
};
