import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  CreateAffiliateCodeUsecase,
  UserRepository,
  User,
  IMessageChannel,
  AffiliateCode,
} from "../../src/index.js";

vi.mock("User"); // Mock User class for easy object creation
vi.mock("IMessageChannel"); // Mock transaction interpreter

describe("CreateAffiliateCodeUsecase", () => {
  let createAffiliateCodeUsecase: CreateAffiliateCodeUsecase;

  const user = () => new User([], "404", "test@test.com", "John Doe");
  const userRepository: UserRepository = {
    id: "user",
    type: User.name,
    get: vi.fn(),
    update: vi.fn(),
    getByAffiliateCode: vi.fn(),
  };
  const messageChannel: IMessageChannel = {
    send: async (code: string) => !!code,
  };

  beforeEach(() => {
    createAffiliateCodeUsecase = new CreateAffiliateCodeUsecase(
      userRepository,
      messageChannel,
    );
  });

  it("should return validation errors if the code is invalid", async () => {
    const userId = "user-id";
    const code = "invalid-code";
    const expectedErrors = [];
    AffiliateCode.isValidated = vi
      .fn()
      .mockReturnValue([false, expectedErrors]);

    const result = await createAffiliateCodeUsecase.execute(userId, code);

    expect(result).toEqual(expectedErrors);
    expect(AffiliateCode.isValidated).toHaveBeenCalledWith(code);
  });

  it("should return affiliate code already used error if the code is already used", async () => {
    const userId = "user-id";
    const code = "valid-code";
    const expectedErrors = ["affiliate code: already used"];
    AffiliateCode.isValidated = vi.fn().mockReturnValue([true, []]);
    createAffiliateCodeUsecase.isAffiliateCodeExisted = vi
      .fn()
      .mockResolvedValue(true);

    userRepository.get = vi.fn().mockResolvedValue([true, user()]);
    userRepository.update = vi.fn().mockResolvedValue([true, null]);

    const result = await createAffiliateCodeUsecase.execute(userId, code);

    expect(result).toEqual(expectedErrors);
    expect(
      createAffiliateCodeUsecase.isAffiliateCodeExisted,
    ).toHaveBeenCalledWith(new AffiliateCode(code));
  });

  it("should return user not found error if the user is not found", async () => {
    const userId = "user-id";
    const code = "valid-code";
    const expectedErrors = ["user not found"];
    AffiliateCode.isValidated = vi.fn().mockReturnValue([true, []]);
    createAffiliateCodeUsecase.isAffiliateCodeExisted = vi
      .fn()
      .mockResolvedValue(false);
    userRepository.get = vi.fn().mockResolvedValue([false, null]);

    const result = await createAffiliateCodeUsecase.execute(userId, code);

    expect(result).toEqual(expectedErrors);
    expect(userRepository.get).toHaveBeenCalledWith(userId);
  });

  it("should return failed to add the affiliate error if the affiliate code is not added", async () => {
    const userId = "user-id";
    const code = "valid-code";
    const expectedErrors = ["failed to add the affiliate"];
    AffiliateCode.isValidated = vi.fn().mockReturnValue([true, []]);
    createAffiliateCodeUsecase.isAffiliateCodeExisted = vi
      .fn()
      .mockResolvedValue(false);
    userRepository.get = vi.fn().mockResolvedValue([true, user()]);
    userRepository.update = vi.fn().mockResolvedValue([false, null]);

    const result = await createAffiliateCodeUsecase.execute(userId, code);

    expect(result).toEqual(expectedErrors);
    expect(userRepository.update).toHaveBeenCalledWith(expect.any(User));
  });

  it("should return validation errors if the code is invalid", async () => {
    const userId = "user-id";
    const code = "valid-code";
    const expectedErrors = [];
    AffiliateCode.isValidated = vi.fn().mockReturnValue([true, []]);
    createAffiliateCodeUsecase.isAffiliateCodeExisted = vi
      .fn()
      .mockResolvedValue(false);
    userRepository.get = vi.fn().mockResolvedValue([true, user()]);
    userRepository.update = vi.fn().mockResolvedValue([true, null]);
    messageChannel.send = vi.fn().mockResolvedValue(true);

    const result = await createAffiliateCodeUsecase.execute(userId, code);

    expect(result).toEqual(expectedErrors);
    expect(userRepository.update).toHaveBeenCalledWith(expect.any(User));
    expect(messageChannel.send).toHaveBeenCalledWith(expect.any(String));
  });

  it("should assign the affiliate code to the user and send a message", async () => {
    const code = "valid-code";
    const u = new User([], "404", "test@test.com");

    userRepository.get = vi.fn().mockResolvedValueOnce([true, u]);
    userRepository.update = vi.fn().mockResolvedValueOnce([true]);
    createAffiliateCodeUsecase.isAffiliateCodeExisted = vi
      .fn()
      .mockResolvedValueOnce(false);

    messageChannel.send = vi.fn().mockResolvedValueOnce(true);

    await createAffiliateCodeUsecase.execute(u.id, code);
    expect(messageChannel.send).toHaveBeenCalledWith(
      "Affilate code valid-code was assigned to user First Name Not Found Last Name Not Found - id 404 - current affiliate codes: valid-code",
    );
  });

  it("should correctly determine if an affiliate code exists", async () => {
    const code = new AffiliateCode("test-code");

    // Test for code existence
    userRepository.getByAffiliateCode = vi
      .fn()
      .mockResolvedValueOnce([false, null]);
    expect(await createAffiliateCodeUsecase.isAffiliateCodeExisted(code)).toBe(
      false,
    );

    // Test for code non-existence
    userRepository.getByAffiliateCode = vi
      .fn()
      .mockResolvedValueOnce([true, {}]);
    expect(await createAffiliateCodeUsecase.isAffiliateCodeExisted(code)).toBe(
      true,
    );
  });
});
