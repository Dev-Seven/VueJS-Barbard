import {
  type EventType,
  type GiftCheque,
  type Order,
  type InternalOrder,
  type Ledger,
  type Staff,
  type Service,
  type Upgrade,
  type Agreement,
  type Lockerbox,
  type Location,
  type Event,
  type LocationId,
  type AgreementType,
} from "@barbaard/types";

import * as firestore from "firebase-admin/firestore";

export class UserStoreService {
  constructor(private store: firestore.Firestore) {}

  async updateEvent(
    locationId: LocationId,
    eventId: string,
    event: Partial<Event>,
  ) {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("events")
      .doc(eventId)
      .set(event, { merge: true });
  }

  async updateOrder(
    locationId: LocationId,
    orderId: string,
    order: Partial<Order>,
  ) {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("orders")
      .doc(orderId)
      .set(order, { merge: true });
  }

  async updateInternalOrder(
    locationId: LocationId,
    orderId: string,
    order: Partial<InternalOrder>,
  ) {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("orders")
      .doc(orderId)
      .set(order, { merge: true });
  }

  async addOrder(locationId: LocationId, order: Order | InternalOrder) {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("orders")
      .add(order);
  }

  async getOrder(locationId: LocationId, orderId: string) {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("orders")
      .doc(orderId)
      .get()
      .then((doc) => {
        return {
          id: doc.id,
          doc: doc.data() as Order | InternalOrder,
        };
      });
  }

  async getOrdersByLimit(
    locationId: LocationId,
    limit: number,
    lastDocumentId?: string,
  ) {
    let query = this.store
      .collection("locations")
      .doc(locationId)
      .collection("orders")
      .orderBy(firestore.FieldPath.documentId(), "asc")
      .limit(limit);
    if (lastDocumentId) {
      query = query.startAfter(lastDocumentId);
    }
    const docs = await query.get();
    return docs.docs.map((doc) => ({
      id: doc.id,
      doc: doc.data() as Order | InternalOrder,
    }));
  }

  async getLastOrderById(locationId: LocationId) {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("orders")
      .orderBy("id", "desc")
      .limit(1)
      .get()
      .then((d) => {
        if (d.docs.length === 0) throw new Error("last order not found");
        const doc = d.docs[0];
        return {
          id: doc?.id,
          doc: doc?.data() as Order | InternalOrder,
        };
      });
  }

  async getOrdersByRegisterId(locationId: LocationId, registerId: string) {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("orders")
      .where("registerId", "==", registerId)
      .get()
      .then((d) => {
        return d.docs.map((d) => ({
          id: d.id,
          doc: d.data() as Order,
        }));
      });
  }

  async getLocation(id: string): Promise<Location> {
    return this.store
      .collection("locations")
      .doc(id)
      .get()
      .then((doc) => {
        return doc.data() as Location;
      });
  }

  async getLedger(
    locationId: LocationId,
    orderId: string,
  ): Promise<{ id: string; doc: Ledger }[]> {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("ledger")
      .where("orderId", "==", orderId)
      .get()
      .then((docs) => {
        return docs.docs.map((d) => ({
          id: d.id,
          doc: d.data() as Ledger,
        }));
      });
  }

  async addLedger(locationId: LocationId, ledger: Ledger) {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("ledger")
      .add(ledger);
  }

  async getStaffByWpId(wpId: number): Promise<{ id: string; doc: Staff }> {
    return this.store
      .collection("staff")
      .where("wpId", "==", wpId)
      .get()
      .then((d) => {
        if (d.docs.length === 0)
          throw new Error("staff not found for wpid:" + wpId);
        const doc = d.docs[0];
        const id = doc?.id || "";
        return { id, doc: doc?.data() as Staff };
      });
  }

  async getService(id: string): Promise<Service> {
    return this.store
      .collection("services")
      .doc(id)
      .get()
      .then((d) => d.data() as Service);
  }

  async getServiceByWpId(wpId: number): Promise<{ id: string; doc: Service }> {
    return this.store
      .collection("services")
      .where("wpId", "==", wpId)
      .get()
      .then((d) => {
        if (d.docs.length === 0)
          throw new Error("service not found for wpid:" + wpId);
        const doc = d.docs[0];
        const id = doc?.id || "";
        return { id, doc: doc?.data() as Service };
      });
  }

