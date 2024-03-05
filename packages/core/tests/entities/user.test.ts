import {
  AffiliateCode,
  UserReferent,
  User,
  Indexable,
} from "../../src/index.js";
import { describe, expect, it } from "vitest";

describe("User", () => {
  const email = "test@example.com";
  const affiliateCode = new AffiliateCode("ACACAC");
  const referral: UserReferent = {};
  const user = new User([affiliateCode], "test-id", undefined, "test-fullname");

  user.email = email;
  describe("constructor", () => {
    it("should create a new user object", () => {
      expect(user).toBeInstanceOf(User);
    });
  });

  describe("from", () => {
    it("should create a new user object from raw data", () => {
      const raw = {
        email: email,
        affiliateCodes: [affiliateCode.value],
        id: "test-id",
        fullName: "test-fullname",
        referrer: referral,
        referrals: [referral],
        barbershop: {
          lastAppointment: new Date(),
          lastBarber: "",
          averageDays: 0,
          totalNoShows: 0,
          expressHaircut: true,
          appointmentsLate: 9,
          expressBeardTrim: true,
          totalAppointments: 0,
          appointmentsOnTime: 0,
          averageDaysPerAppointment: 0,
        },
      };
      const newUser = User.from(raw);
      expect(newUser).toBeInstanceOf(User);
      expect(newUser?.email).toEqual(email);
      expect(newUser?.affiliateCodes).toEqual([affiliateCode]);
      expect(newUser?.id).toBe("test-id");
      expect(newUser?.fullName).toBe("test-fullname");
      expect(newUser?.referrer).toEqual(referral);
      expect(newUser?.referrals).toEqual([referral]);
      expect(newUser?.barbershop?.lastAppointment).toBeInstanceOf(Date);
    });

    it("should return null if the raw data is invalid", () => {
      const raw = {
        email: "",
        affiliateCodes: [affiliateCode],
        id: "test-id",
      };
      const newUser = User.from(raw);
      expect(newUser).toBeNull();
    });
  });

  describe("to", () => {
    it("should return an object with user data", () => {
      const userData = User.to(user);
      expect(userData).toEqual({
        email: "test@example.com",
        firstName: undefined,
        fullName: "test-fullname",
        lastName: undefined,
        affiliateCodes: [affiliateCode.value],
        referrer: undefined,
        referrals: undefined,
        barbershop: undefined,
      });
    });

    it("should return an object with undefined email property when user._email is undefined", () => {
      const userData = User.to(user);
      const newUser = User.from({ ...userData, email: undefined })!;
      expect(newUser?.email).toBeUndefined();
    });

    it("should return an empty array affiliateCodes property when user._affiliateCodes is undefined", () => {
      const userData = User.to(user);
      const newUser = User.from({ ...userData, affiliateCodes: undefined })!;
      newUser.affiliateCodes = [];
      const userNewData = User.to(newUser);
      const newnewUser = User.from(userNewData as Indexable)!;
      expect(newnewUser?.affiliateCodes).toEqual([]);
    });

    it("should return an object empty array  affiliateCodes property when user._affiliateCodes is empty", () => {
      const userData = User.to(user);
      const newUser = User.from({ ...userData, affiliateCodes: [] })!;
      expect(newUser?.affiliateCodes).toEqual([]);
    });

    it("should return an object with undefined referrals property when user._referrals is undefined", () => {
      const userData = User.to(user);
      const newUser = User.from({ ...userData, referrals: undefined })!;

      expect(newUser.referrals).toBeUndefined();
    });
  });

  describe("addAffiliateCode", () => {
    it("should add a new affiliate code to the user", () => {
      const newAffiliateCode = new AffiliateCode("AAAAAA");
      user.addAffiliateCode(newAffiliateCode);
      expect(user.hasAffiliateCode(newAffiliateCode)).toBe(true);
    });

    it("should not add an existing affiliate code to the user", () => {
      user.addAffiliateCode(affiliateCode);
      expect(user.affiliateCodes.length).toBe(2);
    });
  });

  describe("removeAffiliateCode", () => {
    it("should remove an affiliate code from the user", () => {
      user.removeAffiliateCode(affiliateCode);
      expect(user.hasAffiliateCode(affiliateCode)).toBe(false);
      user.addAffiliateCode(affiliateCode);
    });
  });

  describe("hasAffiliateCode", () => {
    it("should return true if the user has the affiliate code", () => {
      expect(user.hasAffiliateCode(affiliateCode)).toBe(true);
    });

    it("should return false if the user does not have the affiliate code", () => {
      const newAffiliateCode = new AffiliateCode("ACAAAA");
      expect(user.hasAffiliateCode(newAffiliateCode)).toBe(false);
    });
  });

  describe("addReferral", () => {
    it("should add a new referral to the user", () => {
      user.addReferral(referral);
      expect(user.referrals?.length).toBe(1);
    });
  });

  describe("isNewComer", () => {
    it("should return true if the user is a newcomer", () => {
      expect(user.isNewComer).toBe(true);
    });

    it("should return false if the user is not a newcomer", () => {
      user.barbershop = {
        lastAppointment: new Date(),
        lastBarber: "",
        averageDays: 0,
        totalNoShows: 0,
        expressHaircut: true,
        appointmentsLate: 9,
        expressBeardTrim: true,
        totalAppointments: 0,
        appointmentsOnTime: 0,
        averageDaysPerAppointment: 0,
      };
      expect(user.isNewComer).toBe(false);
    });
  });
  it("should set id correctly", () => {
    user.id = "123";
    expect(user.id).toBe("123");
  });

  it("should set email correctly", () => {
    user.email = "test1@example.com";
    expect(user.email).toBe("test1@example.com");
  });

  it("should add referral correctly", () => {
    const referral: UserReferent = {
      id: "123",
      code: "AABBCC",
      date: new Date(),
      userName: "foobar",
    };
    user.addReferral(referral);
    expect(user.referrals).toContain(referral);
  });

  it("should add referral to empty referrals array", () => {
    const userData = User.to(user);
    const newUser = User.from({ ...userData, referrals: undefined })!;
    const referral: UserReferent = {
      id: "123",
      code: "AABBCC",
      date: new Date(),
      userName: "foobar",
    };

    newUser.addReferral(referral);
    expect(newUser.referrals).toEqual([referral]);
  });
  it("should set and get firstName", () => {
    user.firstName = "John";
    expect(user.firstName).to.equal("John");
  });

  it("should set and get lastName", () => {
    user.lastName = "Doe";
    expect(user.lastName).to.equal("Doe");
  });
});
