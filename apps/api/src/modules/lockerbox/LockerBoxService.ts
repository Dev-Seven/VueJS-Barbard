import { LockerBoxRepository } from "./LockerBoxRepository.js";
import type { GetLockerBoxRequest } from "./types.js";

export class LockerBoxService {
  constructor(private locatorBoxRepository: LockerBoxRepository) {}

  async getActiveLockerBox(request: GetLockerBoxRequest) {
    return this.locatorBoxRepository.getActiveLockerBoxByUserId(
      request.locationId,
      request.userId,
    );
  }
}
