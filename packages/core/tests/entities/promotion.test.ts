import {
  PromotionBuilder,
  Promotion,
  AffiliateCode,
  User,
  Indexable,
  _getRefererPromotion,
  _getRecepientPromotion,
} from "../../src/index.js";
import { describe, expect, it, test } from "vitest";

const user1 = () => new User([], "404", "test@test.com", "John Doe");
const user2 = () =>
  new User([new AffiliateCode("AAAAAA")], "401", "test@test.com", "Jane Doe");
describe("PromotionBuilder", () => {
  it("should create a new Promotion instance", () => {
    const promotion = new PromotionBuilder()
      .withDiscountType("percentage")
      .withDiscountValue(10)
      .withType("product")
      .withStartDate(new Date("2024-01-01"))
      .withEndDate(new Date("2024-01-31"))
      .withName("New Year Sale")
      .withRedemptionLimit(100)
      .withUpgrades(["premium"])
      .withServices(["delivery"])
      .withUsers(["user1", "user2"])
      .withDays([1, 2, 3, 4, 5])
      .withActive(true)
      .withVoucher(true)
      .withRedeemedAffiliate(false)
      .withAutoApply(false)
      .withId("123")
      .build();

    expect(promotion).toBeDefined();
    expect(promotion.discountType).toBe("percentage");
    expect(promotion.discountValue).toBe(10);
    expect(promotion.type).toBe("product");
    expect(promotion.startDate).toEqual(new Date("2024-01-01"));
    expect(promotion.endDate).toEqual(new Date("2024-01-31"));
    expect(promotion.name).toBe("New Year Sale");
    expect(promotion.redemptionLimit).toBe(100);
    expect(promotion.upgrades).toEqual(["premium"]);
    expect(promotion.services).toEqual(["delivery"]);
    expect(promotion.users).toEqual(["user1", "user2"]);
    expect(promotion.days).toEqual([1, 2, 3, 4, 5]);
    expect(promotion.active).toBe(true);
    expect(promotion.voucher).toBe(true);
    expect(promotion.redeemedAffiliate).toBe(false);
    expect(promotion.autoApply).toBe(false);
  });
});

