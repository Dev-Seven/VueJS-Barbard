import firebase, { firestore } from "firebase-admin";
import {
  User,
  Event,
  Agreement,
  Service,
  Location,
  Order,
  Upgrade,
  Staff,
} from "@barbaard/types";

class ErrorManyUsers extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "ErrorManyUsers";
  }
}

class ErrorManyEvents extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "ErrorManyEvents";
  }
}

export type ServiceNameMap = { [name: string]: { id: string; doc: Service } };

export class FirestoreRepository {
  constructor(private store: firebase.firestore.Firestore) {}

  async getUpgradeByTitle(
    title: string,
  ): Promise<{ id: string; doc: Upgrade }> {
    console.log({ title });
    if (title == "Signature Drink Upgrade") title = "Drink Upgrade";
    return this.store
      .collection("upgrades")
      .where("title", "==", title)
      .get()
      .then((d) => {
        if (d.docs.length === 0)
          throw new Error("upgrade not found for title:" + title);
        const doc = d.docs[0];
        return { id: doc.id, doc: doc.data() as Upgrade };
      });
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
        return { id: doc.id, doc: doc.data() as Staff };
      });
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
        return { id: doc.id, doc: doc.data() as Service };
      });
  }

  async getUserByWpId(id: number) {
    const existing = await this.store
      .collection("users")
      .where("wpId", "==", id)
      .get();
    if (existing.docs.length > 1) {
      console.log(`found ${existing.docs.length} users with wpId ${id}`);
      return { id: existing.docs[0].id, doc: existing.docs[0].data() as User };
    }
    if (existing.docs.length === 1) {
      return { id: existing.docs[0].id, doc: existing.docs[0].data() as User };
    }
    return null;
  }

  async getUsersByPhone(phone: string) {
    const users = await this.store
      .collection("users")
      .where("phone", "==", phone)
      .get();
    return users.docs.map((doc) => ({ id: doc.id, doc: doc.data() as User }));
  }

  async getUsersByWpId(id: number) {
    const users = await this.store
      .collection("users")
      .where("wpId", "==", id)
      .get();
    return users.docs.map((doc) => ({ id: doc.id, doc: doc.data() as User }));
  }

  async addUser(user: User) {
    return this.store.collection("users").add(user);
  }

  async setUser(id: string, user: Partial<User>) {
    return this.store.collection("users").doc(id).set(user, { merge: true });
  }

  async updateUser(id: string, user: Partial<User>) {
    return this.store.collection("users").doc(id).update(user);
  }

  async getUser(id: string) {
    const existing = await this.store.collection("users").doc(id).get();
    if (existing.exists) {
      return { id: existing.id, doc: existing.data() as User };
    }
    return null;
  }

  async getUserAnyType(id: string) {
    const existing = await this.store.collection("users").doc(id).get();
    if (existing.exists) {
      return existing;
    }
    return null;
  }

  async getUserByBooklyUserId(id: number) {
    const existing = await this.store
      .collection("users")
      .where("booklyUserId", "==", id)
      .get();
    if (existing.docs.length > 1) {
      throw new ErrorManyUsers(
        `found ${existing.docs.length} users with booklyUserId ${id}`,
      );
    }
    if (existing.docs.length === 1) {
      return { id: existing.docs[0].id, doc: existing.docs[0].data() as User };
    }
    return null;
  }

  async getEventByBooklyId(location: "hanoi" | "hcmc", booklyId: number) {
    const events = await this.store
      .collection("locations")
      .doc(location)
      .collection("events")
      .where("booklyId", "==", booklyId)
      .get();

    if (events.docs.length > 1) {
      throw new ErrorManyEvents(
        `found ${events.docs.length} events with booklyId ${booklyId}`,
      );
    }
    if (events.docs.length === 1) {
      return { id: events.docs[0].id, doc: events.docs[0].data() as Event };
    }
    return null;
  }

  async getEventsByBooklyId(location: "hanoi" | "hcmc", booklyId: number) {
    const events = await this.store
      .collection("locations")
      .doc(location)
      .collection("events")
      .where("booklyId", "==", booklyId)
      .get();

    return events.docs.map((doc) => ({ id: doc.id, doc: doc.data() as Event }));
  }

  async updateEvent(
    location: "hanoi" | "hcmc",
    id: string,
    update: Partial<Event>,
  ) {
    await this.store
      .collection("locations")
      .doc(location)
      .collection("events")
      .doc(id)
      .update(update);
  }

  async setEvent(
    location: "hanoi" | "hcmc",
    id: string,
    event: Partial<Event>,
  ) {
    await this.store
      .collection("locations")
      .doc(location)
      .collection("events")
      .doc(id)
      .set(event, { merge: true });
  }

  // createEvent
  async addEvent(location: "hanoi" | "hcmc", event: Event) {
    const created = await this.store
      .collection("locations")
      .doc(location)
      .collection("events")
      .add(event);
    return { id: created.id, doc: event };
  }

  async deleteEvent(ref: string) {
    await this.store.doc(ref).delete();
  }

  async addAgreement(agreement: Agreement) {
    const created = await this.store.collection("agreements").add(agreement);
    return { id: created.id, doc: agreement };
  }

  async getServiceMap() {
    const services = await this.store.collection("services").get();
    const serviceMap: ServiceNameMap = {};
    services.docs.forEach((doc) => {
      const service = doc.data() as Service;
      serviceMap[service.name] = { id: doc.id, doc: service };
    });
    return serviceMap;
  }

  async getTotalUsers() {
    const count = await this.store.collection("users").count().get();
    return count.data().count;
  }

  async getTotalUsersWithWpId() {
    const count = await this.store
      .collection("users")
      .where("wpId", ">", 0)
      .count()
      .get();
    return count.data().count;
  }

  async getAgreementsByUser(userId: string) {
    const docs = await this.store
      .collection("agreements")
      .where(`userMap.${userId}`, "==", true)
      .get();
    return docs.docs.map((doc) => ({
      id: doc.id,
      doc: doc.data() as Agreement,
    }));
  }

  async *fetchDocs<T>(collectionPath: string, batchSize: number) {
    const limit = batchSize;
    let lastDocumentId: string | undefined = undefined;
    let query = this.store
      .collection(collectionPath)
      .orderBy(firestore.FieldPath.documentId())
      .limit(limit);
    if (lastDocumentId) {
      query = query.startAfter(lastDocumentId);
    }

    async getUser(id: string) {
        const existing = await this.store.collection("users").doc(id).get();
        if (existing.exists) {
            return { id: existing.id, doc: existing.data() as User };
        }
        return null;
    }

    async getUserAnyType(id: string) {
        const existing = await this.store.collection("users").doc(id).get();
        if (existing.exists) {
            return existing;
        }
        return null;
    }

    async getUserByBooklyUserId(id: number) {
        const existing = await this.store.collection('users').where('booklyUserId', '==', id).get()
        if (existing.docs.length > 1) {
            throw new ErrorManyUsers(`found ${existing.docs.length} users with booklyUserId ${id}`);
        }
        if (existing.docs.length === 1) {
            return { id: existing.docs[0].id, doc: existing.docs[0].data() as User };
        }
        return null;
    }

    async getEventByBooklyId(location: 'hanoi' | 'hcmc', booklyId: number) {
        const events = await this.store
            .collection("locations")
            .doc(location)
            .collection("events")
            .where("booklyId", "==", booklyId)
            .get();

        if (events.docs.length > 1) {
            throw new ErrorManyEvents(`found ${events.docs.length} events with booklyId ${booklyId}`);
        }
        if (events.docs.length === 1) {
            return { id: events.docs[0].id, doc: events.docs[0].data() as Event };
        }
        return null;
    }

    async getEventsByBooklyId(location: 'hanoi' | 'hcmc', booklyId: number) {
        const events = await this.store
            .collection("locations")
            .doc(location)
            .collection("events")
            .where("booklyId", "==", booklyId)
            .get();

        return events.docs.map((doc) => ({ id: doc.id, doc: doc.data() as Event }));
    }

    async updateEvent(location: 'hanoi' | 'hcmc', id: string, update: Partial<Event>) {
        await this.store
            .collection("locations")
            .doc(location)
            .collection("events")
            .doc(id)
            .update(update);
    }

    async setEvent(location: 'hanoi' | 'hcmc', id: string, event: Partial<Event>) {
        await this.store
            .collection('locations')
            .doc(location)
            .collection('events')
            .doc(id)
            .set(event, { merge: true })
    }

    // createEvent
    async addEvent(location: 'hanoi' | 'hcmc', event: Event) {
        const created = await this.store
            .collection("locations")
            .doc(location)
            .collection("events")
            .add(event);
        return { id: created.id, doc: event };
    }

    async deleteEvent(ref: string) {
        await this.store.doc(ref).delete();
    }


    async addAgreement(agreement: Agreement) {
        const created = await this.store.collection("agreements").add(agreement);
        return { id: created.id, doc: agreement };
    }

    async getServiceMap() {
        const services = await this.store.collection("services").get();
        const serviceMap: ServiceNameMap = {};
        services.docs.forEach((doc) => {
            const service = doc.data() as Service;
            serviceMap[service.name] = { id: doc.id, doc: service };
        })
        return serviceMap;
    }

    async getTotalUsers() {
        const count = await this.store.collection("users").count().get()
        return count.data().count;
    }

    async getTotalUsersWithWpId() {
        const count = await this.store.collection("users").where("wpId", ">", 0).count().get()
        return count.data().count;
    }

    async getAgreementsByUser(userId: string) {
        const docs = await this.store.collection("agreements").where(`userMap.${userId}`, "==", true).get();
        return docs.docs.map((doc) => ({ id: doc.id, doc: doc.data() as Agreement }));
    }

    async * fetchDocs<T>(collectionPath: string, batchSize: number) {
        const limit = batchSize;
        let lastDocumentId: string | undefined = undefined;
        let query = this.store.collection(collectionPath).orderBy(firestore.FieldPath.documentId()).limit(limit)
        if (lastDocumentId) {
            query = query.startAfter(lastDocumentId);
        }
        let docs = await query.get()
        while (docs.docs.length > 0) {
            yield docs.docs.map((doc) => ({ id: doc.id, doc: doc.data() as T }));
            const nextLastDocument = (docs.docs[docs.docs.length - 1]).id;
            if (lastDocumentId === nextLastDocument) {
                throw new Error(`Last document id is the same as the next one. Last document id: ${lastDocumentId}`);
            }
            lastDocumentId = nextLastDocument;
            let query = this.store.collection(collectionPath).orderBy(firestore.FieldPath.documentId()).limit(limit)
            if (lastDocumentId) {
                query = query.startAfter(lastDocumentId);
            }
            docs = await query.get()
        }
    }

    fetchAllUsers(batchSize: number) {
        return this.fetchDocs<User>(`users`, batchSize);
    }

    fetchAllUsersNoType(batchSize: number) {
        return this.fetchDocs<any>(`users`, batchSize);
    }

    async * fetchDocsWithConditions<T>(collectionPath: string, batchSize: number, queryModifier: (query: firebase.firestore.Query) => firebase.firestore.Query, lastDocumentFn: (docs: firebase.firestore.QueryDocumentSnapshot[]) => string | number) {
        let limit = batchSize;
        let lastDocumentId: string | number | undefined = undefined;
        let query = this.store.collection(collectionPath).limit(limit)
        query = queryModifier(query);
        if (lastDocumentId) {
            query = query.startAfter(lastDocumentId);
        }
        let docs = await query.get()
        while (docs.docs.length > 0) {
            yield docs.docs.map((doc) => ({ id: doc.id, doc: doc.data() as T }));
            const nextLastDocument = lastDocumentFn(docs.docs);
            if (lastDocumentId === nextLastDocument) {
                throw new Error(`Last document id is the same as the next one. Last document id: ${lastDocumentId}`);
            }
            lastDocumentId = nextLastDocument;
            let query = this.store.collection(collectionPath).limit(limit);
            query = queryModifier(query);
            if (lastDocumentId) {
                query = query.startAfter(lastDocumentId);
            }
            docs = await query.get()
        }
    }

    fetchAllLocations(batchSize: number) {
        return this.fetchDocs<Location>(`locations`, batchSize);
    }

    fetchAllRegisters(location: string, batchSize: number) {
        return this.fetchDocs<{}>(`locations/${location}/registers`, batchSize);
    }

    fetchAllOrders(location: string, batchSize: number) {
        return this.fetchDocs<Order>(`locations/${location}/orders`, batchSize);
    }

    fetchAllSessions(location: string, registerId: string, batchSize: number) {
        return this.fetchDocs<{ openedAt?: FirebaseFirestore.Timestamp | { seconds: number, nanoseconds: number } }>(`locations/${location}/registers/${registerId}/sessions`, batchSize);
    }

    updateSession(location: string, registerId: string, sessionId: string, update: Partial<{ openedAt?: FirebaseFirestore.Timestamp }>) {
        return this.store.doc(`locations/${location}/registers/${registerId}/sessions/${sessionId}`).update(update);
    }

    updateOrder(location: string, orderId: string, update: Partial<Order>) {
        return this.store.doc(`locations/${location}/orders/${orderId}`).update(update);
    }


    fetchAllEvents(location: 'hanoi' | 'hcmc', batchSize: number) {
        return this.fetchDocs<Event>(`locations/${location}/events`, batchSize);
    }

    fetchAllEventsWithBooklyId(location: 'hanoi' | 'hcmc', batchSize: number) {
        return this.fetchDocsWithConditions<Event>(`locations/${location}/events`,
            batchSize,
            (query) => query.where("booklyId", ">", 0).orderBy("booklyId"),
            (docs) => docs[docs.length - 1].data().booklyId,
        );
      }
      lastDocumentId = nextLastDocument;
      let query = this.store
        .collection(collectionPath)
        .orderBy(firestore.FieldPath.documentId())
        .limit(limit);
      if (lastDocumentId) {
        query = query.startAfter(lastDocumentId);
      }
      docs = await query.get();
    }
  }

    fetchAllEventsWithBetween(location: 'hanoi' | 'hcmc', startDate: Date, endDate: Date, batchSize: number) {
        return this.fetchDocsWithConditions<Event>(`locations/${location}/events`,
            batchSize,
            (query) => query.
                where("createdAt", ">=", FirebaseFirestore.Timestamp.fromDate(startDate)).
                where("createdAt", "<=", FirebaseFirestore.Timestamp.fromDate(endDate)).
                orderBy("createdAt"),
            (docs) => docs[docs.length - 1].data().createdAt,
        );
    }

  fetchAllUsersNoType(batchSize: number) {
    return this.fetchDocs<any>(`users`, batchSize);
  }

  async *fetchDocsWithConditions<T>(
    collectionPath: string,
    batchSize: number,
    queryModifier: (
      query: firebase.firestore.Query,
    ) => firebase.firestore.Query,
    lastDocumentFn: (
      docs: firebase.firestore.QueryDocumentSnapshot[],
    ) => string | number,
  ) {
    let limit = batchSize;
    let lastDocumentId: string | number | undefined = undefined;
    let query = this.store.collection(collectionPath).limit(limit);
    query = queryModifier(query);
    if (lastDocumentId) {
      query = query.startAfter(lastDocumentId);
    }
    let docs = await query.get();
    while (docs.docs.length > 0) {
      yield docs.docs.map((doc) => ({ id: doc.id, doc: doc.data() as T }));
      const nextLastDocument = lastDocumentFn(docs.docs);
      if (lastDocumentId === nextLastDocument) {
        throw new Error(
          `Last document id is the same as the next one. Last document id: ${lastDocumentId}`,
        );
      }
      lastDocumentId = nextLastDocument;
      let query = this.store.collection(collectionPath).limit(limit);
      query = queryModifier(query);
      if (lastDocumentId) {
        query = query.startAfter(lastDocumentId);
      }
      docs = await query.get();
    }
  }

  fetchAllLocations(batchSize: number) {
    return this.fetchDocs<Location>(`locations`, batchSize);
  }

  fetchAllRegisters(location: string, batchSize: number) {
    return this.fetchDocs<{}>(`locations/${location}/registers`, batchSize);
  }

  fetchAllOrders(location: string, batchSize: number) {
    return this.fetchDocs<Order>(`locations/${location}/orders`, batchSize);
  }

  fetchAllSessions(location: string, registerId: string, batchSize: number) {
    return this.fetchDocs<{
      openedAt?: firestore.Timestamp | { seconds: number; nanoseconds: number };
    }>(`locations/${location}/registers/${registerId}/sessions`, batchSize);
  }

  updateSession(
    location: string,
    registerId: string,
    sessionId: string,
    update: Partial<{ openedAt?: firestore.Timestamp }>,
  ) {
    return this.store
      .doc(
        `locations/${location}/registers/${registerId}/sessions/${sessionId}`,
      )
      .update(update);
  }

  updateOrder(location: string, orderId: string, update: Partial<Order>) {
    return this.store
      .doc(`locations/${location}/orders/${orderId}`)
      .update(update);
  }

  fetchAllEvents(location: "hanoi" | "hcmc", batchSize: number) {
    return this.fetchDocs<Event>(`locations/${location}/events`, batchSize);
  }

  fetchAllEventsWithBooklyId(location: "hanoi" | "hcmc", batchSize: number) {
    return this.fetchDocsWithConditions<Event>(
      `locations/${location}/events`,
      batchSize,
      (query) => query.where("booklyId", ">", 0).orderBy("booklyId"),
      (docs) => docs[docs.length - 1].data().booklyId,
    );
  }

  fetchAllEventsWithBetween(
    location: "hanoi" | "hcmc",
    startDate: Date,
    endDate: Date,
    batchSize: number,
  ) {
    return this.fetchDocsWithConditions<Event>(
      `locations/${location}/events`,
      batchSize,
      (query) =>
        query
          .where("createdAt", ">=", firestore.Timestamp.fromDate(startDate))
          .where("createdAt", "<=", firestore.Timestamp.fromDate(endDate))
          .orderBy("createdAt"),
      (docs) => docs[docs.length - 1].data().createdAt,
    );
  }

  fetchAllUsersWithWpId(batchSize: number) {
    return this.fetchDocsWithConditions<User>(
      `users`,
      batchSize,
      (query) => query.where("wpId", ">", 0).orderBy("wpId"),
      (docs) => docs[docs.length - 1].data().wpId,
    );
  }
}
