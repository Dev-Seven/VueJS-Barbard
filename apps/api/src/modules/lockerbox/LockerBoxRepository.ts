import type { Lockerbox, LocationId } from "@barbaard/types";
import * as firebase from "firebase-admin";

export class LockerBoxRepository {
  constructor(private store: firebase.firestore.Firestore) {}

  async getActiveLockerBoxByUserId(locationId: LocationId, userId: string) {
    const docs = await this.store
      .collection("locations")
      .doc(locationId)
      .collection("lockerbox")
      .where("userId", "==", userId)
      .where("active", "==", true)
      .get();
    return docs.docs.map((doc) => ({
      id: doc.id,
      doc: doc.data() as Lockerbox,
    }));
  }
}
