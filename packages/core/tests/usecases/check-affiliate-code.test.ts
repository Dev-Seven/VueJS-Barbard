import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  CheckAffiliateCodeUsecase,
  UserRepository,
  ITransactionInterpreter,
  User,
  Promotion,
  AffiliateCode,
} from "../../src/index.js";

vi.mock("User"); // Mock User class for easy object creation
vi.mock("AffiliateCode"); // Mock AffiliateCode class
vi.mock("Promotion"); // Mock Promotion class
vi.mock("ITransactionInterpreter"); // Mock transaction interpreter

describe("CheckAffiliateCodeUsecase", () => {
  let usecase: CheckAffiliateCodeUsecase;

  const user1 = () => new User([], "404", "test@test.com", "John Doe");
  const user2 = () =>
    new User([new AffiliateCode("AAAAAA")], "401", "test@test.com", "Jane Doe");
  const promo = () =>
    new Promotion("1", "money", 1, "sale", new Date(), new Date());
  const mockUserRepository: UserRepository = {
    id: "user",
    type: User.name,
    get: async (u) => (u ? [true, user1()] : [false, null]),
    getByAffiliateCode: async (code) =>
      code ? [true, user2()] : [false, null],
    update: async () => [true, ""],
  };

  const mockInterpreter: ITransactionInterpreter = {
    addRepository: () => {},
    run: async (ops) =>
      ops.childType ? [true, []] : [false, ["transaction failed"]],
  };

  beforeEach(() => {
    usecase = new CheckAffiliateCodeUsecase(
      mockUserRepository,
      mockInterpreter,
    );
  });

  describe("updateReferrerData", () => {
    it("should add a new referral if the recipient is not already a referral", () => {
      const user = user1();
      const recipient = user2();
      const code = "ABC123";
      const refPromotion = promo();

      const updatedUser = usecase.updateReferrerData(
        user,
        recipient,
        code,
        refPromotion,
      );

      expect(updatedUser.referrals).toEqual([
        {
          code: code,
          id: recipient.id,
          date: refPromotion.startDate,
          userName: recipient.fullName,
        },
      ]);
    });

    it("should not add a referral if the recipient is already in the referrals list", () => {
      const user = user1();
      const recipient = user2();
      user.addReferral(recipient);
      const code = "ABC123";
      const refPromotion = promo();

      const updatedUser = usecase.updateReferrerData(
        user,
        recipient,
        code,
        refPromotion,
      );

      expect(updatedUser.referrals?.length).toEqual(1); // No changes
    });

    it("should handle cases where user.referrals is undefined", () => {
      const user = user1(); // No referrals initially
      const recipient = user2();
      const code = "ABC123";
      const refPromotion = promo();

      const updatedUser = usecase.updateReferrerData(
        user,
        recipient,
        code,
        refPromotion,
      );

      expect(updatedUser.referrals).toEqual([
        {
          code: code,
          id: recipient.id,
          date: refPromotion.startDate,
          userName: recipient.fullName,
        },
      ]);
    });
  });

  describe("updateReferreeData", () => {
    it("should set referrer data if the user has no referrer", () => {
      const user = user1();
      const referrer = user2();
      const code = "ABC123";
      const recPromotion = promo();

      const updatedUser = usecase.updateReferreeData(
        user,
        referrer,
        code,
        recPromotion,
      );

      expect(updatedUser.referrer).toEqual({
        code: code,
        id: referrer.id,
        date: recPromotion.startDate,
        userName: referrer.fullName,
      });
    });

    it("should not overwrite existing referrer data", () => {
      const user = user1(); // Already has a referrer
      user.referrer = user1();
      const oldId = user.referrer.id;
      const referrer = user2();
      const code = "ABC123";
      const recPromotion = promo();

      const updatedUser = usecase.updateReferreeData(
        user,
        referrer,
        code,
        recPromotion,
      );

      expect(updatedUser.referrer?.id).toEqual(oldId); // No changes
    });
  });

  describe("performUpdate", () =>
    it("should create promotions and update user data within a transaction", async () => {
      const refPromotion = promo();
      const recPromotion = promo();
      const referrer = user1();
      const recipient = user2();
      const code = "ABC123";

      const result = await usecase.performUpdate(
        refPromotion,
        recPromotion,
        referrer,
        recipient,
        code,
      );

      expect(result).toEqual([true, []]);
    }));

  describe("execute", () => {
    it("should return an error for invalid affiliate code", async () => {
      const errors = await usecase.execute("userId", "code");
      expect(errors.join()).toContain("affilate code");
    });

    it("should successfully apply referral code and create promotions", async () => {
      const errors = await usecase.execute("userId", "AAAAAA");
      expect(errors).toHaveLength(0); // No errors expected
    });

    it("should return an error if the user is not found", async () => {
      const code = "AAAAAA";

      const result = await usecase.execute("", code);
      expect(result).toContain("user not found");
    });

    it("should return an error if the user is not a newcomer", async () => {
      const code = "AAAAAA";
      const tuser = user1();
      tuser.barbershop = {
        lastBarber: "",
        averageDays: 3,
        totalNoShows: 0,
        expressHaircut: false,
        lastAppointment: new Date(),
        totalAppointments: 9,
        averageDaysPerAppointment: 3,
        appointmentsLate: 7,
        expressBeardTrim: true,
        appointmentsOnTime: 7,
      };
      const mockUserRepository1: UserRepository = {
        id: "user",
        type: User.name,
        update: async () => [true, ""],

        get: async (u) => (u ? [true, tuser] : [false, null]),
        getByAffiliateCode: async () => [true, user2()],
      };

      const usecase1 = new CheckAffiliateCodeUsecase(
        mockUserRepository1,
        mockInterpreter,
      );
      const result = await usecase1.execute("userId", code);
      expect(result).toContain("not a newcomer");
    });

    it("should return an error if the referrer does not have that code", async () => {
      const code = "AAAAAA";
      const mockUserRepository1: UserRepository = {
        id: "user",
        type: User.name,

        update: async () => [true, ""],
        get: async (u) => (u ? [true, user1()] : [false, null]),
        getByAffiliateCode: async () => [true, user1()],
      };

      const usecase1 = new CheckAffiliateCodeUsecase(
        mockUserRepository1,
        mockInterpreter,
      );
      const result = await usecase1.execute("userId", code);
      expect(result).toContain("invalid code");
    });

    it("should return an error if the referral code is already applied", async () => {
      const code = "AAAAAA";
      const tuser = user1();
      tuser.referrer = user1();
      const mockUserRepository1: UserRepository = {
        id: "user",
        type: User.name,
        update: async () => [true, ""],

        get: async (u) => (u ? [true, tuser] : [false, null]),
        getByAffiliateCode: async () => [true, user2()],
      };

      const usecase1 = new CheckAffiliateCodeUsecase(
        mockUserRepository1,
        mockInterpreter,
      );
      const result = await usecase1.execute("userId", code);
      expect(result.join(" ")).toContain("referral code");
    });
    it("should return an error if the referral code is already applied", async () => {
      const code = "AAAAAA";
      const tuser = user1();
      tuser.referrer = user1();
      const mockUserRepository1: UserRepository = {
        id: "user",
        type: User.name,
        update: async () => [true, ""],

        get: async (u) => (u ? [true, tuser] : [false, null]),
        getByAffiliateCode: async () => [true, user2()],
      };

      const usecase1 = new CheckAffiliateCodeUsecase(
        mockUserRepository1,
        mockInterpreter,
      );
      const result = await usecase1.execute("userId", code);
      expect(result.join(" ")).toContain("referral code");
    });

    it("should return an error if the user with the provided affiliate code is not found", async () => {
      const code = "AAAAAA";
      const mockUserRepository1: UserRepository = {
        id: "user",
        type: User.name,
        update: async () => [true, ""],
        get: async (u) => (u ? [true, user1()] : [false, null]),
        getByAffiliateCode: async () => [false, null],
      };

      const usecase1 = new CheckAffiliateCodeUsecase(
        mockUserRepository1,
        mockInterpreter,
      );

      const result = await usecase1.execute("userId", code);
      expect(result).toContain(
        "cannot find the user with the provided affiliatecode",
      );
    });

    it("should return an error if the transaction fail", async () => {
      const code = "AAAAAA";
      const usecase1 = new CheckAffiliateCodeUsecase(mockUserRepository, {
        addRepository: () => {},
        run: async () => [false, ["transaction failed"]],
      });

      const result = await usecase1.execute("userId", code);
      expect(result).toContain("failed to process the action");
    });
  });
});
