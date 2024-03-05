import type { LocationId } from "../../../../locations.js";
import { Repository } from "../../../type.js";
import { LocationRepository } from "../../repository.js";
import type { LocationEvent } from "./type.js";

export default class LocationEventRepository extends Repository<LocationEvent> {
  static COLLECTION_NAME = "events";
  constructor(
    store: FirebaseFirestore.Firestore,
    private locationID: LocationId,
  ) {
    super(store);
  }

  getCollectionPath(): string {
    return `${LocationRepository.COLLECTION_NAME}/${this.locationID}/${LocationEventRepository.COLLECTION_NAME}`;
  }
}
