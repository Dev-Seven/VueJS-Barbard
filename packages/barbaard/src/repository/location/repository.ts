import { Repository } from "../type.js";
import type { BarBaardLocation } from "./type.js";

export class LocationRepository extends Repository<BarBaardLocation> {
  static COLLECTION_NAME = "locations";
  getCollectionPath(): string {
    return LocationRepository.COLLECTION_NAME;
  }
}
