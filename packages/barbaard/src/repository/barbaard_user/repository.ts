import { Repository } from "../type.js";
import type { BarbaardUser } from "./type.js";

export class UserRepository extends Repository<BarbaardUser> {
  static readonly COLLECTION_NAME = "users";

  getCollectionPath(): string {
    return UserRepository.COLLECTION_NAME;
  }
}
