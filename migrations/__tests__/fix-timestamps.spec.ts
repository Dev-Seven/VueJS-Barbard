import firebase from "firebase-admin";
import {
  updateOrderDates,
  updateOpenedAtOfSessions,
} from "../20230524230129-fix-timestamps";
import { FirestoreRepository } from "../helpers/firestore.repository";

describe("timestamps fix", () => {
  const firebaseApp = firebase.initializeApp({ projectId: "test" });
  const store = firebaseApp.firestore();
  const repository = new FirestoreRepository(store);

  const testLocation = "test-location";
  const testRegister = "test-register";
  const testSession = "test-session";
  const testOrder = "test-order";

  beforeEach(async () => {
    // clean database
    await store.doc(`locations/${testLocation}`).delete();
    await store
      .doc(`locations/${testLocation}/registers/${testRegister}`)
      .delete();
    await store.doc(`locations/${testLocation}/orders/${testOrder}`).delete();
    await store
      .collection(
        `locations/${testLocation}/registers/${testRegister}/sessions`,
      )
      .get()
      .then(async (docs) => {
        const promises = docs.docs.map((d) =>
          store
            .doc(
              `locations/${testLocation}/registers/${testRegister}/sessions/${d.id}`,
            )
            .delete(),
        );
        await Promise.all(promises);
      });
  });

  it("updateOpenedAtOfSessions() should update date", async () => {
    // create mock location
    await store.doc(`locations/${testLocation}`).set({});
    await store
      .doc(`locations/${testLocation}/registers/${testRegister}`)
      .set({});
    await store
      .doc(
        `locations/${testLocation}/registers/${testRegister}/sessions/${testSession}`,
      )
      .set({
        openedAt: {
          nanoseconds: 109000000,
          seconds: 1675912623,
        },
      });
    await updateOpenedAtOfSessions(repository, 1, false);
    const updated = await store
      .doc(
        `locations/${testLocation}/registers/${testRegister}/sessions/${testSession}`,
      )
      .get();
    expect(
      updated.data().openedAt instanceof firebase.firestore.Timestamp,
    ).toEqual(true);
    expect(updated.data().openedAt.toDate().getTime()).toEqual(
      new firebase.firestore.Timestamp(1675912623, 109000000)
        .toDate()
        .getTime(),
    );
  });

  it("updateOpenedAtOfSessions() should ignore update if already Timestamp", async () => {
    // create mock location
    await store.doc(`locations/${testLocation}`).set({});
    await store
      .doc(`locations/${testLocation}/registers/${testRegister}`)
      .set({});
    await store
      .doc(
        `locations/${testLocation}/registers/${testRegister}/sessions/${testSession}`,
      )
      .set({
        openedAt: new firebase.firestore.Timestamp(1675912623, 109000000),
      });
    const repository = new FirestoreRepository(store);
    repository.updateSession = jest.fn();
    await updateOpenedAtOfSessions(repository, 1, false);
    const updated = await store
      .doc(
        `locations/${testLocation}/registers/${testRegister}/sessions/${testSession}`,
      )
      .get();
    expect(
      updated.data().openedAt instanceof firebase.firestore.Timestamp,
    ).toEqual(true);
    expect(updated.data().openedAt.toDate().getTime()).toEqual(
      new firebase.firestore.Timestamp(1675912623, 109000000)
        .toDate()
        .getTime(),
    );
    expect(repository.updateSession).toHaveBeenCalledTimes(0);
  });

  it("updateCreatedAtOfOrders() should update date", async () => {
    // create mock location
    await store.doc(`locations/${testLocation}`).set({});
    await store.doc(`locations/${testLocation}/orders/${testOrder}`).set({
      createdAt: {
        nanoseconds: 109000000,
        seconds: 1675912623,
      },
      updatedAt: {
        nanoseconds: 109000000,
        seconds: 1675912624,
      },
      eventItem: {
        createdAt: {
          nanoseconds: 109000000,
          seconds: 1675912623,
        },
        updatedAt: {
          nanoseconds: 109000000,
          seconds: 1675912624,
        },
        reminderDate: {
          nanoseconds: 109000000,
          seconds: 1675912623,
        },
        startDate: {
          nanoseconds: 109000000,
          seconds: 1675912624,
        },
        endDate: {
          nanoseconds: 109000000,
          seconds: 1675912624,
        },
      },
    });
    await updateOrderDates(repository, 1, false);
    const updated = await store
      .doc(`locations/${testLocation}/orders/${testOrder}`)
      .get();
    expect(
      updated.data().createdAt instanceof firebase.firestore.Timestamp,
    ).toEqual(true);
    expect(updated.data().createdAt.toDate().getTime()).toEqual(
      new firebase.firestore.Timestamp(1675912623, 109000000)
        .toDate()
        .getTime(),
    );
    expect(
      updated.data().updatedAt instanceof firebase.firestore.Timestamp,
    ).toEqual(true);
    expect(
      updated.data().eventItem.createdAt instanceof
        firebase.firestore.Timestamp,
    ).toEqual(true);
    expect(
      updated.data().eventItem.updatedAt instanceof
        firebase.firestore.Timestamp,
    ).toEqual(true);
    expect(
      updated.data().eventItem.reminderDate instanceof
        firebase.firestore.Timestamp,
    ).toEqual(true);
    expect(
      updated.data().eventItem.startDate instanceof
        firebase.firestore.Timestamp,
    ).toEqual(true);
    expect(
      updated.data().eventItem.endDate instanceof firebase.firestore.Timestamp,
    ).toEqual(true);
  });

  it("updateCreatedAtOfOrders() should ignore if already Timestamp", async () => {
    // create mock location
    await store.doc(`locations/${testLocation}`).set({});
    await store.doc(`locations/${testLocation}/orders/${testOrder}`).set({
      createdAt: new firebase.firestore.Timestamp(1675912623, 109000000),
    });
    const repository = new FirestoreRepository(store);
    repository.updateOrder = jest.fn();
    await updateOrderDates(repository, 1, false);
    const updated = await store
      .doc(`locations/${testLocation}/orders/${testOrder}`)
      .get();
    expect(
      updated.data().createdAt instanceof firebase.firestore.Timestamp,
    ).toEqual(true);
    expect(updated.data().createdAt.toDate().getTime()).toEqual(
      new firebase.firestore.Timestamp(1675912623, 109000000)
        .toDate()
        .getTime(),
    );
    expect(repository.updateOrder).toHaveBeenCalledTimes(0);
  });
});
