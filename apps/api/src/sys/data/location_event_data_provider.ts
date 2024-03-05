import {
  ErrorOr,
  isLocationEvent,
  type LocationEvent,
  type LocationId,
  type Repository,
} from "@barbaard/types";
import { DataProvider } from "./types.js";
import LocationEventRepository from "@barbaard/types/lib/src/repository/location/collections/event/repository.js";

export class LocationEventDataProvider extends DataProvider<LocationEvent> {
  static CACHED_PATH_HN = LocationEventRepository.COLLECTION_NAME + "hn";
  static CACHED_PATH_HCM = LocationEventRepository.COLLECTION_NAME + "hcmc";

  constructor(
    repo: Repository<LocationEvent>,
    private where: LocationId,
  ) {
    super(repo);
  }
  protected scope(): string {
    return `LocationEventDataProvider: ${this.where}`;
  }

  async fetchEventByUserId(uid: string): Promise<ErrorOr<LocationEvent[]>> {
    return this.repository.query((c) =>
      c
        .where("userId", "==", uid)
        .get()
        .then(
          (ds) => {
            try {
              return ErrorOr.pure(
                ds.docs
                  .filter((r) => isLocationEvent(r.data()))
                  .map((a) => a.data() as LocationEvent),
              );
            } catch (e) {
              return this.raiseError("fetchEventByUser", "casting", e);
            }
          },
          (e) => this.raiseError("fetchEventByUser", "firestore", e),
        ),
    );
  }
}
