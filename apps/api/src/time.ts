import { utcToZonedTime } from "date-fns-tz";

export enum TimeZone {
  Default = "Asia/Ho_Chi_Minh",
}

export const getZoneTime = (date: Date, zone: TimeZone = TimeZone.Default) => {
  return utcToZonedTime(date, zone);
};
