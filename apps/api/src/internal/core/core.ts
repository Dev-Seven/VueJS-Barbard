import { UserRepository } from "@barbaard/types";
import { AppUserCore } from "./app_user/app_user.js";
import data from "../../sys/data/data.js";
import type { UserDataProvider } from "../../sys/data/user_data_provider.js";

export default {
  userCore: (): AppUserCore =>
    (cached.has(UserRepository.COLLECTION_NAME)
      ? cached.get(UserRepository.COLLECTION_NAME)
      : cached
          .set(
            UserRepository.COLLECTION_NAME,
            new AppUserCore(data.userDataProvider() as UserDataProvider),
          )
          .get(UserRepository.COLLECTION_NAME)) as AppUserCore,
};

const cached: Map<string, object> = new Map();