  async getUpgradeByName(name: string): Promise<{ id: string; doc: Upgrade }> {
    console.log({ name: name });
    return this.store
      .collection("upgrades")
      .where("name", "==", name)
      .get()
      .then((d) => {
        if (d.docs.length === 0)
          throw new Error("upgrade not found for name:" + name);
        const doc = d.docs[0];
        const id = doc?.id || "";
        return { id, doc: doc?.data() as Upgrade };
      });
  }

  async addEvent(locationId: LocationId, e: Event) {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("events")
      .add(e);
  }

  getEventRef(locationId: LocationId, id: string) {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("events")
      .doc(id);
  }

  async getEvent(
    locationId: LocationId,
    id: string,
  ): Promise<{ id: string; doc: Event }> {
    const doc = await this.store
      .collection("locations")
      .doc(locationId)
      .collection("events")
      .doc(id)
      .get();
    return { id: doc.id, doc: doc.data() as Event };
  }

  async getEventByBooklyId(
    locationId: LocationId,
    booklyId: number,
  ): Promise<{ id: string; doc: Event }> {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("events")
      .where("booklyId", "==", booklyId)
      .get()
      .then((d) => {
        if (d.docs.length === 0)
          throw new Error("event not found for booklyId:" + booklyId);
        const doc = d.docs[0];
        const id = doc?.id || "";
        return { id, doc: doc?.data() as Event };
      });
  }

  async getEventByChainId(
    locationId: LocationId,
    chainId: number,
  ): Promise<{ id: string; doc: Event }> {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("events")
      .where("chainId", "==", chainId)
      .get()
      .then((d) => {
        if (d.docs.length === 0)
          throw new Error("event not found for chainId:" + chainId);
        const doc = d.docs[0];
        const id = doc?.id || "";
        return { id, doc: doc?.data() as Event };
      });
  }

  async getEventByUserId(
    locationId: LocationId,
    userId: string,
    limit: number,
  ): Promise<{ id: string; doc: Event }[]> {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("events")
      .where("userId", "==", userId)
      .limit(limit)
      .get()
      .then((d) => {
        return d.docs.map((doc) => ({
          id: doc.id,
          doc: doc.data() as Event,
        }));
      });
  }

  async getAllEventByUserId(
    locationId: LocationId,
    userId: string,
  ): Promise<{ id: string; doc: Event }[]> {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("events")
      .where("userId", "==", userId)
      .get()
      .then((d) => {
        return d.docs.map((doc) => ({
          id: doc.id,
          doc: doc.data() as Event,
        }));
      });
  }

  async getLastReservation(
    locationId: LocationId,
    userId: string,
    date: firestore.Timestamp,
  ): Promise<{ id: string; doc: Event }> {
    const type: EventType = "reservation";
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("events")
      .where("userId", "==", userId)
      .where("type", "==", type)
      .orderBy("startDate", "desc")
      .startAfter(date)
      .limit(1)
      .get()
      .then((d) => {
        if (d.docs.length === 0) throw new Error("last reservation not found");
        const doc = d.docs[0];
        const id = doc?.id || "";
        return { id, doc: doc?.data() as Event };
      });
  }

  async getLastAppointment(
    locationId: LocationId,
    userId: string,
    date: firestore.Timestamp,
  ): Promise<{ id: string; doc: Event }> {
    const type: EventType = "appointment";
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("events")
      .where("userId", "==", userId)
      .where("type", "==", type)
      .orderBy("startDate", "desc")
      .startAfter(date)
      .limit(1)
      .get()
      .then((d) => {
        if (d.docs.length === 0) throw new Error("last appointment not found");
        const doc = d.docs[0];
        const id = doc?.id || "";
        return { id, doc: doc?.data() as Event };
      });
  }

  async getCompletedEventByUserId(
    locationId: LocationId,
    userId: string,
    limit: number,
  ): Promise<{ id: string; doc: Event }[]> {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("events")
      .where("userId", "==", userId)
      .where("completed", "==", true)
      .limit(limit)
      .get()
      .then((d) => {
        return d.docs.map((doc) => ({
          id: doc.id,
          doc: doc.data() as Event,
        }));
      });
  }
  async getCompletedEventByUserIdAndType(
    locationId: LocationId,
    userId: string,
    eventType: EventType,
    limit: number,
  ): Promise<{ id: string; doc: Event }[]> {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("events")
      .where("userId", "==", userId)
      .where("completed", "==", true)
      .where("type", "==", eventType)
      .limit(limit)
      .get()
      .then((d) => {
        return d.docs.map((doc) => ({
          id: doc.id,
          doc: doc.data() as Event,
        }));
      });
  }

