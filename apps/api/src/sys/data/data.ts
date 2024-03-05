import { PromotionRepository, UserRepository } from "@barbaard/types";
import { getFirestore } from "firebase-admin/firestore";
import { UserDataProvider } from "./user_data_provider.js";
import { LocationEventDataProvider } from "./location_event_data_provider.js";
import LocationEventRepository from "@barbaard/types/lib/src/repository/location/collections/event/repository.js";
import { PromotionDataProvider } from "./promotion_data_provider.js";

export default {
  userDataProvider: (): UserDataProvider =>
    (cached.has(UserRepository.COLLECTION_NAME)
      ? cached.get(UserRepository.COLLECTION_NAME)
      : cached
          .set(
            UserRepository.COLLECTION_NAME,
            new UserDataProvider(new UserRepository(getFirestore())),
          )
          .get(UserRepository.COLLECTION_NAME)) as UserDataProvider,
  hanoiEventDataProvider: (): LocationEventDataProvider =>
    (cached.has(LocationEventDataProvider.CACHED_PATH_HN)
      ? cached.get(LocationEventDataProvider.CACHED_PATH_HN)
      : cached
          .set(
            LocationEventDataProvider.CACHED_PATH_HN,
            new LocationEventDataProvider(
              new LocationEventRepository(getFirestore(), "hanoi"),
              "hanoi",
            ),
          )
          .get(
            LocationEventDataProvider.CACHED_PATH_HN,
          )) as LocationEventDataProvider,
  hcmEventDataProvider: (): LocationEventDataProvider =>
    (cached.has(LocationEventDataProvider.CACHED_PATH_HCM)
      ? cached.get(LocationEventDataProvider.CACHED_PATH_HCM)
      : cached
          .set(
            LocationEventDataProvider.CACHED_PATH_HN,
            new LocationEventDataProvider(
              new LocationEventRepository(getFirestore(), "hcmc"),
              "hcmc",
            ),
          )
          .get(
            LocationEventDataProvider.CACHED_PATH_HN,
          )) as LocationEventDataProvider,

  promotionDateProvider: (): PromotionDataProvider =>
    (cached.has(PromotionRepository.COLLECTION_NAME)
      ? cached.get(PromotionRepository.COLLECTION_NAME)
      : cached
          .set(
            PromotionRepository.COLLECTION_NAME,
            new PromotionDataProvider(new PromotionRepository(getFirestore())),
          )
          .get(PromotionRepository.COLLECTION_NAME)) as PromotionDataProvider,
};

const cached: Map<string, object> = new Map();
