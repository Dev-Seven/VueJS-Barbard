import { Repository } from "../type.js";
import type { Promotion } from "./type.js";

export class PromotionRepository extends Repository<Promotion> {
  static readonly COLLECTION_NAME = "promotions";

  getCollectionPath(): string {
    return PromotionRepository.COLLECTION_NAME;
  }
}