  async getAgreementsByActive(
    userId: string,
    active: boolean,
    limit: number,
  ): Promise<{ id: string; doc: Agreement }[]> {
    return this.store
      .collection("agreements")
      .where("userMap." + userId, "==", true)
      .where("active", "==", active)
      .limit(limit)
      .get()
      .then((d) => {
        return d.docs.map((doc) => ({
          id: doc.id,
          doc: doc.data() as Agreement,
        }));
      });
  }

  async getAgreementsByActiveAndType(
    userId: string,
    type: AgreementType,
    active: boolean,
    limit: number,
  ): Promise<{ id: string; doc: Agreement }[]> {
    return this.store
      .collection("agreements")
      .where("userMap." + userId, "==", true)
      .where("type", "==", type)
      .where("active", "==", active)
      .limit(limit)
      .get()
      .then((d) => {
        return d.docs.map((doc) => ({
          id: doc.id,
          doc: doc.data() as Agreement,
        }));
      });
  }

  async getActiveAgreements(): Promise<{ id: string; doc: Agreement }[]> {
    return this.store
      .collection("agreements")
      .where("active", "==", true)
      .get()
      .then((d) => {
        return d.docs.map((doc) => ({
          id: doc.id,
          doc: doc.data() as Agreement,
        }));
      });
  }

  async updateAgreement(id: string, event: Partial<Agreement>) {
    return this.store.collection("agreements").doc(id).update(event);
  }

  async getActiveLockerboxes(
    location: LocationId,
    active: boolean,
  ): Promise<{ id: string; doc: Lockerbox }[]> {
    return this.store
      .collection("locations")
      .doc(location)
      .collection("lockerboxes")
      .where("active", "==", active)
      .get()
      .then((d) => {
        return d.docs.map((doc) => ({
          id: doc.id,
          doc: doc.data() as Lockerbox,
        }));
      });
  }

  async getActiveLockerboxesByUser(
    location: LocationId,
    userId: string,
    active: boolean,
    limit: number,
  ): Promise<{ id: string; doc: Lockerbox }[]> {
    return this.store
      .collection("locations")
      .doc(location)
      .collection("lockerboxes")
      .where("active", "==", active)
      .where("userId", "==", userId)
      .limit(limit)
      .get()
      .then((d) => {
        return d.docs.map((doc) => ({
          id: doc.id,
          doc: doc.data() as Lockerbox,
        }));
      });
  }

  async getAllActiveLockerboxesByUser(
    location: LocationId,
    userId: string,
  ): Promise<{ id: string; doc: Lockerbox }[]> {
    return this.store
      .collection("locations")
      .doc(location)
      .collection("lockerboxes")
      .where("active", "==", true)
      .where("userId", "==", userId)
      .get()
      .then((d) => {
        return d.docs.map((doc) => ({
          id: doc.id,
          doc: doc.data() as Lockerbox,
        }));
      });
  }

  async updateLockerbox(
    location: LocationId,
    id: string,
    lockerbox: Partial<Lockerbox>,
  ) {
    return this.store
      .collection("locations")
      .doc(location)
      .collection("lockerboxes")
      .doc(id)
      .update(lockerbox);
  }

  async getActiveGiftCheques(): Promise<{ id: string; doc: GiftCheque }[]> {
    return this.store
      .collection("giftcheques")
      .where("active", "==", true)
      .get()
      .then((d) => {
        return d.docs.map((doc) => ({
          id: doc.id,
          doc: doc.data() as GiftCheque,
        }));
      });
  }

  async updateGiftCheque(id: string, update: Partial<GiftCheque>) {
    return this.store.collection("giftcheques").doc(id).update(update);
  }

  async getEventsByReminderDate(
    locationId: LocationId,
    start: firestore.Timestamp,
    end: firestore.Timestamp,
  ) {
    return this.store
      .collection("locations")
      .doc(locationId)
      .collection("events")
      .where("completed", "==", false)
      .where("reminderDate", ">", start)
      .where("reminderDate", "<=", end)
      .get()
      .then((d) => {
        return d.docs.map((doc) => ({
          id: doc.id,
          doc: doc.data() as Event,
        }));
      });
  }
}