describe("Promotion", () => {
  describe("Getters/Setters", () => {
    const promotion = new Promotion(
      "123",
      "money",
      12,
      "fnb",
      new Date(),
      new Date(),
    );
    test("redeemedAffiliate should return false if not set", () => {
      expect(promotion.redeemedAffiliate).toBe(false);
    });

    test("voucher should return false if not set", () => {
      expect(promotion.voucher).toBe(false);
    });

    test("active should return false if not set", () => {
      expect(promotion.active).toBe(false);
    });

    test("days should return an empty array if not set", () => {
      expect(promotion.days).toEqual([]);
    });

    test("users should return an empty array if not set", () => {
      expect(promotion.users).toEqual([]);
    });

    test("services should return an empty array if not set", () => {
      expect(promotion.services).toEqual([]);
    });

    test("upgrades should return an empty array if not set", () => {
      expect(promotion.upgrades).toEqual([]);
    });

    test("redemptionLimit should return 0 if not set", () => {
      expect(promotion.redemptionLimit).toBe(0);
    });

    test("redeemedAffiliate should return true if set", () => {
      promotion.redeemedAffiliate = true;
      expect(promotion.redeemedAffiliate).toBe(true);
    });

    test("voucher should return true if set", () => {
      promotion.voucher = true;
      expect(promotion.voucher).toBe(true);
    });

    test("active should return true if set", () => {
      promotion.active = true;
      expect(promotion.active).toBe(true);
    });

    test("days should return an array with the same values as set", () => {
      const days = [1, 2, 3];
      promotion.days = days;
      expect(promotion.days).toEqual(days);
    });

    test("users should return an array with the same values as set", () => {
      const users = ["user1", "user2"];
      promotion.users = users;
      expect(promotion.users).toEqual(users);
    });

    test("services should return an array with the same values as set", () => {
      const services = ["service1", "service2"];
      promotion.services = services;
      expect(promotion.services).toEqual(services);
    });

    test("upgrades should return an array with the same values as set", () => {
      const upgrades = ["upgrade1", "upgrade2"];
      promotion.upgrades = upgrades;
      expect(promotion.upgrades).toEqual(upgrades);
    });

    test("endDate should return the same date as set", () => {
      const endDate = new Date();
      promotion.endDate = endDate;
      expect(promotion.endDate).toEqual(endDate);
    });

    test("startDate should return the same date as set", () => {
      const startDate = new Date();
      promotion.startDate = startDate;
      expect(promotion.startDate).toEqual(startDate);
    });

    test("type should return the same value as set", () => {
      const type = "fnb";
      promotion.type = type;
      expect(promotion.type).toEqual(type);
    });

    test("discountValue should return the same value as set", () => {
      const discountValue = 10;
      promotion.discountValue = discountValue;
      expect(promotion.discountValue).toEqual(discountValue);
    });
    test("discountType should return the same value as set", () => {
      const discountType = "percentage";
      promotion.discountType = discountType;
      expect(promotion.discountType).toEqual(discountType);
    });

    test("redemptionLimit should return if set", () => {
      promotion.redemptionLimit = 10;
      expect(promotion.redemptionLimit).toBe(10);
    });

    test('name should return "Promotion" if not set', () => {
      expect(promotion.name).toBe("Promotion");
    });

    test("autoApply should return false if not set", () => {
      expect(promotion.autoApply).toBe(false);
    });

    test("set name(value: string) sets the name of the promotion", () => {
      promotion.name = "New Year Sale";
      expect(promotion.name).toBe("New Year Sale");
    });

    test("get name() returns the name of the promotion", () => {
      expect(promotion.name).toBe("New Year Sale");
    });

    test("get/set autoApply() returns the autoApply value of the promotion", () => {
      promotion.autoApply = true;
      expect(promotion.autoApply).toBe(true);
    });

    test("get id() returns the id of the promotion", () => {
      expect(promotion.id).toBe("123");
    });
  });

  describe("helpers", () => {
    const DRINK_UPGRADES = ["bxXLvnX6bs6d1JojsvbQ"];

    test("_getRefererPromotion should return correct promotion info for code A", () => {
      const promotionInfo = _getRefererPromotion("A");
      expect(promotionInfo).toEqual(["service", "percentage", 25, undefined]);
    });

    test("_getRefererPromotion should return correct promotion info for code B", () => {
      const promotionInfo = _getRefererPromotion("B");
      expect(promotionInfo).toEqual(["service", "money", 150_000, undefined]);
    });

    test("_getRefererPromotion should return correct promotion info for code C", () => {
      const promotionInfo = _getRefererPromotion("C");
      expect(promotionInfo).toEqual([
        "service",
        "drinkUpgrade",
        100,
        DRINK_UPGRADES,
      ]);
    });

    test("_getRecepientPromotion should return correct promotion info for code A", () => {
      const promotionInfo = _getRecepientPromotion("A");
      expect(promotionInfo).toEqual(["service", "percentage", 25, undefined]);
    });

    test("_getRecepientPromotion should return correct promotion info for code C", () => {
      const promotionInfo = _getRecepientPromotion("C");
      expect(promotionInfo).toEqual([
        "service",
        "drinkUpgrade",
        100,
        DRINK_UPGRADES,
      ]);
    });

    test("_getRecepientPromotion should throw an error for code B", () => {
      expect(() => _getRecepientPromotion("B")).toThrowError(
        "never happend - call check first to validate affiliate code",
      );
    });
  });

  it("should create referral promotions", () => {
    const affiliateCode = new AffiliateCode("AAAAAA");
    const referrer = user1();
    const referralRecepient = user2();

    const [referralPromotion1, referralPromotion2] =
      Promotion.referralPromotions(affiliateCode, referrer, referralRecepient);

    expect(referralPromotion1).toBeDefined();
    expect(referralPromotion2).toBeDefined();
    expect(referralPromotion1.discountType).toBeDefined();
    expect(referralPromotion1.discountValue).toBeDefined();
    expect(referralPromotion1.type).toBeDefined();
    expect(referralPromotion1.startDate).toBeDefined();
    expect(referralPromotion1.endDate).toBeDefined();
    expect(referralPromotion1.name).toBeDefined();
    expect(referralPromotion1.redemptionLimit).toBeDefined();
    expect(referralPromotion1.upgrades).toBeDefined();
    expect(referralPromotion1.services).toBeDefined();
    expect(referralPromotion1.users).toBeDefined();
    expect(referralPromotion1.days).toBeDefined();
    expect(referralPromotion1.active).toBeDefined();
    expect(referralPromotion1.voucher).toBeDefined();
    expect(referralPromotion1.redeemedAffiliate).toBeDefined();
    expect(referralPromotion1.autoApply).toBeDefined();

    expect(referralPromotion2.discountType).toBeDefined();
    expect(referralPromotion2.discountValue).toBeDefined();
    expect(referralPromotion2.type).toBeDefined();
    expect(referralPromotion2.startDate).toBeDefined();
    expect(referralPromotion2.endDate).toBeDefined();
    expect(referralPromotion2.name).toBeDefined();
    expect(referralPromotion2.redemptionLimit).toBeDefined();
    expect(referralPromotion2.upgrades).toBeDefined();
    expect(referralPromotion2.services).toBeDefined();
    expect(referralPromotion2.users).toBeDefined();
    expect(referralPromotion2.days).toBeDefined();
    expect(referralPromotion2.active).toBeDefined();
    expect(referralPromotion2.voucher).toBeDefined();
    expect(referralPromotion2.redeemedAffiliate).toBeDefined();
    expect(referralPromotion2.autoApply).toBeDefined();
  });
  it("should create a new Promotion instance from raw data", () => {
    const raw = {
      id: "promo1",
      discountType: "percentage",
      discountValue: 10,
      type: "product",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-31"),
      name: "New Year Sale",
      redemptionLimit: 100,
      upgrades: ["premium"],
      services: ["delivery"],
      users: ["user1", "user2"],
      days: [1, 2, 3, 4, 5],
      active: true,
      voucher: true,
      redeemedAffiliate: false,
      autoApply: false,
    };

    const promotion = Promotion.from(raw);

    expect(promotion).toBeDefined();
    expect(promotion!.id).toBe("promo1");
    expect(promotion!.discountType).toBe("percentage");
    expect(promotion!.discountValue).toBe(10);
    expect(promotion!.type).toBe("product");
    expect(promotion!.startDate).toEqual(new Date("2024-01-01"));
    expect(promotion!.endDate).toEqual(new Date("2024-01-31"));
    expect(promotion!.name).toBe("New Year Sale");
    expect(promotion!.redemptionLimit).toBe(100);
    expect(promotion!.upgrades).toEqual(["premium"]);
    expect(promotion!.services).toEqual(["delivery"]);
    expect(promotion!.users).toEqual(["user1", "user2"]);
    expect(promotion!.days).toEqual([1, 2, 3, 4, 5]);
    expect(promotion!.active).toBe(true);
    expect(promotion!.voucher).toBe(true);
    expect(promotion!.redeemedAffiliate).toBe(false);
    expect(promotion!.autoApply).toBe(false);
  });

  it("should convert a Promotion instance to raw data", () => {
    const promotion = new Promotion(
      "promo1",
      "percentage",
      10,
      "product",
      new Date("2024-01-01"),
      new Date("2024-01-31"),
      "New Year Sale",
      100,
      ["premium"],
      ["delivery"],
      ["user1", "user2"],
      [1, 2, 3, 4, 5],
      true,
      true,
      false,
      false,
    );

    const raw = Promotion.to(promotion) as Indexable;

    expect(raw).toBeDefined();
    expect(raw.discountType).toBe("percentage");
    expect(raw.discountValue).toBe(10);
    expect(raw.type).toBe("product");
    expect(raw.startDate).toEqual(new Date("2024-01-01"));
    expect(raw.endDate).toEqual(new Date("2024-01-31"));
    expect(raw.name).toBe("New Year Sale");
    expect(raw.redemptionLimit).toBe(100);
    expect(raw.upgrades).toEqual(["premium"]);
    expect(raw.services).toEqual(["delivery"]);
    expect(raw.users).toEqual(["user1", "user2"]);
    expect(raw.days).toEqual([1, 2, 3, 4, 5]);
    expect(raw.active).toBe(true);
    expect(raw.voucher).toBe(true);
    expect(raw.redeemedAffiliate).toBe(false);
    expect(raw.autoApply).toBe(false);
  });

  it("should return null when passed an invalid raw object", () => {
    const raw = {
      id: "123",
      discountType: "invalid",
      discountValue: "invalid",
      type: "invalid",
      startDate: "invalid",
      endDate: "invalid",
      name: "invalid",
      redemptionLimit: "invalid",
      upgrades: "invalid",
      services: "invalid",
      users: "invalid",
      days: "invalid",
      active: "invalid",
      voucher: "invalid",
      redeemedAffiliate: "invalid",
      autoApply: "invalid",
    };
    const result = Promotion.from(raw);
    expect(result).toBeNull();
  });

  it("should add a user to the Promotion instance", () => {
    const promotion = new Promotion(
      "promo1",
      "percentage",
      10,
      "product",
      new Date("2024-01-01"),
      new Date("2024-01-31"),
    );
    const user = user1();

    promotion.addUser(user);

    expect(promotion.users).toBeDefined();
    expect(promotion.users).toContain(user.id);
  });

  it("should not add more if the user existed in the Promotion instance", () => {
    const promotion = new Promotion(
      "promo1",
      "percentage",
      10,
      "product",
      new Date("2024-01-01"),
      new Date("2024-01-31"),
    );
    const user = user1();

    promotion.addUser(user);
    promotion.addUser(user);

    expect(promotion.users).toBeDefined();
    expect(promotion.users.length).toEqual(1);
  });

  it("should add an upgrade to the Promotion instance", () => {
    const promotion = new Promotion(
      "promo1",
      "percentage",
      10,
      "product",
      new Date("2024-01-01"),
      new Date("2024-01-31"),
    );

    promotion.addUpgrade("premium");

    expect(promotion.upgrades).toBeDefined();
    expect(promotion.upgrades).toContain("premium");
  });

  it("should add a service to the Promotion instance", () => {
    const promotion = new Promotion(
      "promo1",
      "percentage",
      10,
      "product",
      new Date("2024-01-01"),
      new Date("2024-01-31"),
    );

    promotion.addService("shipping");

    expect(promotion.services).toBeDefined();
    expect(promotion.services).toContain("shipping");
  });
});
