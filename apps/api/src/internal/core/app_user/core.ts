import { ErrorOr } from "@barbaard/types";
import type { AppUser, AppUserUpdatePayload, AppUserWithId } from "./types.js";
import types from "./types.js";
import type {
  BarbaardUserWithId,
  UserDataProvider,
} from "../../../sys/data/user_data_provider.js";
import dto from "../dto.js";

export class AppUserCore {
  constructor(private uprovider: UserDataProvider) {}

  async create(data: AppUser): Promise<ErrorOr<AppUserWithId>> {
    return (
      await types.fromDto(data).bimap<Promise<ErrorOr<BarbaardUserWithId>>>(
        async (e) =>
          ErrorOr.raiseError("appUserCore", "create", "invoke fromDto", e),
        async (dao) => await this.uprovider.create(dao),
      )
    ).map(([id, dao]) => [id, types.toDto(dao)]);
  }

  async update(
    id: string,
    payload: AppUserUpdatePayload,
  ): Promise<ErrorOr<FirebaseFirestore.Timestamp>> {
    return this.uprovider.update(id, dto.fromDto(payload).getOrNull() ?? {});
  }

  async get(id: string): Promise<ErrorOr<AppUser>> {
    return (await this.uprovider.get(id)).map(types.toDto);
  }

  async getUserByWpId(wpId: number): Promise<ErrorOr<AppUserWithId>> {
    return (await this.uprovider.getUserByWpId(wpId)).map(([id, bu]) => [
      id,
      types.toDto(bu),
    ]);
  }

  async getUserByBooklyUserId(
    booklyUserId: number,
  ): Promise<ErrorOr<AppUserWithId>> {
    return (await this.uprovider.getUserByBooklyUserId(booklyUserId)).map(
      ([id, bu]) => [id, types.toDto(bu)],
    );
  }

  async getUserByPhone(phone: string): Promise<ErrorOr<AppUserWithId>> {
    return (await this.uprovider.getUserByPhone(phone)).map(([id, bu]) => [
      id,
      types.toDto(bu),
    ]);
  }

  async getUserByAffiliateCode(code: string): Promise<ErrorOr<AppUserWithId>> {
    return (await this.uprovider.getUserByAffiliateCode(code)).map(
      ([id, bu]) => [id, types.toDto(bu)],
    );
  }

  async getUserByLastAppoitment(
    from: FirebaseFirestore.Timestamp,
    to: FirebaseFirestore.Timestamp,
  ): Promise<ErrorOr<AppUserWithId[]>> {
    return (await this.uprovider.getCustomersByLastAppointment(from, to)).map(
      (bus) => bus.map(([id, bu]) => [id, types.toDto(bu)]),
    );
  }
}
