import { User, UserRepository } from "../../src/index.js";
import { describe, expect, it, beforeEach } from "vitest";

class MockUserRepository extends UserRepository {
  update(): Promise<[boolean, string]> {
    throw new Error("Method not implemented.");
  }
  get(): Promise<[boolean, User | null]> {
    throw new Error("Method not implemented.");
  }
  getByAffiliateCode(): Promise<[boolean, User | null]> {
    throw new Error("Method not implemented.");
  }
}
describe("UserRepository", () => {
  let repository: UserRepository;

  beforeEach(() => {
    repository = new MockUserRepository();
  });

  it("should have an id of '/users'", () => {
    expect(repository.id).toBe("/users");
  });

  it("should have a type of 'User'", () => {
    expect(repository.type).toBe("User");
  });
});
