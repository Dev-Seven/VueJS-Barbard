import type { Event } from "@barbaard/types";
import * as firestore from "firebase-admin/firestore";

export class EventRepository {
  constructor(private store: firestore.Firestore) {}

  async getEventsByStartDate(locationId: string, start: Date, end: Date) {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("events")
      .where("startDate", ">=", firestore.Timestamp.fromDate(start))
      .where("startDate", "<=", firestore.Timestamp.fromDate(end))
      .get()
      .then((d) => {
        return d.docs.map((doc) => ({ id: doc.id, doc: doc.data() as Event }));
      });
  }
}
