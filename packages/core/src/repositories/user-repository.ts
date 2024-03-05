import { User } from "../entities/user.js";
import type { IRepository } from "./irepository.js";

export abstract class UserRepository implements IRepository {
  get id(): string {
    return "/users";
  }
  get type(): string {
    return User.name;
  }
  abstract get(userId: string): Promise<[boolean, User | null]>;
  abstract getByAffiliateCode(code: string): Promise<[boolean, User | null]>;
  abstract update(user: User): Promise<[boolean, string]>;
}
