import { Promotion, type IRepository } from "../index.js";

export abstract class PromotionRepository implements IRepository {
  get id(): string {
    return "/promotions";
  }
  get type(): string {
    return Promotion.name;
  }
}
