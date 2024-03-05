import { capitalize as cap } from "lodash";
import { parse } from "date-fns";
import firebase from "firebase-admin";

export const capitalize = (val: string = "") =>
  val
    .split(" ")
    .map((v) => cap(v))
    .join(" ");

export const dateToFsTimestamp = (val: Date) => {
  try {
    return FirebaseFirestore.Timestamp.fromDate(val);
  } catch (err) {
    return undefined;
  }
};

export const removeDiacritics = (str: string): string => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const parseDate = (birthDay: string) => {
  if (birthDay.indexOf("/") >= 0) {
    if (Number(birthDay.split("/")[1]) >= 13) {
      return parse(birthDay, "MM/dd/yyyy", new Date());
    }
    return parse(birthDay, "dd/MM/yyyy", new Date());
  } else if (/^\d+$/.test(birthDay)) {
    return parse(birthDay, "yyyyMMdd", new Date());
  }
  return new Date(birthDay);
};

export const parseTimestamp = (birthDay: string) => {
  if (birthDay.indexOf("/") >= 0) {
    if (Number(birthDay.split("/")[1]) >= 13) {
      return parse(birthDay, "MM/dd/yyyy hh:mm a", new Date());
    }
    return parse(birthDay, "dd/MM/yyyy hh:mm a", new Date());
  } else if (/^\d+$/.test(birthDay)) {
    return parse(birthDay, "yyyyMMdd", new Date());
  }
  return new Date(birthDay);
};

export function getLocationByWordpressId(id: number) {
  if (id === 1) {
    return "hanoi";
  }
  return "hcmc";
}
