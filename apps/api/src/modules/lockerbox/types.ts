import type { LocationId } from "@barbaard/types";

export interface GetLockerBoxRequest {
  locationId: LocationId;
  userId: string;
}
