import { describe, vi, assert, test, it, expect } from "vitest";
import {
  UserRepository,
  User,
  AffiliateCode,
  DeleteAffiliateCodeUsecase,
} from "../../src/index.js";

vi.mock("User"); // Mock User class for easy object creation
vi.mock("IMessageChannel"); // Mock transaction interpreter

describe("DeleteAffiliateCodeUsecase", () => {
  const user = () => new User([], "404", "test@test.com", "John Doe");

  test("execute() should return an empty array if the affiliate code is valid and not used", async () => {
    const u = user();
    AffiliateCode.isValidated = vi.fn().mockReturnValueOnce([true, []]);

    u.affiliateCodes = [new AffiliateCode("valid-code")];
    const userRepository: UserRepository = {
      get: async () => {
        return [true, u];
      },
      update: async () => {
        return [true, ""];
      },
      getByAffiliateCode: vi.fn(),
      id: "",
      type: "",
    };
    AffiliateCode.isValidated = vi.fn().mockReturnValue([true, []]);
    const messageChannel = {
      async send() {
        return true;
      },
    };
    const usecase = new DeleteAffiliateCodeUsecase(
      userRepository,
      messageChannel,
    );
    const result = await usecase.execute("user-id", "valid-code");
    assert.deepEqual(result, []);
  });

  test("execute() should return an array with an error message if the affiliate code is invalid", async () => {
    AffiliateCode.isValidated = vi
      .fn()
      .mockReturnValue([false, ["Invalid affiliate code"]]);
    const userRepository: UserRepository = {
      get: async () => {
        return [true, user()];
      },
      update: async () => {
        return [true, ""];
      },
      type: "",
      id: "",
      getByAffiliateCode: vi.fn(),
    };
    const messageChannel = {
      send: async () => {
        return true;
      },
    };

    const usecase = new DeleteAffiliateCodeUsecase(
      userRepository,
      messageChannel,
    );
    const result = await usecase.execute("user-id", "invalid-code");
    assert.deepEqual(result, ["Invalid affiliate code"]);
  });

  test("execute() should return an array with an error message if the user is not found", async () => {
    const userRepository: UserRepository = {
      get: async () => {
        return [false, null];
      },
      update: async () => {
        return [true, ""];
      },
      getByAffiliateCode: vi.fn(),
      type: "",
      id: "",
    };
    const messageChannel = {
      async send() {
        return true;
      },
    };
    const usecase = new DeleteAffiliateCodeUsecase(
      userRepository,
      messageChannel,
    );
    AffiliateCode.isValidated = vi.fn().mockReturnValue([true, []]);
    const result = await usecase.execute("user-id", "valid-code");
    assert.deepEqual(result, ["user not found"]);
  });

  test("execute() should return an array with an error message if the code is not found", async () => {
    const userRepository: UserRepository = {
      get: async () => {
        return [true, user()];
      },
      update: async () => {
        return [true, ""];
      },
      getByAffiliateCode: vi.fn(),
      type: "",
      id: "",
    };
    const messageChannel = {
      async send() {
        return true;
      },
    };
    const usecase = new DeleteAffiliateCodeUsecase(
      userRepository,
      messageChannel,
    );
    AffiliateCode.isValidated = vi.fn().mockReturnValue([true, []]);
    const result = await usecase.execute("user-id", "valid-code");
    assert.deepEqual(result, [
      "affiliate code: valid-code does not exist on the user: John Doe",
    ]);
  });

  test("execute() should return an array with an error message if the affiliate deletion fails", async () => {
    const u = user();
    u.affiliateCodes = [new AffiliateCode("valid-code")];
    const userRepository: UserRepository = {
      get: async () => {
        return [true, u];
      },
      update: async () => {
        return [false, ""];
      },
      id: "",
      type: "",
      getByAffiliateCode: vi.fn(),
    };
    const messageChannel = {
      async send() {
        return true;
      },
    };
    const usecase = new DeleteAffiliateCodeUsecase(
      userRepository,
      messageChannel,
    );
    AffiliateCode.isValidated = vi.fn().mockReturnValue([true, []]);
    const result = await usecase.execute("user-id", "valid-code");
    assert.deepEqual(result, ["failed to delete the affiliate"]);
  });

  it("should assign the affiliate code to the user and send a message", async () => {
    const code = "test-code";
    const u = new User([new AffiliateCode(code)], "404", "test@test.com");
    const userRepository: UserRepository = {
      get: async () => {
        return [true, user()];
      },
      update: async () => {
        return [false, ""];
      },
      id: "",
      type: "",
      getByAffiliateCode: vi.fn(),
    };
    const messageChannel = {
      async send() {
        return true;
      },
    };
    const usecase = new DeleteAffiliateCodeUsecase(
      userRepository,
      messageChannel,
    );

    userRepository.get = vi.fn().mockResolvedValueOnce([true, u]);
    userRepository.update = vi.fn().mockResolvedValueOnce([true]);
    messageChannel.send = vi.fn().mockResolvedValueOnce(true);

    await usecase.execute(u.id, code);
    expect(messageChannel.send).toHaveBeenCalledWith(
      "Affilate code test-code was deleted from user First Name Not Found Last Name Not Found - id 404 - current affiliate codes: ",
    );
  });
});
