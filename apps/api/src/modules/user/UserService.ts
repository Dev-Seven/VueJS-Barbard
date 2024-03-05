import type { User } from "@barbaard/types";
import { isEqual } from "date-fns";
import * as firestore from "firebase-admin/firestore";

export interface UserPayload {
  Phone: string;
  Email: string;
  Dob: string;
  ConnectaId: string;
  Gender: string;
  Name: string;
}

export class UserService {
  constructor() {}

  getUpdates(user: User, payload: UserPayload) {
    const updates: Partial<User> = {};
    if (payload.Email && payload.Email !== user.email) {
      updates.email = payload.Email;
    }
    if (payload.Phone && payload.Phone !== user.phone) {
      updates.phone = payload.Phone;
    }
    if (
      payload.Dob &&
      (!user.birthday ||
        !isEqual(new Date(payload.Dob), user.birthday?.toDate()))
    ) {
      updates.birthday = firestore.Timestamp.fromDate(new Date(payload.Dob));
    }
    return updates;
  }
}
