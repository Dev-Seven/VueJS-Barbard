import { PromotionRepository } from "../../src/index.js";
import { describe, expect, it, beforeEach } from "vitest";

class MockPromotionRepository extends PromotionRepository {}
describe("PromotionRepository", () => {
  let repository: PromotionRepository;

  beforeEach(() => {
    repository = new MockPromotionRepository();
  });

  it("should have an id of '/promotions'", () => {
    expect(repository.id).toBe("/promotions");
  });

  it("should have a type of 'Promotion'", () => {
    expect(repository.type).toBe("Promotion");
  });
});
